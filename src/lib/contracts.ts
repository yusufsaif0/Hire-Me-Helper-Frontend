import { z } from 'zod';
export const apiServiceSchema = z.enum([
  'trusted-assistance-admin-api',
  'trusted-assistance-customer-api',
  'trusted-assistance-worker-api',
]);
export type ApiService = z.infer<typeof apiServiceSchema>;
export const healthResponseSchema = z.object({
  status: z.literal('ok'),
  service: apiServiceSchema,
  version: z.literal('0.1.0'),
  phase: z.literal(0),
  integrations: z.literal('mock'),
  timestamp: z.iso.datetime(),
});
export type HealthResponse = z.infer<typeof healthResponseSchema>;
export function healthResponseSchemaFor(service: ApiService) {
  return healthResponseSchema.extend({ service: z.literal(service) });
}
export const errorResponseSchema = z.object({
  statusCode: z.number().int(),
  message: z.string(),
  requestId: z.uuid(),
});
export type ErrorResponse = z.infer<typeof errorResponseSchema>;
export const pilotServices = [
  {
    id: 'hospital-escort',
    name: 'Hospital visit escort',
    description: 'Practical support for appointments, queues and a consent-based family handover.',
  },
  {
    id: 'elderly-companion',
    name: 'Elderly companionship',
    description: 'Conversation, safe walks and everyday company for independently living adults.',
  },
  {
    id: 'station-assistance',
    name: 'Station pickup & drop',
    description: 'Help meeting a loved one, navigating the station and confirming a handover.',
  },
] as const;
