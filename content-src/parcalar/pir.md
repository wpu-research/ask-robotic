# PIR hareket sensörü
slug: pir
parça: pir
kategori: Sensör
özet: Kızılötesi ışınımın değişimini algılayan ve hareket varken OUT çıkışını HIGH yapan sensör; açılışta bir ısınma süresi ister.

## Pinler
- VCC: Besleme. Laboratuvarda 5V'a bağlanır.
- OUT: Dijital çıkış. Hareket varken HIGH, yokken LOW olur.
- GND: Toprak. Uno'nun GND'sine bağlanır.

## Nasıl çalışır
PIR (pasif kızılötesi) sensör, çevredeki kızılötesi (ısı) ışınımının değişimini algılar. Sıcak bir cisim (insan, hayvan) görüş alanında hareket edince ışınım değişir ve OUT çıkışı HIGH olur. Duran bir cisim ya da yavaş değişen ortam sıcaklığı bu değişimi yaratmaz. "Pasif" demek, sensörün kendisi ışık göndermeyip yalnızca dinlemesidir.

Hareket bittikten sonra çıkış bir süre HIGH kalır. Laboratuvarda bu süre 3 saniyedir. Açılışta sensör bir ısınma süresi bekler; bu sırada çıkış parazitli oynayabilir. Laboratuvarda ısınma 2 saniyedir ve bu sırada **Hareket** kutusu yok sayılır.

**İleri düzey:** Gerçek modüllerde ısınma süresi genelde yarım dakika ile bir dakika civarındadır ve modüle göre değişir; çoğunda hassasiyet ve çıkışın HIGH kalma süresi için ayar vidaları vardır. Hangi vidanın ne yaptığı modüle bağlıdır, veri sayfasına bak. Alarm gibi uygulamalarda açılıştan sonra bu süre kadar PIR'ı yok sayarsın (ders 75).

## Laboratuvarda bağlantı
| Nereden | Nereye |
|---|---|
| PIR **VCC** | Uno **5V** |
| PIR **GND** | Uno **GND** |
| PIR **OUT** | Uno **D2** |

Kodda `pinMode(2, INPUT)` yazarsın; OUT kendi gerilimini taşıdığı için `INPUT_PULLUP` gerekmez. Hareketi özellik panelindeki **Hareket** kutusuyla verirsin ve çalışırken değiştirebilirsin.

## Tipik değerler
- Laboratuvar ısınması | 2 sn | Gerçek modülde genelde yarım dakika-1 dakika, modüle göre değişir
- Hareketten sonra HIGH kalma | 3 sn | Laboratuvar modeli
- Beslemeyle çalışma eşiği | 4 V | Altında modül beslenmemiş sayılır
- Önerilen bağlantı | D2'ye OUT | Bu sitedeki derslerin standardı

## Sık hatalar
- **Isınma süresini hesaba katmamak.** Açılışta çıkış parazitli oynar, oda "dolu" sanılır.
- **`INPUT_PULLUP` kullanmak.** OUT kendi gerilimini taşır, düz `INPUT` yeter.
- **Hareket bittiğinde çıkışın hemen LOW olacağını sanmak.** Çıkış bir süre HIGH kalır.
- **Durağan bir insanı algılamasını beklemek.** PIR hareket (ışınım değişimi) algılar, varlık değil.
- **GND bağlamamak.** Devre kapanmaz, çıkış anlamsız olur.

## İlgili dersler
- sensorler-ve-projeler:2:1
- sensorler-ve-projeler:8:5
