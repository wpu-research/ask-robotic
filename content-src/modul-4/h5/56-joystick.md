# Joystick: iki eksen ve düğme
süre: 25

## Merak
Oyun kolunu tuttuğunda parmağın hem sağa-sola hem yukarı-aşağı gidebilir, üstelik ne kadar ittiğin de önemlidir. Bir buton yalnızca "bastı / basmadı" der. Joystick ise aynı anda iki sayı ve bir düğme verir. Peki bu iki sayı, kol bıraktığında neden tam sıfır değil de "yaklaşık orta" bir değer çıkar?

## Etkinlik
### Devre
Parçaları laboratuvarda **Parça ekle** menüsünden seç, pinleri kablo çekerek bağla.

| Parça | Bağlantı |
|---|---|
| Joystick VCC | 5V |
| Joystick GND | GND |
| Joystick VRX (X ekseni) | **A0** |
| Joystick VRY (Y ekseni) | **A1** |
| Joystick SW (düğme) | **D2** (`INPUT_PULLUP`) |
| Direnç (330 Ω) 1 | **D13** |
| Direnç 2 | LED **A** (anot) |
| LED **K** (katot) | GND |

Joystick'i seçince sağ panelde **X ekseni**, **Y ekseni** (0 ile 1 arası) ve **Düğme basılı** özellikleri çıkar; bunları program çalışırken de değiştirebilirsin. Direncin değerini özellik panelinden 330 Ω yap.

Joystick aslında birbirine dik iki **potansiyometredir** (11. ders) ve basılabilen bir düğmedir. Kol ortadayken her potansiyometrenin silgisi yaklaşık yarıda durur, yani `analogRead` yaklaşık 512 verir. Kolu ucuna kadar itince değer 0'a ya da 1023'e yaklaşır. SW düğmesi basılınca GND'ye bağlanır; `INPUT_PULLUP` (6. ders) kullandığımız için basılı düğme `LOW` okunur.

Gerçek modüllerde yön yazıları üreticiye göre değişir; hangi yönün artı olduğunu ilk programla denerek bulursun. Laboratuvarda X (ya da Y) özelliği büyüdükçe `analogRead` değeri de büyür.

### Program 1: Ham değerleri oku
```cpp
// sketch: joystick_ham
void setup() {
  Serial.begin(9600);
  pinMode(2, INPUT_PULLUP);
}

void loop() {
  int x = analogRead(A0);
  int y = analogRead(A1);
  int basili = (digitalRead(2) == LOW) ? 1 : 0;   // 1 = düğmeye basılı

  Serial.print("X=");
  Serial.print(x);
  Serial.print(" Y=");
  Serial.print(y);
  Serial.print(" BUTON=");
  Serial.println(basili);
  delay(200);
}
```
▶'e bas ve seri monitörü izle. Joystick'in **X ekseni** özelliği 0,5 iken `X` yaklaşık 512 çıkar (0,5 × 5 V = 2,5 V). X'i 0'a çek: değer 0'a düşer; 1'e çek: 1023'e çıkar. Y için de aynısını dene. **Düğme basılı** kutusunu işaretlersen `BUTON=1` olur.

Gerçek bir modülde kol bırakılmışken X ve Y tam 512 olmaz; örneğin 497 ya da 530 çıkar, çünkü iki potansiyometre de kusursuz yarıda durmaz. Bunu laboratuvarda taklit edebilirsin: X ekseni özelliğini 0,52 yap, değer yaklaşık 532 olur.

### Orta nokta kalibrasyonu ve ölü bölge
14. derste kalibrasyonu öğrendin. Joystick için iki iş yapılır:

1. **Orta noktayı ölç.** Program açılırken kolun bırakılmış olduğu varsayılır. 16 okumanın ortalaması "merkez" olarak saklanır.
2. **Ölü bölge ekle.** Merkezin etrafında küçük bir aralıkta (burada ±40) değer sıfır sayılır. Böylece elin titremesi ya da potansiyometrenin küçük kayması robotu ya da servoyu oynatmaz.

Merkezden uzaklığı `-100 ... +100` aralığına `map` ile (14. ders) çeviririz. Ölü bölge dışı kısım yeniden ölçeklenir; böylece değer ölü bölgenin hemen dışında 0'dan başlar, aniden 40'a sıçramaz.

### Program 2: Kalibre edilmiş eksenler ve düğmeyle LED
```cpp
// sketch: joystick_kalibre
const int SW = 2;
const int LED = 13;
const int OLU_BOLGE = 40;          // merkezin ± bu kadarı sıfır sayılır

int merkezX;
int merkezY;
bool ledAcik = false;
bool oncekiBasili = false;
unsigned long sonBasis = 0;
unsigned long sonYazma = 0;

int merkezOlc(int pin) {
  long toplam = 0;
  for (int i = 0; i < 16; i++) {
    toplam += analogRead(pin);
    delay(2);
  }
  return toplam / 16;
}

// ham değeri -100 ... +100 aralığına çevirir
int eksen(int ham, int merkez) {
  int fark = ham - merkez;
  if (abs(fark) < OLU_BOLGE) return 0;
  if (fark > 0) {
    return constrain(map(fark, OLU_BOLGE, 1023 - merkez, 0, 100), 0, 100);
  }
  return constrain(map(fark, -OLU_BOLGE, -merkez, 0, -100), -100, 0);
}

const char* yonAdi(int x, int y) {
  if (abs(x) < 30 && abs(y) < 30) return "ORTA";
  if (abs(x) >= abs(y)) return x > 0 ? "SAG" : "SOL";
  return y > 0 ? "YUKARI" : "ASAGI";
}

void setup() {
  Serial.begin(9600);
  pinMode(SW, INPUT_PULLUP);
  pinMode(LED, OUTPUT);
  merkezX = merkezOlc(A0);          // kol bırakılmışken ölç
  merkezY = merkezOlc(A1);
}

void loop() {
  unsigned long simdi = millis();

  // Düğme: basıldığı an LED'in durumunu tersle (kenar algılama + sıçrama önleme)
  bool basili = (digitalRead(SW) == LOW);
  if (basili && !oncekiBasili && simdi - sonBasis > 30) {
    sonBasis = simdi;
    ledAcik = !ledAcik;
    digitalWrite(LED, ledAcik);
  }
  oncekiBasili = basili;

  // Saniyede beş kez yaz
  if (simdi - sonYazma >= 200) {
    sonYazma = simdi;
    int x = eksen(analogRead(A0), merkezX);
    int y = eksen(analogRead(A1), merkezY);
    Serial.print("X=");
    Serial.print(x);
    Serial.print(" Y=");
    Serial.print(y);
    Serial.print(" YON=");
    Serial.println(yonAdi(x, y));
  }
}
```

### Nasıl çalışıyor?
1. `merkezOlc` kolu bırakılmışken 16 kez okur ve ortalama alır. Tek okuma yerine ortalama kullanmak gürültüyü azaltır (14. ders).
2. `eksen` önce merkezden farkı bulur. Fark ölü bölgenin içindeyse 0 döner.
3. Fark pozitifse `map` ile `OLU_BOLGE ... (1023 − merkez)` aralığı `0 ... 100` aralığına çevrilir. Negatifse `-OLU_BOLGE ... -merkez` aralığı `0 ... -100` olur. Merkez 512 değilse iki yarı farklı uzunlukta olur; böyle yapınca iki uçta da tam ±100'e ulaşırsın.
4. `constrain` hesaptaki küçük taşmaları keser.
5. `yonAdi` hangi eksen daha büyükse onu seçer. Gerçek modüllerde Y ekseninin artı yönü modülden modüle değişir; laboratuvarda Y büyüdükçe "YUKARI" yazar. Başka bir modülde ters çıkarsa etiketleri değiştirirsin.
6. Düğme için 8. dersteki kenar algılama kullanıldı: yalnızca basıldığı an bir kez çalışır, basılı tutmak LED'i yanıp söndürmez.

### Dene
- `OLU_BOLGE` değerini 10 yap, sonra 120 yap. X ekseni özelliğini 0,5'ten başlayıp yavaşça artır: değer hangi noktada sıfırdan ayrılıyor?
- X ekseni özelliğini 0,8 yap ve **sonra** ▶'e bas (merkez yanlış ölçülür). Ardından X'i 0,5'e getir. Ne olur? Neden?
- X eksenine göre bir LED'in parlaklığını değiştir (16. ders): kol sağa gittikçe LED parlasın, sola gidince sönük kalsın. D13 bir PWM pini değildir; LED'i D11'e taşı (PWM pinleri 3, 5, 6, 9, 10, 11).

### Sık yapılan hatalar
- Merkezi sabit 512 yazmak: bir modülde işe yarar, ötekinde robot kol bırakılmışken kayar.
- Ölü bölge koymamak: kol bırakılmışken değer 510, 514, 509 diye dalgalanır; servo ya da motor titrer.
- Kol itilmiş durumdayken (X ya da Y 0,5'ten uzakken) ▶'e basmak: merkez yanlış ölçülür.
- SW pinini `INPUT_PULLUP` yapmamak: düğme bırakılmışken pin havada kalır, rastgele basış okunur (6. ders).
- Modülün VCC'sini 5V yerine 3V3'e bağlamak: uç değer 1023 yerine yaklaşık 675 olur (3,3 / 5 × 1023), çünkü ADC 5 V'a göre ölçer. Laboratuvarda dene.

## Konuşalım
Bir drone kumandasında iki joystick vardır ve hiçbiri tam ortada "sıfır" vermez. Üretici bu kusuru nasıl çözüyor olabilir? Ölü bölgeyi çok büyük yaparsak kumandanın hissi nasıl değişir?
