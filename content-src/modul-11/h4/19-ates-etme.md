# Ateş etme: lazerle vur
süre: 25

## Merak
Uzay oyunlarında gemi bir tuşa basınca lazer çıkar ve düşman patlar. Ekranda bir "lazer" nesnesi birden nasıl doğuyor? Kim onu hareket ettiriyor? Bu derste A düğmesine her basışta yeni bir mermi sprite'ı yaratacak ve onu düşmanın üstüne göndereceksin.

## Etkinlik
Sahnede gece gökyüzü, altta bir uzay gemisi ve üstte duran bir uzaylı var. Gemi sağa-sola ok tuşlarıyla hareket ediyor ve ekranda kalıyor. Skor 0'dan başlıyor. Başlangıç projesi hazır gelir; ateş etme sende.

### Mermi de bir sprite
Lazer, hareket eden küçük bir sprite'tır. Ona **Mermi** türünü veririz. Böylece "bir Mermi sprite'ı bir Düşman sprite'ına çarpınca" gibi bir kural yazabiliriz.

### Blokları kur: lazeri çıkar
1. **Değişken** kategorisinde **Değişken oluştur…** düğmesine bas ve `lazer` adını ver.
2. **Denetleyici** kategorisinden `[A] düğmesine [basılınca]` bloğunu al ve çalışma alanına bırak.
3. **Değişken** kategorisinden `[lazer] değişkenini [ ] yap` bloğunu al ve bu olayın içine tak. Değer kutusuna **Sprite** kategorisinden `yeni [resim] sprite'ı, türü [tür]` bloğunu tak. Resim listesinden **Lazer**'i, tür listesinden **Mermi**'yi seç.
4. **Sprite** kategorisinden `[bu sprite] konumu x [80] y [60]` bloğunu al ve altına tak. `bu sprite` yerine `lazer` koy.
5. x kutusuna `[gemi] x konumu` bloğunu tak (**Sprite** kategorisindeki `[bu sprite] [x konumu]` bloğunu al, sprite olarak `gemi`'yi seç). y kutusuna **Matematik** kategorisinden bir çıkarma bloğu (`[ ] - [ ]`) tak: soluna `gemi y konumu`, sağına 12 koy. Lazer böylece geminin burnundan çıkar.
6. **Hareket** kategorisinden `[lazer] hızı x [0] y [-140]` bloğunu altına tak. Eksi y yukarı demektir.
7. **Sprite** kategorisinden `[lazer] [dünyadan çıkınca silinsin]: [evet]` bloğunu ekle. Böylece ekranın üstünden çıkan lazerler silinir ve sahne dolmaz.
8. ↺ bas ve boşluk (A) tuşuna bas. Gemiden yukarı doğru lazerler çıkıyor.

### Blokları kur: vur
9. **Sprite** kategorisinden `bir [Mermi] sprite'ı bir [Düşman] sprite'ına çarpınca` olayını al.
10. İçine sırayla: **Oyun** kategorisinden `skoru [10] değiştir`; **Ses** kategorisinden `[patlama] melodisini çal`; **Sprite** kategorisinden `[diğer sprite] patlayıp yok olsun` ve `[bu sprite] sprite'ını sil`.
11. ↺ bas. Gemiyi uzaylının altına getirip boşluk tuşuna bas: uzaylı patlıyor, skor 10 oluyor.

Beklenen sonuç: A'ya basınca yukarı giden bir lazer çıkıyor, uzaylıyı vurunca uzaylı patlıyor, lazer siliniyor ve skor artıyor.

### Nasıl çalışıyor?
- A düğmesine her basış olayı bir kez çalıştırır. Yani her basış yepyeni bir mermi sprite'ı yaratır. Düğmeyi basılı tutmak seri atış yapmaz.
- `diğer sprite` ve `bu sprite` çarpışma olayında sırayla ikinci ve birinci türdeki sprite'tır. Biz "Mermi çarpınca Düşman" yazdık: `bu sprite` lazer, `diğer sprite` uzaylı.
- Çarpışma olayı iki sprite üst üste geldikleri anda bir kez çalışır. Lazeri silmezsen, uzaylı patlasa bile lazer yoluna devam eder.
- Hız -140 demek saniyede 140 piksel yukarı. Geminin burnundan uzaylının yerine yaklaşık yarım saniyede ulaşır.

### Dene
1. Lazerin hızını -60 yap: daha yavaş ama daha kolay gören bir lazer. Hızı -300 yap: çok hızlı lazer uzaylıyı hiç kaçırmıyor mu?
2. Atışı B düğmesine bağla: **Denetleyici** kategorisinde `[B] düğmesine [basılınca]` var.
3. Gemi iki lazer atsın: aynı olayın içinde ikinci bir lazer sprite'ı yarat, x konumunu gemiden 6 piksel sola ve 6 piksel sağa kaydır.
4. Uzaylıya hız ver: `uzayli hızı x 30 y 0` ve `sekmeli: evet` ayarı ekle. Hareketli hedefi vurmak daha eğlenceli.

### Sık yapılan hatalar
- Mermi türünü `Nesne` bırakmak: çarpışma olayı "Mermi" türünü beklediği için hiç çalışmaz.
- Lazerin hızını 0 bırakmak: lazer gemiden çıkar ama yerinde kalır.
- Lazeri hiç silmemek: ekranda yığılır. Yukarı çıkanlar için `dünyadan çıkınca silinsin`, vuranlar için `sil` kullan.
- Çarpışma olayını, yani şapkalı bloğu, başka bir olayın içine koymak: olaylar yalnız tek başlarına çalışma alanında durur.

## Konuşalım
Oyuncu saniyede 20 kez A'ya bassaydı ekranda kaç lazer olurdu? Gerçek oyunlar atış hızını nasıl sınırlar?
