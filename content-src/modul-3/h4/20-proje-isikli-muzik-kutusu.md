# Proje: Işıklı müzik kutusu
süre: 35

## Merak
Müzik kutularında bir kolu çevirirsin, melodi çalar. Senin müzik kutun bir adım ileri gidecek: butona basınca "Küçük yıldız" melodisini çalacak, her nota kendi renginde yanacak, bir potansiyometre ile de hızını ayarlayacaksın. Beklerken mavi bir ışık yavaşça nefes alacak.

## Etkinlik
### Devre
Parçaları laboratuvarda **Parça ekle** menüsünden seç, pinleri kablo çekerek bağla.

| Parça | Bağlantı |
|---|---|
| Pasif buzzer | **+** ucu → **D8**; **-** ucu → GND |
| RGB LED (ortak katot) | **COM** → GND |
| 330 Ω direnç (kırmızı) | **D9** → direncin 1 ucu; 2 ucu → RGB LED **R** ucu |
| 330 Ω direnç (yeşil) | **D10** → direncin 1 ucu; 2 ucu → RGB LED **G** ucu |
| 330 Ω direnç (mavi) | **D11** → direncin 1 ucu; 2 ucu → RGB LED **B** ucu |
| Buton | **A** ucu → **D2**, **B** ucu → GND (`INPUT_PULLUP`) |
| Potansiyometre | **SIG** → **A0**; **VCC** → 5V, **GND** → GND |

Devre çalışırken butona basmak için buton parçasına basılı tut; tempoyu potansiyometrenin **Konum** özelliğinden değiştir.

### Tasarım
- **Bekleme:** Mavi LED yavaşça parlayıp söner (Ders 16'daki nefes).
- **Çalma:** Butona basınca potansiyometreden tempo (dakikada 80-200 vuruş) okunur ve melodi çalınır. Her nota kendi renginde yanar.
- **Bitiş:** Melodi biter, LED söner ve bekleme nefesi yeniden başlar.

Nota renkleri:

| Nota | Frekans | Renk (R, G, B) |
|---|---|---|
| Do | 262 | kırmızı (255, 0, 0) |
| Re | 294 | turuncu (255, 80, 0) |
| Mi | 330 | sarı (255, 200, 0) |
| Fa | 349 | yeşil (0, 255, 0) |
| Sol | 392 | camgöbeği (0, 255, 255) |
| La | 440 | mavi (0, 0, 255) |

Ders 18'de öğrendiğin kurala dikkat: `tone` çalarken D11'de (mavi) parlaklık ayarı yapılamaz. Bu yüzden tablodaki mavi değerleri yalnızca 0 ya da 255'tir. Kırmızı (D9) ve yeşil (D10) ise ince ayar yapabilir; turuncu ve sarının tonu buradan gelir.

### Program
```cpp
// sketch: muzik_kutusu
const int BUZZER = 8;
const int KIRMIZI = 9;
const int YESIL = 10;
const int MAVI = 11;
const int BUTON = 2;
const int NOTA_SAYISI = 14;

int melodi[]  = {262, 262, 392, 392, 440, 440, 392,
                 349, 349, 330, 330, 294, 294, 262};
int uzunluk[] = {1, 1, 1, 1, 1, 1, 2,
                 1, 1, 1, 1, 1, 1, 2};

int parlak = 0;     // bekleme nefesinin şu anki parlaklığı
int yon = 5;        // +5: parlıyor, -5: sönüyor

void renkAyarla(int r, int g, int b) {
  analogWrite(KIRMIZI, r);
  analogWrite(YESIL, g);
  analogWrite(MAVI, b);       // tone çalarken yalnız 0 ya da 255 olmalı
}

void notaRengi(int frekans) {
  switch (frekans) {
    case 262: renkAyarla(255, 0, 0); break;     // do: kırmızı
    case 294: renkAyarla(255, 80, 0); break;    // re: turuncu
    case 330: renkAyarla(255, 200, 0); break;   // mi: sarı
    case 349: renkAyarla(0, 255, 0); break;     // fa: yeşil
    case 392: renkAyarla(0, 255, 255); break;   // sol: camgöbeği
    case 440: renkAyarla(0, 0, 255); break;     // la: mavi
    default:  renkAyarla(255, 255, 255);        // bilinmeyen nota: beyaz
  }
}

void notaCal(int frekans, int sure) {
  notaRengi(frekans);
  tone(BUZZER, frekans, sure * 9 / 10);
  delay(sure);
  renkAyarla(0, 0, 0);
}

int tempoOku() {
  return map(analogRead(A0), 0, 1023, 80, 200);   // dakikadaki vuruş
}

void melodiCal(int bpm) {
  int vurus = 60000 / bpm;                         // bir vuruşun süresi (ms)
  for (int i = 0; i < NOTA_SAYISI; i++) {
    notaCal(melodi[i], uzunluk[i] * vurus);
  }
}

void bekleNefesi() {
  parlak = parlak + yon;
  if (parlak >= 255) {
    parlak = 255;
    yon = -5;
  }
  if (parlak <= 0) {
    parlak = 0;
    yon = 5;
  }
  analogWrite(MAVI, parlak);
  delay(10);
}

void setup() {
  pinMode(BUZZER, OUTPUT);
  pinMode(KIRMIZI, OUTPUT);
  pinMode(YESIL, OUTPUT);
  pinMode(MAVI, OUTPUT);
  pinMode(BUTON, INPUT_PULLUP);
  Serial.begin(9600);
}

void loop() {
  if (digitalRead(BUTON) == LOW) {     // basılı = LOW
    int bpm = tempoOku();
    Serial.print("tempo: ");
    Serial.println(bpm);
    melodiCal(bpm);
  } else {
    bekleNefesi();
  }
}
```

### Nasıl çalışıyor?
1. `loop()` yalnızca karar verir: buton basılıysa melodiyi çalar, değilse bekleme nefesini bir adım ilerletir. İş fonksiyonlara bölündüğü için `loop()` kısadır ve okunur.
2. `tempoOku()` potansiyometreyi `map` ile 80-200 aralığına çevirir. Pot ortadayken yaklaşık 140 vuruş/dakika çıkar; `60000 / 140` ile bir vuruş yaklaşık 428 ms olur.
3. `notaCal` önce `notaRengi` ile LED'i boyar, sonra `tone` ile notayı çalar. `delay(sure)` notanın bitmesini bekler, sonra LED söndürülür.
4. `notaRengi` içindeki `switch`, frekansa göre rengi seçer. Dizilere yeni nota eklersen buraya da yeni `case` eklemelisin.
5. `bekleNefesi` her çağrıda parlaklığı 5 birim değiştirir; 0 ile 255 arasında gidip gelir. Her adım 10 ms sürdüğü için `loop()` hızlı döner ve buton basışları gecikmeden fark edilir. Melodi sırasında buton okunmaz; çünkü `delay` programı bekletir.
6. Melodi bittiğinde buton hâlâ basılıysa melodi yeniden başlar; butonu bırakırsan bekleme nefesine dönülür.

### Dene
- Mavi kanalı melodide de kullanmak için Si (494) ve üst Do (523) notalarını ekle. Si için mor (255, 0, 255), üst Do için beyaz (255, 255, 255) yazabilirsin; `switch` içine `case 494:` ve `case 523:` eklemeyi unutma.
- İkinci bir buton (D3) ekle ve basılınca farklı bir melodi çalsın. Melodiyi parametre olarak alan bir `melodiCal` yazman gerekecek. İpucu: iki ayrı dizi ve bir dizi seçici.
- Melodi bittikten sonra tüm renklerden geçen bir gökkuşağı bitiş efekti için `bitisEfekti()` fonksiyonu yaz.

### Sık yapılan hatalar
- Mavi için `analogWrite(MAVI, 128)` yazıp `tone` çalarken yarım parlaklık beklemek: o sırada D11'de PWM çalışmaz. 0 ya da 255 kullan.
- `case` sonuna `break;` koymamak: `switch` bir sonraki renge de düşer ve renkler karışır.
- Potansiyometrenin orta bacağını A0 yerine başka bir yere bağlamak: tempo hep aynı kalır.
- Buzzerı D3 ya da D11'e bağlamak: bu projede D8'de olmalı. D11 mavi LED içindir.
- Her notanın arasına boşluk koymamak: aynı notalar peş peşe gelince tek uzun nota gibi duyulur. Kodda `sure * 9 / 10` bu boşluğu bırakır.

## Konuşalım
Melodi çalarken butonlara basarsan program neden tepki vermiyor? Hem melodi çalıp hem butonu izlemenin bir yolu olabilir mi? (Bunu ileriki derslerde çözeceğiz.)
