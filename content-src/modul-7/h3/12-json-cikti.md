# Yapılandırılmış çıktı: JSON
süre: 25

## Merak
Bir program, "bu yorum olumluymuş gibi görünüyor" cümlesini okuyamaz; ama {"duygu": "olumlu"} cümlesini okuyabilir. Modeli bir programın parçası yapmak istiyorsan çıktının düzenli olması gerekir.

## Etkinlik
Bu etkinlik tamamen **Yapay Zekâ Atölyesi**'nde, tarayıcında çalışır. Dış servis, hesap ya da anahtar gerekmez. Sağdaki **Hedefler** listesi yeşile döndükçe ilerlediğini görürsün.

### JSON nedir?
JSON, anahtar-değer çiftlerinden oluşan düzenli bir veri biçimidir: `{"duygu": "olumlu", "konu": "robot dersi"}`. Hemen hemen her programlama dili onu okuyabilir.

### Aracı aç
1. **Prompt denetleyici** aracında görev: bir yorumdan duygu ve konu bilgisini JSON olarak çıkartan prompt.
2. Biçim olarak JSON iste ve anahtar adlarını (duygu, konu) açıkça yaz.
3. Bir örnek çıktı göster.
4. Puanı en az 70'e çıkar.

### Nasıl çalışıyor?
- "Yalnızca JSON ver" demek ve örnek göstermek çoğu zaman işe yarar ama garanti değildir. Model bazen JSON'un önüne açıklama ekleyebilir ya da bir tırnağı unutabilir.
- Bu yüzden uygulamalar çıktıyı **doğrular**: geçerli JSON mu, beklenen anahtarlar var mı? Doğrulama başarısızsa yeniden denenir ya da hata verilir. Araçtaki denetleyici prompt'taki biçim ifadesine bakar; çıktıyı doğrulayan kod ise (örneğin `JSON.parse` ile) ayrı bir adımdır.
- Bazı servisler çıktının şemaya uymasını zorlayan özellikler sunar; ama mantık aynı: modele güvenme, doğrula.

### Dene
1. Aynı prompt'a üçüncü bir anahtar ekle (örneğin "öneri").
2. "JSON dışında hiçbir şey yazma" kısıtını ekle ve puana bak.

### Sık yapılan hatalar
- Örnek çıktıdaki anahtar adları ile talimattaki adların farklı olması.
- Doğrulamayı atlayıp çıktının hep doğru biçimde geleceğini varsaymak.

### Kendini sına
1. Modelin ürettiği JSON'u neden ayrıca doğrulamalısın?
2. Hangi durumlarda serbest metin, hangilerinde JSON tercih edilir?

## Konuşalım
Bir robotun komutunu modelin ürettiği JSON ile vermek mantıklı mıdır? Doğrulama adımında hangi kontrolleri koyardın?
