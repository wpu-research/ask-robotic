### Hafta hedefleri
Bu haftanın sonunda öğrenci:
1. Bir dil modelinin sonraki kelimeyi olasılıklarla seçtiğini ve **sıcaklığın** bu olasılıkları nasıl keskinleştirip düzleştirdiğini açıklayabilir; küçük bir sıcaklık hesabını elle yapabilir.
2. **Bağlam penceresinin** neleri içerdiğini söyleyebilir, token bütçesini hesaplayabilir ve pencere dolunca ne olduğunu anlatabilir.
3. Bir konuşmanın sistem, kullanıcı ve asistan mesajlarından oluştuğunu, modelin "hafızasının" geçmişin yeniden gönderilmesi olduğunu ve sistem mesajında gizli bilgi saklanmaması gerektiğini bilir.
4. Bir istemi görev, rol, bağlam, örnek, biçim ve kısıt parçalarına ayırıp belirsiz bir isteği açık hâle getirebilir.
5. Tekrar kullanılabilir, yer tutuculu bir prompt şablonu yazabilir ve kural tabanlı bir denetleyicinin sınırlarını söyleyebilir.

### Haftanın planı
Hafta beş derstir; her ders yaklaşık 20-35 dakikadır. Aşağıdaki plan günde bir ders içindir. Atölye araçları tarayıcıda yerel çalışır; dış servis, hesap ya da anahtar gerekmez.

| Gün | Ders | Süre | Ne yapılır |
|---|---|---|---|
| 1 | Sıcaklık: ihtiyatlı mı, maceracı mı? | ~25 dk | Anlatımı oku, atölyede sıcaklığı iki uca götür, T=0,5 ile elle hesabı yap, mini testi çöz. |
| 2 | Bağlam penceresi | ~25 dk | Uzun bir metin yaz, pencereyi küçült, dışarıda kalan token'ları incele, bütçe hesabı yap. |
| 3 | Sistem mesajı, rol ve konuşma yapısı | ~20 dk | Okuma dersi: mesaj listesini elle çiz, mesaj sayısını say, mini testi çöz. |
| 4 | Açık görev yaz | ~25 dk | "Duyuruyu özetle." ile başla, eksik parçaları tek tek ekle, puanı 55'in üstüne çıkar. |
| 5 | Proje: Prompt şablonu | ~35 dk | Yorum sınıflandırma şablonu yaz, puanı 80'e çıkar, yer tutucuyu ve girdi ayırıcıyı ekle. |

### Ön koşul kontrolü
Başlamadan önce 1. haftadan şunlar hatırlanmalı:
- Token nedir ve bir kelime neden birden çok token olabilir? (ders 2-3)
- Model sonraki kelimeyi nasıl tahmin eder, olasılık nedir? (ders 4-5)
- Yüzde ve oran hesabı: 3/4 = 0,75 gibi (sıcaklık hesabı için).
- Kısa Python parçalarını okuyabilmek (testlerde yalnız okunur, yazılmaz).
Eksik olan konu için 1. haftanın ilgili anlatımına dön.

### Kavram haritası
- **Seçim:** olasılık dağılımı → softmax → sıcaklık → açgözlü seçim ve çeşitlilik
- **Girdi:** token → bağlam penceresi → token bütçesi → kırpma → seçme ve özetleme
- **Yapı:** sistem mesajı → kullanıcı mesajı → asistan mesajı → konuşma geçmişi = hafıza → rol
- **Yazım:** görev, rol, bağlam, örnek, biçim, kısıt → kural tabanlı denetleyici ve sınırı
- **Proje:** şablon → yer tutucu → sabit ve değişen kısım → girdi ayırıcı → maliyet

### Sık yapılan hatalar
- **Sıcaklığı "doğruluk ayarı" sanmak.** Düşük sıcaklık yalnız tutarlılık verir; cevap yine yanlış olabilir.
- **Sıcaklık formülünde böleni unutmak.** Puanlar sıcaklığa **bölünür**; çarpınca etki ters döner.
- **Pencereyi yalnız girdi saymak.** Modelin cevabı da pencereden pay alır.
- **Dışarıda kalan metnin "biraz hatırlandığını" sanmak.** Kırpılan kısım hiç görülmez.
- **Modelin geçmişi kendiliğinden hatırladığını sanmak.** Uygulama geçmişi her istekte yeniden gönderir.
- **Rolü bilgi kaynağı sanmak.** "Uzman ol" demek modele yeni bilgi vermez.
- **Sistem mesajına parola yazmak.** "Kimseye söyleme" koruma değildir.
- **Belirsiz zamir kullanmak.** "Bunu özetle" neyi kastettiğini söylemez.
- **Yüksek denetleyici puanını kalite kanıtı saymak.** Denetleyici anlam bilmez, parçaları sayar.
- **Yer tutucuyu değiştirmeyi unutmak.** `{{yorum}}` yazısı olduğu gibi giderse model şaşırır.

### Hafta sonu tekrarı
1. Her dersin kavram kartlarına bir kez daha bak ve "sık yapılan yanlış" satırlarını yüksek sesle oku.
2. Mini testlerde yanlış yaptığın soruların açıklamalarını yeniden oku, sonra soruyu yeniden çöz.
3. Sayımları 4 ve 1 olan iki aday için T = 1, 0,5 ve 2 değerlerinde olasılıkları kâğıtta hesapla (0,80 / 0,94 / 0,67 civarı) ve atölyede karşılaştır.
4. Kendi cümlelerinle şu soruları cevapla: "Bağlam penceresine hangileri girer?", "Rol ile bilgi arasındaki fark nedir?"
5. "Duyuruyu özetle." istemini sıfırdan, bakmadan altı parçayla yeniden yaz ve puanını denetleyicide gör.

Hafta sonu testi olarak beş dersin mini testleri yeterlidir; her derste 5 soru, toplam 25 soru. Hedef: her dersten en az 4 doğru. Eksik kalan dersin anlatımına dön.

### Proje değerlendirme ölçütü (Prompt şablonu)
| Ölçüt | Gelişmeli | Yeterli | İleri |
|---|---|---|---|
| Parçalar | Üç ya da daha az parça var | Rol, görev, örnek, biçim ve kısıt var | Altı parçanın hepsi var ve her biri bir iş yapıyor |
| Yer tutucu | Yer tutucu yok, yorum sabit yazılmış | `{{yorum}}` gibi bir yer tutucu var | Girdi talimattan etiketle ayrılmış |
| Örnek | Örnek yok | Bir Girdi/Çıktı çifti var | Örnek istenen biçimle birebir uyuyor |
| Denetleyici puanı | 80'in altında | 80 ve üstü | 90 ve üstü; ayrıca puanın kalite kanıtı olmadığını açıklıyor |
| Sınama | Şablonu hiç sınamamış | Şablonu 2-3 farklı yorumla elle doldurup okumuş | Şablonun zayıf yerini (örneğin iki duygulu yorum) bulup düzeltmiş |

### Veli ve öğretmen notu
- **Amaç.** Bu hafta "model nasıl düşünür?" sorusuna doğru bir zemin kurar: model olasılıkla seçer, sınırlı pencerede çalışır ve yalnız yazılanı görür. İyi prompt yazmak sihirli kelimeler değil, açık görev tarifidir.
- **Dürüstlük.** Atölyedeki sonraki kelime modeli sayımdan çıkan küçük bir tablodur, bir sinir ağı değildir. Prompt denetleyici kural tabanlı bir programdır, yapay zekâ değildir. Bu platformda hiçbir gerçek model çağrılmaz, "model cevapladı" ya da "Claude puanladı" türü bir iddia yoktur. Öğrenciye bunu açıkça hatırlat.
- **Nasıl destek olunur?** Öğrenci takıldığında cevabı söylemek yerine şunu sor: "Modelin tahmin etmesi gereken ne kaldı?", "Bu bilgi pencerede mi?", "Bu cümle hangi parçaya hizmet ediyor?"
- **Gizlilik.** Gerçek bir yapay zekâ aracı kullanılacaksa ad, okul, telefon gibi kişisel bilgiler ve parolalar prompt'a yazılmaz. Sistem mesajına gizli bilgi konmaması bu hafta ilk kez görülür.
- **İlerleme.** Mini test sonuçları "İlerlemem" sayfasında beceri bazında görünür (taslak/pilot özellik; yalnız onay verildiyse kaydedilir).
