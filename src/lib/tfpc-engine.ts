import Decimal from 'decimal.js';

export interface TfpcParams {
  masseSalariale: number | Decimal;
  fraisFormation: number | Decimal;
  fraisApprentissage: number | Decimal;
}

export interface TfpcResult {
  tfpcBrut: Decimal;
  taBrut: Decimal;
  tfpcNet: Decimal;
  taNet: Decimal;
  totalAPayer: Decimal;
}

// Fixed rates for TFPC and TA (1%)
export const TFPC_RATE = new Decimal('0.01');
export const TA_RATE = new Decimal('0.01');

/**
 * Calcule la TFPC et la TA pour le semestre.
 * Conformément aux articles 18 à 21 de la Loi de Finances 2026, 
 * la déclaration et le paiement de ces taxes deviennent semestriels.
 */
export function calculateTfpc(params: TfpcParams): TfpcResult {
  const base = new Decimal(params.masseSalariale);
  const deductionsFormation = new Decimal(params.fraisFormation);
  const deductionsApprentissage = new Decimal(params.fraisApprentissage);

  const tfpcBrut = base.mul(TFPC_RATE);
  const taBrut = base.mul(TA_RATE);

  // The net tax cannot be negative. If expenses > tax, it zeroes out.
  const tfpcNet = Decimal.max(0, tfpcBrut.minus(deductionsFormation));
  const taNet = Decimal.max(0, taBrut.minus(deductionsApprentissage));

  return {
    tfpcBrut,
    taBrut,
    tfpcNet,
    taNet,
    totalAPayer: tfpcNet.plus(taNet)
  };
}
