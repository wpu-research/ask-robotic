// Sade, marka adı "Macademia" olan TR/EN e-posta metinleri. Bağlantılar APP_URL ile kurulur.
export type MailLocale = 'tr' | 'en'
export interface MailContent { subject: string; text: string; html: string }

const BRAND = 'Macademia'

export const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')

const COPY = {
  tr: {
    verify: {
      subject: `${BRAND} e-posta adresini doğrula`,
      body: `${BRAND} hesabını açtığın için teşekkürler. E-posta adresini doğrulamak için aşağıdaki bağlantıyı kullan. Bağlantı 24 saat geçerlidir ve yalnız bir kez kullanılabilir.`,
      button: 'E-postamı doğrula',
      ignore: 'Bu hesabı sen açmadıysan bu e-postayı yok sayabilirsin.',
    },
    reset: {
      subject: `${BRAND} parola sıfırlama`,
      body: 'Hesabın için parola sıfırlama isteği aldık. Yeni parola belirlemek için aşağıdaki bağlantıyı kullan. Bağlantı 1 saat geçerlidir ve yalnız bir kez kullanılabilir. Parola değişince tüm cihazlardaki oturumların kapanır.',
      button: 'Parolamı sıfırla',
      ignore: 'Bu isteği sen yapmadıysan bu e-postayı yok sayabilirsin; parolan değişmez.',
    },
    hi: (n: string) => (n ? `Merhaba ${n},` : 'Merhaba,'),
    linkHint: 'Düğme çalışmazsa bu adresi tarayıcına yapıştır:',
  },
  en: {
    verify: {
      subject: `Verify your ${BRAND} email address`,
      body: `Thanks for creating your ${BRAND} account. Use the link below to verify your email address. It is valid for 24 hours and can be used once.`,
      button: 'Verify my email',
      ignore: 'If you did not create this account, you can ignore this email.',
    },
    reset: {
      subject: `${BRAND} password reset`,
      body: 'We received a request to reset your password. Use the link below to choose a new one. It is valid for 1 hour and can be used once. Changing your password signs you out on all devices.',
      button: 'Reset my password',
      ignore: 'If you did not request this, you can ignore this email; your password will not change.',
    },
    hi: (n: string) => (n ? `Hi ${n},` : 'Hi,'),
    linkHint: 'If the button does not work, paste this address into your browser:',
  },
} as const

function render(kind: 'verify' | 'reset', locale: MailLocale, name: string, link: string): MailContent {
  const c = COPY[locale]
  const k = c[kind]
  const hi = c.hi(name.trim())
  const text = `${hi}\n\n${k.body}\n\n${link}\n\n${k.ignore}\n\n${BRAND}`
  const html = `<!doctype html><html lang="${locale}"><body style="margin:0;padding:24px;background:#f6f6f4;font-family:Arial,Helvetica,sans-serif;color:#1c1c1c">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
<table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border-radius:12px;padding:28px">
<tr><td style="font-size:20px;font-weight:700;padding-bottom:16px">${BRAND}</td></tr>
<tr><td style="font-size:15px;line-height:1.6"><p style="margin:0 0 12px">${escapeHtml(hi)}</p><p style="margin:0 0 20px">${escapeHtml(k.body)}</p>
<p style="margin:0 0 20px"><a href="${escapeHtml(link)}" style="display:inline-block;background:#2f6fed;color:#ffffff;text-decoration:none;font-weight:700;padding:12px 22px;border-radius:10px">${escapeHtml(k.button)}</a></p>
<p style="margin:0 0 6px;font-size:13px;color:#666">${escapeHtml(c.linkHint)}</p>
<p style="margin:0 0 20px;font-size:13px;word-break:break-all"><a href="${escapeHtml(link)}" style="color:#2f6fed">${escapeHtml(link)}</a></p>
<p style="margin:0;font-size:13px;color:#666">${escapeHtml(k.ignore)}</p></td></tr>
</table></td></tr></table></body></html>`
  return { subject: k.subject, text, html }
}

export const verifyEmailMail = (locale: MailLocale, name: string, link: string) => render('verify', locale, name, link)
export const resetPasswordMail = (locale: MailLocale, name: string, link: string) => render('reset', locale, name, link)
