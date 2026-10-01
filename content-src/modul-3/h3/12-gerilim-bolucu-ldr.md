# Gerilim bölücü ve LDR
süre: 25

## Merak
Arduino direnci ölçemez; yalnızca gerilimi ölçer. Peki ışığa göre direnci değişen bir parçanın (LDR) karanlıkta mı aydınlıkta mı olduğunu nasıl anlayacağız? Cevap, iki dirençle kurulan küçük bir hilede: gerilim bölücü.

## Etkinlik
### Gerilim bölücü
Birbirine seri bağlı iki direnç düşün. Üstteki R1 5 V'a, alttaki R2 GND'ye bağlı. Ortadaki noktadan gerilim alıyoruz.

- Devreden geçen akım: I = Vin / (R1 + R2)
- R2'nin üzerindeki gerilim: Vout = I × R2

Bu ikisini birleştirince:

`Vout = Vin × R2 / (R1 + R2)`

Örnekler (Vin = 5 V, R1 = 10 kΩ):

| R2 | Vout |
|---|---|
| 1 kΩ | 5 × 1 / 11 ≈ 0,45 V |
| 10 kΩ | 5 × 10 / 20 = 2,50 V |
| 100 kΩ | 5 × 100 / 110 ≈ 4,55 V |

R2 büyüdükçe çıkış gerilimi büyür. İki direnç eşitse tam ortada, yani 2,5 V olur. Bu sayıları aşağıdaki küçük sketch ile doğrulayabilirsin.

```cpp
// sketch: bolucu_hesap
float vin = 5.0;
float r1 = 10000.0;
float r2[] = {1000.0, 10000.0, 100000.0};

void setup() {
  Serial.begin(9600);
  for (int i = 0; i < 3; i++) {
    float vout = vin * r2[i] / (r1 + r2[i]);
    Serial.print("R2=");
    Serial.print(r2[i], 0);
    Serial.print(" Vout=");
    Serial.println(vout, 2);
  }
}

void loop() {
}
```

### LDR
LDR (ışığa duyarlı direnç) üzerine düşen ışık arttıkça direnci azalır. Değerler parçadan parçaya değişir; kabaca karanlıkta yüzlerce kΩ, parlak ışıkta birkaç yüz Ω ile birkaç kΩ arasındadır. Laboratuvardaki LDR'nin değerini aşağıdaki sketch ile okuyabilirsin: ışık kaydırıcısını oynatınca direnç değişir.

LDR'yi bölücünün üst direnci (R1) yaparsak, sabit 10 kΩ direnç R2 olur:

- Aydınlık: LDR küçük, R2 baskın, Vout **yüksek**.
- Karanlık: LDR büyük, Vout **düşük**.

Ölçülen Vout'tan LDR'nin direncini bulmak için formülü ters çeviririz:

`R_ldr = 10 kΩ × (5 − Vout) / Vout`

ADC değeriyle yazarsak: `R_ldr = 10000 × (1024 − ham) / ham`.

### Devre
Parçaları laboratuvarda **Parça ekle** menüsünden seç, pinleri kablo çekerek bağla. LDR ve direnci seçince özellik panelinden LDR'nin **Işık** kaydırıcısını ve direncin değerini (10000 Ω) ayarlayabilirsin.

| Parça | Bağlantı |
|---|---|
| LDR | 1. ucu → 5V; 2. ucu → **A1** |
| 10 kΩ direnç | 1. ucu **A1**, 2. ucu GND |
| LED (kırmızı) | **A** (anot) → 330 Ω direncin 2. ucu; **K** (katot) → GND |
| 330 Ω direnç | 1. ucu **D13**, 2. ucu LED'in **A** ucu |

### Program
Önce ışığı ve LDR'nin direncini yazdıralım.

```cpp
// sketch: isik_oku
void setup() {
  Serial.begin(9600);
}

void loop() {
  int ham = analogRead(A1);
  float volt = ham * 5.0 / 1024.0;
  float rLdr = 0;
  if (ham > 0) {
    rLdr = 10000.0 * (1024 - ham) / ham;
  }
  Serial.print("ham=");
  Serial.print(ham);
  Serial.print(" volt=");
  Serial.print(volt, 2);
  Serial.print(" R_ldr=");
  Serial.println(rLdr, 0);
  delay(500);
}
```

Şimdi karanlık olunca LED'i yakan bir sistem yapalım. Dikkat: tek bir eşik kullanırsak ışık eşiğe yakınken LED sürekli yanıp söner. Bunu önlemek için iki eşik kullanıyoruz: 250'nin altında yak, 350'nin üstünde söndür. Arasındaki bölgede LED, önceki durumunu korur. Buna **histerezis** denir.

```cpp
// sketch: karanlik_esik
void setup() {
  pinMode(13, OUTPUT);
}

void loop() {
  int ham = analogRead(A1);
  if (ham < 250) {
    digitalWrite(13, HIGH);   // karanlık: yak
  } else if (ham > 350) {
    digitalWrite(13, LOW);    // aydınlık: söndür
  }
  delay(50);
}
```

### Nasıl çalışıyor?
1. LDR ve 10 kΩ direnç gerilim bölücü oluşturur. A1, bu ikisinin ortasındaki gerilimi ölçer.
2. Işık artınca LDR direnci düşer, A1'deki gerilim ve `ham` değeri artar.
3. `if / else if` zincirinde iki koşuldan hiçbiri doğru değilse (250-350 arası) pine dokunulmaz, LED eski hâlinde kalır.
4. Sabit direnç LDR'nin orta değerine yakın seçilirse (burada 10 kΩ) ölçüm aralığı en geniş olur.

### Dene
- LDR'nin **Işık** kaydırıcısını en sola çek (karanlık). `ham` ne kadar düşüyor? Sonra en sağa çek (aydınlık). En yüksek değer kaç?
- `isik_oku` ile okuduğun karanlık ve aydınlık değerlerine göre 250 ve 350 eşiklerini kendin uyarla.
- Devrede LDR ile 10 kΩ direncin yerini değiştir. Işık arttıkça `ham` nasıl değişir? Neden?

### Sık yapılan hatalar
- Sabit direnci unutmak: LDR doğrudan 5 V ile A1 arasında kalır, pin "havada" olur ve ölçüm anlamsızlaşır.
- LDR ile sabit direncin yerlerini değiştirmek: devre çalışır ama ışık arttıkça `ham` değeri düşer. Programın mantığı tersine döner, buna dikkat et.
- Çok küçük bir sabit direnç (örneğin 100 Ω) seçmek: Vout neredeyse hep 0 V'ta kalır, aralık daralır.
- Tek eşik kullanıp LED'in eşikte titremesine şaşırmak.

## Konuşalım
Sabit direnci 1 kΩ yapsaydık, karanlıkta (LDR çok büyükken) A1'deki gerilim ne olurdu? Bu bölücü ışık farklarını ayırt etmede neden daha kötü olurdu?
