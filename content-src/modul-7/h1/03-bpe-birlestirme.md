# BPE: parçalar nasıl öğrenilir?
süre: 25

## Merak
Parçalayıcı, hangi parçaların "sık" olduğunu nereden biliyor? Biri ona tek tek söylemedi. Bir derlemde en sık yan yana gelen iki parçayı sürekli birleştirmek yeterli: bu sıkıştırma kuralı, kelime parçalarını kendiliğinden ortaya çıkarır.

## Etkinlik
Bu etkinlik tamamen **Yapay Zekâ Atölyesi**'nde, tarayıcında çalışır. Dış servis, hesap ya da anahtar gerekmez. Sağdaki **Hedefler** listesi yeşile döndükçe ilerlediğini görürsün.

### Algoritma (BPE: bayt çifti kodlaması)
1. Metni karakterlere böl.
2. Derlemde en sık yan yana geçen iki parçayı bul.
3. O çifti yeni bir parça olarak birleştir ve listeye "birleştirme" diye yaz.
4. İstediğin sayıda tekrarla.

Yeni bir metni parçalarken öğrenilmiş birleştirmeleri öğrenildiği sırayla uygularsın. Araçtaki kaydırıcı, kaç birleştirmenin uygulanacağını seçer.

### Aracı aç
1. **Token ve BPE** aracını aç. Başlangıç metni hazır.
2. Birleştirmeyi 40 ve üstüne çıkar ve "robot sağa döner ve ileri gider" gibi derlemdeki kelimelerle yaz: token sayısı karakter sayısının %60'ına inmeli.
3. Derlemde hiç geçmeyen bir kelime yaz (örneğin "kalemlik"). Bu kelimenin en az üç parçaya bölündüğünü gör.

### Nasıl çalışıyor?
- Sık geçen kelimeler ("robot", "ve") tek token olur; nadir kelimeler küçük parçalara dağılır. Bu sayede model, hiç görmediği bir kelimeyi de en azından parçalarıyla temsil edebilir.
- Gerçek sistemlerde işlem karakter yerine bayt düzeyinde başlar, böylece hiçbir metin "bilinmeyen" kalmaz. Bizim araç karakterle başlıyor; fikir aynı.
- Derlem küçük olduğu için birleştirmeler küçük derlemin zevkine göre. Büyük derlemlerde parçalar çok daha genel olur.

### Dene
1. Kaydırıcıyı yavaş yavaş artır ve hangi parçaların hangi sırayla birleştiğini izle.
2. Derlemi İngilizce yapıp Türkçe cümle yaz: ne oluyor?

### Kendini sına
1. Bir derlemde "ab" çifti 7 kez, "bc" çifti 5 kez geçiyorsa ilk birleştirme hangisi olur?
2. Hiç görülmemiş bir kelime neden yine de token'lara bölünebilir?

## Konuşalım
Parçalama sözlüğünü sen elle yazsaydın hangi kelimeleri tek parça yapardın? BPE senin seçimine göre neyi farklı yapıyor?
