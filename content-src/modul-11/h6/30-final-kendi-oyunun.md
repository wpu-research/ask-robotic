# Final: Kendi oyunun
süre: 40

## Merak
Beş haftada sprite'ları hareket ettirdin, çarpışmaları yönettin, harita çizdin, düşmanlara zekâ ve kahramana yerçekimi verdin. Şimdi bütün bunlar senin: boş bir sahne, bir fikir ve elindeki bloklar. Bu derste kendi oyununu yapacaksın. Fikir tamamen sende; ben sadece oyunun "tam" olup olmadığına bakacağım.

## Etkinlik
### Başlangıç
Sahnede lacivert bir arka plan var, başka hiçbir şey yok. Bütün bloklar açık: Sprite, Hareket, Denetleyici, Oyun, Sahne / Harita, Ses, Mantık, Döngü, Değişken, Matematik, Metin ve Fonksiyon. Resimler ve Harita sekmeleriyle kendi resimlerini ve haritanı da çizebilirsin.

### Önce karar ver: beş soruluk tasarım kartı
26. dersteki kartı doldur: Oyuncu kim? Hedef ne? Tehlike ne? Nasıl kazanılır? Nasıl kaybedilir? Aşağıdaki fikirlerden birini seçebilir ya da kendi fikrini bulabilirsin:
- **Meyve avcısı:** Kedi meyve toplar, hayaletten kaçar.
- **Uzay savunması:** Gemi düşmanı vurur (27. ders).
- **Hazine labirenti:** Elmasları topla, kapıdan çık (28. ders).
- **Platform macerası:** Altın topla, dikenlerden zıpla (25. ders).
- **Kendi fikrin:** Balık tutma, havada balon koruma, yarış…

### Hedef listesi: tam bir oyunun işaretleri
Hedefler paneli oyununu kontrol eder. Tasarım sana ait; liste yalnız tam bir oyunda olması gerekenleri sınar:

| Hedef | Ne demek? |
|---|---|
| Oyuncu | Türü **Oyuncu** olan ve ok tuşlarıyla hareket eden bir sprite |
| Toplanacak şey | **Yiyecek**, **Bonus**, **Hedef** ya da **Nesne** türünde bir sprite |
| Tehlike | **Düşman** ya da **Engel** türünde bir sprite |
| Skor | Toplayınca skor artıyor |
| Can | Tehlikeye değince can azalıyor |
| Bitiş | Programında `oyunu bitir` bloğu var |
| Ses | En az bir melodi ya da bip çalıyor |
| Cila | Ekran sarsıntısı, patlama ya da ekranda mesaj |

Önemli: Hedefler, sprite türlerine ve çarpışma olaylarına bakar. Türleri doğru seç: toplanacak şeylere **Yiyecek**, tehlikelere **Düşman** gibi.

### Dört turda yap (yaklaşık 35 dakika)
**Tur 1 (10 dk): iskelet.** `oyun başlayınca` bloğuyla oyuncu sprite'ını oluştur, `oyuncu tuşlarıyla … hareket etsin` bloğunu ekle, `ekranda kalsın` ayarını aç, skoru 0, canı 3 yap. ↺ bas: oyuncun yürüyor mu?

**Tur 2 (10 dk): toplanacak şey ve tehlike.** `her [1000] ms'de bir` olayıyla rastgele yerlerde toplanacak sprite'lar çıkar (rastgele konum için `[ile] arasında rastgele sayı`). Bir düşman oluştur; sekmeli, takip eden ya da rastgele hareket etsin. `bir [Oyuncu] sprite'ı bir [Yiyecek] sprite'ına çarpınca` ve `… bir [Düşman] sprite'ına çarpınca` olaylarını yaz: skor artır, can azalt, sil.

**Tur 3 (5 dk): bitiş.** Çarpışma olayında `eğer [skor] ≥ [5] ise` ile `oyunu bitir: [kazandın]` yaz. Kaybetmek için can 0'a düşünce oyun kendiliğinden biter; istersen `can bitince` olayına özel bir mesaj ekle.

**Tur 4 (10 dk): cila.** Ses ekle (toplayınca puan, çarpınca kayıp melodisi), `ekranı salla` ve `ekranda … yaz` kullan. Oyunu baştan sona kendin oyna; çok kolay ya da çok zorsa sayıları (hız, süre, skor hedefi) ayarla.

Beklenen sonuç: Sekiz hedefin hepsi ✓ ve oyun baştan sona oynanabiliyor. Hedeflerin hepsi ✓ olunca oyunun "tam" sayılır; asıl güzel kısım, onu daha da iyileştirmeye devam etmen.

### Nasıl çalışıyor?
- Hedef kontrolü senin oyununu bir robotun oynayacağı gibi dener: tuşlara basar, toplanacak şeyle ve tehlikeyle çarpıştırır. Çarpışma olayların olmazsa skor ve can değişmez; hedefler ✓ olmaz.
- **Bitiş** hedefi, programında `oyunu bitir` bloğunun bulunup bulunmadığına bakar. Bitişin gerçekten çalıştığını görmek için oyununu kendin kazanıp dene.
- Aynı oyunu birçok biçimde çözmek mümkündür. Sana ait çözüm, benimkinden çok farklı olabilir; bu iyi.

### Örnek çözüm: Meyve avcısı
Bir fikre takılırsan şu örnek tasarıma bak: kedi (dört yöne, ekranda kalsın), köşede sekerek giden bir hayalet (Düşman), her saniye rastgele bir yerde 5 saniye ömürlü bir kiraz (Yiyecek). Kiraz skor 1, hayalet can -1; skor 5 olunca "Avcı kazandı!" yazılıp oyun kazanılıyor; ses ve ekran sarsıntısı var. Bu tasarımı kendi başına yapabilir, sonra değiştirebilirsin.

### Dene
1. Oyununa bir **zaman sınırı** ekle: `geri sayımı [30] saniyeden başlat` ve `süre bitince` olayında karar ver.
2. Oyununa **seviye** ekle: skor 5 olunca düşman hızlansın (27. dersteki gibi bir değişkenle).
3. **Harita** sekmesinde bir labirent ya da platform çiz ve oyunu haritaya taşı.
4. Kendi resimlerini **Resimler** sekmesinde çiz.
5. Serbest Oyun Atölyesi sayfasında (ders dışında) oyununu **💾 Kaydet** düğmesiyle dosya olarak indirebilir, **📂 Aç** ile geri yükleyebilirsin.

### Sık yapılan hatalar
- Çarpışma olayında yanlış türü seçmek: olay "Yiyecek" bekliyorsa ama sprite'ı **Nesne** türüyle yaptıysan olay hiç çalışmaz, skor değişmez.
- Bir olay bloğunu başka bir olay bloğunun içine koymaya çalışmak: olay blokları yalnız tek başlarına, çalışma alanında durur.
- Aynı anda çok şey yapmaya çalışıp hiçbir parçayı bitirmemek: önce iskelet, sonra tehlike, sonra bitiş, en son cila.
- **↺ Başa dön** düğmesine bilmeden basmak: etkinlik başlangıç projesine geri döner ve yaptığın bloklar gider. Sahnedeki ↺ ise yalnız oyunu yeniden başlatır.

## Konuşalım
Oyununun en güçlü yanı ne? Birisi oynasa ilk 10 saniyede ne anlar? Bir sonraki sürümde ilk ekleyeceğin şey ne olurdu?
