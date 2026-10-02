# Yağmur sensörü
slug: rain
parça: rain
kategori: Sensör
özet: Kart üzerine düşen damlaları analog bir gerilimle bildiren sensör. Islandıkça çıkış değeri düşer.

## Pinler
- VCC: Besleme ucu. 5V'a bağlanır.
- GND: Toprak ucu. GND'ye bağlanır.
- AO: Analog çıkış. Uno'nun bir analog girişine (derslerde A0) gider; ıslandıkça gerilim düşer.
- DO: Dijital çıkış. Islaklık eşiği geçince LOW olur; derslerde kullanılmaz.

## Nasıl çalışır
Yağmur sensörünün kartında iki bakır iz vardır. Düşen damlalar bu izleri köprüler ve çıkış gerilimi **düşer**. Kuru kartta çıkış yüksektir. `analogRead` gerilimi 0-1023 arası sayıya çevirir; programda bir eşikle "yağmur var" ya da "yok" kararı verilir.

Eşik civarında okuma dalgalanabilir ve durum hızla değişebilir; bunun çaresi iki eşik (histerezis) kullanmaktır. Sensörün yönü ve sayıları modüle göre değişir; eşikler kullanılan sensörle ölçülerek belirlenmelidir.

**İleri düzey:** Laboratuvar modelinde AO = VCC × (0,95 − 0,85 × ıslaklık). Bu yüzden kuruda yaklaşık 4,75 V (ham ≈ 972), tam ıslakta yaklaşık 0,5 V (ham ≈ 102) çıkar.

## Laboratuvarda bağlantı
| Nereden | Nereye |
|---|---|
| Yağmur **VCC** | Uno **5V** |
| Yağmur **GND** | Uno **GND** |
| Yağmur **AO** | Uno **A0** |

Özellik panelindeki **Islaklık (yağmur)** (0 ile 1) kaydırıcısı kartın üstüne ne kadar yağmur düştüğünü belirler ve çalışırken değiştirilebilir. Modülün çalışması için en az 3 V besleme gerekir.

## Tipik değerler
- Islaklık 0 (kuru) | ham ≈ 972 | Yaklaşık 4,75 V
- Islaklık 0,5 | ham ≈ 537 | Eşik 600 ise "yağmur var"
- Islaklık 1 (sağanak) | ham ≈ 102 | Yaklaşık 0,5 V
- Dersteki eşik | 600 | Altı "yağmur var"; bu eşik laboratuvar modeli için ölçüldü

## Sık hatalar
- **Yönü ters varsaymak.** Bu modülde yağmurda değer artmaz, düşer.
- **Tek eşik kullanmak.** Eşik civarında "VAR" ve "YOK" hızla gidip gelir.
- **Eşiği başka bir sensörden almak.** Eşikleri kullandığın sensörle ölçerek belirle.
- **Tek ölçüme güvenmek.** Anlık bir damla yanlış alarm verebilir.

## İlgili dersler
- sensorler-ve-projeler:3:3
- sensorler-ve-projeler:3:5
