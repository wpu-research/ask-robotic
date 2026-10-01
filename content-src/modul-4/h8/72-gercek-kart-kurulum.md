# Gerçek kart: kurulum, yükleme, multimetre, güvenlik
süre: 25

## Merak
Simülatörde "Çalıştır"a basınca program anında başlıyordu. Gerçek kartta ise önce kartı tanıtman, doğru portu seçmen ve kodu kabloyla yüklemen gerekir. Üstelik bir şey çalışmayınca sebep kodda mı, kabloda mı, kartta mı bilmek için tek aracın multimetredir. Gerçek donanıma ilk adımını güvenle atalım.

## Etkinlik
### Kurulum: Arduino IDE
1. Arduino IDE'yi bilgisayarına kur (resmî sitesinden).
2. Kartı USB kablosuyla bağla. Kablo **veri taşıyan** türden olmalı; bazı ucuz kablolar yalnızca şarj içindir ve bilgisayar kartı hiç görmez.
3. **Araçlar → Kart** menüsünden kartını seç (Arduino Uno gibi). Klon kartlarda USB çipi farklı olabilir; bilgisayar kartı tanımazsa o çipe ait sürücü gerekebilir.
4. **Araçlar → Port** menüsünden kartın portunu seç. Kartı çıkarıp takınca listede beliren yeni port odur.
5. **Doğrula** (derle), sonra **Yükle** düğmesine bas.

### Yükleme hataları (genel bilgi)
Mesajlar IDE ve kart sürümüne göre değişir; sebepler genelde şunlardır:
- Port listede yok: kablo yalnızca şarj kablosu, USB girişi gevşek ya da sürücü eksik.
- Yanlış kart seçili: kodun derlenir ama yükleme sırasında kartla iletişim kurulamaz.
- Port meşgul: Seri Monitör ya da başka bir program portu tutuyor; kapatıp yeniden dene.
- Linux'ta port için kullanıcı izni gerekebilir.
- D0 ve D1 pinlerine bir şey bağlıysa (örneğin bir modül) yükleme sırasında bu pinler kartın USB hattıyla çakışır; yüklerken söküp sonra tak.

### Doğrulama: gerçekten yüklendi mi?
Yeni kodu yüklediğinde "yüklendi" yazısı yetmez; davranışın değiştiğini **görerek** doğrula. Bu sketch hem LED yakıp söndürür hem de her turu sayar:

```cpp
// sketch: yukleme_dogrulama
const int LED = 13;
unsigned long tur = 0;

void setup() {
  pinMode(LED, OUTPUT);
  Serial.begin(9600);
  Serial.println("Kart hazir");
}

void loop() {
  digitalWrite(LED, HIGH);
  delay(500);
  digitalWrite(LED, LOW);
  delay(500);
  tur++;
  Serial.print("Tur: ");
  Serial.println(tur);
}
```

Yüklemeden sonra D13'teki yerleşik LED saniyede bir yanıp sönmeli, Seri Monitör (9600) "Kart hazir" ve "Tur: 1", "Tur: 2" yazmalı. Şimdi `delay(500)` değerlerini 100 yapıp yeniden yükle. LED hızlandıysa yeni kodun karta gerçekten gitmiştir. Hızlanmadıysa eski kod çalışıyordur.

### Multimetre: üç ölçüm
Multimetreyi bir "göz" gibi düşün. Kırmızı prob genelde V/Ω yuvasına, siyah prob COM yuvasına takılır; akım ölçümünde kırmızı prob ayrı bir akım yuvasına geçer (cihazının kılavuzuna bak).

| Ölçüm | Kadran | Nasıl ölçülür | Ne beklenir |
|---|---|---|---|
| Gerilim (DC) | V ile gösterilen, düz çizgili DC konumu | Devre **çalışırken**, probları ölçülecek iki noktaya **paralel** koy: siyah GND, kırmızı 5 V pini | Kart USB'den çalışırken 5 V pini yaklaşık 5 V; 3,3 V pini yaklaşık 3,3 V gösterir |
| Süreklilik | Diyot/ses simgeli konum | Devreyi **kapatıp** (USB çıkık) iki ucu probla; ses ve düşük değer = iletiyor | Kabloların iki ucu arasında ses beklenir; iki ayrı hat arasında ses **olmamalı** |
| Akım (DC) | A ya da mA konumu, akım yuvası | Devreyi **keserek** multimetreyi **seri** bağla | Değer, devredeki yüke göre değişir |

Adım adım gerilim ölçümü:
1. Kartı USB'ye tak.
2. Multimetreyi DC gerilim konumuna al.
3. Siyah probu kartın GND pinine, kırmızıyı 5 V pinine değdir.
4. Okuma 5 V civarında olmalı. Çok sapma varsa USB kaynağını ve kabloyu şüphelen.

Adım adım süreklilik ölçümü:
1. USB'yi çıkar. Süreklilik ölçümü güç **kapalıyken** yapılır.
2. Multimetreyi süreklilik konumuna al; iki probu birbirine değdirip sesin geldiğini kontrol et.
3. Bir kablonun iki ucuna probları değdir: ses geliyorsa kablo sağlam.
4. 5 V ile GND arasını dene: **ses gelmemeli**. Gelirse kısa devre vardır, USB'yi takma.

Adım adım akım ölçümü:
1. Güç kapalıyken devrede ölçmek istediğin hattı bir noktadan kes (kabloyu çıkar).
2. Multimetreyi akım konumuna al, probları akım yuvalarına tak.
3. Kesilen iki ucu multimetreyle birleştir: akım multimetrenin içinden geçmeli (**seri**).
4. Gücü aç, değeri oku. Ölçüm bitince multimetreyi çıkar ve hattı eski hâline getir.
5. Akım yuvası genelde düşük direnç gibi davranır; probları **asla** doğrudan bir güç kaynağına paralel bağlama.

### Kartla ölçümü karşılaştır
`analogRead` ile okuduğun değer, ADC'nin 5 V referansına göre hesaplanır. USB'den gelen gerilim tam 5,00 V olmayabilir; bu yüzden multimetre ve kart çok az farklı sonuç verebilir. Bu sketch A0 gerilimini hesaplar; multimetreyle aynı noktayı ölç ve karşılaştır:

```cpp
// sketch: adc_voltmetre
void setup() {
  Serial.begin(9600);
}

void loop() {
  int ham = analogRead(A0);
  float volt = ham * 5.0 / 1023.0;      // 5 V referans varsayımı
  Serial.print("ADC=");
  Serial.print(ham);
  Serial.print(" V=");
  Serial.println(volt, 2);
  delay(500);
}
```

### Elektronik güvenliği
- **220 V yasak.** Şebeke gerilimiyle (prizden gelen) devre kurma. Bu kursta röle ve benzeri parçaları yalnızca düşük gerilimle (5 V) kullanırsın.
- **Kısa devre:** 5 V ile GND'yi doğrudan birleştirmek aşırı akım çektirir; kart ya da USB portu zarar görür, parça ısınır. Güç vermeden önce bağlantılara bak, süreklilik ölçümüyle 5 V-GND arasını dene.
- **Ters bağlama:** Güç kaynağını, pili ya da yönlü parçaları (LED, elektrolitik kondansatör, bazı modüller) ters bağlamak parçayı bozabilir. Üzerindeki +/− işaretlerine bak.
- **Pil güvenliği:** Pilleri kısa devre yapma, ters takma, ısınan ya da şişen pili kullanma; bir yetişkine göster.
- Devreyi değiştirirken **önce gücü kes**, sonra kabloyu sök/tak.
- LED'e direnç koy; motor, servo ve röle gibi akım çeken parçaları kartın 5 V pininden değil, ayrı güç kaynağından besle ve GND'leri ortak yap (71. ders).

### Nasıl çalışıyor?
1. `yukleme_dogrulama` her yarım saniyede LED'in durumunu değiştirir. Tur sayısı seriye yazılır; böylece kartın canlı olduğunu iki yerden görürsün.
2. `adc_voltmetre` ADC değerini gerilime çevirir (11. ders). Aynı noktayı multimetreyle ölçüp farkı görürsün.
3. Multimetrede gerilim paralel, akım seri, süreklilik ise güçsüz devrede ölçülür.

### Dene
- `yukleme_dogrulama` içindeki süreyi değiştirip yükle; değişikliğin karta gittiğini LED'den doğrula.
- A0'a potansiyometre bağla, ortasını çevir. `adc_voltmetre`'nin yazdığı değeri multimetreyle karşılaştır. Fark kaç mV?
- Bir kablonun sağlam olup olmadığını süreklilik konumuyla dene. Kopuk olduğundan şüphelendiğin bir kabloyu da aynı yöntemle sına.

### Sık yapılan hatalar
- Akım ölçerken multimetreyi gerilim ölçer gibi **paralel** bağlamak: kısa devre olur, sigorta atabilir.
- Multimetre akım konumunda kalmışken gerilim ölçmeye çalışmak.
- Süreklilik ölçümünü güç açıkken yapmak.
- Port ya da kart seçmeden "yükleme çalışmıyor" diye vazgeçmek.
- Yüklenen kodun gerçekten değiştiğini kontrol etmemek ve eski kodla hata ayıklamak.

## Konuşalım
Bir devre çalışmadığında sırasıyla hangi üç ölçümü yapardın? Neden önce multimetreyi çıkarıp koda bakmak yerine güç ve süreklilik ölçersin?
