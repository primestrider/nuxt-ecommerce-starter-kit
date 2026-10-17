/** Formats amounts in the store currency using the active locale. */
export function useMoney() {
  const { localeProperties } = useI18n()
  const currency = useRuntimeConfig().public.currency

  const formatter = computed(() => new Intl.NumberFormat(localeProperties.value.language, {
    style: 'currency',
    currency,
  }))

  return (amount: number) => formatter.value.format(amount)
}
