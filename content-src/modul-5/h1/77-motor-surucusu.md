# Motor sürücüsü L298N/TB6612: yön ve PWM
süre: 25

## Merak
Arduino'nun bir pini motoru doğrudan sürmeye yetmez (22. derste gördün). 23. derste L293D ile motoru ileri ve geri döndürdün. Gerçek robotlarda ise çoğunlukla L298N ya da TB6612 gibi hazır sürücü kartları kullanılır. Bu kartlar L293D'ye benzer ama bir iki ayrıntıda farklıdır. Robot tam hız giderken `IN1` ve `IN2`'yi aynı yapınca ne olur? Ya da `EN`'i kapatınca?

## Etkinlik
### İki sürücü, aynı fikir
İkisi de içinde iki H-köprüsü (23. ders) taşır, yani iki DC motoru bağımsız sürebilir. Her motor için iki **yön** girişi ve bir **hız (PWM)** girişi vardır.

| | L298N kartı | TB6612 kartı |
|---|---|---|
| Sol motor yön girişleri | IN1, IN2 | AIN1, AIN2 |
| Sağ motor yön girişleri | IN3, IN4 | BIN1, BIN2 |
| Hız (PWM) girişleri | ENA, ENB | PWMA, PWMB |
| Ek giriş | yok | STBY (bekleme) |
| İçindeki anahtarlar | bipolar transistör | MOSFET |
| Gerilim düşümü | tipik olarak yaklaşık 1-2 V (veri sayfasına bak) | genelde çok daha düşük |
| Isınma | belirgin ısınabilir | genelde daha az ısınır |
| Boyut | büyük | küçük |

Önemli farklar:

- **Gerilim düşümü:** L298N'de motora giden gerilimin bir kısmı sürücüde harcanır. Küçük pille çalışan robotlarda bu fark hissedilir. Kesin değer için kullandığın kartın veri sayfasına bak.
- **STBY:** TB6612'de `STBY` pini LOW olursa sürücü bekleme moduna geçer ve motorlar çalışmaz. Çalışması için `STBY`'yi HIGH yapmak (5 V'a bağlamak ya da bir pinden HIGH vermek) gerekir.
- **EN jumper'ı:** Çoğu hazır L298N kartında `ENA` ve `ENB` pinlerinde küçük bir jumper bulunur ve motoru hep tam hızda tutar. PWM ile hız ayarlamak için jumper'ı çıkarıp `EN` pinini Arduino'nun PWM pinine bağlarsın.

Bu modülde pin isimlerini sürücüden bağımsız tutuyoruz: sol motor EN D5, IN1 D7, IN2 D8; sağ motor EN D6, IN3 D9, IN4 D10. TB6612 kullanıyorsan EN yerine PWMA/PWMB, IN yerine AIN/BIN yaz ve `STBY`'yi HIGH'a bağla.

### Doğruluk tablosu
Tek bir motor için dört durum (EN = PWM girişi):

| IN1 | IN2 | EN | Durum | Motor |
|---|---|---|---|---|
| HIGH | LOW | PWM | **İleri** | PWM oranında hızla bir yöne döner |
| LOW | HIGH | PWM | **Geri** | Aynı hızla ters yöne döner |
| HIGH | HIGH | HIGH | **Fren** | Motor uçları kısa devre edilir, motor durmaya zorlanır |
| LOW | LOW | LOW (0) | **Serbest bırakma** | Motor bağlantısız kalır, kendi hızıyla yavaşlar |

Fren ile serbest bırakma farkı: frende motor uçları birbirine bağlanır. Dönen motor bu durumda jeneratör gibi davranır ve kendi akımı onu yavaşlatır. Serbest bırakmada motor yalnızca atalet ve sürtünmeyle yavaşlar. Gerçek robotlarda fren genellikle daha çabuk durdurur.

Dikkat: L298N'de EN HIGH iken `IN1 = IN2` fren yapar, EN LOW iken ise (IN'lerin değerinden bağımsız) motor serbest kalır. TB6612'de ise `IN1 = IN2 = LOW` motoru serbest bırakır, `IN1 = IN2 = HIGH` fren yapar. Tablodaki dört satır ikisinde de aynı sonucu verir. Kartından emin değilsen veri sayfasına bak.

Motor yönünü değiştirmeden önce kısa bir süre durdur: motor tam hızda dönerken bir anda ters yöne geçmek hem sürücüyü hem pili zorlar.

### Devre
| Parça | Bağlantı |
|---|---|
| Sol motor | EN **D5** (PWM), IN1 **D7**, IN2 **D8** |
| Sağ motor | EN **D6** (PWM), IN3 **D9**, IN4 **D10** |
| Motor gücü | Ayrı pil kutusu → sürücünün motor gücü girişi; sürücü GND'si ile Arduino GND'si ortak |

**Güvenlik:** Motor gücünü Arduino'dan alma, ayrı pil kullan ve GND'leri birleştir. Pil kutusunu ters bağlama, uçlarını kısa devre etme. Sürücü kartı çalışırken ısınabilir, dokunmadan önce bekle. İlk denemelerde robotun tekerlekleri havada olsun.

### Program
Sketch her 1,5 saniyede bir durum değiştirir: ileri, fren, geri, serbest bırakma. Her iki motor da aynı durumdadır. `enum` ve `switch` ile yazılmış (28. ders).

```cpp
// sketch: surucu_durumlari
const int SOL_EN = 5;
const int SOL_IN1 = 7;
const int SOL_IN2 = 8;
const int SAG_EN = 6;
const int SAG_IN1 = 9;
const int SAG_IN2 = 10;

enum Durum { ILERI, FREN, GERI, SERBEST };
const char* ISIMLER[] = { "ILERI", "FREN", "GERI", "SERBEST" };

const int PWM_ILERI = 200;
const int PWM_GERI = 120;
const unsigned long ADIM_SURESI = 1500;   // ms

void surucu(int en, int in1, int in2, Durum d, int pwm) {
  switch (d) {
    case ILERI:
      digitalWrite(in1, HIGH);
      digitalWrite(in2, LOW);
      analogWrite(en, pwm);
      break;
    case GERI:
      digitalWrite(in1, LOW);
      digitalWrite(in2, HIGH);
      analogWrite(en, pwm);
      break;
    case FREN:                       // IN1 = IN2, EN açık: motor uçları kısa devre
      digitalWrite(in1, HIGH);
      digitalWrite(in2, HIGH);
      analogWrite(en, 255);
      break;
    case SERBEST:                    // EN kapalı: motor boşta döner
      digitalWrite(in1, LOW);
      digitalWrite(in2, LOW);
      analogWrite(en, 0);
      break;
  }
}

int sonAdim = -1;

void setup() {
  pinMode(SOL_EN, OUTPUT); pinMode(SOL_IN1, OUTPUT); pinMode(SOL_IN2, OUTPUT);
  pinMode(SAG_EN, OUTPUT); pinMode(SAG_IN1, OUTPUT); pinMode(SAG_IN2, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  int adim = (millis() / ADIM_SURESI) % 4;
  if (adim != sonAdim) {
    sonAdim = adim;
    Durum d = (Durum)adim;
    int pwm = (d == GERI) ? PWM_GERI : PWM_ILERI;
    surucu(SOL_EN, SOL_IN1, SOL_IN2, d, pwm);
    surucu(SAG_EN, SAG_IN1, SAG_IN2, d, pwm);
    Serial.println(ISIMLER[adim]);
  }
}
```

### Nasıl çalışıyor?
1. `surucu()` bir motorun üç pinini birlikte ayarlar. Durumlar doğruluk tablosundaki satırlardır.
2. `loop()` zamanı `millis()` ile 1500 ms'lik adımlara böler (27. ders). Adım değişince iki motoru da yeni duruma sokar ve adını yazdırır.
3. Geri hareket bilerek daha düşük PWM (120) ile yapılıyor; böylece hızın PWM'e bağlı olduğunu ölçebilirsin.

### Ölçüm
Benzetimdeki robotu bu sketch ile çalıştırdık:

| Adım | Ölçülen |
|---|---|
| ILERI, PWM 200 | Robot +x yönünde, 0,29 m/s hızla düz gitti. 76. dersteki modelle (0,289 m/s) uyuşuyor |
| FREN | Pinler IN1..IN4 = 1 1 1 1, EN yüksek. Robot yaklaşık 2 cm sonra durdu |
| GERI, PWM 120 | Robot ters yöne, 0,13 m/s hızla gitti: PWM yaklaşık yarıya inince hız yarıdan da az |
| SERBEST | Pinler hepsi 0. Robot yaklaşık 1 cm sonra durdu |

PWM 200 ile 120 arasında hız oranı, PWM oranı kadar değil. Çünkü hız PWM'in kendisiyle değil, **ölü bölgenin üstündeki kısmıyla** orantılıdır. 78. derste bunu inceleyeceğiz.

Benzetimin sınırı: Bu robot modeli fren ile serbest bırakmayı birbirinden ayırmaz. Her ikisinde de tekerlek hızı, motor gecikmesi denen yaklaşık 80 ms'lik bir zaman sabitiyle üstel olarak sıfıra iner. Gerçek robotta fren genellikle daha kısa sürede durdurur. Yön ve PWM davranışı ise benzetimde doğrulanmıştır.

### Dene
- `PWM_ILERI`'yi 255 yap. Robot frene girmeden önce ne kadar hızlı gidiyor, durma mesafesi değişiyor mu?
- `PWM_ILERI`'yi 60 yap. Robot nasıl hareket ediyor? 51 altına inince ne olur?
- FREN adımını SERBEST ile değiştir. Robotun durma mesafesi ne kadar değişiyor? Benzetimde ve gerçek robotta aynı mı olur?

### Sık yapılan hatalar
- `analogWrite`'ı PWM olmayan bir pine yazmak. Uno'da PWM pinleri 3, 5, 6, 9, 10, 11'dir; EN için D5 ve D6 kullanıyoruz.
- L298N kartındaki EN jumper'ı takılıyken PWM ile hız ayarlamaya çalışmak: hız değişmez.
- TB6612'de `STBY`'yi bağlamayı unutmak: motor hiç dönmez.
- GND'leri birleştirmemek: yön ve PWM sinyalleri sürücüde anlaşılmaz, motor rastgele davranır.
- Tam hızdan ani yön değiştirmek.

## Konuşalım
Bir robot yokuş aşağı inerken motorlar serbest bırakılırsa robot ne yapar, frene basılırsa ne yapar? Robotun hangi anlarında fren, hangi anlarında serbest bırakma işine yarar?
