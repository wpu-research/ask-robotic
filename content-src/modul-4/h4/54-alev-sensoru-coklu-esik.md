# Alev sensörü ve çoklu eşik yönetimi
süre: 30

## Merak
Bir yangın alarmı "var" ya da "yok" demekle yetinmez. Önce küçük bir uyarı verir ("bir şey ısınıyor, bak"), durum kötüleşirse tehlike alarmına geçer, durum düzelince de önce tehlikeden uyarıya, sonra normale döner. Bu derste alev sensörünü tanıyacak, üç seviyeli (NORMAL, UYARI, TEHLIKE) bir karar mekanizması yazacak ve aynı kodu birden fazla sensörde tekrar kullanmayı öğreneceksin.

## Etkinlik
### Güvenlik
Bu derste **gerçek alev kullanma**. Alevi simülasyonda gerilimle taklit edeceğiz. Gerçek devrede deneme yapacaksan bunu yalnızca yetişkin gözetiminde, güvenli bir yerde ve küçük bir kaynakla yap.

### Devre
| Parça | Bağlantı |
|---|---|
| Alev sensörü modülü | VCC → 5 V, GND → GND, analog çıkış (AO) → **A1** |
| MQ-2 gaz sensörü modülü (son sketch için) | VCC → 5 V, GND → GND, AO → **A3** |
| Sarı LED (uyarı) + 330 Ω direnç | **D12** → direnç → LED anodu; katot → GND |
| Kırmızı LED (tehlike) + 330 Ω direnç | **D13** → direnç → LED anodu; katot → GND |
| Aktif buzzer | **D8** (+), diğer ucu GND |

A1 pinini bu hafta 51. derste LDR için kullandık; burada LDR'nin yerine alev sensörü bağlıdır. Alev sensörleri alevin yaydığı **kızılötesi (IR) ışığa** duyarlıdır. Birçok modülde güçlü bir IR kaynağı yaklaşınca analog değer **düşer**, ama bu modüle göre değişir; ters olabilir. Güneş ışığı ve bazı lambalar da IR yayar, bu yüzden yanlış alarm olabilir. Sensörün görüş açısı ve menzili sınırlıdır; kendi modülünün belgesine bak.

### Yön farkını tek yerde çöz
Modülün değeri alevde düşüyor ya da yükseliyor olabilir. Bu farkı programın her yerinde düşünmek yerine, ham okumayı **şiddet** adlı tek bir sayıya çevirirsin: şiddet ne kadar büyükse alev o kadar güçlüdür.

```cpp
const bool ALEVDE_DUSER = true;   // modülün alevde değer düşüyorsa true

int siddet(int ham) {
  return ALEVDE_DUSER ? 1023 - ham : ham;
}
```

Bundan sonraki bütün eşikler "şiddet" üzerinden yazılır. Modülün tersse yalnız bu satırı değiştirirsin.

### Çoklu eşik: seviye ve histerezis
Üç seviye (NORMAL, UYARI, TEHLIKE) için dört eşik gerekir:

| Geçiş | Eşik |
|---|---|
| NORMAL → UYARI | `uyariAc` |
| UYARI → NORMAL | `uyariKapat` (daha küçük) |
| UYARI → TEHLIKE | `tehlikeAc` |
| TEHLIKE → UYARI | `tehlikeKapat` (daha küçük) |

Her seviyenin açma ve kapama eşikleri farklıdır; böylece 51. dersteki histerezis iki yerde birden çalışır. Seviyeleri 28. dersteki gibi bir `enum` ile tutarız. Karar, **şimdiki seviyeye** ve **şimdiki değere** bağlıdır.

### Kod tekrarı
İki sensör (alev ve gaz) için aynı mantığı kopyalayıp yapıştırırsan program şu hale gelir:

```cpp
// alev için
if (alevSeviye == NORMAL && a >= 300) alevSeviye = UYARI;
else if (alevSeviye == UYARI && a < 250) alevSeviye = NORMAL;
// ... TEHLIKE için de aynısı ...

// gaz için aynı kodun kopyası, farklı sayılarla
if (gazSeviye == NORMAL && g >= 276) gazSeviye = UYARI;
else if (gazSeviye == UYARI && g < 230) gazSeviye = NORMAL;
// ... TEHLIKE için de aynısı ...
```

Bir hata bulursan bunu iki yerde (ileride üç, dört yerde) düzeltmen gerekir. Çözüm, ortak mantığı **bir fonksiyona** koymaktır (19. ders). Fonksiyon eşikleri parametre olarak alır, yeni seviyeyi döndürür.

### Program 1: alev seviyesi
```cpp
// sketch: alev_seviye
const int ALEV = A1;
const int LED_UYARI = 12;
const int LED_TEHLIKE = 13;
const int BUZZER = 8;
const bool ALEVDE_DUSER = true;

enum Seviye { NORMAL, UYARI, TEHLIKE };

Seviye seviye = NORMAL;

int siddet(int ham) {
  return ALEVDE_DUSER ? 1023 - ham : ham;
}

Seviye seviyeBul(Seviye simdiki, int deger,
                 int uyariAc, int uyariKapat,
                 int tehlikeAc, int tehlikeKapat) {
  if (simdiki == NORMAL) {
    if (deger >= tehlikeAc) return TEHLIKE;
    if (deger >= uyariAc) return UYARI;
    return NORMAL;
  }
  if (simdiki == UYARI) {
    if (deger >= tehlikeAc) return TEHLIKE;
    if (deger < uyariKapat) return NORMAL;
    return UYARI;
  }
  // simdiki == TEHLIKE
  if (deger < tehlikeKapat) {
    return (deger >= uyariKapat) ? UYARI : NORMAL;
  }
  return TEHLIKE;
}

const char* seviyeAdi(Seviye s) {
  if (s == UYARI) return "UYARI";
  if (s == TEHLIKE) return "TEHLIKE";
  return "NORMAL";
}

void setup() {
  pinMode(LED_UYARI, OUTPUT);
  pinMode(LED_TEHLIKE, OUTPUT);
  pinMode(BUZZER, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  int s = siddet(analogRead(ALEV));
  Seviye yeni = seviyeBul(seviye, s, 300, 250, 600, 500);

  if (yeni != seviye) {
    seviye = yeni;
    Serial.print("ALEV: ");
    Serial.print(seviyeAdi(seviye));
    Serial.print(" siddet=");
    Serial.println(s);
  }

  digitalWrite(LED_UYARI, seviye == UYARI);
  digitalWrite(LED_TEHLIKE, seviye == TEHLIKE);
  digitalWrite(BUZZER, seviye == TEHLIKE);
}
```

Fonksiyon `NORMAL`ken doğrudan `TEHLIKE`ye atlayabilir (alev birden gelirse). `TEHLIKE`den de doğrudan `NORMAL`e inebilir (alev birden giderse). Ara seviyeyi zorunlu bir basamak yapmadık.

### Program 2: iki sensör, tek fonksiyon
Şimdi aynı `seviyeBul` fonksiyonunu hem alev (A1) hem de gaz (A3) için kullanalım. Gazın eşikleri sabit sayı değil, 53. dersteki gibi **baz değere göre** hesaplanır: bazın 1,5 katı uyarı, 2,5 katı tehlike (kapamalar 1,25 ve 2 kat). Isınma bekleme kısmını burada kısa tuttuk; gerçek bir devrede 53. dersteki gibi uzun ısıtma yapılmalı.

```cpp
// sketch: iki_kanal_seviye
const int ALEV = A1;
const int GAZ = A3;
const int LED_UYARI = 12;
const int LED_TEHLIKE = 13;
const int BUZZER = 8;
const bool ALEVDE_DUSER = true;

enum Seviye { NORMAL, UYARI, TEHLIKE };

Seviye alevSeviye = NORMAL;
Seviye gazSeviye = NORMAL;
int gazBaz;

int siddet(int ham) {
  return ALEVDE_DUSER ? 1023 - ham : ham;
}

Seviye seviyeBul(Seviye simdiki, int deger,
                 int uyariAc, int uyariKapat,
                 int tehlikeAc, int tehlikeKapat) {
  if (simdiki == NORMAL) {
    if (deger >= tehlikeAc) return TEHLIKE;
    if (deger >= uyariAc) return UYARI;
    return NORMAL;
  }
  if (simdiki == UYARI) {
    if (deger >= tehlikeAc) return TEHLIKE;
    if (deger < uyariKapat) return NORMAL;
    return UYARI;
  }
  if (deger < tehlikeKapat) {
    return (deger >= uyariKapat) ? UYARI : NORMAL;
  }
  return TEHLIKE;
}

const char* seviyeAdi(Seviye s) {
  if (s == UYARI) return "UYARI";
  if (s == TEHLIKE) return "TEHLIKE";
  return "NORMAL";
}

Seviye enKotu(Seviye a, Seviye b) {
  return (a > b) ? a : b;
}

void gecisYaz(const char* ad, Seviye eski, Seviye yeni, int deger) {
  if (eski == yeni) return;
  Serial.print(ad);
  Serial.print(": ");
  Serial.print(seviyeAdi(yeni));
  Serial.print(" deger=");
  Serial.println(deger);
}

int bazOlc(int pin) {
  long toplam = 0;
  for (int i = 0; i < 16; i++) {
    toplam += analogRead(pin);
    delay(10);
  }
  return toplam / 16;
}

void setup() {
  pinMode(LED_UYARI, OUTPUT);
  pinMode(LED_TEHLIKE, OUTPUT);
  pinMode(BUZZER, OUTPUT);
  Serial.begin(9600);
  gazBaz = bazOlc(GAZ);
  Serial.print("gazBaz=");
  Serial.println(gazBaz);
}

void loop() {
  int a = siddet(analogRead(ALEV));
  int g = analogRead(GAZ);

  Seviye yeniAlev = seviyeBul(alevSeviye, a, 300, 250, 600, 500);
  Seviye yeniGaz = seviyeBul(gazSeviye, g,
                             gazBaz * 3 / 2, gazBaz * 5 / 4,
                             gazBaz * 5 / 2, gazBaz * 2);

  gecisYaz("ALEV", alevSeviye, yeniAlev, a);
  gecisYaz("GAZ", gazSeviye, yeniGaz, g);
  alevSeviye = yeniAlev;
  gazSeviye = yeniGaz;

  Seviye genel = enKotu(alevSeviye, gazSeviye);
  digitalWrite(LED_UYARI, genel == UYARI);
  digitalWrite(LED_TEHLIKE, genel == TEHLIKE);
  digitalWrite(BUZZER, genel == TEHLIKE);
}
```

`enum` değerleri sırayla 0, 1, 2 olduğu için `NORMAL < UYARI < TEHLIKE` karşılaştırması çalışır. `enKotu` iki seviyeden büyük olanı verir: sensörlerden biri tehlikedeyse sistem tehlikededir.

### Nasıl çalışıyor?
1. `siddet()` ham okumayı "büyük = alev güçlü" biçimine çevirir. Modülün yönü ne olursa olsun geri kalan kod değişmez.
2. `seviyeBul()` üç seviyeyi tek fonksiyonda toplar. İki sensör aynı fonksiyonu **farklı eşiklerle** çağırır.
3. `uyariKapat < uyariAc` ve `tehlikeKapat < tehlikeAc` olduğu için her geçişin bir histerezis bandı vardır. Değer eşiğin yanında oynasa bile seviye titremez.
4. `gecisYaz()` yalnız seviye değiştiğinde yazar. Seri monitör sürekli akmaz, olaylar okunur.
5. Çıkışlar (LED, buzzer) her turda seviyeden türetilir. Böylece çıkışlar ile seviye hiç ayrışmaz.

### Dene
- `uyariKapat` değerini `uyariAc` ile aynı yap. Değer eşiğin yanında oynarsa seviye titriyor mu?
- Üçüncü bir sensör ekle (örneğin A2'deki NTC için sıcaklığı tam sayı olarak ver). `seviyeBul` fonksiyonunu değiştirmeden çalışıyor mu?
- Alev sensörün değeri alevde yükseliyorsa hangi satırı değiştirirsin? Programın başka hiçbir yerine dokunman gerekiyor mu?

### Sık yapılan hatalar
- Kapama eşiğini açma eşiğinden büyük yazmak: seviye hiç düşmez ya da sürekli salınır.
- `ALEVDE_DUSER` değerini kontrol etmemek: alarm hep ya da hiç çalmaz.
- Aynı mantığı iki kez kopyalamak: bir yerde düzeltilen hata öbüründe kalır.
- `NORMAL`, `UYARI`, `TEHLIKE` yerine sayılar kullanmak (`0`, `1`, `2`): kod okunmaz.
- Güneş ışığına doğrudan bakan sensör: IR yanlış alarmı verebilir.

## Konuşalım
"UYARI" seviyesi neden var? Doğrudan NORMAL ve TEHLIKE olsa ne kaybederdik? Üç seviyeyi ne zaman fazla bulursun?
