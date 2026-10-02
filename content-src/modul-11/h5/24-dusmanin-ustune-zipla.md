# Düşmanın üstüne zıpla
süre: 25

## Merak
Platform oyunlarında bir düşmana iki türlü değebilirsin: üstünden zıplayarak (o zaman düşman yenilir) ya da yanından yürüyerek (o zaman sen yaralanırsın). Oyun bu ikisini nasıl ayırt ediyor? Cevap: yöne bakıyor. Düşüyor muyum? Düşmanın üstünde miyim?

## Etkinlik
Zemin, kahraman ve haritanın sağ ucunda gidip gelen bir balçık düşman hazır. Harita ekrandan geniş; kamera kahramanı izliyor, balçığa doğru yürümen gerekiyor. Düşman kenara ya da duvara gelince yön değiştiriyor. Skor 0, can 3. Kahraman balçığa dokununca henüz hiçbir şey olmuyor.

### İki ölçüt
Üstten çarpıp çarpmadığını iki şeye bakarak anlarız:
1. Kahraman aşağı doğru hareket ediyor mu? (y hızı pozitif, örneğin 10'dan büyük)
2. Kahramanın y konumu, düşmanın y konumundan biraz küçük mü? (Kahraman düşmanın biraz **üstünde**.) y yukarıda küçük, aşağıda büyüktür.

İkisi birden doğruysa ezme, değilse yan çarpma.

### Blokları kur
1. **Sprite** kategorisinden `bir [Oyuncu] sprite'ı bir [Düşman] sprite'ına çarpınca` olayını al.
2. İçine **Mantık** kategorisinden iki kollu `eğer ... ise ... değilse ...` bloğunu koy.
3. Koşul için **Mantık** kategorisinden bir `[ ] ve [ ]` bloğu al. Sol tarafına `[ ] > [ ]` karşılaştırma bloğu: soluna `[bu sprite] [y hızı]`, sağına 10. Sağ tarafına `[ ] < [ ]` karşılaştırma bloğu: soluna `[bu sprite] [y konumu]`, sağına bir çıkarma bloğu (`[ ] - [ ]`): soluna `[diğer sprite] [y konumu]`, sağına 4.
4. `ise` kolu (ezme): `[diğer sprite] patlayıp yok olsun`; `skoru [5] değiştir`; `[bu sprite] hızı x [bu sprite x hızı] y [-150]` (kahraman biraz yukarı seksin); `[patlama] melodisini çal`.
5. `değilse` kolu (yan çarpma): `canı [-1] değiştir`; `ekranı [250] ms salla`; `[bu sprite] sprite'ını sütun [2] satır [5] karosuna koy`; `[bu sprite] hızı x [0] y [0]`.
6. ↺ bas. Düşmanın üstüne zıpla: balçık patlıyor, skor 5 artıyor ve kahraman seksiyor. Yandan yürüyüp çarp: can azalıyor.

Beklenen sonuç: Üstten zıplayınca balçık yenilir ve can azalmaz; yandan çarpınca kahraman başa dönüp can kaybeder. Dört hedef ✓.

### Nasıl çalışıyor?
- Çarpışma olayında `bu sprite` birinci türdeki (kahraman), `diğer sprite` ikincideki (balçık) sprite'tır.
- Kahraman düşerken y hızı pozitiftir. Yerde yürürken y hızı 0'dır, bu yüzden "hız > 10" koşulu yan çarpmayı eler.
- Kahramanın y'si düşmanınkinden küçükse, kahraman düşmanın yukarısındadır.
- Düşmanın hareketi hazır geliyor: yerçekimi, yan hız ve duvara gelince ters çevirme. Bunlar `bir [Düşman] sprite'ı oluşunca` ve `her karede` olaylarındadır; bu olaylar her düşman için işler.
- Etkinlik, kontrol için sahneye ayrı bir balçık koyar ve kahramanı üstüne düşürür; sonra yan çarpmayı da dener.

### Dene
1. Ezme puanını 10 yap. Seken kahramanın hızını -250'ye çıkar: böylece düşman ezince yüksek bir zıplama alır.
2. Haritada ekstra bir düşman daha oluştur (`yeni [Balçık] sprite'ı, türü [Düşman]`) ve ezilebildiğini doğrula.
3. Ezme koşuluna "y hızı > 10" yerine "y hızı > 100" koy. Ne değişiyor? Hangisi oyunu daha adil kılar?

### Sık yapılan hatalar
- Yalnız "y hızı > 10" koşulu kullanmak: kahraman düşmanın yanından düşerken değse de düşman ölür. İkinci ölçüt (konum) bunu önler.
- Çıkarmada sprite sırasını ters yazmak: `kahraman y < balçık y - 4` yerine `balçık y < kahraman y - 4` yazarsan düşman üstte olduğunda ezme sayılır.
- Can azaltmayı `ise` koluna koymak: ezerken de can kaybedersin.
- `diğer sprite`'ı silmeyi unutmak: ezilen balçık ekranda kalır ve ezmeye devam edersin.

## Konuşalım
"Hız > 10 ve üstündeyim" kuralı oyuncuya adil geliyor mu? Bazen yandan değip yine de ezmiş sayılırsan ya da ezmişken can kaybedersen oyun sana nasıl hissettirir? Çarpışma kuralını nasıl daha cömert ya da daha sert yapabilirsin?
