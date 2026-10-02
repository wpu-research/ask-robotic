# Açık görev yaz
süre: 25

## Merak
İki arkadaşa aynı işi iki farklı biçimde tarif et: "şunu yap" ve "şunu şu amaçla, şu biçimde, en fazla şu kadar yap". Hangisinin istediğini daha doğru yapacağını biliyorsun. Modeller için de bu böyle: net bir istek, çoğu zaman daha iyi bir sonuç demektir.

## Etkinlik
Bu etkinlik tamamen **Yapay Zekâ Atölyesi**'nde, tarayıcında çalışır. Dış servis, hesap ya da anahtar gerekmez. Sağdaki **Hedefler** listesi yeşile döndükçe ilerlediğini görürsün.

### İyi bir prompt'un parçaları
- **Görev:** Ne yapılacak? Bir eylem fiiliyle başla.
- **Rol:** Model kim gibi davranacak?
- **Bağlam:** Kim için, ne amaçla?
- **Örnek:** İstediğin cevap nasıl görünüyor?
- **Biçim:** Madde, tablo, JSON, cümle sayısı?
- **Kısıt:** Neyi yapmamalı?

### Aracı aç
1. **Prompt denetleyici** aracı açılır. Görev: robot kulübü duyurusunu 13 yaşındaki öğrenciler için özetletmek.
2. "Duyuruyu özetle." ile başla ve puanı izle: çok kısa istem düşük puan alır.
3. Eksik parçaları tek tek ekle: biçim (örneğin "en fazla 3 madde"), rol ve hedef kitle.
4. Puanı 55'in üstüne çıkar; "duyuru" ve "özet" kelimeleri geçsin.

### Nasıl çalışıyor?
- Bu denetleyici **kural tabanlı** bir programdır: anahtar sözcüklere ve biçime bakar. Bir yapay zekâ değildir ve prompt'unun gerçekten iyi olup olmadığını söyleyemez.
- Yüksek puan, "iyi bir prompt'ta olması gereken parçalar var" demektir. Gerçek sınama, prompt'u bir modelde denemek ve çıktıyı ölçmektir (4. hafta).
- Gereksiz uzatma da kötüdür: her cümle bir iş yapmalı.

### Dene
1. Aynı görevi iki farklı roldeyken yaz ve hangi parçanın puana ne kadar katkı verdiğini karşılaştır.
2. Bir kısıt ekle ve puanın değişimine bak.

### Sık yapılan hatalar
- Bir sürü sıfat eklemek ("en mükemmel, en harika özet"), ama biçim ve hedef kitleyi söylememek.
- Belirsiz zamirler: "bunu özetle" dedikten sonra neyin kastedildiğini yazmamak.

### Kendini sına
1. Bir prompt'ta eksik olan en az iki parçayı say.
2. Kural tabanlı bir denetleyicinin sınırı nedir?

## Konuşalım
Senin için "iyi bir prompt" ile "uzun bir prompt" aynı şey mi? Kısa ama etkili bir prompt nasıl olurdu?
