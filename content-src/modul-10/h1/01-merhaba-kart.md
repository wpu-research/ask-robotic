# Merhaba, Mikro Kart
süre: 15

## Merak
Avucuna sığacak kadar küçük bir bilgisayar düşün. Ekranı sadece 25 küçük ışıktan oluşuyor, yine de yazı yazabiliyor, şarkı çalabiliyor, sana cevap verebiliyor. Bu kartı bloklarla programlayacaksın. Peki 25 ışıkla bir yazı nasıl ekrana sığar?

## Etkinlik
### Sanal kartla tanış
Bu modülde **sanal Mikro Kart** ile çalışacaksın. Kart tamamen bilgisayarın içinde yaşar; kablo, pil ya da gerçek bir parça yok. Ekranda gördüğün her şeyi fareyle ya da parmağınla kullanırsın.

Kartın şu parçaları var:

| Parça | Ne işe yarar? |
|---|---|
| LED ekranı | 5 sütun x 5 satır, toplam 25 küçük ışık |
| A ve B düğmeleri | Kartın iki yanında. Basınca programa haber verir |
| A+B düğmesi | İkisine birlikte basmak için |
| Logo (yıldız) | Dokununca programa haber veren bir yüzey |
| P0, P1, P2 | Kartın altındaki üç bağlantı noktası (sonra kullanacağız) |

Kartın sağında bir kontrol paneli vardır. Orada sallama, eğme, ışık, sıcaklık gibi şeyleri sen değiştirirsin. Onları da ilerleyen derslerde kullanacağız.

### Editörün parçaları
- **Üst çubuk:** ▶ **Çalıştır**, ■ **Durdur**, ↺ **Sıfırla** düğmeleri burada. Ayrıca **Başa dön** (dersin başlangıç haline döner), **Dışa aktar** ve **İçe aktar** var.
- **Hedefler kutusu:** Bu dersin görevleri. Bir görevi başardıkça yanındaki kutuya ✓ işareti gelir.
- **Blok kutusu:** Solda renkli kategoriler. Bu derste yalnızca **Temel** kategorisini kullanacaksın.
- **Sekmeler:** **Bloklar**, **JavaScript**, **Python**. Son ikisinde bloklarının yazılı kodunu görürsün. Orada yazı değiştiremezsin, sadece okursun.

### Program: Merhaba
Ekranda zaten bir **başlangıçta** bloğu duruyor. Bu blok, programı başlattığında bir kez çalışır. Bütün programlar böyle bir başlık bloğunun içinde yaşar.

1. Blok kutusunda **Temel** kategorisine tıkla.
2. **yazıyı göster [Merhaba!]** bloğunu tutup **başlangıçta** bloğunun içine sürükle. Bırakınca içeri oturduğunu göreceksin.
3. Bloktaki yazıya tıkla ve kendi adını yaz. İstersen "Merhaba" olarak bırak.
4. **Temel** kategorisinden **sayıyı göster [0]** bloğunu al ve yazı bloğunun hemen altına tak.
5. Sayı kutusuna 7 yaz.
6. ▶ **Çalıştır** düğmesine bas.

### Beklenen sonuç
Kartın ekranında yazı sağdan sola doğru kayar. "Merhaba" gibi 7 harfli bir yazı yaklaşık 4 saniye sürer. Yazı bitince ekran söner, sonra ortada 7 rakamı yarım saniye kadar görünür. Hedefler kutusundaki üç görevde de ✓ işareti olmalı.

### Nasıl çalışıyor?
- Bloklar **yukarıdan aşağıya**, sırayla çalışır.
- Kayan yazı bitmeden bir sonraki blok başlamaz. Kart, yazıyı bitirene kadar bekler.
- Tek bir harf ya da tek basamaklı sayı kaymaz. Ekranın ortasında kısa süre durur. İki basamaklı bir sayı (örneğin 25) ise yazı gibi kayar.
- **JavaScript** sekmesine bak: `card.onStart(...)` satırının içinde `screen.showText("Merhaba")` ve `screen.showNumber(7)` yazıyor. Bloklarının kod hâli bu. **Python** sekmesinde aynı program başka bir dille yazılmış olarak durur.

### Dene
1. Yazıyı değiştir ve ▶ düğmesine yeniden bas. Kayma ne kadar sürdü? Uzun yazıyla kısa yazıyı karşılaştır.
2. Sayı bloğuna 25 yaz. Tek basamaklı sayıdan farkı ne?
3. İki **yazıyı göster** bloğunu alt alta koy. Hangisi önce görünüyor?

### Sık yapılan hatalar
- **Bloğu başlangıçta'nın dışına bırakmak.** Bir başlık bloğuna bağlı olmayan blok yığını çalışmaz, soluk görünür. Bloğu başlangıçta'nın içine taşı.
- **Değiştirdikten sonra ▶ düğmesine basmamak.** Program çalışırken yaptığın değişiklik kendiliğinden uygulanmaz. Ekranda "Değişiklikler için ▶ düğmesine bas" notu çıkar.
- **Programı bitirmeden sonuç beklemek.** Kayan yazı bitmeden sayı görünmez. Biraz bekle.

## Konuşalım
Kartın ekranı yalnızca 5 sütun genişliğinde. Uzun bir yazıyı küçük ekranda göstermenin kayma dışında başka yolları olur mu? Sence neden bir harfi kaydırmak yerine ortada tutuyoruz?
