# Düşünme zinciri: adım adım
süre: 20

## Merak
Bir matematik sorusunu tek seferde "kafadan" çözmeye çalışmak yerine adım adım yazmak çoğu kez hatayı azaltır. Modeller için de benzer bir fikir var: cevaptan önce ara adımları yazmak.

## Etkinlik
Bu ders okuma dersidir; etkinlik aracı yoktur.

### Fikir
Dil modeli cevabı token token üretir. Cevabın önüne ara adımlar yazdırırsan, her adım sonraki adımın bağlamı olur. Bu yaklaşıma **düşünme zinciri** (chain of thought) denir. Çok adımlı hesaplama ve mantık sorularında sonucu iyileştirebilir. Bazı modeller bunu ayrı bir "düşünme" aşamasıyla kendileri de yapabilir.

### Nasıl istersin?
- "Önce adım adım çöz, sonra son cevabı ayrı bir satıra yaz."
- Biçimi sabitle: "Adımlar:" ve "Cevap:" başlıkları.
- Son cevabı ayrı bir satıra yazdırmak, programın cevabı kolay çekmesini sağlar.

### Sınırlar
- Adımlar **gerçek akıl yürütmeyi birebir yansıtmayabilir**. Akıcı bir açıklama, doğru bir açıklama demek değildir.
- Daha uzun cevap, daha çok token ve zaman demektir.
- Doğruluğun gerektiği yerde hesabı bir araca vermek daha güvenlidir. 26. derste hesap makinesini bir araç olarak kullanacaksın.
- Çok basit sorularda zincir gereksiz olabilir.

### Küçük bir örnek
Soru: "12 grubun her biri 7 proje yapmış. Toplam kaç proje var?"
Adımlar: Grup sayısı 12, her grupta 7 proje. 12 çarpı 7 eşittir 84.
Cevap: 84.

### Kendini sına
1. Düşünme zincirini isterken cevabı neden ayrı bir satıra yazdırırsın?
2. Adımlar mantıklı görünse de neden yine kontrol etmelisin?
3. Aynı soruyu hesap makinesi aracıyla çözmenin avantajı nedir?

## Konuşalım
Bir modelin yazdığı "adım adım çözüm" ile kendi çözümünü karşılaştırdığında ne tür farklar bekliyorsun? Adımı doğrulamak için neye bakarsın?
