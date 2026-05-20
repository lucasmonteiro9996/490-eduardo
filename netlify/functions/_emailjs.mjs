export function getEmailJsConfig() {
  const serviceId = String(process.env.EMAILJS_SERVICE_ID || process.env.VITE_EMAILJS_SERVICE_ID || '').trim()
  const publicKey = String(process.env.EMAILJS_PUBLIC_KEY || process.env.VITE_EMAILJS_PUBLIC_KEY || '').trim()
  const templateId = String(
    process.env.PASSWORD_RESET_EMAILJS_TEMPLATE_ID
    || process.env.VITE_PASSWORD_RESET_EMAILJS_TEMPLATE_ID
    || '',
  ).trim()

  if (!serviceId || !publicKey || !templateId) {
    return null
  }

  return { serviceId, publicKey, templateId }
}

export async function sendEmailJs({ serviceId, templateId, publicKey, templateParams }) {
  const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      service_id: serviceId,
      template_id: templateId,
      user_id: publicKey,
      template_params: templateParams,
    }),
  })

  if (!response.ok) {
    const details = await response.text()
    throw new Error(details || `emailjs-http-${response.status}`)
  }

  return { ok: true }
}
