# Döner enkoder (quadrature) ve kesme
süre: 25

## Merak
Eski bir radyonun ses düğmesi sınırsız döner; ucu yoktur. Potansiyometrenin ise başı ve sonu vardır. Peki radyo, düğmenin hangi yöne ve kaç adım döndüğünü nasıl bilir? Cevap, birbirine "90 derece" kaymış iki sinyalde saklı.

## Etkinlik
### Devre
| Parça | Bağlantı |
|---|---|
| Döner enkoder CLK (A) | **D2** (`INPUT_PULLUP`, kesme pini) |
| Döner enkoder DT (B) | **D3** (`INPUT_PULLUP`) |
| Döner enkoder SW (düğme) | **D4** (`INPUT_PULLUP`) |
| Döner enkoder + (varsa) | 5 V |
| Döner enkoder GND | GND |

KY-040 gibi modüllerde pull-up direnci zaten bulunur; yine de `INPUT_PULLUP` kullanmak zarar vermez. Bu derste D2 pinini CLK için kullanıyoruz (56. dersteki joystick düğmesi bu hafta başka bir devrede; devreyi her derste yeniden kur).

### Quadrature nedir?
Enkoderin içinde iki kontak vardır. Düğme dönerken bu kontaklar birer birer kapanıp açılır, ama **aynı anda değil**: biri ötekinden biraz önce değişir. Bu yüzden CLK ve DT'nin çıktıları arasında çeyrek dönem (90°) fark oluşur.

Bir "tık" boyunca iki pin şu sırayla değişir (1 = HIGH, 0 = LOW, yazılışı CLK, DT):

| Yön | Durum sırası |
|---|---|
| Bir yön (burada "saat yönü" diyeceğiz) | 11 → 01 → 00 → 10 → 11 |
| Ters yön | 11 → 10 → 00 → 01 → 11 |

Bu iki sıraya bak. CLK'nın **düştüğü** an (1'den 0'a): saat yönünde DT o sırada hâlâ 1'dir (11 → 01), ters yönde DT çoktan 0 olmuştur (10 → 00). Demek ki yönü bulmak için tek bir kural yeter:

> CLK düşerken DT'ye bak. DT = 1 ise bir yöne, DT = 0 ise öbür yöne gidiyoruz.

Modüllerde hangi yönün "saat yönü" olduğu üreticiye göre ters çıkabilir. Çıkarsa `sayac++` ile `sayac--` yerlerini değiştir.

### Program 1: En basit sürüm
CLK'daki her düşüşte bir kesme (29. ders) çalıştırıp DT'yi okuyoruz.

```cpp
// sketch: enkoder_basit
const int CLK = 2;
const int DT = 3;

volatile int sayac = 0;

void adim() {                          // kesme servis rutini (ISR)
  if (digitalRead(DT) == HIGH) {
    sayac++;
  } else {
    sayac--;
  }
}

void setup() {
  Serial.begin(9600);
  pinMode(CLK, INPUT_PULLUP);
  pinMode(DT, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(CLK), adim, FALLING);
}

void loop() {
  static int onceki = 0;

  noInterrupts();                      // 29. ders: okurken kesme araya girmesin
  int kopya = sayac;
  interrupts();

  if (kopya != onceki) {
    onceki = kopya;
    Serial.print("Sayac: ");
    Serial.println(kopya);
  }
}
```
Düğmeyi çevir: bir yönde sayı artar, öbür yönde azalır. Gerçek enkoderde bir adımın birkaç sayı birden atladığını görebilirsin. Bunun sebebi bir sonraki bölümde.

### Bounce: kontaklar titrer
Kontaklar mekaniktir. Kapanırken bir anda temas etmez, çok kısa bir süre (modüle göre bir milisaniyeden azdan birkaç milisaniyeye kadar) açılıp kapanır. 8. derste butonun sıçramasını görmüştün; aynısı burada da var. Kesme ise çok hızlıdır: her sıçramayı ayrı bir kenar sayar. CLK tek bir tık için `1 → 0 → 1 → 0 → 1 → 0` diye titrerse `adim()` üç kez çalışır ve sayaç 3 artar.

Çözüm: iki kenar arasında en az belli bir süre geçmediyse kenarı yok say. Süre milisaniye değil **mikrosaniye** ölçeğindedir, bu yüzden `micros()` kullanırız.

### Program 2: Bounce filtreli sayaç ve düğmeyle sıfırlama
```cpp
// sketch: enkoder_filtreli
const int CLK = 2;
const int DT = 3;
const int SW = 4;
const unsigned long ARALIK_US = 2000;   // iki kenar arası en az 2 ms

volatile int sayac = 0;
volatile unsigned long sonKenar = 0;

void adim() {
  unsigned long simdi = micros();
  if (simdi - sonKenar < ARALIK_US) return;   // sıçrama: yok say
  sonKenar = simdi;
  if (digitalRead(DT) == HIGH) {
    sayac++;
  } else {
    sayac--;
  }
}

void setup() {
  Serial.begin(9600);
  pinMode(CLK, INPUT_PULLUP);
  pinMode(DT, INPUT_PULLUP);
  pinMode(SW, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(CLK), adim, FALLING);
}

void loop() {
  static int onceki = 0;
  static bool oncekiBasili = false;

  // Düğme: basıldığı an sayacı sıfırla
  bool basili = (digitalRead(SW) == LOW);
  if (basili && !oncekiBasili) {
    noInterrupts();
    sayac = 0;
    interrupts();
  }
  oncekiBasili = basili;

  noInterrupts();
  int kopya = sayac;
  interrupts();

  if (kopya != onceki) {
    onceki = kopya;
    Serial.print("Sayac: ");
    Serial.println(kopya);
  }
}
```

### Nasıl çalışıyor?
1. `attachInterrupt(..., FALLING)` CLK her 1'den 0'a düştüğünde `adim()` fonksiyonunu çalıştırır. D2 bir kesme pinidir (29. ders), bu yüzden CLK'yı D2'ye bağladık.
2. `adim()` içinde DT okunur: HIGH ise `sayac++`, LOW ise `sayac--`. Yön işte bu kadar basit bulunur.
3. `sayac` ve `sonKenar` kesme ile `loop()` arasında paylaşıldığı için `volatile` tanımlıdır. `loop()` bu değerleri okurken kesmeyi kısa süre kapatır.
4. Program 2'de `micros()` ile son kabul edilen kenar zamanı saklanır. 2 ms'den kısa sürede gelen yeni kenarlar sıçrama sayılır ve atlanır. Eşik, el ile en hızlı çevirdiğinde bile tıklar arasındaki süreden küçük olmalıdır; 2 ms çoğu modül için makul bir başlangıçtır, ama kendi modülünde dene.
5. SW düğmesi yavaş bir olaydır, kesme gerektirmez. `loop()` içinde kenar algılamayla (8. ders) bakmak yeter.

### Dene
- `ARALIK_US` değerini 0 yap (filtreyi kapat). Düğmeyi yavaşça bir tık çevir. Sayaç kaç artıyor?
- `ARALIK_US` değerini 50 000 (50 ms) yap ve düğmeyi hızlı çevir. Ne oluyor? Eşiği çok büyütmek neden kötü?
- Sayacı 0-20 arasında tut (`constrain`) ve değere göre D13'teki LED'in parlaklığını `analogWrite` ile değiştir. Böylece sonsuz dönen düğmeden ses düğmesi yaparsın.

### Sık yapılan hatalar
- CLK'yı kesme pini olmayan bir pine (D2 ya da D3 dışına) bağlamak: `attachInterrupt` çalışmaz.
- `sayac` değişkenini `volatile` yapmamak: derleyici değeri saklar, `loop()` değişimi görmez.
- ISR içinde `Serial.print` ya da `delay` kullanmak: ISR çok kısa olmalıdır. Yazdırmayı `loop()` yapar.
- Bounce filtresi koymamak: yavaş çevirmede bile sayaç beklenenden fazla atlar.
- Eşiği gereğinden büyük seçmek: hızlı çevirince gerçek adımlar da atılır.
- CLK ve DT'yi karıştırmak: yön ters çıkar. Kodda `++` ile `--` yer değiştirir ya da tellerini değiştirirsin; ikisi de aynı sonucu verir.

## Konuşalım
Fare tekerleği, yazıcı kafası, robot tekerleği... Hepsinde enkoder var. Tek bir kontak (yalnızca CLK) yönü bulmak için neden yetmez? Çok hızlı dönen bir motorun enkoderini `loop()` içinde okumak yerine kesmeyle okumanın avantajı nedir?
