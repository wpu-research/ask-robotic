# map, constrain, kalibrasyon ve yumuşatma
süre: 25

## Merak
Sensörün verdiği sayılar hiç "temiz" değildir: LDR'n senin odanda 120 ile 880 arasında, arkadaşının odasında 60 ile 950 arasında oynar. Üstelik sayı sürekli titrer. Programın bu karmaşada nasıl kararlı davranır?

## Etkinlik
### map ve constrain
`map(x, girişMin, girişMax, çıkışMin, çıkışMax)`, bir sayıyı bir aralıktan başka aralığa orantılı olarak taşır. Örneğin 0-1023 arasındaki değeri 0-100 yüzdeye çevirir:

```cpp
int yuzde = map(ham, 0, 1023, 0, 100);
```

İki şeyi bilmen lazım:
1. `map` **tam sayı** hesabı yapar. Sonuçtaki virgülden sonrası atılır.
2. `map` sonucu sınırlamaz. Giriş, verdiğin aralığın dışına çıkarsa sonuç da dışına çıkar: sonuç negatif ya da 100'ün üstünde olabilir.

Sınırlamak için `constrain(x, alt, üst)` kullanılır: `x` altın altındaysa `alt`, üstün üstündeyse `üst`, aradaysa `x` döner.

```cpp
int yuzde = map(ham, 200, 800, 0, 100);   // 200'ün altı negatif olur
yuzde = constrain(yuzde, 0, 100);         // 0-100 arasında tut
```

### Devre
| Parça | Bağlantı |
|---|---|
| Potansiyometre (10 kΩ) | Dış bacaklar → 5 V ve GND; orta bacak → **A0** |
| LDR + 10 kΩ direnç | 5 V → LDR → **A1** → 10 kΩ → GND (12. dersteki gibi) |
| LED (kırmızı) + 330 Ω | **D13** → 330 Ω → LED anodu; LED katodu → GND |

### Program 1: map ve constrain
Potansiyometrenin 200-800 arasını yüzdeye çevirelim; uçlarda sonuç taşabilir.

```cpp
// sketch: map_constrain
void setup() {
  Serial.begin(9600);
}

void loop() {
  int ham = analogRead(A0);
  int p = map(ham, 200, 800, 0, 100);   // sınırsız
  int k = constrain(p, 0, 100);         // sınırlı
  Serial.print("ham=");
  Serial.print(ham);
  Serial.print(" p=");
  Serial.print(p);
  Serial.print(" k=");
  Serial.println(k);
  delay(300);
}
```

Düğmeyi tamamen sola çevirince `p` negatif, sağa çevirince 100'ün üstüne çıkacak; `k` ise 0 ve 100'de kalacak.

### Kalibrasyon
Sensörün gerçek en küçük ve en büyük değeri her ortamda farklıdır. **Kalibrasyon**, bu aralığı program açılırken ölçmektir. Aşağıdaki sketch ilk 3 saniye boyunca (D13 yanıkken) LDR'yi izler. Bu sürede LDR'nin üzerini kapat, sonra ışığa tut. Sonra ölçtüğü en küçük ve en büyük değeri aralık yapıp ışığı 0-100 arası yüzde olarak bildirir.

```cpp
// sketch: kalibrasyon
int enAz = 1023;
int enCok = 0;

void setup() {
  Serial.begin(9600);
  pinMode(13, OUTPUT);
  digitalWrite(13, HIGH);              // kalibrasyon sürüyor
  for (int i = 0; i < 300; i++) {      // 300 x 10 ms = 3 saniye
    int ham = analogRead(A1);
    if (ham < enAz) {
      enAz = ham;
    }
    if (ham > enCok) {
      enCok = ham;
    }
    delay(10);
  }
  if (enCok - enAz < 50) {             // aralık çok dar: bölme hatası olmasın
    enCok = enAz + 50;
  }
  digitalWrite(13, LOW);
}

void loop() {
  int ham = analogRead(A1);
  int yuzde = map(ham, enAz, enCok, 0, 100);
  yuzde = constrain(yuzde, 0, 100);
  Serial.print("ham=");
  Serial.print(ham);
  Serial.print(" yuzde=");
  Serial.println(yuzde);
  delay(300);
}
```

### Yumuşatma
Aynı ışıkta bile `analogRead` her seferinde biraz farklı sayı verir (gürültü). Basit çözüm: birkaç ölçüm alıp **ortalamasını** kullanmak. Aşağıda 16 ölçümün ortalamasını alıyoruz. Gürültü ortalamada büyük ölçüde sönümlenir. Karşılığında bir okuma biraz daha uzun sürer (16 × 3 ms ≈ 50 ms).

```cpp
// sketch: yumusatma
void setup() {
  Serial.begin(9600);
}

void loop() {
  int toplam = 0;
  for (int i = 0; i < 16; i++) {
    toplam = toplam + analogRead(A0);
    delay(3);
  }
  int ort = toplam / 16;
  Serial.print("ham=");
  Serial.print(analogRead(A0));    // karşılaştırmak için tek ölçüm
  Serial.print(" ort=");
  Serial.println(ort);
  delay(100);
}
```

Başka bir yöntem de **üstel yumuşatma**dır. Her turda eski değerin %90'ını tutar, yeni ölçümden %10 alır; tek satırdır ve dizi gerektirmez:

```cpp
duzgun = duzgun * 0.9 + ham * 0.1;   // duzgun bir float değişkendir
```

### Nasıl çalışıyor?
1. `map(ham, 200, 800, 0, 100)`: 200 → 0, 800 → 100, 500 → 50. Sınır dışı için `constrain` gerekir.
2. Kalibrasyonda `enAz` büyük bir sayıyla (1023), `enCok` küçük bir sayıyla (0) başlar; böylece ilk ölçüm bile ikisini de günceller.
3. 16 ölçümün toplamı en çok 16 × 1023 = 16368'dir; `int`'e sığar.
4. Ortalama aldıkça `ort`, `ham`'dan daha az oynar.

### Dene
- `map_constrain` sketch'inde `constrain` satırını silip uçlarda ne olduğunu gör.
- `kalibrasyon` açılırken LDR'yi hiç hareket ettirme. Ne oluyor? Alttaki 50'lik koruma satırı ne işe yarıyor?
- `yumusatma` içinde 16'yı 4 yap. `ort` ne kadar oynak olur? 64 yaparsan okuma süresi ne olur?

### Sık yapılan hatalar
- `map`'i ondalıklı sonuç bekleyerek kullanmak: `map(5, 0, 10, 0, 3)` 1 verir, 1,5 değil.
- `map` sonucunu kırpmadan `analogWrite`'a vermek: negatif ya da 255'ten büyük değer beklenmedik parlaklık verir.
- `enAz`'ı 0 ile, `enCok`'u 1023 ile başlatmak: ölçümler hiçbir zaman bu uçlara varmaz, aralık hiç daralmaz.
- Kalibrasyon sırasında LDR'yi kapatıp açmayı unutmak: aralık dar kalır.
- `toplam`'ı sıfırlamayı unutmak: ortalama sürekli büyür.

## Konuşalım
Kalibrasyonu program açılırken bir kez yapmak mı daha iyi, yoksa sürekli güncel tutmak mı? Gün boyunca ışık değiştiğinde her birinin avantajı ve riski ne olur?
