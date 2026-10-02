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

---

# Öğrenme platformu katmanı (pilot şablonu)

Pilot: Modül 3 Hafta 1 (`h1/ek/`). Aynı biçim diğer derslere uygulanır. Zorunlu doğrulama `node tools/content/build.mjs modul-3` içinde çalışır (hata varsa üretim durur); bu dosyaları yazan ajan da aynı komutla kendi işini sınar.

## Dosya yerleşimi
Her hafta dizininde (`content-src/modul-3/hN/`) bir `ek/` alt dizini (ders dosyası düzenini ve `check.mjs`'i etkilemez):
```
hN/ek/NN.anlatim.md   # NN = küresel ders numarası (iki hane). Konu anlatımı (Markdown)
hN/ek/NN.json         # { "concepts": [...], "quiz": [...] }
hN/ek/rehber.md       # Haftalık çalışma rehberi (Markdown)
content-src/parcalar/<slug>.md   # Parça ansiklopedisi maddesi (hafta dizininden bağımsız)
```
Hepsi opsiyoneldir; olmayan dosya dersi bozmaz (oynatıcı eski 4 adıma döner).

## 1. Konu anlatımı (`NN.anlatim.md`)
- Üç başlıkla açılır, hepsi `###`: **Bu derste öğreneceklerin** (3-5 madde), **Önceden bilmen gerekenler** (önceki ders numaralarıyla), sonra 3-5 konu başlığı, en sonda **Özet** (3-4 cümle). Test bu üç başlığı arar.
- 300-500 kelime. Etkinlik metnini tekrar etme: anlatım "neden/nasıl", etkinlik "yap".
- Yalnız önceki derslerde işlenen kavramlar. Sayılar doğru hesaplanmış ve laboratuvar modelinden alınmış olmalı (`packages/sim/src/circuit/model.ts`).
- Küçük kod parçaları işaretsiz ` ``` ` blok; `// sketch:` etiketi KULLANMA (derlenip sınanmaz).
- Yeni terim kalın yazılır; emoji yok.

## 2. Kavram kartları (`NN.json` → `concepts`, 3-6 adet)
```json
{ "term": "delay()", "definition": "Tek cümle.", "example": "Tek cümlelik somut örnek.", "pitfall": "Sık yapılan yanlış." }
```
Dört alan da dolu; terimler ders içinde benzersiz; `pitfall` gerçek bir hata olmalı (dersteki "Sık yapılan hatalar"la tutarlı).

## 3. Mini test (`NN.json` → `quiz`, 3-5 soru)
```json
{ "id": "m3h1d3-q1", "kind": "numeric", "prompt": "…", "answer": 2000, "tolerance": 0, "unit": "ms",
  "explanation": "…", "skills": ["prog-timing"] }
```
| kind | options | answer |
|---|---|---|
| `mcq` | 2-5 benzersiz seçenek | doğru seçeneğin 0 tabanlı sırası |
| `predict-output` | seçenekler | sıra. Prompt'ta ` ``` ` kod bloğu olur: "Bu kod çalışınca ne olur?" |
| `find-bug` | hatalı satır/neden seçenekleri | sıra. Kodda TEK hata olsun |
| `numeric` | yok | sayı; `tolerance` (mutlak) ve `unit` isteğe bağlı |

Kurallar: `id` = `m<modül>h<hafta>d<ders>-q<n>` ve global benzersiz. Doğru cevap hep aynı sırada olmasın. En az bir soru bir hesap/hata ayıklama, en az biri kavram sorusu olsun. `explanation` hem neden doğru olduğunu hem yanlış seçeneğin neden yanlış olduğunu söyler. Sayısal cevapları ve `predict-output` sonuçlarını **makineyle doğrula**: hesabı Node'da çalıştır ya da sketch'i `node tools/sim/check.mjs` sim'inde koştur; `apps/web/src/lib/platform-icerik.test.ts` içine ilgili formül testini ekle. `skills`: `apps/web/src/lib/skills.ts` içindeki `SKILLS` kimlikleri; yeni beceri gerekiyorsa orada tanımla ve `LESSON_SKILLS` eşlemesine dersin anahtarıyla (`modül-slug:hafta:ders`) ekle. Sorunun becerileri dersin eşlemesinin alt kümesi olmalı (test denetler).

## 4. Haftalık rehber (`ek/rehber.md`)
Sekiz `###` başlığı, bu adla ve sırayla: **Hafta hedefleri** · **Haftanın planı** (gün gün tablo: Gün | Ders | Süre | Ne yapılır; ders adları dosyadaki başlıkla aynı) · **Ön koşul kontrolü** · **Kavram haritası** · **Sık yapılan hatalar** · **Hafta sonu tekrarı** (+ hafta sonu testi tanımı) · **Proje değerlendirme ölçütü** (Gelişmeli/Yeterli/İleri tablosu) · **Veli ve öğretmen notu**.

## 5. Parça maddesi (`content-src/parcalar/<slug>.md`)
```
# LED
slug: led
parça: led            # packages/sim contract.ts PartType; pin listesi PINS[parça] ile BİREBİR aynı olmalı (test)
kategori: Çıkış
özet: Tek cümle.

## Pinler                      # - AD: açıklama   (AD contract.ts'teki pin adı)
## Nasıl çalışır               # basit anlatım + **İleri düzey:** paragrafı
## Laboratuvarda bağlantı      # Nereden | Nereye tablosu (pin adları contract.ts ile aynı), özellik paneli notları
## Tipik değerler              # - Etiket | değer | not   (sayılar model.ts ile uyumlu; LED Vf vb. test denetler)
## Sık hatalar                 # - **Kalın başlık.** açıklama
## İlgili dersler              # - modül-slug:hafta:ders   (en az 2; gerçek derslere çözülmeli)
```
`node tools/content/build.mjs parcalar` → `packages/db/src/content/parcalar.generated.ts`. Yeni parça için laboratuvarda "Bu parça nedir?" bağlantısı kendiliğinden çıkar (parça türü eşleşirse).

## Üretim sırası (tek ders)
1. Dersin `.md` dosyasını oku. 2. `NN.anlatim.md` yaz. 3. `NN.json` yaz (kavram + test). 4. Sayısal sonuçları doğrula. 5. `node tools/content/build.mjs modul-3` (doğrulama dahil). 6. `cd apps/web && npx vitest run src/lib/platform-icerik.test.ts`. 7. Hafta bitince `ek/rehber.md`. 8. Kullanılan parçalar için madde yoksa yaz.
