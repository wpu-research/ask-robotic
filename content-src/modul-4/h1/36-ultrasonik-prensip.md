# Ultrasonik prensip: ses, süre, mesafe
süre: 20

## Merak
Yarasa karanlıkta duvara çarpmadan uçar. Gözüyle değil, kulağıyla görür: bir ses çıkarır, sesin duvardan dönüp gelmesini bekler. Dönüş ne kadar geç olursa duvar o kadar uzaktadır. HC-SR04 sensörü de aynı şeyi yapar. Peki "ne kadar geç" bilgisini santimetreye nasıl çeviririz?

## Etkinlik
### Sensör nasıl çalışıyor?
HC-SR04'ün iki "gözü" var: biri hoparlör gibi ses gönderir (T), öbürü mikrofon gibi dinler (R). Gönderdiği ses **ultrasonik**tir: insan kulağının duyamayacağı kadar yüksek frekanslı bir sestir (bu sensörde 40 kHz).

Bir ölçüm şöyle yürür:
1. Kart, sensörün **TRIG** bacağına çok kısa bir HIGH darbesi verir. Bu darbe "ölç" komutudur.
2. Sensör 40 kHz'lik kısa bir ses demeti yollar.
3. Ses bir nesneye çarpıp geri döner.
4. Sensör, yolladığı andan geri geldiği ana kadar **ECHO** bacağını HIGH tutar.

Yani sensör sana mesafeyi vermez. Sana bir **süre** verir: ECHO'nun HIGH kaldığı süre. Mesafeyi bu süreden biz hesaplarız.

### Formül
Ses havada yaklaşık **343 m/s** hızla gider (yaklaşık 20 °C'de). Santimetre ve mikrosaniyeye çevirelim:

343 m/s = 34 300 cm/s = 34 300 / 1 000 000 cm/µs = **0,0343 cm/µs**

Ses nesneye gider ve geri gelir. Ölçtüğümüz süre **gidiş + dönüş** süresidir. Mesafe yalnızca gidiş yoludur, bu yüzden ikiye böleriz:

**mesafe (cm) = süre (µs) × 0,0343 / 2**

Kısa yol: 1 cm'lik mesafe gidiş dönüş yaklaşık 58 µs sürer. Süreyi 58'e bölersen de santimetreyi bulursun.

### Devre
| Parça | Bağlantı |
|---|---|
| HC-SR04 VCC | 5 V |
| HC-SR04 TRIG | **D9** |
| HC-SR04 ECHO | **D10** |
| HC-SR04 GND | GND |

Bu dersteki programlar sensöre henüz dokunmaz, yalnızca hesap yapar. Bağlantıyı şimdiden kur; 37. derste kullanacaksın. Modülün veri sayfasındaki tipik ölçüm aralığı 2 cm ile 400 cm arasındadır. Bu aralığın dışında ya da ses sensöre geri dönmeyecek şekilde yansıyorsa ECHO hiç HIGH olmaz.

### Program 1: süreden mesafeye
Beş farklı süre için formülü uygulayalım.

```cpp
// sketch: ses_mesafe_tablosu
const float SES_CM_US = 0.0343;   // 343 m/s = 0,0343 cm/us
unsigned long sureler[] = {583, 2915, 5830, 11660, 23320};   // mikrosaniye

void setup() {
  Serial.begin(9600);
  for (int i = 0; i < 5; i++) {
    float cm = sureler[i] * SES_CM_US / 2.0;
    Serial.print("sure=");
    Serial.print(sureler[i]);
    Serial.print(" us -> ");
    Serial.print(cm, 1);
    Serial.println(" cm");
  }
}

void loop() {
}
```

Çıktıda 583 µs için yaklaşık 10 cm, 5830 µs için yaklaşık 100 cm, 23 320 µs için yaklaşık 400 cm görürsün. 400 cm sensörün en uzak sınırıdır: ses 4 metre gidip 4 metre döner ve bu yaklaşık 23 milisaniye sürer. Ses çok hızlı ama ışık değil: 1 metrelik ölçüm bile 5,8 milisaniye alır.

### Sıcaklık ve ses hızı
343 m/s her zaman doğru değildir. Ses hızı havanın sıcaklığına bağlıdır. Kuru havada yaklaşık değer şöyledir:

**c ≈ 331,3 + 0,606 × T** (c: m/s, T: °C)

Sıcak havada ses daha hızlı gider, soğukta yavaş. Sensörün hesabı hep 343 m/s varsaydığı için sıcaklık değişince ölçüm kayar. Sensör, ses gerçekte 331,3 m/s ile giderken 343 m/s varsayarsa mesafeyi olduğundan büyük, ses 355 m/s ile giderken varsayarsa olduğundan küçük bulur. Aşağıdaki program, gerçek mesafesi 100 cm olan bir nesne için sıcaklığa göre ne okuyacağını hesaplar:

```cpp
// sketch: ses_sicaklik
float sesHizi(float sicaklikC) {          // m/s
  return 331.3 + 0.606 * sicaklikC;
}

void setup() {
  Serial.begin(9600);
  float sicakliklar[] = {0, 10, 20, 30, 40};
  for (int i = 0; i < 5; i++) {
    float c = sesHizi(sicakliklar[i]);
    float okunan = 100.0 * 343.0 / c;     // sensör 343 m/s sanıyor
    Serial.print("T=");
    Serial.print(sicakliklar[i], 0);
    Serial.print(" C  c=");
    Serial.print(c, 2);
    Serial.print(" m/s  gercek 100 cm -> ");
    Serial.print(okunan, 1);
    Serial.println(" cm");
  }
}

void loop() {
}
```

Sayılarla doğrulayalım: 20 °C'de c = 331,3 + 0,606 × 20 = 343,42 m/s; bu 343'e çok yakın, hata yaklaşık 0,1 cm. 0 °C'de c = 331,3 m/s ve sensör 100 cm'yi 103,5 cm okur. 40 °C'de c = 355,54 m/s ve sensör 96,5 cm okur. Yani sıcaklık 40 derece değişince 1 metrede yaklaşık 7 cm fark oluşur. Park sensörü gibi işlerde bu fark genelde kabul edilebilir. Santimetre hassasiyeti gerekiyorsa sıcaklığı ölçüp formüle koyarsın (13. dersteki NTC işe yarar).

### Nasıl çalışıyor?
1. `SES_CM_US` ses hızını santimetre/mikrosaniye cinsinden tutar. Birim dönüşümünü tek yerde yapınca hata riski azalır.
2. `sureler[i] * SES_CM_US / 2.0` gidiş dönüş süresini tek yönlü mesafeye çevirir. `2.0` yazdık ki bölme ondalıklı yapılsın (tam sayı bölmesi küsuratı atar).
3. `Serial.print(cm, 1)` sayıyı virgülden sonra 1 basamakla yazar.
4. `sesHizi` fonksiyonu sıcaklığı alıp c değerini m/s olarak döndürür. `okunan = 100 × 343 / c` oranı, sensörün yanlış varsayımının sonucudur.

### Dene
- 2 metre uzaktaki bir nesne için ECHO kaç µs HIGH kalır? Önce kâğıtta hesapla, sonra `sureler` dizisine yazıp programla karşılaştır.
- `sicakliklar` dizisine 35 koy. Gerçek 100 cm kaç santimetre okunur?
- Aynı sıcaklık hesabını 250 cm'lik bir mesafe için yap. Hata santimetre olarak büyür mü, küçülür mü?

### Sık yapılan hatalar
- `/ 2` bölmesini unutmak: mesafe iki katı çıkar, çünkü ses gidip geri gelmiştir.
- Birimleri karıştırmak: 343 m/s değerini 343 olarak cm/µs formülüne koymak. Önce aynı birime çevir.
- Sıcaklığın etkisini hiç bilmemek: bir gün sınıfta doğru çalışan park sensörü, soğuk garajda birkaç santimetre kayabilir.
- `100 * 343 / c` yerine tam sayılarla bölmek: sonuç küsuratsız çıkar. Ondalıklı yaz (`100.0`).

## Konuşalım
Bir nesne sensöre 10 cm yakınsa ECHO yaklaşık kaç µs HIGH kalır? Hiçbir nesne yoksa, yani ses geri dönmezse ECHO'ya ne olur?
