# Robot kol: servolar ve iki eksen ters kinematik
süre: 35

## Merak
Bir robot kola "masadaki şu noktaya git" demek istiyorsun. Ama kolun elinde nokta yok, sadece iki servo var: biri omuzda, biri dirsekte. Servolara hangi açıları vereceksin? Bu soruya cevap bulmak ters kinematiktir. İyi haber: iki eksenli düz bir kol için cevap, okulda öğrendiğin kosinüs teoremiyle çıkıyor.

## Etkinlik
### Devre
Robot kolun servoları sürüş motorlarından bağımsızdır; bu derste ve sonraki derste kol tek başına çalışır.

| Parça | Bağlantı |
|---|---|
| Omuz servosu | sinyal **D9** |
| Dirsek servosu | sinyal **D10** |
| Tutucu servosu | sinyal **D11** |
| Servo gücü | Servoların kırmızı (+) ucu **harici 5 V** kaynağa, kahverengi (−) ucu hem harici kaynağın eksisine hem Arduino **GND**'ye (ortak GND) |

Servolar ve özellikle birlikte çalışan üç servo, Arduino'nun 5 V pininden çekilemeyecek kadar akım ister. Mutlaka harici güç kullan ve GND'leri birleştir. Pil takarken artıyı eksiyi ters bağlama, uçları birbirine değdirme.

### Kolun geometrisi
Kolun iki parçası var: omuzdan dirseğe uzanan **üst kol** (uzunluğu `L1`) ve dirsekten tutucuya uzanan **ön kol** (`L2`). Bu derste ikisi de 10 cm. Koordinat merkezi omuz eksenidir; x ileri, y yukarı doğrudur ve birimimiz santimetredir.

İki açı kullanırız (servo açısıyla aynıdır, 0-180°):
- **q1 (omuz):** üst kolun yatayla (x ekseniyle) yaptığı açı. 0° = ileri yatay, 90° = dik yukarı, 180° = geri yatay.
- **q2 (dirsek):** ön kolun, üst kolun uzantısından ne kadar aşağı kapandığı. 0° = kol düz uzanmış, 90° = dirsek dik açı, 180° = ön kol üst kolun üstüne katlanmış.

Servo kola takılırken bu tanıma uyacak biçimde takılır. Kendi kolunda 0° başka yerdeyse açıları buna göre kaydırman gerekir.

**İleri kinematik** (açılardan konuma): üst kol q1 yönünde, ön kol ise (q1 − q2) yönündedir.

```
x = L1·cos(q1) + L2·cos(q1 − q2)
y = L1·sin(q1) + L2·sin(q1 − q2)
```

**Ters kinematik** (konumdan açılara): hedef (x, y) olsun. Omuz, dirsek ve hedef bir üçgen oluşturur; kenarları `L1`, `L2` ve `r = √(x² + y²)`'dir. Kosinüs teoreminden:

```
cos(q2) = (r² − L1² − L2²) / (2·L1·L2)
q2 = acos(...)
q1 = atan2(y, x) + atan2(L2·sin(q2), L1 + L2·cos(q2))
```

İlk satır dirsek açısını verir. Üçgendeki dirsek açısı `180° − q2`'dir, bu yüzden formülde işaret böyle çıkar. İkinci satırda hedefe bakış açısına (`atan2(y, x)`), üçgenin omuz açısı eklenir. Bu çözümde dirsek üstte kalır. Dirseğin altta kalacağı ikinci bir çözüm de vardır, ancak bu servo düzeninde dirsek yalnız tek yöne kapanabildiği için onu kullanmıyoruz.

### Erişilemeyen noktalar
Her hedef için iki şeyi kontrol et:
1. **Erişim:** `cos(q2)` 1'den büyük ya da −1'den küçükse üçgen kurulamaz. Hedef çok uzaktadır (`r > L1 + L2`, yani 20 cm üstü).
2. **Servo sınırı:** Hesaplanan q1 ya da q2 0-180° dışına çıkıyorsa servo oraya gidemez. Örneğin omuz 0°'nin altına inemez. Yani omuzun çok altında kalan noktalara kol uzanamaz.

Erişilemeyen hedefte servolara **hiçbir şey yazma**; kol olduğu yerde kalsın.

### Servo açısından darbe genişliğine
Servo, ders 21'de gördüğün gibi darbe genişliğiyle sürülür. `Servo.write(açı)` açıyı yaklaşık 544 µs (0°) ile 2400 µs (180°) arasına yerleştirir. `writeMicroseconds()` ile doğrudan µs yazarsan 1 µs yaklaşık 0,1° eder; `write()` ise tam derece verir. Yüksek hassasiyet için µs kullanacağız:

```
darbe (µs) = 544 + açı · (2400 − 544) / 180
```

### Program
Program altı hedefi sırayla dener. Erişilebilen hedefte açıları hesaplar, servolara yazar, ileri kinematikle geri hesap yapıp hedeften sapmayı milimetre olarak yazdırır.

```cpp
// sketch: kol_ters_kinematik
#include <Servo.h>

const int OMUZ_PIN = 9, DIRSEK_PIN = 10, TUTUCU_PIN = 11;
const float L1 = 10.0, L2 = 10.0;         // cm
const float DERECE = 180.0 / PI;

Servo omuz, dirsek, tutucu;

int acidanUs(float aci) {                 // 0-180° → darbe genişliği (µs)
  return (int)(544 + aci * (2400 - 544) / 180.0 + 0.5);
}

void ileri(float q1, float q2, float &x, float &y) {
  float a1 = q1 / DERECE;
  float a2 = (q1 - q2) / DERECE;
  x = L1 * cos(a1) + L2 * cos(a2);
  y = L1 * sin(a1) + L2 * sin(a2);
}

// 0: tamam, 1: erişilemez (çok uzak), 2: servo sınırı dışında
int ters(float x, float y, float &q1, float &q2) {
  float r2 = x * x + y * y;
  float c = (r2 - L1 * L1 - L2 * L2) / (2 * L1 * L2);
  if (c > 1.0 || c < -1.0) return 1;
  float s2 = acos(c);                      // dirsek bükülmesi (radyan)
  float hedefAci = atan2(y, x);
  float omuzRad = hedefAci + atan2(L2 * sin(s2), L1 + L2 * cos(s2));
  q1 = omuzRad * DERECE;
  q2 = s2 * DERECE;
  if (q1 < 0 || q1 > 180 || q2 < 0 || q2 > 180) return 2;
  return 0;
}

const int HEDEF_SAYISI = 6;
const float HEDEF[HEDEF_SAYISI][2] = {
  {14, 6}, {10, 10}, {18, 0}, {-6, 12}, {8, -12}, {25, 5}
};

void setup() {
  Serial.begin(9600);
  omuz.attach(OMUZ_PIN);
  dirsek.attach(DIRSEK_PIN);
  tutucu.attach(TUTUCU_PIN);
  omuz.writeMicroseconds(acidanUs(90));    // başlangıç: kol dik yukarı
  dirsek.writeMicroseconds(acidanUs(0));
  tutucu.write(90);
  delay(1000);

  for (int i = 0; i < HEDEF_SAYISI; i++) {
    float x = HEDEF[i][0], y = HEDEF[i][1];
    float q1, q2;
    int sonuc = ters(x, y, q1, q2);

    Serial.print("t=");        Serial.print(millis());
    Serial.print(" hedef=");   Serial.print(x, 1);
    Serial.print(",");         Serial.print(y, 1);

    if (sonuc == 0) {
      float gx, gy;
      ileri(q1, q2, gx, gy);               // geri hesap: doğrulama
      float hata = sqrt((gx - x) * (gx - x) + (gy - y) * (gy - y)) * 10.0;   // cm → mm
      Serial.print(" q1=");      Serial.print(q1, 2);
      Serial.print(" q2=");      Serial.print(q2, 2);
      Serial.print(" ileri=");   Serial.print(gx, 2);
      Serial.print(",");         Serial.print(gy, 2);
      Serial.print(" hata_mm="); Serial.println(hata, 3);
      omuz.writeMicroseconds(acidanUs(q1));
      dirsek.writeMicroseconds(acidanUs(q2));
    } else if (sonuc == 1) {
      Serial.println(" ULASILAMAZ uzak");
    } else {
      Serial.println(" ULASILAMAZ servo siniri");
    }
    delay(1500);
  }
}

void loop() {
}
```

### Nasıl çalışıyor?
1. `ters()` önce `cos(q2)` değerine bakar. 1'den büyük ya da −1'den küçükse hedef kolun menzili dışındadır ve `1` döner.
2. Sonra iki açıyı formülden hesaplar. 0-180° dışındaysa servo oraya gidemez, `2` döner.
3. Sadece sonuç `0` ise servolar hareket eder. Diğer iki durumda kol yerinde kalır.
4. Servolara `writeMicroseconds()` ile yazıyoruz. Tam derece yuvarlaması (`write()`) en fazla yarım derece hata yaratırdı; 20 cm'lik bir kolun ucunda bu yaklaşık 1,7 mm eder. µs ile hata çok küçüktür.
5. `ileri()` hesaplanan açılarla hedefe geri dönmeyi dener. Bu fark `hata_mm` olarak yazdırılır. Ters ve ileri kinematik birbirinin tersi olmalıdır; fark sıfıra yakın değilse formülde ya da koddaki işaretlerde hata vardır.

Seri çıktıda ilk hedef için şunu görürsün: `q1=63,60 q2=80,79` ve `hata_mm` bir milimetrenin çok altında. `{10, 10}` hedefinde `q1 = 90°`, `q2 = 90°` çıkar: üst kol dik, ön kol yatay. Kafanda canlandırıp doğru mu diye kontrol et. `{8, -12}` noktası omuzun çok altında olduğu için servo sınırında kalır, `{25, 5}` ise 20 cm'lik menzilin dışındadır.

### Dene
- `L2` değerini 15 yap (ve `L1`'i 10 bırak). Kolun menzili ne olur? Çok yakın noktalara (örneğin `{2, 1}`) erişebilir mi?
- `HEDEF` dizisine kendi noktalarını ekle. Hangileri `ULASILAMAZ` çıkıyor? Bunu elle çizerek doğrula.
- `ileri()` fonksiyonunda `(q1 - q2)` yerine `(q1 + q2)` yaz. `hata_mm` ne olur? Bu hata türünü yakalamak için ters ve ileri kinematiği neden birlikte kullanırız?

### Sık yapılan hatalar
- Açıları radyan/derece karıştırmak: `cos()` ve `sin()` radyan ister, servo derece ister.
- `acos()` içine 1'in biraz üstünde bir değer vermek: sonuç `NaN` olur. Önce aralığı kontrol et.
- Erişilemeyen hedefi de servoya yazmak: `NaN` ya da sınır dışı açılar servoyu zorlar. Önce `ters()` sonucunu kontrol et.
- Servoları Arduino'nun 5 V pininden beslemek: kart sıfırlanır ya da servolar titrer.
- Servo kola takılırken 0° referansını unutmak: hesap doğru olsa da kol yanlış yere gider.

### Gerçek robotta farklı olabilecekler
Benzetimde servo darbeyi anında yerine gider ve yükü yoktur. Gerçek bir servo yük altında hedef açıya tam ulaşamayabilir, ucuz servoların dişli boşluğu vardır ve darbe-açı eşlemesi (544-2400 µs) servodan servoya biraz değişir. Bu yüzden her servoyu kendi kolunda kalibre etmen gerekir. Kol uzunluklarını cetvelle ölç ve koda yaz; hesabın doğruluğu bu ölçülere bağlıdır.

## Konuşalım
Bir insan kolu da omuz ve dirsekle çalışır ve masadaki bir fincana uzanırken ters kinematiği "hesaplamaz", sadece uzanır. Robot kol neden hesaplamak zorunda? Hedef noktaya giden iki farklı dirsek konumu olabildiğini düşün; hangisini seçerdin ve neden?
