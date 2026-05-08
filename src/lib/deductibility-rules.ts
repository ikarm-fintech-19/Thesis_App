/**
 * Deductibility Rules — Article 33 of the Algerian CID
 * (Code des Impôts Directs et Indirects)
 *
 * Defines the maximum deductible percentage for each purchase category.
 * Used when calculating TVA déductible in the Déclaration workflow.
 */

import { Decimal } from './decimal-utils'

export type DeductibilityCategory = 'standard' | 'goods' | 'materials' | 'equipment' | 'vehicle' | 'vehicle_large' | 'hospitality' | 'real_estate' | 'export' | 'services'

export const DEDUCTIBILITY_CAPS: Record<DeductibilityCategory, number> = {
  standard: 1.0,       // 100% — General purchases
  goods: 1.0,          // 100% — Marchandises
  materials: 1.0,      // 100% — Matières premières
  equipment: 1.0,       // 100% — Équipements
  services: 1.0,       // 100% — Services
  vehicle: 0.0,         // 0%   — Véhicules de tourisme < 7 places (Art. 30 LF 2026)
  vehicle_large: 0.5,    // 50%  — Véhicules ≥ 7 places assises (Art. 30 LF 2026)
  hospitality: 0.0,    // 0%   — Hébergement & restauration (Art. 30 LF 2026) — non-deductible
  real_estate: 1.0,    // 100% — Construction & acquisition de locaux professionnels
  export: 0.0          // 0%   — TVA on exports is not applicable (Art. 30-4° CID)
}

export interface DeductibilityInfo {
  category: DeductibilityCategory
  cap: number
  capPercent: string
  labelFr: string
  labelEn: string
  labelAr: string
  articleRef: string
  notes: string
}

export const DEDUCTIBILITY_INFO: DeductibilityInfo[] = [
  {
    category: 'standard',
    cap: 1.0,
    capPercent: '100%',
    labelFr: 'Standard (biens, services, matières premières)',
    labelEn: 'Standard (goods, services, raw materials)',
    labelAr: 'قياسي (بضائع، خدمات، مواد أولية)',
    articleRef: 'Art. 28 - Code TVA',
    notes: 'Déductible intégralement dans les conditions normales'
  },
  {
    category: 'goods',
    cap: 1.0,
    capPercent: '100%',
    labelFr: 'Marchandises',
    labelEn: 'Goods / Merchandise',
    labelAr: 'بضائع',
    articleRef: 'Art. 28 CID',
    notes: 'Déductible intégralement'
  },
  {
    category: 'materials',
    cap: 1.0,
    capPercent: '100%',
    labelFr: 'Matières premières',
    labelEn: 'Raw materials',
    labelAr: 'مواد أولية',
    articleRef: 'Art. 28 CID',
    notes: 'Déductible intégralement'
  },
  {
    category: 'equipment',
    cap: 1.0,
    capPercent: '100%',
    labelFr: 'Équipements',
    labelEn: 'Equipment',
    labelAr: 'تجهيزات',
    articleRef: 'Art. 28 CID',
    notes: 'Déductible intégralement'
  },
  {
    category: 'services',
    cap: 1.0,
    capPercent: '100%',
    labelFr: 'Services',
    labelEn: 'Services',
    labelAr: 'خدمات',
    articleRef: 'Art. 28 CID',
    notes: 'Déductible intégralement'
  },
  {
    category: 'vehicle',
    cap: 0.0,
    capPercent: '0%',
    labelFr: 'Véhicules de tourisme (< 7 places)',
    labelEn: 'Passenger vehicles (< 7 seats)',
    labelAr: 'سيارات الركاب (< 7 مقاعد)',
    articleRef: 'Art. 30 LF 2026',
    notes: 'Non déductible — véhicules de tourisme et de transport de personnes (≤ 6 places assises)'
  },
  {
    category: 'vehicle_large',
    cap: 0.5,
    capPercent: '50%',
    labelFr: 'Véhicules ≥ 7 places assises',
    labelEn: 'Vehicles with ≥ 7 seats',
    labelAr: 'مركبات ≥ 7 مقاعد',
    articleRef: 'Art. 30 LF 2026',
    notes: 'Déductible à 50% — véhicules à 7 places assises et plus'
  },
  {
    category: 'hospitality',
    cap: 0.0,
    capPercent: '0%',
    labelFr: 'Hébergement & restauration',
    labelEn: 'Hospitality & catering',
    labelAr: 'إقامة ومطاعم',
    articleRef: 'Art. 30 - Code TVA',
    notes: 'Non déductible — les frais d\'hébergement et de restauration sont exclus du droit à déduction'
  },
  {
    category: 'real_estate',
    cap: 1.0,
    capPercent: '100%',
    labelFr: 'Immobilier professionnel (construction, acquisition)',
    labelEn: 'Professional real estate (construction, acquisition)',
    labelAr: 'عقارات مهنية (بناء، شراء)',
    articleRef: 'Art. 33-1° du CID',
    notes: 'Déductible intégralement pour les locaux à usage professionnel'
  },
  {
    category: 'export',
    cap: 0.0,
    capPercent: '0%',
    labelFr: 'Exportations',
    labelEn: 'Exports',
    labelAr: 'عمليات التصدير',
    articleRef: 'Art. 30-4° du CID',
    notes: 'La TVA sur les exports n\'est pas applicable (taux 0%)'
  }
]

/**
 * Get the deductibility cap for a given category
 * Returns 0 for unknown categories (safest default)
 */
export function getDeductibilityCap(category: string): number {
  return DEDUCTIBILITY_CAPS[category as DeductibilityCategory] ?? 0.0
}

/**
 * Get detailed info for a category
 */
export function getDeductibilityInfo(category: string): DeductibilityInfo | undefined {
  return DEDUCTIBILITY_INFO.find(d => d.category === category)
}

/**
 * Calculate the deductible TVA amount for a purchase
 * deductibleAmount = ht_amount × tva_rate × cap
 */
export function calculateDeductibleTVA(
  htAmount: number | string,
  tvaRate: number | string,
  category: string
): { grossTVA: number; deductibleTVA: number; cap: number; category: string } {
  const ht = new Decimal(String(htAmount))
  const rate = new Decimal(String(tvaRate))
  const cap = new Decimal(String(getDeductibilityCap(category)))

  const grossTVA = ht.mul(rate).toDecimalPlaces(2)
  const deductibleTVA = grossTVA.mul(cap).toDecimalPlaces(2)

  return {
    grossTVA: grossTVA.toNumber(),
    deductibleTVA: deductibleTVA.toNumber(),
    cap: cap.toNumber(),
    category
  }
}
