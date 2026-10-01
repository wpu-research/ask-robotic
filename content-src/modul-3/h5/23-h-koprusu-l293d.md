# H-köprüsü L293D: yön ve hız
süre: 25

## Merak
Transistörle motoru çalıştırdık ama motor hep aynı yöne döndü. Radyo kontrollü bir araç ise ileri de gidiyor, geri de. Motoru ters çevirmek için kablolarını elle mi değiştirmek gerekir?

## Etkinlik
Bir DC motoru ters yöne döndürmek için artı ve eksi uçlarını yer değiştirmek yeter. Bunu kodla yapmak için dört anahtarlı bir devre kullanılır; şekli "H" harfine benzediği için adı **H-köprüsü**'dür. **L293D** çipi içinde iki H-köprüsü vardır ve motor akımının geri tepmesine karşı diyotları da içindedir. Bu yüzden ayrıca flyback diyot gerekmez.

Çipin bu derste kullandığımız bacakları:

| L293D bacağı | Görevi | Bağlantı |
|---|---|---|
| 1 (1,2EN) | Kanalı aç/kapat, PWM hızı | **D6** |
| 2 (1A) | Yön girişi 1 | **D7** |
| 7 (2A) | Yön girişi 2 | **D5** |
| 3 (1Y) | Motor ucu 1 | Motor |
| 6 (2Y) | Motor ucu 2 | Motor |
| 4, 5 | GND | GND |
| 8 (Vcc2) | Motorun gücü (4,5-36 V) | Harici motor kaynağı (+) |
| 16 (Vcc1) | Çipin mantık gücü | Arduino 5 V |

Çipin çentikli ucu solda kalacak şekilde tutulduğunda bacak 1 sol üsttedir (çentik yukarıda, sol sütunda yukarıdan aşağı 1-8, sağ sütunda aşağıdan yukarı 9-16). L293D kanal başına en fazla 600 mA verir; daha büyük motorlar için uygun değildir.

Yön tablosu:

| D7 (IN1) | D5 (IN2) | D6 (EN) | Motor |
|---|---|---|---|
| HIGH | LOW | PWM | İleri, hız PWM'e bağlı |
| LOW | HIGH | PWM | Geri, hız PWM'e bağlı |
| LOW | LOW | herhangi | Durur |
| HIGH | HIGH | herhangi | Durur (fren gibi) |

### Devre
| Parça | Bağlantı |
|---|---|
| L293D | Yukarıdaki tabloya göre; bacak 4 ve 5 GND'ye |
| Küçük DC motor | Uçları bacak 3 ve bacak 6 arasında |
| Harici kaynak (4 x AA gibi) | Artısı bacak 8'e; eksisi GND (Arduino GND ile ortak) |
| Buton 1 | **D2** ile GND arası (ileri) |
| Buton 2 | **D3** ile GND arası (geri) |
| Potansiyometre | Orta bacak → **A0** (hız) |

### Program
İlk sketch motoru otomatik olarak ileri, dur, geri, dur şeklinde çalıştırır. Yön değiştirmeden önce motoru durdurup biraz bekleriz.

```cpp
// sketch: motor_yon
const int EN = 6;     // hız (PWM)
const int IN1 = 7;
const int IN2 = 5;

void ileri(int hiz) {
  digitalWrite(IN1, HIGH);
  digitalWrite(IN2, LOW);
  analogWrite(EN, hiz);
}

void geri(int hiz) {
  digitalWrite(IN1, LOW);
  digitalWrite(IN2, HIGH);
  analogWrite(EN, hiz);
}

void dur() {
  analogWrite(EN, 0);
  digitalWrite(IN1, LOW);
  digitalWrite(IN2, LOW);
}

void setup() {
  pinMode(EN, OUTPUT);
  pinMode(IN1, OUTPUT);
  pinMode(IN2, OUTPUT);
  dur();
}

void loop() {
  ileri(200);
  delay(2000);
  dur();
  delay(1000);
  geri(200);
  delay(2000);
  dur();
  delay(1000);
}
```

İkinci sketch motoru iki butonla yönetir; hızı potansiyometre belirler. İki buton birlikte basılırsa motor durur.

```cpp
// sketch: motor_buton
const int EN = 6;
const int IN1 = 7;
const int IN2 = 5;

void surus(bool yonIleri, int hiz) {
  digitalWrite(IN1, yonIleri ? HIGH : LOW);
  digitalWrite(IN2, yonIleri ? LOW : HIGH);
  analogWrite(EN, hiz);
}

void dur() {
  analogWrite(EN, 0);
  digitalWrite(IN1, LOW);
  digitalWrite(IN2, LOW);
}

void setup() {
  pinMode(EN, OUTPUT);
  pinMode(IN1, OUTPUT);
  pinMode(IN2, OUTPUT);
  pinMode(2, INPUT_PULLUP);
  pinMode(3, INPUT_PULLUP);
  dur();
}

void loop() {
  int hiz = analogRead(A0) / 4;
  bool ileriBas = (digitalRead(2) == LOW);   // basılı = LOW
  bool geriBas = (digitalRead(3) == LOW);

  if (ileriBas && !geriBas) {
    surus(true, hiz);
  } else if (geriBas && !ileriBas) {
    surus(false, hiz);
  } else {
    dur();                                    // hiçbiri ya da ikisi birden
  }
}
```

### Nasıl çalışıyor?
1. Yön, `IN1` ve `IN2` pinlerinin farklı olmasıyla belirlenir. Ters çevirmek için ikisini de yer değiştirmek yeter.
2. Hız, `EN` pinine verilen PWM ile ayarlanır; `analogWrite(EN, 200)` yaklaşık %78 doluluk demektir.
3. `ileri`, `geri` ve `dur` fonksiyonları kodu okunur yapar. Her işin adı bellidir.
4. `yonIleri ? HIGH : LOW` ifadesi "yonIleri doğruysa HIGH, değilse LOW" demektir.
5. Motor dönerken yönü bir anda ters çevirmek motoru ve kaynağı zorlar. Önce `dur()`, sonra yeni yön.

### Dene
- `motor_yon` içindeki hızı 120 yap. Motor hâlâ dönüyor mu?
- Motoru her yönde 3 saniye çalıştıran ve aralarda 2 saniye bekleyen bir program yaz.
- `motor_buton` sketch'inde iki butona birlikte basarak motorun gerçekten durduğunu doğrula.

### Sık yapılan hatalar
- Bacak 16'ya (Vcc1) 5 V vermeyi unutmak: çip hiç çalışmaz.
- Motor kaynağını bacak 16'ya bağlamak: motor gerilimi 5 V'u aşarsa çipin mantık tarafı zarar görür. Motor kaynağı bacak 8'e, Arduino 5 V'u bacak 16'ya gider.
- GND bacaklarını (4 ve 5) bağlamamak: çip ısınır ve çalışmaz.
- L293D'yi ters yöne takmak: çip ısınır, bozulur. Çentik yönüne dikkat et.
- Güçlü bir motoru L293D'ye bağlamak: çip aşırı ısınır. Büyük motorlar için daha güçlü sürücü gerekir.

## Konuşalım
Bir robot aracın tekerleklerini L293D'nin iki kanalına bağlasaydın, aracı sağa döndürmek için iki motora ne yaptırırdın? Bu yönleri kod olarak nasıl yazardın?
