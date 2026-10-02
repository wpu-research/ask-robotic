# Cila ve hata ayıklama: bozuk oyunu onar
süre: 25

## Merak
Her yazılımcı bir gün şunu yaşar: oyun çalışıyor ama bir yerde bir şey yanlış, ama nerede? Hata ayıklama bir dedektif işidir: belirtiyi yakala, ipucuna bak, suçluyu bul. Bu derste bozuk bir oyunun üç hatasını bulup düzelteceksin, sonra oyunu parlatacaksın.

## Etkinlik
### Bozuk oyun
Bir meyve yakalama oyunu: sepet (kedi) altta, meyveler yukarıdan düşüyor. Ama oyunu oynayınca üç şey ters:
1. **Hata 1:** Meyveyi yakalayınca skor düşüyor, artmıyor.
2. **Hata 2:** Yakaladığın meyve ekranda kalıyor ve düşmeye devam ediyor.
3. **Hata 3:** Bir meyve ekranın altına inince oyun hemen bitiyor; üç can bir anda gidiyor.

### Dedektif yöntemi
1. **Belirtiyi gör:** Ne yanlış? (skor azalıyor)
2. **Olayı bul:** Hangi olayda oluyor? (meyve sepete çarpınca)
3. **Bloğu bul:** O olayın içinde hangi blok bunu yapıyor? (`skoru [-1] değiştir`)
4. **Düzelt ve dene:** Bloğu değiştir, ↺ bas, belirtinin kaybolduğunu doğrula.
Program hata verirse Hedefler panelinde bir uyarı çıkar ve **Bloğu göster** düğmesi sorunlu bloğu işaretler. JavaScript sekmesinde programının yazılı hâlini de okuyabilirsin (düzenleyemezsin).

### Hataları düzelt
1. **Hata 1:** Yakalama olayında `skoru [-1] değiştir` bloğunu bul ve sayıyı 1 yap.
2. **Hata 2:** Aynı olayın en altına `[diğer sprite] sprite'ını sil` bloğunu ekle. Yakalanan meyve yok oluyor.
3. **Hata 3:** `her karede` olayındaki `her [Yiyecek] sprite'ı için` döngüsüne bak. İçinde `eğer [bu sprite y konumu] > [116] ise canı [-1] değiştir` var ama meyveyi silmiyor. Meyve aşağıda kalıyor ve her karede (saniyede 60 kez) bir can götürüyor. `eğer`in içine `[bu sprite] sprite'ını sil` ekle.
4. ↺ bas ve oyna. Skor artıyor, yakalanan meyve kayboluyor, kaçan meyve yalnız bir can götürüyor.

### Cila
5. Yakalama olayına **Ses** kategorisinden `[puan] melodisini çal` ekle.
6. Kaçırma kuralına (`eğer ... > 116`) `ekranı [200] ms salla` ekle.
7. Oyunu bir kez daha oyna. Artık yakalamak da, kaçırmak da hissediliyor.

Beklenen sonuç: Beş hedefin hepsi ✓. Yakalayınca skor artıyor ve ses çalıyor, yakalanan meyve kayboluyor, kaçan meyve yalnız bir can götürüyor ve ekran sallanıyor.

### Nasıl çalışıyor?
- Hata 3'ün sebebi, kaçırma kuralının `her karede` olayında olması. Bu olay saniyede 60 kez çalışır; içinde meyveyi silmezsen aynı meyve için can her karede yeniden düşer.
- Çarpışma olayı ise yalnız bir kez çalışır; meyveyi silmemek skoru tekrar vermez, ama meyve sahnede kalır.
- Ses ve sarsıntı oyunun kurallarına dokunmaz; yalnızca oyuncuya "bir şey oldu" der. Buna **cila** denir. İyi cila küçük ama etkilidir.
- Bu hatalar gerçekten sık görülür: işaret hatası, silmeyi unutmak, tekrar eden kuralı sınırlamamak.

### Dene
1. Meyve kaçırınca `[kayıp] melodisini çal` ekle.
2. Skor 10 olunca oyunu kazanma kuralını ekle (çarpışma olayının içinde `eğer`).
3. Meyveyi yakalayınca bir parçacık efekti göster: **Oyun** kategorisinden `x [80] y [60] noktasında [sarı] patlama` bloğunu kullan. x ve y için `[diğer sprite] [x konumu]` ve `[diğer sprite] [y konumu]` kullan.

### Sık yapılan hatalar
- Hata 3'ü "can azaltma" bloğunu silerek çözmek: oyun hatasız ama kaçırmanın cezası kalmaz.
- Hata 1'i düzeltirken olayı baştan yazmaya kalkmak: çoğu zaman tek bir sayıyı ya da işareti değiştirmek yeter.
- Değişikliği yapıp ↺ basmamak: çalışan oyun eski programı kullanır.
- Aynı anda üç değişiklik yapıp hangisinin işe yaradığını anlayamamak: bir şeyi düzelt, dene, sonra diğerine geç.

## Konuşalım
Bir hatayı bulmak için ilk önce neye bakıyorsun? Bir arkadaşının oyununda böyle bir hata olsa, ona hatayı nasıl tarif ederdin ki o da bulabilsin?
