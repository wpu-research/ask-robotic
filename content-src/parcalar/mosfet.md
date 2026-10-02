# MOSFET
slug: mosfet
parça: mosfet
kategori: Güç
özet: Geçit gerilimiyle çalışan, neredeyse hiç akım çekmeyen ve güçlü yükleri süren N kanallı anahtar.

## Pinler
- G: Geçit. Kumanda ucu; bir Uno pinine bağlanır.
- D: Akaç. Yük akımı buradan girer.
- S: Kaynak. GND'ye bağlanır.

## Nasıl çalışır
MOSFET, **gerilimle** çalışır: geçit ile kaynak arasındaki gerilim eşiği (yaklaşık 2 V) aşınca akaç ile kaynak arasından akım geçer. Geçit neredeyse akım çekmez; bu yüzden NPN gibi baz akımı hesabı gerekmez.

Dikkat: her MOSFET 5 V ile tam açılmaz. Arduino ile **mantık seviyeli (logic level)** olan seçilir. İletirken direnci çok küçüktür (laboratuvarda yaklaşık 0,05 Ω); bu yüzden motor neredeyse tam 5 V görür ve NPN'e göre daha hızlı döner.

Motor bobin olduğu için flyback diyot yine gerekir.

**İleri düzey:** Geçit küçük bir kapasite gibi davranır; gerçek devrede geçide 100 Ω civarı seri direnç konur, geçit ile GND arasına da 10 kΩ'luk bir direnç koyarak açılışta geçidin havada kalması önlenir.

## Laboratuvarda bağlantı
| Nereden | Nereye |
|---|---|
| MOSFET **S** | Uno **GND** |
| MOSFET **D** | Motor **M2** (ve diyot **A**) |
| MOSFET **G** | 100 Ω direnç üzerinden Uno **D6** |
| 10 kΩ direnç | **G** ile **GND** arası |

Motor **M1** ucu 5V'a bağlanır; diyotun K ucu da 5V'a gider.

## Tipik değerler
- Eşik gerilimi | ≈ 2 V | Laboratuvar modeli, mantık seviyeli
- İletim direnci | ≈ 0,05 Ω | Laboratuvar modeli
- Tam gazda motor hızı | ≈ 0,83 | NPN'de ≈ 0,70
- Geçit direnci | 100 Ω | Bu sitedeki derslerin standardı

## Sık hatalar
- **Mantık seviyeli olmayan MOSFET seçmek.** 5 V ile yeterince açılmaz, ısınır.
- **Kaynağı GND'ye bağlamamak.** Akım yolu tamamlanmaz.
- **Flyback diyotu atlamak.** Bobin sıçraması MOSFET'i bozabilir.
- **Geçidi havada bırakmak.** Açılışta rastgele iletebilir.

## İlgili dersler
- arduino-temelleri:5:2
- arduino-temelleri:5:3
