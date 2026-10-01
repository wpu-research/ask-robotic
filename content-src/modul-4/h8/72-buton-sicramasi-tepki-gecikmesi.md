# Buton sıçraması ve tepki gecikmesi
süre: 30

## Merak
Bir sayaç programı yazdın: butona her basışta sayı bir artıyor. Laboratuvarda mükemmel çalışıyor. Aynı program gerçek bir butonla tek basışta bazen 1, bazen 3, bazen 7 sayıyor. Bir de başka bir sorun: programa başka işler eklediğinde, kısa basışlar bazen hiç algılanmıyor. İkisi de "kod doğru ama zaman ve girdi kirli" hatalarının ayrı yüzleri.

## Etkinlik
### Laboratuvar butonu temizdir
Gerçek bir buton mekanik bir parçadır. Kontaklar birbirine değerken kısa süre titreşir; pin tek basışta birkaç kez HIGH ile LOW arasında gidip gelebilir (8. derste debounce). **Laboratuvardaki buton parçası bunu yapmaz:** basılı olduğunda pin tek hamlede LOW olur, bırakıldığında tek hamlede HIGH olur. Yani sıçrama laboratuvarda **modellenmez**.

Biz sıçramayı koda ekleyeceğiz. Aşağıdaki `hamOku()` fonksiyonu gerçek bir kontağı taklit eder: butonun durumu her değiştiğinde 5 ms boyunca okumayı bir doğru, bir ters verir. Bu fonksiyonu anlamak zorunda değilsin; tek işi laboratuvarın temiz butonunu "kirletmek". Gerçek sıçramanın süresi ve sayısı her basışta farklıdır; buradaki taklit hep aynıdır.

### Devre
Parçaları laboratuvarda **Parça ekle** menüsünden seç, pinleri kablo çekerek bağla.

| Parça | Bağlantı |
|---|---|
| Buton | A → **D2**, B → **GND** (`INPUT_PULLUP`) |
| Direnç (330 Ω) | 1 → **D13**, 2 → LED A |
| LED | A → direncin 2 ucu, K → **GND** |

### 1) Sıçramalı butonu say
Sayaç düşen kenarı (LOW'a geçişi) sayar ama sıçramayı hesaba katmaz:

```cpp
// sketch: sayac_ham
const int BUTON = 2;
const int LED = 13;
int sayac = 0;
bool onceki = false;
bool ledDurum = false;

// Gerçek kontağın sıçramasını taklit eder: her değişimden sonraki 5 ms içinde tek ms'lerde ters okur.
bool hamOku() {
  static bool son = false;
  static bool var = false;
  static unsigned long degisim = 0;
  bool temiz = (digitalRead(BUTON) == LOW);
  if (temiz != son) {
    son = temiz;
    degisim = millis();
    var = true;
  }
  unsigned long gecen = millis() - degisim;
  if (var && gecen < 5 && gecen % 2 == 1) return !temiz;
  return temiz;
}

void setup() {
  pinMode(BUTON, INPUT_PULLUP);
  pinMode(LED, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  bool basili = hamOku();
  if (basili && !onceki) {          // basılmaya yeni geçti
    sayac++;
    ledDurum = !ledDurum;
    digitalWrite(LED, ledDurum);
    Serial.print("Sayac: ");
    Serial.println(sayac);
  }
  onceki = basili;
}
```

Butona **bir kez** bas ve bırak. Taklit sıçrama yüzünden basarken 3, bırakırken 2 sahte "basış" daha görürsün: seri monitörde `Sayac: 5` yazar ve LED beş kez durum değiştirir; son durumun "yanık" çıkması tesadüftür. Kod hatasızdı; girdi kirliydi.

Çözüm: pin değiştikten sonra belli bir süre **sakin kalmasını** bekle. Değer 20 ms boyunca aynı kaldıysa kabul et:

```cpp
// sketch: sayac_temiz
const int BUTON = 2;
const int LED = 13;
const unsigned long SAKIN_SURE = 20;   // ms
int sayac = 0;
bool ledDurum = false;
bool sonHam = false;
bool kararli = false;
unsigned long sonDegisim = 0;

// Gerçek kontağın sıçramasını taklit eder (sayac_ham ile aynı).
bool hamOku() {
  static bool son = false;
  static bool var = false;
  static unsigned long degisim = 0;
  bool temiz = (digitalRead(BUTON) == LOW);
  if (temiz != son) {
    son = temiz;
    degisim = millis();
    var = true;
  }
  unsigned long gecen = millis() - degisim;
  if (var && gecen < 5 && gecen % 2 == 1) return !temiz;
  return temiz;
}

void setup() {
  pinMode(BUTON, INPUT_PULLUP);
  pinMode(LED, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  bool ham = hamOku();
  if (ham != sonHam) {              // pin oynadı: sayacı sıfırla
    sonHam = ham;
    sonDegisim = millis();
  }
  if (millis() - sonDegisim >= SAKIN_SURE && ham != kararli) {
    kararli = ham;                  // yeterince sakin kaldı: kabul et
    if (kararli) {
      sayac++;
      ledDurum = !ledDurum;
      digitalWrite(LED, ledDurum);
      Serial.print("Sayac: ");
      Serial.println(sayac);
    }
  }
}
```

Taklit sıçrama 5 ms sürdüğü için 20 ms'lik sakin bekleme onu tamamen yutar: tek basış, tek sayım. Gerçek butonlarda uygun süre parçaya göre değişir; çok kısa seçersen sıçrama sızar, çok uzun seçersen hızlı basışları kaçırırsın.

### 2) Tepki gecikmesi: `delay` içinde pin okunmaz
Zaman etkileri laboratuvarda **gerçektir**, çünkü kod gerçek hızında koşar. `delay(500)` sırasında program pine bakmaz. Aşağıdaki program "başka bir iş" için yarım saniye bekliyor ve butona sadece o aralıkta bir kez bakıyor:

```cpp
// sketch: tepki_delay
const int BUTON = 2;
const int LED = 13;

void setup() {
  pinMode(BUTON, INPUT_PULLUP);
  pinMode(LED, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  if (digitalRead(BUTON) == LOW) {
    Serial.println("BASILDI");
    digitalWrite(LED, HIGH);
  } else {
    digitalWrite(LED, LOW);
  }
  delay(500);                       // "başka iş" yerine geçen bekleme
}
```

Butonu yarım saniyeden kısa bir süre basılı tut: çoğu zaman hiç `BASILDI` yazmaz. Uzun basarsan tepki en fazla 500 ms gecikir. Çözüm 27. dersteki `millis()` yöntemidir: "başka iş" kendi zamanını tutar, butona her turda bakılır.

```cpp
// sketch: tepki_millis
const int BUTON = 2;
const int LED = 13;
const unsigned long ARALIK = 500;   // "başka iş" 500 ms'de bir
unsigned long sonIs = 0;

void setup() {
  pinMode(BUTON, INPUT_PULLUP);
  pinMode(LED, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  if (digitalRead(BUTON) == LOW) {
    Serial.println("BASILDI");
    digitalWrite(LED, HIGH);
  } else {
    digitalWrite(LED, LOW);
  }
  if (millis() - sonIs >= ARALIK) {
    sonIs = millis();
    Serial.println("tik");          // "başka iş"
  }
}
```

Bu sürümde LED butona anında karşılık verir. Ama dikkat: her turda `BASILDI` yazıldığı için basılı tutarsan seri monitör dolar. Bunu kenar algılamayla (8. ders) kendin düzeltebilirsin.

### Gecikme ve ısınma: sensörler anında cevap vermez
Gerçek sensörlerin kendi süreleri vardır. Laboratuvar bunların bir kısmını **modeller**, bir kısmını modellemez:

| Süre | Laboratuvarda |
|---|---|
| HC-SR04 ölçümü (mesafeyle orantılı, 100 cm için yaklaşık 6 ms) | Modellenir (`pulseIn` süresi ölçülebilir) |
| DHT okuma aralığı (en az 2 sn) | Modellenir (kütüphane bekletir) |
| I2C LCD açılışı (yaklaşık 1 sn) | Modellenir |
| PIR ısınması | Modellenir, ama kısaltılmıştır: laboratuvarda 2 sn, gerçekte tipik olarak yarım dakika ile bir dakika arası (modüle göre değişir) |
| MQ-2 gaz sensörünün ısınması | **Modellenmez** (53. dersteki bekleme süresi yalnızca gerçek devre içindir) |
| Sensör ömrü, sıcaklıkla kayma | **Modellenmez** |

Tablodaki "modellenir" satırları, kodunda bekleme süresini unutursan laboratuvarın da seni yakalayacağı anlamına gelir. "Modellenmez" satırlarında ise laboratuvarın sessizliği güvence değildir.

### Nasıl çalışıyor?
1. `sayac_ham` düşen kenarı her görüşünde sayar. Sıçrama kenarı çoğalttığı için tek basış ve bırakış 5 sayım üretir.
2. `sayac_temiz` kararlı kalma süresini ölçer; 5 ms'lik sıçrama dizisi 20 ms bekleme içinde kaybolur.
3. `tepki_delay` yarım saniyede bir pine bakar; arada olan kısa basış görünmez.
4. `tepki_millis` her turda pine bakar; yavaş iş kendi saatini tutar.

### Dene
- `sayac_temiz` içindeki `SAKIN_SURE` değerini 0 yap. Bu hâliyle hangi sketch'e dönüşüyor?
- `SAKIN_SURE` değerini 3 yap: 5 ms'lik taklit sıçrama sızıyor mu? Neden?
- `tepki_delay` programında `delay(500)` değerini 50 yap. Kısa basışlar artık yakalanıyor mu? Ya 5 yaparsan?
- `hamOku()` içindeki `gecen < 5` değerini 15 yap. Taklit sıçramanın uzaması 20 ms'lik beklemeyi nasıl etkiler?

### Sık yapılan hatalar
- "Laboratuvarda sıçrama olmadı, debounce gereksiz" demek. Laboratuvarın butonu temizdir, gerçeği değil.
- Sıçramayı `delay(50)` ile gidermeye çalışmak: çalışır ama programı bekletir, `tepki_delay`'deki sorun doğar.
- Bırakırken oluşan sıçramayı unutmak: basarken bekleyip bırakırken beklememek sahte sayım getirir.
- `SAKIN_SURE` değerini ölçmeden tahmin etmek.

## Konuşalım
Debounce, girdinin kirli olduğunu kabul edip "biraz sakin kal" demektir. Bunun bedeli ne? Çok hızlı basılan bir oyun düğmesinde 20 ms'lik bekleme sorun yaratır mı, yaratırsa nasıl çözersin?
