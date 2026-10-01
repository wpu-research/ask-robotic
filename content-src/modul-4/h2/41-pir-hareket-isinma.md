# PIR: hareket algılama ve ısınma süresi
süre: 20

## Merak
Mağaza girişinde kapıya yaklaşınca kendiliğinden açılan ışıkları, koridorda sen geçince yanan lambaları gördün. Ortada ne buton var ne kamera. Bu cihaz seni nasıl "fark ediyor"? Üstelik fişe takıldıktan hemen sonra bazen saçma sapan tepki veriyor. Neden?

## Etkinlik
### PIR nedir?
PIR (pasif kızılötesi) sensör, çevredeki **kızılötesi (ısı) ışınımının değişimini** algılar. Sıcak bir cisim (insan, hayvan) sensörün görüş alanında hareket edince ışınım değişir ve sensör çıkışını HIGH yapar. Duran bir cisim ya da yavaş yavaş değişen ortam sıcaklığı bu değişimi yaratmaz. "Pasif" demek, kendisi ışık göndermez, yalnız dinler demektir (36. dersteki ultrasonik sensör ise ses gönderip dönmesini bekliyordu).

PIR modülünün üç ucu vardır: VCC, OUT, GND. Besleme gerilimi modüle göre değişir; veri sayfasına bak. OUT ucu Arduino için basit bir dijital girişten ibarettir: hareket varken HIGH, yokken LOW.

Birçok modülde üzerinde iki ayar vidası ve bir atlama pimi bulunur. Vidalar genelde algılama hassasiyetini ve çıkışın HIGH kalma süresini ayarlar; atlama pimi ise hareket sürerken çıkışın uzamasını ("yeniden tetikleme") açıp kapatır. Hangi vidanın ne yaptığı ve değer aralıkları **modüle göre değişir**; kendi modülünün belgesine bak.

**Isınma süresi:** PIR açıldığında kendini çevreye alıştırmak için bir süre bekler. Bu sırada çıkışı gelişigüzel HIGH-LOW yapabilir. Gerçek modüllerde bu süre genelde yarım dakika ile bir dakika civarındadır, ama **modüle göre değişir**. Bu yüzden alarm gibi uygulamalarda açılıştan sonra bir süre PIR'ı yok sayarız.

### Devre
| Parça | Bağlantı |
|---|---|
| PIR modülü | VCC → 5 V (modülün belgesine bak), GND → GND, OUT → **D2** |
| LED + 330 Ω direnç | **D13** → direnç → LED anodu; katot → GND |

PIR'ın OUT ucu kendi gerilimini taşıdığı için `INPUT_PULLUP` kullanmıyoruz; düz `INPUT` yeter.

### Program
Önce ısınma, sonra kenar algılama (6. ve 8. derslerdeki "değişimi yakala" fikri aynen geçerli). Dersin sketch'inde ısınmayı 5 saniye tuttuk ki denemesi kolay olsun. Gerçek modül için bu süreyi uzatmak sana kalmış.

```cpp
// sketch: pir_isinma
const int PIR = 2;
const int LED = 13;
const unsigned long ISINMA_MS = 5000;   // gerçek modülde daha uzun tut

bool oncekiHareket = false;

void setup() {
  pinMode(PIR, INPUT);
  pinMode(LED, OUTPUT);
  Serial.begin(9600);
  Serial.println("Isiniyor...");
  while (millis() < ISINMA_MS) {              // ısınma bitene kadar PIR'ı yok say
    digitalWrite(LED, (millis() / 250) % 2);  // LED hızlı yanıp söner
  }
  digitalWrite(LED, LOW);
  Serial.println("Hazir");
}

void loop() {
  bool hareket = (digitalRead(PIR) == HIGH);
  if (hareket && !oncekiHareket) {
    Serial.println("Hareket var");
  }
  if (!hareket && oncekiHareket) {
    Serial.println("Hareket bitti");
  }
  oncekiHareket = hareket;
  digitalWrite(LED, hareket);
}
```

PIR hareketten sonra bir süre HIGH kalır. Bazen bu süre bizim için fazla kısa ya da uzundur. Bir odanın dolu mu boş mu olduğunu bilmek istiyorsak, "son hareketten sonra 3 saniye boyunca yeni hareket yok" koşulunu yazılımda kendimiz de kontrol edebiliriz. Bu, 27. dersteki `millis()` yöntemidir:

```cpp
// sketch: pir_oda_dolu
const int PIR = 2;
const int LED = 13;
const unsigned long BOS_SURE = 3000;   // ms: bu kadar sessizlikten sonra oda "boş"

bool odaDolu = false;
unsigned long sonHareket = 0;

void setup() {
  pinMode(PIR, INPUT);
  pinMode(LED, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  unsigned long simdi = millis();

  if (digitalRead(PIR) == HIGH) {
    sonHareket = simdi;                 // hareket sürdükçe sayacı yenile
    if (!odaDolu) {
      odaDolu = true;
      Serial.println("Oda dolu");
    }
  }

  if (odaDolu && simdi - sonHareket >= BOS_SURE) {
    odaDolu = false;
    Serial.println("Oda bos");
  }

  digitalWrite(LED, odaDolu);
}
```

### Nasıl çalışıyor?
1. `pir_isinma` içinde `setup()` ısınma bitene kadar dönmez. Bu sırada LED hızlı yanıp söner; kullanıcı "şimdi hareket etme" mesajını almış olur.
2. `loop()` içinde yalnız **kenarlar** yazdırılır: LOW'dan HIGH'a geçiş "Hareket var", HIGH'dan LOW'a geçiş "Hareket bitti". Aksi halde her turda mesaj basılırdı.
3. `pir_oda_dolu` sensör çıkışını doğrudan LED'e vermez. Hareket her görüldüğünde `sonHareket` yenilenir. Oda ancak `BOS_SURE` kadar hareket görülmezse "boş" olur. Sensör çıkışı kısa süre LOW'a düşse bile oda hemen boşalmış sayılmaz.
4. Süre karşılaştırmasında çıkarma kullanıldı (`simdi - sonHareket`). Nedenini 27. derste görmüştün.

### Dene
- `pir_isinma` ile ısınma sırasında önünden geç. Sonuç yazdırılıyor mu? Isınma bitince geç, şimdi ne oluyor?
- `BOS_SURE` değerini 1 saniye ve 10 saniye yap. Hangi değer bir odada oturan, az kıpırdayan birine daha uygun?
- Modülün üzerindeki ayar vidalarını (varsa) çevir ve çıkışın ne kadar HIGH kaldığını `Serial.println(millis())` ile ölç. Hareketin başladığı ve bittiği anların farkını hesapla.

### Sık yapılan hatalar
- Isınmayı beklememek: açılıştan hemen sonra gelen yalancı HIGH'lar alarm çaldırır.
- PIR'ı `INPUT_PULLUP` ile okumak ya da mantığı ters yazmak: PIR'da hareket varken çıkış HIGH'tır, butondaki gibi LOW değil.
- Her turda mesaj yazdırmak: kenar kontrolü olmadan Serial Monitor dolup taşar.
- Sensörü güneş alan pencereye, kalorifer ya da klima önüne yerleştirmek: ısı değişimleri hareket gibi görünebilir.
- Modülün besleme gerilimine bakmamak: PIR modülleri aynı değildir; belgesine bak.

## Konuşalım
Odasında hiç kıpırdamadan uyuyan biri PIR için "orada kimse yok" demek midir? PIR'ın göremediği başka hangi durumlar olabilir, bir alarm sistemi bunu nasıl telafi eder?
