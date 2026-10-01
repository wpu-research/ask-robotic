# Debounce ve kenar algılama
süre: 25

## Merak
Bir butona bir kez bastın ama kart iki, üç kez bastığını sandı. Ya da hiç basmadın sandı. Program hatasız, devre doğru. Peki neden? Cevap butonun içinde: metal temaslar çarpıp zıplar. Bu derste bu "sıçramayı" nasıl yakalayacağını öğreneceksin.

## Etkinlik
### Devre
Parçaları laboratuvarda **Parça ekle** menüsünden seç, pinleri kablo çekerek bağla.

| Parça | Bağlantı |
|---|---|
| Buton | Bir ucu **D2**, öbür ucu **GND** |
| LED (kırmızı) + 330 Ω direnç | **D13** → direnç → LED anodu; katot GND |

**Önemli:** Laboratuvardaki buton mükemmel temiz bir sinyal verir; sıçrama modellenmez. Yani bu derste sıçrama sorununu ekranda göremeyeceksin. Aşağıdaki sıçrama anlatımı gerçek butonlar için bir bilgi notudur. Yine de debounce'lu programın laboratuvarda da doğru çalıştığını göreceksin: hedef, "tek basış, tek işlem" davranışıdır.

Etkinliği bu sayfanın altındaki bölümde yaparsın.

### Sıçrama (bounce) nedir?
Bir buton kapanırken iki metal parça birbirine çarpar. Parçalar yaylanır; temas birkaç milisaniye boyunca açılıp kapanır. Gözümüz bunu göremez ama kart saniyede binlerce kez okuma yaptığı için görür. Gerçek bir butonda basış şöyle görünür (soldan sağa zamanla):

| | Pindeki değerler |
|---|---|
| Beklenen | HIGH, HIGH, HIGH, **LOW**, LOW, LOW, LOW |
| Gerçek | HIGH, HIGH, **LOW, HIGH, LOW, HIGH**, LOW, LOW, LOW |


Yani tek bir basış, pinde `HIGH, LOW, HIGH, LOW, ...` gibi kısa bir dizi üretir. Butonun bırakılırken de aynı şey olur. Bu sıçrama genellikle birkaç milisaniye sürer; buton kalitesine göre değişir. Eğim anahtarındaki top sallanırken de temas böyle açılıp kapanır.

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

Mantık doğru görünüyor. Laboratuvarda bu program temiz sinyalle düzgün çalışır. Ama gerçek bir butonda sıçrama yüzünden bir basış bazen iki düşen kenar üretir. LED iki kez ters döner ve sanki hiç basılmamış gibi eski durumunda kalır. Bazen de üç kenar olur ve her şey yolunda gözükür. Sonuç tahmin edilemez.

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

20 ms çoğu buton için yeterlidir. Daha kötü bir buton için 30-50 ms'ye çıkarmak gerekebilir. Çok uzun yaparsan hızlı basışları kaçırırsın.

### Dene
- `delay(20)` satırını sil ve laboratuvarda yirmi kez bas. Laboratuvarın butonu temiz olduğu için fark görmezsin; gerçek butonlarda farkın neden çıkacağını kendi cümlelerinle anlat.
- Butonu uzun süre basılı tut. LED'in yalnız bir kez değiştiğini doğrula (kenar algılama).
- Debounce süresini 1 ms yap, sonra 200 ms yap. İkisinde ne bozuluyor?
- Programı "bırakıldığında" ters çevirecek şekilde değiştir (yükselen kenar).

### Sık yapılan hatalar
- `onceki = simdi;` satırını unutmak: kart hep aynı kenarı görür.
- Kenar yerine seviye kullanmak (`if (digitalRead(2) == LOW)` içinde LED'i ters çevirmek): basılı tuttuğun sürece LED çılgın gibi yanıp söner.
- Debounce'u bırakırken unutmak: basarken düzgün, bırakırken sahte basış alırsın.
- Çok uzun bir `delay`: bu sürede kart başka bir şeye bakamaz. Bu yüzden süreyi gerektiği kadar kısa tut.

## Konuşalım
Asansör düğmesine bastığında düğme bir kez yanar, art arda iki üç kez basmışsın gibi davranmaz. Sence içindeki program debounce ve kenar algılamayı nasıl kullanıyor olabilir?
