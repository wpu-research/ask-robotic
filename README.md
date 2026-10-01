# ASK Robotic

"0'dan AI Robotik Mühendisliğine" — modüler öğrenme platformu.

## Modüller
1. ScratchJr (5-7 yaş)
2. Scratch 3 (8-12 yaş)
3. Arduino Simülasyon
4. Simülasyondan Gerçeğe
5. Robotik ve Sensörler
6. Diğer Kartlar (ESP32, RP2040, Pi)
7. AI Engineering + Claude

## Durum
Taslak aşaması. Müfredat: [docs/mufredat-taslak.md](docs/mufredat-taslak.md)

## Kararlar
- Kit satılmaz; her ders önce tarayıcı simülasyonunda çalışır.
- Önce platform omurgası, modüller sırayla.
- Kendi simülatör (avr8js + rp2040js + Blockly); Velxio/Wokwi yedek.
- Her bölüm sonunda 3D robot (fizik 2D, 3D yalnız görüntüleme).
- Lisans konusu en sona bırakıldı.

## Teknoloji (Kipay ile aynı çizgi)
pnpm monorepo + Turborepo · Next.js (apps/web) · Postgres + Drizzle (packages/db) · Docker + Railway.

## Geliştirme
```
pnpm install
pnpm build          # db + web
pnpm test           # PGlite ile (Docker/Postgres gerekmez)
DATABASE_URL=... pnpm db:migrate
DATABASE_URL=... pnpm --filter @ask/db seed:dev   # ders içeriğini veritabanına yazar (tekrar çalıştırılabilir)
```
Ders içeriği: `packages/db/src/content/`. Seed, mevcut içeriği günceller; kaldırılan dersleri silmez.

## Doğrulama bekleyenler
- Modül 1 dersleri ScratchJr blok renk/adlarına atıf yapıyor (sarı başlatma, mavi hareket, mor görünüm, yeşil ses, turuncu kontrol, kırmızı bitiş). Türkçe arayüzdeki gerçek adlar uygulamadan kontrol edilmeli.
- Modül 2 (Scratch 3) blok kategorilerini renkle anıyor (olaylar sarı, hareket mavi, görünüm mor, ses pembe, kontrol turuncu, algılama açık mavi, işlemler yeşil, değişkenler turuncu-kırmızı, bloklarım pembe). Türkçe arayüzdeki gerçek kategori ve blok adları kontrol edilmeli.
- ScratchJr bir tablet/telefon uygulaması; tarayıcıda gömülü çalıştırma doğrulanmadı. Modül 1 şu an cihazda uygulama gerektiriyor.
- Gerçek bir Postgres'e karşı uçtan uca HTTP denemesi yapılmadı (yalnızca PGlite testleri).
