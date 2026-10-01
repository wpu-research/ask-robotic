# İlk program: Blink
süre: 20

## Merak
Her programın bir "merhaba dünya"sı vardır. Donanımda bu bir LED'i yakıp söndürmektir. Peki bir kart, bir LED'in ne zaman yanıp ne zaman sönmesi gerektiğini nereden bilir?

## Etkinlik
### Devre
| Parça | Bağlantı |
|---|---|
| LED (kırmızı) | Uzun bacak (anot) → direncin bir ucu; kısa bacak (katot) → GND |
| 330 Ω direnç | Bir ucu **D13**, öbür ucu LED anodu |

Arduino Uno'nun üzerindeki dahili LED de zaten D13'e bağlıdır; harici LED olmadan da program çalışır.

### Program
```cpp
// sketch: blink
void setup() {
  pinMode(13, OUTPUT);      // 13. pini çıkış yap
}

void loop() {
  digitalWrite(13, HIGH);   // LED yansın
  delay(1000);              // 1000 ms bekle
  digitalWrite(13, LOW);    // LED sönsün
  delay(1000);
}
```

### Nasıl çalışıyor?
1. `setup()` kart açılınca **bir kez** çalışır. Pinlerin yönünü burada belirlersin.
2. `loop()` bittiği anda **baştan başlar**, sonsuza kadar.
3. `HIGH` pine 5 V verir, `LOW` 0 V. LED, direnç üzerinden bu gerilimle yanar.
4. `delay(1000)` işlemciyi 1000 milisaniye (1 saniye) boyunca bekletir.

### Dene
- Bekleme süresini 200 ms yap. LED hâlâ yanıp sönüyor mu, yoksa sürekli yanık mı görünüyor?
- Yanık süresini 100 ms, sönük süresini 900 ms yap. Hangisi "nabız" gibi görünür?
- S.O.S: üç kısa, üç uzun, üç kısa yanıp sönme programı yaz.

### Sık yapılan hatalar
- `pinMode` yazmayı unutmak: pin çıkış olmaz, LED çok sönük yanar ya da hiç yanmaz.
- Her satırın sonundaki `;` işaretini unutmak: derleyici "expected ';'" der.
- LED'i ters bağlamak: LED yönlüdür, ters bağlanınca yanmaz.
- Direnç koymamak: LED ve pin zarar görebilir. Direnç akımı sınırlar.

## Konuşalım
`delay(1000)` çalışırken kart başka bir iş yapabilir mi? Bu program sırasında bir butona basılsa fark eder mi?
