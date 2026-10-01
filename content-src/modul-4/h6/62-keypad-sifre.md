# Keypad 4x4: şifre girişi
süre: 30

## Merak
Apartman kapısındaki tuş takımında 16 tuş var, ama kablo sayısı 16 değil. Arduino'nun 16 pini olsaydı bile bütün pinleri bir tuş takımına harcamak çok pahalı olurdu. Peki 16 tuşu yalnızca 8 telle nasıl okuruz? Üstelik doğru şifreyi girince bir şey açıp yanlış girince seni uyaran bir program yazmak için tuşların "basıldığı anı" doğru yakalaman gerek.

## Etkinlik
### Devre
Parçaları laboratuvarda **Parça ekle** menüsünden seç, pinleri kablo çekerek bağla.

| Parça | Bağlantı |
|---|---|
| Keypad 4x4 | Satırlar R1..R4 → **D9, D8, D7, D6**; sütunlar C1..C4 → **D5, D4, D3, D2** |
| LED (yeşil) | **D13** → direnç (330 Ω) 1; direnç 2 → LED **A**; LED **K** → **GND** |
| LED (kırmızı) | **D12** → direnç (330 Ω) 1; direnç 2 → LED **A**; LED **K** → **GND** |

Bu hafta D2-D9 pinlerinin hepsi tuş takımına gider. Önceki haftalarda butonlar için kullandığın D2, D3 ve servo için kullandığın D6 bu hafta boştur; haftanın projesinde bu yüzden servo başka bir pine taşınacak.

Laboratuvarda tuş takımını seçince sağ paneldeki **Basılı tuş** listesinden bir tuş seçersin: seçtiğin tuş basılı sayılır, **Yok** dersen bırakılmış olur. Tuş takımı aynı anda yalnız bir tuş basılı tutabilir. Gerçek bir membran tuş takımının 8 telli şeridinde hangi telin satır, hangisinin sütun olduğu üreticiye göre değişir; laboratuvardaki parçada pinler R1-R4 ve C1-C4 olarak yazılıdır.

### Matris nasıl okunur?
16 tuşu 16 telle okumak yerine tuşları 4 satır × 4 sütunluk bir ızgaraya dizeriz. Her tuş bir satır ile bir sütunu bastığında birleştirir. Okuma şöyle yapılır:

1. Satır pinleri giriştir ve `INPUT_PULLUP` ile HIGH'ta bekler.
2. Arduino sütunları sırayla LOW yapar (bir seferde yalnızca birini).
3. Basılı bir tuşun sütunu LOW olduğunda, o tuşun satırı da LOW okunur.
4. Hangi sütun LOW iken hangi satır LOW okunduysa, tuş o satır ile sütunun kesiştiği tuştur.

8 tel ile 4 × 4 = 16 tuş okunur. `Keypad` kütüphanesi bu taramayı ve sıçrama önlemeyi (debounce) senin yerine yapar. Gerçek tuş takımında aynı anda birden çok tuşa basılırsa matriste bazı tuşlar yanlış algılanabilir (diyotsuz matrislerin bilinen sınırı); şifre girişinde tuşlara tek tek basıldığı için sorun olmaz. Laboratuvarda zaten aynı anda tek tuş seçilebilir.

### Program 1: Tuşu oku
`Keypad` nesnesini kurarken tuşların harf haritasını, satır ve sütun pinlerini veririz. `makeKeymap` iki boyutlu diziyi kütüphanenin istediği biçime çevirir.

```cpp
// sketch: keypad_tus
#include <Keypad.h>

const byte SATIR = 4;
const byte SUTUN = 4;
char tuslar[SATIR][SUTUN] = {
  {'1', '2', '3', 'A'},
  {'4', '5', '6', 'B'},
  {'7', '8', '9', 'C'},
  {'*', '0', '#', 'D'}
};
byte satirPinleri[SATIR] = {9, 8, 7, 6};
byte sutunPinleri[SUTUN] = {5, 4, 3, 2};

Keypad tusTakimi = Keypad(makeKeymap(tuslar), satirPinleri, sutunPinleri, SATIR, SUTUN);

void setup() {
  Serial.begin(9600);
}

void loop() {
  char tus = tusTakimi.getKey();      // basılan tuş; basılmadıysa '\0'
  if (tus) {
    Serial.print("Tus: ");
    Serial.println(tus);
  }
}
```

`getKey()` her basışta **bir kez** o tuşu döndürür; tuşu basılı tutsan bile tekrar etmez (laboratuvarda bir tuşu listede seçili bırakmak, basılı tutmak demektir). Basış yoksa `0` (`'\0'`) döner, bu da `if (tus)` ile "yanlış" sayılır.

### Program 2: PIN girişi
Şimdi bir kapı kilidinin ilk yarısını yazalım: 4 haneli PIN. Kurallar:

- Rakam tuşları PIN'e eklenir (en fazla 4 hane).
- `*` son girilen rakamı siler.
- `#` girişi onaylar.
- Yanlış girişler sayılır; 3 yanlıştan sonra uyarı verilir.

Seri monitörde PIN'i açıkça göstermeyiz; her rakam için bir `*` yazarız.

```cpp
// sketch: keypad_sifre
#include <Keypad.h>

const byte SATIR = 4;
const byte SUTUN = 4;
char tuslar[SATIR][SUTUN] = {
  {'1', '2', '3', 'A'},
  {'4', '5', '6', 'B'},
  {'7', '8', '9', 'C'},
  {'*', '0', '#', 'D'}
};
byte satirPinleri[SATIR] = {9, 8, 7, 6};
byte sutunPinleri[SUTUN] = {5, 4, 3, 2};
Keypad tusTakimi = Keypad(makeKeymap(tuslar), satirPinleri, sutunPinleri, SATIR, SUTUN);

const int YESIL = 13;
const int KIRMIZI = 12;
const int PIN_UZUNLUK = 4;
const int AZAMI_YANLIS = 3;
const unsigned long LED_SURESI = 1000;   // ms

const char DOGRU_PIN[] = "1234";

char girilen[PIN_UZUNLUK + 1];           // +1: dizinin sonundaki '\0'
int hane = 0;
int yanlisSayisi = 0;
unsigned long ledBitis = 0;

void girisiTemizle() {
  hane = 0;
  girilen[0] = '\0';
}

void yildizYaz() {
  Serial.print("Girilen: ");
  for (int i = 0; i < hane; i++) Serial.print('*');
  Serial.println();
}

void onayla() {
  if (hane < PIN_UZUNLUK) {
    Serial.println("PIN 4 haneli olmali");
    return;
  }
  if (strcmp(girilen, DOGRU_PIN) == 0) {
    Serial.println("PIN dogru");
    yanlisSayisi = 0;
    digitalWrite(YESIL, HIGH);
  } else {
    yanlisSayisi++;
    Serial.print("PIN yanlis (");
    Serial.print(yanlisSayisi);
    Serial.print("/");
    Serial.print(AZAMI_YANLIS);
    Serial.println(")");
    digitalWrite(KIRMIZI, HIGH);
    if (yanlisSayisi >= AZAMI_YANLIS) {
      Serial.println("Cok fazla yanlis deneme");
      yanlisSayisi = 0;
    }
  }
  ledBitis = millis() + LED_SURESI;
  girisiTemizle();
}

void setup() {
  Serial.begin(9600);
  pinMode(YESIL, OUTPUT);
  pinMode(KIRMIZI, OUTPUT);
  girisiTemizle();
}

void loop() {
  char tus = tusTakimi.getKey();
  if (tus >= '0' && tus <= '9') {
    if (hane < PIN_UZUNLUK) {
      girilen[hane] = tus;
      hane++;
      girilen[hane] = '\0';
      yildizYaz();
    }
  } else if (tus == '*') {
    if (hane > 0) {
      hane--;
      girilen[hane] = '\0';
      yildizYaz();
    }
  } else if (tus == '#') {
    onayla();
  }

  if (ledBitis != 0 && (long)(millis() - ledBitis) >= 0) {   // LED süresi doldu
    digitalWrite(YESIL, LOW);
    digitalWrite(KIRMIZI, LOW);
    ledBitis = 0;
  }
}
```

### Nasıl çalışıyor?
1. `girilen`, 4 rakam ve sonda bir `'\0'` taşıyan karakter dizisidir. C'de bir yazı, sonu `'\0'` ile biten karakter dizisidir. `strcmp(a, b)` iki yazı eşitse `0` döndürür.
2. Rakam gelince dizinin `hane`. yerine yazılır, `hane` artar ve sona yeniden `'\0'` konur. `*` bunun tersini yapar: `hane` azalır, o yere `'\0'` yazılır.
3. `tus >= '0' && tus <= '9'` karşılaştırması karakter kodlarıyla çalışır; rakam karakterleri ardışık kodlara sahiptir.
4. `#` basıldığında önce uzunluk denetlenir. 4 haneden azsa deneme **sayılmaz**; kullanıcı yalnızca uyarı alır ve girdiği rakamlar silinmez, kaldığı yerden devam edebilir.
5. Yanlış girişte `yanlisSayisi` bir artar. 3'e ulaşınca uyarı yazılır ve sayaç sıfırlanır. Gerçek bir kilitte burada kilit süresi başlatırsın; proje dersinde yapacağız.
6. LED'in ne zaman söneceği `millis()` ile hesaplanır, `delay` kullanılmaz (27. ders); böylece LED yanarken de tuşlar okunur. `(long)(millis() - ledBitis) >= 0` ifadesi, `millis()` taşsa bile doğru çalışan karşılaştırmadır.
7. `A`, `B`, `C`, `D` tuşları bu programda hiçbir şey yapmaz. İleride menü tuşu olarak kullanabilirsin.

### Dene
- PIN'i 6 haneli yap: `PIN_UZUNLUK` değerini 6 yap ve `DOGRU_PIN` için 6 rakamlı yeni bir yazı seç.
- `D` tuşuna basınca girişi tümden silen bir özellik ekle.
- `AZAMI_YANLIS` değerini 5 yap. Başka bir yeri değiştirmen gerekti mi?

### Sık yapılan hatalar
- Satır ve sütun pinlerini sketch'te ya da kablolarda ters yazmak: tuşlar algılanmaz ya da yanlış harf verir. Her tuşu sırayla seçip seri monitörde ne yazdığına bak.
- `getKey()` döndürdüğü değeri kontrol etmeden kullanmak. Basış yoksa `'\0'` döner.
- `girilen` dizisine yer ayırırken sondaki `'\0'` için +1 bırakmamak.
- PIN'i `==` ile karşılaştırmak. Karakter dizilerinde `==` adresleri karşılaştırır; içerik için `strcmp` kullan.
- `delay()` ile LED'i tutmak: bu sırada basılan tuşlar kaçırılabilir.

## Konuşalım
PIN'i program kodunun içine yazmak güvenli mi? Programın kodunu okuyabilen biri olsaydı ne olurdu? Bir sonraki derslerde PIN'i neden başka bir yerde tutmak isteyeceğiz?
