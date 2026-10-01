# H-köprüsü L293D: yön ve hız
süre: 25

## Merak
Transistörle motoru çalıştırdık ama motor hep aynı yöne döndü. Radyo kontrollü bir araç ise ileri de gidiyor, geri de. Motoru ters çevirmek için bağlantılarını elle mi değiştirmek gerekir?

## Etkinlik
Bir DC motoru ters yöne döndürmek için artı ve eksi uçlarını yer değiştirmek yeter. Bunu kodla yapmak için dört anahtarlı bir devre kullanılır; şekli "H" harfine benzediği için adı **H-köprüsü**'dür. **L293D** çipi içinde iki H-köprüsü vardır ve motor akımının geri tepmesine karşı diyotları da içerir. Bu yüzden ayrıca flyback diyot gerekmez.

Laboratuvardaki L293D'nin bu derste kullandığımız pinleri (parantez içinde gerçek çipin bacak numarası):

| Laboratuvar pini | Görevi | Bağlantı |
|---|---|---|
| **EN12** (bacak 1) | Kanalı aç/kapat, PWM hızı | **D6** |
| **IN1** (bacak 2) | Yön girişi 1 | **D7** |
| **IN2** (bacak 7) | Yön girişi 2 | **D5** |
| **OUT1** (bacak 3) | Motor ucu 1 | Motor **M1** |
| **OUT2** (bacak 6) | Motor ucu 2 | Motor **M2** |
| **GND** (bacak 4, 5, 12, 13) | Toprak | Uno GND |
| **VCC2** (bacak 8) | Motorun gücü (gerçek çipte 4,5-36 V) | Uno 5V |
| **VCC1** (bacak 16) | Çipin mantık gücü (5 V) | Uno 5V |

Laboratuvarda L293D'nin dört GND bacağı tek bir **GND** pinidir. L293D kanal başına en fazla 600 mA verir; daha büyük motorlar için uygun değildir.

**Dikkat:** L293D çıkışında yaklaşık 1,4 V düşürür. Çıkış "yüksek" olduğunda gerilim VCC2 - 1,4 V olur, "düşük" olduğunda yaklaşık 0,2 V'tur. Motor 5 V'tan beslenirse uçlarında yaklaşık 3,3 V görür; bu yüzden aynı motor L293D ile transistörlü devredekinden daha yavaş döner. Laboratuvarda bunu Sanal ölçümle görürsün. EN pini düşükken ya da çipin VCC1/VCC2 beslemesi eksikken çıkışlar boşta kalır (yüksek empedans) ve motor durur.

Yön tablosu:

| D7 (IN1) | D5 (IN2) | D6 (EN) | Motor |
|---|---|---|---|
| HIGH | LOW | PWM | İleri, hız PWM'e bağlı |
| LOW | HIGH | PWM | Geri, hız PWM'e bağlı |
| LOW | LOW | herhangi | Durur |
| HIGH | HIGH | herhangi | Durur (fren gibi) |

### Devre
Parçaları laboratuvarda **Parça ekle** menüsünden seç, pinleri kablo çekerek bağla.

| Parça | Bağlantı |
|---|---|
| L293D | Yukarıdaki tabloya göre: EN12 → D6, IN1 → D7, IN2 → D5, VCC1 ve VCC2 → 5V, GND → GND |
| DC motor | **M1** → L293D **OUT1**, **M2** → L293D **OUT2** |
| Buton 1 | **A** ucu **D2**, **B** ucu GND (ileri) |
| Buton 2 | **A** ucu **D3**, **B** ucu GND (geri) |
| Potansiyometre | **SIG** → **A0** (hız), **VCC** → 5V, **GND** → GND |

Laboratuvarda motor beslemesi Uno'nun 5V ucundan gelir (VCC2 → 5V); ayrı bir motor kaynağı yoktur. Gerçek devrede motor gerilimi 5 V'u aşıyorsa VCC2 ayrı kaynaktan beslenir ve o kaynağın GND'si Arduino GND'siyle birleştirilir.

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

İkinci sketch motoru iki butonla yönetir; hızı potansiyometre belirler. İki buton birlikte basılırsa motor durur. Butona basmak için tuvaldeki buton parçasına basılı tut ya da özellik panelinde **Basılı** seçeneğini aç.

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
5. Motor dönerken yönü bir anda ters çevirmek gerçek motoru ve kaynağı zorlar. Önce `dur()`, sonra yeni yön.

### Dene
- `motor_yon` içindeki hızı 120 yap. Motor hâlâ dönüyor mu? Sanal ölçümde motorun gerilimine ve hızına bak.
- Motoru her yönde 3 saniye çalıştıran ve aralarda 2 saniye bekleyen bir program yaz.
- `motor_buton` sketch'inde iki butona birlikte basarak motorun gerçekten durduğunu doğrula.
- EN12 kablosunu D6'dan çıkarıp GND'ye bağla ve ▶'e bas. Motor neden hiç dönmüyor?

### Sık yapılan hatalar
- VCC1'e 5 V vermeyi unutmak: çip hiç çalışmaz. Laboratuvar "L293D beslenmemiş" uyarısı verir.
- VCC2'yi (motor gücü) bağlamamak: çıkışlar boşta kalır, motor dönmez.
- GND'yi bağlamamak: çip çalışmaz.
- EN pinini sürmemek ya da LOW tutmak: çıkış boşta kalır, motor durur.
- Motor kaynağını VCC1'e bağlamak: gerçek çipte motor gerilimi 5 V'u aşarsa mantık tarafı zarar görür. Motor kaynağı VCC2'ye, 5 V mantık gücü VCC1'e gider.
- Güçlü bir motoru L293D'ye bağlamak: gerçek çip aşırı ısınır. Büyük motorlar için daha güçlü sürücü gerekir.

## Konuşalım
Bir robot aracın tekerleklerini L293D'nin iki kanalına bağlasaydın, aracı sağa döndürmek için iki motora ne yaptırırdın? Bu yönleri kod olarak nasıl yazardın?
