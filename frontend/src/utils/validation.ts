// Validation rules
export const validationRules = {
  required: (value: any) => {
    if (typeof value === 'string') {
      return value.trim().length > 0;
    }
    return value !== null && value !== undefined && value !== '';
  },

  email: (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  },

  minLength: (value: string, length: number) => {
    return value.length >= length;
  },

  maxLength: (value: string, length: number) => {
    return value.length <= length;
  },

  minValue: (value: number, min: number) => {
    return value >= min;
  },

  maxValue: (value: number, max: number) => {
    return value <= max;
  },

  phone: (value: string) => {
    // Turkish phone number format (optional)
    const phoneRegex = /^(\+90|0)?[1-9]\d{9}$/;
    return phoneRegex.test(value.replace(/\s/g, ''));
  },

  url: (value: string) => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  },

  alphanumeric: (value: string) => {
    const alphanumericRegex = /^[a-zA-Z0-9]+$/;
    return alphanumericRegex.test(value);
  },

  numeric: (value: string) => {
    return !isNaN(Number(value));
  },

  date: (value: string) => {
    const date = new Date(value);
    return !isNaN(date.getTime());
  },

  dateRange: (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return start <= end;
  },

  match: (value: string, compareValue: string) => {
    return value === compareValue;
  },
};

// Error messages
export const errorMessages = {
  required: 'Bu alan zorunludur',
  email: 'Geçerli bir e-posta adresi girin',
  minLength: (length: number) => `En az ${length} karakter olmalıdır`,
  maxLength: (length: number) => `En fazla ${length} karakter olabilir`,
  minValue: (min: number) => `En az ${min} olmalıdır`,
  maxValue: (max: number) => `En fazla ${max} olabilir`,
  phone: 'Geçerli bir telefon numarası girin',
  url: 'Geçerli bir URL girin',
  alphanumeric: 'Sadece harf ve rakam içerebilir',
  numeric: 'Sadece rakam içerebilir',
  date: 'Geçerli bir tarih girin',
  dateRange: 'Başlangıç tarihi bitiş tarihinden önce olmalıdır',
  match: 'Değerler eşleşmiyor',
};

// Validation schema interface
export interface ValidationRule {
  type: keyof typeof validationRules;
  value?: any;
  message?: string;
}

export interface ValidationSchema {
  [field: string]: ValidationRule[];
}

// Validate a single field
export function validateField(
  value: any,
  rules: ValidationRule[]
): { isValid: boolean; error?: string } {
  for (const rule of rules) {
    let isValid = false;

    switch (rule.type) {
      case 'required':
        isValid = validationRules.required(value);
        break;
      case 'email':
        isValid = !value || validationRules.email(value);
        break;
      case 'minLength':
        isValid = !value || validationRules.minLength(value, rule.value);
        break;
      case 'maxLength':
        isValid = !value || validationRules.maxLength(value, rule.value);
        break;
      case 'minValue':
        isValid = !value || validationRules.minValue(Number(value), rule.value);
        break;
      case 'maxValue':
        isValid = !value || validationRules.maxValue(Number(value), rule.value);
        break;
      case 'phone':
        isValid = !value || validationRules.phone(value);
        break;
      case 'url':
        isValid = !value || validationRules.url(value);
        break;
      case 'alphanumeric':
        isValid = !value || validationRules.alphanumeric(value);
        break;
      case 'numeric':
        isValid = !value || validationRules.numeric(value);
        break;
      case 'date':
        isValid = !value || validationRules.date(value);
        break;
      default:
        isValid = true;
    }

    if (!isValid) {
      const message =
        rule.message ||
        (typeof errorMessages[rule.type] === 'function'
          ? (errorMessages[rule.type] as Function)(rule.value)
          : errorMessages[rule.type]);
      return { isValid: false, error: message };
    }
  }

  return { isValid: true };
}

// Validate entire form
export function validateForm(
  data: Record<string, any>,
  schema: ValidationSchema
): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  for (const [field, rules] of Object.entries(schema)) {
    const result = validateField(data[field], rules);
    if (!result.isValid && result.error) {
      errors[field] = result.error;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

// Custom hook for form validation
export function useFormValidation(schema: ValidationSchema) {
  return {
    validateField: (field: string, value: any) => {
      return validateField(value, schema[field] || []);
    },
    validateForm: (data: Record<string, any>) => {
      return validateForm(data, schema);
    },
  };
}
