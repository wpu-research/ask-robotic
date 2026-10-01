# Tamamlayıcı filtre ve Kalman'a giriş
süre: 25

## Merak
Önceki derste eğimi iki yoldan ölçtün. İvmeölçer açıyı doğrudan verir ama motor titreşince değerleri zıplar. Jiroskop pürüzsüzdür ama açıyı bulmak için toplamak gerekir ve en küçük sapma bile zamanla büyür. İkisi de tek başına yetmiyor. Peki ikisini birleştirip hem pürüzsüz hem sapmasız bir açı elde edebilir misin?

## Etkinlik
### Devre
Bir önceki dersle aynı: MPU6050 modülü, SDA → **A4**, SCL → **A5**, AD0 → GND (adres 0x68). Motorlar bu derste kullanılmıyor.

### Fikir: kim neyde iyi?
| Sensör | Kısa sürede (hızlı değişimde) | Uzun sürede |
|---|---|---|
| İvmeölçer | Gürültülü (titreşim, sarsıntı) | Doğru (yerçekimine bağlı) |
| Jiroskop (hızın toplamı) | Pürüzsüz ve hızlı | Kayar (sapma birikir) |

**Tamamlayıcı filtre** her birinin iyi olduğu tarafı alır:

`aci = α · (aci + hiz · dt) + (1 − α) · ivmeAci`

- `aci + hiz · dt`: önceki açıyı jiroskopla ilerlet (kısa vadede güven).
- `ivmeAci`: ivmeölçerden gelen açı. Küçük bir pay (`1 − α`) ile her adımda tahmini ona doğru çeker; böylece sapma birikemez.
- `α` 0 ile 1 arasında bir sayıdır. Tipik değer 0,98'dir: tahminin %98'i jiroskop, %2'si ivmeölçerden gelir.

Filtrenin "ne kadar çabuk unuttuğu" yaklaşık `τ ≈ α · dt / (1 − α)` zaman sabitiyle bulunur. Bu derste turlar yaklaşık 5,4 ms sürdüğü için (`dt ≈ 5,4 ms`) `τ ≈ 0,26 s`: ivmeölçerin kalıcı bilgisi yaklaşık bu sürede açıya yansır, daha hızlı titreşimlerin çoğu süzülür. `α` büyüdükçe jiroskoba daha çok güvenirsin (daha pürüzsüz ama sapma daha geç düzelir); küçüldükçe ivmeölçer gürültüsü açıya geçer.

`dt` saniye cinsinden, iki ölçüm arasındaki gerçek süredir. Bu derste `micros()` ile ölçüyoruz; sabit periyot konusuna 103'te gireceğiz.

### Tezgâh deneyi
Robotu masada elle ileri geri sallıyormuş gibi bir hareket (±15°, saniyede 0,4 tur) benzetildi. Hareket sırasında:
- ivmeölçere motor titreşimi gibi gürültü bindirildi (±0,12 g rastgele gürültü ve 0,08 g genlikli 37 Hz titreşim),
- jiroskop 2 °/s sapmalı yapıldı; sapma düzeltilmedi.

### Program: üç açıyı yan yana yaz
```cpp
// sketch: tamamlayici_filtre
#include <Wire.h>

const int MPU_ADRES = 0x68;
const float RAD_DERECE = 57.2958;
const float JIRO_OLCEK = 65.5;        // ±500 °/s
const float IVME_OLCEK = 16384.0;
const float ALFA = 0.98;              // jiroskop payı

float aciIvme = 0;                    // yalnız ivmeölçer
float aciJiro = 0;                    // yalnız jiroskop integrali
float aciFiltre = 0;                  // tamamlayıcı filtre
unsigned long sonUs = 0;
unsigned long sonYazdirMs = 0;
bool ilk = true;

int16_t oku16() {
  uint8_t yuksek = Wire.read();
  uint8_t alcak = Wire.read();
  return (int16_t)(((uint16_t)yuksek << 8) | alcak);
}

void imuOku(float &ivmeAci, float &hiz) {
  Wire.beginTransmission(MPU_ADRES);
  Wire.write(0x3B);
  Wire.endTransmission(false);
  Wire.requestFrom(MPU_ADRES, 14, true);
  int16_t axHam = oku16();
  oku16();
  int16_t azHam = oku16();
  oku16();
  oku16();
  int16_t gyHam = oku16();
  oku16();
  ivmeAci = atan2(axHam / IVME_OLCEK, azHam / IVME_OLCEK) * RAD_DERECE;
  hiz = gyHam / JIRO_OLCEK;
}

void setup() {
  Serial.begin(115200);
  Wire.begin();
  Wire.beginTransmission(MPU_ADRES);
  Wire.write(0x6B);
  Wire.write(0);
  Wire.endTransmission(true);
  Wire.beginTransmission(MPU_ADRES);
  Wire.write(0x1B);
  Wire.write(0x08);
  Wire.endTransmission(true);
  sonUs = micros();
}

void loop() {
  unsigned long simdi = micros();
  float dt = (simdi - sonUs) / 1000000.0;   // iki ölçüm arası gerçek süre (s)
  sonUs = simdi;

  float ivmeAci, hiz;
  imuOku(ivmeAci, hiz);

  if (ilk) {                                // başlangıç: üçü de ivmeölçerle başlasın
    aciIvme = aciJiro = aciFiltre = ivmeAci;
    ilk = false;
  } else {
    aciIvme = ivmeAci;
    aciJiro += hiz * dt;                                         // saf integral
    aciFiltre = ALFA * (aciFiltre + hiz * dt) + (1 - ALFA) * ivmeAci;
  }

  if (millis() - sonYazdirMs >= 100) {      // saniyede 10 satır
    sonYazdirMs = millis();
    Serial.print(millis());
    Serial.print(',');
    Serial.print(aciIvme, 1);
    Serial.print(',');
    Serial.print(aciJiro, 1);
    Serial.print(',');
    Serial.println(aciFiltre, 1);
  }
  delay(5);
}
```

### Nasıl çalışıyor?
1. Her turda `dt` hesaplanır; `micros()` mikrosaniye sayar.
2. `aciJiro` yalnız jiroskopu toplar; sapma ile birlikte toplanır, yani hata sürekli büyür.
3. `aciFiltre` aynı toplamı yapar ama her turda `(1 − α)` kadar ivmeölçer açısına çekilir. Sapmanın birikmesi bu çekimle dengelenir.
4. İlk turda üç değer de ivmeölçer açısıyla başlar; sıfırdan başlatsan filtre doğru açıya gelene kadar yanlış açı verir.

### Ölçüm: açı hatası
Aynı 20 saniyelik hareketi üç yöntemle ölçtük ve gerçek açıyla karşılaştırdık (ilk 2 sn atıldı; hata = ölçülen − gerçek).
| Yöntem | Ortalama (RMS) hata | En büyük hata |
|---|---|---|
| Yalnız ivmeölçer | 5,2° | 11,1° |
| Yalnız jiroskop (integral) | 27,2° | 43,2° (20. saniyede) |
| Tamamlayıcı filtre (α = 0,98) | 0,65° | 1,7° |

Yorum: saf ivmeölçer ortalamada doğru ama titreşimle zıplıyor; saf jiroskop pürüzsüz ama hata durmadan büyüyor (2 °/s sapma × 20 sn ≈ 43°); tamamlayıcı filtre ikisinin de sorununu büyük ölçüde gideriyor. Filtrede kalan küçük sabit hata, sapma ile zaman sabitinin çarpımı kadardır (≈ 2 °/s × τ), yani jiroskop sapmasını 101'deki gibi açılışta ölçüp çıkarırsan daha da küçülür.

### Kalman filtresine giriş (yalnız kavram)
Tamamlayıcı filtrenin `α` değeri sabittir: sen seçersin ve hep aynı kalır. **Kalman filtresi** de aynı fikri (jiroskopla ilerlet, ölçümle düzelt) kullanır, ama düzeltme payını (**Kalman kazancı**) her adımda sensörlerin ne kadar güvenilir olduğuna ve tahminin ne kadar belirsiz olduğuna bakarak kendisi hesaplar:

`yeni tahmin = tahmin + K · (ölçüm − tahmin)`

Tahmin belirsizse `K` büyür (ölçüme çok güvenir), ölçüm gürültülüyse `K` küçülür. Robot kodlarında sık görülen sürümü, açıyla birlikte jiroskop sapmasını da tahmin eder. Bedeli: matris işlemleri, gürültü ayarları (hangi sensöre ne kadar güveneceğini sen belirtirsin) ve daha uzun işlem süresi. Bu kursta tamamlayıcı filtreyle devam ediyoruz: tek satırdır, tek ayar değeri vardır ve benzetimdeki robotu dengelemeye yeter. İlerde daha hassas bir ölçüme ihtiyaç duyarsan Kalman'ı öğrenmek için hazır olacaksın.

### Dene
- `ALFA`'yı 0,9 yap. Filtrenin çıktısı nasıl değişiyor? 0,995 yap; bu kez ne oluyor?
- `ilk` bloğunu sil ve `aciFiltre`'yi 0'dan başlat. Başlangıç açısı 15° olsaydı filtrenin doğru değere oturması ne kadar sürerdi? (İpucu: τ)
- 101'deki `gyro_sifir` fikrini ekle: açılışta sapmayı ölç ve `hiz`'dan çıkar. Hata nasıl değişiyor?

### Sık yapılan hatalar
- `dt`'yi sabit (örneğin 0,005) yazmak ama döngü aslında 5,3 ms'de dönüyorsa jiroskop integrali yaklaşık %6 küçük çıkar. 103'te ölçeceğiz.
- Açıyı derece, hızı radyan/s cinsinden karıştırmak. İkisi de derece olmalı.
- `α` ve `(1 − α)` toplamını 1'den farklı seçmek: filtre ya şişer ya söner.
- Filtreyi başlatmamak (ilk açıyı 0 almak).
- Robot hızlanırken ivmeölçerin yerçekiminden başka şey de ölçtüğünü unutmak: filtre bunu yalnız bir ölçüde süzer.

### Gerçek robotta farklı olabilecekler
Gerçek bir ivmeölçerdeki titreşim, motorların ve tekerleklerin yapısına göre çok farklı olabilir; bazen gürültü bu derste verilenden çok büyüktür ve `α`'yı 0,99'a çıkarmak gerekebilir. Jiroskop sapması da sıcaklıkla değişir. Buradaki sayılar benzetim içindir.

## Konuşalım
`α = 0,98` yerine `α = 0,5` kullanırsan filtre neye benzer? Jiroskop sapması hiç olmasaydı filtreye gerek kalır mıydı?
