# DHT11 / DHT22 sıcaklık ve nem sensörü
slug: dht
parça: dht
kategori: Sensör
özet: Sıcaklık ve bağıl nemi tek veri hattından veren sensör. DHT22 ondalıklı, DHT11 tam sayı sonuç verir.

## Pinler
- VCC: Besleme ucu. 5V'a bağlanır.
- DATA: Veri ucu. Uno'nun bir dijital pinine (derslerde D5) bağlanır.
- GND: Toprak ucu. GND'ye bağlanır.

## Nasıl çalışır
DHT sensörü sıcaklığı ve **bağıl nemi** ölçer ve ikisini de **tek bir veri hattı** üzerinden sayısal olarak gönderir. Bağıl nem, havanın o sıcaklıkta taşıyabileceği en çok su buharının yüzde kaçını taşıdığını söyler. Sensör yavaştır: iki okuma arasında **en az 2 saniye** beklemek gerekir.

Programda `DHT.h` kütüphanesi kullanılır: `DHT dht(pin, model)` ile tanıtılır, `readTemperature()` santigrat, `readHumidity()` yüzde verir. Okuma başarısızsa `NaN` döner; değer `isnan()` ile denetlenmelidir.

**İleri düzey:** Çıplak 4 bacaklı DHT sensörlerinde veri ucuyla VCC arasına bir yükseltme (pull-up) direnci gerekir. Laboratuvardaki 3 bacaklı modülde bu direnç kartın üzerindedir. Gerçek sensörün ölçüm aralığı ve doğruluğu için veri sayfasına bakılmalıdır.

## Laboratuvarda bağlantı
| Nereden | Nereye |
|---|---|
| DHT **VCC** | Uno **5V** |
| DHT **GND** | Uno **GND** |
| DHT **DATA** | Uno **D5** |

Özellik panelinde **Tür** (DHT11 ya da DHT22), **Sıcaklık** (-40 ile 80 °C) ve **Nem** (0 ile 100 %) bulunur; sıcaklık ve nem program çalışırken değiştirilebilir. DATA ucu bağlı değilse laboratuvar uyarı verir ve sensör çalışmaz.

## Tipik değerler
- Okuma aralığı | en az 2 sn | Daha sık okuma eski değeri tekrarlar
- DHT22 çözünürlüğü | 1 ondalık basamak | Laboratuvarda 23,5 °C değeri "23.5" yazar
- DHT11 çözünürlüğü | tam sayı | Laboratuvarda 23,5 °C değeri "24.0" yazar
- Veri pini | D5 | Bu sitedeki derslerin standardı
- Okuma başarısızsa | NaN | isnan() ile yakalanır

## Sık hatalar
- **`isnan` denetimi koymamak.** Okuma başarısız olunca ekranda `nan` görünür.
- **Modeli yanlış yazmak.** DHT11 sensöre `DHT22` demek anlamsız değerler üretir.
- **2 saniyeden sık okumak.** Sensör yetişemez, aynı değer tekrarlanır.
- **DATA kablosunu unutmak.** Program sürekli "Okuma hatasi" yazar.
- **Basamak sayısını doğruluk sanmak.** DHT22'nin daha çok basamak göstermesi her zaman daha doğru olduğunu kanıtlamaz.

## İlgili dersler
- sensorler-ve-projeler:3:1
- sensorler-ve-projeler:3:4
- sensorler-ve-projeler:3:5
