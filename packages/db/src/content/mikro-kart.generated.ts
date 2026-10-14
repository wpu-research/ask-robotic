// OTOMATİK ÜRETİLDİ — elle düzenleme. Kaynak: content-src/modul-10/ · Komut: node tools/content/build.mjs modul-10
import type { ModuleContent } from './types'

export const modul10: ModuleContent = {
  "slug": "mikro-kart",
  "title": "Mikro Kart",
  "track": "maker",
  "position": 10,
  "minAge": 8,
  "weeks": [
    {
      "title": "Kartı tanı",
      "project": "Atan kalp",
      "guideMd": "### Hafta hedefleri\nBu haftanın sonunda öğrenci:\n1. Mikro Kart'ın parçalarını (25 LED'lik ekran, A ve B düğmeleri, logo, P0-P2) ve sanal kartın ne olduğunu söyleyebilir.\n2. Blok editöründe başlık bloğuna (başlangıçta, sonsuza kadar) bloklar takıp ▶ ile çalıştırabilir; blokların yukarıdan aşağıya, sırayla çalıştığını açıklayabilir.\n3. LED'lerin (x, y) adresini, 0'dan sayımı ve ekranı temizleme/bekleme mantığını kullanarak tek tek LED yakabilir.\n4. Hazır simgeleri ve kendi çizdiği 5 x 5 deseni gösterebilir; iki çizim arasına bekleme koyarak animasyon yapabilir.\n5. Tekrarla bloğunu ve bekleme sürelerini kullanıp ritimli bir proje (Atan kalp) kurabilir; döngünün toplam süresini hesaplayabilir.\n\n### Haftanın planı\nHafta beş derstir; her ders yaklaşık 15-30 dakikadır. Aşağıdaki plan günde bir ders içindir.\n\n| Gün | Ders | Süre | Ne yapılır |\n|---|---|---|---|\n| 1 | Merhaba, Mikro Kart | ~15 dk | Anlatımı oku, kartın parçalarını tanı, yazı ve sayı göster, mini testi çöz. |\n| 2 | LED'lerin adresi: x ve y | ~20 dk | Çapraz çizgiyi ve dört köşeyi çiz, adresleri kâğıda yazıp kontrol et. |\n| 3 | Simgeler ve kendi desenin | ~20 dk | Yüzleri göster, robot başını çiz, iki çizim arasına bekle koyup animasyon yap. |\n| 4 | Sıra ve tekrar | ~20 dk | Üç yanıp sönmeyi tekrarla ile kur, sayı ve süreleri değiştirip dene. |\n| 5 | Proje: Atan kalp | ~30 dk | Planı tabloya yaz, kalbi kur, ritmi değiştir, proje ölçütüyle değerlendir. |\n\n### Ön koşul kontrolü\nBu hafta özel bir ön bilgi gerekmez. Başlamadan önce şunları kontrol et:\n- Tarayıcıda Mikro Kart editörü açılıyor mu ve ▶ düğmesi çalışıyor mu?\n- Öğrenci fareyle (ya da parmakla) blok tutup sürükleyebiliyor mu?\n- Sayıları 0'dan 10'a kadar sayabiliyor ve toplama/çarpma yapabiliyor mu? (Süre hesaplarında gerekir.)\n\n### Kavram haritası\n- **Kart:** LED ekranı (5 x 5 = 25) → düğmeler ve logo → sanal kart\n- **Program:** başlık bloğu (başlangıçta, sonsuza kadar) → bloklar yukarıdan aşağıya → JavaScript ve Python görünümü (salt okunur)\n- **Ekran:** yazı (kayar) ve tek karakter (durur) → LED adresi (x, y) → simge ve desen → ekranı temizle\n- **Zaman:** bekle (ms) → animasyon → tekrarla → tur süresi ve toplam süre\n- **Proje:** plan tablosu → parlaklık (0-255) → ritim\n\n### Sık yapılan hatalar\n- **Bloğu başlık bloğunun dışında bırakmak.** Soluk görünür ve hiç çalışmaz.\n- **Değişiklikten sonra ▶ düğmesine basmamak.** Eski program ekranda kalır.\n- **x ile y'yi karıştırmak ya da 1'den saymak.** (4, 0) sağ üst köşedir; en büyük adres 4'tür, 5 değil. Ekran dışı adres hata vermeden yok sayılır.\n- **bekle koymamak.** Art arda iki çizimde yalnızca sonuncusu görülür; çizip hemen temizlenen şey de görünmez.\n- **Temizlemeyi unutmak.** Yanıp sönmede kare hiç sönmez.\n- **Bloğu tekrarla'nın içine/dışına yanlış takmak.** İçeridekiler her turda, dışarıdakiler bir kez çalışır.\n- **Yazıyı sonsuza kadar içine koymak.** Her turda yeniden kayar ve kalp atışını bozar.\n- **Parlaklığı 0 yapıp programın bozulduğunu sanmak.** Ekran karanlıktır ama program çalışır.\n\n### Hafta sonu tekrarı\n1. Her dersin kavram kartlarına bir kez daha bak ve \"sık yapılan yanlış\" satırlarını yüksek sesle oku.\n2. Mini testlerde yanlış yaptığın soruların açıklamalarını yeniden oku, sonra soruyu yeniden çöz.\n3. Dört köşeyi yakan programı sıfırdan, bakmadan kur; sonra çerçevenin tamamını (16 LED) yakmayı dene.\n4. Kendi çizdiğin bir deseni kâğıda 1 ve 0'larla yaz, kaç LED yandığını say ve editörde kontrol et.\n5. Atan kalbin tur süresini ve dakikadaki tur sayısını hesapla; sonra bekleme sürelerini değiştirip hızın nasıl değiştiğini anlat.\n\nHafta sonu testi olarak beş dersin mini testleri yeterlidir; her derste 5 soru, toplam 25 soru. Hedef: her dersten en az 4 doğru. Eksik kalan dersin anlatımına dön.\n\n### Proje değerlendirme ölçütü (Atan kalp)\n| Ölçüt | Gelişmeli | Yeterli | İleri |\n|---|---|---|---|\n| Yapı | Bloklar başlık bloğunun dışında ya da program çalışmıyor | Yazı başlangıçta, kalp sonsuza kadar içinde | Plan tablosuyla birebir uyuşuyor ve bölümlerin neden ayrıldığı anlatılıyor |\n| Görünüm | Kalp ya da küçük kalp görünmüyor | Büyük ve küçük kalp sırayla görünüyor, parlaklık ayarlı | Parlaklığı bilerek seçmiş ve nedenini açıklıyor |\n| Ritim | Beklemeler yok ya da çok kısa | Tup-tup ve dinlenme ayırt ediliyor | Hızlı ve yavaş iki ritim yapıp tur süresini hesaplıyor |\n| Hata ayıklama | Takıldığında nedenini bulamıyor | Hatayı sorarak/bakarak buluyor | Hatayı kendi başına bulup nasıl bulduğunu anlatıyor |\n| Anlatım | Ne yaptığını anlatamıyor | Blokları sırayla anlatıyor | Bir arkadaşının programındaki hatayı bulup düzeltiyor |\n\n### Veli ve öğretmen notu\n- **Amaç.** Bu hafta ezber değil, çocuğun blokla düşünmeye ve sonucu hemen görmeye alışmasıdır. Kart sanaldır; hata yapmak güvenlidir ve ↺ ile sıfırlanır.\n- **Nasıl destek olunur?** Cevabı söylemek yerine şunları sor: \"Hangi blok önce çalışıyor?\", \"Bu blok başlangıçta bloğuna bağlı mı?\", \"Bekle koydun mu?\", \"Hangi adresi yazdın, ekranın neresi?\"\n- **Süre.** Dersleri art arda yapmak yerine her gün bir ders ve kısa bir tekrar kalıcılığı artırır. Yaş 8 ise okuma ve sayı işlemlerinde birlikte ilerleyin.\n- **Ekran süresi.** Dersler kısadır; uzun oturumlar yerine ara vermek iyi olur.\n- **İlerleme.** Dersin sonundaki mini test sonuçları beceri bazında görünür (taslak/pilot özellik; yalnız onay verildiyse kaydedilir).",
      "lessons": [
        {
          "title": "Merhaba, Mikro Kart",
          "durationMin": 15,
          "problem": "Avucuna sığacak kadar küçük bir bilgisayar düşün. Ekranı sadece 25 küçük ışıktan oluşuyor, yine de yazı yazabiliyor, şarkı çalabiliyor, sana cevap verebiliyor. Bu kartı bloklarla programlayacaksın. Peki 25 ışıkla bir yazı nasıl ekrana sığar?",
          "contentMd": "### Sanal kartla tanış\nBu modülde **sanal Mikro Kart** ile çalışacaksın. Kart tamamen bilgisayarın içinde yaşar; kablo, pil ya da gerçek bir parça yok. Ekranda gördüğün her şeyi fareyle ya da parmağınla kullanırsın.\n\nKartın şu parçaları var:\n\n| Parça | Ne işe yarar? |\n|---|---|\n| LED ekranı | 5 sütun x 5 satır, toplam 25 küçük ışık |\n| A ve B düğmeleri | Kartın iki yanında. Basınca programa haber verir |\n| A+B düğmesi | İkisine birlikte basmak için |\n| Logo (yıldız) | Dokununca programa haber veren bir yüzey |\n| P0, P1, P2 | Kartın altındaki üç bağlantı noktası (sonra kullanacağız) |\n\nKartın sağında bir kontrol paneli vardır. Orada sallama, eğme, ışık, sıcaklık gibi şeyleri sen değiştirirsin. Onları da ilerleyen derslerde kullanacağız.\n\n### Editörün parçaları\n- **Üst çubuk:** ▶ **Çalıştır**, ■ **Durdur**, ↺ **Sıfırla** düğmeleri burada. Ayrıca **Başa dön** (dersin başlangıç haline döner), **Dışa aktar** ve **İçe aktar** var.\n- **Hedefler kutusu:** Bu dersin görevleri. Bir görevi başardıkça yanındaki kutuya ✓ işareti gelir.\n- **Blok kutusu:** Solda renkli kategoriler. Bu derste yalnızca **Temel** kategorisini kullanacaksın.\n- **Sekmeler:** **Bloklar**, **JavaScript**, **Python**. Son ikisinde bloklarının yazılı kodunu görürsün. Orada yazı değiştiremezsin, sadece okursun.\n\n### Program: Merhaba\nEkranda zaten bir **başlangıçta** bloğu duruyor. Bu blok, programı başlattığında bir kez çalışır. Bütün programlar böyle bir başlık bloğunun içinde yaşar.\n\n1. Blok kutusunda **Temel** kategorisine tıkla.\n2. **yazıyı göster [Merhaba!]** bloğunu tutup **başlangıçta** bloğunun içine sürükle. Bırakınca içeri oturduğunu göreceksin.\n3. Bloktaki yazıya tıkla ve kendi adını yaz. İstersen \"Merhaba\" olarak bırak.\n4. **Temel** kategorisinden **sayıyı göster [0]** bloğunu al ve yazı bloğunun hemen altına tak.\n5. Sayı kutusuna 7 yaz.\n6. ▶ **Çalıştır** düğmesine bas.\n\n### Beklenen sonuç\nKartın ekranında yazı sağdan sola doğru kayar. \"Merhaba\" gibi 7 harfli bir yazı yaklaşık 4 saniye sürer. Yazı bitince ekran söner, sonra ortada 7 rakamı yarım saniye kadar görünür. Hedefler kutusundaki üç görevde de ✓ işareti olmalı.\n\n### Nasıl çalışıyor?\n- Bloklar **yukarıdan aşağıya**, sırayla çalışır.\n- Kayan yazı bitmeden bir sonraki blok başlamaz. Kart, yazıyı bitirene kadar bekler.\n- Tek bir harf ya da tek basamaklı sayı kaymaz. Ekranın ortasında kısa süre durur. İki basamaklı bir sayı (örneğin 25) ise yazı gibi kayar.\n- **JavaScript** sekmesine bak: `card.onStart(...)` satırının içinde `screen.showText(\"Merhaba\")` ve `screen.showNumber(7)` yazıyor. Bloklarının kod hâli bu. **Python** sekmesinde aynı program başka bir dille yazılmış olarak durur.\n\n### Dene\n1. Yazıyı değiştir ve ▶ düğmesine yeniden bas. Kayma ne kadar sürdü? Uzun yazıyla kısa yazıyı karşılaştır.\n2. Sayı bloğuna 25 yaz. Tek basamaklı sayıdan farkı ne?\n3. İki **yazıyı göster** bloğunu alt alta koy. Hangisi önce görünüyor?\n\n### Sık yapılan hatalar\n- **Bloğu başlangıçta'nın dışına bırakmak.** Bir başlık bloğuna bağlı olmayan blok yığını çalışmaz, soluk görünür. Bloğu başlangıçta'nın içine taşı.\n- **Değiştirdikten sonra ▶ düğmesine basmamak.** Program çalışırken yaptığın değişiklik kendiliğinden uygulanmaz. Ekranda \"Değişiklikler için ▶ düğmesine bas\" notu çıkar.\n- **Programı bitirmeden sonuç beklemek.** Kayan yazı bitmeden sayı görünmez. Biraz bekle.",
          "question": "Kartın ekranı yalnızca 5 sütun genişliğinde. Uzun bir yazıyı küçük ekranda göstermenin kayma dışında başka yolları olur mu? Sence neden bir harfi kaydırmak yerine ortada tutuyoruz?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Mikro Kart'ın parçalarını (LED ekranı, düğmeler, logo, bağlantı noktaları) ve ne işe yaradıklarını\n- Blok editöründe bir programın nasıl kurulduğunu: başlık bloğu, altına takılan bloklar, ▶ Çalıştır\n- Blokların yukarıdan aşağıya, sırayla çalıştığını\n- Yazının kayarak, tek harfin ve tek basamaklı sayının ise ortada durarak gösterildiğini\n\n### Önceden bilmen gerekenler\nHiçbir şey. Bu ders modülün ilk dersidir. Fareyle bir nesneyi tutup sürükleyebilmen yeter.\n\n### Küçük ama eksiksiz bir bilgisayar\nMikro Kart, avuç içine sığan bir bilgisayardır. Ekranı 25 küçük ışıktan (**LED**) oluşur; bu ışıklar 5 sütun ve 5 satırlık bir ızgara kurar. Kartın iki yanında **A** ve **B** düğmeleri, ortasında bir **logo** yüzeyi vardır. Altındaki P0, P1 ve P2 bağlantı noktalarını ilerleyen haftalarda kullanacaksın. Bu modüldeki kart **sanaldır**: bilgisayarın içinde çalışır, pil ya da kablo gerektirmez.\n\n### Program nedir, blok nedir?\nBilgisayar yalnızca kendisine söylenenleri yapar. Söylenenlerin yazılı listesine **program** denir. Bu modülde programı yazı yazarak değil, renkli **blokları** birbirine takarak kurarsın. Her blok tek bir iş yapar: \"yazıyı göster\", \"bekle\", \"ekranı temizle\" gibi.\n\nBlokların nerede çalışacağını **başlık bloğu** belirler. **başlangıçta** bloğu, ▶ düğmesine basınca bir kez çalışan bölümdür. Bir blok bu bloğa bağlı değilse kart onu görmez; soluk görünür ve çalışmaz. Bunu, kapısı olmayan bir odaya benzetebilirsin: içeri giremezsin.\n\n### Sıra her şeydir\nKart blokları **yukarıdan aşağıya**, tek tek çalıştırır. Bir blok bitmeden bir sonrakine geçmez. Aşağıdaki iki yığın aynı bloklardan oluşur ama sonuçları farklıdır:\n\n```\nYığın A: yazı \"Hi\"  ->  sayı 7\nYığın B: sayı 7  ->  yazı \"Hi\"\n```\n\nA'da önce Hi kayar, sonra 7 görünür. B'de önce 7 görünür, sonra Hi kayar. Bu yüzden \"ne yapılacak\" kadar \"hangi sırayla\" da önemlidir.\n\n### Yazı kayar, tek karakter durur\nEkran yalnızca 5 sütun genişliğinde olduğu için uzun bir yazı sağdan sola **kayar**. Kayma sırasında kart bekler; yazı bitmeden sonraki blok başlamaz. \"Merhaba\" gibi 7 harfli bir yazı yaklaşık 4 saniyede kayıp biter. Tek bir harf ya da tek basamaklı sayı ise ekrana sığar, kaymaz; ortada yaklaşık yarım saniyeden biraz uzun durur. İki basamaklı bir sayı (örneğin 25) iki karakter olduğu için yazı gibi kayar.\n\n### Kodun gizli yüzü\nEditörde **JavaScript** ve **Python** sekmeleri vardır. Bloklarının yazılı kod karşılığını gösterir. Orada yazı değiştiremezsin, yalnızca okursun. Bloklarla yazılı kod aynı programdır; yalnızca görünümleri farklıdır. Yazılı kodu okumak, ileride yazarak programlamaya geçişe hazırlar.\n\n### Özet\nMikro Kart 25 LED, iki düğme ve bir logo taşıyan sanal bir bilgisayardır. Programı bloklardan kurarsın ve her blok yığını bir başlık bloğuna bağlı olmalıdır. Bloklar yukarıdan aşağıya, sırayla çalışır. Uzun yazı kayar, tek karakter ortada durur.",
          "concepts": [
            {
              "term": "LED ekranı",
              "definition": "Kartın 5 sütun ve 5 satırdan oluşan, toplam 25 küçük ışığı olan ekranı.",
              "example": "Kalp simgesi, ekrandaki 25 ışığın bir bölümünün yanmasıyla çizilir.",
              "pitfall": "Ekranı yüzlerce noktalı bir ekran sanmak; yalnızca 25 ışık vardır, bu yüzden uzun yazı sığmaz ve kayar."
            },
            {
              "term": "Başlık bloğu (başlangıçta)",
              "definition": "Programın nereden çalışmaya başlayacağını belirleyen blok; altına takılan bloklar ▶ ile bir kez çalışır.",
              "example": "yazıyı göster bloğunu başlangıçta bloğunun içine takınca ▶ ile yazı kayar.",
              "pitfall": "Bloğu başlangıçta bloğunun dışında bırakmak: bağlı olmayan blok soluk görünür ve hiç çalışmaz."
            },
            {
              "term": "Sıra",
              "definition": "Bloklar yukarıdan aşağıya, bir bitmeden bir sonraki başlamadan çalışır.",
              "example": "Önce yazıyı, sonra sayıyı göstermek için yazı bloğunu sayı bloğunun üstüne koyarsın.",
              "pitfall": "Blokları ters sırada dizip \"program bozuk\" sanmak; çoğu zaman yalnızca sıra yanlıştır."
            },
            {
              "term": "Kayan yazı",
              "definition": "Ekrana sığmayan yazının sağdan sola kayarak gösterilmesi; tek karakter kaymaz, ortada kısa süre durur.",
              "example": "\"Merhaba\" yaklaşık 4 saniyede kayar; tek basamaklı 7 ortada durur, 25 ise iki karakter olduğu için kayar.",
              "pitfall": "Kayan yazının bitmesini beklememek: sonraki blok yazı bitene kadar başlamaz."
            },
            {
              "term": "Kod sekmeleri",
              "definition": "JavaScript ve Python sekmeleri, bloklarının yazılı kod karşılığını salt okunur gösterir.",
              "example": "JavaScript sekmesinde screen.showText(\"Merhaba\") satırını görürsün.",
              "pitfall": "Sekmelerde kodu değiştirmeye çalışmak; değişiklik blokların üzerinden yapılır."
            }
          ],
          "quiz": [
            {
              "id": "m10h1d1-q1",
              "kind": "mcq",
              "prompt": "Bir blok, başlangıçta bloğuna bağlı olmadan ekranda tek başına duruyor. ▶ düğmesine basınca ne olur?",
              "options": [
                "Blok yine de çalışır, çünkü ekranda görünüyor",
                "Kart hata verip tüm programı siler",
                "Blok çalışmaz; başlık bloğuna bağlı olmayan blok soluk görünür",
                "Blok başlangıçta bloğunun içine kendiliğinden gider"
              ],
              "answer": 2,
              "explanation": "Programlar bir başlık bloğunun içinde yaşar. Başlık bloğuna bağlı olmayan yığın çalışmaz ve soluk görünür. Bloğun ekranda durması çalıştığı anlamına gelmez; kart de hata vermez, yalnızca onu görmez.",
              "skills": [
                "mk-flow",
                "mk-card"
              ]
            },
            {
              "id": "m10h1d1-q2",
              "kind": "predict-output",
              "prompt": "Bu programın JavaScript sekmesindeki görünümü aşağıdadır. ▶ ile çalışınca ekranda ne olur?\n\n```\ncard.onStart(() => {\n  screen.showNumber(7);\n  screen.showText(\"Merhaba\");\n});\n```",
              "options": [
                "Önce 7 ortada kısa süre durur, sonra Merhaba kayar",
                "Önce Merhaba kayar, sonra 7 görünür",
                "7 ve Merhaba aynı anda ekranda olur",
                "Hiçbir şey olmaz, sayı yazıdan sonra gelmeliydi"
              ],
              "answer": 0,
              "explanation": "Bloklar yukarıdan aşağıya çalışır; sayı bloğu yazı bloğundan önce geldiği için 7 önce görünür. Tek basamaklı 7 kaymaz, ortada kısa süre durur ve sonra Merhaba kayar. Sıra ters olsa sonuç da ters olurdu.",
              "skills": [
                "mk-flow"
              ]
            },
            {
              "id": "m10h1d1-q3",
              "kind": "numeric",
              "prompt": "Mikro Kart ekranı 5 sütun ve 5 satırdan oluşur. Ekranda toplam kaç LED vardır?",
              "answer": 25,
              "unit": "LED",
              "explanation": "Sütun sayısı çarpı satır sayısı: 5 x 5 = 25. Toplamayı (5 + 5 = 10) karıştırmamak gerekir; her sütunda 5 ışık vardır ve 5 sütun vardır.",
              "skills": [
                "mk-card"
              ]
            },
            {
              "id": "m10h1d1-q4",
              "kind": "find-bug",
              "prompt": "Selin önce \"Merhaba\" yazısının kaymasını, ardından 7 rakamının görünmesini istiyor. Ama ekranda önce 7 çıkıyor. Programı inceleyin:\n\n```\n1  card.onStart(() => {\n2    screen.showNumber(7);\n3    screen.showText(\"Merhaba\");\n4  });\n```\n\nHata nedir?",
              "options": [
                "1. satır: onStart yerine başka başlık bloğu gerekir",
                "4. satır: kapanış eksik",
                "3. satırda Merhaba çok uzun, kısaltılmalı",
                "2. ve 3. satırların sırası ters; yazı bloğu sayı bloğunun üstünde olmalı"
              ],
              "answer": 3,
              "explanation": "Kart blokları yukarıdan aşağıya çalıştırır. Önce yazının görünmesi için yazı bloğu üstte, sayı bloğu altta olmalıdır. Diğer satırlarda hata yoktur: onStart doğru başlık bloğudur ve yazının uzunluğu sıralamayı etkilemez.",
              "skills": [
                "mk-flow",
                "mk-debug"
              ]
            },
            {
              "id": "m10h1d1-q5",
              "kind": "mcq",
              "prompt": "Hangi gösterim ekranda KAYMAZ, ortada kısa süre durur?",
              "options": [
                "Yazı: Merhaba",
                "Sayı: 7",
                "Sayı: 25",
                "Yazı: Ali"
              ],
              "answer": 1,
              "explanation": "Tek bir karakter (harf ya da tek basamaklı sayı) ekrana sığar ve ortada durur. Merhaba ve Ali birden çok karakter olduğu için kayar. 25 iki karakterdir; iki basamaklı sayı da yazı gibi kayar.",
              "skills": [
                "mk-card",
                "mk-timing"
              ]
            }
          ],
          "steps": [
            {
              "kind": "intro",
              "art": "chip",
              "title": "Avucundaki bilgisayar",
              "body": "Avucuna sığan bir bilgisayar düşün. Ekranı yalnızca **küçük ışıklardan** oluşuyor ama yazı yazabiliyor, sayı gösterebiliyor. Peki bu kadar küçük bir ekrana bir yazı nasıl sığar?"
            },
            {
              "kind": "numeric",
              "prompt": "Mikro Kart'ın ekranı **5 sütun** ve **5 satırlık** bir ızgaradır. Ekranda toplam kaç LED vardır?",
              "answer": 25,
              "unit": "LED",
              "why": "Her sütunda 5 LED var ve 5 sütun var: 5 x 5 = 25. Sütun ve satır sayısını toplamak (5 + 5 = 10) yanlış olur.",
              "hint": "Bir sütunda kaç ışık var, kaç tane sütun var?",
              "skills": [
                "mk-card"
              ]
            },
            {
              "kind": "explain",
              "art": "chip",
              "body": "Mikro Kart'ta 25 LED'lik ekranın yanında **A** ve **B** düğmeleri ve dokununca programa haber veren bir **logo** (yıldız) var. Altındaki **P0, P1, P2** bağlantı noktalarını ilerleyen haftalarda kullanacaksın. Bu kart **sanaldır**: bilgisayarın içinde çalışır, kablo ya da pil gerekmez."
            },
            {
              "kind": "choice",
              "prompt": "Hangisi Mikro Kart'ın bir parçası **değildir**?",
              "options": [
                "LED ekranı",
                "A ve B düğmeleri",
                "Klavye",
                "Logo"
              ],
              "answer": 2,
              "why": "Mikro Kart'ın klavyesi yoktur. Ona LED ekranı, A ve B düğmeleri ve logo ile bilgi verir, bilgi alırsın.",
              "hint": "Az önce sayılan parçaları hatırla. Hangisi orada geçmedi?",
              "skills": [
                "mk-card"
              ]
            },
            {
              "kind": "explain",
              "art": "code",
              "body": "Programı renkli **blokları** birbirine takarak kurarsın. **başlangıçta** bir **başlık bloğudur**: ▶ **Çalıştır**'a basınca içindeki bloklar **bir kez** çalışır. Başlık bloğuna bağlı olmayan blok soluk görünür ve hiç çalışmaz."
            },
            {
              "kind": "choice",
              "prompt": "**yazıyı göster** bloğunu **başlangıçta** bloğunun içine değil, yanındaki boşluğa bıraktın. ▶ düğmesine basınca ne olur?",
              "options": [
                "Yazı yine de kayar",
                "Kart hata mesajı verir",
                "Blok kendiliğinden başlangıçta'nın içine girer",
                "Hiçbir şey olmaz; blok soluk görünür ve çalışmaz"
              ],
              "answer": 3,
              "why": "Kart yalnızca bir başlık bloğuna bağlı blokları çalıştırır. Bağlı olmayan blok soluk görünür; kart hata vermez, onu yalnızca görmez.",
              "hint": "Programın nereden başladığını hangi blok belirliyordu?",
              "skills": [
                "mk-flow"
              ]
            },
            {
              "kind": "explain",
              "art": "led",
              "body": "Bloklar **yukarıdan aşağıya**, sırayla çalışır ve bir blok bitmeden sonraki başlamaz. Ekran 5 sütun genişliğinde olduğu için uzun yazı sağdan sola **kayar**. Tek bir harf ya da tek basamaklı sayı ise kaymaz, ortada kısa süre durur."
            },
            {
              "kind": "choice",
              "prompt": "Hangisi ekranda **kaymaz**, ortada kısa süre durur?",
              "options": [
                "Sayı: 25",
                "Harf: A",
                "Yazı: Ali",
                "Sayı: 10"
              ],
              "answer": 1,
              "why": "Tek bir harf ekrana sığar ve ortada durur. 25 ve 10 iki basamaklı sayılardır; iki karakter oldukları için yazı gibi kayarlar. Ali de üç harfli bir yazıdır.",
              "hint": "Her seçenekte kaç karakter var? Say.",
              "skills": [
                "mk-card"
              ]
            },
            {
              "kind": "order",
              "prompt": "Kart açılınca önce **Merhaba** kaysın, sonra **7** görünsün. Blokları yukarıdan aşağıya sırala.",
              "lines": [
                "başlangıçta",
                "yazıyı göster \"Merhaba\"",
                "sayıyı göster 7"
              ],
              "why": "En üstte başlık bloğu olur; diğer bloklar onun içine takılır. Bloklar yukarıdan aşağıya çalıştığı için önce görünmesi gereken yazı bloğu, sayı bloğunun üstünde durur.",
              "hint": "Program hangi bloğun içinde yaşıyordu? Sonra ekranda ilk ne görünmeli?",
              "skills": [
                "mk-flow"
              ]
            },
            {
              "kind": "choice",
              "prompt": "Program önce **Merhaba** yazısını kaydırıyor, altında **sayıyı göster 7** var. Sayı ne zaman görünür?",
              "options": [
                "Yazıyla aynı anda",
                "Yazı kayıp bittikten sonra",
                "Hiç görünmez, yazı ekranı kapatır"
              ],
              "answer": 1,
              "why": "Kayan yazı bitmeden bir sonraki blok başlamaz; kart yazının bitmesini bekler. Merhaba yaklaşık 4 saniyede kayar, sonra 7 görünür.",
              "hint": "Bir blok bitmeden sonraki başlar mı?",
              "skills": [
                "mk-flow",
                "mk-timing"
              ]
            },
            {
              "kind": "choice",
              "prompt": "**JavaScript** sekmesinde şu satırı görüyorsun. Yazıyı **Selam** yapmak istiyorsun. Ne yaparsın?",
              "code": "screen.showText(\"Merhaba\");",
              "options": [
                "Satırı JavaScript sekmesinde değiştiririm",
                "Bloktaki yazıyı değiştiririm; sekme yalnızca okunur",
                "Python sekmesine geçip orada değiştiririm"
              ],
              "answer": 1,
              "why": "JavaScript ve Python sekmeleri blokların yazılı kod hâlini yalnızca gösterir; orada yazı değiştiremezsin. Bloktaki yazıyı değiştirirsen sekmelerdeki kod da değişir.",
              "hint": "Sekmelerde yazı değiştirebiliyor muydun?"
            },
            {
              "kind": "activity",
              "prompt": "Şimdi kartın ilk programını yaz: **başlangıçta** bloğunun içine **yazıyı göster** koy, altına **sayıyı göster** tak ve ▶ **Çalıştır**'a bas. Hedeflerin hepsi ✓ olunca **Kontrol et**'e bas."
            },
            {
              "kind": "reflect",
              "prompt": "Kartın ekranı yalnızca 5 sütun genişliğinde. Uzun bir yazıyı küçük ekranda göstermenin kayma dışında başka yolları olur mu? Sence neden tek bir harfi kaydırmak yerine ortada tutuyoruz?"
            }
          ],
          "stepsEn": [
            {
              "kind": "intro",
              "art": "chip",
              "title": "A computer in your hand",
              "body": "Imagine a computer that fits in your hand. Its screen is made only of **tiny lights**, but it can still write words and show numbers. So how does a word fit on such a small screen?"
            },
            {
              "kind": "numeric",
              "prompt": "The Mikro Kart's screen is a grid of **5 columns** and **5 rows**. How many LEDs are on the screen in total?",
              "answer": 25,
              "unit": "LEDs",
              "why": "Each column has 5 LEDs and there are 5 columns: 5 x 5 = 25. Adding the columns and rows together (5 + 5 = 10) would be wrong.",
              "hint": "How many lights are in one column, and how many columns are there?",
              "skills": [
                "mk-card"
              ]
            },
            {
              "kind": "explain",
              "art": "chip",
              "body": "Besides the 25-LED screen, the Mikro Kart has buttons **A** and **B** and a **logo** (a star) that tells the program when you touch it. You'll use the **P0, P1, P2** connection points at the bottom in later weeks. This board is **virtual**: it runs inside the computer, so you don't need any wires or batteries."
            },
            {
              "kind": "choice",
              "prompt": "Which one is **not** part of the Mikro Kart?",
              "options": [
                "LED screen",
                "A and B buttons",
                "Keyboard",
                "Logo"
              ],
              "answer": 2,
              "why": "The Mikro Kart has no keyboard. You give it information and get information from it with the LED screen, the A and B buttons, and the logo.",
              "hint": "Remember the parts we just listed. Which one wasn't there?",
              "skills": [
                "mk-card"
              ]
            },
            {
              "kind": "explain",
              "art": "code",
              "body": "You build a program by snapping colourful **blocks** together. **başlangıçta** (on start) is a **header block**: when you press ▶ **Çalıştır** (Run), the blocks inside it run **once**. A block that isn't attached to a header block looks faded and never runs."
            },
            {
              "kind": "choice",
              "prompt": "You dropped the **yazıyı göster** (show text) block in the empty space next to **başlangıçta**, not inside it. What happens when you press ▶?",
              "options": [
                "The text still scrolls",
                "The board shows an error message",
                "The block jumps inside başlangıçta by itself",
                "Nothing happens; the block looks faded and doesn't run"
              ],
              "answer": 3,
              "why": "The board only runs blocks attached to a header block. A block that isn't attached looks faded; the board doesn't show an error, it just doesn't see it.",
              "hint": "Which block decided where the program starts?",
              "skills": [
                "mk-flow"
              ]
            },
            {
              "kind": "explain",
              "art": "led",
              "body": "Blocks run **from top to bottom**, in order, and the next block doesn't start until the one before it finishes. The screen is only 5 columns wide, so long text **scrolls** from right to left. A single letter or a one-digit number doesn't scroll; it stays in the middle for a moment."
            },
            {
              "kind": "choice",
              "prompt": "Which one does **not** scroll and stays in the middle for a moment?",
              "options": [
                "Number: 25",
                "Letter: A",
                "Text: Ali",
                "Number: 10"
              ],
              "answer": 1,
              "why": "A single letter fits on the screen and stays in the middle. 25 and 10 are two-digit numbers; because they have two characters, they scroll like text. Ali is a three-letter word too.",
              "hint": "How many characters are in each option? Count them.",
              "skills": [
                "mk-card"
              ]
            },
            {
              "kind": "order",
              "prompt": "When the board starts, **Merhaba** (Hello) should scroll first, then **7** should appear. Put the blocks in order from top to bottom.",
              "lines": [
                "başlangıçta",
                "yazıyı göster \"Merhaba\"",
                "sayıyı göster 7"
              ],
              "why": "The header block goes at the top; the other blocks snap inside it. Blocks run from top to bottom, so the text block that should appear first sits above the number block.",
              "hint": "Which block did the program live inside? Then what should appear on the screen first?",
              "skills": [
                "mk-flow"
              ]
            },
            {
              "kind": "choice",
              "prompt": "The program first scrolls the text **Merhaba**, and below it is **sayıyı göster 7** (show number 7). When does the number appear?",
              "options": [
                "At the same time as the text",
                "After the text has finished scrolling",
                "Never, the text switches the screen off"
              ],
              "answer": 1,
              "why": "The next block doesn't start until the scrolling text has finished; the board waits for the text to end. Merhaba takes about 4 seconds to scroll, then 7 appears.",
              "hint": "Does the next block start before a block has finished?",
              "skills": [
                "mk-flow",
                "mk-timing"
              ]
            },
            {
              "kind": "choice",
              "prompt": "In the **JavaScript** tab you see this line. You want to change the text to **Selam** (Hi). What do you do?",
              "code": "screen.showText(\"Merhaba\");",
              "options": [
                "I change the line in the JavaScript tab",
                "I change the text in the block; the tab is read-only",
                "I switch to the Python tab and change it there"
              ],
              "answer": 1,
              "why": "The JavaScript and Python tabs only show the blocks written out as code; you can't change text there. If you change the text in the block, the code in the tabs changes too.",
              "hint": "Could you type in the tabs?"
            },
            {
              "kind": "activity",
              "prompt": "Now write the board's first program: put **yazıyı göster** (show text) inside the **başlangıçta** (on start) block, snap **sayıyı göster** (show number) below it, and press ▶ **Çalıştır** (Run). When all the goals are ✓, press **Kontrol et** (Check)."
            },
            {
              "kind": "reflect",
              "prompt": "The board's screen is only 5 columns wide. Apart from scrolling, are there other ways to show long text on a small screen? Why do you think we keep a single letter in the middle instead of scrolling it?"
            }
          ]
        },
        {
          "title": "LED'lerin adresi: x ve y",
          "durationMin": 20,
          "problem": "Hazine haritasında \"üç adım sağa, iki adım aşağı\" dendiğinde hazineyi bulursun. Her yerin bir adresi vardır. Kartın ekranındaki 25 ışığın da adresi var. Bu adreslerle istediğin ışığı yakıp söndürebilirsin. Bir çizgi ya da kendi şeklini nasıl çizersin?",
          "contentMd": "### Adres: x ve y\nHer LED'in iki sayılı bir adresi vardır:\n\n- **x:** soldan sağa sütun numarası, 0 ile 4 arası.\n- **y:** yukarıdan aşağıya satır numarası, 0 ile 4 arası.\n\nSayıma **0'dan** başlanır. Yani en soldaki sütun 0, en sağdaki 4'tür.\n\n| Yer | x | y |\n|---|---|---|\n| Sol üst köşe | 0 | 0 |\n| Sağ üst köşe | 4 | 0 |\n| Tam orta | 2 | 2 |\n| Sol alt köşe | 0 | 4 |\n| Sağ alt köşe | 4 | 4 |\n\nAdres yazarken önce x, sonra y yazılır: (x, y).\n\n### Program: çapraz çizgi, sonra dört köşe\nBu derste **Temel** ve **LED** kategorilerini kullanacaksın.\n\n1. **LED** kategorisinden **LED yak x [2] y [2]** bloğunu **başlangıçta** içine sürükle.\n2. x ve y kutularını 0 ve 0 yap. Bu, sol üst köşeyi yakar.\n3. Aynı bloktan dört tane daha ekle. Adresleri sırayla (1, 1), (2, 2), (3, 3), (4, 4) yap.\n4. **Temel** kategorisinden **bekle [500] ms** bloğunu al, sürenin yerine 1000 yaz ve LED bloklarının altına tak.\n5. Altına **Temel** kategorisinden **ekranı temizle** bloğunu ekle.\n6. Ardından dört tane **LED yak** bloğu daha ekle: (0, 0), (4, 0), (0, 4), (4, 4).\n7. ▶ **Çalıştır**.\n\n### Beklenen sonuç\nÖnce sol üstten sağ alta uzanan bir çapraz çizgi yanar. Bir saniye sonra ekran söner ve dört köşe yanar. Hedefler kutusunda üç görev de ✓ olmalı.\n\n### Nasıl çalışıyor?\n- **LED yak** bloğu belirtilen adresteki ışığı yakar. **LED söndür** bloğu aynı adresteki ışığı söndürür.\n- LED blokları **beklemez**. Beş LED bloğunu art arda koyarsan beşi aynı anda yanmış gibi görünür. Bir şeyin ne kadar süre ekranda kalacağını **bekle** bloğuyla sen belirlersin.\n- **bekle** süresi milisaniye (ms) cinsindendir. 1000 ms bir saniyedir.\n- **ekranı temizle** hepsini birden söndürür. Tek tek söndürmekten çok daha kısa.\n- Ekranın dışında kalan bir adres yazarsan (örneğin x = 7) kart hata vermez, o bloğu yok sayar.\n\n### Dene\n1. Ekranın tam ortasındaki ışığı yak: (2, 2). Sonra onu **LED söndür** ile söndür.\n2. Dış çerçeveyi (kenardaki 16 ışığı) yakmayı dene. Hangi adresleri yazman gerekiyor?\n3. Çapraz çizgiyi öbür yönden çiz: sağ üstten sol alta. (4, 0), (3, 1), (2, 2), (1, 3), (0, 4) adreslerini kullan.\n\n### Sık yapılan hatalar\n- **x ile y'yi karıştırmak.** x yatay, y dikeydir. (4, 0) sağ üst köşedir, sol alt değil.\n- **1'den saymak.** Sayım 0'dan başlar. En sağ sütun 5 değil 4'tür.\n- **Hepsini yakıp bir şey göremediğini düşünmek.** Bekle bloğu koymazsan ilk çizim anında silinir. Aralara **bekle** koy.",
          "question": "Bir ışığı yakmak için neden iki sayıya ihtiyacımız var? Sence 25 ışığın her birine 1'den 25'e kadar tek bir numara verseydik daha kolay mı olurdu?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Her LED'in (x, y) adresinin olduğunu ve x'in sütunu, y'nin satırı gösterdiğini\n- Sayımın 0'dan başladığını, bu yüzden en büyük adresin 4 olduğunu\n- Tek bir LED'i yakmayı, söndürmeyi ve ekranı temizlemeyi\n- LED bloklarının beklemediğini, görünür süreyi **bekle** bloğunun belirlediğini\n\n### Önceden bilmen gerekenler\nDers 1: Mikro Kart'ın 5 x 5'lik LED ekranı, başlangıçta bloğu ve blokların sırayla çalıştığı.\n\n### Bir ızgarada adres\nSatranç tahtasında \"e4\" dendiğinde karenin yeri bellidir. Kartın ekranı da bir ızgaradır ve her ışığın iki sayıdan oluşan bir adresi vardır, yazılışı **(x, y)** biçimindedir:\n\n- **x**, soldan sağa **sütun** numarasıdır.\n- **y**, yukarıdan aşağıya **satır** numarasıdır.\n\nÖnce x, sonra y yazılır. Aşağıdaki şemada ekranın dört köşesi ve ortası gösterilmiştir:\n\n```\n        x=0  x=1  x=2  x=3  x=4\ny=0     (0,0)                 (4,0)\ny=1\ny=2               (2,2)\ny=3\ny=4     (0,4)                 (4,4)\n```\n\n### Neden 0'dan başlıyoruz?\nBilgisayarlar sayımı çoğunlukla **0'dan** başlatır. Bir sıradaki ilk öğe \"sıfırıncı\"dır. Beş sütun varsa numaraları 0, 1, 2, 3, 4 olur; yani en büyük adres 5 değil **4**'tür. Bu, yeni başlayanların en sık takıldığı yerdir. Kendine şunu hatırlat: \"Beş tane var, ama son numara dört.\"\n\n### Yakmak, söndürmek, temizlemek\n**LED yak** bloğu verilen adresteki ışığı yakar, **LED söndür** bloğu aynı adresi söndürür. **ekranı temizle** ise 25 ışığın hepsini birden söndürür. Tek tek söndürmekten çok daha kısadır.\n\nEkranın dışında kalan bir adres, örneğin (7, 2), hata mesajı üretmez. Kart bu bloğu sessizce yok sayar. Bu sakin davranış bir tuzaktır: kodunda yanlış sayı olsa da kırmızı uyarı görmezsin, yalnızca ışık yanmaz. Işık yanmıyorsa önce adreslere bak.\n\n### LED blokları beklemez\nBeş **LED yak** bloğunu art arda koyarsan beşi neredeyse aynı anda yanar. Bir çizimin ne kadar süre görüneceğini **bekle** bloğu belirler; süresi **milisaniye** (ms) cinsindendir. 1000 ms bir saniyedir. Çizimden hemen sonra **ekranı temizle** koyarsan, çizim gözün göremeyeceği kadar kısa görünür.\n\nKüçük bir hesap: dış çerçeve, 5 x 5 ekrandan içteki 3 x 3'lük bölümü çıkarınca kalan ışıklardır. 25 - 9 = 16 LED eder.\n\n### Özet\nHer LED'in (x, y) adresi vardır: x sütun, y satırdır ve ikisi de 0'dan 4'e kadar gider. LED yak, LED söndür ve ekranı temizle blokları ışıkları kontrol eder. Ekran dışı adresler sessizce yok sayılır. LED blokları beklemez; görünme süresini bekle bloğu belirler.",
          "concepts": [
            {
              "term": "x ve y",
              "definition": "Bir LED'in adresi: x soldan sağa sütun, y yukarıdan aşağıya satır numarasıdır; (x, y) diye yazılır.",
              "example": "Sağ üst köşe (4, 0), sol alt köşe (0, 4) adresindedir.",
              "pitfall": "x ile y'yi karıştırmak: (4, 0) sağ üst köşedir, sol alt değil."
            },
            {
              "term": "0'dan sayım",
              "definition": "Sayma 1'den değil 0'dan başlar; bu yüzden 5 sütunun numaraları 0, 1, 2, 3, 4'tür.",
              "example": "Tam ortadaki LED (2, 2) adresindedir.",
              "pitfall": "En sağ sütuna 5 demek; en büyük adres 4'tür."
            },
            {
              "term": "LED yak / LED söndür",
              "definition": "Verilen adresteki tek ışığı yakar ya da söndürür.",
              "example": "LED yak x 0 y 0 sol üst köşeyi yakar.",
              "pitfall": "Aynı adresi hem yakıp hem söndürüp gözle ayırt edilebilir bir sonuç beklemek; arada bekleme gerekir."
            },
            {
              "term": "Ekranı temizle",
              "definition": "Bütün LED'leri tek blokla birden söndürür.",
              "example": "Çapraz çizgiden sonra ekranı temizle koyunca köşeleri boş bir ekrana çizebilirsin.",
              "pitfall": "Temizlemeyi unutmak: önceki çizimin ışıkları yanık kalır ve yeni çizimle karışır."
            },
            {
              "term": "bekle (ms)",
              "definition": "Programı verilen milisaniye kadar durdurur; 1000 ms bir saniyedir. LED blokları kendiliğinden beklemez.",
              "example": "bekle 1000 ms koyarsan çizim bir saniye görünür.",
              "pitfall": "bekle koymadan çizip hemen temizlemek: çizim gözle görülmeyecek kadar kısa kalır."
            }
          ],
          "quiz": [
            {
              "id": "m10h1d2-q1",
              "kind": "mcq",
              "prompt": "(4, 0) adresi ekranın hangi yerindedir?",
              "options": [
                "Sol üst köşe",
                "Sol alt köşe",
                "Sağ alt köşe",
                "Sağ üst köşe"
              ],
              "answer": 3,
              "explanation": "x = 4 en sağ sütundur, y = 0 en üst satırdır; bu sağ üst köşedir. Önce x (yatay), sonra y (dikey) yazılır. Sol alt köşe (0, 4), sağ alt köşe (4, 4) olurdu.",
              "skills": [
                "mk-coords"
              ]
            },
            {
              "id": "m10h1d2-q2",
              "kind": "numeric",
              "prompt": "Ekranın en dıştaki sıralarında (üst ve alt satır, sol ve sağ sütun) yer alan çerçevede kaç LED vardır? İpucu: içte kalan 3 x 3 bölgeyi çıkar.",
              "answer": 16,
              "unit": "LED",
              "explanation": "Ekran 5 x 5 = 25 LED taşır. Çerçevenin içinde kalan bölge 3 x 3 = 9 LED'dir. Çerçeve 25 - 9 = 16 LED eder. Kenar sayısını 4 x 5 = 20 diye toplamak yanlıştır; köşeler iki kez sayılmış olur.",
              "skills": [
                "mk-coords"
              ]
            },
            {
              "id": "m10h1d2-q3",
              "kind": "predict-output",
              "prompt": "Program bittikten sonra ekranda hangi LED'ler yanık kalır?\n\n```\ncard.onStart(() => {\n  screen.plot(1, 3);\n  screen.plot(3, 1);\n  wait(500);\n  screen.clear();\n  screen.plot(2, 4);\n});\n```",
              "options": [
                "Alt satırın ortasındaki tek LED",
                "Üst satırın ortasındaki tek LED",
                "(1, 3), (3, 1) ve (2, 4) olmak üzere üç LED",
                "Hiçbiri; ekran boştur"
              ],
              "answer": 0,
              "explanation": "Önce (1, 3) ve (3, 1) yanar, yarım saniye sonra ekranı temizle hepsini söndürür. Son olarak (2, 4) yanar: x = 2 ortadaki sütun, y = 4 en alt satırdır. Yani alt satırın ortası yanık kalır. İlk iki LED temizlendiği için artık yanmaz.",
              "skills": [
                "mk-coords",
                "mk-flow"
              ]
            },
            {
              "id": "m10h1d2-q4",
              "kind": "find-bug",
              "prompt": "Deniz dört köşeyi yakmak istiyor ama sağ üst köşe yanmıyor. Hiçbir hata mesajı da yok.\n\n```\n1  screen.plot(0, 0);\n2  screen.plot(5, 0);\n3  screen.plot(0, 4);\n4  screen.plot(4, 4);\n```\n\nHata hangi satırdadır ve neden?",
              "options": [
                "1. satır: sol üst köşe 1, 1 olmalıdır",
                "3. satır: y en çok 3 olabilir",
                "2. satır: x en çok 4 olabilir; 5 ekranın dışındadır ve sessizce yok sayılır",
                "4. satır: LED yak yerine LED söndür gerekir"
              ],
              "answer": 2,
              "explanation": "Sütun numaraları 0'dan 4'e gider; x = 5 ekranın dışında kalır. Kart ekran dışı adresi hata vermeden yok sayar, bu yüzden uyarı görmezsin. Sağ üst köşe (4, 0) olmalıydı. Öbür satırlardaki adresler köşelerin doğru adresleridir.",
              "skills": [
                "mk-coords",
                "mk-debug"
              ]
            },
            {
              "id": "m10h1d2-q5",
              "kind": "mcq",
              "prompt": "Bir öğrenci beş LED yak bloğunun hemen ardından ekranı temizle bloğunu koyuyor, arada bekle yok. Ekranda ne görür?",
              "options": [
                "Beş LED bir saniye yanar",
                "Çizimi göremez; LED blokları beklemediği için her şey hemen silinir",
                "Beş LED sırayla yanar",
                "Kart hata verir"
              ],
              "answer": 1,
              "explanation": "LED blokları beklemez; çizim ve temizleme neredeyse aynı anda olur ve çizim gözle görülmez. Çizimin görünmesi için aralarına bekle bloğu koymak gerekir. Işıkların sırayla yanması da ancak bloklar arasına bekle konursa olur. Kart hata vermez, çünkü program geçerlidir.",
              "skills": [
                "mk-timing",
                "mk-flow"
              ]
            }
          ],
          "steps": [
            {
              "kind": "intro",
              "art": "search",
              "title": "Işıkların adresi",
              "body": "Hazine haritasında \"üç adım sağa, iki adım aşağı\" dendiğinde hazineyi bulursun. Kartın ekranındaki 25 ışığın da birer adresi var. Adresi bilirsen istediğin ışığı yakabilirsin."
            },
            {
              "kind": "choice",
              "prompt": "Bir sırada 5 sandalye var. Numaralar **0'dan** başlıyor. Son sandalyenin numarası kaçtır?",
              "options": [
                "5",
                "4",
                "6"
              ],
              "answer": 1,
              "why": "Numaralar 0, 1, 2, 3, 4 diye gider. Beş sandalye var ama son numara 4'tür; çünkü saymaya 1'den değil 0'dan başladık.",
              "hint": "Numaraları 0'dan başlayarak tek tek yaz.",
              "skills": [
                "mk-coords"
              ]
            },
            {
              "kind": "explain",
              "art": "led",
              "body": "Her LED'in adresi **(x, y)** biçiminde yazılır: önce x, sonra y. **x** soldan sağa **sütun**, **y** yukarıdan aşağıya **satır** numarasıdır. İkisi de **0'dan** başlar ve en çok **4** olur; sol üst köşe (0, 0), tam orta (2, 2)'dir."
            },
            {
              "kind": "numeric",
              "prompt": "Sağ üst köşedeki LED'in **x** değeri kaçtır?",
              "answer": 4,
              "why": "x sütun numarasıdır ve en sağdaki sütun 4'tür. Beş sütun var ama sayım 0'dan başladığı için en büyük numara 5 değil 4'tür. Bu LED'in adresi (4, 0)'dır.",
              "hint": "x hangi yönde artıyordu? Sütunları 0'dan başlayarak say.",
              "skills": [
                "mk-coords"
              ]
            },
            {
              "kind": "choice",
              "prompt": "**(0, 4)** adresindeki LED ekranın neresindedir?",
              "options": [
                "Sağ üst köşe",
                "Sol alt köşe",
                "Sol üst köşe",
                "Sağ alt köşe"
              ],
              "answer": 1,
              "why": "x = 0 en soldaki sütun, y = 4 en alttaki satırdır; yani sol alt köşe. x ile y'yi karıştırırsan sağ üst köşe sanabilirsin; sağ üst köşe (4, 0)'dır.",
              "hint": "Önce x'e bak: hangi sütun? Sonra y'ye bak: hangi satır?",
              "skills": [
                "mk-coords"
              ]
            },
            {
              "kind": "choice",
              "prompt": "**Alt satırın tam ortasındaki** LED'in adresi hangisidir?",
              "options": [
                "(4, 2)",
                "(2, 4)",
                "(2, 5)",
                "(3, 5)"
              ],
              "answer": 1,
              "why": "Ortadaki sütun x = 2, en alt satır y = 4'tür: (2, 4). (4, 2) x ile y'yi ters yazar; (2, 5) ve (3, 5) ise 1'den sayılmış adreslerdir ve ekranın dışında kalır.",
              "hint": "Önce sütunu bul, sonra satırı. İkisi de 0'dan sayılıyor.",
              "skills": [
                "mk-coords"
              ]
            },
            {
              "kind": "explain",
              "art": "led",
              "body": "**LED yak x y** bloğu o adresteki ışığı yakar, **LED söndür** aynı adresi söndürür, **ekranı temizle** 25 ışığın hepsini birden söndürür. LED blokları **beklemez**; bir çizimin ne kadar görüneceğini **bekle** bloğu belirler. Bekle süresi milisaniye (ms) cinsindendir."
            },
            {
              "kind": "choice",
              "prompt": "Ayşe **sol alt köşeyi** yakmak istiyor ve şu bloğu yazdı. Hangi LED yanar?",
              "code": "LED yak x 4 y 0",
              "options": [
                "Sol alt köşe",
                "Sağ üst köşe",
                "Sağ alt köşe",
                "Hiçbiri, kart hata verir"
              ],
              "answer": 1,
              "why": "x = 4 en sağ sütun, y = 0 en üst satırdır; bu sağ üst köşedir. Ayşe x ile y'yi ters yazmış. Sol alt köşe için x 0 y 4 yazmalıydı.",
              "hint": "x yatay mıydı, dikey mi?",
              "skills": [
                "mk-coords",
                "mk-debug"
              ]
            },
            {
              "kind": "choice",
              "prompt": "Program şu bloğa gelince ne olur?",
              "code": "LED yak x 7 y 2",
              "options": [
                "Kart kırmızı bir hata mesajı gösterir",
                "En sağdaki (4, 2) LED'i yanar",
                "Hiçbir LED yanmaz; kart bu bloğu sessizce yok sayar",
                "Program orada durur"
              ],
              "answer": 2,
              "why": "x en çok 4 olabilir; 7 ekranın dışındadır. Kart ekran dışı adresi hata vermeden yok sayar ve program devam eder. Bu yüzden bir ışık yanmıyorsa önce adreslere bakmak gerekir.",
              "hint": "x hangi aralıkta olabilir? Kart ekran dışı adreste ne yapıyordu?",
              "skills": [
                "mk-coords",
                "mk-debug"
              ]
            },
            {
              "kind": "numeric",
              "prompt": "Sağ üstten sol alta bir çapraz çiziyorsun: (4, 0), (3, 1), (2, 2), (1, 3) ve bir LED daha. Son LED'in **x** değeri kaçtır?",
              "answer": 0,
              "why": "Her adımda x 1 azalır, y 1 artar. (1, 3)'ten sonra (0, 4) gelir; yani x = 0. Bu LED sol alt köşedir.",
              "hint": "Sıradaki adreslerde x nasıl değişiyor?",
              "skills": [
                "mk-coords"
              ]
            },
            {
              "kind": "numeric",
              "prompt": "Çapraz çizgi ekranda **1 saniye** kalsın, sonra ekran temizlensin. **bekle** bloğuna kaç ms yazarsın?",
              "answer": 1000,
              "unit": "ms",
              "why": "1 saniye 1000 milisaniyedir; bekle bloğuna 1000 yazılır. Bekle koymazsan LED blokları beklemediği için çizim hemen silinir ve gözle görülmez.",
              "hint": "Bir saniyede kaç milisaniye var?",
              "skills": [
                "mk-timing"
              ]
            },
            {
              "kind": "activity",
              "prompt": "Şimdi çiz! **LED yak** bloklarıyla sol üstten sağ alta çapraz bir çizgi yak, **1000 ms bekle**, **ekranı temizle** ve dört köşeyi yak. Hedeflerin hepsi ✓ olunca **Kontrol et**'e bas."
            },
            {
              "kind": "reflect",
              "prompt": "Bir ışığı yakmak için neden iki sayıya ihtiyacımız var? Sence 25 ışığın her birine 1'den 25'e kadar tek bir numara verseydik daha kolay mı olurdu?"
            }
          ],
          "stepsEn": [
            {
              "kind": "intro",
              "art": "search",
              "title": "Addresses for lights",
              "body": "On a treasure map, when it says \"three steps right, two steps down\", you find the treasure. Each of the 25 lights on the board's screen has an address too. If you know the address, you can light up any light you want."
            },
            {
              "kind": "choice",
              "prompt": "There are 5 chairs in a row. The numbers start at **0**. What is the number of the last chair?",
              "options": [
                "5",
                "4",
                "6"
              ],
              "answer": 1,
              "why": "The numbers go 0, 1, 2, 3, 4. There are five chairs, but the last number is 4, because we started counting at 0 instead of 1.",
              "hint": "Write the numbers one by one, starting at 0.",
              "skills": [
                "mk-coords"
              ]
            },
            {
              "kind": "explain",
              "art": "led",
              "body": "Each LED's address is written as **(x, y)**: x first, then y. **x** is the **column** number from left to right, and **y** is the **row** number from top to bottom. Both start at **0** and go up to **4**; the top-left corner is (0, 0) and the very middle is (2, 2)."
            },
            {
              "kind": "numeric",
              "prompt": "What is the **x** value of the LED in the top-right corner?",
              "answer": 4,
              "why": "x is the column number, and the rightmost column is 4. There are five columns, but since counting starts at 0, the biggest number is 4, not 5. This LED's address is (4, 0).",
              "hint": "Which way did x grow? Count the columns starting from 0.",
              "skills": [
                "mk-coords"
              ]
            },
            {
              "kind": "choice",
              "prompt": "Where on the screen is the LED at address **(0, 4)**?",
              "options": [
                "Top-right corner",
                "Bottom-left corner",
                "Top-left corner",
                "Bottom-right corner"
              ],
              "answer": 1,
              "why": "x = 0 is the leftmost column and y = 4 is the bottom row, so it's the bottom-left corner. If you mix up x and y, you might think it's the top-right corner; the top-right corner is (4, 0).",
              "hint": "Look at x first: which column? Then look at y: which row?",
              "skills": [
                "mk-coords"
              ]
            },
            {
              "kind": "choice",
              "prompt": "What is the address of the LED in **the very middle of the bottom row**?",
              "options": [
                "(4, 2)",
                "(2, 4)",
                "(2, 5)",
                "(3, 5)"
              ],
              "answer": 1,
              "why": "The middle column is x = 2 and the bottom row is y = 4: (2, 4). (4, 2) has x and y swapped; (2, 5) and (3, 5) are addresses counted from 1 and fall off the screen.",
              "hint": "Find the column first, then the row. Both are counted from 0.",
              "skills": [
                "mk-coords"
              ]
            },
            {
              "kind": "explain",
              "art": "led",
              "body": "The **LED yak x y** (LED on) block lights the light at that address, **LED söndür** (LED off) turns the same address off, and **ekranı temizle** (clear screen) turns all 25 lights off at once. LED blocks **don't wait**; the **bekle** (wait) block decides how long a drawing stays visible. The wait time is in milliseconds (ms)."
            },
            {
              "kind": "choice",
              "prompt": "Ayşe wants to light the **bottom-left corner** and wrote this block. Which LED lights up?",
              "code": "LED yak x 4 y 0",
              "options": [
                "Bottom-left corner",
                "Top-right corner",
                "Bottom-right corner",
                "None, the board shows an error"
              ],
              "answer": 1,
              "why": "x = 4 is the rightmost column and y = 0 is the top row; that's the top-right corner. Ayşe swapped x and y. For the bottom-left corner she should have written x 0 y 4.",
              "hint": "Was x across or up and down?",
              "skills": [
                "mk-coords",
                "mk-debug"
              ]
            },
            {
              "kind": "choice",
              "prompt": "What happens when the program reaches this block?",
              "code": "LED yak x 7 y 2",
              "options": [
                "The board shows a red error message",
                "The rightmost LED at (4, 2) lights up",
                "No LED lights up; the board quietly ignores this block",
                "The program stops there"
              ],
              "answer": 2,
              "why": "x can be at most 4; 7 is off the screen. The board ignores an off-screen address without an error, and the program carries on. That's why, if a light won't turn on, the first thing to check is the addresses.",
              "hint": "What range can x be in? What did the board do with an off-screen address?",
              "skills": [
                "mk-coords",
                "mk-debug"
              ]
            },
            {
              "kind": "numeric",
              "prompt": "You're drawing a diagonal from the top right to the bottom left: (4, 0), (3, 1), (2, 2), (1, 3) and one more LED. What is the **x** value of the last LED?",
              "answer": 0,
              "why": "At each step x goes down by 1 and y goes up by 1. After (1, 3) comes (0, 4), so x = 0. This LED is the bottom-left corner.",
              "hint": "How does x change from one address to the next?",
              "skills": [
                "mk-coords"
              ]
            },
            {
              "kind": "numeric",
              "prompt": "The diagonal line should stay on the screen for **1 second**, then the screen should be cleared. How many ms do you put in the **bekle** (wait) block?",
              "answer": 1000,
              "unit": "ms",
              "why": "1 second is 1000 milliseconds, so you put 1000 in the wait block. If you leave out the wait, the LED blocks don't wait, so the drawing is erased right away and you can't see it.",
              "hint": "How many milliseconds are in one second?",
              "skills": [
                "mk-timing"
              ]
            },
            {
              "kind": "activity",
              "prompt": "Now draw! Use **LED yak** (LED on) blocks to light a diagonal line from the top left to the bottom right, **wait 1000 ms**, **clear the screen**, and light the four corners. When all the goals are ✓, press **Kontrol et** (Check)."
            },
            {
              "kind": "reflect",
              "prompt": "Why do we need two numbers to light one light? Do you think it would be easier if we gave each of the 25 lights a single number from 1 to 25?"
            }
          ]
        },
        {
          "title": "Simgeler ve kendi desenin",
          "durationMin": 20,
          "problem": "Mesajlaşırken bir yüz çizip gülümsetmek, kelime yazmaktan çok daha hızlı. Kartın ekranı da küçük bir tuval: yüzler, oklar, kalpler çizebilir. Hazır çizimleri kullanmak kolay. Peki hiç olmayan bir şeyi, mesela bir robotu çizmek için ne yapmalı?",
          "contentMd": "### Hazır simgeler\n**Temel** kategorisindeki **simgeyi göster [kalp]** bloğunun içinde hazır küçük çizimler bulunur. Kutuya tıklayınca liste açılır: kalp, küçük kalp, mutlu yüz, üzgün yüz, şaşkın yüz, uyuyan yüz, evet, hayır, oklar, kare, elmas, üçgen, ev, hedef, hayalet, kuru kafa, kelebek, kedi, nota, güneş.\n\nSimge, ekrana anında çizilir ve sen silene ya da başka bir şey gösterene kadar orada kalır.\n\n### Kendi desenin: LED'leri göster\n**Temel** kategorisindeki **LED'leri göster** bloğunun içinde 5x5 küçük kutular vardır. Bir kutuya tıklayınca o LED yanar, tekrar tıklayınca söner. Ne çizersen kart onu ekranda gösterir.\n\nBu derste bir **robot başı** çizeceksin. Kutuları şöyle işaretle (1 yanık, 0 sönük):\n\n| Satır | Desen |\n|---|---|\n| 1. satır | 0 0 1 0 0 |\n| 2. satır | 0 1 1 1 0 |\n| 3. satır | 1 0 1 0 1 |\n| 4. satır | 1 1 1 1 1 |\n| 5. satır | 1 0 1 0 1 |\n\n### Program: üç yüz\n1. **başlangıçta** bloğunun içine **simgeyi göster** bloğunu koy ve listeden **mutlu yüz** seç.\n2. Altına **bekle [1000] ms** bloğunu tak.\n3. Altına ikinci bir **simgeyi göster** bloğu ekle ve **üzgün yüz** seç.\n4. Yine **bekle 1000 ms** ekle.\n5. En alta **LED'leri göster** bloğunu tak. Kutulara tıklayarak robot başını çiz.\n6. ▶ **Çalıştır**.\n\n### Beklenen sonuç\nÖnce mutlu yüz, bir saniye sonra üzgün yüz, bir saniye sonra robot başı görünür. Robot başı ekranda kalır. Dört hedef de ✓ olmalı.\n\n### Nasıl çalışıyor?\n- İkisi de ekrana anında çizer ama farklı çalışır: **simgeyi göster** hazır bir çizimi seçer, **LED'leri göster** senin çizdiğini kullanır.\n- Ekrandaki 25 LED aslında 25 küçük \"aç/kapat\" anahtarıdır. Desen bu 25 anahtarın o anki durumudur.\n- Blok bir şey çizince önceki çizimi tamamen siler. Üst üste binmez.\n\n### Dene\n1. **LED'leri göster** bloğunda kendi yüzünü çiz: gözler, ağız, burun. Bir arkadaşının çizimiyle karşılaştır.\n2. İlk **LED'leri göster** bloğunun altına ikinci bir tane ekle ve desenin biraz değişmiş halini çiz (robotun gözlerini kapatmak gibi). Aralarına **bekle 500 ms** koy: bir animasyon oldu!\n3. Hazır simgelerden ikisini seç, bekleme süresini değiştir. Çok kısa bekleme (100 ms) nasıl görünüyor?\n\n### Sık yapılan hatalar\n- **Bekle koymamak.** İki simgeyi art arda koyup bekleme koymazsan yalnızca sonuncusunu görürsün. Birincisi çok kısa göründüğü için fark etmezsin.\n- **Kutuları ters işaretlemek.** Satırlar yukarıdan aşağıya, sütunlar soldan sağadır. Çizimine bir kenardan bak ve doğru olduğundan emin ol.\n- **LED'leri göster ile yazı yazmaya çalışmak.** Bu blok yalnızca senin çizdiğin deseni gösterir; yazı için **yazıyı göster** bloğunu kullan.",
          "question": "Hazır simgeleri kullanmak mı, kendi desenini çizmek mi daha eğlenceli? 25 ışıkla anlatabileceğin bir duygu ya da nesne düşün: onu çizmek için kaç ışığa ihtiyaç duyarsın?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Hazır **simge** bloğuyla ekrana tek adımda çizim yapmayı\n- **LED'leri göster** bloğuyla 25 anahtarlı kendi desenini çizmeyi\n- Bir desenin satır satır \"1 yanık, 0 sönük\" olarak okunabileceğini\n- Yeni bir çizimin öncekini silmesini ve iki çizim arasına bekleme gerektiğini\n\n### Önceden bilmen gerekenler\nDers 1: Blok editörü ve blokların sırayla çalışması. Ders 2: LED adresleri (x, y), 0'dan sayım ve **bekle** bloğunun milisaniye cinsinden süresi.\n\n### Tek tek yakmak yorucu\nDers 2'de bir şekli LED yak bloklarıyla tek tek çizdin. Bir yüz için on blok gerekebilir. Bu yüzden iki kısayol vardır: hazır simgeler ve kendi desenin.\n\n### Hazır simgeler\n**simgeyi göster** bloğunun listesinde kalp, yüz, ok, kare, nota gibi hazır çizimler bulunur. Birini seçince çizim ekrana anında gelir. Simge, sen onu silene ya da başka bir şey gösterene kadar ekranda **kalır**; bir bloğun işi bitti diye kendiliğinden kaybolmaz.\n\n### Desen: 25 anahtar\nEkrandaki 25 LED aslında 25 küçük anahtardır; her biri ya yanıktır ya sönük. Bir **desen**, bu anahtarların o anki durumudur. **LED'leri göster** bloğunda 5 x 5'lik kutular vardır ve her kutu bir anahtardır. Deseni kâğıtta şöyle yazabilirsin; 1 yanık, 0 sönük demektir:\n\n```\nsatır 0:  0 0 1 0 0\nsatır 1:  0 1 1 1 0\nsatır 2:  1 0 1 0 1\nsatır 3:  1 1 1 1 1\nsatır 4:  1 0 1 0 1\n```\n\nBu bir robot başıdır. Her satırı soldan sağa okursun; hangi sütunların yandığı o satırdaki 1'lerin yeridir. Örneğin satır 2'de 1'ler sütun 0, 2 ve 4'tedir. Yanan toplam LED sayısı 1 + 3 + 3 + 5 + 3 = 15'tir. Çizimini böyle sayarak kontrol edebilirsin.\n\n### Sonraki çizim öncekini siler\n**simgeyi göster** ve **LED'leri göster** blokları ekranın tamamını yeniden çizer; önceki çizim tamamen gider. Üst üste binmezler. Bu yüzden iki çizim art arda, arada bekleme olmadan konursa yalnızca sonuncusu görülür: ilki çok kısa süre kaldığı için fark edilmez.\n\nİki çizimi aralarına **bekle** koyarak sıralarsan basit bir **animasyon** elde edersin. Sinema filmi de, her biri bir öncekinden azıcık farklı çok sayıda çizimin hızlı gösterilmesidir. Beklemeyi kısaltırsan animasyon hızlanır, uzatırsan yavaşlar.\n\n### Dikkat: yazı için başka blok\n**LED'leri göster** harf yazmaz; yalnızca senin çizdiğin deseni gösterir. Yazı için **yazıyı göster** bloğunu kullan.\n\n### Özet\nSimgeyi göster hazır çizimleri, LED'leri göster ise kendi çizdiğin 25 anahtarlık deseni ekrana getirir. Desen satır satır 1 ve 0'larla yazılabilir. Yeni çizim öncekini siler, bu yüzden aralarına bekle koyarak animasyon yaparsın.",
          "concepts": [
            {
              "term": "Simge",
              "definition": "simgeyi göster bloğuyla seçilen hazır 5x5 çizim (kalp, yüz, ok, nota gibi).",
              "example": "mutlu yüz simgesi iki göz ve bir gülümseme çizer.",
              "pitfall": "Simgenin kendiliğinden kaybolacağını sanmak; başka bir şey gösterilene kadar ekranda kalır."
            },
            {
              "term": "Desen",
              "definition": "25 LED'in o anki yanık/sönük durumu; LED'leri göster bloğundaki kutularla çizilir.",
              "example": "Robot başı deseninde 15 LED yanıktır.",
              "pitfall": "Kutuları yanlış sırayla işaretlemek; satırlar yukarıdan aşağıya, sütunlar soldan sağadır."
            },
            {
              "term": "1 ve 0 gösterimi",
              "definition": "Desenin her satırını 5 haneli bir sayı gibi yazma yöntemi: 1 yanık, 0 sönük.",
              "example": "10101 satırında 0., 2. ve 4. sütunlar yanıktır.",
              "pitfall": "Sayımı 1'den başlatmak; ilk sütun 0. sütundur."
            },
            {
              "term": "Animasyon",
              "definition": "Birbirinden azıcık farklı çizimlerin, aralarına bekleme koyarak art arda gösterilmesi.",
              "example": "Açık göz deseni, 500 ms bekleme, kapalı göz deseni: robot göz kırpar.",
              "pitfall": "Beklemeyi unutmak: yalnızca son çizim görülür."
            },
            {
              "term": "Çizim siler",
              "definition": "Yeni bir simge ya da desen, ekrandaki önceki çizimin yerine geçer; üst üste binmez.",
              "example": "Mutlu yüzden sonra üzgün yüz gösterilince mutlu yüz ekrandan gider.",
              "pitfall": "İki çizimin birlikte görüneceğini beklemek."
            }
          ],
          "quiz": [
            {
              "id": "m10h1d3-q1",
              "kind": "mcq",
              "prompt": "Ekranda ancak kendi çizdiğin, hazır listede olmayan bir şekli göstermek istiyorsun. Hangi blok uygundur?",
              "options": [
                "LED'leri göster",
                "simgeyi göster",
                "yazıyı göster",
                "sayıyı göster"
              ],
              "answer": 0,
              "explanation": "LED'leri göster bloğunda 25 kutuyu istediğin gibi işaretleyerek kendi desenini çizersin. simgeyi göster yalnızca hazır listedeki çizimleri verir; yazıyı göster ve sayıyı göster ise harf ve rakam gösterir.",
              "skills": [
                "mk-images"
              ]
            },
            {
              "id": "m10h1d3-q2",
              "kind": "predict-output",
              "prompt": "Program bittiğinde ekranda ne görünür?\n\n```\ncard.onStart(() => {\n  screen.showIcon(\"heart\");\n  wait(500);\n  screen.showIcon(\"smallHeart\");\n  wait(500);\n});\n```",
              "options": [
                "Büyük kalp",
                "İki kalp birlikte",
                "Ekran boş",
                "Küçük kalp"
              ],
              "answer": 3,
              "explanation": "Büyük kalp 500 ms görünür, sonra küçük kalp onun yerini alır. Küçük kalpten sonraki bekleme çizimi silmez, yalnızca programı bekletir. Simge, yenisi gelene kadar ekranda kalır; bu yüzden son görünen küçük kalptır.",
              "skills": [
                "mk-images",
                "mk-flow"
              ]
            },
            {
              "id": "m10h1d3-q3",
              "kind": "numeric",
              "prompt": "Bir robot başı şu desenle çiziliyor (1 yanık). Toplam kaç LED yanar?\n\n```\n0 0 1 0 0\n0 1 1 1 0\n1 0 1 0 1\n1 1 1 1 1\n1 0 1 0 1\n```",
              "answer": 15,
              "unit": "LED",
              "explanation": "Satırlardaki 1'ler: 1 + 3 + 3 + 5 + 3 = 15. Sönük kutular (0) sayılmaz. 25 yerine 15 çıkar; 25 ekranın tüm LED sayısıdır, yanık sayısı değil.",
              "skills": [
                "mk-images",
                "mk-coords"
              ]
            },
            {
              "id": "m10h1d3-q4",
              "kind": "find-bug",
              "prompt": "Mert önce mutlu yüzü, bir saniye sonra üzgün yüzü görmek istiyor. Ama yalnızca üzgün yüzü görüyor.\n\n```\n1  screen.showIcon(\"happy\");\n2  screen.showIcon(\"sad\");\n3  wait(1000);\n```\n\nHata nedir?",
              "options": [
                "1. satır: happy simgesi listede yok",
                "1. ile 2. satır arasında wait yok; mutlu yüz hemen silinir",
                "2. satır: sad yerine happy yazılmalı",
                "3. satır: wait süresi çok uzun"
              ],
              "answer": 1,
              "explanation": "simgeyi göster bloğu beklemez ve her yeni çizim öncekini siler. Mutlu yüzün görünmesi için arasına bekle koymak gerekir. happy ve sad simgeleri listede vardır; sondaki wait ise üzgün yüzü uzun tutar ve hata değildir.",
              "skills": [
                "mk-images",
                "mk-timing",
                "mk-debug"
              ]
            },
            {
              "id": "m10h1d3-q5",
              "kind": "mcq",
              "prompt": "LED'leri göster bloğunda üçüncü satır 1 0 1 0 1 biçimindedir. Bu satırda hangi sütunlardaki LED'ler yanar?",
              "options": [
                "1., 3. ve 5. sütun yani x = 1, 3, 5",
                "x = 0, 1 ve 4",
                "x = 0, 2 ve 4",
                "Yalnız x = 2"
              ],
              "answer": 2,
              "explanation": "Satırı soldan sağa okuyup 1 olan yerlerin sütun numaralarına bakarsın. Sayım 0'dan başladığı için 1'ler x = 0, 2 ve 4'tedir. x = 1, 3, 5 yazmak 1'den sayma hatasıdır ve 5 ekranda zaten yoktur.",
              "skills": [
                "mk-images",
                "mk-coords"
              ]
            }
          ]
        },
        {
          "title": "Sıra ve tekrar",
          "durationMin": 20,
          "problem": "Bir tarifi yazarken sırayı karıştırırsan yemek bozulur: önce yumurtayı kır, sonra karıştır. Bilgisayarlarda da sıra her şeydir. Peki aynı işi üç kez yaptırmak istiyorsun. Blokları üç kez mi kopyalayacaksın?",
          "contentMd": "### Sıra\nKart blokları **yukarıdan aşağıya** çalıştırır. Aynı bloklar farklı sırada farklı sonuç verir.\n\nŞu iki yığını karşılaştır:\n\n| Yığın 1 | Yığın 2 |\n|---|---|\n| kare göster | ekranı temizle |\n| bekle 300 ms | bekle 300 ms |\n| ekranı temizle | kare göster |\n| bekle 300 ms | bekle 300 ms |\n\nYığın 1'de önce kare görünür, sonra söner. Yığın 2'de önce ekran boş kalır, sonra kare görünür ve ekranda kalır. Bloklar aynı, sıra farklı.\n\n### Tekrar\nBir kareyi üç kez yanıp söndürmek için 4 bloğu üç kez alt alta koyabilirsin. Ama **Döngü** kategorisindeki **[4] kez tekrarla** bloğu çok daha kısa bir yol sunar. İçine koyduğun bloklar, yazdığın sayı kadar tekrar çalışır.\n\n### Program: üç yanıp sönme ve evet\n1. **Döngü** kategorisinden **[4] kez tekrarla** bloğunu **başlangıçta** içine sürükle.\n2. Sayıyı 3 yap.\n3. Tekrarla bloğunun içine sırayla şunları tak:\n   - **Temel** kategorisinden **simgeyi göster** (listeden **kare** seç)\n   - **bekle [300] ms**\n   - **ekranı temizle**\n   - **bekle [300] ms**\n4. Tekrarla bloğunun **altına**, yani dışına, **simgeyi göster** bloğunu ekle ve **evet** seç.\n5. ▶ **Çalıştır**.\n\n### Beklenen sonuç\nKare üç kez yanıp söner. Her yanıp sönme yaklaşık 0,6 saniye sürer. Sonra ekranda \"evet\" işareti kalır. Hedefler kutusunda üç görev ✓ olmalı.\n\n### Nasıl çalışıyor?\n- Tekrarla bloğunun içindeki bloklar, **sayı kadar** baştan sona çalışır. Üçüncü tur bitince kart bir sonraki bloğa geçer.\n- Bir blok tekrarla bloğunun **içindeyse** tekrar eder, **altındaysa** bir kez çalışır. \"Evet\" simgesi tekrarla bloğunun dışında olduğu için yalnızca bir kez, en sonda görünür.\n- **JavaScript** sekmesine bak: tekrarla bloğu `for (let _i = 0; _i < 3; _i++)` satırına dönüşmüş. Süslü parantezlerin içindeki satırlar tekrar eden bloklardır.\n\n### Dene\n1. Sayıyı 10 yap. Kare 10 kez yanıp söner. Bekleme süresini 100 ms yap ve hızı karşılaştır.\n2. Tekrarla bloğunun içine ikinci bir simge ekle: kare, bekle, elmas, bekle gibi. Yanıp sönme yerine ne oluyor?\n3. \"Evet\" bloğunu tekrarla bloğunun içine taşı ve ne değişiyor gör.\n\n### Sık yapılan hatalar\n- **Bloğu yanlış yere takmak.** Tekrarla bloğunun içine mi, altına mı koyduğuna dikkat et. İç ve dış farklı şeyler yapar.\n- **Temizlemeyi unutmak.** Temizleme ve bekleme olmazsa kare hiç sönmez, yanıp sönme göremezsin.\n- **Çok kısa süre yazmak.** 10 ms gibi çok kısa bekleme gözle görülmez.",
          "question": "Günlük hayatta tekrar eden neler var? Diş fırçalamak ya da merdiven çıkmak gibi tekrar eden şeyleri tek bir \"kez tekrarla\" cümlesiyle nasıl anlatırdın?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Aynı blokların farklı sırada farklı sonuç verdiğini\n- Bir işi birden çok kez yaptırmak için **tekrarla** bloğunu kullanmayı\n- Bir bloğun tekrarla'nın **içinde** mi, **altında** mı olduğunun farkını\n- Tekrarlı bir programın toplam süresini hesaplamayı\n\n### Önceden bilmen gerekenler\nDers 1: Blokların yukarıdan aşağıya çalışması. Ders 2: **bekle** bloğunun milisaniye cinsinden süresi ve **ekranı temizle**. Ders 3: **simgeyi göster** bloğu.\n\n### Sıra sonucu değiştirir\nBir yemek tarifinde yumurtayı kırmadan önce karıştırırsan sonuç bozulur. Kartta da öyle. Şu iki yığın aynı dört bloktan oluşur:\n\n```\nYığın 1: kare göster -> bekle 300 -> temizle -> bekle 300\nYığın 2: temizle -> bekle 300 -> kare göster -> bekle 300\n```\n\nYığın 1 bittiğinde ekran boştur. Yığın 2 bittiğinde ekranda kare kalmıştır. Bir programın **son durumu**, en son çalışan bloğun bıraktığı durumdur.\n\n### Kopyalamak yerine tekrarlamak\nKareyi üç kez yanıp söndürmek için dört bloğu üç kez alt alta dizebilirsin; 12 blok olur. Ya da 100 kez yanıp sönmesi gerekseydi? Bunun için **tekrarla** bloğu vardır. İçine koyduğun bloklar, yazdığın sayı kadar baştan sona çalışır. Bu tür yapıya **döngü** denir.\n\nTekrarla bloğunun JavaScript karşılığı şudur:\n\n```\nfor (let _i = 0; _i < 3; _i++) {\n  ...\n}\n```\n\nBurada `_i` bir sayaçtır. 0'dan başlar, her turda 1 artar ve 3'e ulaşınca durur. Yani 0, 1, 2 olmak üzere tam üç tur döner.\n\n### İçeride mi, dışarıda mı?\nBir blok tekrarla bloğunun **içindeyse** her turda çalışır. **Altındaysa** döngü tamamen bittikten sonra bir kez çalışır. Aradaki fark küçük görünür ama sonuç büyüktür: \"evet\" simgesini içeri koyarsan her turda gösterilmeye çalışılır; dışarı koyarsan yalnızca en sonda bir kez görünür.\n\n### Toplam süreyi hesaplamak\nDöngünün süresi, bir turun süresi çarpı tur sayısıdır. Bir turda 300 ms açık, 300 ms kapalı beklersen tur 600 ms sürer. Üç turun toplamı:\n\n```\n3 x (300 + 300) = 1800 ms = 1,8 saniye\n```\n\nBu hesabı yapabilmek, bir animasyonu planlarken işine yarar. Unutma: yanıp sönmenin görünmesi için hem **temizle** hem de iki **bekle** gerekir. Temizleme yoksa kare hiç sönmez; bekleme yoksa değişim gözün göremeyeceği kadar hızlı olur.\n\n### Özet\nAynı bloklar farklı sırada farklı sonuç verir. Tekrarla bloğu, içindeki blokları sayı kadar çalıştırır ve kopyalama zahmetini ortadan kaldırır. İçeride olan her turda, dışarıda olan döngüden sonra bir kez çalışır. Toplam süre, tur süresi çarpı tur sayısıdır.",
          "concepts": [
            {
              "term": "Sıra",
              "definition": "Aynı bloklar farklı sırada dizilince farklı sonuç verir; programın son durumu en son çalışan bloğa bağlıdır.",
              "example": "Önce temizle sonra kare göster: ekranda kare kalır; ters sırada ekran boş kalır.",
              "pitfall": "Bloklar doğru olduğu halde sırayı ters dizip programı bozuk sanmak."
            },
            {
              "term": "Döngü (tekrarla)",
              "definition": "İçine konan blokları, yazılan sayı kadar baştan sona çalıştıran blok.",
              "example": "Tekrarla 3: kare göster, bekle, temizle, bekle. Kare üç kez yanıp söner.",
              "pitfall": "Sayıyı yanlış girmek; 3 yazınca tam üç tur döner, ikisi ya da dördü değil."
            },
            {
              "term": "İçeride ve dışarıda",
              "definition": "Tekrarla'nın içindeki bloklar her turda, altındaki bloklar ise döngü bittikten sonra bir kez çalışır.",
              "example": "evet simgesi tekrarla'nın altındaysa yalnızca en sonda görünür.",
              "pitfall": "Bloğu yanlış yere takmak: içeri takılan, istenmeyen yerde tekrarlanır."
            },
            {
              "term": "Tur süresi",
              "definition": "Döngü içindeki bekleme sürelerinin toplamı; toplam süre bunun tur sayısı katıdır.",
              "example": "300 + 300 ms tur, 3 tur için toplam 1800 ms eder.",
              "pitfall": "Yalnızca bir turun süresini toplam sanmak."
            },
            {
              "term": "Sayaç (_i)",
              "definition": "JavaScript sekmesinde tekrarla bloğunun kullandığı, 0'dan başlayıp tur sayısına kadar artan değişken.",
              "example": "for (let _i = 0; _i < 3; _i++) satırı 0, 1, 2 olmak üzere üç tur döner.",
              "pitfall": "_i < 3 ifadesini \"üçe kadar dahil\" sanmak; 3 değeri dahil değildir."
            }
          ],
          "quiz": [
            {
              "id": "m10h1d4-q1",
              "kind": "predict-output",
              "prompt": "Bu program bittikten sonra ekranda ne vardır?\n\n```\ncard.onStart(() => {\n  screen.clear();\n  wait(300);\n  screen.showIcon(\"square\");\n  wait(300);\n});\n```",
              "options": [
                "Ekran boştur",
                "Önce kare, sonra boş ekran",
                "Kare simgesi görünür",
                "Hata oluşur"
              ],
              "answer": 2,
              "explanation": "Ekran önce temizlenir, ardından kare gösterilir. Kareden sonraki bekleme çizimi silmez; bu yüzden kare ekranda kalır. Temizle ile kare göster bloklarının yeri ters olsaydı ekran boş kalırdı.",
              "skills": [
                "mk-flow",
                "mk-images"
              ]
            },
            {
              "id": "m10h1d4-q2",
              "kind": "numeric",
              "prompt": "Bir tekrarla bloğu 3 kez çalışıyor. Her turda 300 ms bekle, ekranı temizle, 300 ms bekle blokları var. Döngünün toplam süresi kaç milisaniyedir? (Gösterme ve temizleme blokları beklemez.)",
              "answer": 1800,
              "unit": "ms",
              "explanation": "Bir tur 300 + 300 = 600 ms sürer. Üç tur: 3 x 600 = 1800 ms (1,8 saniye). Yalnızca 600'ü yazmak bir turun süresini toplam sanmaktır.",
              "skills": [
                "mk-repeat",
                "mk-timing"
              ]
            },
            {
              "id": "m10h1d4-q3",
              "kind": "find-bug",
              "prompt": "Ece kareyi üç kez yanıp söndürmek istiyor ama kare hiç sönmüyor.\n\n```\n1  for (let _i = 0; _i < 3; _i++) {\n2    screen.showIcon(\"square\");\n3    wait(300);\n4    wait(300);\n5  }\n```\n\nHata nedir?",
              "options": [
                "4. satırda wait yerine screen.clear() gerekir; ekran hiç temizlenmiyor",
                "1. satır: döngü 4 kez dönmeli",
                "2. satır: square simgesi yanıp sönemez",
                "3. satır: bekleme çok kısa"
              ],
              "answer": 0,
              "explanation": "Yanıp sönmek için bir turda gösterme, bekleme, temizleme, bekleme gerekir. Burada temizleme yok, kare ilk turdan sonra hep yanık kalır. Tur sayısı (3) istenen sayıdır ve square geçerli bir simgedir; bekleme süresi ise sonucu bozmaz, yalnızca hızı değiştirir.",
              "skills": [
                "mk-repeat",
                "mk-debug"
              ]
            },
            {
              "id": "m10h1d4-q4",
              "kind": "mcq",
              "prompt": "\"Evet\" simgesini göstermek için bloğu tekrarla bloğunun ALTINA (dışına) takıyorsun. Bu ne sağlar?",
              "options": [
                "Simge her turda gösterilir",
                "Simge hiç gösterilmez",
                "Döngü sonsuza kadar sürer",
                "Simge döngü tamamen bittikten sonra yalnızca bir kez gösterilir"
              ],
              "answer": 3,
              "explanation": "Tekrarla'nın altındaki blok, döngü bitince bir kez çalışır. İçeri takılsaydı her turda çalışmayı denerdi. Altına takmak simgeyi gizlemez ve döngüyü uzatmaz.",
              "skills": [
                "mk-repeat",
                "mk-flow"
              ]
            },
            {
              "id": "m10h1d4-q5",
              "kind": "mcq",
              "prompt": "JavaScript sekmesinde for (let _i = 0; _i < 5; _i++) satırı var. İçindeki bloklar kaç kez çalışır?",
              "options": [
                "4 kez",
                "5 kez",
                "6 kez",
                "Sonsuza kadar"
              ],
              "answer": 1,
              "explanation": "_i değeri 0, 1, 2, 3, 4 olur ve 5 olunca koşul bozulur. Bu beş tur eder. 0'dan başladığı için \"5'e kadar\" demek 5'in dahil olduğu anlamına gelmez; dolayısıyla 6 değil 5 tur döner.",
              "skills": [
                "mk-repeat"
              ]
            }
          ]
        },
        {
          "title": "Proje: Atan kalp",
          "durationMin": 30,
          "problem": "Doktor kalbini dinlerken \"tup-tup, tup-tup\" duyar: iki kısa vuruş, sonra küçük bir dinlenme. Bu hafta öğrendiklerinle kartın ekranında gerçek bir kalp atışı yapabilirsin. Hem de ilk anda kısa bir selam yazısıyla!",
          "contentMd": "### Proje: Atan kalp\nBu hafta öğrendiğin her şeyi birleştireceksin: yazı göstermek, simge göstermek, bekleme, tekrar ve ekran parlaklığı.\n\n**Hedefler:**\n- Kart açılınca kısa bir yazı kaysın.\n- Ekran parlaklığı biraz kısılsın.\n- Sonra kalp sonsuza kadar \"tup-tup\" diye atsın: büyük kalp, küçük kalp, büyük kalp, küçük kalp ve sonra biraz dinlenme.\n\n### Yeni blok: sonsuza kadar\n**Temel** kategorisindeki **sonsuza kadar** bloğu, içindeki blokları durmadan baştan tekrarlar. Sen **Durdur** düğmesine basana kadar sürer. Atan kalp gibi bitmeyen işler için birebir.\n\n### Yeni blok: ekran parlaklığını yap\n**LED** kategorisindeki **ekran parlaklığını [255] yap** bloğu bütün LED'lerin parlaklığını 0 ile 255 arasında ayarlar. 255 en parlaktır. 0'da hiçbir şey görünmez. Bir yazı göstermeden önce ışığı biraz kısmak gözünü yormaz.\n\n### Adım adım\nEditörde **başlangıçta** ve **sonsuza kadar** blokları hazır duruyor.\n\n1. **başlangıçta** bloğunun içine **LED** kategorisinden **ekran parlaklığını [255] yap** bloğunu koy. Sayıyı 200 yap.\n2. Altına **Temel** kategorisinden **yazıyı göster** bloğunu tak. Yazıyı \"Sev\" yap.\n3. **sonsuza kadar** bloğunun içine sırayla şu blokları tak:\n   - **simgeyi göster** (kalp), **bekle** 150 ms\n   - **simgeyi göster** (küçük kalp), **bekle** 100 ms\n   - **simgeyi göster** (kalp), **bekle** 150 ms\n   - **simgeyi göster** (küçük kalp), **bekle** 400 ms\n4. ▶ **Çalıştır**.\n\n### Beklenen sonuç\nÖnce ekranda kısa bir \"Sev\" yazısı kayar (yaklaşık 2 saniye). Sonra kalp iki kez hızla atar, kısa bir dinlenme olur ve yeniden başlar. Beş hedefin hepsinde ✓ olmalı.\n\n### Nasıl çalışıyor?\n- **başlangıçta** bir kez çalışır, bittikten sonra **sonsuza kadar** devreye girer.\n- Kalp atışı: büyük kalp, küçük kalp, büyük kalp, küçük kalp. Aradaki bekleme süreleri ritmi belirler. Toplam yaklaşık 0,8 saniye.\n- **sonsuza kadar** her turun sonunda çok kısa bir an soluklanır, bu yüzden kartı yormaz.\n- Süreleri değiştirerek heyecanlı bir kalp ya da uyuyan bir kalp yapabilirsin.\n\n### Dene\n1. Beklemeleri kısaltarak kalbi hızlandır. Koşan birinin kalbi gibi olsun.\n2. Beklemeleri uzatarak yavaşlat. Uyuyan birinin kalbi gibi.\n3. Yazı olarak kendi adının ilk harfini yaz. Tek harf kaymaz, ortada durur. Fark ne?\n4. İstersen **başlangıçta** bloğunun içindeki parlaklığı 20 yapıp kalbin nasıl göründüğüne bak. Sonra 255'e geri al.\n\n### Sık yapılan hatalar\n- **Blokları yanlış yere koymak.** Yazı bloğu **başlangıçta**, kalp blokları **sonsuza kadar** içinde olmalı. Yazıyı sonsuza kadar bloğuna koyarsan her turda yeniden kayar.\n- **Bekleme koymamak.** Büyük ve küçük kalp arasında bekleme yoksa kalbin atışını göremezsin.\n- **Parlaklığı 0 yapmak.** Parlaklık 0 olursa ekran hiçbir şey göstermez. Program bozulmadı; sayıyı yükselt.",
          "question": "Projende hangi süreleri seçtin? Gerçek bir kalp atışı ile senin atan kalbin arasında ne kadar fark var? Bu kalbi, bir arkadaşına nasıl yeniden programlanabilir bir hediye haline getirirdin?",
          "explainerMd": "### Bu derste öğreneceklerin\n- **başlangıçta** (bir kez) ile **sonsuza kadar** (durmadan) bloklarının farkını\n- Bir ritmin bekleme süreleriyle nasıl kurulduğunu\n- **ekran parlaklığını yap** bloğunun 0 ile 255 arasında çalıştığını\n- Büyük bir işi önce parçalara bölüp tabloya dökerek planlamayı\n\n### Önceden bilmen gerekenler\nDers 1: yazıyı göstermek ve başlık blokları. Ders 2: **bekle** ve milisaniye. Ders 3: **simgeyi göster** (kalp ve küçük kalp). Ders 4: blokların sırası ve tekrar.\n\n### İki ayrı başlık bloğu\nŞimdiye kadar her şeyi **başlangıçta** bloğuna koydun; o bölüm bir kez çalışır ve biter. Atan bir kalp ise bitmemelidir. **sonsuza kadar** bloğu, içindekileri sen ■ Durdur'a basana kadar baştan tekrarlar. İş bölümü şöyledir:\n\n| Bölüm | Ne zaman çalışır | Bu projede ne koyarsın |\n|---|---|---|\n| başlangıçta | Bir kez, açılışta | Parlaklığı ayarla, selam yazısını göster |\n| sonsuza kadar | Bitmeden tekrar tekrar | Kalp atışını |\n\nYazıyı yanlışlıkla sonsuza kadar içine koyarsan, kalp her turda yeniden yazının bitmesini bekler; atış asla düzgün görünmez.\n\n### Ritim, beklemelerin toplamıdır\nGerçek kalp \"tup-tup, dinlen\" der. Bunu kartta büyük kalp, küçük kalp, büyük kalp, küçük kalp diye gösterir ve aralara farklı süreli beklemeler koyarsın:\n\n```\nbüyük kalp    150 ms\nküçük kalp    100 ms\nbüyük kalp    150 ms\nküçük kalp    400 ms  (uzun dinlenme)\ntoplam        800 ms\n```\n\nBir tur 800 ms sürer. Bir dakika 60 000 ms olduğuna göre dakikada yaklaşık 60 000 / 800 = 75 tur eder. Beklemeleri kısaltırsan kalp hızlanır, uzatırsan yavaşlar. İstediğin ritmi bu sayılarla ayarlarsın.\n\n### Parlaklık\n**ekran parlaklığını yap** bloğu bütün LED'lerin parlaklığını ayarlar. Değer **0 ile 255** arasındadır: 255 en parlak, 0 ise hiçbir şeyin görünmediği durumdur. Program bozulmadı sanma; parlaklık 0 ise ekran çizim yapılsa bile karanlıktır. Ekranı kısmak, özellikle karanlık bir odada gözünü yormaz.\n\n### Önce plan, sonra blok\nProje büyüdükçe doğrudan blok sürüklemek yerine önce küçük bir tablo yazmak işini kolaylaştırır:\n\n| Adım | Bölüm | İş |\n|---|---|---|\n| 1 | başlangıçta | Parlaklığı 200 yap |\n| 2 | başlangıçta | \"Sev\" yazısını göster |\n| 3 | sonsuza kadar | Kalp atışı: dört çizim, dört bekleme |\n\nHer satır bir veya birkaç bloğa karşılık gelir. Planı bu şekilde yazınca nereye hangi bloğu koyacağını bilirsin.\n\n### Özet\nbaşlangıçta bir kez, sonsuza kadar sürekli çalışır. Atan kalbin ritmi bekleme sürelerinin toplamıdır; bu projede tur 800 ms'dir. Parlaklık 0 ile 255 arasındadır ve 0 ekranı karartır. İşe önce planı bir tabloya dökerek başlamak hataları azaltır.",
          "concepts": [
            {
              "term": "başlangıçta ve sonsuza kadar",
              "definition": "başlangıçta bir kez, sonsuza kadar ise sen durdurana kadar sürekli tekrar çalışır.",
              "example": "Selam yazısı başlangıçta içinde, kalp atışı sonsuza kadar içinde olur.",
              "pitfall": "Yazıyı sonsuza kadar içine koymak: her turda yeniden kayar ve kalp atışını bozar."
            },
            {
              "term": "Ritim",
              "definition": "Bir hareketin bekleme sürelerinin dizisi; toplamı bir turun süresidir.",
              "example": "150, 100, 150, 400 ms beklemeler 800 ms'lik bir kalp atışı turu verir.",
              "pitfall": "Aradaki beklemeleri koymamak; büyük ve küçük kalp ayırt edilmez."
            },
            {
              "term": "Parlaklık",
              "definition": "ekran parlaklığını yap bloğu LED'lerin ışığını 0 (kapalı) ile 255 (en parlak) arasında ayarlar.",
              "example": "Parlaklık 200 yapınca ekran biraz kısılır.",
              "pitfall": "Parlaklığı 0 yapıp programın bozulduğunu sanmak; ekran çalışır ama karanlıktır."
            },
            {
              "term": "Tur sayısı ve hız",
              "definition": "Bir turun süresi kısaldıkça aynı sürede daha çok tur yapılır; dakikadaki tur sayısı 60 000 / tur süresidir.",
              "example": "800 ms'lik turla dakikada yaklaşık 75 tur olur.",
              "pitfall": "Süreyi saniye sanmak; bekleme blokları milisaniye cinsindendir."
            },
            {
              "term": "Plan tablosu",
              "definition": "Projeyi adım adım (hangi bölüm, hangi iş) yazan küçük tablo.",
              "example": "Adım 1: parlaklığı ayarla, adım 2: yazıyı göster, adım 3: kalbi sonsuza kadar içinde at.",
              "pitfall": "Plansız başlamak; blokları rastgele sürükleyip nereye ait olduklarını unutmak."
            }
          ],
          "quiz": [
            {
              "id": "m10h1d5-q1",
              "kind": "numeric",
              "prompt": "Atan kalpte beklemeler sırasıyla 150, 100, 150 ve 400 ms'dir. Bir kalp atışı turunun bekleme süresi toplamı kaç milisaniyedir?",
              "answer": 800,
              "unit": "ms",
              "explanation": "150 + 100 + 150 + 400 = 800 ms. Çizim blokları beklemediği için tur süresini yalnızca bekle blokları belirler.",
              "skills": [
                "mk-timing",
                "mk-planning"
              ]
            },
            {
              "id": "m10h1d5-q2",
              "kind": "numeric",
              "prompt": "Bir tur 800 ms sürüyorsa, kalp 1 dakikada (60 000 ms) yaklaşık kaç kez atar? (Her turu tek atış sayın.)",
              "answer": 75,
              "tolerance": 2,
              "unit": "tur",
              "explanation": "60 000 / 800 = 75 tur. Gerçek sanal kartta sonsuza kadar bloğu her turun sonunda yaklaşık 20 ms soluklanır; bu yüzden pratikte yaklaşık 73 tur olur ve küçük bir fark kabul edilir.",
              "skills": [
                "mk-timing",
                "mk-repeat"
              ]
            },
            {
              "id": "m10h1d5-q3",
              "kind": "predict-output",
              "prompt": "Selam yazısı yanlışlıkla sonsuza kadar bloğuna konmuştur. Bu program çalışınca ne olur?\n\n```\ncard.forever(() => {\n  screen.showText(\"Sev\");\n  screen.showIcon(\"heart\");\n  wait(500);\n});\n```",
              "options": [
                "Yazı bir kez kayar, sonra kalp sürekli görünür",
                "Yalnızca yazı kayar, kalp görünmez",
                "Kalp yarım saniye görünür, sonra yazı yeniden kayar; bu böyle sürer",
                "Program hata verip durur"
              ],
              "answer": 2,
              "explanation": "sonsuza kadar bloğundaki her şey her turda yeniden çalışır. Yazı yaklaşık 2 saniye kayar, ardından kalp 500 ms görünür ve tur başa döner. Bu yüzden yazıyı başlangıçta bloğuna koymak gerekir. Program hata vermez.",
              "skills": [
                "mk-flow",
                "mk-repeat"
              ]
            },
            {
              "id": "m10h1d5-q4",
              "kind": "find-bug",
              "prompt": "Zeynep kalp atışı çalışırken ekranda hiçbir şey göremiyor.\n\n```\n1  card.onStart(() => {\n2    screen.setBrightness(0);\n3    screen.showText(\"Sev\");\n4  });\n```\n\nSorun hangi satırdadır?",
              "options": [
                "3. satır: yazı çok kısa",
                "1. satır: onStart yerine forever gerekir",
                "4. satır: kapanış parantezi fazla",
                "2. satır: parlaklık 0 ekranı karartır; 0 ile 255 arasında sıfırdan büyük bir değer gerekir"
              ],
              "answer": 3,
              "explanation": "Parlaklık 0 ise LED'ler çizim yapılsa bile karanlık kalır. Program bozuk değildir; sayıyı yükseltmek yeterlidir (örneğin 200). Başlangıç bloğu doğru yerdedir ve yazı uzunluğu, görünürlüğü etkilemez.",
              "skills": [
                "mk-debug",
                "mk-flow"
              ]
            },
            {
              "id": "m10h1d5-q5",
              "kind": "mcq",
              "prompt": "Koşan birinin kalbi gibi daha hızlı bir atış istiyorsun. Ne yapmalısın?",
              "options": [
                "Bekleme sürelerini uzatmalısın",
                "Bekleme sürelerini kısaltmalısın",
                "Parlaklığı 255 yapmalısın",
                "Kalp simgesini küçük kalp yapmalısın"
              ],
              "answer": 1,
              "explanation": "Tur süresi bekle bloklarının toplamıdır; kısalırsa aynı sürede daha çok tur yapılır ve kalp hızlanır. Uzatmak yavaşlatır. Parlaklık ve simge seçimi ritmi değil görüntüyü etkiler.",
              "skills": [
                "mk-timing",
                "mk-planning"
              ]
            }
          ]
        }
      ]
    },
    {
      "title": "Düğmeler ve olaylar",
      "project": "Zar oyunu skor panosu",
      "guideMd": "### Hafta hedefleri\nBu haftanın sonunda öğrenci:\n1. Olayın ne olduğunu açıklayabilir; A, B ve A+B düğme olay bloklarını kullanabilir.\n2. Basılınca, bırakılınca ve uzun basılınca arasındaki farkı gösterebilir; logoyu bir olay kaynağı olarak kullanabilir.\n3. Değişken oluşturup değerini yapabilir, artırıp azaltabilir ve ekranda gösterebilir (sayaç).\n4. Rastgele sayı bloğu ve **eğer ... ise** ile karar veren bir program yazabilir; atama ile karşılaştırma farkını söyleyebilir.\n5. Kural tablosuna bakarak üç düğmeli, değişkenli ve ezgili bir skor panosu kurabilir.\n\n### Haftanın planı\nHafta beş derstir; her ders yaklaşık 20-35 dakikadır. Plan günde bir ders içindir. Daha yoğun takvim isteyenler 1. ve 2. dersi ya da 3. ve 4. dersi birleştirebilir.\n\n| Gün | Ders | Süre | Ne yapılır |\n|---|---|---|---|\n| 1 | A, B ve A+B düğmeleri | ~20 dk | Anlatımı oku, üç düğmeye üç simge ver, bırakılınca ve bekleme deneylerini yap, mini testi çöz. |\n| 2 | Sayaç ve değişken | ~25 dk | Ziyaretçi sayacını kur; 12 kez basarak iki basamaklı sayıyı gözle; beşer beşer saydır. |\n| 3 | Elektronik zar | ~25 dk | Zarı bir kez at, kutuya koy; 6'da kalp göster; 10 atışta kaç altı geldiğini say. |\n| 4 | Logo, uzun basış ve gizli düğmeler | ~20 dk | Logo ve uzun basış bloklarını kur; 1 saniye süresini kendi gözlemle ölç. |\n| 5 | Proje: Zar oyunu skor panosu | ~35 dk | Kural tablosunu yaz, programı kur, oyunu bir arkadaşınla oyna, ölçütle değerlendir. |\n\n### Ön koşul kontrolü\nBu hafta Hafta 1'in sonunda şunları yapabilmek gerekir:\n- Sanal kartta ▶ Çalıştır, ■ Durdur ve ↺ Sıfırla düğmelerini kullanmak.\n- **başlangıçta** ve **sonsuza kadar** gibi başlık bloklarının içine blok takmak.\n- **simgeyi göster**, **sayıyı göster**, **bekle** ve **ekranı temizle** bloklarını bilmek.\n- Dört işlemi (toplama, çıkarma, çarpma) rahat yapmak; sayaç ve toplam hesabı bunları içerir.\n\n### Kavram haritası\n- **Olay:** olay bloğu (başlık bloğu) → düğme A, B, A+B → basılınca, bırakılınca, uzun basılınca (1 saniye) → logo (dokununca, bırakılınca)\n- **Veri:** değişken (ada sahip kutu) → değerini yap, değerine ekle → başlangıç değeri → sayaç → toplam (biriktirici)\n- **Karar:** rastgele sayı (uçlar dahil) → karşılaştırma (=, ≠, <, ≤, >, ≥) → eğer ... ise → değilse\n- **Proje:** kural tablosu → zar ve toplam → ezgiyi çal (bitene kadar bekler) → sıfırlama\n\n### Sık yapılan hatalar\n- **Düğme listesini değiştirmemek.** İki blokta da A seçili kalır; B'ye basınca hiçbir şey olmaz.\n- **A'ya, sonra B'ye basıp A+B beklemek.** İkisine aynı anda basmak için sanal kartın alttaki A+B düğmesi kullanılır.\n- **Bloğu başlık bloğunun dışında bırakmak.** Soluk görünür ve çalışmaz.\n- **Değişkeni değiştirip göstermeyi unutmak.** Kutu değişir ama ekranda bir şey olmaz.\n- **Önce göstermek, sonra artırmak.** Sayaç bir geriden gelir.\n- **İki ayrı rastgele blok kullanmak.** Ekranda görünen ile karşılaştırılan sayı farklı çıkar; zarı bir kez at, kutuya koy.\n- **Atama ile karşılaştırmayı karıştırmak.** \"değerini yap\" kutuya değer koyar; \"=\" soru sorar.\n- **`>` ile `≥` karıştırmak.** 5 > 5 yanlıştır; 5 ≥ 5 doğrudur.\n- **Uzun basış için 1 saniyeden az basmak.** Olay hiç gelmez.\n- **Toplamı sıfırlamayı unutmak.** Yeni oyunda eski puan üstüne eklenir.\n\n### Hafta sonu tekrarı\n1. Her dersin kavram kartlarına bir kez daha bak ve \"sık yapılan yanlış\" satırlarını yüksek sesle oku.\n2. Mini testlerde yanlış yaptığın soruların açıklamalarını yeniden oku, sonra soruyu yeniden çöz.\n3. Sayaç programını sıfırdan, bakmadan kur; sonra A'ya 12 kez bas ve ekranda ne gördüğünü anlat.\n4. Zar programına bir kural ekle: 1 gelirse üzgün yüz, 6 gelirse kalp. İki kolu da **eğer** ile yap.\n5. Kendi cümlelerinle cevapla: \"Değişken olmasaydı kart ziyaretçi sayısını nasıl tutardı?\"\n\nHafta sonu testi olarak beş dersin mini testleri yeterlidir; her derste 5 soru, toplam 25 soru. Hedef: her dersten en az 4 doğru. Eksik kalan dersin anlatımına dön.\n\n### Proje değerlendirme ölçütü (Zar oyunu skor panosu)\n| Ölçüt | Gelişmeli | Yeterli | İleri |\n|---|---|---|---|\n| Olaylar | Düğmelerden biri tepki vermiyor | A, B ve A+B doğru çalışıyor | Bir ek olay eklenmiş (uzun basışla sıfırlama gibi) |\n| Değişkenler | Toplam birikmiyor ya da hep son atış görünüyor | zar ve toplam doğru kullanılmış, A+B sıfırlıyor | Üçüncü değişken eklenmiş (en yüksek atış gibi) |\n| Zar ve karar | İki ayrı rastgele blok var ya da 6'da ezgi çalmıyor | Zar bir kez atılıyor, 6'da zafer ezgisi çalıyor | Ek kural var (1 gelince sıfırlama, 30'u aşınca mutlu yüz) |\n| Plan | Kural tablosu yok | Olay, iş ve değişken tablosu var | Tablo programla birebir uyuyor |\n| Anlatım | Ne yaptığını anlatamıyor | Her düğmenin işini adım adım anlatıyor | Bir hatayı nasıl bulduğunu anlatıyor |\n\n### Veli ve öğretmen notu\n- **Amaç.** Bu haftanın büyük fikri \"kart bekler, olay gelince çalışır\" ve \"kutu hatırlar\". Ezberletmeye gerek yoktur; öğrenci kendi sayacında ve zarında deneyerek görür.\n- **Nasıl destek olunur?** Takıldığında cevabı söylemek yerine şunu sor: \"Hangi düğmeye basınca hangi blok çalışıyor?\", \"Kutunun içinde şu an ne var?\", \"Bu sayıyı ekranda mı gösteriyorsun, yoksa yalnızca kutuyu mu değiştirdin?\"\n- **Olasılık.** Zar rastgeledir; 10 atışta hiç 6 gelmeyebilir. Bu hata değildir. Atış sayısını artırınca oranın altıda bire yaklaştığını konuşmak güzel bir sohbettir.\n- **Ses.** Zafer ezgisi için tarayıcı sayfada bir tıklama bekler. Ses duyulmazsa sağ paneldeki Hoparlör bölümüne bakın.\n- **Süre.** Dersleri aralıklı yapmak kalıcılığı artırır. Proje günü uzayabilir; yarım bırakmak sorun değildir.\n- **Güvenlik.** Bu platformdaki her şey sanaldır; gerçek bir parça, pil ya da kablo gerekmez.\n- **İlerleme.** Mini test sonuçları \"İlerlemem\" sayfasında beceri bazında görünür (taslak/pilot özellik; yalnız onay verildiyse kaydedilir).",
      "lessons": [
        {
          "title": "A, B ve A+B düğmeleri",
          "durationMin": 20,
          "problem": "Kapı zilinin düğmesine bastığında ne olur? Zil çalar. Zil kendiliğinden çalmaz; birinin basmasını bekler. Bilgisayarlarda böyle \"bir şey olunca şunu yap\" kuralına olay denir. Kartın A ve B düğmeleriyle ilk olay bloklarını yazacaksın.",
          "contentMd": "### Olay nedir?\nŞimdiye kadar programlar kendi başına baştan sona çalıştı. Bu derste ise kart **bekler**. Sen bir düğmeye basınca, o düğmenin bloğunun içindeki işler yapılır. Bu \"bir şey olunca çalışan\" bloklara olay bloğu denir.\n\n**Giriş** kategorisindeki **düğme [A] [basılınca]** bloğu bir başlık bloğudur, **başlangıçta** gibi. İçinde iki liste vardır:\n\n- Düğme: **A**, **B** ya da **A+B**.\n- Ne zaman: **basılınca**, **bırakılınca** ya da **uzun basılınca**.\n\n### Program: duygu düğmeleri\nEditörde üç tane **düğme** bloğu hazır duruyor: A, B ve A+B için. Hepsi boş. Sen içlerini dolduracaksın.\n\n1. **Temel** kategorisinden **simgeyi göster** bloğunu birinci bloğun (A) içine sürükle. Listeden **mutlu yüz** seç.\n2. İkinci bloğa (B) **simgeyi göster** koy, listeden **üzgün yüz** seç.\n3. Üçüncü bloğa (A+B) **simgeyi göster** koy, listeden **kalp** seç.\n4. Üçüncü bloğun ilk açılır listesinin **A+B** olduğundan emin ol.\n5. ▶ **Çalıştır**.\n6. Sanal kartın A düğmesine tıkla, sonra B'ye, sonra alttaki A+B düğmesine.\n\n### Beklenen sonuç\nA'ya basınca mutlu yüz, B'ye basınca üzgün yüz görünür. A+B'ye basınca kalp çıkar. Dört hedef de ✓ olmalı.\n\n### Nasıl çalışıyor?\n- Program çalışırken olay blokları sessizce **bekler**. Düğmeye basılınca o bloğun içi yukarıdan aşağıya çalışır, bitince yine beklemeye döner.\n- Aynı anda hem A hem B basılı olduğunda yalnızca **A+B** olayı çalışır; A ve B'nin ayrı blokları çalışmaz.\n- **basılınca** düğmeye bastığın an, **bırakılınca** parmağını çektiğin an çalışır. **uzun basılınca** düğmeyi basılı tutmaya başladıktan bir saniye sonra çalışır.\n- Olaylar birbirinden bağımsızdır. Bir program içinde istediğin kadar olay bloğu bulunabilir.\n\n### Dene\n1. A bloğunu **basılınca** yerine **bırakılınca** yap. Mutlu yüz ne zaman çıkıyor?\n2. B bloğunun içine ikinci bir blok ekle: **bekle 1000 ms** ve altına **ekranı temizle**. Üzgün yüz bir saniye sonra söner.\n3. A düğmesine basılı tut ve bir saniye sonra bırak. Hangi blok ne zaman çalıştı? Gözlemini arkadaşına anlat.\n\n### Sık yapılan hatalar\n- **Düğme listesini değiştirmeyi unutmak.** İki blokta da A seçili kalırsa iki blok da A'ya tepki verir; B'ye basınca hiçbir şey olmaz.\n- **A+B yerine birbiri ardına basmak.** A'ya, sonra B'ye ayrı ayrı basmak A+B olayını üretmez. İkisine aynı anda basmak için sanal kartın altındaki **A+B** düğmesini kullan.\n- **Bloğu başlık bloğunun dışında bırakmak.** Olay bloğunun dışına koyduğun **simgeyi göster** hiçbir zaman çalışmaz. Soluk görünür.",
          "question": "Günlük hayatta hangi aletler bir düğmeye basılınca çalışır? Bir oyun konsolundaki düğmeleri kartın A, B ve A+B düğmeleriyle karşılaştırırsan sence en çok neye ihtiyaç duyarsın?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Olayın ne olduğunu ve neden \"bir şey olunca çalışan\" bloklara ihtiyaç duyduğumuzu\n- Kartın üç düğmesini: **A**, **B** ve **A+B**\n- Bir düğme için üç farklı anı: basılınca, bırakılınca, uzun basılınca\n- Bir program içinde birden çok olay bloğunun yan yana yaşayabildiğini\n\n### Önceden bilmen gerekenler\n- Ders 1-2: editörü kullanmak, blokları sürükleyip takmak, ▶ **Çalıştır** düğmesi\n- Ders 3: **simgeyi göster** bloğu\n- Ders 4-5: **başlangıçta** ve **sonsuza kadar** gibi başlık blokları; \"başlık bloğunun dışındaki blok çalışmaz\" kuralı\n\n### Beklemek de bir programdır\nŞimdiye kadar programlar kendiliğinden başladı ve baştan sona aktı. Gerçek aletler çoğu zaman böyle çalışmaz. Asansörün içi sen düğmeye basana kadar sessizce bekler. Basınca bir şey olur, sonra yine bekler. Bilgisayarcılar bu \"bir şey olunca\" durumuna **olay** der. Düğmeye basılması, bırakılması, logoya dokunulması birer olaydır.\n\n### Olay bloğu: bir başlık bloğu\n**Düğme [A] [basılınca]** bloğu, **başlangıçta** gibi bir başlık bloğudur. Ama o hemen çalışmaz. Önce uyur. Olay gelince içindeki bloklar yukarıdan aşağıya çalışır, bitince blok yine uykuya döner. Aynı olay bir daha gelirse yeniden çalışır.\n\n### Üç düğme, üç an\nKartın üstünde iki düğme vardır. Sanal kartın altında bir de ikisine birden basan **A+B** düğmesi bulunur. Her düğme için üç an seçebilirsin:\n\n| An | Ne zaman çalışır |\n|---|---|\n| basılınca | Düğmeye bastığın an |\n| bırakılınca | Parmağını çektiğin an |\n| uzun basılınca | Basılı tutmaya başladıktan 1 saniye sonra |\n\nYani bir kısa basış iki olay üretir: önce basılınca, sonra bırakılınca.\n\n### A+B özel bir düğmedir\nA ve B birlikte basılı olunca kart bunu **ayrı bir düğme** sayar. O zaman A'nın ya da B'nin kendi bloğu değil, yalnızca A+B bloğu çalışır. Önce A'ya, sonra B'ye basarsan A'nın bloğu çoktan çalışmış olabilir. İkisine aynı anda basmak için sanal kartın altındaki **A+B** düğmesini kullan.\n\n### Her olay kendi bloğunda yaşar\nBir programda istediğin kadar olay bloğu olabilir. Biri A, biri B, biri A+B için yazılmış üç blok birbirinden bağımsızdır. Dikkat: iki bloğun listesinde de **A** seçili kalırsa ikisi de A'ya tepki verir, B'ye hiçbir şey olmaz. Düğme listesi, bloğun \"adresidir\".\n\n### Özet\nOlay, \"bir şey olunca şunu yap\" kuralıdır. Olay bloğu başlık bloğudur, uyur ve olay gelince çalışır. Her düğmenin basılınca, bırakılınca ve uzun basılınca anları vardır. A+B ayrı bir olaydır ve A ile B'nin bloklarını çalıştırmaz. Bir programda birden çok olay bloğu bulunabilir.",
          "concepts": [
            {
              "term": "Olay",
              "definition": "Kartın dışarıdan aldığı bir haber: bir düğmeye basılması, bırakılması ya da logoya dokunulması.",
              "example": "A düğmesine basıldığında kart bir \"A basıldı\" olayı alır.",
              "pitfall": "Programın her şeyi kendi başına baştan sona yaptığını sanmak; olay bloğu içi, olay gelene kadar çalışmaz."
            },
            {
              "term": "Olay bloğu",
              "definition": "Bir olay gelince içindeki blokları çalıştıran başlık bloğu; olay gelmeyince bekler.",
              "example": "düğme A basılınca bloğunun içine koyduğun simgeyi göster, yalnızca A'ya basınca çalışır.",
              "pitfall": "Blokları olay bloğunun dışında bırakmak: bağlı olmayan blok hiç çalışmaz ve soluk görünür."
            },
            {
              "term": "A+B düğmesi",
              "definition": "A ve B'ye birlikte basılınca doğan ayrı bir düğme olayı.",
              "example": "A+B bloğuna kalp koyarsan ikisine birden basınca kalp görünür.",
              "pitfall": "A'ya ve sonra B'ye ayrı ayrı basıp A+B bekleme; sanal kartın alt kısmındaki A+B düğmesini kullan."
            },
            {
              "term": "Basılınca, bırakılınca, uzun basılınca",
              "definition": "Bir düğmenin üç anı: bastığın an, parmağını çektiğin an, basılı tutmaya başladıktan 1 saniye sonra.",
              "example": "Bırakılınca seçersen simge, parmağını çektiğin anda görünür.",
              "pitfall": "İkinci listeyi değiştirmeyi unutmak ve bloğun hep basılınca çalıştığını görmek."
            },
            {
              "term": "Olayların bağımsızlığı",
              "definition": "Bir programda istediğin kadar olay bloğu olabilir ve her biri kendi düğmesini dinler.",
              "example": "A mutlu yüz, B üzgün yüz, A+B kalp gösterir; üçü aynı programda yaşar.",
              "pitfall": "İki bloğun düğme listesinde de A seçili bırakmak: iki blok da A'ya tepki verir, B'ye bastığında hiçbir şey olmaz."
            }
          ],
          "quiz": [
            {
              "id": "m10h2d6-q1",
              "kind": "mcq",
              "prompt": "Program çalışıyor ama hiçbir düğmeye basılmıyor. İçi dolu bir \"düğme A basılınca\" bloğuna ne olur?",
              "options": [
                "Sürekli baştan sona tekrar tekrar çalışır",
                "Bekler; A'ya basılınca içi bir kez çalışır",
                "Kart başlarken bir kez çalışır",
                "Kart hata verir çünkü basan yok"
              ],
              "answer": 1,
              "explanation": "Olay bloğu başlık bloğudur ve uyur. Olay gelince içi yukarıdan aşağıya bir kez çalışır, sonra yine bekler. Sürekli tekrar etmek \"sonsuza kadar\" bloğunun işidir; başlarken bir kez çalışmak \"başlangıçta\" bloğunundur.",
              "skills": [
                "mk-events"
              ]
            },
            {
              "id": "m10h2d6-q2",
              "kind": "predict-output",
              "prompt": "Bir programda şu üç olay bloğu var:\n\n```\ncard.onButton(\"A\", \"press\", () => { screen.showNumber(1); });\ncard.onButton(\"B\", \"press\", () => { screen.showNumber(2); });\ncard.onButton(\"AB\", \"press\", () => { screen.showNumber(3); });\n```\n\nSanal kartın altındaki A+B düğmesine basıyorsun. Ekranda ne görünür?",
              "options": [
                "1",
                "2",
                "3",
                "Önce 1, sonra 2 görünür"
              ],
              "answer": 2,
              "explanation": "A ve B birlikte basılınca kart bunu ayrı bir A+B olayı sayar ve yalnızca A+B bloğu çalışır. 1 ya da 2 görünmez, çünkü A ve B'nin kendi blokları çalışmaz.",
              "skills": [
                "mk-events"
              ]
            },
            {
              "id": "m10h2d6-q3",
              "kind": "find-bug",
              "prompt": "Ceylin, A'ya basınca mutlu yüz, B'ye basınca üzgün yüz görünsün istiyor. Ama B'ye basınca hiçbir şey olmuyor, A'ya basınca da mutlu yüz değil üzgün yüz görünüyor. Kodu:\n\n```\ncard.onButton(\"A\", \"press\", () => { screen.showIcon(\"happy\"); });\ncard.onButton(\"A\", \"press\", () => { screen.showIcon(\"sad\"); });\n```\n\nHata nedir?",
              "options": [
                "İkinci bloğun düğme listesi A kalmış, B olmalıydı",
                "showIcon yerine showNumber yazılmalıydı",
                "\"press\" yerine \"long\" yazılmalıydı",
                "İkinci bloğun süslü parantezi eksik"
              ],
              "answer": 0,
              "explanation": "İki bloğun da düğmesi A. A'ya basınca ikisi de çalışır, ikincisi sonra olduğu için üzgün yüz kalır. B'yi dinleyen blok yok. Düğme listesi bloğun adresidir. Diğer seçenekler bu belirtilere yol açmaz.",
              "skills": [
                "mk-events",
                "prog-debug"
              ]
            },
            {
              "id": "m10h2d6-q4",
              "kind": "numeric",
              "prompt": "Programında bir \"düğme A basılınca\" bloğu ve bir \"düğme A bırakılınca\" bloğu var. A'ya art arda 4 kez kısa basıp bırakıyorsun. İki bloğun içi toplam kaç kez çalışır?",
              "answer": 8,
              "unit": "kez",
              "explanation": "Her kısa basış iki olay üretir: basınca bir, bırakınca bir. 4 basış x 2 olay = 8. Sadece basılınca bloğunu sayıp 4 bulmak eksik olur.",
              "skills": [
                "mk-events"
              ]
            },
            {
              "id": "m10h2d6-q5",
              "kind": "mcq",
              "prompt": "Hangisi kartın A+B olayını üretir?",
              "options": [
                "A'ya basıp bırakmak, sonra B'ye basıp bırakmak",
                "A ve B'ye aynı anda basmak (sanal kartta alttaki A+B düğmesi)",
                "Yalnızca B'ye uzun basmak",
                "Logoya dokunmak"
              ],
              "answer": 1,
              "explanation": "A+B, iki düğmeye birlikte basılınca doğar. Birbiri ardına basmak iki ayrı olay üretir. Uzun basış B'nin bir an seçeneğidir, logo ise başka bir olay kaynağıdır.",
              "skills": [
                "mk-events"
              ]
            }
          ]
        },
        {
          "title": "Sayaç ve değişken",
          "durationMin": 25,
          "problem": "Bir otobüsün kapısında yolcu sayan bir görevli düşün. Her yolcuda parmağını bir kez kıvırıyor ve sayıyı aklında tutuyor. Peki kart sayıyı nerede tutar? Aklında değil, bir kutuda: değişken.",
          "contentMd": "### Değişken: etiketli kutu\n**Değişken**, üzerinde ad yazan bir kutudur. İçinde bir sayı ya da yazı saklar. Kutuya yeni değer koyabilirsin, içindekine bakabilirsin, içindeki sayıyı artırıp azaltabilirsin.\n\nEditörde **sayi** adında bir değişken zaten hazır. Kendi projelerinde yeni değişken yapmak için **Değişken** kategorisinde **Değişken oluştur...** düğmesine tıklarsın, bir ad yazarsın.\n\n**Değişken** kategorisindeki bloklar:\n\n- **sayi değerini [0] yap:** kutuya yeni bir sayı koyar.\n- **sayi değerine [1] ekle:** kutudaki sayıyı verilen kadar artırır (eksi sayı yazarsan azaltır).\n- **sayi:** kutunun içindeki sayıyı verir. Başka bir bloğun deliğine takılır.\n\n### Program: ziyaretçi sayacı\nEditörde **başlangıçta** ve üç **düğme** (A, B, A+B) blokları hazır.\n\n1. **başlangıçta** içine **Değişken** kategorisinden **sayi değerini [0] yap** bloğunu koy. Sıfır olduğundan emin ol.\n2. A bloğunun içine **sayi değerine [1] ekle** bloğunu tak.\n3. Altına **Temel** kategorisinden **sayıyı göster [0]** bloğunu ekle.\n4. Bu bloğun içindeki 0'ı sil: **Değişken** kategorisindeki **sayi** bloğunu tutup 0'ın üstüne bırak.\n5. B bloğunu aynı şekilde yap, ama **sayi değerine [-1] ekle** kullan.\n6. A+B bloğunun içine **sayi değerini [0] yap** koy, altına **sayıyı göster sayi** ekle.\n7. ▶ **Çalıştır**. A'ya üç kez bas, sonra B'ye bir kez, sonra A+B'ye bas.\n\n### Beklenen sonuç\nA'ya her basışta ekranda 1, 2, 3 görünür. B'ye basınca 2'ye iner. A+B ekranda 0 gösterir ve sayacı sıfırlar. Dört hedef de ✓ olmalı.\n\n### Nasıl çalışıyor?\n- **başlangıçta** bloğu sayacı sıfırlar. Böylece sayaç her çalıştırmada açıkça 0'dan başlar.\n- **sayi değerine 1 ekle** kutudaki sayıyı 1 artırır. Önce eski değeri okur, 1 ekler, yeni değeri geri koyar.\n- **sayıyı göster [sayi]** önce kutuya bakar, içindeki sayıyı alır, ekranda gösterir. Kutunun adı ekrana yazılmaz, içindeki sayı yazılır.\n- Sayı 10'a ulaşınca ekranda iki basamak olur ve sayı kayar. Eksi sayılar da eksi işaretiyle birlikte kayar.\n- **JavaScript** sekmesinde en üstte `let sayi = 0;` satırını göreceksin. Değişkenin kutusu orada oluşturuluyor.\n\n### Dene\n1. A'yı 12 kez art arda bas. Ekranda iki basamaklı sayı nasıl görünüyor?\n2. B'ye başlangıçta basarsan sayaç ne yapar? Sıfırın altına inebilir mi?\n3. **sayi değerine [1] ekle** bloğundaki 1'i 5 yap. Sayaç beşer beşer sayıyor.\n\n### Sık yapılan hatalar\n- **Sayıyı göstermeyi unutmak.** Değişken kutusu değişir ama bir **sayıyı göster** bloğu olmazsa ekranda bir şey görmezsin.\n- **Sıfırlamayı başlangıçta yapmamak.** Kart, hiç değer verilmemiş bir değişkeni 0 sayar. Yine de başlangıçta açıkça 0 yazmak programı okuyanın neyle başladığını görmesini sağlar.\n- **Çok hızlı basmak.** Sayıyı göstermek bir süre alır. Çok hızlı art arda basarsan basışların bir kısmı kuyrukta bekler ya da atlanabilir. Biraz yavaş bas.",
          "question": "Değişken olmasaydı kart sayıyı nasıl hatırlardı? Kendi hayatından, değerini sürekli değiştirdiğin bir şey düşün: oyundaki puanın ya da cebindeki para gibi. Onu hangi adla bir kutuya koyardın?",
          "explainerMd": "### Bu derste öğreneceklerin\n- **Değişken** nedir ve neden \"etiketli kutu\" diye düşünürüz\n- Kutuya değer koymayı, kutudaki değeri artırıp azaltmayı\n- Kutunun içindeki sayıyı ekranda göstermeyi\n- Sayaç programının nasıl çalıştığını\n\n### Önceden bilmen gerekenler\n- Ders 6: düğme olayları (A, B ve A+B bloklarının içine iş koymak)\n- Ders 1-5: **sayıyı göster** bloğu ve **başlangıçta** başlık bloğu\n\n### Kart neleri hatırlar?\nOlay bitince bloğun içindeki her şey unutulur. A'ya ikinci kez bastığında kart ilk basışı kendiliğinden bilmez. Onu bir yere yazman gerekir. İşte bu yer **değişken**dir.\n\n### Değişken: ada sahip kutu\nDeğişken, üstünde adı yazan bir kutudur. Kutuda hep tek bir değer durur. Kutuya yeni değer koyunca eskisi silinir. Adı sen seçersin: **sayi**, **puan**, **zar**. Ad, içinde ne olduğunu anlatmalıdır.\n\n### Kutuyla yapılabilen üç şey\n| Blok | Ne yapar | Örnek (kutu 4'ken) |\n|---|---|---|\n| sayi değerini [7] yap | Eskisini siler, yenisini koyar | Kutu 7 olur |\n| sayi değerine [3] ekle | Mevcut sayıya ekler | Kutu 7 olur |\n| sayi | İçindekini okur | 4 verir |\n\nEksi sayı eklersen kutudaki sayı azalır: 4'e -1 eklersen 3 olur.\n\n### Kutunun adı mı, içi mi?\n**sayıyı göster [sayi]** bloğunda ekrana kutunun adı değil içindeki sayı yazılır. Kutu 3'se ekranda 3 görünür. Ayrıca değişkeni değiştirmek ekranı değiştirmez. Ekranda görmek istiyorsan sayıyı göster bloğunu da kullanman gerekir.\n\n### Başlangıç değeri\nProgramın başında kutuya bilerek bir değer koymak iyi alışkanlıktır. **Başlangıçta** bloğuna **sayi değerini 0 yap** koyarsan her ▶ düğmesinde sayaç sıfırdan başlar. Programı okuyan kişi de neyle başladığını görür.\n\n### Sayaç nasıl çalışır?\nA'ya basılınca şu üç şey sırayla olur: kart kutuya bakar, 1 ekler, yeni sayıyı kutuya koyar. Sonra ekranda gösterir. İlk basışta 0 + 1 = 1, ikincide 1 + 1 = 2 olur. Her basış, bir önceki basıştan kalan sayıyı kullanır. Olaylar arasındaki köprüyü değişken kurar.\n\n### Özet\nDeğişken, adı olan ve tek değer tutan bir kutudur. Değerini yap, ekle ve oku bloklarıyla yönetirsin. Ekranda görmek için sayıyı göster bloğu gerekir. Programın başında kutuyu sıfırlamak sayaçların düzenli çalışmasını sağlar. Sayaç, her olayda kutudaki eski değeri okuyup üstüne ekleyen bir programdır.",
          "concepts": [
            {
              "term": "Değişken",
              "definition": "Adı olan ve içinde tek bir değer saklayan kutu; olay bitse bile değer orada kalır.",
              "example": "sayi adlı kutu, A'ya her basışta bir önceki sayıyı hatırlar.",
              "pitfall": "Değişkeni yalnızca bir etiket sanmak; içindeki değer değişir ve eskisi silinir."
            },
            {
              "term": "değerini yap",
              "definition": "Kutuya yeni bir değer koyar; eski değer silinir.",
              "example": "sayi değerini 0 yap, sayaçı sıfırlar.",
              "pitfall": "\"değerini yap\" ile \"değerine ekle\" karıştırmak: yap eskisini siler, ekle üstüne ekler."
            },
            {
              "term": "değerine ekle",
              "definition": "Kutudaki sayıyı verilen kadar artırır; eksi sayı verirsen azaltır.",
              "example": "sayi 4 iken değerine -1 ekle yapınca sayi 3 olur.",
              "pitfall": "Azaltmak için ayrı blok aramak; eksi bir sayı eklemek yeterlidir."
            },
            {
              "term": "Başlangıç değeri",
              "definition": "Program başlarken kutuya bilerek koyduğun ilk değer.",
              "example": "başlangıçta bloğunda sayi değerini 0 yap, her ▶ çalıştırmada sayacı sıfırdan başlatır.",
              "pitfall": "Başlangıç değerini yazmamak; kart yine 0 sayar ama programı okuyan neyle başladığını görmez."
            },
            {
              "term": "Değişkeni göstermek",
              "definition": "sayıyı göster bloğuna sayi bloğunu takarsan ekranda kutunun içindeki sayı görünür, adı değil.",
              "example": "sayi 3 iken sayıyı göster [sayi] ekranda 3 gösterir.",
              "pitfall": "Kutuyu değiştirip göster bloğunu koymamak: değişken artar ama ekranda hiçbir şey görmezsin."
            }
          ],
          "quiz": [
            {
              "id": "m10h2d7-q1",
              "kind": "mcq",
              "prompt": "Kutu 4 iken \"sayi değerine [3] ekle\" bloğu çalışırsa kutuda ne olur?",
              "options": [
                "Kutuda 3 olur, 4 silinir",
                "Kutuda 7 olur",
                "Kutuda 4 kalır, ekranda 3 görünür",
                "Kutuda 12 olur"
              ],
              "answer": 1,
              "explanation": "\"Ekle\" mevcut sayıya ekler: 4 + 3 = 7. Kutuyu 3 yapmak \"değerini yap\" bloğunun işidir. Ekle bloğu ekranı değiştirmez, çarpma da yapmaz.",
              "skills": [
                "mk-variables"
              ]
            },
            {
              "id": "m10h2d7-q2",
              "kind": "predict-output",
              "prompt": "Başlangıçta sayi = 0. Bu program çalışırken sırayla A, A, B, A düğmelerine basılıyor:\n\n```\ncard.onButton(\"A\", \"press\", () => {\n  sayi += 2;\n  screen.showNumber(sayi);\n});\ncard.onButton(\"B\", \"press\", () => {\n  sayi += -1;\n  screen.showNumber(sayi);\n});\n```\n\nSon basıştan sonra ekranda hangi sayı görünür?",
              "options": [
                "3",
                "4",
                "5",
                "6"
              ],
              "answer": 2,
              "explanation": "0 → A: 2 → A: 4 → B: 3 → A: 5. Her basış kutudaki son değerden devam eder. Son basış A olduğu için ekranda 5 görünür. 3 bulmak, son A basışını atlamak olur.",
              "skills": [
                "mk-variables",
                "mk-events"
              ]
            },
            {
              "id": "m10h2d7-q3",
              "kind": "find-bug",
              "prompt": "Baran'ın sayacı ilk basışta 0, ikinci basışta 1 gösteriyor; yani hep bir geriden geliyor:\n\n```\ncard.onButton(\"A\", \"press\", () => {\n  screen.showNumber(sayi);\n  sayi += 1;\n});\n```\n\nSorun nerede?",
              "options": [
                "Gösterme, artırmadan önce yapılıyor; iki satırın sırası ters",
                "sayi değişkeni hiç tanımlanmamış",
                "+= 1 yerine -= 1 yazılmalı",
                "showNumber yerine showText gerekli"
              ],
              "answer": 0,
              "explanation": "Ekrana yazılan sayı, artırmadan önceki değerdir. Önce artırıp sonra göstermek gerekir. Değişken tanımlı, işaret doğru, sayıyı göstermek için showNumber yeterli.",
              "skills": [
                "mk-variables",
                "prog-debug"
              ]
            },
            {
              "id": "m10h2d7-q4",
              "kind": "numeric",
              "prompt": "sayi başlangıçta 0. A bloğu \"sayi değerine 5 ekle\", B bloğu \"sayi değerine -2 ekle\" yapıyor. A'ya 3 kez, B'ye 4 kez basarsan sayi kaç olur?",
              "answer": 7,
              "explanation": "A'dan 3 x 5 = 15 eklenir, B'den 4 x (-2) = -8 eklenir. 15 - 8 = 7. Basışların sırası sonucu değiştirmez, çünkü hepsi toplamdır.",
              "skills": [
                "mk-variables"
              ]
            },
            {
              "id": "m10h2d7-q5",
              "kind": "mcq",
              "prompt": "Programında A'ya basınca \"sayi değerine 1 ekle\" var ama hiç \"sayıyı göster\" bloğu yok. A'ya basarsan ne olur?",
              "options": [
                "Değişken artar ama ekranda hiçbir şey görmezsin",
                "Değişken artmaz",
                "Kart hata verir",
                "Ekranda otomatik olarak sayi görünür"
              ],
              "answer": 0,
              "explanation": "Değişkeni değiştirmek ekranı değiştirmez. Kutu artar, ama görmek için sayıyı göster bloğu gerekir. Kart bu durumda hata vermez.",
              "skills": [
                "mk-variables",
                "mk-events"
              ]
            }
          ]
        },
        {
          "title": "Elektronik zar",
          "durationMin": 25,
          "problem": "Zar atınca ne geleceğini kimse bilmez; işte bu yüzden oyunlar heyecanlıdır. Bilgisayarlar da \"rastgele\" sayı üretebilir. Peki kartın içine bir zar yerleştirsek, 6 gelince bir sürpriz olsun mu?",
          "contentMd": "### Rastgele sayı\n**Matematik** kategorisindeki **[1] ile [6] arasında rastgele sayı** bloğu, her çalıştığında bu iki sayı arasında (uçlar dahil) rastgele bir tam sayı verir. Bir zarın yüzleri gibi: 1, 2, 3, 4, 5 ya da 6.\n\n### Soru sormak: eğer\n**Mantık** kategorisindeki **eğer ... ise** bloğu bir soruya göre karar verir. Soru doğruysa içindeki bloklar çalışır, değilse atlanır. Soru için aynı kategorideki **karşılaştırma** bloğunu kullanırsın. Orta kısmında **=**, **≠**, **<**, **≤**, **>**, **≥** seçenekleri bulunan bir bloktur.\n\nDikkat: **zar değerini 6 yap** bir **atamadır**: kutuya 6 koyar. **zar = 6** ise bir **sorudur**: kutuda 6 var mı? Cevabı doğru ya da yanlıştır.\n\n### Program: zar at, 6'da kalp göster\nEditörde A düğmesinin bloğu hazır.\n\n1. **Değişken** kategorisinde **Değişken oluştur...** düğmesine tıkla. Adı **zar** yaz.\n2. **Değişken** kategorisinden **zar değerini [0] yap** bloğunu A'nın içine koy.\n3. **Matematik** kategorisinden **[1] ile [6] arasında rastgele sayı** bloğunu al ve \"0\"ın yerine bırak.\n4. Altına **Temel** kategorisinden **sayıyı göster** bloğunu tak. İçindeki sayıyı **zar** bloğuyla değiştir.\n5. **Mantık** kategorisinden **eğer ... ise** bloğunu al ve en alta tak.\n6. Karşılaştırma bloğunu eğer'in \"eğer\" yuvasına tak. Sol deliğe **zar** bloğunu, sağ deliğe 6 koy. Ortadaki işaretin **=** olduğundan emin ol.\n7. Eğer'in içine **simgeyi göster** bloğunu koy ve **kalp** seç.\n8. ▶ **Çalıştır**. A'ya basarak zar at. 6 çıkana kadar devam et.\n\n### Beklenen sonuç\nA'ya her basışta ekranda 1 ile 6 arası bir rakam yarım saniye kadar görünür. 6 gelince rakam kaybolduktan sonra ekranda kalp belirir. Dört hedef de ✓ olmalı.\n\n### Nasıl çalışıyor?\n- Rastgele sayıyı **bir kez** üretip **zar** kutusuna koyuyoruz. Böylece hem ekranda gösterdiğimiz hem de karşılaştırdığımız sayı aynıdır.\n- Her **rastgele sayı** bloğu çalıştığında yeni bir sayı üretir. Gösterme ve karşılaştırma için iki ayrı rastgele blok kullansaydık, gösterdiğimiz ve karşılaştırdığımız sayılar birbirinden farklı çıkabilirdi.\n- Eğer bloğu, sayı gösterme bittikten sonra çalışır. Rakam yarım saniye durur, sonra kalp görünür.\n- **JavaScript** sekmesinde `zar = randomInt(1, 6);` ve `if (zar == 6)` satırlarını göreceksin.\n\n### Dene\n1. Zarı 1 ile 20 arası yap. Kalbi hangi sayıda göstermek istersin?\n2. **Mantık** kategorisinde **eğer** bloğunun iki çeşidi var: biri yalnızca **ise**, diğeri **ise ... değilse**. İkincisini al: 6 gelince kalp, gelmezse üzgün yüz göster.\n3. A'ya 10 kez bas ve kaç kere 6 geldiğini say. Sence 6 ne sıklıkta gelmeli?\n\n### Sık yapılan hatalar\n- **Tek eşit işaretini karıştırmak.** **zar değerini 6 yap** zarı hep 6 yapar. Karşılaştırma bloğunda **=** seçili olmalı.\n- **Aynı zar için iki rastgele blok kullanmak.** Rakamı ve karşılaştırmayı aynı kutudan (zar) al.\n- **Kalbi göremeyip hata sanmak.** 6 gelmeyince kalp hiç görünmez. Birkaç kez daha bas.",
          "question": "Gerçek bir zarla bilgisayardaki rastgele sayı arasında ne fark olabilir? Aynı sayıyı art arda iki kez görürsen bu hata mıdır, yoksa rastgeleliğin bir parçası mı?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Rastgele sayı bloğunun ne verdiğini ve neden her seferinde farklı sayı geldiğini\n- **Eğer ... ise** bloğuyla programa karar verdirmeyi\n- Atama ile karşılaştırma arasındaki farkı\n- Bir rastgele sonucu değişkende saklamanın neden önemli olduğunu\n\n### Önceden bilmen gerekenler\n- Ders 6: düğme olayları\n- Ders 7: değişken oluşturmak, değerini yapmak, değişkeni bloğun deliğine takmak\n- Ders 1-5: **sayıyı göster** ve **simgeyi göster** blokları\n\n### Rastgele sayı: kartın zarı\n**[1] ile [6] arasında rastgele sayı** bloğu her çalıştığında 1, 2, 3, 4, 5 ya da 6 verir. Uçlar dahildir, yani 1 de 6 da gelebilir. 0 ya da 7 asla gelmez. Hangi sayının geleceğini ne sen ne de kart önceden bilir. Adil bir zarda her yüz aynı şansa sahiptir: 6 gelme şansı altıda birdir.\n\n### Aynı zarı iki kez atma\nRastgele blok her çalıştığında **yeni** bir zar atar. Önce ekranda göstermek, sonra 6 olup olmadığına bakmak için iki ayrı blok koyarsan iki ayrı zar atmış olursun. Ekranda 3 görürken kart 6 görmüş olabilir. Çözüm: zarı bir kez at, sonucu **zar** adlı kutuya koy. Gösterirken de karşılaştırırken de kutuyu kullan.\n\n```\nzar = randomInt(1, 6);\nscreen.showNumber(zar);\nif (zar == 6) { ... }\n```\n\n### Eğer ... ise: soru sormak\n**Eğer** bloğu bir soru sorar. Cevap doğruysa içindeki bloklar çalışır, yanlışsa bloğun içi atlanır ve program aşağıdan devam eder. Sorular **karşılaştırma** bloğuyla sorulur: **=**, **≠**, **<**, **≤**, **>**, **≥**. Karşılaştırmanın sonucu \"doğru\" ya da \"yanlış\"tır.\n\n| Soru | zar 6'yken | zar 4'ken |\n|---|---|---|\n| zar = 6 | doğru | yanlış |\n| zar > 4 | doğru | yanlış |\n| zar ≥ 4 | doğru | doğru |\n| zar ≠ 6 | yanlış | doğru |\n\n### Atama ve karşılaştırma farklıdır\n**zar değerini 6 yap** bir emirdir: kutuya 6 koyar. **zar = 6** ise bir sorudur: kutuda 6 var mı? Emir kutuyu değiştirir, soru değiştirmez. Karıştırırsan zar hep 6 gelir.\n\n### Eğer ve değilse\nEğer bloğuna \"değilse\" kolu ekleyebilirsin. Soru doğruysa üst kol, yanlışsa alt kol çalışır; ikisi birden çalışmaz. 6 gelince kalp, gelmeyince üzgün yüz göstermek buna örnektir.\n\n### Özet\nRastgele sayı bloğu her çalışışında yeni bir tam sayı üretir, uçlar dahildir. Bir sonucu birkaç yerde kullanacaksan değişkende sakla. Eğer bloğu karşılaştırma sorusuna göre içini çalıştırır ya da atlar. Yap emri kutuyu değiştirir, = sorusu kutuya bakar. Değilse kolu iki seçenekten tam birini çalıştırır.",
          "concepts": [
            {
              "term": "Rastgele sayı",
              "definition": "Belirlediğin iki sayı arasından (uçlar dahil) her çalışışında önceden bilinemeyen bir tam sayı veren blok.",
              "example": "1 ile 6 arasında rastgele sayı, zar atmak gibidir: 1, 2, 3, 4, 5 ya da 6 gelir.",
              "pitfall": "Aynı sayının art arda gelmesini hata sanmak; rastgelelikte bu olabilir."
            },
            {
              "term": "eğer ... ise",
              "definition": "Bir soruya bakar; cevap doğruysa içindeki blokları çalıştırır, yanlışsa atlar.",
              "example": "eğer zar = 6 ise kalp göster: yalnızca 6 gelince kalp görünür.",
              "pitfall": "Kalbi göremeyince hata sanmak; soru yanlışsa blok bilerek atlanır."
            },
            {
              "term": "Karşılaştırma",
              "definition": "İki değeri =, ≠, <, ≤, > ya da ≥ ile karşılaştırıp doğru ya da yanlış sonucu veren blok.",
              "example": "zar > 4 sorusu 5 ve 6'da doğru, diğerlerinde yanlıştır.",
              "pitfall": "> ile ≥ karıştırmak: zar > 4 ise 4 gelince doğru olmaz, zar ≥ 4 ise olur."
            },
            {
              "term": "Atama ve karşılaştırma farkı",
              "definition": "\"değerini yap\" kutuya değer koyan bir emirdir; \"=\" ise kutuyu değiştirmeyen bir sorudur.",
              "example": "zar değerini 6 yap kutuya 6 koyar; zar = 6 \"kutuda 6 var mı?\" diye sorar.",
              "pitfall": "Soru yerine atama kullanmak: zar hep 6 olur ve kalp her seferinde görünür."
            },
            {
              "term": "Sonucu değişkende saklamak",
              "definition": "Rastgele sayıyı bir kez üretip kutuya koymak ve her yerde kutuyu kullanmak.",
              "example": "zar = randomInt(1, 6); sonra hem showNumber(zar) hem if (zar == 6) yazılır.",
              "pitfall": "Gösterme ve karşılaştırma için iki ayrı rastgele blok kullanmak: iki farklı zar atılır."
            }
          ],
          "quiz": [
            {
              "id": "m10h2d8-q1",
              "kind": "mcq",
              "prompt": "\"[1] ile [6] arasında rastgele sayı\" bloğu hangi sayıları verebilir?",
              "options": [
                "Yalnızca 2, 3, 4, 5",
                "1, 2, 3, 4, 5 ve 6 (uçlar dahil)",
                "0'dan 6'ya kadar",
                "1'den 7'ye kadar"
              ],
              "answer": 1,
              "explanation": "Blok iki ucu da içeren tam sayılardan birini seçer: 1 ve 6 da gelebilir. 0 ve 7 aralığın dışındadır.",
              "skills": [
                "mk-random"
              ]
            },
            {
              "id": "m10h2d8-q2",
              "kind": "find-bug",
              "prompt": "Defne'nin zarı bazen 3 gösterip kalbi de gösteriyor, bazen 6 gösterip kalp çıkarmıyor:\n\n```\ncard.onButton(\"A\", \"press\", () => {\n  screen.showNumber(randomInt(1, 6));\n  if (randomInt(1, 6) == 6) {\n    screen.showIcon(\"heart\");\n  }\n});\n```\n\nSorun nedir?",
              "options": [
                "Gösterilen ve karşılaştırılan sayı iki ayrı rastgele atıştan geliyor; sonucu bir değişkene koyup ikisinde de onu kullanmalı",
                "showIcon yanlış yazılmış",
                "== yerine += yazılmalı",
                "6 yerine 7 yazılmalı, çünkü zar 7'ye kadar gider"
              ],
              "answer": 0,
              "explanation": "Her rastgele blok yeni bir zar atar. Ekranda görünen sayı ile if'in baktığı sayı birbirinden bağımsızdır. Çözüm: zar = randomInt(1, 6) yazıp showNumber(zar) ve if (zar == 6) kullanmak. == karşılaştırma için doğru işarettir ve zarın en büyük değeri 6'dır.",
              "skills": [
                "mk-random",
                "mk-variables",
                "prog-debug"
              ]
            },
            {
              "id": "m10h2d8-q3",
              "kind": "numeric",
              "prompt": "Adil bir zarın her yüzü aynı şansa sahip, yani 6 gelme olasılığı altıda bir. Zarı 60 kez atarsan ortalama kaç kez 6 beklersin?",
              "answer": 10,
              "unit": "kez",
              "explanation": "60 atışın altıda biri 60 / 6 = 10 eder. Gerçek sayı 8 ya da 12 olabilir; 10 ortalama beklentidir, kesin sonuç değil.",
              "skills": [
                "mk-random"
              ]
            },
            {
              "id": "m10h2d8-q4",
              "kind": "predict-output",
              "prompt": "A'ya basılınca bu kod çalışıyor:\n\n```\ncard.onButton(\"A\", \"press\", () => {\n  zar = 5;\n  screen.showNumber(zar);\n  if (zar > 5) {\n    screen.showIcon(\"heart\");\n  }\n});\n```\n\nEkranda ne olur?",
              "options": [
                "Önce 5 görünür, sonra kalp gelir",
                "Yalnız 5 görünür, kalp hiç görünmez",
                "Yalnız kalp görünür",
                "Hiçbir şey görünmez"
              ],
              "answer": 1,
              "explanation": "5 > 5 yanlıştır, çünkü 5, 5'ten büyük değildir; eğer'in içi atlanır ve kalp görünmez. Kalbi görmek için zar ≥ 5 gerekirdi. Rakam ise showNumber ile gösterilir.",
              "skills": [
                "mk-conditions",
                "mk-variables"
              ]
            },
            {
              "id": "m10h2d8-q5",
              "kind": "mcq",
              "prompt": "\"zar değerini 6 yap\" ile \"zar = 6\" arasındaki fark nedir?",
              "options": [
                "Aynı şeydir",
                "İlki kutuya 6 koyar (emir), ikincisi kutuda 6 olup olmadığını sorar (soru)",
                "İlki soru sorar, ikincisi kutuya 6 koyar",
                "İkisi de ekranda 6 gösterir"
              ],
              "answer": 1,
              "explanation": "Atama kutunun değerini değiştirir. Karşılaştırma değiştirmeden bakar ve doğru ya da yanlış verir. Karıştırırsan zar hep 6 olur. Hiçbiri ekrana yazmaz; ekran için sayıyı göster gerekir.",
              "skills": [
                "mk-conditions",
                "mk-variables"
              ]
            }
          ]
        },
        {
          "title": "Logo, uzun basış ve gizli düğmeler",
          "durationMin": 20,
          "problem": "Bazı oyuncaklarda gizli bir düğme vardır; yalnızca doğru yere dokunduğunda ya da bir süre bastığında açılır. Kartın üstündeki yıldız şeklindeki logo da dokunmaya duyarlı bir düğmedir. Bu derste kartına gizli kapılar ekleyeceksin.",
          "contentMd": "### Logo: dokunmatik yıldız\nKartın üstündeki yıldız şekilli logo bir **dokunmatik düğmedir**. Sanal kartta fareyle üzerine basıp basılı tutarsan \"dokunulmuş\" olur, bırakırsan \"bırakılmış\" olur.\n\n**Giriş** kategorisinde şu blok var:\n\n- **logoya [dokununca]:** logo dokunulduğu an çalışır. Listeden **bırakılınca** seçersen parmağını çektiğin an çalışır.\n\n### Uzun basış\nDaha önce **düğme [A] [basılınca]** bloğunun ikinci listesine bakmıştın. Bu listede üç seçenek vardı: **basılınca**, **bırakılınca**, **uzun basılınca**. **uzun basılınca** seçeneği, düğmeyi **1 saniye boyunca basılı** tuttuğunda çalışır.\n\n### Program: gizli düğmeler\nEditörde üç olay bloğu hazır: biri **logoya dokununca**, biri **logoya bırakılınca**, biri **düğme A uzun basılınca**.\n\n1. **logoya dokununca** bloğunun içine **Temel** kategorisinden **simgeyi göster** koy ve **kalp** seç.\n2. **logoya bırakılınca** bloğunun içine **Temel** kategorisinden **ekranı temizle** bloğunu koy.\n3. **düğme A uzun basılınca** bloğunun içine **simgeyi göster** koy ve **uyuyan yüz** seç.\n4. ▶ **Çalıştır**.\n5. Sanal kartta logonun üzerine fareyle bas, basılı tut: kalp görünecek. Bırak: ekran sönecek.\n6. A düğmesini 1 saniye ya da daha uzun süre basılı tut.\n\n### Beklenen sonuç\nLogoya dokununca kalp görünür, çekince ekran söner. A'ya bir saniyeden uzun basınca uyuyan yüz çıkar. Dört hedef de ✓ olmalı.\n\n### Nasıl çalışıyor?\n- Logo da bir olay kaynağıdır, tıpkı A ve B düğmeleri gibi: dokunulunca ve bırakılınca iki ayrı olay doğurur.\n- A düğmesine kısa basarsan bu programda hiçbir şey olmaz. Çünkü sadece **uzun basılınca** bloğu yazdık.\n- Uzun basış, düğmeye bastığın andan **1 saniye** sonra tetiklenir. Bir saniye dolmadan bırakırsan uzun basış olmaz.\n- Aynı düğme için **basılınca** ve **uzun basılınca** blokları bir arada olabilir. Uzun basarsan ikisi de çalışır: önce kısa, bir saniye sonra uzun.\n\n### Dene\n1. Logoya dokununca **mutlu yüz**, bırakınca **üzgün yüz** göster. Logo bir ruh hali düğmesi gibi.\n2. A'nın **basılınca** bloğunu da ekle: bir yüz göstersin. Uzun basınca iki farklı şey görüyor musun?\n3. B için de bir **uzun basılınca** bloğu yap: ekranı temizlesin. Kartı sıfırlayan gizli bir düğme olsun.\n\n### Sık yapılan hatalar\n- **Logo bloğundaki listeyi değiştirmemek.** İkisinde de **dokununca** seçili kalırsa **ekranı temizle** bloğu çalışmaz.\n- **Uzun basış için çok kısa basmak.** Tam 1 saniye basılı tutman gerekir. Sanal düğmeyi basılı tut, çabuk bırakma.\n- **Logoyu tıklayıp hemen bırakmak.** Kalp bir anlığına görünür ve söner. Basılı tutarsan kalp ekranda durur.",
          "question": "Telefonlarda ya da oyuncaklarda uzun basmak hangi işlere yarar? Kısa basış ile uzun basışa neden farklı görevler vermek isteriz?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Kartın üstündeki logonun da bir düğme gibi olay verdiğini\n- **Dokununca** ve **bırakılınca** olaylarının farkını\n- Uzun basış olayının ne zaman çalıştığını\n- Aynı düğmeye hem kısa hem uzun basış görevi vermeyi\n\n### Önceden bilmen gerekenler\n- Ders 6: düğme olayı bloğu ve basılınca, bırakılınca, uzun basılınca listesi\n- Ders 3: **simgeyi göster**; Ders 2: **ekranı temizle**\n\n### Logo: dokunmatik yıldız\nKartın üstündeki yıldız şekilli logo dokunmaya duyarlıdır. Sanal kartta fareyle basılı tutarsan \"dokunuldu\", bırakırsan \"bırakıldı\" sayılır. Logonun iki olayı vardır:\n\n| Olay | Ne zaman |\n|---|---|\n| dokununca | Parmağın logoya değdiği an |\n| bırakılınca | Parmağın logodan ayrıldığı an |\n\nDüğmelerle aynı mantık: iki ayrı bloğa iki ayrı görev verebilirsin. Dokununca kalp, bırakınca ekranı temizle gibi.\n\n### Süre: 1 saniye\n**Uzun basılınca** olayı, düğmeye bastığın andan **1 saniye (1000 ms)** sonra, düğme hâlâ basılıysa çalışır. 0,9 saniye basıp bırakırsan olay hiç gelmez. Bir kez çalıştıktan sonra düğmeyi daha uzun tutsan da yeniden çalışmaz.\n\n### Bir basışta kaç olay?\nBir düğmeye hem **basılınca**, hem **uzun basılınca**, hem **bırakılınca** bloğu yazarsan, çok uzun bir basış üçünü de tetikler. Sırası şöyledir:\n\n```\nt = 0 ms     basılınca çalışır\nt = 1000 ms  uzun basılınca çalışır\nt = 2500 ms  (parmak çekilir) bırakılınca çalışır\n```\nKısa bir basışta (diyelim 300 ms) yalnızca basılınca ve bırakılınca çalışır; uzun olay gelmez.\n\n### Gizli düğme fikri\nUzun basış, yanlışlıkla çalışmaması gereken işler için uygundur. Oyuncakların \"sıfırla\" düğmeleri bu yüzden çoğu zaman uzun basılır. Bir şeyi kolay yapmak istiyorsan kısa basışa, ciddi bir işi korumak istiyorsan uzun basışa ver.\n\n### Dikkat edilecekler\n- Her blokta doğru listeyi seç. İki bloğun ikisinde de **dokununca** kalırsa ikisi de dokunmada çalışır.\n- Bir ekran işlemi diğerinin üstüne yazar: sonra çalışan blok görünür.\n\n### Özet\nLogo, A ve B gibi bir olay kaynağıdır ve dokununca ile bırakılınca olayı verir. Uzun basılınca olayı, düğme 1 saniye basılı kalırsa bir kez gelir. Kısa basış basılınca ve bırakılınca üretir, uzun basış bunlara bir de uzun olayını ekler. Her olay kendi bloğuna görev verir; doğru listeyi seçmek önemlidir.",
          "concepts": [
            {
              "term": "Logo",
              "definition": "Kartın üstündeki yıldız şekilli, dokunmaya duyarlı alan; düğme gibi olay verir.",
              "example": "Sanal kartta fareyle logoya basılı tutmak \"dokunuldu\" sayılır.",
              "pitfall": "Logoyu yalnızca süs sanmak; olay kaynağıdır."
            },
            {
              "term": "dokununca ve bırakılınca (logo)",
              "definition": "Logonun iki olayı: parmak değince ve parmak ayrılınca.",
              "example": "dokununca kalp göster, bırakılınca ekranı temizle: kalp, basılı tuttuğun sürece durur.",
              "pitfall": "İki bloğun ikisinde de dokununca seçili bırakmak; temizleme bloğu bırakınca değil dokunmada çalışır."
            },
            {
              "term": "Uzun basış",
              "definition": "Düğme 1 saniye (1000 ms) basılı kalırsa bir kez gelen olay.",
              "example": "A'yı 1,2 saniye basılı tutunca uyuyan yüz görünür.",
              "pitfall": "0,5 saniye basıp uzun basış beklemek; 1 saniye dolmadan bırakılırsa olay hiç gelmez."
            },
            {
              "term": "Kısa ve uzun basışı birlikte kullanmak",
              "definition": "Aynı düğmeye hem basılınca hem uzun basılınca bloğu yazılabilir; uzun basışta ikisi de çalışır.",
              "example": "Önce bastığın an kısa blok, 1 saniye sonra uzun blok çalışır.",
              "pitfall": "Uzun basışta yalnız uzun bloğun çalışacağını sanmak; basılınca bloğu zaten çoktan çalışmıştır."
            },
            {
              "term": "Gizli düğme",
              "definition": "Yanlışlıkla basılmasın diye kısa değil uzun basışa ya da logoya bağlanan görev.",
              "example": "B'ye uzun basınca ekranı temizleyen bir sıfırlama düğmesi.",
              "pitfall": "Önemli görevi kısa basışa bağlamak; yanlışlıkla çalışabilir."
            }
          ],
          "quiz": [
            {
              "id": "m10h2d9-q1",
              "kind": "mcq",
              "prompt": "\"Düğme A uzun basılınca\" bloğunun içi ne zaman çalışır?",
              "options": [
                "A'ya her bastığında",
                "A'dan parmağını çektiğinde",
                "A'ya bastıktan 1 saniye sonra, düğme hâlâ basılıysa",
                "A'ya basıp 1 saniye sonra bıraktığında"
              ],
              "answer": 2,
              "explanation": "Uzun basış, basılı tutmaya başladıktan 1 saniye sonra, düğme hâlâ basılıyken gelir; parmağını çekmeyi beklemez. Çekmek ayrı bir olaydır: bırakılınca.",
              "skills": [
                "mk-input-timing"
              ]
            },
            {
              "id": "m10h2d9-q2",
              "kind": "numeric",
              "prompt": "Her blok toplam değişkenine 1 ekliyor. Programda A için \"basılınca\", \"uzun basılınca\" ve \"bırakılınca\" bloklarının üçü de var. t = 0'da A'ya basıp t = 3000 ms'de bırakıyorsun. Toplam kaç olur?",
              "answer": 3,
              "explanation": "Basınca bir kez, 1 saniye dolunca uzun basış bir kez, bırakınca bir kez: 3 olay. Uzun basış, düğme basılı kaldıkça tekrar etmez.",
              "skills": [
                "mk-input-timing",
                "mk-variables"
              ]
            },
            {
              "id": "m10h2d9-q3",
              "kind": "predict-output",
              "prompt": "Programda iki logo bloğu var:\n\n```\ncard.onLogo(\"touch\", () => { screen.showIcon(\"heart\"); });\ncard.onLogo(\"release\", () => { screen.clear(); });\n```\n\nt = 0 s'de logoya dokunuyorsun, t = 2 s'de parmağını çekiyorsun. t = 1 s ve t = 3 s'de ekran nasıl görünür?",
              "options": [
                "1. saniyede kalp, 3. saniyede boş ekran",
                "İkisinde de kalp",
                "1. saniyede boş ekran, 3. saniyede kalp",
                "İkisinde de boş ekran"
              ],
              "answer": 0,
              "explanation": "Dokunma anında kalp çıkar ve parmak çekilene kadar ekranda kalır. Parmak çekilince temizle bloğu çalışır; 3. saniyede ekran boştur.",
              "skills": [
                "mk-input-timing",
                "mk-events"
              ]
            },
            {
              "id": "m10h2d9-q4",
              "kind": "find-bug",
              "prompt": "Elif logoya dokununca kalp, bırakınca ekran sönsün istiyor. Ama dokunur dokunmaz kalp görünüp hemen sönüyor:\n\n```\ncard.onLogo(\"touch\", () => { screen.showIcon(\"heart\"); });\ncard.onLogo(\"touch\", () => { screen.clear(); });\n```\n\nHata nedir?",
              "options": [
                "İkinci bloğun an listesi \"touch\" kalmış, \"release\" olmalı",
                "showIcon yerine showNumber gerekli",
                "İlk bloğun \"release\" olması gerekir",
                "screen.clear() hiç çalışmaz"
              ],
              "answer": 0,
              "explanation": "İki blok da dokunma anını dinliyor; ikincisi ilkinin hemen ardından ekranı temizliyor. Temizleme bloğunun an listesi bırakılınca olmalı. İlk blok doğru, clear ise çalışır.",
              "skills": [
                "mk-input-timing",
                "prog-debug"
              ]
            },
            {
              "id": "m10h2d9-q5",
              "kind": "mcq",
              "prompt": "Programda A için hem \"basılınca\" (kalp) hem \"uzun basılınca\" (uyuyan yüz) bloğu var. A'ya 0,3 saniye basıp bırakıyorsun. Ne olur?",
              "options": [
                "Yalnız uyuyan yüz görünür",
                "Yalnız kalp görünür; uzun basış hiç gelmez",
                "Önce kalp, sonra uyuyan yüz görünür",
                "Hiçbir şey olmaz"
              ],
              "answer": 1,
              "explanation": "Basınca kalp çalışır. Düğme 1 saniye dolmadan bırakıldığı için uzun basış hiç doğmaz. Uyuyan yüz yalnız en az 1 saniye basarsan görünür.",
              "skills": [
                "mk-input-timing",
                "mk-events"
              ]
            }
          ]
        },
        {
          "title": "Proje: Zar oyunu skor panosu",
          "durationMin": 35,
          "problem": "Masa oyunlarında zar atılır, puan toplanır, kazanan belli olur. Hep birinin hesap tutması gerekir. Bu projede kartın hem zarı atacak hem de puanı toplayacak, hatta 6 gelince zafer müziği çalacak. Böylece oyun masasının tek yardımcısı olacak!",
          "contentMd": "### Proje: Zar oyunu skor panosu\nBu hafta öğrendiğin her şeyi birleştireceksin: düğme olayları, değişkenler, rastgele sayı ve eğer.\n\n**Kurallar:**\n- **A:** zar atar, sonucu ekranda gösterir ve **toplam** puana ekler. 6 gelirse zafer ezgisi çalar.\n- **B:** toplam puanı gösterir.\n- **A+B:** toplamı sıfırlar ve ekranda 0 gösterir.\n\n### Yeni blok: ezgiyi çal\n**Müzik** kategorisindeki **ezgiyi çal [Neşe ezgisi]** bloğu hazır bir müzik parçası çalar. Listeden **Zafer** seç. Ezgi bitene kadar sonraki blok bekler. Ses sanal hoparlörden gelir. Tarayıcın ses vermek için sayfada bir kez tıklama bekler. Ses duymuyorsan kartın sağ panelindeki **Hoparlör** bölümünde **Ses açık** yazdığına bak.\n\n### Adım adım\nEditörde **başlangıçta**, A, B ve A+B blokları hazır. **zar** ve **toplam** değişkenleri de hazır.\n\n1. **A düğmesi:**\n   1. **zar değerini [0] yap** bloğunu koy, içine **[1] ile [6] arasında rastgele sayı** tak.\n   2. Altına **toplam değerine [1] ekle** bloğunu koy. Sayı yerine **zar** değişkenini tak.\n   3. **sayıyı göster** bloğunu ekle, içine **zar** koy.\n   4. **eğer ... ise** bloğu ekle: koşul **zar = 6**.\n   5. Eğer'in içine **Müzik** kategorisinden **ezgiyi çal** bloğunu koy ve **Zafer** seç.\n2. **B düğmesi:** içine **sayıyı göster** koy, **toplam** değişkenini tak.\n3. **A+B düğmesi:** **toplam değerini [0] yap**, sonra **sayıyı göster** ile 0'ı (ya da **toplam**) göster.\n4. ▶ **Çalıştır**. A'ya en az beş kez bas, 6 gelene kadar devam et. Sonra B'ye, en sonda A+B'ye bas.\n\n### Beklenen sonuç\nA'ya her basışta ekranda yarım saniye kadar 1 ile 6 arası bir rakam görünür. 6 gelince zafer ezgisi çalar. B'ye basınca o ana kadarki toplam kayarak görünür (örneğin 17). A+B'ye basınca ekranda 0 görünür. Hedefler kutusundaki beş görevin hepsi ✓ olmalı.\n\n### Nasıl çalışıyor?\n- **zar** o anki atışı, **toplam** bütün atışların toplamını tutar. Her atışta **toplam değerine zar ekle** ile toplam büyür.\n- **eğer zar = 6 ise** bloğu zafer müziğini yalnızca 6 gelince çalar. Başka sayıda atlanır.\n- **başlangıçta** bloğu toplamı sıfırlar. Böylece her çalıştırma sıfırdan başlar.\n- Ezgi çalarken A bloğu bitene kadar bekler. Ezgi bitmeden yeni bir A'ya basarsan, yeni basış sıraya girer.\n- **JavaScript** sekmesinde bütün programı oku: `toplam += zar;` satırını bulabilir misin? Bloktaki \"ekle\" kelimesinin kod karşılığı budur.\n\n### Dene\n1. Toplam 30'u aşınca ekranda mutlu yüz çıksın. İpucu: A'ya bir **eğer toplam > 30 ise** bloğu daha ekle.\n2. B'ye uzun basış olarak bir \"puanı sıfırla\" ekle. İki ayrı sıfırlama yolu olsun.\n3. Zafer için başka bir ezgi seç. Hangisi sana daha çok zafer müziği gibi geliyor?\n\n### Sık yapılan hatalar\n- **Toplamı sıfırlamayı unutmak.** Yeni oyuna başlarken A+B ile toplamı sıfırlamazsan eski oyunun puanı üzerine eklenir.\n- **Zarı iki kez atmak.** Hem göstermek hem toplamak için **zar** kutusunu kullan; iki ayrı rastgele blok koyma. Yoksa ekrandaki sayı ile toplanan sayı farklı olur.\n- **6'yı beklemeden pes etmek.** 6 her atışta gelmez. Zafer ezgisini duymak için birkaç kez bas.\n- **Ses duyamayınca hata aramak.** Hoparlör kapalı olabilir. Sağ paneldeki **Hoparlör** bölümüne bak.",
          "question": "Oyununa hangi kuralı eklemek istersin? Mesela 1 gelince puan sıfırlansın mı? Kuralları değiştirdikçe oyun nasıl daha eğlenceli ya da daha zor oluyor?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Bir projeyi kodlamadan önce kurallar tablosuna dökmeyi\n- Toplam tutan değişkenin (biriktirici) nasıl çalıştığını\n- Düğme olayı, değişken, rastgele sayı ve eğer bloklarını tek programda birleştirmeyi\n- Müzik çalan bir bloğun programı kendi süresi kadar bekleteceğini\n\n### Önceden bilmen gerekenler\n- Ders 6: A, B ve A+B olayları\n- Ders 7: değişken, ekle bloğu, başlangıç değeri\n- Ders 8: rastgele sayı, **eğer ... ise**, karşılaştırma\n- Ders 9: olayların birbirinden bağımsız olduğu\n\n### Önce kural tablosu\nBüyük işi küçük parçalara böl. Skor panosunda üç düğme üç ayrı iş yapar:\n\n| Olay | Ne yapar | Kullandığı değişken |\n|---|---|---|\n| Başlangıçta | Toplamı 0 yapar | toplam |\n| A basılınca | Zar atar, toplama ekler, zarı gösterir, 6'da ezgi çalar | zar, toplam |\n| B basılınca | Toplamı gösterir | toplam |\n| A+B basılınca | Toplamı sıfırlar, 0 gösterir | toplam |\n\nTabloyu yazdıktan sonra kodlamak sıra ile doldurmaktan ibarettir.\n\n### İki değişken, iki görev\n**zar** o anki atışı tutar ve her A'da değişir. **toplam** ise bütün atışları biriktirir ve yalnızca üstüne eklenir. Bir örnek: atışlar 4, 6, 3 gelirse toplam 0 → 4 → 10 → 13 olur. Sıfırlayana kadar hiç küçülmez.\n\n### Sıra önemli\nA bloğunda sıra şudur: önce zarı at ve kutuya koy, sonra toplama ekle, sonra göster, en sonda 6 mı diye sor. Toplama **zar** kutusunu ekle, yeni bir rastgele blok koyma. Böylece ekranda gördüğün sayı toplama giren sayıyla aynıdır.\n\n### Ezgi çalarken bekleme\n**ezgiyi çal** bloğu, ezgi bitene kadar bloğun devamını bekletir. Zafer ezgisi 5,5 vuruştur; 120 vuruş/dakika hızında bir vuruş 500 ms eder. Bu yüzden ezgi 5,5 × 500 = 2750 ms sürer. Rakam da kısa süre ekranda durduğu için 6 gelen bir A basışı yaklaşık 3 saniye meşguldür. Bu sırada yeni basışlar sıraya girer.\n\n### Sıfırlama\nYeni oyuna başlarken toplamı A+B ile sıfırlamazsan eski oyunun puanı kalır. Başlangıçta bloğu da her ▶ düğmesinde toplamı sıfırlar. İki yol aynı kutuya 0 koyar.\n\n### Özet\nÖnce kural tablosu yazılır, sonra bloklar kurulur. zar son atışı, toplam bütün atışları tutar. Toplama zar kutusu eklenir, ikinci bir rastgele blok eklenmez. Ezgi bitene kadar blok bekler. Sıfırlama bloğu toplamı yeniden 0 yapar, böylece yeni oyun başlar.",
          "concepts": [
            {
              "term": "Kural tablosu",
              "definition": "Kod yazmadan önce her olayın ne yapacağını ve hangi değişkenleri kullanacağını gösteren küçük tablo.",
              "example": "A: zar at, toplama ekle; B: toplamı göster; A+B: toplamı sıfırla.",
              "pitfall": "Doğrudan blok sürüklemeye başlamak; hangi iş hangi düğmede kaybolur."
            },
            {
              "term": "Toplam (biriktirici)",
              "definition": "Her olayda üstüne ekleme yapılan, yalnızca sıfırlanınca küçülen değişken.",
              "example": "Atışlar 4, 6, 3 gelirse toplam 4, 10, 13 olur.",
              "pitfall": "toplam = zar yazmak; her atış eskiyi siler ve toplam hep son atış olur."
            },
            {
              "term": "Sıra ve tek zar",
              "definition": "Önce zarı bir kez at ve kutuya koy; ekle, göster ve karşılaştır adımlarında hep aynı kutuyu kullan.",
              "example": "zar = randomInt(1, 6); toplam += zar; screen.showNumber(zar);",
              "pitfall": "Toplama yeni bir rastgele blok eklemek; ekrandaki sayı ile toplanan sayı farklı çıkar."
            },
            {
              "term": "ezgiyi çal",
              "definition": "Hazır bir ezgiyi sanal hoparlörden çalan ve bitene kadar sonraki bloğu bekleten blok.",
              "example": "Zafer ezgisi 5,5 vuruştur; 120 vuruş/dakikada 2750 ms sürer.",
              "pitfall": "Bloğun anında bittiğini sanmak; ezgi çalarken yeni basışlar sıraya girer."
            },
            {
              "term": "Sıfırlama",
              "definition": "Değişkene yeniden başlangıç değerini koyan işlem: başlangıçta ve A+B ile yapılabilir.",
              "example": "A+B bloğunda toplam değerini 0 yap, sonra toplamı göster.",
              "pitfall": "Yeni oyundan önce toplamı sıfırlamamak; eski puan üstüne eklenir."
            }
          ],
          "quiz": [
            {
              "id": "m10h2d10-q1",
              "kind": "numeric",
              "prompt": "Zafer ezgisi 5,5 vuruş uzunluğunda ve tempo 120 vuruş/dakika (bir vuruş 60000 ÷ 120 = 500 ms). Sanal kartta tek bir rakam 600 ms ekranda kalıyor. 6 gelen bir A basışında A bloğu, rakamı gösterip ezgiyi bitirene kadar toplam kaç milisaniye meşgul olur?",
              "answer": 3350,
              "unit": "ms",
              "explanation": "Ezgi 5,5 x 500 = 2750 ms. Rakam gösterme 600 ms sürer ve ezgiden önce gelir: 600 + 2750 = 3350 ms. Yalnızca 2750 bulmak rakamın süresini unutmak olur.",
              "skills": [
                "mk-input-timing",
                "mk-random"
              ]
            },
            {
              "id": "m10h2d10-q2",
              "kind": "predict-output",
              "prompt": "Başlangıçta toplam = 0. Zar sırasıyla 4, 6 ve 3 geliyor (üç kez A'ya basılıyor), sonra B'ye basılıyor:\n\n```\ncard.onButton(\"A\", \"press\", () => {\n  zar = randomInt(1, 6);\n  toplam += zar;\n  screen.showNumber(zar);\n  if (zar == 6) { music.playMelody(\"fanfare\"); }\n});\ncard.onButton(\"B\", \"press\", () => { screen.showNumber(toplam); });\n```\n\nB'ye basınca ekranda hangi sayı görünür?",
              "options": [
                "3",
                "6",
                "13",
                "19"
              ],
              "answer": 2,
              "explanation": "toplam: 0 + 4 = 4, + 6 = 10, + 3 = 13. B toplamı gösterir; son atış olan 3 değil. 6'da zafer ezgisi çalar ama toplamı değiştirmez.",
              "skills": [
                "mk-variables",
                "mk-events"
              ]
            },
            {
              "id": "m10h2d10-q3",
              "kind": "find-bug",
              "prompt": "Mert'in panosunda B'ye basınca toplam hep son atışı gösteriyor, atışlar birikmiyor:\n\n```\ncard.onButton(\"A\", \"press\", () => {\n  zar = randomInt(1, 6);\n  toplam = zar;\n  screen.showNumber(zar);\n});\ncard.onButton(\"B\", \"press\", () => { screen.showNumber(toplam); });\n```\n\nHata nedir?",
              "options": [
                "screen.showNumber yanlış yerde",
                "onButton(\"B\") yerine \"A\" yazılmalı",
                "toplam = zar her atışta eskisini siliyor; toplam += zar olmalı",
                "randomInt(1, 6) yerine randomInt(0, 6) olmalı"
              ],
              "answer": 2,
              "explanation": "= kutuya yeni değer koyar ve eskisini siler, bu yüzden toplam son atışa eşit kalır. += mevcut toplama ekler. Diğer satırlar doğru çalışır.",
              "skills": [
                "mk-variables",
                "prog-debug"
              ]
            },
            {
              "id": "m10h2d10-q4",
              "kind": "mcq",
              "prompt": "Panoya \"en yüksek atış\" göstergesi eklemek istiyorsun. Hangi tasarım doğrudur?",
              "options": [
                "Ayrı bir enyuksek değişkeni tutmak; zar > enyuksek ise enyuksek = zar yapmak",
                "zar değişkenini hiç değiştirmemek",
                "Her atışta toplam değişkenini sıfırlamak",
                "Her atışta ikinci bir rastgele sayı üretmek"
              ],
              "answer": 0,
              "explanation": "En yüksek değer ayrı bir kutuda tutulur ve yalnız yeni atış onu geçerse güncellenir. Bunu planlamak için kural tablosuna yeni bir satır eklenir. Toplamı sıfırlamak ya da ikinci rastgele sayı üretmek puanı bozar.",
              "skills": [
                "prog-planning",
                "mk-conditions",
                "mk-variables"
              ]
            },
            {
              "id": "m10h2d10-q5",
              "kind": "numeric",
              "prompt": "Yeni kural: zar 1 gelirse toplam 0 olur. Atışlar sırasıyla 5, 3, 1, 4, 6 geliyor. Son atıştan sonra toplam kaç olur?",
              "answer": 10,
              "explanation": "5 + 3 = 8. Sonra 1 gelir ve toplam 0 olur. Sonra 4 ve 6 eklenir: 0 + 4 + 6 = 10. 19 bulmak 1'in sıfırlamasını unutmak olur.",
              "skills": [
                "mk-conditions",
                "mk-variables",
                "prog-planning"
              ]
            }
          ]
        }
      ]
    },
    {
      "title": "Sensörler",
      "project": "Çevre istasyonu",
      "guideMd": "### Hafta hedefleri\nBu haftanın sonunda öğrenci:\n1. İvmeölçerin x, y ve z eksenlerinde ne ölçtüğünü söyleyebilir; hareket bloklarının yalnız durum değişince çalıştığını açıklayabilir.\n2. Sıcaklık, ışık ve ses sensörlerinin değerlerini (sıcaklık -5..50, ışık ve ses 0..255) okuyabilir ve bir eşikle karar verebilir.\n3. Çubuk grafiğin kaç LED yaktığını değer ÷ en çok × 25 işlemiyle hesaplayabilir.\n4. Pusula derecesini yönle eşleştirebilir ve kuzeyi gösteren okun açısını 360 eksi pusula olarak kurabilir.\n5. Değişken ve kalan işlemiyle, düğmeyle mod değiştiren üç sensörlü bir Çevre istasyonu yapabilir.\n\n### Haftanın planı\nHafta beş derstir; her ders yaklaşık 20-35 dakikadır. Plan günde bir ders içindir. Daha yoğun bir takvimde iki dersi birleştirmek mümkündür.\n\n| Gün | Ders | Süre | Ne yapılır |\n|---|---|---|---|\n| 1 | İvmeölçer: salla ve yatır | ~20 dk | Anlatımı oku, sanal kartı salla ve yatır, sihirli topu kur, mini testi çöz. |\n| 2 | Sıcaklık ve ışık | ~25 dk | Kaydırıcılarla sıcaklığı ve ışığı değiştir, eşik ve çubuk grafik hesaplarını yap, mini hava istasyonunu kur. |\n| 3 | Pusula: kuzeyi bul | ~25 dk | Pusula derecelerini yönlerle eşleştir, 360 eksi pusula kuralıyla kuzey okunu çiz. |\n| 4 | Ses seviyesi: alkış sayacı | ~25 dk | Doğru eşiği seç, değişkenle alkışları say, tur süresini hesapla. |\n| 5 | Proje: Çevre istasyonu | ~35 dk | Planı yaz, A ile mod değiştir, çubuk ve sayı göster, projeyi ölçütlerle değerlendir. |\n\n### Ön koşul kontrolü\nBu hafta Hafta 1 ve Hafta 2'nin konuları kullanılır. Başlamadan önce kontrol et:\n- Öğrenci bir olay (düğme) bloğuna program yığını bağlayabiliyor mu? (Hafta 2, Ders 6)\n- Bir değişkeni oluşturup \"değerine ekle\" ile artırabiliyor mu? (Ders 7)\n- Eğer ... ise ... değilse bloğunu kullanabiliyor mu? (Ders 8)\n- Sonsuza kadar bloğunun ne yaptığını biliyor mu? (Ders 5)\n- Çarpma, bölme ve yüzde oranı (0,4 × 25) gibi işlemlerle rahat mı?\n\n### Kavram haritası\n- **Algılama:** sensör → sanal kaydırıcı → okuma anı → eşik\n- **Hareket:** ivmeölçer → x, y, z → duruş (700 eşiği) → hareket olayı (yalnız değişimde)\n- **Yön:** pusula (0 kuzey, 90 doğu, 180 güney, 270 batı) → 360 ≡ 0 → ok açısı = 360 − pusula → sekiz yönlü ok\n- **Gösterim:** çubuk grafik (değer ÷ en çok × 25) → ekranı tek yerden yönetme\n- **Program:** değişken → sayaç → kalan işlemi → mod → önce hazırla, sonra çiz\n\n### Sık yapılan hatalar\n- **Aynı yatışı tekrar denemek.** Sola yatık kartı yeniden sola yatırmak olay üretmez; önce yüzü yukarı yap.\n- **Eşiği 700'ün altında sanmak.** Bir eksen en büyük ve en az 700 olmalı; küçük kaydırma yatış sayılmaz.\n- **Sınır değerini unutmak.** sıcaklık > 30 koşulu 30'da yanlıştır; üzgün yüz 31'de çıkar.\n- **En çok değerini yanlış yazmak.** Işık 255'e çıkar; en çok 5 bırakılırsa ekran hemen dolar.\n- **Okun açısını doğrudan pusula yapmak.** Ok kartla birlikte döner; 360 − pusula gerekir.\n- **Eksi yerine artı bırakmak.** Aritmetik blok varsayılan olarak toplar; işareti − yap.\n- **Eşiği oda sesinin altında seçmek.** Oda sesi yaklaşık 20; eşik 10 olursa sayaç sürekli artar.\n- **Ekrana iki yerden yazmak.** Hem sonsuza kadar hem düğme olayı çizerse görüntü karışır.\n- **Kalan yerine mod + 1 yazmak.** Mod başa dönmez, 3, 4, 5 diye büyür.\n\n### Hafta sonu tekrarı\n1. Her dersin kavram kartlarına bak ve \"sık yapılan yanlış\" satırlarını yüksek sesle oku.\n2. Mini testlerde yanlış yaptığın soruların açıklamalarını yeniden oku, sonra soruyu yeniden çöz.\n3. Çubuk grafik hesabını elle yap: (sıcaklık 12, en çok 40), (ışık 100, en çok 255), (ses 255, en çok 255). Sonra sanal kartta sına.\n4. Pusula 0, 90, 180, 270 ve 45 iken okun hangi yöne baktığını önce tahmin et, sonra çalıştırarak doğrula.\n5. Kendi cümlelerinle cevapla: \"Hareket blokları neden aynı yatışta ikinci kez çalışmaz?\" ve \"Neden 360 eksi pusula kullandık?\"\n\nHafta sonu testi olarak beş dersin mini testleri yeterlidir; her derste 5 soru, toplam 25 soru. Hedef: her dersten en az 4 doğru. Eksik kalan dersin anlatımına dön.\n\n### Proje değerlendirme ölçütü (Çevre istasyonu)\n| Ölçüt | Gelişmeli | Yeterli | İleri |\n|---|---|---|---|\n| Sensörler | Yalnız bir sensör çalışıyor | Sıcaklık, ışık ve ses kendi modunda çubuk olarak görünüyor | Her sensör doğru en çok değeriyle (40 ve 255) ve değer değişince çubuk orantılı değişiyor |\n| Mod değiştirme | A mod değiştirmiyor ya da mod 3'ten sonra büyüyor | A her basışta 0, 1, 2 sırasıyla ilerliyor ve başa dönüyor | Dördüncü bir mod (pusula) ekleyip bölen sayıyı kendisi güncelliyor |\n| Sayı gösterimi | B basılınca sayı görünmüyor | B basılıyken seçili sensörün sayısı kayıyor | Ekran yalnız sonsuza kadar bloğundan çiziliyor ve neden anlatılabiliyor |\n| Program düzeni | Aynı ekrana birden çok yerden yazılıyor | Okuma ve enCok önce hazırlanıp sonra çiziliyor | Değişken adları anlaşılır ve bir uyarı (örneğin sıcaklık yüksekken kalp) eklenmiş |\n| Anlatım | Ne yaptığını anlatamıyor | Programı adım adım anlatıyor | Hata yapıp nasıl bulduğunu ve çubuğun hesabını anlatıyor |\n\n### Veli ve öğretmen notu\n- **Amaç.** Bu hafta ölçmek ve karar vermektir: değer okunur, bir eşikle karşılaştırılır, ekranda gösterilir. Sanal sensörlerin değerini öğrencinin kendisinin verdiğini vurgulamak, \"ölçüm\" ile \"ayarlama\" farkını düşündürür.\n- **Nasıl destek olunur?** Cevabı söylemek yerine şu soruları sor: \"Bu sensör şu an kaç okuyor?\", \"Eşik kaç ve bu değer ondan büyük mü?\", \"Ekrana kaç yerden yazıyorsun?\"\n- **Hesaplar.** Çubuk grafik ve pusula hesapları ufak ama gerçek matematiktir; öğrenci elle hesaplayıp sanal kartta doğrulayınca ilişki kalıcı olur.\n- **Ses ve gizlilik.** Ses seviyesi sanal bir kaydırıcıdır; gerçek mikrofon kullanılmaz. Konuşmada gerçek cihazların sesi dinlerken gizlilik kuralları gerektiğini öğrenciyle tartışabilirsiniz.\n- **Güvenlik.** Bu platformdaki her şey sanaldır. Ders ilerleyip gerçek kart kullanılacaksa şebeke gerilimiyle (220 V) hiçbir devre kurulmaz.\n- **İlerleme.** Mini test sonuçları \"İlerlemem\" sayfasında beceri bazında görünür (taslak/pilot özellik; yalnız onay verildiyse kaydedilir).",
      "lessons": [
        {
          "title": "İvmeölçer: salla ve yatır",
          "durationMin": 20,
          "problem": "Telefonunu yatay çevirdiğinde ekran kendiliğinden döner. Bazı uygulamalar telefonu sallayınca geri alır, bazı oyunlarda arabayı telefonu eğerek sürersin. Telefonun içindeki **ivmeölçer** denen bir parça, hareketi ve eğimi hisseder. Kartın da bir ivmeölçeri var. Onunla bir \"sihirli top\" yapalım!",
          "contentMd": "### İvmeölçer ne hisseder?\nİvmeölçer kartın hareketini ve **hangi yöne yattığını** ölçer. Ölçümler üç eksende verilir:\n\n- **x:** kartın sola (eksi) ve sağa (artı) yatması\n- **y:** kartın arkaya (eksi) ve öne (artı) yatması\n- **z:** kartın yüzünün yukarı (artı) ya da aşağı (eksi) bakması\n\nDeğerler **milli-g** cinsindendir. Kart yüzü yukarı dururken yerçekimi z ekseninde yaklaşık 1024 ölçer. Yani (x, y, z) = (0, 0, 1024).\n\nSanal kartta kartın sağındaki **Hareket (ivmeölçer)** bölümünde şunları bulursun:\n\n- Düğmeler: **Salla**, **Sola yatır**, **Sağa yatır**, **Öne yatır**, **Arkaya yatır**, **Yüzü yukarı**, **Yüzü aşağı**, **Serbest düşüş**.\n- Üç kaydırıcı: **x (yan)**, **y (ön-arka)**, **z (yüz)**.\n- Altında üç okuma: **güç**, **boy eğimi**, **yan eğim**.\n\n### Hareket blokları\n**Giriş** kategorisinde şu bloklar var:\n\n- **kart [sallandığında]:** başlık bloğu. Listeden hareketi seç: sallandığında, sola yatınca, sağa yatınca, öne yatınca, arkaya yatınca, yüzü yukarı bakınca, yüzü aşağı bakınca, serbest düşünce.\n- **kart [sallanıyor] mu?:** şu an kart bu durumda mı diye sorar. Doğru ya da yanlış verir.\n- **ivme ([güç])** ve **eğim ([boy (öne +)]) derece:** sayı verir.\n\n### Program: sihirli top\nEditörde üç **kart ... ** başlık bloğu hazır: sallandığında, sola yatınca, sağa yatınca.\n\n1. **sallandığında** bloğunun içine **Mantık** kategorisinden **eğer ... ise ... değilse** bloğunu koy (iki çeşit eğer var; \"değilse\" olanı al).\n2. Eğer'in koşul yuvasına **Mantık** kategorisinden **yazı tura (rastgele doğru/yanlış)** bloğunu tak.\n3. \"ise\" kısmına **simgeyi göster**, listeden **evet** seç. \"değilse\" kısmına **simgeyi göster**, **hayır** seç.\n4. **sola yatınca** bloğunun içine **simgeyi göster**, **sol ok** seç.\n5. **sağa yatınca** bloğunun içine **simgeyi göster**, **sağ ok** seç.\n6. ▶ **Çalıştır**.\n7. Sanal kartta **Salla** düğmesine bas. Birkaç kez salla. Sonra **Sola yatır**, sonra **Sağa yatır**.\n\n### Beklenen sonuç\nHer sallamada rastgele \"evet\" ya da \"hayır\" görünür. Sola yatırınca sol ok, sağa yatırınca sağ ok çıkar. Beş hedefin hepsinde ✓ olmalı.\n\n### Nasıl çalışıyor?\n- Bir hareket bloğu, kartın durumu **değiştiği an** çalışır. Kart zaten sola yatıksa **sola yatınca** tekrar çalışmaz; önce başka bir duruma, örneğin **Yüzü yukarı**, dönmen gerekir.\n- **Sallama** kısa bir olaydır: kart sallanınca blok hemen çalışır ve yaklaşık yarım saniye boyunca ivme okumaları titrer.\n- **yazı tura** her çalıştığında rastgele **doğru** ya da **yanlış** verir. Bu bir yazı tura atmak gibi.\n- Bir eksen 700 milli-g'yi geçince kart o yöne yatmış sayılır.\n\n### Dene\n1. **Öne yatınca** ve **arkaya yatınca** için de iki blok ekle: yukarı ok ve aşağı ok göstersinler.\n2. **Yüzü aşağı bakınca** bloğu ekle ve ekranı temizlet. Kartı ters çevirince ekran söner.\n3. Kaydırıcıları elle oynat. **güç** okuması ne zaman büyüyor? Kartı sallarken güç değeri nasıl değişiyor?\n\n### Sık yapılan hatalar\n- **Aynı yatışı tekrar tekrar denemek.** Sola yatırdıktan sonra tekrar **Sola yatır** düğmesine basarsan olay yeniden çalışmaz. Önce **Yüzü yukarı** düğmesine bas.\n- **\"değilse\" kolunu atlamak.** Sadece **ise** bölümü olan bir eğer koyarsan yarı yarıya hiçbir şey görmezsin.\n- **Kaydırıcıyı az oynatmak.** Kartın yatık sayılması için bir eksenin 700'ün ötesine geçmesi gerekir. Küçük bir kaydırma yatış sayılmaz; hazır düğmeleri kullanmak daha kolay.",
          "question": "Telefonunda ya da oyun kolunda hareket algılayan başka neler biliyorsun? Kartı salladığında bir şeyin olmasını istemek ile bir düğmeye basmak arasında sence ne fark var?",
          "explainerMd": "### Bu derste öğreneceklerin\n- İvmeölçerin ne ölçtüğünü ve neden \"yatışı\" hissedebildiğini\n- x, y ve z eksenlerinin kartın hangi hareketine karşılık geldiğini\n- Bir hareket olayının ne zaman çalıştığını, ne zaman çalışmadığını\n- Rastgele bir kararı (yazı tura) eğer bloğuyla nasıl vereceğini\n\n### Önceden bilmen gerekenler\n- Ders 3: simgeyi göster bloğu\n- Ders 6: olay nedir (başlık bloğu, o an çalışan yığın)\n- Ders 8: eğer ... ise ... değilse bloğu ve rastgelelik\n\n### Kart yerçekimini hisseder\nElindeki telefonu yatırdığında ekran döner. Telefon, hangi yöne çekildiğini bilir. Bunu **ivmeölçer** yapar. İvmeölçer, kartın hareketini ve yerçekiminin kartı hangi yöne \"çektiğini\" ölçer. Kart masada dururken bile ölçüm yapar, çünkü yerçekimi sürekli vardır.\n\n### Üç eksen\nÖlçüm üç ayrı sayıyla verilir. Her sayı bir yönü anlatır.\n\n```\nx : sola (-)  <->  sağa (+)\ny : arkaya (-) <-> öne (+)\nz : yüzü aşağı (-) <-> yüzü yukarı (+)\n```\n\nBirim **milli-g**'dir. Yaklaşık 1024 milli-g, yerçekiminin tam gücü demektir. Kart yüzü yukarı yatarken yerçekimi z yönünde olur. Bu yüzden okuma (x, y, z) = (0, 0, 1024) çıkar. Kart sağa dik yatırılırsa yerçekimi x yönüne geçer: (1024, 0, 0).\n\n### Yatış nasıl \"duruş\" olur?\nKart, en büyük eksen değerine bakar. Bu değer en az 700 ise ve diğer eksenlerden büyükse kart o yöne yatmış sayılır. Örneğin (650, 0, 900) okuması hâlâ \"yüzü yukarı\"dır: z en büyüktür ve x, 700'e ulaşmamıştır. Sallamak ise ayrıdır: kart kısa süre titrer ve okumalar zıplar.\n\n### Olay yalnız değişimde çalışır\n**kart [sola yatınca]** gibi bir blok, kartın durumu **değiştiği an** çalışır. Kart zaten sola yatıksa yeniden \"sola yatır\" demek hiçbir şey değiştirmez, bu yüzden blok bir daha çalışmaz. Çalışması için önce başka bir duruşa, örneğin yüzü yukarı, dönmen gerekir. Sallama farklıdır: her sallama yeni bir olaydır.\n\n### Yazı tura ile karar\n**yazı tura** bloğu her çalıştığında rastgele **doğru** ya da **yanlış** verir. Bunu eğer bloğunun koşuluna takarsan program iki yoldan birini rastgele seçer:\n\n```\nkart sallandığında:\n  eğer yazı tura ise\n    simgeyi göster evet\n  değilse\n    simgeyi göster hayır\n```\n\n\"değilse\" kolunu atlarsan yarı yarıya hiçbir şey olmaz: ekranda eski görüntü kalır.\n\n### Özet\nİvmeölçer üç eksende milli-g cinsinden ölçüm yapar ve yerçekimi sayesinde kartın yatışını bilir. Bir eksen en büyükse ve 700'e ulaşmışsa kart o yöne yatmış sayılır. Hareket blokları yalnız durum değişince çalışır. Sallama her seferinde yeni bir olaydır. Yazı tura bloğu ile eğer bloğu birleşince rastgele bir cevap veren sihirli top yapabilirsin.",
          "concepts": [
            {
              "term": "İvmeölçer",
              "definition": "Kartın hareketini ve yerçekiminin kartı hangi yöne çektiğini üç eksende ölçen sensör.",
              "example": "Kart masada yüzü yukarı dururken ölçüm (x, y, z) = (0, 0, 1024) olur.",
              "pitfall": "İvmeölçerin yalnız sallanırken çalıştığını sanmak; kart dururken de yerçekimini ölçer."
            },
            {
              "term": "x, y ve z eksenleri",
              "definition": "x kartın sola ya da sağa, y arkaya ya da öne, z yüzünün yukarı ya da aşağı bakmasını gösterir.",
              "example": "Kart sağa dik yatırılınca ölçüm (1024, 0, 0) olur.",
              "pitfall": "y'yi sağa-sola, x'i öne-arkaya yatış sanmak; x yandır, y ön-arkadır."
            },
            {
              "term": "milli-g",
              "definition": "İvme birimi. Yaklaşık 1024 milli-g yerçekiminin tam gücüdür.",
              "example": "Kart yüzü yukarıyken z ekseni yaklaşık 1024 milli-g okur.",
              "pitfall": "Değeri derece sanmak; milli-g bir kuvvet büyüklüğüdür, açı değildir."
            },
            {
              "term": "Duruş eşiği (700)",
              "definition": "Bir eksen değeri en büyükse ve en az 700 ise kart o yöne yatmış sayılır.",
              "example": "(650, 0, 900) okuması hâlâ yüzü yukarıdır; z en büyüktür ve x, 700'e ulaşmamıştır.",
              "pitfall": "Kaydırıcıyı az oynatıp yatış beklemek; 700'ün altı yatış sayılmaz."
            },
            {
              "term": "Hareket olayı",
              "definition": "kart [sola yatınca] gibi bloklar, durum değiştiği an bir kez çalışır.",
              "example": "Kart yüzü yukarıdan sola yatırılınca blok çalışır; sola yatık kalırsa tekrar çalışmaz.",
              "pitfall": "Aynı yatışı tekrar tekrar denemek; önce başka bir duruşa dönmeden olay yeniden gelmez."
            },
            {
              "term": "Yazı tura",
              "definition": "Her çalıştığında rastgele doğru ya da yanlış veren blok.",
              "example": "eğer yazı tura ise evet, değilse hayır simgesi sihirli topu yapar.",
              "pitfall": "değilse kolunu atlamak; yanlış çıkınca hiçbir şey olmaz ve eski görüntü kalır."
            }
          ],
          "quiz": [
            {
              "id": "m10h3d1-q1",
              "kind": "mcq",
              "prompt": "Kartın ivmeölçeri (x, y, z) = (650, 0, 900) okuyor. Kart hangi duruşta sayılır?",
              "options": [
                "Sağa yatık",
                "Yüzü yukarı",
                "Öne yatık",
                "Serbest düşüşte"
              ],
              "answer": 1,
              "explanation": "Duruş, en büyük eksene bakılarak bulunur. En büyük eksen z'dir (900) ve 700'ün üstündedir, bu yüzden kart yüzü yukarıdır. x yalnızca 650'dir, 700'e ulaşmadığı ve z'den küçük olduğu için sağa yatık sayılmaz.",
              "skills": [
                "mk-accel"
              ]
            },
            {
              "id": "m10h3d1-q2",
              "kind": "mcq",
              "prompt": "Kartı sola yatırdın ve sol ok göründü. Kartı sola yatık bırakıp \"Sola yatır\" düğmesine bir kez daha bastın. Ne olur?",
              "options": [
                "Sol ok yeniden çizilir",
                "Hiçbir şey olmaz, çünkü duruş değişmedi",
                "Kart sallanmış sayılır",
                "Program hata verir"
              ],
              "answer": 1,
              "explanation": "Hareket olayı yalnız durum değişince çalışır. Kart zaten sola yatıkken duruş aynı kalır, yani yeni bir olay yoktur. Olayı yeniden denemek için önce yüzü yukarı gibi başka bir duruşa dönmek gerekir.",
              "skills": [
                "mk-events",
                "mk-accel"
              ]
            },
            {
              "id": "m10h3d1-q3",
              "kind": "predict-output",
              "prompt": "Kart başta yüzü yukarı. Aşağıdaki program çalışıyor ve sayac başta 0.\n\n```\nkart sağa yatınca:\n  sayac değerine 1 ekle\n```\n\nSırayla şunları yapıyorsun: Sağa yatır, Sağa yatır, Yüzü yukarı, Sağa yatır, Sağa yatır. En sonda sayac kaç olur?",
              "options": [
                "4",
                "1",
                "2",
                "5"
              ],
              "answer": 2,
              "explanation": "Birinci \"Sağa yatır\" duruşu değiştirir ve blok çalışır (sayac 1). İkincisi duruşu değiştirmez, blok çalışmaz. \"Yüzü yukarı\" için bir blok yok. Sonraki \"Sağa yatır\" yeniden bir değişimdir (sayac 2), onu izleyen tekrar çalışmaz. Sonuç 2'dir; 4 olması için her basışın bir olay üretmesi gerekirdi.",
              "skills": [
                "mk-events",
                "mk-accel"
              ]
            },
            {
              "id": "m10h3d1-q4",
              "kind": "find-bug",
              "prompt": "Sihirli top, kartı sallayınca bazen \"evet\" gösteriyor ama bazen hiçbir şey değişmiyor, ekranda eski görüntü kalıyor. Hata nerede?\n\n```\nkart sallandığında:\n  eğer yazı tura ise\n    simgeyi göster evet\n```",
              "options": [
                "eğer bloğunda değilse kolu yok; yazı tura yanlış çıkınca ekran değişmiyor",
                "yazı tura bloğu yanlış kategoride",
                "sallandığında yerine sola yatınca kullanılmalı",
                "evet simgesi mevcut değil"
              ],
              "answer": 0,
              "explanation": "Yazı tura yarı yarıya yanlış çıkar. Yanlış çıkınca çalışacak bir değilse kolu olmadığı için hiçbir komut çalışmaz ve ekran eskisi gibi kalır. Çözüm değilse koluna simgeyi göster hayır eklemektir. Öbür seçenekler gerçek bir hata değildir.",
              "skills": [
                "mk-conditions",
                "mk-debug"
              ]
            },
            {
              "id": "m10h3d1-q5",
              "kind": "numeric",
              "prompt": "Kartın ivmeölçeri x = 600 ve y = 800 okuyor, z = 0. Hareketin gücü, yani \"ivme (güç)\" kaç milli-g'dir? (güç = karekök(x² + y² + z²))",
              "answer": 1000,
              "tolerance": 0,
              "unit": "milli-g",
              "explanation": "600² = 360000 ve 800² = 640000 eder. Toplam 1000000, karekökü 1000'dir. Ders 11'de gördüğün gibi güç, üç ekseni birleştirir; tek bir eksenin değeri değildir.",
              "skills": [
                "mk-accel"
              ]
            }
          ]
        },
        {
          "title": "Sıcaklık ve ışık",
          "durationMin": 25,
          "problem": "Hava durumu uygulaması dışarının kaç derece olduğunu söyler. Telefonun ekran parlaklığı da odanın ışığına göre kendiliğinden değişir. Bunların hepsi **sensör** denen küçük duyargalar sayesinde olur. Kartın da bir sıcaklık ve bir ışık sensörü var. Onlarla küçük bir hava istasyonu yapacaksın.",
          "contentMd": "### Sanal sensörler\nGerçek kartta sensörler fiziksel parçalardır. Sanal kartta ise **sen** değerleri değiştirirsin. Kartın sağındaki **Pusula ve sensörler** bölümünde üç kaydırıcı bulursun:\n\n- **Sıcaklık:** −5 ile 50 derece (°C) arası.\n- **Işık:** 0 (karanlık) ile 255 (çok parlak) arası.\n- **Ses:** 0 ile 255 arası (bunu 14. derste kullanacağız).\n\n**Giriş** kategorisinde ilgili iki değer bloğu var:\n\n- **sıcaklık (°C):** o anki sıcaklığı verir.\n- **ışık seviyesi:** o anki ışığı verir.\n\n### Çubuk grafik\n**LED** kategorisindeki **çubuk grafik [3] / en çok [5]** bloğu bir sayıyı LED'lerle gösterir. İlk sayı ölçtüğün değerdir, ikincisi en büyük olabilecek değerdir. LED'ler aşağıdan yukarıya dolar: değer en büyük değerin yarısıysa ekranın yarısı yanar. Işık seviyesi 255 üzerinden ölçüldüğü için **çubuk grafik [ışık seviyesi] / en çok [255]** kullanırsın. Işık 128 ise yaklaşık 13 LED yanar. Işık 255 ise 25 LED'in hepsi yanar.\n\n### Program: mini hava istasyonu\nEditörde **düğme A** ve **düğme B** blokları hazır.\n\n1. **A düğmesi:**\n   1. **Temel** kategorisinden **sayıyı göster** bloğunu koy.\n   2. İçindeki sayıyı **Giriş** kategorisindeki **sıcaklık (°C)** bloğu ile değiştir.\n   3. Altına **Mantık** kategorisinden **eğer ... ise** bloğunu koy.\n   4. Koşul için karşılaştırma bloğu al: sol deliğe **sıcaklık (°C)**, işaret **>**, sağ deliğe 30.\n   5. Eğer'in içine **simgeyi göster** koy ve **üzgün yüz** seç.\n2. **B düğmesi:** içine **LED** kategorisinden **çubuk grafik** bloğunu koy. İlk deliğe **ışık seviyesi** bloğunu tak, ikinci deliğe 255 yaz.\n3. ▶ **Çalıştır**.\n4. Sıcaklık kaydırıcısı 21 iken A'ya bas. Sonra sıcaklığı 35'e çıkar ve A'ya bas.\n5. Işık kaydırıcısını sonuna kadar çek ve B'ye bas.\n\n### Beklenen sonuç\nA'ya basınca sıcaklık sayısı kayar (21 gibi). Sıcaklık 30'un üstündeyken sayıdan sonra üzgün yüz görünür. B'ye basınca ışık ne kadarsa o kadar LED yanar. Işık sonuna çekilince bütün ekran yanar. Dört hedefin hepsinde ✓ olmalı.\n\n### Nasıl çalışıyor?\n- Sensör bloğu çalıştığı **an** değeri okur. Sıcaklığı sonradan değiştirirsen, daha önce okunan değer değişmez.\n- **eğer sıcaklık > 30 ise** bir soru sorar: sıcaklık 30'dan büyük mü? Büyükse içindeki blok çalışır.\n- Sayı kayarken program bekler. Sayı bitince üzgün yüz çizilir. Bu yüzden önce sayıyı, sonra yüzü görürsün.\n- **Eşik**, bir kararın değiştiği sınır değerdir. Burada eşik 30 derece: 30'un altında ve üstünde farklı şeyler olur.\n\n### Dene\n1. Eşiği 25'e çek. Sıcaklık kaç olunca üzgün yüz görünüyor?\n2. A bloğunda **değilse** kolunu ekle: sıcaklık 30'dan küçükse mutlu yüz göstersin.\n3. **çubuk grafik** bloğunun içine **sıcaklık (°C)** koy ve en çok değeri 50 yap. Sıcaklığı 25 yap. Sence kaç LED yanar? Tahminini denemeden yap, sonra dene.\n\n### Sık yapılan hatalar\n- **Çubuğun en çok değerini yanlış yazmak.** Işık 255'e kadar çıkar. En çok değeri 5 bırakırsan hemen tüm ekran yanar.\n- **Koşulu ters kurmak.** **sıcaklık < 30** yazarsan serinken üzgün yüz görürsün.\n- **Sensörü okumak için kaydırıcıyı unutmak.** Sanal kartta değerleri sen değiştirirsin; değiştirmezsen sabit kalır (sıcaklık başta 21, ışık 128).",
          "question": "Gerçek bir termometre mi, bu kartın sıcaklık sensörü mü daha güvenilir? Sence sanal sensörler gerçek ölçümler yapıyor mu, yoksa değeri biz mi söylüyoruz? Sorunun cevabı seni şaşırttı mı?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Sensörün ne olduğunu ve sanal kartta değerleri nasıl değiştirdiğini\n- Sıcaklık ve ışık bloklarının sayı verdiğini\n- Eşik ile iki durum arasında karar vermeyi\n- Çubuk grafiğin bir sayıyı kaç LED'e çevirdiğini hesaplamayı\n\n### Önceden bilmen gerekenler\n- Ders 3: simgeyi göster\n- Ders 6: düğme olayları\n- Ders 8: eğer bloğu\n- Ders 11: sanal kartın kaydırıcıları ve bir bloğun bir an çalışıp biten bir iş olduğu\n\n### Sensör nedir?\n**Sensör**, çevredeki bir şeyi sayıya çeviren duyargadır. Termometre sıcaklığı, ışık sensörü parlaklığı ölçer. Gerçek kartta sensörler fiziksel parçalardır. Sanal kartta değeri kaydırıcıdan **sen** verirsin; program yine de bunu bir sensör okuması gibi görür.\n\n```\nsıcaklık : -5 ... 50  (derece)\nışık     :  0 ... 255 (0 karanlık, 255 çok parlak)\n```\n\nBaşlangıç değerleri sıcaklık 21, ışık 128'dir.\n\n### Okuma bir andır\n**sıcaklık (°C)** ve **ışık seviyesi** blokları, çalıştıkları **an** değeri okur. Sayıyı ekranda kaydırırken sıcaklığı değiştirirsen ekrandaki sayı değişmez, çünkü okuma çoktan yapılmıştır. Yeni değeri görmek için bloğun yeniden çalışması gerekir.\n\n### Eşik: karar sınırı\n**Eşik**, bir kararın değiştiği sınır değerdir. \"Sıcaklık 30'dan büyükse üzgün yüz göster\" cümlesinde eşik 30'dur. Karşılaştırma tam sınırda dikkat ister:\n\n```\nsıcaklık = 30 iken   30 > 30   yanlış   (üzgün yüz yok)\nsıcaklık = 31 iken   31 > 30   doğru    (üzgün yüz var)\n```\n\nSınır değerinin kendisinin hangi tarafa girdiğini \">\" ya da \"≥\" seçerek sen belirlersin.\n\n### Çubuk grafik\n**çubuk grafik [değer] / en çok [en büyük]** bloğu bir sayıyı 25 LED'e dağıtır. LED'ler alttan yukarı dolar. Hesap şudur:\n\n```\nyanan LED sayısı = en yakın tam sayı( değer / en çok × 25 )\n```\n\nÖrnek: değer 20, en çok 50 ise 20 ÷ 50 = 0,4 ve 0,4 × 25 = 10 LED yanar. Işık sensörü 255'e kadar çıktığı için ışığı gösterirken en çok değerini 255 yazarsın. 5 bırakırsan ışık 5'i geçer geçmez bütün ekran yanar.\n\n| değer | en çok | yanan LED |\n|---|---|---|\n| 0 | 255 | 0 |\n| 51 | 255 | 5 (alt satır) |\n| 255 | 255 | 25 (hepsi) |\n\n### Özet\nSensör, ortamı sayıya çevirir; sanal kartta değeri kaydırıcıdan sen verirsin. Sensör bloğu çalıştığı an okuma yapar, sonradan değişen değer eski okumayı değiştirmez. Eşik, bir kararın değiştiği sınırdır ve karşılaştırma işaretine göre sınır değerinin kendisi bir tarafa ya da öbürüne girer. Çubuk grafik, değer ÷ en çok oranını 25 LED ile çarpıp en yakın tam sayıya yuvarlar.",
          "concepts": [
            {
              "term": "Sensör",
              "definition": "Çevredeki bir şeyi (sıcaklık, ışık, ses) sayıya çeviren duyarga.",
              "example": "Işık sensörü 0 (karanlık) ile 255 (çok parlak) arasında bir sayı verir.",
              "pitfall": "Sensörün tahmin yürüttüğünü sanmak; yalnızca o anki değeri sayı olarak verir."
            },
            {
              "term": "Sanal sensör",
              "definition": "Sanal kartta sensör değerini kaydırıcıdan sen belirlersin; program onu gerçek okuma gibi görür.",
              "example": "Sıcaklık kaydırıcısını 35'e çekince program 35 okur.",
              "pitfall": "Kaydırıcıyı değiştirmeyi unutmak; değer başlangıçta sabit kalır (sıcaklık 21, ışık 128)."
            },
            {
              "term": "Okuma anı",
              "definition": "Sensör bloğu çalıştığı an değeri okur; sonradan değişen değer önceki okumayı değiştirmez.",
              "example": "Ekranda 21 kayarken sıcaklığı 35 yapsan da ekrandaki sayı 21 olarak kalır.",
              "pitfall": "Sayı ekranda kayarken değerin kendiliğinden güncelleneceğini sanmak."
            },
            {
              "term": "Eşik",
              "definition": "Bir kararın değiştiği sınır değerdir.",
              "example": "Sıcaklık > 30 koşulunda eşik 30'dur; 31 iken üzgün yüz, 30 iken yok.",
              "pitfall": "Sınır değerinin hangi tarafa girdiğini karıştırmak; 30 > 30 yanlıştır."
            },
            {
              "term": "Çubuk grafik",
              "definition": "Bir değeri, en çok değere oranlayıp 25 LED'in alttan yukarıya dolan kısmı olarak gösteren blok.",
              "example": "20 değeri, en çok 50 ise 20 ÷ 50 × 25 = 10 LED yakar.",
              "pitfall": "En çok değerini yanlış yazmak; ışık için 5 yazarsan ışık 5'i geçince bütün ekran yanar."
            },
            {
              "term": "Karşılaştırma",
              "definition": "İki sayıyı >, <, = gibi bir işaretle karşılaştırıp doğru ya da yanlış üreten blok.",
              "example": "sıcaklık > 30 serin odada yanlış, sıcak odada doğru olur.",
              "pitfall": "İşareti ters seçmek; < yazarsan serinken üzgün yüz görürsün."
            }
          ],
          "quiz": [
            {
              "id": "m10h3d2-q1",
              "kind": "numeric",
              "prompt": "Sıcaklık 20 derece. Programda \"çubuk grafik sıcaklık / en çok 50\" bloğu çalışıyor. Kaç LED yanar?",
              "answer": 10,
              "tolerance": 0,
              "unit": "LED",
              "explanation": "Oran 20 ÷ 50 = 0,4. Çubuk 25 LED'e dağıtılır: 0,4 × 25 = 10. 20 değeri en çok olan 50'nin yarısından (25) küçüktür, bu yüzden ekranın yarısından azı yanar.",
              "skills": [
                "mk-bar",
                "mk-sensors"
              ]
            },
            {
              "id": "m10h3d2-q2",
              "kind": "numeric",
              "prompt": "Işık seviyesi 64. Programda \"çubuk grafik ışık seviyesi / en çok 255\" çalışıyor. Kaç LED yanar? (Sonucu en yakın tam sayıya yuvarla.)",
              "answer": 6,
              "tolerance": 0,
              "unit": "LED",
              "explanation": "64 ÷ 255 yaklaşık 0,251 eder. 0,251 × 25 yaklaşık 6,27 olur. LED yarım yanamayacağı için en yakın tam sayı olan 6 alınır.",
              "skills": [
                "mk-bar",
                "mk-sensors"
              ]
            },
            {
              "id": "m10h3d2-q3",
              "kind": "predict-output",
              "prompt": "Sıcaklık kaydırıcısı tam 30'da. A düğmesine basılıyor.\n\n```\ndüğme A basılınca:\n  sayıyı göster sıcaklık\n  eğer sıcaklık > 30 ise\n    simgeyi göster üzgün yüz\n```\n\nEkranda ne görülür?",
              "options": [
                "Önce 30 kayar, sonra üzgün yüz çıkar",
                "Yalnız 30 kayar, üzgün yüz çıkmaz",
                "Yalnız üzgün yüz çıkar",
                "Hiçbir şey çıkmaz"
              ],
              "answer": 1,
              "explanation": "Sayıyı göster bloğu 30'u kaydırır. Ama 30 > 30 yanlıştır, çünkü 30 kendisinden büyük değildir. Bu yüzden eğer bloğunun içi çalışmaz ve üzgün yüz çıkmaz. Üzgün yüzü 31'de görürsün; 30'da da görmek istersen ≥ kullanırsın.",
              "skills": [
                "mk-threshold",
                "mk-conditions"
              ]
            },
            {
              "id": "m10h3d2-q4",
              "kind": "find-bug",
              "prompt": "Işık çubuğu hep tüm ekranı yakıyor, kaydırıcı ortada olsa bile. Kod şu:\n\n```\ndüğme B basılınca:\n  çubuk grafik ışık seviyesi / en çok 5\n```\n\nHata nerede?",
              "options": [
                "Işık seviyesi bloğu yanlış seçilmiş",
                "En çok değeri 5; ışık 255'e kadar çıktığı için en çok 255 olmalı",
                "Çubuk grafik yerine sayıyı göster kullanılmalı",
                "B düğmesi yerine A düğmesi kullanılmalı"
              ],
              "answer": 1,
              "explanation": "Oran ışık ÷ en çok olduğu için en çok 5 iken ışık 5'i geçer geçmez oran 1'den büyük olur ve ekran tamamen yanar. Işık 255'e kadar çıkar, bu yüzden en çok 255 yazılmalıdır.",
              "skills": [
                "mk-bar",
                "mk-debug"
              ]
            },
            {
              "id": "m10h3d2-q5",
              "kind": "mcq",
              "prompt": "A'ya bastın ve ekranda 21 sayısı kayıyor. Sayı kayarken sıcaklık kaydırıcısını 35'e çektin. Bu sayı için ne olur?",
              "options": [
                "Kayan sayı 35'e dönüşür",
                "21 olarak kayar, 35 görünmez",
                "Program durur",
                "Ekran silinir"
              ],
              "answer": 1,
              "explanation": "Sıcaklık bloğu çalıştığı an değeri okur ve o okumayla sayıyı hazırlar. Sonradan kaydırıcıyı değiştirmek eski okumayı değiştirmez. 35'i görmek için A'ya yeniden basman gerekir.",
              "skills": [
                "mk-sensors"
              ]
            }
          ]
        },
        {
          "title": "Pusula: kuzeyi bul",
          "durationMin": 25,
          "problem": "Bir dağda yolunu kaybettiysen, pusula iğnesi her zaman kuzeyi gösterir. Sen nereye dönersen dön, iğne yine kuzeyi bulur. Kartın pusulası da var. Bu derste kendi kuzey bulucunu yapacaksın.",
          "contentMd": "### Pusula derecesi\nKartın pusulası, kartın üst kenarının hangi yöne baktığını **derece** olarak söyler:\n\n| Derece | Yön |\n|---|---|\n| 0 | Kuzey (K) |\n| 90 | Doğu (D) |\n| 180 | Güney (G) |\n| 270 | Batı (B) |\n\nDereceler saat yönünde artar. 0'dan 359'a kadar gider; 360 yine 0'dır.\n\nSanal kartta **Pusula ve sensörler** bölümünde bir kadran ve bir **Pusula** kaydırıcısı var. Kadranı tutup çevirerek ya da kaydırıcıyı oynatarak kartı döndürmüş gibi olursun. **Kuzeye çevir** düğmesi derecesi 0 yapar.\n\n### Yeni bloklar\n- **Giriş** kategorisi: **pusula yönü (derece)** pusulanın sayısını verir. **[A] düğmesi basılı mı?** o an A'ya basılıyorsa doğru verir.\n- **LED** kategorisi: **oku [0] derece yönünde göster** verilen yöne bakan bir ok çizer. 0 yukarı, 90 sağ, 180 aşağı, 270 sol demektir.\n\n### Kuzey oku nasıl bulunur?\nKart döndükçe kuzey kartın üstünde farklı bir yerde kalır. Kart doğuya (90) dönünce kuzey kartın **soluna** düşer. Yani ok sola bakmalıdır. Kartın dönüşü ne kadarsa okun bu kadar ters yöne dönmesi gerekir:\n\n**ok açısı = 360 − pusula**\n\n| Pusula | 360 − pusula | Ok |\n|---|---|---|\n| 0 | 360 (= 0) | yukarı |\n| 90 | 270 | sol |\n| 180 | 180 | aşağı |\n| 270 | 90 | sağ |\n\n### Program: kuzey bulucu\nEditörde bir **sonsuza kadar** bloğu hazır.\n\n1. **sonsuza kadar** içine **Mantık** kategorisinden **eğer ... ise ... değilse** bloğunu koy (iki çeşit eğer var; \"değilse\" olanı al).\n2. Koşul yuvasına **Giriş** kategorisinden **[A] düğmesi basılı mı?** bloğunu tak.\n3. \"ise\" kısmına **Temel** kategorisinden **sayıyı göster** bloğunu koy ve içine **pusula yönü (derece)** tak.\n4. \"değilse\" kısmına **LED** kategorisinden **oku [0] derece yönünde göster** bloğunu koy.\n5. Bloğun içindeki 0'ı silip **Matematik** kategorisinden **[ ] + [ ]** bloğunu tak. Orta işareti **−** olarak değiştir. Sol deliğe 360, sağ deliğe **pusula yönü (derece)** bloğunu koy.\n6. ▶ **Çalıştır**. Pusula kaydırıcısını 0, 90, 180 yap ve oku izle. Sonra pusulayı 135 yap ve A düğmesini basılı tut.\n\n### Beklenen sonuç\nPusula 0'dayken ok yukarıyı, 90'dayken sola, 180'deyken aşağıyı gösterir. A'yı basılı tutunca ekranda 135 gibi pusula derecesi görünür, bırakınca ok geri gelir. Beş hedefin hepsinde ✓ olmalı.\n\n### Nasıl çalışıyor?\n- **sonsuza kadar** bloğu her an pusulaya bakar ve oku günceller. Bu yüzden pusulayı çevirdiğinde ok anında tepki verir.\n- **eğer A basılı mı? ise ... değilse** iki durumdan birini seçer: A basılıysa sayı, değilse ok.\n- Oku çizen blok yalnızca sekiz yöne (kuzey, kuzeydoğu, doğu...) bakabilir. Verdiğin açıyı en yakın yöne yuvarlar. Örneğin 100 derece doğuya yuvarlanır.\n- **JavaScript** sekmesinde `screen.showArrowAngle(360 - input.compass())` satırını bulabilirsin.\n\n### Dene\n1. Pusula derecesini 45'e çevir ve oku gözlemle. Hangi yöne bakıyor?\n2. Okun üstüne yön harfi yazdır: eğer pusula 10'dan küçükse ekranda \"K\" yazsın. Hangi bloğa ihtiyacın var?\n3. Pusulayı 270 yap ve oku tahmin et. Sonra çalıştırıp doğrula.\n\n### Sık yapılan hatalar\n- **Ok açısını yanlış hesaplamak.** Okun açısı pusulanın kendisi olursa ok dönüşle **aynı** yönde döner, kuzeyi değil. 360 çıkarmak okun ters yöne dönmesini sağlar.\n- **Eksi işaretini değiştirmeyi unutmak.** Aritmetik bloğu varsayılan olarak toplar. Orta işarete tıklayıp − seçmelisin.\n- **Aynı ekrana iki yerden yazmak.** Okla ilgili işi hem **sonsuza kadar** hem de bir düğme bloğuyla yaparsan ikisi ekran için yarışır, görüntü kararsız olur. Bu yüzden A'ya olay bloğu yazmadık, **A basılı mı?** diye sorduk.",
          "question": "Pusula iğnesi neden hep kuzeyi gösterir? Navigasyon uygulamaları pusulayı nerede kullanıyor olabilir? Kartı yerden yukarı kaldırınca pusula yine çalışır mı, sence?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Pusula derecesinin yönleri nasıl anlattığını\n- Kuzeyi gösteren okun açısını neden \"360 eksi pusula\" ile bulduğunu\n- Dairesel sayıda 360'ın 0 ile aynı olduğunu\n- Ekranı tek yerden yönetmenin neden önemli olduğunu\n\n### Önceden bilmen gerekenler\n- Ders 5: sonsuza kadar bloğu\n- Ders 12: sensör okuma ve sanal kaydırıcılar\n- Ders 8: eğer ... ise ... değilse\n- Çıkarma ve toplama (ondalık sayı gerekmez)\n\n### Derece ve yön\nPusula, kartın üst kenarının hangi yöne baktığını **derece** olarak söyler. Dereceler kuzeyden başlayıp saat yönünde artar.\n\n```\n   0 = Kuzey\n  90 = Doğu\n 180 = Güney\n 270 = Batı\n```\n\nBir tam tur 360 derecedir, ama 360 yine kuzeydir, yani 0 ile aynıdır. Sayı 359'dan sonra 0'a döner. Bu yüzden kart 350 dereceden 20 derece daha sağa dönerse pusula 370 değil, 370 − 360 = 10 gösterir.\n\n### Okun açısı: neden 360 eksi pusula?\nKartı döndürdükçe kuzey, kartın üstünde başka bir yere kayar. Kart doğuya (90) dönünce kuzey kartın soluna düşer. Ok kuzeyi göstereceğine göre kart ne kadar döndüyse ok o kadar **ters** dönmelidir:\n\n```\nok açısı = 360 - pusula\n```\n\n| pusula | 360 - pusula | ok |\n|---|---|---|\n| 0 | 360 (= 0) | yukarı |\n| 90 | 270 | sol |\n| 180 | 180 | aşağı |\n| 270 | 90 | sağ |\n\nPusulayı doğrudan (ya da 360 ekleyerek) okun açısı yaparsan ok kartla **birlikte** döner ve kuzeyi göstermez.\n\n### Ok sekiz yöne bakar\nKartın ekranı 5×5'tir, bu yüzden oku bloğu yalnız sekiz yön çizer: yukarı, sağ yukarı, sağ, sağ aşağı, aşağı, sol aşağı, sol, sol yukarı. Verdiğin açıyı en yakın yöne yuvarlar. 100 derece, 90'a (sağ) en yakın olduğu için sağ ok çıkar.\n\n### Ekranı tek yerden yönet\nSonsuza kadar bloğu oku her turda yeniler. Aynı ekrana bir düğme bloğundan da yazarsan iki blok birbirinin çizimini siler. Bu yüzden düğmeyi bir **olay** olarak değil, **\"A basılı mı?\"** sorusu olarak sorarız. Böylece ekrana yalnız sonsuza kadar bloğu yazar.\n\n### Özet\nPusula 0 ile 359 arasında bir derece verir: 0 kuzey, 90 doğu, 180 güney, 270 batı. 360 yine 0'dır. Kuzeyi gösteren ok için açı 360 eksi pusuladır, çünkü ok kartın dönüşüne ters yönde dönmelidir. Ok sekiz yöne bakar ve açıyı en yakın yöne yuvarlar. Ekran çakışmasını önlemek için çizimi tek bir döngü içinde topla.",
          "concepts": [
            {
              "term": "Pusula derecesi",
              "definition": "Kartın üst kenarının baktığı yönün kuzeyden saat yönünde ölçülen açısı: 0 kuzey, 90 doğu, 180 güney, 270 batı.",
              "example": "Pusula 90 gösteriyorsa kartın üstü doğuya bakıyordur.",
              "pitfall": "180'i kuzey sanmak; kuzey 0'dır, 180 güneydir."
            },
            {
              "term": "360 ve 0 aynıdır",
              "definition": "Bir tam tur 360 derecedir; 360 dereceye gelince yön yine kuzeydir ve sayı 0'a döner.",
              "example": "Pusula 350 iken 20 derece sağa dönersen pusula 10 olur.",
              "pitfall": "Pusulanın 359'dan sonra 360, 361 diye devam edeceğini sanmak."
            },
            {
              "term": "Ok açısı = 360 - pusula",
              "definition": "Kuzeyi gösteren ok kartın dönüşüne ters yönde dönmelidir; bu yüzden açı 360 eksi pusuladır.",
              "example": "Pusula 90 iken ok açısı 270'tir ve ok sola bakar.",
              "pitfall": "Okun açısını doğrudan pusula yapmak; ok kartla birlikte döner, kuzeyi göstermez."
            },
            {
              "term": "Sekiz yönlü ok",
              "definition": "Oku bloğu verilen açıyı en yakın sekiz yöne (45 derece aralıkla) yuvarlar.",
              "example": "100 derece, 90'a en yakın olduğu için sağ ok çıkar.",
              "pitfall": "Okun her dereceyi ayrı ayrı göstereceğini beklemek; 5×5 ekranda yalnız sekiz yön vardır."
            },
            {
              "term": "Basılı mı sorusu",
              "definition": "Düğmeyi olay yerine \"şu an basılı mı?\" diye sorarak, ekrana yalnız sonsuza kadar bloğunun yazmasını sağlarsın.",
              "example": "eğer A basılı mı ise pusula sayısını göster, değilse oku göster.",
              "pitfall": "Aynı ekrana hem düğme olayı hem sonsuza kadar bloğundan yazmak; iki blok birbirinin çizimini siler."
            }
          ],
          "quiz": [
            {
              "id": "m10h3d3-q1",
              "kind": "numeric",
              "prompt": "Pusula 60 derece gösteriyor. Kuzeyi gösteren okun açısı kaç derece olmalıdır? (ok açısı = 360 - pusula)",
              "answer": 300,
              "tolerance": 0,
              "unit": "derece",
              "explanation": "Kart kuzeyden 60 derece sağa dönmüştür. Ok bu dönüşe ters yönde dönmeli, bu yüzden 360 - 60 = 300 derece olur. 60 yazarsan ok kartla aynı yönde döner ve kuzeyi göstermez.",
              "skills": [
                "mk-compass"
              ]
            },
            {
              "id": "m10h3d3-q2",
              "kind": "predict-output",
              "prompt": "Aşağıdaki program çalışıyor. Pusula kaydırıcısı 100 derecede.\n\n```\nsonsuza kadar:\n  oku (360 - pusula yönü) derece yönünde göster\n```\n\nEkranda hangi ok görünür?",
              "options": [
                "Yukarı ok",
                "Sağ ok",
                "Aşağı ok",
                "Sol ok"
              ],
              "answer": 3,
              "explanation": "360 - 100 = 260. Ok bloğu açıyı en yakın sekiz yöne yuvarlar. 260, 270'e (sol) 10 derece, 225'e (sol aşağı) 35 derece uzaktır; en yakını 270'tir, yani sol ok. Kart doğuya doğru döndüğü için kuzey kartın solundadır.",
              "skills": [
                "mk-compass"
              ]
            },
            {
              "id": "m10h3d3-q3",
              "kind": "find-bug",
              "prompt": "Kuzey bulucu, pusula 90 iken sağ ok gösteriyor; oysa kuzey kartın solunda olmalı. Kod şu:\n\n```\nsonsuza kadar:\n  oku (360 + pusula yönü) derece yönünde göster\n```\n\nHata nerede?",
              "options": [
                "Sonsuza kadar yerine başlangıçta kullanılmalı",
                "360 yanlış yazılmış, 180 olmalı",
                "Aritmetik işareti + olmuş; çıkarma (-) olmalı",
                "Oku bloğu yerine sayıyı göster kullanılmalı"
              ],
              "answer": 2,
              "explanation": "360 + 90 = 450 olur ve 450 dereceyi 90 ile aynı yön sayar; ok kartla birlikte döner ve sağ ok çıkar. 360 - 90 = 270 ise sola bakan oku verir. Sorun işaret: toplama yerine çıkarma gerekir; 360 sayısı doğrudur.",
              "skills": [
                "mk-compass",
                "mk-debug"
              ]
            },
            {
              "id": "m10h3d3-q4",
              "kind": "mcq",
              "prompt": "Kuzey bulucu programında A düğmesi için neden ayrı bir olay bloğu yerine \"A basılı mı?\" sorusu kullanıldı?",
              "options": [
                "Olay blokları daha yavaş çalıştığı için",
                "Böylece ekrana yalnız sonsuza kadar bloğu yazar ve iki blok birbirinin çizimini silmez",
                "A düğmesi başka bir şeye bağlanamadığı için",
                "Pusula yalnız eğer bloğuyla okunabildiği için"
              ],
              "answer": 1,
              "explanation": "Sonsuza kadar oku her turda yeniler. Bir de A olayı aynı ekrana yazarsa iki blok sırayla birbirinin çizimini siler ve görüntü kararsız olur. Soru olarak sormak ekran yönetimini tek yerde toplar. Öbür seçenekler gerçek bir sebep değildir.",
              "skills": [
                "mk-display",
                "mk-events"
              ]
            },
            {
              "id": "m10h3d3-q5",
              "kind": "numeric",
              "prompt": "Pusula 350 gösteriyor. Kartı saat yönünde 20 derece daha çevirirsin. Pusula kaç gösterir?",
              "answer": 10,
              "tolerance": 0,
              "unit": "derece",
              "explanation": "350 + 20 = 370 olur, ama bir tur 360 derecedir ve 360 yine kuzeydir. 370 - 360 = 10. Pusula 359'dan sonra 0'a döner, 360'tan fazlasını göstermez.",
              "skills": [
                "mk-compass"
              ]
            }
          ]
        },
        {
          "title": "Ses seviyesi: alkış sayacı",
          "durationMin": 25,
          "problem": "Bazı lambalar el çırpınca yanar. Bazı telefonlar yüksek sesi algılayınca uyarı verir. Bunların hepsinde ortamdaki sesin ne kadar yüksek olduğunu ölçen küçük bir \"kulak\" vardır. Kartın da ses seviyesi bilgisi var. Bu derste alkışları sayacaksın.",
          "contentMd": "### Sanal ses seviyesi\nSanal kartta ses seviyesini **Pusula ve sensörler** bölümündeki **Ses** kaydırıcısı belirler. Değer 0 (sessiz) ile 255 (çok yüksek) arasındadır. Başta 20 civarındadır.\n\n**Giriş** kategorisinde **ses seviyesi** bloğu bu değeri verir.\n\n### Eşik: ne zaman \"yüksek\" sayarız?\nBir alkış sesi kısa ve çok yüksektir. **eğer ses seviyesi > 150 ise** diye sorarsak sadece yüksek sesleri yakalarız. 150 sayısına **eşik** denir.\n\nAlkışı bir kez sayıp bırakmak için, saymadan sonra ekranda sayıyı gösteririz. Sayıyı göstermek kısa bir süre aldığı için aynı alkış iki kez sayılmaz.\n\n### Program: ses ölçer ve alkış sayacı\nEditörde **başlangıçta** ve **sonsuza kadar** blokları hazır. **alkis** değişkeni de hazır.\n\n1. **başlangıçta** içine **alkis değerini [0] yap** bloğu konmuş olmalı.\n2. **sonsuza kadar** içine **Mantık** kategorisinden **eğer ... ise ... değilse** bloğunu koy (iki çeşit eğer var; \"değilse\" olanı al).\n3. Koşul: **ses seviyesi > 150**. Sol deliğe **Giriş** kategorisinden **ses seviyesi**, sağ deliğe 150 koy.\n4. \"ise\" kısmına şunları tak:\n   1. **alkis değerine [1] ekle**\n   2. **sayıyı göster** (içine **alkis**)\n5. \"değilse\" kısmına **LED** kategorisinden **çubuk grafik** bloğunu koy. İlk deliğe **ses seviyesi**, ikinci deliğe 255 koy.\n6. ▶ **Çalıştır**.\n7. **Ses** kaydırıcısını 130'a çek: ekranın yarısından fazlası yanar. Sonra 200'e çek ve hemen geri 20'ye bırak: sayı 1 olur. Bunu üç kez tekrarla.\n\n### Beklenen sonuç\nSessizken ekranda ses çubuğu görünür. Ses seviyesi 150'yi geçince çubuk gider, yerine yarım saniye 1, sonra 2, sonra 3 görünür. Dört hedefin hepsinde ✓ olmalı.\n\n### Nasıl çalışıyor?\n- **sonsuza kadar** bloğu sürekli dinler: ses yüksekse sayar, değilse çubuğu çizer.\n- **sayıyı göster** bloğu yarım saniye kadar sürer. Bu süre boyunca program bir sonraki turu beklemiş olur. Böylece bir kısa alkış iki kere sayılmaz.\n- Çubuk grafik ses seviyesini 25 LED'e dağıtır: 130 gibi bir değer yaklaşık 13 LED yakar.\n- **alkis** her sayıda 1 artar. Sayaç sıfırlanmaz; ▶ düğmesine yeniden basınca sıfırdan başlar.\n\n### Dene\n1. Eşiği 100 yap ve daha hassas bir alkış algılayıcı olsun.\n2. **B düğmesi** için bir olay bloğu ekle: **alkis değerini 0 yap**. Böylece sayaç sıfırlansın.\n3. Sayaç 5'e ulaşınca ekranda kalp gösterecek bir **eğer** daha ekle.\n\n### Sık yapılan hatalar\n- **Kaydırıcıyı yüksekte bırakmak.** Ses 150'nin üstünde kalırsa sayaç yarım saniyede bir artmaya devam eder. Sesi hemen geri indir.\n- **Eşiği çok düşük seçmek.** Ses başta 20 olduğu için eşik 10 olursa hep \"yüksek\" sayılır ve sayaç durmadan artar.\n- **Çubuğu yanlış kola koymak.** Çubuk **değilse** kolunda olmalı. **ise** kolunda olursa sayı hemen silinir.",
          "question": "Sesle çalışan bir cihazın yanlışlıkla çalışmasını nasıl önleriz? Gürültülü bir kalabalıkta alkış sayacı doğru çalışır mı? Sence insanlar mikrofonla dinlenirken hangi gizlilik kuralları gerekir?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Ses seviyesinin 0 ile 255 arasında bir sayı olduğunu\n- Doğru bir eşik seçmenin neden önemli olduğunu\n- Değişkenle sayaç tutmayı ve her turda onu arttırmayı\n- Bir ekran gösteriminin süre aldığını ve bunun sayımı nasıl etkilediğini\n\n### Önceden bilmen gerekenler\n- Ders 5: sonsuza kadar bloğu\n- Ders 7: değişken ve sayaç (değerine ekle)\n- Ders 12: eşik ve çubuk grafik\n\n### Ses de bir sayıdır\nKart ortamdaki sesin ne kadar yüksek olduğunu **ses seviyesi** olarak bir sayıya çevirir. 0 sessizlik, 255 çok yüksek ses demektir. Sanal kartta bunu Ses kaydırıcısıyla verirsin. Başlangıçta değer yaklaşık 20'dir; bu \"oda sesi\" gibi düşünülebilir.\n\n### Eşik seçmek\nAlkış kısa ve yüksek bir sestir. Bir alkışı yakalamak için ses seviyesini bir **eşik** sayısıyla karşılaştırırsın. Eşik, oda sesinden büyük ama alkıştan küçük olmalıdır.\n\n```\noda sesi        ~  20\nalkış           ~ 200\niyi bir eşik    :  100 ile 150 arası\nçok düşük eşik  :  10  (oda sesi bile 20 > 10)\nçok yüksek eşik :  250 (alkış hiç geçemez)\n```\n\nEşik çok düşükse sayaç boşuna artar. Çok yüksekse hiçbir alkışı saymaz.\n\n### Sayaç: değişken ve artırma\nBir değer kutusu olan **değişken**, tur boyunca değerini korur. Alkış sayacı için `alkis` adlı bir değişken kullanırsın. Başlangıçta 0 yaparsın. Her alkışta **alkis değerine 1 ekle** dersin. Sadece \"sayıyı göster 1\" yazsaydın, ekranda hep 1 görürdün; sayacın hatırlaması için değişken şarttır.\n\n```\nbaşlangıçta:  alkis = 0\nsonsuza kadar:\n  eğer ses seviyesi > 150 ise\n    alkis değerine 1 ekle\n    sayıyı göster alkis\n  değilse\n    çubuk grafik ses seviyesi / en çok 255\n```\n\n### Gösterim süre alır\nTek haneli bir sayıyı göstermek yaklaşık 0,6 saniye sürer (600 ms), turun sonunda da kısa bir 20 ms bekleme vardır. Yani bir tur yaklaşık 620 ms sürer. Ses yüksek kalırsa her tur sayaç bir artar:\n\n```\nSes 200'de sabit kalırsa, 2000 ms içinde:\nturlar 0, 620, 1240, 1860. ms'te başlar  ->  4 artış\n```\n\nKısa bir alkışta ses hemen düşer; bu süre sayesinde aynı alkış iki kez sayılmaz.\n\n### Özet\nSes seviyesi 0-255 arası bir sayıdır ve oda sesi yaklaşık 20'dir. Eşik, oda sesinden büyük, alkıştan küçük seçilmelidir. Sayaç tutmak için değişken gerekir: başlangıçta 0 yapılır, her alkışta 1 eklenir. Sayıyı göstermek yaklaşık 600 ms sürer; ses yüksek kalırsa sayaç bu süreye göre tekrar tekrar artar.",
          "concepts": [
            {
              "term": "Ses seviyesi",
              "definition": "Ortamdaki sesin ne kadar yüksek olduğunu gösteren 0-255 arası sayı.",
              "example": "Sessiz odada değer yaklaşık 20, alkışta 200 civarıdır.",
              "pitfall": "Sesin ne konuşulduğunu bildiğini sanmak; yalnız ne kadar yüksek olduğunu söyler."
            },
            {
              "term": "Eşik seçimi",
              "definition": "Eşik, oda sesinden büyük ama algılanacak sesten küçük olmalıdır.",
              "example": "Oda sesi 20, alkış 200 ise 100 ile 150 arası iyi bir eşiktir.",
              "pitfall": "Eşiği çok düşük seçmek (10); oda sesi bile 20 olduğu için sayaç sürekli artar."
            },
            {
              "term": "Değişken",
              "definition": "Değerini tur boyunca saklayan, adı olan bir kutu.",
              "example": "alkis değişkeni başlangıçta 0 olur, her alkışta bir artar.",
              "pitfall": "Sayacı \"sayıyı göster 1\" ile yapmak; hatırlama olmadığı için hep 1 görünür."
            },
            {
              "term": "değerine ekle",
              "definition": "Bir değişkenin mevcut değerine verilen sayıyı ekler.",
              "example": "alkis değerine 1 ekle, alkis 3 iken 4 yapar.",
              "pitfall": "\"değerini 1 yap\" ile karıştırmak; o her seferinde değişkeni 1'e sıfırlar."
            },
            {
              "term": "Gösterim süresi",
              "definition": "Tek haneli bir sayıyı göstermek yaklaşık 600 ms sürer; bu süre boyunca program sonraki turu bekler.",
              "example": "Ses yüksek kalırsa her tur yaklaşık 620 ms sürer ve sayaç o aralıkla artar.",
              "pitfall": "Kaydırıcıyı yüksekte bırakmak; aynı alkış tekrar tekrar sayılır."
            }
          ],
          "quiz": [
            {
              "id": "m10h3d4-q1",
              "kind": "numeric",
              "prompt": "Ses seviyesi 170. Programda \"çubuk grafik ses seviyesi / en çok 255\" çalışıyor. Kaç LED yanar? (En yakın tam sayıya yuvarla.)",
              "answer": 17,
              "tolerance": 0,
              "unit": "LED",
              "explanation": "170 ÷ 255 yaklaşık 0,667 eder. 0,667 × 25 yaklaşık 16,67 olur. En yakın tam sayı 17'dir.",
              "skills": [
                "mk-bar",
                "mk-sensors"
              ]
            },
            {
              "id": "m10h3d4-q2",
              "kind": "numeric",
              "prompt": "Alkış sayacı çalışıyor. Ses kaydırıcısı 200'de unutuldu ve orada kaldı. Bir tur, sayıyı göstermek için 600 ms ve tur sonunda 20 ms bekleme olmak üzere 620 ms sürüyor. İlk tur ses 200 olduğu anda başlıyor. 2000 ms sonra alkis kaç olur? (Tur başında 1 artar.)",
              "answer": 4,
              "tolerance": 0,
              "explanation": "Turlar 0, 620, 1240 ve 1860. ms'te başlar; her tur başında sayaç 1 artar. Bir sonraki tur 2480. ms'te başlar ve 2000 ms'ten sonradır. Bu yüzden 4 artış olur. Aynı sonucu sanal kartta sınayabilirsin.",
              "skills": [
                "mk-variables",
                "mk-threshold"
              ]
            },
            {
              "id": "m10h3d4-q3",
              "kind": "find-bug",
              "prompt": "Alkış sayacı, odada kimse ses çıkarmıyorken (ses seviyesi yaklaşık 20) durmadan artıyor. Kod şu:\n\n```\nsonsuza kadar:\n  eğer ses seviyesi > 10 ise\n    alkis değerine 1 ekle\n    sayıyı göster alkis\n```\n\nHata nerede?",
              "options": [
                "alkis değişkeni oluşturulmamış",
                "Eşik 10 çok düşük; oda sesi 20 olduğu için hep yüksek sayılıyor",
                "sonsuza kadar yerine başlangıçta kullanılmalı",
                "sayıyı göster bloğu eğer'in dışında olmalı"
              ],
              "answer": 1,
              "explanation": "Oda sesi yaklaşık 20 ve 20 > 10 doğrudur. Koşul hep doğru olduğu için sayaç sürekli artar. Eşik, oda sesinden büyük (örneğin 100 ya da 150) seçilmelidir. Öbür seçenekler sayacın artmasını açıklamaz.",
              "skills": [
                "mk-threshold",
                "mk-debug"
              ]
            },
            {
              "id": "m10h3d4-q4",
              "kind": "mcq",
              "prompt": "Alkış sayacı için neden \"alkis\" adlı bir değişken kullanılır?",
              "options": [
                "Çünkü ekranda yazı göstermek için değişken zorunludur",
                "Çünkü sayacın önceki değerini hatırlaması ve her alkışta üstüne eklenmesi gerekir",
                "Çünkü eşik ancak değişkenle karşılaştırılabilir",
                "Çünkü ses seviyesi bloğu bir değişken olmadan çalışmaz"
              ],
              "answer": 1,
              "explanation": "Her alkışta bir önceki sayıyı hatırlamak ve ona 1 eklemek gerekir; bunu yalnız değişken yapar. \"Sayıyı göster 1\" yazsaydın hep 1 görürdün. Eşik karşılaştırması ve ses bloğu değişkensiz de çalışır.",
              "skills": [
                "mk-variables"
              ]
            },
            {
              "id": "m10h3d4-q5",
              "kind": "predict-output",
              "prompt": "sayac başta 0. Aşağıdaki iki olay bloğu var:\n\n```\ndüğme B basılınca:\n  sayac değerine 2 ekle\n\ndüğme A basılınca:\n  sayac değerini (sayac × 2) yap\n```\n\nSırayla şu düğmelere basılıyor: B, A, B. En sonda sayac kaç olur?",
              "options": [
                "4",
                "8",
                "2",
                "6"
              ],
              "answer": 3,
              "explanation": "B: 0 + 2 = 2. A: 2 × 2 = 4. B: 4 + 2 = 6. Sıra önemlidir: önce A, sonra B'ye bassaydın sonuç farklı olurdu. 4 cevabı son B basışını unutmaktan, 2 cevabı yalnız ilk B'yi saymaktan, 8 ise son basışı B yerine A sanmaktan çıkar.",
              "skills": [
                "mk-variables",
                "mk-events"
              ]
            }
          ]
        },
        {
          "title": "Proje: Çevre istasyonu",
          "durationMin": 35,
          "problem": "Bir bilim insanı bir odanın nasıl olduğunu anlatmak istese ne ölçer? Sıcaklığa, ışığa ve sese bakar. Şimdi bu üç sensörü tek bir kartta toplayacaksın. Bir düğmeyle hangisini izleyeceğini seç, ekran çubukla göstersin, istediğinde de sayıyı oku!",
          "contentMd": "### Proje: Çevre istasyonu\n**Nasıl çalışacak?**\n- **A düğmesi** modu değiştirir: 0 = sıcaklık, 1 = ışık, 2 = ses. Üçüncü basıştan sonra yeniden 0'a döner.\n- Ekran seçili sensörü **çubuk grafik** olarak gösterir.\n- **B düğmesini basılı tutarsan** ekran çubuk yerine sayıyı gösterir.\n\n### Yeni blok: kalan\n**Matematik** kategorisindeki **[ ] ÷ [ ] işleminin kalanı** bloğu bölme işleminden artan sayıyı verir. Örneğin 3 ÷ 3'ün kalanı 0'dır, 4 ÷ 3'ün kalanı 1'dir. Mod 0, 1, 2'den sonra yeniden 0'a dönsün istiyoruz: **(mod + 1) ÷ 3 işleminin kalanı** tam bunu yapar.\n\n| mod | mod + 1 | ÷ 3 işleminin kalanı |\n|---|---|---|\n| 0 | 1 | 1 |\n| 1 | 2 | 2 |\n| 2 | 3 | 0 |\n\n### Adım adım\nEditörde **başlangıçta**, **düğme A** ve **sonsuza kadar** blokları hazır. **mod**, **okuma** ve **enCok** adlı değişkenler de hazır.\n\n1. **A düğmesi:** içine **mod değerini [0] yap** bloğunu koy. 0'ın yerine **Matematik** kategorisinden **[ ] ÷ [ ] işleminin kalanı** bloğunu tak. Birinci deliğe **[ ] + [ ]** bloğu tak: **mod** ve 1. İkinci deliğe 3 yaz.\n2. **sonsuza kadar** bloğunun içine ilk olarak seçili moda göre okumayı hazırla. **eğer mod = 0 ise ... değilse** bloğu koy:\n   1. **\"ise\":** **okuma değerini [sıcaklık (°C)] yap**, **enCok değerini [40] yap**.\n   2. **\"değilse\":** içine ikinci bir **eğer mod = 1 ise ... değilse** bloğu koy.\n      - **\"ise\":** **okuma değerini [ışık seviyesi] yap**, **enCok değerini [255] yap**.\n      - **\"değilse\":** **okuma değerini [ses seviyesi] yap**, **enCok değerini [255] yap**.\n3. Aynı **sonsuza kadar** içinde, bu eğer bloğunun altına ikinci bir **eğer ... ise ... değilse** koy. Koşul: **[B] düğmesi basılı mı?**\n   - **\"ise\":** **sayıyı göster okuma**.\n   - **\"değilse\":** **çubuk grafik okuma / en çok enCok**.\n4. ▶ **Çalıştır**. Sıcaklığı 30 yap: çubuk üçte ikiden fazla dolar. A'ya basarak ışığa, sonra sese geç. B'yi basılı tutup sayıyı oku. A'ya üçüncü basışta başa dönülmeli.\n\n### Beklenen sonuç\nBaşta sıcaklık modundasın. Sıcaklığı 30 yapınca çubuk yaklaşık 19 LED'i yakar (30 ÷ 40 oranı). A'ya basınca ışık çubuğu, tekrar basınca ses çubuğu, üçüncü basışta tekrar sıcaklık gelir. B'yi basılı tutunca ilgili sayı ekranda kayar. Hedefler kutusundaki beş görevin hepsi ✓ olmalı.\n\n### Nasıl çalışıyor?\n- **mod** hangi sensörün izlendiğini tutar. **okuma** seçilen sensörün değeri, **enCok** o değerin alabileceği en büyük sayıdır (sıcaklık için 40, ışık ve ses için 255).\n- **sonsuza kadar** her turda önce okumayı hazırlar, sonra ekranı çizer. Ekrana yazan tek yer burasıdır; bu yüzden ekranda görüntü karışmaz.\n- **A düğmesi bloğu** yalnızca modu değiştirir, ekrana dokunmaz.\n- **çubuk grafik okuma / en çok enCok** oranı çizer: okuma 30, enCok 40 ise 30 ÷ 40 = 0,75; bu da 25 LED'in yaklaşık 19'u.\n- Aynı programdaki bütün parçalar (olay, değişken, eğer, çubuk grafik, kalan) bu hafta öğrendiklerinin toplamı.\n\n### Dene\n1. Sıcaklık çubuğunun en büyük değerini 50 yap. Aynı sıcaklıkta kaç LED yanıyor? Neden?\n2. Dördüncü bir mod ekle: **Pusula**. En çok 360 olsun. Dört mod olunca A bloğunda hangi sayıyı değiştirmelisin? (İpucu: kalan bloğundaki bölen sayı.)\n3. Çubuk grafik yerine **eğer okuma yüksek ise kalp göster** gibi bir uyarı ekle.\n\n### Sık yapılan hatalar\n- **Kalanı değil sayıyı yazmak.** A bloğunda doğrudan **mod + 1** yazarsan mod hiç başa dönmez ve 3, 4, 5 diye büyür. Kalan bloğu 3'e bölünce 0, 1, 2 döngüsünü korur.\n- **enCok değerini unutmak.** Sıcaklık için 255 bırakırsan çubuk neredeyse hiç dolmaz.\n- **Ekrana iki yerden yazmak.** B'ye ayrı bir olay bloğu yazıp sayıyı oradan göstermeye çalışırsan, **sonsuza kadar** ekranı hemen siler. Hepsini tek yerde, **sonsuza kadar** içinde topla.\n- **Sensör kaydırıcısını değiştirmeyi unutmak.** Çubuk hiç değişmezse sanal sensörlerin kaydırıcısını oynat.",
          "question": "Gerçek bir hava istasyonu hangi başka şeyleri ölçerdi? Bu kartın üç sensörünü nerede kullanırdın: sera, sınıf, ya da kendi odan? Hangi ölçümün senin için en önemli olduğunu düşün ve neden olduğunu anlat.",
          "explainerMd": "### Bu derste öğreneceklerin\n- Birden çok işi tek bir \"mod\" değişkeniyle seçmeyi\n- Kalan işlemiyle 0, 1, 2 döngüsünü kurmayı\n- Önce veriyi hazırlayıp sonra ekrana çizmenin neden temiz bir yöntem olduğunu\n- Farklı sensörler için en çok değerini doğru seçmeyi\n\n### Önceden bilmen gerekenler\n- Ders 7: değişken\n- Ders 12: çubuk grafik ve eşik\n- Ders 13: ekranı tek yerden yönetmek\n- Ders 14: sayaç ve ses sensörü\n\n### Mod: şimdi hangi iş?\nİstasyon üç sensörü sırayla gösterecek. Hangi sensörün seçili olduğunu **mod** adlı bir değişken tutar:\n\n```\nmod 0 = sıcaklık\nmod 1 = ışık\nmod 2 = ses\n```\n\nA düğmesine her basışta mod bir ilerler. Ama 2'den sonra 3 olmamalı, tekrar 0'a dönmeli.\n\n### Kalan işlemi\n**Kalan**, bölmeden artan sayıdır. 7 ÷ 3 = 2, kalan 1. **(mod + 1) ÷ 3 işleminin kalanı** tam bu döngüyü verir:\n\n| mod | mod + 1 | ÷ 3 kalanı |\n|---|---|---|\n| 0 | 1 | 1 |\n| 1 | 2 | 2 |\n| 2 | 3 | 0 |\n\nBöylece kaç kez basarsan bas, mod hep 0, 1, 2 aralığında kalır. n kez basıldıktan sonra mod = n ÷ 3'ün kalanıdır; 7 basışta mod 1 olur.\n\n### Önce hazırla, sonra çiz\nSonsuza kadar bloğu iki iş yapar. Birincisi, seçili moda göre iki değişken hazırlar:\n\n```\nokuma : seçili sensörün değeri\nenCok : o sensörün alabileceği en büyük değer\n         sıcaklık 40, ışık 255, ses 255\n```\n\nİkincisi ekrana çizer: B basılıysa sayı, değilse **çubuk grafik okuma / en çok enCok**. Ekrana yazan tek yer burasıdır, bu yüzden görüntü karışmaz.\n\n### En çok değeri orantıyı belirler\nAynı sıcaklık farklı en çok değerinde farklı çubuk verir:\n\n| okuma | enCok | yanan LED |\n|---|---|---|\n| 30 | 40 | 19 |\n| 30 | 50 | 15 |\n| 21 | 255 | 2 |\n\nÜçüncü satır sık bir hata: sıcaklığa ışığın ölçeğini (255) verirsen çubuk neredeyse hiç dolmaz.\n\n### Seçmeli zincir\nÜç mod için iç içe iki eğer kullanırsın: önce mod 0 mı diye sorarsın, değilse mod 1 mi diye. İkisi de değilse mod 2'dir. Bu nedenle mod 3 gibi beklenmeyen bir değer, kimse yakalamadığı için hep ses moduna düşer.\n\n### Özet\nMod değişkeni hangi sensörün izlendiğini tutar. Kalan işlemi (mod + 1) ÷ 3 ile modu 0, 1, 2 döngüsünde tutar. Program önce okuma ve enCok değişkenlerini hazırlar, sonra ekrana tek yerden çizer. En çok değeri her sensörün gerçek aralığına göre seçilmelidir; yoksa çubuk orantısız olur.",
          "concepts": [
            {
              "term": "Mod değişkeni",
              "definition": "Hangi işin seçili olduğunu tutan değişken. Çevre istasyonunda 0 sıcaklık, 1 ışık, 2 ses demektir.",
              "example": "mod 1 iken program ışığı okur ve ışık çubuğunu çizer.",
              "pitfall": "Modu A düğmesinde ekrana da çizdirmek; düğme yalnız modu değiştirmelidir."
            },
            {
              "term": "Kalan işlemi",
              "definition": "Bölmeden artan sayıdır. (mod + 1) ÷ 3 işleminin kalanı modu 0, 1, 2, 0, ... döngüsünde tutar.",
              "example": "mod 2 iken (2 + 1) ÷ 3 = 1 ve kalan 0 olur; mod başa döner.",
              "pitfall": "Kalan yerine doğrudan mod + 1 yazmak; mod 3, 4, 5 diye büyür ve başa dönmez."
            },
            {
              "term": "okuma ve enCok",
              "definition": "Seçili sensörün değerini ve o sensörün alabileceği en büyük sayıyı tutan iki değişken.",
              "example": "Sıcaklık modunda okuma sıcaklık, enCok 40 olur.",
              "pitfall": "enCok'u her sensör için aynı bırakmak; sıcaklığa 255 verirsen çubuk neredeyse hiç dolmaz."
            },
            {
              "term": "Önce hazırla sonra çiz",
              "definition": "Program önce değişkenleri doldurur, sonra ekranı tek bir yerden çizer.",
              "example": "sonsuza kadar içinde önce okuma ve enCok hazırlanır, sonra çubuk ya da sayı çizilir.",
              "pitfall": "Aynı ekrana iki yerden yazmak; biri diğerinin çizimini hemen siler."
            },
            {
              "term": "İç içe eğer zinciri",
              "definition": "Üç seçenekten birini seçmek için eğer bloğunun değilse koluna ikinci bir eğer koymak.",
              "example": "Önce mod 0 mı diye sorulur, değilse mod 1 mi diye sorulur, ikisi de değilse mod 2'dir.",
              "pitfall": "Beklenmeyen bir mod değerinin (örneğin 3) sessizce son kola düşeceğini fark etmemek."
            }
          ],
          "quiz": [
            {
              "id": "m10h3d5-q1",
              "kind": "numeric",
              "prompt": "A bloğu şöyle: mod değerini ((mod + 1) ÷ 3 işleminin kalanı) yap. mod başta 0. A düğmesine toplam 7 kez basılıyor. Sonunda mod kaç olur?",
              "answer": 1,
              "tolerance": 0,
              "explanation": "Her basışta mod bir ilerler ve 3'e gelince 0'a döner: 1, 2, 0, 1, 2, 0, 1. Yedi basış sonunda mod 1'dir. Kısayol: 7 ÷ 3 = 2 kalan 1.",
              "skills": [
                "mk-modulo",
                "mk-variables"
              ]
            },
            {
              "id": "m10h3d5-q2",
              "kind": "numeric",
              "prompt": "Sıcaklık modunda sıcaklık 10 derece ve enCok 40. Çubuk grafik kaç LED yakar? (En yakın tam sayıya yuvarla.)",
              "answer": 6,
              "tolerance": 0,
              "unit": "LED",
              "explanation": "Oran 10 ÷ 40 = 0,25. 0,25 × 25 = 6,25 eder. En yakın tam sayı 6'dır.",
              "skills": [
                "mk-bar",
                "mk-sensors"
              ]
            },
            {
              "id": "m10h3d5-q3",
              "kind": "find-bug",
              "prompt": "Çevre istasyonunda A'ya her basışta mod ilerliyor, ama dördüncü basıştan sonra ekran hep ses çubuğunda kalıyor; sıcaklığa dönmüyor. A bloğu şu:\n\n```\ndüğme A basılınca:\n  mod değerini (mod + 1) yap\n```\n\nHata nerede?",
              "options": [
                "A düğmesi yerine B düğmesi kullanılmalı",
                "Kalan işlemi yok; mod 3, 4, ... diye büyüyor ve iç içe eğer hep ses koluna düşüyor",
                "mod değişkeni başlangıçta 0 yapılmamalı",
                "enCok değeri 40 olmalı"
              ],
              "answer": 1,
              "explanation": "Kalan olmadığı için mod hiç başa dönmez. 3 ve üstü ne 0 ne de 1 olduğundan eğer zinciri son kola, yani ses moduna düşer. (mod + 1) ÷ 3'ün kalanı modu 0-2 aralığında tutar. Başlangıçta mod'u 0 yapmak doğru; sorun orada değildir.",
              "skills": [
                "mk-modulo",
                "mk-debug"
              ]
            },
            {
              "id": "m10h3d5-q4",
              "kind": "predict-output",
              "prompt": "mod = 2 ve ses kaydırıcısı 51. B basılı değil.\n\n```\nsonsuza kadar:\n  eğer mod = 0 ise: okuma = sıcaklık, enCok = 40\n  değilse, eğer mod = 1 ise: okuma = ışık, enCok = 255\n  değilse: okuma = ses seviyesi, enCok = 255\n  çubuk grafik okuma / en çok enCok\n```\n\nEkranda ne görünür?",
              "options": [
                "Alt satırdaki 5 LED yanar",
                "Üst satırdaki 5 LED yanar",
                "Hiç LED yanmaz",
                "Bütün ekran yanar"
              ],
              "answer": 0,
              "explanation": "mod 2 olduğu için son kol çalışır: okuma = 51, enCok = 255. Oran 51 ÷ 255 = 0,2 ve 0,2 × 25 = 5 LED eder. Çubuk alttan yukarı dolduğu için 5 LED alt satırı tamamen kaplar.",
              "skills": [
                "mk-bar",
                "mk-sensors",
                "mk-conditions"
              ]
            },
            {
              "id": "m10h3d5-q5",
              "kind": "mcq",
              "prompt": "Çevre istasyonuna Pusula'yı dördüncü mod olarak eklemek istiyorsun (mod 0-3). A bloğunda hangi sayıyı değiştirmelisin?",
              "options": [
                "(mod + 1) içindeki 1'i 4 yap",
                "Bölen 3'ü 4 yap",
                "enCok değerini 360 yap",
                "Bölünen sayıyı 255 yap"
              ],
              "answer": 1,
              "explanation": "Mod 4 farklı değer alacaksa 0, 1, 2, 3'ten sonra 0'a dönmesi gerekir; bunu (mod + 1) ÷ 4'ün kalanı sağlar. Yani bölen 4 olmalı. +1 aynı kalır. Pusula için enCok 360 olması doğrudur, ama bu A bloğunun değil, okuma kısmının işidir.",
              "skills": [
                "mk-modulo"
              ]
            }
          ]
        }
      ]
    },
    {
      "title": "Müzik ve ses",
      "project": "Sanal piyano",
      "guideMd": "### Hafta hedefleri\nBu haftanın sonunda öğrenci:\n1. Sesin bir titreşim olduğunu, **frekansın** (Hz) perdeyi belirlediğini ve kartın notalarını (Do 262 Hz, La 440 Hz) söyleyebilir.\n2. Tempoya göre bir notanın süresini `60000 / tempo` ile hesaplayabilir ve **sus** bloğuyla ritim kurabilir.\n3. Hazır ezgileri çalabilir; **liste** ile kendi ezgisini kurup **her öğe için** döngüsüyle çalabilir.\n4. Düğme, logo ve ışık sensörüyle çalınan bir enstrüman yapabilir; sürekli sesi **sesi durdur** ile kapatabilir.\n5. Plan tablosundan yola çıkarak kayıt yapan ve geri oynatan beş tuşlu bir sanal piyano kurabilir.\n\n### Haftanın planı\nHafta beş derstir; her ders yaklaşık 18-32 dakikadır. Aşağıdaki plan günde bir ders içindir. Müzikli derslerde ses açık olmalıdır; ilk ▶ Çalıştır basışından sonra tarayıcı sesi açar.\n\n| Gün | Ders | Süre | Ne yapılır |\n|---|---|---|---|\n| 1 | İlk nota | ~18 dk | Anlatımı oku, Do, Re, Mi çal, nota simgesini göster, mini testi çöz. |\n| 2 | Süre, sus ve tempo | ~20 dk | Tempoyu 60 ve 240 yap, süreleri hesapla ve Hoparlör bölümüyle karşılaştır. |\n| 3 | Ezgiler ve listeler | ~22 dk | Hazır ezgileri dinle, dört notalık liste kur, her öğe için döngüsünü dene. |\n| 4 | Enstrüman yap | ~22 dk | Üç düğmeyle nota çal, logo ve ışıkla sürekli ses ver, eşle bloğunu dene. |\n| 5 | Proje: Sanal piyano | ~32 dk | Tabloyu doldur, A tuşunu çalıştır, kopyala, kayıt ve geri oynatmayı ekle. |\n\n### Ön koşul kontrolü\nBu hafta Modül 10'un üç haftalık temeli gerekir. Başlamadan önce şunları kontrol et:\n- Blok sürükleyip başlığın içine bırakabiliyor mu? (Hafta 1)\n- **Düğme [A] basılınca** gibi olay başlıklarını ve ▶ Çalıştır düğmesini biliyor mu? (Hafta 2)\n- Sensör (ışık) değerlerinin sayı olduğunu ve kaydırıcıyla değiştirildiğini biliyor mu? (Hafta 3)\n- Değişken oluşturup değer atayabiliyor mu?\n- Ses açık mı? Bilgisayarın sesi ve Hoparlör bölümündeki **Ses açık** düğmesi açılmış olmalı.\n\n### Kavram haritası\n- **Ses:** titreşim → frekans (Hz) → nota (Do 262, La 440) → oktav (iki katı)\n- **Zaman:** tempo (vuruş/dk) → 60000 / tempo → vuruş değerleri (1/16 ... 2) → sus\n- **Veri:** değişken → liste → numara (0'dan) → uzunluk → her öğe için\n- **Enstrüman:** giriş (düğme, logo, ışık) → kural → çıkış (hoparlör) → eşle → sürekli ses\n- **Proje:** plan tablosu → tek tuş kalıbı → kopyala → kayıt listesi → geri oynatma\n\n### Sık yapılan hatalar\n- **Nota bloklarını başlığın dışında bırakmak.** Blok soluk görünür ve hiç çalışmaz.\n- **▶ düğmesine basmadan düğmeye basmak.** Program önce çalıştırılmalı.\n- **Vuruş ile milisaniyeyi karıştırmak.** **bekle [500] ms** tempoyu dinlemez; nota ve sus dinler.\n- **Tempo 60'ta takıldı sanmak.** Tempo 20'de bir 1/4 vuruş 3 saniyedir.\n- **Listeyi başlangıçta kurmamak.** Ekleme bloğu \"Bu blok için bir liste gerekli.\" hatasıyla durur.\n- **Listede numarayı 1'den başlatmak.** İlk öğe 0 numaralıdır; son numara uzunluktan bir azdır.\n- **Sesi durdur koymamak.** Sürekli ses kendiliğinden susmaz.\n- **Eşle bloğunda aralıkları ters yazmak.** Önce sensör aralığı, sonra ses aralığı.\n- **Aynı sütunu iki tuşa vermek.** Projede tuşlar ekrandan ayırt edilemez.\n\n### Hafta sonu tekrarı\n1. Her dersin kavram kartlarına yeniden bak ve \"sık yapılan yanlış\" satırlarını yüksek sesle oku.\n2. Mini testlerde yanlış yaptığın soruların açıklamalarını oku, sonra soruyu yeniden çöz.\n3. Tempoyu 60, 120 ve 240 yaparak 1/4 vuruşun süresini hesapla (1000, 500, 250 ms) ve Hoparlör bölümüyle karşılaştır.\n4. Zafer ezgisinin tempo 120'de 2750 ms sürdüğünü bil; tempo 60'ta ne kadar süreceğini hesapla.\n5. Kendi cümlelerinle cevapla: \"Liste numaraları neden 0'dan başlar?\" ve \"Sürekli ses neden sesi durdur ister?\"\n\nHafta sonu testi olarak beş dersin mini testleri yeterlidir; her derste 5 soru, toplam 25 soru. Hedef: her dersten en az 4 doğru. Eksik kalan dersin anlatımına dön.\n\n### Proje değerlendirme ölçütü (Sanal piyano)\n| Ölçüt | Gelişmeli | Yeterli | İleri |\n|---|---|---|---|\n| Tuşlar | Bir iki tuş çalışmıyor ya da yanlış nota çalıyor | Beş tuşun hepsi kendi notasını çalıyor | Tablodaki notaların dışında ek tuş ya da oktav değişimi eklenmiş |\n| Ekran | Sütunlar karışık ya da yanmıyor | Her tuş kendi sütununu yakıp söndürüyor | Sütun süresi nota süresiyle uyumlu, ekran temiz kalıyor |\n| Kayıt | Liste kurulmamış, program hata veriyor | Notalar kayıt listesine sırayla ekleniyor | Kaydı silen bir tuş ya da kayıt uzunluğunu gösteren bir sayı eklenmiş |\n| Geri oynatma | Logoya dokununca bir şey çalmıyor | Kayıt çalındığı sırayla baştan çalınıyor | Tempo ya da nota arası duraklama ayarlanmış ve etkisi açıklanmış |\n| Anlatım | Ne yaptığını anlatamıyor | Tuş kalıbını ve listeyi adım adım anlatıyor | Hata yapıp nasıl bulduğunu anlatıyor |\n\n### Veli ve öğretmen notu\n- **Amaç.** Bu hafta bir şarkıyı ezberletmek değil, öğrencinin sesi bir sayı olarak (frekans) ve zamanı bir hesap olarak (tempo) görmesidir. Müzik sevenler için bu sıradan bir tablo, sevmeyenler için bir bulmacadır; ikisi de yeterlidir.\n- **Nasıl destek olunur?** Öğrenci takıldığında cevabı söylemek yerine şu soruları sor: \"Hangi başlığın içinde?\", \"Hoparlör bölümü kaç Hz diyor?\", \"Liste kaç öğeli, son numarası kaç?\"\n- **Ses.** Ses sanal karttan çıkar ve ilk ▶ Çalıştır'dan sonra açılır. Sesi duymayan öğrenci için önce bilgisayarın sesini, sonra Hoparlör bölümündeki Ses açık düğmesini kontrol edin. Ses olmasa da frekans, ekran ve etkinlik hedefleri yine görünür.\n- **Süre.** Dersleri aynı gün peş peşe yapmak yerine aralıklı çalışmak kalıcılığı artırır. Tempo hesapları için kâğıt ve kalem uygundur.\n- **Güvenlik.** Bu platformdaki her şey sanaldır. Kulaklık kullanılıyorsa ses seviyesi düşük tutulmalıdır.\n- **İlerleme.** Dersin sonundaki mini test sonuçları \"İlerlemem\" sayfasında beceri bazında görünür (taslak/pilot özellik; yalnız onay verildiyse kaydedilir).",
      "lessons": [
        {
          "title": "İlk nota",
          "durationMin": 18,
          "problem": "Bir gitarın telini çekince tel titrer ve ses çıkar. Tel ne kadar hızlı titrerse ses o kadar tiz olur. Sanal Mikro Kart'ın hoparlörü de böyle çalışır: ona bir titreşim sayısı verirsin, o da o sesi çalar. Peki kartı Do, Re, Mi çaldırmak için kaç blok gerekir?",
          "contentMd": "### Hazırlık\nEditörde solda bloklar, sağda sanal kart var. Kartın altındaki paneller arasında **Hoparlör** bölümü de var. Onu aç: orada hangi sesin çaldığı yazar. Sayfada ses duymak için ▶ **Çalıştır** düğmesine bir kez bas; tarayıcılar sesi ancak sen sayfaya dokunduktan sonra açar. Hoparlör bölümündeki **Ses açık** düğmesi sesi kapatıp açar.\n\n### Frekans nedir?\nBir sesin saniyedeki titreşim sayısına **frekans** denir. Birimi **Hz** (hertz) olur. Kart notaları şu frekanslarla çalar:\n\n| Nota | Do | Re | Mi | Fa | Sol | La | Si | Tiz Do |\n|---|---|---|---|---|---|---|---|---|\n| Hz | 262 | 294 | 330 | 349 | 392 | 440 | 494 | 523 |\n\n**Tiz Do**, **Do**'nun yaklaşık iki katı frekanstadır (262 × 2 = 524). Aynı notanın bir basamak yukarısına \"oktav\" denir. **Alçak Do** ise 131 Hz'dir, yani Do'nun yarısıdır.\n\n### Yeni bloklar\n- **Müzik** kategorisindeki **[Do] notasını [1/4] vuruş çal** bloğu bir nota çalar. Nota bitene kadar bir sonraki bloğa geçmez. Yani iki nota bloğunu alt alta koyarsan notalar sırayla çalar, üst üste binmez.\n- **Temel** kategorisindeki **simgeyi göster [kalp]** bloğu ekrana hazır bir çizim koyar. Listeden **nota** simgesini seçebilirsin.\n\n### Adım adım\nEditörde **düğme [A] [basılınca]** bloğu hazır duruyor. Hedefler panelinde üç hedef var.\n\n1. **Müzik** kategorisinden **[Do] notasını [1/4] vuruş çal** bloğunu sürükle. **düğme [A] [basılınca]** bloğunun içine bırak.\n2. Aynı bloktan iki tane daha al ve altına yapıştır. İkincide listeden **Re**, üçüncüde **Mi** seç.\n3. **Temel** kategorisinden **simgeyi göster [kalp]** bloğunu al ve notaların üstüne koy. Listeden **nota** simgesini seç.\n4. ▶ **Çalıştır** düğmesine bas. Sonra kartın **A** düğmesine tıkla.\n\n### Beklenen sonuç\nA'ya basınca kartın ekranında nota simgesi görünür. Hoparlör bölümünde sırayla **çalan: 262 Hz**, **294 Hz**, **330 Hz** yazar ve (sesin açıksa) üç nota duyulur. Her nota yarım saniye sürer, toplam bir buçuk saniye. Üç hedefin hepsinde ✓ olmalı.\n\n### Nasıl çalışıyor?\n- Bloklar yukarıdan aşağı, sırayla çalışır.\n- Nota bloğu notayı başlatır ve süresi dolana kadar bekler. Bu yüzden Re, ancak Do bitince başlar.\n- **[1/4] vuruş**: notanın ne kadar süreceğini söyler. Kartın tempo değeri başlangıçta dakikada 120 vuruştur. Bu hızda \"1/4 vuruş\" tam 500 milisaniyedir. Süreyi bir sonraki derste ayrıntılı göreceksin.\n- Üstteki **JavaScript** ve **Python** sekmelerine tıklarsan aynı programın kodunu görürsün. Örneğin ilk nota `music.playNote(\"Do\", 1)` olarak yazılır. Bu sekmeler yalnız okumak içindir; programı bloklarla çalıştırırsın.\n\n### Dene\n1. İlk notayı **Alçak Do**, sonuncuyu **Tiz Do** yap. Ses nasıl değişti? Hz değerlerini Hoparlör bölümünden oku.\n2. Kendi üç notalık zil sesini bul. Hangi sıra sana daha neşeli geliyor?\n3. Üç yerine yedi nota koyup Do'dan Si'ye bir merdiven çık.\n\n### Sık yapılan hatalar\n- **Blokları başlığın dışında bırakmak.** Nota blokları **düğme [A] [basılınca]** içinde değilse çalışmaz; editörde soluk görünürler.\n- **▶ düğmesine basmadan A'ya basmak.** Program önce çalıştırılmalı.\n- **Bloğu değiştirip yeniden çalıştırmamak.** Çalışırken bir şeyi değiştirirsen \"Değişiklikler için ▶ düğmesine bas\" uyarısı çıkar.\n- **Sesi duymamak.** Hoparlör bölümünde **Ses açık** yazdığından emin ol. Bilgisayarının sesi de açık olmalı.",
          "question": "Do ile Tiz Do arasında ne fark duydun? Hayvanların sesleri (kuş cıvıltısı, kedi miyavı) sence yüksek mi alçak mı frekanslıdır? Neden?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Sesin ne olduğunu ve **frekansın** (Hz) perdeyi nasıl belirlediğini\n- Kartın notalarının hangi frekanslara karşılık geldiğini\n- Nota bloğunun bitene kadar beklediğini ve notaların bu yüzden sırayla çaldığını\n- Bir olay başlığının (düğme basılınca) içine blok koymanın neden gerektiğini\n\n### Önceden bilmen gerekenler\nBu hafta müzikle başlıyor. Yalnızca önceki haftalardan şunlar yeter: blok sürükleyip bırakmak, **düğme [A] basılınca** başlığı, ▶ Çalıştır düğmesi ve ekrana simge göstermek.\n\n### Ses bir titreşimdir\nGitar telini çekince tel gidip gelir ve havayı iter. Bu gidip gelme kulağına ses olarak ulaşır. Telin **saniyedeki titreşim sayısına frekans** denir; birimi **Hz** (hertz) olur. Frekans büyükse ses **tiz**, küçükse **pes** (kalın) olur. Kartın hoparlörü de aynı şeyi yapar: ona bir sayı verirsin, o kadar titreşimle ses üretir.\n\n### Notalar birer sayıdır\nKartta her nota sabit bir frekansa bağlıdır. Bazıları:\n\n```\nNota    Alçak Do   Do    Re    Mi    Sol   La    Tiz Do\nHz        131     262   294   330   392   440    523\n```\n\nBir şeye dikkat et: **Alçak Do** (131), **Do**'nun (262) yarısıdır; **Tiz Do** (523) ise yaklaşık iki katıdır. Frekansı iki katına çıkarmak sesi bir **oktav** yükseltir. Aynı nota adı, daha tiz ya da daha pes söylenmiş olur.\n\n### Nota bloğu bekler\n**[Do] notasını [1/4] vuruş çal** bloğu iki iş yapar: notayı başlatır ve süresi dolana kadar **bekler**. Bu bekleme çok önemlidir. İki nota bloğunu alt alta koyarsan ikincisi birinciden sonra başlar:\n\n```\nDo çal  (500 ms)  -> bitince\nRe çal  (500 ms)  -> bitince\nMi çal  (500 ms)\nToplam: 1500 ms\n```\n\nKartın tempo değeri başlangıçta 120'dir ve bu hızda 1/4 vuruş 500 milisaniye sürer. Süreyi bir sonraki derste ayrıntılı göreceksin.\n\n### Bloklar bir başlığın içinde çalışır\nKartta hiçbir blok kendi kendine çalışmaz. Önce bir şey olmalı: düğmeye basılması gibi. Bu \"olay\" bir **başlık** bloğuyla yazılır. Nota blokları başlığın içinde değilse editörde soluk görünürler ve çalışmazlar. Kodu görmek için JavaScript sekmesine bakabilirsin: `music.playNote(\"Do\", 1)`. Bu sekme sadece okumak içindir.\n\n### Özet\nSes, titreşimdir; saniyedeki titreşim sayısı frekanstır ve Hz ile ölçülür. Büyük frekans tiz, küçük frekans pes ses verir. Kartın nota blokları sabit frekanslarla çalar ve bitene kadar bekler, bu yüzden alt alta konan notalar sırayla duyulur. Notalar bir başlık bloğunun içinde olmalıdır, yoksa hiç çalışmazlar.",
          "concepts": [
            {
              "term": "Frekans",
              "definition": "Bir sesin saniyedeki titreşim sayısı; birimi hertz (Hz).",
              "example": "La notası 440 Hz'dir: hoparlör saniyede 440 kez gidip gelir.",
              "pitfall": "Frekansı sesin gürlüğü sanmak; frekans sesin tizliğini, gürlüğü ise ses seviyesi belirler."
            },
            {
              "term": "Hertz (Hz)",
              "definition": "Saniyede kaç kez tekrar olduğunu gösteren birim.",
              "example": "262 Hz, saniyede 262 titreşim demektir.",
              "pitfall": "Hz'i dakikadaki sayı sanmak; Hz her zaman saniye başınadır."
            },
            {
              "term": "Oktav",
              "definition": "Aynı notanın frekansı yarıya ya da iki katına gelmiş hâli.",
              "example": "Do 262 Hz ise Alçak Do 131 Hz'dir, Tiz Do yaklaşık 523 Hz'dir.",
              "pitfall": "Bir oktav yukarı çıkmak için frekansa sabit bir sayı eklemek; frekans iki ile çarpılır."
            },
            {
              "term": "Nota bloğu",
              "definition": "Seçilen notayı çalar ve süresi dolana kadar bir sonraki bloğa geçmez.",
              "example": "Do, Re, Mi blokları alt alta konunca sırayla duyulur.",
              "pitfall": "Notaların üst üste biner sanmak; bloklar sırayla çalışır, bir sonraki öncekinin bitmesini bekler."
            },
            {
              "term": "Başlık bloğu",
              "definition": "Altındaki blokları bir olay olunca çalıştıran blok, örneğin düğme [A] basılınca.",
              "example": "Nota blokları düğme [A] basılınca bloğunun içine konunca A'ya basınca çalar.",
              "pitfall": "Blokları başlığın dışında bırakmak; soluk görünürler ve hiç çalışmazlar."
            }
          ],
          "quiz": [
            {
              "id": "m10h4d16-q1",
              "kind": "mcq",
              "prompt": "Bir hoparlör, bir notayı daha tiz çalsın istiyorsun. Hangisini artırman gerekir?",
              "options": [
                "Frekansı",
                "Ses seviyesini",
                "Blok sayısını",
                "Düğmeye basış süresini"
              ],
              "answer": 0,
              "explanation": "Tizlik frekansa bağlıdır; saniyedeki titreşim sayısı arttıkça ses tizleşir. Ses seviyesi yalnızca sesin ne kadar gür olduğunu değiştirir, perdeyi değil.",
              "skills": [
                "prog-structure"
              ]
            },
            {
              "id": "m10h4d16-q2",
              "kind": "numeric",
              "prompt": "Tempo 120 iken (1/4 vuruş = 500 ms) alt alta üç tane [1/4] vuruşluk nota bloğu çalıştırılıyor. Hepsi bitene kadar kaç milisaniye geçer?",
              "answer": 1500,
              "tolerance": 0,
              "unit": "ms",
              "explanation": "Her nota bloğu bitene kadar bekler, notalar üst üste binmez. 500 + 500 + 500 = 1500 ms. Aynı anda çalsalardı toplam 500 ms olurdu, ama bloklar sırayla çalışır.",
              "skills": [
                "prog-timing"
              ]
            },
            {
              "id": "m10h4d16-q3",
              "kind": "numeric",
              "prompt": "Kartta Do notası 262 Hz'dir. Alçak Do, Do'nun yarısı kadar frekansa sahiptir. Alçak Do kaç Hz'dir?",
              "answer": 131,
              "tolerance": 0,
              "unit": "Hz",
              "explanation": "Bir oktav aşağı inmek için frekans ikiye bölünür: 262 / 2 = 131 Hz. Aynı hesapla bir oktav yukarı çıkmak için ikiyle çarpılır (yaklaşık 524, kartta 523).",
              "skills": [
                "prog-timing"
              ]
            },
            {
              "id": "m10h4d16-q4",
              "kind": "find-bug",
              "prompt": "Öğrenci A'ya basınca kartın Do, Re, Mi çalmasını istedi. Çalıştırdı ama A'ya basınca hiçbir ses gelmedi. Editörde nota blokları soluk görünüyor.\n\n```\ndüğme [A] basılınca\n   (boş)\n\n[Do] notasını [1/4] vuruş çal\n[Re] notasını [1/4] vuruş çal\n[Mi] notasını [1/4] vuruş çal\n```\n\nHata nedir?",
              "options": [
                "Do notasının frekansı yanlış",
                "Nota blokları düğme [A] basılınca başlığının dışında kalmış",
                "Mi notası çalınamaz",
                "Tempo çok yüksek"
              ],
              "answer": 1,
              "explanation": "Soluk blok, başlığa bağlı olmadığı için çalışmayan bloktur. Blokları düğme [A] basılınca içine taşımak gerekir. Frekans, nota ya da tempo burada sorun değildir.",
              "skills": [
                "prog-debug",
                "prog-structure"
              ]
            },
            {
              "id": "m10h4d16-q5",
              "kind": "predict-output",
              "prompt": "Sıra aşağıdaki gibi bloklarla yazılmış ve A'ya basılıyor:\n\n```\ndüğme [A] basılınca\n   [Sol] notasını [1/4] vuruş çal\n   [Do] notasını [1/4] vuruş çal\n```\n\nHoparlör bölümünde frekanslar hangi sırayla görünür?",
              "options": [
                "392 Hz, sonra 262 Hz",
                "262 Hz, sonra 392 Hz",
                "İkisi aynı anda: 654 Hz",
                "Yalnızca 262 Hz"
              ],
              "answer": 0,
              "explanation": "Bloklar yukarıdan aşağı çalışır: önce Sol (392 Hz), o bitince Do (262 Hz). Frekanslar toplanmaz; ikisi aynı anda çalmaz.",
              "skills": [
                "prog-structure"
              ]
            }
          ]
        },
        {
          "title": "Süre, sus ve tempo",
          "durationMin": 20,
          "problem": "Aynı şarkıyı yavaş ve hızlı çalarsan başka bir şarkı gibi olur. Şarkıyı bir ninni mi, bir marş mı yapan şey, notalardan çok süreleridir. Kartın içinde bir \"metronom\" yani tempo ayarı var. Onu değiştirince bütün notaların süresi aynı anda değişir.",
          "contentMd": "### Vuruş ve tempo\nMüzikte süre **vuruş** ile ölçülür. Kartta **tempo**, bir dakikada kaç vuruş çalındığını söyler. Başlangıç değeri 120'dir.\n\nKart bir \"1/4 vuruş\"un süresini şöyle hesaplar: 60 000 ms ÷ tempo.\n\n| Tempo | 1/4 vuruş | 1/8 vuruş | 1/2 vuruş |\n|---|---|---|---|\n| 60 | 1000 ms | 500 ms | 2000 ms |\n| 120 | 500 ms | 250 ms | 1000 ms |\n| 240 | 250 ms | 125 ms | 500 ms |\n\nTempo büyüdükçe notalar kısalır, müzik hızlanır. Nota listesindeki **1/16, 1/8, 1/4, 1/2, 1, 2** değerleri, o notanın kaç \"çeyrek vuruş birimi\" süreceğini seçer. 1/4 vuruş bir birimdir; 1/2 vuruş iki birim, 1 vuruş dört birimdir.\n\n### Yeni bloklar\n- **Müzik** kategorisindeki **tempoyu [120] yap (vuruş/dk)** bloğu tempoyu ayarlar.\n- **[1/4] vuruş sus** bloğu müzikte sessizlik bırakır. Bir nota kadar bekler ama ses çıkarmaz.\n- **tempo** bloğu şu anki tempoyu bir sayı olarak verir. Bunu ekranda göstermek için **sayıyı göster** içine koyabilirsin.\n\n### Adım adım\nEditörde **düğme [A] [basılınca]** hazır. Bu etkinlikte yavaş ve hızlı bir \"ta ta ta\" çalacaksın.\n\n1. **düğme [A] [basılınca]** içine sırayla şunları koy:\n   - **tempoyu [60] yap (vuruş/dk)**\n   - **[Sol] notasını [1/4] vuruş çal**\n   - **[1/4] vuruş sus**\n   - **tempoyu [240] yap (vuruş/dk)**\n   - **[Sol] notasını [1/4] vuruş çal**\n   - **[1/4] vuruş sus**\n   - **[Sol] notasını [1/4] vuruş çal**\n2. ▶ **Çalıştır**, sonra kartın **A** düğmesine bas.\n\n### Beklenen sonuç\nİlk Sol yavaş ve uzundur: tam bir saniye. Sonra iki Sol hızlı ve kısadır: her biri çeyrek saniye, aralarında çeyrek saniyelik sessizlik. Hoparlör bölümünde **çalan: 392 Hz** yazıp kaybolduğunu görürsün. Üç hedefin hepsinde ✓ olmalı.\n\n### Nasıl çalışıyor?\n- **tempoyu ... yap** bloğu bir kez çalışır ama ondan sonra gelen bütün notaların süresini etkiler. Yeni bir tempo bloğu gelene kadar geçerli kalır.\n- **sus** bloğu da tempoya uyar. Tempo 60 iken 1/4 vuruş sus, 1 saniye susar.\n- Aynı notayı peş peşe çalarken aralarına sus koymazsan notaları birbirinden ayırmak zorlaşır.\n\n### Dene\n1. Tempoyu 20 ile 400 arasında farklı değerlere ayarla. Kart bu aralığın dışındaki değerleri kendiliğinden bu sınıra çeker.\n2. Bir **sayıyı göster** bloğuna **tempo** bloğunu koyup ekranda hangi tempoda olduğunu göster.\n3. 1/8 vuruşluk iki nota ile 1/4 vuruşluk bir notanın aynı süreyi doldurduğunu dene.\n\n### Sık yapılan hatalar\n- **Vuruş değerleriyle milisaniyeyi karıştırmak.** **bekle [500] ms** gerçek süre verir, tempoyu hiç dinlemez. Nota ve **sus** blokları ise tempoya göre değişir.\n- **Tempoyu çok düşük bırakıp \"program takıldı\" sanmak.** Tempo 20'de bir çeyrek vuruş 3 saniyedir.\n- **Susmayı unutmak.** Ritim notalar kadar boşluklardan da oluşur.",
          "question": "Bir ninniyi 240 tempoda çalsan nasıl olur? Bir marşı 40 tempoda çalsan? Tempo, bir şarkıdaki duyguyu nasıl değiştiriyor?",
          "explainerMd": "### Bu derste öğreneceklerin\n- **Tempo** ve **vuruş** kavramlarını\n- Bir notanın süresini `60000 / tempo` formülüyle hesaplamayı\n- **Sus** bloğunun neden müziğin parçası olduğunu\n- Tempo değişince ne olduğunu ve süre değerlerinin tempoya bağlı olduğunu\n\n### Önceden bilmen gerekenler\n16. ders: nota bloğunun notayı çaldığını ve bitene kadar beklediğini, frekans ve Hz kavramlarını bilmelisin. Ayrıca düğme başlığını kullanabilmelisin.\n\n### Tempo: müziğin hızı\nAynı şarkıyı yavaş ve hızlı çalarsan ayrı bir şarkı gibi gelir. Müzikte bu hıza **tempo** denir. Kartta tempo, **bir dakikada kaç vuruş** çalındığını söyler. Başlangıç değeri 120'dir: dakikada 120 vuruş, yani saniyede 2 vuruş.\n\n### Bir vuruş kaç milisaniye?\nBir dakika 60 000 milisaniyedir. Tempo kaçsa, bir dakikaya o kadar vuruş sığar. Bu yüzden tek bir birimin süresi şöyle bulunur:\n\n```\n1/4 vuruşun süresi (ms) = 60000 / tempo\n```\n\nKartın nota listesindeki değerler, bu birimin kaç katı süreceğini seçer:\n\n```\nDeğer        1/16   1/8   1/4   1/2   1    2\nBirim sayısı 0,25   0,5    1     2    4    8\n```\n\nTempo 120 iken bir birim 500 ms'dir. Buna göre 1/8 vuruş 250 ms, 1/2 vuruş 1000 ms eder. Tempo 60 olursa birim 1000 ms, tempo 240 olursa 250 ms olur. **Tempo büyüdükçe notalar kısalır**, müzik hızlanır.\n\n### Sus da bir nota gibidir\n**[1/4] vuruş sus** bloğu ses çıkarmaz ama aynı süre kadar bekler. Ritim, notalar kadar boşluklardan da oluşur. Aynı notayı peş peşe çalarken araya sus koymazsan notalar birbirine karışır.\n\n### Tempo bloğu kalıcıdır\n**tempoyu [N] yap** bloğu bir kez çalışır, ama ondan sonra gelen her nota ve her sus yeni tempoya göre hesaplanır. Yeni bir tempo bloğu gelene kadar değer kalır. Kart tempoyu 20 ile 400 arasında tutar; bunun dışında bir sayı yazarsan en yakın sınıra çeker. Örneğin 500 yazarsan tempo 400 olur.\n\n### Vuruş değil, milisaniye isteyen bloklar\n**bekle [500] ms** bloğu gerçek süreyi milisaniye olarak verir ve tempoyu hiç dinlemez. Nota ve sus blokları ise tempoya göre değişir. Bu farkı bilmezsen \"tempoyu artırdım ama bekleme kısalmadı\" şaşkınlığı yaşarsın.\n\n### Özet\nTempo, dakikadaki vuruş sayısıdır ve bir birim 60000 / tempo milisaniye sürer. Tempo artınca notalar kısalır. Sus bloğu ses çıkarmadan aynı süreyi bekler. Tempo bloğu kendinden sonrakilerin hepsini etkiler; bekle bloğu ise tempodan bağımsız, doğrudan milisaniye ister.",
          "concepts": [
            {
              "term": "Tempo",
              "definition": "Müziğin hızı; kartta dakikadaki vuruş sayısı olarak verilir, başlangıç değeri 120'dir.",
              "example": "Tempo 60 iken 1/4 vuruş 1000 ms, tempo 240 iken 250 ms sürer.",
              "pitfall": "Tempoyu artırınca notaların uzayacağını sanmak; tempo arttıkça notalar kısalır."
            },
            {
              "term": "Vuruş süresi",
              "definition": "1/4 vuruşun süresi 60000 / tempo milisaniyedir; diğer değerler bunun katlarıdır.",
              "example": "Tempo 120'de 1/2 vuruş 2 × 500 = 1000 ms sürer.",
              "pitfall": "Vuruş değerini doğrudan milisaniye sanmak; önce tempoya göre dönüştürülür."
            },
            {
              "term": "Sus bloğu",
              "definition": "Ses çıkarmayan ama seçilen süre kadar bekleyen blok.",
              "example": "Üç nota arasına 1/4 vuruş sus koyarak ritmi netleştirirsin.",
              "pitfall": "Susmayı unutmak; aynı notalar birbirine karışır ve ritim kaybolur."
            },
            {
              "term": "Tempo bloğu",
              "definition": "Kendinden sonraki tüm nota ve susların hızını değiştirir; 20-400 arasında geçerlidir.",
              "example": "tempoyu [240] yap bloğundan sonra gelen her 1/4 vuruş 250 ms olur.",
              "pitfall": "Tempo bloğunun sadece bir sonraki notayı etkilediğini sanmak; yeni bir tempo bloğu gelene kadar geçerlidir."
            },
            {
              "term": "bekle (ms)",
              "definition": "Gerçek milisaniye bekleyen blok; tempoyu hiç dikkate almaz.",
              "example": "bekle [500] ms her zaman yarım saniye sürer, tempo ne olursa olsun.",
              "pitfall": "Ritimde bekle bloğu kullanıp tempoyu değiştirince süresinin değişmesini beklemek."
            }
          ],
          "quiz": [
            {
              "id": "m10h4d17-q1",
              "kind": "numeric",
              "prompt": "Tempo 60. Bir [1/2] vuruşluk nota kaç milisaniye sürer? (1/4 vuruş = 60000 / tempo, 1/2 vuruş = 2 birim)",
              "answer": 2000,
              "tolerance": 0,
              "unit": "ms",
              "explanation": "Tempo 60'ta bir birim 60000 / 60 = 1000 ms'dir. 1/2 vuruş iki birim olduğu için 2 × 1000 = 2000 ms sürer.",
              "skills": [
                "prog-timing"
              ]
            },
            {
              "id": "m10h4d17-q2",
              "kind": "numeric",
              "prompt": "Tempo 240 iken bir [1/8] vuruşluk nota kaç milisaniye sürer? (1/8 vuruş = yarım birim)",
              "answer": 125,
              "tolerance": 0,
              "unit": "ms",
              "explanation": "Tempo 240'ta bir birim 60000 / 240 = 250 ms'dir. 1/8 vuruş yarım birim olduğundan 250 / 2 = 125 ms eder.",
              "skills": [
                "prog-timing"
              ]
            },
            {
              "id": "m10h4d17-q3",
              "kind": "predict-output",
              "prompt": "Tempo başlangıçta 120. A'ya basılınca aşağıdaki program çalışıyor. Notalar toplam kaç milisaniye sürer?\n\n```\ntempoyu [60] yap\n[Sol] notasını [1/4] vuruş çal\n[1/4] vuruş sus\ntempoyu [240] yap\n[Sol] notasını [1/4] vuruş çal\n[1/4] vuruş sus\n[Sol] notasını [1/4] vuruş çal\n```",
              "options": [
                "1500 ms",
                "2750 ms",
                "3500 ms",
                "1750 ms"
              ],
              "answer": 1,
              "explanation": "İlk Sol ve ilk sus tempo 60'ta 1000 ms'dir: 2000 ms. Sonra tempo 240 olur; üç blok 250 ms'dir: 750 ms. Toplam 2000 + 750 = 2750 ms. Hepsini tempo 240 sanarsan 1500 bulursun, hepsini tempo 60 sanarsan 5000.",
              "skills": [
                "prog-timing"
              ]
            },
            {
              "id": "m10h4d17-q4",
              "kind": "find-bug",
              "prompt": "Öğrenci şarkıyı hızlandırmak için tempoyu 240 yaptı. Notalar kısaldı ama her notadan sonraki duraklama aynı kaldı:\n\n```\ntempoyu [240] yap\n[Do] notasını [1/4] vuruş çal\nbekle [500] ms\n[Re] notasını [1/4] vuruş çal\n```\n\nSorun hangisidir?",
              "options": [
                "Do notası tempo 240'ı desteklemiyor",
                "bekle ms bloğu tempoyu dinlemez; duraklama için sus bloğu kullanılmalı",
                "tempo bloğu iki kez yazılmalı",
                "Re notası 1/4 vuruş olamaz"
              ],
              "answer": 1,
              "explanation": "bekle [500] ms gerçek milisaniye bekler ve tempoyla değişmez. Duraklamayı tempoya bağlamak için [1/4] vuruş sus bloğu kullanılır; o zaman duraklama 250 ms olur.",
              "skills": [
                "prog-debug",
                "prog-timing"
              ]
            },
            {
              "id": "m10h4d17-q5",
              "kind": "mcq",
              "prompt": "Programda tempoyu 500 yapmaya çalışırsan kartta ne olur?",
              "options": [
                "Tempo 500 olur",
                "Tempo 400 olur, kart değeri üst sınıra çeker",
                "Hata verir ve program durur",
                "Tempo 120'ye geri döner"
              ],
              "answer": 1,
              "explanation": "Kart tempoyu 20 ile 400 arasında tutar. 500 sınırın dışında olduğu için 400'e çekilir; bu hızda 1/4 vuruş 150 ms sürer. Program durmaz.",
              "skills": [
                "prog-timing"
              ]
            }
          ]
        },
        {
          "title": "Ezgiler ve listeler",
          "durationMin": 22,
          "problem": "Bir şarkının bütün notalarını tek tek blokla yazmak çok uzun sürer. Kartın içinde hazır ezgiler var: tek blokla bütün şarkı çalar. Peki kendi ezgini yazmak istersen? O zaman notaları bir **liste** içine koyup hepsini sırayla çaldırabilirsin. Bu ders ikisini de öğretiyor.",
          "contentMd": "### Hazır ezgiler\n**Müzik** kategorisindeki **ezgiyi çal [Neşe ezgisi]** bloğu bir ezgiyi baştan sona çalar ve bitene kadar bekler. Listede dokuz ezgi var: **Neşe ezgisi**, **Yıldız ezgisi**, **Zafer**, **Üzgün**, **Alarm**, **Yukarı çıkan**, **Aşağı inen**, **Neşeli**, **Kuş cıvıltısı**. Tempo 120 iken **Yıldız ezgisi** 8 saniye, **Zafer** 2,75 saniye, **Alarm** 1,6 saniye sürer.\n\n### Liste nedir?\nListe, birkaç değeri sıralı olarak tutan bir kutudur. Her öğenin bir numarası vardır ve **numaralar 0'dan başlar**: ilk öğe 0, ikinci öğe 1, üçüncü öğe 2... Biz bu derste notaların frekanslarını bir listeye koyacağız.\n\n### Yeni bloklar\n- **Müzik** kategorisindeki **nota [Do]** bloğu notanın frekansını (Hz) bir sayı olarak verir. Mesela **nota [Mi]** = 330.\n- **Müzik** kategorisindeki **[440] Hz sesini [1/4] vuruş çal** bloğu, notanın adı yerine sayı ile çalar. Yanına **nota [Do]** gibi bir değer koyabilirsin.\n- **Liste** kategorisindeki **liste oluştur** bloğu bir liste yapar. Üstündeki çarkla öğe sayısı artırılır.\n- **Döngü** kategorisindeki **[öğe] ile, [liste] listesinin her öğesi için** bloğu listedeki her öğeyi sırayla alıp içindeki blokları o öğe için çalıştırır.\n- **Değişken** kategorisindeki **[ezgi] değerini [0] yap** ve değişken bloğu (adı **ezgi** olan) listeyi saklamak içindir.\n\n### Adım adım\nEditörde **başlangıçta**, **düğme [A] [basılınca]** ve **düğme [B] [basılınca]** blokları hazır.\n\n1. **Değişken** kategorisinde **Değişken oluştur...** düğmesine bas. Adı **ezgi** yap (Türkçe harf kullanmamak en iyisidir).\n2. **başlangıçta** içine **ezgi değerini [0] yap** bloğunu koy. Sıfırın yerine **Liste** kategorisinden **liste oluştur** bloğunu tak. Listeye dört yer aç.\n3. Dört yerin her birine **Müzik** kategorisinden **nota [Do]** bloğu tak: sırayla **Do**, **Mi**, **Sol**, **Tiz Do**.\n4. **düğme [A] [basılınca]** içine **ezgiyi çal [Neşe ezgisi]** bloğunu koy, listeden **Yıldız ezgisi** seç.\n5. **düğme [B] [basılınca]** içine **[öğe] ile, [liste] listesinin her öğesi için** bloğunu koy. Liste yerine **ezgi** değişkenini tak.\n6. Döngünün içine **[440] Hz sesini [1/4] vuruş çal** bloğunu koy. Frekans yerine **öğe** değişkenini tak (Değişken kategorisinden alabilirsin).\n7. ▶ **Çalıştır**. Önce **B**'ye bas, sonra **A**'ya bas.\n\n### Beklenen sonuç\n**B**'ye basınca dört nota çalar: 262, 330, 392 ve 523 Hz. **A**'ya basınca Yıldız ezgisi sekiz saniye boyunca çalar. Üç hedefin hepsinde ✓ olmalı.\n\n### Nasıl çalışıyor?\n- **başlangıçta** bir kez çalışır ve listeyi yapar. Bu yüzden B'ye her basışta liste baştan kurulmaz.\n- Döngü listeden sırayla bir öğe alır, **öğe** değişkenine koyar ve içindeki notayı çalar. Dört öğe olduğu için dört kez döner.\n- Kod sekmesinde döngü `for (oge of ezgi)` biçiminde görünür. Kod sekmesinde değişken adlarındaki Türkçe harfler ASCII karşılığıyla yazılır (ö yerine o).\n- A'ya basıp ezgi çalarken B'ye de basarsan iki ezgi birlikte çalmaya çalışır. Kartın tek bir hoparlörü vardır; yeni çalan ses öncekinin yerini alır.\n\n### Dene\n1. Listeye dört yerine sekiz nota koy ve kendi ezgini bul.\n2. **tempoyu [160] yap (vuruş/dk)** bloğunu döngüden önce koy. Ezgin hızlandı mı?\n3. Başka bir hazır ezgiyi dene: **Kuş cıvıltısı**. Duyduğun şeyi anlat.\n4. **Liste** kategorisindeki **[ezgi] listesinin uzunluğu** bloğunu **sayıyı göster** içine koy. Ekranda 4 görmelisin.\n\n### Sık yapılan hatalar\n- **Listeyi başlangıçta oluşturmamak.** Liste boşsa döngü hiç dönmez ve ses çıkmaz.\n- **Nota adını doğrudan listeye yazmak.** Listeye **nota [Do]** gibi frekans blokları koyduk. Çünkü **Hz sesini çal** bloğu sayı bekler.\n- **Numarayı 1'den başlatmak.** Listelerde ilk öğenin numarası 0'dır.",
          "question": "Bir şarkıdaki notaları listeye koymak neden bloklarla tek tek yazmaktan daha kullanışlı? Aynı listeyi hem notalar hem de renkler için kullanabilir miydin?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Bir **liste** içine birden çok değeri sıralı koymayı\n- Liste numaralarının **0'dan** başladığını\n- **Her öğe için** döngüsüyle listenin elemanlarını sırayla işlemeyi\n- Hazır ezgilerin süresini tempoya göre hesaplamayı\n\n### Önceden bilmen gerekenler\n16. ve 17. dersler: nota çalma, frekans ve tempo. Ayrıca bir **değişken** oluşturup değer atamayı ve **başlangıçta** başlığını bilmelisin.\n\n### Hazır ezgiler\nKartta dokuz hazır ezgi vardır ve **ezgiyi çal** bloğu tek blokla bütün şarkıyı çalar. Süresi, ezginin notalarının toplam birimine ve tempoya bağlıdır. Örneğin Zafer ezgisi 5,5 birimliktir. Tempo 120'de bir birim 500 ms olduğundan süre 5,5 × 500 = 2750 ms eder. Tempo 60'ta aynı ezgi 5,5 × 1000 = 5500 ms sürer.\n\n### Liste nedir?\nNota nota blok koymak uzun sürer. **Liste**, birçok değeri tek bir kutuda sırayla tutar. Her değerin bir **numarası** vardır ve numaralama **0'dan** başlar:\n\n```\nezgi = [262, 330, 392, 523]\nnumara:  0    1    2    3\n```\n\nBurada ezgi listesinin uzunluğu 4'tür ama son öğenin numarası 3'tür. 2 numaralı öğe 392'dir, çünkü saymaya sıfırdan başlıyoruz. \"Uzunluk\" ile \"son numara\" arasındaki bu bir farkı akılda tut.\n\n### Listeyi nerede kurarsın?\nListeyi **başlangıçta** başlığının içinde kurarsın. O blok, program açılınca bir kez çalışır. Böylece düğmeye basıldığında liste zaten hazırdır. Listeyi kurmayı unutursan değişken hâlâ bir sayıdır ve liste bloğu \"Bu blok için bir liste gerekli.\" hatasıyla durur.\n\n### Her öğe için\n**[öğe] ile, [liste] listesinin her öğesi için** bloğu listedeki her değeri sırayla alıp **öğe** adlı değişkene koyar ve içindeki blokları o değer için çalıştırır. Dört öğeli bir listede içindeki bloklar tam dört kez çalışır:\n\n```\nher öğe için ezgi listesinde:\n   [öğe] Hz sesini [1/8] vuruş çal\n```\n\nBu blok her turda sesi çaldığı için dört notanın toplamı 4 × 250 = 1000 ms sürer (tempo 120, 1/8 vuruş). Kodda aynı şey `for (oge of ezgi)` olarak görünür. Kod sekmesi Türkçe harfleri ASCII ile yazar.\n\n### Özet\nHazır ezgiler tek blokla çalar ve süreleri tempoya bağlıdır. Liste, birden çok değeri sıralı tutan kutudur; numaralar 0'dan başlar, bu yüzden son numara uzunluktan bir azdır. Listeyi başlangıçta kurarsın. Her öğe için bloğu listedeki her değerle bir kez çalışır ve toplam süre, tur sayısı ile her turun süresinin çarpımıdır.",
          "concepts": [
            {
              "term": "Liste",
              "definition": "Birden çok değeri sıralı tutan değişken.",
              "example": "ezgi = [262, 330, 392, 523] dört notanın frekansını saklar.",
              "pitfall": "Liste yerine tek bir sayı koymak; liste bloğu \"Bu blok için bir liste gerekli.\" diye durur."
            },
            {
              "term": "Liste numarası (indeks)",
              "definition": "Bir öğenin listedeki sırası; saymaya 0'dan başlanır.",
              "example": "[262, 330, 392, 523] listesinde 2 numaralı öğe 392'dir.",
              "pitfall": "İlk öğeyi 1 sanmak; ilk öğe her zaman 0'dır."
            },
            {
              "term": "Liste uzunluğu",
              "definition": "Listenin kaç öğe tuttuğu.",
              "example": "Dört notalı listenin uzunluğu 4, son numarası 3'tür.",
              "pitfall": "Uzunluk ile son numarayı karıştırmak; son numara uzunluktan bir küçüktür."
            },
            {
              "term": "Her öğe için",
              "definition": "Listedeki her değeri sırayla alıp içindeki blokları o değer için çalıştıran döngü.",
              "example": "Dört öğeli listede içindeki nota bloğu dört kez çalışır.",
              "pitfall": "Boş listede kullanmak; liste boşsa döngü hiç dönmez ve ses çıkmaz."
            },
            {
              "term": "başlangıçta",
              "definition": "Program başlayınca bir kez çalışan başlık; listeler ve değişkenler burada kurulur.",
              "example": "Ezgi listesini başlangıçta kurarsın, düğmeler listeyi hazır bulur.",
              "pitfall": "Listeyi düğme başlığında kurmak; her basışta liste baştan başlar ve eski değerler kaybolur."
            }
          ],
          "quiz": [
            {
              "id": "m10h4d18-q1",
              "kind": "mcq",
              "prompt": "ezgi = [262, 330, 392, 523] listesinde 2 numaralı öğe hangisidir?",
              "options": [
                "330",
                "392",
                "262",
                "523"
              ],
              "answer": 1,
              "explanation": "Numaralama 0'dan başlar: 0 -> 262, 1 -> 330, 2 -> 392, 3 -> 523. 330 diyenler saymaya 1'den başlamıştır.",
              "skills": [
                "prog-loops-arrays"
              ]
            },
            {
              "id": "m10h4d18-q2",
              "kind": "numeric",
              "prompt": "Zafer ezgisi 5,5 birimliktir ve tempo 60'tır (bir birim 1000 ms). Ezgi kaç milisaniye sürer?",
              "answer": 5500,
              "tolerance": 0,
              "unit": "ms",
              "explanation": "Tempo 60'ta bir birim 60000 / 60 = 1000 ms'dir. 5,5 × 1000 = 5500 ms. Tempo 120'de aynı ezgi yarı sürede, 2750 ms'de biter.",
              "skills": [
                "prog-timing"
              ]
            },
            {
              "id": "m10h4d18-q3",
              "kind": "predict-output",
              "prompt": "Tempo 120. B'ye basılınca aşağıdaki program çalışıyor:\n\n```\nbaşlangıçta:\n   ezgi = [262, 330, 392]\n\ndüğme [B] basılınca:\n   her öğe için ezgi listesinde:\n      [öğe] Hz sesini [1/8] vuruş çal\n```\n\nHoparlörde kaç nota ve toplam kaç ms duyulur?",
              "options": [
                "3 nota, 750 ms",
                "3 nota, 1500 ms",
                "1 nota, 250 ms",
                "4 nota, 1000 ms"
              ],
              "answer": 0,
              "explanation": "Liste 3 öğelidir, döngü 3 kez döner. Tempo 120'de 1/8 vuruş 250 ms'dir: 3 × 250 = 750 ms. 4 nota diyenler döngünün bir tur fazla döneceğini sanmıştır.",
              "skills": [
                "prog-loops-arrays",
                "prog-timing"
              ]
            },
            {
              "id": "m10h4d18-q4",
              "kind": "find-bug",
              "prompt": "Öğrenci B'ye basınca kartın ezgiyi çalmasını istedi ama kart \"Bu blok için bir liste gerekli.\" hatası verdi:\n\n```\nbaşlangıçta:\n   ezgi = 0\n\ndüğme [B] basılınca:\n   her öğe için ezgi listesinde:\n      [öğe] Hz sesini [1/8] vuruş çal\n```\n\nHatanın nedeni nedir?",
              "options": [
                "1/8 vuruş seçilemez",
                "ezgi değişkenine liste yerine 0 sayısı atanmış",
                "Düğme B kullanılamaz",
                "öğe değişkeninin adı yanlış"
              ],
              "answer": 1,
              "explanation": "ezgi değişkeni 0 olduğu için bir liste değil, sıradan sayıdır. Başlangıçta içi dolu bir liste oluştur bloğu atanmalıdır. Diğer seçenekler hata mesajıyla ilgisizdir.",
              "skills": [
                "prog-debug",
                "prog-loops-arrays"
              ]
            },
            {
              "id": "m10h4d18-q5",
              "kind": "numeric",
              "prompt": "Bir listede 6 öğe var. Son öğenin numarası kaçtır?",
              "answer": 5,
              "tolerance": 0,
              "explanation": "Numaralama 0'dan başladığı için 6 öğenin numaraları 0, 1, 2, 3, 4, 5 olur. Son numara uzunluktan bir azdır: 6 - 1 = 5.",
              "skills": [
                "prog-loops-arrays"
              ]
            }
          ]
        },
        {
          "title": "Enstrüman yap",
          "durationMin": 22,
          "problem": "Bir piyanonun tuşları basılınca ses çıkarır. Peki hiç tuşu olmayan bir enstrüman olur mu? Teremin adlı garip bir enstrüman, ona hiç dokunmadan elini yaklaştırarak çalınır. Biz sanal kartın ışık sensörüyle buna benzer bir \"ışıklı tel\" yapacağız.",
          "contentMd": "### Düğmeler: üç tuşlu enstrüman\nKartta üç düğme birleşimi var: **A**, **B** ve **A+B**. **A+B** ikisine birden bastığın zaman çalışır. Bu üç düğmeyi üç nota için kullanacağız.\n\n### Sürekli ses\nŞimdiye kadarki nota blokları belli bir süre çalıp susuyordu. **Müzik** kategorisindeki **[440] Hz sesi sürekli çal** bloğu ise sesi başlatır ve sen **sesi durdur** bloğunu kullanana kadar bırakmaz. Bu iki blok birlikte kullanılır: biri sesi açar, öteki kapatır. Hoparlör bölümündeki **çalan** kutusu yalnız süreli notaları gösterir; sürekli sesi göstermeyebilir.\n\n### Yeni bloklar\n- **Temel** kategorisindeki **her [1000] ms'de** bloğu içindekileri belli aralıkla tekrar tekrar çalıştırır. Aralığı 100 yapacağız.\n- **Giriş** kategorisindeki **ışık seviyesi** bloğu 0 (karanlık) ile 255 (çok aydınlık) arasında bir sayı verir. Kartın yanındaki **Pusula ve sensörler** bölümünde **Işık** kaydırıcısıyla değiştirebilirsin.\n- **Giriş** kategorisindeki **logoya dokunuluyor mu?** bloğu, logoya şu an dokunuluyorsa doğru olur.\n- **Matematik** kategorisindeki **[ışık seviyesi] değerini [0]-[255] aralığından [200]-[1000] aralığına eşle** bloğu bir sayıyı bir aralıktan başka bir aralığa orantılar. Işık 0 iken 200, ışık 255 iken 1000 çıkar. Aradaki ışıklar aradaki frekansları verir.\n- **logoya [dokununca]** ve **logoya [bırakılınca]** başlıkları.\n\n### Adım adım\nEditörde beş başlık hazır: üç düğme, zamanlayıcı **her [100] ms'de** ve **logoya [bırakılınca]**.\n\n1. **düğme [A] [basılınca]** içine **[Do] notasını [1/4] vuruş çal**, **düğme [B] [basılınca]** içine **Re**, **düğme [A+B] [basılınca]** içine **Mi** koy.\n2. **her [100] ms'de** içine **Mantık** kategorisinden **eğer ... ise** bloğunu koy. Koşula **Giriş** kategorisinden **logoya dokunuluyor mu?** tak.\n3. **eğer** içine **Müzik** kategorisinden **[440] Hz sesi sürekli çal** koy. Frekans yerine **eşle** bloğunu tak. Eşle bloğunun ilk girişine **ışık seviyesi** bloğunu bırak ve aralıkları 0-255 ve 200-1000 yap.\n4. **logoya [bırakılınca]** içine **sesi durdur** bloğunu koy.\n5. ▶ **Çalıştır**. Üç düğmeyle notaları çal. Sonra logoya tıkla ve basılı tut; ışık kaydırıcısını oynat.\n\n### Beklenen sonuç\nDüğmelerle Do, Re, Mi çalar. Logoya basılı tutunca ses sürekli çınlar. Işık kaydırıcısını yukarı çekince ses tizleşir (1000 Hz'e yaklaşır), aşağı çekince kalınlaşır (200 Hz'e yaklaşır). Logoyu bırakınca ses susar. Dört hedefin hepsinde ✓ olmalı.\n\n### Nasıl çalışıyor?\n- **her [100] ms'de** her 0,1 saniyede bir ışığa bakar ve sesi günceller. Işığı değiştirdikçe ses de takip eder.\n- Logoya dokunulmuyorsa **eğer** içine girilmez, ses hiç başlamaz.\n- **sesi durdur** logoyu bırakınca çalışır. Bu bloğu koymazsan sürekli ses kendiliğinden susmaz.\n- **eşle** bloğu sonucu en yakın tam sayıya yuvarlar.\n\n### Dene\n1. Aralığı 100-2000 yap. Çok tiz sesi duymak ister misin?\n2. **ses seviyesini [128] yap (0-255)** bloğu sesin gürlüğünü ayarlar. Önce 40, sonra 255 dene.\n3. Işığın yerine **ses seviyesi** bloğunu koyup sesle tel çalmayı dene. Kartın **Ses** kaydırıcısını oynat.\n\n### Sık yapılan hatalar\n- **sesi durdur** koymamak.\n- **eşle** bloğunda aralıkları ters sırayla yazmak. İlk aralık sensörün aralığı (0-255), ikincisi sesin aralığı (200-1000) olmalı.\n- **eğer** bloğunu unutup sesi her 100 ms'de açmak. Logoya hiç dokunmasan da ses çalar.",
          "question": "Teremin elini yaklaştırarak çalınır, senin kartın ise ışıkla. Başka hangi sensörleri bir enstrümana çevirebilirsin? Ses seviyesi, sıcaklık ya da eğim nasıl bir ses çıkarırdı?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Düğme ve logo girişleriyle bir enstrümanı **çalmayı**\n- **Süreli** ve **sürekli** ses arasındaki farkı\n- **Eşle** bloğuyla bir sensör değerini frekansa çevirmeyi\n- Neden bir sürekli sesi **sesi durdur** ile kapatman gerektiğini\n\n### Önceden bilmen gerekenler\n16-18. dersler: nota çalma, tempo ve değişkenler. Ayrıca **eğer ... ise** bloğunu ve kartın **ışık seviyesi** sensörünü (0-255) bilmen gerekir.\n\n### Girişler, ses ve sensör\nBir enstrümanın üç parçası vardır: bir **giriş** (parmak, düğme, ışık), bir **kural** (hangi girişe hangi ses) ve bir **çıkış** (hoparlör). Kartta üç düğme birleşimi vardır: **A**, **B** ve **A+B**. Üçünü üç nota için kullanırsın. Logoya dokunmak dördüncü bir giriş olur.\n\n### Süreli ve sürekli ses\nŞimdiye kadarki nota blokları belirli bir süre çalıp susuyordu. **[N] Hz sesi sürekli çal** bloğu ise sesi başlatır ve bırakır; ses, **sesi durdur** bloğuna kadar çalmaya devam eder. İki blok bir çifttir: biri açar, öteki kapatır. Sürekli sesin süresi sıfır sayıldığı için Hoparlör bölümündeki \"çalan\" kutusu bu sesi göstermeyebilir; sesi yine de duyarsın.\n\n### Eşle: bir aralığı başka aralığa çevir\nIşık sensörü 0 ile 255 arasında sayı verir, ama kulağa hoş gelen frekanslar 200 ile 1000 arasındadır. **Eşle** bloğu bir değeri bir aralıktan diğerine orantılar:\n\n```\neşle( ışık , 0-255 , 200-1000 )\n   ışık   0  -> 200\n   ışık 255  -> 1000\n   ışık 128  -> 602   (ortalara yakın)\n```\n\nHesap: `200 + ışık × 800 / 255`, sonra en yakın tam sayıya yuvarlanır. İlk iki aralık sensörün, son iki aralık sesin aralığıdır. Sırayı karıştırırsan sonuç saçma çıkar.\n\n### Zamanlayıcıyla sürekli güncelleme\nIşık sürekli değiştiği için sesi bir kez ayarlamak yetmez. **her [100] ms'de** başlığı içindekileri saniyede on kez tekrarlar. İçine şunu yazarsın: **logoya dokunuluyorsa** sesi, o anki ışığa göre ayarla. Logoya dokunulmuyorsa **eğer** bloğu içeri girmez ve ses başlamaz. Logo bırakılınca **sesi durdur** çağıran ayrı bir başlık sesi kapatır. Bu bloğu unutursan sürekli ses kendiliğinden susmaz.\n\n### Özet\nBir enstrüman giriş, kural ve çıkıştan oluşur. Süreli nota kendi kendine biter; sürekli ses ise sesi durdur bloğuyla kapatılmalıdır. Eşle bloğu 0-255 gibi bir sensör aralığını bir frekans aralığına orantılar. Zamanlayıcı başlığı değerleri güncel tutar ve eğer bloğu sesi yalnızca logoya dokunulurken çaldırır.",
          "concepts": [
            {
              "term": "Sürekli ses",
              "definition": "Başlatıldıktan sonra sesi durdur bloğuna kadar çalan ses.",
              "example": "Logoya dokunurken sürekli ses çınlar, bırakınca durdur çalışır.",
              "pitfall": "Sesi durdur bloğunu koymamak; ses kendiliğinden susmaz."
            },
            {
              "term": "Eşle (aralık dönüştürme)",
              "definition": "Bir değeri bir aralıktan başka bir aralığa orantılar ve en yakın tam sayıya yuvarlar.",
              "example": "Işık 0-255 aralığından 200-1000 Hz aralığına eşlenince 255 ışık 1000 Hz verir.",
              "pitfall": "Aralıkları ters sırayla yazmak; önce sensörün, sonra sesin aralığı gelir."
            },
            {
              "term": "Işık seviyesi",
              "definition": "Sensörün okuduğu aydınlık; 0 (karanlık) ile 255 (çok aydınlık) arası.",
              "example": "Işık kaydırıcısını yukarı çekince değer büyür.",
              "pitfall": "Işık seviyesini doğrudan frekans olarak çalmak; 0-255 arası değerler çok pes duyulur."
            },
            {
              "term": "her [N] ms'de",
              "definition": "İçindekileri belirli aralıkla tekrar tekrar çalıştıran zamanlayıcı başlığı.",
              "example": "100 ms aralık, saniyede on kez ışığı okuyup sesi günceller.",
              "pitfall": "Aralığı çok uzun seçmek; ses ışığı geç takip eder."
            },
            {
              "term": "Koşul (eğer ... ise)",
              "definition": "İçindeki blokları yalnız koşul doğruyken çalıştırır.",
              "example": "Eğer logoya dokunuluyorsa ses çal; dokunulmuyorsa hiçbir şey yapma.",
              "pitfall": "Koşulu unutup sesi her turda başlatmak; logoya dokunmasan da ses çalar."
            }
          ],
          "quiz": [
            {
              "id": "m10h4d19-q1",
              "kind": "numeric",
              "prompt": "Işık seviyesi 255 iken eşle( ışık, 0-255, 200-1000 ) bloğu kaç Hz verir?",
              "answer": 1000,
              "tolerance": 0,
              "unit": "Hz",
              "explanation": "Eşle bloğu aralığın üst ucunu üst uca bağlar: 255 -> 1000. Işık 0 olsaydı 200 Hz çıkardı.",
              "skills": [
                "prog-timing"
              ]
            },
            {
              "id": "m10h4d19-q2",
              "kind": "numeric",
              "prompt": "Işık seviyesi 128 iken eşle( ışık, 0-255, 200-1000 ) bloğu kaç Hz verir? (Sonucu en yakın tam sayıya yuvarla.)",
              "answer": 602,
              "tolerance": 0,
              "unit": "Hz",
              "explanation": "200 + 128 × 800 / 255 = 200 + 401,57 = 601,57. En yakın tam sayıya yuvarlanınca 602 olur. Işık aralığın yarısından biraz fazla olduğu için sonuç 600'ün biraz üstündedir.",
              "skills": [
                "prog-timing"
              ]
            },
            {
              "id": "m10h4d19-q3",
              "kind": "find-bug",
              "prompt": "Öğrenci logoya dokununca ses çıksın istedi. Logoyu bırakınca da ses susmuyor:\n\n```\nher [100] ms'de:\n   eğer logoya dokunuluyor mu ise:\n      [eşle(ışık, 0-255, 200-1000)] Hz sesi sürekli çal\n\nlogoya [bırakılınca]:\n   (boş)\n```\n\nEksik olan nedir?",
              "options": [
                "her [100] ms'de bloğu",
                "logoya bırakılınca içinde sesi durdur bloğu",
                "eğer bloğu",
                "ışık seviyesi bloğu"
              ],
              "answer": 1,
              "explanation": "Sürekli ses kendiliğinden bitmez; sesi durdur bloğu şarttır. Bırakılınca başlığının içine eklenmelidir. Diğer bloklar sesi başlatır ama susturmaz.",
              "skills": [
                "prog-debug",
                "prog-structure"
              ]
            },
            {
              "id": "m10h4d19-q4",
              "kind": "predict-output",
              "prompt": "Logoya basılı tutuluyor. Işık kaydırıcısı önce 0'a, sonra 255'e çekiliyor:\n\n```\nher [100] ms'de:\n   eğer logoya dokunuluyor mu ise:\n      [eşle(ışık, 0-255, 200-1000)] Hz sesi sürekli çal\n```\n\nKaydırıcı 255'e geldikten bir süre sonra ses kaç Hz olur?",
              "options": [
                "200 Hz",
                "255 Hz",
                "1000 Hz",
                "602 Hz"
              ],
              "answer": 2,
              "explanation": "Zamanlayıcı saniyede on kez ışığa bakar ve sesi günceller. Işık 255 olunca eşle bloğu 1000 verir. 200 Hz ışık 0 iken çalardı; 255 ise doğrudan ışık değeridir, eşlenmemiş hâldir.",
              "skills": [
                "prog-structure"
              ]
            },
            {
              "id": "m10h4d19-q5",
              "kind": "mcq",
              "prompt": "Logoya hiç dokunmasan da ses çalıyor. Zamanlayıcının içinde sesi sürekli çal bloğu var. Büyük olasılıkla hangi blok eksik?",
              "options": [
                "eğer logoya dokunuluyor mu ise bloğu",
                "tempo bloğu",
                "sus bloğu",
                "Düğme [A] başlığı"
              ],
              "answer": 0,
              "explanation": "Koşul yoksa her 100 ms'de ses başlatılır; logoya dokunulmasa da çalar. Koşul bloğu sesi yalnızca logoya dokunulurken başlatır. Tempo ve sus blokları sürekli sesle ilgisizdir.",
              "skills": [
                "prog-debug",
                "prog-structure"
              ]
            }
          ]
        },
        {
          "title": "Proje: Sanal piyano",
          "durationMin": 32,
          "problem": "Bir müzik grubunda herkesin bir tuşu vardır ama sihirli şey, çaldığın şarkıyı kaydedip tekrar dinleyebilmektir. Bu projede kartından beş tuşlu bir piyano yapacaksın. Tuşlara bastıkça ekranda bir sütun yanacak, notalar kaydedilecek ve logoya dokununca çaldığın şarkı baştan oynayacak.",
          "contentMd": "### Proje: Sanal piyano\nBu hafta öğrendiğin her şeyi birleştireceksin: nota çalma, tempo, liste, döngü ve düğmelerle sensörlerden giriş almak.\n\n**Hedefler:**\n- Beş tuş beş farklı nota çalsın: Do, Re, Mi, Sol, La.\n- Her tuş ekranda kendi sütununu yaksın.\n- Çalınan notalar bir kayıt listesine eklensin.\n- Logoya dokununca kayıt baştan çalınsın.\n\n### Tuşlar\nKartın beş girişi var: **A**, **B**, **A+B** düğmeleri ve **P0**, **P1** pinleri. Pinler kartın altındaki üç dokunmatik bölgedir (kartın üzerindeki **0**, **1**, **2** yazan kutular). Sanal kartta onlara fareyle tıklayınca dokunulmuş olur. Eşleşmeyi şöyle yapalım:\n\n| Tuş | Nota | Ekranda yanacak sütun (x) |\n|---|---|---|\n| A | Do | 0 |\n| B | Re | 1 |\n| A+B | Mi | 2 |\n| P0 | Sol | 3 |\n| P1 | La | 4 |\n\n### Yeni blok\n**Pinler** kategorisindeki **[P0] pinine [dokununca]** bloğu bir pine dokunulunca çalışan yeni bir başlıktır. Düğme başlıklarından farkı yoktur; yalnız tetikleyen şey bir pindir.\n\n### Adım adım\nEditörde yedi başlık hazır: **başlangıçta**, üç düğme, iki pin ve **logoya [dokununca]**. Önce yalnız **A** tuşunu yap, çalıştığını gör. Sonra diğerlerini kopyala.\n\n1. **Değişken** kategorisinde **kayit** adlı bir değişken oluştur.\n2. **başlangıçta** içine **kayit değerini [0] yap** koy. Sıfırın yerine **Liste** kategorisinden içi boş olan **liste oluştur** bloğunu tak.\n3. **düğme [A] [basılınca]** içine sırayla şunları koy:\n   - **LED yak x [0] y [2]**\n   - **[Do] notasını [1/8] vuruş çal**\n   - **[kayit] listesine [nota Do] ekle**. Liste yerine **kayit** değişkenini, eklenecek öğe yerine **nota [Do]** bloğunu tak.\n   - **ekranı temizle**\n4. Bu dört bloğu seçip kopyala (Ctrl+C, Ctrl+V). Kopyaları **B**, **A+B**, **P0** ve **P1** başlıklarına taşı. Her kopyada **x** değerini ve notayı tablodaki gibi değiştir.\n5. **logoya [dokununca]** içine **[öğe] ile, [kayit] listesinin her öğesi için** bloğunu koy. İçine **[440] Hz sesini [1/8] vuruş çal** bloğunu koy ve frekans yerine **öğe** değişkenini tak.\n6. ▶ **Çalıştır**. Tuşlara tıklayarak kısa bir melodi çal. Sonra logoya tıkla.\n\n### Beklenen sonuç\nHer tuş kendi notasını çalar, ekranın ortasındaki satırda kendi sütunu bir an yanar ve söner. Logoya basınca çaldığın notalar, çaldığın sırayla yeniden çalınır. Dört hedefin hepsinde ✓ olmalı.\n\n### Nasıl çalışıyor?\n- Liste, çalınan her notanın frekansını sırayla saklar. Listenin sonuna eklemek için **listesine ... ekle** kullanılır.\n- Logoya dokununca döngü listedeki her sayıyı baştan sona çalar. Hızı notaların süresi ve tempo belirler.\n- Her tuşun gövdesi aynı kalıptır: yak, çal, kaydet, temizle. Yalnız nota ve sütun değişir.\n- Notalar 1/8 vuruş olduğu için tempo 120'de her biri çeyrek saniye sürer. Hızlı tıklarsan bir önceki nota bitmeden yeni tuş çalışır.\n\n### Dene\n1. **tempoyu [80] yap (vuruş/dk)** bloğunu **başlangıçta** içine koy. Çaldığın şarkı yavaşladı mı?\n2. Geri oynatmada döngünün içine **bekle [50] ms** ekle. Notalar arasında küçük boşluk oluşur.\n3. Listenin kaç nota tuttuğunu öğrenmek için **[kayit] listesinin uzunluğu** bloğunu **sayıyı göster** içine koy.\n4. Kayıt kendiliğinden hiç silinmiyor. Kendi kayıt silme tuşunu nasıl yapardın? (İpucu: kayıt değişkenine yeniden boş liste ata.)\n\n### Sık yapılan hatalar\n- **Listeyi başlangıçta kurmamak.** **kayit** hiç liste olmazsa ekleme bloğu \"Bu blok için bir liste gerekli.\" hatası verir ve program durur.\n- **Aynı sütunu iki tuşa vermek.** Hangi tuşa bastığını ekrandan ayırt edemezsin.\n- **Pin tuşunu başlıksız bırakmak.** **[P0] pinine [dokununca]** bloğunun içi boşsa dokunmak hiçbir şey yapmaz.",
          "question": "Piyanonu bir arkadaşın kullansa en çok neyi değiştirmek isterdi? Kayıt özelliğini başka hangi projede kullanırdın: bir şifre, bir oyun, bir günlük?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Birden çok girişi (düğme, pin) tek bir **kalıba** bağlamayı\n- Çalınan notaları bir **kayıt listesine** eklemeyi\n- Kaydı **logoya dokununca** baştan çalmayı\n- Bir projeyi **plan, kur, dene** adımlarıyla bölmeyi\n\n### Önceden bilmen gerekenler\n16-19. dersler: nota çalma, tempo, liste ve **her öğe için** döngüsü, olay başlıkları. Ayrıca ekrana LED yakmayı (**LED yak x y**) ve **ekranı temizle** bloğunu bilmelisin.\n\n### Projeyi parçala\nSanal piyano büyük görünür ama aslında aynı küçük işin beş kez tekrarıdır. İşi önce tabloya dök:\n\n```\nTuş   Nota   Sütun (x)\nA     Do     0\nB     Re     1\nA+B   Mi     2\nP0    Sol    3\nP1    La     4\n```\n\nTablo kodun omurgasıdır. Her tuş yalnız iki şeyle ayrılır: çalacağı nota ve yakacağı sütun.\n\n### Tuş kalıbı\nHer tuşun gövdesi dört adımdır:\n\n```\n1. LED yak (x, 2)\n2. Notayı [1/8] vuruş çal\n3. Notanın frekansını kayıt listesine ekle\n4. Ekranı temizle\n```\n\nÖnce yalnız A tuşunu yap ve çalıştır. Çalışıyorsa bloklarını kopyala, diğer başlıklara taşı ve yalnız nota ile sütunu değiştir. Bu, **önce küçüğü çalıştır, sonra çoğalt** yöntemidir; hata aramak çok kolaylaşır.\n\n### Kayıt listesi\n**Başlangıçta** başlığında **kayit** değişkenine **boş bir liste** atarsın. Her tuşta **kayit listesine [nota] ekle** bloğu notanın frekansını listenin sonuna koyar. A, B, A, P0 tuşlarına bu sırayla basarsan liste şu olur:\n\n```\nkayit = [262, 294, 262, 392]     uzunluk 4\n```\n\nEkle bloğu notayı çaldıktan sonra çalışır, çünkü nota bloğu önce süresini bekler. Aynı tuşa hızlı basarsan kart basışları sıraya koyar (en fazla üç tane); farklı tuşlar ise aynı anda çalışabilir.\n\n### Geri oynatma\n**logoya dokununca** başlığına **her öğe için, kayit** döngüsü koyarsın. Döngünün içinde **[öğe] Hz sesini [1/8] vuruş çal** bloğu vardır. Tempo 120'de her nota 250 ms'dir; dört notalık kayıt 1000 ms sürer. Tempo 80 ise bir nota 375 ms, dört nota 1500 ms eder. Kayıt hiç silinmez; silmek için kayit değişkenine yeniden boş liste atarsın.\n\n### Özet\nBüyük bir projeyi küçük bir tabloya ve tek bir kalıba indirmek işi kolaylaştırır. Her tuş yak, çal, kaydet, temizle adımlarını izler. Kayıt, notaların frekanslarını sırayla biriktiren bir listedir; geri oynatma bu listeyi her öğe için döngüsüyle baştan sona çalar. Süre, nota sayısı ile tempo birimi çarpılarak bulunur.",
          "concepts": [
            {
              "term": "Kayıt listesi",
              "definition": "Çalınan notaların frekanslarını çalınma sırasıyla biriktiren liste.",
              "example": "A, B, A, P0 basışlarından sonra kayit = [262, 294, 262, 392] olur.",
              "pitfall": "Listeyi başlangıçta boş liste olarak kurmamak; ekleme bloğu \"Bu blok için bir liste gerekli.\" hatası verir."
            },
            {
              "term": "Listeye ekle",
              "definition": "Bir değeri listenin sonuna ekler; liste bir öğe uzar.",
              "example": "kayit listesine [nota Do] ekle bloğu listeye 262 koyar.",
              "pitfall": "Notayı çalıp kaydetmeyi unutmak; geri oynatma o notayı bilmez."
            },
            {
              "term": "Geri oynatma",
              "definition": "Kayıt listesindeki her notayı baştan sona sırayla çalan döngü.",
              "example": "Logoya dokununca her öğe için kayit döngüsü çalışır.",
              "pitfall": "Kaydın sıfırlanmasını beklemek; kayıt, sen boş liste atamadıkça kalır."
            },
            {
              "term": "Tuş kalıbı",
              "definition": "Bütün tuşlarda aynı olan yak, çal, kaydet, temizle dizisi.",
              "example": "Tuş kopyalanır, yalnız nota ve sütun (x) değiştirilir.",
              "pitfall": "Aynı sütunu iki tuşa vermek; hangi tuşa bastığını ekrandan ayırt edemezsin."
            },
            {
              "term": "Pin dokunuşu (P0, P1)",
              "definition": "Kartın altındaki dokunmatik bölgeler; düğme gibi ayrı bir başlıkla tetiklenir.",
              "example": "P0 pinine dokununca başlığı Sol notasını çalar.",
              "pitfall": "Başlığı boş bırakmak; içi boş başlık dokunulduğunda hiçbir şey yapmaz."
            }
          ],
          "quiz": [
            {
              "id": "m10h4d20-q1",
              "kind": "numeric",
              "prompt": "Kayıt listesinde 8 nota var. Tempo 120'de geri oynatma her notayı [1/8] vuruş çalıyor. Tüm kayıt kaç milisaniye sürer?",
              "answer": 2000,
              "tolerance": 0,
              "unit": "ms",
              "explanation": "Tempo 120'de 1/8 vuruş 250 ms'dir. 8 × 250 = 2000 ms. Her nota bloğu bitene kadar beklediği için süreler toplanır.",
              "skills": [
                "prog-timing",
                "prog-loops-arrays"
              ]
            },
            {
              "id": "m10h4d20-q2",
              "kind": "numeric",
              "prompt": "Tempo 80. Dört notalık bir kaydı, her biri [1/8] vuruş olacak şekilde geri oynatmak kaç milisaniye sürer?",
              "answer": 1500,
              "tolerance": 0,
              "unit": "ms",
              "explanation": "Tempo 80'de bir birim 60000 / 80 = 750 ms, 1/8 vuruş yarısı: 375 ms. 4 × 375 = 1500 ms. Tempo düştüğü için kayıt, tempo 120'ye göre (1000 ms) daha uzun sürer.",
              "skills": [
                "prog-timing"
              ]
            },
            {
              "id": "m10h4d20-q3",
              "kind": "predict-output",
              "prompt": "Başlangıçta kayit boş bir listedir. Sırayla şu tuşlara basılıyor: A (Do), P0 (Sol), A (Do). Ardından logoya dokunuluyor. Geri oynatmada hoparlörden hangi frekanslar sırayla duyulur?",
              "options": [
                "262, 392, 262",
                "262, 262, 392",
                "392, 262, 262",
                "262, 392"
              ],
              "answer": 0,
              "explanation": "Liste, notaları basış sırasıyla biriktirir: [262, 392, 262]. Geri oynatma baştan sona çalar. Tekrarlar silinmez; Do iki kez kaydedilmiştir.",
              "skills": [
                "prog-loops-arrays"
              ]
            },
            {
              "id": "m10h4d20-q4",
              "kind": "find-bug",
              "prompt": "Piyano çalışırken tuşa basınca \"Bu blok için bir liste gerekli.\" hatası çıkıp program duruyor:\n\n```\nbaşlangıçta:\n   (boş)\n\ndüğme [A] basılınca:\n   LED yak (0, 2)\n   [Do] notasını [1/8] vuruş çal\n   kayit listesine [262] ekle\n   ekranı temizle\n```\n\nSorun nedir?",
              "options": [
                "LED yak bloğu y = 2 ile kullanılamaz",
                "kayit değişkenine başlangıçta boş liste atanmamış",
                "ekranı temizle bloğu yanlış yerde",
                "Do notası 1/8 vuruş çalamaz"
              ],
              "answer": 1,
              "explanation": "Ekle bloğu bir liste ister. Başlangıçta kayit değişkenine boş bir liste atanmadığı için değişken liste değildir. Diğer seçenekler hatayla ilgisizdir.",
              "skills": [
                "prog-debug",
                "prog-loops-arrays"
              ]
            },
            {
              "id": "m10h4d20-q5",
              "kind": "mcq",
              "prompt": "Sanal piyanoda iki tuşa aynı sütunu (x = 1) verirsen hangi sorun çıkar?",
              "options": [
                "Program hiç çalışmaz",
                "Hangi tuşa bastığın ekrandan ayırt edilemez",
                "Notaların frekansı değişir",
                "Kayıt listesi silinir"
              ],
              "answer": 1,
              "explanation": "Her tuşun ekranda ayrı bir sütunla gösterilmesi, tuşları ayırt etmek içindir. Aynı sütun iki tuşu aynı gösterir. Program çalışır, notalar ve kayıt etkilenmez.",
              "skills": [
                "prog-planning",
                "prog-debug"
              ]
            }
          ]
        }
      ]
    },
    {
      "title": "Radyo ve iletişim",
      "project": "Uzaktan kumanda",
      "guideMd": "### Hafta hedefleri\nBu haftanın sonunda öğrenci:\n1. Radyo grubunun ne olduğunu açıklayabilir ve iki kartı aynı gruba alarak mesaj gönderip alabilir.\n2. Sayı, yazı ve ad = değer mesajlarını ayırt edip doğru alma bloğunu seçebilir.\n3. Değişkenlerle toplama ve çıkarma kullanarak basit bir şifre kurabilir ve anahtarın rolünü anlatabilir.\n4. Bir komut tablosu hazırlayıp iç içe **eğer** zinciriyle gelen sayıyı simgeye ya da eyleme çevirebilir.\n5. Kumanda ve araç rollerinde çalışan iki kartlı bir proje planlayıp kurabilir.\n\n### Haftanın planı\nHafta beş derstir; her ders yaklaşık 20-32 dakikadır. Plan günde bir ders içindir.\n\n| Gün | Ders | Süre | Ne yapılır |\n|---|---|---|---|\n| 1 | Mesaj gönder, mesaj al | ~20 dk | Anlatımı oku, iki kartı aynı gruba al, A ve B ile sayı gönder, alan kartta simge göster. |\n| 2 | Yazı, ad ve değer | ~20 dk | Yazı ve ad = değer mesajı gönder, alan kartta türü ad kontrolüyle ayır. |\n| 3 | Gizli mesaj | ~22 dk | Anahtar değişkeniyle toplayıp gönder, alan kartta çıkararak çöz. |\n| 4 | İki kartla sohbet | ~22 dk | Sayı tablosunu kur, iç içe eğer zinciriyle üç simgeyi ayır, ezgi ekle. |\n| 5 | Proje: Uzaktan kumanda | ~32 dk | Komut tablosunu yaz, kumanda ve araç tarafını kur, ok ve servoyu dene. |\n\n### Ön koşul kontrolü\n- Düğme başlıklarını (A, B, A+B) kullanabiliyor mu? (Hafta 2)\n- Değişken oluşturup değerini değiştirebiliyor mu? (Ders 7)\n- **eğer ... ise ... değilse** bloğunu kurabiliyor mu? (Ders 8)\n- Kartı yatırma olayını ve ezgi çalmayı tanıyor mu? (Ders 11 ve Ders 18)\n- Editörde iki kart yan yana açabiliyor mu? (İlk derste gösterilir.)\n\n### Kavram haritası\n- **Radyo temeli:** grup (0-255) → gönderen blok → **radyo mesajı alınınca** → **alınan [sayı]**\n- **Mesaj türleri:** sayı → yazı (en çok 32 karakter) → ad = değer (ad en çok 12 karakter)\n- **Veri düzenleme:** şifreleme (anahtar, toplama ve çıkarma) → komut tablosu (protokol) → mesajı değişkene almak\n- **Karar verme:** eğer → iç içe eğer zinciri → son değilse kolu\n- **Proje:** kart yatışı → komut → radyo → ok ve servo\n\n### Sık yapılan hatalar\n- **İki kartı farklı gruba koymak.** Mesaj ulaşmaz ve hata mesajı çıkmaz.\n- **Alma başlığını boş bırakmak.** Gönderen çalışsa bile alan kart hiçbir şey yapmaz.\n- **Gönderenin kendi mesajını alacağını sanmak.** Mesaj yalnız gruptaki öteki karta gider.\n- **Adı iki tarafta farklı yazmak.** \"sicak\" ile \"sıcak\" aynı değildir; ad 12 karakterden uzunsa kesilir.\n- **Şifrede iki tarafta aynı işlemi kullanmak.** Gönderen toplarsa alan çıkarmalıdır.\n- **Anahtarı ya da mesaj değişkenini doldurmamak.** Değişken 0 kalır, sonuç sessizce yanlış çıkar.\n- **İkinci eğer'i değilse kolunun dışına koymak.** Zincirin sırası bozulur.\n- **Tabloyu iki tarafta farklı kurmak.** Sayıların anlamı kaybolur.\n\n### Hafta sonu tekrarı\n1. Her dersin kavram kartlarını oku ve \"sık yapılan yanlış\" satırlarını yüksek sesle söyle.\n2. Mini testlerde yanlış yaptığın soruların açıklamalarını yeniden oku, sonra soruyu yeniden çöz.\n3. Bakmadan iki kartlı en küçük programı kur: A ile kalp gönder, alan kart kalbi göstersin.\n4. Gizli mesaj programında anahtarı 7'den 20'ye çevir; düz rakam 5 için radyoyla hangi sayı gider? (Cevap: 25.)\n5. Kendi cümlelerinle şu soruyu cevapla: \"Gönderen ve alan taraf neden aynı tabloyu kullanmalı?\"\n\nHafta sonu testi olarak beş dersin mini testleri yeterlidir; her derste 5 soru, toplam 25 soru. Hedef: her dersten en az 4 doğru. Eksik kalan dersin anlatımına dön.\n\n### Proje değerlendirme ölçütü (Uzaktan kumanda)\n| Ölçüt | Gelişmeli | Yeterli | İleri |\n|---|---|---|---|\n| Plan | Komut tablosu yok | Tabloda komut, ekran ve servo açısı var | Tablo kodla birebir uyuyor ve bilinmeyen komut için karar yazılmış |\n| Kumanda tarafı | Bazı yönler mesaj göndermiyor | Dört yön ve A düğmesi doğru sayıyı yolluyor | Ek bir olay (örneğin yüzü yukarı) ya da eğim bilgisi de gönderiliyor |\n| Araç tarafı | Gelen sayı okunmuyor ya da zincir bozuk | Her komutta doğru ok gösteriliyor ve servo dönüyor | Bip ya da ek bir tepki var, son kol aracı durduruyor |\n| Hata ayıklama | Hatayı bulamıyor | Hatayı grup, tablo ya da boş başlık olarak bulup düzeltiyor | Hatayı nasıl bulduğunu ve önlemeyi anlatıyor |\n| Anlatım | Ne yaptığını anlatamıyor | Sistemi kumanda, mesaj ve araç diye anlatıyor | Mesaj kaybolursa ne olacağını ve neye ihtiyaç olduğunu tartışıyor |\n\n### Veli ve öğretmen notu\n- **Amaç.** Bu hafta iki ayrı şeyin yalnız bir mesajla bağlanabileceğini görmek, gelen mesajı yorumlayan program kurmak ve ortak bir \"anlaşma\" (tablo) fikrini kavramaktır.\n- **Nasıl destek olunur?** Cevabı söylemek yerine şunları sor: \"İki kart aynı grupta mı?\", \"Alma başlığının içinde ne var?\", \"Hangi sayıyı gönderdin, tabloda o sayı ne demek?\"\n- **Sessiz hatalar.** Radyoda çoğu hata uyarı üretmez. Öğrenciye hatayı sistematik aratın: önce grup, sonra gönderen blok, sonra alma başlığı.\n- **Şifreleme.** Burada kurulan şifre öğretici bir örnektir, gerçek güvenlik sağlamaz. Gerçek hayatta şifre ya da parola paylaşılmaz.\n- **Güvenlik ve gizlilik.** Portal tamamen sanaldır; gerçek bir radyo, motor ya da kişisel veri kullanılmaz.\n- **İlerleme.** Mini test sonuçları \"İlerlemem\" sayfasında beceri bazında görünür (taslak/pilot özellik; yalnız onay verildiyse kaydedilir).",
      "lessons": [
        {
          "title": "Mesaj gönder, mesaj al",
          "durationMin": 20,
          "problem": "Telsizle konuşan iki kişi aynı kanala ayarlanmak zorundadır. Kanal farklıysa ne kadar bağırırsan bağır, öteki duymaz. Mikro Kart'ların da bir radyosu var ve kanalın adı **grup**. Bu derste iki kartı aynı gruba ayarlayıp birinden ötekine mesaj yollayacaksın.",
          "contentMd": "### İki kart\nRadyo, iki kartla çalışır. Bu etkinlikte editörde iki kart yan yana görünür (kendiliğinden gelmezse sağdaki **Radyo** bölümünde **İkinci kart ekle** düğmesine bas). İki kart da **aynı programı** çalıştırır. Yani yazdığın program hem gönderen hem alan kartta çalışır. Sanal portalda gerçek bir donanım ya da uzaklık yoktur; mesaj çok kısa bir an (yaklaşık 10 milisaniye) sonra öteki karta ulaşır.\n\n### Yeni bloklar\nHepsi **Radyo** kategorisinde:\n- **radyo grubunu [1] yap**: kartın hangi gruba katılacağını söyler. Grup 0 ile 255 arasında bir sayıdır. Aynı gruptaki kartlar birbirini duyar.\n- **radyoyla sayı gönder [1]**: gruptaki öteki karta bir sayı yollar.\n- **radyo mesajı alınınca**: bir mesaj gelince çalışan başlık.\n- **alınan [sayı]**: gelen mesajdaki sayıyı verir. Listeden **yazı**, **ad** ve **değer** de seçilebilir; onları sonraki derste göreceksin.\n\n### Adım adım\nEditörde **başlangıçta**, iki düğme başlığı ve **radyo mesajı alınınca** hazır.\n\n1. **başlangıçta** içine **radyo grubunu [1] yap** bloğunu koy.\n2. **düğme [A] [basılınca]** içine **radyoyla sayı gönder [1]** koy. **düğme [B] [basılınca]** içine aynı bloğu koyup sayıyı **2** yap.\n3. **radyo mesajı alınınca** içine **Mantık** kategorisinden **eğer ... ise ... değilse** bloğunu koy. (Paletinde iki **eğer** bloğu var; \"değilse\" kolu olanı al.)\n4. Koşul için karşılaştırma bloğunu **eğer**'in koşuluna tak. Sol tarafa **Radyo** kategorisinden **alınan [sayı]**, sağ tarafa **1** yaz. İşaret **=** olsun.\n5. **ise** koluna **simgeyi göster [kalp]**, **değilse** koluna **simgeyi göster [mutlu yüz]** koy.\n6. ▶ **Çalıştır**. Kart 1'in **A** düğmesine bas. Sonra **B**'ye bas.\n\n### Beklenen sonuç\nKart 1'de **A**'ya basınca Kart 2'nin ekranında kalp, **B**'ye basınca mutlu yüz görünür. Gönderen kart kendi mesajını almaz: Kart 1'in ekranı değişmez. Radyo bölümündeki **Son alınan:** kutusu alınan sayıyı gösterir. Beş hedefin hepsinde ✓ olmalı.\n\n### Nasıl çalışıyor?\n- Kart 1 **A** ile sayıyı yollar. Aynı grupta olan Kart 2'ye 10 ms sonra ulaşır. Kart 2'de **radyo mesajı alınınca** başlığı çalışır.\n- **alınan [sayı]** bloğu başlığın içinde, o an gelen mesajı okur.\n- Kart 2 de aynı programı çalıştırdığı için Kart 2'nin **A**'sına basarsan Kart 1'de kalp görünür. Yani iki taraf da yollayıp alabilir.\n- Program grup bloğunu koymasan bile kartlar başlangıçta 1. gruptadır. Yine de grubu açıkça yazmak iyi alışkanlıktır.\n\n### Dene\n1. Kart 2'nin grubunu değiştir: Radyo bölümünde **Kart 2 grubu** listesinden **5** seç. Kart 1'den mesaj yolla. Ne oluyor? Sonra listeyi **Programdan**'a geri al.\n2. Radyo bölümünden elle mesaj yolla: tür **sayı**, mesaj **1**, **Kart 2'ye gönder**. Aynı sonucu görüyor musun?\n3. Programına üçüncü bir mesaj ekle: **A+B** düğmesi **3** göndersin, Kart 2 üzgün yüz göstersin.\n\n### Sık yapılan hatalar\n- **İki kartı farklı gruba koymak.** Mesaj hiç ulaşmaz. Hata mesajı da çıkmaz, çünkü kart kimin dinlediğini bilmez.\n- **Alma kodunu yazmamak.** Gönderen çalışsa bile **radyo mesajı alınınca** içi boşsa alan kart hiçbir şey yapmaz.\n- **Sayıyı yanlış karşılaştırmak.** **alınan [sayı]** değeri **1** ile eşit mi diye bakmak için karşılaştırma bloğundaki işaret **=** olmalı.",
          "question": "Telsizde kanal seçmek ile kartta grup seçmek aynı şey mi? Mesajını sadece arkadaşının duymasını nasıl sağlarsın?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Kartların radyoyla nasıl konuştuğunu ve **grup** numarasının ne işe yaradığını\n- Mesajı gönderen ile mesajı alan tarafın ayrı ayrı programlandığını\n- \"Radyo mesajı alınınca\" başlığının ne zaman çalıştığını\n- Gelen sayıya göre karar vermeyi\n\n### Önceden bilmen gerekenler\n- Düğme başlıkları ve **eğer ... ise ... değilse** bloğu (Ders 6 ve Ders 8)\n- Ekranda simge göstermek (Ders 3)\n\n### Telsiz gibi düşün\nİki telsiz yalnızca aynı kanala ayarlıysa birbirini duyar. Mikro Kart'ın radyosunda kanalın adı **grup**tur. Grup 0 ile 255 arasında bir sayıdır, yani 256 farklı grup vardır. Aynı gruptaki kartlar birbirinin mesajını alır; farklı gruptakiler duymaz. Program hiçbir şey söylemezse kart 1. gruptadır.\n\n### Gönderen ve alan\nRadyoda iki ayrı iş vardır ve ikisi için ayrı blok yazarsın:\n\n```\ndüğme A basılınca:\n    radyoyla sayı gönder 1\n\nradyo mesajı alınınca:\n    eğer alınan sayı = 1 ise kalp göster\n```\n\nGönderme bloğu istediğin anda çalışır; mesaj gruptaki öteki karta gider. Alma başlığı ise sen çağırmadan, mesaj **ulaştığında** kendiliğinden çalışır. Bu, düğme başlığına benzer: orada olay bir tuş basışıdır, burada olay bir mesajın gelişidir.\n\n### Mesaj hemen ulaşmaz\nSanal portalda iki kart arasında uzaklık yoktur, ama gerçek radyolar gibi mesajın yolda geçirdiği kısa bir süre vardır: yaklaşık 10 milisaniye. Göz bunu fark etmez. Önemli kural şudur: **gönderen kart kendi mesajını almaz.** Kart 1 yollar, Kart 2 alır. İki kart aynı programı çalıştırırsa Kart 2 de yollayabilir ve Kart 1 alır.\n\n### Gelen sayıyla karar vermek\nMesajın içindeki sayıya **alınan [sayı]** bloğuyla bakarsın. Bu blok yalnızca alma başlığının içinde anlamlıdır, çünkü \"en son gelen mesaj\" o an orada bulunur. Sonra klasik bir koşul kurarsın: sayı 1 ise kalp, değilse mutlu yüz. Gönderen taraf hangi sayıyı yolladığına göre öteki kart farklı iş yapar. Böylece tek bir sayı küçük bir **komut** olur.\n\n### Sessiz hatalar\nRadyo yanlış çalışınca çoğu zaman uyarı çıkmaz. Kart, kimin dinlediğini bilemez; mesajı yollar ve işi biter. Bu yüzden üç şeyi kontrol et: iki kart aynı grupta mı, gönderen blok doğru düğmenin içinde mi, alan tarafta başlığın içi dolu mu?\n\n### Özet\nRadyo mesajları aynı gruptaki kartlar arasında gider; grup 0-255 arası bir sayıdır. Gönderen blok mesajı yollar, **radyo mesajı alınınca** başlığı mesaj gelince çalışır. Gönderen kendi mesajını almaz ve mesaj yaklaşık 10 ms sonra ulaşır. Gelen sayıya göre **eğer** bloğuyla karar verirsin. Mesaj gitmiyorsa önce grup numaralarına bak.",
          "concepts": [
            {
              "term": "Radyo grubu",
              "definition": "Kartların hangi kanalda konuştuğunu belirleyen 0-255 arası sayı. Aynı gruptaki kartlar birbirini duyar.",
              "example": "Her iki kart da grup 1'deyse Kart 1'in gönderdiği sayı Kart 2'ye ulaşır.",
              "pitfall": "İki kartı farklı gruba koymak: mesaj hiç ulaşmaz ve hata mesajı da çıkmaz."
            },
            {
              "term": "radyoyla sayı gönder",
              "definition": "Gruptaki öteki karta bir sayı yollayan blok.",
              "example": "A düğmesinin içine 1, B düğmesinin içine 2 gönderen blok koyarsan iki farklı komut yollarsın.",
              "pitfall": "Gönderen kartın kendi mesajını alacağını sanmak; gönderen kart kendi mesajını almaz."
            },
            {
              "term": "radyo mesajı alınınca",
              "definition": "Gruptan bir mesaj ulaştığında kendiliğinden çalışan başlık.",
              "example": "Başlığın içine eğer bloğu koyup gelen sayıya göre simge gösterebilirsin.",
              "pitfall": "Başlığı boş bırakmak: gönderen çalışsa bile alan kart hiçbir şey yapmaz."
            },
            {
              "term": "alınan [sayı]",
              "definition": "Alma başlığının içinde, o an gelen mesajdaki sayıyı veren blok.",
              "example": "alınan sayı = 1 karşılaştırması, 1 numaralı komut gelip gelmediğini sorar.",
              "pitfall": "Bu bloğu alma başlığının dışında kullanmak; orada anlamlı bir mesaj yoktur."
            },
            {
              "term": "Komut sayısı",
              "definition": "Bir sayıya önceden kararlaştırılmış bir anlam yüklemek: 1 = kalp, 2 = mutlu yüz gibi.",
              "example": "Kart 1 sayı 2 yollar, Kart 2 sayıyı görünce mutlu yüz gösterir.",
              "pitfall": "Karşılaştırma işaretini yanlış seçmek; eşitlik için = kullanılır."
            }
          ],
          "quiz": [
            {
              "id": "m10h5d21-q1",
              "kind": "mcq",
              "prompt": "Kart 1'in grubu 3, Kart 2'nin grubu 4. Kart 1 radyoyla sayı gönderiyor. Ne olur?",
              "options": [
                "Kart 2 mesajı alır",
                "Radyo hata mesajı gösterir",
                "Kart 2 mesajı almaz ve hata mesajı çıkmaz",
                "Kart 1 mesajı kendi ekranında gösterir"
              ],
              "answer": 2,
              "explanation": "Mesaj yalnızca aynı gruptaki kartlara gider. Gruplar farklı olduğu için Kart 2 mesajı almaz. Kart bunu bilemediğinden hata mesajı da çıkmaz; bu yüzden yanıt \"hata verir\" yanlıştır.",
              "skills": [
                "mk-radio-group",
                "mk-message-flow"
              ]
            },
            {
              "id": "m10h5d21-q2",
              "kind": "predict-output",
              "prompt": "İki kart da aynı programı çalıştırıyor ve ikisi de grup 1'de. Kart 1'de A düğmesine basılıyor.\n\n```\nbaşlangıçta: radyo grubunu 1 yap\n\ndüğme A basılınca:\n    radyoyla sayı gönder 1\n    simgeyi göster kalp\n\nradyo mesajı alınınca:\n    eğer alınan sayı = 1 ise\n        simgeyi göster mutlu yüz\n```\n\nİki ekranda ne görünür?",
              "options": [
                "Kart 1: kalp, Kart 2: kalp",
                "Kart 1: kalp, Kart 2: mutlu yüz",
                "Kart 1: mutlu yüz, Kart 2: mutlu yüz",
                "Kart 1: kalp, Kart 2: boş"
              ],
              "answer": 1,
              "explanation": "Kart 1, A'nın içinde kalbi kendisi gösterir ve mesajı yollar. Gönderen kendi mesajını almadığı için Kart 1'in alma başlığı çalışmaz; kalp kalır. Kart 2 mesajı alır, sayı 1 olduğundan mutlu yüz gösterir. Kart 2'de kalp görünmez, çünkü kalbi gösteren blok düğmenin içindedir ve düğmeye yalnız Kart 1'de basıldı.",
              "skills": [
                "mk-message-flow",
                "mk-conditions"
              ]
            },
            {
              "id": "m10h5d21-q3",
              "kind": "find-bug",
              "prompt": "Kart 1'deki A düğmesine basınca Kart 2 hiçbir şey yapmıyor. İki kart da grup 1'de. Hatayı bul.\n\n```\nbaşlangıçta: radyo grubunu 1 yap\n\ndüğme A basılınca:\n    radyoyla sayı gönder 1\n\nradyo mesajı alınınca:\n    (boş)\n```",
              "options": [
                "Radyo grubu 1 olamaz",
                "Gönderme bloğu düğmenin içinde olmamalı",
                "Sayı 1 yerine 0 olmalı",
                "Alma başlığının içi boş, mesajı işleyen blok yok"
              ],
              "answer": 3,
              "explanation": "Mesaj Kart 2'ye ulaşıyor, ama alma başlığının içi boş olduğundan Kart 2 ona tepki vermiyor. Grup numaraları aynı (1) olduğu için grup hatası yoktur; gönderme bloğu da doğru yerdedir.",
              "skills": [
                "mk-message-flow",
                "prog-debug"
              ]
            },
            {
              "id": "m10h5d21-q4",
              "kind": "numeric",
              "prompt": "Radyo grubu 0 ile 255 arasında bir sayıdır (0 ve 255 dahil). Kaç farklı grup vardır?",
              "answer": 256,
              "tolerance": 0,
              "unit": "grup",
              "explanation": "0'dan 255'e kadar 256 sayı vardır; saymaya 0'dan başlandığı için son numara (255) ile grup sayısı (256) farklıdır.",
              "skills": [
                "mk-radio-group"
              ]
            },
            {
              "id": "m10h5d21-q5",
              "kind": "mcq",
              "prompt": "alınan [sayı] bloğu en doğru nerede kullanılır?",
              "options": [
                "radyo mesajı alınınca başlığının içinde",
                "başlangıçta içinde, program açılırken",
                "Yalnız düğme başlıklarının içinde",
                "Gönderme bloğundan önce, her yerde"
              ],
              "answer": 0,
              "explanation": "Gelen mesaj alma başlığının içinde bulunur; blok oradan okur. Düğme başlığında ya da başlangıçta henüz alınmış mesaj olmayabilir, bu yüzden orada beklenen sayıyı vermez.",
              "skills": [
                "mk-message-flow",
                "mk-conditions"
              ]
            }
          ]
        },
        {
          "title": "Yazı, ad ve değer",
          "durationMin": 20,
          "problem": "\"Sıcaklık 28\" diye bir mesajı iki parçaya bölebilirsin: \"sıcaklık\" bir ad, 28 bir değer. Adı bilen kart değeri doğru yere koyar. Bir sayı yetmediğinde radyo yazı da taşıyabilir, bir ad ile bir değeri çift olarak da. Bu derste üç mesaj türünü de kullanacaksın.",
          "contentMd": "### Üç mesaj türü\n| Tür | Gönderen blok | Alan blok |\n|---|---|---|\n| sayı | **radyoyla sayı gönder [1]** | **alınan [sayı]** |\n| yazı | **radyoyla yazı gönder [merhaba]** | **alınan [yazı]** |\n| ad = değer | **radyoyla [ad] = [1] gönder** | **alınan [ad]** ve **alınan [değer]** |\n\nSınırlar: bir yazı en çok 32 karakter olabilir, bir ad en çok 12 karakter. Fazlası kesilir. Bu derste adları Türkçe harf kullanmadan yazacağız (örneğin **sicak**). Gönderen ve alan taraf adı harfi harfine aynı yazmalı.\n\n**sinyal gücü** adlı bir blok da var. Sanal radyoda uzaklık yoktur, bu yüzden sinyal gücü hep 200'dür. Yine de bilmek güzel: gerçek radyolarda sinyal gücü genellikle uzaklaştıkça azalır.\n\n### Adım adım\nEditörde **başlangıçta**, **düğme [A] [basılınca]**, **düğme [B] [basılınca]** ve **radyo mesajı alınınca** hazır.\n\n1. **başlangıçta** içine **radyo grubunu [1] yap** koy.\n2. **düğme [A] [basılınca]** içine **radyoyla yazı gönder [selam]** koy. Yazıyı **selam** yap.\n3. **düğme [B] [basılınca]** içine **radyoyla [sicak] = [0] gönder** koy. Adı **sicak** yap. Değer yerine **Giriş** kategorisinden **sıcaklık (°C)** bloğunu tak.\n4. **radyo mesajı alınınca** içine **eğer ... ise ... değilse** koy. Koşul: **alınan [ad]** **=** **sicak**. **ise** kolunda **sayıyı göster** içine **alınan [değer]**. **değilse** kolunda **yazıyı göster** içine **alınan [yazı]**.\n5. ▶ **Çalıştır**. Kart 1'in sıcaklığını **Pusula ve sensörler** bölümündeki **Sıcaklık** kaydırıcısıyla 28 yap. Kart 1'de **A**'ya, sonra **B**'ye bas.\n\n### Beklenen sonuç\n**A**'ya basınca Kart 2'nin ekranında **selam** yazısı kayar (yaklaşık 3 saniye). **B**'ye basınca Kart 2'de **28** görünür. Beş hedefin hepsinde ✓ olmalı.\n\n### Nasıl çalışıyor?\n- Yazı mesajının **alınan [ad]** değeri boştur. Bu yüzden karşılaştırma yanlış çıkar ve **değilse** kolu çalışır.\n- **ad = değer** mesajında **alınan [ad]** \"sicak\", **alınan [değer]** ise 28 olur.\n- Her mesajda önce türü anlamak gerekir. Bu programda ad kontrolü, mesajın türünü anlamanın basit bir yoludur.\n- Kart 1'in sıcaklık kaydırıcısı Kart 1'e, Kart 2'nin kaydırıcısı Kart 2'ye aittir. Hangi kartı seçtiğini sağ paneldeki **Kart 1 / Kart 2** düğmelerinden görürsün.\n\n### Dene\n1. **alınan [yazı]** bloğunu ad = değer mesajında da dene. Değeri yazı olarak verdiğini görürsün.\n2. Radyo bölümünden elle ad = değer mesajı yolla: tür **ad = değer**, ad **sicak**, mesaj **35**. Kart 2'de 35 görünmeli.\n3. Yeni bir mesaj ekle: **düğme [A+B] [basılınca]** **radyoyla [isik] = [ışık seviyesi] gönder**. Alan kart adı **isik** ise çubuk grafik göstersin. (Işık 0-255, çubuk grafiğin üst sınırını **255** yap.)\n4. 32 karakterden uzun bir yazı yolla. Alan kartta ne kadarı görünüyor?\n\n### Sık yapılan hatalar\n- **Adı farklı yazmak.** Gönderende **sicak**, alanda **sıcak** yazarsan karşılaştırma eşit çıkmaz.\n- **Değeri yazı sanmak.** **alınan [değer]** bir sayıdır. Hesap yapmak için uygundur.\n- **Ad 12 karakteri geçerse kesilir.** Uzun ad seçersen alan taraftaki karşılaştırma tutmaz.",
          "question": "Bir sayı yerine \"ad = değer\" çifti göndermek nerede işini kolaylaştırır? Sıcaklık, ışık ve ses gibi üç ölçümü aynı anda yollamak istersen mesajları nasıl düzenlersin?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Radyoyla gönderilebilen üç mesaj türünü: sayı, yazı ve **ad = değer** çifti\n- Her tür için doğru alma bloğunu seçmeyi\n- Yazı ve adın uzunluk sınırlarını\n- Mesajın türünü anlamak için ad kontrolünü kullanmayı\n\n### Önceden bilmen gerekenler\n- Radyo grubu, mesaj gönderme ve alma (Ders 21)\n- Ekranda sayı ve yazı göstermek (Ders 1 ve Ders 7)\n- Sıcaklık sensörü (Ders 12)\n\n### Neden tek tür yetmez?\nBir sayı çoğu zaman yeter: \"1 numaralı komut\". Ama \"sıcaklık 28\" demek istersen bir sayının neyi ölçtüğünü de söylemelisin. Radyo bu yüzden üç tür mesaj taşır:\n\n| Tür | Gönderen | Alan |\n|---|---|---|\n| sayı | radyoyla sayı gönder | alınan [sayı] |\n| yazı | radyoyla yazı gönder | alınan [yazı] |\n| ad = değer | radyoyla [ad] = [değer] gönder | alınan [ad] ve alınan [değer] |\n\n### Ad = değer çifti\nÇift bir etiket ve bir sayıdan oluşur: ad \"sicak\", değer 28. Alan taraf adı okuyarak mesajın ne hakkında olduğunu anlar. Aynı anda üç ölçüm yollamak istersen üç farklı ad kullanırsın (sicak, isik, ses) ve alan taraf adına bakıp değeri doğru yere koyar.\n\n### Sınırlar\nBir yazı en çok **32 karakter**, bir ad en çok **12 karakter** olabilir. Fazlası gönderilirken sessizce **kesilir**. Örneğin 40 harflik bir yazının alan kartta yalnızca ilk 32 harfi bulunur. Ad karşılaştırırken de dikkat et: ad 12 karakterden uzunsa kesilmiş hâli gider ve alan taraftaki tam ad ile eşleşmez. Adı harfi harfine aynı yazmalısın; \"sicak\" ile \"sıcak\" farklı adlardır.\n\n### Mesajın türünü anlamak\nAlan taraf gelen mesajın hangi türden olduğunu doğrudan sormaz; ad kontrolüyle öğrenir. Yazı ve sayı mesajlarında **alınan [ad]** boştur. Bu yüzden \"alınan ad = sicak mı?\" sorusu yalnız ad = değer mesajında doğru çıkar, öbürlerinde **değilse** kolu çalışır. Bu küçük kalıp, birkaç farklı mesajı tek başlıkta ayırmanın en basit yoludur.\n\nGelen değer bir sayıdır; üzerinde hesap yapabilir, eşikle karşılaştırabilirsin. Yazı ise ekranda kayarak gösterilir.\n\n### Sinyal gücü\n**sinyal gücü** bloğu mesajın ne kadar güçlü geldiğini verir. Sanal radyoda uzaklık olmadığı için değeri hep 200'dür. Gerçek radyolarda uzaklaştıkça düşer.\n\n### Özet\nRadyo sayı, yazı ve ad = değer mesajı taşır. Yazı en çok 32, ad en çok 12 karakterdir; fazlası kesilir. Adı gönderen ve alan taraf aynı yazmalıdır. Alan taraf **alınan [ad]** ile mesajın türünü ayırt eder ve **alınan [değer]** ile sayıyı kullanır. Sanal radyoda sinyal gücü hep 200'dür.",
          "concepts": [
            {
              "term": "Sayı, yazı, ad = değer",
              "definition": "Radyonun taşıyabildiği üç mesaj türü.",
              "example": "Komut için sayı, selam için yazı, \"sicak = 28\" gibi ölçüm için ad = değer çifti kullanılır.",
              "pitfall": "Her şeyi sayı olarak yollamaya çalışmak; neyin ölçüldüğünü alan taraf anlayamaz."
            },
            {
              "term": "Ad = değer çifti",
              "definition": "Bir etiket (ad) ile bir sayıdan (değer) oluşan mesaj.",
              "example": "radyoyla [sicak] = [28] gönder; alan taraf alınan ad ile alınan değeri okur.",
              "pitfall": "Adı iki tarafta farklı yazmak; \"sicak\" ile \"sıcak\" eşleşmez."
            },
            {
              "term": "Uzunluk sınırları",
              "definition": "Yazı en çok 32 karakter, ad en çok 12 karakter olabilir; fazlası kesilir.",
              "example": "40 harfli bir yazının alan kartta yalnız ilk 32 harfi bulunur.",
              "pitfall": "Uzun ad seçmek; kesilen ad alan taraftaki tam adla eşleşmez."
            },
            {
              "term": "alınan [ad] kontrolü",
              "definition": "Gelen mesajın ad = değer mi olduğunu anlamanın basit yolu. Sayı ve yazı mesajlarında ad boştur.",
              "example": "eğer alınan ad = sicak ise değeri göster, değilse yazıyı göster.",
              "pitfall": "Her mesajda aynı bloğu okumak; mesajın türüne uygun bloğu seçmek gerekir."
            },
            {
              "term": "sinyal gücü",
              "definition": "Mesajın ne kadar güçlü geldiğini veren blok. Sanal radyoda hep 200'dür.",
              "example": "Gerçek radyoda kartlar birbirinden uzaklaştıkça değer düşer.",
              "pitfall": "Sanal portalda sinyal gücünün değişeceğini beklemek; uzaklık yoktur."
            }
          ],
          "quiz": [
            {
              "id": "m10h5d22-q1",
              "kind": "mcq",
              "prompt": "Bir kart sıcaklığı, ışığı ve ses seviyesini aynı anda öteki karta yollamak istiyor. Hangisi en uygun yöntemdir?",
              "options": [
                "Üç sayıyı peş peşe düz sayı olarak yollamak",
                "Hepsini tek yazıya yazmak",
                "Her ölçüm için ayrı ad kullanıp ad = değer mesajı yollamak",
                "Üç farklı grup kullanmak"
              ],
              "answer": 2,
              "explanation": "Üç ölçümü ayırt etmek için her birine ayrı bir ad verilir (sicak, isik, ses) ve ad = değer mesajı kullanılır; alan taraf adına bakarak değeri doğru yere koyar. Üç düz sayı gönderirsen hangisinin neyi ölçtüğü karışır.",
              "skills": [
                "mk-radio-types"
              ]
            },
            {
              "id": "m10h5d22-q2",
              "kind": "numeric",
              "prompt": "Bir kart radyoyla 40 karakterlik bir yazı gönderiyor. Alan kartta yazının kaç karakteri bulunur?",
              "answer": 32,
              "tolerance": 0,
              "unit": "karakter",
              "explanation": "Yazı en çok 32 karakter olabilir; fazlası gönderilirken kesilir, hata vermez. 40 − 32 = 8 karakter kaybolur.",
              "skills": [
                "mk-radio-types"
              ]
            },
            {
              "id": "m10h5d22-q3",
              "kind": "predict-output",
              "prompt": "Alan kartın programı aşağıdadır. Gönderen kart radyoyla [isik] = [90] gönderiyor. Alan kartta ne olur?\n\n```\nradyo mesajı alınınca:\n    eğer alınan ad = sicak ise\n        sayıyı göster alınan değer\n    değilse\n        yazıyı göster alınan yazı\n```",
              "options": [
                "ise kolu çalışır ve 90 görünür",
                "değilse kolu çalışır, çünkü ad isik ve sicak değil",
                "Program hata verir",
                "Hiçbir şey olmaz"
              ],
              "answer": 1,
              "explanation": "Gelen mesajın adı isik, kontrol edilen ad ise sicak; eşit değiller, bu yüzden değilse kolu çalışır. Mesaj ad = değer türünde olsa bile ad uyuşmazsa ise kolu atlanır. Hata çıkmaz, hiçbir şey de olmaz yanıtı yanlıştır: değilse kolu bir şey gösterir.",
              "skills": [
                "mk-radio-types",
                "mk-conditions"
              ]
            },
            {
              "id": "m10h5d22-q4",
              "kind": "find-bug",
              "prompt": "Gönderen \"sıcaklık\" ölçümünü yolluyor ama alan kart ekranda hep yazıyı gösteriyor (ise kolu hiç çalışmıyor). Hatayı bul.\n\n```\ngönderen:  radyoyla [sıcak] = [sıcaklık] gönder\nalan:      eğer alınan ad = sicak ise ...\n```",
              "options": [
                "Ad iki tarafta farklı yazılmış: sıcak ile sicak aynı değil",
                "Gönderen blok yanlış kategoriden alınmış",
                "Değer bir sayı olmalı, sıcaklık sayı değil",
                "Radyo grubu 255'i geçiyor"
              ],
              "answer": 0,
              "explanation": "Gönderen \"sıcak\" (ı harfli), alan \"sicak\" (i harfli) yazıyor. Adlar harfi harfine aynı olmalıdır; bir harf farkı eşitliği bozar. Gruplar ve değer bloğu sorunun nedeni değildir.",
              "skills": [
                "mk-radio-types",
                "prog-debug"
              ]
            },
            {
              "id": "m10h5d22-q5",
              "kind": "mcq",
              "prompt": "Gönderen radyoyla [sicaklik_olcum] = [25] gönderiyor. Alan taraf \"alınan ad = sicaklik_olcum\" diye karşılaştırıyor. Sonuç nedir?",
              "options": [
                "Eşit çıkar, çünkü ad aynıdır",
                "Hata mesajı gösterilir",
                "Eşit çıkar ama değer 0 olur",
                "Eşit çıkmaz, çünkü ad 12 karaktere kesilir"
              ],
              "answer": 3,
              "explanation": "sicaklik_olcum 14 karakterdir, ad sınırı ise 12. Gönderilirken \"sicaklik_olc\" olarak kesilir. Kesilmiş ad, alan taraftaki tam adla eşleşmediği için karşılaştırma yanlış çıkar ve hata mesajı verilmez.",
              "skills": [
                "mk-radio-types",
                "prog-debug"
              ]
            }
          ]
        },
        {
          "title": "Gizli mesaj",
          "durationMin": 22,
          "problem": "Eski Roma'da Jül Sezar'ın gizli mektuplarında harfleri kaydırdığı anlatılır: her harfin yerine alfabede birkaç sıra sonraki harf yazılır. Mesajı yakalayan kişi anlamsız harfler görür; ama kaydırma sayısını bilen arkadaşı mesajı kolayca çözer. Bu derste aynı fikri sayılarla yapacaksın: göndermeden önce sayıya bir **anahtar** eklenecek, alan kart bu anahtarı çıkaracak.",
          "contentMd": "### Şifreleme ve anahtar\n- **Düz mesaj**: göndermek istediğin gerçek bilgi (örneğin rakam 3).\n- **Anahtar**: iki tarafın da bildiği gizli sayı (örneğin 7).\n- **Şifreli mesaj**: düz mesaj + anahtar = 3 + 7 = 10. Radyoyla bu 10 gider.\n- **Çözme**: alan taraf 10 − 7 = 3 hesaplar ve gerçek rakamı bulur.\n\nBu çok basit bir şifredir ve gerçek hayatta kolayca kırılır. Ama şifrelemenin temel fikrini öğrenmek için çok iyidir: **bilgi yolda değişir, doğru anahtarı bilen eski haline getirir.**\n\n### Yeni bloklar\n- **Matematik** kategorisinde toplama ve çıkarma yapan aritmetik blok: iki sayı kutusu ve ortada bir işaret var. İşareti listeden **+** ya da **−** seç.\n- **Değişken** kategorisinde **[gizli] değerine [1] ekle** bloğu.\n\n### Adım adım\nEditörde **başlangıçta**, iki düğme ve **radyo mesajı alınınca** hazır.\n\n1. **Değişken** kategorisinde iki değişken oluştur: **gizli** ve **anahtar**.\n2. **başlangıçta** içine sırayla: **radyo grubunu [1] yap**, **gizli değerini [0] yap**, **anahtar değerini [7] yap**.\n3. **düğme [A] [basılınca]** içine **gizli değerine [1] ekle** ve **sayıyı göster [gizli]** koy. (Gösterilecek sayı olarak **gizli** değişkenini tak.)\n4. **düğme [B] [basılınca]** içine **radyoyla sayı gönder** koy. Sayı yerine toplama bloğunu tak: **gizli** **+** **anahtar**.\n5. **radyo mesajı alınınca** içine **sayıyı göster** koy. Sayı yerine çıkarma bloğunu tak: **alınan [sayı]** **−** **anahtar**.\n6. ▶ **Çalıştır**. Kart 1'de **A**'ya üç kez bas (ekranda 1, 2, 3 görünür). Sonra **B**'ye bas.\n\n### Beklenen sonuç\nKart 1 radyoyla 10 gönderir. Radyo bölümünde Kart 2'nin **Son alınan:** kutusu **10** gösterir. Ama Kart 2'nin ekranında **3** görünür: anahtar çıkarılmış, gerçek rakam bulunmuş. Dört hedefin hepsinde ✓ olmalı.\n\n### Nasıl çalışıyor?\n- Yolda giden sayı 10'dur. Mesajı duyan biri 3'ü bilemez; anahtarı (7) bilmesi gerekir.\n- İki kart aynı programı çalıştırdığı için ikisinin de anahtarı 7'dir. Yani aynı anahtarı paylaşıyorlar.\n- Anahtar bir değişkende saklandığı için yalnız tek yerde değiştirirsin; hem şifreleme hem çözme kendiliğinden uyar.\n\n### Dene\n1. Radyo bölümünden Kart 2'ye elle **sayı** mesajı olarak **10** yolla. Kart 2'de 3 görürsün.\n2. Şimdi elle **5** yolla. Kart 2'nin ekranında ne görünüyor? (5 − 7 = −2.) Bu, anahtarı bilmeyenin yanlış sonuç alması gibidir.\n3. Anahtarı **başlangıçta** içinde 7 yerine 12 yap. Çözülen rakam değişti mi? Neden değişmedi?\n4. Düşün: Anahtar her seferinde rastgele olsaydı alan kart onu nasıl bilirdi? Anahtarı da radyoyla göndermek güvenli olur muydu?\n\n### Sık yapılan hatalar\n- **Anahtarı unutmak.** Alan kartta anahtar değişkenini **başlangıçta** ayarlamadıysan değişken sıfır kalır; çözme işe yaramaz.\n- **Toplama yerine çıkarma koymak** (ya da tersini). Gönderen toplarsa alan çıkarmalı.\n- **Gösterilecek sayıyı yanlış yere koymak.** **sayıyı göster** içinde çıkarma bloğu olmalı, **alınan [sayı]** doğrudan kalmamalı.",
          "question": "Bu şifreyi birisi yolda yakalasa 7'yi tahmin edebilir mi? Kaç denemede bulur? Daha zor bir şifre yapmak için ne eklerdin?",
          "explainerMd": "### Bu derste öğreneceklerin\n- **Şifreleme**, **anahtar**, düz mesaj ve şifreli mesaj kavramlarını\n- Toplama ve çıkarmayla basit bir şifre kurmayı\n- Değişkende saklanan anahtarın iki tarafı nasıl uyumlu tuttuğunu\n- Bu şifrenin neden kolay kırıldığını\n\n### Önceden bilmen gerekenler\n- Değişken oluşturmak ve değerini değiştirmek (Ders 7)\n- Radyoyla sayı göndermek ve almak (Ders 21)\n\n### Bilgi yolda değişir\nRadyo mesajını aynı gruptaki herkes alabilir. Bilgiyi başkaları anlamasın istersen göndermeden önce karıştırırsın. Bu işe **şifreleme** denir. Elinde üç şey olur:\n\n- **Düz mesaj:** gerçek bilgi, örneğin rakam 3.\n- **Anahtar:** iki tarafın da bildiği gizli sayı, örneğin 7.\n- **Şifreli mesaj:** yolda giden sayı.\n\n### Toplayarak şifrelemek\nEn basit yöntem anahtarı toplamaktır:\n\n```\nşifreli = düz + anahtar      3 + 7 = 10\ndüz     = şifreli - anahtar  10 - 7 = 3\n```\n\nGönderen taraf 10'u yollar. Yolda dinleyen biri 10'u görür ama gerçek rakamın 3 olduğunu bilemez. Alan taraf anahtarı bildiği için 7'yi çıkarır ve 3'e ulaşır. Toplama ile çıkarma birbirinin tersidir; bu yüzden işlem geri alınabilir.\n\n### Anahtar neden değişkende?\nAnahtarı hem gönderen hem alan blokta ayrı ayrı yazarsan birini değiştirip öbürünü unutabilirsin. Bunun yerine **anahtar** adlı bir değişkene bir kez yazarsın (**başlangıçta** içinde) ve her iki işlem de onu kullanır. Değeri tek yerde değiştirirsin; iki taraf uyumlu kalır. İki kart aynı programı çalıştırdığı için iki kartın anahtarı da aynı olur.\n\n### Yanlış anahtar, yanlış sonuç\nAnahtarı bilmeyen biri 10'u alıp aynı çıkarmayı yapsa bile doğru sonucu bulamaz. Örneğin elinde anahtar yoksa (değişken 0 kalmışsa) 10 − 0 = 10 görür. Anahtar 5 sanırsa 10 − 5 = 5 bulur. Ama sonuç yanlıştır ve hata mesajı da yoktur. Anahtarı **başlangıçta** ayarlamayı unutmak aynı etkiyi verir.\n\n### Bu şifre güçlü mü?\nHayır. Anahtar küçük bir sayıysa dinleyen kişi 1, 2, 3 ... diye deneyerek kolayca bulur. Gerçek şifreler çok büyük anahtarlar ve çok karmaşık işlemler kullanır. Burada amaç güvenlik değil, temel fikri görmektir: bilgi yolda değişir, doğru anahtarı bilen eski hâline getirir. Ayrıca anahtarı radyoyla göndermek fikri bozar, çünkü dinleyen anahtarı da yakalar.\n\n### Özet\nŞifrelemede düz mesaj anahtarla karıştırılır ve şifreli mesaj gönderilir. Toplayarak şifrelediysen alan taraf çıkararak çözer. Anahtar bir değişkende tutulursa iki taraf uyumlu kalır. Yanlış ya da eksik anahtar sessizce yanlış sonuç verir. Bu şifre küçük bir sayıyla denenerek kırılabilir.",
          "concepts": [
            {
              "term": "Şifreleme",
              "definition": "Bilgiyi göndermeden önce başkaları anlamasın diye karıştırmak.",
              "example": "3 rakamı anahtar 7 ile 10'a çevrilip yollanır.",
              "pitfall": "Şifrelemeyi gerçek güvenlik sanmak; basit toplama şifresi kolay kırılır."
            },
            {
              "term": "Anahtar",
              "definition": "İki tarafın da bildiği gizli sayı; şifrelemede ve çözmede kullanılır.",
              "example": "Anahtar 7 ise gönderen +7 yapar, alan −7 yapar.",
              "pitfall": "Alan tarafta anahtarı ayarlamayı unutmak: değişken 0 kalır ve çözme yanlış çıkar."
            },
            {
              "term": "Düz mesaj ve şifreli mesaj",
              "definition": "Düz mesaj gerçek bilgidir; şifreli mesaj yolda giden, anahtarla değiştirilmiş sayıdır.",
              "example": "Düz 3, anahtar 7 ise şifreli mesaj 10'dur.",
              "pitfall": "Radyo bölümünde görünen sayıyı gerçek bilgi sanmak; o şifrelidir."
            },
            {
              "term": "Ters işlem",
              "definition": "Toplamanın tersi çıkarmadır; bir işlemi geri alan işlem.",
              "example": "Gönderen toplar (3 + 7 = 10), alan çıkarır (10 − 7 = 3).",
              "pitfall": "İki tarafta da aynı işlemi kullanmak; ikisi de toplarsa sonuç 17 çıkar."
            },
            {
              "term": "Değişkenle anahtar",
              "definition": "Anahtarı bir değişkende tutmak, değeri tek yerde değiştirmeyi sağlar.",
              "example": "başlangıçta anahtar değerini 7 yap; hem gönderme hem alma anahtarı kullanır.",
              "pitfall": "Anahtarı iki yerde elle yazmak; birini değiştirip öbürünü unutabilirsin."
            }
          ],
          "quiz": [
            {
              "id": "m10h5d23-q1",
              "kind": "numeric",
              "prompt": "Düz mesaj 5, anahtar 12. Gönderen toplayarak şifreliyor. Radyoyla hangi sayı gider?",
              "answer": 17,
              "tolerance": 0,
              "explanation": "Şifreli mesaj = düz mesaj + anahtar = 5 + 12 = 17. Alan taraf 17 − 12 = 5 ile gerçek rakamı bulur.",
              "skills": [
                "mk-cipher",
                "mk-variables"
              ]
            },
            {
              "id": "m10h5d23-q2",
              "kind": "numeric",
              "prompt": "Gönderen anahtar 12 ile 5 rakamını şifreleyip 17 yolladı. Alan kart anahtarı yanlışlıkla 7 sanıyor. Alan kart ekranda hangi sayıyı gösterir?",
              "answer": 10,
              "tolerance": 0,
              "explanation": "Alan taraf 17 − 7 = 10 hesaplar. Doğru anahtar 12 olsaydı 5 bulurdu. Yanlış anahtar hata mesajı vermez, sessizce yanlış sonuç üretir.",
              "skills": [
                "mk-cipher",
                "prog-debug"
              ]
            },
            {
              "id": "m10h5d23-q3",
              "kind": "predict-output",
              "prompt": "İki kart da bu programı çalıştırıyor (grup 1). Kart 1'de A'ya 4 kez, sonra B'ye 1 kez basılıyor. Radyo bölümündeki \"Son alınan\" kutusunda ve Kart 2'nin ekranında ne görünür?\n\n```\nbaşlangıçta:\n    radyo grubunu 1 yap\n    gizli değerini 0 yap\n    anahtar değerini 7 yap\n\ndüğme A basılınca:\n    gizli değerine 1 ekle\n    sayıyı göster gizli\n\ndüğme B basılınca:\n    radyoyla sayı gönder (gizli + anahtar)\n\nradyo mesajı alınınca:\n    sayıyı göster (alınan sayı − anahtar)\n```",
              "options": [
                "Son alınan 4, ekran 4",
                "Son alınan 11, ekran 11",
                "Son alınan 4, ekran 11",
                "Son alınan 11, ekran 4"
              ],
              "answer": 3,
              "explanation": "A dört kez basılınca gizli = 4. B ile 4 + 7 = 11 gönderilir; kutu 11 gösterir. Kart 2 anahtarı da 7 olduğundan 11 − 7 = 4 gösterir. Yani yolda 11, ekranda 4 vardır.",
              "skills": [
                "mk-cipher",
                "mk-variables"
              ]
            },
            {
              "id": "m10h5d23-q4",
              "kind": "find-bug",
              "prompt": "Gönderen \"gizli + anahtar\" yolluyor. Alan kart gerçek rakamı bulmak istiyor ama sonuç hep fazla çıkıyor (örneğin 3 yerine 17). Hatayı bul.\n\n```\nradyo mesajı alınınca:\n    sayıyı göster (alınan sayı + anahtar)\n```",
              "options": [
                "Anahtar başlangıçta ayarlanmamış",
                "Alan taraf çıkarmak yerine topluyor",
                "Radyo grubu eksik",
                "sayıyı göster yerine yazıyı göster bloğu gerekir"
              ],
              "answer": 1,
              "explanation": "Gönderen topladığına göre alan çıkarmalı. Alan da toplarsa 10 + 7 = 17 çıkar. Anahtarın başlangıçta ayarlanması ya da grup bloğu bu sonucu üretmez.",
              "skills": [
                "mk-cipher",
                "prog-debug"
              ]
            },
            {
              "id": "m10h5d23-q5",
              "kind": "mcq",
              "prompt": "Bu toplama şifresi neden güçlü bir şifre değildir?",
              "options": [
                "Radyo mesajları çok yavaş gider",
                "Toplama işlemi geri alınamaz",
                "Anahtar küçük bir sayı olduğu için denenerek bulunabilir",
                "Alan kart mesajı alamaz"
              ],
              "answer": 2,
              "explanation": "Anahtar küçük bir sayıdır; yolu dinleyen biri 1, 2, 3 ... diye deneyerek kısa sürede bulur. Toplama geri alınabilir bir işlemdir, bu şifrenin çalışması için gerekli olan özellik budur; sorun değildir. Radyonun yavaşlığı da güvenlikle ilgisizdir.",
              "skills": [
                "mk-cipher"
              ]
            }
          ]
        },
        {
          "title": "İki kartla sohbet",
          "durationMin": 22,
          "problem": "Mesajlaşırken emoji yollarsın: kalp, gülen yüz, üzgün yüz. Emoji aslında küçük bir resimdir ama telefon onu bir sayı olarak yollar ve karşı taraf o sayıyı yine resme çevirir. İki Mikro Kart arasında aynı numarayı sen de yapabilirsin. Bu derste iki kart, birbirine kalp ve yüz simgeleri yollayan küçük bir sohbet uygulaması olacak.",
          "contentMd": "### Fikir\nHer simgeye bir sayı verelim ve bu sayıyı radyoyla yollayalım:\n\n| Sayı | Simge | Hangi tuş yolluyor? |\n|---|---|---|\n| 1 | kalp | A |\n| 2 | mutlu yüz | B |\n| 3 | üzgün yüz | A+B |\n\nAlan kart sayıyı görünce karşılık gelen simgeyi gösterir ve küçük bir ses çalar. İki kart da aynı programı çalıştırdığı için her iki yön de çalışır.\n\n### Yeni fikir: değişkenle okumak\n**alınan [sayı]** bloğu mesaj geldiğinde okunur. Bu sayıyı birden çok yerde karşılaştıracaksan önce bir değişkene (**mesaj**) koymak daha düzgündür. Böylece her karşılaştırmada **alınan** bloğunu tekrar tekrar bulman gerekmez.\n\nÜç ihtimali kontrol etmek için **eğer ... ise ... değilse** bloklarını iç içe koyacaksın: \"sayı 1 mi? Değilse sayı 2 mi? Değilse (o zaman 3)\".\n\n### Adım adım\nEditörde **başlangıçta**, **düğme [A] [basılınca]**, **düğme [B] [basılınca]**, **düğme [A+B] [basılınca]** ve **radyo mesajı alınınca** hazır.\n\n1. **başlangıçta** içine **radyo grubunu [1] yap** koy.\n2. **düğme [A] [basılınca]** içine **radyoyla sayı gönder [1]**, **düğme [B] [basılınca]** içine **radyoyla sayı gönder [2]**, **düğme [A+B] [basılınca]** içine **radyoyla sayı gönder [3]** koy.\n3. **Değişken** kategorisinde **mesaj** adlı bir değişken oluştur.\n4. **radyo mesajı alınınca** içine sırayla:\n   - **mesaj değerini [0] yap**. Sıfır yerine **alınan [sayı]** tak.\n   - **eğer ... ise ... değilse**. Koşul: **mesaj** **=** **1**. **ise**: **simgeyi göster [kalp]**.\n   - **değilse** kolunun içine ikinci bir **eğer ... ise ... değilse** koy. Koşul: **mesaj** **=** **2**. **ise**: **simgeyi göster [mutlu yüz]**. **değilse**: **simgeyi göster [üzgün yüz]**.\n   - **Müzik** kategorisinden **ezgiyi çal [Kuş cıvıltısı]**.\n5. ▶ **Çalıştır**. Kart 1'de **A**'ya, sonra Kart 2'de **B**'ye, sonra yine Kart 1'de **A+B**'ye bas.\n\n### Beklenen sonuç\nKart 1'in **A**'sı Kart 2'de kalp gösterir. Kart 2'nin **B**'si Kart 1'de mutlu yüz gösterir. Kart 1'in **A+B**'si Kart 2'de üzgün yüz gösterir. Her mesajdan sonra kuş cıvıltısı çalar (yaklaşık 1,25 saniye). Yedi hedefin hepsinde ✓ olmalı.\n\n### Nasıl çalışıyor?\n- Gönderen mesajı alamaz; mesaj yalnız gruptaki öteki karta gider.\n- İç içe **eğer** zinciri sırayla bakar. İlki tutarsa diğerlerine hiç bakılmaz.\n- **ezgiyi çal** bloğu bitene kadar bekler. O sırada başka mesaj gelirse sıraya girer; aynı başlık için en çok 3 mesaj sırada bekler.\n\n### Dene\n1. Dördüncü bir simge ekle: **düğme [A] [uzun basılınca]** başlığı **4** göndersin, alan kart **güneş** göstersin. (**eğer** zincirine bir kol daha eklemen gerekir.)\n2. Kuş cıvıltısı yerine her simge için ayrı bir ezgi seç: kalp için **Neşeli**, üzgün yüz için **Üzgün** ezgisi.\n3. Kendi mesajını da ekranında görmek için gönderen taraf da simgeyi **göstersin**. Hangi başlığın içine koymalısın?\n\n### Sık yapılan hatalar\n- **İkinci eğer'i değilse kolunun dışına koymak.** O zaman \"değilse\" kolunda mutlu yüz görünmez.\n- **Ayrı sayı yerine hep 1 göndermek.** Alan kart hangi tuşa basıldığını anlayamaz.\n- **Mesajı hiç okumamak.** **mesaj** değişkenine **alınan [sayı]** koymazsan değişken sıfır kalır ve hep üzgün yüz görünür.",
          "question": "Sayıları simgelere çevirmek bir tür \"anlaşma\" değil mi? Karşı taraf da senin tablonu bilmeseydi mesajı nasıl anlardı? Bu \"ortak tablo\" fikri gerçek mesajlaşma uygulamalarında nerede karşımıza çıkar?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Sayıları simgelere çeviren ortak bir **tablo** (protokol) kurmayı\n- Üç ya da daha çok seçeneği iç içe **eğer** zinciriyle ayırmayı\n- Gelen mesajı bir değişkene kopyalayıp birden çok yerde kullanmayı\n- Alma başlığının ne kadar mesajı sıraya aldığını\n\n### Önceden bilmen gerekenler\n- Radyoyla sayı göndermek ve almak (Ders 21 ve Ders 22)\n- Değişkenler (Ders 7)\n- Ezgi çalmak (Ders 18)\n\n### Sayılar bir anlaşmadır\nTelefonda gönderdiğin kalp emojisi aslında bir sayıdır; karşı tarafın telefonu o sayıyı yine kalbe çevirir. Bunun çalışması için iki taraf da **aynı tabloyu** bilmelidir. Bizim sohbet tablomuz:\n\n| Sayı | Simge | Gönderen tuş |\n|---|---|---|\n| 1 | kalp | A |\n| 2 | mutlu yüz | B |\n| 3 | üzgün yüz | A+B |\n\nBu tabloya bir **protokol** (haberleşme anlaşması) denir. Tabloyu bir tarafta değiştirip öbüründe değiştirmezsen mesajlar yanlış anlaşılır.\n\n### İç içe eğer zinciri\nÜç seçeneği ayırmak için sorular sırayla sorulur:\n\n```\neğer mesaj = 1 ise\n    kalp göster\ndeğilse\n    eğer mesaj = 2 ise\n        mutlu yüz göster\n    değilse\n        üzgün yüz göster\n```\n\nBirinci koşul tutarsa geri kalan sorulara hiç bakılmaz. İkinci **eğer** mutlaka birinci bloğun **değilse** kolunun içinde olmalıdır; dışına koyarsan ayrı bir soru olur ve sıra bozulur. Son **değilse** kolu \"geri kalan her şey\" demektir: burada 1 ve 2 dışındaki sayıların hepsi üzgün yüz gösterir.\n\n### Mesajı değişkene koymak\nAynı sayıyı birkaç yerde karşılaştıracaksan önce **mesaj** adlı bir değişkene koyarsın. Programın başında \"mesaj değerini alınan sayı yap\" dersin, sonra koşullarda **mesaj** kullanırsın. Böylece **alınan** bloğunu tekrar tekrar bulmazsın. Değişkeni doldurmayı unutursan değeri 0 kalır; 1 de 2 de tutmaz ve hep son kol çalışır.\n\n### Mesajlar sıraya girer\n**ezgiyi çal** bloğu ezgi bitene kadar bekler. Kuş cıvıltısı 1,25 saniye sürer. Bu sırada yeni mesaj gelirse alma başlığı meşguldür; mesaj sıraya girer. Aynı başlık için en çok **3 mesaj** sırada bekleyebilir, fazlası atılır. Hızlı mesajlaşırken bazı mesajların kaybolmasının sebebi budur.\n\n### Özet\nSohbet uygulaması bir sayı tablosuna dayanır; iki taraf da aynı tabloyu kullanmalıdır. Üç seçenek iç içe **eğer** zinciriyle ayrılır ve ikinci **eğer** birincinin **değilse** kolundadır. Gelen mesaj bir değişkene alınırsa birçok yerde kullanılır. Uzun süren bir alma işi sürerken en çok 3 yeni mesaj sırada bekler.",
          "concepts": [
            {
              "term": "Protokol (ortak tablo)",
              "definition": "İki tarafın aynı kabul ettiği kural tablosu: hangi sayı ne anlama geliyor.",
              "example": "1 = kalp, 2 = mutlu yüz, 3 = üzgün yüz tablosu.",
              "pitfall": "Tabloyu tek tarafta değiştirmek; öteki taraf mesajı yanlış anlar."
            },
            {
              "term": "İç içe eğer zinciri",
              "definition": "Üç ya da daha çok seçeneği sırayla soran eğer blokları; her biri öncekinin değilse kolundadır.",
              "example": "Mesaj 1 mi, değilse 2 mi, değilse (o zaman 3) diye sorulur.",
              "pitfall": "İkinci eğer'i değilse kolunun dışına koymak; sıra bozulur."
            },
            {
              "term": "Mesajı değişkene almak",
              "definition": "Gelen sayıyı bir değişkene kopyalayıp birçok yerde onu kullanmak.",
              "example": "mesaj değerini alınan sayı yap; sonra mesaj = 1, mesaj = 2 karşılaştırmaları.",
              "pitfall": "Değişkeni doldurmamak: değeri 0 kalır ve hep son kol çalışır."
            },
            {
              "term": "Alma sırası",
              "definition": "Alma başlığı meşgulken gelen mesajlar sıraya girer; en çok 3 mesaj bekler.",
              "example": "1,25 saniyelik ezgi çalarken gelen ilk 3 mesaj sırada bekler, fazlası kaybolur.",
              "pitfall": "Çok hızlı mesajlaşırken tüm mesajların işleneceğini sanmak."
            },
            {
              "term": "ezgiyi çal bloğu",
              "definition": "Ezgi bitene kadar bekleyen blok; başlığı bu sürede meşgul eder.",
              "example": "Kuş cıvıltısı 120 vuruş/dakikada 1250 ms sürer.",
              "pitfall": "Ezginin arka planda çalıp programı bekletmediğini sanmak."
            }
          ],
          "quiz": [
            {
              "id": "m10h5d24-q1",
              "kind": "predict-output",
              "prompt": "Alan kartın programı aşağıdadır. Kart 1 radyoyla 1 gönderiyor. Kart 2 ekranında ne görünür?\n\n```\nradyo mesajı alınınca:\n    mesaj değerini 0 yap\n    eğer mesaj = 1 ise\n        simgeyi göster kalp\n    değilse\n        eğer mesaj = 2 ise\n            simgeyi göster mutlu yüz\n        değilse\n            simgeyi göster üzgün yüz\n```",
              "options": [
                "kalp",
                "mutlu yüz",
                "üzgün yüz",
                "Hiçbir şey"
              ],
              "answer": 2,
              "explanation": "mesaj değişkenine alınan sayı yerine sabit 0 konmuş. Bu yüzden mesaj hep 0'dır; 1'e de 2'ye de eşit olmaz ve son değilse kolu çalışarak üzgün yüzü gösterir. Gelen sayı değişkene hiç kopyalanmadı.",
              "skills": [
                "mk-conditions",
                "mk-variables"
              ]
            },
            {
              "id": "m10h5d24-q2",
              "kind": "numeric",
              "prompt": "Alma başlığı ezgi çalarak meşgul. Ezgi bitmeden 5 mesaj daha geliyor. Aynı başlık için en çok kaç mesaj sırada bekleyebilir?",
              "answer": 3,
              "tolerance": 0,
              "unit": "mesaj",
              "explanation": "Sıra en çok 3 mesaj alır; ilk üç mesaj sıraya girer, geri kalan ikisi atılır.",
              "skills": [
                "mk-message-flow"
              ]
            },
            {
              "id": "m10h5d24-q3",
              "kind": "mcq",
              "prompt": "Kart 1 sohbet tablosuna göre 2 gönderince mutlu yüz bekliyor, ama Kart 2'nin programında 2 numaralı kolda üzgün yüz var. B'ye basan kullanıcının mesajı alan kartta ne olur?",
              "options": [
                "Radyo mesajı hiç ulaşmaz",
                "Mesaj ulaşır ama beklenenden farklı simge gösterilir",
                "Kart hata mesajı verir",
                "Her iki kart da aynı simgeyi gösterir ve bu beklenendir"
              ],
              "answer": 1,
              "explanation": "İki taraf aynı tabloyu kullanmıyor. Gönderen 2'yi mutlu yüz sanır, alan üzgün yüz gösterir; mesajın anlamı yolda değil iki tablonun farkında bozulur. Radyo kopmuş değildir, mesaj doğru ulaşmıştır.",
              "skills": [
                "mk-protocol"
              ]
            },
            {
              "id": "m10h5d24-q4",
              "kind": "find-bug",
              "prompt": "Her düğmeye basınca Kart 2 hep kalp gösteriyor. Alan kartın eğer zinciri doğru. Hatayı bul.\n\n```\ndüğme A basılınca:    radyoyla sayı gönder 1\ndüğme B basılınca:    radyoyla sayı gönder 1\ndüğme A+B basılınca:  radyoyla sayı gönder 1\n```",
              "options": [
                "B ve A+B de 1 yolluyor; tablodaki 2 ve 3 olmalı",
                "A+B bloğu yanlış başlığın içinde",
                "Alan taraftaki eğer zinciri kısa",
                "Radyo grubu 255 olmalı"
              ],
              "answer": 0,
              "explanation": "Üç düğme de 1 yolluyor. Tabloya göre B için 2, A+B için 3 gönderilmeliydi. Alan taraf hangi tuşa basıldığını yalnız sayıdan anlayabilir. Eğer zinciri, grup ya da başlık hatası yoktur.",
              "skills": [
                "mk-protocol",
                "prog-debug"
              ]
            },
            {
              "id": "m10h5d24-q5",
              "kind": "numeric",
              "prompt": "Kuş cıvıltısı ezgisi 1,25 saniye sürer. Alan kart arka arda 3 mesajı sırayla işleyip her birinde ezgiyi çalarsa toplam kaç saniye çalar?",
              "answer": 3.75,
              "tolerance": 0.01,
              "unit": "saniye",
              "explanation": "Ezgi bloğu bitene kadar bekler, mesajlar sırayla işlenir: 3 × 1,25 = 3,75 saniye.",
              "skills": [
                "mk-message-flow"
              ]
            }
          ]
        },
        {
          "title": "Proje: Uzaktan kumanda",
          "durationMin": 32,
          "problem": "Oyuncak arabanın kumandasını eğdikçe araba yön değiştirir. Kumanda ile araba aslında iki ayrı alet ve aralarındaki tek bağ bir radyo mesajı: \"sola git\", \"sağa git\". Bu projede Kart 1 kumanda, Kart 2 araba olacak. Kumandayı eğdiğinde araba o yöne bir ok gösterecek ve direksiyon servosunu çevirecek.",
          "contentMd": "### Proje: Uzaktan kumanda\nBu haftanın bütün fikirlerini birleştireceksin: radyo grubu, sayı gönderme, alma, değişkenle okuma ve iç içe **eğer** zinciri. Üstüne ivmeölçerle eğim algılama ve servo çıkışı ekleniyor.\n\n**Hedefler:**\n- Kart 1'i sola, sağa, öne ve arkaya yatırınca 1, 2, 3 ve 4 komutları gitsin.\n- Kart 2 komutu alınca ilgili yön okunu göstersin.\n- Sola yatırınca servo 45 dereceye, sağa yatırınca 135 dereceye dönsün.\n- A düğmesi \"dur\" komutunu (0) göndersin ve Kart 2 \"hayır\" simgesini göstersin.\n\n### Komut tablosu\n| Komut sayısı | Kumanda hareketi | Araç ekranı | Servo (P0) |\n|---|---|---|---|\n| 1 | sola yatır | sol ok | 45° |\n| 2 | sağa yatır | sağ ok | 135° |\n| 3 | öne yatır | yukarı ok | 90° |\n| 4 | arkaya yatır | aşağı ok | 90° |\n| 0 | A düğmesi | \"hayır\" simgesi | 90° |\n\n### Yeni bloklar\n- **Giriş** kategorisindeki **kart [sola yatınca]** başlığı, kart yatırıldığında çalışır. Listeden **sağa yatınca**, **öne yatınca** ve **arkaya yatınca** seçilebilir.\n- **LED** kategorisindeki **oku göster [↑ kuzey]** bloğu sekiz yönden birine bir ok çizer. Biz **← batı** (sol), **→ doğu** (sağ), **↑ kuzey** (yukarı), **↓ güney** (aşağı) kullanacağız.\n- **Pinler** kategorisindeki **[P0] servo açısı [90]** bloğu P0 pinine bağlı sanal servoyu 0 ile 180 derece arasında bir açıya çevirir. Kartın yanındaki **Pinler** bölümünde servonun dönmesini görürsün.\n\n### Adım adım\nEditörde **başlangıçta**, dört **kart [sola yatınca]** başlığı, **düğme [A] [basılınca]** ve **radyo mesajı alınınca** hazır.\n\n**Kumanda tarafı**\n1. **başlangıçta** içine **radyo grubunu [1] yap** koy.\n2. **kart [sola yatınca]** içine **radyoyla sayı gönder [1]**; **kart [sağa yatınca]** içine **2**; **kart [öne yatınca]** içine **3**; **kart [arkaya yatınca]** içine **4** koy.\n3. **düğme [A] [basılınca]** içine **radyoyla sayı gönder [0]** koy.\n\n**Araba tarafı**\n4. **Değişken** kategorisinde **komut** değişkenini oluştur.\n5. **radyo mesajı alınınca** içine **komut değerini [0] yap** koy; sıfır yerine **alınan [sayı]** tak.\n6. Altına **eğer ... ise ... değilse** zinciri kur:\n   - **komut = 1** ise: **oku göster [← batı]** ve **[P0] servo açısı [45]**.\n   - değilse **komut = 2** ise: **oku göster [→ doğu]** ve **[P0] servo açısı [135]**.\n   - değilse **komut = 3** ise: **oku göster [↑ kuzey]** ve **[P0] servo açısı [90]**.\n   - değilse **komut = 4** ise: **oku göster [↓ güney]** ve **[P0] servo açısı [90]**.\n   - değilse (yani 0): **simgeyi göster [hayır]** ve **[P0] servo açısı [90]**.\n\n**Deneme**\n7. ▶ **Çalıştır**. Sağ paneldeki **Kart 1** sekmesini seç. **Hareket (ivmeölçer)** bölümündeki **Sola yatır**, **Sağa yatır**, **Öne yatır** ve **Arkaya yatır** düğmelerine sırayla bas. Sonra Kart 1'in **A** düğmesine bas.\n8. **Kart 2** sekmesine geç, **Pinler** bölümünü aç ve servonun açısına bak.\n\n### Beklenen sonuç\nKart 1'i her yatırışında Kart 2'nin ekranında o yönün oku belirir. Sola ve sağa yatırınca Kart 2'nin **P0** servosu 45° ve 135°'ye döner. **A**'ya basınca Kart 2 \"hayır\" simgesini gösterir ve servo ortaya (90°) gelir. Dokuz hedefin hepsinde ✓ olmalı.\n\n### Nasıl çalışıyor?\n- Kart yatınca ivmeölçer yeni bir duruş algılar ve **kart [sola yatınca]** başlığı çalışır. Olay ancak duruş **değişince** çıkar. Aynı yöne iki kez art arda yatırırsan ikinci kez komut gitmez; önce **Yüzü yukarı** ile düzelt.\n- Kart 2 de aynı programı çalıştırdığı için Kart 2'yi yatırırsan Kart 1 de bir araba gibi davranır. İki kart birbirini kumanda eder.\n- Komut sayıları tablodaki sözleşmedir. Gönderen ve alan taraf aynı tabloyu kullanır; tabloyu değiştirirsen ikisini birden değiştir.\n- Sanal portalda gerçek bir motor ya da servo yoktur; **Pinler** bölümündeki sanal servo göstergesi açıyı gösterir.\n\n### Dene\n1. **Yüzü yukarı** durumunda da \"dur\" gitsin: **kart [yüzü yukarı bakınca]** başlığına **radyoyla sayı gönder [0]** koy.\n2. Komutu aldığında kısa bir bip çalsın: **[Do] notasını [1/8] vuruş çal** bloğunu **radyo mesajı alınınca** içine ekle.\n3. Kumandanın eğim açısını da gönder: **Giriş** kategorisindeki **eğim ([yan]) derece** bloğunu **radyoyla [aci] = [...] gönder** ile yolla ve alan kartta servonun açısını buna göre ayarla.\n\n### Sık yapılan hatalar\n- **Kumanda ve araba tablosunu karıştırmak.** Gönderen 1 yollar ama alan 1'i sağ ok sanırsa yanlış yön görürsün.\n- **Aynı yöne tekrar yatırmayı komut sanmak.** Duruş değişmedikçe yeni olay üretilmez.\n- **Başlığı boş bırakmak.** Bir **kart [sola yatınca]** başlığının içi boşsa o yön hiçbir mesaj göndermez.\n- **Servoyu 180'in dışına çevirmeye çalışmak.** Servo açısı 0-180 aralığına çekilir.",
          "question": "Kumanda ile araç arasında tek bir şey akıyor: sayılar. Bu çok basit bir yöntem. Gerçek bir araçta bu yöntem nerelerde yetersiz kalırdı? Mesaj kaybolursa ya da yanlış gelirse araç ne yapmalı?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Bir kumanda ve bir aracı radyoyla bağlayan sistemi planlamayı\n- Kartın yatışını (ivmeölçer olayı) komuta çevirmeyi\n- Gelen komuta göre ok göstermeyi ve servo açısını ayarlamayı\n- Haftanın bütün fikirlerini tek projede birleştirmeyi\n\n### Önceden bilmen gerekenler\n- Radyo grubu, sayı gönderme ve alma (Ders 21)\n- Komut tablosu ve iç içe **eğer** zinciri (Ders 24)\n- Kartı yatırma ve sallama olayları (Ders 11)\n- Ekranda simge göstermek (Ders 3); ok göstermeyi ve servoyu bu derste ilk kez göreceksin\n\n### İki parça, tek mesaj\nUzaktan kumandalı bir aracın iki parçası vardır: **kumanda** ne yapılacağını söyler, **araç** yapar. Aralarında yalnız radyo mesajı akar. İki Mikro Kart da aynı programı çalıştırır, ama biri kumanda, biri araç rolündedir. Programın \"gönder\" yarısı kumandada, \"al\" yarısı araçta işe yarar.\n\n### Önce tablo\nKodu yazmadan önce komutları tabloya yazmak hata yapma ihtimalini azaltır:\n\n| Komut | Kumanda hareketi | Araç ekranı | Servo |\n|---|---|---|---|\n| 1 | sola yatır | sol ok | 45° |\n| 2 | sağa yatır | sağ ok | 135° |\n| 3 | öne yatır | yukarı ok | 90° |\n| 4 | arkaya yatır | aşağı ok | 90° |\n| 0 | A düğmesi | \"hayır\" simgesi | 90° |\n\nServo 90° ortadır. 45° bir yana, 135° öbür yana 45 derece sapar; iki uç arasındaki fark 90 derecedir. Servo açısı 0 ile 180 arasındadır; bu aralığın dışı kırpılır.\n\n### Yatırmak bir olaydır\n**kart [sola yatınca]** başlığı kart yatırıldığında bir kez çalışır. Olay ancak duruş **değiştiğinde** doğar. Kart zaten sola yatıkken tekrar sola yatırmaya çalışırsan yeni olay çıkmaz. Başlığın içini boş bırakırsan o yön hiç mesaj göndermez.\n\n### Araç tarafı\nAraç, gelen sayıyı **komut** değişkenine alır ve komuta göre sırayla sorar: 1 mi, 2 mi, 3 mü, 4 mü, hiçbiri değilse 0 yani \"dur\". Her kolda hem ok gösterir hem servoyu çevirir. Son **değilse** kolu \"geri kalan\" olduğu için 0'ı yakalar; tanımadığı bir sayı gelirse (örneğin 9) da \"dur\" gibi davranır. Bu yararlı bir güvenliktir: bilinmeyen komutta araç durur.\n\n### Gerçek hayata bağlantı\nBurada mesaj kaybolursa ya da yanlış gelirse araç sessizce eski durumunda kalır. Gerçek araçlarda kumandadan sinyal kesilince aracın durması gibi önlemler konur. Senin de kendi projene \"ne olursa durur\" kuralı eklemen iyi bir alışkanlıktır.\n\n### Özet\nKumanda ve araç, komut tablosu üzerinden anlaşır. Kumanda kart yatışını sayıya çevirip radyoyla yollar; araç sayıyı değişkene alır, **eğer** zinciriyle ok gösterir ve servoyu çevirir. Yatış olayı duruş değişince çıkar. Tablo iki tarafta aynı olmalı ve son kol tanınmayan komutta aracı durdurmalıdır.",
          "concepts": [
            {
              "term": "Kumanda ve araç",
              "definition": "Kumanda komut yollar, araç komutu uygular; aralarında yalnız radyo mesajı akar.",
              "example": "Kart 1'i yatırınca Kart 2 ok gösterir ve servo döner.",
              "pitfall": "Kumanda ile araç tablosunu karıştırmak; gönderen 1 yollar, alan 1'i başka anlar."
            },
            {
              "term": "Komut tablosu",
              "definition": "Her komut sayısının hangi harekete, ekrana ve servo açısına karşılık geldiğini yazan plan.",
              "example": "1 = sol ok ve servo 45°, 2 = sağ ok ve servo 135°.",
              "pitfall": "Kodu tablosuz yazmak; iki taraf farklı anlaşmayla yazılır."
            },
            {
              "term": "Duruş olayı",
              "definition": "Kart yatırılınca ivmeölçer yeni bir duruş algılar ve başlık çalışır. Olay duruş değişince doğar.",
              "example": "kart [sola yatınca] başlığı içinde radyoyla sayı gönder 1.",
              "pitfall": "Aynı yöne tekrar yatırmayı yeni komut sanmak; duruş değişmedikçe olay çıkmaz."
            },
            {
              "term": "Servo açısı",
              "definition": "P0 pinindeki servonun 0-180 derece arasındaki konumu. 90 ortadır.",
              "example": "45° bir yana, 135° öbür yana 45 derece sapar.",
              "pitfall": "180'in dışında açı vermek; açı 0-180 aralığına çekilir."
            },
            {
              "term": "Güvenli son kol",
              "definition": "Eğer zincirinin son değilse kolu bilinmeyen komutta da araç durdurur.",
              "example": "Komut 9 gelirse araç \"hayır\" simgesini gösterir ve servo 90° olur.",
              "pitfall": "Son kolu boş bırakmak; tanınmayan komutta araç önceki durumunda kalır."
            }
          ],
          "quiz": [
            {
              "id": "m10h5d25-q1",
              "kind": "numeric",
              "prompt": "Komut tablosuna göre sola yatırınca servo 45°, sağa yatırınca 135° olur. Servo bir uçtan öbür uca kaç derece döner?",
              "answer": 90,
              "tolerance": 0,
              "unit": "derece",
              "explanation": "135 − 45 = 90 derece. Orta nokta 90° olduğundan her iki yan da ortadan 45° uzaktır.",
              "skills": [
                "mk-servo-tilt"
              ]
            },
            {
              "id": "m10h5d25-q2",
              "kind": "predict-output",
              "prompt": "Araç tarafının programı aşağıdadır. Kumandadan komut 9 geliyor (elle gönderildi). Araç ne yapar?\n\n```\nradyo mesajı alınınca:\n    komut değerini alınan sayı yap\n    eğer komut = 1 ise: sol ok, servo 45\n    değilse eğer komut = 2 ise: sağ ok, servo 135\n    değilse eğer komut = 3 ise: yukarı ok, servo 90\n    değilse eğer komut = 4 ise: aşağı ok, servo 90\n    değilse: \"hayır\" simgesi, servo 90\n```",
              "options": [
                "Aşağı ok gösterir, servo 90",
                "Hata verir ve program durur",
                "\"hayır\" simgesi gösterir, servo 90",
                "Hiçbir şey yapmaz, önceki ok kalır"
              ],
              "answer": 2,
              "explanation": "9 hiçbir koşula uymaz, son değilse kolu çalışır: \"hayır\" simgesi ve servo 90°. Bilinmeyen komutta aracın durması istenen bir davranıştır. Hata mesajı çıkmaz.",
              "skills": [
                "mk-protocol",
                "mk-conditions"
              ]
            },
            {
              "id": "m10h5d25-q3",
              "kind": "find-bug",
              "prompt": "Kumanda sağa yatırılınca araç sol ok gösteriyor. Araç tarafı tabloyla uyumlu. Hatayı bul.\n\n```\nkart sola yatınca:  radyoyla sayı gönder 1\nkart sağa yatınca:  radyoyla sayı gönder 1\n```",
              "options": [
                "Araç tarafındaki zincirin sırası yanlış",
                "Sağa yatınca başlığı 2 yerine 1 gönderiyor",
                "Servo açısı 180'i aşıyor",
                "Radyo grupları farklı"
              ],
              "answer": 1,
              "explanation": "Sağa yatınca tablodaki komut 2'dir. Burada 1 gönderildiği için araç sol ok gösterir. Alan taraftaki zincir doğru olduğundan hata gönderen tarafta, yanlış sayıdadır.",
              "skills": [
                "mk-protocol",
                "prog-debug"
              ]
            },
            {
              "id": "m10h5d25-q4",
              "kind": "mcq",
              "prompt": "Kumanda kartı zaten sola yatık. Öğrenci kartı tekrar sola yatırmaya çalışıyor. Ne olur?",
              "options": [
                "Yeni olay doğmaz, komut gönderilmez",
                "Komut tekrar gönderilir",
                "Servo 0°'ye gider",
                "Araç durur"
              ],
              "answer": 0,
              "explanation": "Olay duruş değiştiğinde doğar. Duruş zaten \"sola yatık\" olduğundan yeni olay çıkmaz ve yeni komut gitmez. Önce kartı \"yüzü yukarı\" gibi başka bir duruşa getirmek gerekir.",
              "skills": [
                "mk-servo-tilt",
                "prog-debug"
              ]
            },
            {
              "id": "m10h5d25-q5",
              "kind": "mcq",
              "prompt": "Uzaktan kumanda projesine başlarken en doğru ilk adım hangisidir?",
              "options": [
                "Servoyu rastgele açılara çevirmek",
                "İlk çalışan bloğu yazıp sayıları sonra düşünmek",
                "Yalnız kumanda tarafını yazıp aracı sonra tasarlamak",
                "Her komutun neyi tetiklediğini yazan bir komut tablosu çıkarmak"
              ],
              "answer": 3,
              "explanation": "Önce komut tablosunu yazarsın, çünkü kumanda ile araç aynı anlaşmayı paylaşmalıdır. Tablo olmadan gönderen ve alan taraf farklı sayılar kullanabilir. Servo bağlamak ya da rastgele sayılar denemek sonraya kalır.",
              "skills": [
                "prog-planning",
                "mk-protocol"
              ]
            }
          ]
        }
      ]
    },
    {
      "title": "Projeler",
      "project": "Ders sonu final projesi",
      "guideMd": "### Hafta hedefleri\nBu haftanın sonunda öğrenci:\n1. 10 saniyelik ölçüm ve çarpma ile dakikadaki atışı hesaplayabilir; bir bayrak değişkeni ile sayma zamanını yönetebilir.\n2. **kart sallandığında** başlığıyla olay sayabilir; eşitlik ile büyük-eşit koşulunun farkını ve kalan (mod) işlemini açıklayabilir.\n3. Alarm gibi bir cihazı durumlar ve geçişler olarak tarif edip değişkenlerle kurabilir.\n4. Sensör değerini (0-1023) **eşle** ile yüzdeye çevirebilir; eşik, çubuk grafik ve konsol kullanabilir.\n5. İki kartı radyoyla konuşturan bir projeyi önce plan olarak yazıp sonra kurabilir.\n\n### Haftanın planı\nHafta beş derstir; her ders yaklaşık 25-40 dakikadır. Aşağıdaki plan günde bir ders içindir.\n\n| Gün | Ders | Süre | Ne yapılır |\n|---|---|---|---|\n| 1 | Nabız ölçer | ~28 dk | Anlatımı oku, B ile 10 saniyelik ölçümü başlat, 12 kez A'ya bas, 72'yi gör, mini testi çöz. |\n| 2 | Adımsayar | ~25 dk | Kartı sal, A ile adımı oku, 10. adımda kutlamayı gör, \"= ya da >=\" farkını dene. |\n| 3 | Alarm | ~28 dk | Üç durumu kur, kurulu ve alarm değişkenlerini izle, A+B uzun basışla kapat. |\n| 4 | Nem ve sıcaklık istasyonu | ~30 dk | P1 kaydırıcısıyla nemi yüzdeye çevir, çubuk grafiği ve konsolu dene, eşiği değiştir. |\n| 5 | Proje: Akıllı saksı (final) | ~40 dk | Planı çiz, iki kartı kur, radyoyla nemi karşılıklı izlet, kendini değerlendir. |\n\n### Ön koşul kontrolü\nBu hafta önceki haftaların parçalarını birleştirir. Başlamadan önce kontrol et:\n- Değişken oluşturup değer yapabiliyor ve değerine ekleyebiliyor mu? (7. ders)\n- **eğer ... ise** ve karşılaştırma bloklarını kullanabiliyor mu? (8. ders)\n- Düğme başlıklarını ve uzun basışı biliyor mu? (6. ve 9. dersler)\n- **kart sallandığında** başlığını ve **çubuk grafik** bloğunu biliyor mu? (11. ve 12. dersler)\n- **ezgiyi çal** bloğunu ve radyo gönder/al bloklarını biliyor mu? (18., 21. ve 22. dersler)\n- Yüzde ve oran fikrine alışık mı? (50 / 100 gibi)\n\n### Kavram haritası\n- **Sayma ve ölçüm:** bayrak değişkeni → bekle bloğu → sayac x 6\n- **Olay ve koşul:** kart sallandığında → adim = 10 / adim >= 10 → kalan işlemi\n- **Durum:** kapalı → kurulu → çalıyor → kapat; kurulu ve alarm değişkenleri\n- **Sensör:** analog oku (0-1023) → eşle (0-100) → eşik → çubuk grafik ve konsol\n- **Proje:** plan → her 2000 ms'de gönder → mesaj gelince alınan değerle tepki ver\n\n### Sık yapılan hatalar\n- **Bayrağı yanlış yerde açmak.** olcum değerini bekle bloğundan sonra 1 yaparsan bekleme boyunca hiç sayılmaz.\n- **Sayacı sıfırlamamak.** İkinci ölçüm ilkinin üstüne eklenir (126 gibi).\n- **Çarpanı unutmak ya da yanlış seçmek.** süre x çarpan = 60 olmalı.\n- **Sayma bloğunu eğer'in içine koymak.** Değişken artmaz, koşul hiç doğru olmaz.\n- **Eşit yerine büyük-eşit kullanmak.** Kutlama 10. adımdan sonra her adımda tekrarlanır.\n- **Alarmı yarım kapatmak.** Yalnız sesi durdurmak; alarm değişkeni 1 kalır ve ezgi yeniden başlar.\n- **eşle bloğunda aralıkları ters yazmak.** 512 değeri 50 yerine 5238 olur.\n- **Eşik işaretini ters koymak.** nem > 30 yazarsan ıslakken uyarır.\n- **Alan kartta kendi sensörünü okumak.** Gelen mesajdaki alınan değer kullanılmalı.\n- **Mesaj adını farklı yazmak.** \"nem\" ile \"Nem\" eşit sayılmaz.\n- **Çubuk grafikte en çok değeri yanlış bırakmak.** Nem yüzde ise 100 olmalı.\n\n### Hafta sonu tekrarı\n1. Her dersin kavram kartlarına bir kez daha bak ve \"sık yapılan yanlış\" satırlarını yüksek sesle oku.\n2. Mini testlerde yanlış yaptığın soruların açıklamalarını yeniden oku, sonra soruyu yeniden çöz.\n3. Nabız ölçeri bakmadan yeniden kur. Sonra ölçüm süresini 15 saniye yapıp çarpanı değiştir ve aynı sonucu bul.\n4. Alarm için durum tablosunu kâğıda çiz: üç durum, hangi olay hangi durumu değiştirir.\n5. P1 kaydırıcısını 0, 100, 300, 512 ve 1023 yap; her birinin yüzde karşılığını tahmin et, sonra konsolda karşılaştır.\n6. Kendi cümlelerinle şu soruyu cevapla: \"bekle bloğu neden öteki düğmeleri durdurmaz?\"\n\nHafta sonu testi olarak beş dersin mini testleri yeterlidir; her derste 5 soru, toplam 25 soru. Hedef: her dersten en az 4 doğru. Eksik kalan dersin anlatımına dön.\n\n### Proje değerlendirme ölçütü (Akıllı saksı)\n| Ölçüt | Gelişmeli | Yeterli | İleri |\n|---|---|---|---|\n| Plan | Plan yok | Dört başlığın ne zaman çalıştığı yazılmış | Plan kodla birebir uyuyor ve eşiğin neden seçildiği açıklanmış |\n| Ölçüm | Nem ham sayı olarak gösteriliyor | P1 değeri eşle ile 0-100'e çevrilmiş | Eşik bir değişkende tutuluyor, kolayca değiştirilebiliyor |\n| Radyo | Kartlar birbirini görmüyor | İki kart aynı grupta, nem mesajı gidiyor ve alan kart alınan değeri kullanıyor | Mesaj adı ve grup kontrol edilmiş, ek bir mesaj (sıcaklık gibi) eklenmiş |\n| Tepki | Uyarı yok ya da hep çalıyor | Nem 30'un altında üzgün yüz ve ezgi, değilse çubuk grafik | Çubuk grafik doğru ölçekli, ezgi sürerken gelen mesajlar anlatılabiliyor |\n| Anlatım | Ne yaptığını anlatamıyor | Programı üç cümleyle anlatıyor | Hata yapıp nasıl bulduğunu ve ders parçalarını nerede kullandığını anlatıyor |\n\n### Veli ve öğretmen notu\n- **Amaç.** Hafta ezber değil, öğrencinin önceki haftaları birleştirerek küçük bir \"ürün\" kurmasıdır. Her derste bir cihaz (nabız ölçer, adımsayar, alarm, istasyon) çıkar.\n- **Nasıl destek olunur?** Takıldığında cevabı söyleme; şu soruları sor: \"Hangi olay bu başlığı çalıştırıyor?\", \"O anda değişkenlerin değeri ne?\", \"Bu bloğu eğer'in içine mi dışına mı koydun?\", \"Hangi karttan okuyorsun, gelen mesajdan mı kendi pininden mi?\"\n- **Sağlık notu.** Nabız ölçer bir eğitim aracıdır, tıbbi ölçüm değildir. Gerçek bir sağlık kaygısı için bir yetişkine ya da doktora danışılmalıdır.\n- **Süre.** Dersleri aynı gün peş peşe yapmak yerine aralıklı çalışmak kalıcılığı artırır. Final projesini farklı bir günde yapmak iyi olur.\n- **Güvenlik.** Bu platformdaki her şey sanaldır; gerçek bir sensör, pil ya da radyo kullanılmaz.\n- **İlerleme.** Dersin sonundaki mini test sonuçları \"İlerlemem\" sayfasında beceri bazında görünür (taslak/pilot özellik; yalnız onay verildiyse kaydedilir).",
      "lessons": [
        {
          "title": "Nabız ölçer",
          "durationMin": 28,
          "problem": "Doktor bileğini tutup saatine bakarak kalp atışını sayar. Neden bir dakika boyunca saymaz? Çünkü kısa bir süre sayıp bir çarpma yapmak aynı sonucu çok daha çabuk verir. Bu derste kendi sanal nabız ölçerini yapacaksın. Kalbin her atışında A'ya basacaksın, kart sayıp sonucu söyleyecek.",
          "contentMd": "### Fikir\nKartta gerçek bir nabız sensörü yoktur. Portal tamamen sanaldır ve ölçümü sen girersin: kendi nabzını ya da bir ritmi sayarak her atışta **A**'ya basarsın. Kart 10 saniye boyunca bu basışları sayar, sonunda çarpar.\n\n**Dakikadaki atış = 10 saniyede sayılan atış × 6**\n\n| 10 saniyede atış | Dakikadaki atış |\n|---|---|\n| 10 | 60 |\n| 12 | 72 |\n| 15 | 90 |\n\nBu bir eğitim aracıdır, tıbbi bir ölçüm değildir.\n\n### Yeni fikir: bekleme sırasında başka iş\n**bekle [10000] ms** bloğu bir başlığın içinde 10 saniye bekler. Ama kartın öteki başlıkları bu sırada çalışmaya devam eder. Yani **B** 10 saniye beklerken **A** düğmesi yine çalışır. Kart farklı başlıkları birlikte çalıştırır.\n\n### Adım adım\nEditörde **başlangıçta**, **düğme [A] [basılınca]** ve **düğme [B] [basılınca]** hazır.\n\n1. **Değişken** kategorisinde iki değişken oluştur: **sayac** (kaç atış) ve **olcum** (ölçüm sürüyor mu? 1 = evet, 0 = hayır).\n2. **başlangıçta** içine **sayac değerini [0] yap** ve **olcum değerini [0] yap** koy.\n3. **düğme [A] [basılınca]** içine **eğer ... ise** koy. Koşul: **olcum** **=** **1**. İçine sırayla:\n   - **sayac değerine [1] ekle**\n   - **simgeyi göster [kalp]**\n   - **bekle [100] ms**\n   - **ekranı temizle**\n4. **düğme [B] [basılınca]** içine sırayla:\n   - **sayac değerini [0] yap**\n   - **olcum değerini [1] yap**\n   - **simgeyi göster [küçük kalp]**\n   - **bekle [10000] ms**\n   - **olcum değerini [0] yap**\n   - **sayıyı göster** içine **sayac** **×** **6** (çarpma bloğu).\n5. ▶ **Çalıştır**. **B**'ye bas ve ölçüm başlasın. 10 saniye içinde **A**'ya on iki kez bas (yaklaşık saniyede bir kez). Sonuca bak.\n\n### Beklenen sonuç\n**B**'den sonra ekranda küçük kalp durur. Her **A** basışında büyük kalp bir an parlar. 10 saniye sonra ekranda **72** kayar. Dört hedefin hepsinde ✓ olmalı. 12 atışı tam yakalayamazsan sonucun 6'nın katı olur (60, 66, 72, 78...).\n\n### Nasıl çalışıyor?\n- **olcum** bir bayraktır. 1 iken **A** sayar, 0 iken **A** hiçbir şey yapmaz. Böylece ölçüm dışında basışlar yanlışlıkla sayılmaz.\n- **sayac** her ölçümün başında sıfırlanır.\n- **bekle [10000] ms** 10 saniye bekler. Bu sırada **A** çalışır çünkü **A** ayrı bir başlıktır.\n- 10 saniye bitince bayrak kapanır ve sonuç gösterilir.\n\n### Dene\n1. Ölçüm süresini 15 saniye yap (**bekle [15000] ms**) ve çarpanı 4 yap. Sonuç yaklaşık aynı çıkmalı.\n2. Sonuca göre ekranda bir simge göster: 60'ın altı **uyuyan yüz**, 100'ün üstü **şaşkın yüz**, arası **mutlu yüz**. (**eğer ... ise ... değilse** bloklarını iç içe koy.)\n3. Ölçüm başlarken kısa bir bip çal ve bitince farklı bir bip çal.\n\n### Sık yapılan hatalar\n- **olcum değerini 1 yapmayı unutmak.** **A** hiç saymaz.\n- **10000 yerine 10 yazmak.** **bekle** milisaniye ile çalışır. 10 ms hiç fark edilmez.\n- **sayac sıfırlanmamak.** İkinci ölçümde sayı önceki ölçümün üstüne eklenir.\n- **Çarpanı unutmak.** Ekranda yalnız atış sayısı kalır; \"dakikadaki atış\" değil.",
          "question": "Hızlı koşunca nabzın artar. Ölçümü koşmadan önce ve koştuktan sonra yapsan hangi farkı görürsün? 10 saniye yerine 5 saniye ölçsen sonuç ne kadar güvenilir olurdu?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Bir olayı belli bir süre boyunca saymanın ve sonucu çarpmayla büyütmenin mantığını\n- Bir **bayrak** (0 ya da 1 tutan değişken) ile \"şimdi sayma zamanı mı?\" sorusunu cevaplamayı\n- **bekle** bloğu bir başlığı beklettiğinde öteki başlıkların çalışmaya devam ettiğini\n- Sayacı her ölçümden önce sıfırlamanın neden gerektiğini\n\n### Önceden bilmen gerekenler\n- 6. ders: A, B ve A+B düğme başlıkları\n- 7. ders: değişken oluşturmak, değer yapmak, değere eklemek\n- 8. ders: **eğer ... ise** bloğu ve karşılaştırma\n\n### Kısa sürede saymak, sonra çarpmak\nKalp bir dakikada yaklaşık 60 ile 100 kez atar. Bir dakika boyunca saymak uzun sürer. Bunun yerine 10 saniye sayıp 6 ile çarparız, çünkü 10 saniyenin 6 katı 60 saniyedir (bir dakika).\n\n| 10 saniyede sayılan | Çarpan | Dakikadaki atış |\n|---|---|---|\n| 10 | 6 | 60 |\n| 12 | 6 | 72 |\n| 14 | 6 | 84 |\n\nSürenin yarısını (5 saniye) ölçersen çarpan 12 olur. Ama kısa ölçümde bir atışı kaçırmak sonucu büyük değiştirir: 5 saniyede 1 atış fazla ya da eksik, dakikada 12 atışlık fark yapar. Ölçüm süresi uzadıkça tek bir hatanın etkisi küçülür.\n\n### Bayrak: ölçüm sürüyor mu?\nA düğmesi her zaman çalışabilir. Ama sadece ölçüm sırasında saymasını istiyoruz. Bunun için **olcum** adında bir bayrak değişkeni kullanırız. Bayrak yalnızca iki değer alır:\n\n| olcum | Anlamı | A düğmesi ne yapar? |\n|---|---|---|\n| 0 | ölçüm yok | hiçbir şey |\n| 1 | ölçüm sürüyor | sayac değerine 1 ekler |\n\nProgramın bir yeri bayrağı 1 yapar, bir yeri 0 yapar. \"Eğer olcum = 1 ise\" koşulu da bu iki durum arasında ayrım yapar.\n\n### Beklerken başka iş\nMikro Kart farklı başlıkları birlikte çalıştırır. B başlığı **bekle [10000] ms** bloğuna geldiğinde yalnızca B başlığı 10 saniye durur. A başlığı bu sırada yeni basışları işlemeye devam eder. Zaman çizelgesi şöyle görünür:\n\n```\nt = 0 sn    B'ye bas: sayac = 0, olcum = 1, bekle başlar\nt = 1..10   A'ya her basışta sayac artar\nt = 10 sn   B devam eder: olcum = 0, sayac x 6 gösterilir\n```\n\n### Sıfırlamayı unutma\nSayaç ölçümün başında 0 yapılmazsa eski ölçümün atışları yeni sonuca karışır. Birinci ölçümde 12, ikincide 9 atış saydıysan ve sıfırlamadıysan kart (12 + 9) x 6 = 126 gösterir. Bu bir kalp için imkânsız bir değerdir; hata kartta değil programdadır.\n\n### Özet\nKısa bir süre boyunca sayıp çarparak dakikadaki atış bulunur: atış sayısı x 6. Bir bayrak değişkeni, saymanın ne zaman geçerli olduğunu belirler. **bekle** bloğu yalnızca kendi başlığını durdurur, öteki başlıklar çalışır. Her ölçümden önce sayacı sıfırlamak gerekir.",
          "concepts": [
            {
              "term": "Kısa ölçüm ve çarpma",
              "definition": "Kısa bir süre sayıp sonucu çarparak bir dakikalık değeri tahmin etmek.",
              "example": "10 saniyede 14 atış sayarsan 14 x 6 = 84 atış/dakika bulursun.",
              "pitfall": "Çarpanı unutmak: ekranda atış sayısı kalır, dakikadaki atış değil."
            },
            {
              "term": "Bayrak",
              "definition": "0 ya da 1 tutan ve \"şimdi şu işlem geçerli mi?\" sorusunu cevaplayan değişken.",
              "example": "olcum = 1 iken A sayar, olcum = 0 iken A hiçbir şey yapmaz.",
              "pitfall": "Bayrağı 1 yapmayı unutmak: ölçüm hiç başlamaz ve A hiç saymaz."
            },
            {
              "term": "bekle ve başlıklar",
              "definition": "bekle bloğu yalnızca kendi başlığını durdurur; öteki başlıklar çalışmaya devam eder.",
              "example": "B 10 saniye beklerken A düğmesi basışları saymaya devam eder.",
              "pitfall": "bekle bloğunu bütün kartı durdurur sanmak."
            },
            {
              "term": "Sıfırlama",
              "definition": "Sayacı yeni ölçümün başında 0 yapmak.",
              "example": "B başlığının ilk bloğu sayac değerini 0 yap olur.",
              "pitfall": "Sıfırlamamak: ikinci ölçümde önceki atışlar da toplanır ve sonuç şişer."
            },
            {
              "term": "Milisaniye",
              "definition": "bekle bloğunun birimi; 1000 ms = 1 saniye.",
              "example": "10 saniye için bekle [10000] ms yazılır.",
              "pitfall": "bekle [10] yazmak: bu yalnızca 10 ms, yani gözle fark edilmez."
            }
          ],
          "quiz": [
            {
              "id": "m10h6d26-q1",
              "kind": "numeric",
              "prompt": "Nabız ölçerde 10 saniye boyunca 14 atış saydın. Kart kaç sayısını göstermelidir?",
              "answer": 84,
              "unit": "atış/dk",
              "explanation": "10 saniyenin 6 katı bir dakikadır. 14 x 6 = 84. Atış sayısını (14) göstermek ya da 10 ile çarpmak (140) dakikadaki atışı vermez.",
              "skills": [
                "mk-variables"
              ]
            },
            {
              "id": "m10h6d26-q2",
              "kind": "mcq",
              "prompt": "B başlığı bekle [10000] ms bloğunda beklerken A düğmesine basılırsa ne olur?",
              "options": [
                "A düğmesi çalışmaz, çünkü kart beklemektedir",
                "Kart bir hata verir",
                "A başlığı çalışır, çünkü başlıklar birbirinden bağımsız ilerler",
                "A basışları 10 saniye sonra toplu işlenir"
              ],
              "answer": 2,
              "explanation": "bekle yalnızca kendi başlığını durdurur. A başlığı ayrı bir görevdir ve her basışta hemen çalışır. Bu yüzden beklerken sayım yapılabilir.",
              "skills": [
                "mk-concurrency",
                "mk-events"
              ]
            },
            {
              "id": "m10h6d26-q3",
              "kind": "find-bug",
              "prompt": "Bu program 10 saniyede 12 kez A'ya basılsa da hep 0 gösteriyor. Hata hangisi?\n\n```\ndüğme B basılınca:\n  sayac değerini 0 yap\n  bekle 10000 ms\n  olcum değerini 1 yap\n  sayıyı göster (sayac x 6)\n\ndüğme A basılınca:\n  eğer olcum = 1 ise:\n    sayac değerine 1 ekle\n```",
              "options": [
                "A başlığında sayac 1 yerine 2 artmalı",
                "olcum değerini 1 yapma bloğu bekle bloğundan sonra; bekleme sırasında olcum 0 olduğu için A hiç saymaz",
                "Çarpan 6 değil 10 olmalı",
                "sayac başta sıfırlanmamış"
              ],
              "answer": 1,
              "explanation": "Bayrak bekleme başlamadan önce 1 yapılmalıdır. Burada bekleme bittikten sonra 1 oluyor, yani sayma penceresi hiç açılmıyor ve sayac 0 kalıyor. Çarpan ve sıfırlama doğru.",
              "skills": [
                "mk-debug",
                "mk-concurrency",
                "mk-variables"
              ]
            },
            {
              "id": "m10h6d26-q4",
              "kind": "predict-output",
              "prompt": "Aşağıdaki program kullanılıyor. Birinci ölçümde 12 atış, hemen ardından ikinci ölçümde 9 atış sayıldı. İkinci ölçümün sonunda kart ne gösterir?\n\n```\nbaşlangıçta:\n  sayac değerini 0 yap\n  olcum değerini 0 yap\n\ndüğme B basılınca:\n  olcum değerini 1 yap\n  bekle 10000 ms\n  olcum değerini 0 yap\n  sayıyı göster (sayac x 6)\n\ndüğme A basılınca:\n  eğer olcum = 1 ise:\n    sayac değerine 1 ekle\n```",
              "options": [
                "54",
                "72",
                "126",
                "0"
              ],
              "answer": 2,
              "explanation": "Program sayac'ı B'de sıfırlamıyor. İkinci ölçümde sayac 12 + 9 = 21 olur ve 21 x 6 = 126 gösterilir. 54 yalnız ikinci ölçümün sonucu olurdu; ancak sıfırlama bulunmuyor.",
              "skills": [
                "mk-variables",
                "mk-debug"
              ]
            },
            {
              "id": "m10h6d26-q5",
              "kind": "numeric",
              "prompt": "Ölçüm süresini 15 saniyeye çıkardın ve çarpanı 4 yaptın. 15 saniyede 17 atış saydın. Dakikadaki atış kaçtır?",
              "answer": 68,
              "unit": "atış/dk",
              "explanation": "15 saniyenin 4 katı 60 saniyedir. 17 x 4 = 68. Çarpan süreye göre seçilir: süre x çarpan = 60.",
              "skills": [
                "mk-variables"
              ]
            }
          ]
        },
        {
          "title": "Adımsayar",
          "durationMin": 25,
          "problem": "Bilekliklerdeki adımsayar nasıl sayar? İçindeki küçük bir ivmeölçer, her adımda ufak bir sarsıntı hisseder ve sayıyı bir artırır. Sanal Mikro Kart'ın da bir ivmeölçeri var. Kartı sallamayı \"bir adım\" sayarak bir adımsayar yapacağız ve 10. adımda küçük bir kutlama ekleyeceğiz.",
          "contentMd": "### Fikir\nKartı sanal olarak sallamak, yürümek gibi bir sarsıntıdır. Kartın **sallandığında** başlığı her sallanışta bir kez çalışır. İçine **adim** değişkenini bir artıran blok koyarsak bir adımsayar olur.\n\n### Yeni fikir: hedefe ulaşınca özel bir şey\nBir değişken **tam olarak** bir sayıya eşit olunca bir şey olsun diyebiliriz: **eğer [adim] = [10] ise**. Eşitlik yalnız o anda doğrudur. 11. adımda koşul yanlış olur, ses tekrar çalmaz.\n\n### Adım adım\nEditörde **başlangıçta**, **kart [sallandığında]**, **düğme [A] [basılınca]** ve **düğme [B] [basılınca]** hazır.\n\n1. **Değişken** kategorisinde **adim** değişkenini oluştur.\n2. **başlangıçta** içine **adim değerini [0] yap** koy.\n3. **kart [sallandığında]** içine sırayla:\n   - **adim değerine [1] ekle**\n   - **eğer ... ise** bloğu. Koşul: **adim** **=** **10**. İçine **simgeyi göster [mutlu yüz]** ve **ezgiyi çal [Zafer]**.\n4. **düğme [A] [basılınca]** içine **sayıyı göster** koy; sayı olarak **adim** değişkenini tak.\n5. **düğme [B] [basılınca]** içine **adim değerini [0] yap** ve **ekranı temizle** koy.\n6. ▶ **Çalıştır**. Sağ paneldeki **Hareket (ivmeölçer)** bölümünde **Salla** düğmesine üç kez bas. Sonra kartın **A** düğmesine bas: ekranda 3 görmelisin. Yedi kez daha salla. 10. sallayışta kutlama başlar. Kartın **B** düğmesiyle sıfırla.\n\n### Beklenen sonuç\n**A** adım sayısını gösterir: üç sallayıştan sonra 3, on sallayıştan sonra 10. 10. sallayışta kartın ekranında mutlu yüz belirir ve **Zafer** ezgisi çalar (yaklaşık 2,75 saniye). **B**'ye basınca sayaç sıfırlanır. Altı hedefin hepsinde ✓ olmalı.\n\n### Nasıl çalışıyor?\n- Her **Salla** ile **kart sallandığında** başlığı bir kez çalışır.\n- 10. adımda **eğer** koşulu doğru olur ve kutlama başlar. Ezgi bitene kadar o başlık meşguldür; bu sırada gelen yeni sallanmalar sıraya girer (en çok 3).\n- **A** ve **B** ayrı başlıklardır, ezgi çalarken de çalışabilirler.\n- İvme sensöründen gelen değerleri de görebilirsin: **Hareket** bölümündeki **güç** değeri sallanırken yükselir.\n\n### Dene\n1. Hedefi 10 yerine 5 yap. Daha çabuk kutlanıyor mu?\n2. Her 10 adımda kutlama yapmak için **Matematik** kategorisindeki **[adim] ÷ [10] işleminin kalanı** bloğunu kullan. Kalan **0** ise kutla.\n3. Adımını 70 cm sayarsan yürüdüğün yol **adim** × 7 ÷ 10 metre eder. **A** düğmesi bunu göstersin.\n\n### Sık yapılan hatalar\n- **B ile sıfırlamayı unutmak.** Yeni bir yürüyüş için önce B'ye basmazsan sayı kaldığı yerden devam eder.\n- **Eşit yerine büyük işareti kullanmak.** **adim ≥ 10** olursa 11., 12. adımlarda da ezgi yeniden çalar.\n- **adim değerine 1 ekle bloğunu eğer'in içine koymak.** O zaman değişken artmaz.",
          "question": "Gerçek bir adımsayar sallanmayı yürüyüşten nasıl ayırır? Zıplamak ya da kolunu sallamak adım sayılır mı? Sayacı daha akıllı yapmak için hangi bilgiyi kullanabilirsin?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Her sallanışta tetiklenen bir başlıkla olay saymayı\n- \"Tam olarak bu sayıya eşit\" ile \"bu sayıya eşit ya da büyük\" arasındaki farkı\n- \"Her 10 adımda bir\" gibi tekrar eden hedefleri kalan (mod) işlemiyle kurmayı\n- Sayma bloğunun **eğer** içinde mi dışında mı durması gerektiğini\n\n### Önceden bilmen gerekenler\n- 7. ders: değişken ve **değerine ekle** bloğu\n- 8. ders: **eğer ... ise** ve karşılaştırma\n- 11. ders: ivmeölçer ve **kart sallandığında** başlığı\n- 18. ders: **ezgiyi çal** bloğu\n\n### Her sallanış bir olaydır\nGerçek bir adımsayardaki ivmeölçer yürürken ufak sarsıntıları hisseder. Sanal kartta sallamayı bir adım sayarız. **kart [sallandığında]** başlığı her sallanışta bir kez çalışır. İçine **adim değerine 1 ekle** koyarsan her sallanışta adim bir artar.\n\n### Eşit mi, büyük mü?\nHedefe ulaşınca bir şey yapmak için koşul yazarız. Küçük bir değişiklik büyük fark yaratır:\n\n| Koşul | adim = 9 | adim = 10 | adim = 11 | adim = 12 |\n|---|---|---|---|---|\n| adim = 10 | yanlış | doğru | yanlış | yanlış |\n| adim >= 10 | yanlış | doğru | doğru | doğru |\n\n\"adim = 10\" yalnızca tam 10. adımda doğrudur, kutlama bir kez olur. \"adim >= 10\" ise 10. adımdan sonraki her adımda doğrudur, kutlama her sallanışta tekrarlanır. Hedef bir kez yapılacaksa eşitlik, \"hedefi geçtikten sonra hep\" yapılacaksa büyük-eşit seçilir.\n\n### Her 10 adımda bir\nKutlamayı 10, 20, 30... adımlarda yapmak istersen **adim ÷ 10 işleminin kalanı** bloğu işe yarar. Kalan, bölmeden artan sayıdır:\n\n| adim | adim ÷ 10 işleminin kalanı |\n|---|---|\n| 7 | 7 |\n| 10 | 0 |\n| 23 | 3 |\n| 30 | 0 |\n\nKalan 0 ise adim 10'un katıdır. Böylece \"kalan = 0 ise kutla\" koşulu her 10 adımda bir doğru olur.\n\n### Sayma nerede durmalı?\nÖnce sayarsın, sonra kontrol edersin. Sayma bloğu **eğer**'in içine girerse yalnızca koşul doğruyken sayar. Koşul \"adim = 10\" ise ve adim 0'dan başlıyorsa koşul asla doğru olmaz, çünkü adim hiç artmaz. Sayma bloğu her zaman koşulun dışında, ondan önce durmalıdır.\n\n### Sıraya girenler\nKutlama ezgisi yaklaşık 2,75 saniye sürer. Bu sürede başlık meşguldür. Gelen yeni sallanışlar sıraya girer ama en çok 3 tanesi saklanır, fazlası kaybolur. Çok hızlı olaylarda sayaç bu yüzden eksik sayabilir.\n\n### Özet\n**kart sallandığında** başlığı her sallanışta bir adım sayar. Tam eşitlik bir kez, büyük-eşit sonraki her adımda doğrudur. Kalan işlemi tekrar eden hedefleri kurar. Sayma bloğu koşulun dışında olmalıdır. Meşgul bir başlık yalnızca 3 olayı sıraya alır.",
          "concepts": [
            {
              "term": "kart sallandığında",
              "definition": "Kartın her sallanışında bir kez çalışan olay başlığı.",
              "example": "Başlığın içine adim değerine 1 ekle koyarsan her sallanış bir adım sayılır.",
              "pitfall": "Başlığı boş bırakmak: sallamak hiçbir değişkeni artırmaz."
            },
            {
              "term": "Eşitlik ve büyük-eşit",
              "definition": "\"Eşit\" yalnızca tam o sayıda, \"büyük-eşit\" o sayıdan sonraki her sayıda doğrudur.",
              "example": "adim = 10 kutlamayı bir kez yapar; adim >= 10 her adımda tekrarlar.",
              "pitfall": "Bir kez olacak işe büyük-eşit koymak: kutlama 11., 12. adımlarda da çalar."
            },
            {
              "term": "Kalan (mod)",
              "definition": "Bir bölmeden artan sayı. adim ÷ 10 işleminin kalanı, 10'un katlarında 0 olur.",
              "example": "30 ÷ 10 işleminin kalanı 0, 23 ÷ 10 işleminin kalanı 3'tür.",
              "pitfall": "Bölümü kalanla karıştırmak: 23 ÷ 10 bölümü 2, kalanı 3'tür."
            },
            {
              "term": "Sayma sırası",
              "definition": "Önce sayarsın, sonra kontrol edersin. Sayma bloğu koşulun dışında olmalıdır.",
              "example": "adim değerine 1 ekle bloğu eğer bloğundan önce gelir.",
              "pitfall": "Sayma bloğunu eğer içine koymak: koşul hiç doğru olmaz ve değişken artmaz."
            },
            {
              "term": "Olay kuyruğu",
              "definition": "Meşgul bir başlığa gelen yeni olaylar sıraya girer ama en çok 3 tanesi saklanır.",
              "example": "Zafer ezgisi çalarken gelen 5 sallanıştan yalnızca 3'ü işlenir.",
              "pitfall": "Her sallanışın mutlaka sayılacağını sanmak: meşgul başlıkta fazlası kaybolur."
            }
          ],
          "quiz": [
            {
              "id": "m10h6d27-q1",
              "kind": "predict-output",
              "prompt": "Kart 12 kez sallanıyor (adim 0'dan başlıyor, her sallanıştan sonra ezgi bitene dek bekleniyor). Zafer ezgisi kaç kez çalar?\n\n```\nkart sallandığında:\n  adim değerine 1 ekle\n  eğer adim >= 10 ise:\n    ezgiyi çal [Zafer]\n```",
              "options": [
                "1 kez",
                "2 kez",
                "3 kez",
                "12 kez"
              ],
              "answer": 2,
              "explanation": "adim 10, 11 ve 12 olduğunda koşul doğrudur: 3 kez. \"adim = 10\" yazılsaydı yalnızca 1 kez çalardı. 12 kez çalması için ilk sallanıştan itibaren doğru olması gerekirdi.",
              "skills": [
                "mk-conditions",
                "mk-variables"
              ]
            },
            {
              "id": "m10h6d27-q2",
              "kind": "find-bug",
              "prompt": "Kartı kaç kez sallasan da 10. adımda kutlama olmuyor. Hata hangisi?\n\n```\nbaşlangıçta:\n  adim değerini 0 yap\n\nkart sallandığında:\n  eğer adim = 10 ise:\n    adim değerine 1 ekle\n    simgeyi göster [mutlu yüz]\n    ezgiyi çal [Zafer]\n```",
              "options": [
                "adim değerine 1 ekle bloğu eğer'in içinde; adim 0 olduğu için koşul hiç doğru olmuyor ve adim hiç artmıyor",
                "Ezgi adı yanlış",
                "Başlangıçta adim 0 yapılmamalı",
                "Koşulda = yerine < kullanılmalı"
              ],
              "answer": 0,
              "explanation": "Sayma bloğu koşulun dışına, ondan önceye konmalı. İçeride kalırsa adim 0'da takılır, \"adim = 10\" doğru olmaz. Başlangıçta 0 yapmak ve ezgi adı doğru.",
              "skills": [
                "mk-debug",
                "mk-conditions"
              ]
            },
            {
              "id": "m10h6d27-q3",
              "kind": "numeric",
              "prompt": "Adımın 70 cm. Adımsayar 50 adım gösteriyor. Yürüdüğün yol kaç metredir?",
              "answer": 35,
              "unit": "m",
              "explanation": "70 cm = 0,7 m. 50 x 0,7 = 35 m. Bloklarda adim x 7 ÷ 10 şeklinde de yazılır. 3500 cevabı santimetre cinsindendir.",
              "skills": [
                "mk-variables"
              ]
            },
            {
              "id": "m10h6d27-q4",
              "kind": "mcq",
              "prompt": "Her 10 adımda bir kutlama için \"adim ÷ 10 işleminin kalanı = 0\" koşulu kullanılıyor. Hangi adımlarda kutlama olur?",
              "options": [
                "Yalnız 10. adımda",
                "1, 2, 3 ... adımlarının hepsinde",
                "10, 20, 30 ... adımlarında",
                "5, 15, 25 ... adımlarında"
              ],
              "answer": 2,
              "explanation": "Kalan yalnızca 10'un katlarında 0 olur: 10, 20, 30 ... Yalnız 10. adımda kutlama için adim = 10 yazılırdı.",
              "skills": [
                "mk-conditions"
              ]
            },
            {
              "id": "m10h6d27-q5",
              "kind": "numeric",
              "prompt": "Doğru kurulmuş adımsayarda 10. sallanış Zafer ezgisini (2,75 saniye) başlatır. Ezgi sürerken kart 5 kez daha sallanır. Ezgi bitip sıradaki olaylar işlenince adim kaç olur?",
              "answer": 13,
              "explanation": "Meşgul başlıkta en çok 3 olay sıraya girer; 5 sallanıştan 3'ü saklanır, 2'si kaybolur. adim 10 + 3 = 13 olur. Bu sayıyı sanal kartta çalıştırarak doğruladık.",
              "skills": [
                "mk-events",
                "mk-concurrency"
              ]
            }
          ]
        },
        {
          "title": "Alarm",
          "durationMin": 28,
          "problem": "Çantanın ya da bisikletin başında bir alarm olsa, biri dokunur dokunmaz ötmeye başlasa nasıl olurdu? Alarm, aslında bir **durum** makinesidir: ya kurulu değildir, ya kuruludur, ya da çalıyordur. Durumlar arasında geçişi düğmeler ve sensörler yapar. Bu derste durumları değişkenlerle tutan bir alarm yapacaksın.",
          "contentMd": "### Üç durum\n| Durum | Ne zaman? | Ekranda |\n|---|---|---|\n| Kapalı | başta | boş |\n| Kurulu | A'ya basınca | \"evet\" işareti |\n| Çalıyor | kurulu iken kart sallanınca | kuru kafa ve alarm ezgisi |\n\nÇalan alarmı kapatmak için **A+B**'ye bir saniyeden uzun basılır. Uzun basış kazara olmaz, bu yüzden şifre gibi iş görür. Kapanınca ekranda mutlu yüz görünür.\n\n### Yeni fikirler\n- İki **durum değişkeni**: **kurulu** (0/1) ve **alarm** (0/1). Değişkenler kartın o anki durumunu hatırlar.\n- **düğme [A+B] [uzun basılınca]**: A ve B'ye birlikte 1 saniyeden uzun basınca çalışır. (Düğme başlığında listeden **A+B** ve **uzun basılınca** seç.)\n- **sonsuza kadar** içinde **eğer** ile bir durumu sürekli kontrol etmek.\n\n### Adım adım\nEditörde **başlangıçta**, **düğme [A] [basılınca]**, **kart [sallandığında]**, **sonsuza kadar** ve **düğme [A+B] [uzun basılınca]** hazır.\n\n1. **Değişken** kategorisinde **kurulu** ve **alarm** değişkenlerini oluştur.\n2. **başlangıçta** içine **kurulu değerini [0] yap** ve **alarm değerini [0] yap** koy.\n3. **düğme [A] [basılınca]** içine **kurulu değerini [1] yap** ve **simgeyi göster [evet]** koy.\n4. **kart [sallandığında]** içine **eğer ... ise** koy. Koşul: **kurulu** **=** **1**. İçine **alarm değerini [1] yap**.\n5. **sonsuza kadar** içine **eğer ... ise** koy. Koşul: **alarm** **=** **1**. İçine sırayla: **simgeyi göster [kuru kafa]**, **ezgiyi çal [Alarm]**, **ekranı temizle**, **bekle [200] ms**.\n6. **düğme [A+B] [uzun basılınca]** içine sırayla: **kurulu değerini [0] yap**, **alarm değerini [0] yap**, **sesi durdur**, **simgeyi göster [mutlu yüz]**.\n7. ▶ **Çalıştır**. Kartın **A** düğmesine bas. **Hareket** bölümünden **Salla**'ya bas. Alarm çalarken **A+B** yazan düğmeye bir saniyeden uzun bas ve bırakma.\n\n### Beklenen sonuç\n**A**'dan sonra ekranda \"evet\" işareti görünür. Salladığında kuru kafa yanıp söner ve kısa bir alarm ezgisi tekrar tekrar çalar (ezgi 1,6 saniye sürer, ardından 0,2 saniyelik boşluk olur). **A+B**'ye uzun basınca alarm durur ve mutlu yüz görünür. Altı hedefin hepsinde ✓ olmalı.\n\n### Nasıl çalışıyor?\n- **Kurulu değilken** sallarsan hiçbir şey olmaz, çünkü **kart [sallandığında]** içindeki **eğer** **kurulu = 1** olmasını bekler.\n- **sonsuza kadar** hep döner ama **alarm = 0** iken içine girilmez.\n- **A+B** uzun basışı **alarm**'ı 0 yapınca **sonsuza kadar** bir sonraki turda alarmı çalmaz. O an çalmakta olan ezgi bitene kadar sürebilir (en çok 1,6 saniye), ama bir daha başlamaz.\n- Aynı anda birden fazla başlık çalıştığı için, ezgi bitmeden **A+B** uzun basışı işlenir.\n\n### Dene\n1. Sallama yerine kartı yüzüstü çevirince alarm çalsın: **kart [yüzü aşağı bakınca]** başlığı kullan.\n2. Alarm çalarken **ışık seviyesi** 50'nin altındaysa (karanlıkta) farklı bir ezgi çal. Işığı **Işık** kaydırıcısıyla değiştir.\n3. Kapatmak için A+B yerine B düğmesine 3 kez art arda basmayı dene. Sayı tutan bir değişken gerekecek.\n\n### Sık yapılan hatalar\n- **Basışı çok kısa tutmak.** Uzun basış için A+B'ye bir saniyeden fazla basılı kalmalısın.\n- **kurulu** ve **alarm** değişkenlerini karıştırmak. Sallanınca **alarm** 1 olur, **kurulu** değil.\n- **Alarmı kapatırken yalnız sesi durdurmak.** **alarm** değişkenini sıfırlamazsan **sonsuza kadar** alarmı yeniden çalar.\n- **sonsuza kadar** içine **bekle** koymamak. Ekran ancak çok kısa bir an boşalır, yanıp sönme neredeyse görünmez.",
          "question": "Gerçek bir alarmda yanlışlıkla çalma (yalancı alarm) bir sorundur. Seni en çok hangisi rahatsız ederdi: yanlış yere çalan alarm mı, yoksa gerçekten gerektiğinde çalmayan alarm mı? Kartı nasıl daha güvenilir yapardın?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Bir cihazı **durumlar** ve durumlar arası geçişler olarak düşünmeyi\n- Durumu değişkenlerle tutmayı ve olayların durumu değiştirmesini\n- **sonsuza kadar** içinde bir durumu sürekli kontrol etmeyi\n- Alarmı kapatırken neden hem sesi hem durum değişkenini sıfırlamak gerektiğini\n\n### Önceden bilmen gerekenler\n- 7. ders: değişkenler\n- 8. ders: **eğer ... ise**\n- 9. ders: uzun basış\n- 11. ders: **kart sallandığında** başlığı\n- 18. ders: **ezgiyi çal** bloğu\n\n### Cihaz bir anda tek durumdadır\nKapı alarmı düşün. Ya kapalıdır (hiçbir şey yapmaz), ya kuruludur (hırsızı bekler), ya da çalıyordur. Aynı anda iki durumda olamaz. Bu düşünce biçimine **durum makinesi** denir. Her durum için şunu sorarız: Bu durumdayken hangi olay beni hangi duruma götürür?\n\n| Şu anki durum | Olay | Yeni durum |\n|---|---|---|\n| Kapalı | A'ya basıldı | Kurulu |\n| Kurulu | kart sallandı | Çalıyor |\n| Çalıyor | A+B uzun basıldı | Kapalı |\n| Kapalı | kart sallandı | Kapalı (hiçbir şey olmaz) |\n\nSon satır önemlidir: bir olay her durumda etki etmez. Alarm kurulu değilken sallanmak bir şeyi değiştirmez.\n\n### Durumu iki değişkenle tutmak\nÜç durumu iki değişken yeter. kurulu ve alarm değişkenleri 0 ya da 1 olur:\n\n| Durum | kurulu | alarm |\n|---|---|---|\n| Kapalı | 0 | 0 |\n| Kurulu | 1 | 0 |\n| Çalıyor | 1 | 1 |\n\nSallanış başlığı önce \"kurulu = 1 mi?\" diye bakar; evetse alarm değişkenini 1 yapar. Başlığın kendisi sesi çalmaz, yalnızca durumu değiştirir. Sesi çalan ayrı bir görevdir.\n\n### Sürekli kontrol eden görev\n**sonsuza kadar** bloğu hiç bitmeyen bir döngüdür. İçine \"alarm = 1 ise ezgiyi çal\" koyarsan, alarm durumu 1 olduğu an ses başlar ve alarm 0 olana dek tekrarlanır. Alarm ezgisi 3,25 vuruştur. Tempo 120'de bir vuruş 500 ms olduğundan ezgi yaklaşık 1625 ms sürer. İçeride 200 ms'lik bekleme varsa bir tur yaklaşık 1825 ms eder, üstüne sistemin döngü başına eklediği küçük pay biner.\n\n### Kapatmak iki iş ister\nAlarmı kapatan başlık alarmı 0 yapmalı. Yalnızca sesi durdurmak yetmez, çünkü **sonsuza kadar** bir sonraki turda \"alarm = 1\" görür ve yeniden çalar. Kapatma başlığı kurulu ve alarm değişkenlerini sıfırlar, sesi durdurur ve kullanıcıya bir işaret verir.\n\n### Uzun basış neden iyi bir şifre?\nKazara A+B'ye bir saniyeden uzun basmak zordur. Gerçek alarmlar da yanlışlıkla kapanmasın diye böyle zor bir hareket ister.\n\n### Özet\nAlarm bir durum makinesidir: kapalı, kurulu, çalıyor. Durumu değişkenler tutar, olaylar durumu değiştirir. **sonsuza kadar** içindeki kontrol durumu sürekli izler. Kapatırken hem sesi hem durum değişkenini sıfırlamak gerekir.",
          "concepts": [
            {
              "term": "Durum makinesi",
              "definition": "Cihazın her an tek bir durumda olduğu ve olayların onu başka duruma geçirdiği düşünce biçimi.",
              "example": "Alarm: kapalı, kurulu, çalıyor. A kurar, sallanış çaldırır, A+B kapatır.",
              "pitfall": "Bir olayın her durumda etki edeceğini sanmak: kurulu değilken sallanış bir şey yapmaz."
            },
            {
              "term": "Durum değişkeni",
              "definition": "Cihazın durumunu 0 ya da 1 olarak hatırlayan değişken.",
              "example": "kurulu = 1 ve alarm = 1 olması \"çalıyor\" durumudur.",
              "pitfall": "Değişkenleri karıştırmak: sallanınca alarm 1 olur, kurulu değil."
            },
            {
              "term": "sonsuza kadar",
              "definition": "İçindeki blokları bitmeden tekrar tekrar çalıştıran döngü.",
              "example": "İçine \"alarm = 1 ise ezgiyi çal\" koyarsan alarm açıkken ses sürekli yinelenir.",
              "pitfall": "İçine bekle koymamak: kuru kafa yanıp sönmesi neredeyse görünmez olur."
            },
            {
              "term": "Uzun basış",
              "definition": "Bir düğmeye 1 saniyeden uzun basmak. Kazara yapılması zordur.",
              "example": "A+B'ye 1,2 saniye basılı tutunca alarm kapanır.",
              "pitfall": "Kısa basmak: uzun basış başlığı hiç çalışmaz."
            },
            {
              "term": "Tam kapatma",
              "definition": "Alarmı kapatırken sesi durdurmak ve durum değişkenlerini sıfırlamak.",
              "example": "Kapatma başlığı kurulu ve alarm değerini 0 yapar, sesi durdurur.",
              "pitfall": "Yalnız sesi durdurmak: alarm hâlâ 1 olduğundan sonsuza kadar ezgiyi yeniden başlatır."
            }
          ],
          "quiz": [
            {
              "id": "m10h6d28-q1",
              "kind": "mcq",
              "prompt": "Alarm kurulmamışken (kurulu = 0) kart sallanırsa ne olur?",
              "options": [
                "Alarm çalmaya başlar",
                "Hiçbir şey olmaz, çünkü sallanış başlığı önce kurulu = 1 mi diye bakar",
                "Kart otomatik kurulur",
                "Kart hata verir"
              ],
              "answer": 1,
              "explanation": "Sallanış başlığındaki eğer, kurulu = 1 olmasını bekler. kurulu 0 ise alarm değişkeni değişmez ve ses başlamaz. Alarmın çalması için önce A ile kurulması gerekir.",
              "skills": [
                "mk-state",
                "mk-conditions"
              ]
            },
            {
              "id": "m10h6d28-q2",
              "kind": "find-bug",
              "prompt": "A+B'ye uzun basınca ses duruyor ama bir süre sonra alarm yeniden çalıyor. Hata hangisi?\n\n```\ndüğme [A+B] uzun basılınca:\n  sesi durdur\n  simgeyi göster [mutlu yüz]\n\nsonsuza kadar:\n  eğer alarm = 1 ise:\n    simgeyi göster [kuru kafa]\n    ezgiyi çal [Alarm]\n    ekranı temizle\n    bekle 200 ms\n```",
              "options": [
                "alarm değişkeni 0 yapılmıyor; sonsuza kadar bir sonraki turda alarm = 1 görüp ezgiyi yeniden çalıyor",
                "Mutlu yüz yanlış simge",
                "Bekleme süresi çok kısa",
                "sonsuza kadar bloğu hiç kullanılmamalı"
              ],
              "answer": 0,
              "explanation": "Durum değişkenini sıfırlamadan kapatma yarım kalır. Kapatma başlığı alarm (ve kurulu) değerini 0 yapmalıdır. Diğer seçenekler alarmın yeniden çalmasına yol açmaz.",
              "skills": [
                "mk-debug",
                "mk-state"
              ]
            },
            {
              "id": "m10h6d28-q3",
              "kind": "predict-output",
              "prompt": "Aşağıdaki program çalışıyor. Olaylar sırayla gelir: sallan, A, sallan, A+B uzun, sallan. alarm değişkeni ne zaman 1'dir?\n\n```\nbaşlangıçta: kurulu = 0, alarm = 0\nA basılınca: kurulu = 1\nsallandığında: eğer kurulu = 1 ise alarm = 1\nA+B uzun basılınca: kurulu = 0, alarm = 0\n```",
              "options": [
                "Birinci sallanıştan itibaren sürekli",
                "Her sallanışta",
                "Yalnız ikinci sallanıştan A+B uzun basışa kadar",
                "Hiçbir zaman"
              ],
              "answer": 2,
              "explanation": "Birinci sallanışta kurulu 0 olduğundan alarm 0 kalır. A kurar, ikinci sallanış alarmı 1 yapar. A+B uzun basış ikisini 0 yapar. Üçüncü sallanış kurulu 0 olduğu için etkisizdir.",
              "skills": [
                "mk-state",
                "mk-events"
              ]
            },
            {
              "id": "m10h6d28-q4",
              "kind": "numeric",
              "prompt": "Alarm ezgisi 3,25 vuruştur ve tempo 120'dir (bir vuruş 500 ms). Sonsuza kadar içinde ezgiden sonra 200 ms bekleniyor. Sistemin küçük döngü payını sayma. Bir tur kaç ms sürer?",
              "answer": 1825,
              "unit": "ms",
              "explanation": "3,25 x 500 = 1625 ms ezgi. Üstüne 200 ms bekleme eklenince 1825 ms olur. Sanal kartta ölçülen tur 1845 ms çıkar; aradaki 20 ms sistemin her tur sonunda eklediği paydır.",
              "skills": [
                "mk-concurrency"
              ]
            },
            {
              "id": "m10h6d28-q5",
              "kind": "mcq",
              "prompt": "Alarm iki değişkenle tutuluyor: kurulu ve alarm. kurulu = 1 ve alarm = 1 hangi durumdur?",
              "options": [
                "Kapalı",
                "Kurulu ama çalmıyor",
                "Böyle bir durum olmamalı",
                "Çalıyor"
              ],
              "answer": 3,
              "explanation": "Alarm yalnızca kurulu iken 1 olur. İkisi de 1 ise cihaz çalıyordur. Kapalı durumda ikisi 0, kurulu durumda kurulu 1 ve alarm 0'dır.",
              "skills": [
                "mk-state",
                "mk-variables"
              ]
            }
          ]
        },
        {
          "title": "Nem ve sıcaklık istasyonu",
          "durationMin": 30,
          "problem": "Evdeki saksı çiçeğin ne zaman susadığını nereden anlarsın? Toprağa parmağını batırırsın. Ama sen evde yokken? İşte bir istasyon tam bunun için: sıcaklığı ve toprağın ne kadar nemli olduğunu ölçer, toprak kuruyunca seni uyarır. Bu derste kendi küçük hava ve saksı istasyonunu kuracaksın.",
          "contentMd": "### Sensörler\nKartta doğrudan nem sensörü yoktur. Biz **P1** pinine sanal bir **toprak nemi sensörü** bağlı sayacağız. Sağ paneldeki **Pinler** bölümünü aç; **P1** satırında bir **Giriş** kaydırıcısı var. Bu kaydırıcı sensörün okuduğu sayıyı belirler: **0 çok kuru, 1023 çok ıslak** kabul edeceğiz. Gerçek bir sensörde değerler sensöre göre farklı çıkar; o yüzden gerçek bir sensörü kullanırken önce kalibre etmek gerekir.\n\nSıcaklık için kartın kendi **sıcaklık (°C)** sensörü var. **Pusula ve sensörler** bölümündeki **Sıcaklık** kaydırıcısıyla değerini değiştirirsin.\n\n### 0-1023'ü yüzdeye çevirmek\nOkunan sayı 0-1023 arasındadır; biz **yüzde** (0-100) görmek isteriz. **Matematik** kategorisindeki **eşle** bloğu bunu yapar:\n\n**[P1 analog oku (0-1023)] değerini [0]-[1023] aralığından [0]-[100] aralığına eşle**\n\nÖrnekler: 0 → %0, 512 → %50, 1023 → %100.\n\n### Yeni bloklar\n- **Pinler** kategorisinde **[P1] analog oku (0-1023)** bloğu pinin giriş değerini sayı olarak verir.\n- **LED** kategorisindeki **çubuk grafik [3] / en çok [5]** bloğu bir değeri en çok değere göre LED'lerle gösterir. LED'ler aşağıdan yukarı dolar. Değer **50**, en çok **100** ise 25 LED'in yarısı (yuvarlanınca 13'ü) yanar.\n- **Temel** kategorisindeki **konsola yaz [merhaba]** bloğu bir değeri kartın konsoluna yazar. Konsol, sağ paneldeki **Konsol** bölümünde görünür.\n\n### Adım adım\nEditörde **başlangıçta**, üç düğme başlığı (**A**, **B**, **A+B**) ve **her [2000] ms'de** hazır.\n\n1. **Değişken** kategorisinde **nem** değişkenini oluştur. **başlangıçta** içine **nem değerini [0] yap** koy.\n2. **düğme [A] [basılınca]** içine **sayıyı göster** koy; sayı olarak **Giriş** kategorisinden **sıcaklık (°C)** tak.\n3. **düğme [B] [basılınca]** içine **sayıyı göster** koy; sayı olarak yukarıdaki **eşle** bloğunu tak (**[P1] analog oku (0-1023)** değeri 0-1023'ten 0-100'e).\n4. **düğme [A+B] [basılınca]** içine **çubuk grafik [...] / en çok [100]** koy. Değer olarak aynı **eşle** bloğunu (kopyalayabilirsin) tak.\n5. **her [2000] ms'de** içine sırayla:\n   - **nem değerini [...] yap**; değer olarak **eşle** bloğunu tak.\n   - **konsola yaz [nem]**\n   - **eğer ... ise**: koşul **nem** **<** **30**. İçine **simgeyi göster [üzgün yüz]** ve **ezgiyi çal [Üzgün]**.\n6. Hazırlık: **Sıcaklık** kaydırıcısını 27 yap, **P1 Giriş** kaydırıcısını yaklaşık 512'ye getir.\n7. ▶ **Çalıştır**. **A**, **B** ve **A+B**'ye sırayla bas. Sonra **P1** kaydırıcısını 100'e çek ve birkaç saniye bekle.\n\n### Beklenen sonuç\n**A** 27'yi, **B** 50'yi kaydırır. **A+B** yarı dolu bir çubuk grafik (13 LED) gösterir. Konsol bölümünde iki saniyede bir nem değeri belirir. **P1**'i 100'e çekince nem yaklaşık %10 olur: üzgün yüz ve **Üzgün** ezgisi (3 saniye) başlar. Yedi hedefin hepsinde ✓ olmalı.\n\n**Not:** Program ilk çalıştığında **P1** kaydırıcısı 0'dır. Yani nem %0'dır ve ilk iki saniyenin sonunda hemen üzgün yüz çıkar. Bu bir hata değil; toprak kuru kabul edildi. Kaydırıcıyı yukarı çekince normale döner.\n\n### Nasıl çalışıyor?\n- **her [2000] ms'de** iki saniyede bir nemi okur, konsola yazar ve toprak kuruysa uyarır.\n- **nem < 30** uyarı eşiğidir. Eşik gerçek bir bitkiye göre değişir; her bitki için ayrı seçilir.\n- **A**, **B** ve **A+B** istediğin zaman anlık değer görmek içindir. İstasyon yine arka planda çalışmaya devam eder.\n- **eşle** bloğu sonucu en yakın tam sayıya yuvarlar. Bu yüzden 512 değeri %50 olur (50,05).\n\n### Dene\n1. Eşiği 30 yerine 20 yap. Hangi **P1** değerinde uyarı başlıyor?\n2. Işığı da ölç: **düğme [A+B] [uzun basılınca]** ışık seviyesini göstersin. Karanlıkta (ışık 50'nin altı) bitkinin \"uyumak\" istediğini düşün: **simgeyi göster [uyuyan yüz]**.\n3. Konsola yalnız nem değil, sıcaklığı da yaz: ikinci bir **konsola yaz** bloğu ekle.\n4. Isı yüksek (35 °C'nin üstü) ve nem düşükse (30'un altı) farklı bir uyarı çal. İki koşulu birleştirmek için **Mantık** kategorisinde **ve** bloğunu kullan.\n\n### Sık yapılan hatalar\n- **Aralıkları yanlış yazmak.** Giriş aralığı **0-1023**, çıkış aralığı **0-100** olmalı. 1023'ü 100'e eşlerken tersini yazarsan sonuçlar ters çıkar.\n- **Eşik karşılaştırmasında yanlış işaret.** **nem < 30** kuruluktur; **>** yazarsan ıslakken uyarır.\n- **Her turda ezgi çalmak.** Üzgün ezgi 3 saniye sürer. Uyarı sıklığını ve ezgiyi ona göre ayarla.\n- **Sıcaklık ile nemi karıştırmak.** Sıcaklık kartın kendi sensöründen, nem **P1** pininden gelir. İkisinin kaydırıcısı farklı bölümlerdedir.",
          "question": "Bir saksı için eşik 30 olsa, bir kaktüs için ne olurdu? Eşiği her bitkiye göre değiştirmek için programı nasıl daha esnek yapardın? Gerçek bir sensör sana gelişigüzel sayılar verse ne yapardın?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Bir sensörün verdiği ham sayıyı (0-1023) yüzdeye çevirmeyi\n- **eşle** bloğunun giriş ve çıkış aralıklarını doğru yazmayı\n- Bir eşiğe göre uyarı vermeyi\n- **çubuk grafik** ve konsolla bir değeri göstermeyi ve kaydetmeyi\n\n### Önceden bilmen gerekenler\n- 7. ders: değişkenler\n- 8. ders: **eğer ... ise**\n- 12. ders: sıcaklık, ışık ve **çubuk grafik** bloğu\n- 18. ders: **ezgiyi çal** bloğu\n\n### Ham sayı yüzde değildir\nPinden gelen analog değer 0 ile 1023 arasındadır. Biz toprağın \"yüzde kaç nemli\" olduğunu görmek isteriz. Bu sayıyı 0-100 aralığına taşıyan işleme **eşleme** denir. Mantık orantıdır: giriş aralığının neresindeysen, çıkış aralığının aynı yerine gidersin.\n\n| P1 giriş | Orantı (giriş / 1023) | Yüzde (yuvarlanmış) |\n|---|---|---|\n| 0 | 0 | 0 |\n| 256 | 0,25 | 25 |\n| 512 | 0,5 | 50 |\n| 1023 | 1 | 100 |\n\n**eşle** bloğu sonucu en yakın tam sayıya yuvarlar. 512 için 50,05 bulur ve 50 yazar.\n\n### Aralıkları doğru sırayla yaz\nBlok dört sayı ister: giriş en az, giriş en çok, çıkış en az, çıkış en çok. Sensör 0-1023 verdiği için ilk ikisi 0 ve 1023, istediğin 0-100 olduğu için son ikisi 0 ve 100 olmalıdır. Sırayı karıştırırsan 512 değeri 0-100 aralığından 0-1023'e taşınır ve 5238 gibi anlamsız bir sayı çıkar.\n\n### Eşik ve uyarı\nNem 30'un altına düşünce bitki susamıştır. 30 değerine **eşik** denir. Eşiğe karşılık gelen ham değer yaklaşık 307'dir; ama yuvarlama yüzünden 301 okunduğunda yüzde 29 çıkar ve uyarı başlar, 302'de yüzde 30 çıkar ve uyarı susar. Eşik her bitkiye göre değişir: kaktüs için 10, fidan için 40 daha uygun olabilir.\n\n### Çubuk grafik ve konsol\n**çubuk grafik [değer] / en çok [100]** bloğu 25 LED'den kaçının yanacağını hesaplar: değer / en çok x 25, sonra yuvarlanır. Nem 50, en çok 100 ise 12,5 çıkar ve 13 LED yanar. En çok değeri yanlış girersen grafik anlamsızlaşır. **konsola yaz** bloğu ise değerleri kayıt olarak saklar; ekran silinse bile konsolda görürsün.\n\n### Her sensör kendi kaydırıcısından\nSıcaklık kartın kendi sensöründen gelir. Nem ise P1 pinine bağlı sanal sensörden. İkisini birbirine karıştırmamak gerekir. Gerçek bir sensörde 0-1023 aralığı sensöre göre farklı çıkabilir; bu yüzden gerçek sensör önce kalibre edilir.\n\n### Özet\nHam sensör değeri **eşle** ile yüzdeye çevrilir. Aralıkları doğru sırayla yazmak şarttır. Eşik bir uyarı sınırıdır. **çubuk grafik** değeri en çok değere göre LED'lerle gösterir, **konsola yaz** kayıt tutar.",
          "concepts": [
            {
              "term": "Analog değer",
              "definition": "Pinden okunan 0 ile 1023 arasındaki ham sayı.",
              "example": "P1 giriş kaydırıcısı 512 ise analog oku bloğu 512 verir.",
              "pitfall": "Bu sayıyı doğrudan yüzde sanmak: 512 yüzde 512 değildir."
            },
            {
              "term": "eşle",
              "definition": "Bir değeri bir aralıktan başka aralığa orantılı taşıyan ve en yakın tam sayıya yuvarlayan blok.",
              "example": "Okunan 512'yi 0-1023 aralığından 0-100'e eşlersen 50 çıkar.",
              "pitfall": "Aralıkları ters yazmak: 512 değeri 5238 gibi anlamsız bir sonuç verir."
            },
            {
              "term": "Eşik",
              "definition": "Uyarı vermek için seçilen sınır sayı.",
              "example": "nem < 30 olunca saksı susamış sayılır.",
              "pitfall": "Yanlış işaret kullanmak: nem > 30 yazarsan ıslakken uyarır."
            },
            {
              "term": "çubuk grafik",
              "definition": "Bir değeri en çok değere göre 25 LED'in kaçının yanacağıyla gösteren blok.",
              "example": "çubuk grafik [50] / en çok [100] 13 LED yakar.",
              "pitfall": "En çok değeri yanlış girmek: ölçek bozulur, çubuk yanlış dolu görünür."
            },
            {
              "term": "Kalibrasyon",
              "definition": "Gerçek bir sensörün okuduğu sayıları bilinen durumlarla karşılaştırıp ayar yapmak.",
              "example": "Kuru ve ıslak toprakta okunan iki sayı, eşleme aralığını belirler.",
              "pitfall": "Her sensörün 0-1023'ün tamamını kullandığını sanmak: gerçek sensörlerin aralığı farklı olabilir."
            }
          ],
          "quiz": [
            {
              "id": "m10h6d29-q1",
              "kind": "numeric",
              "prompt": "P1 giriş kaydırıcısı 256. Okunan değer 0-1023 aralığından 0-100 aralığına eşleniyor. Sonuç kaçtır?",
              "answer": 25,
              "unit": "%",
              "explanation": "256 / 1023 yaklaşık 0,25 olur ve 100 ile çarpınca 25,02 çıkar; eşle bloğu yuvarlar: 25. Sonucu 256 olarak bırakmak eşlemeyi unutmak olurdu.",
              "skills": [
                "mk-sensors"
              ]
            },
            {
              "id": "m10h6d29-q2",
              "kind": "predict-output",
              "prompt": "P1 giriş değeri 512. Aşağıdaki blok ekranda ne gösterir?\n\n```\nsayıyı göster:\n  [P1 analog oku] değerini\n  [0]-[100] aralığından\n  [0]-[1023] aralığına eşle\n```",
              "options": [
                "50",
                "512",
                "5238",
                "0"
              ],
              "answer": 2,
              "explanation": "Aralıklar ters yazılmış: giriş 0-100, çıkış 0-1023 sayılıyor. 512 x 1023 / 100 = 5237,76 olur ve yuvarlanınca 5238 çıkar. Doğru yazım 0-1023 aralığından 0-100 aralığına olmalıydı (sonuç 50).",
              "skills": [
                "mk-sensors",
                "mk-debug"
              ]
            },
            {
              "id": "m10h6d29-q3",
              "kind": "numeric",
              "prompt": "Uyarı koşulu nem < 30 ve nem, P1 değerinin 0-1023'ten 0-100'e eşlenmiş hâli. Uyarının hâlâ başladığı en büyük P1 tam sayı değeri kaçtır?",
              "answer": 301,
              "explanation": "301 değeri 29,42 verir ve yuvarlanınca 29 olur: uyarı var. 302 değeri 29,52 verir ve yuvarlanınca 30 olur: 30 < 30 yanlış, uyarı yok. Yuvarlama yüzünden sınır 306,9 değil 301'dir.",
              "skills": [
                "mk-sensors",
                "mk-conditions"
              ]
            },
            {
              "id": "m10h6d29-q4",
              "kind": "numeric",
              "prompt": "çubuk grafik [70] / en çok [200] kaç LED yakar? (25 LED'in oranı, en yakın tam sayıya yuvarlanır.)",
              "answer": 9,
              "unit": "LED",
              "explanation": "70 / 200 = 0,35 ve 0,35 x 25 = 8,75 olur; en yakın tam sayı 9'dur. 8 (aşağı yuvarlama) ya da 35 (yüzde) yanlış olurdu.",
              "skills": [
                "mk-display"
              ]
            },
            {
              "id": "m10h6d29-q5",
              "kind": "mcq",
              "prompt": "Gerçek bir toprak nemi sensörü eşleme için neden önce kalibre edilir?",
              "options": [
                "Sensörler kalibre edilmeden hiç çalışmaz",
                "Gerçek sensörlerin okuduğu en küçük ve en büyük sayılar sensöre göre değişir; aralığı ölçmeden eşleme yanlış yüzde verir",
                "Kalibrasyon sensörün hızını artırır",
                "Yüzde değeri yalnız kalibrasyonla yazılabilir"
              ],
              "answer": 1,
              "explanation": "Her sensör kuru ve ıslakta farklı sayılar verebilir. Bu iki sayı ölçülürse eşleme doğru yüzdeyi verir. Sensör kalibrasyonsuz da bir sayı üretir; sorun o sayının anlamıdır.",
              "skills": [
                "mk-sensors"
              ]
            }
          ]
        },
        {
          "title": "Proje: Akıllı saksı (final)",
          "durationMin": 40,
          "problem": "Hepsini birleştirme zamanı. Bu modülde LED'leri yakmayı, düğmeleri dinlemeyi, sensörleri okumayı, müzik çalmayı ve radyoyla konuşmayı öğrendin. Şimdi hepsini aynı projede kullanacaksın: iki akıllı saksı, birbirinin durumunu radyoyla izliyor. Birinin toprağı kuruyunca öteki saksı bunu görüp alarm veriyor.",
          "contentMd": "### Proje: Akıllı saksı\nİki kart, iki sanal saksıdır. Her kartın **P1** pinine bir toprak nemi sensörü bağlı sayılır (Pinler bölümündeki **Giriş** kaydırıcısı, 0 kuru, 1023 ıslak). İki kart da aynı programı çalıştırır.\n\n**Hedefler:**\n- Kart iki saniyede bir kendi nemini yüzde olarak ölçsün ve radyoyla **nem** adıyla göndersin.\n- Mesajı alan kart nem 30'un altındaysa üzgün yüz göstersin ve üzgün ezgi çalsın.\n- Nem 30 ya da üstündeyse alan kart nemi çubuk grafikle göstersin.\n- **A** düğmesi kartın kendi nemini göstersin.\n\n### Hangi ders hangi parçayı veriyor?\n| Parça | Nerede öğrendin |\n|---|---|\n| **her [2000] ms'de**, değişkenler, **eğer** | önceki haftalar |\n| **eşle** ile 0-1023'ü yüzdeye çevirmek | 29. ders |\n| **çubuk grafik** | 29. ders |\n| **radyo grubu**, **radyoyla [ad] = [değer] gönder**, **alınan [ad]**, **alınan [değer]** | 22. ders |\n| **ezgiyi çal [Üzgün]**, **simgeyi göster [üzgün yüz]** | 18. ders ve ilk hafta |\n\n### Planını çiz\nÖnce kâğıda ya da aklına bir akış çiz:\n\n1. **Başlangıç:** radyo grubu 7, **nem** değişkeni 0.\n2. **Her 2 saniyede:** nemi ölç, radyoyla **nem = değer** gönder.\n3. **A:** nemi ölç ve ekranda göster.\n4. **Mesaj alınınca:** adı **nem** ise değeri **uzak** değişkenine koy. 30'dan küçükse üzgün yüz ve ezgi; değilse çubuk grafik.\n\n### Adım adım\nEditörde **başlangıçta**, **her [2000] ms'de**, **düğme [A] [basılınca]** ve **radyo mesajı alınınca** hazır.\n\n1. **Değişken** kategorisinde **nem** ve **uzak** değişkenlerini oluştur.\n2. **başlangıçta** içine **radyo grubunu [7] yap** ve **nem değerini [0] yap** koy.\n3. **her [2000] ms'de** içine **nem değerini [...] yap**; değer olarak **eşle** bloğu: **[P1 analog oku (0-1023)] değerini [0]-[1023] aralığından [0]-[100] aralığına eşle**. Altına **radyoyla [nem] = [...] gönder** koy; adı **nem**, değer olarak **nem** değişkeni.\n4. **düğme [A] [basılınca]** içine **nem değerini [...] yap** (aynı eşle bloğu) ve **sayıyı göster [nem]** koy.\n5. **radyo mesajı alınınca** içine **eğer ... ise** koy. Koşul: **alınan [ad]** **=** **nem**. İçine sırayla:\n   - **uzak değerini [...] yap**; değer olarak **alınan [değer]**\n   - **eğer ... ise ... değilse**. Koşul: **uzak** **<** **30**. **ise**: **simgeyi göster [üzgün yüz]** ve **ezgiyi çal [Üzgün]**. **değilse**: **çubuk grafik [uzak] / en çok [100]**.\n6. Hazırlık: sağ panelde **Kart 1** sekmesini seç ve **Pinler** bölümünde **P1 Giriş**'i yaklaşık 512 yap. **Kart 2** sekmesini seç ve **P1 Giriş**'i 100 yap.\n7. ▶ **Çalıştır**. Birkaç saniye bekle. Kart 1'in **A** düğmesine bas.\n\n### Beklenen sonuç\nKart 1'in nemi %50, Kart 2'nin nemi %10'dur. Kart 2, Kart 1'den **nem = 50** mesajı alınca yarısı dolu bir çubuk grafik gösterir (13 LED). Kart 1, Kart 2'den **nem = 10** mesajını alınca üzgün yüz gösterir ve **Üzgün** ezgisi çalar (3 saniye). **A** düğmesi Kart 1'de **50** sayısını gösterir. Altı hedefin hepsinde ✓ olmalı.\n\n### Nasıl çalışıyor?\n- Her kart iki saniyede bir kendi nemini yollar. Mesajı alan taraf, **nem** adını görünce değeri **uzak** değişkenine koyar.\n- Bir kart kendi mesajını almaz. Bu yüzden her kart yalnız **öteki** saksının durumunu görür.\n- Üzgün ezgi 3 saniye sürer ve iki saniyelik mesajlardan uzundur. Ezgi bitene kadar başlık meşgul olur; aynı başlık için en çok 3 mesaj sırada bekler.\n- Kartlar aynı programı çalıştırdığı için programı bir kez değiştirmen yeterlidir. ▶ düğmesine basınca iki kart da yeni programı çalıştırır.\n\n### Dene\n1. **B** düğmesi sıcaklığı göstersin; sıcaklık 35 °C'nin üstündeyse ekranda **şaşkın yüz** olsun.\n2. Radyo grubunu bir kartta farklı yapamazsın (program aynı), ama Radyo bölümündeki **Kart 2 grubu** seçicisinden 5 yapabilirsin. Kart 1'in mesajları Kart 2'ye ulaşıyor mu?\n3. Işığı da ölç: karanlıkta (ışık 50'nin altı) mesajı gönderme.\n4. Kendi eşiğini seç ve bunu bir değişkene (**esik**) koy; programın bir yerinde değiştirmen yeterli olsun.\n\n### Sık yapılan hatalar\n- **Mesajın adını farklı yazmak.** Gönderen **nem**, alan **Nem** yazarsa eşit çıkmaz. Harfi harfine aynı yaz.\n- **Alan kartta nemi yeniden ölçmek.** Mesaj gelince **alınan [değer]** kullan. Kendi P1'inden okursan öteki saksının durumunu değil kendi durumunu görürsün.\n- **Çubuk grafiğin en çok değerini 1023 bırakmak.** Nem artık yüzde olduğu için **100** olmalı.\n- **Değişkenleri başlangıçta ayarlamamak.** İlk mesajdan önce **uzak** boş kalmasın.\n\n### Kendini değerlendir\n- Bu projede en çok hangi blok grubunu kullandın?\n- Hangi parçada takıldın? Nasıl çözdün?\n- Programı bir arkadaşına açıklasan hangi üç cümleyi söylerdin?",
          "question": "Bu projede yaptığın en güzel şey neydi? Bir sonraki Mikro Kart projen ne olurdu: bir oyun mu, bir ev alarmı mı, yoksa bir müzik aleti mi? Kimle paylaşırdın?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Bir projeyi kodlamadan önce akış olarak planlamayı\n- İki kartın radyoyla birbirinin ölçümünü izlemesini kurmayı\n- Alınan mesajda **kendi** ölçümünü değil **gelen** değeri kullanmayı\n- Önceki haftalarda öğrendiğin parçaları tek programda birleştirmeyi\n\n### Önceden bilmen gerekenler\n- 7. ders: değişkenler\n- 8. ders: **eğer ... ise ... değilse**\n- 12. ders: **çubuk grafik**\n- 18. ders: **ezgiyi çal**\n- 21. ve 22. dersler: radyo grubu, **radyoyla [ad] = [değer] gönder**, **alınan [ad]**, **alınan [değer]**\n- 29. ders: **eşle** ve nem eşiği\n\n### Önce plan\nBüyük bir projeye bloklarla başlamak yerine akışı kâğıda yaz. Bu projede dört iş var:\n\n| Başlık | Ne zaman çalışır? | Ne yapar? |\n|---|---|---|\n| başlangıçta | bir kez | radyo grubunu ve değişkenleri ayarlar |\n| her 2000 ms'de | iki saniyede bir | nemi ölçer, radyoyla yollar |\n| düğme A | A'ya basınca | kendi nemini gösterir |\n| radyo mesajı alınınca | mesaj gelince | öteki saksının durumunu gösterir |\n\nPlanın her satırı tek bir başlıktır. Planı yaptıysan geri kalan iş bloğu yerine koymaktır.\n\n### Gönderen ve alan\nİki kart aynı programı çalıştırır. Her kart hem gönderir hem alır. Bir kart kendi mesajını almaz; yalnızca öteki kartın mesajı ona gelir. Bu yüzden alan kartta ölçüm yapmamalısın. Mesaj gelince **alınan [değer]** bloğunu kullan; o, öteki saksının nemidir. Alan kart kendi P1'ini okursa kendi nemini gösterir ve proje amacına ulaşmaz.\n\n### Ad eşleşmeli\nGönderen \"nem\" adıyla yollar, alan da \"nem\" adını arar. Büyük küçük harf fark eder; \"Nem\" ile \"nem\" farklı sayılır. Birden fazla ad kullanılan projelerde bu kontrol yanlış mesajı ayıklar.\n\n### Zamanlama\nMesajlar her 2 saniyede bir gelir. Üzgün ezgi 3 saniye sürer. Başlık ezgi süresince meşguldür; gelen mesajlardan en çok 3 tanesi sırada bekler. Bunu bilmek, neden bazı mesajların ekrana hemen yansımadığını anlamanı sağlar.\n\nKart 1'in nemi 50 ve en çok 100 ise çubuk grafik 13 LED yakar. En çok değer 1023 kalsaydı 50 / 1023 x 25 = 1,2 çıkar ve yalnızca 1 LED yanardı; yani en çok değer, ölçeği belirleyen sayıdır.\n\n### Özet\nİyi proje önce plandır. Her başlık tek bir işi yapar. Radyoda alan taraf gelen değeri kullanır, kendi sensörünü değil. Mesaj adları birebir eşleşmelidir. Ezgi gibi uzun işler gelen mesajların sıraya girmesine yol açar. Çubuk grafiğin en çok değeri ölçüm aralığına uymalıdır.",
          "concepts": [
            {
              "term": "Akış planı",
              "definition": "Kodlamadan önce hangi başlığın ne zaman çalışıp ne yaptığını yazan liste.",
              "example": "Her 2 saniyede ölç ve gönder; A: göster; mesaj gelince: tepki ver.",
              "pitfall": "Plansız başlamak: bloklar yanlış başlığa gider."
            },
            {
              "term": "Radyo grubu",
              "definition": "Kartların aynı numaralı grupta olması gerekir; yalnızca aynı gruptaki kartlar birbirini duyar.",
              "example": "İki kart da radyo grubunu 7 yapar.",
              "pitfall": "Farklı gruplarda kalmak: mesajlar hiç ulaşmaz."
            },
            {
              "term": "Gönderen ve alan",
              "definition": "Gönderen kendi ölçümünü yollar; alan, gelen değeri kullanır.",
              "example": "Alan kartta uzak değişkenine alınan değer konur.",
              "pitfall": "Alan kartta kendi P1'ini okumak: öteki saksıyı değil kendini görürsün."
            },
            {
              "term": "Mesaj adı",
              "definition": "Radyo mesajının ad = değer çiftindeki ad.",
              "example": "Gönderen \"nem\" yollar, alan alınan ad = \"nem\" diye bakar.",
              "pitfall": "Büyük küçük harf farkı: \"Nem\" ile \"nem\" eşit sayılmaz."
            },
            {
              "term": "Ölçeği belirleyen en çok değer",
              "definition": "çubuk grafiğin en çok değeri, ölçüm aralığına uymalıdır.",
              "example": "Nem yüzde olduğu için en çok değer 100'dür.",
              "pitfall": "En çok değeri 1023 bırakmak: nem 50 iken yalnız 1 LED yanar."
            }
          ],
          "quiz": [
            {
              "id": "m10h6d30-q1",
              "kind": "mcq",
              "prompt": "İki kart aynı grupta ve aynı programı çalıştırıyor. Kart 1 bir mesaj gönderince kim alır?",
              "options": [
                "Yalnız Kart 2 alır",
                "Kart 1 ve Kart 2 alır",
                "Kimse almaz",
                "Gruptaki bütün kartlar ve gönderen alır"
              ],
              "answer": 0,
              "explanation": "Kart kendi mesajını almaz; mesaj yalnız öteki karta gider. Bu yüzden her kart öteki saksının durumunu görür.",
              "skills": [
                "mk-radio"
              ]
            },
            {
              "id": "m10h6d30-q2",
              "kind": "find-bug",
              "prompt": "Alan kart öteki saksı kuru olsa da üzgün yüz göstermiyor, çünkü kendi P1 giriş değeri yüksek. Hata hangisi?\n\n```\nradyo mesajı alınınca:\n  eğer alınan ad = \"nem\" ise:\n    uzak değerini ([P1 analog oku] 0-1023 -> 0-100) yap\n    eğer uzak < 30 ise:\n      simgeyi göster [üzgün yüz]\n```",
              "options": [
                "Eşik 30 değil 300 olmalı",
                "uzak değeri alınan değerden değil, alan kartın kendi P1 pininden okunuyor",
                "Üzgün yüz simgesi yok",
                "alınan ad yerine alınan değer yazılmalı"
              ],
              "answer": 1,
              "explanation": "Mesaj gelince alınan [değer] bloğu kullanılır; o öteki saksının nemidir. P1'i okumak alan kartın kendi nemini verir. Eşik ve simge doğru.",
              "skills": [
                "mk-radio",
                "mk-debug"
              ]
            },
            {
              "id": "m10h6d30-q3",
              "kind": "numeric",
              "prompt": "Kart 2'nin P1 giriş kaydırıcısı 150. Kart 2, 0-1023'ü 0-100'e eşleyip nemi radyoyla yolluyor. Kart 1 hangi nem değerini alır?",
              "answer": 15,
              "unit": "%",
              "explanation": "150 x 100 / 1023 = 14,66 olur ve yuvarlanınca 15 çıkar. Aşağı yuvarlayıp 14 yazmak ya da 150 yazmak yanlış olurdu.",
              "skills": [
                "mk-sensors",
                "mk-radio"
              ]
            },
            {
              "id": "m10h6d30-q4",
              "kind": "predict-output",
              "prompt": "Alan kart bu programı çalıştırıyor. Sırayla gelen mesajlar: nem = 50, nem = 28, sicak = 12, nem = 30. Üzgün yüz kaç kez gösterilir?\n\n```\nradyo mesajı alınınca:\n  eğer alınan ad = \"nem\" ise:\n    uzak değerini (alınan değer) yap\n    eğer uzak < 30 ise:\n      üzgün yüz ve Üzgün ezgisi\n    değilse:\n      çubuk grafik [uzak] / en çok [100]\n```",
              "options": [
                "0 kez",
                "1 kez",
                "2 kez",
                "3 kez"
              ],
              "answer": 1,
              "explanation": "Yalnız nem = 28 hem adı eşleştirir hem 30'un altındadır. nem = 30 için 30 < 30 yanlıştır, bu yüzden değilse koluna (çubuk grafik) gider; sicak = 12 adı eşleşmediği için hiç işlenmez.",
              "skills": [
                "mk-radio",
                "mk-conditions"
              ]
            },
            {
              "id": "m10h6d30-q5",
              "kind": "numeric",
              "prompt": "Nem yüzde olarak 50 ama çubuk grafiğin en çok değeri yanlışlıkla 1023 bırakılmış. Kaç LED yanar?",
              "answer": 1,
              "unit": "LED",
              "explanation": "50 / 1023 x 25 = 1,22 olur ve yuvarlanınca 1 LED yanar. En çok değer 100 olsaydı 13 LED yanardı. Ölçek, ölçülen aralığa uymalı.",
              "skills": [
                "mk-display",
                "mk-debug"
              ]
            }
          ]
        }
      ]
    }
  ]
}
