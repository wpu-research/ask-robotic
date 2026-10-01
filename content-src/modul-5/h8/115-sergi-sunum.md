# Sergi ve sunum
süre: 40

## Merak
Sergi günü. Biri robotuna bakıp soruyor: "Peki ne kadar iyi?" Cevabın "çok iyi çalışıyor" ise konuşma burada biter. Cevabın "20 ± 3 cm'lik ölçütü, ölçtüğüm 18,3 ile 22,0 cm arasında karşıladı; bir testte şu nedenle başarısız oldum ve şöyle düzelttim" ise konuşma yeni başlar. Bu derste robotunun başarısını, başarısızlığını ve emeğini başkasının okuyup güvenebileceği bir biçimde anlatmayı öğreneceksin.

## Etkinlik
### Sunumun üç belgesi
1. **Sonuç tablosu:** her ölçüt için ölçülen değer ve geçti mi, kaldı mı.
2. **Hata raporu:** yaşadığın bir sorunun belirtisi, kök nedeni, düzeltmesi ve doğrulaması.
3. **Günlük rapor:** her gün ne yaptığın, ne ölçtüğün, neyi neden seçtiğin.

Üçü de düz metindir: tablo, birkaç satır ve sayılar. Süslü slayt gerekmez; güvenilir sayı gerekir.

### Rapor kültürü: HYVEX notlarından
HYVEX ekibinin staj ders programında bu işin nasıl yapıldığı şöyle özetleniyor:
- **Tek doğruluk kaynağı (Gün 2):** depo (repo) kaynak-doğruluktur; her şey düz metin olarak git'te tutulur. `raporlar/` klasöründeki günlük rapor kültürü bunun bir parçasıdır. Dersin sorusu: bir bilgi nerede yaşamalı, kafada mı, sohbet geçmişinde mi, repoda mı?
- **Kök neden analizi (Gün 4):** vaka, ping'in çalıştığı ama telemetri ve video akışının koptuğu bir durumdur; sorunun NetworkManager'ın IP'yi silmesi olduğu bulunmuştur. Yaklaşım: **belirtiyi kök nedene indirgeme**, katman katman doğrulama (fiziksel, IP, port, uygulama). "Arada düzeliyor" ifadesi kararsız bir katmanın işaretidir. Dersin sorusu: bir hatayı "çözdüm" demeden önce nasıl emin olursun?
- **Bilgi yönetimi (Gün 15):** anlamlı commit, günlük rapor (kök nedenle birlikte) ve "6 ay sonra okuyan anlasın" ilkesi.

Bu derste bunu küçük ölçekte yapacağız. Aşağıdaki şablonları kendi projene uygula.

### 1) Sonuç tablosu
Her ölçüt için dört sütun: ne istendi (ders 111), nasıl ölçüldü, ne ölçüldü, sonuç. Aşağıda ders 113'te simülatörde ölçtüğümüz değerlerle doldurulmuş bir örnek var.

| Yol | Ölçüt (ders 111) | Nasıl ölçüldü | Ölçülen | Sonuç |
|---|---|---|---|---|
| A | Çarpmadan bitir ve bitiş çizgisinde dur | Robot merkezi ile en yakın duvar arası en az 8 cm; durunca 1 sn kıpırdamadı | Çarpma yok, en yakın duvar 18,1 cm; 11,2 sn; çizgide durdu | GEÇTİ |
| B | Üç noktada uç noktası hatası < 5 mm | Pindeki servo darbelerinden uç noktası hesabı | En büyük hata 0,09 mm (komut edilen konum; mekanik hata ölçülmedi) | GEÇTİ (kapsam sınırlı) |
| C | Hedefi 20 ± 3 cm mesafede takip | Simülatörün bildiği sensör-hedef mesafesi, hedef 3 cm/sn uzaklaşırken | En küçük 18,3 cm, en büyük 22,0 cm | GEÇTİ |

Üç sayıyı ders 111'deki sketch'e girersen `yol A: GECTI`, `yol B: GECTI`, `yol C: GECTI` yazar (`A 0 1`, `B 0.16`, `C 18.3 22.0`).

**Bu tabloda dürüstlüğü sağlayan üç şey:**
- "Nasıl ölçüldü" sütunu. Ölçüm yöntemi yoksa sayı kanıt değildir.
- "Kapsam sınırlı" notu. B yolundaki 0,09 mm gerçek kolun sonucu değildir; matematik ve servo darbesidir. Dişli boşluğu, yük altında eğilme ve servo ölü bandı ölçülmedi.
- Sonucun simülatörden olduğunun belirtilmesi. Gerçek robot başka sayılar verir; kendi robotunun tablosunu kendi ölçümlerinle doldur.

### Program: kendi kendini ölçen skor tablosu
Sergide robotun kendisi sonucu söylesin. Bu sketch çizgi izleyen bir robot koşarken üç şeyi ölçer ve bitince tek bir satır yazar:
- **Tur süresi:** koşunun başlangıcından çizginin sonuna kadar.
- **Çarpma sayısı:** tamponlar (D2, D3, `INPUT_PULLUP`, basılı = LOW) kaç kez basıldı. Aynı çarpmanın titreşimleri tek sayılır (500 ms'den sık basışlar tek çarpma).
- **Ortalama hata:** çizgiyi gören her ölçümde, çizgi merkezinden kaç milimetre uzakta olduğunun mutlak değeri; hepsinin ortalaması.

Koşu iki şekilde biter: çizgi 400 ms görülmezse `BITTI`, 15 sn geçerse `ZAMAN_ASIMI`.

Devre: ders 111'deki Yol A tablosundan sürüş ve çizgi sensörleri (D5-D10, A0-A4) ve tamponlar (D2, D3). Bu sketch mesafe sensörünü ve enkoderi kullanmaz.

```cpp
// sketch: skor_tablosu
// Çizgi izleyen robot kendi performansını ölçer: tur süresi, çarpma sayısı, ortalama çizgi hatası.
const int SOL_EN = 5, SOL_IN1 = 7, SOL_IN2 = 8;
const int SAG_EN = 6, SAG_IN1 = 9, SAG_IN2 = 10;
const int TAMPON_SOL = 2, TAMPON_SAG = 3;       // INPUT_PULLUP: basılı = LOW
const int CIZGI[5] = {A0, A1, A2, A3, A4};

const int OLU_BOLGE = 51;
const int TABAN = 150;
const float KP = 55.0;
const float SENSOR_ARALIK_MM = 20.0;            // iki sensör arası
const unsigned long BASLAMA_MS = 500;           // sayım sonrası kalkış
const unsigned long KAYIP_MS = 400;             // çizgisiz geçen bu süre = pist bitti
const unsigned long ZAMAN_ASIMI_MS = 15000;
const unsigned long CARPMA_ARALIK_MS = 500;     // bundan sık basışlar tek çarpma sayılır

enum Durum { BEKLE, KOS, BITTI };
Durum durum = BEKLE;

unsigned long kosuBasla = 0;
unsigned long sonCizgi = 0;
unsigned long sonCarpma = 0;
int carpma = 0;
bool tamponOnce = false;

float hataToplamMm = 0;                         // |hata| toplamı
unsigned long olcumSayisi = 0;

void motor(int en, int in1, int in2, int hiz) {
  hiz = constrain(hiz, -255, 255);
  if (hiz == 0) { digitalWrite(in1, LOW); digitalWrite(in2, LOW); analogWrite(en, 0); return; }
  digitalWrite(in1, hiz > 0);
  digitalWrite(in2, hiz < 0);
  analogWrite(en, map(abs(hiz), 1, 255, OLU_BOLGE, 255));
}

void surus(int sol, int sag) {
  motor(SOL_EN, SOL_IN1, SOL_IN2, sol);
  motor(SAG_EN, SAG_IN1, SAG_IN2, sag);
}

float cizgiKonum(int &sayi) {
  float toplam = 0;
  sayi = 0;
  for (int i = 0; i < 5; i++) {
    if (analogRead(CIZGI[i]) > 512) {
      toplam += 2 - i;
      sayi++;
    }
  }
  return sayi ? toplam / sayi : 0;
}

void skorYaz(const char *sonuc, unsigned long bitisMs) {
  Serial.print("SKOR sonuc=");
  Serial.print(sonuc);
  Serial.print(" sure_s=");
  Serial.print((bitisMs - kosuBasla) / 1000.0, 2);
  Serial.print(" carpma=");
  Serial.print(carpma);
  Serial.print(" ort_hata_mm=");
  Serial.println(olcumSayisi ? hataToplamMm / olcumSayisi : 0.0, 1);
}

void setup() {
  pinMode(SOL_EN, OUTPUT); pinMode(SOL_IN1, OUTPUT); pinMode(SOL_IN2, OUTPUT);
  pinMode(SAG_EN, OUTPUT); pinMode(SAG_IN1, OUTPUT); pinMode(SAG_IN2, OUTPUT);
  pinMode(TAMPON_SOL, INPUT_PULLUP);
  pinMode(TAMPON_SAG, INPUT_PULLUP);
  Serial.begin(9600);
}

void loop() {
  unsigned long simdi = millis();

  // Çarpma sayacı: tampon basılınca bir kez say
  bool tampon = digitalRead(TAMPON_SOL) == LOW || digitalRead(TAMPON_SAG) == LOW;
  if (tampon && !tamponOnce && durum == KOS && simdi - sonCarpma > CARPMA_ARALIK_MS) {
    carpma++;
    sonCarpma = simdi;
  }
  tamponOnce = tampon;

  int sayi;
  float konum = cizgiKonum(sayi);

  switch (durum) {
    case BEKLE:
      if (simdi >= BASLAMA_MS) {
        kosuBasla = simdi;
        sonCizgi = simdi;
        durum = KOS;
      }
      break;

    case KOS:
      if (sayi > 0) {
        sonCizgi = simdi;
        hataToplamMm += fabs(konum) * SENSOR_ARALIK_MM;   // çizgi merkezden kaç mm kaçık
        olcumSayisi++;
        int fark = (int)(KP * konum);
        surus(TABAN - fark, TABAN + fark);
      }
      if (simdi - sonCizgi > KAYIP_MS) {                   // pist bitti
        surus(0, 0);
        skorYaz("BITTI", sonCizgi);
        durum = BITTI;
      } else if (simdi - kosuBasla > ZAMAN_ASIMI_MS) {
        surus(0, 0);
        skorYaz("ZAMAN_ASIMI", simdi);
        durum = BITTI;
      }
      break;

    case BITTI:
      surus(0, 0);
      break;
  }
}
```

### Nasıl çalışıyor?
1. `BEKLE` durumu 500 ms sonra `KOS`'a geçer ve `kosuBasla` kaydedilir. Tur süresi `kosuBasla` ile **son çizgi görülen an** arasındaki farktır; çizginin bittiğini anlamak için beklediğimiz 400 ms süreye dahil değildir.
2. Çarpma sayacı tamponun **basılma anını** (önceki turda basılı değil, şimdi basılı) bir kez sayar. Robot duvara dayanıp tamponu basılı tutarsa ya da hafifçe titrerse çarpma 500 ms içinde tekrar sayılmaz.
3. Ortalama hata, çizgiyi gören her turda `|konum| × 20 mm` olarak biriktirilir ve sayıya bölünür. Bu, ders 114'teki "ortalama mutlak hata" ile aynı formüldür.
4. `skorYaz` tek bir satır yazar: `SKOR sonuc=BITTI sure_s=6.68 carpma=0 ort_hata_mm=2.4`. Satır anahtar=değer biçimindedir; ders 114'teki gibi bir program bunu kolayca okuyabilir.
5. 15 sn'de bitiremezse `ZAMAN_ASIMI` yazar. Bir robotun "hiç bitirmedi" demesi, sessizce takılı kalmasından iyidir.

**Simülatörde doğruladıklarımız:**
- Temiz pist (1,6 m'lik çizgi, küçük bir kıvrım): `SKOR sonuc=BITTI sure_s=6.68 carpma=0 ort_hata_mm=2.4`. Süreyi simülatörün bildiği gerçek süreyle karşılaştırdık: 6,68 sn, aynı.
- Pistin sonuna bir duvar koyduğumuzda (çizgi duvara çıkıyor): robot duvara dayandı, tampon basıldı ve satır `sonuc=ZAMAN_ASIMI sure_s=15.00 carpma=1` çıktı. Tek duvar, tek çarpma.
- **Ortalama hata konusunda bir uyarı:** simülatörün bildiği gerçek ortalama sapma 8,7 mm'dir, sketch 2,4 mm yazdı. Fark sensörden gelir: sensörler 20 mm arayla ve çizgi 20 mm kalındır; bir sensör çizgiyi "gördüğünde" çizgi onun ±10 mm yakınında olabilir ama sketch hatayı 0 sayar. Yani skor tablosu **ölçtüğü cihazın çözünürlüğü kadar** dürüsttür. Bu sayıyı "robotun çizgiden gerçek sapması" diye değil, "sensör dizisinin gördüğü sapma" diye raporla. Daha hassas bir ölçüm için daha sık ya da analog (gri tonlu) sensör gerekir.

### 2) Hata raporu: belirtiden kök nedene
Hata raporu bir özür değil, bir **kanıt zinciridir**. Şablon:

```text
HATA RAPORU
Başlık:            (tek cümle, sayıyla)
Belirti:           ne gördük? (ölçülmüş, yorumsuz)
Yeniden üretme:    hangi koşulda, kaç denemede kaç kez?
Katman incelemesi: her katman için: ne ölçtük, sonuç ne, SAĞLAM mı değil mi?
Kök neden:         belirtiyi üreten ilk katman ve nedeni
Düzeltme:          tek değişiklik
Doğrulama:         aynı test + komşu testler
Alınan ders:       bir daha nasıl önlenir?
```

Aşağıdaki örnek, ders 113'teki A yolunu hazırlarken **gerçekten yaşadığımız** türden bir hata. Ayrıntıları, `YAN_MS` değerini 1500 ms yaparak son sürümle yeniden üretip ölçtük.

```text
HATA RAPORU
Başlık:      A yolu parkurunu bitiremedi: robot engel duvarının ucunda takıldı.
Belirti:     Robot, "durum: SERBEST" yazdıktan sonra x = 1,72 m, y = 1,22 m'de durdu;
             "durum: BITTI" hiç yazılmadı. Robot merkezi ile en yakın duvar arası
             7,5 cm (robot yarıçapı, yani duvara değiyor).
Yeniden üretme: aynı başlangıç, aynı sonuç (simülatörde sabit tohumla; T1 senaryosu).
             Gerçek robotta tekrar tekrar denenmeli: bazen takılıp bazen geçiyorsa
             hata sınırdadır.
Katman incelemesi:
  Karar (durum makinesi): iz kaydında yön en çok 1,55 rad (yaklaşık 89°) oldu,
             sonra -0,06 rad'a (yaklaşık -4°) döndü. Sola dön, yana git, sağa dön
             deseni işledi. SAĞLAM.
  Dönüş:     ders 112'de 420 ms = yaklaşık 91°. SAĞLAM.
  Yana gitme: iz kaydında en büyük y = 1,233 m. Duvar ucu y = 1,15 m, robot yarıçapı
             0,075 m; geçmek için y >= 1,225 m gerekir: marj yalnız 8 mm. Üstelik
             sağa dönüş robotu tam doğuya çevirmedi (-4°, hafif güneye); robot
             ilerlerken y azaldı ve duvar ucuna geldiğinde y = 1,219 m idi.
             6 mm EKSİK. SAĞLAM DEĞİL.
Kök neden:   Yana gitme süresi (YAN_MS = 1500 ms) robotu duvarın ucunu yarıçap
             kadar aşacak yere götürmüyor; marj, dönüş hatasını bile
             karşılayamayacak kadar dar. "Belirti": robot takıldı. "Kök neden":
             YAN_MS yetersiz. Engel sensörü ya da motorlar suçlu değil.
Düzeltme:    YAN_MS 1500 -> 2000 (tek değişiklik).
Doğrulama:   T1 yeniden: bitirdi, en yakın duvar 18,1 cm. Komşu testler T2-T5 de geçti
             (ders 113 matrisi).
Alınan ders: Marj sıfıra yakındı; bu "arada düzeliyor" türünden bir sınır hatasıdır.
             Yeni sürümde en büyük y = 1,348 m, yani marj yaklaşık 12 cm. Gereksinime
             marjı yaz (y >= 1,225 + pay).
```

**Bu raporda dikkat et:**
- *Belirti* ile *kök neden* ayrıdır. "Robot takıldı" belirtidir. Yalnızca belirtiyi tedavi etseydik (örneğin ENGEL_CM'yi büyütmek) tesadüfen düzelebilirdi ve hata başka bir parkurda geri gelirdi.
- Her katmanda **ölçtük**, tahmin etmedik. İz kaydı, ders 112'nin dönüş ölçümü, duvar geometrisi.
- Tek değişiklik yaptık. İki şeyi birden değiştirseydik hangisinin işe yaradığını bilemezdik.
- Düzeltmeyi **komşu testlerle** doğruladık; bir hatayı düzeltirken başkasını bozmadığımızı gösterdik.

### 3) Günlük rapor şablonu
HYVEX'in `raporlar/` kültüründeki gibi her gün kısa bir rapor. Altı ay sonra bile birinin (ya da senin) neden o kararı aldığını anlayabileceği kadar ayrıntılı olmalı.

```text
GÜNLÜK RAPOR     Gün: __     Yazan: __     Yol: A / B / C

Bugünün hedefi:
  (tek cümle, ölçülebilir)

Yaptıklarım:
  - ...

Ölçümler (sayı + birim + nasıl):
  - ...

Sorun -> kök neden -> düzeltme:
  Belirti:
  Kök neden:
  Düzeltme:

Karar ve nedeni:
  (neyi seçtim, hangi seçeneği neden eledim?)

Yarın:
  - ...
```

Aşağıdaki örnek A yolu için, ders 113'ü yapan bir öğrencinin günlük raporudur (örnek, uydurma bir öğrenci; sayılar ders 113'ün ölçümleridir).

```text
GÜNLÜK RAPOR     Gün: 3     Yol: A

Bugünün hedefi:
  A yolu parkurunu durum makinesiyle uçtan uca çarpmadan bitirmek.

Yaptıklarım:
  - a_arac sketch'ini durum makinesiyle birleştirdim.
  - Test matrisinin 5 senaryosunu çalıştırdım.

Ölçümler:
  - T1: 11,2 sn, en yakın duvar 18,1 cm, çarpma yok (simülatör).
  - T4 (sağ motor %4 zayıf): en yakın duvar 10,0 cm; marj daralıyor.

Sorun -> kök neden -> düzeltme:
  Belirti: YAN_MS = 1500 ile robot duvar ucunda takıldı (1,72; 1,22).
  Kök neden: yana gitme mesafesi yetmiyor, 6 mm eksik.
  Düzeltme: YAN_MS = 2000.

Karar ve nedeni:
  Süreyi artırdım, engel eşiğini (28 cm) değiştirmedim: eşik algılamayı değil,
  yana gitmeyi etkiliyor.

Yarın:
  - Gerçek robotta DONUS_MS'yi iletkiyle yeniden ölç.
```

Git kullanıyorsan, aynı düzeltmenin commit mesajı da bir mini rapordur: `yol-a: YAN_MS 1500 -> 2000, robot engel ucunda 6 mm eksik kaldigi icin takiliyordu`. "düzelttim" ya da "son hali" gibi mesajlar altı ay sonra hiçbir şey anlatmaz (HYVEX'in "anlamlı commit" ilkesi).

### Sergi günü için kontrol listesi
- Robotun, tasarım belgen ve sonuç tablon yan yana.
- Her ölçüt için ölçüm yöntemi ve sayı, geçti/kaldı.
- Bir hata raporu: belirti, kök neden, düzeltme, doğrulama.
- Günlük raporların: kararların nedeni.
- Seri çıktıyı gösteren bir ekran: `SKOR ...` ya da `yol A: GECTI`.
- Robotun yedek pili ve harici güç kaynağı (pil güvenliği: kısa devre yapma, ters bağlama).
- Bir "olmazsa" planı: robot sergide yanlış çalışırsa gösterebileceğin kayıt ya da ölçüm tablosu.

### Yolculuk: Arduino'dan robota
Bu proje Modül 3'ten 5'e uzanan yolun son halkası.
- **Modül 3, Arduino temelleri:** bir LED'i yakmaktan başladın. Dijital ve analog girişleri, PWM'i, motor ve röle sürmeyi, `millis()` ile bloklamayan kodu, durum makinelerini, kesmeleri, I2C'yi ve EEPROM'u öğrendin. Termostatla ilk bitirme projeni yaptın.
- **Modül 4, sensörler:** dünyayı ölçmeyi öğrendin. HC-SR04 ile mesafe, PIR, kızılötesi ve reed sensörleri, sıcaklık ve nem, basınç, joystick, döner enkoder, MPU6050 ile eğim, keypad ve gerçek zamanlı saat. Her ölçümün gürültülü olduğunu ve filtreyle düzeltildiğini gördün.
- **Modül 5, robotik:** sensör ve motoru bir robota çevirdin. Diferansiyel sürüş, engelden kaçma, çizgi izleme, enkoder ve odometri, PID, IMU ile denge, davranış tabanlı kontrol ve robot kol. Bu hafta üçünü bir araya getirip ölçütlerle sınadın, hatalarını kök nedene indirgedin ve sonuçlarını raporladın.

Bir şeyi sadece çalıştırmayı değil, **ölçerek kanıtlamayı** öğrendin. Elinde artık çalışan bir robot, onu anlatan bir tasarım belgesi, ölçüm tablosu ve bir hata raporu var.

### Dene
- Kendi yolunun sonuç tablosunu doldur. Her satır için "nasıl ölçüldü" sütununu yaz. Hangi ölçümün zayıf olduğunu işaretle.
- `skor_tablosu` sketch'indeki `KP` değerini 30 ve 90 yap. Süre, çarpma ve ortalama hata nasıl değişiyor? Hangi değer en iyi? Bunu bir tabloyla göster.
- Kendi robotunda bir hata bul ve hata raporu şablonuyla yaz: belirti, katman incelemesi, kök neden, tek değişiklik, doğrulama.
- Üç günlük rapor yaz. Bir arkadaşına ver; senin kararını anlayabiliyor mu?

### Sık yapılan hatalar
- Sonucu ölçümden önce yazmak ya da başarısız testi tablodan çıkarmak. Başarısız test, raporun en değerli satırlarından biridir.
- Belirtiyi kök neden sanmak: "robot çarptı" sonuçtur, neden değil.
- Tek seferde birkaç şeyi değiştirip "düzeldi" demek. Hangisinin işe yaradığını bilemezsin.
- "Arada düzeliyor" hatasını ciddiye almamak. Bazen geçip bazen kalan bir test, sınırda bir sorun olduğunu gösterir.
- Simülatör ölçümlerini gerçek robotun sonucu gibi sunmak.
- Skor tablosunun ortalama hatasını gerçek hata sanmak. Sensörün çözünürlüğü sayıyı sınırlar.
- Raporu "yarın yazarım" diye ertelemek. Yaptığın şeyin nedeni birkaç günde unutulur.

## Konuşalım
Altı ay sonra bu robotun yanında seni tanımayan biri durup raporlarını okusa, "neden bu `YAN_MS` değeri?" sorusunun cevabını bulabilir mi? Bulamazsa raporuna ne eksik?
