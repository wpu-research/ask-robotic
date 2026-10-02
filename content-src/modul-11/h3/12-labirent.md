# Labirentten çık
süre: 22

## Merak
Labirentler çok eski bir oyun fikridir. Duvarların arasında yol bulursun ve çıkışa ulaşırsın. Bilgisayar, "çıkışa ulaştın!" demek için neye bakar? Bir sprite'ın bir karoya dokunduğunu nasıl anlar?

## Etkinlik
Labirent haritası hazır. Kedi (küçük kedi) başlangıç karosunda ve ok tuşlarıyla yürüyor. Duvarlar tuğla. Çıkış kapısı labirentin sağ alt köşesinde. Ama kapıya girince hiçbir şey olmuyor.

### Karoya dokunma olayı
Sprite'lar birbirine çarpabildiği gibi karolara da dokunabilir. `bir [Oyuncu] sprite'ı [Kapı] karosuna dokununca` bloğu, bir Oyuncu bir kapı karosuna değdiği anda içindeki blokları **bir kez** çalıştırır.

### Önce incele
1. ▶ düğmesine bas ve labirenti bir kez yürümeyi dene. Tuğla duvarlardan geçemezsin.
2. **Harita** sekmesine geç ve labirentin yolunu incele. Çıkış nerede?
3. Karo takımında iki karo var: tuğla duvar (duvar kutusu işaretli) ve kapı (işaretsiz). Kapının işaretsiz olması önemli: sprite kapıya girebilsin, çünkü olay "dokununca" çalışır.

### Blokları kur
1. **Bloklar** sekmesine dön. **Sahne / Harita** kategorisinden `bir [Oyuncu] sprite'ı [Kapı] karosuna dokununca` olay bloğunu çalışma alanına bırak. Resim listesinden kapıyı seç.
2. İçine **Oyun** kategorisinden `ekranda [Çıkışı buldun!] yaz, [2] saniye` bloğunu tak.
3. **Ses** kategorisinden `[zafer] melodisini çal` bloğunu ekle.
4. En alta **Oyun** kategorisinden `oyunu bitir: [kazandın]` bloğunu ekle.
5. ▶ düğmesine bas. Labirentin yolunu bul ve kapıya ulaş. Mesaj çıkar ve oyun kazanılır.

Beklenen sonuç: Kedi kapı karosuna dokununca mesaj yazılır, zafer melodisi çalar ve oyun kazanılır.

### Nasıl çalışıyor?
- Olay, kedinin kapıya **ilk değdiği** anda çalışır. Kapının üstünde durmaya devam etmen onu tekrar tekrar çalıştırmaz.
- Duvarları karo takımındaki **duvar** kutusu belirler. Aynı tuğla resmini duvar olmayan bir karo olarak da kullanabilirsin.
- Labirent küçük bir kedi (8 x 8 piksel) kullanır. Koridorlar 16 piksel genişliğinde olduğu için rahat sığar. 16 x 16'lık bir sprite çok sıkışırdı.
- Arka plan `arka planı [Zemin] resmiyle döşe` ile bir zemin resmiyle kaplanmış. Haritada boş bırakılan yerlerde bu zemin görünür.

### Dene
1. Skor ekle: `oyun başlayınca` içine `skoru [0] yap`, kapı olayına `skoru [100] değiştir` koy.
2. Bir süre sayacı ekle: mesajı `birleştir` bloğuyla yap: `[Çıkış: ]` ve `geçen süre (sn)`. Kaç saniyede çıktığını yaz.
3. Harita sekmesinde labirentin içine yeni bir duvar çiz ve yolu uzat. Çıkış hâlâ ulaşılabilir mi?

### Sık yapılan hatalar
- Olayda **kapı** karosunu seçmeyi unutursan yanlış karo için bekler.
- Kapı karosunun **duvar** kutusu işaretliyse kedi kapıya giremez. İşareti kaldır.
- Labirentin yolu tamamen tıkanırsa çıkışa hiç ulaşılamaz. Düzenlediğin labirenti kendin oyna.
- Oyunu bitirmeyi unutursan mesaj çıkar ama oyun devam eder.

## Konuşalım
Bir labirent nasıl zor ya da kolay olur? Yol sayısı mı, çıkmaz sokaklar mı, süre mi? Kendi labirentini tasarlasan çıkış nerede olurdu?
