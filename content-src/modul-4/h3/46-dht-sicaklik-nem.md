# DHT11 ve DHT22: sıcaklık ve nem
süre: 25

## Merak
Hava durumu uygulaması "sıcaklık 24 derece, nem yüzde 60" der. Odanın havası kuru mu, bunaltıcı mı, bunu sıcaklık tek başına söylemez; nem de lazımdır. Tek bir küçük sensör ikisini birden ölçebilir. Üstelik tek bir veri kablosuyla. Bu derste DHT sensörünü okuyacak, iki modeli ölçümle karşılaştıracak ve sensör bağlı değilken programın çökmemesini öğreneceksin.

## Etkinlik
### Devre
| Parça | Bağlantı |
|---|---|
| DHT22 (ya da DHT11) modülü | VCC → 5 V, GND → GND, DATA (veri) → **D5** |

3 bacaklı modüllerde veri hattı için gereken yükseltme (pull-up) direnci kartın üzerindedir. Çıplak 4 bacaklı sensör kullanıyorsan veri ile VCC arasına bir direnç koyman gerekir; değerini sensörün veri sayfasına bakarak seç.

### Yeni kavramlar
- **Bağıl nem:** Havanın o sıcaklıkta taşıyabileceği en çok su buharının yüzde kaçını taşıdığını söyler. % 0 çok kuru, % 100 doyma demektir.
- **Kütüphane:** 34. derste gördün. DHT sensörü kendi iletişim kuralıyla konuşur; bunu elle yazmak yerine `DHT sensor library` (Adafruit) kütüphanesini kullanırız. Sketch'in başına `#include <DHT.h>` yazarsın.
- **`isnan(x)`:** "Bu sayı geçerli mi?" sorusudur. `isnan`, "sayı değil" (not a number, NaN) demektir. Kütüphane okuyamazsa `NaN` döndürür. `NaN` ile hesap yaparsan sonuç da `NaN` olur, o yüzden okumayı **kullanmadan önce** `isnan` ile denetle.

### Program 1: sıcaklık ve nem
```cpp
// sketch: dht_oku
#include <DHT.h>

#define DHT_PIN 5
#define DHT_TIP DHT22        // DHT11 kullanıyorsan burayı DHT11 yap

DHT dht(DHT_PIN, DHT_TIP);

void setup() {
  Serial.begin(9600);
  dht.begin();
}

void loop() {
  delay(2000);                          // okumalar arası en az 2 sn
  float nem = dht.readHumidity();
  float sicaklik = dht.readTemperature();   // santigrat

  if (isnan(nem) || isnan(sicaklik)) {
    Serial.println("Okuma hatasi");
    return;
  }

  Serial.print("Sicaklik: ");
  Serial.print(sicaklik, 1);
  Serial.print(" C  Nem: ");
  Serial.print(nem, 1);
  Serial.println(" %");
}
```

### Nasıl çalışıyor?
1. `DHT dht(DHT_PIN, DHT_TIP)` sensörün hangi pinde ve hangi modelde olduğunu söyler. Model yanlışsa değerler anlamsız çıkar.
2. `delay(2000)` rastgele konmadı. DHT sensörleri yavaştır: iki okuma arasında en az 2 saniye beklemelisin. Daha sık sorarsan kütüphane çoğu zaman bir önceki değeri tekrar verir.
3. `readHumidity()` nemi yüzde, `readTemperature()` sıcaklığı santigrat olarak döndürür.
4. `if (isnan(...))` hata yolunu kurar. Kablo çıkmışsa ya da sensör cevap vermiyorsa program "Okuma hatasi" yazar ve bir sonraki tura geçer.

### DHT11 ile DHT22 farkını ölç
Programdaki tek satırı değiştir: `#define DHT_TIP DHT11`. Sensör 23,4 derece ve yüzde 55,2 nem gösterirken benzetimde şunu okuduk:

| Model | Seri çıktı |
|---|---|
| DHT22 | `Sicaklik: 23.4 C  Nem: 55.2 %` |
| DHT11 | `Sicaklik: 23.0 C  Nem: 55.0 %` |

DHT22 virgülden sonra bir basamak verir, DHT11 yalnızca tam sayı verir. Ama dikkat: ekranda ondalık görmek **doğru ölçtüğü** anlamına gelmez. İki modelin ne kadar doğru ölçtüğü, hangi aralıkta çalıştığı ve ölçüm hızı için kendi sensörünün veri sayfasına bak.

### Program 2: bloklamayan okuma ve sensör yokken davranış
`delay(2000)` tüm programı 2 saniye durdurur. 27. derste öğrendiğin `millis()` ile okumayı zamanlayalım. Bu sürümde ayrıca üst üste 3 hata olursa eski değeri göstermeyi bırakıp "SENSOR YOK" der; çünkü saatlerce eski bir sıcaklığı güncelmiş gibi göstermek yanıltıcıdır.

```cpp
// sketch: dht_millis
#include <DHT.h>

DHT dht(5, DHT22);

const unsigned long ARALIK = 2000;   // ms
unsigned long sonOlcum = 0;

float sicaklik = NAN;                // NAN: henüz geçerli değer yok
float nem = NAN;
int ardisikHata = 0;

void setup() {
  Serial.begin(9600);
  dht.begin();
}

void loop() {
  unsigned long simdi = millis();

  if (simdi - sonOlcum >= ARALIK) {
    sonOlcum = simdi;

    float n = dht.readHumidity();
    float s = dht.readTemperature();

    if (isnan(n) || isnan(s)) {
      ardisikHata++;
      if (ardisikHata >= 3) {        // eski değeri artık gösterme
        sicaklik = NAN;
        nem = NAN;
      }
    } else {
      sicaklik = s;
      nem = n;
      ardisikHata = 0;
    }

    if (isnan(sicaklik)) {
      Serial.print("SENSOR YOK  Ardisik hata: ");
      Serial.println(ardisikHata);
    } else {
      Serial.print("T=");
      Serial.print(sicaklik, 1);
      Serial.print(" N=");
      Serial.println(nem, 1);
    }
  }
  // burada başka işler de yapılabilir; loop() beklemez
}
```

Bu programı DHT bağlı **değilken** de çalıştırdık. Henüz hiç geçerli okuma olmadığı için ilk turdan itibaren `SENSOR YOK  Ardisik hata: 1`, `... 2`, `... 3` satırları çıktı; program çökmedi, `loop()` çalışmaya devam etti. Sensör 5 saniye sonra takılınca bir sonraki turda `T=20.0 N=50.0` satırları başladı. Sensör bir süre sağlıklı okuduktan sonra koparsa, kod ilk iki hatada son geçerli değeri göstermeyi sürdürür, üçüncüde bırakır.

### Dene
- `dht_oku` programında `DHT_TIP` satırını DHT11 yap, tabloyla karşılaştır. Sıcaklığı değiştirdiğinde DHT11 çıktısı nasıl adım adım değişiyor?
- `delay(2000)` değerini 500 yap. Seri çıktıdaki değerler her tur değişiyor mu, yoksa aynı değer birkaç kez mi tekrarlanıyor?
- `dht_millis` programında DATA kablosunu çek. Kaçıncı satırda "SENSOR YOK" görüyorsun? Kabloyu takınca ne oluyor?

### Sık yapılan hatalar
- `isnan` denetimi koymamak: okuma başarısızsa `NaN` ile hesap yaparsın ve ekranda `nan` görürsün.
- Modeli yanlış yazmak (DHT11 sensöre `DHT22` demek): değerler tuhaf çıkar.
- Okumayı 2 saniyeden sık denemek.
- Güç vermeden hemen sonra okumak: sensöre açıldıktan sonra biraz zaman tanı; süre için veri sayfasına bak.
- DATA pinini ya da yükseltme direncini unutmak: sürekli `Okuma hatasi` görürsün.

## Konuşalım
DHT22 virgülden sonraki basamağı gösteriyor, DHT11 göstermiyor. Peki fazla basamak göstermek ölçümün daha doğru olduğunu kanıtlar mı? Bir bilgisayarın ya da ekranın "çok basamak göstermesi" ile "doğru göstermesi" arasındaki farkı örnekle anlat.
