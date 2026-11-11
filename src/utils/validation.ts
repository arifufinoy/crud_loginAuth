export interface FieldErrors {
  [key: string]: string | undefined;
}

export function validateFullName(value: string): string | undefined {
  const name = value.trim();
  if (!name) return 'El nombre es obligatorio.';
  if (name.length < 3) return 'Escribe al menos 3 caracteres.';
  if (!/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s'.-]+$/.test(name)) return 'El nombre contiene caracteres inválidos.';
  return undefined;
}

export function validateEmail(value: string): string | undefined {
  const email = value.trim();
  if (!email) return 'El correo es obligatorio.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return 'Ingresa un correo válido.';
  return undefined;
}

export function validatePassword(value: string): string | undefined {
  if (!value) return 'La contraseña es obligatoria.';
  if (value.length < 8) return 'Usa al menos 8 caracteres.';
  if (!/[A-Za-z]/.test(value) || !/\d/.test(value)) {
    return 'Incluye al menos una letra y un número.';
  }
  return undefined;
}

export function validateConfirmPassword(password: string, confirm: string): string | undefined {
  if (!confirm) return 'Confirma tu contraseña.';
  if (password !== confirm) return 'Las contraseñas no coinciden.';
  return undefined;
}

export function validateRequired(value: string, label: string, min = 2): string | undefined {
  if (!value.trim()) return `${label} es obligatorio.`;
  if (value.trim().length < min) return `${label} debe tener al menos ${min} caracteres.`;
  return undefined;
}
