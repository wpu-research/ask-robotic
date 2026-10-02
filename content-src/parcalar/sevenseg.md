# 7-segment ekran
slug: sevenseg
parça: sevenseg
kategori: Çıkış
özet: Yedi çubuk ve bir noktadan oluşan, tek haneli rakam gösteren ekran. Her çubuk ayrı bir LED'dir.

## Pinler
- a: A çubuğu (üst yatay çubuk).
- b: B çubuğu (sağ üst dikey çubuk).
- c: C çubuğu (sağ alt dikey çubuk).
- d: D çubuğu (alt yatay çubuk).
- e: E çubuğu (sol alt dikey çubuk).
- f: F çubuğu (sol üst dikey çubuk).
- g: G çubuğu (orta yatay çubuk).
- dp: Nokta LED'i (ondalık nokta).
- COM: Ortak uç. Ortak katotlu ekranda GND'ye, ortak anotlu ekranda 5V'a bağlanır.

## Nasıl çalışır
**7-segment ekran**, yedi küçük LED çubuğu (a-g) ve bir nokta LED'inden (dp) oluşur. Hangi çubukların yandığına göre rakam görünür. Her çubuk ayrı bir LED olduğundan **kendi seri direnci** olmalıdır.

Ekran iki türdedir. **Ortak katotta** tüm LED'lerin eksi uçları COM'da birleşir; COM GND'ye bağlanır ve bir çubuk HIGH verilince yanar. **Ortak anotta** artı uçları birleşir; COM 5V'a bağlanır ve çubuk LOW verilince yanar. Bu yüzden ortak anotta desen ters çevrilir.

Sekiz LED'i sekiz pinle sürmek pahalıdır; derslerde 74HC595 ile üç pine indirilir. Bir rakam bir bayttır: bit 0 = a, bit 1 = b, ... bit 6 = g, bit 7 = dp.

**İleri düzey:** Birden çok haneli ekranlarda haneler hızla sırayla yakılır (çoğullama) ve göz hepsini birden yanıyor sanar. Laboratuvardaki parça tek hanelidir ve her çubuğu LED gibi modeller.

## Laboratuvarda bağlantı
| Nereden | Nereye |
|---|---|
| 74HC595 **QA** ... **QG** | Her biri bir 330 Ω dirençten geçip ekranın **a** ... **g** ucuna |
| 74HC595 **QH** (isteğe bağlı) | Bir dirençten geçip ekranın **dp** ucuna |
| Ekran **COM** | **GND** (ortak katot) |

Parçayı seçince özellik panelinde **Ortak uç** seçeneği çıkar: "Ortak katot" (varsayılan) ya da "Ortak anot". Çalışırken bir direnci seçip **Sanal ölçüm** ile çubuk akımını görebilirsin.

## Tipik değerler
- Çubuk ileri gerilimi (Vf) | 1,9 V | Laboratuvar modeli
- Seri direnç (74HC595 ile) | 330 Ω | Çubuk başına yaklaşık 8 mA
- 74HC595 çıkış direnci | 50 Ω | Laboratuvar modeli
- Varsayılan ortak uç | Ortak katot | COM GND'ye bağlanır
- Rakam 1 deseni | 0x06 | Yalnız b ve c yanar (bit 1 ve bit 2)

## Sık hatalar
- **Çubuk başına direnç koymamak.** Çubuk fazla akım çeker; laboratuvar uyarı verir. Yedi çubuğa yedi direnç gerekir.
- **Ortak anot ile ortak katodu karıştırmak.** Rakamlar ters görünür; ortak anotta COM 5V'a bağlanır ve desen `~RAKAM[i]` ile ters çevrilir.
- **Çubuk adlarını karıştırmak.** a-g sırası bit sırasıyla uyuşmalıdır; yoksa rakamlar bozuk görünür.
- **Tek direnci COM'a koymak.** Yanan çubuk sayısına göre parlaklık değişir (1'de iki çubuk, 8'de yedi çubuk yanar).

## İlgili dersler
- arduino-temelleri:7:1
- arduino-temelleri:7:2
