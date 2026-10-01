# analogRead, ADC ve potansiyometre
süre: 20

## Merak
Bir butonun iki hâli vardır: basılı ya da değil. Peki bir ses düğmesinin, bir ışık sensörünün ya da bir termometrenin hâli kaç tanedir? Sonsuz! Dijital bir kart bu "ara değerleri" nasıl anlar?

## Etkinlik
### Analog ve dijital
`digitalRead` pindeki gerilimi yalnızca iki sınıfa ayırır: HIGH ya da LOW. Gerçek dünyada (ve laboratuvarda) gerilim 0 V ile 5 V arasında her değeri alabilir. Buna **analog** sinyal denir.

Arduino Uno'nun içinde bir **ADC** (Analog-Dijital Çevirici) vardır. ADC, pindeki gerilimi ölçer ve bir sayıya çevirir:

- Ölçüm **10 bit**tir: 2 üzeri 10 = **1024** farklı değer (0 ile 1023).
- 0 V → 0, 5 V → 1023 civarıdır. Referans gerilimi (en üst sınır) varsayılan olarak 5 V'tur.
- Bir basamağın genişliği: 5 V / 1024 ≈ **4,9 mV**.

Sayıyı gerilime çevirmek için:

`gerilim = ham × 5,0 / 1024`

| Gerilim | `analogRead` değeri |
|---|---|
| 0 V | 0 |
| 1,25 V | 256 |
| 2,5 V | 512 |
| 3,75 V | 768 |
| 5 V | 1023 |

Analog girişler **A0-A5** pinleridir. `pinMode` yazmana gerek yoktur; `analogRead(A0)` yeterlidir.

### Potansiyometre
Potansiyometre, üç uçlu, konumu değişen bir dirençtir. Laboratuvardaki pot parçasının uçları **VCC**, **SIG** ve **GND**'dir: VCC'yi 5V'a, GND'yi GND'ye bağlarsın. Orta uç **SIG**, kaydırıcıyı sürükledikçe 0 V ile 5 V arasında gezinir. SIG'i A0'a bağlarsan kaydırıcının konumunu sayı olarak okursun.

### Devre
Parçaları laboratuvarda **Parça ekle** menüsünden seç, pinleri kablo çekerek bağla.

| Parça | Bağlantı |
|---|---|
| Potansiyometre (10 kΩ) | **VCC** → 5V; **GND** → GND; **SIG** → **A0** |
| LED (kırmızı) | **A** (anot) → 330 Ω direncin 2. ucu; **K** (katot) → GND |
| 330 Ω direnç | 1. ucu **D11**, 2. ucu LED'in **A** ucu |

D11'i seçtik çünkü bu pin parlaklık ayarını (PWM) destekler. D13 desteklemez.

### Program
Önce okuduğumuz sayıyı ve gerilimi seri monitörde görelim. `float`, ondalıklı sayı tutan değişken türüdür. `Serial.print(volt, 2)` sayıyı virgülden sonra 2 basamakla yazar.

```cpp
// sketch: pot_oku
void setup() {
  Serial.begin(9600);
}

void loop() {
  int ham = analogRead(A0);          // 0-1023
  float volt = ham * 5.0 / 1024.0;   // gerilime çevir
  Serial.print("ham=");
  Serial.print(ham);
  Serial.print(" volt=");
  Serial.println(volt, 2);
  delay(500);
}
```

Şimdi düğmeyle LED'in parlaklığını ayarlayalım. `analogWrite(pin, değer)` pine 0-255 arası bir "parlaklık" değeri yazar: 0 söner, 255 tam parlak yanar. Nasıl çalıştığını 16. derste öğreneceksin. Şimdilik bir kullanma aracı olarak al.

ADC 0-1023 verir, `analogWrite` 0-255 ister. 1024 / 4 = 256 olduğu için ham değeri 4'e bölmek yeter.

```cpp
// sketch: pot_parlaklik
void setup() {
  pinMode(11, OUTPUT);
}

void loop() {
  int ham = analogRead(A0);
  analogWrite(11, ham / 4);   // 0-1023 -> 0-255
}
```

### Nasıl çalışıyor?
1. `analogRead(A0)` A0'daki gerilimi ölçer ve 0-1023 arası bir tam sayı verir.
2. `ham * 5.0 / 1024.0` işleminde `5.0` yazdık, çünkü tam sayı bölmesi virgülden sonrasını atar. Ondalıklı bir sayı katınca sonuç ondalıklı olur.
3. `ham / 4` tam sayı bölmesidir. 1023 / 4 = 255 çıkar, yani 255'i aşmaz.
4. Kaydırıcı sona çekilince LED en parlak, başa çekilince söner.

### Dene
- `delay(500)` değerini 50 yap. Seri monitördeki sayılar kaydırıcıyı sürükledikçe akıcı değişiyor mu?
- Kaydırıcıyı tam ortaya (0,5) getir. Sayı yaklaşık 512 mi? Gerçek devrelerde pot hiç oynamasa bile sayı 1-2 birim titreyebilir (gürültü); bunu 14. derste yumuşatma ile ele alacağız. Sence neden olur?
- `ham / 4` yerine `255 - ham / 4` yaz. LED'in davranışı nasıl değişir?

### Sık yapılan hatalar
- Potansiyometrenin SIG ucu yerine VCC ya da GND ucunu A0'a bağlamak: sayı hiç değişmez.
- VCC ya da GND ucunu boşta bırakmak: ölçüm anlamsızlaşır (laboratuvarda pin "havada" kalır).
- Analog pini `digitalRead` ile okumaya çalışmak: yalnızca 0 ya da 1 görürsün.
- `ham * 5 / 1024` yazmak: iki tarafta da tam sayı olduğu için sonuç 0, 1, 2... gibi yuvarlanır. `5.0` yazarak ondalıklı hesap yap.

## Konuşalım
ADC 10 bit yerine 8 bit olsaydı kaç farklı değer okuyabilirdik? Bir basamağın gerilim genişliği büyür mü, küçülür mü?
