# ESOF 323 çevrimiçi sınav (/sinav)

Öğrenci: `robotix.macademia.com.tr/sinav` → sınav kodu + öğrenci no + ad soyad. Üç bölüm: A çoktan seçmeli (42'lik bankadan
haftalara dengeli, seçenek sırası karışık), B tanım sorusu (8'lik bankadan biri, öğretmen puanlar), C proje (25 projeden biri,
sınav içinde dengeli dağıtılır). Cevaplar 10 sn'de bir ve her değişiklikte kaydedilir; süre bitince son kayıt teslim edilir.
Sınav ekranında site menüsü, arama ve Robi (yapay zekâ) kapalıdır; pencereden çıkma ve büyük yapıştırmalar sayılır.

Öğretmen (admin hesabı): `/sinav/yonetim`
- Sınav oluştur (süre, soru sayısı, puanlar; varsayılan 10×3 + 10 + 60 = 100) → **Open exam** → kodu tahtaya yaz.
- Canlı tablo 5 sn'de bir yenilenir: kayıt saati, kalan süre, pencereden çıkma sayısı, puanlar.
- **Relogin**: öğrenci başka cihaza geçerse bir kez devralma izni. **+Time**: süre uzatma (teslimi geri alır). **Submit**: tek öğrenciyi teslim et.
- **Close & submit all**: tüm açık girişleri son kayıtla teslim eder.
- Öğrenci ayrıntısında: tanım cevabı + rubrik → puan gir; proje hedefleri (✓/✗), derleme hatası, seri çıktı; öğrencinin devresini
  ve kodunu çalıştırabilirsin; gerekirse proje puanını elle düzelt; **Regrade**.
- **Download CSV**: Excel'e uygun not listesi.
- `/sinav/yonetim/projeler`: 25 projenin görev metni, puanlanan gereksinimler ve örnek çözümü (laboratuvarda çalışır).

Proje puanlaması sunucuda: öğrencinin kodu arduino-cli ile derlenir, öğrencinin KENDİ devresinde benzetim çalıştırılır, projenin
senaryosu sensörleri değiştirip davranışı ölçer. Derlenmeyen kod davranış puanı alamaz (devre ve kod puanları yine verilir).

Sınav günü ortam değişkenleri (Railway `web`): `COMPILE_ENABLED=true`, `COMPILE_MAX_CONCURRENT=4`, `COMPILE_MAX_QUEUE=80`.
Derleme kotası sınavdaki öğrenci için IP değil giriş başınadır (dakikada 12).

Kod: `apps/web/src/lib/sinav` (types, grade, service, grader, questions, projects/a|b|c), rotalar `app/api/sinav`, sayfalar `app/sinav`.
Test: `cd apps/web && npx vitest run src/lib/sinav` (her projenin çözümü 100, boş başlangıç < 30).
