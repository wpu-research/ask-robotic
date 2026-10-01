# Modül 3-4 sanallaştırma rehberi (laboratuvar etkinliği ekleme)

**Karar (2026-10-01): Portal tamamen sanal.** Hiçbir fiziki şey kullanılmaz: kart, kablo, breadboard, multimetre, pil, kâğıt, lehim yok. Her devre ve kod etkinliği platformun **sanal devre laboratuvarında** yapılır. Bu rehber, ders metinlerini ve etkinliklerini bu ilkeye uydurmak içindir.

## Laboratuvar nasıl çalışır (öğrenci gözüyle)
- Solda **kod düzenleyici** (`sketch.ino`), sağda **devre tuvali**; Uno hazır durur (silinemez). Üstte yuvarlak düğmeler: ▶ Derle ve çalıştır, ⏸ Duraklat, ■ Dur, ↺ Sıfırla, ses; süre sayacı.
- Parça eklemek için tuvalin üstündeki **"＋ Parça ekle"** düğmesi: arama kutulu, ikonlu liste (ya da parçayı sürükle-bırak). Pin → pin sürükleyerek **kablo** çekilir (aynı iki pin arasında ikinci kablo olmaz). Bir parçayı seçince sağ panelde **özellikleri** çıkar (direnç değeri, renk, potansiyometre konumu, LDR ışığı, NTC sıcaklığı, buton basılı…). Seçili parça **R** ile döner, **Delete** ile silinir. Buton parçasına basılı tutarak basılır.
- Çalışırken devre düzenlenmez (önce ■ Dur); sensör/buton gibi **canlı** özellikler çalışırken değiştirilebilir.
- Altta **Seri monitör**. Hedefler paneli (ders etkinliği) ✓ olur.
- **Sanal ölçüm** (multimetre karşılığı): çalışırken bir parçayı seçince uçlarındaki gerilim ve geçen akım görünür (`PartRuntime.meas`).
- Güç: Uno'nun 5V/3V3/GND pinleri laboratuvarda otomatik beslenir; harici güç kaynağı, pil, USB kablosu yok.

## Metin kuralları
- Metinde fiziksel eylem istenmez. Yasak/değişecek ifadeler: "kendi kartın/kartında", "gerçek kart", "kartı bilgisayara tak", "multimetreyle ölç", "lehim", "pil tak", "harici güç kaynağı bağla", "breadboard'a tak", "bacağı bük/kes", "kablo ile bağla" (fiziksel anlam). Bunların yerine laboratuvar eylemleri: "Parça ekle menüsünden LED'i seç", "D13 pininden direncin 1 ucuna kablo çek", "▶'e bas", "özellik panelinden değerini 330 Ω yap", "Sanal ölçümle akımı oku".
- "Devre" tablosu kalır (Parça | Bağlantı), tablonun hemen önündeki cümle: "Parçaları laboratuvarda **Parça ekle** menüsünden seç, pinleri kablo çekerek bağla." Pin adları laboratuvardaki adlarla aynı olmalı (`contract.ts` PINS): LED A (uzun bacak/anot) ve K; direnç 1/2; buton A/B; pot VCC/SIG/GND; LDR 1/2; NTC 1/2; buzzer +/-; RGB R/G/B/COM; servo SIG/VCC/GND; Uno D0-D13, A0-A5, 5V, 3V3, GND.
- Gerçek dünya bilgisi (LED akım sınırı, direnç renk bantları vb.) KISA bilgi notu olarak kalabilir, ama "gerçek devrede şunu yapma" yerine "laboratuvar bunu modeller: LED yanarsa uyarı çıkar" gibi bağla. Güvenlik uyarıları (220 V yasak) fiziksel talimat olmadığı için çıkarılabilir; gerek yoksa kaldır.
- **`// sketch:` kod bloklarına dokunma** (ders denetleyicisi `node tools/sim/check.mjs modul-3 hN` bunları sınıyor). Sketch değişmek zorundaysa `checks.mjs`'i de güncelle ve denetleyiciyi çalıştır. Başlık, süre, sıra ve Merak/Etkinlik/Konuşalım yapısı aynı kalsın. Ders adları ve numaraları değişmesin.
- Metindeki "sim" ifadeleri ("simülatörde", "simülasyonda") yerine "laboratuvarda" de.

## Laboratuvar etkinliği (`LabActivity`)
Yeri: `apps/web/src/lib/lab/activities/m3-hN.ts` (YALNIZ kendi haftanın dosyası). Tip: `apps/web/src/lib/lab/activity.ts` (okunmalı), örnek: `m3-h1.ts` (Blink). Anahtar: `arduino-temelleri:<hafta>:<ders>`.
- `intro`, `starter()` (taze devre + başlangıç kodu; çoğu derste yalnız `unoOnly()` + iskelet kod), `allowedParts` (yalnız dersin kullandığı parça türleri), `goals`, `solution()` (tüm hedefleri sağlayan devre + kod), gerekirse `scenario()` (YALNIZ TEST: butona bas `s.setProp('btn','pressed',true)`, kaydırıcı oynat, `s.advance(ms)`, `s.sendSerial`).
- **Hedefler** (`LabGoal`): bağlantı hedefleri `analysis.connected/sameNet` ile (yönlü LED iç yolu A→K), parça/özellik hedefleri `circuit` üzerinden, davranış hedefleri (`behavior: true`, yapışkan) `ctx.stats` (`pinEdges['D13']`, `ledToggles[partId]`, `runMs`) ve `ctx.lab` (`parts[id].led.on/brightness`, `buzzer.freqHz`, `servo.angleDeg`, `rgbled`, `pins`, `serial`). Metinler çocuk/gençle uyumlu, kısa, somut; her hedefin `hint`i olsun. Hedefler yaratıcılığı kısıtlamasın (gereksiz katı değer yok); kabul aralıklarını makul tut.
- Bir hedef yalnızca BİR şeyi denetlesin; ilk bakışta anlaşılır olsun. Etkinlik başına 3-7 hedef.
- Bir derste birden çok sketch varsa etkinlik dersin ana/son devresini ve ana sketch'ini hedefler; diğer sketch'ler metinde "Kopyala" ile denenebilir.
- Başlangıç durumunda TÜM hedefler sağlanmamalı; `solution()` hepsini (derlenip çalıştırılınca) sağlamalı. Genel test bunu denetler: `cd apps/web && pnpm vitest run src/lib/lab`.
- Kullanılabilir parça türleri bu aşamada: `uno, led, resistor, button, pot, ldr, ntc, buzzer, rgbled, servo`. Daha fazlası paralel yazılıyor; dersin ihtiyacı varsa raporunda belirt, olmayan parça UYDURMA.

## Test ve teslim
- `node tools/sim/check.mjs modul-3 hN` (sketch'ler) ve `cd apps/web && pnpm vitest run src/lib/lab` (etkinlikler) hem önce hem sonra geçmeli. `npx tsc --noEmit` temiz.
- `content:build` ÇALIŞTIRMA (üretilmiş TypeScript'i koordinatör üretecek). `packages/`, `apps/web/src/components`, `apps/web/src/lib/lab` içindeki ortak dosyalara (activity.ts, goals.ts, contract.ts…) dokunma; eksik bulursan raporla. git ve tam `pnpm build` çalıştırma.
- Rapor (kısa): her ders için ne değişti, etkinlik hedefleri, etkinlik yapılamayan dersler ve nedeni, metinlerde bulduğun olgu hataları, test sonuçları.
