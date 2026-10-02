# Bombadan kaç, canını koru
süre: 22

## Merak
Her oyunda bir risk vardır. Hata yaparsan bir şey kaybedersin ve çoğu zaman bu kayıp can ile ölçülür. Bir oyun nasıl "canın bitti" der? Ve bu mesajı gördüğünde oyunun bitmesi için kim karar verir?

## Etkinlik
Meyve yakalama oyununa bomba eklendi. Bombalar da meyveler gibi gökten düşüyor ve türleri **Düşman**. Sepet (kedi) hem meyve hem bombaya değebilir. Meyveye değince skor artıyor, ama bombaya değince hiçbir şey olmuyor. Oyun 3 canla başlıyor.

### Can
Oyunda **can** adlı hazır bir sayı vardır. Ekranın köşesinde kalp olarak gösterilir.
- `canı [3] yap`: canı belirler.
- `canı [-1] değiştir`: cana ekler. Eksi sayı azaltır.
- `can`: canı sayı olarak verir.
- Can **0** olunca oyun kendiliğinden biter. Ama `can bitince` bloğunu kullanırsan karar sende: orada oyunu kendin bitirmelisin.

### Blokları kur
1. Önce oyunu çalıştır ve bomba ile meyve düşüşünü izle. Bombaya değmenin bir etkisi yok.
2. **Sprite** kategorisinden `bir [Oyuncu] sprite'ı bir [Düşman] sprite'ına çarpınca` olayını koy.
3. İçine **Oyun** kategorisinden `canı [-1] değiştir` bloğunu tak.
4. Altına `ekranı [250] ms salla` bloğunu ekle.
5. **Ses** kategorisinden `[patlama] melodisini çal` bloğunu ekle.
6. En alta `[diğer sprite] sprite'ını sil` bloğunu koy (bombayı yut).
7. ▶ düğmesine bas. Bombaya her değişte kalp azalır, ekran sallanır ve bomba yok olur. Üçüncü bombadan sonra "CAN BİTTİ" yazar.
8. Şimdi kendi bitişini yazalım. **Oyun** kategorisinden `can bitince` olay bloğunu getir. İçine `ekranda [Canların bitti!] yaz, [2] saniye`, `[kayıp] melodisini çal` ve `oyunu bitir: [kaybettin]` bloklarını sırayla tak.
9. ↺ düğmesine bas ve üç bombayı yakala. Kendi mesajın çıkar ve oyun kaybedilir.

Beklenen sonuç: Bombaya değince bir can gider, ekran sallanır. Üçüncü bombadan sonra mesajın çıkar ve oyun kaybedilir.

### Nasıl çalışıyor?
- İki çarpışma olayı yan yana çalışabilir. Biri meyve, öteki bomba için bekler. Her olay yalnız kendi türleri değince çalışır.
- `can bitince` olayı canın sıfıra düştüğü anda bir kez çalışır. Bu bloğu yazarsan oyun otomatik bitmez. Oyunu bitirmeyi unutursan oyun sıfır canla devam eder.
- `canı [-1] değiştir` demek "cana -1 ekle" demektir. Can hiçbir zaman 0'ın altına inmez.

### Dene
1. Bomba ceza olarak canı 2 azaltsın.
2. Başlangıç canını 5 yap: `oyun başlayınca` içindeki `canı [3] yap` bloğunu değiştir.
3. Ekran sallanma süresini 100 ve sonra 800 ms yap. Hangisi daha iyi hissettiriyor?

### Sık yapılan hatalar
- Bombayı silmeyi unutursan bomba, sepetin üstünden geçerken bir can götürür ama sonra sahnede düşmeye devam eder. Görüntü kafa karıştırır.
- `can bitince` bloğunun içinde oyunu bitiren blok yoksa oyun sıfır canla çalışmaya devam eder.
- Çarpışma olayında türü yanlış seçersen (ör. Düşman yerine Yiyecek) olay bomba için değil, meyve için çalışır.

## Konuşalım
Bir oyunda "can" yerine başka bir ceza düşünebilir misin? (Mesela zaman kaybı ya da puan azalması.) Hangisi sana daha adil gelir? Çok kolay ya da çok zor bir oyunu bırakmana ne sebep olur?
