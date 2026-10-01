# Proje: Kare ve sekiz çizen robot
süre: 35

## Merak
Çizim robotları, yerde ilerleyen oyuncak "kaplumbağalar" ve fabrika taşıyıcıları aynı zor işi yapar: bir şekil çizip tam başladıkları yere dönmek. Kare görünüşte kolaydır: dört kenar, dört köşe. Ama her köşede küçük bir dönüş hatası yapılırsa son kenar başlangıç noktasından uzakta biter. Bu projede robotuna kare ve ardından sekiz çizdiriyorsun, sonra başlangıç noktasından kaç santimetre uzakta durduğunu ölçüyorsun.

## Etkinlik
### Ne yapacağız?
Bu proje bu haftanın tüm derslerini ve önceki haftalardan kavramları birleştirir:
- **Hafta 4, ders 91-92:** İki enkoder, kesmeyle tık sayma (Modül 3 ders 29'daki kesme kuralları), tık → mesafe.
- **Hafta 4, ders 93:** Sayaç farkına göre P düzeltmesi: iki tekerlek eşit yol alsın.
- **Hafta 4, ders 94:** Odometri: `x`, `y`, `θ` tahmini.
- **Hafta 1, ders 76-78:** Diferansiyel sürüş ve PWM ölü bölgesi (%20 ≈ 51).

Robot önce kenarı 0,5 m olan bir kare çizer: 0,5 m ileri, 90° sola dön, bu dört kez. Sonra iki daireden oluşan bir sekiz çizer. Her şeklin sonunda robot **başlangıç noktasına dönüş hatasını** yazar.

### Devre
Modül 5 standart bağlantıları:

| Parça | Bağlantı |
|---|---|
| Sol motor | EN **D5** (PWM), IN1 **D7**, IN2 **D8** |
| Sağ motor | EN **D6** (PWM), IN3 **D9**, IN4 **D10** |
| Sol enkoder | **D2** (kesme pini), VCC → 5 V, GND → GND |
| Sağ enkoder | **D3** (kesme pini), VCC → 5 V, GND → GND |
| Güç | Motorlar için ayrı pil, ortak GND |

Güvenlik: Motorları Arduino'nun 5 V pininden besleme. Pili kısa devre yapma, ters bağlama. Şebeke gerilimiyle (220 V) asla devre kurma. Gerçek robotu önce yerden kaldırıp test et, sonra geniş ve boş bir zemine koy.

### Plan: önce geometri
**Dönüş.** Robot yerinde dönerken iki tekerlek **zıt yönde** aynı yolu alır. Robotun merkezi yerinde kalır; her tekerlek, yarıçapı `L/2` olan bir dairenin yayını çizer. 90° için yay uzunluğu:

```
yay = açı · yarıçap = (π/2) · (L/2) = 1,5708 · 0,06 m ≈ 9,42 cm  →  ≈ 9,1 tık
```

Yani her tekerlek 9 tık kadar döner: sol geri, sağ ileri (sola dönüş için). Ama 94. derste gördüğün gibi bir tık = 5° belirsizlik demek. Bu yüzden dönüş miktarını tıklarla değil, **odometrinin açısı `th` ile** hedefliyoruz: `yay = (hedefYön − th) · L/2`. Dört dönüşün hedefi mutlak: 90°, 180°, 270°, 360°. Bir köşede 4° şaşarsan sonraki köşe bunu düzeltir; hata birikmez.

**Düz yol.** İki tekerlek eşit yol alır (93. dersteki gibi, P düzeltmeli).

**Daire.** Merkez çizgisi yarıçapı `R = 0,25 m` olan bir daire için içteki tekerleğin yarıçapı `R − L/2`, dıştaki `R + L/2`:

```
iç yol  = 2π · (0,25 − 0,06) = 1,194 m   (≈ 115 tık)
dış yol = 2π · (0,25 + 0,06) = 1,948 m   (≈ 188 tık)
```

İki tekerlek aynı anda başlayıp aynı anda bitmeli; yani dıştaki içtekinden daha hızlı dönmeli. Hız oranı = yol oranı = 0,613. Bunu 93. dersteki fikirle sağlıyoruz: iki tekerleğin tamamladığı **yüzdeler** eşit kalsın.

**Tek fonksiyon hepsini yapar.** `hareket(hSol, hSag)`: sol tekerlek `hSol` metre, sağ tekerlek `hSag` metre yol alsın (eksi = geri).
- Düz: `hareket(0.5, 0.5)`.
- Yerinde sola dön: `hareket(-yay, +yay)`.
- Sol daire: `hareket(ic, dis)`. Sağ daire: `hareket(dis, ic)`.

İçeride her turda: odometriyi güncelle, "bitenin oranı"na göre iki tekerleğin PWM'ini hesapla, hata varsa (öndeki tekerlek fazla gitmişse) onu kıs, geridekini artır, hedefe yaklaşırken yavaşla.

PWM'i hesaplarken ölü bölgeyi (51) hesaba katıyoruz (78. ders): PWM 51'in altında motor dönmez. İçteki tekerleğin hızı dıştakinin %61'i olsun diye PWM'i doğrudan 0,61 ile çarpmak yanlış olur; ölü bölgenin üstündeki kısmı çarparız: `PWM = 51 + (v − 51) · oran`.

**Yavaşlama.** Hedefe 5 cm kala hâlâ tam hızla gidersen motor kayarak durduğunda fazla yol alırsın (91. ders). Bu yüzden kalan yol küçüldükçe PWM düşer (en az 60). Durma payı kısalır, tık hassasiyeti yeterli olur.

### Program
```cpp
// sketch: kare_sekiz
const int EN_SOL = 5, IN1 = 7, IN2 = 8;
const int EN_SAG = 6, IN3 = 9, IN4 = 10;
const int ENK_SOL = 2, ENK_SAG = 3;

const float TIK_M = 2 * PI * 0.033 / 20;   // bir tıkın mesafesi (m)
const float L = 0.12;                      // iki tekerlek arası (m)
const int OLU_BOLGE = 51;                  // ders 78: PWM'in %20'si
const float KP = 1000.0;                   // yay hatası (m) başına PWM

volatile unsigned int tikSol = 0;
volatile unsigned int tikSag = 0;
unsigned int oncekiSol = 0, oncekiSag = 0;
int yonSol = 1, yonSag = 1;

float x = 0, y = 0, th = 0;                // odometri tahmini (m, m, rad)
float segSol = 0, segSag = 0;              // hareketin başından beri tekerlek yolları
unsigned long sonIz = 0;

void sayiSol() { tikSol++; }
void sayiSag() { tikSag++; }

unsigned int oku(volatile unsigned int &sayac) {
  noInterrupts();
  unsigned int kopya = sayac;
  interrupts();
  return kopya;
}

void motor(int en, int a, int b, int pwm) {      // pwm: -255..255
  digitalWrite(a, pwm > 0);
  digitalWrite(b, pwm < 0);
  analogWrite(en, abs(pwm));
}

void surus(int solPwm, int sagPwm) {
  motor(EN_SOL, IN1, IN2, solPwm);
  motor(EN_SAG, IN3, IN4, sagPwm);
  if (solPwm != 0) yonSol = solPwm > 0 ? 1 : -1;
  if (sagPwm != 0) yonSag = sagPwm > 0 ? 1 : -1;
}

void odometriGuncelle() {
  unsigned int s = oku(tikSol), g = oku(tikSag);
  float dsSol = yonSol * (int)(s - oncekiSol) * TIK_M;
  float dsSag = yonSag * (int)(g - oncekiSag) * TIK_M;
  oncekiSol = s; oncekiSag = g;

  float ds = (dsSol + dsSag) / 2;
  float dth = (dsSag - dsSol) / L;
  x += ds * cos(th + dth / 2);
  y += ds * sin(th + dth / 2);
  th += dth;
  segSol += dsSol;
  segSag += dsSag;

  if (millis() - sonIz >= 250) {                 // iz: x,y (cm)
    sonIz = millis();
    Serial.print("IZ ");
    Serial.print(x * 100, 0);
    Serial.print(' ');
    Serial.println(y * 100, 0);
  }
}

void bekle(unsigned long ms) {
  unsigned long t = millis();
  while (millis() - t < ms) odometriGuncelle();
}

// Sol tekerlek hSol, sağ tekerlek hSag metre yol alsın (işaret = yön).
// İki yol oranını enkoder farkıyla korur, hedefe yaklaşırken yavaşlar.
void hareket(float hSol, float hSag, int pwmBuyuk) {
  segSol = 0; segSag = 0;
  float aSol = fabs(hSol), aSag = fabs(hSag);
  float buyuk = max(aSol, aSag);
  float oranSol = aSol / buyuk, oranSag = aSag / buyuk;
  int isaretSol = hSol < 0 ? -1 : 1;
  int isaretSag = hSag < 0 ? -1 : 1;

  while (true) {
    odometriGuncelle();
    float biten = (fabs(segSol) + fabs(segSag)) / (aSol + aSag);
    float kalan = buyuk * (1 - biten);
    if (kalan <= TIK_M / 2) break;               // yarım tık hassasiyet

    int v = constrain(60 + (int)(600 * kalan), 60, pwmBuyuk);   // yaklaşırken yavaşla
    float hata = fabs(segSol) * oranSag - fabs(segSag) * oranSol;  // >0: sol önde
    int pSol = OLU_BOLGE + (v - OLU_BOLGE) * oranSol - KP * hata;
    int pSag = OLU_BOLGE + (v - OLU_BOLGE) * oranSag + KP * hata;
    surus(isaretSol * constrain(pSol, 0, 255), isaretSag * constrain(pSag, 0, 255));
  }
  surus(0, 0);
  bekle(300);                                    // robot kayarak dursun, tıklar sayılsın
}

void ileri(float metre) { hareket(metre, metre, 200); }

void yonuHedefle(float hedefTh) {                // yerinde dön: yay = açı * L/2
  float yay = (hedefTh - th) * L / 2;
  hareket(-yay, yay, 140);
}

void rapor(const char* ad, float x0, float y0) {
  Serial.print(ad);
  Serial.print(" hata(tahmin) cm: ");
  Serial.print(hypot(x - x0, y - y0) * 100, 1);
  Serial.print(" aci: ");
  Serial.println(th * 180 / PI, 1);
}

void setup() {
  Serial.begin(9600);
  pinMode(EN_SOL, OUTPUT); pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT);
  pinMode(EN_SAG, OUTPUT); pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT);
  pinMode(ENK_SOL, INPUT); pinMode(ENK_SAG, INPUT);
  attachInterrupt(digitalPinToInterrupt(ENK_SOL), sayiSol, RISING);
  attachInterrupt(digitalPinToInterrupt(ENK_SAG), sayiSag, RISING);
  bekle(500);

  // 1) Kare: 0,5 m ileri, 90 derece sol, dört kez
  float x0 = x, y0 = y;
  for (int i = 1; i <= 4; i++) {
    ileri(0.5);
    yonuHedefle(i * PI / 2);                     // mutlak hedef: hatalar birikmez
  }
  rapor("KARE", x0, y0);

  // 2) Sekiz: yarıçapı 0,25 m iki daire; önce sola, sonra sağa
  x0 = x; y0 = y;
  const float R = 0.25;
  float ic = 2 * PI * (R - L / 2);               // iç tekerleğin çember yolu
  float dis = 2 * PI * (R + L / 2);
  hareket(ic, dis, 180);                         // sol daire: sol tekerlek içte
  hareket(dis, ic, 180);                         // sağ daire: sağ tekerlek içte
  rapor("SEKIZ", x0, y0);
  Serial.println("BITTI");
}

void loop() {}
```

### Nasıl çalışıyor?
1. `odometriGuncelle()` 94. dersteki hesabı yapar. Ayrıca her 250 ms'de `IZ x y` satırı yazar; bu robotun izlediği yolun kaydıdır.
2. `hareket()` bitişi **iki tekerleğin yüzdesinden** anlar: `biten = (|segSol| + |segSag|) / (hedefSol + hedefSag)`. `hata`, öndeki tekerleğin oranlı olarak fazla gittiği yoldur; PWM'e `KP · hata` eklenir ya da çıkarılır (93. ders). `KP = 1000 PWM/m`: 1 tık (1 cm) fark yaklaşık 10 PWM demektir.
3. `kalan <= TIK_M / 2`: kalan yol yarım tıktan azsa dur. Tam sıfırı beklemek (örneğin 9,09 tık yerine 10. tıkı) robotu yaklaşık 5° fazla döndürürdü.
4. `yonuHedefle()` hedef açıyı mutlak alır. Son köşede hedef 360° (= 2π) olduğu için robot başladığı yöne bakar.
5. İlk daire sola, ikincisi sağa döner; iki dairenin birleştiği nokta başlangıç noktasıdır. Bu bir "8" şekli: iki daire tek noktada birleşiyor.

### Sonuç: başlangıca dönüş hatası
Program seri monitöre iki satır yazar:

```
KARE hata(tahmin) cm: 2.4 aci: 356.4
SEKIZ hata(tahmin) cm: 0.1 aci: 356.4
BITTI
```

Bu, robotun **kendi tahminidir**. Benzetim robotun gerçek konumunu da bildiği için gerçek hatayı ölçebiliriz (gerçek robotta şeridi metre ya da bir kâğıt üstüne çizilmiş iz kullanırsın). İki robotla, sağ tekerlek verimi %100 ve %93 (`gain`) iken:

| Sağ tekerlek verimi | Kare: başlangıca uzaklık | Kare: son yön | Sekiz: başlangıca uzaklık |
|---|---|---|---|
| %100 | 2,2 cm | 357° | 0,4 cm |
| %93 | 2,2 cm | 357° | 0,7 cm |

Kare çevresi 2 m. 2 cm hata, çevrenin yüzde 1'i. Sebebi: her dönüşte tık çözünürlüğü (5°) ve robotun kayarak durması. Bunu "kusursuz" saymak yanlış olur; **tolerans** koymamız gerek.

**Tolerans.** Benzetimde ölçtüğümüz en kötü sonuç 2,2 cm. Bir tık 1 cm ve yön hassasiyeti 5° olduğuna göre iki kat pay vererek şunu kabul edelim: **şekil sonunda başlangıçtan en çok 5 cm uzak, yön hatası en çok 8°.** Gerçek bir robotta kayma, tozlu zemin, pil gerilimi gibi etkiler olacağından 5 cm'i tutturmak çok daha zor olur; gerçek robotta toleransı kendi ölçümünle belirle.

Düzeltmenin gerçekten işe yaradığını görmek için aynı programda `KP = 0.0` yap (yay hatası düzeltmesi kapanır, tekerleklere yalnızca oranlı PWM gider) ve sağ verim %93 iken çalıştır:
- Kare: başlangıca uzaklık **10,3 cm**.
- Sekiz: başlangıca uzaklık **19,5 cm**.

Düzeltmeyle 2,2 cm ve 0,7 cm olmuştu. Demek ki 93. dersteki P düzeltmesi bu projenin can damarı.

### İz kaydı: ileride 3D'ye aktarım
Benzetim, robotun yolunu her 20 ms'de bir `[x, y, yön]` olarak kaydeder (`robot.state.trail`). Bizim programımız da odometriden aynı yolu `IZ x y` satırlarıyla yazıyor. Benzetimdeki gerçek iz kaydında kare yaklaşık 0,5 × 0,5 m'lik bir kutu, sekiz ise 0,5 × 1,0 m'lik bir kutu çiziyor; programın `IZ` satırları da aynı şekli veriyor. Bu iz, ileride 3D bir robotun hareketini yönlendirmek ve gerçek ile sanal yolu karşılaştırmak için kullanılabilir. 3D robot henüz bağlı değil; şimdilik hedef, yolun doğru kaydedilmesi.

### Dene
- Kenarı 0,5 m yerine 0,3 m yap. Başlangıca dönüş hatası nasıl değişti?
- Kareyi **sağa** döndürerek çiz: `yonuHedefle(-i * PI / 2)`. Neden hedefler eksi?
- Daire yarıçapını `R = 0.25`'ten `0.20`'ye indir. Hangi tekerlek daha az yol alır? İç ve dış yolu elle hesapla, sonra programdaki `ic` ve `dis` ile karşılaştır.
- Yeni bir şekil dene: eşkenar üçgen. Dış açısı kaç derece?

### Sık yapılan hatalar
- Dönüşü açı yerine sabit "tık sayısı" ile yapmak: her dönüş farklı hata verir, hata birikir.
- Dönüş sırasında odometriyi güncellemeyi unutmak.
- Dönüş hedefini "mevcut açı + 90°" yapmak: hata birikir. Mutlak hedef kullan.
- PWM'i ölü bölgeyi hesaba katmadan oranlamak: içteki tekerlek hiç dönmeyebilir.
- Durma payını hesaba katmamak: son tıkları saymadan odometriyi okumak.
- Şeklin başlangıcını ölçmeyi unutup "kare kapandı" demek.

### Gerçek robotta farklı olabilecekler
Benzetimdeki hatalar yalnız tık çözünürlüğü ve kayarak durmadan gelir. Gerçek robotta ek olarak tekerlek kayması, yarıçap ve aks aralığı ölçüm hatası ve pil düştükçe değişen hız vardır (94. ders). Bu yüzden gerçek robotun hatası burada ölçtüğümüzden belirgin biçimde büyük olabilir; şekil kapanmayabilir. Sekiz bu yüzden iyi bir testtir: hata iki daire boyunca birikir.

## Konuşalım
Kare tamamlandığında robot başlangıçtan 2 cm uzaktaydı ve bunu enkoderden biliyordu. Gerçek hata 8 cm olsaydı robot bunu fark edebilir miydi? Hangi ek sensör yardımcı olurdu?
