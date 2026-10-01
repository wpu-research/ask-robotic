# Çoklu LED, for döngüsü ve diziler
süre: 25

## Merak
Dört LED'i sırayla yakmak için aynı satırları dört kez yazmak gerekir. Peki 40 LED olsaydı? Programcılar aynı işi tekrar tekrar yazmak yerine kartın bunu kendisinin tekrar etmesini sağlar.

## Etkinlik
### Devre
| Parça | Bağlantı |
|---|---|
| LED 1 (kırmızı) | Anot → 330 Ω → **D13**; katot → GND |
| LED 2 (sarı) | Anot → 330 Ω → **D12**; katot → GND |
| LED 3 (yeşil) | Anot → 330 Ω → **D11**; katot → GND |
| LED 4 (mavi) | Anot → 330 Ω → **D10**; katot → GND |

Parçaları laboratuvarda **Parça ekle** menüsünden seç, pinleri kablo çekerek bağla. Her LED'in kendi direnci olur. Dört K ucunu Uno'nun GND pinlerinden birine bağlayabilirsin. LED'in rengini özellik panelinden seçersin.

### for döngüsü
`for` döngüsü bir işi belirli sayıda tekrar eder. Üç parçası vardır:

```
for (int i = 10; i <= 13; i++) {
  // i sırasıyla 10, 11, 12, 13 değerini alır
}
```

- `int i = 10`: sayaç 10'dan başlar.
- `i <= 13`: sayaç 13'e eşit ya da küçük olduğu sürece devam et.
- `i++`: her turdan sonra sayacı 1 artır.

Dört `pinMode` satırı yazmak yerine döngü kullanabilirsin:

```
for (int pin = 10; pin <= 13; pin++) {
  pinMode(pin, OUTPUT);
}
```

### Program 1: Sırayla yanan LED'ler
```cpp
// sketch: coklu_led
void setup() {
  for (int pin = 10; pin <= 13; pin++) {
    pinMode(pin, OUTPUT);
  }
}

void loop() {
  for (int pin = 10; pin <= 13; pin++) {
    digitalWrite(pin, HIGH);   // bu LED yansın
    delay(300);
    digitalWrite(pin, LOW);    // sonra sönsün
  }
}
```

### Dizi (array)
Bir dizi, aynı türden birçok değeri tek bir isim altında saklar. Elemanlar **0'dan** başlayarak numaralanır.

```
int ledler[] = {13, 12, 11, 10};
// ledler[0] = 13, ledler[1] = 12, ledler[2] = 11, ledler[3] = 10
```

Dizi sayesinde pin numaralarının sıralı olması gerekmez. LED'leri istediğin pine bağlarsın, sırayı dizide yazarsın.

### Program 2: Gidip gelen ışık
```cpp
// sketch: dizi_led
int ledler[] = {13, 12, 11, 10};

void setup() {
  for (int i = 0; i < 4; i++) {
    pinMode(ledler[i], OUTPUT);
  }
}

void loop() {
  // ileri: 13, 12, 11, 10
  for (int i = 0; i < 4; i++) {
    digitalWrite(ledler[i], HIGH);
    delay(200);
    digitalWrite(ledler[i], LOW);
  }
  // geri: 11, 12
  for (int i = 2; i >= 1; i--) {
    digitalWrite(ledler[i], HIGH);
    delay(200);
    digitalWrite(ledler[i], LOW);
  }
}
```

### Nasıl çalışıyor?
1. `setup()` içinde döngü, dört pini de çıkış yapar.
2. İleri döngüsünde `i` 0'dan 3'e gider. `ledler[i]` sırayla 13, 12, 11 ve 10 olur.
3. Geri döngüsünde `i--` sayacı bir azaltır; `i` 2'den 1'e iner. Böylece uçtaki LED'ler iki kez yanmaz ve ışık gidip gelir.
4. Her LED 200 ms yanar, sonra söner. Bir tam tur 6 × 200 = 1200 ms sürer.

### Dene
- `delay` değerlerini 50 ms yap ve yeniden ▶'e bas. Işık hâlâ ayrı ayrı görülebiliyor mu?
- `ledler` dizisine yeni bir pin ekle (ör. D9) ve döngü sınırlarını buna göre değiştir.
- Önce hepsini birlikte yakıp sonra hepsini birlikte söndüren bir program yaz.

### Sık yapılan hatalar
- Dizide `ledler[4]` yazmak: 4 elemanlı dizinin son elemanı `ledler[3]`'tür. Diziden taşmak beklenmedik davranışa yol açar.
- Döngü koşulunda `<` ile `<=` karıştırmak: bir eleman fazla ya da eksik işlenir.
- `for` satırının sonuna `;` koymak: döngü gövdesi çalışmaz.
- Dizinin elemanları 1'den başlıyor sanmak: ilk eleman `ledler[0]`'dır.

## Konuşalım
Dört LED yerine otuz LED olsaydı, döngü ve dizi kullanmak sana ne kazandırırdı? Dizi kullanmadan aynı programı yazmak ne kadar uzun olurdu?
