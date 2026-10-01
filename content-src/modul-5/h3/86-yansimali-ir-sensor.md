# Yansımalı IR sensör ve çizgi okuma
süre: 20

## Merak
Yerdeki siyah bantı sürekli takip eden depo robotlarını gördün mü? Gözleri yoktur, ama yere bakan küçük sensörleri vardır. Sensör yerden yansıyan kızılötesi ışığı ölçer. Bant ile zemin ışığı farklı yansıttığı için robot "şu an bandın üstündeyim" diyebilir. Peki beş sensörden hangisinin bandı gördüğünü, yani bandın robotun neresinde olduğunu nasıl anlarsın?

## Etkinlik
### Sensör nasıl çalışır?
TCRT5000 gibi yansımalı sensörde yan yana iki küçük parça durur: bir kızılötesi (IR) LED ve bir fototransistör. LED yere ışık gönderir, yüzey ışığı ne kadar yansıtırsa fototransistör o kadar akım geçirir. Açık renkli ve parlak yüzey çok, koyu ve mat yüzey az yansıtır. Sensör modülünün analog çıkışı bu farkı bir gerilime çevirir.

Bu derste kullandığımız devrede **çizgi üstünde okuma yüksek, zeminde düşüktür**: çizgi üstünde yaklaşık 4,2 V (`analogRead` ≈ 860), zeminde yaklaşık 0,8 V (≈ 164). Gerçek modüllerde yön tersi olabilir; hangi modülü aldıysan önce ham değerlere bak, sonra kodu ona göre yaz.

### Devre
Robotun önüne, yere doğru bakacak biçimde beş sensör sıralanır. Sensörler 2,4 cm arayla yan yana durur, aks hizasından 7 cm öndedir. Çizgi genişliği 2 cm'dir. Sensörlerin yerden yüksekliği birkaç milimetre olmalıdır; kesin mesafeyi parçanın veri sayfasından kontrol et.

| Parça | Bağlantı |
|---|---|
| Sensör 0 (en sol) | AO → **A0**, VCC → 5 V, GND → GND |
| Sensör 1 | AO → **A1** |
| Sensör 2 (orta) | AO → **A2** |
| Sensör 3 | AO → **A3** |
| Sensör 4 (en sağ) | AO → **A4** |

Sıra önemlidir: robota arkadan, ilerleme yönüne bakarken A0 en solda, A4 en sağdadır. Bu sırayı bir kez karar verip bütün kodda kullan. Sürücü ve motor bağlantıları bu derste kullanılmıyor; sonraki derslerde standart bağlantılarla ekleyeceğiz.

### Program: ham okuma
Önce sensörlerin ne söylediğine bak. Beş değeri tek satırda yazdıran program:

```cpp
// sketch: sensor_ham
const int SENSOR_SAYISI = 5;
const int SENSOR_PIN[SENSOR_SAYISI] = {A0, A1, A2, A3, A4};

void setup() {
  Serial.begin(9600);
}

void loop() {
  for (int i = 0; i < SENSOR_SAYISI; i++) {
    Serial.print(analogRead(SENSOR_PIN[i]));
    if (i < SENSOR_SAYISI - 1) {
      Serial.print(' ');
    }
  }
  Serial.println();
  delay(200);
}
```

Robotu çizgiye ortalı koyarsan `164 164 860 164 164` gibi bir satır görürsün: ortadaki sensör çizgide (yüksek), diğerleri zeminde (düşük).

### Program: dijital eşikleme ve çizgi konumu
Ham sayılarla uğraşmak yerine her sensör için tek bir soru sorarız: "çizgide mi?" Bunu tek bir **eşik** ile yaparız: okuma eşikten büyükse 1 (çizgi), değilse 0 (zemin). Zemin 164, çizgi 860 olduğuna göre ikisinin ortasındaki 512 makul bir başlangıç eşiğidir.

Sonra beş bitlik bir desen çıkar (`00100`). Tek sensör çizgideyse konumu −2…+2 aralığında söyleriz: **negatif = çizgi solda**, 0 = ortada, pozitif = sağda.

```cpp
// sketch: sensor_desen
const int SENSOR_SAYISI = 5;
const int SENSOR_PIN[SENSOR_SAYISI] = {A0, A1, A2, A3, A4};
const int ESIK = 512;

void setup() {
  Serial.begin(9600);
}

void loop() {
  int sayi = 0;       // kac sensor cizgide
  int ilk = -1;       // cizgiyi gorenlerden ilkinin numarasi

  for (int i = 0; i < SENSOR_SAYISI; i++) {
    bool cizgide = analogRead(SENSOR_PIN[i]) > ESIK;
    if (cizgide) {
      Serial.print('1');
      sayi++;
      if (ilk < 0) {
        ilk = i;
      }
    } else {
      Serial.print('0');
    }
  }

  if (sayi == 0) {
    Serial.println(" cizgi yok");
  } else if (sayi == 1) {
    Serial.print(" konum=");
    Serial.println(ilk - 2);          // A0 -> -2, A2 -> 0, A4 -> +2
  } else {
    Serial.println(" birden cok sensor");
  }
  delay(200);
}
```

### Nasıl çalışıyor?
1. `SENSOR_PIN` dizisi sensörleri soldan sağa sıralar. `for` döngüsü beşini aynı kodla okur (4. derste gördüğün diziler).
2. `analogRead(...) > ESIK` bir `bool` üretir. Böylece sayıyı "çizgi var/yok" bilgisine çevirmiş olursun.
3. `ilk - 2` işlemi sensör numarasını (0…4) konuma (−2…+2) çevirir. Ortadaki sensör 2 numaradır, konumu 0'dır.
4. Çizgi 2 cm genişliğinde, sensörler 2,4 cm arayla durur. Bir sensör, çizginin merkezine 1 cm'den (çizginin yarı genişliği) yakınsa çizgiyi görür. Çizginin merkezi komşu iki sensörün arasında, ikisinden de 1 ile 1,4 cm uzakta kalırsa iki sensör de zemin görür: `00000`. Bu yaklaşık 4 mm'lik bir **kör bölgedir**. Sensör aralığı çizgi genişliğinden büyük olduğu sürece böyle bir kör bölge kalır. Çizgi 3 cm olsaydı aynı konumda iki yan yana sensör birden `1` verirdi ve program "birden cok sensor" yazardı.

### Dene
- `ESIK` değerini 100 yap. Zemin okuması 164 olduğuna göre beş sensör de `1` verir. Eşik çok düşükse neden her yer "çizgi" olur?
- `ESIK` değerini 900 yap. Çizgi 860 okuduğu için artık çizgiyi hiç göremezsin. Eşiği hangi aralıkta seçebilirsin?
- Robotu çizginin 1,2 cm yanına koy ve deseni izle. Kör bölgeyi buldun mu?

### Sık yapılan hatalar
- Sensör sırasını karıştırmak: A0'ı sağ sanarsan robot bütün sonraki derslerde ters yöne döner.
- Modülün çıkışı ters (çizgi alçak okuyor) olduğu halde `>` kullanmak. Önce ham değerlere bak.
- Bütün kodu tek bir sayıya ("512") bağlamak. Işık ya da zemin değişince bu sayı yanlış çıkar; sonraki derste eşiği ölçerek bulacağız.
- Sensörü yerden çok yükseğe takmak: yansıma azalır, çizgi ile zemin arasındaki fark küçülür.

### Gerçek robotta farklı olabilecekler
Benzetimdeki sensör gürültüsüz ve her zaman 0,8 V / 4,2 V verir. Gerçek TCRT5000'de çizgi ve zemin rengi, bandın parlaklığı, sensörün yerden yüksekliği ve ortam ışığı (güneş ışığı kızılötesi de içerir) değerleri değiştirir. Okumalar iki sabit sayı olmaz, titrer.

## Konuşalım
Beyaz bir zeminde siyah bant yerine parlak, yansıtıcı bir bant kullansan sensörün okuması nasıl değişirdi? Robotun programında neyi değiştirmen gerekirdi?
