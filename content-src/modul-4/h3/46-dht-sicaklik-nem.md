# DHT11 ve DHT22: sıcaklık ve nem
süre: 25

## Merak
Hava durumu uygulaması "sıcaklık 24 derece, nem yüzde 60" der. Odanın havası kuru mu, bunaltıcı mı, bunu sıcaklık tek başına söylemez; nem de lazımdır. Tek bir küçük sensör ikisini birden ölçebilir. Üstelik tek bir veri kablosuyla. Bu derste DHT sensörünü okuyacak, iki modeli ölçümle karşılaştıracak ve sensör cevap vermediğinde programın çökmemesini öğreneceksin.

## Etkinlik
### Devre
Parçaları laboratuvarda **Parça ekle** menüsünden seç, pinleri kablo çekerek bağla.

| Parça | Bağlantı |
|---|---|
| DHT sensörü | VCC → 5V, GND → GND, DATA (veri) → **D5** |

DHT parçasının sağ paneldeki **Tür** özelliği DHT22 ya da DHT11 olur; **Sıcaklık** ve **Nem** kaydırıcıları sensörün "ölçtüğü" havayı belirler ve program çalışırken de değiştirilebilir. Laboratuvardaki parça 3 bacaklı modüldür; veri hattı için gereken yükseltme (pull-up) direnci modülün üzerinde sayılır.

Bilgi notu: Piyasada çıplak 4 bacaklı DHT sensörleri de vardır; onlarda veri ile VCC arasına bir direnç gerekir (değeri veri sayfasında yazar). Laboratuvardaki modülde buna gerek yok.

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
4. `if (isnan(...))` hata yolunu kurar. DATA kablosu bağlı değilse ya da sensör cevap vermiyorsa program "Okuma hatasi" yazar ve bir sonraki tura geçer.

### DHT11 ile DHT22 farkını ölç
Programdaki tek satırı değiştir: `#define DHT_TIP DHT11`. Sensör parçasının **Tür** özelliğini de DHT11 yap (önce ■ ile durdur). Sıcaklık kaydırıcısını 23,5 °C, Nem kaydırıcısını 55 % yaparak laboratuvarda şunu okuduk:

| Model | Seri çıktı |
|---|---|
| DHT22 | `Sicaklik: 23.5 C  Nem: 55.0 %` |
| DHT11 | `Sicaklik: 24.0 C  Nem: 55.0 %` |

DHT22 virgülden sonra bir basamak verir, DHT11 yalnızca tam sayı verir (23,5 değeri 24'e yuvarlandı). Ama dikkat: ekranda ondalık görmek **doğru ölçtüğü** anlamına gelmez. İki modelin ne kadar doğru ölçtüğü, hangi aralıkta çalıştığı ve ölçüm hızı için gerçek sensörlerin veri sayfalarına bak.

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

Bu programı DATA kablosu **olmadan** da çalıştırdık (kabloyu silmek için önce ■'e bas, kabloyu seç, **Delete**'e bas). Laboratuvar "DHT DATA ucu bağlı değil: sensör çalışmaz." uyarısını verir. Henüz hiç geçerli okuma olmadığı için ilk turdan itibaren `SENSOR YOK  Ardisik hata: 1`, `... 2`, `... 3` satırları çıktı; program çökmedi, `loop()` çalışmaya devam etti. DATA kablosunu yeniden çekip ▶'e basınca `T=...  N=...` satırları başlar. Sensör bir süre sağlıklı okuduktan sonra cevap vermezse, kod ilk iki hatada son geçerli değeri göstermeyi sürdürür, üçüncüde bırakır.

### Dene
- `dht_oku` programında `DHT_TIP` satırını DHT11 yap, sensörün **Tür** özelliğini de DHT11 yap ve tabloyla karşılaştır. Çalışırken sıcaklık kaydırıcısını yavaşça oynat: DHT11 çıktısı nasıl adım adım değişiyor?
- `delay(2000)` değerini 500 yap. Seri çıktıdaki değerler her tur değişiyor mu, yoksa aynı değer birkaç kez mi tekrarlanıyor?
- `dht_millis` programında ■ ile durdurup DATA kablosunu sil, ▶'e bas. Kaçıncı satırda "SENSOR YOK" görüyorsun? Kabloyu yeniden çekince ne oluyor?

### Sık yapılan hatalar
- `isnan` denetimi koymamak: okuma başarısızsa `NaN` ile hesap yaparsın ve ekranda `nan` görürsün.
- Modeli yanlış yazmak (DHT11 sensöre `DHT22` demek): değerler tuhaf çıkar.
- Okumayı 2 saniyeden sık denemek.
- Güç vermeden hemen sonra okumak: sensöre açıldıktan sonra biraz zaman tanı (gerçek sensörlerde süre için veri sayfasına bak).
- DATA kablosunu ya da (çıplak sensörde) yükseltme direncini unutmak: sürekli `Okuma hatasi` görürsün.

## Konuşalım
DHT22 virgülden sonraki basamağı gösteriyor, DHT11 göstermiyor. Peki fazla basamak göstermek ölçümün daha doğru olduğunu kanıtlar mı? Bir bilgisayarın ya da ekranın "çok basamak göstermesi" ile "doğru göstermesi" arasındaki farkı örnekle anlat.
