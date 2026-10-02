# NPN transistör
slug: npn
parça: npn
kategori: Güç
özet: Küçük bir baz akımıyla çok daha büyük bir kolektör akımını yöneten elektronik anahtar.

## Pinler
- B: Baz. Kumanda ucu; küçük bir direnç üzerinden bir Uno pinine bağlanır.
- C: Kolektör. Yük akımı buradan girer (yük genellikle 5V ile C arasındadır).
- E: Emitör. GND'ye bağlanır.

## Nasıl çalışır
Arduino pini yaklaşık 20 mA ile rahat çalışır; motor gibi yükler daha fazla akım çeker. NPN transistör bu sorunu çözer: baz ile emitör arası yaklaşık 0,7 V'u aşınca küçük bir **baz akımı** akar ve transistör kolektörden emitöre çok daha büyük bir akım geçirir. Laboratuvardaki akım kazancı yaklaşık 100'dür.

Baz akımını bir **seri direnç** sınırlar. D6 = 5 V ve 1 kΩ ile baz akımı (5 − 0,7) / 1000 = 4,3 mA olur. Bu akım 100 × 4,3 = 430 mA kadar yük akımına yeter.

Yük motor gibi bir bobinse transistörü korumak için motora **flyback diyot** konur.

**İleri düzey:** İletirken kolektör-emitör arasında bir doyum gerilimi (yaklaşık 0,2 V) kalır; bu yüzden motor 5 V'tan biraz az gerilim görür (tam gazda yaklaşık 4,2 V).

## Laboratuvarda bağlantı
| Nereden | Nereye |
|---|---|
| Transistör **E** | Uno **GND** |
| Transistör **C** | Motor **M2** (ve diyot **A**) |
| 1 kΩ direnç **2** | Transistör **B** |
| 1 kΩ direnç **1** | Uno **D6** |

Motor **M1** ucu 5V'a bağlanır. Taban akımı yaklaşık 30 mA'yı aşarsa laboratuvar uyarı verir.

## Tipik değerler
- Taban-emitör eşiği | ≈ 0,7 V | Laboratuvar modeli
- Akım kazancı | ≈ 100 | Laboratuvar modeli
- Baz direnci | 1 kΩ | Bu sitedeki derslerin standardı; baz akımı ≈ 4,3 mA
- Doyum gerilimi | ≈ 0,2 V | İletirken C-E arası
- Taban akımı uyarı sınırı | 30 mA | Üstünde uyarı çıkar

## Sık hatalar
- **Baz direncini koymamak.** Taban akımı sınırsız kalır; laboratuvar uyarı verir.
- **Emitörü GND'ye bağlamamak.** Akım yolu tamamlanmaz, motor dönmez.
- **Flyback diyotu unutmak.** Bobin sıçraması transistörü bozar; laboratuvar uyarı verir.
- **Ayakları karıştırmak.** B, C ve E yer değiştirirse transistör iletmez.

## İlgili dersler
- arduino-temelleri:5:2
- arduino-temelleri:5:5
