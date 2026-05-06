import { db } from './db'
import { getSession } from './auth'
import { SUBSCRIPTION_PLANS, PlanType } from './subscription'

interface SubscriptionCheck {
  allowed: boolean
  reason?: string
  upgradeUrl?: string
  currentUsage: {
    calculations: number
    declarations: number
  }
  limits: {
    calculations: number
    declarations: number
  }
}

export async function checkSubscriptionLimit(
  userId: string,
  type: 'calculation' | 'declaration'
): Promise<SubscriptionCheck> {
  const subscription = await db.subscription.findUnique({
    where: { userId }
  })

  if (!subscription) {
    return {
      allowed: true,
      currentUsage: { calculations: 0, declarations: 0 },
      limits: { calculations: 10, declarations: 0 }
    }
  }

  const plan = SUBSCRIPTION_PLANS[subscription.plan as PlanType]
  const usage = {
    calculations: subscription.calculationsUsed,
    declarations: subscription.declarationsUsed
  }
  const limits = {
    calculations: plan.calculationLimit,
    declarations: plan.declarationLimit
  }

  if (type === 'calculation') {
    if (usage.calculations >= limits.calculations) {
      return {
        allowed: false,
        reason: 'Calculations limit reached',
        upgradeUrl: '/dashboard/settings',
        currentUsage: usage,
        limits
      }
    }
  }

  if (type === 'declaration') {
    if (usage.declarations >= limits.declarations) {
      return {
        allowed: false,
        reason: 'Declarations limit reached',
        upgradeUrl: '/dashboard/settings',
        currentUsage: usage,
        limits
      }
    }
  }

  return {
    allowed: true,
    currentUsage: usage,
    limits
  }
}

export async function incrementUsage(
  userId: string,
  type: 'calculation' | 'declaration'
): Promise<void> {
  const updateData = type === 'calculation'
    ? { calculationsUsed: { increment: 1 } }
    : { declarationsUsed: { increment: 1 } }

  await db.subscription.update({
    where: { userId },
    data: updateData
  })
}

export function canAccessFeature(
  plan: PlanType,
  feature: 'csv_export' | 'excel_export' | 'api_access' | 'team_management' | 'priority_support'
): boolean {
  const featureAccess: Record<PlanType, string[]> = {
    FREE: ['basic_calculator', 'pdf_export'],
    PRO: ['basic_calculator', 'pdf_export', 'csv_export', 'excel_export', 'declarations', 'audit_trail', 'irg_automation'],
    ENTERPRISE: ['basic_calculator', 'pdf_export', 'csv_export', 'excel_export', 'declarations', 'audit_trail', 'irg_automation', 'api_access', 'team_management', 'priority_support', 'multi_dossier']
  }

  const featureMapping: Record<string, string> = {
    csv_export: 'csv_export',
    excel_export: 'excel_export',
    api_access: 'api_access',
    team_management: 'team_management',
    priority_support: 'priority_support'
  }

  return featureAccess[plan]?.includes(featureMapping[feature]) ?? false
}