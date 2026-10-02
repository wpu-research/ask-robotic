# İlk nota
süre: 18

## Merak
Bir gitarın telini çekince tel titrer ve ses çıkar. Tel ne kadar hızlı titrerse ses o kadar tiz olur. Sanal Mikro Kart'ın hoparlörü de böyle çalışır: ona bir titreşim sayısı verirsin, o da o sesi çalar. Peki kartı Do, Re, Mi çaldırmak için kaç blok gerekir?

## Etkinlik
### Hazırlık
Editörde solda bloklar, sağda sanal kart var. Kartın altındaki paneller arasında **Hoparlör** bölümü de var. Onu aç: orada hangi sesin çaldığı yazar. Sayfada ses duymak için ▶ **Çalıştır** düğmesine bir kez bas; tarayıcılar sesi ancak sen sayfaya dokunduktan sonra açar. Hoparlör bölümündeki **Ses açık** düğmesi sesi kapatıp açar.

### Frekans nedir?
Bir sesin saniyedeki titreşim sayısına **frekans** denir. Birimi **Hz** (hertz) olur. Kart notaları şu frekanslarla çalar:

| Nota | Do | Re | Mi | Fa | Sol | La | Si | Tiz Do |
|---|---|---|---|---|---|---|---|---|
| Hz | 262 | 294 | 330 | 349 | 392 | 440 | 494 | 523 |

**Tiz Do**, **Do**'nun yaklaşık iki katı frekanstadır (262 × 2 = 524). Aynı notanın bir basamak yukarısına "oktav" denir. **Alçak Do** ise 131 Hz'dir, yani Do'nun yarısıdır.

### Yeni bloklar
- **Müzik** kategorisindeki **[Do] notasını [1/4] vuruş çal** bloğu bir nota çalar. Nota bitene kadar bir sonraki bloğa geçmez. Yani iki nota bloğunu alt alta koyarsan notalar sırayla çalar, üst üste binmez.
- **Temel** kategorisindeki **simgeyi göster [kalp]** bloğu ekrana hazır bir çizim koyar. Listeden **nota** simgesini seçebilirsin.

### Adım adım
Editörde **düğme [A] [basılınca]** bloğu hazır duruyor. Hedefler panelinde üç hedef var.

1. **Müzik** kategorisinden **[Do] notasını [1/4] vuruş çal** bloğunu sürükle. **düğme [A] [basılınca]** bloğunun içine bırak.
2. Aynı bloktan iki tane daha al ve altına yapıştır. İkincide listeden **Re**, üçüncüde **Mi** seç.
3. **Temel** kategorisinden **simgeyi göster [kalp]** bloğunu al ve notaların üstüne koy. Listeden **nota** simgesini seç.
4. ▶ **Çalıştır** düğmesine bas. Sonra kartın **A** düğmesine tıkla.

### Beklenen sonuç
A'ya basınca kartın ekranında nota simgesi görünür. Hoparlör bölümünde sırayla **çalan: 262 Hz**, **294 Hz**, **330 Hz** yazar ve (sesin açıksa) üç nota duyulur. Her nota yarım saniye sürer, toplam bir buçuk saniye. Üç hedefin hepsinde ✓ olmalı.

### Nasıl çalışıyor?
- Bloklar yukarıdan aşağı, sırayla çalışır.
- Nota bloğu notayı başlatır ve süresi dolana kadar bekler. Bu yüzden Re, ancak Do bitince başlar.
- **[1/4] vuruş**: notanın ne kadar süreceğini söyler. Kartın tempo değeri başlangıçta dakikada 120 vuruştur. Bu hızda "1/4 vuruş" tam 500 milisaniyedir. Süreyi bir sonraki derste ayrıntılı göreceksin.
- Üstteki **JavaScript** ve **Python** sekmelerine tıklarsan aynı programın kodunu görürsün. Örneğin ilk nota `music.playNote("Do", 1)` olarak yazılır. Bu sekmeler yalnız okumak içindir; programı bloklarla çalıştırırsın.

### Dene
1. İlk notayı **Alçak Do**, sonuncuyu **Tiz Do** yap. Ses nasıl değişti? Hz değerlerini Hoparlör bölümünden oku.
2. Kendi üç notalık zil sesini bul. Hangi sıra sana daha neşeli geliyor?
3. Üç yerine yedi nota koyup Do'dan Si'ye bir merdiven çık.

### Sık yapılan hatalar
- **Blokları başlığın dışında bırakmak.** Nota blokları **düğme [A] [basılınca]** içinde değilse çalışmaz; editörde soluk görünürler.
- **▶ düğmesine basmadan A'ya basmak.** Program önce çalıştırılmalı.
- **Bloğu değiştirip yeniden çalıştırmamak.** Çalışırken bir şeyi değiştirirsen "Değişiklikler için ▶ düğmesine bas" uyarısı çıkar.
- **Sesi duymamak.** Hoparlör bölümünde **Ses açık** yazdığından emin ol. Bilgisayarının sesi de açık olmalı.

## Konuşalım
Do ile Tiz Do arasında ne fark duydun? Hayvanların sesleri (kuş cıvıltısı, kedi miyavı) sence yüksek mi alçak mı frekanslıdır? Neden?
