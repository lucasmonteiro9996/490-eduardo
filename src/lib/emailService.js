export const ADMIN_NOTIFICATION_EMAIL = 'siteocn@gmail.com'

const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY
const APP_URL = String(import.meta.env.VITE_APP_URL || '').trim().replace(/\/$/, '')

export const hasEmailDeliveryConfig = Boolean(
  EMAILJS_SERVICE_ID && EMAILJS_TEMPLATE_ID && EMAILJS_PUBLIC_KEY,
)

function getAdminPanelUrl() {
  if (APP_URL) {
    return `${APP_URL}/admin/inbox`
  }

  if (typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin.replace(/\/$/, '')}/admin/inbox`
  }

  return 'https://ocn.capital/admin/inbox'
}

export async function sendAdminApprovalRequestEmail({
  requestId,
  userName,
  userEmail,
  type,
  symbol,
  formattedAmount,
  source,
  destination,
  createdAtLabel,
}) {
  if (!hasEmailDeliveryConfig) {
    return {
      ok: false,
      skipped: true,
      provider: 'emailjs',
      error: 'missing-config',
    }
  }

  const operationLabel = type === 'deposit' ? 'Depósito' : 'Saque'
  const routeLabel = type === 'deposit' ? (source || 'Não informado') : (destination || 'Não informado')
  const adminPanelUrl = getAdminPanelUrl()

  try {
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service_id: EMAILJS_SERVICE_ID,
        template_id: EMAILJS_TEMPLATE_ID,
        user_id: EMAILJS_PUBLIC_KEY,
        template_params: {
          to_email: ADMIN_NOTIFICATION_EMAIL,
          admin_email: ADMIN_NOTIFICATION_EMAIL,
          request_id: requestId,
          request_type: operationLabel,
          user_name: userName || 'Cliente Ocean Capital',
          user_email: userEmail || 'cliente@oceancapital.com',
          amount: formattedAmount,
          currency: symbol,
          route_label: routeLabel,
          created_at: createdAtLabel,
          admin_panel_url: adminPanelUrl,
          admin_inbox_url: adminPanelUrl,
          message: `${userName || userEmail} solicitou ${operationLabel.toLowerCase()} de ${formattedAmount}.`,
        },
      }),
    })

    if (!response.ok) {
      const details = await response.text()
      return {
        ok: false,
        skipped: false,
        provider: 'emailjs',
        error: details || `http-${response.status}`,
      }
    }

    return {
      ok: true,
      skipped: false,
      provider: 'emailjs',
    }
  } catch (error) {
    return {
      ok: false,
      skipped: false,
      provider: 'emailjs',
      error: error instanceof Error ? error.message : 'unknown-error',
    }
  }
}
