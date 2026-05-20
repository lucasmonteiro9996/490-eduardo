const AUTH_ERROR_MESSAGES = {
  'auth/invalid-email': 'E-mail inválido.',
  'auth/missing-email': 'Informe seu e-mail.',
  'auth/too-many-requests': 'Muitas tentativas. Aguarde alguns minutos e tente novamente.',
  'auth/network-request-failed': 'Falha de conexão. Verifique sua internet.',
  'auth/invalid-continue-uri': 'O domínio do app não está autorizado no Firebase. Adicione ocn.capital em Authentication > Settings > Authorized domains.',
  'auth/unauthorized-continue-uri': 'O domínio do app não está autorizado no Firebase. Adicione ocn.capital em Authentication > Settings > Authorized domains.',
  'auth/user-not-found': 'Se este e-mail estiver cadastrado, você receberá o link em instantes.',
}

export function mapFirebaseAuthError(error, fallback = 'Não foi possível enviar o e-mail de redefinição.') {
  const code = String(error?.code || '').trim()
  if (code && AUTH_ERROR_MESSAGES[code]) {
    return AUTH_ERROR_MESSAGES[code]
  }

  const message = String(error?.message || '').trim()
  if (message && !message.startsWith('Firebase:')) {
    return message
  }

  return fallback
}
