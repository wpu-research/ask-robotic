# Tekerlek enkoderi: tık → mesafe
süre: 25

## Merak
Arabanın kilometre sayacı yolu nasıl biliyor? Tekerleğin kaç tur döndüğünü sayıyor, bir turun kaç metre olduğunu da biliyor. Çarpınca yolu buluyor. Senin robotun şimdiye kadar yolu hep süreye bakarak tahmin etti: "2 saniye git, yaklaşık 60 cm olur." Pil bitmeye yaklaşınca ya da zemin kayganlaşınca bu tahmin tutmaz. Bu derste robota kendi kilometre sayacını takıyorsun.

## Etkinlik
### Enkoder nedir?
Tekerleğin ya da motor milinin üstünde, kenarında yuvalar olan ince bir disk durur. Diskin iki yanında bir ışık kaynağı ve bir ışık algılayıcı vardır. Disk dönerken yuvalar ışığı sırayla geçirir ve keser. Algılayıcı her geçişte bir elektrik darbesi üretir. Bu darbelerin her birine **tık** diyeceğiz.

Bizim robotun enkoder diski **20 yuvalı**. Çıkış HIGH'dan LOW'a, LOW'dan HIGH'a geçer. Biz yalnız **LOW'dan HIGH'a geçişi (RISING kenarı)** sayacağız. Böylece her yuva bir tık eder: tekerlek bir tam dönünce **20 tık**.

### Tık mesafeye nasıl dönüşür?
Tekerleğin yarıçapı `r = 3,3 cm`. Tekerlek bir tur dönünce yerde kendi çevresi kadar yol alır (kaymadığını varsayıyoruz):

```
çevre = 2 · π · r = 2 · 3,1416 · 3,3 cm ≈ 20,73 cm
```

Bir turda 20 tık olduğuna göre bir tıkın karşılığı:

```
tık mesafesi = çevre / 20 ≈ 1,037 cm
```

Tersinden bakalım: 1 metre kaç tıktır?

```
100 cm / 1,037 cm ≈ 96,5 tık
```

Yani robot 1 m giderse sayaç yaklaşık 96-97 olmalı. Bunu hemen deneyeceğiz.

### Devre
| Parça | Bağlantı |
|---|---|
| Sol motor (sürücü L298N ya da TB6612) | EN **D5** (PWM), IN1 **D7**, IN2 **D8** |
| Sağ motor | EN **D6** (PWM), IN3 **D9**, IN4 **D10** |
| Sol enkoder çıkışı | **D2** (kesme pini), VCC → 5 V, GND → GND |
| Sağ enkoder çıkışı | **D3** (kesme pini), VCC → 5 V, GND → GND |
| Motor gücü | Motorlar için ayrı pil/güç kaynağı; sürücünün GND'si Arduino GND'siyle ortak olmalı |

Güvenlik: Motorları Arduino'nun 5 V pininden besleme. Ayrı pil kullan, GND'leri birleştir. Pili kısa devre yapma, ters bağlama. Şebeke gerilimiyle (220 V) asla devre kurma.

D2 ve D3, Uno'da kesme (interrupt) alabilen iki pindir. Kesme kurallarını Modül 3'ün 29. dersinde, enkoderi okumayı Modül 4'ün 57. dersinde gördün. Burada aynısını iki tekerlek için yapıyoruz.

### Program
İlk programımız iki şey yapar: robot 1 m gidecek kadar tık sayar, durur ve yolu tıklardan hesaplar.

```cpp
// sketch: tik_mesafe
const int EN_SOL = 5, IN1 = 7, IN2 = 8;
const int EN_SAG = 6, IN3 = 9, IN4 = 10;
const int ENK_SOL = 2, ENK_SAG = 3;

const float CEVRE = 2 * PI * 0.033;     // tekerlek çevresi (m)
const int YUVA = 20;                    // diskteki yuva sayısı
const float TIK_M = CEVRE / YUVA;       // bir tıkın mesafesi (m)

volatile unsigned int tikSol = 0;
volatile unsigned int tikSag = 0;

void sayiSol() { tikSol++; }
void sayiSag() { tikSag++; }

void ilerisur(int pwm) {
  digitalWrite(IN1, HIGH); digitalWrite(IN2, LOW);
  digitalWrite(IN3, HIGH); digitalWrite(IN4, LOW);
  analogWrite(EN_SOL, pwm);
  analogWrite(EN_SAG, pwm);
}
void dur() { analogWrite(EN_SOL, 0); analogWrite(EN_SAG, 0); }

unsigned int oku(volatile unsigned int &sayac) {
  noInterrupts();                       // okurken kesme araya girmesin
  unsigned int kopya = sayac;
  interrupts();
  return kopya;
}

void setup() {
  Serial.begin(9600);
  pinMode(EN_SOL, OUTPUT); pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT);
  pinMode(EN_SAG, OUTPUT); pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT);
  pinMode(ENK_SOL, INPUT); pinMode(ENK_SAG, INPUT);
  attachInterrupt(digitalPinToInterrupt(ENK_SOL), sayiSol, RISING);
  attachInterrupt(digitalPinToInterrupt(ENK_SAG), sayiSag, RISING);

  Serial.print("Tik basina cm: ");
  Serial.println(TIK_M * 100, 2);
  Serial.print("1 m icin tik: ");
  Serial.println(1.0 / TIK_M, 1);

  int hedefTik = (int)(1.0 / TIK_M + 0.5);   // 1 m kaç tık (yuvarla)
  ilerisur(200);
  while (oku(tikSol) < hedefTik) {}
  dur();
  delay(600);                                 // robotun durmasını bekle

  unsigned int s = oku(tikSol), g = oku(tikSag);
  Serial.print("Sol tik: "); Serial.println(s);
  Serial.print("Sag tik: "); Serial.println(g);
  Serial.print("Mesafe (cm): ");
  Serial.println(s * TIK_M * 100, 1);
}

void loop() {}
```

Seri monitörde şunu görürsün:

```
Tik basina cm: 1.04
1 m icin tik: 96.5
Sol tik: 98
Sag tik: 98
Mesafe (cm): 101.6
```

### Nasıl çalışıyor?
1. `attachInterrupt(..., RISING)` ile D2 ve D3'e iki kesme bağladık. Pin LOW'dan HIGH'a her çıktığında ilgili `sayi...()` fonksiyonu çalışır ve sayacı bir artırır. Ana program ne yapıyor olursa olsun tık kaçmaz.
2. Sayaçlar `volatile`. `unsigned int` 2 bayt olduğu için 8 bitlik Arduino onu tek komutla okuyamaz; okurken araya kesme girerse yarım okunmuş bir sayı çıkabilir. Bu yüzden `oku()` fonksiyonu `noInterrupts()` ile kısa bir an kesmeleri kapatıp kopya alıyor.
3. `TIK_M` bir kez hesaplanıyor: `CEVRE / YUVA`. Mesafe = tık sayısı × `TIK_M`.
4. Robot 97 tıkta durma komutu aldı ama **98 tık** saydık. Çünkü motor komutla anında durmaz; birkaç on milisaniye daha döner. Bu fazla tık da sayaçta görünür. Sayaç robotun gerçekte gittiği yolu söyler, senin istediğin yolu değil.

Benzetim robotun gerçek konumunu da bilir. Aynı koşuda robotun gerçek yolu 101,3 cm çıktı; tıklardan hesapladığımız 101,6 cm. Fark 0,3 cm, yani bir tıkın üçte biri kadar. Sol ve sağ sayaç aynı çıktı çünkü iki tekerlek eşit döndü. Bunun hep böyle olmadığını 93. derste göreceksin.

### Hedef cm'ye gitmek
Mesafe hedefi tıka çevirmek tek satır: `hedefTik = istenenCm / TIK_CM`. Aşağıdaki program 20, 50 ve 100 cm ister ve her seferinde ne kadar gittiğini ölçer.

```cpp
// sketch: tik_hedef_cm
const int EN_SOL = 5, IN1 = 7, IN2 = 8;
const int EN_SAG = 6, IN3 = 9, IN4 = 10;
const int ENK_SOL = 2, ENK_SAG = 3;

const float TIK_CM = 2 * PI * 3.3 / 20;   // bir tıkın mesafesi (cm)

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

void surus(int pwm) {
  digitalWrite(IN1, HIGH); digitalWrite(IN2, LOW);
  digitalWrite(IN3, HIGH); digitalWrite(IN4, LOW);
  analogWrite(EN_SOL, pwm);
  analogWrite(EN_SAG, pwm);
}

// istenen cm kadar ileri git, ölçülen mesafeyi (cm) döndür
float ileriCm(float istenen) {
  unsigned int baslangic = oku(tikSol);
  unsigned int hedef = (unsigned int)(istenen / TIK_CM + 0.5);
  surus(180);
  while (oku(tikSol) - baslangic < hedef) {}
  surus(0);
  delay(500);                                   // durma payını bekle
  return (oku(tikSol) - baslangic) * TIK_CM;
}

void setup() {
  Serial.begin(9600);
  pinMode(EN_SOL, OUTPUT); pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT);
  pinMode(EN_SAG, OUTPUT); pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT);
  pinMode(ENK_SOL, INPUT); pinMode(ENK_SAG, INPUT);
  attachInterrupt(digitalPinToInterrupt(ENK_SOL), sayiSol, RISING);
  attachInterrupt(digitalPinToInterrupt(ENK_SAG), sayiSag, RISING);

  float istek[3] = {20, 50, 100};
  for (int i = 0; i < 3; i++) {
    float olculen = ileriCm(istek[i]);
    Serial.print("Istenen: "); Serial.print(istek[i], 0);
    Serial.print(" cm  Olculen: "); Serial.print(olculen, 1);
    Serial.println(" cm");
  }
  Serial.println("BITTI");
}

void loop() {}
```

Çıktı:

```
Istenen: 20 cm  Olculen: 20.7 cm
Istenen: 50 cm  Olculen: 50.8 cm
Istenen: 100 cm  Olculen: 100.6 cm
BITTI
```

İstenenden hep biraz fazla. İki neden var: hedef tık sayısı tam sayıya yuvarlanır (20 cm = 19,3 tık → 19 tık) ve robot kayarak durur, sayaç bir tık daha artar (19 yerine 20 tık = 20,7 cm). Önemli olan, **ölçülen** değerin gerçeğe yakın olması: benzetimde üç yolun her biri için ölçülen değer gerçek yolla 1,5 cm içinde örtüştü.

### Dene
- `YUVA` değerini 20 yerine 30 yap ve çıktıyı yorumla. Sayaç mu bozulur, mesafe hesabı mı? Gerçek robotta bu sayıyı nereden öğrenirsin?
- `tik_hedef_cm` programında hedefi 5 cm yap. İstenen ile ölçülen arasındaki fark yüzde kaç oldu? Küçük mesafede tık çözünürlüğü neden daha çok hissedilir?
- PWM'i 180'den 255'e çıkar. Robot aynı hedefte daha mı fazla ilerliyor? Neden?

### Sık yapılan hatalar
- Tekerlek yarıçapı yerine çapını formüle koymak: yol iki kat çıkar.
- Santimetre ile metreyi karıştırmak: `TIK_M` metre, `TIK_CM` santimetredir.
- Sayacı `volatile` yapmamak ya da 2 baytlık sayacı kesmeleri kapatmadan okumak.
- Robot durdu diye sayacın da durduğunu sanmak: kayma payı sayaca girer.
- Enkoderi yalnız bir tekerleğe bağlayıp robotun düz gittiğini varsaymak.

### Gerçek robotta farklı olabilecekler
Gerçek bir tekerlek yere basınca hafifçe ezilir ve zeminde kayabilir. Çevreyi cetvelle ölçüp formüle koymak iyi bir başlangıçtır ama yine de bir hata payı kalır. Bu dersteki benzetim tekerleği kaymayan ideal bir robottur; bu yüzden ölçümler gerçeğe bu kadar yakın.

## Konuşalım
Tekerlek enkoderi robotun gerçekten gittiği yolu mu, yoksa tekerleğin döndüğü yolu mu ölçer? İkisi ne zaman aynı olmaz?
