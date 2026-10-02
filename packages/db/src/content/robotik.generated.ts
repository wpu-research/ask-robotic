// OTOMATİK ÜRETİLDİ — elle düzenleme. Kaynak: content-src/modul-5/ · Komut: node tools/content/build.mjs modul-5
import type { ModuleContent } from './types'

export const modul5: ModuleContent = {
  "slug": "robotik",
  "title": "Robotik",
  "track": "maker",
  "position": 5,
  "minAge": 13,
  "weeks": [
    {
      "title": "Hareket temelleri",
      "project": "Komutlu araba",
      "guideMd": "### Hafta hedefleri\nBu haftanın sonunda öğrenci:\n1. Diferansiyel sürüşü açıklayabilir; sol ve sağ tekerlek hızından v, ω ve dönme yarıçapını hesaplayabilir, ters problemi çözebilir.\n2. Motor sürücüsünün (L298N, TB6612) yön ve hız girişlerini, doğruluk tablosunu (ileri, geri, fren, serbest) ve güvenli bağlantı kurallarını söyleyebilir.\n3. Ölü bölgeyi ve azami hızı ölçüp istenen hızı PWM'e çeviren kalibrasyon fonksiyonunu yazabilir.\n4. Seri porttan gelen harfli komutları ayrıştırıp robotu sürebilir.\n5. Komut watchdog'lu, durum makineli bir komutlu araba kurabilir ve watchdog'un bedelini (hız × süre) hesaplayabilir.\n\n### Haftanın planı\nHafta beş derstir; her ders 25-35 dakikadır. Plan günde bir ders içindir.\n\n| Gün | Ders | Süre | Ne yapılır |\n|---|---|---|---|\n| 1 | Diferansiyel sürüş: v, ω ve tekerlek hızları | ~25 dk | Anlatımı oku, formülleri elle uygula, sketch'i benzetimde dene, mini testi çöz. |\n| 2 | Motor sürücüsü L298N/TB6612: yön ve PWM | ~25 dk | Doğruluk tablosunu öğren, dört durumu sırayla çalıştır, fren ve serbest bırakmayı karşılaştır. |\n| 3 | Hız, ölü bölge ve kalibrasyon | ~30 dk | Ölü bölgeyi tara, iki noktadan doğru çiz, hizdanPwm ile naif eşlemeyi karşılaştır. |\n| 4 | Seri komutlarla sürüş (uzaktan kumanda simülasyonu) | ~25 dk | W S A D X komutlarını dene, hata durumlarını (Q, W999) gözle. |\n| 5 | Proje: Komutlu araba | ~35 dk | Watchdog'u kur, dizi komutlarını gönder, durma mesafesini ölç ve hesapla. |\n\n### Ön koşul kontrolü\nBu hafta Modül 1-3 (ve Modül 4'ün büyük bölümü) tamamlanmış kabul edilir. Başlamadan önce kontrol et:\n- PWM ve analogWrite'ı (Modül 3, 16. ders) açıklayabiliyor mu?\n- DC motorun neden doğrudan Arduino pininden sürülmediğini (22. ders) ve H-köprüsünün işini (23. ders) hatırlıyor mu?\n- millis() ile bloklamayan zamanlamayı (27. ders) ve enum ile durum makinesini (28. ders) kullanabiliyor mu?\n- Serial Monitor'den satır gönderip okuyabiliyor mu (9. ders)?\n- Ondalık sayılarla bölme ve çarpma, metre-santimetre çevirisi rahat mı?\n\n### Kavram haritası\n- **Hareket:** tekerlek hızları vL, vR → v ve ω → dönme yarıçapı R → ters problem\n- **Donanım:** motor sürücüsü → yön (IN) ve hız (EN, PWM) → fren ve serbest bırakma → ortak GND, ayrı motor gücü\n- **Hız denetimi:** PWM → ölü bölge → azami hız → iki noktadan kalibrasyon → hizdanPwm\n- **Komut:** seri tampon → harf + sayı → atoi, toupper, constrain → switch\n- **Güvenlik:** son komut sürer → watchdog (CMD_TIMEOUT) → durma mesafesi = hız × süre → güvenli durum\n\n### Sık yapılan hatalar\n- **Birimleri karıştırmak.** L = 0,12 m, 12 cm değil; ω rad/s cinsindendir, derece değil.\n- **ω'yı hızların toplamından hesaplamak.** ω fark ister, toplam v'ye gider.\n- **vR = vL iken R'yi hesaplamak.** Sıfıra bölme olur; düz gidişte R sonsuzdur.\n- **EN'i PWM olmayan pine bağlamak.** Uno'da PWM pinleri 3, 5, 6, 9, 10, 11'dir.\n- **GND'leri birleştirmemek ya da motoru Arduino'nun 5V'undan beslemek.** Ayrı pil ve ortak GND gerekir.\n- **PWM'i hız sanmak.** 128 yarım hız değildir; ölü bölge yüzünden düşük PWM'de motor hiç dönmez.\n- **Kalibrasyon sayılarını başka robota ya da boş pile uygulamak.** OLU_PWM ve V_MAX robota, zemine ve piline özgüdür.\n- **Satır sonu ayarını unutmak ya da switch'te break atlamak.** Komut hiç işlenmez ya da bir sonraki case'e düşülür.\n- **Geçersiz komutun da watchdog'u yenilemesine izin vermek.** Gürültü robotu sonsuza kadar sürdürebilir.\n\n### Hafta sonu tekrarı\n1. Her dersin kavram kartlarına bir kez daha bak ve \"sık yapılan yanlış\" satırlarını yüksek sesle oku.\n2. Mini testlerde yanlış yaptığın soruların açıklamalarını oku, sonra soruyu yeniden çöz.\n3. Elle hesapla: vL = 0,15 ve vR = 0,25 m/s için v, ω ve R kaç? Sonra aynı ω ve v için tekerlek hızlarını ters formülle yeniden bul.\n4. Kendi robotun (ya da benzetimdeki robot) için ölü bölgeyi ve azami hızı ölç; hizdanPwm ile 15 cm/s iste ve gerçek hızı kronometreyle karşılaştır.\n5. 700 ms watchdog'u 300 ms yapıp komutları 400 ms aralıkla gönder; ne olduğunu ve nedenini bir cümleyle yaz.\n\nHafta sonu testi olarak beş dersin mini testleri yeterlidir; her derste 5 soru, toplam 25 soru. Hedef: her dersten en az 4 doğru. Eksik kalan dersin anlatımına dön.\n\n### Proje değerlendirme ölçütü (Komutlu araba)\n| Ölçüt | Gelişmeli | Yeterli | İleri |\n|---|---|---|---|\n| Sürüş | Komutlardan biri yanlış yöne gidiyor | W, S, A, D, X doğru çalışıyor | Yerinde dönüş açısını hesaplayıp süreyle ayarlıyor (ω = 2v / L) |\n| Kalibrasyon | PWM'i doğrudan hız sanıyor | hizdanPwm ile cm/s komutları yaklaşık doğru hızda | Kendi OLU_PWM ve V_MAX değerlerini ölçmüş ve gösteriyor |\n| Güvenlik | Watchdog yok ya da robot açılışta hareket ediyor | 700 ms watchdog çalışıyor, açılışta duruyor | Geçersiz komutun watchdog'u yenilemediğini sınamış ve süre seçimini gerekçelendirmiş |\n| Ölçüm | Durma mesafesi ölçülmemiş | Watchdog sonrası yol ölçülüp hız × süre ile karşılaştırılmış | Farklı hızlarda ve süreler için ölçüp farkı yorumlamış |\n| Anlatım | Ne yaptığını anlatamıyor | Devreyi ve kodu adım adım anlatıyor | Bir hata yapıp nasıl bulduğunu ve nasıl düzelttiğini anlatıyor |\n\n### Veli ve öğretmen notu\n- **Amaç.** Bu hafta robotun nasıl hareket ettiğini matematikle anlamak ve ilk güvenlik düşüncesini (kontrol koparsa ne olur?) edinmektir. Hata yapmak güvenlidir: portal tamamen sanaldır.\n- **Nasıl destek olunur?** Cevabı söylemek yerine sor: \"Hangi tekerlek daha hızlı?\", \"Birimler metre mi santimetre mi?\", \"Komut kesilirse robot ne yapar?\"\n- **Süre.** Bir ders hesap, bir ders donanım, bir ders ölçüm ağırlıklıdır; dersleri aynı gün peş peşe yapmak yerine aralıklı çalışmak kalıcılığı artırır.\n- **Güvenlik.** Bu platformdaki her şey sanaldır. Gerçek robota geçilirse tekerlekleri havada denemek, ayrı pil kullanmak, pili ters bağlamamak ve kısa devre etmemek gerekir; şebeke gerilimiyle (220 V) hiçbir devre kurulmaz. Gerçek bir robotta durma mesafesi ölçülmeden güvenli sayılmaz.\n- **Gerçekle fark.** Benzetim temiz sonuç verir; gerçek robotta motorlar aynı hızda dönmez, tekerlekler kayar, kablosuz bağlantı gecikir.\n- **İlerleme.** Mini test sonuçları \"İlerlemem\" sayfasında beceri bazında görünür (taslak/pilot özellik; yalnız onay verildiyse kaydedilir).",
      "lessons": [
        {
          "title": "Diferansiyel sürüş: v, ω ve tekerlek hızları",
          "durationMin": 25,
          "problem": "Robot süpürgenin direksiyonu yok. Tek yaptığı, sol ve sağ tekerleğe farklı hız vermek. İki tekerlek aynı hızda dönerse düz gider, biri hızlıysa kavis çizer, ikisi zıt yönde dönerse olduğu yerde döner. Peki robotun 20 cm/s ile ilerlemesini ve saniyede 1 radyan (yaklaşık 57°) dönmesini istersen iki tekerleğe tam olarak hangi hızları vermelisin?",
          "contentMd": "Bu modülde robot iki motorlu tekerleğin farkıyla yönlenir. Buna **diferansiyel sürüş** denir. Robotun ölçüleri (benzetimdeki robot da bunları kullanır):\n\n- Tekerlek yarıçapı: r = 3,3 cm = 0,033 m\n- Aks aralığı (iki tekerleğin yere değdiği noktalar arası): L = 12 cm = 0,12 m\n\n### Formüller\nSol tekerleğin yerdeki hızı vL, sağınki vR olsun (m/s, ileri +). Robotun hareketini iki sayı anlatır:\n\n- **v**: robotun ortasının ileri hızı (m/s)\n- **ω** (omega): robotun dönme hızı (rad/s). Sola dönüş **+**, sağa dönüş **−**.\n\n```\nv = (vR + vL) / 2\nω = (vR − vL) / L\nR = v / ω = (L / 2) · (vR + vL) / (vR − vL)      (dönme yarıçapı, m)\n```\n\nBir tekerleğin yerdeki hızı, dönme hızıyla bağlantılıdır: vT = r · φ, burada φ tekerleğin rad/s cinsinden dönme hızıdır. Tekerlek saniyede 12 rad dönerse hızı 0,033 · 12 = 0,396 m/s olur.\n\nÖzel durumlar:\n\n| Durum | v | ω | R | Robot |\n|---|---|---|---|---|\n| vR = vL | vR | 0 | sonsuz | düz gider |\n| vR = −vL | 0 | 2·vR / L | 0 | yerinde döner |\n| vL = 0, vR > 0 | vR / 2 | vR / L | L / 2 = 6 cm | duran tekerleğin etrafında döner |\n| vR > vL > 0 | ortada | + | büyük | sola kavis |\n| vL > vR > 0 | ortada | − | büyük | sağa kavis |\n\n### Elle hesap\n1. **Düz:** vL = vR = 0,30 m/s. v = 0,30 m/s, ω = 0.\n2. **Kavis:** vL = 0,20, vR = 0,30. v = 0,25 m/s. ω = 0,10 / 0,12 = 0,83 rad/s (yaklaşık 48°/s). R = 0,06 · 0,50 / 0,10 = 0,30 m.\n3. **Yerinde dönüş:** vL = −0,30, vR = 0,30. v = 0. ω = 0,60 / 0,12 = 5 rad/s (yaklaşık 286°/s). Tam tur 2π / 5 = 1,26 s sürer.\n\n**Ters problem:** v ve ω'yi istiyorsan tekerlek hızları şöyle çıkar:\n\n```\nvR = v + ω · L / 2\nvL = v − ω · L / 2\n```\n\nv = 0,20 m/s ve ω = 1 rad/s için: vR = 0,20 + 0,06 = 0,26 m/s, vL = 0,20 − 0,06 = 0,14 m/s. Ama Arduino hızı değil PWM değeri verir. Bunun için de bir eşleme gerekir.\n\n### Devre\nStandart Modül 5 bağlantıları (tüm haftalarda aynıdır):\n\n| Parça | Bağlantı |\n|---|---|\n| Sol motor | EN **D5** (PWM), IN1 **D7**, IN2 **D8** |\n| Sağ motor | EN **D6** (PWM), IN3 **D9**, IN4 **D10** |\n| Motor sürücüsü (L298N veya TB6612) | Motor gücü ayrı bir pil kutusundan; sürücünün GND'si Arduino GND'sine bağlı (ortak GND) |\n\n**Güvenlik:** Motorları Arduino'nun 5 V pininden besleme; ayrı bir pil kutusu kullan ve GND'leri birleştir. Pili ters bağlama, uçlarını birbirine değdirme (kısa devre). Robotu ilk denemede tekerlekler havada olacak şekilde kaldır. Bu derste motor sürücüsünü ayrıntılı tanımıyoruz, 77. derste anlatacağız.\n\n### Program\nAşağıdaki sketch seri porttan \"sol sağ\" biçiminde iki PWM değeri alır (−255 ile 255 arası, eksi = geri). Motorları sürer ve aynı değerlerle formüllerin sonucunu yazar.\n\n`pwmdenHiz` fonksiyonu, PWM değerinden tekerlek hızını (m/s) veren bir model: PWM 51'in altında tekerlek dönmez (**ölü bölge**), PWM 255'te tekerlek 0,396 m/s hızla döner, arası doğrusaldır. Bu değerleri 78. derste kendin ölçeceksin; şimdilik hazır kabul et.\n\n```cpp\n// sketch: diferansiyel_hesap\nconst int SOL_EN = 5;\nconst int SOL_IN1 = 7;\nconst int SOL_IN2 = 8;\nconst int SAG_EN = 6;\nconst int SAG_IN1 = 9;\nconst int SAG_IN2 = 10;\n\nconst float L = 0.12;       // aks aralığı (m)\nconst float V_MAX = 0.396;  // PWM 255'te tekerlek hızı (m/s)\nconst int OLU_PWM = 51;     // bu değerin altında tekerlek dönmez\n\nfloat pwmdenHiz(int pwm) {\n  int a = abs(pwm);\n  if (a <= OLU_PWM) return 0;\n  float h = (a - OLU_PWM) / (255.0 - OLU_PWM) * V_MAX;\n  return pwm > 0 ? h : -h;\n}\n\nvoid motor(int en, int in1, int in2, int pwm) {\n  digitalWrite(in1, pwm > 0);\n  digitalWrite(in2, pwm < 0);\n  analogWrite(en, abs(pwm));\n}\n\nvoid setup() {\n  pinMode(SOL_EN, OUTPUT); pinMode(SOL_IN1, OUTPUT); pinMode(SOL_IN2, OUTPUT);\n  pinMode(SAG_EN, OUTPUT); pinMode(SAG_IN1, OUTPUT); pinMode(SAG_IN2, OUTPUT);\n  Serial.begin(9600);\n  Serial.setTimeout(100);\n  Serial.println(\"Hazir: sol_pwm sag_pwm\");\n}\n\nvoid loop() {\n  if (Serial.available() == 0) return;\n  String satir = Serial.readStringUntil('\\n');\n  int bosluk = satir.indexOf(' ');\n  if (bosluk < 0) return;\n  int pwmL = constrain(satir.substring(0, bosluk).toInt(), -255, 255);\n  int pwmR = constrain(satir.substring(bosluk + 1).toInt(), -255, 255);\n  motor(SOL_EN, SOL_IN1, SOL_IN2, pwmL);\n  motor(SAG_EN, SAG_IN1, SAG_IN2, pwmR);\n\n  float vL = pwmdenHiz(pwmL);\n  float vR = pwmdenHiz(pwmR);\n  float v = (vR + vL) / 2;\n  float w = (vR - vL) / L;\n  Serial.print(\"vL=\"); Serial.print(vL, 3);\n  Serial.print(\" vR=\"); Serial.print(vR, 3);\n  Serial.print(\" v=\"); Serial.print(v, 3);\n  Serial.print(\" w=\"); Serial.print(w, 3);\n  if (fabs(vR - vL) < 0.0005) {\n    Serial.println(\" R=duz\");\n  } else {\n    Serial.print(\" R=\"); Serial.println((L / 2) * (vR + vL) / (vR - vL), 3);\n  }\n}\n```\n\nSerial Monitor'de satır sonunu \"Yeni satır (Newline)\" yap ve `204 204`, `-204 204`, `153 204` gibi çiftler gönder.\n\n### Nasıl çalışıyor?\n1. `motor()` işaretli PWM alır: pozitifse IN1 yüksek, negatifse IN2 yüksek olur. Hız `analogWrite` ile EN pinine gider. Yön ve PWM ayrıntısı 77. derstedir.\n2. `pwmdenHiz()` PWM'i m/s'ye çevirir. Ölü bölge içinde sıfır döner.\n3. Sonra `v` ve `ω` yukarıdaki iki formülle hesaplanır. `R` yalnızca tekerlek hızları farklıysa hesaplanır; aynıysa payda sıfır olur, o yüzden \"duz\" yazılır.\n4. Hesap ile gerçek hareketi karşılaştırmak için aynı sketch'i benzetimdeki robotta çalıştırıp 2 saniye boyunca robotun aldığı yolu ve yön değişimini ölçtük.\n\n### Ölçüm\nBenzetimdeki robotta ölçülen değerler (her satırda hareket oturduktan sonraki 2 saniyelik ortalama):\n\n| Gönderilen (sol sağ) | Hesaplanan v, ω, R | Ölçülen v, ω, R |\n|---|---|---|\n| `204 204` | 0,297 m/s, 0, düz | 0,295 m/s, 0, düz |\n| `-204 204` | 0, 4,95 rad/s, 0 | 0, 4,92 rad/s (yaklaşık 282°/s), 0 |\n| `153 204` | 0,248 m/s, 0,825 rad/s, 0,30 m | 0,246 m/s, 0,822 rad/s, 0,30 m |\n| `0 204` | 0,148 m/s, 2,475 rad/s, 0,06 m | 0,148 m/s, 2,46 rad/s, 0,06 m |\n\nHesap ile ölçüm birbirine çok yakın. Zıt hızla robot gerçekten olduğu yerde döndü, `0 204` ile duran tekerleğin etrafında 6 cm yarıçaplı daire çizdi. Ters problemin cevabı da tuttu: `123 185` gönderdiğinde robot v = 0,20 m/s ve ω = 1,0 rad/s ile gitti (PWM 123 ve 185 değerlerini `pwmdenHiz` fonksiyonunun tersiyle bulduk: PWM = 51 + 204 · v / 0,396).\n\nGerçek robotta farklı olabilecekler: tekerlekler yerde kayar, iki motor tıpatıp aynı hızda dönmez, yarıçap ve aks aralığı cetvelle ölçülmelidir. Formüller aynı kalır, ölçülen sonuçlar benzetimdeki kadar temiz çıkmaz.\n\n### Dene\n- `100 -100` gönder. Robot hangi yöne döner? Formülle ω'nın işaretini önceden tahmin et.\n- Yarıçapı 15 cm olan bir kavis için vL ve vR ne olmalı? (İpucu: v = 0,2 m/s seç, ω = v / R'yi hesapla, sonra ters problem formülünü kullan.)\n- Aynı hızı iki tekerleğe de ver ama `OLU_PWM` altında bir değer yaz (`40 40`). Neden hiçbir şey olmuyor?\n\n### Sık yapılan hatalar\n- Santimetre ile metreyi karıştırmak: L = 12 değil, 0,12 m.\n- L yerine tekerlek yarıçapını (0,033) yazmak.\n- ω'yı derece sanmak: formül radyan/saniye verir. Dereceye çevirmek için 180/π ≈ 57,3 ile çarp.\n- Dönüş yönünü karıştırmak: sağ tekerlek hızlıysa robot **sola** döner (ω pozitif).\n- vR = vL iken R formülünü hesaplamaya çalışmak: sıfıra bölme olur.",
          "question": "Gerçek bir robotun iki motoru aynı PWM'de bile tam aynı hızda dönmeyebilir. Bu durumda \"düz git\" dediğinde robot ne yapar ve bunu nasıl fark edersin?",
          "explainerMd": "### Bu derste öğreneceklerin\n- İki motorlu bir robotun neden direksiyonsuz da yön değiştirebildiğini (diferansiyel sürüş)\n- Robotun hareketini iki sayıyla anlatmayı: ileri hız v ve dönme hızı ω\n- Sol ve sağ tekerlek hızından v, ω ve dönme yarıçapı R'yi hesaplamayı\n- İstenen v ve ω için tekerlek hızlarını bulmayı (ters problem)\n\n### Önceden bilmen gerekenler\nModül 3'ten PWM ve analogWrite (16. ders), DC motor ve transistör (22. ders), L293D ile yön kontrolü (23. ders) ve Serial Monitor (9. ders). Ortaokul düzeyinde ortalama ve bölme yeterlidir. Sürücü kartını bu derste ayrıntılı tanımıyoruz; 77. derste göreceksin.\n\n### Direksiyon yok, hız farkı var\nRobot süpürge, masa üstü yarış robotları ve birçok araştırma robotu iki ayrı motorlu tekerlekle yönlenir. Buna **diferansiyel sürüş** denir. İki tekerlek aynı hızda dönerse robot düz gider. Biri daha hızlıysa robot yavaş olan tarafa doğru kavis çizer. İkisi zıt yönde dönerse robot olduğu yerde döner.\n\n### Robotu iki sayıyla anlatmak\nSol tekerleğin yerdeki hızı vL, sağınki vR olsun (m/s, ileri pozitif). Robotun tüm hareketi iki sayıya sığar:\n\n- **v**: robotun ortasının ileri hızı, yani iki hızın ortalaması\n- **ω** (omega): dönme hızı, rad/s. Sola dönüş pozitif, sağa dönüş negatiftir\n\n```\nv = (vR + vL) / 2\nω = (vR − vL) / L\nR = v / ω\n```\n\nBurada **L** iki tekerleğin yere değdiği noktalar arası mesafedir (aks aralığı). Derslerdeki robotta L = 0,12 m ve tekerlek yarıçapı r = 0,033 m'dir. **R**, robotun çizdiği çemberin yarıçapıdır; hızlar eşitse R sonsuzdur (düz gidiş) ve formülü hesaplamaya çalışmak sıfıra bölme olur.\n\n### Üç tipik durum\n| Durum | v | ω | Robot |\n|---|---|---|---|\n| vR = vL | vR | 0 | düz gider |\n| vR = −vL | 0 | 2·vR / L | yerinde döner |\n| vL = 0, vR > 0 | vR / 2 | vR / L | duran tekerleğin etrafında döner, R = L / 2 |\n\nÖrnek: vL = 0,10 ve vR = 0,30 m/s ise v = 0,20 m/s, ω = 0,20 / 0,12 = 1,67 rad/s olur. Sağ tekerlek hızlı olduğu için robot sola döner.\n\n### Ters problem\nÇoğu zaman sen v ve ω seçersin, tekerlek hızları aranır:\n\n```\nvR = v + ω · L / 2\nvL = v − ω · L / 2\n```\n\nArduino hız değil PWM değeri verir. Hızı PWM'e çevirmek 78. dersin konusudur.\n\n### Radyan ve derece\nω radyan/saniye cinsindendir. Dereceye çevirmek için yaklaşık 57,3 ile çarparsın. 5 rad/s yaklaşık 286°/s eder; yani tam tur yaklaşık 1,26 saniye sürer.\n\n### Özet\nDiferansiyel sürüşte yön, iki tekerleğin hız farkıyla değişir. v ortalamadan, ω farktan gelir; ω'yı bölen sayı aks aralığı L'dir. Hızlar eşitse düz, zıtsa yerinde dönüş, biri sıfırsa duran tekerlek etrafında dönüş elde edersin. Birimleri (metre, radyan) karıştırmamak bu dersin en önemli alışkanlığıdır.",
          "concepts": [
            {
              "term": "Diferansiyel sürüş",
              "definition": "Robotun yönünü iki tekerleğin hız farkıyla değiştirmesi; direksiyon yoktur.",
              "example": "Sağ tekerlek sol tekerlekten hızlı dönerse robot sola kavis çizer.",
              "pitfall": "Dönmek için ayrı bir direksiyon motoru gerektiğini sanmak."
            },
            {
              "term": "v ve ω",
              "definition": "v robotun ortasının ileri hızı (m/s), ω dönme hızıdır (rad/s). v = (vR + vL) / 2 ve ω = (vR − vL) / L.",
              "example": "vL = 0,10 ve vR = 0,30 m/s için v = 0,20 m/s olur.",
              "pitfall": "ω'yı iki hızın toplamından hesaplamak; ω fark ister, toplam v'yi verir."
            },
            {
              "term": "Aks aralığı (L)",
              "definition": "İki tekerleğin yere değdiği noktalar arası mesafe; ω formülünde bölen sayıdır. Derslerdeki robotta 0,12 m.",
              "example": "Aynı hız farkı, aks aralığı küçük robotta daha hızlı dönüş verir.",
              "pitfall": "L'yi santimetre (12) yazıp hızı m/s kullanmak ya da tekerlek yarıçapını (0,033) L yerine koymak."
            },
            {
              "term": "Dönme yarıçapı (R)",
              "definition": "Robotun çizdiği çemberin yarıçapı: R = v / ω. Hızlar eşitse R sonsuzdur (düz gidiş).",
              "example": "Bir tekerlek dururken diğeri döndüğünde R = L / 2 = 6 cm olur.",
              "pitfall": "vR = vL iken R formülünü hesaplamaya çalışmak; payda sıfır olur."
            },
            {
              "term": "Ters problem",
              "definition": "İstenen v ve ω'dan tekerlek hızlarını bulmak: vR = v + ω·L/2 ve vL = v − ω·L/2.",
              "example": "v = 0,20 m/s ve ω = 1 rad/s için vR = 0,26 ve vL = 0,14 m/s çıkar.",
              "pitfall": "Bulunan değerin m/s olduğunu unutup doğrudan analogWrite'a yazmak; önce PWM'e çevrilmesi gerekir."
            }
          ],
          "quiz": [
            {
              "id": "m5h1d76-q1",
              "kind": "numeric",
              "prompt": "Robotun aks aralığı L = 0,12 m. Sol tekerlek 0,10 m/s, sağ tekerlek 0,25 m/s hızla dönüyor. Robotun dönme hızı ω kaç rad/s'dir?",
              "answer": 1.25,
              "tolerance": 0.01,
              "unit": "rad/s",
              "explanation": "ω = (vR − vL) / L = (0,25 − 0,10) / 0,12 = 1,25 rad/s. Sağ tekerlek hızlı olduğu için ω pozitiftir, robot sola döner. Hızları toplamak (v'nin formülü) yanlış olurdu.",
              "skills": [
                "prog-planning"
              ]
            },
            {
              "id": "m5h1d76-q2",
              "kind": "mcq",
              "prompt": "vL = 0,20 m/s ve vR = 0,10 m/s ise robot ne yapar?",
              "options": [
                "Olduğu yerde döner",
                "Düz gider",
                "Sağa kavis çizer",
                "Sola kavis çizer"
              ],
              "answer": 2,
              "explanation": "ω = (0,10 − 0,20) / 0,12 negatiftir; negatif ω sağa dönüş demektir. Sol tekerlek hızlı olunca robot sağa kıvrılır. İki hız da pozitif olduğu için yerinde dönüş olmaz, hızlar eşit olmadığı için düz gitmez.",
              "skills": [
                "prog-planning"
              ]
            },
            {
              "id": "m5h1d76-q3",
              "kind": "numeric",
              "prompt": "Robot yerinde dönüyor: sol tekerlek −0,15 m/s, sağ tekerlek +0,15 m/s. L = 0,12 m. Bir tam tur (2π rad) yaklaşık kaç saniye sürer?",
              "answer": 2.51,
              "tolerance": 0.03,
              "unit": "s",
              "explanation": "ω = (0,15 − (−0,15)) / 0,12 = 2,5 rad/s. Tur süresi = 2π / 2,5 yaklaşık 2,51 s. Hız farkını (0,30) değil, doğru ω değerini kullanmak gerekir; v burada sıfırdır.",
              "skills": [
                "prog-timing"
              ]
            },
            {
              "id": "m5h1d76-q4",
              "kind": "find-bug",
              "prompt": "Aşağıdaki kodda L = 0,12 m ve hızlar m/s. Robotun dönüşü beklenenden çok farklı çıkıyor. Hata hangisinde?\n\n```\nfloat v = (vR + vL) / 2;\nfloat w = (vR + vL) / L;\n```",
              "options": [
                "1. satır: v için toplam değil fark gerekir",
                "2. satır: ω için toplam değil fark (vR − vL) gerekir",
                "L sabiti float olmamalı",
                "Her iki satır da doğru, hata seri porttadır"
              ],
              "answer": 1,
              "explanation": "ω dönme hızıdır ve iki tekerleğin FARKINDAN gelir: (vR − vL) / L. Toplam ortalama ileri hızı (v) belirler; 1. satır doğrudur. Hatalı satırla düz giden robot bile dönüyormuş gibi hesaplanır.",
              "skills": [
                "prog-debug"
              ]
            },
            {
              "id": "m5h1d76-q5",
              "kind": "predict-output",
              "prompt": "Sol tekerlek 0,30 m/s, sağ tekerlek durmuş. Bu kod ne yazdırır?\n\n```\nfloat vL = 0.30, vR = 0.0;\nfloat w = (vR - vL) / 0.12;\nSerial.println(w, 1);\n```",
              "options": [
                "-0.3",
                "2.5",
                "-2.5",
                "0.0"
              ],
              "answer": 2,
              "explanation": "(0 − 0,30) / 0,12 = −2,5. Negatif ω robotun sağa, duran sağ tekerleğin etrafında döndüğü anlamına gelir. 2.5 işareti unutmuştur; 0.0 iki hızın eşit olduğu durumdur.",
              "skills": [
                "digital-out"
              ]
            }
          ]
        },
        {
          "title": "Motor sürücüsü L298N/TB6612: yön ve PWM",
          "durationMin": 25,
          "problem": "Arduino'nun bir pini motoru doğrudan sürmeye yetmez (22. derste gördün). 23. derste L293D ile motoru ileri ve geri döndürdün. Gerçek robotlarda ise çoğunlukla L298N ya da TB6612 gibi hazır sürücü kartları kullanılır. Bu kartlar L293D'ye benzer ama bir iki ayrıntıda farklıdır. Robot tam hız giderken `IN1` ve `IN2`'yi aynı yapınca ne olur? Ya da `EN`'i kapatınca?",
          "contentMd": "### İki sürücü, aynı fikir\nİkisi de içinde iki H-köprüsü (23. ders) taşır, yani iki DC motoru bağımsız sürebilir. Her motor için iki **yön** girişi ve bir **hız (PWM)** girişi vardır.\n\n| | L298N kartı | TB6612 kartı |\n|---|---|---|\n| Sol motor yön girişleri | IN1, IN2 | AIN1, AIN2 |\n| Sağ motor yön girişleri | IN3, IN4 | BIN1, BIN2 |\n| Hız (PWM) girişleri | ENA, ENB | PWMA, PWMB |\n| Ek giriş | yok | STBY (bekleme) |\n| İçindeki anahtarlar | bipolar transistör | MOSFET |\n| Gerilim düşümü | tipik olarak yaklaşık 1-2 V (veri sayfasına bak) | genelde çok daha düşük |\n| Isınma | belirgin ısınabilir | genelde daha az ısınır |\n| Boyut | büyük | küçük |\n\nÖnemli farklar:\n\n- **Gerilim düşümü:** L298N'de motora giden gerilimin bir kısmı sürücüde harcanır. Küçük pille çalışan robotlarda bu fark hissedilir. Kesin değer için kullandığın kartın veri sayfasına bak.\n- **STBY:** TB6612'de `STBY` pini LOW olursa sürücü bekleme moduna geçer ve motorlar çalışmaz. Çalışması için `STBY`'yi HIGH yapmak (5 V'a bağlamak ya da bir pinden HIGH vermek) gerekir.\n- **EN jumper'ı:** Çoğu hazır L298N kartında `ENA` ve `ENB` pinlerinde küçük bir jumper bulunur ve motoru hep tam hızda tutar. PWM ile hız ayarlamak için jumper'ı çıkarıp `EN` pinini Arduino'nun PWM pinine bağlarsın.\n\nBu modülde pin isimlerini sürücüden bağımsız tutuyoruz: sol motor EN D5, IN1 D7, IN2 D8; sağ motor EN D6, IN3 D9, IN4 D10. TB6612 kullanıyorsan EN yerine PWMA/PWMB, IN yerine AIN/BIN yaz ve `STBY`'yi HIGH'a bağla.\n\n### Doğruluk tablosu\nTek bir motor için dört durum (EN = PWM girişi):\n\n| IN1 | IN2 | EN | Durum | Motor |\n|---|---|---|---|---|\n| HIGH | LOW | PWM | **İleri** | PWM oranında hızla bir yöne döner |\n| LOW | HIGH | PWM | **Geri** | Aynı hızla ters yöne döner |\n| HIGH | HIGH | HIGH | **Fren** | Motor uçları kısa devre edilir, motor durmaya zorlanır |\n| LOW | LOW | LOW (0) | **Serbest bırakma** | Motor bağlantısız kalır, kendi hızıyla yavaşlar |\n\nFren ile serbest bırakma farkı: frende motor uçları birbirine bağlanır. Dönen motor bu durumda jeneratör gibi davranır ve kendi akımı onu yavaşlatır. Serbest bırakmada motor yalnızca atalet ve sürtünmeyle yavaşlar. Gerçek robotlarda fren genellikle daha çabuk durdurur.\n\nDikkat: L298N'de EN HIGH iken `IN1 = IN2` fren yapar, EN LOW iken ise (IN'lerin değerinden bağımsız) motor serbest kalır. TB6612'de ise `IN1 = IN2 = LOW` motoru serbest bırakır, `IN1 = IN2 = HIGH` fren yapar. Tablodaki dört satır ikisinde de aynı sonucu verir. Kartından emin değilsen veri sayfasına bak.\n\nMotor yönünü değiştirmeden önce kısa bir süre durdur: motor tam hızda dönerken bir anda ters yöne geçmek hem sürücüyü hem pili zorlar.\n\n### Devre\n| Parça | Bağlantı |\n|---|---|\n| Sol motor | EN **D5** (PWM), IN1 **D7**, IN2 **D8** |\n| Sağ motor | EN **D6** (PWM), IN3 **D9**, IN4 **D10** |\n| Motor gücü | Ayrı pil kutusu → sürücünün motor gücü girişi; sürücü GND'si ile Arduino GND'si ortak |\n\n**Güvenlik:** Motor gücünü Arduino'dan alma, ayrı pil kullan ve GND'leri birleştir. Pil kutusunu ters bağlama, uçlarını kısa devre etme. Sürücü kartı çalışırken ısınabilir, dokunmadan önce bekle. İlk denemelerde robotun tekerlekleri havada olsun.\n\n### Program\nSketch her 1,5 saniyede bir durum değiştirir: ileri, fren, geri, serbest bırakma. Her iki motor da aynı durumdadır. `enum` ve `switch` ile yazılmış (28. ders).\n\n```cpp\n// sketch: surucu_durumlari\nconst int SOL_EN = 5;\nconst int SOL_IN1 = 7;\nconst int SOL_IN2 = 8;\nconst int SAG_EN = 6;\nconst int SAG_IN1 = 9;\nconst int SAG_IN2 = 10;\n\nenum Durum { ILERI, FREN, GERI, SERBEST };\nconst char* ISIMLER[] = { \"ILERI\", \"FREN\", \"GERI\", \"SERBEST\" };\n\nconst int PWM_ILERI = 200;\nconst int PWM_GERI = 120;\nconst unsigned long ADIM_SURESI = 1500;   // ms\n\nvoid surucu(int en, int in1, int in2, Durum d, int pwm) {\n  switch (d) {\n    case ILERI:\n      digitalWrite(in1, HIGH);\n      digitalWrite(in2, LOW);\n      analogWrite(en, pwm);\n      break;\n    case GERI:\n      digitalWrite(in1, LOW);\n      digitalWrite(in2, HIGH);\n      analogWrite(en, pwm);\n      break;\n    case FREN:                       // IN1 = IN2, EN açık: motor uçları kısa devre\n      digitalWrite(in1, HIGH);\n      digitalWrite(in2, HIGH);\n      analogWrite(en, 255);\n      break;\n    case SERBEST:                    // EN kapalı: motor boşta döner\n      digitalWrite(in1, LOW);\n      digitalWrite(in2, LOW);\n      analogWrite(en, 0);\n      break;\n  }\n}\n\nint sonAdim = -1;\n\nvoid setup() {\n  pinMode(SOL_EN, OUTPUT); pinMode(SOL_IN1, OUTPUT); pinMode(SOL_IN2, OUTPUT);\n  pinMode(SAG_EN, OUTPUT); pinMode(SAG_IN1, OUTPUT); pinMode(SAG_IN2, OUTPUT);\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  int adim = (millis() / ADIM_SURESI) % 4;\n  if (adim != sonAdim) {\n    sonAdim = adim;\n    Durum d = (Durum)adim;\n    int pwm = (d == GERI) ? PWM_GERI : PWM_ILERI;\n    surucu(SOL_EN, SOL_IN1, SOL_IN2, d, pwm);\n    surucu(SAG_EN, SAG_IN1, SAG_IN2, d, pwm);\n    Serial.println(ISIMLER[adim]);\n  }\n}\n```\n\n### Nasıl çalışıyor?\n1. `surucu()` bir motorun üç pinini birlikte ayarlar. Durumlar doğruluk tablosundaki satırlardır.\n2. `loop()` zamanı `millis()` ile 1500 ms'lik adımlara böler (27. ders). Adım değişince iki motoru da yeni duruma sokar ve adını yazdırır.\n3. Geri hareket bilerek daha düşük PWM (120) ile yapılıyor; böylece hızın PWM'e bağlı olduğunu ölçebilirsin.\n\n### Ölçüm\nBenzetimdeki robotu bu sketch ile çalıştırdık:\n\n| Adım | Ölçülen |\n|---|---|\n| ILERI, PWM 200 | Robot +x yönünde, 0,29 m/s hızla düz gitti. 76. dersteki modelle (0,289 m/s) uyuşuyor |\n| FREN | Pinler IN1..IN4 = 1 1 1 1, EN yüksek. Robot yaklaşık 2 cm sonra durdu |\n| GERI, PWM 120 | Robot ters yöne, 0,13 m/s hızla gitti: PWM yaklaşık yarıya inince hız yarıdan da az |\n| SERBEST | Pinler hepsi 0. Robot yaklaşık 1 cm sonra durdu |\n\nPWM 200 ile 120 arasında hız oranı, PWM oranı kadar değil. Çünkü hız PWM'in kendisiyle değil, **ölü bölgenin üstündeki kısmıyla** orantılıdır. 78. derste bunu inceleyeceğiz.\n\nBenzetimin sınırı: Bu robot modeli fren ile serbest bırakmayı birbirinden ayırmaz. Her ikisinde de tekerlek hızı, motor gecikmesi denen yaklaşık 80 ms'lik bir zaman sabitiyle üstel olarak sıfıra iner. Gerçek robotta fren genellikle daha kısa sürede durdurur. Yön ve PWM davranışı ise benzetimde doğrulanmıştır.\n\n### Dene\n- `PWM_ILERI`'yi 255 yap. Robot frene girmeden önce ne kadar hızlı gidiyor, durma mesafesi değişiyor mu?\n- `PWM_ILERI`'yi 60 yap. Robot nasıl hareket ediyor? 51 altına inince ne olur?\n- FREN adımını SERBEST ile değiştir. Robotun durma mesafesi ne kadar değişiyor? Benzetimde ve gerçek robotta aynı mı olur?\n\n### Sık yapılan hatalar\n- `analogWrite`'ı PWM olmayan bir pine yazmak. Uno'da PWM pinleri 3, 5, 6, 9, 10, 11'dir; EN için D5 ve D6 kullanıyoruz.\n- L298N kartındaki EN jumper'ı takılıyken PWM ile hız ayarlamaya çalışmak: hız değişmez.\n- TB6612'de `STBY`'yi bağlamayı unutmak: motor hiç dönmez.\n- GND'leri birleştirmemek: yön ve PWM sinyalleri sürücüde anlaşılmaz, motor rastgele davranır.\n- Tam hızdan ani yön değiştirmek.",
          "question": "Bir robot yokuş aşağı inerken motorlar serbest bırakılırsa robot ne yapar, frene basılırsa ne yapar? Robotun hangi anlarında fren, hangi anlarında serbest bırakma işine yarar?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Motor sürücüsünün (L298N, TB6612) iki ayrı iş yaptığını: yönü seçmek ve hızı PWM ile ayarlamak\n- Doğruluk tablosuyla ileri, geri, fren ve serbest bırakma durumlarını\n- L298N ile TB6612 arasındaki önemli farkları (gerilim düşümü, STBY, EN jumper'ı)\n- Güvenli bağlantı kurallarını: ayrı motor gücü ve ortak GND\n\n### Önceden bilmen gerekenler\nModül 3'ten transistör ve DC motor (22. ders), L293D H-köprüsü (23. ders), millis() (27. ders) ve enum ile durum makinesi (28. ders). 76. dersten motor ve tekerlek hızı fikri.\n\n### Neden sürücü kartı?\nArduino pini motoru sürecek akımı veremez (22. ders). Motor için ayrı bir pil ve araya bir **motor sürücüsü** gerekir. Sürücünün içinde her motor için bir H-köprüsü vardır (23. ders). L298N ve TB6612 aynı fikri uygular; iki motoru bağımsız sürebilirler.\n\n### İki iş: yön ve hız\nHer motor için üç giriş vardır:\n\n- **IN1, IN2** (TB6612'de AIN1, AIN2): akımın yönünü seçer\n- **EN** (TB6612'de PWMA): hızı belirler; PWM pinine bağlanır\n\nBu modülde sol motor için EN D5, IN1 D7, IN2 D8; sağ motor için EN D6, IN3 D9, IN4 D10 kullanırız.\n\n### Doğruluk tablosu\n| IN1 | IN2 | EN | Durum |\n|---|---|---|---|\n| HIGH | LOW | PWM | ileri |\n| LOW | HIGH | PWM | geri |\n| HIGH | HIGH | HIGH | fren |\n| LOW | LOW | LOW (0) | serbest bırakma |\n\n**Fren**, motorun iki ucunu birbirine bağlar; dönen motor jeneratör gibi davranır ve kendi akımıyla yavaşlar. **Serbest bırakmada** motor bağlantısız kalır ve yalnızca sürtünmeyle yavaşlar. Bu yüzden fren genellikle daha çabuk durdurur. Bu modülün benzetim robotu ikisini ayırt etmez (ikisinde de yaklaşık 80 ms'lik bir zaman sabitiyle yavaşlar); bunu gerçek robotun davranışı sanma.\n\n### L298N ve TB6612\n- **Gerilim düşümü:** L298N'de motora giden gerilimin bir kısmı sürücüde harcanır ve kart ısınır; TB6612 (MOSFET'li) genelde çok daha verimlidir. Kesin değer için veri sayfasına bak.\n- **STBY:** TB6612'de bu pin LOW ise sürücü bekleme modundadır ve motor dönmez. HIGH yapmayı unutma.\n- **EN jumper'ı:** Hazır L298N kartlarında ENA/ENB üzerinde jumper vardır ve motoru hep tam hızda tutar. PWM için jumper'ı çıkarıp EN'i Arduino'nun PWM pinine bağla.\n\n### Güvenlik ve bağlantı\nMotor gücünü Arduino'nun 5 V pininden alma; ayrı pil kutusu kullan ve pilin eksisini Arduino GND'siyle birleştir (**ortak GND**). Ortak GND olmazsa sürücü sinyalleri anlayamaz. Tam hızla giderken ani ters yön vermek sürücüyü ve pili zorlar; önce kısa bir süre durdur. `analogWrite` yalnızca PWM pinlerinde çalışır (Uno'da 3, 5, 6, 9, 10, 11).\n\n### Özet\nMotor sürücüsü yönü IN pinleriyle, hızı EN'e verilen PWM ile ayarlar. Doğruluk tablosunun dört satırı ileri, geri, fren ve serbest bırakmadır. L298N ile TB6612 benzer çalışır ama TB6612 daha verimlidir ve STBY ister. Ayrı motor gücü ve ortak GND her zaman gereklidir.",
          "concepts": [
            {
              "term": "Motor sürücüsü",
              "definition": "Arduino'nun zayıf sinyalini ayrı bir pilden gelen motor akımına çeviren kart (L298N, TB6612). İçinde her motor için bir H-köprüsü vardır.",
              "example": "Tek bir sürücü kartı robotun sol ve sağ motorunu bağımsız sürer.",
              "pitfall": "Motoru doğrudan Arduino pinine ya da 5V çıkışına bağlamak."
            },
            {
              "term": "Yön ve hız girişleri",
              "definition": "IN1/IN2 akımın yönünü, EN (TB6612'de PWMA) PWM ile hızı belirler.",
              "example": "IN1 = HIGH, IN2 = LOW, EN'e analogWrite(150) verilirse motor ileri ve orta hızda döner.",
              "pitfall": "EN'i PWM olmayan bir pine bağlamak; analogWrite yalnızca 3, 5, 6, 9, 10, 11'de PWM üretir."
            },
            {
              "term": "Fren ve serbest bırakma",
              "definition": "Frende (IN1 = IN2 = HIGH, EN yüksek) motor uçları kısa devre edilir ve motor durmaya zorlanır; serbest bırakmada motor bağlantısız kalır ve kendi hızıyla yavaşlar.",
              "example": "Yokuş aşağıda robotu tutmak için fren, rahatça yuvarlanması için serbest bırakma kullanılır.",
              "pitfall": "İkisinin aynı şey olduğunu sanmak; gerçek robotta durma mesafeleri farklıdır."
            },
            {
              "term": "STBY ve EN jumper'ı",
              "definition": "TB6612'de STBY LOW ise sürücü bekleme modundadır ve motor dönmez. Hazır L298N kartlarında ENA/ENB üzerindeki jumper motoru tam hızda tutar.",
              "example": "L298N'de PWM ile hız ayarlamak için jumper'ı çıkarıp EN'i D5'e bağlarsın.",
              "pitfall": "STBY'yi bağlamayı ya da EN jumper'ını çıkarmayı unutmak; motor ya hiç dönmez ya da hız ayarı etki etmez."
            },
            {
              "term": "Ortak GND",
              "definition": "Motor pilinin eksisini Arduino GND'sine bağlamak; sinyallerin aynı 0 V referansını kullanmasını sağlar.",
              "example": "Pil kutusunun eksi ucu, sürücünün GND'si ve Arduino GND'si birleştirilir.",
              "pitfall": "GND'leri birleştirmemek; yön ve PWM sinyalleri sürücüde anlaşılmaz, motor rastgele davranır."
            }
          ],
          "quiz": [
            {
              "id": "m5h1d77-q1",
              "kind": "mcq",
              "prompt": "Sol motorda IN1 = HIGH, IN2 = HIGH ve EN = 255 verilirse motor ne olur?",
              "options": [
                "Hızla ileri döner",
                "Hızla geri döner",
                "Fren yapar, durmaya zorlanır",
                "Bağlantısız kalır ve serbestçe döner"
              ],
              "answer": 2,
              "explanation": "İki yön girişi aynı ve EN yüksek olunca motor uçları kısa devre edilir; bu fren durumudur. Serbest bırakma için IN'ler LOW ve EN 0 olmalıdır; ileri ve geri için IN'ler zıt olmalıdır.",
              "skills": [
                "digital-out"
              ]
            },
            {
              "id": "m5h1d77-q2",
              "kind": "predict-output",
              "prompt": "Sol motor sürücüsüne (EN D5, IN1 D7, IN2 D8) şu komutlar veriliyor. Motor ne yapar?\n\n```\ndigitalWrite(7, LOW);\ndigitalWrite(8, HIGH);\nanalogWrite(5, 100);\n```",
              "options": [
                "İleri, tam hızda",
                "İleri, yavaş",
                "Geri, yaklaşık yüzde 39 doluluk oranıyla",
                "Durur, çünkü iki pin farklı"
              ],
              "answer": 2,
              "explanation": "IN1 LOW ve IN2 HIGH geri yönü verir. EN'e 100 verildiği için PWM doluluk oranı 100/255 yaklaşık yüzde 39'dur. Yön girişleri farklı olduğu için motor durmaz; durduran şey aynı olmalarıdır (fren).",
              "skills": [
                "digital-out"
              ]
            },
            {
              "id": "m5h1d77-q3",
              "kind": "numeric",
              "prompt": "EN pinine analogWrite(EN, 191) yazıldı. PWM doluluk oranı yaklaşık yüzde kaçtır?",
              "answer": 75,
              "tolerance": 1,
              "unit": "%",
              "explanation": "Doluluk oranı = 191 / 255 yaklaşık 0,749, yani yüzde 75. analogWrite değeri 0-255 aralığındadır; 255 yüzde 100 demektir. Değeri doğrudan yüzde sanmak (yüzde 191) mümkün değildir.",
              "skills": [
                "digital-out"
              ]
            },
            {
              "id": "m5h1d77-q4",
              "kind": "find-bug",
              "prompt": "Sağ motorun hızı hiç değişmiyor; analogWrite ne yazılırsa yazılsın motor ya hiç dönmüyor ya da hep aynı hızda. Sürücü pinleri şöyle bağlanmış: EN D4, IN3 D9, IN4 D10. En olası hata hangisi?\n\n```\nconst int SAG_EN = 4;\nconst int SAG_IN1 = 9;\nconst int SAG_IN2 = 10;\n...\nanalogWrite(SAG_EN, 180);\n```",
              "options": [
                "SAG_EN = 4: EN, PWM destekleyen bir pine bağlanmalı",
                "SAG_IN1 = 9 olmamalı",
                "analogWrite yerine digitalWrite yazılmalı",
                "180 değeri çok büyük, 255’ten az olmalı"
              ],
              "answer": 0,
              "explanation": "analogWrite yalnızca Uno'nun PWM pinlerinde (3, 5, 6, 9, 10, 11) gerçek PWM üretir; D4'te yalnızca HIGH/LOW gibi davranır. 180 geçerli bir değerdir ve 9 ile 10 yön pinleri olarak uygundur.",
              "skills": [
                "prog-debug",
                "circuit-wiring"
              ]
            },
            {
              "id": "m5h1d77-q5",
              "kind": "mcq",
              "prompt": "Motor pilinin eksisi Arduino GND'sine bağlanmazsa ne olur?",
              "options": [
                "Motor daha hızlı döner",
                "Sürücü sinyalleri ortak bir referans bulamaz, motor rastgele davranır",
                "Yalnız fren çalışmaz",
                "Hiçbir şey olmaz, sinyaller havadan gider"
              ],
              "answer": 1,
              "explanation": "Sinyaller ancak aynı 0 V referansına göre anlamlıdır. GND'ler ortak değilse sürücü HIGH ve LOW'u güvenilir ayırt edemez. Bu bir hız değil, belirsizlik sorunudur; sorun frenle sınırlı değildir.",
              "skills": [
                "circuit-wiring"
              ]
            }
          ]
        },
        {
          "title": "Hız, ölü bölge ve kalibrasyon",
          "durationMin": 30,
          "problem": "Robota `analogWrite(EN, 40)` yazdın. Motor hafifçe vızıldıyor ama tekerlek kıpırdamıyor. 60 yazınca tekerlek yavaşça dönmeye başlıyor. \"Yarım hız\" istediğin için 128 yazdın ama robot yarım hızda gitmiyor, ondan çok daha yavaş. PWM ile hız neden orantılı değil? Ve robota \"20 cm/s git\" demek için hangi sayıyı yazmalısın?",
          "contentMd": "### Ölü bölge\nMotorun dönmeye başlaması için, sürtünmeyi ve dişlilerin direncini yenecek kadar güç gerekir. Düşük PWM'de motor akımı bu direnci yenemez; tekerlek durur. Bu aralığa **ölü bölge** denir. Gerçek motorlarda da görülür ve motora, dişliye, pile göre değişir.\n\nBenzetimdeki robotun ölü bölgesi PWM'in ilk %20'sidir: `analogWrite` değeri yaklaşık 51 (0,20 · 255) altındayken tekerlek dönmez. Ölü bölgenin üstünde hız yaklaşık doğrusal artar ve PWM 255'te en yüksek değerine (azami hız) ulaşır.\n\n### Ölü bölgeyi ölçmek\nRobotun hızını ölçen bir sensörümüz yok (enkoder ileriki haftalarda gelecek). Ölçümü göz ve buton yapar: sketch PWM'i her 250 ms'de bir artırır, sen tekerleğin dönmeye başladığını görünce butona (D2) basarsın. Sketch o andaki PWM'i yazar.\n\n| Parça | Bağlantı |\n|---|---|\n| Sol ve sağ motor | Standart bağlantı: EN D5/D6, IN1 D7, IN2 D8, IN3 D9, IN4 D10 |\n| Buton | **D2** ile GND arası (`INPUT_PULLUP`) |\n\n**Güvenlik:** Bu deneyde robotun tekerleklerini havada tut. Motor gücü ayrı pilden gelir; GND'ler ortak olmalıdır.\n\n```cpp\n// sketch: olu_bolge_tarama\nconst int SOL_EN = 5;\nconst int SOL_IN1 = 7;\nconst int SOL_IN2 = 8;\nconst int SAG_EN = 6;\nconst int SAG_IN1 = 9;\nconst int SAG_IN2 = 10;\nconst int DUGME = 2;                    // INPUT_PULLUP: tekerlek dönmeye başlayınca bas\n\nconst unsigned long ADIM_ARALIGI = 250;  // ms\nint pwm = 30;\nbool bitti = false;\nunsigned long sonAdim = 0;\n\nvoid ileri(int deger) {\n  digitalWrite(SOL_IN1, HIGH); digitalWrite(SOL_IN2, LOW);\n  digitalWrite(SAG_IN1, HIGH); digitalWrite(SAG_IN2, LOW);\n  analogWrite(SOL_EN, deger);\n  analogWrite(SAG_EN, deger);\n}\n\nvoid setup() {\n  pinMode(SOL_EN, OUTPUT); pinMode(SOL_IN1, OUTPUT); pinMode(SOL_IN2, OUTPUT);\n  pinMode(SAG_EN, OUTPUT); pinMode(SAG_IN1, OUTPUT); pinMode(SAG_IN2, OUTPUT);\n  pinMode(DUGME, INPUT_PULLUP);\n  Serial.begin(9600);\n  Serial.println(\"Tarama basladi\");\n  ileri(pwm);\n}\n\nvoid loop() {\n  if (bitti) return;\n\n  if (digitalRead(DUGME) == LOW) {       // tekerlek döndü, taramayı bitir\n    ileri(0);\n    bitti = true;\n    Serial.print(\"Hareket basladi: PWM=\");\n    Serial.println(pwm);\n    return;\n  }\n\n  if (millis() - sonAdim >= ADIM_ARALIGI) {\n    sonAdim = millis();\n    pwm++;\n    if (pwm > 255) {                     // hiç dönmediyse güvenli bitir\n      ileri(0);\n      bitti = true;\n      Serial.println(\"Tarama bitti: hareket yok\");\n      return;\n    }\n    ileri(pwm);\n    Serial.print(\"PWM=\");\n    Serial.println(pwm);\n  }\n}\n```\n\nBenzetimde robotun hızı 1 cm/s'yi geçtiği anda butona bastık ve sketch **PWM = 57** yazdı. Bu sayı \"tekerleğin gözle fark edilir şekilde döndüğü\" değerdir; ölü bölgenin gerçek sonu biraz daha aşağıda, yaklaşık 51'dedir. Çünkü ölü bölgeden çıkınca hız sıfırdan başlayıp yavaş yavaş artar:\n\n| PWM | 50 | 52 | 55 | 57 | 60 | 70 | 100 | 150 | 200 | 255 |\n|---|---|---|---|---|---|---|---|---|---|---|\n| Ölçülen hız (cm/s) | 0,1 | 0,2 | 0,7 | 1,1 | 1,7 | 3,6 | 9,4 | 19,1 | 28,8 | 39,6 |\n\nPWM 35-48 arasında hız 0,2 cm/s'nin altında kaldı, yani tekerlek dönmedi. PWM 52'den sonra hız doğrusal artıyor: her PWM birimi yaklaşık 0,19 cm/s ekliyor.\n\n### İki noktayla doğru bulmak\nÖlü bölgenin sonunu ve azami hızı daha güvenilir bulmanın yolu, iyi ölçülebilen iki hızdan doğru geçirmektir. Gerçek robotta hızı, 1 metrelik bir yolu kronometreyle ölçerek bulursun.\n\nPWM 100'de 9,4 cm/s, PWM 200'de 28,8 cm/s ölçtük.\n\n- Eğim = (28,8 − 9,4) / (200 − 100) = 0,194 cm/s her PWM birimi için.\n- Hızın sıfır olduğu PWM = 100 − 9,4 / 0,194 ≈ **51**.\n- Azami hız (PWM 255) = 0,194 · (255 − 51) ≈ 39,6 cm/s = **0,396 m/s**.\n\nİki yoldan çıkan sayılar uyumlu: ölü bölge sonu 51, azami hız 0,396 m/s (76. derste tekerlek yarıçapından 12 rad/s · 0,033 m olarak da bulmuştuk).\n\n### Kalibrasyon fonksiyonu: hizdanPwm\nAmacımız: \"şu kadar m/s\" deyince doğru PWM'i bulmak. Eşleme ölü bölgeyi atlar:\n\n```\nPWM = OLU_PWM + (255 − OLU_PWM) · v / V_MAX\n```\n\nBunu iki çizgi arasındaki fark olarak düşün: v = 0'da PWM 51'den başlar (ölü bölgenin hemen sonu), v = V_MAX'ta 255 olur. Karşılaştırmak için \"naif\" eşlemeyi de ekledik: PWM = 255 · v / V_MAX, yani 0'dan başlayan doğru.\n\nSketch seri porttan `K 20` (kalibre, 20 cm/s) ya da `N 20` (naif, 20 cm/s) komutunu alır ve iki tekerleği o PWM'e ayarlar.\n\n```cpp\n// sketch: kalibre_hiz\nconst int SOL_EN = 5;\nconst int SOL_IN1 = 7;\nconst int SOL_IN2 = 8;\nconst int SAG_EN = 6;\nconst int SAG_IN1 = 9;\nconst int SAG_IN2 = 10;\n\nconst float V_MAX = 0.396;   // PWM 255'te ölçülen hız (m/s)\nconst int OLU_PWM = 51;      // ölçülen ölü bölge sonu\n\n// Naif eşleme: 0 ile 255 arasında doğrusal (ölü bölgeyi unutur)\nint naifPwm(float v) {\n  return constrain((int)(255.0 * v / V_MAX), 0, 255);\n}\n\n// Kalibre eşleme: ölü bölgeyi atlar, V_MAX'ta 255'e varır\nint hizdanPwm(float v) {\n  if (v < 0.005) return 0;               // neredeyse durma isteği\n  if (v > V_MAX) v = V_MAX;\n  return OLU_PWM + (int)((255 - OLU_PWM) * v / V_MAX + 0.5);\n}\n\nvoid ileri(int deger) {\n  digitalWrite(SOL_IN1, HIGH); digitalWrite(SOL_IN2, LOW);\n  digitalWrite(SAG_IN1, HIGH); digitalWrite(SAG_IN2, LOW);\n  analogWrite(SOL_EN, deger);\n  analogWrite(SAG_EN, deger);\n}\n\nvoid setup() {\n  pinMode(SOL_EN, OUTPUT); pinMode(SOL_IN1, OUTPUT); pinMode(SOL_IN2, OUTPUT);\n  pinMode(SAG_EN, OUTPUT); pinMode(SAG_IN1, OUTPUT); pinMode(SAG_IN2, OUTPUT);\n  Serial.begin(9600);\n  Serial.setTimeout(100);\n  Serial.println(\"Komut: K 20 (kalibre) veya N 20 (naif), hiz cm/s\");\n}\n\nvoid loop() {\n  if (Serial.available() == 0) return;\n  String satir = Serial.readStringUntil('\\n');\n  satir.trim();\n  if (satir.length() < 3) return;\n  char mod = satir.charAt(0);\n  float v = satir.substring(2).toInt() / 100.0;     // cm/s -> m/s\n  int pwm = (mod == 'N') ? naifPwm(v) : hizdanPwm(v);\n  ileri(pwm);\n  Serial.print(\"mod=\"); Serial.print(mod);\n  Serial.print(\" istenen=\"); Serial.print(v, 3);\n  Serial.print(\" pwm=\"); Serial.println(pwm);\n}\n```\n\n### Nasıl çalışıyor?\n1. `hizdanPwm()` önce çok küçük istekleri (5 mm/s altı) 0'a çevirir; aksi halde robot ölü bölgenin hemen üstünde, ölçülemeyecek kadar yavaş bir hızda dolaşır.\n2. İsteği azami hızla sınırlar (`v > V_MAX`). Sonra `OLU_PWM`'den başlayan doğrusal eşlemeyi uygular. `+ 0.5` yuvarlama içindir.\n3. `naifPwm()` ölü bölgeyi hiç bilmez. 5 cm/s isteyince PWM 32 çıkar, bu ölü bölgenin içinde: robot dönmez.\n4. `N` ve `K` modları yan yana çalışır; böylece aynı hız isteğini iki yöntemle deneyip robotun gerçek hızını karşılaştırırsın.\n\n### Ölçüm: istenen ve gerçek hız\nHer komuttan sonra robotun hareketi oturmasını bekleyip 1 saniyelik yolunu ölçtük:\n\n| İstenen (cm/s) | Naif PWM | Naif gerçek hız (cm/s) | Kalibre PWM | Kalibre gerçek hız (cm/s) |\n|---|---|---|---|---|\n| 5 | 32 | 0 (dönmedi) | 77 | 5,0 |\n| 10 | 64 | 2,5 | 103 | 10,0 |\n| 20 | 128 | 14,9 | 154 | 19,9 |\n| 39 | 251 | 38,6 | 252 | 38,8 |\n\nNaif eşleme yalnızca tam hıza yakın isteklerde işe yarıyor; yavaş hızlarda hata çok büyük (10 cm/s isteyince 2,5 cm/s). Kalibre eşlemede hata hiçbir satırda 0,2 cm/s'yi geçmedi. Bu başarı, ölü bölgenin ve azami hızın ölçüldüğü robot için geçerlidir; başka bir robot için sayıları yeniden ölçmelisin.\n\nGerçek robotta farklı olabilecekler: pil boşaldıkça azami hız düşer, bu yüzden kalibrasyon pil doluyken yapılır ve zamanla yenilenir. Yerdeki sürtünme (halı, parke) ölü bölgeyi değiştirir. Hız PWM'e tam doğrusal bağlı olmayabilir; o zaman iki nokta yerine daha çok nokta ölçüp aralara doğru çizersin.\n\n### Dene\n- Tarama sketch'inde `ADIM_ARALIGI`'nı 100 ms yap. Bulduğun PWM değişiyor mu? Neden?\n- `kalibre_hiz` içinde `OLU_PWM`'i 70 yap ve `K 10` dene. Ne olur? Bu hata gerçek robotta nasıl ortaya çıkar?\n- Kendi robotunda ölü bölgeyi sol ve sağ motor için ayrı ayrı bul. Fark çıkarsa ne yapman gerekir? (Düz gitme konusu H4'te işlenecek.)\n\n### Sık yapılan hatalar\n- PWM'i doğrudan hız sanmak: \"128 yarım hızdır\" doğru değildir.\n- Kalibrasyonu boş pille yapmak.\n- Ölü bölge sonunu butona bastığın değer sanmak: o, gözle fark ettiğin eşiktir. Ölü bölgenin sonu, hız doğrusunun sıfırı kestiği PWM'dir (burada 51).\n- `OLU_PWM` ve `V_MAX` sayılarını başka robota kopyalamak.",
          "question": "Neden kalibrasyon sayıları (`OLU_PWM`, `V_MAX`) kodun başında `const` olarak durmalı? Robotun pilini ya da tekerleğini değiştirdiğinde kodun hangi satırlarına dokunmak gerekir?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Ölü bölgenin ne olduğunu ve PWM ile hızın neden orantılı olmadığını\n- Ölü bölgeyi ve azami hızı ölçmeyi, iki noktadan doğru geçirerek bulmayı\n- İstenen hızı (cm/s) PWM değerine çeviren kalibrasyon fonksiyonunu\n- Kalibrasyonun ne zaman yenilenmesi gerektiğini\n\n### Önceden bilmen gerekenler\n76. dersten tekerlek hızı (m/s), 77. dersten yön ve PWM kontrolü. Modül 3'ten butonla INPUT_PULLUP (6. ders), map ve kalibrasyon fikri (14. ders), millis() (27. ders). Düz doğru denklemi (iki noktadan eğim) bilmen yeterlidir.\n\n### PWM hız değildir\n`analogWrite(EN, 128)` yazınca robot yarım hızda gitmez. Sebep **ölü bölge**dir: motor dönmeye başlamadan önce sürtünmeyi ve dişlilerin direncini yenecek kadar güç ister. Düşük PWM'de bu güç yoktur; motor vızıldar ama tekerlek durur. Gerçek motorlarda da görülür ve motora, dişliye, pile, zemine göre değişir. Benzetimdeki robotun ölü bölgesi PWM'in ilk yüzde 20'sidir: yaklaşık 51 ve altında tekerlek dönmez.\n\n### Ölü bölgenin üstü yaklaşık doğrusaldır\nÖlü bölgeden sonra hız PWM ile doğrusal artar ve PWM 255'te azami hıza ulaşır. Benzetimde bu 0,396 m/s'dir. Yani hız, PWM'in kendisiyle değil, ölü bölgenin üstündeki kısmıyla orantılıdır:\n\n```\nv = V_MAX · (PWM − 51) / (255 − 51)\n```\n\n### Ölçerek bulmak\nGözle fark ettiğin ilk PWM (örneğin 57) ölü bölgenin sonu değil, yalnızca \"gözle görülür\" eşiğidir; çünkü hız sıfırdan yavaş yavaş artar. Güvenilir yöntem iki iyi ölçülebilen noktadan doğru çizmektir. Örnek: PWM 100'de 9,4 cm/s ve PWM 200'de 28,8 cm/s ölçtün.\n\n- Eğim = (28,8 − 9,4) / (200 − 100) = 0,194 cm/s her PWM birimi için\n- Hızın sıfır olduğu PWM = 100 − 9,4 / 0,194 yaklaşık 51\n\nGerçek robotta hızı 1 metrelik yolu kronometreyle ölçerek bulabilirsin.\n\n### Kalibrasyon fonksiyonu\nİstenen hızı PWM'e çeviren fonksiyon ölü bölgeyi atlar:\n\n```\nPWM = 51 + (255 − 51) · v / V_MAX\n```\n\nv = 0'da 51'den başlar, v = V_MAX'ta 255 olur. Çok küçük istekleri (5 mm/s altı) sıfıra çevirmek de iyi bir alışkanlıktır. Ölü bölgeyi hiç hesaba katmayan \"naif\" eşleme (PWM = 255 · v / V_MAX) yavaş hızlarda büyük hata yapar: 5 cm/s isteyince PWM 32 çıkar ve robot hiç kıpırdamaz.\n\n### Kalibrasyon kalıcı değildir\nPil boşaldıkça azami hız düşer; halı ve parke ölü bölgeyi değiştirir; başka robotun sayıları sana uymaz. Bu yüzden `OLU_PWM` ve `V_MAX` kodun başında `const` olarak durur ve gerektiğinde yeniden ölçülür. Doluya yakın pille ve robotu kullanacağın zeminde ölç.\n\n### Özet\nMotor ölü bölge nedeniyle düşük PWM'de dönmez, üstünde ise hız PWM'e yaklaşık doğrusal bağlıdır. İki ölçüm noktasından ölü bölge sonu ve azami hız bulunur. Kalibrasyon fonksiyonu istenen hızı bu doğruya göre PWM'e çevirir. Sayılar robota, zemine ve piline özgüdür; değişince yeniden ölçülmelidir.",
          "concepts": [
            {
              "term": "Ölü bölge",
              "definition": "Motorun sürtünmeyi yenemediği için dönmediği düşük PWM aralığı. Benzetimdeki robotta yaklaşık 51 ve altı.",
              "example": "PWM 40'ta motor vızıldar ama tekerlek kıpırdamaz.",
              "pitfall": "128'in yarım hız olduğunu sanmak; hız PWM'e değil, PWM − ölü bölge farkına orantılıdır."
            },
            {
              "term": "Azami hız (V_MAX)",
              "definition": "PWM 255'te tekerleğin ulaştığı en yüksek hız; derslerin robotunda 0,396 m/s.",
              "example": "Ölçülen eğimden: 0,194 cm/s × (255 − 51) yaklaşık 39,6 cm/s.",
              "pitfall": "V_MAX'ı başka bir robotun ya da boşalmış bir pilin değeriyle kullanmak."
            },
            {
              "term": "Ölçerek kalibrasyon",
              "definition": "İki iyi ölçülebilen noktadan düz bir doğru geçirip eğimi, ölü bölge sonunu ve azami hızı bulmak.",
              "example": "PWM 100'de 9,4 cm/s ve PWM 200'de 28,8 cm/s ölçülürse hız sıfırı yaklaşık PWM 51'de keser.",
              "pitfall": "Gözle fark ettiğin ilk PWM'i (57) ölü bölge sonu sanmak; gerçek sonu hız doğrusunun sıfırı kestiği yerdir."
            },
            {
              "term": "hizdanPwm()",
              "definition": "İstenen hızı PWM'e çeviren fonksiyon: PWM = OLU_PWM + (255 − OLU_PWM) · v / V_MAX. Çok küçük isteklerde 0 döner.",
              "example": "20 cm/s isteyince fonksiyon 154 verir; robot gerçekten yaklaşık 20 cm/s gider.",
              "pitfall": "Ölü bölgeyi unutup PWM = 255 · v / V_MAX yazmak; yavaş hızlarda PWM ölü bölgede kalır."
            },
            {
              "term": "Kalibrasyonu yenilemek",
              "definition": "Pil, zemin, tekerlek ya da motor değişince OLU_PWM ve V_MAX'ın yeniden ölçülmesi.",
              "example": "Halıdan parkeye geçince ölü bölge değişir; sayıları yeniden ölçersin.",
              "pitfall": "Boş pille kalibre edip dolu pille sürmek; hızlar tutmaz."
            }
          ],
          "quiz": [
            {
              "id": "m5h1d78-q1",
              "kind": "numeric",
              "prompt": "Kalibrasyon: OLU_PWM = 51, V_MAX = 0,396 m/s. hizdanPwm(0.25) (0,25 m/s için, yuvarlamalı) kaç döndürür?\n\nFormül: 51 + (int)(204 * v / V_MAX + 0.5)",
              "answer": 180,
              "tolerance": 1,
              "explanation": "204 · 0,25 / 0,396 yaklaşık 128,8; +0,5 ile 129,3 ve int'e kesilince 129 olur. 51 + 129 = 180. Ölü bölgeyi (51) eklemeyi unutmak 129 verir; bu değer 0,25 m/s'nin çok altında bir hızdır.",
              "skills": [
                "prog-timing"
              ]
            },
            {
              "id": "m5h1d78-q2",
              "kind": "numeric",
              "prompt": "Bir robotta PWM 100'de 10 cm/s, PWM 200'de 30 cm/s ölçüldü. Hız doğrusal artıyorsa ölü bölgenin sonu (hızın sıfır olduğu PWM) kaçtır?",
              "answer": 50,
              "tolerance": 0,
              "explanation": "Eğim = (30 − 10) / (200 − 100) = 0,2 cm/s her PWM birimi için. Sıfır noktası = 100 − 10 / 0,2 = 50. Doğrunun PWM ekseni ile kesişimini aramak gerekir; 10 ya da 100 gibi ölçüm noktalarını cevap saymak yanlıştır.",
              "skills": [
                "prog-timing"
              ]
            },
            {
              "id": "m5h1d78-q3",
              "kind": "predict-output",
              "prompt": "Bu kod ne yazdırır?\n\n```\nint hizdanPwm(float v) {\n  if (v < 0.005) return 0;\n  if (v > 0.396) v = 0.396;\n  return 51 + (int)(204 * v / 0.396 + 0.5);\n}\nvoid setup() {\n  Serial.begin(9600);\n  Serial.println(hizdanPwm(0.003));\n  Serial.println(hizdanPwm(0.5));\n}\nvoid loop() {}\n```",
              "options": [
                "0 ve 303",
                "0 ve 255",
                "51 ve 255",
                "3 ve 255"
              ],
              "answer": 1,
              "explanation": "0,003 m/s, 0,005'in altında olduğu için fonksiyon 0 döndürür (ölü bölgenin hemen üstünde ölçülemeyecek kadar yavaş dolaşmamak için). 0,5 m/s azami hıza (0,396) sınırlanır ve 51 + 204 = 255 olur. 303 sınırlama yapılmazsa çıkardı ve analogWrite'a taşardı.",
              "skills": [
                "prog-structure",
                "prog-debug"
              ]
            },
            {
              "id": "m5h1d78-q4",
              "kind": "find-bug",
              "prompt": "Robot 20 cm/s ve üstü hızlarda iyi gidiyor ama 5 cm/s istenince hiç kıpırdamıyor. Ölü bölge sonu 51, V_MAX = 0,396. Hata nerede?\n\n```\nint hizdanPwm(float v) {\n  return (int)(255 * v / V_MAX);\n}\n```",
              "options": [
                "return satırı: ölü bölge eklenmemiş, 5 cm/s için PWM 32 çıkıyor ve ölü bölgede kalıyor",
                "V_MAX çok büyük",
                "float yerine int kullanılmalı",
                "255 yerine 256 yazılmalı"
              ],
              "answer": 0,
              "explanation": "255 · 0,05 / 0,396 yaklaşık 32 olur ve bu 51'in altındadır, yani motor dönmez. Doğru eşleme 51 + 204 · v / V_MAX biçiminde ölü bölgenin üstünden başlar. Diğer seçenekler hatanın nedeni değildir.",
              "skills": [
                "prog-debug"
              ]
            },
            {
              "id": "m5h1d78-q5",
              "kind": "mcq",
              "prompt": "Robot dolu pille kalibre edildi. Bir hafta sonra pil yarı yarıya boşalmış. 20 cm/s isteyen robot nasıl davranır?",
              "options": [
                "Yine tam 20 cm/s gider, kalibrasyon kalıcıdır",
                "Daha hızlı gider",
                "Hiç hareket etmez",
                "Daha yavaş gider, çünkü azami hız pil boşaldıkça düşer"
              ],
              "answer": 3,
              "explanation": "Pil boşaldıkça motorlara giden gerilim düşer ve aynı PWM'de hız azalır; sabit bir V_MAX ile yapılan eşleme artık tutmaz. Bu yüzden kalibrasyon pil doluyken yapılır ve zamanla yenilenir.",
              "skills": [
                "prog-planning"
              ]
            }
          ]
        },
        {
          "title": "Seri komutlarla sürüş (uzaktan kumanda simülasyonu)",
          "durationMin": 25,
          "problem": "Bilgisayar oyunlarında W, A, S, D tuşlarıyla karakteri yürütürsün. Robotu da aynı tuşlarla sürebilirsen ne güzel olur. Aslında bunun için ihtiyacın olan şey, seri porttan gelen harfi anlayıp motorlara çeviren küçük bir \"ayrıştırıcı\". Bir kablo ya da Bluetooth modülü, aynı harfleri robota taşıyabilir. Bu derste kablosuz bölümü atlayıp komutları Serial Monitor'den göndereceğiz.",
          "contentMd": "### Komut dili\nÖnce robota ne söyleyeceğimizi belirleyelim. Her komut bir satırdır: bir harf ve isteğe bağlı bir sayı. Satır, yeni satır karakteriyle (`\\n`) biter.\n\n| Komut | Anlamı | Tekerlekler |\n|---|---|---|\n| `W` | İleri | sol +, sağ + |\n| `S` | Geri | sol −, sağ − |\n| `A` | Yerinde sola dön | sol −, sağ + |\n| `D` | Yerinde sağa dön | sol +, sağ − |\n| `X` | Dur | ikisi de 0 |\n\nHarften sonra yazılan sayı hızdır (PWM, 0-255). Sayı yazılmazsa 150 kullanılır. Örnekler: `W200`, `S`, `A100`, `X`. Küçük harf de kabul edilir. Tanınmayan harfe robot `?` ile cevap verir.\n\nSerial Monitor'de satır sonu ayarını \"Yeni satır (Newline)\" yap; yoksa komut hiç tamamlanmaz.\n\n### Devre\n| Parça | Bağlantı |\n|---|---|\n| Sol motor | EN **D5** (PWM), IN1 **D7**, IN2 **D8** |\n| Sağ motor | EN **D6** (PWM), IN3 **D9**, IN4 **D10** |\n| Motor gücü | Ayrı pil kutusu; sürücü GND'si Arduino GND'siyle ortak |\n\n**Güvenlik:** İlk denemeyi tekerlekler havadayken yap. Bir komut ya da bağlantı hatasında robotun kaçabileceğini hesaba kat. Pil kutusunu ters bağlama ve kısa devre etme.\n\n### Program\nAyrıştırıcının üç parçası var:\n\n1. **Okuma:** `loop()` seri porttan gelen karakterleri tek tek `tampon` adlı diziye ekler. Yeni satır gelince tampon bir komuttur ve `satirIsle()` çağrılır.\n2. **Çözme:** Dizinin ilk karakteri komut harfidir (`toupper` ile büyütülür). Kalanı `atoi` ile sayıya çevrilir. `atoi` \"ASCII to integer\" demektir, yazıyı tam sayıya çevirir (\"200\" → 200). `constrain` hızı 0-255'e sınırlar.\n3. **Uygulama:** `switch` harfe göre tekerlek hızlarını `surus(sol, sag)` ile ayarlar.\n\n```cpp\n// sketch: seri_komut\nconst int SOL_EN = 5;\nconst int SOL_IN1 = 7;\nconst int SOL_IN2 = 8;\nconst int SAG_EN = 6;\nconst int SAG_IN1 = 9;\nconst int SAG_IN2 = 10;\n\nconst int VARSAYILAN_HIZ = 150;   // hız yazılmazsa kullanılan PWM\nchar tampon[12];\nint uzunluk = 0;\n\nvoid motor(int en, int in1, int in2, int pwm) {\n  digitalWrite(in1, pwm > 0);\n  digitalWrite(in2, pwm < 0);\n  analogWrite(en, abs(pwm));\n}\n\nvoid surus(int sol, int sag) {\n  motor(SOL_EN, SOL_IN1, SOL_IN2, sol);\n  motor(SAG_EN, SAG_IN1, SAG_IN2, sag);\n}\n\nvoid komutIsle(char komut, int hiz) {\n  switch (komut) {\n    case 'W': surus(hiz, hiz); break;       // ileri\n    case 'S': surus(-hiz, -hiz); break;     // geri\n    case 'A': surus(-hiz, hiz); break;      // yerinde sola dön\n    case 'D': surus(hiz, -hiz); break;      // yerinde sağa dön\n    case 'X': surus(0, 0); hiz = 0; break;  // dur\n    default:\n      Serial.println(\"?\");\n      return;\n  }\n  Serial.print(\"OK \");\n  Serial.print(komut);\n  Serial.print(' ');\n  Serial.println(hiz);\n}\n\nvoid satirIsle() {\n  tampon[uzunluk] = '\\0';\n  char komut = toupper(tampon[0]);\n  int hiz = VARSAYILAN_HIZ;\n  if (uzunluk > 1) hiz = constrain(atoi(tampon + 1), 0, 255);\n  komutIsle(komut, hiz);\n}\n\nvoid setup() {\n  pinMode(SOL_EN, OUTPUT); pinMode(SOL_IN1, OUTPUT); pinMode(SOL_IN2, OUTPUT);\n  pinMode(SAG_EN, OUTPUT); pinMode(SAG_IN1, OUTPUT); pinMode(SAG_IN2, OUTPUT);\n  Serial.begin(9600);\n  Serial.println(\"Hazir: W S A D X + hiz (0-255)\");\n}\n\nvoid loop() {\n  while (Serial.available() > 0) {\n    char c = Serial.read();\n    if (c == '\\n' || c == '\\r') {\n      if (uzunluk > 0) satirIsle();\n      uzunluk = 0;\n    } else if (uzunluk < (int)sizeof(tampon) - 1) {\n      tampon[uzunluk++] = c;\n    }\n  }\n}\n```\n\n### Nasıl çalışıyor?\n1. `loop()` hiç beklemez (`delay` yok, 26. ders). Okuma sırasında gelen her karakter tampona gider, böylece uzun bir komut da yarım kalmaz.\n2. Hem `\\n` hem `\\r` satır sonu sayılır. Serial Monitor'ün \"Satır sonu\" ayarı hangisini gönderirse göndersin çalışır. \"Both NL & CR\" seçersen iki karakter gelir, ikincisinde tampon boştur ve hiçbir şey olmaz.\n3. Tampon 12 karakterlik; uzun satırın fazlası atılır, program taşmaz.\n4. `X` komutunda hız 0 olarak yazdırılır.\n5. Şu an sürülen yön ve hız bir değişkende değil, doğrudan motor pinlerindedir. Komut gelene kadar pinler aynı kalır. Bu önemli bir sonuç doğuracak, aşağıda göreceksin.\n\n### Ölçüm\nBenzetimdeki robota şu komutları gönderdik (komutlar arasında hareketin oturması beklendi):\n\n| Gönderilen | Beklenen | Ölçülen |\n|---|---|---|\n| `W200` | 0,289 m/s ileri (76. dersteki modelden) | +x yönünde 0,29 m/s, sapma yok |\n| `X` | durur | 0,5 sn sonra hız sıfır, seriye `OK X 0` |\n| `S` (hız yok, CRLF ile) | 150 ile geri: 0,19 m/s | −x yönünde 0,19 m/s, seriye `OK S 150` |\n| `A150` 0,5 sn, sonra `X` | sola yaklaşık 90° | yaklaşık +91°, konum kaymadı |\n| `d150` 0,5 sn, sonra `X` | küçük harf kabul, sağa yaklaşık 90° | başlangıç yönüne geri döndü (±6° içinde) |\n| `Q` | `?` yazar, robot etkilenmez | seriye `?`, robot hareketsiz |\n| `W10` | PWM 10 ölü bölgede (78. ders) | `OK W 10` yazdı ama robot kıpırdamadı |\n| `W999` | 255'e sınırlanır | `OK W 255`, 0,396 m/s |\n\nYerinde dönüşün açısı, süreye bağlıdır: 150 PWM ile robot saniyede yaklaşık 183° döner. 90° için yaklaşık 0,5 sn gerekir. Bu süre pile ve zemine göre değişir; hassas dönüş için ileride enkoder ve IMU kullanacaksın.\n\n### Kumandanın kopması\nSon satırdaki bir deneme daha: tek bir `W150` gönder ve başka hiçbir şey gönderme. Benzetimde robot 3 saniye sonra hâlâ 0,19 m/s ile ilerliyordu ve yarım metreden fazla yol aldı. Bunun nedeni açık: robot bir komutu **yeni komut gelene kadar** uygular. Kablo çıkar, Bluetooth kopar ya da bilgisayar donarsa robot son komutla gitmeye devam eder. Gerçek bir robot için bu tehlikeli bir davranış. 80. dersteki projede bu açığı kapatacaksın.\n\nGerçek robotta farklı olabilecekler: kablosuz bağlantılarda karakter kaybolabilir ya da gecikebilir. Benzetimde seri hat kusursuz ve gecikmesizdir.\n\n### Dene\n- `VARSAYILAN_HIZ`'ı 100 yap. `W` komutuyla robot ne kadar hızlı gidiyor? 51 altına inerse ne olur?\n- `E` harfini \"yavaş ileri\" olarak ekle (hız 80 sabit). `switch` içine tek bir `case` yeterli mi?\n- Komutu `W 200` (boşluklu) yazınca ne oluyor? `atoi` boşluğu nasıl karşılıyor? Dene.\n\n### Sık yapılan hatalar\n- Serial Monitor'ün satır sonu ayarını \"Satır sonu yok\" bırakmak: komut tamamlanmaz, robot hiç tepki vermez.\n- Tamponu `String` ile birleştirip her karakterde yeni bellek ayırmak. Küçük bellekli Uno'da `char` dizisi daha güvenli.\n- Hızı sınırlamamak: `W9999` gibi saçma bir sayı `analogWrite`'a taşar. `constrain` bunu önler.\n- Bilinmeyen komutta hiçbir şey yapmamak: kullanıcı ne olduğunu anlamaz. Bir `?` yeterlidir.\n- Robotu hiçbir zaman otomatik durmayacak şekilde bırakmak. Sonraki derste göreceğiz.",
          "question": "Komut protokolünü \"ilk karakter komut, kalanı sayı\" olarak tasarladık. Daha çok komut eklemek gerekirse (örneğin `+` ve `-` ile hız artırmak) bu tasarım yeter mi? Yeni komutlar eklerken en çok neye dikkat etmek lazım?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Seri porttan gelen harfli komutu okuyup motorlara çeviren bir ayrıştırıcının yapısını\n- Karakterleri tampona toplamayı ve satır sonunda komutu işlemeyi\n- atoi, toupper ve constrain ile komutu çözmeyi ve sınırlamayı\n- Robotun son komutu yeni komut gelene kadar uyguladığını ve bunun riskini\n\n### Önceden bilmen gerekenler\nModül 3'ten Serial Monitor ile veri okuma (9. ders), switch (7. ders), bloklamayan döngü (26-27. dersler). 76. dersten tekerlek yönleri, 77. dersten motor() mantığı (işaretli PWM: pozitif ileri, negatif geri), 78. dersten ölü bölge.\n\n### Komut dili tasarlamak\nUzaktan kumanda bir kablo, Bluetooth ya da Wi-Fi olabilir; robot için hepsi aynı şeydir: gelen harfler. Biz Serial Monitor'ü kumanda yerine kullanıyoruz. Her komut bir satırdır: bir harf ve isteğe bağlı bir sayı.\n\n| Komut | Anlam | Tekerlekler (sol, sağ) |\n|---|---|---|\n| W | ileri | +, + |\n| S | geri | −, − |\n| A | yerinde sola | −, + |\n| D | yerinde sağa | +, − |\n| X | dur | 0, 0 |\n\nHarften sonraki sayı PWM hızıdır (0-255); yazılmazsa varsayılan 150 kullanılır. `W200`, `a100`, `X` geçerli komutlardır. Komutun bittiğini anlamak için satır sonu karakteri (`\\n`) gerekir; Serial Monitor'de \"Yeni satır\" seçili olmalıdır.\n\n### Üç adımlı ayrıştırıcı\n1. **Okuma:** `loop()` seri porttan gelen karakterleri bir `char` dizisine (tampon) ekler. Satır sonu gelince tampon tam bir komuttur.\n2. **Çözme:** İlk karakter komuttur (`toupper` ile büyütülür, böylece `w` da çalışır). Kalanı `atoi` ile sayıya çevrilir (\"200\" → 200) ve `constrain` ile 0-255'e sınırlanır.\n3. **Uygulama:** Bir `switch` komuta göre iki tekerleğin PWM'ini ayarlar. Tanınmayan harfe `?` cevabı verilir.\n\nTampon sabit uzunluktadır (12 karakter). Fazla karakter atılır; böylece uzun ya da bozuk bir satır belleği taşırmaz. Küçük bellekli Uno'da `String` yerine `char` dizisi daha güvenlidir.\n\n### Dönüş ve süre\nYerinde dönüşte ω = 2·v / L olur (76. ders). PWM 150'de tekerlek hızı yaklaşık 0,19 m/s olduğundan ω yaklaşık 3,2 rad/s, yani saniyede yaklaşık 183° eder; 90° için kabaca yarım saniye gerekir. Süre pile ve zemine bağlıdır. Doğru açı için sonraki haftalarda enkoder ve IMU kullanacaksın.\n\n### Tehlikeli bir davranış\nBu ayrıştırıcı bir komutu yeni komut gelene kadar uygular. Tek bir `W150` gönderip bağlantı kopsa robot gitmeye devam eder. Gerçek bir robotta bu istenmez; 80. dersteki projede komut kesilince durmayı ekleyeceksin.\n\n### Özet\nSeri komut ayrıştırıcı karakterleri tampona toplar, satır sonunda ilk harfi komut, kalanını sayı olarak çözer. `constrain` saçma değerleri sınırlar, bilinmeyen komut `?` ile bildirilir. Robot son komutu bir sonraki komuta kadar sürdürür; kumanda kopmasına karşı önlem bir sonraki dersin konusudur.",
          "concepts": [
            {
              "term": "Komut ayrıştırıcı",
              "definition": "Seri porttan gelen karakterleri toplayıp komuta (harf) ve değere (sayı) ayıran program parçası.",
              "example": "W200 satırı 'ileri, hız 200' olarak çözülür.",
              "pitfall": "Satır sonu gelmeden komutu işlemeye çalışmak; tampon yarım kalır."
            },
            {
              "term": "Tampon (char dizisi)",
              "definition": "Gelen karakterlerin satır bitene kadar biriktirildiği sabit uzunlukta dizi.",
              "example": "char tampon[12]; en fazla 11 karakter tutar, sonuncusu '\\0' içindir.",
              "pitfall": "Tamponu sınırlamamak: uzun bir satır belleği taşırır."
            },
            {
              "term": "atoi, toupper ve constrain",
              "definition": "atoi yazıyı tam sayıya çevirir (\"200\" → 200), toupper küçük harfi büyütür, constrain değeri bir aralığa sıkıştırır.",
              "example": "atoi(\"999\") 999 verir; constrain(999, 0, 255) onu 255 yapar.",
              "pitfall": "Hızı sınırlamamak: W9999 gibi saçma bir değer analogWrite'a taşar."
            },
            {
              "term": "Satır sonu (\\n ve \\r)",
              "definition": "Komutun bittiğini bildiren karakter. Serial Monitor'de 'Yeni satır' seçili olmalıdır.",
              "example": "Hem \\n hem \\r satır sonu sayılırsa hangi ayar seçilirse seçilsin komut işlenir.",
              "pitfall": "'Satır sonu yok' seçmek: komut tamamlanmaz, robot hiç tepki vermez."
            },
            {
              "term": "Son komut sürer",
              "definition": "Bu ayrıştırıcı bir komutu, yeni komut gelene kadar uygular; kendi başına durmaz.",
              "example": "Tek bir W150'den sonra bağlantı koparsa robot gitmeye devam eder.",
              "pitfall": "Bunu önemsememek: kumanda koptuğunda robot kontrolsüz ilerler."
            }
          ],
          "quiz": [
            {
              "id": "m5h1d79-q1",
              "kind": "predict-output",
              "prompt": "Tamponda \"d75\" var. Bu kod ne yazdırır?\n\n```\nchar tampon[12] = \"d75\";\nint uzunluk = 3;\nchar komut = toupper(tampon[0]);\nint hiz = 150;\nif (uzunluk > 1) hiz = constrain(atoi(tampon + 1), 0, 255);\nSerial.print(komut);\nSerial.print(' ');\nSerial.println(hiz);\n```",
              "options": [
                "d 75",
                "D 150",
                "D 75",
                "D 0"
              ],
              "answer": 2,
              "explanation": "toupper 'd' harfini 'D' yapar. uzunluk 1'den büyük olduğu için atoi(tampon + 1) yani \"75\" okunur ve hız 75 olur. 150 yalnızca hız yazılmadığında kullanılır.",
              "skills": [
                "prog-structure",
                "digital-out"
              ]
            },
            {
              "id": "m5h1d79-q2",
              "kind": "numeric",
              "prompt": "Ayrıştırıcıya S-40 komutu geliyor. hiz = constrain(atoi(tampon + 1), 0, 255) çalışınca hiz kaç olur?",
              "answer": 0,
              "tolerance": 0,
              "explanation": "atoi(\"-40\") −40 verir; constrain alt sınırı 0 olduğu için sonuç 0'dır. Yön harfle (S) seçilir, işaretle değil. Hız negatif olmaz; −40'ın geri hız olacağını sanmak yanlıştır.",
              "skills": [
                "prog-debug"
              ]
            },
            {
              "id": "m5h1d79-q3",
              "kind": "numeric",
              "prompt": "PWM 150 ile her tekerlek yaklaşık 0,192 m/s hızla zıt yönde dönüyor (yerinde dönüş). L = 0,12 m. Robot 180° (π rad) dönmek için yaklaşık kaç saniye sürmelidir?",
              "answer": 0.98,
              "tolerance": 0.03,
              "unit": "s",
              "explanation": "Yerinde dönüşte ω = 2·v / L = 2 · 0,192 / 0,12 = 3,2 rad/s. Süre = π / 3,2 yaklaşık 0,98 s. v yerine 2v kullanmak (tekerlekler zıt döner) dönüş hızını ikiye katlar.",
              "skills": [
                "prog-timing"
              ]
            },
            {
              "id": "m5h1d79-q4",
              "kind": "find-bug",
              "prompt": "W komutu verilince robot ileri gitmek yerine geri gidiyor. Hata hangisinde?\n\n```\nswitch (komut) {\n  case 'W': surus(hiz, hiz);\n  case 'S': surus(-hiz, -hiz); break;\n  case 'X': surus(0, 0); break;\n}\n```",
              "options": [
                "'W' satırı: surus(hiz, hiz) yanlış hesaplanıyor",
                "'W' satırında break eksik; kontrol 'S' satırına düşüp motorları geri çalıştırıyor",
                "'S' satırında break fazla",
                "switch yerine if kullanılmalı"
              ],
              "answer": 1,
              "explanation": "break olmadığı için switch 'W' durumundan 'S' durumuna düşer (fall-through); ikinci surus çağrısı ilkini ezer ve robot geri gider. surus(hiz, hiz) doğrudur.",
              "skills": [
                "prog-debug"
              ]
            },
            {
              "id": "m5h1d79-q5",
              "kind": "mcq",
              "prompt": "Bu haftaki seri komut programı çalışıyor. Operatör tek bir W150 gönderip bağlantı kopuyor. Robot ne yapar?",
              "options": [
                "Hemen durur",
                "Birkaç saniye sonra kendiliğinden durur",
                "Yeni komut gelene kadar son komutla ilerlemeye devam eder",
                "Geri döner"
              ],
              "answer": 2,
              "explanation": "Pinler komut gelene kadar aynı kalır; programda zaman aşımı yoktur. Bu yüzden robot son komutla gitmeye devam eder. Bu, 80. dersteki watchdog ile kapatılacak bir güvenlik açığıdır.",
              "skills": [
                "prog-structure"
              ]
            }
          ]
        },
        {
          "title": "Proje: Komutlu araba",
          "durationMin": 35,
          "problem": "Uzaktan kumandalı bir arabayı sürerken kumandanın pili biter, ya da bağlantı kopar. Araba son komutla gitmeye devam ederse masadan düşer ya da bir şeye çarpar. Güvenli bir robot, \"komutlar kesildi\" durumunu fark etmeli ve kendiliğinden durmalı. Bu projede kendi komutlu arabanı yapıp bu güvenlik önlemini ekleyeceksin ve ölçeceksin: komut kesildikten sonra robot ne kadar yol alıyor?",
          "contentMd": "### Ne yapacağız?\nBu proje bu haftaki dersleri birleştirir:\n- **Ders 76:** v ve ω formülleri. Yerinde dönüş hızı ω = 2·v / L ile hesaplanır.\n- **Ders 77:** Motor sürücüsü: yön pinleri ve PWM.\n- **Ders 78:** `hizdanPwm()` ile istenen cm/s hızı PWM'e çevirme (ölü bölgeyi atlar).\n- **Ders 79:** Seri komut ayrıştırıcı (W, S, A, D, X).\n- **Modül 3:** `millis()` ile bloklamayan zamanlama (27. ders) ve `enum` ile durum makinesi (28. ders).\n\nYeni olan: **komut watchdog'u** (\"bekçi köpeği\"). Son geçerli komuttan beri `CMD_TIMEOUT = 700 ms` geçerse robot kendiliğinden durur. Bu yüzden komutu gönderen taraf, robot gitmeye devam etsin diye komutu her 200 ms gibi sık aralıklarla **tekrar etmelidir** (tuşa basılı tutmak gibi).\n\n### Hyvex vakası: kontrol kopunca ne olur?\nHyvex staj programının 9. günü fail-safe ve güvenlik mühendisliğine ayrılmıştır. O günün vakası bir **komut watchdog'udur**: `CMD_TIMEOUT = 0.7 s`. Günün düşüncesi şu soruya dayanır: \"Kontrol kopunca ne olur?\" Programdaki ders sorusu da şudur: operatörün tarayıcısı çökerse gimbal ne yapmalı? Biz aynı soruyu kendi robotumuz için soruyoruz: sürücüden gelen komutlar kesilirse robot ne yapmalı? Projede aynı süreyi kullanıyoruz: `CMD_TIMEOUT = 700 ms`. Bu sürenin neden iyi ya da kötü bir seçim olduğunu aşağıda ölçeceğiz.\n\n### Devre\n| Parça | Bağlantı |\n|---|---|\n| Sol motor | EN **D5** (PWM), IN1 **D7**, IN2 **D8** |\n| Sağ motor | EN **D6** (PWM), IN3 **D9**, IN4 **D10** |\n| Durum LED'i + 330 Ω direnç | **D13** → direnç → LED anodu; katot → GND |\n| Motor gücü | Ayrı pil kutusu; sürücü GND'si Arduino GND'siyle ortak |\n\nLED yanıyorsa robot \"sürülüyor\" durumundadır; söndüyse duruyor. Motor sürücüsü L298N ya da TB6612 olabilir (77. ders).\n\n**Güvenlik:** Motorlar için ayrı pil kullan ve GND'leri birleştir. Pil kutusunu ters bağlama, kısa devre etme. Robotu ilk kez çalıştırırken tekerlekler havada olsun. Robotu masanın kenarında kontrolsüz bırakma: watchdog güvenlik katmanlarından biridir, tek önlem değildir.\n\n### Komut dili\nDers 79'dan farklar: hız artık **cm/s** olarak yazılır (`hizdanPwm` PWM'e çevirir), hız üst sınırı 39 cm/s'dir.\n\n| Komut | Anlamı |\n|---|---|\n| `W20` | 20 cm/s ileri |\n| `S20` | 20 cm/s geri |\n| `A12` | yerinde sola dön; her tekerlek 12 cm/s |\n| `D12` | yerinde sağa dön; her tekerlek 12 cm/s |\n| `X` | dur |\n\nSayı yazılmazsa 20 cm/s kullanılır. Yerinde dönüşte ω = 2·v / L olur (76. ders). 12 cm/s için ω = 2·0,12 / 0,12 = 2 rad/s ≈ 115°/s. 90° dönmek için süre = (π/2) / 2 ≈ 0,8 sn.\n\n### Durum makinesi\n| Durum | Motorlar | LED | Bu durumdan çıkış |\n|---|---|---|---|\n| DURUYOR | durur | söner | W, S, A, D (hız > 0) gelirse SURUYOR |\n| SURUYOR | son komuta göre | yanar | `X` gelirse ya da 700 ms komut gelmezse DURUYOR |\n\nHer **geçerli** komut zamanı sıfırlar (`sonKomut = millis()`). Geçersiz komut (`Q` gibi) zamanı sıfırlamaz: aksi halde rastgele gürültü robotu sonsuza kadar sürdürebilirdi.\n\n### Program\n```cpp\n// sketch: komutlu_araba\nconst int SOL_EN = 5;\nconst int SOL_IN1 = 7;\nconst int SOL_IN2 = 8;\nconst int SAG_EN = 6;\nconst int SAG_IN1 = 9;\nconst int SAG_IN2 = 10;\nconst int DURUM_LED = 13;               // yanık = robot sürülüyor\n\nconst unsigned long CMD_TIMEOUT = 700;  // ms: bu süre komut gelmezse dur\nconst float L = 0.12;                   // aks aralığı (m)\nconst float V_MAX = 0.396;              // PWM 255'te hız (m/s)\nconst int OLU_PWM = 51;                 // ölü bölge sonu\nconst int VARSAYILAN_CM = 20;           // hız yazılmazsa (cm/s)\nconst int MAKS_CM = 39;                 // V_MAX'ın altında\n\nenum Durum { DURUYOR, SURUYOR };\nDurum durum = DURUYOR;\nunsigned long sonKomut = 0;\nchar tampon[12];\nint uzunluk = 0;\n\nint hizdanPwm(float v) {\n  if (v < 0.005) return 0;\n  if (v > V_MAX) v = V_MAX;\n  return OLU_PWM + (int)((255 - OLU_PWM) * v / V_MAX + 0.5);\n}\n\nint isaretliPwm(float v) {\n  return v >= 0 ? hizdanPwm(v) : -hizdanPwm(-v);\n}\n\nvoid motor(int en, int in1, int in2, int pwm) {\n  digitalWrite(in1, pwm > 0);\n  digitalWrite(in2, pwm < 0);\n  analogWrite(en, abs(pwm));\n}\n\nvoid tekerlekler(float vSol, float vSag) {   // m/s, eksi = geri\n  motor(SOL_EN, SOL_IN1, SOL_IN2, isaretliPwm(vSol));\n  motor(SAG_EN, SAG_IN1, SAG_IN2, isaretliPwm(vSag));\n}\n\nvoid dur() {\n  tekerlekler(0, 0);\n  durum = DURUYOR;\n  digitalWrite(DURUM_LED, LOW);\n}\n\nvoid komutIsle(char komut, int cm) {\n  float v = cm / 100.0;\n  switch (komut) {\n    case 'W': tekerlekler(v, v); break;\n    case 'S': tekerlekler(-v, -v); break;\n    case 'A': tekerlekler(-v, v); break;    // yerinde sola: w = 2v / L\n    case 'D': tekerlekler(v, -v); break;    // yerinde sağa\n    case 'X': dur(); break;\n    default:\n      Serial.println(\"?\");\n      return;                               // geçersiz komut watchdog'u yenilemez\n  }\n  sonKomut = millis();                      // geçerli komut: watchdog sıfırlanır\n  if (komut != 'X' && cm > 0) {\n    durum = SURUYOR;\n    digitalWrite(DURUM_LED, HIGH);\n  } else {\n    dur();\n  }\n}\n\nvoid satirIsle() {\n  tampon[uzunluk] = '\\0';\n  char komut = toupper(tampon[0]);\n  int cm = VARSAYILAN_CM;\n  if (uzunluk > 1) cm = constrain(atoi(tampon + 1), 0, MAKS_CM);\n  komutIsle(komut, cm);\n}\n\nvoid setup() {\n  pinMode(SOL_EN, OUTPUT); pinMode(SOL_IN1, OUTPUT); pinMode(SOL_IN2, OUTPUT);\n  pinMode(SAG_EN, OUTPUT); pinMode(SAG_IN1, OUTPUT); pinMode(SAG_IN2, OUTPUT);\n  pinMode(DURUM_LED, OUTPUT);\n  Serial.begin(9600);\n  dur();                                    // açılışta güvenli durum\n  Serial.println(\"Hazir: W S A D X + hiz (cm/s)\");\n}\n\nvoid loop() {\n  while (Serial.available() > 0) {\n    char c = Serial.read();\n    if (c == '\\n' || c == '\\r') {\n      if (uzunluk > 0) satirIsle();\n      uzunluk = 0;\n    } else if (uzunluk < (int)sizeof(tampon) - 1) {\n      tampon[uzunluk++] = c;\n    }\n  }\n\n  if (durum == SURUYOR && millis() - sonKomut >= CMD_TIMEOUT) {\n    dur();\n    Serial.println(\"Komut yok: dur\");\n  }\n}\n```\n\n### Nasıl çalışıyor?\n1. `setup()` içinde `dur()` çağrılır: robot açılışta hiçbir zaman hareket etmez. Güvenli durum **varsayılandır**, hareket ise komutla istenir.\n2. Komut ayrıştırma 79. dersteki gibidir. Fark: `hizdanPwm()` cm/s'yi PWM'e çevirir; böylece `W20` her zaman yaklaşık 20 cm/s demektir.\n3. Her geçerli komut `sonKomut`'u günceller. `loop()` içinde `millis() - sonKomut >= CMD_TIMEOUT` kontrolü, çıkarma yöntemiyle yapıldığı için `millis()` taşsa bile doğrudur (27. ders).\n4. Watchdog yalnızca SURUYOR durumunda çalışır. Zaten duruyorsa her 700 ms'de bir \"Komut yok\" yazmaz; mesaj durma anında **bir kez** yazılır.\n5. `loop()` hiç `delay` kullanmaz; komutlar ve watchdog aynı anda işler.\n\n### Ölçüm\nBenzetimde robotu (0,5 m; 2,0 m) noktasında +x yönüne bakarken bırakıp komutları 200 ms aralıkla tekrarladık.\n\n**Komut dizisi**, her adımın sonunda `X` gönderildi:\n\n| Adım | Komut | Sonuç |\n|---|---|---|\n| İleri 1 sn | `W20` | Robot 19,7 cm ilerledi, yanal sapma yok |\n| Sağa dön | `D12`, 0,8 sn | Yön −90,2° (tam sağ), konum kaymadı |\n| Geri 1 sn | `S20` | Robot bu kez −y'ye baktığı için +y yönünde 19,7 cm geri gitti |\n| Son durum | | Robot (0,70; 2,20) m noktasında, toplam yol 0,39 m |\n\nKomutlar sürerken LED yandı, `X`'ten sonra söndü. Yollar hesapla (0,20 m/s · 1 sn = 0,20 m) ve dönüş açısı hesapla (2 rad/s · 0,8 sn ≈ 92°) uyuştu.\n\n**Watchdog ölçümü:** tek bir `W20` gönderilip sessiz kalındı.\n- Sol EN pini `W20` satırının bitişinden yaklaşık 700 ms sonra (ölçülen: 698 ms) LOW'a düştü; LED aynı anda söndü.\n- Seriye `Komut yok: dur` tam bir kez yazıldı.\n- Robot bu sürede yaklaşık 14 cm yol aldı (0,2 m/s · 0,7 sn ≈ 0,14 m). Durduktan sonra hareket etmedi.\n\nYani watchdog'un bedeli: komut kesildikten sonra robot **hız · CMD_TIMEOUT** kadar yol alır. 20 cm/s ve 0,7 sn için 14 cm; 39 cm/s'de 27 cm olurdu. Daha kısa süre daha güvenli, ama ağ ya da bağlantı gecikmesi dalgalanıyorsa robot gereksiz yere durur.\n\nEk ölçümler:\n- Komutlar 200 ms aralıkla sürdürüldüğünde 2 saniye boyunca robot gitmeye devam etti ve watchdog devreye girmedi.\n- 2 saniye boyunca yalnızca geçersiz `Q` gönderildiğinde robot ilk `W20`'nin 700 ms'i dolunca durdu: geçersiz komut zamanı yenilemedi.\n- `W999` 39 cm/s'ye sınırlandı.\n\nGerçek robotta farklı olabilecekler: benzetimde seri hat gecikmesizdir. Kablosuz bağlantıda komutlar geç gelebilir, `CMD_TIMEOUT`'u bu gecikmeden büyük, ama durma mesafesinin makul kalacağı kadar küçük seçmelisin. Robotun gerçek durma mesafesi yüzeye ve yüke göre değişir; ölçmeden güvenli saymamalısın.\n\n### Dene\n- `CMD_TIMEOUT`'u 300 ms yap ve komutu 400 ms aralıkla tekrarla. Robot ne yapıyor? Neden?\n- 39 cm/s ile ileri gönderip sessiz kal. Durma mesafesini ölç ve formülle karşılaştır.\n- Yeni bir komut ekle: `B` komutu \"yavaş kavis\": sol 8 cm/s, sağ 16 cm/s. Hesapla: v, ω ve dönme yarıçapı kaç olur? (76. dersteki formüller.)\n- Watchdog durdurduktan sonra robotun yeniden hareket edebilmesi için ne gerekir? Şu an yeni bir W komutu yeter. Daha güvenli bir tasarım (örneğin önce `X` istemek) olur mu?\n\n### Sık yapılan hatalar\n- Kumandanın komutu tekrar etmediğini unutmak: tek `W` gönderip robotun neden 0,7 sn sonra durduğunu merak etmek.\n- Watchdog süresini komut tekrar aralığından kısa seçmek: robot sürekli durup kalkar.\n- Geçersiz komutun da watchdog süresini yenilemesine izin vermek.\n- `CMD_TIMEOUT` kontrolünü `delay` ile yapmak: bu, komutları okumayı engeller.\n- Motorları durdururken yalnızca `EN`'i sıfırlamak ama LED ve durum bilgisini güncellememek. `dur()` bütün bunları tek yerden yapar.\n- Güvenli durumu açılışta unutmak: robot açılır açılmaz kontrolsüz döner.",
          "question": "`CMD_TIMEOUT` 0,7 sn yerine 5 sn olsaydı ne olurdu? 0,05 sn olsaydı? Hyvex'teki gibi kontrol kopunca durmak her sistem için doğru mudur, yoksa \"olduğu yerde kalmak\" daha tehlikeli olabilecek bir sistem düşünebilir misin?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Haftanın bilgilerini (v-ω, sürücü, kalibrasyon, komutlar) tek robotta birleştirmeyi\n- Komut watchdog'unu: komutlar kesilirse robotun kendiliğinden durmasını\n- İki duruma sahip bir durum makinesini (DURUYOR, SURUYOR) kurmayı\n- Watchdog süresini seçmenin bedelini hesaplamayı\n\n### Önceden bilmen gerekenler\nBu haftanın dört dersi (76-79): v ve ω, sürücü pinleri, hizdanPwm kalibrasyonu ve seri komut ayrıştırıcı. Modül 3'ten millis() (27. ders) ve enum ile durum makineleri (28. ders).\n\n### Güvenli durum varsayılandır\nUzaktan kumandalı bir robotta en kötü an, kontrolün sessizce kopmasıdır. Güvenli bir robot hareketi \"komut geldikçe\" yapar, komut kesilince durur. Bu fikre **watchdog** (bekçi köpeği) denir. Watchdog bir süre sayar; belli bir süre içinde geçerli komut gelmezse robotu durdurur. Projede süre `CMD_TIMEOUT = 700 ms`'dir.\n\n### İki durumlu makine\n| Durum | Motorlar | LED | Çıkış |\n|---|---|---|---|\n| DURUYOR | durur | söner | geçerli hareket komutu gelirse SURUYOR |\n| SURUYOR | son komuta göre | yanar | `X` gelirse ya da 700 ms komut gelmezse DURUYOR |\n\nÖnemli kurallar: robot açılışta DURUYOR durumundadır (hareket, komutla istenir). Her **geçerli** komut zamanı sıfırlar. **Geçersiz** komut sıfırlamaz; aksi halde rastgele gürültü robotu sonsuza kadar sürdürebilirdi.\n\n### Zaman kontrolü\nKontrol `millis() - sonKomut >= CMD_TIMEOUT` biçiminde yapılır. Çıkarma yöntemi, `millis()` sayacı taşsa bile doğru sonuç verir (27. ders). Kontrol `loop()` içinde `delay` olmadan yapılır; yoksa komut okuma engellenirdi.\n\n### Bedeli hesapla\nKomut kesildikten sonra robot bir süre daha yol alır:\n\n```\nyol = hız × CMD_TIMEOUT\n```\n\n20 cm/s ve 0,7 sn için 14 cm; 39 cm/s için yaklaşık 27 cm. Kısa süre daha güvenlidir ama bağlantı gecikmesi dalgalanıyorsa robot gereksiz yere durur. Gönderen taraf komutu watchdog süresinden daha sık tekrarlamalıdır; projede her 200 ms. Süre tekrar aralığından kısa olursa robot sürekli durup kalkar.\n\n### Komut dili ve dönüş\nHız artık cm/s cinsindendir ve `hizdanPwm` (78. ders) bunu PWM'e çevirir. Yerinde dönüşte her tekerlek v hızıyla zıt döner: ω = 2·v / L. 12 cm/s için ω = 2 rad/s, yani saniyede yaklaşık 115°.\n\n### Özet\nKomutlu araba, bu haftanın tüm parçalarını birleştirir ve üstüne güvenlik katmanı ekler: komut gelmezse robot kendiliğinden durur. Watchdog, geçerli komutların zamanını izleyen basit bir durum makinesidir. Süre seçimi bir takastır: kısa süre güvenli ama hassas, uzun süre toleranslı ama tehlikeli. Durma mesafesini her zaman ölçerek doğrula.",
          "concepts": [
            {
              "term": "Watchdog (komut zaman aşımı)",
              "definition": "Belli bir süre geçerli komut gelmezse robotu otomatik durduran güvenlik mekanizması. Projede CMD_TIMEOUT = 700 ms.",
              "example": "Tek bir W20'den 700 ms sonra robot durur ve LED söner.",
              "pitfall": "Bunu tek güvenlik önlemi saymak; masa kenarında kontrolsüz bırakmak yine tehlikelidir."
            },
            {
              "term": "Güvenli durum",
              "definition": "Sistemin açılışta ve hata anında bulunacağı varsayılan durum; robot için duruş.",
              "example": "setup() içinde dur() çağrılır; robot açılır açılmaz hareket etmez.",
              "pitfall": "Güvenli durumu unutmak: robot açılır açılmaz kontrolsüz döner."
            },
            {
              "term": "İki durumlu makine",
              "definition": "DURUYOR ve SURUYOR durumlarını ve aralarındaki geçişleri (komut, X, zaman aşımı) tanımlayan basit durum makinesi.",
              "example": "Geçerli W20 gelince SURUYOR, 700 ms komut gelmeyince DURUYOR olur.",
              "pitfall": "Durumu değiştirip LED ve motorları ayrı yerlerde güncellemek; dur() hepsini tek yerden yapmalıdır."
            },
            {
              "term": "Watchdog süresinin bedeli",
              "definition": "Komut kesildikten sonra robotun alacağı yol: hız × CMD_TIMEOUT.",
              "example": "20 cm/s ve 0,7 s için 14 cm; 39 cm/s için yaklaşık 27 cm.",
              "pitfall": "Süreyi hesaplamadan seçmek; çok uzun süre tehlikeli, çok kısa süre robotu sürekli durdurur."
            },
            {
              "term": "Geçerli komut ve geçersiz komut",
              "definition": "Yalnız tanınan komutlar zamanı yeniler; tanınmayan komut (Q gibi) yenilemez.",
              "example": "2 saniye boyunca yalnız Q gönderilirse robot ilk W20'den 700 ms sonra durur.",
              "pitfall": "Geçersiz komutun da zamanı yenilemesine izin vermek; gürültü robotu sonsuza kadar sürdürebilir."
            }
          ],
          "quiz": [
            {
              "id": "m5h1d80-q1",
              "kind": "numeric",
              "prompt": "Watchdog süresi 700 ms. Robot 30 cm/s ile giderken komutlar tamamen kesiliyor. Robot durmadan önce yaklaşık kaç cm yol alır? (Motor gecikmesini ve frenlemeyi yok say.)",
              "answer": 21,
              "tolerance": 0.5,
              "unit": "cm",
              "explanation": "yol = hız × süre = 30 cm/s × 0,7 s = 21 cm. Süreyi milisaniye olarak (700) çarpmak 21000 verirdi; saniyeye çevirmek gerekir. Gerçek robotta durma mesafesi yüzeye ve yüke göre değişir; ölçmeden güvenli sayma.",
              "skills": [
                "prog-timing"
              ]
            },
            {
              "id": "m5h1d80-q2",
              "kind": "find-bug",
              "prompt": "Robot, geçersiz komutlar (Q) gelirken de durmuyor; watchdog hiç devreye girmiyor. Hata hangisi?\n\n```\nswitch (komut) {\n  case 'W': tekerlekler(v, v); break;\n  case 'X': dur(); break;\n  default:\n    Serial.println(\"?\");\n    break;\n}\nsonKomut = millis();\n```",
              "options": [
                "'W' satırı yanlış",
                "default bölümünde return yerine break var; geçersiz komut da sonKomut'u yeniliyor",
                "Serial.println çok yavaş",
                "millis() yerine delay kullanılmalı"
              ],
              "answer": 1,
              "explanation": "default içinde return kullanılırsa fonksiyon sonKomut atamasına ulaşmadan biter. break ise akışı switch'in dışına, sonKomut = millis() satırına götürür; gürültü watchdog'u sonsuza kadar yeniler.",
              "skills": [
                "prog-debug",
                "prog-structure"
              ]
            },
            {
              "id": "m5h1d80-q3",
              "kind": "mcq",
              "prompt": "Kumanda komutu her 200 ms'de bir tekrarlıyor ve CMD_TIMEOUT = 50 ms seçildi. Robot ne yapar?",
              "options": [
                "Düzgün ilerler",
                "Hiç hareket etmez",
                "Her komuttan sonra 50 ms'de durup yeni komutla tekrar kalkar; sürekli durup kalkar",
                "Daha hızlı gider"
              ],
              "answer": 2,
              "explanation": "Komutlar arası 200 ms olduğu için sonraki komut gelmeden 50 ms dolar ve watchdog robotu durdurur. Süre, komut tekrar aralığından uzun olmalıdır (projede 700 ms > 200 ms). Hiç hareket etmez demek yanlıştır; her komut kısa bir hareket başlatır.",
              "skills": [
                "prog-timing",
                "prog-planning"
              ]
            },
            {
              "id": "m5h1d80-q4",
              "kind": "numeric",
              "prompt": "Yerinde sağa dönüş komutunda her tekerlek 16 cm/s hızla zıt dönüyor, L = 0,12 m. Robot 180° dönmek için yaklaşık kaç saniye gerekir?",
              "answer": 1.18,
              "tolerance": 0.03,
              "unit": "s",
              "explanation": "ω = 2·v / L = 2 · 0,16 / 0,12 yaklaşık 2,67 rad/s. 180° = π rad olduğundan süre = π / 2,67 yaklaşık 1,18 s. Hızı cm/s bırakıp metreye çevirmeyi unutmak sonucu yüz kat bozar.",
              "skills": [
                "prog-timing"
              ]
            },
            {
              "id": "m5h1d80-q5",
              "kind": "mcq",
              "prompt": "Watchdog süresini 700 ms'den 5 saniyeye çıkarmanın sonucu hangisidir?",
              "options": [
                "Bağlantı kopunca robot 5 saniye boyunca kontrolsüz yol alır; durma mesafesi büyür",
                "Robot daha güvenli olur, çünkü daha uzun bekler",
                "Robot hiç durmaz",
                "Komutları tekrar etmek gerekmez ve bir risk doğmaz"
              ],
              "answer": 0,
              "explanation": "Durma mesafesi hız × süredir; süre yedi katı olunca mesafe de yedi katı olur (20 cm/s'de 14 cm yerine 100 cm). Uzun süre yalnızca gecikmeye toleransı artırır, güvenliği azaltır.",
              "skills": [
                "prog-planning"
              ]
            }
          ]
        }
      ]
    },
    {
      "title": "Engel",
      "project": "Engelden kaçan robot",
      "guideMd": "### Hafta hedefleri\nBu haftanın sonunda öğrenci:\n1. Tampon anahtarını `INPUT_PULLUP` ile okuyabilir, sol/sağ/ön çarpmayı ayırıp engelin tersine dönen bir tepki yazabilir.\n2. HC-SR04 yankı süresini mesafeye çevirebilir (süre / 58) ve medyan filtrenin neden gerektiğini açıklayabilir.\n3. Dur eşiğini seçerken sensör konumunu ve fren payını hesaba katabilir.\n4. Servoyla birkaç yönü tarayıp en uzak yönü bulabilir ve açıyı dönüş süresine çevirebilir.\n5. Beş durumlu (ILERI, DUR, TARA, DON, GERI) `millis()` tabanlı bir durum makinesi okuyup yazabilir.\n6. Robotun başarısını yol ve çarpma sayısı gibi ölçülebilir ölçütlerle değerlendirebilir.\n\n### Haftanın planı\nHafta beş derstir; her ders yaklaşık 20-35 dakikadır. Plan günde bir ders içindir. 84. ders en yoğun olanıdır; gerekirse iki güne böl.\n\n| Gün | Ders | Süre | Ne yapılır |\n|---|---|---|---|\n| 1 | Tampon (dokunma) sensörleriyle tepki | ~20 dk | Anlatımı oku, tamponları izle, çarp-geri çekil-dön programını çalıştır, `GERI_MS` ve `DONUS_MS` ile oyna, mini testi çöz. |\n| 2 | Mesafe sensörüyle dur ve dön | ~25 dk | Ham ve medyan değerleri karşılaştır, tek ölçümlü ve medyanlı robotun durma noktalarını dene, `ESIK_CM` ve `N` değerlerini değiştir. |\n| 3 | Servo taramasıyla en açık yolu bul | ~25 dk | Açı tablosunu çiz, taramayı çalıştır, seçilen açıyı yorumla, adımı 15°'ye indir. |\n| 4 | Engelden kaçma durum makinesi | ~30 dk | Durum tablosunu kendi cümlelerinle çiz, seri monitörden `DURUM` satırlarını izle, `ACIK_CM` değerini değiştir. |\n| 5 | Proje: Otonom engelden kaçan robot | ~35 dk | Programı çalıştır, yol ve çarpma sayısını ölç, `x` ve `g` komutlarını dene, ölçütle değerlendir. |\n\n### Ön koşul kontrolü\nBu hafta Hafta 1 (76-80. dersler) ve Modül 3-4'ün bazı bilgileri gerekir. Başlamadan önce:\n- `surus(sol, sag)` ile iki motoru birlikte sürebiliyor mu? (Modül 5, Hafta 1)\n- `INPUT_PULLUP` ile buton okuyup \"basılı = LOW\" mantığını biliyor mu? (Modül 3, ders 6)\n- `millis()` ile `delay` kullanmadan süre ölçebiliyor mu? (Modül 3, ders 27)\n- `enum` ve `switch` ile durum makinesi okuyabiliyor mu? (Modül 3, ders 28)\n- HC-SR04 ile `pulseIn` kullanımı ve medyan filtre tanıdık mı? (Modül 4, ders 38)\n- `Servo` kütüphanesi ile açı verebiliyor mu? (Modül 3, ders 21)\n\nEksik varsa ilgili dersin anlatımına dönülür.\n\n### Kavram haritası\n- **Algılama:** tampon (temas) → ultrasonik (uzaklık) → servoyla tarama (yön) → ölçüm gürültüsü → medyan filtre\n- **Karar:** eşik → fren payı → en uzak yön → açıdan dönüş süresine\n- **Yapı:** durumlar → geçiş koşulları → `millis()` ile süre → `gec()` → yedek koruma (tampon, sıkışma)\n- **Ölçme:** yol → çarpma sayısı (kenar algılama) → eşiği ölçümden türetme → acil durdurma\n\n### Sık yapılan hatalar\n- **Basılı tamponu HIGH sanmak.** `INPUT_PULLUP` ile basılı = LOW.\n- **Dönüş yönünü ters seçmek.** Sol tampon basıldıysa engel soldadır; robot sağa döner.\n- **Yankı gelmeyince 0 sonucunu mesafe sanmak.** 0 \"duvar dibindeyim\" değil, \"yankı yok\" demektir.\n- **Tek ölçüme güvenmek.** Medyan filtre aykırı ölçümü eler.\n- **Eşiği robotun merkezine göre düşünmek.** Sensör robotun önündedir ve robot durmak için de yol alır.\n- **Servoya `write` dedikten hemen sonra ölçmek.** Servo yoldadır; ölçüm iki yönün karışımı olur.\n- **Sol ile sağı karıştırmak.** 90° ileri, büyük açı sol.\n- **Durumu `durum = ...` ile atamak.** `durumBasi` güncellenmez; `gec()` kullan.\n- **Durum bloklarına `delay` koymak.** Robot beklerken tamponları göremez.\n- **Çarpmayı bayrak doğru olduğu sürece saymak.** Kenar say: bayrağın doğru olmaya başladığı anı.\n\n### Hafta sonu tekrarı\n1. Her dersin kavram kartlarına bir kez daha bak ve \"sık yapılan yanlış\" satırlarını yüksek sesle oku.\n2. Mini testlerde yanlış yaptığın soruların açıklamalarını yeniden oku, sonra soruyu yeniden çöz.\n3. Beş durumlu tabloyu (durum, ne yapar, çıkış koşulu, sonraki) bakmadan kâğıda çiz.\n4. `ESIK_CM` değerini 15 ve 40 yap; durma noktasının ve çarpma sayısının nasıl değiştiğini kısa bir cümleyle yaz.\n5. Kendi cümlelerinle şu soruyu cevapla: \"Robot işe yarıyor demek için hangi iki sayıyı sorarım ve neden ikisi de gerekli?\"\n\nHafta sonu testi olarak beş dersin mini testleri yeterlidir; her derste 5 soru, toplam 25 soru. Hedef: her dersten en az 4 doğru. Eksik kalan dersin anlatımına dön.\n\n### Proje değerlendirme ölçütü (Otonom engelden kaçan robot)\nÖlçüm arenası: 2 × 2 m, içinde üç engel; 30-35 saniyelik koşu; ölçüm gürültüsü 2 cm.\n\n| Ölçüt | Gelişmeli | Yeterli | İleri |\n|---|---|---|---|\n| Devre ve güvenlik | Ortak GND yok ya da motorlar Arduino 5 V'undan besleniyor | Ayrı pil, ortak GND, tamponlar ve sensör doğru pinlerde | Bağlantıyı pin tablosuyla anlatıyor ve acil durdurmayı güvenlik önlemi olarak açıklıyor |\n| Davranış | Duvara sürekli çarpıyor ya da hiç ilerlemiyor | 30-35 sn'de en az 3 m yol, en fazla 3 çarpma | Eşik ve hızı değiştirip sonucu ölçüyor, tabloya yazıyor |\n| Durum makinesi | `delay` içeriyor ya da durumlar karışık | Beş durum, `gec()` ile geçiş, `delay` yok | Yeni bir durum (örneğin BEKLE) ekleyip tabloyu güncelliyor |\n| Ölçme | Sayı vermiyor | Yol ve çarpma sayısını ölçüyor, çarpmayı kenar sayıyor | Eşiği ölçümden türetiyor ve \"bu sayı yalnız bizim arenaya mı uyuyor?\" sorusunu cevaplıyor |\n| Anlatım | Ne yaptığını anlatamıyor | Durum tablosunu ve her geçişi anlatıyor | Hata yapıp nasıl bulduğunu (örneğin `durum` atama hatası) anlatıyor |\n\n### Veli ve öğretmen notu\n- **Amaç.** Bu hafta robotun nasıl \"karar verdiği\"ni görünür kılmaktır: sensör, eşik, durum. Çalışmayan bir robot hata değil, ölçülecek bir veridir.\n- **Nasıl destek olunur?** Cevabı söylemek yerine şunları sor: \"Robot şu an hangi durumda?\", \"Seri monitör ne yazıyor?\", \"Sensör ne ölçüyor, sen ne bekliyordun?\"\n- **Süre.** 84. ders yoğundur; iki güne bölmek kalıcılığı artırır.\n- **Güvenlik.** Bu platformdaki her şey sanaldır. Gerçek robota geçilirse: ilk denemede robotu kaldırıp tekerlekleri havadayken çalıştırın; motorlar ve servo ayrı pille beslenir ve GND ortak yapılır; piller kısa devre yapılmaz ve ters bağlanmaz; şebeke gerilimiyle (220 V) hiçbir devre kurulmaz. `x` komutunu bir \"acil durdur\" gibi düşünün.\n- **Gerçek robotla fark.** Derslerdeki ölçümler benzetim sonuçlarıdır. Gerçek sensörler, tamponlar ve motorlar farklı davranır; süreleri ve eşikleri kendi robotunuzda yeniden ölçün.\n- **İlerleme.** Mini test sonuçları \"İlerlemem\" sayfasında beceri bazında görünür (taslak/pilot özellik; yalnız onay verildiyse kaydedilir).",
      "lessons": [
        {
          "title": "Tampon (dokunma) sensörleriyle tepki",
          "durationMin": 20,
          "problem": "Evdeki süpürge robotu sandalyeye çarpınca durur, biraz geri gelir ve başka yöne döner. Gözü yok, kamerası yok. Önündeki tampon içinde küçük bir anahtar var: tampon sıkışınca anahtar kapanır. Bu derste robotuna aynı refleksi vereceksin: çarp, geri çekil, dön. Üstelik hangi tamponun bastığına bakıp engelin tersine döneceksin.",
          "contentMd": "### Devre\nBu hafta robotun standart bağlantılarını kullanıyoruz (76-80. derslerdeki sürücü bağlantısı aynen geçerli).\n\n| Parça | Bağlantı |\n|---|---|\n| Sol tampon anahtarı | **D2** ile GND arası (`INPUT_PULLUP`) |\n| Sağ tampon anahtarı | **D3** ile GND arası (`INPUT_PULLUP`) |\n| Sol motor | EN → **D5** (PWM), IN1 → **D7**, IN2 → **D8** |\n| Sağ motor | EN → **D6** (PWM), IN3 → **D9**, IN4 → **D10** |\n\n**Güç uyarısı:** Motorları Arduino'nun 5 V pininden besleme. Motor sürücüsüne ayrı bir pil bağla ve pilin eksisini Arduino GND'sine de bağla (ortak GND). Pilleri kısa devre yapma, ters bağlama.\n\nD2 ve D3 enkoder pinleridir. 91. derste enkoder gelince bu pinler enkoder için kullanılacak; tamponlar ile enkoder aynı anda bağlanmaz.\n\nTampon anahtarı robotun ön sol ve ön sağ köşesindedir. Sol tampon basılıysa engel robotun solundadır; sağ tampon basılıysa sağındadır. İkisi birden basılıysa engel tam karşıdadır.\n\n### Program\n**Önce tamponu okuyalım.** Tampon bir butondan farksızdır (6. ders): `INPUT_PULLUP` ile bağlanır ve **basılıyken LOW** okunur. Önce yalnızca tamponları izleyelim. 8. dersteki kenar algılamayla her basışı bir kez yazdıralım.\n\n```cpp\n// sketch: tampon_oku\nconst int TAMPON_SOL = 2;\nconst int TAMPON_SAG = 3;\n\nbool oncekiSol = false;\nbool oncekiSag = false;\n\nvoid setup() {\n  pinMode(TAMPON_SOL, INPUT_PULLUP);\n  pinMode(TAMPON_SAG, INPUT_PULLUP);\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  bool sol = (digitalRead(TAMPON_SOL) == LOW);   // basılı = LOW\n  bool sag = (digitalRead(TAMPON_SAG) == LOW);\n\n  if (sol != oncekiSol) {\n    Serial.println(sol ? \"Sol tampon: BASILDI\" : \"Sol tampon: BIRAKILDI\");\n    oncekiSol = sol;\n  }\n  if (sag != oncekiSag) {\n    Serial.println(sag ? \"Sag tampon: BASILDI\" : \"Sag tampon: BIRAKILDI\");\n    oncekiSag = sag;\n  }\n}\n```\n\n**Şimdi çarp, geri çekil, dön.** Motorları ekleyelim. Robot normalde düz ilerler. Bir tampon basılınca sırayla: dur, geri çekil, engelin tersine dön, tekrar ilerle.\n\n```cpp\n// sketch: tampon_kacis\nconst int SOL_EN = 5;\nconst int SOL_IN1 = 7;\nconst int SOL_IN2 = 8;\nconst int SAG_EN = 6;\nconst int SAG_IN3 = 9;\nconst int SAG_IN4 = 10;\nconst int TAMPON_SOL = 2;\nconst int TAMPON_SAG = 3;\n\nconst int HIZ = 160;                 // PWM; ölü bölgenin (~%20) üstünde\nconst int GERI_MS = 400;\nconst int DONUS_MS = 450;\n\n// Tek motor: pwm > 0 ileri, < 0 geri, 0 dur (77. ders)\nvoid motor(int en, int a, int b, int pwm) {\n  digitalWrite(a, pwm > 0);\n  digitalWrite(b, pwm < 0);\n  analogWrite(en, abs(pwm));\n}\n\n// İki motoru birden sür: sol ve sag -255...255\nvoid surus(int sol, int sag) {\n  motor(SOL_EN, SOL_IN1, SOL_IN2, sol);\n  motor(SAG_EN, SAG_IN3, SAG_IN4, sag);\n}\n\nvoid setup() {\n  pinMode(SOL_IN1, OUTPUT); pinMode(SOL_IN2, OUTPUT);\n  pinMode(SAG_IN3, OUTPUT); pinMode(SAG_IN4, OUTPUT);\n  pinMode(TAMPON_SOL, INPUT_PULLUP);\n  pinMode(TAMPON_SAG, INPUT_PULLUP);\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  bool sol = (digitalRead(TAMPON_SOL) == LOW);   // basılı = LOW\n  bool sag = (digitalRead(TAMPON_SAG) == LOW);\n\n  if (!sol && !sag) {                  // temas yok: düz ilerle\n    surus(HIZ, HIZ);\n    return;\n  }\n\n  surus(0, 0);                         // 1) dur\n  Serial.println(sol && sag ? \"CARPMA ON\" : sol ? \"CARPMA SOL\" : \"CARPMA SAG\");\n\n  surus(-HIZ, -HIZ);                   // 2) geri çekil\n  delay(GERI_MS);\n\n  if (sol) surus(HIZ, -HIZ);           // 3) engelin tersine dön:\n  else surus(-HIZ, HIZ);               //    sol bastıysa sağa, değilse sola\n  delay(DONUS_MS);\n\n  surus(0, 0);\n}\n```\n\n### Nasıl çalışıyor?\n1. `surus(sol, sag)` iki motoru birden sürer (77. ders). Pozitif ileri, negatif geri demektir. `HIZ = 160` PWM değeri motorların ölü bölgesinin (ilk %20) üstündedir (78. ders).\n2. Temas yoksa `loop()` her turda `surus(HIZ, HIZ)` der ve geri döner.\n3. Tampon basılınca motorlar durur, mesaj yazılır, robot `GERI_MS` kadar geri gider, sonra `DONUS_MS` kadar yerinde döner.\n4. Dönüş yönü tampona bağlıdır. Sol tampon basıldıysa engel soldadır, robot **sağa** döner: `surus(HIZ, -HIZ)` ile sol tekerlek ileri, sağ tekerlek geri gider. Kod `if (sol)` diye sorar. Cepheden çarpınca sol tampon da basılıdır, bu yüzden ikisi birden basılınca da robot sağa döner. Yalnız sağ tampon basılıysa sola döner.\n5. Döngü bitince `loop()` yeniden başlar ve robot tekrar ilerler.\n\n**Ölçtüklerimiz (benzetim, 2 × 2 m boş arena):**\n- Robot duvara hafif sola yatık yaklaşınca önce sol tampon bastı (`CARPMA SOL`), sağa yatık yaklaşınca sağ tampon (`CARPMA SAG`), tam dik yaklaşınca ikisi birden (`CARPMA ON`).\n- Tampon basıldığında robotun merkezi duvara yaklaşık 10 cm uzaktaydı. Robotun yarıçapı 7,5 cm olduğundan duvara gömülmeden durdu. Motor gecikmesi yüzünden dur komutundan sonra bile 1-2 cm kayar; bu pay ölçümde yetti.\n- 400 ms geri gitmek robotu yaklaşık 5,5 cm geri götürdü. Robot yaklaşık 0,2 m/s ile gidiyor; ama motorlar hızı bir anda değiştirmez (motor gecikmesi), bu yüzden 0,2 m/s × 0,4 s = 8 cm değil, daha az.\n- 450 ms'lik dönüş robotu yaklaşık 90° çevirdi. Sol tamponda sağa (−90°), sağ tamponda sola (+90°).\n- Boş arenada 15 saniye bırakınca robot yaklaşık 3 metre yol aldı, 2 kez tamponla kaçtı, hiç duvara gömülmedi.\n\n### Dene\n- `GERI_MS` değerini 400'den 800'e çıkar. Robot ne kadar geri gidiyor? Dönüş sırasında duvara yaklaşıyor mu?\n- `DONUS_MS` değerini 225 yap. Dönüş açısı kaça düşüyor? Dönüş süresi ile açı arasında nasıl bir ilişki var?\n- Tamponların pinlerini birbirinin yerine yaz (`TAMPON_SOL` ↔ `TAMPON_SAG`). Robot engele doğru mu dönüyor, engelden uzağa mı?\n\n### Sık yapılan hatalar\n- `INPUT_PULLUP` yazmamak: pin havada kalır, tampon basılı olmasa da rastgele okunur.\n- Basılı tamponu HIGH sanmak: `INPUT_PULLUP` ile basılı = LOW.\n- Dönüş yönünü ters seçmek: robot engele doğru dönüp tekrar çarpar.\n- Geri çekilmeyi atlayıp doğrudan dönmek: robot hâlâ engele yapışıkken dönerken sürtünür.\n- `delay` bekleyen robot o sırada hiçbir şeye bakamaz. Bu derste sorun değil ama 84. derste `millis()` ile değiştireceğiz.\n\n### Gerçek robotta farklı olabilecekler\n- Gerçek tampon anahtarları basılırken ve bırakılırken sıçrar (8. dersteki debounce). Basışı sayarken ya da yön seçerken bu yüzden birkaç milisaniye bekle.\n- Tamponlar yalnızca robotun önündeki dar bölgeyi korur. Yandan ya da bir köşeyle sürtünen robot tampona basmayabilir.\n- Gerçek robotta hız, tekerlek tutunması ve zemin farklıdır; geri çekilme ve dönüş sürelerini kendi robotunda yeniden ölç.\n- Alçak ya da yumuşak engeller (halı kenarı, kablo) tamponu hiç basmayabilir.",
          "question": "Tampon \"dokunarak\" algılar, yani engele çarptıktan sonra haberi alırsın. Bu ne zaman sorun olur? Çarpmadan önce haber veren bir sensöre neden ihtiyaç duyarız?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Tampon (dokunma) sensörünün aslında bir buton olduğunu\n- `INPUT_PULLUP` ile \"basılı = LOW\" mantığını robot tamponuna uygulamayı\n- Sol, sağ ve ön çarpmayı birbirinden ayırıp engelin tersine dönmeyi\n- Çarpınca \"dur, geri çekil, dön\" sırasının neden böyle olduğunu\n- Tamponun en büyük sınırını: engele ancak çarptıktan sonra haber verir\n\n### Önceden bilmen gerekenler\n- 6. ders: `digitalRead`, buton, `INPUT_PULLUP`\n- 7. ders: `if/else` ve `bool` değişkenler\n- 8. ders: kenar algılama ve buton sıçraması\n- 76-78. dersler: iki motoru birden süren `surus(sol, sag)` işlevi ve ölü bölge\n\n### Tampon bir butondur\nRobotun ön köşesine iki küçük anahtar yerleştirilir. Tampon engele değince anahtar kapanır. Bu, 6. dersteki butondan farksızdır: bir ucu pine, öbür ucu GND'ye bağlanır ve pin `INPUT_PULLUP` yapılır.\n\n| Tampon durumu | Pinin okuduğu | Programdaki `bool` |\n|---|---|---|\n| Serbest | HIGH | `false` |\n| Basılı (engele değdi) | LOW | `true` |\n\nOkuma şöyle yazılır: `bool sol = (digitalRead(2) == LOW);`. Burada `== LOW` \"basılı mı?\" sorusudur. Bu sorunun cevabını bir kez `bool` değişkene çevirirsen kodun geri kalanı \"basılı\" kelimesiyle okunur.\n\n### Hangi tampon, hangi yön\nRobotu yukarıdan düşün:\n\n```\n       ön\n  [SOL]----[SAĞ]\n     |      |\n     +robot-+\n```\n\n| Sol | Sağ | Anlamı | Programın seçtiği dönüş |\n|---|---|---|---|\n| basılı | serbest | Engel solda | Sağa |\n| serbest | basılı | Engel sağda | Sola |\n| basılı | basılı | Tam karşıda | Sağa (sol basılı olduğu için) |\n\nKural basit: engelin tersine dön. Dersteki kod yalnızca `if (sol)` diye sorar; ön çarpmada da sol basılı olduğundan sağa döner.\n\n### Üç adım: dur, geri çekil, dön\n1. **Dur:** `surus(0, 0)`. Motor gecikmesi (80 ms) yüzünden robot yine de 1-2 cm kayar.\n2. **Geri çekil:** Dersteki robot 400 ms geri gider. Benzetimde bu yaklaşık 5,5 cm yol eder. Hesapla bulacağın 0,2 m/s × 0,4 s = 8 cm'den azdır, çünkü motorlar hızı bir anda değiştirmez.\n3. **Dön:** 450 ms yerinde dönüş yaklaşık 90° eder.\n\nGeri çekilmeyi atlarsan robot engele yapışıkken döner ve sürtünür. Sırayı bozma.\n\n### Tamponun sınırı\nTampon engeli ancak değince fark eder. Benzetimde tampon basıldığında robotun merkezi duvardan yaklaşık 10 cm uzaktadır. Robotun yarıçapı 7,5 cm olduğundan geriye 2,5 cm pay kalır; kayma bu payın bir kısmını yer. Gerçek robotta tamponlar sıçrar (8. ders), yalnızca ön köşeyi korur, alçak ya da yumuşak engellere basmayabilir. Çarpmadan önce haber veren sensör (82. ders) bu yüzden gerekir.\n\n### Özet\nTampon, robotun burnundaki bir butondur ve `INPUT_PULLUP` ile basılı olduğunda LOW okunur. Hangi tamponun bastığı engelin yönünü söyler; robot engelin tersine döner. Çarpma tepkisi dur, geri çekil, dön sırasıyla gider. Tampon yalnızca çarptıktan sonra haber verdiği için yedek koruma olarak iyidir, tek başına yeterli değildir.",
          "concepts": [
            {
              "term": "Tampon anahtarı",
              "definition": "Robotun ön köşesinde, engele değince kapanan küçük anahtar. Programa göre bir butondan farkı yoktur.",
              "example": "Sol tampon D2 ile GND arasına, sağ tampon D3 ile GND arasına bağlanır.",
              "pitfall": "Tamponu özel bir sensör sanıp okumayı karmaşıklaştırmak; digitalRead yeterlidir."
            },
            {
              "term": "Basılı = LOW",
              "definition": "INPUT_PULLUP kullanılan tamponda serbest pin HIGH, basılı pin LOW okur.",
              "example": "bool sol = (digitalRead(2) == LOW); ifadesi sol tampon basılıysa true olur.",
              "pitfall": "Basılı durumu == HIGH ile sormak: robot tampona hiç değmeden çarpmış gibi davranır."
            },
            {
              "term": "Engelin tersine dönüş",
              "definition": "Sol tampon basıldıysa engel soldadır ve robot sağa döner; sağ tampon basıldıysa sola döner.",
              "example": "Sol tamponda surus(HIZ, -HIZ): sol tekerlek ileri, sağ tekerlek geri, robot sağa döner.",
              "pitfall": "Dönüş yönünü ters seçmek: robot engelin üstüne dönüp tekrar çarpar."
            },
            {
              "term": "Geri çekilme",
              "definition": "Dönmeden önce robotun kısa süre geri gitmesi; engelle arasında boşluk açar.",
              "example": "400 ms geri gitmek benzetimde yaklaşık 5,5 cm yol ettirir.",
              "pitfall": "Geri çekilmeyi atlayıp engele yapışıkken dönmek; robot sürtünür."
            },
            {
              "term": "Dokunarak algılama",
              "definition": "Tampon, engele ancak değdikten sonra haber veren bir sensördür.",
              "example": "Tampon basıldığında robotun merkezi duvardan yaklaşık 10 cm uzaktadır ve dur komutundan sonra 1-2 cm kayar.",
              "pitfall": "Tamponun her engeli yakalayacağını sanmak; yumuşak, alçak ya da yandan gelen engellere basmayabilir."
            }
          ],
          "quiz": [
            {
              "id": "m5h2d1-q1",
              "kind": "mcq",
              "prompt": "Tampon anahtarı D2 ile GND arasına bağlı ve pin INPUT_PULLUP. Tampon serbestken digitalRead(2) ne döndürür?",
              "options": [
                "LOW",
                "0 ile 1023 arasında bir sayı",
                "HIGH",
                "Rastgele bir değer"
              ],
              "answer": 2,
              "explanation": "INPUT_PULLUP pini dahili dirençle HIGH'a çeker. Anahtar kapanınca pin GND'ye bağlanır ve LOW okunur. Yani serbest tampon HIGH verir. Analog aralık (0-1023) analogRead içindir, digitalRead yalnızca HIGH ya da LOW verir.",
              "skills": [
                "rob-bumper"
              ]
            },
            {
              "id": "m5h2d1-q2",
              "kind": "predict-output",
              "prompt": "Sol tampon (D2) serbest, sağ tampon (D3) GND'ye değiyor (basılı). Bu kod ne yazar?\n\n```\npinMode(2, INPUT_PULLUP);\npinMode(3, INPUT_PULLUP);\nbool sol = (digitalRead(2) == LOW);\nbool sag = (digitalRead(3) == LOW);\nSerial.println(sol && sag ? \"CARPMA ON\" : sol ? \"CARPMA SOL\" : \"CARPMA SAG\");\n```",
              "options": [
                "CARPMA ON",
                "CARPMA SOL",
                "Hiçbir şey yazmaz",
                "CARPMA SAG"
              ],
              "answer": 3,
              "explanation": "Sağ tampon basılı olduğu için digitalRead(3) LOW okur ve sag true olur. Sol serbest olduğundan HIGH okunur ve sol false olur. İlk koşul (ikisi birden) sağlanmaz, ikincisi (yalnız sol) sağlanmaz; geriye CARPMA SAG kalır. CARPMA SOL, tamponları ters okuyan biri için doğru görünür.",
              "skills": [
                "rob-bumper",
                "prog-debug"
              ]
            },
            {
              "id": "m5h2d1-q3",
              "kind": "find-bug",
              "prompt": "Robot hiçbir yere çarpmadığı hâlde durmadan geri çekilip dönüyor. Tamponlar doğru bağlı. Kodda tek hata var. Nedir?\n\n```\npinMode(TAMPON_SOL, INPUT_PULLUP);\npinMode(TAMPON_SAG, INPUT_PULLUP);\n\nbool sol = (digitalRead(TAMPON_SOL) == HIGH);\nbool sag = (digitalRead(TAMPON_SAG) == HIGH);\n\nif (!sol && !sag) {\n  surus(HIZ, HIZ);\n  return;\n}\n```",
              "options": [
                "pinMode satırlarında OUTPUT yazmalı",
                "Basılı durum == HIGH ile sorulmuş; INPUT_PULLUP'ta basılı olan LOW okur",
                "if koşulundaki return silinmeli",
                "HIZ sabiti çok büyük"
              ],
              "answer": 1,
              "explanation": "INPUT_PULLUP ile serbest tampon HIGH okur. Kod HIGH'ı \"basılı\" saydığı için tamponlar serbestken sol ve sag true olur, if koşulu hiç sağlanmaz ve robot sürekli çarpma tepkisine girer. Düzeltme: == LOW. Pini OUTPUT yapmak okumayı bozar; return ve HIZ hatayla ilgisizdir.",
              "skills": [
                "rob-bumper",
                "prog-debug"
              ]
            },
            {
              "id": "m5h2d1-q4",
              "kind": "numeric",
              "prompt": "Tampon basıldığında robotun merkezi duvardan 10 cm uzakta. Robotun yarıçapı 7,5 cm. Dur komutundan sonra robot 2 cm kayarsa gövdesi ile duvar arasında kaç cm boşluk kalır?",
              "answer": 0.5,
              "tolerance": 0.05,
              "unit": "cm",
              "explanation": "Gövdenin kenarı merkezden 7,5 cm ötededir: 10 − 7,5 = 2,5 cm boşluk. Kayma 2 cm'i yer: 2,5 − 2 = 0,5 cm. Pay çok dar; kayma biraz daha büyük olsaydı robot duvara değerdi. Bu yüzden 82. derste çarpmadan önce haber veren sensör kullanılır.",
              "skills": [
                "rob-bumper",
                "rob-threshold"
              ]
            },
            {
              "id": "m5h2d1-q5",
              "kind": "mcq",
              "prompt": "Aşağıdakilerden hangisi tampon sensörünün zayıf yönüdür?",
              "options": [
                "Engeli ancak değdikten sonra fark eder",
                "Pil tüketimi çok yüksektir",
                "Sol ile sağı ayırt edemez",
                "Yalnız karanlıkta çalışır"
              ],
              "answer": 0,
              "explanation": "Tampon temas sensörüdür; haber geldiğinde robot zaten engele yaslanmıştır. İki ayrı tampon sol ile sağı ayırt eder, pil tüketimi önemsizdir ve ışıkla ilgisi yoktur.",
              "skills": [
                "rob-bumper"
              ]
            }
          ]
        },
        {
          "title": "Mesafe sensörüyle dur ve dön",
          "durationMin": 25,
          "problem": "Park sensörlü bir araba duvara yaklaştıkça bip hızını artırır; çarpmadan önce haber verir. Tampon sensöründe haber çarpınca geliyordu. Ultrasonik sensörle robotun engele değmeden durmasını sağlayacağız. Ama işin bir tuzağı var: sensörün ölçümü her seferinde biraz farklı çıkar. Robot bu oynak ölçümle ne zaman duracağına nasıl karar verecek?",
          "contentMd": "### Devre\n| Parça | Bağlantı |\n|---|---|\n| HC-SR04 | VCC → 5 V, GND → GND, TRIG → **D11**, ECHO → **D12** |\n| Sensörü taşıyan servo | Sinyal → **D4** (bu derste hep 90°, yani düz ileri) |\n| Sol motor | EN → **D5** (PWM), IN1 → **D7**, IN2 → **D8** |\n| Sağ motor | EN → **D6** (PWM), IN3 → **D9**, IN4 → **D10** |\n\n**Güç uyarısı:** Servo ve motorlar için ayrı pil kullan, pilin eksisini Arduino GND'sine de bağla (ortak GND). Servoyu ve motorları Arduino'nun 5 V pininden besleme. Pilleri kısa devre yapma, ters bağlama.\n\nSensör robotun ön ortasında, merkezin yaklaşık 6 cm önündedir. Ölçtüğün mesafe robotun merkezine değil, sensöre olan mesafedir.\n\n### Program\n**Önce ölçümü izleyelim.** Robot yerinde duruyor, duvara 44 cm var. Her turda iki sayı yazdırıyoruz: tek ölçüm (`ham`) ve 5 ölçümün ortancası (`medyan`). Medyan filtreyi 38. dersten hatırlarsın: ölçümleri sırala, ortadakini al; sıçrayan tek tük ölçümler elenir. Benzetimde ölçüme rastgele ±3 cm civarı gürültü ekledik. Gerçek sensörlerde de ölçüm oynar.\n\n```cpp\n// sketch: mesafe_yaz\n#include <Servo.h>\n\nconst int TRIG = 11;\nconst int ECHO = 12;\nconst int SERVO_PIN = 4;\n\nServo bakis;                         // sensörü taşıyan servo\n\n// HC-SR04 ile mesafe (cm). Yankı gelmezse 400 döner.\nint mesafeOlc() {\n  digitalWrite(TRIG, LOW);\n  delayMicroseconds(2);\n  digitalWrite(TRIG, HIGH);\n  delayMicroseconds(10);\n  digitalWrite(TRIG, LOW);\n  long sure = pulseIn(ECHO, HIGH, 30000);\n  if (sure == 0) return 400;\n  return sure / 58;\n}\n\n// 5 ölçümün ortancası (38. dersteki medyan filtre)\nint medyan5() {\n  int d[5];\n  for (int i = 0; i < 5; i++) {\n    d[i] = mesafeOlc();\n    delay(10);\n  }\n  for (int i = 1; i < 5; i++) {      // ekleme sıralaması\n    int x = d[i];\n    int j = i - 1;\n    while (j >= 0 && d[j] > x) {\n      d[j + 1] = d[j];\n      j--;\n    }\n    d[j + 1] = x;\n  }\n  return d[2];\n}\n\nvoid setup() {\n  pinMode(TRIG, OUTPUT);\n  pinMode(ECHO, INPUT);\n  bakis.attach(SERVO_PIN);\n  bakis.write(90);                   // düz ileri\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  int ham = mesafeOlc();\n  int med = medyan5();\n  Serial.print(ham);\n  Serial.print(\" \");\n  Serial.println(med);\n  delay(100);\n}\n```\n\n**Şimdi dur ve dön.** Robot düz gidiyor, her turda tek ölçüm alıyor. Mesafe `ESIK_CM` altına inince duruyor ve yerinde sağa dönüyor. İlk sürüm tek ölçüme güveniyor.\n\n```cpp\n// sketch: mesafe_tek_dur\n#include <Servo.h>\n\nconst int SOL_EN = 5;\nconst int SOL_IN1 = 7;\nconst int SOL_IN2 = 8;\nconst int SAG_EN = 6;\nconst int SAG_IN3 = 9;\nconst int SAG_IN4 = 10;\nconst int TRIG = 11;\nconst int ECHO = 12;\nconst int SERVO_PIN = 4;\n\nconst int HIZ = 160;                 // PWM; ölü bölgenin (~%20) üstünde\n\n// Tek motor: pwm > 0 ileri, < 0 geri, 0 dur (77. ders)\nvoid motor(int en, int a, int b, int pwm) {\n  digitalWrite(a, pwm > 0);\n  digitalWrite(b, pwm < 0);\n  analogWrite(en, abs(pwm));\n}\n\n// İki motoru birden sür: sol ve sag -255...255\nvoid surus(int sol, int sag) {\n  motor(SOL_EN, SOL_IN1, SOL_IN2, sol);\n  motor(SAG_EN, SAG_IN3, SAG_IN4, sag);\n}\n\n// HC-SR04 ile mesafe (cm). Yankı gelmezse 400 döner.\nint mesafeOlc() {\n  digitalWrite(TRIG, LOW);\n  delayMicroseconds(2);\n  digitalWrite(TRIG, HIGH);\n  delayMicroseconds(10);\n  digitalWrite(TRIG, LOW);\n  long sure = pulseIn(ECHO, HIGH, 30000);\n  if (sure == 0) return 400;\n  return sure / 58;\n}\n\nconst int ESIK_CM = 25;              // bundan yakındaysa dur\n\nServo bakis;                         // sensörü taşıyan servo\n\nvoid setup() {\n  bakis.attach(SERVO_PIN);\n  bakis.write(90);                   // düz ileri\n  pinMode(SOL_IN1, OUTPUT); pinMode(SOL_IN2, OUTPUT);\n  pinMode(SAG_IN3, OUTPUT); pinMode(SAG_IN4, OUTPUT);\n  pinMode(TRIG, OUTPUT);\n  pinMode(ECHO, INPUT);\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  int cm = mesafeOlc();\n  if (cm < ESIK_CM) {\n    surus(0, 0);                     // 1) dur\n    Serial.print(\"DUR \");\n    Serial.println(cm);\n    surus(HIZ, -HIZ);                // 2) yerinde sağa dön (~90°)\n    delay(450);\n    surus(0, 0);\n    return;\n  }\n  surus(HIZ, HIZ);\n  delay(20);\n}\n```\n\n**Medyanla.** Aynı program, ama karar tek ölçüme değil son 5 ölçümün ortancasına bağlı.\n\n```cpp\n// sketch: mesafe_medyan_dur\n#include <Servo.h>\n\nconst int SOL_EN = 5;\nconst int SOL_IN1 = 7;\nconst int SOL_IN2 = 8;\nconst int SAG_EN = 6;\nconst int SAG_IN3 = 9;\nconst int SAG_IN4 = 10;\nconst int TRIG = 11;\nconst int ECHO = 12;\nconst int SERVO_PIN = 4;\n\nconst int HIZ = 160;                 // PWM; ölü bölgenin (~%20) üstünde\n\n// Tek motor: pwm > 0 ileri, < 0 geri, 0 dur (77. ders)\nvoid motor(int en, int a, int b, int pwm) {\n  digitalWrite(a, pwm > 0);\n  digitalWrite(b, pwm < 0);\n  analogWrite(en, abs(pwm));\n}\n\n// İki motoru birden sür: sol ve sag -255...255\nvoid surus(int sol, int sag) {\n  motor(SOL_EN, SOL_IN1, SOL_IN2, sol);\n  motor(SAG_EN, SAG_IN3, SAG_IN4, sag);\n}\n\n// HC-SR04 ile mesafe (cm). Yankı gelmezse 400 döner.\nint mesafeOlc() {\n  digitalWrite(TRIG, LOW);\n  delayMicroseconds(2);\n  digitalWrite(TRIG, HIGH);\n  delayMicroseconds(10);\n  digitalWrite(TRIG, LOW);\n  long sure = pulseIn(ECHO, HIGH, 30000);\n  if (sure == 0) return 400;\n  return sure / 58;\n}\n\nconst int ESIK_CM = 25;              // bundan yakındaysa dur\nconst int N = 5;\n\n// N ölçümün ortancası (38. dersteki medyan filtre)\nint medyan() {\n  int d[N];\n  for (int i = 0; i < N; i++) {\n    d[i] = mesafeOlc();\n    delay(8);\n  }\n  for (int i = 1; i < N; i++) {\n    int x = d[i];\n    int j = i - 1;\n    while (j >= 0 && d[j] > x) { d[j + 1] = d[j]; j--; }\n    d[j + 1] = x;\n  }\n  return d[N / 2];\n}\n\nServo bakis;                         // sensörü taşıyan servo\n\nvoid setup() {\n  bakis.attach(SERVO_PIN);\n  bakis.write(90);                   // düz ileri\n  pinMode(SOL_IN1, OUTPUT); pinMode(SOL_IN2, OUTPUT);\n  pinMode(SAG_IN3, OUTPUT); pinMode(SAG_IN4, OUTPUT);\n  pinMode(TRIG, OUTPUT);\n  pinMode(ECHO, INPUT);\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  int cm = medyan();\n  if (cm < ESIK_CM) {\n    surus(0, 0);                     // 1) dur\n    Serial.print(\"DUR \");\n    Serial.println(cm);\n    surus(HIZ, -HIZ);                // 2) yerinde sağa dön (~90°)\n    delay(450);\n    surus(0, 0);\n    return;\n  }\n  surus(HIZ, HIZ);\n}\n```\n\n### Nasıl çalışıyor?\n1. `mesafeOlc()` TRIG'e 10 µs'lik darbe verir, `pulseIn` ile ECHO'daki darbenin süresini ölçer ve 58'e böler (ses gidiş-dönüşte 1 cm için yaklaşık 58 µs harcar). Yankı gelmezse 400 döner.\n2. `ESIK_CM = 25` demek: sensör engele 25 cm kalınca dur. Robotun merkezi bu sırada engelden yaklaşık 31 cm uzaktadır.\n3. `surus(0, 0)` dediğin anda robot hemen durmaz. Motor gecikmesi (80 ms) yüzünden yaklaşık 1,5 cm daha ilerler. Eşiği seçerken bu payı hesaba kat.\n4. Dönüş 450 ms sürer; 81. dersteki gibi bu yaklaşık 90°'dir.\n\n**Ölçtüklerimiz (benzetim, robot 0,3 m'den duvara doğru gidiyor):**\n- `mesafe_yaz` programında gerçek mesafe 44 cm iken tek ölçümlerin ortalaması 44 cm civarındaydı ama 3 cm kadar dalgalandı (standart sapma yaklaşık 3). Medyan değeri 2 cm civarında dalgalandı: tek ölçümün yaklaşık yarısı kadar.\n- Gürültüsüz durumda iki program da sensör duvara yaklaşık 24-25 cm kalınca durdu ve robot yaklaşık 90° sağa döndü. Duvara değmedi.\n- Gürültüyü abartıp 6 cm yaptık ve dört ayrı deneme çalıştırdık. Tek ölçümlü robot 33, 33, 34 ve 35 cm'de durdu: eşik 25 olduğu halde sahte \"engel var\" ölçümü yüzünden erkenden fren yaptı. Medyanlı robot 27, 24, 25 ve 28 cm'de durdu, yani eşiğe çok daha yakın.\n\nGürültü yalnız erken durmaya yol açmaz. Gerçek robotta tek ölçüm bir kere \"uzak\" gösterirse robot da engeli geç görebilir. Medyan ikisini de azaltır.\n\n### Dene\n- `mesafe_medyan_dur` programında `N` değerini önce 3, sonra 9 yap. Durma mesafesi ne kadar kararlı? Ölçüm sayısı arttıkça robotun karar verme hızı ne oluyor?\n- `ESIK_CM` değerini 15'e düşür. Robot hâlâ duvara değmeden duruyor mu? Dur komutundan sonraki kaymayı da hesaba kat.\n- Robot durduktan sonra 1 saniye bekle (`delay(1000)`) ve `Serial.println(medyan())` ile gördüğü mesafeyi yazdır. Eşiğin biraz altında mı duruyor?\n\n### Sık yapılan hatalar\n- Tek ölçüme güvenmek. Robotu sahte bir ölçüm durdurur ya da kaçırır.\n- Eşiği robotun merkezine göre düşünmek. Sensör robotun önündedir ve robot durmak için de yol alır.\n- `pulseIn` için zaman aşımı koymamak: yankı gelmezse program 1 saniye bekler.\n- Yankı gelmeyince 0 sonucunu \"0 cm, duvar dibindeyim\" diye yorumlamak. Bizim fonksiyon yankı yoksa 400 döndürür. Çok yakın cisimlerde de yankı gelmeyebilir (veri sayfasındaki en küçük ölçüm mesafesine bak).\n- Ölçüm döngüsüne uzun `delay` koymak: robot bu sırada körlemesine ilerler.\n\n### Gerçek robotta farklı olabilecekler\n- HC-SR04 ışın gibi dar değil, koni gibi yayılır. Genişliği modüle göre değişir (veri sayfasına bak). Sensör yan duvarı ya da zemini de görüp yanlış mesafe verebilir; benzetimdeki sensör tek ince bir ışındır.\n- Eğik duvara çarpan ses sensöre dönmeyip başka yöne yansıyabilir. Robot duvarı olduğundan uzak ya da hiç yok sanar.\n- Kumaş, koltuk, perde gibi yumuşak yüzeyler sesi emer; yankı zayıflar ve ölçüm yanlış ya da boş çıkabilir.\n- Ses hızı sıcaklığa göre değişir; 58 böleni yaklaşık bir değerdir.\n- Küçük ve ince cisimler (sandalye bacağı) yankıyı çok zayıf döndürür.\n- Gerçek gürültü benzetimdeki düzgün dağılıma benzemez; arada tamamen yanlış ölçümler de görürsün. Medyan yine de en güvenilir ilk adımdır.",
          "question": "Eşiği büyük seçersen robot güvenli durur ama dar geçitlerden geçemez. Küçük seçersen çarpma riski artar. Gürültü ve fren payı varken eşiği nasıl seçerdin?",
          "explainerMd": "### Bu derste öğreneceklerin\n- HC-SR04'ün süreyi nasıl mesafeye çevirdiğini (yaklaşık 58 µs = 1 cm)\n- Ölçümün neden oynadığını ve **medyan filtrenin** bunu nasıl azalttığını\n- Dur eşiğini seçerken sensör konumunu ve fren payını hesaba katmayı\n- \"Yankı gelmedi\" durumunu yanlış yorumlamamayı\n\n### Önceden bilmen gerekenler\n- 38. ders: gürültü ve medyan filtre\n- 77. ders: `surus(sol, sag)` ve motor sürücüsü\n- Modül 4: HC-SR04 ve `pulseIn` kullanımı\n- 81. ders: tamponun çarptıktan sonra haber verdiği\n\n### Sesle uzaklık ölçmek\nHC-SR04 ses darbesi yollar ve yankının dönmesini bekler. Sen `TRIG`'e 10 µs'lik darbe verirsin; `ECHO` pini, yankı dönene kadar HIGH kalır. `pulseIn(ECHO, HIGH, 30000)` bu süreyi mikrosaniye olarak ölçer. Ses gidip dönerken 1 cm için yaklaşık 58 µs harcar:\n\n```\nmesafe (cm) = süre (µs) / 58\n```\n\nÖrnek: yankı 2900 µs sürdüyse engel 2900 / 58 = 50 cm uzaktadır. Süre gidiş-dönüş olduğu için 58 sayısı, tek yöndeki 29 µs'nin iki katıdır.\n\n### Ölçüm oynar: medyan\nAynı duvara arka arkaya bakan sensör hep aynı sayıyı vermez. Benzetimde ±3 cm civarı oynama var ve gerçek sensörde de olur. Arada tümüyle yanlış bir ölçüm de gelebilir. Ortalama böyle bir aykırı değerden bozulur; **medyan** bozulmaz. Medyan için ölçümleri sırala, ortadakini al:\n\n| Ölçümler | Sıralı | Medyan | Ortalama |\n|---|---|---|---|\n| 44, 41, 90, 45, 43 | 41, 43, 44, 45, 90 | 44 | 52,6 |\n\n90 aykırı bir ölçüm. Medyan onu görmezden gelir ve 44'te kalır; ortalama ise 52,6'ya kayar. Benzetim ölçümünde medyan, tek ölçümün yaklaşık yarısı kadar oynadı.\n\n### Eşik seçmek: sensör ve fren payı\nRobot mesafe eşiğin altına inince durur; `ESIK_CM = 25` demek \"sensör engele 25 cm kalınca dur\" demektir. İki şeyi unutma:\n- Sensör robotun merkezinin yaklaşık 6 cm önündedir. Eşikte robotun merkezi engelden yaklaşık 25 + 6 = 31 cm uzaktadır.\n- `surus(0, 0)` dediğin anda robot durmaz. Motor gecikmesi yüzünden yaklaşık 1,5 cm daha ilerler.\n\nEşiği küçük seçersen çarpma riski artar; büyük seçersen robot dar geçitlerden geçemez.\n\n### Yankı gelmezse\nSensör, çok yakın, çok uzak ya da sesi dağıtan bir engel görürse yankı almayabilir. `pulseIn` zaman aşımında 0 döndürür. Bu 0'ı \"0 cm, duvar dibindeyim\" diye okursan robot açık alanda bile durur. Derste yankı yoksa `400` döndürüyoruz: \"çok uzak\".\n\n### Özet\nHC-SR04 süreyi ölçer, sen 58'e bölerek santimetreyi bulursun. Tek ölçüm oynadığı için karar vermeden önce birkaç ölçümün medyanını al. Dur eşiğini seçerken sensörün robotun önünde olduğunu ve robotun durmak için de yol aldığını hesaba kat. Yankı gelmeme durumunu ayrıca ele al.",
          "concepts": [
            {
              "term": "Yankı süresi",
              "definition": "TRIG darbesinden sonra ECHO pininin HIGH kaldığı süre; sesin engele gidip dönmesi için geçen zamandır.",
              "example": "pulseIn(ECHO, HIGH, 30000) bu süreyi mikrosaniye olarak verir.",
              "pitfall": "Süreyi doğrudan mesafe sanmak; gidiş-dönüş olduğu için 58'e bölmek gerekir."
            },
            {
              "term": "58 µs = 1 cm",
              "definition": "Ses gidiş-dönüşte 1 cm için yaklaşık 58 µs harcar; mesafe = süre / 58.",
              "example": "2900 µs yankı süresi 2900 / 58 = 50 cm demektir.",
              "pitfall": "Gidiş-dönüş olduğunu unutup sesin hızıyla tek yön hesaplamak: sonuç iki katı çıkar."
            },
            {
              "term": "Medyan filtre",
              "definition": "Birkaç ölçümü sıralayıp ortadakini almak; aykırı ölçümleri eler.",
              "example": "44, 41, 90, 45, 43 ölçümlerinin medyanı 44'tür.",
              "pitfall": "Medyan yerine ortalama almak: tek bir aykırı ölçüm sonucu bozar."
            },
            {
              "term": "Dur eşiği",
              "definition": "Ölçülen mesafe bundan küçükse robotun durduğu sınır (ESIK_CM).",
              "example": "ESIK_CM = 25 iken robot sensör engele 25 cm kalınca durur.",
              "pitfall": "Eşiği robotun merkezine göre düşünmek; sensör robotun önündedir ve robot durmak için de yol alır."
            },
            {
              "term": "Fren payı",
              "definition": "Dur komutundan sonra robotun kaydığı mesafe; eşik seçerken hesaba katılır.",
              "example": "Motor gecikmesi 80 ms olduğundan robot dur komutundan sonra yaklaşık 1,5 cm ilerler.",
              "pitfall": "Eşiği tam durma noktası sanmak ve payı hesaplamamak."
            },
            {
              "term": "Yankı yok (zaman aşımı)",
              "definition": "Yankı gelmediğinde pulseIn 0 döndürür; bu bir mesafe değildir.",
              "example": "Derste yankı yoksa mesafeOlc() 400 döndürür, yani çok uzak.",
              "pitfall": "0 sonucunu 0 cm sanıp robotu açık alanda durdurmak."
            }
          ],
          "quiz": [
            {
              "id": "m5h2d2-q1",
              "kind": "numeric",
              "prompt": "pulseIn, ECHO pininin 1740 µs HIGH kaldığını ölçtü. Dersteki gibi süre / 58 hesabıyla engel kaç cm uzaktadır?",
              "answer": 30,
              "tolerance": 0,
              "unit": "cm",
              "explanation": "1740 / 58 = 30. Süre gidiş ve dönüşü kapsadığı için 58 µs yaklaşık 1 cm eder. Süreyi 29'a bölüp 60 cm bulmak, tek yönlü hesabın yanlış kullanımıdır.",
              "skills": [
                "rob-ultrasonic"
              ]
            },
            {
              "id": "m5h2d2-q2",
              "kind": "predict-output",
              "prompt": "Üç ölçümün medyanını bulan işlev şöyle. Serial.println(medyan3(30, 400, 28)); ne yazar?\n\n```\nint medyan3(int a, int b, int c) {\n  if (a > b) { int t = a; a = b; b = t; }\n  if (b > c) { int t = b; b = c; c = t; }\n  if (a > b) { int t = a; a = b; b = t; }\n  return b;\n}\n```",
              "options": [
                "400",
                "152",
                "28",
                "30"
              ],
              "answer": 3,
              "explanation": "Üç takas sıralamadan sonra a, b, c küçükten büyüğe dizilir: 28, 30, 400. Ortadaki b = 30'dur. Ortalama (yaklaşık 152) aykırı 400'den bozulurdu; medyan 400'ü görmezden gelir.",
              "skills": [
                "rob-noise",
                "prog-debug"
              ]
            },
            {
              "id": "m5h2d2-q3",
              "kind": "find-bug",
              "prompt": "Robot açık bir salonda ilerlerken sürekli duruyor, önünde engel yok. Kodda tek hata var. Nedir?\n\n```\nint mesafeOlc() {\n  digitalWrite(TRIG, LOW);\n  delayMicroseconds(2);\n  digitalWrite(TRIG, HIGH);\n  delayMicroseconds(10);\n  digitalWrite(TRIG, LOW);\n  long sure = pulseIn(ECHO, HIGH, 30000);\n  if (sure == 0) return 0;\n  return sure / 58;\n}\n// loop: if (mesafeOlc() < 25) dur\n```",
              "options": [
                "TRIG darbesi 10 µs yerine 2 µs olmalı",
                "Yankı gelmeyince 0 döndürülüyor; 0 < 25 olduğundan robot \"engel var\" sanıp duruyor",
                "pulseIn'e zaman aşımı verilmemeli",
                "58 yerine 29'a bölünmeli"
              ],
              "answer": 1,
              "explanation": "Açık alanda yankı dönmez, pulseIn 0 verir. İşlev bunu 0 cm olarak döndürür ve 0 < 25 koşulu sağlanır. Dersteki gibi 400 (çok uzak) döndürmek gerekir. Zaman aşımı yararlıdır; olmasa yankısız ölçüm 1 saniye bekletirdi. 10 µs darbe ve 58 böleni doğrudur.",
              "skills": [
                "rob-ultrasonic",
                "prog-debug"
              ]
            },
            {
              "id": "m5h2d2-q4",
              "kind": "numeric",
              "prompt": "ESIK_CM = 25. Sensör tam 25 cm okuduğu anda robot dur komutunu alıyor ama motor gecikmesi yüzünden yaklaşık 1,5 cm daha ilerliyor. Robot durduğunda sensör engelden kaç cm uzaktadır?",
              "answer": 23.5,
              "tolerance": 0.1,
              "unit": "cm",
              "explanation": "25 − 1,5 = 23,5 cm. Eşik durma noktası değil, durma kararının verildiği noktadır; fren payı bundan çıkar. Robotu çok yakında durdurmak istiyorsan eşiği payı hesaba katarak seç.",
              "skills": [
                "rob-threshold"
              ]
            },
            {
              "id": "m5h2d2-q5",
              "kind": "mcq",
              "prompt": "Beş ölçüm şöyle: 44, 41, 400, 45, 43 (biri yankısız çıktı). Neden ortalama yerine medyan kullanılır?",
              "options": [
                "Medyan her zaman ortalamadan daha hızlı hesaplanır",
                "Tek bir aykırı ölçüm ortalamayı çok bozar, medyanı bozmaz",
                "Ortalama tam sayı vermez",
                "Medyan her zaman en küçük değeri verir"
              ],
              "answer": 1,
              "explanation": "Ortalama (114,6) aykırı 400'ün etkisiyle gerçek mesafenin çok üstüne çıkar; medyan 44'tür ve gerçeğe yakındır. Hız farkı bu işte önemli değildir, medyan ise en küçük değil ortadaki değerdir.",
              "skills": [
                "rob-noise"
              ]
            }
          ]
        },
        {
          "title": "Servo taramasıyla en açık yolu bul",
          "durationMin": 25,
          "problem": "Engelin önünde durdun. Şimdi hangi yöne gideceksin? Sola mı, sağa mı? Bir insan başını çevirip bakar ve boş olan tarafa yürür. Robotun başı yok, ama sensörünü taşıyan bir servo var. Servo sensörü sağa sola çevirir, robot her yönün ne kadar açık olduğunu ölçer ve en uzağa dönmeye karar verir.",
          "contentMd": "### Devre\nBağlantılar 82. dersteki gibidir; fark, servonun artık gerçekten hareket etmesidir.\n\n| Parça | Bağlantı |\n|---|---|\n| HC-SR04 | VCC → 5 V, GND → GND, TRIG → **D11**, ECHO → **D12** |\n| Sensörü taşıyan servo | Sinyal → **D4** (sensörü servonun üstüne sabitle) |\n| Sol motor | EN → **D5** (PWM), IN1 → **D7**, IN2 → **D8** |\n| Sağ motor | EN → **D6** (PWM), IN3 → **D9**, IN4 → **D10** |\n\n**Güç uyarısı:** Servo ve motorlar için ayrı pil kullan, pilin eksisini Arduino GND'sine de bağla (ortak GND). Servoyu ve motorları Arduino'nun 5 V pininden besleme. Pilleri kısa devre yapma, ters bağlama.\n\n### Servo açısı yönü belirler\n21. derste `write(90)` servoyu ortaya getirmişti. Sensör servoya sabit olduğundan servo açısı ışının yönünü de belirler:\n\n| Servo açısı | Işın yönü |\n|---|---|\n| 90° | düz ileri |\n| 150° | robotun 60° soluna |\n| 30° | robotun 60° sağına |\n\nYani **büyük açı = sola**. Biz −60°…+60° arasını 30° adımlarla tarayacağız: servo açıları 30, 60, 90, 120, 150.\n\n### Program\nÖnce arenayı düşün: robot bir duvara bakıyor, ama duvarın sol ucu açık; yani sol taraftan geçilebilir. Program yönleri sırayla ölçer, en uzak yönü seçer ve oraya döner.\n\n```cpp\n// sketch: tara_en_acik\n#include <Servo.h>\n\nconst int SOL_EN = 5;\nconst int SOL_IN1 = 7;\nconst int SOL_IN2 = 8;\nconst int SAG_EN = 6;\nconst int SAG_IN3 = 9;\nconst int SAG_IN4 = 10;\nconst int TRIG = 11;\nconst int ECHO = 12;\n\nconst int HIZ = 160;                 // PWM; ölü bölgenin (~%20) üstünde\n\n// Tek motor: pwm > 0 ileri, < 0 geri, 0 dur (77. ders)\nvoid motor(int en, int a, int b, int pwm) {\n  digitalWrite(a, pwm > 0);\n  digitalWrite(b, pwm < 0);\n  analogWrite(en, abs(pwm));\n}\n\n// İki motoru birden sür: sol ve sag -255...255\nvoid surus(int sol, int sag) {\n  motor(SOL_EN, SOL_IN1, SOL_IN2, sol);\n  motor(SAG_EN, SAG_IN3, SAG_IN4, sag);\n}\n\n// HC-SR04 ile mesafe (cm). Yankı gelmezse 400 döner.\nint mesafeOlc() {\n  digitalWrite(TRIG, LOW);\n  delayMicroseconds(2);\n  digitalWrite(TRIG, HIGH);\n  delayMicroseconds(10);\n  digitalWrite(TRIG, LOW);\n  long sure = pulseIn(ECHO, HIGH, 30000);\n  if (sure == 0) return 400;\n  return sure / 58;\n}\n\nconst int SERVO_PIN = 4;\nconst int ACI_ADET = 5;\nconst int ACILAR[ACI_ADET] = {30, 60, 90, 120, 150};   // 90 = ileri, büyük açı = sol\nconst int MS_DERECE = 5;                               // yerinde dönüş: ~5 ms / derece (HIZ = 160 için)\n\nServo tarayici;\n\n// 3 ölçümün ortancası\nint medyan3() {\n  int a = mesafeOlc(); delay(10);\n  int b = mesafeOlc(); delay(10);\n  int c = mesafeOlc();\n  if (a > b) { int t = a; a = b; b = t; }\n  if (b > c) { int t = b; b = c; c = t; }\n  if (a > b) { int t = a; a = b; b = t; }\n  return b;\n}\n\n// Servoyu 30°...150° gezdirir, her yönde ölçer, en uzak ölçülen açıyı döndürür\nint enAcikAci() {\n  int enIyiAci = 90;\n  int enIyiCm = -1;\n  for (int i = 0; i < ACI_ADET; i++) {\n    tarayici.write(ACILAR[i]);\n    delay(300);                      // servo hedefe varsın\n    int cm = medyan3();\n    Serial.print(ACILAR[i]);\n    Serial.print(\":\");\n    Serial.println(cm);\n    if (cm > enIyiCm) {\n      enIyiCm = cm;\n      enIyiAci = ACILAR[i];\n    }\n  }\n  tarayici.write(90);\n  return enIyiAci;\n}\n\nvoid setup() {\n  pinMode(SOL_IN1, OUTPUT); pinMode(SOL_IN2, OUTPUT);\n  pinMode(SAG_IN3, OUTPUT); pinMode(SAG_IN4, OUTPUT);\n  pinMode(TRIG, OUTPUT);\n  pinMode(ECHO, INPUT);\n  tarayici.attach(SERVO_PIN);\n  tarayici.write(90);\n  Serial.begin(9600);\n  delay(500);\n\n  int aci = enAcikAci();\n  Serial.print(\"SECILEN \");\n  Serial.println(aci);\n\n  int fark = aci - 90;                  // + = sola\n  if (fark > 0) surus(-HIZ, HIZ);\n  else if (fark < 0) surus(HIZ, -HIZ);\n  delay(abs(fark) * MS_DERECE);\n  surus(HIZ, HIZ);\n}\n\nvoid loop() {\n}\n```\n\n### Nasıl çalışıyor?\n1. `ACILAR` dizisi taranacak servo açılarını tutar (4. ders, diziler). `ACI_ADET` dizinin uzunluğudur.\n2. Her açıda önce servoya `write` der, 300 ms bekler (servo hedefe varsın), sonra 3 ölçümün ortancasıyla (82. ders) mesafeyi alır. Servo bekleme süresi servoya göre değişir; hareket eden servoyla ölçüm yapmak yanlış sonuç verir.\n3. `if (cm > enIyiCm)` ile şimdiye kadarki en uzak ölçüm ve açısı hatırlanır.\n4. Tarama bitince servo tekrar 90°'ye döner. Robot `fark = aci - 90` kadar döner: fark pozitifse sola (`surus(-HIZ, HIZ)`), negatifse sağa. Dönüş süresi `|fark| × 5 ms`; 81. ve 82. derslerde 450 ms'nin yaklaşık 90° ettiğini görmüştük.\n5. Dönünce düz ilerler.\n\n**Ölçtüklerimiz (benzetim):**\n- Duvarın sol tarafı açıkken ölçümler yaklaşık şöyle çıktı: 30° → 57 cm, 60° → 32 cm, 90° → 29 cm, 120° → 33 cm, 150° → 115 cm. Program `SECILEN 150` yazdı, robot yaklaşık 60° sola döndü ve duvarın ucundan geçip yoluna devam etti.\n- Aynı arenanın sağ tarafı açık (ayna) hâlinde ölçümler tersine döndü: 30° → 116 cm, 150° → 57 cm. Program `SECILEN 30` yazdı ve robot yaklaşık 60° sağa döndü. Yani kod arenanın hangi tarafının açık olduğunu kendisi buluyor; sola ya da sağa dönmesi kodda yazılı değil.\n- Tarama yaklaşık 1,7 saniye sürdü (5 yön × 300 ms bekleme ve ölçümler). Bu süre boyunca robot duruyor.\n\n### Dene\n- `ACILAR` dizisine 0 ve 180 ekle (`ACI_ADET` değerini de güncelle). Çok geniş açılarda ölçümler ne gösteriyor? Kenarlara yakın açılarda robotu yan duvara doğru çevirmek mantıklı mı?\n- Adımı 30°'den 15°'ye indir (9 yön). Tarama süresi ne kadar uzuyor? Seçilen yön daha mı doğru oluyor?\n- En uzak yönü seçmek yerine \"ileriye en yakın, 40 cm'den uzak yön\" seçecek şekilde değiştir. Robot daha az dönüyor mu?\n\n### Sık yapılan hatalar\n- Servoya `write` dedikten hemen sonra ölçmek: servo henüz yoldadır, ölçüm iki yönün karışımıdır.\n- `ACI_ADET` ile dizinin gerçek uzunluğunu uyumsuz yazmak: döngü dizinin dışına taşar.\n- Sol ile sağı karıştırmak. Hatırla: 90° ileri, büyük açı sola.\n- `fark` işaretini ters kullanmak: robot açık yönün tersine döner.\n- Tarama bitince servoyu 90°'ye döndürmeyi unutmak: sonraki ölçümler yana bakar.\n- Her yön kısaysa ne yapacağını düşünmemek. Tüm ölçümler yakınsa \"en uzak\" yön de duvardır. Bu durumu 84. derste ele alacağız.\n\n### Gerçek robotta farklı olabilecekler\n- Gerçek servo benzetimdeki kadar çabuk ve tekrarlanabilir değildir; bekleme süresini kendi servona göre ayarla. Servo hareket başlarken ani akım çekebilir; Arduino ile aynı bataryadan beslenirse bu, kartın resetlenmesi gibi sorunlara yol açabilir. Ayrı güç ve ortak GND bunu azaltır.\n- Gerçek HC-SR04 ışını geniş bir konidir (82. ders). 30° adımlarla tarayınca komşu yönlerin ışınları üst üste biner; ince engeller aralarından kaçabilir.\n- Kenarlara bakan ışınlar yan duvarı eğik görür; eğik yüzeyde yansıma sensöre dönmeyip \"çok uzak\" ölçüm verebilir. Bu, açık yol seçimini yanıltır.\n- Tarama yaklaşık 2 saniye sürer. Hareketli bir engelle (bir insan, başka bir robot) karşılaşırsan tarama sonucu eskimiş olabilir.",
          "question": "Robot tarama sırasında duruyor ve bu yaklaşık 2 saniye sürüyor. Taramayı hızlandırmanın (daha az açı, daha kısa bekleme) bedeli ne olabilir? Hangisi daha önemli: hızlı karar mı, doğru karar mı?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Servo açısının sensörün baktığı yönü nasıl belirlediğini\n- Birkaç yönü sırayla ölçüp en uzak yönü bulan \"en büyüğü ara\" kalıbını\n- Servoya komut verdikten sonra neden beklemek gerektiğini\n- Seçilen açıyı yerinde dönüş süresine çevirmeyi\n- Her yön kapalıysa taramanın neden yetmediğini\n\n### Önceden bilmen gerekenler\n- 21. ders: `Servo` kütüphanesi ve `write(açı)`\n- 4. ders: diziler ve `for` döngüsü\n- 82. ders: `mesafeOlc()` ve medyan filtre\n- 81. ders: yerinde dönüşün süreyle ayarlanması (450 ms yaklaşık 90°)\n\n### Servo sensöre yön verir\nHC-SR04 tek yöne bakar. Onu servonun üstüne koyarsan servo açısı bakış yönü olur:\n\n| Servo açısı | Işın yönü |\n|---|---|\n| 30° | robotun 60° sağına |\n| 60° | 30° sağa |\n| 90° | düz ileri |\n| 120° | 30° sola |\n| 150° | robotun 60° soluna |\n\nHatırlamak için: 90° ileri, büyük açı sola.\n\n### En uzak yönü bulmak\nAçıları bir dizide tutarsın: `{30, 60, 90, 120, 150}`. Her açıya gidip mesafeyi ölçersin ve şimdiye kadarki en büyüğü hatırlarsın:\n\n```\nif (cm > enIyiCm) {\n  enIyiCm = cm;\n  enIyiAci = ACILAR[i];\n}\n```\n\nKarşılaştırma `>` olduğundan iki yön eşit uzaklıkta çıkarsa ilk bulunan kalır. Örnek ölçümler: 30° → 40, 60° → 80, 90° → 60, 120° → 80, 150° → 20 cm. En büyük 80'dir, iki kez görünür; kod ilkini, yani 60°'yi seçer.\n\n### Servoya zaman tanı\n`write(açı)` komutu servoyu hemen hedefe götürmez; servo bir süre döner. Bu sırada ölçersen iki yönün karışımını ölçersin. Derste her açıda 300 ms bekleniyor. Beş açı için yalnızca bu bekleme 5 × 300 = 1500 ms eder. Ölçümlerle birlikte tarama yaklaşık 1,7 saniye sürer ve robot bu süre boyunca durur. Daha çok açı daha iyi yön demektir ama daha uzun bekleme demektir.\n\n### Açıyı dönüşe çevirmek\nSeçilen açıdan 90'ı çıkarırsan robotun ne kadar dönmesi gerektiğini bulursun: `fark = aci - 90`. Fark pozitifse sola, negatifse sağa dönülür. Dönüş süresi `|fark| × 5 ms` olarak alınır. Örnek: 150° seçildiyse fark 60°, dönüş yaklaşık 300 ms.\n\n### Tarama her derde deva değildir\nTüm yönler yakınsa \"en uzak\" yön de duvardır. En uzak ölçüm bile küçükse robot sıkışmıştır; bu durumu 84. derste ele alacağız.\n\n### Özet\nServo, sensörü çevirerek robota bakış verir. Robot her yönü ölçer, en büyük değeri ve açısını tutar, seçilen açıyı dönüş süresine çevirir. Servo hareket ederken ölçüm yapma; her açıdan sonra bekle. Taramanın bedeli süredir.",
          "concepts": [
            {
              "term": "Tarama",
              "definition": "Sensörü servoyla birkaç yöne çevirip her yönde mesafe ölçmek.",
              "example": "30, 60, 90, 120 ve 150° açılarında sırayla ölçüm almak.",
              "pitfall": "Taramayı anlık sanmak; 5 yön yaklaşık 1,7 saniye sürer ve robot o sürede durur."
            },
            {
              "term": "Servo açısı ve ışın yönü",
              "definition": "Sensör servoya sabit olduğundan servo açısı ışının yönünü belirler: 90° ileri, büyük açı sol.",
              "example": "write(150) sensörü robotun yaklaşık 60° soluna çevirir.",
              "pitfall": "Sol ile sağı karıştırmak; robot açık yönün tersine döner."
            },
            {
              "term": "En büyüğü ara",
              "definition": "Değerleri tek tek gezip şimdiye kadarki en büyüğünü ve konumunu hatırlama kalıbı.",
              "example": "if (cm > enIyiCm) { enIyiCm = cm; enIyiAci = ACILAR[i]; }",
              "pitfall": "Başlangıç değerini çok büyük vermek (ör. 1000): hiçbir ölçüm onu geçemez."
            },
            {
              "term": "Servo bekleme süresi",
              "definition": "Servoya write dedikten sonra hedefe varması için beklenen süre; derste 300 ms.",
              "example": "Beş açı için yalnız bekleme 5 × 300 = 1500 ms tutar.",
              "pitfall": "Beklemeden ölçmek: servo yoldadır ve ölçüm iki yönün karışımı olur."
            },
            {
              "term": "Açıdan dönüşe",
              "definition": "fark = aci - 90; pozitifse sola, negatifse sağa, süre = |fark| × 5 ms.",
              "example": "150° seçilirse fark 60°, dönüş süresi 300 ms.",
              "pitfall": "fark işaretini ters kullanmak: robot açık yönün tersine döner."
            }
          ],
          "quiz": [
            {
              "id": "m5h2d3-q1",
              "kind": "mcq",
              "prompt": "Sensör servoya sabit. Servo write(150) konumundayken ışın nereye bakar?",
              "options": [
                "Robotun 60° sağına",
                "Düz ileri",
                "Robotun 60° soluna",
                "Robotun arkasına"
              ],
              "answer": 2,
              "explanation": "90° düz ileridir ve büyük açı sola karşılık gelir. 150°, 90°'den 60° büyüktür, yani ışın 60° sola bakar. 30° ise 60° sağdır.",
              "skills": [
                "rob-scan"
              ]
            },
            {
              "id": "m5h2d3-q2",
              "kind": "predict-output",
              "prompt": "Servo açılarında ölçümler 40, 80, 60, 80, 20 cm çıktı. Bu kod ne yazar?\n\n```\nconst int ACILAR[5] = {30, 60, 90, 120, 150};\nint olcum[5] = {40, 80, 60, 80, 20};\nint enIyiAci = 90;\nint enIyiCm = -1;\nfor (int i = 0; i < 5; i++) {\n  if (olcum[i] > enIyiCm) {\n    enIyiCm = olcum[i];\n    enIyiAci = ACILAR[i];\n  }\n}\nSerial.println(enIyiAci);\n```",
              "options": [
                "60",
                "120",
                "80",
                "90"
              ],
              "answer": 0,
              "explanation": "En büyük ölçüm 80 cm ve iki kez görünür (60° ve 120°). Karşılaştırma > olduğu için eşit değer ilkini ezmez; 60° kalır. Serial.println cm değerini değil açıyı yazar, bu yüzden 80 değil 60 çıkar.",
              "skills": [
                "rob-scan",
                "prog-loops-arrays"
              ]
            },
            {
              "id": "m5h2d3-q3",
              "kind": "find-bug",
              "prompt": "Tarama sırasında ölçümler birbirine karışıyor, robot yanlış yön seçiyor. Kodda tek hata var. Nedir?\n\n```\nfor (int i = 0; i < ACI_ADET; i++) {\n  tarayici.write(ACILAR[i]);\n  int cm = medyan3();\n  if (cm > enIyiCm) {\n    enIyiCm = cm;\n    enIyiAci = ACILAR[i];\n  }\n}\n```",
              "options": [
                "if (cm > enIyiCm) yerine < olmalı",
                "for döngüsü 0'dan değil 1'den başlamalı",
                "medyan3() yerine mesafeOlc() çağrılmalı",
                "write'tan sonra servonun hedefe varması için bekleme yok"
              ],
              "answer": 3,
              "explanation": "Servo write'ı alınca hemen hedefe varmaz; bekleme olmadan ölçüm servo hâlâ dönerken yapılır ve iki yönün karışımını verir. Derste burada delay(300) var. > karşılaştırması en uzağı arar, doğrudur; döngü 0'dan başlamalıdır; medyan3 tek ölçümden iyidir.",
              "skills": [
                "rob-scan",
                "prog-debug"
              ]
            },
            {
              "id": "m5h2d3-q4",
              "kind": "numeric",
              "prompt": "Robot 120° seçti. fark = 120 - 90 olur ve dönüş süresi |fark| × 5 ms hesaplanır. Robot kaç ms döner?",
              "answer": 150,
              "tolerance": 0,
              "unit": "ms",
              "explanation": "fark = 30°, süre = 30 × 5 = 150 ms. Fark pozitif olduğundan robot sola döner. 5 ms/derece, 450 ms'nin yaklaşık 90° ettiğinden gelir.",
              "skills": [
                "rob-scan",
                "prog-timing"
              ]
            },
            {
              "id": "m5h2d3-q5",
              "kind": "numeric",
              "prompt": "Tarama 30° ile 150° arasında 15° adımlarla yapılıyor (uçlar dahil). Her açıda servoya 300 ms bekleme veriliyor. Yalnız bu bekleme toplamı kaç ms tutar?",
              "answer": 2700,
              "tolerance": 0,
              "unit": "ms",
              "explanation": "30'dan 150'ye 15'er adımla 9 açı vardır (30, 45, ..., 150). 9 × 300 = 2700 ms. Ölçüm süreleri bunun üstüne eklenir. Açıları artırmak daha ince tarama sağlar ama robot daha uzun süre kör ve hareketsiz kalır.",
              "skills": [
                "rob-scan",
                "prog-timing",
                "prog-loops-arrays"
              ]
            }
          ]
        },
        {
          "title": "Engelden kaçma durum makinesi",
          "durationMin": 30,
          "problem": "81-83. derslerde üç ayrı yetenek yazdın: tamponla refleks, mesafeyle durma, servoyla yön seçme. Hepsini tek programda çalıştırmaya kalksan `if` ve `delay` yığını çıkar; robot bir şey beklerken diğerine bakamaz. Kimin ne zaman sıra alacağına nasıl karar vereceksin? 28. dersteki cevabı hatırla: robota her an **tek bir durum** ver ve durumlar arası geçişleri açıkça yaz.",
          "contentMd": "### Devre\nDevre 83. dersteki gibidir ve tamponlar da bağlıdır.\n\n| Parça | Bağlantı |\n|---|---|\n| HC-SR04 | VCC → 5 V, GND → GND, TRIG → **D11**, ECHO → **D12** |\n| Sensörü taşıyan servo | Sinyal → **D4** |\n| Tamponlar | Sol → **D2**, sağ → **D3** (ikisi de GND ile arası, `INPUT_PULLUP`) |\n| Sol motor | EN → **D5** (PWM), IN1 → **D7**, IN2 → **D8** |\n| Sağ motor | EN → **D6** (PWM), IN3 → **D9**, IN4 → **D10** |\n\n**Güç uyarısı:** Servo ve motorlar için ayrı pil kullan, pilin eksisini Arduino GND'sine de bağla (ortak GND). Pilleri kısa devre yapma, ters bağlama.\n\n### Durumlar\nRobotun beş durumu var:\n\n| Durum | Robot ne yapıyor? | Bir sonraki durum |\n|---|---|---|\n| ILERI | Düz gider, 50 ms'de bir ölçer | Ortanca mesafe < 25 cm ise **DUR**; tampon basılırsa **GERI** |\n| DUR | Motorlar kapalı, 250 ms bekler (robot tam dursun) | **TARA** |\n| TARA | Servo 5 yöne bakar, her yönde 300 ms bekleyip ölçer | En uzak yön 35 cm'den uzaksa **DON**, değilse **GERI** |\n| DON | Yerinde döner, süre = \\|açı − 90\\| × 5 ms | **ILERI** |\n| GERI | 400 ms geri gider | **DON** (90° döner) |\n\nTampon, sensörün göremediği engeller için yedektir: ILERI durumunda her turda önce tamponlara bakılır.\n\n### Program\nBu program 27. dersteki `millis()` mantığıyla kurulu: hiçbir durumda `delay` yok. Her durum \"süre doldu mu?\" diye bakar ve dolduysa `gec()` ile yeni duruma geçer. Hangi durumda olduğunu seri monitörden de izleyebilirsin.\n\n```cpp\n// sketch: kacis_fsm\n#include <Servo.h>\n\n// Robotun beş durumu (28. ders). Her biri bir sayıdır: ILERI=0, DUR=1, ...\nenum Durum { ILERI, DUR, TARA, DON, GERI };\n\nconst int SOL_EN = 5;\nconst int SOL_IN1 = 7;\nconst int SOL_IN2 = 8;\nconst int SAG_EN = 6;\nconst int SAG_IN3 = 9;\nconst int SAG_IN4 = 10;\nconst int TRIG = 11;\nconst int ECHO = 12;\n\nconst int HIZ = 160;                 // PWM; ölü bölgenin (~%20) üstünde\n\n// Tek motor: pwm > 0 ileri, < 0 geri, 0 dur (77. ders)\nvoid motor(int en, int a, int b, int pwm) {\n  digitalWrite(a, pwm > 0);\n  digitalWrite(b, pwm < 0);\n  analogWrite(en, abs(pwm));\n}\n\n// İki motoru birden sür: sol ve sag -255...255\nvoid surus(int sol, int sag) {\n  motor(SOL_EN, SOL_IN1, SOL_IN2, sol);\n  motor(SAG_EN, SAG_IN3, SAG_IN4, sag);\n}\n\n// HC-SR04 ile mesafe (cm). Yankı gelmezse 400 döner.\nint mesafeOlc() {\n  digitalWrite(TRIG, LOW);\n  delayMicroseconds(2);\n  digitalWrite(TRIG, HIGH);\n  delayMicroseconds(10);\n  digitalWrite(TRIG, LOW);\n  long sure = pulseIn(ECHO, HIGH, 30000);\n  if (sure == 0) return 400;\n  return sure / 58;\n}\n\nconst int SERVO_PIN = 4;\nconst int TAMPON_SOL = 2;\nconst int TAMPON_SAG = 3;\n\nconst int ESIK_CM = 25;              // bundan yakında engel varsa dur\nconst int ACIK_CM = 35;              // taramada en iyi yön bundan yakınsa sıkışmışız\nconst int ACI_ADET = 5;\nconst int ACILAR[ACI_ADET] = {30, 60, 90, 120, 150};   // 90 = ileri, büyük açı = sol\nconst int MS_DERECE = 5;                 // yerinde dönüş: ~5 ms / derece\nconst unsigned long OLCUM_ARALIK = 50;   // ILERI'de ölçüm aralığı (ms)\nconst unsigned long DUR_MS = 250;        // durduktan sonra bekleme (robot tam dursun)\nconst unsigned long SERVO_BEKLE = 300;   // servo yeni açıya varsın\nconst unsigned long GERI_MS = 400;\n\nconst char* DURUM_ADI[] = {\"ILERI\", \"DUR\", \"TARA\", \"DON\", \"GERI\"};\n\nServo tarayici;\nDurum durum = ILERI;\nunsigned long durumBasi = 0;\nunsigned long sonOlcum = 0;\nunsigned long servoZaman = 0;\nint taramaNo = 0;\nint mesafeler[ACI_ADET];\nunsigned long donSure = 0;\nint donYon = 1;                      // +1 sola, -1 sağa\n\n// 3 ölçümün ortancası (~20 ms sürer)\nint medyan3() {\n  int a = mesafeOlc(); delay(5);\n  int b = mesafeOlc(); delay(5);\n  int c = mesafeOlc();\n  if (a > b) { int t = a; a = b; b = t; }\n  if (b > c) { int t = b; b = c; c = t; }\n  if (a > b) { int t = a; a = b; b = t; }\n  return b;\n}\n\n// Durum değiştirir, giriş zamanını kaydeder ve seriye yazar\nvoid gec(Durum yeni) {\n  durum = yeni;\n  durumBasi = millis();\n  Serial.print(\"DURUM \");\n  Serial.println(DURUM_ADI[yeni]);\n}\n\nvoid don(int yon, unsigned long ms) {   // yon: +1 sola, -1 sağa\n  donYon = yon;\n  donSure = ms;\n  gec(DON);\n}\n\nvoid setup() {\n  pinMode(SOL_IN1, OUTPUT); pinMode(SOL_IN2, OUTPUT);\n  pinMode(SAG_IN3, OUTPUT); pinMode(SAG_IN4, OUTPUT);\n  pinMode(TRIG, OUTPUT);\n  pinMode(ECHO, INPUT);\n  pinMode(TAMPON_SOL, INPUT_PULLUP);\n  pinMode(TAMPON_SAG, INPUT_PULLUP);\n  tarayici.attach(SERVO_PIN);\n  tarayici.write(90);\n  Serial.begin(9600);\n  gec(ILERI);\n}\n\nvoid loop() {\n  unsigned long simdi = millis();\n\n  switch (durum) {\n    case ILERI:                           // düz git, engel ara\n      surus(HIZ, HIZ);\n      if (digitalRead(TAMPON_SOL) == LOW) { donYon = -1; gec(GERI); break; }\n      if (digitalRead(TAMPON_SAG) == LOW) { donYon = 1; gec(GERI); break; }\n      if (simdi - sonOlcum >= OLCUM_ARALIK) {\n        sonOlcum = simdi;\n        if (medyan3() < ESIK_CM) gec(DUR);\n      }\n      break;\n\n    case DUR:                             // dur, robot sakinleşsin\n      surus(0, 0);\n      if (simdi - durumBasi >= DUR_MS) {\n        taramaNo = 0;\n        tarayici.write(ACILAR[0]);\n        servoZaman = simdi;\n        gec(TARA);\n      }\n      break;\n\n    case TARA:                            // servoyla 5 yöne bak\n      surus(0, 0);\n      if (simdi - servoZaman >= SERVO_BEKLE) {\n        mesafeler[taramaNo] = medyan3();\n        taramaNo++;\n        if (taramaNo < ACI_ADET) {\n          tarayici.write(ACILAR[taramaNo]);\n          servoZaman = millis();\n        } else {\n          tarayici.write(90);\n          int en = 0;\n          for (int i = 1; i < ACI_ADET; i++) if (mesafeler[i] > mesafeler[en]) en = i;\n          Serial.print(\"EN ACIK \");\n          Serial.print(ACILAR[en]);\n          Serial.print(\" \");\n          Serial.println(mesafeler[en]);\n          if (mesafeler[en] < ACIK_CM) {\n            donYon = 1;\n            gec(GERI);\n          } else {\n            int fark = ACILAR[en] - 90;\n            don(fark >= 0 ? 1 : -1, (unsigned long)abs(fark) * MS_DERECE);\n          }\n        }\n      }\n      break;\n\n    case DON:                             // yerinde dön\n      surus(-donYon * HIZ, donYon * HIZ);\n      if (simdi - durumBasi >= donSure) gec(ILERI);\n      break;\n\n    case GERI:                            // geri çekil\n      surus(-HIZ, -HIZ);\n      if (simdi - durumBasi >= GERI_MS) don(donYon, 90UL * MS_DERECE);\n      break;\n  }\n}\n```\n\n### Nasıl çalışıyor?\n1. `enum Durum { ILERI, DUR, TARA, DON, GERI }` durumlara isim verir; `switch (durum)` o anki duruma ait bloğu çalıştırır (28. ders). `durumBasi` o duruma girdiğin zamanı tutar, `simdi - durumBasi >= DUR_MS` gibi karşılaştırmalar süre dolunca geçiş yapar.\n2. `gec(yeni)` durumu değiştirir, `durumBasi`'yı günceller ve seriye `DURUM ...` yazar. Süreyi sıfırlamayı hiçbir yerde elle yapmıyoruz; unutma riski yok.\n3. TARA durumunda `taramaNo` hangi açıda olduğumuzu tutar. Servo açısı değişince `servoZaman` kaydedilir; 300 ms geçince ölçüm alınır ve bir sonraki açıya geçilir. Beş açı bitince `mesafeler` dizisinden en uzak olan seçilir ve `EN ACIK` satırı yazılır.\n4. En iyi yön bile `ACIK_CM = 35` cm'den yakınsa robot sıkışmıştır (dar bir cep ya da köşe). O zaman dönmeye çalışmak yerine önce GERI'ye gidip biraz çekilir, sonra 90° döner.\n5. `medyan3()` üç `pulseIn` ve iki `delay(5)` içerir, yaklaşık 20 ms sürer. Bu kısa blokaj kabul edilebilir; `loop()` yine saniyede onlarca kez döner.\n\n**Ölçtüklerimiz (benzetim):**\n- Boş 2 × 2 m kutuda, ölçüm gürültüsü 2 cm iken, robot 20 saniyede yaklaşık 2,8 m yol aldı, 3 tam ILERI-DUR-TARA-DON turu yaptı ve hiç duvara değmedi.\n- Zamanlamalar `millis()` ile tuttu: DUR yaklaşık 250 ms, TARA yaklaşık 1,6 saniye (5 yön × 300 ms bekleme ve ölçümler), 60°'lik DON yaklaşık 300 ms. Ölçülen dönüş açısı, taramada seçilen açının 90°'den farkıyla 20° içinde uyuştu.\n- Dar bir cepte (30 cm genişlikte, ucu kapalı) başlayan robot ilerleyip durdu, ikinci taramada en uzak yön 26 cm çıktı (35 cm'den yakın), `GERI` durumuna geçti ve gerçekten geri gitti. Hiç çarpmadı.\n- Duvarda 3 cm'lik ince bir yarık bıraktık. Orta ışın yarıktan geçip uzağı gördü (sensör engeli göremedi), ama iki tampon duvara bastı ve robot ILERI → GERI → DON sırasıyla geri çekildi. Tampon yedeği işe yaradı.\n\n### Dene\n- `ACIK_CM` değerini 60 yap. Robot daha mı sık GERI'ye gidiyor? Neden?\n- TARA'dan sıkışarak gelen GERI hep sola döner (`donYon = 1`). Bunu, taramada 30° ile 150° yönlerinden hangisi daha uzun ölçüldüyse o tarafa döndürecek şekilde değiştir.\n- Beşinci durum olarak `BEKLE` ekle: seri monitörden `b` gelince dur, `g` gelince ILERI'ye dön. Hangi yerlere `if` eklemen gerekti?\n\n### Sık yapılan hatalar\n- Durum bloklarına `delay` koymak: bir durum beklerken tamponlara hiç bakılmaz.\n- `durum = DUR;` yazıp `durumBasi`'yı güncellemeyi unutmak. Hep `gec()` kullan.\n- `enum` tanımını, onu parametre olarak kullanan fonksiyonlardan sonra yazmak: Arduino \"`Durum` was not declared\" hatası verir. Tanımı dosyanın başına koy.\n- Durum adlarını Arduino'nun kendi adlarıyla çakıştırmak. Ör. `ADLAR` Arduino'daki AVR işlemcisinin bir kayıt bitinin adıdır; bu isimle bir dizi tanımlarsan derleyici beklenmedik hata verir. Bu yüzden diziye `DURUM_ADI` dedik.\n- Geçişleri yazarken bir durumdan çıkışı unutmak: robot o durumda sonsuza kadar kalır. Her durum için \"nereye gidiyor?\" sorusunu cevapla.\n- Tarama sırasında `surus(0, 0)` demeyi unutmak: robot dönerek ölçer.\n\n### Gerçek robotta farklı olabilecekler\n- Zamanlamalar (`DUR_MS`, `SERVO_BEKLE`, `MS_DERECE`) kendi robotunda ölç; dönüşün süresi pile, zemine ve motor farklarına göre değişir. Zamana bağlı dönüş, tekerlek sayısına bağlı dönüşten (enkoder, 4. hafta) daha az doğrudur.\n- Bir durum makinesi hata ayıklarken büyük kolaylık sağlar: `DURUM ...` çıktısı robotun neyi neden yaptığını anlatır. Gerçek robotta seri kablo takılı olmayınca bunu bir LED'le ya da kısa bir bip dizisiyle de gösterebilirsin.\n- Gerçek ortamda tarama sırasında bir şey robota yaklaşabilir. Durum makinesine \"TARA sırasında da tamponlara bak\" kuralı eklemek isteyebilirsin.",
          "question": "Bu programı `delay` ile, durum makinesi olmadan yazmayı düşün. Tampon basıldığında ne olurdu? Durum makinesinin sana en çok neyi kolaylaştırdığını düşünüyorsun?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Robot davranışını tek bir \"durum\" ile anlatmanın neden işe yaradığını\n- Durum, geçiş koşulu ve eylem kavramlarını bir tabloya dökmeyi\n- `delay` kullanmadan, `millis()` ile her durumda \"süre doldu mu?\" diye bakmayı\n- Durum değiştirmek için neden her zaman `gec()` gibi tek bir işlev kullandığını\n- Sensörün göremediği engeller için yedek (tampon) ve sıkışma durumunu\n\n### Önceden bilmen gerekenler\n- 27. ders: `millis()` ile bloklamayan kod\n- 28. ders: durum makineleri ve `enum`\n- 81. ders: tampon tepkisi, 82. ders: mesafe ve eşik, 83. ders: servo taraması\n- 9. ders: `Serial.println` ile durumu izlemek\n\n### Neden durum makinesi?\n81-83. derslerdeki üç yeteneği `delay`li kodla arka arkaya yazarsan robot beklerken hiçbir şeye bakamaz. Örneğin dönerken tampon basılsa fark edilmez. Çözüm: robota her an **tek bir durum** ver ve her durumda \"ne yapıyorum, ne zaman bırakıyorum?\" sorularını cevapla.\n\n### Beş durum\n| Durum | Ne yapar | Çıkış koşulu | Sonraki |\n|---|---|---|---|\n| ILERI | Düz gider | Mesafe < 25 cm ya da tampon | DUR / GERI |\n| DUR | Motorları kapatır, 250 ms bekler | 250 ms doldu | TARA |\n| TARA | 5 yöne bakar | 5 ölçüm tamam | DON / GERI |\n| DON | Yerinde döner | Dönüş süresi doldu | ILERI |\n| GERI | 400 ms geri gider | 400 ms doldu | DON |\n\nBu tablo programın iskeletidir. Kodu yazmadan önce tabloyu çiz: her satırın çıkışı olmalıdır, yoksa robot o durumda sonsuza kadar kalır.\n\n### delay yok, süre kontrolü var\nHer durumda `simdi - durumBasi >= SURE` kontrolü yapılır. `durumBasi`, o duruma girdiğin anın `millis()` değeridir. Süre dolmadıysa `loop()` bir şey yapmadan geri döner ve bir sonraki turda yine bakar. Bu yüzden `loop()` saniyede yüzlerce kez döner ve ILERI'de tampona her turda bakabilirsin.\n\nDurumu şu üç satır değiştirir: `durum = yeni; durumBasi = millis(); Serial.println(...)`. Bunu her seferinde elle yazarsan `durumBasi`'yı unutursun. Bu yüzden bir `gec(yeni)` işlevi yazılır ve durum **yalnız onunla** değiştirilir.\n\n### Tampon neden hâlâ gerekli?\nSensör tek bir ışındır. Duvardaki 3 cm'lik bir yarıktan ışın geçebilir ve robot engeli görmez. Tampon bunu yakalar: ILERI durumunda her turda önce tamponlara bakılır. Benzetimde böyle bir yarıkta iki tampon basıldı ve robot ILERI → GERI → DON sırasıyla kurtuldu.\n\n### Sıkışma\nTaramada en uzak yön bile 35 cm'den yakınsa robot bir cebe girmiştir. Dönmeye çalışmak yerine önce GERI'ye gider, sonra döner. Böylece bu durum için ayrı bir durum yazmadan mevcut durumları yeniden kullanırsın.\n\n### Özet\nDurum makinesi, davranışı durumlar, çıkış koşulları ve geçişler olarak tabloya döker. `delay` yerine `millis()` kullanıldığı için robot her turda tamponlara ve komutlara bakabilir. Durum değişimini tek bir `gec()` işleviyle yap. Tampon sensörün göremediği engellere, sıkışma denetimi ise tarama sonucunun işe yaramadığı durumlara karşı yedektir.",
          "concepts": [
            {
              "term": "Durum (state)",
              "definition": "Robotun o an ne yaptığını anlatan tek bir etiket; aynı anda yalnız biri geçerlidir.",
              "example": "ILERI, DUR, TARA, DON ve GERI robotun beş durumudur.",
              "pitfall": "İki durumun işini aynı anda yapmaya çalışmak ve durum değişkenini göz ardı etmek."
            },
            {
              "term": "Geçiş koşulu",
              "definition": "Bir durumdan başka bir duruma geçmeyi tetikleyen olay: süre dolması, mesafe eşiği, tampon basılması.",
              "example": "ILERI'de medyan mesafe 25 cm'den küçükse DUR'a geçilir.",
              "pitfall": "Bir durum için çıkış yazmayı unutmak: robot o durumda sonsuza kadar kalır."
            },
            {
              "term": "durumBasi",
              "definition": "Bir duruma girilen anın millis() değeri; simdi - durumBasi o durumda geçen süredir.",
              "example": "DUR durumunda simdi - durumBasi >= 250 olunca TARA'ya geçilir.",
              "pitfall": "durumBasi'yı güncellememek: eski değer yüzünden süre baştan dolmuş görünür."
            },
            {
              "term": "gec()",
              "definition": "Durumu değiştiren, durumBasi'yı güncelleyen ve seriye yazan tek işlev.",
              "example": "gec(DUR) hem durumu değiştirir hem 250 ms'lik bekleme için başlangıç zamanını kaydeder.",
              "pitfall": "Durumu durum = DUR; diye doğrudan atamak: durumBasi eski kalır."
            },
            {
              "term": "Yedek koruma",
              "definition": "Bir sensörün göremediği durumlara karşı eklenen ikinci sensör ya da denetim.",
              "example": "3 cm'lik yarıktan ultrasonik ışın geçse bile tamponlar robotu GERI durumuna alır.",
              "pitfall": "Tek sensöre güvenip yedeği atlamak; ışın bazı engelleri göremez."
            }
          ],
          "quiz": [
            {
              "id": "m5h2d4-q1",
              "kind": "mcq",
              "prompt": "Durum bloklarında delay kullanmamanın asıl faydası nedir?",
              "options": [
                "Robot daha hızlı gider",
                "Derleyici hata vermez",
                "Robot beklerken de tamponlara ve komutlara bakabilir",
                "Pil daha az harcanır"
              ],
              "answer": 2,
              "explanation": "delay sırasında loop() durur ve hiçbir sensöre bakılmaz. millis() ile süre kontrolü yapılan kodda loop() her turda döner; dönüş sürerken bile tampon okunabilir. Robotun hızı ya da pil tüketimi bununla değişmez.",
              "skills": [
                "rob-fsm",
                "prog-timing"
              ]
            },
            {
              "id": "m5h2d4-q2",
              "kind": "numeric",
              "prompt": "Bir engel döngüsünün süresini hesapla: DUR 250 ms, TARA'da 5 yön × 300 ms servo bekleme (ölçüm süreleri hariç), DON'da 60° için |fark| × 5 ms. Toplam kaç ms?",
              "answer": 2050,
              "tolerance": 0,
              "unit": "ms",
              "explanation": "250 + 5 × 300 + 60 × 5 = 250 + 1500 + 300 = 2050 ms. Ölçüm süreleri eklenince yaklaşık 2,2 saniyeye çıkar. Bu süre boyunca robot ilerlemez; bu yüzden proje dersinde yol hesabına katılır.",
              "skills": [
                "rob-fsm",
                "prog-timing"
              ]
            },
            {
              "id": "m5h2d4-q3",
              "kind": "predict-output",
              "prompt": "TARA bittiğinde en uzak ölçüm 26 cm çıktı. ACIK_CM = 35. Her gec() çağrısı seriye \"DURUM ...\" yazar. Bundan sonra seri monitörde hangi DURUM satırları sırayla görünür?\n\n```\nif (mesafeler[en] < ACIK_CM) {\n  donYon = 1;\n  gec(GERI);\n} else {\n  int fark = ACILAR[en] - 90;\n  don(fark >= 0 ? 1 : -1, (unsigned long)abs(fark) * MS_DERECE);\n}\n// GERI: 400 ms geri gider, sonra don(donYon, 90UL * MS_DERECE)\n// DON: süre dolunca gec(ILERI)\n```",
              "options": [
                "DURUM DON, DURUM ILERI",
                "DURUM ILERI",
                "DURUM GERI, DURUM DON, DURUM ILERI",
                "DURUM DUR, DURUM TARA"
              ],
              "answer": 2,
              "explanation": "26, 35'ten küçük olduğundan ilk dal çalışır: robot sıkışmıştır ve önce GERI'ye geçer. GERI süresi dolunca don() çağrılır ve DON'a, dönüş bitince ILERI'ye geçilir. \"DURUM DON, DURUM ILERI\" else dalının çıktısıdır; sıkışmış robot için doğru değil.",
              "skills": [
                "rob-fsm",
                "rob-scan"
              ]
            },
            {
              "id": "m5h2d4-q4",
              "kind": "find-bug",
              "prompt": "Robot engeli görünce duruyor gibi yapıp taramaya hemen başlıyor; 250 ms'lik durma bekleme süresi çalışmıyor, seride de \"DURUM DUR\" satırı yok. Kodda tek hata var. Nedir?\n\n```\ncase ILERI:\n  surus(HIZ, HIZ);\n  if (simdi - sonOlcum >= OLCUM_ARALIK) {\n    sonOlcum = simdi;\n    if (medyan3() < ESIK_CM) durum = DUR;\n  }\n  break;\n```",
              "options": [
                "medyan3() yerine mesafeOlc() çağrılmalı",
                "durum doğrudan atanmış; durumBasi güncellenmiyor ve DUR beklemesi atlanıyor, gec(DUR) olmalı",
                "ESIK_CM karşılaştırması > olmalı",
                "break satırı silinmeli"
              ],
              "answer": 1,
              "explanation": "durum = DUR; ataması durumBasi'yı değiştirmez. durumBasi ILERI'ye girildiği eski zamanda kaldığından DUR'da simdi - durumBasi >= 250 koşulu hemen sağlanır ve TARA'ya atlanır; seriye de yazılmaz. gec(DUR) hem durumBasi'yı günceller hem DURUM satırını yazar. Sınama sonucunda aynı belirtiyi benzetimde de gördük.",
              "skills": [
                "rob-fsm",
                "prog-debug"
              ]
            },
            {
              "id": "m5h2d4-q5",
              "kind": "mcq",
              "prompt": "Ultrasonik sensör varken robotta neden hâlâ tamponlar bulunur?",
              "options": [
                "Tampon mesafeyi sensörden daha doğru ölçer",
                "Sensör tek bir ışındır ve ince yarık gibi bazı engelleri göremez; tampon yedektir",
                "Tampon olmadan Arduino çalışmaz",
                "Tamponlar servoyu çevirir"
              ],
              "answer": 1,
              "explanation": "Işın dar olduğu için örneğin 3 cm'lik bir yarıktan geçip uzağı görebilir. Tampon temas edince devreye girer ve robotu kurtarır. Tampon mesafe ölçmez (yalnız temas bilir), Arduino'nun çalışması buna bağlı değildir ve servoyu çevirmez.",
              "skills": [
                "rob-bumper",
                "rob-fsm"
              ]
            }
          ]
        },
        {
          "title": "Proje: Otonom engelden kaçan robot",
          "durationMin": 35,
          "problem": "Bir depoda dolaşan küçük robot kimseye sormadan koridorlarda gezer, rafların kenarından döner, bir şeye çarpmaya ramak kalınca yön değiştirir. Bu hafta üç sensör ve beş durumla tam bu işi yapan bir robot kurdun. Şimdi hepsini birleştirip robotu içinde engeller olan bir arenaya bırakacaksın ve soracağız: bu robot gerçekten işe yarıyor mu? \"Yarıyor\" derken neyi, hangi sayıyla ölçeceksin?",
          "contentMd": "### Ne yapacağız?\nBu proje öğrendiklerini birleştirir:\n- **Hafta 2, ders 81:** Tamponlar (D2, D3) yedek koruma olarak.\n- **Hafta 2, ders 82:** HC-SR04 (D11, D12) ve medyan filtre.\n- **Hafta 2, ders 83:** Servo (D4) ile 30°-150° tarama, en uzak yönü seçme.\n- **Hafta 2, ders 84:** `millis()` tabanlı durum makinesi (ILERI, DUR, TARA, DON, GERI).\n- **Hafta 1:** `surus(sol, sag)` işlevi ve motor sürücüsü (77. ders), ölü bölgenin üstünde hız (78. ders), seri komutlarla uzaktan durdurma/başlatma (79. ders).\n\n84. dersin programına üç şey ekliyoruz:\n1. **Seri komutlar:** `x` robotu durdurur, `g` yeniden başlatır.\n2. **Sıkışma denetimi:** ILERI durumunda 1,5 saniye boyunca mesafe 6 cm değişmediyse (robot ilerlemiyor demektir) robot geri çekilir. Bu, sensörün göremediği bir engele takılmaya karşı ek bir koruma.\n3. **Rapor:** Her 5 saniyede tampon sayısını yazar.\n\n### Devre\n| Parça | Bağlantı |\n|---|---|\n| HC-SR04 | VCC → 5 V, GND → GND, TRIG → **D11**, ECHO → **D12** |\n| Sensörü taşıyan servo | Sinyal → **D4** |\n| Tamponlar | Sol → **D2**, sağ → **D3** (GND ile arası, `INPUT_PULLUP`) |\n| Sol motor | EN → **D5** (PWM), IN1 → **D7**, IN2 → **D8** |\n| Sağ motor | EN → **D6** (PWM), IN3 → **D9**, IN4 → **D10** |\n\n**Güç uyarısı:** Servo ve motorlar için ayrı pil kullan, pilin eksisini Arduino GND'sine de bağla (ortak GND). Servoyu ve motorları Arduino'nun 5 V pininden besleme. Pilleri kısa devre yapma, ters bağlama.\n\n### Program\n```cpp\n// sketch: otonom_kacis\n#include <Servo.h>\n\n// Robotun beş durumu (28. ders). Her biri bir sayıdır: ILERI=0, DUR=1, ...\nenum Durum { ILERI, DUR, TARA, DON, GERI };\n\nconst int SOL_EN = 5;\nconst int SOL_IN1 = 7;\nconst int SOL_IN2 = 8;\nconst int SAG_EN = 6;\nconst int SAG_IN3 = 9;\nconst int SAG_IN4 = 10;\nconst int TRIG = 11;\nconst int ECHO = 12;\n\nconst int HIZ = 160;                 // PWM; ölü bölgenin (~%20) üstünde\n\n// Tek motor: pwm > 0 ileri, < 0 geri, 0 dur (77. ders)\nvoid motor(int en, int a, int b, int pwm) {\n  digitalWrite(a, pwm > 0);\n  digitalWrite(b, pwm < 0);\n  analogWrite(en, abs(pwm));\n}\n\n// İki motoru birden sür: sol ve sag -255...255\nvoid surus(int sol, int sag) {\n  motor(SOL_EN, SOL_IN1, SOL_IN2, sol);\n  motor(SAG_EN, SAG_IN3, SAG_IN4, sag);\n}\n\n// HC-SR04 ile mesafe (cm). Yankı gelmezse 400 döner.\nint mesafeOlc() {\n  digitalWrite(TRIG, LOW);\n  delayMicroseconds(2);\n  digitalWrite(TRIG, HIGH);\n  delayMicroseconds(10);\n  digitalWrite(TRIG, LOW);\n  long sure = pulseIn(ECHO, HIGH, 30000);\n  if (sure == 0) return 400;\n  return sure / 58;\n}\n\nconst int SERVO_PIN = 4;\nconst int TAMPON_SOL = 2;\nconst int TAMPON_SAG = 3;\n\nconst int ESIK_CM = 25;              // bundan yakında engel varsa dur\nconst int ACIK_CM = 35;              // taramada en iyi yön bundan yakınsa sıkışmışız\nconst int ACI_ADET = 5;\nconst int ACILAR[ACI_ADET] = {30, 60, 90, 120, 150};   // 90 = ileri, büyük açı = sol\nconst int MS_DERECE = 5;                 // yerinde dönüş: ~5 ms / derece\nconst unsigned long OLCUM_ARALIK = 50;   // ILERI'de ölçüm aralığı (ms)\nconst unsigned long DUR_MS = 250;        // durduktan sonra bekleme (robot tam dursun)\nconst unsigned long SERVO_BEKLE = 300;   // servo yeni açıya varsın\nconst unsigned long GERI_MS = 400;\nconst unsigned long TAKILMA_MS = 1500;   // bu sürede mesafe 6 cm değişmediyse sıkıştık\nconst unsigned long RAPOR_MS = 5000;\n\nconst char* DURUM_ADI[] = {\"ILERI\", \"DUR\", \"TARA\", \"DON\", \"GERI\"};\n\nServo tarayici;\nDurum durum = ILERI;\nunsigned long durumBasi = 0;\nunsigned long sonOlcum = 0;\nunsigned long servoZaman = 0;\nint taramaNo = 0;\nint mesafeler[ACI_ADET];\nunsigned long donSure = 0;\nunsigned long ilerlemeZaman = 0;\nunsigned long sonRapor = 0;\nint ilerlemeCm = -100;\nint carpmaSayisi = 0;\nbool calisiyor = true;\nint donYon = 1;                      // +1 sola, -1 sağa\n\n// 3 ölçümün ortancası (~20 ms sürer)\nint medyan3() {\n  int a = mesafeOlc(); delay(5);\n  int b = mesafeOlc(); delay(5);\n  int c = mesafeOlc();\n  if (a > b) { int t = a; a = b; b = t; }\n  if (b > c) { int t = b; b = c; c = t; }\n  if (a > b) { int t = a; a = b; b = t; }\n  return b;\n}\n\n// Durum değiştirir, giriş zamanını kaydeder ve seriye yazar\nvoid gec(Durum yeni) {\n  durum = yeni;\n  durumBasi = millis();\n  if (yeni == ILERI) {\n    ilerlemeZaman = durumBasi;\n    ilerlemeCm = -100;\n  }\n  Serial.print(\"DURUM \");\n  Serial.println(DURUM_ADI[yeni]);\n}\n\nvoid tamponTepki(int yon) {\n  carpmaSayisi++;\n  Serial.println(yon > 0 ? \"TAMPON SAG\" : \"TAMPON SOL\");\n  donYon = yon;\n  gec(GERI);\n}\n\nvoid don(int yon, unsigned long ms) {   // yon: +1 sola, -1 sağa\n  donYon = yon;\n  donSure = ms;\n  gec(DON);\n}\n\nvoid setup() {\n  pinMode(SOL_IN1, OUTPUT); pinMode(SOL_IN2, OUTPUT);\n  pinMode(SAG_IN3, OUTPUT); pinMode(SAG_IN4, OUTPUT);\n  pinMode(TRIG, OUTPUT);\n  pinMode(ECHO, INPUT);\n  pinMode(TAMPON_SOL, INPUT_PULLUP);\n  pinMode(TAMPON_SAG, INPUT_PULLUP);\n  tarayici.attach(SERVO_PIN);\n  tarayici.write(90);\n  Serial.begin(9600);\n  gec(ILERI);\n}\n\nvoid komutOku() {\n  while (Serial.available() > 0) {\n    char c = Serial.read();\n    if (c == 'x') { calisiyor = false; Serial.println(\"KOMUT DUR\"); }\n    if (c == 'g') { calisiyor = true; Serial.println(\"KOMUT GIT\"); gec(ILERI); }\n  }\n}\n\nvoid loop() {\n  unsigned long simdi = millis();\n\n  komutOku();\n  if (!calisiyor) {\n    surus(0, 0);\n    return;\n  }\n\n  if (simdi - sonRapor >= RAPOR_MS) {\n    sonRapor = simdi;\n    Serial.print(\"RAPOR carpma=\");\n    Serial.println(carpmaSayisi);\n  }\n\n  switch (durum) {\n    case ILERI:                           // düz git, engel ara\n      surus(HIZ, HIZ);\n      if (digitalRead(TAMPON_SOL) == LOW) { tamponTepki(-1); break; }\n      if (digitalRead(TAMPON_SAG) == LOW) { tamponTepki(1); break; }\n      if (simdi - sonOlcum >= OLCUM_ARALIK) {\n        sonOlcum = simdi;\n        int cm = medyan3();\n        if (cm < ESIK_CM) { gec(DUR); break; }\n        if (abs(cm - ilerlemeCm) >= 6) {          // ilerliyoruz: mesafe değişti\n          ilerlemeCm = cm;\n          ilerlemeZaman = simdi;\n        } else if (simdi - ilerlemeZaman >= TAKILMA_MS) {\n          Serial.println(\"SIKISTI\");\n          donYon = 1;\n          gec(GERI);\n        }\n      }\n      break;\n\n    case DUR:                             // dur, robot sakinleşsin\n      surus(0, 0);\n      if (simdi - durumBasi >= DUR_MS) {\n        taramaNo = 0;\n        tarayici.write(ACILAR[0]);\n        servoZaman = simdi;\n        gec(TARA);\n      }\n      break;\n\n    case TARA:                            // servoyla 5 yöne bak\n      surus(0, 0);\n      if (simdi - servoZaman >= SERVO_BEKLE) {\n        mesafeler[taramaNo] = medyan3();\n        taramaNo++;\n        if (taramaNo < ACI_ADET) {\n          tarayici.write(ACILAR[taramaNo]);\n          servoZaman = millis();\n        } else {\n          tarayici.write(90);\n          int en = 0;\n          for (int i = 1; i < ACI_ADET; i++) if (mesafeler[i] > mesafeler[en]) en = i;\n          Serial.print(\"EN ACIK \");\n          Serial.print(ACILAR[en]);\n          Serial.print(\" \");\n          Serial.println(mesafeler[en]);\n          if (mesafeler[en] < ACIK_CM) {\n            donYon = 1;\n            gec(GERI);\n          } else {\n            int fark = ACILAR[en] - 90;\n            don(fark >= 0 ? 1 : -1, (unsigned long)abs(fark) * MS_DERECE);\n          }\n        }\n      }\n      break;\n\n    case DON:                             // yerinde dön\n      surus(-donYon * HIZ, donYon * HIZ);\n      if (simdi - durumBasi >= donSure) gec(ILERI);\n      break;\n\n    case GERI:                            // geri çekil\n      surus(-HIZ, -HIZ);\n      if (simdi - durumBasi >= GERI_MS) don(donYon, 90UL * MS_DERECE);\n      break;\n  }\n}\n```\n\n### Nasıl çalışıyor?\n1. Durum makinesi 84. dersle aynıdır. Fark: `loop()` en başta `komutOku()` ile seri porta bakar. `calisiyor` yanlışsa motorlar durur ve `loop()` geri döner; durumlar olduğu gibi kalır. `g` gelince `gec(ILERI)` ile temiz bir başlangıç yapılır.\n2. `tamponTepki()` tampon olayını sayar (`carpmaSayisi`), mesajı yazar ve GERI durumuna geçer. Sol tampon basıldıysa dönüş yönü sağdır (81. ders).\n3. **Sıkışma denetimi:** ILERI durumunda son ölçümün 6 cm'den fazla değiştiği an `ilerlemeCm` ve `ilerlemeZaman` güncellenir. Robot 0,2 m/s gittiğinde 6 cm yaklaşık 0,3 saniyede değişir. 1,5 saniye (`TAKILMA_MS`) boyunca değişmediyse robot bir yere takılmış demektir: `SIKISTI` yazılır ve GERI durumuna geçilir. Eşiği 6 cm seçtik; 2 cm'lik ölçüm gürültüsü medyan filtreden sonra genellikle bu kadar oynatmaz.\n4. `RAPOR` satırı her 5 saniyede tampon sayısını yazar. Robotu denerken neyin sık olduğunu görmek için kullanışlıdır.\n\n### Ölç: robot işe yarıyor mu?\nDeneme arenası 2 × 2 m. İçinde üç engel var: ortada 40 × 40 cm'lik bir blok (dört duvar), sağ tarafta 60 cm'lik dikey bir duvar parçası ve üstte 60 cm'lik yatay bir duvar parçası. Ölçüm gürültüsü 2 cm. Her koşuda robotu bir başlangıç noktasına koyup 30-35 saniye çalıştırıyoruz ve iki şeye bakıyoruz (kontrolde ayrıca 25. saniyede `x` gönderip robotun durduğunu, `g` ile devam ettiğini de doğruluyoruz):\n\n- **Yol:** robotun kat ettiği toplam mesafe (`r.state.distanceM`).\n- **Çarpma sayısı:** `r.state.collided` robot duvara girmeye çalıştığı sürece doğrudur. Süre boyunca doğru kaldığı için milisaniye saymak yanlış olur; **doğru olmaya başladığı anı** sayarız (8. dersteki kenar algılama). Böylece bir temas bir çarpma olur.\n\n**Sonuçlar:**\n- Sol alttan doğuya bakarak başlayan koşuda (35 sn) robot 4,2 m yol aldı, hiç çarpmadı. Tampon bir kez devreye girdi, 7 kez tarama yaptı.\n- Sağ üstten batıya bakarak başlayan koşuda (30 sn) 4,2 m yol aldı, 1 çarpma oldu ve sıkışma denetimi bir kez devreye girdi.\n- Altı farklı başlangıç noktasını ve iki farklı gürültü tohumunu denedik (12 koşu, 35 sn): robot 4,0-4,7 m yol aldı, çarpma sayısı 0-3 arasında kaldı.\n\n**Neden bu eşikler?** Başarı ölçütünü şöyle koyduk: 30-35 saniyede **en az 3 metre yol** ve **en fazla 3 çarpma**.\n- Robot 0,2 m/s gider. 35 saniyede hiç durmasa 7 m kat ederdi. Ama her engelde dur, tara, dön döngüsü yaklaşık 2,2 saniye alır (DUR 0,25 + TARA 1,6 + DON 0,3). Bu süre boyunca robot ilerlemez; yani 4-5 metre bu robot için çok iyi bir sonuçtur.\n- Eşiği ölçtüğümüz en düşük değerin (4,0 m) yaklaşık 1 m altına, 3 m'ye koyduk: farklı başlangıç ve gürültüde robotun yine geçmesini istiyoruz. 7 m'ye yakın bir eşik, robotun engelden kaçarken harcadığı zamanı yok sayardı. 1 m'lik eşik ise robot çoğunlukla duruyor olsa bile geçerdi; hiçbir şey ölçmezdi.\n- \"Hiç çarpmama\" şartı gerçekçi değil. Sensörümüz tek bir ışındır; ışın bir duvar ucunun yanından geçip gövde o uca değebilir, sığ bir açıyla duvara sürtünürken ışın hep uzağı görebilir. Tampon da robotun yalnız önünü korur. Yine de çarpma sayısını sıfıra yakın tutmak isteriz: bu yüzden üst sınır küçük (3).\n\nEşiği sana uyan bir sayıyla değiştirmeden önce şunu sor: bu sayı robotun gerçekten iyi olduğunu mu gösteriyor, yoksa yalnız bizim arenaya mı uyuyor?\n\n### Dene\n- `ESIK_CM` değerini 15 ve 40 yap. Yol ve çarpma sayısı nasıl değişiyor? Hangi değer iyi bir denge?\n- `HIZ` değerini 220 yap. Robot daha fazla yol alıyor ama çarpma sayısı artıyor mu? Neden?\n- Seri komutlara `h` ekle: `h` gelince `HIZ` yarıya insin (yavaş mod), `g` normal hıza dönsün. `HIZ` şu an sabit (`const`); bunu değiştirilebilir bir değişkene çevirmen gerekecek.\n- `RAPOR` satırına toplam geçen süreyi de ekle.\n\n### Sık yapılan hatalar\n- Sıkışma denetimini `delay` ile yapmak: robot beklerken hiçbir şeye bakamaz.\n- Çarpmayı `collided` doğru olduğu sürece saymak: bir temas yüzlerce çarpma gibi görünür.\n- Ölçüm gürültüsüne karşı medyan kullanmamak: robot sahte engelden korkup gereksiz tarama yapar.\n- `x` komutuyla durdurup `g` ile başlatırken durum makinesini sıfırlamamak: robot yarım kalmış bir dönüşün ortasından devam eder.\n- Eşiği \"robot geçsin diye\" ölçümden yüksek tutup sonra \"neden geçmiyor\" diye şaşırmak. Önce ölç, sonra eşiği koy.\n\n### Gerçek robotta farklı olabilecekler\n- **Ultrasonik ışın açısı:** Gerçek HC-SR04 dar bir ışın değil, koni gibi yayılır (veri sayfasına bak). Duvar ucu, sandalye bacağı gibi dar cisimler bazen görülmez; bazen yan duvar ya da zemin yanlış ölçüme yol açar. Benzetimde sensör tek bir ışındır.\n- **Yansıma:** Duvara eğik gelen ses sensöre dönmeyebilir. Robot duvarı daha uzak, hatta hiç yok sanır. Sığ açıyla yaklaşmak en tehlikeli durumdur.\n- **Yumuşak yüzeyler:** Perde, kumaş, koltuk, halı gibi yüzeyler sesi emer. Yankı zayıflar ya da hiç gelmez. Bu yüzeylerde tamponlar ve sıkışma denetimi yedek olarak çok önemli olur.\n- **Tampon:** Gerçek anahtarlar sıçrar (8. ders). Yumuşak engellerde tampon basılmayabilir.\n- **Zamanlama:** Dönüşler zamanla yapılıyor. Pil bitmeye yaklaştıkça motorlar yavaşlar ve 90° dönüş 70°'ye düşebilir. Dönüşleri enkoderle ölçmek (4. hafta) bunu çözer.\n- **Güvenlik:** Gerçek robotu önce kaldırıp tekerlekleri havada deneyerek çalıştır. Bir komut gelmeden robot hareket etmemeli; `x` komutu bir \"acil durdur\" gibi düşünülmeli.",
          "question": "Bir arkadaşın robotunun \"çok iyi\" olduğunu söylüyor, ama hiç sayı vermiyor. Ona hangi iki ölçümü sorarsın ve cevaplara göre neyi anlarsın? Çarpma sayısı küçük ama yol da küçükse robota ne olmuş olabilir?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Bir robotun \"işe yarıyor\" demenin ne demek olduğunu sayıyla ifade etmeyi (yol ve çarpma sayısı)\n- Çarpmayı süre boyunca değil, **başladığı anda** saymak için kenar algılamayı\n- Başarı eşiğini ölçümden türetmeyi; keyfi bir sayı koymamayı\n- Sıkışma denetimi ve acil durdurma komutuyla robota ek koruma eklemeyi\n- Önceki derslerin parçalarını (tampon, ultrasonik, servo, durum makinesi) tek robotta birleştirmeyi\n\n### Önceden bilmen gerekenler\n- 81-84. dersler: tampon, mesafe, tarama ve beş durumlu makine\n- 79. ders: seri komutlarla durdurma ve başlatma\n- 8. ders: kenar algılama\n- 27-28. dersler: `millis()` ve durum makineleri\n\n### \"İşe yarıyor\" bir sayıdır\n\"Robot iyi gidiyor\" bir ölçü değildir. İki sayı yeterli bir başlangıçtır:\n\n| Ölçü | Neyi söyler? | Tek başına yanıltır mı? |\n|---|---|---|\n| Yol (m) | Robot gerçekten ilerliyor mu? | Evet: duvara çarparak da çok yol alabilir |\n| Çarpma sayısı | Güvenli mi? | Evet: hiç kıpırdamayan robot da hiç çarpmaz |\n\nİkisini birlikte oku. Çarpma az ve yol da azsa robot çoğu zaman duruyordur.\n\n### Çarpmayı doğru say\nBenzetimde robot duvara değerken bayrak (`collided`) süre boyunca doğrudur. Her turda sayarsan tek bir temas yüzlerce çarpma gibi görünür. Çözüm 8. dersteki kenar algılamadır: bayrağın **yanlıştan doğruya** geçtiği anı say.\n\n### Eşiği ölçümden çıkar\nProjede ölçüt: 30-35 saniyede en az 3 m yol ve en fazla 3 çarpma. Eşik şöyle seçildi: robot 0,2 m/s gider; hiç durmasa 35 saniyede 7 m yapardı. Ama her engel döngüsü (dur, tara, dön) yaklaşık 2,2 saniye ilerlemeyi keser. Örnek hesap: 5 döngü 11 saniye eder, geriye 24 saniye kalır ve en çok 24 × 0,2 = 4,8 m gidilir. Ölçülen en düşük sonuç 4,0 m idi; eşik 3 m seçildi. Ölçüt 7 m olsaydı hiçbir şey geçemezdi, 1 m olsaydı hiçbir şey ölçmezdi.\n\n### Ek koruma: sıkışma ve acil durdurma\n- **Sıkışma denetimi:** Robot ileri giderken mesafe değişmelidir. 1,5 saniye boyunca 6 cm'den az değiştiyse robot bir yere takılmıştır ve geri çekilir. Hız 0,2 m/s ise 6 cm'lik değişim yaklaşık 0,3 saniyede olur; 1,5 saniye bunun çok üstündedir.\n- **Acil durdurma:** Seri porttan `x` gelince motorlar durur, `g` gelince yeniden başlanır. Başlarken durum makinesini temiz bir başlangıca (`gec(ILERI)`) al; yoksa robot yarım kalan hareketten devam eder.\n\n### Özet\nBir robotun başarısını yol ve çarpma sayısı gibi ölçülebilir iki sayıyla izle. Çarpmayı kenar algılamayla say, eşiği ölçümlerden türet. Sıkışma denetimi ve acil durdurma, kodun sensörün göremediği durumlara karşı koruma katmanıdır. Eşiği \"bizim arenaya mı uyuyor, robot gerçekten iyi mi?\" diye sorgula.",
          "concepts": [
            {
              "term": "Başarı ölçütü",
              "definition": "Robotun işe yarayıp yaramadığını sayıyla söyleyen koşul: ör. 30-35 saniyede en az 3 m yol ve en fazla 3 çarpma.",
              "example": "Robot 4,2 m yol aldı ve 1 kez çarptı; ölçüt sağlandı.",
              "pitfall": "\"Çok iyi gidiyor\" demek ve hiç sayı vermemek."
            },
            {
              "term": "Kenar sayma",
              "definition": "Bir bayrağın yanlıştan doğruya geçtiği anı saymak; süre boyunca doğru kalması tek olay sayılır.",
              "example": "collided doğru olmaya başladığı anda sayaç bir artar.",
              "pitfall": "Bayrak doğru olduğu sürece her turda saymak: bir temas yüzlerce çarpma gibi görünür."
            },
            {
              "term": "Eşik türetme",
              "definition": "Başarı sınırını, ölçülen sonuçların biraz altına koymak.",
              "example": "Ölçülen en düşük yol 4,0 m idi; eşik 3 m seçildi.",
              "pitfall": "Eşiği ölçüm yapmadan, robotun geçmesini istediğin bir sayıya ayarlamak."
            },
            {
              "term": "Sıkışma denetimi",
              "definition": "ILERI sırasında mesafe belli süre boyunca belli miktardan az değişirse robotun takıldığını varsayıp geri çekmek.",
              "example": "1,5 saniye boyunca mesafe 6 cm değişmediyse SIKISTI yazılır ve GERI'ye geçilir.",
              "pitfall": "Sıkışma denetimini delay ile yapmak: robot beklerken hiçbir şeye bakamaz."
            },
            {
              "term": "Acil durdurma komutu",
              "definition": "Seri porttan gelen bir karakterle motorları hemen durduran koruma.",
              "example": "x gelince calisiyor = false olur ve loop() her turda surus(0, 0) der.",
              "pitfall": "Yeniden başlatırken durum makinesini sıfırlamamak: robot yarım kalmış hareketten devam eder."
            }
          ],
          "quiz": [
            {
              "id": "m5h2d5-q1",
              "kind": "mcq",
              "prompt": "Arkadaşın robotunun çok iyi olduğunu söylüyor. Hangi iki ölçümü isteyip birlikte okursun?",
              "options": [
                "Pil voltajı ve tekerlek rengi",
                "Kat edilen yol ve çarpma sayısı",
                "Yalnızca çarpma sayısı",
                "Sketch'in satır sayısı ve seri hızı"
              ],
              "answer": 1,
              "explanation": "Yol robotun gerçekten ilerlediğini, çarpma sayısı güvenliğini gösterir. Tek başına çarpma sayısı yanıltır: hiç kıpırdamayan robotun çarpması sıfırdır. Pil, renk ve satır sayısı davranışın kalitesini ölçmez.",
              "skills": [
                "rob-measure"
              ]
            },
            {
              "id": "m5h2d5-q2",
              "kind": "numeric",
              "prompt": "Robot 0,2 m/s gidiyor. 35 saniyelik koşuda 5 engel döngüsü yaşanıyor ve her biri 2,2 saniye boyunca robotu ilerletmiyor. Robot en çok kaç metre yol alabilir?",
              "answer": 4.8,
              "tolerance": 0.01,
              "unit": "m",
              "explanation": "5 × 2,2 = 11 saniye durulur; 35 − 11 = 24 saniye ilerlenir. 24 × 0,2 = 4,8 m. Gerçek koşuda geri çekilmeler ve dönüşler de yolu kısaltabilir, bu yüzden hesap üst sınırdır.",
              "skills": [
                "rob-measure",
                "prog-timing"
              ]
            },
            {
              "id": "m5h2d5-q3",
              "kind": "numeric",
              "prompt": "Sıkışma denetimi mesafedeki 6 cm'lik değişime bakıyor. Robot 0,2 m/s ile engele doğru ilerliyorsa mesafe 6 cm değişmesi kaç saniye sürer?",
              "answer": 0.3,
              "tolerance": 0.01,
              "unit": "s",
              "explanation": "Süre = yol / hız = 0,06 m / 0,2 m/s = 0,3 s. Denetim 1,5 saniye beklediği için normal ilerleyen robot hep bu sınırın çok altında kalır; yalnız gerçekten takılan robot 1,5 saniye boyunca sabit mesafe görür.",
              "skills": [
                "rob-measure",
                "rob-threshold"
              ]
            },
            {
              "id": "m5h2d5-q4",
              "kind": "predict-output",
              "prompt": "Ölçümler 50 ms'de bir geliyor, TAKILMA_MS = 200. Bu kod ne yazar?\n\n```\nconst unsigned long TAKILMA_MS = 200;\nint olcum[6] = {60, 58, 59, 57, 58, 59};\nint ilerlemeCm = -100;\nunsigned long ilerlemeZaman = 0;\n\nfor (int i = 0; i < 6; i++) {\n  unsigned long simdi = i * 50UL;\n  int cm = olcum[i];\n  if (abs(cm - ilerlemeCm) >= 6) {\n    ilerlemeCm = cm;\n    ilerlemeZaman = simdi;\n  } else if (simdi - ilerlemeZaman >= TAKILMA_MS) {\n    Serial.println(i);\n    break;\n  }\n}\n```",
              "options": [
                "3",
                "5",
                "Hiçbir şey yazmaz",
                "4"
              ],
              "answer": 3,
              "explanation": "i = 0'da ilerlemeCm −100 olduğundan fark büyüktür: ilerlemeCm = 60, ilerlemeZaman = 0 olur. Sonraki ölçümler 60'tan en çok 3 cm ayrılır, yani 'ilerleme' sayılmaz. i = 4'te simdi = 200 ve 200 − 0 >= 200 sağlanır; 4 yazılır. i = 3'te simdi = 150 henüz yetmez.",
              "skills": [
                "rob-measure",
                "rob-threshold",
                "prog-debug"
              ]
            },
            {
              "id": "m5h2d5-q5",
              "kind": "find-bug",
              "prompt": "Robot x ile durduruluyor ama g ile yeniden başlatınca bazen dönüşün ortasından devam ediyor, bazen bir durumu atlıyor. Kodda tek hata var. Nedir?\n\n```\nvoid komutOku() {\n  while (Serial.available() > 0) {\n    char c = Serial.read();\n    if (c == 'x') { calisiyor = false; }\n    if (c == 'g') { calisiyor = true; }\n  }\n}\n```",
              "options": [
                "while yerine if kullanılmalı",
                "Serial.read() sonrası delay eklenmeli",
                "x komutu calisiyor = true yapmalı",
                "g komutu durum makinesini sıfırlamıyor; gec(ILERI) çağrılmalı"
              ],
              "answer": 3,
              "explanation": "Durdurulduğunda durum ve durumBasi olduğu gibi kalır. Yeniden başlatılınca robot yarım kalan durumdan devam eder; geçen süre durumBasi'ya göre hesaplandığından süreli durum hemen bitmiş de sayılabilir. g gelince gec(ILERI) çağrılırsa temiz bir başlangıç yapılır. while döngüsü gelen tüm karakterleri okumak için doğrudur; delay gerekmez.",
              "skills": [
                "rob-fsm",
                "rob-measure",
                "prog-debug"
              ]
            }
          ]
        }
      ]
    },
    {
      "title": "Çizgi",
      "project": "Çizgi izleyen robot",
      "guideMd": "### Hafta hedefleri\nBu haftanın sonunda öğrenci:\n1. Yansımalı IR sensörün çizgiyi nasıl okuduğunu anlatır; beş sensörü dizi ve `for` ile okuyup eşikle 0/1 desenine çevirir ve çizgi konumunu (−2…+2) bulur.\n2. Sensör aralığı ile çizgi genişliğinden kör bölgeyi hesaplar.\n3. Min/max ölçerek her sensör için eşiği `(min + max) / 2` ile bulur; sabit eşiğin ışık değişince neden yanıldığını açıklar.\n4. Bang-bang kontrolü ve `sonYon` hafızasını uygular; iki eşikli (histerezisli) kararı kullanır.\n5. Boşluk, dik viraj ve kavşağı durum makinesiyle yönetir; her aramaya süre sınırı koyar.\n6. Bütün parçaları tek programda birleştirip robotun tur süresini ve çizgiyi görmediği süreyi ölçer, hız ile güvenilirlik arasındaki ödünleşimi yorumlar.\n\n### Haftanın planı\nHafta beş derstir. Aşağıdaki plan günde bir ders içindir; proje dersi biraz daha uzundur.\n\n| Gün | Ders | Süre | Ne yapılır |\n|---|---|---|---|\n| 1 | Yansımalı IR sensör ve çizgi okuma | ~20 dk | Anlatımı oku, ham okumayı ve deseni çalıştır, kör bölgeyi bul, mini testi çöz. |\n| 2 | Kalibrasyon: min/max ve eşik | ~25 dk | Sallanarak kalibrasyonu çalıştır, ışık örneğinde sabit ve kalibreli eşiği karşılaştır. |\n| 3 | Bang-bang çizgi izleme ve histerezis | ~25 dk | Tek sensörlü ve beş sensörlü programı karşılaştır, kayıp süresini oku. |\n| 4 | Kavşak, keskin viraj ve çizgi kaybı | ~25 dk | Boşluk, dik viraj ve T kavşağını dene; `BOSLUK_MS` ve karar değerini değiştir. |\n| 5 | Proje: Çizgi izleyen robot (pist) | ~35 dk | Programı pistte çalıştır, `HIZ` değerini değiştirip raporu karşılaştır, ölçütle değerlendir. |\n\n### Ön koşul kontrolü\nBu hafta Modül 3 ve Modül 5'in ilk haftası (77. ve 78. dersler dahil) gerekir. Başlamadan önce şunları kontrol et:\n- `analogRead` ile 0-1023 arası okuma yapabiliyor mu? (Modül 3, 11. ders)\n- Dizi ve `for` döngüsünü kullanabiliyor mu? (4. ders)\n- `millis()` ve `enum` ile durum makinesi yazabiliyor mu? (27. ve 28. dersler)\n- Motoru yön + PWM ile sürebiliyor mu ve ölü bölgeyi biliyor mu? (77. ve 78. dersler)\n- Serial Monitor'de değer okuyabiliyor mu? (9. ders)\n\n### Kavram haritası\n- **Algılama:** yansımalı IR sensör → `analogRead` → eşik → bit deseni → çizgi konumu → kör bölge\n- **Kalibrasyon:** min ve max → `(min + max) / 2` → her sensör için ayrı eşik → sallanma koşulları\n- **Karar:** bang-bang → `sonYon` hafızası → iki eşikli karar (histerezis) → zigzag ve kayıp süresi\n- **Zor durumlar:** boşluk, viraj aşımı, kavşak → `IZLE`, `BOSLUK`, `ARAMA`, `DUR` → süre sınırı\n- **Proje:** kalibrasyon + izleme + kurtarma + bitiş → ölçüm (tur, kayıp, en uzun kesinti) → hız ödünleşimi\n\n### Sık yapılan hatalar\n- **Sensör sırasını karıştırmak.** A0 en soldur; ters sanılırsa robot hep ters yöne döner.\n- **Modülün yönünü kontrol etmemek.** Çizgi alçak okuyorsa `>` tersine çalışır; önce ham değerlere bak.\n- **Eşiği tahminle seçmek.** Işık değişince karar bozulur; eşiği ölç.\n- **`enAz` ve `enCok` başlangıcını ters yazmak.** Min ve max hiç güncellenmez.\n- **Sallanma PWM'ini ölü bölgenin altında bırakmak.** Robot dönmez, kalibrasyon yanlış çıkar.\n- **Çizgi kaybolunca `sonYon`'u sıfırlamak.** Hafıza silinir, robot virajı kaçırır.\n- **Kavşakta hemen dönmek.** Sensör dizisi aksın önündedir; önce kısa süre ileri git.\n- **Aramayı sınırsız bırakmak.** Çizgi yoksa robot sonsuza dek döner; süre dolunca dur.\n- **`sonTur`'u güncellememek.** Kayıp süresi kat kat fazla çıkar.\n- **Hızı artırıp süreleri aynı bırakmak.** Aynı sürede daha uzun yol alınır.\n\n### Hafta sonu tekrarı\n1. Her dersin kavram kartlarına bir kez daha bak ve \"sık yapılan yanlış\" satırlarını yüksek sesle oku.\n2. Mini testlerde yanlış yaptığın soruların açıklamalarını yeniden oku, sonra soruyu yeniden çöz.\n3. Elle bir tablo çiz: çizginin yedi farklı konumu için (merkez sensör hizasında, iki sensör arasında, uçta) beş bitlik deseni yaz.\n4. Işığın arttığı bir durum uydur (zemin ve çizgi için iki sayı seç) ve sabit eşik ile kalibreli eşiğin sonucunu karşılaştır.\n5. Kendi cümlelerinle şu soruyu cevapla: \"Çizgi kaybolduğunda robot boşluk mu olduğunu, virajı aştığını mı nasıl anlar?\"\n\nHafta sonu testi olarak beş dersin mini testleri yeterlidir; her derste 5 soru, toplam 25 soru. Hedef: her dersten en az 4 doğru. Eksik kalan dersin anlatımına dön.\n\n### Proje değerlendirme ölçütü (Çizgi izleyen robot)\n| Ölçüt | Gelişmeli | Yeterli | İleri |\n|---|---|---|---|\n| Kalibrasyon | Eşikler elle yazılmış ya da kalibrasyon hata veriyor | Robot sallanıyor, min/max ölçülüyor ve eşikler yazılıyor | Kontrast denetimini ve nedenini açıklıyor, sallanma süresini ölçerek seçmiş |\n| İzleme | Robot çizgiyi sık kaybediyor ya da pisti bitiremiyor | Robot pisti bitiriyor ve bitişte duruyor | Kayıp süresi hafızasız sürümden belirgin biçimde düşük, bunu ölçümle gösteriyor |\n| Kurtarma | Boşlukta ya da virajda takılıyor | Boşluk geçiliyor, çizgi bulunamazsa duruyor | Süreleri hıza göre yeniden ayarlamış, nedenini anlatıyor |\n| Ölçüm | Rapor satırı yok | Tur süresi, kayıp ve en uzun kesinti raporda | En az üç `HIZ` değeri için tablo çıkarmış ve yorumlamış |\n| Anlatım | Ne yaptığını anlatamıyor | Durumları ve geçişleri adım adım anlatıyor | Hata yapıp nasıl bulduğunu anlatıyor |\n\n### Veli ve öğretmen notu\n- **Amaç.** Bu hafta robotun \"çalışması\" kadar, çalışmadığı yeri bulup ölçmeyi öğrenmektir. Robotun çizgiyi kaybetmesi başarısızlık değil, veri toplama fırsatıdır.\n- **Nasıl destek olunur?** Cevabı söylemek yerine şunları sor: \"Sensörler şu an ne görüyor, deseni yazdırdın mı?\", \"Çizgi en son hangi taraftaydı?\", \"Hızı değiştirince hangi sayı değişti?\"\n- **Süre.** Dersleri aralıklı çalışmak kalıcılığı artırır. Proje gününde sabırlı olunmalı; ayar çoğu zaman birkaç deneme ister.\n- **Gerçek robotla fark.** Burada her şey sanaldır. Gerçek robotta okumalar titrer, pil gerilimi düştükçe hız değişir, ortam ışığı (güneş ışığı kızılötesi de içerir) değerleri kaydırır; süreler ve eşikler yeniden ayarlanmalıdır.\n- **Güvenlik.** Gerçek robota geçilirse motorlar için harici güç ve ortak GND kullanılır; pil ters bağlanmaz, uçları kısa devre edilmez. Şebeke gerilimiyle (220 V) hiçbir devre kurulmaz. Hata durumunda robotun durması güvenli varsayılandır.\n- **İlerleme.** Dersin sonundaki mini test sonuçları \"İlerlemem\" sayfasında beceri bazında görünür (taslak özellik; yalnız onay verildiyse kaydedilir).",
      "lessons": [
        {
          "title": "Yansımalı IR sensör ve çizgi okuma",
          "durationMin": 20,
          "problem": "Yerdeki siyah bantı sürekli takip eden depo robotlarını gördün mü? Gözleri yoktur, ama yere bakan küçük sensörleri vardır. Sensör yerden yansıyan kızılötesi ışığı ölçer. Bant ile zemin ışığı farklı yansıttığı için robot \"şu an bandın üstündeyim\" diyebilir. Peki beş sensörden hangisinin bandı gördüğünü, yani bandın robotun neresinde olduğunu nasıl anlarsın?",
          "contentMd": "### Sensör nasıl çalışır?\nTCRT5000 gibi yansımalı sensörde yan yana iki küçük parça durur: bir kızılötesi (IR) LED ve bir fototransistör. LED yere ışık gönderir, yüzey ışığı ne kadar yansıtırsa fototransistör o kadar akım geçirir. Açık renkli ve parlak yüzey çok, koyu ve mat yüzey az yansıtır. Sensör modülünün analog çıkışı bu farkı bir gerilime çevirir.\n\nBu derste kullandığımız devrede **çizgi üstünde okuma yüksek, zeminde düşüktür**: çizgi üstünde yaklaşık 4,2 V (`analogRead` ≈ 860), zeminde yaklaşık 0,8 V (≈ 164). Gerçek modüllerde yön tersi olabilir; hangi modülü aldıysan önce ham değerlere bak, sonra kodu ona göre yaz.\n\n### Devre\nRobotun önüne, yere doğru bakacak biçimde beş sensör sıralanır. Sensörler 2,4 cm arayla yan yana durur, aks hizasından 7 cm öndedir. Çizgi genişliği 2 cm'dir. Sensörlerin yerden yüksekliği birkaç milimetre olmalıdır; kesin mesafeyi parçanın veri sayfasından kontrol et.\n\n| Parça | Bağlantı |\n|---|---|\n| Sensör 0 (en sol) | AO → **A0**, VCC → 5 V, GND → GND |\n| Sensör 1 | AO → **A1** |\n| Sensör 2 (orta) | AO → **A2** |\n| Sensör 3 | AO → **A3** |\n| Sensör 4 (en sağ) | AO → **A4** |\n\nSıra önemlidir: robota arkadan, ilerleme yönüne bakarken A0 en solda, A4 en sağdadır. Bu sırayı bir kez karar verip bütün kodda kullan. Sürücü ve motor bağlantıları bu derste kullanılmıyor; sonraki derslerde standart bağlantılarla ekleyeceğiz.\n\n### Program: ham okuma\nÖnce sensörlerin ne söylediğine bak. Beş değeri tek satırda yazdıran program:\n\n```cpp\n// sketch: sensor_ham\nconst int SENSOR_SAYISI = 5;\nconst int SENSOR_PIN[SENSOR_SAYISI] = {A0, A1, A2, A3, A4};\n\nvoid setup() {\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  for (int i = 0; i < SENSOR_SAYISI; i++) {\n    Serial.print(analogRead(SENSOR_PIN[i]));\n    if (i < SENSOR_SAYISI - 1) {\n      Serial.print(' ');\n    }\n  }\n  Serial.println();\n  delay(200);\n}\n```\n\nRobotu çizgiye ortalı koyarsan `164 164 860 164 164` gibi bir satır görürsün: ortadaki sensör çizgide (yüksek), diğerleri zeminde (düşük).\n\n### Program: dijital eşikleme ve çizgi konumu\nHam sayılarla uğraşmak yerine her sensör için tek bir soru sorarız: \"çizgide mi?\" Bunu tek bir **eşik** ile yaparız: okuma eşikten büyükse 1 (çizgi), değilse 0 (zemin). Zemin 164, çizgi 860 olduğuna göre ikisinin ortasındaki 512 makul bir başlangıç eşiğidir.\n\nSonra beş bitlik bir desen çıkar (`00100`). Tek sensör çizgideyse konumu −2…+2 aralığında söyleriz: **negatif = çizgi solda**, 0 = ortada, pozitif = sağda.\n\n```cpp\n// sketch: sensor_desen\nconst int SENSOR_SAYISI = 5;\nconst int SENSOR_PIN[SENSOR_SAYISI] = {A0, A1, A2, A3, A4};\nconst int ESIK = 512;\n\nvoid setup() {\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  int sayi = 0;       // kac sensor cizgide\n  int ilk = -1;       // cizgiyi gorenlerden ilkinin numarasi\n\n  for (int i = 0; i < SENSOR_SAYISI; i++) {\n    bool cizgide = analogRead(SENSOR_PIN[i]) > ESIK;\n    if (cizgide) {\n      Serial.print('1');\n      sayi++;\n      if (ilk < 0) {\n        ilk = i;\n      }\n    } else {\n      Serial.print('0');\n    }\n  }\n\n  if (sayi == 0) {\n    Serial.println(\" cizgi yok\");\n  } else if (sayi == 1) {\n    Serial.print(\" konum=\");\n    Serial.println(ilk - 2);          // A0 -> -2, A2 -> 0, A4 -> +2\n  } else {\n    Serial.println(\" birden cok sensor\");\n  }\n  delay(200);\n}\n```\n\n### Nasıl çalışıyor?\n1. `SENSOR_PIN` dizisi sensörleri soldan sağa sıralar. `for` döngüsü beşini aynı kodla okur (4. derste gördüğün diziler).\n2. `analogRead(...) > ESIK` bir `bool` üretir. Böylece sayıyı \"çizgi var/yok\" bilgisine çevirmiş olursun.\n3. `ilk - 2` işlemi sensör numarasını (0…4) konuma (−2…+2) çevirir. Ortadaki sensör 2 numaradır, konumu 0'dır.\n4. Çizgi 2 cm genişliğinde, sensörler 2,4 cm arayla durur. Bir sensör, çizginin merkezine 1 cm'den (çizginin yarı genişliği) yakınsa çizgiyi görür. Çizginin merkezi komşu iki sensörün arasında, ikisinden de 1 ile 1,4 cm uzakta kalırsa iki sensör de zemin görür: `00000`. Bu yaklaşık 4 mm'lik bir **kör bölgedir**. Sensör aralığı çizgi genişliğinden büyük olduğu sürece böyle bir kör bölge kalır. Çizgi 3 cm olsaydı aynı konumda iki yan yana sensör birden `1` verirdi ve program \"birden cok sensor\" yazardı.\n\n### Dene\n- `ESIK` değerini 100 yap. Zemin okuması 164 olduğuna göre beş sensör de `1` verir. Eşik çok düşükse neden her yer \"çizgi\" olur?\n- `ESIK` değerini 900 yap. Çizgi 860 okuduğu için artık çizgiyi hiç göremezsin. Eşiği hangi aralıkta seçebilirsin?\n- Robotu çizginin 1,2 cm yanına koy ve deseni izle. Kör bölgeyi buldun mu?\n\n### Sık yapılan hatalar\n- Sensör sırasını karıştırmak: A0'ı sağ sanarsan robot bütün sonraki derslerde ters yöne döner.\n- Modülün çıkışı ters (çizgi alçak okuyor) olduğu halde `>` kullanmak. Önce ham değerlere bak.\n- Bütün kodu tek bir sayıya (\"512\") bağlamak. Işık ya da zemin değişince bu sayı yanlış çıkar; sonraki derste eşiği ölçerek bulacağız.\n- Sensörü yerden çok yükseğe takmak: yansıma azalır, çizgi ile zemin arasındaki fark küçülür.\n\n### Gerçek robotta farklı olabilecekler\nBenzetimdeki sensör gürültüsüz ve her zaman 0,8 V / 4,2 V verir. Gerçek TCRT5000'de çizgi ve zemin rengi, bandın parlaklığı, sensörün yerden yüksekliği ve ortam ışığı (güneş ışığı kızılötesi de içerir) değerleri değiştirir. Okumalar iki sabit sayı olmaz, titrer.",
          "question": "Beyaz bir zeminde siyah bant yerine parlak, yansıtıcı bir bant kullansan sensörün okuması nasıl değişirdi? Robotun programında neyi değiştirmen gerekirdi?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Yansımalı IR sensörün yerdeki çizgiyi nasıl \"gördüğünü\"\n- Beş sensörü bir dizi ve `for` döngüsüyle okumayı\n- Okumayı bir eşikle \"çizgi var / yok\" bilgisine çevirmeyi\n- Beş bitlik desenden çizginin robotun neresinde olduğunu bulmayı\n- Sensör aralığı yüzünden neden bir kör bölge kaldığını\n\n### Önceden bilmen gerekenler\n- 4. ders: diziler ve `for` döngüsü (ilk eleman 0 numaralıdır)\n- 9. ders: `Serial.print` ile değer yazdırmak\n- 11. ders: `analogRead` ve 0-1023 arası ADC değeri\n- 12. ders: sensörün direnci ya da akımı bir gerilime çevrilir; Arduino yalnız gerilimi okur\n\n### Sensör ne ölçer?\nYansımalı IR sensör (örneğin TCRT5000) yan yana iki parçadan oluşur: yere kızılötesi ışık gönderen bir LED ve geri dönen ışığı ölçen bir fototransistör. Yüzey ışığı ne kadar farklı yansıtırsa okuma o kadar değişir. Modülün analog çıkışı bu farkı gerilime çevirir; Arduino da onu `analogRead` ile sayıya.\n\nBu derste kullandığımız devrede çizgi üstü yüksek, zemin düşük okunur:\n\n| Yüzey | Gerilim | `analogRead` |\n|---|---|---|\n| Çizgi | yaklaşık 4,2 V | yaklaşık 860 |\n| Zemin | yaklaşık 0,8 V | yaklaşık 164 |\n\nBazı modüllerde yön tersidir. Bu yüzden önce ham değerlere bak, karşılaştırmayı sonra yaz.\n\n### Beş sensör, bir dizi\nSensörler robotun önünde yere bakar ve soldan sağa A0, A1, A2, A3, A4 pinlerine bağlıdır. Aralarında 2,4 cm vardır; yani en soldaki ile en sağdaki 4 × 2,4 = 9,6 cm ayrıdır. Beşini aynı kodla okumak için pinleri bir diziye koyup `for` ile gezersin. Sıra bir kez seçilir ve bütün kodda aynı kalır; A0'ı sağ sanarsan robot ters yöne döner.\n\n### Eşik ve desen\nHer okumayı tek bir soruya indiririz: \"eşikten büyük mü?\" Büyükse `1` (çizgi), değilse `0` (zemin). Zemin 164, çizgi 860 olduğundan ikisinin ortasındaki 512 iyi bir başlangıçtır. Beş sonuç yan yana yazılınca bir **desen** çıkar:\n\n```\n00100   çizgi ortada\n01000   çizgi bir sensör solda\n00001   çizgi en sağda\n00000   çizgi görünmüyor\n```\n\nTek sensör çizgideyse konum = sensör numarası − 2 olur: −2 çok solda, 0 ortada, +2 çok sağda. Negatif sayı \"çizgi solda\" demektir.\n\n### Kör bölge\nÇizgi 2 cm geniştir. Bir sensör çizginin merkezine en çok 1 cm uzaktaysa çizgiyi görür. Sensörler 2,4 cm arayla durduğundan, merkez iki komşunun tam ortasındaysa her ikisine de 1,2 cm uzaktır ve ikisi de zemin görür: `00000`. Bu kör bölgenin genişliği 2,4 − 2 = 0,4 cm yani 4 mm'dir. Çizgi 3 cm olsaydı iki sensör birden `1` verirdi.\n\n### Özet\nYansımalı IR sensör yüzeyin ne kadar ışık yansıttığını gerilim olarak verir. Beş sensör bir dizide soldan sağa okunur, eşikle `0` ve `1`'e çevrilir ve desenden çizginin konumu çıkarılır. Eşik hiç ölçülmeden seçilirse ışık ya da zemin değişince yanılır; sensör aralığı çizgi genişliğinden büyükse de küçük bir kör bölge kalır.",
          "concepts": [
            {
              "term": "Yansımalı IR sensör",
              "definition": "Yere kızılötesi ışık gönderen bir LED ile geri dönen ışığı ölçen bir fototransistörü yan yana taşıyan sensör; okuma yüzeyin ışığı ne kadar yansıttığına göre değişir.",
              "example": "Bu derste çizgi üstünde yaklaşık 4,2 V (analogRead ≈ 860), zeminde yaklaşık 0,8 V (≈ 164) okunur.",
              "pitfall": "Her modülün aynı yönde okuduğunu sanmak; bazı modüllerde çizgi alçak okur, bu yüzden önce ham değerlere bakılır."
            },
            {
              "term": "Eşik",
              "definition": "Okumayı \"çizgi var\" (1) ya da \"çizgi yok\" (0) bilgisine çeviren sınır sayı: okuma eşikten büyükse 1.",
              "example": "Zemin 164, çizgi 860 okuyorsa ikisinin ortasındaki 512 makul bir başlangıç eşiğidir.",
              "pitfall": "Eşiği ölçmeden tahminle seçip tek sayıya bağlamak; ışık ya da zemin değişince karar bozulur."
            },
            {
              "term": "Bit deseni",
              "definition": "Beş sensörün 0/1 sonuçlarının soldan sağa yan yana yazılmış hâli.",
              "example": "00100 çizginin tam ortada olduğunu, 01000 çizginin bir sensör solda göründüğünü söyler.",
              "pitfall": "Sensör sırasını karıştırmak; A0'ı sağ sanırsan robot sonraki bütün derslerde ters yöne döner."
            },
            {
              "term": "Çizgi konumu",
              "definition": "Tek sensör çizgideyse sensör numarasından 2 çıkarılarak bulunan −2…+2 arası sayı; negatif çizginin solda olduğunu gösterir.",
              "example": "Desen 10000 ise ilk sensör 0 numaralıdır, konum 0 − 2 = −2'dir.",
              "pitfall": "Konum bulurken 2 çıkarmayı unutmak; 0…4 arası sayı ortada 0 vermez."
            },
            {
              "term": "Kör bölge",
              "definition": "Sensör aralığı çizgi genişliğinden büyük olduğu için çizgi merkezi iki sensörün arasındayken hiçbirinin çizgiyi görmediği dar şerit.",
              "example": "2,4 cm aralık ve 2 cm çizgide kör bölge 0,4 cm'dir; bu konumda desen 00000 çıkar.",
              "pitfall": "00000 görünce çizginin kesinlikle bittiğini sanmak; çizgi sensörlerin arasından geçiyor olabilir."
            }
          ],
          "quiz": [
            {
              "id": "m5h3d1-q1",
              "kind": "mcq",
              "prompt": "Yeni bir modülü bağlayıp ham değerleri yazdırdın: çizgi üstünde yaklaşık 164, zeminde yaklaşık 860 çıkıyor. Koddaki karar `analogRead(pin) > 512` şeklinde. Ne olur ve ne yapmalısın?",
              "options": [
                "Modül bozuktur, değiştirmek gerekir",
                "Desen tersine çıkar (çizgi 0, zemin 1); karşılaştırmayı `<` yapar ya da deseni tersler, kodu modüle uydurursun",
                "Hiçbir şey değişmez, çünkü eşik hâlâ ikisinin ortasındadır",
                "analogRead yerine digitalRead kullanmak gerekir"
              ],
              "answer": 1,
              "explanation": "Eşik ortada olsa da yön tersine dönmüştür: çizgi artık düşük okuyor, bu yüzden `>` ile çizgi 0, zemin 1 olur. Modül bozuk değildir; modüller yön bakımından farklı olabilir. Önce ham değerlere bakıp karşılaştırmayı ona göre yazarsın.",
              "skills": [
                "rob-line-sensor",
                "prog-debug"
              ]
            },
            {
              "id": "m5h3d1-q2",
              "kind": "numeric",
              "prompt": "Beş çizgi sensörü yan yana, komşu sensörler arası 2,4 cm olacak biçimde dizilmiş. En soldaki sensör ile en sağdaki sensör arasında kaç cm vardır?",
              "answer": 9.6,
              "tolerance": 0.01,
              "unit": "cm",
              "explanation": "Beş sensör arasında beş değil dört aralık vardır: 4 × 2,4 = 9,6 cm. Aralık sayısı, sensör sayısından bir eksiktir.",
              "skills": [
                "rob-line-geometry"
              ]
            },
            {
              "id": "m5h3d1-q3",
              "kind": "predict-output",
              "prompt": "Dizi, sensörlerden okunan beş değeri temsil ediyor. Bu kod seri monitöre ne yazar?\n\n```\nint v[5] = {160, 870, 170, 165, 162};\nconst int ESIK = 512;\n\nvoid setup() {\n  Serial.begin(9600);\n  int ilk = -1;\n  for (int i = 0; i < 5; i++) {\n    bool cizgide = v[i] > ESIK;\n    Serial.print(cizgide ? '1' : '0');\n    if (cizgide && ilk < 0) ilk = i;\n  }\n  Serial.print(\" konum=\");\n  Serial.println(ilk - 2);\n}\nvoid loop() {}\n```",
              "options": [
                "01000 konum=-1",
                "01000 konum=1",
                "10000 konum=-2",
                "00100 konum=0"
              ],
              "answer": 0,
              "explanation": "Yalnız v[1] = 870 eşikten büyüktür, desen 01000 olur. İlk çizgi gören sensör 1 numaradır; konum 1 − 2 = −1, yani çizgi solda. İşareti ters sanmak (konum=1) en sık yapılan hatadır.",
              "skills": [
                "rob-line-pattern",
                "prog-loops-arrays"
              ]
            },
            {
              "id": "m5h3d1-q4",
              "kind": "find-bug",
              "prompt": "Bu kod beş sensörü okuyup tek satırda yazdırmak için yazıldı ama bir yerde hata var. Hata nedir?\n\n```\nconst int SENSOR_SAYISI = 5;\nconst int SENSOR_PIN[SENSOR_SAYISI] = {A0, A1, A2, A3, A4};\n\nvoid setup() {\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  for (int i = 0; i <= SENSOR_SAYISI; i++) {\n    Serial.print(analogRead(SENSOR_PIN[i]));\n    Serial.print(' ');\n  }\n  Serial.println();\n  delay(200);\n}\n```",
              "options": [
                "analogRead için önce her pine pinMode(INPUT) yazmak zorunludur",
                "SENSOR_PIN dizisi const olarak tanımlanamaz",
                "for koşulu `i <= 5` olduğu için altıncı turda SENSOR_PIN[5] diziden taşar; son geçerli indeks 4'tür",
                "delay(200) çok kısadır, sensör bu sürede okunamaz"
              ],
              "answer": 2,
              "explanation": "Dizide 0'dan 4'e kadar beş eleman vardır. `i <= SENSOR_SAYISI` koşulu i = 5 için de çalışır ve diziden taşan, anlamsız bir pini okur. Doğrusu `i < SENSOR_SAYISI`. analogRead için pinMode gerekmez ve 200 ms bir okuma için fazlasıyla yeterlidir.",
              "skills": [
                "prog-loops-arrays",
                "prog-debug"
              ]
            },
            {
              "id": "m5h3d1-q5",
              "kind": "numeric",
              "prompt": "Çizgi 2 cm geniştir ve bir sensör çizginin merkezine en çok 1 cm uzaktaysa çizgiyi görür. Komşu sensörler arası 2,4 cm ise, çizgi merkezinin hiçbir sensör tarafından görülmediği kör bölgenin genişliği kaç mm'dir?",
              "answer": 4,
              "tolerance": 0.1,
              "unit": "mm",
              "explanation": "Her sensörün gördüğü şerit 2 cm genişliğindedir. Komşu iki sensörün şeritleri arasında 2,4 − 2,0 = 0,4 cm kalır; bu 4 mm'dir. Çizgi merkezi bu aralıktayken desen 00000 çıkar.",
              "skills": [
                "rob-line-geometry",
                "rob-line-pattern"
              ]
            }
          ]
        },
        {
          "title": "Kalibrasyon: min/max ve eşik",
          "durationMin": 25,
          "problem": "Robotunu evde, akşam lambasının altında çizgiye oturttun ve harika çalıştı. Ertesi gün okulda pencere kenarında denedin: robot çizgiyi hiç görmüyor, sanki her yer çizgiymiş gibi davranıyor. Programın aynı, robot aynı. Değişen tek şey ortam ışığı. Sensör, değişen ışığa nasıl uyum sağlar?",
          "contentMd": "### Fikir: eşiği ölç, tahmin etme\n86. derste eşiği elle 512 seçtik. Bu sayı yalnızca zeminin 164, çizginin 860 okuduğu durumda doğru. Işık, yüzey ya da sensör yüksekliği değişirse zemin ve çizgi okumaları da kayar.\n\n**Kalibrasyon** şudur: robot çalışmaya başlamadan önce her sensörün gördüğü **en küçük** (min, zemin) ve **en büyük** (max, çizgi) değeri ölçeriz. Eşik, bu ikisinin ortasıdır:\n\n`esik = (min + max) / 2`\n\nHer sensör için ayrı min, max ve eşik tutarız. Çünkü beş sensör birbirinin aynısı değildir; biri biraz daha duyarlı, biri biraz daha yukarıda olabilir.\n\n### Devre\nStandart bağlantılar (Modül 5 ortak düzeni):\n\n| Parça | Bağlantı |\n|---|---|\n| Çizgi sensörleri 0…4 | AO → **A0…A4**, VCC → 5 V, GND → GND |\n| Sol motor | EN **D5** (PWM), IN1 **D7**, IN2 **D8** |\n| Sağ motor | EN **D6** (PWM), IN3 **D9**, IN4 **D10** |\n\nMotorlar ve sürücü için harici güç kullan; Arduino'nun 5 V çıkışından besleme. Pil ve sürücü GND'si Arduino GND'sine bağlı olmalı (ortak GND). Pili ters bağlama, uçlarını kısa devre etme.\n\n### Program: sallanarak kalibrasyon\nRobotu çizginin üstüne, çizgi ortada olacak şekilde koy. Program başladığında robot yerinde sola, sonra sağa, sonra tekrar sola dönerek sallanır. Bu sırada her sensör bir an çizgiyi, bir an zemini görür. Sallanma bitince programın min, max ve eşikleri yazar, sonra her 300 ms'de çizgi desenini bildirir.\n\nMotoru süren `motor(sol, sag)` işlevi, 77. derste gördüğün yön + PWM mantığındadır: işaret yönü, büyüklük hızı seçer. Ölü bölge nedeniyle PWM'in 51'in (≈ %20) altında tekerlek dönmez (78. ders); sallanma için 120 kullanıyoruz.\n\n```cpp\n// sketch: kalib_salla\nconst int SOL_EN = 5, SOL_IN1 = 7, SOL_IN2 = 8;\nconst int SAG_EN = 6, SAG_IN3 = 9, SAG_IN4 = 10;\nconst int SENSOR_SAYISI = 5;\nconst int SENSOR_PIN[SENSOR_SAYISI] = {A0, A1, A2, A3, A4};\nconst int SALLA_PWM = 120;\nconst unsigned long KALIBRASYON_MS = 1800;\n\nint enAz[SENSOR_SAYISI];\nint enCok[SENSOR_SAYISI];\nint esik[SENSOR_SAYISI];\nbool hazir = false;\nunsigned long sonYazi = 0;\n\nvoid motor(int sol, int sag) {\n  digitalWrite(SOL_IN1, sol > 0);\n  digitalWrite(SOL_IN2, sol < 0);\n  analogWrite(SOL_EN, abs(sol));\n  digitalWrite(SAG_IN3, sag > 0);\n  digitalWrite(SAG_IN4, sag < 0);\n  analogWrite(SAG_EN, abs(sag));\n}\n\nvoid sallan(unsigned long t) {\n  if (t < 400) motor(-SALLA_PWM, SALLA_PWM);          // sola don\n  else if (t < 1200) motor(SALLA_PWM, -SALLA_PWM);    // saga don\n  else if (t < 1600) motor(-SALLA_PWM, SALLA_PWM);    // basa don\n  else motor(0, 0);\n}\n\nvoid setup() {\n  for (int p = 5; p <= 10; p++) {\n    pinMode(p, OUTPUT);\n  }\n  Serial.begin(9600);\n  for (int i = 0; i < SENSOR_SAYISI; i++) {\n    enAz[i] = 1023;     // gercek degerler bunlardan kucuk/buyuk olacak\n    enCok[i] = 0;\n  }\n}\n\nvoid loop() {\n  unsigned long simdi = millis();\n\n  if (simdi < KALIBRASYON_MS) {\n    sallan(simdi);\n    for (int i = 0; i < SENSOR_SAYISI; i++) {\n      int v = analogRead(SENSOR_PIN[i]);\n      if (v < enAz[i]) enAz[i] = v;\n      if (v > enCok[i]) enCok[i] = v;\n    }\n    return;\n  }\n\n  if (!hazir) {\n    motor(0, 0);\n    for (int i = 0; i < SENSOR_SAYISI; i++) {\n      esik[i] = (enAz[i] + enCok[i]) / 2;\n      Serial.print(\"A\");\n      Serial.print(i);\n      Serial.print(\" min=\");\n      Serial.print(enAz[i]);\n      Serial.print(\" max=\");\n      Serial.print(enCok[i]);\n      Serial.print(\" esik=\");\n      Serial.println(esik[i]);\n    }\n    hazir = true;\n  }\n\n  if (simdi - sonYazi >= 300) {\n    sonYazi = simdi;\n    for (int i = 0; i < SENSOR_SAYISI; i++) {\n      Serial.print(analogRead(SENSOR_PIN[i]) > esik[i] ? '1' : '0');\n    }\n    Serial.println();\n  }\n}\n```\n\n### Program: ışık değişince sabit eşik ile kalibreli eşik\nŞimdi ortam ışığının zemini de çizgiyi de aydınlattığı durumu düşün. Zemin 2,9 V (≈ 593), çizgi 4,6 V (≈ 941) okusun (örnek değerler). Bu sketch robotu sürmez; yalnızca iki karar yöntemini yan yana yazar. İlk 2 saniye min/max ölçer (bu süre içinde sensörleri bir çizgi üstüne, bir zemine getir). Sonra her 200 ms'de sabit eşik (512) ve kalibreli eşik ne diyor, ikisini de yazdırır.\n\n```cpp\n// sketch: kalib_isik\nconst int SENSOR_SAYISI = 5;\nconst int SENSOR_PIN[SENSOR_SAYISI] = {A0, A1, A2, A3, A4};\nconst int SABIT_ESIK = 512;\nconst unsigned long OLCUM_MS = 2000;\n\nint enAz[SENSOR_SAYISI];\nint enCok[SENSOR_SAYISI];\nint esik[SENSOR_SAYISI];\nbool hazir = false;\nunsigned long sonYazi = 0;\n\nvoid setup() {\n  Serial.begin(9600);\n  for (int i = 0; i < SENSOR_SAYISI; i++) {\n    enAz[i] = 1023;\n    enCok[i] = 0;\n  }\n}\n\nvoid loop() {\n  unsigned long simdi = millis();\n\n  if (!hazir) {\n    for (int i = 0; i < SENSOR_SAYISI; i++) {\n      int v = analogRead(SENSOR_PIN[i]);\n      if (v < enAz[i]) enAz[i] = v;\n      if (v > enCok[i]) enCok[i] = v;\n    }\n    if (simdi >= OLCUM_MS) {\n      for (int i = 0; i < SENSOR_SAYISI; i++) {\n        esik[i] = (enAz[i] + enCok[i]) / 2;\n      }\n      hazir = true;\n    }\n    return;\n  }\n\n  if (simdi - sonYazi >= 200) {\n    sonYazi = simdi;\n    Serial.print(\"sabit=\");\n    for (int i = 0; i < SENSOR_SAYISI; i++) {\n      Serial.print(analogRead(SENSOR_PIN[i]) > SABIT_ESIK ? '1' : '0');\n    }\n    Serial.print(\" kalibre=\");\n    for (int i = 0; i < SENSOR_SAYISI; i++) {\n      Serial.print(analogRead(SENSOR_PIN[i]) > esik[i] ? '1' : '0');\n    }\n    Serial.println();\n  }\n}\n```\n\n### Nasıl çalışıyor?\n1. `enAz` başlangıçta 1023, `enCok` başlangıçta 0'dır. İlk gerçek okuma bu ikisini hemen geçer; böylece \"en küçük/en büyük\" hesabı doğru başlar. Başlangıcı tersine yazarsan (min = 0) min hiç güncellenmez.\n2. Sallanırken çizgi sensörlerin altından geçer. Çizgide max, zeminde min yakalanır. Sallanmak yerine robotu elle çizgi üstünde ve dışında dolaştırmak da aynı sonucu verir; gerçek robotta çoğu zaman böyle yapılır.\n3. `(enAz + enCok) / 2` eşiği zemin ile çizgi arasının tam ortasına koyar. Normal ışıkta sallanma sonunda `min=163 max=860 esik=511` gibi satırlar çıkar.\n4. Işık yükselince zemin 593 okur. Sabit eşik 512 olduğu için zemin de \"çizgi\" sayılır: beş sensör de `1` verir, robot hiçbir şeyi ayırt edemez. Kalibreli eşik (593 ile 941'in ortası, ≈ 767) hâlâ doğru çalışır.\n5. Kalibrasyon yalnızca ışık değişimine karşı bir önlem değildir. Her sensörün kendi farkını da telafi eder; bu yüzden eşiği dizide her sensör için ayrı tutuyoruz.\n\n### Dene\n- `SALLA_PWM` değerini 40 yap. Robot sallanıyor mu? Neden? (78. dersteki ölü bölgeyi düşün.)\n- `KALIBRASYON_MS` değerini 300 yap. Sallanma bitmeden min/max alırsan eşik yine doğru çıkar mı?\n- Kalibrasyondan sonra tekrar kalibre etmek için programa bir buton (örneğin D2, `INPUT_PULLUP`) ekle. Butona basınca ölçüm yeniden başlamalı.\n\n### Sık yapılan hatalar\n- `enAz` ve `enCok` başlangıcını ters yazmak.\n- Sallanma sırasında robotu çizgiden uzak bir yere koymak: sensör çizgiyi hiç görmez, max zemin değerinde kalır ve eşik çizgiyi ayıramaz.\n- Sallanmayı erken bitirmek ya da robotu hiç döndürememek. `KALIBRASYON_MS = 300` iken robot sola dönerken ölçüm biter; A0 ve A1 çizgiyi hiç görmez, min ile max eşit (163) kalır ve eşik 163 olur. Zemindeki en küçük titreme bile \"çizgi\" sayılır. Robot da 38° dönmüş halde kalır.\n- `SALLA_PWM` ölü bölgenin altında (40) kalırsa robot kıpırdamaz. A2 hep 860 okur: min = max = 860, eşik 860 olur ve `860 > 860` yanlıştır. Robot çizginin tam üstünde olduğu halde desen `00000` çıkar.\n- Tek bir eşiği beş sensöre uygulamak. Sensörler birbirinden farklı çıkabilir.\n- Kalibrasyondan sonra ortam ışığı belirgin biçimde değişirse eski eşiğe güvenmek.\n\n### Gerçek robotta farklı olabilecekler\nBenzetimde beş sensör birebir aynıdır; bu yüzden hepsinin min/max'ı aynı çıkar. Gerçek robotta her sensörün kendi min/max'ı vardır ve okumalar titrer. Titreyen bir sinyalde tek bir anormal okuma min ya da max'ı bozabilir; birkaç okumanın ortalamasını almak yardımcı olur.",
          "question": "Kalibrasyonu robot her açıldığında mı yapmalı, yoksa bir kez yapıp sonucu EEPROM'a (34. ders) mı yazmalısın? Her iki yaklaşımın iyi ve kötü yanı ne?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Sabit bir eşiğin ışık değişince neden yanıldığını\n- Her sensör için en küçük (min) ve en büyük (max) değeri ölçmeyi\n- Eşiği `(min + max) / 2` ile hesaplamayı\n- Robotu sallayarak kalibrasyon yapmayı ve bunun koşullarını\n\n### Önceden bilmen gerekenler\n- 14. ders: kalibrasyon fikri (ölç, sonra o ölçüme göre karar ver)\n- 78. ders: PWM'in yaklaşık %20'nin altında (255 üzerinden 51) tekerlek dönmez\n- 86. ders: beş çizgi sensörü, `analogRead` ve eşikle 0/1 kararı\n\n### Sabit eşik neden yetmez?\n86. derste eşiği 512 seçtik. Bu sayı yalnız zemin ≈ 164, çizgi ≈ 860 okuyorsa iyidir. Ortam ışığı artarsa zemin de çizgi de yukarı kayar. Örnek: zemin 593, çizgi 941 okusun. Eşik 512'de kalırsa zemin de \"çizgi\" sayılır; desen `11111` çıkar ve robot hiçbir şeyi ayırt edemez.\n\n### Min, max ve eşik\nÇözüm: çalışmaya başlamadan önce her sensörün gördüğü en küçük değeri (min, zemin) ve en büyük değeri (max, çizgi) ölç, eşiği ikisinin tam ortasına koy:\n\n```\nesik = (min + max) / 2\n```\n\nIşıklı örnekte eşik (593 + 941) / 2 = 767 olur ve karar yine doğrudur. Normal ışıkta benzetimde min 163, max 860 ölçülür; (163 + 860) / 2 = 511,5 olur ve `int` bölmesi küsuratı atar: eşik 511. Her sensörün min ve max'ı ayrıdır, çünkü sensörler birbirinin aynısı değildir; bu yüzden eşikleri bir dizide tutarız.\n\n### Başlangıç değerleri\nEn küçüğü bulmak için `enAz` başta çok büyük (1023), `enCok` başta çok küçük (0) olmalıdır. İlk gerçek okuma ikisini de hemen geçer. Ters yazarsan (`enAz = 0`) hiçbir okuma 0'dan küçük olamaz; min hiç güncellenmez.\n\n### Sallanarak ölçmek\nMin ve max'ı yakalamak için sensörlerin hem çizgiyi hem zemini görmesi gerekir. Robot çizgi ortadayken başlar, yerinde sola, sağa, sonra tekrar sola dönerek sallanır. Bu sırada çizgi sensörlerin altından geçer. Kalibrasyonun bozulacağı üç durum:\n\n| Durum | Sonuç |\n|---|---|\n| PWM ölü bölgenin altında (örneğin 40) | Robot dönmez, A2 hep 860 okur, min = max = 860, eşik 860 olur. `860 > 860` yanlıştır, çizgi görünmez. |\n| Süre çok kısa (örneğin 300 ms) | Kenar sensörleri çizgiyi hiç görmez, min = max = 163 kalır, zemindeki titreme bile \"çizgi\" olur. |\n| Robot çizgiden uzakta başlar | Max zemin değerinde kalır, eşik çizgiyi ayıramaz. |\n\nKalibrasyon bir kez yapılır; ışık sonradan belirgin biçimde değişirse yenilenmelidir.\n\n### Özet\nSabit eşik yalnız ölçüldüğü koşulda doğrudur. Kalibrasyonda her sensörün min ve max'ı ölçülür, eşik `(min + max) / 2` ile hesaplanır. `enAz` büyük, `enCok` küçük başlar. Ölçüm ancak sensörler hem çizgiyi hem zemini gördüyse güvenilirdir; bu yüzden sallanma yeterince hızlı, yeterince uzun ve çizgi üstünde başlayan bir robotla yapılmalıdır.",
          "concepts": [
            {
              "term": "Kalibrasyon",
              "definition": "Robot çalışmaya başlamadan önce sensörün gerçek koşullardaki değerlerini ölçüp kararları o ölçüme göre vermek.",
              "example": "Pencere kenarında ışık artınca robot başta bir kez sallanır, yeni min ve max'ı ölçer, eşiği ona göre yeniden hesaplar.",
              "pitfall": "Kalibrasyonu bir kez yapıp ışık belirgin biçimde değişse de eski eşiğe güvenmek."
            },
            {
              "term": "Min ve max",
              "definition": "Bir sensörün kalibrasyon süresince gördüğü en küçük değer (zemin) ve en büyük değer (çizgi).",
              "example": "Normal ışıkta benzetimde min 163, max 860 ölçülür.",
              "pitfall": "Kalibrasyon sırasında sensörlere çizgiyi ya da zemini hiç göstermemek; min ile max birbirine yaklaşır."
            },
            {
              "term": "Eşik = (min + max) / 2",
              "definition": "Zemin ile çizgi arasının tam ortası; okuma bunun üstündeyse çizgi, değilse zemin sayılır.",
              "example": "Zemin 593, çizgi 941 okuyorsa eşik (593 + 941) / 2 = 767 olur.",
              "pitfall": "Karşılaştırmada eşitliği unutmak; okuma eşiğe eşitse `okuma > esik` yanlıştır ve çizgi görünmeyebilir."
            },
            {
              "term": "Başlangıç değerleri (1023 ve 0)",
              "definition": "En küçüğü bulurken enAz'a en büyük olası sayı (1023), en büyüğü bulurken enCok'a en küçük olası sayı (0) vererek başlanır.",
              "example": "İlk okuma 300 ise enAz = 300 ve enCok = 300 olur; sonraki okumalar bunları genişletir.",
              "pitfall": "Başlangıcı ters yazmak (enAz = 0): hiçbir okuma 0'dan küçük olamaz, min hiç güncellenmez."
            },
            {
              "term": "Sallanarak kalibrasyon",
              "definition": "Robotun çizgi ortadayken yerinde sola ve sağa dönerek her sensörü hem çizginin üstünden hem zeminden geçirmesi.",
              "example": "400 ms sola, 800 ms sağa, 400 ms sola dönülür, sonra robot durur ve min, max, eşik yazdırılır.",
              "pitfall": "Sallanma PWM değerini ölü bölgenin altında bırakmak (örneğin 40): robot dönmez ve eşik bozulur."
            }
          ],
          "quiz": [
            {
              "id": "m5h3d2-q1",
              "kind": "numeric",
              "prompt": "Bir sensörün kalibrasyon süresince gördüğü en küçük değer 140, en büyük değer 900. (min + max) / 2 kuralıyla bulunan eşik kaçtır?",
              "answer": 520,
              "tolerance": 0,
              "explanation": "(140 + 900) / 2 = 1040 / 2 = 520. Eşik zemin ile çizgi arasının ortasıdır; böylece iki yüzeyi de eşit payla ayırır.",
              "skills": [
                "rob-calibration"
              ]
            },
            {
              "id": "m5h3d2-q2",
              "kind": "mcq",
              "prompt": "Ortam ışığı artınca zemin yaklaşık 593, çizgi yaklaşık 941 okuyor. Beş sensörün hepsi zeminin üstünde. Sabit eşik (512) ile kalibreli eşik ((593 + 941) / 2) ne görür?",
              "options": [
                "İkisi de 00000 görür",
                "Sabit eşik 00000, kalibreli eşik 11111 görür",
                "Sabit eşik 11111 görür (zemin de \"çizgi\" sayılır); kalibreli eşik (767) 00000 ile doğru sonucu verir",
                "İkisi de 11111 görür"
              ],
              "answer": 2,
              "explanation": "Zemin 593, 512'den büyüktür; sabit eşik her sensörü çizgide sanar ve 11111 verir. Kalibreli eşik 767'dir; 593 bunun altında kaldığı için zemin doğru olarak 0 görünür. Kalibrasyonun asıl işi budur: eşiği o anki koşula uydurmak.",
              "skills": [
                "rob-calibration",
                "rob-line-pattern"
              ]
            },
            {
              "id": "m5h3d2-q3",
              "kind": "find-bug",
              "prompt": "Min ve max'ı bulan bu kod yanlış sonuç veriyor. Hata nerede?\n\n```\nint enAz = 0;\nint enCok = 1023;\n\nvoid kalibreAdimi(int v) {\n  if (v < enAz) enAz = v;\n  if (v > enCok) enCok = v;\n}\n```",
              "options": [
                "İki karşılaştırmanın yönü ters olmalı",
                "Başlangıç değerleri ters: hiçbir okuma 0'dan küçük ya da 1023'ten büyük olamaz, bu yüzden enAz ve enCok hiç güncellenmez",
                "kalibreAdimi int yerine float parametre almalı",
                "Eşik hesabı eksik; bu yüzden min ve max bulunamıyor"
              ],
              "answer": 1,
              "explanation": "enAz = 0 iken `v < 0` hiç doğru olmaz; enCok = 1023 iken `v > 1023` de hiç doğru olmaz. Karşılaştırmalar doğrudur. Doğrusu enAz = 1023 ve enCok = 0 ile başlamaktır; böylece ilk okuma ikisini de hemen geçer.",
              "skills": [
                "rob-calibration",
                "prog-debug"
              ]
            },
            {
              "id": "m5h3d2-q4",
              "kind": "predict-output",
              "prompt": "Bu kod seri monitöre ne yazar?\n\n```\nint okumalar[] = {420, 310, 760, 690, 240};\n\nvoid setup() {\n  Serial.begin(9600);\n  int enAz = 1023, enCok = 0;\n  for (int i = 0; i < 5; i++) {\n    if (okumalar[i] < enAz) enAz = okumalar[i];\n    if (okumalar[i] > enCok) enCok = okumalar[i];\n  }\n  int esik = (enAz + enCok) / 2;\n  Serial.print(esik);\n  Serial.print(' ');\n  Serial.println(500 > esik);\n}\nvoid loop() {}\n```",
              "options": [
                "500 1",
                "760 1",
                "250 0",
                "500 0"
              ],
              "answer": 3,
              "explanation": "En küçük okuma 240, en büyük 760; eşik (240 + 760) / 2 = 500. Karşılaştırma `500 > 500` yanlıştır, yani 0 yazılır. Okuma eşiğe tam eşitken `>` çizgi demez; bu yüzden uç durumlarda eşitliği düşünmek gerekir.",
              "skills": [
                "rob-calibration",
                "prog-debug"
              ]
            },
            {
              "id": "m5h3d2-q5",
              "kind": "mcq",
              "prompt": "Sallanarak kalibrasyonda SALLA_PWM 120 yerine 40 yazıldı. Ölü bölgeyi (PWM yaklaşık 51'in altında tekerlek dönmez) düşünerek ne olacağını söyle.",
              "options": [
                "Robot hiç dönmez; çizgideki A2 hep 860 okur, min = max = 860 ve eşik 860 olur. Çizgi bile `860 > 860` yanlış olduğundan 0 görünür",
                "Robot yavaş döner, kalibrasyon biraz uzar ama sonuç doğru çıkar",
                "Robot hızla döner ve eşik 0 olur",
                "Program derlenmez"
              ],
              "answer": 0,
              "explanation": "PWM 40, ölü bölgenin altındadır; tekerlekler kıpırdamaz. Sensörler hep aynı yerde kaldığı için A2 yalnız çizgiyi, diğerleri yalnız zemini görür; min ile max eşit çıkar. A2'de eşik 860 olur ve çizgi tam üstündeyken bile desen 00000 verir.",
              "skills": [
                "rob-calibration",
                "prog-debug"
              ]
            }
          ]
        },
        {
          "title": "Bang-bang çizgi izleme ve histerezis",
          "durationMin": 25,
          "problem": "Karanlık bir koridorda elin duvara değerek yürüyorsun. Duvardan uzaklaşırsan duvara yaklaşırsın, duvara çok yaklaşırsan uzaklaşırsın. Düz yürümezsin, hafif zigzag çizersin ama duvarı hiç kaybetmezsin. Çizgi izleyen robotun en basit yöntemi de budur. Yalnız bir soru var: bu zigzag ne kadar büyük olur ve robot çizgiyi ne kadar sık kaybeder?",
          "contentMd": "### Bang-bang kontrol nedir?\nBang-bang kontrolde çıkış yalnızca birkaç sabit seçenekten biridir: \"sola dön\", \"düz git\", \"sağa dön\". Ara değer yoktur. 35. dersteki termostat da böyleydi: ısıtıcı ya tam açık ya tam kapalı. Çizgi izlemede kural şöyle:\n\n- Çizgi solda görünüyorsa sola dön (sol motoru yavaşlat ya da durdur).\n- Çizgi sağda görünüyorsa sağa dön.\n- Çizgi ortadaysa düz git.\n\n### Devre\nStandart bağlantılar (86. ve 87. derslerdeki gibi):\n\n| Parça | Bağlantı |\n|---|---|\n| Çizgi sensörleri 0…4 | AO → **A0…A4** (A0 en sol) |\n| Sol motor | EN **D5** (PWM), IN1 **D7**, IN2 **D8** |\n| Sağ motor | EN **D6** (PWM), IN3 **D9**, IN4 **D10** |\n\nMotorlar için harici güç ve ortak GND kullan; pili ters bağlama, uçlarını kısa devre etme.\n\n### Program 1: tek sensörle (zigzag)\nÖnce en basit hâl: yalnız ortadaki sensör (A2). Sensör çizgideyse sağa, değilse sola dön. Robot çizginin kenarını izlemeye çalışır.\n\n```cpp\n// sketch: bangbang_tek\nconst int SOL_EN = 5, SOL_IN1 = 7, SOL_IN2 = 8;\nconst int SAG_EN = 6, SAG_IN3 = 9, SAG_IN4 = 10;\nconst int ORTA_SENSOR = A2;\nconst int ESIK = 512;\nconst int HIZ = 150;      // hizli tekerlek\nconst int DONUS = 0;      // yavas tekerlek (0 = durur)\n\nvoid motor(int sol, int sag) {\n  digitalWrite(SOL_IN1, sol > 0);\n  digitalWrite(SOL_IN2, sol < 0);\n  analogWrite(SOL_EN, abs(sol));\n  digitalWrite(SAG_IN3, sag > 0);\n  digitalWrite(SAG_IN4, sag < 0);\n  analogWrite(SAG_EN, abs(sag));\n}\n\nvoid setup() {\n  for (int p = 5; p <= 10; p++) {\n    pinMode(p, OUTPUT);\n  }\n}\n\nvoid loop() {\n  if (analogRead(ORTA_SENSOR) > ESIK) {\n    motor(HIZ, DONUS);      // cizgi altinda: saga don\n  } else {\n    motor(DONUS, HIZ);      // cizgi disinda: sola don\n  }\n}\n```\n\n### Program 2: beş sensörle, son yön hafızalı\nBeş sensör çizginin hangi tarafta olduğunu söyler. A0 ya da A1 görüyorsa çizgi solda, A3 ya da A4 görüyorsa sağdadır. Hiçbiri görmüyorsa ne yapacağız? Burada **hafıza** devreye girer: `sonYon` çizginin en son hangi tarafta görüldüğünü tutar. Çizgi kaybolursa robot o yöne dönmeye devam eder; çünkü çizgi büyük olasılıkla o tarafta kaldı.\n\nBu bir tür **histerezistir**: karar yalnız şu anki okumaya değil, geçmişe de bağlıdır. 35. dersteki termostat da \"açıkken kapanma eşiği, kapalıyken açılma eşiği\" diyerek durumu hatırlıyordu.\n\nPrograma ayrıca bir de ölçüm koydum: hiçbir sensör çizgiyi görmediği sürenin toplamı (`kayipMs`) her saniye yazılır.\n\n```cpp\n// sketch: bangbang_dizi\nconst int SOL_EN = 5, SOL_IN1 = 7, SOL_IN2 = 8;\nconst int SAG_EN = 6, SAG_IN3 = 9, SAG_IN4 = 10;\nconst int SENSOR_SAYISI = 5;\nconst int SENSOR_PIN[SENSOR_SAYISI] = {A0, A1, A2, A3, A4};\nconst int ESIK = 512;\nconst int HIZ = 150;\nconst int DONUS = 0;\n\nint sonYon = 0;                  // -1 cizgi solda, 0 ortada, +1 sagda\nunsigned long sonTur = 0;\nunsigned long kayipMs = 0;       // hicbir sensorun cizgiyi gormedigi toplam sure\nunsigned long sonYazi = 0;\n\nvoid motor(int sol, int sag) {\n  digitalWrite(SOL_IN1, sol > 0);\n  digitalWrite(SOL_IN2, sol < 0);\n  analogWrite(SOL_EN, abs(sol));\n  digitalWrite(SAG_IN3, sag > 0);\n  digitalWrite(SAG_IN4, sag < 0);\n  analogWrite(SAG_EN, abs(sag));\n}\n\nvoid setup() {\n  for (int p = 5; p <= 10; p++) {\n    pinMode(p, OUTPUT);\n  }\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  unsigned long simdi = millis();\n\n  bool s[SENSOR_SAYISI];\n  for (int i = 0; i < SENSOR_SAYISI; i++) {\n    s[i] = analogRead(SENSOR_PIN[i]) > ESIK;\n  }\n  bool sol = s[0] || s[1];\n  bool sag = s[3] || s[4];\n  bool orta = s[2];\n  bool hicbiri = !(sol || sag || orta);\n\n  if (hicbiri) {\n    kayipMs += simdi - sonTur;\n  }\n  sonTur = simdi;\n\n  if (sol) {\n    sonYon = -1;\n  } else if (sag) {\n    sonYon = 1;\n  } else if (orta) {\n    sonYon = 0;\n  }                              // hicbiri: sonYon aynen kalir (hafiza)\n\n  if (sonYon == 0) {\n    motor(HIZ, HIZ);\n  } else if (sonYon < 0) {\n    motor(DONUS, HIZ);           // sola don\n  } else {\n    motor(HIZ, DONUS);           // saga don\n  }\n\n  if (simdi - sonYazi >= 1000) {\n    sonYazi = simdi;\n    Serial.print(\"t=\");\n    Serial.print(simdi / 1000);\n    Serial.print(\" kayip=\");\n    Serial.println(kayipMs);\n  }\n}\n```\n\n### Program 3: gürültülü sensörde histerezis (iki eşik)\nHafıza yalnız yön için değil, eşiğin kendisi için de kullanılır. Gerçek bir sensörün okuması titrer. Okuma eşik civarındayken tek eşik sürekli 0-1-0-1 verir. **İki eşik** (bir yukarı, bir aşağı) kullanırsan bu titreme etkisiz kalır: sinyal önce üst eşiği geçmeli (aç), sonra alt eşiğin altına inmeli (kapat).\n\nAşağıdaki sketch A2'yi izler. D13'teki LED tek eşikle (512), D12'deki LED iki eşikle (açma 600, kapama 420) yanar. Benzetimdeki çizgi sensörü gürültüsüz olduğu için bu sketch'te A2'yi biz elle sürüyoruz; gürültüyü gerçek bir sensörde de görürsün.\n\n```cpp\n// sketch: histerezis_esik\nconst int SENSOR_PIN = A2;\nconst int LED_TEK = 13;\nconst int LED_HIST = 12;\nconst int ESIK = 512;\nconst int ESIK_YUKARI = 600;\nconst int ESIK_ASAGI = 420;\nbool histDurum = false;\n\nvoid setup() {\n  pinMode(LED_TEK, OUTPUT);\n  pinMode(LED_HIST, OUTPUT);\n}\n\nvoid loop() {\n  int v = analogRead(SENSOR_PIN);\n\n  digitalWrite(LED_TEK, v > ESIK);\n\n  if (!histDurum && v > ESIK_YUKARI) {\n    histDurum = true;\n  } else if (histDurum && v < ESIK_ASAGI) {\n    histDurum = false;\n  }\n  digitalWrite(LED_HIST, histDurum);\n}\n```\n\n### Nasıl çalışıyor?\n1. `bangbang_tek` robotu hep döndürür: çizgideyse sağa, değilse sola. Düz gitmesi hiç mümkün olmaz; robot çizginin kenarında sürekli zigzag yapar. Orta sensörün durumu çok sık değişir.\n2. `bangbang_dizi` iki yanı ayrı ayrı izler. Çizgi ortadayken düz gider, kenar sensörlerinden biri görürse o yöne döner. Zigzag çok azalır.\n3. Çizgi hiçbir sensörde yokken `sonYon` değişmez, robot son bildiği yöne dönmeye devam eder. `else if (orta)` satırını `else` yaparsan (çizgi yoksa düz git) hafıza kalmaz.\n4. Ölçümler (benzetimde oval pist, çevre ≈ 2,9 m, robot çizgi üstünde başlıyor):\n\n| Program | Pist turu | Çizgiyi görmediği toplam süre |\n|---|---|---|\n| `bangbang_tek` | 30 sn'de bitmiyor | 30 sn'nin yarısından fazla |\n| `bangbang_dizi` (hafızalı) | ≈ 17 sn | ≈ 3,9 sn (en uzun kesinti ≈ 0,24 sn) |\n| `bangbang_dizi`, hafızasız (çizgi yoksa düz) | ≈ 17 sn | ≈ 12 sn (en uzun kesinti ≈ 1,2 sn) |\n\nHafızasız sürüm de turu bitiriyor ama çizgiyi çok daha uzun süre göremiyor. Hafıza, kayıp süresini üçte birine indiriyor.\n5. `histerezis_esik` sketch'inde gürültülü sinyalde tek eşikli LED onlarca kez yanıp sönerken iki eşikli LED yalnızca bir kez yanıp bir kez söner.\n\n### Dene\n- `bangbang_dizi` içinde `DONUS` değerini 60 yap. Daha yumuşak dönüş turu daha uzun mu, kısa mı yapıyor? Çizgiyi görmediği süre değişiyor mu?\n- `HIZ` değerini 200 yap. Tur kısalıyor mu? Kayıp süresi ne oluyor?\n- `else if (orta)` satırını `else` olarak değiştir ve kayıp süresini karşılaştır.\n\n### Sık yapılan hatalar\n- Sol ve sağ motorun dönüş yönünü karıştırmak: \"çizgi solda\" derken sağa dönersin ve robot çizgiden kaçar.\n- Çok yüksek hız: robot dönmeye başlamadan çizgiyi geçer.\n- Hafızayı hiç kullanmamak: çizgi bir an kaybolunca robot düz gider ve virajı kaçırır.\n- Eşiği tahminle seçmek: ışık değişince karar bozulur (87. ders).\n\n### Gerçek robotta farklı olabilecekler\nBenzetimde sensör gürültüsüz ve zamanlama mükemmeldir. Gerçek robotta titreyen okumalar, pil gerilimi düştükçe değişen motor hızı ve zemin kusurları zigzagı büyütür; iki eşikli (histerezisli) karar vermek gerçek sensörde ciddi fark yaratır.",
          "question": "Zigzag azaltmanın bir yolu daha yavaş gitmek, bir yolu da \"ne kadar sapıyorsun?\" sorusuna sola/sağa yerine bir sayıyla cevap verip dönüşü bu sayıya göre ayarlamaktır. Sence bu ikinci yol neden bang-bang'den daha pürüzsüz olurdu?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Bang-bang kontrolün ne olduğunu ve neden zigzag çizdirdiğini\n- Beş sensörden \"çizgi solda / ortada / sağda\" kararı çıkarmayı\n- Son yön hafızasının çizgi kaybolunca robotu nasıl kurtardığını\n- İki eşikli karar (histerezis) fikrini\n\n### Önceden bilmen gerekenler\n- 35. ders: termostatın iki eşikli (açma ve kapama) kararı\n- 77. ders: motor sürücüsü, yön ve PWM ile `motor(sol, sag)` işlevi\n- 86. ders: beş sensörün eşikle 0/1 kararı ve desen\n- 87. ders: eşiğin ölçülerek bulunması\n\n### Bang-bang kontrol\nBang-bang kontrolde çıkış birkaç sabit seçenekten biridir; ara değer yoktur. Termostat ya tam açık ya tam kapalıydı. Çizgi izlemede seçenekler üçtür:\n\n| Çizgi nerede? | Robot ne yapar? | Sol tekerlek | Sağ tekerlek |\n|---|---|---|---|\n| Solda | sola döner | yavaş (0) | hızlı |\n| Ortada | düz gider | hızlı | hızlı |\n| Sağda | sağa döner | hızlı | yavaş (0) |\n\nRobot sola dönecekse sol tekerlek yavaşlar ya da durur; sağ tekerlek dönmeye devam eder.\n\n### Bir sensör mü, beş mi?\nYalnız ortadaki sensörle kural \"çizgideysem sağa, değilsem sola\" olur. Robot hiç düz gidemez; çizginin kenarında sürekli zigzag çizer. Beş sensörle A0 ya da A1 çizgiyi görüyorsa çizgi solda, A3 ya da A4 görüyorsa sağdadır; yalnız A2 görüyorsa robot düz gider. Zigzag çok azalır.\n\n### Son yön hafızası\nHiçbir sensör çizgiyi görmüyorsa ne yapılır? Bir değişken (`sonYon`) çizginin en son hangi tarafta görüldüğünü tutar: −1 sol, 0 orta, +1 sağ. Sensör çizgiyi görürse güncellenir; görmezse aynen kalır ve robot o yöne dönmeye devam eder. Karar şu anki okumaya ve geçmişe birlikte bağlıdır. Hafıza yoksa (\"çizgi yoksa düz git\") robot virajı kaçırır. Benzetimde oval bir pistte ölçüm:\n\n| Program | Çizgiyi görmediği toplam süre |\n|---|---|\n| Hafızalı beş sensör | yaklaşık 3,9 sn (tur ≈ 17 sn) |\n| Hafızasız beş sensör | yaklaşık 12 sn |\n\n### İki eşikli karar\nGerçek sensör okuması eşik civarında titrer. Tek eşikle karar 0-1-0-1 olarak sürekli değişir. İki eşikle karar sinyal önce üst eşiği geçince \"açık\", alt eşiğin altına inince \"kapalı\" olur; arada eski karar korunur. Örnek: açma 600, kapama 420. Okuma 500 ile 550 arasında dalgalansa da karar değişmez.\n\n```\nif (!acik && v > 600) acik = true;\nelse if (acik && v < 420) acik = false;\n```\n\n### Özet\nBang-bang kontrol çıkışı birkaç sabit seçenekten seçer; tek sensörle sürekli zigzag, beş sensörle çok daha az zigzag verir. `sonYon` hafızası çizgi kaybolunca robotun son bildiği yöne dönmesini sağlar ve kayıp süresini üçte birine indirir. Gürültülü sinyalde iki eşik (histerezis) kararın titremesini önler.",
          "concepts": [
            {
              "term": "Bang-bang kontrol",
              "definition": "Çıkışın yalnızca birkaç sabit seçenekten biri olduğu, ara değer olmayan kontrol türü.",
              "example": "Çizgi izlemede seçenekler sola dön, düz git, sağa dön'dür; termostat da ya tam açık ya tam kapalıdır.",
              "pitfall": "Çok hızlı sürmek: robot dönmeye başlamadan çizgiyi geçer ve bang-bang yetişemez."
            },
            {
              "term": "Zigzag",
              "definition": "Robotun çizginin iki yanına sırayla sapması; bang-bang kontrolün doğal sonucu.",
              "example": "Yalnız orta sensörle robot hiç düz gidemez, sürekli sağa-sola döner; beş sensörle zigzag çok azalır.",
              "pitfall": "Zigzagı hata sanmak; bang-bang'de beklenir, amaç onu küçük tutmaktır."
            },
            {
              "term": "Son yön hafızası (sonYon)",
              "definition": "Çizginin en son hangi tarafta görüldüğünü tutan değişken: −1 sol, 0 orta, +1 sağ.",
              "example": "Çizgi sol sensörde görülüp kaybolursa robot sola dönmeye devam eder.",
              "pitfall": "Çizgi görünmediğinde sonYon'u sıfırlamak; hafıza silinir ve robot düz gidip virajı kaçırır."
            },
            {
              "term": "Histerezis (iki eşik)",
              "definition": "Açmak için bir üst eşik, kapatmak için ayrı bir alt eşik kullanarak kararın titremesini önlemek.",
              "example": "Açma 600, kapama 420: okuma 500 ile 550 arasında dalgalansa da karar sabit kalır.",
              "pitfall": "İki eşiği birbirine çok yakın seçmek; gürültü aradaki boşluktan büyükse titreme sürer."
            },
            {
              "term": "Çizgi kayıp süresi",
              "definition": "Hiçbir sensörün çizgiyi görmediği toplam süre; bir çizgi izleyicinin ne kadar iyi tuttuğunun ölçüsü.",
              "example": "Benzetimde hafızalı program yaklaşık 3,9 sn, hafızasız yaklaşık 12 sn kayıp verir.",
              "pitfall": "Yalnız tur süresine bakmak; hızlı ama çizgiyi sürekli kaybeden robot gerçekte kontrolsüzdür."
            }
          ],
          "quiz": [
            {
              "id": "m5h3d3-q1",
              "kind": "mcq",
              "prompt": "Yalnız orta sensörü kullanan bang-bang robot (çizgideysem sağa, değilsem sola) neden asla düz gidemez?",
              "options": [
                "Motorlar yalnız tek yönde dönebildiği için",
                "Beş sensör bağlı olmadığı için robot yön bulamaz",
                "Eşik değeri hep yanlış hesaplandığı için",
                "Kuralın yalnız iki çıkışı var (sağa dön, sola dön); \"düz git\" seçeneği hiç bulunmuyor"
              ],
              "answer": 3,
              "explanation": "Bang-bang çıkışı kuralın sunduğu seçeneklerle sınırlıdır. Tek sensör yalnız \"çizgideyim / değilim\" diyebilir, iki seçenek çıkar ve ikisi de döndürür. Düz gitmek için çizginin ortada olduğunu anlayan ek sensörler ve bir üçüncü kural gerekir.",
              "skills": [
                "rob-bangbang"
              ]
            },
            {
              "id": "m5h3d3-q2",
              "kind": "predict-output",
              "prompt": "Adımlar: 1 = çizgi solda görüldü, 2 = ortada, 3 = sağda, 0 = hiçbir sensör görmüyor. Bu kod ne yazar?\n\n```\nint sonYon = 0;\nint adim[] = {1, 0, 0, 2, 0, 3, 0};\n\nvoid setup() {\n  Serial.begin(9600);\n  for (int i = 0; i < 7; i++) {\n    if (adim[i] == 1) sonYon = -1;\n    else if (adim[i] == 3) sonYon = 1;\n    else if (adim[i] == 2) sonYon = 0;\n    Serial.print(sonYon + 1);\n  }\n  Serial.println();\n}\nvoid loop() {}\n```",
              "options": [
                "0111121",
                "0001122",
                "0001111",
                "0001021"
              ],
              "answer": 1,
              "explanation": "sonYon sırayla −1, −1, −1, 0, 0, 1, 1 olur; +1 eklenince 0001122. Adım 0 (çizgi yok) sonYon'u değiştirmez: hafıza budur. Hafızasız bir sürümde her 0 adımında sonYon sıfırlanır ve 0111121 çıkardı.",
              "skills": [
                "rob-line-memory",
                "rob-bangbang"
              ]
            },
            {
              "id": "m5h3d3-q3",
              "kind": "numeric",
              "prompt": "LED başlangıçta kapalı. İki eşikli karar: değer 600'ü aşınca açılır, 420'nin altına inince kapanır, arada durum korunur. Sırayla okunan değerler: 300, 620, 560, 450, 500, 430, 610, 580, 410, 400. LED kaç kez durum değiştirir?",
              "answer": 2,
              "tolerance": 0,
              "unit": "kez",
              "explanation": "620'de açılır (1). 560, 450, 500, 430, 610, 580 arasında ne 420'nin altına inilir ne de yeniden açma gerekir; LED açık kalır. 410'da kapanır (2). 400 zaten kapalıdır. Tek eşik (512) olsaydı aynı dizide 4 kez değişirdi: 620, 450, 610, 410.",
              "skills": [
                "rob-line-memory"
              ]
            },
            {
              "id": "m5h3d3-q4",
              "kind": "find-bug",
              "prompt": "Robot düz çizgide iyi gidiyor ama virajda çizgi kaybolunca hep düz gidip virajı kaçırıyor. Hatalı kısım hangisi?\n\n```\nif (sol) {\n  sonYon = -1;\n} else if (sag) {\n  sonYon = 1;\n} else {\n  sonYon = 0;\n}\n```",
              "options": [
                "sol değişkeni s[0] && s[1] olmalı",
                "sonYon değişkeni int olmamalı, bool olmalı",
                "Son else, hiçbir sensör çizgiyi görmediğinde de sonYon'u 0 yapıyor; hafıza siliniyor. `else if (orta)` olmalı",
                "motor() işlevinin parametre sırası ters"
              ],
              "answer": 2,
              "explanation": "Çizgi kaybolunca sol ve sag yanlış olur ve son else çalışır: sonYon 0'a döner, robot \"çizgi ortadaydı\" sanıp düz gider. Hafızanın amacı bu durumda eski değeri korumaktır; yalnız orta sensör çizgiyi gördüğünde `else if (orta) sonYon = 0;` yazılmalı. Diğer seçenekler hatanın belirtisini açıklamaz.",
              "skills": [
                "rob-line-memory",
                "prog-debug"
              ]
            },
            {
              "id": "m5h3d3-q5",
              "kind": "mcq",
              "prompt": "Aşağıdakilerden hangisi iki eşikli (histerezisli) bir karardır?",
              "options": [
                "Okuma 512'den büyükse aç, değilse kapat",
                "Okuma 600'ü geçince aç, 420'nin altına inince kapat; arada eski durumu koru",
                "Okumayı her 100 ms'de bir yap ve hep aç",
                "Üç sensörün ortalamasını alıp eşikle karşılaştır"
              ],
              "answer": 1,
              "explanation": "Histerezisin ayırt edici özelliği açma ve kapama eşiğinin farklı olması ve aradaki bölgede eski kararın korunmasıdır. Birinci seçenek tek eşiktir ve eşik civarında titrer; üçüncü ve dördüncü seçenek örnekleme ve ortalama ile ilgilidir.",
              "skills": [
                "rob-line-memory"
              ]
            }
          ]
        },
        {
          "title": "Kavşak, keskin viraj ve çizgi kaybı",
          "durationMin": 25,
          "problem": "Oyuncak tren rayında her şey kolay: raylar hep ileri gider. Gerçek bir pistte ise dik köşeler, birbirini kesen çizgiler, hatta bantın eskiyip silindiği boşluklar vardır. Bang-bang programın düz ve kavisli çizgide çalıştı. Peki robotun önüne aniden \"T\" çıkarsa, çizgi bir anda biterse ya da dik bir köşe gelirse ne yapacak?",
          "contentMd": "### Beş sensörün gördüğü kalıplar\n88. dersteki gibi beş sensörü okuyup desen çıkarırız (`A0 … A4`, `1` = çizgi). Üç zor durumun kendine özgü kalıpları vardır:\n\n| Durum | Sensörlerin gördüğü | Robotun yapacağı |\n|---|---|---|\n| Sola dik viraj (L) | `11100`: sol taraf ve orta çizgide | sola dön |\n| Sağa dik viraj (L) | `00111` | sağa dön |\n| T ya da + kavşak | `11111`: hepsi çizgide | önceden verilen karar: sola, sağa ya da düz |\n| Boşluk ya da çizgi kaybı | `00000`: hiçbiri çizgide değil | duruma göre düz git ya da çizgiyi ara |\n\nBoşlukla viraj aşımı birbirine benzer: ikisinde de çizgi bir an kaybolur. Ayırmak için **son bilinen yön** kullanılır:\n\n- Çizgi en son **ortadayken** kaybolduysa, robot düz gidiyordu: büyük olasılıkla bir **boşluk**. Düz git, boşluk dar ise çizgiyi tekrar bulursun.\n- Çizgi en son **bir kenar sensöründe** görüldüyse, robot dönüyordu: çizgiyi **aştı**. Son görüldüğü yöne dön ve çizgiyi ara.\n- Boşluk çok uzunsa ya da çizgi hiç bulunamazsa robot kontrolsüz dönmesin; **dur** ve durumu bildir.\n\n### Devre\nStandart bağlantılar, 88. dersteki gibi:\n\n| Parça | Bağlantı |\n|---|---|\n| Çizgi sensörleri 0…4 | AO → **A0…A4** (A0 en sol) |\n| Sol motor | EN **D5** (PWM), IN1 **D7**, IN2 **D8** |\n| Sağ motor | EN **D6** (PWM), IN3 **D9**, IN4 **D10** |\n\nMotorlar için harici güç ve ortak GND kullan; pili ters bağlama, uçlarını kısa devre etme.\n\n### Program 1: boşluk ve çizgi kaybı\n28. dersteki durum makinesiyle üç durum yazıyoruz: `IZLE` (normal bang-bang), `BOSLUK` (düz giderek boşluğu geç), `ARAMA` (son yöne yerinde dön), bir de güvenli `DUR`. Durum değişince adı seriye yazılır.\n\n```cpp\n// sketch: kayip_toparla\nconst int SOL_EN = 5, SOL_IN1 = 7, SOL_IN2 = 8;\nconst int SAG_EN = 6, SAG_IN3 = 9, SAG_IN4 = 10;\nconst int SENSOR_SAYISI = 5;\nconst int SENSOR_PIN[SENSOR_SAYISI] = {A0, A1, A2, A3, A4};\nconst int ESIK = 512;\nconst int HIZ = 150;\nconst unsigned long BOSLUK_MS = 900;    // en cok bu kadar duz git\nconst unsigned long ARAMA_MS = 2500;    // en cok bu kadar ara\n\nenum Durum { IZLE, BOSLUK, ARAMA, DUR };\nconst char* DURUM_ADI[] = { \"IZLE\", \"BOSLUK\", \"ARAMA\", \"DUR\" };\n\nDurum durum = IZLE;\nint sonYon = 0;                         // -1 sol, 0 orta, +1 sag\nunsigned long durumBasla = 0;\n\nvoid motor(int sol, int sag) {\n  digitalWrite(SOL_IN1, sol > 0);\n  digitalWrite(SOL_IN2, sol < 0);\n  analogWrite(SOL_EN, abs(sol));\n  digitalWrite(SAG_IN3, sag > 0);\n  digitalWrite(SAG_IN4, sag < 0);\n  analogWrite(SAG_EN, abs(sag));\n}\n\nvoid gec(Durum yeni) {\n  durum = yeni;\n  durumBasla = millis();\n  Serial.println(DURUM_ADI[yeni]);\n}\n\nvoid setup() {\n  for (int p = 5; p <= 10; p++) {\n    pinMode(p, OUTPUT);\n  }\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  bool s[SENSOR_SAYISI];\n  for (int i = 0; i < SENSOR_SAYISI; i++) {\n    s[i] = analogRead(SENSOR_PIN[i]) > ESIK;\n  }\n  bool sol = s[0] || s[1];\n  bool sag = s[3] || s[4];\n  bool orta = s[2];\n  bool hicbiri = !(sol || sag || orta);\n  unsigned long gecen = millis() - durumBasla;\n\n  switch (durum) {\n    case IZLE:\n      if (hicbiri) {\n        gec(sonYon == 0 ? BOSLUK : ARAMA);\n        break;\n      }\n      if (sol) sonYon = -1;\n      else if (sag) sonYon = 1;\n      else sonYon = 0;\n      if (sonYon == 0) motor(HIZ, HIZ);\n      else if (sonYon < 0) motor(0, HIZ);\n      else motor(HIZ, 0);\n      break;\n\n    case BOSLUK:                         // duz git, cizgi gelirse IZLE\n      if (!hicbiri) { gec(IZLE); break; }\n      if (gecen > BOSLUK_MS) { gec(ARAMA); break; }\n      motor(HIZ, HIZ);\n      break;\n\n    case ARAMA:                          // son gorulen yone yerinde don\n      if (!hicbiri) { gec(IZLE); break; }\n      if (gecen > ARAMA_MS) { motor(0, 0); gec(DUR); break; }\n      if (sonYon <= 0) motor(-HIZ, HIZ);\n      else motor(HIZ, -HIZ);\n      break;\n\n    case DUR:\n      motor(0, 0);\n      break;\n  }\n}\n```\n\n### Program 2: kavşak kararı\nŞimdi dördüncü bir durum ekliyoruz: hepsi çizgideyse `11111` bir kavşak vardır. Karar `KAVSAK_KARARI` sabitindedir: −1 sola, 0 düz, +1 sağa. Üç aşama:\n\n1. `KAVSAK_ILERI`: algıladığın anda sensör dizisi çizginin üstündedir ama tekerlek aksı 7 cm gerisindedir. Hemen dönersen yanlış yerden dönersin. Önce 350 ms ileri git, aks kavşağın hizasına gelsin.\n2. `KAVSAK_DON`: seçilen yöne yerinde dön. Önce orta sensör çizgiyi bırakır (`merkezGitti`), sonra yeni çizgiyi bulduğunda dönüş biter.\n3. Düz karar verdiysen `KAVSAK_DUZ`: 300 ms düz git, kavşağı geç.\n\nT kavşakta sola dönmek, labirent kuralındaki \"hep sol\" taktiğidir; sağ için `+1` yaz. Bir `+` kavşakta ise kararı `0` yapıp düz geçersin.\n\n```cpp\n// sketch: kavsak_karari\nconst int SOL_EN = 5, SOL_IN1 = 7, SOL_IN2 = 8;\nconst int SAG_EN = 6, SAG_IN3 = 9, SAG_IN4 = 10;\nconst int SENSOR_SAYISI = 5;\nconst int SENSOR_PIN[SENSOR_SAYISI] = {A0, A1, A2, A3, A4};\nconst int ESIK = 512;\nconst int HIZ = 150;\nconst int KAVSAK_KARARI = -1;                  // -1 sola, 0 duz, +1 saga\nconst unsigned long BOSLUK_MS = 900;\nconst unsigned long ARAMA_MS = 2500;\nconst unsigned long KAVSAK_ILERI_MS = 350;\nconst unsigned long KAVSAK_DUZ_MS = 300;\n\nenum Durum { IZLE, BOSLUK, ARAMA, DUR, KAVSAK_ILERI, KAVSAK_DON, KAVSAK_DUZ };\nconst char* DURUM_ADI[] = { \"IZLE\", \"BOSLUK\", \"ARAMA\", \"DUR\",\n                            \"KAVSAK_ILERI\", \"KAVSAK_DON\", \"KAVSAK_DUZ\" };\n\nDurum durum = IZLE;\nint sonYon = 0;\nbool merkezGitti = false;\nunsigned long durumBasla = 0;\n\nvoid motor(int sol, int sag) {\n  digitalWrite(SOL_IN1, sol > 0);\n  digitalWrite(SOL_IN2, sol < 0);\n  analogWrite(SOL_EN, abs(sol));\n  digitalWrite(SAG_IN3, sag > 0);\n  digitalWrite(SAG_IN4, sag < 0);\n  analogWrite(SAG_EN, abs(sag));\n}\n\nvoid gec(Durum yeni) {\n  durum = yeni;\n  durumBasla = millis();\n  merkezGitti = false;\n  Serial.println(DURUM_ADI[yeni]);\n}\n\nvoid yerindeDon(int yon) {\n  if (yon < 0) motor(-HIZ, HIZ);\n  else motor(HIZ, -HIZ);\n}\n\nvoid setup() {\n  for (int p = 5; p <= 10; p++) {\n    pinMode(p, OUTPUT);\n  }\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  bool s[SENSOR_SAYISI];\n  for (int i = 0; i < SENSOR_SAYISI; i++) {\n    s[i] = analogRead(SENSOR_PIN[i]) > ESIK;\n  }\n  bool sol = s[0] || s[1];\n  bool sag = s[3] || s[4];\n  bool orta = s[2];\n  bool hepsi = s[0] && s[1] && s[2] && s[3] && s[4];\n  bool hicbiri = !(sol || sag || orta);\n  unsigned long gecen = millis() - durumBasla;\n\n  switch (durum) {\n    case IZLE:\n      if (hepsi) { gec(KAVSAK_ILERI); break; }\n      if (hicbiri) {\n        gec(sonYon == 0 ? BOSLUK : ARAMA);\n        break;\n      }\n      if (sol) sonYon = -1;\n      else if (sag) sonYon = 1;\n      else sonYon = 0;\n      if (sonYon == 0) motor(HIZ, HIZ);\n      else if (sonYon < 0) motor(0, HIZ);\n      else motor(HIZ, 0);\n      break;\n\n    case BOSLUK:\n      if (!hicbiri) { gec(IZLE); break; }\n      if (gecen > BOSLUK_MS) { gec(ARAMA); break; }\n      motor(HIZ, HIZ);\n      break;\n\n    case ARAMA:\n      if (!hicbiri) { gec(IZLE); break; }\n      if (gecen > ARAMA_MS) { motor(0, 0); gec(DUR); break; }\n      yerindeDon(sonYon <= 0 ? -1 : 1);\n      break;\n\n    case DUR:\n      motor(0, 0);\n      break;\n\n    case KAVSAK_ILERI:\n      motor(HIZ, HIZ);\n      if (gecen >= KAVSAK_ILERI_MS) {\n        gec(KAVSAK_KARARI == 0 ? KAVSAK_DUZ : KAVSAK_DON);\n      }\n      break;\n\n    case KAVSAK_DON:\n      yerindeDon(KAVSAK_KARARI);\n      if (!orta) merkezGitti = true;          // eski cizgiyi biraktik\n      if (merkezGitti && orta) {              // yeni cizgiyi bulduk\n        sonYon = 0;\n        gec(IZLE);\n      }\n      break;\n\n    case KAVSAK_DUZ:\n      motor(HIZ, HIZ);\n      if (gecen >= KAVSAK_DUZ_MS) gec(IZLE);\n      break;\n  }\n}\n```\n\n### Nasıl çalışıyor?\n1. `IZLE` durumu 88. dersin bang-bang mantığıdır; fark, hiçbir sensör çizgiyi görmeyince neyin olacağına `sonYon` ile karar vermesidir.\n2. Boşlukta (`BOSLUK`) robot düz gider. Benzetimde yaklaşık 10 cm'lik bir boşluğu geçerken çizgiyi yaklaşık 0,4 sn göremez; `BOSLUK_MS = 900` bunun için yeterlidir. Süre dolarsa çizgi gerçekten kaybolmuştur ve `ARAMA`'ya geçilir. `BOSLUK_MS = 300` yaparsan robot aynı boşlukta erkenden `ARAMA`'ya geçer; yine de çizgiyi bulur ama çizgiyi görmediği süre yaklaşık 0,4 sn'den yaklaşık 0,7 sn'ye çıkar.\n3. Dik virajda robot köşeyi hafifçe aşabilir; çizgi son kez kenar sensöründe görülmüştü, bu yüzden `ARAMA` o yöne yerinde döner ve çizgiyi bulunca `IZLE`'ye dönülür. Benzetimde sola dik L virajında seriye `ARAMA` yazıldığını görürsün.\n4. Çizgi hiç bulunamazsa `ARAMA_MS` sonunda robot durur ve `DUR` yazılır. Kontrolsüz dönmek yerine durmak her zaman daha güvenlidir.\n5. T kavşakta sola karar verilince `KAVSAK_ILERI → KAVSAK_DON → IZLE` sırası yazılır ve robot çubuğun sol ucuna gider. Karar `+1` ise sağ uca, `0` ise ve çubuğu kesen bir çizgi varsa düz devam eder.\n\n### Dene\n- `KAVSAK_KARARI` değerini +1 yap ve aynı T'yi dene. Robot hangi uca gidiyor?\n- `BOSLUK_MS` değerini 300 yap. 10 cm'lik boşlukta ne oluyor?\n- Boşluğu 25 cm yap. `BOSLUK_MS` yetmeyince robot ne yapıyor? Sonunda `DUR` yazıyor mu?\n\n### Sık yapılan hatalar\n- Çizgi kaybolur kaybolmaz her zaman aynı yöne dönmek: boşlukta robot kendi etrafında döner.\n- Kavşakta aksı geride bırakıp hemen dönmek: `KAVSAK_ILERI_MS = 0` yapınca robot T'nin sol ucuna gitmek yerine geldiği sapa geri döner, çünkü yerinde dönerken dizi çubuğu değil sapı bulur.\n- Arama süresini sınırsız bırakmak: çizgi gerçekten yoksa robot sonsuza kadar döner.\n- Boşluk uzunluğunu hıza göre düşünmemek: `BOSLUK_MS` ile gidilen mesafe hıza bağlıdır. Hızı artırırsan aynı sürede daha uzun yol alırsın.\n\n### Gerçek robotta farklı olabilecekler\nBenzetimde sensörler 7 cm önde, dönüş tam yerinde ve zamanlama mükemmeldir. Gerçek robotta tekerlekler kayar, 350 ms'lik ileri gitme mesafesi pil gerilimine göre değişir ve kenar sensörleri tek bir okumada yanlış kavşak görebilir. Kavşak kararı vermeden önce desenin birkaç ardışık okumada tutarlı olduğunu denemek iyi bir önlemdir.",
          "question": "\"Dur\" gerçekten en güvenli cevap mı? Bir depo robotu çizgiyi kaybedip yolun ortasında durursa ne olur? Sence robot bu durumda nasıl \"yardım iste\"meli?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Dik viraj, kavşak ve boşluğun sensörlerde bıraktığı desenleri\n- Boşluk ile \"virajı aşmayı\" son yön hafızasıyla ayırmayı\n- Çizgi kaybı ve kavşak için bir durum makinesi kurmayı\n- Her aramanın bir süre sınırı olması gerektiğini\n\n### Önceden bilmen gerekenler\n- 27. ve 28. dersler: `millis()` ile süre tutmak, `enum` ve `switch` ile durum makinesi\n- 86. ders: beş bitlik desen\n- 88. ders: bang-bang kural ve `sonYon` hafızası\n\n### Zor durumların desenleri\nDüz çizgide desen `00100` civarındadır. Üç durum farklı bir desen bırakır:\n\n| Durum | Desen | Anlam |\n|---|---|---|\n| Sola dik viraj | `11100` | Sol taraf ve orta çizgide |\n| Sağa dik viraj | `00111` | Orta ve sağ taraf çizgide |\n| T ya da + kavşak | `11111` | Hepsi çizgide |\n| Boşluk ya da kayıp | `00000` | Hiçbiri çizgide değil |\n\n### Boşluk mu, aşılan viraj mı?\n`00000` iki farklı olayın belirtisidir. Ayıran, çizginin en son nerede görüldüğüdür. Çizgi en son ortadayken kaybolduysa robot düz gidiyordu; büyük olasılıkla bir **boşluk** vardır, düz gidilir. Çizgi en son bir kenar sensöründeyken kaybolduysa robot dönüyordu ve virajı **aştı**; son görülen yöne yerinde dönüp çizgi aranır. Yani `sonYon == 0` ise `BOSLUK`, değilse `ARAMA` durumuna geçilir.\n\n### Süre sınırı\nBoşlukta düz gitme `BOSLUK_MS` ile, aramada dönme `ARAMA_MS` ile sınırlanır. Süre dolarsa çizgi gerçekten kayıptır ve robot durur (`DUR`). Sınırsız arama, çizgi hiç yoksa robotu sonsuza dek döndürür. Durmak güvenli varsayılandır. Gidilen yol hıza bağlıdır: hız artarsa aynı sürede daha uzun yol alınır, yani `BOSLUK_MS` hızla birlikte yeniden düşünülmelidir.\n\n### Durum makinesi\nDört durum yeter:\n\n```\nIZLE   -> hiçbiri görmüyor: sonYon == 0 ise BOSLUK, değilse ARAMA\nBOSLUK -> çizgi göründü: IZLE; süre doldu: ARAMA\nARAMA  -> çizgi göründü: IZLE; süre doldu: DUR\nDUR    -> motorlar kapalı\n```\n\n### Kavşak kararı\n`11111` görünce robot hemen dönmez: sensör dizisi tekerlek aksının yaklaşık 7 cm önündedir, hemen dönen robot kavşağın tam ortasında olmadan döner. Üç aşama vardır: önce kısa bir süre ileri git (aks kavşağa gelsin), sonra seçilen yöne yerinde dön (orta sensör eski çizgiyi bırakıp yeni çizgiyi bulunca bitir), düz karar verildiyse kısa süre düz git. Karar sabittir: −1 sol, 0 düz, +1 sağ.\n\n### Özet\nDik viraj, kavşak ve boşluk beş bitlik desenlerle tanınır. `00000` görününce son yön boşlukla aşılan virajı ayırır. Durum makinesi `IZLE`, `BOSLUK`, `ARAMA` ve `DUR` durumlarıyla çalışır; kavşakta önce ileri gidilir, sonra dönülür. Her aramanın süresi sınırlıdır; süre dolunca robot durur.",
          "concepts": [
            {
              "term": "Boşluk ve çizgi kaybı",
              "definition": "Hiçbir sensörün çizgiyi görmediği (00000) durum; ya çizgide dar bir boşluktur ya da robot çizgiyi kaçırmıştır.",
              "example": "Çizgi ortadayken kaybolursa boşluk olasıdır; kenar sensöründeyken kaybolursa viraj aşılmıştır.",
              "pitfall": "Kayıp görünce her zaman aynı yöne dönmek; boşlukta robot kendi etrafında döner."
            },
            {
              "term": "Son yön ile ayırt etme",
              "definition": "00000 görününce çizginin en son nerede görüldüğüne bakarak boşluk (sonYon = 0) ile aşılmış virajı (sonYon ≠ 0) ayırma.",
              "example": "sonYon = −1 ise robot sola dönüyordu; çizgiyi aştı, yerinde sola dönerek aranır.",
              "pitfall": "sonYon'u her turda sıfırlamak; hafıza silinir ve ayrım yapılamaz."
            },
            {
              "term": "Süre sınırı ve DUR",
              "definition": "Boşluğu geçme ve çizgiyi arama sürelerine üst sınır koyup dolunca robotu durdurmak.",
              "example": "BOSLUK_MS = 900 ms düz gider, ARAMA_MS = 2500 ms döner; çizgi bulunamazsa DUR yazılır ve motorlar kapanır.",
              "pitfall": "Aramayı sınırsız bırakmak; çizgi gerçekten yoksa robot sonsuza dek döner."
            },
            {
              "term": "Kavşak kararı",
              "definition": "11111 desenini görünce önceden verilmiş bir kararı uygulamak: −1 sola, 0 düz, +1 sağa.",
              "example": "T kavşakta karar −1 ise robot çubuğun sol ucuna gider; + kavşakta karar 0 ise düz geçer.",
              "pitfall": "Kavşağı görür görmez dönmek; sensör dizisi aksın önünde olduğundan dönüş yanlış yerden başlar."
            },
            {
              "term": "KAVSAK_ILERI",
              "definition": "Kavşak algılanınca dönmeden önce kısa süre ileri giderek tekerlek aksını kavşağın hizasına getiren durum.",
              "example": "350 ms ileri gidilince aks kavşağa gelir; sonra yerinde dönülür.",
              "pitfall": "Bu süreyi sıfır yapmak: robot T'nin ucuna gitmek yerine geldiği sapa geri döner."
            }
          ],
          "quiz": [
            {
              "id": "m5h3d4-q1",
              "kind": "mcq",
              "prompt": "Robot çizgiyi orta sensörle takip ederken (sonYon = 0) desen bir anda 00000 oldu. Hangi tepki doğrudur?",
              "options": [
                "Hemen yerinde sola dönmeye başla",
                "BOSLUK durumuna geç: düz git; çizgi görünürse IZLE'ye dön, süre dolarsa ARAMA'ya geç",
                "Eşiği 0 yap ve devam et",
                "Hemen DUR durumuna geç"
              ],
              "answer": 1,
              "explanation": "Çizgi ortadayken kaybolduysa robot düz gidiyordu; büyük olasılıkla bir boşluktur. Düz gidersek dar boşluğu geçeriz. Hemen dönmek robotu boşlukta döndürür; hemen durmak gereksizdir. Süre dolarsa çizgi gerçekten kayıptır ve ARAMA devreye girer.",
              "skills": [
                "rob-gap-recovery",
                "rob-line-memory"
              ]
            },
            {
              "id": "m5h3d4-q2",
              "kind": "predict-output",
              "prompt": "Okumalar: 0 = çizgi yok, 1 = solda, 2 = ortada, 3 = sağda. Çizgi yokken sonYon == 0 ise 'B' (boşluk), değilse 'A' (arama) yazılır; çizgi varsa 'I' (izle). Bu kod ne yazar?\n\n```\nint sonYon = 0;\nint okuma[] = {2, 1, 0, 0, 3};\n\nvoid setup() {\n  Serial.begin(9600);\n  for (int i = 0; i < 5; i++) {\n    int o = okuma[i];\n    if (o == 0) {\n      Serial.print(sonYon == 0 ? 'B' : 'A');\n    } else {\n      sonYon = (o == 1) ? -1 : (o == 3) ? 1 : 0;\n      Serial.print('I');\n    }\n  }\n  Serial.println();\n}\nvoid loop() {}\n```",
              "options": [
                "IIBBI",
                "IIAAA",
                "IIAAI",
                "IBBAI"
              ],
              "answer": 2,
              "explanation": "Okuma 2 ve 1'de çizgi görülür (I, I) ve sonYon son olarak −1 olur. Sonraki iki 0'da sonYon ≠ 0 olduğundan A, A yazılır. Son okuma 3 çizgiyi görür, I yazılır. Çıktı IIAAI. Birinci seçenek sonYon'un 0 kaldığını varsayar.",
              "skills": [
                "rob-gap-recovery",
                "rob-line-memory",
                "prog-debug"
              ]
            },
            {
              "id": "m5h3d4-q3",
              "kind": "numeric",
              "prompt": "Robot BOSLUK durumunda 0,2 m/s hızla düz gidiyor ve BOSLUK_MS = 900. Bu durumda süre dolmadan en fazla kaç cm yol alır?",
              "answer": 18,
              "tolerance": 0.1,
              "unit": "cm",
              "explanation": "Yol = hız × süre = 0,2 m/s × 0,9 s = 0,18 m = 18 cm. Hız artarsa aynı sürede daha uzun yol alınır; bu yüzden BOSLUK_MS hızla birlikte yeniden düşünülmelidir. Santimetreye çevirmek için metreyi 100 ile çarpmayı unutma.",
              "skills": [
                "rob-gap-recovery",
                "prog-timing"
              ]
            },
            {
              "id": "m5h3d4-q4",
              "kind": "find-bug",
              "prompt": "Kavşakta sola dönüş durumu, robot dönmeye başlar başlamaz IZLE'ye geçiyor ve yanlış yönde kalıyor. Hata nerede?\n\n```\ncase KAVSAK_DON:\n  yerindeDon(KAVSAK_KARARI);\n  if (orta) merkezGitti = true;\n  if (merkezGitti && orta) {\n    sonYon = 0;\n    gec(IZLE);\n  }\n  break;\n```",
              "options": [
                "`if (orta) merkezGitti = true;` ters olmalı: eski çizgi bırakılınca (!orta) merkezGitti işaretlenmeli; yazıldığı gibi dönüş daha ilk turda biter",
                "yerindeDon çağrısı break'ten sonra olmalı",
                "sonYon = 0 satırı silinmeli",
                "gec(IZLE) yerine gec(DUR) yazılmalı"
              ],
              "answer": 0,
              "explanation": "Dönüş başlarken orta sensör hâlâ eski çizgidedir. `orta` doğruyken merkezGitti işaretlenirse ve hemen ardından `merkezGitti && orta` kontrol edilirse koşul ilk turda sağlanır. Doğrusu önce orta sensörün eski çizgiyi bırakmasını (!orta) beklemek, sonra yeni çizgiyi bulunca bitirmektir.",
              "skills": [
                "rob-junction",
                "rob-line-fsm",
                "prog-debug"
              ]
            },
            {
              "id": "m5h3d4-q5",
              "kind": "mcq",
              "prompt": "Robot T kavşağını (11111) görünce neden hemen dönmeye başlamaz da önce KAVSAK_ILERI durumunda kısa süre ileri gider?",
              "options": [
                "Motor sürücüsü ani yön değişimine izin vermez",
                "Beş sensörün aynı anda çizgiyi görmesi bir okuma hatasıdır",
                "ARAMA_MS dolmadan dönmek yasaktır",
                "Sensör dizisi tekerlek aksının yaklaşık 7 cm önündedir; hemen dönen robot kavşağın ortasına varmadan, yanlış yerden döner"
              ],
              "answer": 3,
              "explanation": "Kavşağı sensör dizisi görür ama robotun dönme merkezi (aks) 7 cm geridedir. Kısa bir ileri gitmeyle aks kavşağın hizasına gelir ve dönüş doğru yerden başlar. Sürücü ani yön değişimine izin verir; 11111 her zaman hata değildir, kavşağın desenidir.",
              "skills": [
                "rob-junction",
                "rob-line-fsm"
              ]
            }
          ]
        },
        {
          "title": "Proje: Çizgi izleyen robot (pist)",
          "durationMin": 35,
          "problem": "Bir robot yarışında hakem sadece iki şeye bakar: robot pisti bitirdi mi ve ne kadar sürede? Çizgiyi çok kaybeden robot yavaşlar, bazen de hiç bitiremez. Bu projede bu haftanın bütün parçalarını tek bir programda birleştireceksin. Sonunda robotun kendi tur süresini ve çizgiyi görmediği süreyi sana rapor edecek.",
          "contentMd": "### Ne yapacağız?\nBu proje bu haftanın ve önceki haftaların kavramlarını birleştirir:\n- **86. ders:** beş sensörlü dizi, eşikle \"çizgide mi?\" kararı.\n- **87. ders:** başlangıçta sallanarak min/max ölçmek, her sensör için eşik = (min + max) / 2. Kontrast çok düşükse (çizgi ile zemin ayırt edilemiyorsa) kalibrasyon başarısız sayılır.\n- **88. ders:** bang-bang yön kararı ve son yön hafızası.\n- **89. ders:** boşluk geçme, çizgiyi arama, çizgi bulunamazsa dur.\n- **27. ve 28. dersler:** `millis()` ve `enum` ile durum makinesi; `delay` hiç yok.\n- **77. ve 78. dersler:** yön + PWM ile sürücü kontrolü, ölü bölge (PWM'in %20'nin altında tekerlek dönmez).\n\nRobot bir **pist** boyunca gidecek ve bitiş bandını görünce duracak. Durunca seriye şunu yazacak: `BITTI sure=… kayip=… enuzun=…` (hepsi milisaniye).\n\n### Pist\nPist düzenlidir ama her türden zorluğu içerir. Robot çizginin başlangıcında, çizgi üstünde ve ileri bakarak başlar.\n\n| Bölüm | Uzunluk | Ne var? |\n|---|---|---|\n| 1. Düz | yaklaşık 60 cm | Başlangıç; robotun arkasında 20 cm çizgi daha var |\n| 2. Kavis | yaklaşık 63 cm | Sola 90° kavis, yarıçap 40 cm |\n| 3. Düz | 30 cm | Kavisten sonra dik çıkış |\n| 4. Dik viraj | | Sağa 90° keskin viraj (L) |\n| 5. Düz | 60 cm | Düz parça |\n| 6. Boşluk | 9 cm | Çizgi yok; sonra çizgi devam eder |\n| 7. Düz ve bitiş | yaklaşık 60 cm | Sonunda çizgiye dik 30 cm'lik bitiş bandı |\n\nÇizgi genişliği 2 cm, sensör aralığı 2,4 cm, sensörler aks hizasından 7 cm öndedir.\n\n### Devre\nStandart bağlantılar:\n\n| Parça | Bağlantı |\n|---|---|\n| Çizgi sensörleri 0…4 | AO → **A0…A4** (A0 en sol), VCC → 5 V, GND → GND |\n| Sol motor | EN **D5** (PWM), IN1 **D7**, IN2 **D8** |\n| Sağ motor | EN **D6** (PWM), IN3 **D9**, IN4 **D10** |\n\nMotorlar ve sürücü için harici güç kullan, ortak GND bağla. Pili ters bağlama, uçlarını kısa devre etme.\n\n### Program\nProgramın akışı:\n\n1. `KALIBRE`: 1,8 sn sola-sağa sallan, her sensörün min/max'ını ölç, eşikleri hesapla ve yaz. Bir sensörün kontrastı `MIN_KONTRAST`'tan küçükse `HATA` durumuna geç ve robotu hareket ettirme.\n2. `IZLE`: 88. dersin bang-bang kuralı. Orta sensör çizgideyken düz, kenar sensörü görürse o yöne dön.\n3. Hiçbir sensör çizgiyi görmezse: son yön orta idiyse `BOSLUK` (düz git), kenar idiyse `ARAMA` (o yöne yerinde dön).\n4. Beş sensör birden çizgideyse ve başlangıçtan 3 sn geçtiyse bu bitiş bandıdır: dur ve raporu yaz.\n\nÇizgiyi görmediği süre (`kayipMs`) ve tek seferde en uzun kesinti (`enUzunMs`) çalışırken biriktirilir.\n\n```cpp\n// sketch: cizgi_proje\nconst int SOL_EN = 5, SOL_IN1 = 7, SOL_IN2 = 8;\nconst int SAG_EN = 6, SAG_IN3 = 9, SAG_IN4 = 10;\nconst int SENSOR_SAYISI = 5;\nconst int SENSOR_PIN[SENSOR_SAYISI] = {A0, A1, A2, A3, A4};\n\nconst int HIZ = 170;\nconst int SALLA_PWM = 120;\nconst unsigned long KALIBRASYON_MS = 1800;\nconst int MIN_KONTRAST = 200;                 // max - min bundan kucukse kalibrasyon basarisiz\nconst unsigned long BOSLUK_MS = 900;\nconst unsigned long ARAMA_MS = 2500;\nconst unsigned long BITIS_BEKLE_MS = 3000;    // baslangictan once bitis aranmaz\n\nenum Durum { KALIBRE, IZLE, BOSLUK, ARAMA, BITTI, HATA };\nDurum durum = KALIBRE;\n\nint enAz[SENSOR_SAYISI];\nint enCok[SENSOR_SAYISI];\nint esik[SENSOR_SAYISI];\nint sonYon = 0;                               // -1 sol, 0 orta, +1 sag\nunsigned long durumBasla = 0;\nunsigned long turBasla = 0;\nunsigned long sonTur = 0;\nunsigned long kayipMs = 0;\nunsigned long kesintiMs = 0;\nunsigned long enUzunMs = 0;\n\nvoid motor(int sol, int sag) {\n  digitalWrite(SOL_IN1, sol > 0);\n  digitalWrite(SOL_IN2, sol < 0);\n  analogWrite(SOL_EN, abs(sol));\n  digitalWrite(SAG_IN3, sag > 0);\n  digitalWrite(SAG_IN4, sag < 0);\n  analogWrite(SAG_EN, abs(sag));\n}\n\nvoid gec(Durum yeni) {\n  durum = yeni;\n  durumBasla = millis();\n}\n\nvoid kalibreAdimi(unsigned long t) {\n  if (t < 400) motor(-SALLA_PWM, SALLA_PWM);\n  else if (t < 1200) motor(SALLA_PWM, -SALLA_PWM);\n  else if (t < 1600) motor(-SALLA_PWM, SALLA_PWM);\n  else motor(0, 0);\n  for (int i = 0; i < SENSOR_SAYISI; i++) {\n    int v = analogRead(SENSOR_PIN[i]);\n    if (v < enAz[i]) enAz[i] = v;\n    if (v > enCok[i]) enCok[i] = v;\n  }\n}\n\nbool esikleriHesapla() {\n  bool tamam = true;\n  Serial.print(\"esikler:\");\n  for (int i = 0; i < SENSOR_SAYISI; i++) {\n    esik[i] = (enAz[i] + enCok[i]) / 2;\n    if (enCok[i] - enAz[i] < MIN_KONTRAST) tamam = false;\n    Serial.print(' ');\n    Serial.print(esik[i]);\n  }\n  Serial.println();\n  return tamam;\n}\n\nvoid setup() {\n  for (int p = 5; p <= 10; p++) {\n    pinMode(p, OUTPUT);\n  }\n  Serial.begin(9600);\n  for (int i = 0; i < SENSOR_SAYISI; i++) {\n    enAz[i] = 1023;\n    enCok[i] = 0;\n  }\n  gec(KALIBRE);\n}\n\nvoid loop() {\n  unsigned long simdi = millis();\n  unsigned long gecen = simdi - durumBasla;\n\n  if (durum == KALIBRE) {\n    kalibreAdimi(gecen);\n    if (gecen >= KALIBRASYON_MS) {\n      if (esikleriHesapla()) {\n        turBasla = simdi;\n        sonTur = simdi;\n        gec(IZLE);\n      } else {\n        Serial.println(\"KALIBRASYON HATASI\");\n        gec(HATA);\n      }\n    }\n    return;\n  }\n  if (durum == BITTI || durum == HATA) {\n    motor(0, 0);\n    return;\n  }\n\n  bool s[SENSOR_SAYISI];\n  for (int i = 0; i < SENSOR_SAYISI; i++) {\n    s[i] = analogRead(SENSOR_PIN[i]) > esik[i];\n  }\n  bool sol = s[0] || s[1];\n  bool sag = s[3] || s[4];\n  bool orta = s[2];\n  bool hepsi = s[0] && s[1] && s[2] && s[3] && s[4];\n  bool hicbiri = !(sol || sag || orta);\n\n  // olcum: cizgiyi gormedigimiz sure\n  unsigned long dt = simdi - sonTur;\n  sonTur = simdi;\n  if (hicbiri) {\n    kayipMs += dt;\n    kesintiMs += dt;\n    if (kesintiMs > enUzunMs) enUzunMs = kesintiMs;\n  } else {\n    kesintiMs = 0;\n  }\n\n  if (hepsi && simdi - turBasla > BITIS_BEKLE_MS) {\n    motor(0, 0);\n    Serial.print(\"BITTI sure=\");\n    Serial.print(simdi - turBasla);\n    Serial.print(\" kayip=\");\n    Serial.print(kayipMs);\n    Serial.print(\" enuzun=\");\n    Serial.println(enUzunMs);\n    gec(BITTI);\n    return;\n  }\n\n  switch (durum) {\n    case IZLE:\n      if (hicbiri) {\n        gec(sonYon == 0 ? BOSLUK : ARAMA);\n        break;\n      }\n      if (sol) sonYon = -1;\n      else if (sag) sonYon = 1;\n      else sonYon = 0;\n      if (sonYon == 0) motor(HIZ, HIZ);\n      else if (sonYon < 0) motor(0, HIZ);\n      else motor(HIZ, 0);\n      break;\n\n    case BOSLUK:\n      if (!hicbiri) { gec(IZLE); break; }\n      if (gecen > BOSLUK_MS) { gec(ARAMA); break; }\n      motor(HIZ, HIZ);\n      break;\n\n    case ARAMA:\n      if (!hicbiri) { gec(IZLE); break; }\n      if (gecen > ARAMA_MS) {\n        motor(0, 0);\n        Serial.println(\"CIZGI KAYBOLDU\");\n        gec(HATA);\n        break;\n      }\n      if (sonYon <= 0) motor(-HIZ, HIZ);\n      else motor(HIZ, -HIZ);\n      break;\n\n    default:\n      break;\n  }\n}\n```\n\n### Nasıl çalışıyor?\n1. Her `loop` turunda sırayla: durum `KALIBRE` ise kalibrasyon adımı; `BITTI` ya da `HATA` ise dur; aksi hâlde sensörleri oku, ölçümü güncelle, bitişe bak, sonra duruma göre sür. Hiçbir yerde `delay` yok, bu yüzden sensörler hep taze okunur.\n2. Eşik her sensör için ayrıdır ve kalibrasyonda ölçülür. Benzetimde `esikler: 511 511 511 511 511` yazar. `MIN_KONTRAST = 200` bir güvenlik önlemidir: robot yanlışlıkla çizgiden uzak bir yere konmuşsa (sensörler hiç çizgi görmedi) program `KALIBRASYON HATASI` yazar ve robotu sürmez; bu durumda robot yerinde kalır.\n3. `BOSLUK` durumu 9 cm'lik boşluğu düz gider (yaklaşık 0,4 sn). `BOSLUK` ile `ARAMA` aynı `hicbiri` koşuluyla başlar; ayıran şey `sonYon`'dur.\n4. `kayipMs` ve `enUzunMs` programın kendi ölçümüdür. İkisi de sensörlerden hesaplanır. Bu pistte en uzun kesinti boşlukta oluşur; boşluk 15 cm olunca yaklaşık 0,6 sn'ye çıkar ve `BOSLUK_MS = 900` yine yeter.\n5. Bitiş bandı beş sensörü birden çizgiye sokar. İlk 3 sn bu koşul aranmaz; böylece başlangıç sırasında oluşabilecek tuhaf bir okuma yanlışlıkla robotu durdurmaz.\n\n### Ölçüm raporu\nBenzetimde `HIZ = 170` ile aldığım değerler (yaklaşık):\n\n| Ölçüm | Değer |\n|---|---|\n| Kalibrasyon | 1,8 sn |\n| Tur süresi (kalibrasyon hariç) | ≈ 13,3 sn |\n| Çizgiyi görmediği toplam süre | ≈ 2,7 sn |\n| En uzun tek kesinti (boşluk) | ≈ 0,37 sn |\n\nAynı pistte yalnız `HIZ` değerini değiştirince benzetimde şunları gördüm:\n\n| `HIZ` | Tur süresi | Çizgiyi görmediği süre | Sonuç |\n|---|---|---|---|\n| 140 | ≈ 17,6 sn | ≈ 3,8 sn | bitirdi |\n| 170 | ≈ 13,3 sn | ≈ 2,7 sn | bitirdi |\n| 200 | ≈ 10,8 sn | ≈ 2,2 sn | bitirdi |\n| 230 | ≈ 8,6 sn | ≈ 1,3 sn | bitirdi |\n| 255 | - | - | dik virajda çizgiyi bulamadı, `CIZGI KAYBOLDU` yazdı ve durdu |\n\nBu pistte hız arttıkça hem süre hem kayıp azaldı, ama en yüksek hızda robot pisti bitiremedi. \"Hızlı olan daha iyidir\" kuralının bir sınırı var; sınırı sen bulmaya çalış.\n\n### Dene\n- `HIZ` için 240-250 arasında bir değer dene. Pisti bitirebilen en yüksek hız hangisi?\n- Robotu çizgiden 15 cm uzağa koy ve başlat. `KALIBRASYON HATASI` yazıyor mu, robot hareket ediyor mu?\n- Kendi ekleyeceğin bir özellik: `HATA` ya da `BITTI` durumunda D13'teki LED'i yaktır (başarılıysa yanıp sönsün, hata ise sürekli yansın).\n\n### Sık yapılan hatalar\n- Kalibrasyonu robot çizgideyken başlatmamak: min/max yanlış çıkar.\n- Başlangıç anında bitiş koşulunu açık bırakmak: ilk okuma robotu hemen durdurabilir. `BITIS_BEKLE_MS` bu yüzden var.\n- Hızı artırıp `BOSLUK_MS`'i sabit bırakmak: robot boşlukta daha uzun yol alır.\n- `ARAMA`'yı sınırlamamak: çizgi bitince robot sonsuza kadar döner. Süre dolunca durmak güvenlik içindir.\n- Eşikleri el ile yazmak: ışık değiştiğinde proje çalışmaz olur (87. ders).\n\n### Gerçek robotta farklı olabilecekler\nBenzetimde sensörler gürültüsüz ve tekerlekler kaymaz. Gerçek robotta okumalar titrer (eşik civarında histerezis, 88. ders, işe yarar), pil gerilimi azaldıkça robot yavaşlar ve bitiş bandı ile bir kavşağı ayırt etmek için daha fazla bilgi gerekebilir. Bu projedeki değerler (`BOSLUK_MS`, `HIZ`) senin robotunda yeniden ayarlanmalıdır.",
          "question": "Robotun çizgiyi \"daha az kaybetmesi\" mi, yoksa \"daha hızlı bitirmesi\" mi daha önemli? Hangi durumlarda hangisini seçerdin? Bunu sayıyla (tur süresi, kayıp süresi) nasıl savunurdun?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Haftanın parçalarını (kalibrasyon, bang-bang, hafıza, kayıp kurtarma) tek bir durum makinesinde birleştirmeyi\n- Programın kendi başarısını ölçmeyi: tur süresi ve çizgiyi görmediği süre\n- Güvenlik önlemlerini (kontrast denetimi, süre sınırı, durma) tasarlamayı\n- Hız ile güvenilirlik arasındaki ödünleşimi sayıyla yorumlamayı\n\n### Önceden bilmen gerekenler\n- 27. ve 28. dersler: `millis()` ile zaman, `enum` ile durum makinesi (programda `delay` yok)\n- 77. ve 78. dersler: yön ve PWM ile sürüş, ölü bölge\n- 86. ve 87. dersler: beş sensör, min/max ile eşik\n- 88. ve 89. dersler: son yön hafızası, boşluk, arama\n\n### Parçalar nasıl birleşir?\nProgram altı durumdan oluşur ve her turda aynı sırayla ilerler:\n\n| Durum | Ne yapar? | Nereye geçer? |\n|---|---|---|\n| `KALIBRE` | 1,8 sn sallanıp min/max ölçer, eşikleri hesaplar | `IZLE`; kontrast düşükse `HATA` |\n| `IZLE` | Bang-bang yön kararı, `sonYon` günceller | Çizgi yoksa `BOSLUK` ya da `ARAMA` |\n| `BOSLUK` | Düz gider | Çizgi gelirse `IZLE`, süre dolarsa `ARAMA` |\n| `ARAMA` | Son yöne yerinde döner | Çizgi gelirse `IZLE`, süre dolarsa `HATA` |\n| `BITTI` | Motorlar kapalı, rapor yazılmış | - |\n| `HATA` | Motorlar kapalı | - |\n\n### Güvenlik önlemleri\nHer önlemin bir nedeni vardır. `MIN_KONTRAST = 200`: bir sensörün max − min farkı 200'den küçükse çizgi ile zemin ayırt edilemiyordur (robot çizgiden uzak başlamış olabilir); robot sürülmez ve `KALIBRASYON HATASI` yazılır. `ARAMA_MS` bitince robot durur. Bitiş bandı (beş sensör de çizgide) yalnız başlangıçtan 3 sn sonra aranır; başlangıçtaki tuhaf bir okuma robotu yanlışlıkla durdurmasın.\n\n### Ölçüm\nRobot kendi performansını ölçer. `kayipMs` hiçbir sensörün çizgiyi görmediği toplam süredir; `enUzunMs` tek seferde en uzun kesintidir. Her turun süresi (`dt`) bir önceki turdan bu yana geçen süredir ve her turda `sonTur = simdi` ile güncellenmelidir; güncellemezsen `dt` başlangıçtan beri geçen süre olur ve kayıp kat kat fazla çıkar. Bitişte `BITTI sure=... kayip=... enuzun=...` yazılır.\n\n### Hız bir ödünleşimdir\nAynı pistte yalnız `HIZ` değiştirilince benzetimde (yaklaşık değerler):\n\n| `HIZ` | Tur süresi | Çizgiyi görmediği süre | Sonuç |\n|---|---|---|---|\n| 140 | 17,6 sn | 3,8 sn | bitirdi |\n| 170 | 13,3 sn | 2,7 sn | bitirdi |\n| 230 | 8,6 sn | 1,3 sn | bitirdi |\n| 255 | - | - | `CIZGI KAYBOLDU`, durdu |\n\nHız arttıkça tur kısalır, ama bir sınırdan sonra robot dik virajda çizgiyi bulamaz. \"En hızlı olan en iyidir\" demek yerine hem süreye hem kayba bak.\n\n### Özet\nÇizgi izleyen robot bir durum makinesidir: kalibre et, izle, boşluğu geç, çizgiyi ara, bitir ya da güvenli biçimde dur. Her aşamanın süre sınırı ve bir sonraki durumu açıkça tanımlıdır. Robot kendi tur süresini ve çizgiyi görmediği süreyi ölçer. Hız artırmak tur süresini azaltır ama güvenilirliği bir yerde bozar; ayar ölçümle yapılır.",
          "concepts": [
            {
              "term": "Durum makinesi (KALIBRE, IZLE, BOSLUK, ARAMA, BITTI, HATA)",
              "definition": "Programın her an altı durumdan yalnız birinde olduğu ve koşullarla durumlar arasında geçtiği yapı.",
              "example": "KALIBRE bitince IZLE'ye, IZLE'de çizgi kaybolunca BOSLUK ya da ARAMA'ya geçilir.",
              "pitfall": "Durumları bayraklarla (bool) dağınık yazmak; hangi çıkışın hangi nedenle çalıştığı karışır."
            },
            {
              "term": "MIN_KONTRAST",
              "definition": "Kalibrasyonda max − min bu değerden küçükse çizgi ile zemin ayırt edilemiyor sayılır; robot sürülmez.",
              "example": "Sensör 500 ile 640 arasında kalırsa fark 140 < 200'dür ve KALIBRASYON HATASI yazılır.",
              "pitfall": "Bu denetimi koymayıp robotu belirsiz eşiklerle sürmek; robot çizgiden habersiz hareket eder."
            },
            {
              "term": "Başlangıç koruması (BITIS_BEKLE_MS)",
              "definition": "Bitiş bandı kararını yalnız başlangıçtan belli bir süre sonra aramak.",
              "example": "İlk 3 sn beş sensörün birden çizgide olması bitiş sayılmaz.",
              "pitfall": "Bu korumayı koymamak: başlangıçtaki tuhaf bir okuma robotu hemen durdurabilir."
            },
            {
              "term": "kayipMs ve enUzunMs",
              "definition": "Robotun kendi ölçtüğü, hiçbir sensörün çizgiyi görmediği toplam süre ve tek seferde en uzun kesinti.",
              "example": "Bu pistte en uzun kesinti 9 cm'lik boşlukta oluşur ve yaklaşık 0,37 sn sürer.",
              "pitfall": "sonTur'u her turda güncellememek; fark başlangıçtan beri büyür ve kayıp kat kat fazla çıkar."
            },
            {
              "term": "Hız ödünleşimi",
              "definition": "Hız arttıkça tur kısalır ama güvenilirlik düşer; iyi ayar, ölçülen değerlerle bulunur.",
              "example": "Benzetimde HIZ 140'tan 230'a çıkınca tur 17,6 sn'den 8,6 sn'ye iner; 255'te robot dik virajda çizgiyi bulamaz.",
              "pitfall": "En hızlı ayarı en iyi sanmak; pisti bitirmeyen robotun tur süresi yoktur."
            }
          ],
          "quiz": [
            {
              "id": "m5h3d5-q1",
              "kind": "predict-output",
              "prompt": "Üç sensör için kalibrasyon sonucu elde edildi. Bu kod ne yazar?\n\n```\nconst int N = 3;\nint enAz[N] = {163, 500, 163};\nint enCok[N] = {860, 640, 860};\nconst int MIN_KONTRAST = 200;\n\nvoid setup() {\n  Serial.begin(9600);\n  bool tamam = true;\n  for (int i = 0; i < N; i++) {\n    Serial.print((enAz[i] + enCok[i]) / 2);\n    Serial.print(' ');\n    if (enCok[i] - enAz[i] < MIN_KONTRAST) tamam = false;\n  }\n  Serial.println(tamam ? \"TAMAM\" : \"HATA\");\n}\nvoid loop() {}\n```",
              "options": [
                "511 570 511 TAMAM",
                "511 511 511 HATA",
                "511 570 511 HATA",
                "570 570 570 HATA"
              ],
              "answer": 2,
              "explanation": "Eşikler (163 + 860) / 2 = 511 (int bölmesi), (500 + 640) / 2 = 570 ve yine 511'dir. İkinci sensörün kontrastı 640 − 500 = 140 < 200 olduğu için tamam false olur ve HATA yazılır. Bir sensör yetersizse robot sürülmez.",
              "skills": [
                "rob-calibration",
                "rob-safe-stop",
                "prog-debug"
              ]
            },
            {
              "id": "m5h3d5-q2",
              "kind": "mcq",
              "prompt": "Projede bitiş bandı yalnız başlangıçtan 3 sn sonra aranıyor (BITIS_BEKLE_MS = 3000). Bunun amacı nedir?",
              "options": [
                "Başlangıçtaki tuhaf bir okuma (beş sensörün birden çizgide görünmesi) robotu yanlışlıkla durdurmasın",
                "Motorların ısınması için süre tanımak",
                "Kalibrasyon süresini uzatmak",
                "Pist uzunluğunu hesaplamak"
              ],
              "answer": 0,
              "explanation": "Bitiş bandı da kavşak gibi 11111 desenidir. Başlangıçta robot çizginin üstünde ve hareket etmeden önce sensörler yanlış bir desen okuyabilir; koruma süresi bu yanlış alarmı engeller. Motor ısınması, kalibrasyon süresi ya da pist uzunluğuyla ilgisi yoktur.",
              "skills": [
                "rob-line-fsm",
                "rob-safe-stop"
              ]
            },
            {
              "id": "m5h3d5-q3",
              "kind": "numeric",
              "prompt": "Bir pist turu 16 sn sürdü ve robot bu sürenin 4 sn'sinde hiçbir sensörle çizgiyi göremedi. Çizgiyi görmediği süre turun yüzde kaçıdır?",
              "answer": 25,
              "tolerance": 0,
              "unit": "%",
              "explanation": "Oran = kayıp / tur = 4 / 16 = 0,25, yani %25. Tur süresi tek başına yetmez; iki robot aynı sürede bitirse de çizgiyi daha az kaybeden daha kontrollüdür.",
              "skills": [
                "rob-line-metrics"
              ]
            },
            {
              "id": "m5h3d5-q4",
              "kind": "find-bug",
              "prompt": "Robot çizgiyi birkaç kez kısa süre kaybetti ama program raporda yüz binlerce ms kayıp yazıyor. Hata nerede?\n\n```\nunsigned long sonTur = 0;\nunsigned long kayipMs = 0;\n\nvoid loop() {\n  unsigned long simdi = millis();\n  bool hicbiri = !(sol || sag || orta);   // yukarıda hesaplandı\n  if (hicbiri) {\n    kayipMs += simdi - sonTur;\n  }\n}\n```",
              "options": [
                "kayipMs unsigned long olmamalı, int olmalı",
                "hicbiri tanımındaki ! işareti kaldırılmalı",
                "millis() yerine delay() kullanılmalı",
                "sonTur hiç güncellenmiyor: her kayıp turunda başlangıçtan beri geçen süre eklenir. Turun sonunda sonTur = simdi yazılmalı"
              ],
              "answer": 3,
              "explanation": "simdi − sonTur, son turdan beri geçen süre olmalıdır; sonTur 0'da kalırsa fark programın başlangıcından beri geçen süre olur ve her kayıp turunda bu eklenir. Çözüm sonTur = simdi ile her turda saklamaktır. Diğer seçenekler hatanın nedeni değildir; delay() bu projede kullanılmaz.",
              "skills": [
                "rob-line-metrics",
                "prog-timing",
                "prog-debug"
              ]
            },
            {
              "id": "m5h3d5-q5",
              "kind": "mcq",
              "prompt": "Aynı pistte HIZ 140, 170 ve 230 iken robot pisti bitirdi (hız arttıkça hem tur süresi hem kayıp süresi azaldı), HIZ 255'te ise CIZGI KAYBOLDU yazıp durdu. Hangi yorum en doğrudur?",
              "options": [
                "En yüksek hız her zaman en iyisidir, 255 yalnız şanssızlıktır",
                "Yalnız tur süresine bakmak yeterlidir",
                "Hız arttıkça tur kısalır ama bir sınırdan sonra robot pisti bitiremez; ayar, bitiren en yüksek güvenli hızı ölçümle bulmaktır",
                "Kayıp süresi önemsizdir, yalnız hız ölçülmelidir"
              ],
              "answer": 2,
              "explanation": "Ölçüm hız ile güvenilirlik arasında ödünleşim olduğunu gösterir: 255'te tur süresi bile yoktur çünkü robot pisti bitirmemiştir. İyi ayar hem süreye hem çizgi kaybına hem de bitirip bitirmediğe bakılarak yapılır.",
              "skills": [
                "rob-line-metrics",
                "rob-gap-recovery"
              ]
            }
          ]
        }
      ]
    },
    {
      "title": "Enkoder ve odometri",
      "project": "Kare çizen robot",
      "guideMd": "### Hafta hedefleri\nBu haftanın sonunda öğrenci:\n1. Enkoderin tık ürettiğini, tıkın nasıl mesafeye çevrildiğini (çevre / yuva sayısı) hesaplayabilir.\n2. Tıkları kesmeyle sayıp sayacı `volatile` ve güvenli okuma ile kullanabilir.\n3. Pencere ve tık farkından hız hesaplayabilir; nicemlemenin ve pencere uzunluğunun etkisini açıklayabilir.\n4. Tık farkına göre P düzeltmeyle robotu düz götürebilir ve düzeltmenin neden sapmayı sıfırlamadığını söyleyebilir.\n5. Odometri formülleriyle x, y ve θ'yı hesaplayabilir; hatanın iki kaynağını (çözünürlük, yanlış sabitler) ayırt edebilir.\n6. Kare ve sekiz çizen robotu planlayıp başlangıca dönüş hatasını ölçerek toleransla karşılaştırabilir.\n\n### Haftanın planı\nHafta beş derstir; ilk dört ders yaklaşık 25-30 dakika, proje 35 dakikadır. Aşağıdaki plan günde bir ders içindir.\n\n| Gün | Ders | Süre | Ne yapılır |\n|---|---|---|---|\n| 1 | Tekerlek enkoderi: tık → mesafe | ~25 dk | Anlatımı oku, tık mesafesini elle hesapla, 1 m koşusunu çalıştır, mini testi çöz. |\n| 2 | Kesmeyle sayma ve hız hesabı | ~25 dk | Hız formülünü uygula, pencereyi 100 ve 500 ms yap, nicemlemeyi karşılaştır. |\n| 3 | Düz gitme: iki tekerleği eşitleme | ~25 dk | Düzeltmesiz ve P düzeltmeli koşuyu karşılaştır, KP değerlerini dene. |\n| 4 | Odometri: konum ve yön tahmini, sapma | ~30 dk | Formülleri elle uygula, tahmin ile gerçek konumu karşılaştır, CHANGE ve yanlış sabit deneyini yap. |\n| 5 | Proje: Kare ve sekiz çizen robot | ~35 dk | Planı tabloya yaz, şekilleri çizdir, başlangıca dönüş hatasını ölç. |\n\n### Ön koşul kontrolü\nBaşlamadan önce şunları kontrol et:\n- Kesme ve `attachInterrupt` kavramı hatırlanıyor mu? (Modül 3, ders 29)\n- `millis()` ile bloklamadan zaman ölçmek biliniyor mu? (Modül 3, ders 27)\n- İki motorlu robotu ileri sürmek ve diferansiyel sürüş tanıdık mı? (Modül 5, 1. hafta)\n- Dört işlem, yüzde ve ondalık sayılarla rahat mı? Bu hafta sayılarla çok hesap vardır.\n- Sinüs, kosinüs ve radyan 4. derste kısaca hatırlatılır; öğrenci ilk kez görüyorsa öğretmen destek verebilir.\n\n### Kavram haritası\n- **Ölçüm:** enkoder diski → tık → tık mesafesi (çevre / yuva) → kesmeyle sayma → `volatile` ve güvenli okuma\n- **Hız:** pencere → sayaç farkı → hız = Δtık · tık mesafesi / Δt → nicemleme → pencere uzlaşması\n- **Düz gitme:** iki motor farkı → tık farkı → birikme → P düzeltme (KP) → kalan sapma\n- **Odometri:** Δs, Δθ → x, y, θ → çözünürlük hatası → sistematik hata → birikme\n- **Proje:** üç hareket (düz, dönüş, daire) → mutlak açı hedefi → ölü bölge → başlangıca dönüş hatası → tolerans\n\n### Sık yapılan hatalar\n- **Yarıçap yerine çapı kullanmak.** Tık mesafesi iki kat çıkar.\n- **Santimetre ile metreyi karıştırmak.** Önce tüm uzunlukları aynı birime çevir.\n- **Sayacı `volatile` yapmamak ya da 2 baytlık sayacı kesmeleri kapatmadan okumak.**\n- **Sayacı pencere sonunda sıfırlamak.** Önceki değeri saklayıp farkı almak daha güvenlidir.\n- **Düzeltme işaretini ters yazmak.** Yavaş tekerlek daha da yavaşlar.\n- **Açıyı derece ile radyan karıştırmak.** `cos` ve `sin` radyan ister.\n- **Dönüşü sabit tık sayısı ya da göreli açıyla yapmak.** Hata her köşede birikir; mutlak açı hedefi kullan.\n- **Odometrinin kendi tahminine tam güvenmek.** Gerçek hatayı dışarıdan ölç.\n\n### Hafta sonu tekrarı\n1. Her dersin kavram kartlarına bak ve \"sık yapılan yanlış\" satırlarını yüksek sesle oku.\n2. Mini testlerde yanlış yaptığın soruların açıklamalarını yeniden oku, sonra soruyu yeniden çöz.\n3. Tık mesafesini farklı bir tekerlek için (örneğin yarıçap 4 cm, 24 yuva) elle hesapla ve 1 m için kaç tık gerektiğini bul.\n4. Aynı yolu `KP = 0` ve `KP = 20` ile çalıştırıp sapmayı karşılaştır; farkı kendi cümlenle açıkla.\n5. Şu soruyu cevapla: \"Odometri neden kendi hatasını göremez?\"\n\nHafta sonu testi olarak beş dersin mini testleri yeterlidir; her derste 5 soru, toplam 25 soru. Hedef: her dersten en az 4 doğru. Eksik kalan dersin anlatımına dön.\n\n### Proje değerlendirme ölçütü (Kare ve sekiz çizen robot)\n| Ölçüt | Gelişmeli | Yeterli | İleri |\n|---|---|---|---|\n| Plan | Plan yok | Düz, dönüş ve daire için tık hedefleri hesaplanmış | Hesaplar kodla uyuşuyor ve ölü bölge hesabı açıklanmış |\n| Düz gitme | Robot belirgin yana sapıyor | P düzeltme çalışıyor, sayaçlar yaklaşık eşit | KP değerlerini karşılaştırıp seçimini gerekçelendiriyor |\n| Dönüş | Sabit tıkla dönüyor, köşeler tutmuyor | Mutlak açı hedefi kullanıyor | Dönüş hatasını (tık çözünürlüğü) açıklıyor |\n| Sonuç | Başlangıca uzaklık ölçülmemiş | Uzaklık ölçülmüş ve tolerans ile karşılaştırılmış | KP = 0 ile karşılaştırıp düzeltmenin etkisini gösteriyor |\n| Anlatım | Ne yaptığını anlatamıyor | Planı ve sonucu adım adım anlatıyor | Hata kaynaklarını ve gerçek robotta neyin farklı olacağını söylüyor |\n\n### Veli ve öğretmen notu\n- **Amaç.** Bu hafta robotun \"ne kadar gittim, nerede olduğumu\" nasıl bildiğini öğrenir. Ölçüm, hata ve tolerans kavramları bilimsel düşünmenin temelidir; \"tam sıfır hata\" beklemeyin.\n- **Nasıl destek olunur?** Takıldığında cevabı söylemek yerine sor: \"Sayaç kaç gösteriyor, bunu santimetreye nasıl çevirirsin?\", \"Hata önce mi oluşuyor, düzeltme önce mi?\", \"Hangi sayı ölçüldü, hangisi tahmin?\"\n- **Süre.** Hesaplı bir haftadır; dersleri günlere yaymak kalıcılığı artırır.\n- **Güvenlik.** Bu platformdaki her şey sanaldır. Gerçek robot kurulursa motorları Arduino'nun 5 V pininden beslemeyin, ayrı pil kullanın, pili kısa devre yapmayın ve ilk testi robotu yerden kaldırarak yapın. Şebeke gerilimiyle (220 V) hiçbir devre kurulmaz.\n- **Gerçeklik notu.** Benzetimde tekerlek kaymaz; gerçek robotta hatalar burada ölçülenden belirgin biçimde büyük olabilir.\n- **İlerleme.** Mini test sonuçları \"İlerlemem\" sayfasında beceri bazında görünür (taslak/pilot özellik; yalnız onay verildiyse kaydedilir).",
      "lessons": [
        {
          "title": "Tekerlek enkoderi: tık → mesafe",
          "durationMin": 25,
          "problem": "Arabanın kilometre sayacı yolu nasıl biliyor? Tekerleğin kaç tur döndüğünü sayıyor, bir turun kaç metre olduğunu da biliyor. Çarpınca yolu buluyor. Senin robotun şimdiye kadar yolu hep süreye bakarak tahmin etti: \"2 saniye git, yaklaşık 60 cm olur.\" Pil bitmeye yaklaşınca ya da zemin kayganlaşınca bu tahmin tutmaz. Bu derste robota kendi kilometre sayacını takıyorsun.",
          "contentMd": "### Enkoder nedir?\nTekerleğin ya da motor milinin üstünde, kenarında yuvalar olan ince bir disk durur. Diskin iki yanında bir ışık kaynağı ve bir ışık algılayıcı vardır. Disk dönerken yuvalar ışığı sırayla geçirir ve keser. Algılayıcı her geçişte bir elektrik darbesi üretir. Bu darbelerin her birine **tık** diyeceğiz.\n\nBizim robotun enkoder diski **20 yuvalı**. Çıkış HIGH'dan LOW'a, LOW'dan HIGH'a geçer. Biz yalnız **LOW'dan HIGH'a geçişi (RISING kenarı)** sayacağız. Böylece her yuva bir tık eder: tekerlek bir tam dönünce **20 tık**.\n\n### Tık mesafeye nasıl dönüşür?\nTekerleğin yarıçapı `r = 3,3 cm`. Tekerlek bir tur dönünce yerde kendi çevresi kadar yol alır (kaymadığını varsayıyoruz):\n\n```\nçevre = 2 · π · r = 2 · 3,1416 · 3,3 cm ≈ 20,73 cm\n```\n\nBir turda 20 tık olduğuna göre bir tıkın karşılığı:\n\n```\ntık mesafesi = çevre / 20 ≈ 1,037 cm\n```\n\nTersinden bakalım: 1 metre kaç tıktır?\n\n```\n100 cm / 1,037 cm ≈ 96,5 tık\n```\n\nYani robot 1 m giderse sayaç yaklaşık 96-97 olmalı. Bunu hemen deneyeceğiz.\n\n### Devre\n| Parça | Bağlantı |\n|---|---|\n| Sol motor (sürücü L298N ya da TB6612) | EN **D5** (PWM), IN1 **D7**, IN2 **D8** |\n| Sağ motor | EN **D6** (PWM), IN3 **D9**, IN4 **D10** |\n| Sol enkoder çıkışı | **D2** (kesme pini), VCC → 5 V, GND → GND |\n| Sağ enkoder çıkışı | **D3** (kesme pini), VCC → 5 V, GND → GND |\n| Motor gücü | Motorlar için ayrı pil/güç kaynağı; sürücünün GND'si Arduino GND'siyle ortak olmalı |\n\nGüvenlik: Motorları Arduino'nun 5 V pininden besleme. Ayrı pil kullan, GND'leri birleştir. Pili kısa devre yapma, ters bağlama. Şebeke gerilimiyle (220 V) asla devre kurma.\n\nD2 ve D3, Uno'da kesme (interrupt) alabilen iki pindir. Kesme kurallarını Modül 3'ün 29. dersinde, enkoderi okumayı Modül 4'ün 57. dersinde gördün. Burada aynısını iki tekerlek için yapıyoruz.\n\n### Program\nİlk programımız iki şey yapar: robot 1 m gidecek kadar tık sayar, durur ve yolu tıklardan hesaplar.\n\n```cpp\n// sketch: tik_mesafe\nconst int EN_SOL = 5, IN1 = 7, IN2 = 8;\nconst int EN_SAG = 6, IN3 = 9, IN4 = 10;\nconst int ENK_SOL = 2, ENK_SAG = 3;\n\nconst float CEVRE = 2 * PI * 0.033;     // tekerlek çevresi (m)\nconst int YUVA = 20;                    // diskteki yuva sayısı\nconst float TIK_M = CEVRE / YUVA;       // bir tıkın mesafesi (m)\n\nvolatile unsigned int tikSol = 0;\nvolatile unsigned int tikSag = 0;\n\nvoid sayiSol() { tikSol++; }\nvoid sayiSag() { tikSag++; }\n\nvoid ilerisur(int pwm) {\n  digitalWrite(IN1, HIGH); digitalWrite(IN2, LOW);\n  digitalWrite(IN3, HIGH); digitalWrite(IN4, LOW);\n  analogWrite(EN_SOL, pwm);\n  analogWrite(EN_SAG, pwm);\n}\nvoid dur() { analogWrite(EN_SOL, 0); analogWrite(EN_SAG, 0); }\n\nunsigned int oku(volatile unsigned int &sayac) {\n  noInterrupts();                       // okurken kesme araya girmesin\n  unsigned int kopya = sayac;\n  interrupts();\n  return kopya;\n}\n\nvoid setup() {\n  Serial.begin(9600);\n  pinMode(EN_SOL, OUTPUT); pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT);\n  pinMode(EN_SAG, OUTPUT); pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT);\n  pinMode(ENK_SOL, INPUT); pinMode(ENK_SAG, INPUT);\n  attachInterrupt(digitalPinToInterrupt(ENK_SOL), sayiSol, RISING);\n  attachInterrupt(digitalPinToInterrupt(ENK_SAG), sayiSag, RISING);\n\n  Serial.print(\"Tik basina cm: \");\n  Serial.println(TIK_M * 100, 2);\n  Serial.print(\"1 m icin tik: \");\n  Serial.println(1.0 / TIK_M, 1);\n\n  int hedefTik = (int)(1.0 / TIK_M + 0.5);   // 1 m kaç tık (yuvarla)\n  ilerisur(200);\n  while (oku(tikSol) < hedefTik) {}\n  dur();\n  delay(600);                                 // robotun durmasını bekle\n\n  unsigned int s = oku(tikSol), g = oku(tikSag);\n  Serial.print(\"Sol tik: \"); Serial.println(s);\n  Serial.print(\"Sag tik: \"); Serial.println(g);\n  Serial.print(\"Mesafe (cm): \");\n  Serial.println(s * TIK_M * 100, 1);\n}\n\nvoid loop() {}\n```\n\nSeri monitörde şunu görürsün:\n\n```\nTik basina cm: 1.04\n1 m icin tik: 96.5\nSol tik: 98\nSag tik: 98\nMesafe (cm): 101.6\n```\n\n### Nasıl çalışıyor?\n1. `attachInterrupt(..., RISING)` ile D2 ve D3'e iki kesme bağladık. Pin LOW'dan HIGH'a her çıktığında ilgili `sayi...()` fonksiyonu çalışır ve sayacı bir artırır. Ana program ne yapıyor olursa olsun tık kaçmaz.\n2. Sayaçlar `volatile`. `unsigned int` 2 bayt olduğu için 8 bitlik Arduino onu tek komutla okuyamaz; okurken araya kesme girerse yarım okunmuş bir sayı çıkabilir. Bu yüzden `oku()` fonksiyonu `noInterrupts()` ile kısa bir an kesmeleri kapatıp kopya alıyor.\n3. `TIK_M` bir kez hesaplanıyor: `CEVRE / YUVA`. Mesafe = tık sayısı × `TIK_M`.\n4. Robot 97 tıkta durma komutu aldı ama **98 tık** saydık. Çünkü motor komutla anında durmaz; birkaç on milisaniye daha döner. Bu fazla tık da sayaçta görünür. Sayaç robotun gerçekte gittiği yolu söyler, senin istediğin yolu değil.\n\nBenzetim robotun gerçek konumunu da bilir. Aynı koşuda robotun gerçek yolu 101,3 cm çıktı; tıklardan hesapladığımız 101,6 cm. Fark 0,3 cm, yani bir tıkın üçte biri kadar. Sol ve sağ sayaç aynı çıktı çünkü iki tekerlek eşit döndü. Bunun hep böyle olmadığını 93. derste göreceksin.\n\n### Hedef cm'ye gitmek\nMesafe hedefi tıka çevirmek tek satır: `hedefTik = istenenCm / TIK_CM`. Aşağıdaki program 20, 50 ve 100 cm ister ve her seferinde ne kadar gittiğini ölçer.\n\n```cpp\n// sketch: tik_hedef_cm\nconst int EN_SOL = 5, IN1 = 7, IN2 = 8;\nconst int EN_SAG = 6, IN3 = 9, IN4 = 10;\nconst int ENK_SOL = 2, ENK_SAG = 3;\n\nconst float TIK_CM = 2 * PI * 3.3 / 20;   // bir tıkın mesafesi (cm)\n\nvolatile unsigned int tikSol = 0;\nvolatile unsigned int tikSag = 0;\n\nvoid sayiSol() { tikSol++; }\nvoid sayiSag() { tikSag++; }\n\nunsigned int oku(volatile unsigned int &sayac) {\n  noInterrupts();\n  unsigned int kopya = sayac;\n  interrupts();\n  return kopya;\n}\n\nvoid surus(int pwm) {\n  digitalWrite(IN1, HIGH); digitalWrite(IN2, LOW);\n  digitalWrite(IN3, HIGH); digitalWrite(IN4, LOW);\n  analogWrite(EN_SOL, pwm);\n  analogWrite(EN_SAG, pwm);\n}\n\n// istenen cm kadar ileri git, ölçülen mesafeyi (cm) döndür\nfloat ileriCm(float istenen) {\n  unsigned int baslangic = oku(tikSol);\n  unsigned int hedef = (unsigned int)(istenen / TIK_CM + 0.5);\n  surus(180);\n  while (oku(tikSol) - baslangic < hedef) {}\n  surus(0);\n  delay(500);                                   // durma payını bekle\n  return (oku(tikSol) - baslangic) * TIK_CM;\n}\n\nvoid setup() {\n  Serial.begin(9600);\n  pinMode(EN_SOL, OUTPUT); pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT);\n  pinMode(EN_SAG, OUTPUT); pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT);\n  pinMode(ENK_SOL, INPUT); pinMode(ENK_SAG, INPUT);\n  attachInterrupt(digitalPinToInterrupt(ENK_SOL), sayiSol, RISING);\n  attachInterrupt(digitalPinToInterrupt(ENK_SAG), sayiSag, RISING);\n\n  float istek[3] = {20, 50, 100};\n  for (int i = 0; i < 3; i++) {\n    float olculen = ileriCm(istek[i]);\n    Serial.print(\"Istenen: \"); Serial.print(istek[i], 0);\n    Serial.print(\" cm  Olculen: \"); Serial.print(olculen, 1);\n    Serial.println(\" cm\");\n  }\n  Serial.println(\"BITTI\");\n}\n\nvoid loop() {}\n```\n\nÇıktı:\n\n```\nIstenen: 20 cm  Olculen: 20.7 cm\nIstenen: 50 cm  Olculen: 50.8 cm\nIstenen: 100 cm  Olculen: 100.6 cm\nBITTI\n```\n\nİstenenden hep biraz fazla. İki neden var: hedef tık sayısı tam sayıya yuvarlanır (20 cm = 19,3 tık → 19 tık) ve robot kayarak durur, sayaç bir tık daha artar (19 yerine 20 tık = 20,7 cm). Önemli olan, **ölçülen** değerin gerçeğe yakın olması: benzetimde üç yolun her biri için ölçülen değer gerçek yolla 1,5 cm içinde örtüştü.\n\n### Dene\n- `YUVA` değerini 20 yerine 30 yap ve çıktıyı yorumla. Sayaç mu bozulur, mesafe hesabı mı? Gerçek robotta bu sayıyı nereden öğrenirsin?\n- `tik_hedef_cm` programında hedefi 5 cm yap. İstenen ile ölçülen arasındaki fark yüzde kaç oldu? Küçük mesafede tık çözünürlüğü neden daha çok hissedilir?\n- PWM'i 180'den 255'e çıkar. Robot aynı hedefte daha mı fazla ilerliyor? Neden?\n\n### Sık yapılan hatalar\n- Tekerlek yarıçapı yerine çapını formüle koymak: yol iki kat çıkar.\n- Santimetre ile metreyi karıştırmak: `TIK_M` metre, `TIK_CM` santimetredir.\n- Sayacı `volatile` yapmamak ya da 2 baytlık sayacı kesmeleri kapatmadan okumak.\n- Robot durdu diye sayacın da durduğunu sanmak: kayma payı sayaca girer.\n- Enkoderi yalnız bir tekerleğe bağlayıp robotun düz gittiğini varsaymak.\n\n### Gerçek robotta farklı olabilecekler\nGerçek bir tekerlek yere basınca hafifçe ezilir ve zeminde kayabilir. Çevreyi cetvelle ölçüp formüle koymak iyi bir başlangıçtır ama yine de bir hata payı kalır. Bu dersteki benzetim tekerleği kaymayan ideal bir robottur; bu yüzden ölçümler gerçeğe bu kadar yakın.",
          "question": "Tekerlek enkoderi robotun gerçekten gittiği yolu mu, yoksa tekerleğin döndüğü yolu mu ölçer? İkisi ne zaman aynı olmaz?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Enkoder diskinin ve **tık** kavramının ne olduğunu\n- Tekerlek yarıçapından bir tıkın kaç santimetre yol ettiğini hesaplamayı\n- Tıkları neden kesmeyle saydığımızı ve sayacın neden `volatile` olduğunu\n- Robotun \"istediğin yol\" ile \"gerçekte gittiği yol\" arasındaki farkı\n\n### Önceden bilmen gerekenler\n- Kesme ve `attachInterrupt` (Modül 3, ders 29)\n- Enkoderden tık okumak (Modül 4, ders 57)\n- İki motorlu robotun ileri sürülmesi ve PWM (bu modülün 1. haftası)\n\n### Süreye değil, dönüşe bakmak\nŞimdiye kadar robota \"2 saniye git\" dedin ve yaklaşık bir yol aldı. Pil zayıflayınca ya da zemin kayganlaşınca aynı iki saniye başka bir mesafe verir. Daha iyi yol, tekerleğin kaç kez döndüğünü saymaktır. Bunu yapan parça **enkoder**dir.\n\n### Disk, yuva ve tık\nEnkoder, tekerlekle birlikte dönen ve kenarında yuvalar olan ince bir disktir. Diskin bir yanında ışık kaynağı, öbür yanında ışık algılayıcı bulunur. Yuva geçerken ışık görünür, disk kısmı geçerken kesilir. Algılayıcının çıkışı her geçişte LOW'dan HIGH'a çıkar. Biz yalnız bu **RISING** kenarı sayarız ve her sayıma bir **tık** deriz.\n\nBizim diskte 20 yuva var, yani tekerlek bir tur dönünce 20 tık gelir.\n\n### Tıktan mesafeye\nTekerlek bir tur dönünce kendi çevresi kadar yol alır (kaymadığını varsayıyoruz). Yarıçap r = 3,3 cm için:\n\n```\nçevre        = 2 · π · r      = 20,73 cm\ntık mesafesi = çevre / yuva   = 20,73 / 20 = 1,037 cm\nmesafe       = tık sayısı · 1,037 cm\n```\n\nTersi de işe yarar: hedef mesafe / 1,037 bize kaç tık gerektiğini söyler. 1 metre için bu 96,5 tıktır. Sayaç tam sayı olduğu için hedef yuvarlanır ve mesafe 1 cm'lik basamaklarla ölçülür.\n\n### Tıkları kaçırmamak\nRobot başka işle uğraşırken bir yuva geçebilir. Bu yüzden her tekerlek için bir kesme pini (D2 ve D3) kullanılır. Kesme fonksiyonu yalnız sayacı artırır, başka bir şey yapmaz. Sayaç kesme içinde değiştiği için `volatile` olmalıdır; yoksa derleyici `loop()` içinde eski değeri kullanabilir. Sayaç `unsigned int` (2 bayt) olduğundan, okurken araya kesme girmesin diye okuma `noInterrupts()` ve `interrupts()` arasına alınır.\n\n### Sayaç gerçeği söyler, niyeti değil\nRobota 97 tıkta dur dediğinde motor anında durmaz, birkaç on milisaniye daha döner ve sayaç 98'e çıkar. Sayaç robotun **gerçekte gittiği** yolu verir. Bu yüzden ölçülen değer çoğu zaman istenenden biraz fazladır.\n\n### Özet\nEnkoder, tekerleğin her yuva geçişini bir tık olarak sayar. Tık mesafesi çevre bölü yuva sayısıdır; yarıçapı 3,3 cm olan 20 yuvalı tekerlekte 1,037 cm eder. Tıklar kesmeyle sayılır, sayaç `volatile` olur ve güvenli okunur. Sayaç, robotun istediğin değil gerçekte aldığı yolu gösterir.",
          "concepts": [
            {
              "term": "Enkoder diski",
              "definition": "Kenarında yuvalar bulunan ve tekerlekle birlikte dönen disk; her yuva geçişi bir elektrik darbesi üretir.",
              "example": "20 yuvalı disk, tekerlek bir tur dönünce 20 darbe verir.",
              "pitfall": "Enkoderin tekerleğin hızını doğrudan ölçtüğünü sanmak; yalnız darbe sayar, hızı sen hesaplarsın."
            },
            {
              "term": "Tık",
              "definition": "Sayacın saydığı tek bir darbe; burada LOW'dan HIGH'a her geçiş (RISING).",
              "example": "Tekerlek tam bir tur dönünce 20 tık sayılır.",
              "pitfall": "Kesmeyi CHANGE yapıp tık sayısını 20 sanmak; her yuva iki kenar verir ve sayı 40 olur."
            },
            {
              "term": "Tık mesafesi",
              "definition": "Bir tıkın karşılığı yoldur: 2·π·r bölü yuva sayısı.",
              "example": "r = 3,3 cm ve 20 yuva için 20,73 / 20 = 1,037 cm.",
              "pitfall": "Yarıçap yerine çapı formüle koymak; yol iki kat çıkar."
            },
            {
              "term": "volatile",
              "definition": "Değişkenin kesme gibi program akışı dışında değişebileceğini derleyiciye söyleyen anahtar sözcük.",
              "example": "volatile unsigned int tikSol; sayacı kesme artırır, loop() okur.",
              "pitfall": "volatile yazmayı unutmak; loop() sayacın eski kopyasını görebilir."
            },
            {
              "term": "Güvenli okuma",
              "definition": "2 baytlık sayacı noInterrupts() ve interrupts() arasında kopyalayarak okumak.",
              "example": "unsigned int kopya = sayac; komutunu iki çağrı arasına koymak.",
              "pitfall": "Okurken araya kesme girerse yarım okunmuş, saçma bir sayı çıkabilir."
            }
          ],
          "quiz": [
            {
              "id": "m5h4d91-q1",
              "kind": "numeric",
              "prompt": "Bir robotun tekerlek yarıçapı 4 cm ve enkoder diskinde 24 yuva var. Yalnız RISING kenarı sayılıyor. Bir tıkın karşılığı kaç santimetredir?",
              "answer": 1.05,
              "tolerance": 0.01,
              "unit": "cm",
              "explanation": "Çevre 2·π·4 = 25,13 cm; 24 yuvaya bölününce 1,047 cm çıkar, yani yaklaşık 1,05. Yarıçap yerine çapı (8 cm) kullansaydın 2,09 bulurdun; bu yaygın bir hatadır.",
              "skills": [
                "rob-encoder",
                "rob-ticks-distance"
              ]
            },
            {
              "id": "m5h4d91-q2",
              "kind": "numeric",
              "prompt": "Tık mesafesi 1,037 cm olan bir robotun sol sayacı 150 tık gösteriyor. Robot yaklaşık kaç santimetre yol almıştır?",
              "answer": 155.5,
              "tolerance": 0.2,
              "unit": "cm",
              "explanation": "Mesafe = tık sayısı · tık mesafesi = 150 · 1,037 = 155,5 cm. Tekerlek kaymıyorsa sayaç yolu bu kadar yakın verir.",
              "skills": [
                "rob-ticks-distance"
              ]
            },
            {
              "id": "m5h4d91-q3",
              "kind": "find-bug",
              "prompt": "Robot 97 tıkta durması için aşağıdaki gibi yazıldı ama bazen hiç durmuyor. Tek hata nerede?\n\n```\nunsigned int tikSol = 0;\n\nvoid sayiSol() { tikSol++; }\n\nvoid setup() {\n  attachInterrupt(digitalPinToInterrupt(2), sayiSol, RISING);\n}\n\nvoid loop() {\n  if (tikSol >= 97) { dur(); }\n}\n```",
              "options": [
                "tikSol değişkeni volatile değil; loop() kesmenin artırdığı değeri görmeyebilir",
                "attachInterrupt setup() içinde çağrılmamalı",
                "RISING yerine LOW yazılmalı",
                "D2 numaralı pin kesme alamaz"
              ],
              "answer": 0,
              "explanation": "Sayaç kesme içinde değiştiği için volatile olmalıdır; aksi hâlde derleyici değeri bir yazmaçta tutup loop() içinde hep eski değeri okuyabilir. attachInterrupt'ın yeri setup()'tır, D2 Uno'da kesme pinidir ve RISING sayım için doğru kenardır.",
              "skills": [
                "rob-interrupt-count",
                "prog-debug"
              ]
            },
            {
              "id": "m5h4d91-q4",
              "kind": "mcq",
              "prompt": "Robota 97 tıkta dur komutu verildi, fakat sayaç sonunda 98 gösteriyor. Bunun asıl nedeni nedir?",
              "options": [
                "Sayaç kodu hatalıdır",
                "Motor komutla anında durmaz, kayarak bir tık daha döner ve sayaç bunu da sayar",
                "Enkoder diski yanlış yuva sayısına sahiptir",
                "Kesme bir tıkı iki kez saymıştır"
              ],
              "answer": 1,
              "explanation": "Motorun ve robotun eylemsizliği yüzünden durma komutundan sonra tekerlek biraz daha döner. Sayaç gerçek dönüşü doğru sayar; ölçülen yol istenenden küçük bir miktar fazla olur. Kod ya da disk hatalı değildir.",
              "skills": [
                "rob-encoder",
                "rob-interrupt-count"
              ]
            },
            {
              "id": "m5h4d91-q5",
              "kind": "predict-output",
              "prompt": "Bu kod seri monitöre ne yazar? (tık mesafesi 1,037 cm)\n\n```\nconst float TIK_CM = 2 * PI * 3.3 / 20;\n\nvoid setup() {\n  Serial.begin(9600);\n  Serial.println((int)(30.0 / TIK_CM + 0.5));\n}\n\nvoid loop() {}\n```",
              "options": [
                "28",
                "29",
                "30",
                "31"
              ],
              "answer": 1,
              "explanation": "30 / 1,0367 = 28,94; 0,5 eklenince 29,44 olur ve (int) dönüşümü kesip 29 verir. Bu, hedef mesafeyi en yakın tam tık sayısına yuvarlama kalıbıdır.",
              "skills": [
                "rob-ticks-distance",
                "prog-debug"
              ]
            }
          ]
        },
        {
          "title": "Kesmeyle sayma ve hız hesabı",
          "durationMin": 25,
          "problem": "Bir sürücü gösterge panelinde \"28 km/s\" yazıyor. Aracın içinde hız ölçen ayrı bir alet yok; yalnızca tekerleğin dönüşünü sayan bir sensör var. Hız, \"yol bölü süre\"dir. Peki robot saniyede binlerce işi yaparken, tıkları kaçırmadan sayıp hızı nasıl hesaplarız? Pencere kısa olursa ne olur, uzun olursa ne olur?",
          "contentMd": "### Kesme tıkı kaçırmaz\n91. derste tıkları `attachInterrupt` ile saydın. Aynı yöntem burada da geçerli: kesme fonksiyonu **kısa** olmalı (yalnız sayacı artır), `loop()` ise sayaçları okuyup hesabı yapmalı. Kesme içinde `Serial.print` ya da uzun hesap yapma (Modül 3, ders 29).\n\nHız formülü:\n\n```\nhız = Δtık · tık_mesafesi / Δt\n```\n\n`Δtık` = bir **pencere** içinde gelen tık sayısı, `Δt` = pencerenin süresi. Pencere 100 ms (0,1 s) olsun ve tık mesafesi 1,037 cm. Pencerede 3 tık geldiyse:\n\n```\nhız = 3 · 1,037 cm / 0,1 s ≈ 31,1 cm/s\n```\n\n### Devre\n91. dersteki devreyle aynı: motorlar D5/D7/D8 ve D6/D9/D10, enkoderler D2 (sol) ve D3 (sağ). Motorlar için ayrı güç ve ortak GND'yi unutma.\n\n### Program\nRobot iki motoru PWM 200 ile sürer. Program her 100 ms'de tık farkını alıp iki tekerleğin hızını yazar. `delay` yok; zamanı `millis()` ile ölçüyoruz (Modül 3, ders 27).\n\n```cpp\n// sketch: hiz_olc\nconst int EN_SOL = 5, IN1 = 7, IN2 = 8;\nconst int EN_SAG = 6, IN3 = 9, IN4 = 10;\nconst int ENK_SOL = 2, ENK_SAG = 3;\n\nconst float TIK_M = 2 * PI * 0.033 / 20;\nconst unsigned long PENCERE_MS = 100;\n\nvolatile unsigned int tikSol = 0;\nvolatile unsigned int tikSag = 0;\n\nvoid sayiSol() { tikSol++; }\nvoid sayiSag() { tikSag++; }\n\nunsigned int oku(volatile unsigned int &sayac) {\n  noInterrupts();\n  unsigned int kopya = sayac;\n  interrupts();\n  return kopya;\n}\n\nunsigned long sonOlcum = 0;\nunsigned int oncekiSol = 0, oncekiSag = 0;\n\nvoid setup() {\n  Serial.begin(9600);\n  pinMode(EN_SOL, OUTPUT); pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT);\n  pinMode(EN_SAG, OUTPUT); pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT);\n  pinMode(ENK_SOL, INPUT); pinMode(ENK_SAG, INPUT);\n  attachInterrupt(digitalPinToInterrupt(ENK_SOL), sayiSol, RISING);\n  attachInterrupt(digitalPinToInterrupt(ENK_SAG), sayiSag, RISING);\n\n  digitalWrite(IN1, HIGH); digitalWrite(IN2, LOW);\n  digitalWrite(IN3, HIGH); digitalWrite(IN4, LOW);\n  analogWrite(EN_SOL, 200);\n  analogWrite(EN_SAG, 200);\n}\n\nvoid loop() {\n  unsigned long simdi = millis();\n  if (simdi - sonOlcum >= PENCERE_MS) {\n    float dt = (simdi - sonOlcum) / 1000.0;     // gerçek geçen süre (s)\n    sonOlcum = simdi;\n\n    unsigned int s = oku(tikSol), g = oku(tikSag);\n    unsigned int dSol = s - oncekiSol;          // pencerede gelen tık\n    unsigned int dSag = g - oncekiSag;\n    oncekiSol = s; oncekiSag = g;\n\n    float vSol = dSol * TIK_M / dt;             // m/s\n    float vSag = dSag * TIK_M / dt;\n\n    Serial.print(\"t=\"); Serial.print(simdi);\n    Serial.print(\" dtik=\"); Serial.print(dSol);\n    Serial.print(\" vSol=\"); Serial.print(vSol * 100, 1);\n    Serial.print(\" vSag=\"); Serial.println(vSag * 100, 1);\n  }\n}\n```\n\nSeri çıktının ilk satırları (cm/s):\n\n```\nt=100 dtik=1 vSol=10.4 vSag=10.4\nt=200 dtik=3 vSol=31.1 vSag=31.1\nt=300 dtik=2 vSol=20.7 vSag=20.7\nt=400 dtik=3 vSol=31.1 vSag=31.1\nt=500 dtik=3 vSol=31.1 vSag=31.1\nt=600 dtik=2 vSol=20.7 vSag=20.7\n```\n\n### Nasıl çalışıyor?\n1. `oncekiSol` son pencerenin sonundaki sayacı tutar. `s - oncekiSol` o pencerede gelen tık sayısıdır. İşaretsiz çıkarma, sayaç 65535'ten 0'a dönse bile doğru fark verir (millis'te gördüğün taşma kuralı, Modül 3 ders 27).\n2. `dt` olarak 0,1 yazmak yerine gerçekte geçen süreyi kullandık. `loop()` başka işle meşgulse pencere 100 ms'den biraz uzun olabilir; formül yine doğru kalır.\n3. Hız yalnız **tam sayıda tık** ile hesaplanır. Pencerede 2 tık varsa 20,7 cm/s, 3 tık varsa 31,1 cm/s çıkar; arası yoktur.\n\n### Gerçekle karşılaştırma\nBenzetim robotun gerçek tekerlek hızını da bilir (`wL · yarıçap`). Aynı koşuda gerçek hız, ilk yarım saniyelik hızlanmadan sonra **28,8 cm/s** (tekerlek 8,7 rad/s · 3,3 cm) oldu. Ölçümümüz 2 ve 3 tık arasında gidip geldi: 20,7 ve 31,1 cm/s. Ortalaması gerçeğe yakın (28,8), ama tek bir ölçüm gerçeğin 8 cm/s kadar altında ya da üstünde olabilir.\n\nBunun nedeni **nicemleme**: sayaç yalnız tam sayı verir. Çözünürlük:\n\n```\nen küçük hız adımı = tık_mesafesi / pencere = 1,037 cm / 0,1 s ≈ 10,4 cm/s\n```\n\nYani 100 ms pencerede hızı en iyi ihtimalle 10,4 cm/s'lik basamaklarla görürsün.\n\n### Pencere seçimi: gürültü ile gecikme\nPencereyi uzatırsan basamak küçülür: 500 ms'de 1,037 / 0,5 ≈ 2,1 cm/s. Ama hız değişirse ölçüm geç tepki verir; 500 ms'lik bir ortalama, yarım saniye öncesini de içerir.\n\nAşağıdaki program robotu **düşük hızda** (PWM 100) sürer ve iki hesabı yan yana yazar: son 100 ms'lik ve son 500 ms'lik (5 pencerelik) hız.\n\n```cpp\n// sketch: hiz_pencere\nconst int EN_SOL = 5, IN1 = 7, IN2 = 8;\nconst int EN_SAG = 6, IN3 = 9, IN4 = 10;\nconst int ENK_SOL = 2, ENK_SAG = 3;\n\nconst float TIK_M = 2 * PI * 0.033 / 20;\nconst unsigned long PENCERE_MS = 100;\nconst int N = 5;                                // uzun pencere = 5 kısa pencere\n\nvolatile unsigned int tikSol = 0;\nvolatile unsigned int tikSag = 0;\n\nvoid sayiSol() { tikSol++; }\nvoid sayiSag() { tikSag++; }\n\nunsigned int oku(volatile unsigned int &sayac) {\n  noInterrupts();\n  unsigned int kopya = sayac;\n  interrupts();\n  return kopya;\n}\n\nunsigned int gecmis[N];                         // son N ölçümdeki sol sayaç\nint sira = 0;\nunsigned long sonOlcum = 0;\n\nvoid setup() {\n  Serial.begin(9600);\n  pinMode(EN_SOL, OUTPUT); pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT);\n  pinMode(EN_SAG, OUTPUT); pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT);\n  pinMode(ENK_SOL, INPUT); pinMode(ENK_SAG, INPUT);\n  attachInterrupt(digitalPinToInterrupt(ENK_SOL), sayiSol, RISING);\n  attachInterrupt(digitalPinToInterrupt(ENK_SAG), sayiSag, RISING);\n\n  digitalWrite(IN1, HIGH); digitalWrite(IN2, LOW);\n  digitalWrite(IN3, HIGH); digitalWrite(IN4, LOW);\n  analogWrite(EN_SOL, 100);                     // düşük hız\n  analogWrite(EN_SAG, 100);\n}\n\nvoid loop() {\n  unsigned long simdi = millis();\n  if (simdi - sonOlcum >= PENCERE_MS) {\n    sonOlcum = simdi;\n    unsigned int s = oku(tikSol);\n\n    unsigned int eski = gecmis[sira];           // 5 ölçüm önceki sayaç\n    unsigned int onceki = gecmis[(sira + N - 1) % N];   // bir önceki ölçüm\n    gecmis[sira] = s;\n    sira = (sira + 1) % N;\n\n    float v100 = (s - onceki) * TIK_M / 0.1;\n    float v500 = (s - eski) * TIK_M / (N * 0.1);\n\n    Serial.print(\"v100=\"); Serial.print(v100 * 100, 1);\n    Serial.print(\" v500=\"); Serial.println(v500 * 100, 1);\n  }\n}\n```\n\nİlk yarım saniye `gecmis[]` henüz dolmadığı için değerler yanlıştır; onları yok say. Sonrasında (cm/s):\n\n```\nv100=10.4 v500=10.4\nv100=10.4 v500=10.4\nv100=0.0 v500=8.3\nv100=10.4 v500=8.3\n```\n\nBu hızda gerçek hız **9,4 cm/s** (tekerlek 2,9 rad/s). Sonuçlar:\n- **100 ms penceresi** yalnız 0 ya da 10,4 cm/s verir. Robot sürekli hareket ederken bazı ölçümlerde \"durdu\" (0.0) görünür. Standart sapma yaklaşık 2,9 cm/s.\n- **500 ms penceresi** 8,3 ile 10,4 arasında kalır. Standart sapma yaklaşık 1,0 cm/s; ama hız aniden değişirse ölçüm yarım saniye gecikmeli olur.\n- İki ölçümün **ortalaması** da gerçek hıza yakındır (9,4). Sorun tek tek değerlerde.\n\nHız ölçümüne dayanan bir kontrol (5. hafta) dalgalı bir hız görürse boşuna tepki verir. Bu yüzden ya pencereyi uzatır ya da ölçümü yumuşatırsın (Modül 3, ders 14).\n\n### Dene\n- `hiz_olc` programında `PENCERE_MS` değerini 500 yap. Çıktıda ne görüyorsun? Çözünürlük ne oldu, ölçüm ne kadar geç güncelleniyor?\n- `hiz_pencere` programında `analogWrite` değerini 100'den 200'e çıkar. 100 ms penceresinin dalgalanması azalıyor mu? Neden?\n- Kesme modunu `RISING` yerine `CHANGE` yap ve `TIK_M` formülünde 20'yi 40 yap (bu durumda her yuva iki tık verir). Hız çözünürlüğü nasıl değişir?\n- İki tık arasındaki süreyi `micros()` ile ölçüp hız hesaplamayı düşün: düşük hızda hangi yöntem daha ince sonuç verir? Kâğıt üzerinde düşün, sonra dene.\n\n### Sık yapılan hatalar\n- Kesme fonksiyonunun içine `Serial.print` ya da uzun hesap koymak.\n- `dt` yerine sabit 0,1 kullanıp `loop()` yavaşlayınca hatalı hız hesaplamak.\n- Sayaçları pencere sonunda sıfırlamak: kesme araya girerse bir tık kaybolur. Önceki değeri saklayıp çıkarmak daha güvenlidir.\n- Pencere süresini `int` ile tutmak ya da `simdi - sonOlcum` yerine toplama kullanmak.\n- Düşük hızda kısa pencere kullanıp \"robot durdu\" diye karar vermek.\n\n### Gerçek robotta farklı olabilecekler\nGerçek enkoder modülünün çıkışı zıplayabilir ya da yuva genişlikleri eşit olmayabilir; bu ek gürültü demektir. Benzetimdeki tıklar mükemmel aralıklıdır, bu yüzden gerçek robotta ölçümler buradakinden daha dalgalı olabilir.",
          "question": "Robot 30 cm/s ile giderken 20 ms'lik pencere mi, 500 ms'lik pencere mi daha iyi hız ölçer? Engele çarpmak üzere olan bir robotun hızına ne kadar gecikmeyle güvenebilirsin?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Hızın tık sayısı ve pencere süresinden nasıl hesaplandığını\n- Sayaç farkı almanın (öncekini saklayıp çıkarmanın) neden güvenli olduğunu\n- **Nicemleme**nin hız çözünürlüğünü nasıl sınırladığını\n- Kısa ve uzun pencerenin artı ve eksilerini\n\n### Önceden bilmen gerekenler\n- Tıkın ne olduğu, tık mesafesi ve kesmeyle sayma (91. ders)\n- `millis()` ile bloklamadan zaman ölçmek (Modül 3, ders 27)\n- Kesme fonksiyonunun kısa tutulması (Modül 3, ders 29)\n\n### Hız bir orandır\nHız, alınan yolun geçen süreye bölünmesidir. Enkoderde yol tıktan gelir:\n\n```\nhız = Δtık · tık_mesafesi / Δt\n```\n\nΔtık, bir **pencere** içinde gelen tık sayısıdır. Pencere 100 ms, tık mesafesi 1,037 cm ise ve pencerede 3 tık geldiyse hız 3 · 1,037 / 0,1 = 31,1 cm/s olur.\n\n### Farkı nasıl alırız?\nSayacı her pencere sonunda sıfırlamak cazip görünür ama risklidir: okumayla sıfırlama arasında gelen tık kaybolur. Daha güvenli yol, bir önceki pencerenin sonundaki değeri saklamak ve farkı almaktır:\n\n```\nunsigned int s = oku(tikSol);\nunsigned int d = s - oncekiSol;   // pencerede gelen tık\noncekiSol = s;\n```\n\nİşaretsiz çıkarma sayaç 65535'ten 0'a dönse bile doğru sonuç verir. Örneğin 65534 ile 3 arasındaki fark 5 tıktır. Süre için de sabit 0,1 yazmak yerine gerçekte geçen süreyi (`millis()` farkını) kullan; `loop()` yavaşlarsa formül yine doğru kalır.\n\n### Nicemleme: ölçüm basamaklıdır\nSayaç yalnız tam sayı verir. 100 ms'lik pencerede 2 tık 20,7 cm/s, 3 tık 31,1 cm/s demektir; arası yoktur. En küçük hız adımı:\n\n```\nadım = tık_mesafesi / pencere = 1,037 / 0,1 ≈ 10,4 cm/s\n```\n\nGerçek hız 28,8 cm/s olsa bile ölçümün 20,7 ile 31,1 arasında gidip geldiğini görürsün. Düşük hızda durum daha belirgindir: robot sürekli hareket ederken bazı pencerelerde 0 tık gelir ve ölçüm \"durdu\" der.\n\n### Pencere seçimi\nPencereyi 500 ms yaparsan adım 1,037 / 0,5 ≈ 2,1 cm/s'ye düşer, ölçüm sakinleşir. Ama ölçüm son yarım saniyenin ortalamasıdır; hız aniden değişirse geç tepki verir.\n\n| Pencere | Adım | Tepki |\n|---|---|---|\n| Kısa (100 ms) | Büyük, dalgalı | Hızlı |\n| Uzun (500 ms) | Küçük, sakin | Gecikmeli |\n\nMühendislikte bu bir uzlaşmadır: hıza dayalı bir kontrol dalgalı ölçüme boşuna tepki verir, gecikmeli ölçüme ise geç tepki verir.\n\n### Özet\nHız, pencerede gelen tık sayısı çarpı tık mesafesi bölü pencere süresidir. Sayaç sıfırlanmaz; önceki değer saklanıp çıkarılır ve süre gerçekten ölçülür. Sayaç tam sayı verdiği için hız basamaklıdır; basamak büyüklüğü tık mesafesi bölü pencere kadardır. Kısa pencere hızlı ama dalgalı, uzun pencere sakin ama gecikmeli ölçer.",
          "concepts": [
            {
              "term": "Pencere",
              "definition": "Tıkları saydığımız sabit zaman dilimi; hız bu dilimdeki tık farkından hesaplanır.",
              "example": "Her 100 ms'de bir sayaç okunur ve önceki değerle farkı alınır.",
              "pitfall": "Pencereyi çok kısa seçmek; düşük hızda 0 tık gelir ve robot durmuş gibi görünür."
            },
            {
              "term": "Sayaç farkı",
              "definition": "Şimdiki sayaç değerinden bir önceki ölçümde saklanan değeri çıkarmak.",
              "example": "s - oncekiSol, pencerede gelen tık sayısını verir.",
              "pitfall": "Sayacı pencere sonunda sıfırlamak; okumayla sıfırlama arasında gelen tık kaybolur."
            },
            {
              "term": "Nicemleme",
              "definition": "Sürekli bir değerin yalnız tam sayı basamaklarla ölçülmesi.",
              "example": "100 ms pencerede hız yalnız 0, 10,4, 20,7 veya 31,1 cm/s gibi basamaklarla görünür.",
              "pitfall": "Tek ölçümdeki sıçramayı gerçek bir hız değişimi sanmak."
            },
            {
              "term": "Hız çözünürlüğü",
              "definition": "Ölçülebilen en küçük hız farkı: tık mesafesi bölü pencere süresi.",
              "example": "1,037 cm / 0,5 s ≈ 2,1 cm/s.",
              "pitfall": "Pencereyi uzatınca ölçümün hem daha ince hem de daha hızlı olacağını sanmak; gecikme artar."
            },
            {
              "term": "Gerçek dt",
              "definition": "Hızı hesaplarken sabit sayı yerine iki ölçüm arasında millis() ile ölçülen gerçek süreyi kullanmak.",
              "example": "float dt = (simdi - sonOlcum) / 1000.0;",
              "pitfall": "loop() yavaşlayınca sabit 0,1 kullanmak ve hızı olduğundan yüksek hesaplamak."
            }
          ],
          "quiz": [
            {
              "id": "m5h4d92-q1",
              "kind": "numeric",
              "prompt": "Tık mesafesi 1,037 cm. 100 ms'lik bir pencerede sayaç 4 tık arttı. Hız kaç cm/s'dir?",
              "answer": 41.48,
              "tolerance": 0.1,
              "unit": "cm/s",
              "explanation": "Hız = 4 · 1,037 / 0,1 = 41,48 cm/s. Süreyi milisaniye olarak (100) bölseydin sonuç 1000 kat küçük çıkardı; birimi saniyeye çevir.",
              "skills": [
                "rob-speed-window"
              ]
            },
            {
              "id": "m5h4d92-q2",
              "kind": "numeric",
              "prompt": "Aynı robot için pencere 250 ms olursa ölçülebilecek en küçük hız adımı kaç cm/s olur? (tık mesafesi 1,037 cm)",
              "answer": 4.148,
              "tolerance": 0.05,
              "unit": "cm/s",
              "explanation": "Adım = tık mesafesi / pencere = 1,037 / 0,25 = 4,148 cm/s. 100 ms'de bu adım 10,4 idi; pencere uzayınca basamak küçülür.",
              "skills": [
                "rob-quantization",
                "rob-speed-window"
              ]
            },
            {
              "id": "m5h4d92-q3",
              "kind": "mcq",
              "prompt": "Hız ölçümünde pencereyi 100 ms'den 500 ms'ye çıkarırsan ne olur?",
              "options": [
                "Ölçüm hem daha ince hem de hız değişimine daha hızlı tepki verir",
                "Ölçüm daha ince ve sakin olur ama hız değişimine geç tepki verir",
                "Ölçüm kabalaşır ama daha hızlı tepki verir",
                "Hiçbir şey değişmez"
              ],
              "answer": 1,
              "explanation": "Pencere uzayınca hız adımı küçülür, ölçüm sakinleşir; ama sonuç son yarım saniyenin ortalaması olduğundan değişimi gecikmeyle gösterir. İnce ve hızlı ölçüm aynı anda elde edilmez.",
              "skills": [
                "rob-quantization",
                "rob-speed-window"
              ]
            },
            {
              "id": "m5h4d92-q4",
              "kind": "find-bug",
              "prompt": "Aşağıdaki hız hesabında tek bir güvenlik hatası var. Hangisi?\n\n```\nif (simdi - sonOlcum >= 100) {\n  float dt = (simdi - sonOlcum) / 1000.0;\n  sonOlcum = simdi;\n  unsigned int d = oku(tikSol);\n  tikSol = 0;\n  Serial.println(d * TIK_CM / dt);\n}\n```",
              "options": [
                "tikSol = 0; satırı: okuma ile sıfırlama arasında gelen tık kaybolur",
                "dt hesabında 1000.0 yerine 100 yazılmalı",
                "oku() fonksiyonu kullanılmamalı",
                "sonOlcum güncellenmemeli"
              ],
              "answer": 0,
              "explanation": "Okuma ile sıfırlama arasında bir tık gelirse sıfırlama onu siler. Güvenli yol önceki değeri saklayıp farkı almaktır. dt'deki 1000.0 milisaniyeyi saniyeye çevirmek için doğrudur, oku() ise tam da kesme güvenliği için vardır.",
              "skills": [
                "rob-interrupt-count",
                "prog-debug"
              ]
            },
            {
              "id": "m5h4d92-q5",
              "kind": "predict-output",
              "prompt": "AVR Arduino'da unsigned int 2 bayttır. Bu kod ne yazar?\n\n```\nunsigned int onceki = 65534;\nunsigned int simdi = 3;\n\nvoid setup() {\n  Serial.begin(9600);\n  Serial.println(simdi - onceki);\n}\n\nvoid loop() {}\n```",
              "options": [
                "-65531",
                "65531",
                "5",
                "0"
              ],
              "answer": 2,
              "explanation": "İşaretsiz aritmetik 65536'ya göre taşar: 3 - 65534 = -65531, bu da 65536 eklenince 5 olur. Sayaç 65535'ten 0'a dönse bile fark doğru çıkar. Negatif sonuç işaretsiz türde oluşmaz.",
              "skills": [
                "rob-interrupt-count",
                "prog-timing"
              ]
            }
          ]
        },
        {
          "title": "Düz gitme: iki tekerleği eşitleme",
          "durationMin": 25,
          "problem": "Market arabasının tekerleklerinden biri bozuk olunca araba hep bir yana çeker, sen de sürekli direksiyonla düzeltirsin. Robotun direksiyonu yok; iki motoru aynı komutu alıyor ama biri biraz daha az dönüyor. İkisine de \"git\" demek robotu düz götürmez. Robotun bir \"direksiyon eli\" olması gerekir: iki tekerleğin sayaçlarına bakıp geride kalanı hızlandırmak.",
          "contentMd": "### İki motor asla aynı değildir\nAynı model iki DC motor bile farklı çalışır: sürtünme, fırça aşınması, sürücüdeki gerilim düşümü, tekerleğin zemine basışı. Aynı PWM'de biri biraz daha yavaş döner. Benzetimde bunu `gain` ile verebiliriz: sağ tekerleğin verimi **%90** olsun (`gain: {left: 1, right: 0.9}`). Yani PWM aynı ama sağ tekerlek %10 yavaş.\n\n### Devre\nÖnceki derslerle aynı: motorlar D5/D7/D8 ve D6/D9/D10, enkoderler D2 (sol) ve D3 (sağ). Motorlar için ayrı güç ve ortak GND.\n\n### Program 1: ayarsız ilerleme\nÖnce düzeltmesiz sürelim. Robot iki motora da PWM 200 verip ortalama 193 tık (yaklaşık 2 m) gidiyor. Sonunda iki sayacı yazıyor.\n\n```cpp\n// sketch: duz_ham\nconst int EN_SOL = 5, IN1 = 7, IN2 = 8;\nconst int EN_SAG = 6, IN3 = 9, IN4 = 10;\nconst int ENK_SOL = 2, ENK_SAG = 3;\n\nconst float TIK_M = 2 * PI * 0.033 / 20;\nconst int HEDEF_TIK = 193;                      // yaklaşık 2 m\n\nvolatile unsigned int tikSol = 0;\nvolatile unsigned int tikSag = 0;\n\nvoid sayiSol() { tikSol++; }\nvoid sayiSag() { tikSag++; }\n\nunsigned int oku(volatile unsigned int &sayac) {\n  noInterrupts();\n  unsigned int kopya = sayac;\n  interrupts();\n  return kopya;\n}\n\nvoid setup() {\n  Serial.begin(9600);\n  pinMode(EN_SOL, OUTPUT); pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT);\n  pinMode(EN_SAG, OUTPUT); pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT);\n  pinMode(ENK_SOL, INPUT); pinMode(ENK_SAG, INPUT);\n  attachInterrupt(digitalPinToInterrupt(ENK_SOL), sayiSol, RISING);\n  attachInterrupt(digitalPinToInterrupt(ENK_SAG), sayiSag, RISING);\n\n  digitalWrite(IN1, HIGH); digitalWrite(IN2, LOW);\n  digitalWrite(IN3, HIGH); digitalWrite(IN4, LOW);\n  analogWrite(EN_SOL, 200);                     // iki tekerleğe aynı PWM\n  analogWrite(EN_SAG, 200);\n\n  while ((oku(tikSol) + oku(tikSag)) / 2 < HEDEF_TIK) {}\n  analogWrite(EN_SOL, 0);\n  analogWrite(EN_SAG, 0);\n  delay(600);\n\n  Serial.print(\"Sol tik: \"); Serial.println(oku(tikSol));\n  Serial.print(\"Sag tik: \"); Serial.println(oku(tikSag));\n  Serial.println(\"BITTI\");\n}\n\nvoid loop() {}\n```\n\nSağ tekerlek %10 yavaşken sonuç (benzetimde, geniş bir zeminde, robot x yönünde başlıyor):\n\n```\nSol tik: 205\nSag tik: 185\n```\n\nSol tekerlek 20 tık fazla attı. Fark `1,037 cm · 20 ≈ 21 cm` demek ve iki tekerlek arası 12 cm olduğu için robot sağa doğru **yaklaşık 100° döndü**. Robotun yaptığı yol 2 m ama bir **yay**: başlangıç noktasından yalnızca 1,1 m ileri gidip **137 cm yana** kaydı. Sağ tekerlek yalnız %5 yavaş olsaydı (`gain` 0,95): sayaçlar 200 ve 190, yana sapma **82 cm**. Tekerlekler tam eşit olunca (`gain` 1) sapma 0 cm.\n\nKüçük bir verim farkının 2 m sonunda koca bir yay olmasının nedeni, hatanın **birikmesidir**: robot bir kez hafifçe yana döndü mü, geri kalan yolun hepsini artık o yöne doğru gider.\n\n### Çözüm: sayaç farkına bak\nTık farkı (`sol − sağ`) robotun yöne ne kadar dönmüş olduğunu söyler. Fark 1 tık demek yaklaşık 1 cm yol farkı, yaklaşık 5° yön hatası demek (nedenini bir sonraki derste hesaplayacağız). Farkı sıfıra yaklaştırırsak robot düz gider.\n\n**Orantılı (P) düzeltme:** hata ne kadar büyükse düzeltme o kadar büyük olsun.\n\n```\nhata   = sol_tık − sağ_tık          (pozitif: sol önde)\nPWM_sol = 200 − KP · hata\nPWM_sağ = 200 + KP · hata\n```\n\nSol önde ise sol motoru kısıyoruz, sağı artırıyoruz. `KP`, tık farkı başına kaç PWM düzeltme yapılacağını söyler. Her tur sayaçları yeniden okuyup yeniden hesaplıyoruz.\n\n### Program 2: P düzeltmeli ilerleme\n\n```cpp\n// sketch: duz_p\nconst int EN_SOL = 5, IN1 = 7, IN2 = 8;\nconst int EN_SAG = 6, IN3 = 9, IN4 = 10;\nconst int ENK_SOL = 2, ENK_SAG = 3;\n\nconst int HEDEF_TIK = 193;                      // yaklaşık 2 m\nconst int BAZ_PWM = 200;\nconst float KP = 20.0;                          // tık farkı başına PWM\n\nvolatile unsigned int tikSol = 0;\nvolatile unsigned int tikSag = 0;\n\nvoid sayiSol() { tikSol++; }\nvoid sayiSag() { tikSag++; }\n\nunsigned int oku(volatile unsigned int &sayac) {\n  noInterrupts();\n  unsigned int kopya = sayac;\n  interrupts();\n  return kopya;\n}\n\nvoid setup() {\n  Serial.begin(9600);\n  pinMode(EN_SOL, OUTPUT); pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT);\n  pinMode(EN_SAG, OUTPUT); pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT);\n  pinMode(ENK_SOL, INPUT); pinMode(ENK_SAG, INPUT);\n  attachInterrupt(digitalPinToInterrupt(ENK_SOL), sayiSol, RISING);\n  attachInterrupt(digitalPinToInterrupt(ENK_SAG), sayiSag, RISING);\n\n  digitalWrite(IN1, HIGH); digitalWrite(IN2, LOW);\n  digitalWrite(IN3, HIGH); digitalWrite(IN4, LOW);\n}\n\nvoid loop() {\n  int sol = oku(tikSol), sag = oku(tikSag);\n  if ((sol + sag) / 2 >= HEDEF_TIK) {\n    analogWrite(EN_SOL, 0);\n    analogWrite(EN_SAG, 0);\n    delay(600);\n    Serial.print(\"Sol tik: \"); Serial.println(oku(tikSol));\n    Serial.print(\"Sag tik: \"); Serial.println(oku(tikSag));\n    Serial.println(\"BITTI\");\n    while (true) {}\n  }\n  int hata = sol - sag;                         // > 0: sol önde\n  int pwmSol = constrain(BAZ_PWM - KP * hata, 0, 255);\n  int pwmSag = constrain(BAZ_PWM + KP * hata, 0, 255);\n  analogWrite(EN_SOL, pwmSol);\n  analogWrite(EN_SAG, pwmSag);\n}\n```\n\nAynı robotla (sağ tekerlek %10 yavaş) sonuç:\n\n```\nSol tik: 195\nSag tik: 195\n```\n\n### Sonuç: sayılarla\nBaşlangıç noktasından 2 m ileri gidince **yanal sapma** `|y − y0|` (benzetimin bildiği gerçek konumdan; gerçek robotta şerit metre ile ölçersin):\n\n| Durum | Sağ verim | Sapma |\n|---|---|---|\n| Düzeltmesiz | %100 | 0 cm |\n| Düzeltmesiz | %95 | 82 cm |\n| Düzeltmesiz | %90 | 137 cm |\n| P düzeltmeli, `KP = 5` | %90 | 25,5 cm |\n| P düzeltmeli, `KP = 20` | %95 | 3,3 cm |\n| P düzeltmeli, `KP = 20` | %90 | 6,7 cm |\n| P düzeltmeli, `KP = 40` | %90 | 3,4 cm |\n\nDüzeltme sapmayı yaklaşık **20 kat** azalttı (137 cm → 6,7 cm). `KP` büyüdükçe sapma küçüldü. Sıfır olmadı, çünkü düzeltme ancak bir tık farkı oluştuktan **sonra** devreye giriyor: hata önce ortaya çıkar, sonra düzeltilir. İlk anlarda robot biraz yana gider; sapmanın tamamı bu geçiş anında birikir. Sonunda iki sayaç eşit çıktı (195 ve 195).\n\n`KP` istediğin kadar büyütülemez: PWM 0-255 aralığıyla sınırlı, ayrıca ölçüm tık tık geliyor. Bu ayarın inceliklerini 5. haftada (P, D, I) çalışacağız.\n\n### Dene\n- `KP` değerini 5 ve 40 yap. Çıktıdaki sayaçlar eşit kaldı mı? Yolun sonunda robot yine de yana kaydı mı?\n- Benzetimde bu sefer **sol** tekerleği yavaşlat (`gain: {left: 0.9, right: 1}`). Aynı program düzeltir mi? Hangi satır hangi tekerleği kısıyor?\n- `BAZ_PWM`'i 120'ye düşür. Robot daha yavaş gider ve düzeltme için PWM payı kalır. Sapma değişti mi?\n- Düzeltmeyi yalnızca sağ tekerleğe uygula (sol hep 200 kalsın). Ne değişir?\n\n### Sık yapılan hatalar\n- Düzeltme işaretini ters yazmak: yavaş tekerlek daha da yavaşlar, robot daha çok sapar.\n- Tek tekerleğin sayacına bakıp mesafeyi ölçmek: bir tekerlek yay çizerken öbürü farklı yol alır, ortalama almak daha doğrudur.\n- `KP` çok küçük seçip \"düzeltme çalışmıyor\" demek.\n- Sayaç farkını `int`e çevirmeden `unsigned` çıkarmak: negatif fark çok büyük bir sayıya dönüşür.\n\n### Gerçek robotta farklı olabilecekler\nGerçek robotta tekerlek verim farkı sabit değildir: pil gerilimi düştükçe, zemin değiştikçe, motorlar ısındıkça değişir. Benzetimde fark sabit tutulmuştur; bu yüzden gerçek robotta düzeltmenin tek bir `KP` ile iyi çalışmasını garanti sayma, sahada ayarla.",
          "question": "Düzeltme olmadan 2 m yürüyen robot neden \"biraz\" değil de çok yana kaydı? P düzeltmesi hatayı hiç sıfırlayamıyorsa sence ne eklenmeli?",
          "explainerMd": "### Bu derste öğreneceklerin\n- İki aynı motorun neden aynı hızda dönmediğini\n- Tık farkının robotun yön hatasına nasıl çevrildiğini\n- **Orantılı (P) düzeltme** kuralını yazmayı ve işaretini doğru seçmeyi\n- Düzeltmenin neden sapmayı sıfırlamadığını, yalnız küçülttüğünü\n\n### Önceden bilmen gerekenler\n- Tık, tık mesafesi ve iki tekerleğe ayrı sayaç (91. ders)\n- Sayaç farkı almak (92. ders)\n- Diferansiyel sürüş: iki tekerleğin hız farkı robotu döndürür (bu modülün 1. haftası)\n\n### İki motor asla aynı değildir\nİki motora aynı PWM verirsin ama biri biraz daha yavaş döner: sürtünme, aşınma, sürücüdeki gerilim düşümü hepsi farklıdır. Sağ tekerlek %10 yavaşsa, 200 tıklık bir yolda sol 205, sağ 185 tık atar. Bu, 20 tık yani yaklaşık 20,7 cm yol farkıdır.\n\n### Küçük fark, büyük yay\nTekerlekler arası uzaklık L = 12 cm ise yol farkı robotu şu kadar döndürür:\n\n```\nΔθ = (sağ yol − sol yol) / L = 20,7 / 12 ≈ 1,73 rad ≈ 99°\n```\n\nYani yalnız %10'luk fark, iki metrelik yolda robotu neredeyse dik açıyla saptırır. Bunun nedeni hatanın **birikmesidir**: robot bir kez hafifçe yana baktı mı, yolun geri kalanını o yöne doğru gider.\n\nPratik bir kural: 1 tık fark yaklaşık 1 cm yol farkı, yaklaşık 5° yön hatasıdır (1,037 / 12 rad).\n\n### Sayaç farkı yön hatasını söyler\nRobot düz gidiyorsa iki sayaç eşit artmalıdır. Hata şöyle tanımlanır:\n\n```\nhata = sol_tık − sağ_tık       (pozitif: sol önde)\n```\n\n### Orantılı (P) düzeltme\nHata ne kadar büyükse düzeltme o kadar büyük olsun:\n\n```\npwmSol = BAZ − KP · hata\npwmSag = BAZ + KP · hata\n```\n\nSol önde ise sol motoru kısar, sağı artırırsın. `KP`, tık farkı başına kaç PWM düzeltme yapılacağını belirler. PWM 0-255 aralığıyla sınırlı olduğundan sonuç `constrain` ile kırpılır. Örneğin KP = 20 ve hata 3 ise sol 200 − 60 = 140, sağ 200 + 60 = 260 olur; sağ 255'e kırpılır.\n\nİşaret çok önemlidir. Ters yazarsan yavaş tekerlek daha da yavaşlar ve sapma büyür.\n\n### Sıfır olmayan kalan sapma\nDüzeltme ancak bir fark oluştuktan sonra devreye girer; hata önce doğar, sonra düzeltilir. Bu yüzden sapma küçülür ama sıfırlanmaz. Benzetimde düzeltmesiz 137 cm olan sapma KP = 20 ile 6,7 cm'ye indi, yani yaklaşık 20 kat azaldı. KP büyüdükçe sapma küçülür, fakat sınırsız büyütülemez: PWM sınırlıdır ve ölçüm tık tık gelir.\n\n### Özet\nAynı PWM iki motoru aynı hızda döndürmez ve bu fark birikerek robotu yay çizdirir. Tık farkı yön hatasının ölçüsüdür. P düzeltme geride kalanı hızlandırıp öndekini yavaşlatır; işareti doğru olmalı, sonuç 0-255'e kırpılmalıdır. Düzeltme sapmayı büyük ölçüde azaltır ama hata önce oluştuğu için sıfırlayamaz.",
          "concepts": [
            {
              "term": "Tık farkı",
              "definition": "Sol ve sağ sayaç arasındaki fark; robotun düz gidip gitmediğini gösterir.",
              "example": "Sol 205, sağ 185 ise fark 20 tıktır ve sol öndedir.",
              "pitfall": "Tek tekerleğin sayacına bakıp düz gidildiğini sanmak."
            },
            {
              "term": "Birikme",
              "definition": "Küçük bir yön hatasının, robot o yöne gitmeye devam ettikçe büyümesi.",
              "example": "%10 yavaş bir tekerlek 2 m sonunda robotu 137 cm yana kaydırır.",
              "pitfall": "Küçük bir farkın küçük sonuç vereceğini düşünmek."
            },
            {
              "term": "P (orantılı) düzeltme",
              "definition": "Düzeltmenin hatayla orantılı olduğu kural: düzeltme = KP · hata.",
              "example": "hata 3 tık ve KP 20 ise 60 PWM'lik düzeltme yapılır.",
              "pitfall": "İşareti ters yazmak; yavaş tekerlek daha da yavaşlar."
            },
            {
              "term": "KP",
              "definition": "Hata başına ne kadar PWM düzeltme yapılacağını belirleyen katsayı.",
              "example": "KP = 20 ile 1 tık fark 20 PWM'lik düzeltme ister.",
              "pitfall": "KP'yi çok küçük seçip düzeltmenin çalışmadığını düşünmek."
            },
            {
              "term": "constrain",
              "definition": "Bir değeri verilen alt ve üst sınır arasında tutan fonksiyon.",
              "example": "constrain(260, 0, 255) sonucu 255'tir.",
              "pitfall": "Kırpmayı unutup PWM'e 255'i aşan ya da negatif değer göndermek."
            }
          ],
          "quiz": [
            {
              "id": "m5h4d93-q1",
              "kind": "numeric",
              "prompt": "Düzeltmesiz bir koşuda sol sayaç 205, sağ sayaç 185 tık gösterdi. Tık mesafesi 1,037 cm ise iki tekerlek arasındaki yol farkı kaç cm'dir?",
              "answer": 20.7,
              "tolerance": 0.2,
              "unit": "cm",
              "explanation": "Fark 20 tıktır; 20 · 1,037 = 20,7 cm. Bu fark robotun yönünü değiştirir ve yol boyunca birikir.",
              "skills": [
                "rob-ticks-distance",
                "rob-straight-p"
              ]
            },
            {
              "id": "m5h4d93-q2",
              "kind": "numeric",
              "prompt": "Yol farkı 20,7 cm ve iki tekerlek arası L = 12 cm ise robot yaklaşık kaç derece döner? (Açı = fark / L, sonra dereceye çevir.)",
              "answer": 99,
              "tolerance": 1,
              "unit": "derece",
              "explanation": "Açı = 20,7 / 12 = 1,73 rad; bunu 180/π ile çarpınca yaklaşık 99° çıkar. Santimetre ile metreyi karıştırmamak için iki uzunluğu aynı birimde tut.",
              "skills": [
                "rob-straight-p",
                "rob-drift"
              ]
            },
            {
              "id": "m5h4d93-q3",
              "kind": "predict-output",
              "prompt": "BAZ_PWM 200, KP 20 ve hata 3 (sol önde). Bu kod ne yazar?\n\n```\nint hata = 3;\nint pwmSol = constrain(200 - 20 * hata, 0, 255);\nint pwmSag = constrain(200 + 20 * hata, 0, 255);\nSerial.print(pwmSol);\nSerial.print(\" \");\nSerial.println(pwmSag);\n```",
              "options": [
                "260 140",
                "140 260",
                "140 255",
                "200 200"
              ],
              "answer": 2,
              "explanation": "Sol 200 - 60 = 140 olur. Sağ 200 + 60 = 260 çıkar ama constrain 255'e kırpar. Bu yüzden çıktı 140 255'tir; PWM 255'in üstüne çıkamaz.",
              "skills": [
                "rob-straight-p",
                "prog-debug"
              ]
            },
            {
              "id": "m5h4d93-q4",
              "kind": "find-bug",
              "prompt": "Sol tekerlek önde (hata = sol - sag pozitif) ama robot düzelmek yerine daha çok sapıyor. Tek hata nedir?\n\n```\nint hata = sol - sag;\nint pwmSol = constrain(BAZ + KP * hata, 0, 255);\nint pwmSag = constrain(BAZ - KP * hata, 0, 255);\n```",
              "options": [
                "constrain kullanılmamalı",
                "Düzeltme işareti ters: önde olan sol motor artırılıyor, sağ kısılıyor",
                "Hata sayaçlardan değil, PWM değerlerinden hesaplanmalı",
                "BAZ değeri 255 olmalı"
              ],
              "answer": 1,
              "explanation": "Sol öndeyse sol motor kısılmalı, sağ artırılmalıdır. Burada tersi yapılıyor ve fark büyüyor. Hata zaten sayaçlardan doğru hesaplanıyor, constrain ise gerekli ve doğru; sorun yalnız işarettir.",
              "skills": [
                "rob-straight-p",
                "prog-debug"
              ]
            },
            {
              "id": "m5h4d93-q5",
              "kind": "mcq",
              "prompt": "P düzeltme açıkken bile robot 2 m sonunda birkaç santimetre yana kayıyor. Bunun temel nedeni nedir?",
              "options": [
                "Düzeltme hata oluştuktan sonra devreye girer; hata önce birikir, sonra azaltılır",
                "Enkoderler hiç tık saymaz",
                "KP negatif olmalıdır",
                "Robot düz giderken P düzeltme çalışmaz"
              ],
              "answer": 0,
              "explanation": "P düzeltme hata ölçüldükten sonra tepki verir, bu yüzden ilk anlarda küçük bir sapma kaçınılmazdır. Düzeltme çalışıyor ve sapmayı yaklaşık 20 kat küçültüyor; negatif KP ise işareti ters çevirip kötüleştirirdi.",
              "skills": [
                "rob-straight-p",
                "rob-drift"
              ]
            }
          ]
        },
        {
          "title": "Odometri: konum ve yön tahmini, sapma",
          "durationMin": 30,
          "problem": "Işıkları kapalı, tam karanlık bir odada gözün kapalıyken yürüdüğünü düşün. \"İleri 5 adım, sola dön, 3 adım\" diye sayarsan nerede olduğunu kabaca bilirsin. Ne kadar uzun yürürsen tahminin o kadar bozulur. Robotlar da bunu yapar. Buna **odometri** denir: tekerleklerin döndüğü miktardan robotun nerede olduğunu ve nereye baktığını hesaplamak. Peki bu tahmine ne kadar güvenebiliriz?",
          "contentMd": "### Formüller\n91. derste tıklardan her tekerleğin aldığı yolu bulduk: `ΔsL` (sol) ve `ΔsR` (sağ), küçük bir zaman adımında. Robotun iki tekerlek arası uzaklık `L = 12 cm`.\n\n**Merkezin aldığı yol:** iki tekerleğin ortalaması.\n\n```\nΔs = (ΔsL + ΔsR) / 2\n```\n\n**Dönüş açısı:** sağ tekerlek soldan `d` kadar fazla yol aldıysa robot sola döner. İki tekerlek aynı daire etrafında farklı yarıçapla yürür; yarıçap farkı `L`, yay farkı `d` olduğundan açı `d / L` olur (yay = açı × yarıçap). Sola dönüşü pozitif sayıyoruz:\n\n```\nΔθ = (ΔsR − ΔsL) / L\n```\n\n(76. derste gördüğün `ω = (vR − vL) / L` formülünün yol karşılığı.)\n\n**Konum:** robot Δs kadar, baktığı yönde ilerler. Adım içinde yön de değiştiği için adımın **ortasındaki** yönü kullanırız:\n\n```\nx ← x + Δs · cos(θ + Δθ/2)\ny ← y + Δs · sin(θ + Δθ/2)\nθ ← θ + Δθ\n```\n\n`θ = 0` robotun +x eksenine baktığı, pozitif açı sola dönüş anlamına gelir. Başlangıçta `x = y = θ = 0` alırız: odometri \"robotun başladığı yer\" ölçü sisteminde çalışır.\n\nBu hesabı çok sık (örneğin her `loop()` turunda) yaparsan adımlar küçük kalır ve tahmin doğru çıkar.\n\n### Tek kanallı enkoder yönü bilmez\nBizim enkoderimiz yalnız \"bir yuva geçti\" der; tekerleğin ileri mi geri mi döndüğünü söylemez. Yönü biz **komuttan** biliriz: motoru geri sürdüysek tıkları eksi sayarız. Programda `yonSol` ve `yonSag` son verilen yönü tutar. Dışarıdan itilen ya da kayarak geri giden bir robotu bu enkoderle doğru izleyemezsin. (Bu yüzden gerçek robotlarda genellikle iki kanallı enkoder kullanılır; Modül 4'te döner enkoderde A/B kanalıyla yönü bulmuştun.)\n\n### Devre\n91. dersin devresiyle aynı: motorlar D5/D7/D8 ve D6/D9/D10, enkoderler D2 ve D3, ayrı motor gücü ve ortak GND.\n\n### Program 1: bir yol çiz, tahmini yaz\nRobot şu yolu izler: 1 m ileri, 90° sola dön, 0,5 m ileri, 90° sola dön, 1 m ileri. Her adımdan sonra odometri tahminini (cm ve derece) yazar. İleri giderken 93. dersteki P düzeltmesini kullanır.\n\n```cpp\n// sketch: odometri_temel\nconst int EN_SOL = 5, IN1 = 7, IN2 = 8;\nconst int EN_SAG = 6, IN3 = 9, IN4 = 10;\nconst int ENK_SOL = 2, ENK_SAG = 3;\n\nconst float TIK_M = 2 * PI * 0.033 / 20;   // bir tıkın mesafesi (m)\nconst float L = 0.12;                      // iki tekerlek arası (m)\n\nvolatile unsigned int tikSol = 0;\nvolatile unsigned int tikSag = 0;\nunsigned int oncekiSol = 0, oncekiSag = 0;\nint yonSol = 1, yonSag = 1;                // tek kanallı enkoder yön bilmez\n\nfloat x = 0, y = 0, th = 0;                // tahmin: m, m, rad\n\nvoid sayiSol() { tikSol++; }\nvoid sayiSag() { tikSag++; }\n\nunsigned int oku(volatile unsigned int &sayac) {\n  noInterrupts();\n  unsigned int kopya = sayac;\n  interrupts();\n  return kopya;\n}\n\nvoid odometriGuncelle() {\n  unsigned int s = oku(tikSol), g = oku(tikSag);\n  float dsSol = yonSol * (int)(s - oncekiSol) * TIK_M;\n  float dsSag = yonSag * (int)(g - oncekiSag) * TIK_M;\n  oncekiSol = s; oncekiSag = g;\n\n  float ds = (dsSol + dsSag) / 2;          // merkezin aldığı yol\n  float dth = (dsSag - dsSol) / L;         // dönüş (sola +)\n  x += ds * cos(th + dth / 2);             // ortadaki yönü kullan\n  y += ds * sin(th + dth / 2);\n  th += dth;\n}\n\nvoid motorlar(int sol, int sag) {          // -255..255\n  digitalWrite(IN1, sol > 0); digitalWrite(IN2, sol < 0);\n  digitalWrite(IN3, sag > 0); digitalWrite(IN4, sag < 0);\n  analogWrite(EN_SOL, abs(sol));\n  analogWrite(EN_SAG, abs(sag));\n  if (sol != 0) yonSol = sol > 0 ? 1 : -1;\n  if (sag != 0) yonSag = sag > 0 ? 1 : -1;\n}\n\nvoid bekle(unsigned long ms) {             // beklerken de tıkları say\n  unsigned long t = millis();\n  while (millis() - t < ms) odometriGuncelle();\n}\n\nvoid ileriGit(float metre) {               // ders 93'teki P düzeltmesi\n  float baslangicX = x, baslangicY = y;\n  unsigned int s0 = oku(tikSol), g0 = oku(tikSag);\n  while (hypot(x - baslangicX, y - baslangicY) < metre - 0.01) {\n    odometriGuncelle();\n    int hata = (int)(oku(tikSol) - s0) - (int)(oku(tikSag) - g0);\n    motorlar(constrain(200 - 20 * hata, 0, 255), constrain(200 + 20 * hata, 0, 255));\n  }\n  motorlar(0, 0);\n  bekle(400);\n}\n\nvoid solaDon(float derece) {\n  float hedef = th + derece * PI / 180;\n  motorlar(-100, 100);                     // yerinde dön\n  while (th < hedef - 0.05) odometriGuncelle();\n  motorlar(0, 0);\n  bekle(400);\n}\n\nvoid yaz(const char* ad) {\n  Serial.print(ad);\n  Serial.print(\" x=\"); Serial.print(x * 100, 1);\n  Serial.print(\" y=\"); Serial.print(y * 100, 1);\n  Serial.print(\" aci=\"); Serial.println(th * 180 / PI, 1);\n}\n\nvoid setup() {\n  Serial.begin(9600);\n  pinMode(EN_SOL, OUTPUT); pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT);\n  pinMode(EN_SAG, OUTPUT); pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT);\n  pinMode(ENK_SOL, INPUT); pinMode(ENK_SAG, INPUT);\n  attachInterrupt(digitalPinToInterrupt(ENK_SOL), sayiSol, RISING);\n  attachInterrupt(digitalPinToInterrupt(ENK_SAG), sayiSag, RISING);\n\n  ileriGit(1.0);   yaz(\"1\");\n  solaDon(90);     yaz(\"2\");\n  ileriGit(0.5);   yaz(\"3\");\n  solaDon(90);     yaz(\"4\");\n  ileriGit(1.0);   yaz(\"5\");\n  Serial.println(\"BITTI\");\n}\n\nvoid loop() {}\n```\n\nSeri çıktı (x, y cm; açı derece):\n\n```\n1 x=101.6 y=0.0 aci=0.0\n2 x=101.3 y=0.3 aci=89.1\n3 x=102.1 y=52.1 aci=89.1\n4 x=101.8 y=51.8 aci=178.2\n5 x=0.3 y=55.0 aci=178.2\n```\n\n### Nasıl çalışıyor?\n1. `odometriGuncelle()` yalnız **son çağrıdan beri** gelen tıkları (`s - oncekiSol`) alır, formülleri uygular ve `x`, `y`, `th` değerlerini günceller. Çok sık çağrıldığı için `bekle()` ve `while` döngülerinin içinde de çağırıyoruz; robot dönerken ya da kayarak dururken sayılan tıklar kaybolmasın.\n2. Dönüşü `th`'a bakarak durduruyoruz: `th`, hedefe yaklaşınca (0,05 rad = ~3° kala) motorlar kapanır. Robot durmadan önce biraz daha döner.\n3. Robota 90° dedik; odometri **89,1°** gördü, robot gerçekte yaklaşık 94° döndü. Tıklar 5°'lik adımlarla geldiği için tahmin böyle kaba kalır (aşağıda).\n\n### Tahmin ne kadar doğru? Gerçekle karşılaştırma\nBenzetim robotun gerçek konumunu bilir. Aynı koşuda gerçek konum:\n\n| | x (cm) | y (cm) | yön (derece) |\n|---|---|---|---|\n| Odometri tahmini | 0,3 | 55,0 | 178,2 |\n| Gerçek (benzetim) | −2,4 | 36,9 | 188,1 |\n\nAradaki mesafe **yaklaşık 18 cm**; yön 10° şaşmış. Yolun toplamı yalnız 2,5 m. Neden bu kadar şaşırdı? İlk dönüş sırasında gerçek robot 94° döndü, odometri 89° gördü. Çünkü tekerlek bir yuvanın ortasındayken durursa o yarım yuva sayılmaz. Bu **nicemleme hatası**: bir tık yaklaşık 1,04 cm yol, iki tekerlek arası 12 cm olduğu için **bir tık = 5° dönüş belirsizliği**. 5° ile 1 m yürürsen 9 cm yana kayarsın. Hata dönüşte oluşur, sonraki düz yolda büyür.\n\n**Çözüm 1: çözünürlüğü artır.** Kesmeyi `RISING` yerine `CHANGE` yaparsan her yuvada iki kenar (LOW→HIGH ve HIGH→LOW) sayılır; tık sayısı 40, `TIK_M` yarıya iner (0,52 cm). Aynı program, bu iki değişiklikle:\n\n```\ntahmin: x=−2,9  y=36,9  yön=188,1\ngerçek: x=−2,4  y=36,9  yön=188,1\n```\n\nFark **0,5 cm**. Hata neredeyse yok oldu.\n\n### Sapma: birikim ve sistematik hata\nÇözünürlük artınca hata yok olmadı mı? Hayır, yalnızca bir cins hata yok oldu. Ölçtüğümüz sayılar doğru olsa bile formüldeki **sabitler** yanlışsa tahmin yanlış çıkar.\n\nDeneyi CHANGE'li programla yapalım. Programdaki sayıları aynı bırakalım, ama benzetimdeki robotu değiştirelim:\n\n| Gerçek robot | Tahmin (aynı kaldı) | Gerçek konum farkı |\n|---|---|---|\n| Doğru (r = 3,3 cm, L = 12 cm) | x=−2,9 y=36,9 | 0,5 cm |\n| Tekerlek yarıçapı 3,45 cm (yazılımda 3,3) | x=−2,9 y=36,9 | 14,1 cm |\n| Aks aralığı 12,5 cm (yazılımda 12) | x=−2,9 y=36,9 | 13,7 cm |\n\nYazılım tekerleğin yarıçapını 1,5 mm az, aks aralığını 5 mm az bilirse tahmin 2,5 m'lik yolda 14 cm şaşar. Programın **kendisi** hatayı göremez; çünkü tıklar doğru sayılmıştır, formül kandırılmıştır. Ölçüm hatası birikir: yol uzadıkça artar.\n\nYön için bu hatayı yerinde dönerek görelim. Program, robotu iki tam tur döndürür (tahmin 720° olunca durur):\n\n```cpp\n// sketch: donus_birikim\nconst int EN_SOL = 5, IN1 = 7, IN2 = 8;\nconst int EN_SAG = 6, IN3 = 9, IN4 = 10;\nconst int ENK_SOL = 2, ENK_SAG = 3;\n\nconst float TIK_M = 2 * PI * 0.033 / 20;\nconst float L = 0.12;                      // iki tekerlek arası (m): ölçüm hatası buraya girer\n\nvolatile unsigned int tikSol = 0;\nvolatile unsigned int tikSag = 0;\nunsigned int oncekiSol = 0, oncekiSag = 0;\nfloat th = 0;                              // tahmini yön (rad)\n\nvoid sayiSol() { tikSol++; }\nvoid sayiSag() { tikSag++; }\n\nunsigned int oku(volatile unsigned int &sayac) {\n  noInterrupts();\n  unsigned int kopya = sayac;\n  interrupts();\n  return kopya;\n}\n\nvoid yonGuncelle() {\n  unsigned int s = oku(tikSol), g = oku(tikSag);\n  float dsSol = -(int)(s - oncekiSol) * TIK_M;   // sol tekerlek geri\n  float dsSag = (int)(g - oncekiSag) * TIK_M;    // sağ tekerlek ileri\n  oncekiSol = s; oncekiSag = g;\n  th += (dsSag - dsSol) / L;\n}\n\nvoid setup() {\n  Serial.begin(9600);\n  pinMode(EN_SOL, OUTPUT); pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT);\n  pinMode(EN_SAG, OUTPUT); pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT);\n  pinMode(ENK_SOL, INPUT); pinMode(ENK_SAG, INPUT);\n  attachInterrupt(digitalPinToInterrupt(ENK_SOL), sayiSol, RISING);\n  attachInterrupt(digitalPinToInterrupt(ENK_SAG), sayiSag, RISING);\n\n  digitalWrite(IN1, LOW);  digitalWrite(IN2, HIGH);   // sol geri\n  digitalWrite(IN3, HIGH); digitalWrite(IN4, LOW);    // sağ ileri\n  analogWrite(EN_SOL, 100);\n  analogWrite(EN_SAG, 100);\n\n  while (th < 4 * PI - 0.1) yonGuncelle();            // 2 tam tur\n  analogWrite(EN_SOL, 0);\n  analogWrite(EN_SAG, 0);\n  delay(500);\n  yonGuncelle();\n\n  Serial.print(\"Tahmin (derece): \");\n  Serial.println(th * 180 / PI, 0);\n}\n\nvoid loop() {}\n```\n\nBenzetimde sonuç:\n\n| Gerçek aks aralığı | Odometri tahmini | Robotun gerçek dönüşü | Fark |\n|---|---|---|---|\n| 12 cm (yazılımla aynı) | 723° | 720° | 3° |\n| 12,5 cm | 723° | 691° | 32° |\n\nAks aralığı %4 yanlışken iki turda 32° sapma çıktı; yani tur başına yaklaşık 16°. Dönüş sayısı arttıkça fark **orantılı** büyür: 10 turda 160° civarı olurdu. Bu yüzden uzun yolda odometri yön hatası, konum hatasını da büyütür.\n\n### Gerçek robotta durum daha kötü\nBenzetimde tekerlek **kaymaz**. Bu yüzden tıklar yolu kusursuz verir ve hata yalnız yukarıdaki iki nedenden gelir: tık çözünürlüğü ve yanlış sabitler. Gerçek robotta ek olarak:\n- Tekerlek kayar (gaz verince, dönerken, tozlu zeminde); enkoder dönüşü sayar ama robot o kadar gitmemiştir.\n- Zemin eğimi, tekerlek aşınması, tekerleğin yere basarken ezilmesi yarıçapı değiştirir.\n- Engele çarpınca tekerlek döner, robot yerinde durur.\n\nBu hatalar birikir ve odometri kendini asla düzeltmez. Yüzlerce adım sonra tahmin tamamen yanlış olabilir. Çözüm, odometriyi başka bir sensörle düzeltmektir: yön için jiroskop (6. haftada IMU, 7. haftada enkoderle birleştirme), konum için çizgi ya da duvar.\n\n### Dene\n- `odometri_temel` programında kesmeyi `CHANGE` yap ve `TIK_M` formülündeki 20'yi 40'a çevir. Tahmin ile gerçek konum nasıl yaklaşıyor? (Karşılaştırma için benzetimin gerçek konumuna bak.)\n- `L` değerini 0,13 yap. Aynı yolun sonunda tahmin nasıl değişiyor? Kendi robotunda aks aralığını nasıl ölçerdin?\n- `donus_birikim` programında dönüş hızını (PWM 100) değiştir. Odometri tahmini ile robotun gerçek dönüşü arasındaki fark değişiyor mu? Sabit bir ölçüm hatasının hıza bağlı olup olmadığını düşün.\n- Odometrinin `yonSol`/`yonSag` değişkenlerini sabit 1 yap ve robotu geri sür. Tahmin ne olur?\n\n### Sık yapılan hatalar\n- Açıyı derece ile radyan karıştırmak: `cos` ve `sin` radyan ister.\n- Tekerlek yolunun işaretini (geri giderken eksi) unutmak.\n- Dönüş sırasında ya da `delay` içinde odometriyi güncellememek: tıklar sayaçta birikir ama `x`, `y`, `th` hesabında o an yön yanlış kullanılır.\n- Dönüş formülünde `L` yerine `L/2` kullanmak (ya da tersi): açı iki kat şaşar.\n- Yarıçap ve aks aralığını tahminle yazmak, cetvelle ölçmemek.",
          "question": "Odometri hatasının biriktiğini gördün. Robotun başlangıç noktasına döndüğünü nasıl anlarsın? Bir kareyi çizdikten sonra \"başladığım yere döndüm\" demek için neye güvenebilirsin?",
          "explainerMd": "### Bu derste öğreneceklerin\n- **Odometri**nin ne olduğunu ve tık farkından konum ile yönün nasıl hesaplandığını\n- Üç formülü: merkezin yolu, dönüş açısı ve konum güncellemesi\n- Hatanın iki kaynağını: tık çözünürlüğü ve yanlış sabitler\n- Odometrinin neden zamanla sapıp kendini düzeltemediğini\n\n### Önceden bilmen gerekenler\n- Tık ve tık mesafesi (91. ders), sayaç farkı (92. ders)\n- İki tekerlek farkıyla dönüş ve P düzeltme (93. ders)\n- Sinüs, kosinüs ve radyan; bu derste kısaca hatırlatılır\n\n### Odometri nedir?\nGözün kapalı yürürken \"5 adım ileri, sola dön, 3 adım\" diye sayarsan nerede olduğunu kabaca bilirsin. **Odometri**, robotun tekerlek dönüşlerinden kendi konumunu (x, y) ve yönünü (θ) hesaplamasıdır. Başlangıç x = y = θ = 0 alınır; θ = 0 robotun +x yönüne baktığı, pozitif açı sola dönüştür.\n\n### Üç formül\nKüçük bir zaman adımında sol tekerlek ΔsL, sağ tekerlek ΔsR yol aldı (tık sayısı çarpı tık mesafesi). Tekerlekler arası uzaklık L = 12 cm:\n\n```\nΔs  = (ΔsL + ΔsR) / 2          merkezin aldığı yol\nΔθ  = (ΔsR − ΔsL) / L          dönüş (sola pozitif)\nx  += Δs · cos(θ + Δθ/2)\ny  += Δs · sin(θ + Δθ/2)\nθ  += Δθ\n```\n\nAdım içinde yön de değiştiği için konumda adımın ortasındaki yön (θ + Δθ/2) kullanılır. Bu hesabı `loop()` içinde ve beklerken de sık sık çağırırsın; adımlar küçük kalırsa tahmin iyi olur. `cos` ve `sin` radyan ister, dereceyle çağırma.\n\nBizim enkoder yön söylemez; geri sürülen tekerleğin tıklarını eksi saymak için son verilen yön komuttan bilinir.\n\n### Hata kaynağı 1: tık çözünürlüğü\nBir tık yaklaşık 1,04 cm yoldur; 12 cm'lik aks aralığında bu yaklaşık 5° dönüş belirsizliği demektir. Robot 90° dönmeye çalışırken odometri 89° görür, gerçekte 94° dönmüş olabilir. 5° ile 1 m yürürsen yaklaşık 9 cm yana kayarsın. Çözüm: kesmeyi `CHANGE` yapıp her yuvada iki kenar saymak; tık sayısı 40 olur, tık mesafesi 0,52 cm'e iner ve benzetimde fark 0,5 cm'e düşer.\n\n### Hata kaynağı 2: yanlış sabitler\nÇözünürlük artsa bile tahmin, formüldeki sayılar yanlışsa yanlış kalır. Yarıçap 3,3 yerine gerçekte 3,45 cm ise ya da aks aralığı 12 yerine 12,5 cm ise 2,5 m'lik yolda tahmin yaklaşık 14 cm şaşar. Program bunu göremez, çünkü tıklar doğru sayılmıştır. Bu **sistematik hata** yol uzadıkça orantılı büyür: aks aralığı %4 yanlışken her tam turda yaklaşık 16° sapma birikir.\n\n### Gerçek robotta daha kötü\nBenzetimde tekerlek kaymaz. Gerçek robotta kayma, zemin eğimi, çarpma ve aşınma da girer. Odometri kendini asla düzeltmez; başka bir sensörle (örneğin jiroskop) desteklenmesi gerekir.\n\n### Özet\nOdometri, tekerlek yollarından x, y ve θ'yı adım adım hesaplar: ortalama yol ileri götürür, yol farkı bölü L robotu döndürür. Hata iki yerden gelir: tık çözünürlüğü (CHANGE ile yarıya iner) ve yanlış yarıçap ya da aks aralığı (kalıcıdır). Her iki hata da yol boyunca birikir ve odometri kendi hatasını görmez.",
          "concepts": [
            {
              "term": "Odometri",
              "definition": "Tekerlek dönüşlerinden robotun konumunu ve yönünü adım adım hesaplama yöntemi.",
              "example": "Sayaçlardan x, y ve θ bulunur; başlangıç noktası (0, 0) alınır.",
              "pitfall": "Odometrinin mutlak konum verdiğini sanmak; yalnız başlangıca göre tahmindir."
            },
            {
              "term": "Merkezin yolu (Δs)",
              "definition": "Robotun merkezinin aldığı yol; iki tekerleğin yollarının ortalamasıdır.",
              "example": "ΔsL = 2 cm ve ΔsR = 3 cm ise Δs = 2,5 cm.",
              "pitfall": "Yalnız bir tekerleğin yolunu merkezin yolu sanmak."
            },
            {
              "term": "Dönüş açısı (Δθ)",
              "definition": "(ΔsR − ΔsL) / L; sağ tekerlek fazla giderse robot sola döner (radyan).",
              "example": "Fark 1 cm ve L = 12 cm ise Δθ ≈ 0,083 rad ≈ 4,8°.",
              "pitfall": "L yerine L/2 kullanmak; açı iki kat yanlış çıkar."
            },
            {
              "term": "Radyan",
              "definition": "Açıyı yay uzunluğunun yarıçapa oranı olarak ölçen birim; sin ve cos bunu ister.",
              "example": "90° = π/2 ≈ 1,571 rad.",
              "pitfall": "Dereceyi doğrudan cos() içine vermek."
            },
            {
              "term": "Sistematik hata",
              "definition": "Her adımda aynı yönde tekrarlanan ve yol uzadıkça büyüyen hata; yanlış yarıçap ya da aks aralığı gibi.",
              "example": "Aks aralığı %4 yanlışsa her tam turda yaklaşık 16° sapma birikir.",
              "pitfall": "Tık çözünürlüğünü artırınca tüm hataların biteceğini sanmak."
            }
          ],
          "quiz": [
            {
              "id": "m5h4d94-q1",
              "kind": "numeric",
              "prompt": "Küçük bir adımda sol tekerlek 2,0 cm, sağ tekerlek 3,0 cm yol aldı. Aks aralığı L = 12 cm ise robot kaç derece sola döner?",
              "answer": 4.77,
              "tolerance": 0.05,
              "unit": "derece",
              "explanation": "Δθ = (3,0 - 2,0) / 12 = 0,0833 rad; 180/π ile çarpınca 4,77° olur. Sağ tekerlek fazla gittiği için dönüş sola ve pozitiftir.",
              "skills": [
                "rob-odometry"
              ]
            },
            {
              "id": "m5h4d94-q2",
              "kind": "numeric",
              "prompt": "Robot θ = 60° yönüne bakıyor ve dönmeden Δs = 10 cm ilerliyor. Bu adımda y kaç cm artar?",
              "answer": 8.66,
              "tolerance": 0.02,
              "unit": "cm",
              "explanation": "y artışı Δs · sin(60°) = 10 · 0,866 = 8,66 cm; x artışı 10 · cos(60°) = 5 cm olur. Karıştırırsan x ile y yer değiştirir.",
              "skills": [
                "rob-odometry"
              ]
            },
            {
              "id": "m5h4d94-q3",
              "kind": "mcq",
              "prompt": "Kesmeyi RISING yerine CHANGE yaptın ve tık mesafesini yarıya indirdin. Hangi hata KALIR?",
              "options": [
                "Tık çözünürlüğünden gelen yaklaşık 5 derecelik belirsizlik hiç değişmez",
                "Aks aralığı ya da yarıçap yanlış ölçüldüyse oluşan sistematik hata",
                "Her iki hata da tamamen yok olur",
                "Sayaç taşması"
              ],
              "answer": 1,
              "explanation": "CHANGE çözünürlüğü iki katına çıkarır ve çözünürlük hatasını yaklaşık yarıya indirir, ama formüldeki sabitler yanlışsa tahmin yine yanlıştır. Birinci seçenek yanlıştır çünkü belirsizlik değişir; üçüncüsü yanlıştır çünkü sabitler düzelmemiştir.",
              "skills": [
                "rob-quantization",
                "rob-drift"
              ]
            },
            {
              "id": "m5h4d94-q4",
              "kind": "numeric",
              "prompt": "Yazılımda aks aralığı 12 cm biliniyor ama robotun gerçek aks aralığı 12,5 cm. Odometri 360° dönüş gördüğünde robot gerçekte kaç derece dönmüştür?",
              "answer": 345.6,
              "tolerance": 0.5,
              "unit": "derece",
              "explanation": "Tekerleklerin yol farkı aynıdır ama gerçek açı = fark / 12,5, tahmin ise fark / 12. Oran 12 / 12,5 = 0,96 olduğundan 360 · 0,96 = 345,6° çıkar. Yön hatası her turda böyle birikir.",
              "skills": [
                "rob-drift",
                "rob-odometry"
              ]
            },
            {
              "id": "m5h4d94-q5",
              "kind": "find-bug",
              "prompt": "Konum tahmini robot döndükçe saçma sonuç veriyor. Tek hata nerede?\n\n```\nfloat th = 0;   // derece cinsinden tutuluyor\n\nvoid guncelle(float ds, float dth_rad) {\n  th += dth_rad * 180 / PI;\n  x += ds * cos(th);\n  y += ds * sin(th);\n}\n```",
              "options": [
                "th derece olarak tutuluyor ama cos ve sin radyan bekliyor",
                "ds hiç hesaplanmıyor",
                "PI Arduino'da tanımlı değil",
                "x ve y float olmamalı"
              ],
              "answer": 0,
              "explanation": "cos() ve sin() radyan ister; derece verilince 90 derece 90 radyan gibi işlenir ve konum rastgele sapar. Çözüm, th'yi radyan tutmak ya da çağırmadan önce dereceyi PI/180 ile çarpmaktır. PI Arduino'da tanımlıdır, x ve y için float uygundur.",
              "skills": [
                "rob-odometry",
                "prog-debug"
              ]
            }
          ]
        },
        {
          "title": "Proje: Kare ve sekiz çizen robot",
          "durationMin": 35,
          "problem": "Çizim robotları, yerde ilerleyen oyuncak \"kaplumbağalar\" ve fabrika taşıyıcıları aynı zor işi yapar: bir şekil çizip tam başladıkları yere dönmek. Kare görünüşte kolaydır: dört kenar, dört köşe. Ama her köşede küçük bir dönüş hatası yapılırsa son kenar başlangıç noktasından uzakta biter. Bu projede robotuna kare ve ardından sekiz çizdiriyorsun, sonra başlangıç noktasından kaç santimetre uzakta durduğunu ölçüyorsun.",
          "contentMd": "### Ne yapacağız?\nBu proje bu haftanın tüm derslerini ve önceki haftalardan kavramları birleştirir:\n- **Hafta 4, ders 91-92:** İki enkoder, kesmeyle tık sayma (Modül 3 ders 29'daki kesme kuralları), tık → mesafe.\n- **Hafta 4, ders 93:** Sayaç farkına göre P düzeltmesi: iki tekerlek eşit yol alsın.\n- **Hafta 4, ders 94:** Odometri: `x`, `y`, `θ` tahmini.\n- **Hafta 1, ders 76-78:** Diferansiyel sürüş ve PWM ölü bölgesi (%20 ≈ 51).\n\nRobot önce kenarı 0,5 m olan bir kare çizer: 0,5 m ileri, 90° sola dön, bu dört kez. Sonra iki daireden oluşan bir sekiz çizer. Her şeklin sonunda robot **başlangıç noktasına dönüş hatasını** yazar.\n\n### Devre\nModül 5 standart bağlantıları:\n\n| Parça | Bağlantı |\n|---|---|\n| Sol motor | EN **D5** (PWM), IN1 **D7**, IN2 **D8** |\n| Sağ motor | EN **D6** (PWM), IN3 **D9**, IN4 **D10** |\n| Sol enkoder | **D2** (kesme pini), VCC → 5 V, GND → GND |\n| Sağ enkoder | **D3** (kesme pini), VCC → 5 V, GND → GND |\n| Güç | Motorlar için ayrı pil, ortak GND |\n\nGüvenlik: Motorları Arduino'nun 5 V pininden besleme. Pili kısa devre yapma, ters bağlama. Şebeke gerilimiyle (220 V) asla devre kurma. Gerçek robotu önce yerden kaldırıp test et, sonra geniş ve boş bir zemine koy.\n\n### Plan: önce geometri\n**Dönüş.** Robot yerinde dönerken iki tekerlek **zıt yönde** aynı yolu alır. Robotun merkezi yerinde kalır; her tekerlek, yarıçapı `L/2` olan bir dairenin yayını çizer. 90° için yay uzunluğu:\n\n```\nyay = açı · yarıçap = (π/2) · (L/2) = 1,5708 · 0,06 m ≈ 9,42 cm  →  ≈ 9,1 tık\n```\n\nYani her tekerlek 9 tık kadar döner: sol geri, sağ ileri (sola dönüş için). Ama 94. derste gördüğün gibi bir tık = 5° belirsizlik demek. Bu yüzden dönüş miktarını tıklarla değil, **odometrinin açısı `th` ile** hedefliyoruz: `yay = (hedefYön − th) · L/2`. Dört dönüşün hedefi mutlak: 90°, 180°, 270°, 360°. Bir köşede 4° şaşarsan sonraki köşe bunu düzeltir; hata birikmez.\n\n**Düz yol.** İki tekerlek eşit yol alır (93. dersteki gibi, P düzeltmeli).\n\n**Daire.** Merkez çizgisi yarıçapı `R = 0,25 m` olan bir daire için içteki tekerleğin yarıçapı `R − L/2`, dıştaki `R + L/2`:\n\n```\niç yol  = 2π · (0,25 − 0,06) = 1,194 m   (≈ 115 tık)\ndış yol = 2π · (0,25 + 0,06) = 1,948 m   (≈ 188 tık)\n```\n\nİki tekerlek aynı anda başlayıp aynı anda bitmeli; yani dıştaki içtekinden daha hızlı dönmeli. Hız oranı = yol oranı = 0,613. Bunu 93. dersteki fikirle sağlıyoruz: iki tekerleğin tamamladığı **yüzdeler** eşit kalsın.\n\n**Tek fonksiyon hepsini yapar.** `hareket(hSol, hSag)`: sol tekerlek `hSol` metre, sağ tekerlek `hSag` metre yol alsın (eksi = geri).\n- Düz: `hareket(0.5, 0.5)`.\n- Yerinde sola dön: `hareket(-yay, +yay)`.\n- Sol daire: `hareket(ic, dis)`. Sağ daire: `hareket(dis, ic)`.\n\nİçeride her turda: odometriyi güncelle, \"bitenin oranı\"na göre iki tekerleğin PWM'ini hesapla, hata varsa (öndeki tekerlek fazla gitmişse) onu kıs, geridekini artır, hedefe yaklaşırken yavaşla.\n\nPWM'i hesaplarken ölü bölgeyi (51) hesaba katıyoruz (78. ders): PWM 51'in altında motor dönmez. İçteki tekerleğin hızı dıştakinin %61'i olsun diye PWM'i doğrudan 0,61 ile çarpmak yanlış olur; ölü bölgenin üstündeki kısmı çarparız: `PWM = 51 + (v − 51) · oran`.\n\n**Yavaşlama.** Hedefe 5 cm kala hâlâ tam hızla gidersen motor kayarak durduğunda fazla yol alırsın (91. ders). Bu yüzden kalan yol küçüldükçe PWM düşer (en az 60). Durma payı kısalır, tık hassasiyeti yeterli olur.\n\n### Program\n```cpp\n// sketch: kare_sekiz\nconst int EN_SOL = 5, IN1 = 7, IN2 = 8;\nconst int EN_SAG = 6, IN3 = 9, IN4 = 10;\nconst int ENK_SOL = 2, ENK_SAG = 3;\n\nconst float TIK_M = 2 * PI * 0.033 / 20;   // bir tıkın mesafesi (m)\nconst float L = 0.12;                      // iki tekerlek arası (m)\nconst int OLU_BOLGE = 51;                  // ders 78: PWM'in %20'si\nconst float KP = 1000.0;                   // yay hatası (m) başına PWM\n\nvolatile unsigned int tikSol = 0;\nvolatile unsigned int tikSag = 0;\nunsigned int oncekiSol = 0, oncekiSag = 0;\nint yonSol = 1, yonSag = 1;\n\nfloat x = 0, y = 0, th = 0;                // odometri tahmini (m, m, rad)\nfloat segSol = 0, segSag = 0;              // hareketin başından beri tekerlek yolları\nunsigned long sonIz = 0;\n\nvoid sayiSol() { tikSol++; }\nvoid sayiSag() { tikSag++; }\n\nunsigned int oku(volatile unsigned int &sayac) {\n  noInterrupts();\n  unsigned int kopya = sayac;\n  interrupts();\n  return kopya;\n}\n\nvoid motor(int en, int a, int b, int pwm) {      // pwm: -255..255\n  digitalWrite(a, pwm > 0);\n  digitalWrite(b, pwm < 0);\n  analogWrite(en, abs(pwm));\n}\n\nvoid surus(int solPwm, int sagPwm) {\n  motor(EN_SOL, IN1, IN2, solPwm);\n  motor(EN_SAG, IN3, IN4, sagPwm);\n  if (solPwm != 0) yonSol = solPwm > 0 ? 1 : -1;\n  if (sagPwm != 0) yonSag = sagPwm > 0 ? 1 : -1;\n}\n\nvoid odometriGuncelle() {\n  unsigned int s = oku(tikSol), g = oku(tikSag);\n  float dsSol = yonSol * (int)(s - oncekiSol) * TIK_M;\n  float dsSag = yonSag * (int)(g - oncekiSag) * TIK_M;\n  oncekiSol = s; oncekiSag = g;\n\n  float ds = (dsSol + dsSag) / 2;\n  float dth = (dsSag - dsSol) / L;\n  x += ds * cos(th + dth / 2);\n  y += ds * sin(th + dth / 2);\n  th += dth;\n  segSol += dsSol;\n  segSag += dsSag;\n\n  if (millis() - sonIz >= 250) {                 // iz: x,y (cm)\n    sonIz = millis();\n    Serial.print(\"IZ \");\n    Serial.print(x * 100, 0);\n    Serial.print(' ');\n    Serial.println(y * 100, 0);\n  }\n}\n\nvoid bekle(unsigned long ms) {\n  unsigned long t = millis();\n  while (millis() - t < ms) odometriGuncelle();\n}\n\n// Sol tekerlek hSol, sağ tekerlek hSag metre yol alsın (işaret = yön).\n// İki yol oranını enkoder farkıyla korur, hedefe yaklaşırken yavaşlar.\nvoid hareket(float hSol, float hSag, int pwmBuyuk) {\n  segSol = 0; segSag = 0;\n  float aSol = fabs(hSol), aSag = fabs(hSag);\n  float buyuk = max(aSol, aSag);\n  float oranSol = aSol / buyuk, oranSag = aSag / buyuk;\n  int isaretSol = hSol < 0 ? -1 : 1;\n  int isaretSag = hSag < 0 ? -1 : 1;\n\n  while (true) {\n    odometriGuncelle();\n    float biten = (fabs(segSol) + fabs(segSag)) / (aSol + aSag);\n    float kalan = buyuk * (1 - biten);\n    if (kalan <= TIK_M / 2) break;               // yarım tık hassasiyet\n\n    int v = constrain(60 + (int)(600 * kalan), 60, pwmBuyuk);   // yaklaşırken yavaşla\n    float hata = fabs(segSol) * oranSag - fabs(segSag) * oranSol;  // >0: sol önde\n    int pSol = OLU_BOLGE + (v - OLU_BOLGE) * oranSol - KP * hata;\n    int pSag = OLU_BOLGE + (v - OLU_BOLGE) * oranSag + KP * hata;\n    surus(isaretSol * constrain(pSol, 0, 255), isaretSag * constrain(pSag, 0, 255));\n  }\n  surus(0, 0);\n  bekle(300);                                    // robot kayarak dursun, tıklar sayılsın\n}\n\nvoid ileri(float metre) { hareket(metre, metre, 200); }\n\nvoid yonuHedefle(float hedefTh) {                // yerinde dön: yay = açı * L/2\n  float yay = (hedefTh - th) * L / 2;\n  hareket(-yay, yay, 140);\n}\n\nvoid rapor(const char* ad, float x0, float y0) {\n  Serial.print(ad);\n  Serial.print(\" hata(tahmin) cm: \");\n  Serial.print(hypot(x - x0, y - y0) * 100, 1);\n  Serial.print(\" aci: \");\n  Serial.println(th * 180 / PI, 1);\n}\n\nvoid setup() {\n  Serial.begin(9600);\n  pinMode(EN_SOL, OUTPUT); pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT);\n  pinMode(EN_SAG, OUTPUT); pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT);\n  pinMode(ENK_SOL, INPUT); pinMode(ENK_SAG, INPUT);\n  attachInterrupt(digitalPinToInterrupt(ENK_SOL), sayiSol, RISING);\n  attachInterrupt(digitalPinToInterrupt(ENK_SAG), sayiSag, RISING);\n  bekle(500);\n\n  // 1) Kare: 0,5 m ileri, 90 derece sol, dört kez\n  float x0 = x, y0 = y;\n  for (int i = 1; i <= 4; i++) {\n    ileri(0.5);\n    yonuHedefle(i * PI / 2);                     // mutlak hedef: hatalar birikmez\n  }\n  rapor(\"KARE\", x0, y0);\n\n  // 2) Sekiz: yarıçapı 0,25 m iki daire; önce sola, sonra sağa\n  x0 = x; y0 = y;\n  const float R = 0.25;\n  float ic = 2 * PI * (R - L / 2);               // iç tekerleğin çember yolu\n  float dis = 2 * PI * (R + L / 2);\n  hareket(ic, dis, 180);                         // sol daire: sol tekerlek içte\n  hareket(dis, ic, 180);                         // sağ daire: sağ tekerlek içte\n  rapor(\"SEKIZ\", x0, y0);\n  Serial.println(\"BITTI\");\n}\n\nvoid loop() {}\n```\n\n### Nasıl çalışıyor?\n1. `odometriGuncelle()` 94. dersteki hesabı yapar. Ayrıca her 250 ms'de `IZ x y` satırı yazar; bu robotun izlediği yolun kaydıdır.\n2. `hareket()` bitişi **iki tekerleğin yüzdesinden** anlar: `biten = (|segSol| + |segSag|) / (hedefSol + hedefSag)`. `hata`, öndeki tekerleğin oranlı olarak fazla gittiği yoldur; PWM'e `KP · hata` eklenir ya da çıkarılır (93. ders). `KP = 1000 PWM/m`: 1 tık (1 cm) fark yaklaşık 10 PWM demektir.\n3. `kalan <= TIK_M / 2`: kalan yol yarım tıktan azsa dur. Tam sıfırı beklemek (örneğin 9,09 tık yerine 10. tıkı) robotu yaklaşık 5° fazla döndürürdü.\n4. `yonuHedefle()` hedef açıyı mutlak alır. Son köşede hedef 360° (= 2π) olduğu için robot başladığı yöne bakar.\n5. İlk daire sola, ikincisi sağa döner; iki dairenin birleştiği nokta başlangıç noktasıdır. Bu bir \"8\" şekli: iki daire tek noktada birleşiyor.\n\n### Sonuç: başlangıca dönüş hatası\nProgram seri monitöre iki satır yazar:\n\n```\nKARE hata(tahmin) cm: 2.4 aci: 356.4\nSEKIZ hata(tahmin) cm: 0.1 aci: 356.4\nBITTI\n```\n\nBu, robotun **kendi tahminidir**. Benzetim robotun gerçek konumunu da bildiği için gerçek hatayı ölçebiliriz (gerçek robotta şeridi metre ya da bir kâğıt üstüne çizilmiş iz kullanırsın). İki robotla, sağ tekerlek verimi %100 ve %93 (`gain`) iken:\n\n| Sağ tekerlek verimi | Kare: başlangıca uzaklık | Kare: son yön | Sekiz: başlangıca uzaklık |\n|---|---|---|---|\n| %100 | 2,2 cm | 357° | 0,4 cm |\n| %93 | 2,2 cm | 357° | 0,7 cm |\n\nKare çevresi 2 m. 2 cm hata, çevrenin yüzde 1'i. Sebebi: her dönüşte tık çözünürlüğü (5°) ve robotun kayarak durması. Bunu \"kusursuz\" saymak yanlış olur; **tolerans** koymamız gerek.\n\n**Tolerans.** Benzetimde ölçtüğümüz en kötü sonuç 2,2 cm. Bir tık 1 cm ve yön hassasiyeti 5° olduğuna göre iki kat pay vererek şunu kabul edelim: **şekil sonunda başlangıçtan en çok 5 cm uzak, yön hatası en çok 8°.** Gerçek bir robotta kayma, tozlu zemin, pil gerilimi gibi etkiler olacağından 5 cm'i tutturmak çok daha zor olur; gerçek robotta toleransı kendi ölçümünle belirle.\n\nDüzeltmenin gerçekten işe yaradığını görmek için aynı programda `KP = 0.0` yap (yay hatası düzeltmesi kapanır, tekerleklere yalnızca oranlı PWM gider) ve sağ verim %93 iken çalıştır:\n- Kare: başlangıca uzaklık **10,3 cm**.\n- Sekiz: başlangıca uzaklık **19,5 cm**.\n\nDüzeltmeyle 2,2 cm ve 0,7 cm olmuştu. Demek ki 93. dersteki P düzeltmesi bu projenin can damarı.\n\n### İz kaydı: ileride 3D'ye aktarım\nBenzetim, robotun yolunu her 20 ms'de bir `[x, y, yön]` olarak kaydeder (`robot.state.trail`). Bizim programımız da odometriden aynı yolu `IZ x y` satırlarıyla yazıyor. Benzetimdeki gerçek iz kaydında kare yaklaşık 0,5 × 0,5 m'lik bir kutu, sekiz ise 0,5 × 1,0 m'lik bir kutu çiziyor; programın `IZ` satırları da aynı şekli veriyor. Bu iz, ileride 3D bir robotun hareketini yönlendirmek ve gerçek ile sanal yolu karşılaştırmak için kullanılabilir. 3D robot henüz bağlı değil; şimdilik hedef, yolun doğru kaydedilmesi.\n\n### Dene\n- Kenarı 0,5 m yerine 0,3 m yap. Başlangıca dönüş hatası nasıl değişti?\n- Kareyi **sağa** döndürerek çiz: `yonuHedefle(-i * PI / 2)`. Neden hedefler eksi?\n- Daire yarıçapını `R = 0.25`'ten `0.20`'ye indir. Hangi tekerlek daha az yol alır? İç ve dış yolu elle hesapla, sonra programdaki `ic` ve `dis` ile karşılaştır.\n- Yeni bir şekil dene: eşkenar üçgen. Dış açısı kaç derece?\n\n### Sık yapılan hatalar\n- Dönüşü açı yerine sabit \"tık sayısı\" ile yapmak: her dönüş farklı hata verir, hata birikir.\n- Dönüş sırasında odometriyi güncellemeyi unutmak.\n- Dönüş hedefini \"mevcut açı + 90°\" yapmak: hata birikir. Mutlak hedef kullan.\n- PWM'i ölü bölgeyi hesaba katmadan oranlamak: içteki tekerlek hiç dönmeyebilir.\n- Durma payını hesaba katmamak: son tıkları saymadan odometriyi okumak.\n- Şeklin başlangıcını ölçmeyi unutup \"kare kapandı\" demek.\n\n### Gerçek robotta farklı olabilecekler\nBenzetimdeki hatalar yalnız tık çözünürlüğü ve kayarak durmadan gelir. Gerçek robotta ek olarak tekerlek kayması, yarıçap ve aks aralığı ölçüm hatası ve pil düştükçe değişen hız vardır (94. ders). Bu yüzden gerçek robotun hatası burada ölçtüğümüzden belirgin biçimde büyük olabilir; şekil kapanmayabilir. Sekiz bu yüzden iyi bir testtir: hata iki daire boyunca birikir.",
          "question": "Kare tamamlandığında robot başlangıçtan 2 cm uzaktaydı ve bunu enkoderden biliyordu. Gerçek hata 8 cm olsaydı robot bunu fark edebilir miydi? Hangi ek sensör yardımcı olurdu?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Kare ve sekiz çizen bir robotu parçalara ayırarak planlamayı\n- Yerinde dönüşün ve dairenin tık hedeflerini geometriyle hesaplamayı\n- Neden mutlak dönüş hedefi ve ölü bölge hesabı gerektiğini\n- Başlangıca dönüş hatasını ve toleransı yorumlamayı\n\n### Önceden bilmen gerekenler\n- Tık, mesafe ve kesmeyle sayma (91. ve 92. dersler)\n- İki tekerleği eşitleyen P düzeltme (93. ders)\n- Odometri: x, y, θ tahmini ve hata kaynakları (94. ders)\n- Diferansiyel sürüş ve PWM ölü bölgesi (bu modülün 1. haftası)\n\n### Önce plan: üç hareket türü\nKarmaşık bir şekil, birkaç basit hareketin art arda gelmesidir. Tek bir fikir hepsini kapsar: sol tekerlek `hSol` metre, sağ tekerlek `hSag` metre yol alsın.\n\n| Hareket | Sol | Sağ |\n|---|---|---|\n| Düz | +d | +d |\n| Yerinde sola dön | −yay | +yay |\n| Sol daire | iç yol | dış yol |\n\n### Yerinde dönüş\nRobotun merkezi yerinde kalır, her tekerlek yarıçapı L/2 olan bir daire yayı çizer:\n\n```\nyay = açı · L/2 = (π/2) · 6 cm ≈ 9,42 cm  →  9,42 / 1,037 ≈ 9,1 tık\n```\n\nBir tık yaklaşık 5° belirsizlik getirdiği için dönüşü \"9 tık\" diye sabitlemek tehlikelidir. Bunun yerine hedefi odometrinin açısına bağlarsın: yay = (hedef − θ) · L/2. Hedef **mutlak** olur: 90°, 180°, 270°, 360°. Bir köşede 4° şaşarsan sonraki köşe bunu telafi eder; \"şimdiki açı + 90°\" deseydin hata her köşede birikirdi.\n\n### Daire\nMerkez çizgisi R = 25 cm olan bir daire için içteki tekerleğin yarıçapı R − L/2, dıştaki R + L/2'dir:\n\n```\niç yol  = 2π · (0,25 − 0,06) = 1,194 m   (yaklaşık 115 tık)\ndış yol = 2π · (0,25 + 0,06) = 1,948 m   (yaklaşık 188 tık)\n```\n\nİki tekerlek aynı anda bitirmeli; hız oranı yol oranına eşittir (0,613). İçteki tekerleğin PWM'ini hesaplarken ölü bölgeyi unutma: 51'in altında motor dönmez. Doğru formül `PWM = 51 + (v − 51) · oran`; PWM 200 için 51 + 149 · 0,613 ≈ 142. Doğrudan 0,613 ile çarpsaydın 123 çıkardı ve hız oranı bozulurdu.\n\n### Başlangıca dönüş hatası\nŞekil bitince robotun başladığı noktadan ne kadar uzakta durduğunu ölçersin. Benzetimde kare için yaklaşık 2 cm hata çıktı; bu çevrenin (2 m) yaklaşık %1'idir. P düzeltmesi kapatılınca (KP = 0) aynı kare için 10 cm'ye yükseldi. Odometri robotun kendi tahminidir; yanlış sabitler yüzünden gerçek hata daha büyük olabilir ve robot bunu kendi başına göremez. Bu yüzden sonuçta dışarıdan bir ölçüm ve bir tolerans (örneğin en çok 5 cm, 8°) gerekir.\n\n### Özet\nKare ve sekiz, düz, yerinde dönüş ve daire hareketlerinin birleşimidir; hepsi \"sol tekerlek bu kadar, sağ tekerlek bu kadar\" fikriyle yazılır. Dönüşte mutlak açı hedefi hatanın birikmesini önler. Dairede iç ve dış tekerlek farklı yol alır ve PWM hesabında ölü bölge katılır. Başarı, başlangıca dönüş hatasını dışarıdan ölçüp bir toleransla karşılaştırarak anlaşılır.",
          "concepts": [
            {
              "term": "Mutlak açı hedefi",
              "definition": "Dönüşün şimdiki açıya eklenerek değil, sabit bir hedefe (90°, 180°, ...) göre yapılması.",
              "example": "Dört köşenin hedefi 90°, 180°, 270°, 360°'dir.",
              "pitfall": "Hedefi 'şimdiki açı + 90°' yapmak; her köşedeki hata sonrakine eklenir."
            },
            {
              "term": "Yerinde dönüş",
              "definition": "İki tekerleğin zıt yönde aynı yolu alması; her biri yarıçapı L/2 olan bir daire yayı çizer.",
              "example": "90° için yay (π/2) · 6 cm ≈ 9,42 cm, yani yaklaşık 9 tık.",
              "pitfall": "Dönüşü sabit tık sayısıyla yapmak; 5° belirsizlik her seferinde farklı çıkar."
            },
            {
              "term": "İç ve dış tekerlek",
              "definition": "Dairede merkez çizgisinin yarıçapı R ise iç tekerlek R − L/2, dış tekerlek R + L/2 yarıçapıyla ilerler.",
              "example": "R = 25 cm için iç yol 119,4 cm, dış yol 194,8 cm.",
              "pitfall": "İki tekerleğe aynı hızı verip daire beklemek."
            },
            {
              "term": "Ölü bölge",
              "definition": "Motorun dönmeye başlaması için gereken en küçük PWM; burada yaklaşık 51.",
              "example": "PWM = 51 + (v − 51) · oran, içteki tekerleğin hızını oranlar.",
              "pitfall": "PWM'i doğrudan oranla çarpmak; küçük değer ölü bölgeye düşer ve tekerlek dönmez."
            },
            {
              "term": "Başlangıca dönüş hatası",
              "definition": "Şekil bitince robotun başladığı noktadan uzaklığı; odometrinin ve düzeltmenin başarısının ölçüsü.",
              "example": "Benzetimde kare için yaklaşık 2 cm, çevrenin %1'i.",
              "pitfall": "Yalnız robotun kendi tahminine bakıp 'kare kapandı' demek."
            }
          ],
          "quiz": [
            {
              "id": "m5h4d95-q1",
              "kind": "numeric",
              "prompt": "L = 12 cm ve tık mesafesi 1,037 cm olan robot yerinde 90° dönecek. Her tekerlek yaklaşık kaç tık atmalıdır?",
              "answer": 9.1,
              "tolerance": 0.1,
              "unit": "tık",
              "explanation": "Her tekerlek yarıçapı L/2 = 6 cm olan bir dairenin dörtte birini çizer: (π/2) · 6 = 9,42 cm. 9,42 / 1,037 = 9,1 tık. L'yi yarıya bölmeyi unutursan 18 tık bulursun.",
              "skills": [
                "rob-turn-geometry",
                "rob-ticks-distance"
              ]
            },
            {
              "id": "m5h4d95-q2",
              "kind": "numeric",
              "prompt": "Merkez çizgisinin yarıçapı R = 0,20 m olan bir daire çiziliyor ve L = 12 cm. Dış tekerlek kaç santimetre yol alır?",
              "answer": 163.4,
              "tolerance": 0.2,
              "unit": "cm",
              "explanation": "Dış tekerleğin yarıçapı R + L/2 = 0,26 m'dir; yol 2π · 0,26 = 1,634 m, yani 163,4 cm. İç tekerlek 2π · 0,14 = 88,0 cm yol alır.",
              "skills": [
                "rob-turn-geometry"
              ]
            },
            {
              "id": "m5h4d95-q3",
              "kind": "numeric",
              "prompt": "İç tekerlek, dış tekerleğin hızının 0,613 katında dönmeli. Dış tekerlek PWM 200, ölü bölge 51 ise içteki PWM kaç olmalıdır? PWM = 51 + (v - 51) · oran formülünü kullan.",
              "answer": 142.3,
              "tolerance": 0.5,
              "unit": "PWM",
              "explanation": "51 + (200 - 51) · 0,613 = 51 + 91,3 = 142,3. PWM'i doğrudan 0,613 ile çarpsaydın 122,6 bulurdun; bu değer ölü bölge yüzünden hız oranını bozardı.",
              "skills": [
                "rob-turn-geometry",
                "rob-proj-square"
              ]
            },
            {
              "id": "m5h4d95-q4",
              "kind": "find-bug",
              "prompt": "Robot kareyi çiziyor ama her köşede biraz daha fazla ya da az dönüyor ve son kenar başlangıçtan çok uzakta bitiyor. Tek hata nedir?\n\n```\nfor (int i = 1; i <= 4; i++) {\n  ileri(0.5);\n  yonuHedefle(th + PI / 2);\n}\n```",
              "options": [
                "ileri(0.5) 0,5 cm'dir",
                "Dönüş hedefi şimdiki th'ye göre verilmiş; her köşenin hatası sonrakine eklenir. Hedef i · PI / 2 olmalı",
                "Döngü 4 yerine 3 kez dönmeli",
                "yonuHedefle fonksiyonu hiç çağrılmamalı"
              ],
              "answer": 1,
              "explanation": "th + PI/2 göreli bir hedeftir: bir köşede 4° eksik dönersen sonraki hedef de o eksikle başlar. Mutlak hedef i · PI / 2 hatayı her köşede telafi eder. ileri(0.5) metre cinsindendir ve dört köşe için döngü doğrudur.",
              "skills": [
                "rob-turn-geometry",
                "prog-debug"
              ]
            },
            {
              "id": "m5h4d95-q5",
              "kind": "mcq",
              "prompt": "Kare tamamlandı ve odometri başlangıca 1 cm yakın olduğunu söylüyor. Bu bilgi neden yeterli değildir?",
              "options": [
                "Odometri hiçbir zaman başlangıca dönüşü hesaplayamaz",
                "Odometri kendi sistematik hatasını (yanlış yarıçap, aks aralığı, kayma) göremez; gerçek konum dışarıdan ölçülmelidir",
                "Kare her zaman kapanır",
                "Odometri yalnız dairelerde çalışır"
              ],
              "answer": 1,
              "explanation": "Tahmin ile gerçek konum farklı olabilir: sabitler yanlışsa ya da tekerlek kayıyorsa tıklar doğru sayılır ama konum yanlış hesaplanır. Bu yüzden şeridi metreyle ya da iz kaydıyla ölçüp tolerans ile karşılaştırırız.",
              "skills": [
                "rob-proj-square",
                "rob-drift",
                "prog-planning"
              ]
            }
          ]
        }
      ]
    },
    {
      "title": "PID",
      "project": "PID çizgi izleyen ve duvar takipçisi",
      "guideMd": "### Hafta hedefleri\nBu haftanın sonunda öğrenci:\n1. Hata, ayar noktası ve kontrol çıkışı kavramlarını açıklayabilir; çizgi dizisinden konum hesaplayıp P kontrolle (`u = Kp x e`) direksiyon verebilir.\n2. D teriminin aşımı nasıl sönümlediğini, gürültülü ölçümde süzgeçsiz D'nin neden zararlı olduğunu ve türevi süzmeyi açıklayabilir.\n3. P kontrolün kalıcı hata bıraktığını, integralin bunu kapattığını ve windup ile anti-windup'ı anlatabilir.\n4. PID'i sırayla (önce P, sonra D, en sonda I) ayarlayabilir; adım cevabından k, tau ve theta'yı hesaplayıp SIMC ile Kc ve Ti bulabilir.\n5. PID ile bang-bang'i aynı koşullarda ölçerek karşılaştırabilir ve sonucu dürüstçe yorumlayabilir.\n\n### Haftanın planı\nHafta beş derstir; dersler 30-40 dakikadır. Aşağıdaki plan günde bir ders içindir.\n\n| Gün | Ders | Süre | Ne yapılır |\n|---|---|---|---|\n| 1 | P: orantılı kontrol | ~30 dk | Konumu hesapla, P kontrollü çizgi izleyiciyi çalıştır, Kp'yi değiştirip etkisini gözle, mini testi çöz. |\n| 2 | D: türev ve gürültü | ~30 dk | Duvar takipçisinde Kd'yi değiştir, süzgeçli ve süzgeçsiz D'yi karşılaştır, testi çöz. |\n| 3 | I: integral ve windup | ~35 dk | Zayıf motorlu robotta Ki'nin etkisini ölç, anti-windup'ı aç ve kapat, testi çöz. |\n| 4 | PID ayarı: el ile ve SIMC | ~40 dk | Adım cevabını kaydet, k, tau ve theta'yı hesapla, SIMC değerlerini sketch'e yaz. |\n| 5 | Bitirme projesi: PID çizgi izleyen ve duvar takipçisi | ~35 dk | PID ve bang-bang'i aynı pistte koştur, duvar takipçisini ayarla, proje ölçütüyle değerlendir. |\n\n### Ön koşul kontrolü\nBaşlamadan önce şunları kontrol et:\n- Hafta 1-4 tamamlandı mı? Özellikle iki tekerlekli sürüş (PWM ve yön pinleri), bang-bang çizgi izleme, HC-SR04 ile servo ve enkoder ile hız ölçümü gerekir.\n- `millis()` ile sabit periyotlu döngü yazabiliyor mu? (Modül 3, 27. ders)\n- Kesme ve `volatile` kavramı hatırlanıyor mu? (Modül 3, 29. ders) Hız ölçümü bunu kullanır.\n- Ondalık sayılar ve basit oran hesabı rahat mı? Formüller çarpma ve bölmeden ibarettir.\n\n### Kavram haritası\n- **Temel:** ayar noktası → ölçüm → hata (`e = ayar - ölçüm`) → kontrol çıkışı (`u`) → motorlar\n- **P:** `u = Kp x e` → çok küçük Kp: çizgiyi kaybeder; çok büyük Kp: titrer ve aşar → kalıcı hata\n- **D:** hatanın değişim hızı → sönümleme → gürültüde sahte hız → türev süzgeci (`ALFA`)\n- **I:** hatanın birikimi → kalıcı hatayı kapatır → çıkış doyması → windup → anti-windup (sınırlama, doyunca durdurma)\n- **Ayar:** el ile (P, D, I sırası) · Ziegler-Nichols (Ku, Pu; riskli) · SIMC (adım cevabı → k, tau, theta → Kc, Ti)\n- **Proje:** çizgi ve duvar aynı iskelet → ayrı kazançlar → PID ve bang-bang'in adil karşılaştırması\n\n### Sık yapılan hatalar\n- **Tekerlek formülünde işaretleri karıştırmak.** `TABAN - u` ve `TABAN + u` yer değiştirirse robot çizgiden uzağa döner.\n- **Hatanın işaretini ters tanımlamak.** Duvar takibinde `e = mesafe - HEDEF` olmalıdır.\n- **Kp'yi bir seferde çok büyütmek.** Küçükten başla, her seferinde iki katına çıkar ve ölç.\n- **`dt` ile bölmeyi ya da çarpmayı unutmak.** Türev `dt`'ye bölünür, integral `dt` ile çarpılır.\n- **`sonHata`'yı güncellememek ya da başlatmamak.** İlk türev sıçrar ya da hata giderek büyür.\n- **Gürültülü ölçümde süzgeçsiz D kullanmak.** Motor titrer.\n- **Integrali hiç sınırlamamak.** Çıkış doyunca windup oluşur.\n- **`loop()` içine `delay()` koymak.** Sabit kontrol periyodu bozulur.\n- **Z-N'yi gerçek donanımda kararlılık sınırına kadar zorlamak.** Adım testi daha güvenlidir.\n- **Tek koşuya bakarak PID ile bang-bang arasında karar vermek.** Aynı koşullarda en az iki koşu yap.\n\n### Hafta sonu tekrarı\n1. Her dersin kavram kartlarına bir kez daha bak ve \"sık yapılan yanlış\" satırlarını yüksek sesle oku.\n2. Mini testlerde yanlış yaptığın soruların açıklamalarını yeniden oku, sonra soruyu yeniden çöz.\n3. `u = Kp x e + Ki x integral + Kd x turev` formülünü bakmadan yaz ve her terimin ne işe yaradığını tek cümleyle söyle.\n4. Bir adım testinden k, tau ve theta'yı kendi elinle hesapla ve SIMC formülüne koy.\n5. Kendi cümlelerinle şu soruyu cevapla: \"Hangi durumda bang-bang PID'den daha mantıklıdır?\"\n\nHafta sonu testi olarak beş dersin mini testleri yeterlidir; her derste 5 soru, toplam 25 soru. Hedef: her dersten en az 4 doğru. Eksik kalan dersin anlatımına dön.\n\n### Proje değerlendirme ölçütü (PID çizgi izleyen ve duvar takipçisi)\n| Ölçüt | Gelişmeli | Yeterli | İleri |\n|---|---|---|---|\n| Çizgi izleme | Robot çizgiyi kaybediyor | PID ile pisti bitiriyor | Kp, Kd ve Ki seçimini ölçüme dayanarak açıklıyor |\n| Duvar takibi | Duvara çarpıyor ya da hedeften sürekli uzakta kalıyor | Başlangıçtan sonra ±2 cm bandında kalıyor | Kd ve süzgeci ölçüp seçiyor, yalnız P ile karşılaştırıyor |\n| Ayar yöntemi | Değerleri rastgele deniyor | Önce P, sonra D, sonra I sırasını izliyor | Adım testi ya da SIMC ile ayar değerini hesaplıyor |\n| Karşılaştırma | Tek koşuya bakıyor | PID ve bang-bang'i aynı pist ve TABAN'da koşturuyor | En az iki koşuda ölçüp dürüstçe yorumluyor (hangi pistte kim önde) |\n| Anlatım | Ne yaptığını anlatamıyor | Her terimin ne işe yaradığını söylüyor | Hata yapıp nasıl bulduğunu ve windup gibi tuzakları anlatıyor |\n\n### Veli ve öğretmen notu\n- **Amaç.** Bu hafta formül ezberletmek değil, \"ölç, değiştir, yeniden ölç\" alışkanlığı kazandırmaktır. Dersin sonuçları benzetim ölçümleridir; öğrenci kendi robotunda sayıların farklı çıkmasını normal karşılamalıdır.\n- **Nasıl destek olunur?** Öğrenci takıldığında cevabı söylemek yerine şu soruları sor: \"Hatanın işareti ne?\", \"Robot hedefi aşıyor mu, hiç varmıyor mu?\", \"Hangi sayıyı değiştirdin, tek başına mı değiştirdin?\"\n- **Süre.** Dersler yoğundur. Aynı gün birden çok ders yapmak yerine aralıklı çalışmak kalıcılığı artırır.\n- **Güvenlik.** Gerçek robotta motorlar için harici güç ve ortak GND kullanılır, pil kısa devre yapılmaz ve ters bağlanmaz. Robotu masa kenarında çalıştırma. İntegral açıkken robotu elinle tutup bırakma; robot fırlayabilir. Şebeke gerilimiyle (220 V) hiçbir devre kurulmaz.\n- **İlerleme.** Mini test sonuçları \"İlerlemem\" sayfasında beceri bazında görünür (taslak/pilot özellik; yalnız onay verildiyse kaydedilir).",
      "lessons": [
        {
          "title": "P: orantılı kontrol",
          "durationMin": 30,
          "problem": "Bisikletle yolun kenarına yaklaşırken direksiyonu ne kadar çevirirsin? Biraz yaklaştıysan azıcık, çok yaklaştıysan fazla. Kimse \"kenara 3 cm kaldı, tam 7 derece çevir\" diye hesap yapmaz; çevirme miktarı hatayla birlikte büyür. 88. dersteki bang-bang çizgi izleyici ise yalnızca \"sağ\", \"sol\" ya da \"düz\" bilir. Bu derste robota hata ne kadarsa o kadar direksiyon vermeyi öğreteceksin. Bunun adı **P (orantılı) kontrol**.",
          "contentMd": "### Kavramlar\n- **Ayar noktası:** robotun olmak istediği yer. Burada: çizgi dizinin tam ortasında.\n- **Hata (e):** ayar noktası ile ölçüm arasındaki fark. Hata 0 ise robot istediği yerdedir.\n- **Kontrol çıkışı (u):** robotun direksiyonu. P kontrolde `u = Kp x e`.\n- **Kp:** hatayı direksiyona çeviren sayı. Büyüdükçe robot aynı hataya daha sert tepki verir.\n\n### Devre\n| Parça | Bağlantı |\n|---|---|\n| Sol motor (L298N / TB6612) | EN **D5** (PWM), IN1 **D7**, IN2 **D8** |\n| Sağ motor | EN **D6** (PWM), IN3 **D9**, IN4 **D10** |\n| 5 sensörlü çizgi dizisi | **A0 ... A4** (A0 en sol, A4 en sağ); sensörler 2,4 cm arayla, tekerlek aksının 7 cm önünde |\n\nMotorları Arduino'nun 5 V pininden besleme; harici bir pil kullan ve pilin eksi ucunu Arduino GND'sine bağla (ortak GND). Pili kısa devre yapma, ters bağlama.\n\n### Program\nÖnce dizinin ham verisini çizginin **konumuna** çeviren küçük bir sketch. Her sensöre bir ağırlık veriyoruz: A0 için +2, A1 için +1, A2 için 0, A3 için -1, A4 için -2. Çizgiyi gören sensörlerin ağırlıklarının ortalaması çizginin konumudur. Pozitif konum: çizgi robotun solunda.\n\n```cpp\n// sketch: konum_oku\nconst int SENSOR[5] = {A0, A1, A2, A3, A4};   // A0 en sol ... A4 en sağ\nconst int ESIK = 500;                          // bunun üstü = çizgi\n\nvoid setup() {\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  int sayi = 0;       // çizgiyi gören sensör sayısı\n  int toplam = 0;     // görenlerin ağırlıklarının toplamı\n  for (int i = 0; i < 5; i++) {\n    if (analogRead(SENSOR[i]) > ESIK) {\n      sayi++;\n      toplam += 2 - i;    // ağırlıklar: +2, +1, 0, -1, -2\n    }\n  }\n  if (sayi == 0) {\n    Serial.println(\"kayip\");\n  } else {\n    Serial.println((float)toplam / sayi, 1);\n  }\n  delay(200);\n}\n```\n\nÇizgi yalnız A1'de görünürse `1.0`, A0 ve A1 birlikte görürse `1.5`, hiçbir sensör görmezse `kayip` yazılır. Dizinin 5 sensörü çizgiyi 0,5'lik adımlarla (-2 ... +2) ölçmemizi sağlar.\n\nŞimdi bu konumu hata olarak kullanan P kontrollü çizgi izleyici:\n\n```cpp\n// sketch: p_cizgi\nconst int SOL_EN = 5, SOL_IN1 = 7, SOL_IN2 = 8;\nconst int SAG_EN = 6, SAG_IN1 = 9, SAG_IN2 = 10;\nconst int SENSOR[5] = {A0, A1, A2, A3, A4};   // A0 en sol ... A4 en sağ\nconst int ESIK = 500;\n\nconst float KP = 170.0;            // hata 1 birim olunca direksiyon: 170 PWM\nconst int TABAN = 200;             // düz giderken her tekerleğin PWM'i\nconst unsigned long DT = 10;       // kontrol periyodu (ms)\n\nunsigned long son = 0;\nfloat sonYon = 1;                  // çizgi en son hangi taraftaydı\n\n// v: -255...255. Ölü bölgeyi atlar (78. ders): 1 -> %20 PWM, 255 -> %100.\nvoid surucu(int en, int in1, int in2, int v) {\n  v = constrain(v, -255, 255);\n  int pwm = abs(v);\n  if (pwm > 0) pwm = map(pwm, 1, 255, 51, 255);\n  digitalWrite(in1, v > 0);\n  digitalWrite(in2, v < 0);\n  analogWrite(en, pwm);\n}\n\n// Hata: çizginin konumu, -2...+2. Pozitif = çizgi solda.\nfloat hataOku() {\n  int sayi = 0;\n  float toplam = 0;\n  for (int i = 0; i < 5; i++) {\n    if (analogRead(SENSOR[i]) > ESIK) {\n      sayi++;\n      toplam += 2 - i;\n    }\n  }\n  if (sayi == 0) return sonYon * 2.0;     // çizgi kayıp (sensörler arası boşluk da olabilir): son görülen yöne \"uzakta\" de\n  float e = toplam / sayi;\n  if (e != 0) sonYon = (e > 0) ? 1 : -1;\n  return e;\n}\n\nvoid setup() {\n  int pinler[] = {SOL_EN, SOL_IN1, SOL_IN2, SAG_EN, SAG_IN1, SAG_IN2};\n  for (int i = 0; i < 6; i++) pinMode(pinler[i], OUTPUT);\n}\n\nvoid loop() {\n  if (millis() - son < DT) return;     // 10 ms'de bir çalış\n  son += DT;\n\n  float e = hataOku();\n  float u = KP * e;                    // P kontrol: çıkış = Kp x hata\n\n  surucu(SOL_EN, SOL_IN1, SOL_IN2, TABAN - u);   // u > 0 (çizgi solda): sol yavaşla, sağ hızlan\n  surucu(SAG_EN, SAG_IN1, SAG_IN2, TABAN + u);\n}\n```\n\n### Nasıl çalışıyor?\n1. `hataOku()` çizginin konumunu verir. Ayar noktası 0 olduğu için konumun kendisi hatadır: `e > 0` çizgi solda demektir.\n2. `u = KP * e`: hata 2 katına çıkarsa direksiyon da 2 katına çıkar.\n3. Sol tekerleğe `TABAN - u`, sağ tekerleğe `TABAN + u` verilir. Çizgi soldaysa (`u > 0`) sol tekerlek yavaşlar, sağ tekerlek hızlanır ve robot sola döner (76. dersteki ω = (vR - vL) / L formülü).\n4. Çizgi kaybolursa (`sayi == 0`) hata, son görülen tarafa doğru \"çok uzak\" anlamında ±2 yapılır (en uç sensörün konumu). Sensörler 2,4 cm arayla, çizgi 2 cm genişliğinde olduğu için çizgi iki sensörün arasından geçerken kısa süre hiçbirine görünmeyebilir; ±2 bu anlarda robotu fazla savurmaz. Robot çizgiyi bulana kadar o yöne döner.\n5. `surucu()` 78. dersteki ölü bölgeyi atlar: komut 1 olsa bile PWM en az %20 olur. Böylece `u` ile tekerlek hızı yaklaşık doğrusal kalır.\n6. `millis()` ile 10 ms'de bir çalışan sabit bir kontrol döngüsü kurduk (27. ders). Sabit periyot, 97. dersteki türev için de gerekli.\n\n### Ölçüm: Kp'yi değiştir\nAynı sketch'i 4 farklı `KP` ile (8, 85, 210, 830) `sim.rover` üzerinde koşturduk. Pist: saat yönünün tersine dönen, alt düzlüğünde iki dalgalı (slalom) bölüm olan, viraj yarıçapı 17 cm'lik bir pist. `TABAN = 200`. (Derste `KP = 170` var; tabloda ayarın etkisini görmek için dört uç değer seçtik.)\n\n| Kp | Sonuç | Tur süresi | Hata RMS | En büyük sapma | Direksiyon titreşimi |\n|---|---|---|---|---|---|\n| 8 | çizgiyi kaybetti | - | 52,6 mm | 175 mm | 0,06 |\n| 85 | turu bitirdi | 10,40 sn | 15,7 mm | 46 mm | 0,43 |\n| 210 | turu bitirdi | 10,90 sn | 8,4 mm | 19 mm | 0,95 |\n| 830 | turu bitirdi | 12,10 sn | 7,9 mm | 19 mm | 1,49 |\n\n- **Hata RMS:** robotun dizi merkezinin çizgiye uzaklığının karekök-ortalaması. Küçük olması iyi.\n- **Direksiyon titreşimi:** her 20 ms'de sol-sağ tekerlek hız farkındaki ortalama değişim (rad/s). Büyük olması robotun direksiyonu sürekli oynattığı anlamına gelir.\n\nOkuma:\n- **Kp çok küçükse** direksiyon yetmez. Robot virajda çizgiden çıkar ve onu kaybeder.\n- **Kp uygunsa** robot çizgide kalır ve turu bitirir.\n- **Kp büyüdükçe** hata küçülür ama direksiyon titreşimi artar. Kp = 830'da titreşim Kp = 85'in yaklaşık 3,5 katı; tur da 1,7 sn uzadı. Daha fazla Kp her zaman daha iyi değildir.\n\n### Neden büyük Kp burada salınmadı?\nGerçek robotlarda çok büyük Kp çoğu zaman robotu çizginin iki yanına savurur (salınım). Bu pistte bunu çok az gördük, çünkü dizi tekerlek aksının **7 cm önünde**. Robot, burnunun nereye gittiğini görüyor ve düzeltmeyi erkenden yapıyor. İleriye bakmak bir tür sönümlemedir. Dizinin aks yakınına (2 cm) alındığı aynı pistte, aynı Kp = 210 ile ilk 8 saniyede şunu ölçtük:\n\n| Dizi aksın | Çizgiyi kesme sayısı | Hata RMS |\n|---|---|---|\n| 7 cm önünde | 7 | 8,4 mm |\n| 2 cm önünde | 14 | 17,6 mm |\n\nDizi aksa yaklaşınca robot çizgiyi çok daha sık kesiyor; salınım artıyor. 97. derste salınımı sönümleyen terimi öğreneceksin.\n\n### Gerçek robotta farklı olabilecekler\n- Bu benzetimde çizgi sensörlerine gürültü eklenmedi. Gerçek dizide ortam ışığı ve yüzey rengi okumayı değiştirir; eşiği 87. dersteki gibi kalibre etmen gerekir.\n- Motorların tepki hızı ve ölü bölgesi her robotta farklıdır. Buradaki Kp değerlerini kendi robotuna kopyalama; kendi robotunda ölç.\n\n### Dene\n- `KP = 100` ile `TABAN` değerini 150, 200 ve 255 yap. Hangi hızda robot çizgiyi kaybediyor?\n- `ESIK` değerini 900 yap. Çizgi üstünde sensör yaklaşık 860 okur. Robot ne yapar, neden?\n- `konum_oku` sketch'inde iki sensörü birden çizgi üstüne getir. Konum neden 0,5'lik adımlarla değişiyor?\n\n### Sık yapılan hatalar\n- `TABAN - u` ve `TABAN + u` yerlerini karıştırmak: robot çizgiye değil, çizgiden uzağa döner.\n- Hatanın işaretini yanlış tanımlamak. Burada pozitif hata = çizgi solda = sola dön. Sağ ve sol tekerlekleri buna göre bağla.\n- Kp'yi bir seferde çok büyütmek. Küçükten başla, her seferinde 2 katına çıkar ve ölç.\n- `loop()` içine `delay()` koymak. Kontrol döngüsünün periyodu sabit olmazsa sonraki derslerdeki D ve I terimleri bozulur.\n- Çizgi kayıp durumunu atlamak: `sayi == 0` iken sıfıra bölme olur ya da robot düz gider.",
          "question": "Robot çizginin tam üzerindeyken (hata 0) P kontrol direksiyona ne verir? Virajda çizgi robotun hep aynı tarafında kalıyorsa ne olur? Hata hiç sıfır olmazsa P kontrol yeterli mi?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Ayar noktası, hata ve kontrol çıkışı kavramlarını\n- Çizgi dizisinin okumasını tek bir \"konum\" sayısına çevirmeyi\n- P kontrolün formülünü (`u = Kp x e`) ve robotun tekerleklerine nasıl uygulandığını\n- Kp'nin çok küçük ya da çok büyük olmasının sonuçlarını\n\n### Önceden bilmen gerekenler\n- Bang-bang çizgi izleme (88. ders): \"sağ, sol ya da düz\" kararı\n- İki tekerleğin hız farkıyla dönüş (76. ders) ve motor ölü bölgesi (78. ders)\n- `millis()` ile sabit periyotlu döngü (27. ders)\n\n### Hata, ayar noktası ve çıkış\nBisikletle yolun kenarına yaklaşırken direksiyonu hatanın büyüklüğüne göre çevirirsin. Kontrolün dili de budur. **Ayar noktası** robotun olmak istediği yerdir: çizgi dizinin tam ortasında. **Hata** (e), ayar noktası ile ölçüm arasındaki farktır; hata 0 ise robot istediği yerdedir. **Kontrol çıkışı** (u) ise robotun direksiyonudur.\n\n### Dizi okumasını konuma çevirmek\nBeş sensörün her birine bir ağırlık verilir:\n\n```\nsensör:   A0   A1   A2   A3   A4\nağırlık:  +2   +1    0   -1   -2\n```\n\nÇizgiyi gören sensörlerin ağırlıklarının ortalaması çizginin **konumudur**. Pozitif konum çizginin robotun solunda olduğunu söyler. Ayar noktası 0 olduğu için konumun kendisi hatadır. Çizgi yalnız A0 ve A1'de görünüyorsa konum (2 + 1) / 2 = 1,5 olur. Hiçbir sensör görmüyorsa konum yoktur; bu durumda son görülen yöne doğru \"uzakta\" demek en güvenli seçimdir.\n\n### P kontrol\n**P (orantılı) kontrol** direksiyonu hata ile doğru orantılı verir:\n\n```\nu = Kp x e\nsol tekerlek = TABAN - u\nsağ tekerlek = TABAN + u\n```\n\n**Kp**, hatayı direksiyona çeviren sayıdır. Çizgi soldaysa (`e > 0`) sol tekerlek yavaşlar, sağ tekerlek hızlanır ve robot sola döner. Hata iki katına çıkarsa direksiyon da iki katına çıkar. Bang-bang'den farkı budur: orada her hatada aynı sert dönüşü yapıyordun.\n\n### Kp nasıl seçilir?\nBenzetimde aynı pistte dört farklı Kp denedik:\n\n| Kp | Sonuç |\n|---|---|\n| 8 (çok küçük) | direksiyon yetmedi, çizgi kayboldu |\n| 85 ve 210 | tur bitti, hata küçüldü |\n| 830 (çok büyük) | tur bitti ama direksiyon sürekli oynadı, tur uzadı |\n\nKp çok küçükse robot virajı dönemez. Büyüdükçe hata küçülür, fakat bir noktadan sonra kazanç azalır ve robot titremeye başlar. Küçükten başla, her seferinde iki katına çıkar ve ölç.\n\n### Özet\nP kontrol, direksiyonu hata kadar verir: `u = Kp x e`. Çizgi dizisinden ağırlıklı ortalamayla konum bulunur ve bu konum hata olarak kullanılır. Kp çok küçükse robot çizgiyi kaybeder, çok büyükse titrer. Bu yüzden Kp'yi küçükten başlatıp ölçerek artırmak gerekir.",
          "concepts": [
            {
              "term": "Ayar noktası",
              "definition": "Kontrolün ulaşmak istediği değer; çizgi izlemede çizginin dizinin tam ortasında olması.",
              "example": "Konum 0 ise çizgi A2 sensörünün altındadır ve robot istediği yerdedir.",
              "pitfall": "Ayar noktasını sensörün ham değeriyle karıştırmak; hata, ayar noktası ile ölçüm arasındaki farktır."
            },
            {
              "term": "Hata (e)",
              "definition": "Ayar noktası ile ölçüm arasındaki fark; hata 0 ise robot istediği yerdedir.",
              "example": "Çizgi yalnız A1'i kapatıyorsa konum 1,0'dır ve çizgi solda olduğu için hata +1'dir.",
              "pitfall": "Hatanın işaretini ters tanımlamak; robot çizgiye değil çizgiden uzağa döner."
            },
            {
              "term": "Konum (ağırlıklı ortalama)",
              "definition": "Çizgiyi gören sensörlerin ağırlıklarının ortalaması; sensörler +2, +1, 0, -1, -2 ağırlıklıdır.",
              "example": "Yalnız A2 ve A3 çizgiyi görürse konum (0 + (-1)) / 2 = -0,5'tir.",
              "pitfall": "Toplamı sensör sayısına bölmeyi unutmak; iki sensör görünce konum iki katı çıkar."
            },
            {
              "term": "P kontrol",
              "definition": "Direksiyonu hata ile doğru orantılı veren kontrol: u = Kp x e.",
              "example": "Kp = 100 ve e = 1,5 ise u = 150 PWM olur.",
              "pitfall": "P kontrolün hatayı tamamen sıfırlayacağını sanmak; hata sıfır olunca direksiyon da sıfır olur."
            },
            {
              "term": "Kp",
              "definition": "Hatayı direksiyona çeviren kazanç; büyüdükçe aynı hataya daha sert tepki verilir.",
              "example": "Kp = 8'de robot çizgiyi kaybetti, Kp = 85'te turu bitirdi.",
              "pitfall": "Kp'yi tek seferde çok büyütmek; robot çizgiyi iki yana savurur ve direksiyon titrer."
            },
            {
              "term": "Çizgi kaybı",
              "definition": "Hiçbir sensör çizgiyi görmediğinde hata yerine son görülen yöne verilen büyük bir değer.",
              "example": "Çizgi en son soldaysa hata +2 sayılır ve robot sola dönerek çizgiyi arar.",
              "pitfall": "sayi == 0 durumunu atlamak; sıfıra bölme olur ya da robot düz gider."
            }
          ],
          "quiz": [
            {
              "id": "m5h5d96-q1",
              "kind": "numeric",
              "prompt": "Beş sensörün ağırlıkları A0 için +2, A1 için +1, A2 için 0, A3 için -1, A4 için -2'dir. Çizgiyi yalnız A2 ve A3 görüyorsa çizginin konumu kaçtır?",
              "answer": -0.5,
              "tolerance": 0.01,
              "explanation": "Görenlerin ağırlık toplamı 0 + (-1) = -1'dir ve iki sensör gördüğü için ortalama -1 / 2 = -0,5 olur. Negatif işaret çizginin robotun sağında olduğunu söyler; Bölmeyi unutursan -1 bulursun; bu yanlıştır.",
              "skills": [
                "ctl-proportional"
              ]
            },
            {
              "id": "m5h5d96-q2",
              "kind": "numeric",
              "prompt": "Bir çizgi izleyicide TABAN = 200, Kp = 100 ve hata e = -1,5'tir. Sağ tekerleğe verilen değer (TABAN + u) kaçtır?",
              "answer": 50,
              "tolerance": 0,
              "explanation": "u = Kp x e = 100 x (-1,5) = -150. Sağ tekerlek TABAN + u = 200 - 150 = 50 olur; sol tekerlek ise 200 + 150 = 350 olacağı için 255'te sınırlanır. Çizgi sağda olduğundan sağ tekerlek yavaşlar ve robot sağa döner.",
              "skills": [
                "ctl-proportional"
              ]
            },
            {
              "id": "m5h5d96-q3",
              "kind": "mcq",
              "prompt": "P kontrollü bir çizgi izleyicide Kp çok küçük seçilirse virajda en olası sonuç nedir?",
              "options": [
                "Robot sürekli çizginin iki yanına savrulur",
                "Direksiyon yetmez ve robot çizgiyi kaybeder",
                "Robot hiç hareket etmez",
                "Robot daha hızlı ve daha doğru gider"
              ],
              "answer": 1,
              "explanation": "Küçük Kp hataya yetersiz tepki verir; ölçümde Kp = 8 ile robot virajda çizgiden çıkıp onu kaybetti. Savrulma ve titreme büyük Kp'nin belirtisidir, küçük Kp'nin değil.",
              "skills": [
                "ctl-proportional"
              ]
            },
            {
              "id": "m5h5d96-q4",
              "kind": "find-bug",
              "prompt": "Konum pozitifken çizgi robotun solundadır ve robot sola dönmelidir. Aşağıdaki kodda robot çizgiden uzağa dönüyor. Tek hata nerede?\n\n```\nfloat e = hataOku();      // + : çizgi solda\nfloat u = KP * e;\nsurucu(SOL_EN, SOL_IN1, SOL_IN2, TABAN + u);\nsurucu(SAG_EN, SAG_IN1, SAG_IN2, TABAN - u);\n```",
              "options": [
                "KP * e yerine KP + e yazılmalı",
                "hataOku() fonksiyonu çağrılmamalı",
                "TABAN sabiti 255 olmalı",
                "Sol tekerlek TABAN - u, sağ tekerlek TABAN + u almalı; işaretler ters"
              ],
              "answer": 3,
              "explanation": "Çizgi soldaysa sol tekerlek yavaşlamalı ve sağ tekerlek hızlanmalıdır. Kodda tam tersi yazıldığı için robot çizgiden uzağa döner. Çarpma işlemi, fonksiyon çağrısı ve TABAN değeri doğrudur.",
              "skills": [
                "ctl-proportional",
                "prog-debug"
              ]
            },
            {
              "id": "m5h5d96-q5",
              "kind": "predict-output",
              "prompt": "Bu kod çalışınca seri monitöre ne yazar?\n\n```\nvoid setup() {\n  Serial.begin(9600);\n  int deger[5] = {100, 800, 900, 100, 100};\n  int sayi = 0;\n  int toplam = 0;\n  for (int i = 0; i < 5; i++) {\n    if (deger[i] > 500) {\n      sayi++;\n      toplam += 2 - i;\n    }\n  }\n  Serial.println((float)toplam / sayi, 1);\n}\nvoid loop() {}\n```",
              "options": [
                "0.5",
                "1.5",
                "-0.5",
                "1.0"
              ],
              "answer": 0,
              "explanation": "Eşiği yalnız A1 (800) ve A2 (900) geçer. Ağırlıklar 2 - 1 = 1 ve 2 - 2 = 0'dır; toplam 1, sensör sayısı 2 olduğu için sonuç 0.5 çıkar. Println'in ikinci argümanı 1 ondalık basamak yazar.",
              "skills": [
                "ctl-proportional",
                "prog-debug"
              ]
            }
          ]
        },
        {
          "title": "D: türev ve gürültü",
          "durationMin": 30,
          "problem": "Araba sürerken kenara hızla yaklaştığını görürsen, henüz uzak olsan bile direksiyonu şimdiden düzeltmeye başlarsın. Sadece \"ne kadar uzağım\" değil, \"ne kadar hızlı yaklaşıyorum\" diye de bakarsın. Kontrolde buna **D (türev)** terimi denir. Ama bir tuzağı var: ölçüm titrerse D bu titremeyi büyütür. Bu derste ikisini de sayıyla göreceksin.",
          "contentMd": "### Kavramlar\n- **Türev:** hatanın değişim hızı. `turev = (e - sonHata) / dt` (cm/s). Hata hızla büyüyorsa türev büyük.\n- **PD kontrol:** `u = Kp x e + Kd x turev`. Hata büyümeye başlayınca D bunu hemen görür ve sert fren yapar; hata küçülürken D yumuşatır. Bu sönümleme demektir.\n- Hyvex'in staj programında 16. günün sorusu: \"Robot hedefe varıyor ama salınıyor, hangi terim, hangi yön?\" Cevap: sönümlemeyi D terimi sağlar; Kd'yi artır (ya da Kp'yi azalt).\n\n### Bu derste neden duvar takibi?\nDuvar takipçisi D'yi görmek için iyi bir yer: direksiyon önce robotun **yönünü**, yön de **mesafeyi** değiştirir. Etki gecikmeli olduğu için Kp büyüdükçe robot hedefi aşar. Çizgi dizisinde büyük Kd'nin tur süresini bozduğunu projede (100. ders) ölçeceğiz.\n\nServo ultrasonik sensörü **180 derece** (sola) çevirir; ışın robotun sol duvarına dik gider. Hata: `e = mesafe - HEDEF`. `e > 0` robot duvardan uzakta demektir ve sola, yani duvara doğru dönmesi gerekir. Yön kuralı 96. dersteki ile aynı: `u > 0` sola dön.\n\n### Devre\n| Parça | Bağlantı |\n|---|---|\n| Sol motor | EN **D5** (PWM), IN1 **D7**, IN2 **D8** |\n| Sağ motor | EN **D6** (PWM), IN3 **D9**, IN4 **D10** |\n| HC-SR04 | TRIG **D11**, ECHO **D12**, VCC 5 V, GND |\n| Servo | Sinyal **D4** (180 derece = sola bakar) |\n\nMotorlar ve servo için harici güç kullan, tüm GND'leri ortak bağla. Pili kısa devre yapma, ters bağlama.\n\n### Program\n```cpp\n// sketch: d_duvar\n#include <Servo.h>\n\nconst int SOL_EN = 5, SOL_IN1 = 7, SOL_IN2 = 8;\nconst int SAG_EN = 6, SAG_IN1 = 9, SAG_IN2 = 10;\nconst int TRIG = 11, ECHO = 12, SERVO_PIN = 4;\n\nconst float HEDEF = 15.0;          // duvarla istenen mesafe (cm)\nconst float KP = 16.0;             // PWM / cm\nconst float KD = 3.0;              // PWM / (cm/s)\nconst float ALFA = 0.8;            // türev süzgeci: 0 = süzgeç yok, 1'e yaklaştıkça daha yavaş\nconst int TABAN = 170;\nconst int UMAX = 100;              // direksiyon sınırı\nconst unsigned long DT = 50;       // 20 ölçüm / saniye\n\nServo servo;\nunsigned long son = 0;\nfloat mesafe = HEDEF;\nfloat sonHata = 0;\nfloat turevSuz = 0;                // süzülmüş türev\n\nvoid surucu(int en, int in1, int in2, int v) {\n  v = constrain(v, -255, 255);\n  int pwm = abs(v);\n  if (pwm > 0) pwm = map(pwm, 1, 255, 51, 255);\n  digitalWrite(in1, v > 0);\n  digitalWrite(in2, v < 0);\n  analogWrite(en, pwm);\n}\n\n// Mesafe (cm). Yankı yoksa -1.\nfloat olc() {\n  digitalWrite(TRIG, LOW);\n  delayMicroseconds(2);\n  digitalWrite(TRIG, HIGH);\n  delayMicroseconds(10);\n  digitalWrite(TRIG, LOW);\n  unsigned long us = pulseIn(ECHO, HIGH, 25000);\n  if (us == 0) return -1;\n  return us / 58.0;\n}\n\nvoid setup() {\n  int pinler[] = {SOL_EN, SOL_IN1, SOL_IN2, SAG_EN, SAG_IN1, SAG_IN2, TRIG};\n  for (int i = 0; i < 7; i++) pinMode(pinler[i], OUTPUT);\n  pinMode(ECHO, INPUT);\n  servo.attach(SERVO_PIN);\n  servo.write(180);                // ışın sola, duvara dik\n  delay(500);\n  float ilk = olc();\n  if (ilk > 0) mesafe = ilk;\n  sonHata = mesafe - HEDEF;        // ilk türev sıçramasını önle\n}\n\nvoid loop() {\n  if (millis() - son < DT) return;\n  son += DT;\n  float dt = DT / 1000.0;\n\n  float m = olc();\n  if (m > 0) mesafe = m;           // yankı yoksa eski değeri koru\n\n  float e = mesafe - HEDEF;        // + : duvardan çok uzak\n  float turev = (e - sonHata) / dt;\n  sonHata = e;\n  turevSuz = ALFA * turevSuz + (1 - ALFA) * turev;   // basit alçak geçiren süzgeç\n\n  float u = KP * e + KD * turevSuz;\n  u = constrain(u, -UMAX, UMAX);\n\n  surucu(SOL_EN, SOL_IN1, SOL_IN2, TABAN - u);       // u > 0: duvara (sola) dön\n  surucu(SAG_EN, SAG_IN1, SAG_IN2, TABAN + u);\n}\n```\n\n### Nasıl çalışıyor?\n1. `olc()` 82. dersteki gibi mesafeyi cm cinsinden verir. Yankı gelmezse eski ölçümü kullanırız.\n2. Türev, iki ölçüm arasındaki farkın geçen süreye bölümüdür. `DT = 50` ms olduğu için saniyede 20 ölçüm alırız.\n3. `setup()` içinde `sonHata` ilk ölçüme göre ayarlanır. Ayarlamazsak ilk döngüde sahte bir türev sıçraması olur.\n4. `turevSuz` türevin süzülmüş hâlidir: `turevSuz = ALFA * turevSuz + (1 - ALFA) * turev`. `ALFA = 0` süzgeç yok demek. `ALFA = 0,8` her yeni türevin yalnız %20'sini alır; yaklaşık 0,2 sn'lik bir yumuşatma olur.\n5. `u` önce `UMAX` ile sınırlanır; çok büyük hatada robot yerinde dönmesin.\n\n### Ölçüm 1: Kp büyüyünce ne olur, D ne yapar?\nRobot duvara paralel, hedeften **4 cm uzakta** başlar (19 cm). Düz duvar, gürültü yok. Her Kp için iki koşu: `Kd = 0` ve `Kd = 0,15 x Kp`.\n\n| Kp | Kd | Aşım (hedefin ötesine) | Hata RMS | Sonuç |\n|---|---|---|---|---|\n| 16 | 0 | 3,8 cm | 0,97 cm | oturdu |\n| 16 | 2,4 | 1,3 cm | 0,35 cm | oturdu |\n| 32 | 0 | 6,5 cm | 1,67 cm | büyük aşım |\n| 32 | 4,8 | 1,0 cm | 0,20 cm | oturdu |\n| 48 | 0 | 7,5 cm | 2,36 cm | duvara değdi |\n| 48 | 7,2 | 1,5 cm | 0,31 cm | oturdu |\n| 64 | 0 | 7,5 cm (duvara değdi) | 7,98 cm | duvara değdi, sonra duvardan 10,6 cm uzakta kaldı |\n| 64 | 9,6 | 2,5 cm | 0,56 cm | oturdu |\n\n\"Aşım 7,5 cm\" robotun duvara değdiği anlamına gelir (robot yarıçapı 7,5 cm). Okuma:\n- P tek başına Kp'yi artırınca **iyileşmedi, kötüleşti**: aşım 3,8 cm'den 7,5 cm'e çıktı.\n- Aynı Kp'lerde `Kd = 0,15 x Kp` aşımı 3 ile 6,5 kat arasında küçülttü ve robotu duvara çarpmaktan kurtardı. Hata RMS'i Kp = 16'da yaklaşık 3 kat, Kp = 32 ve üstünde 7 kattan fazla düştü.\n\n### Ölçüm 2: Gürültü D'yi nasıl bozar?\nUltrasonik ölçümlere 1 cm'lik rastgele gürültü ekledik (`noiseCm = 1`). 1 cm'lik oynama 50 ms'de bile yaklaşık 28 cm/s'lik tipik **sahte hız** üretir (iki ölçümün farkı / 0,05 sn). D bu sahte hızı Kd ile çarpıp motora verir. `Kp = 16`, aynı başlangıç:\n\n| Ayar | Hata RMS | Direksiyon titreşimi |\n|---|---|---|\n| Kd = 0 (P) | 1,21 cm | 0,29 |\n| Kd = 3, süzgeçsiz (`ALFA = 0`) | 0,49 cm | 1,21 |\n| Kd = 3, süzgeçli (`ALFA = 0,8`) | 0,58 cm | 0,51 |\n| Kd = 20, süzgeçsiz | 2,02 cm | 1,57 |\n| Kd = 20, süzgeçli | 1,09 cm | 1,12 |\n\n- Süzgeçsiz D hatayı iyi bastırdı (RMS 1,21 -> 0,49) ama direksiyon titreşimi **4 katına** çıktı (0,29 -> 1,21). Motorlar durmadan titredi.\n- Süzgeç titreşimi yarıdan fazla azalttı (1,21 -> 0,51). Karşılığında D biraz gecikir; aşım 1,4 cm'den 2,3 cm'ye çıktı.\n- **Kd'yi aşırı büyütmek** işe yaramaz: Kd = 20'de hata yeniden büyüdü ve robot hedef bandında (+-2 cm) zamanın yalnız %49'unda kaldı.\n\n### Kd nasıl seçilir?\n1. `Kd = 0` ile başla; Kp'yi aşım görene kadar artır.\n2. `Kd = 0,15 x Kp` ile başla (burada `16 x 0,15 = 2,4`; sketch'te biraz fazla, 3). Aşım küçülüyorsa artır.\n3. Motor titremeye ya da ses çıkarmaya başlarsa Kd'yi azalt ya da `ALFA`'yı büyüt.\n\n### Gerçek robotta farklı olabilecekler\n- Gerçek HC-SR04 yan duvarda, özellikle duvara eğik bakınca, yanlış ya da hiç yankı döndürebilir. Benzetimdeki 1 cm'lik gürültü iyimserdir.\n- Bu kuralları (\"0,15 x Kp\") kendi robotuna aynen taşıma. Sayılar bu benzetimdeki robota aittir; yöntem (önce Kp, sonra Kd, sonra süzgeç) geçerlidir.\n\n### Dene\n- `Kp = 32` yap ve `KD` değerini 0, 2, 5, 10 yap. Hata nasıl değişiyor?\n- `ALFA` değerini 0,5 ve 0,95 yap. Hangisi motoru daha az titretiyor, hangisi daha çok aşıyor?\n- Robotu hedeften 4 cm uzakta başlat ve `setup()` içindeki `sonHata = mesafe - HEDEF;` satırını sil. İlk saniyede ne değişiyor?\n\n### Sık yapılan hatalar\n- Gürültülü ölçümde süzgeçsiz D kullanmak: motor cızırdar, titrer.\n- Kd'yi Kp'ye göre çok büyük seçmek: hata azalmaz, artar.\n- Kontrol periyodunu (`DT`) değiştirip `dt`'yi güncellememek: türev yanlış ölçeklenir.\n- İlk türevi hesaplarken `sonHata`'yı başlatmamak: ilk döngüde robot hırçın bir hamle yapar.\n- Kd'nin işaretini ters yazmak: D sönümlemek yerine salınımı büyütür.",
          "question": "\"Robot hedefe varıyor ama salınıyor: hangi terim, hangi yön?\" sorusuna şimdi sayıyla cevap verebilir misin? Ölçüm gürültülüyse Kd'yi küçültmek mi, ölçümü süzmek mi daha iyi? Bedeli ne?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Türev kavramını: hatanın ne kadar hızlı değiştiğini\n- PD kontrolün formülünü ve D teriminin neden sönümleme yaptığını\n- Gürültülü ölçümde D'nin neden zararlı olabileceğini\n- Basit bir alçak geçiren süzgeçle türevi yumuşatmayı\n\n### Önceden bilmen gerekenler\n- P kontrol, hata ve Kp (96. ders)\n- HC-SR04 ile mesafe ölçme ve `pulseIn` (82. ders)\n- `millis()` ile sabit periyot (27. ders)\n\n### Hızı da görmek\nKenara hızla yaklaşan sürücü, henüz uzak olsa bile direksiyonu şimdiden düzeltir. Yalnız \"ne kadar uzağım\" değil, \"ne kadar hızlı yaklaşıyorum\" diye de bakar. Kontroldeki karşılığı **türev**dir (D): hatanın değişim hızı.\n\n```\nturev = (e - sonHata) / dt\n```\n\nÖrnek: hata önceki turda 5 cm, şimdi 4 cm ve tur arası 0,05 sn ise türev (4 - 5) / 0,05 = -20 cm/s olur. Negatif türev hatanın küçüldüğünü, yani robotun hedefe yaklaştığını söyler.\n\n### PD kontrol\n```\nu = Kp x e + Kd x turev\n```\n\nHata büyümeye başlarken D bunu hemen görür ve karşı yönde fren yapar. Hata küçülürken D yumuşak davranır. Bu etkiye **sönümleme** denir. P tek başına Kp büyüdükçe robotu hedefin ötesine fırlatır; benzetimde duvar takibinde Kp 16'dan 48'e çıkınca aşım 3,8 cm'den 7,5 cm'e yükseldi ve robot duvara değdi. Aynı Kp'lerde Kd eklemek aşımı birkaç kat küçülttü.\n\n### Duvar takibinde hata\nServo, ultrasonik sensörü sola çevirir. Hata `e = mesafe - HEDEF` olur ve `e > 0` robot duvardan uzakta demektir. Bu durumda robotun duvara, yani sola dönmesi gerekir. Yön kuralı 96. dersteki gibidir: `u > 0` sola dön.\n\n### Gürültü ve süzgeç\nÖlçüm titrerse türev bu titremeyi büyütür. 1 cm'lik bir oynama bile 50 ms aralıkta yaklaşık 20 cm/s'lik bir sahte hız üretir. D bu sahte hızı Kd ile çarpıp motora verir ve motorlar titremeye başlar. Çare türevi süzmektir:\n\n```\nturevSuz = ALFA * turevSuz + (1 - ALFA) * turev\n```\n\nALFA = 0 süzgeç yok demektir. ALFA = 0,8 olduğunda yeni türevin yalnız %20'si alınır. Karşılığında D biraz geç tepki verir.\n\n### Kd seçimi\nÖnce Kd = 0 ile Kp'yi aşım görene kadar artır. Sonra Kd'yi Kp'nin yaklaşık onda biri civarında dene ve aşım azalıyorsa artır. Motor titremeye başlarsa Kd'yi azalt ya da süzgeci güçlendir. Sayılar robota göre değişir; kural ölçmektir.\n\n### Özet\nD terimi hatanın değişim hızına bakar ve aşımı sönümler: `u = Kp x e + Kd x turev`. P tek başına büyük Kp ile robotu hedefin ötesine savurur, Kd bunu önler. Gürültülü ölçümde süzgeçsiz D sahte hızlar üretir ve motoru titretir. Bu yüzden türev ALFA ile süzülür ve Kd küçük tutulur.",
          "concepts": [
            {
              "term": "Türev (D)",
              "definition": "Hatanın değişim hızı: (e - sonHata) / dt.",
              "example": "Hata 9 cm'den 12 cm'ye 50 ms'de çıktıysa türev +60 cm/s'dir.",
              "pitfall": "dt ile bölmeyi unutmak; türev kontrol periyoduna bağımlı ve yanlış ölçekli olur."
            },
            {
              "term": "PD kontrol",
              "definition": "Hem hataya hem de hatanın değişim hızına bakan kontrol: u = Kp x e + Kd x turev.",
              "example": "Robot duvara hızla yaklaşırken D henüz hata küçükken fren yapar.",
              "pitfall": "Kd'nin işaretini ters yazmak; D sönümlemek yerine salınımı büyütür."
            },
            {
              "term": "Aşım",
              "definition": "Robotun hedefi geçip öbür yana taşması; hedef ile en uç nokta arasındaki mesafe.",
              "example": "Yalnız P ile Kp = 48'de robot hedefin 7,5 cm ötesine gitti ve duvara değdi.",
              "pitfall": "Aşımı azaltmak için Kp'yi büyütmek; P tek başına büyük Kp ile aşımı artırır."
            },
            {
              "term": "Sönümleme",
              "definition": "Salınımı ve aşımı azaltan etki; D terimi bunu sağlar.",
              "example": "Kp = 32'de Kd = 4,8 eklenince aşım 6,5 cm'den 1,0 cm'ye indi.",
              "pitfall": "Kd'yi aşırı büyütmek; hata yeniden büyür ve robot hedef bandında az kalır."
            },
            {
              "term": "Türev süzgeci",
              "definition": "Türevi turevSuz = ALFA * turevSuz + (1 - ALFA) * turev ile yumuşatan basit alçak geçiren süzgeç.",
              "example": "ALFA = 0,8 iken her yeni türevin yalnız %20'si alınır.",
              "pitfall": "Gürültülü ölçümde süzgeçsiz D kullanmak; motor titrer ve cızırdar."
            },
            {
              "term": "Sahte hız",
              "definition": "Ölçüm gürültüsünün türevde yarattığı gerçek olmayan değişim hızı.",
              "example": "1 cm'lik oynama 50 ms aralıkta yaklaşık 20 cm/s sahte hız üretir.",
              "pitfall": "Ölçümün oynamasını robotun gerçek hareketi sanmak."
            }
          ],
          "quiz": [
            {
              "id": "m5h5d97-q1",
              "kind": "numeric",
              "prompt": "Duvar takipçisinde hata önceki turda 9 cm, şimdi 12 cm'dir. Kontrol periyodu DT = 50 ms ise türev kaç cm/s olur?",
              "answer": 60,
              "tolerance": 0,
              "unit": "cm/s",
              "explanation": "Türev = (e - sonHata) / dt = (12 - 9) / 0,05 = 60 cm/s. 50 ms'yi 0,05 sn'ye çevirmeyi unutup 50'ye bölersen 0,06 bulursun; bu yanlıştır.",
              "skills": [
                "ctl-derivative"
              ]
            },
            {
              "id": "m5h5d97-q2",
              "kind": "numeric",
              "prompt": "Türev süzgecinde turevSuz = 0, ALFA = 0,8 ve yeni ölçülen türev 30 cm/s ise güncellemeden sonra turevSuz kaç olur?",
              "answer": 6,
              "tolerance": 0.01,
              "unit": "cm/s",
              "explanation": "turevSuz = 0,8 x 0 + (1 - 0,8) x 30 = 6 cm/s. Süzgeç yeni türevin yalnız %20'sini aldığı için ani sıçrama yumuşar; kod tam doğru çalışsa da D burada geç tepki verir.",
              "skills": [
                "ctl-derivative"
              ]
            },
            {
              "id": "m5h5d97-q3",
              "kind": "mcq",
              "prompt": "Duvar takibinde yalnız P kontrol kullanılırken Kp 16'dan 48'e üç katına çıkarılırsa aşım nasıl değişir?",
              "options": [
                "Aşım azalır, robot daha rahat oturur",
                "Aşım artar ve robot duvara değebilir",
                "Aşım hiç değişmez",
                "Aşım sıfır olur"
              ],
              "answer": 1,
              "explanation": "Ölçümde aşım 3,8 cm'den 7,5 cm'e çıktı ve robot duvara değdi. Büyük Kp hataya sert tepki verir ama etkiler gecikmeli olduğu için robot hedefi aşar; aşımı azaltan şey Kd'dir.",
              "skills": [
                "ctl-derivative"
              ]
            },
            {
              "id": "m5h5d97-q4",
              "kind": "find-bug",
              "prompt": "PD kontrollü duvar takipçisi robotu önce iyi gidiyor, sonra giderek hırçınlaşıyor. Tek hata nerede?\n\n```\nvoid loop() {\n  float e = mesafe - HEDEF;\n  float turev = (e - sonHata) / dt;\n  float u = KP * e + KD * turev;\n  // ... motorlara u uygulanır\n}\n```",
              "options": [
                "dt ile bölünmemeli",
                "KD * turev terimi çıkarılmalı",
                "sonHata hiç güncellenmiyor; türev ilk hatadan bu yana toplam değişimi gösterir",
                "e hesabında HEDEF kullanılmamalı"
              ],
              "answer": 2,
              "explanation": "Her turun sonunda sonHata = e atanmazsa türev hep başlangıçtaki hatayla karşılaştırılır ve giderek büyür. Türevin dt'ye bölünmesi ve e'nin HEDEF'e göre hesaplanması doğrudur; KD terimini çıkarmak sorunu çözmez, D'yi yok eder.",
              "skills": [
                "ctl-derivative",
                "prog-debug"
              ]
            },
            {
              "id": "m5h5d97-q5",
              "kind": "mcq",
              "prompt": "Ultrasonik ölçüme 1 cm gürültü eklenip Kd = 3 süzgeçsiz kullanıldığında ne ölçüldü?",
              "options": [
                "Titreşim azaldı çünkü D sönümler",
                "Hiçbir şey değişmedi",
                "Hem hata hem titreşim arttı",
                "Hata RMS'i düştü ama direksiyon titreşimi yaklaşık 4 katına çıktı"
              ],
              "answer": 3,
              "explanation": "Hata RMS'i 1,21 cm'den 0,49 cm'ye düştü ama titreşim 0,29'dan 1,21'e çıktı: D, gürültünün yarattığı sahte hızı motora aktardı. Süzgeç (ALFA = 0,8) titreşimi 0,51'e indirdi.",
              "skills": [
                "ctl-derivative"
              ]
            }
          ]
        },
        {
          "title": "I: integral ve windup",
          "durationMin": 35,
          "problem": "Bir arabanın sağ lastiği biraz daha az şişikse, direksiyonu bıraktığında araba yavaşça bir yana çeker. Robotlarda da iki motorun verimi hiçbir zaman aynı değildir. P kontrol bu çekmeyi düzeltmeye çalışır, ama bir tuzağı vardır: düzeltme hataya bağlıdır, hata sıfır olunca düzeltme de sıfır olur. Robot bu yüzden hedefe hiç tam varamaz, hep biraz kenarda gider. Bu derste hatayı **biriktiren** terimi (I) ve onun yan etkisini (windup) göreceksin.",
          "contentMd": "### Kavramlar\n- **Kalıcı hata:** uzun süre sonra bile kapanmayan hata. P kontrolde sabit bir dış etki (zayıf motor) varsa oluşur.\n- **Integral (I):** hatanın zaman içinde toplamı: `integral += e * dt`. Küçük bir hata bile uzun sürerse birikir ve düzeltmeyi büyütür. `u = Kp x e + Ki x integral + Kd x turev`.\n- **Windup:** çıkış sınırına dayandığında (motor 255'ten fazla PWM alamaz) hata sürdüğü için integral birikmeye devam eder. Sonra hata tersine dönse bile bu birikmiş değer çıkışı uzun süre yanlış yerde tutar.\n- **Anti-windup:** windup'ı önleyen yöntemler. İki tane göreceksin: integrali sınırlamak ve çıkış doyunca integrali durdurmak.\n\n### Devre\n| Parça | Bağlantı |\n|---|---|\n| Sol motor | EN **D5** (PWM), IN1 **D7**, IN2 **D8** |\n| Sağ motor | EN **D6** (PWM), IN3 **D9**, IN4 **D10** |\n| HC-SR04 | TRIG **D11**, ECHO **D12** |\n| Servo (180 derece, sola bakar) | Sinyal **D4** |\n| Sol enkoder | **D2** (kesme pini) |\n\nMotorlar ve servo için harici güç, ortak GND. Pili kısa devre yapma, ters bağlama.\n\n### Program 1: Zayıf motorlu robot duvar takibinde\n97. dersin duvar takipçisine integral ekledik. Integral `ILIM` ile sınırlanıyor.\n\n```cpp\n// sketch: i_duvar\n#include <Servo.h>\n\nconst int SOL_EN = 5, SOL_IN1 = 7, SOL_IN2 = 8;\nconst int SAG_EN = 6, SAG_IN1 = 9, SAG_IN2 = 10;\nconst int TRIG = 11, ECHO = 12, SERVO_PIN = 4;\n\nconst float HEDEF = 15.0;          // duvarla istenen mesafe (cm)\nconst float KP = 6.0;              // PWM / cm\nconst float KI = 2.0;              // PWM / (cm x s)\nconst float KD = 3.0;              // PWM / (cm/s)\nconst float ILIM = 30.0;           // integral sınırı (cm x s); KI x ILIM = 60 PWM\nconst float ALFA = 0.8;            // türev süzgeci: 0 = süzgeç yok, 1'e yaklaştıkça daha yavaş\nconst int TABAN = 170;\nconst int UMAX = 100;              // direksiyon sınırı\nconst unsigned long DT = 50;       // 20 ölçüm / saniye\n\nServo servo;\nunsigned long son = 0;\nfloat mesafe = HEDEF;\nfloat sonHata = 0;\nfloat turevSuz = 0;                // süzülmüş türev\nfloat integral = 0;                // hataların birikimi (cm x s)\n\nvoid surucu(int en, int in1, int in2, int v) {\n  v = constrain(v, -255, 255);\n  int pwm = abs(v);\n  if (pwm > 0) pwm = map(pwm, 1, 255, 51, 255);\n  digitalWrite(in1, v > 0);\n  digitalWrite(in2, v < 0);\n  analogWrite(en, pwm);\n}\n\n// Mesafe (cm). Yankı yoksa -1.\nfloat olc() {\n  digitalWrite(TRIG, LOW);\n  delayMicroseconds(2);\n  digitalWrite(TRIG, HIGH);\n  delayMicroseconds(10);\n  digitalWrite(TRIG, LOW);\n  unsigned long us = pulseIn(ECHO, HIGH, 25000);\n  if (us == 0) return -1;\n  return us / 58.0;\n}\n\nvoid setup() {\n  int pinler[] = {SOL_EN, SOL_IN1, SOL_IN2, SAG_EN, SAG_IN1, SAG_IN2, TRIG};\n  for (int i = 0; i < 7; i++) pinMode(pinler[i], OUTPUT);\n  pinMode(ECHO, INPUT);\n  servo.attach(SERVO_PIN);\n  servo.write(180);                // ışın sola, duvara dik\n  delay(500);\n  float ilk = olc();\n  if (ilk > 0) mesafe = ilk;\n  sonHata = mesafe - HEDEF;        // ilk türev sıçramasını önle\n}\n\nvoid loop() {\n  if (millis() - son < DT) return;\n  son += DT;\n  float dt = DT / 1000.0;\n\n  float m = olc();\n  if (m > 0) mesafe = m;           // yankı yoksa eski değeri koru\n\n  float e = mesafe - HEDEF;        // + : duvardan çok uzak\n  float turev = (e - sonHata) / dt;\n  sonHata = e;\n  turevSuz = ALFA * turevSuz + (1 - ALFA) * turev;   // basit alçak geçiren süzgeç\n\n  integral += e * dt;\n  integral = constrain(integral, -ILIM, ILIM);       // sınırla: sonsuza gitmesin\n\n  float u = KP * e + KI * integral + KD * turevSuz;\n  u = constrain(u, -UMAX, UMAX);\n\n  surucu(SOL_EN, SOL_IN1, SOL_IN2, TABAN - u);       // u > 0: duvara (sola) dön\n  surucu(SAG_EN, SAG_IN1, SAG_IN2, TABAN + u);\n}\n```\n\n### Ölçüm 1: Kalıcı sapma\nSağ motoru %15 zayıflattık (`gain: right = 0,85`). Düz duvar, hedef 15 cm, 12 sn. Robot duvardan uzaklaşmak ister; bunu durdurmak için yaklaşık 13 PWM'lik sabit bir direksiyon gerekir.\n\n| Ayar | Son 1 sn'de ortalama sapma | 6. sn'den sonra +-2 cm içinde kalma |\n|---|---|---|\n| `KI = 0` (PD) | 2,25 cm | %7 |\n| `KI = 2` (PID, derste) | 0,09 cm | %95 |\n\nP kontrolde sapma hesaplanabilir: sabit 13 PWM'i `Kp = 6` ile üretmek için hata `13 / 6 = 2,2 cm` kalmak zorunda. Integral ise bu sabit direksiyonu kendi üstüne alır: hata 0'a inse bile integral birikmiş değerini korur. Motorlar eşit olduğunda aynı PID sapmayı 0,06 cm'de tutar; I, ihtiyaç yokken zarar vermez.\n\n`KI` değerini değiştirince sapmanın kapanma hızı değişir. Aynı koşuda 12. sn civarındaki sapma:\n\n| KI | 0,5 | 1 | 2 (derste) | 6 | 12 |\n|---|---|---|---|---|---|\n| Sapma | 0,97 cm | 0,41 cm | 0,09 cm | 0,08 cm | 0,09 cm |\n\nKI büyüdükçe sapma daha çabuk kapanır. KI = 12'de ise hedef 0,8 cm aşıldı (KI = 2'de aşım yok). KI büyüdükçe aşım artmaya başlar.\n\n`ILIM` integrali sınırlar. Çıkışa en fazla `KI x ILIM` PWM katkı yapabilir: derste `2 x 30 = 60` PWM, gereken 13 PWM'den fazla. `ILIM = 3` yaparsan `2 x 3 = 6` PWM yetmez; aynı koşuda sapma 2,25 cm'den 1,27 cm'ye indi ama kapanmadı.\n\n### Program 2: Windup'ı kanıtla\nWindup en net **hız kontrolünde** görülür. Robot 15, sonra 25 cm/s hızla gitmeye çalışır. Sonra hedefi 50 cm/s yaparız. Motor en fazla yaklaşık 39,6 cm/s verir (12 rad/s x 3,3 cm), yani çıkış 255'e dayanır ve hata kapanmaz. 4 saniye sonra hedefi tekrar 15'e düşürürüz. Sketch'te `ANTI_WINDUP` ile iki hâli karşılaştırabilirsin. (`Kc = 7,4` ve `Ti = 0,08` değerlerinin nereden geldiğini 99. derste ölçerek bulacaksın; şimdilik hazır kabul et.)\n\n```cpp\n// sketch: i_hiz_windup\nconst int SOL_EN = 5, SOL_IN1 = 7, SOL_IN2 = 8;\nconst int SAG_EN = 6, SAG_IN1 = 9, SAG_IN2 = 10;\nconst int ENK_SOL = 2;                 // sol enkoder (kesme pini)\n\nconst float TIK_CM = 1.0367;           // bir tık = 1,04 cm yol (20 yuva, 3,3 cm yarıçap)\nconst float KC = 7.4;                  // PWM / (cm/s)\nconst float TI = 0.08;                 // integral zamanı (s)\nconst bool ANTI_WINDUP = false;        // true: çıkış doyunca integrali durdur\nconst unsigned long DT = 20;\n\nvolatile unsigned long sonTikUs = 0;\nvolatile unsigned long aralikUs = 0;\nunsigned long son = 0;\nunsigned long sonYazdir = 0;\nfloat integral = 0;\n\nvoid surucu(int en, int in1, int in2, int v) {\n  v = constrain(v, -255, 255);\n  int pwm = abs(v);\n  if (pwm > 0) pwm = map(pwm, 1, 255, 51, 255);\n  digitalWrite(in1, v > 0);\n  digitalWrite(in2, v < 0);\n  analogWrite(en, pwm);\n}\n\nvoid tik() {\n  unsigned long t = micros();\n  aralikUs = t - sonTikUs;             // son iki tık arası süre\n  sonTikUs = t;\n}\n\n// Tekerlek hızı (cm/s): bir tıkın yolu / tıklar arası süre.\nfloat hizOku() {\n  noInterrupts();\n  unsigned long aralik = aralikUs;\n  unsigned long sonTik = sonTikUs;\n  interrupts();\n  unsigned long gecen = micros() - sonTik;\n  if (aralik == 0 || gecen > 200000UL) return 0;   // 0,2 sn tık yoksa durdu say\n  if (gecen > aralik) aralik = gecen;              // yavaşlıyorsa eski aralığa güvenme\n  return TIK_CM * 1000000.0 / aralik;\n}\n\n// İstenen hız (cm/s): 15 -> 25 -> 50 (motorun gücünü aşar) -> 15\nfloat hedefHiz(unsigned long t) {\n  if (t < 1500) return 15;\n  if (t < 3500) return 25;\n  if (t < 7500) return 50;\n  return 15;\n}\n\nvoid setup() {\n  int pinler[] = {SOL_EN, SOL_IN1, SOL_IN2, SAG_EN, SAG_IN1, SAG_IN2};\n  for (int i = 0; i < 6; i++) pinMode(pinler[i], OUTPUT);\n  pinMode(ENK_SOL, INPUT_PULLUP);\n  attachInterrupt(digitalPinToInterrupt(ENK_SOL), tik, RISING);\n  Serial.begin(115200);\n}\n\nvoid loop() {\n  if (millis() - son < DT) return;\n  son += DT;\n  float dt = DT / 1000.0;\n\n  float hiz = hizOku();\n  float e = hedefHiz(millis()) - hiz;\n\n  // Bu turda integrali eklersek çıkış ne olurdu?\n  float aday = KC * (e + (integral + e * dt) / TI);\n  bool doymus = (aday <= 0 || aday >= 255);\n  if (!(ANTI_WINDUP && doymus)) integral += e * dt;   // doymuşken biriktirme\n\n  float u = KC * (e + integral / TI);\n  u = constrain(u, 0, 255);\n  surucu(SOL_EN, SOL_IN1, SOL_IN2, u);\n  surucu(SAG_EN, SAG_IN1, SAG_IN2, u);\n\n  if (millis() - sonYazdir >= 500) {          // integralin nasıl büyüdüğünü izle\n    sonYazdir = millis();\n    Serial.print(millis());\n    Serial.print(\",\");\n    Serial.print(hedefHiz(millis()), 0);\n    Serial.print(\",\");\n    Serial.print(hiz, 1);\n    Serial.print(\",\");\n    Serial.println(integral, 1);\n  }\n}\n```\n\n### Nasıl çalışıyor?\n1. Hız, iki enkoder tıkı arasındaki süreden hesaplanır (91-92. derslerdeki enkoder tıkları): `hız = bir tıkın yolu / tıklar arası süre`. Kesme rutini bu süreyi yazarken ana program yarım değer okumasın diye okuma `noInterrupts()` ile `interrupts()` arasına alınır (29. ders).\n2. PI burada standart biçimde: `u = Kc x (e + integral / Ti)`.\n3. `aday`, bu turda integrali eklersek çıkışın ne olacağını hesaplar. `aday` 0'ın altına ya da 255'in üstüne çıkıyorsa çıkış doymuş demektir.\n4. `ANTI_WINDUP = true` iken doymuş turlarda integral artırılmaz. Çıkış doymuşken biriktirmeyi durdurmak \"koşullu integral\" yöntemidir.\n5. Seri çıktı her 500 ms'de `zaman, hedef, hız, integral` yazar. Hedef 50 iken integralin ne yaptığını izle.\n\n### Ölçüm 2: Clamp'siz ve clamp'li\n| Ayar | Hız, hedef 50 iken | 7. sn'de integral | Hedef 15'e inince +-2 cm/s içine girme süresi | Hata alanı (7,5-10 sn) |\n|---|---|---|---|---|\n| `ANTI_WINDUP = false` | ~39,6 cm/s (doymuş) | 40,2 | 1,84 sn | 42,8 cm |\n| `ANTI_WINDUP = true` | ~39,6 cm/s (doymuş) | 1,8 | 0,34 sn | 1,5 cm |\n\nHata alanı: hatanın mutlak değerinin zamanla toplamı (cm/s x sn = cm). Küçük olması iyi.\n\n- İkisi de doymuş sürede hedefe ulaşamadı; bu motorun sınırı, kontrolcünün suçu değil.\n- Clamp'siz sürümde integral 4 saniyede 40'a çıktı. Hedef 15'e inince bu birikim önce boşalmak zorunda; çıkış o sürede yüksek kaldı ve robot yavaşlayamadı. Toparlanma 5,4 kat daha uzun, hata alanı 28 kat büyük.\n- Clamp'li sürümde integral 1,8'de kaldı ve robot 0,34 sn'de yeni hıza oturdu.\n- Doymadan önce (25 cm/s hedefinde) iki sürüm de hedefi izledi (hata alanı 3 cm'nin altında): anti-windup normal çalışmayı bozmaz.\n\n### Gerçek robotta farklı olabilecekler\n- Gerçek tekerlek hızı tıklar arası sürede dalgalanır ve ölçüm kabadır; integral ve türev ayarı biraz daha dikkat ister.\n- Robotu elinle tutarsan gerçek robotda da aynı windup olur: tekerlekler dönmediği için hata büyür, integral birikir. Bıraktığında robot fırlayabilir. Test ederken tekerlekleri havada tut ve bırakmadan önce kontrolü sıfırla.\n\n### Dene\n- `ANTI_WINDUP = false` iken hedef 50 cm/s'yi 30 cm/s ile değiştir (motor bu hıza ulaşabilir). Windup oluşuyor mu? Neden?\n- `i_duvar` sketch'inde `KI`'yı 0,5 yap. Sapma kaç saniyede ±2 cm içine giriyor?\n- `i_hiz_windup`'ta `hedefHiz()` içindeki 50 cm/s bölümünü 4 sn yerine 2 sn yap. Windup etkisi küçülüyor mu?\n\n### Sık yapılan hatalar\n- `integral += e * dt` satırında `dt` ile çarpmayı unutmak: integral kontrol periyoduna bağımlı olur.\n- Integrali hiç sınırlamamak: çıkış doyduğunda windup kaçınılmaz.\n- `KI`'yı tek seferde çok büyütmek: aşım başlar. Küçükten başla.\n- Hatanın işaretini ters yazmak: integral hatayı kapatmak yerine büyütür.\n- Robot tutulurken ya da engele dayanmışken kontrolü açık bırakmak: integral sessizce birikir.",
          "question": "Robotu elinle havada tutarken PI kontrol açık kalsaydı integrale ne olurdu? Bıraktığın anda robot ne yapardı? Anti-windup'ı hangi iki yoldan yapabilirsin, hangisi hangi durumda daha uygun?",
          "explainerMd": "### Bu derste öğreneceklerin\n- P kontrolün neden kalıcı bir hata bıraktığını\n- Integral (I) teriminin hatayı nasıl biriktirdiğini\n- Windup'ın (integralin şişmesinin) ne olduğunu ve neden zararlı olduğunu\n- Anti-windup için iki yöntemi: integrali sınırlamak ve doyunca durdurmak\n\n### Önceden bilmen gerekenler\n- P ve D terimleri (96. ve 97. dersler)\n- Enkoder tıklarından hız hesabı (91. ve 92. dersler)\n- PWM'in 0-255 arasında sınırlı olduğu (Modül 3, 16. ders)\n\n### P kontrolün kalıcı hatası\nSağ lastiği az şişik bir araba direksiyon bırakılınca bir yana çeker. Robotta bu, zayıf bir motordur. P kontrol bu çekmeyi düzeltmek için sabit bir direksiyon vermek zorundadır. Ama `u = Kp x e` olduğundan, sıfırdan farklı bir u ancak sıfırdan farklı bir hatayla üretilir. Sonuç **kalıcı hata**dır.\n\nSayıyla: dengelemek için 13 PWM'lik sabit direksiyon gerekiyorsa ve Kp = 6 ise hata `13 / 6 = 2,2 cm` kalmak zorundadır. Kp'yi büyütürsen hata küçülür ama tamamen kapanmaz.\n\n### Integral\n**Integral** hatayı zaman içinde toplar:\n\n```\nintegral += e * dt\nu = Kp x e + Ki x integral + Kd x turev\n```\n\nKüçük bir hata bile uzun sürerse integral büyür ve direksiyonu artırır. Hata sıfıra inince integral birikmiş değerini korur, böylece sabit düzeltme devam eder. Benzetimde sağ motor %15 zayıfken `Ki = 0` ile sapma 2,25 cm kaldı, `Ki = 2` ile 0,09 cm'ye indi.\n\nKi büyüdükçe sapma daha çabuk kapanır ama bir noktadan sonra aşım başlar. Küçükten başla.\n\n### Windup\nMotor 255'ten fazla PWM alamaz. Robot yetişemeyecek bir hıza hedeflenirse (hedef 50 cm/s, motorun sınırı yaklaşık 39,6 cm/s) hata kapanmaz ve integral büyümeye devam eder. Bu şişmeye **windup** denir. Hedef sonradan düştüğünde şişmiş integral önce boşalmak zorundadır; bu sürede çıkış yüksek kalır ve robot yavaşlayamaz.\n\nÖlçüm: 4 saniyelik doyma sonunda integral 40,2'ye çıktı ve robot yeni hıza oturmak için 1,84 sn aldı.\n\n### Anti-windup\nİki yaygın yöntem vardır:\n1. **Integrali sınırlamak:** `integral = constrain(integral, -ILIM, ILIM)`. Çıkışa en fazla `Ki x ILIM` katkı gelir.\n2. **Doyunca durdurmak (koşullu integral):** çıkış 0 ya da 255'e dayanmışken `integral += e * dt` yapılmaz.\n\nİkinci yöntemde aynı koşuda integral 1,8'de kaldı ve toparlanma 0,34 sn sürdü. Doymadan önceki normal çalışma bozulmadı. ILIM'i fazla küçük seçersen kalıcı hatayı kapatamazsın: `2 x 3 = 6 PWM` gereken 13 PWM'e yetmez.\n\n### Özet\nP kontrol kalıcı bir hata bırakır, integral bu hatayı biriktirerek kapatır. Çıkış doyduğunda integral şişer; bu windup yeni hedefe geçişi uzun süre geciktirir. İntegrali sınırlamak ya da doyunca durdurmak windup'ı önler. Ki küçükten başlatılır, çünkü büyük Ki aşıma yol açar.",
          "concepts": [
            {
              "term": "Kalıcı hata",
              "definition": "Uzun süre sonra bile kapanmayan hata; P kontrolde sabit bir dış etki varsa oluşur.",
              "example": "Zayıf motorlu robotta Ki = 0 iken duvar sapması 2,25 cm'de kaldı.",
              "pitfall": "Kp'yi büyüterek kalıcı hatayı tamamen silmeyi beklemek; hata küçülür ama kapanmaz ve Kp çok büyürse aşım başlar."
            },
            {
              "term": "Integral (I)",
              "definition": "Hatanın zaman içindeki toplamı: integral += e * dt. Çıkışa Ki x integral eklenir.",
              "example": "Ki = 2 iken sapma 2,25 cm'den 0,09 cm'ye indi.",
              "pitfall": "dt ile çarpmayı unutmak; integral kontrol periyoduna bağımlı olur."
            },
            {
              "term": "Ki",
              "definition": "Birikmiş hatayı çıkışa çeviren kazanç; büyüdükçe kalıcı hata daha çabuk kapanır.",
              "example": "Ki = 0,5 iken 12. sn'de sapma 0,97 cm, Ki = 6 iken 0,08 cm'dir.",
              "pitfall": "Ki'yı tek seferde çok büyütmek; Ki = 12'de hedef 0,8 cm aşıldı."
            },
            {
              "term": "Çıkış doyması",
              "definition": "Kontrol çıkışının sınıra (PWM için 0 ya da 255) dayanması; hata sürse bile çıkış artamaz.",
              "example": "Motor en fazla yaklaşık 39,6 cm/s verdiği için 50 cm/s hedefinde çıkış 255'e dayanır.",
              "pitfall": "Hata kapanmıyorsa kontrolcüyü suçlamak; bazen sınır motorun gücüdür."
            },
            {
              "term": "Windup",
              "definition": "Çıkış doyarken hata sürdüğü için integralin şişmesi; hedef değişince çıkışı uzun süre yanlış yerde tutar.",
              "example": "4 sn doymadan sonra integral 40,2'ye çıktı ve yeni hıza oturma 1,84 sn sürdü.",
              "pitfall": "Robotu elinle havada tutarken kontrolü açık bırakmak; integral sessizce birikir ve bırakınca robot fırlar."
            },
            {
              "term": "Anti-windup",
              "definition": "Windup'ı önleyen yöntemler: integrali sınırlamak ya da çıkış doyunca integrali durdurmak.",
              "example": "ANTI_WINDUP = true iken integral 1,8'de kaldı ve toparlanma 0,34 sn sürdü.",
              "pitfall": "ILIM'i fazla küçük seçmek; Ki x ILIM gereken sabit direksiyondan küçük kalırsa hata kapanmaz."
            }
          ],
          "quiz": [
            {
              "id": "m5h5d98-q1",
              "kind": "numeric",
              "prompt": "Zayıf bir motoru dengelemek için sabit olarak 18 PWM'lik direksiyon gerekiyor. Yalnız P kontrol (Kp = 9 PWM/cm) kullanılıyorsa kalıcı hata kaç cm olur?",
              "answer": 2,
              "tolerance": 0.01,
              "unit": "cm",
              "explanation": "P kontrolde u = Kp x e olduğundan 18 = 9 x e ve e = 2 cm olur. Hata sıfır olsaydı direksiyon da sıfır olacaktı ve zayıf motor robotu çekmeye devam edecekti.",
              "skills": [
                "ctl-integral"
              ]
            },
            {
              "id": "m5h5d98-q2",
              "kind": "numeric",
              "prompt": "Hata 4 saniye boyunca sabit 3 cm kalıyor ve integral += e * dt ile biriktiriliyor. Ki = 2 ise integralin çıkışa kattığı değer kaç PWM'dir? (ILIM sınırına ulaşılmadığını varsay.)",
              "answer": 24,
              "tolerance": 0.01,
              "unit": "PWM",
              "explanation": "İntegral = 3 x 4 = 12 cm x sn. Çıkışa katkısı Ki x integral = 2 x 12 = 24 PWM olur. dt ile çarpmayı unutursan değer periyoda bağlı ve yanlış çıkar.",
              "skills": [
                "ctl-integral"
              ]
            },
            {
              "id": "m5h5d98-q3",
              "kind": "predict-output",
              "prompt": "Bu kod çalışınca seri monitöre ne yazar?\n\n```\nvoid setup() {\n  Serial.begin(9600);\n  float integral = 0;\n  for (int i = 0; i < 10; i++) {\n    integral += 2.0 * 0.5;\n  }\n  integral = constrain(integral, -3, 3);\n  Serial.println(integral, 1);\n}\nvoid loop() {}\n```",
              "options": [
                "10.0",
                "1.0",
                "3.0",
                "0.0"
              ],
              "answer": 2,
              "explanation": "Her turda integrale 2,0 x 0,5 = 1,0 eklenir; 10 turda 10,0 olur. constrain bunu -3 ile 3 arasına kıstığı için yazılan değer 3.0'dır. Sınırlamak anti-windup yöntemlerinden biridir.",
              "skills": [
                "ctl-integral",
                "prog-debug"
              ]
            },
            {
              "id": "m5h5d98-q4",
              "kind": "mcq",
              "prompt": "Hız kontrolünde hedef 50 cm/s, motorun sınırı yaklaşık 39,6 cm/s'dir. 4 saniye sonra hedef 15 cm/s'ye düşürülüyor ve anti-windup yok. Ne olur?",
              "options": [
                "Robot hemen yeni hıza oturur",
                "Şişmiş integral önce boşalmak zorunda olduğundan çıkış yüksek kalır ve robot geç yavaşlar",
                "İntegral kendiliğinden sıfırlanır",
                "Motor ters yöne döner"
              ],
              "answer": 1,
              "explanation": "Doyma sırasında hata kapanmadığı için integral büyümeye devam eder (ölçümde 40,2). Hedef düşünce bu birikim boşalana kadar çıkış yüksek kalır ve oturma 1,84 sn sürer. İntegral kendiliğinden sıfırlanmaz; o yüzden anti-windup gerekir.",
              "skills": [
                "ctl-integral"
              ]
            },
            {
              "id": "m5h5d98-q5",
              "kind": "find-bug",
              "prompt": "Bu hız kontrolcüsünde integral, kontrol periyodunu değiştirince farklı davranıyor. Tek hata nerede?\n\n```\nfloat dt = DT / 1000.0;\nfloat e = hedef - hiz;\nintegral += e;\nfloat u = KP * e + KI * integral;\n```",
              "options": [
                "integral += e * dt olmalı; dt'siz toplam kontrol periyoduna bağımlıdır",
                "e = hiz - hedef olmalı",
                "KP * e terimi çıkarılmalı",
                "dt değişkeni tanımlanmamalı"
              ],
              "answer": 0,
              "explanation": "İntegral, hatanın zamanla toplamıdır; hata dt ile çarpılmazsa periyodu iki katına çıkardığında saniyedeki toplama sayısı yarıya iner ve integral yarı hızda birikir. Hatanın işareti, KP terimi ve dt tanımı doğrudur.",
              "skills": [
                "ctl-integral",
                "prog-debug"
              ]
            }
          ]
        },
        {
          "title": "PID ayarı: el ile ve SIMC",
          "durationMin": 40,
          "problem": "PID'nin üç sayısı (Kp, Ki, Kd) var ama bu sayıları hangi sırayla ve nasıl seçeceksin? Hyvex'te, Horde'da hız takip hatasını PID ayarıyla düzelttik. Ziegler-Nichols yerine **SIMC** yöntemini seçtik, çünkü Ziegler-Nichols kararlılık sınırına kadar kazanç artırmayı gerektirir ve bu gerçek donanımda risklidir. Bu derste üç yolu da robotun hız döngüsünde dene ve sayılarla karşılaştır.",
          "contentMd": "### Hız döngüsü\nBu derste kontrol edilen şey tekerlek hızı. Girdi: motora verilen PWM (`u`). Çıktı: enkoderden ölçülen hız (cm/s). Robot 98. dersteki hız ölçümünü kullanır. İki tekerlek aynı komutu alır, sol enkoder (D2) hızı ölçer.\n\n| Parça | Bağlantı |\n|---|---|\n| Sol motor | EN **D5** (PWM), IN1 **D7**, IN2 **D8** |\n| Sağ motor | EN **D6** (PWM), IN3 **D9**, IN4 **D10** |\n| Sol enkoder | **D2** (kesme pini) |\n\nMotorlar için harici güç, ortak GND. Pili kısa devre yapma, ters bağlama.\n\n### Yol 1: El ile ayar\nSırası önemli:\n1. **Önce P.** `Ki = Kd = 0`. Kp'yi küçükten başlayıp büyüt; hedefi hızlı izleyip hafifçe aşmaya başlayınca dur. (96. ders)\n2. **Sonra D.** Aşımı ve salınımı söndürmek için Kd ekle; ölçüm gürültülüyse süz. (97. ders)\n3. **En sonda I.** Kalıcı sapma kalmışsa Ki ekle ve integrali sınırla. (98. ders)\n\nHer adımda tek şeyi değiştir ve sayıyı ölç. Örnek: duvar takibinde `Kp = 32` ile aşım 6,5 cm'ydi; `Kd = 4,8` ekleyince 1,0 cm'ye indi (97. ders). Zayıf motorlu robotta `Ki = 2` kalıcı sapmayı 2,25 cm'den 0,09 cm'ye indirdi (98. ders).\n\nEl ile ayar iş görür ama sezgiye dayanır. Her robot ve her sistem için baştan deneme yaparsın. Bu yüzden iki \"sistematik\" yola bakalım.\n\n### Yol 2: Ziegler-Nichols ve neden riskli\nZiegler-Nichols (Z-N) şöyle çalışır: `Ki = Kd = 0` yap, Kp'yi **sistem kalıcı olarak salınana kadar** artır. Salınmaya başladığı kazanç `Ku`, salınımın periyodu `Pu` olur. PI ayarı: `Kc = 0,45 x Ku`, `Ti = Pu / 1,2`.\n\nHız döngüsünde yalnızca P kontrolle (hedef 25 cm/s) Kc'yi artırdık ve hız ölçümünün tepeden tepeye oynamasına baktık:\n\n| Kc | 10 | 14 | 16 | 18 | 20 | 22 | 24 |\n|---|---|---|---|---|---|---|---|\n| Hızın tepeden tepeye oynaması (cm/s) | 0,4 | 0,8 | 1,8 | 2,6 | 10,6 | 12,9 | 15,4 |\n\nKc = 18'e kadar salınım küçük; 20'de kalıcı salınım başlıyor: `Ku = 20`, `Pu = 0,22 sn`. Z-N PI ayarı: `Kc = 9`, `Ti = 0,183 sn`.\n\nBu ayar çalışır, ama bedeline bak: Ku'yu bulmak için hızı **hedefin %40'ı kadar** (25 cm/s etrafında 10,6 cm/s) salındırdık. Simülasyonda bunun zararı yok. Gerçek bir araçta (hızlı bir robot, tekne, drone) sistemi bilerek kararlılık sınırına getirmek, tek yanlış adımda araca ya da çevresine zarar verebilir. Hyvex'in Z-N yerine SIMC'i seçme nedeni de buydu.\n\n### Yol 3: SIMC\nSIMC (Skogestad) sistemi **güvenle** ölçülen bir adım cevabından tanır. Önce sistemi şu basit modelle ifade ederiz: **birinci derece + gecikme**:\n- `k`: kazanç. Girdi 1 birim artınca çıktı sonunda kaç birim artar?\n- `tau (τ)`: zaman sabiti. Çıktı cevabının ne kadar yavaş oturduğu.\n- `theta (θ)`: gecikme. Komut verildikten sonra çıktının kıpırdamaya başlamadığı süre.\n\nSonra formül:\n- `Kc = (1 / k) x τ / (τc + θ)`\n- `τI = min(τ, 4 x (τc + θ))`\n\nBuradaki `τc`, kapalı döngüden istediğin zaman sabiti. Küçük `τc` hızlı ama sert, büyük `τc` yumuşak demektir. Skogestad'ın önerisi hızlı ve sağlam bir seçim olarak `τc = θ`.\n\n#### Adım 1: Adım cevabını ölç\nMotora aniden PWM 100'den 180'e atlat. Her enkoder tıkında zaman ve hız yazılır.\n\n```cpp\n// sketch: adim_cevabi\nconst int SOL_EN = 5, SOL_IN1 = 7, SOL_IN2 = 8;\nconst int SAG_EN = 6, SAG_IN1 = 9, SAG_IN2 = 10;\nconst int ENK_SOL = 2;\n\nconst float TIK_CM = 1.0367;           // bir tık = 1,04 cm yol\nconst int U1 = 100;                    // adımdan önceki komut (PWM)\nconst int U2 = 180;                    // adımdan sonraki komut (PWM)\nconst unsigned long ADIM_ZAMANI = 2000;   // ms\n\nvolatile unsigned long sonTikUs = 0;\nvolatile unsigned long aralikUs = 0;\nvolatile unsigned long tikSayisi = 0;\nunsigned long yazilan = 0;\n\nvoid surucu(int en, int in1, int in2, int v) {\n  v = constrain(v, -255, 255);\n  int pwm = abs(v);\n  if (pwm > 0) pwm = map(pwm, 1, 255, 51, 255);\n  digitalWrite(in1, v > 0);\n  digitalWrite(in2, v < 0);\n  analogWrite(en, pwm);\n}\n\nvoid tik() {\n  unsigned long t = micros();\n  aralikUs = t - sonTikUs;\n  sonTikUs = t;\n  tikSayisi++;\n}\n\nvoid setup() {\n  int pinler[] = {SOL_EN, SOL_IN1, SOL_IN2, SAG_EN, SAG_IN1, SAG_IN2};\n  for (int i = 0; i < 6; i++) pinMode(pinler[i], OUTPUT);\n  pinMode(ENK_SOL, INPUT_PULLUP);\n  attachInterrupt(digitalPinToInterrupt(ENK_SOL), tik, RISING);\n  Serial.begin(115200);\n}\n\nvoid loop() {\n  unsigned long t = millis();\n  int u = (t < ADIM_ZAMANI) ? U1 : U2;          // t = 2 sn'de komut aniden 100 -> 180\n  surucu(SOL_EN, SOL_IN1, SOL_IN2, u);\n  surucu(SAG_EN, SAG_IN1, SAG_IN2, u);\n\n  if (tikSayisi != yazilan) {                   // yeni tık geldi: zaman ve hızı yaz\n    noInterrupts();\n    unsigned long aralik = aralikUs;\n    yazilan = tikSayisi;\n    interrupts();\n    Serial.print(t);\n    Serial.print(',');\n    Serial.println(TIK_CM * 1000000.0 / aralik, 1);   // cm/s\n  }\n}\n```\n\nBenzetimde şu çıktıyı aldık (adım t = 2000 ms'de):\n\n| Zaman (ms) | 2016 | 2068 | 2112 | 2153 | 2193 | 2232 | 2270 | 2308 |\n|---|---|---|---|---|---|---|---|---|\n| Hız (cm/s) | 15,5 | 19,9 | 23,6 | 25,3 | 25,9 | 26,6 | 27,3 | 27,3 |\n\nAdım öncesi ortalama hız 15,17 cm/s, adımdan 1 sn sonra 27,63 cm/s.\n\n#### Adım 2: k, τ ve θ'yı hesapla\n1. **k** = hızdaki artış / PWM'deki artış = (27,63 - 15,17) / (180 - 100) = **0,156 cm/s başına PWM birimi**.\n2. İki nokta yöntemi: hızın toplam artışının %28,3'üne ve %63,2'sine ulaştığı zamanlara bak. Gecikmeli birinci derece cevapta bu iki an `t28 = θ + 0,333 τ` ve `t63 = θ + τ` olur. İkisini taraf tarafa çıkarırsan `t63 - t28 = 0,667 τ` kalır. Verimizden: `t28 = 54 ms`, `t63 = 105 ms` (adımdan itibaren).\n3. **τ** = 1,5 x (t63 - t28) = 1,5 x 51 = **77 ms**. Bu, robotun motor gecikmesinin tasarım değeri olan 80 ms ile uyuşuyor.\n4. **θ** = t63 - τ = 105 - 77 = **28 ms**.\n\nDijital kontrolde örnekleme de gecikme sayılır: ortalama yarım periyot, yani `DT / 2 = 10 ms`. Efektif gecikme: `θ = 28 + 10 = 38 ms`.\n\n#### Adım 3: Formülü uygula\n`τc = θ = 0,038 sn` seçtik. Sketch bu formülü doğrudan yazar:\n- `Kc = (1 / 0,156) x 0,077 / (0,038 + 0,038) = 6,49`\n- `τI = min(0,077; 4 x 0,076) = 0,077 sn`\n\n```cpp\n// sketch: simc_hiz\nconst int SOL_EN = 5, SOL_IN1 = 7, SOL_IN2 = 8;\nconst int SAG_EN = 6, SAG_IN1 = 9, SAG_IN2 = 10;\nconst int ENK_SOL = 2;\n\nconst float TIK_CM = 1.0367;\nconst unsigned long DT = 20;           // kontrol periyodu (ms)\n\n// Adım cevabından ölçülen model: hız = K x PWM, gecikme + birinci derece\nconst float K = 0.156;                 // cm/s başına PWM birimi\nconst float TAU = 0.077;               // s\nconst float THETA = 0.038;             // s (ölçülen 0,028 + DT/2 = 0,010)\nconst float TAUC = 0.038;              // s: istenen kapalı döngü zaman sabiti (hızlı seçim: TAUC = THETA)\n\n// SIMC (Skogestad) ayarı\nconst float KC = (1.0 / K) * TAU / (TAUC + THETA);\nconst float TI = min(TAU, 4.0 * (TAUC + THETA));\n\nvolatile unsigned long sonTikUs = 0;\nvolatile unsigned long aralikUs = 0;\nunsigned long son = 0;\nfloat integral = 0;\n\nvoid surucu(int en, int in1, int in2, int v) {\n  v = constrain(v, -255, 255);\n  int pwm = abs(v);\n  if (pwm > 0) pwm = map(pwm, 1, 255, 51, 255);\n  digitalWrite(in1, v > 0);\n  digitalWrite(in2, v < 0);\n  analogWrite(en, pwm);\n}\n\nvoid tik() {\n  unsigned long t = micros();\n  aralikUs = t - sonTikUs;\n  sonTikUs = t;\n}\n\nfloat hizOku() {\n  noInterrupts();\n  unsigned long aralik = aralikUs;\n  unsigned long sonTik = sonTikUs;\n  interrupts();\n  unsigned long gecen = micros() - sonTik;\n  if (aralik == 0 || gecen > 200000UL) return 0;\n  if (gecen > aralik) aralik = gecen;\n  return TIK_CM * 1000000.0 / aralik;\n}\n\nfloat hedefHiz(unsigned long t) {      // 15 -> 25 -> 15 cm/s\n  if (t < 1500) return 15;\n  if (t < 3500) return 25;\n  return 15;\n}\n\nvoid setup() {\n  int pinler[] = {SOL_EN, SOL_IN1, SOL_IN2, SAG_EN, SAG_IN1, SAG_IN2};\n  for (int i = 0; i < 6; i++) pinMode(pinler[i], OUTPUT);\n  pinMode(ENK_SOL, INPUT_PULLUP);\n  attachInterrupt(digitalPinToInterrupt(ENK_SOL), tik, RISING);\n  Serial.begin(115200);\n  Serial.print(\"Kc=\");\n  Serial.print(KC, 2);\n  Serial.print(\" Ti=\");\n  Serial.println(TI, 3);\n}\n\nvoid loop() {\n  if (millis() - son < DT) return;\n  son += DT;\n  float dt = DT / 1000.0;\n\n  float e = hedefHiz(millis()) - hizOku();\n  float aday = KC * (e + (integral + e * dt) / TI);\n  if (aday > 0 && aday < 255) integral += e * dt;     // doymuşken biriktirme (98. ders)\n\n  float u = constrain(KC * (e + integral / TI), 0, 255);\n  surucu(SOL_EN, SOL_IN1, SOL_IN2, u);\n  surucu(SAG_EN, SAG_IN1, SAG_IN2, u);\n}\n```\n\n### Üç yolun karşılaştırması\nHedef 15 -> 25 -> 15 cm/s. \"Oturma\", hızın hedefin +-2 cm/s içine girip orada kalması için geçen süre. \"Hata alanı\", hatanın mutlak değerinin zamanla toplamı (cm/s x sn = cm).\n\n| Ayar | 15 -> 25 oturma | 15 -> 25 aşım | 15 -> 25 hata alanı | 25 -> 15 oturma | 25 -> 15 hata alanı |\n|---|---|---|---|---|---|\n| SIMC, `τc = θ` (Kc 6,49; Ti 0,077) | 0,16 sn | 2,2 cm/s | 0,7 cm | 0,22 sn | 1,2 cm |\n| SIMC yumuşak, `τc = 3 θ` (Kc 3,25) | 0,16 sn | 0,1 cm/s | 0,9 cm | 0,16 sn | 1,0 cm |\n| Z-N PI (Kc 9; Ti 0,183) | 0,26 sn | 1,8 cm/s | 0,9 cm | 0,30 sn | 0,8 cm |\n| Tahminle (Kc 1; Ti 1) | oturmadı | 0 | 33,9 cm | oturmadı | 10,5 cm |\n\n- Elle tahmin edilen zayıf ayar hedefe yetişemedi: hata alanı SIMC'in 48 katı.\n- SIMC ve Z-N benzer hata alanı verdi; SIMC biraz daha çabuk oturdu. Z-N de iyi çalıştı: farkı hız sonucu değil, **yöntem** yaratıyor. SIMC yalnız tek bir güvenli adım testi istedi. Z-N hızı hedefin %40'ı kadar salındırmayı.\n- `τc` tek bir düğme: büyüttüğünde Kc düşüyor, aşım neredeyse kayboluyor (2,2 -> 0,1 cm/s) ve oturma süresi uzamıyor. İstediğin hız-yumuşaklık dengesini bu sayıyla seçersin.\n- SIMC'in `Kc = 6,49` değeri `Ku = 20`'nin yaklaşık üçte biri: kararlılık sınırından uzak durur. Bu, \"güvenlik payı\" demektir.\n\n### Gerçek robotta farklı olabilecekler\n- Gerçek motorda adım cevabı yük ve pil gerilimiyle değişir. `k`, `τ` ve `θ`'yı robot gerçek yükündeyken ve pil dolu iken ölç.\n- Burada ölçülen τ'nun (77 ms) tasarım değerine yakın çıkması benzetimin temiz olmasından. Gerçek ölçümler daha dağınık olur; birkaç adım testi yapıp ortalama al.\n- SIMC modeli basit olduğu için çok yavaş ya da salınımlı sistemlerde tek başına yetmeyebilir. O zaman ölçerek ince ayar yap.\n\n### Dene\n- `TAUC` değerini 0,038 yerine 0,02 ve 0,2 yap. Kc ve Ti nasıl değişiyor? Aşım ve oturma süresi ne yapıyor?\n- `adim_cevabi`'de `U2 = 255` yap. Ölçtüğün k aynı mı çıkıyor? (Bu sistem doğrusal mı?)\n- `simc_hiz` içinde `THETA`'dan `DT / 2`'yi çıkar (0,028 yap). Kc değişince hız takibi bozuluyor mu?\n\n### Sık yapılan hatalar\n- Adım cevabında sistemi durağan haldeyken başlatmamak: önce hız oturmuşken adımı uygula.\n- `k`'yı PWM birimiyle hız birimini karıştırarak hesaplamak. Formüldeki `1 / k` PWM / (cm/s) biriminde olmalı.\n- `θ`'yı unutup yalnız `τ`'yu kullanmak: `Kc` fazla büyük çıkar.\n- Z-N'yi gerçek donanımda \"bir deneyip bakayım\" diye kararsızlık sınırına kadar zorlamak.\n- Ayarı bir tek hızda yapıp her koşulda geçerli saymak.",
          "question": "Hyvex Horde'da Z-N yerine SIMC seçti. Sen kendi robotunda, kırılgan bir parça ya da pahalı bir motor olsaydı hangi yöntemi seçerdin, neden? Adım testinin zaman sabitini yanlış ölçersen (örneğin pil bitmek üzereyken) ne olur?",
          "explainerMd": "### Bu derste öğreneceklerin\n- PID'in üç sayısını (Kp, Ki, Kd) hangi sırayla ayarlayacağını\n- Ziegler-Nichols yönteminin nasıl çalıştığını ve neden riskli olduğunu\n- Adım cevabından k, tau ve theta değerlerini hesaplamayı\n- SIMC formülüyle Kc ve Ti bulmayı\n\n### Önceden bilmen gerekenler\n- P, D ve I terimleri ve anti-windup (96, 97 ve 98. dersler)\n- Enkoderle hız ölçümü (91. ve 92. dersler)\n- Kesmeler ve `volatile` (Modül 3, 29. ders)\n\n### Ayar için üç yol\nÜç sayıyı rastgele denemek yerine bir yöntem gerekir. Birinci yol **el ile ayar**dır; sırası önemlidir. Önce `Ki = Kd = 0` iken Kp'yi hedefi hızlı izleyip hafif aşana kadar artır. Sonra D ekleyip aşımı söndür. En sona I'yı bırak ve kalan sapma varsa onu ekle. Her adımda tek şeyi değiştir ve ölç.\n\n### Ziegler-Nichols\n**Ziegler-Nichols (Z-N)** yönteminde `Ki = Kd = 0` yapılır ve Kp, sistem kalıcı olarak salınana kadar artırılır. Salınmaya başladığı kazanç **Ku**, salınımın periyodu **Pu** olur. PI ayarı:\n\n```\nKc = 0,45 x Ku\nTi = Pu / 1,2\n```\n\nBenzetimde Ku = 20 ve Pu = 0,22 sn çıktı; Kc = 9 ve Ti = 0,183 sn olur. Yöntem çalışır, ama Ku'yu bulmak için sistemi bilerek kararlılık sınırına getirmek gerekir. Hızlı bir araçta ya da kırılgan bir mekanikte bu zarar verebilir.\n\n### SIMC\n**SIMC** yöntemi sistemi güvenle yapılan tek bir adım testinden tanır. Sistem şu üç sayıyla modellenir:\n- **k:** kazanç; girdi 1 birim artınca çıktı sonunda kaç birim artar\n- **tau (τ):** zaman sabiti; cevabın ne kadar yavaş oturduğu\n- **theta (θ):** gecikme; komuttan sonra çıktının kıpırdamadığı süre\n\nFormül:\n\n```\nKc = (1 / k) x tau / (tauc + theta)\nTi = min(tau, 4 x (tauc + theta))\n```\n\n`tauc`, kapalı döngüden istediğin zaman sabitidir. Küçük `tauc` hızlı ama sert, büyük `tauc` yumuşak demektir. Hızlı ve sağlam bir seçim olarak `tauc = theta` alınır.\n\n### Adım cevabından k, tau ve theta\nMotora PWM'de ani bir sıçrama verilir ve hız kaydedilir. Cevap gecikmeli birinci derecedense hızın toplam artışının %28,3'üne ulaştığı an `t28 = theta + tau / 3`, %63,2'sine ulaştığı an `t63 = theta + tau` olur. Buradan:\n\n```\nk     = hızdaki artış / PWM'deki artış\ntau   = 1,5 x (t63 - t28)\ntheta = t63 - tau\n```\n\nDijital kontrolde örnekleme de gecikme sayılır: ortalama yarım periyot, yani `DT / 2`, theta'ya eklenir. Benzetimde k = 0,156, tau = 77 ms ve theta = 28 + 10 = 38 ms çıktı; `tauc = theta` ile Kc = 6,49 ve Ti = 0,077 sn bulundu. Kc, Ku'nun (20) yaklaşık üçte biridir; yani kararlılık sınırından uzak durulur.\n\n### Özet\nEl ile ayarda sıra P, D, I'dır. Z-N sistemi salındırarak Ku ve Pu'yu bulur ve riskli olabilir. SIMC ise tek bir adım testinden k, tau ve theta'yı hesaplayıp Kc ve Ti verir; `tauc` hız ile yumuşaklık arasındaki tek düğmedir. Ölçümleri robot gerçek yükündeyken ve pil doluyken yap.",
          "concepts": [
            {
              "term": "El ile ayar sırası",
              "definition": "Önce Kp (Ki = Kd = 0), sonra Kd, en sonda Ki; her adımda tek değişiklik ve ölçüm.",
              "example": "Kp'yi hedefi hafif aşana kadar artır, sonra aşımı Kd ile söndür, kalan sapmayı Ki ile kapat.",
              "pitfall": "Üç sayıyı aynı anda değiştirmek; hangisinin etkisi olduğunu bilemezsin."
            },
            {
              "term": "Ziegler-Nichols",
              "definition": "Kp'yi kalıcı salınım başlayana kadar artırıp Ku ve Pu'yu bulan, sonra Kc = 0,45 x Ku ve Ti = Pu / 1,2 veren yöntem.",
              "example": "Ku = 20 ve Pu = 0,22 sn ise Kc = 9 ve Ti = 0,183 sn olur.",
              "pitfall": "Gerçek donanımda sistemi kararlılık sınırına kadar zorlamak; tek yanlış adımda araca zarar verebilir."
            },
            {
              "term": "Adım cevabı",
              "definition": "Girdiye ani bir sıçrama verip çıktının zaman içindeki değişimini kaydetme testi.",
              "example": "PWM 100'den 180'e atlarken hız 15,17 cm/s'den 27,63 cm/s'ye çıkar.",
              "pitfall": "Sistem durağan değilken adımı başlatmak; k ve tau yanlış ölçülür."
            },
            {
              "term": "k, tau, theta",
              "definition": "Basit model: k kazanç, tau zaman sabiti, theta gecikme.",
              "example": "Benzetimde k = 0,156, tau = 77 ms, theta = 28 ms çıktı.",
              "pitfall": "k'nın birimini karıştırmak; formüldeki 1 / k, PWM / (cm/s) biriminde olmalıdır."
            },
            {
              "term": "SIMC",
              "definition": "Kc = (1 / k) x tau / (tauc + theta) ve Ti = min(tau, 4 x (tauc + theta)) ile PI ayarı veren yöntem.",
              "example": "k = 0,2, tau = 0,1, theta = 0,05 ve tauc = theta için Kc = 5 olur.",
              "pitfall": "Theta'yı unutup yalnız tau kullanmak; Kc fazla büyük çıkar."
            },
            {
              "term": "tauc",
              "definition": "SIMC'te kapalı döngüden istenen zaman sabiti; hız ile yumuşaklık arasındaki tek düğme.",
              "example": "tauc = 3 theta almak Kc'yi 6,49'dan 3,25'e indirir ve aşımı neredeyse yok eder.",
              "pitfall": "tauc'u theta'dan çok küçük seçmek; Kc çok büyür ve sistem sert tepki verir."
            }
          ],
          "quiz": [
            {
              "id": "m5h5d99-q1",
              "kind": "numeric",
              "prompt": "Bir adım testinde PWM 80'den 160'a atlıyor ve hız 10 cm/s'den 26 cm/s'ye oturuyor. SIMC modelindeki k kazancı kaçtır (cm/s başına PWM birimi)?",
              "answer": 0.2,
              "tolerance": 0.001,
              "unit": "cm/s per PWM",
              "explanation": "k = hızdaki artış / PWM'deki artış = (26 - 10) / (160 - 80) = 16 / 80 = 0,2. Hızın kendisini PWM'e bölmek (26 / 160) kazancı değil oranı verir ve yanlıştır.",
              "skills": [
                "ctl-tuning"
              ]
            },
            {
              "id": "m5h5d99-q2",
              "kind": "numeric",
              "prompt": "Adım cevabında hız, adımdan 40 ms sonra toplam artışın %28,3'üne, 100 ms sonra %63,2'sine ulaşıyor. Zaman sabiti tau kaç milisaniyedir? (tau = 1,5 x (t63 - t28))",
              "answer": 90,
              "tolerance": 0.5,
              "unit": "ms",
              "explanation": "tau = 1,5 x (100 - 40) = 90 ms. Theta = t63 - tau = 10 ms çıkar ve t28 = theta + tau / 3 = 10 + 30 = 40 ms ile tutarlıdır. t63'ü doğrudan tau sanmak 100 ms verir; o gecikmeyi de içerir.",
              "skills": [
                "ctl-tuning"
              ]
            },
            {
              "id": "m5h5d99-q3",
              "kind": "predict-output",
              "prompt": "Bu kod çalışınca seri monitöre ne yazar?\n\n```\nconst float K = 0.2, TAU = 0.1, THETA = 0.05, TAUC = 0.05;\nconst float KC = (1.0 / K) * TAU / (TAUC + THETA);\nconst float TI = min(TAU, 4.0 * (TAUC + THETA));\n\nvoid setup() {\n  Serial.begin(9600);\n  Serial.print(\"Kc=\");\n  Serial.print(KC, 1);\n  Serial.print(\" Ti=\");\n  Serial.println(TI, 2);\n}\nvoid loop() {}\n```",
              "options": [
                "Kc=5.0 Ti=0.10",
                "Kc=10.0 Ti=0.20",
                "Kc=0.5 Ti=0.10",
                "Kc=5.0 Ti=0.40"
              ],
              "answer": 0,
              "explanation": "(1 / 0,2) x 0,1 / (0,05 + 0,05) = 5 x 0,1 / 0,1 = 5,0. Ti = min(0,1; 4 x 0,1 = 0,4) = 0,1; min küçük olanı seçtiği için 0,40 yazılmaz.",
              "skills": [
                "ctl-tuning",
                "prog-debug"
              ]
            },
            {
              "id": "m5h5d99-q4",
              "kind": "mcq",
              "prompt": "Hyvex gibi bir ekip, kırılgan ve pahalı bir araçta Ziegler-Nichols yerine SIMC'i neden seçer?",
              "options": [
                "Z-N'nin formülü yanlış sonuç verir",
                "Z-N için Ku'yu bulmak üzere sistemi bilerek kalıcı salınıma getirmek gerekir; SIMC tek bir güvenli adım testi ister",
                "SIMC yalnız D terimini ayarlar",
                "SIMC hiç ölçüm gerektirmez"
              ],
              "answer": 1,
              "explanation": "Z-N çalışır (benzetimde SIMC'e yakın hata alanı verdi), fakat Ku'yu bulmak sistemi kararlılık sınırına zorlamak demektir. SIMC güvenli bir adım testinden k, tau ve theta'yı çıkarır; ölçüm gerektirmez diyen seçenek yanlıştır.",
              "skills": [
                "ctl-tuning"
              ]
            },
            {
              "id": "m5h5d99-q5",
              "kind": "find-bug",
              "prompt": "Bu SIMC hesabında Kc beklenenden 25 kat küçük çıkıyor (k = 0,2). Tek hata nerede?\n\n```\nconst float K = 0.2, TAU = 0.1, THETA = 0.05, TAUC = 0.05;\nconst float KC = K * TAU / (TAUC + THETA);\nconst float TI = min(TAU, 4.0 * (TAUC + THETA));\n```",
              "options": [
                "TAU yerine THETA kullanılmalı",
                "Paydada TAUC - THETA olmalı",
                "TI için min yerine max kullanılmalı",
                "KC hesabında K yerine 1 / K gerekir"
              ],
              "answer": 3,
              "explanation": "SIMC formülü Kc = (1 / k) x tau / (tauc + theta) biçimindedir. Kodda 1 / k yerine k yazıldığı için sonuç 0,2 çıkıyor, olması gereken 5'tir (25 kat fark). Pay ve payda doğrudur; min doğru işleçtir.",
              "skills": [
                "ctl-tuning",
                "prog-debug"
              ]
            }
          ]
        },
        {
          "title": "Bitirme projesi: PID çizgi izleyen ve duvar takipçisi",
          "durationMin": 35,
          "problem": "Bir yarışta iki robot yan yana duruyor: biri bang-bang, biri PID. Hangisi turu önce bitirir? Bu hafta öğrendiklerin gerçekten işe yarıyor mu, yoksa sadece daha karmaşık mı? Bu projede iddiayı sayıyla sınayacaksın. Üstüne aynı robotla duvar takibini PID ile yapacak ve duvarla 15 cm +-2 cm mesafeyi tutmaya çalışacaksın.",
          "contentMd": "### Ne yapacağız?\nBu proje öğrendiklerini birleştirir:\n- **Hafta 2:** HC-SR04 ve servo (duvara bakan sensör).\n- **Hafta 3:** 5 sensörlü çizgi dizisi ve bang-bang çizgi izleme (88. ders).\n- **Modül 3, hafta 6:** `millis()` ile sabit periyotlu, bloklamayan döngü.\n- **Bu hafta:** P (96), D ve süzgeç (97), I ve anti-windup (98), ölçerek ayar (99).\n\nÜç sketch var:\n1. `proje_cizgi_pid`: PID çizgi izleyici.\n2. `proje_cizgi_bb`: karşılaştırma için bang-bang çizgi izleyici.\n3. `proje_duvar_pid`: PID duvar takipçisi.\n\n### Devre\n| Parça | Bağlantı |\n|---|---|\n| Sol motor | EN **D5** (PWM), IN1 **D7**, IN2 **D8** |\n| Sağ motor | EN **D6** (PWM), IN3 **D9**, IN4 **D10** |\n| 5 sensörlü çizgi dizisi | **A0 ... A4** (A0 en sol, A4 en sağ), aksın 7 cm önünde |\n| HC-SR04 | TRIG **D11**, ECHO **D12** |\n| Servo (sensörü döndürür) | Sinyal **D4** |\n\nMotorlar ve servo için harici güç kullan, tüm GND'leri ortak bağla. Pili kısa devre yapma, ters bağlama. Robotu masa kenarında çalıştırma; ilk denemelerde düşebilir.\n\n### Program 1: PID çizgi izleyici\nÜç terim tek bir `pid()` fonksiyonunda toplandı. Çizgi dizisinde `Kd` çok küçük ve süzgeçli, `Ki` ise 0 tutuldu; nedenini ölçümde göreceksin. Integral yine de sınırlı, böylece `Ki`'yı açmak istersen hazır.\n\n```cpp\n// sketch: proje_cizgi_pid\nconst int SOL_EN = 5, SOL_IN1 = 7, SOL_IN2 = 8;\nconst int SAG_EN = 6, SAG_IN1 = 9, SAG_IN2 = 10;\nconst int SENSOR[5] = {A0, A1, A2, A3, A4};   // A0 en sol ... A4 en sağ\nconst int ESIK = 500;\n\nconst float KP = 240.0;            // PWM / sensör aralığı\nconst float KI = 0.0;              // PWM / (aralık x s)\nconst float KD = 0.5;              // PWM / (aralık/s)\nconst float ALFA = 0.9;            // türev süzgeci\nconst float ILIM = 20.0;           // integral sınırı: KI x ILIM = 100 PWM\nconst int TABAN = 255;\nconst unsigned long DT = 10;       // kontrol periyodu (ms)\n\nunsigned long son = 0;\nunsigned long sonYazdir = 0;\nfloat sonYon = 1;\nfloat integral = 0;\nfloat sonHata = 0;\nfloat turevSuz = 0;\n\nvoid surucu(int en, int in1, int in2, int v) {\n  v = constrain(v, -255, 255);\n  int pwm = abs(v);\n  if (pwm > 0) pwm = map(pwm, 1, 255, 51, 255);\n  digitalWrite(in1, v > 0);\n  digitalWrite(in2, v < 0);\n  analogWrite(en, pwm);\n}\n\n// Çizginin konumu: -2...+2 (pozitif = çizgi solda). Kayıpsa son yöne doğru 2.\nfloat hataOku() {\n  int sayi = 0;\n  float toplam = 0;\n  for (int i = 0; i < 5; i++) {\n    if (analogRead(SENSOR[i]) > ESIK) {\n      sayi++;\n      toplam += 2 - i;\n    }\n  }\n  if (sayi == 0) return sonYon * 2.0;\n  float e = toplam / sayi;\n  if (e != 0) sonYon = (e > 0) ? 1 : -1;\n  return e;\n}\n\n// PID: çıkış = Kp x hata + Ki x (hata birikimi) + Kd x (hatanın değişim hızı)\nfloat pid(float e, float dt) {\n  integral += e * dt;\n  integral = constrain(integral, -ILIM, ILIM);\n  float turev = (e - sonHata) / dt;\n  sonHata = e;\n  turevSuz = ALFA * turevSuz + (1 - ALFA) * turev;\n  return KP * e + KI * integral + KD * turevSuz;\n}\n\nvoid setup() {\n  int pinler[] = {SOL_EN, SOL_IN1, SOL_IN2, SAG_EN, SAG_IN1, SAG_IN2};\n  for (int i = 0; i < 6; i++) pinMode(pinler[i], OUTPUT);\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  if (millis() - son < DT) return;\n  son += DT;\n\n  float e = hataOku();\n  float u = pid(e, DT / 1000.0);\n\n  surucu(SOL_EN, SOL_IN1, SOL_IN2, TABAN - u);\n  surucu(SAG_EN, SAG_IN1, SAG_IN2, TABAN + u);\n\n  if (millis() - sonYazdir >= 500) {       // ayar yaparken değerleri izle\n    sonYazdir = millis();\n    Serial.print(\"hata=\");\n    Serial.print(e, 1);\n    Serial.print(\" u=\");\n    Serial.println(u, 0);\n  }\n}\n```\n\n### Program 2: Karşılaştırma için bang-bang\n88. dersteki fikrin aynısı: hata kaç olursa olsun sabit `DONUS` kadar dön. `DONUS` değerini sen seçersin; PID'in \"hata ne kadarsa o kadar\" mantığıyla farkı burada.\n\n```cpp\n// sketch: proje_cizgi_bb\n// Karşılaştırma için bang-bang çizgi izleyici (88. ders): üç durum, sabit dönüş.\nconst int SOL_EN = 5, SOL_IN1 = 7, SOL_IN2 = 8;\nconst int SAG_EN = 6, SAG_IN1 = 9, SAG_IN2 = 10;\nconst int SENSOR[5] = {A0, A1, A2, A3, A4};   // A0 en sol ... A4 en sağ\nconst int ESIK = 500;\n\nconst int TABAN = 255;\nconst int DONUS = 200;             // sabit direksiyon: hata ne kadar küçük olursa olsun aynı\n\nint sonYon = 1;\n\nvoid surucu(int en, int in1, int in2, int v) {\n  v = constrain(v, -255, 255);\n  int pwm = abs(v);\n  if (pwm > 0) pwm = map(pwm, 1, 255, 51, 255);\n  digitalWrite(in1, v > 0);\n  digitalWrite(in2, v < 0);\n  analogWrite(en, pwm);\n}\n\nvoid setup() {\n  int pinler[] = {SOL_EN, SOL_IN1, SOL_IN2, SAG_EN, SAG_IN1, SAG_IN2};\n  for (int i = 0; i < 6; i++) pinMode(pinler[i], OUTPUT);\n}\n\nvoid loop() {\n  bool gor[5];\n  for (int i = 0; i < 5; i++) gor[i] = analogRead(SENSOR[i]) > ESIK;\n\n  int yon;                                   // +1: sola dön, -1: sağa dön, 0: düz\n  if (gor[0] || gor[1]) yon = 1;             // çizgi solda\n  else if (gor[3] || gor[4]) yon = -1;       // çizgi sağda\n  else if (gor[2]) yon = 0;                  // çizgi ortada\n  else yon = sonYon;                         // kayıp: son yöne dön\n  if (yon != 0) sonYon = yon;\n\n  surucu(SOL_EN, SOL_IN1, SOL_IN2, TABAN - yon * DONUS);\n  surucu(SAG_EN, SAG_IN1, SAG_IN2, TABAN + yon * DONUS);\n}\n```\n\n### Program 3: PID duvar takipçisi\nServo sensörü sola (180 derece) çevirir. Robot duvarı 15 cm'de tutmaya çalışır. 97. ve 98. derslerin sonuçlarına göre `Kp = 16`, `Ki = 1`, `Kd = 4`, `ALFA = 0,8` seçtik ve iki farklı gürültü tohumuyla denedik.\n\n```cpp\n// sketch: proje_duvar_pid\n#include <Servo.h>\n\nconst int SOL_EN = 5, SOL_IN1 = 7, SOL_IN2 = 8;\nconst int SAG_EN = 6, SAG_IN1 = 9, SAG_IN2 = 10;\nconst int TRIG = 11, ECHO = 12, SERVO_PIN = 4;\n\nconst float HEDEF = 15.0;          // duvarla istenen mesafe (cm)\nconst float KP = 16.0;             // PWM / cm\nconst float KI = 1.0;              // PWM / (cm x s)\nconst float KD = 4.0;              // PWM / (cm/s)\nconst float ALFA = 0.8;            // türev süzgeci\nconst float ILIM = 30.0;           // integral sınırı (cm x s)\nconst int TABAN = 170;\nconst int UMAX = 100;              // direksiyon sınırı\nconst unsigned long DT = 50;       // 20 ölçüm / saniye\n\nServo servo;\nunsigned long son = 0;\nunsigned long sonYazdir = 0;\nfloat mesafe = HEDEF;\nfloat integral = 0;\nfloat sonHata = 0;\nfloat turevSuz = 0;\n\nvoid surucu(int en, int in1, int in2, int v) {\n  v = constrain(v, -255, 255);\n  int pwm = abs(v);\n  if (pwm > 0) pwm = map(pwm, 1, 255, 51, 255);\n  digitalWrite(in1, v > 0);\n  digitalWrite(in2, v < 0);\n  analogWrite(en, pwm);\n}\n\nfloat olc() {\n  digitalWrite(TRIG, LOW);\n  delayMicroseconds(2);\n  digitalWrite(TRIG, HIGH);\n  delayMicroseconds(10);\n  digitalWrite(TRIG, LOW);\n  unsigned long us = pulseIn(ECHO, HIGH, 25000);\n  if (us == 0) return -1;\n  return us / 58.0;\n}\n\nfloat pid(float e, float dt) {\n  integral += e * dt;\n  integral = constrain(integral, -ILIM, ILIM);\n  float turev = (e - sonHata) / dt;\n  sonHata = e;\n  turevSuz = ALFA * turevSuz + (1 - ALFA) * turev;\n  return KP * e + KI * integral + KD * turevSuz;\n}\n\nvoid setup() {\n  int pinler[] = {SOL_EN, SOL_IN1, SOL_IN2, SAG_EN, SAG_IN1, SAG_IN2, TRIG};\n  for (int i = 0; i < 7; i++) pinMode(pinler[i], OUTPUT);\n  pinMode(ECHO, INPUT);\n  Serial.begin(9600);\n  servo.attach(SERVO_PIN);\n  servo.write(180);                // ışın sola, duvara dik\n  delay(500);\n  float ilk = olc();\n  if (ilk > 0) mesafe = ilk;\n  sonHata = mesafe - HEDEF;\n}\n\nvoid loop() {\n  if (millis() - son < DT) return;\n  son += DT;\n\n  float m = olc();\n  if (m > 0) mesafe = m;           // yankı yoksa eski değeri koru\n  float e = mesafe - HEDEF;        // + : duvardan çok uzak\n  float u = constrain(pid(e, DT / 1000.0), -UMAX, UMAX);\n\n  surucu(SOL_EN, SOL_IN1, SOL_IN2, TABAN - u);\n  surucu(SAG_EN, SAG_IN1, SAG_IN2, TABAN + u);\n\n  if (millis() - sonYazdir >= 500) {\n    sonYazdir = millis();\n    Serial.print(\"mesafe=\");\n    Serial.print(mesafe, 1);\n    Serial.print(\" u=\");\n    Serial.println(u, 0);\n  }\n}\n```\n\n### Nasıl çalışıyor?\n1. İkisi de aynı iskeleti izler: **ölç -> hata -> PID -> motorlara ver**. Fark yalnız hatanın kaynağında: çizgide dizi konumu (birim: sensör aralığı), duvarda ultrasonik mesafe (cm).\n2. Hata pozitifken (`çizgi solda` ya da `duvardan uzak`) sol tekerlek yavaşlar, sağ hızlanır: robot sola döner.\n3. `pid()` içinde `integral` sınırlanır (`ILIM`), türev süzülür (`ALFA`). Bunlar 97-98. derslerde öğrendiğin güvenlik önlemleri.\n4. Serial çıktısı her 500 ms'de hata ve `u` yazar. Ayar yaparken buna bak: `u` sürekli 255'e dayanıyorsa kazanç çok büyük.\n5. Mesafe ve yönelim için iki ayrı PID kullanmak (Hyvex'in staj programındaki F1 dersinde anılan yapı) gerekebilir. Bu duvar takipçisi yalnız mesafeyi ölçer, yönelimi (robotun duvara açısını) ölçmez; mesafe PID'i yönelimi dolaylı yoldan düzeltir.\n\n### Ayar sırası (99. ders)\n1. Bang-bang ile pisti bir kez dolaş; en iyi `DONUS`'u bul.\n2. `proje_cizgi_pid` için `TABAN`'ı küçükten başlat. `Ki = Kd = 0` yap, `Kp`'yi çizgiyi kaybetmeyene kadar artır.\n3. `Kd` ekle ve süz. Çizgi dizisinde dikkatli ol, aşağıdaki ölçüme bak.\n4. `Ki`'yı dene; çizgide fayda görmezsen 0'da bırak (bu dizide bıraktık).\n5. `TABAN`'ı artır, 1. adıma dön.\n\n### Ölçüm 1: PID mi bang-bang mı?\n`TABAN = 255` (tam hız) ile iki pistte koştuk. **Zor pist:** viraj yarıçapı 12 cm, alt düzlükte dik bir slalom (4,5 cm genlik, 30 cm dalga boyu). **Kolay pist:** viraj yarıçapı 17 cm, hafif slalom (3 cm genlik, 40 cm dalga boyu). Bang-bang için `DONUS` = 60, 100, 140 ve 200 denendi.\n\n**Zor pist**\n\n| Sürücü | Tur süresi | Hata RMS | En büyük sapma | Direksiyon titreşimi |\n|---|---|---|---|---|\n| PID (derste) | 8,62 sn | 10,9 mm | 23 mm | 0,91 |\n| Bang-bang, `DONUS = 200` | 9,04 sn | 27,5 mm | 79 mm | 0,46 |\n| Bang-bang, `DONUS` = 60 / 100 / 140 | çizgiyi kaybetti | - | - | - |\n\n**Kolay pist**\n\n| Sürücü | Tur süresi | Hata RMS | En büyük sapma | Direksiyon titreşimi |\n|---|---|---|---|---|\n| PID (derste) | 9,86 sn | 11,1 mm | 23 mm | 1,27 |\n| Bang-bang, `DONUS = 200` | 8,90 sn | 12,5 mm | 46 mm | 0,56 |\n| Bang-bang, `DONUS` = 60 / 100 / 140 | çizgiyi kaybetti | - | - | - |\n\nDürüst okuma:\n- **Zor pistte PID daha hızlı:** 8,62 sn, bang-bang'in en iyisinden %4,7 kısa. Çizgiye de çok daha yakın: RMS 10,9 mm'ye karşı 27,5 mm, en büyük sapma 23 mm'ye karşı 79 mm.\n- **Kolay pistte PID daha hızlı değil, belirgin biçimde yavaş.** Bang-bang'in çalışan ayarı 0,96 sn (%10,8) önde bitirdi. PID yine çizgiye daha yakındı (RMS 11,1 mm, maksimum 23 mm; bang-bang'de 12,5 ve 46 mm), ama bu yakınlık süreye yansımadı.\n- **Bang-bang ayara duyarlı:** 4 `DONUS` değerinden yalnız 200'ü, tam hızda her iki pisti bitirdi. Küçük `DONUS` virajı dönemiyor. PID'in denenen tek ayarı iki pisti de bitirdi.\n- **\"Daha akıcı\" iddiası bu ölçümde tutmuyor.** PID çizgiye yakın kalıyor (daha küçük sapma), ama direksiyon komutu PID'de belirgin biçimde daha çok oynuyor (zor pistte 0,91'e karşı 0,46, kolay pistte 1,27'ye karşı 0,56). Akıcılığı hangi ölçüyle tanımladığın sonucu değiştirir.\n- Çizgi dizisi sensörleri 2,4 cm arayla, çizgi 2 cm genişliğinde: çizgi iki sensörün arasından geçerken kısa süre hiçbirine görünmez ve hata sıçrar. PID bu sıçramalardan etkilenir; bang-bang sabit dönüşle bunları yutar.\n- İkisi de tam hızda (`TABAN = 255`) koştuğu için tur süresi büyük ölçüde motorun azami hızıyla sınırlı. Piste ve `TABAN`'a göre sonuç değişir.\n\nMotorlardan biri zayıfsa (sağ motor %8 zayıf) PID zor pisti yine bitirdi: 9,22 sn, RMS 11,3 mm, en büyük sapma 24 mm.\n\n**Çizgide I ve D'ye dikkat.** Dizi hatayı 0,5'lik basamaklarla verir ve çizgi sensörler arasında kaybolabilir; bu sıçramalar türevde sahte patlamalar, integralde sahte birikim yaratır. Zor pistte (derste 8,62 sn):\n- `Ki = 1` açınca tur 9,40 sn'ye uzadı, direksiyon titreşimi 0,91'den 1,21'e çıktı.\n- `Kd = 30` ve süzgeçsiz (`ALFA = 0`) yapınca tur 10,08 sn'ye, titreşim 1,15'e çıktı.\n\nBu yüzden derste `Ki = 0` ve `Kd = 0,5` (`ALFA = 0,9`) var. Çizgi dizisinde asıl iş P'de; I ve D duvar takibinde ve hız döngüsünde işe yaradı (97-99).\n\n### Ölçüm 2: Duvar takibi\nHafif kıvrımlı uzun bir duvar (3 cm genlikli, 1,2 m dalga boylu bir dalga), ultrasonik ölçümde 1 cm gürültü, sağ motor %10 zayıf. Robot duvara paralel başlar; duvarın o noktadaki bükümü yüzünden başlangıç mesafesi yaklaşık 18 cm'dir (hedefin 3 cm ötesi). 11 saniye koşar (yaklaşık 2,5 m).\n\n| Ölçü | Sonuç |\n|---|---|\n| Duvara çarptı mı? | hayır (iki farklı gürültü tohumuyla) |\n| İlk 4 sn'den sonra +-2 cm içinde kalma | %100 |\n| İlk 4 sn'den sonra en büyük sapma | 0,78 cm (bir koşu), 1,48 cm (diğer koşu) |\n| İlk 4 sn'den sonra hata RMS | 0,35 cm (PID), 0,54 cm (yalnız P, `Ki = Kd = 0`) |\n| İlk 4 sn içinde en büyük sapma | 2,6 cm |\n\nBaşlangıç mesafesi hedefin dışında olduğu ve duvar robota doğru bükülmeye başladığı için ilk saniyelerde sapma 2,6 cm'ye kadar çıkıyor (hedef bandı +-2 cm). 4. saniyeden sonra robot bandın içinde kalıyor. Yalnız P de bu koşuda bandı tuttu, çünkü Kp = 16 büyük ve motor farkı küçük (%10). PID RMS'i yaklaşık üçte bir oranında küçülttü. 98. dersteki gibi Kp küçükse ya da motor farkı büyükse (%15) yalnız P bandı tutamaz; I o zaman fark yaratır.\n\n### Gerçek robotta farklı olabilecekler\n- Benzetimde kontrol zamanlaması mükemmel, çizgi sensörlerinde gürültü yok. Gerçek robotta ışık, yüzey ve pil gerilimi sonucu değiştirir; her ayarı kendi robotunda yeniden ölç.\n- Gerçek HC-SR04 duvara eğik bakınca yanlış yankı alabilir. Duvar takibinde ölçümü süzmek ya da medyan almak (Modül 4) isteyebilirsin.\n- Pil boşaldıkça motor yavaşlar. Hız ayarını pil doluyken yaptıysan, boşalınca kazançları yeniden gözden geçir.\n\n### Dene\n- `proje_cizgi_pid`'de `KD = 30` ve `ALFA = 0` yap (ölçümde tur 10,08 sn oldu). Tur süresi neden uzuyor? `Serial` çıktısındaki `u` değerlerine bak.\n- Bang-bang'de `TABAN = 200` yap ve `DONUS` değerlerini yeniden dene. Hangi `DONUS` çalışıyor? Tur süresi PID ile kıyaslandığında ne oluyor?\n- Duvar takipçisinde `HEDEF = 20` yap. Ayarları değiştirmeden +-2 cm tutuyor mu?\n- Meydan okuma: iki sketch'i tek programda birleştir. Seri porttan `c` gelirse çizgi, `d` gelirse duvar modu çalışsın (79. ders, durum makinesi için 28. ders).\n\n### Sık yapılan hatalar\n- Çizgi ve duvar için aynı Kp'yi kullanmak: hata birimleri farklı (sensör aralığı ve cm). Kazançları ayrı ayrı ölç.\n- Bang-bang ile PID'i farklı pist ve farklı hızda karşılaştırmak: adil olmaz. Aynı pist, aynı `TABAN`, aynı ölçüm yöntemi kullan.\n- Ayar sırasını atlamak: önce hızı yükseltip sonra Kp aramak. Küçük hızda başla.\n- Tek bir koşuya bakıp karar vermek: en az iki koşuda (farklı gürültü tohumu ya da başlangıç noktası) ölç.\n- Kd'yi sezgiyle büyütmek: çizgi dizisinde türev gürültü gibi davranır.",
          "question": "Kolay pistte bang-bang PID'den belirgin biçimde önde bitirdi. Peki bang-bang yeter diyebilir misin? Hangi durumlarda basit çözüm daha iyidir (örneğin ayar sayısı, tavan hız, pist zorluğu)? Bu projeyi bir yarışa sokacak olsan hangisini seçerdin ve neden?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Öğrendiğin PID'i bang-bang ile adil ve ölçülü biçimde karşılaştırmayı\n- Çizgi izlemede P'nin, duvar takibinde ise D ve I'nın neden öne çıktığını\n- Tek koşuya değil birkaç koşuya bakarak karar vermeyi\n- Aynı PID iskeletini farklı bir hata kaynağına uygulamayı\n\n### Önceden bilmen gerekenler\n- P, D, I ve anti-windup (96, 97 ve 98. dersler)\n- Ölçerek ayar ve ayar sırası (99. ders)\n- Bang-bang çizgi izleme (88. ders) ve HC-SR04 ile servo (Hafta 2)\n\n### Aynı iskelet, farklı hata\nProjede iki robot görevi var: çizgi izleme ve duvar takibi. İkisi de aynı iskeleti izler: **ölç, hata bul, PID uygula, motorlara ver**. Fark yalnız hatanın kaynağındadır: çizgide dizi konumu (birim: sensör aralığı), duvarda ultrasonik mesafe (cm). Birimler farklı olduğu için Kp, Ki ve Kd'yi iki görev için ayrı ayrı ölçmen gerekir.\n\n```\nu = Kp x e + Ki x integral + Kd x turev\nsol tekerlek = TABAN - u\nsağ tekerlek = TABAN + u\n```\n\n### PID bang-bang'den iyi mi?\nİddiayı sayıyla sınadık. Tam hızda, iki pistte, en iyi bang-bang ayarıyla PID karşılaştırıldı.\n\n| Pist | PID tur | Bang-bang tur | Çizgiden sapma (RMS) |\n|---|---|---|---|\n| Zor (dar viraj, dik slalom) | 8,62 sn | 9,04 sn | PID 10,9 mm, bang-bang 27,5 mm |\n| Kolay | 9,86 sn | 8,90 sn | PID 11,1 mm, bang-bang 12,5 mm |\n\nSonuç net bir \"PID daha iyi\" değil. Zor pistte PID hem daha hızlı hem çizgiye daha yakındı. Kolay pistte ise bang-bang yaklaşık %10 daha hızlı bitirdi. Bang-bang ayara duyarlıdır: denenen dönüş değerlerinden yalnız biri pisti bitirdi.\n\n### Çizgi dizisinde I ve D\nDizi hatayı 0,5'lik basamaklarla verir ve çizgi iki sensör arasından geçerken kısa süre görünmez olabilir. Bu sıçramalar türevde sahte patlamalar, integralde sahte birikim yaratır. Ki = 1 açılınca zor pistte tur 8,62 sn'den 9,40 sn'ye uzadı. Bu yüzden çizgide `Ki = 0` ve çok küçük, süzgeçli Kd kullandık: asıl iş P'de.\n\n### Duvar takibinde I ve D\nDuvarda ölçüm sürekli ve motorlar eşit değil. Kp = 16, Ki = 1, Kd = 4 ile robot 4. saniyeden sonra hedefin ±2 cm içinde kaldı ve duvara çarpmadı. Yalnız P de bandı tuttu ama PID, hata RMS'ini yaklaşık üçte bir oranında küçülttü. Motor farkı büyükse (%15) yalnız P tutamaz ve I fark yaratır.\n\n### Dürüst karşılaştırma\nAdil olması için pist, TABAN ve ölçüm yöntemi aynı olmalı ve en az iki koşu yapılmalı. Hangisinin \"daha iyi\" olduğu neye baktığına bağlıdır: tur süresi, çizgiye yakınlık ya da direksiyonun sakinliği.\n\n### Özet\nÇizgi ve duvar aynı PID iskeletine oturur, yalnız hata ve kazançlar farklıdır. Çizgi dizisinde P yeterlidir, I ve D sahte sıçramalara duyarlıdır. Duvar takibinde D aşımı, I kalıcı sapmayı giderir. PID her zaman bang-bang'den hızlı değildir; karar, aynı koşullarda tekrarlanan ölçümle verilir.",
          "concepts": [
            {
              "term": "Ölç-hata-PID-sür iskeleti",
              "definition": "Hem çizgi hem duvar görevinde aynı sıra: ölçümü oku, hatayı hesapla, PID çıkışını bul, motorlara ver.",
              "example": "Çizgide hata dizi konumudur, duvarda mesafe - HEDEF'tir; geri kalan kod aynıdır.",
              "pitfall": "Çizgi ve duvar için aynı Kp'yi kullanmak; hata birimleri farklıdır."
            },
            {
              "term": "Adil karşılaştırma",
              "definition": "İki yöntemi aynı pist, aynı TABAN ve aynı ölçüm yöntemiyle, birden çok koşuda kıyaslamak.",
              "example": "PID ve bang-bang'i zor ve kolay pistte tam hızda koşturmak.",
              "pitfall": "Tek bir koşuya bakıp karar vermek; gürültü ve başlangıç noktası sonucu değiştirebilir."
            },
            {
              "term": "Bang-bang ayar duyarlılığı",
              "definition": "Bang-bang'in sabit dönüş değerine bağımlılığı; küçük değerde virajı dönemez.",
              "example": "Dört dönüş değerinden yalnız 200 pisti bitirdi.",
              "pitfall": "Bang-bang'i ayar gerektirmez sanmak; dönüş değeri de ayarlanmalıdır."
            },
            {
              "term": "Direksiyon titreşimi",
              "definition": "Sol ve sağ tekerlek hız farkının her ölçüm adımında ortalama değişimi; büyükse direksiyon sürekli oynuyordur.",
              "example": "Zor pistte PID 0,91, bang-bang 0,46 titreşim verdi.",
              "pitfall": "Çizgiye yakın kalmayı otomatik olarak akıcı sürüş saymak; PID çizgiye yakındı ama direksiyonu daha çok oynattı."
            },
            {
              "term": "Çizgi dizisinde I ve D",
              "definition": "Dizi 0,5'lik basamaklarla ölçtüğü ve çizgi sensörler arasında kaybolabildiği için I ve D'ye sahte sıçrama taşır; burada Ki = 0 ve Kd küçüktür.",
              "example": "Ki = 1 açılınca zor pistte tur 8,62 sn'den 9,40 sn'ye uzadı.",
              "pitfall": "Kd'yi sezgiyle büyütmek; çizgi dizisinde türev gürültü gibi davranır."
            },
            {
              "term": "Hedef bandı",
              "definition": "Duvar takibinde kabul edilen sapma aralığı; burada hedefin ±2 cm'si.",
              "example": "Robot 4. saniyeden sonra zamanın %100'ünde bandın içinde kaldı.",
              "pitfall": "Başlangıç mesafesi bandın dışındayken ilk saniyelerdeki sapmayı kontrolcünün başarısızlığı saymak."
            }
          ],
          "quiz": [
            {
              "id": "m5h5d100-q1",
              "kind": "numeric",
              "prompt": "PID duvar takipçisinde KP = 16, KI = 1, KD = 4, TABAN = 170, UMAX = 100'dür. Bir turda e = 3 cm, integral = 2 ve turevSuz = 5 cm/s ise sol tekerleğe verilen değer (TABAN - u) kaçtır?",
              "answer": 100,
              "tolerance": 0,
              "explanation": "u = 16 x 3 + 1 x 2 + 4 x 5 = 48 + 2 + 20 = 70. UMAX = 100 sınırının içinde kaldığı için u olduğu gibi kullanılır ve sol tekerlek 170 - 70 = 100 olur.",
              "skills": [
                "ctl-pid-project"
              ]
            },
            {
              "id": "m5h5d100-q2",
              "kind": "numeric",
              "prompt": "Bir pistte PID turu 9,0 sn, bang-bang turu 10,0 sn sürdü. PID turu, bang-bang süresine göre yüzde kaç daha kısa sürdü?",
              "answer": 10,
              "tolerance": 0.1,
              "unit": "%",
              "explanation": "Fark 10,0 - 9,0 = 1,0 sn ve bang-bang süresine oranı 1,0 / 10,0 = %10'dur. Farkı PID süresine (9,0) bölseydin %11,1 bulurdun; karşılaştırma hangi yönteme göre yapıldığını söylemelidir.",
              "skills": [
                "ctl-pid-project"
              ]
            },
            {
              "id": "m5h5d100-q3",
              "kind": "predict-output",
              "prompt": "Bang-bang çizgi izleyicide yon = +1 sola, -1 sağa dönmektir. Bu kod çalışınca ne yazar?\n\n```\nvoid setup() {\n  Serial.begin(9600);\n  bool gor[5] = {false, false, false, true, true};\n  int yon;\n  if (gor[0] || gor[1]) yon = 1;\n  else if (gor[3] || gor[4]) yon = -1;\n  else yon = 0;\n  int sol = constrain(255 - yon * 200, -255, 255);\n  int sag = constrain(255 + yon * 200, -255, 255);\n  Serial.print(\"sol=\");\n  Serial.print(sol);\n  Serial.print(\" sag=\");\n  Serial.println(sag);\n}\nvoid loop() {}\n```",
              "options": [
                "sol=255 sag=55",
                "sol=55 sag=255",
                "sol=455 sag=55",
                "sol=255 sag=455"
              ],
              "answer": 0,
              "explanation": "A3 ve A4 çizgiyi gördüğü için çizgi sağdadır ve yon = -1 olur. Sol = 255 + 200 = 455 olur ve constrain bunu 255'e kıstırır; sağ = 255 - 200 = 55 olur. Sağ tekerlek yavaşladığı için robot sağa döner.",
              "skills": [
                "ctl-pid-project",
                "prog-debug"
              ]
            },
            {
              "id": "m5h5d100-q4",
              "kind": "mcq",
              "prompt": "Çizgi izleyicide Ki = 1 açıldığında zor pistte tur uzadı ve direksiyon titreşimi arttı. Asıl neden hangisidir?",
              "options": [
                "Ki her zaman turu uzatır",
                "Dizinin 0,5'lik basamaklı ölçümü ve çizgi kayıplarındaki sıçramalar integralde sahte birikim yaratır",
                "Ki yalnız duvar takibinde çalışır",
                "Integralin hiç sınırlanmaması derleme hatası verir"
              ],
              "answer": 1,
              "explanation": "Çizgi iki sensör arasından geçerken hata sıçrar ve integral bu sahte hatayı biriktirir. Ki duvar takibinde işe yaradı, yani her zaman zararlı değildir; ILIM sınırı da derleme hatası vermez.",
              "skills": [
                "ctl-pid-project",
                "ctl-integral"
              ]
            },
            {
              "id": "m5h5d100-q5",
              "kind": "find-bug",
              "prompt": "Duvar takipçisi (duvar solda; u > 0 sola dön) duvardan uzaklaştıkça daha da uzaklaşıyor. Tek hata nerede?\n\n```\nfloat e = HEDEF - mesafe;\nfloat u = constrain(pid(e, DT / 1000.0), -UMAX, UMAX);\nsurucu(SOL_EN, SOL_IN1, SOL_IN2, TABAN - u);\nsurucu(SAG_EN, SAG_IN1, SAG_IN2, TABAN + u);\n```",
              "options": [
                "UMAX sınırı kaldırılmalı",
                "Sol tekerlek TABAN + u almalı",
                "e = HEDEF - mesafe işareti ters; duvardan uzaklaşınca e negatif olur ve robot sağa döner",
                "Servo 180 yerine 0 dereceye bakmalı"
              ],
              "answer": 2,
              "explanation": "Kuralımız e = mesafe - HEDEF idi: duvardan uzak (e > 0) iken robot sola, yani duvara dönmeli. İşaret ters olunca e negatif olur ve robot sağa, duvardan uzağa döner. Tekerlek formülü ve UMAX doğrudur.",
              "skills": [
                "ctl-pid-project",
                "prog-debug"
              ]
            }
          ]
        }
      ]
    },
    {
      "title": "IMU ve denge",
      "project": "Dengelenen robot",
      "guideMd": "### Hafta hedefleri\nBu haftanın sonunda öğrenci:\n1. İvmeölçerden `atan2(ax, az)` ile eğim açısını, jiroskoptan dönme hızını hesaplayabilir; jiroskop ölçeğini ve sapmasını açıklayabilir.\n2. Tamamlayıcı filtrenin formülünü yazabilir, `α` ve `dt` ile zaman sabitini (`τ = α · dt / (1 − α)`) hesaplayabilir.\n3. `delay()` döngüsü ile `micros()` ile planlanan sabit periyotlu döngü arasındaki farkı ölçüme dayanarak açıklayabilir.\n4. Kaskad kontrolde dış döngünün (konum ve hız) iç döngüye (açı) hedef açı verdiğini, dış döngünün neden yavaş olması gerektiğini anlatabilir.\n5. Dört parçayı birleştirip düşme algılayan, kendi raporunu veren bir denge programı kurabilir; benzetim kazançlarının gerçek robota taşınamayacağını bilir.\n\n### Haftanın planı\nHafta beş derstir. Aşağıdaki plan günde bir ders içindir; proje dersi için fazladan zaman ayır. Bu hafta robot bir benzetimdir (ters sarkaç modeli).\n\n| Gün | Ders | Süre | Ne yapılır |\n|---|---|---|---|\n| 1 | IMU ile eğim ölçümü | ~20 dk | Anlatımı oku, eğim ve hız programını çalıştır, jiroskop sapmasını ölç, mini testi çöz. |\n| 2 | Tamamlayıcı filtre ve Kalman'a giriş | ~25 dk | Üç açıyı (ivme, jiro, filtre) yan yana izle, `ALFA` değerini değiştir, hatayı karşılaştır. |\n| 3 | Sabit periyotlu kontrol döngüsü | ~25 dk | `delay()` döngüsünün gerçek süresini ölç, sabit periyotlu sürümü çalıştır, periyotları dene. |\n| 4 | Kaskad PID: açı ve hız | ~30 dk | Süzülmeyi gör, kaskadı ekle, dış döngü hızını (`DIS_ORAN`) değiştir. |\n| 5 | Proje: Kendini dengeleyen robot | ~35 dk | Projeyi çalıştır, itme ver, raporu oku, kontrolsüz deneyi yap, ölçütle değerlendir. |\n\n### Ön koşul kontrolü\nBaşlamadan önce şunları kontrol et:\n- Modül 4'ten MPU6050'yi ham `Wire` ile okuyabiliyor mu? (58. ders) Tamamlayıcı filtreyi ilk kez gördü mü? (59. ders)\n- Hafta 5'ten P ve D terimlerinin ne işe yaradığını söyleyebiliyor mu? (96-97. dersler)\n- Modül 3'ten `millis()` ile bloklamayan zamanlamayı ve `enum` ile durum makinesini hatırlıyor mu? (27 ve 28. dersler)\n- Hafta 1'den motor yönü, PWM ve ölü bölge fikrini biliyor mu? (77-78. dersler)\n- Derece, radyan ve temel trigonometri (sinüs, kosinüs) fikrine aşina mı? Gerekirse 101. dersteki tabloya bakmak yeter.\n\n### Kavram haritası\n- **Ölçüm:** ivmeölçer (yerçekimi, `atan2`) → jiroskop (hız, ölçek, sapma)\n- **Birleştirme:** tamamlayıcı filtre → `α`, `dt`, zaman sabiti `τ` → Kalman'a giriş\n- **Zamanlama:** `dt` → `delay()` tuzağı → planlanan zaman (`+=`) → taşma, `micros()` sarması\n- **Kontrol:** açı PD → süzülme → kaskad (dış döngü hedef açı, iç döngü motor komutu) → hedef açı sınırı\n- **Proje:** durum makinesi (DENGE, KONTROLSUZ, DUSTU) → en büyük eğim, oturma süresi → benzetimden gerçek robota\n\n### Sık yapılan hatalar\n- **Radyan bırakmak.** `atan2` radyan verir; derece kazançları için 57,2958 ile çarp.\n- **`axHam / 16384` yazmak.** Tam sayı bölmesi sıfır verir; `16384.0` yaz.\n- **Jiroskop ölçeğini aralıkla eşlememek.** ±500 °/s için 65,5, ±250 °/s için 131.\n- **Sapmayı ölçerken robotu tutmak.** Sapma yanlış çıkar ve her ölçüme bulaşır.\n- **Filtrede `hiz * dt` terimini unutmak ya da filtreyi 0'dan başlatmak.**\n- **`delay(5)` ile 5 ms periyot sanmak.** Tur süresi 5 ms artı işin süresidir.\n- **`sonPlanUs = simdi` yazmak.** Gecikmeler birikir; `+=` kullan.\n- **Dış döngüyü iç döngüyle aynı hızda çalıştırmak.** İki döngü birbirini kovalar.\n- **Hedef açıyı hesaplayıp iç döngüde kullanmamak ya da `KX`, `KV` işaretlerini ters koymak.**\n- **Düşme eşiğini tek yönde kontrol etmek.** `fabs(aci)` kullan.\n- **Benzetim kazançlarını gerçek robota kopyalamak.** Kazançlar robota özeldir, küçükten başlayarak yeniden ayarlanır.\n\n### Hafta sonu tekrarı\n1. Her dersin kavram kartlarına bir kez daha bak ve \"sık yapılan yanlış\" satırlarını yüksek sesle oku.\n2. Yanlış yaptığın mini test sorularının açıklamalarını oku, sonra soruyu yeniden çöz.\n3. Tamamlayıcı filtrenin formülünü bakmadan yaz. `α = 0,98` ve `dt = 0,01 s` için `τ` değerini hesapla (0,49 s).\n4. `delay()` döngüsü ile sabit periyotlu döngünün farkını kendi cümlelerinle anlat: \"Neden `+=` ?\"\n5. Kaskad kontrolü bir paragrafta anlat: dış döngü neyi ölçer, neyi üretir, iç döngü onu nasıl kullanır, neden dış döngü yavaştır?\n6. Projeyi bir daha çalıştır; bu kez itmeyi ters yönde ver ve raporu karşılaştır.\n\nHafta sonu testi olarak beş dersin mini testleri yeterlidir; her derste 5 soru, toplam 25 soru. Hedef: her dersten en az 4 doğru. Eksik kalan dersin anlatımına dön.\n\n### Proje değerlendirme ölçütü (Kendini dengeleyen robot)\n| Ölçüt | Gelişmeli | Yeterli | İleri |\n|---|---|---|---|\n| Denge | Robot 10 saniye ayakta kalmıyor | 10 saniye ayakta kalıyor ve 3. saniyedeki itmeden toparlanıyor | Ters yönde ve farklı büyüklükte itmelerde de toparlanıyor, sınırı biliyor |\n| Zamanlama | `delay()` ile döngü kurulmuş, `dt` sabit yazılmış | Planlanan zamana göre sabit periyot, `dt` ölçülüyor | Taşma sayacı var, periyodu değiştirip etkisini ölçmüş |\n| Kontrol | Yalnız açı PD'si, robot süzülüyor | Kaskad çalışıyor, hedef açı sınırlı | Dış döngü hızını ve kazancı değiştirip sonucu açıklıyor |\n| Güvenlik ve rapor | Düşünce motorlar kesilmiyor ya da rapor yok | Düşme her iki yönde algılanıyor; en büyük eğim ve oturma süresi raporlanıyor | Kontrolsüz deneyle karşılaştırma yapmış, jiroskop sapmasını açılışta ölçüyor |\n| Anlatım | Ne yaptığını anlatamıyor | Dört parçayı ve sırasını anlatıyor | Benzetimden gerçek robota geçişte neyin değişeceğini açıklıyor |\n\n### Veli ve öğretmen notu\n- **Amaç.** Bu hafta çocuğun ölçmeyi, filtrelemeyi ve geri besleme ile kontrolü birleştirmesi hedeflenir. Robot benzetimdir; devrilen robot hata değil bir ölçümdür ve ↺ ile sıfırlanır.\n- **Nasıl destek olunur?** Cevabı söylemek yerine şunları sor: \"Robot hangi yöne yatıyor, motor hangi yöne gidiyor?\", \"Bu sayıyı hangi sensör üretiyor?\", \"Bu döngü gerçekten kaç milisaniyede dönüyor, nereden biliyorsun?\"\n- **Zor noktalar.** Trigonometri (`atan2`) ve zaman sabiti ilk bakışta soyut gelebilir; 101. dersteki ax/az tablosu ve 102. dersteki sayısal örnekler yardımcı olur. Kaskad kontrol bu kursun en soyut kavramlarından biridir; acele edilmemeli.\n- **Benzetim ve gerçek.** Derslerdeki kazanç sayıları benzetimdeki robota aittir. İleride gerçek bir robot kurulursa aynı değerler çalışmaz; yapı aynı, sayılar yeniden ayarlanır. Gerçek robotta motor ve pil güvenliği için yetişkin gözetimi gerekir; şebeke gerilimiyle (220 V) hiçbir devre kurulmaz.\n- **Süre.** Proje dersi uzundur; iki oturuma bölmek serbesttir.\n- **İlerleme.** Mini test sonuçları \"İlerlemem\" sayfasında beceri bazında görünür (taslak/pilot özellik; yalnız onay verildiyse kaydedilir).",
      "lessons": [
        {
          "title": "IMU ile eğim ölçümü",
          "durationMin": 20,
          "problem": "Telefonunu yan çevirince ekran döner. Bir drone rüzgârda yatınca kendini toparlar. İki tekerlekli bir robot ise tam ayakta dururken bile sürekli devrilmek ister: üstü ağırdır ve tekerleklerin üzerinde durur. Bunların hepsinde küçük bir çip \"ben şu an kaç derece yatıyorum?\" sorusuna cevap verir. Bu hafta o çipi kullanıp kendini dengeleyen bir robot yapacaksın. Önce tek bir şeyi öğrenmelisin: eğimi nasıl ölçeceğini.",
          "contentMd": "### Bu hafta\n- **101:** MPU6050 ile eğimi ölç (bu ders).\n- **102:** İvmeölçer ve jiroskobu birleştir (tamamlayıcı filtre).\n- **103:** Kontrol döngüsünü sabit periyotla çalıştır.\n- **104:** Kaskad PID: iç döngü açıyı, dış döngü konumu tutar.\n- **105:** Proje: kendini dengeleyen robot.\n\n**Önemli:** Bu hafta robot bir **benzetimdir** (ters sarkaç modeli). Derslerdeki kazanç sayıları (`0,15`, `0,02` gibi) benzetimdeki robota aittir. Gerçek bir robotta motor, tekerlek, ağırlık ve pil farklıdır; aynı kodu çalıştırırsan robot büyük olasılıkla ya ayakta durmaz ya da titrer. Gerçek robotta kazançları baştan, küçük değerlerden başlayarak yeniden ayarlarsın. Kodun yapısı (ölçme, filtre, sabit döngü, PID) ise aynen geçerlidir.\n\n### Devre\nModül 5'in standart bağlantıları geçerli. Bu derste yalnız IMU kullanılıyor; motorlar 104'te devreye girecek.\n\n| Parça | Bağlantı |\n|---|---|\n| MPU6050 modülü (GY-521 gibi) | SDA → **A4**, SCL → **A5**, GND → GND, VCC → modülün belgesinde yazan gerilim (çoğu modülde 5 V, üzerinde regülatör vardır), AD0 → GND (adres 0x68) |\n| Motorlar (sonraki derslerde) | Sol EN **D5**, IN1 **D7**, IN2 **D8**; sağ EN **D6**, IN3 **D9**, IN4 **D10**. Motorlara harici güç ver ve GND'leri birleştir |\n\nSensörü robota, **X ekseni ileri**, **Z ekseni yukarı** bakacak ve **Y ekseni tekerlek eksenine paralel** olacak biçimde tespit et. Robot ileri eğilince açı pozitif olsun diye benzetimde de böyle varsayıyoruz. Gerçek sensörünü başka yöne monte edersen işaretleri çevirmen gerekir.\n\n### Eğim iki yoldan ölçülür\n1. **İvmeölçer yerçekimini ölçer.** Robot hareketsizken sensör yalnız yerçekimini görür. Robot θ kadar ileri eğilirse X ekseni yerçekiminin sin θ kadarını, Z ekseni cos θ kadarını (g cinsinden) görür. O hâlde `θ = atan2(ax, az)`.\n2. **Jiroskop dönme hızını ölçer** (derece/saniye). Hız açı değildir; açıyı bulmak için hızı zamanla toplamak gerekir. Bunu 102'de yapacağız.\n\nDers 58-59'daki ham `Wire` okumasını hatırla: önce `0x6B` yazmacına 0 yazıp sensörü uyandırırsın, sonra `0x3B` yazmacından başlayarak 14 bayt okursun: ax, ay, az, sıcaklık, gx, gy, gz. Her değer 16 bit işaretlidir ve **yüksek bayt önce** gelir. Varsayılan ölçekte ivme 16384 sayı/g, jiroskop 131 sayı/(°/s) verir.\n\nBir dikkat noktası: robot düşerken hızlı döner. Varsayılan jiroskop aralığı ±250 °/s'dir; daha hızlı dönüşte değer sınırda takılır (doyar) ve ölçüm yanlış olur. Benzetimdeki robot düşerken en çok yaklaşık 200 °/s'ye çıkıyor, yani sınıra çok yakın; bir itme ya da gerçek bir robotun daha hızlı devrilmesi sınırı aşar. Bu yüzden `0x1B` yazmacına `0x08` yazıp aralığı ±500 °/s yapıyoruz. Bu aralıkta ölçek 65,5 sayı/(°/s) olur; çözünürlükten az bir şey kaybederiz ama taşma payı kazanırız.\n\n### Program: eğimi ve dönme hızını yazdır\n```cpp\n// sketch: imu_olcum\n#include <Wire.h>\n\nconst int MPU_ADRES = 0x68;\nconst float RAD_DERECE = 57.2958;     // 180 / pi\nconst float JIRO_OLCEK = 65.5;        // ±500 °/s aralığında sayı / (°/s)\nconst float IVME_OLCEK = 16384.0;     // ±2 g aralığında sayı / g\n\nint16_t oku16() {                     // iki bayttan işaretli sayı, yüksek bayt önce\n  uint8_t yuksek = Wire.read();\n  uint8_t alcak = Wire.read();\n  return (int16_t)(((uint16_t)yuksek << 8) | alcak);\n}\n\nvoid setup() {\n  Serial.begin(115200);\n  Wire.begin();\n  Wire.beginTransmission(MPU_ADRES);  // sensörü uyandır\n  Wire.write(0x6B);\n  Wire.write(0);\n  Wire.endTransmission(true);\n  Wire.beginTransmission(MPU_ADRES);  // jiroskop aralığı ±500 °/s\n  Wire.write(0x1B);\n  Wire.write(0x08);\n  Wire.endTransmission(true);\n}\n\nvoid loop() {\n  Wire.beginTransmission(MPU_ADRES);\n  Wire.write(0x3B);                   // ilk veri yazmacı: ax\n  Wire.endTransmission(false);\n  Wire.requestFrom(MPU_ADRES, 14, true);\n\n  int16_t axHam = oku16();\n  oku16();                            // ay: kullanmıyoruz\n  int16_t azHam = oku16();\n  oku16();                            // sıcaklık\n  oku16();                            // gx\n  int16_t gyHam = oku16();\n  oku16();                            // gz\n\n  float ax = axHam / IVME_OLCEK;\n  float az = azHam / IVME_OLCEK;\n  float aci = atan2(ax, az) * RAD_DERECE;   // ivmeölçerden eğim (derece)\n  float hiz = gyHam / JIRO_OLCEK;           // jiroskoptan dönme hızı (°/s)\n\n  Serial.print(millis());\n  Serial.print(',');\n  Serial.print(aci, 1);\n  Serial.print(',');\n  Serial.println(hiz, 1);\n  delay(50);\n}\n```\n\n### Nasıl çalışıyor?\n1. `oku16()` iki baytı tek bir işaretli sayıya çevirir. Bayt sırasını ayrı satırlarda okuyoruz; iki `Wire.read()` çağrısını aynı ifadede yazarsan hangisinin önce çalışacağı C++'ta garanti değildir.\n2. `atan2(ax, az)` radyan verir. `57,2958` ile çarparak dereceye çeviriyoruz.\n3. `ax` ve `az` g cinsindendir: ham sayıyı `16384.0` ile bölüyoruz. Noktalı yazmak önemli, aksi hâlde tam sayı bölmesi olur.\n4. `hiz` pozitifse robot ileri doğru dönüyordur, yani açı artıyordur.\n\n### Ölçümde gördüklerimiz\nSensörü benzetimde 20° yatık sabit tuttuk: program `aci` olarak 20,0 civarı, `hiz` olarak 0 civarı yazdı. Sonra robotu motorsuz, 3° eğik bıraktık: robot kendiliğinden devrilir ve açı yaklaşık 0,7 saniyede 45°'yi geçer. Bu sırada ivmeölçerden okunan açı, gerçek açıyı 4°'den az farkla izledi ve dönme hızı pozitif tarafta yaklaşık 200 °/s'ye kadar çıktı. Yani devrilmek saniyenin altında bir iştir; kontrolün bundan çok daha hızlı çalışması gerekir (103).\n\n### Program: robot dururken jiroskop sıfırı göstermeli\nHareketsiz bir jiroskop teorik olarak 0 °/s okur. Gerçekte küçük bir sabit değer okur: buna **sapma** (bias) denir. Sapma küçük görünse de hızı toplayınca (açıya çevirince) sürekli büyür; bunu 102'de göreceksin. Çözüm: açılışta robot hareketsizken çok sayıda ölçüm alıp ortalamasını sapma olarak kaydetmek ve sonraki okumalardan çıkarmak.\n\n```cpp\n// sketch: gyro_sifir\n#include <Wire.h>\n\nconst int MPU_ADRES = 0x68;\nconst float JIRO_OLCEK = 65.5;        // ±500 °/s\nconst int ORNEK_SAYISI = 500;\n\nfloat jiroSapma = 0;                  // °/s\n\nint16_t oku16() {\n  uint8_t yuksek = Wire.read();\n  uint8_t alcak = Wire.read();\n  return (int16_t)(((uint16_t)yuksek << 8) | alcak);\n}\n\nfloat jiroOku() {                     // gy, °/s\n  Wire.beginTransmission(MPU_ADRES);\n  Wire.write(0x43);                   // gx yazmacı\n  Wire.endTransmission(false);\n  Wire.requestFrom(MPU_ADRES, 6, true);\n  oku16();                            // gx\n  int16_t gyHam = oku16();\n  oku16();                            // gz\n  return gyHam / JIRO_OLCEK;\n}\n\nvoid setup() {\n  Serial.begin(115200);\n  Wire.begin();\n  Wire.beginTransmission(MPU_ADRES);\n  Wire.write(0x6B);\n  Wire.write(0);\n  Wire.endTransmission(true);\n  Wire.beginTransmission(MPU_ADRES);\n  Wire.write(0x1B);\n  Wire.write(0x08);\n  Wire.endTransmission(true);\n\n  float toplam = 0;\n  for (int i = 0; i < ORNEK_SAYISI; i++) {   // robot HAREKETSIZ olmalı\n    toplam += jiroOku();\n    delay(2);\n  }\n  jiroSapma = toplam / ORNEK_SAYISI;\n  Serial.print(\"Sapma: \");\n  Serial.println(jiroSapma, 2);\n}\n\nvoid loop() {\n  float hiz = jiroOku() - jiroSapma;  // sapması çıkarılmış hız\n  Serial.print(\"Hiz: \");\n  Serial.println(hiz, 2);\n  delay(100);\n}\n```\n\nBenzetimde jiroskobu 1,8 °/s sapmalı yaptık. Program `Sapma: 1.80` yazdı ve sonraki `Hiz:` satırları 0'a çok yakın (±0,05 °/s) çıktı. Aynı bilgi gerçek sensörlerde de geçerlidir: sapma sensörden sensöre ve sıcaklıkla değişir, o yüzden her açılışta yeniden ölçülür. Robotu açarken elinde tutma; masaya koy ve kıpırdatma.\n\n### Dene\n- `0x1B` yazmacına `0x00` yaz (±250 °/s) ve `JIRO_OLCEK`'i 131 yap. Gerçek bir sensörü elinle hızlıca çevir. Hız değerleri bir noktada takılıyor mu? (Yalnız benzetimle bunu göremezsin: orada hız ≈ 200 °/s'yi geçmiyor.)\n- İvmeölçer açısını yalnız `ax` ile hesapla: `asin(ax)`. Küçük açılarda `atan2` ile farkı var mı? 60°'de fark ne kadar?\n- Robotu elinle sallayarak hareket ettir. İvmeölçer açısı sabit tutarken mi, hareket ederken mi daha çok bozuluyor?\n\n### Sık yapılan hatalar\n- Açıyı radyan bırakmak: `atan2` radyan verir; dereceye çevirmeden `0,15` gibi derece cinsinden kazançlar yanlış çalışır.\n- `axHam / 16384` yazmak: iki tam sayının bölmesi küsuratı atar. `16384.0` yaz.\n- Jiroskop aralığını değiştirip ölçeği değiştirmemek: ±500 °/s için 65,5 kullan, 131 değil. Hız yarıya iner ya da iki katına çıkar.\n- Sapmayı ölçerken robotu tutmak ya da sallamak: sapma yanlış çıkar ve sonraki ölçümlerin hepsine bulaşır.\n- `atan2(az, ax)` yazmak: argümanların sırası önemli. Burada ilk argüman sin θ ile orantılı olan `ax`'tir.\n\n### Gerçek robotta farklı olabilecekler\nGerçek ivmeölçer motor titreşimini de ölçer ve çıktısı gürültülü olur; benzetimdeki ilk iki ölçüm ise temiz veriyle yapıldı. Bunu bir sonraki derste ele alıyoruz. Gerçek sensörün yönü, ölçek hatası ve sıcaklık etkisi de farklı olabilir.",
          "question": "İvmeölçer yerçekimine bakarak açı buluyor. Robot hızla ileri doğru hızlanırken (motor itince) ivmeölçerin göreceği şey sence yalnız yerçekimi olur mu? Açı ölçümü bundan nasıl etkilenir?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Eğim açısının ne olduğunu ve bir robotun neden eğimini bilmek zorunda olduğunu\n- İvmeölçerin yerçekimine bakarak açıyı nasıl bulduğunu (`atan2(ax, az)`)\n- Jiroskobun açıyı değil dönme hızını ölçtüğünü ve ölçeğin (65,5 ya da 131) ne anlama geldiğini\n- Jiroskop sapmasının (bias) ne olduğunu ve açılışta nasıl ölçülüp çıkarıldığını\n\n### Önceden bilmen gerekenler\nModül 4'ten MPU6050'nin ham `Wire` ile okunması ve eğim hesabı (58. ders) ve tamamlayıcı filtrenin ilk tanışması (59. ders). Modül 3'ten `Serial` çıktısı (9. ders) ve ondalıklı sayılarla çalışmak. Üçgenin kenarları ve derece kavramı yeter.\n\n### Eğim neden ölçülür?\nDengeleyen bir robot, bir cetveli parmakta dik tutmaya benzer. Düşmeye başladığını fark etmen için önce **eğimi**, yani robotun dikeyden kaç derece yattığını bilmen gerekir. Bu hafta ileri eğilme pozitif sayılır.\n\n### İvmeölçer: yerçekimine bakar\nDurağan bir sensör yalnız yerçekimini (1 g) hisseder. Robot yattıkça bu 1 g, sensörün X ve Z eksenleri arasında bölüşülür:\n\n| Eğim θ | ax (g) | az (g) |\n|---|---|---|\n| 0° | 0 | 1 |\n| 30° | 0,5 | 0,866 |\n| 45° | 0,707 | 0,707 |\n| 60° | 0,866 | 0,5 |\n\nBu yüzden `θ = atan2(ax, az)` olur. Fonksiyon radyan verir; dereceye çevirmek için 57,2958 ile çarparsın. İlk argümanın `ax` olması önemlidir: sin θ ile orantılı olan odur.\n\nHam sayı g'ye çevrilirken 16384'e bölünür. İki tam sayıyı bölersen sonuç küsuratsız çıkar, bu yüzden `16384.0` yazarsın.\n\n### Jiroskop: hızı ölçer\nJiroskop **dönme hızını** verir, birimi derece/saniyedir. Açıyı bulmak için hızı zamanla toplamak gerekir (bunu bir sonraki derste yapacaksın). Ölçek aralığa bağlıdır: ±250 °/s aralığında ham sayı 131'e, ±500 °/s aralığında 65,5'e bölünür. Aralığı değiştirdiysen ölçeği de değiştirmelisin; yoksa hız yarıya iner ya da iki katına çıkar.\n\nAralık neden önemli? Düşen robot hızlı döner. Hız aralığı aşarsa değer sınırda takılır (doyar) ve ölçüm yanlış olur. Bu yüzden benzetimdeki robot için ±500 °/s seçtik.\n\n### Sapma (bias)\nGerçek bir jiroskop hareketsizken bile küçük bir sabit değer okur. Bu **sapma** zamanla toplanınca büyük bir açı hatasına dönüşür: 2 °/s sapma, 20 saniyede yaklaşık 40° hata demektir. Çare, açılışta robot hareketsizken yüzlerce ölçümün ortalamasını alıp sapma olarak saklamak ve sonraki her okumadan çıkarmaktır.\n\n```\nfloat hiz = gyHam / 65.5 - sapma;\n```\n\n### Özet\nİvmeölçer yerçekimine bakarak eğimi `atan2(ax, az)` ile verir; titreşimde ve hızlanmada bozulur. Jiroskop açıyı değil hızı verir; ölçeği aralığa uygun seçilmeli ve sapması açılışta ölçülüp çıkarılmalıdır. İkisinin kusurları farklıdır; bir sonraki derste onları birleştireceksin.",
          "concepts": [
            {
              "term": "Eğim",
              "definition": "Robotun dikeyden kaç derece yattığı. Bu hafta ileri eğilme pozitif sayılır.",
              "example": "Robot 30° ileri yatmışsa eğim +30°; geri yatmışsa -30°.",
              "pitfall": "Sensörü yanlış yönde takıp işareti çevirmeyi unutmak: robot düzeltmek yerine devrilmeyi hızlandırır."
            },
            {
              "term": "İvmeölçer açısı: atan2(ax, az)",
              "definition": "Durağan sensör yerçekimini ölçer; X ve Z eksenlerindeki paylardan eğim açısı hesaplanır.",
              "example": "ax = 0,5 g ve az = 0,866 g ise açı 30° çıkar.",
              "pitfall": "Argümanları ters yazmak (atan2(az, ax)): sonuç 90° sapar. Radyanı dereceye çevirmeyi de unutma."
            },
            {
              "term": "Tam sayı bölmesi",
              "definition": "Ham ivme int16_t iken 16384 tam sayısına bölmek küsuratı atar; noktalı sayı (16384.0) gerekir.",
              "example": "axHam = 8192 için 8192 / 16384.0 = 0,5 g; tam sayı bölmesi 0 verir.",
              "pitfall": "axHam / 16384 yazmak: sonuç hep 0 olur ve açı yanlış çıkar."
            },
            {
              "term": "Jiroskop hızı ve ölçek",
              "definition": "Jiroskop dönme hızını (°/s) verir. Ham sayı, ±250 °/s için 131'e, ±500 °/s için 65,5'e bölünür.",
              "example": "±500 °/s aralığında ham 6550 değeri 100 °/s eder.",
              "pitfall": "Aralığı değiştirip ölçeği değiştirmemek: hız yarıya iner ya da iki katına çıkar."
            },
            {
              "term": "Sapma (bias)",
              "definition": "Hareketsiz jiroskobun okuduğu küçük sabit değer. Açılışta ortalaması alınır ve okumalardan çıkarılır.",
              "example": "2 °/s sapma, düzeltilmezse 20 saniyede yaklaşık 40° hata biriktirir.",
              "pitfall": "Sapmayı ölçerken robotu tutmak ya da sallamak: yanlış sapma sonraki bütün ölçümlere bulaşır."
            }
          ],
          "quiz": [
            {
              "id": "m5h6d1-q1",
              "kind": "mcq",
              "prompt": "Robot hareketsiz ve 30° ileri yatık. Sensörün X ve Z eksenlerinde yerçekimi (g cinsinden) yaklaşık ne görünür?",
              "options": [
                "ax = 0,5 ve az = 0,866",
                "ax = 0,866 ve az = 0,5",
                "ax = 1 ve az = 0",
                "ax = 0 ve az = 1"
              ],
              "answer": 0,
              "explanation": "X ekseni yerçekiminin sin θ kadarını, Z ekseni cos θ kadarını görür. 30° için sin = 0,5 ve cos = 0,866'dır. İkinci seçenek 60° içindir, üçüncüsü 90° (yatmış robot), dördüncüsü 0° (dik robot) içindir.",
              "skills": [
                "imu-tilt"
              ]
            },
            {
              "id": "m5h6d1-q2",
              "kind": "numeric",
              "prompt": "Bir turda ham değerler axHam = 8192 ve azHam = 14189 okundu (±2 g aralığı, 16384 sayı/g). atan2(ax, az) kaç derecedir?",
              "answer": 30,
              "tolerance": 0.5,
              "unit": "°",
              "explanation": "ax = 8192 / 16384 = 0,5 g ve az = 14189 / 16384 = 0,866 g. atan2(0,5; 0,866) = 30°. İki ham değerin oranı da aynı sonucu verir; ama kodda g'ye çevirmek hem anlamlıdır hem de başka hesaplarda gerekir.",
              "skills": [
                "imu-tilt"
              ]
            },
            {
              "id": "m5h6d1-q3",
              "kind": "numeric",
              "prompt": "Jiroskop ±500 °/s aralığında (65,5 sayı/(°/s)). Ham gyHam = 6550 okundu. Dönme hızı kaç °/s'dir?",
              "answer": 100,
              "tolerance": 0.5,
              "unit": "°/s",
              "explanation": "6550 / 65,5 = 100 °/s. Aynı ham değeri yanlışlıkla 131'e bölersen 50 °/s bulursun; aralık değişince ölçek de değişmelidir.",
              "skills": [
                "imu-gyro"
              ]
            },
            {
              "id": "m5h6d1-q4",
              "kind": "find-bug",
              "prompt": "Robot ileri yattığında bu kod açı yerine 90° ile bu açı arasındaki farkı yazıyor (30° yatışta 60° gösteriyor). Hangi satır hatalı?\n\n```\n1  float ax = axHam / 16384.0;\n2  float az = azHam / 16384.0;\n3  float aci = atan2(az, ax) * 57.2958;\n4  float hiz = gyHam / 65.5;     // ±500 °/s aralığı\n```",
              "options": [
                "1. satır: 16384.0 yerine 16384 yazılmalı",
                "2. satır: az negatif alınmalı",
                "3. satır: atan2 argümanları ters, (ax, az) olmalı",
                "4. satır: ölçek 131 olmalı"
              ],
              "answer": 2,
              "explanation": "sin θ ile orantılı olan ax ilk argüman olmalı. (az, ax) yazınca 90° - θ çıkar: 30° yatışta 60°. 1. satırdaki 16384.0 zaten doğru; 4. satırda aralık ±500 °/s olduğu için 65,5 doğrudur.",
              "skills": [
                "imu-tilt",
                "prog-debug"
              ]
            },
            {
              "id": "m5h6d1-q5",
              "kind": "predict-output",
              "prompt": "Açılışta ölçülen sapma 1,8 °/s. Robot hareketsizken ham gyHam = 262 okunuyor (65,5 sayı/(°/s)). Bu kod ne yazar?\n\n```\nfloat sapma = 1.8;\nint16_t gyHam = 262;\nfloat hiz = gyHam / 65.5 - sapma;\nSerial.println(hiz, 2);\n```",
              "options": [
                "4.00",
                "1.80",
                "-1.80",
                "2.20"
              ],
              "answer": 3,
              "explanation": "262 / 65,5 = 4,00 °/s; sapma çıkarılınca 4,00 - 1,80 = 2,20 °/s yazılır. 4.00 sapmayı çıkarmamak olurdu; 1.80 ve -1.80 ise sapmanın kendisidir, ölçümden çıkan sonuç değildir.",
              "skills": [
                "imu-gyro"
              ]
            }
          ]
        },
        {
          "title": "Tamamlayıcı filtre ve Kalman'a giriş",
          "durationMin": 25,
          "problem": "Önceki derste eğimi iki yoldan ölçtün. İvmeölçer açıyı doğrudan verir ama motor titreşince değerleri zıplar. Jiroskop pürüzsüzdür ama açıyı bulmak için toplamak gerekir ve en küçük sapma bile zamanla büyür. İkisi de tek başına yetmiyor. Peki ikisini birleştirip hem pürüzsüz hem sapmasız bir açı elde edebilir misin?",
          "contentMd": "### Devre\nBir önceki dersle aynı: MPU6050 modülü, SDA → **A4**, SCL → **A5**, AD0 → GND (adres 0x68). Motorlar bu derste kullanılmıyor.\n\n### Fikir: kim neyde iyi?\n| Sensör | Kısa sürede (hızlı değişimde) | Uzun sürede |\n|---|---|---|\n| İvmeölçer | Gürültülü (titreşim, sarsıntı) | Doğru (yerçekimine bağlı) |\n| Jiroskop (hızın toplamı) | Pürüzsüz ve hızlı | Kayar (sapma birikir) |\n\n**Tamamlayıcı filtre** her birinin iyi olduğu tarafı alır:\n\n`aci = α · (aci + hiz · dt) + (1 − α) · ivmeAci`\n\n- `aci + hiz · dt`: önceki açıyı jiroskopla ilerlet (kısa vadede güven).\n- `ivmeAci`: ivmeölçerden gelen açı. Küçük bir pay (`1 − α`) ile her adımda tahmini ona doğru çeker; böylece sapma birikemez.\n- `α` 0 ile 1 arasında bir sayıdır. Tipik değer 0,98'dir: tahminin %98'i jiroskop, %2'si ivmeölçerden gelir.\n\nFiltrenin \"ne kadar çabuk unuttuğu\" yaklaşık `τ ≈ α · dt / (1 − α)` zaman sabitiyle bulunur. Bu derste turlar yaklaşık 5,4 ms sürdüğü için (`dt ≈ 5,4 ms`) `τ ≈ 0,26 s`: ivmeölçerin kalıcı bilgisi yaklaşık bu sürede açıya yansır, daha hızlı titreşimlerin çoğu süzülür. `α` büyüdükçe jiroskoba daha çok güvenirsin (daha pürüzsüz ama sapma daha geç düzelir); küçüldükçe ivmeölçer gürültüsü açıya geçer.\n\n`dt` saniye cinsinden, iki ölçüm arasındaki gerçek süredir. Bu derste `micros()` ile ölçüyoruz; sabit periyot konusuna 103'te gireceğiz.\n\n### Tezgâh deneyi\nRobotu masada elle ileri geri sallıyormuş gibi bir hareket (±15°, saniyede 0,4 tur) benzetildi. Hareket sırasında:\n- ivmeölçere motor titreşimi gibi gürültü bindirildi (±0,12 g rastgele gürültü ve 0,08 g genlikli 37 Hz titreşim),\n- jiroskop 2 °/s sapmalı yapıldı; sapma düzeltilmedi.\n\n### Program: üç açıyı yan yana yaz\n```cpp\n// sketch: tamamlayici_filtre\n#include <Wire.h>\n\nconst int MPU_ADRES = 0x68;\nconst float RAD_DERECE = 57.2958;\nconst float JIRO_OLCEK = 65.5;        // ±500 °/s\nconst float IVME_OLCEK = 16384.0;\nconst float ALFA = 0.98;              // jiroskop payı\n\nfloat aciIvme = 0;                    // yalnız ivmeölçer\nfloat aciJiro = 0;                    // yalnız jiroskop integrali\nfloat aciFiltre = 0;                  // tamamlayıcı filtre\nunsigned long sonUs = 0;\nunsigned long sonYazdirMs = 0;\nbool ilk = true;\n\nint16_t oku16() {\n  uint8_t yuksek = Wire.read();\n  uint8_t alcak = Wire.read();\n  return (int16_t)(((uint16_t)yuksek << 8) | alcak);\n}\n\nvoid imuOku(float &ivmeAci, float &hiz) {\n  Wire.beginTransmission(MPU_ADRES);\n  Wire.write(0x3B);\n  Wire.endTransmission(false);\n  Wire.requestFrom(MPU_ADRES, 14, true);\n  int16_t axHam = oku16();\n  oku16();\n  int16_t azHam = oku16();\n  oku16();\n  oku16();\n  int16_t gyHam = oku16();\n  oku16();\n  ivmeAci = atan2(axHam / IVME_OLCEK, azHam / IVME_OLCEK) * RAD_DERECE;\n  hiz = gyHam / JIRO_OLCEK;\n}\n\nvoid setup() {\n  Serial.begin(115200);\n  Wire.begin();\n  Wire.beginTransmission(MPU_ADRES);\n  Wire.write(0x6B);\n  Wire.write(0);\n  Wire.endTransmission(true);\n  Wire.beginTransmission(MPU_ADRES);\n  Wire.write(0x1B);\n  Wire.write(0x08);\n  Wire.endTransmission(true);\n  sonUs = micros();\n}\n\nvoid loop() {\n  unsigned long simdi = micros();\n  float dt = (simdi - sonUs) / 1000000.0;   // iki ölçüm arası gerçek süre (s)\n  sonUs = simdi;\n\n  float ivmeAci, hiz;\n  imuOku(ivmeAci, hiz);\n\n  if (ilk) {                                // başlangıç: üçü de ivmeölçerle başlasın\n    aciIvme = aciJiro = aciFiltre = ivmeAci;\n    ilk = false;\n  } else {\n    aciIvme = ivmeAci;\n    aciJiro += hiz * dt;                                         // saf integral\n    aciFiltre = ALFA * (aciFiltre + hiz * dt) + (1 - ALFA) * ivmeAci;\n  }\n\n  if (millis() - sonYazdirMs >= 100) {      // saniyede 10 satır\n    sonYazdirMs = millis();\n    Serial.print(millis());\n    Serial.print(',');\n    Serial.print(aciIvme, 1);\n    Serial.print(',');\n    Serial.print(aciJiro, 1);\n    Serial.print(',');\n    Serial.println(aciFiltre, 1);\n  }\n  delay(5);\n}\n```\n\n### Nasıl çalışıyor?\n1. Her turda `dt` hesaplanır; `micros()` mikrosaniye sayar.\n2. `aciJiro` yalnız jiroskopu toplar; sapma ile birlikte toplanır, yani hata sürekli büyür.\n3. `aciFiltre` aynı toplamı yapar ama her turda `(1 − α)` kadar ivmeölçer açısına çekilir. Sapmanın birikmesi bu çekimle dengelenir.\n4. İlk turda üç değer de ivmeölçer açısıyla başlar; sıfırdan başlatsan filtre doğru açıya gelene kadar yanlış açı verir.\n\n### Ölçüm: açı hatası\nAynı 20 saniyelik hareketi üç yöntemle ölçtük ve gerçek açıyla karşılaştırdık (ilk 2 sn atıldı; hata = ölçülen − gerçek).\n| Yöntem | Ortalama (RMS) hata | En büyük hata |\n|---|---|---|\n| Yalnız ivmeölçer | 5,2° | 11,1° |\n| Yalnız jiroskop (integral) | 27,2° | 43,2° (20. saniyede) |\n| Tamamlayıcı filtre (α = 0,98) | 0,65° | 1,7° |\n\nYorum: saf ivmeölçer ortalamada doğru ama titreşimle zıplıyor; saf jiroskop pürüzsüz ama hata durmadan büyüyor (2 °/s sapma × 20 sn ≈ 43°); tamamlayıcı filtre ikisinin de sorununu büyük ölçüde gideriyor. Filtrede kalan küçük sabit hata, sapma ile zaman sabitinin çarpımı kadardır (≈ 2 °/s × τ), yani jiroskop sapmasını 101'deki gibi açılışta ölçüp çıkarırsan daha da küçülür.\n\n### Kalman filtresine giriş (yalnız kavram)\nTamamlayıcı filtrenin `α` değeri sabittir: sen seçersin ve hep aynı kalır. **Kalman filtresi** de aynı fikri (jiroskopla ilerlet, ölçümle düzelt) kullanır, ama düzeltme payını (**Kalman kazancı**) her adımda sensörlerin ne kadar güvenilir olduğuna ve tahminin ne kadar belirsiz olduğuna bakarak kendisi hesaplar:\n\n`yeni tahmin = tahmin + K · (ölçüm − tahmin)`\n\nTahmin belirsizse `K` büyür (ölçüme çok güvenir), ölçüm gürültülüyse `K` küçülür. Robot kodlarında sık görülen sürümü, açıyla birlikte jiroskop sapmasını da tahmin eder. Bedeli: matris işlemleri, gürültü ayarları (hangi sensöre ne kadar güveneceğini sen belirtirsin) ve daha uzun işlem süresi. Bu kursta tamamlayıcı filtreyle devam ediyoruz: tek satırdır, tek ayar değeri vardır ve benzetimdeki robotu dengelemeye yeter. İlerde daha hassas bir ölçüme ihtiyaç duyarsan Kalman'ı öğrenmek için hazır olacaksın.\n\n### Dene\n- `ALFA`'yı 0,9 yap. Filtrenin çıktısı nasıl değişiyor? 0,995 yap; bu kez ne oluyor?\n- `ilk` bloğunu sil ve `aciFiltre`'yi 0'dan başlat. Başlangıç açısı 15° olsaydı filtrenin doğru değere oturması ne kadar sürerdi? (İpucu: τ)\n- 101'deki `gyro_sifir` fikrini ekle: açılışta sapmayı ölç ve `hiz`'dan çıkar. Hata nasıl değişiyor?\n\n### Sık yapılan hatalar\n- `dt`'yi sabit (örneğin 0,005) yazmak ama döngü aslında 5,3 ms'de dönüyorsa jiroskop integrali yaklaşık %6 küçük çıkar. 103'te ölçeceğiz.\n- Açıyı derece, hızı radyan/s cinsinden karıştırmak. İkisi de derece olmalı.\n- `α` ve `(1 − α)` toplamını 1'den farklı seçmek: filtre ya şişer ya söner.\n- Filtreyi başlatmamak (ilk açıyı 0 almak).\n- Robot hızlanırken ivmeölçerin yerçekiminden başka şey de ölçtüğünü unutmak: filtre bunu yalnız bir ölçüde süzer.\n\n### Gerçek robotta farklı olabilecekler\nGerçek bir ivmeölçerdeki titreşim, motorların ve tekerleklerin yapısına göre çok farklı olabilir; bazen gürültü bu derste verilenden çok büyüktür ve `α`'yı 0,99'a çıkarmak gerekebilir. Jiroskop sapması da sıcaklıkla değişir. Buradaki sayılar benzetim içindir.",
          "question": "`α = 0,98` yerine `α = 0,5` kullanırsan filtre neye benzer? Jiroskop sapması hiç olmasaydı filtreye gerek kalır mıydı?",
          "explainerMd": "### Bu derste öğreneceklerin\n- İvmeölçer ve jiroskobun hangi zaman ölçeğinde güvenilir olduğunu\n- Tamamlayıcı filtrenin formülünü ve `α` değerinin rolünü\n- Zaman sabitini (`τ`) hesaplamayı ve filtrenin kalıcı hatasını tahmin etmeyi\n- Kalman filtresinin tamamlayıcı filtreden hangi bakımdan farklı olduğunu\n\n### Önceden bilmen gerekenler\n101. dersten ivmeölçer açısı (`atan2`), jiroskop hızı ve sapma. Modül 4'ten tamamlayıcı filtrenin ilk tanışması (59. ders). Ondalıklı çarpma ve toplama yeterli.\n\n### İki sensör, zıt kusurlar\n| Sensör | Kısa sürede | Uzun sürede |\n|---|---|---|\n| İvmeölçer | Gürültülü (titreşim, sarsıntı) | Doğru, çünkü yerçekimine bağlı |\n| Jiroskop (hızın toplamı) | Pürüzsüz ve hızlı | Kayar, çünkü sapma birikir |\n\nBirinin zayıf olduğu yerde diğeri güçlü: ikisi birbirini **tamamlar**.\n\n### Filtrenin formülü\nHer turda önce açıyı jiroskopla ilerletirsin, sonra tahmini ivmeölçerin açısına doğru azıcık çekersin:\n\n```\naci = ALFA * (aci + hiz * dt) + (1 - ALFA) * ivmeAci;\n```\n\n`ALFA` genellikle 0,98'dir: tahminin %98'i jiroskoptan, %2'si ivmeölçerden gelir. İki payın toplamı 1 olmalıdır; aksi hâlde filtre şişer ya da söner. `dt` iki ölçüm arasındaki gerçek süredir (saniye).\n\n### Zaman sabiti\nİvmeölçerin kalıcı bilgisinin açıya yansıma süresi yaklaşık `τ = α · dt / (1 − α)` kadardır. Örnek: α = 0,98 ve dt = 0,01 s için τ = 0,98 · 0,01 / 0,02 = 0,49 s. Bu süreden kısa titreşimler büyük ölçüde süzülür. `α` büyürse filtre pürüzsüzleşir ama sapmayı geç düzeltir; küçülürse ivmeölçerin gürültüsü açıya geçer.\n\nFiltrede küçük bir kalıcı hata kalır. Jiroskop sapması `b` ise, robot durağanken filtrenin açı hatası yaklaşık `b · τ` olur. Saf integralde ise hata durmadan büyür. İlk turda açıyı ivmeölçerden başlatmak da önemlidir; sıfırdan başlarsan filtre doğru değere oturana kadar yanlış açı verir.\n\n### Kalman filtresine bir bakış\nKalman filtresi aynı fikri kullanır (jiroskopla ilerlet, ölçümle düzelt) ama düzeltme payını sen sabit seçmezsin; filtre her adımda tahminin belirsizliğine ve sensör gürültüsüne bakarak hesaplar. Bedeli matris işlemleri ve ek ayar değerleridir. Bu kursta tek satırlık tamamlayıcı filtreyle devam ediyoruz.\n\n### Özet\nTamamlayıcı filtre jiroskopu kısa vadede, ivmeölçeri uzun vadede dinler. `α` ve `dt` zaman sabitini belirler: τ ≈ α · dt / (1 − α). Sapma tamamen yok olmaz ama birikmez; kalıcı hata yaklaşık sapma çarpı τ kadardır. Kalman filtresi payı kendisi hesaplayan daha ağır bir akrabadır.",
          "concepts": [
            {
              "term": "Tamamlayıcı filtre",
              "definition": "Açıyı jiroskopla ilerletip her turda ivmeölçer açısına doğru azıcık çeken filtre: aci = α(aci + hiz·dt) + (1 − α)·ivmeAci.",
              "example": "α = 0,98: tahminin %98'i jiroskoptan, %2'si ivmeölçerden gelir.",
              "pitfall": "Jiroskop terimini (hiz·dt) unutmak: filtre yalnız ivmeölçeri yumuşatır ve hızlı hareketleri geriden izler."
            },
            {
              "term": "α (alfa)",
              "definition": "Jiroskoba verilen güven payı. (1 − α) ivmeölçerin payıdır; ikisinin toplamı 1 olmalıdır.",
              "example": "α büyüyünce açı pürüzsüzleşir ama sapma geç düzelir; küçülünce ivmeölçer gürültüsü açıya geçer.",
              "pitfall": "α ile (1 − α) paylarının toplamını 1'den farklı seçmek: filtre şişer ya da söner."
            },
            {
              "term": "Zaman sabiti τ",
              "definition": "İvmeölçerin kalıcı bilgisinin açıya yansıdığı yaklaşık süre: τ = α·dt / (1 − α).",
              "example": "α = 0,98 ve dt = 0,01 s için τ = 0,49 s.",
              "pitfall": "τ'yu α'dan bağımsız sanmak: dt değişince aynı α'nın etkisi de değişir."
            },
            {
              "term": "Filtreyi başlatmak",
              "definition": "İlk turda filtre açısını ivmeölçer açısıyla başlatmak, doğru değere oturma süresini ortadan kaldırır.",
              "example": "Robot 15° yatıkken başlıyorsa filtre 15° ile başlar, 0° ile değil.",
              "pitfall": "Açıyı 0'dan başlatmak: filtre birkaç τ boyunca yanlış açı verir."
            },
            {
              "term": "Kalman filtresi",
              "definition": "Tamamlayıcı filtreyle aynı fikri kullanır ama düzeltme payını (kazancı) her adımda belirsizliğe bakarak kendisi hesaplar.",
              "example": "Ölçüm gürültülüyse kazanç küçülür, tahmin belirsizse büyür.",
              "pitfall": "Kalman'ı \"her zaman daha iyi\" sanmak: matris işlemleri ve ayar değerleri gerektirir; basit robotlarda tamamlayıcı filtre yeter."
            }
          ],
          "quiz": [
            {
              "id": "m5h6d2-q1",
              "kind": "mcq",
              "prompt": "Robot motor titreşimli bir zeminde duruyor. İvmeölçer ve jiroskop için hangi ifade doğrudur?",
              "options": [
                "İvmeölçer kısa sürede, jiroskop uzun sürede güvenilirdir",
                "Jiroskop kısa sürede, ivmeölçer uzun sürede güvenilirdir",
                "İkisi de her zaman aynı derecede güvenilirdir",
                "Titreşim jiroskobun uzun süreli kaymasını artırır"
              ],
              "answer": 1,
              "explanation": "İvmeölçer yerçekimine bağlı olduğu için ortalamada doğrudur ama titreşimle zıplar. Jiroskopun hızı toplanınca pürüzsüz bir açı çıkar ama sapma birikir. Filtre ikisini bu yüzden zıt zaman ölçeklerinde kullanır.",
              "skills": [
                "filter-complementary",
                "imu-tilt"
              ]
            },
            {
              "id": "m5h6d2-q2",
              "kind": "predict-output",
              "prompt": "Filtrenin tek adımı çalışıyor. Bu kod ne yazar?\n\n```\nfloat aci = 10.0;\nfloat hiz = 20.0;        // °/s\nfloat dt = 0.01;         // s\nfloat ivmeAci = 12.0;\naci = 0.98 * (aci + hiz * dt) + 0.02 * ivmeAci;\nSerial.println(aci, 2);\n```",
              "options": [
                "10.24",
                "10.20",
                "12.00",
                "9.80"
              ],
              "answer": 0,
              "explanation": "Önce jiroskopla ilerletilir: 10 + 20·0,01 = 10,2; 0,98 ile çarpılınca 9,996. İvmeölçer payı 0,02·12 = 0,24. Toplam 10,236 ve iki ondalıkla 10.24. 10.20 yalnız jiroskopu, 12.00 yalnız ivmeölçeri kullanmak olurdu.",
              "skills": [
                "filter-complementary"
              ]
            },
            {
              "id": "m5h6d2-q3",
              "kind": "numeric",
              "prompt": "Robot hareketsiz (gerçek açı 0°), ivmeölçer 0° okuyor, jiroskop 2 °/s sapmalı. α = 0,98 ve dt = 0,01 s. Filtre uzun süre sonra kaç derece gösterir?",
              "answer": 0.98,
              "tolerance": 0.02,
              "unit": "°",
              "explanation": "Kalıcı durumda hata, sapma çarpı zaman sabitidir. τ = 0,98·0,01 / 0,02 = 0,49 s ve hata = 2·0,49 = 0,98°. Saf jiroskop integrali ise aynı sapmayla her saniye 2° biriktirir ve hiç durmaz; filtre bu büyümeyi sınırlar.",
              "skills": [
                "filter-complementary",
                "imu-gyro"
              ]
            },
            {
              "id": "m5h6d2-q4",
              "kind": "find-bug",
              "prompt": "Bu filtre robot hızlı yatarken açıyı geriden izliyor ve jiroskop kullanılmıyor gibi davranıyor. Hangi satır hatalı?\n\n```\n1  float ivmeAci, hiz;\n2  imuOku(ivmeAci, hiz);\n3  aci = ALFA * aci + (1 - ALFA) * ivmeAci;\n```",
              "options": [
                "1. satır: ivmeAci ve hiz float olmamalı",
                "2. satır: imuOku iki kez çağrılmalı",
                "3. satır: hiz * dt terimi eksik, filtre yalnız ivmeölçeri yumuşatıyor",
                "3. satır: ALFA ile (1 - ALFA) toplamı 1 olmamalı"
              ],
              "answer": 2,
              "explanation": "Jiroskop hızı hiç kullanılmıyor: formül ALFA * (aci + hiz * dt) olmalıydı. Bu hâliyle yalnız ivmeölçerin yavaş bir ortalaması alınıyor. ALFA ve (1 - ALFA) toplamı zaten 1'dir, bu doğru olandır.",
              "skills": [
                "filter-complementary",
                "prog-debug"
              ]
            },
            {
              "id": "m5h6d2-q5",
              "kind": "mcq",
              "prompt": "Kalman filtresi tamamlayıcı filtreden hangi bakımdan ayrılır?",
              "options": [
                "Jiroskop kullanmaz",
                "Yalnız ivmeölçerle çalışır",
                "Daha az hesap gerektirir",
                "Düzeltme payını her adımda belirsizliğe bakarak kendisi hesaplar; tamamlayıcıda α sabittir"
              ],
              "answer": 3,
              "explanation": "İkisi de jiroskopla ilerletir ve ölçümle düzeltir. Tamamlayıcı filtrede α'yı sen seçersin ve hep aynı kalır; Kalman kazancı ise tahmin ve sensör belirsizliğine göre değişir. Bunun bedeli daha çok hesap ve ayar değeridir.",
              "skills": [
                "filter-complementary"
              ]
            }
          ]
        },
        {
          "title": "Sabit periyotlu kontrol döngüsü",
          "durationMin": 25,
          "problem": "Bir denge robotunun kodu saniyede yüzlerce kez eğimi okur, hesap yapar ve motorları ayarlar. Bu işin ritmi kadar önemli bir şey daha var: her turun **aynı sürede** dönmesi. Sinema filminde kareler düzensiz gelirse hareket sarsılır; kontrol döngüsünde ise robot düşer. `delay(5)` yazmak \"5 ms'de bir çalışsın\" demek midir? Bu derste ölçeceksin.",
          "contentMd": "### Devre\nBir önceki derslerle aynı: MPU6050 (SDA **A4**, SCL **A5**, adres 0x68). Ölçüm için **D13** kullanılıyor: dahili LED. Her tur D13'ün durumunu çevirir; iki kenar arasındaki süre bir turun süresidir. Osiloskopun ya da mantık çözümleyicin varsa D13'e bağla. Benzetimde bu ölçümü bizim için `pinEdges` yapıyor.\n\n### Neden sabit periyot?\nKontrol kodundaki üç şey `dt`'ye bağlıdır:\n1. **Açı integrali:** `aci += hiz · dt` (ders 102). `dt` yanlışsa açı orantılı olarak yanlış çıkar.\n2. **Tamamlayıcı filtre:** zaman sabiti `τ ≈ α · dt / (1 − α)` (ders 102); `dt` değişince filtre davranışı da değişir.\n3. **PID:** türev `Δhata / dt`, integral `hata · dt` (Hafta 5); kazançlar belirli bir `dt` için ayarlanmıştır.\n\nBu yüzden iki yol vardır: ya `dt`'yi **her tur gerçekten ölçeriz** (en az bu), ya da döngüyü **sabit periyotla** çalıştırırız (daha iyi). İkisini birlikte yapmak en sağlamıdır.\n\n### delay() döngüsü ne kadar sürer?\n`delay(5)` \"5 ms bekle\" demektir; ama turun geri kalanı (I2C okuma, hesaplar, `Serial.print`) bunun **üstüne** eklenir. Tur süresi `5 ms + işin süresi` olur ve iş her turda aynı sürmez.\n\n### Program 1: delay() döngüsünün periyodunu ölç\nJiroskop sabit 50 °/s dönüyormuş gibi besleniyor. Program açıyı iki yolla toplar: `dt = 0,005` sabit varsayarak ve `micros()` ile ölçerek. Her 100 turda sonuçlar ve ölçülen en küçük/en büyük tur süresi (µs) yazılır.\n\n```cpp\n// sketch: delay_dongusu\n#include <Wire.h>\n\nconst int MPU_ADRES = 0x68;\nconst int OLCUM_PINI = 13;            // her turda durumu değişir\nconst float JIRO_OLCEK = 65.5;        // ±500 °/s\nconst float VARSAYILAN_DT = 0.005;    // \"5 ms'dir herhalde\" diye yazdığımız dt (s)\n\nfloat aciSabitDt = 0;                 // dt = 0,005 varsayarak\nfloat aciOlculenDt = 0;               // dt'yi micros() ile ölçerek\nunsigned long sonUs = 0;\nunsigned long enKucukUs = 4294967295UL;\nunsigned long enBuyukUs = 0;\nint tur = 0;\n\nint16_t oku16() {\n  uint8_t yuksek = Wire.read();\n  uint8_t alcak = Wire.read();\n  return (int16_t)(((uint16_t)yuksek << 8) | alcak);\n}\n\n// 14 baytı oku, ivme açısını hesapla, jiroskop hızını döndür\nfloat imuOku(float &ivmeAci) {\n  Wire.beginTransmission(MPU_ADRES);\n  Wire.write(0x3B);\n  Wire.endTransmission(false);\n  Wire.requestFrom(MPU_ADRES, 14, true);\n  int16_t axHam = oku16();\n  oku16();\n  int16_t azHam = oku16();\n  oku16();\n  oku16();\n  int16_t gyHam = oku16();\n  oku16();\n  ivmeAci = atan2((float)axHam, (float)azHam) * 57.2958;\n  return gyHam / JIRO_OLCEK;\n}\n\nvoid setup() {\n  Serial.begin(115200);\n  Wire.begin();\n  Wire.beginTransmission(MPU_ADRES);\n  Wire.write(0x6B);\n  Wire.write(0);\n  Wire.endTransmission(true);\n  Wire.beginTransmission(MPU_ADRES);\n  Wire.write(0x1B);\n  Wire.write(0x08);\n  Wire.endTransmission(true);\n  pinMode(OLCUM_PINI, OUTPUT);\n  sonUs = micros();\n}\n\nvoid loop() {\n  unsigned long simdi = micros();\n  unsigned long dtUs = simdi - sonUs;         // bu tur ile önceki tur arası gerçek süre\n  sonUs = simdi;\n  if (dtUs < enKucukUs) enKucukUs = dtUs;\n  if (dtUs > enBuyukUs) enBuyukUs = dtUs;\n\n  digitalWrite(OLCUM_PINI, !digitalRead(OLCUM_PINI));   // her turda durumu çevir\n\n  float ivmeAci;\n  float hiz = imuOku(ivmeAci);\n  aciSabitDt += hiz * VARSAYILAN_DT;\n  aciOlculenDt += hiz * (dtUs / 1000000.0);\n\n  tur++;\n  if (tur >= 100) {                           // her 100 turda bir yazdır\n    tur = 0;\n    Serial.print(millis());\n    Serial.print(',');\n    Serial.print(aciSabitDt, 1);\n    Serial.print(',');\n    Serial.print(aciOlculenDt, 1);\n    Serial.print(',');\n    Serial.print(enKucukUs);\n    Serial.print(',');\n    Serial.println(enBuyukUs);\n    enKucukUs = 4294967295UL;\n    enBuyukUs = 0;\n  }\n  delay(5);                                   // \"5 ms bekle\"\n}\n```\n\nÇıktının sütunları: zaman (ms), sabit `dt` ile açı, ölçülen `dt` ile açı, en küçük tur (µs), en büyük tur (µs).\n\nBenzetimde ölçtüğümüz (4 saniyede):\n- Tur süresi (D13 kenarları): ortalama **5,35 ms**, en kısa 5,33 ms, en uzun **6,64 ms**. `delay(5)` 5 ms'ye ek olarak yaklaşık 0,33 ms'lik iş süresini ve `Serial.print` turlarında yaklaşık 1,3 ms daha ekliyor.\n- Jiroskop 3,7 saniye boyunca 50 °/s döndü, yani gerçek açı **186,7°**. `dt = 0,005` varsayan açı **175,0°** buldu (%6,3 eksik); ölçülen `dt` ile bulunan açı **186,7°** çıktı.\n\n### Program 2: micros() ile sabit periyot\nÇözüm: \"5 ms geçti mi?\" diye sormak. Bunu `millis()` ile (ders 27) yapmıştık; denge için daha ince bir zamana ihtiyacımız var, o yüzden `micros()` (mikrosaniye, bu kartta 4 µs adımlarla sayar). Bir sonraki turun **planlanan** zamanını tutarız ve her turda ona `PERIYOT_US` ekleriz; böylece küçük gecikmeler birikip döngüyü kaydırmaz.\n\nİş bir turdan uzun sürerse (**taşma**), planlanan zamanı yeniden ayarlayıp kaçırılan turu sayarız. Seri porttan `a` gönderirsen program bilerek 12 ms'lik ağır bir iş yapar ve bir turu kaçırır.\n\n```cpp\n// sketch: sabit_dongu\n#include <Wire.h>\n\nconst int MPU_ADRES = 0x68;\nconst int OLCUM_PINI = 13;\nconst float JIRO_OLCEK = 65.5;\nconst unsigned long PERIYOT_US = 5000;   // hedef periyot: 5 ms = 200 Hz\n\nfloat aciSabitDt = 0;                 // dt = PERIYOT_US varsayarak\nfloat aciOlculenDt = 0;               // dt'yi micros() ile ölçerek\nunsigned long sonPlanUs = 0;          // bir sonraki turun planlanan zamanı\nunsigned long sonGercekUs = 0;        // önceki turun gerçek başlangıcı\nunsigned long enKucukUs = 4294967295UL;\nunsigned long enBuyukUs = 0;\nint tasma = 0;                        // kaçırılan tur sayısı\nint tur = 0;\n\nint16_t oku16() {\n  uint8_t yuksek = Wire.read();\n  uint8_t alcak = Wire.read();\n  return (int16_t)(((uint16_t)yuksek << 8) | alcak);\n}\n\nfloat imuOku(float &ivmeAci) {\n  Wire.beginTransmission(MPU_ADRES);\n  Wire.write(0x3B);\n  Wire.endTransmission(false);\n  Wire.requestFrom(MPU_ADRES, 14, true);\n  int16_t axHam = oku16();\n  oku16();\n  int16_t azHam = oku16();\n  oku16();\n  oku16();\n  int16_t gyHam = oku16();\n  oku16();\n  ivmeAci = atan2((float)axHam, (float)azHam) * 57.2958;\n  return gyHam / JIRO_OLCEK;\n}\n\nvoid setup() {\n  Serial.begin(115200);\n  Wire.begin();\n  Wire.beginTransmission(MPU_ADRES);\n  Wire.write(0x6B);\n  Wire.write(0);\n  Wire.endTransmission(true);\n  Wire.beginTransmission(MPU_ADRES);\n  Wire.write(0x1B);\n  Wire.write(0x08);\n  Wire.endTransmission(true);\n  pinMode(OLCUM_PINI, OUTPUT);\n  sonPlanUs = sonGercekUs = micros();\n}\n\nvoid loop() {\n  unsigned long simdi = micros();\n  unsigned long gecen = simdi - sonPlanUs;\n  if (gecen < PERIYOT_US) return;             // zamanı gelmedi: hiçbir şey yapma\n  if (gecen >= 2 * PERIYOT_US) {              // bir tur kaçtı (iş çok uzun sürdü)\n    tasma++;\n    sonPlanUs = simdi;                        // yeniden senkronla\n  } else {\n    sonPlanUs += PERIYOT_US;                  // bir sonraki planlı an: kayma birikmez\n  }\n  unsigned long dtUs = simdi - sonGercekUs;   // iki tur arası gerçek süre\n  sonGercekUs = simdi;\n  if (dtUs < enKucukUs) enKucukUs = dtUs;\n  if (dtUs > enBuyukUs) enBuyukUs = dtUs;\n\n  digitalWrite(OLCUM_PINI, !digitalRead(OLCUM_PINI));\n\n  float ivmeAci;\n  float hiz = imuOku(ivmeAci);\n  aciSabitDt += hiz * (PERIYOT_US / 1000000.0);\n  aciOlculenDt += hiz * (dtUs / 1000000.0);\n\n  if (Serial.available() && Serial.read() == 'a') {\n    delay(12);                                // ağır iş benzetimi: bir turu kaçırır\n  }\n\n  tur++;\n  if (tur >= 100) {                           // her 100 turda bir yazdır\n    tur = 0;\n    Serial.print(millis());\n    Serial.print(',');\n    Serial.print(aciSabitDt, 1);\n    Serial.print(',');\n    Serial.print(aciOlculenDt, 1);\n    Serial.print(',');\n    Serial.print(enKucukUs);\n    Serial.print(',');\n    Serial.print(enBuyukUs);\n    Serial.print(',');\n    Serial.println(tasma);\n    enKucukUs = 4294967295UL;\n    enBuyukUs = 0;\n  }\n}\n```\n\nÇıktının son sütunu kaçırılan tur sayısıdır.\n\nBenzetimde ölçtüğümüz:\n- Tur süresi (D13 kenarları): ortalama **5,000 ms**, en kısa 4,991 ms, en uzun 5,009 ms. Sketch'in kendi ölçümü de 4996 ile 5004 µs arasında.\n- Her iki açı da gerçeği buluyor (186,7° civarı); `dt` sabit varsayımı artık doğru, çünkü periyot gerçekten sabit.\n- `a` komutu gönderince 12 ms'lik iş bir turu kaçırdı: `tasma` 1 oldu, bir tur arası 12 ms'nin üzerine çıktı, sonraki turlar yine 5,000 ms'de devam etti.\n\n### Nasıl çalışıyor?\n1. `if (gecen < PERIYOT_US) return;` döngü hızlıca boş döner; işe yalnız süre dolunca girilir. `delay()` gibi işlemciyi bekletmiyoruz, `loop()` her an başka bir işe (örneğin seri porttan okumaya) bakabilir.\n2. `sonPlanUs += PERIYOT_US` planlı zamanı ilerletir. `sonPlanUs = simdi` yapsaydık, her turdaki küçük gecikme bir sonrakine eklenir ve periyot hedeften uzaklaşırdı.\n3. Süreler `unsigned long` farkıyla hesaplanır. `micros()` yaklaşık 71,6 dakikada başa sarar; çıkarma işlemi (ders 27'deki gibi) bu sarmada da doğru sonuç verir.\n4. `dtUs` yine de **ölçülür**: bir tur kaçarsa filtre ve integral yine doğru `dt`'yi kullanır.\n\n### Sabit periyot denge için ne kadar önemli?\nAynı PD denge kodunu (104'te ayrıntılarına gireceğiz) farklı periyotlarla çalıştırdık. Robot 3° eğik başlıyor, 8 saniye boyunca izlendi:\n\n```cpp\n// sketch: denge_sabit\n#include <Wire.h>\n\nconst int MPU_ADRES = 0x68;\nconst int SOL_EN = 5, SOL_IN1 = 7, SOL_IN2 = 8;     // sol motor\nconst int SAG_EN = 6, SAG_IN3 = 9, SAG_IN4 = 10;    // sağ motor\n\nconst unsigned long PERIYOT_US = 5000;\nconst float ALFA = 0.98;              // tamamlayıcı filtre\nconst float KP = 0.15;                // komut / derece      (BENZETİM robotuna göre)\nconst float KD = 0.02;                // komut / (derece/s)  (BENZETİM robotuna göre)\nconst float OLU_BOLGE = 0.08;         // motor ölü bölgesi: PWM'in bu oranının altında tekerlek dönmüyor\n\nfloat aci = 0;\nbool ilk = true;\nunsigned long sonPlanUs = 0;\nunsigned long sonGercekUs = 0;\n\nint16_t oku16() {\n  uint8_t yuksek = Wire.read();\n  uint8_t alcak = Wire.read();\n  return (int16_t)(((uint16_t)yuksek << 8) | alcak);\n}\n\nvoid imuOku(float &ivmeAci, float &hiz) {\n  Wire.beginTransmission(MPU_ADRES);\n  Wire.write(0x3B);\n  Wire.endTransmission(false);\n  Wire.requestFrom(MPU_ADRES, 14, true);\n  int16_t axHam = oku16();\n  oku16();\n  int16_t azHam = oku16();\n  oku16();\n  oku16();\n  int16_t gyHam = oku16();\n  oku16();\n  ivmeAci = atan2((float)axHam, (float)azHam) * 57.2958;\n  hiz = gyHam / 65.5;\n}\n\nvoid motorSur(float u) {              // u: -1 ... +1\n  u = constrain(u, -1.0, 1.0);\n  bool ileri = (u >= 0);\n  digitalWrite(SOL_IN1, ileri);\n  digitalWrite(SOL_IN2, !ileri);\n  digitalWrite(SAG_IN3, ileri);\n  digitalWrite(SAG_IN4, !ileri);\n  float buyukluk = fabs(u);\n  int pwm = 0;\n  if (buyukluk > 0.002) pwm = (OLU_BOLGE + buyukluk * (1.0 - OLU_BOLGE)) * 255 + 0.5;   // ölü bölgeyi atla, yuvarla\n  analogWrite(SOL_EN, pwm);\n  analogWrite(SAG_EN, pwm);\n}\n\nvoid setup() {\n  Wire.begin();\n  Wire.beginTransmission(MPU_ADRES);\n  Wire.write(0x6B);\n  Wire.write(0);\n  Wire.endTransmission(true);\n  Wire.beginTransmission(MPU_ADRES);\n  Wire.write(0x1B);\n  Wire.write(0x08);\n  Wire.endTransmission(true);\n  for (int p = 5; p <= 10; p++) pinMode(p, OUTPUT);\n  sonPlanUs = sonGercekUs = micros();\n}\n\nvoid loop() {\n  unsigned long simdi = micros();\n  unsigned long gecen = simdi - sonPlanUs;\n  if (gecen < PERIYOT_US) return;\n  if (gecen >= 2 * PERIYOT_US) sonPlanUs = simdi;\n  else sonPlanUs += PERIYOT_US;\n  float dt = (simdi - sonGercekUs) / 1000000.0;\n  sonGercekUs = simdi;\n\n  float ivmeAci, hiz;\n  imuOku(ivmeAci, hiz);\n  if (ilk) { aci = ivmeAci; ilk = false; }\n  aci = ALFA * (aci + hiz * dt) + (1 - ALFA) * ivmeAci;\n\n  motorSur(KP * aci + KD * hiz);      // açı ve hız PD'si; ayrıntısı 104'te\n}\n```\n\n| Periyot | Sonuç (8 saniye) |\n|---|---|\n| 5 ms (200 Hz) | Ayakta; en büyük eğim 3,0° (başlangıçtaki), sonda 0° |\n| 20 ms (50 Hz) | Ayakta; en büyük eğim 3,0°, sonda 0° |\n| 60 ms | Ayakta kalıyor ama büyük salınım yapıyor: en büyük eğim 16,5° |\n| 100 ms | Neredeyse düşüyor: en büyük eğim 43,9°, 45° sınırının hemen altı |\n| 150 ms | Düşüyor (0,3 saniyede) |\n\nKural: kontrol periyodu, robotun devrilme zaman ölçeğinden (101'de gördüğümüz gibi 0,7 saniye) çok daha kısa olmalıdır. Gerçek robotlarda genelde 5-10 ms seçilir; bu kursta 5 ms kullanıyoruz.\n\n### Dene\n- `delay_dongusu`'ndaki `delay(5)` yerine `delay(1)` yaz. Tur süresi ne oldu? İşin süresi hâlâ ekleniyor mu?\n- `sabit_dongu`'da `PERIYOT_US`'yi 2000 yap (500 Hz). Tur kaçmaya başlıyor mu? İşin süresini ölçerek en hızlı güvenli periyodu bul.\n- `denge_sabit`'te `PERIYOT_US`'yi 20000, 60000 ve 100000 yap. Robot ne zaman titremeye, ne zaman düşmeye başlıyor?\n\n### Sık yapılan hatalar\n- `delay(5)` ile \"200 Hz döngü\" yaptığını sanmak: tur süresi 5 ms + işin süresidir ve her turda değişir.\n- `sonPlanUs = simdi` yazmak: küçük gecikmeler birikir, periyot hedeften uzaklaşır.\n- `micros()` farkını `int` ile almak: `int` AVR'de 16 bittir ve 32,7 ms'de taşar. `unsigned long` kullan.\n- Kontrol döngüsünün içine çok fazla `Serial.print` koymak: 115200 baudda bile uzun satırlar tamponu doldurup turu geciktirir. Ölçüm için seyrek yazdır (yukarıdaki gibi her 100 turda bir).\n- Döngüyü yalnızca hızlı yapıp ölçmemek: tasma sayacı yoksa kaçan turlar fark edilmez.\n\n### Gerçek robotta farklı olabilecekler\nBenzetimdeki zamanlama neredeyse kusursuzdur: sabit periyot ±4 µs içinde tutuyor. Gerçek kartta kesmeler (örneğin enkoder, ders 92), `Serial` ve I2C kilitlenmeleri tur süresini daha çok oynatır ve I2C hızı (`Wire.setClock(400000)`) tur süresini kısaltabilir; bunu kendi kartında ölç.",
          "question": "Kontrol döngün 200 Hz'de çalışırken her turda 12 ms süren bir iş (örneğin uzun bir `Serial.print`) eklenirse robot ne yapar? Bu işi nereye taşırdın?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Kontrol döngüsünde `dt` neden önemlidir ve yanlış `dt` neyi bozar\n- `delay(5)` ile \"5 ms'de bir çalışan döngü\" arasındaki farkı\n- `micros()` ile planlanan zamana göre sabit periyotlu döngü yazmayı\n- Taşmayı (kaçan turu) ve `micros()` sarmasını doğru yönetmeyi\n\n### Önceden bilmen gerekenler\nModül 3'ten `millis()` ile bloklamayan zamanlama ve `unsigned long` farkı (27. ders). 102. dersten açının `aci += hiz * dt` ile toplanması ve filtredeki `dt`. Hertz ve milisaniye dönüşümü: 200 Hz = 5 ms.\n\n### dt'ye bağlı üç şey\nKontrol kodunda `dt` üç yerde geçer: jiroskop integrali (`aci += hiz * dt`), tamamlayıcı filtrenin zaman sabiti ve PID'nin türev ile integral terimleri. `dt` yanlışsa açı orantılı olarak yanlış çıkar. Örnek: jiroskop sabit 50 °/s dönerken tur gerçekte 5,35 ms sürüyor ama sen `dt = 0,005` varsayıyorsan, 4 saniyede gerçek 200° yerine yaklaşık 186,9° bulursun (yüzde 6,5 eksik).\n\n### delay() sabit periyot vermez\n`delay(5)` \"5 ms bekle\" demektir. Turun geri kalanı (I2C okuma, hesaplar, `Serial.print`) bunun **üstüne** eklenir. Tur süresi `5 ms + işin süresi` olur ve iş her turda aynı sürmez.\n\n### Planlanan zamana göre döngü\nÇözüm, bir sonraki turun **planlanan** zamanını tutmaktır:\n\n```\nif (micros() - sonPlanUs < PERIYOT_US) return;\nsonPlanUs += PERIYOT_US;\n```\n\n`+=` küçük gecikmelerin birikmesini önler. `sonPlanUs = micros()` yazarsan her gecikme bir sonrakine eklenir ve periyot hedeften uzaklaşır. Döngü işe yalnız süre dolunca girer, aralarda `loop()` boş döner; bekleme yoktur.\n\n### Taşma ve sarma\nİş bir turdan uzun sürerse tur **kaçar**. Bu durumu fark etmek için fark iki periyodu aşınca bir sayaç artırır, planı yeniden eşitlersin. Gerçek `dt`'yi yine de ölçersin, böylece filtre ve integral yanlış beslenmez.\n\n`micros()` 32 bitlik `unsigned long` sayar ve yaklaşık 71,6 dakikada başa sarar. Çıkarma `unsigned long` ile yapılırsa sarmada da doğru fark çıkar. `int` kullanırsan AVR'de 16 bit olduğu için 32,7 ms'den uzun farklarda taşar.\n\n### Ne kadar hızlı?\nPeriyot, robotun devrilme zaman ölçeğinden çok kısa olmalıdır. Benzetimde kontrolsüz robot 1 saniyeden kısa sürede düşüyor; 5 ms ve 20 ms'de robot dengede, 60 ms'de büyük salınım, 150 ms'de düşüyor. Gerçek robotlarda genelde 5-10 ms seçilir.\n\n### Özet\n`delay()` tur süresini işin süresi kadar uzatır. Sabit periyot için planlanan zamanı `+=` ile ilerlet, kaçan turu say, gerçek `dt`'yi ölç ve farkları `unsigned long` ile al. Yavaş bir kontrol döngüsü robotu dengeden çıkarır.",
          "concepts": [
            {
              "term": "dt",
              "definition": "İki ölçüm arasındaki gerçek süre (saniye). Açı integrali, filtre ve PID'nin türev ile integral terimleri ona bağlıdır.",
              "example": "Tur 5,35 ms sürerken dt = 0,005 varsaymak, açıyı yaklaşık %6,5 eksik hesaplatır.",
              "pitfall": "dt'yi sabit yazıp döngünün gerçekte o sürede dönmediğini ölçmemek."
            },
            {
              "term": "delay() ile periyot",
              "definition": "delay(5) yalnız 5 ms bekler; turun işi bunun üstüne eklenir, tur süresi iş kadar uzar ve değişir.",
              "example": "I2C okuma ve hesap 0,35 ms sürerse tur 5,35 ms olur.",
              "pitfall": "delay(5) ile \"200 Hz döngü\" yaptığını sanmak."
            },
            {
              "term": "Planlanan zaman (+=)",
              "definition": "Bir sonraki turun zamanını tutup her turda ona periyot eklemek; küçük gecikmeler birikmez.",
              "example": "sonPlanUs += 5000; her tur 5000 µs aralıkla planlanır.",
              "pitfall": "sonPlanUs = simdi yazmak: her gecikme bir sonrakine eklenir ve periyot hedeften uzaklaşır."
            },
            {
              "term": "Taşma (kaçan tur)",
              "definition": "İş bir turdan uzun sürünce tur kaçar. Sayaçla fark edilir, plan yeniden eşitlenir ve gerçek dt yine ölçülür.",
              "example": "12 ms'lik ağır iş 5 ms periyotta bir turu kaçırır.",
              "pitfall": "Taşma sayacı tutmamak: kaçan turlar fark edilmez ve robot nedensiz sallanır."
            },
            {
              "term": "micros() sarması",
              "definition": "micros() 32 bit sayar ve yaklaşık 71,6 dakikada başa sarar. Çıkarma unsigned long ile yapılırsa sarmada da doğru fark çıkar.",
              "example": "simdi = 50 ve sonUs = 4294967000 iken unsigned fark 346 µs eder.",
              "pitfall": "Farkı int ile almak: AVR'de int 16 bittir ve 32,7 ms'den uzun farklarda taşar."
            }
          ],
          "quiz": [
            {
              "id": "m5h6d3-q1",
              "kind": "mcq",
              "prompt": "Bir kontrol döngüsünün sonunda delay(5) var. Döngü hakkında hangisi doğrudur?",
              "options": [
                "Tur her zaman tam 5 ms sürer",
                "Tur 5 ms artı turdaki işin süresi kadar sürer ve her turda değişebilir",
                "Tur 5 ms'den kısa sürer, çünkü delay işlemciyi hızlandırır",
                "delay(5) bir kesme kurar ve her 5 ms'de bir çalışır"
              ],
              "answer": 1,
              "explanation": "delay bekleme süresini turun işine ekler: I2C okuma, hesap ve Serial.print'in süresi 5 ms'nin üstüne biner. Bu yüzden tur süresi ne tam 5 ms ne de sabittir. Benzetimde ortalama 5,35 ms, en uzun 6,64 ms ölçüldü.",
              "skills": [
                "ctrl-fixed-period",
                "prog-timing"
              ]
            },
            {
              "id": "m5h6d3-q2",
              "kind": "numeric",
              "prompt": "Jiroskop 4 saniye boyunca sabit 50 °/s dönüyor (gerçek açı 200°). Döngü gerçekte 5,35 ms'de bir dönüyor ama kod aci += hiz * 0.005 yazıyor. Kod kaç derece bulur?",
              "answer": 186.9,
              "tolerance": 0.5,
              "unit": "°",
              "explanation": "Tur sayısı 4 / 0,00535 ≈ 747,7; her tur 50·0,005 = 0,25° ekler: 747,7·0,25 ≈ 186,9°. Eksik bulunan oran 5/5,35 = %93,5; yani yaklaşık %6,5 hata. Gerçek dt ölçülseydi tam 200° çıkardı.",
              "skills": [
                "ctrl-fixed-period"
              ]
            },
            {
              "id": "m5h6d3-q3",
              "kind": "numeric",
              "prompt": "micros() 32 bit (0 ile 4 294 967 295 arası) mikrosaniye sayar. Kart açıldıktan kaç dakika sonra başa sarar?",
              "answer": 71.6,
              "tolerance": 0.1,
              "unit": "dk",
              "explanation": "2^32 µs = 4 294,97 saniye ≈ 71,6 dakikadır. Çıkarma unsigned long ile yapılırsa sarma anında bile iki ölçüm arasındaki fark doğru çıkar; sorun yalnız farkı int gibi küçük bir türde almaktır.",
              "skills": [
                "ctrl-fixed-period",
                "prog-timing"
              ]
            },
            {
              "id": "m5h6d3-q4",
              "kind": "find-bug",
              "prompt": "Bu döngü hedef 5 ms iken zamanla 5 ms'den daha seyrek çalışmaya başlıyor. Hangi satır hatalı?\n\n```\n1  unsigned long simdi = micros();\n2  if (simdi - sonPlanUs < PERIYOT_US) return;\n3  sonPlanUs = simdi;\n4  islemYap();\n```",
              "options": [
                "1. satır: micros() yerine millis() kullanılmalı",
                "2. satır: < yerine > yazılmalı",
                "3. satır: sonPlanUs += PERIYOT_US olmalı; simdi atamak gecikmeleri biriktirir",
                "4. satır: islemYap() döngü dışında çağrılmalı"
              ],
              "answer": 2,
              "explanation": "Döngü, süre dolduktan bir miktar sonra bile işe girebilir. sonPlanUs = simdi yazınca bu gecikme bir sonraki turun başlangıcına eklenir ve periyot sürekli uzar. += ile planlanan an sabit adımlarla ilerler, gecikme birikmez. 2. satırdaki karşılaştırma doğrudur.",
              "skills": [
                "ctrl-fixed-period",
                "prog-debug"
              ]
            },
            {
              "id": "m5h6d3-q5",
              "kind": "predict-output",
              "prompt": "micros() başa sardıktan hemen sonra bu kod çalışıyor. Ne yazar?\n\n```\nunsigned long simdi = 50;             // sarmadan sonra\nunsigned long sonUs = 4294967000UL;  // sarmadan önce\nSerial.println(simdi - sonUs);\n```",
              "options": [
                "-4294966950",
                "346",
                "4294966950",
                "Derleme hatası olur"
              ],
              "answer": 1,
              "explanation": "unsigned long 2^32 üzerinden hesaplanır: 50 - 4294967000 = -4294966950, buna 4294967296 eklenince 346 olur. Yani sarmadan 296 µs önce ve 50 µs sonra alınan iki ölçüm arasında 346 µs vardır. Eksi işaret çıkmaz çünkü tür işaretsizdir.",
              "skills": [
                "ctrl-fixed-period",
                "prog-timing"
              ]
            }
          ]
        },
        {
          "title": "Kaskad PID: açı ve hız",
          "durationMin": 30,
          "problem": "Önceki derslerde robot ayakta kaldı ama bir şey fark ettin mi: robotun **nerede** durduğuna hiç bakmadık. Gerçekte ağırlık merkezi tam ortada olmaz, sensör tam dik takılmaz. Robot ayakta durur ama yavaşça bir yöne süzülür; masanın kenarına varınca düşer. Sadece açıyı düzelten bir kontrol bunu fark edemez. Çözüm: iki kontrolcüyü üst üste koymak. Biri açıyı, diğeri robotun yerini ve hızını izler.",
          "contentMd": "### Devre\nÖnceki derslerle aynı. MPU6050 (SDA **A4**, SCL **A5**, adres 0x68); sol motor EN **D5**, IN1 **D7**, IN2 **D8**; sağ motor EN **D6**, IN3 **D9**, IN4 **D10**. Motorlar için harici güç kullan ve motor sürücünün GND'sini Arduino GND'sine bağla (ortak GND).\n\n**Önemli (hatırlatma):** `KP = 0,15`, `KD = 0,02` ve dış döngü kazançları **benzetimdeki robota** göre ayarlandı. Gerçek robotta motor gücü, tekerlek çapı, kütle ve yükseklik farklıdır; kazançları yeniden ayarlaman gerekir. Aynı yapıyı (iç döngü açı, dış döngü konum/hız) korursun, sayıları değiştirirsin.\n\n### Tek döngü neden yetmiyor?\nŞimdiye kadarki kontrol bir **açı PD**'siydi: `komut = KP · açı + KD · açıHızı`. Hedef hep 0°. Bu iş ayakta tutar. Ama robotun gerçekten dengede durduğu açı 0° olmayabilir: sensör 4° kaymış takılmışsa (ya da ağırlık merkezi önde/arkadaysa) sensörün \"0°\" dediği nokta gerçek denge noktası değildir. PD sensörün 0°'sine gitmeye çalışır, robot gerçekte biraz eğik kalır ve eğik robot ayakta kalmak için sürekli aynı yöne sürmek zorunda olur. Sonuç: **süzülme**.\n\nBenzetimde sensörü 4° kaymış yaptık (ivmeölçer montaj hatası) ve robotu 15 saniye izledik. Arena etkinliğinde de ivmeölçer 4° kaymış takılıdır: yalnız **okunan** değer 4° bozulur, robotun gerçek eğimi bozulmaz. Bu, gerçek robotta sensörün yamuk takılmasının tam karşılığıdır; arenadaki sayılar aşağıdaki tablolarla aynı çıkar.\n\n### Program 1: yalnız açı PD'si (ve konumu izleyen yazdırma)\nBu benzetimde robotun enkoderi yok. Konumu, motora verdiğimiz komuttan tahmin ediyoruz: model tekerlek hızını yaklaşık `0,5 · komut` (m/s) olarak veriyor. Gerçek robotta konum ve hız enkoderden (ders 92) gelir; komuttan tahmin etmek yalnız bu benzetim için bir kısayoldur ve tekerlek kayınca yanlış olur.\n\n```cpp\n// sketch: pd_aci\n#include <Wire.h>\n\nconst int MPU_ADRES = 0x68;\nconst int SOL_EN = 5, SOL_IN1 = 7, SOL_IN2 = 8;     // sol motor\nconst int SAG_EN = 6, SAG_IN3 = 9, SAG_IN4 = 10;    // sağ motor\n\nconst unsigned long PERIYOT_US = 5000;   // iç döngü: 5 ms (200 Hz)\nconst float ALFA = 0.98;\n\n// İç döngü (açı PD) -- BENZETİM robotuna göre\nconst float KP = 0.15;                   // komut / derece\nconst float KD = 0.02;                   // komut / (derece/s)\nconst float HIZ_KATSAYI = 0.5;           // benzetimde: tekerlek hızı (m/s) ≈ 0,5 · komut (yalnız konumu YAZDIRMAK için)\nconst float OLU_BOLGE = 0.08;\n\nfloat aci = 0;\nbool ilk = true;\nfloat sonKomut = 0;                      // en son motora verilen komut\nfloat konumTahmin = 0;                   // m\nunsigned long sonPlanUs = 0;\nunsigned long sonGercekUs = 0;\nunsigned long sonYazdirMs = 0;\n\nint16_t oku16() {\n  uint8_t yuksek = Wire.read();\n  uint8_t alcak = Wire.read();\n  return (int16_t)(((uint16_t)yuksek << 8) | alcak);\n}\n\nvoid imuOku(float &ivmeAci, float &hiz) {\n  Wire.beginTransmission(MPU_ADRES);\n  Wire.write(0x3B);\n  Wire.endTransmission(false);\n  Wire.requestFrom(MPU_ADRES, 14, true);\n  int16_t axHam = oku16();\n  oku16();\n  int16_t azHam = oku16();\n  oku16();\n  oku16();\n  int16_t gyHam = oku16();\n  oku16();\n  ivmeAci = atan2((float)axHam, (float)azHam) * 57.2958;\n  hiz = gyHam / 65.5;\n}\n\nvoid motorSur(float u) {                 // u: -1 ... +1\n  u = constrain(u, -1.0, 1.0);\n  bool ileri = (u >= 0);\n  digitalWrite(SOL_IN1, ileri);\n  digitalWrite(SOL_IN2, !ileri);\n  digitalWrite(SAG_IN3, ileri);\n  digitalWrite(SAG_IN4, !ileri);\n  float buyukluk = fabs(u);\n  int pwm = 0;\n  if (buyukluk > 0.002) pwm = (OLU_BOLGE + buyukluk * (1.0 - OLU_BOLGE)) * 255 + 0.5;\n  analogWrite(SOL_EN, pwm);\n  analogWrite(SAG_EN, pwm);\n}\n\nvoid setup() {\n  Serial.begin(115200);\n  Wire.begin();\n  Wire.beginTransmission(MPU_ADRES);\n  Wire.write(0x6B);\n  Wire.write(0);\n  Wire.endTransmission(true);\n  Wire.beginTransmission(MPU_ADRES);\n  Wire.write(0x1B);\n  Wire.write(0x08);\n  Wire.endTransmission(true);\n  for (int p = 5; p <= 10; p++) pinMode(p, OUTPUT);\n  sonPlanUs = sonGercekUs = micros();\n}\n\nvoid loop() {\n  unsigned long simdi = micros();\n  unsigned long gecen = simdi - sonPlanUs;\n  if (gecen < PERIYOT_US) return;\n  if (gecen >= 2 * PERIYOT_US) sonPlanUs = simdi;\n  else sonPlanUs += PERIYOT_US;\n  float dt = (simdi - sonGercekUs) / 1000000.0;\n  sonGercekUs = simdi;\n\n  float ivmeAci, hiz;\n  imuOku(ivmeAci, hiz);\n  if (ilk) { aci = ivmeAci; ilk = false; }\n  aci = ALFA * (aci + hiz * dt) + (1 - ALFA) * ivmeAci;\n\n  // Yalnız açı PD'si. Hedef açı hep 0.\n  sonKomut = KP * aci + KD * hiz;\n  motorSur(sonKomut);\n\n  // Konumu yalnız İZLİYORUZ, kontrol etmiyoruz: hız tahmini = 0,5 · komut\n  konumTahmin += HIZ_KATSAYI * sonKomut * dt;\n\n  if (millis() - sonYazdirMs >= 1000) {\n    sonYazdirMs = millis();\n    Serial.print(millis());\n    Serial.print(',');\n    Serial.print(aci, 2);\n    Serial.print(',');\n    Serial.println(konumTahmin, 3);\n  }\n}\n```\n\nÇıktının sütunları: zaman (ms), süzülmüş açı (°), tahmini konum (m).\n\nBenzetimde ölçtüğümüz (sensör 4° kaymış, 15 saniye):\n| Zaman | Gerçek konum (benzetimden) |\n|---|---|\n| 5 sn | −0,053 m |\n| 10 sn | −0,110 m |\n| 15 sn | −0,166 m |\n\nRobot düşmedi, en büyük eğim 4,2° oldu. Gerçek eğim yaklaşık −4,15°'de kaldı (sensör \"0°\" diyor) ve robot yaklaşık **1,1 cm/s** hızla durmadan süzüldü: 15 saniyede 16,6 cm. Aynı kodu sensör kaymasız çalıştırınca 15 saniyede konum 0,001 m kaldı; yani süzülmenin sebebi PD'nin kendisi değil, denge noktasının 0° olmaması. Programın yazdığı tahmini konum gerçek konumdan 2 cm'den az saptı.\n\n### Fikir: iki döngü, iç içe\n**Kaskad** kontrol, iki PID/PD'yi zincirler: dış döngünün çıkışı, iç döngünün hedefi olur.\n\n| | Dış döngü (konum ve hız) | İç döngü (açı) |\n|---|---|---|\n| Girdi | Tahmini konum ve hız | Süzülmüş açı ve açı hızı |\n| Çıktı | **Hedef açı** | Motor komutu |\n| Hız | Yavaş: 20 ms (50 Hz) | Hızlı: 5 ms (200 Hz) |\n\nMantık: robot ileri süzülüyorsa dış döngü hedef açıyı **geri** (negatif) yapar; iç döngü robotu o açıya getirmek için tekerlekleri önce ileri sürer, robot geri eğilir ve sonra geri yönde hareket eder. Böylece konum 0'a doğru çekilir. Dış döngü açıyı doğrudan düzeltmez; iç döngüye \"şu açıda dur\" der.\n\n**Neden dış döngü yavaş olmalı?** İç döngü bir hedef açıya oturmak için zamana ihtiyaç duyar. Dış döngü hedefi her turda değiştirirse iç döngü hedefi yakalayamadan hedef kaymış olur ve ikisi birbirini kovalar. Kural: dış döngü, iç döngüden yaklaşık 5-10 kat yavaş olmalıdır. Aşağıda bunu ölçeceğiz.\n\n### Program 2: kaskad denge\n```cpp\n// sketch: kaskad_denge\n#include <Wire.h>\n\nconst int MPU_ADRES = 0x68;\nconst int SOL_EN = 5, SOL_IN1 = 7, SOL_IN2 = 8;     // sol motor\nconst int SAG_EN = 6, SAG_IN3 = 9, SAG_IN4 = 10;    // sağ motor\n\nconst unsigned long PERIYOT_US = 5000;   // iç döngü: 5 ms (200 Hz)\nconst int DIS_ORAN = 4;                  // dış döngü: her 4 turda bir = 20 ms (50 Hz)\nconst float ALFA = 0.98;\n\n// İç döngü (açı PD) -- BENZETİM robotuna göre\nconst float KP = 0.15;                   // komut / derece\nconst float KD = 0.02;                   // komut / (derece/s)\n// Dış döngü (konum + hız -> hedef açı) -- BENZETİM robotuna göre\nconst float KX = -60.0;                  // derece / metre\nconst float KV = -150.0;                 // derece / (metre/saniye)\nconst float HEDEF_SINIR = 6.0;           // hedef açı en çok ±6°\nconst float HIZ_KATSAYI = 0.5;           // benzetimde: tekerlek hızı (m/s) ≈ 0,5 · komut\nconst float OLU_BOLGE = 0.08;\n\nfloat aci = 0;\nbool ilk = true;\nfloat sonKomut = 0;                      // en son motora verilen komut\nfloat hizTahmin = 0;                     // m/s\nfloat konumTahmin = 0;                   // m\nfloat hedefAci = 0;                      // dış döngünün çıkışı, iç döngünün girişi\nint disSayac = 0;\nunsigned long sonPlanUs = 0;\nunsigned long sonGercekUs = 0;\nunsigned long sonYazdirMs = 0;\n\nint16_t oku16() {\n  uint8_t yuksek = Wire.read();\n  uint8_t alcak = Wire.read();\n  return (int16_t)(((uint16_t)yuksek << 8) | alcak);\n}\n\nvoid imuOku(float &ivmeAci, float &hiz) {\n  Wire.beginTransmission(MPU_ADRES);\n  Wire.write(0x3B);\n  Wire.endTransmission(false);\n  Wire.requestFrom(MPU_ADRES, 14, true);\n  int16_t axHam = oku16();\n  oku16();\n  int16_t azHam = oku16();\n  oku16();\n  oku16();\n  int16_t gyHam = oku16();\n  oku16();\n  ivmeAci = atan2((float)axHam, (float)azHam) * 57.2958;\n  hiz = gyHam / 65.5;\n}\n\nvoid motorSur(float u) {                 // u: -1 ... +1\n  u = constrain(u, -1.0, 1.0);\n  bool ileri = (u >= 0);\n  digitalWrite(SOL_IN1, ileri);\n  digitalWrite(SOL_IN2, !ileri);\n  digitalWrite(SAG_IN3, ileri);\n  digitalWrite(SAG_IN4, !ileri);\n  float buyukluk = fabs(u);\n  int pwm = 0;\n  if (buyukluk > 0.002) pwm = (OLU_BOLGE + buyukluk * (1.0 - OLU_BOLGE)) * 255 + 0.5;\n  analogWrite(SOL_EN, pwm);\n  analogWrite(SAG_EN, pwm);\n}\n\nvoid setup() {\n  Serial.begin(115200);\n  Wire.begin();\n  Wire.beginTransmission(MPU_ADRES);\n  Wire.write(0x6B);\n  Wire.write(0);\n  Wire.endTransmission(true);\n  Wire.beginTransmission(MPU_ADRES);\n  Wire.write(0x1B);\n  Wire.write(0x08);\n  Wire.endTransmission(true);\n  for (int p = 5; p <= 10; p++) pinMode(p, OUTPUT);\n  sonPlanUs = sonGercekUs = micros();\n}\n\nvoid loop() {\n  unsigned long simdi = micros();\n  unsigned long gecen = simdi - sonPlanUs;\n  if (gecen < PERIYOT_US) return;\n  if (gecen >= 2 * PERIYOT_US) sonPlanUs = simdi;\n  else sonPlanUs += PERIYOT_US;\n  float dt = (simdi - sonGercekUs) / 1000000.0;\n  sonGercekUs = simdi;\n\n  float ivmeAci, hiz;\n  imuOku(ivmeAci, hiz);\n  if (ilk) { aci = ivmeAci; ilk = false; }\n  aci = ALFA * (aci + hiz * dt) + (1 - ALFA) * ivmeAci;\n\n  // DIŞ DÖNGÜ: yavaş. Hız ve konumu tahmin et, hedef açıyı belirle.\n  disSayac++;\n  if (disSayac >= DIS_ORAN) {\n    disSayac = 0;\n    hizTahmin = HIZ_KATSAYI * sonKomut;\n    hedefAci = constrain(KX * konumTahmin + KV * hizTahmin, -HEDEF_SINIR, HEDEF_SINIR);\n  }\n\n  // İÇ DÖNGÜ: hızlı. Açıyı hedef açıda tut.\n  sonKomut = KP * (aci - hedefAci) + KD * hiz;\n  motorSur(sonKomut);\n  konumTahmin += HIZ_KATSAYI * sonKomut * dt;   // konum: her turda topla (hız tahmini x dt)\n\n  if (millis() - sonYazdirMs >= 1000) {\n    sonYazdirMs = millis();\n    Serial.print(millis());\n    Serial.print(',');\n    Serial.print(aci, 2);\n    Serial.print(',');\n    Serial.print(hedefAci, 2);\n    Serial.print(',');\n    Serial.println(konumTahmin, 3);\n  }\n}\n```\n\n### Nasıl çalışıyor?\n1. Her 5 ms'de iç döngü çalışır: süzülmüş açı hesaplanır ve `sonKomut = KP · (aci − hedefAci) + KD · hiz` motorlara gider.\n2. Her 4. turda (20 ms) dış döngü çalışır: `hizTahmin = 0,5 · sonKomut` alınır ve `hedefAci = KX · konum + KV · hız` bulunur (±6° ile sınırlı).\n3. `KX` ve `KV` **negatif**: konum pozitifse (ileri gitmişse) hedef açı negatif olur, yani robot geri yönde hareket eder.\n4. `hedefAci` sınırlıdır; sınır olmasaydı dış döngü robotu iç döngünün toparlayamayacağı kadar eğmeye çalışabilirdi.\n5. Dış döngüyü ayrı bir `if` içinde çalıştırmak, onu iç döngüden yavaş tutmanın en basit yoludur; ikinci bir zamanlayıcıya gerek yok.\n\n### Ölçümler\nAynı sensör kaymasıyla (4°) kaskad, 15 saniyede:\n\n| Zaman | Gerçek konum (benzetimden) |\n|---|---|\n| 5 sn | −0,028 m |\n| 10 sn | −0,038 m |\n| 15 sn | −0,038 m |\n\n- Süzülme **durdu**: son 5 saniyede konum 1 mm'den az değişti (yalnız PD'de 5,6 cm değişiyordu).\n- Gerçek açı 15. saniyede −0,32°; yani robot neredeyse dik durdu (yalnız PD'de −4,15° idi). Sensör hâlâ 4° kaymış ama dış döngü hedef açıyı (15. saniyede +1,7°) ayarlayarak bunu telafi ediyor.\n- En büyük eğim 4,0° oldu, düşme yok.\n- Bedeli: robot başlangıç yerinden yaklaşık 4 cm uzakta duruyor. Dış döngü konumu tam 0'a değil, sensör kaymasını dengeleyecek bir noktaya getirir. Dış döngüye bir integral terimi (Hafta 5, ders 98) eklemek bu kalıcı farkı azaltmak için denenebilecek bir yoldur; bunu burada ölçmedik.\n- Konum tahminimiz komuttan yapıldığı için kusurlu: son kayıtta (14. sn) tahmin −0,072 m, gerçek konum −0,041 m. Tahmin gerçek değerden belirgin biçimde sapabiliyor. Bu bir benzetim özelliği, ama gerçek robotta da komuttan hız tahmin etmek aynı nedenle güvenilmez; enkoder kullan.\n\n### Dış döngü ne kadar yavaş olmalı?\n`DIS_ORAN` değerini değiştirip (dış döngü her kaç iç turda bir çalışsın) son 5 saniyedeki açı salınımını (RMS) ölçtük:\n\n| `DIS_ORAN` | Dış döngü periyodu | Açı salınımı (RMS, 10-15 sn) |\n|---|---|---|\n| 1 | 5 ms (iç döngüyle aynı) | 2,14° |\n| 2 | 10 ms | 2,11° |\n| 4 | 20 ms | 0,30° |\n| 8 | 40 ms | 0,71° |\n\nİç döngüyle aynı hızda (1) ya da 2 kat yavaş (2) olan dış döngüde robot ayakta kalıyor ama sürekli ±3° sallanıyor. 4 kat yavaşta sakinleşiyor. 8 kat yavaşta dış döngü o kadar geç tepki veriyor ki salınım yine biraz artıyor. Yani dış döngü ne iç döngü kadar hızlı ne de çok yavaş olmalı; bu kursta 4 kat yavaş (20 ms) seçtik. Bu sayı benzetimdeki robot için bulundu.\n\n### Dene\n- `KX` ve `KV`'yi 0 yap: kaskad kapanır, program 1'e döner. Süzülme geri gelir mi?\n- `KX`'i −60'tan −120'ye çıkar. Robotun yerine oturması hızlandı mı, daha çok mu sallandı?\n- `DIS_ORAN`'ı 1 yap. Robot ayakta kalıyor ama ne oluyor?\n- `HEDEF_SINIR`'ı 15° yap. Sensör kayması çok büyükse dış döngü neden zararlı olabilir?\n\n### Sık yapılan hatalar\n- Dış döngüyü iç döngüyle aynı hızda çalıştırmak: iki döngü birbirini kovalar, robot sallanır.\n- `KX` ve `KV`'nin işaretini ters koymak: robot süzülmeyi düzeltmek yerine hızlandırır ve düşer. İşareti bulmak için küçük bir değerle dene.\n- Hedef açıyı sınırlamamak.\n- Konumu komuttan tahmin etmeyi gerçek robotta sürdürmek: tekerlek kayar, zemin eğimlidir, tahmin zamanla yanlışlaşır; enkoder kullan.\n- Kazançları gerçek robotta büyükten başlatmak: küçükten başla, dış döngüyü iç döngü oturduktan sonra ekle.\n\n### Gerçek robotta farklı olabilecekler\nBenzetimde komuttan hız tahmin ettik, gerçek robotta enkoderden ölçeriz. Gerçek motorlarda gecikme, geri tepme (dişli boşluğu) ve pil gerilimi düşünce kazanç değişimi vardır. Kazançların hepsi robotuna göre yeniden bulunur.",
          "question": "Dış döngü iç döngüden yavaş olmak zorunda. Peki iç döngü ne kadar hızlı olmalı? Bunu belirleyen şey ne olabilir?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Yalnız açı PD'sinin robotu neden yavaşça süzülmeye bıraktığını\n- Kaskad kontrolün yapısını: dış döngü hedef açıyı, iç döngü motor komutunu üretir\n- Dış döngünün neden iç döngüden daha yavaş çalışması gerektiğini\n- Hedef açıyı sınırlamanın ve işaretleri doğru seçmenin önemini\n\n### Önceden bilmen gerekenler\nHafta 5'ten P ve D terimleri (96-97. dersler) ve integralin neden birikip sorun çıkardığı (98. ders). Bu haftadan 102'deki süzülmüş açı ve 103'teki sabit periyot. `constrain()` kullanımı (14. ders).\n\n### Tek döngü neden yetmez?\nAçı PD'sinin hedefi hep 0°'dir: `komut = KP · açı + KD · açıHızı`. Ama sensörün \"0°\" dediği nokta robotun gerçek denge noktası olmayabilir; sensör yamuk takılmış ya da ağırlık merkezi önde olabilir. Robot biraz eğik durur ve ayakta kalmak için sürekli aynı yöne sürmek zorunda kalır. Sonuç **süzülmedir**: robot düşmez ama yavaşça yürüyüp gider. Benzetimde 4° sensör kayması, 15 saniyede yaklaşık 16,6 cm süzülme demekti.\n\n### Kaskad: iki kontrolcü üst üste\n| | Dış döngü | İç döngü |\n|---|---|---|\n| Girdi | Konum ve hız | Açı ve açı hızı |\n| Çıktı | Hedef açı | Motor komutu |\n| Hız | Yavaş (20 ms) | Hızlı (5 ms) |\n\nDış döngünün çıkışı iç döngünün hedefidir: `komut = KP · (açı − hedefAçı) + KD · açıHızı`. Robot ileri gidiyorsa dış döngü hedef açıyı **negatif** yapar; iç döngü robotu o açıya getirmek için önce ileri sürer, robot geriye yatar ve geri döner. Bu yüzden konum ve hız kazançları (`KX`, `KV`) negatiftir. Yanlış işaret süzülmeyi düzeltmez, hızlandırır.\n\n### Dış döngü neden yavaş olmalı?\nİç döngünün yeni bir hedef açıya oturması zaman alır. Dış döngü hedefi her turda değiştirirse iç döngü yetişemez ve ikisi birbirini kovalar. Kural: dış döngü iç döngüden yaklaşık 5-10 kat yavaş olsun. Bu kursta 5 ms ve 20 ms (4 kat) kullanıyoruz. Aşırı yavaş dış döngü de geç tepki verir; benzetimde 8 kat yavaşta salınım yine arttı.\n\n### Hedef açıyı sınırla\nDış döngünün hedef açısı `±6°` ile sınırlandı. Sınır yoksa büyük bir konum hatası robotu iç döngünün toparlayamayacağı kadar yatmaya zorlar. Örnek: `KX = −60`, `KV = −150`, konum 0,05 m ve hız 0,04 m/s ise hedef −3 − 6 = −9° çıkar; sınır onu −6°'ye indirir.\n\n### Özet\nYalnız açı PD'si robotu ayakta tutar ama yanlış kalibre edilmiş denge noktasında süzülür. Kaskad kontrolde yavaş bir dış döngü konum ve hıza bakıp iç döngüye hedef açı verir. Dış döngü yavaş çalışmalı, çıkışı sınırlanmalı ve kazançları doğru işaretli olmalıdır. Kazanç sayıları benzetimdeki robota aittir; gerçek robotta yeniden ayarlanır.",
          "concepts": [
            {
              "term": "Süzülme",
              "definition": "Sensörün 0° dediği nokta gerçek denge noktası olmadığında robotun düşmeden ama yavaşça aynı yöne gitmesi.",
              "example": "Sensör 4° kaymışsa yalnız açı PD'li robot 15 saniyede yaklaşık 16,6 cm süzüldü.",
              "pitfall": "Süzülmeyi PD'nin hatası sanmak: kayma olmayınca aynı kod yerinde duruyor."
            },
            {
              "term": "Kaskad kontrol",
              "definition": "İki kontrolcüyü zincirlemek: dış döngünün çıkışı iç döngünün hedefi olur.",
              "example": "Dış döngü konumdan hedef açı üretir, iç döngü o açıyı motor komutuna çevirir.",
              "pitfall": "Dış döngünün motoru doğrudan sürmesini beklemek: o yalnız hedef açıyı belirler."
            },
            {
              "term": "Hedef açı",
              "definition": "Dış döngünün ürettiği, iç döngünün tutmaya çalıştığı açı. Komut = KP·(açı − hedefAçı) + KD·açıHızı.",
              "example": "Robot ileri süzülüyorsa hedef açı negatif olur ve robot geri yatıp geri döner.",
              "pitfall": "Hedefi hesaplayıp iç döngüde kullanmamak: kaskad etkisiz kalır."
            },
            {
              "term": "Dış döngünün hızı",
              "definition": "Dış döngü, iç döngüden yaklaşık 5-10 kat yavaş çalışmalıdır ki iç döngü hedefe oturabilsin.",
              "example": "5 ms iç döngü, 20 ms dış döngü (DIS_ORAN = 4).",
              "pitfall": "Dış döngüyü iç döngüyle aynı hızda çalıştırmak: ikisi birbirini kovalar ve robot sallanır."
            },
            {
              "term": "Hedef açı sınırı",
              "definition": "Dış döngünün çıkışını ±6° gibi bir aralıkla kısıtlamak, iç döngünün toparlayamayacağı yatışı önler.",
              "example": "KX·konum + KV·hız = -9° ise sınır onu -6°'ye indirir.",
              "pitfall": "Hedefi sınırlamamak ya da sınırı çok geniş seçmek: sensör kayması büyükse robot gereğinden çok yatar."
            }
          ],
          "quiz": [
            {
              "id": "m5h6d4-q1",
              "kind": "mcq",
              "prompt": "Kaskad denge kontrolünde dış döngünün çıkışı nedir?",
              "options": [
                "Motorlara giden PWM değeri",
                "Jiroskop sapması",
                "Hedef açı; iç döngü bu açıyı tutmaya çalışır",
                "Dış döngünün kendi periyodu"
              ],
              "answer": 2,
              "explanation": "Dış döngü konum ve hıza bakıp hedef açıyı belirler, iç döngü o açıyı motor komutuna çevirir. Motor PWM'ini iç döngü üretir; dış döngü motorla doğrudan konuşmaz.",
              "skills": [
                "ctrl-cascade"
              ]
            },
            {
              "id": "m5h6d4-q2",
              "kind": "predict-output",
              "prompt": "İç döngünün bir turu çalışıyor. Bu kod ne yazar?\n\n```\nfloat KP = 0.15, KD = 0.02;\nfloat aci = 2.0, hedefAci = -1.0, hiz = 10.0;\nfloat komut = KP * (aci - hedefAci) + KD * hiz;\nSerial.println(komut, 2);\n```",
              "options": [
                "0.35",
                "0.45",
                "0.50",
                "0.65"
              ],
              "answer": 3,
              "explanation": "aci - hedefAci = 2 - (-1) = 3 ve KP·3 = 0,45. KD·hiz = 0,02·10 = 0,20. Toplam 0,65. 0.35 hedef açının işaretini yanlış almak, 0.50 hedef açıyı hiç kullanmamak (0,15·2 + 0,20), 0.45 ise KD terimini unutmak olurdu.",
              "skills": [
                "ctrl-cascade"
              ]
            },
            {
              "id": "m5h6d4-q3",
              "kind": "numeric",
              "prompt": "KX = -60 derece/metre, KV = -150 derece/(m/s), HEDEF_SINIR = 6°. Konum 0,05 m ve hız 0,04 m/s iken dış döngü hedef açıyı kaç derece verir?",
              "answer": -6,
              "tolerance": 0,
              "unit": "°",
              "explanation": "KX·konum = -3° ve KV·hız = -6°; toplam -9°. Bu değer ±6° sınırını aştığı için constrain onu -6°'ye kısar. Sınır olmasaydı iç döngü toparlayamayacağı kadar büyük bir yatış isteyecekti.",
              "skills": [
                "ctrl-cascade",
                "robot-tuning"
              ]
            },
            {
              "id": "m5h6d4-q4",
              "kind": "find-bug",
              "prompt": "Dış döngü hedef açıyı hesaplıyor ama robot süzülmeye devam ediyor. Hangi satır hatalı?\n\n```\n1  hedefAci = constrain(KX * konumTahmin + KV * hizTahmin, -HEDEF_SINIR, HEDEF_SINIR);\n2  sonKomut = KP * aci + KD * hiz;\n3  motorSur(sonKomut);\n```",
              "options": [
                "1. satır: constrain kaldırılmalı",
                "2. satır: hedefAci iç döngüde kullanılmıyor; KP * (aci - hedefAci) olmalı",
                "3. satır: motorSur çağrılmamalı",
                "1. satır: KX pozitif olmalı"
              ],
              "answer": 1,
              "explanation": "Hedef açı hesaplanıyor ama komuta girmiyor; iç döngü hâlâ sıfır dereceyi hedefliyor ve kaskad etkisiz. İç döngü KP * (aci - hedefAci) kullanmalı. constrain güvenlik için gereklidir; KX negatif olması doğrudur.",
              "skills": [
                "ctrl-cascade",
                "prog-debug"
              ]
            },
            {
              "id": "m5h6d4-q5",
              "kind": "mcq",
              "prompt": "Dış döngüyü iç döngüyle aynı hızda (her 5 ms'de) çalıştırırsan ne beklersin?",
              "options": [
                "İki döngü birbirini kovalar; robot ayakta kalabilir ama sürekli sallanır",
                "Robot daha hızlı oturur ve süzülme tamamen biter",
                "Hiçbir fark olmaz",
                "Robot anında düşer, çünkü hedef açı hep sınırda kalır"
              ],
              "answer": 0,
              "explanation": "İç döngü yeni hedefe oturamadan hedef yeniden değişir. Benzetimde bu durumda robot düşmedi ama açı salınımı 2,14° RMS oldu; 4 kat yavaş dış döngüyle 0,30° idi. Dış döngü bu yüzden iç döngüden yavaş olmalıdır.",
              "skills": [
                "ctrl-cascade",
                "robot-tuning"
              ]
            }
          ]
        },
        {
          "title": "Proje: Kendini dengeleyen robot",
          "durationMin": 35,
          "problem": "Bir şeyi tek parmakla dik tutmaya çalıştın mı? Cetvel, süpürge sapı... Düşmeye başladığını gözün görür, elin hemen altına gider. Senin robotun da aynısını yapacak: gözü MPU6050, eli iki motor. Bu haftanın projesinde dengeleyen robotu bütünüyle kuracaksın ve ona bir itme vereceksin. Robot düşmeden toparlanabilecek mi?",
          "contentMd": "### Ne yapacağız?\nBu proje öğrendiklerini birleştirir:\n- **Hafta 6, ders 101-102:** MPU6050'yi ham `Wire` ile oku, tamamlayıcı filtreyle açıyı bul.\n- **Hafta 6, ders 103:** 5 ms'lik sabit periyotlu kontrol döngüsü.\n- **Hafta 6, ders 104:** Kaskad kontrol: iç döngü açıyı, yavaş dış döngü konumu tutar.\n- **Modül 3, ders 28:** Durum makinesi (`enum`): DENGE, KONTROLSUZ, DUSTU.\n- **Hafta 1, ders 77-78:** Motor yönü, PWM ve ölü bölge.\n\nHedefler (benzetimde ölçeceğiz):\n1. Robot 10 saniye boyunca ayakta kalacak.\n2. 3. saniyede ona bir itme vereceğiz. Robot düşmeden toparlanacak.\n3. Robot **en büyük eğimi** ve **oturma süresini** (itmeden sonra eğimin 1°'nin altına inip orada kalması) kendisi raporlayacak.\n4. Karşılaştırma: kontrol kapalıyken robotun ne kadar sürede düştüğünü ölçeceğiz.\n\n### Devre\n| Parça | Bağlantı |\n|---|---|\n| MPU6050 | SDA → **A4**, SCL → **A5**, GND → GND, VCC → modülün belgesindeki gerilim, AD0 → GND (adres 0x68). X ekseni ileri, Z ekseni yukarı |\n| Sol motor (sürücü üzerinden) | EN → **D5** (PWM), IN1 → **D7**, IN2 → **D8** |\n| Sağ motor (sürücü üzerinden) | EN → **D6** (PWM), IN3 → **D9**, IN4 → **D10** |\n| Durum LED'i | **D13** (dahili LED): robot düşünce yanar |\n\n**Güvenlik:** Motorları Arduino'nun 5 V pininden besleme; harici güç kullan ve motor sürücünün GND'sini Arduino GND'sine bağla. Pil kullanırsan kısa devre yapma, ters bağlama; yetişkin gözetiminde çalış. Gerçek robotu ilk denemede havada tut: tekerlekler yere değmeden motorların doğru yöne döndüğünü kontrol et.\n\n### Benzetim ile gerçek robot\n**Önemli:** `KP`, `KD`, `KX`, `KV` ve `HIZ_KATSAYI` sayıları benzetimdeki robota (ters sarkaç modeli: A = 25, B = 80, C = 0,6) göre bulundu. Gerçek robotta bu sayılar işe yaramaz: motor gücü, tekerlek çapı, robotun yüksekliği ve ağırlığı farklıdır. Gerçek robotta kazançları baştan, küçük değerlerle ayarla: önce yalnız `KP`, robot titremeye başlayınca `KD`, en son dış döngü. Programın **yapısı** aynen geçerlidir.\n\nBu benzetimde robotun enkoderi yok; konumu komuttan tahmin ediyoruz. Gerçek robotta enkoder (ders 92) kullan.\n\n### Program\n```cpp\n// sketch: denge_robotu\n#include <Wire.h>\n\nconst int MPU_ADRES = 0x68;\nconst int SOL_EN = 5, SOL_IN1 = 7, SOL_IN2 = 8;     // sol motor\nconst int SAG_EN = 6, SAG_IN3 = 9, SAG_IN4 = 10;    // sağ motor\nconst int DURUM_LED = 13;                           // yanıyorsa robot düştü\n\nconst unsigned long PERIYOT_US = 5000;   // iç döngü: 5 ms (200 Hz)\nconst int DIS_ORAN = 4;                  // dış döngü: 20 ms (50 Hz)\nconst float ALFA = 0.98;                 // tamamlayıcı filtre\n\n// BENZETİM robotuna göre ayarlı kazançlar; gerçek robotta yeniden ayarlanır\nconst float KP = 0.15;                   // komut / derece\nconst float KD = 0.02;                   // komut / (derece/s)\nconst float KX = -10.0;                  // derece / metre\nconst float KV = -25.0;                  // derece / (metre/saniye)\nconst float HEDEF_SINIR = 6.0;           // hedef açı en çok ±6°\nconst float HIZ_KATSAYI = 0.5;           // benzetimde: tekerlek hızı (m/s) ≈ 0,5 · komut\nconst float OLU_BOLGE = 0.08;\n\nconst float DUSME_ACISI = 40.0;          // bu açıyı aşarsak motorları kes\nconst float ITME_ESIGI = 2.0;            // bu kadar sapma = \"itildik\"\nconst float OTURMA_ESIGI = 1.0;          // bundan küçük sapma = \"oturdu\"\nconst unsigned long OTURMA_BEKLEME_MS = 1000;   // bu kadar süre eşik altında kalırsa oturmuş say\nconst unsigned long HAZIR_MS = 2000;     // açılıştaki ilk toparlanmayı itme sanma\n\nenum Durum { DENGE, KONTROLSUZ, DUSTU };\nDurum durum = DENGE;\n\nfloat aci = 0;\nbool ilk = true;\nfloat sonKomut = 0;\nfloat hizTahmin = 0;\nfloat konumTahmin = 0;\nfloat hedefAci = 0;\nint disSayac = 0;\nunsigned long sonPlanUs = 0;\nunsigned long sonGercekUs = 0;\nunsigned long sonYazdirMs = 0;\n\n// Rapor için ölçümler\nbool itildi = false;\nbool raporVerildi = false;\nunsigned long itmeMs = 0;\nunsigned long sonDisariMs = 0;           // eşiğin dışında olduğumuz son an\nfloat maksEgim = 0;\n\nint16_t oku16() {\n  uint8_t yuksek = Wire.read();\n  uint8_t alcak = Wire.read();\n  return (int16_t)(((uint16_t)yuksek << 8) | alcak);\n}\n\nvoid imuOku(float &ivmeAci, float &hiz) {\n  Wire.beginTransmission(MPU_ADRES);\n  Wire.write(0x3B);\n  Wire.endTransmission(false);\n  Wire.requestFrom(MPU_ADRES, 14, true);\n  int16_t axHam = oku16();\n  oku16();\n  int16_t azHam = oku16();\n  oku16();\n  oku16();\n  int16_t gyHam = oku16();\n  oku16();\n  ivmeAci = atan2((float)axHam, (float)azHam) * 57.2958;\n  hiz = gyHam / 65.5;\n}\n\nvoid motorSur(float u) {                 // u: -1 ... +1; 0 = motorlar boşta\n  u = constrain(u, -1.0, 1.0);\n  bool ileri = (u >= 0);\n  digitalWrite(SOL_IN1, ileri);\n  digitalWrite(SOL_IN2, !ileri);\n  digitalWrite(SAG_IN3, ileri);\n  digitalWrite(SAG_IN4, !ileri);\n  float buyukluk = fabs(u);\n  int pwm = 0;\n  if (buyukluk > 0.002) pwm = (OLU_BOLGE + buyukluk * (1.0 - OLU_BOLGE)) * 255 + 0.5;\n  analogWrite(SOL_EN, pwm);\n  analogWrite(SAG_EN, pwm);\n}\n\nvoid setup() {\n  Serial.begin(115200);\n  Wire.begin();\n  Wire.beginTransmission(MPU_ADRES);\n  Wire.write(0x6B);\n  Wire.write(0);\n  Wire.endTransmission(true);\n  Wire.beginTransmission(MPU_ADRES);\n  Wire.write(0x1B);\n  Wire.write(0x08);\n  Wire.endTransmission(true);\n  for (int p = 5; p <= 10; p++) pinMode(p, OUTPUT);\n  pinMode(DURUM_LED, OUTPUT);\n  sonPlanUs = sonGercekUs = micros();\n}\n\nvoid loop() {\n  // 1) Sabit periyot (ders 103)\n  unsigned long simdi = micros();\n  unsigned long gecen = simdi - sonPlanUs;\n  if (gecen < PERIYOT_US) return;\n  if (gecen >= 2 * PERIYOT_US) sonPlanUs = simdi;\n  else sonPlanUs += PERIYOT_US;\n  float dt = (simdi - sonGercekUs) / 1000000.0;\n  sonGercekUs = simdi;\n\n  // 2) Komut: 'k' kontrolü kapatır (kontrolsüz deney)\n  if (Serial.available() && Serial.read() == 'k') durum = KONTROLSUZ;\n\n  // 3) Ölç ve süz (ders 101-102)\n  float ivmeAci, hiz;\n  imuOku(ivmeAci, hiz);\n  if (ilk) { aci = ivmeAci; ilk = false; }\n  aci = ALFA * (aci + hiz * dt) + (1 - ALFA) * ivmeAci;\n\n  // 4) Durum makinesi (ders 28)\n  if (durum != DUSTU && fabs(aci) > DUSME_ACISI) {\n    durum = DUSTU;\n    Serial.print(\"DUSTU,\");\n    Serial.println(millis());\n  }\n\n  if (durum == DENGE) {\n    // Dış döngü: yavaş (ders 104)\n    disSayac++;\n    if (disSayac >= DIS_ORAN) {\n      disSayac = 0;\n      hizTahmin = HIZ_KATSAYI * sonKomut;\n      hedefAci = constrain(KX * konumTahmin + KV * hizTahmin, -HEDEF_SINIR, HEDEF_SINIR);\n    }\n    // İç döngü: hızlı\n    sonKomut = KP * (aci - hedefAci) + KD * hiz;\n    konumTahmin += HIZ_KATSAYI * sonKomut * dt;\n    motorSur(sonKomut);\n  } else {\n    sonKomut = 0;\n    motorSur(0);                         // motorlar kapalı\n    digitalWrite(DURUM_LED, durum == DUSTU);\n  }\n\n  // 5) Ölçüm ve rapor: itme, en büyük eğim, oturma süresi\n  unsigned long ms = millis();\n  if (durum == DENGE && ms > HAZIR_MS) {\n    if (!itildi && fabs(aci) > ITME_ESIGI) {\n      itildi = true;\n      itmeMs = ms;\n    }\n    if (itildi && !raporVerildi) {\n      if (fabs(aci) > maksEgim) maksEgim = fabs(aci);\n      if (fabs(aci) > OTURMA_ESIGI) sonDisariMs = ms;\n      if (ms - sonDisariMs > OTURMA_BEKLEME_MS) {\n        raporVerildi = true;\n        Serial.print(\"RAPOR,\");\n        Serial.print(itmeMs);\n        Serial.print(',');\n        Serial.print(maksEgim, 1);\n        Serial.print(',');\n        Serial.println(sonDisariMs - itmeMs);\n      }\n    }\n  }\n\n  if (ms - sonYazdirMs >= 1000) {        // saniyede bir durum satırı\n    sonYazdirMs = ms;\n    Serial.print(\"T,\");\n    Serial.print(ms);\n    Serial.print(',');\n    Serial.print(aci, 2);\n    Serial.print(',');\n    Serial.println(konumTahmin, 3);\n  }\n}\n```\n\n### Nasıl çalışıyor?\n1. **Sabit periyot (103):** `loop()` yalnız 5 ms dolunca işe girer, `dt` her tur ölçülür.\n2. **Ölçüm ve filtre (101-102):** 14 bayt okunur, ivme açısı ve jiroskop hızı tamamlayıcı filtreye girer.\n3. **Durum makinesi:** DENGE'de kontrol çalışır. Açı 40°'yi geçerse DUSTU durumuna geçilir: motorlar kapanır, LED yanar, `DUSTU` yazdırılır. Seri porttan `k` gelirse KONTROLSUZ durumuna geçilir; bu, kontrolün işe yaradığını görmek için bir deneydir.\n4. **Kaskad (104):** dış döngü 20 ms'de bir hedef açıyı belirler, iç döngü her 5 ms'de bu hedefe yaklaşır. Dış döngü kazançlarını (`KX = −10`, `KV = −25`) 104'tekinden küçük tuttuk. Neden? Aşağıda \"Bu projeden öğrendiklerimiz\" bölümünde.\n5. **Rapor:** 2. saniyeden sonra açı 2°'yi aşınca \"itildik\" sayılır. En büyük eğim izlenir. Açı 1°'nin altında 1 saniye kalırsa oturmuş sayılır ve `RAPOR,itmeAnı,enBüyükEğim,oturmaSüresi` satırı yazdırılır. Oturma süresi, itmeden sonra eğimin 1°'yi son aştığı ana kadar geçen süredir.\n\nSeri çıktıdaki `T,` satırları (saniyede bir): zaman, süzülmüş açı, tahmini konum.\n\n### Ölçümler\nRobotu 3° eğik başlattık. 3. saniyede robotun açısal hızına benzetimden **+200 °/s** ekledik: hafif ama net bir itme. Arena etkinliğinde bu itme 3. saniyede kendiliğinden gelir; ayrıca \"İt\" düğmeleriyle istediğin zaman ileri ya da geri itebilirsin. Arena, itmenin gerçek anını, en büyük eğimini ve oturma süresini ölçer ve robotun `RAPOR` satırını bununla karşılaştırır (itme anı ±100 ms, eğim ±0,6°, oturma ±100 ms).\n\n| Ölçüm | Gerçek (`bal`) | Robotun raporu |\n|---|---|---|\n| İtme anı | 3000 ms | 3010 ms |\n| En büyük eğim | 4,96° | 5,3° |\n| Oturma süresi (eğim 1°'nin altına inip orada kalma) | 177 ms | 175 ms |\n\n- Robot 10 saniye boyunca ayakta kaldı, hiç düşmedi; 10. saniyede konum yalnız 1 cm kaymıştı.\n- Rapordaki eğim gerçekten 0,3° büyük: robot gerçek açıyı değil, süzülmüş açıyı görür ve hızlı hareket sırasında ikisi arasında küçük farklar olabilir. Oturma süresi iki ölçümde de neredeyse aynı.\n- **Kontrolsüz karşılaştırma:** aynı program `k` komutuyla kontrol kapalı çalıştırıldığında robot komuttan **756 ms sonra** devrildi (45° sınırı). Program, 40° eşiğini geçince `DUSTU` yazdı ve LED'i yaktı. Kontrol, robotu 0,76 saniyelik bir düşmeden kurtarıyor; 101'deki 0,71 saniyelik ölçümle uyumlu (orada robot kontrol başlamadan bırakılmıştı).\n- **Ters yönde itme** (−200 °/s) de toparlandı: 4 saniye sonra eğim 0,70°.\n- **Zayıf pil taklidi:** `KP`'yi %30 azaltınca robot yine toparladı (en büyük eğim yine 5,0°).\n- **Jiroskop sapması düzeltilmezse** (1 °/s): robot düşmez ama kalıcı olarak yaklaşık −1,05° eğik kalır, yani oturma eşiğini (1°) aşar. 101'deki açılış kalibrasyonunun neden gerektiğini gösteriyor.\n\n### Bu projeden öğrendiklerimiz\n- **Dış döngü kazancı bir dengedir.** 104'te kullandığımız büyük kazançlar (`KX = −60`, `KV = −150`) sensör kaymasına karşı konumu iyi tutuyordu. Ama aynı kazançlarla yapılan +200 °/s itmeden sonra robot düşmedi, fakat 7 saniye sonra bile eğim RMS 1,5°'nin üzerinde dolandı (yani oturmadı): konum tahminimiz komuttan yapıldığı için hatalıdır ve büyük kazanç bu hatayı büyütür. Burada sensör kaymasız olduğundan küçük kazançlar seçtik. Gerçek robotta konumu enkoderden ölç; tahmin hatası küçülür ve dış döngü kazancını büyütebilirsin.\n- **Çok güçlü itmelerde** robot düşmez ama sakinleşmesi uzar: benzetimde +250 °/s itmeden sonra 7. saniyede bile eğim hâlâ 1°'yi aşıyordu (en büyük eğim 7,6°), +700 °/s'de ise robot düştü.\n- Ayakta kalma payı kazançlara bağlıdır; her sayı benzetimdeki robota özeldir.\n\n### Dene\n- Pil gerilimi düşünce motorlar zayıflar. Benzetimde bunu `KP`'yi %30 azaltarak taklit et. Robot hâlâ toparlıyor mu? En büyük eğim değişti mi?\n- İtmeyi ters yönde ver (`−200 °/s`). Rapor değerleri değişir mi?\n- `KX`'i −60, `KV`'yi −150 yap ve aynı itmeyi ver. Oturma süresi ne oldu?\n- `DUSME_ACISI`'ni 20° yap ve daha büyük bir itme ver. Motorları erken kesmek iyi bir fikir mi?\n- (Gerçek robot) `KP`'yi yarıya indir ve robotu havada tutarak motor tepkisini gözle.\n\n### Sık yapılan hatalar\n- Robotu denge noktasına koymadan başlatmak: filtrenin ilk açısı yanlış olur. Önce elinle dik tut ve gerçek açı 0°'a yakınken gücü ver.\n- Kazançları gerçek robota kopyalamak: benzetimdeki sayılar orada çalışmaz.\n- Motor yön pinlerini ters bağlamak: robot düzeltmek yerine devrilmeyi hızlandırır. İşareti havada dene.\n- Ölü bölgeyi hesaba katmamak (ders 78): küçük komutlarda tekerlek dönmez, robot sallanır.\n- Seri porta döngü içinde çok yazmak: periyot bozulur (103).\n\n### Gerçek robotta farklı olabilecekler\nGerçek robotta motorların tepki süresi, dişli boşluğu, tekerleğin kayması ve pilin gerilimi farklıdır. Bu proje benzetimde çalışır; aynı kodla gerçek bir robotu dengelemek için kazançları baştan ayarlamak, enkoderi eklemek ve güvenlik için (düşünce motorları kesme gibi) ek önlemler almak gerekir.",
          "question": "Robot 10 saniye ayakta kaldı ve itmeyi toparladı. Gerçek bir robotla aynı sonucu almak için sence hangi üç şeyi değiştirmek zorunda kalırsın? Kontrolsüz robotun yaklaşık 0,7 saniyede devrilmesi, döngüye ve motorlara ne gibi şartlar koyuyor?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Dengeleyen robotun tüm parçalarını (okuma, filtre, sabit döngü, kaskad) tek programda birleştirmeyi\n- Düşme algılama ve güvenli duruş için durum makinesi kurmayı\n- Bir kontrol sisteminin başarısını sayıyla ifade etmeyi: en büyük eğim ve oturma süresi\n- Benzetimde çalışan kazançların gerçek robota neden doğrudan taşınamayacağını\n\n### Önceden bilmen gerekenler\nBu haftadan 101 (ham okuma ve sapma), 102 (tamamlayıcı filtre), 103 (sabit periyot) ve 104 (kaskad). Modül 3'ten `enum` ile durum makinesi (28. ders). Hafta 1'den motor yönü, PWM ve ölü bölge (77-78. dersler).\n\n### Her parça bir önceki dersten gelir\nProgram beş adımda döner: sabit periyot bekle, IMU'yu oku ve filtrele, durumu güncelle, kaskad kontrolü çalıştır, ölçümleri raporla. Yeni bir algoritma yok; öğrendiklerini doğru sırayla dizmek var. Sıra önemlidir: açıyı güncellemeden durum kararı vermek ya da kontrolü filtrelenmemiş açıyla yapmak hata yaratır.\n\n### Durum makinesi\nÜç durum yeterlidir:\n\n| Durum | Anlamı | Motorlar |\n|---|---|---|\n| DENGE | Kontrol çalışıyor | Kaskad komutu |\n| KONTROLSUZ | Deney için kontrol kapatıldı | Kapalı |\n| DUSTU | Açı eşiği aştı | Kapalı, LED yanık |\n\nDüşme eşiği iki yönde de geçerli olmalıdır: robot öne de arkaya da düşebilir, bu yüzden açının mutlak değerine bakılır. Düşmüş robotta motorları durdurmak güvenliktir; yatan robotun tekerlekleri boşuna döner ya da robotu savurur.\n\n### Başarıyı sayıyla ölçmek\n\"Robot iyi dengeleniyor\" bir yargıdır. Sayıya çevirmek için üç ölçü kullanılır: **en büyük eğim** (itmede robot ne kadar yattı), **oturma süresi** (itmeden sonra eğimin eşiğin altına inip orada kalması için geçen süre) ve **kontrolsüz düşme süresi** (karşılaştırma). Oturma tanımı açık olmalıdır: bu projede eğim 1°'nin altında 1 saniye kalırsa oturmuş sayılır ve oturma süresi eğimin 1°'yi son aştığı ana kadar geçen süredir.\n\n### Benzetimden gerçek robota\nKazançlar (`KP`, `KD`, `KX`, `KV`) benzetimdeki robota özeldir. Gerçek robotta motor gücü, tekerlek çapı, kütle ve pil farklıdır. Küçük kazançla başla: önce `KP`, robot titremeye başlayınca `KD`, en sonda dış döngü. Konumu komuttan tahmin etmek yalnızca benzetimde kabul edilebilir kısayoldur; gerçek robotta enkoder kullanılır. Jiroskop sapmasını açılışta ölçüp çıkarmazsan robot düşmez ama kalıcı olarak eğik kalır.\n\n### Özet\nDengeleyen robot, bu haftanın dört parçasının birleşimidir: ölçüm, filtre, sabit periyot ve kaskad kontrol. Durum makinesi düşmeyi her iki yönde algılar ve motorları keser. Başarı en büyük eğim ve oturma süresiyle ölçülür. Kazançlar robota özeldir, yapı ise her robotta aynıdır.",
          "concepts": [
            {
              "term": "Durum makinesi (DENGE, KONTROLSUZ, DUSTU)",
              "definition": "Programın her an tek bir durumda olduğu yapı. DENGE'de kontrol çalışır; diğer durumlarda motorlar kapalıdır.",
              "example": "Açı eşiği aşınca program DUSTU durumuna geçer, LED yanar, motorlar kesilir.",
              "pitfall": "DUSTU durumundan hiç çıkmayacağını unutmak: robotu kaldırdıktan sonra yeniden başlatmak gerekir."
            },
            {
              "term": "Düşme eşiği",
              "definition": "Açının mutlak değeri bu sınırı aşarsa robot düşmüş sayılır ve motorlar kesilir.",
              "example": "Benzetimde 40° eşik seçildi; robot 45°'de düşmüş sayılıyor.",
              "pitfall": "Yalnız bir yönü kontrol etmek (aci > eşik): robot geriye düşünce algılanmaz."
            },
            {
              "term": "En büyük eğim",
              "definition": "İtmeden sonra robotun ulaştığı en büyük sapma. Kontrolün tepkisinin ne kadar sert olduğunu gösterir.",
              "example": "+200 °/s itmede gerçek en büyük eğim 4,96° ölçüldü.",
              "pitfall": "Robotun raporunu gerçek değerle birebir aynı beklemek: robot süzülmüş açıyı görür, küçük farklar olur."
            },
            {
              "term": "Oturma süresi",
              "definition": "İtmeden sonra eğimin eşiğin (burada 1°) altına inip orada kalması için geçen süre.",
              "example": "Eğim 1°'yi son kez itmeden 177 ms sonra aştıysa oturma süresi 177 ms'dir.",
              "pitfall": "Eşiğe ilk kez inilen anı oturma saymak: robot eşiği yeniden aşabilir."
            },
            {
              "term": "Kazanç ayarı",
              "definition": "KP, KD, KX ve KV robota özeldir. Gerçek robotta küçük değerlerle başlayıp önce KP, sonra KD, en son dış döngü ayarlanır.",
              "example": "Benzetimdeki KP = 0,15 gerçek bir robotta ya yetersiz kalır ya da titretir.",
              "pitfall": "Benzetim kazançlarını gerçek robota kopyalamak."
            }
          ],
          "quiz": [
            {
              "id": "m5h6d5-q1",
              "kind": "mcq",
              "prompt": "Jiroskop sapmasını açılışta ölçüp çıkarmazsan, dengeleyen robot ne yapar?",
              "options": [
                "Hemen düşer, çünkü hata sonsuza gider",
                "Dengede kalır ama kalıcı bir eğim hatası taşır",
                "Hiçbir fark olmaz",
                "Yalnız dış döngü çalışmaz"
              ],
              "answer": 1,
              "explanation": "Tamamlayıcı filtre sapmanın birikmesini sınırlar, bu yüzden robot düşmez; ama tahmin sapma çarpı zaman sabiti kadar kayar ve robot kalıcı olarak hafif eğik durur. Benzetimde 1 °/s sapma yaklaşık -1,05° eğime yol açtı ve oturma eşiğini aştı.",
              "skills": [
                "imu-gyro",
                "ctrl-state-safety"
              ]
            },
            {
              "id": "m5h6d5-q2",
              "kind": "predict-output",
              "prompt": "Durum makinesi (DENGE, KONTROLSUZ, DUSTU) tanımlı. Açı 45° iken bu kod ne yazar?\n\n```\nDurum durum = DENGE;\nfloat aci = 45.0;\nif (durum != DUSTU && fabs(aci) > 40.0) {\n  durum = DUSTU;\n  Serial.println(\"DUSTU\");\n}\nif (durum == DENGE) Serial.println(\"KONTROL\");\nelse Serial.println(\"MOTOR KAPALI\");\n```",
              "options": [
                "Yalnız KONTROL",
                "DUSTU, sonra KONTROL",
                "DUSTU, sonra MOTOR KAPALI",
                "Yalnız MOTOR KAPALI"
              ],
              "answer": 2,
              "explanation": "Açı 40° eşiğini aşıyor ve durum DUSTU değil; ilk blok çalışır, durum DUSTU olur ve \"DUSTU\" yazılır. Sonraki if artık DENGE olmadığı için else dalına girer: \"MOTOR KAPALI\". Durum güncellemesi kontrol kararından önce olduğu için aynı turda motorlar kapanır.",
              "skills": [
                "ctrl-state-safety"
              ]
            },
            {
              "id": "m5h6d5-q3",
              "kind": "find-bug",
              "prompt": "Robot öne düşünce motorlar kesiliyor ama geriye düşünce kesilmiyor. Hangi satır hatalı?\n\n```\nif (durum != DUSTU && aci > DUSME_ACISI) {\n  durum = DUSTU;\n}\n```",
              "options": [
                "durum != DUSTU koşulu kaldırılmalı",
                "aci > DUSME_ACISI yalnız ileri düşmeyi yakalar; fabs(aci) kullanılmalı",
                "DUSME_ACISI sıfır olmalı",
                "durum = DUSTU yerine durum = DENGE yazılmalı"
              ],
              "answer": 1,
              "explanation": "Geriye düşen robotun açısı negatiftir ve negatif sayı hiçbir zaman pozitif eşikten büyük olmaz. fabs(aci) her iki yönü de yakalar. durum != DUSTU koşulu gereksiz yere yazı yazmayı önler, doğrudur.",
              "skills": [
                "ctrl-state-safety",
                "prog-debug"
              ]
            },
            {
              "id": "m5h6d5-q4",
              "kind": "numeric",
              "prompt": "Projede açı 1°'nin altında 1000 ms'den uzun kalırsa (ms - sonDisariMs > 1000) rapor yazılıyor. Eğim 1°'yi son kez 3185 ms'de aştıysa RAPOR satırı yaklaşık hangi ms'de yazılır? (Döngü 5 ms'de bir çalışır.)",
              "answer": 4188,
              "tolerance": 5,
              "unit": "ms",
              "explanation": "Koşul ms - 3185 > 1000 olunca sağlanır, yani ms 4185'i geçince; 5 ms'lik turlar nedeniyle bu yaklaşık 4186-4190 ms'dir. Raporlanan oturma süresi ise rapor anı değil, eğimin 1°'yi son aştığı ana kadar geçen süredir: itme 3010 ms ise 3185 - 3010 = 175 ms.",
              "skills": [
                "ctrl-state-safety"
              ]
            },
            {
              "id": "m5h6d5-q5",
              "kind": "mcq",
              "prompt": "Benzetimde çalışan KP, KD, KX ve KV değerlerini aynen gerçek bir robota yazarsan ne olur?",
              "options": [
                "Büyük olasılıkla robot ya ayakta durmaz ya titrer; kazançlar küçükten başlayarak yeniden ayarlanır",
                "Aynı sonuç çıkar, çünkü kod aynıdır",
                "Yalnız KX ve KV değişir, KP ve KD aynı kalır",
                "Robot sadece biraz daha yavaş tepki verir"
              ],
              "answer": 0,
              "explanation": "Motor gücü, tekerlek çapı, kütle, yükseklik ve pil farklıdır; kazançlar robota özeldir. Programın yapısı (ölçme, filtre, sabit döngü, kaskad) aynı kalır, sayılar değişir. Güvenli yol: önce yalnız KP, sonra KD, en sonda dış döngü; robotu ilk denemede havada tutarak.",
              "skills": [
                "robot-tuning",
                "ctrl-cascade"
              ]
            }
          ]
        }
      ]
    },
    {
      "title": "Davranış ve robot kol",
      "project": "Gezgin robot",
      "guideMd": "### Hafta hedefleri\nBu haftanın sonunda öğrenci:\n1. Enkoder ve jiroskopun güçlü ve zayıf yanlarını söyleyebilir; jiroskop ölçeğini seçip tamamlayıcı filtreyle birleşik yönelim hesaplayabilir.\n2. Robot programını davranışlara ayırabilir; öneri, hakem ve öncelik kavramlarını açıklayabilir; iki eşikli (histerezisli) bir davranış yazabilir.\n3. İki eksenli robot kol için ileri ve ters kinematik hesaplayabilir; erişilemeyen hedefleri ve servo sınırlarını yakalayabilir.\n4. Robot kolu `millis()` ile yumuşak hareket ettirebilir ve al-bırak işini adım tablosu olarak yazabilir.\n5. Konum tahmini, davranışlar ve ölçüm sayılarıyla (kapsama, çarpma, süre) bir gezgin robot kurup değerlendirebilir.\n\n### Haftanın planı\nHafta beş derstir; dersler 30-35 dakikadır. Plan günde bir ders içindir.\n\n| Gün | Ders | Süre | Ne yapılır |\n|---|---|---|---|\n| 1 | Sensör birleştirme: enkoder + IMU | ~30 dk | Anlatımı oku, jiroskop ölçeğini dene, α değerini değiştirip sapmayı gözle, mini testi çöz. |\n| 2 | Davranış tabanlı kontrol ve öncelikler | ~30 dk | Üç davranışı oku, seri çıktıdan hangi davranışın ne zaman devrede olduğunu izle, sırayı değiştirip tahminini sına. |\n| 3 | Robot kol: servolar ve iki eksen ters kinematik | ~35 dk | Önce elle bir iki hedef için q1 ve q2 hesapla, sonra programla karşılaştır, erişilemeyen noktaları dene. |\n| 4 | Robot kol: al-bırak dizisi | ~35 dk | Ani ve yumuşak hareketi karşılaştır, adım tablosunu oku, süreleri değiştir. |\n| 5 | Proje: Gezgin robot (ara, kaç, dolaş) | ~35 dk | Davranışları ve konum tahminini birleştir, ölçüm tablosuyla değerlendir. |\n\n### Ön koşul kontrolü\nBaşlamadan önce şunları kontrol et:\n- Sürüş (D5-D10), enkoder (D2, D3), ultrasonik (D11, D12) bağlantıları ve `millis()` ile bloklamayan döngü rahat mı? (Hafta 1-4)\n- Tamamlayıcı filtre ve sabit periyotlu döngü hatırlanıyor mu? (102. ve 103. dersler)\n- Sinüs, kosinüs ve radyan-derece dönüşümü okul bilgisi olarak biliniyor mu? Kol dersleri bunu kullanır.\n- Servo kullanımı ve harici güç kaynağı kuralı (ortak GND) biliniyor mu? (21. ders)\n\n### Kavram haritası\n- **Algılama:** enkoder yönelimi · jiroskop (ölçek, sapma, doyma) · tamamlayıcı filtre → birleşik yönelim\n- **Karar:** davranış → öneri → hakem → öncelik · histerezis (iki eşik)\n- **Kol:** servo açısı (q1, q2) · ileri ve ters kinematik · menzil ve servo sınırı · darbe genişliği\n- **Hareket:** doğrusal ara değer · servo çerçevesi (20 ms) · adım tablosu\n- **Birleşim:** konum tahmini (x, y) → hedefe yönelme (açı farkı) → ölçüm (kapsama, çarpma, süre)\n\n### Sık yapılan hatalar\n- **Ölçeği değiştirip böleni değiştirmemek.** ±500 için 65,5; 131 yazarsan açılar yarı çıkar.\n- **Jiroskop sapmasını ölçmemek.** Dururken `gz` sıfır olmalı; değilse yönelim zamanla kayar.\n- **Yönelimi 0-360'a sarıp filtrelemek.** Sarmayı yalnız açı farkında yap.\n- **Davranışın içinde motoru sürmek.** Davranış yalnız öneri döndürür; motoru hakem sürer.\n- **Tek eşikli KAÇ.** Robot eşik civarında titrer; başlama ve bitirme eşiği ayrı olmalı.\n- **Derece ile radyanı karıştırmak.** `cos()` ve `sin()` radyan ister, servo derece ister.\n- **Erişilemeyen hedefi servoya yazmak.** Önce menzili ve servo sınırını kontrol et.\n- **Tamsayı bölmesi.** `(2400 - 544) / 180` 10 çıkar; oranı hesaplarken biri `float` olmalı.\n- **Tutucuyu kol hareket ederken açıp kapamak.** Nesne düşer; yalnız kol durmuşken.\n- **Konum tahminine mutlak güvenmek.** Duvara dayanıp dönen tekerlekler tahmini bozar.\n\n### Hafta sonu tekrarı\n1. Her dersin kavram kartlarına bir daha bak ve \"sık yapılan yanlış\" satırlarını yüksek sesle oku.\n2. Mini testlerde yanlış yaptığın soruların açıklamalarını yeniden oku, sonra soruyu yeniden çöz.\n3. Kâğıt üzerinde L1 = L2 = 10 cm kol için (14, 6) ve (10, 10) hedeflerinin q1 ve q2 değerini hesapla; sonra programla doğrula.\n4. Kendi cümlenle şu soruyu cevapla: \"Hakem ne işe yarar ve davranış neden motoru kendisi sürmemeli?\"\n5. Gezgin robotta `ARAMA_MS` değerini değiştir ve ziyaret zamanının nasıl değiştiğini yaz.\n\nHafta sonu testi olarak beş dersin mini testleri yeterlidir; her derste 5 soru, toplam 25 soru. Hedef: her dersten en az 4 doğru. Eksik kalan dersin anlatımına dön.\n\n### Proje değerlendirme ölçütü (Gezgin robot)\n| Ölçüt | Gelişmeli | Yeterli | İleri |\n|---|---|---|---|\n| Davranışlar | Davranışlar tek bir `if` merdiveninde karışık | Üç davranış ayrı fonksiyon, hakem öncelik sırasıyla seçiyor | Dördüncü bir davranış (ör. şarj) eklenmiş ve önceliği gerekçelendirilmiş |\n| Konum tahmini | Tahmin yok ya da başlangıç değerleri yanlış | Yol ve birleşik yönelimle (x, y) güncelleniyor | Tahmin hatası ölçülmüş, çarpma sonrası kayma açıklanmış |\n| Güvenlik | Robot sık çarpıyor, KAÇ iki eşiksiz | KAÇ iki eşikli, çarpma sayısı eşik içinde | Yanlardan gelen engeller için ek önlem düşünülmüş |\n| Görev ve ölçüm | Bölgeye varılmıyor, sayı yok | Bölge ziyareti ve kapsama sayıyla ölçülmüş | KAÇ kapatılıp karşılaştırma koşusu yapılmış |\n| Anlatım | Ne yaptığını anlatamıyor | Davranışları ve konum hesabını adım adım anlatıyor | Hata yapıp nasıl bulduğunu ve sınırlarını anlatıyor |\n\n### Veli ve öğretmen notu\n- **Amaç.** Bu hafta tek tek bilgi vermekten çok, parçaları birleştirmeyi öğretir. Hata yapmak güvenlidir; benzetimdeki robot ve kol zarar görmez.\n- **Nasıl destek olunur?** Takılınca cevabı söylemek yerine şunları sor: \"Hangi sensör bu bilgiyi veriyor?\", \"Şu an hangi davranış devrede, seri çıktı ne diyor?\", \"Açıyı derece mi radyan mı verdin?\"\n- **Sayılarla çalışmak.** Kapsama, çarpma, hata (mm) gibi ölçümler \"iyi oldu\" yerine kanıt koymayı öğretir. Öğrenciyi her değişiklikten sonra sayıya bakmaya teşvik edin.\n- **Güvenlik.** Gerçek robotta motorlar ve servolar için ayrı güç kaynağı ve ortak GND kullanılır; servoları Arduino'nun 5 V pininden beslemeyin. Pil takarken artıyı eksiyi ters bağlamayın, uçları birbirine değdirmeyin. Şebeke gerilimiyle (220 V) hiçbir devre kurulmaz.\n- **Gerçek robotta farklı olabilecekler.** Benzetimde tekerlekler kaymaz, servo yük taşımaz ve ultrasonik ışın tek bir doğrudur. Gerçek robotta bunların hepsi sonucu bozar; bu yüzden gerçek donanımda her şey yeniden ölçülmeli ve kalibre edilmelidir.\n- **İlerleme.** Mini test sonuçları \"İlerlemem\" sayfasında beceri bazında görünür (taslak/pilot özellik; yalnız onay verildiyse kaydedilir).",
      "lessons": [
        {
          "title": "Sensör birleştirme: enkoder + IMU",
          "durationMin": 30,
          "problem": "Robotunu masada yerinde 10 kez döndürdün. Enkoderlere göre tam 3600 derece döndü ve yönü hâlâ doğru. Jiroskop ise \"3650 derece\" diyor. Hangisine inanacaksın? Aslında ikisine de biraz inanacaksın: biri yavaş yavaş sapar ama akıcıdır, öbürü sapmaz ama kaba adımlarla ilerler. Bu derste ikisini tek bir yön tahmininde birleştireceksin.",
          "contentMd": "### Devre\nSürüş ve enkoder bağlantıları Modül 5'in standart bağlantılarıdır; MPU6050 I2C üzerinden bağlanır.\n\n| Parça | Bağlantı |\n|---|---|\n| Sol motor (sürücü) | EN **D5** (PWM), IN1 **D7**, IN2 **D8** |\n| Sağ motor (sürücü) | EN **D6** (PWM), IN3 **D9**, IN4 **D10** |\n| Sol enkoder | **D2** (kesme pini) |\n| Sağ enkoder | **D3** (kesme pini) |\n| MPU6050 | SDA → **A4**, SCL → **A5**, VCC → 5 V (GY-521 gibi regülatörlü kartlarda), GND → GND; adres **0x68** |\n\nMotorlar için ayrı bir güç kaynağı kullan ve motor sürücüsünün GND'sini Arduino GND'sine bağla (ortak GND). Pil takarken artıyı eksiyi ters bağlama, uçları birbirine değdirme.\n\n### Neden iki sensör?\nİki yön kaynağın var:\n\n| Kaynak | İyi yanı | Kötü yanı |\n|---|---|---|\n| **Enkoder yönelimi** (odometri, 94. ders) | Zamanla sapmaz: yönelim sayılan tıklardan hesaplanır | Kaba adımlıdır: bir tık yaklaşık 1 cm tekerlek yolu demektir, yönelimde yaklaşık 5 derece |\n| **Jiroskop** (yaw hızı `gz`) | Akıcıdır, küçük dönüşleri de görür | Hız ölçer; yönelim için toplarsın (integral). Küçük bir sapma (bias) her saniye birikir |\n\nEnkoderden yönelim: sağ ve sol tekerleğin aldığı yolun farkını aks aralığına bölersin.\n\n```\nyönelim (rad) = (sağ yol − sol yol) / aks aralığı\n```\n\nBurada bir tık = 2π · 0,033 / 20 ≈ 1,04 cm tekerlek yoludur (yarıçap 3,3 cm, devirde 20 yuva); aks aralığı 0,12 m'dir. Tek bir tık yönelimi yaklaşık 5 derece oynatır. Bu yüzden enkoder yönelimi merdiven gibi ilerler.\n\n### Önce jiroskop ölçeği\nMPU6050 varsayılan olarak ±250 °/s ölçer. Bundan hızlı dönersen ham değer sınıra yapışır (doyar) ve gerçekte daha hızlı döndüğünü göremezsin. Ders 59'da gördüğün gibi çözüm, GYRO_CONFIG yazmacına (adres **0x1B**) bir ölçek yazmaktır:\n\n| 0x1B değeri | Tam ölçek | Duyarlılık (LSB / (°/s)) |\n|---|---|---|\n| `0x00` | ±250 °/s | 131 |\n| `0x08` | ±500 °/s | 65,5 |\n| `0x10` | ±1000 °/s | 32,8 |\n| `0x18` | ±2000 °/s | 16,4 |\n\nÖlçek büyüdükçe doymaz ama ince ayrıntı azalır. Aşağıdaki program robotu tam güçle yerinde döndürür ve aynı dönüşü üç ölçekle okur.\n\n```cpp\n// sketch: jiroskop_olcek\n#include <Wire.h>\n\nconst int MPU = 0x68;\nconst int SOL_EN = 5, SOL_IN1 = 7, SOL_IN2 = 8;\nconst int SAG_EN = 6, SAG_IN1 = 9, SAG_IN2 = 10;\n\nfloat duyarlilik = 131.0;   // LSB / (°/s); ±250 için 131\nint16_t sonHam = 0;\n\nvoid yaz(byte yazmac, byte deger) {\n  Wire.beginTransmission(MPU);\n  Wire.write(yazmac);\n  Wire.write(deger);\n  Wire.endTransmission(true);\n}\n\nvoid olcekSec(byte secim) {          // 0: ±250, 1: ±500, 2: ±1000, 3: ±2000\n  const float tablo[] = {131.0, 65.5, 32.8, 16.4};\n  yaz(0x1B, secim << 3);             // GYRO_CONFIG: ölçek bitleri 3-4\n  duyarlilik = tablo[secim];\n}\n\nfloat yawHizi() {                    // °/s, sola dönüş +\n  Wire.beginTransmission(MPU);\n  Wire.write(0x47);                  // GYRO_ZOUT_H\n  Wire.endTransmission(false);\n  Wire.requestFrom(MPU, 2, true);\n  sonHam = (Wire.read() << 8) | Wire.read();\n  return sonHam / duyarlilik;\n}\n\nvoid raporla(const char* ad) {\n  float gz = yawHizi();\n  Serial.print(\"olcek \");\n  Serial.print(ad);\n  Serial.print(\" gz=\");\n  Serial.print(gz, 1);\n  Serial.println((sonHam >= 32767 || sonHam <= -32768) ? \" DOYDU\" : \" tamam\");\n}\n\nvoid setup() {\n  Serial.begin(9600);\n  Wire.begin();\n  yaz(0x6B, 0);                      // uyku modundan çık\n  pinMode(SOL_EN, OUTPUT); pinMode(SOL_IN1, OUTPUT); pinMode(SOL_IN2, OUTPUT);\n  pinMode(SAG_EN, OUTPUT); pinMode(SAG_IN1, OUTPUT); pinMode(SAG_IN2, OUTPUT);\n\n  digitalWrite(SOL_IN1, LOW);  digitalWrite(SOL_IN2, HIGH);   // sol tekerlek geri\n  digitalWrite(SAG_IN1, HIGH); digitalWrite(SAG_IN2, LOW);    // sağ tekerlek ileri\n  analogWrite(SOL_EN, 255);\n  analogWrite(SAG_EN, 255);          // yerinde sola dönüş, tam güç\n  delay(1500);                       // motorlar hızlansın\n\n  olcekSec(0); delay(50); raporla(\"+-250\");\n  olcekSec(1); delay(50); raporla(\"+-500\");\n  olcekSec(2); delay(50); raporla(\"+-1000\");\n\n  analogWrite(SOL_EN, 0);\n  analogWrite(SAG_EN, 0);\n}\n\nvoid loop() {\n}\n```\n\n### Nasıl çalışıyor?\n1. `olcekSec()` 0x1B yazmacına `secim << 3` yazar; ölçek bitleri yazmacın 3. ve 4. bitlerindedir. Duyarlılığı da tablodan alır.\n2. `yawHizi()` GYRO_ZOUT_H (0x47) adresinden iki bayt okur ve duyarlılığa böler.\n3. Ham değer 32767'ye (ya da −32768'e) dayanmışsa ölçek yetmiyor demektir; program bunu `DOYDU` diye işaretler.\n4. Robot ±250 ölçeğinde gerçekte yaklaşık 380 °/s döner ama okuma yaklaşık 250 °/s'de takılır. ±500 ölçeğinde gerçek değer görünür.\n\nDoymuş bir jiroskopla yönelim toplarsan sürekli eksik toplarsın. Bu hata sapmadan farklıdır: robot hızlı döndükçe artar. Robotun en hızlı dönüşünü bil ve ölçeği ona göre seç.\n\n### Şimdi birleştirme: tamamlayıcı filtre\n102. derste ivmeölçer ve jiroskobu tamamlayıcı filtreyle birleştirmiştin. Aynı fikir burada da çalışır: jiroskop kısa vadede, enkoder uzun vadede güvenilir olsun.\n\n```\nyönelim = α · (yönelim + gz · dt) + (1 − α) · enkoderYönelimi\n```\n\n`α = 0,98` ve `dt = 0,02` s ise filtre yaklaşık 1 saniyelik bir zaman sabitine sahiptir: jiroskop ani dönüşleri akıcı verir, enkoder da yönelimi yavaşça kendi değerine çeker. Jiroskop sapması saniyede `b` derece ise birleşik yönelimde kalan hata yaklaşık `b · 1 s` olur (bu ayarda).\n\nProgram robotu 24 saniye boyunca sırayla sola döndürüp, ileri sürüp, daha yavaş sağa döndürüp, ileri sürer; sonunda robot gerçekte yaklaşık 330 derece sola bakar. Jiroskop 2 °/s sapmalıdır. Program üç yönelimi birlikte yazdırır: yalnız jiroskop, yalnız enkoder ve birleşik.\n\n```cpp\n// sketch: sensor_birlestirme\n#include <Wire.h>\n\nconst int MPU = 0x68;\nconst int SOL_EN = 5, SOL_IN1 = 7, SOL_IN2 = 8;\nconst int SAG_EN = 6, SAG_IN1 = 9, SAG_IN2 = 10;\nconst int ENK_SOL = 2, ENK_SAG = 3;\n\nconst float TIK_YOLU = 2 * PI * 0.033 / 20;   // bir tıkta tekerlek yolu (m)\nconst float AKS = 0.12;                        // aks aralığı (m)\nconst float ALFA = 0.98;\nconst float DUYARLILIK = 65.5;                 // ±500 °/s ölçeği\nconst unsigned long DONGU_MS = 20;\n\nvolatile long tikSol = 0, tikSag = 0;\nvolatile int yonSol = 1, yonSag = 1;           // sürüş yönü: tık +1 ya da −1 sayılır\n\nfloat yonJiro = 0;        // yalnız jiroskop (derece)\nfloat yonBirlesik = 0;    // tamamlayıcı filtre (derece)\nunsigned long sonDongu = 0, sonYazdir = 0;\nbool bitti = false;\n\nvoid sayacSol() { tikSol += yonSol; }\nvoid sayacSag() { tikSag += yonSag; }\n\nvoid mpuYaz(byte yazmac, byte deger) {\n  Wire.beginTransmission(MPU);\n  Wire.write(yazmac);\n  Wire.write(deger);\n  Wire.endTransmission(true);\n}\n\nfloat yawHizi() {         // °/s, sola dönüş +\n  Wire.beginTransmission(MPU);\n  Wire.write(0x47);\n  Wire.endTransmission(false);\n  Wire.requestFrom(MPU, 2, true);\n  int16_t ham = (Wire.read() << 8) | Wire.read();\n  return ham / DUYARLILIK;\n}\n\nfloat enkoderYonelimi() { // derece\n  noInterrupts();\n  long s = tikSol, g = tikSag;\n  interrupts();\n  float rad = (g - s) * TIK_YOLU / AKS;\n  return rad * 180.0 / PI;\n}\n\nvoid surus(int sol, int sag) {          // -255 … 255\n  yonSol = sol >= 0 ? 1 : -1;\n  yonSag = sag >= 0 ? 1 : -1;\n  digitalWrite(SOL_IN1, sol >= 0); digitalWrite(SOL_IN2, sol < 0);\n  digitalWrite(SAG_IN1, sag >= 0); digitalWrite(SAG_IN2, sag < 0);\n  analogWrite(SOL_EN, abs(sol));\n  analogWrite(SAG_EN, abs(sag));\n}\n\nvoid setup() {\n  Serial.begin(9600);\n  Wire.begin();\n  mpuYaz(0x6B, 0);\n  mpuYaz(0x1B, 0x08);                   // ±500 °/s\n  pinMode(SOL_EN, OUTPUT); pinMode(SOL_IN1, OUTPUT); pinMode(SOL_IN2, OUTPUT);\n  pinMode(SAG_EN, OUTPUT); pinMode(SAG_IN1, OUTPUT); pinMode(SAG_IN2, OUTPUT);\n  pinMode(ENK_SOL, INPUT_PULLUP); pinMode(ENK_SAG, INPUT_PULLUP);\n  attachInterrupt(digitalPinToInterrupt(ENK_SOL), sayacSol, RISING);\n  attachInterrupt(digitalPinToInterrupt(ENK_SAG), sayacSag, RISING);\n  sonDongu = millis();\n}\n\nvoid loop() {\n  unsigned long simdi = millis();\n\n  if (!bitti) {                          // 3 sn'lik aşamalar: sol dön, ileri, sağ dön, ileri\n    int asama = (simdi / 3000) % 4;\n    if (simdi >= 24000) { surus(0, 0); bitti = true; }\n    else if (asama == 0) surus(-150, 150);\n    else if (asama == 2) surus(120, -120);\n    else surus(150, 150);\n  }\n\n  if (simdi - sonDongu >= DONGU_MS) {\n    float dt = (simdi - sonDongu) / 1000.0;\n    sonDongu = simdi;\n    float gz = yawHizi();\n    yonJiro += gz * dt;\n    yonBirlesik = ALFA * (yonBirlesik + gz * dt) + (1 - ALFA) * enkoderYonelimi();\n  }\n\n  if (simdi - sonYazdir >= 1000 && (simdi < 24000 || simdi >= 25000)) {\n    sonYazdir = simdi - (simdi % 1000);\n    Serial.print(\"t=\");        Serial.print(simdi / 1000);\n    Serial.print(\" jiro=\");     Serial.print(yonJiro, 1);\n    Serial.print(\" enk=\");      Serial.print(enkoderYonelimi(), 1);\n    Serial.print(\" birlesik=\"); Serial.println(yonBirlesik, 1);\n  }\n}\n```\n\n### Nasıl çalışıyor?\n1. Kesme işlevleri tıkları `yonSol` / `yonSag` ile toplar. Bu tek kanallı enkoder dönüş yönünü ayırt edemez; yönü biz sürüş komutundan biliriz.\n2. `surus()` hem motorları sürer hem tıkların işaretini ayarlar. Geri giden tekerlek tıkları eksiye sayar.\n3. Her 20 ms'de bir `dt` gerçek geçen süreden hesaplanır (103. derste gördüğün sabit periyot fikri), jiroskop okunur ve iki yönelim güncellenir.\n4. `yonJiro` yalnız jiroskop integralidir. `yonBirlesik` ise her adımda enkoder yönelimine doğru hafifçe çekilir.\n5. Yönelimler açı birikimi olarak yazılır: 360 derece geçince sıfıra sarmaz (örn. iki tam tur sola = +720). Bu, karşılaştırmayı kolaylaştırır.\n\nÖlçümde (2 °/s sapma, 0,4 °/s gürültü) 24 saniye sonunda gerçek yönelimle fark şöyle çıkar: yalnız jiroskop yaklaşık 50 derece kayar; birleşik yönelim birkaç dereceyle gerçeğe yakın kalır. Enkoder yönelimi de gerçeğe yakındır ama adımlıdır; hatası, tek bir tıkın oynattığı yaklaşık 5 derece mertebesindedir.\n\n### Dene\n- `ALFA` değerini 0,9 ve 0,995 yap. Hangisi jiroskop sapmasını daha çok bastırıyor? Hangisinde yönelim daha akıcı?\n- Başlangıçta robot dururken 1 saniye boyunca `gz` ortalamasını al ve sonraki okumalardan çıkar. Sapma ne kadar azalıyor?\n- `mpuYaz(0x1B, 0x08)` satırını sil (varsayılan ±250). Robot 150 PWM ile döndüğünde yaklaşık 180 °/s'dedir; yine doyar mı? `jiroskop_olcek` programındaki tam güç ile karşılaştır.\n\n### Sık yapılan hatalar\n- Ölçeği değiştirip bölen sayıyı değiştirmemek: 65,5 yerine 131 kullanırsan açılar yarı değerde çıkar.\n- `dt` sabit sanıp gerçek süreyi ölçmemek: `loop()` bir tur yavaşlarsa integral eksik toplar.\n- Enkoder tıklarını sürüş yönüne bakmadan hep artırmak: geri giden tekerlek de ileri sayılır, yönelim bozulur.\n- Yönelimi 0-360'a sarıp sonra filtrelemek: 359 ile 1 derece arasındaki fark 358 görünür. Sarma işlemini filtreden sonra yap.\n- Jiroskop sapmasını hiç ölçmemek: dururken `gz` sıfır olmalıdır. Değilse sapma vardır.\n\n### Gerçek robotta farklı olabilecekler\nBu benzetimde tekerlekler kaymaz; bu yüzden enkoder yönelimi çok iyidir. Gerçek robotta tekerlek kayması ve tekerlek çapı hatası enkoder yönelimini de zamanla saptırır; yani ikisi de tam güvenilir değildir. Tek kanallı enkoder yön bilmez; yön değiştirdiğin anda motor hemen durmadığı için birkaç tık yanlış işaretle sayılabilir. Gerçek MPU6050'nin sapması sıcaklıkla değişir. Gerçek değerler için veri sayfasına bak ve dururken kendi ölçümünü yap.",
          "question": "Robot hiç dönmeden düz bir yolda gidiyorsa, hangi yönelim kaynağına daha çok güvenirsin? Tekerlekleri kayan ıslak bir zeminde bu seçim nasıl değişir?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Neden tek bir yön sensörüne güvenmenin yetmediğini\n- Enkoderden yönelimin nasıl hesaplandığını ve neden \"merdiven gibi\" ilerlediğini\n- Jiroskop ölçeğinin (±250, ±500 ...) ne işe yaradığını ve doymanın ne demek olduğunu\n- Jiroskop ile enkoderi tamamlayıcı filtreyle tek bir yön tahmininde birleştirmeyi\n\n### Önceden bilmen gerekenler\n- 58. ders: MPU6050'yi I2C ile okumak, ham değeri 131'e bölerek °/s bulmak\n- 59. ve 102. dersler: jiroskop integrali ve tamamlayıcı filtre fikri\n- 92. ve 94. dersler: enkoder tıkları ve odometri\n- 103. ders: sabit periyotlu döngü\n\n### Yön nedir, kim ölçer?\nGezgin bir robotun \"şu an nereye bakıyorum?\" sorusuna cevap verebilmesi gerekir. Bu cevaba **yönelim** (heading) denir. Robotta iki kaynak var:\n\n| Kaynak | Güçlü yanı | Zayıf yanı |\n|---|---|---|\n| Enkoder | Zamanla sapmaz | Kaba adımlıdır |\n| Jiroskop | Akıcıdır, küçük dönüşleri görür | Hız ölçer; toplayınca sapma birikir |\n\n### Enkoderden yönelim\nİki tekerleğin aldığı yol farkı robotu döndürür:\n\n```\nyönelim (rad) = (sağ yol − sol yol) / aks aralığı\n```\n\nBir tık 2π · 0,033 / 20 ≈ 1,04 cm tekerlek yolu eder. Aks aralığı 0,12 m ise tek bir tık yönelimi yaklaşık 4,95 derece oynatır. Yani yönelim 5 derecelik basamaklarla \"merdiven gibi\" ilerler. Ama sayılan tık hata biriktirmez: bir tık ne ise yarın da odur.\n\n### Jiroskopun ölçeği\nJiroskop **açısal hızı** (°/s) ölçer. Açıyı bulmak için hızı zamanla toplarsın: `açı += gz · dt`. İki şeye dikkat et:\n\n1. **Sapma (bias).** Robot dururken bile `gz` sıfır olmayabilir. Sapma 2 °/s ise 24 saniyede 48 derecelik yalan açı birikir.\n2. **Ölçek.** MPU6050 varsayılan olarak ±250 °/s ölçer ve her °/s için 131 birim verir. Daha hızlı dönersen ham değer sınıra yapışır; buna **doyma** denir. ±500 ölçeği için GYRO_CONFIG yazmacına (adres 0x1B) 0x08 yazılır ve bölen 65,5 olur. Ölçeği değiştirip böleni değiştirmezsen açılar yanlış çıkar.\n\n### Tamamlayıcı filtre ile birleştirme\nFikir 102. dersteki gibidir: kısa sürede jiroskopa, uzun sürede enkodere güven.\n\n```\nyönelim = α · (yönelim + gz · dt) + (1 − α) · enkoderYönelimi\n```\n\n`α = 0,98` ve `dt = 0,02` s ise filtrenin zaman sabiti yaklaşık 1 saniyedir. Her adımda yönelim, enkoderin gösterdiği değere azıcık çekilir. Böylece jiroskop sapması birikemez; kalan hata yaklaşık \"sapma × 1 s\" olur. 2 °/s sapma için bu yaklaşık 2 derecedir. Yönelimi 0-360'a sarıp filtrelersen 359 ile 1 derece arası 358 fark görünür; bu yüzden filtreyi sarılmamış açıyla çalıştır, sarmayı gerekirse sonra yap.\n\n### Özet\nEnkoder yönelimi sapmaz ama kabadır; jiroskop akıcıdır ama sapar. Jiroskop ölçeğini robotun en hızlı dönüşüne göre seç ve bölen sayıyı ölçeğe uydur. Tamamlayıcı filtre ikisini birleştirir: jiroskop kısa vadeyi, enkoder uzun vadeyi taşır. Bu yönelim, sonraki derslerdeki konum tahmininin temelidir.",
          "concepts": [
            {
              "term": "Yönelim (heading)",
              "definition": "Robotun hangi yöne baktığını gösteren açı.",
              "example": "Robot başlangıçta sağa bakıyorsa yönelimi 0 derecedir; sola 90 derece dönerse yönelim 90 olur.",
              "pitfall": "Yönelimi 0-360'a sarıp sonra filtrelemek: 359 ile 1 derece arasındaki fark 358 görünür."
            },
            {
              "term": "Sapma (bias)",
              "definition": "Jiroskop dururken bile sıfırdan farklı bir hız okuması vermesi.",
              "example": "2 °/s sapma, integral alınınca 24 saniyede 48 derecelik yanlış dönüş üretir.",
              "pitfall": "Sapmayı hiç ölçmemek: dururken gz sıfır olmalıdır; değilse yönelim zamanla kayar."
            },
            {
              "term": "Jiroskop ölçeği ve doyma",
              "definition": "Jiroskobun ölçebildiği en büyük hız (±250, ±500 ...). Gerçek hız bundan büyükse ham değer sınıra yapışır.",
              "example": "Robot 378 °/s dönerken ±250 ölçeği 250'de takılır, ±500 ölçeği gerçek değeri gösterir.",
              "pitfall": "Ölçeği değiştirip bölen sayıyı (131 yerine 65,5) değiştirmemek: açılar yarı değerde çıkar."
            },
            {
              "term": "Enkoder yönelimi",
              "definition": "Sağ ve sol tekerlek yollarının farkının aks aralığına bölünmesiyle bulunan yön.",
              "example": "Sağ tekerlek sola göre bir tık fazla yol alırsa yönelim yaklaşık 4,95 derece değişir.",
              "pitfall": "Tıkları sürüş yönüne bakmadan hep artırmak: geri giden tekerlek de ileri sayılır."
            },
            {
              "term": "Tamamlayıcı filtre",
              "definition": "İki sensörü zaman ölçeğine göre ağırlıklayan birleştirme: jiroskop kısa, enkoder uzun vade için.",
              "example": "yonelim = 0,98 · (yonelim + gz · dt) + 0,02 · enkoderYonelimi",
              "pitfall": "dt'yi sabit sanıp gerçek geçen süreyi ölçmemek: döngü yavaşlarsa integral eksik toplar."
            }
          ],
          "quiz": [
            {
              "id": "m5h7d106-q1",
              "kind": "mcq",
              "prompt": "Robotun yönelimi için tek bir sensör yerine enkoder ile jiroskopu birleştirmenin asıl nedeni hangisidir?",
              "options": [
                "İkisi de aynı hatayı yapar, ortalaması sıfırlar",
                "Jiroskop akıcıdır ama sapma biriktirir; enkoder sapmaz ama kaba adımlıdır. Birleşince iki zayıflık birbirini örter",
                "Enkoder hızlı dönüşleri hiç ölçemez, jiroskop ise hep kusursuzdur",
                "Sensör sayısı arttıkça kod otomatik olarak kısalır"
              ],
              "answer": 1,
              "explanation": "Jiroskop integral alındığı için küçük bir sapmayı bile birikerek büyütür; enkoder ise tıklardan hesaplandığı için sapmaz ama yaklaşık 5 derecelik basamaklarla ilerler. Birinci seçenek yanlış: iki sensörün hataları aynı türden değildir. Üçüncü seçenek yanlış: jiroskop da sapar. Dördüncüsü konu dışıdır.",
              "skills": [
                "rob-sensor-fusion"
              ]
            },
            {
              "id": "m5h7d106-q2",
              "kind": "numeric",
              "prompt": "Jiroskop ±500 °/s ölçeğinde (65,5 LSB/(°/s)) çalışıyor. Ham okuma 3275 çıktı. Robot kaç °/s dönüyor?",
              "answer": 50,
              "tolerance": 0.5,
              "unit": "°/s",
              "explanation": "°/s = ham / duyarlılık = 3275 / 65,5 = 50. 131'e bölseydin 25 bulurdun; bu, ölçek ile bölenin uyuşmadığı klasik hatadır.",
              "skills": [
                "rob-gyro-scale"
              ]
            },
            {
              "id": "m5h7d106-q3",
              "kind": "numeric",
              "prompt": "Bir tık 2π · 0,033 / 20 m tekerlek yoludur; aks aralığı 0,12 m. Yalnızca sağ tekerlek bir tık fazla sayılırsa enkoder yönelimi kaç derece değişir? (Bir ondalık basamak)",
              "answer": 4.95,
              "tolerance": 0.1,
              "unit": "derece",
              "explanation": "Yol 0,010367 m; yönelim = 0,010367 / 0,12 = 0,0864 rad, yani 4,95 derece. Santimetreyi metreye çevirmeyi unutursan sonucu 100 kat yanlış bulursun.",
              "skills": [
                "rob-sensor-fusion",
                "rob-localization"
              ]
            },
            {
              "id": "m5h7d106-q4",
              "kind": "predict-output",
              "prompt": "Bir filtre adımı çalışıyor. Seri monitörde ne yazar?\n\n```\nfloat yon = 10;\nfloat gz = 50;\nfloat dt = 0.02;\nfloat enk = 20;\nconst float ALFA = 0.98;\n\nvoid setup() {\n  Serial.begin(9600);\n  yon = ALFA * (yon + gz * dt) + (1 - ALFA) * enk;\n  Serial.println(yon, 2);\n}\n\nvoid loop() {}\n```",
              "options": [
                "10.78",
                "11.00",
                "11.18",
                "30.00"
              ],
              "answer": 2,
              "explanation": "Jiroskop adımı: 10 + 50 · 0,02 = 11. Bunun 0,98 katı 10,78; enkoder payı 0,02 · 20 = 0,4. Toplam 11,18. 10,78 enkoder payını unutmak, 11,00 filtreyi hiç uygulamamaktır; 30 ise ağırlıkları yok sayıp her şeyi toplamaktır.",
              "skills": [
                "rob-sensor-fusion"
              ]
            },
            {
              "id": "m5h7d106-q5",
              "kind": "find-bug",
              "prompt": "Robot ±500 °/s ölçeğiyle çalışıyor ama gerçekte 90 derece dönünce yazılan açı yaklaşık 45 derece. Hata nerede?\n\n```\nmpuYaz(0x6B, 0);\nmpuYaz(0x1B, 0x08);   // ±500 °/s\n...\nint16_t ham = (Wire.read() << 8) | Wire.read();\nfloat gz = ham / 131.0;\nyon += gz * dt;\n```",
              "options": [
                "GYRO_CONFIG yazmacı 0x1B değil, 0x6B olmalı",
                "Ölçek ±500 seçilmiş ama bölen ±250'ye ait 131; 65,5 olmalı",
                "int16_t yerine byte kullanılmalı",
                "yon += gz * dt satırında dt ile çarpılmamalı"
              ],
              "answer": 1,
              "explanation": "±500 ölçeğinde duyarlılık 65,5 LSB/(°/s)'dir. 131'e bölünce her okuma yarıya iner ve toplanan açı yarı çıkar (90 yerine 45). 0x1B doğru yazmaçtır, 0x6B uyku yönetimi içindir. int16_t doğru türdür: ham değer işaretli 16 bittir. dt ile çarpmak integralin kendisidir.",
              "skills": [
                "rob-gyro-scale",
                "prog-debug"
              ]
            }
          ]
        },
        {
          "title": "Davranış tabanlı kontrol ve öncelikler",
          "durationMin": 30,
          "problem": "Süpürge robotlar bir yandan odayı tarar, bir yandan masa ayağına çarpmamaya çalışır, pili azalınca da şarj istasyonuna döner. Hepsini tek bir uzun `if` merdiveniyle yazmaya kalksan kod birkaç günde anlaşılmaz olur. Robotikçiler bu işi başka türlü çözer: her işi ayrı bir \"davranış\" yapar, hangisinin sözünün geçeceğine ise bir öncelik sırası karar verir.",
          "contentMd": "### Devre\nStandart Modül 5 bağlantıları: sürüş motorları, ultrasonik sensör ve üç çizgi sensörü. Servoyu kullanmıyoruz; ultrasonik sensör hep ileri bakar.\n\n| Parça | Bağlantı |\n|---|---|\n| Sol motor (sürücü) | EN **D5** (PWM), IN1 **D7**, IN2 **D8** |\n| Sağ motor (sürücü) | EN **D6** (PWM), IN3 **D9**, IN4 **D10** |\n| Ultrasonik HC-SR04 | TRIG **D11**, ECHO **D12** (ileriye bakar) |\n| Çizgi sensörleri (TCRT5000) | sol **A0**, orta **A1**, sağ **A2** (aralarında yaklaşık 2 cm) |\n\nMotorlar için ayrı güç kaynağı kullan ve sürücünün GND'sini Arduino GND'sine bağla.\n\n### Fikir: davranışlar ve hakem\nHer davranış tek bir soruya cevap veren küçük bir fonksiyondur:\n\n> \"Şu an devrede olmalı mıyım? Evet ise tekerleklere ne öneriyorum?\"\n\nFonksiyon `aktif` bilgisi ve iki tekerlek hızı (öneri) döndürür. Hiçbir davranış motoru kendisi sürmez. Sadece öneri yapar. Önerileri toplayıp birini seçen kısmın adı **hakemdir** (arbiter). Hakem basittir: davranışları öncelik sırasıyla gez, devrede olan ilk davranışın önerisini uygula.\n\nBu derste üç davranışımız var, yüksekten alçağa:\n\n| Öncelik | Davranış | Ne zaman devrede? | Önerisi |\n|---|---|---|---|\n| 1 (en yüksek) | **KAÇ** | Ön mesafe 25 cm altına düşünce; 60 cm üstüne çıkana kadar sürer | Yerinde sola dön |\n| 2 | **ÇİZGİ** | Üç çizgi sensöründen biri çizgiyi görüyorsa | Çizgiye göre düz git ya da hafifçe yönel |\n| 3 (en düşük) | **DOLAŞ** | Her zaman (varsayılan) | İleri git, ara sıra rastgele dön |\n\nDikkat edilecek iki nokta:\n- **KAÇ** iki farklı eşik kullanır: 25 cm'de başlar, 60 cm'de biter. Bunu ders 88'deki histerezis gibi düşün; aksi hâlde robot eşiğin etrafında titrer.\n- **DOLAŞ** her zaman `aktif` döner. En alt katman, hiçbiri devrede değilken ne yapılacağını söyler.\n\nBir davranış yeni bir sensör ya da yeni bir görev eklemek istediğinde diğerlerine dokunmazsın. Yalnızca yeni bir fonksiyon yazar ve sıraya koyarsın.\n\n### Program\nHer davranış değişiminde robot seri porta zamanı ve yeni davranışın adını yazar.\n\n```cpp\n// sketch: davranis_oncelik\nconst int SOL_EN = 5, SOL_IN1 = 7, SOL_IN2 = 8;\nconst int SAG_EN = 6, SAG_IN1 = 9, SAG_IN2 = 10;\nconst int TRIG = 11, ECHO = 12;\nconst int SENS_SOL = A0, SENS_ORTA = A1, SENS_SAG = A2;\n\nconst float KAC_BASLA_CM = 25;\nconst float KAC_BITIR_CM = 60;\nconst int CIZGI_ESIK = 500;          // analogRead: çizgi ≈ 860, zemin ≈ 164\n\nstruct Oneri {\n  bool aktif;\n  int sol;\n  int sag;\n};\n\nenum Davranis { KAC, CIZGI, DOLAS, DAVRANIS_SAYISI };   // sıra = öncelik\nconst char* DAVRANIS_ADI[] = {\"KAC\", \"CIZGI\", \"DOLAS\"};\n\nfloat onCm = 400;\nbool kaciyor = false;\nunsigned long donusBitis = 0, sonrakiDonus = 2000;\nint donusYonu = 1;\nunsigned long sonOlcum = 0;\nint onceki = -1;\n\nfloat mesafeOku() {\n  digitalWrite(TRIG, LOW);  delayMicroseconds(2);\n  digitalWrite(TRIG, HIGH); delayMicroseconds(10);\n  digitalWrite(TRIG, LOW);\n  unsigned long sure = pulseIn(ECHO, HIGH, 25000);\n  if (sure == 0) return 400;                  // yankı yok: çok uzak\n  return sure / 58.0;\n}\n\nvoid surus(int sol, int sag) {                // -255 … 255\n  digitalWrite(SOL_IN1, sol >= 0); digitalWrite(SOL_IN2, sol < 0);\n  digitalWrite(SAG_IN1, sag >= 0); digitalWrite(SAG_IN2, sag < 0);\n  analogWrite(SOL_EN, abs(sol));\n  analogWrite(SAG_EN, abs(sag));\n}\n\nOneri kac() {\n  Oneri o = {false, 0, 0};\n  if (!kaciyor && onCm < KAC_BASLA_CM) kaciyor = true;\n  if (kaciyor && onCm > KAC_BITIR_CM) kaciyor = false;\n  if (kaciyor) { o.aktif = true; o.sol = -140; o.sag = 140; }   // yerinde sola dön\n  return o;\n}\n\nOneri cizgiyiIzle() {\n  Oneri o = {false, 0, 0};\n  bool sol  = analogRead(SENS_SOL)  > CIZGI_ESIK;\n  bool orta = analogRead(SENS_ORTA) > CIZGI_ESIK;\n  bool sag  = analogRead(SENS_SAG)  > CIZGI_ESIK;\n  if (!sol && !orta && !sag) return o;        // çizgi yok: devrede değil\n  o.aktif = true;\n  if (sol && !sag)      { o.sol = 60;  o.sag = 150; }   // çizgi solda: sola yönel\n  else if (sag && !sol) { o.sol = 150; o.sag = 60; }    // çizgi sağda: sağa yönel\n  else                  { o.sol = 150; o.sag = 150; }   // ortada: düz\n  return o;\n}\n\nOneri dolas() {\n  Oneri o = {true, 170, 170};                 // her zaman devrede: varsayılan\n  unsigned long t = millis();\n  if (t >= sonrakiDonus) {                    // yeni rastgele dönüş planla\n    donusBitis = t + random(300, 800);\n    donusYonu = random(2) ? 1 : -1;\n    sonrakiDonus = donusBitis + random(1500, 3500);\n  }\n  if (t < donusBitis) { o.sol = -130 * donusYonu; o.sag = 130 * donusYonu; }\n  return o;\n}\n\nvoid setup() {\n  Serial.begin(9600);\n  pinMode(SOL_EN, OUTPUT); pinMode(SOL_IN1, OUTPUT); pinMode(SOL_IN2, OUTPUT);\n  pinMode(SAG_EN, OUTPUT); pinMode(SAG_IN1, OUTPUT); pinMode(SAG_IN2, OUTPUT);\n  pinMode(TRIG, OUTPUT); pinMode(ECHO, INPUT);\n  randomSeed(7);\n}\n\nvoid loop() {\n  unsigned long simdi = millis();\n  if (simdi - sonOlcum >= 60) {               // ultrasonik 60 ms'de bir\n    sonOlcum = simdi;\n    onCm = mesafeOku();\n  }\n\n  Oneri oneri[DAVRANIS_SAYISI];\n  oneri[KAC]   = kac();\n  oneri[CIZGI] = cizgiyiIzle();\n  oneri[DOLAS] = dolas();\n\n  int secilen = DOLAS;                        // hakem: ilk aktif davranış kazanır\n  for (int i = 0; i < DAVRANIS_SAYISI; i++) {\n    if (oneri[i].aktif) { secilen = i; break; }\n  }\n  surus(oneri[secilen].sol, oneri[secilen].sag);\n\n  if (secilen != onceki) {                    // davranış değişince yaz\n    Serial.print(\"t=\");\n    Serial.print(simdi);\n    Serial.print(\" \");\n    Serial.println(DAVRANIS_ADI[secilen]);\n    onceki = secilen;\n  }\n}\n```\n\n### Nasıl çalışıyor?\n1. `enum Davranis` sırası önceliği belirler: `KAC` sıfırıncı, yani en önde.\n2. Her `loop()` turunda üç davranış da öneri hazırlar. Hakem döngüsü `i = 0`'dan başlar ve `aktif` olan ilk öneride `break` ile durur. Bu yüzden KAÇ devredeyse ÇİZGİ ve DOLAŞ ne önerirse önersin dikkate alınmaz.\n3. `surus()` seçilen önerinin hızlarını motorlara yazar. Negatif hız = geri.\n4. Seri port çıktısı bize \"robot şu an hangi davranışta\" sorusunun cevabını verir. Hata ayıklarken en değerli bilgi budur.\n5. Ultrasonik ölçüm 60 ms'de bir yapılır (`pulseIn` bekler, her turda yapmak gereksiz).\n6. `dolas()` zamanı kendi içinde tutar; başka davranış sürerken de çalışır. Bu yüzden DOLAŞ'a geri dönüldüğünde robot rastgele dönüşün ortasında olabilir.\n\nBenzetimde robot, ucunda bir duvar bulunan bir çizginin üzerinde başlar. Çizgiyi izler (ÇİZGİ), duvara 25 cm kala çizgi hâlâ görünürken KAÇ devreye girer ve çizginin önüne geçer, dönüş bitince DOLAŞ başlar. Ölçülen seri çıktının başı şöyledir:\n\n```\nt=0 CIZGI\nt=5580 KAC\nt=5940 DOLAS\nt=7980 KAC\nt=8460 DOLAS\nt=10800 KAC\n```\n\nKAÇ'ın 7980. milisaniyedeki ikinci devreye girişi de dikkat çekici: robot DOLAŞ'ın rastgele dönüşü sırasında duvar kenarının ışına girdiği an 6 cm'lik bir mesafe okudu. Tek ışınlı bir sensör yandan gelen engeli geç görür.\n\n### Dene\n- `KAC_BITIR_CM` değerini 30 yap. Robot duvar kenarında neden daha çok titreşiyor? Seri çıktıda `KAC` ve `DOLAS` ne sıklıkta değişiyor?\n- Hakemdeki `for` döngüsünün sırasını değiştir: `DOLAS`'ı en öne al. Ne olur? (Cevabı yazmadan önce tahmin et, sonra dene.)\n- Dördüncü bir davranış ekle: `bekle()`: D2'deki butona basılıyken durur (`INPUT_PULLUP`). Önceliği nereye koyarsın?\n\n### Sık yapılan hatalar\n- Davranışların içinde `surus()` çağırmak: iki davranış motorlara aynı anda yazar ve sonuç belirsizleşir. Davranış yalnızca öneri döndürür.\n- Bütün davranışlara `aktif = true` yazmak: hakem hep ilkini seçer, diğerleri bir daha hiç çalışmaz.\n- Tek eşikli kaçma: 25 cm'de başlayıp 25 cm'de biten KAÇ, robotu duvarın önünde titretir. Bitiş eşiğini daha büyük tut.\n- `delay()` kullanmak: hakem döngüsü yavaşlar, robot geç tepki verir (27. dersteki millis yaklaşımını kullan).\n\n### Gerçek robotta farklı olabilecekler\nTek ışınlı bir ultrasonik sensör yandan yaklaşan engeli geç görür; gerçek robotta yanlara da sensör eklenir. Gerçek ultrasonik sensörlerde yankı bazen kaybolur ya da yan duvarlara sekerek yanlış mesafe verir; KAÇ davranışına tek bir ölçüme bakmak yerine birkaç ölçümün medyanını vermek iyi olur (Modül 4'teki medyan filtre). Gerçek çizgi sensörünün eşiğini kalibrasyonla bulursun (87. ders); `500` bu benzetime özgü bir değerdir.",
          "question": "Bir davranışın sözü başka bir davranışınkinden her zaman geçerse, öncelik sırası robotun \"karakterini\" belirler. Bir yangın alarmı robotunda \"dumanı kaynağa kadar takip et\" ile \"engelden kaç\" davranışlarını nasıl sıralardın? Sırayı değiştirmek neyi riske atar?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Bir robot programını \"davranışlar\" olarak parçalamayı\n- Davranış, öneri ve hakem (arbiter) kavramlarını\n- Öncelik sırasının robotun \"karakterini\" nasıl belirlediğini\n- İki eşikli (histerezisli) bir KAÇ davranışı yazmayı\n\n### Önceden bilmen gerekenler\n- 82. ve 84. dersler: mesafe sensörüyle kaçma ve durum makinesi\n- 88. ders: histerezis (iki eşik)\n- 27. ders: `millis()` ile bloklamayan kod\n- 28. ders: `enum` ve durum makineleri\n\n### Neden \"davranış\"?\nRobotun işleri arttıkça tek bir uzun `if / else` merdiveni karışır: yeni bir iş eklemek eskileri bozar. Davranış tabanlı kontrolde her iş ayrı ve küçük bir fonksiyondur. Fonksiyon yalnızca iki şeye cevap verir:\n\n> \"Şu an devrede olmalı mıyım? Evet ise tekerleklere ne öneriyorum?\"\n\nDavranış motorları kendisi sürmez; yalnızca bir **öneri** döndürür: `aktif` bilgisi ve iki tekerlek hızı.\n\n### Hakem\nÖnerileri toplayıp birini seçen kısma **hakem** denir. En basit hakem şöyle çalışır: davranışları öncelik sırasıyla gez, devrede olan ilk davranışın önerisini uygula.\n\n| Öncelik | Davranış | Devrede olma koşulu |\n|---|---|---|\n| 1 | KAÇ | Ön mesafe 25 cm altı (60 cm üstüne çıkana dek) |\n| 2 | ÇİZGİ | Çizgi sensörlerinden biri çizgiyi görüyor |\n| 3 | DOLAŞ | Her zaman (varsayılan) |\n\n`enum Davranis { KAC, CIZGI, DOLAS }` yazdığında sayı sırası öncelik olur: KAC = 0 en önde. Hakem `for` döngüsüyle 0'dan başlar ve ilk `aktif` davranışta `break` ile durur. Bu yüzden KAÇ devredeyse ÇİZGİ ne önerirse önersin dikkate alınmaz.\n\nDOLAŞ'ın her zaman `aktif` olması bilinçli bir tasarımdır: hiçbir davranış devrede değilken robotun ne yapacağını söyleyen son güvenlik ağıdır.\n\n### İki eşik: histerezis\nKAÇ 25 cm'de başlayıp yine 25 cm'de bitseydi, robot dönerken mesafe 25 cm'nin hemen üstüne çıkar çıkmaz bırakır, ileri gider, tekrar 25'in altına iner ve titrerdi. Çözüm iki eşiktir: 25 cm'de başla, 60 cm'yi geçince bitir. Bunun için davranışın küçük bir belleği olur (`kaciyor` değişkeni).\n\n### Sırayı değiştirince ne olur?\nÖncelik sırası bir \"değerler listesidir\". Çarpmamayı en üste koyarsan robot ürkek ama güvenli olur. DOLAŞ'ı en üste koyarsan hakem hep ilk davranışı seçeceği için diğerleri bir daha çalışmaz. Davranış eklemek kolaydır: yeni bir fonksiyon yazıp sıraya koyarsın, diğerlerine dokunmazsın.\n\n### Özet\nDavranış tabanlı kontrolde her iş bir davranıştır ve yalnızca öneri döndürür. Hakem, öncelik sırasına göre devrede olan ilk davranışı seçer ve motorları yalnız o sürer. KAÇ gibi davranışlarda iki eşik titremeyi önler. Öncelik sırasını doğru kurmak, robotun neye önce önem vereceğini belirler.",
          "concepts": [
            {
              "term": "Davranış",
              "definition": "Robotun tek bir işini yapan küçük fonksiyon: devrede olup olmadığını ve tekerleklere ne önerdiğini söyler.",
              "example": "KAÇ davranışı ön mesafe 25 cm altına inince aktif olur ve yerinde sola dönmeyi önerir.",
              "pitfall": "Davranışın içinde motoru doğrudan sürmek: iki davranış aynı anda motora yazar ve sonuç belirsizleşir."
            },
            {
              "term": "Öneri",
              "definition": "Bir davranışın hakeme verdiği cevap: aktif mi, sol hız, sağ hız.",
              "example": "Oneri o = {true, -140, 140}; yani aktifim, sol tekerlek geri, sağ ileri.",
              "pitfall": "Bütün davranışlara aktif = true yazmak: hakem hep ilkini seçer, diğerleri bir daha çalışmaz."
            },
            {
              "term": "Hakem (arbiter)",
              "definition": "Önerileri öncelik sırasıyla gezip devrede olan ilkini seçen ve motorları yalnız onunla süren kod.",
              "example": "for (i = 0; i < 3; i++) { if (oneri[i].aktif) { secilen = i; break; } }",
              "pitfall": "Sırayı karıştırmak: varsayılan davranışı en öne koyarsan diğerleri hiç seçilmez."
            },
            {
              "term": "Öncelik",
              "definition": "Davranışlar arasındaki sıra. Sıradaki yeri öndeki davranış, arkadakini bastırır.",
              "example": "KAÇ, ÇİZGİ'den önce gelir; bu yüzden çizgi görünürken bile duvara çarpmaz.",
              "pitfall": "Önceliği düşünmeden vermek: bir yangın robotunda 'engelden kaç' en üstteyse robot dumana asla yaklaşamayabilir."
            },
            {
              "term": "Histerezis (iki eşik)",
              "definition": "Bir davranışı başlatma ve bitirme için farklı eşikler kullanmak.",
              "example": "KAÇ 25 cm'de başlar, 60 cm'yi geçince biter.",
              "pitfall": "Tek eşik kullanmak: robot eşik civarında KAÇ ile DOLAŞ arasında sürekli gidip gelir."
            }
          ],
          "quiz": [
            {
              "id": "m5h7d107-q1",
              "kind": "mcq",
              "prompt": "Hakem, öncelik sırasıyla (KAÇ, ÇİZGİ, DOLAŞ) ilk aktif davranışı seçiyor. Robot çizginin üstünde ve duvara 20 cm kala hem KAÇ hem ÇİZGİ aktif. Motorları hangisi sürer?",
              "options": [
                "ÇİZGİ, çünkü çizgi görüyor",
                "İkisinin ortalaması",
                "KAÇ, çünkü sırada önde ve ilk aktif olan odur",
                "DOLAŞ, çünkü her zaman aktiftir"
              ],
              "answer": 2,
              "explanation": "Hakem döngüsü KAÇ'ı (sıra 0) görür, aktif olduğu için break ile durur; ÇİZGİ'ye hiç bakmaz. Ortalama alınmaz, öneriler karıştırılmaz. DOLAŞ her zaman aktiftir ama en arkadadır; yalnız ötekiler aktif değilken seçilir.",
              "skills": [
                "rob-behavior-arbiter"
              ]
            },
            {
              "id": "m5h7d107-q2",
              "kind": "predict-output",
              "prompt": "KAÇ aktif değil, ÇİZGİ ve DOLAŞ aktif. Bu hakem ne yazar?\n\n```\nbool aktif[3] = {false, true, true};   // KAC, CIZGI, DOLAS\nint secilen = 2;\n\nvoid setup() {\n  Serial.begin(9600);\n  for (int i = 0; i < 3; i++) {\n    if (aktif[i]) { secilen = i; break; }\n  }\n  Serial.println(secilen);\n}\n\nvoid loop() {}\n```",
              "options": [
                "0",
                "1",
                "2",
                "3"
              ],
              "answer": 1,
              "explanation": "i = 0'da aktif[0] yanlıştır, devam eder. i = 1'de aktif[1] doğrudur: secilen = 1 olur ve break döngüyü bitirir. 2 yazmaz; o yalnızca başlangıç değeridir ve döngü bunu ezer. 3 hiçbir davranışın numarası değildir.",
              "skills": [
                "rob-behavior-arbiter"
              ]
            },
            {
              "id": "m5h7d107-q3",
              "kind": "numeric",
              "prompt": "KAÇ 25 cm altında başlar, 60 cm üstüne çıkınca biter. Ölçümler sırayla: 30, 24, 40, 58, 61, 50 cm. Kaç ölçümde KAÇ devrede olur?",
              "answer": 3,
              "tolerance": 0,
              "unit": "ölçüm",
              "explanation": "30 cm: henüz başlamadı. 24 cm: başlar (1). 40 cm: 60'ın altında, sürer (2). 58 cm: hâlâ 60'ın altında, sürer (3). 61 cm: biter. 50 cm: 25'in altında olmadığı için yeniden başlamaz. Toplam 3. Tek eşik olsaydı yalnız 24 cm'de aktif olurdu.",
              "skills": [
                "rob-hysteresis",
                "rob-behavior-arbiter"
              ]
            },
            {
              "id": "m5h7d107-q4",
              "kind": "find-bug",
              "prompt": "Hakem düzenli çalışıyor ama KAÇ davranışı iki davranışın aynı anda motora yazmasına yol açıyor. Hata nerede?\n\n```\nOneri kac() {\n  Oneri o = {false, 0, 0};\n  if (onCm < 25) {\n    o.aktif = true;\n    surus(-140, 140);\n  }\n  return o;\n}\n```",
              "options": [
                "Eşik 25 değil 60 olmalı",
                "Oneri yapısı bool içeremez",
                "Davranış motoru kendisi sürüyor; hakem başka davranışı seçse bile bu satır motorlara yazar",
                "return o; satırı gereksizdir"
              ],
              "answer": 2,
              "explanation": "Davranışlar yalnız öneri döndürmelidir; motoru hakem sürer. Burada kac() çağrılır çağrılmaz (hakem henüz seçmemişken) motorlara yazıyor. Eşik değeri kasıtlı olarak 25'tir. bool alanı yapılarda serbesttir. return o; hakemin öneriyi alması için zorunludur.",
              "skills": [
                "rob-behavior-arbiter",
                "prog-debug"
              ]
            },
            {
              "id": "m5h7d107-q5",
              "kind": "numeric",
              "prompt": "HC-SR04 yankı süresi 1160 µs ölçüldü. Kodda mesafe = süre / 58.0 kullanılıyor. Ön mesafe kaç cm?",
              "answer": 20,
              "tolerance": 0.1,
              "unit": "cm",
              "explanation": "1160 / 58 = 20 cm. Ses gidip geldiği için süre iki yolu kapsar; 58 µs/cm bunu hesaba katan bir katsayıdır. KAÇ eşiği 25 cm olduğundan bu ölçümde KAÇ devreye girer.",
              "skills": [
                "rob-behavior-arbiter"
              ]
            }
          ]
        },
        {
          "title": "Robot kol: servolar ve iki eksen ters kinematik",
          "durationMin": 35,
          "problem": "Bir robot kola \"masadaki şu noktaya git\" demek istiyorsun. Ama kolun elinde nokta yok, sadece iki servo var: biri omuzda, biri dirsekte. Servolara hangi açıları vereceksin? Bu soruya cevap bulmak ters kinematiktir. İyi haber: iki eksenli düz bir kol için cevap, okulda öğrendiğin kosinüs teoremiyle çıkıyor.",
          "contentMd": "### Devre\nRobot kolun servoları sürüş motorlarından bağımsızdır; bu derste ve sonraki derste kol tek başına çalışır.\n\n| Parça | Bağlantı |\n|---|---|\n| Omuz servosu | sinyal **D9** |\n| Dirsek servosu | sinyal **D10** |\n| Tutucu servosu | sinyal **D11** |\n| Servo gücü | Servoların kırmızı (+) ucu **harici 5 V** kaynağa, kahverengi (−) ucu hem harici kaynağın eksisine hem Arduino **GND**'ye (ortak GND) |\n\nServolar ve özellikle birlikte çalışan üç servo, Arduino'nun 5 V pininden çekilemeyecek kadar akım ister. Mutlaka harici güç kullan ve GND'leri birleştir. Pil takarken artıyı eksiyi ters bağlama, uçları birbirine değdirme.\n\n### Kolun geometrisi\nKolun iki parçası var: omuzdan dirseğe uzanan **üst kol** (uzunluğu `L1`) ve dirsekten tutucuya uzanan **ön kol** (`L2`). Bu derste ikisi de 10 cm. Koordinat merkezi omuz eksenidir; x ileri, y yukarı doğrudur ve birimimiz santimetredir.\n\nİki açı kullanırız (servo açısıyla aynıdır, 0-180°):\n- **q1 (omuz):** üst kolun yatayla (x ekseniyle) yaptığı açı. 0° = ileri yatay, 90° = dik yukarı, 180° = geri yatay.\n- **q2 (dirsek):** ön kolun, üst kolun uzantısından ne kadar aşağı kapandığı. 0° = kol düz uzanmış, 90° = dirsek dik açı, 180° = ön kol üst kolun üstüne katlanmış.\n\nServo kola takılırken bu tanıma uyacak biçimde takılır. Kendi kolunda 0° başka yerdeyse açıları buna göre kaydırman gerekir.\n\n**İleri kinematik** (açılardan konuma): üst kol q1 yönünde, ön kol ise (q1 − q2) yönündedir.\n\n```\nx = L1·cos(q1) + L2·cos(q1 − q2)\ny = L1·sin(q1) + L2·sin(q1 − q2)\n```\n\n**Ters kinematik** (konumdan açılara): hedef (x, y) olsun. Omuz, dirsek ve hedef bir üçgen oluşturur; kenarları `L1`, `L2` ve `r = √(x² + y²)`'dir. Kosinüs teoreminden:\n\n```\ncos(q2) = (r² − L1² − L2²) / (2·L1·L2)\nq2 = acos(...)\nq1 = atan2(y, x) + atan2(L2·sin(q2), L1 + L2·cos(q2))\n```\n\nİlk satır dirsek açısını verir. Üçgendeki dirsek açısı `180° − q2`'dir, bu yüzden formülde işaret böyle çıkar. İkinci satırda hedefe bakış açısına (`atan2(y, x)`), üçgenin omuz açısı eklenir. Bu çözümde dirsek üstte kalır. Dirseğin altta kalacağı ikinci bir çözüm de vardır, ancak bu servo düzeninde dirsek yalnız tek yöne kapanabildiği için onu kullanmıyoruz.\n\n### Erişilemeyen noktalar\nHer hedef için iki şeyi kontrol et:\n1. **Erişim:** `cos(q2)` 1'den büyük ya da −1'den küçükse üçgen kurulamaz. Hedef çok uzaktadır (`r > L1 + L2`, yani 20 cm üstü).\n2. **Servo sınırı:** Hesaplanan q1 ya da q2 0-180° dışına çıkıyorsa servo oraya gidemez. Örneğin omuz 0°'nin altına inemez. Yani omuzun çok altında kalan noktalara kol uzanamaz.\n\nErişilemeyen hedefte servolara **hiçbir şey yazma**; kol olduğu yerde kalsın.\n\n### Servo açısından darbe genişliğine\nServo, ders 21'de gördüğün gibi darbe genişliğiyle sürülür. `Servo.write(açı)` açıyı yaklaşık 544 µs (0°) ile 2400 µs (180°) arasına yerleştirir. `writeMicroseconds()` ile doğrudan µs yazarsan 1 µs yaklaşık 0,1° eder; `write()` ise tam derece verir. Yüksek hassasiyet için µs kullanacağız:\n\n```\ndarbe (µs) = 544 + açı · (2400 − 544) / 180\n```\n\n### Program\nProgram altı hedefi sırayla dener. Erişilebilen hedefte açıları hesaplar, servolara yazar, ileri kinematikle geri hesap yapıp hedeften sapmayı milimetre olarak yazdırır.\n\n```cpp\n// sketch: kol_ters_kinematik\n#include <Servo.h>\n\nconst int OMUZ_PIN = 9, DIRSEK_PIN = 10, TUTUCU_PIN = 11;\nconst float L1 = 10.0, L2 = 10.0;         // cm\nconst float DERECE = 180.0 / PI;\n\nServo omuz, dirsek, tutucu;\n\nint acidanUs(float aci) {                 // 0-180° → darbe genişliği (µs)\n  return (int)(544 + aci * (2400 - 544) / 180.0 + 0.5);\n}\n\nvoid ileri(float q1, float q2, float &x, float &y) {\n  float a1 = q1 / DERECE;\n  float a2 = (q1 - q2) / DERECE;\n  x = L1 * cos(a1) + L2 * cos(a2);\n  y = L1 * sin(a1) + L2 * sin(a2);\n}\n\n// 0: tamam, 1: erişilemez (çok uzak), 2: servo sınırı dışında\nint ters(float x, float y, float &q1, float &q2) {\n  float r2 = x * x + y * y;\n  float c = (r2 - L1 * L1 - L2 * L2) / (2 * L1 * L2);\n  if (c > 1.0 || c < -1.0) return 1;\n  float s2 = acos(c);                      // dirsek bükülmesi (radyan)\n  float hedefAci = atan2(y, x);\n  float omuzRad = hedefAci + atan2(L2 * sin(s2), L1 + L2 * cos(s2));\n  q1 = omuzRad * DERECE;\n  q2 = s2 * DERECE;\n  if (q1 < 0 || q1 > 180 || q2 < 0 || q2 > 180) return 2;\n  return 0;\n}\n\nconst int HEDEF_SAYISI = 6;\nconst float HEDEF[HEDEF_SAYISI][2] = {\n  {14, 6}, {10, 10}, {18, 0}, {-6, 12}, {8, -12}, {25, 5}\n};\n\nvoid setup() {\n  Serial.begin(9600);\n  omuz.attach(OMUZ_PIN);\n  dirsek.attach(DIRSEK_PIN);\n  tutucu.attach(TUTUCU_PIN);\n  omuz.writeMicroseconds(acidanUs(90));    // başlangıç: kol dik yukarı\n  dirsek.writeMicroseconds(acidanUs(0));\n  tutucu.write(90);\n  delay(1000);\n\n  for (int i = 0; i < HEDEF_SAYISI; i++) {\n    float x = HEDEF[i][0], y = HEDEF[i][1];\n    float q1, q2;\n    int sonuc = ters(x, y, q1, q2);\n\n    Serial.print(\"t=\");        Serial.print(millis());\n    Serial.print(\" hedef=\");   Serial.print(x, 1);\n    Serial.print(\",\");         Serial.print(y, 1);\n\n    if (sonuc == 0) {\n      float gx, gy;\n      ileri(q1, q2, gx, gy);               // geri hesap: doğrulama\n      float hata = sqrt((gx - x) * (gx - x) + (gy - y) * (gy - y)) * 10.0;   // cm → mm\n      Serial.print(\" q1=\");      Serial.print(q1, 2);\n      Serial.print(\" q2=\");      Serial.print(q2, 2);\n      Serial.print(\" ileri=\");   Serial.print(gx, 2);\n      Serial.print(\",\");         Serial.print(gy, 2);\n      Serial.print(\" hata_mm=\"); Serial.println(hata, 3);\n      omuz.writeMicroseconds(acidanUs(q1));\n      dirsek.writeMicroseconds(acidanUs(q2));\n    } else if (sonuc == 1) {\n      Serial.println(\" ULASILAMAZ uzak\");\n    } else {\n      Serial.println(\" ULASILAMAZ servo siniri\");\n    }\n    delay(1500);\n  }\n}\n\nvoid loop() {\n}\n```\n\n### Nasıl çalışıyor?\n1. `ters()` önce `cos(q2)` değerine bakar. 1'den büyük ya da −1'den küçükse hedef kolun menzili dışındadır ve `1` döner.\n2. Sonra iki açıyı formülden hesaplar. 0-180° dışındaysa servo oraya gidemez, `2` döner.\n3. Sadece sonuç `0` ise servolar hareket eder. Diğer iki durumda kol yerinde kalır.\n4. Servolara `writeMicroseconds()` ile yazıyoruz. Tam derece yuvarlaması (`write()`) en fazla yarım derece hata yaratırdı; 20 cm'lik bir kolun ucunda bu yaklaşık 1,7 mm eder. µs ile hata çok küçüktür.\n5. `ileri()` hesaplanan açılarla hedefe geri dönmeyi dener. Bu fark `hata_mm` olarak yazdırılır. Ters ve ileri kinematik birbirinin tersi olmalıdır; fark sıfıra yakın değilse formülde ya da koddaki işaretlerde hata vardır.\n\nSeri çıktıda ilk hedef için şunu görürsün: `q1=63,60 q2=80,79` ve `hata_mm` bir milimetrenin çok altında. `{10, 10}` hedefinde `q1 = 90°`, `q2 = 90°` çıkar: üst kol dik, ön kol yatay. Kafanda canlandırıp doğru mu diye kontrol et. `{8, -12}` noktası omuzun çok altında olduğu için servo sınırında kalır, `{25, 5}` ise 20 cm'lik menzilin dışındadır.\n\n### Dene\n- `L2` değerini 15 yap (ve `L1`'i 10 bırak). Kolun menzili ne olur? Çok yakın noktalara (örneğin `{2, 1}`) erişebilir mi?\n- `HEDEF` dizisine kendi noktalarını ekle. Hangileri `ULASILAMAZ` çıkıyor? Bunu elle çizerek doğrula.\n- `ileri()` fonksiyonunda `(q1 - q2)` yerine `(q1 + q2)` yaz. `hata_mm` ne olur? Bu hata türünü yakalamak için ters ve ileri kinematiği neden birlikte kullanırız?\n\n### Sık yapılan hatalar\n- Açıları radyan/derece karıştırmak: `cos()` ve `sin()` radyan ister, servo derece ister.\n- `acos()` içine 1'in biraz üstünde bir değer vermek: sonuç `NaN` olur. Önce aralığı kontrol et.\n- Erişilemeyen hedefi de servoya yazmak: `NaN` ya da sınır dışı açılar servoyu zorlar. Önce `ters()` sonucunu kontrol et.\n- Servoları Arduino'nun 5 V pininden beslemek: kart sıfırlanır ya da servolar titrer.\n- Servo kola takılırken 0° referansını unutmak: hesap doğru olsa da kol yanlış yere gider.\n\n### Gerçek robotta farklı olabilecekler\nBenzetimde servo darbeyi anında yerine gider ve yükü yoktur. Gerçek bir servo yük altında hedef açıya tam ulaşamayabilir, ucuz servoların dişli boşluğu vardır ve darbe-açı eşlemesi (544-2400 µs) servodan servoya biraz değişir. Bu yüzden her servoyu kendi kolunda kalibre etmen gerekir. Kol uzunluklarını cetvelle ölç ve koda yaz; hesabın doğruluğu bu ölçülere bağlıdır.",
          "question": "Bir insan kolu da omuz ve dirsekle çalışır ve masadaki bir fincana uzanırken ters kinematiği \"hesaplamaz\", sadece uzanır. Robot kol neden hesaplamak zorunda? Hedef noktaya giden iki farklı dirsek konumu olabildiğini düşün; hangisini seçerdin ve neden?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Robot kolun omuz ve dirsek açılarının (q1, q2) ne anlama geldiğini\n- İleri ve ters kinematik arasındaki farkı\n- Kosinüs teoremiyle iki eksenli kol için ters kinematik çözmeyi\n- Erişilemeyen hedefleri ve servo sınırlarını nasıl yakalayacağını\n\n### Önceden bilmen gerekenler\n- 21. ders: servo, darbe genişliği ve `Servo.write()`\n- Okul bilgisi: sinüs, kosinüs, kosinüs teoremi, radyan ile derece\n- 19. ders: fonksiyonlar ve parametreler\n\n### Sorun: konum var, açı lazım\n\"Şu noktaya git\" dediğinde kolun elinde bir nokta var ama servoya nokta verilmez; açı verilir. Açılardan konumu bulmaya **ileri kinematik**, konumdan açıları bulmaya **ters kinematik** denir. İleri kinematik tek cevap verir ve kolaydır. Ters kinematik ise cevapsız, tek ya da birden çok cevaplı olabilir.\n\n### Kolun tarifi\nBu derste iki parçalı bir düz kol var: omuzdan dirseğe üst kol (`L1 = 10 cm`), dirsekten uca ön kol (`L2 = 10 cm`). Omuz orijindir, x ileri, y yukarıdır.\n\n| Açı | Anlamı |\n|---|---|\n| q1 (omuz) | Üst kolun yatayla yaptığı açı; 0 = ileri yatay, 90 = dik yukarı |\n| q2 (dirsek) | Ön kolun üst kolun uzantısından ne kadar kapandığı; 0 = düz, 90 = dik açı |\n\nÖn kolun yönü `q1 − q2` olur, bu yüzden ileri kinematik şöyledir:\n\n```\nx = L1·cos(q1) + L2·cos(q1 − q2)\ny = L1·sin(q1) + L2·sin(q1 − q2)\n```\n\n### Ters kinematik: üçgen\nOmuz, dirsek ve hedef bir üçgen kurar. Kenarları `L1`, `L2` ve hedefe uzaklık `r = √(x² + y²)`'dir. Kosinüs teoreminden dirsek açısı çıkar, sonra omuz açısı bulunur:\n\n```\ncos(q2) = (r² − L1² − L2²) / (2·L1·L2)\nq1 = atan2(y, x) + atan2(L2·sin(q2), L1 + L2·cos(q2))\n```\n\nÖrnek: hedef (10, 0). r = 10 olur; `cos(q2) = (100 − 200) / 200 = −0,5`, yani `q2 = 120°`. Üçgenin üç kenarı da 10 cm'dir (eşkenar) ve `q1 = 60°` çıkar. Doğrulama: `10·cos60° + 10·cos(−60°) = 10` ve `y = 10·sin60° + 10·sin(−60°) = 0`.\n\n### Erişilemeyen noktalar\n- **Çok uzak:** `cos(q2)` 1'den büyükse ya da −1'den küçükse üçgen kurulamaz. Menzil `L1 + L2` ile sınırlıdır; bu kolda 20 cm. `acos()` bu durumda `NaN` verir.\n- **Servo sınırı:** q1 ya da q2 0-180° dışına düşerse servo oraya gidemez.\n\nBöyle bir hedefte servolara hiçbir şey yazma; kol olduğu yerde kalsın.\n\n### Derece, radyan ve mikrosaniye\n`cos()` ve `sin()` radyan ister; servo ise derece ister. Radyan = derece · π / 180. Servo açısı darbe genişliğine şu formülle çevrilir: `544 + açı · (2400 − 544) / 180` µs. 90° için bu 1472 µs'dir. Tamsayı bölmesi tuzağına dikkat: `(2400 − 544) / 180` tamsayıda 10 çıkar (10,31 değil).\n\n### Özet\nİleri kinematik açıdan konumu, ters kinematik konumdan açıyı bulur. İki parçalı kolda kosinüs teoremi yeterlidir. Her hedefte önce erişilebilirliği ve servo sınırlarını kontrol et; sonra açıları servoya yaz. Geri hesap yapıp hedefle karşılaştırmak, formüldeki işaret hatalarını yakalamanın en iyi yoludur.",
          "concepts": [
            {
              "term": "İleri kinematik",
              "definition": "Eklem açılarından kolun ucunun konumunu hesaplamak.",
              "example": "q1 = 90°, q2 = 90° için uç (10, 10) cm olur.",
              "pitfall": "Ön kol yönünü q1 + q2 yazmak: bu kol düzeninde yön q1 − q2'dir."
            },
            {
              "term": "Ters kinematik",
              "definition": "İstenen uç konumundan eklem açılarını hesaplamak.",
              "example": "Hedef (10, 0) için q1 = 60°, q2 = 120° bulunur.",
              "pitfall": "Tek çözüm olduğunu sanmak: dirsek üstte ya da altta iki çözüm olabilir; bu servo düzeninde yalnız biri kullanılır."
            },
            {
              "term": "Kosinüs teoremi",
              "definition": "Üçgenin üç kenarı biliniyorken açıları bulmayı sağlayan bağıntı.",
              "example": "Kenarlar 10, 10, 10 ise her açı 60°'dir.",
              "pitfall": "acos() içine 1'in biraz üstünde bir değer vermek: sonuç NaN olur, önce aralığı kontrol et."
            },
            {
              "term": "Menzil ve erişilemeyen nokta",
              "definition": "Kolun ucunun ulaşabildiği bölge. Çok uzak ya da servo sınırı dışındaki noktalar erişilemez.",
              "example": "L1 = L2 = 10 cm olan kolun en uzak menzili 20 cm'dir; (25, 5) hedefi erişilemez.",
              "pitfall": "Erişilemeyen hedefi de servoya yazmak: NaN ya da sınır dışı açılar servoyu zorlar."
            },
            {
              "term": "Servo darbe genişliği",
              "definition": "Servo açısını belirleyen sinyal darbesinin süresi; yaklaşık 544 µs = 0°, 2400 µs = 180°.",
              "example": "90° için 544 + 90 · 1856 / 180 = 1472 µs.",
              "pitfall": "Derece ile radyanı karıştırmak: cos() ve sin() radyan ister, servo derece ister."
            }
          ],
          "quiz": [
            {
              "id": "m5h7d108-q1",
              "kind": "numeric",
              "prompt": "L1 = L2 = 10 cm olan kolun ucu (10, 0) noktasına gidecek. Dirsek açısı q2 kaç derece olmalı?",
              "answer": 120,
              "tolerance": 0.5,
              "unit": "derece",
              "explanation": "r = 10, cos(q2) = (100 − 200) / 200 = −0,5, q2 = 120°. Üçgenin üç kenarı da 10 olduğundan iç açı 60°'dir; q2 bunun 180°'ye tamamlayanıdır. 60° bulduysan dirseğin iç açısını q2 ile karıştırmışsın.",
              "skills": [
                "rob-ik"
              ]
            },
            {
              "id": "m5h7d108-q2",
              "kind": "numeric",
              "prompt": "L1 = 10 cm, L2 = 15 cm olan iki parçalı kol tam uzandığında ucu omuzdan en çok kaç cm uzağa ulaşır?",
              "answer": 25,
              "tolerance": 0,
              "unit": "cm",
              "explanation": "Kol tam düz olduğunda iki parçanın uzunlukları toplanır: 10 + 15 = 25 cm. Bu noktada cos(q2) = 1 olur. Daha uzağa gidemez. Alt sınır da vardır: |L1 − L2| = 5 cm'den yakın noktalara kol katlansa bile ulaşamaz.",
              "skills": [
                "rob-ik"
              ]
            },
            {
              "id": "m5h7d108-q3",
              "kind": "mcq",
              "prompt": "Hedef kolun menzilinin dışında çıktı (cos(q2) = 1,3). Program ne yapmalı?",
              "options": [
                "acos(1,3) hesaplayıp sonucu servoya yazmalı",
                "Hedefi reddedip servolara hiçbir şey yazmamalı",
                "cos(q2) değerini 1'e eşitleyip kolu tam açmalı",
                "Servoyu 0°'ye çekmeli"
              ],
              "answer": 1,
              "explanation": "|cos| 1'i aşarsa üçgen kurulamaz; acos NaN verir ve servoya yazılan NaN, hesaplanmamış bir açıdır. Hedefi reddedip kolu yerinde bırakmak güvenlidir. cos'u 1'e kırpmak da çalışır gibi görünür ama kol hedefe ulaşmaz; amacı bilinçli yapılmadıkça yanıltıcıdır. 0°'ye çekmek ise kolu rastgele bir konuma fırlatır.",
              "skills": [
                "rob-ik",
                "prog-debug"
              ]
            },
            {
              "id": "m5h7d108-q4",
              "kind": "find-bug",
              "prompt": "Geri hesapta ileri kinematik, doğru açılar için bile hedeften çok farklı bir nokta veriyor. Hata nerede?\n\n```\nfloat q1 = 63.6;     // derece\nfloat q2 = 80.8;     // derece\nfloat a1 = q1;\nfloat a2 = q1 - q2;\nx = L1 * cos(a1) + L2 * cos(a2);\ny = L1 * sin(a1) + L2 * sin(a2);\n```",
              "options": [
                "Dereceler radyana çevrilmeden cos() ve sin()'e veriliyor",
                "L2 çarpanı olmamalı",
                "y için cos kullanılmalı",
                "q2 yerine q1 + q2 kullanılmalı"
              ],
              "answer": 0,
              "explanation": "cos() ve sin() radyan ister; 63,6 'radyan' ise yüzlerce derece demektir. a1 = q1 * PI / 180 olmalıdır. L2 çarpanı kolun ön parçasının uzunluğudur ve gereklidir. y için sin doğrudur. Bu kol düzeninde ön kol yönü q1 − q2'dir.",
              "skills": [
                "rob-ik",
                "prog-debug"
              ]
            },
            {
              "id": "m5h7d108-q5",
              "kind": "predict-output",
              "prompt": "Servo darbe genişliği hesaplanıyor. Ne yazar?\n\n```\nint aci = 90;\n\nvoid setup() {\n  Serial.begin(9600);\n  int us = 544 + aci * ((2400 - 544) / 180);\n  Serial.println(us);\n}\n\nvoid loop() {}\n```",
              "options": [
                "1472",
                "1444",
                "928",
                "2400"
              ],
              "answer": 1,
              "explanation": "Parantez içi tamsayı bölmesidir: 1856 / 180 = 10 (10,31 değil, kesir atılır). 544 + 90 · 10 = 1444. Doğru değer 1472 µs'dir; fark 28 µs, yani yaklaşık 3°. 180.0 yazıp ondalık bölmeyi zorlarsan 1472 çıkar.",
              "skills": [
                "rob-servo-pulse",
                "prog-debug"
              ]
            }
          ]
        },
        {
          "title": "Robot kol: al-bırak dizisi",
          "durationMin": 35,
          "problem": "Fabrikalardaki robot kollar bir kutuyu hızla kapar, taşır ve yerine koyar. Ama dikkatli bak: hareketleri sert değil, yumuşaktır. Servoya \"90 dereceye git\" dersen servo oraya anında zıplar; kolun ucundaki nesne sallanır, düşer, hatta dişliler zarar görür. Bu derste kolu yumuşakça hareket ettirmeyi ve bir al-bırak işini adım adım yaptırmayı öğreneceksin.",
          "contentMd": "### Devre\n108. dersteki kol bağlantısı aynen geçerlidir.\n\n| Parça | Bağlantı |\n|---|---|\n| Omuz servosu | sinyal **D9** |\n| Dirsek servosu | sinyal **D10** |\n| Tutucu servosu | sinyal **D11** |\n| Servo gücü | Harici 5 V kaynak; kaynağın eksisi Arduino **GND**'ye bağlı (ortak GND) |\n\nÜç servo birlikte çalışırken kısa süreli yüksek akım çekebilir. Arduino'nun 5 V pininden besleme. Pil takarken artıyı eksiyi ters bağlama, uçları birbirine değdirme.\n\n### Önce ani hareket, sonra yumuşak hareket\nÖnce ani hareketin ne yaptığına bak. Aşağıdaki program omuzu bir anda 90°'den 30°'ye atar, 2 saniye sonra geri 90°'ye.\n\n```cpp\n// sketch: kol_ani_hareket\n#include <Servo.h>\n\nServo omuz;\n\nvoid setup() {\n  omuz.attach(9);\n  omuz.write(90);\n  delay(1000);\n  omuz.write(30);        // bir anda 60° atlar\n  delay(2000);\n  omuz.write(90);\n}\n\nvoid loop() {\n}\n```\n\nServo her 20 ms'de bir darbe alır. Darbe genişliği 90°'den 30°'ye tek bir çerçevede değişir: servo en hızlı şekilde oraya koşar. Kol bu sırada sarsılır.\n\nYumuşak hareketin fikri: hedefe tek hamlede gitme, başlangıç ile hedef arasında küçük adımlarla ilerle. `millis()` ile zaman ölç (27. ders) ve her 20 ms'de bir ara açıyı hesapla:\n\n```\noran = geçen süre / toplam süre        (0 ile 1 arası)\naçı  = başlangıç + (hedef − başlangıç) · oran\n```\n\nToplam süre ne kadar uzunsa hareket o kadar yavaştır. Üç servo (omuz, dirsek, tutucu) aynı süreye bölündüğü için hepsi aynı anda varır.\n\n### Al-bırak dizisi\nDizi dokuz adımdan oluşur. Her adımın bir hedef noktası (108. dersteki ters kinematikle açıya çevrilir), tutucu durumu ve süresi vardır.\n\n| # | Adım | Hedef (x, y) cm | Tutucu | Süre (ms) |\n|---|---|---|---|---|\n| 1 | NESNE_USTU: nesnenin üstüne git | (16, 8) | aç | 1500 |\n| 2 | ASAGI: nesneye alçal | (16, 2) | açık | 800 |\n| 3 | KAVRA: tutucuyu kapat (kol sabit) | (16, 2) | kapat | 900 |\n| 4 | YUKARI: nesneyi kaldır | (16, 8) | kapalı | 800 |\n| 5 | TASI: bırakma noktasının üstüne git | (7, 12) | kapalı | 1500 |\n| 6 | INDIR: alçal | (7, 5) | kapalı | 800 |\n| 7 | BIRAK: tutucuyu aç (kol sabit) | (7, 5) | aç | 900 |\n| 8 | KALK: yüksel | (7, 12) | açık | 800 |\n| 9 | EVE: başlangıç konumu | (2, 14) | açık | 1500 |\n\nTutucu açısı `ACIK = 120°`, `KAPALI = 60°` seçildi. Bunlar kendi tutucuna bağlıdır; dişlilerini zorlamadan açılıp kapandığı değerleri bul.\n\nSıraya dikkat: tutucu yalnız kol nesnenin yanında **durmuşken** kapanır (adım 3) ve yalnız bırakma noktasında durmuşken açılır (adım 7). Kol hareket ederken tutucu bırakmaz.\n\n```cpp\n// sketch: kol_al_birak\n#include <Servo.h>\n\nconst int OMUZ_PIN = 9, DIRSEK_PIN = 10, TUTUCU_PIN = 11;\nconst float L1 = 10.0, L2 = 10.0;\nconst float DERECE = 180.0 / PI;\nconst float ACIK = 120, KAPALI = 60;\nconst unsigned long KARE_MS = 20;          // servo çerçeve süresi\n\nServo omuz, dirsek, tutucu;\n\nstruct Adim {\n  const char* ad;\n  float x, y;\n  float tut;\n  unsigned long sure;\n};\n\nconst int ADIM_SAYISI = 9;\nconst Adim DIZI[ADIM_SAYISI] = {\n  {\"NESNE_USTU\", 16, 8,  ACIK,   1500},\n  {\"ASAGI\",      16, 2,  ACIK,    800},\n  {\"KAVRA\",      16, 2,  KAPALI,  900},\n  {\"YUKARI\",     16, 8,  KAPALI,  800},\n  {\"TASI\",        7, 12, KAPALI, 1500},\n  {\"INDIR\",       7, 5,  KAPALI,  800},\n  {\"BIRAK\",       7, 5,  ACIK,    900},\n  {\"KALK\",        7, 12, ACIK,    800},\n  {\"EVE\",         2, 14, ACIK,   1500}\n};\n\nfloat simdiki[3];      // omuz, dirsek, tutucu: şu anki açılar\nfloat baslangic[3];\nfloat hedef[3];\nint adim = -1;\nunsigned long adimBasi = 0, sonKare = 0;\n\nint acidanUs(float aci) {\n  return (int)(544 + aci * (2400 - 544) / 180.0 + 0.5);\n}\n\nbool ters(float x, float y, float &q1, float &q2) {\n  float c = (x * x + y * y - L1 * L1 - L2 * L2) / (2 * L1 * L2);\n  if (c > 1.0 || c < -1.0) return false;\n  float s2 = acos(c);\n  q1 = (atan2(y, x) + atan2(L2 * sin(s2), L1 + L2 * cos(s2))) * DERECE;\n  q2 = s2 * DERECE;\n  return q1 >= 0 && q1 <= 180 && q2 >= 0 && q2 <= 180;\n}\n\nvoid servolaraYaz() {\n  omuz.writeMicroseconds(acidanUs(simdiki[0]));\n  dirsek.writeMicroseconds(acidanUs(simdiki[1]));\n  tutucu.writeMicroseconds(acidanUs(simdiki[2]));\n}\n\nvoid adimBaslat(int i) {\n  adim = i;\n  adimBasi = millis();\n  for (int k = 0; k < 3; k++) baslangic[k] = simdiki[k];\n  if (!ters(DIZI[i].x, DIZI[i].y, hedef[0], hedef[1])) {\n    Serial.println(\"HEDEF ULASILAMAZ\");\n    adim = ADIM_SAYISI;                    // diziyi durdur\n    return;\n  }\n  hedef[2] = DIZI[i].tut;\n  Serial.print(\"t=\");   Serial.print(adimBasi);\n  Serial.print(\" \");    Serial.print(DIZI[i].ad);\n  Serial.print(\" \");    Serial.print(hedef[0], 1);\n  Serial.print(\" \");    Serial.print(hedef[1], 1);\n  Serial.print(\" \");    Serial.println(hedef[2], 0);\n}\n\nvoid setup() {\n  Serial.begin(9600);\n  float q1, q2;\n  ters(2, 14, q1, q2);                     // başlangıç konumu\n  simdiki[0] = q1; simdiki[1] = q2; simdiki[2] = KAPALI;\n  omuz.attach(OMUZ_PIN);\n  dirsek.attach(DIRSEK_PIN);\n  tutucu.attach(TUTUCU_PIN);\n  servolaraYaz();\n  delay(1000);\n  adimBaslat(0);\n}\n\nvoid loop() {\n  unsigned long simdi = millis();\n  if (adim >= ADIM_SAYISI) return;         // dizi bitti\n\n  if (simdi - sonKare >= KARE_MS) {\n    sonKare = simdi;\n    float oran = (float)(simdi - adimBasi) / DIZI[adim].sure;\n    if (oran > 1) oran = 1;\n    for (int k = 0; k < 3; k++) {\n      simdiki[k] = baslangic[k] + (hedef[k] - baslangic[k]) * oran;\n    }\n    servolaraYaz();\n    if (oran >= 1) {                       // adım bitti\n      if (adim + 1 < ADIM_SAYISI) adimBaslat(adim + 1);\n      else { Serial.print(\"t=\"); Serial.print(simdi); Serial.println(\" BITTI\"); adim = ADIM_SAYISI; }\n    }\n  }\n}\n```\n\n### Nasıl çalışıyor?\n1. `DIZI` tablosu işin tüm tarifidir: adım adı, hedef nokta, tutucu durumu ve süre. Kodu değiştirmeden yeni bir iş eklemek için tabloya satır eklemek yeter.\n2. `adimBaslat()` o anki açıları başlangıç olarak saklar, ters kinematikle hedef açıları bulur (108. ders) ve zamanı kaydeder. Hedef ulaşılamıyorsa diziyi durdurur.\n3. `loop()` her 20 ms'de bir (servonun çerçeve süresi) `oran`'ı hesaplar ve üç servoya birden ara açıyı yazar. `delay()` yoktur; `loop()` hep açık kalır, böylece ileride sensör okuma gibi işler eklenebilir.\n4. `oran` 1'e ulaşınca açı tam hedefe oturur ve sıradaki adım hemen başlar.\n5. KAVRA ve BIRAK adımlarında hedef nokta aynıdır; yalnız tutucu açısı değişir. Kol bu sürede kıpırdamaz.\n6. Servo açısı `writeMicroseconds()` ile verildiği için ara değerler küsuratlı derecelerde bile ince ince akar.\n\nBu yöntem ara açıları **eklem uzayında** düz bir çizgiyle birleştirir. Kolun ucu iki nokta arasında tam düz çizgi çizmez, hafif kavisli bir yol izler. Dikey iniş ve çıkışlar kısa olduğu için burada önemli değildir.\n\nDarbe genişliklerini ölçmek zamanlamayı da doğrular: her adımın başlangıç ve bitiş anlarını ölçmek için servo sinyalini izlersin. Ölçümde adımlar tabloda yazılan süreleriyle aynı bitiyor ve ardışık iki darbe arasındaki açı farkı en fazla yaklaşık 1,5° oluyor. Aynı ölçüm `kol_ani_hareket` programında 60° atlama gösteriyor.\n\n### Dene\n- Bütün `sure` değerlerini yarıya indir. Hareket hızlanınca ardışık darbeler arasındaki fark nasıl değişiyor?\n- `oran` yerine `oran * oran * (3 - 2 * oran)` kullan. Hareket başlarken ve biterken neden daha yumuşak?\n- Diziye üçüncü bir nesne noktası ekle. Bırakma noktası menzil dışına çıkarsa program ne yapıyor?\n\n### Sık yapılan hatalar\n- Yumuşak hareketi `delay()` içeren bir `for` döngüsüyle yapmak: hareket sürerken kod başka iş yapamaz (26. ders).\n- Her adımda başlangıcı sıfırlamayı unutmak: `baslangic` o anki açı olmazsa servo her adımda eski bir yere zıplar.\n- `oran`'ı 1'de sınırlamamak: servo hedefi geçer.\n- Tutucuyu kol hareket ederken kapatmak ya da açmak: nesne düşer.\n- Tutucuyu sonuna kadar zorlamak: servo yanar ya da dişliler zarar görür. Tutucunun mekanik sınırlarını önceden bul.\n\n### Gerçek robotta farklı olabilecekler\nBenzetimdeki servo, komuta anında uyar ve yük taşımaz; gerçekte nesnenin ağırlığı, servo torku ve kolun atalet momenti hareketi yavaşlatır, kol komutlanan konuma tam oturmayabilir. Tutucu bir nesneyi kavrarken servo tam kapanma açısına ulaşamaz (nesne araya girer) ve servo sürekli akım çekip ısınabilir; kapanma açısını nesne boyutuna göre ayarla.",
          "question": "Bir robot kol nesneyi çok hızlı kaldırırsa ne olabilir? Yavaş çalışan bir kolu fabrikada kullanmak neden pahalı olabilir? Hız ile güvenlik arasındaki dengeyi nasıl kurarsın?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Servoyu \"bir anda\" sürmenin neden sorun olduğunu\n- Başlangıç ve hedef arasında zamana bağlı ara açılar (doğrusal ara değer) hesaplamayı\n- `delay()` kullanmadan, `millis()` ile hareketi yürütmeyi\n- Al-bırak işini adım tablosu olarak yazmayı\n\n### Önceden bilmen gerekenler\n- 108. ders: ters kinematik ve servo açısını mikrosaniyeye çevirme\n- 26. ve 27. dersler: `delay()` tuzağı ve `millis()`\n- 21. ders: servo her 20 ms'de bir darbe alır\n\n### Ani hareketin bedeli\n`servo.write(30)` dediğinde servo, mevcut 90° konumundan hedefe mümkün olan en hızlı şekilde koşar. Kol sarsılır, ucundaki nesne sallanır ya da düşer, dişlilere ani yük biner. Fabrikadaki kollar bu yüzden yumuşak hareket eder. Çözüm, hedefe tek hamlede gitmek yerine küçük adımlarla ilerlemektir.\n\n### Doğrusal ara değer\nHareket süresini `sure` (ms) seç. Başlangıçtan beri geçen süreyi `geçen` olarak ölç. Hareketin ne kadarının bittiği:\n\n```\noran = geçen / sure          (0 ile 1 arası)\naçı  = başlangıç + (hedef − başlangıç) · oran\n```\n\nÖrnek: omuz 30°'den 90°'ye 2000 ms'de gidecek. 500 ms sonra `oran = 0,25` ve açı `30 + 60 · 0,25 = 45°` olur. Üç servoyu aynı `oran`la sürersen üçü de aynı anda varır.\n\nİki tuzak vardır:\n1. `oran` 1'i geçmemeli, yoksa servo hedefi aşar: `if (oran > 1) oran = 1;`\n2. `geçen` ve `sure` tamsayı ise bölme tamsayı olur: sonuç 0 ya da 1 çıkar ve hareket yine ani olur. Birini `float`'a çevir.\n\n### Servo çerçeveleri\nServo her 20 ms'de bir yeni darbe alır. Bu yüzden açıyı her 20 ms'de bir güncellemek yeter. 900 ms'lik bir adım 900 / 20 = 45 çerçevedir. Bir adımda 60° ilerleyeceksen çerçeve başına 60 / 45 ≈ 1,3° düşer; bu, servo için pürüzsüz bir hareket sayılır.\n\n### Bloklamayan hareket\n`for` ve `delay()` ile yapılan yumuşak hareket, hareket sürerken başka hiçbir işi yaptırmaz (26. ders). `millis()` ile `loop()` hep açık kalır ve ileride sensör okuyabilir.\n\n### Adım tablosu\nAl-bırak işi bir tablodur: her satır bir adımdır (hedef x, y; tutucu durumu; süre). Kod yalnız tabloyu sırayla yürütür. Yeni bir iş için kodu değil tabloyu değiştirirsin. Sıra önemlidir:\n\n| Adım | Ne olur | Kural |\n|---|---|---|\n| Nesnenin üstüne git, alçal | Kol hareket eder | Tutucu açık |\n| Kavra | Kol sabit, tutucu kapanır | Tutucu yalnız kol durmuşken kapanır |\n| Kaldır, taşı, indir | Kol hareket eder | Tutucu kapalı kalır |\n| Bırak | Kol sabit, tutucu açılır | Tutucu yalnız kol durmuşken açılır |\n| Kalk, eve dön | Kol hareket eder | Tutucu açık |\n\nTutucuyu kol hareket ederken kapatıp açarsan nesne düşer. Tutucuyu mekanik sınırına kadar zorlarsan servo ısınır ve dişliler zarar görür.\n\n### Özet\nYumuşak hareket, başlangıç ile hedef arasında zamana oranlı ara açılar üretmektir. `oran` 0'dan 1'e çıkar; 1'de sınırlanır ve tamsayı bölmesine dikkat edilir. `millis()` ile yapılırsa program başka işlere de açık kalır. Al-bırak gibi işleri adım tablosu olarak yazmak kodu sade ve değiştirilebilir tutar.",
          "concepts": [
            {
              "term": "Ani hareket",
              "definition": "Servoya hedef açıyı tek komutla verip aradaki yolu en hızlı şekilde gitmesini beklemek.",
              "example": "omuz.write(90) sonra omuz.write(30): tek çerçevede 60° atlama.",
              "pitfall": "Bunun zararsız olduğunu sanmak: kol sarsılır, nesne düşer, dişliler yıpranır."
            },
            {
              "term": "Doğrusal ara değer",
              "definition": "Başlangıç ve hedef arasında, geçen süreye orantılı ara açılar üretmek: açı = başlangıç + (hedef − başlangıç) · oran.",
              "example": "30°'den 90°'ye 2 sn'de giderken 0,5 sn sonra açı 45° olur.",
              "pitfall": "oran'ı 1'de sınırlamamak: servo hedefi geçer."
            },
            {
              "term": "Servo çerçevesi",
              "definition": "Servonun yeni darbe aldığı 20 ms'lik periyot.",
              "example": "900 ms'lik bir adım 45 çerçeve eder.",
              "pitfall": "Çerçeveden sık güncellemeye çalışmak: servo ek darbelerden fazla bir şey görmez."
            },
            {
              "term": "Bloklamayan hareket",
              "definition": "Hareketi delay() yerine millis() ile yürütmek, böylece loop() hep açık kalır.",
              "example": "Hareket sürerken aynı döngüde sensör de okunabilir.",
              "pitfall": "Yumuşak hareketi delay() içeren for döngüsüyle yapmak: hareket sürerken kod başka iş yapamaz."
            },
            {
              "term": "Adım tablosu",
              "definition": "Bir işi satır satır tarif eden veri: her satırda hedef, tutucu durumu ve süre.",
              "example": "Al-bırak 9 satırlık bir tablodur; yeni iş için tabloya satır eklenir.",
              "pitfall": "Her adımda başlangıcı o anki açıya almamak: servo her adımda eski bir yere zıplar."
            }
          ],
          "quiz": [
            {
              "id": "m5h7d109-q1",
              "kind": "numeric",
              "prompt": "Servo her 20 ms'de bir yeni darbe alıyor. 900 ms süren bir adımda kaç çerçeve vardır?",
              "answer": 45,
              "tolerance": 0,
              "unit": "çerçeve",
              "explanation": "900 / 20 = 45. Bu adımda tutucu 60° hareket ediyorsa çerçeve başına yaklaşık 1,3° ilerler. 900 ile 20'yi çarparsan 18000 bulursun; süreyi periyoda bölmek gerekir.",
              "skills": [
                "rob-smooth-motion",
                "prog-timing"
              ]
            },
            {
              "id": "m5h7d109-q2",
              "kind": "numeric",
              "prompt": "Omuz 30°'den 90°'ye 2000 ms'de gidecek (doğrusal ara değer). Hareketin başlamasından 500 ms sonra açı kaç derece olmalı?",
              "answer": 45,
              "tolerance": 0.1,
              "unit": "derece",
              "explanation": "oran = 500 / 2000 = 0,25; açı = 30 + (90 − 30) · 0,25 = 45. Yarı yolda (60°) olmaması gerekir: zamanın dörtte biri geçti, yolun da dörtte biri alındı.",
              "skills": [
                "rob-smooth-motion"
              ]
            },
            {
              "id": "m5h7d109-q3",
              "kind": "find-bug",
              "prompt": "Program yumuşak hareket etmesi gerekirken servo hedefe tek hamlede atlıyor. Hata nerede?\n\n```\nunsigned long gecen = simdi - adimBasi;\nfloat oran = gecen / DIZI[adim].sure;   // sure: unsigned long\nif (oran > 1) oran = 1;\nsimdiki = baslangic + (hedef - baslangic) * oran;\n```",
              "options": [
                "oran 1'de sınırlanmamış",
                "gecen ile sure ikisi de tamsayı: bölme 0, sonra 1 verir, ara değer oluşmaz",
                "baslangic ile hedef çıkarılmamalı",
                "float yerine long kullanılmalı"
              ],
              "answer": 1,
              "explanation": "unsigned long / unsigned long işlemi tamsayı bölmesidir: süre dolana kadar sonuç 0, dolunca 1 olur ve açı hedefe tek adımda atlar. Sınırlama satırı zaten var. (hedef − başlangıç) farkı doğru kullanılmış. oran float kalmalıdır; (float)gecen / sure yazarak düzelir.",
              "skills": [
                "rob-smooth-motion",
                "prog-debug"
              ]
            },
            {
              "id": "m5h7d109-q4",
              "kind": "mcq",
              "prompt": "Al-bırak dizisinde tutucu ne zaman kapanmalı?",
              "options": [
                "Kol hedefe doğru hareket ederken, zaman kazanmak için",
                "Kol nesnenin yanında durmuşken",
                "Dizinin ilk adımında",
                "Kol nesneyi bıraktıktan sonra"
              ],
              "answer": 1,
              "explanation": "Tutucu yalnız kol durmuşken kapanmalı; hareket sırasında kapanırsa nesneyi yanlış yerden kavrar ya da kaçırır. Dizinin başında kapatmak nesneyi hiç kavramamak demektir. Bıraktıktan sonra kapamak ise nesne yok demektir; KAVRA adımı kaldırmadan önce olur.",
              "skills": [
                "rob-smooth-motion",
                "prog-planning"
              ]
            },
            {
              "id": "m5h7d109-q5",
              "kind": "predict-output",
              "prompt": "Bazı kollarda ara değer yumuşatılmak için smoothstep kullanılır. Ne yazar?\n\n```\nfloat oran = 0.25;\n\nvoid setup() {\n  Serial.begin(9600);\n  float yumusak = oran * oran * (3 - 2 * oran);\n  Serial.println(yumusak, 2);\n}\n\nvoid loop() {}\n```",
              "options": [
                "0.25",
                "0.16",
                "0.06",
                "0.50"
              ],
              "answer": 1,
              "explanation": "0,25 · 0,25 = 0,0625; (3 − 0,5) = 2,5; çarpım 0,15625, iki basamakla 0,16. Doğrusal ara değerde bu 0,25 olurdu; smoothstep başta yavaş başlar. 0,06 yalnız oran²'dir (parantezi unutmak). 0,50 oranın tam yarıdaki değeridir.",
              "skills": [
                "rob-smooth-motion"
              ]
            }
          ]
        },
        {
          "title": "Proje: Gezgin robot (ara, kaç, dolaş)",
          "durationMin": 35,
          "problem": "Bir keşif robotu bilinmeyen bir odaya bırakılıyor. Haritası yok, kimse kumanda etmiyor. Odayı dolaşacak, duvarlara ve mobilyalara çarpmayacak, bir de gitmesi gereken bölgeye uğrayıp \"geldim\" diyecek. Bu hafta öğrendiğin parçaları birleştirince tam bunu yapan bir robot yazabilirsin.",
          "contentMd": "### Ne yapacağız?\nBu proje öğrendiklerini birleştirir:\n- **Hafta 2:** Ultrasonik sensörle engeli algılama ve kaçma.\n- **Hafta 4:** Enkoderle yol ve konum tahmini (odometri).\n- **Modül 3:** `millis()` ile bloklamayan döngü ve sabit aralıklı işler.\n- **Bu hafta:** Jiroskop ve enkoderi birleştirme (106) ve davranışlar arasında öncelik (107).\n\nRobotun üç davranışı var, yüksekten alçağa:\n\n| Öncelik | Davranış | Ne zaman devrede? | Ne yapar? |\n|---|---|---|---|\n| 1 | **KAÇ** | Ön mesafe 25 cm altına düşünce (60 cm üstüne çıkana kadar) | Yerinde sola dönerek engelden uzaklaşır |\n| 2 | **ZİYARET** | İlk 12 saniyeden sonra, bölge henüz ziyaret edilmediyse | Konum tahminine bakarak bölgenin merkezine yönelir; 15 cm yaklaşınca \"ziyaret edildi\" yazar |\n| 3 | **DOLAŞ** | Her zaman | İleri gider, ara sıra rastgele döner |\n\nİlk 12 saniye robot yalnızca arar (\"ara\" = dolaş). Sonra bölgeye gitme isteği devreye girer. Engel çıkarsa KAÇ her zaman öncelikli kalır.\n\nBölgenin nerede olduğunu robot biliyor: arenanın sağ üst köşesine yakın, merkezi (1,5 m ; 1,5 m), yarıçapı 0,25 m. Robotun kendi konumunu ise tahmin etmesi gerekiyor: başlangıç konumu ve yönü biliniyor (0,3 m ; 0,3 m ve sağa bakıyor). Sonrası enkoder yolu ve birleşik yönelimden (106. ders) hesaplanıyor:\n\n```\nx = x + yol · cos(yönelim)\ny = y + yol · sin(yönelim)\n```\n\n### Devre\nStandart Modül 5 bağlantıları. Burada çizgi sensörü ve servo yok.\n\n| Parça | Bağlantı |\n|---|---|\n| Sol motor (sürücü) | EN **D5** (PWM), IN1 **D7**, IN2 **D8** |\n| Sağ motor (sürücü) | EN **D6** (PWM), IN3 **D9**, IN4 **D10** |\n| Sol / sağ enkoder | **D2** / **D3** (kesme pinleri) |\n| Ultrasonik HC-SR04 | TRIG **D11**, ECHO **D12** (ileriye bakar) |\n| MPU6050 | SDA → **A4**, SCL → **A5**, adres **0x68** |\n\nMotorlar için ayrı güç kaynağı kullan ve sürücünün GND'sini Arduino GND'sine bağla. Pil takarken artıyı eksiyi ters bağlama.\n\n### Program\n```cpp\n// sketch: gezgin_robot\n#include <Wire.h>\n\nconst int SOL_EN = 5, SOL_IN1 = 7, SOL_IN2 = 8;\nconst int SAG_EN = 6, SAG_IN1 = 9, SAG_IN2 = 10;\nconst int ENK_SOL = 2, ENK_SAG = 3;\nconst int TRIG = 11, ECHO = 12;\nconst int MPU = 0x68;\n\nconst float TIK_YOLU = 2 * PI * 0.033 / 20;     // m / tık\nconst float AKS = 0.12;                          // m\nconst float ALFA = 0.98;\nconst float DUYARLILIK = 65.5;                   // ±500 °/s\n\nconst float KAC_BASLA_CM = 25, KAC_BITIR_CM = 60;\nconst float BOLGE_X = 1.5, BOLGE_Y = 1.5;        // ziyaret edilecek bölgenin merkezi (m)\nconst float BOLGE_YAKIN = 0.15;                  // \"geldim\" mesafesi (m)\nconst unsigned long ARAMA_MS = 12000;            // önce ara, sonra bölgeye git\n\nstruct Oneri { bool aktif; int sol; int sag; };\nenum Davranis { KAC, ZIYARET, DOLAS, DAVRANIS_SAYISI };\nconst char* DAVRANIS_ADI[] = {\"KAC\", \"ZIYARET\", \"DOLAS\"};\n\nvolatile long tikSol = 0, tikSag = 0;           // robot hiç geri gitmediği için tıklar hep ileri sayılır\nlong oncekiSol = 0, oncekiSag = 0;\n\nfloat x = 0.3, y = 0.3;          // konum tahmini (m)\nfloat yon = 0;                   // birleşik yönelim (derece, sola +)\nfloat encYon = 0;                // yalnız enkoderden yönelim (derece)\nfloat onCm = 400;\nbool kaciyor = false, ziyaretEdildi = false;\nunsigned long ziyaretSusma = 0;  // bu zamana kadar ZIYARET susar\nunsigned long sonDongu = 0, sonOlcum = 0, sonYazdir = 0;\nunsigned long donusBitis = 0, sonrakiDonus = 2000;\nint donusYonu = 1;\n\nvoid sayacSol() { tikSol++; }\nvoid sayacSag() { tikSag++; }\n\nvoid mpuYaz(byte yazmac, byte deger) {\n  Wire.beginTransmission(MPU);\n  Wire.write(yazmac);\n  Wire.write(deger);\n  Wire.endTransmission(true);\n}\n\nfloat yawHizi() {\n  Wire.beginTransmission(MPU);\n  Wire.write(0x47);\n  Wire.endTransmission(false);\n  Wire.requestFrom(MPU, 2, true);\n  int16_t ham = (Wire.read() << 8) | Wire.read();\n  return ham / DUYARLILIK;\n}\n\nfloat mesafeOku() {\n  digitalWrite(TRIG, LOW);  delayMicroseconds(2);\n  digitalWrite(TRIG, HIGH); delayMicroseconds(10);\n  digitalWrite(TRIG, LOW);\n  unsigned long sure = pulseIn(ECHO, HIGH, 25000);\n  if (sure == 0) return 400;\n  return sure / 58.0;\n}\n\nvoid surus(int sol, int sag) {                 // 0 … 255: robot yalnız ileri gider\n  sol = constrain(sol, 0, 255);\n  sag = constrain(sag, 0, 255);\n  digitalWrite(SOL_IN1, sol >= 0); digitalWrite(SOL_IN2, sol < 0);\n  digitalWrite(SAG_IN1, sag >= 0); digitalWrite(SAG_IN2, sag < 0);\n  analogWrite(SOL_EN, abs(sol));\n  analogWrite(SAG_EN, abs(sag));\n}\n\n// Konum tahmini: 20 ms'de bir\nvoid konumGuncelle() {\n  unsigned long simdi = millis();\n  float dt = (simdi - sonDongu) / 1000.0;\n  sonDongu = simdi;\n\n  noInterrupts();\n  long s = tikSol, g = tikSag;\n  interrupts();\n  float dSol = (s - oncekiSol) * TIK_YOLU;\n  float dSag = (g - oncekiSag) * TIK_YOLU;\n  oncekiSol = s; oncekiSag = g;\n\n  encYon += ((dSag - dSol) / AKS) * 180.0 / PI;              // enkoder yönelimi (mutlak)\n  float gz = yawHizi();\n  yon = ALFA * (yon + gz * dt) + (1 - ALFA) * encYon;\n\n  float yol = (dSol + dSag) / 2;\n  x += yol * cos(yon * PI / 180.0);\n  y += yol * sin(yon * PI / 180.0);\n}\n\nfloat aciFarki(float hedefAci, float simdikiAci) {      // -180 … 180\n  float f = hedefAci - simdikiAci;\n  while (f > 180) f -= 360;\n  while (f < -180) f += 360;\n  return f;\n}\n\nOneri kac() {\n  Oneri o = {false, 0, 0};\n  if (!kaciyor && onCm < KAC_BASLA_CM) {\n    kaciyor = true;\n    ziyaretSusma = millis() + 3000;            // engele takıldıysak 3 sn başka yöne bak\n  }\n  if (kaciyor && onCm > KAC_BITIR_CM) kaciyor = false;\n  if (kaciyor) { o.aktif = true; o.sol = 0; o.sag = 190; }   // sol tekerlek üstünde sola dön\n  return o;\n}\n\nOneri ziyaret() {\n  Oneri o = {false, 0, 0};\n  if (ziyaretEdildi || millis() < ARAMA_MS || millis() < ziyaretSusma) return o;\n  float mesafe = sqrt((BOLGE_X - x) * (BOLGE_X - x) + (BOLGE_Y - y) * (BOLGE_Y - y));\n  if (mesafe < BOLGE_YAKIN) {\n    ziyaretEdildi = true;\n    Serial.print(\"t=\");   Serial.print(millis());\n    Serial.println(\" BOLGE ZIYARET EDILDI\");\n    return o;\n  }\n  float hata = aciFarki(atan2(BOLGE_Y - y, BOLGE_X - x) * 180.0 / PI, yon);\n  o.aktif = true;\n  if (fabs(hata) > 30) {                       // yön çok yanlış: önce dön\n    o.sol = hata > 0 ? 0 : 170;\n    o.sag = hata > 0 ? 170 : 0;\n  } else {                                     // yaklaşık doğru yön: giderken düzelt\n    o.sol = 170 - 2 * hata;\n    o.sag = 170 + 2 * hata;\n  }\n  return o;\n}\n\nOneri dolas() {\n  Oneri o = {true, 190, 190};\n  unsigned long t = millis();\n  if (t >= sonrakiDonus) {\n    donusBitis = t + random(300, 800);\n    donusYonu = random(2) ? 1 : -1;\n    sonrakiDonus = donusBitis + random(1500, 3500);\n  }\n  if (t < donusBitis) {                        // bir tekerlek üstünde dön\n    o.sol = donusYonu > 0 ? 0 : 190;\n    o.sag = donusYonu > 0 ? 190 : 0;\n  }\n  return o;\n}\n\nvoid setup() {\n  Serial.begin(9600);\n  Wire.begin();\n  mpuYaz(0x6B, 0);\n  mpuYaz(0x1B, 0x08);                      // ±500 °/s\n  pinMode(SOL_EN, OUTPUT); pinMode(SOL_IN1, OUTPUT); pinMode(SOL_IN2, OUTPUT);\n  pinMode(SAG_EN, OUTPUT); pinMode(SAG_IN1, OUTPUT); pinMode(SAG_IN2, OUTPUT);\n  pinMode(TRIG, OUTPUT); pinMode(ECHO, INPUT);\n  pinMode(ENK_SOL, INPUT_PULLUP); pinMode(ENK_SAG, INPUT_PULLUP);\n  attachInterrupt(digitalPinToInterrupt(ENK_SOL), sayacSol, RISING);\n  attachInterrupt(digitalPinToInterrupt(ENK_SAG), sayacSag, RISING);\n  randomSeed(11);\n  sonDongu = millis();\n}\n\nvoid loop() {\n  unsigned long simdi = millis();\n\n  if (simdi - sonDongu >= 20) konumGuncelle();\n  if (simdi - sonOlcum >= 60) { sonOlcum = simdi; onCm = mesafeOku(); }\n\n  Oneri oneri[DAVRANIS_SAYISI];\n  oneri[KAC]     = kac();\n  oneri[ZIYARET] = ziyaret();\n  oneri[DOLAS]   = dolas();\n\n  int secilen = DOLAS;\n  for (int i = 0; i < DAVRANIS_SAYISI; i++) {\n    if (oneri[i].aktif) { secilen = i; break; }\n  }\n  surus(oneri[secilen].sol, oneri[secilen].sag);\n\n  if (simdi - sonYazdir >= 5000) {\n    sonYazdir = simdi;\n    Serial.print(\"t=\");   Serial.print(simdi / 1000);\n    Serial.print(\" x=\");  Serial.print(x, 2);\n    Serial.print(\" y=\");  Serial.print(y, 2);\n    Serial.print(\" yon=\"); Serial.print(yon, 0);\n    Serial.print(\" \");    Serial.println(DAVRANIS_ADI[secilen]);\n  }\n}\n```\n\n### Nasıl çalışıyor?\n1. **Konum tahmini.** `konumGuncelle()` 20 ms'de bir çalışır. Tıklardan her tekerleğin yolunu, ikisinin ortalamasından robotun aldığı yolu bulur. Yönü 106. dersteki tamamlayıcı filtre verir: jiroskop akıcı, enkoder uzun vadede doğru. Yol ve yönelimle `x` ve `y` güncellenir.\n2. **Davranışlar.** `kac()`, `ziyaret()` ve `dolas()` 107. dersteki gibi yalnız öneri döndürür. Hakem döngüsü ilk aktif öneriyi seçer.\n3. **KAÇ'ın sabrı.** KAÇ başladığında `ziyaretSusma` 3 saniye ileri alınır. Aksi hâlde bölgeye giden robot, bölgenin önünde bir duvar varsa her seferinde aynı duvara dönüp KAÇ ile ZİYARET arasında gidip gelir. Bu 3 saniye DOLAŞ'a başka bir yöne gitme şansı verir.\n4. **Yalnız ileri.** Robot hiç geri gitmez; dönerken bir tekerleği durdurur (`0`) diğerini sürer. Tek kanallı enkoder dönüş yönünü bilmediği için tıkları hep ileri sayabiliriz. Bir tekerleği geri döndürseydik motor hemen durmadığından tıkların işareti belirsizleşirdi.\n5. **Ziyaret.** ZİYARET hedefe açıyı hesaplar (`atan2`). Açı farkı 30 dereceden büyükse bir tekerlek üstünde döner; küçükse düz giderken iki tekerlek arasındaki hız farkıyla düzeltir. Konum tahmini bölge merkezine 15 cm yaklaşınca bir kez \"ziyaret edildi\" yazar.\n\n### Ölçüm\nRobot 2 m x 2 m'lik bir arenada (0,3 m ; 0,3 m)'den başlar; jiroskopta 1 °/s sapma, sağ tekerlekte %3 yavaşlık, ultrasonikte 1 cm gürültü vardır. Arena 0,25 m'lik hücrelere bölünür (8 x 8 = 64 hücre); robotun izi hangi hücrelerden geçtiyse o hücre \"ziyaret edildi\" sayılır. 40 saniyelik koşuda ölçülenler:\n\n| Ölçüt | Sonuç | Eşik |\n|---|---|---|\n| Kapsama (gezilen hücre oranı) | %58 (64 hücrenin 37'si) | en az %45 |\n| Çarpma sayısı | 2 (aynı duvar temasında sayaç iki kez arttı) | en çok 3 |\n| Duvara dayalı kalma süresi | yaklaşık 1,3 sn | 3 sn'den az |\n| Bölge ziyareti | 16. saniyede, bölgenin 13 cm yakınında | 12-40 sn arası, 25 cm içinde |\n| Konum tahmini hatası (ilk çarpmadan önce) | 4 cm'in altında | 10 cm |\n\nKarşılaştırma için KAÇ'ı kapattık (eşiği 0 cm yaptık): robot ilk duvara dayanıp kalıyor; kapsama %28'e düşüyor ve 20 saniyeden fazla duvara dayalı kalıyor.\n\nÇarpmanın bir yan etkisi de var: robot duvara dayalıyken benzetimde tekerlekler dönmeye devam eder, enkoder saymayı sürdürür ve konum tahmini kayar. Bu koşuda ilk çarpmadan sonra tahmin gerçekten yaklaşık 30 cm uzaklaştı. Konum tahmini, robotun nerede olduğunu çarpmayı sayabildiğin sürece bilir.\n\nEşikler bu koşuyu geçecek ama sınırda olmayacak biçimde seçildi. Rastgelelik (`random`) ve sensör gürültüsü nedeniyle her koşu biraz farklı çıkar; sensör gürültüsünün tohumunu değiştirdiğimiz diğer koşularda da kapsama %58-%64, çarpma 0-3 aralığındaydı.\n\n### Dene\n- `ARAMA_MS` değerini 25000 yap. Bölge ziyareti kaçıncı saniyede oluyor? Kapsama değişiyor mu?\n- `BOLGE_X` ve `BOLGE_Y` değerlerini değiştir; bölgeyi arenanın köşesine yaklaştır (örn. 1,8 ; 0,2). Ziyaret hâlâ başarılı mı? Duvara yakın olduğu için KAÇ ile ZİYARET çatışır mı?\n- `DOLAS`'taki `random(300, 800)` ve `random(1500, 3500)` aralıklarını değiştir. Kapsamayı artırmak için daha uzun düz yollar mı, daha sık dönüşler mi daha iyi?\n- Dördüncü bir davranış tasarla: `SARJ` (süre dolunca başlangıç noktasına dön). Öncelik sırasında nereye koyarsın?\n\n### Sık yapılan hatalar\n- Konum tahminine mutlak güvenmek: çarpma ve tekerlek kayması sonrası tahmin bozulur. Ne kadar süre güvenebileceğini ölç.\n- Başlangıç konumunu ve yönünü yanlış vermek: `x`, `y` ve `yon` başlangıç değerleri robotun gerçek konumuyla aynı olmalı.\n- Yönelimi 0-360'a sarıp filtrelemek (106. ders); sadece hata hesabında sar.\n- KAÇ için tek eşik kullanmak: robot eşiğin etrafında titrer; biri başlama, biri bitiş için iki eşik kullan.\n- Bölgeye giderken KAÇ'ı atlamak: hedefe gitme isteği ne kadar güçlü olursa olsun çarpmamak önce gelir.\n\n### Gerçek robotta farklı olabilecekler\nBu benzetimde zemin düzdür, tekerlekler kaymaz ve ultrasonik ışın tek bir doğrudur. Gerçek robotta tekerlek kayması konum tahminini çok daha çabuk bozar; ultrasonik ışın koni şeklindedir ve yumuşak ya da eğik yüzeylerden yansımayabilir. Ayrıca tek ışınlı sensör, duvara çok sığ bir açıyla yaklaşırken engeli geç görür. Bu koşudaki çarpma tam böyle oldu: robot 23. saniyede üst duvara yaklaşık 12 derecelik sığ bir açıyla yaklaşırken duvara değdi; o an sensör hâlâ 30 cm gösteriyordu (KAÇ eşiği 25 cm). Gerçek bir robotta yanlara da sensör ya da tampon eklersin. Konum tahminini zaman zaman bilinen bir noktaya göre düzeltmek (örn. çizgi ya da duvar yardımıyla) bu işte standart bir iyileştirmedir.",
          "question": "Robotun ne kadar iyi gezdiğini hangi sayıyla ölçersin: kapsama mı, çarpma mı, ikisinin birleşimi mi? Aynı robota bir de \"pili az, şarj istasyonuna dön\" davranışı eklenseydi, onu öncelik sırasında nereye koyar ve neden o sıraya koyardın?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Birkaç dersin parçalarını tek bir robotta birleştirmeyi\n- Enkoder yolu ve birleşik yönelimden konum tahmini (x, y) hesaplamayı\n- Bir hedefe yönelmek için açı farkını −180...180 aralığına sarmayı\n- Bir robotu sayılarla (kapsama, çarpma, süre) değerlendirmeyi\n\n### Önceden bilmen gerekenler\n- 94. ders: odometri\n- 106. ders: enkoder ve jiroskop birleştirme (tamamlayıcı filtre)\n- 107. ders: davranışlar, öneri ve hakem\n- 82. ve 84. dersler: ultrasonik sensörle engelden kaçma\n- 27. ders: `millis()` ile bloklamayan döngü\n\n### Parçaları birleştirmek\nBu proje yeni bir konu öğretmez; öğrendiklerini birbirine bağlar. Robotun üç davranışı vardır:\n\n| Öncelik | Davranış | Ne zaman |\n|---|---|---|\n| 1 | KAÇ | Ön mesafe 25 cm altında (60 cm üstüne çıkana dek) |\n| 2 | ZİYARET | İlk 12 saniyeden sonra, bölge henüz ziyaret edilmediyse |\n| 3 | DOLAŞ | Her zaman |\n\nİlk 12 saniye robot yalnızca arar. Sonra bir bölgeye gitme isteği doğar. Engel çıkarsa KAÇ her zaman öncelikli kalır: hedefe gitme isteği ne kadar güçlü olursa olsun çarpmamak önce gelir.\n\n### Konum tahmini\nRobotun haritası ve GPS'i yok. Konumunu kendi hesaplar: başlangıcı bilir, her 20 ms'de aldığı yolu ve baktığı yönü ekler.\n\n```\nyol = (soldaki yol + sağdaki yol) / 2\nx = x + yol · cos(yönelim)\ny = y + yol · sin(yönelim)\n```\n\nYönelimi 106. dersteki tamamlayıcı filtre verir. Örneğin yönelim 60° iken 0,2 m yol alınırsa x = 0,2 · cos60° = 0,10 m, y = 0,2 · sin60° = 0,173 m artar. Bu hesabın doğruluğu yola ve yönelime bağlıdır; başlangıç değerleri robotun gerçek konumuyla aynı olmalıdır.\n\n### Hedefe yönelmek: açı farkı\nZİYARET davranışı, hedefe olan açıyı (`atan2`) hesaplar ve yönelimle farkına bakar. Fark 30°'den büyükse yerinde dönüp yönünü düzeltir; küçükse giderken iki tekerlek arasındaki hız farkıyla yaklaşır. Burada bir tuzak vardır: yönelim 10°, hedef açısı 350° ise düz çıkarma 340° verir ve robot uzun yoldan döner. Farkı −180...180 aralığına sarmak gerekir: 340 − 360 = −20°. Sarma işlemini yalnız farkta yap; yönelim değişkenini sarma.\n\n### Konum tahmini bozulabilir\nRobot duvara dayanıp tekerlekler dönmeye devam ederse enkoder saymayı sürdürür, ama robot ilerlemez. Konum tahmini gerçek konumdan uzaklaşır. Tekerlek kayması da aynı etkiyi yapar. Bu yüzden tahmine ne kadar güvenebileceğini ölçmen gerekir ve çarpmayı baştan önlemek (KAÇ) konumu da korur.\n\n### Başarıyı ölçmek\n\"İyi gezdi\" demek yetmez. Arenayı hücrelere bölüp robotun izinin kaç hücreden geçtiğine bakarsan **kapsama** oranını bulursun: gezilen hücre / toplam hücre. Çarpma sayısını, duvara dayalı kalma süresini ve bölgeye varış zamanını da ölçersin. Bir özelliği kapatıp (ör. KAÇ) sonucun nasıl bozulduğuna bakmak, özelliğin işe yaradığının en güçlü kanıtıdır.\n\n### Özet\nGezgin robot, davranışlar ve konum tahmininin birleşimidir. KAÇ güvenliği, ZİYARET görevi, DOLAŞ varsayılan davranışı sağlar. Konum, enkoder yolu ve birleşik yönelimle her adımda güncellenir; açı farkı sarılır. Başarı; kapsama, çarpma ve süre gibi sayılarla, bir de özellik kapatılarak yapılan karşılaştırmayla ölçülür.",
          "concepts": [
            {
              "term": "Konum tahmini",
              "definition": "Robotun kendi konumunu başlangıçtan beri aldığı yol ve baktığı yönle hesaplaması.",
              "example": "Yönelim 60° iken 0,2 m yol: x 0,10 m, y 0,173 m artar.",
              "pitfall": "Tahmine mutlak güvenmek: çarpma ve tekerlek kayması sonrası tahmin bozulur."
            },
            {
              "term": "Açı farkını sarma",
              "definition": "İki açının farkını −180...180 aralığına getirmek, böylece robot hedefe en kısa dönüşle yönelir.",
              "example": "Hedef 350°, yönelim 10° ise fark −20°'dir; 340° değildir.",
              "pitfall": "Yönelimi 0-360'a sarıp filtrelemek; sarmayı yalnız fark hesabında yap."
            },
            {
              "term": "Kapsama",
              "definition": "Arenanın hücrelere bölünüp robotun izinin geçtiği hücrelerin toplam hücrelere oranı.",
              "example": "64 hücrenin 40'ına uğrayan robotun kapsaması %62,5'tir.",
              "pitfall": "Yalnız tek bir sayıya bakmak: kapsama yüksek ama çarpma da yüksekse robot iyi değildir."
            },
            {
              "term": "Davranış susturma",
              "definition": "Bir davranışın (ZİYARET) kısa süre devre dışı kalması, böylece başka bir davranışa (DOLAŞ) yön değiştirme şansı verilmesi.",
              "example": "KAÇ başlayınca ZİYARET 3 saniye susar.",
              "pitfall": "Susturmayı hiç koymamak: robot aynı duvara dönüp KAÇ ile ZİYARET arasında gidip gelir."
            },
            {
              "term": "Karşılaştırma koşusu",
              "definition": "Bir özelliği kapatıp aynı testi tekrarlayarak o özelliğin etkisini ölçmek.",
              "example": "KAÇ kapatılınca robot duvara dayanıp kalır ve kapsama düşer.",
              "pitfall": "Karşılaştırma yapmadan 'işe yarıyor' demek: sayı olmadan kanıt olmaz."
            }
          ],
          "quiz": [
            {
              "id": "m5h7d110-q1",
              "kind": "numeric",
              "prompt": "Arena 8 x 8 = 64 hücreye bölünmüş. Robotun izi 40 farklı hücreden geçti. Kapsama yüzde kaç?",
              "answer": 62.5,
              "tolerance": 0.1,
              "unit": "%",
              "explanation": "Kapsama = 40 / 64 = 0,625, yani %62,5. Hücre sayısını iki kez saymak ya da toplam hücreyi 40 almak sonucu bozar.",
              "skills": [
                "rob-eval"
              ]
            },
            {
              "id": "m5h7d110-q2",
              "kind": "numeric",
              "prompt": "Robotun yönelimi 60° ve son adımda 0,2 m yol aldı. Konum tahmininde y kaç cm artar? (y = yol · sin(yönelim))",
              "answer": 17.3,
              "tolerance": 0.1,
              "unit": "cm",
              "explanation": "0,2 m · sin60° = 0,2 · 0,866 = 0,1732 m = 17,3 cm. cos60° kullansan x'in değerini (10 cm) bulurdun. Metreyi santimetreye çevirmeyi de unutma.",
              "skills": [
                "rob-localization"
              ]
            },
            {
              "id": "m5h7d110-q3",
              "kind": "mcq",
              "prompt": "Robot duvara dayanmış ama tekerlekler dönmeye devam ediyor. Konum tahmini ne olur?",
              "options": [
                "Doğru kalır, çünkü enkoder yalan söylemez",
                "Robot gerçekte ilerlemediği halde tıklar sayıldığından tahmin gerçek konumdan uzaklaşır",
                "Tahmin otomatik olarak sıfırlanır",
                "Yalnız yönelim bozulur, konum doğru kalır"
              ],
              "answer": 1,
              "explanation": "Enkoder tekerleğin döndüğünü sayar, robotun ilerleyip ilerlemediğini bilmez. Tekerlek dönerken robot duvardaysa tıklar fazladan yol olarak eklenir ve (x, y) kayar. Otomatik sıfırlama yoktur. Yönelim jiroskopla desteklendiği için daha az etkilenir ama konum yol toplamıyla hesaplandığından bozulur.",
              "skills": [
                "rob-localization"
              ]
            },
            {
              "id": "m5h7d110-q4",
              "kind": "find-bug",
              "prompt": "Robot duvardan kaçarken 25 cm civarında KAÇ ile DOLAŞ arasında titriyor. Hata nerede?\n\n```\nOneri kac() {\n  Oneri o = {false, 0, 0};\n  if (onCm < 25) o.aktif = true;\n  if (o.aktif) { o.sol = 0; o.sag = 190; }\n  return o;\n}\n```",
              "options": [
                "Sağ tekerlek hızı 190 olmamalı",
                "onCm değişkeni float olmamalı",
                "Başlama ve bitirme için tek eşik var; robot dönüp 25'i geçince KAÇ hemen biter, ileri gidip yeniden başlar",
                "Oneri yapısında sol ve sağ alanları olmamalı"
              ],
              "answer": 2,
              "explanation": "KAÇ yalnız 25 cm altındayken aktif; robot dönüp mesafe 25'in birkaç mm üstüne çıkınca davranış kapanır, DOLAŞ ileri sürer, mesafe yine 25'in altına iner. Çözüm bitirme eşiğini ayırmaktır (60 cm) ve durumu bir değişkende tutmaktır. Tekerlek hızları ve veri türleri titremeyle ilgili değildir.",
              "skills": [
                "rob-hysteresis",
                "prog-debug"
              ]
            },
            {
              "id": "m5h7d110-q5",
              "kind": "predict-output",
              "prompt": "Robotun yönelimi 10°, hedefin açısı 350°. Fark sarılınca ne yazar?\n\n```\nfloat aciFarki(float hedef, float simdiki) {\n  float f = hedef - simdiki;\n  while (f > 180) f -= 360;\n  while (f < -180) f += 360;\n  return f;\n}\n\nvoid setup() {\n  Serial.begin(9600);\n  Serial.println(aciFarki(350, 10), 0);\n}\n\nvoid loop() {}\n```",
              "options": [
                "340",
                "20",
                "-20",
                "-340"
              ],
              "answer": 2,
              "explanation": "350 − 10 = 340; 340 > 180 olduğu için bir kez 360 çıkarılır: −20. Yani hedef 20° sağdadır, robot sağa kısa dönüşle yönelir. 340 sarılmamış farktır ve robot uzun yoldan döner. 20 işareti yanlış yöndür.",
              "skills": [
                "rob-localization"
              ]
            }
          ]
        }
      ]
    },
    {
      "title": "Bitirme robotu",
      "project": "Bitirme robotu",
      "guideMd": "### Hafta hedefleri\nBu haftanın sonunda öğrenci:\n1. Bitirme robotu için yolunu (A otonom araç, B robot kol, C takip robotu) seçer ve \"bitti\" kelimesini sayı, birim ve ölçüm yöntemi içeren kabul ölçütlerine çevirir.\n2. Tasarım belgesi doldurur: amaç, gereksinimler, alt sistemler, durum makinesi, test planı, riskler.\n3. Seçtiği yolun alt sistemlerini (sürüş-mesafe-çizgi, ters kinematik-servo sürücü ya da mesafe PID) tek başına, geçme koşullarıyla sınar.\n4. Alt sistemleri durum makinesiyle birleştirir ve bir test matrisini önce beklenenleri yazarak doldurur.\n5. Robot durumunu sözleşmeli JSON satırlarıyla yazar, ortalama ve en büyük mutlak hatayı hesaplar.\n6. Sonuç tablosu, kök neden analizli hata raporu ve günlük rapor yazar; simülatör ile gerçek ölçümü ayırarak sunar.\n\n### Haftanın planı\nHafta beş derstir; her ders 35-40 dakikadır. Aşağıdaki plan günde bir ders içindir. Yol seçimi 1. günde yapılır ve hafta boyunca değişmez.\n\n| Gün | Ders | Süre | Ne yapılır |\n|---|---|---|---|\n| 1 | Bitirme robotu: proje seçimi ve tasarım | ~35 dk | Üç yolu karşılaştır, birini seç, tasarım belgesini doldur, kabul ölçütü sketch'ini dene. |\n| 2 | Yapım 1: alt sistemler | ~40 dk | Yolunun alt sistemlerini seri komutlarla tek tek sına; geçme koşullarını ölç. |\n| 3 | Yapım 2: entegrasyon ve test | ~40 dk | Alt sistemleri durum makinesiyle birleştir, test matrisini doldur. |\n| 4 | 3D robota bağlama, hata ayıklama, ölçüm | ~40 dk | Telemetri satırını yaz ve doğrula; hata istatistiğini hesapla. |\n| 5 | Sergi ve sunum | ~40 dk | Sonuç tablosu, hata raporu ve günlük rapor yaz; sergiye hazırlan. |\n\n### Ön koşul kontrolü\nBu hafta önceki haftaların hepsini kullanır. Seçeceğin yola göre şunlar hazır olmalı:\n- **Yol A:** 76-78. dersler (iki motorlu sürüş, ölü bölge), 82. ders (HC-SR04), 86-89. dersler (çizgi sensörü, eşik), 84. ders (durum makinesi).\n- **Yol B:** 21. ders (servo), 108-109. dersler (ters kinematik, al-bırak).\n- **Yol C:** 82. ders (mesafe), 96-99. dersler (P, I, D ve ayar).\n- Hepsi için: `millis()` ile bloklamayan kod (26-27. dersler) ve seri porttan okuma/yazma.\n- Güç güvenliği: motor ve servo harici kaynaktan beslenir, GND ortaktır; şebeke gerilimiyle devre kurulmaz.\n\n### Kavram haritası\n- **Planlama:** \"iyi çalışıyor\" → kabul ölçütü (sayı, birim, yöntem) → tasarım belgesi → alt sistemler ve geçme koşulları\n- **Yapım:** alt sistem testi → durum makinesi → test matrisi (beklenen önce) → güvenli varsayılan\n- **Ölçüm:** veri sözleşmesi (`t, x, y, th, d`) → `null` ve aralıklar → ortalama ve en büyük mutlak hata\n- **Anlatım:** sonuç tablosu → kapsam sınırı → hata raporu (belirti, kök neden) → günlük rapor\n\n### Sık yapılan hatalar\n- **Ölçülemeyen gereksinim yazmak.** \"Düzgün gitsin\" gibi cümleye sayı ve birim ekle.\n- **Ölçütü sonradan gevşetmek.** Değişecekse nedeni belgeye yazılır ve tüm testlere uygulanır.\n- **`<` yerine `<=` yazmak.** \"5 mm'den az\" ifadesinde tam 5,0 geçmez.\n- **Alt sistemi sınamadan birleştirmek.** Hatanın hangi parçadan geldiği bilinmez.\n- **Durum değişince zamanlayıcıyı sıfırlamamak.** Sonraki durum hemen biter.\n- **Hedef kaybolunca son komutu sürdürmek.** Emin olmadığında motoru durdur.\n- **Ölçüm yok için 0 yazmak.** Telemetride `null` kullan.\n- **Hata ortalamasını işaretli almak.** +3 ile -3 birbirini götürür.\n- **Simülatör sonucunu gerçek sonuç gibi sunmak.** Kapsam sınırını yaz.\n\n### Hafta sonu tekrarı\n1. Tasarım belgeni sıfırdan oku: her gereksinimin yanında sayı ve ölçüm yöntemi var mı?\n2. Kabul ölçütü sketch'ine `C 17 23`, `C 16.9 20`, `B 4.9`, `B 5`, `A 0 0` yaz; her sonucun nedenini açıkla.\n3. Test matrisinde kırılan bir satırı seç; önce nedenini ölç, sonra tek değişiklik yap, komşu testleri yeniden koş.\n4. Telemetri satırının her alanını sözleşme kuralıyla karşılaştır; bozuk bir satır uydur ve neden bozuk olduğunu söyle.\n5. Altı ay sonra okuyacak birine günlük raporunu ver: \"neden bu değer?\" sorusunun cevabı bulunuyor mu?\n\nHafta sonu testi olarak beş dersin mini testleri yeterlidir; her derste 5 soru, toplam 25 soru. Hedef: her dersten en az 4 doğru. Eksik kalan dersin anlatımına dön.\n\n### Proje değerlendirme ölçütü (Bitirme robotu)\n| Ölçüt | Gelişmeli | Yeterli | İleri |\n|---|---|---|---|\n| Gereksinimler | Sayısız dilekler var | Her gereksinimde sayı, birim ve ölçüm yöntemi var | Ölçütler sınır değerleriyle (`<`/`<=`) ve gerekçeleriyle yazılmış |\n| Alt sistemler | Birleşik kod, ayrı test yok | Her alt sistem kendi geçme koşuluyla tek başına sınanmış | Gidiş-dönüş ya da cetvel gibi bağımsız bir ölçümle doğrulanmış |\n| Entegrasyon | `delay()` ile bloklu ya da karar katmanı yok | Durum makinesi ve en az 5 satırlı test matrisi | Beklenen sütun önce yazılmış; başarısız satır nedeniyle düzeltilmiş |\n| Güvenlik | Motor/servo Arduino 5 V'undan besleniyor, hedef kaybında son komut sürüyor | Harici güç ve ortak GND; kayıpta robot duruyor | Güvenli varsayılan test matrisinde bir satır olarak sınanmış |\n| Ölçüm ve rapor | Sonuçlar sözlü, kanıt yok | Sonuç tablosu, hata raporu ve günlük rapor var | Kök neden katmanlarla ölçülmüş, kapsam sınırı yazılmış |\n\n### Veli ve öğretmen notu\n- **Amaç.** Bu hafta \"çalışan robot\" kadar \"çalıştığını kanıtlayan robot\" önemlidir. Öğrenci sonuçlarını sayıyla, ölçüm yöntemiyle ve sınırlarıyla anlatmalıdır.\n- **Yol seçimi.** Hiçbir yol \"kolay\" değildir. A en çok parçayı birleştirir, B matematiği öne çıkarır, C PID ayarını ister. Üçünü birden yapmaya çalışmak yerine bir yolu bitirmek önerilir.\n- **Nasıl destek olunur?** Cevabı söylemek yerine şu soruları sor: \"Bunu hangi sayıyla ölçtün?\", \"Hangi katman sağlam, hangisi değil?\", \"Tek değişiklik hangisiydi?\"\n- **3D robot.** Şu anda 3 boyutlu gösterim yoktur. 114. ders yalnızca veri biçimini sınar; \"3D robot çalışıyor\" diye bir beklenti oluşturmayın.\n- **Güvenlik.** Gerçek kartla çalışılırsa piller kısa devre yapılmaz ya da ters bağlanmaz, motorlar kartın 5 V'undan beslenmez; şüphede yetişkin yardımı istenir. Şebeke gerilimiyle (220 V) hiçbir devre kurulmaz.\n- **İlerleme.** Mini test sonuçları \"İlerlemem\" sayfasında beceri bazında görünür (taslak/pilot özellik; yalnız onay verildiyse kaydedilir).",
      "lessons": [
        {
          "title": "Bitirme robotu: proje seçimi ve tasarım",
          "durationMin": 35,
          "problem": "Bir arkadaşın robotunun \"çok iyi çalıştığını\" söylüyor. İyi çalışmak ne demek? Çarpmadan mı gitti, hızlı mı, her seferinde mi? Ölçülemeyen bir iddia ne kanıtlanabilir ne de çürütülebilir. Mühendisler işe başlamadan önce \"bitti\" kelimesinin neye karşılık geldiğini yazar. Bugün sen de bitirme robotunun sınavını, robotu yapmadan önce yazacaksın.",
          "contentMd": "### Üç yol\nBu hafta tek bir proje yapacaksın ve üç yoldan birini seçeceksin. Üçünün de bitiş çizgisi sayılarla yazılıdır.\n\n| Yol | Robot | Ne yapacak? | Kabul ölçütü | Dayandığı haftalar |\n|---|---|---|---|---|\n| A | Otonom araç | Çizgiyi izleyip çizginin bittiği yerden sonra engelden kaçarak bitiş çizgisine gidecek | Engelli ve çizgili parkuru **çarpmadan** bitirir ve bitiş çizgisinde durur | Hafta 1 (sürüş), Hafta 2 (engel), Hafta 3 (çizgi) |\n| B | Robot kol | İki eksenli kolun ucu üç noktaya sırayla gidecek: P1'den parçayı alır, P2'den geçirir, P3'e bırakır | Üç noktada uç noktası hatası **5 mm'den az** | Hafta 7 (108-109. dersler: servo, ters kinematik, al-bırak) |\n| C | Takip robotu | Önündeki hedefe 20 cm mesafeyi koruyacak, hedef kaybolunca duracak | Hedefi **20 cm ± 3 cm** mesafede takip eder | Hafta 2 (mesafe sensörü), Hafta 5 (PID) |\n\nNasıl seçeceğini bil: A yolu en çok parçayı birleştirir; kod uzun, sınama senaryosu çok. B yolu araba gerektirmez, matematiği öne çıkarır ve en kesin ölçülür. C yolu en küçüğüdür ama PID'i gerçekten ayarlamayı ister. Üçünün de ölçütü aynı ciddiyettedir; \"kolay\" bir yol yoktur, farklı bir zorluk vardır.\n\n### Devre\nPinler Modül 5'in standart bağlantılarıdır. Seçtiğin yolun tablosunu kur.\n\n**Yol A: otonom araç**\n\n| Parça | Bağlantı |\n|---|---|\n| Sol motor (L298N ya da TB6612 sürücüsü) | EN **D5** (PWM), IN1 **D7**, IN2 **D8** |\n| Sağ motor | EN **D6** (PWM), IN3 **D9**, IN4 **D10** |\n| HC-SR04 | TRIG **D11**, ECHO **D12**, VCC 5 V, GND |\n| 5 adet çizgi sensörü (TCRT5000) | **A0** (en sol) ... **A4** (en sağ), aralarında 2 cm |\n| Tamponlar (isteğe bağlı) | **D2**, **D3** (`INPUT_PULLUP`, basılı = LOW) |\n\n**Yol B: robot kol**\n\n| Parça | Bağlantı |\n|---|---|\n| Omuz servosu | Sinyal **D9** |\n| Dirsek servosu | Sinyal **D10** |\n| Tutucu servosu | Sinyal **D11** |\n| Servoların gücü | Harici 5 V kaynak; eksi ucu Arduino GND'sine bağlı (ortak GND) |\n\n**Yol C: takip robotu**\n\n| Parça | Bağlantı |\n|---|---|\n| Sol ve sağ motor | Yol A ile aynı: D5, D7, D8 ve D6, D9, D10 |\n| HC-SR04 | TRIG **D11**, ECHO **D12** |\n\n**Güç uyarısı:** Motorları ve servoları Arduino'nun 5 V pininden besleme; harici kaynak kullan ve kaynağın GND'sini Arduino GND'sine bağla (ortak GND). Pilleri kısa devre yapma, ters bağlama; şüphe duyduğunda yetişkin yardımı iste. Şebeke gerilimiyle (220 V) hiçbir devre kurma. Yol B'nin servo pinleri (D9-D11) sürüş motorlarının pinleriyle çakışır; bu yüzden kol ayrı bir düzenektir, aynı Arduino'da araba ile birlikte kurulmaz.\n\n### Örnek parkur ve sahne\nDerslerdeki ölçümler simülatörde şu sahnelerle yapıldı. Kendi robotunda benzerini kağıt ve bantla kurabilirsin.\n\n| Yol | Sahne |\n|---|---|\n| A | 2,4 m × 1,6 m alan. Siyah çizgi 1,3 m'ye kadar (küçük bir kıvrımla), sonra çizgisiz boşluk. 1,75 m'de ortada duran 65 cm'lik engel duvarı. 2,05 m'de bitiş çizgisi (yolu baştan başa kesen çapraz çizgi) |\n| B | Kol tabanı orijin; üç nokta (cm): P1 (12; 4), P2 (8; 10), P3 (4; 12). Kolun iki bölümü de 10 cm |\n| C | Öndeki hedef geniş bir karton levha. Başta robota 44 cm uzakta; sonra 3 cm/sn hızla uzaklaşır |\n\n### Tasarım belgesi şablonu\nAşağıdaki şablon bir sayfadır. Kodun ilk satırını yazmadan önce doldur. Boş bıraktığın her kutu, sonradan bir tartışmanın nedeni olur.\n\n```text\nPROJE: ____________________        YOL: A / B / C        TARİH: ________\n\n1. AMAÇ (tek cümle)\n   ______________________________________________\n\n2. GEREKSİNİMLER (her biri ölçülebilir olmalı)\n   No  | Gereksinim                     | Kabul ölçütü            | Nasıl ölçülür?\n   G1  | ...                            | ... (sayı + birim)      | ...\n   G2  | ...                            | ...                     | ...\n   G3  | ...                            | ...                     | ...\n\n3. ALT SİSTEMLER\n   Ad          | Görevi              | Arayüzü (fonksiyon)      | Tek başına testi\n   Sürüş       | ...                 | surus(sol, sag)          | ...\n   ...\n\n4. DURUM MAKİNESİ (durum, ne yapar, nasıl çıkılır)\n   ...\n\n5. TEST PLANI\n   No  | Senaryo                        | Beklenen sonuç          | Ölçülen | Geçti mi?\n   T1  | ...                            | ...                     |         |\n   T2  | ...                            | ...                     |         |\n\n6. RİSKLER VE B PLANI\n   ...\n```\n\nŞablonun nasıl dolduğunu görmek için C yolu için kısa bir örnek:\n\n```text\nPROJE: Takip robotu          YOL: C\n\n1. AMAÇ: Öndeki hedefe 20 cm mesafeyi koruyan, hedef kaybolunca duran robot.\n\n2. GEREKSİNİMLER\n   G1 | Hedef yavaşça uzaklaşırken mesafe  | 17 cm ile 23 cm arası   | Hedef-sensör gerçek mesafesi, cetvel\n   G2 | Hedef kaybolunca durma             | 3 cm'den az ilerler     | Başlangıç ve bitiş konumu, cetvel\n   G3 | Hedef dönünce yeniden takip        | 10 sn içinde 17-23 cm   | Cetvel\n\n3. ALT SİSTEMLER\n   Sürüş  | Motorları sür         | surus(sol, sag)  | 1 sn ileri: yol 15-30 cm\n   Mesafe | Önü ölç (ortanca)     | mesafe()         | Duvar 50 cm: okuma 49-51 cm\n   PID    | Hatadan hız üret      | (loop içinde)    | Duran hedef: 10 sn sonra 17-23 cm\n\n4. DURUM MAKİNESİ\n   BEKLE -> TAKIP (hedef göründü) -> KAYIP (0,5 sn hedef yok) -> TAKIP (hedef döndü)\n\n5. TEST PLANI\n   T1 | Hedef 3 cm/sn uzaklaşır      | 17-23 cm     | ...\n   T2 | Sağ motor %5 zayıf           | 17-23 cm     | ...\n   T3 | Hedef kaybolur               | < 3 cm       | ...\n```\n\nBu şablon gerçek bir belgedir; ders 113'te test planını simülatörde bu sütunlarla dolduracaksın.\n\n### Program\nÖlçütleri sayıya dökünce \"geçti mi, kaldı mı\" kararını bir program bile verebilir. Aşağıdaki sketch üç yolun kabul ölçütünü kodlar. Ölçtüğün değerleri seri porttan yazarsın, o da karar verir. Ders 115'te bitirme sonuçlarını bununla sınayacaksın.\n\n```cpp\n// sketch: kabul_olcut\n// Ölçüm sonuçlarını seri porttan gir, kabul ölçütüne göre GEÇTİ / KALDI yazsın.\n//   A <carpma> <bitti>      örnek: A 0 1      (bitti: 1 = parkuru bitirdi)\n//   B <en_buyuk_hata_mm>    örnek: B 3.2\n//   C <en_kucuk_cm> <en_buyuk_cm>   örnek: C 18.4 21.9\nconst float KOL_ESIK_MM = 5.0;       // hata bunun ALTINDA olmalı\nconst float TAKIP_HEDEF_CM = 20.0;\nconst float TAKIP_PAY_CM = 3.0;\n\nvoid sonucYaz(char yol, bool gecti) {\n  Serial.print(\"yol \");\n  Serial.print(yol);\n  Serial.println(gecti ? \": GECTI\" : \": KALDI\");\n}\n\nvoid setup() {\n  Serial.begin(9600);\n  Serial.setTimeout(50);\n  Serial.println(\"hazir\");\n}\n\nvoid loop() {\n  if (Serial.available() == 0) return;\n  char yol = Serial.read();\n  if (yol == 'A') {\n    int carpma = Serial.parseInt();\n    int bitti = Serial.parseInt();\n    sonucYaz('A', carpma == 0 && bitti == 1);\n  } else if (yol == 'B') {\n    float hata = Serial.parseFloat();\n    sonucYaz('B', hata < KOL_ESIK_MM);\n  } else if (yol == 'C') {\n    float enKucuk = Serial.parseFloat();\n    float enBuyuk = Serial.parseFloat();\n    sonucYaz('C', enKucuk >= TAKIP_HEDEF_CM - TAKIP_PAY_CM && enBuyuk <= TAKIP_HEDEF_CM + TAKIP_PAY_CM);\n  }\n}\n```\n\n### Nasıl çalışıyor?\n1. Her satır bir yol harfiyle başlar. Sketch harfi `Serial.read()` ile alır, sayıları `parseInt` ve `parseFloat` ile okur (9. dersteki gibi).\n2. **A yolu:** çarpma sayısı 0 **ve** parkuru bitirmiş olmalı. Hiç çarpmadan olduğu yerde duran robot da çarpmamıştır ama bitirmemiştir; bu yüzden iki koşul `&&` ile birleşir.\n3. **B yolu:** \"5 mm'den az\" ifadesi katıdır. Tam 5,0 mm ölçersen kaldın; sketch bu yüzden `<` kullanır, `<=` kullanmaz.\n4. **C yolu:** 20 cm ± 3 cm, yani 17 ile 23 arası ve sınırlar dahil. Takip boyunca ölçülen **en küçük** ve **en büyük** mesafe bu aralığın içinde kalmalıdır; ortalaması iyi olan ama bir an 12 cm'e yaklaşmış robot kalır.\n5. Ölçütler `const` olarak en üstte durur. Ölçütü değiştirmek istersen tek yeri değiştirirsin ve bunu tasarım belgesine yazarsın.\n\n### Dene\n- Tasarım belgesi şablonunu seçtiğin yol için doldur. Her gereksinimin yanına bir sayı ve bir ölçüm yöntemi yaz. \"Hızlı olsun\" gibi bir cümle varsa sayıya çevir.\n- Seri monitörden `C 17 23`, `C 16.9 20`, `B 4.9`, `B 5` yaz. Hangileri geçer? Sebebini kendi cümlenle açıkla.\n- Sketch'e dördüncü bir ölçüt ekle (örneğin A yolu için \"en çok 20 sn\"). Hangi sayıyı gireceksin ve neden o eşiği seçtin?\n\n### Sık yapılan hatalar\n- Ölçülemeyen gereksinim yazmak: \"düzgün gitsin\", \"hassas olsun\". Yanına sayı ve birim yoksa gereksinim değildir, dilektir.\n- Ölçütü sonuç açıklandıktan sonra gevşetmek. Ölçüt değişecekse nedeni belgeye yazılır ve değişiklik tüm testlere uygulanır.\n- Yol A için tamponlarla enkoderi aynı anda kullanmaya çalışmak: ikisi de D2 ve D3'ü ister.\n- Servo ya da motoru Arduino'nun 5 V pininden beslemek: Arduino resetlenir ya da kart zarar görür. Harici güç ve ortak GND kullan.\n- Üç yolun hepsini birden yapmaya kalkmak. Bir yolu ölçütleriyle bitirmek, üçünü yarım bırakmaktan iyidir.",
          "question": "Bir ölçütü, robot tutturamadığı için sonradan gevşetmek ne zaman dürüst bir karardır, ne zaman kendini kandırmaktır? Hangi bilgiyi belgeye yazarsan ikisini ayırt edebilirsin?",
          "explainerMd": "### Bu derste öğreneceklerin\n- \"Bitti\" kelimesini sayı ve birimle yazılmış bir **kabul ölçütüne** çevirmeyi\n- Gereksinimin ölçülebilir olup olmadığını ayırt etmeyi\n- Bir projeyi alt sistemlere bölen tasarım belgesinin bölümlerini\n- Ölçütleri bir programın \"GEÇTİ / KALDI\" diye denetlemesini ve sınır değerlerin (`<` ile `<=`) önemini\n\n### Önceden bilmen gerekenler\n- 76. ders: iki motorlu sürüş (D5-D10 bağlantıları)\n- 82. ders: HC-SR04 ile mesafe ölçme\n- 84. ders: durum makinesi fikri\n- 96-99. dersler: PID (Yol C için); 108-109. dersler: robot kol (Yol B için)\n\n### \"İyi çalışıyor\" neden yetmez?\nÖlçülemeyen bir iddia ne kanıtlanabilir ne çürütülebilir. Mühendis işe başlamadan önce **kabul ölçütünü** yazar: hangi ölçümde, hangi sayıyı gördüğümde \"bitti\" diyeceğim? Ölçüt hem hedefi hem sınav kâğıdını belirler. Robotu yaptıktan sonra yazılan ölçüt, robota göre eğilir; bu bir ölçüt değil, bahanedir.\n\n### Ölçülebilir gereksinim\nİyi bir gereksinimde üç şey bulunur: bir **sayı**, bir **birim** ve bir **ölçüm yöntemi**.\n\n| Dilek (ölçülemez) | Gereksinim (ölçülebilir) |\n|---|---|\n| Düzgün gitsin | Parkuru 0 çarpmayla bitirsin |\n| Hassas olsun | Üç noktada uç noktası hatası 5 mm'den az |\n| Mesafeyi korusun | Hedef 20 cm ± 3 cm, yani 17-23 cm arasında kalsın |\n\nYolların ölçütleri bu haftaki üç projede şöyle yazılır: A (otonom araç) çarpmasız bitiriş ve bitiş çizgisinde durmak; B (robot kol) 5 mm'den küçük hata; C (takip robotu) 17-23 cm.\n\n### Sınır değerler ve mantık\nÖlçütü koda dökerken iki ayrıntı sonucu değiştirir.\n\n- **Sınır:** \"5 mm'den az\" katı bir ifadedir. Tam 5,0 ölçersen kaldın; kodda `<` kullanılır, `<=` değil. \"17-23 cm sınırlar dahil\" ise `>=` ve `<=` ister.\n- **Birleştirme:** A yolunda çarpma sayısı 0 olması yetmez; robot hiç hareket etmeden duruyorsa da çarpmamıştır. Bu yüzden ölçüt iki koşulun **ve**'sidir: `carpma == 0 && bitti == 1`. `||` kullanırsan çarpan ama bitiren robot da geçer.\n- **Aralık:** C yolunda ortalamaya değil, takip boyunca görülen **en küçük** ve **en büyük** değere bakılır. Ortalaması iyi olup bir an 12 cm'e yaklaşan robot kalır.\n\n### Tasarım belgesi\nKodun ilk satırından önce bir sayfa doldurulur: amaç (tek cümle), gereksinimler tablosu, alt sistemler ve arayüzleri, durum makinesi, test planı, riskler. Boş kalan kutu sonradan tartışma çıkarır. Belgede her alt sistemin **tek başına testi** de yazılır; ders 112 bunun üzerine kuruludur.\n\nGüç kuralı belgenin değişmez parçasıdır: motor ve servo, Arduino'nun 5 V pininden değil harici kaynaktan beslenir ve GND ortaktır.\n\n### Özet\nBitirme robotunun sınavı, robot yapılmadan yazılır: sayı, birim ve ölçüm yöntemi içeren kabul ölçütleri. Sınır değerler (`<` ile `<=`) ve koşulların birleşimi (`&&` ile `||`) sonucu değiştirir. Tasarım belgesi hedefi, alt sistemleri ve testleri tek sayfada toplar. Ölçütü sonradan gevşetmek değil, nedeniyle birlikte belgeye yazmak dürüstlüktür.",
          "concepts": [
            {
              "term": "Kabul ölçütü",
              "definition": "Bir işin \"bitti\" sayılması için ölçülen değerin sağlaması gereken, sayı ve birimle yazılmış koşul.",
              "example": "Takip robotu için \"hedef 20 cm ± 3 cm, yani 17-23 cm arasında kalır\".",
              "pitfall": "Ölçütü sonuç açıklandıktan sonra, robot tutturamadığı için gevşetmek."
            },
            {
              "term": "Ölçülebilir gereksinim",
              "definition": "Sayısı, birimi ve ölçüm yöntemi olan gereksinim.",
              "example": "\"Üç noktada uç noktası hatası 5 mm'den az; cetvelle ölçülür.\"",
              "pitfall": "\"Düzgün gitsin\" ya da \"hassas olsun\" yazmak: sayı yoksa gereksinim değil dilektir."
            },
            {
              "term": "Sınır değer",
              "definition": "Ölçütün tam eşikte nasıl davranacağı: katı (<) ya da dahil (<=).",
              "example": "\"5 mm'den az\" katıdır; 5,0 ölçersen kalırsın ve kod `hata < 5.0` yazar.",
              "pitfall": "`<` yerine `<=` yazıp tam eşiği geçti saymak."
            },
            {
              "term": "Alt sistem",
              "definition": "Tek bir iş yapan, tek başına sınanabilen ve kendi geçme koşulu olan parça.",
              "example": "Yol A'da sürüş, mesafe ve çizgi modülleri; her biri seri komutla ayrı denenir.",
              "pitfall": "\"Birleşince bakarım\" deyip alt sistemi sınamadan geçmek: hatanın kimden geldiği bilinmez."
            },
            {
              "term": "Tasarım belgesi",
              "definition": "Kod yazmadan önce doldurulan tek sayfa: amaç, gereksinimler, alt sistemler, durum makinesi, test planı, riskler.",
              "example": "Gereksinim tablosundaki her satırın yanında bir sayı ve \"nasıl ölçülür\" sütunu vardır.",
              "pitfall": "Boş kutu bırakmak: sonradan tartışmanın nedeni olur."
            },
            {
              "term": "Ortak GND",
              "definition": "Harici güç kaynağının eksi ucunun Arduino GND'sine bağlanması.",
              "example": "Servolar harici 5 V ile beslenir, kaynağın GND'si Arduino GND'siyle birleşir.",
              "pitfall": "Servo ya da motoru Arduino'nun 5 V pininden beslemek: kart resetlenir ya da zarar görür."
            }
          ],
          "quiz": [
            {
              "id": "m5h8d1-q1",
              "kind": "mcq",
              "prompt": "Aşağıdakilerden hangisi ölçülebilir bir gereksinimdir?",
              "options": [
                "Robot düzgün gitsin",
                "Robot hızlı olsun",
                "Hedefi 20 cm ± 3 cm mesafede takip etsin; mesafe cetvelle ölçülsün",
                "Robot hassas çalışsın"
              ],
              "answer": 2,
              "explanation": "Ölçülebilir gereksinimde sayı, birim ve ölçüm yöntemi bulunur: 20 ± 3 cm ve cetvel. Diğerleri sayısız dileklerdir; \"düzgün\", \"hızlı\", \"hassas\" ne kanıtlanabilir ne çürütülebilir.",
              "skills": [
                "bit-requirements",
                "prog-planning"
              ]
            },
            {
              "id": "m5h8d1-q2",
              "kind": "numeric",
              "prompt": "Takip robotunun ölçütü 20 cm ± 3 cm (sınırlar dahil). Takip boyunca en küçük ve en büyük mesafe arasındaki farkın alabileceği en büyük değer kaç cm'dir?",
              "answer": 6,
              "tolerance": 0,
              "unit": "cm",
              "explanation": "İzin verilen aralık 17 cm ile 23 cm arasıdır. En büyük fark 23 - 17 = 6 cm'dir; bunu aşan robot ölçütü sağlamaz.",
              "skills": [
                "bit-acceptance"
              ]
            },
            {
              "id": "m5h8d1-q3",
              "kind": "predict-output",
              "prompt": "Kol ölçütü \"uç noktası hatası 5 mm'den az\". Aşağıdaki kod çalışınca seri monitörde ne yazar?\n```\nfloat hata = 5.0;\nSerial.println(hata < 5.0 ? \"GECTI\" : \"KALDI\");\n```",
              "options": [
                "GECTI",
                "Derleme hatası verir",
                "Hiçbir şey yazmaz",
                "KALDI"
              ],
              "answer": 3,
              "explanation": "5.0 < 5.0 yanlıştır, bu yüzden \"KALDI\" yazar. \"5 mm'den az\" katı bir ifadedir; tam 5,0 geçmez. `<=` yazılsaydı GECTI yazardı, bu da ölçütü sessizce gevşetirdi.",
              "skills": [
                "bit-acceptance",
                "prog-debug"
              ]
            },
            {
              "id": "m5h8d1-q4",
              "kind": "find-bug",
              "prompt": "Yol A ölçütü \"çarpmadan bitir\". Kodda tek hata var; hangisi?\n```\nint carpma = 0;\nint bitti = 0;            // robot olduğu yerde duruyor\nbool gecti = (carpma == 0 || bitti == 1);\n```",
              "options": [
                "`carpma == 0` yerine `carpma != 0` olmalı",
                "`||` yerine `&&` olmalı; yoksa hiç hareket etmeyen robot da geçer",
                "`bitti` bool olmalı",
                "Değişkenler `int` olamaz"
              ],
              "answer": 1,
              "explanation": "Ölçüt iki koşulun birleşimidir: çarpma yok VE parkur bitti. `||` ile birinin sağlanması yeter; yerinde duran robot çarpmadığı için geçer. `carpma != 0` ise anlamı tersine çevirirdi.",
              "skills": [
                "bit-acceptance",
                "prog-debug"
              ]
            },
            {
              "id": "m5h8d1-q5",
              "kind": "mcq",
              "prompt": "Yol A'da tamponlar (D2, D3) ile enkoder aynı anda kullanılamaz. Neden?",
              "options": [
                "İkisi de analog giriş ister",
                "Tamponlar PWM kullanır",
                "İkisi de D2 ve D3 pinlerini ister",
                "Enkoder yalnız harici güçle çalışır"
              ],
              "answer": 2,
              "explanation": "Tamponlar ve enkoder kesme pinleri olan D2 ve D3'e bağlanır; aynı pine iki parça bağlanamaz. Bir parçayı seçmek ya da tasarımı değiştirmek gerekir. Analog giriş (A0-A4) çizgi sensörlerine ayrılmıştır.",
              "skills": [
                "circuit-wiring"
              ]
            }
          ]
        },
        {
          "title": "Yapım 1: alt sistemler",
          "durationMin": 40,
          "problem": "Üç yüz satırlık bir program yazdın, ilk kez çalıştırdın ve robot olduğu yerde dönüyor. Sorun motorda mı, sensörde mi, yoksa kararlarında mı? Hepsi birbirine karışmışsa bunu bilemezsin. Usta mühendisler büyük robotu küçük parçalara böler ve her parçayı **tek başına**, ölçerek sınar. Bugün seçtiğin yolun parçalarını yapıp tek tek sınayacaksın.",
          "contentMd": "Her alt sistem üç şeye sahip olur: tek bir işi yapan fonksiyonlar, tek başına çalıştırılabilen bir sınama yolu ve sayıyla yazılmış bir geçme koşulu. Seçtiğin yolun bölümünü yap; diğerlerini merak edersen oku.\n\n### Yol A: sürüş, mesafe ve çizgi modülleri\nDevre ders 111'deki Yol A tablosuyla aynıdır. Sketch üç modülü ayrı bölümlerde tutar ve seri porttan tek harfli komutlarla her birini ayrı ayrı çalıştırır.\n\n| Modül | Fonksiyon | Sınama komutu | Geçme koşulu |\n|---|---|---|---|\n| Sürüş | `surus(sol, sag)` | `i` ileri, `g` geri, `s` sola, `d` sağa | 1 sn ileri: 15-30 cm; 420 ms dönüş: 80-100° |\n| Mesafe | `tekOlcum()` | `m` | Cetvelle ölçtüğün mesafeden en çok 1,5 cm sapar |\n| Çizgi | `cizgiKonum(sayi)` | `c` | Çizgi ortadaki sensörün altında: konum 0; bir sensör aralığı (2 cm) sağdayken: konum -1 |\n\n```cpp\n// sketch: a_alt_sistem\n// Yol A alt sistem testi: sürüş, mesafe ve çizgi modüllerini seri komutla tek tek dene.\n// Komutlar: i = ileri 1 sn, g = geri 1 sn, s = sola dön 0,42 sn, d = sağa dön 0,42 sn,\n//           m = mesafe yaz, c = çizgi konumu yaz\nconst int SOL_EN = 5, SOL_IN1 = 7, SOL_IN2 = 8;\nconst int SAG_EN = 6, SAG_IN1 = 9, SAG_IN2 = 10;\nconst int TRIG = 11, ECHO = 12;\nconst int CIZGI[5] = {A0, A1, A2, A3, A4};\n\nconst int OLU_BOLGE = 51;      // PWM'in %20'si: altında tekerlek dönmez\nconst int TABAN = 150;\n\n// ---- SÜRÜŞ MODÜLÜ ----\nvoid motor(int en, int in1, int in2, int hiz) {\n  hiz = constrain(hiz, -255, 255);\n  if (hiz == 0) {\n    digitalWrite(in1, LOW);\n    digitalWrite(in2, LOW);\n    analogWrite(en, 0);\n    return;\n  }\n  digitalWrite(in1, hiz > 0);\n  digitalWrite(in2, hiz < 0);\n  analogWrite(en, map(abs(hiz), 1, 255, OLU_BOLGE, 255));   // ölü bölgeyi atla\n}\n\nvoid surus(int sol, int sag) {\n  motor(SOL_EN, SOL_IN1, SOL_IN2, sol);\n  motor(SAG_EN, SAG_IN1, SAG_IN2, sag);\n}\n\n// ---- MESAFE MODÜLÜ ----\nfloat tekOlcum() {\n  digitalWrite(TRIG, LOW);\n  delayMicroseconds(2);\n  digitalWrite(TRIG, HIGH);\n  delayMicroseconds(10);\n  digitalWrite(TRIG, LOW);\n  unsigned long s = pulseIn(ECHO, HIGH, 15000);\n  return s == 0 ? 400.0 : s / 58.0;      // yankı yoksa \"çok uzak\"\n}\n\n// ---- ÇİZGİ MODÜLÜ ----\n// Konum -2 ... +2 (artı = çizgi solda). sayi = çizgiyi gören sensör sayısı.\nfloat cizgiKonum(int &sayi) {\n  float toplam = 0;\n  sayi = 0;\n  for (int i = 0; i < 5; i++) {\n    if (analogRead(CIZGI[i]) > 512) {    // çizgi ~860, zemin ~164\n      toplam += 2 - i;\n      sayi++;\n    }\n  }\n  return sayi ? toplam / sayi : 0;\n}\n\nvoid setup() {\n  pinMode(SOL_EN, OUTPUT); pinMode(SOL_IN1, OUTPUT); pinMode(SOL_IN2, OUTPUT);\n  pinMode(SAG_EN, OUTPUT); pinMode(SAG_IN1, OUTPUT); pinMode(SAG_IN2, OUTPUT);\n  pinMode(TRIG, OUTPUT);\n  pinMode(ECHO, INPUT);\n  Serial.begin(9600);\n  Serial.println(\"hazir\");\n}\n\nvoid loop() {\n  if (Serial.available() == 0) return;\n  char komut = Serial.read();\n  switch (komut) {\n    case 'i': surus(TABAN, TABAN);   delay(1000); surus(0, 0); Serial.println(\"ileri bitti\"); break;\n    case 'g': surus(-TABAN, -TABAN); delay(1000); surus(0, 0); Serial.println(\"geri bitti\"); break;\n    case 's': surus(-TABAN, TABAN);  delay(420);  surus(0, 0); Serial.println(\"sol bitti\"); break;\n    case 'd': surus(TABAN, -TABAN);  delay(420);  surus(0, 0); Serial.println(\"sag bitti\"); break;\n    case 'm':\n      Serial.print(\"mesafe=\");\n      Serial.println(tekOlcum(), 1);\n      break;\n    case 'c': {\n      int sayi;\n      float konum = cizgiKonum(sayi);\n      Serial.print(\"konum=\");\n      Serial.print(konum, 2);\n      Serial.print(\" sayi=\");\n      Serial.println(sayi);\n      break;\n    }\n  }\n}\n```\n\n**Nasıl çalışıyor?**\n1. `motor()` bir tekerleği -255...255 arasında bir sayıyla sürer. İşaret yönü, büyüklük hızı belirler. Sıfır değilse hız `OLU_BOLGE` ile 255 arasına yeniden ölçeklenir; böylece küçük komutlar ölü bölgede (78. ders) kaybolmaz.\n2. `surus(sol, sag)` iki tekerleği birlikte yönetir. Aynı işaret düz gider, zıt işaret yerinde döner (76. ders).\n3. `tekOlcum()` HC-SR04'ün yankı süresini `pulseIn` ile ölçer ve 58'e bölerek santimetreye çevirir. Yankı gelmezse 400 cm döndürür, yani \"çok uzak\".\n4. `cizgiKonum()` beş sensörden çizgiyi görenlerin sıra numarasının ortalamasını alır: A2 ortadır (0), A0 en solda (+2), A4 en sağda (-2). Çizgiyi gören sensör sayısını `sayi` içinde verir; `sayi` sıfırsa çizgi kayıptır ve konum anlamsızdır.\n5. Sınama komutları `delay` kullanır. Bu bir alt sistem testidir, robotun asıl programı değildir; asıl programda (ders 113) `millis()` kullanacaksın.\n\n**Ölçerek öğrendiklerimiz (simülatörde):**\n- `i` komutu 1 sn'de yaklaşık 22,9 cm ilerletti. Kendi robotun farklı çıkabilir; bu yüzden ders 113'te hız yerine süre değil, durum ve sensör kullanacağız.\n- `s` ve `d` ile 420 ms'lik dönüş yaklaşık 91° döndürdü. Bu sayıyı biz ölçerek bulduk: aynı hızda 500 ms yaklaşık 108° döndürüyordu. Kendi robotunda `delay` süresini, robot tam 90° dönene kadar ayarla; iletki ya da telefonun pusulası işini görür.\n\n### Yol B: ters kinematik fonksiyonu ve servo sürücü\n*Arena etkinliğinde bu yol için **B: Robot kol** sekmesini aç: kolu `g x y` komutlarıyla hedeflere gönder, arena uç noktasını darbeden yeniden hesaplayıp 1 mm ölçütünü senin yerine sınar.*\n\nDevre ders 111'deki Yol B tablosudur (servolar D9, D10, D11; harici güç ve ortak GND). Kolun iki bölümü de 10 cm'dir. 108. derste gördüğün iki eksenli ters kinematiği burada tek bir yere topluyoruz. Açı düzenimiz şöyle:\n\n| Servo | Açı | Anlamı |\n|---|---|---|\n| Omuz (D9) | 0° / 90° | Kol yatay ileri / dik yukarı |\n| Dirsek (D10) | 0° / 90° | Kol düz uzamış / dirsek dik açıda |\n\nHedef nokta (x, y) santimetre; taban orijin, x ileri, y yukarı. Bu düzen 108. dersteki q1 ve q2 ile aynıdır (dirsek servosu doğrudan q2). Dirsek üstte çözümü şu adımlarla bulunur:\n\n```text\nc   = (x² + y² − L1² − L2²) / (2 · L1 · L2)       (kosinüs teoremi)\nq2  = acos(c)                                      (c, -1 ile 1 arasında değilse nokta erişilemez)\nq1  = atan2(y, x) + atan2(L2·sin q2, L1 + L2·cos q2)\nomuz servosu = q1 (derece),  dirsek servosu = q2 (derece)\nileri kinematik: x = L1·cos q1 + L2·cos(q1 − q2),  y = L1·sin q1 + L2·sin(q1 − q2)\n```\n\nServo sürücü açıyı darbe genişliğine çevirir. Servo kütüphanesinde 0° için 544 µs, 180° için 2400 µs'dir (21. ders: `write(90)` yaklaşık 1472 µs verir). `Servo.write()` yalnızca tam derece alır; `writeMicroseconds()` ise mikrosaniye hassasiyetinde konum verir.\n\n| Modül | Fonksiyon | Sınama komutu | Geçme koşulu |\n|---|---|---|---|\n| Ters kinematik | `tersKinematik(x, y, omuz, dirsek)` | `g x y` | Açılardan ileri kinematikle bulunan uç noktası, hedeften 1 mm'den az sapar |\n| Servo sürücü | `dereceyiUsYap(aci)` | `g x y` (satırdaki `us=`) | Pindeki darbe, yazılan µs ile 1,5 µs'den az farklı |\n| Erişim kontrolü | `tersKinematik` `false` döner | `g 25 0` | `ulasilamaz` yazar, servolar yerinde kalır |\n\n```cpp\n// sketch: b_alt_sistem\n#include <Servo.h>\n\nconst int OMUZ_PIN = 9;\nconst int DIRSEK_PIN = 10;\nconst int TUTUCU_PIN = 11;\n\nconst float L1 = 10.0;             // omuz - dirsek (cm)\nconst float L2 = 10.0;             // dirsek - uç (cm)\nconst int US_MIN = 544;            // Servo kütüphanesinin 0 derece darbesi\nconst int US_MAX = 2400;           // 180 derece darbesi\n\nServo omuz, dirsek, tutucu;\n\n// Derece (0-180) -> darbe genişliği (mikrosaniye)\nint dereceyiUsYap(float aci) {\n  aci = constrain(aci, 0.0, 180.0);\n  return (int)(US_MIN + aci * (US_MAX - US_MIN) / 180.0 + 0.5);\n}\n\n// Ters kinematik: hedef (x, y) cm -> servo açıları (derece). Ulaşılamazsa false.\n// Omuz servosu q1: 0 = yatay ileri, 90 = dik yukarı. Dirsek servosu q2: 0 = kol düz, 90 = dirsek dik açı.\nbool tersKinematik(float x, float y, float &omuzAci, float &dirsekAci) {\n  float r2 = x * x + y * y;\n  float c = (r2 - L1 * L1 - L2 * L2) / (2.0 * L1 * L2);\n  if (c < -1.0 || c > 1.0) return false;          // kol bu noktaya yetişmez\n  float s2 = acos(c);                              // dirsek bükülmesi q2 (radyan), dirsek üstte çözüm\n  float q1 = atan2(y, x) + atan2(L2 * sin(s2), L1 + L2 * cos(s2));\n  omuzAci = q1 * 180.0 / PI;\n  dirsekAci = s2 * 180.0 / PI;\n  return omuzAci >= 0.0 && omuzAci <= 180.0 && dirsekAci >= 0.0 && dirsekAci <= 180.0;\n}\n\n// İleri kinematik: açılardan uç noktasını bul (ters kinematiği doğrulamak için)\nvoid ileriKinematik(float omuzAci, float dirsekAci, float &x, float &y) {\n  float t1 = omuzAci * PI / 180.0;\n  float t2 = dirsekAci * PI / 180.0;\n  x = L1 * cos(t1) + L2 * cos(t1 - t2);\n  y = L1 * sin(t1) + L2 * sin(t1 - t2);\n}\n\nvoid setup() {\n  Serial.begin(9600);\n  Serial.setTimeout(50);\n  omuz.attach(OMUZ_PIN, US_MIN, US_MAX);\n  dirsek.attach(DIRSEK_PIN, US_MIN, US_MAX);\n  tutucu.attach(TUTUCU_PIN, US_MIN, US_MAX);\n  omuz.writeMicroseconds(dereceyiUsYap(90));\n  dirsek.writeMicroseconds(dereceyiUsYap(0));\n  tutucu.writeMicroseconds(dereceyiUsYap(30));\n}\n\nvoid loop() {\n  if (Serial.available() == 0) return;\n  char komut = Serial.read();\n  if (komut != 'g') return;                        // \"g 12 4\" = x=12 cm, y=4 cm'ye git\n  float x = Serial.parseFloat();\n  float y = Serial.parseFloat();\n  float a1, a2;\n  if (!tersKinematik(x, y, a1, a2)) {\n    Serial.println(\"ulasilamaz\");\n    return;\n  }\n  omuz.writeMicroseconds(dereceyiUsYap(a1));\n  dirsek.writeMicroseconds(dereceyiUsYap(a2));\n  float gx, gy;\n  ileriKinematik(a1, a2, gx, gy);\n  Serial.print(\"omuz=\");   Serial.print(a1, 2);\n  Serial.print(\" dirsek=\"); Serial.print(a2, 2);\n  Serial.print(\" us=\");    Serial.print(dereceyiUsYap(a1));\n  Serial.print(\",\");       Serial.print(dereceyiUsYap(a2));\n  Serial.print(\" kontrol=\"); Serial.print(gx, 2);\n  Serial.print(\",\");       Serial.println(gy, 2);\n}\n```\n\n**Nasıl çalışıyor?**\n1. `tersKinematik()` önce hedefin kolun menzilinde olup olmadığına bakar. İki bölüm de 10 cm olduğu için kol en fazla 20 cm uzanır; `g 25 0` bu yüzden reddedilir.\n2. Örnek: `g 12 4` komutu omuz 69,20° ve dirsek 101,54° verir; sketch `us=1258,1591` darbelerini üretir. Aynı açıları ileri kinematiğe geri sokan `kontrol=12.00,4.00` satırı, formülü doğru yazdığını gösterir. Bu \"gidiş-dönüş\" sınaması, bir fonksiyonu elle hesap yapmadan doğrulamanın ucuz yoludur.\n3. `dereceyiUsYap()` açıyı `544 + açı · (2400 − 544) / 180` ile mikrosaniyeye çevirir. `+ 0.5` yuvarlamak içindir.\n4. `ileriKinematik()` kolun ucunun nerede olduğunu açılardan hesaplar. Gerçek kolda uç noktasını ölçmek için cetvel kullanırsın; bu fonksiyon cetvelin yerini tutmaz, yalnız formülünü sınar.\n\n**Ölçerek öğrendiklerimiz (simülatörde):**\n- Beş farklı hedefte (örneğin (12; 4), (8; 10), (4; 12), (14; 2), (10; 0)), servo pinlerinde ölçtüğümüz darbelerden bulunan uç noktası hedeften en çok 0,14 mm saptı.\n- Aynı açıları tam dereceye yuvarlasaydık (`Servo.write` gibi) en büyük sapma 0,9 mm olurdu. Yani yuvarlama tek başına 5 mm ölçütünü tehdit etmez. Asıl riskler mekaniktir: dişli boşluğu, kolun ağırlığıyla eğilmesi, servonun ölü bandı, kol uzunluklarını cetvelle hatalı ölçmek. Bunlar simülatörde yok; gerçek kolda ölçüt bunlarla zorlanır. Servonun ölü bandını kendi servonun veri sayfasında ara.\n\n### Yol C: mesafe PID alt sistemi\n*Arena etkinliğinde **C: Takip** sekmesi: 44 cm önündeki levhaya yaklaşan robotun gerçek mesafesi (ışın, gürültüsüz) sağ panelde görünür; 17-23 cm ölçütü bu değerle sınanır.*\n\nDevre ders 111'deki Yol C tablosudur. Öndeki hedefe 20 cm mesafeyi korumak için hata, hedef mesafe ile ölçülen mesafenin farkıdır: `hata = ölçülen − 20`. Artı hata \"hedef uzakta, ileri git\", eksi hata \"çok yakın, geri çekil\" demektir. PID'in üç terimini (96-98. dersler) toplarız.\n\n| Modül | Fonksiyon | Sınama | Geçme koşulu |\n|---|---|---|---|\n| Sürüş | `surus(sol, sag)` | Yol A ile aynı | Yol A'nın koşulları |\n| Mesafe | `mesafe()` (son 3 ölçümün ortancası) | Seri satır `mesafe=` | Cetvelle ölçtüğün mesafeden en çok 1,5 cm sapar |\n| PID | `loop()` içinde | Duran hedef | Yakalamadan 10 sn sonra 17-23 cm |\n\n```cpp\n// sketch: c_mesafe_pid\n// Yol C alt sistemi: öndeki hedefe 20 cm mesafeyi PID ile koru.\nconst int SOL_EN = 5, SOL_IN1 = 7, SOL_IN2 = 8;\nconst int SAG_EN = 6, SAG_IN1 = 9, SAG_IN2 = 10;\nconst int TRIG = 11, ECHO = 12;\n\nconst int OLU_BOLGE = 51;\nconst float HEDEF_CM = 20.0;\nconst float KP = 9.0;\nconst float KI = 4.0;\nconst float KD = 6.0;\nconst float I_SINIR = 40.0;        // integral toplamının üst sınırı (windup önleme)\nconst float OLU_ARALIK_CM = 0.5;   // hedefe bu kadar yakınsa dur\nconst unsigned long DONGU_MS = 60;\n\nfloat mesafeler[3] = {400, 400, 400};\nfloat integral = 0, oncekiHata = 0;\nunsigned long sonDongu = 0;\nunsigned long sonYazi = 0;\n\nvoid motor(int en, int in1, int in2, int hiz) {\n  hiz = constrain(hiz, -255, 255);\n  if (hiz == 0) { digitalWrite(in1, LOW); digitalWrite(in2, LOW); analogWrite(en, 0); return; }\n  digitalWrite(in1, hiz > 0);\n  digitalWrite(in2, hiz < 0);\n  analogWrite(en, map(abs(hiz), 1, 255, OLU_BOLGE, 255));\n}\n\nvoid surus(int sol, int sag) {\n  motor(SOL_EN, SOL_IN1, SOL_IN2, sol);\n  motor(SAG_EN, SAG_IN1, SAG_IN2, sag);\n}\n\nfloat tekOlcum() {\n  digitalWrite(TRIG, LOW);\n  delayMicroseconds(2);\n  digitalWrite(TRIG, HIGH);\n  delayMicroseconds(10);\n  digitalWrite(TRIG, LOW);\n  unsigned long s = pulseIn(ECHO, HIGH, 15000);\n  return s == 0 ? 400.0 : s / 58.0;\n}\n\nfloat mesafe() {\n  mesafeler[0] = mesafeler[1];\n  mesafeler[1] = mesafeler[2];\n  mesafeler[2] = tekOlcum();\n  float a = mesafeler[0], b = mesafeler[1], c = mesafeler[2];\n  if (a > b) { float t = a; a = b; b = t; }\n  if (b > c) { float t = b; b = c; c = t; }\n  if (a > b) { float t = a; a = b; b = t; }\n  return b;\n}\n\nvoid setup() {\n  pinMode(SOL_EN, OUTPUT); pinMode(SOL_IN1, OUTPUT); pinMode(SOL_IN2, OUTPUT);\n  pinMode(SAG_EN, OUTPUT); pinMode(SAG_IN1, OUTPUT); pinMode(SAG_IN2, OUTPUT);\n  pinMode(TRIG, OUTPUT);\n  pinMode(ECHO, INPUT);\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  if (millis() - sonDongu < DONGU_MS) return;\n  sonDongu += DONGU_MS;\n  float dt = DONGU_MS / 1000.0;\n\n  float d = mesafe();\n  float hata = d - HEDEF_CM;               // artı: hedef uzakta, ileri git\n  float turev = (hata - oncekiHata) / dt;\n  oncekiHata = hata;\n\n  float u = KP * hata + KI * integral + KD * turev;\n  bool doygun = fabs(u) >= 255;\n  if (!doygun) {                           // doyduysa integrali büyütme\n    integral = constrain(integral + hata * dt, -I_SINIR, I_SINIR);\n  }\n\n  int hiz = 0;\n  if (fabs(hata) >= OLU_ARALIK_CM) {\n    hiz = (int)constrain(u, -200, 200);\n  }\n  surus(hiz, hiz);\n\n  if (millis() - sonYazi >= 500) {         // ayar yaparken izlemek için\n    sonYazi = millis();\n    Serial.print(\"mesafe=\");\n    Serial.print(d, 1);\n    Serial.print(\" hata=\");\n    Serial.print(hata, 1);\n    Serial.print(\" hiz=\");\n    Serial.println(hiz);\n  }\n}\n```\n\n**Nasıl çalışıyor?**\n1. Ölçüm **ortanca filtreyle** (3 ölçümün ortancası) gelir; tek bir hatalı okuma (gürültü) kararı bozmaz.\n2. Döngü `millis()` ile her 60 ms'de bir çalışır. Sabit periyot, türev ve integral hesabının `dt` ile doğru olması içindir (103. ders).\n3. `u` üç terimin toplamıdır. Büyük hata büyük hız, hatanın hızlı değişmesi (`KD`) fren, uzun süre kalan küçük hata (`KI`) ek itme demektir.\n4. `I_SINIR` ve `doygun` kontrolü integralin şişmesini (windup, 98. ders) önler.\n5. Hedefe 0,5 cm'den yakınsa robot durur (ölü aralık); aksi hâlde ölçüm gürültüsü motorları sürekli titretebilir.\n6. Hız ±200 ile sınırlandı; tam hızın biraz altında kalır.\n7. `KP`, `KI`, `KD` değerlerini 99. dersteki gibi elle deneyerek simülatörde bulduk. Kendi robotunun motorları ve hedefi farklıdır, değerleri yeniden ayarlaman gerekir.\n\n**Ölçerek öğrendiklerimiz (simülatörde):**\n- Hedef duran bir levha, robot 44 cm'den başlıyor. İlk 10 sn'lik **yakalama** evresinde robot 20 cm'yi biraz aşıp 13,5 cm'e kadar yaklaştı. Bu yüzden kabul ölçütünü \"yakaladıktan sonra\" ölçeriz.\n- Yakalamadan sonraki 8 sn'de mesafe 18,6 ile 21,4 cm arasında kaldı. 17-23 cm ölçütü sağlanıyor. Ölçüm gürültüsü 1 cm olduğundan 1-2 cm oynama beklenir.\n- **Alt sistemin bir sınırı:** hedef aniden kaybolunca (levhayı çektik), bu alt sistem 1,5 sn içinde yaklaşık 38 cm ileri koştu. Çünkü uzak mesafeyi \"hedef çok uzakta, git\" diye yorumluyor. Bu davranış PID'in hatası değil, eksik **karar katmanıdır**: ders 113'te durum makinesi ekleyip bunu çözeceğiz.\n\n### Dene\n- **A:** `TABAN` değerini 100 ve 200 yap, `i` komutunu tekrarla. 1 sn'de gidilen yolu cetvelle ölç. Yol, `TABAN` ile orantılı mı, yoksa ölü bölge orantıyı bozuyor mu?\n- **A:** Robotu çizginin soluna ve sağına kaydır, `c` komutunun işaretini kontrol et. İşaret yanlışsa 113. derste robot çizgiden kaçar.\n- **B:** `g 19 0` ve `g 21 0` komutlarını dene. Biri servoları oynatır, öbürü `ulasilamaz` yazar. Kolun menzili neden 20 cm?\n- **B:** Kollarını 10 yerine 12 ve 8 cm yap (`L1`, `L2`). Ters kinematik hâlâ doğru mu? `kontrol=` satırı bunu söyler.\n- **C:** `KD` değerini 0 yap, sonra 20 yap. Seri çıktıdaki `hiz` değerleri nasıl değişiyor? Gürültü türevi nasıl etkiliyor?\n- **C:** `OLU_ARALIK_CM` değerini 0 yap. Robot hedefte duruyor mu, titriyor mu?\n\n### Sık yapılan hatalar\n- Alt sistemi sınamadan bir sonraki adıma geçmek. \"Birleşince bakarım\" dersen hatayı hangi parçanın yaptığını bulamazsın.\n- A: `OLU_BOLGE` kullanmadan düşük PWM vermek. Motor dönmez, \"çalışmıyor\" sanırsın.\n- A: Çizgi eşiğini (512) farklı zemin ve ışıkta denememek. Sensör değerlerini önce `Serial` ile oku (87. ders).\n- B: Servo gücünü Arduino'dan almak. Servolar hareket edince kart resetlenir. Harici güç ve ortak GND şart.\n- B: Dirsek açısını yanlış yöne almak. Formül doğru olabilir ama servoyu ters taktıysan kol zıt tarafa kıvrılır; bir kez `g 12 4` ile bakıp (omuz 69,20°, dirsek 101,54° olmalı) açı düzenini fiziksel kolla karşılaştır.\n- C: Mesafeyi filtrelemeden PID'e vermek: türev terimi gürültüyü büyütür.\n- C: Integral sınırlamamak: robot uzun süre hedefe ulaşamazsa integral şişer ve sonra hedefi aşar.",
          "question": "Bir alt sistem testi geçti ama birleştirince robot çalışmadı. Hata hangi katmanda olabilir? Alt sistem testlerinin sana hangi tür hatayı bulmaktan kurtardığını, hangisini bulamadığını düşün.",
          "explainerMd": "### Bu derste öğreneceklerin\n- Büyük bir robotu alt sistemlere bölmenin neden hata aramayı kolaylaştırdığını\n- Bir alt sistemin üç parçasını: tek işlik fonksiyonlar, tek başına test, sayıyla geçme koşulu\n- Yol A, B ve C için temel hesapları: ölü bölge, yankı süresi, servo darbesi, ters kinematik, PID\n- Gidiş-dönüş (ileri kinematikle geri sokma) sınamasını\n\n### Önceden bilmen gerekenler\n- 21. ders: servo ve darbe genişliği (`write(90)` yaklaşık 1472 µs)\n- 38. ders: ortanca (medyan) filtre\n- 76-78. dersler: sürüş ve motorun ölü bölgesi\n- 96-99. dersler: P, I, D terimleri ve windup; 108. ders: ters kinematik\n\n### Parçala ve ölç\nÜç yüz satırlık bir program ilk çalıştırmada olduğu yerde dönüyorsa suçlu motor, sensör ya da karar mantığı olabilir. Hepsi iç içeyse bunu ayıramazsın. Çözüm: her işi **alt sistem** yapmak. Alt sistem şu üçüne sahiptir: tek bir iş yapan fonksiyon (örneğin `surus(sol, sag)`), tek başına çalıştırma yolu (seri komut) ve sayıyla yazılmış geçme koşulu.\n\n### Yol A: sürüş, mesafe, çizgi\n- **Sürüş:** PWM'in %20'sinin (51) altında tekerlek dönmez. `motor()` sıfır olmayan komutu 51-255 arasına yeniden ölçekler: `map(abs(hiz), 1, 255, 51, 255)`. Komut 128 ise çıkış 153 olur.\n- **Mesafe:** HC-SR04 süre verir. Mesafe (cm) = süre (µs) / 58. 1160 µs yaklaşık 20 cm eder. Yankı yoksa 400 döndürülür (\"çok uzak\").\n- **Çizgi:** Beş sensörün numaraları ağırlık olur: A0 = +2, A2 = 0, A4 = -2. Konum, çizgiyi gören sensörlerin ortalamasıdır. Hiç sensör görmüyorsa konum anlamsızdır; kod bunu `sayi` ile ayırır.\n\n### Yol B: ters kinematik ve servo sürücü\nİki bölümü 10 cm olan kolun menzili 20 cm'dir; daha uzak hedefte kosinüs değeri 1'i aşar ve fonksiyon `false` döner. Servo kütüphanesinde açı darbeye çevrilir: us = 544 + açı × 1856 / 180. Örneğin 45° için 1008 µs. Hedef (10; 10) için omuz 90°, dirsek 90° bulunur.\n\nDoğrulama için **gidiş-dönüş** kullanılır: bulunan açıları ileri kinematiğe geri sok; çıkan nokta hedefle aynıysa formül doğrudur. Bu, elle hesap yapmadan bir fonksiyonu sınamanın ucuz yoludur.\n\n### Yol C: mesafe PID\nHata, ölçülen mesafe eksi 20 cm'dir. Çıkış `u = KP·hata + KI·integral + KD·türev`. Ölçüm önce üç değerin **ortancasından** geçer, çünkü türev gürültüyü büyütür. İntegral sınırlanır (windup) ve hedefe 0,5 cm'den yakınsa robot durur (ölü aralık).\n\nBu alt sistemin bilinen sınırı: hedef birden kaybolunca ölçüm 400 cm gelir ve PID \"hedef çok uzakta, git\" der. Robot yaklaşık 38 cm ileri koşar. Hata PID'de değil, **eksik karar katmanındadır**; çözümü ders 113'te.\n\n### Özet\nAlt sistem, tek işi olan ve tek başına sınanan bir parçadır. Yol A'da ölü bölge ölçeklemesi, yankı süresinden mesafe ve çizgi konumu; Yol B'de menzil, servo darbesi ve gidiş-dönüş sınaması; Yol C'de filtreli ölçümle PID kurulur. Her alt sistem kendi geçme koşulunu sayıyla taşır; birleştirmeye sınanmamış parça sokulmaz.",
          "concepts": [
            {
              "term": "Ölü bölge",
              "definition": "Motorun hiç dönmediği düşük PWM aralığı; bu robotta PWM'in %20'si (51).",
              "example": "`map(abs(hiz), 1, 255, 51, 255)` ile komut 128 olunca çıkış 153 olur.",
              "pitfall": "Düşük PWM verip motorun \"çalışmıyor\" olduğunu sanmak."
            },
            {
              "term": "Yankı süresinden mesafe",
              "definition": "HC-SR04 mesafeyi değil süreyi verir; yaklaşık 58 µs = 1 cm.",
              "example": "`pulseIn` 1160 µs verirse mesafe 1160 / 58 = 20 cm.",
              "pitfall": "Yankı gelmeyen 0 sonucunu 0 cm sanmak; kodda \"çok uzak\" (400) olarak ele alınır."
            },
            {
              "term": "Servo darbe genişliği",
              "definition": "Açıyı mikrosaniyeye çeviren doğrusal bağıntı: us = 544 + açı × 1856 / 180.",
              "example": "45° için 1008 µs; 90° için 1472 µs.",
              "pitfall": "`write()` içine derece yerine mikrosaniye ya da radyan yazmak."
            },
            {
              "term": "Gidiş-dönüş sınaması",
              "definition": "Ters kinematikle bulunan açıları ileri kinematiğe geri sokup hedefe dönülüp dönülmediğine bakmak.",
              "example": "`g 12 4` için omuz 69,20° ve dirsek 101,54° bulunur; ileri kinematik `12.00, 4.00` verir.",
              "pitfall": "Servoyu ters takıp formülü suçlamak: açı düzenini fiziksel kolla da karşılaştır."
            },
            {
              "term": "Ortanca (medyan) filtre",
              "definition": "Son üç ölçümün ortadaki değerini kullanan filtre; tek bir kötü okumayı eler.",
              "example": "20, 90, 21 cm ölçümlerinde sonuç 21 cm.",
              "pitfall": "Filtresiz ölçümü PID'in türev terimine vermek: gürültüyü büyütür."
            },
            {
              "term": "Windup sınırı",
              "definition": "PID integralinin üst-alt sınırla tutulması ve çıkış doyunca büyütülmemesi.",
              "example": "`constrain(integral + hata * dt, -40, 40)`",
              "pitfall": "Integral sınırlamamak: robot uzun süre ulaşamazsa integral şişer ve hedefi aşar."
            }
          ],
          "quiz": [
            {
              "id": "m5h8d2-q1",
              "kind": "numeric",
              "prompt": "Servo sürücüde `dereceyiUsYap(45)` çağrılıyor (0° = 544 µs, 180° = 2400 µs, doğrusal). Darbe genişliği kaç µs olur?",
              "answer": 1008,
              "tolerance": 1,
              "unit": "µs",
              "explanation": "544 + 45 × (2400 - 544) / 180 = 544 + 464 = 1008 µs. Doğruluk kontrolü: 0° için 544 µs, 90° için 1472 µs; 45° bu ikisinin tam ortasıdır: (544 + 1472) / 2 = 1008.",
              "skills": [
                "rob-servo-pulse"
              ]
            },
            {
              "id": "m5h8d2-q2",
              "kind": "predict-output",
              "prompt": "Ortanca filtre üç değeri sıralıyor. Bu kod ne yazar?\n```\nfloat a = 20, b = 90, c = 21;\nif (a > b) { float t = a; a = b; b = t; }\nif (b > c) { float t = b; b = c; c = t; }\nif (a > b) { float t = a; a = b; b = t; }\nSerial.println(b);\n```",
              "options": [
                "20.00",
                "90.00",
                "21.00",
                "131.00"
              ],
              "answer": 2,
              "explanation": "Birinci kıyas takas yapmaz (20 > 90 yanlış). İkincisi 90 > 21 olduğu için b ile c'yi değiştirir: b = 21, c = 90. Üçüncüsü (20 > 21) yanlıştır. Ortadaki değer b = 21 yazar; `println` float'ı iki ondalıkla yazar. 90 bir aykırı ölçümdü ve elendi.",
              "skills": [
                "rob-median",
                "prog-debug"
              ]
            },
            {
              "id": "m5h8d2-q3",
              "kind": "numeric",
              "prompt": "Her bölümü 10 cm olan iki eksenli kol, ucu (10; 10) cm noktasına götürülüyor. Ters kinematik hangi omuz açısını (derece) verir?",
              "answer": 90,
              "tolerance": 0.5,
              "unit": "°",
              "explanation": "c = (100 + 100 - 100 - 100) / 200 = 0, dolayısıyla dirsek = acos(0) = 90°. Omuz = atan2(10, 10) + atan2(10 sin 90°, 10 + 10 cos 90°) = 45° + 45° = 90°. Gidiş-dönüş: x = 10 cos 90° + 10 cos 0° = 10, y = 10 sin 90° + 0 = 10.",
              "skills": [
                "rob-ik-check"
              ]
            },
            {
              "id": "m5h8d2-q4",
              "kind": "find-bug",
              "prompt": "Çizgi konumu A0 (en sol) için +2, A4 (en sağ) için -2 olmalı. Kodda tek hata var; hangisi?\n```\nfloat cizgiKonum(int &sayi) {\n  float toplam = 0;\n  sayi = 0;\n  for (int i = 0; i < 5; i++) {\n    if (analogRead(CIZGI[i]) > 512) {\n      toplam += i - 2;\n      sayi++;\n    }\n  }\n  return sayi ? toplam / sayi : 0;\n}\n```",
              "options": [
                "Döngü `i < 5` yerine `i <= 5` olmalı",
                "`toplam += i - 2;` yerine `toplam += 2 - i;` olmalı; işaret ters olduğu için robot çizgiden kaçar",
                "Eşik 512 yerine 1023 olmalı",
                "`sayi` referans olmamalı"
              ],
              "answer": 1,
              "explanation": "Konum A0 için +2 olmalı: 2 - 0 = +2. Kod i - 2 = -2 verir; konum işareti ters çıkar ve çizgi izleyen robot çizgiden uzaklaşır. `i <= 5` diziden taşar (A5 yok). Eşik 512 ölçülen 164-860 aralığının ortasıdır.",
              "skills": [
                "bit-subsystems",
                "prog-debug"
              ]
            },
            {
              "id": "m5h8d2-q5",
              "kind": "mcq",
              "prompt": "Yol C alt sistemi hedef birden kaybolunca yaklaşık 38 cm ileri koştu. Asıl neden hangisidir?",
              "options": [
                "Alt sistemde \"hedef yok\" kararı yok; 400 cm ölçümü \"çok uzakta, git\" diye yorumlanıyor",
                "PID katsayıları yanlış ayarlandı",
                "HC-SR04 bozuk",
                "Motorların ölü bölgesi var"
              ],
              "answer": 0,
              "explanation": "PID kendi işini doğru yaptı: hata büyük, hız büyük. Eksik olan karar katmanıdır (durum makinesi). Çözüm ders 113'te: hedef yoksa hemen dur. KP'yi ya da sensörü değiştirmek belirtiyi gizlerdi, nedeni değil.",
              "skills": [
                "bit-subsystems",
                "rob-failsafe"
              ]
            }
          ]
        },
        {
          "title": "Yapım 2: entegrasyon ve test",
          "durationMin": 40,
          "problem": "Dünkü Yol C alt sistemi hedef kaybolunca 38 cm ileri koşmuştu. PID hata yapmadı; yalnızca \"hedef yok\" diye bir şey bilmiyordu. Alt sistemler parçaların işini yapar, ama hangisinin ne zaman çalışacağına bir karar katmanı karar verir. Bu derste parçaları **durum makinesiyle** (28. ve 84. dersler) birleştirecek ve bir **test matrisiyle** sınayacaksın.",
          "contentMd": "Birleştirmenin kuralı basittir: her durumda tek bir davranış çalışır, durumlar arası geçişler koşullara bağlıdır, her koşul bir sensörden ya da zamandan gelir.\n\nSen yalnız seçtiğin yolun bölümünü yap; diğerlerini okumak zorunda değilsin.\n\n### Test matrisi nedir?\nBir tablo: her satır bir **senaryo**, her sütun **beklenen sonuç** ve **ölçülen sonuç**. Önce beklenen sütunu doldurursun (ders 111'deki ölçütlerden), sonra ölçersin, sonra karşılaştırırsın. Hata varsa satır kırmızıya döner ve nedenini aranır. Aşağıda her yolun matrisi var; ölçülen sütunu simülatörden aldık.\n\n### Yol A: çizgi izle, engelden kaç, bitiş çizgisinde dur\nDurumlar:\n\n| Durum | Ne yapar | Çıkış koşulu |\n|---|---|---|\n| CIZGI_IZLE | Çizgi konumuna göre iki tekerleğin hızını ayarlar | Daha önce çizgi görüldü ve 300 ms çizgi yok: SERBEST |\n| SERBEST | Düz gider | Üç sensör birden çizgide: BITTI. Önde 28 cm'den yakın engel: SOLA_DON |\n| SOLA_DON | Yerinde sola döner (420 ms, yaklaşık 90°) | Süre doldu: YANA_GIT |\n| YANA_GIT | Düz gider, engelin yanından geçer (2 sn) | Süre doldu: SAGA_DON |\n| SAGA_DON | Yerinde sağa döner (420 ms) | Süre doldu: SERBEST |\n| BITTI | Durur | Yok |\n\nSürüş, mesafe ve çizgi fonksiyonları ders 112'dekilerle aynıdır; yeni olan `loop()` içindeki durum makinesidir. Mesafe her 60 ms'de bir ölçülür. Programda `delay()` yoktur (HC-SR04 için gereken kısa `delayMicroseconds` ve `pulseIn` hariç): dönüş ve yan gitme süreleri `millis()` ile sayılır (27. ders).\n\n```cpp\n// sketch: a_arac\n// Yol A: çizgiyi izle, çizgi bitince engelden kaçarak ilerle, bitiş çizgisinde dur.\nconst int SOL_EN = 5, SOL_IN1 = 7, SOL_IN2 = 8;\nconst int SAG_EN = 6, SAG_IN1 = 9, SAG_IN2 = 10;\nconst int TRIG = 11, ECHO = 12;\nconst int CIZGI[5] = {A0, A1, A2, A3, A4};\n\nconst int OLU_BOLGE = 51;          // PWM'in %20'si: altında tekerlek dönmez\nconst int TABAN = 150;             // düz giderken hız\nconst float KP = 55.0;             // çizgi konumu başına hız farkı\nconst float ENGEL_CM = 28.0;       // bundan yakınsa engel var\nconst unsigned long KAYIP_MS = 300;   // çizgisiz geçen bu süre = çizgi bitti\nconst unsigned long DONUS_MS = 420;   // yaklaşık 90 derece dönüş süresi (ölçerek bulundu)\nconst unsigned long YAN_MS = 2000;    // engelin yanından gitme süresi\n\nenum Durum { CIZGI_IZLE, SERBEST, SOLA_DON, YANA_GIT, SAGA_DON, BITTI };\nDurum durum = CIZGI_IZLE;\nunsigned long durumBasla = 0;\nunsigned long sonCizgi = 0;\nbool cizgiGordu = false;\n\nfloat mesafeler[3] = {400, 400, 400};\nunsigned long sonOlcum = 0;\n\nvoid motor(int en, int in1, int in2, int hiz) {\n  hiz = constrain(hiz, -255, 255);\n  if (hiz == 0) { digitalWrite(in1, LOW); digitalWrite(in2, LOW); analogWrite(en, 0); return; }\n  digitalWrite(in1, hiz > 0);\n  digitalWrite(in2, hiz < 0);\n  analogWrite(en, map(abs(hiz), 1, 255, OLU_BOLGE, 255));\n}\n\nvoid surus(int sol, int sag) {\n  motor(SOL_EN, SOL_IN1, SOL_IN2, sol);\n  motor(SAG_EN, SAG_IN1, SAG_IN2, sag);\n}\n\nfloat tekOlcum() {\n  digitalWrite(TRIG, LOW);\n  delayMicroseconds(2);\n  digitalWrite(TRIG, HIGH);\n  delayMicroseconds(10);\n  digitalWrite(TRIG, LOW);\n  unsigned long s = pulseIn(ECHO, HIGH, 15000);\n  return s == 0 ? 400.0 : s / 58.0;   // yankı yoksa \"çok uzak\"\n}\n\n// Son 3 ölçümün ortancası (tek bir hatalı okuma kararı bozmaz)\nfloat mesafe() {\n  mesafeler[0] = mesafeler[1];\n  mesafeler[1] = mesafeler[2];\n  mesafeler[2] = tekOlcum();\n  float a = mesafeler[0], b = mesafeler[1], c = mesafeler[2];\n  if (a > b) { float t = a; a = b; b = t; }\n  if (b > c) { float t = b; b = c; c = t; }\n  if (a > b) { float t = a; a = b; b = t; }\n  return b;\n}\n\n// Çizgi konumu: -2 ... +2 (artı = çizgi solda). Kaç sensör çizgide: sayi\nfloat cizgiKonum(int &sayi) {\n  float toplam = 0;\n  sayi = 0;\n  for (int i = 0; i < 5; i++) {\n    if (analogRead(CIZGI[i]) > 512) {   // çizgi ~860, zemin ~164\n      toplam += 2 - i;\n      sayi++;\n    }\n  }\n  return sayi ? toplam / sayi : 0;\n}\n\nvoid durumDegis(Durum yeni) {\n  durum = yeni;\n  durumBasla = millis();\n}\n\nvoid setup() {\n  pinMode(SOL_EN, OUTPUT); pinMode(SOL_IN1, OUTPUT); pinMode(SOL_IN2, OUTPUT);\n  pinMode(SAG_EN, OUTPUT); pinMode(SAG_IN1, OUTPUT); pinMode(SAG_IN2, OUTPUT);\n  pinMode(TRIG, OUTPUT);\n  pinMode(ECHO, INPUT);\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  unsigned long simdi = millis();\n  int sayi;\n  float konum = cizgiKonum(sayi);\n\n  // Mesafeyi 60 ms'de bir ölç\n  static float onde = 400;\n  if (simdi - sonOlcum >= 60) {\n    sonOlcum = simdi;\n    onde = mesafe();\n  }\n\n  switch (durum) {\n    case CIZGI_IZLE:\n      if (sayi > 0) {\n        cizgiGordu = true;\n        sonCizgi = simdi;\n        int fark = (int)(KP * konum);\n        surus(TABAN - fark, TABAN + fark);\n      } else if (cizgiGordu && simdi - sonCizgi > KAYIP_MS) {\n        durumDegis(SERBEST);\n        Serial.println(\"durum: SERBEST\");\n      }\n      // çizgi hiç görülmediyse (başlangıç) son komut sürer\n      break;\n\n    case SERBEST:\n      if (sayi >= 3) {\n        surus(0, 0);\n        durumDegis(BITTI);\n        Serial.println(\"durum: BITTI\");\n      } else if (onde < ENGEL_CM) {\n        durumDegis(SOLA_DON);\n      } else {\n        surus(TABAN, TABAN);\n      }\n      break;\n\n    case SOLA_DON:\n      surus(-TABAN, TABAN);\n      if (simdi - durumBasla >= DONUS_MS) durumDegis(YANA_GIT);\n      break;\n\n    case YANA_GIT:\n      surus(TABAN, TABAN);\n      if (simdi - durumBasla >= YAN_MS) durumDegis(SAGA_DON);\n      break;\n\n    case SAGA_DON:\n      surus(TABAN, -TABAN);\n      if (simdi - durumBasla >= DONUS_MS) durumDegis(SERBEST);\n      break;\n\n    case BITTI:\n      surus(0, 0);\n      break;\n  }\n}\n```\n\n**Nasıl çalışıyor?**\n1. Her `loop` turunda çizgi okunur, 60 ms'de bir mesafe ölçülür, sonra yalnızca **o anki durumun** kodu çalışır.\n2. `CIZGI_IZLE` içinde çizgi konumuna göre bir fark hesaplanır: `fark = KP · konum`. Çizgi solda (konum artı) ise sol tekerlek yavaşlar, sağ hızlanır, robot sola döner.\n3. \"Çizgi bitti\" kararı tek bir okumaya bağlı değildir: çizgi 300 ms boyunca hiç görülmezse SERBEST'e geçilir. Tek bir sensör hatası, çizgi bitişi sanılmaz (89. ders).\n4. Engel dolanma bir **desen**dir: sola dön, yana git, sağa dön, tekrar bak. Engel hâlâ ortadaysa durum makinesi aynı deseni tekrar eder. Duvarın ucunu bir turda aşamazsa ikinci turda aşar.\n5. Bitiş çizgisi çapraz olduğu için üç sensör birden görür. Bu kontrol yalnız SERBEST durumunda yapılır; çizgi izlerken yanıltmasın.\n\n**Test matrisi (Yol A).** Geçme koşulu: bitiş çizgisinde durmak, çarpmamak (robot merkezi ile en yakın duvar arası en az 8 cm; robot yarıçapı 7,5 cm) ve 20 sn'den kısa sürmek.\n\n| No | Senaryo | Beklenen | Ölçülen (simülatör) |\n|---|---|---|---|\n| T1 | Çizginin 4 cm sağında başla | Bitir, çarpma yok | 11,2 sn, en yakın duvar 18,1 cm |\n| T2 | 5 cm sağda, 6° açılı başla | Bitir, çarpma yok | 11,2 sn, en yakın duvar 18,2 cm |\n| T3 | 3 cm solda, -6° açılı başla | Bitir, çarpma yok | 11,2 sn, en yakın duvar 18,1 cm |\n| T4 | Sağ motor %4 zayıf | Bitir, çarpma yok | 11,2 sn, en yakın duvar 10,0 cm |\n| T5 | Sağ motor %3 güçlü | Bitir, çarpma yok | 11,4 sn, en yakın duvar 12,7 cm |\n| T6 | Bitiş sonrası 1 sn bekle | Robot kıpırdamaz | Kıpırdamadı (5 mm'den az) |\n\nT4 ve T5'te duvara yakınlık azaldı; yani tekerlek uyumsuzluğu tolerans payını yiyor. Bu payı bilmek, ölçütü gerçek robotta yazarken önemlidir (93. ders).\n\n**Arenada sensör aralığı farklı: KP'yi yeniden ayarla.** Yukarıdaki tablo, sensörleri 2,0 cm aralıklı dizilmiş bir sınama düzeneğinde ölçüldü. Laboratuvardaki **arenada** (bu dersin etkinliği) çizgi sensörleri 2,4 cm aralıklıdır. `cizgiKonum()` konumu sensör **numarası** cinsinden verir (−2 ... +2); sensörler %20 daha seyrek olduğundan aynı konum değeri artık %20 daha büyük bir gerçek sapmaya karşılık gelir ve `KP = 55` ile düzeltme fazla sert olur. Arenada ölçtüğümüz:\n\n| `KP` | Arena sonucu |\n|---|---|\n| 55 | Çizgiyi kaybediyor: 3,6 sn'de, çizgi bitmeden (x = 1,02 m; çizgi 1,30 m'ye kadar gidiyor) çaprazın ortasında `durum: SERBEST` yazılıyor. Robot serbest dolaşıp 3 kez çarpıyor ve pisti bitiremiyor |\n| 52 ve altı | Bitiriyor (yaklaşık 11,5 sn), çarpma yok |\n| **46** | Bitiriyor (11,3 sn), çarpma yok; `SERBEST`'e doğru yerde, çizgi bittikten sonra (x = 1,31 m) geçiyor |\n\nÖneri: arenada `KP = 46` kullan (55 / 1,2 ≈ 46; sensör aralığı %20 büyüdüğü için kazancı aynı oranda küçülttük). Genel kural: sensör aralığını değiştirirsen ya da farklı bir dizi kullanırsan `KP`'yi yeniden ölç; bir sayıyı başka bir düzenekten kopyalama. Arena etkinliğinin çözümünde bu yüzden `KP = 46` yazar. Bu dersin metnindeki `a_arac` sketch'i 2,0 cm'lik sınama düzeneğine göre `KP = 55` bırakıldı.\n\n### Yol B: üç noktadan al-bırak dizisi\n*Arena etkinliğinde **B: Robot kol** sekmesi: parça P1'de durur, yeşil daire P3'tür; tutucu 90°'nin üstünde kapalı sayılır (bu dersteki sketch'te açık = 30°, kapalı = 100°). Arena parçanın gerçekten alınıp bırakıldığını da sınar.*\n\nDurumlar:\n\n| Durum | Ne yapar | Çıkış koşulu |\n|---|---|---|\n| P1_GIT | Kolu P1'e götürür | Vardı ve 500 ms bekledi: tutucuyu kapat, P1_TUT |\n| P1_TUT | Tutucunun kapanmasını bekler | 500 ms geçti: P2'ye yönel, P2_GIT |\n| P2_GIT | Parçayı P2'ye taşır | Vardı ve bekledi: P3'e yönel, P3_GIT |\n| P3_GIT | Parçayı P3'e taşır | Vardı ve bekledi: tutucuyu aç, P3_BIRAK |\n| P3_BIRAK | Tutucunun açılmasını bekler | 500 ms geçti: \"dizi bitti\", BITTI |\n\nKol noktalar arasında zıplamaz: her 20 ms'de her eklem en çok 1,5° ilerler (`adimAt`). Hareket yumuşak olur, servo ve parça ani sarsılmaz. Bekleme süreleri kolun oturması ve tutucunun kapanması içindir. Sketch her noktaya varışta bir satır yazar (`nokta=1`, `nokta=2`, `nokta=3`), böylece ölçüm anını biliriz.\n\n```cpp\n// sketch: b_kol\n// Yol B: üç noktadan al-bırak dizisi. P1'den al, P2'den geçir, P3'e bırak.\n#include <Servo.h>\n\nconst int OMUZ_PIN = 9;\nconst int DIRSEK_PIN = 10;\nconst int TUTUCU_PIN = 11;\n\nconst float L1 = 10.0;\nconst float L2 = 10.0;\nconst int US_MIN = 544;\nconst int US_MAX = 2400;\nconst float TUTUCU_ACIK = 30.0;\nconst float TUTUCU_KAPALI = 100.0;\n\nconst float NOKTA_X[3] = {12.0, 8.0, 4.0};     // cm\nconst float NOKTA_Y[3] = {4.0, 10.0, 12.0};\nconst float ADIM_DERECE = 1.5;                 // her 20 ms'de en çok bu kadar\nconst unsigned long ADIM_MS = 20;\nconst unsigned long BEKLEME_MS = 500;          // noktada durma süresi\n\nenum Durum { P1_GIT, P1_TUT, P2_GIT, P3_GIT, P3_BIRAK, BITTI };\nDurum durum = P1_GIT;\n\nServo omuz, dirsek, tutucu;\nfloat omuzSimdi = 90, dirsekSimdi = 0;         // şu anki açılar\nfloat omuzHedef = 90, dirsekHedef = 0;         // gidilecek açılar\nunsigned long sonAdim = 0;\nunsigned long beklemeBasla = 0;\nbool bekliyor = false;\n\nint dereceyiUsYap(float aci) {\n  aci = constrain(aci, 0.0, 180.0);\n  return (int)(US_MIN + aci * (US_MAX - US_MIN) / 180.0 + 0.5);\n}\n\nbool tersKinematik(float x, float y, float &omuzAci, float &dirsekAci) {\n  float c = (x * x + y * y - L1 * L1 - L2 * L2) / (2.0 * L1 * L2);\n  if (c < -1.0 || c > 1.0) return false;\n  float s2 = acos(c);                          // q2: dirsek bükülmesi (0 = düz, 90 = dik)\n  float q1 = atan2(y, x) + atan2(L2 * sin(s2), L1 + L2 * cos(s2));\n  omuzAci = q1 * 180.0 / PI;\n  dirsekAci = s2 * 180.0 / PI;\n  return omuzAci >= 0.0 && omuzAci <= 180.0 && dirsekAci >= 0.0 && dirsekAci <= 180.0;\n}\n\nvoid noktayaGit(int n) {\n  if (!tersKinematik(NOKTA_X[n], NOKTA_Y[n], omuzHedef, dirsekHedef)) {\n    Serial.println(\"hata: nokta ulasilamaz\");\n  }\n}\n\n// Açıyı hedefe doğru bir adım ilerlet. Vardıysa true.\nbool adimAt() {\n  float fo = omuzHedef - omuzSimdi;\n  float fd = dirsekHedef - dirsekSimdi;\n  omuzSimdi += constrain(fo, -ADIM_DERECE, ADIM_DERECE);\n  dirsekSimdi += constrain(fd, -ADIM_DERECE, ADIM_DERECE);\n  omuz.writeMicroseconds(dereceyiUsYap(omuzSimdi));\n  dirsek.writeMicroseconds(dereceyiUsYap(dirsekSimdi));\n  return fabs(fo) < 0.01 && fabs(fd) < 0.01;\n}\n\nvoid nokta(int n) {                            // dizi kaydı: ölçüm için seri satır\n  Serial.print(\"nokta=\");\n  Serial.println(n);\n}\n\nvoid setup() {\n  Serial.begin(9600);\n  omuz.attach(OMUZ_PIN, US_MIN, US_MAX);\n  dirsek.attach(DIRSEK_PIN, US_MIN, US_MAX);\n  tutucu.attach(TUTUCU_PIN, US_MIN, US_MAX);\n  omuz.writeMicroseconds(dereceyiUsYap(omuzSimdi));\n  dirsek.writeMicroseconds(dereceyiUsYap(dirsekSimdi));\n  tutucu.writeMicroseconds(dereceyiUsYap(TUTUCU_ACIK));\n  noktayaGit(0);\n}\n\nvoid loop() {\n  unsigned long simdi = millis();\n  if (simdi - sonAdim < ADIM_MS) return;\n  sonAdim = simdi;\n\n  if (durum == BITTI) return;\n\n  bool vardi = adimAt();\n  if (!vardi) return;\n\n  // Vardık: biraz bekle (kol otursun), sonra sıradaki işe geç\n  if (!bekliyor) {\n    bekliyor = true;\n    beklemeBasla = simdi;\n    return;\n  }\n  if (simdi - beklemeBasla < BEKLEME_MS) return;\n  bekliyor = false;\n\n  switch (durum) {\n    case P1_GIT:\n      nokta(1);\n      tutucu.writeMicroseconds(dereceyiUsYap(TUTUCU_KAPALI));   // al\n      durum = P1_TUT;\n      break;\n    case P1_TUT:\n      noktayaGit(1);\n      durum = P2_GIT;\n      break;\n    case P2_GIT:\n      nokta(2);\n      noktayaGit(2);\n      durum = P3_GIT;\n      break;\n    case P3_GIT:\n      nokta(3);\n      tutucu.writeMicroseconds(dereceyiUsYap(TUTUCU_ACIK));     // bırak\n      durum = P3_BIRAK;\n      break;\n    case P3_BIRAK:\n      Serial.println(\"dizi bitti\");\n      durum = BITTI;\n      break;\n    default:\n      break;\n  }\n}\n```\n\n**Nasıl çalışıyor?**\n1. `noktayaGit(n)` yalnızca **hedef açıları** belirler. Servoyu asıl hareket ettiren `adimAt()`'tir; `loop` her 20 ms'de bir çağırır.\n2. `adimAt()` her eklemi hedefe doğru en çok 1,5° ilerletir ve her ikisi de vardıysa `true` döner. Böylece iki eklem aynı anda yola çıkar, kol yaylanmadan yürür.\n3. Vardıktan sonra 500 ms beklenir. Bu bekleme kolun mekanik olarak oturması ve tutucunun kapanması içindir. Simülatör servoyu anında bulur; **gerçek servo darbeyi aldığı anda yerinde olmaz**, bu beklemeyi kendi kolunda ölçerek ayarla.\n4. Her varışta `nokta=N` yazılır. Ölçüm bu satırın geldiği an yapılır.\n\n**Test matrisi (Yol B).** Ölçüm: nokta satırının geldiği anda D9 ve D10 pinlerindeki darbelerden uç noktası hesaplanır ve hedefle karşılaştırılır. Bu **komut edilen** konumdur; simülatör servonun mekanik hatasını içermez.\n\n| No | Senaryo | Beklenen | Ölçülen (simülatör) |\n|---|---|---|---|\n| T1 | P1'e var | Uç noktası hatası < 5 mm; tutucu açık | 0,05 mm; tutucu açık |\n| T2 | P2'ye taşı | Hata < 5 mm; tutucu kapalı (parça elde) | 0,06 mm; tutucu kapalı |\n| T3 | P3'e taşı | Hata < 5 mm | 0,09 mm |\n| T4 | Dizi bitişi | \"dizi bitti\" yazar; tutucu açık; 15 sn'den kısa | 4,2 sn; tutucu açık |\n| T5 | Hareketin yumuşaklığı | Omuz hiçbir 20 ms'de 2,5°'den fazla sıçramaz | Sıçramadı |\n\nGerçek kolda bu sayılar bu kadar iyi çıkmaz; tablodaki 0,05-0,09 mm, matematiğin ve servo darbesinin doğruluğudur. Kalan hatayı cetvelle ve kendi kolunla ölçeceksin.\n\n### Yol C: hedefi takip et, kaybolursa dur\n*Arena etkinliğinde **C: Takip** sekmesi: levha hareketi (uzaklaşma, kaybolma, geri dönme) arenada zamanla kendiliğinden olur; aşağıdaki T1, T5 ve T6 satırlarını sen elle yapmadan görürsün.*\n\nDurumlar:\n\n| Durum | Ne yapar | Çıkış koşulu |\n|---|---|---|\n| BEKLE | Durur, hedef arar | Menzilde (100 cm içinde) hedef görüldü: TAKIP |\n| TAKIP | PID ile 20 cm mesafeyi korur | Art arda 8 ölçüm (yaklaşık 0,5 sn) hedef yok: KAYIP |\n| KAYIP | Durur | Hedef göründü: TAKIP (PID sıfırlanır) |\n\nÖnemli ayrıntı: hedef yok olduğu **an** motorlar durur; KAYIP durumuna geçmeyi beklemez. Dur komutu, durum yazmaktan önce gelir. Hedef geri gelince PID'in integral ve eski hata değerleri sıfırlanır, aksi hâlde eski bir değerle fırlardı.\n\n```cpp\n// sketch: c_takip\n// Yol C: öndeki hedefi 20 cm mesafeden takip et; hedef kaybolursa dur.\nconst int SOL_EN = 5, SOL_IN1 = 7, SOL_IN2 = 8;\nconst int SAG_EN = 6, SAG_IN1 = 9, SAG_IN2 = 10;\nconst int TRIG = 11, ECHO = 12;\n\nconst int OLU_BOLGE = 51;\nconst float HEDEF_CM = 20.0;\nconst float MENZIL_CM = 100.0;         // bundan uzaktaki \"hedef\" sayılmaz\nconst float KP = 9.0;\nconst float KI = 4.0;\nconst float KD = 6.0;\nconst float I_SINIR = 40.0;\nconst float OLU_ARALIK_CM = 0.5;\nconst unsigned long DONGU_MS = 60;\nconst int KAYIP_SAYISI = 8;            // art arda bu kadar boş ölçüm = hedef kayıp (~0,5 sn)\n\nenum Durum { BEKLE, TAKIP, KAYIP };\nDurum durum = BEKLE;\n\nfloat mesafeler[3] = {400, 400, 400};\nfloat integral = 0, oncekiHata = 0;\nint bosSayac = 0;\nunsigned long sonDongu = 0;\n\nvoid motor(int en, int in1, int in2, int hiz) {\n  hiz = constrain(hiz, -255, 255);\n  if (hiz == 0) { digitalWrite(in1, LOW); digitalWrite(in2, LOW); analogWrite(en, 0); return; }\n  digitalWrite(in1, hiz > 0);\n  digitalWrite(in2, hiz < 0);\n  analogWrite(en, map(abs(hiz), 1, 255, OLU_BOLGE, 255));\n}\n\nvoid surus(int sol, int sag) {\n  motor(SOL_EN, SOL_IN1, SOL_IN2, sol);\n  motor(SAG_EN, SAG_IN1, SAG_IN2, sag);\n}\n\nfloat tekOlcum() {\n  digitalWrite(TRIG, LOW);\n  delayMicroseconds(2);\n  digitalWrite(TRIG, HIGH);\n  delayMicroseconds(10);\n  digitalWrite(TRIG, LOW);\n  unsigned long s = pulseIn(ECHO, HIGH, 15000);\n  return s == 0 ? 400.0 : s / 58.0;\n}\n\nfloat mesafe() {\n  mesafeler[0] = mesafeler[1];\n  mesafeler[1] = mesafeler[2];\n  mesafeler[2] = tekOlcum();\n  float a = mesafeler[0], b = mesafeler[1], c = mesafeler[2];\n  if (a > b) { float t = a; a = b; b = t; }\n  if (b > c) { float t = b; b = c; c = t; }\n  if (a > b) { float t = a; a = b; b = t; }\n  return b;\n}\n\nvoid pidSifirla() {\n  integral = 0;\n  oncekiHata = 0;\n}\n\nvoid setup() {\n  pinMode(SOL_EN, OUTPUT); pinMode(SOL_IN1, OUTPUT); pinMode(SOL_IN2, OUTPUT);\n  pinMode(SAG_EN, OUTPUT); pinMode(SAG_IN1, OUTPUT); pinMode(SAG_IN2, OUTPUT);\n  pinMode(TRIG, OUTPUT);\n  pinMode(ECHO, INPUT);\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  if (millis() - sonDongu < DONGU_MS) return;\n  sonDongu += DONGU_MS;\n  float dt = DONGU_MS / 1000.0;\n\n  float d = mesafe();\n  bool hedefVar = d < MENZIL_CM;\n\n  if (!hedefVar) {\n    surus(0, 0);                          // hedef yoksa anında dur (fail-safe)\n    bosSayac++;\n    if (durum == TAKIP && bosSayac >= KAYIP_SAYISI) {\n      durum = KAYIP;\n      Serial.println(\"durum: KAYIP\");\n    }\n    return;\n  }\n  bosSayac = 0;\n\n  if (durum != TAKIP) {                   // hedef (yeniden) göründü\n    durum = TAKIP;\n    pidSifirla();\n    Serial.println(\"durum: TAKIP\");\n  }\n\n  float hata = d - HEDEF_CM;\n  float turev = (hata - oncekiHata) / dt;\n  oncekiHata = hata;\n  float u = KP * hata + KI * integral + KD * turev;\n  if (fabs(u) < 255) {\n    integral = constrain(integral + hata * dt, -I_SINIR, I_SINIR);\n  }\n  int hiz = 0;\n  if (fabs(hata) >= OLU_ARALIK_CM) {\n    hiz = (int)constrain(u, -200, 200);\n  }\n  surus(hiz, hiz);\n}\n```\n\n**Nasıl çalışıyor?**\n1. `hedefVar` mesafenin menzilde (100 cm içinde) olup olmadığıdır. Menzil dışı ölçüm \"hedef yok\" sayılır. HC-SR04 yankı alamazsa `tekOlcum` 400 döndürdüğü için aynı yoldan geçer.\n2. Hedef yoksa robot hemen durur ve sayaç artar. Sayaç 8'e (yaklaşık 0,5 sn) varınca durum KAYIP olur. Ortanca filtre tek bir boş ölçümü zaten eler; art arda iki boş ölçüm robotu o tur için durdurur. Bu bilinçli bir tercihtir: emin olamıyorsan dur.\n3. Hedef geri gelince `pidSifirla()` çağrılır; eski integral yeni hedefe saldırtmaz (98. ders).\n4. `BEKLE` ve `KAYIP` davranışça aynıdır (durmak); ayrı yazılmalarının nedeni seri çıktıda \"hiç hedef görmedim\" ile \"hedefi kaybettim\" arasındaki farkı raporda görebilmektir.\n\n**Hareketli hedefi nasıl taklit ettik?** Simülatörde hedef, `arena.walls` dizisindeki bir duvar kesitidir. Dizi **değiştirilebilir** olduğundan, kesitin iki ucunun x değerini zamanla artırırsak hedef yavaşça uzaklaşır:\n\n```js\n// checks.mjs'ten: her 100 ms'de hedef 3 mm kayar = 3 cm/sn\nconst tahta = arena.walls.at(-1)        // [x1, y1, x2, y2]\ntahta[0] += 0.003; tahta[2] += 0.003\nsim.run(100)\n```\n\nGerçek robotta aynı deneyi bir arkadaşın elindeki karton levhayla yaparsın. Önemli: gerçek mesafeyi ölçen kişi cetveli robotun sensörüyle hedef arasında tutar, robotun kendi ölçümüne güvenmez.\n\n**Test matrisi (Yol C).** Ölçülen mesafe, simülatörün bildiği gerçek sensör-hedef mesafesidir (robotun gürültülü ölçümü değil). Her satırda ilk 10 sn yakalama, sonra ölçüm.\n\n| No | Senaryo | Beklenen | Ölçülen (simülatör) |\n|---|---|---|---|\n| T1 | Hedef 8 sn boyunca 3 cm/sn uzaklaşır (24 cm), sonra durur | 17-23 cm | 18,3-22,0 cm |\n| T2 | T1, sağ motor %5 zayıf | 17-23 cm | 18,2-21,5 cm |\n| T3 | T1, sağ motor %3 güçlü | 17-23 cm | 18,7-21,7 cm |\n| T4 | T1, hedef 55 cm uzaktan başlar | 17-23 cm | 18,4-22,1 cm |\n| T5 | Hedef birden kaybolur (levha çekildi) | 3 cm'den az ilerler; KAYIP yazar | 0,8 cm; KAYIP yazdı |\n| T6 | Hedef 0,5 m önüne geri gelir | Yeniden TAKIP; 10 sn içinde 17-23 cm | TAKIP yazdı; 17-23 cm içinde |\n\nT5, ders 112'deki 38 cm'lik koşuyla karşılaştırıldığında durum makinesinin değerini gösterir: aynı PID, tek fark karar katmanı.\n\n### Dene\n- **A:** `YAN_MS` değerini 1500 yap ve parkuru yeniden çalıştır. Ne oluyor? Nedenini ders 115'te kök neden analiziyle çözeceğiz.\n- **A:** `ENGEL_CM` değerini 15 yap. Robot engele ne kadar yaklaşıyor? Bu durumda hangi test satırı kırılır?\n- **B:** `BEKLEME_MS` değerini 0 yap. Gerçek bir kolda hangi sorun çıkardı? Simülatörde hata değişir mi, neden?\n- **B:** Üçüncü noktayı (4; 12) yerine (4; 21) yap. Sketch ne yazıyor ve kol ne yapıyor? Bu davranış güvenli mi?\n- **C:** `KAYIP_SAYISI` değerini 2 ve 20 yap. Hedef kaybolunca robotun davranışı nasıl değişir? Hangi değer seni daha güvende tutar?\n- **C:** Test matrisine yeni bir satır ekle: hedef 5 cm/sn ile uzaklaşırsa robot yetişebilir mi? Beklenen sonucu önce yaz, sonra ölç.\n\n### Sık yapılan hatalar\n- Test matrisini ölçtükten sonra yazmak. Beklenen sütunu önce yazmazsan sonuca göre kendini ikna edersin.\n- Tek senaryoyla \"çalışıyor\" demek. Başlangıç konumu, tekerlek uyumsuzluğu, hedefin hızı gibi şeyleri değiştirerek aynı sketch'i birkaç kez sına; çalışan bir tek senaryo kanıt değildir.\n- Durumlar içinde `delay` kullanmak: algılama durur, robot kör kalır (26. ders).\n- Durum değişince eski zamanlayıcıyı sıfırlamamak (`durumBasla`): sonraki durum hemen biter.\n- Hedef kaybolunca \"son bilinen komutu\" sürdürmek. Emin olmadığın durumda motoru durdur.\n- C: PID'i durum değişiminde sıfırlamamak: eski integral robotu yeni hedefe fırlatır.\n- B: Hedefe zıplatarak gitmek. Servo anında gitmek için akım çeker, kol sarsılır, parça düşer.",
          "question": "Test matrisinde bir satır kırmızı çıktı ve robotu iyileştirmeyi düşünüyorsun. İlk işin sketch'i değiştirmek mi olmalı, yoksa önce satırın neden kırıldığını ölçmek mi? İkisinin sırası neden önemli?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Alt sistemleri bir **durum makinesiyle** birleştirmeyi: her durumda tek davranış, geçişler koşullara bağlı\n- Test matrisini yazmayı: önce beklenen sütun, sonra ölçüm\n- Durum makinesinde `delay()` yerine `millis()` ve durum başlangıç zamanı kullanmayı\n- \"Emin değilsen dur\" ilkesini (güvenli varsayılan) ve ayar değerlerinin başka düzeneğe kopyalanamayacağını\n\n### Önceden bilmen gerekenler\n- 26-27. dersler: `delay()` tuzağı ve `millis()` ile bloklamayan kod\n- 28. ve 84. dersler: durum makinesi\n- Ders 112: sürüş, mesafe, çizgi, servo ve PID alt sistemleri\n\n### Alt sistemlerin üstüne karar katmanı\nDers 112'deki PID hata yapmadı; yalnızca \"hedef yok\" diye bir şey bilmiyordu. Alt sistemler işi yapar, **hangisinin ne zaman çalışacağına** durum makinesi karar verir. Kural basit: her durumda tek bir davranış çalışır; durumlar arasındaki geçişlerin her koşulu bir sensörden ya da zamandan gelir.\n\nYol A'dan bir parça:\n\n```\nCIZGI_IZLE -> (çizgi görüldü, sonra 300 ms çizgi yok) -> SERBEST\nSERBEST    -> (önde 28 cm'den yakın engel)            -> SOLA_DON -> YANA_GIT -> SAGA_DON -> SERBEST\nSERBEST    -> (üç sensör birden çizgide)              -> BITTI\n```\n\nDönüş ve yana gitme süreleri `millis()` ile sayılır. Her geçişte `durumBasla = millis()` yazılmazsa sonraki durum hemen biter, çünkü eski zaman damgası çoktan dolmuştur.\n\n### Güvenli varsayılan\nYol C'de hedef kaybolunca motorlar **hemen** durur; sayaç 8'e (yaklaşık 0,5 sn) varınca durum KAYIP yazılır. Sayaç yalnız art arda boş ölçümleri sayar; tek bir dolu ölçüm onu sıfırlar. Hedef geri gelince PID'in integrali ve eski hatası sıfırlanır, yoksa eski değerler robotu yeni hedefe fırlatır. Aynı PID, tek farkla (karar katmanı) 38 cm'lik koşuyu 0,8 cm'ye indirdi.\n\n### Test matrisi\nBir tablo: her satır bir senaryo; sütunlar beklenen ve ölçülen sonuç. **Beklenen sütun ölçmeden önce yazılır.** Ölçtükten sonra yazarsan sonuca göre kendini ikna edersin. Tek bir çalışan senaryo kanıt değildir; başlangıç konumu, sağ motorun zayıflığı, hedefin hızı gibi şeyleri değiştirerek satır eklenir.\n\nYol B'de sınama başka biçimdedir: kolun ucu zıplamasın diye her eklem 20 ms'de en çok 1,5° ilerler. 90°'lik bir hareket bu yüzden en az 60 adım, yani 1200 ms sürer.\n\n### Ayar değeri taşınmaz\nYol A'nın `KP = 55` değeri çizgi sensörleri 2,0 cm aralıklı düzenekte bulundu. Arenada sensörler 2,4 cm aralıklıdır; aynı konum değeri %20 daha büyük bir sapmaya karşılık gelir ve düzeltme fazla sert olur. Kazanç aynı oranda küçültülür: 55 / 1,2 ≈ 46. Genel kural: düzenek değişirse ayar yeniden ölçülür; bir sayıyı başka bir düzenekten kopyalama.\n\n### Özet\nDurum makinesi alt sistemleri birleştirir: her durumda tek davranış, geçişler sensör ya da zamandan. Emin olmadığında motoru durdur; zamanlayıcıyı her geçişte sıfırla. Test matrisinin beklenen sütunu ölçümden önce yazılır ve birden çok senaryo içerir. Bir düzeneğin ayar değeri başka düzeneğe doğrudan geçmez.",
          "concepts": [
            {
              "term": "Durum makinesi (entegrasyon)",
              "definition": "Her durumda tek davranışın çalıştığı, geçişlerin sensör ya da zaman koşuluna bağlı olduğu karar katmanı.",
              "example": "CIZGI_IZLE, SERBEST, SOLA_DON, YANA_GIT, SAGA_DON ve BITTI durumları Yol A'yı yönetir.",
              "pitfall": "Durumlar içinde `delay()` kullanmak: algılama durur, robot kör kalır."
            },
            {
              "term": "Test matrisi",
              "definition": "Senaryo, beklenen sonuç ve ölçülen sonuç sütunlarından oluşan tablo.",
              "example": "T5: \"hedef birden kaybolur\" için beklenen \"3 cm'den az ilerler\".",
              "pitfall": "Beklenen sütunu ölçtükten sonra yazıp sonuca göre kendini ikna etmek."
            },
            {
              "term": "Güvenli varsayılan (fail-safe)",
              "definition": "Emin olunamayan durumda tehlikeli çıkışı kapatmak.",
              "example": "Yol C'de hedef yoksa motorlar hemen durur; sayaç dolunca KAYIP yazılır.",
              "pitfall": "Hedef kaybolunca \"son bilinen komutu\" sürdürmek."
            },
            {
              "term": "Durum başlangıç zamanı",
              "definition": "Her geçişte kaydedilen `millis()` değeri; süreli durumlar bununla sayılır.",
              "example": "`durumDegis()` içinde `durumBasla = millis();` yazılır.",
              "pitfall": "Zamanlayıcıyı sıfırlamamak: sonraki durum hemen biter."
            },
            {
              "term": "Ayar aktarımı",
              "definition": "Bir kazancın (KP gibi) yalnız bulunduğu düzenek için geçerli olması.",
              "example": "Sensör aralığı 2,0 cm'den 2,4 cm'ye çıkınca KP 55'ten 55 / 1,2 ≈ 46'ya inmelidir.",
              "pitfall": "Başka düzenekten bulunmuş bir sayıyı olduğu gibi kopyalamak."
            },
            {
              "term": "Adım sınırlı hareket",
              "definition": "Kol eklemlerinin her periyotta en çok belirli bir açı ilerlemesi.",
              "example": "1,5° / 20 ms ile 90°'lik hareket 60 adım, yani 1200 ms sürer.",
              "pitfall": "Hedefe zıplatarak gitmek: servo akım çeker, kol sarsılır, parça düşer."
            }
          ],
          "quiz": [
            {
              "id": "m5h8d3-q1",
              "kind": "mcq",
              "prompt": "Test matrisinin \"beklenen\" sütunu ne zaman doldurulmalıdır?",
              "options": [
                "Ölçümden sonra, sonuçlara bakarak",
                "Ölçümden önce, ölçütlerden yola çıkarak",
                "Yalnız test başarısız olduğunda",
                "Hiç doldurulmaz, ölçülen sütun yeter"
              ],
              "answer": 1,
              "explanation": "Beklenen değer ölçümden önce yazılırsa sonuç onu doğrular ya da çürütür. Sonradan yazılırsa sonuca uydurmak kolaylaşır ve matris kanıt olmaktan çıkar.",
              "skills": [
                "bit-test-matrix"
              ]
            },
            {
              "id": "m5h8d3-q2",
              "kind": "numeric",
              "prompt": "Yol A'da KP = 55, çizgi sensörleri 2,0 cm aralıklıyken bulundu. Arenada aralık 2,4 cm. Kazanç aynı oranda küçültülürse yeni KP kaçtır (en yakın tam sayıya yuvarla)?",
              "answer": 46,
              "tolerance": 0.5,
              "explanation": "Aralık 2,4 / 2,0 = 1,2 kat büyüdü. 55 / 1,2 = 45,8 ≈ 46. Ölçüm de arenada 46'yı doğruladı; 55 ise çizgiyi kaybettiriyordu.",
              "skills": [
                "rob-tuning-transfer"
              ]
            },
            {
              "id": "m5h8d3-q3",
              "kind": "numeric",
              "prompt": "Robot kol her 20 ms'de her eklemi en çok 1,5° ilerletiyor. Bir eklemi 90° döndürmek en az kaç ms sürer?",
              "answer": 1200,
              "tolerance": 0,
              "unit": "ms",
              "explanation": "90 / 1,5 = 60 adım. Her adım 20 ms olduğundan 60 × 20 = 1200 ms. Hızı artırmak için ya adım büyütülür ya periyot küçültülür; ikisi de hareketin yumuşaklığını azaltır.",
              "skills": [
                "prog-timing",
                "rob-fsm"
              ]
            },
            {
              "id": "m5h8d3-q4",
              "kind": "predict-output",
              "prompt": "Yol C'deki boş ölçüm sayacı şöyle çalışır. Kod bitince ne yazar?\n```\nbool hedefVar[] = {false, false, true, false, false, false};\nint bosSayac = 0;\nfor (int i = 0; i < 6; i++) {\n  if (hedefVar[i]) bosSayac = 0;\n  else bosSayac++;\n}\nSerial.println(bosSayac);\n```",
              "options": [
                "5",
                "0",
                "3",
                "6"
              ],
              "answer": 2,
              "explanation": "Sayaç şöyle gider: 1, 2, sonra hedef göründüğü için 0, sonra 1, 2, 3. Son yazılan 3'tür. 5 toplam boş ölçüm sayısıdır; ama sayaç yalnız ART ARDA boşları sayar. Bu yüzden tek bir dolu ölçüm yanlış alarmı (KAYIP) önler.",
              "skills": [
                "rob-fsm",
                "rob-failsafe",
                "prog-debug"
              ]
            },
            {
              "id": "m5h8d3-q5",
              "kind": "find-bug",
              "prompt": "Süreli durumlar `durumBasla` ile sayılıyor ama SOLA_DON, YANA_GIT ve SAGA_DON birbiri ardına hemen bitiyor. Kodda tek hata var; hangisi?\n```\nvoid durumDegis(Durum yeni) {\n  durum = yeni;\n}\n// ...\ncase YANA_GIT:\n  surus(TABAN, TABAN);\n  if (simdi - durumBasla >= YAN_MS) durumDegis(SAGA_DON);\n  break;\n```",
              "options": [
                "`surus(TABAN, TABAN)` yerine `surus(0, 0)` olmalı",
                "`>=` yerine `<=` olmalı",
                "`case` içinde `break` olmamalı",
                "`durumDegis` içinde `durumBasla = millis();` yok; eski zaman damgası hemen dolmuş sayılır"
              ],
              "answer": 3,
              "explanation": "`durumBasla` yalnız ilk durumda atanır; sonraki durumlarda fark çoktan YAN_MS'yi aşmıştır, geçiş hemen olur. Geçiş fonksiyonuna `durumBasla = millis();` eklemek sorunu çözer. `<=` ise koşulu tersine çevirir.",
              "skills": [
                "rob-fsm",
                "prog-timing",
                "prog-debug"
              ]
            }
          ]
        },
        {
          "title": "3D robota bağlama, hata ayıklama, ölçüm",
          "durationMin": 40,
          "problem": "Robotun çalışıyor ama yalnızca sen biliyorsun. Başkasının ekranında, bir 3D robotun, bir grafiğin ya da bir kayıt dosyasının robotunu görmesini istesen ne yaparsın? Robotun içinden dışarıya **sözleşmeli bir veri akışı** çıkarırsın: her satırın biçimi, alanları ve değer aralıkları baştan belli olur. Bu derste o akışı yapıp doğrulayacaksın; ardından aynı kayıtlarla robotun hatasını ölçeceksin.",
          "contentMd": "### Dürüst bir not: 3D henüz yok\nŞu an elimizde robotu 3 boyutlu gösteren bir görüntü **yok**. Bu derste 3D'ye bağlanan bir şey çalıştırmıyoruz. Yaptığımız şey, ileride bir 3D robotun besleneceği arayüzü kurmak: robot, durumunu seri hat üzerinden belirli bir biçimde yazar. İleride 3D robot bu arayüzden beslenecek; bugünkü işin, biçimi sağlam ve sınanmış bırakmak. Ders sonunda elinde: (1) kendi konumunu bilen bir robot, (2) biçimi doğrulanmış bir veri akışı, (3) o akıştan ortalama ve en büyük hatayı çıkaran bir yöntem olacak.\n\n### Veri sözleşmesi: JSON satırları\nHer 100 ms'de robot **tek satır** yazar. Satır bir JSON nesnesidir (JSON-lines: satır başına bir nesne). Sözleşme:\n\n| Alan | Anlamı | Tür | Geçerli değer |\n|---|---|---|---|\n| `t` | Zaman damgası, `millis()` | tam sayı, ms | 0 veya büyük |\n| `x` | Konum, ileri (odometri) | sayı, metre | -10 ile 10 arası |\n| `y` | Konum, yan (odometri) | sayı, metre | -10 ile 10 arası |\n| `th` | Yön | sayı, radyan | -π'den büyük, π'ye eşit ya da küçük |\n| `d` | Önündeki mesafe | sayı, cm; ölçüm yoksa `null` | 2 ile 400 arası ya da `null` |\n\nAlanların sırası ve adları sabittir: `t`, `x`, `y`, `th`, `d`. Örnek bir satır (simülatör çıktısı):\n\n```text\n{\"t\":100,\"x\":0.010,\"y\":0.000,\"th\":0.000,\"d\":242.8}\n```\n\nAnahtar fikir: biçimi bir kez kararlaştırırsın, hem robot hem alıcı o biçime güvenir. Alıcı bir 3D görüntü de olsa, bir grafik de olsa, bir kayıt dosyası da olsa.\n\n### Devre\nStandart Modül 5 bağlantıları; enkoderler odometri için kullanılır.\n\n| Parça | Bağlantı |\n|---|---|\n| Sol motor | EN **D5** (PWM), IN1 **D7**, IN2 **D8** |\n| Sağ motor | EN **D6** (PWM), IN3 **D9**, IN4 **D10** |\n| Sol enkoder | **D2** (kesme pini) |\n| Sağ enkoder | **D3** (kesme pini) |\n| HC-SR04 | TRIG **D11**, ECHO **D12** |\n\nEnkoderler D2 ve D3'ü kullandığı için bu derste tampon bağlama. Motor gücü harici kaynaktan gelir, GND ortaktır. Seri hat 115200 baud'dır; Serial Monitor'ü de 115200'e ayarla.\n\n### Program\nBu sketch robotu önceden belirlenmiş bir yolda sürer (2 sn ileri, 0,6 sn sola dön, 2 sn ileri, dur) ve her 100 ms'de bir konum satırı yazar. Konumu enkoderlerden hesaplar (odometri, 94. ders).\n\n```cpp\n// sketch: telemetri\n// Robot kendi konumunu (odometri) ve önündeki mesafeyi her 100 ms'de bir JSON satırı olarak seri porttan yazar.\n// Satır biçimi: {\"t\":ms,\"x\":metre,\"y\":metre,\"th\":radyan,\"d\":cm}\nconst int SOL_EN = 5, SOL_IN1 = 7, SOL_IN2 = 8;\nconst int SAG_EN = 6, SAG_IN1 = 9, SAG_IN2 = 10;\nconst int ENK_SOL = 2, ENK_SAG = 3;\nconst int TRIG = 11, ECHO = 12;\n\nconst int OLU_BOLGE = 51;\nconst int TABAN = 150;\nconst float TEKERLEK_CEVRE_M = 0.2073;          // 2 * pi * 0,033 m\nconst int YUVA = 20;\nconst float TIK_M = TEKERLEK_CEVRE_M / YUVA;    // bir tık = yaklaşık 1,04 cm\nconst float AKS_M = 0.12;                       // tekerlekler arası\nconst unsigned long RAPOR_MS = 100;\n\nvolatile long tikSol = 0, tikSag = 0;           // işaretli: geri dönüşte azalır\nvolatile int solYon = 1, sagYon = 1;            // komut verilen yön (+1 ileri, -1 geri)\nlong oncekiSol = 0, oncekiSag = 0;\nfloat x = 0, y = 0, th = 0;                     // odometri: metre, metre, radyan\nunsigned long sonRapor = 0;\n\n// Tek kanallı enkoder yönü bilmez: yönü, motora verdiğimiz komuttan biliriz.\nvoid solTik() { tikSol += solYon; }\nvoid sagTik() { tikSag += sagYon; }\n\nvoid motor(int en, int in1, int in2, int hiz) {\n  hiz = constrain(hiz, -255, 255);\n  if (hiz == 0) { digitalWrite(in1, LOW); digitalWrite(in2, LOW); analogWrite(en, 0); return; }\n  digitalWrite(in1, hiz > 0);\n  digitalWrite(in2, hiz < 0);\n  analogWrite(en, map(abs(hiz), 1, 255, OLU_BOLGE, 255));\n}\n\nvoid surus(int sol, int sag) {\n  if (sol != 0) solYon = sol > 0 ? 1 : -1;\n  if (sag != 0) sagYon = sag > 0 ? 1 : -1;\n  motor(SOL_EN, SOL_IN1, SOL_IN2, sol);\n  motor(SAG_EN, SAG_IN1, SAG_IN2, sag);\n}\n\n// Hareket planı: 2 sn ileri, 0,6 sn sola dön, 2 sn ileri, dur\nvoid plan(unsigned long ms) {\n  if (ms < 2000) surus(TABAN, TABAN);\n  else if (ms < 2600) surus(-TABAN, TABAN);\n  else if (ms < 4600) surus(TABAN, TABAN);\n  else surus(0, 0);\n}\n\nfloat mesafeCm() {\n  digitalWrite(TRIG, LOW);\n  delayMicroseconds(2);\n  digitalWrite(TRIG, HIGH);\n  delayMicroseconds(10);\n  digitalWrite(TRIG, LOW);\n  unsigned long s = pulseIn(ECHO, HIGH, 25000);\n  return s == 0 ? -1.0 : s / 58.0;               // -1 = yankı yok\n}\n\nvoid odometriGuncelle() {\n  noInterrupts();\n  long s = tikSol, g = tikSag;\n  interrupts();\n  float dSol = (s - oncekiSol) * TIK_M;\n  float dSag = (g - oncekiSag) * TIK_M;\n  oncekiSol = s;\n  oncekiSag = g;\n  float d = (dSol + dSag) / 2.0;\n  th += (dSag - dSol) / AKS_M;\n  while (th > PI) th -= 2 * PI;                  // (-pi, pi] aralığında tut\n  while (th <= -PI) th += 2 * PI;\n  x += d * cos(th);\n  y += d * sin(th);\n}\n\nvoid satirYaz(unsigned long t, float cm) {\n  Serial.print(\"{\\\"t\\\":\");\n  Serial.print(t);\n  Serial.print(\",\\\"x\\\":\");\n  Serial.print(x, 3);\n  Serial.print(\",\\\"y\\\":\");\n  Serial.print(y, 3);\n  Serial.print(\",\\\"th\\\":\");\n  Serial.print(th, 3);\n  Serial.print(\",\\\"d\\\":\");\n  if (cm < 0) Serial.print(\"null\");              // geçerli ölçüm yok\n  else Serial.print(cm, 1);\n  Serial.println(\"}\");\n}\n\nvoid setup() {\n  pinMode(SOL_EN, OUTPUT); pinMode(SOL_IN1, OUTPUT); pinMode(SOL_IN2, OUTPUT);\n  pinMode(SAG_EN, OUTPUT); pinMode(SAG_IN1, OUTPUT); pinMode(SAG_IN2, OUTPUT);\n  pinMode(TRIG, OUTPUT);\n  pinMode(ECHO, INPUT);\n  pinMode(ENK_SOL, INPUT_PULLUP);\n  pinMode(ENK_SAG, INPUT_PULLUP);\n  attachInterrupt(digitalPinToInterrupt(ENK_SOL), solTik, RISING);\n  attachInterrupt(digitalPinToInterrupt(ENK_SAG), sagTik, RISING);\n  Serial.begin(115200);\n}\n\nvoid loop() {\n  unsigned long simdi = millis();\n  plan(simdi);\n  if (simdi - sonRapor >= RAPOR_MS) {\n    sonRapor += RAPOR_MS;\n    odometriGuncelle();\n    satirYaz(simdi, mesafeCm());\n  }\n}\n```\n\n### Nasıl çalışıyor?\n1. Kesme servisleri (`solTik`, `sagTik`) her enkoder kenarında tık sayısını günceller (92. ders). Tek kanallı enkoder dönüş yönünü bilmediği için yönü **motora verdiğimiz komuttan** kaydederiz (`solYon`, `sagYon`); geri giderken tık sayısı azalır.\n2. Her 100 ms'de `odometriGuncelle()` iki tekerleğin yolunu tık sayısından hesaplar. Ortalaması robotun ilerlemesi, farkı dönüş açısıdır: `Δθ = (sağ − sol) / aks`. Sonra `x` ve `y` yeni yönle güncellenir (94. ders).\n3. `th` her zaman (-π, π] aralığına çekilir; sözleşme budur. Aksi hâlde robot birkaç tur dönünce `th` 7, 8 olur ve alıcı bunu anlamaz.\n4. `d` ölçülemezse `-1` dönmez; JSON'da `null` yazılır. Alıcı `null`'ı \"ölçüm yok\" olarak ele alır; \"400 cm\" gibi sahte bir değer yazmak yanıltıcı olurdu.\n5. `Serial.println` satır sonuna `\\r\\n` ekler. Python'un `json.loads` işlevi satır sonundaki boşluk ve `\\r` karakterini sorun etmez.\n6. Seri hat 115200 baud'dur. Bir satır yaklaşık 50 bayttır; 9600 baud'da bu satır hatta yaklaşık 52 ms yer tutar (100 ms'lik periyodun yarısı), 115200'de 5 ms'den azdır.\n\n**Simülatörde ölçtüklerimiz:**\n- 5,2 sn'de 51 satır geldi, hepsi sözleşmeye uydu: anahtarlar ve sırası, `t` her satırda 100 ± 5 ms artar, `th` aralığı, `d` aralığı.\n- Odometri robotun gerçek konumuna 0,4 cm yaklaştı (robot başlangıçtan yaklaşık 38 cm uzaklaştı ve 130°'den fazla döndü). Bu doğruluk, simülatörde tekerleklerin kaymamasındandır; gerçek yerde zemin kayması, tekerlek çapı ve aks aralığındaki ölçü hatası odometriyi zamanla saptırır (95. ders).\n\n### Doğrulayıcı: sözleşmeyi bir program denetlesin\nBiçimi insan gözüyle denetlemek yetmez. Her satırı bir program okur ve kuralları sınar. Biz bunu `checks.mjs` içinde yazdık; senin bilgisayarında aynısını Python ile yazabilirsin:\n\n```python\nimport json, math\n\ndef satir_sorunu(satir):\n    try:\n        o = json.loads(satir)\n    except ValueError:\n        return \"JSON degil\"\n    if list(o.keys()) != [\"t\", \"x\", \"y\", \"th\", \"d\"]:\n        return \"anahtarlar t,x,y,th,d olmali\"\n    if not isinstance(o[\"t\"], int) or o[\"t\"] < 0:\n        return \"t pozitif tam sayi olmali\"\n    if abs(o[\"x\"]) > 10 or abs(o[\"y\"]) > 10:\n        return \"x ve y -10..10 m olmali\"\n    if not (-math.pi < o[\"th\"] <= math.pi):\n        return \"th (-pi, pi] olmali\"\n    if o[\"d\"] is not None and not (2 <= o[\"d\"] <= 400):\n        return \"d null ya da 2..400 cm olmali\"\n    return None                         # sorun yok\n\nfor no, satir in enumerate(open(\"log.jsonl\"), 1):\n    sorun = satir_sorunu(satir)\n    if sorun:\n        print(\"satir\", no, \":\", sorun)\n```\n\nBu kursta Python öğretilmiyor; bu bölüm isteğe bağlıdır. Kod her satırı JSON olarak okur (`json.loads`), anahtarları, türleri ve aralıkları kurallarla karşılaştırır ve ilk bozuk kuralın adını söyler. Python kullanmıyorsan aynı kuralları Serial Monitor'de gözle de denetleyebilirsin.\n\nBozuk bir satırı bilerek dene: `{\"t\":100,\"x\":0.1,\"y\":0.2,\"th\":4.0,\"d\":50}` satırında `th` π'den büyüktür ve doğrulayıcı bunu yakalar. Doğrulayıcının kendisini de sınamak önemlidir; biz `checks.mjs`'te hem iyi hem bozuk örneklerle sınadık.\n\n### Hata ayıklama: ölçüm ve log analizi\nRobotun bir şeyi yanlış yaptığını **hissetmek** yetmez; sayıya dökmek gerekir. Bir ölçüm hatası için iki sayı hesaplanır:\n\n- **Ortalama mutlak hata:** her ölçümün gerçek değerden farkının mutlak değerlerinin ortalaması. İşaretin önemi yoktur: +3 ile -3 birbirini götürmez.\n- **En büyük mutlak hata:** en kötü ölçümün hatası. Ortalama iyi olup tek bir ölçüm çok kötü olabilir; güvenlik açısından en kötü durum önemlidir.\n\nİlk sketch, hatalarını sen yazarsın, o hesaplar:\n\n```cpp\n// sketch: hata_istatistik\n// Ölçüm hatalarını seri porttan al, ortalama ve en büyük mutlak hatayı hesapla.\n//   e <değer>  hata ekle (işaretli olabilir)    r  sonucu yaz    s  sıfırla\nlong adet = 0;\nfloat toplam = 0;       // mutlak hataların toplamı\nfloat enBuyuk = 0;\n\nvoid setup() {\n  Serial.begin(9600);\n  Serial.setTimeout(50);\n}\n\nvoid loop() {\n  if (Serial.available() == 0) return;\n  char komut = Serial.read();\n  if (komut == 'e') {\n    float hata = fabs(Serial.parseFloat());    // yönü değil büyüklüğü say\n    adet++;\n    toplam += hata;\n    if (hata > enBuyuk) enBuyuk = hata;\n  } else if (komut == 'r') {\n    Serial.print(\"n=\");\n    Serial.print(adet);\n    Serial.print(\" ort=\");\n    Serial.print(adet ? toplam / adet : 0.0, 2);\n    Serial.print(\" maks=\");\n    Serial.println(enBuyuk, 2);\n  } else if (komut == 's') {\n    adet = 0;\n    toplam = 0;\n    enBuyuk = 0;\n  }\n}\n```\n\nElle bir örnek: hatalar 1,2; -3,1; 0,4; 2,0; -0,2 ise mutlak değerler 1,2; 3,1; 0,4; 2,0; 0,2 olur. Toplamları 6,9; beşe bölününce ortalama 1,38; en büyüğü 3,10. Sketch aynı sonucu `n=5 ort=1.38 maks=3.10` olarak yazar.\n\nPeki gerçek bir log'dan nasıl? Ultrasonik sensörün kendi hatasını ölçelim. Robotu sabit tut (`plan(simdi);` satırını `surus(0, 0);` yap), duvardan cetvelle 50 cm uzağa koy, 10 sn log al ve Serial Monitor çıktısını `log.jsonl` dosyasına yapıştır. Sonra:\n\n```python\nimport json\n\nHEDEF_CM = 50.0                       # cetvelle ölçtüğün gerçek mesafe\nhatalar = []\nfor satir in open(\"log.jsonl\"):\n    kayit = json.loads(satir)\n    if kayit[\"d\"] is None:            # geçerli ölçüm yok, atla\n        continue\n    hatalar.append(kayit[\"d\"] - HEDEF_CM)\n\nort = sum(abs(h) for h in hatalar) / len(hatalar)\nmaks = max(abs(h) for h in hatalar)\nprint(\"satir sayisi :\", len(hatalar))\nprint(\"ortalama hata: %.2f cm\" % ort)\nprint(\"en buyuk hata: %.2f cm\" % maks)\n```\n\nSimülatörde ölçümde 1 cm'lik sensör gürültüsüyle 101 satır için ortalama hata 0,73 cm, en büyük hata 2,20 cm çıktı. Yani bu sensörün tek bir okuması 50 cm'de yaklaşık ± 2 cm yanılabilir. Bu sayı, C yolundaki ± 3 cm'lik payın sensör gürültüsünden büyük olduğunu gösterir. Gerçek HC-SR04'ün hatası farklı olabilir; sayıyı kendi sensörün için ölç, veri sayfasına bak.\n\n### Dene\n- `telemetri` sketch'ini kendi robotunda çalıştır. Serial Monitor'ü 115200'e al. Biçim sözleşmeye uyuyor mu? Doğrulayıcıyla dene.\n- Robotu cetvelle 1 m ilerlet, sonuçtaki `x` değerine bak. Odometri ne kadar sapıyor? Hata yüzde kaç?\n- Plana bir kare çizdir: dört kez 2 sn ileri ve 0,5 sn dön. Başlangıç noktasına dönünce `x` ve `y` sıfıra yakın mı? Ne kadar sapma var ve en büyük hatası hangi köşede?\n- Satıra beşinci bir alan eklemeyi düşün (örneğin `\"durum\"`). Alıcıların bundan nasıl etkilendiğini, sözleşmeyi neden sürümlemek gerektiğini düşün.\n\n### Sık yapılan hatalar\n- Ondalık ayracı olarak virgül kullanmak: JSON'da ondalık ayracı noktadır (`0.5`). `Serial.print` noktayla yazar, ama metni elle birleştirirken `0,5` yazarsan satır bozulur.\n- `Serial.println` yerine `Serial.print` kullanıp satır sonunu unutmak: iki satır bitişir ve JSON bozulur.\n- `d` yoksa `0` yazmak: 0 cm geçerli bir ölçüm gibi görünür ve yanıltır. `null` kullan.\n- Baud hızını yanlış ayarlamak: ekranda anlamsız karakterler görürsün.\n- `th` değerini sargılamamak: birkaç turdan sonra sözleşmenin dışına çıkar.\n- Odometriye fazla güvenmek: kayma ve ölçü hatası zamanla birikir. Uzun yolda konum yanlış olur; 94. dersteki sapma burada da geçerli.\n- Hata hesabında işareti saklamak ve ortalamayı işaretli almak: +3 ile -3 birbirini götürür, ortalama sıfır çıkar ama robot yanlıştır.",
          "question": "Veri biçimi bir sözleşmeyse, bir gün bu biçimi değiştirmen gerekirse (örneğin `d` yerine iki mesafe yazmak) bunu kullanan herkese nasıl duyurursun? Eski kayıtlar ne olur?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Robotun durumunu başkasına bir **veri sözleşmesi** (JSON satırları) ile vermeyi\n- Satırdaki her alanın türünü ve geçerli aralığını kurala bağlamayı\n- Eksik ölçümü sahte sayıyla değil `null` ile yazmayı\n- Ortalama mutlak hata ile en büyük mutlak hatayı hesaplamayı\n\n### Önceden bilmen gerekenler\n- 92. ders: kesmeyle enkoder sayma\n- 94-95. dersler: odometri ve birikme hatası\n- 82. ders: HC-SR04 ölçümü\n- 9. ders: seri porttan okuma/yazma\n\n### 3D gösterim henüz yok: arayüzü hazırlıyoruz\nBu derste robotu 3 boyutlu gösteren bir görüntü çalıştırmıyoruz; öyle bir şey şu an yok. Yapılan iş, ileride böyle bir görüntünün (ya da grafiğin, kayıt dosyasının) besleneceği arayüzü kurmak ve sınamaktır: robot durumunu seri hattan sabit bir biçimde yazar.\n\n### Veri sözleşmesi\nHer 100 ms'de tek satır, bir JSON nesnesi:\n\n| Alan | Anlamı | Geçerli değer |\n|---|---|---|\n| `t` | `millis()`, ms | 0 ya da büyük tam sayı |\n| `x`, `y` | odometri konumu, metre | -10 ile 10 |\n| `th` | yön, radyan | -π'den büyük, π'ye eşit ya da küçük |\n| `d` | önündeki mesafe, cm | 2-400 ya da `null` |\n\nAlan adları ve sırası sabittir: `t, x, y, th, d`. Biçimi bir kez kararlaştırırsın; gönderen de alan da ona güvenir. Bu yüzden değerler kurala sokulur. `th`, birkaç tur dönünce 7 olmasın diye (-π, π] aralığına sarılır. Ölçüm yoksa `d` için 0 ya da 400 gibi sahte sayı yazmak alıcıyı yanıltır; doğrusu `null`'dır. JSON'da ondalık ayracı noktadır.\n\nHız da sözleşmenin parçasıdır. Yaklaşık 50 baytlık bir satır 9600 baud'da 50 × 10 / 9600 ≈ 52 ms hatta kalır (bir bayt 10 bit: başlangıç, 8 veri, bitiş). Bu, 100 ms'lik periyodun yarısıdır. 115200 baud'da 5 ms'den azdır.\n\n### Hata ölçmek\nBir ölçümün ne kadar yanıldığı iki sayıyla anlatılır:\n- **Ortalama mutlak hata:** her hatanın işaretsiz değerinin ortalaması. Mutlak değer şarttır; +3 ile -3 birbirini götürmemeli.\n- **En büyük mutlak hata:** en kötü ölçüm. Ortalama iyi olup tek ölçüm çok kötü olabilir.\n\nÖrnek: hatalar 0,5; -2,5; 1,0; -1,0; 2,0 ise işaretli ortalama 0'dır, ama mutlak ortalama 1,4, en büyük 2,5. İşaretli ortalama \"robot kusursuz\" diyen yanlış bir sonuç verirdi.\n\n### Odometri yönü\nSağ tekerlek sola göre fazla giderse `Δθ = (sağ − sol) / aks` artıdır; robot sola döner. İşareti ters yazarsan robot sola dönerken `th` azalır ve çizdiğin yol aynalanır.\n\n### Özet\nRobotun durumunu seri hattan sözleşmeli JSON satırı olarak yazmak, alıcının (3D görüntü, grafik, kayıt) hazırlanmasını sağlar; aralıklar kurala bağlanır, eksik ölçüm `null` yazılır. Hata, mutlak değerle ortalanır ve en büyük değeri de raporlanır. Baud hızı satırın hatta kaç ms yer tuttuğunu belirler.",
          "concepts": [
            {
              "term": "Veri sözleşmesi",
              "definition": "Gönderen ile alıcı arasındaki alan adları, türleri, sırası ve değer aralıkları üzerine baştan yapılan anlaşma.",
              "example": "`{\"t\":100,\"x\":0.010,\"y\":0.000,\"th\":0.000,\"d\":242.8}` satırında alanlar `t, x, y, th, d` sırasındadır.",
              "pitfall": "Biçimi sürümlemeden bir alan eklemek: eski alıcılar bozulur."
            },
            {
              "term": "JSON satırları",
              "definition": "Her satırda tek bir JSON nesnesi bulunan düz metin biçimi.",
              "example": "Robot her 100 ms'de bir satır yazar; alıcı satır satır okur.",
              "pitfall": "`Serial.print` ile satır sonunu unutmak: iki nesne bitişir ve JSON bozulur."
            },
            {
              "term": "null (ölçüm yok)",
              "definition": "Geçerli ölçüm olmadığını açıkça bildiren değer.",
              "example": "Yankı gelmediğinde `\"d\":null` yazılır.",
              "pitfall": "Ölçüm yok diye 0 ya da 400 yazmak: sahte bir ölçüm gibi görünür."
            },
            {
              "term": "Açı sargılama",
              "definition": "Yön açısını (-π, π] aralığında tutmak.",
              "example": "`while (th > PI) th -= 2 * PI;` ve `while (th <= -PI) th += 2 * PI;`",
              "pitfall": "Sargılamamak: birkaç tur sonra `th` 7 olur ve sözleşme dışına çıkar."
            },
            {
              "term": "Ortalama mutlak hata",
              "definition": "Her ölçümün hatasının işaretsiz değerinin ortalaması.",
              "example": "Hatalar 0,5; -2,5; 1,0; -1,0; 2,0 ise ortalama mutlak hata 1,4.",
              "pitfall": "İşaretli ortalama almak: +3 ile -3 birbirini götürür, robot yanlışken sonuç 0 çıkar."
            },
            {
              "term": "En büyük mutlak hata",
              "definition": "En kötü ölçümün işaretsiz hatası.",
              "example": "Aynı hatalarda en büyük mutlak hata 2,5.",
              "pitfall": "Yalnız ortalamayı raporlamak: tek bir kötü ölçüm güvenlik sorunu olabilir."
            }
          ],
          "quiz": [
            {
              "id": "m5h8d4-q1",
              "kind": "predict-output",
              "prompt": "Ölçüm hata sayacına seri porttan \"e -4\", \"e 1\", \"e 3\" ve ardından \"r\" gönderiliyor. Sayaç şu koddadır:\n```\nfloat hata = fabs(Serial.parseFloat());\nadet++;\ntoplam += hata;\nif (hata > enBuyuk) enBuyuk = hata;\n// r: Serial.print(toplam / adet, 2) ve enBuyuk\n```\nSonuç satırı ne olur?",
              "options": [
                "n=3 ort=0.00 maks=3.00",
                "n=3 ort=2.67 maks=4.00",
                "n=3 ort=0.00 maks=-4.00",
                "n=3 ort=2.67 maks=3.00"
              ],
              "answer": 1,
              "explanation": "fabs işareti atar: 4, 1, 3. Toplam 8, ortalama 8 / 3 = 2,67; en büyük 4. İşaretli toplam 0 olurdu ve hatalı bir ortalama sıfır çıkardı.",
              "skills": [
                "rob-error-stats",
                "prog-debug"
              ]
            },
            {
              "id": "m5h8d4-q2",
              "kind": "numeric",
              "prompt": "Bir telemetri satırı 60 bayttır ve 9600 baud seri hattan gönderiliyor (bayt başına 10 bit). Satır hatta kaç ms yer tutar?",
              "answer": 62.5,
              "tolerance": 0.5,
              "unit": "ms",
              "explanation": "60 bayt × 10 bit = 600 bit. 600 / 9600 = 0,0625 sn = 62,5 ms. Periyot 100 ms olduğundan hat neredeyse dolar; 115200 baud'da süre 5,2 ms'dir.",
              "skills": [
                "rob-telemetry"
              ]
            },
            {
              "id": "m5h8d4-q3",
              "kind": "mcq",
              "prompt": "HC-SR04 yankı alamadı. Telemetri satırında `d` alanı için hangisi doğrudur?",
              "options": [
                "`\"d\":0`",
                "`\"d\":400`",
                "`\"d\":null`",
                "Satır hiç yazılmaz"
              ],
              "answer": 2,
              "explanation": "`null` \"ölçüm yok\" demektir. 0 cm geçerli bir ölçüm gibi görünür, 400 de gerçek bir uzaklık gibi; ikisi de alıcıyı yanıltır. Satırı atlamak ise `t` zaman akışındaki 100 ms düzenini bozar.",
              "skills": [
                "rob-telemetry"
              ]
            },
            {
              "id": "m5h8d4-q4",
              "kind": "find-bug",
              "prompt": "Robot sola dönerken (sağ tekerlek ileri, sol geri) `th` azalıyor. Kodda tek hata var; hangisi?\n```\nfloat dSol = (s - oncekiSol) * TIK_M;\nfloat dSag = (g - oncekiSag) * TIK_M;\nfloat d = (dSol + dSag) / 2.0;\nth += (dSol - dSag) / AKS_M;\n```",
              "options": [
                "`th` değişimi `(dSag - dSol) / AKS_M` olmalı; işaret ters",
                "`d` toplamı ikiye bölünmemeli",
                "TIK_M'nin birimi santimetre olmalı",
                "`th` radyan değil derece olmalı"
              ],
              "answer": 0,
              "explanation": "Sağ tekerlek sola göre fazla gittiğinde robot sola döner ve açı artmalıdır: Δθ = (sağ - sol) / aks. Kodda işaret ters, bu yüzden yol aynalanır. İki tekerleğin ortalaması ileri yolu verir, bölme doğrudur; radyan sözleşmenin gereğidir.",
              "skills": [
                "rob-telemetry",
                "prog-debug"
              ]
            },
            {
              "id": "m5h8d4-q5",
              "kind": "mcq",
              "prompt": "Sözleşmeye göre (t, x, y, th, d; th ∈ (-π, π]; d ∈ [2, 400] ya da null) hangi satır geçerlidir?",
              "options": [
                "{\"t\":100,\"x\":0.1,\"y\":0.2,\"th\":3.200,\"d\":50.0}",
                "{\"t\":300,\"x\":0.3,\"y\":0.1,\"th\":0.5,\"d\":1.5}",
                "{\"x\":0.3,\"t\":400,\"y\":0.1,\"th\":0.5,\"d\":60.0}",
                "{\"t\":200,\"x\":0.021,\"y\":-0.003,\"th\":-3.100,\"d\":null}"
              ],
              "answer": 3,
              "explanation": "Doğru satırda anahtar sırası t, x, y, th, d; th = -3,100 aralıkta; d null geçerli. th = 3,2 olan satır π (3,14) sınırını aşıyor. d = 1,5 olan satır 2 cm alt sınırının altında. Anahtarları x, t, ... sırasıyla yazan satırda sıra bozuk.",
              "skills": [
                "rob-telemetry"
              ]
            }
          ]
        },
        {
          "title": "Sergi ve sunum",
          "durationMin": 40,
          "problem": "Sergi günü. Biri robotuna bakıp soruyor: \"Peki ne kadar iyi?\" Cevabın \"çok iyi çalışıyor\" ise konuşma burada biter. Cevabın \"20 ± 3 cm'lik ölçütü, ölçtüğüm 18,3 ile 22,0 cm arasında karşıladı; bir testte şu nedenle başarısız oldum ve şöyle düzelttim\" ise konuşma yeni başlar. Bu derste robotunun başarısını, başarısızlığını ve emeğini başkasının okuyup güvenebileceği bir biçimde anlatmayı öğreneceksin.",
          "contentMd": "### Sunumun üç belgesi\n1. **Sonuç tablosu:** her ölçüt için ölçülen değer ve geçti mi, kaldı mı.\n2. **Hata raporu:** yaşadığın bir sorunun belirtisi, kök nedeni, düzeltmesi ve doğrulaması.\n3. **Günlük rapor:** her gün ne yaptığın, ne ölçtüğün, neyi neden seçtiğin.\n\nÜçü de düz metindir: tablo, birkaç satır ve sayılar. Süslü slayt gerekmez; güvenilir sayı gerekir.\n\n### Rapor kültürü: HYVEX notlarından\nHYVEX ekibinin staj ders programında bu işin nasıl yapıldığı şöyle özetleniyor:\n- **Tek doğruluk kaynağı (Gün 2):** depo (repo) kaynak-doğruluktur; her şey düz metin olarak git'te tutulur. `raporlar/` klasöründeki günlük rapor kültürü bunun bir parçasıdır. Dersin sorusu: bir bilgi nerede yaşamalı, kafada mı, sohbet geçmişinde mi, repoda mı?\n- **Kök neden analizi (Gün 4):** vaka, ping'in çalıştığı ama telemetri ve video akışının koptuğu bir durumdur; sorunun NetworkManager'ın IP'yi silmesi olduğu bulunmuştur. Yaklaşım: **belirtiyi kök nedene indirgeme**, katman katman doğrulama (fiziksel, IP, port, uygulama). \"Arada düzeliyor\" ifadesi kararsız bir katmanın işaretidir. Dersin sorusu: bir hatayı \"çözdüm\" demeden önce nasıl emin olursun?\n- **Bilgi yönetimi (Gün 15):** anlamlı commit, günlük rapor (kök nedenle birlikte) ve \"6 ay sonra okuyan anlasın\" ilkesi.\n\nBu derste bunu küçük ölçekte yapacağız. Aşağıdaki şablonları kendi projene uygula.\n\n### 1) Sonuç tablosu\nHer ölçüt için dört sütun: ne istendi (ders 111), nasıl ölçüldü, ne ölçüldü, sonuç. Aşağıda ders 113'te simülatörde ölçtüğümüz değerlerle doldurulmuş bir örnek var.\n\n| Yol | Ölçüt (ders 111) | Nasıl ölçüldü | Ölçülen | Sonuç |\n|---|---|---|---|---|\n| A | Çarpmadan bitir ve bitiş çizgisinde dur | Robot merkezi ile en yakın duvar arası en az 8 cm; durunca 1 sn kıpırdamadı | Çarpma yok, en yakın duvar 18,1 cm; 11,2 sn; çizgide durdu | GEÇTİ |\n| B | Üç noktada uç noktası hatası < 5 mm | Pindeki servo darbelerinden uç noktası hesabı | En büyük hata 0,09 mm (komut edilen konum; mekanik hata ölçülmedi) | GEÇTİ (kapsam sınırlı) |\n| C | Hedefi 20 ± 3 cm mesafede takip | Simülatörün bildiği sensör-hedef mesafesi, hedef 3 cm/sn uzaklaşırken | En küçük 18,3 cm, en büyük 22,0 cm | GEÇTİ |\n\nÜç sayıyı ders 111'deki sketch'e girersen `yol A: GECTI`, `yol B: GECTI`, `yol C: GECTI` yazar (`A 0 1`, `B 0.16`, `C 18.3 22.0`).\n\n**Bu tabloda dürüstlüğü sağlayan üç şey:**\n- \"Nasıl ölçüldü\" sütunu. Ölçüm yöntemi yoksa sayı kanıt değildir.\n- \"Kapsam sınırlı\" notu. B yolundaki 0,09 mm gerçek kolun sonucu değildir; matematik ve servo darbesidir. Dişli boşluğu, yük altında eğilme ve servo ölü bandı ölçülmedi.\n- Sonucun simülatörden olduğunun belirtilmesi. Gerçek robot başka sayılar verir; kendi robotunun tablosunu kendi ölçümlerinle doldur.\n\n### Program: kendi kendini ölçen skor tablosu\nSergide robotun kendisi sonucu söylesin. Bu sketch çizgi izleyen bir robot koşarken üç şeyi ölçer ve bitince tek bir satır yazar:\n- **Tur süresi:** koşunun başlangıcından çizginin sonuna kadar.\n- **Çarpma sayısı:** tamponlar (D2, D3, `INPUT_PULLUP`, basılı = LOW) kaç kez basıldı. Aynı çarpmanın titreşimleri tek sayılır (500 ms'den sık basışlar tek çarpma).\n- **Ortalama hata:** çizgiyi gören her ölçümde, çizgi merkezinden kaç milimetre uzakta olduğunun mutlak değeri; hepsinin ortalaması.\n\nKoşu iki şekilde biter: çizgi 400 ms görülmezse `BITTI`, 15 sn geçerse `ZAMAN_ASIMI`.\n\nDevre: ders 111'deki Yol A tablosundan sürüş ve çizgi sensörleri (D5-D10, A0-A4) ve tamponlar (D2, D3). Bu sketch mesafe sensörünü ve enkoderi kullanmaz.\n\n```cpp\n// sketch: skor_tablosu\n// Çizgi izleyen robot kendi performansını ölçer: tur süresi, çarpma sayısı, ortalama çizgi hatası.\nconst int SOL_EN = 5, SOL_IN1 = 7, SOL_IN2 = 8;\nconst int SAG_EN = 6, SAG_IN1 = 9, SAG_IN2 = 10;\nconst int TAMPON_SOL = 2, TAMPON_SAG = 3;       // INPUT_PULLUP: basılı = LOW\nconst int CIZGI[5] = {A0, A1, A2, A3, A4};\n\nconst int OLU_BOLGE = 51;\nconst int TABAN = 150;\nconst float KP = 55.0;\nconst float SENSOR_ARALIK_MM = 20.0;            // iki sensör arası\nconst unsigned long BASLAMA_MS = 500;           // sayım sonrası kalkış\nconst unsigned long KAYIP_MS = 400;             // çizgisiz geçen bu süre = pist bitti\nconst unsigned long ZAMAN_ASIMI_MS = 15000;\nconst unsigned long CARPMA_ARALIK_MS = 500;     // bundan sık basışlar tek çarpma sayılır\n\nenum Durum { BEKLE, KOS, BITTI };\nDurum durum = BEKLE;\n\nunsigned long kosuBasla = 0;\nunsigned long sonCizgi = 0;\nunsigned long sonCarpma = 0;\nint carpma = 0;\nbool tamponOnce = false;\n\nfloat hataToplamMm = 0;                         // |hata| toplamı\nunsigned long olcumSayisi = 0;\n\nvoid motor(int en, int in1, int in2, int hiz) {\n  hiz = constrain(hiz, -255, 255);\n  if (hiz == 0) { digitalWrite(in1, LOW); digitalWrite(in2, LOW); analogWrite(en, 0); return; }\n  digitalWrite(in1, hiz > 0);\n  digitalWrite(in2, hiz < 0);\n  analogWrite(en, map(abs(hiz), 1, 255, OLU_BOLGE, 255));\n}\n\nvoid surus(int sol, int sag) {\n  motor(SOL_EN, SOL_IN1, SOL_IN2, sol);\n  motor(SAG_EN, SAG_IN1, SAG_IN2, sag);\n}\n\nfloat cizgiKonum(int &sayi) {\n  float toplam = 0;\n  sayi = 0;\n  for (int i = 0; i < 5; i++) {\n    if (analogRead(CIZGI[i]) > 512) {\n      toplam += 2 - i;\n      sayi++;\n    }\n  }\n  return sayi ? toplam / sayi : 0;\n}\n\nvoid skorYaz(const char *sonuc, unsigned long bitisMs) {\n  Serial.print(\"SKOR sonuc=\");\n  Serial.print(sonuc);\n  Serial.print(\" sure_s=\");\n  Serial.print((bitisMs - kosuBasla) / 1000.0, 2);\n  Serial.print(\" carpma=\");\n  Serial.print(carpma);\n  Serial.print(\" ort_hata_mm=\");\n  Serial.println(olcumSayisi ? hataToplamMm / olcumSayisi : 0.0, 1);\n}\n\nvoid setup() {\n  pinMode(SOL_EN, OUTPUT); pinMode(SOL_IN1, OUTPUT); pinMode(SOL_IN2, OUTPUT);\n  pinMode(SAG_EN, OUTPUT); pinMode(SAG_IN1, OUTPUT); pinMode(SAG_IN2, OUTPUT);\n  pinMode(TAMPON_SOL, INPUT_PULLUP);\n  pinMode(TAMPON_SAG, INPUT_PULLUP);\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  unsigned long simdi = millis();\n\n  // Çarpma sayacı: tampon basılınca bir kez say\n  bool tampon = digitalRead(TAMPON_SOL) == LOW || digitalRead(TAMPON_SAG) == LOW;\n  if (tampon && !tamponOnce && durum == KOS && simdi - sonCarpma > CARPMA_ARALIK_MS) {\n    carpma++;\n    sonCarpma = simdi;\n  }\n  tamponOnce = tampon;\n\n  int sayi;\n  float konum = cizgiKonum(sayi);\n\n  switch (durum) {\n    case BEKLE:\n      if (simdi >= BASLAMA_MS) {\n        kosuBasla = simdi;\n        sonCizgi = simdi;\n        durum = KOS;\n      }\n      break;\n\n    case KOS:\n      if (sayi > 0) {\n        sonCizgi = simdi;\n        hataToplamMm += fabs(konum) * SENSOR_ARALIK_MM;   // çizgi merkezden kaç mm kaçık\n        olcumSayisi++;\n        int fark = (int)(KP * konum);\n        surus(TABAN - fark, TABAN + fark);\n      }\n      if (simdi - sonCizgi > KAYIP_MS) {                   // pist bitti\n        surus(0, 0);\n        skorYaz(\"BITTI\", sonCizgi);\n        durum = BITTI;\n      } else if (simdi - kosuBasla > ZAMAN_ASIMI_MS) {\n        surus(0, 0);\n        skorYaz(\"ZAMAN_ASIMI\", simdi);\n        durum = BITTI;\n      }\n      break;\n\n    case BITTI:\n      surus(0, 0);\n      break;\n  }\n}\n```\n\n### Nasıl çalışıyor?\n1. `BEKLE` durumu 500 ms sonra `KOS`'a geçer ve `kosuBasla` kaydedilir. Tur süresi `kosuBasla` ile **son çizgi görülen an** arasındaki farktır; çizginin bittiğini anlamak için beklediğimiz 400 ms süreye dahil değildir.\n2. Çarpma sayacı tamponun **basılma anını** (önceki turda basılı değil, şimdi basılı) bir kez sayar. Robot duvara dayanıp tamponu basılı tutarsa ya da hafifçe titrerse çarpma 500 ms içinde tekrar sayılmaz.\n3. Ortalama hata, çizgiyi gören her turda `|konum| × 20 mm` olarak biriktirilir ve sayıya bölünür. Bu, ders 114'teki \"ortalama mutlak hata\" ile aynı formüldür.\n4. `skorYaz` tek bir satır yazar: `SKOR sonuc=BITTI sure_s=6.68 carpma=0 ort_hata_mm=2.4`. Satır anahtar=değer biçimindedir; ders 114'teki gibi bir program bunu kolayca okuyabilir.\n5. 15 sn'de bitiremezse `ZAMAN_ASIMI` yazar. Bir robotun \"hiç bitirmedi\" demesi, sessizce takılı kalmasından iyidir.\n\n**Simülatörde doğruladıklarımız:**\n- Temiz pist (1,6 m'lik çizgi, küçük bir kıvrım): `SKOR sonuc=BITTI sure_s=6.68 carpma=0 ort_hata_mm=2.4`. Süreyi simülatörün bildiği gerçek süreyle karşılaştırdık: 6,68 sn, aynı.\n- Pistin sonuna bir duvar koyduğumuzda (çizgi duvara çıkıyor): robot duvara dayandı, tampon basıldı ve satır `sonuc=ZAMAN_ASIMI sure_s=15.00 carpma=1` çıktı. Tek duvar, tek çarpma.\n- **Ortalama hata konusunda bir uyarı:** simülatörün bildiği gerçek ortalama sapma 8,7 mm'dir, sketch 2,4 mm yazdı. Fark sensörden gelir: sensörler 20 mm arayla ve çizgi 20 mm kalındır; bir sensör çizgiyi \"gördüğünde\" çizgi onun ±10 mm yakınında olabilir ama sketch hatayı 0 sayar. Yani skor tablosu **ölçtüğü cihazın çözünürlüğü kadar** dürüsttür. Bu sayıyı \"robotun çizgiden gerçek sapması\" diye değil, \"sensör dizisinin gördüğü sapma\" diye raporla. Daha hassas bir ölçüm için daha sık ya da analog (gri tonlu) sensör gerekir.\n\n### 2) Hata raporu: belirtiden kök nedene\nHata raporu bir özür değil, bir **kanıt zinciridir**. Şablon:\n\n```text\nHATA RAPORU\nBaşlık:            (tek cümle, sayıyla)\nBelirti:           ne gördük? (ölçülmüş, yorumsuz)\nYeniden üretme:    hangi koşulda, kaç denemede kaç kez?\nKatman incelemesi: her katman için: ne ölçtük, sonuç ne, SAĞLAM mı değil mi?\nKök neden:         belirtiyi üreten ilk katman ve nedeni\nDüzeltme:          tek değişiklik\nDoğrulama:         aynı test + komşu testler\nAlınan ders:       bir daha nasıl önlenir?\n```\n\nAşağıdaki örnek, ders 113'teki A yolunu hazırlarken **gerçekten yaşadığımız** türden bir hata. Ayrıntıları, `YAN_MS` değerini 1500 ms yaparak son sürümle yeniden üretip ölçtük.\n\n```text\nHATA RAPORU\nBaşlık:      A yolu parkurunu bitiremedi: robot engel duvarının ucunda takıldı.\nBelirti:     Robot, \"durum: SERBEST\" yazdıktan sonra x = 1,72 m, y = 1,22 m'de durdu;\n             \"durum: BITTI\" hiç yazılmadı. Robot merkezi ile en yakın duvar arası\n             7,5 cm (robot yarıçapı, yani duvara değiyor).\nYeniden üretme: aynı başlangıç, aynı sonuç (simülatörde sabit tohumla; T1 senaryosu).\n             Gerçek robotta tekrar tekrar denenmeli: bazen takılıp bazen geçiyorsa\n             hata sınırdadır.\nKatman incelemesi:\n  Karar (durum makinesi): iz kaydında yön en çok 1,55 rad (yaklaşık 89°) oldu,\n             sonra -0,06 rad'a (yaklaşık -4°) döndü. Sola dön, yana git, sağa dön\n             deseni işledi. SAĞLAM.\n  Dönüş:     ders 112'de 420 ms = yaklaşık 91°. SAĞLAM.\n  Yana gitme: iz kaydında en büyük y = 1,233 m. Duvar ucu y = 1,15 m, robot yarıçapı\n             0,075 m; geçmek için y >= 1,225 m gerekir: marj yalnız 8 mm. Üstelik\n             sağa dönüş robotu tam doğuya çevirmedi (-4°, hafif güneye); robot\n             ilerlerken y azaldı ve duvar ucuna geldiğinde y = 1,219 m idi.\n             6 mm EKSİK. SAĞLAM DEĞİL.\nKök neden:   Yana gitme süresi (YAN_MS = 1500 ms) robotu duvarın ucunu yarıçap\n             kadar aşacak yere götürmüyor; marj, dönüş hatasını bile\n             karşılayamayacak kadar dar. \"Belirti\": robot takıldı. \"Kök neden\":\n             YAN_MS yetersiz. Engel sensörü ya da motorlar suçlu değil.\nDüzeltme:    YAN_MS 1500 -> 2000 (tek değişiklik).\nDoğrulama:   T1 yeniden: bitirdi, en yakın duvar 18,1 cm. Komşu testler T2-T5 de geçti\n             (ders 113 matrisi).\nAlınan ders: Marj sıfıra yakındı; bu \"arada düzeliyor\" türünden bir sınır hatasıdır.\n             Yeni sürümde en büyük y = 1,348 m, yani marj yaklaşık 12 cm. Gereksinime\n             marjı yaz (y >= 1,225 + pay).\n```\n\n**Bu raporda dikkat et:**\n- *Belirti* ile *kök neden* ayrıdır. \"Robot takıldı\" belirtidir. Yalnızca belirtiyi tedavi etseydik (örneğin ENGEL_CM'yi büyütmek) tesadüfen düzelebilirdi ve hata başka bir parkurda geri gelirdi.\n- Her katmanda **ölçtük**, tahmin etmedik. İz kaydı, ders 112'nin dönüş ölçümü, duvar geometrisi.\n- Tek değişiklik yaptık. İki şeyi birden değiştirseydik hangisinin işe yaradığını bilemezdik.\n- Düzeltmeyi **komşu testlerle** doğruladık; bir hatayı düzeltirken başkasını bozmadığımızı gösterdik.\n\n### 3) Günlük rapor şablonu\nHYVEX'in `raporlar/` kültüründeki gibi her gün kısa bir rapor. Altı ay sonra bile birinin (ya da senin) neden o kararı aldığını anlayabileceği kadar ayrıntılı olmalı.\n\n```text\nGÜNLÜK RAPOR     Gün: __     Yazan: __     Yol: A / B / C\n\nBugünün hedefi:\n  (tek cümle, ölçülebilir)\n\nYaptıklarım:\n  - ...\n\nÖlçümler (sayı + birim + nasıl):\n  - ...\n\nSorun -> kök neden -> düzeltme:\n  Belirti:\n  Kök neden:\n  Düzeltme:\n\nKarar ve nedeni:\n  (neyi seçtim, hangi seçeneği neden eledim?)\n\nYarın:\n  - ...\n```\n\nAşağıdaki örnek A yolu için, ders 113'ü yapan bir öğrencinin günlük raporudur (örnek, uydurma bir öğrenci; sayılar ders 113'ün ölçümleridir).\n\n```text\nGÜNLÜK RAPOR     Gün: 3     Yol: A\n\nBugünün hedefi:\n  A yolu parkurunu durum makinesiyle uçtan uca çarpmadan bitirmek.\n\nYaptıklarım:\n  - a_arac sketch'ini durum makinesiyle birleştirdim.\n  - Test matrisinin 5 senaryosunu çalıştırdım.\n\nÖlçümler:\n  - T1: 11,2 sn, en yakın duvar 18,1 cm, çarpma yok (simülatör).\n  - T4 (sağ motor %4 zayıf): en yakın duvar 10,0 cm; marj daralıyor.\n\nSorun -> kök neden -> düzeltme:\n  Belirti: YAN_MS = 1500 ile robot duvar ucunda takıldı (1,72; 1,22).\n  Kök neden: yana gitme mesafesi yetmiyor, 6 mm eksik.\n  Düzeltme: YAN_MS = 2000.\n\nKarar ve nedeni:\n  Süreyi artırdım, engel eşiğini (28 cm) değiştirmedim: eşik algılamayı değil,\n  yana gitmeyi etkiliyor.\n\nYarın:\n  - Gerçek robotta DONUS_MS'yi iletkiyle yeniden ölç.\n```\n\nGit kullanıyorsan, aynı düzeltmenin commit mesajı da bir mini rapordur: `yol-a: YAN_MS 1500 -> 2000, robot engel ucunda 6 mm eksik kaldigi icin takiliyordu`. \"düzelttim\" ya da \"son hali\" gibi mesajlar altı ay sonra hiçbir şey anlatmaz (HYVEX'in \"anlamlı commit\" ilkesi).\n\n### Sergi günü için kontrol listesi\n- Robotun, tasarım belgen ve sonuç tablon yan yana.\n- Her ölçüt için ölçüm yöntemi ve sayı, geçti/kaldı.\n- Bir hata raporu: belirti, kök neden, düzeltme, doğrulama.\n- Günlük raporların: kararların nedeni.\n- Seri çıktıyı gösteren bir ekran: `SKOR ...` ya da `yol A: GECTI`.\n- Robotun yedek pili ve harici güç kaynağı (pil güvenliği: kısa devre yapma, ters bağlama).\n- Bir \"olmazsa\" planı: robot sergide yanlış çalışırsa gösterebileceğin kayıt ya da ölçüm tablosu.\n\n### Yolculuk: Arduino'dan robota\nBu proje Modül 3'ten 5'e uzanan yolun son halkası.\n- **Modül 3, Arduino temelleri:** bir LED'i yakmaktan başladın. Dijital ve analog girişleri, PWM'i, motor ve röle sürmeyi, `millis()` ile bloklamayan kodu, durum makinelerini, kesmeleri, I2C'yi ve EEPROM'u öğrendin. Termostatla ilk bitirme projeni yaptın.\n- **Modül 4, sensörler:** dünyayı ölçmeyi öğrendin. HC-SR04 ile mesafe, PIR, kızılötesi ve reed sensörleri, sıcaklık ve nem, basınç, joystick, döner enkoder, MPU6050 ile eğim, keypad ve gerçek zamanlı saat. Her ölçümün gürültülü olduğunu ve filtreyle düzeltildiğini gördün.\n- **Modül 5, robotik:** sensör ve motoru bir robota çevirdin. Diferansiyel sürüş, engelden kaçma, çizgi izleme, enkoder ve odometri, PID, IMU ile denge, davranış tabanlı kontrol ve robot kol. Bu hafta üçünü bir araya getirip ölçütlerle sınadın, hatalarını kök nedene indirgedin ve sonuçlarını raporladın.\n\nBir şeyi sadece çalıştırmayı değil, **ölçerek kanıtlamayı** öğrendin. Elinde artık çalışan bir robot, onu anlatan bir tasarım belgesi, ölçüm tablosu ve bir hata raporu var.\n\n### Dene\n- Kendi yolunun sonuç tablosunu doldur. Her satır için \"nasıl ölçüldü\" sütununu yaz. Hangi ölçümün zayıf olduğunu işaretle.\n- `skor_tablosu` sketch'indeki `KP` değerini 30 ve 90 yap. Süre, çarpma ve ortalama hata nasıl değişiyor? Hangi değer en iyi? Bunu bir tabloyla göster.\n- Kendi robotunda bir hata bul ve hata raporu şablonuyla yaz: belirti, katman incelemesi, kök neden, tek değişiklik, doğrulama.\n- Üç günlük rapor yaz. Bir arkadaşına ver; senin kararını anlayabiliyor mu?\n\n### Sık yapılan hatalar\n- Sonucu ölçümden önce yazmak ya da başarısız testi tablodan çıkarmak. Başarısız test, raporun en değerli satırlarından biridir.\n- Belirtiyi kök neden sanmak: \"robot çarptı\" sonuçtur, neden değil.\n- Tek seferde birkaç şeyi değiştirip \"düzeldi\" demek. Hangisinin işe yaradığını bilemezsin.\n- \"Arada düzeliyor\" hatasını ciddiye almamak. Bazen geçip bazen kalan bir test, sınırda bir sorun olduğunu gösterir.\n- Simülatör ölçümlerini gerçek robotun sonucu gibi sunmak.\n- Skor tablosunun ortalama hatasını gerçek hata sanmak. Sensörün çözünürlüğü sayıyı sınırlar.\n- Raporu \"yarın yazarım\" diye ertelemek. Yaptığın şeyin nedeni birkaç günde unutulur.",
          "question": "Altı ay sonra bu robotun yanında seni tanımayan biri durup raporlarını okusa, \"neden bu `YAN_MS` değeri?\" sorusunun cevabını bulabilir mi? Bulamazsa raporuna ne eksik?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Başarıyı kanıtlayan **sonuç tablosunu** (ölçüt, nasıl ölçüldü, ölçülen, sonuç) yazmayı\n- Bir hatayı belirtiden **kök nedene** katman katman indirgemeyi\n- Günlük rapor ve anlamlı commit mesajı yazmayı\n- Simülatör ölçümü ile gerçek robot ölçümünü birbirinden ayırarak raporlamayı\n\n### Önceden bilmen gerekenler\n- Ders 111: kabul ölçütleri\n- Ders 113: test matrisi ve durum makinesi\n- Ders 114: ortalama ve en büyük mutlak hata\n- 87. ders: sensör değerlerini önce seri portta okuma\n\n### Sunumun üç belgesi\nBirisi \"Peki ne kadar iyi?\" diye sorduğunda \"iyi çalışıyor\" dersen konuşma biter. \"Ölçütü 20 ± 3 cm, ölçtüğüm 18,3 ile 22,0 cm\" dersen konuşma başlar. Üç belge gerekir: **sonuç tablosu**, **hata raporu** ve **günlük rapor**. Hepsi düz metindir; süslü slayt değil güvenilir sayı aranır.\n\n### Sonuç tablosu\nHer ölçüt için dört sütun: ne istendi, nasıl ölçüldü, ne ölçüldü, sonuç. Dürüstlüğü üç şey sağlar: \"nasıl ölçüldü\" sütunu (yöntemi olmayan sayı kanıt değildir), kapsam notu ve sonucun nereden geldiği. Örneğin kol için 0,09 mm hata, simülatörde komut edilen konumdur; dişli boşluğu, eğilme ve servo ölü bandı ölçülmedi. Bu yüzden satıra \"GEÇTİ (kapsam sınırlı)\" yazılır.\n\n### Ölçmenin sınırı\nRobot kendi skorunu ölçebilir (süre, çarpma, ortalama çizgi hatası) ama ölçtüğü cihazın çözünürlüğü kadar dürüsttür. Çizgi sensörleri 20 mm arayla dizilmiştir; çizgiyi gören sensör hatayı 0 sayar, oysa çizgi onun ±10 mm yakınında olabilir. Bu yüzden skor \"gerçek sapma\" değil \"sensör dizisinin gördüğü sapma\" olarak raporlanır. Çarpma sayacında da aynı tamponun titreşimi tek sayılsın diye 500 ms'den sık basışlar birleştirilir.\n\n### Kök neden analizi\n**Belirti** gördüğündür (\"robot duvar ucunda takıldı\"); **kök neden** belirtiyi üreten ilk katmandır. Rapor şunları içerir: belirti, yeniden üretme, katman incelemesi (her katmanda ne ölçüldü, sağlam mı), kök neden, **tek** değişiklik, doğrulama (aynı test ve komşu testler) ve alınan ders.\n\nÖrnek: `YAN_MS = 1500` iken robot duvar ucuna 6 mm eksik kaldı: gerekli y ≥ 1,15 + 0,075 = 1,225 m, ulaşılan 1,219 m. Dönüş, karar ve sensör sağlamdı; kök neden yana gitme süresiydi. Tek değişiklik `YAN_MS: 1500 -> 2000`. Sınırda \"arada düzeliyor\" diye anılan hatalar bu tür dar marjdan çıkar.\n\n### Günlük rapor ve commit\nGünlük rapor: hedef, yaptıklarım, ölçümler (sayı + birim + nasıl), sorun-kök neden-düzeltme, kararın nedeni, yarın. Hedef: altı ay sonra okuyan biri \"neden bu değer?\" sorusunun cevabını bulabilsin. Commit mesajı da mini rapordur: \"düzelttim\" değil, \"YAN_MS 1500 -> 2000, 6 mm eksik kaldığı için robot takılıyordu\".\n\n### Özet\nGüvenilir sunum sayı, ölçüm yöntemi ve kapsam sınırıyla gelir. Hata raporu belirtiyi kök nedenden ayırır, her katmanı ölçer, tek değişiklik yapar ve komşu testleri de koşar. Skor tablosu ölçtüğü cihazın çözünürlüğü kadar dürüsttür. Simülatör sonuçları gerçek robot sonucu gibi sunulmaz.",
          "concepts": [
            {
              "term": "Sonuç tablosu",
              "definition": "Her ölçüt için ne istendiği, nasıl ölçüldüğü, ne ölçüldüğü ve sonucun yazıldığı tablo.",
              "example": "C yolu: \"20 ± 3 cm\", \"simülatörün bildiği mesafe\", \"18,3-22,0 cm\", \"GEÇTİ\".",
              "pitfall": "Başarısız testi tablodan çıkarmak: başarısız test raporun en değerli satırlarındandır."
            },
            {
              "term": "Kapsam sınırı",
              "definition": "Ölçümün neyi kapsayıp neyi kapsamadığının sonuçla birlikte yazılması.",
              "example": "Kol için \"GEÇTİ (kapsam sınırlı)\": komut edilen konum ölçüldü, dişli boşluğu ölçülmedi.",
              "pitfall": "Simülatör ölçümünü gerçek robotun sonucu gibi sunmak."
            },
            {
              "term": "Belirti ve kök neden",
              "definition": "Belirti gördüğündür; kök neden belirtiyi üreten ilk katmandır.",
              "example": "\"Robot duvar ucunda takıldı\" belirti; \"YAN_MS yetersiz\" kök nedendir.",
              "pitfall": "Belirtiyi tedavi etmek (örneğin ENGEL_CM'yi büyütmek): hata başka parkurda geri gelir."
            },
            {
              "term": "Katman incelemesi",
              "definition": "Hatayı karar, dönüş, hareket gibi katmanlarda tek tek ölçüp sağlam olanları elemek.",
              "example": "Karar ve dönüş sağlam çıktı; yana gitme marjı yalnız 8 mm'ydi.",
              "pitfall": "Tahminle ilerlemek ve aynı anda birkaç şeyi değiştirmek."
            },
            {
              "term": "Debounce aralığı (çarpma sayacı)",
              "definition": "Aynı tamponun titreşimlerini tek çarpma saymak için tanınan bekleme süresi.",
              "example": "500 ms içindeki ikinci basış sayılmaz.",
              "pitfall": "Aralığı unutmak: tek çarpma birkaç çarpma olarak sayılır."
            },
            {
              "term": "Günlük rapor",
              "definition": "Hedef, yapılan iş, ölçümler, sorun-kök neden-düzeltme ve kararın nedenini içeren kısa günlük kayıt.",
              "example": "\"Süreyi artırdım, engel eşiğini değiştirmedim: eşik algılamayı etkiliyor, yana gitmeyi değil.\"",
              "pitfall": "Raporu \"yarın yazarım\" diye ertelemek: nedeni birkaç günde unutulur."
            }
          ],
          "quiz": [
            {
              "id": "m5h8d5-q1",
              "kind": "mcq",
              "prompt": "Hata raporunda hangisi bir KÖK NEDEN ifadesidir?",
              "options": [
                "Robot duvar ucunda takıldı",
                "Yana gitme süresi robotu duvar ucunu yarıçap kadar aşacak yere götürmüyor (marj yok)",
                "Robot çarptı",
                "Simülatör yanlış çalışıyor"
              ],
              "answer": 1,
              "explanation": "\"Takıldı\" ve \"çarptı\" belirtidir, ölçüp gördüğündür. Kök neden, belirtiyi üreten ilk katmandır ve ölçümle desteklenir: yana gitme marjı. \"Simülatör yanlış\" ise ölçmeden atılan bir bahanedir.",
              "skills": [
                "rep-root-cause"
              ]
            },
            {
              "id": "m5h8d5-q2",
              "kind": "numeric",
              "prompt": "Skor sketch'i çizgi hatasını `|konum| × 20 mm` olarak biriktiriyor. Dört ölçümde konum değerleri 0, 0,5, -1 ve 0,5 ise ortalama hata kaç mm'dir?",
              "answer": 10,
              "tolerance": 0.05,
              "unit": "mm",
              "explanation": "Mutlak değerler 0, 0,5, 1, 0,5; ortalaması 2 / 4 = 0,5 sensör aralığı. 0,5 × 20 mm = 10 mm. İşaretli ortalama 0,0 olurdu (0 + 0,5 - 1 + 0,5 = 0).",
              "skills": [
                "rob-error-stats",
                "rep-honest-results"
              ]
            },
            {
              "id": "m5h8d5-q3",
              "kind": "predict-output",
              "prompt": "Çarpma sayacı 500 ms'den sık basışları tek sayar. Tampon basış anları (ms) 1000, 1200, 1900 ve 2500'dür. Bu kod ne yazar?\n```\nunsigned long basis[] = {1000, 1200, 1900, 2500};\nunsigned long son = 0;\nint carpma = 0;\nfor (int i = 0; i < 4; i++) {\n  if (basis[i] - son > 500) { carpma++; son = basis[i]; }\n}\nSerial.println(carpma);\n```",
              "options": [
                "1",
                "2",
                "3",
                "4"
              ],
              "answer": 2,
              "explanation": "1000: önceki 0'dan 1000 ms geçti, sayılır (1), son = 1000. 1200: 200 ms geçti, sayılmaz. 1900: 900 ms geçti, sayılır (2), son = 1900. 2500: 600 ms geçti, sayılır (3). Toplam 3. 1200 ms'deki basış titreşim sayıldığı için elendi.",
              "skills": [
                "prog-timing",
                "prog-debug"
              ]
            },
            {
              "id": "m5h8d5-q4",
              "kind": "find-bug",
              "prompt": "Çizgi izleyen robotun skor tablosu ortalama hatayı hep sıfıra yakın veriyor. Kodda tek hata var; hangisi?\n```\nif (sayi > 0) {\n  sonCizgi = simdi;\n  hataToplamMm += konum * SENSOR_ARALIK_MM;\n  olcumSayisi++;\n}\n```",
              "options": [
                "`olcumSayisi++` olmamalı",
                "`konum` yerine `fabs(konum)` toplanmalı; işaretli değerler birbirini götürüyor",
                "SENSOR_ARALIK_MM ile çarpılmamalı",
                "`sonCizgi = simdi` silinmeli"
              ],
              "answer": 1,
              "explanation": "Çizginin soluna ve sağına sapmalar işaret farkıyla birbirini götürür; robot yanlış gidiyorken ortalama sıfıra yaklaşır. Hata büyüklüğü `fabs` ile alınmalı. `olcumSayisi` ortalamanın bölenidir; `sonCizgi` çizginin bitişini algılamak için gerekir.",
              "skills": [
                "rob-error-stats",
                "prog-debug"
              ]
            },
            {
              "id": "m5h8d5-q5",
              "kind": "mcq",
              "prompt": "Robot kol simülatörde komut edilen konumda 0,09 mm hata ölçtü (dişli boşluğu ve eğilme modellenmiyor). Sonuç tablosuna ne yazılmalıdır?",
              "options": [
                "GEÇTİ: kol 0,09 mm doğrulukla çalışıyor",
                "KALDI: çünkü gerçek kol ölçülmedi",
                "Satır tablodan çıkarılır",
                "GEÇTİ (kapsam sınırlı): komut edilen konum, simülatör; mekanik hata ölçülmedi"
              ],
              "answer": 3,
              "explanation": "Sonuç doğrudur ama kapsamı sınırlıdır. Neyin ölçüldüğünü ve neyin ölçülmediğini yazmak, sayıyı gerçek robotun sonucu gibi sunmaktan kaçınmak demektir. Satırı çıkarmak ya da gerçeğe uymayan bir kesinlik iddia etmek dürüst değildir.",
              "skills": [
                "rep-honest-results"
              ]
            }
          ]
        }
      ]
    }
  ]
}
