# Joystick: iki eksen ve düğme
süre: 25

## Merak
Oyun kolunu tuttuğunda parmağın hem sağa-sola hem yukarı-aşağı gidebilir, üstelik ne kadar ittiğin de önemlidir. Bir buton yalnızca "bastı / basmadı" der. Joystick ise aynı anda iki sayı ve bir düğme verir. Peki bu iki sayı, kol bıraktığında neden tam sıfır değil de "yaklaşık orta" bir değer çıkar?

## Etkinlik
### Devre
| Parça | Bağlantı |
|---|---|
| Joystick modülü VCC | 5 V |
| Joystick modülü GND | GND |
| Joystick VRx (X ekseni) | **A0** |
| Joystick VRy (Y ekseni) | **A1** |
| Joystick SW (düğme) | **D2** (`INPUT_PULLUP`) |
| LED + 330 Ω direnç | **D13** → direnç → LED anodu; katot → GND |

Joystick aslında birbirine dik iki **potansiyometredir** (11. ders) ve basılabilen bir düğmedir. Kol ortadayken her potansiyometrenin silgisi yaklaşık yarıda durur, yani `analogRead` yaklaşık 512 verir. Kolu ucuna kadar itince değer 0'a ya da 1023'e yaklaşır. SW düğmesi basılınca GND'ye bağlanır; `INPUT_PULLUP` (6. ders) kullandığımız için basılı düğme `LOW` okunur.

Modülün üzerindeki yön yazıları üreticiye göre değişir. Hangi yönün artı, hangisinin eksi olduğunu aşağıdaki ilk programla kendin bul.

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
Seri Ekran'ı aç, kolu bırak, sonra her yöne it. Değerlerin 0 ile 1023 arasında gezindiğini görürsün. Kol bırakılmışken X ve Y büyük olasılıkla tam 512 olmayacak; örneğin 497 ya da 530 çıkabilir. Bu normaldir: iki potansiyometre de kusursuz yarıda durmaz.

### Orta nokta kalibrasyonu ve ölü bölge
14. derste kalibrasyonu öğrendin. Joystick için iki iş yapılır:

1. **Orta noktayı ölç.** Program açılırken kol bırakılmış varsayılır. 16 okumanın ortalaması "merkez" olarak saklanır.
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
5. `yonAdi` hangi eksen daha büyükse onu seçer. Y ekseninin artı yönü modülden modüle değişir; "YUKARI" ve "ASAGI" etiketlerini kendi modülüne göre değiştirebilirsin.
6. Düğme için 8. dersteki kenar algılama kullanıldı: yalnızca basıldığı an bir kez çalışır, basılı tutmak LED'i yanıp söndürmez.

### Dene
- `OLU_BOLGE` değerini 10 yap, sonra 120 yap. Kolu bırakmışken değer sıfırda kalıyor mu? Kolu itince ne zaman tepki veriyor?
- `joystick_kalibre` programını kol itilmiş halde başlat (yani merkezi yanlış ölç). Ne olur? Neden?
- X eksenine göre D13'teki LED'in parlaklığını değiştir (16. ders): kol sağa gittikçe LED parlasın, sola gidince sönük kalsın.

### Sık yapılan hatalar
- Merkezi sabit 512 yazmak: bir modülde işe yarar, ötekinde robot kol bırakılmışken kayar.
- Ölü bölge koymamak: kol bırakılmışken değer 510, 514, 509 diye dalgalanır; servo ya da motor titrer.
- Kolu itili tutarken kartı açmak: merkez yanlış ölçülür.
- SW pinini `INPUT_PULLUP` yapmamak: düğme bırakılmışken pin havada kalır, rastgele basış okunur (6. ders).
- Modülün 5 V yerine 3,3 V ile beslenmesi: ucu 1023 yerine daha küçük bir değere ulaşır. 5 V kartta modülü 5 V'ta besle.

## Konuşalım
Bir drone kumandasında iki joystick vardır ve hiçbiri tam ortada "sıfır" vermez. Üretici bu kusuru nasıl çözüyor olabilir? Ölü bölgeyi çok büyük yaparsak kumandanın hissi nasıl değişir?
