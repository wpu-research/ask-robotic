import { describe, expect, it } from 'vitest'
import { createT } from '@/i18n'
import { apiErrorText } from './api-errors'

describe('API hata metni → arayüz dili', () => {
  const tr = createT('tr')
  const en = createT('en')
  it('bilinen metin çevrilir; Türkçede aynen kalır', () => {
    expect(apiErrorText(tr, 'Bu e-posta zaten kayıtlı', 'auth.errors.generic')).toBe('Bu e-posta zaten kayıtlı')
    expect(apiErrorText(en, 'Bu e-posta zaten kayıtlı', 'auth.errors.generic')).toBe('This email is already registered')
  })
  it('kalıplı metinler parametreleriyle çevrilir', () => {
    expect(apiErrorText(tr, 'Aile planı en fazla 6 kişi (sen + 5)', 'account.family.addFailed')).toBe('Aile planı en fazla 6 kişi (sen + 5)')
    expect(apiErrorText(en, 'Aile planı en fazla 6 kişi (sen + 5)', 'account.family.addFailed')).toBe('A Family plan has at most 6 people (you + 5)')
    expect(apiErrorText(en, 'Onaylamak için "HESABIMI SİL" yaz', 'account.data.deleteFailed')).toBe('To confirm, type "HESABIMI SİL"')
  })
  it('metin yoksa yedek anahtar, bilinmeyen metin olduğu gibi', () => {
    expect(apiErrorText(en, undefined, 'pricing.checkout.startFailed')).toBe("Couldn't start the payment")
    expect(apiErrorText(tr, null, 'pricing.checkout.startFailed')).toBe('Ödeme başlatılamadı')
    expect(apiErrorText(en, 'Yeni bir hata', 'auth.errors.generic')).toBe('Yeni bir hata')
  })
})
