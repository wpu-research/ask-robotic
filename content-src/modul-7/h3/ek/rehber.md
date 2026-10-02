### Hafta hedefleri
Bu haftanın sonunda öğrenci:
1. Sıfır örnekli ve az örnekli (few-shot) istemi ayırt eder; dengeli ve tutarlı örnekler yazar.
2. Programın okuyabileceği bir çıktı için JSON isteyen prompt yazar; model çıktısını neden doğrulaması gerektiğini açıklar.
3. Düşünme zincirini ne zaman ve nasıl isteyeceğini bilir; akıcı bir açıklamanın yanlış olabileceğini gösterir.
4. Prompt'u yinelemeyle geliştirir: tek değişiklik yapar, sürümleri kaydeder.
5. Altı parçalı (görev, rol, bağlam, örnek, biçim, kısıt) bir duyuru özetleyici prompt'u yazar ve seçimlerini bir tasarım notuyla gerekçelendirir.
6. Atölyedeki kontrol listesi puanının bir kanıt değil, bir ipucu olduğunu söyler.

### Haftanın planı
Hafta beş derstir. Aşağıdaki plan günde bir ders içindir; tüm araçlar tarayıcıda çalışır, hesap ya da anahtar gerekmez. Düşünme zinciri dersi okuma dersidir.

| Gün | Ders | Süre | Ne yapılır |
|---|---|---|---|
| 1 | Örnek vererek öğret | ~25 dk | Anlatımı oku, Prompt denetleyicide iki etiketli örnek yaz, mini testi çöz. |
| 2 | Yapılandırılmış çıktı: JSON | ~25 dk | Anahtar adlarını ve örnek çıktıyı yaz, geçerli ve geçersiz JSON örneklerini ayırt et. |
| 3 | Düşünme zinciri: adım adım | ~20 dk | Okuma dersi: örnek çözümü incele, ilk adımdaki hatayı yakala, mini testi çöz. |
| 4 | Prompt'u yinelemeyle düzelt | ~30 dk | Üç sürüm yaz, her sürümün puanını ve değişikliğini tabloya geçir. |
| 5 | Proje: Duyuru özetleyici prompt'u | ~40 dk | Altı parçayı yerleştir, sadeleştir, tasarım notunu yaz, ölçütle değerlendir. |

### Ön koşul kontrolü
Başlamadan önce öğrenci şunları yapabilmeli:
- Token, sıcaklık ve bağlam penceresini kendi cümleleriyle anlatmak (ders 2, 6, 7).
- Bir prompt'un altı parçasını saymak (ders 9) ve sistem mesajı ile kullanıcı mesajı farkını söylemek (ders 8).
- Yüzde hesabı yapmak (ör. 47 / 50 × 100).
- Dersler küçük kod parçaları içerir (JSON.parse, bir listeyi süzmek). Kodu yazmak gerekmez; öğrencinin ne yaptığını okuyarak anlaması yeterlidir.

### Kavram haritası
- **Örnek:** sıfır örnek → az örnek → dengeli, tutarlı, doğru çift → bağlamda yer tutar (ince ayar değildir)
- **Çıktı:** serbest metin → JSON (çift tırnak, anahtar adı, virgül) → doğrulama (geçerli mi, anahtar var mı) → yeniden dene / hata ver
- **Akıl yürütme:** ara adım → ayrı cevap satırı → akıcı ≠ doğru → kesin hesapta araç
- **Yineleme:** hedef → v1 → ölç → tek değişiklik → v2; kontrol puanı ≠ gerçek başarı
- **Dürüstlük:** denetleyici model değildir; atölyede model cevabı yoktur; kanıt, gerçek örneklerde ölçümdür

### Sık yapılan hatalar
- **Tüm örnekleri aynı etiketle yazmak.** Model her şeye o etiketi vermeye yönelebilir.
- **Örneği yanlış etiketlemek ya da örneği talimatla çelişkiye düşürmek.** Model karışır.
- **Tek tırnak ya da sondaki virgül.** İkisi de geçersiz JSON üretir.
- **Çıktıyı doğrulamamak.** "Model genelde doğru yazar" bir güvence değildir.
- **Akıcı açıklamaya güvenmek.** İlk adımdaki bir hata sonuna kadar taşınır.
- **Kesin hesabı modele yaptırmak.** Hesap için araç kullanılır.
- **Aynı anda birçok şeyi değiştirmek.** Hangisinin işe yaradığı bilinemez.
- **Yüksek puanı kanıt saymak.** Atölye denetleyicisi anahtar sözcüklere bakar; model cevabı ya da çıktı kalitesi bu araçta yoktur.

### Hafta sonu tekrarı
1. Her dersin kavram kartlarına bak ve "sık yapılan yanlış" satırlarını yüksek sesle oku.
2. Mini testlerde yanlış yaptığın soruların açıklamalarını yeniden oku, sonra soruyu bakmadan çöz.
3. Elle bir "iki örnekli" sınıflandırma prompt'u yaz; bir arkadaşından örneklerdeki hatayı bulmasını iste.
4. Geçerli ve geçersiz üç JSON örneği yaz ve hatanın nerede olduğunu işaretle.
5. Kendi cümlelerinle cevapla: "Prompt denetleyicisinin 90 puan vermesi neden prompt'un iyi olduğunu kanıtlamaz?"

Hafta sonu testi olarak beş dersin mini testleri yeterlidir; her derste 5 soru, toplam 25 soru. Hedef: her dersten en az 4 doğru. Eksik kalan dersin anlatımına dön.

### Proje değerlendirme ölçütü (Duyuru özetleyici prompt'u)
| Ölçüt | Gelişmeli | Yeterli | İleri |
|---|---|---|---|
| Parçalar | Altı parçadan en fazla üçü var | Altı parçanın tümü yazılmış | Her parça bir işe yarıyor, gereksiz cümle yok |
| Örnek | Örnek yok ya da talimatla çelişiyor | Tutarlı bir girdi-çıktı örneği var | Örnek hedef kitleye ve biçime uygun, bilerek seçilmiş |
| Kaynağa sadakat | Kısıt yok | "Olmayan bilgi ekleme" gibi kısıt yazılı | Kısıtın garanti olmadığını ve nasıl test edileceğini açıklıyor |
| Sadeleştirme ve yineleme | Tek taslak | En az iki sürüm ve değişiklik notu | Tek değişiklikle yapılan sürümler tabloda, nedenleri yazılı |
| Tasarım notu | Yok | Rol, örnek ve biçim gerekçeleri yazılı | Neyin ölçülmesi gerektiğini ve denetleyicinin sınırını da yazıyor |

### Veli ve öğretmen notu
- **Amaç.** Bu hafta modelin "sihirli" cevaplar vermesi değil, öğrencinin açık, test edilebilir istekler yazma alışkanlığı kazanmasıdır.
- **Simülasyon.** Atölyedeki Prompt denetleyici bir yapay zekâ değil, kural tabanlı bir kontrol listesidir; bir model cevabı üretmez. Öğrenci "araç ne cevap verdi?" diye sorarsa bu farkı birlikte konuşun. Gerçek bir modelle deneme yapılırsa sonuçlar her seferinde değişebilir ve yanlış ya da uydurma içerik taşıyabilir.
- **Nasıl destek olunur?** Cevabı söylemek yerine sor: "Hangi parçayı değiştirdin?", "Hangi kanıt var?", "Başka bir örnekte de çalışır mı?"
- **Gizlilik.** Öğrenci gerçek bir modele yazarken kişisel bilgi (ad, adres, telefon, okul belgesi) yapıştırmamalı.
- **Süre.** Dersleri aralıklı çalışmak kalıcılığı artırır.
- **İlerleme.** Mini test sonuçları "İlerlemem" sayfasında beceri bazında görünür (taslak/pilot özellik; yalnız onay verildiyse kaydedilir).
