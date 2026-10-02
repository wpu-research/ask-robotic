# Proje: Prompt şablonu
süre: 35

## Merak
Aynı işi sık tekrarlıyorsan her seferinde baştan prompt yazmak yerine bir şablon hazırlarsın: sabit kısımlar yerinde durur, değişen kısımlar boş bırakılır. Bu hafta, öğrenci yorumlarını sınıflandıran bir şablon yazıyoruz.

## Etkinlik
Bu etkinlik tamamen **Yapay Zekâ Atölyesi**'nde, tarayıcında çalışır. Dış servis, hesap ya da anahtar gerekmez. Sağdaki **Hedefler** listesi yeşile döndükçe ilerlediğini görürsün.

### Görev
**Prompt denetleyici** aracında, öğrenci yorumlarını "olumlu" ya da "olumsuz" diye sınıflandıran bir prompt şablonu yaz.

### Şablon iskeleti
- Rol: "Sen bir ... asistanısın."
- Görev: "Öğrenci yorumlarını ... olarak sınıflandır."
- Örnek: Girdi / Çıktı çifti.
- Biçim: "Yanıtta yalnızca ... yaz."
- Kısıt: Ne yapma?

### Adımlar
1. Başlangıç metnini bu iskelete göre genişlet.
2. Kontrol listesi puanını en az 80'e çıkar.
3. Rol ve örnek olmalı; prompt'ta "yorum" ve "olumlu" kelimeleri geçmeli.
4. Şablondaki yorum yerine koyacağın alan için bir işaret düşün (örneğin {{yorum}}); gerçek uygulamalarda program bu alanı değiştirir.

### Nasıl çalışıyor?
- Şablon, bir fonksiyon gibidir: sabit talimatlar + değişken girdi.
- Girdiyi talimattan ayırmak (örneğin etiketlerle) hem okunurluğu hem güvenliği artırır; 34. derste nedenini göreceksin.

### Kendini sına
1. Şablondaki hangi bölüm değişir, hangisi sabit kalır?
2. Örnek, modelin çıktı biçimini nasıl etkiler?

## Konuşalım
Şablonun başkasının elinde de iyi çalışması için neye dikkat etmelisin? Bir arkadaşının şablonunu incele ve eksiğini söyle.
