# Bitirme robotu: proje seçimi ve tasarım
süre: 35

## Merak
Bir arkadaşın robotunun "çok iyi çalıştığını" söylüyor. İyi çalışmak ne demek? Çarpmadan mı gitti, hızlı mı, her seferinde mi? Ölçülemeyen bir iddia ne kanıtlanabilir ne de çürütülebilir. Mühendisler işe başlamadan önce "bitti" kelimesinin neye karşılık geldiğini yazar. Bugün sen de bitirme robotunun sınavını, robotu yapmadan önce yazacaksın.

## Etkinlik
### Üç yol
Bu hafta tek bir proje yapacaksın ve üç yoldan birini seçeceksin. Üçünün de bitiş çizgisi sayılarla yazılıdır.

| Yol | Robot | Ne yapacak? | Kabul ölçütü | Dayandığı haftalar |
|---|---|---|---|---|
| A | Otonom araç | Çizgiyi izleyip çizginin bittiği yerden sonra engelden kaçarak bitiş çizgisine gidecek | Engelli ve çizgili parkuru **çarpmadan** bitirir ve bitiş çizgisinde durur | Hafta 1 (sürüş), Hafta 2 (engel), Hafta 3 (çizgi) |
| B | Robot kol | İki eksenli kolun ucu üç noktaya sırayla gidecek: P1'den parçayı alır, P2'den geçirir, P3'e bırakır | Üç noktada uç noktası hatası **5 mm'den az** | Hafta 7 (108-109. dersler: servo, ters kinematik, al-bırak) |
| C | Takip robotu | Önündeki hedefe 20 cm mesafeyi koruyacak, hedef kaybolunca duracak | Hedefi **20 cm ± 3 cm** mesafede takip eder | Hafta 2 (mesafe sensörü), Hafta 5 (PID) |

Nasıl seçeceğini bil: A yolu en çok parçayı birleştirir; kod uzun, sınama senaryosu çok. B yolu araba gerektirmez, matematiği öne çıkarır ve en kesin ölçülür. C yolu en küçüğüdür ama PID'i gerçekten ayarlamayı ister. Üçünün de ölçütü aynı ciddiyettedir; "kolay" bir yol yoktur, farklı bir zorluk vardır.

### Devre
Pinler Modül 5'in standart bağlantılarıdır. Seçtiğin yolun tablosunu kur.

**Yol A: otonom araç**

| Parça | Bağlantı |
|---|---|
| Sol motor (L298N ya da TB6612 sürücüsü) | EN **D5** (PWM), IN1 **D7**, IN2 **D8** |
| Sağ motor | EN **D6** (PWM), IN3 **D9**, IN4 **D10** |
| HC-SR04 | TRIG **D11**, ECHO **D12**, VCC 5 V, GND |
| 5 adet çizgi sensörü (TCRT5000) | **A0** (en sol) ... **A4** (en sağ), aralarında 2 cm |
| Tamponlar (isteğe bağlı) | **D2**, **D3** (`INPUT_PULLUP`, basılı = LOW) |

**Yol B: robot kol**

| Parça | Bağlantı |
|---|---|
| Omuz servosu | Sinyal **D9** |
| Dirsek servosu | Sinyal **D10** |
| Tutucu servosu | Sinyal **D11** |
| Servoların gücü | Harici 5 V kaynak; eksi ucu Arduino GND'sine bağlı (ortak GND) |

**Yol C: takip robotu**

| Parça | Bağlantı |
|---|---|
| Sol ve sağ motor | Yol A ile aynı: D5, D7, D8 ve D6, D9, D10 |
| HC-SR04 | TRIG **D11**, ECHO **D12** |

**Güç uyarısı:** Motorları ve servoları Arduino'nun 5 V pininden besleme; harici kaynak kullan ve kaynağın GND'sini Arduino GND'sine bağla (ortak GND). Pilleri kısa devre yapma, ters bağlama; şüphe duyduğunda yetişkin yardımı iste. Şebeke gerilimiyle (220 V) hiçbir devre kurma. Yol B'nin servo pinleri (D9-D11) sürüş motorlarının pinleriyle çakışır; bu yüzden kol ayrı bir düzenektir, aynı Arduino'da araba ile birlikte kurulmaz.

### Örnek parkur ve sahne
Derslerdeki ölçümler simülatörde şu sahnelerle yapıldı. Kendi robotunda benzerini kağıt ve bantla kurabilirsin.

| Yol | Sahne |
|---|---|
| A | 2,4 m × 1,6 m alan. Siyah çizgi 1,3 m'ye kadar (küçük bir kıvrımla), sonra çizgisiz boşluk. 1,75 m'de ortada duran 65 cm'lik engel duvarı. 2,05 m'de bitiş çizgisi (yolu baştan başa kesen çapraz çizgi) |
| B | Kol tabanı orijin; üç nokta (cm): P1 (12; 4), P2 (8; 10), P3 (4; 12). Kolun iki bölümü de 10 cm |
| C | Öndeki hedef geniş bir karton levha. Başta robota 44 cm uzakta; sonra 3 cm/sn hızla uzaklaşır |

### Tasarım belgesi şablonu
Aşağıdaki şablon bir sayfadır. Kodun ilk satırını yazmadan önce doldur. Boş bıraktığın her kutu, sonradan bir tartışmanın nedeni olur.

```text
PROJE: ____________________        YOL: A / B / C        TARİH: ________

1. AMAÇ (tek cümle)
   ______________________________________________

2. GEREKSİNİMLER (her biri ölçülebilir olmalı)
   No  | Gereksinim                     | Kabul ölçütü            | Nasıl ölçülür?
   G1  | ...                            | ... (sayı + birim)      | ...
   G2  | ...                            | ...                     | ...
   G3  | ...                            | ...                     | ...

3. ALT SİSTEMLER
   Ad          | Görevi              | Arayüzü (fonksiyon)      | Tek başına testi
   Sürüş       | ...                 | surus(sol, sag)          | ...
   ...

4. DURUM MAKİNESİ (durum, ne yapar, nasıl çıkılır)
   ...

5. TEST PLANI
   No  | Senaryo                        | Beklenen sonuç          | Ölçülen | Geçti mi?
   T1  | ...                            | ...                     |         |
   T2  | ...                            | ...                     |         |

6. RİSKLER VE B PLANI
   ...
```

Şablonun nasıl dolduğunu görmek için C yolu için kısa bir örnek:

```text
PROJE: Takip robotu          YOL: C

1. AMAÇ: Öndeki hedefe 20 cm mesafeyi koruyan, hedef kaybolunca duran robot.

2. GEREKSİNİMLER
   G1 | Hedef yavaşça uzaklaşırken mesafe  | 17 cm ile 23 cm arası   | Hedef-sensör gerçek mesafesi, cetvel
   G2 | Hedef kaybolunca durma             | 3 cm'den az ilerler     | Başlangıç ve bitiş konumu, cetvel
   G3 | Hedef dönünce yeniden takip        | 10 sn içinde 17-23 cm   | Cetvel

3. ALT SİSTEMLER
   Sürüş  | Motorları sür         | surus(sol, sag)  | 1 sn ileri: yol 15-30 cm
   Mesafe | Önü ölç (ortanca)     | mesafe()         | Duvar 50 cm: okuma 49-51 cm
   PID    | Hatadan hız üret      | (loop içinde)    | Duran hedef: 10 sn sonra 17-23 cm

4. DURUM MAKİNESİ
   BEKLE -> TAKIP (hedef göründü) -> KAYIP (0,5 sn hedef yok) -> TAKIP (hedef döndü)

5. TEST PLANI
   T1 | Hedef 3 cm/sn uzaklaşır      | 17-23 cm     | ...
   T2 | Sağ motor %5 zayıf           | 17-23 cm     | ...
   T3 | Hedef kaybolur               | < 3 cm       | ...
```

Bu şablon gerçek bir belgedir; ders 113'te test planını simülatörde bu sütunlarla dolduracaksın.

### Program
Ölçütleri sayıya dökünce "geçti mi, kaldı mı" kararını bir program bile verebilir. Aşağıdaki sketch üç yolun kabul ölçütünü kodlar. Ölçtüğün değerleri seri porttan yazarsın, o da karar verir. Ders 115'te bitirme sonuçlarını bununla sınayacaksın.

```cpp
// sketch: kabul_olcut
// Ölçüm sonuçlarını seri porttan gir, kabul ölçütüne göre GEÇTİ / KALDI yazsın.
//   A <carpma> <bitti>      örnek: A 0 1      (bitti: 1 = parkuru bitirdi)
//   B <en_buyuk_hata_mm>    örnek: B 3.2
//   C <en_kucuk_cm> <en_buyuk_cm>   örnek: C 18.4 21.9
const float KOL_ESIK_MM = 5.0;       // hata bunun ALTINDA olmalı
const float TAKIP_HEDEF_CM = 20.0;
const float TAKIP_PAY_CM = 3.0;

void sonucYaz(char yol, bool gecti) {
  Serial.print("yol ");
  Serial.print(yol);
  Serial.println(gecti ? ": GECTI" : ": KALDI");
}

void setup() {
  Serial.begin(9600);
  Serial.setTimeout(50);
  Serial.println("hazir");
}

void loop() {
  if (Serial.available() == 0) return;
  char yol = Serial.read();
  if (yol == 'A') {
    int carpma = Serial.parseInt();
    int bitti = Serial.parseInt();
    sonucYaz('A', carpma == 0 && bitti == 1);
  } else if (yol == 'B') {
    float hata = Serial.parseFloat();
    sonucYaz('B', hata < KOL_ESIK_MM);
  } else if (yol == 'C') {
    float enKucuk = Serial.parseFloat();
    float enBuyuk = Serial.parseFloat();
    sonucYaz('C', enKucuk >= TAKIP_HEDEF_CM - TAKIP_PAY_CM && enBuyuk <= TAKIP_HEDEF_CM + TAKIP_PAY_CM);
  }
}
```

### Nasıl çalışıyor?
1. Her satır bir yol harfiyle başlar. Sketch harfi `Serial.read()` ile alır, sayıları `parseInt` ve `parseFloat` ile okur (9. dersteki gibi).
2. **A yolu:** çarpma sayısı 0 **ve** parkuru bitirmiş olmalı. Hiç çarpmadan olduğu yerde duran robot da çarpmamıştır ama bitirmemiştir; bu yüzden iki koşul `&&` ile birleşir.
3. **B yolu:** "5 mm'den az" ifadesi katıdır. Tam 5,0 mm ölçersen kaldın; sketch bu yüzden `<` kullanır, `<=` kullanmaz.
4. **C yolu:** 20 cm ± 3 cm, yani 17 ile 23 arası ve sınırlar dahil. Takip boyunca ölçülen **en küçük** ve **en büyük** mesafe bu aralığın içinde kalmalıdır; ortalaması iyi olan ama bir an 12 cm'e yaklaşmış robot kalır.
5. Ölçütler `const` olarak en üstte durur. Ölçütü değiştirmek istersen tek yeri değiştirirsin ve bunu tasarım belgesine yazarsın.

### Dene
- Tasarım belgesi şablonunu seçtiğin yol için doldur. Her gereksinimin yanına bir sayı ve bir ölçüm yöntemi yaz. "Hızlı olsun" gibi bir cümle varsa sayıya çevir.
- Seri monitörden `C 17 23`, `C 16.9 20`, `B 4.9`, `B 5` yaz. Hangileri geçer? Sebebini kendi cümlenle açıkla.
- Sketch'e dördüncü bir ölçüt ekle (örneğin A yolu için "en çok 20 sn"). Hangi sayıyı gireceksin ve neden o eşiği seçtin?

### Sık yapılan hatalar
- Ölçülemeyen gereksinim yazmak: "düzgün gitsin", "hassas olsun". Yanına sayı ve birim yoksa gereksinim değildir, dilektir.
- Ölçütü sonuç açıklandıktan sonra gevşetmek. Ölçüt değişecekse nedeni belgeye yazılır ve değişiklik tüm testlere uygulanır.
- Yol A için tamponlarla enkoderi aynı anda kullanmaya çalışmak: ikisi de D2 ve D3'ü ister.
- Servo ya da motoru Arduino'nun 5 V pininden beslemek: Arduino resetlenir ya da kart zarar görür. Harici güç ve ortak GND kullan.
- Üç yolun hepsini birden yapmaya kalkmak. Bir yolu ölçütleriyle bitirmek, üçünü yarım bırakmaktan iyidir.

## Konuşalım
Bir ölçütü, robot tutturamadığı için sonradan gevşetmek ne zaman dürüst bir karardır, ne zaman kendini kandırmaktır? Hangi bilgiyi belgeye yazarsan ikisini ayırt edebilirsin?
