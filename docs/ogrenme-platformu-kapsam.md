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

---

# Uygulama durumu (pilot, 2026-10-02)

Pilot kapsamı: **Modül 3 Hafta 1** (5 ders) + 6 parça. Her şey **taslak/pilot**: üretim özelliği değildir.

## Şema (geriye uyumlu, hepsi opsiyonel)
- `lessons.explainer_md` (text), `lessons.concepts` (jsonb: `{term, definition, example, pitfall}[]`), `lessons.quiz` (jsonb: `{id, kind: mcq|predict-output|find-bug|numeric, prompt, options?, answer, tolerance?, unit?, explanation, skills[]}[]`), `weeks.guide_md` (text).
- Yeni tablo `events` (`device_id, type, lesson_id, payload jsonb, ts`; migrasyon `0002_platform_katmani`). Kişisel veri sütunu yok.
- Parça ansiklopedisi **tablo değil içerik dosyası**: `content-src/parcalar/*.md` → `packages/db/src/content/parcalar.generated.ts` (`@ask/db/parcalar` alt yolu tarayıcıya girebilir; kök `@ask/db` sunucuya özeldir).
- Yazım biçimi, doğrulama kuralları ve şablonlar: `content-src/modul-3/YAZAR-REHBERI.md` (alt bölüm "Öğrenme platformu katmanı").

## Arayüz
- Ders sayfası: ders anlatım/test içeriyorsa adımlar `Merak → Anlatım → Etkinlik → Test → Konuşalım → Bitti`; içermiyorsa eski 4 adım.
- Hafta rehberi: modül sayfasında haftanın içinde "Haftalık rehber" açılır bölümü.
- `/parcalar`, `/parcalar/[slug]` (arama, pinler, tipik değerler, ilgili dersler); laboratuvarda parça seçilince "Bu parça nedir?".
- `/ilerleme` (beceri haritası, test geçmişi, özet, veri ayarları), `/testler`.

## Ölçme ve KVKK
- Olay günlüğü: tarayıcıda `ask:events:v1` (1000 olaylık halka tampon), anonim cihaz kimliği `ask:device:v1`, isteğe bağlı sunucu gönderimi `POST /api/events` (cihaz başına dk'da 20 istek, gövde ≤ 32 KB, ≤ 50 olay; IP yazılmaz). Silme: `DELETE /api/events`.
- Olay türleri: `lesson_view, lesson_leave, activity_start, goal_done, compile, run, hint, quiz_answer, quiz_done, lesson_done, concept_view, part_view`.
- **Onay olmadan hiçbir olay yazılmaz** (`ask:consent:v1`: `local` | `sync` | `denied`); 16 yaş/veli işareti şart. "Verilerimi sil" tarayıcıyı ve sunucuyu temizler. Metinler taslaktır, hukuki aydınlatma metni değildir.
- Beceri ustalığı: `apps/web/src/lib/skills.ts` (`computeMastery`: yenilik 0,85^sıra × ilk deneme 1 / tekrar 0,5 ağırlıklı doğru oranı; ≥ 0,8 ve ≥ 3 cevap = ustalaştı).

## Yaygınlaştırma planı
1. **Şablon (hazır):** her ders için `ek/NN.anlatim.md` + `ek/NN.json`, hafta için `ek/rehber.md`, parça için `parcalar/<slug>.md`; hepsi `build.mjs` + `platform-icerik.test.ts` ile doğrulanır.
2. **Dalgalar:** Modül 3 H2-H7 (30 ders) → Modül 4 (40) → Modül 5 (≈ 40) → Modül 7 AI (40) → Mikro Kart / Oyun Atölyesi (60) → Modül 1-2. Her dalga bir hafta = bir ajan; denetleyici ajan sayısal cevapları ve pin adlarını ayrıca sınar.
3. **Parçalar:** LDR, NTC, RGB LED, servo (H3-H5 ile), sonra Aşama B/C parçaları (diyot, NPN, MOSFET, DC motor, L293D, röle, 7-seg, 74HC595, LCD, HC-SR04 …) ilgili hafta yazılırken.
4. **Ölçme (sonraki adım):** soru bankası + madde analizi (sunucuya `quiz_answer` birikince), seviye belirleme / modül bitirme sınavı, öğretmen-veli panosu (giriş + veli bağlantısı gerekir).
