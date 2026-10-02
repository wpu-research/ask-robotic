# Oyun iskeleti: oyuncu, hedef, skor, bitiş
süre: 25

## Merak
Satranç, futbol ve bir bilgisayar oyunu çok farklı görünür ama hepsinin ortak bir iskeleti vardır: sen kimsin, ne yapabilirsin, neyi başarmaya çalışıyorsun, ne zaman kazanır ya da kaybedersin? Bu soruları baştan cevaplayan bir oyun, yarım kalan oyundan çok daha çabuk biter. Bu hafta tam oyunlar yapıyoruz; önce iskeleti öğren.

## Etkinlik
### Beş soruluk tasarım kartı
Bir oyuna başlamadan önce şu beş soruyu kendi kendine cevapla (bir arkadaşına anlatmak da işe yarar):
1. **Oyuncu kim?** (kedi, robot, gemi…) Nasıl hareket eder?
2. **Hedef ne?** (toplamak, vurmak, kaçmak, bir yere varmak)
3. **Tehlike ne?** (düşman, diken, süre…)
4. **Nasıl kazanılır?** (örneğin skor 3 olunca)
5. **Nasıl kaybedilir?** (örneğin can 0 olunca)

Bu derste cevapları hazır bir oyunla uygulayacaksın: Oyuncu kedi, hedef elma, kazanma skor 3, kaybetme can 0.

### Hazır olan
Sahnede açık mavi arka plan, solda alt tarafta bir kedi ve üç elma var. Kedi henüz yürümüyor, skor ve can ayarlanmamış, elmalara dokunmak hiçbir şey yapmıyor.

### Blokları kur
1. **Denetleyici** kategorisinden `[kedi] oyuncu tuşlarıyla [dört yöne] hareket etsin, hız [60]` bloğunu `oyun başlayınca` bloğunun en altına tak. Kedi artık ok tuşlarıyla yürüyor.
2. **Oyun** kategorisinden `skoru [0] yap` ve `canı [3] yap` bloklarını aynı yere ekle. Oyun başlarken sayaçlar tanımlı olsun.
3. **Sprite** kategorisinden `bir [Oyuncu] sprite'ı bir [Yiyecek] sprite'ına çarpınca` olayını kur.
4. Olayın içine: `skoru [1] değiştir`, `[puan] melodisini çal`, `[diğer sprite] sprite'ını sil`.
5. En alta **Mantık** kategorisinden `eğer [skor] ≥ [3] ise` bloğunu koy. (`skor` bloğu **Oyun** kategorisinde.) İçine `ekranda [Kazandın!] yaz, [2] saniye` ve `oyunu bitir: [kazandın]` bloklarını tak.
6. ↺ bas. Elmaları topla. Üçüncüde "Kazandın!" yazıp oyun bitiyor.

Beklenen sonuç: Beş hedefin hepsi ✓. Kedi yürüyor, skor ve can başlangıçta ayarlı, elmalar yenince kayboluyor ve üç elma sonunda oyun kazanılıyor.

### Nasıl çalışıyor?
- Kazanma ve kaybetme birer **kural**dır. Kazanma kuralını biz yazdık (`eğer skor ≥ 3`). Kaybetme kuralını yazmazsak oyun, can 0 olunca kendiliğinden kaybedilir.
- Skor ve can değişkenleri oyunun kendi sayaçlarıdır; ekranda sol üstte skor, sağ üstte kalpler olarak görünürler.
- Çarpışma olayı üç işi bir arada yapıyor: puan verir, ses çalar, elmayı yok eder. Bir olayın içine istediğin kadar blok koyabilirsin.
- İskelet tamam olunca üstüne düşman, harita, zaman gibi parçalar eklemek kolaydır.

### Dene
1. Elma sayısını artır: `yeni [Elma] sprite'ı, türü [Yiyecek]` ile yeni elmalar ekle. Kazanma skorunu da buna göre yükselt.
2. Elma yerine **Kiraz** ya da **Mantar** kullan. Yeni elmaları hangi resimle değiştirirsen çarpışma kuralı etkilenir mi?
3. Ekrana bir tehlike ekle (`yeni [Hayalet] sprite'ı, türü [Düşman]`) ve `bir [Oyuncu] sprite'ı bir [Düşman] sprite'ına çarpınca` olayında canı azalt.

### Sık yapılan hatalar
- Kazanma kontrolünü çarpışma olayının dışına koymak: skor değişir ama kural hiç sorulmaz, oyun bitmez.
- `eğer skor ≥ 3` yerine `skor = 3` yazıp skoru 1'den fazla artırmak: skor 3'ü atlayıp 4 olursa kazanma hiç tetiklenmez. `≥` daha güvenlidir.
- Elmayı silmemek: yenen elma sahnede görünmeye devam eder, oyun yenmemiş gibi görünür.
- Başlangıç skorunu ve canı yazmamak: oyun yine çalışır, ama programı okuyan kişi başlangıç değerlerini göremez. Başlangıç değerlerini açıkça yazmak iyi bir alışkanlıktır.

## Konuşalım
Beş soruluk kartta en zor cevap hangisiydi? Bir oyun fikrin olsa, hangi soruyu cevaplamadan başlamak seni en çok zorlardı?
