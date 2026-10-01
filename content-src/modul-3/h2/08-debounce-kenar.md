# Debounce ve kenar algılama
süre: 25

## Merak
Bir butona bir kez bastın ama kart iki, üç kez bastığını sandı. Ya da hiç basmadın sandı. Program hatasız, devre doğru. Peki neden? Cevap butonun içinde: metal temaslar çarpıp zıplar. Bu derste bu "sıçramayı" nasıl yakalayacağını öğreneceksin.

## Etkinlik
### Devre
| Parça | Bağlantı |
|---|---|
| Buton | Bir ucu **D2**, öbür ucu **GND** |
| LED (kırmızı) + 330 Ω direnç | **D13** → direnç → LED anodu; katot GND |

Eğim anahtarını (D3) da aynı mantıkla kullanabilirsin. İçindeki top sallanırken temas kısa süre açılıp kapanır, yani o da sıçrar.

Devreyi simülatörde ya da kendi kartında kur.

### Sıçrama (bounce) nedir?
Bir buton kapanırken iki metal parça birbirine çarpar. Parçalar yaylanır; temas birkaç milisaniye boyunca açılıp kapanır. Gözümüz bunu göremez ama kart saniyede binlerce kez okuma yaptığı için görür. Gerçekte basış şöyle görünür (soldan sağa zamanla):

| | Pindeki değerler |
|---|---|
| Beklenen | HIGH, HIGH, HIGH, **LOW**, LOW, LOW, LOW |
| Gerçek | HIGH, HIGH, **LOW, HIGH, LOW, HIGH**, LOW, LOW, LOW |


Yani tek bir basış, pinde `HIGH, LOW, HIGH, LOW, ...` gibi kısa bir dizi üretir. Butonun bırakılırken de aynı şey olur. Bu sıçrama genellikle birkaç milisaniye sürer; buton kalitesine göre değişir.

### Kenar (edge) nedir?
Buton bir durumdan öbürüne geçerken **kenar** oluşur:
- HIGH'dan LOW'a geçiş: **düşen kenar** (basıldı).
- LOW'dan HIGH'a geçiş: **yükselen kenar** (bırakıldı).

"Buton basılı mı?" sorusu bir **seviyedir**. "Buton şimdi mi basıldı?" sorusu bir **kenardır**. Sayaç ya da aç-kapa anahtarı yapacaksan kenar lazım: basılı tuttuğun sürece bir kez sayılmalı.

Kenarı yakalamak için önceki durumu bir değişkende saklayıp şimdikiyle karşılaştırırız.

### Sorunlu program: debounce yok
LED butona her basışta tersine dönsün (yanıksa sönsün, sönükse yansın):

```cpp
// sketch: sicrama_var
int onceki = HIGH;
int ledDurum = LOW;

void setup() {
  pinMode(2, INPUT_PULLUP);
  pinMode(13, OUTPUT);
}

void loop() {
  int simdi = digitalRead(2);

  if (onceki == HIGH && simdi == LOW) {   // düşen kenar: basıldı
    ledDurum = 1 - ledDurum;              // LED'in durumunu ters çevir
    digitalWrite(13, ledDurum);
  }
  onceki = simdi;
}
```

Mantık doğru görünüyor. Ama sıçrama yüzünden bir basış bazen iki düşen kenar üretir. LED iki kez ters döner ve sanki hiç basılmamış gibi eski durumunda kalır. Bazen de üç kenar olur ve her şey yolunda gözükür. Sonuç tahmin edilemez.

### Çözüm: debounce
Debounce (sıçrama giderme), "değişimi gördüm ama bir süre bekleyip tekrar bakayım, gerçekten değişmiş mi?" demektir. En basit yol `delay` ile beklemektir.

```cpp
// sketch: debounce_ms
int onceki = HIGH;
int ledDurum = LOW;

void setup() {
  pinMode(2, INPUT_PULLUP);
  pinMode(13, OUTPUT);
}

void loop() {
  int simdi = digitalRead(2);

  if (simdi != onceki) {            // bir değişiklik var gibi
    delay(20);                      // sıçrama bitsin diye 20 ms bekle
    simdi = digitalRead(2);         // sakinleşmiş değeri tekrar oku
    if (simdi != onceki) {          // değişiklik gerçekmiş
      if (simdi == LOW) {           // düşen kenar: basıldı
        ledDurum = 1 - ledDurum;
        digitalWrite(13, ledDurum);
      }
      onceki = simdi;
    }
  }
}
```

### Nasıl çalışıyor?
1. `onceki`, butonun bir önceki turdaki değerini tutar. `simdi` bu turdaki değerdir.
2. İkisi farklıysa bir kenar var demektir. Ama bu sıçrama olabilir.
3. 20 ms bekleyince sıçrama biter. Pini tekrar okuyup hâlâ `onceki`'nden farklıysa değişim gerçektir.
4. Yalnız `LOW`'a geçişte (basış) LED'in durumunu ters çeviririz. Bırakma kenarında hiçbir şey yapmayız.
5. Butonu basılı tutsan bile `simdi == onceki` olduğu için tekrar tekrar sayılmaz: bir basış, bir işlem.
6. Bırakırken oluşan sıçrama da aynı kontrolden geçer.

20 ms çoğu buton için yeterlidir. Daha yaylı bir buton kullanıyorsan 30-50 ms'ye çıkarabilirsin. Çok uzun yaparsan hızlı basışları kaçırırsın.

### Dene
- `delay(20)` satırını sil ve sicrama_var gibi davranıp davranmadığını gözle. Gerçek bir buton kullanıyorsan yirmi kez bas ve LED'in kaç kez beklediğin gibi tepki verdiğini say.
- Debounce süresini 1 ms yap, sonra 200 ms yap. İkisinde ne bozuluyor?
- Programı "bırakıldığında" ters çevirecek şekilde değiştir (yükselen kenar).

### Sık yapılan hatalar
- `onceki = simdi;` satırını unutmak: kart hep aynı kenarı görür.
- Kenar yerine seviye kullanmak (`if (digitalRead(2) == LOW)` içinde LED'i ters çevirmek): basılı tuttuğun sürece LED çılgın gibi yanıp söner.
- Debounce'u bırakırken unutmak: basarken düzgün, bırakırken sahte basış alırsın.
- Çok uzun bir `delay`: bu sürede kart başka bir şeye bakamaz. Bu yüzden süreyi gerektiği kadar kısa tut.

## Konuşalım
Asansör düğmesine bastığında düğme bir kez yanar, art arda iki üç kez basmışsın gibi davranmaz. Sence içindeki program debounce ve kenar algılamayı nasıl kullanıyor olabilir?
