# Sistem mesajı, rol ve konuşma yapısı
süre: 20

## Merak
Bir yapay zekâ uygulaması, sen yazmadan önce de modele bir şeyler söylemiş olabilir: "Sen bir kod öğretmenisin, kısa cevap ver." Bu görünmez giriş, modelin davranışını yönlendirir. Peki bunun neresi senin, neresi uygulamanın?

## Etkinlik
Bu ders okuma dersidir; etkinlik aracı yoktur.

### Konuşma nasıl yapılandırılır?
Çoğu sohbet tabanlı model, girdiyi **mesajlar** hâlinde alır. Genel yapı şöyledir:
- **Sistem mesajı:** Uygulamayı yazanın verdiği kalıcı yönergeler (rol, üslup, kurallar).
- **Kullanıcı mesajı:** Senin yazdığın istek.
- **Asistan mesajı:** Modelin önceki cevapları. Bunlar da bağlama girer.
Model her cevabında bu mesajların tamamını (pencereye sığdığı kadarını) birlikte görür. Yani modelin "hafızası", her seferinde ona yeniden verilen konuşmadır.

### Rol vermek
"Sen deneyimli bir robotik mentörüsün" gibi bir cümle modelin cevaplarının üslubunu ve ayrıntı düzeyini etkileyebilir. Rol sihirli değildir: modele yeni bilgi vermez, yalnızca hangi bilgiyi ne tonda kullanacağını yönlendirir. Doğrulanması gereken bir bilgiyi rol vermekle doğru yapamazsın.

### İyi bir sistem mesajı neler içerir?
1. Rol ve hedef kitle.
2. Yapılacak iş ve yapılmayacak şeyler.
3. Çıktı biçimi.
4. Emin olmadığında ne yapacağı ("bilmiyorsan bilmiyorum de").

### Önemli: güvenlik notu
Sistem mesajı bir "kasa" değildir. Orada gizli anahtar, parola ya da gizli tutulması gereken bilgi saklama. Modelin çıktısı yanlış yönlendirilerek bu içerik ortaya çıkabilir. 33. derste bunun neden böyle olduğunu kendin göreceksin.

### Kendini sına
1. Model "önceki konuşmayı hatırlıyor" mu, yoksa ona yeniden mi veriliyor?
2. Rol vermek modele yeni bir bilgi öğretir mi?
3. Sistem mesajına parola yazmak neden kötü fikirdir?

## Konuşalım
Bir okul asistanı uygulaması yazsaydın sistem mesajına hangi üç kuralı koyardın? Kullanıcı bu kuralları aşmak isterse ne olabilir?
