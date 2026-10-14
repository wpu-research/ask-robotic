# ASK Robotic — Okul Platformu Stratejisi (TR)

Tarih: 2026-10-14 · Durum: taslak çalışma · İngilizce sürüm: `school-platform-strategy.en.md`
Dayanak: `docs/analiz-brilliant.md` (Brilliant analizi + üye ekranları), mevcut kod ve içerik envanteri.

---

## 1. Tek cümlede

**5 yaşından 18 yaşına: bloklarla kodlamadan elektroniğe, robotikten yapay zekâ mühendisliğine uzanan, hiçbir donanım
gerektirmeyen, Türkçe ve İngilizce, okullar için tasarlanmış etkileşimli öğrenme platformu.**

Brilliant "matematik ve kodlama için kişisel öğretmen" diyor. Biz **"okulun robotik ve yapay zekâ laboratuvarı — tarayıcıda"**
diyoruz.

## 2. Neden bizim elimizdeki iş daha güçlü?

| | Brilliant | ASK Robotic |
|---|-----------|-------------|
| Yaş aralığı | 5. sınıf → yetişkin (K-5 yalnız aritmetik pratiği) | **5 → 18 yaş**, tek merdiven |
| Alan | Matematik, kodlama, biraz veri/bilim | **Kodlama + elektronik + robotik + yapay zekâ** |
| Etkileşim | Küçük, özel yapım widget'lar | **Gerçek simülatörler:** Arduino (avr8js, gerçek derleyici), devre laboratuvarı, robot arenası, Scratch tarzı sahne, mikro kart, oyun atölyesi, tarayıcıda çalışan AI atölyesi |
| Donanım | Yok, gerek de yok | **Yok — ama gerçek donanımın birebir sanalı.** Okulun kit, lehim, kırılan parça, laboratuvar derdi yok |
| Dil / müfredat | İngilizce, ABD Common Core | **Türkçe + İngilizce**, MEB seçmeli dersleriyle eşleşebilir |
| Okul | Ücretsiz sınıf hesabı, ikincil | **Birinci müşteri okul** |
| Başvuru kaynakları | — | 37 parçalık ansiklopedi, 43 haftalık rehber, ~350 beceri, ~1.190 soru |

Brilliant'tan **alacaklarımız** (bizde eksik olan): problem-öncelikli ders akışı (ders başına 10–15 etkileşim), aynı
widget'la değişen kısıtlar, Kontrol Et → yeşil ekran → Neden?, token'lı kod editörü, sesli anlatım, ders içi AI tutor,
seri/XP, kayıttan önce onboarding, sade katalog. (Ayrıntı: analiz belgesi §11.7.)

## 3. Hedef pazar: önce kolejler ve okullar

### Neden okul önce?
- **Az sayıda karar verici, çok sayıda öğrenci:** bir kolej sözleşmesi = yüzlerce öğrenci.
- **Bütçe ve vitrin ihtiyacı:** özel okullar velilere "robotik / yapay zekâ / STEM" sunmak zorunda; çoğunun kitleri dolapta.
- **Donanımsız olmamız okul için en büyük artı:** kit bütçesi, bakım, kayıp parça, sınıf başına tek set sorunu yok;
  her öğrenci kendi "laboratuvarında".
- **MEB seçmeli dersleri içerik arıyor** (aşağıda §5). Öğretmenin elinde uygulamalı materyal az.
- **Uluslararası programlı kolejler** (IB, Cambridge) İngilizce içerik istiyor → iki dil doğrudan satış argümanı.
- Bireysel/aile pazarı daha pahalı pazarlama ister; okul kanalı öğrenciyi ve veliyi bize getirir, bireysel üyelik
  ileride bu tabandan büyür.

### Alıcı ve kullanıcılar

| Kişi | Ne istiyor | Ona ne göstereceğiz |
|------|-----------|--------------------|
| Kurucu / genel müdür | Veliye vitrin, fark, ölçülebilir sonuç | Okul raporu, veli raporu, yarışma/proje vitrini |
| BT / robotik öğretmeni, zümre | Hazır, uygulanabilir, 40 dk'ya sığan ders; az hazırlık | Ders planları, sınıf paneli, otomatik değerlendirme |
| Veli | Çocuğum ne öğreniyor? | Haftalık rapor, proje paylaşımı |
| Öğrenci | Eğlence, başarı hissi | Simülatörler, oyunlaştırma, projeler |

## 4. Yaş bantları ve müfredat merdiveni

Her bant **bir okul yılı ≈ 30–36 ders saati** (haftada 1 ders) hedefiyle paketlenir.

| Bant | Sınıf | Yaş | Konu | Mevcut içerik | Araçlar | Durum |
|------|-------|-----|------|---------------|---------|-------|
| **Minikler** | Anaokulu – 2 | 5–7 | Blokla kodlama, sıralama, döngü, hikâye | M1 Blokla Kodlamaya İlk Adım (10 ders) | Atölye (ScratchJr tarzı), oyunlar | **İçerik az** (1 dönemlik bile değil); sesli anlatım şart |
| **Kâşifler** | 3 – 4 | 8–10 | Oyun yapımı, olaylar, değişkenler; ilk elektronik | M2 Scratch (16), M10 Mikro Kart (30) | Sahne Atölyesi, Mikro Kart, oyunlar | Yeterli; ders v2'ye taşınmalı |
| **Yapıcılar** | 5 – 6 | 10–12 | Oyun tasarımı, mikro kart projeleri, **AI okuryazarlığı** | M11 Oyun Atölyesi (30), M10 ileri haftalar | Oyun Atölyesi, Mikro Kart, AI Atölyesi (çocuk sürümü) | **AI Keşif modülü yok** (yeni yazılacak) |
| **Mühendis Adayları** | 7 – 8 | 12–14 | Arduino, devre, sensör; **Yapay Zekâ Uygulamaları**; robotik giriş | M3 Arduino Temelleri (35), M4 Sensörler (40) | Laboratuvar, ansiklopedi, AI Atölyesi | İçerik güçlü; AI seçmelisine uyarlanmış paket gerekli |
| **Mühendisler** | 9 – 12 | 14–18 | Robotik, kontrol, yapay zekâ mühendisliği, ileri kartlar, yarışma hazırlığı | M5 Robotik (40), M7 AI Mühendisliği (40) | Arena, Laboratuvar, AI Atölyesi | M6 (ESP32/RP2040/Pi), M8 (robot kol), M9 (drone) **yazılmadı** |

Toplam mevcut: 8 modül, 241 ders. En büyük boşluklar: **5–7 yaş içeriği**, **8–12 yaş için AI okuryazarlığı**, lise için M6/M8/M9.

Notlar:
- Öğrenci modül numarası görmez; **bant → konu → kurs → seviye → ders** görür (Brilliant'ın "topic" kataloğu gibi).
- Bantlar katı değil: öğretmen veya seviye tespiti öğrenciyi bir alt/üst banda yerleştirebilir.
- Her bandın sonunda bir **"bitirme projesi"** (okul sergisi / veli günü / yarışma için).

## 5. MEB ile eşleşme (satışta en güçlü kart)

Okul öğretmeninin sorusu: "Bunu hangi derste kullanacağım?" Cevap tablosu:

| MEB dersi | Sınıf | Bizim karşılığımız |
|-----------|-------|--------------------|
| Bilişim Teknolojileri ve Yazılım (Maarif Modeli temaları arasında **yapay zekâ** ve **yazılım tasarımı ve programlama** var) | 5–6 | Kâşifler/Yapıcılar bantları, AI Keşif |
| **Yapay Zekâ Uygulamaları** (seçmeli; 2 seviye × 72 saat; blok tabanlı AI problemleri, üretken AI, etik, makine öğrenmesi, sinir ağları, bulanık mantık) | 7–8 | AI Atölyesi + M7'nin ortaokul uyarlaması |
| **Robotik Kodlama** (seçmeli; robotikte AI kavramları ve etik dahil) | Ortaokul | M3 + M5 seçkisi, Arena |
| Teknoloji ve Tasarım | 7–8 | Proje haftaları, Laboratuvar |
| Yarışmalar (TEKNOFEST, FLL vb.) | 5–12 | Robotik/AI yarışma hazırlık yolu |

> ⚠ Ders saatleri, uygulama yılları ve kazanım kodları satış belgesine girmeden önce MEB Müfredat Portalı'ndan
> **teyit edilmeli**; buradaki bilgi haber ve portal özetlerinden derlendi.

Yapılacak: her ders için **kazanım eşleme tablosu** (Brilliant'ın Common Core eşlemesi gibi; eşleşmeyen kazanımlar da açıkça
yazılır — şeffaflık öğretmende güven yaratır).

## 6. Ürün mimarisi — 5 katman

### 6.1 Öğrenci deneyimi (Brilliant mantığı)
- **Ders v2:** problem → 2–3 cümle → etkileşim → anında geri bildirim; ders başına 8–15 etkileşim; derse gömülü mini simler.
- Token'lı kod editörü (C++/Python/blok), "Neden?" açıklaması, basamaklı ipucu, hikâye çerçevesi.
- **Sesli anlatım** (TR/EN TTS) — 5–8 yaş için zorunlu.
- Ustalık → kişisel pratik, seviye tekrarı, aralıklı tekrar (beceri motoru `lib/skills.ts` zaten var).
- XP, seri, rozet; **ligler yalnız sınıf/okul içinde**.
- Ders içi **AI tutor** (Claude) — okul açıp kapatabilir, konuşmalar öğretmene görünür.

### 6.2 Öğretmen / sınıf katmanı (okul satışının kalbi)
- Sınıf oluşturma; öğrencileri **CSV ile toplu ekleme** veya sınıf kodu.
- **Küçükler için QR kart / resimli şifre ile giriş** (e-posta gerektirmez).
- Ders/hafta **atama**, teslim tarihi, sınıf ilerleme tablosu, "kim takıldı" canlı görünümü.
- **Beceri ısı haritası** (sınıf × beceri), otomatik puanlanan testler, proje rubrikleri.
- **Projeksiyon/sunum modu:** dersin "Merak" ve "Konuşalım" adımlarını tahtaya yansıtma; sınıfı adım adım birlikte yürütme.
- **40 dakikalık ders planları** (PDF + ekranda): 5 dk ısınma (Merak) → 25 dk platform (bireysel/ikili) →
  10 dk Konuşalım + çıkış bileti. Mevcut ders yapısı (Merak / Etkinlik / Konuşalım) buna zaten uygun.
- Cevap anahtarları, sık hatalar (haftalık rehberlerde mevcut), öğretmen eğitim videoları.

### 6.3 Okul yönetimi katmanı
- Okul hesabı, kampüs/şube, öğretmen ve lisans yönetimi.
- Kullanım ve başarı raporu (dönem sonu PDF), veli toplantısı için öğrenci karnesi.
- Google Workspace for Education / Microsoft 365 ile **tek oturum (SSO)** — sonraki faz.

### 6.4 Veli katmanı
- Haftalık e-posta özeti: süre, tamamlanan dersler, güçlü/zayıf beceriler, bitirilen proje.
- Proje paylaşım bağlantısı (öğrenci adı yerine rumuz).

### 6.5 Üyelik / abonelik altyapısı (hazır ama şimdilik vitrinde değil)
Tek bir **yetki (entitlement)** sistemi; erişimi iki kaynak açar:
- **Okul lisansı:** okul → sınıflar → öğrenciler (dönemlik/yıllık, koltuk sayılı).
- **Bireysel / aile aboneliği:** kullanıcı → plan (ücretsiz / premium / aile). Ödeme altyapısı (ör. iyzico/Stripe)
  bağlanır ama kampanya yapılmaz.
Ücretsiz plan kuralları (Brilliant'taki gibi "günde 1 ders") yapılandırma ile açılıp kapanır.

### Veri modeli eklemeleri (mevcut şemaya göre)
Mevcut: `users (role: student|parent|teacher|admin)`, `modules`, `weeks`, `lessons`, `enrollments`, `progress`, `sessions`, `events`.
Eklenecek: `organizations` (okul), `campuses`, `classes`, `class_members`, `assignments`, `licenses`,
`subscriptions`, `entitlements`, `guardian_links`, `consents`; `users.locale`, `users.birth_year`, `users.login_mode`
(e-posta / QR / resimli şifre); içerikte `locale`.

## 7. İki dil: Türkçe + İngilizce

| Katman | Yaklaşım |
|--------|---------|
| Arayüz | i18n altyapısı (ör. `next-intl`); bugün kodda **hiç i18n yok**, metinler Türkçe gömülü → Faz 0 işi |
| Ders içeriği | Kaynak dosya başına dil: `03-led-yak.md` + `03-led-yak.en.md`; `build.mjs` locale'li üretir |
| Terim sözlüğü | Tek kaynak TR↔EN kavram sözlüğü (kavram kartlarından türetilir) — çeviri tutarlılığı |
| Çeviri süreci | Claude ile ilk çeviri → terim sözlüğü kontrolü → öğretmen/editör onayı → otomatik testler (soru cevapları, kod çıktıları dil bağımsız doğrulanır) |
| Bloklar ve kod | Blok etiketleri iki dilde; Arduino/Python kodu zaten İngilizce anahtar kelimeli, yorumlar dile göre |
| Ses | TR ve EN TTS |
| Öncelik | Arayüz iki dilde baştan; içerikte önce **7–8 ve lise bantları** (uluslararası programlı kolejlerin ihtiyacı), sonra küçük yaşlar |

Hacim: 241 ders + 43 rehber + 37 parça + ~1.190 soru. Otomatik çeviri + insan onayıyla bant bant ilerlenir.

## 8. Ticari model (hipotez — pilotla doğrulanacak)

- **Okul lisansı, öğrenci başına yıllık**, bant paketleri veya tüm platform (kampüs lisansı).
- **Pilot:** 2–3 kolejde 1 dönem ücretsiz/indirimli; karşılığında kullanım verisi + referans.
- **Ek gelir:** öğretmen eğitimi ve sertifikası, yarışma hazırlık kampı, isteğe bağlı fiziksel kit ortaklığı (platformun
  şartı değil).
- **Fiyat referansları:** Brilliant bireysel 3.600 TL/yıl (aile 7.200 TL/yıl, 6 kişi); Wokwi sınıf planı ~30 €/öğrenci/dönem.
  Okul fiyatı bireysel fiyatın belirgin altında, koltuk sayısına göre kademeli olmalı. Rakam pilot görüşmelerinde test edilir.
- Bireysel/aile üyelik: altyapı hazır, **okul tabanı oluştuktan sonra** açılır (okul öğrencisinin velisine yaz kampı/evde
  devam teklifi doğal ilk kanal).

## 9. KVKK, çocuk güvenliği ve güven

- **Rol dağılımı:** okul = veri sorumlusu, biz = veri işleyen → her okulla **veri işleme sözleşmesi**.
- **En az veri:** öğrenci için ad/rumuz + sınıf yeterli; e-posta zorunlu değil (QR/resimli giriş).
- Velinin açık rızası gereken durumlar (ör. 16 yaş altı bireysel kayıt, AI tutor sohbet kayıtları) için onay akışı;
  bugünkü onay bandı taslak — hukukçu ile netleşmeli.
- **Sunucu konumu:** Railway sunucuları yurt dışında → KVKK yurt dışı aktarım kuralları (standart sözleşme vb.)
  değerlendirilmeli; okullar bunu soracak. Yurt içi barındırma seçeneği maliyetiyle birlikte not edilmeli.
- Okul hesaplarında **reklam yok**, öğrenciler arası mesajlaşma yok, herkese açık profil yok.
- AI tutor: içerik filtresi, yaşa göre sistem talimatı, sohbet kayıtları öğretmen panelinde, okul bazında kapatılabilir.
- Derleme servisi: girişsiz açık uç kapatılmalı, kalıcı hız sınırı, ağ erişimi olmayan ayrı servis (`docs/derleme-servisi.md`).
- Erişilebilirlik: klavye ile kullanım, renk körlüğü dostu geri bildirim (yalnız yeşil/kırmızıya güvenmemek), sesli anlatım.

## 10. Yol haritası

Hedef: **Şubat 2027 (2. dönem) başında 2–3 kolejde pilot.** Bugünden ~4 ay.

| Faz | Kapsam | Çıktı |
|-----|--------|-------|
| **0 — Temel** | Hesap sistemi açılır; rol + okul/sınıf veri modeli; i18n iskeleti (arayüz TR/EN); KVKK metinleri; derleme servisinin güvenliği; GitHub'dan otomatik deploy | Okula açılabilir güvenli taban |
| **1 — Pilota hazır** | Öğretmen paneli MVP (sınıf, QR giriş, atama, ilerleme); ders v2 formatı + mini simler, **3 bantta birer pilot hafta** (M1, M2/M10, M3 H1); 40 dk ders planları; tanıtım sitesi + okul sunumu (TR/EN) | Pilot okullarda kullanılabilir ürün |
| **2 — Pilot dönemi** | Seviye tespiti + onboarding; günlük pratik; XP/seri/sınıf ligi; veli haftalık raporu; ders v2'ye toplu geçiş; 7–8 ve lise içeriğinin EN çevirisi | Kullanım verisi, öğretmen geri bildirimi |
| **3 — Ölçekleme** | Ders içi AI tutor; okul yönetici paneli + dönem raporu; SSO; MEB kazanım eşlemesi; yeni içerik: 5–7 yaş genişletme, AI Keşif (8–12), M6/M8/M9 | Satış için tam paket (Eylül 2027 okul yılı) |
| **4 — Bireysel** | Bireysel/aile üyeliği ve ödeme açılır; mobil uygulama/PWA + bildirimler | İkinci gelir kanalı |

**Pilot başarı ölçütleri:** atanan derslerin tamamlanma oranı, haftalık aktif öğrenci oranı, öğretmen hazırlık süresi,
öğretmen ve öğrenci memnuniyeti (NPS), okulun yenileme/genişletme niyeti, ön-son test beceri artışı.

## 11. Riskler ve karar bekleyenler

1. **İçerik hacmi:** iki dil × ders v2 dönüşümü büyük iş — bant bant ve otomatik doğrulamayla ilerlenmeli.
2. **5–7 yaş içeriği zayıf** (10 ders): Minikler bandı satılacaksa önce bu doldurulmalı.
3. **Öğretmen benimsemesi:** öğretmen eğitimi ve hazır ders planı olmadan okul satışı tutmaz.
4. **Barındırma ve KVKK:** yurt dışı sunucu sorusu okul sözleşmelerinde çıkacak.
5. **AI tutor maliyeti ve güvenliği:** okul lisansına dahil mi, ayrı paket mi?
6. **Marka:** "ASK Robotic" adı iki dilde ve okul pazarında doğru mu?
7. **Gerçek kit:** platform donanımsız; ama bazı okullar "gerçek robota geçiş" isteyecek — ortaklık mı, hiç mi?

## 12. Hemen sonraki adımlar

1. Bu belgedeki bant yapısı, hedef pazar ve fiyat hipotezi üzerinde karar.
2. Faz 0 için teknik plan: veri modeli, i18n, hesap sistemi.
3. Ders v2 pilotu: Modül 3 Hafta 1'in yeni formatta bir dersi (prototip).
4. Pilot okul listesi ve okul sunumu (TR/EN).

Kaynaklar (MEB): [Bilişim Teknolojileri ve Yazılım öğretim programı](https://tymm.meb.gov.tr/ogretim-programlari/ders/bilisim-teknolojileri-ve-yazilim-dersi) ·
[Ortaokul Robotik Kodlama dersi](https://tymm.meb.gov.tr/ortaokul-robotik-kodlama-dersi/unite/1578) ·
[Yapay zekâ uygulamaları dersi müfredatı (haber)](https://www.benguturk.com/egitim/meb-ortaokullarda-yapay-zeka-uygulamalari-dersinin-mufredatini-hazirladi-135280h)
