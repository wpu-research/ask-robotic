# Diyot
slug: diode
parça: diode
kategori: Güç
özet: Akımı yalnız bir yöne geçiren parça. Derslerde motorun geri tepme gerilimini sönümleyen flyback diyot olarak kullanılır.

## Pinler
- A: Anot. Akım buradan girer.
- K: Katot (çizgili uç). Akım buradan çıkar.

## Nasıl çalışır
Diyot akımı yalnız anottan katoda geçirir. İletirken uçları arasında yaklaşık 0,7 V gerilim düşer (**ileri gerilim**). Ters yönde akım geçirmez.

Motor ve röle bobini akım kesilince ters yönde yüksek gerilim üretir. Bobine paralel, ters yönde bağlanan diyot bu akıma yol açar ve transistörü korur: **flyback diyot**. Normal çalışmada diyot iletmez; yalnız sıçrama anında iletir.

**İleri düzey:** Gerçek devrede 1N4007 gibi bir doğrultucu diyot kullanılır. LED de bir diyottur ama ışık verir ve ileri gerilimi renge göre 1,9-3,0 V'tur.

## Laboratuvarda bağlantı
| Nereden | Nereye |
|---|---|
| Diyot **A** | Transistörün **C** ucu (ya da MOSFET **D**) |
| Diyot **K** (çizgili uç) | Motorun artı tarafı, **5V** |

Motor transistör ya da MOSFET ile sürülüyor ama flyback diyot yoksa ya da ters bağlıysa laboratuvar "flyback" uyarısı verir. Doğru bağlantıda diyot normalde akım iletmez.

## Tipik değerler
- İleri gerilim | 0,7 V | Laboratuvar modeli
- Seri direnç | 1 Ω | Laboratuvar modeli
- Yön | A'dan K'ya | Çizgili uç katottur
- Flyback konumu | Motora paralel, ters yönde | K, artı tarafa

## Sık hatalar
- **Diyotu ters bağlamak.** Sıçrama için yol açmaz; uyarı çıkar.
- **Diyotu hiç koymamak.** Transistör zamanla bozulur.
- **Çizgili ucu karıştırmak.** Çizgili uç katottur ve 5V tarafına gider.
- **Diyotu motorla seri bağlamak.** Motor çalışmaz; diyot motora paralel olmalıdır.

## İlgili dersler
- arduino-temelleri:5:2
- arduino-temelleri:5:4
