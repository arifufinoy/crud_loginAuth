const MESSAGES: [RegExp, string][] = [
  [/invalid login credentials/i, 'Correo o contraseña incorrectos.'],
  [/email not confirmed/i, 'Debes confirmar tu correo antes de iniciar sesión.'],
  [/user already registered/i, 'Ya existe una cuenta con este correo.'],
  [/password should be at least/i, 'La contraseña debe tener al menos 8 caracteres.'],
  [/unable to validate email/i, 'El correo electrónico no es válido.'],
  [/email rate limit exceeded/i, 'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.'],
  [/for security purposes/i, 'Por seguridad, espera unos segundos antes de reintentar.'],
  [/network request failed/i, 'No hay conexión. Revisa tu internet e inténtalo de nuevo.'],
  [/failed to fetch/i, 'No hay conexión. Revisa tu internet e inténtalo de nuevo.'],
  [/new password should be different/i, 'La nueva contraseña debe ser diferente a la actual.'],
  [/auth session missing/i, 'Tu sesión expiró. Inicia sesión de nuevo.'],
  [/jwt expired/i, 'Tu sesión expiró. Inicia sesión de nuevo.'],
  [/row-level security/i, 'No tienes permiso para realizar esta operación.'],
  [/duplicate key/i, 'Ya existe un registro con esos datos.'],
  [/invalid input syntax for type uuid/i, 'El identificador del registro no es válido.'],
];

export function getErrorMessage(error: unknown): string {
  const raw =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
        ? error
        : 'Ocurrió un error inesperado. Inténtalo de nuevo.';

  for (const [pattern, message] of MESSAGES) {
    if (pattern.test(raw)) return message;
  }
  // Keep Supabase database messages readable, but avoid leaking raw payloads.
  return raw.length > 180 ? 'Ocurrió un error inesperado. Inténtalo de nuevo.' : raw;
}
