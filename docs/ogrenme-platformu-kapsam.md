# Öğrenme platformu kapsamı (2026-10-01 kararları)

ASK Robotic yalnızca ders oynatıcı değil, **tam bir öğrenme platformu** olacak. Bu belge, mevcut müfredat/laboratuvar işinin üstüne eklenen katmanları toplar.

## 1. Her ders için içerik katmanları
Mevcut ders (`Merak / Etkinlik / Konuşalım`) çekirdek olarak kalır. Her derse şunlar eklenir:
- **Konu anlatımı:** Dersin kavramını sıfırdan anlatan, örnekli, şekilli, kendi kendine okunabilir metin. Etkinlikten önce okunur; "Bu derste öğreneceklerin" ve "Önceden bilmen gerekenler" ile başlar.
- **Kavram kartları:** Dersin 3-6 anahtar terimi (tanım, tek cümlelik örnek, sık yapılan yanlış).
- **Ders sonu özeti ve mini test.**
- **Daha fazlası:** İleri okuma, meydan okuma etkinliği.

## 2. Haftalık çalışma rehberi
Her hafta için: hedefler, hafta planı (hangi gün hangi ders, süre), ön koşul kontrolü, kavram haritası, sık hatalar, hafta sonu tekrarı ve hafta sonu testi, proje değerlendirme ölçütü (rubrik), ebeveyn/öğretmen notu.

## 3. Bileşen (parça) ansiklopedisi
Laboratuvardaki her parça için ayrı sayfa (LED, direnç, buton, pot, LDR, NTC, buzzer, RGB LED, servo, diyot, NPN, MOSFET, DC motor, L293D, röle, 7-seg, 74HC595, LCD, HC-SR04 …):
- Ne işe yarar, nasıl çalışır (basit + ileri düzey açıklama), pinleri ve şeması.
- Laboratuvarda nasıl bağlanır (pin adları `contract.ts` ile aynı), tipik değerler, sık hatalar ve uyarılar.
- Çalışan mini örnek (laboratuvarda tek tıkla aç) ve ilgili dersler.
- Laboratuvarda parçaya tıklayınca "Bu parça nedir?" bağlantısı.

## 4. Ölçme ve analiz
Olay günlüğü, beceri haritası, soru bankası (kalıp/beceri/zorluk etiketli), madde analizi, seviye belirleme / ders sonu / hafta sonu / modül bitirme / deneme sınavı, öğrenci - öğretmen/veli - içerik sahibi panoları. Soru üretimi Claude ile, cevaplar simülatörde makineyle doğrulanır. HMGS-RAG'deki "kalıp + soru bankası + bilgi tabanı" yapısı örnek alınır.

## 5. Veri/izin
KVKK/COPPA: anonim cihaz kimliği, 16 yaş altı için veli onayı. Veri modeli baştan buna göre kurulur.

## Uygulama sırası (öneri)
1. İçerik şeması: `lessons` için `explainer_md`, `concepts[]`, `quiz[]`; `weeks` için `guide_md`; yeni `components` tablosu. Yazar rehberi ve `build.mjs` genişletilir.
2. Pilot: Modül 3 Hafta 1 (konu anlatımları + haftalık rehber + parça sayfaları: LED, direnç, buton).
3. Oynatıcıda "Anlatım" sekmesi, hafta sayfasında rehber, laboratuvarda parça bilgisi.
4. Olay günlüğü + beceri etiketleri + test motoru.
5. Kalan modüller için yazım dalgası (paralel ajanlarla, denetleyiciden geçirilerek).
