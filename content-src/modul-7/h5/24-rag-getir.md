# Getirme: doğru parçayı bul
süre: 30

## Merak
Soru belirsizse getirme de şansa kalır: "Yardım" yazarsan hangi parçanın gelmesi gerektiğini bilemezsin. Getirme adımı, soruyla belge arasındaki ortak dilin kalitesine bağlıdır.

## Etkinlik
Bu etkinlik tamamen **Yapay Zekâ Atölyesi**'nde, tarayıcında çalışır. Dış servis, hesap ya da anahtar gerekmez. Sağdaki **Hedefler** listesi yeşile döndükçe ilerlediğini görürsün.

### Getirme ve yerleştirme
Getirme adımı soruyu vektöre çevirir, parçaları benzerliğe göre sıralar ve en iyi K tanesini seçer. Seçilen parçalar bir **prompt şablonuna** yerleştirilir: "Aşağıdaki bağlama dayanarak soruyu yanıtla. Bağlamda yoksa bilmiyorum de." Sonra bu prompt modele gider.

### Aracı aç
**RAG hattı** aracında:
1. Soru kutusu "Yardım" ile başlıyor. Mentörlerin ne kadar sürede yanıt verdiğini bulduran bir soru yaz.
2. Şablon yanıt "iki gün" içersin.
3. Soru en az dört kelime olsun.
4. En çok üç parça getir.

### Nasıl çalışıyor?
- Getirme **gerçek hesaplanır**. Sonuç sorunun kelimelerine bağlıdır.
- 5. adım (sentez) bir **şablondur**: gerçek bir model olurdu. Araç yalnız bağlamdaki en çok eşleşen cümleyi alıntılar. Bu yüzden yanıt, "modelin yorumu" değil bir alıntıdır.
- Bağlamda cevap yoksa iyi bir sistem "bilmiyorum" demelidir. Bunun için prompt'ta açık talimat ve eval'da bu durumu sınayan vakalar gerekir.

### Dene
1. Parça sayısını 5'e çıkar: bağlam uzadı. Cevabı bulmayı kolaylaştırdı mı, zorlaştırdı mı?
2. Rehberde hiç geçmeyen bir konu sor ("Ücret ne kadar?"). Ne getiriyor?

### Kendini sına
1. Getirmenin yanlış parça getirmesi, sonraki adımı nasıl etkiler?
2. "Bağlamda yoksa bilmiyorum de" talimatı neden önemlidir?

## Konuşalım
Getirme adımı kusursuz çalışsa bile sentez adımı yanlış cevap verebilir mi? Hangi hata hangi adımdan geliyor, nasıl ayırt edersin?
