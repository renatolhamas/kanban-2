import { z } from 'zod';

export const ContactSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be 100 characters or less')
    .trim(),
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .regex(/^\d+$/, 'Phone must contain only digits after normalization')
    .transform((val) => val.replace(/\D/g, '')) // Normalize: remove non-digits
});

export type ContactFormData = z.infer<typeof ContactSchema>;

// Validation for uniqueness (frontend check)
export function validatePhoneUniqueness(phone: string, existingContacts: Array<{ phone: string; id?: string }>, currentId?: string): boolean {
  const normalizedPhone = phone.replace(/\D/g, '');
  return !existingContacts.some(
    (contact) => contact.phone === normalizedPhone && contact.id !== currentId
  );
}
