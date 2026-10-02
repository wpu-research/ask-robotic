# IR engel sensörü
slug: irobstacle
parça: irobstacle
kategori: Sensör
özet: Kızılötesi ışığın yansımasına bakarak önünde engel olup olmadığını söyleyen modül; mesafe ölçmez, "var/yok" der.

## Pinler
- VCC: Besleme. Laboratuvarda 3 V ve üzeri ile çalışır; derslerde 5V pinine bağlanır.
- OUT: Dijital çıkış. Engel varken LOW, yokken HIGH olur (yaygın düzen; bazı modüller tersini yapar).
- GND: Toprak. Uno'nun GND'sine bağlanır.
- AO: Analog çıkış. Yansıma şiddeti arttıkça gerilimi artar; eşiği kodda sen seçersin.

## Nasıl çalışır
Modülün üzerinde bir kızılötesi LED ve bir alıcı vardır. LED ışık yollar; önünde cisim varsa ışığın bir kısmı alıcıya geri döner. Yansıma belli bir düzeyi aşarsa modül "engel var" der.

Eşik iki yerde ayarlanabilir. **OUT** çıkışında eşik modüldeki küçük **ayar vidasındadır** (donanım). **AO** çıkışında ise ham yansıma gerilimini okur ve eşiği kodda belirlersin. Eşik civarında değer dalgalanıyorsa tek eşik yerine iki eşik (histerezis) kullanmak çıktının titremesini önler.

Yansıma yalnız uzaklığa değil cismin rengine ve yüzeyine de bağlıdır: açık renkli mat yüzeyler kolay, koyu ve parlak yüzeyler zor algılanır. Güçlü ortam ışığı gerçek modüllerde ölçümü bozabilir (laboratuvar bunu modellemez).

**İleri düzey:** Laboratuvar modelinde AO, yakınlık değerinin doğrusal bir işlevidir: 0,05 + 0,9 × yakınlık oranında VCC'ye bölünür. Yakınlık 0 iken yaklaşık 0,25 V, 1 iken yaklaşık 4,75 V okunur. Cisim sayarken seviye değil, "yoktan vara" geçişi (kenar) sayılır.

## Laboratuvarda bağlantı
| Nereden | Nereye |
|---|---|
| IR engel **VCC** | Uno **5V** |
| IR engel **GND** | Uno **GND** |
| IR engel **OUT** | Uno **D3** |
| IR engel **AO** (isteğe bağlı) | Uno **A0** |

Özellik panelinde iki kaydırıcı vardır: **Yakınlık** (0-1, cismin yansıtma düzeyi) ve **Eşik (ayar vidası)** (0-1, varsayılan 0,5). Yakınlık eşiğe eşit ya da büyükse engel algılanır. OUT için `INPUT` kullanılır; çıkışı modül sürer.

## Tipik değerler
- OUT, engel varken | LOW | Yaygın düzen; modülün belgesine bak
- OUT, engel yokken | HIGH | Yaygın düzen
- Varsayılan eşik | 0,5 | Laboratuvardaki ayar vidası konumu
- AO, yakınlık 0 | ≈ 0,25 V (analogRead ≈ 51) | Laboratuvar modeli
- AO, yakınlık 1 | ≈ 4,75 V (analogRead ≈ 972) | Laboratuvar modeli
- Çalışma gerilimi | ≥ 3 V | Laboratuvarda 3,3 V ile de beslenmiş sayılır

## Sık hatalar
- **Çıkış seviyesini her modül için aynı sanmak.** Bazı modüller engelde HIGH verir; seviyeyi bir sabite yaz.
- **Ondan santimetre beklemek.** OUT yalnız var/yok der; mesafe için HC-SR04 ya da ToF gerekir.
- **Tek eşik kullanmak.** AO değeri eşik civarında dalgalanınca çıktı titrer; iki eşik kullan.
- **Cisim sayarken seviyeyi saymak.** Duran cisim her turda sayılır; kenarı say.
- **Rengi hesaba katmamak.** Koyu ya da parlak yüzeyler az yansıtır ve algılanmayabilir.

## İlgili dersler
- sensorler-ve-projeler:2:2
- sensorler-ve-projeler:2:5
