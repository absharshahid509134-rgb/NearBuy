import 'reflect-metadata'
import { Module, type Type } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler'
import { JwtModule } from '@nestjs/jwt'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import { CoreModule } from './common/core.module'
import { ConfigService } from './common/config.service'
import { AllExceptionsFilter, ZodValidationPipe } from './common/errors'
import { EnvelopeInterceptor, LoggingInterceptor, requestIdMiddleware } from './common/http'
import { AuthGuard, RolesGuard } from './common/guards'
import { HealthModule } from './modules/health/health.module'

/**
 * Base kernel every deployable service composes: config, prisma (WASM+adapter),
 * JWT, throttling, health/ready, authn/authz guards. Feature modules are the
 * only difference between services — no business logic is duplicated.
 */
export function createServiceModule(name: string, featureModules: Array<Type<unknown>>): Type<unknown> {
  @Module({
    imports: [
      CoreModule.forRoot(),
      JwtModule.registerAsync({
        global: true,
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          secret: config.env.AUTH_SECRET,
          signOptions: { expiresIn: config.env.JWT_ACCESS_TTL },
        }),
      }),
      ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),
      HealthModule,
      ...featureModules,
    ],
    providers: [
      { provide: APP_GUARD, useClass: ThrottlerGuard },
      { provide: APP_GUARD, useClass: AuthGuard },
      { provide: APP_GUARD, useClass: RolesGuard },
    ],
  })
  class ServiceModule {}
  Object.defineProperty(ServiceModule, 'name', { value: name.replace(/[^a-zA-Z0-9]/g, '') + 'ServiceModule' })
  return ServiceModule
}

/** Shared HTTP pipeline: envelope, request IDs, logging, validation, swagger. */
export async function bootstrapHttp(serviceName: string, root: Type<unknown>): Promise<void> {
  const app = await NestFactory.create(root, { bufferLogs: true })
  const config = app.get(ConfigService).env

  app.setGlobalPrefix('api/v1', { exclude: ['health', 'ready', 'live'] })
  app.use(helmet({ contentSecurityPolicy: false }))
  app.use(cookieParser())
  app.use(requestIdMiddleware())
  app.enableCors({
    origin: config.CORS_ORIGINS.split(',').map((o) => o.trim()),
    credentials: true,
  })
  app.useGlobalPipes(new ZodValidationPipe())
  app.useGlobalInterceptors(new LoggingInterceptor(), new EnvelopeInterceptor())
  app.useGlobalFilters(new AllExceptionsFilter())

  const swagger = new DocumentBuilder()
    .setTitle(`NearBuy API — ${serviceName}`)
    .setDescription('NearBuy Storefront-scale commerce API (versioned REST, envelope responses, request IDs).')
    .setVersion('1.0')
    .addCookieAuth('nb_at')
    .addBearerAuth()
    .build()
  SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, swagger))

  const port = Number(process.env.SERVICE_PORT ?? config.PORT)
  await app.listen(port, '0.0.0.0')
  console.log(`[nearbuy:${serviceName}] listening on :${port} — docs at /api/docs`)
}
