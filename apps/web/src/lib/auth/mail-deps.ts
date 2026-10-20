import { getLocale } from '@/i18n/server'
import { mailConfig } from '../mail/config'
import { getMailer } from '../mail/send'
import type { MailDeps } from './email-tokens'

/** İstek bağlamında e-posta bağımlılıkları; SMTP ayarsızsa mailer null (özellik kapalı). */
export async function mailDeps(): Promise<MailDeps> {
  const cfg = mailConfig()
  return { mailer: getMailer(), appUrl: cfg?.appUrl ?? '', locale: await getLocale() }
}
