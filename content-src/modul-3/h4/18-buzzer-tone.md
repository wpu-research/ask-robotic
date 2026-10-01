# Buzzer: tone ve nota frekansları
süre: 22

## Merak
Müzik aletlerinin hepsi aynı şeyi yapar: havayı belli bir hızda titretir. Titreşim saniyede kaç kez olursa o notayı duyarız. Bir Arduino pinini saniyede 440 kez açıp kapatırsan hangi notayı çalmış olursun?

## Etkinlik
### Devre
Parçaları laboratuvarda **Parça ekle** menüsünden seç, pinleri kablo çekerek bağla.

| Parça | Bağlantı |
|---|---|
| Pasif buzzer | **+** ucu → **D8**; **-** ucu → GND |

Buzzer iki türdür. **Aktif** buzzer içinde kendi osilatörü vardır: 5 V verince tek bir sabit ses çıkarır. **Pasif** buzzer ise sadece bir hoparlör gibidir; sesin perdesini senin üreteceğin titreşim belirler. Bu derste pasif buzzer kullanıyoruz. Parça eklerken özellik panelinde **Tür: Pasif (tone ile)** seçili olsun (varsayılan budur). Sesi duymak için üstteki ses düğmesini aç.

### Frekans ve nota
Frekans, saniyedeki titreşim sayısıdır; birimi hertz (Hz). Frekans arttıkça ses incelir.

| Nota | Frekans (yaklaşık) |
|---|---|
| Do (C4) | 262 Hz |
| Re (D4) | 294 Hz |
| Mi (E4) | 330 Hz |
| Fa (F4) | 349 Hz |
| Sol (G4) | 392 Hz |
| La (A4) | 440 Hz |
| Si (B4) | 494 Hz |
| Do (C5) | 523 Hz |

Tablodaki son "Do" (C5), ilk "Do"nun (C4) bir **oktav** üstüdür ve frekansı yaklaşık iki katıdır (262 → 523). La notası için de 440 → 880 geçerlidir. Bu tablodaki değerler yuvarlanmıştır; `tone` zaten tam sayı frekans ister.

### tone() komutu
- `tone(pin, frekans)`: pinde o frekansta kare dalga üretir. `noTone(pin)` diyene kadar sürer.
- `tone(pin, frekans, süre)`: `süre` milisaniye çalıp kendiliğinden susar.

Kare dalga, pinin eşit süre HIGH ve LOW olmasıdır (doluluk %50). `tone`, arka planda bir zamanlayıcı (timer) kullandığı için çalarken program akışını **bloklamaz**: komuttan hemen sonraki satır çalışır. Notanın bitmesini beklemek istiyorsan `delay` yazmalısın.

### Program 1: La notası
```cpp
// sketch: buzzer_a4
void setup() {
  tone(8, 440);      // D8'de sürekli 440 Hz (La)
}

void loop() {
}
```

### Program 2: Do majör gam
```cpp
// sketch: buzzer_gam
int notalar[] = {262, 294, 330, 349, 392, 440, 494, 523};

void setup() {
}

void loop() {
  for (int i = 0; i < 8; i++) {
    tone(8, notalar[i], 400);   // 400 ms çal
    delay(500);                 // 100 ms sessizlik dahil 500 ms bekle
  }
  delay(1000);
}
```

### Program 3: Oktav
```cpp
// sketch: buzzer_oktav
void setup() {
}

void loop() {
  tone(8, 440, 400);    // La
  delay(500);
  tone(8, 880, 400);    // bir oktav yukarısı
  delay(500);
  delay(1000);
}
```

### Program 4: tone ve PWM bir arada
`tone` komutu Uno'nun 2 numaralı zamanlayıcısını (Timer2) kullanır. Resmî Arduino belgelerine göre bu, **D3 ve D11'deki `analogWrite` çıkışını bozar.** Bozulma yalnızca `tone` çalarken olur. Bu pinlerde parlaklık ayarı çalışmaz, ama tam açık (255) ya da tam kapalı (0) kullanabilirsin. D9 ve D10 ise etkilenmez.
```cpp
// sketch: buzzer_ve_pwm
void setup() {
  tone(8, 440);            // buzzer çalıyor
  analogWrite(9, 64);      // D9 PWM çalışmaya devam eder (yaklaşık %25)
  analogWrite(11, 255);    // D11 yalnızca tam açık/kapalı olur
}

void loop() {
}
```
RGB LED'imizin kırmızısı D9'da, yeşili D10'da, mavisi D11'de. Proje dersinde bu bilgiyi kullanacağız: nota çalarken mavi kanalı yalnızca açıp kapatacağız.

### Nasıl çalışıyor?
1. `tone(8, 440)` pini saniyede 440 kez HIGH-LOW yapar. Buzzerın zarı bu hızla titreyerek 440 Hz'lik La sesini üretir.
2. Program 2'de `notalar` dizisi tablodaki frekansları taşır; `for` döngüsü sırayla çalar.
3. `tone(8, notalar[i], 400)` 400 ms çalar. `delay(500)` ile 100 ms ara bırakırız; ara olmazsa aynı notalar birbirine karışır.
4. `tone` pini kendisi çıkış yapar; `pinMode` yazmak zorunda değilsin (yazman da zararsız).

### Dene
- Program 2'de gamı tersten çal (`i` değeri 7'den 0'a insin).
- `for (int f = 200; f <= 1000; f += 10) { tone(8, f); delay(10); }` yaz. Sirene benzer bir ses duydun mu?
- Frekansı 20 Hz gibi çok düşük ya da 10000 Hz gibi çok yüksek yapmayı dene. Buzzer neden artık "nota" gibi çalmıyor? (İpucu: buzzerların rahat çaldığı bir aralık vardır.)

### Sık yapılan hatalar
- Aktif buzzer ile `tone` denemek: aktif buzzer her frekansta aynı sesi çıkarır. Notaları duyamıyorsan özellik panelinden buzzerın türünü kontrol et.
- Notadan sonra `delay` koymamak: `tone` beklemez, bir sonraki `tone` öncekini hemen keser. Sadece son nota duyulur.
- `tone` çalarken D3 veya D11'de `analogWrite` ile parlaklık ayarı beklemek: bu pinlerde PWM bozulur (yukarıya bak).
- Buzzerı yanlış pine bağlamak: kodda `tone(8, ...)` yazdıysan buzzerın **+** ucu D8'e kablolanmış olmalı.

## Konuşalım
Aynı La notasını bir gitar ve bir flüt çaldığında neden farklı duyarız? Buzzerın sesi neden hep "bip bip" gibi, enstrüman gibi değil?
