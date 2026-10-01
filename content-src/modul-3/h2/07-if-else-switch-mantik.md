# if/else, switch, mantık işleçleri
süre: 22

## Merak
Kapıda zil çalınca ne olur? Biri butona basarsa ışık yanar. Ama ya kimse yoksa? Ya iki kişi aynı anda basarsa? Kart karar vermeyi nasıl öğrenir? Bu derste programına "eğer ... ise ... değilse ..." diyebilmeyi öğreneceksin.

## Etkinlik
### Devre
Geçen dersteki devrenin aynısı; yalnız bir LED daha ekliyoruz.

| Parça | Bağlantı |
|---|---|
| Buton | Bir ucu **D2**, öbür ucu **GND** |
| Eğim anahtarı (buton gibi) | Bir ucu **D3**, öbür ucu **GND** |
| LED (kırmızı) + 330 Ω direnç | **D13** → direnç → LED anodu; katot GND |
| LED (sarı) + 330 Ω direnç | **D12** → direnç → LED anodu; katot GND |
| LED (yeşil) + 330 Ω direnç | **D11** → direnç → LED anodu; katot GND |

Devreyi simülatörde ya da kendi kartında kur.

### if ve else
`if` bir koşula bakar. Koşul doğruysa süslü parantez içindeki kodu çalıştırır. `else` ise koşul doğru değilse çalışır.

```cpp
// sketch: if_else
void setup() {
  pinMode(2, INPUT_PULLUP);
  pinMode(13, OUTPUT);
}

void loop() {
  if (digitalRead(2) == LOW) {   // buton basılı mı?
    digitalWrite(13, HIGH);
  } else {
    digitalWrite(13, LOW);
  }
}
```

Geçen dersteki `1 - durum` hilesinden çok daha okunaklı: "Eğer D2 LOW ise LED'i yak, değilse söndür".

Dikkat: karşılaştırma için **iki** eşittir (`==`) kullanılır. Tek `=` bir değer atar, karşılaştırmaz.

Birden fazla ihtimal varsa `else if` ekleyebilirsin:

```cpp
if (digitalRead(2) == LOW) {
  // buton basılı
} else if (digitalRead(3) == LOW) {
  // buton basılı değil ama eğim anahtarı kapalı
} else {
  // ikisi de açık
}
```

Zincir yukarıdan aşağı sırayla bakar ve ilk doğru olanı çalıştırır, gerisine bakmaz.

### Karşılaştırma işleçleri
| İşleç | Anlamı |
|---|---|
| `==` | eşit mi? |
| `!=` | eşit değil mi? |
| `<` `>` | küçük mü, büyük mü? |
| `<=` `>=` | küçük eşit mi, büyük eşit mi? |

### Mantık işleçleri
Birden fazla koşulu birleştirmek için:
| İşleç | Okunuşu | Doğru olur, eğer... |
|---|---|---|
| `&&` | ve | iki koşul da doğruysa |
| `\|\|` | veya | en az biri doğruysa |
| `!` | değil | koşul doğru DEĞİLSE |

Aşağıdaki programda üç LED üç farklı mantık gösteriyor:

```cpp
// sketch: mantik
void setup() {
  pinMode(2, INPUT_PULLUP);
  pinMode(3, INPUT_PULLUP);
  pinMode(13, OUTPUT);
  pinMode(12, OUTPUT);
  pinMode(11, OUTPUT);
}

void loop() {
  bool buton = (digitalRead(2) == LOW);   // true: buton basılı
  bool egim  = (digitalRead(3) == LOW);   // true: eğim anahtarı kapalı

  digitalWrite(13, buton && egim);        // kırmızı: ikisi birden
  digitalWrite(12, buton || egim);        // sarı: en az biri
  digitalWrite(11, !egim);                // yeşil: eğim anahtarı kapalı değil
}
```

`bool` iki değerli bir değişkendir: `true` (doğru) ya da `false` (yanlış). `digitalWrite`, `true`'yu HIGH, `false`'u LOW olarak anlar.

### switch
Bir sayıya göre birçok yola ayrılacaksan `switch` daha derli toplu olur. Aşağıda butonla eğim anahtarının durumunu tek bir sayıya çeviriyoruz: buton 1, eğim anahtarı 2 puan veriyor.

```cpp
// sketch: switch_durum
void setup() {
  pinMode(2, INPUT_PULLUP);
  pinMode(3, INPUT_PULLUP);
  pinMode(13, OUTPUT);
  pinMode(12, OUTPUT);
  pinMode(11, OUTPUT);
}

void loop() {
  int kod = 0;
  if (digitalRead(2) == LOW) {
    kod = kod + 1;
  }
  if (digitalRead(3) == LOW) {
    kod = kod + 2;
  }

  switch (kod) {
    case 1:                      // yalnız buton
      digitalWrite(13, HIGH);
      digitalWrite(12, LOW);
      digitalWrite(11, LOW);
      break;
    case 2:                      // yalnız eğim anahtarı
      digitalWrite(13, LOW);
      digitalWrite(12, HIGH);
      digitalWrite(11, LOW);
      break;
    case 3:                      // ikisi birden
      digitalWrite(13, LOW);
      digitalWrite(12, LOW);
      digitalWrite(11, HIGH);
      break;
    default:                     // hiçbiri (kod = 0)
      digitalWrite(13, LOW);
      digitalWrite(12, LOW);
      digitalWrite(11, LOW);
      break;
  }
}
```

### Nasıl çalışıyor?
1. `if` koşulu parantez içinde değerlendirilir; doğruysa `{ }` içi çalışır.
2. `buton && egim` yalnız iki taraf da doğruysa doğrudur; `buton || egim` en az biri doğruysa doğrudur.
3. `switch (kod)` kodun değerine bakar ve uyan `case` satırına atlar.
4. `break` switch'ten çıkar. Unutursan program bir sonraki `case`'e de akar.
5. `default`, hiçbir `case` uymazsa çalışır.

### Dene
- `mantik` programında sarı LED'in koşulunu `||` yerine `&&` yap. Sarı LED ile kırmızı LED arasında fark kalır mı?
- `switch_durum` programına `case 0:` ekleyip hiçbir şey basılı değilken yeşil LED'i yaktır.
- `switch_durum` programında `case 3:` için üç LED'in hepsini yak.
- `case 1:` ve `case 2:` satırlarındaki `break;` ifadelerini sil ve ne olduğunu gözle.

### Sık yapılan hatalar
- `if (x = 5)` yazmak: bu bir atamadır. Karşılaştırma için `==` kullan.
- `&&` yerine tek `&` yazmak: tek `&` başka bir işlemdir (bit işlemi), şimdilik kullanma.
- `if (...);` gibi parantezin ardına `;` koymak: `if` boş bir iş yapıp biter, süslü parantezin içi her zaman çalışır.
- `switch` içinde `break` unutmak: program sonraki `case`'in kodunu da çalıştırır.

## Konuşalım
Evinizdeki bir kapı ya da alarm düşünün. Hangi durumlarda "ve", hangilerinde "veya" mantığıyla çalışıyor olabilir? Örnek: asansör kapısı hem kapalı hem de bir düğmeye basılmışsa mı harekete geçer?
