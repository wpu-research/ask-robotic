# Potansiyometre
slug: potansiyometre
parça: pot
kategori: Girdi
özet: Konumu değiştirilen üç uçlu direnç. Orta ucundan 0-5 V arası bir gerilim okunur.

## Pinler
- VCC: Bir uç. 5V'a bağlanır.
- SIG: Orta uç (kayar uç). Konuma göre 0-5 V arası gerilim verir. Uno'nun bir analog girişine gider.
- GND: Diğer uç. GND'ye bağlanır.

## Nasıl çalışır
Potansiyometre (pot), iki uç arasında sabit bir direnç şeridi ve bu şeridin üzerinde gezen bir **kayar uç** içerir. Şeridin iki ucunu 5 V ve GND'ye bağlarsan kayar uç, şeridin neresinde durduğuna göre 0 V ile 5 V arasında bir gerilim verir. Bu bir **gerilim bölücüdür**.

Kayar uç GND ucuna doğru çevrilince SIG gerilimi 0 V'a, VCC ucuna doğru çevrilince 5 V'a yaklaşır. Laboratuvarda `Konum` özelliği 0 ile 1 arasındadır ve SIG gerilimi ≈ `Konum × 5 V` olur.

Arduino'da `analogRead(A0)` bu gerilimi 0-1023 arası bir sayıya çevirir (10 bit ADC). Konum 0,5 ise okuma yaklaşık 512'dir.

Potun toplam direnci (10 kΩ gibi) kayar uç hangi konumda olursa olsun uçlar arasında sabit kalır; konum yalnızca bu direncin nasıl paylaşıldığını değiştirir.

## Laboratuvarda bağlantı
| Nereden | Nereye |
|---|---|
| Pot **VCC** | Uno **5V** |
| Pot **GND** | Uno **GND** |
| Pot **SIG** | Uno **A0** |

Konumu özellik panelindeki **Konum** kaydırıcısıyla çalışırken değiştirirsin. Toplam direnç 100 Ω ile 1 MΩ arasında ayarlanabilir; varsayılan 10 kΩ'dur. `analogRead` için `pinMode` yazman gerekmez.

## Tipik değerler
- Toplam direnç | 10 kΩ | Varsayılan; bu sitedeki derslerin standardı
- Konum 0 | ≈ 0 V, okuma ≈ 0 | SIG, GND'ye yakın
- Konum 0,5 | ≈ 2,5 V, okuma ≈ 512 | Orta nokta
- Konum 1 | ≈ 5 V, okuma ≈ 1023 | SIG, VCC'ye yakın
- ADC basamağı | ≈ 4,9 mV | 5 V / 1024

## Sık hatalar
- **SIG'i dijital bir pine bağlayıp analog değer beklemek.** Analog okuma için A0-A5 kullan.
- **VCC ve GND'yi karıştırmak.** Pot ters çalışır: yön tersine döner. Zarar vermez ama sonuç tersine olur.
- **Orta ucu (SIG) 5V ya da GND'ye bağlamak.** Okuma sabit kalır.
- **SIG'i bağlamayı unutmak.** Yüzen analog giriş rastgele sayı okur.
- **Okumayı doğrudan gerilim sanmak.** `analogRead` 0-1023 sayısı verir; gerilim için `ham × 5,0 / 1024` hesaplanır.

## İlgili dersler
- arduino-temelleri:3:1
- arduino-temelleri:3:4
