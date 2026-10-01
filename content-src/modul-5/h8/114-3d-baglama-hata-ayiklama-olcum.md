# 3D robota bağlama, hata ayıklama, ölçüm
süre: 40

## Merak
Robotun çalışıyor ama yalnızca sen biliyorsun. Başkasının ekranında, bir 3D robotun, bir grafiğin ya da bir kayıt dosyasının robotunu görmesini istesen ne yaparsın? Robotun içinden dışarıya **sözleşmeli bir veri akışı** çıkarırsın: her satırın biçimi, alanları ve değer aralıkları baştan belli olur. Bu derste o akışı yapıp doğrulayacaksın; ardından aynı kayıtlarla robotun hatasını ölçeceksin.

## Etkinlik
### Dürüst bir not: 3D henüz yok
Şu an elimizde robotu 3 boyutlu gösteren bir görüntü **yok**. Bu derste 3D'ye bağlanan bir şey çalıştırmıyoruz. Yaptığımız şey, ileride bir 3D robotun besleneceği arayüzü kurmak: robot, durumunu seri hat üzerinden belirli bir biçimde yazar. İleride 3D robot bu arayüzden beslenecek; bugünkü işin, biçimi sağlam ve sınanmış bırakmak. Ders sonunda elinde: (1) kendi konumunu bilen bir robot, (2) biçimi doğrulanmış bir veri akışı, (3) o akıştan ortalama ve en büyük hatayı çıkaran bir yöntem olacak.

### Veri sözleşmesi: JSON satırları
Her 100 ms'de robot **tek satır** yazar. Satır bir JSON nesnesidir (JSON-lines: satır başına bir nesne). Sözleşme:

| Alan | Anlamı | Tür | Geçerli değer |
|---|---|---|---|
| `t` | Zaman damgası, `millis()` | tam sayı, ms | 0 veya büyük |
| `x` | Konum, ileri (odometri) | sayı, metre | -10 ile 10 arası |
| `y` | Konum, yan (odometri) | sayı, metre | -10 ile 10 arası |
| `th` | Yön | sayı, radyan | -π'den büyük, π'ye eşit ya da küçük |
| `d` | Önündeki mesafe | sayı, cm; ölçüm yoksa `null` | 2 ile 400 arası ya da `null` |

Alanların sırası ve adları sabittir: `t`, `x`, `y`, `th`, `d`. Örnek bir satır (simülatör çıktısı):

```text
{"t":100,"x":0.010,"y":0.000,"th":0.000,"d":242.8}
```

Anahtar fikir: biçimi bir kez kararlaştırırsın, hem robot hem alıcı o biçime güvenir. Alıcı bir 3D görüntü de olsa, bir grafik de olsa, bir kayıt dosyası da olsa.

### Devre
Standart Modül 5 bağlantıları; enkoderler odometri için kullanılır.

| Parça | Bağlantı |
|---|---|
| Sol motor | EN **D5** (PWM), IN1 **D7**, IN2 **D8** |
| Sağ motor | EN **D6** (PWM), IN3 **D9**, IN4 **D10** |
| Sol enkoder | **D2** (kesme pini) |
| Sağ enkoder | **D3** (kesme pini) |
| HC-SR04 | TRIG **D11**, ECHO **D12** |

Enkoderler D2 ve D3'ü kullandığı için bu derste tampon bağlama. Motor gücü harici kaynaktan gelir, GND ortaktır. Seri hat 115200 baud'dır; Serial Monitor'ü de 115200'e ayarla.

### Program
Bu sketch robotu önceden belirlenmiş bir yolda sürer (2 sn ileri, 0,6 sn sola dön, 2 sn ileri, dur) ve her 100 ms'de bir konum satırı yazar. Konumu enkoderlerden hesaplar (odometri, 94. ders).

```cpp
// sketch: telemetri
// Robot kendi konumunu (odometri) ve önündeki mesafeyi her 100 ms'de bir JSON satırı olarak seri porttan yazar.
// Satır biçimi: {"t":ms,"x":metre,"y":metre,"th":radyan,"d":cm}
const int SOL_EN = 5, SOL_IN1 = 7, SOL_IN2 = 8;
const int SAG_EN = 6, SAG_IN1 = 9, SAG_IN2 = 10;
const int ENK_SOL = 2, ENK_SAG = 3;
const int TRIG = 11, ECHO = 12;

const int OLU_BOLGE = 51;
const int TABAN = 150;
const float TEKERLEK_CEVRE_M = 0.2073;          // 2 * pi * 0,033 m
const int YUVA = 20;
const float TIK_M = TEKERLEK_CEVRE_M / YUVA;    // bir tık = yaklaşık 1,04 cm
const float AKS_M = 0.12;                       // tekerlekler arası
const unsigned long RAPOR_MS = 100;

volatile long tikSol = 0, tikSag = 0;           // işaretli: geri dönüşte azalır
volatile int solYon = 1, sagYon = 1;            // komut verilen yön (+1 ileri, -1 geri)
long oncekiSol = 0, oncekiSag = 0;
float x = 0, y = 0, th = 0;                     // odometri: metre, metre, radyan
unsigned long sonRapor = 0;

// Tek kanallı enkoder yönü bilmez: yönü, motora verdiğimiz komuttan biliriz.
void solTik() { tikSol += solYon; }
void sagTik() { tikSag += sagYon; }

void motor(int en, int in1, int in2, int hiz) {
  hiz = constrain(hiz, -255, 255);
  if (hiz == 0) { digitalWrite(in1, LOW); digitalWrite(in2, LOW); analogWrite(en, 0); return; }
  digitalWrite(in1, hiz > 0);
  digitalWrite(in2, hiz < 0);
  analogWrite(en, map(abs(hiz), 1, 255, OLU_BOLGE, 255));
}

void surus(int sol, int sag) {
  if (sol != 0) solYon = sol > 0 ? 1 : -1;
  if (sag != 0) sagYon = sag > 0 ? 1 : -1;
  motor(SOL_EN, SOL_IN1, SOL_IN2, sol);
  motor(SAG_EN, SAG_IN1, SAG_IN2, sag);
}

// Hareket planı: 2 sn ileri, 0,6 sn sola dön, 2 sn ileri, dur
void plan(unsigned long ms) {
  if (ms < 2000) surus(TABAN, TABAN);
  else if (ms < 2600) surus(-TABAN, TABAN);
  else if (ms < 4600) surus(TABAN, TABAN);
  else surus(0, 0);
}

float mesafeCm() {
  digitalWrite(TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG, LOW);
  unsigned long s = pulseIn(ECHO, HIGH, 25000);
  return s == 0 ? -1.0 : s / 58.0;               // -1 = yankı yok
}

void odometriGuncelle() {
  noInterrupts();
  long s = tikSol, g = tikSag;
  interrupts();
  float dSol = (s - oncekiSol) * TIK_M;
  float dSag = (g - oncekiSag) * TIK_M;
  oncekiSol = s;
  oncekiSag = g;
  float d = (dSol + dSag) / 2.0;
  th += (dSag - dSol) / AKS_M;
  while (th > PI) th -= 2 * PI;                  // (-pi, pi] aralığında tut
  while (th <= -PI) th += 2 * PI;
  x += d * cos(th);
  y += d * sin(th);
}

void satirYaz(unsigned long t, float cm) {
  Serial.print("{\"t\":");
  Serial.print(t);
  Serial.print(",\"x\":");
  Serial.print(x, 3);
  Serial.print(",\"y\":");
  Serial.print(y, 3);
  Serial.print(",\"th\":");
  Serial.print(th, 3);
  Serial.print(",\"d\":");
  if (cm < 0) Serial.print("null");              // geçerli ölçüm yok
  else Serial.print(cm, 1);
  Serial.println("}");
}

void setup() {
  pinMode(SOL_EN, OUTPUT); pinMode(SOL_IN1, OUTPUT); pinMode(SOL_IN2, OUTPUT);
  pinMode(SAG_EN, OUTPUT); pinMode(SAG_IN1, OUTPUT); pinMode(SAG_IN2, OUTPUT);
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  pinMode(ENK_SOL, INPUT_PULLUP);
  pinMode(ENK_SAG, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(ENK_SOL), solTik, RISING);
  attachInterrupt(digitalPinToInterrupt(ENK_SAG), sagTik, RISING);
  Serial.begin(115200);
}

void loop() {
  unsigned long simdi = millis();
  plan(simdi);
  if (simdi - sonRapor >= RAPOR_MS) {
    sonRapor += RAPOR_MS;
    odometriGuncelle();
    satirYaz(simdi, mesafeCm());
  }
}
```

### Nasıl çalışıyor?
1. Kesme servisleri (`solTik`, `sagTik`) her enkoder kenarında tık sayısını günceller (92. ders). Tek kanallı enkoder dönüş yönünü bilmediği için yönü **motora verdiğimiz komuttan** kaydederiz (`solYon`, `sagYon`); geri giderken tık sayısı azalır.
2. Her 100 ms'de `odometriGuncelle()` iki tekerleğin yolunu tık sayısından hesaplar. Ortalaması robotun ilerlemesi, farkı dönüş açısıdır: `Δθ = (sağ − sol) / aks`. Sonra `x` ve `y` yeni yönle güncellenir (94. ders).
3. `th` her zaman (-π, π] aralığına çekilir; sözleşme budur. Aksi hâlde robot birkaç tur dönünce `th` 7, 8 olur ve alıcı bunu anlamaz.
4. `d` ölçülemezse `-1` dönmez; JSON'da `null` yazılır. Alıcı `null`'ı "ölçüm yok" olarak ele alır; "400 cm" gibi sahte bir değer yazmak yanıltıcı olurdu.
5. `Serial.println` satır sonuna `\r\n` ekler. Python'un `json.loads` işlevi satır sonundaki boşluk ve `\r` karakterini sorun etmez.
6. Seri hat 115200 baud'dur. Bir satır yaklaşık 50 bayttır; 9600 baud'da bu satır hatta yaklaşık 52 ms yer tutar (100 ms'lik periyodun yarısı), 115200'de 5 ms'den azdır.

**Simülatörde ölçtüklerimiz:**
- 5,2 sn'de 51 satır geldi, hepsi sözleşmeye uydu: anahtarlar ve sırası, `t` her satırda 100 ± 5 ms artar, `th` aralığı, `d` aralığı.
- Odometri robotun gerçek konumuna 0,4 cm yaklaştı (robot başlangıçtan yaklaşık 38 cm uzaklaştı ve 130°'den fazla döndü). Bu doğruluk, simülatörde tekerleklerin kaymamasındandır; gerçek yerde zemin kayması, tekerlek çapı ve aks aralığındaki ölçü hatası odometriyi zamanla saptırır (95. ders).

### Doğrulayıcı: sözleşmeyi bir program denetlesin
Biçimi insan gözüyle denetlemek yetmez. Her satırı bir program okur ve kuralları sınar. Biz bunu `checks.mjs` içinde yazdık; senin bilgisayarında aynısını Python ile yazabilirsin:

```python
import json, math

def satir_sorunu(satir):
    try:
        o = json.loads(satir)
    except ValueError:
        return "JSON degil"
    if list(o.keys()) != ["t", "x", "y", "th", "d"]:
        return "anahtarlar t,x,y,th,d olmali"
    if not isinstance(o["t"], int) or o["t"] < 0:
        return "t pozitif tam sayi olmali"
    if abs(o["x"]) > 10 or abs(o["y"]) > 10:
        return "x ve y -10..10 m olmali"
    if not (-math.pi < o["th"] <= math.pi):
        return "th (-pi, pi] olmali"
    if o["d"] is not None and not (2 <= o["d"] <= 400):
        return "d null ya da 2..400 cm olmali"
    return None                         # sorun yok

for no, satir in enumerate(open("log.jsonl"), 1):
    sorun = satir_sorunu(satir)
    if sorun:
        print("satir", no, ":", sorun)
```

Bu kursta Python öğretilmiyor; bu bölüm isteğe bağlıdır. Kod her satırı JSON olarak okur (`json.loads`), anahtarları, türleri ve aralıkları kurallarla karşılaştırır ve ilk bozuk kuralın adını söyler. Python kullanmıyorsan aynı kuralları Serial Monitor'de gözle de denetleyebilirsin.

Bozuk bir satırı bilerek dene: `{"t":100,"x":0.1,"y":0.2,"th":4.0,"d":50}` satırında `th` π'den büyüktür ve doğrulayıcı bunu yakalar. Doğrulayıcının kendisini de sınamak önemlidir; biz `checks.mjs`'te hem iyi hem bozuk örneklerle sınadık.

### Hata ayıklama: ölçüm ve log analizi
Robotun bir şeyi yanlış yaptığını **hissetmek** yetmez; sayıya dökmek gerekir. Bir ölçüm hatası için iki sayı hesaplanır:

- **Ortalama mutlak hata:** her ölçümün gerçek değerden farkının mutlak değerlerinin ortalaması. İşaretin önemi yoktur: +3 ile -3 birbirini götürmez.
- **En büyük mutlak hata:** en kötü ölçümün hatası. Ortalama iyi olup tek bir ölçüm çok kötü olabilir; güvenlik açısından en kötü durum önemlidir.

İlk sketch, hatalarını sen yazarsın, o hesaplar:

```cpp
// sketch: hata_istatistik
// Ölçüm hatalarını seri porttan al, ortalama ve en büyük mutlak hatayı hesapla.
//   e <değer>  hata ekle (işaretli olabilir)    r  sonucu yaz    s  sıfırla
long adet = 0;
float toplam = 0;       // mutlak hataların toplamı
float enBuyuk = 0;

void setup() {
  Serial.begin(9600);
  Serial.setTimeout(50);
}

void loop() {
  if (Serial.available() == 0) return;
  char komut = Serial.read();
  if (komut == 'e') {
    float hata = fabs(Serial.parseFloat());    // yönü değil büyüklüğü say
    adet++;
    toplam += hata;
    if (hata > enBuyuk) enBuyuk = hata;
  } else if (komut == 'r') {
    Serial.print("n=");
    Serial.print(adet);
    Serial.print(" ort=");
    Serial.print(adet ? toplam / adet : 0.0, 2);
    Serial.print(" maks=");
    Serial.println(enBuyuk, 2);
  } else if (komut == 's') {
    adet = 0;
    toplam = 0;
    enBuyuk = 0;
  }
}
```

Elle bir örnek: hatalar 1,2; -3,1; 0,4; 2,0; -0,2 ise mutlak değerler 1,2; 3,1; 0,4; 2,0; 0,2 olur. Toplamları 6,9; beşe bölününce ortalama 1,38; en büyüğü 3,10. Sketch aynı sonucu `n=5 ort=1.38 maks=3.10` olarak yazar.

Peki gerçek bir log'dan nasıl? Ultrasonik sensörün kendi hatasını ölçelim. Robotu sabit tut (`plan(simdi);` satırını `surus(0, 0);` yap), duvardan cetvelle 50 cm uzağa koy, 10 sn log al ve Serial Monitor çıktısını `log.jsonl` dosyasına yapıştır. Sonra:

```python
import json

HEDEF_CM = 50.0                       # cetvelle ölçtüğün gerçek mesafe
hatalar = []
for satir in open("log.jsonl"):
    kayit = json.loads(satir)
    if kayit["d"] is None:            # geçerli ölçüm yok, atla
        continue
    hatalar.append(kayit["d"] - HEDEF_CM)

ort = sum(abs(h) for h in hatalar) / len(hatalar)
maks = max(abs(h) for h in hatalar)
print("satir sayisi :", len(hatalar))
print("ortalama hata: %.2f cm" % ort)
print("en buyuk hata: %.2f cm" % maks)
```

Simülatörde ölçümde 1 cm'lik sensör gürültüsüyle 101 satır için ortalama hata 0,73 cm, en büyük hata 2,20 cm çıktı. Yani bu sensörün tek bir okuması 50 cm'de yaklaşık ± 2 cm yanılabilir. Bu sayı, C yolundaki ± 3 cm'lik payın sensör gürültüsünden büyük olduğunu gösterir. Gerçek HC-SR04'ün hatası farklı olabilir; sayıyı kendi sensörün için ölç, veri sayfasına bak.

### Dene
- `telemetri` sketch'ini kendi robotunda çalıştır. Serial Monitor'ü 115200'e al. Biçim sözleşmeye uyuyor mu? Doğrulayıcıyla dene.
- Robotu cetvelle 1 m ilerlet, sonuçtaki `x` değerine bak. Odometri ne kadar sapıyor? Hata yüzde kaç?
- Plana bir kare çizdir: dört kez 2 sn ileri ve 0,5 sn dön. Başlangıç noktasına dönünce `x` ve `y` sıfıra yakın mı? Ne kadar sapma var ve en büyük hatası hangi köşede?
- Satıra beşinci bir alan eklemeyi düşün (örneğin `"durum"`). Alıcıların bundan nasıl etkilendiğini, sözleşmeyi neden sürümlemek gerektiğini düşün.

### Sık yapılan hatalar
- Ondalık ayracı olarak virgül kullanmak: JSON'da ondalık ayracı noktadır (`0.5`). `Serial.print` noktayla yazar, ama metni elle birleştirirken `0,5` yazarsan satır bozulur.
- `Serial.println` yerine `Serial.print` kullanıp satır sonunu unutmak: iki satır bitişir ve JSON bozulur.
- `d` yoksa `0` yazmak: 0 cm geçerli bir ölçüm gibi görünür ve yanıltır. `null` kullan.
- Baud hızını yanlış ayarlamak: ekranda anlamsız karakterler görürsün.
- `th` değerini sargılamamak: birkaç turdan sonra sözleşmenin dışına çıkar.
- Odometriye fazla güvenmek: kayma ve ölçü hatası zamanla birikir. Uzun yolda konum yanlış olur; 94. dersteki sapma burada da geçerli.
- Hata hesabında işareti saklamak ve ortalamayı işaretli almak: +3 ile -3 birbirini götürür, ortalama sıfır çıkar ama robot yanlıştır.

## Konuşalım
Veri biçimi bir sözleşmeyse, bir gün bu biçimi değiştirmen gerekirse (örneğin `d` yerine iki mesafe yazmak) bunu kullanan herkese nasıl duyurursun? Eski kayıtlar ne olur?
