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
      "guideMdEn": "### Goals for the week\nBy the end of this week the learner can:\n1. Name the parts of the Micro Card (the 25-LED screen, the A and B buttons, the logo, P0-P2) and say what a virtual card is.\n2. Attach blocks to a header block (on start, forever) in the block editor and run them with ▶; explain that blocks run from top to bottom, in order.\n3. Light up single LEDs using the (x, y) address of the LEDs, counting from 0 and the logic of clearing the screen and pausing.\n4. Show ready-made icons and a 5 x 5 pattern they drew themselves; make an animation by putting a pause between two drawings.\n5. Build a project with a rhythm (Beating heart) using the repeat block and pause times; work out the total time of a loop.\n\n### Plan for the week\nThe week has five lessons; each lesson takes about 15-30 minutes. The plan below is for one lesson a day.\n\n| Day | Lesson | Time | What you do |\n|---|---|---|---|\n| 1 | Hello, Micro Card | ~15 min | Read the explainer, get to know the parts of the card, show text and a number, do the mini quiz. |\n| 2 | The address of the LEDs: x and y | ~20 min | Draw the diagonal line and the four corners, write the addresses on paper and check them. |\n| 3 | Icons and your own pattern | ~20 min | Show the faces, draw the robot head, put a pause between two drawings and make an animation. |\n| 4 | Order and repetition | ~20 min | Build the three blinks with repeat, change the numbers and times and try them out. |\n| 5 | Project: Beating heart | ~30 min | Write the plan in a table, build the heart, change the rhythm, assess it with the project rubric. |\n\n### Prerequisite check\nNo special prior knowledge is needed this week. Before you start, check these:\n- Does the Micro Card editor open in the browser, and does the ▶ button work?\n- Can the learner grab and drag a block with the mouse (or a finger)?\n- Can they count from 0 to 10 and do addition and multiplication? (This is needed for the time sums.)\n\n### Concept map\n- **Card:** LED screen (5 x 5 = 25) → buttons and logo → virtual card\n- **Program:** header block (on start, forever) → blocks from top to bottom → JavaScript and Python view (read-only)\n- **Screen:** text (scrolls) and a single character (stays) → LED address (x, y) → icon and pattern → clear screen\n- **Time:** pause (ms) → animation → repeat → round time and total time\n- **Project:** plan table → brightness (0-255) → rhythm\n\n### Common mistakes\n- **Leaving a block outside the header block.** It looks faded and never runs.\n- **Not pressing the ▶ button after a change.** The old program stays on the screen.\n- **Mixing up x and y, or counting from 1.** (4, 0) is the top right corner; the largest address is 4, not 5. An address outside the screen is ignored without an error.\n- **Not adding a pause.** With two drawings one after the other, only the last one is seen; something that is drawn and cleared straight away is not visible either.\n- **Forgetting to clear.** When blinking, the square never goes off.\n- **Attaching a block inside/outside repeat by mistake.** What is inside runs in every round; what is outside runs once.\n- **Putting the text inside forever.** It scrolls again in every round and spoils the heartbeat.\n- **Setting the brightness to 0 and thinking the program is broken.** The screen is dark, but the program is running.\n\n### End-of-week review\n1. Look at the concept cards of each lesson once more and read the \"common mistake\" lines out loud.\n2. Read the explanations of the questions you got wrong in the mini quizzes again, then do the question again.\n3. Build the program that lights up the four corners from scratch, without looking; then try lighting up the whole frame (16 LEDs).\n4. Write a pattern you drew yourself on paper with 1s and 0s, count how many LEDs are on and check it in the editor.\n5. Work out the round time of the beating heart and the number of rounds per minute; then change the pause times and explain how the speed changes.\n\nThe mini quizzes of the five lessons are enough as the end-of-week test; 5 questions in each lesson, 25 questions in total. Goal: at least 4 correct in each lesson. Go back to the explainer of any lesson that needs more work.\n\n### Project rubric (Beating heart)\n| Criterion | Developing | Secure | Advanced |\n|---|---|---|---|\n| Structure | Blocks are outside the header block, or the program does not run | The text is inside on start, the heart inside forever | It matches the plan table exactly, and the learner explains why the parts are separate |\n| Look | The heart or the small heart does not appear | The big and small hearts appear in turn, and the brightness is set | Chose the brightness on purpose and explains why |\n| Rhythm | There are no pauses, or they are too short | The lub-dub and the rest can be told apart | Makes a fast and a slow rhythm and works out the round time |\n| Debugging | Cannot find the cause when stuck | Finds the mistake by asking or looking | Finds the mistake on their own and explains how they found it |\n| Explaining | Cannot explain what they did | Explains the blocks in order | Finds and fixes the mistake in a friend's program |\n\n### Note for parents and teachers\n- **Aim.** This week is not about memorising; it is about the child getting used to thinking in blocks and seeing the result straight away. The card is virtual; making mistakes is safe, and ↺ resets it.\n- **How can you help?** Instead of giving the answer, ask: \"Which block runs first?\", \"Is this block attached to the on start block?\", \"Did you add a pause?\", \"Which address did you type, and where on the screen is it?\"\n- **Time.** Rather than doing the lessons back to back, one lesson a day with a short review helps learning stick. If the child is 8, work through the reading and the number work together.\n- **Screen time.** The lessons are short; taking breaks is better than long sessions.\n- **Progress.** The results of the mini quiz at the end of each lesson are shown by skill (draft/pilot feature; only saved if consent was given).",
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
          ],
          "contentEn": {
            "title": "Hello, Micro Card",
            "problem": "Imagine a computer small enough to fit in the palm of your hand. Its screen is made of only 25 tiny lights, yet it can write words, play songs and answer you. You will program this card with blocks. So how does a word fit on a screen of 25 lights?",
            "contentMd": "### Meet the virtual card\nIn this module you will work with the **virtual Micro Card**. The card lives entirely inside the computer; there are no wires, batteries or real parts. You use everything you see on the screen with the mouse or your finger.\n\nThe card has these parts:\n\n| Part | What does it do? |\n|---|---|\n| LED screen | 5 columns x 5 rows, 25 tiny lights in total |\n| A and B buttons | On the two sides of the card. They tell the program when you press them |\n| A+B button | For pressing both at the same time |\n| Logo (star) | A surface that tells the program when you touch it |\n| P0, P1, P2 | Three connection points at the bottom of the card (we will use them later) |\n\nTo the right of the card there is a control panel. There you change things like shaking, tilting, light and temperature yourself. We will use those in later lessons too.\n\n### Parts of the editor\n- **Top bar:** the ▶ **Run**, ■ **Stop** and ↺ **Reset** buttons are here. There are also **Start over** (takes the lesson back to how it started), **Export** and **Import**.\n- **Goals box:** the tasks for this lesson. Each time you complete a task, a ✓ appears in the box next to it.\n- **Block box:** the colourful categories on the left. In this lesson you will only use the **Basic** category.\n- **Tabs:** **Blocks**, **JavaScript**, **Python**. In the last two you see the written code of your blocks. You cannot change the text there; you can only read it.\n\n### Program: Hello\nThere is already an **on start** block on the screen. This block runs once when you start the program. Every program lives inside a header block like this one.\n\n1. Click the **Basic** category in the block box.\n2. Grab the **show text [Hello!]** block and drag it inside the **on start** block. When you let go, you will see it snap into place.\n3. Click the text in the block and type your own name. If you like, type Merhaba (Turkish for \"hello\"), as in the examples in this lesson.\n4. Take the **show number [0]** block from the **Basic** category and attach it right under the text block.\n5. Type 7 in the number box.\n6. Press the ▶ **Run** button.\n\n### Expected result\nThe text scrolls across the card's screen from right to left. A 7-letter word like \"Merhaba\" takes about 4 seconds. When the text ends, the screen goes dark, then the number 7 appears in the middle for about half a second. All three tasks in the Goals box should have a ✓.\n\n### How does it work?\n- Blocks run **from top to bottom**, in order.\n- The next block does not start until the scrolling text has finished. The card waits until the text is done.\n- A single letter or a one-digit number does not scroll. It stays in the middle of the screen for a short time. A two-digit number (for example 25) scrolls like text.\n- Look at the **JavaScript** tab: inside the `card.onStart(...)` line it says `screen.showText(\"Merhaba\")` and `screen.showNumber(7)`. This is the code form of your blocks. In the **Python** tab, the same program appears written in another language.\n\n### Try it\n1. Change the text and press ▶ again. How long did the scrolling take? Compare a long text with a short one.\n2. Type 25 in the number block. How is it different from a one-digit number?\n3. Put two **show text** blocks one under the other. Which one appears first?\n\n### Common mistakes\n- **Dropping the block outside on start.** A stack of blocks that is not attached to a header block does not run; it looks faded. Move the block inside on start.\n- **Not pressing ▶ after making a change.** A change you make while the program is running is not applied by itself. A note appears on the screen: \"Press ▶ to use your changes\".\n- **Expecting a result before the program has finished.** The number does not appear until the scrolling text is done. Wait a little.",
            "question": "The card's screen is only 5 columns wide. Are there other ways, apart from scrolling, to show a long text on a small screen? Why do you think we keep a single letter in the middle instead of scrolling it?",
            "explainerMd": "### What you will learn in this lesson\n- The parts of the Micro Card (LED screen, buttons, logo, connection points) and what they do\n- How a program is built in the block editor: a header block, blocks attached underneath, ▶ Run\n- That blocks run from top to bottom, in order\n- That text is shown by scrolling, while a single letter or a one-digit number stays in the middle\n\n### What you should know first\nNothing. This is the first lesson of the module. It is enough that you can grab an object with the mouse and drag it.\n\n### A small but complete computer\nThe Micro Card is a computer that fits in the palm of your hand. Its screen is made of 25 tiny lights (**LEDs**); these lights form a grid of 5 columns and 5 rows. There are **A** and **B** buttons on the two sides of the card and a **logo** surface in the middle. You will use the P0, P1 and P2 connection points at the bottom in later weeks. The card in this module is **virtual**: it runs inside the computer and needs no batteries or wires.\n\n### What is a program, what is a block?\nA computer only does what it is told. The written list of these instructions is called a **program**. In this module you build the program not by typing, but by snapping colourful **blocks** together. Each block does one job: \"show text\", \"pause\", \"clear screen\" and so on.\n\nThe **header block** decides where the blocks will run. The **on start** block is the part that runs once when you press the ▶ button. If a block is not attached to it, the card does not see it; it looks faded and does not run. You can think of it as a room without a door: you cannot get in.\n\n### Order is everything\nThe card runs the blocks **from top to bottom**, one by one. It does not move on to the next block until the current one has finished. The two stacks below are made of the same blocks, but their results are different:\n\n```\nStack A: text \"Hi\"  ->  number 7\nStack B: number 7  ->  text \"Hi\"\n```\n\nIn A, Hi scrolls first, then 7 appears. In B, 7 appears first, then Hi scrolls. That is why \"in which order\" matters as much as \"what to do\".\n\n### Text scrolls, a single character stays\nBecause the screen is only 5 columns wide, long text **scrolls** from right to left. While it scrolls, the card waits; the next block does not start until the text is done. A 7-letter word like \"Merhaba\" (Turkish for \"hello\") scrolls past in about 4 seconds. A single letter or a one-digit number fits on the screen and does not scroll; it stays in the middle for a little over half a second. A two-digit number (for example 25) is two characters, so it scrolls like text.\n\n### The hidden side of the code\nThe editor has **JavaScript** and **Python** tabs. They show the written code that matches your blocks. You cannot change the text there; you can only read it. The blocks and the written code are the same program; they just look different. Reading written code gets you ready to move on to programming by typing later.\n\n### Summary\nThe Micro Card is a virtual computer with 25 LEDs, two buttons and a logo. You build the program from blocks, and every stack of blocks must be attached to a header block. Blocks run from top to bottom, in order. Long text scrolls; a single character stays in the middle.",
            "concepts": [
              {
                "term": "LED screen",
                "definition": "The card's screen of 5 columns and 5 rows, with 25 tiny lights in total.",
                "example": "The heart icon is drawn by lighting up some of the 25 lights on the screen.",
                "pitfall": "Thinking the screen has hundreds of dots; there are only 25 lights, so long text does not fit and scrolls."
              },
              {
                "term": "Header block (on start)",
                "definition": "The block that decides where the program starts running; the blocks attached under it run once when you press ▶.",
                "example": "When you put the show text block inside the on start block, the text scrolls when you press ▶.",
                "pitfall": "Leaving a block outside the on start block: a block that is not attached looks faded and never runs."
              },
              {
                "term": "Order",
                "definition": "Blocks run from top to bottom, and the next one does not start before the current one has finished.",
                "example": "To show the text first and then the number, you put the text block above the number block.",
                "pitfall": "Putting the blocks in the wrong order and thinking \"the program is broken\"; most of the time only the order is wrong."
              },
              {
                "term": "Scrolling text",
                "definition": "Text that does not fit on the screen is shown by scrolling from right to left; a single character does not scroll, it stays in the middle for a short time.",
                "example": "\"Merhaba\" scrolls in about 4 seconds; the one-digit 7 stays in the middle, but 25 scrolls because it is two characters.",
                "pitfall": "Not waiting for the scrolling text to finish: the next block does not start until the text is done."
              },
              {
                "term": "Code tabs",
                "definition": "The JavaScript and Python tabs show the written code that matches your blocks, read-only.",
                "example": "In the JavaScript tab you see the line screen.showText(\"Merhaba\").",
                "pitfall": "Trying to change the code in the tabs; changes are made through the blocks."
              }
            ],
            "quiz": [
              {
                "id": "m10h1d1-q1",
                "kind": "mcq",
                "prompt": "A block is sitting on its own on the screen, not attached to the on start block. What happens when you press ▶?",
                "options": [
                  "The block still runs, because it is visible on the screen",
                  "The card shows an error and deletes the whole program",
                  "The block does not run; a block that is not attached to a header block looks faded",
                  "The block moves inside the on start block by itself"
                ],
                "answer": 2,
                "explanation": "Programs live inside a header block. A stack that is not attached to a header block does not run and looks faded. A block being on the screen does not mean it runs; the card does not show an error either, it simply does not see it.",
                "skills": [
                  "mk-flow",
                  "mk-card"
                ]
              },
              {
                "id": "m10h1d1-q2",
                "kind": "predict-output",
                "prompt": "Below is how this program looks in the JavaScript tab. What happens on the screen when you run it with ▶?\n\n```\ncard.onStart(() => {\n  screen.showNumber(7);\n  screen.showText(\"Merhaba\");\n});\n```",
                "options": [
                  "First 7 stays in the middle for a short time, then Merhaba scrolls",
                  "First Merhaba scrolls, then 7 appears",
                  "7 and Merhaba are on the screen at the same time",
                  "Nothing happens; the number should have come after the text"
                ],
                "answer": 0,
                "explanation": "Blocks run from top to bottom; the number block comes before the text block, so 7 appears first. The one-digit 7 does not scroll; it stays in the middle for a short time, and then Merhaba scrolls. If the order were reversed, the result would be reversed too.",
                "skills": [
                  "mk-flow"
                ]
              },
              {
                "id": "m10h1d1-q3",
                "kind": "numeric",
                "prompt": "The Micro Card screen has 5 columns and 5 rows. How many LEDs are on the screen in total?",
                "answer": 25,
                "unit": "LED",
                "explanation": "The number of columns times the number of rows: 5 x 5 = 25. Do not mix it up with adding (5 + 5 = 10); each column has 5 lights and there are 5 columns.",
                "skills": [
                  "mk-card"
                ]
              },
              {
                "id": "m10h1d1-q4",
                "kind": "find-bug",
                "prompt": "Selin wants the text \"Merhaba\" to scroll first and then the number 7 to appear. But 7 appears on the screen first. Look at the program:\n\n```\n1  card.onStart(() => {\n2    screen.showNumber(7);\n3    screen.showText(\"Merhaba\");\n4  });\n```\n\nWhat is the bug?",
                "options": [
                  "Line 1: a different header block is needed instead of onStart",
                  "Line 4: the closing is missing",
                  "On line 3 Merhaba is too long and should be shortened",
                  "Lines 2 and 3 are in the wrong order; the text block should be above the number block"
                ],
                "answer": 3,
                "explanation": "The card runs blocks from top to bottom. For the text to appear first, the text block must be on top and the number block below it. There is no bug in the other lines: onStart is the right header block, and the length of the text does not affect the order.",
                "skills": [
                  "mk-flow",
                  "mk-debug"
                ]
              },
              {
                "id": "m10h1d1-q5",
                "kind": "mcq",
                "prompt": "Which one does NOT scroll on the screen and stays in the middle for a short time?",
                "options": [
                  "Text: Merhaba",
                  "Number: 7",
                  "Number: 25",
                  "Text: Ali"
                ],
                "answer": 1,
                "explanation": "A single character (a letter or a one-digit number) fits on the screen and stays in the middle. Merhaba and Ali scroll because they have more than one character. 25 is two characters; a two-digit number scrolls like text too.",
                "skills": [
                  "mk-card",
                  "mk-timing"
                ]
              }
            ]
          }
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
          ],
          "contentEn": {
            "title": "The address of the LEDs: x and y",
            "problem": "On a treasure map, when it says \"three steps right, two steps down\", you find the treasure. Every place has an address. The 25 lights on the card's screen have addresses too. With these addresses you can switch any light on and off. How would you draw a line or a shape of your own?",
            "contentMd": "### Address: x and y\nEvery LED has an address made of two numbers:\n\n- **x:** the column number from left to right, from 0 to 4.\n- **y:** the row number from top to bottom, from 0 to 4.\n\nCounting starts at **0**. So the leftmost column is 0 and the rightmost is 4.\n\n| Place | x | y |\n|---|---|---|\n| Top left corner | 0 | 0 |\n| Top right corner | 4 | 0 |\n| Right in the middle | 2 | 2 |\n| Bottom left corner | 0 | 4 |\n| Bottom right corner | 4 | 4 |\n\nWhen you write an address, x comes first, then y: (x, y).\n\n### Program: a diagonal line, then four corners\nIn this lesson you will use the **Basic** and **LED** categories.\n\n1. Drag the **plot x [2] y [2]** block from the **LED** category into **on start**.\n2. Set the x and y boxes to 0 and 0. This lights up the top left corner.\n3. Add four more of the same block. Set their addresses to (1, 1), (2, 2), (3, 3), (4, 4) in order.\n4. Take the **pause [500] ms** block from the **Basic** category, type 1000 instead of the time and attach it under the LED blocks.\n5. Under it, add the **clear screen** block from the **Basic** category.\n6. Then add four more **plot** blocks: (0, 0), (4, 0), (0, 4), (4, 4).\n7. ▶ **Run**.\n\n### Expected result\nFirst a diagonal line from the top left to the bottom right lights up. One second later the screen goes dark and the four corners light up. All three tasks in the Goals box should have a ✓.\n\n### How does it work?\n- The **plot** block switches on the light at the given address. The **unplot** block switches off the light at the same address.\n- LED blocks **do not wait**. If you put five LED blocks one after the other, all five seem to light up at the same time. You decide how long something stays on the screen with the **pause** block.\n- The **pause** time is in milliseconds (ms). 1000 ms is one second.\n- **clear screen** switches them all off at once. It is much quicker than switching them off one by one.\n- If you type an address outside the screen (for example x = 7), the card does not show an error; it ignores that block.\n\n### Try it\n1. Light up the light right in the middle of the screen: (2, 2). Then switch it off with **unplot**.\n2. Try lighting up the outer frame (the 16 lights on the edges). Which addresses do you need to type?\n3. Draw the diagonal line the other way: from the top right to the bottom left. Use the addresses (4, 0), (3, 1), (2, 2), (1, 3), (0, 4).\n\n### Common mistakes\n- **Mixing up x and y.** x is horizontal, y is vertical. (4, 0) is the top right corner, not the bottom left.\n- **Counting from 1.** Counting starts at 0. The rightmost column is 4, not 5.\n- **Lighting everything up and thinking you cannot see anything.** If you do not add a pause block, the first drawing is wiped straight away. Put **pause** blocks in between.",
            "question": "Why do we need two numbers to light up one light? Do you think it would be easier if we gave each of the 25 lights a single number from 1 to 25?",
            "explainerMd": "### What you will learn in this lesson\n- That every LED has an (x, y) address, where x gives the column and y gives the row\n- That counting starts at 0, so the largest address is 4\n- How to switch a single LED on and off and how to clear the screen\n- That LED blocks do not wait, and that the **pause** block decides how long something is visible\n\n### What you should know first\nLesson 1: the Micro Card's 5 x 5 LED screen, the on start block and the fact that blocks run in order.\n\n### An address on a grid\nOn a chessboard, when someone says \"e4\", the square's place is clear. The card's screen is a grid too, and every light has an address made of two numbers, written as **(x, y)**:\n\n- **x** is the **column** number from left to right.\n- **y** is the **row** number from top to bottom.\n\nx comes first, then y. The diagram below shows the four corners and the middle of the screen:\n\n```\n        x=0  x=1  x=2  x=3  x=4\ny=0     (0,0)                 (4,0)\ny=1\ny=2               (2,2)\ny=3\ny=4     (0,4)                 (4,4)\n```\n\n### Why do we start at 0?\nComputers usually start counting at **0**. The first item in a row is item \"zero\". If there are five columns, their numbers are 0, 1, 2, 3, 4; so the largest address is **4**, not 5. This is where beginners get stuck most often. Remind yourself: \"There are five, but the last number is four.\"\n\n### Switching on, switching off, clearing\nThe **plot** block switches on the light at the given address, and the **unplot** block switches off the same address. **clear screen** switches off all 25 lights at once. It is much quicker than switching them off one by one.\n\nAn address outside the screen, for example (7, 2), does not produce an error message. The card quietly ignores that block. This calm behaviour is a trap: even if there is a wrong number in your code, you will not see a red warning; the light just does not come on. If a light does not come on, check the addresses first.\n\n### LED blocks do not wait\nIf you put five **plot** blocks one after the other, all five light up almost at the same time. The **pause** block decides how long a drawing stays visible; its time is in **milliseconds** (ms). 1000 ms is one second. If you put **clear screen** straight after a drawing, the drawing is visible for too short a time for your eyes to see.\n\nA little sum: the outer frame is the lights that are left when you take the inner 3 x 3 part away from the 5 x 5 screen. That makes 25 - 9 = 16 LEDs.\n\n### Summary\nEvery LED has an (x, y) address: x is the column and y is the row, and both go from 0 to 4. The plot, unplot and clear screen blocks control the lights. Addresses outside the screen are quietly ignored. LED blocks do not wait; the pause block decides how long something is visible.",
            "concepts": [
              {
                "term": "x and y",
                "definition": "The address of an LED: x is the column number from left to right, y is the row number from top to bottom; it is written as (x, y).",
                "example": "The top right corner is at (4, 0), the bottom left corner is at (0, 4).",
                "pitfall": "Mixing up x and y: (4, 0) is the top right corner, not the bottom left."
              },
              {
                "term": "Counting from 0",
                "definition": "Counting starts at 0, not 1; so the numbers of the 5 columns are 0, 1, 2, 3, 4.",
                "example": "The LED right in the middle is at (2, 2).",
                "pitfall": "Calling the rightmost column 5; the largest address is 4."
              },
              {
                "term": "plot / unplot",
                "definition": "Switches the single light at the given address on or off.",
                "example": "plot x 0 y 0 lights up the top left corner.",
                "pitfall": "Switching the same address on and off and expecting a result you can see; you need a pause in between."
              },
              {
                "term": "Clear screen",
                "definition": "Switches off all the LEDs at once with a single block.",
                "example": "If you put clear screen after the diagonal line, you can draw the corners on an empty screen.",
                "pitfall": "Forgetting to clear: the lights of the previous drawing stay on and get mixed up with the new drawing."
              },
              {
                "term": "pause (ms)",
                "definition": "Stops the program for the given number of milliseconds; 1000 ms is one second. LED blocks do not wait by themselves.",
                "example": "If you add pause 1000 ms, the drawing is visible for one second.",
                "pitfall": "Drawing and clearing straight away without a pause: the drawing is visible for too short a time to see."
              }
            ],
            "quiz": [
              {
                "id": "m10h1d2-q1",
                "kind": "mcq",
                "prompt": "Where on the screen is the address (4, 0)?",
                "options": [
                  "Top left corner",
                  "Bottom left corner",
                  "Bottom right corner",
                  "Top right corner"
                ],
                "answer": 3,
                "explanation": "x = 4 is the rightmost column and y = 0 is the top row; that is the top right corner. x (horizontal) comes first, then y (vertical). The bottom left corner would be (0, 4) and the bottom right corner (4, 4).",
                "skills": [
                  "mk-coords"
                ]
              },
              {
                "id": "m10h1d2-q2",
                "kind": "numeric",
                "prompt": "How many LEDs are in the frame made of the outermost lines of the screen (the top and bottom rows, the left and right columns)? Hint: take away the inner 3 x 3 area.",
                "answer": 16,
                "unit": "LED",
                "explanation": "The screen has 5 x 5 = 25 LEDs. The area inside the frame is 3 x 3 = 9 LEDs. The frame is 25 - 9 = 16 LEDs. Adding up the edges as 4 x 5 = 20 is wrong; the corners would be counted twice.",
                "skills": [
                  "mk-coords"
                ]
              },
              {
                "id": "m10h1d2-q3",
                "kind": "predict-output",
                "prompt": "Which LEDs are still on after the program has finished?\n\n```\ncard.onStart(() => {\n  screen.plot(1, 3);\n  screen.plot(3, 1);\n  wait(500);\n  screen.clear();\n  screen.plot(2, 4);\n});\n```",
                "options": [
                  "The single LED in the middle of the bottom row",
                  "The single LED in the middle of the top row",
                  "Three LEDs: (1, 3), (3, 1) and (2, 4)",
                  "None; the screen is empty"
                ],
                "answer": 0,
                "explanation": "First (1, 3) and (3, 1) light up, and half a second later clear screen switches them all off. Finally (2, 4) lights up: x = 2 is the middle column and y = 4 is the bottom row. So the middle of the bottom row stays on. The first two LEDs were cleared, so they are no longer on.",
                "skills": [
                  "mk-coords",
                  "mk-flow"
                ]
              },
              {
                "id": "m10h1d2-q4",
                "kind": "find-bug",
                "prompt": "Deniz wants to light up the four corners, but the top right corner does not light up. There is no error message either.\n\n```\n1  screen.plot(0, 0);\n2  screen.plot(5, 0);\n3  screen.plot(0, 4);\n4  screen.plot(4, 4);\n```\n\nWhich line is the bug on, and why?",
                "options": [
                  "Line 1: the top left corner should be 1, 1",
                  "Line 3: y can be at most 3",
                  "Line 2: x can be at most 4; 5 is outside the screen and is quietly ignored",
                  "Line 4: unplot is needed instead of plot"
                ],
                "answer": 2,
                "explanation": "Column numbers go from 0 to 4; x = 5 is outside the screen. The card ignores an address outside the screen without showing an error, so you see no warning. The top right corner should have been (4, 0). The addresses on the other lines are the correct addresses of the corners.",
                "skills": [
                  "mk-coords",
                  "mk-debug"
                ]
              },
              {
                "id": "m10h1d2-q5",
                "kind": "mcq",
                "prompt": "A learner puts a clear screen block straight after five plot blocks, with no pause in between. What do they see on the screen?",
                "options": [
                  "The five LEDs stay on for one second",
                  "They cannot see the drawing; LED blocks do not wait, so everything is wiped straight away",
                  "The five LEDs light up one after the other",
                  "The card shows an error"
                ],
                "answer": 1,
                "explanation": "LED blocks do not wait; the drawing and the clearing happen almost at the same time, and the drawing cannot be seen. For the drawing to be visible, you need a pause block in between. The lights only come on one after the other if pause blocks are put between them. The card does not show an error, because the program is valid.",
                "skills": [
                  "mk-timing",
                  "mk-flow"
                ]
              }
            ]
          }
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
          ],
          "contentEn": {
            "title": "Icons and your own pattern",
            "problem": "When you are messaging, drawing a smiling face is much quicker than typing words. The card's screen is a small canvas too: it can draw faces, arrows and hearts. Using ready-made drawings is easy. But what should you do to draw something that does not exist yet, such as a robot?",
            "contentMd": "### Ready-made icons\nThe **show icon [heart]** block in the **Basic** category contains small ready-made drawings. When you click the box, a list opens: heart, small heart, happy face, sad face, surprised face, sleeping face, yes, no, arrows, square, diamond, triangle, house, target, ghost, skull, butterfly, cat, note, sun.\n\nAn icon is drawn on the screen straight away and stays there until you clear it or show something else.\n\n### Your own pattern: show LEDs\nThe **show LEDs** block in the **Basic** category contains 5x5 small boxes. When you click a box, that LED lights up; click it again and it goes off. Whatever you draw, the card shows it on the screen.\n\nIn this lesson you will draw a **robot head**. Mark the boxes like this (1 on, 0 off):\n\n| Row | Pattern |\n|---|---|\n| Row 1 | 0 0 1 0 0 |\n| Row 2 | 0 1 1 1 0 |\n| Row 3 | 1 0 1 0 1 |\n| Row 4 | 1 1 1 1 1 |\n| Row 5 | 1 0 1 0 1 |\n\n### Program: three faces\n1. Put a **show icon** block inside the **on start** block and choose **happy face** from the list.\n2. Attach a **pause [1000] ms** block under it.\n3. Under that, add a second **show icon** block and choose **sad face**.\n4. Add another **pause 1000 ms**.\n5. At the very bottom, attach the **show LEDs** block. Draw the robot head by clicking the boxes.\n6. ▶ **Run**.\n\n### Expected result\nFirst the happy face appears, one second later the sad face, and one second after that the robot head. The robot head stays on the screen. All four goals should have a ✓.\n\n### How does it work?\n- Both draw on the screen straight away, but they work differently: **show icon** picks a ready-made drawing, while **show LEDs** uses the one you drew.\n- The 25 LEDs on the screen are really 25 tiny \"on/off\" switches. A pattern is the state of these 25 switches at that moment.\n- When a block draws something, it completely wipes the previous drawing. Drawings do not pile up on top of each other.\n\n### Try it\n1. Draw your own face in the **show LEDs** block: eyes, mouth, nose. Compare it with a friend's drawing.\n2. Add a second **show LEDs** block under the first one and draw a slightly changed version of the pattern (such as the robot closing its eyes). Put a **pause 500 ms** between them: you have made an animation!\n3. Pick two of the ready-made icons and change the pause time. What does a very short pause (100 ms) look like?\n\n### Common mistakes\n- **Not adding a pause.** If you put two icons one after the other without a pause, you will only see the last one. The first one is visible for such a short time that you do not notice it.\n- **Marking the boxes the wrong way round.** Rows go from top to bottom, columns go from left to right. Look at your drawing from one side and make sure it is right.\n- **Trying to write text with show LEDs.** This block only shows the pattern you drew; for text, use the **show text** block.",
            "question": "Is it more fun to use the ready-made icons or to draw your own pattern? Think of a feeling or an object you could show with 25 lights: how many lights would you need to draw it?",
            "explainerMd": "### What you will learn in this lesson\n- How to draw on the screen in one step with the ready-made **icon** block\n- How to draw your own pattern of 25 switches with the **show LEDs** block\n- That a pattern can be read row by row as \"1 on, 0 off\"\n- That a new drawing wipes the previous one, and that you need a pause between two drawings\n\n### What you should know first\nLesson 1: the block editor and the fact that blocks run in order. Lesson 2: LED addresses (x, y), counting from 0 and the time of the **pause** block in milliseconds.\n\n### Lighting them one by one is tiring\nIn lesson 2 you drew a shape one LED at a time with plot blocks. A face could need ten blocks. That is why there are two shortcuts: ready-made icons and your own pattern.\n\n### Ready-made icons\nThe list in the **show icon** block contains ready-made drawings such as a heart, faces, arrows, a square and a note. When you choose one, the drawing appears on the screen straight away. The icon **stays** on the screen until you clear it or show something else; it does not disappear by itself just because a block has finished its job.\n\n### Pattern: 25 switches\nThe 25 LEDs on the screen are really 25 tiny switches; each one is either on or off. A **pattern** is the state of these switches at that moment. The **show LEDs** block has 5 x 5 boxes, and each box is a switch. You can write a pattern on paper like this; 1 means on, 0 means off:\n\n```\nrow 0:  0 0 1 0 0\nrow 1:  0 1 1 1 0\nrow 2:  1 0 1 0 1\nrow 3:  1 1 1 1 1\nrow 4:  1 0 1 0 1\n```\n\nThis is a robot head. You read each row from left to right; the columns that are lit are where the 1s are in that row. For example, in row 2 the 1s are in columns 0, 2 and 4. The total number of lit LEDs is 1 + 3 + 3 + 5 + 3 = 15. You can check your drawing by counting like this.\n\n### The next drawing wipes the previous one\nThe **show icon** and **show LEDs** blocks redraw the whole screen; the previous drawing is completely gone. They do not pile up on top of each other. That is why, if two drawings are placed one after the other with no pause in between, only the last one is seen: the first one stays for such a short time that nobody notices it.\n\nIf you line up two drawings with a **pause** between them, you get a simple **animation**. A cinema film is also lots of drawings, each slightly different from the one before, shown quickly. If you make the pause shorter, the animation speeds up; if you make it longer, it slows down.\n\n### Careful: there is another block for text\n**show LEDs** does not write letters; it only shows the pattern you drew. For text, use the **show text** block.\n\n### Summary\nshow icon puts ready-made drawings on the screen, while show LEDs puts the 25-switch pattern you drew yourself. A pattern can be written row by row with 1s and 0s. A new drawing wipes the previous one, so you make an animation by putting pauses between them.",
            "concepts": [
              {
                "term": "Icon",
                "definition": "A ready-made 5x5 drawing chosen with the show icon block (such as a heart, a face, an arrow or a note).",
                "example": "The happy face icon draws two eyes and a smile.",
                "pitfall": "Thinking the icon will disappear by itself; it stays on the screen until something else is shown."
              },
              {
                "term": "Pattern",
                "definition": "The on/off state of the 25 LEDs at that moment; it is drawn with the boxes in the show LEDs block.",
                "example": "In the robot head pattern, 15 LEDs are on.",
                "pitfall": "Marking the boxes in the wrong order; rows go from top to bottom, columns go from left to right."
              },
              {
                "term": "1 and 0 notation",
                "definition": "A way of writing each row of a pattern like a 5-digit number: 1 on, 0 off.",
                "example": "In the row 10101, columns 0, 2 and 4 are on.",
                "pitfall": "Starting the count at 1; the first column is column 0."
              },
              {
                "term": "Animation",
                "definition": "Showing drawings that are slightly different from each other one after the other, with pauses between them.",
                "example": "Open eyes pattern, 500 ms pause, closed eyes pattern: the robot blinks.",
                "pitfall": "Forgetting the pause: only the last drawing is seen."
              },
              {
                "term": "A drawing wipes",
                "definition": "A new icon or pattern takes the place of the previous drawing on the screen; they do not pile up.",
                "example": "When the sad face is shown after the happy face, the happy face leaves the screen.",
                "pitfall": "Expecting the two drawings to be seen together."
              }
            ],
            "quiz": [
              {
                "id": "m10h1d3-q1",
                "kind": "mcq",
                "prompt": "You want to show a shape on the screen that you drew yourself and that is not in the ready-made list. Which block is right?",
                "options": [
                  "show LEDs",
                  "show icon",
                  "show text",
                  "show number"
                ],
                "answer": 0,
                "explanation": "In the show LEDs block you draw your own pattern by marking the 25 boxes however you like. show icon only gives the drawings in the ready-made list; show text and show number show letters and digits.",
                "skills": [
                  "mk-images"
                ]
              },
              {
                "id": "m10h1d3-q2",
                "kind": "predict-output",
                "prompt": "What is visible on the screen when the program has finished?\n\n```\ncard.onStart(() => {\n  screen.showIcon(\"heart\");\n  wait(500);\n  screen.showIcon(\"smallHeart\");\n  wait(500);\n});\n```",
                "options": [
                  "The big heart",
                  "Both hearts together",
                  "An empty screen",
                  "The small heart"
                ],
                "answer": 3,
                "explanation": "The big heart is visible for 500 ms, then the small heart takes its place. The pause after the small heart does not wipe the drawing; it only makes the program wait. An icon stays on the screen until a new one comes, so the last one visible is the small heart.",
                "skills": [
                  "mk-images",
                  "mk-flow"
                ]
              },
              {
                "id": "m10h1d3-q3",
                "kind": "numeric",
                "prompt": "A robot head is drawn with this pattern (1 is on). How many LEDs light up in total?\n\n```\n0 0 1 0 0\n0 1 1 1 0\n1 0 1 0 1\n1 1 1 1 1\n1 0 1 0 1\n```",
                "answer": 15,
                "unit": "LED",
                "explanation": "The 1s in the rows: 1 + 3 + 3 + 5 + 3 = 15. The boxes that are off (0) are not counted. The answer is 15, not 25; 25 is the total number of LEDs on the screen, not the number that are on.",
                "skills": [
                  "mk-images",
                  "mk-coords"
                ]
              },
              {
                "id": "m10h1d3-q4",
                "kind": "find-bug",
                "prompt": "Mert wants to see the happy face first and the sad face one second later. But he only sees the sad face.\n\n```\n1  screen.showIcon(\"happy\");\n2  screen.showIcon(\"sad\");\n3  wait(1000);\n```\n\nWhat is the bug?",
                "options": [
                  "Line 1: the happy icon is not in the list",
                  "There is no wait between lines 1 and 2; the happy face is wiped straight away",
                  "Line 2: it should say happy instead of sad",
                  "Line 3: the wait time is too long"
                ],
                "answer": 1,
                "explanation": "The show icon block does not wait, and every new drawing wipes the previous one. For the happy face to be visible, you need to put a pause in between. The happy and sad icons are in the list; the wait at the end keeps the sad face on for longer and is not a bug.",
                "skills": [
                  "mk-images",
                  "mk-timing",
                  "mk-debug"
                ]
              },
              {
                "id": "m10h1d3-q5",
                "kind": "mcq",
                "prompt": "In a show LEDs block, the third row is 1 0 1 0 1. In which columns do the LEDs light up in this row?",
                "options": [
                  "Columns 1, 3 and 5, so x = 1, 3, 5",
                  "x = 0, 1 and 4",
                  "x = 0, 2 and 4",
                  "Only x = 2"
                ],
                "answer": 2,
                "explanation": "You read the row from left to right and look at the column numbers where there is a 1. Counting starts at 0, so the 1s are at x = 0, 2 and 4. Writing x = 1, 3, 5 is the mistake of counting from 1, and 5 does not exist on the screen anyway.",
                "skills": [
                  "mk-images",
                  "mk-coords"
                ]
              }
            ]
          }
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
          ],
          "contentEn": {
            "title": "Order and repetition",
            "problem": "If you mix up the order when you write a recipe, the meal goes wrong: first crack the egg, then stir. In computers, order is everything too. Now say you want the same job done three times. Are you going to copy the blocks three times?",
            "contentMd": "### Order\nThe card runs blocks **from top to bottom**. The same blocks give a different result in a different order.\n\nCompare these two stacks:\n\n| Stack 1 | Stack 2 |\n|---|---|\n| show square | clear screen |\n| pause 300 ms | pause 300 ms |\n| clear screen | show square |\n| pause 300 ms | pause 300 ms |\n\nIn stack 1 the square appears first, then goes off. In stack 2 the screen stays empty first, then the square appears and stays on the screen. The blocks are the same; the order is different.\n\n### Repetition\nTo make a square blink three times, you could put the 4 blocks one under the other three times. But the **repeat [4] times** block in the **Loops** category gives you a much shorter way. The blocks you put inside it run again as many times as the number you type.\n\n### Program: three blinks and yes\n1. Drag the **repeat [4] times** block from the **Loops** category into **on start**.\n2. Change the number to 3.\n3. Attach these inside the repeat block, in this order:\n   - **show icon** from the **Basic** category (choose **square** from the list)\n   - **pause [300] ms**\n   - **clear screen**\n   - **pause [300] ms**\n4. **Under** the repeat block, that is outside it, add a **show icon** block and choose **yes**.\n5. ▶ **Run**.\n\n### Expected result\nThe square blinks three times. Each blink takes about 0.6 seconds. Then the \"yes\" sign stays on the screen. All three tasks in the Goals box should have a ✓.\n\n### How does it work?\n- The blocks inside the repeat block run from start to finish **as many times as the number**. When the third round is over, the card moves on to the next block.\n- If a block is **inside** the repeat block, it repeats; if it is **under** it, it runs once. The \"yes\" icon is outside the repeat block, so it appears only once, at the very end.\n- Look at the **JavaScript** tab: the repeat block has turned into the line `for (let _i = 0; _i < 3; _i++)`. The lines inside the curly brackets are the blocks that repeat.\n\n### Try it\n1. Change the number to 10. The square blinks 10 times. Change the pause time to 100 ms and compare the speed.\n2. Add a second icon inside the repeat block: square, pause, diamond, pause and so on. What happens instead of blinking?\n3. Move the \"yes\" block inside the repeat block and see what changes.\n\n### Common mistakes\n- **Attaching the block in the wrong place.** Pay attention to whether you put it inside the repeat block or under it. Inside and outside do different things.\n- **Forgetting to clear.** Without clearing and pausing, the square never goes off and you cannot see it blink.\n- **Typing a time that is too short.** A very short pause, such as 10 ms, cannot be seen.",
            "question": "What repeats in everyday life? How would you describe repeated things, such as brushing your teeth or climbing stairs, with a single \"repeat ... times\" sentence?",
            "explainerMd": "### What you will learn in this lesson\n- That the same blocks give a different result in a different order\n- How to use the **repeat** block to have a job done more than once\n- The difference between a block being **inside** repeat or **under** it\n- How to work out the total time of a program that repeats\n\n### What you should know first\nLesson 1: blocks run from top to bottom. Lesson 2: the time of the **pause** block in milliseconds and **clear screen**. Lesson 3: the **show icon** block.\n\n### Order changes the result\nIn a recipe, if you stir before cracking the egg, the result goes wrong. It is the same on the card. These two stacks are made of the same four blocks:\n\n```\nStack 1: show square -> pause 300 -> clear -> pause 300\nStack 2: clear -> pause 300 -> show square -> pause 300\n```\n\nWhen stack 1 finishes, the screen is empty. When stack 2 finishes, the square is left on the screen. The **final state** of a program is the state left by the last block that ran.\n\n### Repeating instead of copying\nTo make the square blink three times, you could line up the four blocks three times; that makes 12 blocks. But what if it had to blink 100 times? That is what the **repeat** block is for. The blocks you put inside it run from start to finish as many times as the number you type. This kind of structure is called a **loop**.\n\nThis is the JavaScript version of the repeat block:\n\n```\nfor (let _i = 0; _i < 3; _i++) {\n  ...\n}\n```\n\nHere `_i` is a counter. It starts at 0, goes up by 1 in each round and stops when it reaches 3. So it goes round exactly three times: 0, 1, 2.\n\n### Inside or outside?\nIf a block is **inside** the repeat block, it runs in every round. If it is **under** it, it runs once after the loop has completely finished. The difference looks small, but the result is big: if you put the \"yes\" icon inside, the card tries to show it in every round; if you put it outside, it appears only once, at the very end.\n\n### Working out the total time\nThe time of the loop is the time of one round times the number of rounds. If you wait 300 ms with the square on and 300 ms with it off in one round, the round takes 600 ms. The total for three rounds:\n\n```\n3 x (300 + 300) = 1800 ms = 1.8 seconds\n```\n\nBeing able to do this sum helps you when you plan an animation. Remember: for the blink to be visible, you need both **clear** and two **pause** blocks. Without clearing, the square never goes off; without pausing, the change happens too fast for your eyes to see.\n\n### Summary\nThe same blocks give a different result in a different order. The repeat block runs the blocks inside it as many times as the number and saves you the trouble of copying. What is inside runs in every round; what is outside runs once after the loop. The total time is the time of one round times the number of rounds.",
            "concepts": [
              {
                "term": "Order",
                "definition": "The same blocks give a different result when they are lined up in a different order; the final state of the program depends on the last block that ran.",
                "example": "Clear first, then show the square: the square stays on the screen; in the opposite order the screen stays empty.",
                "pitfall": "Lining up the right blocks in the wrong order and thinking the program is broken."
              },
              {
                "term": "Loop (repeat)",
                "definition": "A block that runs the blocks inside it from start to finish as many times as the number typed in.",
                "example": "Repeat 3: show square, pause, clear, pause. The square blinks three times.",
                "pitfall": "Typing the wrong number; if you type 3, it goes round exactly three times, not two or four."
              },
              {
                "term": "Inside and outside",
                "definition": "The blocks inside repeat run in every round, while the blocks under it run once after the loop has finished.",
                "example": "If the yes icon is under repeat, it appears only at the very end.",
                "pitfall": "Attaching the block in the wrong place: a block attached inside repeats where you do not want it to."
              },
              {
                "term": "Round time",
                "definition": "The total of the pause times inside the loop; the total time is this multiplied by the number of rounds.",
                "example": "A round of 300 + 300 ms makes 1800 ms in total for 3 rounds.",
                "pitfall": "Thinking the time of one round is the total."
              },
              {
                "term": "Counter (_i)",
                "definition": "The variable used by the repeat block in the JavaScript tab; it starts at 0 and goes up towards the number of rounds.",
                "example": "The line for (let _i = 0; _i < 3; _i++) goes round three times: 0, 1, 2.",
                "pitfall": "Thinking _i < 3 means \"up to and including three\"; the value 3 is not included."
              }
            ],
            "quiz": [
              {
                "id": "m10h1d4-q1",
                "kind": "predict-output",
                "prompt": "What is on the screen after this program has finished?\n\n```\ncard.onStart(() => {\n  screen.clear();\n  wait(300);\n  screen.showIcon(\"square\");\n  wait(300);\n});\n```",
                "options": [
                  "The screen is empty",
                  "First the square, then an empty screen",
                  "The square icon is visible",
                  "An error happens"
                ],
                "answer": 2,
                "explanation": "The screen is cleared first, then the square is shown. The pause after the square does not wipe the drawing, so the square stays on the screen. If the clear and show square blocks were the other way round, the screen would stay empty.",
                "skills": [
                  "mk-flow",
                  "mk-images"
                ]
              },
              {
                "id": "m10h1d4-q2",
                "kind": "numeric",
                "prompt": "A repeat block runs 3 times. In each round there are the blocks pause 300 ms, clear screen, pause 300 ms. What is the total time of the loop in milliseconds? (The show and clear blocks do not wait.)",
                "answer": 1800,
                "unit": "ms",
                "explanation": "One round takes 300 + 300 = 600 ms. Three rounds: 3 x 600 = 1800 ms (1.8 seconds). Writing only 600 means thinking the time of one round is the total.",
                "skills": [
                  "mk-repeat",
                  "mk-timing"
                ]
              },
              {
                "id": "m10h1d4-q3",
                "kind": "find-bug",
                "prompt": "Ece wants the square to blink three times, but the square never goes off.\n\n```\n1  for (let _i = 0; _i < 3; _i++) {\n2    screen.showIcon(\"square\");\n3    wait(300);\n4    wait(300);\n5  }\n```\n\nWhat is the bug?",
                "options": [
                  "Line 4 needs screen.clear() instead of wait; the screen is never cleared",
                  "Line 1: the loop should go round 4 times",
                  "Line 2: the square icon cannot blink",
                  "Line 3: the pause is too short"
                ],
                "answer": 0,
                "explanation": "To blink, one round needs show, pause, clear, pause. Here there is no clearing, so after the first round the square stays on all the time. The number of rounds (3) is the number wanted and square is a valid icon; the pause time does not spoil the result, it only changes the speed.",
                "skills": [
                  "mk-repeat",
                  "mk-debug"
                ]
              },
              {
                "id": "m10h1d4-q4",
                "kind": "mcq",
                "prompt": "To show the \"yes\" icon, you attach the block UNDER (outside) the repeat block. What does this do?",
                "options": [
                  "The icon is shown in every round",
                  "The icon is never shown",
                  "The loop goes on forever",
                  "The icon is shown only once, after the loop has completely finished"
                ],
                "answer": 3,
                "explanation": "The block under repeat runs once when the loop has finished. If it were attached inside, it would try to run in every round. Attaching it underneath does not hide the icon and does not make the loop longer.",
                "skills": [
                  "mk-repeat",
                  "mk-flow"
                ]
              },
              {
                "id": "m10h1d4-q5",
                "kind": "mcq",
                "prompt": "The JavaScript tab has the line for (let _i = 0; _i < 5; _i++). How many times do the blocks inside it run?",
                "options": [
                  "4 times",
                  "5 times",
                  "6 times",
                  "Forever"
                ],
                "answer": 1,
                "explanation": "The value of _i becomes 0, 1, 2, 3, 4, and when it becomes 5 the condition is no longer true. That makes five rounds. Because it starts at 0, \"up to 5\" does not mean 5 is included; so it goes round 5 times, not 6.",
                "skills": [
                  "mk-repeat"
                ]
              }
            ]
          }
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
          ],
          "contentEn": {
            "title": "Project: Beating heart",
            "problem": "When a doctor listens to your heart, they hear \"lub-dub, lub-dub\": two short beats, then a little rest. With what you have learnt this week, you can make a real heartbeat on the card's screen. And with a short greeting at the very start, too!",
            "contentMd": "### Project: Beating heart\nYou will bring together everything you learnt this week: showing text, showing icons, pausing, repeating and screen brightness.\n\n**Goals:**\n- When the card starts, a short text scrolls.\n- The screen brightness is turned down a little.\n- Then the heart beats \"lub-dub\" forever: big heart, small heart, big heart, small heart and then a short rest.\n\n### New block: forever\nThe **forever** block in the **Basic** category repeats the blocks inside it from the start without stopping. It keeps going until you press the **Stop** button. It is perfect for jobs that never end, like a beating heart.\n\n### New block: set screen brightness\nThe **set screen brightness to [255]** block in the **LED** category sets the brightness of all the LEDs between 0 and 255. 255 is the brightest. At 0 nothing is visible. Turning the light down a little before showing text is easier on your eyes.\n\n### Step by step\nThe **on start** and **forever** blocks are already in the editor.\n\n1. Put the **set screen brightness to [255]** block from the **LED** category inside the **on start** block. Change the number to 200.\n2. Under it, attach the **show text** block from the **Basic** category. Change the text to \"Sev\" (Turkish for \"love\").\n3. Attach these blocks inside the **forever** block, in this order:\n   - **show icon** (heart), **pause** 150 ms\n   - **show icon** (small heart), **pause** 100 ms\n   - **show icon** (heart), **pause** 150 ms\n   - **show icon** (small heart), **pause** 400 ms\n4. ▶ **Run**.\n\n### Expected result\nFirst a short \"Sev\" text scrolls across the screen (about 2 seconds). Then the heart beats twice quickly, there is a short rest, and it starts again. All five goals should have a ✓.\n\n### How does it work?\n- **on start** runs once; after it has finished, **forever** takes over.\n- The heartbeat: big heart, small heart, big heart, small heart. The pause times in between set the rhythm. About 0.8 seconds in total.\n- **forever** takes a very short breather at the end of every round, so it does not wear the card out.\n- By changing the times, you can make an excited heart or a sleeping heart.\n\n### Try it\n1. Make the heart faster by shortening the pauses. Make it like the heart of someone who is running.\n2. Slow it down by making the pauses longer. Like the heart of someone who is asleep.\n3. Use the first letter of your name as the text. A single letter does not scroll; it stays in the middle. What is the difference?\n4. If you like, set the brightness inside the **on start** block to 20 and see what the heart looks like. Then set it back to 255.\n\n### Common mistakes\n- **Putting the blocks in the wrong place.** The text block must be inside **on start**, the heart blocks inside **forever**. If you put the text in the forever block, it scrolls again in every round.\n- **Not adding pauses.** If there is no pause between the big and the small heart, you cannot see the heart beating.\n- **Setting the brightness to 0.** If the brightness is 0, the screen shows nothing. The program is not broken; raise the number.",
            "question": "Which times did you choose in your project? How different is a real heartbeat from your beating heart? How would you turn this heart into a gift for a friend that they could reprogram?",
            "explainerMd": "### What you will learn in this lesson\n- The difference between the **on start** (once) and **forever** (without stopping) blocks\n- How a rhythm is built with pause times\n- That the **set screen brightness** block works between 0 and 255\n- How to plan a big job by first splitting it into parts and putting them in a table\n\n### What you should know first\nLesson 1: showing text and header blocks. Lesson 2: **pause** and milliseconds. Lesson 3: **show icon** (heart and small heart). Lesson 4: the order of blocks and repetition.\n\n### Two separate header blocks\nUntil now you put everything in the **on start** block; that part runs once and ends. A beating heart, though, should not end. The **forever** block repeats what is inside it from the start until you press ■ Stop. The jobs are shared out like this:\n\n| Part | When it runs | What you put in it in this project |\n|---|---|---|\n| on start | Once, at the start | Set the brightness, show the greeting text |\n| forever | Again and again without ending | The heartbeat |\n\nIf you put the text inside forever by mistake, the heart waits for the text to finish again in every round; the beat never looks right.\n\n### A rhythm is the total of the pauses\nA real heart goes \"lub-dub, rest\". On the card you show this as big heart, small heart, big heart, small heart, and you put pauses of different lengths in between:\n\n```\nbig heart      150 ms\nsmall heart    100 ms\nbig heart      150 ms\nsmall heart    400 ms  (long rest)\ntotal          800 ms\n```\n\nOne round takes 800 ms. Since a minute is 60 000 ms, that makes about 60 000 / 800 = 75 rounds a minute. If you shorten the pauses, the heart speeds up; if you make them longer, it slows down. You set the rhythm you want with these numbers.\n\n### Brightness\nThe **set screen brightness** block sets the brightness of all the LEDs. The value is between **0 and 255**: 255 is the brightest, and 0 is when nothing is visible. Do not think the program is broken; if the brightness is 0, the screen is dark even when something is drawn. Turning the screen down is easier on your eyes, especially in a dark room.\n\n### Plan first, then blocks\nAs a project gets bigger, writing a small table first, instead of dragging blocks straight away, makes your job easier:\n\n| Step | Part | Job |\n|---|---|---|\n| 1 | on start | Set the brightness to 200 |\n| 2 | on start | Show the text \"Sev\" |\n| 3 | forever | Heartbeat: four drawings, four pauses |\n\nEach row matches one or a few blocks. When you write the plan like this, you know which block goes where.\n\n### Summary\non start runs once; forever runs all the time. The rhythm of the beating heart is the total of the pause times; in this project a round is 800 ms. Brightness is between 0 and 255, and 0 makes the screen dark. Starting the job by putting the plan in a table cuts down mistakes.",
            "concepts": [
              {
                "term": "on start and forever",
                "definition": "on start runs once, while forever keeps repeating until you stop it.",
                "example": "The greeting text goes inside on start, the heartbeat inside forever.",
                "pitfall": "Putting the text inside forever: it scrolls again in every round and spoils the heartbeat."
              },
              {
                "term": "Rhythm",
                "definition": "The series of pause times in a movement; their total is the time of one round.",
                "example": "Pauses of 150, 100, 150 and 400 ms give a heartbeat round of 800 ms.",
                "pitfall": "Leaving out the pauses in between; you cannot tell the big and the small heart apart."
              },
              {
                "term": "Brightness",
                "definition": "The set screen brightness block sets the light of the LEDs between 0 (off) and 255 (brightest).",
                "example": "When you set the brightness to 200, the screen is turned down a little.",
                "pitfall": "Setting the brightness to 0 and thinking the program is broken; the screen works, but it is dark."
              },
              {
                "term": "Number of rounds and speed",
                "definition": "The shorter one round is, the more rounds are done in the same time; the number of rounds per minute is 60 000 / round time.",
                "example": "With an 800 ms round, there are about 75 rounds a minute.",
                "pitfall": "Thinking the time is in seconds; pause blocks are in milliseconds."
              },
              {
                "term": "Plan table",
                "definition": "A small table that writes down the project step by step (which part, which job).",
                "example": "Step 1: set the brightness, step 2: show the text, step 3: beat the heart inside forever.",
                "pitfall": "Starting without a plan; dragging blocks at random and forgetting where they belong."
              }
            ],
            "quiz": [
              {
                "id": "m10h1d5-q1",
                "kind": "numeric",
                "prompt": "In the beating heart, the pauses are 150, 100, 150 and 400 ms in order. What is the total pause time of one heartbeat round in milliseconds?",
                "answer": 800,
                "unit": "ms",
                "explanation": "150 + 100 + 150 + 400 = 800 ms. The drawing blocks do not wait, so only the pause blocks decide the round time.",
                "skills": [
                  "mk-timing",
                  "mk-planning"
                ]
              },
              {
                "id": "m10h1d5-q2",
                "kind": "numeric",
                "prompt": "If one round takes 800 ms, about how many times does the heart beat in 1 minute (60 000 ms)? (Count each round as one beat.)",
                "answer": 75,
                "tolerance": 2,
                "unit": "rounds",
                "explanation": "60 000 / 800 = 75 rounds. On the actual virtual card, the forever block takes a breather of about 20 ms at the end of every round; so in practice there are about 73 rounds, and a small difference is accepted.",
                "skills": [
                  "mk-timing",
                  "mk-repeat"
                ]
              },
              {
                "id": "m10h1d5-q3",
                "kind": "predict-output",
                "prompt": "The greeting text has been put in the forever block by mistake. What happens when this program runs?\n\n```\ncard.forever(() => {\n  screen.showText(\"Sev\");\n  screen.showIcon(\"heart\");\n  wait(500);\n});\n```",
                "options": [
                  "The text scrolls once, then the heart is visible all the time",
                  "Only the text scrolls; the heart does not appear",
                  "The heart is visible for half a second, then the text scrolls again; this goes on and on",
                  "The program shows an error and stops"
                ],
                "answer": 2,
                "explanation": "Everything in the forever block runs again in every round. The text scrolls for about 2 seconds, then the heart is visible for 500 ms, and the round starts again. That is why the text needs to go in the on start block. The program does not show an error.",
                "skills": [
                  "mk-flow",
                  "mk-repeat"
                ]
              },
              {
                "id": "m10h1d5-q4",
                "kind": "find-bug",
                "prompt": "Zeynep cannot see anything on the screen while the heartbeat is running.\n\n```\n1  card.onStart(() => {\n2    screen.setBrightness(0);\n3    screen.showText(\"Sev\");\n4  });\n```\n\nWhich line is the problem on?",
                "options": [
                  "Line 3: the text is too short",
                  "Line 1: forever is needed instead of onStart",
                  "Line 4: there is one closing bracket too many",
                  "Line 2: brightness 0 makes the screen dark; a value between 0 and 255 that is greater than zero is needed"
                ],
                "answer": 3,
                "explanation": "If the brightness is 0, the LEDs stay dark even when something is drawn. The program is not broken; raising the number is enough (for example 200). The start block is in the right place, and the length of the text does not affect whether it is visible.",
                "skills": [
                  "mk-debug",
                  "mk-flow"
                ]
              },
              {
                "id": "m10h1d5-q5",
                "kind": "mcq",
                "prompt": "You want a faster beat, like the heart of someone who is running. What should you do?",
                "options": [
                  "Make the pause times longer",
                  "Make the pause times shorter",
                  "Set the brightness to 255",
                  "Change the heart icon to the small heart"
                ],
                "answer": 1,
                "explanation": "The round time is the total of the pause blocks; if it gets shorter, more rounds are done in the same time and the heart speeds up. Making them longer slows it down. The brightness and the choice of icon affect the picture, not the rhythm.",
                "skills": [
                  "mk-timing",
                  "mk-planning"
                ]
              }
            ]
          }
        }
      ]
    },
    {
      "title": "Düğmeler ve olaylar",
      "project": "Zar oyunu skor panosu",
      "guideMd": "### Hafta hedefleri\nBu haftanın sonunda öğrenci:\n1. Olayın ne olduğunu açıklayabilir; A, B ve A+B düğme olay bloklarını kullanabilir.\n2. Basılınca, bırakılınca ve uzun basılınca arasındaki farkı gösterebilir; logoyu bir olay kaynağı olarak kullanabilir.\n3. Değişken oluşturup değerini yapabilir, artırıp azaltabilir ve ekranda gösterebilir (sayaç).\n4. Rastgele sayı bloğu ve **eğer ... ise** ile karar veren bir program yazabilir; atama ile karşılaştırma farkını söyleyebilir.\n5. Kural tablosuna bakarak üç düğmeli, değişkenli ve ezgili bir skor panosu kurabilir.\n\n### Haftanın planı\nHafta beş derstir; her ders yaklaşık 20-35 dakikadır. Plan günde bir ders içindir. Daha yoğun takvim isteyenler 1. ve 2. dersi ya da 3. ve 4. dersi birleştirebilir.\n\n| Gün | Ders | Süre | Ne yapılır |\n|---|---|---|---|\n| 1 | A, B ve A+B düğmeleri | ~20 dk | Anlatımı oku, üç düğmeye üç simge ver, bırakılınca ve bekleme deneylerini yap, mini testi çöz. |\n| 2 | Sayaç ve değişken | ~25 dk | Ziyaretçi sayacını kur; 12 kez basarak iki basamaklı sayıyı gözle; beşer beşer saydır. |\n| 3 | Elektronik zar | ~25 dk | Zarı bir kez at, kutuya koy; 6'da kalp göster; 10 atışta kaç altı geldiğini say. |\n| 4 | Logo, uzun basış ve gizli düğmeler | ~20 dk | Logo ve uzun basış bloklarını kur; 1 saniye süresini kendi gözlemle ölç. |\n| 5 | Proje: Zar oyunu skor panosu | ~35 dk | Kural tablosunu yaz, programı kur, oyunu bir arkadaşınla oyna, ölçütle değerlendir. |\n\n### Ön koşul kontrolü\nBu hafta Hafta 1'in sonunda şunları yapabilmek gerekir:\n- Sanal kartta ▶ Çalıştır, ■ Durdur ve ↺ Sıfırla düğmelerini kullanmak.\n- **başlangıçta** ve **sonsuza kadar** gibi başlık bloklarının içine blok takmak.\n- **simgeyi göster**, **sayıyı göster**, **bekle** ve **ekranı temizle** bloklarını bilmek.\n- Dört işlemi (toplama, çıkarma, çarpma) rahat yapmak; sayaç ve toplam hesabı bunları içerir.\n\n### Kavram haritası\n- **Olay:** olay bloğu (başlık bloğu) → düğme A, B, A+B → basılınca, bırakılınca, uzun basılınca (1 saniye) → logo (dokununca, bırakılınca)\n- **Veri:** değişken (ada sahip kutu) → değerini yap, değerine ekle → başlangıç değeri → sayaç → toplam (biriktirici)\n- **Karar:** rastgele sayı (uçlar dahil) → karşılaştırma (=, ≠, <, ≤, >, ≥) → eğer ... ise → değilse\n- **Proje:** kural tablosu → zar ve toplam → ezgiyi çal (bitene kadar bekler) → sıfırlama\n\n### Sık yapılan hatalar\n- **Düğme listesini değiştirmemek.** İki blokta da A seçili kalır; B'ye basınca hiçbir şey olmaz.\n- **A'ya, sonra B'ye basıp A+B beklemek.** İkisine aynı anda basmak için sanal kartın alttaki A+B düğmesi kullanılır.\n- **Bloğu başlık bloğunun dışında bırakmak.** Soluk görünür ve çalışmaz.\n- **Değişkeni değiştirip göstermeyi unutmak.** Kutu değişir ama ekranda bir şey olmaz.\n- **Önce göstermek, sonra artırmak.** Sayaç bir geriden gelir.\n- **İki ayrı rastgele blok kullanmak.** Ekranda görünen ile karşılaştırılan sayı farklı çıkar; zarı bir kez at, kutuya koy.\n- **Atama ile karşılaştırmayı karıştırmak.** \"değerini yap\" kutuya değer koyar; \"=\" soru sorar.\n- **`>` ile `≥` karıştırmak.** 5 > 5 yanlıştır; 5 ≥ 5 doğrudur.\n- **Uzun basış için 1 saniyeden az basmak.** Olay hiç gelmez.\n- **Toplamı sıfırlamayı unutmak.** Yeni oyunda eski puan üstüne eklenir.\n\n### Hafta sonu tekrarı\n1. Her dersin kavram kartlarına bir kez daha bak ve \"sık yapılan yanlış\" satırlarını yüksek sesle oku.\n2. Mini testlerde yanlış yaptığın soruların açıklamalarını yeniden oku, sonra soruyu yeniden çöz.\n3. Sayaç programını sıfırdan, bakmadan kur; sonra A'ya 12 kez bas ve ekranda ne gördüğünü anlat.\n4. Zar programına bir kural ekle: 1 gelirse üzgün yüz, 6 gelirse kalp. İki kolu da **eğer** ile yap.\n5. Kendi cümlelerinle cevapla: \"Değişken olmasaydı kart ziyaretçi sayısını nasıl tutardı?\"\n\nHafta sonu testi olarak beş dersin mini testleri yeterlidir; her derste 5 soru, toplam 25 soru. Hedef: her dersten en az 4 doğru. Eksik kalan dersin anlatımına dön.\n\n### Proje değerlendirme ölçütü (Zar oyunu skor panosu)\n| Ölçüt | Gelişmeli | Yeterli | İleri |\n|---|---|---|---|\n| Olaylar | Düğmelerden biri tepki vermiyor | A, B ve A+B doğru çalışıyor | Bir ek olay eklenmiş (uzun basışla sıfırlama gibi) |\n| Değişkenler | Toplam birikmiyor ya da hep son atış görünüyor | zar ve toplam doğru kullanılmış, A+B sıfırlıyor | Üçüncü değişken eklenmiş (en yüksek atış gibi) |\n| Zar ve karar | İki ayrı rastgele blok var ya da 6'da ezgi çalmıyor | Zar bir kez atılıyor, 6'da zafer ezgisi çalıyor | Ek kural var (1 gelince sıfırlama, 30'u aşınca mutlu yüz) |\n| Plan | Kural tablosu yok | Olay, iş ve değişken tablosu var | Tablo programla birebir uyuyor |\n| Anlatım | Ne yaptığını anlatamıyor | Her düğmenin işini adım adım anlatıyor | Bir hatayı nasıl bulduğunu anlatıyor |\n\n### Veli ve öğretmen notu\n- **Amaç.** Bu haftanın büyük fikri \"kart bekler, olay gelince çalışır\" ve \"kutu hatırlar\". Ezberletmeye gerek yoktur; öğrenci kendi sayacında ve zarında deneyerek görür.\n- **Nasıl destek olunur?** Takıldığında cevabı söylemek yerine şunu sor: \"Hangi düğmeye basınca hangi blok çalışıyor?\", \"Kutunun içinde şu an ne var?\", \"Bu sayıyı ekranda mı gösteriyorsun, yoksa yalnızca kutuyu mu değiştirdin?\"\n- **Olasılık.** Zar rastgeledir; 10 atışta hiç 6 gelmeyebilir. Bu hata değildir. Atış sayısını artırınca oranın altıda bire yaklaştığını konuşmak güzel bir sohbettir.\n- **Ses.** Zafer ezgisi için tarayıcı sayfada bir tıklama bekler. Ses duyulmazsa sağ paneldeki Hoparlör bölümüne bakın.\n- **Süre.** Dersleri aralıklı yapmak kalıcılığı artırır. Proje günü uzayabilir; yarım bırakmak sorun değildir.\n- **Güvenlik.** Bu platformdaki her şey sanaldır; gerçek bir parça, pil ya da kablo gerekmez.\n- **İlerleme.** Mini test sonuçları \"İlerlemem\" sayfasında beceri bazında görünür (taslak/pilot özellik; yalnız onay verildiyse kaydedilir).",
      "guideMdEn": "### Goals for the week\nBy the end of this week the learner can:\n1. Explain what an event is; use the A, B and A+B button event blocks.\n2. Show the difference between pressed, released and long pressed; use the logo as a source of events.\n3. Make a variable, set its value, make it bigger and smaller and show it on the screen (a counter).\n4. Write a program that makes decisions with the random number block and **if ... then**; say what the difference between assignment and comparison is.\n5. Build a scoreboard with three buttons, variables and a melody by following a rules table.\n\n### Plan for the week\nThe week has five lessons; each lesson takes about 20-35 minutes. The plan is for one lesson a day. If you want a busier timetable, you can combine lessons 1 and 2, or lessons 3 and 4.\n\n| Day | Lesson | Time | What you do |\n|---|---|---|---|\n| 1 | The A, B and A+B buttons | ~20 min | Read the explainer, give three icons to the three buttons, do the released and pause experiments, do the mini quiz. |\n| 2 | Counter and variable | ~25 min | Build the visitor counter; watch the two-digit number by pressing 12 times; make it count in fives. |\n| 3 | Electronic dice | ~25 min | Roll the dice once and put it in the box; show a heart on a 6; count how many sixes come up in 10 rolls. |\n| 4 | The logo, long presses and secret buttons | ~20 min | Build the logo and long press blocks; measure the 1-second time by watching it yourself. |\n| 5 | Project: Dice game scoreboard | ~35 min | Write the rules table, build the program, play the game with a friend, assess it with the rubric. |\n\n### Prerequisite check\nThis week, the learner needs to be able to do these things from the end of week 1:\n- Use the ▶ Run, ■ Stop and ↺ Reset buttons on the virtual card.\n- Attach blocks inside header blocks such as **on start** and **forever**.\n- Know the **show icon**, **show number**, **pause** and **clear screen** blocks.\n- Do the basic operations (addition, subtraction, multiplication) comfortably; the counter and total sums use them.\n\n### Concept map\n- **Event:** event block (header block) → button A, B, A+B → pressed, released, long pressed (1 second) → logo (touched, released)\n- **Data:** variable (a box with a name) → set to, change by → starting value → counter → total (accumulator)\n- **Decision:** random number (both ends included) → comparison (=, ≠, <, ≤, >, ≥) → if ... then → else\n- **Project:** rules table → zar and toplam → play melody (waits until it is over) → resetting\n\n### Common mistakes\n- **Not changing the button list.** A stays selected in both blocks; nothing happens when B is pressed.\n- **Pressing A, then B, and expecting A+B.** To press both at the same time, use the A+B button underneath the virtual card.\n- **Leaving a block outside the header block.** It looks faded and does not run.\n- **Changing the variable and forgetting to show it.** The box changes, but nothing happens on the screen.\n- **Showing first, then adding.** The counter is always one behind.\n- **Using two separate random blocks.** The number shown on the screen and the number compared turn out different; roll the dice once and put it in the box.\n- **Mixing up assignment and comparison.** \"set to\" puts a value in the box; \"=\" asks a question.\n- **Mixing up `>` and `≥`.** 5 > 5 is false; 5 ≥ 5 is true.\n- **Pressing for less than 1 second for a long press.** The event never comes.\n- **Forgetting to reset the total.** In a new game, it adds on top of the old score.\n\n### End-of-week review\n1. Look at the concept cards of each lesson once more and read the \"common mistake\" lines out loud.\n2. Read the explanations of the questions you got wrong in the mini quizzes again, then do the question again.\n3. Build the counter program from scratch, without looking; then press A 12 times and describe what you see on the screen.\n4. Add a rule to the dice program: a sad face on a 1, a heart on a 6. Make both branches with **if**.\n5. Answer in your own words: \"Without variables, how would the card keep track of the number of visitors?\"\n\nThe mini quizzes of the five lessons are enough as the end-of-week test; 5 questions in each lesson, 25 questions in total. Goal: at least 4 correct in each lesson. Go back to the explainer of any lesson that needs more work.\n\n### Project rubric (Dice game scoreboard)\n| Criterion | Developing | Secure | Advanced |\n|---|---|---|---|\n| Events | One of the buttons does not react | A, B and A+B work correctly | An extra event has been added (such as resetting with a long press) |\n| Variables | The total does not add up, or the last roll is always shown | zar and toplam are used correctly, A+B resets | A third variable has been added (such as the highest roll) |\n| Dice and decision | There are two separate random blocks, or no melody plays on a 6 | The dice is rolled once, the victory melody plays on a 6 | There is an extra rule (reset when a 1 comes up, a happy face when it goes over 30) |\n| Plan | There is no rules table | There is a table of events, jobs and variables | The table matches the program exactly |\n| Explaining | Cannot explain what they did | Explains each button's job step by step | Explains how they found a mistake |\n\n### Note for parents and teachers\n- **Aim.** The big ideas of this week are \"the card waits and runs when an event comes\" and \"the box remembers\". There is no need to make them memorise anything; the learner sees it by trying things out on their own counter and dice.\n- **How can you help?** When they get stuck, instead of giving the answer, ask: \"Which block runs when you press which button?\", \"What is in the box right now?\", \"Are you showing this number on the screen, or did you only change the box?\"\n- **Probability.** The dice is random; in 10 rolls there may be no 6 at all. This is not a bug. Talking about how the share gets closer to one in six as the number of rolls goes up makes a good conversation.\n- **Sound.** For the victory melody, the browser waits for a click on the page. If you cannot hear any sound, look at the Speaker section in the right panel.\n- **Time.** Spreading the lessons out helps learning stick. Project day may run long; it is fine to leave it half-finished.\n- **Safety.** Everything on this platform is virtual; no real parts, batteries or wires are needed.\n- **Progress.** Mini quiz results are shown by skill on the \"My progress\" page (draft/pilot feature; only saved if consent was given).",
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
          ],
          "contentEn": {
            "title": "The A, B and A+B buttons",
            "problem": "What happens when you press a doorbell button? The bell rings. The bell does not ring by itself; it waits for someone to press it. In computers, a rule like \"when something happens, do this\" is called an event. With the card's A and B buttons, you will write your first event blocks.",
            "contentMd": "### What is an event?\nUntil now, programs ran from start to finish on their own. In this lesson, though, the card **waits**. When you press a button, the jobs inside that button's block are done. These blocks that \"run when something happens\" are called event blocks.\n\nThe **on button [A] [pressed]** block in the **Input** category is a header block, like **on start**. It has two lists:\n\n- Button: **A**, **B** or **A+B**.\n- When: **pressed**, **released** or **long pressed**.\n\n### Program: feeling buttons\nThree **on button** blocks are already in the editor: for A, B and A+B. They are all empty. You will fill them in.\n\n1. Drag the **show icon** block from the **Basic** category into the first block (A). Choose **happy face** from the list.\n2. Put **show icon** in the second block (B) and choose **sad face** from the list.\n3. Put **show icon** in the third block (A+B) and choose **heart** from the list.\n4. Make sure the first drop-down list of the third block is **A+B**.\n5. ▶ **Run**.\n6. Click the A button on the virtual card, then B, then the A+B button underneath.\n\n### Expected result\nWhen you press A, the happy face appears; when you press B, the sad face appears. When you press A+B, the heart comes up. All four goals should have a ✓.\n\n### How does it work?\n- While the program is running, the event blocks quietly **wait**. When the button is pressed, the inside of that block runs from top to bottom, and when it is done, it goes back to waiting.\n- When A and B are both pressed at the same time, only the **A+B** event runs; the separate blocks of A and B do not run.\n- **pressed** runs the moment you press the button; **released** runs the moment you lift your finger. **long pressed** runs one second after you start holding the button down.\n- Events are independent of each other. A program can have as many event blocks as you like.\n\n### Try it\n1. Change the A block from **pressed** to **released**. When does the happy face come up?\n2. Add a second block inside the B block: **pause 1000 ms**, and under it **clear screen**. The sad face goes off after one second.\n3. Hold down the A button and let go after one second. Which block ran when? Tell a friend what you saw.\n\n### Common mistakes\n- **Forgetting to change the button list.** If A stays selected in both blocks, both blocks react to A; nothing happens when you press B.\n- **Pressing one after the other instead of A+B.** Pressing A and then B separately does not produce the A+B event. To press both at the same time, use the **A+B** button underneath the virtual card.\n- **Leaving a block outside the header block.** A **show icon** that you put outside the event block never runs. It looks faded.",
            "question": "Which devices in everyday life work when you press a button? If you compare the buttons on a games console with the card's A, B and A+B buttons, what do you think you would need most?",
            "explainerMd": "### What you will learn in this lesson\n- What an event is and why we need blocks that \"run when something happens\"\n- The card's three buttons: **A**, **B** and **A+B**\n- Three different moments for a button: pressed, released, long pressed\n- That several event blocks can live side by side in one program\n\n### What you should know first\n- Lessons 1-2: using the editor, dragging and attaching blocks, the ▶ **Run** button\n- Lesson 3: the **show icon** block\n- Lessons 4-5: header blocks such as **on start** and **forever**; the rule \"a block outside a header block does not run\"\n\n### Waiting is a program too\nUntil now, programs started by themselves and flowed from start to finish. Real devices often do not work like this. Inside a lift, everything waits quietly until you press a button. When you press it, something happens, and then it waits again. Computer people call this \"when something happens\" situation an **event**. A button being pressed, a button being released and the logo being touched are all events.\n\n### Event block: a header block\nThe **on button [A] [pressed]** block is a header block, like **on start**. But it does not run straight away. First it sleeps. When the event comes, the blocks inside it run from top to bottom, and when they are done, the block goes back to sleep. If the same event comes again, it runs again.\n\n### Three buttons, three moments\nThere are two buttons on the card. Underneath the virtual card there is also an **A+B** button that presses both at once. For each button you can choose three moments:\n\n| Moment | When it runs |\n|---|---|\n| pressed | The moment you press the button |\n| released | The moment you lift your finger |\n| long pressed | 1 second after you start holding it down |\n\nSo one short press produces two events: first pressed, then released.\n\n### A+B is a special button\nWhen A and B are pressed together, the card counts this as a **separate button**. Then only the A+B block runs, not the block of A or B. If you press A first and then B, A's block may already have run. To press both at the same time, use the **A+B** button underneath the virtual card.\n\n### Every event lives in its own block\nA program can have as many event blocks as you like. Three blocks written for A, for B and for A+B are independent of each other. Careful: if **A** stays selected in the lists of both blocks, both of them react to A, and nothing happens for B. The button list is the block's \"address\".\n\n### Summary\nAn event is a rule: \"when something happens, do this\". An event block is a header block; it sleeps and runs when the event comes. Every button has the moments pressed, released and long pressed. A+B is a separate event and does not run the blocks of A and B. A program can have several event blocks.",
            "concepts": [
              {
                "term": "Event",
                "definition": "A piece of news the card gets from outside: a button being pressed or released, or the logo being touched.",
                "example": "When the A button is pressed, the card gets an \"A pressed\" event.",
                "pitfall": "Thinking the program does everything from start to finish on its own; the inside of an event block does not run until the event comes."
              },
              {
                "term": "Event block",
                "definition": "A header block that runs the blocks inside it when an event comes; when no event comes, it waits.",
                "example": "The show icon you put inside the on button A pressed block runs only when you press A.",
                "pitfall": "Leaving blocks outside the event block: a block that is not attached never runs and looks faded."
              },
              {
                "term": "A+B button",
                "definition": "A separate button event that happens when A and B are pressed together.",
                "example": "If you put a heart in the A+B block, the heart appears when you press both at once.",
                "pitfall": "Pressing A and then B separately and expecting A+B; use the A+B button at the bottom of the virtual card."
              },
              {
                "term": "Pressed, released, long pressed",
                "definition": "The three moments of a button: the moment you press, the moment you lift your finger, 1 second after you start holding it down.",
                "example": "If you choose released, the icon appears the moment you lift your finger.",
                "pitfall": "Forgetting to change the second list and seeing the block always run on pressed."
              },
              {
                "term": "Independent events",
                "definition": "A program can have as many event blocks as you like, and each one listens to its own button.",
                "example": "A shows a happy face, B a sad face, A+B a heart; all three live in the same program.",
                "pitfall": "Leaving A selected in the button list of both blocks: both blocks react to A, and nothing happens when you press B."
              }
            ],
            "quiz": [
              {
                "id": "m10h2d6-q1",
                "kind": "mcq",
                "prompt": "The program is running, but no button is pressed. What happens to an \"on button A pressed\" block that has blocks inside it?",
                "options": [
                  "It keeps running from start to finish again and again",
                  "It waits; when A is pressed, the inside runs once",
                  "It runs once when the card starts",
                  "The card shows an error because nobody is pressing"
                ],
                "answer": 1,
                "explanation": "An event block is a header block and it sleeps. When the event comes, the inside runs once from top to bottom, then it waits again. Repeating all the time is the job of the \"forever\" block; running once at the start is the job of the \"on start\" block.",
                "skills": [
                  "mk-events"
                ]
              },
              {
                "id": "m10h2d6-q2",
                "kind": "predict-output",
                "prompt": "A program has these three event blocks:\n\n```\ncard.onButton(\"A\", \"press\", () => { screen.showNumber(1); });\ncard.onButton(\"B\", \"press\", () => { screen.showNumber(2); });\ncard.onButton(\"AB\", \"press\", () => { screen.showNumber(3); });\n```\n\nYou press the A+B button underneath the virtual card. What is shown on the screen?",
                "options": [
                  "1",
                  "2",
                  "3",
                  "First 1, then 2 appear"
                ],
                "answer": 2,
                "explanation": "When A and B are pressed together, the card counts it as a separate A+B event and only the A+B block runs. 1 or 2 do not appear, because the blocks of A and B do not run.",
                "skills": [
                  "mk-events"
                ]
              },
              {
                "id": "m10h2d6-q3",
                "kind": "find-bug",
                "prompt": "Ceylin wants a happy face when she presses A and a sad face when she presses B. But nothing happens when she presses B, and when she presses A she sees a sad face instead of a happy one. Her code:\n\n```\ncard.onButton(\"A\", \"press\", () => { screen.showIcon(\"happy\"); });\ncard.onButton(\"A\", \"press\", () => { screen.showIcon(\"sad\"); });\n```\n\nWhat is the bug?",
                "options": [
                  "The button list of the second block was left as A; it should have been B",
                  "showNumber should have been written instead of showIcon",
                  "\"long\" should have been written instead of \"press\"",
                  "The curly bracket of the second block is missing"
                ],
                "answer": 0,
                "explanation": "The button of both blocks is A. When A is pressed, both run, and because the second one comes later, the sad face stays. No block is listening to B. The button list is the block's address. The other options do not cause these symptoms.",
                "skills": [
                  "mk-events",
                  "prog-debug"
                ]
              },
              {
                "id": "m10h2d6-q4",
                "kind": "numeric",
                "prompt": "Your program has an \"on button A pressed\" block and an \"on button A released\" block. You press and release A briefly 4 times in a row. How many times in total does the inside of the two blocks run?",
                "answer": 8,
                "unit": "times",
                "explanation": "Each short press produces two events: one when you press and one when you let go. 4 presses x 2 events = 8. Counting only the pressed block and getting 4 leaves some out.",
                "skills": [
                  "mk-events"
                ]
              },
              {
                "id": "m10h2d6-q5",
                "kind": "mcq",
                "prompt": "Which one produces the card's A+B event?",
                "options": [
                  "Pressing and releasing A, then pressing and releasing B",
                  "Pressing A and B at the same time (on the virtual card, the A+B button underneath)",
                  "Only long pressing B",
                  "Touching the logo"
                ],
                "answer": 1,
                "explanation": "A+B happens when the two buttons are pressed together. Pressing one after the other produces two separate events. A long press is one of B's moment options, and the logo is a different source of events.",
                "skills": [
                  "mk-events"
                ]
              }
            ]
          }
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
          ],
          "contentEn": {
            "title": "Counter and variable",
            "problem": "Imagine someone at the door of a bus counting passengers. For each passenger they bend a finger once and keep the number in their head. So where does the card keep a number? Not in its head, but in a box: a variable.",
            "contentMd": "### Variable: a labelled box\nA **variable** is a box with a name written on it. It stores a number or a text inside. You can put a new value in the box, look at what is inside, and make the number inside bigger or smaller.\n\nA variable called **sayi** (Turkish for \"number\") is already in the editor. To make a new variable in your own projects, you click the **Make a variable...** button in the **Variables** category and type a name.\n\nThe blocks in the **Variables** category:\n\n- **set sayi to [0]:** puts a new number in the box.\n- **change sayi by [1]:** makes the number in the box bigger by the given amount (if you type a minus number, it makes it smaller).\n- **sayi:** gives the number inside the box. It fits into the hole of another block.\n\n### Program: visitor counter\nThe **on start** block and three **on button** blocks (A, B, A+B) are already in the editor.\n\n1. Put the **set sayi to [0]** block from the **Variables** category inside **on start**. Make sure it is zero.\n2. Attach the **change sayi by [1]** block inside the A block.\n3. Under it, add the **show number [0]** block from the **Basic** category.\n4. Remove the 0 inside this block: grab the **sayi** block from the **Variables** category and drop it on top of the 0.\n5. Do the same in the B block, but use **change sayi by [-1]**.\n6. Put **set sayi to [0]** inside the A+B block, and add **show number sayi** under it.\n7. ▶ **Run**. Press A three times, then B once, then A+B.\n\n### Expected result\nEach time you press A, the screen shows 1, 2, 3. When you press B, it goes down to 2. A+B shows 0 on the screen and resets the counter. All four goals should have a ✓.\n\n### How does it work?\n- The **on start** block resets the counter. That way the counter clearly starts from 0 every time it runs.\n- **change sayi by 1** makes the number in the box 1 bigger. First it reads the old value, adds 1 and puts the new value back.\n- **show number [sayi]** first looks in the box, takes the number inside and shows it on the screen. The name of the box is not written on the screen; the number inside it is.\n- When the number reaches 10, there are two digits on the screen and the number scrolls. Minus numbers scroll too, together with the minus sign.\n- In the **JavaScript** tab you will see the line `let count = 0;` at the very top. That is where the variable's box is made.\n\n### Try it\n1. Press A 12 times in a row. What does a two-digit number look like on the screen?\n2. What does the counter do if you press B at the start? Can it go below zero?\n3. Change the 1 in the **change sayi by [1]** block to 5. The counter now counts in fives.\n\n### Common mistakes\n- **Forgetting to show the number.** The variable's box changes, but if there is no **show number** block, you see nothing on the screen.\n- **Not resetting in on start.** The card counts a variable that has never been given a value as 0. Still, writing 0 clearly in on start lets anyone reading the program see what it starts with.\n- **Pressing too fast.** Showing the number takes some time. If you press many times very quickly, some of the presses wait in a queue or may be skipped. Press a little more slowly.",
            "question": "Without variables, how would the card remember the number? Think of something from your own life whose value you keep changing: like your score in a game or the money in your pocket. What name would you give the box you put it in?",
            "explainerMd": "### What you will learn in this lesson\n- What a **variable** is and why we think of it as a \"labelled box\"\n- How to put a value in a box and make the value in the box bigger or smaller\n- How to show the number inside the box on the screen\n- How a counter program works\n\n### What you should know first\n- Lesson 6: button events (putting jobs inside the A, B and A+B blocks)\n- Lessons 1-5: the **show number** block and the **on start** header block\n\n### What does the card remember?\nWhen an event is over, everything inside the block is forgotten. When you press A a second time, the card does not know about the first press by itself. You need to write it down somewhere. That place is a **variable**.\n\n### Variable: a box with a name\nA variable is a box with its name written on it. There is always just one value in the box. When you put a new value in the box, the old one is wiped. You choose the name: **sayi** (number), **puan** (score), **zar** (dice). The name should tell you what is inside.\n\n### Three things you can do with a box\n| Block | What it does | Example (when the box is 4) |\n|---|---|---|\n| set sayi to [7] | Wipes the old one, puts the new one in | The box becomes 7 |\n| change sayi by [3] | Adds to the current number | The box becomes 7 |\n| sayi | Reads what is inside | Gives 4 |\n\nIf you add a minus number, the number in the box gets smaller: if you add -1 to 4, it becomes 3.\n\n### The name of the box, or what is inside?\nIn the **show number [sayi]** block, what is written on the screen is not the name of the box but the number inside it. If the box is 3, the screen shows 3. Also, changing the variable does not change the screen. If you want to see it on the screen, you need to use the show number block too.\n\n### Starting value\nPutting a value in the box on purpose at the start of the program is a good habit. If you put **set sayi to 0** in the **on start** block, the counter starts from zero every time you press ▶. Anyone reading the program can also see what it starts with.\n\n### How does a counter work?\nWhen A is pressed, three things happen in order: the card looks in the box, adds 1 and puts the new number in the box. Then it shows it on the screen. On the first press 0 + 1 = 1, on the second 1 + 1 = 2. Each press uses the number left from the press before. The variable builds the bridge between events.\n\n### Summary\nA variable is a box that has a name and holds one value. You manage it with the set, change and read blocks. To see it on the screen, you need the show number block. Resetting the box at the start of the program keeps counters working properly. A counter is a program that, at every event, reads the old value in the box and adds to it.",
            "concepts": [
              {
                "term": "Variable",
                "definition": "A box that has a name and stores a single value inside it; the value stays there even when an event is over.",
                "example": "The box called sayi remembers the previous number each time you press A.",
                "pitfall": "Thinking a variable is only a label; the value inside it changes and the old one is wiped."
              },
              {
                "term": "set to",
                "definition": "Puts a new value in the box; the old value is wiped.",
                "example": "set sayi to 0 resets the counter.",
                "pitfall": "Mixing up \"set to\" and \"change by\": set wipes the old one, change adds to it."
              },
              {
                "term": "change by",
                "definition": "Makes the number in the box bigger by the given amount; if you give a minus number, it makes it smaller.",
                "example": "When sayi is 4, change by -1 makes sayi 3.",
                "pitfall": "Looking for a separate block to make it smaller; adding a minus number is enough."
              },
              {
                "term": "Starting value",
                "definition": "The first value you put in the box on purpose when the program starts.",
                "example": "set sayi to 0 in the on start block starts the counter from zero every time you run it with ▶.",
                "pitfall": "Not writing a starting value; the card still counts it as 0, but someone reading the program cannot see what it starts with."
              },
              {
                "term": "Showing a variable",
                "definition": "If you put the sayi block into the show number block, the screen shows the number inside the box, not its name.",
                "example": "When sayi is 3, show number [sayi] shows 3 on the screen.",
                "pitfall": "Changing the box without adding a show block: the variable goes up, but you see nothing on the screen."
              }
            ],
            "quiz": [
              {
                "id": "m10h2d7-q1",
                "kind": "mcq",
                "prompt": "If the box is 4 and the \"change sayi by [3]\" block runs, what is in the box?",
                "options": [
                  "The box holds 3; the 4 is wiped",
                  "The box holds 7",
                  "The box stays at 4, and 3 appears on the screen",
                  "The box holds 12"
                ],
                "answer": 1,
                "explanation": "\"Change by\" adds to the current number: 4 + 3 = 7. Making the box 3 is the job of the \"set to\" block. The change block does not change the screen, and it does not multiply either.",
                "skills": [
                  "mk-variables"
                ]
              },
              {
                "id": "m10h2d7-q2",
                "kind": "predict-output",
                "prompt": "At the start, sayi = 0. While this program runs, the buttons A, A, B, A are pressed in this order:\n\n```\ncard.onButton(\"A\", \"press\", () => {\n  sayi += 2;\n  screen.showNumber(sayi);\n});\ncard.onButton(\"B\", \"press\", () => {\n  sayi += -1;\n  screen.showNumber(sayi);\n});\n```\n\nWhich number is on the screen after the last press?",
                "options": [
                  "3",
                  "4",
                  "5",
                  "6"
                ],
                "answer": 2,
                "explanation": "0 → A: 2 → A: 4 → B: 3 → A: 5. Each press carries on from the last value in the box. The last press is A, so the screen shows 5. Getting 3 means skipping the last A press.",
                "skills": [
                  "mk-variables",
                  "mk-events"
                ]
              },
              {
                "id": "m10h2d7-q3",
                "kind": "find-bug",
                "prompt": "Baran's counter shows 0 on the first press and 1 on the second press; so it is always one behind:\n\n```\ncard.onButton(\"A\", \"press\", () => {\n  screen.showNumber(sayi);\n  sayi += 1;\n});\n```\n\nWhere is the problem?",
                "options": [
                  "Showing is done before adding; the two lines are in the wrong order",
                  "The sayi variable was never made",
                  "-= 1 should be written instead of += 1",
                  "showText is needed instead of showNumber"
                ],
                "answer": 0,
                "explanation": "The number written on the screen is the value before adding. You need to add first and then show it. The variable exists, the sign is right, and showNumber is enough to show a number.",
                "skills": [
                  "mk-variables",
                  "prog-debug"
                ]
              },
              {
                "id": "m10h2d7-q4",
                "kind": "numeric",
                "prompt": "sayi is 0 at the start. The A block does \"change sayi by 5\" and the B block does \"change sayi by -2\". If you press A 3 times and B 4 times, what is sayi?",
                "answer": 7,
                "explanation": "A adds 3 x 5 = 15, B adds 4 x (-2) = -8. 15 - 8 = 7. The order of the presses does not change the result, because they are all added up.",
                "skills": [
                  "mk-variables"
                ]
              },
              {
                "id": "m10h2d7-q5",
                "kind": "mcq",
                "prompt": "Your program has \"change sayi by 1\" when you press A, but there is no \"show number\" block at all. What happens if you press A?",
                "options": [
                  "The variable goes up, but you see nothing on the screen",
                  "The variable does not go up",
                  "The card shows an error",
                  "sayi appears on the screen automatically"
                ],
                "answer": 0,
                "explanation": "Changing the variable does not change the screen. The box goes up, but to see it you need the show number block. The card does not show an error in this case.",
                "skills": [
                  "mk-variables",
                  "mk-events"
                ]
              }
            ]
          }
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
          ],
          "contentEn": {
            "title": "Electronic dice",
            "problem": "When you roll a dice, nobody knows what will come up; that is exactly why games are exciting. Computers can make \"random\" numbers too. So what if we put a dice inside the card, and something surprising happens when a 6 comes up?",
            "contentMd": "### Random number\nThe **random number from [1] to [6]** block in the **Math** category gives a random whole number between these two numbers (including both ends) every time it runs. Like the faces of a dice: 1, 2, 3, 4, 5 or 6.\n\n### Asking a question: if\nThe **if ... then** block in the **Logic** category makes a decision based on a question. If the question is true, the blocks inside it run; if not, they are skipped. For the question you use the **comparison** block from the same category. It is a block with the options **=**, **≠**, **<**, **≤**, **>**, **≥** in its middle part.\n\nCareful: **set zar to 6** is an **assignment**: it puts 6 in the box. **zar = 6**, on the other hand, is a **question**: is there a 6 in the box? Its answer is true or false. (**zar** is Turkish for \"dice\".)\n\n### Program: roll the dice, show a heart on a 6\nThe A button's block is already in the editor.\n\n1. Click the **Make a variable...** button in the **Variables** category. Type the name **zar**.\n2. Put the **set zar to [0]** block from the **Variables** category inside A.\n3. Take the **random number from [1] to [6]** block from the **Math** category and drop it in place of the \"0\".\n4. Under it, attach the **show number** block from the **Basic** category. Replace the number inside it with the **zar** block.\n5. Take the **if ... then** block from the **Logic** category and attach it at the very bottom.\n6. Attach the comparison block to the \"if\" slot of the if block. Put the **zar** block in the left hole and 6 in the right hole. Make sure the sign in the middle is **=**.\n7. Put a **show icon** block inside the if block and choose **heart**.\n8. ▶ **Run**. Roll the dice by pressing A. Keep going until you get a 6.\n\n### Expected result\nEach time you press A, a digit from 1 to 6 appears on the screen for about half a second. When a 6 comes up, a heart appears on the screen after the digit disappears. All four goals should have a ✓.\n\n### How does it work?\n- We make the random number **once** and put it in the **zar** box. That way the number we show on the screen and the number we compare are the same.\n- Every time a **random number** block runs, it makes a new number. If we used two separate random blocks for showing and comparing, the number we show and the number we compare could turn out different.\n- The if block runs after the number has finished showing. The digit stays for half a second, then the heart appears.\n- In the **JavaScript** tab you will see the lines `zar = randomInt(1, 6);` and `if (zar == 6)`.\n\n### Try it\n1. Make the dice go from 1 to 20. On which number would you like to show the heart?\n2. In the **Logic** category there are two kinds of **if** block: one with only **then**, and another with **then ... else**. Take the second one: show a heart when a 6 comes up, and a sad face when it does not.\n3. Press A 10 times and count how many times a 6 came up. How often do you think a 6 should come up?\n\n### Common mistakes\n- **Mixing up the single equals sign.** **set zar to 6** always makes the dice 6. In the comparison block, **=** must be selected.\n- **Using two random blocks for the same dice.** Take the digit and the comparison from the same box (zar).\n- **Not seeing the heart and thinking it is a bug.** When a 6 does not come up, the heart never appears. Press a few more times.",
            "question": "What could be the difference between a real dice and a random number on a computer? If you see the same number twice in a row, is that a bug, or part of being random?",
            "explainerMd": "### What you will learn in this lesson\n- What the random number block gives and why a different number comes up each time\n- How to make the program decide with the **if ... then** block\n- The difference between assignment and comparison\n- Why it is important to store a random result in a variable\n\n### What you should know first\n- Lesson 6: button events\n- Lesson 7: making a variable, setting its value, putting a variable into the hole of a block\n- Lessons 1-5: the **show number** and **show icon** blocks\n\n### Random number: the card's dice\nThe **random number from [1] to [6]** block gives 1, 2, 3, 4, 5 or 6 every time it runs. Both ends are included, so 1 and 6 can both come up. 0 or 7 never come up. Neither you nor the card knows in advance which number will come up. On a fair dice every face has the same chance: the chance of getting a 6 is one in six.\n\n### Rolling the same dice twice\nEvery time the random block runs, it rolls a **new** dice. If you put two separate blocks, one to show the number on the screen first and one to check whether it is a 6, you have rolled two separate dice. While you see 3 on the screen, the card may have seen 6. The fix: roll the dice once and put the result in the box called **zar** (dice). Use the box both when showing and when comparing.\n\n```\nzar = randomInt(1, 6);\nscreen.showNumber(zar);\nif (zar == 6) { ... }\n```\n\n### If ... then: asking a question\nThe **if** block asks a question. If the answer is true, the blocks inside it run; if it is false, the inside of the block is skipped and the program carries on below. Questions are asked with the **comparison** block: **=**, **≠**, **<**, **≤**, **>**, **≥**. The result of a comparison is \"true\" or \"false\".\n\n| Question | When zar is 6 | When zar is 4 |\n|---|---|---|\n| zar = 6 | true | false |\n| zar > 4 | true | false |\n| zar ≥ 4 | true | true |\n| zar ≠ 6 | false | true |\n\n### Assignment and comparison are different\n**set zar to 6** is a command: it puts 6 in the box. **zar = 6** is a question: is there a 6 in the box? The command changes the box; the question does not. If you mix them up, the dice always comes up 6.\n\n### If and else\nYou can add an \"else\" branch to the if block. If the question is true, the top branch runs; if it is false, the bottom branch runs; they never both run. Showing a heart when a 6 comes up and a sad face when it does not is an example of this.\n\n### Summary\nThe random number block makes a new whole number every time it runs, including both ends. If you are going to use a result in several places, store it in a variable. The if block runs or skips its inside depending on a comparison question. The set command changes the box; the = question looks at the box. The else branch runs exactly one of the two options.",
            "concepts": [
              {
                "term": "Random number",
                "definition": "A block that, every time it runs, gives a whole number between the two numbers you set (including both ends) that cannot be known in advance.",
                "example": "Random number from 1 to 6 is like rolling a dice: 1, 2, 3, 4, 5 or 6 comes up.",
                "pitfall": "Thinking it is a bug when the same number comes up twice in a row; with randomness this can happen."
              },
              {
                "term": "if ... then",
                "definition": "Looks at a question; if the answer is true, it runs the blocks inside it, and if it is false, it skips them.",
                "example": "if zar = 6 then show heart: the heart appears only when a 6 comes up.",
                "pitfall": "Thinking it is a bug when you do not see the heart; if the question is false, the block is skipped on purpose."
              },
              {
                "term": "Comparison",
                "definition": "A block that compares two values with =, ≠, <, ≤, > or ≥ and gives the result true or false.",
                "example": "The question zar > 4 is true for 5 and 6 and false for the others.",
                "pitfall": "Mixing up > and ≥: if it is zar > 4, it is not true when a 4 comes up, but with zar ≥ 4 it is."
              },
              {
                "term": "Assignment versus comparison",
                "definition": "\"set to\" is a command that puts a value in the box; \"=\" is a question that does not change the box.",
                "example": "set zar to 6 puts 6 in the box; zar = 6 asks \"is there a 6 in the box?\"",
                "pitfall": "Using an assignment instead of a question: the dice is always 6 and the heart appears every time."
              },
              {
                "term": "Storing the result in a variable",
                "definition": "Making the random number once, putting it in a box and using the box everywhere.",
                "example": "zar = randomInt(1, 6); then you write both showNumber(zar) and if (zar == 6).",
                "pitfall": "Using two separate random blocks for showing and comparing: two different dice are rolled."
              }
            ],
            "quiz": [
              {
                "id": "m10h2d8-q1",
                "kind": "mcq",
                "prompt": "Which numbers can the \"random number from [1] to [6]\" block give?",
                "options": [
                  "Only 2, 3, 4, 5",
                  "1, 2, 3, 4, 5 and 6 (including both ends)",
                  "From 0 to 6",
                  "From 1 to 7"
                ],
                "answer": 1,
                "explanation": "The block picks one of the whole numbers including both ends: 1 and 6 can come up too. 0 and 7 are outside the range.",
                "skills": [
                  "mk-random"
                ]
              },
              {
                "id": "m10h2d8-q2",
                "kind": "find-bug",
                "prompt": "Defne's dice sometimes shows 3 and also shows the heart, and sometimes shows 6 and does not bring up the heart:\n\n```\ncard.onButton(\"A\", \"press\", () => {\n  screen.showNumber(randomInt(1, 6));\n  if (randomInt(1, 6) == 6) {\n    screen.showIcon(\"heart\");\n  }\n});\n```\n\nWhat is the problem?",
                "options": [
                  "The number shown and the number compared come from two separate random rolls; she should put the result in a variable and use it in both",
                  "showIcon is spelt wrong",
                  "+= should be written instead of ==",
                  "7 should be written instead of 6, because the dice goes up to 7"
                ],
                "answer": 0,
                "explanation": "Every random block rolls a new dice. The number on the screen and the number the if looks at are independent of each other. The fix: write zar = randomInt(1, 6) and use showNumber(zar) and if (zar == 6). == is the right sign for comparing, and the largest value of the dice is 6.",
                "skills": [
                  "mk-random",
                  "mk-variables",
                  "prog-debug"
                ]
              },
              {
                "id": "m10h2d8-q3",
                "kind": "numeric",
                "prompt": "Every face of a fair dice has the same chance, so the chance of getting a 6 is one in six. If you roll the dice 60 times, about how many 6s would you expect on average?",
                "answer": 10,
                "unit": "times",
                "explanation": "One sixth of 60 rolls is 60 / 6 = 10. The real number could be 8 or 12; 10 is the average you expect, not a certain result.",
                "skills": [
                  "mk-random"
                ]
              },
              {
                "id": "m10h2d8-q4",
                "kind": "predict-output",
                "prompt": "This code runs when A is pressed:\n\n```\ncard.onButton(\"A\", \"press\", () => {\n  zar = 5;\n  screen.showNumber(zar);\n  if (zar > 5) {\n    screen.showIcon(\"heart\");\n  }\n});\n```\n\nWhat happens on the screen?",
                "options": [
                  "First 5 appears, then the heart comes",
                  "Only 5 appears; the heart never appears",
                  "Only the heart appears",
                  "Nothing appears"
                ],
                "answer": 1,
                "explanation": "5 > 5 is false, because 5 is not greater than 5; the inside of the if is skipped and the heart does not appear. To see the heart, zar ≥ 5 would be needed. The digit is shown with showNumber.",
                "skills": [
                  "mk-conditions",
                  "mk-variables"
                ]
              },
              {
                "id": "m10h2d8-q5",
                "kind": "mcq",
                "prompt": "What is the difference between \"set zar to 6\" and \"zar = 6\"?",
                "options": [
                  "They are the same thing",
                  "The first puts 6 in the box (a command); the second asks whether there is a 6 in the box (a question)",
                  "The first asks a question; the second puts 6 in the box",
                  "Both show 6 on the screen"
                ],
                "answer": 1,
                "explanation": "An assignment changes the value of the box. A comparison looks without changing it and gives true or false. If you mix them up, the dice is always 6. Neither writes to the screen; for the screen you need show number.",
                "skills": [
                  "mk-conditions",
                  "mk-variables"
                ]
              }
            ]
          }
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
          ],
          "contentEn": {
            "title": "The logo, long presses and secret buttons",
            "problem": "Some toys have a secret button; it only works when you touch the right spot or press for a while. The star-shaped logo on top of the card is a touch-sensitive button too. In this lesson you will add secret doors to your card.",
            "contentMd": "### The logo: a touch star\nThe star-shaped logo on top of the card is a **touch button**. On the virtual card, if you press on it with the mouse and hold, it is \"touched\"; if you let go, it is \"released\".\n\nThe **Input** category has this block:\n\n- **when logo is [touched]:** runs the moment the logo is touched. If you choose **released** from the list, it runs the moment you lift your finger.\n\n### Long press\nEarlier you looked at the second list of the **on button [A] [pressed]** block. It had three options: **pressed**, **released**, **long pressed**. The **long pressed** option runs when you **hold the button down for 1 second**.\n\n### Program: secret buttons\nThree event blocks are already in the editor: one **when logo is touched**, one **when logo is released** and one **on button A long pressed**.\n\n1. Put **show icon** from the **Basic** category inside the **when logo is touched** block and choose **heart**.\n2. Put the **clear screen** block from the **Basic** category inside the **when logo is released** block.\n3. Put **show icon** inside the **on button A long pressed** block and choose **sleeping face**.\n4. ▶ **Run**.\n5. On the virtual card, press on the logo with the mouse and hold it: the heart will appear. Let go: the screen will go dark.\n6. Hold the A button down for 1 second or longer.\n\n### Expected result\nWhen you touch the logo, the heart appears; when you lift off, the screen goes dark. When you press A for longer than a second, the sleeping face comes up. All four goals should have a ✓.\n\n### How does it work?\n- The logo is a source of events too, just like the A and B buttons: being touched and being released make two separate events.\n- If you press the A button briefly, nothing happens in this program, because we only wrote a **long pressed** block.\n- A long press is triggered **1 second** after the moment you press the button. If you let go before a second has passed, there is no long press.\n- **pressed** and **long pressed** blocks for the same button can be used together. If you press for a long time, both run: first the short one, and one second later the long one.\n\n### Try it\n1. Show a **happy face** when you touch the logo and a **sad face** when you let go. The logo is like a mood button.\n2. Add a **pressed** block for A as well: make it show a face. Do you see two different things when you press for a long time?\n3. Make a **long pressed** block for B too: make it clear the screen. Let it be a secret button that resets the card.\n\n### Common mistakes\n- **Not changing the list in the logo block.** If **touched** stays selected in both, the **clear screen** block does not run when you let go.\n- **Pressing too briefly for a long press.** You need to hold it down for a full second. Hold the virtual button down; do not let go quickly.\n- **Clicking the logo and letting go straight away.** The heart appears for a moment and goes off. If you hold it down, the heart stays on the screen.",
            "question": "What jobs is a long press used for on phones or toys? Why would we want to give different jobs to a short press and a long press?",
            "explainerMd": "### What you will learn in this lesson\n- That the logo on top of the card gives events too, like a button\n- The difference between the **touched** and **released** events\n- When the long press event runs\n- How to give the same button both a short-press job and a long-press job\n\n### What you should know first\n- Lesson 6: the button event block and the pressed, released, long pressed list\n- Lesson 3: **show icon**; lesson 2: **clear screen**\n\n### The logo: a touch star\nThe star-shaped logo on top of the card is touch-sensitive. On the virtual card, if you hold the mouse down on it, it counts as \"touched\"; if you let go, it counts as \"released\". The logo has two events:\n\n| Event | When |\n|---|---|\n| touched | The moment your finger touches the logo |\n| released | The moment your finger leaves the logo |\n\nIt is the same idea as with the buttons: you can give two separate jobs to two separate blocks. For example, a heart when touched and clear screen when released.\n\n### Time: 1 second\nThe **long pressed** event runs **1 second (1000 ms)** after the moment you press the button, if the button is still pressed. If you press for 0.9 seconds and let go, the event never comes. Once it has run, it does not run again, even if you keep holding the button.\n\n### How many events in one press?\nIf you write a **pressed**, a **long pressed** and a **released** block for one button, a very long press triggers all three. The order is like this:\n\n```\nt = 0 ms     pressed runs\nt = 1000 ms  long pressed runs\nt = 2500 ms  (finger lifted) released runs\n```\nIn a short press (say 300 ms), only pressed and released run; the long event does not come.\n\n### The secret button idea\nA long press is good for jobs that should not run by accident. That is why the \"reset\" buttons on toys often need a long press. If you want something to be easy to do, give it to a short press; if you want to protect a serious job, give it to a long press.\n\n### Things to watch out for\n- Choose the right list in each block. If **touched** stays in both blocks, both of them run when you touch.\n- One screen action writes over another: the block that runs later is what you see.\n\n### Summary\nThe logo is a source of events like A and B, and it gives the touched and released events. The long pressed event comes once if the button stays pressed for 1 second. A short press produces pressed and released; a long press adds the long event to them. Each event gives a job to its own block; choosing the right list is important.",
            "concepts": [
              {
                "term": "Logo",
                "definition": "The star-shaped, touch-sensitive area on top of the card; it gives events like a button.",
                "example": "On the virtual card, holding the mouse down on the logo counts as \"touched\".",
                "pitfall": "Thinking the logo is only decoration; it is a source of events."
              },
              {
                "term": "touched and released (logo)",
                "definition": "The two events of the logo: when a finger touches it and when the finger leaves it.",
                "example": "Show a heart when touched, clear the screen when released: the heart stays as long as you hold it.",
                "pitfall": "Leaving touched selected in both blocks; the clear block runs on the touch, not on the release."
              },
              {
                "term": "Long press",
                "definition": "An event that comes once if the button stays pressed for 1 second (1000 ms).",
                "example": "When you hold A down for 1.2 seconds, the sleeping face appears.",
                "pitfall": "Pressing for 0.5 seconds and expecting a long press; if you let go before 1 second, the event never comes."
              },
              {
                "term": "Using short and long presses together",
                "definition": "You can write both a pressed and a long pressed block for the same button; on a long press, both run.",
                "example": "First the short block runs the moment you press, and 1 second later the long block runs.",
                "pitfall": "Thinking only the long block runs on a long press; the pressed block has already run."
              },
              {
                "term": "Secret button",
                "definition": "A job linked to a long press or to the logo, not a short press, so that it is not pressed by accident.",
                "example": "A reset button that clears the screen when you long press B.",
                "pitfall": "Linking an important job to a short press; it could run by accident."
              }
            ],
            "quiz": [
              {
                "id": "m10h2d9-q1",
                "kind": "mcq",
                "prompt": "When does the inside of the \"on button A long pressed\" block run?",
                "options": [
                  "Every time you press A",
                  "When you lift your finger from A",
                  "1 second after you press A, if the button is still pressed",
                  "When you press A and let go 1 second later"
                ],
                "answer": 2,
                "explanation": "A long press comes 1 second after you start holding the button, while it is still pressed; it does not wait for you to lift your finger. Lifting it is a separate event: released.",
                "skills": [
                  "mk-input-timing"
                ]
              },
              {
                "id": "m10h2d9-q2",
                "kind": "numeric",
                "prompt": "Each block adds 1 to the variable total. The program has all three blocks for A: \"pressed\", \"long pressed\" and \"released\". You press A at t = 0 and let go at t = 3000 ms. What is the total?",
                "answer": 3,
                "explanation": "Once on the press, once for the long press when 1 second has passed, once on the release: 3 events. The long press does not repeat while the button stays pressed.",
                "skills": [
                  "mk-input-timing",
                  "mk-variables"
                ]
              },
              {
                "id": "m10h2d9-q3",
                "kind": "predict-output",
                "prompt": "The program has two logo blocks:\n\n```\ncard.onLogo(\"touch\", () => { screen.showIcon(\"heart\"); });\ncard.onLogo(\"release\", () => { screen.clear(); });\n```\n\nYou touch the logo at t = 0 s and lift your finger at t = 2 s. What does the screen look like at t = 1 s and t = 3 s?",
                "options": [
                  "A heart at 1 second, an empty screen at 3 seconds",
                  "A heart at both",
                  "An empty screen at 1 second, a heart at 3 seconds",
                  "An empty screen at both"
                ],
                "answer": 0,
                "explanation": "At the moment of the touch the heart comes up and stays on the screen until the finger is lifted. When the finger is lifted, the clear block runs; at 3 seconds the screen is empty.",
                "skills": [
                  "mk-input-timing",
                  "mk-events"
                ]
              },
              {
                "id": "m10h2d9-q4",
                "kind": "find-bug",
                "prompt": "Elif wants a heart when she touches the logo and a dark screen when she lets go. But as soon as she touches it, the heart appears and goes off straight away:\n\n```\ncard.onLogo(\"touch\", () => { screen.showIcon(\"heart\"); });\ncard.onLogo(\"touch\", () => { screen.clear(); });\n```\n\nWhat is the bug?",
                "options": [
                  "The moment list of the second block was left as \"touch\"; it should be \"release\"",
                  "showNumber is needed instead of showIcon",
                  "The first block needs to be \"release\"",
                  "screen.clear() never runs"
                ],
                "answer": 0,
                "explanation": "Both blocks are listening to the moment of the touch; the second one clears the screen straight after the first. The moment list of the clear block should be released. The first block is right, and clear does run.",
                "skills": [
                  "mk-input-timing",
                  "prog-debug"
                ]
              },
              {
                "id": "m10h2d9-q5",
                "kind": "mcq",
                "prompt": "The program has both a \"pressed\" block (heart) and a \"long pressed\" block (sleeping face) for A. You press A for 0.3 seconds and let go. What happens?",
                "options": [
                  "Only the sleeping face appears",
                  "Only the heart appears; the long press never comes",
                  "First the heart, then the sleeping face appears",
                  "Nothing happens"
                ],
                "answer": 1,
                "explanation": "When you press, the heart runs. The button is let go before 1 second has passed, so the long press never happens. The sleeping face only appears if you press for at least 1 second.",
                "skills": [
                  "mk-input-timing",
                  "mk-events"
                ]
              }
            ]
          }
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
          ],
          "contentEn": {
            "title": "Project: Dice game scoreboard",
            "problem": "In board games you roll dice, add up points and find out who wins. Someone always has to keep the score. In this project your card will roll the dice and add up the points, and it will even play victory music when a 6 comes up. That way it will be the game table's only helper!",
            "contentMd": "### Project: Dice game scoreboard\nYou will bring together everything you learnt this week: button events, variables, random numbers and if.\n\n**Rules:**\n- **A:** rolls the dice, shows the result on the screen and adds it to the **toplam** (total) score. If a 6 comes up, a victory melody plays.\n- **B:** shows the total score.\n- **A+B:** resets the total and shows 0 on the screen.\n\n### New block: play melody\nThe **play melody [Ode to joy]** block in the **Music** category plays a ready-made piece of music. Choose **Fanfare** from the list. The next block waits until the melody is over. The sound comes from the virtual speaker. Your browser waits for one click on the page before it will make sound. If you cannot hear anything, check that the **Speaker** section in the card's right panel says **Sound on**.\n\n### Step by step\nThe **on start**, A, B and A+B blocks are already in the editor. The **zar** (dice) and **toplam** (total) variables are ready too.\n\n1. **A button:**\n   1. Put a **set zar to [0]** block and attach **random number from [1] to [6]** inside it.\n   2. Under it, put the **change toplam by [1]** block. Attach the **zar** variable in place of the number.\n   3. Add a **show number** block and put **zar** inside it.\n   4. Add an **if ... then** block: the condition is **zar = 6**.\n   5. Put the **play melody** block from the **Music** category inside the if, and choose **Fanfare**.\n2. **B button:** put **show number** inside it and attach the **toplam** variable.\n3. **A+B button:** **set toplam to [0]**, then show 0 (or **toplam**) with **show number**.\n4. ▶ **Run**. Press A at least five times and keep going until a 6 comes up. Then press B, and finally A+B.\n\n### Expected result\nEach time you press A, a digit from 1 to 6 appears on the screen for about half a second. When a 6 comes up, the victory melody plays. When you press B, the total so far scrolls across the screen (for example 17). When you press A+B, 0 appears on the screen. All five tasks in the Goals box should have a ✓.\n\n### How does it work?\n- **zar** holds the current roll, and **toplam** holds the total of all the rolls. On every roll, the total grows with **change toplam by zar**.\n- The **if zar = 6 then** block plays the victory music only when a 6 comes up. For any other number it is skipped.\n- The **on start** block resets the total. That way every run starts from zero.\n- While the melody is playing, the A block waits until it has finished. If you press A again before the melody ends, the new press waits in the queue.\n- Read the whole program in the **JavaScript** tab: can you find the line `total += zar;`? This is the code version of the word \"change\" in the block.\n\n### Try it\n1. Make a happy face come up when the total goes over 30. Hint: add another **if toplam > 30 then** block to A.\n2. Add a \"reset the score\" as a long press on B. Then there are two separate ways to reset.\n3. Choose another melody for the victory. Which one sounds most like victory music to you?\n\n### Common mistakes\n- **Forgetting to reset the total.** If you do not reset the total with A+B when you start a new game, it adds on top of the old game's score.\n- **Rolling the dice twice.** Use the **zar** box both for showing and for adding up; do not put two separate random blocks. Otherwise the number on the screen and the number added up will be different.\n- **Giving up before a 6 comes up.** A 6 does not come up on every roll. Press a few times to hear the victory melody.\n- **Looking for a bug when you cannot hear any sound.** The speaker may be off. Look at the **Speaker** section in the right panel.",
            "question": "Which rule would you like to add to your game? For example, should the score go back to zero when a 1 comes up? As you change the rules, how does the game become more fun or harder?",
            "explainerMd": "### What you will learn in this lesson\n- How to put a project into a rules table before coding it\n- How a variable that keeps a total (an accumulator) works\n- How to bring the button event, variable, random number and if blocks together in one program\n- That a block that plays music makes the program wait for as long as the music lasts\n\n### What you should know first\n- Lesson 6: the A, B and A+B events\n- Lesson 7: variables, the change block, starting values\n- Lesson 8: random numbers, **if ... then**, comparison\n- Lesson 9: events are independent of each other\n\n### Rules table first\nSplit the big job into small parts. On the scoreboard, three buttons do three separate jobs:\n\n| Event | What it does | Variable it uses |\n|---|---|---|\n| On start | Sets the total to 0 | toplam |\n| A pressed | Rolls the dice, adds it to the total, shows the dice, plays a melody on a 6 | zar, toplam |\n| B pressed | Shows the total | toplam |\n| A+B pressed | Resets the total, shows 0 | toplam |\n\nOnce you have written the table, coding is just filling it in in order.\n\n### Two variables, two jobs\n**zar** (dice) holds the current roll and changes with every A. **toplam** (total), on the other hand, collects all the rolls and is only ever added to. An example: if the rolls are 4, 6, 3, the total goes 0 → 4 → 10 → 13. It never gets smaller until you reset it.\n\n### Order matters\nIn the A block the order is: first roll the dice and put it in the box, then add it to the total, then show it, and finally ask whether it is a 6. Add the **zar** box to the total; do not put a new random block. That way the number you see on the screen is the same as the number that goes into the total.\n\n### Waiting while the melody plays\nThe **play melody** block makes the rest of the block wait until the melody is over. The Fanfare melody is 5.5 beats long; at a speed of 120 beats per minute, one beat is 500 ms. So the melody takes 5.5 × 500 = 2750 ms. Because the digit also stays on the screen for a short time, an A press that rolls a 6 keeps the card busy for about 3 seconds. Meanwhile, new presses wait in the queue.\n\n### Resetting\nIf you do not reset the total with A+B when you start a new game, the old game's score stays. The on start block also resets the total every time you press ▶. Both ways put 0 in the same box.\n\n### Summary\nFirst you write the rules table, then you build the blocks. zar holds the last roll, toplam holds all the rolls. The zar box is added to the total; a second random block is not added. The block waits until the melody is over. The reset block makes the total 0 again, so a new game starts.",
            "concepts": [
              {
                "term": "Rules table",
                "definition": "A small table, made before writing code, that shows what each event will do and which variables it will use.",
                "example": "A: roll the dice, add it to the total; B: show the total; A+B: reset the total.",
                "pitfall": "Starting to drag blocks straight away; you lose track of which job goes on which button."
              },
              {
                "term": "Total (accumulator)",
                "definition": "A variable that is added to at every event and only gets smaller when it is reset.",
                "example": "If the rolls are 4, 6, 3, the total becomes 4, 10, 13.",
                "pitfall": "Writing toplam = zar; every roll wipes the old one, and the total is always the last roll."
              },
              {
                "term": "Order and a single dice",
                "definition": "Roll the dice once first and put it in the box; always use the same box in the add, show and compare steps.",
                "example": "zar = randomInt(1, 6); toplam += zar; screen.showNumber(zar);",
                "pitfall": "Adding a new random block to the total; the number on the screen and the number added up turn out different."
              },
              {
                "term": "play melody",
                "definition": "A block that plays a ready-made melody from the virtual speaker and makes the next block wait until it is over.",
                "example": "The Fanfare melody is 5.5 beats long; at 120 beats per minute it takes 2750 ms.",
                "pitfall": "Thinking the block finishes instantly; while the melody is playing, new presses wait in the queue."
              },
              {
                "term": "Resetting",
                "definition": "Putting the starting value back into a variable: it can be done in on start and with A+B.",
                "example": "In the A+B block, set toplam to 0, then show the total.",
                "pitfall": "Not resetting the total before a new game; the old score gets added to."
              }
            ],
            "quiz": [
              {
                "id": "m10h2d10-q1",
                "kind": "numeric",
                "prompt": "The Fanfare melody is 5.5 beats long and the tempo is 120 beats per minute (one beat is 60000 ÷ 120 = 500 ms). On the virtual card a single digit stays on the screen for 600 ms. On an A press that rolls a 6, how many milliseconds in total is the A block busy until it has shown the digit and finished the melody?",
                "answer": 3350,
                "unit": "ms",
                "explanation": "The melody is 5.5 x 500 = 2750 ms. Showing the digit takes 600 ms and comes before the melody: 600 + 2750 = 3350 ms. Getting only 2750 means forgetting the time of the digit.",
                "skills": [
                  "mk-input-timing",
                  "mk-random"
                ]
              },
              {
                "id": "m10h2d10-q2",
                "kind": "predict-output",
                "prompt": "At the start, toplam = 0. The dice comes up 4, 6 and 3 in that order (A is pressed three times), then B is pressed:\n\n```\ncard.onButton(\"A\", \"press\", () => {\n  zar = randomInt(1, 6);\n  toplam += zar;\n  screen.showNumber(zar);\n  if (zar == 6) { music.playMelody(\"fanfare\"); }\n});\ncard.onButton(\"B\", \"press\", () => { screen.showNumber(toplam); });\n```\n\nWhich number appears on the screen when B is pressed?",
                "options": [
                  "3",
                  "6",
                  "13",
                  "19"
                ],
                "answer": 2,
                "explanation": "toplam: 0 + 4 = 4, + 6 = 10, + 3 = 13. B shows the total, not 3, the last roll. On the 6 the victory melody plays, but it does not change the total.",
                "skills": [
                  "mk-variables",
                  "mk-events"
                ]
              },
              {
                "id": "m10h2d10-q3",
                "kind": "find-bug",
                "prompt": "On Mert's scoreboard, when B is pressed the total always shows the last roll; the rolls do not add up:\n\n```\ncard.onButton(\"A\", \"press\", () => {\n  zar = randomInt(1, 6);\n  toplam = zar;\n  screen.showNumber(zar);\n});\ncard.onButton(\"B\", \"press\", () => { screen.showNumber(toplam); });\n```\n\nWhat is the bug?",
                "options": [
                  "screen.showNumber is in the wrong place",
                  "\"A\" should be written instead of onButton(\"B\")",
                  "toplam = zar wipes the old value on every roll; it should be toplam += zar",
                  "It should be randomInt(0, 6) instead of randomInt(1, 6)"
                ],
                "answer": 2,
                "explanation": "= puts a new value in the box and wipes the old one, so the total stays equal to the last roll. += adds to the current total. The other lines work correctly.",
                "skills": [
                  "mk-variables",
                  "prog-debug"
                ]
              },
              {
                "id": "m10h2d10-q4",
                "kind": "mcq",
                "prompt": "You want to add a \"highest roll\" display to the scoreboard. Which design is right?",
                "options": [
                  "Keep a separate enyuksek variable; if zar > enyuksek, set enyuksek = zar",
                  "Never change the zar variable",
                  "Reset the toplam variable on every roll",
                  "Make a second random number on every roll"
                ],
                "answer": 0,
                "explanation": "The highest value is kept in a separate box and is only updated if a new roll beats it. To plan this, a new row is added to the rules table. Resetting the total or making a second random number spoils the score.",
                "skills": [
                  "prog-planning",
                  "mk-conditions",
                  "mk-variables"
                ]
              },
              {
                "id": "m10h2d10-q5",
                "kind": "numeric",
                "prompt": "New rule: if the dice comes up 1, the total becomes 0. The rolls come up 5, 3, 1, 4, 6 in that order. What is the total after the last roll?",
                "answer": 10,
                "explanation": "5 + 3 = 8. Then a 1 comes up and the total becomes 0. Then 4 and 6 are added: 0 + 4 + 6 = 10. Getting 19 means forgetting the reset on the 1.",
                "skills": [
                  "mk-conditions",
                  "mk-variables",
                  "prog-planning"
                ]
              }
            ]
          }
        }
      ]
    },
    {
      "title": "Sensörler",
      "project": "Çevre istasyonu",
      "guideMd": "### Hafta hedefleri\nBu haftanın sonunda öğrenci:\n1. İvmeölçerin x, y ve z eksenlerinde ne ölçtüğünü söyleyebilir; hareket bloklarının yalnız durum değişince çalıştığını açıklayabilir.\n2. Sıcaklık, ışık ve ses sensörlerinin değerlerini (sıcaklık -5..50, ışık ve ses 0..255) okuyabilir ve bir eşikle karar verebilir.\n3. Çubuk grafiğin kaç LED yaktığını değer ÷ en çok × 25 işlemiyle hesaplayabilir.\n4. Pusula derecesini yönle eşleştirebilir ve kuzeyi gösteren okun açısını 360 eksi pusula olarak kurabilir.\n5. Değişken ve kalan işlemiyle, düğmeyle mod değiştiren üç sensörlü bir Çevre istasyonu yapabilir.\n\n### Haftanın planı\nHafta beş derstir; her ders yaklaşık 20-35 dakikadır. Plan günde bir ders içindir. Daha yoğun bir takvimde iki dersi birleştirmek mümkündür.\n\n| Gün | Ders | Süre | Ne yapılır |\n|---|---|---|---|\n| 1 | İvmeölçer: salla ve yatır | ~20 dk | Anlatımı oku, sanal kartı salla ve yatır, sihirli topu kur, mini testi çöz. |\n| 2 | Sıcaklık ve ışık | ~25 dk | Kaydırıcılarla sıcaklığı ve ışığı değiştir, eşik ve çubuk grafik hesaplarını yap, mini hava istasyonunu kur. |\n| 3 | Pusula: kuzeyi bul | ~25 dk | Pusula derecelerini yönlerle eşleştir, 360 eksi pusula kuralıyla kuzey okunu çiz. |\n| 4 | Ses seviyesi: alkış sayacı | ~25 dk | Doğru eşiği seç, değişkenle alkışları say, tur süresini hesapla. |\n| 5 | Proje: Çevre istasyonu | ~35 dk | Planı yaz, A ile mod değiştir, çubuk ve sayı göster, projeyi ölçütlerle değerlendir. |\n\n### Ön koşul kontrolü\nBu hafta Hafta 1 ve Hafta 2'nin konuları kullanılır. Başlamadan önce kontrol et:\n- Öğrenci bir olay (düğme) bloğuna program yığını bağlayabiliyor mu? (Hafta 2, Ders 6)\n- Bir değişkeni oluşturup \"değerine ekle\" ile artırabiliyor mu? (Ders 7)\n- Eğer ... ise ... değilse bloğunu kullanabiliyor mu? (Ders 8)\n- Sonsuza kadar bloğunun ne yaptığını biliyor mu? (Ders 5)\n- Çarpma, bölme ve yüzde oranı (0,4 × 25) gibi işlemlerle rahat mı?\n\n### Kavram haritası\n- **Algılama:** sensör → sanal kaydırıcı → okuma anı → eşik\n- **Hareket:** ivmeölçer → x, y, z → duruş (700 eşiği) → hareket olayı (yalnız değişimde)\n- **Yön:** pusula (0 kuzey, 90 doğu, 180 güney, 270 batı) → 360 ≡ 0 → ok açısı = 360 − pusula → sekiz yönlü ok\n- **Gösterim:** çubuk grafik (değer ÷ en çok × 25) → ekranı tek yerden yönetme\n- **Program:** değişken → sayaç → kalan işlemi → mod → önce hazırla, sonra çiz\n\n### Sık yapılan hatalar\n- **Aynı yatışı tekrar denemek.** Sola yatık kartı yeniden sola yatırmak olay üretmez; önce yüzü yukarı yap.\n- **Eşiği 700'ün altında sanmak.** Bir eksen en büyük ve en az 700 olmalı; küçük kaydırma yatış sayılmaz.\n- **Sınır değerini unutmak.** sıcaklık > 30 koşulu 30'da yanlıştır; üzgün yüz 31'de çıkar.\n- **En çok değerini yanlış yazmak.** Işık 255'e çıkar; en çok 5 bırakılırsa ekran hemen dolar.\n- **Okun açısını doğrudan pusula yapmak.** Ok kartla birlikte döner; 360 − pusula gerekir.\n- **Eksi yerine artı bırakmak.** Aritmetik blok varsayılan olarak toplar; işareti − yap.\n- **Eşiği oda sesinin altında seçmek.** Oda sesi yaklaşık 20; eşik 10 olursa sayaç sürekli artar.\n- **Ekrana iki yerden yazmak.** Hem sonsuza kadar hem düğme olayı çizerse görüntü karışır.\n- **Kalan yerine mod + 1 yazmak.** Mod başa dönmez, 3, 4, 5 diye büyür.\n\n### Hafta sonu tekrarı\n1. Her dersin kavram kartlarına bak ve \"sık yapılan yanlış\" satırlarını yüksek sesle oku.\n2. Mini testlerde yanlış yaptığın soruların açıklamalarını yeniden oku, sonra soruyu yeniden çöz.\n3. Çubuk grafik hesabını elle yap: (sıcaklık 12, en çok 40), (ışık 100, en çok 255), (ses 255, en çok 255). Sonra sanal kartta sına.\n4. Pusula 0, 90, 180, 270 ve 45 iken okun hangi yöne baktığını önce tahmin et, sonra çalıştırarak doğrula.\n5. Kendi cümlelerinle cevapla: \"Hareket blokları neden aynı yatışta ikinci kez çalışmaz?\" ve \"Neden 360 eksi pusula kullandık?\"\n\nHafta sonu testi olarak beş dersin mini testleri yeterlidir; her derste 5 soru, toplam 25 soru. Hedef: her dersten en az 4 doğru. Eksik kalan dersin anlatımına dön.\n\n### Proje değerlendirme ölçütü (Çevre istasyonu)\n| Ölçüt | Gelişmeli | Yeterli | İleri |\n|---|---|---|---|\n| Sensörler | Yalnız bir sensör çalışıyor | Sıcaklık, ışık ve ses kendi modunda çubuk olarak görünüyor | Her sensör doğru en çok değeriyle (40 ve 255) ve değer değişince çubuk orantılı değişiyor |\n| Mod değiştirme | A mod değiştirmiyor ya da mod 3'ten sonra büyüyor | A her basışta 0, 1, 2 sırasıyla ilerliyor ve başa dönüyor | Dördüncü bir mod (pusula) ekleyip bölen sayıyı kendisi güncelliyor |\n| Sayı gösterimi | B basılınca sayı görünmüyor | B basılıyken seçili sensörün sayısı kayıyor | Ekran yalnız sonsuza kadar bloğundan çiziliyor ve neden anlatılabiliyor |\n| Program düzeni | Aynı ekrana birden çok yerden yazılıyor | Okuma ve enCok önce hazırlanıp sonra çiziliyor | Değişken adları anlaşılır ve bir uyarı (örneğin sıcaklık yüksekken kalp) eklenmiş |\n| Anlatım | Ne yaptığını anlatamıyor | Programı adım adım anlatıyor | Hata yapıp nasıl bulduğunu ve çubuğun hesabını anlatıyor |\n\n### Veli ve öğretmen notu\n- **Amaç.** Bu hafta ölçmek ve karar vermektir: değer okunur, bir eşikle karşılaştırılır, ekranda gösterilir. Sanal sensörlerin değerini öğrencinin kendisinin verdiğini vurgulamak, \"ölçüm\" ile \"ayarlama\" farkını düşündürür.\n- **Nasıl destek olunur?** Cevabı söylemek yerine şu soruları sor: \"Bu sensör şu an kaç okuyor?\", \"Eşik kaç ve bu değer ondan büyük mü?\", \"Ekrana kaç yerden yazıyorsun?\"\n- **Hesaplar.** Çubuk grafik ve pusula hesapları ufak ama gerçek matematiktir; öğrenci elle hesaplayıp sanal kartta doğrulayınca ilişki kalıcı olur.\n- **Ses ve gizlilik.** Ses seviyesi sanal bir kaydırıcıdır; gerçek mikrofon kullanılmaz. Konuşmada gerçek cihazların sesi dinlerken gizlilik kuralları gerektiğini öğrenciyle tartışabilirsiniz.\n- **Güvenlik.** Bu platformdaki her şey sanaldır. Ders ilerleyip gerçek kart kullanılacaksa şebeke gerilimiyle (220 V) hiçbir devre kurulmaz.\n- **İlerleme.** Mini test sonuçları \"İlerlemem\" sayfasında beceri bazında görünür (taslak/pilot özellik; yalnız onay verildiyse kaydedilir).",
      "guideMdEn": "### Goals for the week\nBy the end of this week the learner can:\n1. Say what the accelerometer measures on the x, y and z axes; explain that motion blocks only run when the state changes.\n2. Read the values of the temperature, light and sound sensors (temperature -5..50, light and sound 0..255) and make a decision with a threshold.\n3. Work out how many LEDs a bar graph lights up with the sum value ÷ largest × 25.\n4. Match compass degrees with directions and build the angle of the arrow pointing north as 360 minus compass.\n5. Make an Environment station with three sensors, using a variable and the remainder operation, where a button changes the mode.\n\n### Plan for the week\nThe week has five lessons; each lesson takes about 20-35 minutes. The plan is for one lesson a day. On a busier timetable, you can combine two lessons.\n\n| Day | Lesson | Time | What you do |\n|---|---|---|---|\n| 1 | Accelerometer: shake and tilt | ~20 min | Read the explainer, shake and tilt the virtual card, build the magic ball, do the mini quiz. |\n| 2 | Temperature and light | ~25 min | Change the temperature and light with the sliders, do the threshold and bar graph sums, build the mini weather station. |\n| 3 | Compass: find north | ~25 min | Match compass degrees with directions, draw the north arrow with the 360 minus compass rule. |\n| 4 | Sound level: clap counter | ~25 min | Choose the right threshold, count claps with a variable, work out the round time. |\n| 5 | Project: Environment station | ~35 min | Write the plan, change the mode with A, show the bar and the number, assess the project with the rubric. |\n\n### Prerequisite check\nThis week uses the topics of week 1 and week 2. Before you start, check:\n- Can the learner attach a program stack to an event (button) block? (Week 2, lesson 6)\n- Can they make a variable and make it go up with \"change by\"? (Lesson 7)\n- Can they use the if ... then ... else block? (Lesson 8)\n- Do they know what the forever block does? (Lesson 5)\n- Are they comfortable with sums such as multiplication, division and proportions (0.4 × 25)?\n\n### Concept map\n- **Sensing:** sensor → virtual slider → moment of reading → threshold\n- **Motion:** accelerometer → x, y, z → position (threshold 700) → motion event (only on a change)\n- **Direction:** compass (0 north, 90 east, 180 south, 270 west) → 360 ≡ 0 → arrow angle = 360 − compass → eight-direction arrow\n- **Display:** bar graph (value ÷ largest × 25) → managing the screen from one place\n- **Program:** variable → counter → remainder operation → mode → get it ready first, then draw\n\n### Common mistakes\n- **Trying the same tilt again.** Tilting a card that is already tilted left to the left again does not produce an event; set it face up first.\n- **Thinking the threshold is below 700.** One axis must be the largest and at least 700; a small slide does not count as a tilt.\n- **Forgetting the boundary value.** The condition temperature > 30 is false at 30; the sad face comes up at 31.\n- **Typing the wrong largest value.** Light goes up to 255; if the largest value is left at 5, the screen fills up straight away.\n- **Making the arrow's angle the compass value directly.** The arrow turns with the card; you need 360 − compass.\n- **Leaving plus instead of minus.** The arithmetic block adds by default; change the sign to −.\n- **Choosing a threshold below the room noise.** Room noise is about 20; if the threshold is 10, the counter keeps going up.\n- **Writing to the screen from two places.** If both forever and a button event draw, the picture gets mixed up.\n- **Writing mod + 1 instead of the remainder.** The mode does not go back to the start; it grows as 3, 4, 5.\n\n### End-of-week review\n1. Look at the concept cards of each lesson and read the \"common mistake\" lines out loud.\n2. Read the explanations of the questions you got wrong in the mini quizzes again, then do the question again.\n3. Do the bar graph sum by hand: (temperature 12, largest 40), (light 100, largest 255), (sound 255, largest 255). Then test it on the virtual card.\n4. Guess first which way the arrow points when the compass is 0, 90, 180, 270 and 45, then check by running it.\n5. Answer in your own words: \"Why do motion blocks not run a second time on the same tilt?\" and \"Why did we use 360 minus compass?\"\n\nThe mini quizzes of the five lessons are enough as the end-of-week test; 5 questions in each lesson, 25 questions in total. Goal: at least 4 correct in each lesson. Go back to the explainer of any lesson that needs more work.\n\n### Project rubric (Environment station)\n| Criterion | Developing | Secure | Advanced |\n|---|---|---|---|\n| Sensors | Only one sensor works | Temperature, light and sound each appear as a bar in their own mode | Each sensor has the right largest value (40 and 255), and the bar changes in proportion when the value changes |\n| Changing mode | A does not change the mode, or the mode keeps growing after 3 | With every press, A moves on in the order 0, 1, 2 and goes back to the start | Adds a fourth mode (compass) and updates the divisor on their own |\n| Showing the number | The number does not appear when B is pressed | While B is held down, the number of the selected sensor scrolls | The screen is drawn only from the forever block, and they can explain why |\n| Program layout | The same screen is written to from more than one place | okuma and enCok are got ready first, then drawn | The variable names are clear and a warning has been added (for example a heart when the temperature is high) |\n| Explaining | Cannot explain what they did | Explains the program step by step | Explains a mistake they made, how they found it, and the bar sum |\n\n### Note for parents and teachers\n- **Aim.** This week is about measuring and deciding: a value is read, compared with a threshold and shown on the screen. Pointing out that the learner gives the values of the virtual sensors themselves gets them thinking about the difference between \"measuring\" and \"setting\".\n- **How can you help?** Instead of giving the answer, ask these questions: \"What is this sensor reading right now?\", \"What is the threshold, and is this value bigger than it?\", \"From how many places are you writing to the screen?\"\n- **Sums.** The bar graph and compass sums are small but real maths; when the learner works them out by hand and checks them on the virtual card, the connection sticks.\n- **Sound and privacy.** The sound level is a virtual slider; no real microphone is used. You can discuss with the learner that real devices need privacy rules when they listen to sound.\n- **Safety.** Everything on this platform is virtual. If the lessons move on to using a real card, no circuit is ever built with mains voltage (220 V).\n- **Progress.** Mini quiz results are shown by skill on the \"My progress\" page (draft/pilot feature; only saved if consent was given).",
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
          ],
          "contentEn": {
            "title": "Accelerometer: shake and tilt",
            "problem": "When you turn your phone sideways, the screen rotates by itself. Some apps undo things when you shake the phone, and in some games you steer a car by tilting the phone. A part inside the phone called an **accelerometer** senses movement and tilt. The card has an accelerometer too. Let's use it to make a \"magic ball\"!",
            "contentMd": "### What does the accelerometer sense?\nThe accelerometer measures the card's movement and **which way it is tilted**. The measurements are given on three axes:\n\n- **x:** the card tilting to the left (minus) and to the right (plus)\n- **y:** the card tilting backwards (minus) and forwards (plus)\n- **z:** the card's face looking up (plus) or down (minus)\n\nThe values are in **milli-g**. When the card lies face up, gravity measures about 1024 on the z axis. So (x, y, z) = (0, 0, 1024).\n\nOn the virtual card, in the **Motion (accelerometer)** section to the right of the card, you will find:\n\n- Buttons: **Shake**, **Tilt left**, **Tilt right**, **Tilt forward**, **Tilt back**, **Face up**, **Face down**, **Free fall**.\n- Three sliders: **x (side)**, **y (front-back)**, **z (face)**.\n- Under them, three readings: **strength**, **pitch**, **roll**.\n\n### Motion blocks\nThe **Input** category has these blocks:\n\n- **when card is [shaken]:** a header block. Choose the movement from the list: shaken, tilted left, tilted right, tilted forward, tilted back, face up, face down, falling.\n- **card is [shaking]?:** asks whether the card is in this state right now. It gives true or false.\n- **acceleration ([strength])** and **tilt ([pitch (forward +)]) degrees:** give a number.\n\n### Program: magic ball\nThree **when card is ...** header blocks are already in the editor: shaken, tilted left, tilted right.\n\n1. Put the **if ... then ... else** block from the **Logic** category inside the **shaken** block (there are two kinds of if; take the one with \"else\").\n2. Attach the **coin flip (random true/false)** block from the **Logic** category to the condition slot of the if.\n3. In the \"then\" part put **show icon** and choose **yes** from the list. In the \"else\" part put **show icon** and choose **no**.\n4. Inside the **tilted left** block put **show icon** and choose **left arrow**.\n5. Inside the **tilted right** block put **show icon** and choose **right arrow**.\n6. ▶ **Run**.\n7. On the virtual card, press the **Shake** button. Shake it a few times. Then **Tilt left**, then **Tilt right**.\n\n### Expected result\nWith every shake, \"yes\" or \"no\" appears at random. When you tilt it left, the left arrow comes up; when you tilt it right, the right arrow comes up. All five goals should have a ✓.\n\n### How does it work?\n- A motion block runs **the moment the card's state changes**. If the card is already tilted left, **tilted left** does not run again; first you need to go back to another state, for example **Face up**.\n- **Shaking** is a short event: when the card is shaken, the block runs straight away, and the acceleration readings wobble for about half a second.\n- **coin flip** gives **true** or **false** at random every time it runs. It is like tossing a coin.\n- When an axis goes past 700 milli-g, the card counts as tilted in that direction.\n\n### Try it\n1. Add two blocks for **tilted forward** and **tilted back** as well: make them show the up arrow and the down arrow.\n2. Add a **face down** block and make it clear the screen. When you turn the card over, the screen goes dark.\n3. Move the sliders by hand. When does the **strength** reading get bigger? How does the strength value change while you shake the card?\n\n### Common mistakes\n- **Trying the same tilt again and again.** If you press **Tilt left** again after tilting it left, the event does not run again. Press the **Face up** button first.\n- **Leaving out the \"else\" branch.** If you put an if that only has a **then** part, half the time you see nothing.\n- **Moving the slider only a little.** For the card to count as tilted, one axis must go past 700. A small slide does not count as a tilt; the ready-made buttons are easier to use.",
            "question": "What else do you know that senses movement in your phone or a games controller? What do you think is the difference between wanting something to happen when you shake the card and pressing a button?",
            "explainerMd": "### What you will learn in this lesson\n- What the accelerometer measures and why it can sense \"tilt\"\n- Which movement of the card the x, y and z axes match\n- When a motion event runs and when it does not\n- How to make a random decision (a coin flip) with the if block\n\n### What you should know first\n- Lesson 3: the show icon block\n- Lesson 6: what an event is (a header block, a stack that runs at that moment)\n- Lesson 8: the if ... then ... else block and randomness\n\n### The card senses gravity\nWhen you tilt the phone in your hand, the screen rotates. The phone knows which way it is being pulled. The **accelerometer** does this. The accelerometer measures the card's movement and which way gravity \"pulls\" the card. It takes measurements even when the card is lying on the table, because gravity is always there.\n\n### Three axes\nThe measurement is given as three separate numbers. Each number describes one direction.\n\n```\nx : left (-)  <->  right (+)\ny : back (-) <-> forward (+)\nz : face down (-) <-> face up (+)\n```\n\nThe unit is **milli-g**. About 1024 milli-g means the full strength of gravity. When the card lies face up, gravity is in the z direction. That is why the reading comes out as (x, y, z) = (0, 0, 1024). If the card is tilted all the way to the right, gravity moves to the x direction: (1024, 0, 0).\n\n### How does a tilt become a \"position\"?\nThe card looks at the largest axis value. If this value is at least 700 and bigger than the other axes, the card counts as tilted in that direction. For example, the reading (650, 0, 900) is still \"face up\": z is the largest and x has not reached 700. Shaking is separate: the card wobbles for a short time and the readings jump.\n\n### An event only runs on a change\nA block like **when card is [tilted left]** runs **the moment the card's state changes**. If the card is already tilted left, saying \"tilt left\" again changes nothing, so the block does not run again. For it to run, you first need to go back to another position, for example face up. Shaking is different: every shake is a new event.\n\n### Deciding with a coin flip\nThe **coin flip** block gives **true** or **false** at random every time it runs. If you attach it to the condition of an if block, the program picks one of two paths at random:\n\n```\nwhen card is shaken:\n  if coin flip then\n    show icon yes\n  else\n    show icon no\n```\n\nIf you leave out the \"else\" branch, half the time nothing happens: the old picture stays on the screen.\n\n### Summary\nThe accelerometer measures on three axes in milli-g and knows the card's tilt thanks to gravity. If an axis is the largest and has reached 700, the card counts as tilted in that direction. Motion blocks only run when the state changes. Every shake is a new event. When you combine the coin flip block with the if block, you can make a magic ball that gives a random answer.",
            "concepts": [
              {
                "term": "Accelerometer",
                "definition": "A sensor that measures, on three axes, the card's movement and which way gravity pulls the card.",
                "example": "When the card lies face up on the table, the measurement is (x, y, z) = (0, 0, 1024).",
                "pitfall": "Thinking the accelerometer only works while the card is being shaken; it measures gravity even when the card is still."
              },
              {
                "term": "The x, y and z axes",
                "definition": "x shows the card tilting left or right, y backwards or forwards, z its face looking up or down.",
                "example": "When the card is tilted all the way to the right, the measurement is (1024, 0, 0).",
                "pitfall": "Thinking y is the left-right tilt and x the forward-back tilt; x is the side, y is front-back."
              },
              {
                "term": "milli-g",
                "definition": "A unit of acceleration. About 1024 milli-g is the full strength of gravity.",
                "example": "When the card is face up, the z axis reads about 1024 milli-g.",
                "pitfall": "Thinking the value is in degrees; milli-g is an amount of force, not an angle."
              },
              {
                "term": "Position threshold (700)",
                "definition": "If an axis value is the largest and at least 700, the card counts as tilted in that direction.",
                "example": "The reading (650, 0, 900) is still face up; z is the largest and x has not reached 700.",
                "pitfall": "Moving the slider only a little and expecting a tilt; anything under 700 does not count as a tilt."
              },
              {
                "term": "Motion event",
                "definition": "Blocks such as when card is [tilted left] run once, the moment the state changes.",
                "example": "When the card is tilted left from face up, the block runs; if it stays tilted left, it does not run again.",
                "pitfall": "Trying the same tilt again and again; the event does not come again until you go back to another position first."
              },
              {
                "term": "Coin flip",
                "definition": "A block that gives true or false at random every time it runs.",
                "example": "if coin flip then the yes icon, else the no icon: this makes the magic ball.",
                "pitfall": "Leaving out the else branch; when it comes out false, nothing happens and the old picture stays."
              }
            ],
            "quiz": [
              {
                "id": "m10h3d1-q1",
                "kind": "mcq",
                "prompt": "The card's accelerometer reads (x, y, z) = (650, 0, 900). Which position does the card count as being in?",
                "options": [
                  "Tilted right",
                  "Face up",
                  "Tilted forward",
                  "In free fall"
                ],
                "answer": 1,
                "explanation": "The position is found by looking at the largest axis. The largest axis is z (900) and it is over 700, so the card is face up. x is only 650; because it has not reached 700 and is smaller than z, it does not count as tilted right.",
                "skills": [
                  "mk-accel"
                ]
              },
              {
                "id": "m10h3d1-q2",
                "kind": "mcq",
                "prompt": "You tilted the card left and the left arrow appeared. You leave the card tilted left and press the \"Tilt left\" button once more. What happens?",
                "options": [
                  "The left arrow is drawn again",
                  "Nothing happens, because the position did not change",
                  "The card counts as shaken",
                  "The program shows an error"
                ],
                "answer": 1,
                "explanation": "A motion event only runs when the state changes. When the card is already tilted left, the position stays the same, so there is no new event. To try the event again, you first need to go back to another position, such as face up.",
                "skills": [
                  "mk-events",
                  "mk-accel"
                ]
              },
              {
                "id": "m10h3d1-q3",
                "kind": "predict-output",
                "prompt": "The card starts face up. The program below is running, and sayac starts at 0.\n\n```\nwhen card is tilted right:\n  change sayac by 1\n```\n\nYou do these in order: Tilt right, Tilt right, Face up, Tilt right, Tilt right. What is sayac at the end?",
                "options": [
                  "4",
                  "1",
                  "2",
                  "5"
                ],
                "answer": 2,
                "explanation": "The first \"Tilt right\" changes the position and the block runs (sayac 1). The second does not change the position, so the block does not run. There is no block for \"Face up\". The next \"Tilt right\" is a change again (sayac 2); the one after it does not run. The result is 2; for it to be 4, every press would have to produce an event.",
                "skills": [
                  "mk-events",
                  "mk-accel"
                ]
              },
              {
                "id": "m10h3d1-q4",
                "kind": "find-bug",
                "prompt": "When you shake the card, the magic ball sometimes shows \"yes\", but sometimes nothing changes and the old picture stays on the screen. Where is the bug?\n\n```\nwhen card is shaken:\n  if coin flip then\n    show icon yes\n```",
                "options": [
                  "The if block has no else branch; when the coin flip comes out false, the screen does not change",
                  "The coin flip block is in the wrong category",
                  "tilted left should be used instead of shaken",
                  "The yes icon does not exist"
                ],
                "answer": 0,
                "explanation": "The coin flip comes out false half the time. When it comes out false, there is no else branch to run, so no command runs and the screen stays as it was. The fix is to add show icon no to the else branch. The other options are not real bugs.",
                "skills": [
                  "mk-conditions",
                  "mk-debug"
                ]
              },
              {
                "id": "m10h3d1-q5",
                "kind": "numeric",
                "prompt": "The card's accelerometer reads x = 600 and y = 800, z = 0. What is the strength of the movement, that is \"acceleration (strength)\", in milli-g? (strength = square root(x² + y² + z²))",
                "answer": 1000,
                "tolerance": 0,
                "unit": "milli-g",
                "explanation": "600² = 360000 and 800² = 640000. The total is 1000000, and its square root is 1000. As you saw in lesson 11, the strength combines the three axes; it is not the value of a single axis.",
                "skills": [
                  "mk-accel"
                ]
              }
            ]
          }
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
          ],
          "contentEn": {
            "title": "Temperature and light",
            "problem": "A weather app tells you how many degrees it is outside. Your phone's screen brightness also changes by itself depending on the light in the room. All of this happens thanks to small feelers called **sensors**. The card has a temperature sensor and a light sensor too. With them, you will make a small weather station.",
            "contentMd": "### Virtual sensors\nOn a real card, the sensors are physical parts. On the virtual card, though, **you** change the values. In the **Compass and sensors** section to the right of the card you will find three sliders:\n\n- **Temperature:** from −5 to 50 degrees (°C).\n- **Light:** from 0 (dark) to 255 (very bright).\n- **Sound:** from 0 to 255 (we will use this in lesson 14).\n\nThe **Input** category has two matching value blocks:\n\n- **temperature (°C):** gives the temperature at that moment.\n- **light level:** gives the light at that moment.\n\n### Bar graph\nThe **bar graph [3] up to [5]** block in the **LED** category shows a number with LEDs. The first number is the value you measured; the second is the largest value it could be. The LEDs fill up from the bottom to the top: if the value is half of the largest value, half the screen lights up. Because the light level is measured out of 255, you use **bar graph [light level] up to [255]**. If the light is 128, about 13 LEDs light up. If the light is 255, all 25 LEDs light up.\n\n### Program: mini weather station\nThe **on button A** and **on button B** blocks are already in the editor.\n\n1. **A button:**\n   1. Put the **show number** block from the **Basic** category.\n   2. Replace the number inside it with the **temperature (°C)** block from the **Input** category.\n   3. Under it, put the **if ... then** block from the **Logic** category.\n   4. For the condition, take a comparison block: **temperature (°C)** in the left hole, the sign **>**, and 30 in the right hole.\n   5. Put **show icon** inside the if and choose **sad face**.\n2. **B button:** put the **bar graph** block from the **LED** category inside it. Attach the **light level** block to the first hole and type 255 in the second hole.\n3. ▶ **Run**.\n4. With the temperature slider at 21, press A. Then raise the temperature to 35 and press A.\n5. Pull the light slider all the way up and press B.\n\n### Expected result\nWhen you press A, the temperature number scrolls (such as 21). When the temperature is above 30, a sad face appears after the number. When you press B, as many LEDs light up as the light level says. When the light is pulled all the way up, the whole screen lights up. All four goals should have a ✓.\n\n### How does it work?\n- A sensor block reads the value **at the moment** it runs. If you change the temperature afterwards, the value that was read earlier does not change.\n- **if temperature > 30 then** asks a question: is the temperature greater than 30? If it is, the block inside runs.\n- The program waits while the number scrolls. When the number is done, the sad face is drawn. That is why you see the number first, then the face.\n- A **threshold** is the boundary value where a decision changes. Here the threshold is 30 degrees: different things happen below and above 30.\n\n### Try it\n1. Lower the threshold to 25. At what temperature does the sad face appear?\n2. Add an **else** branch to the A block: make it show a happy face if the temperature is less than 30.\n3. Put **temperature (°C)** inside the **bar graph** block and set the largest value to 50. Set the temperature to 25. How many LEDs do you think will light up? Make your guess before you try, then try it.\n\n### Common mistakes\n- **Typing the wrong largest value for the bar.** Light goes up to 255. If you leave the largest value at 5, the whole screen lights up straight away.\n- **Building the condition the wrong way round.** If you write **temperature < 30**, you see the sad face when it is cool.\n- **Forgetting the slider when reading a sensor.** On the virtual card you change the values; if you do not change them, they stay fixed (the temperature is 21 and the light is 128 at the start).",
            "question": "Which is more reliable, a real thermometer or this card's temperature sensor? Do you think virtual sensors take real measurements, or do we tell them the value? Did the answer to this question surprise you?",
            "explainerMd": "### What you will learn in this lesson\n- What a sensor is and how you change the values on the virtual card\n- That the temperature and light blocks give numbers\n- How to decide between two states with a threshold\n- How to work out how many LEDs a bar graph turns a number into\n\n### What you should know first\n- Lesson 3: show icon\n- Lesson 6: button events\n- Lesson 8: the if block\n- Lesson 11: the sliders of the virtual card, and that a block is a job that runs for a moment and finishes\n\n### What is a sensor?\nA **sensor** is a feeler that turns something around it into a number. A thermometer measures temperature; a light sensor measures brightness. On a real card, the sensors are physical parts. On the virtual card, **you** give the value with a slider; the program still sees it as a sensor reading.\n\n```\ntemperature : -5 ... 50  (degrees)\nlight       :  0 ... 255 (0 dark, 255 very bright)\n```\n\nThe starting values are 21 for temperature and 128 for light.\n\n### A reading is a moment\nThe **temperature (°C)** and **light level** blocks read the value **at the moment** they run. If you change the temperature while the number is scrolling on the screen, the number on the screen does not change, because the reading has already been taken. To see the new value, the block needs to run again.\n\n### Threshold: the decision boundary\nA **threshold** is the boundary value where a decision changes. In the sentence \"If the temperature is greater than 30, show a sad face\", the threshold is 30. A comparison needs care right at the boundary:\n\n```\nwhen temperature = 30   30 > 30   false   (no sad face)\nwhen temperature = 31   31 > 30   true    (sad face)\n```\n\nYou decide which side the boundary value itself goes on by choosing \">\" or \"≥\".\n\n### Bar graph\nThe **bar graph [value] up to [largest]** block spreads a number over 25 LEDs. The LEDs fill up from the bottom. The sum is:\n\n```\nnumber of LEDs lit = nearest whole number( value / largest × 25 )\n```\n\nExample: if the value is 20 and the largest is 50, then 20 ÷ 50 = 0.4 and 0.4 × 25 = 10 LEDs light up. Because the light sensor goes up to 255, you type 255 as the largest value when you show the light. If you leave it at 5, the whole screen lights up as soon as the light goes past 5.\n\n| value | largest | LEDs lit |\n|---|---|---|\n| 0 | 255 | 0 |\n| 51 | 255 | 5 (bottom row) |\n| 255 | 255 | 25 (all) |\n\n### Summary\nA sensor turns its surroundings into a number; on the virtual card, you give the value with a slider. A sensor block takes a reading at the moment it runs; a value that changes afterwards does not change the old reading. A threshold is the boundary where a decision changes, and depending on the comparison sign, the boundary value itself goes on one side or the other. A bar graph multiplies the value ÷ largest ratio by 25 LEDs and rounds it to the nearest whole number.",
            "concepts": [
              {
                "term": "Sensor",
                "definition": "A feeler that turns something around it (temperature, light, sound) into a number.",
                "example": "The light sensor gives a number between 0 (dark) and 255 (very bright).",
                "pitfall": "Thinking the sensor makes guesses; it only gives the value at that moment as a number."
              },
              {
                "term": "Virtual sensor",
                "definition": "On the virtual card, you set the sensor value with a slider; the program sees it as a real reading.",
                "example": "When you pull the temperature slider to 35, the program reads 35.",
                "pitfall": "Forgetting to change the slider; the value stays fixed at the start (temperature 21, light 128)."
              },
              {
                "term": "Moment of reading",
                "definition": "A sensor block reads the value at the moment it runs; a value that changes afterwards does not change the earlier reading.",
                "example": "Even if you set the temperature to 35 while 21 is scrolling on the screen, the number on the screen stays 21.",
                "pitfall": "Thinking the value will update by itself while the number is scrolling on the screen."
              },
              {
                "term": "Threshold",
                "definition": "The boundary value where a decision changes.",
                "example": "In the condition temperature > 30, the threshold is 30; at 31 there is a sad face, at 30 there is not.",
                "pitfall": "Mixing up which side the boundary value goes on; 30 > 30 is false."
              },
              {
                "term": "Bar graph",
                "definition": "A block that compares a value with the largest value and shows it as the part of the 25 LEDs that fills up from the bottom.",
                "example": "A value of 20 with a largest value of 50 lights up 20 ÷ 50 × 25 = 10 LEDs.",
                "pitfall": "Typing the wrong largest value; if you type 5 for light, the whole screen lights up once the light goes past 5."
              },
              {
                "term": "Comparison",
                "definition": "A block that compares two numbers with a sign such as >, < or = and produces true or false.",
                "example": "temperature > 30 is false in a cool room and true in a hot room.",
                "pitfall": "Choosing the sign the wrong way round; if you write <, you see the sad face when it is cool."
              }
            ],
            "quiz": [
              {
                "id": "m10h3d2-q1",
                "kind": "numeric",
                "prompt": "The temperature is 20 degrees. The block \"bar graph temperature up to 50\" runs in the program. How many LEDs light up?",
                "answer": 10,
                "tolerance": 0,
                "unit": "LED",
                "explanation": "The ratio is 20 ÷ 50 = 0.4. The bar is spread over 25 LEDs: 0.4 × 25 = 10. The value 20 is less than half (25) of the largest value 50, so less than half the screen lights up.",
                "skills": [
                  "mk-bar",
                  "mk-sensors"
                ]
              },
              {
                "id": "m10h3d2-q2",
                "kind": "numeric",
                "prompt": "The light level is 64. \"bar graph light level up to 255\" runs in the program. How many LEDs light up? (Round the result to the nearest whole number.)",
                "answer": 6,
                "tolerance": 0,
                "unit": "LED",
                "explanation": "64 ÷ 255 is about 0.251. 0.251 × 25 is about 6.27. Because an LED cannot be half on, the nearest whole number, 6, is taken.",
                "skills": [
                  "mk-bar",
                  "mk-sensors"
                ]
              },
              {
                "id": "m10h3d2-q3",
                "kind": "predict-output",
                "prompt": "The temperature slider is at exactly 30. The A button is pressed.\n\n```\non button A pressed:\n  show number temperature\n  if temperature > 30 then\n    show icon sad face\n```\n\nWhat is seen on the screen?",
                "options": [
                  "First 30 scrolls, then the sad face comes up",
                  "Only 30 scrolls; the sad face does not come up",
                  "Only the sad face comes up",
                  "Nothing comes up"
                ],
                "answer": 1,
                "explanation": "The show number block scrolls 30. But 30 > 30 is false, because 30 is not greater than itself. So the inside of the if block does not run and the sad face does not come up. You see the sad face at 31; if you want to see it at 30 too, you use ≥.",
                "skills": [
                  "mk-threshold",
                  "mk-conditions"
                ]
              },
              {
                "id": "m10h3d2-q4",
                "kind": "find-bug",
                "prompt": "The light bar always lights up the whole screen, even when the slider is in the middle. The code is:\n\n```\non button B pressed:\n  bar graph light level up to 5\n```\n\nWhere is the bug?",
                "options": [
                  "The wrong light level block was chosen",
                  "The largest value is 5; because light goes up to 255, the largest value should be 255",
                  "show number should be used instead of bar graph",
                  "The A button should be used instead of the B button"
                ],
                "answer": 1,
                "explanation": "The ratio is light ÷ largest, so when the largest value is 5, the ratio goes over 1 as soon as the light goes past 5 and the screen lights up completely. Light goes up to 255, so 255 should be typed as the largest value.",
                "skills": [
                  "mk-bar",
                  "mk-debug"
                ]
              },
              {
                "id": "m10h3d2-q5",
                "kind": "mcq",
                "prompt": "You pressed A and the number 21 is scrolling on the screen. While the number is scrolling, you pulled the temperature slider to 35. What happens to this number?",
                "options": [
                  "The scrolling number turns into 35",
                  "It scrolls as 21; 35 does not appear",
                  "The program stops",
                  "The screen is wiped"
                ],
                "answer": 1,
                "explanation": "The temperature block reads the value at the moment it runs and prepares the number with that reading. Changing the slider afterwards does not change the old reading. To see 35, you need to press A again.",
                "skills": [
                  "mk-sensors"
                ]
              }
            ]
          }
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
          ],
          "contentEn": {
            "title": "Compass: find north",
            "problem": "If you have lost your way on a mountain, a compass needle always points north. Whichever way you turn, the needle still finds north. The card has a compass too. In this lesson you will make your own north finder.",
            "contentMd": "### Compass degrees\nThe card's compass tells you, in **degrees**, which way the top edge of the card is facing:\n\n| Degrees | Direction |\n|---|---|\n| 0 | North (N) |\n| 90 | East (E) |\n| 180 | South (S) |\n| 270 | West (W) |\n\nThe degrees go up clockwise. They go from 0 to 359; 360 is 0 again.\n\nOn the virtual card, in the **Compass and sensors** section, there is a dial and a **Compass** slider. By grabbing and turning the dial, or by moving the slider, it is as if you were turning the card. The **Point north** button sets the degrees to 0.\n\n### New blocks\n- **Input** category: **compass heading (degrees)** gives the compass number. **button [A] pressed?** gives true if A is being pressed at that moment.\n- **LED** category: **show arrow at [0] degrees** draws an arrow pointing in the given direction. 0 means up, 90 right, 180 down, 270 left.\n\n### How do you find the north arrow?\nAs the card turns, north ends up in a different place relative to the card. When the card turns to the east (90), north falls to the card's **left**. So the arrow should point left. The arrow needs to turn the opposite way by as much as the card has turned:\n\n**arrow angle = 360 − compass**\n\n| Compass | 360 − compass | Arrow |\n|---|---|---|\n| 0 | 360 (= 0) | up |\n| 90 | 270 | left |\n| 180 | 180 | down |\n| 270 | 90 | right |\n\n### Program: north finder\nA **forever** block is already in the editor.\n\n1. Put the **if ... then ... else** block from the **Logic** category inside **forever** (there are two kinds of if; take the one with \"else\").\n2. Attach the **button [A] pressed?** block from the **Input** category to the condition slot.\n3. In the \"then\" part put the **show number** block from the **Basic** category and attach **compass heading (degrees)** inside it.\n4. In the \"else\" part put the **show arrow at [0] degrees** block from the **LED** category.\n5. Remove the 0 inside the block and attach the **[ ] + [ ]** block from the **Math** category. Change the middle sign to **−**. Put 360 in the left hole and the **compass heading (degrees)** block in the right hole.\n6. ▶ **Run**. Set the compass slider to 0, 90 and 180 and watch the arrow. Then set the compass to 135 and hold the A button down.\n\n### Expected result\nWhen the compass is at 0, the arrow points up; at 90 it points left; at 180 it points down. When you hold A down, the compass degrees, such as 135, appear on the screen; when you let go, the arrow comes back. All five goals should have a ✓.\n\n### How does it work?\n- The **forever** block looks at the compass all the time and updates the arrow. That is why the arrow reacts straight away when you turn the compass.\n- **if A pressed? then ... else** chooses one of two states: if A is pressed, the number; if not, the arrow.\n- The block that draws the arrow can only point in eight directions (north, north-east, east...). It rounds the angle you give it to the nearest direction. For example, 100 degrees is rounded to east.\n- In the **JavaScript** tab you can find the line `screen.showArrowAngle(360 - input.compass())`.\n\n### Try it\n1. Turn the compass to 45 degrees and watch the arrow. Which way is it pointing?\n2. Make it write a direction letter over the arrow: if the compass is less than 10, make the screen show \"N\". Which block do you need?\n3. Set the compass to 270 and guess the arrow. Then run it and check.\n\n### Common mistakes\n- **Working out the arrow angle wrongly.** If the arrow's angle is the compass value itself, the arrow turns in the **same** direction as the card, not towards north. Taking it away from 360 makes the arrow turn the opposite way.\n- **Forgetting to change to the minus sign.** The arithmetic block adds by default. You must click the middle sign and choose −.\n- **Writing to the same screen from two places.** If you do the arrow job both in **forever** and in a button block, the two race for the screen and the picture becomes unsteady. That is why we did not write an event block for A, but asked **A pressed?** instead.",
            "question": "Why does a compass needle always point north? Where might navigation apps use the compass? Do you think the compass still works if you lift the card up off the ground?",
            "explainerMd": "### What you will learn in this lesson\n- How compass degrees describe directions\n- Why you find the angle of the arrow that points north with \"360 minus compass\"\n- That on a circle of numbers, 360 is the same as 0\n- Why it is important to manage the screen from one place\n\n### What you should know first\n- Lesson 5: the forever block\n- Lesson 12: reading sensors and the virtual sliders\n- Lesson 8: if ... then ... else\n- Subtraction and addition (no decimals needed)\n\n### Degrees and direction\nThe compass tells you, in **degrees**, which way the top edge of the card is facing. The degrees start from north and go up clockwise.\n\n```\n   0 = North\n  90 = East\n 180 = South\n 270 = West\n```\n\nOne full turn is 360 degrees, but 360 is north again, so it is the same as 0. After 359 the number goes back to 0. That is why, if the card turns another 20 degrees to the right from 350 degrees, the compass shows not 370 but 370 − 360 = 10.\n\n### The arrow's angle: why 360 minus compass?\nAs you turn the card, north slides to another place relative to the card. When the card turns to the east (90), north falls to the card's left. Since the arrow is meant to point north, it must turn the **opposite** way by as much as the card has turned:\n\n```\narrow angle = 360 - compass\n```\n\n| compass | 360 - compass | arrow |\n|---|---|---|\n| 0 | 360 (= 0) | up |\n| 90 | 270 | left |\n| 180 | 180 | down |\n| 270 | 90 | right |\n\nIf you make the arrow's angle the compass value directly (or add 360 to it), the arrow turns **together** with the card and does not point north.\n\n### The arrow points in eight directions\nThe card's screen is 5×5, so the arrow block only draws eight directions: up, up-right, right, down-right, down, down-left, left, up-left. It rounds the angle you give it to the nearest direction. 100 degrees is closest to 90 (right), so a right arrow comes up.\n\n### Manage the screen from one place\nThe forever block redraws the arrow in every round. If you also write to the same screen from a button block, the two blocks wipe each other's drawings. That is why we ask about the button not as an **event**, but as the question **\"A pressed?\"**. That way only the forever block writes to the screen.\n\n### Summary\nThe compass gives a number of degrees between 0 and 359: 0 is north, 90 east, 180 south, 270 west. 360 is 0 again. For the arrow that points north, the angle is 360 minus the compass, because the arrow must turn the opposite way to the card. The arrow points in eight directions and rounds the angle to the nearest direction. To avoid screen clashes, keep the drawing in a single loop.",
            "concepts": [
              {
                "term": "Compass degrees",
                "definition": "The angle of the direction the top edge of the card is facing, measured clockwise from north: 0 north, 90 east, 180 south, 270 west.",
                "example": "If the compass shows 90, the top of the card is facing east.",
                "pitfall": "Thinking 180 is north; north is 0, 180 is south."
              },
              {
                "term": "360 and 0 are the same",
                "definition": "One full turn is 360 degrees; when it reaches 360 degrees, the direction is north again and the number goes back to 0.",
                "example": "If you turn 20 degrees to the right when the compass is at 350, the compass becomes 10.",
                "pitfall": "Thinking the compass will carry on after 359 as 360, 361 and so on."
              },
              {
                "term": "Arrow angle = 360 - compass",
                "definition": "The arrow that points north must turn the opposite way to the card; that is why the angle is 360 minus the compass.",
                "example": "When the compass is 90, the arrow angle is 270 and the arrow points left.",
                "pitfall": "Making the arrow's angle the compass value directly; the arrow turns with the card and does not point north."
              },
              {
                "term": "Eight-direction arrow",
                "definition": "The arrow block rounds the given angle to the nearest of eight directions (45 degrees apart).",
                "example": "100 degrees is closest to 90, so a right arrow comes up.",
                "pitfall": "Expecting the arrow to show every degree separately; on a 5×5 screen there are only eight directions."
              },
              {
                "term": "The pressed? question",
                "definition": "By asking about the button as \"is it pressed right now?\" instead of as an event, you make sure only the forever block writes to the screen.",
                "example": "if A pressed? then show the compass number, else show the arrow.",
                "pitfall": "Writing to the same screen from both a button event and the forever block; the two blocks wipe each other's drawings."
              }
            ],
            "quiz": [
              {
                "id": "m10h3d3-q1",
                "kind": "numeric",
                "prompt": "The compass shows 60 degrees. How many degrees should the angle of the arrow pointing north be? (arrow angle = 360 - compass)",
                "answer": 300,
                "tolerance": 0,
                "unit": "degrees",
                "explanation": "The card has turned 60 degrees to the right from north. The arrow must turn the opposite way, so it is 360 - 60 = 300 degrees. If you write 60, the arrow turns in the same direction as the card and does not point north.",
                "skills": [
                  "mk-compass"
                ]
              },
              {
                "id": "m10h3d3-q2",
                "kind": "predict-output",
                "prompt": "The program below is running. The compass slider is at 100 degrees.\n\n```\nforever:\n  show arrow at (360 - compass heading) degrees\n```\n\nWhich arrow appears on the screen?",
                "options": [
                  "Up arrow",
                  "Right arrow",
                  "Down arrow",
                  "Left arrow"
                ],
                "answer": 3,
                "explanation": "360 - 100 = 260. The arrow block rounds the angle to the nearest of eight directions. 260 is 10 degrees from 270 (left) and 35 degrees from 225 (down-left); the nearest is 270, so it is the left arrow. Because the card has turned towards the east, north is on the card's left.",
                "skills": [
                  "mk-compass"
                ]
              },
              {
                "id": "m10h3d3-q3",
                "kind": "find-bug",
                "prompt": "The north finder shows a right arrow when the compass is 90, but north should be on the card's left. The code is:\n\n```\nforever:\n  show arrow at (360 + compass heading) degrees\n```\n\nWhere is the bug?",
                "options": [
                  "on start should be used instead of forever",
                  "360 was typed wrongly; it should be 180",
                  "The arithmetic sign is +; it should be subtraction (-)",
                  "show number should be used instead of the arrow block"
                ],
                "answer": 2,
                "explanation": "360 + 90 = 450, and 450 degrees counts as the same direction as 90; the arrow turns with the card and a right arrow comes up. 360 - 90 = 270, on the other hand, gives an arrow pointing left. The problem is the sign: subtraction is needed instead of addition; the number 360 is right.",
                "skills": [
                  "mk-compass",
                  "mk-debug"
                ]
              },
              {
                "id": "m10h3d3-q4",
                "kind": "mcq",
                "prompt": "In the north finder program, why was the question \"A pressed?\" used for the A button instead of a separate event block?",
                "options": [
                  "Because event blocks run more slowly",
                  "So that only the forever block writes to the screen, and the two blocks do not wipe each other's drawings",
                  "Because the A button cannot be linked to anything else",
                  "Because the compass can only be read with an if block"
                ],
                "answer": 1,
                "explanation": "forever redraws the arrow in every round. If an A event also writes to the same screen, the two blocks take turns wiping each other's drawings and the picture becomes unsteady. Asking it as a question keeps the screen management in one place. The other options are not real reasons.",
                "skills": [
                  "mk-display",
                  "mk-events"
                ]
              },
              {
                "id": "m10h3d3-q5",
                "kind": "numeric",
                "prompt": "The compass shows 350. You turn the card another 20 degrees clockwise. What does the compass show?",
                "answer": 10,
                "tolerance": 0,
                "unit": "degrees",
                "explanation": "350 + 20 = 370, but one turn is 360 degrees and 360 is north again. 370 - 360 = 10. After 359 the compass goes back to 0; it never shows more than 360.",
                "skills": [
                  "mk-compass"
                ]
              }
            ]
          }
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
          ],
          "contentEn": {
            "title": "Sound level: clap counter",
            "problem": "Some lamps switch on when you clap. Some phones give a warning when they detect a loud sound. All of them have a small \"ear\" that measures how loud the sound around them is. The card has sound level information too. In this lesson you will count claps.",
            "contentMd": "### Virtual sound level\nOn the virtual card, the sound level is set by the **Sound** slider in the **Compass and sensors** section. The value is between 0 (silent) and 255 (very loud). At the start it is around 20.\n\nThe **sound level** block in the **Input** category gives this value.\n\n### Threshold: when do we count it as \"loud\"?\nA clap is short and very loud. If we ask **if sound level > 150 then**, we only catch loud sounds. The number 150 is called the **threshold**.\n\nTo count a clap once and then let it go, we show the number on the screen after counting. Showing the number takes a short time, so the same clap is not counted twice.\n\n### Program: sound meter and clap counter\nThe **on start** and **forever** blocks are already in the editor. The **alkis** (Turkish for \"clap\") variable is ready too.\n\n1. The **set alkis to [0]** block should already be inside **on start**.\n2. Put the **if ... then ... else** block from the **Logic** category inside **forever** (there are two kinds of if; take the one with \"else\").\n3. Condition: **sound level > 150**. Put **sound level** from the **Input** category in the left hole and 150 in the right hole.\n4. Attach these in the \"then\" part:\n   1. **change alkis by [1]**\n   2. **show number** (with **alkis** inside)\n5. In the \"else\" part put the **bar graph** block from the **LED** category. Put **sound level** in the first hole and 255 in the second hole.\n6. ▶ **Run**.\n7. Pull the **Sound** slider to 130: more than half the screen lights up. Then pull it to 200 and drop it straight back to 20: the number becomes 1. Do this three times.\n\n### Expected result\nWhen it is quiet, the sound bar is visible on the screen. When the sound level goes past 150, the bar goes and, in its place, 1 appears for half a second, then 2, then 3. All four goals should have a ✓.\n\n### How does it work?\n- The **forever** block listens all the time: if the sound is loud, it counts; if not, it draws the bar.\n- The **show number** block takes about half a second. During this time the program has, in effect, waited before the next round. That way one short clap is not counted twice.\n- The bar graph spreads the sound level over 25 LEDs: a value such as 130 lights up about 13 LEDs.\n- **alkis** goes up by 1 with every count. The counter is not reset; when you press ▶ again, it starts from zero.\n\n### Try it\n1. Set the threshold to 100 to make a more sensitive clap detector.\n2. Add an event block for the **B button**: **set alkis to 0**. That way the counter is reset.\n3. Add another **if** that shows a heart on the screen when the counter reaches 5.\n\n### Common mistakes\n- **Leaving the slider up high.** If the sound stays above 150, the counter keeps going up every half second. Bring the sound back down straight away.\n- **Choosing a threshold that is too low.** Because the sound starts at 20, if the threshold is 10, it always counts as \"loud\" and the counter goes up without stopping.\n- **Putting the bar in the wrong branch.** The bar must be in the **else** branch. If it is in the **then** branch, the number is wiped straight away.",
            "question": "How do we stop a device that works by sound from switching on by accident? Would the clap counter work properly in a noisy crowd? What privacy rules do you think are needed when people are being listened to through a microphone?",
            "explainerMd": "### What you will learn in this lesson\n- That the sound level is a number between 0 and 255\n- Why it is important to choose the right threshold\n- How to keep a counter in a variable and make it go up in each round\n- That showing something on the screen takes time, and how this affects counting\n\n### What you should know first\n- Lesson 5: the forever block\n- Lesson 7: variables and counters (change by)\n- Lesson 12: thresholds and the bar graph\n\n### Sound is a number too\nThe card turns how loud the sound around it is into a number called the **sound level**. 0 means silence, 255 means a very loud sound. On the virtual card you give it with the Sound slider. At the start the value is about 20; you can think of this as \"room noise\".\n\n### Choosing a threshold\nA clap is a short, loud sound. To catch a clap, you compare the sound level with a **threshold** number. The threshold must be bigger than the room noise but smaller than a clap.\n\n```\nroom noise          ~  20\nclap                ~ 200\na good threshold    :  between 100 and 150\ntoo low a threshold :  10  (even room noise is 20 > 10)\ntoo high a threshold:  250 (a clap can never go past it)\n```\n\nIf the threshold is too low, the counter goes up for nothing. If it is too high, it does not count any claps.\n\n### Counter: a variable and adding to it\nA **variable**, which is a box for a value, keeps its value from round to round. For the clap counter you use a variable called `alkis` (clap). You set it to 0 at the start. At every clap you say **change alkis by 1**. If you had only written \"show number 1\", you would always see 1 on the screen; for the counter to remember, a variable is essential.\n\n```\non start:  alkis = 0\nforever:\n  if sound level > 150 then\n    change alkis by 1\n    show number alkis\n  else\n    bar graph sound level up to 255\n```\n\n### Showing takes time\nShowing a one-digit number takes about 0.6 seconds (600 ms), and there is also a short 20 ms pause at the end of the round. So one round takes about 620 ms. If the sound stays loud, the counter goes up by one every round:\n\n```\nIf the sound stays at 200, within 2000 ms:\nrounds start at 0, 620, 1240, 1860 ms  ->  4 increases\n```\n\nWith a short clap, the sound drops straight away; thanks to this time, the same clap is not counted twice.\n\n### Summary\nThe sound level is a number from 0 to 255, and room noise is about 20. The threshold should be chosen bigger than room noise and smaller than a clap. To keep a count, you need a variable: it is set to 0 at the start and 1 is added at every clap. Showing the number takes about 600 ms; if the sound stays loud, the counter goes up again and again at that interval.",
            "concepts": [
              {
                "term": "Sound level",
                "definition": "A number from 0 to 255 that shows how loud the sound around the card is.",
                "example": "In a quiet room the value is about 20; with a clap it is around 200.",
                "pitfall": "Thinking the sound sensor knows what is being said; it only tells you how loud it is."
              },
              {
                "term": "Choosing a threshold",
                "definition": "The threshold should be bigger than the room noise but smaller than the sound you want to detect.",
                "example": "If the room noise is 20 and a clap is 200, a value between 100 and 150 is a good threshold.",
                "pitfall": "Choosing a threshold that is too low (10); because even the room noise is 20, the counter keeps going up."
              },
              {
                "term": "Variable",
                "definition": "A box with a name that keeps its value from round to round.",
                "example": "The alkis variable is 0 at the start and goes up by one with every clap.",
                "pitfall": "Making the counter with \"show number 1\"; there is no remembering, so it always shows 1."
              },
              {
                "term": "change by",
                "definition": "Adds the given number to the current value of a variable.",
                "example": "change alkis by 1 makes alkis 4 when it is 3.",
                "pitfall": "Mixing it up with \"set to 1\"; that resets the variable to 1 every time."
              },
              {
                "term": "Display time",
                "definition": "Showing a one-digit number takes about 600 ms; during this time the program waits before the next round.",
                "example": "If the sound stays loud, each round takes about 620 ms and the counter goes up at that interval.",
                "pitfall": "Leaving the slider up high; the same clap is counted again and again."
              }
            ],
            "quiz": [
              {
                "id": "m10h3d4-q1",
                "kind": "numeric",
                "prompt": "The sound level is 170. \"bar graph sound level up to 255\" runs in the program. How many LEDs light up? (Round to the nearest whole number.)",
                "answer": 17,
                "tolerance": 0,
                "unit": "LED",
                "explanation": "170 ÷ 255 is about 0.667. 0.667 × 25 is about 16.67. The nearest whole number is 17.",
                "skills": [
                  "mk-bar",
                  "mk-sensors"
                ]
              },
              {
                "id": "m10h3d4-q2",
                "kind": "numeric",
                "prompt": "The clap counter is running. The Sound slider was forgotten at 200 and stayed there. One round takes 620 ms: 600 ms to show the number and a 20 ms pause at the end of the round. The first round starts the moment the sound is 200. What is alkis after 2000 ms? (It goes up by 1 at the start of each round.)",
                "answer": 4,
                "tolerance": 0,
                "explanation": "The rounds start at 0, 620, 1240 and 1860 ms; at the start of each round the counter goes up by 1. The next round starts at 2480 ms, which is after 2000 ms. So there are 4 increases. You can test the same result on the virtual card.",
                "skills": [
                  "mk-variables",
                  "mk-threshold"
                ]
              },
              {
                "id": "m10h3d4-q3",
                "kind": "find-bug",
                "prompt": "The clap counter keeps going up while nobody in the room is making any noise (the sound level is about 20). The code is:\n\n```\nforever:\n  if sound level > 10 then\n    change alkis by 1\n    show number alkis\n```\n\nWhere is the bug?",
                "options": [
                  "The alkis variable was not made",
                  "The threshold of 10 is too low; because the room noise is 20, it always counts as loud",
                  "on start should be used instead of forever",
                  "The show number block should be outside the if"
                ],
                "answer": 1,
                "explanation": "The room noise is about 20, and 20 > 10 is true. Because the condition is always true, the counter keeps going up. The threshold should be chosen bigger than the room noise (for example 100 or 150). The other options do not explain why the counter goes up.",
                "skills": [
                  "mk-threshold",
                  "mk-debug"
                ]
              },
              {
                "id": "m10h3d4-q4",
                "kind": "mcq",
                "prompt": "Why is a variable called \"alkis\" used for the clap counter?",
                "options": [
                  "Because a variable is required to show text on the screen",
                  "Because the counter needs to remember its previous value and have 1 added to it at every clap",
                  "Because the threshold can only be compared with a variable",
                  "Because the sound level block does not work without a variable"
                ],
                "answer": 1,
                "explanation": "At every clap, you need to remember the previous number and add 1 to it; only a variable does this. If you had written \"show number 1\", you would always see 1. The threshold comparison and the sound block work without a variable too.",
                "skills": [
                  "mk-variables"
                ]
              },
              {
                "id": "m10h3d4-q5",
                "kind": "predict-output",
                "prompt": "sayac is 0 at the start. There are these two event blocks:\n\n```\non button B pressed:\n  change sayac by 2\n\non button A pressed:\n  set sayac to (sayac × 2)\n```\n\nThese buttons are pressed in order: B, A, B. What is sayac at the end?",
                "options": [
                  "4",
                  "8",
                  "2",
                  "6"
                ],
                "answer": 3,
                "explanation": "B: 0 + 2 = 2. A: 2 × 2 = 4. B: 4 + 2 = 6. The order matters: if you had pressed A first and then B, the result would be different. The answer 4 comes from forgetting the last B press, 2 from counting only the first B, and 8 from thinking the last press was A instead of B.",
                "skills": [
                  "mk-variables",
                  "mk-events"
                ]
              }
            ]
          }
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
          ],
          "contentEn": {
            "title": "Project: Environment station",
            "problem": "If a scientist wanted to describe what a room is like, what would they measure? They would look at the temperature, the light and the sound. Now you are going to bring these three sensors together on a single card. Choose which one to watch with a button, let the screen show it as a bar, and read the number whenever you want!",
            "contentMd": "### Project: Environment station\n**How will it work?**\n- The **A button** changes the mode: 0 = temperature, 1 = light, 2 = sound. After the third press, it goes back to 0.\n- The screen shows the selected sensor as a **bar graph**.\n- **If you hold down the B button**, the screen shows the number instead of the bar.\n\n### New block: remainder\nThe **remainder of [ ] ÷ [ ]** block in the **Math** category gives the number left over from a division. For example, the remainder of 3 ÷ 3 is 0, and the remainder of 4 ÷ 3 is 1. We want the mode to go back to 0 after 0, 1, 2: **the remainder of (mod + 1) ÷ 3** does exactly this.\n\n| mod | mod + 1 | remainder of ÷ 3 |\n|---|---|---|\n| 0 | 1 | 1 |\n| 1 | 2 | 2 |\n| 2 | 3 | 0 |\n\n### Step by step\nThe **on start**, **on button A** and **forever** blocks are already in the editor. The variables called **mod** (mode), **okuma** (reading) and **enCok** (largest) are ready too.\n\n1. **A button:** put the **set mod to [0]** block inside it. In place of the 0, attach the **remainder of [ ] ÷ [ ]** block from the **Math** category. In the first hole attach a **[ ] + [ ]** block: **mod** and 1. Type 3 in the second hole.\n2. Inside the **forever** block, first get the reading ready according to the selected mode. Put an **if mod = 0 then ... else** block:\n   1. **\"then\":** **set okuma to [temperature (°C)]**, **set enCok to [40]**.\n   2. **\"else\":** put a second **if mod = 1 then ... else** block inside it.\n      - **\"then\":** **set okuma to [light level]**, **set enCok to [255]**.\n      - **\"else\":** **set okuma to [sound level]**, **set enCok to [255]**.\n3. In the same **forever**, under this if block, put a second **if ... then ... else**. Condition: **button [B] pressed?**\n   - **\"then\":** **show number okuma**.\n   - **\"else\":** **bar graph okuma up to enCok**.\n4. ▶ **Run**. Set the temperature to 30: the bar fills up more than two thirds. Press A to switch to light, then to sound. Hold B down and read the number. On the third press of A it should go back to the start.\n\n### Expected result\nAt the start you are in temperature mode. When you set the temperature to 30, the bar lights up about 19 LEDs (the ratio 30 ÷ 40). When you press A, the light bar comes up; press again and the sound bar comes up; on the third press, temperature comes back. When you hold B down, the matching number scrolls across the screen. All five tasks in the Goals box should have a ✓.\n\n### How does it work?\n- **mod** holds which sensor is being watched. **okuma** is the value of the selected sensor, and **enCok** is the largest number that value can have (40 for temperature, 255 for light and sound).\n- In each round, **forever** first gets the reading ready, then draws the screen. This is the only place that writes to the screen; that is why the picture on the screen does not get mixed up.\n- The **A button block** only changes the mode; it does not touch the screen.\n- **bar graph okuma up to enCok** draws the ratio: if okuma is 30 and enCok is 40, then 30 ÷ 40 = 0.75; that is about 19 of the 25 LEDs.\n- All the parts in the same program (events, variables, if, bar graph, remainder) add up everything you learnt this week.\n\n### Try it\n1. Set the largest value of the temperature bar to 50. How many LEDs light up at the same temperature? Why?\n2. Add a fourth mode: **Compass**. Make its largest value 360. With four modes, which number should you change in the A block? (Hint: the number you divide by in the remainder block.)\n3. Instead of the bar graph, add a warning such as **if okuma is high then show a heart**.\n\n### Common mistakes\n- **Writing the number instead of the remainder.** If you write **mod + 1** directly in the A block, the mode never goes back to the start and grows as 3, 4, 5. The remainder block, dividing by 3, keeps the 0, 1, 2 cycle.\n- **Forgetting the enCok value.** If you leave 255 for temperature, the bar hardly fills up at all.\n- **Writing to the screen from two places.** If you write a separate event block for B and try to show the number from there, **forever** wipes the screen straight away. Keep it all in one place, inside **forever**.\n- **Forgetting to change the sensor slider.** If the bar never changes, move the sliders of the virtual sensors.",
            "question": "What other things would a real weather station measure? Where would you use this card's three sensors: a greenhouse, a classroom or your own room? Think about which measurement is most important to you, and explain why.",
            "explainerMd": "### What you will learn in this lesson\n- How to choose between several jobs with a single \"mode\" variable\n- How to build the 0, 1, 2 cycle with the remainder operation\n- Why getting the data ready first and then drawing it on the screen is a clean method\n- How to choose the right largest value for different sensors\n\n### What you should know first\n- Lesson 7: variables\n- Lesson 12: the bar graph and thresholds\n- Lesson 13: managing the screen from one place\n- Lesson 14: counters and the sound sensor\n\n### Mode: which job now?\nThe station will show three sensors in turn. A variable called **mod** (mode) holds which sensor is selected:\n\n```\nmod 0 = temperature\nmod 1 = light\nmod 2 = sound\n```\n\nEvery time you press the A button, the mode moves on by one. But after 2 it should not become 3; it should go back to 0.\n\n### The remainder operation\nThe **remainder** is the number left over from a division. 7 ÷ 3 = 2, remainder 1. **The remainder of (mod + 1) ÷ 3** gives exactly this cycle:\n\n| mod | mod + 1 | remainder of ÷ 3 |\n|---|---|---|\n| 0 | 1 | 1 |\n| 1 | 2 | 2 |\n| 2 | 3 | 0 |\n\nThat way, however many times you press, the mode always stays in the range 0, 1, 2. After n presses, the mode is the remainder of n ÷ 3; after 7 presses the mode is 1.\n\n### Get it ready first, then draw\nThe forever block does two jobs. First, it gets two variables ready according to the selected mode:\n\n```\nokuma : the value of the selected sensor\nenCok : the largest value that sensor can have\n         temperature 40, light 255, sound 255\n```\n\nSecond, it draws on the screen: if B is pressed, the number; if not, **bar graph okuma up to enCok**. This is the only place that writes to the screen, so the picture does not get mixed up.\n\n### The largest value sets the proportion\nThe same temperature gives a different bar with a different largest value:\n\n| okuma | enCok | LEDs lit |\n|---|---|---|\n| 30 | 40 | 19 |\n| 30 | 50 | 15 |\n| 21 | 255 | 2 |\n\nThe third row is a common mistake: if you give temperature the scale of light (255), the bar hardly fills up at all.\n\n### A chain of choices\nFor three modes you use two ifs, one inside the other: first you ask whether the mode is 0, and if not, whether it is 1. If it is neither, the mode is 2. Because of this, an unexpected value such as mode 3 always ends up in sound mode, since nothing catches it.\n\n### Summary\nThe mode variable holds which sensor is being watched. The remainder operation (mod + 1) ÷ 3 keeps the mode in the 0, 1, 2 cycle. The program first gets the okuma and enCok variables ready, then draws on the screen from one place. The largest value should be chosen to match each sensor's real range; otherwise the bar is out of proportion.",
            "concepts": [
              {
                "term": "Mode variable",
                "definition": "A variable that holds which job is selected. In the environment station, 0 means temperature, 1 light and 2 sound.",
                "example": "When mod is 1, the program reads the light and draws the light bar.",
                "pitfall": "Making the A button draw the mode on the screen too; the button should only change the mode."
              },
              {
                "term": "The remainder operation",
                "definition": "The number left over from a division. The remainder of (mod + 1) ÷ 3 keeps the mode in the cycle 0, 1, 2, 0, ...",
                "example": "When mod is 2, (2 + 1) ÷ 3 = 1 with remainder 0; the mode goes back to the start.",
                "pitfall": "Writing mod + 1 directly instead of the remainder; the mode grows as 3, 4, 5 and never goes back to the start."
              },
              {
                "term": "okuma and enCok",
                "definition": "Two variables that hold the value of the selected sensor (okuma, reading) and the largest number that sensor can have (enCok, largest).",
                "example": "In temperature mode, okuma is the temperature and enCok is 40.",
                "pitfall": "Leaving enCok the same for every sensor; if you give temperature 255, the bar hardly fills up at all."
              },
              {
                "term": "Get it ready first, then draw",
                "definition": "The program fills in the variables first, then draws the screen from a single place.",
                "example": "Inside forever, okuma and enCok are got ready first, then the bar or the number is drawn.",
                "pitfall": "Writing to the same screen from two places; one wipes the other's drawing straight away."
              },
              {
                "term": "Chain of ifs inside ifs",
                "definition": "Putting a second if into the else branch of an if block to choose one of three options.",
                "example": "First it asks whether the mode is 0; if not, it asks whether it is 1; if it is neither, the mode is 2.",
                "pitfall": "Not noticing that an unexpected mode value (for example 3) quietly ends up in the last branch."
              }
            ],
            "quiz": [
              {
                "id": "m10h3d5-q1",
                "kind": "numeric",
                "prompt": "The A block is: set mod to (the remainder of (mod + 1) ÷ 3). mod starts at 0. The A button is pressed 7 times in total. What is mod at the end?",
                "answer": 1,
                "tolerance": 0,
                "explanation": "With every press the mode moves on by one and goes back to 0 when it reaches 3: 1, 2, 0, 1, 2, 0, 1. After seven presses, mod is 1. Shortcut: 7 ÷ 3 = 2 remainder 1.",
                "skills": [
                  "mk-modulo",
                  "mk-variables"
                ]
              },
              {
                "id": "m10h3d5-q2",
                "kind": "numeric",
                "prompt": "In temperature mode the temperature is 10 degrees and enCok is 40. How many LEDs does the bar graph light up? (Round to the nearest whole number.)",
                "answer": 6,
                "tolerance": 0,
                "unit": "LED",
                "explanation": "The ratio is 10 ÷ 40 = 0.25. 0.25 × 25 = 6.25. The nearest whole number is 6.",
                "skills": [
                  "mk-bar",
                  "mk-sensors"
                ]
              },
              {
                "id": "m10h3d5-q3",
                "kind": "find-bug",
                "prompt": "In the environment station, the mode moves on with every press of A, but after the fourth press the screen always stays on the sound bar; it does not go back to temperature. The A block is:\n\n```\non button A pressed:\n  set mod to (mod + 1)\n```\n\nWhere is the bug?",
                "options": [
                  "The B button should be used instead of the A button",
                  "There is no remainder operation; mod grows as 3, 4, ... and the chain of ifs always ends up in the sound branch",
                  "The mod variable should not be set to 0 at the start",
                  "The enCok value should be 40"
                ],
                "answer": 1,
                "explanation": "Because there is no remainder, the mode never goes back to the start. 3 and above are neither 0 nor 1, so the if chain ends up in the last branch, that is sound mode. The remainder of (mod + 1) ÷ 3 keeps the mode in the range 0-2. Setting mod to 0 at the start is right; the problem is not there.",
                "skills": [
                  "mk-modulo",
                  "mk-debug"
                ]
              },
              {
                "id": "m10h3d5-q4",
                "kind": "predict-output",
                "prompt": "mod = 2 and the sound slider is at 51. B is not pressed.\n\n```\nforever:\n  if mod = 0 then: okuma = temperature, enCok = 40\n  else, if mod = 1 then: okuma = light, enCok = 255\n  else: okuma = sound level, enCok = 255\n  bar graph okuma up to enCok\n```\n\nWhat is seen on the screen?",
                "options": [
                  "The 5 LEDs in the bottom row light up",
                  "The 5 LEDs in the top row light up",
                  "No LEDs light up",
                  "The whole screen lights up"
                ],
                "answer": 0,
                "explanation": "Because mod is 2, the last branch runs: okuma = 51, enCok = 255. The ratio is 51 ÷ 255 = 0.2, and 0.2 × 25 = 5 LEDs. Because the bar fills up from the bottom, the 5 LEDs fill the bottom row completely.",
                "skills": [
                  "mk-bar",
                  "mk-sensors",
                  "mk-conditions"
                ]
              },
              {
                "id": "m10h3d5-q5",
                "kind": "mcq",
                "prompt": "You want to add the Compass to the environment station as a fourth mode (mod 0-3). Which number should you change in the A block?",
                "options": [
                  "Change the 1 in (mod + 1) to 4",
                  "Change the divisor 3 to 4",
                  "Set the enCok value to 360",
                  "Set the number being divided to 255"
                ],
                "answer": 1,
                "explanation": "If the mode is to have 4 different values, it needs to go back to 0 after 0, 1, 2, 3; the remainder of (mod + 1) ÷ 4 does this. So the divisor should be 4. The +1 stays the same. It is right that enCok should be 360 for the compass, but that is the job of the reading part, not of the A block.",
                "skills": [
                  "mk-modulo"
                ]
              }
            ]
          }
        }
      ]
    },
    {
      "title": "Müzik ve ses",
      "project": "Sanal piyano",
      "guideMd": "### Hafta hedefleri\nBu haftanın sonunda öğrenci:\n1. Sesin bir titreşim olduğunu, **frekansın** (Hz) perdeyi belirlediğini ve kartın notalarını (Do 262 Hz, La 440 Hz) söyleyebilir.\n2. Tempoya göre bir notanın süresini `60000 / tempo` ile hesaplayabilir ve **sus** bloğuyla ritim kurabilir.\n3. Hazır ezgileri çalabilir; **liste** ile kendi ezgisini kurup **her öğe için** döngüsüyle çalabilir.\n4. Düğme, logo ve ışık sensörüyle çalınan bir enstrüman yapabilir; sürekli sesi **sesi durdur** ile kapatabilir.\n5. Plan tablosundan yola çıkarak kayıt yapan ve geri oynatan beş tuşlu bir sanal piyano kurabilir.\n\n### Haftanın planı\nHafta beş derstir; her ders yaklaşık 18-32 dakikadır. Aşağıdaki plan günde bir ders içindir. Müzikli derslerde ses açık olmalıdır; ilk ▶ Çalıştır basışından sonra tarayıcı sesi açar.\n\n| Gün | Ders | Süre | Ne yapılır |\n|---|---|---|---|\n| 1 | İlk nota | ~18 dk | Anlatımı oku, Do, Re, Mi çal, nota simgesini göster, mini testi çöz. |\n| 2 | Süre, sus ve tempo | ~20 dk | Tempoyu 60 ve 240 yap, süreleri hesapla ve Hoparlör bölümüyle karşılaştır. |\n| 3 | Ezgiler ve listeler | ~22 dk | Hazır ezgileri dinle, dört notalık liste kur, her öğe için döngüsünü dene. |\n| 4 | Enstrüman yap | ~22 dk | Üç düğmeyle nota çal, logo ve ışıkla sürekli ses ver, eşle bloğunu dene. |\n| 5 | Proje: Sanal piyano | ~32 dk | Tabloyu doldur, A tuşunu çalıştır, kopyala, kayıt ve geri oynatmayı ekle. |\n\n### Ön koşul kontrolü\nBu hafta Modül 10'un üç haftalık temeli gerekir. Başlamadan önce şunları kontrol et:\n- Blok sürükleyip başlığın içine bırakabiliyor mu? (Hafta 1)\n- **Düğme [A] basılınca** gibi olay başlıklarını ve ▶ Çalıştır düğmesini biliyor mu? (Hafta 2)\n- Sensör (ışık) değerlerinin sayı olduğunu ve kaydırıcıyla değiştirildiğini biliyor mu? (Hafta 3)\n- Değişken oluşturup değer atayabiliyor mu?\n- Ses açık mı? Bilgisayarın sesi ve Hoparlör bölümündeki **Ses açık** düğmesi açılmış olmalı.\n\n### Kavram haritası\n- **Ses:** titreşim → frekans (Hz) → nota (Do 262, La 440) → oktav (iki katı)\n- **Zaman:** tempo (vuruş/dk) → 60000 / tempo → vuruş değerleri (1/16 ... 2) → sus\n- **Veri:** değişken → liste → numara (0'dan) → uzunluk → her öğe için\n- **Enstrüman:** giriş (düğme, logo, ışık) → kural → çıkış (hoparlör) → eşle → sürekli ses\n- **Proje:** plan tablosu → tek tuş kalıbı → kopyala → kayıt listesi → geri oynatma\n\n### Sık yapılan hatalar\n- **Nota bloklarını başlığın dışında bırakmak.** Blok soluk görünür ve hiç çalışmaz.\n- **▶ düğmesine basmadan düğmeye basmak.** Program önce çalıştırılmalı.\n- **Vuruş ile milisaniyeyi karıştırmak.** **bekle [500] ms** tempoyu dinlemez; nota ve sus dinler.\n- **Tempo 60'ta takıldı sanmak.** Tempo 20'de bir 1/4 vuruş 3 saniyedir.\n- **Listeyi başlangıçta kurmamak.** Ekleme bloğu \"Bu blok için bir liste gerekli.\" hatasıyla durur.\n- **Listede numarayı 1'den başlatmak.** İlk öğe 0 numaralıdır; son numara uzunluktan bir azdır.\n- **Sesi durdur koymamak.** Sürekli ses kendiliğinden susmaz.\n- **Eşle bloğunda aralıkları ters yazmak.** Önce sensör aralığı, sonra ses aralığı.\n- **Aynı sütunu iki tuşa vermek.** Projede tuşlar ekrandan ayırt edilemez.\n\n### Hafta sonu tekrarı\n1. Her dersin kavram kartlarına yeniden bak ve \"sık yapılan yanlış\" satırlarını yüksek sesle oku.\n2. Mini testlerde yanlış yaptığın soruların açıklamalarını oku, sonra soruyu yeniden çöz.\n3. Tempoyu 60, 120 ve 240 yaparak 1/4 vuruşun süresini hesapla (1000, 500, 250 ms) ve Hoparlör bölümüyle karşılaştır.\n4. Zafer ezgisinin tempo 120'de 2750 ms sürdüğünü bil; tempo 60'ta ne kadar süreceğini hesapla.\n5. Kendi cümlelerinle cevapla: \"Liste numaraları neden 0'dan başlar?\" ve \"Sürekli ses neden sesi durdur ister?\"\n\nHafta sonu testi olarak beş dersin mini testleri yeterlidir; her derste 5 soru, toplam 25 soru. Hedef: her dersten en az 4 doğru. Eksik kalan dersin anlatımına dön.\n\n### Proje değerlendirme ölçütü (Sanal piyano)\n| Ölçüt | Gelişmeli | Yeterli | İleri |\n|---|---|---|---|\n| Tuşlar | Bir iki tuş çalışmıyor ya da yanlış nota çalıyor | Beş tuşun hepsi kendi notasını çalıyor | Tablodaki notaların dışında ek tuş ya da oktav değişimi eklenmiş |\n| Ekran | Sütunlar karışık ya da yanmıyor | Her tuş kendi sütununu yakıp söndürüyor | Sütun süresi nota süresiyle uyumlu, ekran temiz kalıyor |\n| Kayıt | Liste kurulmamış, program hata veriyor | Notalar kayıt listesine sırayla ekleniyor | Kaydı silen bir tuş ya da kayıt uzunluğunu gösteren bir sayı eklenmiş |\n| Geri oynatma | Logoya dokununca bir şey çalmıyor | Kayıt çalındığı sırayla baştan çalınıyor | Tempo ya da nota arası duraklama ayarlanmış ve etkisi açıklanmış |\n| Anlatım | Ne yaptığını anlatamıyor | Tuş kalıbını ve listeyi adım adım anlatıyor | Hata yapıp nasıl bulduğunu anlatıyor |\n\n### Veli ve öğretmen notu\n- **Amaç.** Bu hafta bir şarkıyı ezberletmek değil, öğrencinin sesi bir sayı olarak (frekans) ve zamanı bir hesap olarak (tempo) görmesidir. Müzik sevenler için bu sıradan bir tablo, sevmeyenler için bir bulmacadır; ikisi de yeterlidir.\n- **Nasıl destek olunur?** Öğrenci takıldığında cevabı söylemek yerine şu soruları sor: \"Hangi başlığın içinde?\", \"Hoparlör bölümü kaç Hz diyor?\", \"Liste kaç öğeli, son numarası kaç?\"\n- **Ses.** Ses sanal karttan çıkar ve ilk ▶ Çalıştır'dan sonra açılır. Sesi duymayan öğrenci için önce bilgisayarın sesini, sonra Hoparlör bölümündeki Ses açık düğmesini kontrol edin. Ses olmasa da frekans, ekran ve etkinlik hedefleri yine görünür.\n- **Süre.** Dersleri aynı gün peş peşe yapmak yerine aralıklı çalışmak kalıcılığı artırır. Tempo hesapları için kâğıt ve kalem uygundur.\n- **Güvenlik.** Bu platformdaki her şey sanaldır. Kulaklık kullanılıyorsa ses seviyesi düşük tutulmalıdır.\n- **İlerleme.** Dersin sonundaki mini test sonuçları \"İlerlemem\" sayfasında beceri bazında görünür (taslak/pilot özellik; yalnız onay verildiyse kaydedilir).",
      "guideMdEn": "### Week goals\nBy the end of this week, the learner:\n1. Can say that sound is a vibration, that **frequency** (Hz) sets the pitch, and what the card's notes are (C 262 Hz, A 440 Hz).\n2. Can work out a note's duration from the tempo with `60000 / tempo` and build a rhythm with the **rest** block.\n3. Can play ready-made melodies; can build their own melody with a **list** and play it with the **for each item** loop.\n4. Can make an instrument played with the buttons, the logo and the light sensor; can turn off a continuous sound with **stop sound**.\n5. Can build a five-key virtual piano that records and plays back, starting from a plan table.\n\n### Plan for the week\nThe week has five lessons; each lesson takes about 18-32 minutes. The plan below is for one lesson a day. In the music lessons the sound must be on; the browser turns the sound on after the first press of ▶ Run.\n\n| Day | Lesson | Time | What to do |\n|---|---|---|---|\n| 1 | The first note | ~18 min | Read the explainer, play C, D, E, show the note icon, do the mini quiz. |\n| 2 | Duration, rests and tempo | ~20 min | Set the tempo to 60 and 240, work out the durations and compare them with the Speaker section. |\n| 3 | Melodies and lists | ~22 min | Listen to the ready-made melodies, build a four-note list, try the for each item loop. |\n| 4 | Make an instrument | ~22 min | Play notes with three buttons, make a continuous sound with the logo and light, try the map block. |\n| 5 | Project: Virtual piano | ~32 min | Fill in the table, get the A key working, copy it, add recording and playback. |\n\n### Prerequisite check\nThis week needs the three-week foundation of Module 10. Before you start, check these:\n- Can they drag a block and drop it inside a hat block? (Week 1)\n- Do they know event hat blocks such as **on button [A] pressed** and the ▶ Run button? (Week 2)\n- Do they know that sensor (light) values are numbers and are changed with a slider? (Week 3)\n- Can they make a variable and give it a value?\n- Is the sound on? The computer's sound and the **Sound on** button in the Speaker section must both be on.\n\n### Concept map\n- **Sound:** vibration → frequency (Hz) → note (C 262, A 440) → octave (twice as much)\n- **Time:** tempo (bpm) → 60000 / tempo → beat values (1/16 ... 2) → rest\n- **Data:** variable → list → index (from 0) → length → for each item\n- **Instrument:** input (button, logo, light) → rule → output (speaker) → map → continuous sound\n- **Project:** plan table → a single key pattern → copy → recording list → playback\n\n### Common mistakes\n- **Leaving the note blocks outside the hat block.** The block looks faded and never runs.\n- **Pressing a button without pressing ▶.** The program has to be run first.\n- **Mixing up beats and milliseconds.** **pause [500] ms** does not listen to the tempo; notes and rests do.\n- **Thinking it is stuck at tempo 60.** At tempo 20 a 1/4 beat is 3 seconds.\n- **Not building the list in on start.** The add block stops with the error \"This block needs a list.\"\n- **Starting the list numbers at 1.** The first item is number 0; the last number is one less than the length.\n- **Not putting in stop sound.** A continuous sound does not stop by itself.\n- **Writing the ranges in the map block the wrong way round.** First the sensor's range, then the sound's range.\n- **Giving the same column to two keys.** In the project the keys cannot be told apart on the screen.\n\n### End-of-week review\n1. Look at each lesson's concept cards again and read the \"common mistake\" lines out loud.\n2. Read the explanations of the questions you got wrong in the mini quizzes, then answer the question again.\n3. Set the tempo to 60, 120 and 240, work out the duration of a 1/4 beat (1000, 500, 250 ms) and compare it with the Speaker section.\n4. Know that the Fanfare melody lasts 2750 ms at tempo 120; work out how long it would last at tempo 60.\n5. Answer in your own words: \"Why do list numbers start at 0?\" and \"Why does a continuous sound need stop sound?\"\n\nAs an end-of-week test, the mini quizzes of the five lessons are enough; 5 questions in each lesson, 25 questions in total. Target: at least 4 correct in each lesson. Go back to the explainer of any lesson that falls short.\n\n### Project assessment rubric (Virtual piano)\n| Criterion | Developing | Secure | Advanced |\n|---|---|---|---|\n| Keys | One or two keys do not work or play the wrong note | All five keys play their own note | An extra key or an octave change beyond the notes in the table has been added |\n| Screen | The columns are mixed up or do not light | Each key lights its own column and turns it off | The column time matches the note time, and the screen stays clean |\n| Recording | The list is not built, and the program gives an error | The notes are added to the recording list in order | A key that deletes the recording, or a number that shows the recording's length, has been added |\n| Playback | Nothing plays when the logo is touched | The recording plays from the start in the order it was played | The tempo or the pause between notes has been adjusted and its effect explained |\n| Explanation | Cannot explain what they did | Explains the key pattern and the list step by step | Explains a mistake they made and how they found it |\n\n### Note for parents and teachers\n- **Aim.** The aim this week is not to memorise a song, but for the learner to see sound as a number (frequency) and time as a calculation (tempo). For those who love music this is an everyday table, and for those who do not it is a puzzle; both are fine.\n- **How to help.** When the learner gets stuck, instead of giving the answer, ask these questions: \"Which hat block is it inside?\", \"How many Hz does the Speaker section say?\", \"How many items does the list have, and what is its last number?\"\n- **Sound.** The sound comes from the virtual card and turns on after the first ▶ Run. For a learner who cannot hear the sound, check the computer's sound first, then the Sound on button in the Speaker section. Even without sound, the frequency, the screen and the activity goals are still visible.\n- **Time.** Spacing the lessons out, rather than doing them one after another on the same day, helps the learning stick. Paper and a pencil are handy for the tempo calculations.\n- **Safety.** Everything on this platform is virtual. If headphones are used, the volume should be kept low.\n- **Progress.** The mini quiz results at the end of each lesson appear by skill on the \"My progress\" page (a draft/pilot feature; saved only if consent has been given).",
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
          ],
          "contentEn": {
            "title": "The first note",
            "problem": "When you pluck a guitar string, the string vibrates and makes a sound. The faster the string vibrates, the higher the sound. The Virtual Micro Card's speaker works the same way: you give it a number of vibrations, and it plays that sound. So how many blocks does it take to make the card play C, D, E?",
            "contentMd": "### Getting ready\nIn the editor the blocks are on the left and the virtual card is on the right. Among the panels under the card there is also a **Speaker** section. Open it: it shows which sound is playing. To hear sound on the page, press the ▶ **Run** button once; browsers only turn sound on after you have touched the page. The **Sound on** button in the Speaker section turns the sound off and on.\n\n### What is frequency?\nThe number of times a sound vibrates in one second is called its **frequency**. Its unit is **Hz** (hertz). The card plays the notes at these frequencies:\n\n| Note | C | D | E | F | G | A | B | High C |\n|---|---|---|---|---|---|---|---|---|\n| Hz | 262 | 294 | 330 | 349 | 392 | 440 | 494 | 523 |\n\n**High C** has about twice the frequency of **C** (262 × 2 = 524). The same note one step higher is called an \"octave\". **Low C** is 131 Hz, which is half of C.\n\n### New blocks\n- The **play note [C] for [1/4] beat** block in the **Music** category plays a note. It does not move on to the next block until the note has finished. So if you put two note blocks one under the other, the notes play in turn; they do not overlap.\n- The **show icon [heart]** block in the **Basic** category puts a ready-made picture on the screen. You can choose the **note** icon from the list.\n\n### Step by step\nThe **on button [A] [pressed]** block is already in the editor. There are three goals in the Goals panel.\n\n1. Drag the **play note [C] for [1/4] beat** block from the **Music** category. Drop it inside the **on button [A] [pressed]** block.\n2. Take two more of the same block and attach them underneath. In the second one choose **D** from the list, and in the third one **E**.\n3. Take the **show icon [heart]** block from the **Basic** category and put it above the notes. Choose the **note** icon from the list.\n4. Press the ▶ **Run** button. Then click the card's **A** button.\n\n### Expected result\nWhen you press A, the note icon appears on the card's screen. In the Speaker section you see **playing: 262 Hz**, **294 Hz**, **330 Hz** in turn, and (if your sound is on) you hear three notes. Each note lasts half a second, one and a half seconds in total. All three goals should have a ✓.\n\n### How does it work?\n- The blocks run from top to bottom, in order.\n- The note block starts the note and waits until its time is up. That is why D only starts when C has finished.\n- **[1/4] beat**: says how long the note lasts. The card's tempo starts at 120 beats per minute. At this speed, \"1/4 beat\" is exactly 500 milliseconds. You will look at duration in detail in the next lesson.\n- If you click the **JavaScript** and **Python** tabs at the top, you see the code of the same program. For example, the first note is written as `music.playNote(\"Do\", 1)` (the code uses the Turkish note names: `Do` is C). These tabs are only for reading; you run the program with blocks.\n\n### Try it\n1. Make the first note **Low C** and the last one **High C**. How did the sound change? Read the Hz values from the Speaker section.\n2. Find your own three-note ringtone. Which order sounds more cheerful to you?\n3. Put seven notes instead of three and climb a staircase from C to B.\n\n### Common mistakes\n- **Leaving the blocks outside the hat block.** If the note blocks are not inside **on button [A] [pressed]**, they do not run; they look faded in the editor.\n- **Pressing A without pressing ▶.** The program has to be run first.\n- **Changing a block and not running again.** If you change something while it is running, the warning \"Press ▶ to use your changes\" appears.\n- **Not hearing the sound.** Make sure the Speaker section says **Sound on**. Your computer's sound must be on too.",
            "question": "What difference did you hear between C and High C? Do you think animal sounds (birdsong, a cat's miaow) have high or low frequencies? Why?",
            "explainerMd": "### What you will learn in this lesson\n- What sound is and how **frequency** (Hz) sets the pitch\n- Which frequencies the card's notes match\n- That the note block waits until it has finished, which is why notes play in turn\n- Why you need to put blocks inside an event hat block (button pressed)\n\n### What you should know first\nThis week starts with music. From the earlier weeks you only need these: dragging and dropping blocks, the **on button [A] pressed** hat block, the ▶ Run button and showing an icon on the screen.\n\n### Sound is a vibration\nWhen you pluck a guitar string, the string moves back and forth and pushes the air. This back-and-forth movement reaches your ear as sound. The **number of vibrations per second** of the string is called its **frequency**; its unit is **Hz** (hertz). If the frequency is large, the sound is **high**; if it is small, the sound is **low** (deep). The card's speaker does the same thing: you give it a number, and it makes a sound with that many vibrations.\n\n### Notes are numbers\nOn the card, every note is tied to a fixed frequency. Some of them:\n\n```\nNote    Low C      C     D     E     G     A     High C\nHz        131     262   294   330   392   440    523\n```\n\nNotice something: **Low C** (131) is half of **C** (262); **High C** (523) is about twice as much. Doubling the frequency raises the sound by one **octave**. It is the same note name, sung higher or lower.\n\n### The note block waits\nThe **play note [C] for [1/4] beat** block does two jobs: it starts the note and **waits** until its time is up. This waiting is very important. If you put two note blocks one under the other, the second starts after the first:\n\n```\nplay C  (500 ms)  -> when it ends\nplay D  (500 ms)  -> when it ends\nplay E  (500 ms)\nTotal: 1500 ms\n```\n\nThe card's tempo starts at 120, and at this speed a 1/4 beat lasts 500 milliseconds. You will look at duration in detail in the next lesson.\n\n### Blocks run inside a hat block\nOn the card, no block runs by itself. Something has to happen first, such as a button being pressed. This \"event\" is written with a **hat** block. If the note blocks are not inside a hat block, they look faded in the editor and do not run. To see the code, you can look at the JavaScript tab: `music.playNote(\"Do\", 1)`. This tab is only for reading.\n\n### Summary\nSound is vibration; the number of vibrations per second is the frequency, measured in Hz. A large frequency gives a high sound, a small frequency a low sound. The card's note blocks play at fixed frequencies and wait until they finish, so notes placed one under the other are heard in turn. Notes must be inside a hat block, or they do not run at all.",
            "concepts": [
              {
                "term": "Frequency",
                "definition": "The number of times a sound vibrates per second; its unit is hertz (Hz).",
                "example": "The note A is 440 Hz: the speaker moves back and forth 440 times a second.",
                "pitfall": "Thinking frequency is how loud a sound is; frequency sets how high the sound is, while the volume sets how loud it is."
              },
              {
                "term": "Hertz (Hz)",
                "definition": "The unit that shows how many times something repeats per second.",
                "example": "262 Hz means 262 vibrations per second.",
                "pitfall": "Thinking Hz is a count per minute; Hz is always per second."
              },
              {
                "term": "Octave",
                "definition": "The same note with its frequency halved or doubled.",
                "example": "If C is 262 Hz, Low C is 131 Hz and High C is about 523 Hz.",
                "pitfall": "Adding a fixed number to the frequency to go up an octave; the frequency is multiplied by two."
              },
              {
                "term": "Note block",
                "definition": "Plays the chosen note and does not move on to the next block until its time is up.",
                "example": "When the C, D, E blocks are placed one under the other, they are heard in turn.",
                "pitfall": "Thinking the notes overlap; the blocks run in order, and each one waits for the previous one to finish."
              },
              {
                "term": "Hat block",
                "definition": "A block that runs the blocks under it when an event happens, for example on button [A] pressed.",
                "example": "When the note blocks are put inside the on button [A] pressed block, they play when you press A.",
                "pitfall": "Leaving the blocks outside the hat block; they look faded and never run."
              }
            ],
            "quiz": [
              {
                "id": "m10h4d16-q1",
                "kind": "mcq",
                "prompt": "You want a speaker to play a note higher. Which one do you need to increase?",
                "options": [
                  "The frequency",
                  "The volume",
                  "The number of blocks",
                  "How long you press the button"
                ],
                "answer": 0,
                "explanation": "How high a sound is depends on its frequency; as the number of vibrations per second goes up, the sound gets higher. The volume only changes how loud the sound is, not its pitch.",
                "skills": [
                  "prog-structure"
                ]
              },
              {
                "id": "m10h4d16-q2",
                "kind": "numeric",
                "prompt": "With the tempo at 120 (1/4 beat = 500 ms), three [1/4] beat note blocks placed one under the other are run. How many milliseconds pass until they have all finished?",
                "answer": 1500,
                "tolerance": 0,
                "unit": "ms",
                "explanation": "Each note block waits until it finishes; the notes do not overlap. 500 + 500 + 500 = 1500 ms. If they played at the same time, the total would be 500 ms, but the blocks run in order.",
                "skills": [
                  "prog-timing"
                ]
              },
              {
                "id": "m10h4d16-q3",
                "kind": "numeric",
                "prompt": "On the card the note C is 262 Hz. Low C has half the frequency of C. How many Hz is Low C?",
                "answer": 131,
                "tolerance": 0,
                "unit": "Hz",
                "explanation": "To go down one octave, the frequency is divided by two: 262 / 2 = 131 Hz. In the same way, to go up one octave it is multiplied by two (about 524; on the card 523).",
                "skills": [
                  "prog-timing"
                ]
              },
              {
                "id": "m10h4d16-q4",
                "kind": "find-bug",
                "prompt": "A student wanted the card to play C, D, E when A is pressed. They ran it, but no sound came when they pressed A. In the editor the note blocks look faded.\n\n```\non button [A] pressed\n   (empty)\n\nplay note [C] for [1/4] beat\nplay note [D] for [1/4] beat\nplay note [E] for [1/4] beat\n```\n\nWhat is the mistake?",
                "options": [
                  "The frequency of the note C is wrong",
                  "The note blocks have been left outside the on button [A] pressed hat block",
                  "The note E cannot be played",
                  "The tempo is too high"
                ],
                "answer": 1,
                "explanation": "A faded block is a block that does not run because it is not attached to a hat block. The blocks need to be moved inside on button [A] pressed. The frequency, the note or the tempo are not the problem here.",
                "skills": [
                  "prog-debug",
                  "prog-structure"
                ]
              },
              {
                "id": "m10h4d16-q5",
                "kind": "predict-output",
                "prompt": "The order is written with blocks as below, and A is pressed:\n\n```\non button [A] pressed\n   play note [G] for [1/4] beat\n   play note [C] for [1/4] beat\n```\n\nIn what order do the frequencies appear in the Speaker section?",
                "options": [
                  "392 Hz, then 262 Hz",
                  "262 Hz, then 392 Hz",
                  "Both at the same time: 654 Hz",
                  "Only 262 Hz"
                ],
                "answer": 0,
                "explanation": "The blocks run from top to bottom: first G (392 Hz), and when it finishes, C (262 Hz). The frequencies are not added together; the two do not play at the same time.",
                "skills": [
                  "prog-structure"
                ]
              }
            ]
          }
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
          ],
          "contentEn": {
            "title": "Duration, rests and tempo",
            "problem": "If you play the same song slowly and then fast, it sounds like a different song. What makes a song a lullaby or a march is not so much the notes as their durations. Inside the card there is a \"metronome\", a tempo setting. When you change it, the duration of every note changes at the same time.",
            "contentMd": "### Beat and tempo\nIn music, duration is measured in **beats**. On the card, the **tempo** says how many beats are played in one minute. It starts at 120.\n\nThe card works out the duration of a \"1/4 beat\" like this: 60 000 ms ÷ tempo.\n\n| Tempo | 1/4 beat | 1/8 beat | 1/2 beat |\n|---|---|---|---|\n| 60 | 1000 ms | 500 ms | 2000 ms |\n| 120 | 500 ms | 250 ms | 1000 ms |\n| 240 | 250 ms | 125 ms | 500 ms |\n\nAs the tempo gets bigger, the notes get shorter and the music speeds up. The values **1/16, 1/8, 1/4, 1/2, 1, 2** in the note list choose how many \"quarter-beat units\" that note lasts. A 1/4 beat is one unit; a 1/2 beat is two units and 1 beat is four units.\n\n### New blocks\n- The **set tempo to [120] (bpm)** block in the **Music** category sets the tempo.\n- The **rest for [1/4] beat** block leaves a silence in the music. It waits as long as a note, but makes no sound.\n- The **tempo** block gives the current tempo as a number. To show it on the screen, you can put it inside **show number**.\n\n### Step by step\n**on button [A] [pressed]** is ready in the editor. In this activity you will play a slow and a fast \"ta ta ta\".\n\n1. Put these inside **on button [A] [pressed]**, in this order:\n   - **set tempo to [60] (bpm)**\n   - **play note [G] for [1/4] beat**\n   - **rest for [1/4] beat**\n   - **set tempo to [240] (bpm)**\n   - **play note [G] for [1/4] beat**\n   - **rest for [1/4] beat**\n   - **play note [G] for [1/4] beat**\n2. Press ▶ **Run**, then press the card's **A** button.\n\n### Expected result\nThe first G is slow and long: a whole second. Then the two Gs are fast and short: a quarter of a second each, with a quarter of a second of silence between them. In the Speaker section you see **playing: 392 Hz** appear and disappear. All three goals should have a ✓.\n\n### How does it work?\n- The **set tempo to ...** block runs once, but it affects the duration of every note that comes after it. It stays in force until a new tempo block comes.\n- The **rest** block follows the tempo too. When the tempo is 60, a 1/4 beat rest is silent for 1 second.\n- When you play the same note several times in a row, it is harder to tell the notes apart if you do not put rests between them.\n\n### Try it\n1. Set the tempo to different values between 20 and 400. The card automatically pulls values outside this range back to the limit.\n2. Put the **tempo** block into a **show number** block and show on the screen which tempo you are at.\n3. Check that two 1/8 beat notes fill the same time as one 1/4 beat note.\n\n### Common mistakes\n- **Mixing up beat values and milliseconds.** **pause [500] ms** gives a real time and does not listen to the tempo at all. The note and **rest** blocks, however, change with the tempo.\n- **Leaving the tempo very low and thinking \"the program is stuck\".** At tempo 20, a quarter beat is 3 seconds.\n- **Forgetting the rests.** Rhythm is made of gaps as much as of notes.",
            "question": "What would a lullaby sound like at tempo 240? And a march at tempo 40? How does the tempo change the feeling in a song?",
            "explainerMd": "### What you will learn in this lesson\n- The ideas of **tempo** and **beat**\n- How to work out a note's duration with the formula `60000 / tempo`\n- Why the **rest** block is part of the music\n- What happens when the tempo changes, and that duration values depend on the tempo\n\n### What you should know first\nLesson 16: you should know that the note block plays the note and waits until it has finished, and the ideas of frequency and Hz. You should also be able to use the button hat block.\n\n### Tempo: the speed of the music\nIf you play the same song slowly and then fast, it sounds like a different song. In music this speed is called the **tempo**. On the card, the tempo says **how many beats are played in one minute**. It starts at 120: 120 beats per minute, so 2 beats per second.\n\n### How many milliseconds is a beat?\nOne minute is 60 000 milliseconds. Whatever the tempo is, that many beats fit into one minute. So the duration of one unit is found like this:\n\n```\nduration of a 1/4 beat (ms) = 60000 / tempo\n```\n\nThe values in the card's note list choose how many times this unit the note lasts:\n\n```\nValue        1/16   1/8   1/4   1/2   1    2\nUnits        0.25   0.5    1     2    4    8\n```\n\nAt tempo 120, one unit is 500 ms. So a 1/8 beat is 250 ms and a 1/2 beat is 1000 ms. If the tempo is 60, the unit is 1000 ms; if the tempo is 240, it is 250 ms. **As the tempo gets bigger, the notes get shorter**, and the music speeds up.\n\n### A rest is like a note\nThe **rest for [1/4] beat** block makes no sound, but it waits for the same time. Rhythm is made of gaps as much as of notes. If you play the same note several times in a row without a rest in between, the notes run into each other.\n\n### The tempo block lasts\nThe **set tempo to [N]** block runs once, but every note and every rest after it is worked out with the new tempo. The value stays until a new tempo block comes. The card keeps the tempo between 20 and 400; if you write a number outside this range, it pulls it to the nearest limit. For example, if you write 500, the tempo becomes 400.\n\n### Blocks that want milliseconds, not beats\nThe **pause [500] ms** block gives the real time in milliseconds and does not listen to the tempo at all. The note and rest blocks, however, change with the tempo. If you do not know this difference, you will be puzzled: \"I raised the tempo, but the pause did not get shorter\".\n\n### Summary\nThe tempo is the number of beats per minute, and one unit lasts 60000 / tempo milliseconds. When the tempo goes up, the notes get shorter. The rest block waits for the same time without making a sound. The tempo block affects everything after it; the pause block does not depend on the tempo and wants milliseconds directly.",
            "concepts": [
              {
                "term": "Tempo",
                "definition": "The speed of the music; on the card it is given as beats per minute and starts at 120.",
                "example": "At tempo 60 a 1/4 beat lasts 1000 ms; at tempo 240 it lasts 250 ms.",
                "pitfall": "Thinking the notes get longer when you raise the tempo; as the tempo goes up, the notes get shorter."
              },
              {
                "term": "Beat duration",
                "definition": "A 1/4 beat lasts 60000 / tempo milliseconds; the other values are multiples of it.",
                "example": "At tempo 120 a 1/2 beat lasts 2 × 500 = 1000 ms.",
                "pitfall": "Thinking the beat value is directly in milliseconds; it is first converted using the tempo."
              },
              {
                "term": "Rest block",
                "definition": "A block that makes no sound but waits for the chosen time.",
                "example": "By putting a 1/4 beat rest between three notes, you make the rhythm clear.",
                "pitfall": "Forgetting the rests; the same notes run into each other and the rhythm is lost."
              },
              {
                "term": "Tempo block",
                "definition": "Changes the speed of all the notes and rests after it; it works between 20 and 400.",
                "example": "After the set tempo to [240] block, every 1/4 beat lasts 250 ms.",
                "pitfall": "Thinking the tempo block only affects the next note; it stays in force until a new tempo block comes."
              },
              {
                "term": "pause (ms)",
                "definition": "A block that waits for real milliseconds; it ignores the tempo completely.",
                "example": "pause [500] ms always lasts half a second, whatever the tempo is.",
                "pitfall": "Using the pause block in a rhythm and expecting its time to change when you change the tempo."
              }
            ],
            "quiz": [
              {
                "id": "m10h4d17-q1",
                "kind": "numeric",
                "prompt": "The tempo is 60. How many milliseconds does a [1/2] beat note last? (1/4 beat = 60000 / tempo, 1/2 beat = 2 units)",
                "answer": 2000,
                "tolerance": 0,
                "unit": "ms",
                "explanation": "At tempo 60 one unit is 60000 / 60 = 1000 ms. A 1/2 beat is two units, so it lasts 2 × 1000 = 2000 ms.",
                "skills": [
                  "prog-timing"
                ]
              },
              {
                "id": "m10h4d17-q2",
                "kind": "numeric",
                "prompt": "With the tempo at 240, how many milliseconds does a [1/8] beat note last? (1/8 beat = half a unit)",
                "answer": 125,
                "tolerance": 0,
                "unit": "ms",
                "explanation": "At tempo 240 one unit is 60000 / 240 = 250 ms. A 1/8 beat is half a unit, so it is 250 / 2 = 125 ms.",
                "skills": [
                  "prog-timing"
                ]
              },
              {
                "id": "m10h4d17-q3",
                "kind": "predict-output",
                "prompt": "The tempo starts at 120. When A is pressed, the program below runs. How many milliseconds do the notes take in total?\n\n```\nset tempo to [60]\nplay note [G] for [1/4] beat\nrest for [1/4] beat\nset tempo to [240]\nplay note [G] for [1/4] beat\nrest for [1/4] beat\nplay note [G] for [1/4] beat\n```",
                "options": [
                  "1500 ms",
                  "2750 ms",
                  "3500 ms",
                  "1750 ms"
                ],
                "answer": 1,
                "explanation": "The first G and the first rest are 1000 ms each at tempo 60: 2000 ms. Then the tempo becomes 240; the three blocks are 250 ms each: 750 ms. Total 2000 + 750 = 2750 ms. If you think it is all at tempo 240 you get 1500; if you think it is all at tempo 60 you get 5000.",
                "skills": [
                  "prog-timing"
                ]
              },
              {
                "id": "m10h4d17-q4",
                "kind": "find-bug",
                "prompt": "To speed up the song, a student set the tempo to 240. The notes got shorter, but the pause after each note stayed the same:\n\n```\nset tempo to [240]\nplay note [C] for [1/4] beat\npause [500] ms\nplay note [D] for [1/4] beat\n```\n\nWhat is the problem?",
                "options": [
                  "The note C does not support tempo 240",
                  "The pause ms block does not listen to the tempo; a rest block should be used for the pause",
                  "The tempo block should be written twice",
                  "The note D cannot be a 1/4 beat"
                ],
                "answer": 1,
                "explanation": "pause [500] ms waits for real milliseconds and does not change with the tempo. To tie the pause to the tempo, use the rest for [1/4] beat block; then the pause is 250 ms.",
                "skills": [
                  "prog-debug",
                  "prog-timing"
                ]
              },
              {
                "id": "m10h4d17-q5",
                "kind": "mcq",
                "prompt": "If you try to set the tempo to 500 in the program, what happens on the card?",
                "options": [
                  "The tempo becomes 500",
                  "The tempo becomes 400; the card pulls the value to the upper limit",
                  "It gives an error and the program stops",
                  "The tempo goes back to 120"
                ],
                "answer": 1,
                "explanation": "The card keeps the tempo between 20 and 400. 500 is outside the limit, so it is pulled to 400; at this speed a 1/4 beat lasts 150 ms. The program does not stop.",
                "skills": [
                  "prog-timing"
                ]
              }
            ]
          }
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
          ],
          "contentEn": {
            "title": "Melodies and lists",
            "problem": "Writing every note of a song as a separate block takes a very long time. The card has ready-made melodies inside it: one block plays a whole song. But what if you want to write your own melody? Then you can put the notes into a **list** and have them all played in turn. This lesson teaches you both.",
            "contentMd": "### Ready-made melodies\nThe **play melody [Ode to joy]** block in the **Music** category plays a melody from start to finish and waits until it ends. There are nine melodies in the list: **Ode to joy**, **Twinkle star**, **Fanfare**, **Sad**, **Alarm**, **Going up**, **Going down**, **Jingle**, **Birdsong**. At tempo 120, **Twinkle star** lasts 8 seconds, **Fanfare** 2.75 seconds and **Alarm** 1.6 seconds.\n\n### What is a list?\nA list is a box that holds several values in order. Every item has a number, and **the numbers start at 0**: the first item is 0, the second item is 1, the third item is 2... In this lesson we will put the frequencies of notes into a list.\n\n### New blocks\n- The **note [C]** block in the **Music** category gives the frequency (Hz) of the note as a number. For example, **note [E]** = 330.\n- The **play tone [440] Hz for [1/4] beat** block in the **Music** category plays with a number instead of a note name. You can plug a value such as **note [C]** into it.\n- The **make list** block in the **Lists** category makes a list. You add more items with the gear on top of it.\n- The **for each item [item] in list [list]** block in the **Loops** category takes each item in the list in turn and runs the blocks inside it for that item.\n- The **set [ezgi] to [0]** block and the variable block (called **ezgi**, \"melody\") in the **Variables** category are for storing the list.\n\n### Step by step\nThe **on start**, **on button [A] [pressed]** and **on button [B] [pressed]** blocks are ready in the editor.\n\n1. In the **Variables** category, press the **Make a variable...** button. Name it **ezgi** (it is best not to use special letters such as `ç` or `ş`).\n2. Put the **set ezgi to [0]** block inside **on start**. In place of the zero, plug in the **make list** block from the **Lists** category. Open four slots in the list.\n3. Plug a **note [C]** block from the **Music** category into each of the four slots: **C**, **E**, **G**, **High C**, in that order.\n4. Put the **play melody [Ode to joy]** block inside **on button [A] [pressed]**, and choose **Twinkle star** from the list.\n5. Put the **for each item [item] in list [list]** block inside **on button [B] [pressed]**. Plug the **ezgi** variable in place of the list.\n6. Put the **play tone [440] Hz for [1/4] beat** block inside the loop. Plug the loop variable in place of the frequency (you can take it from the Variables category).\n7. Press ▶ **Run**. First press **B**, then press **A**.\n\n### Expected result\nWhen you press **B**, four notes play: 262, 330, 392 and 523 Hz. When you press **A**, Twinkle star plays for eight seconds. All three goals should have a ✓.\n\n### How does it work?\n- **on start** runs once and makes the list. That is why the list is not built again every time you press B.\n- The loop takes one item from the list at a time, puts it into the loop variable and plays the note inside. Because there are four items, it goes round four times.\n- In the code tab, the loop looks like `for (oge of ezgi)`. In the code tab, Turkish letters in variable names are written with their plain ASCII versions (`o` instead of `ö`); `oge` comes from the Turkish loop variable name `öğe` (\"item\").\n- If you press B while a melody is playing after pressing A, the two melodies try to play together. The card has only one speaker; the new sound takes the place of the old one.\n\n### Try it\n1. Put eight notes in the list instead of four and find your own melody.\n2. Put the **set tempo to [160] (bpm)** block before the loop. Did your melody speed up?\n3. Try another ready-made melody: **Birdsong**. Describe what you hear.\n4. Put the **length of list [ezgi]** block from the **Lists** category inside **show number**. You should see 4 on the screen.\n\n### Common mistakes\n- **Not making the list in on start.** If the list is empty, the loop never goes round and no sound comes out.\n- **Writing the note name straight into the list.** We put frequency blocks such as **note [C]** into the list, because the **play tone Hz** block expects a number.\n- **Starting the numbers at 1.** In lists, the first item's number is 0.",
            "question": "Why is putting the notes of a song into a list more useful than writing them one by one with blocks? Could you use the same list for both notes and colours?",
            "explainerMd": "### What you will learn in this lesson\n- How to put several values into a **list** in order\n- That list numbers start at **0**\n- How to work through the items of a list in turn with the **for each item** loop\n- How to work out the duration of ready-made melodies from the tempo\n\n### What you should know first\nLessons 16 and 17: playing notes, frequency and tempo. You should also know how to make a **variable** and give it a value, and the **on start** hat block.\n\n### Ready-made melodies\nThe card has nine ready-made melodies, and the **play melody** block plays a whole song with one block. Its duration depends on the total units of the melody's notes and on the tempo. For example, the Fanfare melody is 5.5 units long. At tempo 120 one unit is 500 ms, so the duration is 5.5 × 500 = 2750 ms. At tempo 60 the same melody lasts 5.5 × 1000 = 5500 ms.\n\n### What is a list?\nPutting in a block for every note takes a long time. A **list** holds many values in order in one box. Every value has a **number** (index), and the numbering starts at **0**:\n\n```\nezgi = [262, 330, 392, 523]\nindex:   0    1    2    3\n```\n\nHere the length of the `ezgi` (melody) list is 4, but the number of the last item is 3. Item number 2 is 392, because we start counting from zero. Keep this difference of one between the \"length\" and the \"last number\" in mind.\n\n### Where do you build the list?\nYou build the list inside the **on start** hat block. That block runs once when the program opens. So when a button is pressed, the list is already ready. If you forget to build the list, the variable is still a number, and the list block stops with the error \"This block needs a list.\"\n\n### For each item\nThe **for each item [item] in list [list]** block takes each value in the list in turn, puts it into the loop variable and runs the blocks inside it for that value. In a list with four items, the blocks inside run exactly four times:\n\n```\nfor each item in list ezgi:\n   play tone [item] Hz for [1/8] beat\n```\n\nBecause this block plays the sound on every round, the four notes take 4 × 250 = 1000 ms in total (tempo 120, 1/8 beat). In code, the same thing appears as `for (oge of ezgi)`. The code tab writes Turkish letters in plain ASCII (`oge` is the Turkish word for \"item\").\n\n### Summary\nReady-made melodies play with a single block, and their duration depends on the tempo. A list is a box that holds several values in order; the numbers start at 0, so the last number is one less than the length. You build the list in on start. The for each item block runs once with each value in the list, and the total time is the number of rounds multiplied by the time of each round.",
            "concepts": [
              {
                "term": "List",
                "definition": "A variable that holds several values in order.",
                "example": "ezgi = [262, 330, 392, 523] stores the frequencies of four notes.",
                "pitfall": "Putting a single number instead of a list; the list block stops with \"This block needs a list.\""
              },
              {
                "term": "List number (index)",
                "definition": "The position of an item in the list; counting starts at 0.",
                "example": "In the list [262, 330, 392, 523], item number 2 is 392.",
                "pitfall": "Thinking the first item is 1; the first item is always 0."
              },
              {
                "term": "List length",
                "definition": "How many items the list holds.",
                "example": "A list of four notes has a length of 4 and a last number of 3.",
                "pitfall": "Mixing up the length and the last number; the last number is one less than the length."
              },
              {
                "term": "For each item",
                "definition": "A loop that takes each value in the list in turn and runs the blocks inside it for that value.",
                "example": "In a list with four items, the note block inside runs four times.",
                "pitfall": "Using it on an empty list; if the list is empty, the loop never goes round and no sound comes out."
              },
              {
                "term": "on start",
                "definition": "A hat block that runs once when the program starts; lists and variables are set up here.",
                "example": "You build the melody list in on start, and the buttons find the list ready.",
                "pitfall": "Building the list in a button hat block; the list starts again on every press and the old values are lost."
              }
            ],
            "quiz": [
              {
                "id": "m10h4d18-q1",
                "kind": "mcq",
                "prompt": "In the list ezgi = [262, 330, 392, 523], which is item number 2?",
                "options": [
                  "330",
                  "392",
                  "262",
                  "523"
                ],
                "answer": 1,
                "explanation": "The numbering starts at 0: 0 -> 262, 1 -> 330, 2 -> 392, 3 -> 523. If you said 330, you started counting from 1.",
                "skills": [
                  "prog-loops-arrays"
                ]
              },
              {
                "id": "m10h4d18-q2",
                "kind": "numeric",
                "prompt": "The Fanfare melody is 5.5 units long and the tempo is 60 (one unit is 1000 ms). How many milliseconds does the melody last?",
                "answer": 5500,
                "tolerance": 0,
                "unit": "ms",
                "explanation": "At tempo 60 one unit is 60000 / 60 = 1000 ms. 5.5 × 1000 = 5500 ms. At tempo 120 the same melody finishes in half the time, 2750 ms.",
                "skills": [
                  "prog-timing"
                ]
              },
              {
                "id": "m10h4d18-q3",
                "kind": "predict-output",
                "prompt": "The tempo is 120. When B is pressed, the program below runs:\n\n```\non start:\n   ezgi = [262, 330, 392]\n\non button [B] pressed:\n   for each item in list ezgi:\n      play tone [item] Hz for [1/8] beat\n```\n\nHow many notes, and how many ms in total, are heard from the speaker?",
                "options": [
                  "3 notes, 750 ms",
                  "3 notes, 1500 ms",
                  "1 note, 250 ms",
                  "4 notes, 1000 ms"
                ],
                "answer": 0,
                "explanation": "The list has 3 items, so the loop goes round 3 times. At tempo 120 a 1/8 beat is 250 ms: 3 × 250 = 750 ms. If you said 4 notes, you thought the loop goes round one extra time.",
                "skills": [
                  "prog-loops-arrays",
                  "prog-timing"
                ]
              },
              {
                "id": "m10h4d18-q4",
                "kind": "find-bug",
                "prompt": "A student wanted the card to play the melody when B is pressed, but the card gave the error \"This block needs a list.\":\n\n```\non start:\n   ezgi = 0\n\non button [B] pressed:\n   for each item in list ezgi:\n      play tone [item] Hz for [1/8] beat\n```\n\nWhat causes the error?",
                "options": [
                  "A 1/8 beat cannot be chosen",
                  "The ezgi variable was given the number 0 instead of a list",
                  "Button B cannot be used",
                  "The name of the item variable is wrong"
                ],
                "answer": 1,
                "explanation": "Because the ezgi variable is 0, it is not a list but an ordinary number. In on start it should be given a make list block with items in it. The other options have nothing to do with the error message.",
                "skills": [
                  "prog-debug",
                  "prog-loops-arrays"
                ]
              },
              {
                "id": "m10h4d18-q5",
                "kind": "numeric",
                "prompt": "A list has 6 items. What is the number of the last item?",
                "answer": 5,
                "tolerance": 0,
                "explanation": "Because numbering starts at 0, the numbers of the 6 items are 0, 1, 2, 3, 4, 5. The last number is one less than the length: 6 - 1 = 5.",
                "skills": [
                  "prog-loops-arrays"
                ]
              }
            ]
          }
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
          ],
          "contentEn": {
            "title": "Make an instrument",
            "problem": "A piano's keys make a sound when you press them. But can there be an instrument with no keys at all? A strange instrument called the theremin is played without touching it, just by bringing your hand closer. We will make something similar, a \"light string\", with the virtual card's light sensor.",
            "contentMd": "### Buttons: a three-key instrument\nThe card has three button combinations: **A**, **B** and **A+B**. **A+B** works when you press both at once. We will use these three buttons for three notes.\n\n### Continuous sound\nThe note blocks so far played for a set time and then went quiet. The **ring tone [440] Hz** block in the **Music** category, however, starts the sound and does not let go until you use the **stop sound** block. These two blocks are used together: one turns the sound on, the other turns it off. The **playing** box in the Speaker section only shows notes with a duration; it may not show the continuous sound.\n\n### New blocks\n- The **every [1000] ms** block in the **Basic** category runs what is inside it again and again at a set interval. We will make the interval 100.\n- The **light level** block in the **Input** category gives a number between 0 (dark) and 255 (very bright). You can change it with the **Light** slider in the **Compass and sensors** section next to the card.\n- The **logo touched?** block in the **Input** category is true if the logo is being touched right now.\n- The **map [light level] from [0]-[255] to [200]-[1000]** block in the **Math** category scales a number from one range to another. When the light is 0 you get 200; when the light is 255 you get 1000. Light levels in between give frequencies in between.\n- The **when logo is [touched]** and **when logo is [released]** hat blocks.\n\n### Step by step\nFive hat blocks are ready in the editor: three buttons, the timer **every [100] ms** and **when logo is [released]**.\n\n1. Put **play note [C] for [1/4] beat** inside **on button [A] [pressed]**, **D** inside **on button [B] [pressed]** and **E** inside **on button [A+B] [pressed]**.\n2. Put the **if ... then** block from the **Logic** category inside **every [100] ms**. Plug **logo touched?** from the **Input** category into the condition.\n3. Put **ring tone [440] Hz** from the **Music** category inside the **if**. Plug the **map** block in place of the frequency. Drop the **light level** block into the first input of the map block, and make the ranges 0-255 and 200-1000.\n4. Put the **stop sound** block inside **when logo is [released]**.\n5. Press ▶ **Run**. Play the notes with the three buttons. Then click the logo and hold it down; move the light slider.\n\n### Expected result\nThe buttons play C, D, E. When you hold the logo down, the sound rings continuously. When you pull the light slider up, the sound gets higher (close to 1000 Hz); when you pull it down, it gets deeper (close to 200 Hz). When you let go of the logo, the sound stops. All four goals should have a ✓.\n\n### How does it work?\n- **every [100] ms** looks at the light every 0.1 seconds and updates the sound. As you change the light, the sound follows.\n- If the logo is not being touched, the blocks inside **if** are skipped, and the sound never starts.\n- **stop sound** runs when you let go of the logo. If you do not put this block in, the continuous sound does not stop by itself.\n- The **map** block rounds the result to the nearest whole number.\n\n### Try it\n1. Make the range 100-2000. Do you want to hear a very high sound?\n2. The **set volume to [128] (0-255)** block sets how loud the sound is. Try 40 first, then 255.\n3. Put the **sound level** block in place of the light and try playing the string with sound. Move the card's **Sound** slider.\n\n### Common mistakes\n- Not putting in **stop sound**.\n- Writing the ranges in the **map** block the wrong way round. The first range must be the sensor's range (0-255), the second the sound's range (200-1000).\n- Forgetting the **if** block and turning the sound on every 100 ms. The sound plays even if you never touch the logo.",
            "question": "A theremin is played by bringing your hand closer; your card is played with light. Which other sensors could you turn into an instrument? What kind of sound would the sound level, the temperature or the tilt make?",
            "explainerMd": "### What you will learn in this lesson\n- How to **play** an instrument with the button and logo inputs\n- The difference between sound **with a duration** and **continuous** sound\n- How to turn a sensor value into a frequency with the **map** block\n- Why you need to turn off a continuous sound with **stop sound**\n\n### What you should know first\nLessons 16-18: playing notes, tempo and variables. You also need to know the **if ... then** block and the card's **light level** sensor (0-255).\n\n### Inputs, sound and a sensor\nAn instrument has three parts: an **input** (a finger, a button, light), a **rule** (which sound for which input) and an **output** (the speaker). The card has three button combinations: **A**, **B** and **A+B**. You use the three of them for three notes. Touching the logo is a fourth input.\n\n### Sound with a duration and continuous sound\nThe note blocks so far played for a set time and then went quiet. The **ring tone [N] Hz** block, however, starts the sound and lets go; the sound keeps playing until the **stop sound** block. The two blocks are a pair: one turns it on, the other turns it off. Because a continuous sound counts as having a duration of zero, the \"playing\" box in the Speaker section may not show it; you still hear the sound.\n\n### Map: turn one range into another\nThe light sensor gives a number between 0 and 255, but the frequencies that sound nice are between 200 and 1000. The **map** block scales a value from one range to the other:\n\n```\nmap( light , 0-255 , 200-1000 )\n   light   0  -> 200\n   light 255  -> 1000\n   light 128  -> 602   (near the middle)\n```\n\nThe calculation: `200 + ışık × 800 / 255` (`ışık` is the light level), then it is rounded to the nearest whole number. The first range is the sensor's, the second range is the sound's. If you mix up the order, the result is nonsense.\n\n### Updating all the time with a timer\nBecause the light keeps changing, setting the sound once is not enough. The **every [100] ms** hat block repeats what is inside it ten times a second. Inside it you write: **if the logo is touched**, set the sound from the light at that moment. If the logo is not touched, the **if** block skips its inside and the sound does not start. When the logo is released, a separate hat block that calls **stop sound** turns the sound off. If you forget this block, the continuous sound does not stop by itself.\n\n### Summary\nAn instrument is made of an input, a rule and an output. A note with a duration ends by itself; a continuous sound must be turned off with the stop sound block. The map block scales a sensor range such as 0-255 to a frequency range. The timer hat block keeps the values up to date, and the if block plays the sound only while the logo is being touched.",
            "concepts": [
              {
                "term": "Continuous sound",
                "definition": "A sound that, once started, plays until the stop sound block.",
                "example": "While you touch the logo the continuous sound rings; when you let go, stop sound runs.",
                "pitfall": "Not putting in the stop sound block; the sound does not stop by itself."
              },
              {
                "term": "Map (range conversion)",
                "definition": "Scales a value from one range to another and rounds it to the nearest whole number.",
                "example": "When the light is mapped from 0-255 to 200-1000 Hz, a light of 255 gives 1000 Hz.",
                "pitfall": "Writing the ranges the wrong way round; the sensor's range comes first, then the sound's."
              },
              {
                "term": "Light level",
                "definition": "How bright the sensor reads; between 0 (dark) and 255 (very bright).",
                "example": "When you pull the light slider up, the value gets bigger.",
                "pitfall": "Playing the light level directly as a frequency; values between 0 and 255 sound very low."
              },
              {
                "term": "every [N] ms",
                "definition": "A timer hat block that runs what is inside it again and again at a set interval.",
                "example": "An interval of 100 ms reads the light and updates the sound ten times a second.",
                "pitfall": "Choosing an interval that is too long; the sound follows the light late."
              },
              {
                "term": "Condition (if ... then)",
                "definition": "Runs the blocks inside it only while the condition is true.",
                "example": "If the logo is touched, play a sound; if not, do nothing.",
                "pitfall": "Forgetting the condition and starting the sound on every round; the sound plays even if you do not touch the logo."
              }
            ],
            "quiz": [
              {
                "id": "m10h4d19-q1",
                "kind": "numeric",
                "prompt": "When the light level is 255, how many Hz does the map( light, 0-255, 200-1000 ) block give?",
                "answer": 1000,
                "tolerance": 0,
                "unit": "Hz",
                "explanation": "The map block links the top end of one range to the top end of the other: 255 -> 1000. If the light were 0, you would get 200 Hz.",
                "skills": [
                  "prog-timing"
                ]
              },
              {
                "id": "m10h4d19-q2",
                "kind": "numeric",
                "prompt": "When the light level is 128, how many Hz does the map( light, 0-255, 200-1000 ) block give? (Round the result to the nearest whole number.)",
                "answer": 602,
                "tolerance": 0,
                "unit": "Hz",
                "explanation": "200 + 128 × 800 / 255 = 200 + 401.57 = 601.57. Rounded to the nearest whole number, it is 602. Because the light is a little more than half of the range, the result is a little above 600.",
                "skills": [
                  "prog-timing"
                ]
              },
              {
                "id": "m10h4d19-q3",
                "kind": "find-bug",
                "prompt": "A student wanted a sound when the logo is touched. But when they let go of the logo, the sound does not stop:\n\n```\nevery [100] ms:\n   if logo touched? then:\n      ring tone [map(light, 0-255, 200-1000)] Hz\n\nwhen logo is [released]:\n   (empty)\n```\n\nWhat is missing?",
                "options": [
                  "The every [100] ms block",
                  "The stop sound block inside when logo is released",
                  "The if block",
                  "The light level block"
                ],
                "answer": 1,
                "explanation": "A continuous sound does not end by itself; the stop sound block is needed. It must be added inside the released hat block. The other blocks start the sound but do not silence it.",
                "skills": [
                  "prog-debug",
                  "prog-structure"
                ]
              },
              {
                "id": "m10h4d19-q4",
                "kind": "predict-output",
                "prompt": "The logo is held down. The light slider is pulled first to 0, then to 255:\n\n```\nevery [100] ms:\n   if logo touched? then:\n      ring tone [map(light, 0-255, 200-1000)] Hz\n```\n\nA little while after the slider reaches 255, how many Hz is the sound?",
                "options": [
                  "200 Hz",
                  "255 Hz",
                  "1000 Hz",
                  "602 Hz"
                ],
                "answer": 2,
                "explanation": "The timer looks at the light ten times a second and updates the sound. When the light is 255, the map block gives 1000. 200 Hz would play when the light is 0; 255 is the light value itself, without mapping.",
                "skills": [
                  "prog-structure"
                ]
              },
              {
                "id": "m10h4d19-q5",
                "kind": "mcq",
                "prompt": "The sound plays even if you never touch the logo. Inside the timer there is a ring tone block. Which block is most likely missing?",
                "options": [
                  "The if logo touched? then block",
                  "The tempo block",
                  "The rest block",
                  "The on button [A] hat block"
                ],
                "answer": 0,
                "explanation": "Without the condition, the sound is started every 100 ms; it plays even if the logo is not touched. The condition block starts the sound only while the logo is being touched. The tempo and rest blocks have nothing to do with continuous sound.",
                "skills": [
                  "prog-debug",
                  "prog-structure"
                ]
              }
            ]
          }
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
          ],
          "contentEn": {
            "title": "Project: Virtual piano",
            "problem": "In a band everyone has a key to play, but the magic is being able to record the song you play and listen to it again. In this project you will turn your card into a five-key piano. As you press the keys, a column will light up on the screen, the notes will be recorded, and when you touch the logo, the song you played will play again from the start.",
            "contentMd": "### Project: Virtual piano\nYou will put together everything you learnt this week: playing notes, tempo, lists, loops and taking input from buttons and sensors.\n\n**Goals:**\n- Five keys play five different notes: C, D, E, G, A.\n- Each key lights up its own column on the screen.\n- The notes that are played are added to a recording list.\n- When you touch the logo, the recording plays from the start.\n\n### The keys\nThe card has five inputs: the **A**, **B** and **A+B** buttons and the **P0** and **P1** pins. The pins are the three touch areas at the bottom of the card (the boxes marked **0**, **1**, **2** on the card). On the virtual card, clicking them with the mouse counts as touching them. Let's match them like this:\n\n| Key | Note | Column to light on the screen (x) |\n|---|---|---|\n| A | C | 0 |\n| B | D | 1 |\n| A+B | E | 2 |\n| P0 | G | 3 |\n| P1 | A | 4 |\n\n### New block\nThe **on pin [P0] [touched]** block in the **Pins** category is a new hat block that runs when a pin is touched. It is no different from the button hat blocks; only the thing that triggers it is a pin.\n\n### Step by step\nSeven hat blocks are ready in the editor: **on start**, three buttons, two pins and **when logo is [touched]**. First build only the **A** key and see that it works. Then copy it for the others.\n\n1. In the **Variables** category, make a variable called **kayit** (\"recording\").\n2. Put **set kayit to [0]** inside **on start**. In place of the zero, plug in an empty **make list** block from the **Lists** category.\n3. Put these inside **on button [A] [pressed]**, in this order:\n   - **plot x [0] y [2]**\n   - **play note [C] for [1/8] beat**\n   - **add [note C] to list [kayit]**. Plug the **kayit** variable in place of the list, and the **note [C]** block in place of the item to add.\n   - **clear screen**\n4. Select these four blocks and copy them (Ctrl+C, Ctrl+V). Move the copies to the **B**, **A+B**, **P0** and **P1** hat blocks. In each copy, change the **x** value and the note as in the table.\n5. Put the **for each item [item] in list [kayit]** block inside **when logo is [touched]**. Put the **play tone [440] Hz for [1/8] beat** block inside it, and plug the loop variable in place of the frequency.\n6. Press ▶ **Run**. Play a short melody by clicking the keys. Then click the logo.\n\n### Expected result\nEach key plays its own note, and its own column in the middle row of the screen lights up for a moment and goes out. When you press the logo, the notes you played are played again in the order you played them. All four goals should have a ✓.\n\n### How does it work?\n- The list stores the frequency of every note played, in order. To add to the end of the list, you use **add ... to list**.\n- When you touch the logo, the loop plays every number in the list from start to end. The speed is set by the duration of the notes and the tempo.\n- The body of every key follows the same pattern: light, play, record, clear. Only the note and the column change.\n- Because the notes are 1/8 beat, each one lasts a quarter of a second at tempo 120. If you click fast, a new key starts before the previous note has finished.\n\n### Try it\n1. Put the **set tempo to [80] (bpm)** block inside **on start**. Did the song you played slow down?\n2. In the playback, add **pause [50] ms** inside the loop. A small gap appears between the notes.\n3. To find out how many notes the list holds, put the **length of list [kayit]** block inside **show number**.\n4. The recording is never deleted by itself. How would you make your own key to delete the recording? (Hint: give the recording variable an empty list again.)\n\n### Common mistakes\n- **Not building the list in on start.** If **kayit** never becomes a list, the add block gives the error \"This block needs a list.\" and the program stops.\n- **Giving the same column to two keys.** You cannot tell from the screen which key you pressed.\n- **Leaving the pin key with an empty hat block.** If the **on pin [P0] [touched]** block is empty, touching it does nothing.",
            "question": "If a friend used your piano, what would they most like to change? In which other project would you use the recording feature: a password, a game, a diary?",
            "explainerMd": "### What you will learn in this lesson\n- How to connect several inputs (buttons, pins) to a single **pattern**\n- How to add the notes played to a **recording list**\n- How to play the recording from the start **when the logo is touched**\n- How to break a project into **plan, build, test** steps\n\n### What you should know first\nLessons 16-19: playing notes, tempo, lists and the **for each item** loop, event hat blocks. You should also know how to light an LED on the screen (**plot x y**) and the **clear screen** block.\n\n### Break the project down\nThe virtual piano looks big, but really it is the same small job repeated five times. First put the job into a table:\n\n```\nKey   Note   Column (x)\nA     C      0\nB     D      1\nA+B   E      2\nP0    G      3\nP1    A      4\n```\n\nThe table is the backbone of the code. Each key differs in only two things: the note it plays and the column it lights.\n\n### The key pattern\nThe body of every key has four steps:\n\n```\n1. Plot an LED (x, 2)\n2. Play the note for [1/8] beat\n3. Add the note's frequency to the recording list\n4. Clear the screen\n```\n\nFirst build only the A key and run it. If it works, copy its blocks, move them to the other hat blocks and change only the note and the column. This is the **get the small one working first, then multiply it** method; it makes finding mistakes much easier.\n\n### The recording list\nIn the **on start** hat block, you give the **kayit** (recording) variable an **empty list**. On every key, the **add [note] to list kayit** block puts the note's frequency at the end of the list. If you press the A, B, A, P0 keys in this order, the list becomes:\n\n```\nkayit = [262, 294, 262, 392]     length 4\n```\n\nThe add block runs after the note has been played, because the note block waits for its duration first. If you press the same key quickly, the card queues the presses (up to three); different keys, however, can run at the same time.\n\n### Playback\nYou put a **for each item in list kayit** loop in the **when logo is touched** hat block. Inside the loop there is the **play tone [item] Hz for [1/8] beat** block. At tempo 120 each note is 250 ms; a four-note recording lasts 1000 ms. If the tempo is 80, one note is 375 ms and four notes are 1500 ms. The recording is never deleted; to delete it, you give the kayit variable an empty list again.\n\n### Summary\nReducing a big project to a small table and a single pattern makes the job easier. Every key follows the light, play, record, clear steps. The recording is a list that collects the frequencies of the notes in order; playback plays this list from start to end with the for each item loop. The duration is found by multiplying the number of notes by the tempo unit.",
            "concepts": [
              {
                "term": "Recording list",
                "definition": "A list that collects the frequencies of the notes played, in the order they were played.",
                "example": "After pressing A, B, A, P0, kayit = [262, 294, 262, 392].",
                "pitfall": "Not setting up the list as an empty list in on start; the add block gives the error \"This block needs a list.\""
              },
              {
                "term": "Add to list",
                "definition": "Adds a value to the end of the list; the list gets one item longer.",
                "example": "The add [note C] to list kayit block puts 262 in the list.",
                "pitfall": "Playing the note but forgetting to record it; the playback does not know about that note."
              },
              {
                "term": "Playback",
                "definition": "A loop that plays every note in the recording list in turn, from start to end.",
                "example": "When you touch the logo, the for each item in list kayit loop runs.",
                "pitfall": "Expecting the recording to reset; the recording stays unless you give it an empty list."
              },
              {
                "term": "Key pattern",
                "definition": "The light, play, record, clear sequence that is the same for every key.",
                "example": "A key is copied and only the note and the column (x) are changed.",
                "pitfall": "Giving the same column to two keys; you cannot tell from the screen which key you pressed."
              },
              {
                "term": "Pin touch (P0, P1)",
                "definition": "The touch areas at the bottom of the card; like a button, they are triggered by their own hat block.",
                "example": "The on pin P0 touched hat block plays the note G.",
                "pitfall": "Leaving the hat block empty; an empty hat block does nothing when it is touched."
              }
            ],
            "quiz": [
              {
                "id": "m10h4d20-q1",
                "kind": "numeric",
                "prompt": "There are 8 notes in the recording list. At tempo 120, the playback plays each note for [1/8] beat. How many milliseconds does the whole recording last?",
                "answer": 2000,
                "tolerance": 0,
                "unit": "ms",
                "explanation": "At tempo 120 a 1/8 beat is 250 ms. 8 × 250 = 2000 ms. Because each note block waits until it finishes, the times add up.",
                "skills": [
                  "prog-timing",
                  "prog-loops-arrays"
                ]
              },
              {
                "id": "m10h4d20-q2",
                "kind": "numeric",
                "prompt": "The tempo is 80. How many milliseconds does it take to play back a four-note recording, with each note lasting [1/8] beat?",
                "answer": 1500,
                "tolerance": 0,
                "unit": "ms",
                "explanation": "At tempo 80 one unit is 60000 / 80 = 750 ms, and a 1/8 beat is half of it: 375 ms. 4 × 375 = 1500 ms. Because the tempo is lower, the recording lasts longer than at tempo 120 (1000 ms).",
                "skills": [
                  "prog-timing"
                ]
              },
              {
                "id": "m10h4d20-q3",
                "kind": "predict-output",
                "prompt": "At the start, kayit is an empty list. These keys are pressed in turn: A (C), P0 (G), A (C). Then the logo is touched. In the playback, which frequencies are heard from the speaker, in order?",
                "options": [
                  "262, 392, 262",
                  "262, 262, 392",
                  "392, 262, 262",
                  "262, 392"
                ],
                "answer": 0,
                "explanation": "The list collects the notes in the order they were pressed: [262, 392, 262]. The playback plays it from start to end. Repeats are not deleted; C was recorded twice.",
                "skills": [
                  "prog-loops-arrays"
                ]
              },
              {
                "id": "m10h4d20-q4",
                "kind": "find-bug",
                "prompt": "While the piano is running, pressing a key shows the error \"This block needs a list.\" and the program stops:\n\n```\non start:\n   (empty)\n\non button [A] pressed:\n   plot (0, 2)\n   play note [C] for [1/8] beat\n   add [262] to list kayit\n   clear screen\n```\n\nWhat is the problem?",
                "options": [
                  "The plot block cannot be used with y = 2",
                  "The kayit variable was not given an empty list in on start",
                  "The clear screen block is in the wrong place",
                  "The note C cannot be played for a 1/8 beat"
                ],
                "answer": 1,
                "explanation": "The add block needs a list. Because the kayit variable was not given an empty list in on start, the variable is not a list. The other options have nothing to do with the error.",
                "skills": [
                  "prog-debug",
                  "prog-loops-arrays"
                ]
              },
              {
                "id": "m10h4d20-q5",
                "kind": "mcq",
                "prompt": "On the virtual piano, what problem appears if you give two keys the same column (x = 1)?",
                "options": [
                  "The program does not run at all",
                  "You cannot tell from the screen which key you pressed",
                  "The frequency of the notes changes",
                  "The recording list is deleted"
                ],
                "answer": 1,
                "explanation": "Showing each key with its own column on the screen is how you tell the keys apart. The same column shows the two keys in the same way. The program runs, and the notes and the recording are not affected.",
                "skills": [
                  "prog-planning",
                  "prog-debug"
                ]
              }
            ]
          }
        }
      ]
    },
    {
      "title": "Radyo ve iletişim",
      "project": "Uzaktan kumanda",
      "guideMd": "### Hafta hedefleri\nBu haftanın sonunda öğrenci:\n1. Radyo grubunun ne olduğunu açıklayabilir ve iki kartı aynı gruba alarak mesaj gönderip alabilir.\n2. Sayı, yazı ve ad = değer mesajlarını ayırt edip doğru alma bloğunu seçebilir.\n3. Değişkenlerle toplama ve çıkarma kullanarak basit bir şifre kurabilir ve anahtarın rolünü anlatabilir.\n4. Bir komut tablosu hazırlayıp iç içe **eğer** zinciriyle gelen sayıyı simgeye ya da eyleme çevirebilir.\n5. Kumanda ve araç rollerinde çalışan iki kartlı bir proje planlayıp kurabilir.\n\n### Haftanın planı\nHafta beş derstir; her ders yaklaşık 20-32 dakikadır. Plan günde bir ders içindir.\n\n| Gün | Ders | Süre | Ne yapılır |\n|---|---|---|---|\n| 1 | Mesaj gönder, mesaj al | ~20 dk | Anlatımı oku, iki kartı aynı gruba al, A ve B ile sayı gönder, alan kartta simge göster. |\n| 2 | Yazı, ad ve değer | ~20 dk | Yazı ve ad = değer mesajı gönder, alan kartta türü ad kontrolüyle ayır. |\n| 3 | Gizli mesaj | ~22 dk | Anahtar değişkeniyle toplayıp gönder, alan kartta çıkararak çöz. |\n| 4 | İki kartla sohbet | ~22 dk | Sayı tablosunu kur, iç içe eğer zinciriyle üç simgeyi ayır, ezgi ekle. |\n| 5 | Proje: Uzaktan kumanda | ~32 dk | Komut tablosunu yaz, kumanda ve araç tarafını kur, ok ve servoyu dene. |\n\n### Ön koşul kontrolü\n- Düğme başlıklarını (A, B, A+B) kullanabiliyor mu? (Hafta 2)\n- Değişken oluşturup değerini değiştirebiliyor mu? (Ders 7)\n- **eğer ... ise ... değilse** bloğunu kurabiliyor mu? (Ders 8)\n- Kartı yatırma olayını ve ezgi çalmayı tanıyor mu? (Ders 11 ve Ders 18)\n- Editörde iki kart yan yana açabiliyor mu? (İlk derste gösterilir.)\n\n### Kavram haritası\n- **Radyo temeli:** grup (0-255) → gönderen blok → **radyo mesajı alınınca** → **alınan [sayı]**\n- **Mesaj türleri:** sayı → yazı (en çok 32 karakter) → ad = değer (ad en çok 12 karakter)\n- **Veri düzenleme:** şifreleme (anahtar, toplama ve çıkarma) → komut tablosu (protokol) → mesajı değişkene almak\n- **Karar verme:** eğer → iç içe eğer zinciri → son değilse kolu\n- **Proje:** kart yatışı → komut → radyo → ok ve servo\n\n### Sık yapılan hatalar\n- **İki kartı farklı gruba koymak.** Mesaj ulaşmaz ve hata mesajı çıkmaz.\n- **Alma başlığını boş bırakmak.** Gönderen çalışsa bile alan kart hiçbir şey yapmaz.\n- **Gönderenin kendi mesajını alacağını sanmak.** Mesaj yalnız gruptaki öteki karta gider.\n- **Adı iki tarafta farklı yazmak.** \"sicak\" ile \"sıcak\" aynı değildir; ad 12 karakterden uzunsa kesilir.\n- **Şifrede iki tarafta aynı işlemi kullanmak.** Gönderen toplarsa alan çıkarmalıdır.\n- **Anahtarı ya da mesaj değişkenini doldurmamak.** Değişken 0 kalır, sonuç sessizce yanlış çıkar.\n- **İkinci eğer'i değilse kolunun dışına koymak.** Zincirin sırası bozulur.\n- **Tabloyu iki tarafta farklı kurmak.** Sayıların anlamı kaybolur.\n\n### Hafta sonu tekrarı\n1. Her dersin kavram kartlarını oku ve \"sık yapılan yanlış\" satırlarını yüksek sesle söyle.\n2. Mini testlerde yanlış yaptığın soruların açıklamalarını yeniden oku, sonra soruyu yeniden çöz.\n3. Bakmadan iki kartlı en küçük programı kur: A ile kalp gönder, alan kart kalbi göstersin.\n4. Gizli mesaj programında anahtarı 7'den 20'ye çevir; düz rakam 5 için radyoyla hangi sayı gider? (Cevap: 25.)\n5. Kendi cümlelerinle şu soruyu cevapla: \"Gönderen ve alan taraf neden aynı tabloyu kullanmalı?\"\n\nHafta sonu testi olarak beş dersin mini testleri yeterlidir; her derste 5 soru, toplam 25 soru. Hedef: her dersten en az 4 doğru. Eksik kalan dersin anlatımına dön.\n\n### Proje değerlendirme ölçütü (Uzaktan kumanda)\n| Ölçüt | Gelişmeli | Yeterli | İleri |\n|---|---|---|---|\n| Plan | Komut tablosu yok | Tabloda komut, ekran ve servo açısı var | Tablo kodla birebir uyuyor ve bilinmeyen komut için karar yazılmış |\n| Kumanda tarafı | Bazı yönler mesaj göndermiyor | Dört yön ve A düğmesi doğru sayıyı yolluyor | Ek bir olay (örneğin yüzü yukarı) ya da eğim bilgisi de gönderiliyor |\n| Araç tarafı | Gelen sayı okunmuyor ya da zincir bozuk | Her komutta doğru ok gösteriliyor ve servo dönüyor | Bip ya da ek bir tepki var, son kol aracı durduruyor |\n| Hata ayıklama | Hatayı bulamıyor | Hatayı grup, tablo ya da boş başlık olarak bulup düzeltiyor | Hatayı nasıl bulduğunu ve önlemeyi anlatıyor |\n| Anlatım | Ne yaptığını anlatamıyor | Sistemi kumanda, mesaj ve araç diye anlatıyor | Mesaj kaybolursa ne olacağını ve neye ihtiyaç olduğunu tartışıyor |\n\n### Veli ve öğretmen notu\n- **Amaç.** Bu hafta iki ayrı şeyin yalnız bir mesajla bağlanabileceğini görmek, gelen mesajı yorumlayan program kurmak ve ortak bir \"anlaşma\" (tablo) fikrini kavramaktır.\n- **Nasıl destek olunur?** Cevabı söylemek yerine şunları sor: \"İki kart aynı grupta mı?\", \"Alma başlığının içinde ne var?\", \"Hangi sayıyı gönderdin, tabloda o sayı ne demek?\"\n- **Sessiz hatalar.** Radyoda çoğu hata uyarı üretmez. Öğrenciye hatayı sistematik aratın: önce grup, sonra gönderen blok, sonra alma başlığı.\n- **Şifreleme.** Burada kurulan şifre öğretici bir örnektir, gerçek güvenlik sağlamaz. Gerçek hayatta şifre ya da parola paylaşılmaz.\n- **Güvenlik ve gizlilik.** Portal tamamen sanaldır; gerçek bir radyo, motor ya da kişisel veri kullanılmaz.\n- **İlerleme.** Mini test sonuçları \"İlerlemem\" sayfasında beceri bazında görünür (taslak/pilot özellik; yalnız onay verildiyse kaydedilir).",
      "guideMdEn": "### Week goals\nBy the end of this week, the learner:\n1. Can explain what a radio group is, and can send and receive messages by putting two cards in the same group.\n2. Can tell number, text and name = value messages apart and choose the right receiving block.\n3. Can build a simple cipher using addition and subtraction with variables, and can explain the role of the key.\n4. Can prepare a command table and turn the number that arrives into an icon or an action with a chain of **if** blocks inside each other.\n5. Can plan and build a two-card project that works in the roles of remote and vehicle.\n\n### Plan for the week\nThe week has five lessons; each lesson takes about 20-32 minutes. The plan is for one lesson a day.\n\n| Day | Lesson | Time | What to do |\n|---|---|---|---|\n| 1 | Send a message, receive a message | ~20 min | Read the explainer, put two cards in the same group, send numbers with A and B, show an icon on the receiving card. |\n| 2 | Text, name and value | ~20 min | Send text and name = value messages, tell the type apart on the receiving card with a name check. |\n| 3 | Secret message | ~22 min | Add with the key variable and send, decrypt by subtracting on the receiving card. |\n| 4 | Chatting with two cards | ~22 min | Set up the number table, tell three icons apart with a chain of if blocks, add a melody. |\n| 5 | Project: Remote control | ~32 min | Write the command table, build the remote and vehicle sides, test the arrow and the servo. |\n\n### Prerequisite check\n- Can they use the button hat blocks (A, B, A+B)? (Week 2)\n- Can they make a variable and change its value? (Lesson 7)\n- Can they build the **if ... then ... else** block? (Lesson 8)\n- Do they know the card's tilt event and how to play a melody? (Lesson 11 and Lesson 18)\n- Can they open two cards side by side in the editor? (This is shown in the first lesson.)\n\n### Concept map\n- **Radio basics:** group (0-255) → sending block → **on radio received** → **received [number]**\n- **Message types:** number → text (at most 32 characters) → name = value (name at most 12 characters)\n- **Organising data:** encryption (key, addition and subtraction) → command table (protocol) → putting the message into a variable\n- **Making decisions:** if → chain of if blocks inside each other → the last else branch\n- **Project:** card tilt → command → radio → arrow and servo\n\n### Common mistakes\n- **Putting the two cards in different groups.** The message does not arrive, and no error message appears.\n- **Leaving the receive hat block empty.** Even if the sender works, the receiving card does nothing.\n- **Thinking the sender will receive its own message.** The message only goes to the other card in the group.\n- **Writing the name differently on the two sides.** \"sicak\" and `sıcak` are not the same; a name longer than 12 characters is cut off.\n- **Using the same operation on both sides of the cipher.** If the sender adds, the receiver must subtract.\n- **Not filling in the key or the message variable.** The variable stays 0, and the result is quietly wrong.\n- **Putting the second if outside the else branch.** The order of the chain breaks.\n- **Setting up the table differently on the two sides.** The meaning of the numbers is lost.\n\n### End-of-week review\n1. Read each lesson's concept cards and say the \"common mistake\" lines out loud.\n2. Read again the explanations of the questions you got wrong in the mini quizzes, then answer the question again.\n3. Without looking, build the smallest two-card program: send a heart with A, and the receiving card shows the heart.\n4. In the secret message program, change the key from 7 to 20; for the plain digit 5, which number goes by radio? (Answer: 25.)\n5. Answer this question in your own words: \"Why must the sending and receiving sides use the same table?\"\n\nAs an end-of-week test, the mini quizzes of the five lessons are enough; 5 questions in each lesson, 25 questions in total. Target: at least 4 correct in each lesson. Go back to the explainer of any lesson that falls short.\n\n### Project assessment rubric (Remote control)\n| Criterion | Developing | Secure | Advanced |\n|---|---|---|---|\n| Plan | There is no command table | The table has the command, the screen and the servo angle | The table matches the code exactly, and a decision for unknown commands is written down |\n| Remote side | Some directions do not send a message | The four directions and button A send the right number | An extra event (for example face up) or tilt information is sent too |\n| Vehicle side | The number that arrives is not read, or the chain is broken | For every command the right arrow is shown and the servo turns | There is a beep or another reaction, and the last branch stops the vehicle |\n| Debugging | Cannot find the mistake | Finds and fixes the mistake as a group, table or empty hat block problem | Explains how they found the mistake and how to prevent it |\n| Explanation | Cannot explain what they did | Explains the system as remote, message and vehicle | Discusses what would happen if a message were lost and what would be needed |\n\n### Note for parents and teachers\n- **Aim.** This week is about seeing that two separate things can be connected by just a message, building a program that interprets the message that arrives, and understanding the idea of a shared \"agreement\" (table).\n- **How to help.** Instead of giving the answer, ask these: \"Are the two cards in the same group?\", \"What is inside the receive hat block?\", \"Which number did you send, and what does that number mean in the table?\"\n- **Silent mistakes.** Most radio mistakes do not produce a warning. Have the learner look for the mistake systematically: first the group, then the sending block, then the receive hat block.\n- **Encryption.** The cipher built here is a teaching example and does not give real security. In real life, passwords and codes are not shared.\n- **Safety and privacy.** The portal is completely virtual; no real radio, motor or personal data is used.\n- **Progress.** The mini quiz results appear by skill on the \"My progress\" page (a draft/pilot feature; saved only if consent has been given).",
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
          ],
          "contentEn": {
            "title": "Send a message, receive a message",
            "problem": "Two people talking on walkie-talkies have to be tuned to the same channel. If the channel is different, however loudly you shout, the other person does not hear. Micro Cards have a radio too, and the channel is called a **group**. In this lesson you will set two cards to the same group and send a message from one to the other.",
            "contentMd": "### Two cards\nThe radio works with two cards. In this activity two cards appear side by side in the editor (if the second one does not appear by itself, press the **Add second card** button in the **Radio** section on the right). Both cards run **the same program**. So the program you write runs on both the sending and the receiving card. In the virtual portal there is no real hardware or distance; the message reaches the other card after a very short moment (about 10 milliseconds).\n\n### New blocks\nThey are all in the **Radio** category:\n- **set radio group to [1]**: says which group the card joins. The group is a number between 0 and 255. Cards in the same group hear each other.\n- **radio send number [1]**: sends a number to the other card in the group.\n- **on radio received**: a hat block that runs when a message arrives.\n- **received [number]**: gives the number in the message that arrived. From the list you can also choose **text**, **name** and **value**; you will see them in the next lesson.\n\n### Step by step\n**on start**, two button hat blocks and **on radio received** are ready in the editor.\n\n1. Put the **set radio group to [1]** block inside **on start**.\n2. Put **radio send number [1]** inside **on button [A] [pressed]**. Put the same block inside **on button [B] [pressed]** and make the number **2**.\n3. Put the **if ... then ... else** block from the **Logic** category inside **on radio received**. (There are two **if** blocks in your palette; take the one with the \"else\" branch.)\n4. Plug a comparison block into the condition of the **if**. On the left side put **received [number]** from the **Radio** category, and on the right side write **1**. The sign should be **=**.\n5. Put **show icon [heart]** in the **then** branch and **show icon [happy face]** in the **else** branch.\n6. Press ▶ **Run**. Press Card 1's **A** button. Then press **B**.\n\n### Expected result\nWhen you press **A** on Card 1, a heart appears on Card 2's screen; when you press **B**, a happy face appears. The sending card does not receive its own message: Card 1's screen does not change. The **Last received:** box in the Radio section shows the number received. All five goals should have a ✓.\n\n### How does it work?\n- Card 1 sends the number with **A**. It reaches Card 2, which is in the same group, 10 ms later. On Card 2, the **on radio received** hat block runs.\n- The **received [number]** block inside the hat block reads the message that has just arrived.\n- Because Card 2 runs the same program too, if you press Card 2's **A**, a heart appears on Card 1. So both sides can send and receive.\n- Even if you do not put the group block in the program, the cards start in group 1. Still, writing the group clearly is a good habit.\n\n### Try it\n1. Change Card 2's group: in the Radio section, choose **5** from the **Card 2 group** list. Send a message from Card 1. What happens? Then set the list back to **From program**.\n2. Send a message by hand from the Radio section: type **number**, message **1**, **Send to card 2**. Do you see the same result?\n3. Add a third message to your program: the **A+B** button sends **3**, and Card 2 shows a sad face.\n\n### Common mistakes\n- **Putting the two cards in different groups.** The message never arrives. No error message appears either, because the card does not know who is listening.\n- **Not writing the receiving code.** Even if the sender works, if **on radio received** is empty, the receiving card does nothing.\n- **Comparing the number wrongly.** To check whether the **received [number]** value is equal to **1**, the sign in the comparison block must be **=**.",
            "question": "Is choosing a channel on a walkie-talkie the same as choosing a group on the card? How would you make sure only your friend hears your message?",
            "explainerMd": "### What you will learn in this lesson\n- How the cards talk by radio, and what the **group** number is for\n- That the side that sends a message and the side that receives it are programmed separately\n- When the \"on radio received\" hat block runs\n- How to make a decision based on the number that arrives\n\n### What you should know first\n- Button hat blocks and the **if ... then ... else** block (Lesson 6 and Lesson 8)\n- Showing an icon on the screen (Lesson 3)\n\n### Think like a walkie-talkie\nTwo walkie-talkies only hear each other if they are tuned to the same channel. On the Micro Card's radio, the channel is called a **group**. The group is a number between 0 and 255, so there are 256 different groups. Cards in the same group receive each other's messages; cards in different groups do not hear them. If the program says nothing, the card is in group 1.\n\n### Sender and receiver\nThere are two separate jobs in radio, and you write separate blocks for each:\n\n```\non button A pressed:\n    radio send number 1\n\non radio received:\n    if received number = 1 then show heart\n```\n\nThe send block runs whenever you want; the message goes to the other card in the group. The receive hat block, however, runs by itself when the message **arrives**, without you calling it. This is like the button hat block: there, the event is a key press; here, the event is a message arriving.\n\n### The message does not arrive instantly\nIn the virtual portal there is no distance between the two cards, but just like real radios, the message spends a short time on its way: about 10 milliseconds. Your eye does not notice this. The important rule is this: **the sending card does not receive its own message.** Card 1 sends, Card 2 receives. If the two cards run the same program, Card 2 can send too, and Card 1 receives.\n\n### Deciding with the number that arrives\nYou look at the number inside the message with the **received [number]** block. This block only makes sense inside the receive hat block, because \"the last message that arrived\" is right there at that moment. Then you build a classic condition: if the number is 1, a heart; if not, a happy face. Depending on which number the sender sent, the other card does a different job. In this way, a single number becomes a small **command**.\n\n### Silent mistakes\nWhen the radio goes wrong, usually no warning appears. The card cannot know who is listening; it sends the message and its job is done. So check three things: are the two cards in the same group, is the send block inside the right button, is the hat block on the receiving side filled in?\n\n### Summary\nRadio messages travel between cards in the same group; the group is a number from 0 to 255. The send block sends the message, and the **on radio received** hat block runs when a message arrives. The sender does not receive its own message, and the message arrives about 10 ms later. You decide with the **if** block based on the number that arrives. If a message is not getting through, look at the group numbers first.",
            "concepts": [
              {
                "term": "Radio group",
                "definition": "A number from 0 to 255 that sets which channel the cards talk on. Cards in the same group hear each other.",
                "example": "If both cards are in group 1, the number sent by Card 1 reaches Card 2.",
                "pitfall": "Putting the two cards in different groups: the message never arrives, and no error message appears either."
              },
              {
                "term": "radio send number",
                "definition": "A block that sends a number to the other card in the group.",
                "example": "If you put a block that sends 1 inside button A and one that sends 2 inside button B, you send two different commands.",
                "pitfall": "Thinking the sending card will receive its own message; the sending card does not receive its own message."
              },
              {
                "term": "on radio received",
                "definition": "A hat block that runs by itself when a message from the group arrives.",
                "example": "You can put an if block inside the hat block and show an icon depending on the number that arrives.",
                "pitfall": "Leaving the hat block empty: even if the sender works, the receiving card does nothing."
              },
              {
                "term": "received [number]",
                "definition": "A block that, inside the receive hat block, gives the number in the message that has just arrived.",
                "example": "The comparison received number = 1 asks whether command number 1 has arrived.",
                "pitfall": "Using this block outside the receive hat block; there is no meaningful message there."
              },
              {
                "term": "Command number",
                "definition": "Giving a number a meaning agreed in advance, such as 1 = heart, 2 = happy face.",
                "example": "Card 1 sends the number 2, and Card 2 shows a happy face when it sees the number.",
                "pitfall": "Choosing the wrong comparison sign; for equality, use =."
              }
            ],
            "quiz": [
              {
                "id": "m10h5d21-q1",
                "kind": "mcq",
                "prompt": "Card 1's group is 3, and Card 2's group is 4. Card 1 sends a number by radio. What happens?",
                "options": [
                  "Card 2 receives the message",
                  "The radio shows an error message",
                  "Card 2 does not receive the message, and no error message appears",
                  "Card 1 shows the message on its own screen"
                ],
                "answer": 2,
                "explanation": "A message only goes to cards in the same group. Because the groups are different, Card 2 does not receive the message. The card cannot know this, so no error message appears either; that is why the answer \"it gives an error\" is wrong.",
                "skills": [
                  "mk-radio-group",
                  "mk-message-flow"
                ]
              },
              {
                "id": "m10h5d21-q2",
                "kind": "predict-output",
                "prompt": "Both cards run the same program, and both are in group 1. Button A is pressed on Card 1.\n\n```\non start: set radio group to 1\n\non button A pressed:\n    radio send number 1\n    show icon heart\n\non radio received:\n    if received number = 1 then\n        show icon happy face\n```\n\nWhat appears on the two screens?",
                "options": [
                  "Card 1: heart, Card 2: heart",
                  "Card 1: heart, Card 2: happy face",
                  "Card 1: happy face, Card 2: happy face",
                  "Card 1: heart, Card 2: empty"
                ],
                "answer": 1,
                "explanation": "Card 1 shows the heart itself inside A and sends the message. Because the sender does not receive its own message, Card 1's receive hat block does not run; the heart stays. Card 2 receives the message, and because the number is 1, it shows a happy face. No heart appears on Card 2, because the block that shows the heart is inside the button, and the button was only pressed on Card 1.",
                "skills": [
                  "mk-message-flow",
                  "mk-conditions"
                ]
              },
              {
                "id": "m10h5d21-q3",
                "kind": "find-bug",
                "prompt": "When button A on Card 1 is pressed, Card 2 does nothing. Both cards are in group 1. Find the mistake.\n\n```\non start: set radio group to 1\n\non button A pressed:\n    radio send number 1\n\non radio received:\n    (empty)\n```",
                "options": [
                  "The radio group cannot be 1",
                  "The send block should not be inside the button",
                  "The number should be 0 instead of 1",
                  "The receive hat block is empty; there is no block that handles the message"
                ],
                "answer": 3,
                "explanation": "The message reaches Card 2, but because the receive hat block is empty, Card 2 does not react to it. The group numbers are the same (1), so there is no group mistake; the send block is in the right place too.",
                "skills": [
                  "mk-message-flow",
                  "prog-debug"
                ]
              },
              {
                "id": "m10h5d21-q4",
                "kind": "numeric",
                "prompt": "The radio group is a number between 0 and 255 (0 and 255 included). How many different groups are there?",
                "answer": 256,
                "tolerance": 0,
                "unit": "groups",
                "explanation": "There are 256 numbers from 0 to 255; because counting starts at 0, the last number (255) and the number of groups (256) are different.",
                "skills": [
                  "mk-radio-group"
                ]
              },
              {
                "id": "m10h5d21-q5",
                "kind": "mcq",
                "prompt": "Where is the received [number] block best used?",
                "options": [
                  "Inside the on radio received hat block",
                  "Inside on start, when the program opens",
                  "Only inside button hat blocks",
                  "Before the send block, anywhere"
                ],
                "answer": 0,
                "explanation": "The message that arrives is found inside the receive hat block; the block reads it from there. In a button hat block or in on start there may be no message received yet, so there it does not give the number you expect.",
                "skills": [
                  "mk-message-flow",
                  "mk-conditions"
                ]
              }
            ]
          }
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
          ],
          "contentEn": {
            "title": "Text, name and value",
            "problem": "You can split a message like \"temperature 28\" into two parts: \"temperature\" is a name, and 28 is a value. A card that knows the name puts the value in the right place. When a number is not enough, the radio can also carry text, or a name and a value as a pair. In this lesson you will use all three message types.",
            "contentMd": "### Three message types\n| Type | Sending block | Receiving block |\n|---|---|---|\n| number | **radio send number [1]** | **received [number]** |\n| text | **radio send text [hello]** | **received [text]** |\n| name = value | **radio send [name] = [1]** | **received [name]** and **received [value]** |\n\nLimits: a text can be at most 32 characters, and a name at most 12 characters. Anything longer is cut off. In this lesson we will write names without special letters (for example **sicak**, short for \"hot\"). The sending and receiving sides must write the name exactly the same, letter for letter.\n\nThere is also a block called **signal strength**. In the virtual radio there is no distance, so the signal strength is always 200. Still, it is good to know: on real radios, the signal strength usually drops as the cards move further apart.\n\n### Step by step\n**on start**, **on button [A] [pressed]**, **on button [B] [pressed]** and **on radio received** are ready in the editor.\n\n1. Put **set radio group to [1]** inside **on start**.\n2. Put **radio send text [selam]** inside **on button [A] [pressed]**. Make the text **selam** (\"hi\").\n3. Put **radio send [sicak] = [0]** inside **on button [B] [pressed]**. Make the name **sicak**. Plug the **temperature (°C)** block from the **Input** category in place of the value.\n4. Put **if ... then ... else** inside **on radio received**. Condition: **received [name]** **=** **sicak**. In the **then** branch, put **received [value]** inside **show number**. In the **else** branch, put **received [text]** inside **show text**.\n5. Press ▶ **Run**. Set Card 1's temperature to 28 with the **Temperature** slider in the **Compass and sensors** section. On Card 1, press **A**, then **B**.\n\n### Expected result\nWhen you press **A**, the text **selam** scrolls across Card 2's screen (about 3 seconds). When you press **B**, **28** appears on Card 2. All five goals should have a ✓.\n\n### How does it work?\n- In a text message, the **received [name]** value is empty. So the comparison comes out false and the **else** branch runs.\n- In a **name = value** message, **received [name]** is \"sicak\", and **received [value]** is 28.\n- For every message, you first need to work out its type. In this program, checking the name is a simple way to work out the message type.\n- Card 1's temperature slider belongs to Card 1, and Card 2's slider belongs to Card 2. You can see which card you have selected from the **Card 1 / Card 2** buttons in the right panel.\n\n### Try it\n1. Try the **received [text]** block on a name = value message too. You will see that it gives the value as text.\n2. Send a name = value message by hand from the Radio section: type **name = value**, name **sicak**, message **35**. 35 should appear on Card 2.\n3. Add a new message: **on button [A+B] [pressed]** does **radio send [isik] = [light level]** (`isik` means \"light\"). If the name is **isik**, the receiving card shows a bar graph. (The light is 0-255; make the bar graph's upper limit **255**.)\n4. Send a text longer than 32 characters. How much of it appears on the receiving card?\n\n### Common mistakes\n- **Writing the name differently.** If you write **sicak** on the sender and `sıcak` on the receiver, the comparison does not come out equal.\n- **Thinking the value is text.** **received [value]** is a number. It is good for doing calculations.\n- **A name longer than 12 characters is cut off.** If you choose a long name, the comparison on the receiving side does not match.",
            "question": "Where does sending a \"name = value\" pair instead of a number make your job easier? If you want to send three readings, such as temperature, light and sound, at the same time, how would you organise the messages?",
            "explainerMd": "### What you will learn in this lesson\n- The three message types that can be sent by radio: number, text and the **name = value** pair\n- How to choose the right receiving block for each type\n- The length limits for text and names\n- How to use a name check to work out the type of a message\n\n### What you should know first\n- Radio group, sending and receiving messages (Lesson 21)\n- Showing numbers and text on the screen (Lesson 1 and Lesson 7)\n- The temperature sensor (Lesson 12)\n\n### Why is one type not enough?\nA number is often enough: \"command number 1\". But if you want to say \"temperature 28\", you also have to say what the number measures. That is why the radio carries three types of message:\n\n| Type | Sender | Receiver |\n|---|---|---|\n| number | radio send number | received [number] |\n| text | radio send text | received [text] |\n| name = value | radio send [name] = [value] | received [name] and received [value] |\n\n### The name = value pair\nThe pair is made of a label and a number: the name \"sicak\" (\"hot\"), the value 28. The receiving side reads the name to work out what the message is about. If you want to send three readings at the same time, you use three different names (sicak, isik, ses for hot, light and sound), and the receiving side looks at the name and puts the value in the right place.\n\n### Limits\nA text can be at most **32 characters**, and a name at most **12 characters**. Anything longer is quietly **cut off** while it is being sent. For example, of a 40-letter text, only the first 32 letters arrive on the receiving card. Be careful when comparing names too: if a name is longer than 12 characters, the cut-off version is sent and does not match the full name on the receiving side. You must write the name exactly the same, letter for letter; \"sicak\" and `sıcak` are different names.\n\n### Working out the message type\nThe receiving side does not ask directly what type the message is; it finds out with a name check. In text and number messages, **received [name]** is empty. So the question \"is received name = sicak?\" only comes out true for a name = value message; for the others, the **else** branch runs. This small pattern is the simplest way to tell several different messages apart in one hat block.\n\nThe value that arrives is a number; you can do calculations with it and compare it with a threshold. Text, on the other hand, is shown scrolling across the screen.\n\n### Signal strength\nThe **signal strength** block gives how strongly the message arrived. Because there is no distance in the virtual radio, its value is always 200. On real radios it drops as the cards move apart.\n\n### Summary\nThe radio carries number, text and name = value messages. A text is at most 32 characters and a name at most 12; anything longer is cut off. The sending and receiving sides must write the name the same. The receiving side tells the message type apart with **received [name]** and uses the number with **received [value]**. In the virtual radio, the signal strength is always 200.",
            "concepts": [
              {
                "term": "Number, text, name = value",
                "definition": "The three message types the radio can carry.",
                "example": "A number is used for a command, text for a greeting, and a name = value pair for a reading such as \"sicak = 28\".",
                "pitfall": "Trying to send everything as a number; the receiving side cannot tell what was measured."
              },
              {
                "term": "Name = value pair",
                "definition": "A message made of a label (name) and a number (value).",
                "example": "radio send [sicak] = [28]; the receiving side reads received name and received value.",
                "pitfall": "Writing the name differently on the two sides; \"sicak\" and `sıcak` do not match."
              },
              {
                "term": "Length limits",
                "definition": "A text can be at most 32 characters and a name at most 12 characters; anything longer is cut off.",
                "example": "Of a 40-letter text, only the first 32 letters arrive on the receiving card.",
                "pitfall": "Choosing a long name; the cut-off name does not match the full name on the receiving side."
              },
              {
                "term": "received [name] check",
                "definition": "A simple way to tell whether the message that arrived is a name = value message. In number and text messages the name is empty.",
                "example": "if received name = sicak then show the value, else show the text.",
                "pitfall": "Reading the same block for every message; you need to choose the block that fits the message type."
              },
              {
                "term": "signal strength",
                "definition": "A block that gives how strongly the message arrived. In the virtual radio it is always 200.",
                "example": "On a real radio, the value drops as the cards move further apart.",
                "pitfall": "Expecting the signal strength to change in the virtual portal; there is no distance."
              }
            ],
            "quiz": [
              {
                "id": "m10h5d22-q1",
                "kind": "mcq",
                "prompt": "A card wants to send the temperature, the light and the sound level to the other card at the same time. Which is the best method?",
                "options": [
                  "Sending the three numbers one after another as plain numbers",
                  "Writing them all in one text",
                  "Using a different name for each reading and sending name = value messages",
                  "Using three different groups"
                ],
                "answer": 2,
                "explanation": "To tell the three readings apart, each one is given its own name (sicak, isik, ses) and name = value messages are used; the receiving side looks at the name and puts the value in the right place. If you send three plain numbers, it gets mixed up which one measures what.",
                "skills": [
                  "mk-radio-types"
                ]
              },
              {
                "id": "m10h5d22-q2",
                "kind": "numeric",
                "prompt": "A card sends a 40-character text by radio. How many characters of the text arrive on the receiving card?",
                "answer": 32,
                "tolerance": 0,
                "unit": "characters",
                "explanation": "A text can be at most 32 characters; anything longer is cut off while being sent, without an error. 40 − 32 = 8 characters are lost.",
                "skills": [
                  "mk-radio-types"
                ]
              },
              {
                "id": "m10h5d22-q3",
                "kind": "predict-output",
                "prompt": "The receiving card's program is below. The sending card sends radio send [isik] = [90]. What happens on the receiving card?\n\n```\non radio received:\n    if received name = sicak then\n        show number received value\n    else\n        show text received text\n```",
                "options": [
                  "The then branch runs and 90 appears",
                  "The else branch runs, because the name is isik and not sicak",
                  "The program gives an error",
                  "Nothing happens"
                ],
                "answer": 1,
                "explanation": "The name of the message that arrived is isik, but the name being checked is sicak; they are not equal, so the else branch runs. Even if the message is a name = value message, the then branch is skipped if the name does not match. No error appears, and the answer \"nothing happens\" is wrong too: the else branch shows something.",
                "skills": [
                  "mk-radio-types",
                  "mk-conditions"
                ]
              },
              {
                "id": "m10h5d22-q4",
                "kind": "find-bug",
                "prompt": "The sender sends the temperature reading, but the receiving card always shows text on the screen (the then branch never runs). Find the mistake.\n\n```\nsender:    radio send [sıcak] = [temperature]\nreceiver:  if received name = sicak then ...\n```",
                "options": [
                  "The name is written differently on the two sides: `sıcak` and `hot` are not the same",
                  "The sending block was taken from the wrong category",
                  "The value must be a number, and temperature is not a number",
                  "The radio group is above 255"
                ],
                "answer": 0,
                "explanation": "The sender writes `sıcak` (with the letter `ı`), and the receiver writes `hot` (with the letter `i`). Names must be exactly the same, letter for letter; a difference of one letter breaks the equality. The groups and the value block are not the cause of the problem.",
                "skills": [
                  "mk-radio-types",
                  "prog-debug"
                ]
              },
              {
                "id": "m10h5d22-q5",
                "kind": "mcq",
                "prompt": "The sender sends radio send [sicaklik_olcum] = [25]. The receiving side compares \"received name = sicaklik_olcum\". What is the result?",
                "options": [
                  "Equal, because the name is the same",
                  "An error message is shown",
                  "Equal, but the value becomes 0",
                  "Not equal, because the name is cut off to 12 characters"
                ],
                "answer": 3,
                "explanation": "sicaklik_olcum is 14 characters, but the name limit is 12. While being sent, it is cut off to \"sicaklik_olc\". Because the cut-off name does not match the full name on the receiving side, the comparison comes out false, and no error message is given.",
                "skills": [
                  "mk-radio-types",
                  "prog-debug"
                ]
              }
            ]
          }
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
          ],
          "contentEn": {
            "title": "Secret message",
            "problem": "It is said that in ancient Rome, Julius Caesar shifted the letters in his secret letters: in place of each letter, he wrote the letter a few places further on in the alphabet. Someone who catches the message sees meaningless letters; but a friend who knows the shift number decodes the message easily. In this lesson you will do the same idea with numbers: before sending, a **key** will be added to the number, and the receiving card will take this key away.",
            "contentMd": "### Encryption and the key\n- **Plain message**: the real information you want to send (for example the digit 3).\n- **Key**: a secret number that both sides know (for example 7).\n- **Encrypted message**: plain message + key = 3 + 7 = 10. This 10 is what goes by radio.\n- **Decrypting**: the receiving side works out 10 − 7 = 3 and finds the real digit.\n\nThis is a very simple cipher, and in real life it is easily broken. But it is very good for learning the basic idea of encryption: **the information changes on the way, and whoever knows the right key turns it back into what it was.**\n\n### New blocks\n- In the **Math** category, the arithmetic block that adds and subtracts: it has two number boxes and a sign in the middle. Choose **+** or **−** for the sign from the list.\n- In the **Variables** category, the **change [gizli] by [1]** block.\n\n### Step by step\n**on start**, two buttons and **on radio received** are ready in the editor.\n\n1. In the **Variables** category, make two variables: **gizli** (\"secret\") and **anahtar** (\"key\").\n2. Inside **on start**, in this order: **set radio group to [1]**, **set gizli to [0]**, **set anahtar to [7]**.\n3. Put **change gizli by [1]** and **show number [gizli]** inside **on button [A] [pressed]**. (Plug the **gizli** variable in as the number to show.)\n4. Put **radio send number** inside **on button [B] [pressed]**. Plug the addition block in place of the number: **gizli** **+** **anahtar**.\n5. Put **show number** inside **on radio received**. Plug the subtraction block in place of the number: **received [number]** **−** **anahtar**.\n6. Press ▶ **Run**. On Card 1, press **A** three times (1, 2, 3 appear on the screen). Then press **B**.\n\n### Expected result\nCard 1 sends 10 by radio. In the Radio section, Card 2's **Last received:** box shows **10**. But on Card 2's screen, **3** appears: the key has been taken away and the real digit found. All four goals should have a ✓.\n\n### How does it work?\n- The number travelling on the way is 10. Someone who hears the message cannot know the 3; they would need to know the key (7).\n- Because the two cards run the same program, both of their keys are 7. So they share the same key.\n- Because the key is stored in a variable, you change it in only one place; both the encryption and the decryption follow automatically.\n\n### Try it\n1. From the Radio section, send **10** by hand to Card 2 as a **number** message. You see 3 on Card 2.\n2. Now send **5** by hand. What appears on Card 2's screen? (5 − 7 = −2.) This is like someone who does not know the key getting the wrong result.\n3. In **on start**, make the key 12 instead of 7. Did the decrypted digit change? Why did it not change?\n4. Think: if the key were random every time, how would the receiving card know it? Would it be safe to send the key by radio too?\n\n### Common mistakes\n- **Forgetting the key.** If you did not set the key variable in **on start** on the receiving card, the variable stays at zero; the decrypting does not work.\n- **Putting subtraction instead of addition** (or the other way round). If the sender adds, the receiver must subtract.\n- **Putting the number to show in the wrong place.** Inside **show number** there must be the subtraction block, not **received [number]** on its own.",
            "question": "If someone caught this cipher on the way, could they guess the 7? How many tries would it take them? What would you add to make a harder cipher?",
            "explainerMd": "### What you will learn in this lesson\n- The ideas of **encryption**, **key**, plain message and encrypted message\n- How to build a simple cipher with addition and subtraction\n- How a key stored in a variable keeps the two sides in step\n- Why this cipher is easily broken\n\n### What you should know first\n- Making a variable and changing its value (Lesson 7)\n- Sending and receiving numbers by radio (Lesson 21)\n\n### The information changes on the way\nEveryone in the same group can receive a radio message. If you do not want others to understand the information, you scramble it before sending it. This is called **encryption**. You have three things:\n\n- **Plain message:** the real information, for example the digit 3.\n- **Key:** a secret number that both sides know, for example 7.\n- **Encrypted message:** the number that travels on the way.\n\n### Encrypting by adding\nThe simplest method is to add the key:\n\n```\nencrypted = plain + key        3 + 7 = 10\nplain     = encrypted - key    10 - 7 = 3\n```\n\nThe sending side sends 10. Someone listening on the way sees 10, but cannot know that the real digit is 3. Because the receiving side knows the key, it takes away 7 and gets back to 3. Addition and subtraction are the opposite of each other; that is why the operation can be undone.\n\n### Why is the key in a variable?\nIf you write the key separately in both the sending and the receiving block, you might change one and forget the other. Instead, you write it once in a variable called **anahtar** (\"key\") (inside **on start**), and both operations use it. You change the value in one place; the two sides stay in step. Because the two cards run the same program, both cards have the same key too.\n\n### Wrong key, wrong result\nEven if someone who does not know the key receives 10 and does the same subtraction, they cannot find the right result. For example, if they have no key (the variable has stayed 0), they see 10 − 0 = 10. If they think the key is 5, they find 10 − 5 = 5. But the result is wrong, and there is no error message either. Forgetting to set the key in **on start** has the same effect.\n\n### Is this cipher strong?\nNo. If the key is a small number, the listener can easily find it by trying 1, 2, 3 ... Real ciphers use very large keys and very complicated operations. The aim here is not security but seeing the basic idea: the information changes on the way, and whoever knows the right key turns it back into what it was. Also, sending the key by radio ruins the idea, because the listener catches the key too.\n\n### Summary\nIn encryption, the plain message is scrambled with the key, and the encrypted message is sent. If you encrypted by adding, the receiving side decrypts by subtracting. If the key is kept in a variable, the two sides stay in step. A wrong or missing key quietly gives a wrong result. This cipher can be broken by trying small numbers.",
            "concepts": [
              {
                "term": "Encryption",
                "definition": "Scrambling information before sending it so that others do not understand it.",
                "example": "The digit 3 is turned into 10 with the key 7 and sent.",
                "pitfall": "Thinking encryption means real security; a simple addition cipher is easily broken."
              },
              {
                "term": "Key",
                "definition": "A secret number that both sides know; it is used for encrypting and decrypting.",
                "example": "If the key is 7, the sender does +7 and the receiver does −7.",
                "pitfall": "Forgetting to set the key on the receiving side: the variable stays 0 and the decrypting comes out wrong."
              },
              {
                "term": "Plain message and encrypted message",
                "definition": "The plain message is the real information; the encrypted message is the number travelling on the way, changed with the key.",
                "example": "If the plain message is 3 and the key is 7, the encrypted message is 10.",
                "pitfall": "Thinking the number shown in the Radio section is the real information; it is encrypted."
              },
              {
                "term": "Opposite operation",
                "definition": "The opposite of addition is subtraction; an operation that undoes another one.",
                "example": "The sender adds (3 + 7 = 10), the receiver subtracts (10 − 7 = 3).",
                "pitfall": "Using the same operation on both sides; if both add, the result comes out as 17."
              },
              {
                "term": "Key in a variable",
                "definition": "Keeping the key in a variable lets you change the value in one place.",
                "example": "In on start, set anahtar to 7; both sending and receiving use the key.",
                "pitfall": "Writing the key by hand in two places; you might change one and forget the other."
              }
            ],
            "quiz": [
              {
                "id": "m10h5d23-q1",
                "kind": "numeric",
                "prompt": "The plain message is 5 and the key is 12. The sender encrypts by adding. Which number goes by radio?",
                "answer": 17,
                "tolerance": 0,
                "explanation": "Encrypted message = plain message + key = 5 + 12 = 17. The receiving side finds the real digit with 17 − 12 = 5.",
                "skills": [
                  "mk-cipher",
                  "mk-variables"
                ]
              },
              {
                "id": "m10h5d23-q2",
                "kind": "numeric",
                "prompt": "The sender encrypted the digit 5 with the key 12 and sent 17. The receiving card wrongly thinks the key is 7. Which number does the receiving card show on the screen?",
                "answer": 10,
                "tolerance": 0,
                "explanation": "The receiving side works out 17 − 7 = 10. If the key were the correct 12, it would find 5. A wrong key does not give an error message; it quietly produces a wrong result.",
                "skills": [
                  "mk-cipher",
                  "prog-debug"
                ]
              },
              {
                "id": "m10h5d23-q3",
                "kind": "predict-output",
                "prompt": "Both cards run this program (group 1). On Card 1, A is pressed 4 times, then B once. What appears in the \"Last received\" box in the Radio section and on Card 2's screen?\n\n```\non start:\n    set radio group to 1\n    set gizli to 0\n    set anahtar to 7\n\non button A pressed:\n    change gizli by 1\n    show number gizli\n\non button B pressed:\n    radio send number (gizli + anahtar)\n\non radio received:\n    show number (received number − anahtar)\n```",
                "options": [
                  "Last received 4, screen 4",
                  "Last received 11, screen 11",
                  "Last received 4, screen 11",
                  "Last received 11, screen 4"
                ],
                "answer": 3,
                "explanation": "When A is pressed four times, gizli = 4. With B, 4 + 7 = 11 is sent; the box shows 11. Card 2's key is also 7, so it shows 11 − 7 = 4. So on the way there is 11, and on the screen there is 4.",
                "skills": [
                  "mk-cipher",
                  "mk-variables"
                ]
              },
              {
                "id": "m10h5d23-q4",
                "kind": "find-bug",
                "prompt": "The sender sends \"gizli + anahtar\". The receiving card wants to find the real digit, but the result always comes out too big (for example 17 instead of 3). Find the mistake.\n\n```\non radio received:\n    show number (received number + anahtar)\n```",
                "options": [
                  "The key was not set in on start",
                  "The receiving side adds instead of subtracting",
                  "The radio group is missing",
                  "A show text block is needed instead of show number"
                ],
                "answer": 1,
                "explanation": "Because the sender adds, the receiver must subtract. If the receiver adds too, 10 + 7 = 17 comes out. Setting the key in on start or the group block does not produce this result.",
                "skills": [
                  "mk-cipher",
                  "prog-debug"
                ]
              },
              {
                "id": "m10h5d23-q5",
                "kind": "mcq",
                "prompt": "Why is this addition cipher not a strong cipher?",
                "options": [
                  "Radio messages travel very slowly",
                  "The addition cannot be undone",
                  "Because the key is a small number, it can be found by trying",
                  "The receiving card cannot receive the message"
                ],
                "answer": 2,
                "explanation": "The key is a small number; someone listening on the way finds it quickly by trying 1, 2, 3 ... Addition is an operation that can be undone; that is the property the cipher needs in order to work, so it is not the problem. The speed of the radio has nothing to do with security either.",
                "skills": [
                  "mk-cipher"
                ]
              }
            ]
          }
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
          ],
          "contentEn": {
            "title": "Chatting with two cards",
            "problem": "When you send messages, you send emoji: a heart, a smiling face, a sad face. An emoji is really a small picture, but the phone sends it as a number, and the other side turns that number back into the picture. You can do the same trick between two Micro Cards. In this lesson the two cards will become a small chat app that sends heart and face icons to each other.",
            "contentMd": "### The idea\nLet's give each icon a number and send that number by radio:\n\n| Number | Icon | Which key sends it? |\n|---|---|---|\n| 1 | heart | A |\n| 2 | happy face | B |\n| 3 | sad face | A+B |\n\nWhen the receiving card sees the number, it shows the matching icon and plays a short sound. Because both cards run the same program, both directions work.\n\n### A new idea: reading into a variable\nThe **received [number]** block is read when a message arrives. If you are going to compare this number in more than one place, it is tidier to put it into a variable (**mesaj**, \"message\") first. That way you do not need to find the **received** block again and again for every comparison.\n\nTo check three possibilities, you will put **if ... then ... else** blocks inside each other: \"is the number 1? If not, is the number 2? If not (then it is 3)\".\n\n### Step by step\n**on start**, **on button [A] [pressed]**, **on button [B] [pressed]**, **on button [A+B] [pressed]** and **on radio received** are ready in the editor.\n\n1. Put **set radio group to [1]** inside **on start**.\n2. Put **radio send number [1]** inside **on button [A] [pressed]**, **radio send number [2]** inside **on button [B] [pressed]**, and **radio send number [3]** inside **on button [A+B] [pressed]**.\n3. In the **Variables** category, make a variable called **mesaj**.\n4. Inside **on radio received**, in this order:\n   - **set mesaj to [0]**. Plug **received [number]** in place of the zero.\n   - **if ... then ... else**. Condition: **mesaj** **=** **1**. **then**: **show icon [heart]**.\n   - Inside the **else** branch, put a second **if ... then ... else**. Condition: **mesaj** **=** **2**. **then**: **show icon [happy face]**. **else**: **show icon [sad face]**.\n   - **play melody [Birdsong]** from the **Music** category.\n5. Press ▶ **Run**. Press **A** on Card 1, then **B** on Card 2, then **A+B** on Card 1 again.\n\n### Expected result\nCard 1's **A** shows a heart on Card 2. Card 2's **B** shows a happy face on Card 1. Card 1's **A+B** shows a sad face on Card 2. After each message, Birdsong plays (about 1.25 seconds). All seven goals should have a ✓.\n\n### How does it work?\n- The sender cannot receive the message; the message only goes to the other card in the group.\n- The chain of **if** blocks inside each other checks in order. If the first one is true, the others are not checked at all.\n- The **play melody** block waits until it finishes. If another message arrives during that time, it joins a queue; for the same hat block, at most 3 messages wait in the queue.\n\n### Try it\n1. Add a fourth icon: the **on button [A] [long pressed]** hat block sends **4**, and the receiving card shows a **sun**. (You need to add one more branch to the **if** chain.)\n2. Instead of Birdsong, choose a different melody for each icon: the **Jingle** melody for the heart, the **Sad** melody for the sad face.\n3. So that you also see your own message on your screen, make the sending side **show** the icon too. Which hat block should you put it inside?\n\n### Common mistakes\n- **Putting the second if outside the else branch.** Then the happy face does not appear in the \"else\" branch.\n- **Always sending 1 instead of different numbers.** The receiving card cannot tell which key was pressed.\n- **Never reading the message.** If you do not put **received [number]** into the **mesaj** variable, the variable stays zero and the sad face always appears.",
            "question": "Isn't turning numbers into icons a kind of \"agreement\"? If the other side did not know your table, how would they understand the message? Where does this \"shared table\" idea turn up in real messaging apps?",
            "explainerMd": "### What you will learn in this lesson\n- How to set up a shared **table** (protocol) that turns numbers into icons\n- How to tell three or more options apart with a chain of **if** blocks inside each other\n- How to copy the message that arrives into a variable and use it in several places\n- How many messages the receive hat block puts in a queue\n\n### What you should know first\n- Sending and receiving numbers by radio (Lesson 21 and Lesson 22)\n- Variables (Lesson 7)\n- Playing a melody (Lesson 18)\n\n### Numbers are an agreement\nThe heart emoji you send on a phone is really a number; the other person's phone turns that number back into a heart. For this to work, both sides must know **the same table**. Our chat table:\n\n| Number | Icon | Key that sends it |\n|---|---|---|\n| 1 | heart | A |\n| 2 | happy face | B |\n| 3 | sad face | A+B |\n\nThis table is called a **protocol** (a communication agreement). If you change the table on one side and not on the other, the messages are misunderstood.\n\n### A chain of if blocks inside each other\nTo tell three options apart, the questions are asked in order:\n\n```\nif mesaj = 1 then\n    show heart\nelse\n    if mesaj = 2 then\n        show happy face\n    else\n        show sad face\n```\n\nIf the first condition is true, the remaining questions are not looked at at all. The second **if** must be inside the **else** branch of the first block; if you put it outside, it becomes a separate question and the order breaks. The last **else** branch means \"everything else\": here, all numbers other than 1 and 2 show a sad face.\n\n### Putting the message into a variable\nIf you are going to compare the same number in several places, you first put it into a variable called **mesaj** (\"message\"). At the start of the program you say \"set mesaj to the received number\", and then you use **mesaj** in the conditions. That way you do not have to find the **received** block again and again. If you forget to fill in the variable, its value stays 0; neither 1 nor 2 matches, and the last branch always runs.\n\n### Messages join a queue\nThe **play melody** block waits until the melody ends. Birdsong lasts 1.25 seconds. If a new message arrives during this time, the receive hat block is busy; the message joins a queue. For the same hat block, at most **3 messages** can wait in the queue, and any more are thrown away. This is why some messages get lost when you send messages quickly.\n\n### Summary\nThe chat app is based on a table of numbers; both sides must use the same table. Three options are told apart with a chain of **if** blocks inside each other, and the second **if** is in the first one's **else** branch. If the message that arrives is put into a variable, it can be used in many places. While a long receiving job is running, at most 3 new messages wait in the queue.",
            "concepts": [
              {
                "term": "Protocol (shared table)",
                "definition": "A table of rules that both sides agree on: which number means what.",
                "example": "The table 1 = heart, 2 = happy face, 3 = sad face.",
                "pitfall": "Changing the table on only one side; the other side misunderstands the message."
              },
              {
                "term": "Chain of if blocks inside each other",
                "definition": "if blocks that ask about three or more options in order; each one is in the else branch of the one before.",
                "example": "It asks: is the message 1, if not is it 2, if not (then it is 3).",
                "pitfall": "Putting the second if outside the else branch; the order breaks."
              },
              {
                "term": "Putting the message into a variable",
                "definition": "Copying the number that arrives into a variable and using it in many places.",
                "example": "set mesaj to received number; then the comparisons mesaj = 1, mesaj = 2.",
                "pitfall": "Not filling in the variable: its value stays 0 and the last branch always runs."
              },
              {
                "term": "Receive queue",
                "definition": "Messages that arrive while the receive hat block is busy join a queue; at most 3 messages wait.",
                "example": "While a 1.25-second melody is playing, the first 3 messages that arrive wait in the queue, and any more are lost.",
                "pitfall": "Thinking every message will be handled when sending messages very quickly."
              },
              {
                "term": "play melody block",
                "definition": "A block that waits until the melody ends; it keeps the hat block busy during this time.",
                "example": "Birdsong lasts 1250 ms at 120 beats per minute.",
                "pitfall": "Thinking the melody plays in the background and does not make the program wait."
              }
            ],
            "quiz": [
              {
                "id": "m10h5d24-q1",
                "kind": "predict-output",
                "prompt": "The receiving card's program is below. Card 1 sends 1 by radio. What appears on Card 2's screen?\n\n```\non radio received:\n    set mesaj to 0\n    if mesaj = 1 then\n        show icon heart\n    else\n        if mesaj = 2 then\n            show icon happy face\n        else\n            show icon sad face\n```",
                "options": [
                  "heart",
                  "happy face",
                  "sad face",
                  "Nothing"
                ],
                "answer": 2,
                "explanation": "A fixed 0 has been put into the mesaj variable instead of the received number. So mesaj is always 0; it is equal to neither 1 nor 2, and the last else branch runs and shows the sad face. The number that arrived was never copied into the variable.",
                "skills": [
                  "mk-conditions",
                  "mk-variables"
                ]
              },
              {
                "id": "m10h5d24-q2",
                "kind": "numeric",
                "prompt": "The receive hat block is busy playing a melody. Before the melody ends, 5 more messages arrive. For the same hat block, at most how many messages can wait in the queue?",
                "answer": 3,
                "tolerance": 0,
                "unit": "messages",
                "explanation": "The queue takes at most 3 messages; the first three messages join the queue, and the other two are thrown away.",
                "skills": [
                  "mk-message-flow"
                ]
              },
              {
                "id": "m10h5d24-q3",
                "kind": "mcq",
                "prompt": "Following the chat table, Card 1 expects a happy face when it sends 2, but in Card 2's program the branch for number 2 has a sad face. What happens on the receiving card to the message of the user who pressed B?",
                "options": [
                  "The radio message never arrives",
                  "The message arrives, but a different icon from the expected one is shown",
                  "The card gives an error message",
                  "Both cards show the same icon, and this is expected"
                ],
                "answer": 1,
                "explanation": "The two sides are not using the same table. The sender thinks 2 is a happy face, and the receiver shows a sad face; the meaning of the message is broken not on the way but by the difference between the two tables. The radio has not been cut off; the message arrived correctly.",
                "skills": [
                  "mk-protocol"
                ]
              },
              {
                "id": "m10h5d24-q4",
                "kind": "find-bug",
                "prompt": "Whichever button is pressed, Card 2 always shows a heart. The receiving card's if chain is correct. Find the mistake.\n\n```\non button A pressed:    radio send number 1\non button B pressed:    radio send number 1\non button A+B pressed:  radio send number 1\n```",
                "options": [
                  "B and A+B also send 1; they should be 2 and 3 from the table",
                  "The A+B block is inside the wrong hat block",
                  "The if chain on the receiving side is too short",
                  "The radio group should be 255"
                ],
                "answer": 0,
                "explanation": "All three buttons send 1. According to the table, 2 should have been sent for B and 3 for A+B. The receiving side can only tell which key was pressed from the number. There is no mistake in the if chain, the group or the hat blocks.",
                "skills": [
                  "mk-protocol",
                  "prog-debug"
                ]
              },
              {
                "id": "m10h5d24-q5",
                "kind": "numeric",
                "prompt": "The Birdsong melody lasts 1.25 seconds. If the receiving card handles 3 messages one after another and plays the melody for each one, how many seconds does it play in total?",
                "answer": 3.75,
                "tolerance": 0.01,
                "unit": "seconds",
                "explanation": "The melody block waits until it ends, and the messages are handled in turn: 3 × 1.25 = 3.75 seconds.",
                "skills": [
                  "mk-message-flow"
                ]
              }
            ]
          }
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
          ],
          "contentEn": {
            "title": "Project: Remote control",
            "problem": "As you tilt the remote control of a toy car, the car changes direction. The remote and the car are really two separate devices, and the only link between them is a radio message: \"go left\", \"go right\". In this project Card 1 will be the remote, and Card 2 will be the car. When you tilt the remote, the car will show an arrow in that direction and turn its steering servo.",
            "contentMd": "### Project: Remote control\nYou will put together all of this week's ideas: radio group, sending numbers, receiving, reading into a variable and a chain of **if** blocks inside each other. On top of that, detecting tilt with the accelerometer and a servo output are added.\n\n**Goals:**\n- When you tilt Card 1 left, right, forward and back, the commands 1, 2, 3 and 4 are sent.\n- When Card 2 receives a command, it shows the matching direction arrow.\n- When you tilt left, the servo turns to 45 degrees; when you tilt right, it turns to 135 degrees.\n- Button A sends the \"stop\" command (0), and Card 2 shows the \"no\" icon.\n\n### Command table\n| Command number | Remote movement | Car screen | Servo (P0) |\n|---|---|---|---|\n| 1 | tilt left | left arrow | 45° |\n| 2 | tilt right | right arrow | 135° |\n| 3 | tilt forward | up arrow | 90° |\n| 4 | tilt back | down arrow | 90° |\n| 0 | button A | \"no\" icon | 90° |\n\n### New blocks\n- The **when card is [tilted left]** hat block in the **Input** category runs when the card is tilted. From the list you can choose **tilted right**, **tilted forward** and **tilted back**.\n- The **show arrow [↑ north]** block in the **LED** category draws an arrow in one of eight directions. We will use **← west** (left), **→ east** (right), **↑ north** (up) and **↓ south** (down).\n- The **servo [P0] to angle [90]** block in the **Pins** category turns the virtual servo connected to pin P0 to an angle between 0 and 180 degrees. You can see the servo turn in the **Pins** section next to the card.\n\n### Step by step\n**on start**, four **when card is [tilted left]** hat blocks, **on button [A] [pressed]** and **on radio received** are ready in the editor.\n\n**The remote side**\n1. Put **set radio group to [1]** inside **on start**.\n2. Put **radio send number [1]** inside **when card is [tilted left]**; **2** inside **when card is [tilted right]**; **3** inside **when card is [tilted forward]**; and **4** inside **when card is [tilted back]**.\n3. Put **radio send number [0]** inside **on button [A] [pressed]**.\n\n**The car side**\n4. In the **Variables** category, make the variable **komut** (\"command\").\n5. Put **set komut to [0]** inside **on radio received**; plug **received [number]** in place of the zero.\n6. Underneath, build an **if ... then ... else** chain:\n   - if **komut = 1**: **show arrow [← west]** and **servo [P0] to angle [45]**.\n   - else if **komut = 2**: **show arrow [→ east]** and **servo [P0] to angle [135]**.\n   - else if **komut = 3**: **show arrow [↑ north]** and **servo [P0] to angle [90]**.\n   - else if **komut = 4**: **show arrow [↓ south]** and **servo [P0] to angle [90]**.\n   - else (that is, 0): **show icon [no]** and **servo [P0] to angle [90]**.\n\n**Testing**\n7. Press ▶ **Run**. Choose the **Card 1** tab in the right panel. In the **Motion (accelerometer)** section, press the **Tilt left**, **Tilt right**, **Tilt forward** and **Tilt back** buttons in turn. Then press Card 1's **A** button.\n8. Switch to the **Card 2** tab, open the **Pins** section and look at the servo's angle.\n\n### Expected result\nEvery time you tilt Card 1, the arrow for that direction appears on Card 2's screen. When you tilt left and right, Card 2's **P0** servo turns to 45° and 135°. When you press **A**, Card 2 shows the \"no\" icon and the servo comes to the middle (90°). All nine goals should have a ✓.\n\n### How does it work?\n- When the card tilts, the accelerometer detects a new position and the **when card is [tilted left]** hat block runs. The event only happens when the position **changes**. If you tilt in the same direction twice in a row, the command is not sent the second time; first straighten it with **Face up**.\n- Because Card 2 runs the same program too, if you tilt Card 2, Card 1 behaves like a car as well. The two cards control each other.\n- The command numbers are the agreement in the table. The sending and receiving sides use the same table; if you change the table, change both together.\n- In the virtual portal there is no real motor or servo; the virtual servo display in the **Pins** section shows the angle.\n\n### Try it\n1. Make \"stop\" go in the **Face up** position too: put **radio send number [0]** inside the **when card is [face up]** hat block.\n2. Make a short beep play when a command is received: add the **play note [C] for [1/8] beat** block inside **on radio received**.\n3. Send the remote's tilt angle too: send the **tilt (side) degrees** block from the **Input** category with **radio send [aci] = [...]** (`angle` means \"angle\"), and set the servo's angle on the receiving card from it.\n\n### Common mistakes\n- **Mixing up the remote's and the car's tables.** If the sender sends 1 but the receiver thinks 1 is the right arrow, you see the wrong direction.\n- **Thinking that tilting in the same direction again is a command.** No new event is produced unless the position changes.\n- **Leaving a hat block empty.** If a **when card is [tilted left]** hat block is empty, that direction sends no message.\n- **Trying to turn the servo beyond 180.** The servo angle is pulled into the 0-180 range.",
            "question": "Only one thing flows between the remote and the car: numbers. This is a very simple method. Where would this method fall short in a real vehicle? If a message is lost or arrives wrong, what should the vehicle do?",
            "explainerMd": "### What you will learn in this lesson\n- How to plan a system that connects a remote and a vehicle by radio\n- How to turn the card's tilt (an accelerometer event) into a command\n- How to show an arrow and set the servo angle depending on the command that arrives\n- How to put all of the week's ideas together in one project\n\n### What you should know first\n- Radio group, sending and receiving numbers (Lesson 21)\n- The command table and the chain of **if** blocks inside each other (Lesson 24)\n- The tilt and shake events of the card (Lesson 11)\n- Showing an icon on the screen (Lesson 3); you will see showing an arrow and the servo for the first time in this lesson\n\n### Two parts, one message\nA remote-controlled vehicle has two parts: the **remote** says what to do, and the **vehicle** does it. Only radio messages flow between them. Both Micro Cards run the same program, but one plays the role of the remote and the other the role of the vehicle. The \"send\" half of the program is useful on the remote, and the \"receive\" half on the vehicle.\n\n### The table first\nWriting the commands in a table before writing the code lowers the chance of making mistakes:\n\n| Command | Remote movement | Vehicle screen | Servo |\n|---|---|---|---|\n| 1 | tilt left | left arrow | 45° |\n| 2 | tilt right | right arrow | 135° |\n| 3 | tilt forward | up arrow | 90° |\n| 4 | tilt back | down arrow | 90° |\n| 0 | button A | \"no\" icon | 90° |\n\n90° is the middle of the servo. 45° turns 45 degrees to one side, and 135° turns 45 degrees to the other side; the difference between the two ends is 90 degrees. The servo angle is between 0 and 180; anything outside this range is clipped.\n\n### Tilting is an event\nThe **when card is [tilted left]** hat block runs once when the card is tilted. The event only happens when the position **changes**. If the card is already tilted left and you try to tilt it left again, no new event happens. If you leave the hat block empty, that direction never sends a message.\n\n### The vehicle side\nThe vehicle puts the number that arrives into the **komut** (\"command\") variable and asks in order: is it 1, 2, 3, 4, and if none of these, 0, that is \"stop\". In every branch it both shows an arrow and turns the servo. Because the last **else** branch is \"everything else\", it catches 0; if a number it does not know arrives (for example 9), it also behaves like \"stop\". This is a useful safety feature: on an unknown command, the vehicle stops.\n\n### A link to real life\nHere, if a message is lost or arrives wrong, the vehicle quietly stays in its old state. In real vehicles, safety measures are added, such as the vehicle stopping when the signal from the remote is cut off. Adding a \"stops whatever happens\" rule to your own project is a good habit too.\n\n### Summary\nThe remote and the vehicle agree through the command table. The remote turns the card's tilt into a number and sends it by radio; the vehicle puts the number into a variable, shows an arrow with the **if** chain and turns the servo. The tilt event happens when the position changes. The table must be the same on both sides, and the last branch should stop the vehicle on an unknown command.",
            "concepts": [
              {
                "term": "Remote and vehicle",
                "definition": "The remote sends commands and the vehicle carries them out; only radio messages flow between them.",
                "example": "When you tilt Card 1, Card 2 shows an arrow and the servo turns.",
                "pitfall": "Mixing up the remote's and the vehicle's tables; the sender sends 1, and the receiver understands 1 as something else."
              },
              {
                "term": "Command table",
                "definition": "A plan that writes down which movement, screen and servo angle each command number matches.",
                "example": "1 = left arrow and servo 45°, 2 = right arrow and servo 135°.",
                "pitfall": "Writing the code without a table; the two sides are written with different agreements."
              },
              {
                "term": "Position event",
                "definition": "When the card is tilted, the accelerometer detects a new position and the hat block runs. The event happens when the position changes.",
                "example": "radio send number 1 inside the when card is [tilted left] hat block.",
                "pitfall": "Thinking that tilting in the same direction again is a new command; no event happens unless the position changes."
              },
              {
                "term": "Servo angle",
                "definition": "The position of the servo on pin P0, between 0 and 180 degrees. 90 is the middle.",
                "example": "45° turns 45 degrees to one side, and 135° 45 degrees to the other.",
                "pitfall": "Giving an angle beyond 180; the angle is pulled into the 0-180 range."
              },
              {
                "term": "Safe last branch",
                "definition": "The last else branch of the if chain stops the vehicle even on an unknown command.",
                "example": "If command 9 arrives, the vehicle shows the \"no\" icon and the servo goes to 90°.",
                "pitfall": "Leaving the last branch empty; on an unknown command the vehicle stays in its previous state."
              }
            ],
            "quiz": [
              {
                "id": "m10h5d25-q1",
                "kind": "numeric",
                "prompt": "According to the command table, the servo goes to 45° when you tilt left and to 135° when you tilt right. How many degrees does the servo turn from one end to the other?",
                "answer": 90,
                "tolerance": 0,
                "unit": "degrees",
                "explanation": "135 − 45 = 90 degrees. Because the middle point is 90°, both sides are 45° away from the middle.",
                "skills": [
                  "mk-servo-tilt"
                ]
              },
              {
                "id": "m10h5d25-q2",
                "kind": "predict-output",
                "prompt": "The vehicle side's program is below. Command 9 arrives from the remote (it was sent by hand). What does the vehicle do?\n\n```\non radio received:\n    set komut to received number\n    if komut = 1 then: left arrow, servo 45\n    else if komut = 2 then: right arrow, servo 135\n    else if komut = 3 then: up arrow, servo 90\n    else if komut = 4 then: down arrow, servo 90\n    else: \"no\" icon, servo 90\n```",
                "options": [
                  "It shows the down arrow, servo 90",
                  "It gives an error and the program stops",
                  "It shows the \"no\" icon, servo 90",
                  "It does nothing, and the previous arrow stays"
                ],
                "answer": 2,
                "explanation": "9 does not match any condition, so the last else branch runs: the \"no\" icon and servo 90°. Stopping the vehicle on an unknown command is the behaviour we want. No error message appears.",
                "skills": [
                  "mk-protocol",
                  "mk-conditions"
                ]
              },
              {
                "id": "m10h5d25-q3",
                "kind": "find-bug",
                "prompt": "When the remote is tilted right, the vehicle shows the left arrow. The vehicle side matches the table. Find the mistake.\n\n```\nwhen card is tilted left:   radio send number 1\nwhen card is tilted right:  radio send number 1\n```",
                "options": [
                  "The order of the chain on the vehicle side is wrong",
                  "The tilted right hat block sends 1 instead of 2",
                  "The servo angle goes beyond 180",
                  "The radio groups are different"
                ],
                "answer": 1,
                "explanation": "For tilted right, the command in the table is 2. Because 1 is sent here, the vehicle shows the left arrow. The chain on the receiving side is correct, so the mistake is on the sending side, in the wrong number.",
                "skills": [
                  "mk-protocol",
                  "prog-debug"
                ]
              },
              {
                "id": "m10h5d25-q4",
                "kind": "mcq",
                "prompt": "The remote card is already tilted left. A student tries to tilt the card left again. What happens?",
                "options": [
                  "No new event happens, and no command is sent",
                  "The command is sent again",
                  "The servo goes to 0°",
                  "The vehicle stops"
                ],
                "answer": 0,
                "explanation": "The event happens when the position changes. Because the position is already \"tilted left\", no new event happens and no new command goes out. You first need to bring the card to another position, such as \"face up\".",
                "skills": [
                  "mk-servo-tilt",
                  "prog-debug"
                ]
              },
              {
                "id": "m10h5d25-q5",
                "kind": "mcq",
                "prompt": "When you start the remote control project, which is the best first step?",
                "options": [
                  "Turning the servo to random angles",
                  "Writing the first block that works and thinking about the numbers later",
                  "Writing only the remote side and designing the vehicle later",
                  "Making a command table that writes down what each command triggers"
                ],
                "answer": 3,
                "explanation": "You write the command table first, because the remote and the vehicle must share the same agreement. Without a table, the sending and receiving sides might use different numbers. Connecting the servo or trying random numbers comes later.",
                "skills": [
                  "prog-planning",
                  "mk-protocol"
                ]
              }
            ]
          }
        }
      ]
    },
    {
      "title": "Projeler",
      "project": "Ders sonu final projesi",
      "guideMd": "### Hafta hedefleri\nBu haftanın sonunda öğrenci:\n1. 10 saniyelik ölçüm ve çarpma ile dakikadaki atışı hesaplayabilir; bir bayrak değişkeni ile sayma zamanını yönetebilir.\n2. **kart sallandığında** başlığıyla olay sayabilir; eşitlik ile büyük-eşit koşulunun farkını ve kalan (mod) işlemini açıklayabilir.\n3. Alarm gibi bir cihazı durumlar ve geçişler olarak tarif edip değişkenlerle kurabilir.\n4. Sensör değerini (0-1023) **eşle** ile yüzdeye çevirebilir; eşik, çubuk grafik ve konsol kullanabilir.\n5. İki kartı radyoyla konuşturan bir projeyi önce plan olarak yazıp sonra kurabilir.\n\n### Haftanın planı\nHafta beş derstir; her ders yaklaşık 25-40 dakikadır. Aşağıdaki plan günde bir ders içindir.\n\n| Gün | Ders | Süre | Ne yapılır |\n|---|---|---|---|\n| 1 | Nabız ölçer | ~28 dk | Anlatımı oku, B ile 10 saniyelik ölçümü başlat, 12 kez A'ya bas, 72'yi gör, mini testi çöz. |\n| 2 | Adımsayar | ~25 dk | Kartı sal, A ile adımı oku, 10. adımda kutlamayı gör, \"= ya da >=\" farkını dene. |\n| 3 | Alarm | ~28 dk | Üç durumu kur, kurulu ve alarm değişkenlerini izle, A+B uzun basışla kapat. |\n| 4 | Nem ve sıcaklık istasyonu | ~30 dk | P1 kaydırıcısıyla nemi yüzdeye çevir, çubuk grafiği ve konsolu dene, eşiği değiştir. |\n| 5 | Proje: Akıllı saksı (final) | ~40 dk | Planı çiz, iki kartı kur, radyoyla nemi karşılıklı izlet, kendini değerlendir. |\n\n### Ön koşul kontrolü\nBu hafta önceki haftaların parçalarını birleştirir. Başlamadan önce kontrol et:\n- Değişken oluşturup değer yapabiliyor ve değerine ekleyebiliyor mu? (7. ders)\n- **eğer ... ise** ve karşılaştırma bloklarını kullanabiliyor mu? (8. ders)\n- Düğme başlıklarını ve uzun basışı biliyor mu? (6. ve 9. dersler)\n- **kart sallandığında** başlığını ve **çubuk grafik** bloğunu biliyor mu? (11. ve 12. dersler)\n- **ezgiyi çal** bloğunu ve radyo gönder/al bloklarını biliyor mu? (18., 21. ve 22. dersler)\n- Yüzde ve oran fikrine alışık mı? (50 / 100 gibi)\n\n### Kavram haritası\n- **Sayma ve ölçüm:** bayrak değişkeni → bekle bloğu → sayac x 6\n- **Olay ve koşul:** kart sallandığında → adim = 10 / adim >= 10 → kalan işlemi\n- **Durum:** kapalı → kurulu → çalıyor → kapat; kurulu ve alarm değişkenleri\n- **Sensör:** analog oku (0-1023) → eşle (0-100) → eşik → çubuk grafik ve konsol\n- **Proje:** plan → her 2000 ms'de gönder → mesaj gelince alınan değerle tepki ver\n\n### Sık yapılan hatalar\n- **Bayrağı yanlış yerde açmak.** olcum değerini bekle bloğundan sonra 1 yaparsan bekleme boyunca hiç sayılmaz.\n- **Sayacı sıfırlamamak.** İkinci ölçüm ilkinin üstüne eklenir (126 gibi).\n- **Çarpanı unutmak ya da yanlış seçmek.** süre x çarpan = 60 olmalı.\n- **Sayma bloğunu eğer'in içine koymak.** Değişken artmaz, koşul hiç doğru olmaz.\n- **Eşit yerine büyük-eşit kullanmak.** Kutlama 10. adımdan sonra her adımda tekrarlanır.\n- **Alarmı yarım kapatmak.** Yalnız sesi durdurmak; alarm değişkeni 1 kalır ve ezgi yeniden başlar.\n- **eşle bloğunda aralıkları ters yazmak.** 512 değeri 50 yerine 5238 olur.\n- **Eşik işaretini ters koymak.** nem > 30 yazarsan ıslakken uyarır.\n- **Alan kartta kendi sensörünü okumak.** Gelen mesajdaki alınan değer kullanılmalı.\n- **Mesaj adını farklı yazmak.** \"nem\" ile \"Nem\" eşit sayılmaz.\n- **Çubuk grafikte en çok değeri yanlış bırakmak.** Nem yüzde ise 100 olmalı.\n\n### Hafta sonu tekrarı\n1. Her dersin kavram kartlarına bir kez daha bak ve \"sık yapılan yanlış\" satırlarını yüksek sesle oku.\n2. Mini testlerde yanlış yaptığın soruların açıklamalarını yeniden oku, sonra soruyu yeniden çöz.\n3. Nabız ölçeri bakmadan yeniden kur. Sonra ölçüm süresini 15 saniye yapıp çarpanı değiştir ve aynı sonucu bul.\n4. Alarm için durum tablosunu kâğıda çiz: üç durum, hangi olay hangi durumu değiştirir.\n5. P1 kaydırıcısını 0, 100, 300, 512 ve 1023 yap; her birinin yüzde karşılığını tahmin et, sonra konsolda karşılaştır.\n6. Kendi cümlelerinle şu soruyu cevapla: \"bekle bloğu neden öteki düğmeleri durdurmaz?\"\n\nHafta sonu testi olarak beş dersin mini testleri yeterlidir; her derste 5 soru, toplam 25 soru. Hedef: her dersten en az 4 doğru. Eksik kalan dersin anlatımına dön.\n\n### Proje değerlendirme ölçütü (Akıllı saksı)\n| Ölçüt | Gelişmeli | Yeterli | İleri |\n|---|---|---|---|\n| Plan | Plan yok | Dört başlığın ne zaman çalıştığı yazılmış | Plan kodla birebir uyuyor ve eşiğin neden seçildiği açıklanmış |\n| Ölçüm | Nem ham sayı olarak gösteriliyor | P1 değeri eşle ile 0-100'e çevrilmiş | Eşik bir değişkende tutuluyor, kolayca değiştirilebiliyor |\n| Radyo | Kartlar birbirini görmüyor | İki kart aynı grupta, nem mesajı gidiyor ve alan kart alınan değeri kullanıyor | Mesaj adı ve grup kontrol edilmiş, ek bir mesaj (sıcaklık gibi) eklenmiş |\n| Tepki | Uyarı yok ya da hep çalıyor | Nem 30'un altında üzgün yüz ve ezgi, değilse çubuk grafik | Çubuk grafik doğru ölçekli, ezgi sürerken gelen mesajlar anlatılabiliyor |\n| Anlatım | Ne yaptığını anlatamıyor | Programı üç cümleyle anlatıyor | Hata yapıp nasıl bulduğunu ve ders parçalarını nerede kullandığını anlatıyor |\n\n### Veli ve öğretmen notu\n- **Amaç.** Hafta ezber değil, öğrencinin önceki haftaları birleştirerek küçük bir \"ürün\" kurmasıdır. Her derste bir cihaz (nabız ölçer, adımsayar, alarm, istasyon) çıkar.\n- **Nasıl destek olunur?** Takıldığında cevabı söyleme; şu soruları sor: \"Hangi olay bu başlığı çalıştırıyor?\", \"O anda değişkenlerin değeri ne?\", \"Bu bloğu eğer'in içine mi dışına mı koydun?\", \"Hangi karttan okuyorsun, gelen mesajdan mı kendi pininden mi?\"\n- **Sağlık notu.** Nabız ölçer bir eğitim aracıdır, tıbbi ölçüm değildir. Gerçek bir sağlık kaygısı için bir yetişkine ya da doktora danışılmalıdır.\n- **Süre.** Dersleri aynı gün peş peşe yapmak yerine aralıklı çalışmak kalıcılığı artırır. Final projesini farklı bir günde yapmak iyi olur.\n- **Güvenlik.** Bu platformdaki her şey sanaldır; gerçek bir sensör, pil ya da radyo kullanılmaz.\n- **İlerleme.** Dersin sonundaki mini test sonuçları \"İlerlemem\" sayfasında beceri bazında görünür (taslak/pilot özellik; yalnız onay verildiyse kaydedilir).",
      "guideMdEn": "### Week goals\nBy the end of this week, the learner:\n1. Can work out beats per minute with a 10-second measurement and a multiplication; can manage the counting time with a flag variable.\n2. Can count events with the **when card is shaken** hat block; can explain the difference between the equal and greater-than-or-equal conditions, and the remainder (mod) operation.\n3. Can describe a device such as an alarm as states and moves between them, and build it with variables.\n4. Can turn a sensor value (0-1023) into a percentage with **map**; can use a threshold, a bar graph and the console.\n5. Can write a project in which two cards talk by radio as a plan first, and then build it.\n\n### Plan for the week\nThe week has five lessons; each lesson takes about 25-40 minutes. The plan below is for one lesson a day.\n\n| Day | Lesson | Time | What to do |\n|---|---|---|---|\n| 1 | Pulse meter | ~28 min | Read the explainer, start the 10-second measurement with B, press A 12 times, see 72, do the mini quiz. |\n| 2 | Step counter | ~25 min | Shake the card, read the steps with A, see the celebration on the 10th step, try the \"= or >=\" difference. |\n| 3 | Alarm | ~28 min | Set up the three states, watch the kurulu and alarm variables, turn it off with an A+B long press. |\n| 4 | Humidity and temperature station | ~30 min | Turn the moisture into a percentage with the P1 slider, try the bar graph and the console, change the threshold. |\n| 5 | Project: Smart plant pot (final) | ~40 min | Draw the plan, set up the two cards, have them watch each other's moisture by radio, assess yourself. |\n\n### Prerequisite check\nThis week puts together parts from the earlier weeks. Before you start, check:\n- Can they make a variable, set a value and change the value by an amount? (Lesson 7)\n- Can they use the **if ... then** and comparison blocks? (Lesson 8)\n- Do they know the button hat blocks and the long press? (Lessons 6 and 9)\n- Do they know the **when card is shaken** hat block and the **bar graph** block? (Lessons 11 and 12)\n- Do they know the **play melody** block and the radio send/receive blocks? (Lessons 18, 21 and 22)\n- Are they used to the idea of percentage and proportion? (such as 50 / 100)\n\n### Concept map\n- **Counting and measuring:** flag variable → pause block → sayac x 6\n- **Event and condition:** when card is shaken → adim = 10 / adim >= 10 → remainder operation\n- **State:** off → set → ringing → turn off; the kurulu and alarm variables\n- **Sensor:** analog read (0-1023) → map (0-100) → threshold → bar graph and console\n- **Project:** plan → send every 2000 ms → when a message arrives, react with the received value\n\n### Common mistakes\n- **Turning the flag on in the wrong place.** If you set olcum to 1 after the pause block, nothing is counted during the wait.\n- **Not resetting the counter.** The second measurement is added on top of the first (such as 126).\n- **Forgetting the multiplier or choosing the wrong one.** time x multiplier must be 60.\n- **Putting the counting block inside the if.** The variable does not go up, and the condition is never true.\n- **Using greater-than-or-equal instead of equal.** The celebration repeats on every step after the 10th.\n- **Only half turning off the alarm.** Only stopping the sound; the alarm variable stays 1 and the melody starts again.\n- **Writing the ranges in the map block the wrong way round.** The value 512 becomes 5238 instead of 50.\n- **Putting the threshold sign the wrong way round.** If you write nem > 30, it warns you when it is wet.\n- **Reading its own sensor on the receiving card.** The received value in the message that arrives should be used.\n- **Writing the message name differently.** \"nem\" and \"Nem\" do not count as equal.\n- **Leaving the wrong largest value in the bar graph.** If the moisture is a percentage, it must be 100.\n\n### End-of-week review\n1. Look at each lesson's concept cards once more and read the \"common mistake\" lines out loud.\n2. Read again the explanations of the questions you got wrong in the mini quizzes, then answer the question again.\n3. Build the pulse meter again without looking. Then make the measurement time 15 seconds, change the multiplier and find the same result.\n4. Draw the state table for the alarm on paper: three states, and which event changes which state.\n5. Set the P1 slider to 0, 100, 300, 512 and 1023; guess the percentage for each one, then compare in the console.\n6. Answer this question in your own words: \"Why does the pause block not stop the other buttons?\"\n\nAs an end-of-week test, the mini quizzes of the five lessons are enough; 5 questions in each lesson, 25 questions in total. Target: at least 4 correct in each lesson. Go back to the explainer of any lesson that falls short.\n\n### Project assessment rubric (Smart plant pot)\n| Criterion | Developing | Secure | Advanced |\n|---|---|---|---|\n| Plan | No plan | When the four hat blocks run is written down | The plan matches the code exactly, and why the threshold was chosen is explained |\n| Measuring | The moisture is shown as a raw number | The P1 value has been turned into 0-100 with map | The threshold is kept in a variable and can be changed easily |\n| Radio | The cards do not see each other | The two cards are in the same group, the moisture message goes out and the receiving card uses the received value | The message name and the group have been checked, and an extra message (such as temperature) has been added |\n| Reaction | There is no warning, or it rings all the time | Below 30 moisture, a sad face and the melody; otherwise a bar graph | The bar graph is correctly scaled, and they can explain what happens to messages that arrive while the melody plays |\n| Explanation | Cannot explain what they did | Explains the program in three sentences | Explains a mistake they made and how they found it, and where they used the parts from the lessons |\n\n### Note for parents and teachers\n- **Aim.** The week is not about memorising, but about the learner building a small \"product\" by putting the earlier weeks together. Each lesson produces a device (pulse meter, step counter, alarm, station).\n- **How to help.** When they get stuck, do not give the answer; ask these questions: \"Which event runs this hat block?\", \"What are the values of the variables at that moment?\", \"Did you put this block inside or outside the if?\", \"Which card are you reading from: the message that arrived or its own pin?\"\n- **Health note.** The pulse meter is a learning tool, not a medical measurement. For a real health concern, ask an adult or a doctor.\n- **Time.** Spacing the lessons out, rather than doing them one after another on the same day, helps the learning stick. It is a good idea to do the final project on a different day.\n- **Safety.** Everything on this platform is virtual; no real sensor, battery or radio is used.\n- **Progress.** The mini quiz results at the end of each lesson appear by skill on the \"My progress\" page (a draft/pilot feature; saved only if consent has been given).",
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
          ],
          "contentEn": {
            "title": "Pulse meter",
            "problem": "A doctor holds your wrist, looks at a watch and counts your heartbeats. Why do they not count for a whole minute? Because counting for a short time and doing a multiplication gives the same result much faster. In this lesson you will make your own virtual pulse meter. You will press A on every beat of your heart, and the card will count and tell you the result.",
            "contentMd": "### The idea\nThe card has no real pulse sensor. The portal is completely virtual, and you enter the measurement yourself: you count your own pulse or a rhythm and press **A** on every beat. The card counts these presses for 10 seconds and multiplies at the end.\n\n**Beats per minute = beats counted in 10 seconds × 6**\n\n| Beats in 10 seconds | Beats per minute |\n|---|---|\n| 10 | 60 |\n| 12 | 72 |\n| 15 | 90 |\n\nThis is a learning tool, not a medical measurement.\n\n### A new idea: other work while waiting\nThe **pause [10000] ms** block waits for 10 seconds inside a hat block. But the card's other hat blocks keep running during this time. So while **B** is waiting for 10 seconds, the **A** button still works. The card runs different hat blocks together.\n\n### Step by step\n**on start**, **on button [A] [pressed]** and **on button [B] [pressed]** are ready in the editor.\n\n1. In the **Variables** category, make two variables: **sayac** (\"counter\": how many beats) and **olcum** (\"measuring\": is a measurement running? 1 = yes, 0 = no).\n2. Put **set sayac to [0]** and **set olcum to [0]** inside **on start**.\n3. Put **if ... then** inside **on button [A] [pressed]**. Condition: **olcum** **=** **1**. Inside it, in this order:\n   - **change sayac by [1]**\n   - **show icon [heart]**\n   - **pause [100] ms**\n   - **clear screen**\n4. Inside **on button [B] [pressed]**, in this order:\n   - **set sayac to [0]**\n   - **set olcum to [1]**\n   - **show icon [small heart]**\n   - **pause [10000] ms**\n   - **set olcum to [0]**\n   - **sayac** **×** **6** (the multiplication block) inside **show number**.\n5. Press ▶ **Run**. Press **B** and the measurement starts. Within 10 seconds, press **A** twelve times (about once a second). Look at the result.\n\n### Expected result\nAfter **B**, a small heart stays on the screen. On every press of **A**, a big heart flashes for a moment. After 10 seconds, **72** scrolls across the screen. All four goals should have a ✓. If you do not hit exactly 12 beats, your result is a multiple of 6 (60, 66, 72, 78...).\n\n### How does it work?\n- **olcum** is a flag. While it is 1, **A** counts; while it is 0, **A** does nothing. This way, presses outside a measurement are not counted by mistake.\n- **sayac** is reset at the start of every measurement.\n- **pause [10000] ms** waits for 10 seconds. During this time **A** works, because **A** is a separate hat block.\n- When the 10 seconds are over, the flag is turned off and the result is shown.\n\n### Try it\n1. Make the measurement time 15 seconds (**pause [15000] ms**) and make the multiplier 4. The result should come out about the same.\n2. Show an icon on the screen depending on the result: below 60 a **sleeping face**, above 100 a **surprised face**, in between a **happy face**. (Put **if ... then ... else** blocks inside each other.)\n3. Play a short beep when the measurement starts and a different beep when it ends.\n\n### Common mistakes\n- **Forgetting to set olcum to 1.** **A** never counts.\n- **Writing 10 instead of 10000.** **pause** works in milliseconds. 10 ms is not noticeable at all.\n- **Not resetting sayac.** In the second measurement, the number is added on top of the previous measurement.\n- **Forgetting the multiplier.** Only the number of beats stays on the screen, not \"beats per minute\".",
            "question": "When you run fast, your pulse goes up. If you measured before running and after running, what difference would you see? If you measured for 5 seconds instead of 10, how reliable would the result be?",
            "explainerMd": "### What you will learn in this lesson\n- The logic of counting an event for a set time and scaling the result up with a multiplication\n- How to answer the question \"is it time to count now?\" with a **flag** (a variable that holds 0 or 1)\n- That when the **pause** block makes one hat block wait, the other hat blocks keep running\n- Why you need to reset the counter before every measurement\n\n### What you should know first\n- Lesson 6: the A, B and A+B button hat blocks\n- Lesson 7: making a variable, setting a value, changing a value\n- Lesson 8: the **if ... then** block and comparisons\n\n### Count for a short time, then multiply\nThe heart beats about 60 to 100 times a minute. Counting for a whole minute takes a long time. Instead, we count for 10 seconds and multiply by 6, because 6 times 10 seconds is 60 seconds (one minute).\n\n| Counted in 10 seconds | Multiplier | Beats per minute |\n|---|---|---|\n| 10 | 6 | 60 |\n| 12 | 6 | 72 |\n| 14 | 6 | 84 |\n\nIf you measure for half the time (5 seconds), the multiplier is 12. But in a short measurement, missing one beat changes the result a lot: one beat too many or too few in 5 seconds makes a difference of 12 beats per minute. The longer the measurement, the smaller the effect of a single mistake.\n\n### The flag: is a measurement running?\nThe A button can work at any time. But we only want it to count during a measurement. For this we use a flag variable called **olcum** (\"measuring\"). The flag takes only two values:\n\n| olcum | Meaning | What does button A do? |\n|---|---|---|\n| 0 | no measurement | nothing |\n| 1 | measurement running | adds 1 to sayac |\n\nOne place in the program sets the flag to 1, and another sets it to 0. The condition \"if olcum = 1\" tells these two states apart.\n\n### Other work while waiting\nThe Micro Card runs different hat blocks together. When the B hat block reaches the **pause [10000] ms** block, only the B hat block stops for 10 seconds. The A hat block keeps handling new presses during this time. The timeline looks like this:\n\n```\nt = 0 s     press B: sayac = 0, olcum = 1, pause starts\nt = 1..10   every press of A increases sayac\nt = 10 s    B carries on: olcum = 0, sayac x 6 is shown\n```\n\n### Do not forget to reset\nIf the counter is not set to 0 at the start of the measurement, the beats of the old measurement get mixed into the new result. If you counted 12 beats in the first measurement and 9 in the second and did not reset, the card shows (12 + 9) x 6 = 126. This is an impossible value for a resting heart; the mistake is not in the card but in the program.\n\n### Summary\nBeats per minute are found by counting for a short time and multiplying: number of beats x 6. A flag variable sets when counting is valid. The **pause** block only stops its own hat block; the other hat blocks keep running. You need to reset the counter before every measurement.",
            "concepts": [
              {
                "term": "Short measurement and multiplying",
                "definition": "Estimating a one-minute value by counting for a short time and multiplying the result.",
                "example": "If you count 14 beats in 10 seconds, you get 14 x 6 = 84 beats per minute.",
                "pitfall": "Forgetting the multiplier: the number of beats stays on the screen, not the beats per minute."
              },
              {
                "term": "Flag",
                "definition": "A variable that holds 0 or 1 and answers the question \"is this action valid right now?\".",
                "example": "While olcum = 1, A counts; while olcum = 0, A does nothing.",
                "pitfall": "Forgetting to set the flag to 1: the measurement never starts and A never counts."
              },
              {
                "term": "pause and hat blocks",
                "definition": "The pause block only stops its own hat block; the other hat blocks keep running.",
                "example": "While B waits for 10 seconds, button A keeps counting presses.",
                "pitfall": "Thinking the pause block stops the whole card."
              },
              {
                "term": "Resetting",
                "definition": "Setting the counter to 0 at the start of a new measurement.",
                "example": "The first block of the B hat block is set sayac to 0.",
                "pitfall": "Not resetting: in the second measurement the earlier beats are added too, and the result is inflated."
              },
              {
                "term": "Millisecond",
                "definition": "The unit of the pause block; 1000 ms = 1 second.",
                "example": "For 10 seconds you write pause [10000] ms.",
                "pitfall": "Writing pause [10]: this is only 10 ms, which you cannot notice by eye."
              }
            ],
            "quiz": [
              {
                "id": "m10h6d26-q1",
                "kind": "numeric",
                "prompt": "On the pulse meter you counted 14 beats in 10 seconds. Which number should the card show?",
                "answer": 84,
                "unit": "beats/min",
                "explanation": "6 times 10 seconds is one minute. 14 x 6 = 84. Showing the number of beats (14) or multiplying by 10 (140) does not give the beats per minute.",
                "skills": [
                  "mk-variables"
                ]
              },
              {
                "id": "m10h6d26-q2",
                "kind": "mcq",
                "prompt": "If button A is pressed while the B hat block is waiting at the pause [10000] ms block, what happens?",
                "options": [
                  "Button A does not work, because the card is waiting",
                  "The card gives an error",
                  "The A hat block runs, because hat blocks carry on independently of each other",
                  "The A presses are handled all together after 10 seconds"
                ],
                "answer": 2,
                "explanation": "pause only stops its own hat block. The A hat block is a separate task and runs straight away on every press. That is why counting can happen while waiting.",
                "skills": [
                  "mk-concurrency",
                  "mk-events"
                ]
              },
              {
                "id": "m10h6d26-q3",
                "kind": "find-bug",
                "prompt": "This program always shows 0, even if A is pressed 12 times in 10 seconds. Which is the mistake?\n\n```\non button B pressed:\n  set sayac to 0\n  pause 10000 ms\n  set olcum to 1\n  show number (sayac x 6)\n\non button A pressed:\n  if olcum = 1 then:\n    change sayac by 1\n```",
                "options": [
                  "In the A hat block, sayac should go up by 2 instead of 1",
                  "The set olcum to 1 block comes after the pause block; because olcum is 0 during the wait, A never counts",
                  "The multiplier should be 10, not 6",
                  "sayac was not reset at the start"
                ],
                "answer": 1,
                "explanation": "The flag must be set to 1 before the wait starts. Here it becomes 1 after the wait has finished, so the counting window never opens and sayac stays 0. The multiplier and the reset are correct.",
                "skills": [
                  "mk-debug",
                  "mk-concurrency",
                  "mk-variables"
                ]
              },
              {
                "id": "m10h6d26-q4",
                "kind": "predict-output",
                "prompt": "The program below is used. 12 beats were counted in the first measurement, and right after that 9 beats in the second measurement. What does the card show at the end of the second measurement?\n\n```\non start:\n  set sayac to 0\n  set olcum to 0\n\non button B pressed:\n  set olcum to 1\n  pause 10000 ms\n  set olcum to 0\n  show number (sayac x 6)\n\non button A pressed:\n  if olcum = 1 then:\n    change sayac by 1\n```",
                "options": [
                  "54",
                  "72",
                  "126",
                  "0"
                ],
                "answer": 2,
                "explanation": "The program does not reset sayac in B. In the second measurement sayac becomes 12 + 9 = 21, and 21 x 6 = 126 is shown. 54 would be the result of the second measurement alone; but there is no reset.",
                "skills": [
                  "mk-variables",
                  "mk-debug"
                ]
              },
              {
                "id": "m10h6d26-q5",
                "kind": "numeric",
                "prompt": "You increased the measurement time to 15 seconds and made the multiplier 4. You counted 17 beats in 15 seconds. How many beats per minute is that?",
                "answer": 68,
                "unit": "beats/min",
                "explanation": "4 times 15 seconds is 60 seconds. 17 x 4 = 68. The multiplier is chosen from the time: time x multiplier = 60.",
                "skills": [
                  "mk-variables"
                ]
              }
            ]
          }
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
          ],
          "contentEn": {
            "title": "Step counter",
            "problem": "How does the step counter in a wristband count? A tiny accelerometer inside it feels a small jolt on every step and adds one to the count. The Virtual Micro Card has an accelerometer too. We will make a step counter by counting each shake of the card as \"one step\", and we will add a little celebration on the 10th step.",
            "contentMd": "### The idea\nShaking the card virtually is a jolt, like walking. The card's **when shaken** hat block runs once on every shake. If we put a block inside it that adds one to the **adim** (\"step\") variable, we have a step counter.\n\n### A new idea: something special when you reach the goal\nWe can say that something should happen when a variable is **exactly** equal to a number: **if [adim] = [10] then**. The equality is only true at that moment. On the 11th step the condition is false, and the sound does not play again.\n\n### Step by step\n**on start**, **when card is [shaken]**, **on button [A] [pressed]** and **on button [B] [pressed]** are ready in the editor.\n\n1. In the **Variables** category, make the **adim** variable.\n2. Put **set adim to [0]** inside **on start**.\n3. Inside **when card is [shaken]**, in this order:\n   - **change adim by [1]**\n   - an **if ... then** block. Condition: **adim** **=** **10**. Inside it, **show icon [happy face]** and **play melody [Fanfare]**.\n4. Put **show number** inside **on button [A] [pressed]**; plug the **adim** variable in as the number.\n5. Put **set adim to [0]** and **clear screen** inside **on button [B] [pressed]**.\n6. Press ▶ **Run**. In the **Motion (accelerometer)** section in the right panel, press the **Shake** button three times. Then press the card's **A** button: you should see 3 on the screen. Shake seven more times. On the 10th shake the celebration starts. Reset with the card's **B** button.\n\n### Expected result\n**A** shows the number of steps: 3 after three shakes, 10 after ten shakes. On the 10th shake, a happy face appears on the card's screen and the **Fanfare** melody plays (about 2.75 seconds). When you press **B**, the counter is reset. All six goals should have a ✓.\n\n### How does it work?\n- With every **Shake**, the **when card is shaken** hat block runs once.\n- On the 10th step, the **if** condition becomes true and the celebration starts. That hat block is busy until the melody ends; new shakes that arrive during this time join a queue (at most 3).\n- **A** and **B** are separate hat blocks; they can run while the melody is playing too.\n- You can also see the values coming from the acceleration sensor: the **strength** value in the **Motion** section goes up while shaking.\n\n### Try it\n1. Make the goal 5 instead of 10. Does the celebration come sooner?\n2. To celebrate every 10 steps, use the **remainder of [adim] ÷ [10]** block in the **Math** category. If the remainder is **0**, celebrate.\n3. If you count your step as 70 cm, the distance you walked is **adim** × 7 ÷ 10 metres. Make the **A** button show this.\n\n### Common mistakes\n- **Forgetting to reset with B.** If you do not press B first for a new walk, the count carries on from where it stopped.\n- **Using the greater-than sign instead of equals.** If it is **adim ≥ 10**, the melody plays again on the 11th and 12th steps too.\n- **Putting the change adim by 1 block inside the if.** Then the variable does not go up.",
            "question": "How does a real step counter tell shaking apart from walking? Does jumping or swinging your arm count as a step? What information could you use to make the counter smarter?",
            "explainerMd": "### What you will learn in this lesson\n- How to count events with a hat block that is triggered on every shake\n- The difference between \"exactly equal to this number\" and \"equal to or greater than this number\"\n- How to set up repeating goals such as \"every 10 steps\" with the remainder (mod) operation\n- Whether the counting block should be inside or outside the **if**\n\n### What you should know first\n- Lesson 7: variables and the **change by** block\n- Lesson 8: **if ... then** and comparisons\n- Lesson 11: the accelerometer and the **when card is shaken** hat block\n- Lesson 18: the **play melody** block\n\n### Every shake is an event\nThe accelerometer in a real step counter feels small jolts while you walk. On the virtual card, we count a shake as a step. The **when card is [shaken]** hat block runs once on every shake. If you put **change adim by 1** inside it, adim (\"step\") goes up by one on every shake.\n\n### Equal or greater?\nTo do something when the goal is reached, we write a condition. A small change makes a big difference:\n\n| Condition | adim = 9 | adim = 10 | adim = 11 | adim = 12 |\n|---|---|---|---|---|\n| adim = 10 | false | true | false | false |\n| adim >= 10 | false | true | true | true |\n\n\"adim = 10\" is only true on exactly the 10th step, so the celebration happens once. \"adim >= 10\", however, is true on every step after the 10th, so the celebration repeats on every shake. If the goal is to be done once, choose equality; if it is to be done \"always after passing the goal\", choose greater-than-or-equal.\n\n### Every 10 steps\nIf you want to celebrate at 10, 20, 30... steps, the **remainder of adim ÷ 10** block is useful. The remainder is the number left over from a division:\n\n| adim | remainder of adim ÷ 10 |\n|---|---|\n| 7 | 7 |\n| 10 | 0 |\n| 23 | 3 |\n| 30 | 0 |\n\nIf the remainder is 0, adim is a multiple of 10. So the condition \"if remainder = 0, celebrate\" is true once every 10 steps.\n\n### Where should the counting go?\nYou count first, then you check. If the counting block goes inside the **if**, it only counts while the condition is true. If the condition is \"adim = 10\" and adim starts at 0, the condition is never true, because adim never goes up. The counting block must always be outside the condition, before it.\n\n### The ones that queue\nThe celebration melody lasts about 2.75 seconds. During this time the hat block is busy. New shakes that arrive join a queue, but at most 3 of them are kept, and any more are lost. This is why the counter can count too few with very fast events.\n\n### Summary\nThe **when card is shaken** hat block counts one step on every shake. Exact equality is true once, and greater-than-or-equal is true on every step after it. The remainder operation sets up repeating goals. The counting block must be outside the condition. A busy hat block only queues 3 events.",
            "concepts": [
              {
                "term": "when card is shaken",
                "definition": "An event hat block that runs once on every shake of the card.",
                "example": "If you put change adim by 1 inside the hat block, every shake counts as one step.",
                "pitfall": "Leaving the hat block empty: shaking does not increase any variable."
              },
              {
                "term": "Equal and greater-than-or-equal",
                "definition": "\"Equal\" is only true at exactly that number; \"greater-than-or-equal\" is true at every number from that one on.",
                "example": "adim = 10 does the celebration once; adim >= 10 repeats it on every step.",
                "pitfall": "Using greater-than-or-equal for something that should happen once: the celebration plays on the 11th and 12th steps too."
              },
              {
                "term": "Remainder (mod)",
                "definition": "The number left over from a division. The remainder of adim ÷ 10 is 0 at multiples of 10.",
                "example": "The remainder of 30 ÷ 10 is 0, and the remainder of 23 ÷ 10 is 3.",
                "pitfall": "Mixing up the quotient and the remainder: for 23 ÷ 10 the quotient is 2 and the remainder is 3."
              },
              {
                "term": "Counting order",
                "definition": "You count first, then you check. The counting block must be outside the condition.",
                "example": "The change adim by 1 block comes before the if block.",
                "pitfall": "Putting the counting block inside the if: the condition is never true and the variable does not go up."
              },
              {
                "term": "Event queue",
                "definition": "New events that arrive at a busy hat block join a queue, but at most 3 of them are kept.",
                "example": "Of 5 shakes that arrive while Fanfare is playing, only 3 are handled.",
                "pitfall": "Thinking every shake will definitely be counted: on a busy hat block, the extra ones are lost."
              }
            ],
            "quiz": [
              {
                "id": "m10h6d27-q1",
                "kind": "predict-output",
                "prompt": "The card is shaken 12 times (adim starts at 0, and after each shake you wait until the melody ends). How many times does the Fanfare melody play?\n\n```\nwhen card is shaken:\n  change adim by 1\n  if adim >= 10 then:\n    play melody [Fanfare]\n```",
                "options": [
                  "1 time",
                  "2 times",
                  "3 times",
                  "12 times"
                ],
                "answer": 2,
                "explanation": "The condition is true when adim is 10, 11 and 12: 3 times. If \"adim = 10\" had been written, it would play only once. For it to play 12 times, it would have to be true from the first shake.",
                "skills": [
                  "mk-conditions",
                  "mk-variables"
                ]
              },
              {
                "id": "m10h6d27-q2",
                "kind": "find-bug",
                "prompt": "However many times you shake the card, there is no celebration on the 10th step. Which is the mistake?\n\n```\non start:\n  set adim to 0\n\nwhen card is shaken:\n  if adim = 10 then:\n    change adim by 1\n    show icon [happy face]\n    play melody [Fanfare]\n```",
                "options": [
                  "The change adim by 1 block is inside the if; because adim is 0, the condition is never true and adim never goes up",
                  "The melody name is wrong",
                  "adim should not be set to 0 in on start",
                  "< should be used instead of = in the condition"
                ],
                "answer": 0,
                "explanation": "The counting block should be put outside the condition, before it. If it stays inside, adim gets stuck at 0, and \"adim = 10\" never becomes true. Setting it to 0 in on start and the melody name are correct.",
                "skills": [
                  "mk-debug",
                  "mk-conditions"
                ]
              },
              {
                "id": "m10h6d27-q3",
                "kind": "numeric",
                "prompt": "Your step is 70 cm. The step counter shows 50 steps. How many metres have you walked?",
                "answer": 35,
                "unit": "m",
                "explanation": "70 cm = 0.7 m. 50 x 0.7 = 35 m. In blocks it can also be written as adim x 7 ÷ 10. The answer 3500 is in centimetres.",
                "skills": [
                  "mk-variables"
                ]
              },
              {
                "id": "m10h6d27-q4",
                "kind": "mcq",
                "prompt": "The condition \"remainder of adim ÷ 10 = 0\" is used to celebrate every 10 steps. On which steps does the celebration happen?",
                "options": [
                  "Only on the 10th step",
                  "On all the steps 1, 2, 3 ...",
                  "On steps 10, 20, 30 ...",
                  "On steps 5, 15, 25 ..."
                ],
                "answer": 2,
                "explanation": "The remainder is only 0 at multiples of 10: 10, 20, 30 ... To celebrate only on the 10th step, you would write adim = 10.",
                "skills": [
                  "mk-conditions"
                ]
              },
              {
                "id": "m10h6d27-q5",
                "kind": "numeric",
                "prompt": "In a correctly built step counter, the 10th shake starts the Fanfare melody (2.75 seconds). While the melody is playing, the card is shaken 5 more times. When the melody ends and the queued events are handled, what is adim?",
                "answer": 13,
                "explanation": "At most 3 events join the queue of a busy hat block; of the 5 shakes, 3 are kept and 2 are lost. adim becomes 10 + 3 = 13. We checked this number by running it on the virtual card.",
                "skills": [
                  "mk-events",
                  "mk-concurrency"
                ]
              }
            ]
          }
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
          ],
          "contentEn": {
            "title": "Alarm",
            "problem": "What if your bag or your bike had an alarm that started ringing as soon as anyone touched it? An alarm is really a **state** machine: either it is not set, or it is set, or it is ringing. The buttons and sensors make it move between the states. In this lesson you will make an alarm that keeps its states in variables.",
            "contentMd": "### Three states\n| State | When? | On the screen |\n|---|---|---|\n| Off | at the start | empty |\n| Set | when you press A | the \"yes\" mark |\n| Ringing | when the card is shaken while it is set | a skull and the alarm melody |\n\nTo turn off a ringing alarm, you press **A+B** for longer than a second. A long press does not happen by accident, so it works like a password. When it turns off, a happy face appears on the screen.\n\n### New ideas\n- Two **state variables**: **kurulu** (\"set\", 0/1) and **alarm** (0/1). The variables remember the card's current state.\n- **on button [A+B] [long pressed]**: runs when you press A and B together for longer than 1 second. (In the button hat block, choose **A+B** and **long pressed** from the lists.)\n- Checking a state all the time with an **if** inside **forever**.\n\n### Step by step\n**on start**, **on button [A] [pressed]**, **when card is [shaken]**, **forever** and **on button [A+B] [long pressed]** are ready in the editor.\n\n1. In the **Variables** category, make the **kurulu** and **alarm** variables.\n2. Put **set kurulu to [0]** and **set alarm to [0]** inside **on start**.\n3. Put **set kurulu to [1]** and **show icon [yes]** inside **on button [A] [pressed]**.\n4. Put **if ... then** inside **when card is [shaken]**. Condition: **kurulu** **=** **1**. Inside it, **set alarm to [1]**.\n5. Put **if ... then** inside **forever**. Condition: **alarm** **=** **1**. Inside it, in this order: **show icon [skull]**, **play melody [Alarm]**, **clear screen**, **pause [200] ms**.\n6. Inside **on button [A+B] [long pressed]**, in this order: **set kurulu to [0]**, **set alarm to [0]**, **stop sound**, **show icon [happy face]**.\n7. Press ▶ **Run**. Press the card's **A** button. Press **Shake** in the **Motion** section. While the alarm is ringing, press the button marked **A+B** for longer than a second and do not let go.\n\n### Expected result\nAfter **A**, the \"yes\" mark appears on the screen. When you shake, the skull flashes on and off and a short alarm melody plays again and again (the melody lasts 1.6 seconds, followed by a gap of 0.2 seconds). When you long-press **A+B**, the alarm stops and a happy face appears. All six goals should have a ✓.\n\n### How does it work?\n- If you shake **while it is not set**, nothing happens, because the **if** inside **when card is [shaken]** waits for **kurulu = 1**.\n- **forever** always goes round, but while **alarm = 0** it skips its inside.\n- When the **A+B** long press sets **alarm** to 0, **forever** does not ring the alarm on the next round. The melody that is playing at that moment may carry on until it ends (at most 1.6 seconds), but it does not start again.\n- Because more than one hat block runs at the same time, the **A+B** long press is handled before the melody has ended.\n\n### Try it\n1. Make the alarm ring when the card is turned face down instead of shaken: use the **when card is [face down]** hat block.\n2. While the alarm is ringing, play a different melody if the **light level** is below 50 (in the dark). Change the light with the **Light** slider.\n3. To turn it off, try pressing the B button 3 times in a row instead of A+B. You will need a variable that keeps count.\n\n### Common mistakes\n- **Keeping the press too short.** For a long press you must keep A+B pressed for more than a second.\n- Mixing up the **kurulu** and **alarm** variables. When the card is shaken, **alarm** becomes 1, not **kurulu**.\n- **Only stopping the sound when turning off the alarm.** If you do not reset the **alarm** variable, **forever** rings the alarm again.\n- **Not putting a pause inside forever.** The screen is only empty for a very short moment, and the flashing is almost invisible.",
            "question": "In a real alarm, ringing by mistake (a false alarm) is a problem. Which would bother you more: an alarm that rings when it should not, or an alarm that does not ring when it really should? How would you make the card more reliable?",
            "explainerMd": "### What you will learn in this lesson\n- How to think of a device as **states** and the moves between states\n- How to keep the state in variables, and how events change the state\n- How to check a state all the time inside **forever**\n- Why you need to reset both the sound and the state variable when turning off the alarm\n\n### What you should know first\n- Lesson 7: variables\n- Lesson 8: **if ... then**\n- Lesson 9: long press\n- Lesson 11: the **when card is shaken** hat block\n- Lesson 18: the **play melody** block\n\n### A device is in one state at a time\nThink of a door alarm. Either it is off (it does nothing), or it is set (it waits for a burglar), or it is ringing. It cannot be in two states at the same time. This way of thinking is called a **state machine**. For every state we ask: while I am in this state, which event takes me to which state?\n\n| Current state | Event | New state |\n|---|---|---|\n| Off | A was pressed | Set |\n| Set | the card was shaken | Ringing |\n| Ringing | A+B was long-pressed | Off |\n| Off | the card was shaken | Off (nothing happens) |\n\nThe last row is important: an event does not have an effect in every state. Shaking while the alarm is not set does not change anything.\n\n### Keeping the state in two variables\nTwo variables are enough for three states. The kurulu (\"set\") and alarm variables are 0 or 1:\n\n| State | kurulu | alarm |\n|---|---|---|\n| Off | 0 | 0 |\n| Set | 1 | 0 |\n| Ringing | 1 | 1 |\n\nThe shake hat block first checks \"is kurulu = 1?\"; if yes, it sets the alarm variable to 1. The hat block itself does not play the sound; it only changes the state. Playing the sound is a separate task.\n\n### The task that checks all the time\nThe **forever** block is a loop that never ends. If you put \"if alarm = 1, play the melody\" inside it, the sound starts as soon as the alarm state becomes 1 and repeats until alarm becomes 0. The Alarm melody is 3.25 beats. At tempo 120 one beat is 500 ms, so the melody lasts about 1625 ms. If there is a 200 ms pause inside, one round is about 1825 ms, plus the small allowance that the system adds for each loop.\n\n### Turning it off takes two jobs\nThe hat block that turns off the alarm must set alarm to 0. Just stopping the sound is not enough, because on the next round **forever** sees \"alarm = 1\" and rings again. The turn-off hat block resets the kurulu and alarm variables, stops the sound and gives the user a sign.\n\n### Why is a long press a good password?\nIt is hard to press A+B for longer than a second by accident. Real alarms also ask for a difficult action like this so that they are not turned off by mistake.\n\n### Summary\nAn alarm is a state machine: off, set, ringing. Variables keep the state, and events change the state. The check inside **forever** watches the state all the time. When turning it off, you need to reset both the sound and the state variable.",
            "concepts": [
              {
                "term": "State machine",
                "definition": "A way of thinking in which the device is in a single state at any moment and events move it to another state.",
                "example": "Alarm: off, set, ringing. A sets it, a shake makes it ring, A+B turns it off.",
                "pitfall": "Thinking an event has an effect in every state: shaking does nothing while it is not set."
              },
              {
                "term": "State variable",
                "definition": "A variable that remembers the device's state as 0 or 1.",
                "example": "kurulu = 1 and alarm = 1 is the \"ringing\" state.",
                "pitfall": "Mixing up the variables: when the card is shaken, alarm becomes 1, not kurulu."
              },
              {
                "term": "forever",
                "definition": "A loop that runs the blocks inside it again and again without ending.",
                "example": "If you put \"if alarm = 1, play the melody\" inside it, the sound repeats all the time while the alarm is on.",
                "pitfall": "Not putting a pause inside: the flashing skull becomes almost invisible."
              },
              {
                "term": "Long press",
                "definition": "Pressing a button for longer than 1 second. It is hard to do by accident.",
                "example": "When you hold A+B down for 1.2 seconds, the alarm turns off.",
                "pitfall": "Pressing briefly: the long press hat block never runs."
              },
              {
                "term": "Full turn-off",
                "definition": "Stopping the sound and resetting the state variables when turning off the alarm.",
                "example": "The turn-off hat block sets kurulu and alarm to 0 and stops the sound.",
                "pitfall": "Only stopping the sound: because alarm is still 1, forever starts the melody again."
              }
            ],
            "quiz": [
              {
                "id": "m10h6d28-q1",
                "kind": "mcq",
                "prompt": "If the card is shaken while the alarm is not set (kurulu = 0), what happens?",
                "options": [
                  "The alarm starts ringing",
                  "Nothing happens, because the shake hat block first checks whether kurulu = 1",
                  "The card sets itself automatically",
                  "The card gives an error"
                ],
                "answer": 1,
                "explanation": "The if in the shake hat block waits for kurulu = 1. If kurulu is 0, the alarm variable does not change and the sound does not start. For the alarm to ring, it must first be set with A.",
                "skills": [
                  "mk-state",
                  "mk-conditions"
                ]
              },
              {
                "id": "m10h6d28-q2",
                "kind": "find-bug",
                "prompt": "When A+B is long-pressed, the sound stops, but after a while the alarm rings again. Which is the mistake?\n\n```\non button [A+B] long pressed:\n  stop sound\n  show icon [happy face]\n\nforever:\n  if alarm = 1 then:\n    show icon [skull]\n    play melody [Alarm]\n    clear screen\n    pause 200 ms\n```",
                "options": [
                  "The alarm variable is not set to 0; on the next round, forever sees alarm = 1 and plays the melody again",
                  "The happy face is the wrong icon",
                  "The pause is too short",
                  "The forever block should not be used at all"
                ],
                "answer": 0,
                "explanation": "Turning it off without resetting the state variable is only half done. The turn-off hat block must set alarm (and kurulu) to 0. The other options do not make the alarm ring again.",
                "skills": [
                  "mk-debug",
                  "mk-state"
                ]
              },
              {
                "id": "m10h6d28-q3",
                "kind": "predict-output",
                "prompt": "The program below is running. The events come in this order: shake, A, shake, A+B long, shake. When is the alarm variable 1?\n\n```\non start: kurulu = 0, alarm = 0\nA pressed: kurulu = 1\nwhen shaken: if kurulu = 1 then alarm = 1\nA+B long pressed: kurulu = 0, alarm = 0\n```",
                "options": [
                  "All the time from the first shake on",
                  "On every shake",
                  "Only from the second shake until the A+B long press",
                  "Never"
                ],
                "answer": 2,
                "explanation": "On the first shake kurulu is 0, so alarm stays 0. A sets it, and the second shake sets alarm to 1. The A+B long press sets both to 0. The third shake has no effect because kurulu is 0.",
                "skills": [
                  "mk-state",
                  "mk-events"
                ]
              },
              {
                "id": "m10h6d28-q4",
                "kind": "numeric",
                "prompt": "The Alarm melody is 3.25 beats and the tempo is 120 (one beat is 500 ms). Inside forever, there is a 200 ms pause after the melody. Do not count the system's small loop allowance. How many ms does one round take?",
                "answer": 1825,
                "unit": "ms",
                "explanation": "3.25 x 500 = 1625 ms of melody. Adding the 200 ms pause makes 1825 ms. The round measured on the virtual card comes out as 1845 ms; the 20 ms difference is the allowance the system adds at the end of each round.",
                "skills": [
                  "mk-concurrency"
                ]
              },
              {
                "id": "m10h6d28-q5",
                "kind": "mcq",
                "prompt": "The alarm is kept in two variables: kurulu and alarm. Which state is kurulu = 1 and alarm = 1?",
                "options": [
                  "Off",
                  "Set but not ringing",
                  "There should be no such state",
                  "Ringing"
                ],
                "answer": 3,
                "explanation": "alarm only becomes 1 while it is set. If both are 1, the device is ringing. In the off state both are 0; in the set state kurulu is 1 and alarm is 0.",
                "skills": [
                  "mk-state",
                  "mk-variables"
                ]
              }
            ]
          }
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
          ],
          "contentEn": {
            "title": "Humidity and temperature station",
            "problem": "How do you know when the potted plant at home is thirsty? You push your finger into the soil. But what about when you are not at home? That is exactly what a station is for: it measures the temperature and how moist the soil is, and warns you when the soil dries out. In this lesson you will build your own small weather and plant pot station.",
            "contentMd": "### Sensors\nThe card has no moisture sensor of its own. We will pretend a virtual **soil moisture sensor** is connected to the **P1** pin. Open the **Pins** section in the right panel; in the **P1** row there is an **Input** slider. This slider sets the number the sensor reads: we will take **0 as very dry and 1023 as very wet**. On a real sensor, the values come out differently depending on the sensor; that is why you first need to calibrate a real sensor when you use one.\n\nFor temperature, the card has its own **temperature (°C)** sensor. You change its value with the **Temperature** slider in the **Compass and sensors** section.\n\n### Turning 0-1023 into a percentage\nThe number read is between 0 and 1023; we want to see a **percentage** (0-100). The **map** block in the **Math** category does this:\n\n**map [analog read P1 (0-1023)] from [0]-[1023] to [0]-[100]**\n\nExamples: 0 → 0%, 512 → 50%, 1023 → 100%.\n\n### New blocks\n- The **analog read [P1] (0-1023)** block in the **Pins** category gives the pin's input value as a number.\n- The **bar graph [3] up to [5]** block in the **LED** category shows a value with LEDs, compared to the largest value. The LEDs fill from the bottom up. If the value is **50** and the largest is **100**, half of the 25 LEDs (13 when rounded) light up.\n- The **print to console [hello]** block in the **Basic** category writes a value to the card's console. The console appears in the **Console** section in the right panel.\n\n### Step by step\n**on start**, three button hat blocks (**A**, **B**, **A+B**) and **every [2000] ms** are ready in the editor.\n\n1. In the **Variables** category, make the **nem** (\"moisture\") variable. Put **set nem to [0]** inside **on start**.\n2. Put **show number** inside **on button [A] [pressed]**; plug in **temperature (°C)** from the **Input** category as the number.\n3. Put **show number** inside **on button [B] [pressed]**; plug in the **map** block above as the number (the **analog read [P1] (0-1023)** value from 0-1023 to 0-100).\n4. Put **bar graph [...] up to [100]** inside **on button [A+B] [pressed]**. Plug in the same **map** block (you can copy it) as the value.\n5. Inside **every [2000] ms**, in this order:\n   - **set nem to [...]**; plug in the **map** block as the value.\n   - **print to console [nem]**\n   - **if ... then**: condition **nem** **<** **30**. Inside it, **show icon [sad face]** and **play melody [Sad]**.\n6. Getting ready: set the **Temperature** slider to 27, and bring the **P1 Input** slider to about 512.\n7. Press ▶ **Run**. Press **A**, **B** and **A+B** in turn. Then pull the **P1** slider down to 100 and wait a few seconds.\n\n### Expected result\n**A** scrolls 27, and **B** scrolls 50. **A+B** shows a half-full bar graph (13 LEDs). In the Console section, a moisture value appears every two seconds. When you pull **P1** down to 100, the moisture becomes about 10%: the sad face and the **Sad** melody (3 seconds) start. All seven goals should have a ✓.\n\n**Note:** When the program first runs, the **P1** slider is at 0. So the moisture is 0%, and right at the end of the first two seconds the sad face appears. This is not a mistake; the soil is taken to be dry. When you pull the slider up, it goes back to normal.\n\n### How does it work?\n- **every [2000] ms** reads the moisture every two seconds, writes it to the console and warns you if the soil is dry.\n- **nem < 30** is the warning threshold. The threshold changes with the real plant; it is chosen separately for each plant.\n- **A**, **B** and **A+B** are for seeing the current value whenever you want. The station keeps running in the background anyway.\n- The **map** block rounds the result to the nearest whole number. That is why the value 512 becomes 50% (50.05).\n\n### Try it\n1. Make the threshold 20 instead of 30. At which **P1** value does the warning start?\n2. Measure the light too: make **on button [A+B] [long pressed]** show the light level. In the dark (light below 50), imagine the plant wants to \"sleep\": **show icon [sleeping face]**.\n3. Write not only the moisture but also the temperature to the console: add a second **print to console** block.\n4. If the heat is high (above 35 °C) and the moisture is low (below 30), play a different warning. To combine the two conditions, use the **and** block in the **Logic** category.\n\n### Common mistakes\n- **Writing the ranges wrongly.** The input range must be **0-1023** and the output range **0-100**. If you write it the other way round when mapping 1023 to 100, the results come out backwards.\n- **The wrong sign in the threshold comparison.** **nem < 30** means dry; if you write **>**, it warns you when it is wet.\n- **Playing a melody on every round.** The Sad melody lasts 3 seconds. Set how often it warns, and the melody, with that in mind.\n- **Mixing up temperature and moisture.** The temperature comes from the card's own sensor, and the moisture from the **P1** pin. Their sliders are in different sections.",
            "question": "If the threshold for a potted plant were 30, what would it be for a cactus? How would you make the program more flexible so you can change the threshold for each plant? What would you do if a real sensor gave you random numbers?",
            "explainerMd": "### What you will learn in this lesson\n- How to turn the raw number a sensor gives (0-1023) into a percentage\n- How to write the input and output ranges of the **map** block correctly\n- How to give a warning based on a threshold\n- How to show and record a value with the **bar graph** and the console\n\n### What you should know first\n- Lesson 7: variables\n- Lesson 8: **if ... then**\n- Lesson 12: temperature, light and the **bar graph** block\n- Lesson 18: the **play melody** block\n\n### A raw number is not a percentage\nThe analog value that comes from the pin is between 0 and 1023. We want to see \"what percentage moist\" the soil is. The operation that moves this number into the 0-100 range is called **mapping**. The logic is proportion: wherever you are in the input range, you go to the same place in the output range.\n\n| P1 input | Proportion (input / 1023) | Percentage (rounded) |\n|---|---|---|\n| 0 | 0 | 0 |\n| 256 | 0.25 | 25 |\n| 512 | 0.5 | 50 |\n| 1023 | 1 | 100 |\n\nThe **map** block rounds the result to the nearest whole number. For 512 it finds 50.05 and writes 50.\n\n### Write the ranges in the right order\nThe block wants four numbers: input lowest, input highest, output lowest, output highest. Because the sensor gives 0-1023, the first two must be 0 and 1023, and because you want 0-100, the last two must be 0 and 100. If you mix up the order, the value 512 is moved from the 0-100 range to 0-1023, and a meaningless number such as 5238 comes out.\n\n### Threshold and warning\nWhen the moisture drops below 30, the plant is thirsty. The value 30 is called the **threshold**. The raw value that matches the threshold is about 307; but because of rounding, when 301 is read, 29 percent comes out and the warning starts, and at 302, 30 percent comes out and the warning stops. The threshold changes with each plant: 10 might suit a cactus better, and 40 a seedling.\n\n### Bar graph and console\nThe **bar graph [value] up to [100]** block works out how many of the 25 LEDs light up: value / largest x 25, then it is rounded. If the moisture is 50 and the largest is 100, you get 12.5, and 13 LEDs light up. If you enter the wrong largest value, the graph stops making sense. The **print to console** block, on the other hand, keeps the values as a record; you can see them in the console even if the screen is cleared.\n\n### Each sensor from its own slider\nThe temperature comes from the card's own sensor. The moisture comes from the virtual sensor connected to the P1 pin. You must not mix them up. On a real sensor, the 0-1023 range can come out differently depending on the sensor; that is why a real sensor is calibrated first.\n\n### Summary\nThe raw sensor value is turned into a percentage with **map**. Writing the ranges in the right order is essential. The threshold is a warning limit. The **bar graph** shows the value with LEDs compared to the largest value, and **print to console** keeps a record.",
            "concepts": [
              {
                "term": "Analog value",
                "definition": "The raw number between 0 and 1023 read from a pin.",
                "example": "If the P1 input slider is 512, the analog read block gives 512.",
                "pitfall": "Thinking this number is directly a percentage: 512 is not 512 percent."
              },
              {
                "term": "map",
                "definition": "A block that moves a value from one range to another in proportion and rounds it to the nearest whole number.",
                "example": "If you map the 512 that was read from the 0-1023 range to 0-100, you get 50.",
                "pitfall": "Writing the ranges the wrong way round: the value 512 gives a meaningless result such as 5238."
              },
              {
                "term": "Threshold",
                "definition": "The limit number chosen for giving a warning.",
                "example": "When nem < 30, the pot is counted as thirsty.",
                "pitfall": "Using the wrong sign: if you write nem > 30, it warns you when it is wet."
              },
              {
                "term": "bar graph",
                "definition": "A block that shows a value, compared to the largest value, by how many of the 25 LEDs light up.",
                "example": "bar graph [50] up to [100] lights 13 LEDs.",
                "pitfall": "Entering the wrong largest value: the scale breaks and the bar looks wrongly filled."
              },
              {
                "term": "Calibration",
                "definition": "Comparing the numbers a real sensor reads with known situations and adjusting.",
                "example": "The two numbers read in dry and wet soil set the mapping range.",
                "pitfall": "Thinking every sensor uses the whole 0-1023 range: real sensors can have a different range."
              }
            ],
            "quiz": [
              {
                "id": "m10h6d29-q1",
                "kind": "numeric",
                "prompt": "The P1 input slider is 256. The value read is mapped from the 0-1023 range to the 0-100 range. What is the result?",
                "answer": 25,
                "unit": "%",
                "explanation": "256 / 1023 is about 0.25, and multiplying by 100 gives 25.02; the map block rounds it: 25. Leaving the result as 256 would mean forgetting the mapping.",
                "skills": [
                  "mk-sensors"
                ]
              },
              {
                "id": "m10h6d29-q2",
                "kind": "predict-output",
                "prompt": "The P1 input value is 512. What does the block below show on the screen?\n\n```\nshow number:\n  map [analog read P1]\n  from [0]-[100]\n  to [0]-[1023]\n```",
                "options": [
                  "50",
                  "512",
                  "5238",
                  "0"
                ],
                "answer": 2,
                "explanation": "The ranges are written the wrong way round: the input is taken as 0-100 and the output as 0-1023. 512 x 1023 / 100 = 5237.76, which rounds to 5238. The correct way is from the 0-1023 range to the 0-100 range (the result is 50).",
                "skills": [
                  "mk-sensors",
                  "mk-debug"
                ]
              },
              {
                "id": "m10h6d29-q3",
                "kind": "numeric",
                "prompt": "The warning condition is nem < 30, and nem is the P1 value mapped from 0-1023 to 0-100. What is the largest whole-number P1 value at which the warning still starts?",
                "answer": 301,
                "explanation": "The value 301 gives 29.42, which rounds to 29: there is a warning. The value 302 gives 29.52, which rounds to 30: 30 < 30 is false, no warning. Because of rounding, the limit is 301, not 306.9.",
                "skills": [
                  "mk-sensors",
                  "mk-conditions"
                ]
              },
              {
                "id": "m10h6d29-q4",
                "kind": "numeric",
                "prompt": "How many LEDs does bar graph [70] up to [200] light? (The share of 25 LEDs, rounded to the nearest whole number.)",
                "answer": 9,
                "unit": "LEDs",
                "explanation": "70 / 200 = 0.35, and 0.35 x 25 = 8.75; the nearest whole number is 9. 8 (rounding down) or 35 (the percentage) would be wrong.",
                "skills": [
                  "mk-display"
                ]
              },
              {
                "id": "m10h6d29-q5",
                "kind": "mcq",
                "prompt": "Why is a real soil moisture sensor calibrated first before mapping?",
                "options": [
                  "Sensors do not work at all without calibration",
                  "The smallest and largest numbers a real sensor reads change from sensor to sensor; without measuring the range, the mapping gives a wrong percentage",
                  "Calibration makes the sensor faster",
                  "The percentage value can only be written with calibration"
                ],
                "answer": 1,
                "explanation": "Each sensor can give different numbers when dry and when wet. If these two numbers are measured, the mapping gives the right percentage. The sensor still produces a number without calibration; the problem is what that number means.",
                "skills": [
                  "mk-sensors"
                ]
              }
            ]
          }
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
          ],
          "contentEn": {
            "title": "Project: Smart plant pot (final)",
            "problem": "Time to put it all together. In this module you learnt how to light LEDs, listen to buttons, read sensors, play music and talk by radio. Now you will use all of them in the same project: two smart plant pots watching each other's state by radio. When one pot's soil dries out, the other pot sees it and sounds an alarm.",
            "contentMd": "### Project: Smart plant pot\nThe two cards are two virtual plant pots. We pretend each card has a soil moisture sensor connected to its **P1** pin (the **Input** slider in the Pins section: 0 dry, 1023 wet). Both cards run the same program.\n\n**Goals:**\n- Every two seconds, the card measures its own moisture as a percentage and sends it by radio with the name **nem** (\"moisture\").\n- If the moisture is below 30, the card that receives the message shows a sad face and plays the sad melody.\n- If the moisture is 30 or above, the receiving card shows the moisture with a bar graph.\n- The **A** button shows the card's own moisture.\n\n### Which lesson gives which part?\n| Part | Where you learnt it |\n|---|---|\n| **every [2000] ms**, variables, **if** | earlier weeks |\n| Turning 0-1023 into a percentage with **map** | lesson 29 |\n| **bar graph** | lesson 29 |\n| **radio group**, **radio send [name] = [value]**, **received [name]**, **received [value]** | lesson 22 |\n| **play melody [Sad]**, **show icon [sad face]** | lesson 18 and the first week |\n\n### Draw your plan\nFirst draw a flow on paper or in your head:\n\n1. **Start:** radio group 7, the **nem** variable 0.\n2. **Every 2 seconds:** measure the moisture, send **nem = value** by radio.\n3. **A:** measure the moisture and show it on the screen.\n4. **When a message is received:** if its name is **nem**, put the value into the **uzak** (\"remote\") variable. If it is less than 30, a sad face and the melody; if not, a bar graph.\n\n### Step by step\n**on start**, **every [2000] ms**, **on button [A] [pressed]** and **on radio received** are ready in the editor.\n\n1. In the **Variables** category, make the **nem** and **uzak** variables.\n2. Put **set radio group to [7]** and **set nem to [0]** inside **on start**.\n3. Put **set nem to [...]** inside **every [2000] ms**; as the value, the **map** block: **map [analog read P1 (0-1023)] from [0]-[1023] to [0]-[100]**. Underneath, put **radio send [nem] = [...]**; the name is **nem**, and the value is the **nem** variable.\n4. Put **set nem to [...]** (the same map block) and **show number [nem]** inside **on button [A] [pressed]**.\n5. Put **if ... then** inside **on radio received**. Condition: **received [name]** **=** **nem**. Inside it, in this order:\n   - **set uzak to [...]**; as the value, **received [value]**\n   - **if ... then ... else**. Condition: **uzak** **<** **30**. **then**: **show icon [sad face]** and **play melody [Sad]**. **else**: **bar graph [uzak] up to [100]**.\n6. Getting ready: choose the **Card 1** tab in the right panel and set **P1 Input** to about 512 in the **Pins** section. Choose the **Card 2** tab and set **P1 Input** to 100.\n7. Press ▶ **Run**. Wait a few seconds. Press Card 1's **A** button.\n\n### Expected result\nCard 1's moisture is 50%, and Card 2's moisture is 10%. When Card 2 receives the **nem = 50** message from Card 1, it shows a half-full bar graph (13 LEDs). When Card 1 receives the **nem = 10** message from Card 2, it shows a sad face and plays the **Sad** melody (3 seconds). The **A** button shows the number **50** on Card 1. All six goals should have a ✓.\n\n### How does it work?\n- Every two seconds, each card sends its own moisture. When the receiving side sees the name **nem**, it puts the value into the **uzak** variable.\n- A card does not receive its own message. So each card only sees the state of the **other** pot.\n- The Sad melody lasts 3 seconds, longer than the two-second messages. The hat block is busy until the melody ends; for the same hat block, at most 3 messages wait in the queue.\n- Because the cards run the same program, you only need to change the program once. When you press ▶, both cards run the new program.\n\n### Try it\n1. Make the **B** button show the temperature; if the temperature is above 35 °C, a **surprised face** appears on the screen.\n2. You cannot make the radio group different on one card (the program is the same), but you can make it 5 with the **Card 2 group** selector in the Radio section. Do Card 1's messages reach Card 2?\n3. Measure the light too: in the dark (light below 50), do not send the message.\n4. Choose your own threshold and put it into a variable (**esik**, \"threshold\"); you should only need to change it in one place in the program.\n\n### Common mistakes\n- **Writing the message name differently.** If the sender writes **nem** and the receiver **Nem**, they do not come out equal. Write it exactly the same, letter for letter.\n- **Measuring the moisture again on the receiving card.** When a message arrives, use **received [value]**. If you read from its own P1, you see its own state, not the state of the other pot.\n- **Leaving the bar graph's largest value at 1023.** Because the moisture is now a percentage, it must be **100**.\n- **Not setting the variables in on start.** Do not leave **uzak** empty before the first message.\n\n### Assess yourself\n- Which group of blocks did you use most in this project?\n- Which part did you get stuck on? How did you solve it?\n- If you explained the program to a friend, which three sentences would you say?",
            "question": "What was the best thing you made in this project? What would your next Micro Card project be: a game, a home alarm or a musical instrument? Who would you share it with?",
            "explainerMd": "### What you will learn in this lesson\n- How to plan a project as a flow before coding it\n- How to set up two cards that watch each other's readings by radio\n- How to use the value that **arrives** in a received message, not your **own** reading\n- How to put the parts you learnt in earlier weeks together in one program\n\n### What you should know first\n- Lesson 7: variables\n- Lesson 8: **if ... then ... else**\n- Lesson 12: **bar graph**\n- Lesson 18: **play melody**\n- Lessons 21 and 22: radio group, **radio send [name] = [value]**, **received [name]**, **received [value]**\n- Lesson 29: **map** and the moisture threshold\n\n### Plan first\nInstead of starting a big project with blocks, write the flow on paper. There are four jobs in this project:\n\n| Hat block | When does it run? | What does it do? |\n|---|---|---|\n| on start | once | sets the radio group and the variables |\n| every 2000 ms | every two seconds | measures the moisture and sends it by radio |\n| button A | when A is pressed | shows its own moisture |\n| on radio received | when a message arrives | shows the state of the other pot |\n\nEvery row of the plan is one hat block. Once you have made the plan, the rest of the job is putting the blocks in place.\n\n### Sender and receiver\nThe two cards run the same program. Each card both sends and receives. A card does not receive its own message; only the other card's message comes to it. That is why you should not take a measurement on the receiving card. When a message arrives, use the **received [value]** block; that is the other pot's moisture. If the receiving card reads its own P1, it shows its own moisture, and the project does not reach its goal.\n\n### The name must match\nThe sender sends with the name \"nem\", and the receiver looks for the name \"nem\". Capital and small letters make a difference; \"Nem\" and \"nem\" count as different. In projects that use more than one name, this check filters out the wrong messages.\n\n### Timing\nMessages arrive every 2 seconds. The Sad melody lasts 3 seconds. The hat block is busy while the melody plays; at most 3 of the messages that arrive wait in the queue. Knowing this helps you understand why some messages do not show up on the screen straight away.\n\nIf Card 1's moisture is 50 and the largest value is 100, the bar graph lights 13 LEDs. If the largest value had been left at 1023, you would get 50 / 1023 x 25 = 1.2, and only 1 LED would light; so the largest value is the number that sets the scale.\n\n### Summary\nA good project is a plan first. Each hat block does one job. On the radio, the receiving side uses the value that arrives, not its own sensor. Message names must match exactly. Long jobs such as a melody make the messages that arrive join a queue. The bar graph's largest value must fit the measuring range.",
            "concepts": [
              {
                "term": "Flow plan",
                "definition": "A list, written before coding, of which hat block runs when and what it does.",
                "example": "Every 2 seconds measure and send; A: show; when a message arrives: react.",
                "pitfall": "Starting without a plan: blocks end up in the wrong hat block."
              },
              {
                "term": "Radio group",
                "definition": "The cards need to be in the group with the same number; only cards in the same group hear each other.",
                "example": "Both cards set the radio group to 7.",
                "pitfall": "Staying in different groups: the messages never arrive."
              },
              {
                "term": "Sender and receiver",
                "definition": "The sender sends its own reading; the receiver uses the value that arrives.",
                "example": "On the receiving card, the received value is put into the uzak variable.",
                "pitfall": "Reading its own P1 on the receiving card: you see yourself, not the other pot."
              },
              {
                "term": "Message name",
                "definition": "The name in the name = value pair of a radio message.",
                "example": "The sender sends \"nem\", and the receiver checks received name = \"nem\".",
                "pitfall": "The difference between capital and small letters: \"Nem\" and \"nem\" do not count as equal."
              },
              {
                "term": "The largest value sets the scale",
                "definition": "The bar graph's largest value must fit the measuring range.",
                "example": "Because the moisture is a percentage, the largest value is 100.",
                "pitfall": "Leaving the largest value at 1023: when the moisture is 50, only 1 LED lights."
              }
            ],
            "quiz": [
              {
                "id": "m10h6d30-q1",
                "kind": "mcq",
                "prompt": "Two cards are in the same group and run the same program. When Card 1 sends a message, who receives it?",
                "options": [
                  "Only Card 2 receives it",
                  "Card 1 and Card 2 receive it",
                  "Nobody receives it",
                  "All the cards in the group and the sender receive it"
                ],
                "answer": 0,
                "explanation": "A card does not receive its own message; the message only goes to the other card. That is why each card sees the state of the other pot.",
                "skills": [
                  "mk-radio"
                ]
              },
              {
                "id": "m10h6d30-q2",
                "kind": "find-bug",
                "prompt": "The receiving card does not show a sad face even though the other pot is dry, because its own P1 input value is high. Which is the mistake?\n\n```\non radio received:\n  if received name = \"nem\" then:\n    set uzak to (map [analog read P1] 0-1023 -> 0-100)\n    if uzak < 30 then:\n      show icon [sad face]\n```",
                "options": [
                  "The threshold should be 300, not 30",
                  "The uzak value is read not from the received value but from the receiving card's own P1 pin",
                  "There is no sad face icon",
                  "received value should be written instead of received name"
                ],
                "answer": 1,
                "explanation": "When a message arrives, the received [value] block is used; that is the other pot's moisture. Reading P1 gives the receiving card's own moisture. The threshold and the icon are correct.",
                "skills": [
                  "mk-radio",
                  "mk-debug"
                ]
              },
              {
                "id": "m10h6d30-q3",
                "kind": "numeric",
                "prompt": "Card 2's P1 input slider is at 150. Card 2 maps 0-1023 to 0-100 and sends the moisture by radio. Which moisture value does Card 1 receive?",
                "answer": 15,
                "unit": "%",
                "explanation": "150 x 100 / 1023 = 14.66, which rounds to 15. Rounding down and writing 14, or writing 150, would be wrong.",
                "skills": [
                  "mk-sensors",
                  "mk-radio"
                ]
              },
              {
                "id": "m10h6d30-q4",
                "kind": "predict-output",
                "prompt": "The receiving card runs this program. The messages arrive in this order: nem = 50, nem = 28, sicak = 12, nem = 30. How many times is the sad face shown?\n\n```\non radio received:\n  if received name = \"nem\" then:\n    set uzak to (received value)\n    if uzak < 30 then:\n      sad face and the Sad melody\n    else:\n      bar graph [uzak] up to [100]\n```",
                "options": [
                  "0 times",
                  "1 time",
                  "2 times",
                  "3 times"
                ],
                "answer": 1,
                "explanation": "Only nem = 28 both matches the name and is below 30. For nem = 30, 30 < 30 is false, so it goes to the else branch (bar graph); sicak = 12 is not handled at all, because its name does not match.",
                "skills": [
                  "mk-radio",
                  "mk-conditions"
                ]
              },
              {
                "id": "m10h6d30-q5",
                "kind": "numeric",
                "prompt": "The moisture is 50 as a percentage, but the bar graph's largest value has been left at 1023 by mistake. How many LEDs light up?",
                "answer": 1,
                "unit": "LEDs",
                "explanation": "50 / 1023 x 25 = 1.22, which rounds to 1 LED lighting up. If the largest value were 100, 13 LEDs would light. The scale must fit the measured range.",
                "skills": [
                  "mk-display",
                  "mk-debug"
                ]
              }
            ]
          }
        }
      ]
    }
  ]
}
