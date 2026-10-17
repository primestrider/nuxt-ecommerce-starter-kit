/** The order just placed, shown on the confirmation page for this visit only. */
export function useLastOrder() {
  return useState<Order | null>('last-order', () => null)
}
