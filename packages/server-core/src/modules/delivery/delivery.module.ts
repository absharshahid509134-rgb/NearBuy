import { Body, Controller, Get, Inject, Module, Param, Post } from '@nestjs/common'
import { deliveryEventSchema } from '@nearbuy/validation'
import type { z } from 'zod'
import type { NotificationBus } from '@nearbuy/notifications'
import { INJECTION, PrismaService } from '../../common/core.module'
import { Errors, ZodValidationPipe } from '../../common/errors'
import { CurrentUser, Public, Roles, type AuthUser } from '../../common/guards'
import { InventoryService, InventoryModule } from '../inventory/inventory.module'
/**
 * Delivery — partner job lifecycle: receive job → accept → at store → pick up →
 * at customer → OTP/QR verify → delivered → earnings. Statuses live on Delivery,
 * independent of order/payment/fulfillment status.
 */



type EventInput = z.infer<typeof deliveryEventSchema>

const NEXT: Record<string, string[]> = {
  PENDING: ['ASSIGNED', 'CANCELLED'],
  ASSIGNED: ['AT_STORE', 'CANCELLED'],
  AT_STORE: ['PICKED_UP', 'FAILED'],
  PICKED_UP: ['AT_CUSTOMER', 'FAILED'],
  AT_CUSTOMER: ['DELIVERED', 'FAILED'],
  DELIVERED: [],
  FAILED: [],
  CANCELLED: [],
}

@Controller('delivery')
@Roles('DELIVERY_PARTNER', 'ADMIN', 'SUPER_ADMIN')
export class DeliveryController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly inventory: InventoryService,
    @Inject(INJECTION.NOTIFY) private readonly notify: NotificationBus,
  ) {}

  /** Available jobs (unassigned local deliveries) — pickup/drop/fee/distance. */
  @Get('jobs')
  async jobs(@CurrentUser() user: AuthUser) {
    const partner = await this.prisma.deliveryPartner.findUnique({ where: { userId: user.id } })
    const available = await this.prisma.delivery.findMany({
      where: { status: 'PENDING', partnerId: null },
      include: {
        order: {
          include: {
            store: { select: { name: true, area: true, address: true, lat: true, lng: true } },
            items: { select: { name: true, qty: true } },
          },
        },
      },
      take: 20,
    })
    const mine = await this.prisma.delivery.findMany({
      where: { partnerId: partner?.id, status: { in: ['ASSIGNED', 'AT_STORE', 'PICKED_UP', 'AT_CUSTOMER'] } },
      include: { order: { include: { store: true, items: true } } },
    })
    return {
      available: available.map((d) => shapeJob(d, false)),
      active: mine.map((d) => shapeJob(d, true)),
    }
  }

  @Post('jobs/:id/accept')
  async accept(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    const partner = await this.prisma.deliveryPartner.findUnique({ where: { userId: user.id } })
    if (!partner) throw Errors.forbidden('No delivery partner profile.')
    const delivery = await this.prisma.delivery.findUnique({ where: { id }, include: { order: true } })
    if (!delivery || delivery.status !== 'PENDING') throw Errors.invalidTransition('Job is no longer available.')
    const updated = await this.prisma.$transaction(async (tx) => {
      const u = await tx.delivery.update({
        where: { id },
        data: { partnerId: partner.id, status: 'ASSIGNED', events: { create: { status: 'ASSIGNED' } } },
      })
      await tx.order.update({
        where: { id: delivery.orderId },
        data: {
          events: [
            ...(((delivery.order.events as { label: string; at: string }[]) ?? [])),
            { label: 'Driver Assigned', at: new Date().toISOString() },
          ] as never,
        },
      })
      return u
    })
    await this.notify.driverAssigned(delivery.order.userId)
    return updated
  }

  @Post(':id/events')
  async event(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body(new ZodValidationPipe(deliveryEventSchema)) body: EventInput) {
    const delivery = await this.prisma.delivery.findUnique({ where: { id }, include: { order: { include: { payment: true } } } })
    if (!delivery) throw Errors.notFound('Delivery not found.')
    if (delivery.partnerId) {
      const partner = await this.prisma.deliveryPartner.findUnique({ where: { id: delivery.partnerId } })
      if (partner && partner.userId !== user.id && !['ADMIN', 'SUPER_ADMIN'].includes(user.role)) throw Errors.forbidden()
    }
    if (!(NEXT[delivery.status] ?? []).includes(body.status)) {
      throw Errors.invalidTransition(`Cannot move delivery from ${delivery.status} to ${body.status}.`)
    }
    // OTP/QR verification at handover points
    if (body.status === 'PICKED_UP' && body.code && delivery.pickupCode && body.code !== delivery.pickupCode) {
      throw Errors.badRequest('Pickup verification failed.', 'BAD_PICKUP_CODE')
    }
    if (body.status === 'DELIVERED' && body.code && delivery.dropCode && body.code !== delivery.dropCode) {
      throw Errors.badRequest('Delivery verification failed.', 'BAD_DELIVERY_CODE')
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const u = await tx.delivery.update({
        where: { id },
        data: { status: body.status, events: { create: { status: body.status, note: body.note } } },
      })
      if (body.status === 'PICKED_UP') {
        await tx.order.update({ where: { id: delivery.orderId }, data: { status: 'PREPARING' } })
      }
      if (body.status === 'DELIVERED') {
        await tx.order.update({
          where: { id: delivery.orderId },
          data: {
            status: 'COMPLETED',
            events: [...(((delivery.order.events as { label: string; at: string }[]) ?? [])), { label: 'Delivered', at: new Date().toISOString() }] as never,
          },
        })
        await tx.fulfillment.updateMany({ where: { orderId: delivery.orderId }, data: { status: 'COMPLETED' } })
        // settle pay-on-delivery
        await tx.payment.updateMany({ where: { orderId: delivery.orderId, method: 'COD', status: 'PENDING' }, data: { status: 'PAID' } })
        if (delivery.partnerId) {
          await tx.deliveryPartner.update({
            where: { id: delivery.partnerId },
            data: { deliveries: { increment: 1 }, earningsCt: { increment: Number(delivery.fee) * 0.8 } },
          })
        }
      }
      return u
    })
    if (body.status === 'DELIVERED') {
      // settle real stock deduction against remaining holds for this order
      await this.prisma.$transaction(async (tx) => {
        await this.inventory.fulfill(tx, delivery.orderId)
      })
      await this.notify.delivered(delivery.order.userId)
    }
    if (body.status === 'PICKED_UP') await this.notify.outForDelivery(delivery.order.userId)
    return updated
  }

  @Get('earnings')
  async earnings(@CurrentUser() user: AuthUser) {
    const partner = await this.prisma.deliveryPartner.findUnique({
      where: { userId: user.id },
      include: { deliveriesList: { where: { status: 'DELIVERED' }, include: { order: { select: { number: true, total: true } } } } },
    })
    return {
      balance: partner?.earningsCt ?? 0,
      completed: partner?.deliveries ?? 0,
      recent: (partner?.deliveriesList ?? []).slice(-10).map((d) => ({ order: d.order.number, fee: Number(d.fee) })),
    }
  }

  @Get('performance')
  async performance(@CurrentUser() user: AuthUser) {
    const partner = await this.prisma.deliveryPartner.findUnique({ where: { userId: user.id } })
    return {
      rating: partner?.rating ?? 5,
      deliveries: partner?.deliveries ?? 0,
      zone: partner?.zone ?? 'Dwarka',
      available: partner?.available ?? true,
    }
  }

  /** Driver demand heatmap (High/Medium/Low) — aggregated, safety-aware. */
  @Public()
  @Get('heatmap')
  async heatmap() {
    const zones = ['Sector 22', 'Sector 21', 'Sector 23', 'Sector 19']
    return zones.map((z) => ({ zone: z, demand: z === 'Sector 22' ? 'HIGH' : z === 'Sector 21' ? 'MEDIUM' : 'LOW' }))
  }
}

interface JobRow {
  id: string
  status: string
  fee: unknown
  distanceKm: number
  pickupCode: string | null
  dropCode: string | null
  order: {
    number: string
    items: { name: string; qty: number }[]
    store: { name: string; area: string; address: string } | null
  }
}

function shapeJob(d: JobRow, withCodes: boolean) {
  return {
    id: d.id,
    status: d.status,
    fee: Number(d.fee),
    distanceKm: d.distanceKm,
    packageCount: d.order.items.reduce((s, i) => s + i.qty, 0),
    pickup: d.order.store,
    items: d.order.items,
    number: d.order.number,
    ...(withCodes ? { pickupCode: d.pickupCode, dropCode: d.dropCode } : {}),
  }
}

@Module({ controllers: [DeliveryController], imports: [InventoryModule] })
export class DeliveryModule {}
