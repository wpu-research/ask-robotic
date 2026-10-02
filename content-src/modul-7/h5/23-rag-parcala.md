# Parçalama: ne kadar büyük?
süre: 30

## Merak
Modele sorduğun şey belgede yoksa model tahmin yürütebilir. Belgeyi modele vermek çözüm; ama 200 sayfalık bir belgeyi hepsini birden vermek pahalı ve pencereye sığmayabilir. Çözüm: belgeyi parçala, soruya uyan parçaları getir. Buna RAG denir (retrieval-augmented generation, getirmeyle desteklenmiş üretim).

## Etkinlik
Bu etkinlik tamamen **Yapay Zekâ Atölyesi**'nde, tarayıcında çalışır. Dış servis, hesap ya da anahtar gerekmez. Sağdaki **Hedefler** listesi yeşile döndükçe ilerlediğini görürsün.

### RAG hattı
1. **Parçala:** Belgeyi küçük parçalara böl.
2. **Vektörleştir:** Her parçayı ve soruyu vektöre çevir.
3. **Getir:** Soruya en yakın K parçayı seç.
4. **Bağlama yerleştir:** Seçilen parçaları prompt'a koy.
5. **Sentez:** Model, bağlama dayanarak cevap yazar.

Bu derste 1. adıma odaklanıyoruz.

### Aracı aç
**RAG hattı** aracında kurgusal bir kulüp rehberi var (ders için uydurulmuş bir metin). Soru: "Proje teslimi ne zaman?"
1. Başlangıçta parça boyu çok büyük; tüm belge tek parça.
2. Parça boyunu küçült: belge en az 5 parçaya bölünsün.
3. Getirilen bağlamda "son cuma" geçsin ve bağlam 45 kelimeyi geçmesin.
4. Örtüşmeyi parça boyunun yarısından az tut.

### Nasıl çalışıyor?
- **Örtüşme:** Ardışık parçaların birkaç kelimeyi paylaşması, cevabın iki parça arasında ortadan bölünmesini önler.
- Çok büyük parça: bağlama gereksiz metin girer, benzerlik "sulanır". Çok küçük parça: cevap bölünür ya da anlamını yitirir.
- Doğru boyut yoktur; belgeye ve sorulara göre eval ile seçilir.

### Dene
1. Parça boyunu 10'a indir ve cevabın hâlâ bulunup bulunmadığına bak.
2. Örtüşmeyi sıfırla ve parçaların sınırlarını incele.

### Kendini sına
1. Örtüşme neden işe yarar?
2. Çok küçük parçaların bir sakıncası nedir?

## Konuşalım
Bir kitabı parçalarken cümle sınırında bölmek mi, sabit kelime sayısında bölmek mi daha mantıklı? Hangi durumda hangisini seçersin?
