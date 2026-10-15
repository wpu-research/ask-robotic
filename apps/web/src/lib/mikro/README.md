# Mikro Kart (lib/mikro)

Sanal 5x5 LED'li küçük kartın motoru, blok seti, kod üreticisi ve etkinlik altyapısı. **Tamamen bizim kodumuzdur**; dış bir
blok/oyun editörünün kodu, adı, görseli ya da blok adlandırması kullanılmaz. Arayüzde modül adı "Mikro Kart"tır. Portal tamamen
sanaldır: gerçek donanım yoktur. Hedef kitle 8-14 yaş.

Saf TypeScript (Blockly ve React hariç): Node'da başsız çalışır, Vitest ile test edilir. `eval`/`Function` kullanılmaz.

## Dosyalar

| Dosya | Görev |
|---|---|
| `types.ts` | `MikroProject`, `WorkspaceState`, `PBlock`, `RadioMessage`, `DeviceEvent` |
| `blocks.ts` | Özel blok tanımları (`SPECS`), Blockly JSON'u, araç kutusu (`toolboxJson`), kategoriler |
| `runtime.ts` + `ops.ts` | Yorumlayıcı: yerleşik bloklar (`runtime.ts`), özel bloklar (`ops.ts`) |
| `device.ts` | Sanal kart: LED, düğmeler, logo, pinler, ivme, pusula, sensörler, ses, radyo, konsol |
| `sim.ts` | `Simulation`: 1-2 kart + radyo ortamı + sanal zaman |
| `codegen.ts` | Bloklardan JavaScript / Python (salt okunur görünüm) |
| `goals.ts`, `activity.ts`, `scenario.ts` | Etkinlik hedefleri, `MikroActivity`, başsız senaryo |
| `activities/index.ts` | Örnek etkinlikler (ders yazarı şablonu) ve kayıt (`MIKRO_ACTIVITIES`) |
| `examples.ts` | Serbest atölye örnek galerisi (12 proje) |
| `storage.ts` | localStorage (`ask:mikro:project:v1`) + JSON içe/dışa aktarma ve doğrulama |
| `program.ts` | Blok kurucu (`b`, `onStart`, `onButton`, `project`...) ve dolaşma yardımcıları |
| `robot.ts` | Robot gövdesi (`DriveBase`): pinsiz diferansiyel sürüş, Blok Robotu / Mini Gezgin profilleri, mesafe, renk, çizgi, tampon sensörleri |
| `robot-ops.ts` | `rb_*` blok işleyicileri (sensör okuması 1 ms sürer; sensör yoklayan döngü zamanı ilerletir) |
| `robot-missions.ts` | Robot Atölyesi görevleri ve sahneleri; `evaluateMission` (sayfa: `app/robot-atolyesi`) |
| `font.ts`, `icons.ts`, `music.ts`, `messages.ts`, `audio.ts` | 5x5 yazı tipi, simgeler/oklar, notalar/ezgiler, Türkçe Blockly metinleri, WebAudio |

Arayüz: `components/mikro/` (`MikroEditor`, `BlocklyPane`, `Board`, `SimPanel`), sayfa: `app/mikro-kart/page.tsx`.

## Proje biçimi

`MikroProject = { version: 1, name, workspace }`. `workspace`, Blockly'nin `serialization.workspaces.save()` çıktısıdır
(`{ blocks: { blocks: [...] }, variables: [...] }`). Yorumlayıcı ve kod üretici doğrudan bu JSON'u okur; ayrı bir ara biçim yoktur.
Kapalı (disabled) bloklar yok sayılır. Proje yalnız tarayıcıda saklanır (`localStorage`, anahtar `ask:mikro:project:v1`).

## Çalışma modeli

- **Olay tabanlı.** Üst düzey *başlık* blokları görev (generator) olur. Başlıksız yığınlar çalışmaz (editörde soluk görünür).
- `başlangıçta` bir kez çalışır; bitince `sonsuza kadar` görevleri ve `her N ms` zamanlayıcıları başlar. Başlangıç bitmeden gelen
  olaylar (en çok 16) bekletilir.
- `sonsuza kadar` her turun sonunda 20 ms bekler. Bir olay işleyicisi çalışırken aynı olay gelirse en çok 3 tanesi sıraya girer.
  Farklı işleyiciler birlikte (kooperatif) çalışır.
- **Sanal zaman.** `Simulation.advance(ms)` zamanı 10 ms kuantumlarla ilerletir. Arayüz gerçek süreyle, testler istediği hızla sürer.
  `bekle`, kaydırmalı yazı, nota çalma, ezgi, sus: zamanı bırakır.
- **Sınırlar.** Beklemeden ardışık 1.000.000 adım ("döngüye bekle ekle" hatası), toplam 100.000.000 adım, görev başına 2000 adımda
  zorunlu dilim sonu (arayüz donmaz), kare başına 10 ms gerçek süre bütçesi, özyineleme derinliği 40. Hata olursa program durur,
  `sim.error = { message, blockId, card }` dolar; editör hatalı bloğu kırmızı vurgular.
- **Rastgelelik** tohumludur (`seed`); testlerde tekrarlanabilir.
- **İki kart.** İkinci kart *aynı programı* çalıştırır (aynı kodu iki karta yüklemek gibi). Radyo mesajı aynı gruptaki diğer karta 10 ms
  sonra ulaşır. Dışarıdan mesaj: `sim.injectRadio(kart, msg)`. Arayüzde ikinci kartın grubu "Programdan" ya da elle seçilebilir.

### Zamanlamalar ve sabitler

| Davranış | Değer |
|---|---|
| Kaydırmalı yazı | 90 ms / sütun; yazı bitene kadar bloğu bekletir, sonra ekran temizlenir |
| Tek harf/rakam | ortalı sabit gösterilir, 600 ms bekler, sonra temizlenir |
| `simgeyi göster`, `LED'leri göster`, `oku göster`, `LED yak`... | beklemez (zinciri `bekle` ile kendin yavaşlat) |
| Vuruş | tempo (vuruş/dk) ile çeyrek vuruş = 60000/tempo ms; varsayılan tempo 120, ses seviyesi 128 |
| Uzun basış | 1000 ms |
| Sallama | olay anında; ivme okumaları 500 ms titrer |
| Radyo | yazı en çok 32, ad en çok 12 karakter; grup 0-255; sinyal gücü sabit 200 |
| Liste numaraları | **0'dan başlar**; `liste.length` sırasına yazmak öğe ekler, aralık dışı numara hata verir |

### Sanal kart

- **LED**: 25 LED, parlaklık 0-255, genel `ekran parlaklığı` çarpanı. `x` 0-4 soldan sağa, `y` 0-4 yukarıdan aşağı. Sınır dışı yazma yok sayılır.
- **Düğmeler**: `A`, `B`, `A+B` (`AB`). İkisi birlikte basılınca yalnız `AB` olayı üretilir. Olay türleri: `press`, `release`, `long`.
- **Logo** ve **pinler (P0, P1, P2)**: dokunma olayları `touch` / `release`. Pinler ayrıca dijital (0/1) ve analog (0-1023) giriş değeri taşır
  (dokunuluyorsa 1 / 1023 okunur); çıkışlar dijital, analog, servo (0-180) olarak yazılır ve kartta gösterilir.
- **İvmeölçer** (milli-g, x/y/z): dinlenirken yüzü yukarı = (0, 0, 1024). Hazır duruşlar: `tiltLeft` x=-1024, `tiltRight` x=+1024,
  `tiltForward` y=+1024, `tiltBack` y=-1024, `faceUp` z=+1024, `faceDown` z=-1024, `freeFall` ~0, `shake` (hareket). Bir eksen ≥700 ise o duruş algılanır.
  `eğim(boy)` = atan2(y, z), `eğim(yan)` = atan2(x, z) (derece). Duruş değişince `gesture:<ad>` olayı çıkar.
- **Pusula** 0-359 (0 = kuzey, saat yönü), **sıcaklık** -5..50, **ışık** 0-255, **ses seviyesi** 0-255: arayüzdeki kaydırıcılardan.
- **Hoparlör**: `Device.soundHook` ile WebAudio'ya bağlanır (`audio.ts`); başsız çalışmada yalnız günlüğe yazılır.
- **Konsol**: `konsola yaz` satırları `device.serial`.
- **Günlük** (`device.log`, `device.frames`): hedefler ve testler okur (`text`, `number`, `icon`, `tone`, `melody`, `rest`, `radioSend`, `radioRecv`, `serial`, `pin`, `input`).

## Blok listesi

Özel blok türleri `mk_` ile başlar. "JavaScript" sütunu üretilen kodun biçimidir; Python karşılığı fonksiyon adlarını snake_case
yazar (`screen.showNumber` -> `screen.show_number`). Argüman adları (⟨…⟩) Blockly giriş/alan adlarıdır; etkinlik yazarken `b('tür', { i: {ADI: değer}, f: {ADI: alan} })` kullanılır.
Açılır liste alanlarının değerleri koddaki metindir (ör. düğme `"A"`, `"AB"`; olay `"press"`).

Kategori anahtarları: Temel, Giriş, LED, Müzik, Radyo, Döngü, Mantık, Değişken, Matematik, Metin, Liste, Fonksiyon, Pinler.
Radyo reporter'ları (`alınan sayı/yazı/ad/değer`, `sinyal gücü`) `radyo mesajı alınınca` içinde o mesajı, dışında son mesajı okur.
`mk_map` sonucu en yakın tamsayıya yuvarlar. `mk_show_bar` değeri yukarıdan aşağı değil **aşağıdan yukarı** 25 LED'e dağıtır.
Alan değerleri: `mk_play_note` `NOTE` = nota adı (`Alçak Do` ... `Tiz Si`), `BEATS` = çeyrek vuruş sayısı (`0.25`, `0.5`, `1`, `2`, `4`, `8`);
`mk_play_melody` `MEL` = `ode`, `twinkle`, `fanfare`, `sad`, `alarm`, `up`, `down`, `jingle`, `chirp`; `mk_show_icon` `ICON` = `icons.ts` kimlikleri
(`heart`, `smallHeart`, `happy`, `sad`, `surprised`, `asleep`, `yes`, `no`, `arrowUp/Down/Left/Right`, `square`, `diamond`, `triangle`, `house`, `target`, `ghost`, `skull`, `butterfly`, `cat`, `note`, `sun`);
`mk_show_arrow` `DIR` = `N NE E SE S SW W NW`; `mk_show_leds` `LEDS` = 25 karakter `0/1` (satır satır).

## JavaScript ve Python görünümü

Üretilen kod **kendi API'mizi** kullanır ve salt okunurdur (çalıştırma bloklardan yapılır; üretilen kod çalıştırılmaz).
Tüm değişkenler en üstte `0` ile bildirilir; Python'da işlevlerde atanan değişkenler için `global` yazılır. `for` döngüsünün yönü,
`kaçtan`/`kaça` sabitse yönüne göre seçilir (blok ise ikisinden birine göre artan/azalan kendisi karar verir).

```js
card.onStart(() => { ... })              // başlangıçta
card.forever(() => { ... })              // sonsuza kadar
card.every(1000, () => { ... })          // her 1000 ms
card.onButton("A", "press", () => { })   // "A" | "B" | "AB"; "press" | "release" | "long"
card.onGesture("shake", () => { })       // shake tiltLeft tiltRight tiltForward tiltBack faceUp faceDown freeFall
card.onLogo("touch", () => { })          // "touch" | "release"
card.onPin("P0", "touch", () => { })
card.onRadio(() => { })
wait(500)
screen.showNumber(5); screen.showText("Merhaba"); screen.showIcon("heart"); screen.showLeds(["01010", ...]); screen.clear()
screen.plot(x, y); screen.unplot(x, y); screen.plotBrightness(x, y, 128); screen.toggle(x, y); screen.isOn(x, y); screen.getBrightness(x, y)
screen.setBrightness(255); screen.showBar(v, max); screen.showArrow("N"); screen.showArrowAngle(deg)
input.buttonPressed("A"); input.isGesture("shake"); input.logoTouched(); input.acceleration("x"|"y"|"z"|"strength"); input.tilt("pitch"|"roll")
input.compass(); input.temperature(); input.lightLevel(); input.soundLevel(); input.runningTime()
music.playNote("Do", 1); music.playTone(440, 1); music.ringTone(440); music.stop(); music.rest(1); music.playMelody("ode")
music.setTempo(120); music.setVolume(128); music.note("Do"); music.tempo()
radio.setGroup(1); radio.sendNumber(1); radio.sendText("x"); radio.sendValue("ad", 1)
radio.received("number"|"text"|"name"|"value"); radio.signalStrength()
pins.isTouched("P0"); pins.digitalRead("P0"); pins.digitalWrite("P0", 1); pins.analogRead("P0"); pins.analogWrite("P0", 512); pins.servo("P0", 90)
randomInt(a, b); randomBool(); mapRange(v, a, b, c, d); toNumber(x); lists.indexOf(list, x); console.log(x)
```

Python aynı adları snake_case kullanır (`card.on_button("A", "press", fn)`, `screen.show_text(...)`, `random_int`, `map_range`, `to_number`,
`print(x)`); olay işleyicileri `def` ile tanımlanıp `card.on_*(..., fn)` ile kaydedilir. Başlıksız yığınlar yorum satırı olarak çıkar.

## Etkinlik yazımı

`lib/mikro/activity.ts` içindeki tip:

```ts
interface MikroActivity {
  intro?: string                       // kısa yönerge
  starter(): MikroProject              // her çağrıda taze proje
  allowedBlocks?: string[]             // palet; yoksa hepsi (aşağıya bak)
  goals: MikroGoal[]
  solution(): MikroProject             // YALNIZ TEST: tüm hedefleri sağlar
  scenario?: (s: MikroScenario) => void // YALNIZ TEST: çözüm çalışırken yapılacaklar
  cards?: 1 | 2                        // varsayılan 1
}
```

**Kayıt anahtarı** diğer etkinlikler gibi `"<modül slug>:<hafta>:<ders>"` olmalıdır; `activities/index.ts` içindeki `MIKRO_ACTIVITIES`
sözlüğüne eklenir (`getMikroActivity(key)`). Şu an yalnız `ornek:*` anahtarlı 5 örnek vardır.

**allowedBlocks**: blok türleri listesi (`mk_*` ve yerleşik adlar). Kategori yalnız izinli blok içeriyorsa görünür. `Değişken` ve `Fonksiyon`
kategorileri için `variables_set`/`variables_get` ya da `procedures_defnoreturn` vb. verilmesi yeterlidir (tüm dinamik blokları açar).
Düz sayı/yazı/doğru-yanlış blokları (`math_number`, `text`, `logic_boolean`) gölge değer olarak her zaman kullanılabilir ama paletin
görünür listesinde yalnız verildiyse çıkar; `liste`/`çevir` gibi gölgesiz girişler için bunları da ekle.
`ALL_BLOCK_TYPES` (blocks.ts) bütün türleri verir.

**Hedefler** (`goals.ts`). Hepsi `(id, metin, ...)` alır; `hint` isteğe bağlıdır:

| Üretici | Anlamı |
|---|---|
| `usesBlocks(id, text, types, {any?})` | Programda bu blok türleri bulunmalı (canlı, sticky değil) |
| `ledPattern(id, text, rows, {card?})` | Ekranda bu 5x5 desen bir an göründü (`rows`: `['01010', ...]`) |
| `ledPatterns`, `ledCount(id,text,min)` | Birkaç desen / en az `min` LED yanan kare |
| `showsText(id, text, 'Merhaba' \| /regex/)`, `showsNumber(id, text, 3 \| fn)` | Yazı / sayı gösterildi |
| `playsSound(id, text, {freq?, melody?, min?})` | Nota/ezgi çalındı |
| `radioSent(id, text, {kind?, card?, where?})`, `radioReceived(...)` | Radyo iletildi / alındı |
| `afterInput(id, text, 'button:A:press', pred)`, `afterInputPattern(id, text, key, rows)` | Girdi olayından SONRA bir şey oldu |
| `variableIs(id, text, 'sayi', 3 \| fn)` | Değişken değeri |
| `serialHas`, `pinWritten(id, text, 'P0', 'servo', pred)` | Konsol / pin çıkışı |
| `custom(id, text, ctx => boolean, {sticky?})` | Serbest ölçüt; `ctx = { sim, ws }` |

Olay anahtarları: `button:A:press`, `button:AB:long`, `gesture:shake`, `logo:touch`, `pin:P0:touch`, `radio`.
Hedefler **çalışma sırasında ve durunca** değerlendirilir; davranış hedefleri **sticky**'dir (bir kez sağlanınca program değişene kadar
"tamam" kalır). `usesBlocks` ve `sticky: false` olanlar canlı değerlendirilir. Değerlendirme: `evaluateGoals(goals, { sim, ws }, stickyDone)`.

**Senaryo** (yalnız test; öğrencinin yapacağı etkileşimler): `s.press('A', holdMs?, card?)`, `s.shake()`, `s.gesture('tiltLeft')`,
`s.touchLogo()`, `s.touchPin('P0')`, `s.setSensor('temperature', 35)`, `s.setCompass(90)`, `s.setPinInput('P1', 700)`, `s.radio(card, msg)`,
`s.advance(ms)`, `s.device(card)`. Verilmezse çözüm 3 sn çalıştırılır. **Not:** kaydırmalı yazı ve ezgi gerçek sürelidir; senaryoda yeterince `advance` et.

**Proje kurucu** (`program.ts`): `project(ad, [yığınlar])`; `onStart(...)`, `forever(...)`, `onButton('A', [...])`, `hatBlock('mk_on_gesture', [...], {G:'shake'})`,
`b('mk_plot', { i: {X: 1, Y: 2} })`, `setVar`, `changeVar`, `getVar`, `ifThen`, `repeat`, `whileLoop`, `forRange`, `forEach`, `cmp`, `arith`, `logicOp`, `listOf`, `funcDef`, `callFunc`.

**Genel test** (`activities.test.ts`, her kayıtlı etkinlik için otomatik): hedefler dolu ve benzersiz · `starter()` taze nesne ·
starter hedefleri sağlamaz (sticky hedeflerin hiçbiri) · `solution()` tüm hedefleri sağlar ve hata vermez · çözüm yalnız izinli blokları kullanır ·
JS/Python üretilir. Yeni etkinlik kaydedilince bu testler ona da uygulanır.

**Arayüze bağlama** (ders oynatıcı):

```tsx
<MikroEditor activity={a} storageKey={`ask:mikro:ders:${key}`} onGoalsChange={(goals, allDone) => ...} />
```

`storageKey` etkinliğe özel olmalıdır (serbest atölye `ask:mikro:project:v1` kullanır). Bileşen bulunduğu kabın tam genişlik ve yüksekliğini
doldurur (`height: 100%`, en az 640 px; 900 px altı genişlikte tek sütun ve içeriğe göre uzar).

## Test

`cd apps/web && npx tsc --noEmit && pnpm vitest run src/lib/mikro`. Motor, blok tanımları, kod üretimi, aygıt ve etkinlikler başsız Node'da test edilir.

## Bilinen sınırlar

- JavaScript/Python görünümleri salt okunurdur; kodu düzenleyip bloklara çevirme yoktur.
- `for` döngüsü kodu, sınırlar dinamikse artan yönü varsayar (bloğun kendisi iki yönü de destekler).
- `%` (kalan) ve yuvarlama, üretilen Python'da dil kurallarına göre farklı davranabilir (negatif sayılar); blok davranışı JavaScript gibidir.
- İkinci kart aynı programı çalıştırır; farklı program yüklenemez. Radyo yalnız iki kart ve dışarıdan mesajla sınanır.
- Ses yalnız tarayıcıda (WebAudio), ilk etkileşimden sonra çalar.

## Blok referansı (otomatik üretildi)

#### Temel

| Blok türü | Görünüm | Tür | JavaScript |
|---|---|---|---|
| `mk_on_start` | başlangıçta | başlık | `card.onStart()` |
| `mk_forever` | sonsuza kadar | başlık | `card.forever()` |
| `mk_every` | her ⟨MS⟩ ms'de | başlık | `card.every(MS)` |
| `mk_show_number` | sayıyı göster ⟨VALUE⟩ | deyim | `screen.showNumber(VALUE)` |
| `mk_show_text` | yazıyı göster ⟨TEXT⟩ | deyim | `screen.showText(TEXT)` |
| `mk_show_icon` | simgeyi göster ⟨ICON⟩ | deyim | `screen.showIcon(ICON)` |
| `mk_show_leds` | LED'leri göster ⟨LEDS⟩ | deyim | `screen.showLeds(LEDS)` |
| `mk_clear` | ekranı temizle | deyim | `screen.clear()` |
| `mk_pause` | bekle ⟨MS⟩ ms | deyim | `wait(MS)` |
| `mk_serial` | konsola yaz ⟨TEXT⟩ | deyim | `console.log(TEXT)` |

#### Giriş

| Blok türü | Görünüm | Tür | JavaScript |
|---|---|---|---|
| `mk_on_button` | düğme ⟨BTN⟩ ⟨EV⟩ | başlık | `card.onButton(BTN, EV)` |
| `mk_on_gesture` | kart ⟨G⟩ | başlık | `card.onGesture(G)` |
| `mk_on_logo` | logoya ⟨EV⟩ | başlık | `card.onLogo(EV)` |
| `mk_button_is` | ⟨BTN⟩ düğmesi basılı mı? | mantık | `input.buttonPressed(BTN)` |
| `mk_gesture_is` | kart ⟨G⟩ mu? | mantık | `input.isGesture(G)` |
| `mk_logo_is` | logoya dokunuluyor mu? | mantık | `input.logoTouched()` |
| `mk_accel` | ivme (⟨AXIS⟩) | değer | `input.acceleration(AXIS)` |
| `mk_tilt` | eğim (⟨AXIS⟩) derece | değer | `input.tilt(AXIS)` |
| `mk_compass` | pusula yönü (derece) | değer | `input.compass()` |
| `mk_temperature` | sıcaklık (°C) | değer | `input.temperature()` |
| `mk_light` | ışık seviyesi | değer | `input.lightLevel()` |
| `mk_sound` | ses seviyesi | değer | `input.soundLevel()` |
| `mk_runtime` | çalışma süresi (ms) | değer | `input.runningTime()` |

#### LED

| Blok türü | Görünüm | Tür | JavaScript |
|---|---|---|---|
| `mk_plot` | LED yak x ⟨X⟩ y ⟨Y⟩ | deyim | `screen.plot(X, Y)` |
| `mk_unplot` | LED söndür x ⟨X⟩ y ⟨Y⟩ | deyim | `screen.unplot(X, Y)` |
| `mk_plot_brightness` | LED x ⟨X⟩ y ⟨Y⟩ parlaklığı ⟨B⟩ | deyim | `screen.plotBrightness(X, Y, B)` |
| `mk_toggle` | LED x ⟨X⟩ y ⟨Y⟩ durumunu değiştir | deyim | `screen.toggle(X, Y)` |
| `mk_led_on` | LED x ⟨X⟩ y ⟨Y⟩ yanıyor mu? | mantık | `screen.isOn(X, Y)` |
| `mk_led_brightness` | LED x ⟨X⟩ y ⟨Y⟩ parlaklığı | değer | `screen.getBrightness(X, Y)` |
| `mk_set_brightness` | ekran parlaklığını ⟨B⟩ yap | deyim | `screen.setBrightness(B)` |
| `mk_show_bar` | çubuk grafik ⟨V⟩ / en çok ⟨MAX⟩ | deyim | `screen.showBar(V, MAX)` |
| `mk_show_arrow` | oku göster ⟨DIR⟩ | deyim | `screen.showArrow(DIR)` |
| `mk_show_arrow_deg` | oku ⟨ANGLE⟩ derece yönünde göster | deyim | `screen.showArrowAngle(ANGLE)` |

#### Müzik

| Blok türü | Görünüm | Tür | JavaScript |
|---|---|---|---|
| `mk_play_note` | ⟨NOTE⟩ notasını ⟨BEATS⟩ vuruş çal | deyim | `music.playNote(NOTE, BEATS)` |
| `mk_play_tone` | ⟨FREQ⟩ Hz sesini ⟨BEATS⟩ vuruş çal | deyim | `music.playTone(FREQ, BEATS)` |
| `mk_ring` | ⟨FREQ⟩ Hz sesi sürekli çal | deyim | `music.ringTone(FREQ)` |
| `mk_stop_sound` | sesi durdur | deyim | `music.stop()` |
| `mk_rest` | ⟨BEATS⟩ vuruş sus | deyim | `music.rest(BEATS)` |
| `mk_play_melody` | ezgiyi çal ⟨MEL⟩ | deyim | `music.playMelody(MEL)` |
| `mk_set_tempo` | tempoyu ⟨BPM⟩ yap (vuruş/dk) | deyim | `music.setTempo(BPM)` |
| `mk_set_volume` | ses seviyesini ⟨V⟩ yap (0-255) | deyim | `music.setVolume(V)` |
| `mk_note` | nota ⟨NOTE⟩ | değer | `music.note(NOTE)` |
| `mk_tempo` | tempo | değer | `music.tempo()` |

#### Radyo

| Blok türü | Görünüm | Tür | JavaScript |
|---|---|---|---|
| `mk_on_radio` | radyo mesajı alınınca | başlık | `card.onRadio()` |
| `mk_radio_group` | radyo grubunu ⟨G⟩ yap | deyim | `radio.setGroup(G)` |
| `mk_radio_send_number` | radyoyla sayı gönder ⟨VALUE⟩ | deyim | `radio.sendNumber(VALUE)` |
| `mk_radio_send_text` | radyoyla yazı gönder ⟨TEXT⟩ | deyim | `radio.sendText(TEXT)` |
| `mk_radio_send_value` | radyoyla ⟨NAME⟩ = ⟨VALUE⟩ gönder | deyim | `radio.sendValue(NAME, VALUE)` |
| `mk_radio_recv` | alınan ⟨KIND⟩ | değer | `radio.received(KIND)` |
| `mk_radio_signal` | sinyal gücü | değer | `radio.signalStrength()` |

#### Döngü

| Blok türü | Görünüm | Tür | JavaScript |
|---|---|---|---|

Yerleşik: `controls_repeat_ext`, `controls_whileUntil`, `controls_for`, `controls_forEach`, `controls_flow_statements`

#### Mantık

| Blok türü | Görünüm | Tür | JavaScript |
|---|---|---|---|
| `mk_random_bool` | yazı tura (rastgele doğru/yanlış) | mantık | `randomBool()` |

Yerleşik: `controls_if`, `logic_compare`, `logic_operation`, `logic_negate`, `logic_boolean`, `logic_ternary`

#### Değişken

| Blok türü | Görünüm | Tür | JavaScript |
|---|---|---|---|

Yerleşik (dinamik): `variables_get`, `variables_set`, `math_change`

#### Matematik

| Blok türü | Görünüm | Tür | JavaScript |
|---|---|---|---|
| `mk_minmax` | ⟨A⟩ ve ⟨B⟩ arasında ⟨OP⟩ | değer | `Math.{OP}({A}, {B})` |
| `mk_map` | ⟨V⟩ değerini ⟨A⟩-⟨B⟩ aralığından ⟨C⟩-⟨D⟩ aralığına eşle | değer | `mapRange(V, A, B, C, D)` |

Yerleşik: `math_number`, `math_arithmetic`, `math_modulo`, `math_single`, `math_round`, `math_constrain`, `math_random_int`, `math_number_property`

#### Metin

| Blok türü | Görünüm | Tür | JavaScript |
|---|---|---|---|
| `mk_text_length` | ⟨TEXT⟩ uzunluğu | değer | `String({TEXT}).length` |
| `mk_text_char` | ⟨TEXT⟩ yazısının ⟨INDEX⟩ numaralı harfi | değer | `String({TEXT}).charAt({INDEX})` |
| `mk_to_number` | ⟨X⟩ sayıya çevir | değer | `toNumber(X)` |
| `mk_to_text` | ⟨X⟩ yazıya çevir | değer | `String({X})` |

Yerleşik: `text`, `text_join`

#### Liste

| Blok türü | Görünüm | Tür | JavaScript |
|---|---|---|---|
| `mk_list_get` | ⟨LIST⟩ listesinde ⟨INDEX⟩ numaralı öğe | değer | `{(LIST)}[{INDEX}]` |
| `mk_list_set` | ⟨LIST⟩ listesinde ⟨INDEX⟩ numaralı öğeyi ⟨VALUE⟩ yap | deyim | `{(LIST)}[{INDEX}] = {VALUE};` |
| `mk_list_add` | ⟨LIST⟩ listesine ⟨ITEM⟩ ekle | deyim | `{(LIST)}.push({ITEM});` |
| `mk_list_remove` | ⟨LIST⟩ listesinden ⟨INDEX⟩ numaralı öğeyi sil | deyim | `{(LIST)}.splice({INDEX}, 1);` |
| `mk_list_length` | ⟨LIST⟩ listesinin uzunluğu | değer | `{(LIST)}.length` |
| `mk_list_index` | ⟨LIST⟩ listesinde ⟨ITEM⟩ kaçıncı? | değer | `lists.indexOf(LIST, ITEM)` |
| `mk_list_has` | ⟨LIST⟩ listesinde ⟨ITEM⟩ var mı? | mantık | `{(LIST)}.includes({ITEM})` |

Yerleşik: `lists_create_with`

#### Fonksiyon

| Blok türü | Görünüm | Tür | JavaScript |
|---|---|---|---|

Yerleşik (dinamik): `procedures_defnoreturn`, `procedures_defreturn`, `procedures_callnoreturn`, `procedures_callreturn`, `procedures_ifreturn`

#### Pinler

| Blok türü | Görünüm | Tür | JavaScript |
|---|---|---|---|
| `mk_on_pin` | ⟨PIN⟩ pinine ⟨EV⟩ | başlık | `card.onPin(PIN, EV)` |
| `mk_pin_touched` | ⟨PIN⟩ pinine dokunuluyor mu? | mantık | `pins.isTouched(PIN)` |
| `mk_pin_dread` | ⟨PIN⟩ dijital oku (0/1) | değer | `pins.digitalRead(PIN)` |
| `mk_pin_dwrite` | ⟨PIN⟩ dijital yaz ⟨VALUE⟩ | deyim | `pins.digitalWrite(PIN, VALUE)` |
| `mk_pin_aread` | ⟨PIN⟩ analog oku (0-1023) | değer | `pins.analogRead(PIN)` |
| `mk_pin_awrite` | ⟨PIN⟩ analog yaz ⟨VALUE⟩ | deyim | `pins.analogWrite(PIN, VALUE)` |
| `mk_pin_servo` | ⟨PIN⟩ servo açısı ⟨ANGLE⟩ | deyim | `pins.servo(PIN, ANGLE)` |
