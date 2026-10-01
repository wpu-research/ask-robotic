# Servo taramasıyla en açık yolu bul
süre: 25

## Merak
Engelin önünde durdun. Şimdi hangi yöne gideceksin? Sola mı, sağa mı? Bir insan başını çevirip bakar ve boş olan tarafa yürür. Robotun başı yok, ama sensörünü taşıyan bir servo var. Servo sensörü sağa sola çevirir, robot her yönün ne kadar açık olduğunu ölçer ve en uzağa dönmeye karar verir.

## Etkinlik
### Devre
Bağlantılar 82. dersteki gibidir; fark, servonun artık gerçekten hareket etmesidir.

| Parça | Bağlantı |
|---|---|
| HC-SR04 | VCC → 5 V, GND → GND, TRIG → **D11**, ECHO → **D12** |
| Sensörü taşıyan servo | Sinyal → **D4** (sensörü servonun üstüne sabitle) |
| Sol motor | EN → **D5** (PWM), IN1 → **D7**, IN2 → **D8** |
| Sağ motor | EN → **D6** (PWM), IN3 → **D9**, IN4 → **D10** |

**Güç uyarısı:** Servo ve motorlar için ayrı pil kullan, pilin eksisini Arduino GND'sine de bağla (ortak GND). Servoyu ve motorları Arduino'nun 5 V pininden besleme. Pilleri kısa devre yapma, ters bağlama.

### Servo açısı yönü belirler
21. derste `write(90)` servoyu ortaya getirmişti. Sensör servoya sabit olduğundan servo açısı ışının yönünü de belirler:

| Servo açısı | Işın yönü |
|---|---|
| 90° | düz ileri |
| 150° | robotun 60° soluna |
| 30° | robotun 60° sağına |

Yani **büyük açı = sola**. Biz −60°…+60° arasını 30° adımlarla tarayacağız: servo açıları 30, 60, 90, 120, 150.

### Program
Önce arenayı düşün: robot bir duvara bakıyor, ama duvarın sol ucu açık; yani sol taraftan geçilebilir. Program yönleri sırayla ölçer, en uzak yönü seçer ve oraya döner.

```cpp
// sketch: tara_en_acik
#include <Servo.h>

const int SOL_EN = 5;
const int SOL_IN1 = 7;
const int SOL_IN2 = 8;
const int SAG_EN = 6;
const int SAG_IN3 = 9;
const int SAG_IN4 = 10;
const int TRIG = 11;
const int ECHO = 12;

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

const int SERVO_PIN = 4;
const int ACI_ADET = 5;
const int ACILAR[ACI_ADET] = {30, 60, 90, 120, 150};   // 90 = ileri, büyük açı = sol
const int MS_DERECE = 5;                               // yerinde dönüş: ~5 ms / derece (HIZ = 160 için)

Servo tarayici;

// 3 ölçümün ortancası
int medyan3() {
  int a = mesafeOlc(); delay(10);
  int b = mesafeOlc(); delay(10);
  int c = mesafeOlc();
  if (a > b) { int t = a; a = b; b = t; }
  if (b > c) { int t = b; b = c; c = t; }
  if (a > b) { int t = a; a = b; b = t; }
  return b;
}

// Servoyu 30°...150° gezdirir, her yönde ölçer, en uzak ölçülen açıyı döndürür
int enAcikAci() {
  int enIyiAci = 90;
  int enIyiCm = -1;
  for (int i = 0; i < ACI_ADET; i++) {
    tarayici.write(ACILAR[i]);
    delay(300);                      // servo hedefe varsın
    int cm = medyan3();
    Serial.print(ACILAR[i]);
    Serial.print(":");
    Serial.println(cm);
    if (cm > enIyiCm) {
      enIyiCm = cm;
      enIyiAci = ACILAR[i];
    }
  }
  tarayici.write(90);
  return enIyiAci;
}

void setup() {
  pinMode(SOL_IN1, OUTPUT); pinMode(SOL_IN2, OUTPUT);
  pinMode(SAG_IN3, OUTPUT); pinMode(SAG_IN4, OUTPUT);
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  tarayici.attach(SERVO_PIN);
  tarayici.write(90);
  Serial.begin(9600);
  delay(500);

  int aci = enAcikAci();
  Serial.print("SECILEN ");
  Serial.println(aci);

  int fark = aci - 90;                  // + = sola
  if (fark > 0) surus(-HIZ, HIZ);
  else if (fark < 0) surus(HIZ, -HIZ);
  delay(abs(fark) * MS_DERECE);
  surus(HIZ, HIZ);
}

void loop() {
}
```

### Nasıl çalışıyor?
1. `ACILAR` dizisi taranacak servo açılarını tutar (4. ders, diziler). `ACI_ADET` dizinin uzunluğudur.
2. Her açıda önce servoya `write` der, 300 ms bekler (servo hedefe varsın), sonra 3 ölçümün ortancasıyla (82. ders) mesafeyi alır. Servo bekleme süresi servoya göre değişir; hareket eden servoyla ölçüm yapmak yanlış sonuç verir.
3. `if (cm > enIyiCm)` ile şimdiye kadarki en uzak ölçüm ve açısı hatırlanır.
4. Tarama bitince servo tekrar 90°'ye döner. Robot `fark = aci - 90` kadar döner: fark pozitifse sola (`surus(-HIZ, HIZ)`), negatifse sağa. Dönüş süresi `|fark| × 5 ms`; 81. ve 82. derslerde 450 ms'nin yaklaşık 90° ettiğini görmüştük.
5. Dönünce düz ilerler.

**Ölçtüklerimiz (benzetim):**
- Duvarın sol tarafı açıkken ölçümler yaklaşık şöyle çıktı: 30° → 57 cm, 60° → 32 cm, 90° → 29 cm, 120° → 33 cm, 150° → 115 cm. Program `SECILEN 150` yazdı, robot yaklaşık 60° sola döndü ve duvarın ucundan geçip yoluna devam etti.
- Aynı arenanın sağ tarafı açık (ayna) hâlinde ölçümler tersine döndü: 30° → 116 cm, 150° → 57 cm. Program `SECILEN 30` yazdı ve robot yaklaşık 60° sağa döndü. Yani kod arenanın hangi tarafının açık olduğunu kendisi buluyor; sola ya da sağa dönmesi kodda yazılı değil.
- Tarama yaklaşık 1,7 saniye sürdü (5 yön × 300 ms bekleme ve ölçümler). Bu süre boyunca robot duruyor.

### Dene
- `ACILAR` dizisine 0 ve 180 ekle (`ACI_ADET` değerini de güncelle). Çok geniş açılarda ölçümler ne gösteriyor? Kenarlara yakın açılarda robotu yan duvara doğru çevirmek mantıklı mı?
- Adımı 30°'den 15°'ye indir (9 yön). Tarama süresi ne kadar uzuyor? Seçilen yön daha mı doğru oluyor?
- En uzak yönü seçmek yerine "ileriye en yakın, 40 cm'den uzak yön" seçecek şekilde değiştir. Robot daha az dönüyor mu?

### Sık yapılan hatalar
- Servoya `write` dedikten hemen sonra ölçmek: servo henüz yoldadır, ölçüm iki yönün karışımıdır.
- `ACI_ADET` ile dizinin gerçek uzunluğunu uyumsuz yazmak: döngü dizinin dışına taşar.
- Sol ile sağı karıştırmak. Hatırla: 90° ileri, büyük açı sola.
- `fark` işaretini ters kullanmak: robot açık yönün tersine döner.
- Tarama bitince servoyu 90°'ye döndürmeyi unutmak: sonraki ölçümler yana bakar.
- Her yön kısaysa ne yapacağını düşünmemek. Tüm ölçümler yakınsa "en uzak" yön de duvardır. Bu durumu 84. derste ele alacağız.

### Gerçek robotta farklı olabilecekler
- Gerçek servo benzetimdeki kadar çabuk ve tekrarlanabilir değildir; bekleme süresini kendi servona göre ayarla. Servo hareket başlarken ani akım çekebilir; Arduino ile aynı bataryadan beslenirse bu, kartın resetlenmesi gibi sorunlara yol açabilir. Ayrı güç ve ortak GND bunu azaltır.
- Gerçek HC-SR04 ışını geniş bir konidir (82. ders). 30° adımlarla tarayınca komşu yönlerin ışınları üst üste biner; ince engeller aralarından kaçabilir.
- Kenarlara bakan ışınlar yan duvarı eğik görür; eğik yüzeyde yansıma sensöre dönmeyip "çok uzak" ölçüm verebilir. Bu, açık yol seçimini yanıltır.
- Tarama yaklaşık 2 saniye sürer. Hareketli bir engelle (bir insan, başka bir robot) karşılaşırsan tarama sonucu eskimiş olabilir.

## Konuşalım
Robot tarama sırasında duruyor ve bu yaklaşık 2 saniye sürüyor. Taramayı hızlandırmanın (daha az açı, daha kısa bekleme) bedeli ne olabilir? Hangisi daha önemli: hızlı karar mı, doğru karar mı?
