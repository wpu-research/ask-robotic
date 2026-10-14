// Onboarding profili (lib/profile.ts → Profile) için sunucu doğrulaması. users.profile'a yalnız bu şekil yazılır.
import { z } from 'zod'

export const profileSchema = z.object({
  who: z.enum(['kendim', 'cocugum', 'okulum']),
  age: z.number().int().min(3).max(99),
  interests: z.array(z.enum(['kodlama', 'oyun', 'elektronik', 'robotik', 'ai'])).max(5),
  level: z.enum(['yeni', 'acemi', 'orta', 'ileri']),
  goalMin: z.number().int().min(1).max(240),
  time: z.enum(['sabah', 'ogle', 'aksam', 'farketmez']),
  course: z.string().trim().min(1).max(80).regex(/^[a-z0-9-]+$/),
  createdAt: z.number().int().nonnegative(),
}).strip()

export type ProfileInput = z.infer<typeof profileSchema>
