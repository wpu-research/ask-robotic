# Mikrodenetleyici nedir?
süre: 20

## Merak
Bir asansör hangi kata gideceğini, bir çamaşır makinesi suyu ne zaman boşaltacağını nereden bilir? İçlerinde küçük bir bilgisayar vardır ve bu bilgisayar tek bir iş için programlanmıştır. Bu derste o küçük bilgisayarın ne olduğunu ve kartın üzerinde neler bulunduğunu öğreneceksin.

## Etkinlik
### Mikrodenetleyici ve bilgisayar
Bir bilgisayarda işlemci, bellek ve giriş-çıkış parçaları ayrı ayrı bulunur. **Mikrodenetleyici** bunların hepsini tek bir küçük çipin içinde toplar. Ekranı ve klavyesi yoktur. Onun yerine bacakları vardır. Bu bacaklara LED, buton, sensör, motor gibi parçalar bağlanır.

Mikrodenetleyici yaptığı işi **program** sayesinde bilir. Programı bir kez yüklersin. Kart kapanıp açılsa bile program çipte kalır ve kart açılır açılmaz çalışmaya başlar.

### Arduino Uno'nun anatomisi
Arduino Uno, ATmega328P adlı bir mikrodenetleyici üzerine kurulmuş bir geliştirme kartıdır. Karttaki başlıca parçalar şunlardır.

| Parça | Ne işe yarar? |
|---|---|
| ATmega328P çipi | Programı çalıştıran mikrodenetleyici |
| Dijital pinler (0-13) | Dışarıya HIGH/LOW (5 V / 0 V) verir ya da dışarıdan okur |
| Analog giriş pinleri (A0-A5) | 0-5 V arasındaki gerilimi ölçer |
| 5V ve GND pinleri | Parçalara 5 V besleme ve toprak (0 V) verir |
| USB girişi | Programı yüklemek ve kartı beslemek için kullanılır |
| Reset düğmesi | Programı baştan başlatır |
| D13'e bağlı dahili LED | Harici parça olmadan deneme yapmak için |

ATmega328P'nin bazı sayısal özellikleri: 16 MHz saat hızı, 32 KB program belleği (flash), 2 KB çalışma belleği (SRAM) ve 1 KB EEPROM. Bunlar bir telefonla kıyaslanınca çok küçüktür. Ama bir LED'i yakmak ya da bir motoru kontrol etmek için fazlasıyla yeter.

### Dijital pin ne yapar?
Dijital bir pin iki durumdan birinde olur:
- **HIGH:** Pin yaklaşık 5 V verir.
- **LOW:** Pin 0 V verir.

Bir pin ya **çıkış** (kart dışarıya gerilim verir, örneğin LED yakmak için) ya da **giriş** (kart dışarıyı dinler, örneğin buton okumak için) olarak çalışır. Bu ayarı programda sen yaparsın.

### Program nasıl çalışır?
Arduino programına **sketch** denir. Her sketch'te iki bölüm bulunur:
- `setup()`: Kart açılınca bir kez çalışır.
- `loop()`: Sürekli tekrar eder.

Sonraki derslerde bunları kendin yazacaksın. Şimdilik yalnızca kalıbı tanı:

```
void setup() {
  // bir kez çalışacak komutlar
}

void loop() {
  // sürekli tekrar eden komutlar
}
```

### Çalışma ortamı
Bu modülde devreleri simülatörde ya da kendi kartında kurabilirsin. İkisinde de adımlar aynıdır: devreyi kur, sketch'i yaz, yükle, sonucu izle. Hata yaparsan bir şey bozulmaz. Programı değiştirip yeniden yüklemen yeterlidir.

### Dene
- Kartının fotoğrafına ya da simülatördeki kart görüntüsüne bak. 14 dijital pini ve 6 analog pini say.
- 5V, GND ve D13 yazılarını kartın üzerinde bul.
- Evinde mikrodenetleyici bulunan üç cihaz yaz (ör. mikrodalga fırın, uzaktan kumanda).

### Sık yapılan hatalar
- Mikrodenetleyiciyi "küçük bilgisayar" sanıp her şeyi yapmasını beklemek: tek ve basit işler için tasarlanmıştır.
- Pin numarasını kartın üzerindeki yazıyla karıştırmak: `A0` analog, `0` dijital pindir.
- Kartı bağlarken GND'yi unutmak: devre tamamlanmaz, parçalar çalışmaz.

## Konuşalım
Evindeki hangi cihazın içinde bir mikrodenetleyici olduğunu düşünüyorsun ve bunu nereden anladın? Aynı cihazı tek bir işe değil, çok işe programlayabilsek ne olurdu?
