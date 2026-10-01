# Fonksiyonlar, kapsam, parametreler
süre: 25

## Merak
Bir melodide aynı üç satırı (nota çal, bekle, sustur) onlarca kez yazarsan ne olur? Programın uzar, bir yerde hata yaparsan her kopyayı tek tek düzeltmen gerekir. Programcılar bu işi bir kez yazıp ona isim verir. Bugün kendi komutlarını yazacaksın.

## Etkinlik
### Devre
| Parça | Bağlantı |
|---|---|
| Pasif buzzer | Artı (+) bacak → **D8**; eksi bacak → GND |

Son sketch (kapsam) için devre gerekmez, Serial Monitor yeter.

### Fonksiyon nedir?
`setup()` ve `loop()` aslında birer fonksiyondur. Kendi fonksiyonunu da yazabilirsin:

```cpp
void bip() {
  // buraya komutlar yazılır
}
```
- `void`: fonksiyon bir değer **geri vermez**.
- `bip`: fonksiyonun adı. Açıklayıcı olsun.
- `()`: parantez içine **parametreler** yazılır (yoksa boş bırakılır).
- `{ }`: fonksiyonun gövdesi.

Fonksiyonu tanımlamak onu çalıştırmaz. Çalışması için adıyla **çağırman** gerekir: `bip();`

### Program 1: İlk fonksiyon
```cpp
// sketch: fonk_bip
void bip() {
  tone(8, 880, 100);
  delay(150);
}

void setup() {
}

void loop() {
  bip();
  bip();
  bip();
  delay(1000);
}
```

### Parametre ve geri dönüş değeri
Parametre, fonksiyona dışarıdan verdiğin bilgidir. `notaCal(440, 400)` dediğinde `440` frekansa, `400` süreye karşılık gelir. Bir fonksiyon sonuç da döndürebilir: `void` yerine dönüş tipini (`int` gibi) yazar, sonucu `return` ile verirsin.

### Program 2: Melodi çalan fonksiyon
"Küçük yıldız" melodisini çalıyoruz. Üç fonksiyon birlikte çalışıyor:
```cpp
// sketch: fonk_melodi
const int BUZZER = 8;           // const: değeri değişmeyen sabit
const int NOTA_SAYISI = 14;

int melodi[]  = {262, 262, 392, 392, 440, 440, 392,
                 349, 349, 330, 330, 294, 294, 262};
int uzunluk[] = {1, 1, 1, 1, 1, 1, 2,
                 1, 1, 1, 1, 1, 1, 2};      // kaç vuruş

int vurusSuresi(int bpm) {          // dakikadaki vuruştan ms hesapla
  return 60000 / bpm;
}

void notaCal(int frekans, int sure) {
  tone(BUZZER, frekans, sure * 9 / 10);   // sürenin %90'ı ses, %10'u ara
  delay(sure);
}

void melodiCal(int bpm) {
  int vurus = vurusSuresi(bpm);
  for (int i = 0; i < NOTA_SAYISI; i++) {
    notaCal(melodi[i], uzunluk[i] * vurus);
  }
}

void setup() {
}

void loop() {
  melodiCal(150);     // dakikada 150 vuruş: bir vuruş 400 ms
  delay(2000);
}
```

### Kapsam: değişken nerede yaşar?
Bir değişkenin görülebildiği yere **kapsam** denir.
- **Yerel** değişken bir fonksiyonun içinde tanımlanır; yalnız o fonksiyon görür ve her çağrıda baştan oluşturulur.
- **Global** değişken fonksiyonların dışında tanımlanır; bütün fonksiyonlar görür ve değeri çağrılar arasında korunur.

Parametreler fonksiyona **kopya** olarak gider: fonksiyon içinde parametreyi değiştirmek dışarıdaki değişkeni değiştirmez.

### Program 3: Kapsamı gör
```cpp
// sketch: fonk_kapsam
int toplam = 0;      // global: her yerden görünür
int sayi = 5;

void yerelDene() {
  int yerel = 0;     // her çağrıda yeniden oluşur
  yerel = yerel + 1;
  Serial.print("yerel: ");
  Serial.println(yerel);
}

void globalDene() {
  toplam = toplam + 1;   // değer korunur
  Serial.print("toplam: ");
  Serial.println(toplam);
}

void ikiyeKatla(int x) {
  x = x * 2;             // yalnız kopya değişir
  Serial.print("fonksiyonda x: ");
  Serial.println(x);
}

void setup() {
  Serial.begin(9600);
  ikiyeKatla(sayi);
  Serial.print("disarida sayi: ");
  Serial.println(sayi);
}

void loop() {
  yerelDene();
  globalDene();
  delay(500);
}
```

### Nasıl çalışıyor?
1. Program 1'de `bip()` üç kez çağrılır; kod bir kez yazılır, üç kez çalışır. Sesi değiştirmek için tek satırı değiştirmen yeter.
2. Program 2'de `melodiCal` her nota için `notaCal`'ı çağırır. `notaCal` frekans ve süre parametresi alır; `vurusSuresi` ise `return` ile bir sayı döndürür: `60000 / 150 = 400` ms.
3. `uzunluk[i] * vurus` hesabı, iki vuruşluk notayı 800 ms yapar.
4. Program 3'te `yerel` her seferinde 1 yazar, `toplam` ise 1, 2, 3 diye artar. `ikiyeKatla(sayi)` içinde `x` 10 olur, ama dışarıda `sayi` hâlâ 5'tir.

### Dene
- `melodiCal(100)` ve `melodiCal(200)` yaz. Tempo nasıl değişiyor?
- `melodi` ve `uzunluk` dizilerini değiştirerek kendi melodini yaz. `NOTA_SAYISI` değerini de güncelle.
- `void sessizlik(int sure)` adında, sadece `delay(sure)` yapan bir fonksiyon yaz ve melodinin sonuna ekle.

### Sık yapılan hatalar
- Fonksiyonu tanımlayıp çağırmamak: tanımlamak çalıştırmaz, `notaCal(440, 300);` yazmalısın.
- Fonksiyonun içini başka bir fonksiyonun içinde tanımlamak: fonksiyonlar `{ }` bloklarının dışında, yan yana yazılır.
- Yanlış sayıda parametre vermek: `notaCal(440)` derleyici hatası verir, çünkü iki parametre bekler.
- Yerel değişkeni başka fonksiyonda kullanmak: derleyici "was not declared in this scope" der. Değişkeni global yap ya da parametre olarak ilet.
- `return` yazmayı unutmak: `int` dönen bir fonksiyonda sonucu `return` ile vermelisin.

## Konuşalım
Büyük bir programı fonksiyonlara bölmek neden hata bulmayı kolaylaştırır? Her şeyi global değişken yapmak neden iyi bir fikir değildir?
