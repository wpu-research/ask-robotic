# ASK Robotic

"0'dan AI Robotik Mühendisliğine" — modüler öğrenme platformu.

## Modüller
1. ScratchJr (5-7 yaş)
2. Scratch 3 (8-12 yaş)
3. Arduino Temelleri (35 ders)
4. Sensörler ve Projeler (40 ders)
5. Robotik (40 ders)
6. Diğer Kartlar (ESP32, RP2040, Pi)
7. AI Engineering + Claude

## Durum
Modül 1-4 içeriği yazıldı (Modül 3-4: 75 ders, sketch'ler simülasyonda doğrulandı). Modül 5 yazılıyor; plan (115 ders): [docs/modul-3-4-5-plan.md](docs/modul-3-4-5-plan.md). Araştırma kaydı: [docs/mufredat-taslak.md](docs/mufredat-taslak.md)

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

## Modül 3-5 içerik hattı
Dersler `content-src/modul-N/hH/NN-ad.md` dosyalarında yazılır (biçim, cihaz modelleri ve robot benzetimi: `tools/sim/README.md`; yazar rehberleri: `content-src/modul-N/YAZAR-REHBERI.md`).
```
pnpm content:check   # tüm sketch'leri derler (arduino-cli) ve avr8js ile davranışını sınar (Modül 3+4: ~10 dk)
pnpm content:build   # dersleri packages/db/src/content/*.generated.ts'ye çevirir
```
Gereksinim: `arduino-cli`, `arduino:avr` çekirdeği ve kütüphaneler (listesi `tools/sim/README.md`). Üretilmiş dosyayı elle düzenleme; kaynağı değiştirip `content:build` çalıştır.

## Doğrulama bekleyenler
- Modül 3-4: sensörler benzetim modelleriyle (HC-SR04, DHT, BMP280, MPU6050, RTC, LCD, keypad) ya da `analogRead` seviyesinde taklit edildi; gerçek devre/parça davranışı doğrulanmadı. Yalnızca derlenenler: RC522, IRremote kütüphanesi, SD, VL53L0X, SSD1306, HC-05 (SoftwareSerial). I2C ve SPI hızları pin kenarından değil yazmaçtan hesaplandı.
- Modül 3 derslerindeki bazı değerler (LED ileri gerilimi, Uno pin akım sınırı, transistör baz direnci, EEPROM yazma ömrü, I2C adresleri) bilinen donanım özelliklerine dayanıyor; veri sayfasıyla ayrıca doğrulanmadı.
- Modül 1 dersleri ScratchJr blok renk/adlarına atıf yapıyor (sarı başlatma, mavi hareket, mor görünüm, yeşil ses, turuncu kontrol, kırmızı bitiş). Türkçe arayüzdeki gerçek adlar uygulamadan kontrol edilmeli.
- Modül 2 (Scratch 3) blok kategorilerini renkle anıyor (olaylar sarı, hareket mavi, görünüm mor, ses pembe, kontrol turuncu, algılama açık mavi, işlemler yeşil, değişkenler turuncu-kırmızı, bloklarım pembe). Türkçe arayüzdeki gerçek kategori ve blok adları kontrol edilmeli.
- ScratchJr bir tablet/telefon uygulaması; tarayıcıda gömülü çalıştırma doğrulanmadı. Modül 1 şu an cihazda uygulama gerektiriyor.
- Gerçek bir Postgres'e karşı uçtan uca HTTP denemesi yapılmadı (yalnızca PGlite testleri).

## Yerelde çalıştırma
```
# özel bir Postgres kümesi (Docker gerekmez), proje içinde .dev/ altında
/usr/lib/postgresql/14/bin/initdb -D .dev/pg -U wpu --auth=trust
/usr/lib/postgresql/14/bin/pg_ctl -D .dev/pg -o "-p 54329 -k $PWD/.dev -c listen_addresses=127.0.0.1" -l .dev/pg.log start
createdb -h 127.0.0.1 -p 54329 -U wpu ask_robotic
export DATABASE_URL=postgres://wpu@127.0.0.1:54329/ask_robotic
pnpm db:migrate && (cd packages/db && node dist/seed.js)
pnpm build && pnpm --filter web start      # http://localhost:3000
```
**Giriş şimdilik kapalı.** Ders sayfaları girişsiz açılır, ilerleme tarayıcıda (`localStorage`) tutulur. Girişi açmak için `AUTH_ENABLED=true` ver: kayıt/giriş sayfaları, `/api/auth/*` ve sunucu tarafı ilerleme yerinde duruyor.
