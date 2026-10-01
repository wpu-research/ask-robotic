# Gürültü, yansıma açısı ve medyan filtre
süre: 25

## Merak
Park sensörü arkandaki duvara 100 cm gösteriyor. Bir an sonra ekranda 350 yanıp sönüyor, sonra yine 100. Duvar bir anda 2,5 metre uzağa gitmedi. Sensör bir kez yanlış ölçtü. Eğer sensörün her okuması arabayı frenletecek ya da bırakacak kadar önemliyse bu tek yanlış okumayı nasıl yok sayarız?

## Etkinlik
### Yanlış ölçüm nereden gelir?
Ses, bir top gibi sekip geri gelir. Bu yüzden ölçüm nesnenin **yüzeyine ve açısına** bağlıdır:
- **Yüzeye dik, düz nesne** sesi doğrudan sensöre geri yollar: en iyi ölçüm.
- **Eğik yüzey** sesi yana yansıtır. Ya yankı hiç dönmez (`pulseIn` 0 verir) ya da ses odadaki başka bir yüzeye çarpıp dolaylı yoldan döner ve mesafe olduğundan büyük görünür. Bu açı sınırı sensöre ve nesneye göre değişir; veri sayfasında ölçüm açısı için tipik bir değer yazar.
- **Yumuşak ve tüylü yüzeyler** (kumaş, sünger, kazak) sesi büyük ölçüde soğurur; yankı zayıflar.
- **Çok ince ya da çok küçük nesneler** (kablo, sandalye bacağı) sesin az bir kısmını geri yollar.
- **Elektriksel gürültü:** motor ya da servo aynı güçten besleniyorsa gerilim çökmeleri sensörün zamanlamasını bozabilir.
- **Başka sensörler:** iki ultrasonik sensör aynı anda ölçerse biri diğerinin sesini duyabilir.

Sonuç: sensör çoğu zaman doğru ölçer, ama arada bir **aykırı değer** (outlier) verir: komşularından çok farklı tek bir okuma. Bunu temizlemenin ilk akla gelen yolu ortalama almaktır. Görelim, işe yarıyor mu.

### Ortalama mı, medyan mı?
**Ortalama:** tüm değerleri toplayıp sayıya böl. **Medyan:** değerleri küçükten büyüğe sırala, ortadakini al.

Beş okuma: 100, 100, 100, 350, 100.
- Ortalama: (100 + 100 + 100 + 350 + 100) / 5 = **150**. Tek bir yanlış okuma sonucu 50 cm bozdu.
- Medyan: sırala → 100, 100, 100, 100, 350 → ortadaki (3.) değer = **100**. Aykırı değer sıralamanın ucuna gitti ve hiç seçilmedi.

Bu program iki fonksiyonu aynı dizilere uygular. Fonksiyonlara dizi verirken dizinin kendisini ve eleman sayısını ayrı ayrı veririz (`float a[], int n`).

```cpp
// sketch: ortalama_medyan_dizi
float ortalama(float a[], int n) {
  float toplam = 0;
  for (int i = 0; i < n; i++) toplam += a[i];
  return toplam / n;
}

float medyan(float a[], int n) {
  float b[9];                          // kopya (en çok 9 eleman)
  for (int i = 0; i < n; i++) b[i] = a[i];
  for (int i = 1; i < n; i++) {        // ekleme sıralaması
    float x = b[i];
    int j = i - 1;
    while (j >= 0 && b[j] > x) {
      b[j + 1] = b[j];
      j--;
    }
    b[j + 1] = x;
  }
  return b[n / 2];                     // ortadaki
}

void raporla(const char* ad, float a[], int n) {
  Serial.print(ad);
  Serial.print(" ortalama=");
  Serial.print(ortalama(a, n), 1);
  Serial.print(" medyan=");
  Serial.println(medyan(a, n), 1);
}

void setup() {
  Serial.begin(9600);
  float temiz[5] = {100, 101, 99, 100, 100};
  float bir[5]   = {100, 100, 100, 350, 100};
  float iki[5]   = {100, 350, 100, 350, 100};
  float uc[5]    = {100, 350, 350, 350, 100};
  raporla("temiz", temiz, 5);
  raporla("bir aykiri", bir, 5);
  raporla("iki aykiri", iki, 5);
  raporla("uc aykiri", uc, 5);
}

void loop() {
}
```

Çıktıyı oku: tek aykırı değerde ortalama 150, medyan 100. İki aykırı değerde ortalama 200, medyan hâlâ 100. Üç aykırı değerde ise medyan da yanılır (350), çünkü beş değerin üçü yanlış ve ortadaki yanlış çıkar. Kural: **N elemanlı pencerede medyan en çok (N−1)/2 aykırı değeri atar.** Beşlik pencere iki yanlışı affeder.

### Canlı sensörle kayan medyan
Gerçek sistemde okumalar tek seferde gelmez; sürekli akar. Son 5 okumayı bir **kayan pencerede** tutarız: yeni okuma gelince en eskisi çıkar. Her seferinde pencerenin ortalamasını ve medyanını hesaplarız.

Devre (hafta boyunca aynı). Parçaları laboratuvarda **Parça ekle** menüsünden seç, pinleri kablo çekerek bağla.

| Parça | Bağlantı |
|---|---|
| HC-SR04 VCC | Uno **5V** |
| HC-SR04 GND | Uno **GND** |
| HC-SR04 TRIG | Uno **D9** |
| HC-SR04 ECHO | Uno **D10** |

Laboratuvardaki sensör kusursuz ölçer: Mesafe özelliğine ne yazarsan onu okur. Aykırı değeri sen üretirsin: program çalışırken Mesafe değerini kısa süre 350 cm yapıp geri alırsın. Program 55 ms'de bir ölçtüğü için bu kadar kısa bir sıçrama üretmek zordur; denemek için `delay(50)` değerini geçici olarak `delay(400)` yap. Sıçramayı yarım saniyeden kısa tutarsan pencereye yalnız 1-2 yanlış ölçüm girer.

```cpp
// sketch: medyan_kayan
const int TRIG = 9;
const int ECHO = 10;
const int N = 5;                      // pencere boyu (tek sayı)
const float MENZIL = 400.0;           // yankı yoksa "uzak" say

float pencere[N];
int sira = 0;

float tekOlcum() {
  digitalWrite(TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG, LOW);
  unsigned long sure = pulseIn(ECHO, HIGH, 30000);
  if (sure == 0) return MENZIL;       // yankı yok: yansıma kaçtı ya da çok uzak
  float cm = sure * 0.0343 / 2.0;
  return cm > MENZIL ? MENZIL : cm;
}

float ortalama(float a[], int n) {
  float toplam = 0;
  for (int i = 0; i < n; i++) toplam += a[i];
  return toplam / n;
}

float medyan(float a[], int n) {
  float b[N];
  for (int i = 0; i < n; i++) b[i] = a[i];
  for (int i = 1; i < n; i++) {
    float x = b[i];
    int j = i - 1;
    while (j >= 0 && b[j] > x) {
      b[j + 1] = b[j];
      j--;
    }
    b[j + 1] = x;
  }
  return b[n / 2];
}

void setup() {
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  Serial.begin(9600);
  float ilk = tekOlcum();
  for (int i = 0; i < N; i++) pencere[i] = ilk;   // pencereyi ilk okumayla doldur
}

void loop() {
  float ham = tekOlcum();
  pencere[sira] = ham;                // en eski değerin yerine yaz
  sira = (sira + 1) % N;              // 0,1,2,3,4,0,1,... döner

  Serial.print("ham=");
  Serial.print(ham, 1);
  Serial.print(" ort=");
  Serial.print(ortalama(pencere, N), 1);
  Serial.print(" med=");
  Serial.println(medyan(pencere, N), 1);
  delay(50);
}
```

### Nasıl çalışıyor?
1. `pencere[N]` son N okumayı tutar. `sira` bir sonraki yazılacak yerdir; `(sira + 1) % N` onu 4'ten sonra tekrar 0'a döndürür.
2. `setup` pencereyi ilk okumayla doldurur; yoksa ilk saniyelerde pencere sıfırlarla dolu olur ve medyan 0'a yakın çıkardı.
3. `tekOlcum` yankı yoksa 400 döndürür. Bu bilerek yapıldı: eğik yüzeyde sesin kaçması "çok uzak" gibi görünür. Medyan bu değeri de bir aykırı değer olarak atar.
4. `medyan` önce pencereyi kopyalar, kopyayı sıralar, ortadakini döndürür. Asıl pencere sırasını korur; kopyalamasaydık "en eski değer hangisi" bilgisini kaybederdik.

### Bedel: gecikme
Medyan filtre bedava değildir. Mesafe gerçekten 100 cm'den 50 cm'e düşerse filtre çıkışı hemen 50 vermez: pencerede 3 tane 50 birikene kadar medyan 100'de kalır. Beş elemanlı pencerede bu 3 ölçüm, yani burada yaklaşık 3 × 55 ms ≈ 165 ms gecikme demektir. Pencereyi büyütürsen gürültüye dayanıklı olursun ama gecikme artar. Pencereyi küçültürsen hızlı olursun ama yanlışları daha az atarsın.

NewPing kütüphanesi de aynı fikri sunar: `sonar.ping_median(5)` beş ölçüm yapar ve ortadaki süreyi mikrosaniye olarak döndürür. Biz kendi filtremizi yazdık ki mantığı bilelim.

### Dene
- `medyan_kayan` programında `N = 3` ve `N = 7` dene. Aykırı değer atma gücü ve gecikme nasıl değişiyor? Önce tahmin yaz, sonra hesapla.
- `ortalama_medyan_dizi` dizilerine kendi uydurduğun değerleri yaz. Hangi dizide ortalama ile medyan en çok ayrılıyor?
- `medyan_kayan` içinde `delay(50)` yerine `delay(400)` yaz. Çalışırken Mesafe'yi yarım saniyeliğine 350 cm yapıp geri al, sonra 100 cm'den 50 cm'e kalıcı olarak indir. Seri monitörde `ort` ve `med` sütunları iki durumda nasıl davranıyor?
- Ortalamanın da işe yaradığı bir durum düşün: okumalar 100 ± 1 cm gibi küçük dalgalanmalarsa hangisi daha pürüzsüz çıkar? Dizileri deneyerek bak.

### Sık yapılan hatalar
- Pencereyi ilk okumayla doldurmamak: başlangıçta sıfırlar medyanı bozar.
- Pencere boyunu çift seçmek: ortadaki değer belirsiz olur. Tek sayı (3, 5, 7) kullan.
- Sıralamadan önce diziyi kopyalamamak: pencerenin sırası bozulur, hangi elemanın en eski olduğunu bilemezsin.
- `pulseIn` 0 döndüğünde 0'ı mesafe sanmak: "0 cm" okuma, medyanın tam ortasına düşebilir ve sonucu bozar.
- Medyanla her sorunun çözüldüğünü sanmak: yanlış okumalar pencerenin yarısından fazlaysa medyan da yanılır. Asıl nedeni (açı, yüzey, güç gürültüsü) gider.

## Konuşalım
Park sensöründe pencere boyunu 5'ten 15'e çıkarsan ekran çok kararlı olur ama araba hızlı yaklaşırken ne olur? Gürültü ile gecikme arasında bir denge kurmanın doğru yeri nasıl belirlenir?
