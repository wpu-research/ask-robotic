# Proje: Akıllı gece lambası
süre: 35

## Merak
Oda ışığı kapanınca gece lambası kendiliğinden yansa, sabah güneş doğunca sönse ve üstelik ısınırsa kendini kapatsa nasıl olurdu? Bu haftanın üç sensörünü tek bir akıllı cihazda birleştireceğiz.

## Etkinlik
### Hedef
- **LDR (A1):** ortam karardıkça lamba parlaklaşır, aydınlanınca söner.
- **Potansiyometre (A0):** lambanın en yüksek parlaklığını belirler (gece için çok parlak olmasın).
- **NTC (A2):** ortam 40 °C'yi aşarsa uyarı LED'i (D13) yanar ve lamba kapanır.
- **Seri monitör:** her turda ışık, parlaklık ve sıcaklık yazılır.

### Devre
Parçaları laboratuvarda **Parça ekle** menüsünden seç, pinleri kablo çekerek bağla.

| Parça | Bağlantı |
|---|---|
| Potansiyometre (10 kΩ) | **VCC** → 5V; **GND** → GND; **SIG** → **A0** |
| LDR | 1. ucu → 5V; 2. ucu → **A1** |
| 10 kΩ direnç (LDR için) | 1. ucu **A1**, 2. ucu GND |
| NTC termistör (10 kΩ) | 1. ucu → **A2**; 2. ucu → GND |
| 10 kΩ direnç (NTC için) | 1. ucu 5V, 2. ucu **A2** |
| LED (sarı ya da beyaz) = lamba | **D11** → 330 Ω direnç → LED **A**; LED **K** → GND |
| LED (kırmızı) = uyarı | **D13** → 330 Ω direnç → LED **A**; LED **K** → GND |

LED'in rengine göre direnç değeri değişebilir; 330 Ω kırmızı LED içindir. Sarı ve beyaz LED'lerde de 330 Ω genelde güvenli bir başlangıçtır (laboratuvar akım sınırı aşılırsa uyarı verir). Beyaz LED, sarıya göre biraz daha az parlak görünür; bu, LED'in ileri geriliminin farklı olmasındandır.

### Aşama 1: Işığa göre parlaklık
Önce yalnızca LDR ve lamba. Karanlıkta (`ham` küçükken) parlaklık yüksek olmalı. `map`'in çıkış aralığını ters yazarak (255'ten 0'a) bunu sağlarız. Aralığın dışına taşmaması için `constrain` ekliyoruz.

`KARANLIK` ve `AYDINLIK` değerlerini 14. dersteki gibi, LDR'nin ışık kaydırıcısını en uçlara götürüp seri monitörden okuyarak belirleyebilirsin.

```cpp
// sketch: lamba_adim1
const int KARANLIK = 150;   // bunun altı: tam karanlık
const int AYDINLIK = 700;   // bunun üstü: oda aydınlık

void setup() {
  pinMode(11, OUTPUT);
}

void loop() {
  int isik = analogRead(A1);
  int parlaklik = map(isik, KARANLIK, AYDINLIK, 255, 0);
  parlaklik = constrain(parlaklik, 0, 255);
  analogWrite(11, parlaklik);
  delay(50);
}
```

`const int`, değeri hiç değişmeyen bir sayı tanımlar. Ayar sayılarını başa koymak, sonradan bulup değiştirmeyi kolaylaştırır.

### Aşama 2: Tam akıllı gece lambası
Şimdi potansiyometre, NTC koruması ve yumuşatmayı ekliyoruz:

1. Potansiyometre `enYuksek` değerini belirler (0-255).
2. LDR 8 ölçümün ortalaması olarak okunur; lamba titremez.
3. NTC'den sıcaklık hesaplanır (13. ders). Sıcaklık sınırı aşılırsa uyarı yanar, lamba kapanır.
4. `map` çıkışı artık 255 yerine `enYuksek`'ten 0'a gider.

```cpp
// sketch: gece_lambasi
const int KARANLIK = 150;       // bunun altı: tam karanlık
const int AYDINLIK = 700;       // bunun üstü: oda aydınlık
const float SICAK_SINIR = 40.0; // bu sıcaklıkta lamba kapanır

void setup() {
  pinMode(11, OUTPUT);   // lamba (PWM)
  pinMode(13, OUTPUT);   // sıcaklık uyarısı
  Serial.begin(9600);
}

void loop() {
  // 1. Potansiyometre: en yüksek parlaklık (0-255)
  int enYuksek = analogRead(A0) / 4;

  // 2. LDR: 8 ölçümün ortalaması
  int toplam = 0;
  for (int i = 0; i < 8; i++) {
    toplam = toplam + analogRead(A1);
    delay(3);
  }
  int isik = toplam / 8;

  // 3. NTC: sıcaklık (beta formülü, B = 3950)
  float sicaklik = -99.0;                   // -99: geçerli ölçüm yok
  int hamS = analogRead(A2);
  if (hamS > 0 && hamS < 1023) {
    float r = 10000.0 * hamS / (1024.0 - hamS);
    float tK = 1.0 / (1.0 / 298.15 + log(r / 10000.0) / 3950.0);
    sicaklik = tK - 273.15;
  }

  // 4. Karar: karanlıkta enYuksek, aydınlıkta 0
  int parlaklik = map(isik, KARANLIK, AYDINLIK, enYuksek, 0);
  parlaklik = constrain(parlaklik, 0, enYuksek);

  if (sicaklik > SICAK_SINIR) {
    parlaklik = 0;                          // çok sıcak: lamba kapansın
    digitalWrite(13, HIGH);
  } else {
    digitalWrite(13, LOW);
  }
  analogWrite(11, parlaklik);

  Serial.print("isik=");
  Serial.print(isik);
  Serial.print(" parlaklik=");
  Serial.print(parlaklik);
  Serial.print(" sicaklik=");
  Serial.println(sicaklik, 1);
  delay(200);
}
```

### Nasıl çalışıyor?
1. `analogRead(A0) / 4` potansiyometreyi 0-255 arasına indirir, `analogWrite`'ın istediği aralık budur.
2. `map(isik, KARANLIK, AYDINLIK, enYuksek, 0)`: karanlıkta `enYuksek`, aydınlıkta 0, arada orantılı değer verir. Çıkış aralığını ters yazmak `map`'te serbesttir.
3. `constrain` ışık `KARANLIK`'tan daha karanlıksa ya da `AYDINLIK`'tan daha aydınlıksa parlaklığı sınırda tutar.
4. Sıcaklık `-99` iken (sensör kopuk) uyarı çıkmaz. Bu seçim bilinçlidir: kopuk sensör yüzünden lambanın hiç yanmaması, daha kötü bir sürpriz olurdu. Seri monitörde `sicaklik=-99.0` görürsen NTC bağlantısını kontrol et.
5. Her turda `delay` toplamı yaklaşık 224 ms olduğu için lamba, ışık değişimlerine hızlı yanıt verir.

Beklenen davranış (örnek):

| Durum | Sonuç |
|---|---|
| Potansiyometre sonda, oda karanlık | Lamba tam parlak |
| Potansiyometre ortada, oda karanlık | Lamba yarı parlaklıkta |
| Oda aydınlık | Lamba sönük |
| NTC 40 °C'nin üstünde | Lamba söner, D13 yanar |

### Dene
- Potansiyometrenin **Konum** kaydırıcısını oynat; karanlıkta lambanın en yüksek parlaklığı değişiyor mu?
- LDR'nin **Işık** kaydırıcısını yavaş yavaş sola çek. Lamba kademeli mi parlaklaşıyor?
- `SICAK_SINIR`'ı oda sıcaklığının biraz altına çek ve uyarının geldiğini gör (ya da NTC'nin **Sıcaklık** kaydırıcısını 45 °C'ye çek).
- `AYDINLIK` değerini ayarla. Lamba hangi ışıkta tamamen sönüyor?
- Zor görev: sabit `KARANLIK` ve `AYDINLIK` yerine 14. dersteki kalibrasyonu `setup()` içine ekle.

### Sık yapılan hatalar
- LDR ve direncin yerini ters bağlamak: lamba karanlıkta söner, aydınlıkta yanar. `map`'in çıkış aralığını ters çevirerek ya da bağlantıyı düzelterek çöz.
- `constrain`'i unutmak: `map` aralık dışında negatif ya da 255'ten büyük sayı üretir, `analogWrite` bunu beklemediğin bir parlaklığa çevirir.
- NTC'nin sabit direncini 10 kΩ yerine başka bir değerle bağlayıp koddaki `10000.0` sayısını değiştirmemek: sıcaklık hep yanlış çıkar.
- Gerçek bir gece lambasında lambayı LDR'ye çok yaklaştırmak: lamba yanınca LDR kendi ışığını görür ve lamba sönüp yanmaya başlar. Laboratuvarda LDR'nin ışığı yalnız kaydırıcıdan gelir, bu etkiyi modellemez; ama "Konuşalım"daki soru bu yüzden önemli.
- Potansiyometreyi en sola çevirip "lamba bozuk" sanmak: `enYuksek` 0 ise lamba hiç yanmaz.

## Konuşalım
Lamba LDR'nin kendi ışığını görürse ne olur ve bunu yazılımla nasıl azaltabilirsin? Gece lambasına bir de buton eklesen, bu butonu hangi derste öğrendiğin yöntemle okurdun?
