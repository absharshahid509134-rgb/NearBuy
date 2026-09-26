import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { SEED_ORDERS, SEED_RESERVATIONS, SEED_WISHLIST } from '../data/catalog'
import type { Order, Reservation } from '../data/types'

export interface CartLine {
  productId: string
  storeId: string
  qty: number
  price: number
}

export interface Toast {
  id: number
  title: string
  body?: string
  kind: 'success' | 'info' | 'warning' | 'error'
}

interface AppState {
  cart: CartLine[]
  addToCart: (line: CartLine) => void
  setQty: (productId: string, storeId: string, qty: number) => void
  removeFromCart: (productId: string, storeId: string) => void
  clearCart: () => void
  cartCount: number
  cartTotal: number

  wishlist: string[]
  toggleWishlist: (productId: string) => void

  orders: Order[]
  placeOrder: (o: Order) => void
  reservations: Reservation[]
  placeReservation: (r: Reservation) => void
  updateReservation: (id: string, patch: Partial<Reservation>) => void

  followed: string[]
  toggleFollow: (storeId: string) => void

  toasts: Toast[]
  toast: (t: Omit<Toast, 'id'>) => void
  dismissToast: (id: number) => void

  recentSearches: string[]
  pushSearch: (q: string) => void

  liveChecks: Record<string, boolean> // productId → store confirmed
  requestLiveCheck: (productId: string) => void
}

const Ctx = createContext<AppState | null>(null)

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem('nearbuy:' + key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function save(key: string, value: unknown) {
  try {
    localStorage.setItem('nearbuy:' + key, JSON.stringify(value))
  } catch {
    /* ignore quota */
  }
}

let toastId = 1

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartLine[]>(() => load('cart', [] as CartLine[]))
  const [wishlist, setWishlist] = useState<string[]>(() => load('wishlist', SEED_WISHLIST))
  const [orders, setOrders] = useState<Order[]>(() => load('orders', SEED_ORDERS))
  const [reservations, setReservations] = useState<Reservation[]>(() =>
    load('reservations', SEED_RESERVATIONS),
  )
  const [followed, setFollowed] = useState<string[]>(() => load('followed', ['s1', 's6']))
  const [recentSearches, setRecentSearches] = useState<string[]>(() =>
    load('searches', ['volleyball under ₹1500', 'printer ink nearby']),
  )
  const [liveChecks, setLiveChecks] = useState<Record<string, boolean>>(() => load('livechecks', {}))
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => save('cart', cart), [cart])
  useEffect(() => save('wishlist', wishlist), [wishlist])
  useEffect(() => save('orders', orders), [orders])
  useEffect(() => save('reservations', reservations), [reservations])
  useEffect(() => save('followed', followed), [followed])
  useEffect(() => save('searches', recentSearches), [recentSearches])
  useEffect(() => save('livechecks', liveChecks), [liveChecks])

  const toast = useCallback((t: Omit<Toast, 'id'>) => {
    const id = toastId++
    setToasts((prev) => [...prev, { ...t, id }])
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 4200)
  }, [])

  const addToCart = useCallback(
    (line: CartLine) => {
      setCart((prev) => {
        const i = prev.findIndex(
          (l) => l.productId === line.productId && l.storeId === line.storeId,
        )
        if (i >= 0) {
          const copy = [...prev]
          copy[i] = { ...copy[i], qty: copy[i].qty + line.qty }
          return copy
        }
        return [...prev, line]
      })
    },
    [],
  )

  const value = useMemo<AppState>(
    () => ({
      cart,
      addToCart,
      setQty: (productId, storeId, qty) =>
        setCart((prev) =>
          qty <= 0
            ? prev.filter((l) => !(l.productId === productId && l.storeId === storeId))
            : prev.map((l) =>
                l.productId === productId && l.storeId === storeId ? { ...l, qty } : l,
              ),
        ),
      removeFromCart: (productId, storeId) =>
        setCart((prev) =>
          prev.filter((l) => !(l.productId === productId && l.storeId === storeId)),
        ),
      clearCart: () => setCart([]),
      cartCount: cart.reduce((s, l) => s + l.qty, 0),
      cartTotal: cart.reduce((s, l) => s + l.qty * l.price, 0),

      wishlist,
      toggleWishlist: (productId) =>
        setWishlist((prev) =>
          prev.includes(productId) ? prev.filter((p) => p !== productId) : [...prev, productId],
        ),

      orders,
      placeOrder: (o) => setOrders((prev) => [o, ...prev]),
      reservations,
      placeReservation: (r) => setReservations((prev) => [r, ...prev]),
      updateReservation: (id, patch) =>
        setReservations((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r))),

      followed,
      toggleFollow: (storeId) =>
        setFollowed((prev) =>
          prev.includes(storeId) ? prev.filter((s) => s !== storeId) : [...prev, storeId],
        ),

      toasts,
      toast,
      dismissToast: (id) => setToasts((prev) => prev.filter((t) => t.id !== id)),

      recentSearches,
      pushSearch: (q) =>
        setRecentSearches((prev) => [q, ...prev.filter((s) => s !== q)].slice(0, 6)),

      liveChecks,
      requestLiveCheck: (productId) => {
        setLiveChecks((prev) => ({ ...prev, [productId]: true }))
        toast({
          kind: 'success',
          title: 'Store asked to confirm',
          body: 'ABC Sports will reply with live availability shortly.',
        })
      },
    }),
    [cart, wishlist, orders, reservations, followed, toasts, recentSearches, liveChecks, addToCart, toast],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useApp(): AppState {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useApp outside provider')
  return ctx
}
