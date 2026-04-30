import { parsePhoneNumber } from 'libphonenumber-js';

/**
 * Normaliza um número de telefone preservando o prefixo '+' e removendo outros caracteres.
 * [Dex Update]: Atualizado para suportar padrão E.164.
 */
export function normalizePhone(phone: string): string {
  if (!phone) return "";
  // Remove tudo que não é dígito ou o sinal de +
  return phone.replace(/[^\d+]/g, "");
}

/**
 * Valida se um número de telefone segue o padrão E.164.
 * [Dex Decision]: Implementação via libphonenumber-js com mensagens em PT-BR e sugestões dinâmicas.
 */
export function validateE164(phone: string): { 
  isValid: boolean; 
  normalized: string; 
  errorMessage?: string; 
  suggestion?: string 
} {
  if (!phone || phone.trim() === "") {
    return { isValid: false, normalized: "", errorMessage: "Número de telefone é obrigatório" };
  }

  const normalized = normalizePhone(phone);

  if (!normalized.startsWith('+')) {
    return { 
      isValid: false, 
      normalized, 
      errorMessage: "Número deve começar com o código do país (ex: +55)",
      suggestion: "+55 " + phone.replace(/\D/g, "")
    };
  }

  try {
    const phoneNumber = parsePhoneNumber(normalized);
    
    if (phoneNumber && phoneNumber.isValid()) {
      return { 
        isValid: true, 
        normalized: phoneNumber.format('E.164') 
      };
    }

    // Se não for válido, tentamos gerar uma sugestão baseada no DDI detectado
    const country = phoneNumber?.country || 'BR';
    const example = country === 'BR' ? '+55 11 98765-4321' : '+1 201 555 0123';

    return {
      isValid: false,
      normalized,
      errorMessage: "Formato de telefone inválido para o país detectado",
      suggestion: `Use o formato: ${example}`
    };
  } catch (error) {
    return { 
      isValid: false, 
      normalized, 
      errorMessage: "Número de telefone inválido",
      suggestion: "Use o formato: +55 11 98765-4321"
    };
  }
}

/**
 * Formata um número E.164 para exibição amigável.
 * [Dex Update]: Agora utiliza a lib para formatação internacional.
 */
export function formatPhoneForDisplay(phone: string): string {
  if (!phone) return "";
  
  try {
    const normalized = normalizePhone(phone);
    if (!normalized.startsWith('+')) return phone;

    const phoneNumber = parsePhoneNumber(normalized);
    return phoneNumber.formatInternational(); // Ex: +55 11 98765-4321
  } catch (error) {
    return phone;
  }
}
