# IR engel sensörü ve eşik ayarı
süre: 20

## Merak
Bir fabrikada koli bandı üzerinden geçen kutuları kim sayıyor? Ya da otomatik sabun makinesi elini nereden anlıyor? Çoğunda aynı ucuz parça vardır: bir kızılötesi LED ve onun yansımasını bekleyen alıcı. Bu parçanın "ne kadar yakın" sorusuna verdiği cevap evet ya da hayırdır. Eşiği kim belirliyor?

## Etkinlik
### IR engel sensörü nedir?
IR engel (obstacle avoidance) modülü, kızılötesi ışık yollar ve yansıyan ışığı alıcıyla yakalar. Önünde bir cisim varsa ışık geri döner ve modül çıkışını değiştirir. 36. dersteki ultrasonik sensör mesafeyi **santimetre olarak** ölçüyordu; bu modül ise yalnız "engel var / yok" der.

Gerçek modülün üzerinde küçük bir ayar vidası (trimpot) vardır. Bu vida, **ne kadar yansımanın "engel" sayılacağını** belirler, yani eşiği donanımda ayarlar. Algılama mesafesi vidaya, ortama ve cismin rengine ve yüzeyine bağlıdır; açık renkli, mat yüzeyler genelde daha kolay algılanır, koyu ve parlak yüzeyler zor olabilir. Kesin değerler **modüle göre değişir**.

Laboratuvardaki IR engel parçasında mesafe yerine iki kaydırıcı vardır: **Yakınlık** (0-1, cismin ne kadar yansıma verdiği; büyüdükçe AO gerilimi artar) ve **Eşik (ayar vidası)** (0-1). Yakınlık eşiğe ulaşınca ya da geçince engel algılanır. Eşiği büyütmek, vidayı "daha az duyarlı" yapmaktır.

**Çıkış seviyesi:** Yaygın modüllerde engel varken çıkış LOW olur, yokken HIGH. Ama bu **modüle göre değişebilir**: bazı modüller tersini yapar. O yüzden kodda seviyeyi bir sabite koyacağız. Laboratuvardaki parça yaygın düzeni izler: engel varken OUT LOW, yokken HIGH.

### Devre
Parçaları laboratuvarda **Parça ekle** menüsünden seç, pinleri kablo çekerek bağla.

| Parça | Bağlantı |
|---|---|
| IR engel | VCC → 5V, GND → GND, OUT → **D3** |
| Direnç (330 Ω) | 1 → **D13**, 2 → LED A |
| LED | A → direncin 2 ucu, K → GND |
| (Analog program için) IR engel | AO → **A0** |

Çıkışı modül kendisi sürdüğü için `INPUT` kullanıyoruz.

### Program
```cpp
// sketch: ir_engel
const int IR = 3;
const int LED = 13;
const int ENGEL_SEVIYESI = LOW;   // modülüne göre HIGH olabilir

void setup() {
  pinMode(IR, INPUT);
  pinMode(LED, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  bool engel = (digitalRead(IR) == ENGEL_SEVIYESI);
  digitalWrite(LED, engel);
  Serial.println(engel ? "Engel var" : "Engel yok");
  delay(200);
}
```

Modülün çıkışı bazen kenarda anlık olarak oynar. Bir cismi **saymak** istiyorsak 8. dersteki fikri kullanırız: değişim ancak belli süre kararlı kalırsa kabul edilir. Ardından bir cismin geçişi tek sayım olur:

```cpp
// sketch: ir_sayac_kararli
const int IR = 3;
const int ENGEL_SEVIYESI = LOW;
const unsigned long KARARLI_MS = 30;

bool kararliEngel = false;      // kabul edilmiş durum
bool sonOkunan = false;         // en son okunan ham durum
unsigned long sonDegisim = 0;
int sayac = 0;

void setup() {
  pinMode(IR, INPUT);
  Serial.begin(9600);
}

void loop() {
  unsigned long simdi = millis();
  bool engel = (digitalRead(IR) == ENGEL_SEVIYESI);

  if (engel != sonOkunan) {          // ham okuma değişti: sayacı başa al
    sonOkunan = engel;
    sonDegisim = simdi;
  }

  if (sonOkunan != kararliEngel && simdi - sonDegisim >= KARARLI_MS) {
    kararliEngel = sonOkunan;        // yeterince kararlı: kabul et
    if (kararliEngel) {              // engel geldi: bir cisim say
      sayac++;
      Serial.print("Sayac: ");
      Serial.println(sayac);
    }
  }
}
```

Bazı modüllerde dijital çıkışa ek olarak **analog çıkış (AO)** da bulunur. O zaman eşiği yazılımda kendin seçersin. Hangi yönde değiştiği (engel varken değerin artması mı azalması mı) modüle göre değişir. Aşağıdaki örnekte "değer yüksek = engel yakın" varsayıldı; laboratuvardaki parça da böyle çalışır. Gerçek bir modülde `Serial.println(analogRead(A0))` ile bakıp ters ise koşulları çevirmek gerekir. İki ayrı eşik kullanıyoruz (**histerezis**, 35. dersteki termostat gibi): değer eşik civarında dalgalansa da çıktı titremez.

```cpp
// sketch: ir_analog_esik
const int AO = A0;
const int LED = 13;
const int ESIK_YUKSEK = 600;   // bunun üstünde engel var say
const int ESIK_ALCAK = 500;    // bunun altında engel yok say

bool engel = false;

void setup() {
  pinMode(LED, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  int deger = analogRead(AO);
  if (!engel && deger >= ESIK_YUKSEK) {
    engel = true;
    Serial.println("Engel var");
  } else if (engel && deger <= ESIK_ALCAK) {
    engel = false;
    Serial.println("Engel yok");
  }
  digitalWrite(LED, engel);
  delay(20);
}
```

### Nasıl çalışıyor?
1. `ir_engel`: `ENGEL_SEVIYESI` sabiti modülün "engel var" seviyesini söyler. Kodun geri kalanı bu sabite dayanır; modül tersse tek satırı değiştirirsin.
2. `ir_sayac_kararli`: ham okuma değiştiği anda sayaç sıfırlanır. Değişim 30 ms boyunca sürerse kabul edilir. Sayım yalnız "engel geldi" kenarında yapılır; yani uzun süre duran bir cisim tek sayılır.
3. `ir_analog_esik`: durum iki eşik arasında kalırsa önceki durum korunur. Böylece değer 550 civarında oynasa da çıktı değişmez.
4. Donanım vidası ile yazılım eşiği iki ayrı yerdir. Dijital çıkışta eşik vidada, analog çıkışta kodda ayarlanır.

### Dene
- `ir_engel` programını çalıştırırken IR engel parçasını seç ve **Yakınlık** kaydırıcısını 0'dan 1'e doğru yavaşça çek. LED ve seri monitör hangi değerde değişiyor? Bu değer **Eşik** değerine eşit mi?
- Yakınlığı 0,6 yap, sonra **Eşik (ayar vidası)** değerini 0,8'e çıkar. Engel yok sayılıyor mu? Parlak siyah bir yüzey de gerçekte böyle, az yansıma verdiği için eşiği geçemeyebilir.
- `ir_analog_esik` ile yakınlığı 0,3 - 0,5 - 0,7 yap. 0,5'te durum ne oluyor? Önce 0,7'den 0,5'e, sonra 0,3'ten 0,5'e git ve sonucu karşılaştır; bu histerezistir.
- `ir_sayac_kararli` içindeki `KARARLI_MS` değerini 0 yap. Laboratuvar modeli titreşim üretmediği için sayaç şaşmaz. Gerçek modülde şaşabilirdi; neden bu bekleme süresi gerçek devre için yine de gereklidir, kendi cümlenle yaz.

### Sık yapılan hatalar
- "Engel varken çıkış LOW olur" bilgisini her modül için doğru sanmak: gerçek modülün belgesine bak.
- Gerçek donanımda sensörü doğrudan güneş ışığına ya da güçlü lamba ışığına çevirmek: ortam ışığındaki kızılötesi ölçümü bozabilir (laboratuvar bunu modellemez).
- Analog eşikte tek eşik kullanmak: değer eşik civarında dalgalanınca çıktı sürekli değişir.
- Sayım yaparken kenar yerine seviyeyi saymak: duran cisim sürekli sayılır.
- Tek eşikle hem mesafeyi hem rengi çözmeyi beklemek: IR sensör cisim rengine ve yüzeyine duyarlıdır.

## Konuşalım
Koli bandında sayım yaparken iki kutu birbirine çok yakın geçerse sensör bunları tek kutu sayar. Bunu hangi yöntemlerle çözebilirsin: yazılımla mı, sensörün yerini değiştirerek mi?
