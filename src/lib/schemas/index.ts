import { z } from 'zod';

export const calculateTVASchema = z.object({
  base: z.union([z.number(), z.string()]).optional(),
  category: z.string().optional(),
  sector: z.enum(['production', 'services', 'commerce', 'export']).optional(),
  getRule: z.boolean().optional(),
  mode: z.enum(['SIMPLE', 'EXPERT', 'THESIS']).optional(),
});

export const declarationCalculateSchema = z.object({
  transactions: z.array(z.object({
    type: z.enum(['SALE', 'PURCHASE']),
    ht_amount: z.union([z.number(), z.string()]),
    tva_rate: z.union([z.number(), z.string()]),
    category: z.string().optional(),
    description: z.string().optional(),
    date: z.string().optional(),
  })).min(1),
  periodType: z.enum(['monthly', 'quarterly']),
  year: z.number().int().min(2020).max(2030),
  month: z.number().int().min(1).max(12),
  previousCredit: z.union([z.number(), z.string()]).optional().default('0'),
  tlsRate: z.union([z.number(), z.string()]).optional().default('0.015'),
});

export const authLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const authRegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
  company: z.string().optional(),
  nif: z.string().optional(),
});

export const salaryLineSchema = z.object({
  employeeName: z.string().min(1),
  grossSalary: z.union([z.number(), z.string()]),
  familyChildren: z.number().int().min(0).max(10).optional().default(0),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020).max(2030),
});

export const notificationSchema = z.object({
  type: z.enum(['DEADLINE_REMINDER', 'PENALTY_WARNING', 'DECLARATION_CONFIRMATION', 'SYSTEM_ALERT']),
  title: z.string().min(1),
  message: z.string().min(1),
  scheduledFor: z.string().datetime().optional(),
});

export const savedTemplateSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  templateType: z.enum(['SALE_RECURRING', 'PURCHASE_RECURRING', 'SALARY_TEMPLATE']),
  templateData: z.string(),
  isActive: z.boolean().optional().default(true),
});

export type CalculateTVAInput = z.infer<typeof calculateTVASchema>;
export type DeclarationCalculateInput = z.infer<typeof declarationCalculateSchema>;
export type AuthLoginInput = z.infer<typeof authLoginSchema>;
export type AuthRegisterInput = z.infer<typeof authRegisterSchema>;
export type SalaryLineInput = z.infer<typeof salaryLineSchema>;
export type NotificationInput = z.infer<typeof notificationSchema>;
export type SavedTemplateInput = z.infer<typeof savedTemplateSchema>;

export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);
  if (!result.success) {
    const issues = result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ');
    return { success: false, error: issues };
  }
  return { success: true, data: result.data };
}