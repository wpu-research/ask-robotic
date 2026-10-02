# Proje: Platform atlayıcı
süre: 35

## Merak
Bu haftanın bütün parçalarını bir araya getirip ilk gerçek platform oyununu yapıyorsun: yürüyen, zıplayan bir kahraman; yerde dikenler, havada altınlar, bir balçık düşman ve sonunda bir kapı. Oyunun yarısı hazır, kalan yarısı kuralları yazmak.

## Etkinlik
### Ne yapacağız?
Hazır gelenler: 24 karo genişliğinde bir harita, yerçekimi, yürüme, A ile zıplama, kamera, devriye gezen bir balçık ve balçığı ezme kuralı. Senin yazacakların:

| Kural | Hangi dersten | Ne olacak? |
|---|---|---|
| Altın | 23 | Dokununca altın kaybolur, skor 1 artar |
| Diken | 23 | Dokununca can 1 azalır, kahraman başa döner |
| Kapı | 13 ve 23 | Dokununca "Seviye bitti!" yazılır ve oyun kazanılır |

### Blokları kur
1. ▶ bas ve haritada gez. Kamera kahramanı izliyor; sağa yürü, platformlara zıpla. Altınlardan, dikenlerden ve kapıdan geçiyorsun ama hiçbir şey olmuyor.
2. **Altın:** `bir [Oyuncu] sprite'ı [Altın] karosuna dokununca` olayı kur. İçine `sütun [olay karosunun sütunu] satır [olay karosunun satırı] karosunu boşalt`, `skoru [1] değiştir` ve `[puan] melodisini çal` koy.
3. **Diken:** `bir [Oyuncu] sprite'ı [Dikenler] karosuna dokununca` olayı kur. İçine `canı [-1] değiştir`, `ekranı [250] ms salla`, `[bu sprite] sprite'ını sütun [2] satır [5] karosuna koy` ve `[bu sprite] hızı x [0] y [0]` koy.
4. **Kapı:** `bir [Oyuncu] sprite'ı [Kapı] karosuna dokununca` olayı kur. İçine `ekranda [Seviye bitti!] yaz, [2] saniye`, `[zafer] melodisini çal` ve `oyunu bitir: [kazandın]` koy.
5. ↺ bas ve oyna. İlk altını al, dikenlerden kaç, balçığın üstüne zıpla, kapıya ulaş.

Beklenen sonuç: Beş hedefin hepsi ✓. Altın kayboluyor ve skor artıyor, dikene değince can azalıp kahraman başa dönüyor, kapıya dokununca "Seviye bitti!" yazılıp oyun kazanılıyor.

### Nasıl çalışıyor?
- Üç olay ayrı ayrı çalışır. Altın ve diken olayları aynı türden bloklardır; yalnızca resim (karo) farklıdır.
- Kapı karosu da duvar değildir; kahraman içinden geçebilir. Oyun, değdiği anda `karosuna dokununca` olayını çalıştırır.
- Hazır gelen balçık kuralı (ezme/yan çarpma) 24. dersteki gibi çalışır.
- Harita 24 x 8 karodur, yani 384 x 128 piksel. Ekran 160 x 120 olduğu için kamera kahramanı izler.

### Dene
1. Altınları 5 puan yap ve kapıya dokunmadan önce skorun en az 10 olmasını iste: kapı olayında `eğer [skor] ≥ [10] ise kazan, değilse [Önce altınları topla!] yaz`.
2. Haritanın bir yerine yeni bir diken koy: **Harita** sekmesinde dikeni seçip zemine boya. Oyun yeni dikeni de tanıyor mu?
3. Kahramanın resmini robot yap ya da başka bir düşman ekle.

### Sık yapılan hatalar
- Dikene değince kahramanı başa koyup hızını sıfırlamamak: düşme hızı kalır ve kahraman zemine çarpınca garip zıplar.
- Kapı olayında `oyunu bitir: [kaybettin]` seçmek: oyun kazanma yerine kaybetme ekranı gösterir.
- Altın olayında `olay karosunun` bloklarının yerine sabit sayı yazmak: hep aynı karo boşalır.
- Haritadaki altın karosunu **Altın** değil başka bir resimle çizmek: olay hiç tetiklenmez.

## Konuşalım
Bu oyunu bir arkadaşın oynarken zorlandığı yer neresi? Dikenleri azaltmak ya da altınları daha yükseğe koymak oyunu nasıl değiştirir? İyi bir seviye kolaydan zora nasıl ilerler?
