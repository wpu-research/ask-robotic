# Modül 3 — Yazar rehberi

Bu rehber, Modül 3 (Arduino Temelleri) ders yazarları içindir. Önce `tools/sim/README.md` (ders biçimi + Sim API'si), `h1/03-blink.md` (referans ders) ve `h1/checks.mjs` (referans kontrol) dosyalarını oku.

## Kurallar
- Yalnız KENDİ hafta dizinine yaz: `content-src/modul-3/<hN>/NN-kısa-ad.md` (NN = küresel ders numarası, iki hane) ve aynı dizinde `checks.mjs`. Başka dizine, paylaşılan dosyalara, `packages/` veya `apps/` altına dokunma. git çalıştırma. `pnpm build` ve içerik üretici (`tools/content/build.mjs`) çalıştırma.
- Doğrulama: `node tools/sim/check.mjs modul-3 <hN>`. Çıkış kodu 0 olana kadar düzelt. Testi gevşetme; sketch'i ya da dersi düzelt.
- Anlamlı assert'ler yaz (pin durumu, PWM/tone ölçümü, seri çıktı, `sim.drive` ile buton, `sim.analog` ile analog). Boş/trivial assert yazma. LCD/I2C gibi simüle edilemeyenler yalnız derlenir (checks'te yazma).

## Hedef kitle ve üslup
12 yaş ve üzeri, yetişkin dahil, elektronik/programlama bilmeyen öğrenci. Türkçe, "sen" hitabı, sade ve net, kısa cümleler. Emoji yok. Ders 15-25 dk (proje dersleri 30-35 dk olabilir; `süre:` 15-40 arası).
Bir ders yalnızca kendisinden ÖNCEKİ derslerde işlenen kavramları kullanabilir (aşağıdaki listeye bak); ileri kavramı (millis, kesme, fonksiyon…) önceden kullanma.

## Ders yapısı (referans dersteki gibi)
`# Başlık` · `süre: N` · `## Merak` (2-4 cümle, merak uyandıran soru/senaryo) · `## Etkinlik` (içinde `### Devre` tablosu [Parça | Bağlantı], `### Program` doğrulanmış sketch'ler, `### Nasıl çalışıyor?`, `### Dene` 2-3 görev, `### Sık yapılan hatalar`) · `## Konuşalım` (1-2 soru).
Saf kavram derslerinde devre/sketch zorunlu değil; ama sayısal örnekler DOĞRU hesaplanmış olmalı, mümkünse hesabı doğrulayan küçük bir sketch ekle.

## Sketch kuralları
- Arduino Uno. Yalnız şu kütüphaneler: Servo, LiquidCrystal, LiquidCrystal_I2C, Wire, EEPROM.
- Test edilecek her tam sketch ` ```cpp ` bloğunun ilk satırı `// sketch: ad` (hafta içinde benzersiz). Parça açıklaması için kısa kod parçalarını işaretsiz bırak.
- Pin düzeni (tutarlılık): LED'ler D13, D12, D11, D10…; butonlar D2, D3 (INPUT_PULLUP, basılı = LOW); potansiyometre A0; LDR A1; NTC A2; buzzer D8; servo D9; RGB LED D9/D10/D11 (PWM); motor/röle D7, D6, D5. Kırmızı LED için ~330 Ω (5 V).
- Güvenlik: şebeke gerilimiyle (220 V) ASLA devre kurdurma; röle dersinde yalnız düşük gerilim/kuru kontak, yetişkin gözetimi uyarısı.
- Doğruluk: emin olmadığın bir teknik bilgiyi yazma. Uydurma veri yok. Simülatör henüz yok: "Devreyi simülatörde ya da kendi kartında kur" gibi nötr ifade kullan; simülatör özelliği iddia etme.

## Teslim
`node tools/sim/check.mjs modul-3 <hN>` çıkış kodu 0. Son mesajında KISA rapor: yazdığın dosyalar, kaç sketch derlendi/kaçında davranış kontrolü var, hangi sketch'ler neden yalnız derlendi, emin olmadığın/riskli bulduklarını.

## 35 derslik plan (küresel numaralar)
H1 Temeller (proje: Trafik ışığı): 1 Mikrodenetleyici nedir? Kart anatomisi ve simülatör · 2 Elektrik: V, I, R ve Ohm yasası · 3 İlk program: Blink (yazıldı) · 4 Çoklu LED, for döngüsü ve diziler · 5 Proje: Trafik ışığı
H2 Girdi ve mantık (Kapı zili ve sayaç): 6 digitalRead, buton, INPUT_PULLUP · 7 if/else, switch, mantık işleçleri · 8 Debounce ve kenar algılama · 9 Serial Monitor: yazdır, oku, ayrıştır · 10 Proje: Kapı zili ve basış sayacı
H3 Analog dünya (Akıllı gece lambası): 11 analogRead, ADC, potansiyometre · 12 Gerilim bölücü ve LDR · 13 Termistör (NTC) ve sıcaklık hesabı · 14 map, constrain, kalibrasyon ve yumuşatma · 15 Proje: Akıllı gece lambası
H4 PWM, renk, ses (Işıklı müzik kutusu): 16 PWM ve analogWrite: nefes alan LED · 17 RGB LED ve renk karıştırma · 18 Buzzer: tone ve nota frekansları · 19 Fonksiyonlar, kapsam, parametreler · 20 Proje: Işıklı müzik kutusu
H5 Motorlar (Otomatik fan ve servo tarayıcı): 21 Servo: açı kontrolü · 22 Transistör/MOSFET ile anahtarlama, flyback diyot, DC motor · 23 H-köprüsü L293D: yön ve hız · 24 Röle: yüksek akım anahtarlama ve güvenlik · 25 Proje: Sıcaklığa bağlı otomatik fan ve servo tarayıcı
H6 Zamanlama (Çoklu görev paneli): 26 delay'in tuzağı · 27 millis() ile bloklamayan kod · 28 Durum makineleri (FSM) · 29 Kesmeler ve timer'lar: attachInterrupt, volatile, ISR kuralları · 30 Proje: Çoklu görev paneli
H7 Ekranlar ve veri (Termostat): 31 7-segment ve 74HC595 · 32 LCD 16x2 · 33 I2C: Wire, adres tarama · 34 EEPROM, String/SRAM ve kütüphane kullanımı · 35 Bitirme projesi: Termostat (NTC + LCD + röle + EEPROM, durum makineli)
