import { z } from 'zod';
import { validateE164, normalizePhone } from '../phone-utils';

export const ContactSchema = z.object({
  name: z
    .string()
    .min(1, 'O nome é obrigatório')
    .max(100, 'O nome deve ter no máximo 100 caracteres')
    .trim(),
  phone: z
    .string()
    .min(1, 'O telefone é obrigatório')
    .superRefine((val, ctx) => {
      const result = validateE164(val);
      if (!result.isValid) {
        // [Dex Update]: Concatenando a sugestão na mensagem principal para garantir visibilidade na UI
        const fullMessage = result.suggestion 
          ? `${result.errorMessage}. Sugestão: ${result.suggestion}`
          : result.errorMessage;

        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: fullMessage,
        });
      }
    })
    .transform((val) => normalizePhone(val)),
});

export type ContactFormData = z.infer<typeof ContactSchema>;

/**
 * Validação de unicidade de telefone (check no frontend).
 * [Dex Update]: Agora utiliza normalizePhone para comparação consistente.
 */
export function validatePhoneUniqueness(phone: string, existingContacts: Array<{ phone: string; id?: string }>, currentId?: string): boolean {
  const normalizedPhone = normalizePhone(phone);
  if (!normalizedPhone) return true;
  
  return !existingContacts.some(
    (contact) => normalizePhone(contact.phone) === normalizedPhone && contact.id !== currentId
  );
}
