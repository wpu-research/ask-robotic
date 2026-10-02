# Prompt'u yinelemeyle düzelt
süre: 30

## Merak
Mühendisler ilk denemede mükemmel kod yazmaz; çalıştırır, hatayı görür, düzeltir. Prompt yazmak da bir yineleme işidir: yaz, dene, neyin eksik olduğunu gör, düzelt.

## Etkinlik
Bu etkinlik tamamen **Yapay Zekâ Atölyesi**'nde, tarayıcında çalışır. Dış servis, hesap ya da anahtar gerekmez. Sağdaki **Hedefler** listesi yeşile döndükçe ilerlediğini görürsün.

### Döngü
1. Bir hedef belirle: iyi cevap neye benzer?
2. İlk prompt'u yaz.
3. Sonucu hedefe göre değerlendir.
4. Tek bir şeyi değiştir (aynı anda çok şey değiştirme).
5. Yeniden dene ve karşılaştır.

### Aracı aç
Görev: bir Python fonksiyonundaki hatayı bulup açıklatan prompt.
1. Başlangıç metni çok kısa. Önce konuya sadık kal ("Python" ve "hata" geçsin).
2. Bir kısıt ekle: "en fazla 4 madde", "kodu baştan yazma".
3. Çıktı biçimini söyle.
4. Puanı en az 75'e çıkar. Her değişiklikten sonra puanın nasıl değiştiğini kâğıda yaz.

### Nasıl çalışıyor?
- Denetleyici tek başına bir ölçüt değildir; sadece bir kontrol listesidir. Asıl ölçüt, prompt'u gerçek örneklerle denediğinde alacağın sonuçtur. Bunun için bir test seti gerekir: 4. haftada bunu kuracaksın.
- Değişiklikleri tek tek yapıp kaydetmek, hangi değişikliğin işe yaradığını anlamanı sağlar.

### Dene
1. Üç sürüm yaz (v1, v2, v3) ve her sürümün puanını yaz.
2. En çok puan getiren değişiklik hangisiydi? Gerçek bir modelde de en çok işe yarar mıydı?

### Kendini sına
1. Neden her seferinde tek şeyi değiştirmelisin?
2. Puan yükseldi ama çıktı kötüleşti. Bu nasıl olabilir?

## Konuşalım
Yüksek bir kontrol listesi puanı seni yanıltabilir mi? Bir prompt'u "bitti" saymak için hangi kanıtı isterdin?
