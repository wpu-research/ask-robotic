import nodemailer from 'nodemailer'
import { mailConfig, type MailConfig } from './config'
import type { MailContent } from './templates'

export interface Mailer { send(to: string, content: MailContent): Promise<void> }

/** Gerçek SMTP gönderici. Konsola ne adres ne bağlantı ne de içerik yazılır. */
export function createSmtpMailer(cfg: MailConfig): Mailer {
  const transport = nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.port === 465,
    requireTLS: cfg.port !== 465,
    auth: { user: cfg.user, pass: cfg.pass },
    connectionTimeout: 10_000,
    socketTimeout: 15_000,
  })
  return {
    async send(to, c) {
      await transport.sendMail({ from: cfg.from, to, subject: c.subject, text: c.text, html: c.html })
    },
  }
}

/** SMTP ayarlıysa gönderici, değilse null (özellik kapalı). */
export function getMailer(): Mailer | null {
  const cfg = mailConfig()
  return cfg ? createSmtpMailer(cfg) : null
}
