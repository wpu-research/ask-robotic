# millis() ile bloklamayan kod
süre: 25

## Merak
Mutfaktaki zamanlayıcıyı düşün: yumurtayı kaynatırken başında durmazsın, zamanlayıcıyı kurar ve başka işler yaparsın. Arduino'da `millis()` işte bu saat gibidir: kart çalışmaya başladığından beri geçen milisaniyeyi söyler. Biz de saate arada bir bakıp "süre doldu mu?" diye sorarız.

## Etkinlik
### Devre
Parçaları laboratuvarda **Parça ekle** menüsünden seç, pinleri kablo çekerek bağla.

| Parça | Bağlantı |
|---|---|
| LED 1 + 330 Ω direnç | **D13** → direnç → LED **A**; **K** → GND |
| LED 2 + 330 Ω direnç | **D12** → direnç → LED **A**; **K** → GND |
| Buton | **A** ucu **D2**, **B** ucu GND (`INPUT_PULLUP`) |

### Program
Fikir: şimdiki zamanı oku, son değişimden bu yana geçen süreye bak. Yeterliyse LED'i değiştir ve "son değişim" zamanını yenile. Başka bir şey yapma, `loop()` hemen dönsün.

```cpp
// sketch: millis_blink_buton
const unsigned long ARALIK = 500;   // ms
unsigned long sonDegisim = 0;
bool ledYanik = false;
bool oncekiBasili = false;
int sayac = 0;

void setup() {
  pinMode(13, OUTPUT);
  pinMode(2, INPUT_PULLUP);
  Serial.begin(9600);
}

void loop() {
  unsigned long simdi = millis();

  if (simdi - sonDegisim >= ARALIK) {   // 500 ms geçti mi?
    sonDegisim = simdi;
    ledYanik = !ledYanik;
    digitalWrite(13, ledYanik);
  }

  bool basili = (digitalRead(2) == LOW);
  if (basili && !oncekiBasili) {        // yeni basış (kenar)
    sayac++;
    Serial.print("Basis sayisi: ");
    Serial.println(sayac);
  }
  oncekiBasili = basili;
}
```

Bu, önceki dersteki `delay`'li programla aynı işi yapar: LED yanıp söner ve butona bakar. Fark: `loop()` saniyede binlerce kez döner, butona hiç kaçırmadan bakar. Bir önceki derste kaçırdığın o kısa basış artık sayılır.

Aynı yöntemle iki ayrı işi, her birine kendi saatini vererek yürütebilirsin:

```cpp
// sketch: millis_iki_led
unsigned long son1 = 0;
unsigned long son2 = 0;

void setup() {
  pinMode(13, OUTPUT);
  pinMode(12, OUTPUT);
}

void loop() {
  unsigned long simdi = millis();

  if (simdi - son1 >= 1000) {          // LED 1: her 1000 ms
    son1 = simdi;
    digitalWrite(13, !digitalRead(13));
  }
  if (simdi - son2 >= 300) {           // LED 2: her 300 ms
    son2 = simdi;
    digitalWrite(12, !digitalRead(12));
  }
}
```

### Nasıl çalışıyor?
1. `millis()` program çalışmaya başlayınca 0'dan başlar ve her milisaniyede 1 artar.
2. Her iş için bir "son yaptığım zaman" değişkeni tutarsın (`sonDegisim`).
3. `simdi - sonDegisim >= aralik` ifadesi "aralık kadar süre geçti mi?" demektir.
4. `loop()` hiç beklemediği için her tur çok kısa sürer. Bu yüzden bütün işlere sırayla, sürekli bakılabilir.

### Taşma uyarısı
`millis()` değeri `unsigned long` türündedir (0 ile 4 294 967 295 arası). Yaklaşık 49,7 günde sınıra ulaşır ve **0'a döner**. Bir sistem haftalarca açık kalacaksa bu önemlidir. Süre değişkenlerini hep `unsigned long` yap ve süreyi **çıkararak** hesapla:

```cpp
// sketch: millis_tasma
void setup() {
  Serial.begin(9600);

  unsigned long onceki = 4294967000UL;   // taşmaya 296 ms var

  unsigned long simdi = 4294967100UL;    // 100 ms geçti
  Serial.print("Dogru (cikarma): ");
  Serial.println(simdi - onceki);        // 100
  Serial.print("Yanlis (toplama): ");
  Serial.println(simdi >= onceki + 500 ? "sure doldu" : "dolmadi");

  simdi = 10;                            // sayaç sıfırlandı, toplam 306 ms geçti
  Serial.print("Tasmadan sonra fark: ");
  Serial.println(simdi - onceki);        // 306
}

void loop() {
}
```

Çıkarma yöntemi taşmada bile doğru sonucu verir. `simdi >= onceki + 500` yazımı ise yanlıştır: `onceki + 500` taşıp küçük bir sayıya döner ve program süre dolmadan "doldu" der. Kural: **`simdi - onceki >= aralik`** yaz.

### Dene
- `millis_blink_buton` programında LED yanıp sönerken butona kısa kısa tıkla. Her basış sayılıyor mu? Önceki dersteki programla karşılaştır.
- `millis_iki_led` programına üçüncü bir LED ekle (D11, her 700 ms). Başka hiçbir şeyi bozmadan çalışıyor mu?
- Butona bastığında `Serial.println(millis())` yazdır. İki basış arasındaki farkı hesapla.

### Sık yapılan hatalar
- `unsigned long` yerine `int` kullanmak: `int` yaklaşık 32 saniyede (32 767 ms) taşar.
- Süreyi toplamayla kontrol etmek (`simdi >= onceki + aralik`): taşmada hata verir.
- `loop()` içine yine `delay` koymak: bütün kazanç kaybolur.
- Her işe aynı "son zaman" değişkenini vermek: işler birbirinin zamanını bozar. Her işe kendi değişkenini ver.

## Konuşalım
`delay` programları ile `millis` programları arasındaki en büyük fark nedir? `millis` kullanırken kodu yazmak neden biraz daha uzun?
