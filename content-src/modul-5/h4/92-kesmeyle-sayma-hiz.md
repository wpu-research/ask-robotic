# Kesmeyle sayma ve hız hesabı
süre: 25

## Merak
Bir sürücü gösterge panelinde "28 km/s" yazıyor. Aracın içinde hız ölçen ayrı bir alet yok; yalnızca tekerleğin dönüşünü sayan bir sensör var. Hız, "yol bölü süre"dir. Peki robot saniyede binlerce işi yaparken, tıkları kaçırmadan sayıp hızı nasıl hesaplarız? Pencere kısa olursa ne olur, uzun olursa ne olur?

## Etkinlik
### Kesme tıkı kaçırmaz
91. derste tıkları `attachInterrupt` ile saydın. Aynı yöntem burada da geçerli: kesme fonksiyonu **kısa** olmalı (yalnız sayacı artır), `loop()` ise sayaçları okuyup hesabı yapmalı. Kesme içinde `Serial.print` ya da uzun hesap yapma (Modül 3, ders 29).

Hız formülü:

```
hız = Δtık · tık_mesafesi / Δt
```

`Δtık` = bir **pencere** içinde gelen tık sayısı, `Δt` = pencerenin süresi. Pencere 100 ms (0,1 s) olsun ve tık mesafesi 1,037 cm. Pencerede 3 tık geldiyse:

```
hız = 3 · 1,037 cm / 0,1 s ≈ 31,1 cm/s
```

### Devre
91. dersteki devreyle aynı: motorlar D5/D7/D8 ve D6/D9/D10, enkoderler D2 (sol) ve D3 (sağ). Motorlar için ayrı güç ve ortak GND'yi unutma.

### Program
Robot iki motoru PWM 200 ile sürer. Program her 100 ms'de tık farkını alıp iki tekerleğin hızını yazar. `delay` yok; zamanı `millis()` ile ölçüyoruz (Modül 3, ders 27).

```cpp
// sketch: hiz_olc
const int EN_SOL = 5, IN1 = 7, IN2 = 8;
const int EN_SAG = 6, IN3 = 9, IN4 = 10;
const int ENK_SOL = 2, ENK_SAG = 3;

const float TIK_M = 2 * PI * 0.033 / 20;
const unsigned long PENCERE_MS = 100;

volatile unsigned int tikSol = 0;
volatile unsigned int tikSag = 0;

void sayiSol() { tikSol++; }
void sayiSag() { tikSag++; }

unsigned int oku(volatile unsigned int &sayac) {
  noInterrupts();
  unsigned int kopya = sayac;
  interrupts();
  return kopya;
}

unsigned long sonOlcum = 0;
unsigned int oncekiSol = 0, oncekiSag = 0;

void setup() {
  Serial.begin(9600);
  pinMode(EN_SOL, OUTPUT); pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT);
  pinMode(EN_SAG, OUTPUT); pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT);
  pinMode(ENK_SOL, INPUT); pinMode(ENK_SAG, INPUT);
  attachInterrupt(digitalPinToInterrupt(ENK_SOL), sayiSol, RISING);
  attachInterrupt(digitalPinToInterrupt(ENK_SAG), sayiSag, RISING);

  digitalWrite(IN1, HIGH); digitalWrite(IN2, LOW);
  digitalWrite(IN3, HIGH); digitalWrite(IN4, LOW);
  analogWrite(EN_SOL, 200);
  analogWrite(EN_SAG, 200);
}

void loop() {
  unsigned long simdi = millis();
  if (simdi - sonOlcum >= PENCERE_MS) {
    float dt = (simdi - sonOlcum) / 1000.0;     // gerçek geçen süre (s)
    sonOlcum = simdi;

    unsigned int s = oku(tikSol), g = oku(tikSag);
    unsigned int dSol = s - oncekiSol;          // pencerede gelen tık
    unsigned int dSag = g - oncekiSag;
    oncekiSol = s; oncekiSag = g;

    float vSol = dSol * TIK_M / dt;             // m/s
    float vSag = dSag * TIK_M / dt;

    Serial.print("t="); Serial.print(simdi);
    Serial.print(" dtik="); Serial.print(dSol);
    Serial.print(" vSol="); Serial.print(vSol * 100, 1);
    Serial.print(" vSag="); Serial.println(vSag * 100, 1);
  }
}
```

Seri çıktının ilk satırları (cm/s):

```
t=100 dtik=1 vSol=10.4 vSag=10.4
t=200 dtik=3 vSol=31.1 vSag=31.1
t=300 dtik=2 vSol=20.7 vSag=20.7
t=400 dtik=3 vSol=31.1 vSag=31.1
t=500 dtik=3 vSol=31.1 vSag=31.1
t=600 dtik=2 vSol=20.7 vSag=20.7
```

### Nasıl çalışıyor?
1. `oncekiSol` son pencerenin sonundaki sayacı tutar. `s - oncekiSol` o pencerede gelen tık sayısıdır. İşaretsiz çıkarma, sayaç 65535'ten 0'a dönse bile doğru fark verir (millis'te gördüğün taşma kuralı, Modül 3 ders 27).
2. `dt` olarak 0,1 yazmak yerine gerçekte geçen süreyi kullandık. `loop()` başka işle meşgulse pencere 100 ms'den biraz uzun olabilir; formül yine doğru kalır.
3. Hız yalnız **tam sayıda tık** ile hesaplanır. Pencerede 2 tık varsa 20,7 cm/s, 3 tık varsa 31,1 cm/s çıkar; arası yoktur.

### Gerçekle karşılaştırma
Benzetim robotun gerçek tekerlek hızını da bilir (`wL · yarıçap`). Aynı koşuda gerçek hız, ilk yarım saniyelik hızlanmadan sonra **28,8 cm/s** (tekerlek 8,7 rad/s · 3,3 cm) oldu. Ölçümümüz 2 ve 3 tık arasında gidip geldi: 20,7 ve 31,1 cm/s. Ortalaması gerçeğe yakın (28,8), ama tek bir ölçüm gerçeğin 8 cm/s kadar altında ya da üstünde olabilir.

Bunun nedeni **nicemleme**: sayaç yalnız tam sayı verir. Çözünürlük:

```
en küçük hız adımı = tık_mesafesi / pencere = 1,037 cm / 0,1 s ≈ 10,4 cm/s
```

Yani 100 ms pencerede hızı en iyi ihtimalle 10,4 cm/s'lik basamaklarla görürsün.

### Pencere seçimi: gürültü ile gecikme
Pencereyi uzatırsan basamak küçülür: 500 ms'de 1,037 / 0,5 ≈ 2,1 cm/s. Ama hız değişirse ölçüm geç tepki verir; 500 ms'lik bir ortalama, yarım saniye öncesini de içerir.

Aşağıdaki program robotu **düşük hızda** (PWM 100) sürer ve iki hesabı yan yana yazar: son 100 ms'lik ve son 500 ms'lik (5 pencerelik) hız.

```cpp
// sketch: hiz_pencere
const int EN_SOL = 5, IN1 = 7, IN2 = 8;
const int EN_SAG = 6, IN3 = 9, IN4 = 10;
const int ENK_SOL = 2, ENK_SAG = 3;

const float TIK_M = 2 * PI * 0.033 / 20;
const unsigned long PENCERE_MS = 100;
const int N = 5;                                // uzun pencere = 5 kısa pencere

volatile unsigned int tikSol = 0;
volatile unsigned int tikSag = 0;

void sayiSol() { tikSol++; }
void sayiSag() { tikSag++; }

unsigned int oku(volatile unsigned int &sayac) {
  noInterrupts();
  unsigned int kopya = sayac;
  interrupts();
  return kopya;
}

unsigned int gecmis[N];                         // son N ölçümdeki sol sayaç
int sira = 0;
unsigned long sonOlcum = 0;

void setup() {
  Serial.begin(9600);
  pinMode(EN_SOL, OUTPUT); pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT);
  pinMode(EN_SAG, OUTPUT); pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT);
  pinMode(ENK_SOL, INPUT); pinMode(ENK_SAG, INPUT);
  attachInterrupt(digitalPinToInterrupt(ENK_SOL), sayiSol, RISING);
  attachInterrupt(digitalPinToInterrupt(ENK_SAG), sayiSag, RISING);

  digitalWrite(IN1, HIGH); digitalWrite(IN2, LOW);
  digitalWrite(IN3, HIGH); digitalWrite(IN4, LOW);
  analogWrite(EN_SOL, 100);                     // düşük hız
  analogWrite(EN_SAG, 100);
}

void loop() {
  unsigned long simdi = millis();
  if (simdi - sonOlcum >= PENCERE_MS) {
    sonOlcum = simdi;
    unsigned int s = oku(tikSol);

    unsigned int eski = gecmis[sira];           // 5 ölçüm önceki sayaç
    unsigned int onceki = gecmis[(sira + N - 1) % N];   // bir önceki ölçüm
    gecmis[sira] = s;
    sira = (sira + 1) % N;

    float v100 = (s - onceki) * TIK_M / 0.1;
    float v500 = (s - eski) * TIK_M / (N * 0.1);

    Serial.print("v100="); Serial.print(v100 * 100, 1);
    Serial.print(" v500="); Serial.println(v500 * 100, 1);
  }
}
```

İlk yarım saniye `gecmis[]` henüz dolmadığı için değerler yanlıştır; onları yok say. Sonrasında (cm/s):

```
v100=10.4 v500=10.4
v100=10.4 v500=10.4
v100=0.0 v500=8.3
v100=10.4 v500=8.3
```

Bu hızda gerçek hız **9,4 cm/s** (tekerlek 2,9 rad/s). Sonuçlar:
- **100 ms penceresi** yalnız 0 ya da 10,4 cm/s verir. Robot sürekli hareket ederken bazı ölçümlerde "durdu" (0.0) görünür. Standart sapma yaklaşık 2,9 cm/s.
- **500 ms penceresi** 8,3 ile 10,4 arasında kalır. Standart sapma yaklaşık 1,0 cm/s; ama hız aniden değişirse ölçüm yarım saniye gecikmeli olur.
- İki ölçümün **ortalaması** da gerçek hıza yakındır (9,4). Sorun tek tek değerlerde.

Hız ölçümüne dayanan bir kontrol (5. hafta) dalgalı bir hız görürse boşuna tepki verir. Bu yüzden ya pencereyi uzatır ya da ölçümü yumuşatırsın (Modül 3, ders 14).

### Dene
- `hiz_olc` programında `PENCERE_MS` değerini 500 yap. Çıktıda ne görüyorsun? Çözünürlük ne oldu, ölçüm ne kadar geç güncelleniyor?
- `hiz_pencere` programında `analogWrite` değerini 100'den 200'e çıkar. 100 ms penceresinin dalgalanması azalıyor mu? Neden?
- Kesme modunu `RISING` yerine `CHANGE` yap ve `TIK_M` formülünde 20'yi 40 yap (bu durumda her yuva iki tık verir). Hız çözünürlüğü nasıl değişir?
- İki tık arasındaki süreyi `micros()` ile ölçüp hız hesaplamayı düşün: düşük hızda hangi yöntem daha ince sonuç verir? Kâğıt üzerinde düşün, sonra dene.

### Sık yapılan hatalar
- Kesme fonksiyonunun içine `Serial.print` ya da uzun hesap koymak.
- `dt` yerine sabit 0,1 kullanıp `loop()` yavaşlayınca hatalı hız hesaplamak.
- Sayaçları pencere sonunda sıfırlamak: kesme araya girerse bir tık kaybolur. Önceki değeri saklayıp çıkarmak daha güvenlidir.
- Pencere süresini `int` ile tutmak ya da `simdi - sonOlcum` yerine toplama kullanmak.
- Düşük hızda kısa pencere kullanıp "robot durdu" diye karar vermek.

### Gerçek robotta farklı olabilecekler
Gerçek enkoder modülünün çıkışı zıplayabilir ya da yuva genişlikleri eşit olmayabilir; bu ek gürültü demektir. Benzetimdeki tıklar mükemmel aralıklıdır, bu yüzden gerçek robotta ölçümler buradakinden daha dalgalı olabilir.

## Konuşalım
Robot 30 cm/s ile giderken 20 ms'lik pencere mi, 500 ms'lik pencere mi daha iyi hız ölçer? Engele çarpmak üzere olan bir robotun hızına ne kadar gecikmeyle güvenebilirsin?
