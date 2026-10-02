# Röle modülü
slug: relay
parça: relay
kategori: Güç
özet: Elektromıknatısla çalışan anahtar. Arduino'dan elektriksel olarak ayrı bir devreyi açıp kapatır.

## Pinler
- VCC: Modül gücü. 5V'a bağlanır.
- GND: Toprak. GND'ye bağlanır.
- IN: Sinyal girişi. Bir Uno pinine bağlanır.
- COM: Kontak tarafının ortak ucu.
- NO: Normalde açık uç. Röle çekilince COM'a bağlanır.
- NC: Normalde kapalı uç. Röle çekilmeyince COM'a bağlıdır.

## Nasıl çalışır
Röle bobine akım verildiğinde bir elektromıknatıs kontağı çeker. Kontak tarafı bobin tarafından ayrıdır ve yalnız bir anahtar gibi davranır (kuru kontak). Modülde bobini süren transistör ve flyback diyot hazırdır.

Çoğu modül **aktif-LOW** çalışır: IN pinine LOW verilince röle çeker, HIGH verilince bırakır. Laboratuvarda bu, **Tetik** özelliğiyle seçilir.

Röle mekanik bir parçadır; hızlı PWM için kullanılmaz. Eşik civarında titremeyi önlemek için iki eşikli (histerezis) kontrol kullanılır.

**İleri düzey:** Kontak değeri ("250 V" gibi) bir güvenli kullanım belgesi değildir. Şebeke gerilimiyle (220 V) çalışmak ölümcüldür ve yalnız eğitimli bir uzmana aittir.

## Laboratuvarda bağlantı
| Nereden | Nereye |
|---|---|
| Röle **VCC** | Uno **5V** |
| Röle **GND** | Uno **GND** |
| Röle **IN** | Uno **D7** |
| Röle **COM** | Uno **5V** |
| Röle **NO** | Direnç **1** (yük) |

Özellik panelinden Tetik'i "LOW ile çeker" seç. VCC'de 4 V'tan az gerilim ya da eksik GND varsa röle çekmez ve uyarı çıkar. Laboratuvar yalnız 5 V'luk düşük gerilimli devreleri sunar.

## Tipik değerler
- Tetik | LOW ile çeker | Derslerin varsayımı
- Besleme | 5 V | 4 V altında çekmez
- Kontak direnci | 0,1 Ω | Laboratuvar modeli
- Örnek yük | ≈ 9 mA | 330 Ω ve kırmızı LED
- Güvenli sınır | Yalnız 5 V | Şebeke gerilimi uzman işidir

## Sık hatalar
- **Şebeke gerilimiyle denemek.** Ölümcüldür; bu portalda hiç gerekmez.
- **Aktif-LOW mantığını ters sanmak.** Röle açılışta çekili kalabilir; `pinMode`'dan önce HIGH yaz.
- **Çıplak röleyi pine bağlamak.** Bobin akımı fazladır ve sıçrama pine zarar verir.
- **COM, NO, NC'yi karıştırmak.** Yük ters çalışır.
- **VCC ya da GND'yi bağlamamak.** Röle çekmez.

## İlgili dersler
- arduino-temelleri:5:4
- arduino-temelleri:5:2
