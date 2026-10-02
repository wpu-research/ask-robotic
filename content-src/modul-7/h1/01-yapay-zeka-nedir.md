# Yapay zekâ, makine öğrenmesi, dil modeli
süre: 20

## Merak
Bir yapay zekâ asistanına "robotum duvara çarpıyor" yazarsın ve düzgün bir cevap alırsın. Peki bu cevabı veren şey seni anlıyor mu, yoksa çok iyi tahmin mi ediyor? Bu modülde bu sorunun cevabını sezgiyle değil, kendi yazdığın küçük araçlarla arayacağız.

## Etkinlik
Bu ders okuma dersidir; etkinlik aracı yoktur. Önce modülün nasıl işleyeceğini bil: araçlar tarayıcında çalışır, hesaplar gerçektir. Bir dil modelinin yerini tutan adımlar ise her zaman "simülasyon" ya da "şablon" diye etiketlenir. Claude gibi gerçek modelleri bu portalda çalıştırmıyoruz; onların dayandığı fikirleri küçültülmüş hâlleriyle kuruyoruz.

### Üç kavram
- **Yapay zekâ:** İnsanın zekâ gerektiren dediği işleri yapan sistemlerin geniş adı. Bir kural listesi de buna girebilir.
- **Makine öğrenmesi:** Kuralları elle yazmak yerine örneklerden öğrenen yöntemler. Örnek verirsin, sistem örüntüyü kendi bulur.
- **Dil modeli:** Metin üzerinde öğrenen model. Temel görevi, o ana kadar yazılanlara bakıp sonraki parçayı (token) tahmin etmektir. Claude gibi büyük dil modelleri bu fikrin çok büyük ölçekli hâlidir.

### Neden "tahmin" diyoruz?
Bir dil modeli, eğitim sırasında çok miktarda metinden hangi parçaların hangilerini izlediğini öğrenir. Cevap verirken bir sonraki parçanın olasılıklarını hesaplar, birini seçer, sonra yine hesaplar. Bu basit döngü, ölçek büyüdükçe şaşırtıcı yeteneklere yol açar. Ama aynı döngü, kendinden emin görünen yanlış cümleler de üretebilir. Bunu 36. derste (halüsinasyon) ayrıntılı göreceksin.

### Bu modülün yol haritası
1. Hafta 1-3: modelin metni nasıl gördüğü, sıcaklık, bağlam, prompt yazımı.
2. Hafta 4: modeli (ve kendi sistemini) test vakalarıyla ölçmek, yani eval.
3. Hafta 5: bilgi getirme, yani embedding ve RAG.
4. Hafta 6: araç kullanımı ve ajan döngüsü.
5. Hafta 7: kod yazan yapay zekâ, prompt injection ve güvenlik.
6. Hafta 8: sorumlu kullanım ve robotikle bağ.

### Kendini sına
1. "Dil modeli bir kural listesidir" cümlesi neden eksik ya da yanlıştır?
2. Bir modelin temel görevi tek cümleyle nedir?
3. Bu portalda "model adımı" gördüğünde ne anlaman gerekir?

## Konuşalım
Bir dil modeli sonraki parçayı tahmin ediyorsa, "anlıyor" demek doğru mudur? Anlamak için bir şeyin neye ihtiyacı olduğunu düşün ve arkadaşınla tartış.
