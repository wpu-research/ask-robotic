# Metinleri sayılarla karşılaştır
süre: 30

## Merak
Bir arama kutusuna "ses dalgası" yazdığında, yüz belge arasından en ilgili olanı nasıl bulur? Metni sayılara çevirip sayıları karşılaştırarak. Bu fikir, modern arama ve RAG sistemlerinin temelidir.

## Etkinlik
Bu etkinlik tamamen **Yapay Zekâ Atölyesi**'nde, tarayıcında çalışır. Dış servis, hesap ya da anahtar gerekmez. Sağdaki **Hedefler** listesi yeşile döndükçe ilerlediğini görürsün.

### Vektör nedir?
Bir metni, her terim için bir sayı içeren bir **sayı listesine (vektöre)** çevirebilirsin. Bu araçta iki yöntem var:
- **Kelime sayımı:** Her terimin metinde kaç kez geçtiği.
- **TF-IDF:** Sayıyı, terimin ne kadar nadir olduğuyla çarpar: her belgede geçen terimler (örneğin "sensör") az, nadir terimler (örneğin "servo") çok ağırlık alır.

### Kosinüs benzerliği
İki vektörün arasındaki açının kosinüsüdür: aynı yönde ise 1, hiç ortak terim yoksa 0. Uzunluktan çok **yöne** bakar, bu yüzden uzun ve kısa metinleri adil karşılaştırır.

### Aracı aç
1. **Metin benzerliği** aracında en az iki kelimelik bir sorgu yaz.
2. Yöntemi TF-IDF yap.
3. İlk sonucun "Ultrasonik sensör" belgesi olmasını ve benzerliğin 0,4'ü geçmesini sağla. İpucu: bu belgenin içindeki kelimelere bak.
4. Çubukların nasıl değiştiğini izle; "ortak terimler" satırı eşleşmenin nedenini söyler.

### Nasıl çalışıyor?
- Terimler küçük harfe çevrilir, "ve", "bir" gibi sık bağlaçlar atılır ve kelimelerin ilk beş harfi tutulur (çok basit bir gövdeleme; gerçek Türkçe çözümleyici değil).
- Hesaplar gerçektir. Ama bu bir **anlam** vektörü değil, kelime vektörüdür. Anlamı yakalayan gerçek gömme (embedding) modelleri bundan farklı, öğrenilmiş vektörler kullanır; ortak mantık yine "yakın vektör, yakın anlam"dır.

### Kendini sına
1. İki metnin hiç ortak terimi yoksa kosinüs benzerliği kaçtır?
2. TF-IDF neden "ve" gibi sık geçen terimlere az ağırlık verir?

## Konuşalım
Kendi sorgunla bir belgeyi ilk sıraya çıkarmak için hangi kelimeleri seçtin? Gerçek bir arama motoru bu kelimeleri bilmeden nasıl bulabilirdi?
