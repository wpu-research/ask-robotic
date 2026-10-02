### Hafta hedefleri
Bu haftanın sonunda öğrenci:
1. Kod yazan yapay zekâ araçlarının ajan olarak nasıl çalıştığını ve güvenli bir iş akışını (hedef, plan, küçük adım, test, inceleme, kayıt) söyleyebilir.
2. Yapay zekânın verdiği kod açıklamasını koda bakarak "uyumlu", "çelişiyor" ya da "kaynakta yok" diye ayırabilir.
3. Prompt injection'ın (doğrudan ve dolaylı) ne olduğunu ve yasak kelime listesinin neden kırılgan olduğunu açıklayabilir.
4. Birden çok savunma katmanını bütçeye uygun seçebilir ve her katmanın sınırını söyleyebilir.
5. Bulgu, etki, öneri, kalan risk ve sorumlu ifşa bölümleriyle tek sayfalık bir kırmızı takım raporu yazabilir.

### Haftanın planı
Hafta beş derstir; her ders 30 dakika, proje 40 dakikadır. Plan günde bir ders içindir. Atölye araçları tarayıcıda yerel çalışır ve simülasyondur; model cevapları gerçek bir model değildir.

| Gün | Ders | Süre | Ne yapılır |
|---|---|---|---|
| 1 | Yapay zekâyla kod yazma iş akışı | ~30 dk | Anlatımı oku (etkinlik aracı yok), altı basamağı kendi cümlelerinle yaz, mini testi çöz. |
| 2 | Yapay zekânın kod açıklamasını incele | ~30 dk | Halüsinasyon dedektifi aracında yedi iddiayı işaretle, çıktıyı elle tahmin et. |
| 3 | Kırmızı takım: saldır | ~30 dk | Prompt injection aracının Saldır sekmesinde seviye 0 ve 1'i aş, seviye 2'nin izini oku. |
| 4 | Katmanlı savunma | ~30 dk | Savun sekmesinde altı saldırıyı en çok 3 maliyetle durdur. |
| 5 | Proje: Kırmızı takım raporu | ~40 dk | Saldır ve savun görevlerini bitir, tek sayfalık raporu yaz, ölçütle değerlendir. |

### Ön koşul kontrolü
- Hafta 6'daki ajan döngüsü anlaşıldı mı? (Model karar verir, araç iş yapar, sonuç modele döner.)
- Sistem mesajı ve rol kavramı (8. ders) hatırlanıyor mu?
- Python'da küçük bir fonksiyon (for döngüsü, len, return) okunabiliyor mu? Bu haftanın kod örnekleri kısadır ama okumak gerekir.
- Tarayıcıda Yapay Zekâ Atölyesi açılıyor mu? Dış hesap ya da anahtar gerekmez.

### Kavram haritası
- **Kodlama ajanı:** hedef → plan → küçük adım → test → inceleme → commit; en az yetki ve onay
- **Doğrulama:** akıcılık ≠ doğruluk → uyumlu / çelişen / kaynakta yok → çıktı tahmini → uç durum → zayıf test
- **Saldırı:** talimat ve veri aynı akışta → doğrudan ve dolaylı injection → kara listenin kırılganlığı
- **Savunma:** veri/talimat ayrımı, hiyerarşi, çıktı süzgeci, en az yetki, insan onayı → maliyet dengesi → kalan risk
- **Etik:** kırmızı ve mavi takım → izin → sorumlu ifşa

### Sık yapılan hatalar
- **"Testler geçti" demek, kod doğru demek sanmak.** Yazılmış test yanlış kodu da geçirebilir; uç durum ekle.
- **Akıcı açıklamaya inanmak.** Açıklamadaki her fiil için koddaki satırı bul; bulamazsan iddia uydurmadır.
- **Boş listeyi denememek.** `len([])` sıfırdır ve bölme hata verir.
- **Yasak kelime listesine güvenmek.** Aynı anlam başka sözcüklerle söylenebilir.
- **Belgeyi güvenli sanmak.** Dolaylı injection okunan içerikten gelir; kullanıcı masum olsa da belge masum olmayabilir.
- **Gizli bilgiyi sistem mesajına yazmak.** Model bildiği şeyi sızdırabilir; en güçlü önlem hiç vermemektir.
- **Raporda "tamamen güvenli" yazmak.** Kalan riski dürüstçe belirt.
- **İzinsiz gerçek sistemde denemek.** Test yalnız izin verilen sistemlerde yapılır.

### Hafta sonu tekrarı
1. Her dersin kavram kartlarını oku ve "sık yapılan yanlış" satırlarını yüksek sesle söyle.
2. Yanlış yaptığın mini test sorularının açıklamasını oku, sonra soruyu yeniden çöz.
3. Zayıf test örneğini (`buyuk` fonksiyonu) kendin düzelt ve iki ek test yaz.
4. Altı savunmadan farklı bir üçlü seç; hangi saldırının açık kaldığını, atölyedeki tabloya bakarak bul.
5. Kendi cümlelerinle cevapla: "Gizli bir anahtarı neden modele hiç vermemeliyim?"

Hafta sonu testi olarak beş dersin mini testleri yeterlidir: 31. derste 4, 32. derste 4, 33. derste 5, 34. derste 5, 35. derste 4 soru, toplam 22 soru. Hedef: her dersten en az 3 doğru. Eksik kalan dersin anlatımına dön.

### Proje değerlendirme ölçütü (Kırmızı takım raporu)
| Ölçüt | Gelişmeli | Yeterli | İleri |
|---|---|---|---|
| Saldırı | Seviye 0'ı bile aşamadı | Seviye 0 ve 1'i aşan en az 5 kelimelik belge yazdı | Neden çalıştığını (listede olmayan anlatım) açıkladı |
| Savunma | Altı saldırıdan bazıları açık | Altı saldırıyı da durduran, maliyeti en çok 4 olan set | En az üç farklı katman seçti ve seçimini bütçeyle gerekçelendirdi |
| Rapor | Bölümler eksik | Bulgu, etki, öneri, kalan risk, sorumlu ifşa var | Her bölüm atölyedeki bir gözleme dayanıyor |
| Kalan risk | "Tamamen güvenli" diyor | Kalan riski belirtiyor | Simülasyon ile gerçek sistem arasındaki farkı da yazıyor |
| Etik | Gerçek sistemde denemeyi onaylıyor | İzin ve sorumlu ifşa ilkesini yazıyor | Bir örnekle (okul sistemi gibi) açıklıyor |

### Veli ve öğretmen notu
- **Amaç.** Bu hafta bir sistemi kırmayı öğretmek değil, yapay zekâ araçlarına ölçülü güvenmeyi ve savunma düşünmeyi öğretmektir. Atölyedeki "model" basit kurallarla çalışan bir simülasyondur; gerçek bir modeli göstermez.
- **Nasıl destek olunur?** Cevabı vermek yerine sor: "Bu iddia kodun hangi satırında?", "Saldırgan listede olmayan hangi sözcüğü kullanabilir?", "Bu gizli bilgi modele neden verilmiş?"
- **Etik sınır.** Öğrenciyle açıkça konuşun: Başkasının sistemine izinsiz saldırmak zarar verir ve yasa dışı olabilir. Öğrenilen fikirler yalnızca izin verilen ortamlarda denenir.
- **Güvenlik.** Bu platformdaki her şey sanaldır; gerçek parola, anahtar ya da kişisel bilgi yazılmaz.
- **İlerleme.** Mini test sonuçları "İlerlemem" sayfasında beceri bazında görünür (taslak/pilot özellik; yalnız onay verildiyse kaydedilir).
