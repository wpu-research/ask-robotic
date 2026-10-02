# Joystick
slug: joystick
parça: joystick
kategori: Girdi
özet: İki eksenli kol ve basılabilen düğme. Her eksen bir potansiyometre gibi 0-5 V arası gerilim verir.

## Pinler
- VCC: Besleme. 5V'a bağlanır (en az yaklaşık 3 V gerekir, ama 3V3 ile uç değer 1023 yerine yaklaşık 675 olur).
- GND: Toprak.
- VRX: Yatay (X) eksen çıkışı. Uno'nun bir analog girişine (A0) gider.
- VRY: Dikey (Y) eksen çıkışı. Başka bir analog girişe (A1) gider.
- SW: Düğme çıkışı. Basılınca GND'ye bağlanır; dijital bir pine (INPUT_PULLUP) gider.

## Nasıl çalışır
**Joystick**, birbirine dik duran iki potansiyometre ile kolun ucundaki bir düğmeden oluşur. Her eksen bir gerilim bölücüdür: VCC ile GND arasındaki şeridin üzerinde kayan uç VRX ya da VRY'ye gerilim verir. Kol ortadayken gerilim yaklaşık 2,5 V, `analogRead` değeri yaklaşık 512'dir. Bir yöne tam itince 0 V ya da 5 V'a, yani 0 ya da 1023'e yaklaşır.

Gerçek modüllerde merkez tam 512 olmaz (497 ya da 530 gibi). Bu yüzden açılışta merkez ölçülür ve çevresine küçük bir ölü bölge konur.

**İleri düzey:** Laboratuvar modelinde her eksen 10 kΩ'luk toplam dirençli bir bölücüdür. SW pini VCC'ye bağlıyken modülün 10 kΩ'luk pull-up direnciyle HIGH'a çekilir; düğme basılınca yaklaşık 100 Ω ile GND'ye bağlanır. Düğmeyi `INPUT_PULLUP` ile de okuyabilirsin.

## Laboratuvarda bağlantı
| Nereden | Nereye |
|---|---|
| Joystick **VCC** | Uno **5V** |
| Joystick **GND** | Uno **GND** |
| Joystick **VRX** | Uno **A0** |
| Joystick **VRY** | Uno **A1** |
| Joystick **SW** | Uno **D2** (`INPUT_PULLUP`) |

Özellik panelinde **X ekseni** ve **Y ekseni** (0 ile 1 arası) ve **Düğme basılı** vardır; program çalışırken de değiştirilebilir. `analogRead` için `pinMode` yazman gerekmez.

## Tipik değerler
- Kol ortada (X ya da Y = 0,5) | ≈ 2,5 V, okuma ≈ 512 | Merkez
- Eksen 0 | ≈ 0 V, okuma ≈ 0 | Bir uç
- Eksen 1 | ≈ 5 V, okuma ≈ 1023 | Öbür uç
- Eksen 0,25 | ≈ 1,25 V, okuma ≈ 256 | Çeyrek konum
- Düğme basılı | SW ≈ 0 V (LOW) | INPUT_PULLUP ile LOW okunur
- Eksen bölücü direnci | 10 kΩ | Toplam, laboratuvar modeli

## Sık hatalar
- **Merkezi sabit 512 yazmak.** Gerçek modülde kol bırakılmışken değer kayar; açılışta ölç.
- **Ölü bölge koymamak.** Kol bırakılmışken değer 510, 514, 509 diye dalgalanır.
- **SW'yi INPUT_PULLUP yapmamak.** Pin havada kalırsa rastgele basış okunur.
- **VCC'yi 3V3'e bağlamak.** ADC 5 V'a göre ölçer; uç değer yaklaşık 675 olur.
- **Kol itiliyken programı başlatmak.** Merkez yanlış ölçülür.

## İlgili dersler
- arduino-temelleri:3:1
- sensorler-ve-projeler:5:1
