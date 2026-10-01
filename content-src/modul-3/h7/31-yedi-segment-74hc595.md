# 7-segment ekran ve 74HC595
süre: 25

## Merak
Hesap makinesindeki rakamlar nasıl çiziliyor? Aslında yedi küçük çubuk LED'in bir kısmı yanıyor, bir kısmı sönük. Ama yedi çubuk için yedi pin harcamak çok pahalı. Bir kartın yalnızca üç pinle sekiz çıkışı birden yönetmesi mümkün mü?

## Etkinlik
### Devre
7-segment ekran, "a" ile "g" arasında adlandırılmış yedi çubuktan ve bir de nokta (dp) LED'inden oluşur. Bu derste **ortak katotlu** (tüm LED'lerin eksi uçları birleşik) bir ekran kullanıyoruz; laboratuvarda parçanın **Ortak uç** özelliği varsayılan olarak "Ortak katot"tur. Yedi çubuğu tek tek pinlere bağlamak yerine bir **74HC595 kaydırmalı yazmaç** kullanacağız. Uno ona bitleri sırayla yollar, çip de sekiz çıkışı birden değiştirir.

Parçaları laboratuvarda **Parça ekle** menüsünden seç, pinleri kablo çekerek bağla. Gereken parçalar: 74HC595 (`sr595`), 7-segment ekran (`sevenseg`) ve 7 direnç.

| Parça | Bağlantı |
|---|---|
| 74HC595 VCC ve SRCLR | 5V |
| 74HC595 GND ve OE | GND |
| 74HC595 SER (veri) | **D4** |
| 74HC595 SRCLK (saat) | **D6** |
| 74HC595 RCLK (mandal) | **D5** |
| 74HC595 QA, QB, QC, QD, QE, QF, QG | Her biri bir 330 Ω dirençten geçip ekranın sırasıyla a, b, c, d, e, f, g ucuna |
| 74HC595 QH (isteğe bağlı) | 330 Ω direnç üzerinden ekranın dp ucuna (Dene bölümünde kullanılacak) |
| 7-segment COM | GND |

Direnç değerini direnci seçip sağ paneldeki özelliklerden ayarla (varsayılan 330 Ω uygundur). Her çubuk için ayrı bir direnç gerekir. Gerçek çipte bu uçların numaraları VCC için 16, GND için 8, SER için 14, SRCLK için 11, RCLK için 12, OE için 13 ve SRCLR için 10'dur; ama laboratuvarda pinleri adlarıyla seçersin.

Laboratuvar 74HC595'in iki önemli ucunu da modeller: **OE** (çıkış etkin) 5V'a bağlıysa ya da boş bırakılmışsa çıkışlar kapalıdır; **SRCLR** (yazmaç temizle) GND'ye bağlıysa ya da boş bırakılmışsa yazmaç sürekli temizlenir. İkisi için de boş bıraktığında "bağlı olmayan giriş" uyarısı görürsün.

### Program
Her rakam bir **bayt**tır (8 bit). Bit 0 "a" çubuğunu, bit 1 "b" çubuğunu, ... bit 6 "g" çubuğunu, bit 7 nokta LED'ini yönetir (bit 0 QA'ya, bit 7 QH'ye gider). Örneğin 1 rakamı için yalnız b ve c yanar: `0b00000110`, yani 0x06.

```cpp
// sketch: yedi_segment_sayac
const int VERI = 4;    // DS
const int MANDAL = 5;  // ST_CP
const int SAAT = 6;    // SH_CP

// 0'dan 9'a rakam desenleri (bit 0 = a ... bit 6 = g)
const byte RAKAM[10] = {
  0x3F, 0x06, 0x5B, 0x4F, 0x66,
  0x6D, 0x7D, 0x07, 0x7F, 0x6F
};

void yaz(byte desen) {
  digitalWrite(MANDAL, LOW);                 // mandalı aç: çıkışlar sabit kalsın
  shiftOut(VERI, SAAT, MSBFIRST, desen);     // 8 biti sırayla kaydır
  digitalWrite(MANDAL, HIGH);                // mandalı kapat: çıkışlar bir anda güncellenir
}

void setup() {
  pinMode(VERI, OUTPUT);
  pinMode(MANDAL, OUTPUT);
  pinMode(SAAT, OUTPUT);
}

void loop() {
  for (int i = 0; i < 10; i++) {
    yaz(RAKAM[i]);
    delay(1000);
  }
}
```

### Nasıl çalışıyor?
1. `shiftOut` bir baytı bit bit gönderir. Her bit için önce **veri** pinini HIGH ya da LOW yapar, sonra **saat** pinine bir darbe verir. 74HC595 saatin yükselen kenarında veri pinine bakar ve biti içindeki yazmaca kaydırır.
2. `MSBFIRST` "en değerli bit önce" demektir. Bayt 0x06 (0b00000110) ise önce 0, 0, 0, 0, 0, 1, 1, 0 sırasıyla gider.
3. Sekiz saat darbesinden sonra bayt çipin içindedir, ama çıkışlar henüz değişmez. **Mandal** (ST_CP) pini LOW'dan HIGH'a geçince çip içindeki baytı çıkışlara aktarır. Böylece ekran kayarak değil, tek seferde değişir.
4. Çip zincirlenebilir: iki 74HC595 arka arkaya bağlanırsa `shiftOut`'u iki kez çağırarak 16 çıkışı üç pinle yönetirsin.
5. Hesap: ekranı doğrudan sürseydin 8 pin gerekirdi. 74HC595 ile 3 pin yetiyor; bir zincire her çip eklediğinde pin sayısı yine 3 kalıyor.

Aynı çipi ekran yerine 8 LED'e (her biri bir dirençle) bağlayabilirsin. Aşağıdaki program tek bir LED'i soldan sağa kaydırır. `1 << i` ifadesi, yalnızca i numaralı biti 1 yapar.

```cpp
// sketch: led_seridi
const int VERI = 4;
const int MANDAL = 5;
const int SAAT = 6;

void setup() {
  pinMode(VERI, OUTPUT);
  pinMode(MANDAL, OUTPUT);
  pinMode(SAAT, OUTPUT);
}

void loop() {
  for (int i = 0; i < 8; i++) {
    digitalWrite(MANDAL, LOW);
    shiftOut(VERI, SAAT, MSBFIRST, 1 << i);   // yalnızca i. LED yanar
    digitalWrite(MANDAL, HIGH);
    delay(200);
  }
}
```

### Dene
- ▶ ile programı çalıştır, ekranda 0'dan 9'a sayımı izle. Çalışırken bir direnci seç: **Sanal ölçüm** o çubuğun akımını gösterir (yaklaşık 8 mA). Direnci 1 kΩ yapıp çubuğun nasıl sönükleştiğine bak.
- `RAKAM` dizisindeki desenlerden birini elle bozup ekranda neyin değiştiğini gözle (örneğin 0x3F yerine 0x7F yaz).
- Nokta LED'ini yakmak için bayta 0x80 ekle: `yaz(RAKAM[i] | 0x80)`. Bunun için QH'nin dp'ye bağlı olması gerekir. Her rakamın yanında nokta yanar mı?
- Ekranı seçip **Ortak uç** özelliğini "Ortak anot" yap. COM'u GND yerine 5V'a bağla ve desenin tersini gönder (`~RAKAM[i]`).
- Geriye doğru sayan bir program yaz: 9'dan 0'a.

### Sık yapılan hatalar
- Mandal pinini hiç kullanmamak: bitler çipin içine kayar ama çıkışlar hiç değişmez, ekran boş kalır.
- Ortak anotlu ekranı ortak katotluymuş gibi kullanmak: rakamlar tersine görünür (yanan çubuklar sönük, sönükler yanık). Ortak anotlu ekranda COM'u 5V'a bağlarsın ve desen bayt ters çevrilir: `~RAKAM[i]`.
- Dirençsiz bağlamak: laboratuvar "LED'in seri direnci yok" uyarısı verir ve çubuk yanar (74HC595 çıkışının iç direnci yalnızca yaklaşık 50 Ω'dur). Gerçek çubuklarda da aşırı akım çubuğa ve çipe zarar verir.
- 74HC595'in OE ve SRCLR uçlarını yanlış bağlamak ya da boş bırakmak: çip çıkış vermez ya da yazmacı sürekli temizler.
- Besleme (VCC ve GND) kablolarını unutmak: laboratuvar "beslenmemiş" uyarısı verir, çıkış olmaz.

## Konuşalım
Sekiz LED'i üç pinle yönetmek harika, ama bir bedeli de var. Sence bu bedel ne olabilir? (İpucu: bir LED'in durumunu değiştirmek için kaç bayt göndermen gerekiyor?)
