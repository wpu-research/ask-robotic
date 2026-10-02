# DC motor
slug: dcmotor
parça: dcmotor
kategori: Çıkış
özet: Küçük fırçalı motor. Uçlarındaki gerilim hızı, gerilimin yönü dönüş yönünü belirler.

## Pinler
- M1: Birinci motor ucu.
- M2: İkinci motor ucu.

## Nasıl çalışır
DC motor, uçlarına gerilim verilince döner. Gerilim büyüdükçe hız artar; artı ve eksi uçlar yer değiştirince yön tersine döner. Motor bir **bobindir**: akım kesilince ters yönde gerilim sıçraması üretir, bu yüzden transistörle sürülürken flyback diyot gerekir.

Arduino pini motoru doğrudan süremez; motor yüzlerce mA çeker. Transistör, MOSFET ya da L293D gibi bir sürücü kullanılır. `analogWrite` ile (PWM) ortalama gerilim ve dolayısıyla hız değiştirilir.

**İleri düzey:** Laboratuvar modelinde motor direnci 10 Ω, anma gerilimi 6 V'tur; hız yaklaşık uç gerilimi / 6 olarak (en çok 1) alınır. Gerçek küçük motorlar çok düşük PWM değerlerinde dönmeye başlamaz.

## Laboratuvarda bağlantı
| Nereden | Nereye |
|---|---|
| Motor **M1** | Uno **5V** (transistörlü devre) ya da L293D **OUT1** |
| Motor **M2** | Transistör **C** ya da L293D **OUT2** |

Sanal ölçümde motor seçilirse uç gerilimi ve akımı görünür. NPN ile tam gazda yaklaşık 4,2 V ve 0,4 A, hız yaklaşık 0,70 olur.

## Tipik değerler
- Motor direnci | 10 Ω | Laboratuvar modeli
- Anma gerilimi | 6 V | Bu gerilimde tam hız
- NPN ile tam gaz | ≈ 4,2 V, ≈ 0,4 A | Hız ≈ 0,70
- L293D ile (5 V) | ≈ 3,3 V | Çıkış kaybı nedeniyle daha yavaş

## Sık hatalar
- **Motoru doğrudan pine bağlamak.** Pin akımı yetersizdir ve zarar görebilir.
- **Flyback diyotu atlamak.** Transistörle sürerken sıçrama transistörü bozar.
- **Yönü bir anda ters çevirmek.** Önce durdur, sonra yeni yön ver.
- **Çok düşük PWM'den dönmesini beklemek.** Küçük motor eşik değerin altında durur.

## İlgili dersler
- arduino-temelleri:5:2
- arduino-temelleri:5:3
- arduino-temelleri:5:5
