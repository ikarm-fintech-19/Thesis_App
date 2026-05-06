import Decimal from 'decimal.js'

// Configure decimal.js for financial precision (20 decimal places)
Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP })

export { Decimal }

/**
 * Format a Decimal to a localized currency string with 2 decimal places
 * Handles the comma/dot separation based on locale
 */
export function formatCurrency(value: Decimal | string | number, locale: string = 'fr'): string {
  const d = value instanceof Decimal ? value : new Decimal(String(value))
  const num = d.toNumber()
  return new Intl.NumberFormat(locale === 'ar' ? 'ar-DZ' : locale === 'en' ? 'en-US' : 'fr-DZ', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num)
}

/**
 * Parse a user input string into a Decimal safely
 */
export function parseInput(value: string): Decimal | null {
  if (!value || value.trim() === '') return null
  try {
    // Remove spaces and common separators
    const cleaned = value.replace(/\s/g, '').replace(/,/g, '.')
    const d = new Decimal(cleaned)
    if (d.isNaN() || !d.isFinite()) return null
    return d.gte(0) ? d : null
  } catch {
    return null
  }
}

/**
 * Multiply base by rate and return result
 */
export function calculateTax(base: Decimal, rate: Decimal): Decimal {
  return base.mul(rate).toDecimalPlaces(2)
}

/**
 * Add tax to base to get TTC total
 */
export function calculateTTC(base: Decimal, tax: Decimal): Decimal {
  return base.plus(tax).toDecimalPlaces(2)
}

/**
 * Calculate variance between expected and actual
 */
export function calculateVariance(expected: Decimal, actual: Decimal): Decimal {
  return expected.minus(actual).abs().toDecimalPlaces(2)
}
