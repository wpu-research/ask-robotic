# Modül 5 Hafta 5: yeni beceri kimlikleri (koordinatör için)

`ek/*.json` içindeki testler aşağıdaki YENİ kimlikleri kullanır. `apps/web/src/lib/skills.ts` içindeki `SKILLS` listesine eklenene kadar `node tools/content/build.mjs modul-5` "bilinmeyen beceri" hatası verir. Mevcut kimlik `prog-debug` olduğu gibi kullanılmıştır.

## SKILLS'e eklenecekler
```ts
  { id: 'ctl-proportional', label: 'P kontrol', area: 'Kontrol', description: 'Hata, ayar noktası ve kontrol çıkışını tanır; u = Kp x e ile direksiyon hesaplar ve Kp seçiminin sonuçlarını yorumlar.' },
  { id: 'ctl-derivative', label: 'Türev ve süzgeç', area: 'Kontrol', description: 'Hatanın değişim hızını hesaplar, D teriminin sönümlemesini ve gürültüde süzgeç ihtiyacını yorumlar.' },
  { id: 'ctl-integral', label: 'İntegral ve windup', area: 'Kontrol', description: 'Kalıcı hatayı, integral birikimini, windup\'ı ve anti-windup yöntemlerini bilir.' },
  { id: 'ctl-tuning', label: 'PID ayarı', area: 'Kontrol', description: 'El ile ayar sırasını, Ziegler-Nichols riskini ve adım cevabından k, tau, theta ile SIMC hesabını bilir.' },
  { id: 'ctl-pid-project', label: 'PID uygulaması', area: 'Kontrol', description: 'Aynı PID iskeletini çizgi ve duvar görevlerine uygular; yöntemleri aynı koşullarda ölçerek karşılaştırır.' },
```

## LESSON_SKILLS'e eklenecekler (test: soru becerileri bu listelerin alt kümesi olmalı)
```ts
  'robotik:5:1': ['ctl-proportional', 'prog-debug'],
  'robotik:5:2': ['ctl-derivative', 'prog-debug'],
  'robotik:5:3': ['ctl-integral', 'prog-debug'],
  'robotik:5:4': ['ctl-tuning', 'prog-debug'],
  'robotik:5:5': ['ctl-pid-project', 'ctl-integral', 'prog-debug'],
```
Not: Ders numaraları modülde 5. haftanın 1-5. dersleri (küresel 96-100). Anahtar biçimi pilottaki `modül-slug:hafta:ders` ile aynıdır.
