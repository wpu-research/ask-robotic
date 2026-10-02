# Direnç
slug: direnc
parça: resistor
kategori: Pasif parça
özet: Akımı sınırlayan iki uçlu parça. Değeri ohm (Ω) ile ölçülür ve uçları yönsüzdür.

## Pinler
- 1: Birinci uç. Yönsüzdür; 1 ile 2 birbirinin yerine kullanılabilir.
- 2: İkinci uç.

## Nasıl çalışır
**Direnç**, içinden geçen akıma karşı koyar. Uçları arasındaki gerilim, geçen akımla direncin çarpımına eşittir (**Ohm yasası**):

`V = I × R`   ·   `I = V / R`   ·   `R = V / I`

Direnç büyüdükçe aynı gerilimde akım **azalır**. 5 V'a bağlı 1 kΩ'dan 5 mA, 500 Ω'dan 10 mA geçer.

Direncin iki temel işi vardır:
1. **Akım sınırlamak.** LED'in önüne koyduğun direnç, LED'den geçecek akımı belirler.
2. **Gerilim bölmek.** İki direnç seri bağlanırsa aralarındaki uçta gerilimin bir kısmını alırsın. Sensör devrelerinin (LDR, NTC) temeli budur.

Birimler: 1 kΩ = 1000 Ω, 1 MΩ = 1.000.000 Ω.

**Renk kodu (gerçek dirençler):** İlk iki halka rakam, üçüncü halka çarpandır. 330 Ω = turuncu (3), turuncu (3), kahverengi (×10). 1 kΩ = kahverengi, siyah, kırmızı (10 × 100).

## Laboratuvarda bağlantı
Direncin iki ucu eşdeğerdir. Tipik LED bağlantısı:

| Nereden | Nereye |
|---|---|
| Uno **D13** | Direnç **1** |
| Direnç **2** | LED **A** |

Değeri parçayı seçince özellik panelinde **Direnç** alanından yazarsın (1 Ω ile 1.000.000 Ω arası). Devre çalışırken direnci seçersen panelde uçları arasındaki **gerilimi** ve içinden geçen **akımı** (sanal ölçüm) görürsün.

## Tipik değerler
- LED önü (5 V, kırmızı) | 330 Ω | Yaklaşık 9 mA
- Daha sönük LED | 1 kΩ | Yaklaşık 3 mA
- Buton için çekme (pull-up/pull-down) | 10 kΩ | Bu sitede iç pull-up kullanılır (INPUT_PULLUP)
- Gerilim bölücü (LDR/NTC ile) | 10 kΩ | Sensör devrelerinde sık seçilir
- Potansiyometre toplam direnci | 10 kΩ | Varsayılan değer

## Sık hatalar
- **mA ile A'yı karıştırmak.** 20 mA = 0,02 A. Formülde önce ampere çevir.
- **"Direnç büyükse akım büyüktür" sanmak.** Tersine, akım azalır.
- **Direnç değerini LED için çok küçük seçmek.** 100 Ω ile akım 25-30 mA'e çıkar; LED ve pin zorlanır.
- **Gerçek direncin halkalarını ters okumak.** Altın/gümüş (tolerans) halka sağda olacak şekilde oku.
- **Hesabı ideal sanıp ölçümle birebir eşleşmesini beklemek.** Laboratuvar Uno pininin iç direncini (yaklaşık 25 Ω) ve LED'in iç direncini de modeller; ölçüm hesaptan biraz küçük çıkar.

## İlgili dersler
- arduino-temelleri:1:2
- arduino-temelleri:1:3
- arduino-temelleri:3:2
