# MQ-2 gaz sensörü
slug: mq2
parça: mq2
kategori: Sensör
özet: Yanıcı gazlara ve dumana duyarlı, analog gerilimle "temiz havaya göre ne kadar arttı" bilgisi veren modül. Gaz türünü ayırt edemez.

## Pinler
- VCC: Besleme ucu. 5V'a bağlanır; en az 4 V gerekir.
- GND: Toprak ucu. GND'ye bağlanır.
- AO: Analog çıkış. Uno'nun bir analog girişine (derslerde A3) gider; gaz arttıkça gerilim yükselir.
- DO: Dijital çıkış. Gaz düzeyi eşiği geçince LOW olur; derslerde kullanılmaz.

## Nasıl çalışır
MQ-2'nin içinde ısıtılan bir sensör elemanı vardır. Yanıcı gazlar ve duman bu elemanın direncini değiştirir; modül bunu analog çıkışta gerilim olarak verir. Gaz arttıkça AO yükselir. `analogRead` bu gerilimi 0-1023 arası bir sayıya çevirir.

Sensör hangi gaz olduğunu **ayırt edemez**. Ayrıca ısıtıcı çalışma sıcaklığına gelene kadar okumalar kararsızdır; gerçek modülde ısınma süresi uzundur. Isındıktan sonra temiz havada bir **baz değer** ölçülür ve alarm eşiği bazın katı olarak yazılır (örneğin 1,5 katı). ppm gibi bir birim için veri sayfasındaki eğri, gazın türü ve kalibrasyon gerekir; bu olmadan ppm yazılmaz.

**İleri düzey:** Laboratuvar modelinde AO = VCC × (0,1 + 0,9 × Gaz düzeyi). Gerçek MQ-2'de sensör direnci ile modüldeki yük direncinin oluşturduğu bölücüyle AO oluşur ve ısınma ile ortam sıcaklığı değeri kaydırır; laboratuvar bunu modellemez. Gerçek MQ-2 ısıtıcısı aynı zamanda sıcak çalışır.

## Laboratuvarda bağlantı
| Nereden | Nereye |
|---|---|
| MQ-2 **VCC** | Uno **5V** |
| MQ-2 **GND** | Uno **GND** |
| MQ-2 **AO** | Uno **A3** |

Özellik panelindeki **Gaz düzeyi** (0 ile 1) gazı taklit eder ve program çalışırken değiştirilebilir. **Eşik (DO)** yalnız dijital çıkışı etkiler. Modül 4 V'un altındaki beslemede çalışmaz; 3,3 V'a bağlarsan beslenmemiş sayılır.

## Tipik değerler
- Gaz düzeyi 0 (temiz hava) | ham ≈ 102 | Yaklaşık 0,5 V; bu senin baz değerindir
- Gaz düzeyi 0,03 | ham ≈ 130 | Bazın yaklaşık 1,27 katı
- Gaz düzeyi 0,1 | ham ≈ 194 | Bazın yaklaşık 1,9 katı
- Gaz düzeyi 0,3 | ham ≈ 379 | Bazın yaklaşık 3,7 katı
- Gaz düzeyi 1 | ham = 1023 | Tam ölçek (5 V)
- Derslerdeki alarm eşikleri | baz × 1,5 ve × 2,5 | Kapama eşikleri baz × 1,25 ve × 2

## Sık hatalar
- **Isınmayı beklememek.** Gerçek modülde baz değer yanlış çıkar, alarm yanlış çalar ya da hiç çalmaz.
- **Bazı gazlı ortamda ölçmek.** Eşikler yukarı kayar ve gerçek bir artış kaçar.
- **Sabit sayıyla karşılaştırmak.** `okuma > 400` başka modülde ya da başka havada anlamsız olur; bazın katını kullan.
- **Okumayı ppm gibi birime çevirmek.** Kalibrasyon olmadan sayı güvenilir değildir.
- **Tamsayı bölmesi.** `ort / baz` iki `int` ise 1,6 değil 1 çıkar; bölmede `float` kullan.
- **Gerçek güvenlik için tek başına kullanmak.** Bu sensör ve ders devreleri eğitim amaçlıdır; sertifikalı dedektörün yerini tutmaz.

## İlgili dersler
- sensorler-ve-projeler:4:3
- sensorler-ve-projeler:4:4
- sensorler-ve-projeler:4:5
