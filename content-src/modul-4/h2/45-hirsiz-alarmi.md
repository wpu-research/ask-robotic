# Proje: Hırsız alarmı (durum makineli)
süre: 35

## Merak
Evin kapısına bir sensör, odaya bir sensör koyup alarmı kurdun ve kapıyı kapatıp çıkacaksın. Alarm hemen öter mi? Kendi evine girince şifreyi girene kadar sus mu? Susturulmuş bir alarm yine de "bir şey oldu" diye hatırlıyor mu? Bu sorulara cevap veren şey sensörlerden çok **durumlar** ve aralarındaki **geçişlerdir**.

## Etkinlik
### Ne yapacağız?
Bu proje bu haftanın derslerini ve eski konuları birleştirir:
- **41. ders:** PIR ile hareket algılama (D2).
- **43. ders:** Reed anahtarıyla kapı kontağı (D4) ve debounce.
- **18. ders:** Buzzer ile alarm sesi (D8).
- **27-28. dersler:** `millis()` ile bloklamayan zamanlama ve `enum` ile durum makinesi.

Alarm dört durumlu çalışır:

| Durum | Anlamı | LED (D13) | Buzzer (D8) |
|---|---|---|---|
| DEVRE_DISI | Sistem kapalı, sensörler yok sayılır | Sönük | Sessiz |
| HAZIR | Kurulu, ihlal bekliyor | Her 2 sn'de kısa bir parlama | Sessiz |
| ALARM | İhlal oldu | Hızlı yanıp söner | Sirenli ses |
| SUSTURULDU | Alarm susturuldu ama olay hatırlanıyor | Yavaş yanıp söner | Sessiz |

Kurma sırasında 5 saniyelik **çıkış gecikmesi** vardır: butona basarsın, LED hızlı yanıp söner; gerçek bir evde bu sürede evden çıkıp kapıyı kapatırdın. Süre bitince sistem HAZIR olur. Çıkış gecikmesi ayrı bir durum değildir; DEVRE_DISI içinde bir bayrakla izlenir.


### Devre
Parçaları laboratuvarda **Parça ekle** menüsünden seç, pinleri kablo çekerek bağla.

| Parça | Bağlantı |
|---|---|
| PIR | VCC → 5V, GND → GND, OUT → **D2** |
| Buton "kur / şifre" | A → **D3**, B → GND (`INPUT_PULLUP`) |
| Reed | A → **D4**, B → GND (`INPUT_PULLUP`) |
| Buzzer (Tür: Pasif) | + → **D8**, − → GND (18. dersteki bağlantıyla aynı) |
| Direnç (330 Ω) | 1 → **D13**, 2 → LED A |
| LED | A → direncin 2 ucu, K → GND |

Bu projede 42. dersteki IR engel sensörü kullanılmaz; D3'ü şifre butonu için kullanıyoruz. Reed'in **Mıknatıs yakın** kutusu kapıyı temsil eder: işaretliyse kapı kapalıdır ve D4 `LOW`, işaretsizse kapı açıktır ve D4 `HIGH` okunur (43. ders). Kutu başlangıçta işaretsizdir, yani kapı açıktır; kurmadan önce işaretle. **Şifre** için 3 saniye içinde butona üç kez bas ve bırak.

### Kurma ve şifre
- **Kurma:** DEVRE_DISI durumunda butona **bir kez** bas. Kapı açıksa sistem kurulmaz ve "Kapi acik" mesajı yazar. Kapı kapalıysa 5 saniye çıkış gecikmesi başlar.
- **Çıkış gecikmesi** sırasında PIR yok sayılır. 5 saniye sonunda kapı hâlâ açıksa kurma iptal olur. Aksi halde sistem HAZIR olur.
- **Şifre:** 3 saniye içinde **üç kez** butona basmak şifredir. Tek bir yanlışlıkla basış sistemi kapatmasın diye bu şekilde seçtik. Süre dolarsa sayaç sıfırlanır.
- **HAZIR** durumunda şifre girersen DEVRE_DISI'ya, **ALARM**'da girersen SUSTURULDU'ya, **SUSTURULDU**'da girersen DEVRE_DISI'ya geçersin.
- ALARM, şifre girilmese de `ALARM_SURESI` (10 saniye) sonunda SUSTURULDU'ya geçer. Böylece alarm sonsuza dek çalmaz ama LED olayın izini gösterir.

### Program
```cpp
// sketch: hirsiz_alarmi
const int PIR = 2;
const int BUTON = 3;
const int REED = 4;
const int BUZZER = 8;
const int LED = 13;

const unsigned long CIKIS_GECIKMESI = 5000;   // ms
const unsigned long ALARM_SURESI = 10000;     // ms
const unsigned long SIFRE_PENCERESI = 3000;   // ms
const unsigned long BUTON_KARARLI = 30;       // ms: debounce
const int SIFRE_BASIS = 3;                    // şifre: 3 basış

enum Durum { DEVRE_DISI, HAZIR, ALARM, SUSTURULDU };
const char* DURUM_ADI[] = { "DEVRE_DISI", "HAZIR", "ALARM", "SUSTURULDU" };

Durum durum = DEVRE_DISI;
bool cikisBekliyor = false;
unsigned long cikisBasla = 0;
unsigned long alarmBasla = 0;

bool oncekiBasili = false;
unsigned long sonBasis = 0;
unsigned long ilkBasis = 0;
int basisSayisi = 0;

bool sirenFaz = false;

void durumDegistir(Durum yeni) {
  durum = yeni;
  basisSayisi = 0;                 // yeni durumda şifre sayacı sıfırlansın
  cikisBekliyor = false;
  noTone(BUZZER);
  sirenFaz = false;
  Serial.print("Durum: ");
  Serial.println(DURUM_ADI[durum]);
}

// Butonun yeni basışını bir kez bildirir (kenar + debounce).
bool yeniBasis(unsigned long simdi) {
  bool basili = (digitalRead(BUTON) == LOW);
  bool yeni = basili && !oncekiBasili && (simdi - sonBasis > BUTON_KARARLI);
  oncekiBasili = basili;
  if (yeni) sonBasis = simdi;
  return yeni;
}

// Şifre girildi mi? Her yeni basış için bir kez çağrılır.
bool sifreTamam(unsigned long simdi) {
  if (basisSayisi == 0 || simdi - ilkBasis > SIFRE_PENCERESI) {
    basisSayisi = 1;               // pencere dışında: yeni deneme başlat
    ilkBasis = simdi;
  } else {
    basisSayisi++;
  }
  if (basisSayisi >= SIFRE_BASIS) {
    basisSayisi = 0;
    return true;
  }
  return false;
}

bool ihlalVar() {
  bool hareket = (digitalRead(PIR) == HIGH);
  bool kapiAcik = (digitalRead(REED) == HIGH);
  return hareket || kapiAcik;
}

// LED desenini durumdan üretir.
void ledGuncelle(unsigned long simdi) {
  bool yanik = false;
  if (durum == DEVRE_DISI) {
    yanik = cikisBekliyor && (simdi % 500 < 250);     // çıkış gecikmesinde hızlı
  } else if (durum == HAZIR) {
    yanik = (simdi % 2000 < 100);                     // 2 sn'de bir kısa parlama
  } else if (durum == ALARM) {
    yanik = (simdi % 200 < 100);                      // çok hızlı
  } else {
    yanik = (simdi % 1000 < 500);                     // yavaş
  }
  digitalWrite(LED, yanik);
}

// Siren: 250 ms'de bir 1 kHz ile 2 kHz arasında geçiş yapar.
void sirenGuncelle(unsigned long simdi) {
  bool faz = (simdi / 250) % 2;
  if (faz != sirenFaz) {
    sirenFaz = faz;
    tone(BUZZER, faz ? 2000 : 1000);
  }
}

void setup() {
  pinMode(PIR, INPUT);
  pinMode(BUTON, INPUT_PULLUP);
  pinMode(REED, INPUT_PULLUP);
  pinMode(BUZZER, OUTPUT);
  pinMode(LED, OUTPUT);
  Serial.begin(9600);
  Serial.println("Durum: DEVRE_DISI");
}

void loop() {
  unsigned long simdi = millis();
  bool basis = yeniBasis(simdi);

  switch (durum) {
    case DEVRE_DISI:
      if (basis && !cikisBekliyor) {
        if (digitalRead(REED) == HIGH) {
          Serial.println("Kapi acik, kurulamadi");
        } else {
          cikisBekliyor = true;
          cikisBasla = simdi;
          Serial.println("Cikis gecikmesi basladi");
        }
      }
      if (cikisBekliyor && simdi - cikisBasla >= CIKIS_GECIKMESI) {
        if (digitalRead(REED) == HIGH) {
          cikisBekliyor = false;
          Serial.println("Kapi kapanmadi, kurma iptal");
        } else {
          durumDegistir(HAZIR);
        }
      }
      break;

    case HAZIR:
      if (basis && sifreTamam(simdi)) {
        durumDegistir(DEVRE_DISI);
      } else if (ihlalVar()) {
        alarmBasla = simdi;
        durumDegistir(ALARM);
      }
      break;

    case ALARM:
      sirenGuncelle(simdi);
      if (basis && sifreTamam(simdi)) {
        durumDegistir(SUSTURULDU);
      } else if (simdi - alarmBasla >= ALARM_SURESI) {
        durumDegistir(SUSTURULDU);
      }
      break;

    case SUSTURULDU:
      if (basis && sifreTamam(simdi)) {
        durumDegistir(DEVRE_DISI);
      }
      break;
  }

  ledGuncelle(simdi);
}
```

### Nasıl çalışıyor?
1. Durum makinesi (28. ders) `enum Durum` ve bir `switch` ile yazıldı. `loop()` hiç `delay` içermez, her tur çok kısa sürer; çıkış gecikmesi, alarm süresi, şifre penceresi ve LED desenleri `millis()` ile ölçülür (27. ders).
2. `durumDegistir()` her geçişte aynı temizliği yapar: şifre sayacı sıfırlanır, buzzer susar, mesaj yazılır. Böylece bir durumdan kalan artıklar diğerine taşınmaz.
3. `yeniBasis()` buton basışını **kenar** ve **debounce** ile bir kez bildirir (8. ders). `sifreTamam()` bu basışları sayar. İlk basıştan 3 saniye geçmişse sayaç yeniden başlar.
4. HAZIR durumunda `ihlalVar()` PIR'ın HIGH olmasına ya da reed'in HIGH olmasına (kapı açıldı) bakar. İkisinden biri yeter. Alarm başlayınca bir **mandal** gibi çalışır: PIR tekrar LOW olsa ve kapı kapansa bile ALARM, süre dolana ya da şifre girilene kadar sürer.
5. SUSTURULDU durumunda sensörlere hiç bakılmaz. Yani susturulmuş alarm yeni hareketle yeniden çalmaz; yalnız yavaş LED, olayın olduğunu hatırlatır. Sistemi yeniden kurmak için önce şifreyle DEVRE_DISI'ya, sonra yine butonla kurmak gerekir.
6. PIR hareketten sonra bir süre HIGH kalabilir (41. ders). Laboratuvardaki PIR bu süreyi 3 saniye tutar. Çıkış gecikmesinin bir amacı da PIR'ın sakinleşmesine zaman tanımaktır: **Hareket** kutusunu kurma butonuna bastıktan 3 saniye sonra kaldırırsan çıkış 6. saniyeye kadar HIGH kalır ve sistem HAZIR olur olmaz alarm çalar. Gerçek bir PIR modülünün tutma süresi modüle göre değişir; gerekirse `CIKIS_GECIKMESI` değerini uzat.

### Dene
- Kurma, ihlal, susturma ve şifre ile kapatma sırasını laboratuvarda dene: reed'in ve PIR'ın kutularını değiştirerek her durumun LED ve buzzer desenini izle.
- **Giriş gecikmesi ekle:** Kapı açılınca hemen alarm yerine 10 saniye şifre girme fırsatı ver. Bunun için yeni bir durum mu eklersin, yoksa bir bayrak mı?
- Alarm sırasında LED'i buzzer ile aynı ritimde yanıp söndür. Hangi fonksiyonu değiştirirsin?
- 42. dersteki IR engel sensörünü (D3) kullanmak istersen şifre butonunu hangi pine taşırsın? Standart bağlantılar tablosunda boş pin var mı?
- `SIFRE_BASIS` değerini 4 yap ve `SIFRE_PENCERESI`ni değiştir. Zor bir şifre ile kullanışlılık arasındaki dengeyi düşün.

### Sık yapılan hatalar
- Reed mantığını ters kurmak: kapı kapalıyken LOW (kontak kapalı), açıkken HIGH okunur. HAZIR durumunda `HIGH` ihlaldir.
- Kapıyı kapatmadan kurmak: kod bunu yakalar ve kurmayı reddeder. Bu kontrolü kaldırırsan sistem açık kapıyla HAZIR olur ve hemen çalar.
- PIR'ı çıkış gecikmesinden hemen sonra HIGH bulmak: çıkarken sensörün önünden geçtin. Sensörü kapının dışından değil, çıkış yolunun dışına yerleştir.
- Şifre sayacını durum değişince sıfırlamamak: bir önceki durumdaki basışlar yenisini bozar.
- `delay()` kullanmak: şifre basışları ve sensörler kaçırılır.

## Konuşalım
Bu alarmın zayıf noktaları neler? Biri PIR'ı kapatırsa, mıknatısı kapı çerçevesine yapıştırırsa ya da kabloları keserse ne olur? Gerçek bir alarm bu durumlara karşı ne yapardı?
