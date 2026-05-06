export const SUBSCRIPTION_PLANS = {
  FREE: {
    name: 'Free',
    monthlyPrice: 0,
    yearlyPrice: 0,
    calculationLimit: 10,
    declarationLimit: 0,
    features: ['Calculateur basique', 'Export PDF limité', '1 utilisateur'],
  },
  PRO: {
    name: 'Business', // UI Name changed, DB ID stays PRO
    monthlyPrice: 8000,
    yearlyPrice: 80000, // 2 months free
    calculationLimit: 1000000,
    declarationLimit: 100,
    features: ['Déclarations G50', 'Export CSV/Excel', 'أتمتة الرواتب (IRG)', 'سجل التدقيق (Audit trail)'],
  },
  ENTERPRISE: {
    name: 'Professional', // UI Name changed, DB ID stays ENTERPRISE
    monthlyPrice: 25000,
    yearlyPrice: 250000, // 2 months free
    calculationLimit: 1000000,
    declarationLimit: 1000,
    features: ['إدارة عدة ملفات (Multi-dossiers)', 'إدارة فريق العمل', 'API Access', 'Support prioritaire 24/7'],
  },
};

export type PlanType = keyof typeof SUBSCRIPTION_PLANS;
