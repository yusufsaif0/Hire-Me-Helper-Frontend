import { z } from 'zod';
export const mobileRoleSchema = z.enum(['CUSTOMER', 'WORKER']);
export type MobileRole = z.infer<typeof mobileRoleSchema>;
export const userSchema = z
  .object({
    id: z.uuid(),
    role: z.enum(['CUSTOMER', 'WORKER', 'ADMIN', 'SUPER_ADMIN']),
    maskedPhone: z.string(),
    onboardingStatus: z.enum(['NOT_APPLICABLE', 'PENDING_ONBOARDING']),
  })
  .strict();
export type User = z.infer<typeof userSchema>;
export const challengeSchema = z
  .object({
    challengeId: z.uuid(),
    challengeToken: z.string(),
    resendAfterSeconds: z.number().int().nonnegative(),
    expiresInSeconds: z.number().int().positive(),
    maskedPhone: z.string(),
  })
  .strict();
export type Challenge = z.infer<typeof challengeSchema>;
export const sessionSchema = z
  .object({
    accessToken: z.string().min(1),
    refreshToken: z.string().min(1),
    expiresInSeconds: z.number().int().positive(),
    user: userSchema,
  })
  .strict();
export const errorSchema = z.object({
  statusCode: z.number(),
  code: z.string(),
  message: z.string(),
  requestId: z.string(),
});
