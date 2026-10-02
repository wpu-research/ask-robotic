# LDR
slug: ldr
parça: ldr
kategori: Girdi
özet: Işık arttıkça direnci azalan iki uçlu parça. Sabit bir dirençle gerilim bölücü kurularak okunur.

## Pinler
- 1: Birinci uç. Yönsüzdür; 1 ile 2 birbirinin yerine kullanılabilir.
- 2: İkinci uç.

## Nasıl çalışır
**LDR** (ışığa duyarlı direnç), üzerine düşen ışığa göre direnci değişen bir parçadır. Işık arttıkça direnci **azalır**: karanlıkta çok büyük (yüzlerce kΩ), parlak ışıkta çok küçüktür (birkaç yüz Ω). Uno direnci ölçemez, yalnız gerilimi ölçer; bu yüzden LDR bir sabit dirençle seri bağlanıp **gerilim bölücü** yapılır.

Bu sitedeki standart devre: LDR 5V ile A1 arasında, 10 kΩ direnç A1 ile GND arasında. Işık arttıkça LDR küçülür, A1 gerilimi ve `analogRead(A1)` değeri **artar**. İki parçanın yeri değişirse yön tersine döner.

**İleri düzey:** A1'de okunan `ham` değerinden LDR direnci `R_ldr = 10000 × (1024 − ham) / ham` ile bulunur. Eşik civarındaki titremeyi önlemek için iki eşikli karar (histerezis) kullanılır.

## Laboratuvarda bağlantı
| Nereden | Nereye |
|---|---|
| LDR **1** | Uno **5V** |
| LDR **2** | Uno **A1** ve 10 kΩ direncin 1. ucu |
| 10 kΩ direncin 2. ucu | Uno **GND** |

Işık düzeyini özellik panelindeki **Işık** kaydırıcısıyla (0 ile 1 arası) çalışırken değiştirirsin. `analogRead` için `pinMode` yazman gerekmez.

## Tipik değerler
- Karanlık (Işık 0) | ≈ 1 MΩ | Laboratuvar modelinin üst sınırı; 10 kΩ ile okuma ≈ 10
- Orta ışık (Işık 0,5) | ≈ 14 kΩ | 10 kΩ ile okuma ≈ 424
- Parlak ışık (Işık 1) | ≈ 200 Ω | 10 kΩ ile okuma ≈ 1004
- Sabit bölücü direnci | 10 kΩ | Bu sitedeki derslerin standardı

## Sık hatalar
- **Sabit direnci unutmak.** LDR doğrudan 5V ile A1 arasında kalır; pin havada olur ve ölçüm anlamsızlaşır.
- **LDR ile sabit direncin yerini değiştirmek.** Devre çalışır ama ışık arttıkça `ham` düşer; programın mantığı tersine döner.
- **Çok küçük sabit direnç seçmek.** 100 Ω gibi bir değerle Vout neredeyse hep 0 V'ta kalır, aralık daralır.
- **Tek eşik kullanmak.** Işık eşik civarındayken LED sürekli yanıp söner; iki eşik (histerezis) kullan.

## İlgili dersler
- arduino-temelleri:3:2
- arduino-temelleri:3:4
- arduino-temelleri:3:5
