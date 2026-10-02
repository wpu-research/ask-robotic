# Buzzer
slug: buzzer
parça: buzzer
kategori: Çıkış
özet: Ses çıkaran parça. Aktif türü tek sabit ses, pasif türü `tone()` ile istediğin perde için çalışır.

## Pinler
- +: Artı uç. Uno'nun ses pinine (bu sitede D8) bağlanır.
- -: Eksi uç. GND'ye bağlanır.

## Nasıl çalışır
Buzzer, elektrik sinyalini ses titreşimine çeviren küçük bir hoparlördür. İki türü vardır:

- **Aktif buzzer:** İçinde kendi osilatörü vardır. 5 V verince tek bir sabit perdede (yaklaşık 2 kHz) ses çıkarır. Sesi yalnızca açıp kapatabilirsin. Frekansı değiştiremezsin.
- **Pasif buzzer:** İçinde osilatör yoktur; yalnız bir zardır. Sesin perdesini senin gönderdiğin titreşim belirler. `tone(8, 440)` pini saniyede 440 kez HIGH-LOW yapar ve buzzer 440 Hz (La) çalar. `noTone(8)` sesi keser.

Frekans ne kadar yüksekse ses o kadar ince (tiz) olur.

## Laboratuvarda bağlantı
| Nereden | Nereye |
|---|---|
| Buzzer **+** | Uno **D8** |
| Buzzer **-** | Uno **GND** |

Türü özellik panelindeki **Tür** alanından seçersin: Aktif (kendi sesi var) ya da Pasif (tone ile). Varsayılan Pasif'tir. Sesi duymak için laboratuvardaki ses düğmesini açman gerekir. Bu sitede buzzer doğrudan pine bağlanır; gerçek devrede büyük ya da güçlü buzzerlar için transistör gerekebilir (Modül 3, 22. ders).

## Tipik değerler
- Aktif buzzer frekansı | ≈ 2000 Hz | Sabit; 2 V üstünde ses çıkar
- La notası (A4) | 440 Hz | `tone(8, 440)`
- Do notası (C4) | ≈ 262 Hz | `tone(8, 262)`
- Rahat çalma aralığı | birkaç yüz Hz - birkaç kHz | Çok düşük ya da çok yüksek frekansta nota gibi duyulmaz
- Tür | Pasif | Laboratuvar varsayılanı

## Sık hatalar
- **Aktif buzzer ile `tone()` ile nota çalmayı denemek.** Hep aynı perdede ses çıkar; nota için pasif tür gerekir.
- **Yanlış pin.** Kodda `tone(8, ...)` yazdıysan buzzerın + ucu D8'e bağlı olmalı.
- **GND'yi bağlamamak.** Devre kapanmaz, ses gelmez.
- **Sesi duyamamak.** Laboratuvarda ses düğmesinin açık olduğunu kontrol et.
- **`tone()`'un süresiz çalacağını unutmak.** Süre vermezsen ses sürekli çalar; `noTone()` ile kesersin.

## İlgili dersler
- arduino-temelleri:4:3
- arduino-temelleri:4:5
