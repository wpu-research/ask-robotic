# Brilliant.org Analizi → ASK Robotic'e Uyarlama

Tarih: 2026-10-14 · Kaynak: brilliant.org'un herkese açık sayfaları, yardım merkezi, kurs sayfaları ve 3. taraf incelemeler.
Üyelik gerektiren ekranlar (ders içi akış, onboarding anketi, pratik ekranı, veli paneli) henüz görülmedi; bu kısımlar
"doğrulanacak" olarak işaretli.

---

## 1. Brilliant ne satıyor?

- **Başlık:** "Your personal tutor for math and coding". Kendini video kursu olarak değil, **kişisel öğretmen** olarak konumluyor.
- **Karşı konum:** "Cheating machine değil" — ChatGPT/ödev uygulamalarına karşı "cevabı vermeyen, düşündüren" tutor.
- **Hedef kitle:** 5. sınıftan üniversiteye ve yetişkinlere. Giriş ekranında ilk ayrım: **"Öğrenciyim" / "Veli veya öğretmenim"**.
- **Güven sinyalleri:** 10M+ öğrenci, 100K+ 5 yıldızlı yorum, ACS WASC akreditasyonu, kidSAFE (çocuk gizliliği) sertifikası,
  MIT/Harvard/Stanford uzmanları, "binlerce okulda kullanılıyor".
- **Zaman vaadi:** "akşam yemeğinden önceki sessiz 20 dakika" — kısa oturum, mobil öncelikli.

## 2. Pedagojik çekirdek (asıl kopyalanacak şey)

| İlke | Brilliant'ta nasıl |
|------|--------------------|
| **Önce problem, sonra açıklama** | Her adım 2–4 cümle + görsel, ardından **hemen** o kavramı kullanan bir soru. Uzun metin blokları yok. |
| **Yaparak öğrenme** | Etkileşimli görseller: sürükle-bırak, kaydırıcı, matematik klavyesi, kod editörü (yaz-çalıştır). |
| **Anında geri bildirim** | Her cevaptan sonra doğru/yanlış + yanlışsa animasyonlu açıklama. |
| **Basamaklı ipucu** | Yanlışta cevabı vermeyen, düşünceyi yönlendiren ipucu. |
| **Yoğun alıştırma** | Ders başına ~10–25 problem, 15–30 dk (mobilde 5–15 dk). |
| **Zorluk merdiveni** | Ders içinde problemler giderek zorlaşır ve gerçek hayat uygulamasına bağlanır. |
| **Geri çağırma + aralıklı tekrar + karıştırma** | Zorlanılan kavramlar sonraki günlerde tekrar sorulur (retrieval, spacing, interleaving). |
| **Ustalık (mastery)** | Düzenli ustalık değerlendirmeleri; eksik kalırsa hedefli pratik. |
| **AI çağı becerileri** | "Coding Skills That Matter in the Age of AI": kod okuma, hata ayıklama, tasarım, doğrulama, güvenlik, AI ile üretme. Kapsadıkları/kısmen kapsadıkları/kapsamadıkları **açıkça** yazılı. |

### İçerik hiyerarşisi

```
Learning Path (öğrenme yolu, pratik kontrol noktalarıyla)
 └─ Course (kurs)
     └─ Level / Unit (seviye — eskiden "level", şimdi "unit")
         └─ Lesson (ders, 15–30 dk)
             └─ Exercise (tek ekranlık etkileşimli problem)
```

Örnek yoğunluklar:

| Kurs | Seviye | Ders | Alıştırma | Alıştırma/ders |
|------|-------:|-----:|----------:|---------------:|
| Introduction to Neural Networks | 3 | 15 | 112 | ~7.5 |
| Thinking in Code | 9 | 48 | 618 | ~13 |

Desenler:
- Her seviyenin sonunda **"Level Review"**, birçok seviyede bir **"Challenge"** dersi (ör. "While Loop Challenge").
- Kurslar **merak sorusuyla** açılır: Neural Networks → "The Folly of Computer Programming", "Can Computers Learn?" — önce
  "neden klasik programlama yetmiyor" hissettirilir, sonra nöron/katman.
- Thinking in Code bir **ızgarada hareket eden karakter** üzerinden döngü, koşul, değişken öğretir ("Navigating a Grid",
  "Avoiding Obstacles", "Solving Mazes") — bizim robot arenamızın birebir karşılığı.
- AI kursları: How AI Works (canlı sohbet arayüzüyle n-gram, tokenizasyon, temperature), Intro to Neural Networks,
  Clustering & Classification, Regression, Search Engines.

## 3. Koji — AI tutor (2026-05'te lansman)

- Dersin **içine gömülü**; genel chatbot değil. Ekrandaki etkileşimi ve öğrencinin cevaplarını **görür**.
- Cevabı vermez; **yönlendirici soru** sorar, ekranda çizer/vurgular, öğeleri yeniden düzenleyerek gösterir.
- Sesli veya yazılı.
- Neyi bildiğini/bilmediğini takip eder, tempoyu ayarlar, eksiklere göre pratik kurar.
- "Kendi cümlenle sor" → seni doğru kavrama/derse **yönlendirir** (katalog arama yerine).
- Ücretsiz planda sınırlı, Premium'da sınırsız.

## 4. Motivasyon katmanı

| Mekanik | Kural |
|---------|-------|
| **XP** | Kavram tamamlama + problem çözme. Miktar "harcanan emekle orantılı". Aynı gün tekrar → XP yok; başka gün tekrar → XP var. |
| **Seri (streak)** | Günde **3 problem veya 1 kavram/ders** → seri uzar. Eşik bilinçli olarak düşük. |
| **Seri şarjı** | Ders/pratik bitirerek kazanılır, en fazla **2** tutulur, kaçırılan günde otomatik harcanır (seri korunur ama artmaz). |
| **Ligler** | Haftalık, **30 kişilik** gruplar, **10 lig** (element isimleri: Hidrojen → Einsteinium). Pazartesi 03:00 UTC sıfırlanır; ilk XP'yi kazanınca lige girersin; üst sıralar yükselir, alt sıralar düşer. |
| **Günlük hedef / widget** | iOS ana ekran widget'ı: seri + pratik daveti. |
| **Bildirimler** | Tamamlanan dersler, güçlü yönler, pratik gereken alanlar özeti. |

## 5. Veli / öğretmen / okul

- **Veli paneli:** bağlı öğrencinin pratik sıklığı, aktif konular, kurs/beceri ilerlemesi, Koji kullanımı.
- **Öğretmen:** sınıflar için ücretsiz, bölge (district) için teklif; başvurulu eğitimci programı, hibe ile ücretsiz erişim.
- **Müfredat uyumu:** Common Core'a standart standart eşleme — eşleşmeyen standartlar da açıkça yazılı.
- **Ev okulu** (homeschool) kullanımı destekleniyor.
- Sertifika veriyor ama "kredi veren kurum değiliz" diye açıkça belirtiyor.

## 6. İş modeli

- **Ücretsiz:** günlük limit (kaynaklara göre günde 2 ders veya kursların ilk birkaç dersi), günde 1 pratik problemi,
  sınırlı Koji, reklam.
- **Premium:** tüm kurslar, sınırsız pratik, sınırsız Koji. Fiyat kaynaklara göre değişiyor: aylık ~$25–28, yıllık
  ~$150–162 (bazı kaynaklarda ~$240). Bireysel + aile planı, 7 gün deneme, hediye.
- **Ücretsiz K-5 Pratik kütüphanesi:** hesap gerektirmeyen, basılabilir çalışma kâğıtlı — **SEO ve güven kapısı**.

## 7. Zayıf noktaları (bizim fırsatlarımız)

- Kodlama derinliği Codecademy/Udemy seviyesinde değil; bazı veri/kod kursları matematik kurslarından zayıf.
- Bazı kullanıcılar dersleri "fazla basit" buluyor.
- **Fiziksel/robotik dünya yok:** "Circuits" ve "Digital Circuits" dışında donanım yok; robot, sensör, motor, gerçek
  mikrodenetleyici simülasyonu yok.
- Türkçe yok, Türk müfredatına (MEB) eşleme yok.
- 5–9 yaş için ana müfredat yok (yalnız aritmetik pratiği).

---

## 8. ASK Robotic bugünkü durum — karşılaştırma

| Boyut | Brilliant | ASK Robotic (2026-10-14) | Durum |
|-------|-----------|--------------------------|-------|
| Konumlama | Kişisel tutor | "0'dan AI Robotik Mühendisliğine" modüler platform | Mesaj netleşmeli |
| Ders akışı | Problem → kısa açıklama → problem … (10–25 adım) | 6 adım: Merak → Anlatım → Etkinlik → Test → Konuşalım → Bitti | **En büyük fark** |
| Soru yoğunluğu | ~7–13 alıştırma/ders, ders boyunca | ~5 soru/ders (1.190 / 241), sonda ayrı blok | Düşük ve geç |
| Soru tipleri | Çoktan seçmeli, sayısal, sürükle-bırak, kaydırıcı, kod yaz-çalıştır, görsel manipülasyon | Çoktan seçmeli, sayısal (tolerans+birim), hatayı bul, çıktıyı tahmin et | İyi temel, görsel/etkileşimli tipler eksik |
| Etkileşimli araçlar | Ders içine gömülü küçük interaktifler | Güçlü ama **ayrı sayfalarda**: Laboratuvar, Arena, Atölye, Sahne, Mikro Kart, Oyun Atölyesi, 8 oyun, AI Atölyesi | **Bizim avantaj** — derse gömülmeli |
| İpucu | Basamaklı, cevabı vermeyen | Hedef panelinde tamamlanmamış hedefe ipucu | Kısmen var |
| Ustalık | Ustalık değerlendirmesi → hedefli pratik | ~350 beceri, ağırlıklı ustalık puanı hesaplanıyor ama **önerileri yönlendirmiyor** | Altyapı hazır, kullanılmıyor |
| Aralıklı tekrar | Var | Yok | Eksik |
| Seviye sonu tekrar / challenge | Her seviyede | Haftalık proje + rehber var, "hafta tekrarı" sınavı yok | Kolay kazanım |
| AI tutor | Koji (ekranı görür, Sokratik) | Yok | Büyük fırsat (Claude) |
| XP / seri / lig | Var | Yalnız birkaç rozet | Eksik |
| Hesap / senkron | Web + iOS + Android senkron | **Giriş kapalı**, ilerleme yalnız `localStorage` | **Her şeyin önkoşulu** |
| Onboarding / seviye tespiti | Öğrenci/veli ayrımı, seviyeye göre başlangıç | Yok — 5 yaşla 13 yaş aynı kataloğu görüyor | Eksik |
| Öğrenme yolları | Var | Modüller var, "yol" kavramı yok (track: cocuk/maker/ai alanı mevcut) | Kolay kazanım |
| Veli / öğretmen | Veli paneli, ücretsiz sınıf | Şemada rol var, ekran yok | Eksik |
| Ansiklopedi / başvuru | — | 37 parça sayfası | **Bizim avantaj** |
| Gizlilik / çocuk | kidSAFE, COPPA | KVKK onay bandı taslak | Lansman öncesi şart |
| Para | Freemium + Premium | Yok | Karar gerekiyor |

## 9. Uyarlama: Brilliant mantığı → robotik & AI

### 9.1 Ders formatını "problem-öncelikli adımlar"a çevir (en yüksek etki)

Bugünkü `explainerMd` + `contentMd` + `quiz[]` yapısı, ders sırasında serpiştirilmiş kısa adımlara dönüşmeli:

```
step 1  "Merak"       : 2 cümle + LED'in yanıp söndüğü küçük sim  → "Sence neden 1 saniyede bir?"
step 2  açıklama      : 3 cümle delay() + vurgulu kod
step 3  etkileşim     : kaydırıcı ile delay'i değiştir, LED'i izle
step 4  soru          : "delay(250) olursa saniyede kaç yanar?" (sayısal)
step 5  hatayı bul    : yanlış pinMode'lu kod
step 6  mini-lab      : devreyi sen tamamla (gömülü laboratuvar, tek hedef)
...
step N  "Konuşalım"   : veliyle/sınıfla tartışma sorusu
```

- İçerik şeması: `lesson.steps[]` (type: `text | sim | slider | quiz | build | code | predict | discuss`).
  Mevcut quiz soruları ve kavram kartları ilk geçişte bu adımlara dağıtılabilir; hedef ders başına **8–15 etkileşim**.
- Mevcut araçların **gömülebilir mini sürümleri** gerekir: tek hedefli `<MiniLab>`, `<MiniArena>`, `<MiniBlockly>`,
  `<MiniAIWidget>`. Tam araç sayfaları "serbest atölye" olarak kalır.

### 9.2 Robotik/AI'ye özel etkileşim tipleri (Brilliant'ta olmayan, bizi ayıran)

| Tip | Örnek |
|-----|-------|
| Devreyi tamamla | Breadboard'da eksik tek kabloyu yerleştir |
| Pini eşle | Sensörün OUT ucunu doğru Arduino pinine sürükle |
| Değer kaydırıcı | Direnci değiştir → akım ve LED parlaklığı anında değişsin (Ohm yasası) |
| Sinyal oku | Sensör grafiğinden eşik değeri seç |
| Kodu harekete eşle | 3 kod parçasını robotun 3 rotasıyla eşleştir |
| Çıktıyı tahmin et → çalıştır | Önce tahmin, sonra simde doğrula (tahmin-gözlem-açıklama) |
| Kablo/kod hatası avı | Simde çalışmayan devrede hatayı bul |
| AI eşik oyunu | Sınıflandırıcı eşiğini kaydır → karışıklık matrisi ve hatalı örnekler değişsin |
| Token/olasılık | Temperature kaydırıcısı → sonraki kelime dağılımı (AI Atölyesi'nde zaten var) |

### 9.3 Ustalık + aralıklı tekrar (altyapı zaten var)

- `lib/skills.ts`'deki ustalık puanını `recommendNext`'e bağla: ders sırası yerine "zayıf beceri + sıradaki ders".
- **Günlük Pratik**: zayıf/eski becerilerden 5–8 soruluk karışık set (interleaving). Soru bankası olarak mevcut 1.190 soru.
- Her haftanın sonuna **"Hafta Tekrarı"** + modül sonuna **"Challenge"** dersi.

### 9.4 Motivasyon (çocuk dostu)

- **XP**: emeğe orantılı, aynı gün tekrarda yok (Brilliant kuralı birebir uygun).
- **Seri**: günde 3 soru veya 1 ders; **seri şarjı** max 2. Çocuklar için kayıp korkusu yerine "pil" metaforu.
- **Ligler**: robotik isimleriyle — ör. Direnç → Kondansatör → Transistör → Mikrodenetleyici → Servo → Sensör → Lidar →
  Robot Kol → Otonom → Android. Çocuklarda yalnız **sınıf içi** veya kapatılabilir olmalı (dışarıdan yabancılarla
  sıralama, veli onayı olmadan açılmamalı).
- Rozetler zaten var; haftalık proje tamamlamaya **proje rozeti** ve paylaşılabilir proje kartı.

### 9.5 Onboarding ve öğrenme yolları

- Giriş: **"Öğrenciyim / Veliyim / Öğretmenim"** ayrımı.
- Öğrenci: yaş + hedef + 5–8 soruluk seviye tespiti → yol önerisi.
- Yollar (mevcut `track` alanı üzerine):
  - **Minik Kodlayıcı** (5–7): Modül 1
  - **Oyun Yapımcısı** (8–12): Modül 2 → 11
  - **Maker** (8–12): Modül 10 → 3
  - **Robotik Mühendisi** (12+): 3 → 4 → 5 → (6, 8, 9)
  - **AI Mühendisi** (13+): 3 → 7 (+ 5)
- Modül numarası boşlukları (1–5, 7, 10, 11) öğrenciye gösterilmemeli; öğrenci yol içi sırayı görmeli.

### 9.6 AI tutor ("Koji" karşılığı) — Claude ile

- Derse gömülü; bağlam olarak **ders adımı, öğrencinin cevabı, kod, sim durumu (pin değerleri, seri monitör, hata)**
  verilir.
- Kural: cevabı söyleme, yönlendirici soru sor, ekranda ilgili öğeyi vurgula (ör. `highlight: "pin-13"`).
- "Kendi cümlenle sor" → ilgili ders/parça sayfasına yönlendirme (241 ders + 37 parça zaten indekslenebilir).
- Riskler: çocuk güvenliği (içerik filtresi, sohbet kaydı velinin görebileceği yerde), maliyet (ücretsiz planda günlük
  limit), KVKK (13 yaş altı veli onayı).

### 9.7 Veli / öğretmen

- Veli paneli: haftalık süre, seri, tamamlanan dersler, beceri haritası (güçlü/zayıf), AI tutor kullanımı.
- Öğretmen: sınıf oluşturma, ödev olarak ders/hafta atama, sınıf ligi, beceri ısı haritası.
- MEB müfredatı (Bilişim Teknolojileri ve Yazılım, Fen) ile eşleme — Brilliant'ın Common Core şeffaflığı gibi.

### 9.8 İş modeli önerisi (karar sizde)

- Ücretsiz: her modülün ilk haftası + günde 1 Günlük Pratik + parça ansiklopedisi + serbest atölyeler (sınırlı).
- Premium (bireysel/aile): tüm dersler, sınırsız pratik, AI tutor.
- Okul: öğretmen paneliyle sınıf lisansı.
- Ücretsiz, hesapsız **"Parça Ansiklopedisi" + "Mini Deneyler"** sayfaları → SEO ve güven kapısı (Brilliant'ın K-5 kütüphanesi gibi).

---

## 10. Önceliklendirilmiş yol haritası

| Faz | İş | Neden | Bağımlılık |
|-----|----|-------|------------|
| **0** | Giriş/hesap sistemini aç, ilerlemeyi sunucuda tut, KVKK metinleri, derleme servisine kalıcı rate limit | Seri, lig, veli paneli, ödeme — hepsi hesaba bağlı | — |
| **1** | Ders formatı v2 (`steps[]`) + gömülebilir mini simler; önce **1 pilot hafta** (ör. Modül 3 Hafta 1) | En büyük pedagojik fark | — (hesap gerekmez) |
| **1** | Onboarding + öğrenme yolları | 5 yaş/13 yaş ayrımı | Hesap (veya localStorage ile geçici) |
| **2** | Ustalık → öneri, Günlük Pratik, Hafta Tekrarı/Challenge | Altyapı hazır, düşük maliyet | Hesap |
| **2** | XP + seri + seri şarjı + günlük hedef | Alışkanlık | Hesap |
| **3** | AI tutor (Claude) pilotu — tek modülde | Farklılaştırıcı | Ders v2 adım bağlamı |
| **3** | Veli paneli, öğretmen/sınıf | Satın alan kişi veli/okul | Hesap |
| **4** | Ligler (sınıf içi), freemium/ödeme, mobil PWA + bildirim | Büyüme | Hepsi |
| Paralel | Modül 2–11'in tüm derslerini v2 formatına taşı; Modül 6/8/9 yeni formatta yazılsın | İçerik | Pilotun onayı |

## 11. Üye ekranları — gözlemler (2026-10-14, 45 ekran görüntüsü)

### 11.1 Onboarding: kayıt formundan ÖNCE yatırım

Sıra (her ekran tek soru, büyük kartlar, Koji maskotu solda "konuşuyor"):

1. "Hi, I'm Koji! I'll be your personal tutor." — ilk temas ürünle değil **karakterle**.
2. **Motivasyon:** Okulda başarı / Profesyonel gelişim / Zihni keskin tutmak / Çocuğumun öğrenmesine yardım.
3. **Koji'nin sesi:** Melodik / Derin + "Voice on" anahtarı → tutor sesli anlatıyor.
4. **Demo 1:** "Takılırsan yardım ederim" — Koji sürükle-bırak bir denklemde boşlukları gösteriyor (animasyon).
5. **Demo 2:** "Seni doğru yöne yönlendiririm" — Koji grafikte bir noktayı işaret ediyor.
6. **Yaş** (serbest sayı, ⓘ ile neden sorulduğu açıklaması).
7. **Önce hangi konu?** Matematik / Bilgisayar Bilimi — "ikisinde de sonra ilerleyebilirsin".
8. **Sosyal kanıt:** ekip fotoğrafları + Stanford/MIT/Harvard/Cornell/Caltech logoları.
9. **Seviye** — her seçenekte **kod örneği** var: `print("hello")` Başlangıç · `if b > a:` Acemi ·
   `for i in range(5)` Orta · `def circle(size)` İleri. Öğrenci kendini kodla tanımlıyor.
10. "Sana gereken her şey bizde."
11. **Günlük hedef:** 10 / 20 / 30 / 60 dk.
12. **Günün hangi saati:** Sabah rutini / Öğle arası / Gece ritüeli / Başka zaman (bildirim zamanı için).
13. **Kayıt:** "Öğrenme planını görmek için ücretsiz profil oluştur" — Google tek tık veya e-posta.
    → 12 soruya cevap veren kullanıcı planını görmek için kayıt oluyor (**batık maliyet**).

### 11.2 Paywall ve ödeme

- **Karşılaştırma:** Ücretsiz = günlük 1 ders. Premium = sınırsız öğrenme, Koji ile öğretmenlik, reklamsız,
  **ileri atlama + kişisel pratik**.
- **Deneme zaman çizelgesi:** Bugün erişim → 5. gün e-posta hatırlatma → 7. gün ücret ("21 Ekim'e kadar iptal et").
  Şeffaflık güven veriyor.
- **TL fiyat (yerelleştirilmiş):** Yıllık planda Bireysel **300 TL/ay** (yılda tek ödeme **3.600 TL**),
  Aile **600 TL/ay, 6 kişi**. Aylık sekmesi de var; yıllık sekme "7 gün ücretsiz" rozetli, varsayılan seçili.
- Stripe ödeme: bugün 0 TL, iki ayrı onay kutusu (ŞVK + otomatik yenileme açık metni).
- Sonrasında: "Premium Deneme Açıldı!" kutlama ekranı (**+45 XP** hediye), "bizi nereden duydun?" (seçenekler arasında
  **AI chatbot** var), "uygulamayla daha iyi" QR ekranı.

### 11.3 Öğrenme planı ekranı

- "Öğrenme planın oluşturuluyor…" yükleme animasyonu (kişiselleştirme hissi).
- 4 kartlı tanıtım: giriş dersi → **REINFORCE SKILL** (kişisel pratik) → **SKILL CHECK** (değerlendirme) → "kısa sürede
  profesyonel gibi kodlayacaksın". Bu kartlar, öğrenme döngüsünü baştan öğretiyor: **öğren → pekiştir → ölç**.
- Yol karuseli: "Programming & CS — Bilgisayarların dilini konuş". Seviye cevabına göre ortadan bir kursa
  **"START HERE"** etiketi (Algorithmic Thinking). Öncekiler soluk ama görünür, yani atlanmış ama erişilebilir.

### 11.4 Ders oynatıcısı (Algorithmic Thinking → The Scheduling Problem)

Ekran düzeni:
- Üstte ilerleme çubuğu + 3 nokta (ders bölümleri), sağ üstte **XP sayacı** ve seri şimşeği.
- Solda bayrak (hata bildir) ve ses.
- Sol altta **Koji balonu**: her ekranın metnini sesli okuyor; yanında **sohbet** ve **mikrofon** düğmeleri.
- Altta tek ana düğme: **Continue** → etkileşimli ekranda **Check** (öğrenci bir şey yapana kadar pasif).

Akış:
1. **Kanca:** illüstrasyon + başlık + tek cümle ("Çakışmasız bir takvim kuralım").
2. **Etkileşim:** takvim üzerinde toplantı bloklarına dokunarak seç. Üstte **hedef kontrol listesi**
   (→ Çakışma yok, → 2 toplantı kabul et), "Baştan başla" bağlantısı.
3. **Doğru:** tüm ekran **yeşile** dönüyor, kontrol listesi tiklerle doluyor, Koji kısa onay ("That's the one.",
   "Yep.", "Nicely done."). Düğmeler: **Why?** (açıklama isteğe bağlı) + **Continue**. Her alıştırma **+15 XP**.
4. **Aynı widget, değişen kısıt:** 2 kabul et → yalnız 2 reddedilen kalsın → 3 kabul + 15:00 sonrası yok →
   kabul edileni maksimize et. Tek bir etkileşimli araçla 4–5 alıştırma yapılıyor (**içerik üretim maliyeti düşük**).
5. **Formalleştirme en sonda:** sezgi oturduktan sonra aynı takvimin altında sözde-kod beliriyor
   (`set accepted to []`, `sort meetings by end`, `for meeting in meetings …`) — "zihnindeki yöntemi algoritmaya çevir".
6. Ders birkaç dakikada ~60 XP ile bitiyor.

Python dersi (Thinking in Python → Variables):
- **Hikâye çerçevesi:** "LockedIn adlı ağ uygulamasının güvenliği zayıf, değişkenlerle başlayalım."
- **Token'lı kod editörü:** kod klavyeyle yazılmıyor; boşluğa **hazır parçalara dokunarak** yerleştiriliyor
  (`"chiefofstuff"` / `"chiefOfStuff"` / `"chiefOFSTUFF"` — büyük/küçük harf tuzağı). Geri al, sağ/sol imleç,
  açılır **OUTPUT** paneli. Mobilde yazım zorluğunu ortadan kaldırıyor, yanlış seçenekler kavram yanılgısını hedefliyor.

### 11.5 Kurs haritası (Topics)

- Sol kart: kurs adı, tek cümle, **22 ders · 249 alıştırma** (~11 alıştırma/ders).
- Sağda dikey, zikzak **disk yolu** (Duolingo tarzı): Seviye 1 "The Scheduling Problem" → Solving Instances →
  Multiple Solutions → Identifying Invariants → Finding Counterexamples → **Level Review** (farklı, rozet biçimli düğüm).
  Seviye 2 "Prioritizing Shorter Durations", Seviye 3 "Prioritizing Early Starts", Seviye 4 "Optimization"
  (Greedy Optimization …). Her seviye 4–5 ders + tekrar.
- Seviye adları bile **problem**: "Kısa süreliye öncelik vermek", "Erken başlayana öncelik vermek" — her seviye bir
  stratejiyi dener, karşı örnekle çürütür, günceller.
- Sağ altta sabit **dambıl düğmesi** = kişisel pratik. Sonda **UP NEXT:** bir sonraki kurs.
- Üst menü yalnız 3 sekme: **Home / Topics / You** + "Gift Premium" + seri sayacı.

### 11.6 Ana sayfa

- Sol kart: **seri** (1 ⚡, haftanın günleri halkaları) + sağ üstte 2 pil simgesi (**seri şarjları**).
  Altında kilitli kalkan: **"Ligleri aç — 100 / 175 XP"** → ligler yeni kullanıcıya hemen değil, eşikten sonra açılıyor.
- Sağ kart: aktif kurs, seviye ilerleme çubuğu, Koji'den "Bugün iyi iş!", son ders ✓, **Continue course**.
- Altta Koji arama/sohbet kutusu: "Neye yardım lazım?" + öneri çipleri (Cebir öğren, İkinci dereceden denklemler,
  Python öğren) + mikrofon. "Learn Python" → Koji tek kartla **önerilen dersi** döndürüyor (Variables · Thinking in Python
  · Level 1 · Start). Katalog gezmek yerine **niyetten derse** yönlendirme.

### 11.7 ASK Robotic'e doğrudan aktarılacak desenler

| Brilliant deseni | Bizde karşılığı |
|------------------|-----------------|
| Kayıttan önce 10+ soruluk onboarding, kayıt "planını gör" için | Yaş → hedef (okul/hobi/veli) → alan (Kodlama/Elektronik/Robotik/AI) → seviye (kod örnekli: `digitalWrite`…) → günlük hedef → saat → kayıt |
| Seviyeyi kod örneğiyle seçtirmek | Seçenekler: blok resmi (5–8 yaş), `LED yak` bloğu, `digitalWrite(13, HIGH)`, `if (mesafe < 20)`, `servo.write(aci)` |
| Hedef kontrol listesi + Check + yeşil ekran + Why? | `goals-panel` zaten var → derse gömülü mini simlerde aynı kalıp, "Neden?" düğmesiyle açıklama |
| Aynı widget, değişen kısıtlar | Tek devre/robot sahnesiyle 4–5 alıştırma: "LED'i yak" → "1 sn yanıp sönsün" → "buton basılıyken" → "en az kodla" |
| Sezgi önce, formal kod sonra | Önce robotu elle/sürükleyerek labirentte gezdir, sonra aynı hamlelerin koduna dönüştür |
| Token'lı kod editörü | Arduino C++ için dokunmatik parça editörü (`HIGH`/`LOW`, pin numaraları, `delay` değerleri); tam editör ileri seviyede |
| Hikâye çerçevesi | "Seranın sulama sistemi bozuldu", "Kargo robotu yolu bulamıyor", "Akıllı ev alarmı" |
| Koji sesli anlatım + mikrofon | Türkçe TTS ile ekran metnini okuma — **5–8 yaş için kritik** (okuma bilmeyen çocuk) |
| Seri + 2 şarj, ligler 175 XP'de açılır | Aynı; çocuklarda lig sınıf içi |
| Ana sayfada "Neye yardım lazım?" → önerilen ders kartı | 241 ders + 37 parça üzerinde niyet → ders yönlendirmesi |
| Disk yolu + Level Review düğümü + UP NEXT | Modül sayfası: hafta = seviye, ders = disk, "Hafta Tekrarı" rozet düğümü, sonda sıradaki modül |
| TL fiyat: 3.600 TL/yıl bireysel, 6 kişilik aile 7.200 TL/yıl | Fiyatlandırma için piyasa referansı |
| Konu kataloğu: bölüm → konu (seviye etiketi + tek cümle + NEW + yıldız) | Aşağıda 11.8 |

### 11.8 Konu kataloğu (Topics)

Katalog kurs listesi değil, **konu (topic) listesi**. Her konu açılır (˅) ve içinde sıralı kurslar var (ör. Programming & CS →
Variables → Functions → Algorithmic Thinking → CS Fundamentals → How AI Works …).

| Bölüm | Konu | Seviye etiketi |
|-------|------|----------------|
| Math | Math Foundations (NEW) | (ilkokul sonu–ortaokul başı) |
| | Algebra Fundamentals | GRADES 7–9 |
| | Intermediate Algebra (NEW) | GRADES 8–11 |
| | Advanced Algebra (NEW) | GRADES 11–12 |
| | Advanced Math (NEW) | ADVANCED |
| | Logical Reasoning | INTERMEDIATE |
| | Everyday Math | FOUNDATIONAL |
| | Mind-Bending Math | FOUNDATIONAL TO ADVANCED |
| Programming & CS | Programming & CS | FOUNDATIONAL |
| | Python (NEW) | INTERMEDIATE |
| | Technology | INTERMEDIATE |
| Data & Science | Data Analysis | INTERMEDIATE |
| | Science | FOUNDATIONAL TO ADVANCED |

- Her satır: ikon + **seviye/sınıf etiketi** + ad + **tek cümlelik vaat** ("Speak the language of computers",
  "Translate ideas into powerful code") + sağda **yıldız** (favori/takip). Toplam yalnız ~13 konu — seçim yorgunluğu yok.
- **Arşivlenmiş kurslar** (Classical Mechanics, Group Theory, Linear Algebra, Math History, Physics of the Everyday,
  Special Relativity) gri, katlanmış bir bölümde hâlâ erişilebilir — eski içerik silinmiyor, vitrinden kalkıyor.

Bizim için karşılığı — 8 modülü **konu** düzeyinde yeniden gruplamak:

| Bölüm | Konu | Etiket | İçindeki modüller |
|-------|------|--------|-------------------|
| Kodlama | Blokla Kodlama | 5–7 YAŞ | M1 |
| | Oyun Yapımı | 8–12 YAŞ | M2 → M11 |
| Elektronik & Maker | Mikro Kart | 8–12 YAŞ | M10 |
| | Arduino ve Sensörler | 12+ | M3 → M4 |
| Robotik | Robotik | 13+ | M5 (→ M6, M8, M9) |
| Yapay Zekâ | AI Mühendisliği | 13+ | M7 |

## 12. Hâlâ bilinmeyenler

Ekran görüntüleriyle onboarding, paywall, ders oynatıcısı (doğru cevap akışı), kurs haritası, ana sayfa ve katalog
görüldü. Henüz görülmeyenler:

1. **Yanlış cevap akışı:** ekran kırmızıya mı dönüyor, Koji ne diyor, ipucu kaç basamak, cevap ne zaman gösteriliyor?
2. **Koji sohbeti:** derste takılınca sohbet/mikrofonla sorulduğunda verdiği cevap; ekranda vurgulama yapıyor mu?
3. **Kişisel pratik (dambıl) ve Level Review** ekranları; ustalık göstergesi.
4. **"You" sekmesi:** profil, istatistik, rozetler, beceri haritası.
5. **Ders sonu ekranı:** XP özeti, seri animasyonu, "sıradaki".
6. **Ligler** (175 XP'den sonra açılıyor) ve **veli paneli**.
7. Uzun bir dersin tamamı (ör. Thinking in Python → Variables): toplam ekran sayısı, açıklama/etkileşim oranı.
