# Tam oyun 2: Labirent kaçışı
süre: 30

## Merak
Eski bir hazine odasında kapı kilitli. Anahtar labirentin öbür ucunda ve seni duvarlardan geçebilen bir hayalet kovalıyor. Anahtarı alıp kapıya ulaşırsan kazanırsın. Ama oyun anahtarı alıp almadığını nereden bilecek? Bu derste oyuna bir "hafıza" ekleyeceksin.

## Etkinlik
### Hazır olan
20 x 9 karoluk bir labirent yüklü. Kedi sol üstte başlıyor, ok tuşlarıyla yürüyor ve kamera onu izliyor. Sağ üstte bir anahtar, sağ altta bir kapı var. Labirentin ortasından bir hayalet kediyi takip ediyor; hayalet duvarlardan geçiyor. Skor 0, can 3. `anahtarVar` adlı bir değişken 0 olarak hazır.

### Hafıza: durum değişkeni
`anahtarVar` değişkeni oyunun "anahtar alındı mı?" sorusunun cevabını tutar: 0 hayır, 1 evet. Bu tür değişkenlere **bayrak** denir.

### Blokları kur: anahtar
1. `bir [Oyuncu] sprite'ı [Anahtar] karosuna dokununca` olayı kur.
2. İçine `sütun [olay karosunun sütunu] satır [olay karosunun satırı] karosunu boşalt`, `[anahtarVar] değişkenini [1] yap`, `skoru [10] değiştir` ve `[puan] melodisini çal` ekle.
3. ↺ bas. Anahtar karosuna git: anahtar kayboluyor.

### Blokları kur: kapı
4. `bir [Oyuncu] sprite'ı [Kapı] karosuna dokununca` olayı kur.
5. İçine iki kollu `eğer ... ise ... değilse ...` bloğu koy. Koşul: `[anahtarVar] = [1]`.
6. `ise` kolu: `ekranda [Kaçtın!] yaz, [2] saniye`, `[zafer] melodisini çal`, `oyunu bitir: [kazandın]`.
7. `değilse` kolu: `ekranda [Kilitli!] yaz, [1] saniye`.
8. ↺ bas. Önce anahtarsız kapıya git: "Kilitli!" yazıyor. Sonra anahtarı al ve kapıya dön: oyun kazanılıyor.

### Blokları kur: hayalet
9. `bir [Oyuncu] sprite'ı bir [Düşman] sprite'ına çarpınca` olayı kur. İçine `canı [-1] değiştir`, `ekranı [250] ms salla`, `[bu sprite] sprite'ını sütun [1] satır [1] karosuna koy` ve `[diğer sprite] sprite'ını sütun [10] satır [5] karosuna koy` yaz. Hayalet kediyi yakalarsa ikisi de başa dönüyor.
10. ↺ bas ve tam oyunu oyna.

Beklenen sonuç: Beş hedefin hepsi ✓. Anahtar toplanıyor, kapı anahtarsız açılmıyor, anahtarla açılıyor, hayalet kediyi kovalıyor ve yakalarsa can azalıyor.

### Nasıl çalışıyor?
- Bayrak değişkeni (anahtarVar) iki olay arasındaki köprüdür: anahtar olayı yazar, kapı olayı okur.
- Kapıdaki `eğer` iki yolu ayırır: anahtar varsa kazan, yoksa uyar. `değilse` kolu olmasaydı kapıya anahtarsız gitmek hiçbir şey söylemezdi.
- Hayalet "duvarlardan geçsin" ayarıyla yapıldığı için labirent onu engellemez; hız 14, kedi hızı 60 olduğu için kedi kovalamacadan kaçabilir.
- Harita kenarlarındaki duvarlar kedi için engel, hayalet için değil.
- Hayalet kediyi yakalayınca ikisini de başlangıç yerlerine koyuyoruz. Böylece oyuncu hemen yeniden yakalanmaz ve nefes alır.

### Dene
1. Hayaleti yavaşlat (10) ve hızlandır (30). Hangisi dengeli?
2. İkinci bir anahtar ve ikinci bir kapı ekle: **Harita** sekmesinde karoları boya. İki bayrak değişkeni kullan.
3. Anahtar alınınca "Anahtarı aldın!" mesajı yaz.
4. Hayalet kediyi 3 kez yakalarsa oyun kaybedilir; bunu `can bitince` olayına `oyunu bitir: [kaybettin]` yazarak kendin belirle.

### Sık yapılan hatalar
- `anahtarVar` değişkenini anahtarı alırken 1 yapmamak: kapı hep "Kilitli!" der.
- Kapıda `eğer anahtarVar = 1` kontrolünü yanlış değişkenle yazmak: değişken adları birbirine benzerse bayrak okunmaz.
- Hazır gelen `[anahtarVar] değişkenini [0] yap` bloğunu silmek: bayrağın ilk değeri belirsiz kalır. Bayrağı hep başlangıçta açıkça 0 yap.
- Kediyi başa koyarken sütun/satır yerine piksel yazmak: blok karo numarası ister.

## Konuşalım
Bayrak değişkenleri başka hangi oyun kurallarında işe yarar? Örneğin "çift zıplama hakkı var mı?", "boss yenildi mi?", "gizli oda bulundu mu?" gibi sorular için hangi bayraklar gerekir?
