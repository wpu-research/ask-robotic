# Proje: Gezgin kedi
süre: 30

## Merak
İlk haftanı bitirmek üzeresin. Sahne kurmayı, sprite oluşturmayı, tuşla yürümeyi, düğmeye basınca bir şey yaptırmayı ve sekip duran bir nesne yapmayı öğrendin. Şimdi hepsini tek bir küçük oyuna dönüştürelim. Gezgin kedi çimenlerde dolaşırken sihirli yeteneklerini kullanacak.

## Etkinlik
Projenin yarısı hazır: çimen bir arka plan, ok tuşlarıyla yürüyen ve ekranda kalan bir kedi ve ekranda sekip duran bir yıldız. Eksik olan yetenekleri sen ekleyeceksin.

### Ne yapacaksın?
- A düğmesi: kedi konuşsun ve bir melodi çalsın.
- B düğmesi: ekranda bir patlama olsun ve kısa bir ses çıksın.
- Sonra kendi fikirlerini ekle.

### Önce çalıştır ve incele
1. ▶ düğmesine basıp oyunu çalıştır. Kediyi yürüt, yıldızın sekişini izle.
2. **Bloklar** sekmesinde `oyun başlayınca` bloğunu oku. Hangi blok ne işe yarıyor? Üç yer bul: döşenen arka plan, tuşla hareket ve sekmeli ayar.

### A düğmesi: konuş ve melodi çal
1. **Denetleyici** kategorisinden `[A] düğmesine [basılınca]` olayını çalışma alanına koy.
2. **Sprite** kategorisinden `[kedi] [Merhaba!] desin, [2] saniye` bloğunu içine tak.
3. **Ses** kategorisinden `[başlangıç] melodisini çal` bloğunu ekle.

### B düğmesi: patlama
1. `[B] düğmesine [basılınca]` olayını koy.
2. **Oyun** kategorisinden `x [80] y [60] noktasında [renk] patlama` bloğunu içine tak. Renk olarak sarıyı seç.
3. **Ses** kategorisinden `[300] Hz bip, [120] ms` bloğunu ekle.

### Çalıştır ve dene
1. ↺ düğmesine bas. A ve B tuşlarına bas.
2. Hedefler panelinde yedi madde var. Hepsi yeşil mi?

Beklenen sonuç: Kedi yürür, yıldız sekip durur. A'ya basınca kedi konuşur ve melodi çalar, B'ye basınca ekranda sarı bir patlama olur.

### Nasıl çalışıyor?
Proje, bu haftanın bütün bloklarını birlikte kullanır:
- `oyun başlayınca` olayı sahneyi kurar (ders 1).
- Tuşla hareket ve **ekranda kalsın** ayarı kediyi yürütür (ders 2).
- Düğme olayları kediye yetenek verir (ders 3).
- Hız ve **sekmeli** ayar yıldızı hareket ettirir (ders 4).

### Kendi dokunuşunu kat
Aşağıdakilerden en az ikisini yap. Hedefler bozulmasın, ama istediğin kadar ekleme yapabilirsin.
1. B'ye basınca kedi başka bir resme (ör. **Astronot**) dönüşsün. `[kedi] resmi [resim]` bloğunu kullan.
2. A'ya basınca ekrana bir mesaj yaz: `ekranda [Merhaba!] yaz, [2] saniye`.
3. Patlama olunca ekran sallansın: `ekranı [300] ms salla`.
4. `[A4] notası, [250] ms` ile kendi küçük melodini yaz: arka arkaya üç nota ekle.
5. Yıldızı hızlandır ya da yavaşlat.

### Sık yapılan hatalar
- Bir olay bloğunun içine hiçbir şey takmazsan o düğme hiçbir şey yapmaz.
- Aynı düğme için iki ayrı olay yazarsan ikisi de çalışır. Karışmasın diye bir düğmeye tek olay yaz.
- Patlama bloğundaki x ve y ekranın dışında kalırsa patlamayı göremezsin. 0 ile 160 arasında x, 0 ile 120 arasında y kullan.

## Konuşalım
Oyunun en eğlenceli yeni yeteneği hangisi oldu? Bir arkadaşın bu oyunu oynarken A ve B düğmelerinin ne yaptığını nasıl anlasın? Oyuna bir yönerge mesajı eklesen ne yazardın?
