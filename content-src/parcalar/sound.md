# Ses sensörü
slug: sound
parça: sound
kategori: Sensör
özet: Mikrofonlu ses modülü. Sessizken analog çıkış bir baz seviyede durur, ses geldikçe bu seviyeden uzaklaşır.

## Pinler
- VCC: Besleme ucu. 5V'a bağlanır; en az 3 V gerekir.
- GND: Toprak ucu. GND'ye bağlanır.
- AO: Analog çıkış. Uno'nun bir analog girişine (derslerde A0) gider; ses şiddeti arttıkça gerilim yükselir.
- DO: Dijital çıkış. Ses şiddeti eşiği geçince LOW olur; derslerde kullanılmaz.

## Nasıl çalışır
Ses modülünde bir mikrofon ve bir yükselteç vardır. Ortam sessizken analog çıkış sabit bir **baz seviyede** durur. Gerçek mikrofonda ses gelince çıkış bu seviyenin hem üstüne hem altına salınır; bu yüzden sapma `abs(analogRead - baz)` ile hesaplanır. Baz seviye modülden modüle farklıdır, bu yüzden varsayılmaz, açılışta ölçülür.

Bir alkışı tanımak için tek başına yükseklik yetmez: olayın **süresine** da bakılır. Çok kısa ses parazit, çok uzun ses (müzik, bağırış) alkış değildir.

**İleri düzey:** Laboratuvar modelinde AO = VCC × (0,25 + 0,7 × Ses şiddeti) olur ve yalnız yukarı çıkar; gerçek mikrofonun iki yönlü salınımını modellemez. Sessizken (şiddet 0) AO = 1,25 V, yani `analogRead` ≈ 256 (512 değil).

## Laboratuvarda bağlantı
| Nereden | Nereye |
|---|---|
| Ses sensörü **VCC** | Uno **5V** |
| Ses sensörü **GND** | Uno **GND** |
| Ses sensörü **AO** | Uno **A0** |

Özellik panelindeki **Ses şiddeti** (0 ile 1) sesi taklit eder ve program çalışırken değiştirilebilir. Bir alkışı taklit etmek için şiddeti 0,8 yapıp hemen 0'a döndür. **Eşik (DO)** yalnız dijital çıkışı etkiler.

## Tipik değerler
- Ses şiddeti 0 (sessiz) | ham ≈ 256 | Yaklaşık 1,25 V; baz seviye
- Ses şiddeti 0,1 | ham ≈ 327 | Baza göre sapma ≈ 71
- Ses şiddeti 0,5 | ham ≈ 614 | Baza göre sapma ≈ 358
- Ses şiddeti 0,8 | ham ≈ 829 | Baza göre sapma ≈ 573
- Derslerdeki tepe eşiği | 150 | Bundan küçük sapmalar olay sayılmaz
- Derslerdeki süre sınırları | 10 ms ve 500 ms | Kısa parazit / alkış / uzun ses

## Sık hatalar
- **Baz seviyeyi 512 sanmak.** Modülün baz seviyesi farklıdır; her zaman ölç.
- **Baz seviyeyi ses varken ölçmek.** Bütün sapmalar yanlış hesaplanır.
- **Olayı tek örnekle bitirmek.** Salınan sinyal baz seviyeden geçince tek alkış iki olay gibi görünür; sessizlik payı kullan.
- **Sadece yüksekliğe bakmak.** Kapı çarpması da alkışa benzer; süreyi de kontrol et.
- **`abs()` unutmak.** Gerçek mikrofon baz seviyenin altına da salınır.

## İlgili dersler
- sensorler-ve-projeler:4:2
- sensorler-ve-projeler:4:5
