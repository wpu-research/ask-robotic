# Proje: Kapı zili ve basış sayacı
süre: 35

## Merak
Kapı zilin çaldığında kaç kişi geldiğini bilmek ister misin? Bu projede basit ama akıllı bir kapı zili yapacaksın: her basışta zil çalar, kaç kez çaldığı sayılır ve Serial Monitor'a yazılır. Üstelik zili sessize alan ikinci bir butonun olacak: onu basılı tutarsan zil susar, ama sayaç saymaya devam eder. Bu haftanın her şeyi bu projede bir araya geliyor.

## Etkinlik
### Hedef
- D2'deki zil butonuna her basışta: LED yanar, zil (buzzer) çalar, sayaç bir artar ve `Zil: N` yazılır.
- Butonu basılı tutmak sayacı tekrar tekrar artırmaz (kenar algılama).
- Butonun sıçraması sayıyı bozmaz (debounce).
- D3'teki sessiz butonu basılıyken "sessiz mod": LED yanar, buzzer çalmaz. (İsteğe bağlı: etkinlik hedefi değil, bir ek özelliktir.)
- Seri porttan `S` gönderirsen sayacı yazar, `R` gönderirsen sayacı sıfırlar.

### Devre
Parçaları laboratuvarda **Parça ekle** menüsünden seç, pinleri kablo çekerek bağla.

| Parça | Bağlantı |
|---|---|
| Zil butonu | Bir ucu **D2**, öbür ucu **GND** |
| Sessiz butonu (isteğe bağlı) | Bir ucu **D3**, öbür ucu **GND** |
| LED (kırmızı) + 330 Ω direnç | **D13** → direnç → LED anodu; katot GND |
| Aktif buzzer | Artı (+) bacağı **D8**, eksi (-) bacağı **GND** |

Aktif buzzerin içinde kendi ses üreteci vardır: pine HIGH verince öter, LOW verince susar. Buzzer'ın uçları yönlüdür: **+** ucu D8'e, **-** ucu GND'ye gider. Parçayı seçince sağ panelden **Tür**'ü **Aktif** yap (varsayılan pasiftir). Pasif buzzer `digitalWrite` ile ses üretmez. Sesi duymak için üstteki ses düğmesini aç.

### Program
```cpp
// sketch: kapi_zili
int sayac = 0;          // kaç kez çalındı
int onceki = HIGH;      // butonun bir önceki durumu

void setup() {
  pinMode(2, INPUT_PULLUP);   // zil butonu
  pinMode(3, INPUT_PULLUP);   // eğim anahtarı
  pinMode(13, OUTPUT);        // LED
  pinMode(8, OUTPUT);         // buzzer
  Serial.begin(9600);
  Serial.println("Kapi zili hazir");
}

void loop() {
  // 1) Zil butonu: kenar algılama + debounce
  int simdi = digitalRead(2);
  if (simdi != onceki) {
    delay(20);                       // sıçrama bitsin
    simdi = digitalRead(2);
    if (simdi != onceki) {
      onceki = simdi;
      if (simdi == LOW) {            // basıldı
        sayac++;
        bool sessiz = (digitalRead(3) == LOW);   // eğim anahtarı kapalı mı?

        digitalWrite(13, HIGH);
        if (!sessiz) {
          digitalWrite(8, HIGH);
        }
        delay(300);                  // zil 300 ms çalsın
        digitalWrite(13, LOW);
        digitalWrite(8, LOW);

        Serial.print("Zil: ");
        Serial.println(sayac);
      }
    }
  }

  // 2) Seri komutlar
  if (Serial.available() > 0) {
    char komut = Serial.read();
    if (komut == 'S') {
      Serial.print("Toplam: ");
      Serial.println(sayac);
    } else if (komut == 'R') {
      sayac = 0;
      Serial.println("Sayac sifirlandi");
    }
  }
}
```

### Nasıl çalışıyor?
1. `sayac` ve `onceki` `loop()`'un dışında tanımlı. Böylece her turda sıfırlanmazlar, değerlerini korurlar.
2. Buton bölümü, 8. dersteki debounce'lu kenar algılamanın aynısıdır. Yalnızca `simdi == LOW` olan düşen kenarda zil çalar.
3. `sayac++`, `sayac = sayac + 1` ile aynı işi yapar.
4. `sessiz` bir `bool`'dur (D3'teki sessiz butonu basılıysa true; kodda yorum olarak "eğim anahtarı" yazar, laboratuvarda bu bir butondur). `!sessiz` "sessiz değilse" demektir; buzzer yalnız o zaman öter. LED her durumda yanar.
5. Seri bölümü, 9. dersteki komut okuma kalıbının aynısıdır.
6. `delay(300)` sırasında kart başka şeye bakmaz. Bu proje için sorun değil, çünkü zil zaten kısa sürüyor. Zil çalarken gelen bir seri komut tamponda bekler ve sonra okunur.

### Dene
- Zil süresini 100 ms ve 1000 ms yap. Hangisi daha doğal geliyor?
- Sayaç 10 olunca LED'i üç kez hızlı yaktır (ör. "10. ziyaretçi!") ve Serial Monitor'a bir mesaj yazdır.
- Sessiz butonunu ekle, basılı tutarken zil butonuna bas: sessiz modda sayaç artıyor mu? Seri monitörden `S` göndererek kontrol et.
- Zili iki "melodiye" ayır: tek basışta bir uzun, sayaç çiftse iki kısa öt. (İpucu: `sayac % 2 == 0`, `%` bölümden kalanı verir.)

### Sık yapılan hatalar
- `sayac`'ı `loop()` içinde tanımlamak: her turda 0'a döner, hiç artmaz.
- Buzzer'ın + ve - uçlarını ters bağlamak: ses çıkmaz.
- Buzzer türünü Pasif bırakmak: `digitalWrite` ile ses çıkmaz; ses tonu üretmek için başka bir yöntem gerekir (ilerleyen haftalarda).
- Debounce'u atlamak: sayaç bazen iki, bazen sıfır artar.
- `Serial.begin(9600)` yazmayı unutmak: seri monitörde hiçbir şey görünmez.

## Konuşalım
Bu zil sadece sayıyor. Ziyaretçi sayısına göre ne gibi akıllı özellikler eklenebilir? Mesela belirli saatlerde sessiz mod kendiliğinden devreye girse bunun için karta başka ne lazım olurdu?
