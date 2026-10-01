# Mesafe sensörüyle dur ve dön
süre: 25

## Merak
Park sensörlü bir araba duvara yaklaştıkça bip hızını artırır; çarpmadan önce haber verir. Tampon sensöründe haber çarpınca geliyordu. Ultrasonik sensörle robotun engele değmeden durmasını sağlayacağız. Ama işin bir tuzağı var: sensörün ölçümü her seferinde biraz farklı çıkar. Robot bu oynak ölçümle ne zaman duracağına nasıl karar verecek?

## Etkinlik
### Devre
| Parça | Bağlantı |
|---|---|
| HC-SR04 | VCC → 5 V, GND → GND, TRIG → **D11**, ECHO → **D12** |
| Sensörü taşıyan servo | Sinyal → **D4** (bu derste hep 90°, yani düz ileri) |
| Sol motor | EN → **D5** (PWM), IN1 → **D7**, IN2 → **D8** |
| Sağ motor | EN → **D6** (PWM), IN3 → **D9**, IN4 → **D10** |

**Güç uyarısı:** Servo ve motorlar için ayrı pil kullan, pilin eksisini Arduino GND'sine de bağla (ortak GND). Servoyu ve motorları Arduino'nun 5 V pininden besleme. Pilleri kısa devre yapma, ters bağlama.

Sensör robotun ön ortasında, merkezin yaklaşık 6 cm önündedir. Ölçtüğün mesafe robotun merkezine değil, sensöre olan mesafedir.

### Program
**Önce ölçümü izleyelim.** Robot yerinde duruyor, duvara 44 cm var. Her turda iki sayı yazdırıyoruz: tek ölçüm (`ham`) ve 5 ölçümün ortancası (`medyan`). Medyan filtreyi 38. dersten hatırlarsın: ölçümleri sırala, ortadakini al; sıçrayan tek tük ölçümler elenir. Benzetimde ölçüme rastgele ±3 cm civarı gürültü ekledik. Gerçek sensörlerde de ölçüm oynar.

```cpp
// sketch: mesafe_yaz
#include <Servo.h>

const int TRIG = 11;
const int ECHO = 12;
const int SERVO_PIN = 4;

Servo bakis;                         // sensörü taşıyan servo

// HC-SR04 ile mesafe (cm). Yankı gelmezse 400 döner.
int mesafeOlc() {
  digitalWrite(TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG, LOW);
  long sure = pulseIn(ECHO, HIGH, 30000);
  if (sure == 0) return 400;
  return sure / 58;
}

// 5 ölçümün ortancası (38. dersteki medyan filtre)
int medyan5() {
  int d[5];
  for (int i = 0; i < 5; i++) {
    d[i] = mesafeOlc();
    delay(10);
  }
  for (int i = 1; i < 5; i++) {      // ekleme sıralaması
    int x = d[i];
    int j = i - 1;
    while (j >= 0 && d[j] > x) {
      d[j + 1] = d[j];
      j--;
    }
    d[j + 1] = x;
  }
  return d[2];
}

void setup() {
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  bakis.attach(SERVO_PIN);
  bakis.write(90);                   // düz ileri
  Serial.begin(9600);
}

void loop() {
  int ham = mesafeOlc();
  int med = medyan5();
  Serial.print(ham);
  Serial.print(" ");
  Serial.println(med);
  delay(100);
}
```

**Şimdi dur ve dön.** Robot düz gidiyor, her turda tek ölçüm alıyor. Mesafe `ESIK_CM` altına inince duruyor ve yerinde sağa dönüyor. İlk sürüm tek ölçüme güveniyor.

```cpp
// sketch: mesafe_tek_dur
#include <Servo.h>

const int SOL_EN = 5;
const int SOL_IN1 = 7;
const int SOL_IN2 = 8;
const int SAG_EN = 6;
const int SAG_IN3 = 9;
const int SAG_IN4 = 10;
const int TRIG = 11;
const int ECHO = 12;
const int SERVO_PIN = 4;

const int HIZ = 160;                 // PWM; ölü bölgenin (~%20) üstünde

// Tek motor: pwm > 0 ileri, < 0 geri, 0 dur (77. ders)
void motor(int en, int a, int b, int pwm) {
  digitalWrite(a, pwm > 0);
  digitalWrite(b, pwm < 0);
  analogWrite(en, abs(pwm));
}

// İki motoru birden sür: sol ve sag -255...255
void surus(int sol, int sag) {
  motor(SOL_EN, SOL_IN1, SOL_IN2, sol);
  motor(SAG_EN, SAG_IN3, SAG_IN4, sag);
}

// HC-SR04 ile mesafe (cm). Yankı gelmezse 400 döner.
int mesafeOlc() {
  digitalWrite(TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG, LOW);
  long sure = pulseIn(ECHO, HIGH, 30000);
  if (sure == 0) return 400;
  return sure / 58;
}

const int ESIK_CM = 25;              // bundan yakındaysa dur

Servo bakis;                         // sensörü taşıyan servo

void setup() {
  bakis.attach(SERVO_PIN);
  bakis.write(90);                   // düz ileri
  pinMode(SOL_IN1, OUTPUT); pinMode(SOL_IN2, OUTPUT);
  pinMode(SAG_IN3, OUTPUT); pinMode(SAG_IN4, OUTPUT);
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  Serial.begin(9600);
}

void loop() {
  int cm = mesafeOlc();
  if (cm < ESIK_CM) {
    surus(0, 0);                     // 1) dur
    Serial.print("DUR ");
    Serial.println(cm);
    surus(HIZ, -HIZ);                // 2) yerinde sağa dön (~90°)
    delay(450);
    surus(0, 0);
    return;
  }
  surus(HIZ, HIZ);
  delay(20);
}
```

**Medyanla.** Aynı program, ama karar tek ölçüme değil son 5 ölçümün ortancasına bağlı.

```cpp
// sketch: mesafe_medyan_dur
#include <Servo.h>

const int SOL_EN = 5;
const int SOL_IN1 = 7;
const int SOL_IN2 = 8;
const int SAG_EN = 6;
const int SAG_IN3 = 9;
const int SAG_IN4 = 10;
const int TRIG = 11;
const int ECHO = 12;
const int SERVO_PIN = 4;

const int HIZ = 160;                 // PWM; ölü bölgenin (~%20) üstünde

// Tek motor: pwm > 0 ileri, < 0 geri, 0 dur (77. ders)
void motor(int en, int a, int b, int pwm) {
  digitalWrite(a, pwm > 0);
  digitalWrite(b, pwm < 0);
  analogWrite(en, abs(pwm));
}

// İki motoru birden sür: sol ve sag -255...255
void surus(int sol, int sag) {
  motor(SOL_EN, SOL_IN1, SOL_IN2, sol);
  motor(SAG_EN, SAG_IN3, SAG_IN4, sag);
}

// HC-SR04 ile mesafe (cm). Yankı gelmezse 400 döner.
int mesafeOlc() {
  digitalWrite(TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG, LOW);
  long sure = pulseIn(ECHO, HIGH, 30000);
  if (sure == 0) return 400;
  return sure / 58;
}

const int ESIK_CM = 25;              // bundan yakındaysa dur
const int N = 5;

// N ölçümün ortancası (38. dersteki medyan filtre)
int medyan() {
  int d[N];
  for (int i = 0; i < N; i++) {
    d[i] = mesafeOlc();
    delay(8);
  }
  for (int i = 1; i < N; i++) {
    int x = d[i];
    int j = i - 1;
    while (j >= 0 && d[j] > x) { d[j + 1] = d[j]; j--; }
    d[j + 1] = x;
  }
  return d[N / 2];
}

Servo bakis;                         // sensörü taşıyan servo

void setup() {
  bakis.attach(SERVO_PIN);
  bakis.write(90);                   // düz ileri
  pinMode(SOL_IN1, OUTPUT); pinMode(SOL_IN2, OUTPUT);
  pinMode(SAG_IN3, OUTPUT); pinMode(SAG_IN4, OUTPUT);
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  Serial.begin(9600);
}

void loop() {
  int cm = medyan();
  if (cm < ESIK_CM) {
    surus(0, 0);                     // 1) dur
    Serial.print("DUR ");
    Serial.println(cm);
    surus(HIZ, -HIZ);                // 2) yerinde sağa dön (~90°)
    delay(450);
    surus(0, 0);
    return;
  }
  surus(HIZ, HIZ);
}
```

### Nasıl çalışıyor?
1. `mesafeOlc()` TRIG'e 10 µs'lik darbe verir, `pulseIn` ile ECHO'daki darbenin süresini ölçer ve 58'e böler (ses gidiş-dönüşte 1 cm için yaklaşık 58 µs harcar). Yankı gelmezse 400 döner.
2. `ESIK_CM = 25` demek: sensör engele 25 cm kalınca dur. Robotun merkezi bu sırada engelden yaklaşık 31 cm uzaktadır.
3. `surus(0, 0)` dediğin anda robot hemen durmaz. Motor gecikmesi (80 ms) yüzünden yaklaşık 1,5 cm daha ilerler. Eşiği seçerken bu payı hesaba kat.
4. Dönüş 450 ms sürer; 81. dersteki gibi bu yaklaşık 90°'dir.

**Ölçtüklerimiz (benzetim, robot 0,3 m'den duvara doğru gidiyor):**
- `mesafe_yaz` programında gerçek mesafe 44 cm iken tek ölçümlerin ortalaması 44 cm civarındaydı ama 3 cm kadar dalgalandı (standart sapma yaklaşık 3). Medyan değeri 2 cm civarında dalgalandı: tek ölçümün yaklaşık yarısı kadar.
- Gürültüsüz durumda iki program da sensör duvara yaklaşık 24-25 cm kalınca durdu ve robot yaklaşık 90° sağa döndü. Duvara değmedi.
- Gürültüyü abartıp 6 cm yaptık ve dört ayrı deneme çalıştırdık. Tek ölçümlü robot 33, 33, 34 ve 35 cm'de durdu: eşik 25 olduğu halde sahte "engel var" ölçümü yüzünden erkenden fren yaptı. Medyanlı robot 27, 24, 25 ve 28 cm'de durdu, yani eşiğe çok daha yakın.

Gürültü yalnız erken durmaya yol açmaz. Gerçek robotta tek ölçüm bir kere "uzak" gösterirse robot da engeli geç görebilir. Medyan ikisini de azaltır.

### Dene
- `mesafe_medyan_dur` programında `N` değerini önce 3, sonra 9 yap. Durma mesafesi ne kadar kararlı? Ölçüm sayısı arttıkça robotun karar verme hızı ne oluyor?
- `ESIK_CM` değerini 15'e düşür. Robot hâlâ duvara değmeden duruyor mu? Dur komutundan sonraki kaymayı da hesaba kat.
- Robot durduktan sonra 1 saniye bekle (`delay(1000)`) ve `Serial.println(medyan())` ile gördüğü mesafeyi yazdır. Eşiğin biraz altında mı duruyor?

### Sık yapılan hatalar
- Tek ölçüme güvenmek. Robotu sahte bir ölçüm durdurur ya da kaçırır.
- Eşiği robotun merkezine göre düşünmek. Sensör robotun önündedir ve robot durmak için de yol alır.
- `pulseIn` için zaman aşımı koymamak: yankı gelmezse program 1 saniye bekler.
- Yankı gelmeyince 0 sonucunu "0 cm, duvar dibindeyim" diye yorumlamak. Bizim fonksiyon yankı yoksa 400 döndürür. Çok yakın cisimlerde de yankı gelmeyebilir (veri sayfasındaki en küçük ölçüm mesafesine bak).
- Ölçüm döngüsüne uzun `delay` koymak: robot bu sırada körlemesine ilerler.

### Gerçek robotta farklı olabilecekler
- HC-SR04 ışın gibi dar değil, koni gibi yayılır. Genişliği modüle göre değişir (veri sayfasına bak). Sensör yan duvarı ya da zemini de görüp yanlış mesafe verebilir; benzetimdeki sensör tek ince bir ışındır.
- Eğik duvara çarpan ses sensöre dönmeyip başka yöne yansıyabilir. Robot duvarı olduğundan uzak ya da hiç yok sanar.
- Kumaş, koltuk, perde gibi yumuşak yüzeyler sesi emer; yankı zayıflar ve ölçüm yanlış ya da boş çıkabilir.
- Ses hızı sıcaklığa göre değişir; 58 böleni yaklaşık bir değerdir.
- Küçük ve ince cisimler (sandalye bacağı) yankıyı çok zayıf döndürür.
- Gerçek gürültü benzetimdeki düzgün dağılıma benzemez; arada tamamen yanlış ölçümler de görürsün. Medyan yine de en güvenilir ilk adımdır.

## Konuşalım
Eşiği büyük seçersen robot güvenli durur ama dar geçitlerden geçemez. Küçük seçersen çarpma riski artar. Gürültü ve fren payı varken eşiği nasıl seçerdin?
