# HC-SR04 ultrasonik mesafe sensörü
slug: hcsr04
parça: hcsr04
kategori: Sensör
özet: Ses dalgasının gidiş-dönüş süresini ECHO bacağının HIGH kalma süresi olarak veren mesafe sensörü; tipik aralığı 2-400 cm.

## Pinler
- VCC: 5 V besleme. Uno'nun 5V pinine bağlanır.
- TRIG: Tetik girişi. Karttan gelen kısa (10 µs) HIGH darbesi bir ölçümü başlatır.
- ECHO: Yankı çıkışı. Ses gidip dönene kadar HIGH kalır; süre mesafeyi belirler.
- GND: Toprak. Uno'nun GND'sine bağlanır.

## Nasıl çalışır
HC-SR04'ün önünde iki silindir vardır: biri **ultrasonik** (insan kulağının duyamayacağı, bu sensörde 40 kHz) ses yollar, öbürü yankıyı dinler. Kart TRIG'e 10 µs'lik bir HIGH darbesi verince sensör bir ses demeti yollar ve ECHO bacağını yükseltir. Ses bir nesneye çarpıp dönünce ECHO tekrar LOW olur.

Sensör mesafeyi söylemez, bir **süre** verir. Süreyi `pulseIn(ECHO, HIGH, 30000)` ile mikrosaniye olarak ölçersin ve çevirirsin:

`mesafe (cm) = süre (µs) × 0,0343 / 2`

İkiye bölünür, çünkü süre gidiş ve dönüşü kapsar. Kısa yol: yaklaşık 58 µs = 1 cm.

**İleri düzey:** Ses hızı sıcaklığa bağlıdır (yaklaşık c = 331,3 + 0,606 × T m/s). Programın 343 m/s varsayması soğukta mesafeyi büyük, sıcakta küçük gösterir; 0 °C ile 40 °C arasında 100 cm'de yaklaşık 7 cm fark oluşur. Sensör koni biçiminde bir alana bakar (veri sayfasında tipik olarak yaklaşık 15°). Eğik, yumuşak ya da çok ince yüzeyler yankıyı zayıflatır ya da yana kaçırır; bu yüzden aykırı değerleri ayıklamak için medyan filtre kullanılır (ders 38).

## Laboratuvarda bağlantı
| Nereden | Nereye |
|---|---|
| HC-SR04 **VCC** | Uno **5V** |
| HC-SR04 **GND** | Uno **GND** |
| HC-SR04 **TRIG** | Uno **D9** |
| HC-SR04 **ECHO** | Uno **D10** |

Özellik panelindeki **Mesafe** değeri (2-400 cm) sensörün önündeki nesnenin uzaklığıdır ve program çalışırken değiştirilebilir. Bu aralığın dışında laboratuvar yankı üretmez, `pulseIn` zaman aşımına uğrar ve 0 döndürür. Laboratuvardaki sensör kusursuzdur: Mesafe'ye ne yazarsan onu okur, ses hızı sabittir ve gürültü yoktur. TRIG ve ECHO doğrudan Uno pinlerine bağlanmalıdır.

## Tipik değerler
- Ölçüm aralığı | 2-400 cm | Laboratuvar bu aralıkta yankı üretir; gerçek sensörde veri sayfasına bak
- Ses frekansı | 40 kHz | Duyulmaz
- Tetik darbesi | 10 µs | TRIG'e HIGH süresi
- Süre / mesafe | ≈ 58 µs / cm | Gidiş-dönüş; laboratuvar modeli 58,2 µs/cm kullanır
- Ölçüm açısı | ≈ 15° | Veri sayfasındaki tipik değer; koni biçimindedir
- Ölçümler arası bekleme | ≈ 60 ms | Önceki yankının yenisine karışmaması için önerilen

## Sık hatalar
- **Süreyi ikiye bölmemek.** Mesafe iki kat çıkar.
- **TRIG ile ECHO'nun yerini değiştirmek.** Hiçbir ölçüm gelmez, hep 0 okunur.
- **`pulseIn`'e zaman aşımı vermemek.** Yankı gelmezse varsayılan 1 saniye boyunca beklenir.
- **0 dönüşünü 0 cm sanmak.** 0, yankı yok demektir.
- **VCC ya da GND'yi bağlamamak.** Sensör beslenmez ve tetikleyince cevap vermez.
- **Servo ya da motoru aynı zayıf 5 V hattından beslemek (gerçek devre).** Gerilim çökmesi ölçümü bozar; ayrı besleme ve ortak GND kullan.

## İlgili dersler
- sensorler-ve-projeler:1:1
- sensorler-ve-projeler:1:2
- sensorler-ve-projeler:1:3
- sensorler-ve-projeler:1:5
