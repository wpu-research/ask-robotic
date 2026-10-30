// OTOMATİK ÜRETİLDİ — elle düzenleme. Kaynak: content-src/modul-11/ · Komut: node tools/content/build.mjs modul-11
import type { ModuleContent } from './types'

export const modul11: ModuleContent = {
  "slug": "oyun-atolyesi",
  "title": "Oyun Atölyesi",
  "track": "maker",
  "position": 11,
  "minAge": 8,
  "weeks": [
    {
      "title": "İlk oyunum",
      "project": "Gezgin kedi",
      "guideMd": "### Hafta hedefleri\nBu haftanın sonunda öğrenci:\n1. Sahne, sprite, tür ve değişkenin ne olduğunu söyleyebilir; x ve y koordinatlarıyla bir sprite'ı sahnede istediği yere koyabilir.\n2. Bir sprite'ı ok tuşlarıyla yürütebilir, hızı seçebilir ve sprite'ı ekranda tutabilir.\n3. Düğme olaylarıyla (A, B, yön tuşları) sprite'ın resmini, yönünü ve konuşmasını değiştirebilir.\n4. Bir sprite'a hız verip kenarlardan sektirebilir; derece ile yön verebilir.\n5. Küçük bir oyunu hedef listesine bölerek kurabilir, ses ve patlama gibi geri bildirimler ekleyebilir.\n\n### Haftanın planı\nHafta beş derstir. Aşağıdaki plan günde bir ders içindir. Her etkinlik Oyun Atölyesi'nde, sanal sahnede yapılır; kamera, kit ya da kâğıt gerekmez.\n\n| Gün | Ders | Süre | Ne yapılır |\n|---|---|---|---|\n| 1 | Sahneni kur: renk, kedi ve elma | ~20 dk | Anlatımı oku, kediyi ve elmayı sahneye koy, x ve y değerlerini değiştirip sonucu gör, mini testi çöz. |\n| 2 | Kediyi ok tuşlarıyla yürüt | ~20 dk | Tuşla hareket bloğunu kur, hızı dene, ekranda kalsın ayarını ekle. |\n| 3 | A düğmesine basınca değiş ve konuş | ~20 dk | Düğme olaylarını yaz; resim, yön ve konuşma bloklarını dene. |\n| 4 | Sekip duran top | ~20 dk | Hız ver, sekmeyi aç, çimen döşe, dereceyle yön ver. |\n| 5 | Proje: Gezgin kedi | ~30 dk | Yedi hedefi tek tek yap, A ve B yeteneklerini ekle, kendi dokunuşunu kat. |\n\n### Ön koşul kontrolü\nBu hafta özel bir bilgi gerekmez. Başlamadan önce şunları kontrol et:\n- Tarayıcıda Oyun Atölyesi açılıyor mu ve sahnenin altındaki başlat, durdur, baştan başlat düğmeleri çalışıyor mu?\n- Öğrenci fareyle blok sürükleyip birbirine takabiliyor mu?\n- Sayıları karşılaştırabiliyor mu? (Hangisi büyük, hangisi küçük? Eksi sayı nedir?)\n- Çarpma ve toplama (hız x süre) yapabiliyor mu? Ders 2 ve 4 bunu kullanır.\n\n### Kavram haritası\n- **Sahne:** sahne (160 x 120) → sprite → konum (x, y) → tür → değişken\n- **Girdi:** denetleyici → tuşla hareket → hareket biçimi → ekranda kalsın → olay (basılınca, bırakılınca)\n- **Hareket:** hız (x hızı, y hızı) → eksi ve artı → sekme → yön (derece) → döşenmiş arka plan\n- **Sprite eylemleri:** resim değiştirme → yön (sağa/sola baksın) → konuşma balonu\n- **Proje:** hedef listesi → çalıştır, dene, düzelt → geri bildirim (patlama, sarsıntı, ses)\n\n### Sık yapılan hatalar\n- **Blokları `oyun başlayınca` bloğuna bağlamamak.** Bağlı olmayan blok hiç çalışmaz.\n- **Değişiklikten sonra baştan başlatmamak.** Sahne eski hâliyle çalışır; ↺ düğmesine bas.\n- **y'nin yukarı doğru arttığını sanmak.** y aşağı doğru artar; yukarı çıkmak için y'yi küçült.\n- **`bu sprite` kullanmak.** En son oluşturulan sprite etkilenir; her sprite için ayrı değişken adı ver.\n- **İki sprite için aynı değişken adı vermek.** İlk sprite'a bir daha ulaşılamaz.\n- **Ekranda kalsın ayarını unutmak.** Sprite ekrandan çıkıp görünmez olur.\n- **Hareket biçimini yanlış seçmek.** Sağa-sola seçiliyken yukarı tuşu işe yaramaz; bu hata değildir.\n- **Derecede yukarı için 90 yazmak.** Yukarı 0, sağ 90, aşağı 180, sol 270'tir.\n- **Sekme ayarını açmamak.** Top kenardan çıkar, bir daha görünmez.\n- **Peş peşe nota koyup sıralı çalacağını sanmak.** Ses blokları birbirini beklemez; hepsi aynı anda çalar.\n\n### Hafta sonu tekrarı\n1. Her dersin kavram kartlarına bir kez daha bak ve \"sık yapılan yanlış\" satırlarını yüksek sesle oku.\n2. Mini testlerde yanlış yaptığın soruların açıklamalarını yeniden oku, sonra soruyu yeniden çöz.\n3. Sahneyi baştan, bakmadan kur: mavi fon, kedi sol alta, elma sağ üste. x ve y değerlerini önce kâğıda yaz, sonra dene.\n4. Kediyi önce hız 40, sonra hız 120 ile yürüt. 2 saniyede kaç piksel gittiğini hesapla ve gözle karşılaştır.\n5. Kendi cümlelerinle şu soruyu cevapla: \"Tuşla hareket ile düğme olayı arasındaki fark nedir?\"\n\nHafta sonu testi olarak beş dersin mini testleri yeterlidir; her derste 5 soru, toplam 25 soru. Hedef: her dersten en az 4 doğru. Eksik kalan dersin anlatımına dön.\n\n### Proje değerlendirme ölçütü (Gezgin kedi)\n| Ölçüt | Gelişmeli | Yeterli | İleri |\n|---|---|---|---|\n| Sahne ve hareket | Kedi yürümüyor ya da ekrandan çıkıyor | Kedi yürüyor, ekranda kalıyor, yıldız sekiyor, zemin döşeli | Hızlar oyuna uygun seçilmiş ve nedeni anlatılabiliyor |\n| Olaylar | A ve B olaylarından biri çalışmıyor | A'da konuşma ve melodi, B'de patlama ve ses çalışıyor | Olaylara kendi fikirlerinden en az iki yetenek eklenmiş |\n| Hedefler | Yeşil olan hedef sayısı yarıdan az | Yedi hedefin hepsi yeşil | Hedefler bozulmadan ek yetenekler konmuş |\n| Düzen | Bloklar dağınık, değişken adları karışık | Her sprite'ın kendi değişkeni var, bloklar düzenli | Bloklar gruplanmış, ne yaptığı anlatılabiliyor |\n| Anlatım | Ne yaptığını anlatamıyor | Oyunun nasıl çalıştığını adım adım anlatıyor | Bir hatayı nasıl bulup düzelttiğini anlatıyor |\n\n### Veli ve öğretmen notu\n- **Amaç.** Bu hafta çocuğun \"bilgisayara söz geçirebildiğini\" görmesi hedeflenir. İlk oyun küçük ama çalışan bir oyundur. Bloklarla programlama, yazım hatası korkusu olmadan mantığı öğretir.\n- **Nasıl destek olunur?** Takıldığında cevabı söylemek yerine şu soruları sor: \"Bu blok hangi olayın altında?\", \"Önce hangi blok çalışıyor?\", \"Sahneyi baştan başlattın mı?\"\n- **Süre.** Dersleri aynı gün peş peşe yapmak yerine aralıklı çalışmak kalıcılığı artırır. Etkinlik biter bitmez çocuğun oyunu size göstermesini isteyin; anlatmak en iyi tekrardır.\n- **Merak ve yaratıcılık.** \"Dene\" bölümlerindeki serbest denemeler zorunlu değildir ama en çok öğrenmenin yaşandığı yerlerdir. Sprite'ın resmini ve zeminini değiştirmek çocuğa oyunun kendisine ait olduğunu hissettirir.\n- **Güvenlik.** Bu platformdaki her şey sanaldır; kişisel bilgi girilmez. Oyunları paylaşırken isim ve fotoğraf kullanmayın.\n- **İlerleme.** Mini test sonuçları \"İlerlemem\" sayfasında beceri bazında görünür (taslak/pilot özellik; yalnız onay verildiyse kaydedilir).",
      "guideMdEn": "### Week goals\nBy the end of this week the learner:\n1. Can say what a stage, a sprite, a kind and a variable are; can put a sprite wherever they want on the stage with x and y coordinates.\n2. Can walk a sprite with the arrow keys, choose its speed and keep the sprite on the screen.\n3. Can change a sprite's picture, direction and speech with button events (A, B, direction keys).\n4. Can give a sprite a speed and bounce it off the edges; can give a direction in degrees.\n5. Can build a small game by splitting it into a goal list, and add feedback such as sound and explosions.\n\n### Plan for the week\nThe week has five lessons. The plan below is for one lesson a day. Every activity happens in the Game Workshop, on the virtual stage; no camera, kit or paper is needed.\n\n| Day | Lesson | Time | What you do |\n|---|---|---|---|\n| 1 | Set up your stage: colour, cat and apple | ~20 min | Read the explainer, put the cat and the apple on the stage, change the x and y values and see the result, do the mini quiz. |\n| 2 | Walk the cat with the arrow keys | ~20 min | Build the key movement block, try the speed, add the stay on screen setting. |\n| 3 | Change and talk when you press the A button | ~20 min | Write the button events; try the picture, direction and talking blocks. |\n| 4 | The ball that keeps bouncing | ~20 min | Give a speed, turn on bounce, tile with grass, give a direction in degrees. |\n| 5 | Project: The wandering cat | ~30 min | Do the seven goals one at a time, add the A and B abilities, add your own touch. |\n\n### Prerequisite check\nNo special knowledge is needed this week. Before you start, check the following:\n- Does the Game Workshop open in the browser, and do the start, stop and restart buttons under the stage work?\n- Can the learner drag blocks with the mouse and snap them together?\n- Can they compare numbers? (Which is bigger, which is smaller? What is a minus number?)\n- Can they multiply and add (speed x time)? Lessons 2 and 4 use this.\n\n### Concept map\n- **Stage:** stage (160 x 120) → sprite → position (x, y) → kind → variable\n- **Input:** controller → key movement → way of moving → stay on screen → event (pressed, released)\n- **Movement:** speed (x speed, y speed) → minus and plus → bounce → direction (degrees) → tiled background\n- **Sprite actions:** changing the picture → direction (faces right/left) → speech bubble\n- **Project:** goal list → run, try, fix → feedback (explosion, shake, sound)\n\n### Common mistakes\n- **Not connecting blocks to the `when game starts` block.** A block that is not connected never runs.\n- **Not restarting after a change.** The stage runs the old version; press the ↺ button.\n- **Thinking y grows upwards.** y grows downwards; to go up, make y smaller.\n- **Using `this sprite`.** The sprite made last is affected; give each sprite its own variable name.\n- **Giving two sprites the same variable name.** The first sprite can never be reached again.\n- **Forgetting the stay on screen setting.** The sprite leaves the screen and cannot be seen.\n- **Choosing the wrong way of moving.** With left-right chosen, the up key does nothing; this is not a bug.\n- **Writing 90 for up in degrees.** Up is 0, right 90, down 180, left 270.\n- **Not turning on the bounce setting.** The ball goes out through the edge and is never seen again.\n- **Putting notes one after another and expecting them to play in order.** Sound blocks do not wait for each other; they all play at the same time.\n\n### End-of-week review\n1. Look at each lesson's concept cards once more and read the \"common mistake\" lines out loud.\n2. Read again the explanations of the questions you got wrong in the mini quizzes, then do the question again.\n3. Set up the stage again from scratch, without looking: blue background, cat at the bottom left, apple at the top right. Write the x and y values on paper first, then try them.\n4. Walk the cat first with speed 40, then with speed 120. Work out how many pixels it goes in 2 seconds and compare with what you see.\n5. Answer this question in your own words: \"What is the difference between key movement and a button event?\"\n\nThe five lessons' mini quizzes are enough as an end-of-week test; 5 questions in each lesson, 25 questions in total. Target: at least 4 right in each lesson. Go back to the explainer of any lesson that falls short.\n\n### Project assessment rubric (The wandering cat)\n| Criterion | Developing | Secure | Advanced |\n|---|---|---|---|\n| Stage and movement | The cat does not walk or it leaves the screen | The cat walks and stays on the screen, the star bounces, the floor is tiled | The speeds are chosen to suit the game and the learner can explain why |\n| Events | One of the A and B events does not work | Talking and the melody work on A, the explosion and sound on B | At least two abilities of their own have been added to the events |\n| Goals | Fewer than half of the goals are green | All seven goals are green | Extra abilities have been added without breaking the goals |\n| Organisation | The blocks are messy and the variable names are mixed up | Each sprite has its own variable and the blocks are tidy | The blocks are grouped and the learner can explain what they do |\n| Explanation | Cannot explain what they did | Explains step by step how the game works | Explains how they found and fixed a bug |\n\n### Note for parents and teachers\n- **Aim.** This week the aim is for the child to see that they \"can make the computer do what they say\". The first game is small, but it is a working game. Programming with blocks teaches logic without the fear of typing mistakes.\n- **How to help.** When they get stuck, instead of giving the answer, ask these questions: \"Which event is this block under?\", \"Which block runs first?\", \"Did you restart the stage?\"\n- **Time.** Spacing the lessons out, instead of doing them one after another on the same day, helps learning stick. As soon as the activity is finished, ask the child to show you the game; explaining is the best review.\n- **Curiosity and creativity.** The free experiments in the \"Try it\" sections are not compulsory, but they are where most of the learning happens. Changing the sprite's picture and floor makes the child feel that the game is their own.\n- **Safety.** Everything on this platform is virtual; no personal information is entered. When sharing games, do not use names or photos.\n- **Progress.** Mini quiz results appear skill by skill on the \"My progress\" page (a draft/pilot feature; recorded only if consent has been given).",
      "lessons": [
        {
          "title": "Sahneni kur: renk, kedi ve elma",
          "durationMin": 20,
          "problem": "Her oyun boş bir sahneyle başlar. Perde açılmadan önce dekoru kuran bir tiyatro ekibi gibi, oyun başlamadan önce oyuncuları sahneye sen yerleştirirsin. Ekran 160 piksel geniş ve 120 piksel yüksek. Bir kediyi sol tarafa, bir elmayı sağ tarafa koymak için bilgisayara hangi sayıları söylemelisin?",
          "contentMd": "Bu etkinlik tamamen Oyun Atölyesi'nde, sanal sahnede yapılır. Kamera, kit ya da kâğıt gerekmez.\n\n### Atölyeyi tanı\n- **Sol tarafta sahne** var. Oyun burada oynanır. Sahnenin altındaki ▶ düğmesi oyunu başlatır, ■ durdurur, ↺ baştan başlatır.\n- Sahnenin altında **Hedefler** listesi var. Her hedef yapılınca yeşile döner. Hepsi yeşil olunca etkinlik tamamdır.\n- **Sağ tarafta sekmeler** var: Bloklar, JavaScript, Resimler ve Harita. Bu derste yalnız **Bloklar** sekmesini kullanacaksın.\n- Blokların kutusu, çalışma alanının solunda renkli kategoriler olarak durur. Bu derste şu kategoriler açık: Sprite, Oyun, Sahne / Harita, Değişken ve Matematik.\n\n### Üç yeni kavram\n- **Sprite:** Sahnedeki bir oyuncu ya da nesne. Kedi bir sprite'tır, elma da.\n- **Konum:** Her sprite'ın bir x ve bir y sayısı vardır. x soldan sağa, y yukarıdan aşağı sayılır. Sol üst köşe x 0, y 0 noktasıdır. Ekranın ortası x 80, y 60 noktasıdır.\n- **Tür:** Her sprite'ın bir türü vardır (Oyuncu, Düşman, Yiyecek gibi). İleride \"Oyuncu, Yiyecek'e çarpınca ne olsun?\" diye soracağız. Bunu tür sayesinde söyleyebileceğiz.\n\n### Blokları kur\n1. Çalışma alanında `oyun başlayınca` bloğu hazır. Bu blok, oyun başlar başlamaz altındaki blokları sırayla çalıştırır. Bütün bloklarını bunun altına takacaksın.\n2. **Sahne / Harita** kategorisinden `arka plan rengi [renk]` bloğunu sürükleyip `oyun başlayınca` bloğunun altına tak. Renk karesine tıkla ve açık mavi (gök) rengi seç.\n3. **Değişken** kategorisini aç ve **Değişken oluştur...** düğmesine bas. Adına `kedi` yaz. Sonra çıkan `[kedi] değişkenini [ ] yap` bloğunu arka plan bloğunun altına tak.\n4. **Sprite** kategorisinden `yeni [resim] sprite'ı, türü [tür]` bloğunu al ve değişken bloğunun boş yuvasına tak. Resim listesinden **Kedi**'yi, türden **Oyuncu**'yu seç.\n5. Kediyi yerleştir. **Sprite** kategorisinden `[bu sprite] konumu x [80] y [60]` bloğunu alta ekle. İçindeki `bu sprite` yerine **Değişken** kategorisindeki `kedi` bloğunu sürükle. x için 40, y için 80 yaz.\n6. Aynı işi elma için tekrarla: `elma` adında yeni bir değişken oluştur. Ona `yeni [resim] sprite'ı, türü [tür]` bloğunu bağla (resim **Elma**, tür **Yiyecek**). Sonra elmanın konumunu x 120, y 80 yap.\n7. ▶ düğmesine bas. Sahnede açık mavi bir fon, solda kedi, sağda elma görmelisin.\n\nBeklenen sonuç: Sahne mavi, kedi solda, elma sağda. Dört hedefin hepsi yeşil.\n\n### Nasıl çalışıyor?\n- Bloklar yukarıdan aşağıya, sırayla çalışır. Oyun başlayınca önce renk değişir, sonra kedi doğar ve yerine gider, sonra elma.\n- **Değişken**, bir şeye verdiğin ad etiketidir. `[kedi] değişkenini [...] yap` demek \"yeni sprite'a kedi diyeceğim\" demektir. Sonra `kedi` bloğunu nereye koyarsan o sprite'ı gösterir.\n- Konum, sprite'ın **merkezini** gösterir. Kedi 16 piksel geniş olduğundan x 40 verdiğinde kedinin ortası 40'ta olur.\n- `bu sprite` en son oluşturduğun sprite demektir. İki sprite'ın olduğu yerde karışmasın diye her sprite'a bir değişken adı veriyoruz.\n\n### Dene\n1. Kedinin y değerini 20 yap. Kedi yukarı çıkıyor mu? ▶ yerine ↺ düğmesiyle baştan başlat.\n2. Başka bir arka plan rengi seç ve oyunu yeniden başlat.\n3. Üçüncü bir sprite ekle: `portakal` adında değişken, resim **Portakal**, tür **Yiyecek**. Onu kedi ile elmanın arasına koy.\n\n### Sık yapılan hatalar\n- Bloklar `oyun başlayınca` bloğunun altına takılı değilse hiç çalışmaz. Blokların birbirine yapıştığından emin ol.\n- Blokları değiştirdikten sonra sahne eski hâliyle kalır. Yeni hâlini görmek için ↺ düğmesine bas.\n- İki sprite için aynı değişken adını kullanma. Aynı değişkene ikinci kez sprite koyarsan değişken yeni sprite'ı gösterir ve ilkine bir daha ulaşamazsın.\n- Resim listesinde \"(resim yok)\" yazıyorsa Resimler sekmesine geç, **Galeri** düğmesine bas ve istediğin resme tıkla. Resim projene eklenir.",
          "question": "Kedi ile elmanın x değerleri neden farklı, ama y değerleri aynı? Bir elmayı kedinin tam üstüne koymak istersen hangi sayıları değiştirirdin?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Bir oyunun sahnesinin ve sprite'ın ne olduğunu\n- Ekrandaki bir noktayı iki sayıyla (x ve y) nasıl göstereceğini\n- Bir sprite'a **tür** vermenin neden işe yaradığını\n- Değişkenin, bir sprite'a verilen ad etiketi olduğunu\n- Blokların yukarıdan aşağıya, sırayla çalıştığını\n\n### Önceden bilmen gerekenler\nHiçbir şey. Bu ders sıfırdan başlar. Yalnızca fareyle blok sürükleyebilmen yeter.\n\n### Sahne ve sprite\nHer oyun bir **sahnede** oynanır. Sahne, oyunun ekranıdır: Oyun Atölyesi'nde 160 piksel geniş, 120 piksel yüksektir. **Piksel**, ekranın en küçük renkli karesidir. Sahnedeki her oyuncu ya da nesneye **sprite** denir. Kedi bir sprite'tır, elma da, düşman da.\n\nSahneyi bir tiyatro sahnesi gibi düşün. Önce dekor kurulur (arka plan rengi), sonra oyuncular yerlerine geçer (sprite'lar).\n\n### Konum: x ve y\nBir sprite'ın yerini iki sayı söyler. Bunlara **koordinat** denir.\n\n| Sayı | Nereyi gösterir | Büyürse |\n|---|---|---|\n| x | soldan uzaklık | sprite sağa gider |\n| y | yukarıdan uzaklık | sprite aşağı gider |\n\nSol üst köşe x 0, y 0 noktasıdır. Ekranın ortası x 80, y 60 noktasıdır. Sağ alt köşe yaklaşık x 160, y 120 noktasıdır. Dikkat: y yukarı doğru değil, aşağı doğru artar. Matematik dersindeki grafiklerin tersidir.\n\nŞematik gösterim:\n\n```\nx: 0 ----------- 80 ----------- 160\ny=0    sol üst                  sağ üst\ny=60               orta\ny=120  sol alt                  sağ alt\n```\n\nKonum, sprite'ın **merkezini** gösterir. Kediyi x 40 y 80 noktasına koyarsan kedinin ortası orada olur.\n\n### Tür ve değişken\nHer sprite'ın bir **türü** vardır: Oyuncu, Düşman, Yiyecek gibi. Tür, sprite'ın oyundaki rolünü belirler. İleride \"Oyuncu, Yiyecek'e çarpınca puan ver\" diyebilmen için bilgisayarın hangisinin oyuncu, hangisinin yiyecek olduğunu bilmesi gerekir.\n\nSprite oluşturan blok sprite'ı sahneye koyar, ama ona ad vermez. Sonra ona ulaşmak için bir **değişken** kullanırız. Değişken, bir şeyin üstüne yapıştırılmış ad etiketidir. `kedi` değişkenine bir sprite koyduktan sonra `kedi` yazdığın her yerde o sprite'ı kastedersin.\n\nKüçük bir örnek (blokların metin hâli):\n\n```\noyun başlayınca\n  arka plan rengi: gök\n  kedi = yeni Kedi sprite'ı, türü Oyuncu\n  kedi konumu x 40 y 80\n  elma = yeni Elma sprite'ı, türü Yiyecek\n  elma konumu x 120 y 80\n```\n\n### Sıra önemlidir\n`oyun başlayınca` bloğunun altındaki bloklar yukarıdan aşağıya, tek tek çalışır. Önce sprite oluşturulur, sonra yerine konur. Sırayı bozarsan olmayan bir şeye komut vermiş olursun. Bir blok bu olay bloğuna bağlı değilse hiç çalışmaz.\n\n`bu sprite` bloğu en son oluşturulan sprite'ı gösterir. İki sprite varken karışıklık çıkmasın diye her sprite için ayrı değişken kullan.\n\n### Özet\nSahne 160 x 120 pikseldir. Sprite sahnedeki oyuncudur, yeri x (soldan) ve y (yukarıdan) sayılarıyla verilir; y aşağı doğru artar. Türü, sprite'ın rolünü söyler. Değişken, sprite'a verdiğin addır. Bloklar sırayla çalışır ve hepsi `oyun başlayınca` bloğuna bağlanmalıdır.",
          "concepts": [
            {
              "term": "Sahne",
              "definition": "Oyunun oynandığı ekran. Oyun Atölyesi'nde 160 piksel geniş ve 120 piksel yüksektir.",
              "example": "Arka plan rengini gök mavisi yaparak sahnenin zeminini kurarsın.",
              "pitfall": "Blokları değiştirdikten sonra sahnenin kendiliğinden güncellendiğini sanmak; yeni hâlini görmek için oyunu baştan başlatman gerekir."
            },
            {
              "term": "Sprite",
              "definition": "Sahnedeki bir oyuncu ya da nesne; kendi resmi, konumu ve türü vardır.",
              "example": "Kedi bir sprite'tır, elma da; ikisi birbirinden bağımsız hareket edebilir.",
              "pitfall": "Konumun sprite'ın sol üst köşesini gösterdiğini sanmak; konum sprite'ın merkezini gösterir."
            },
            {
              "term": "Koordinat (x ve y)",
              "definition": "Sahnedeki bir noktayı gösteren iki sayı: x soldan, y yukarıdan uzaklıktır.",
              "example": "Sol üst köşe x 0 y 0, ekranın ortası x 80 y 60 noktasıdır.",
              "pitfall": "y büyüdükçe sprite'ın yukarı çıkacağını sanmak; y aşağı doğru artar."
            },
            {
              "term": "Tür",
              "definition": "Sprite'ın oyundaki rolü: Oyuncu, Düşman, Yiyecek gibi.",
              "example": "Elmayı Yiyecek türünde oluşturursan sonra \"Oyuncu, Yiyecek'e çarpınca\" kuralını yazabilirsin.",
              "pitfall": "Türü resimle aynı şey sanmak; Elma resmini Düşman türünde de oluşturabilirsin."
            },
            {
              "term": "Değişken",
              "definition": "Bir sprite'a ya da değere verdiğin ad etiketi; sonra o adla ona ulaşırsın.",
              "example": "kedi değişkenine yeni bir sprite koyunca, kedi bloğu o sprite'ı gösterir.",
              "pitfall": "İki sprite için aynı değişken adını kullanmak; değişken yeni sprite'ı gösterir ve ilkine bir daha ulaşamazsın."
            }
          ],
          "quiz": [
            {
              "id": "m11h1d1-q1",
              "kind": "mcq",
              "prompt": "Sahnede bir sprite'ın y değerini büyütürsen sprite ne yapar?",
              "options": [
                "Yukarı çıkar",
                "Sağa gider",
                "Aşağı iner",
                "Büyür"
              ],
              "answer": 2,
              "explanation": "y, yukarıdan uzaklıktır ve aşağı doğru artar. x değeri büyüyünce sprite sağa gider. Yukarı çıkmak için y'yi küçültürsün. Sprite'ın boyutunu ne x ne y değiştirir.",
              "skills": [
                "game-coords"
              ]
            },
            {
              "id": "m11h1d1-q2",
              "kind": "predict-output",
              "prompt": "Bu bloklar çalışınca sahnede ne görürsün?\n\n```\noyun başlayınca\n  kedi = yeni Kedi sprite'ı, türü Oyuncu\n  kedi konumu x 40 y 80\n  elma = yeni Elma sprite'ı, türü Yiyecek\n  elma konumu x 120 y 80\n```",
              "options": [
                "Elma kedinin solunda",
                "Elma kedinin sağında, aynı yükseklikte",
                "Elma kedinin tam üstünde",
                "Elma kedinin altında, aynı hizada"
              ],
              "answer": 1,
              "explanation": "Elmanın x değeri (120) kedininkinden (40) büyük, yani elma sağdadır. İki sprite'ın y değeri de 80 olduğu için aynı yüksekliktedirler. Elmanın kedinin üstünde olması için x değerlerinin aynı, y değerlerinin farklı olması gerekirdi.",
              "skills": [
                "game-coords",
                "game-sprite"
              ]
            },
            {
              "id": "m11h1d1-q3",
              "kind": "find-bug",
              "prompt": "Kedi x 40 y 80 noktasına gitmeli, ama sahnenin ortasında (x 80 y 60) kalıyor. Hata hangisi?\n\n```\n1  oyun başlayınca\n2    kedi = yeni Kedi sprite'ı, türü Oyuncu\n3    elma = yeni Elma sprite'ı, türü Yiyecek\n4    bu sprite konumu x 40 y 80\n5    elma konumu x 120 y 80\n```",
              "options": [
                "Satır 2: kedi değişkeni hiç oluşturulmamış",
                "Satır 3: elma, kediden önce oluşturulmalı",
                "Satır 5: elmanın x değeri 120 olamaz",
                "Satır 4: bu sprite en son oluşturulan sprite'tır, yani elmadır; kedi için kedi değişkeni kullanılmalı"
              ],
              "answer": 3,
              "explanation": "Yeni sprite'lar sahnenin ortasında doğar. Satır 4'teki bu sprite, en son oluşturulan sprite olan elmayı gösterir; kedi hiç yerleştirilmez. Satır 5 elmayı zaten ikinci kez yerleştirir. Doğrusu, satır 4'te bu sprite yerine kedi değişkenini kullanmaktır.",
              "skills": [
                "game-debug",
                "game-sprite"
              ]
            },
            {
              "id": "m11h1d1-q4",
              "kind": "numeric",
              "prompt": "Kedi x 40 y 80 noktasında, elma x 120 y 80 noktasında duruyor. Aralarındaki yatay uzaklık kaç pikseldir?",
              "answer": 80,
              "tolerance": 0,
              "unit": "piksel",
              "explanation": "İki sprite aynı yükseklikte olduğu için uzaklık yalnızca x değerlerinin farkıdır: 120 − 40 = 80 piksel. Sahne 160 piksel genişliğinde olduğundan bu, sahnenin yarısı kadardır.",
              "skills": [
                "game-coords"
              ]
            },
            {
              "id": "m11h1d1-q5",
              "kind": "mcq",
              "prompt": "Bir sprite'a tür (Oyuncu, Yiyecek, Düşman) vermenin asıl yararı nedir?",
              "options": [
                "Sonraki derslerde kuralları türlere göre yazabilirsin",
                "Sprite oyunda daha hızlı hareket eder",
                "Sprite'ın rengi türüne göre kendiliğinden değişir",
                "Sprite sahnede daha büyük görünür"
              ],
              "answer": 0,
              "explanation": "Tür, sprite'ın rolünü söyler; hız, renk ya da boyutla ilgisi yoktur. Çarpışma gibi olaylarda bilgisayar hangi sprite'ın oyuncu, hangisinin yiyecek olduğunu türden anlar.",
              "skills": [
                "game-sprite"
              ]
            }
          ],
          "contentEn": {
            "title": "Set up your stage: colour, cat and apple",
            "problem": "Every game starts with an empty stage. Like a theatre crew that builds the set before the curtain opens, you place the players on the stage before the game starts. The screen is 160 pixels wide and 120 pixels high. Which numbers must you tell the computer to put a cat on the left side and an apple on the right side?",
            "contentMd": "This activity happens entirely in the Game Workshop, on the virtual stage. You do not need a camera, a kit or paper.\n\n### Get to know the workshop\n- **On the left is the stage.** The game is played here. Under the stage, the ▶ button starts the game, ■ stops it and ↺ starts it again from the beginning.\n- Under the stage is the **Goals** list. Each goal turns green when it is done. When they are all green, the activity is complete.\n- **On the right are the tabs:** Blocks, JavaScript, Pictures and Map. In this lesson you will only use the **Blocks** tab.\n- The block box sits to the left of the work area as coloured categories. In this lesson these categories are open: Sprite, Game, Stage / Map, Variables and Math.\n\n### Three new ideas\n- **Sprite:** A player or object on the stage. The cat is a sprite, and so is the apple.\n- **Position:** Every sprite has an x number and a y number. x is counted from left to right, y from top to bottom. The top left corner is the point x 0, y 0. The middle of the screen is the point x 80, y 60.\n- **Kind:** Every sprite has a kind (such as Player, Enemy, Food). Later we will ask, \"What should happen when the Player hits the Food?\" The kind is what lets us say this.\n\n### Build the blocks\n1. The `when game starts` block is already in the work area. This block runs the blocks under it in order as soon as the game starts. You will attach all your blocks under it.\n2. From the **Stage / Map** category, drag the `background color [color]` block and attach it under the `when game starts` block. Click the colour square and choose light blue (sky).\n3. Open the **Variables** category and press the **Create variable...** button. Type `kedi` (cat) as its name. Then attach the `set [kedi] to [ ]` block that appears under the background block.\n4. From the **Sprite** category, take the `new [picture] sprite, kind [kind]` block and plug it into the empty slot of the variable block. Choose **Cat** from the picture list and **Player** as the kind.\n5. Place the cat. From the **Sprite** category, add the `move [this sprite] to x [80] y [60]` block underneath. Drag the `kedi` block from the **Variables** category into it, in place of `this sprite`. Type 40 for x and 80 for y.\n6. Repeat the same job for the apple: make a new variable called `elma` (apple). Connect the `new [picture] sprite, kind [kind]` block to it (picture **Apple**, kind **Food**). Then set the apple's position to x 120, y 80.\n7. Press the ▶ button. On the stage you should see a light blue background, the cat on the left and the apple on the right.\n\nExpected result: The stage is blue, the cat is on the left, the apple is on the right. All four goals are green.\n\n### How does it work?\n- Blocks run from top to bottom, in order. When the game starts, first the colour changes, then the cat appears and goes to its place, then the apple.\n- A **variable** is a name label you give to something. Saying `set [kedi] to [...]` means \"I will call the new sprite kedi.\" After that, wherever you put the `kedi` block, it points to that sprite.\n- The position shows the **centre** of the sprite. The cat is 16 pixels wide, so when you give x 40, the middle of the cat is at 40.\n- `this sprite` means the sprite you made last. So that two sprites do not get mixed up, we give each sprite a variable name.\n\n### Try it\n1. Change the cat's y value to 20. Does the cat move up? Start again from the beginning with the ↺ button instead of ▶.\n2. Choose another background colour and restart the game.\n3. Add a third sprite: a variable called `portakal` (orange), picture **Orange**, kind **Food**. Put it between the cat and the apple.\n\n### Common mistakes\n- If the blocks are not attached under the `when game starts` block, they do not run at all. Make sure the blocks are stuck to each other.\n- After you change the blocks, the stage stays as it was. Press the ↺ button to see the new version.\n- Do not use the same variable name for two sprites. If you put a sprite into the same variable a second time, the variable points to the new sprite and you can never reach the first one again.\n- If the picture list says \"(no picture)\", go to the Pictures tab, press the **Gallery** button and click the picture you want. The picture is added to your project.",
            "question": "Why are the x values of the cat and the apple different, but their y values the same? If you wanted to put an apple right above the cat, which numbers would you change?",
            "explainerMd": "### What you will learn in this lesson\n- What a game's stage and a sprite are\n- How to show a point on the screen with two numbers (x and y)\n- Why giving a sprite a **kind** is useful\n- That a variable is a name label given to a sprite\n- That blocks run from top to bottom, in order\n\n### What you should know first\nNothing. This lesson starts from zero. You only need to be able to drag blocks with the mouse.\n\n### Stage and sprite\nEvery game is played on a **stage**. The stage is the game's screen: in the Game Workshop it is 160 pixels wide and 120 pixels high. A **pixel** is the smallest coloured square on the screen. Every player or object on the stage is called a **sprite**. The cat is a sprite, and so are the apple and the enemy.\n\nThink of the stage as a theatre stage. First the set is built (the background colour), then the actors take their places (the sprites).\n\n### Position: x and y\nTwo numbers tell you where a sprite is. They are called **coordinates**.\n\n| Number | What it shows | When it gets bigger |\n|---|---|---|\n| x | distance from the left | the sprite moves right |\n| y | distance from the top | the sprite moves down |\n\nThe top left corner is the point x 0, y 0. The middle of the screen is the point x 80, y 60. The bottom right corner is about x 160, y 120. Watch out: y grows downwards, not upwards. It is the opposite of the graphs in your maths lessons.\n\nA sketch:\n\n```\nx: 0 ----------- 80 ----------- 160\ny=0    top left                 top right\ny=60               middle\ny=120  bottom left              bottom right\n```\n\nThe position shows the **centre** of the sprite. If you put the cat at x 40 y 80, the middle of the cat is there.\n\n### Kind and variable\nEvery sprite has a **kind**: such as Player, Enemy, Food. The kind sets the sprite's role in the game. Later, so that you can say \"give a point when the Player hits the Food\", the computer needs to know which one is the player and which one is the food.\n\nThe block that makes a sprite puts it on the stage, but it does not give it a name. To reach it later, we use a **variable**. A variable is a name label stuck on something. After you put a sprite into the `kedi` (cat) variable, everywhere you write `kedi` you mean that sprite.\n\nA small example (the blocks written as text):\n\n```\nwhen game starts\n  background color: sky\n  kedi = new Cat sprite, kind Player\n  move kedi to x 40 y 80\n  elma = new Apple sprite, kind Food\n  move elma to x 120 y 80\n```\n\n### Order matters\nThe blocks under the `when game starts` block run from top to bottom, one by one. First the sprite is made, then it is put in its place. If you mix up the order, you give a command to something that does not exist. A block that is not connected to this event block does not run at all.\n\nThe `this sprite` block points to the sprite made last. So that there is no mix-up when you have two sprites, use a separate variable for each sprite.\n\n### Summary\nThe stage is 160 x 120 pixels. A sprite is a player on the stage; its place is given by the numbers x (from the left) and y (from the top); y grows downwards. Its kind tells you the sprite's role. A variable is the name you give a sprite. Blocks run in order, and they must all be connected to the `when game starts` block.",
            "concepts": [
              {
                "term": "Stage",
                "definition": "The screen where the game is played. In the Game Workshop it is 160 pixels wide and 120 pixels high.",
                "example": "You set up the floor of the stage by making the background colour sky blue.",
                "pitfall": "Thinking the stage updates by itself after you change the blocks; to see the new version you need to start the game again from the beginning."
              },
              {
                "term": "Sprite",
                "definition": "A player or object on the stage; it has its own picture, position and kind.",
                "example": "The cat is a sprite, and so is the apple; the two can move independently of each other.",
                "pitfall": "Thinking the position shows the sprite's top left corner; the position shows the sprite's centre."
              },
              {
                "term": "Coordinates (x and y)",
                "definition": "Two numbers that show a point on the stage: x is the distance from the left, y the distance from the top.",
                "example": "The top left corner is x 0 y 0, the middle of the screen is the point x 80 y 60.",
                "pitfall": "Thinking the sprite goes up as y gets bigger; y grows downwards."
              },
              {
                "term": "Kind",
                "definition": "The sprite's role in the game: such as Player, Enemy, Food.",
                "example": "If you make the apple with the Food kind, you can later write the rule \"when the Player hits the Food\".",
                "pitfall": "Thinking the kind is the same thing as the picture; you can also make the Apple picture with the Enemy kind."
              },
              {
                "term": "Variable",
                "definition": "A name label you give to a sprite or a value; later you reach it by that name.",
                "example": "When you put a new sprite into the kedi variable, the kedi block points to that sprite.",
                "pitfall": "Using the same variable name for two sprites; the variable points to the new sprite and you can never reach the first one again."
              }
            ],
            "quiz": [
              {
                "id": "m11h1d1-q1",
                "kind": "mcq",
                "prompt": "If you make a sprite's y value bigger on the stage, what does the sprite do?",
                "options": [
                  "It goes up",
                  "It goes right",
                  "It goes down",
                  "It gets bigger"
                ],
                "answer": 2,
                "explanation": "y is the distance from the top and it grows downwards. When the x value gets bigger, the sprite goes right. To go up, you make y smaller. Neither x nor y changes the sprite's size.",
                "skills": [
                  "game-coords"
                ]
              },
              {
                "id": "m11h1d1-q2",
                "kind": "predict-output",
                "prompt": "When these blocks run, what do you see on the stage?\n\n```\nwhen game starts\n  kedi = new Cat sprite, kind Player\n  move kedi to x 40 y 80\n  elma = new Apple sprite, kind Food\n  move elma to x 120 y 80\n```",
                "options": [
                  "The apple is to the left of the cat",
                  "The apple is to the right of the cat, at the same height",
                  "The apple is right above the cat",
                  "The apple is below the cat, in line with it"
                ],
                "answer": 1,
                "explanation": "The apple's x value (120) is bigger than the cat's (40), so the apple is on the right. Both sprites have a y value of 80, so they are at the same height. For the apple to be above the cat, the x values would need to be the same and the y values different.",
                "skills": [
                  "game-coords",
                  "game-sprite"
                ]
              },
              {
                "id": "m11h1d1-q3",
                "kind": "find-bug",
                "prompt": "The cat should go to the point x 40 y 80, but it stays in the middle of the stage (x 80 y 60). Which is the bug?\n\n```\n1  when game starts\n2    kedi = new Cat sprite, kind Player\n3    elma = new Apple sprite, kind Food\n4    move this sprite to x 40 y 80\n5    move elma to x 120 y 80\n```",
                "options": [
                  "Line 2: the kedi variable was never made",
                  "Line 3: the apple must be made before the cat",
                  "Line 5: the apple's x value cannot be 120",
                  "Line 4: this sprite is the sprite made last, which is the apple; the kedi variable should be used for the cat"
                ],
                "answer": 3,
                "explanation": "New sprites appear in the middle of the stage. The \"this sprite\" in line 4 points to the apple, the sprite made last; the cat is never placed. Line 5 already places the apple a second time. The fix is to use the kedi variable instead of \"this sprite\" in line 4.",
                "skills": [
                  "game-debug",
                  "game-sprite"
                ]
              },
              {
                "id": "m11h1d1-q4",
                "kind": "numeric",
                "prompt": "The cat is at the point x 40 y 80, the apple at the point x 120 y 80. How many pixels apart are they horizontally?",
                "answer": 80,
                "tolerance": 0,
                "unit": "pixels",
                "explanation": "The two sprites are at the same height, so the distance is only the difference of the x values: 120 − 40 = 80 pixels. The stage is 160 pixels wide, so this is half of the stage.",
                "skills": [
                  "game-coords"
                ]
              },
              {
                "id": "m11h1d1-q5",
                "kind": "mcq",
                "prompt": "What is the main benefit of giving a sprite a kind (Player, Food, Enemy)?",
                "options": [
                  "In later lessons you can write rules by kind",
                  "The sprite moves faster in the game",
                  "The sprite's colour changes by itself to match its kind",
                  "The sprite looks bigger on the stage"
                ],
                "answer": 0,
                "explanation": "The kind tells you the sprite's role; it has nothing to do with speed, colour or size. In events such as collisions, the computer works out from the kind which sprite is the player and which one is the food.",
                "skills": [
                  "game-sprite"
                ]
              }
            ]
          }
        },
        {
          "title": "Kediyi ok tuşlarıyla yürüt",
          "durationMin": 20,
          "problem": "Duran bir kedi oyun olmaz. Oyuncu bir tuşa bastığında bir şeylerin olması gerekir. Peki bilgisayar, senin hangi tuşa bastığını nereden bilir? Ve kedi ekranın kenarına gelince ne olmalı: dışarı çıkıp kaybolmalı mı, yoksa durmalı mı?",
          "contentMd": "Bu derste kedi oyun başlayınca ekranın ortasında hazır duruyor. Sen ona hareket yeteneği vereceksin.\n\n### Denetleyici\nOyun Atölyesi'nde oyuncunun kullandığı tuşlara **denetleyici** diyoruz. Dört yön tuşu (ya da W, A, S, D) ve iki düğme (A: Boşluk ya da Z, B: X ya da Enter) vardır. Sahnenin altında aynı tuşların ekran hâli de durur. Dokunmatik ekranda onları kullanabilirsin.\n\n### Blokları kur\n1. Etkinliği aç ve ▶ düğmesine bas. Ok tuşlarına bas. Kedi kıpırdamıyor.\n2. **Denetleyici** kategorisini aç ve `[kedi] oyuncu tuşlarıyla [dört yöne] hareket etsin, hız [60]` bloğunu al. Bunu `oyun başlayınca` bloğunun içindeki son bloğun altına tak. `bu sprite` yerine **Değişken** kategorisinden `kedi` bloğunu koy.\n3. ↺ düğmesine bas ve ok tuşlarıyla yürü. Kedi şimdi hareket ediyor.\n4. Kediyi biraz hızlandır: hızı 100 yap ve tekrar dene. Hız, saniyede kaç piksel gittiğini gösterir.\n5. Uzun süre sol tuşuna basılı tut. Kedi ekranın dışına çıkıp kayboluyor.\n6. **Sprite** kategorisinden `[kedi] [ekranda kalsın]: [evet]` bloğunu al ve hareket bloğunun altına tak. Bu bir ayar bloğudur. İlk açılır listeden **ekranda kalsın** ayarını, ikinci listeden **evet** değerini seç.\n7. ↺ düğmesine bas. Şimdi kedi ekranın kenarında durur.\n\nBeklenen sonuç: Kedi dört yöne yürür ve ekranın dışına çıkamaz.\n\n### Nasıl çalışıyor?\n- Tuşla hareket bloğu bir kez çalışır ama sonsuza kadar etkili olur. Oyun, her saniye 60 kez tuşlara bakar ve kediyi buna göre kaydırır. Bunun için sen ayrıca bir döngü yazmazsın.\n- Hareket biçimi üçtür: **dört yöne**, **sağa-sola** ve **yukarı-aşağı**. Bir platform oyunu için sağa-sola yeterlidir. Meyve sepeti için de.\n- **ekranda kalsın** ayarı olmazsa sprite dünyadan çıkabilir. Çıkan sprite görünmez ama hâlâ vardır.\n\n### Dene\n1. Hareket biçimini **sağa-sola** yap. Yukarı ve aşağı tuşları artık işe yarıyor mu?\n2. Hızı çok yükselt, örneğin 200. Kedi kontrol edilebilir mi? Sence oyunlarda hız nasıl seçilmeli?\n3. Kediyi başka bir resimle değiştir: Resimler sekmesindeki robot ya da astronotu bul. `yeni [resim] sprite'ı, türü [tür]` bloğunun açılır listesinden resmi değiştir.\n\n### Sık yapılan hatalar\n- Hareket bloğunun içine `bu sprite` kalmışsa son oluşturulan sprite hareket eder. Bu derste tek sprite var, bu yüzden sorun çıkmaz. Ama ikinci bir sprite eklediğinde hep değişken adını kullan.\n- Bloğu `oyun başlayınca` bloğunun içine koymayı unutma. Dışarıda duran blok çalışmaz.\n- Blok değişikliği çalışan oyuna otomatik yansımaz. Önce ↺ bas.",
          "question": "Kedi ekranda kalmasaydı, bir oyunda bu ne gibi sorunlar çıkarırdı? Hangi oyunlarda oyuncunun ekrandan çıkmasına izin verilir?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Oyuncunun kullandığı tuşlara **denetleyici** dendiğini\n- Bir sprite'ı ok tuşlarıyla hareket ettirmeyi\n- **Hız** kavramını (saniyede kaç piksel) ve hesaplamasını\n- Üç hareket biçimini ve hangisini ne zaman seçeceğini\n- Sprite'ın ekrandan çıkmasını nasıl engelleyeceğini\n\n### Önceden bilmen gerekenler\nDers 1: sahne, sprite, konum (x ve y), değişken ve `oyun başlayınca` bloğu.\n\n### Denetleyici: oyunun kumandası\nOyuncu oyunla tuşlar aracılığıyla konuşur. Oyun Atölyesi'ndeki tuşların hepsine **denetleyici** denir. Dört yön tuşu (ya da W, A, S, D) ve iki düğme vardır:\n\n| Tuş | Klavyede | Dokunmatikte |\n|---|---|---|\n| Yön tuşları | oklar ya da W A S D | sahnenin altındaki yön tuşları |\n| A düğmesi | Boşluk ya da Z | ekrandaki A |\n| B düğmesi | X ya da Enter | ekrandaki B |\n\n### Bir kez söyle, hep geçerli\n`kedi oyuncu tuşlarıyla hareket etsin` bloğunu bir kez çalıştırırsın, etkisi sonsuza kadar sürer. Oyun saniyede 60 kez tuşlara bakar. Basılı bir yön tuşu görürse kediyi o yöne kaydırır. Bunun için kendin bir döngü kurmazsın; oyun senin yerine tekrar eder.\n\n### Hız ve hareket biçimi\n**Hız**, sprite'ın bir saniyede kaç piksel gittiğini söyler. Bloğa hız 60 yazarsan kedi basılı tuş boyunca saniyede 60 piksel yürür. Yol = hız x süre olduğundan 2 saniyede 120 piksel gider. Sahne 160 piksel geniş olduğundan hız 60 olan bir kedi ekranı yaklaşık 2,7 saniyede geçer.\n\nHareket biçimi üçtür:\n\n| Biçim | Hangi tuşlar işe yarar | Uygun olduğu oyun |\n|---|---|---|\n| dört yöne | yukarı, aşağı, sol, sağ | labirent, yukarıdan görünüşlü oyun |\n| sağa-sola | yalnız sol ve sağ | platform oyunu, meyve sepeti |\n| yukarı-aşağı | yalnız yukarı ve aşağı | dikey kaydırmalı oyun |\n\nSağa-sola seçilmişken yukarı tuşuna basarsan hiçbir şey olmaz. Bu bir hata değil, seçtiğin hareket biçiminin kuralıdır.\n\n### Ekranda kalsın ayarı\nHiçbir şey söylemezsen kedi ekranın kenarını geçip dışarı çıkar. Çıktığında silinmez, yalnızca görünmez olur; hâlâ oyundadır. **ekranda kalsın: evet** ayarı kediyi sahnenin sınırında durdurur. Bu ayarı da `oyun başlayınca` içine, hareket bloğunun altına koyarsın.\n\n### Özet\nDenetleyici, oyuncunun tuşlarıdır. Tuşla hareket bloğu bir kez çalıştırılır ve oyun boyunca geçerli kalır. Hız, saniyede gidilen piksel sayısıdır; yol hız çarpı süredir. Hareket biçimi hangi tuşların işe yarayacağını belirler. Ekranda kalsın ayarı sprite'ı sahnenin içinde tutar.",
          "concepts": [
            {
              "term": "Denetleyici",
              "definition": "Oyuncunun oyunu yönettiği tuşlar: dört yön tuşu ile A ve B düğmeleri.",
              "example": "Klavyede oklar ve Boşluk, telefonda sahnenin altındaki ekran tuşları denetleyici görevi görür.",
              "pitfall": "Dokunmatik ekranda tuşlarla oynanamayacağını sanmak; sahnenin altında aynı tuşların ekran hâli vardır."
            },
            {
              "term": "Hız",
              "definition": "Sprite'ın bir saniyede kaç piksel gittiğini söyleyen sayı.",
              "example": "Hız 60 ise kedi basılı tuşla 2 saniyede 120 piksel yürür.",
              "pitfall": "Hızı çok büyük seçmek; hız 200 gibi değerlerde kedi kontrol edilemeyecek kadar çabuk gider."
            },
            {
              "term": "Hareket biçimi",
              "definition": "Tuşla hareket bloğunda hangi tuşların işe yarayacağını belirleyen seçim: dört yöne, sağa-sola ya da yukarı-aşağı.",
              "example": "Meyve sepetini sağa-sola biçimine ayarlarsan yukarı ve aşağı tuşları sepeti oynatmaz.",
              "pitfall": "Sağa-sola seçiliyken yukarı tuşunun neden çalışmadığını bir hata sanmak; bu seçtiğin biçimin kuralıdır."
            },
            {
              "term": "Ekranda kalsın",
              "definition": "Sprite'ı sahnenin sınırında durduran ayar.",
              "example": "Bu ayar açıkken sol tuşuna uzun süre basmak kediyi sol kenarda durdurur.",
              "pitfall": "Ayarı eklemeyi unutmak; sprite ekrandan çıkar, görünmez olur ama oyunda kalmaya devam eder."
            },
            {
              "term": "Kare",
              "definition": "Oyunun saniyede 60 kez yinelenen bir adımı; her karede tuşlara bakılır ve sprite'lar kaydırılır.",
              "example": "Sağ tuşu basılıyken kedi her karede hızının altmışta biri kadar sağa kayar.",
              "pitfall": "Hareket bloğunu sürekli çalıştırmak için bir döngü kurmaya çalışmak; tuşla hareket bloğu bir kez çalışır ve oyun boyunca geçerli kalır."
            }
          ],
          "quiz": [
            {
              "id": "m11h1d2-q1",
              "kind": "mcq",
              "prompt": "Ekranın altında yalnız sağa ve sola kayan bir meyve sepeti yapıyorsun. Hangi hareket biçimini seçmelisin?",
              "options": [
                "Dört yöne",
                "Sağa-sola",
                "Yukarı-aşağı",
                "Hiçbiri; sepet tuşla hareket edemez"
              ],
              "answer": 1,
              "explanation": "Sağa-sola biçimi yalnız sol ve sağ tuşlarına yanıt verir; sepet yanlışlıkla yukarı çıkmaz. Dört yöne seçersen yukarı ve aşağı tuşları da sepeti oynatır. Yukarı-aşağı ise tam tersini yapar.",
              "skills": [
                "game-input"
              ]
            },
            {
              "id": "m11h1d2-q2",
              "kind": "numeric",
              "prompt": "Kedi x 80 noktasında duruyor. Hareket hızı 60 ve ekranda kalsın ayarı kapalı. Sağ tuşuna tam 2,5 saniye basılı tutarsan kedi kaç piksel yol alır?",
              "answer": 150,
              "tolerance": 0,
              "unit": "piksel",
              "explanation": "Yol = hız x süre = 60 x 2,5 = 150 piksel. Ekranda kalsın kapalı olduğu için kedi x 230 noktasına, yani sahnenin dışına kadar gider. Ayar açık olsaydı sağ kenarda dururdu.",
              "skills": [
                "game-motion"
              ]
            },
            {
              "id": "m11h1d2-q3",
              "kind": "predict-output",
              "prompt": "Oyuncu yukarı tuşunu 1 saniye basılı tutuyor. Kedi ne yapar?\n\n```\noyun başlayınca\n  kedi = yeni Kedi sprite'ı, türü Oyuncu\n  kedi konumu x 80 y 60\n  kedi oyuncu tuşlarıyla sağa-sola hareket etsin, hız 60\n```",
              "options": [
                "Yerinde kalır",
                "Yukarı doğru 60 piksel gider",
                "Sağa doğru gider",
                "Oyun hata verir ve durur"
              ],
              "answer": 0,
              "explanation": "Sağa-sola biçimi yalnız sol ve sağ tuşlarını dinler. Yukarı tuşu bu biçimde hiçbir şey yapmaz; hata da vermez. Yukarı gitmesi için dört yöne ya da yukarı-aşağı biçimi seçilmeliydi.",
              "skills": [
                "game-input",
                "game-motion"
              ]
            },
            {
              "id": "m11h1d2-q4",
              "kind": "find-bug",
              "prompt": "Ok tuşlarına basınca kedi hiç kıpırdamıyor. Hata nedir?\n\n```\noyun başlayınca\n  kedi = yeni Kedi sprite'ı, türü Oyuncu\n  kedi konumu x 80 y 60\n\nkedi oyuncu tuşlarıyla dört yöne hareket etsin, hız 60\n```",
              "options": [
                "Hız 60 çok yüksek",
                "Kedinin konumu yanlış",
                "Hareket bloğu oyun başlayınca bloğunun içine takılı değil; o yüzden hiç çalışmaz",
                "Dört yöne yerine sağa-sola seçilmeli"
              ],
              "answer": 2,
              "explanation": "Bloklar yalnız bir olay bloğuna bağlıysa çalışır. Hareket bloğu en alttaki bağımsız satırda, yani oyun başlayınca bloğunun dışında duruyor. Hız değeri ve konum sorun değil; dört yöne zaten tüm tuşları dinler.",
              "skills": [
                "game-debug",
                "game-blocks"
              ]
            },
            {
              "id": "m11h1d2-q5",
              "kind": "mcq",
              "prompt": "Ekranda kalsın ayarı yokken kedi sol kenardan çıktı. Kediye ne olur?",
              "options": [
                "Oyundan silinir",
                "Sağ kenardan geri gelir",
                "Oyun durur",
                "Görünmez olur ama oyunda kalmaya devam eder"
              ],
              "answer": 3,
              "explanation": "Sprite ekranın dışına çıkınca silinmez; yalnızca görünmez olur ve hâlâ oyundadır. Başka bir kenardan kendiliğinden geri gelmez, oyunu da durdurmaz. Onu sahnede tutmak için ekranda kalsın ayarını açarsın.",
              "skills": [
                "game-motion",
                "game-debug"
              ]
            }
          ],
          "contentEn": {
            "title": "Walk the cat with the arrow keys",
            "problem": "A cat that just stands there is not a game. When the player presses a key, something has to happen. So how does the computer know which key you pressed? And what should happen when the cat reaches the edge of the screen: should it go out and disappear, or should it stop?",
            "contentMd": "In this lesson, when the game starts, the cat is already standing in the middle of the screen. You will give it the ability to move.\n\n### Controller\nIn the Game Workshop we call the keys the player uses the **controller**. There are four direction keys (or W, A, S, D) and two buttons (A: Space or Z, B: X or Enter). Under the stage there is an on-screen version of the same keys too. You can use them on a touch screen.\n\n### Build the blocks\n1. Open the activity and press the ▶ button. Press the arrow keys. The cat does not move.\n2. Open the **Controller** category and take the `[kedi] moves [in 4 directions] with player keys, speed [60]` block. Attach it under the last block inside the `when game starts` block. Put the `kedi` block from the **Variables** category in place of `this sprite`.\n3. Press the ↺ button and walk with the arrow keys. The cat moves now.\n4. Make the cat a bit faster: set the speed to 100 and try again. The speed shows how many pixels it goes in a second.\n5. Hold the left key down for a long time. The cat goes off the screen and disappears.\n6. From the **Sprite** category, take the `[kedi] [stay on screen]: [yes]` block and attach it under the movement block. This is a setting block. From the first drop-down list choose the **stay on screen** setting, and from the second list choose the value **yes**.\n7. Press the ↺ button. Now the cat stops at the edge of the screen.\n\nExpected result: The cat walks in four directions and cannot leave the screen.\n\n### How does it work?\n- The key movement block runs once but works forever. The game looks at the keys 60 times every second and slides the cat to match. You do not write a separate loop for this.\n- There are three ways of moving: **in 4 directions**, **left-right** and **up-down**. For a platform game, left-right is enough. For a fruit basket too.\n- Without the **stay on screen** setting, the sprite can leave the world. A sprite that has left cannot be seen, but it still exists.\n\n### Try it\n1. Change the way of moving to **left-right**. Do the up and down keys still do anything?\n2. Make the speed very high, for example 200. Can you still control the cat? How do you think speed should be chosen in games?\n3. Swap the cat for another picture: find the robot or the astronaut in the Pictures tab. Change the picture in the drop-down list of the `new [picture] sprite, kind [kind]` block.\n\n### Common mistakes\n- If `this sprite` is still left inside the movement block, the sprite made last moves. There is only one sprite in this lesson, so nothing goes wrong. But once you add a second sprite, always use the variable name.\n- Do not forget to put the block inside the `when game starts` block. A block left outside does not run.\n- A change to the blocks does not show up in the running game by itself. Press ↺ first.",
            "question": "If the cat did not stay on the screen, what problems would that cause in a game? In which games is the player allowed to leave the screen?",
            "explainerMd": "### What you will learn in this lesson\n- That the keys the player uses are called the **controller**\n- How to move a sprite with the arrow keys\n- The idea of **speed** (how many pixels a second) and how to work it out\n- The three ways of moving and when to choose each one\n- How to stop a sprite from leaving the screen\n\n### What you should know first\nLesson 1: stage, sprite, position (x and y), variable and the `when game starts` block.\n\n### Controller: the game's remote\nThe player talks to the game through keys. All the keys in the Game Workshop together are called the **controller**. There are four direction keys (or W, A, S, D) and two buttons:\n\n| Key | On the keyboard | On a touch screen |\n|---|---|---|\n| Direction keys | arrows or W A S D | the direction keys under the stage |\n| A button | Space or Z | the A on the screen |\n| B button | X or Enter | the B on the screen |\n\n### Say it once, it works forever\nYou run the `kedi moves with player keys` block once, and its effect lasts forever. The game looks at the keys 60 times a second. If it sees a direction key held down, it slides the cat that way. You do not build a loop for this yourself; the game repeats it for you.\n\n### Speed and way of moving\n**Speed** tells you how many pixels the sprite goes in one second. If you write speed 60 in the block, the cat walks 60 pixels a second while the key is held down. Since distance = speed x time, it goes 120 pixels in 2 seconds. The stage is 160 pixels wide, so a cat with speed 60 crosses the screen in about 2.7 seconds.\n\nThere are three ways of moving:\n\n| Way | Which keys work | Good for |\n|---|---|---|\n| in 4 directions | up, down, left, right | maze, top-down game |\n| left-right | only left and right | platform game, fruit basket |\n| up-down | only up and down | vertical scrolling game |\n\nIf left-right is chosen and you press the up key, nothing happens. This is not a bug; it is the rule of the way of moving you chose.\n\n### The stay on screen setting\nIf you say nothing, the cat passes the edge of the screen and goes out. When it goes out, it is not deleted; it just cannot be seen; it is still in the game. The **stay on screen: yes** setting stops the cat at the edge of the stage. You put this setting inside `when game starts` too, under the movement block.\n\n### Summary\nThe controller is the player's keys. The key movement block is run once and stays in force for the whole game. Speed is the number of pixels travelled in a second; distance is speed times time. The way of moving decides which keys work. The stay on screen setting keeps the sprite inside the stage.",
            "concepts": [
              {
                "term": "Controller",
                "definition": "The keys the player uses to run the game: four direction keys and the A and B buttons.",
                "example": "On a keyboard the arrows and Space act as the controller; on a phone the on-screen keys under the stage do.",
                "pitfall": "Thinking you cannot play with keys on a touch screen; there is an on-screen version of the same keys under the stage."
              },
              {
                "term": "Speed",
                "definition": "The number that tells you how many pixels a sprite goes in one second.",
                "example": "If the speed is 60, the cat walks 120 pixels in 2 seconds while the key is held down.",
                "pitfall": "Choosing a speed that is too big; at values like 200 the cat goes too fast to control."
              },
              {
                "term": "Way of moving",
                "definition": "The choice in the key movement block that decides which keys work: in 4 directions, left-right or up-down.",
                "example": "If you set the fruit basket to left-right, the up and down keys do not move the basket.",
                "pitfall": "Thinking it is a bug that the up key does not work while left-right is chosen; it is the rule of the way you chose."
              },
              {
                "term": "Stay on screen",
                "definition": "The setting that stops a sprite at the edge of the stage.",
                "example": "With this setting on, holding the left key down for a long time stops the cat at the left edge.",
                "pitfall": "Forgetting to add the setting; the sprite leaves the screen and cannot be seen, but it stays in the game."
              },
              {
                "term": "Frame",
                "definition": "One step of the game, repeated 60 times a second; in every frame the keys are checked and the sprites are moved.",
                "example": "While the right key is held down, the cat slides right by one sixtieth of its speed in every frame.",
                "pitfall": "Trying to build a loop to keep running the movement block; the key movement block runs once and stays in force for the whole game."
              }
            ],
            "quiz": [
              {
                "id": "m11h1d2-q1",
                "kind": "mcq",
                "prompt": "You are making a fruit basket at the bottom of the screen that only slides right and left. Which way of moving should you choose?",
                "options": [
                  "In 4 directions",
                  "Left-right",
                  "Up-down",
                  "None; the basket cannot move with keys"
                ],
                "answer": 1,
                "explanation": "The left-right way only responds to the left and right keys; the basket does not go up by mistake. If you choose in 4 directions, the up and down keys move the basket too. Up-down does the exact opposite.",
                "skills": [
                  "game-input"
                ]
              },
              {
                "id": "m11h1d2-q2",
                "kind": "numeric",
                "prompt": "The cat is standing at x 80. Its movement speed is 60 and the stay on screen setting is off. If you hold the right key down for exactly 2.5 seconds, how many pixels does the cat travel?",
                "answer": 150,
                "tolerance": 0,
                "unit": "pixels",
                "explanation": "Distance = speed x time = 60 x 2.5 = 150 pixels. Stay on screen is off, so the cat goes all the way to x 230, outside the stage. If the setting were on, it would stop at the right edge.",
                "skills": [
                  "game-motion"
                ]
              },
              {
                "id": "m11h1d2-q3",
                "kind": "predict-output",
                "prompt": "The player holds the up key down for 1 second. What does the cat do?\n\n```\nwhen game starts\n  kedi = new Cat sprite, kind Player\n  move kedi to x 80 y 60\n  kedi moves left-right with player keys, speed 60\n```",
                "options": [
                  "It stays where it is",
                  "It goes up 60 pixels",
                  "It goes to the right",
                  "The game gives an error and stops"
                ],
                "answer": 0,
                "explanation": "The left-right way only listens to the left and right keys. The up key does nothing with this way; it does not give an error either. For it to go up, in 4 directions or up-down should have been chosen.",
                "skills": [
                  "game-input",
                  "game-motion"
                ]
              },
              {
                "id": "m11h1d2-q4",
                "kind": "find-bug",
                "prompt": "When you press the arrow keys, the cat does not move at all. What is the bug?\n\n```\nwhen game starts\n  kedi = new Cat sprite, kind Player\n  move kedi to x 80 y 60\n\nkedi moves in 4 directions with player keys, speed 60\n```",
                "options": [
                  "Speed 60 is too high",
                  "The cat's position is wrong",
                  "The movement block is not attached inside the when game starts block, so it never runs",
                  "Left-right should be chosen instead of in 4 directions"
                ],
                "answer": 2,
                "explanation": "Blocks only run if they are connected to an event block. The movement block is on the loose line at the bottom, outside the when game starts block. The speed value and the position are not the problem; in 4 directions already listens to all the keys.",
                "skills": [
                  "game-debug",
                  "game-blocks"
                ]
              },
              {
                "id": "m11h1d2-q5",
                "kind": "mcq",
                "prompt": "Without the stay on screen setting, the cat went out through the left edge. What happens to the cat?",
                "options": [
                  "It is deleted from the game",
                  "It comes back in through the right edge",
                  "The game stops",
                  "It cannot be seen, but it stays in the game"
                ],
                "answer": 3,
                "explanation": "When a sprite leaves the screen it is not deleted; it just cannot be seen and it is still in the game. It does not come back by itself through another edge, and it does not stop the game. To keep it on the stage, you turn on the stay on screen setting.",
                "skills": [
                  "game-motion",
                  "game-debug"
                ]
              }
            ]
          }
        },
        {
          "title": "A düğmesine basınca değiş ve konuş",
          "durationMin": 20,
          "problem": "Oyunlarda bazı şeyler sürekli olur, bazı şeyler ise yalnızca bir an için olur: zıplamak, ateş etmek, konuşmak. Bunlar bir düğmeye basıldığı anda gerçekleşir. Bilgisayara \"A'ya bastığım anda şunu yap\" demeyi öğrenelim. Kedimiz hem dönüşsün, hem konuşsun.",
          "contentMd": "Kedi, ok tuşlarıyla yürüyor ve ekranda kalıyor. Bu derste ona üç yeni yetenek vereceksin.\n\n### Olay kavramı\nBazı bloklar, bir şey **olunca** çalışan bloklardır. `oyun başlayınca` bunlardan biriydi. Şimdi yeni bir olay öğreniyoruz: düğmeye basılınca. Olay blokları altına bağladığın blokları yalnız o olay gerçekleşince çalıştırır. Olay blokları başka bloğun altına takılmaz; çalışma alanında tek başına durur.\n\n### Blokları kur\n1. **Denetleyici** kategorisinden `[A] düğmesine [basılınca]` bloğunu çalışma alanına bırak. Soldaki açılır listeden **A**'yı seç. Bu blok `oyun başlayınca` bloğunun yanında, ayrı bir blok olarak durur.\n2. **Sprite** kategorisinden `[kedi] resmi [resim]` bloğunu al ve A olayının içine tak. Resim olarak **Robot**'u seç. Kedi yerine `kedi` değişkenini koymayı unutma.\n3. Aynı olayın içine `[kedi] [Merhaba!] desin, [2] saniye` bloğunu ekle. Metni değiştirip \"Merhaba, ben robotum!\" yazabilirsin.\n4. ▶ düğmesine bas ve A tuşuna (Boşluk ya da Z) bas. Kedi robota dönüşür ve konuşma balonu çıkar.\n5. Şimdi yüz yönünü ayarlayalım. Bir `[sol ←] düğmesine [basılınca]` olayı ekle ve içine `[kedi] [sola] baksın` bloğunu koy.\n6. Bir `[sağ →] düğmesine [basılınca]` olayı daha ekle. İçine `[kedi] [sağa] baksın` bloğunu koy.\n7. ↺ düğmesine bas. Sol tuşuna basınca kedi sola, sağ tuşuna basınca sağa bakar.\n\nBeklenen sonuç: A'ya basınca kedi robota dönüşür ve konuşur. Sola yürürken kedinin yüzü sola döner.\n\n### Nasıl çalışıyor?\n- Her olay bloğu ayrı çalışır. Birden fazla düğme olayı yazabilirsin, hepsi aynı anda bekler.\n- Düğme olayı **bir kez** çalışır: düğmeye bastığın an. Basılı tutarsan tekrar tekrar çalışmaz.\n- `[kedi] [sola] baksın` bloğu resmi yatay olarak çevirir. Başka resim çizmek zorunda kalmazsın.\n- Konuşma balonu birkaç saniye sonra kendiliğinden kaybolur.\n\n### Dene\n1. `[A] düğmesine [bırakılınca]` olayı ekle. Kedi geri kediye dönüşsün: resim olarak **Kedi** seç.\n2. B düğmesi için ayrı bir olay yaz: kedi ninja olsun (resim olarak **Ninja**) ve \"Hiyaa!\" desin.\n3. Konuşma süresini 5 saniyeye çıkar ve ne olduğunu gözle.\n\n### Sık yapılan hatalar\n- Olay bloğunun içine bir şey takmazsan hiçbir şey olmaz.\n- Düğme olaylarında `bu sprite` kullanırsan en son oluşturulan sprite etkilenir. Bu derste tek sprite var ama yine de `kedi` değişkenini kullan.\n- Yön bloğunu yürüme bloğunun içine koyma. Yürümeyi tuş hareketi zaten sağlıyor. Yönü ayrı olaylar belirler.",
          "question": "Sence oyuncunun hangi hareketleri sürekli (tuşa basılı tutulduğu sürece), hangileri tek seferlik (bastığı an) olmalı? Zıplamak için hangisini seçerdin?",
          "explainerMd": "### Bu derste öğreneceklerin\n- **Olay** nedir ve olay blokları diğer bloklardan nasıl ayrılır\n- Düğmeye basılınca ve düğme bırakılınca çalışan olayları\n- Bir sprite'ın resmini ve bakış yönünü değiştirmeyi\n- Konuşma balonunun nasıl çalıştığını\n- Sürekli olan ile tek seferlik olanı ayırt etmeyi\n\n### Önceden bilmen gerekenler\nDers 1: sprite ve değişken. Ders 2: denetleyici, tuşla hareket ve oyunun saniyede 60 kez yinelenmesi.\n\n### Olay: \"şu olunca bunu yap\"\nŞimdiye kadarki bloklar sırayla çalıştı. Bazı işler ise yalnızca bir şey **olunca** yapılır. Bunlara **olay** diyoruz. `oyun başlayınca` bir olaydır. Yeni olayımız: \"A düğmesine basılınca\".\n\nOlay bloğu bir şapka gibi en üstte durur. Altına bağladığın bloklar yalnız olay gerçekleşince çalışır. Olay blokları başka bir bloğun altına takılmaz; çalışma alanında yan yana, ayrı ayrı dururlar. Hepsi aynı anda bekler.\n\n### Basılınca ve bırakılınca\nHer düğme için iki olay vardır:\n\n| Olay | Ne zaman çalışır |\n|---|---|\n| basılınca | düğmeye bastığın an, bir kez |\n| bırakılınca | parmağını çektiğin an, bir kez |\n\nDüğmeyi basılı tutmak olayı tekrar tekrar çalıştırmaz. Yürümek gibi sürekli işler için tuşla hareket bloğu vardır. Zıplamak, konuşmak, ateş etmek gibi anlık işler için olay kullanılır.\n\nŞema olarak zaman çizgisi:\n\n```\nzaman:        ---->\nA düğmesi:    __/‾‾‾‾‾‾‾‾‾‾\\__\n                ^           ^\n         basılınca     bırakılınca\n         (bir kez)     (bir kez)\n```\n\n### Resim, yön ve konuşma\nSprite'ın üç kolay değişiklik yolu vardır:\n\n| Blok | Ne yapar |\n|---|---|\n| `kedi resmi Robot` | sprite'ın görünüşünü değiştirir; tür ve konum aynı kalır |\n| `kedi sola baksın` | resmi yatayda çevirir, yeni resim çizmen gerekmez |\n| `kedi \"Merhaba!\" desin, 2 saniye` | üstünde bir konuşma balonu gösterir |\n\nKonuşma balonu süre dolunca kendiliğinden kaybolur. Oyun saniyede 60 kare çizdiğinden 2 saniyelik bir balon 120 kare boyunca görünür. Resim değişince sprite'ın türü değişmez: Robot resmindeki kedi hâlâ bir Oyuncu'dur.\n\n### Hep değişken kullan\nOlayların içinde de `bu sprite` yerine kendi değişkenini kullan. Aksi hâlde en son oluşturulan sprite etkilenir. Tek sprite varken sorun çıkmaz, ama ikinci sprite eklediğin an hata başlar.\n\n### Özet\nOlay, bir şey gerçekleşince çalışan bloktur; altına bağlı bloklar yalnız o zaman çalışır. Düğme olaylarının basılınca ve bırakılınca olmak üzere iki türü vardır ve her biri bir kez çalışır. Sprite'ın resmini, bakış yönünü ve konuşmasını olay içinde değiştirebilirsin. Sürekli işler tuşla hareketle, anlık işler olayla yapılır.",
          "concepts": [
            {
              "term": "Olay",
              "definition": "Bir şey gerçekleşince çalışan blok; altına bağlı bloklar yalnız o zaman çalışır.",
              "example": "A düğmesine basılınca olayının altına bağladığın konuşma bloğu, yalnız A'ya bastığın anda çalışır.",
              "pitfall": "Olay bloğunun altına hiçbir şey takmamak; o düğme hiçbir şey yapmaz."
            },
            {
              "term": "Basılınca ve bırakılınca",
              "definition": "Bir düğmenin iki olayı: parmak düğmeye değdiği an ve çekildiği an. Her biri bir kez çalışır.",
              "example": "A basılınca kedi robot olur, A bırakılınca tekrar kedi olur.",
              "pitfall": "Düğmeyi basılı tutunca olayın tekrar tekrar çalışacağını sanmak; yalnız basıldığı anda bir kez çalışır."
            },
            {
              "term": "Sürekli ve anlık iş",
              "definition": "Yürümek gibi tuş basılı kaldıkça süren iş sürekli; konuşmak ya da dönüşmek gibi bir anda biten iş anlıktır.",
              "example": "Yürümek için tuşla hareket bloğu, dönüşmek için düğme olayı kullanılır.",
              "pitfall": "Yürümeyi olayla yapmaya çalışmak; olay yalnız basıldığı anda bir kez çalıştığından kedi bir an kıpırdar ve durur."
            },
            {
              "term": "Konuşma balonu",
              "definition": "Bir sprite'ın üstünde, verdiğin süre boyunca görünen yazı kutusu.",
              "example": "Kedi \"Merhaba!\" desin, 2 saniye bloğu balonu 120 kare boyunca gösterir.",
              "pitfall": "Balonun sonsuza kadar kalacağını sanmak; süre dolunca kendiliğinden kaybolur."
            },
            {
              "term": "Resim ve yön değiştirme",
              "definition": "Sprite'ın görünüşünü değiştirmek (resmi bloğu) ya da yatayda çevirmek (sağa/sola baksın).",
              "example": "Sola yürüyen kedi için sola baksın bloğu, yeni resim çizmeden kediyi çevirir.",
              "pitfall": "Resim değişince sprite'ın türünün de değiştiğini sanmak; Robot resmindeki kedi hâlâ bir Oyuncu'dur."
            }
          ],
          "quiz": [
            {
              "id": "m11h1d3-q1",
              "kind": "mcq",
              "prompt": "A düğmesine basılınca olayı yazdın ve A'yı 3 saniye basılı tuttun. Olayın altındaki bloklar kaç kez çalışır?",
              "options": [
                "3 kez",
                "Basılı kaldığı sürece sürekli",
                "1 kez",
                "Hiç çalışmaz"
              ],
              "answer": 2,
              "explanation": "Basılınca olayı düğmeye değdiğin an yalnız bir kez çalışır. Basılı tutmak onu tekrar etmez. Sürekli bir etki istersen tuşla hareket gibi sürekli çalışan blokları kullanırsın.",
              "skills": [
                "game-blocks",
                "game-input"
              ]
            },
            {
              "id": "m11h1d3-q2",
              "kind": "predict-output",
              "prompt": "Oyuncu önce A'ya, sonra B'ye, en sonda tekrar A'ya basıp her seferinde bırakıyor. Kedi hangi resimde kalır?\n\n```\nA düğmesine basılınca\n  kedi resmi Robot\n\nB düğmesine basılınca\n  kedi resmi Ninja\n```",
              "options": [
                "Robot",
                "Ninja",
                "Kedi (ilk resim)",
                "Hata verir; iki olay birlikte çalışamaz"
              ],
              "answer": 0,
              "explanation": "Her basış kendi olayını çalıştırır ve sprite'ın resmini yeniden değiştirir. Sıra Robot, Ninja, Robot olduğundan son resim Robot'tur. İki olay ayrı ayrı bekler, birbirini bozmaz.",
              "skills": [
                "game-blocks",
                "game-sprite"
              ]
            },
            {
              "id": "m11h1d3-q3",
              "kind": "find-bug",
              "prompt": "Kedi sola yürürken yüzü hâlâ sağa bakıyor. Hata hangi satırda?\n\n```\n1  sol ← düğmesine basılınca\n2    kedi sağa baksın\n3  sağ → düğmesine basılınca\n4    kedi sağa baksın\n```",
              "options": [
                "Satır 1: sol düğmesi yerine yukarı düğmesi olmalı",
                "Satır 2: sola basılınca kedi sola baksın bloğunu kullanmalı",
                "Satır 3: sağ düğmesi bırakılınca olayı olmalı",
                "Satır 4: sağa baksın yerine sola baksın olmalı"
              ],
              "answer": 1,
              "explanation": "Sol tuşunun olayı kediyi sağa baktırıyor, bu yüzden kedinin yüzü ters. Düzeltmek için satır 2 'sola baksın' olmalı. Satır 3 ve 4 doğru: sağ tuşu kediyi sağa baktırıyor.",
              "skills": [
                "game-debug",
                "game-blocks"
              ]
            },
            {
              "id": "m11h1d3-q4",
              "kind": "numeric",
              "prompt": "Kedi \"Merhaba!\" desin, 2 saniye bloğu çalıştı. Oyun saniyede 60 kare çizdiğine göre konuşma balonu kaç kare boyunca görünür?",
              "answer": 120,
              "tolerance": 0,
              "unit": "kare",
              "explanation": "Süre x saniyedeki kare sayısı = 2 x 60 = 120 kare. Balon süre dolunca kendiliğinden kaybolur.",
              "skills": [
                "game-sprite",
                "game-motion"
              ]
            },
            {
              "id": "m11h1d3-q5",
              "kind": "mcq",
              "prompt": "Sağ yön tuşu basılı kaldığı sürece kedinin sürekli yürümesini istiyorsun. Doğru yöntem hangisidir?",
              "options": [
                "Sağ düğmesine basılınca olayı kullanmak; basılı tutmak olayı tekrar eder",
                "Sağ düğmesi bırakılınca olayı kullanmak",
                "Kedinin resmini sürekli değiştirmek",
                "Tuşla hareket bloğunu kullanmak"
              ],
              "answer": 3,
              "explanation": "Sürekli işler için tuşla hareket bloğu vardır; olay ise yalnız basıldığı anda bir kez çalışır, bu yüzden basılı tutmak onu tekrar etmez. Bırakılınca olayı da yürütmez, sadece bırakılma anında çalışır.",
              "skills": [
                "game-input",
                "game-blocks"
              ]
            }
          ],
          "contentEn": {
            "title": "Change and talk when you press the A button",
            "problem": "In games some things happen all the time, and some things happen only for a moment: jumping, shooting, talking. These happen at the moment a button is pressed. Let's learn to tell the computer, \"do this the moment I press A.\" Our cat will both change shape and talk.",
            "contentMd": "The cat walks with the arrow keys and stays on the screen. In this lesson you will give it three new abilities.\n\n### The idea of an event\nSome blocks are blocks that run **when** something happens. `when game starts` was one of them. Now we are learning a new event: when a button is pressed. Event blocks run the blocks you connect under them only when that event happens. Event blocks are not attached under another block; they stand on their own in the work area.\n\n### Build the blocks\n1. From the **Controller** category, drop the `when [A] button is [pressed]` block into the work area. Choose **A** from the drop-down list on the left. This block stands next to the `when game starts` block, as a separate block.\n2. From the **Sprite** category, take the `set [kedi] picture to [picture]` block and attach it inside the A event. Choose **Robot** as the picture. Do not forget to put the `kedi` variable in place of the cat.\n3. Inside the same event, add the `[kedi] says [Hello!] for [2] seconds` block. You can change the text and write \"Hello, I am a robot!\".\n4. Press the ▶ button and press the A key (Space or Z). The cat turns into a robot and a speech bubble appears.\n5. Now let's set the direction it faces. Add a `when [left ←] button is [pressed]` event and put the `[kedi] faces [left]` block inside it.\n6. Add one more event, `when [right →] button is [pressed]`. Put the `[kedi] faces [right]` block inside it.\n7. Press the ↺ button. When you press the left key the cat faces left, and when you press the right key it faces right.\n\nExpected result: When you press A, the cat turns into a robot and talks. When it walks left, the cat's face turns to the left.\n\n### How does it work?\n- Each event block runs separately. You can write more than one button event; they all wait at the same time.\n- A button event runs **once**: the moment you press the button. If you hold it down, it does not run again and again.\n- The `[kedi] faces [left]` block flips the picture sideways. You do not have to draw another picture.\n- The speech bubble disappears by itself after a few seconds.\n\n### Try it\n1. Add a `when [A] button is [released]` event. Turn the cat back into a cat: choose **Cat** as the picture.\n2. Write a separate event for the B button: the cat becomes a ninja (picture **Ninja**) and says \"Hiyaa!\".\n3. Make the talking time 5 seconds and watch what happens.\n\n### Common mistakes\n- If you do not attach anything inside the event block, nothing happens.\n- If you use `this sprite` in button events, the sprite made last is affected. There is only one sprite in this lesson, but use the `kedi` variable anyway.\n- Do not put the direction block inside the walking block. The key movement already takes care of walking. Separate events decide the direction.",
            "question": "Which of the player's actions do you think should be continuous (for as long as the key is held down), and which should be one-off (the moment it is pressed)? Which would you choose for jumping?",
            "explainerMd": "### What you will learn in this lesson\n- What an **event** is and how event blocks differ from other blocks\n- Events that run when a button is pressed and when a button is released\n- How to change a sprite's picture and the direction it faces\n- How the speech bubble works\n- How to tell continuous things from one-off things\n\n### What you should know first\nLesson 1: sprite and variable. Lesson 2: controller, key movement and the game repeating 60 times a second.\n\n### Event: \"when this happens, do that\"\nSo far the blocks have run in order. Some jobs, though, are only done **when** something happens. We call these **events**. `when game starts` is an event. Our new event: \"when the A button is pressed\".\n\nAn event block sits at the very top, like a hat. The blocks you connect under it only run when the event happens. Event blocks are not attached under another block; they stand side by side in the work area, separately. They all wait at the same time.\n\n### Pressed and released\nThere are two events for every button:\n\n| Event | When it runs |\n|---|---|\n| pressed | the moment you press the button, once |\n| released | the moment you lift your finger, once |\n\nHolding the button down does not run the event again and again. For continuous jobs like walking, there is the key movement block. For instant jobs like jumping, talking or shooting, you use an event.\n\nA timeline as a sketch:\n\n```\ntime:         ---->\nA button:     __/‾‾‾‾‾‾‾‾‾‾\\__\n                ^           ^\n          pressed       released\n          (once)        (once)\n```\n\n### Picture, direction and talking\nThere are three easy ways to change a sprite:\n\n| Block | What it does |\n|---|---|\n| `set kedi picture to Robot` | changes how the sprite looks; its kind and position stay the same |\n| `kedi faces left` | flips the picture sideways; you do not need to draw a new picture |\n| `kedi says \"Hello!\" for 2 seconds` | shows a speech bubble above it |\n\nThe speech bubble disappears by itself when the time is up. The game draws 60 frames a second, so a 2 second bubble is visible for 120 frames. When the picture changes, the sprite's kind does not change: the cat with the Robot picture is still a Player.\n\n### Always use a variable\nInside events too, use your own variable instead of `this sprite`. Otherwise the sprite made last is affected. With one sprite nothing goes wrong, but the moment you add a second sprite, the bugs begin.\n\n### Summary\nAn event is a block that runs when something happens; the blocks connected under it only run then. Button events come in two types, pressed and released, and each one runs once. You can change a sprite's picture, the direction it faces and its speech inside an event. Continuous jobs are done with key movement, instant jobs with events.",
            "concepts": [
              {
                "term": "Event",
                "definition": "A block that runs when something happens; the blocks connected under it only run then.",
                "example": "The talking block you connect under the when A button is pressed event only runs the moment you press A.",
                "pitfall": "Not attaching anything under the event block; that button then does nothing."
              },
              {
                "term": "Pressed and released",
                "definition": "The two events of a button: the moment your finger touches the button and the moment it is lifted. Each one runs once.",
                "example": "When A is pressed the cat becomes a robot, and when A is released it becomes a cat again.",
                "pitfall": "Thinking the event will run again and again while you hold the button down; it runs only once, the moment it is pressed."
              },
              {
                "term": "Continuous and instant jobs",
                "definition": "A job that lasts as long as a key is held down, like walking, is continuous; a job that is over in a moment, like talking or changing shape, is instant.",
                "example": "For walking you use the key movement block; for changing shape you use a button event.",
                "pitfall": "Trying to do walking with an event; an event only runs once, the moment the button is pressed, so the cat moves for a moment and stops."
              },
              {
                "term": "Speech bubble",
                "definition": "A text box shown above a sprite for the time you give.",
                "example": "The kedi says \"Hello!\" for 2 seconds block shows the bubble for 120 frames.",
                "pitfall": "Thinking the bubble stays forever; it disappears by itself when the time is up."
              },
              {
                "term": "Changing picture and direction",
                "definition": "Changing how a sprite looks (the set picture block) or flipping it sideways (faces right/left).",
                "example": "For a cat walking left, the faces left block turns the cat round without drawing a new picture.",
                "pitfall": "Thinking the sprite's kind changes when the picture changes; the cat with the Robot picture is still a Player."
              }
            ],
            "quiz": [
              {
                "id": "m11h1d3-q1",
                "kind": "mcq",
                "prompt": "You wrote a when A button is pressed event and held A down for 3 seconds. How many times do the blocks under the event run?",
                "options": [
                  "3 times",
                  "Continuously, for as long as it is held down",
                  "Once",
                  "They never run"
                ],
                "answer": 2,
                "explanation": "The pressed event runs only once, the moment you touch the button. Holding it down does not repeat it. If you want a continuous effect, you use blocks that run continuously, like key movement.",
                "skills": [
                  "game-blocks",
                  "game-input"
                ]
              },
              {
                "id": "m11h1d3-q2",
                "kind": "predict-output",
                "prompt": "The player presses A first, then B, and finally A again, releasing it each time. Which picture does the cat end up with?\n\n```\nwhen A button is pressed\n  set kedi picture to Robot\n\nwhen B button is pressed\n  set kedi picture to Ninja\n```",
                "options": [
                  "Robot",
                  "Ninja",
                  "Cat (the first picture)",
                  "It gives an error; two events cannot run together"
                ],
                "answer": 0,
                "explanation": "Each press runs its own event and changes the sprite's picture again. The order is Robot, Ninja, Robot, so the last picture is Robot. The two events wait separately and do not spoil each other.",
                "skills": [
                  "game-blocks",
                  "game-sprite"
                ]
              },
              {
                "id": "m11h1d3-q3",
                "kind": "find-bug",
                "prompt": "While the cat walks left, its face still points right. Which line is the bug in?\n\n```\n1  when left ← button is pressed\n2    kedi faces right\n3  when right → button is pressed\n4    kedi faces right\n```",
                "options": [
                  "Line 1: it should be the up button instead of the left button",
                  "Line 2: when left is pressed it should use the kedi faces left block",
                  "Line 3: it should be the when right button is released event",
                  "Line 4: it should be faces left instead of faces right"
                ],
                "answer": 1,
                "explanation": "The left key's event makes the cat face right, so the cat's face is the wrong way round. To fix it, line 2 should be 'faces left'. Lines 3 and 4 are right: the right key makes the cat face right.",
                "skills": [
                  "game-debug",
                  "game-blocks"
                ]
              },
              {
                "id": "m11h1d3-q4",
                "kind": "numeric",
                "prompt": "The kedi says \"Hello!\" for 2 seconds block ran. The game draws 60 frames a second, so for how many frames is the speech bubble visible?",
                "answer": 120,
                "tolerance": 0,
                "unit": "frames",
                "explanation": "Time x frames per second = 2 x 60 = 120 frames. The bubble disappears by itself when the time is up.",
                "skills": [
                  "game-sprite",
                  "game-motion"
                ]
              },
              {
                "id": "m11h1d3-q5",
                "kind": "mcq",
                "prompt": "You want the cat to keep walking for as long as the right direction key is held down. Which is the right way?",
                "options": [
                  "Use the when right button is pressed event; holding it down repeats the event",
                  "Use the when right button is released event",
                  "Keep changing the cat's picture",
                  "Use the key movement block"
                ],
                "answer": 3,
                "explanation": "For continuous jobs there is the key movement block; an event only runs once, the moment the button is pressed, so holding it down does not repeat it. The released event does not make it walk either; it only runs at the moment of release.",
                "skills": [
                  "game-input",
                  "game-blocks"
                ]
              }
            ]
          }
        },
        {
          "title": "Sekip duran top",
          "durationMin": 20,
          "problem": "Bir top odanın duvarına çarpınca geri döner. Peki biz sahnede bir sprite'a \"saniyede şu kadar piksel git, duvara çarpınca geri dön\" demeyi nasıl öğretiriz? Bu derste kendi kendine hareket eden bir top yapacaksın. Hiçbir tuşa basmana gerek kalmayacak.",
          "contentMd": "Sahnede ortada duran bir top var. Arka plan düz bir renk. Sen topu hareket ettireceksin ve arka planı çimenle döşeyeceksin.\n\n### Hız ne demek?\nHız iki sayıdan oluşur: x hızı yatay, y hızı dikey gider. Birimi saniyede piksel. x hızı 50 ise sprite saniyede 50 piksel sağa gider. x hızı eksi bir sayıysa sola gider. y hızı pozitifse aşağı, eksi ise yukarı gider.\n\n### Blokları kur\n1. **Hareket** kategorisinden `[top] hızı x [30] y [0]` bloğunu al ve `oyun başlayınca` bloğunun içindeki son bloğun altına tak. İçindeki `bu sprite` yerine `top` değişkenini koy. x için 50, y için 35 yaz.\n2. ▶ düğmesine bas. Top ekranın dışına çıkıp gidiyor.\n3. **Sprite** kategorisinden `[top] [duvar/kenara çarpınca sekmeli]: [evet]` bloğunu al ve alta tak. Ayar ve değer listelerinden doğru seçenekleri seç.\n4. ↺ düğmesine bas. Top kenara çarpınca geri sekiyor.\n5. Arka planı güzelleştir: **Sahne / Harita** kategorisinden `arka planı [resim] resmiyle döşe` bloğunu al ve `oyun başlayınca` bloğunun içine tak. Resim olarak **Çimen**'i seç.\n6. Sahne şimdi çimenle kaplı. Top içinde sekiyor.\n\nBeklenen sonuç: Top sürekli sekip duruyor, 10 saniye sonra hâlâ ekranın içinde. Arka plan çimen döşemeli.\n\n### Nasıl çalışıyor?\n- `hızı` bloğu yalnız bir kez çalışır. Ama hız değeri sprite'ın üzerinde saklı kalır ve başka bir blok değiştirene kadar sprite aynı hızla gitmeye devam eder.\n- Sekmeli ayar açıkken sprite kenara ya da duvara çarpınca hızı ters döner. Eksi artı olur, artı eksi olur.\n- Döşeme, küçük bir resmi (16 x 16 piksel) tüm ekrana tekrar tekrar yan yana koyar.\n\n### Yönle gitmek\n`hızı x y` bloğu yerine `[top] [90] derece yönünde [40] hızla gitsin` bloğunu da kullanabilirsin. Yön derecedir: 0 yukarı, 90 sağ, 180 aşağı, 270 sol demektir. Sayıları değiştirerek topu çapraz yönlerde gönder.\n\n### Dene\n1. Topu 45 derece yönünde 60 hızla gönder. Hangi köşeye doğru gidiyor?\n2. `[top] dursun` bloğunu ekle ve hız bloğunun hemen ardına koy. Top ne yapıyor? Neden?\n3. Başka bir döşeme resmi dene: **Kum**, **Zemin** ya da **Su**.\n\n### Sık yapılan hatalar\n- `sekmeli` ayarı kapalıysa top kenarlardan çıkıp gider ve bir daha görünmez.\n- Çok yüksek hızda küçük bir sprite birkaç karede ekranı geçer. 400'ün üstüne çıkma.\n- Döşeme bloğunu yanlış yere (olay bloğunun dışına) bıraktıysan çalışmaz.",
          "question": "Hız eksi olunca sprite ters yöne gider. Oyunda bir sprite'ın duvara çarpınca geri dönmesi için başka hangi yolları düşünebilirsin?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Kendi kendine hareket eden sprite için **hız** vermeyi (x hızı ve y hızı)\n- Eksi ve artı hız değerlerinin hangi yöne gittiğini\n- **Sekme** ayarının ne yaptığını\n- Derece ile yön vermeyi (0 yukarı, 90 sağ)\n- Arka planı bir resimle döşemeyi\n\n### Önceden bilmen gerekenler\nDers 1: x ve y koordinatları, y'nin aşağı doğru arttığı. Ders 2: hızın \"saniyede piksel\" olduğu ve yol = hız x süre. Ders 3: bir bloğun yalnız bir kez çalışıp etkisinin sürmesi.\n\n### Hız iki sayıdır\nDers 2'de hızı tuşa bağlamıştık. Şimdi sprite'a kendi hızını veriyoruz. Hız iki parçadan oluşur: **x hızı** yatay, **y hızı** dikey gidişi söyler. İkisi de saniyede pikseldir.\n\n| Hız | Yön | Neden |\n|---|---|---|\n| x hızı artı | sağa | x sağa doğru büyür |\n| x hızı eksi | sola | x küçülür |\n| y hızı artı | aşağı | y aşağı doğru büyür |\n| y hızı eksi | yukarı | y küçülür |\n\nEksi hız ters yöne gitmek demektir. Hız bloğunu bir kez çalıştırırsın; değer sprite'ın üzerinde saklı kalır ve başka bir blok değiştirene kadar sprite aynı hızla gitmeye devam eder. `dursun` bloğu hızı sıfırlar.\n\nBir hesap: x hızı 40 olan top x 20'den başlarsa 3 saniye sonra x 20 + 40 x 3 = 140 noktasındadır.\n\n### Sekme\nSprite sahnenin kenarına varınca ne olacağını **sekme** ayarı belirler. `duvar/kenara çarpınca sekmeli: evet` açıkken sprite kenara çarpınca o yönün hızı ters döner: artı eksi, eksi artı olur. Böylece top içeride kalır ve sürekli gidip gelir. Ayar kapalıyken sprite kenardan çıkıp gider.\n\nDikkat: Ders 2'deki ekranda kalsın ayarı sprite'ı kenarda durdurur; sekme ise geri yollar. İkisi farklı işler yapar.\n\n### Derece ile yön\nx ve y vermek yerine yön ve hız da verebilirsin: `top 90 derece yönünde 40 hızla gitsin`. Dereceler pusula gibi okunur:\n\n```\n        0 (yukarı)\n270 (sol)   90 (sağ)\n       180 (aşağı)\n```\n\n45 derece, yukarı ile sağın tam ortasıdır; yani sağ üst çapraz. Dikkat: yukarı gitmek için 0 yazılır, 90 sağa götürür.\n\n### Döşenmiş arka plan\n`arka planı Çimen resmiyle döşe` bloğu küçük (16 x 16 piksellik) bir resmi tüm sahneye yan yana dizer. Tek renk yerine çimen, kum ya da su gibi bir zemin elde edersin. Bu blok da `oyun başlayınca` altında olmalıdır.\n\n### Özet\nHız, x hızı ve y hızı olmak üzere iki sayıdır; birimi saniyede pikseldir. Eksi sayı ters yöne götürür. Hız bir kez verilince sprite durana ya da hızı değişene kadar gider. Sekme ayarı kenara çarpan sprite'ın hızını ters çevirir. Yön vermek istersen 0 yukarı, 90 sağ, 180 aşağı, 270 soldur.",
          "concepts": [
            {
              "term": "x hızı ve y hızı",
              "definition": "Sprite'ın yatayda ve dikeyde saniyede kaç piksel gideceğini söyleyen iki sayı.",
              "example": "x hızı 50, y hızı 35 olan top sağa ve aşağıya, yani sağ alta doğru gider.",
              "pitfall": "Eksi y hızının aşağı gideceğini sanmak; y aşağı doğru arttığından eksi y hızı sprite'ı yukarı götürür."
            },
            {
              "term": "Sekme",
              "definition": "Sprite kenara ya da duvara çarpınca o yöndeki hızın ters dönmesini sağlayan ayar.",
              "example": "Sekmeli top sağ kenara çarpınca x hızı 50'den -50'ye döner ve sola gider.",
              "pitfall": "Sekme ayarını açmayı unutmak; top kenardan çıkıp gider ve bir daha görünmez."
            },
            {
              "term": "Yön (derece)",
              "definition": "Sprite'ı bir açıyla yürütmek için kullanılan sayı: 0 yukarı, 90 sağ, 180 aşağı, 270 sol.",
              "example": "45 derece, yukarı ile sağın ortasıdır; top sağ üst çapraza doğru gider.",
              "pitfall": "Yukarı için 90 yazmak; 90 sağdır, yukarı 0'dır."
            },
            {
              "term": "Hızın saklı kalması",
              "definition": "Hız bloğu bir kez çalışır ama değer sprite'ın üzerinde durur; başka bir blok değiştirene kadar sprite aynı hızla gider.",
              "example": "Oyun başlayınca hız verip başka bir şey yazmasan da top sürekli gider.",
              "pitfall": "Hareket için hız bloğunu tekrar tekrar çalıştırmak gerektiğini sanmak."
            },
            {
              "term": "Döşenmiş arka plan",
              "definition": "Küçük bir resmin tüm sahneye yan yana dizilmesiyle elde edilen zemin.",
              "example": "16 x 16 piksellik çimen resmi döşenince sahne çimenle kaplanır.",
              "pitfall": "Döşeme bloğunu oyun başlayınca bloğunun dışında bırakmak; çalışmaz ve zemin düz renk kalır."
            }
          ],
          "quiz": [
            {
              "id": "m11h1d4-q1",
              "kind": "mcq",
              "prompt": "Bir topun y hızı -30 olarak verildi (x hızı 0). Top hangi yöne gider?",
              "options": [
                "Aşağı",
                "Yukarı",
                "Sağa",
                "Sola"
              ],
              "answer": 1,
              "explanation": "y aşağı doğru artar, bu yüzden eksi y hızı yukarı götürür. Sağa ya da sola gitmek için x hızına bakılır; burada x hızı sıfır.",
              "skills": [
                "game-motion",
                "game-coords"
              ]
            },
            {
              "id": "m11h1d4-q2",
              "kind": "numeric",
              "prompt": "Top x 20 noktasında. x hızı 40, y hızı 0. Top kenara varmıyor. 3 saniye sonra topun x değeri kaç olur?",
              "answer": 140,
              "tolerance": 0,
              "explanation": "Yol = hız x süre = 40 x 3 = 120 piksel. Topun yeni yeri 20 + 120 = 140. Başlangıç değerini eklemeyi unutursan 120 bulursun, ama sorulan yol değil, topun x değeri.",
              "skills": [
                "game-motion",
                "game-coords"
              ]
            },
            {
              "id": "m11h1d4-q3",
              "kind": "predict-output",
              "prompt": "Top sağ kenara ulaştığında ne olur?\n\n```\noyun başlayınca\n  top = yeni Top sprite'ı, türü Nesne\n  top konumu x 80 y 60\n  top hızı x 50 y 0\n  top duvar/kenara çarpınca sekmeli: evet\n```",
              "options": [
                "Kenarda durur",
                "Ekrandan çıkar ve görünmez olur",
                "Geri döner ve sola doğru gider",
                "Yukarı doğru gitmeye başlar"
              ],
              "answer": 2,
              "explanation": "Sekme açıkken kenara çarpan sprite'ın o yöndeki hızı ters döner: 50 değeri -50 olur ve top sola gider. Durmak ekranda kalsın ayarının işidir; ekrandan çıkmak sekme kapalıyken olurdu. Y hızı sıfır olduğundan yukarı gitmez.",
              "skills": [
                "game-motion",
                "game-blocks"
              ]
            },
            {
              "id": "m11h1d4-q4",
              "kind": "find-bug",
              "prompt": "Top yukarı doğru gitmeli ama sağa gidiyor. Hata hangi satırda?\n\n```\n1  oyun başlayınca\n2    top = yeni Top sprite'ı, türü Nesne\n3    top konumu x 80 y 100\n4    top 90 derece yönünde 40 hızla gitsin\n```",
              "options": [
                "Satır 1: oyun başlayınca yanlış olay",
                "Satır 2: tür Nesne değil Oyuncu olmalı",
                "Satır 3: y değeri 100 olamaz",
                "Satır 4: 90 derece sağ demektir; yukarı için 0 derece yazılmalı"
              ],
              "answer": 3,
              "explanation": "Derece pusula gibidir: 0 yukarı, 90 sağ, 180 aşağı, 270 sol. Satır 4'te 90 yazıldığı için top sağa gider. Tür, olay ve konum değerlerinde sorun yok; y 100 sahne içinde geçerli bir değerdir.",
              "skills": [
                "game-debug",
                "game-motion"
              ]
            },
            {
              "id": "m11h1d4-q5",
              "kind": "mcq",
              "prompt": "Oyun başlayınca topa hız verdin ve başka hiçbir blok yazmadın. Top ne yapar?",
              "options": [
                "Hız saklı kaldığı için aynı hızla gitmeye devam eder",
                "Yalnızca bir adım gider ve durur",
                "Her karede hızı sıfırlanır, kıpırdamaz",
                "Yalnızca sahnenin ortasındayken gider"
              ],
              "answer": 0,
              "explanation": "Hız bloğu bir kez çalışır ama değer sprite'ta saklı kalır. Top, hızı değiştirecek ya da durduracak başka bir blok gelmedikçe aynı hızla devam eder.",
              "skills": [
                "game-motion",
                "game-blocks"
              ]
            }
          ],
          "contentEn": {
            "title": "The ball that keeps bouncing",
            "problem": "When a ball hits the wall of a room, it comes back. So how do we teach a sprite on the stage, \"go this many pixels a second, and come back when you hit the wall\"? In this lesson you will make a ball that moves on its own. You will not need to press any keys.",
            "contentMd": "There is a ball standing in the middle of the stage. The background is a plain colour. You will make the ball move and tile the background with grass.\n\n### What does speed mean?\nSpeed is made of two numbers: the x speed goes sideways, the y speed goes up and down. Its unit is pixels per second. If the x speed is 50, the sprite goes 50 pixels to the right every second. If the x speed is a minus number, it goes left. If the y speed is positive it goes down; if it is minus, it goes up.\n\n### Build the blocks\n1. From the **Motion** category, take the `set [top] speed x [30] y [0]` block and attach it under the last block inside the `when game starts` block. Put the `top` (ball) variable in place of the `this sprite` inside it. Type 50 for x and 35 for y.\n2. Press the ▶ button. The ball goes off the screen and away.\n3. From the **Sprite** category, take the `[top] [bounce off walls/edges]: [yes]` block and attach it underneath. Choose the right options from the setting and value lists.\n4. Press the ↺ button. The ball bounces back when it hits the edge.\n5. Make the background nicer: from the **Stage / Map** category, take the `tile background with picture [picture]` block and attach it inside the `when game starts` block. Choose **Grass** as the picture.\n6. The stage is now covered with grass. The ball bounces around on it.\n\nExpected result: The ball keeps bouncing, and after 10 seconds it is still inside the screen. The background is tiled with grass.\n\n### How does it work?\n- The `set speed` block runs only once. But the speed value stays stored on the sprite, and the sprite keeps going at the same speed until another block changes it.\n- With the bounce setting on, when the sprite hits an edge or a wall, its speed turns the other way. Minus becomes plus, plus becomes minus.\n- Tiling puts a small picture (16 x 16 pixels) next to itself again and again across the whole screen.\n\n### Going in a direction\nInstead of the `set speed x y` block, you can also use the `[top] moves in direction [90] degrees at speed [40]` block. The direction is in degrees: 0 means up, 90 right, 180 down, 270 left. Change the numbers to send the ball in diagonal directions.\n\n### Try it\n1. Send the ball in the 45 degree direction at speed 60. Which corner is it heading towards?\n2. Add the `[top] stops` block and put it straight after the speed block. What does the ball do? Why?\n3. Try another tile picture: **Sand**, **Floor** or **Water**.\n\n### Common mistakes\n- If the `bounce off walls/edges` setting is off, the ball goes out through the edges and is never seen again.\n- At a very high speed, a small sprite crosses the screen in a few frames. Do not go above 400.\n- If you dropped the tiling block in the wrong place (outside the event block), it does not work.",
            "question": "When the speed is minus, the sprite goes the opposite way. What other ways can you think of to make a sprite come back when it hits a wall in a game?",
            "explainerMd": "### What you will learn in this lesson\n- How to give a sprite that moves on its own a **speed** (x speed and y speed)\n- Which way minus and plus speed values go\n- What the **bounce** setting does\n- How to give a direction in degrees (0 up, 90 right)\n- How to tile the background with a picture\n\n### What you should know first\nLesson 1: x and y coordinates, and that y grows downwards. Lesson 2: that speed is \"pixels per second\" and distance = speed x time. Lesson 3: that a block can run only once and its effect lasts.\n\n### Speed is two numbers\nIn lesson 2 we linked speed to the keys. Now we give the sprite its own speed. Speed has two parts: the **x speed** tells you the sideways movement, the **y speed** the up-and-down movement. Both are in pixels per second.\n\n| Speed | Direction | Why |\n|---|---|---|\n| x speed plus | right | x grows to the right |\n| x speed minus | left | x gets smaller |\n| y speed plus | down | y grows downwards |\n| y speed minus | up | y gets smaller |\n\nA minus speed means going the opposite way. You run the speed block once; the value stays stored on the sprite, and the sprite keeps going at the same speed until another block changes it. The `stops` block sets the speed to zero.\n\nA calculation: if a ball with an x speed of 40 starts at x 20, after 3 seconds it is at the point x 20 + 40 x 3 = 140.\n\n### Bounce\nThe **bounce** setting decides what happens when a sprite reaches the edge of the stage. With `bounce off walls/edges: yes` on, when the sprite hits an edge, the speed in that direction turns the other way: plus becomes minus, minus becomes plus. So the ball stays inside and keeps going back and forth. With the setting off, the sprite goes out through the edge.\n\nWatch out: the stay on screen setting from lesson 2 stops the sprite at the edge; bounce sends it back. The two do different jobs.\n\n### Direction in degrees\nInstead of giving x and y, you can also give a direction and a speed: `top moves in direction 90 degrees at speed 40`. The degrees are read like a compass:\n\n```\n        0 (up)\n270 (left)   90 (right)\n       180 (down)\n```\n\n45 degrees is exactly halfway between up and right; so it is the top right diagonal. Watch out: to go up you write 0; 90 takes it to the right.\n\n### Tiled background\nThe `tile background with picture Grass` block lays a small (16 x 16 pixel) picture side by side across the whole stage. Instead of a single colour, you get a floor such as grass, sand or water. This block must be under `when game starts` too.\n\n### Summary\nSpeed is two numbers, the x speed and the y speed; its unit is pixels per second. A minus number takes it the opposite way. Once speed is given, the sprite keeps going until it stops or its speed changes. The bounce setting reverses the speed of a sprite that hits an edge. If you want to give a direction, 0 is up, 90 right, 180 down, 270 left.",
            "concepts": [
              {
                "term": "x speed and y speed",
                "definition": "Two numbers that tell you how many pixels a sprite goes sideways and up-and-down every second.",
                "example": "A ball with an x speed of 50 and a y speed of 35 goes right and down, so towards the bottom right.",
                "pitfall": "Thinking a minus y speed goes down; y grows downwards, so a minus y speed takes the sprite up."
              },
              {
                "term": "Bounce",
                "definition": "The setting that makes the speed in a direction turn the other way when the sprite hits an edge or a wall.",
                "example": "When a bouncing ball hits the right edge, its x speed turns from 50 to -50 and it goes left.",
                "pitfall": "Forgetting to turn the bounce setting on; the ball goes out through the edge and is never seen again."
              },
              {
                "term": "Direction (degrees)",
                "definition": "The number used to send a sprite at an angle: 0 up, 90 right, 180 down, 270 left.",
                "example": "45 degrees is halfway between up and right; the ball goes towards the top right diagonal.",
                "pitfall": "Writing 90 for up; 90 is right, up is 0."
              },
              {
                "term": "Speed stays stored",
                "definition": "The speed block runs once but the value stays on the sprite; the sprite goes at the same speed until another block changes it.",
                "example": "Even if you give a speed when the game starts and write nothing else, the ball keeps going.",
                "pitfall": "Thinking you need to run the speed block again and again to keep it moving."
              },
              {
                "term": "Tiled background",
                "definition": "A floor made by laying a small picture side by side across the whole stage.",
                "example": "When the 16 x 16 pixel grass picture is tiled, the stage is covered with grass.",
                "pitfall": "Leaving the tiling block outside the when game starts block; it does not run and the floor stays a plain colour."
              }
            ],
            "quiz": [
              {
                "id": "m11h1d4-q1",
                "kind": "mcq",
                "prompt": "A ball was given a y speed of -30 (x speed 0). Which way does the ball go?",
                "options": [
                  "Down",
                  "Up",
                  "Right",
                  "Left"
                ],
                "answer": 1,
                "explanation": "y grows downwards, so a minus y speed takes it up. To go right or left, you look at the x speed; here the x speed is zero.",
                "skills": [
                  "game-motion",
                  "game-coords"
                ]
              },
              {
                "id": "m11h1d4-q2",
                "kind": "numeric",
                "prompt": "The ball is at x 20. Its x speed is 40 and its y speed 0. The ball does not reach the edge. What is the ball's x value after 3 seconds?",
                "answer": 140,
                "tolerance": 0,
                "explanation": "Distance = speed x time = 40 x 3 = 120 pixels. The ball's new place is 20 + 120 = 140. If you forget to add the starting value you get 120, but the question asks for the ball's x value, not the distance.",
                "skills": [
                  "game-motion",
                  "game-coords"
                ]
              },
              {
                "id": "m11h1d4-q3",
                "kind": "predict-output",
                "prompt": "What happens when the ball reaches the right edge?\n\n```\nwhen game starts\n  top = new Ball sprite, kind Object\n  move top to x 80 y 60\n  set top speed x 50 y 0\n  top bounce off walls/edges: yes\n```",
                "options": [
                  "It stops at the edge",
                  "It leaves the screen and cannot be seen",
                  "It comes back and goes to the left",
                  "It starts going up"
                ],
                "answer": 2,
                "explanation": "With bounce on, the speed in that direction of a sprite that hits an edge turns the other way: the value 50 becomes -50 and the ball goes left. Stopping is the job of the stay on screen setting; leaving the screen would happen with bounce off. The y speed is zero, so it does not go up.",
                "skills": [
                  "game-motion",
                  "game-blocks"
                ]
              },
              {
                "id": "m11h1d4-q4",
                "kind": "find-bug",
                "prompt": "The ball should go up but it goes right. Which line is the bug in?\n\n```\n1  when game starts\n2    top = new Ball sprite, kind Object\n3    move top to x 80 y 100\n4    top moves in direction 90 degrees at speed 40\n```",
                "options": [
                  "Line 1: when game starts is the wrong event",
                  "Line 2: the kind should be Player, not Object",
                  "Line 3: the y value cannot be 100",
                  "Line 4: 90 degrees means right; for up you should write 0 degrees"
                ],
                "answer": 3,
                "explanation": "Degrees work like a compass: 0 up, 90 right, 180 down, 270 left. Line 4 says 90, so the ball goes right. There is nothing wrong with the kind, the event or the position values; y 100 is a valid value inside the stage.",
                "skills": [
                  "game-debug",
                  "game-motion"
                ]
              },
              {
                "id": "m11h1d4-q5",
                "kind": "mcq",
                "prompt": "You gave the ball a speed when the game starts and wrote no other blocks. What does the ball do?",
                "options": [
                  "It keeps going at the same speed, because the speed stays stored",
                  "It goes only one step and stops",
                  "Its speed is reset to zero every frame, so it does not move",
                  "It only moves while it is in the middle of the stage"
                ],
                "answer": 0,
                "explanation": "The speed block runs once but the value stays stored on the sprite. The ball keeps going at the same speed unless another block comes along to change its speed or stop it.",
                "skills": [
                  "game-motion",
                  "game-blocks"
                ]
              }
            ]
          }
        },
        {
          "title": "Proje: Gezgin kedi",
          "durationMin": 30,
          "problem": "İlk haftanı bitirmek üzeresin. Sahne kurmayı, sprite oluşturmayı, tuşla yürümeyi, düğmeye basınca bir şey yaptırmayı ve sekip duran bir nesne yapmayı öğrendin. Şimdi hepsini tek bir küçük oyuna dönüştürelim. Gezgin kedi çimenlerde dolaşırken sihirli yeteneklerini kullanacak.",
          "contentMd": "Projenin yarısı hazır: çimen bir arka plan, ok tuşlarıyla yürüyen ve ekranda kalan bir kedi ve ekranda sekip duran bir yıldız. Eksik olan yetenekleri sen ekleyeceksin.\n\n### Ne yapacaksın?\n- A düğmesi: kedi konuşsun ve bir melodi çalsın.\n- B düğmesi: ekranda bir patlama olsun ve kısa bir ses çıksın.\n- Sonra kendi fikirlerini ekle.\n\n### Önce çalıştır ve incele\n1. ▶ düğmesine basıp oyunu çalıştır. Kediyi yürüt, yıldızın sekişini izle.\n2. **Bloklar** sekmesinde `oyun başlayınca` bloğunu oku. Hangi blok ne işe yarıyor? Üç yer bul: döşenen arka plan, tuşla hareket ve sekmeli ayar.\n\n### A düğmesi: konuş ve melodi çal\n1. **Denetleyici** kategorisinden `[A] düğmesine [basılınca]` olayını çalışma alanına koy.\n2. **Sprite** kategorisinden `[kedi] [Merhaba!] desin, [2] saniye` bloğunu içine tak.\n3. **Ses** kategorisinden `[başlangıç] melodisini çal` bloğunu ekle.\n\n### B düğmesi: patlama\n1. `[B] düğmesine [basılınca]` olayını koy.\n2. **Oyun** kategorisinden `x [80] y [60] noktasında [renk] patlama` bloğunu içine tak. Renk olarak sarıyı seç.\n3. **Ses** kategorisinden `[300] Hz bip, [120] ms` bloğunu ekle.\n\n### Çalıştır ve dene\n1. ↺ düğmesine bas. A ve B tuşlarına bas.\n2. Hedefler panelinde yedi madde var. Hepsi yeşil mi?\n\nBeklenen sonuç: Kedi yürür, yıldız sekip durur. A'ya basınca kedi konuşur ve melodi çalar, B'ye basınca ekranda sarı bir patlama olur.\n\n### Nasıl çalışıyor?\nProje, bu haftanın bütün bloklarını birlikte kullanır:\n- `oyun başlayınca` olayı sahneyi kurar (ders 1).\n- Tuşla hareket ve **ekranda kalsın** ayarı kediyi yürütür (ders 2).\n- Düğme olayları kediye yetenek verir (ders 3).\n- Hız ve **sekmeli** ayar yıldızı hareket ettirir (ders 4).\n\n### Kendi dokunuşunu kat\nAşağıdakilerden en az ikisini yap. Hedefler bozulmasın, ama istediğin kadar ekleme yapabilirsin.\n1. B'ye basınca kedi başka bir resme (ör. **Astronot**) dönüşsün. `[kedi] resmi [resim]` bloğunu kullan.\n2. A'ya basınca ekrana bir mesaj yaz: `ekranda [Merhaba!] yaz, [2] saniye`.\n3. Patlama olunca ekran sallansın: `ekranı [300] ms salla`.\n4. `[A4] notası, [250] ms` ile kendi küçük melodini yaz: arka arkaya üç nota ekle.\n5. Yıldızı hızlandır ya da yavaşlat.\n\n### Sık yapılan hatalar\n- Bir olay bloğunun içine hiçbir şey takmazsan o düğme hiçbir şey yapmaz.\n- Aynı düğme için iki ayrı olay yazarsan ikisi de çalışır. Karışmasın diye bir düğmeye tek olay yaz.\n- Patlama bloğundaki x ve y ekranın dışında kalırsa patlamayı göremezsin. 0 ile 160 arasında x, 0 ile 120 arasında y kullan.",
          "question": "Oyunun en eğlenceli yeni yeteneği hangisi oldu? Bir arkadaşın bu oyunu oynarken A ve B düğmelerinin ne yaptığını nasıl anlasın? Oyuna bir yönerge mesajı eklesen ne yazardın?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Küçük bir oyunu önce **hedef listesine** bölerek planlamayı\n- Çalıştır, dene, düzelt döngüsüyle bir oyunu geliştirmeyi\n- Ekran sarsıntısı, patlama ve mesaj gibi **geri bildirim** efektlerini\n- Ses bloklarının (bip, nota, melodi) nasıl çalıştığını\n- Bir olayın içinde birden çok işi bir araya getirmeyi\n\n### Önceden bilmen gerekenler\nDers 1: sahne, sprite, değişken, `oyun başlayınca`. Ders 2: tuşla hareket, ekranda kalsın. Ders 3: düğme olayları, konuşma. Ders 4: hız, sekme, döşeme.\n\n### Oyunu hedeflere böl\nBüyük bir iş, küçük işlere bölünce kolaylaşır. Bu projenin yedi hedefi var; her biri bu haftanın bir dersinden gelir:\n\n| Hedef | Hangi dersten |\n|---|---|\n| Çimen zemin | Ders 4 (döşeme) |\n| Kedi yürür | Ders 2 (tuşla hareket) |\n| Kedi ekranda kalır | Ders 2 (ekranda kalsın) |\n| Yıldız sekip durur | Ders 4 (hız ve sekme) |\n| A: kedi konuşur | Ders 3 (konuşma) |\n| A: ses çalar | bu ders |\n| B: patlama | bu ders |\n\nHer hedefi tek tek yap, her birinden sonra oyunu çalıştırıp dene. Böylece bir şey bozulursa suçlunun son eklediğin blok olduğunu bilirsin. Buna **çalıştır, dene, düzelt** döngüsü denir.\n\n### Geri bildirim: oyun karşılık versin\nOyuncu bir şey yaptığında oyunun karşılık vermesi oyunu canlı kılar. Bu karşılığa geri bildirim diyoruz. Elinde şu araçlar var:\n\n| Blok | Etkisi |\n|---|---|\n| `x ... y ... noktasında ... patlama` | renkli parçacıklar saçar |\n| `ekranı ... ms salla` | sahne kısa süre titrer |\n| `ekranda ... yaz, ... saniye` | ortada bir mesaj gösterir |\n\nPatlamanın x değeri 0 ile 160, y değeri 0 ile 120 arasında olmalı ki sahnenin içinde rahatça görünsün. Ekranın ortası için x 80, y 60 uygundur.\n\n### Ses blokları\nÜç çeşit ses bloğu var: `bip` (bir frekans ve süre, Hz ve ms), `nota` (C4, A4 gibi bir müzik notası) ve hazır `melodi`. Frekans arttıkça ses incelir. Önemli bir ayrıntı: her ses bloğu çalıştığı anda sesi başlatır; bloklar birbirinin bitmesini beklemez. Peş peşe üç nota bloğu koyarsan üç nota art arda değil, aynı anda çalar. Notaları sıraya dizmek için zamanlama bloklarına ihtiyacın var; onları ilerleyen derslerde (Hafta 2) öğreneceksin. Şimdilik tek nota, tek bip ya da hazır melodi kullan.\n\n### Bir olaya birden çok iş koymak\nBir olayın altına istediğin kadar blok bağlayabilirsin. A düğmesi hem konuşma hem melodi içerebilir. Ama aynı düğme için iki ayrı olay yazarsan ikisi de çalışır; karışmasın diye bir düğmeye tek olay yaz ve işleri içine sırala.\n\n### Özet\nBüyük bir oyunu hedef listesine böl ve her hedeften sonra çalıştırıp dene. Patlama, sarsıntı ve mesaj oyunun oyuncuya karşılık vermesini sağlar; patlama koordinatları sahnenin içinde olmalıdır. Ses blokları çalıştığı anda sesi başlatır, birbirini beklemez. Bir düğmeye tek olay yaz ve tüm işleri onun içine koy.",
          "concepts": [
            {
              "term": "Hedef listesi",
              "definition": "Bir projeyi küçük, tek tek sınanabilen işlere bölen liste.",
              "example": "Gezgin kedi projesi yedi hedefe bölünür: zemin, yürüme, ekranda kalma, yıldız, konuşma, ses ve patlama.",
              "pitfall": "Bütün blokları tek seferde kurup sonunda denemek; bir şey bozulduğunda hangi bloğun suçlu olduğunu bulamazsın."
            },
            {
              "term": "Çalıştır, dene, düzelt",
              "definition": "Her küçük değişiklikten sonra oyunu baştan çalıştırıp sonucu kontrol etme alışkanlığı.",
              "example": "Patlama bloğunu ekledikten hemen sonra B'ye basıp patlamayı görürsün.",
              "pitfall": "Blokları değiştirdikten sonra oyunu baştan başlatmamak; sahne eski hâliyle çalışır."
            },
            {
              "term": "Geri bildirim",
              "definition": "Oyuncu bir şey yaptığında oyunun gösterdiği karşılık: patlama, ses, sarsıntı ya da mesaj.",
              "example": "B'ye basınca hem patlama hem kısa bir bip, oyuncuya tuşun çalıştığını gösterir.",
              "pitfall": "Patlama koordinatını sahnenin dışında seçmek; x 0-160, y 0-120 aralığı dışında kalırsa patlamayı göremezsin."
            },
            {
              "term": "Ses blokları",
              "definition": "Üç tür ses bloğu vardır: bip (Hz ve ms), nota (örneğin A4) ve hazır melodi.",
              "example": "300 Hz bip, 120 ms kısa bir tık sesi verir; başlangıç melodisi üç notalık bir giriş çalar.",
              "pitfall": "Art arda dizilen nota bloklarının sırayla çalacağını sanmak; her ses bloğu anında başlar, üç nota aynı anda duyulur."
            },
            {
              "term": "Tek olay, çok iş",
              "definition": "Bir düğmenin altındaki olaya istediğin kadar blok koyabilirsin; aynı düğme için ayrı olaylar da çalışır.",
              "example": "A olayının içine konuşma ve melodi blokları birlikte konabilir.",
              "pitfall": "Aynı düğme için iki ayrı olay yazmak; ikisi de çalışır ve neyin neden olduğu karışır."
            }
          ],
          "quiz": [
            {
              "id": "m11h1d5-q1",
              "kind": "predict-output",
              "prompt": "A düğmesine basılınca ne duyulur?\n\n```\nA düğmesine basılınca\n  C4 notası, 250 ms\n  E4 notası, 250 ms\n  G4 notası, 250 ms\n```",
              "options": [
                "Üç nota art arda çalar, toplam 750 ms sürer",
                "Üç nota aynı anda çalar, yaklaşık 250 ms sürer",
                "Yalnız son nota (G4) çalar",
                "Hiçbir ses çıkmaz; ses için melodi bloğu gerekir"
              ],
              "answer": 1,
              "explanation": "Ses blokları çalıştığı anda sesi başlatır ve birbirinin bitmesini beklemez. Üç blok aynı kare içinde çalıştığı için üç nota aynı anda duyulur. Nota blokları da tek başına ses çıkarır; melodi bloğu şart değildir.",
              "skills": [
                "game-effects",
                "game-blocks"
              ]
            },
            {
              "id": "m11h1d5-q2",
              "kind": "find-bug",
              "prompt": "Patlama B düğmesine basınca olmalıydı ama A'ya basınca oluyor. Hata hangisi?\n\n```\n1  A düğmesine basılınca\n2    kedi \"Merhaba!\" desin, 2 saniye\n3    x 80 y 60 noktasında sarı patlama\n4  B düğmesine basılınca\n5    ekranı 300 ms salla\n```",
              "options": [
                "Satır 2: konuşma bloğu silinmeli",
                "Satır 3: sarı yerine kırmızı patlama olmalı",
                "Satır 3: patlama bloğu A olayının içinde, B olayının içine taşınmalı",
                "Satır 5: sallama bloğu patlamadan önce gelmeli"
              ],
              "answer": 2,
              "explanation": "Bir olayın altındaki bloklar yalnız o olayda çalışır. Patlama bloğu A olayına bağlı olduğu için A'ya basınca patlar. Taşınınca B ile çalışır. Konuşma, renk ve sallama bloklarında sorun yok.",
              "skills": [
                "game-debug",
                "game-blocks",
                "game-effects"
              ]
            },
            {
              "id": "m11h1d5-q3",
              "kind": "numeric",
              "prompt": "B düğmesine basınca ekranı 300 ms salla bloğu çalışıyor. Oyun saniyede 60 kare çizdiğine göre sarsıntı yaklaşık kaç kare sürer?",
              "answer": 18,
              "tolerance": 1,
              "unit": "kare",
              "explanation": "300 ms = 0,3 saniye. Süre x saniyedeki kare sayısı = 0,3 x 60 = 18 kare. Milisaniyeyi saniyeye çevirmek için 1000'e bölersin.",
              "skills": [
                "game-effects",
                "game-motion"
              ]
            },
            {
              "id": "m11h1d5-q4",
              "kind": "mcq",
              "prompt": "Aynı düğme (örneğin B) için iki ayrı olay bloğu yazarsan ne olur?",
              "options": [
                "İkisi de çalışır",
                "Yalnız ilk yazdığın çalışır",
                "Yalnız son yazdığın çalışır",
                "Hiçbiri çalışmaz"
              ],
              "answer": 0,
              "explanation": "Her olay bloğu kendi başına bekler; B'ye basınca ikisi de tetiklenir. Karışmasın diye bir düğmeye tek olay yazıp işleri içine sıralamak daha düzenlidir.",
              "skills": [
                "game-blocks",
                "game-input"
              ]
            },
            {
              "id": "m11h1d5-q5",
              "kind": "mcq",
              "prompt": "Yedi hedefli bir projeyi geliştirirken en güvenli yol hangisidir?",
              "options": [
                "Bütün blokları kurup sonunda bir kez çalıştırmak",
                "Önce ses ve efektleri, hareketi en sona bırakmak",
                "Hata çıkınca tüm blokları silip baştan başlamak",
                "Bir hedefi bitirip çalıştırarak denemek, sonra sonraki hedefe geçmek"
              ],
              "answer": 3,
              "explanation": "Her adımdan sonra denemek, bir şey bozulduğunda suçlunun son eklediğin blok olduğunu gösterir. Hepsini birden kurmak hatayı bulmayı zorlaştırır; silip baştan başlamak da çalışan kısımları boşa harcar.",
              "skills": [
                "game-design",
                "game-debug"
              ]
            }
          ],
          "contentEn": {
            "title": "Project: The wandering cat",
            "problem": "You are about to finish your first week. You have learnt to set up a stage, make sprites, walk with keys, make something happen when a button is pressed and make an object that keeps bouncing. Now let's turn all of it into one small game. The wandering cat will use its magic abilities while it roams the grass.",
            "contentMd": "Half of the project is ready: a grass background, a cat that walks with the arrow keys and stays on the screen, and a star that keeps bouncing around the screen. You will add the missing abilities.\n\n### What will you do?\n- A button: the cat talks and plays a melody.\n- B button: there is an explosion on the screen and a short sound.\n- Then add your own ideas.\n\n### Run it and look first\n1. Press the ▶ button to run the game. Walk the cat and watch the star bounce.\n2. In the **Blocks** tab, read the `when game starts` block. Which block does what? Find three places: the tiled background, the key movement and the bounce setting.\n\n### A button: talk and play a melody\n1. From the **Controller** category, put the `when [A] button is [pressed]` event into the work area.\n2. From the **Sprite** category, attach the `[kedi] says [Hello!] for [2] seconds` block inside it.\n3. From the **Sound** category, add the `play melody [start]` block.\n\n### B button: explosion\n1. Put in the `when [B] button is [pressed]` event.\n2. From the **Game** category, attach the `[color] explosion at x [80] y [60]` block inside it. Choose yellow as the colour.\n3. From the **Sound** category, add the `beep [300] Hz for [120] ms` block.\n\n### Run it and try it\n1. Press the ↺ button. Press the A and B keys.\n2. There are seven items in the Goals panel. Are they all green?\n\nExpected result: The cat walks and the star keeps bouncing. When you press A the cat talks and a melody plays; when you press B there is a yellow explosion on the screen.\n\n### How does it work?\nThe project uses all of this week's blocks together:\n- The `when game starts` event sets up the stage (lesson 1).\n- Key movement and the **stay on screen** setting make the cat walk (lesson 2).\n- Button events give the cat abilities (lesson 3).\n- Speed and the **bounce** setting move the star (lesson 4).\n\n### Add your own touch\nDo at least two of the following. Do not break the goals, but you can add as much as you like.\n1. When B is pressed, the cat turns into another picture (e.g. **Astronaut**). Use the `set [kedi] picture to [picture]` block.\n2. When A is pressed, write a message on the screen: `show [Hello!] on screen for [2] seconds`.\n3. Shake the screen when there is an explosion: `shake screen for [300] ms`.\n4. Write your own little melody with `play note [A4] for [250] ms`: add three notes one after another.\n5. Make the star faster or slower.\n\n### Common mistakes\n- If you do not attach anything inside an event block, that button does nothing.\n- If you write two separate events for the same button, both of them run. So that things do not get mixed up, write a single event for each button.\n- If the x and y in the explosion block are outside the screen, you cannot see the explosion. Use an x between 0 and 160 and a y between 0 and 120.",
            "question": "Which new ability was the most fun in the game? How would a friend playing this game work out what the A and B buttons do? If you added an instructions message to the game, what would you write?",
            "explainerMd": "### What you will learn in this lesson\n- How to plan a small game by first splitting it into a **goal list**\n- How to develop a game with the run, try, fix loop\n- **Feedback** effects such as screen shake, explosions and messages\n- How the sound blocks (beep, note, melody) work\n- How to bring several jobs together inside one event\n\n### What you should know first\nLesson 1: stage, sprite, variable, `when game starts`. Lesson 2: key movement, stay on screen. Lesson 3: button events, talking. Lesson 4: speed, bounce, tiling.\n\n### Split the game into goals\nA big job gets easier when you split it into small jobs. This project has seven goals; each one comes from one of this week's lessons:\n\n| Goal | From which lesson |\n|---|---|\n| Grass floor | Lesson 4 (tiling) |\n| The cat walks | Lesson 2 (key movement) |\n| The cat stays on the screen | Lesson 2 (stay on screen) |\n| The star keeps bouncing | Lesson 4 (speed and bounce) |\n| A: the cat talks | Lesson 3 (talking) |\n| A: a sound plays | this lesson |\n| B: explosion | this lesson |\n\nDo each goal one at a time, and after each one run the game and try it. Then if something breaks, you know the culprit is the block you added last. This is called the **run, try, fix** loop.\n\n### Feedback: let the game respond\nWhen the player does something, the game responding makes the game feel alive. We call this response feedback. You have these tools:\n\n| Block | Its effect |\n|---|---|\n| `... explosion at x ... y ...` | throws out coloured sparkles |\n| `shake screen for ... ms` | the stage shakes for a short time |\n| `show ... on screen for ... seconds` | shows a message in the middle |\n\nThe explosion's x value should be between 0 and 160 and its y value between 0 and 120, so that it is easy to see inside the stage. For the middle of the screen, x 80, y 60 is a good choice.\n\n### Sound blocks\nThere are three kinds of sound block: `beep` (a frequency and a time, Hz and ms), `play note` (a music note such as C4 or A4) and a ready-made `play melody`. The higher the frequency, the higher the sound. An important detail: each sound block starts its sound the moment it runs; the blocks do not wait for each other to finish. If you put three note blocks one after another, the three notes do not play one after another; they play at the same time. To line notes up in order, you need timing blocks; you will learn them in the coming lessons (week 2). For now, use a single note, a single beep or a ready-made melody.\n\n### Putting several jobs in one event\nYou can connect as many blocks as you like under an event. The A button can hold both the talking and the melody. But if you write two separate events for the same button, both of them run; so that things do not get mixed up, write a single event for each button and put the jobs in order inside it.\n\n### Summary\nSplit a big game into a goal list, and run it and try it after each goal. Explosions, shakes and messages let the game respond to the player; explosion coordinates must be inside the stage. Sound blocks start their sound the moment they run and do not wait for each other. Write a single event for each button and put all the jobs inside it.",
            "concepts": [
              {
                "term": "Goal list",
                "definition": "A list that splits a project into small jobs you can test one at a time.",
                "example": "The wandering cat project splits into seven goals: floor, walking, staying on the screen, star, talking, sound and explosion.",
                "pitfall": "Building all the blocks in one go and only trying at the end; when something breaks, you cannot find which block is the culprit."
              },
              {
                "term": "Run, try, fix",
                "definition": "The habit of running the game again from the beginning after every small change and checking the result.",
                "example": "Straight after adding the explosion block, you press B and see the explosion.",
                "pitfall": "Not restarting the game after changing the blocks; the stage runs the old version."
              },
              {
                "term": "Feedback",
                "definition": "The response the game shows when the player does something: an explosion, a sound, a shake or a message.",
                "example": "When you press B, an explosion plus a short beep show the player that the key worked.",
                "pitfall": "Choosing an explosion position outside the stage; if it is outside x 0-160, y 0-120, you cannot see the explosion."
              },
              {
                "term": "Sound blocks",
                "definition": "There are three kinds of sound block: beep (Hz and ms), note (for example A4) and a ready-made melody.",
                "example": "A 300 Hz beep for 120 ms gives a short click; the start melody plays a three-note intro.",
                "pitfall": "Thinking note blocks lined up one after another will play in order; each sound block starts at once, so the three notes are heard at the same time."
              },
              {
                "term": "One event, many jobs",
                "definition": "You can put as many blocks as you like in the event under a button; separate events for the same button also run.",
                "example": "The talking and melody blocks can go together inside the A event.",
                "pitfall": "Writing two separate events for the same button; both run and it gets confusing what causes what."
              }
            ],
            "quiz": [
              {
                "id": "m11h1d5-q1",
                "kind": "predict-output",
                "prompt": "What do you hear when the A button is pressed?\n\n```\nwhen A button is pressed\n  play note C4 for 250 ms\n  play note E4 for 250 ms\n  play note G4 for 250 ms\n```",
                "options": [
                  "The three notes play one after another, 750 ms in total",
                  "The three notes play at the same time, for about 250 ms",
                  "Only the last note (G4) plays",
                  "No sound comes out; you need a melody block for sound"
                ],
                "answer": 1,
                "explanation": "Sound blocks start their sound the moment they run and do not wait for each other to finish. The three blocks run in the same frame, so the three notes are heard at the same time. Note blocks make a sound on their own too; a melody block is not needed.",
                "skills": [
                  "game-effects",
                  "game-blocks"
                ]
              },
              {
                "id": "m11h1d5-q2",
                "kind": "find-bug",
                "prompt": "The explosion should happen when the B button is pressed, but it happens when A is pressed. Which is the bug?\n\n```\n1  when A button is pressed\n2    kedi says \"Hello!\" for 2 seconds\n3    yellow explosion at x 80 y 60\n4  when B button is pressed\n5    shake screen for 300 ms\n```",
                "options": [
                  "Line 2: the talking block should be deleted",
                  "Line 3: it should be a red explosion instead of yellow",
                  "Line 3: the explosion block is inside the A event; it should be moved into the B event",
                  "Line 5: the shake block should come before the explosion"
                ],
                "answer": 2,
                "explanation": "The blocks under an event only run in that event. The explosion block is connected to the A event, so it explodes when A is pressed. Once it is moved, it runs with B. There is nothing wrong with the talking, colour or shake blocks.",
                "skills": [
                  "game-debug",
                  "game-blocks",
                  "game-effects"
                ]
              },
              {
                "id": "m11h1d5-q3",
                "kind": "numeric",
                "prompt": "When the B button is pressed, the shake screen for 300 ms block runs. The game draws 60 frames a second, so about how many frames does the shake last?",
                "answer": 18,
                "tolerance": 1,
                "unit": "frames",
                "explanation": "300 ms = 0.3 seconds. Time x frames per second = 0.3 x 60 = 18 frames. To turn milliseconds into seconds, you divide by 1000.",
                "skills": [
                  "game-effects",
                  "game-motion"
                ]
              },
              {
                "id": "m11h1d5-q4",
                "kind": "mcq",
                "prompt": "What happens if you write two separate event blocks for the same button (for example B)?",
                "options": [
                  "Both of them run",
                  "Only the one you wrote first runs",
                  "Only the one you wrote last runs",
                  "Neither of them runs"
                ],
                "answer": 0,
                "explanation": "Each event block waits on its own; when you press B, both are triggered. So that things do not get mixed up, it is tidier to write a single event for each button and put the jobs in order inside it.",
                "skills": [
                  "game-blocks",
                  "game-input"
                ]
              },
              {
                "id": "m11h1d5-q5",
                "kind": "mcq",
                "prompt": "What is the safest way to develop a project with seven goals?",
                "options": [
                  "Build all the blocks and run it once at the end",
                  "Do the sounds and effects first and leave the movement until last",
                  "When there is a bug, delete all the blocks and start again",
                  "Finish one goal, run it to try it, then move on to the next goal"
                ],
                "answer": 3,
                "explanation": "Trying after every step shows you that, when something breaks, the culprit is the block you added last. Building everything at once makes the bug hard to find; deleting and starting again wastes the parts that work.",
                "skills": [
                  "game-design",
                  "game-debug"
                ]
              }
            ]
          }
        }
      ]
    },
    {
      "title": "Çarpışma ve skor",
      "project": "Meyve avı",
      "guideMd": "### Hafta hedefleri\nBu haftanın sonunda öğrenci:\n1. Çarpışma olayını kurabilir; `bu sprite` ile `diğer sprite` farkını ve sprite türünün rolünü açıklayabilir.\n2. Skoru `yap` ve `değiştir` blokları ile yönetebilir; `eğer ... ise` ile skora bağlı karar verdirebilir.\n3. `her ... ms'de bir` olayı ve rastgele sayıyla gökten düşen nesneler üretebilir; ekran dışına çıkanları silmeyi bilir.\n4. Can sayısını yönetebilir; `can bitince` ve `süre bitince` olaylarında oyunu kendisi bitirebilir.\n5. Amaç, risk ve sondan oluşan eksiksiz bir oyun (Meyve avı) tamamlayabilir.\n\n### Haftanın planı\nHafta beş derstir; her ders yaklaşık 20-35 dakikadır. Plan günde bir ders içindir.\n\n| Gün | Ders | Süre | Ne yapılır |\n|---|---|---|---|\n| 1 | Elmayı ye, hayaleti patlat | ~20 dk | Anlatımı oku, çarpışma olaylarını kur, `bu sprite` ve `diğer sprite` farkını dene, mini testi çöz. |\n| 2 | Üç meyveyi topla, oyunu kazan | ~22 dk | Skor bloklarını kur, `eğer skor = 3` ile kazanmayı ekle, `=` ve `≥` farkını dene. |\n| 3 | Gökten meyve yağsın | ~25 dk | `her 800 ms'de bir` olayını kur, rastgele konum ve hız ver, silinsin ayarını aç ve kapatıp farkı gör. |\n| 4 | Bombadan kaç, canını koru | ~22 dk | Bomba çarpışmasını, canı, sallanmayı ve `can bitince` olayını yaz. |\n| 5 | Proje: Meyve avı | ~35 dk | Eksikleri tamamla (ceza, geri sayım, kazanma, kaybetme), oyunu oyna, dengele ve ölçütle değerlendir. |\n\n### Ön koşul kontrolü\nHafta 1'den şunlar gerekir. Başlamadan kontrol et:\n- Bloğu çalışma alanına sürükleyip başka bloğa takabiliyor mu?\n- `oyun başlayınca` içinde yeni sprite oluşturup konum verebiliyor mu?\n- Ok tuşlarıyla sprite'ı yürütebiliyor mu ve hız bloğunun x ve y'sini ayırt ediyor mu?\n- Değişken oluşturup sprite'ı onda tutabiliyor mu?\n- ▶ ve ↺ düğmelerinin ne yaptığını biliyor mu?\n\n### Kavram haritası\n- **Etkileşim:** sprite kutusu → çarpışma → çarpışma olayı → `bu sprite` / `diğer sprite` → sprite türü\n- **Durum:** skor (`yap`, `değiştir`) → koşul → `eğer ... ise` → `=` ve `≥`\n- **Üretim:** `her ... ms'de bir` → yeni sprite → rastgele sayı → hız (piksel/sn) → silinsin ayarı\n- **Risk:** can → tehlike olayı → geri bildirim (ses, sallanma) → `can bitince`\n- **Bütün oyun:** amaç + risk + son → olaylara bölme → geri sayım → `süre bitince` → denge\n\n### Sık yapılan hatalar\n- **`bu sprite` ile `diğer sprite`'ı karıştırmak.** Yanlış sprite silinir; çoğu zaman kedi kaybolur.\n- **Sprite türünü yanlış seçmek.** Olay hiç çalışmaz; hayalet ve bomba Düşman, meyve Yiyecek olmalı.\n- **`skoru yap` ile `skoru değiştir`'i karıştırmak.** İlki skoru sabitler, ikincisi ekler.\n- **Hedefi `=` ile kontrol etmek.** Skor hedefi atlarsa oyun hiç kazanılmaz; `≥` daha güvenlidir.\n- **Hız bloğunda 0'ı yanlış eksene yazmak.** Meyve düşmez, yana kayar.\n- **Ekrandan çıkanları silmemek.** Sprite sayısı birikir, 500'ü geçince oyun hata verir.\n- **`can bitince` ya da `süre bitince` içinde oyunu bitirmeyi unutmak.** Oyun sıfır canla ya da sıfır süreyle devam eder.\n- **Geri sayım bloğunu bir olayın dışında bırakmak.** Süre hiç başlamaz.\n\n### Hafta sonu tekrarı\n1. Her dersin kavram kartlarına bir kez daha bak ve \"sık yapılan yanlış\" satırlarını yüksek sesle oku.\n2. Mini testlerde yanlış yaptığın soruların açıklamalarını yeniden oku, sonra soruyu yeniden çöz.\n3. Meyve avını bakmadan yeniden kur: önce çarpışmalar, sonra skor, düşen nesneler, can, en son geri sayım.\n4. Sayıları değiştir ve tahmin et: süreyi 30 saniyeye indirirsen oyun nasıl değişir? Hedefi 12 yaparsan?\n5. Kendi cümlelerinle şu soruyu cevapla: \"Bir oyunun amacı, riski ve sonu ne işe yarar?\"\n\nHafta sonu testi olarak beş dersin mini testleri yeterlidir; her derste 5 soru, toplam 25 soru. Hedef: her dersten en az 4 doğru. Eksik kalan dersin anlatımına dön.\n\n### Proje değerlendirme ölçütü (Meyve avı)\n| Ölçüt | Gelişmeli | Yeterli | İleri |\n|---|---|---|---|\n| Çarpışmalar | Meyve ya da bomba çarpışması çalışmıyor | Meyve skoru artırıyor, bomba can götürüyor ve ikisi de siliniyor | Geri bildirim eklenmiş (ses, sallanma, mesaj) |\n| Kurallar | Kazanma ya da kaybetme yok | Skor 8 olunca kazanma, can ya da süre bitince kaybetme var | Hedef ve süre oynanarak dengelenmiş |\n| Zaman | Geri sayım başlamıyor | 45 saniyelik sayım var ve süre bitince oyun kaybediliyor | Kalan süre mesajda kullanılıyor |\n| Karar | `=` ile kontrol, bilmeden yazılmış | Kazanma `≥` ile yazılmış | Neden `≥` seçtiğini anlatıyor |\n| Anlatım | Ne yaptığını anlatamıyor | Oyunun amacını, riskini ve sonunu söylüyor | Arkadaşından aldığı geri bildirimle bir şeyi değiştiriyor |\n\n### Veli ve öğretmen notu\n- **Amaç.** Bu hafta oyun yapmanın \"bir şeyin başka bir şeye değince ne olacağını tasarlamak\" olduğunu görmek; ezber değil. Hata yapmak güvenlidir, ↺ ile baştan başlanır.\n- **Nasıl destek olunur?** Takıldığında cevabı söylemek yerine sor: \"Hangi iki şey değince bu olmalıydı?\", \"Türleri doğru seçtin mi?\", \"Skoru bu bloktan sonra mı kontrol ediyorsun?\", \"Oyunu kim bitiriyor?\"\n- **Oyun testi.** Çocuk oyununu bir arkadaşına ya da aileden birine oynatsın ve nerede zorlandığını izlesin. Oyun tasarımının yarısı oynayanı izlemektir.\n- **Süre.** Dersleri aralıklı yapmak kalıcılığı artırır. Her ders arasında kısa bir tekrar yeterlidir.\n- **Ekran süresi ve güvenlik.** Bu platformdaki her şey sanaldır ve kişisel veri istemez. Oyun yapmak oyun oynamaktan farklıdır; ara vermeyi unutmayın.\n- **İlerleme.** Mini test sonuçları \"İlerlemem\" sayfasında beceri bazında görünür (taslak/pilot özellik; yalnız onay verildiyse kaydedilir).",
      "guideMdEn": "### Week goals\nBy the end of this week the learner:\n1. Can set up a collision event; can explain the difference between `this sprite` and `other sprite` and the role of a sprite's kind.\n2. Can manage the score with the `set` and `change` blocks; can make a decision based on the score with `if ... do`.\n3. Can produce objects falling from the sky with the `every ... ms` event and a random number; knows how to delete the ones that leave the screen.\n4. Can manage the number of lives; can end the game themselves in the `when lives run out` and `when time runs out` events.\n5. Can complete a full game (Fruit hunt) made of a goal, a risk and an ending.\n\n### Plan for the week\nThe week has five lessons; each lesson is about 20-35 minutes. The plan is for one lesson a day.\n\n| Day | Lesson | Time | What you do |\n|---|---|---|---|\n| 1 | Eat the apple, pop the ghost | ~20 min | Read the explainer, set up the collision events, try the difference between `this sprite` and `other sprite`, do the mini quiz. |\n| 2 | Collect three fruits, win the game | ~22 min | Build the score blocks, add winning with `if score = 3`, try the difference between `=` and `≥`. |\n| 3 | Let it rain fruit | ~25 min | Set up the `every 800 ms` event, give a random position and speed, turn the delete setting on and off and see the difference. |\n| 4 | Dodge the bombs, keep your lives | ~22 min | Write the bomb collision, the lives, the shaking and the `when lives run out` event. |\n| 5 | Project: Fruit hunt | ~35 min | Fill in what is missing (penalty, countdown, winning, losing), play the game, balance it and assess it with the rubric. |\n\n### Prerequisite check\nThe following are needed from week 1. Check before you start:\n- Can they drag a block into the work area and attach it to another block?\n- Can they make a new sprite inside `when game starts` and give it a position?\n- Can they walk a sprite with the arrow keys, and can they tell apart the x and y of the speed block?\n- Can they make a variable and hold a sprite in it?\n- Do they know what the ▶ and ↺ buttons do?\n\n### Concept map\n- **Interaction:** sprite box → collision → collision event → `this sprite` / `other sprite` → sprite kind\n- **State:** score (`set`, `change`) → condition → `if ... do` → `=` and `≥`\n- **Producing:** `every ... ms` → new sprite → random number → speed (pixels/s) → delete setting\n- **Risk:** lives → danger event → feedback (sound, shaking) → `when lives run out`\n- **The whole game:** goal + risk + ending → splitting into events → countdown → `when time runs out` → balance\n\n### Common mistakes\n- **Mixing up `this sprite` and `other sprite`.** The wrong sprite is deleted; most of the time the cat disappears.\n- **Choosing the wrong sprite kind.** The event never runs; the ghost and the bomb must be Enemy, the fruit Food.\n- **Mixing up `set score to` and `change score by`.** The first fixes the score, the second adds.\n- **Checking the target with `=`.** If the score jumps over the target, the game is never won; `≥` is safer.\n- **Writing the 0 on the wrong axis in the speed block.** The fruit does not fall; it slides sideways.\n- **Not deleting the ones that leave the screen.** The number of sprites piles up, and when it passes 500 the game gives an error.\n- **Forgetting to end the game inside `when lives run out` or `when time runs out`.** The game carries on with zero lives or zero time.\n- **Leaving the countdown block outside an event.** The time never starts.\n\n### End-of-week review\n1. Look at each lesson's concept cards once more and read the \"common mistake\" lines out loud.\n2. Read again the explanations of the questions you got wrong in the mini quizzes, then do the question again.\n3. Build the fruit hunt again without looking: first the collisions, then the score, the falling objects, the lives and last of all the countdown.\n4. Change the numbers and predict: if you cut the time to 30 seconds, how does the game change? And if you make the target 12?\n5. Answer this question in your own words: \"What are a game's goal, risk and ending for?\"\n\nThe five lessons' mini quizzes are enough as an end-of-week test; 5 questions in each lesson, 25 questions in total. Target: at least 4 right in each lesson. Go back to the explainer of any lesson that falls short.\n\n### Project assessment rubric (Fruit hunt)\n| Criterion | Developing | Secure | Advanced |\n|---|---|---|---|\n| Collisions | The fruit or bomb collision does not work | The fruit raises the score, the bomb takes a life and both are deleted | Feedback has been added (sound, shaking, message) |\n| Rules | There is no winning or losing | There is winning when the score is 8, and losing when the lives or time run out | The target and time have been balanced by playing with them |\n| Time | The countdown does not start | There is a 45 second countdown and the game is lost when the time runs out | The time left is used in a message |\n| Decision | Checked with `=`, written without understanding | Winning is written with `≥` | Explains why they chose `≥` |\n| Explanation | Cannot explain what they did | States the game's goal, risk and ending | Changes something based on feedback from a friend |\n\n### Note for parents and teachers\n- **Aim.** This week the aim is to see that making a game means \"designing what happens when one thing touches another\", not memorising. Making mistakes is safe; you start again with ↺.\n- **How to help.** When they get stuck, instead of giving the answer, ask: \"Which two things should have touched for this to happen?\", \"Did you choose the right kinds?\", \"Are you checking the score after this block?\", \"Who ends the game?\"\n- **Game testing.** Let the child have a friend or someone in the family play their game, and watch where they struggle. Half of game design is watching the player.\n- **Time.** Spacing the lessons out helps learning stick. A short review between lessons is enough.\n- **Screen time and safety.** Everything on this platform is virtual and no personal data is asked for. Making games is different from playing games; do not forget to take breaks.\n- **Progress.** Mini quiz results appear skill by skill on the \"My progress\" page (a draft/pilot feature; recorded only if consent has been given).",
      "lessons": [
        {
          "title": "Elmayı ye, hayaleti patlat",
          "durationMin": 20,
          "problem": "Bir oyunu oyun yapan şey, nesnelerin birbirine dokunduğunda bir şey olmasıdır. Kedi elmaya değince elma yok olur. Kedi hayalete değince bir şeyler patlar. Bilgisayar iki resmin üst üste geldiğini nasıl fark eder? Ve \"hangisi hangisine değdi?\" sorusunu nasıl cevaplar?",
          "contentMd": "Sahnede kedi (Oyuncu), sağ üstte bir elma (Yiyecek) ve sağ altta bir hayalet (Düşman) var. Ok tuşlarıyla kediyi yürüt. Şimdilik hiçbir şey olmuyor.\n\n### Çarpışma olayı\nOyun Atölyesi iki sprite'ın üst üste gelip gelmediğini her kare kontrol eder. Bu kontrol **çarpışma** diye geçer. Sen yalnızca hangi türlerin çarpışınca ne olacağını söylersin.\n\nÇarpışma olayında iki sprite vardır:\n- `bu sprite`: Olayın başındaki türden olan, yani ilk sprite. (Bu derste kedi.)\n- `diğer sprite`: Çarpılan, ikinci sprite. (Elma ya da hayalet.)\n\n### Blokları kur\n1. **Sprite** kategorisinden `bir [Oyuncu] sprite'ı bir [Yiyecek] sprite'ına çarpınca` olay bloğunu çalışma alanına bırak.\n2. Aynı kategoriden `[bu sprite] sprite'ını sil` bloğunu al ve olayın içine tak. İçindeki `bu sprite` yerine `diğer sprite` bloğunu (aynı kategoride) sürükle. Bu sayede kedi değil, elma silinir.\n3. ▶ düğmesine bas ve kediyi elmaya götür. Elma yok olur.\n4. İkinci bir olay bloğu getir: `bir [Oyuncu] sprite'ı bir [Düşman] sprite'ına çarpınca`.\n5. İçine `[diğer sprite] patlayıp yok olsun` bloğunu koy.\n6. ↺ düğmesine bas ve bu kez hayaleti ziyaret et. Hayalet parçacıklarla patlar.\n7. İstersen elma olayına **Ses** kategorisinden `[puan] melodisini çal` bloğunu da ekle.\n\nBeklenen sonuç: Elmaya değince elma kaybolur. Hayalete değince hayalet patlayarak kaybolur.\n\n### Nasıl çalışıyor?\n- Olay bloğundaki türler sprite'ın **adını** değil **türünü** söyler. Aynı türden birçok sprite varsa hepsi için çalışır.\n- Çarpışma olayı iki sprite üst üste geldiği anda **bir kez** çalışır. Kedi elmanın üstünde dursa bile her karede tekrar tekrar çalışmaz.\n- `patlayıp yok olsun` bloğu `sil` bloğunun efektli hâlidir. Sprite'ı kaldırır ve parçacıklar saçar.\n\n### Dene\n1. Kediyi sil: `bu sprite`'ı sil ve ne olduğunu gör. Sonra düzelt.\n2. Hayalet yerine kedi patlasın. Hangi bloğu değiştirmelisin?\n3. Sahneye ikinci bir elma ekle (**Değişken oluştur...** ile `elma2`, `yeni [Elma] sprite'ı, türü [Yiyecek]` ve bir konum). Aynı olay iki elma için de çalışıyor mu?\n\n### Sık yapılan hatalar\n- `diğer sprite` yerine `bu sprite` koyarsan yanlış sprite silinir. Çoğu zaman kedi silinir ve oyun biter gibi görünür.\n- Sprite türü yanlışsa olay hiç çalışmaz. Elma türü **Yiyecek**, hayalet türü **Düşman** olmalı.\n- Olay bloğunu `oyun başlayınca` bloğunun içine koyma. Olay bloğu hep çalışma alanında tek başına durur.",
          "question": "Çarpışma yalnız \"dokunma\" demek değildir: iki şeyin birbirine değmesi bir oyunda nelere yol açabilir? Sen bir oyun tasarlasaydın hangi iki sprite'ın çarpışmasından ne çıksın isterdin?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Bilgisayarın iki resmin değdiğini nasıl anladığını\n- **Çarpışma olayı** bloğunu ve içindeki `bu sprite` ile `diğer sprite` farkını\n- Sprite **türünün** neden önemli olduğunu\n- Bir çarpışmaya birden çok tepki bağlamayı (silmek, patlatmak, ses çalmak)\n\n### Önceden bilmen gerekenler\nDers 1'den sprite oluşturmayı ve konumunu; ders 2'den oyuncuyu ok tuşlarıyla yürütmeyi; ders 4'ten hız vermeyi. Ders 3'ten olay bloklarının (bir şey olunca çalışan bloklar) mantığını.\n\n### Her sprite'ın görünmez bir kutusu var\nOyun Atölyesi her sprite'ın etrafına, resmin dolu kısmını saran görünmez bir **dikdörtgen** çizer. İki dikdörtgenin içi birbirine girerse iki sprite **çarpışmış** sayılır. Resmin boş, saydam köşeleri sayılmaz. Bu kontrol saniyede 60 kez yapılır; sen yalnızca sonucu duyarsın.\n\n```\nKedi kutusu:  x = 70..86\nElma kutusu:  x = 80..90   -> 80 ile 86 arası ortak, çarpışma var\nElma kutusu:  x = 100..110 -> ortak yer yok, çarpışma yok\n```\n\n### Çarpışma olayı ve iki sprite\nBlok şöyle okunur: \"bir Oyuncu bir Yiyecek'e çarpınca, şunları yap.\" İçinde iki özel sprite vardır:\n\n| Blok | Anlamı | Bu derste |\n|---|---|---|\n| `bu sprite` | Olayın ilk türünden olan | kedi |\n| `diğer sprite` | Olayın ikinci türünden olan | elma ya da hayalet |\n\nElmayı silmek istiyorsan `diğer sprite`'ı silersin. `bu sprite`'ı silersen kedi kaybolur.\n\n### Tür, ad değildir\nOlay bloğundaki \"Oyuncu\" ya da \"Yiyecek\" bir sprite'ın **türüdür**. Aynı türden on elman olsa, tek bir olay bloğu hepsi için çalışır. Türü yanlış seçersen olay hiç çalışmaz, çünkü o türden sprite sahnede yoktur.\n\n### Aynı çarpışmaya birkaç tepki\nOlayın içine alt alta istediğin kadar blok koyabilirsin: önce ses, sonra silme gibi. Bloklar yukarıdan aşağı sırayla çalışır. `patlayıp yok olsun` bloğu, silmenin parçacıklı hâlidir.\n\n### Bir değme, bir tepki\nOlay, iki sprite değmeye başladığı anda **bir kez** çalışır. Kedi hâlâ elmanın üstünde dursa bile her karede yeniden çalışmaz. Ayrılıp yeniden değerlerse tekrar çalışır.\n\n### Özet\nHer sprite'ın görünmez bir kutusu vardır; kutular kesişince çarpışma olur. Çarpışma olayı iki türü bağlar ve içinde `bu sprite` ile `diğer sprite` bulunur. Silmek ya da patlatmak için doğru sprite'ı seçmek gerekir. Olay, değme anında bir kez çalışır.",
          "concepts": [
            {
              "term": "Çarpışma",
              "definition": "İki sprite'ın görünmez kutuları kesiştiğinde oluşan durum. Oyun bunu her karede kontrol eder.",
              "example": "Kedinin kutusu elmanın kutusuna girince oyun \"çarpıştılar\" der ve olay bloğunu çalıştırır.",
              "pitfall": "Çarpışmayı resimlerin boş köşeleri de sayıyor sanmak; yalnız resmin dolu kısmını saran kutu hesaba girer."
            },
            {
              "term": "Çarpışma olayı",
              "definition": "\"Bir [tür] bir [tür]'e çarpınca\" bloğu; iki tür değdiği anda içindeki blokları bir kez çalıştırır.",
              "example": "Oyuncu Yiyecek'e çarpınca elmayı sil.",
              "pitfall": "Olay bloğunu oyun başlayınca bloğunun içine koymak; olay bloğu çalışma alanında tek başına durur."
            },
            {
              "term": "bu sprite ve diğer sprite",
              "definition": "Çarpışma olayındaki iki sprite: \"bu sprite\" ilk türden, \"diğer sprite\" ikinci türden olandır.",
              "example": "Oyuncu Yiyecek'e çarpınca \"diğer sprite'ı sil\" elmayı siler, \"bu sprite'ı sil\" kediyi siler.",
              "pitfall": "Elmayı silmek isterken \"bu sprite\" koymak; kedi kaybolur ve oyun bitmiş gibi görünür."
            },
            {
              "term": "Sprite türü",
              "definition": "Sprite'ın hangi gruba ait olduğunu söyleyen etiket (Oyuncu, Yiyecek, Düşman). Olaylar adı değil türü kullanır.",
              "example": "Sahnede on elma da Yiyecek türündeyse tek bir olay bloğu hepsi için çalışır.",
              "pitfall": "Hayaletin türünü Düşman yapmayı unutmak; Düşman için yazılan olay hiç çalışmaz."
            },
            {
              "term": "Patlayıp yok olsun",
              "definition": "Sprite'ı silen ve parçacık saçan blok; \"sil\" bloğunun efektli hâli.",
              "example": "Oyuncu Düşman'a çarpınca diğer sprite patlayıp yok olsun.",
              "pitfall": "Bu bloğu \"bu sprite\" ile kullanmak; patlayan kendi oyuncun olur."
            }
          ],
          "quiz": [
            {
              "id": "m11h2d6-q1",
              "kind": "mcq",
              "prompt": "Oyun iki sprite'ın çarpıştığını nasıl anlar?",
              "options": [
                "İki resmin adı aynıysa",
                "Sprite'ların görünmez kutuları kesiştiğinde",
                "İki sprite aynı hızla gidiyorsa",
                "Oyuncu bir tuşa bastığında"
              ],
              "answer": 1,
              "explanation": "Her sprite'ın resminin dolu kısmını saran görünmez bir kutu vardır; kutular kesişince çarpışma olur. Ad, hız ya da tuşlar çarpışmayı belirlemez.",
              "skills": [
                "game-collision"
              ]
            },
            {
              "id": "m11h2d6-q2",
              "kind": "predict-output",
              "prompt": "Kedinin türü Oyuncu, elmanın türü Yiyecek. Kedi elmaya değince ne olur?\n\n```\nbir Oyuncu bir Yiyecek'e çarpınca:\n  bu sprite'ı sil\n```",
              "options": [
                "Elma kaybolur",
                "Kedi kaybolur",
                "İkisi de kaybolur",
                "Hiçbir şey olmaz"
              ],
              "answer": 1,
              "explanation": "\"bu sprite\" olayın ilk türüdür; ilk tür Oyuncu olduğu için silinen kedidir. Elmayı silmek için \"diğer sprite\" gerekirdi.",
              "skills": [
                "game-collision",
                "game-kinds"
              ]
            },
            {
              "id": "m11h2d6-q3",
              "kind": "find-bug",
              "prompt": "Hayaletin türü Düşman. Kedi hayalete değiyor ama hayalet patlamıyor. Hata nerede?\n\n```\nbir Oyuncu bir Yiyecek'e çarpınca:\n  diğer sprite patlayıp yok olsun\n```",
              "options": [
                "\"diğer sprite\" yerine \"bu sprite\" olmalı",
                "Patlayıp yok olsun bloğu böyle kullanılmaz",
                "Olayın ikinci türü Yiyecek; hayalet ise Düşman olduğu için olay çalışmaz",
                "Kedinin türü Oyuncu olmamalı"
              ],
              "answer": 2,
              "explanation": "Olay yalnız belirtilen iki tür değince çalışır. İkinci tür Düşman olmalıydı. \"diğer sprite\" doğru seçilmiş; \"bu sprite\" yapmak kediyi patlatırdı.",
              "skills": [
                "game-kinds",
                "game-debug"
              ]
            },
            {
              "id": "m11h2d6-q4",
              "kind": "numeric",
              "prompt": "Tek olay var: Oyuncu, Yiyecek'e çarpınca elmayı sil. Sahnede 3 elma (Yiyecek) ve 2 hayalet (Düşman) bulunuyor. Kedi hepsine sırayla değiyor ve her birinin üstünde 5 saniye duruyor. Olay kaç kez çalışır?",
              "answer": 3,
              "tolerance": 0,
              "unit": "kez",
              "explanation": "Olay yalnız Yiyecek türüyle çarpışmada çalışır ve değme anında bir kez tetiklenir; üstünde durmak yeniden tetiklemez. Üç elma var, hayaletler için olay yok: 3 kez.",
              "skills": [
                "game-collision",
                "game-kinds"
              ]
            },
            {
              "id": "m11h2d6-q5",
              "kind": "mcq",
              "prompt": "Sahnede 6 elma var ve hepsinin türü Yiyecek. Kediyle her elmayı silmek için kaç çarpışma olayı bloğu yazmalısın?",
              "options": [
                "6 tane, her elma için bir tane",
                "1 tane yeter",
                "2 tane",
                "Elmaların resmi kadar"
              ],
              "answer": 1,
              "explanation": "Olaylar sprite'ın adını değil türünü kullanır. Aynı türden kaç sprite olursa olsun tek olay hepsi için çalışır.",
              "skills": [
                "game-kinds"
              ]
            }
          ],
          "contentEn": {
            "title": "Eat the apple, pop the ghost",
            "problem": "What makes a game a game is that something happens when objects touch each other. When the cat touches the apple, the apple disappears. When the cat touches the ghost, something explodes. How does the computer notice that two pictures are on top of each other? And how does it answer the question \"which one touched which?\"",
            "contentMd": "On the stage there is the cat (Player), an apple (Food) at the top right and a ghost (Enemy) at the bottom right. Walk the cat with the arrow keys. For now nothing happens.\n\n### The collision event\nThe Game Workshop checks in every frame whether two sprites are on top of each other. This check is called a **collision**. You only say what should happen when which kinds collide.\n\nThere are two sprites in a collision event:\n- `this sprite`: the one of the kind at the start of the event, so the first sprite. (In this lesson, the cat.)\n- `other sprite`: the second sprite, the one that was hit. (The apple or the ghost.)\n\n### Build the blocks\n1. From the **Sprite** category, drop the `when a [Player] sprite hits a [Food] sprite` event block into the work area.\n2. From the same category, take the `delete sprite [this sprite]` block and attach it inside the event. Drag the `other sprite` block (in the same category) into it, in place of `this sprite`. This way the apple is deleted, not the cat.\n3. Press the ▶ button and take the cat to the apple. The apple disappears.\n4. Bring a second event block: `when a [Player] sprite hits a [Enemy] sprite`.\n5. Put the `make [other sprite] explode` block inside it.\n6. Press the ↺ button and this time visit the ghost. The ghost explodes into sparkles.\n7. If you like, also add the `play melody [point]` block from the **Sound** category to the apple event.\n\nExpected result: When you touch the apple, the apple disappears. When you touch the ghost, the ghost explodes and disappears.\n\n### How does it work?\n- The kinds in the event block give the sprite's **kind**, not its **name**. If there are many sprites of the same kind, it works for all of them.\n- The collision event runs **once**, the moment the two sprites come on top of each other. Even if the cat stays on top of the apple, it does not run again and again in every frame.\n- The `make ... explode` block is the version of the `delete sprite` block with an effect. It removes the sprite and throws out sparkles.\n\n### Try it\n1. Delete the cat: delete `this sprite` and see what happens. Then fix it.\n2. Make the cat explode instead of the ghost. Which block must you change?\n3. Add a second apple to the stage (with **Create variable...** make `elma2`, then `new [Apple] sprite, kind [Food]` and a position). Does the same event work for both apples?\n\n### Common mistakes\n- If you put `this sprite` instead of `other sprite`, the wrong sprite is deleted. Most of the time the cat is deleted and the game looks as if it has ended.\n- If the sprite's kind is wrong, the event never runs. The apple's kind must be **Food** and the ghost's kind **Enemy**.\n- Do not put the event block inside the `when game starts` block. An event block always stands on its own in the work area.",
            "question": "A collision does not only mean \"touching\": what can two things touching each other lead to in a game? If you designed a game, which two sprites would you want to collide, and what would you want to come of it?",
            "explainerMd": "### What you will learn in this lesson\n- How the computer works out that two pictures are touching\n- The **collision event** block and the difference between `this sprite` and `other sprite` inside it\n- Why the sprite's **kind** matters\n- How to link several responses to one collision (deleting, exploding, playing a sound)\n\n### What you should know first\nFrom lesson 1, making a sprite and its position; from lesson 2, walking the player with the arrow keys; from lesson 4, giving a speed. From lesson 3, the logic of event blocks (blocks that run when something happens).\n\n### Every sprite has an invisible box\nThe Game Workshop draws an invisible **rectangle** around every sprite, wrapping the filled part of the picture. If the insides of two rectangles overlap, the two sprites count as having **collided**. The empty, see-through corners of the picture do not count. This check is done 60 times a second; you only hear the result.\n\n```\nCat box:    x = 70..86\nApple box:  x = 80..90   -> 80 to 86 is shared, there is a collision\nApple box:  x = 100..110 -> nothing shared, no collision\n```\n\n### The collision event and the two sprites\nThe block reads like this: \"when a Player hits a Food, do these things.\" Inside it there are two special sprites:\n\n| Block | What it means | In this lesson |\n|---|---|---|\n| `this sprite` | the one of the event's first kind | the cat |\n| `other sprite` | the one of the event's second kind | the apple or the ghost |\n\nIf you want to delete the apple, you delete `other sprite`. If you delete `this sprite`, the cat disappears.\n\n### A kind is not a name\n\"Player\" or \"Food\" in the event block is a sprite's **kind**. Even if you had ten apples of the same kind, one event block works for all of them. If you choose the wrong kind, the event never runs, because there is no sprite of that kind on the stage.\n\n### Several responses to the same collision\nYou can put as many blocks as you like inside the event, one under another: first a sound, then the deleting, for example. The blocks run in order from top to bottom. The `make ... explode` block is the version of deleting with sparkles.\n\n### One touch, one response\nThe event runs **once**, the moment the two sprites start touching. Even if the cat is still standing on the apple, it does not run again in every frame. If they separate and touch again, it runs again.\n\n### Summary\nEvery sprite has an invisible box; when the boxes overlap, there is a collision. The collision event links two kinds, and inside it there are `this sprite` and `other sprite`. To delete or explode something, you need to choose the right sprite. The event runs once, at the moment of touching.",
            "concepts": [
              {
                "term": "Collision",
                "definition": "What happens when the invisible boxes of two sprites overlap. The game checks this in every frame.",
                "example": "When the cat's box goes into the apple's box, the game says \"they collided\" and runs the event block.",
                "pitfall": "Thinking the empty corners of the pictures count for collisions too; only the box wrapping the filled part of the picture counts."
              },
              {
                "term": "Collision event",
                "definition": "The \"when a [kind] hits a [kind]\" block; it runs the blocks inside it once, the moment the two kinds touch.",
                "example": "When a Player hits a Food, delete the apple.",
                "pitfall": "Putting the event block inside the when game starts block; an event block stands on its own in the work area."
              },
              {
                "term": "this sprite and other sprite",
                "definition": "The two sprites in a collision event: \"this sprite\" is the one of the first kind, \"other sprite\" the one of the second kind.",
                "example": "When a Player hits a Food, \"delete sprite other sprite\" deletes the apple, and \"delete sprite this sprite\" deletes the cat.",
                "pitfall": "Putting \"this sprite\" when you want to delete the apple; the cat disappears and the game looks as if it has ended."
              },
              {
                "term": "Sprite kind",
                "definition": "The label that says which group a sprite belongs to (Player, Food, Enemy). Events use the kind, not the name.",
                "example": "If all ten apples on the stage are of the Food kind, one event block works for all of them.",
                "pitfall": "Forgetting to make the ghost's kind Enemy; the event written for Enemy never runs."
              },
              {
                "term": "Explode",
                "definition": "The block that deletes a sprite and throws out sparkles; the version of the \"delete\" block with an effect.",
                "example": "When a Player hits an Enemy, make other sprite explode.",
                "pitfall": "Using this block with \"this sprite\"; the one that explodes is your own player."
              }
            ],
            "quiz": [
              {
                "id": "m11h2d6-q1",
                "kind": "mcq",
                "prompt": "How does the game know that two sprites have collided?",
                "options": [
                  "If the two pictures have the same name",
                  "When the sprites' invisible boxes overlap",
                  "If the two sprites go at the same speed",
                  "When the player presses a key"
                ],
                "answer": 1,
                "explanation": "Every sprite has an invisible box wrapping the filled part of its picture; when the boxes overlap, there is a collision. The name, the speed or the keys do not decide the collision.",
                "skills": [
                  "game-collision"
                ]
              },
              {
                "id": "m11h2d6-q2",
                "kind": "predict-output",
                "prompt": "The cat's kind is Player and the apple's kind is Food. What happens when the cat touches the apple?\n\n```\nwhen a Player hits a Food:\n  delete this sprite\n```",
                "options": [
                  "The apple disappears",
                  "The cat disappears",
                  "Both disappear",
                  "Nothing happens"
                ],
                "answer": 1,
                "explanation": "\"this sprite\" is the event's first kind; the first kind is Player, so the one deleted is the cat. To delete the apple you would need \"other sprite\".",
                "skills": [
                  "game-collision",
                  "game-kinds"
                ]
              },
              {
                "id": "m11h2d6-q3",
                "kind": "find-bug",
                "prompt": "The ghost's kind is Enemy. The cat touches the ghost but the ghost does not explode. Where is the bug?\n\n```\nwhen a Player hits a Food:\n  make other sprite explode\n```",
                "options": [
                  "It should be \"this sprite\" instead of \"other sprite\"",
                  "The explode block is not used like this",
                  "The event's second kind is Food; the ghost is an Enemy, so the event does not run",
                  "The cat's kind should not be Player"
                ],
                "answer": 2,
                "explanation": "The event only runs when the two kinds it names touch. The second kind should have been Enemy. \"other sprite\" is the right choice; making it \"this sprite\" would explode the cat.",
                "skills": [
                  "game-kinds",
                  "game-debug"
                ]
              },
              {
                "id": "m11h2d6-q4",
                "kind": "numeric",
                "prompt": "There is one event: when a Player hits a Food, delete the apple. On the stage there are 3 apples (Food) and 2 ghosts (Enemy). The cat touches each of them in turn and stays on each one for 5 seconds. How many times does the event run?",
                "answer": 3,
                "tolerance": 0,
                "unit": "times",
                "explanation": "The event only runs for a collision with the Food kind, and it is triggered once, at the moment of touching; staying on top does not trigger it again. There are three apples and no event for the ghosts: 3 times.",
                "skills": [
                  "game-collision",
                  "game-kinds"
                ]
              },
              {
                "id": "m11h2d6-q5",
                "kind": "mcq",
                "prompt": "There are 6 apples on the stage and they are all of the Food kind. How many collision event blocks must you write to delete every apple with the cat?",
                "options": [
                  "6, one for each apple",
                  "1 is enough",
                  "2",
                  "As many as there are apple pictures"
                ],
                "answer": 1,
                "explanation": "Events use the sprite's kind, not its name. However many sprites of the same kind there are, one event works for all of them.",
                "skills": [
                  "game-kinds"
                ]
              }
            ]
          }
        },
        {
          "title": "Üç meyveyi topla, oyunu kazan",
          "durationMin": 22,
          "problem": "Oyunlarda puan toplarız. Ama bilgisayar puanı nerede saklar? Ve \"Üç meyve topladın, kazandın!\" diyebilmesi için hangi soruyu sorması gerekir? Bu derste sayıları sayan bir oyun yapacaksın.",
          "contentMd": "Sahnede kedi ve üç meyve (elma, portakal, kiraz) var. Hepsinin türü **Yiyecek**. Skor sıfırdan başlıyor ama hiçbir şey onu artırmıyor.\n\n### Skor\nOyunda **skor** adlı hazır bir sayı vardır. Üst köşede gösterilir. Üç blok işini görür:\n- `skoru [0] yap`: skoru belirlediğin sayıya ayarlar.\n- `skoru [1] değiştir`: skora ekler. Eksi sayı verirsen çıkarır.\n- `skor`: skoru sayı olarak verir; bunu bir koşulda kullanabilirsin.\n\n### Blokları kur\n1. **Sprite** kategorisinden `bir [Oyuncu] sprite'ı bir [Yiyecek] sprite'ına çarpınca` olayını koy.\n2. İçine **Oyun** kategorisinden `skoru [1] değiştir` bloğunu tak.\n3. Altına `[diğer sprite] sprite'ını sil` ekle (`bu sprite` yerine `diğer sprite`).\n4. **Ses** kategorisinden `[puan] melodisini çal` bloğunu ekle.\n5. ▶ düğmesine bas ve üç meyveyi topla. Skor 3 oluyor.\n6. Şimdi kazanmayı ekleyelim. **Mantık** kategorisinden `eğer [koşul] ise` bloğunu al ve olayın en altına tak.\n7. Koşul yuvasına **Mantık** kategorisinden **=** karşılaştırma bloğunu bırak. Sol yuvaya **Oyun** kategorisinden `skor` bloğunu, sağ yuvaya **Matematik** kategorisinden 3 sayısını koy.\n8. `eğer` bloğunun içine sırayla şunları tak: `ekranda [Hepsini topladın!] yaz, [2] saniye`, `[zafer] melodisini çal`, `oyunu bitir: [kazandın]`.\n9. ↺ düğmesine bas ve oyunu bitir. Ekranda KAZANDIN! yazısı çıkar.\n\nBeklenen sonuç: Her meyve skoru 1 artırır ve melodi çalar. Üçüncü meyveden sonra mesaj çıkar, zafer melodisi çalar ve oyun kazanılır.\n\n### Nasıl çalışıyor?\n- Olay her çarpışmada baştan çalışır. Birinci meyvede skor 1 olur, `eğer` sorusu \"skor 3 mü?\" diye sorar ve cevap hayırdır. Üçüncüde cevap evettir ve içindeki bloklar çalışır.\n- `eğer [koşul] ise` bloğu bir **soru** sorar. Cevap evetse içindeki bloklar çalışır, hayırsa atlanır.\n- **=** bloğu iki sayıyı karşılaştırır. Açılır listeden başka işaretler de seçebilirsin: büyüktür, küçüktür gibi.\n- Oyun bitince Oyun Atölyesi bir bitiş ekranı gösterir. A düğmesi oyunu yeniden başlatır.\n\n### Dene\n1. Karşılaştırmayı **=** yerine **≥** yap. Üçüncü meyveden sonra da çalışıyor mu? Peki neden bazen **≥** daha güvenlidir?\n2. Her meyve 10 puan versin, kazanmak için skor 30 olsun. Hangi iki sayıyı değiştirmelisin?\n3. `[kedi] [Tamam!] desin, [1] saniye` bloğunu meyveyi yutunca kedi söylesin diye ekle.\n\n### Sık yapılan hatalar\n- `skoru [1] yap` ile `skoru [1] değiştir` aynı şey değildir. İlki skoru 1'e sabitler, ikincisi 1 ekler. Skor hiç artmıyorsa bunu kontrol et.\n- Koşulun sağ tarafına 3 yerine metin yazarsan karşılaştırma çalışmaz. Matematik kategorisindeki sayı bloğunu kullan.\n- Skoru sıfırlamayı unutma: `oyun başlayınca` içinde `skoru [0] yap` bulunsun.",
          "question": "Oyunlarda puan neden önemlidir? Skorun artışı oyuncuya nasıl bir his verir? \"Hepsini topla\" yerine \"30 saniyede mümkün olduğu kadar topla\" desen oyun nasıl değişirdi?",
          "explainerMd": "### Bu derste öğreneceklerin\n- **Skor** denen sayının nerede durduğunu ve üç bloğunu\n- `yap` ile `değiştir` arasındaki farkı\n- **Koşul** ile `eğer ... ise` bloğunun nasıl karar verdiğini\n- `=` ile `≥` karşılaştırmasının ne zaman farklı davrandığını\n\n### Önceden bilmen gerekenler\nDers 6'dan çarpışma olayını, `diğer sprite`'ı ve silmeyi. Ders 3'ten olay bloklarını. Ders 1'den bir bloğun içine başka blok takmayı.\n\n### Skor bir sayı kutusudur\nOyunun içinde **skor** adında hazır bir kutu vardır; içinde bir sayı durur. Üç blokla ona dokunursun:\n\n| Blok | Ne yapar | Skor 2 iken sonuç |\n|---|---|---|\n| `skoru [5] yap` | Kutuya 5 koyar, eskisini siler | 5 |\n| `skoru [1] değiştir` | Kutudaki sayıya 1 ekler | 3 |\n| `skoru [-1] değiştir` | 1 çıkarır | 1 |\n| `skor` | Sayıyı okur, koşulda kullanılır | 2 |\n\nOyun başında `skoru [0] yap` yazarsan her oyun temiz başlar.\n\n### Koşul bir sorudur\n**Koşul**, cevabı \"evet\" ya da \"hayır\" olan bir sorudur: \"skor 3 mü?\" gibi. `eğer [koşul] ise` bloğu soruyu sorar. Cevap evetse içindeki bloklar çalışır, hayırsa atlanır.\n\n```\nçarpışınca (Oyuncu, Yiyecek):\n  skoru 1 değiştir\n  diğer sprite'ı sil\n  eğer skor = 3 ise:\n    ekrana \"Hepsini topladın!\" yaz\n    oyunu bitir: kazandın\n```\n\nBirinci meyvede skor 1'dir; soru \"hayır\" çıkar ve içi atlanır. Üçüncü meyvede skor 3 olur, cevap \"evet\" çıkar ve oyun kazanılır.\n\n### Karşılaştırma işaretleri\n| İşaret | Anlamı | skor = 4 iken |\n|---|---|---|\n| `=` | tam eşit | skor = 3 hayır |\n| `≥` | büyük ya da eşit | skor ≥ 3 evet |\n| `<` | küçüktür | skor < 3 hayır |\n\nSkor her seferinde 1 artıyorsa `=` yeter. Ama bir meyve 2 puan verirse skor 3'ü atlayabilir (2, 4...). Bu yüzden hedef sayısını kontrol ederken `≥` daha güvenlidir.\n\n### Ses geri bildirimdir\n`puan` melodisi oyuncuya \"doğru yaptın\" der. Ses, ekrana bakmasan bile ne olduğunu hissettirir.\n\n### Özet\nSkor, oyunun içindeki bir sayı kutusudur. `yap` değer koyar, `değiştir` ekler. `eğer` bloğu bir koşulu sorar ve cevap evetse içindeki blokları çalıştırır. Hedefe ulaşıp ulaşmadığını anlamak için `≥` çoğu zaman `=`'ten daha güvenlidir.",
          "concepts": [
            {
              "term": "Skor",
              "definition": "Oyunun içinde hazır bulunan ve ekranda gösterilen sayı; oyuncunun ne kadar başardığını sayar.",
              "example": "Her yenen meyve skora 1 ekler; üç meyve sonra skor 3 olur.",
              "pitfall": "Oyun başında skoru sıfırlamayı unutmak; oyunun ilk skoru beklediğinden farklı başlayabilir."
            },
            {
              "term": "skoru yap ve skoru değiştir",
              "definition": "\"yap\" skora sabit bir değer koyar; \"değiştir\" mevcut skora ekler ya da çıkarır.",
              "example": "Skor 2 iken \"skoru 5 yap\" 5 yapar, \"skoru 1 değiştir\" 3 yapar.",
              "pitfall": "Çarpışma olayında \"skoru 1 yap\" kullanmak; skor hep 1'de takılır."
            },
            {
              "term": "Koşul",
              "definition": "Cevabı evet ya da hayır olan soru; \"skor 3 mü?\" gibi.",
              "example": "\"skor = 3\" koşulu, skor 3 iken evet, 2 iken hayırdır.",
              "pitfall": "Karşılaştırmanın yanına sayı yerine metin yazmak; Matematik kategorisindeki sayı bloğu kullanılmalı."
            },
            {
              "term": "eğer ... ise",
              "definition": "Koşulu soran blok; cevap evetse içindeki blokları çalıştırır, hayırsa atlar.",
              "example": "Eğer skor ≥ 3 ise oyunu bitir: kazandın.",
              "pitfall": "Bloğu çarpışma olayının dışına koymak; skor değiştiğinde kimse soruyu sormaz."
            },
            {
              "term": "Karşılaştırma işaretleri",
              "definition": "= tam eşitliği, ≥ büyük ya da eşit olmayı, < küçük olmayı sorar.",
              "example": "Her meyve 2 puan verirse skor 2, 4, 6 olur; \"skor ≥ 5\" 6'da evet der, \"skor = 5\" hiç evet demez.",
              "pitfall": "Hedefi = ile kontrol edip skorun o sayıyı atlayabileceğini unutmak."
            }
          ],
          "quiz": [
            {
              "id": "m11h2d7-q1",
              "kind": "predict-output",
              "prompt": "Kedi iki meyve yer (skor 0'dan başlıyor). Skor kaç olur?\n\n```\nbir Oyuncu bir Yiyecek'e çarpınca:\n  skoru 2 yap\n  skoru 1 değiştir\n```",
              "options": [
                "6",
                "4",
                "2",
                "3"
              ],
              "answer": 3,
              "explanation": "Her çarpışmada skor önce 2'ye ayarlanır (yap, eskisini siler), sonra 1 eklenir: 3. İkinci meyvede yine 2'ye ayarlanıp 1 eklenir: skor 3 kalır. Toplanmaz; bu yüzden 6 ya da 4 yanlıştır.",
              "skills": [
                "game-score",
                "game-debug"
              ]
            },
            {
              "id": "m11h2d7-q2",
              "kind": "numeric",
              "prompt": "Her meyve 5 puan veriyor ve skor 0'dan başlıyor. Skor 35 olunca kazanılıyor. En az kaç meyve toplamalısın?",
              "answer": 7,
              "tolerance": 0,
              "unit": "meyve",
              "explanation": "35 / 5 = 7. Altı meyvede skor 30 olur, yedincide 35.",
              "skills": [
                "game-score"
              ]
            },
            {
              "id": "m11h2d7-q3",
              "kind": "find-bug",
              "prompt": "Meyveleri topluyorsun ama skor hiç artmıyor, hep 1 kalıyor. Hata hangisi?\n\n```\nbir Oyuncu bir Yiyecek'e çarpınca:\n  skoru 1 yap\n  diğer sprite'ı sil\n```",
              "options": [
                "Meyveyi silmek skoru bozar",
                "\"skoru 1 yap\" skoru 1'e sabitler; \"skoru 1 değiştir\" olmalı",
                "Olayın türleri ters yazılmış",
                "Skor ekranda gösterilemez"
              ],
              "answer": 1,
              "explanation": "\"yap\" her çarpışmada skoru 1'e eşitler, bu yüzden hiç artmaz. Artırmak için \"değiştir\" (ekle) gerekir. Silme işlemi skora dokunmaz.",
              "skills": [
                "game-score",
                "game-debug"
              ]
            },
            {
              "id": "m11h2d7-q4",
              "kind": "mcq",
              "prompt": "Her meyve 2 puan veriyor, skor 0'dan başlıyor ve kazanma koşulu \"skor = 5\". Ne olur?",
              "options": [
                "Skor 5 olunca oyun kazanılır",
                "Skor 6 olunca oyun kazanılır",
                "Skor 2, 4, 6 diye gider, hiç tam 5 olmaz; oyun kazanılamaz",
                "Oyun hata verir"
              ],
              "answer": 2,
              "explanation": "Çift sayılarla ilerleyen skor 5'i atlar, \"=\" hiçbir zaman evet demez. \"skor ≥ 5\" kullanılsaydı 6'da kazanılırdı.",
              "skills": [
                "game-conditions",
                "game-score"
              ]
            },
            {
              "id": "m11h2d7-q5",
              "kind": "mcq",
              "prompt": "\"eğer [koşul] ise\" bloğu ne yapar?",
              "options": [
                "Koşul evetse içindeki blokları çalıştırır, hayırsa atlar",
                "İçindeki blokları her zaman çalıştırır",
                "Koşul hayırsa içindeki blokları çalıştırır",
                "Oyunu durdurur"
              ],
              "answer": 0,
              "explanation": "\"eğer\" bir soru sorar. Cevap evetse içindeki bloklar çalışır; hayırsa atlanır ve oyun yoluna devam eder.",
              "skills": [
                "game-conditions"
              ]
            }
          ],
          "contentEn": {
            "title": "Collect three fruits, win the game",
            "problem": "In games we collect points. But where does the computer keep the points? And which question does it need to ask so that it can say \"You collected three fruits, you win!\"? In this lesson you will make a game that counts numbers.",
            "contentMd": "On the stage there are the cat and three fruits (apple, orange, cherry). They are all of the **Food** kind. The score starts at zero, but nothing makes it go up.\n\n### Score\nThe game has a ready-made number called the **score**. It is shown in the top corner. Three blocks do the job:\n- `set score to [0]`: sets the score to the number you choose.\n- `change score by [1]`: adds to the score. If you give a minus number, it takes away.\n- `score`: gives the score as a number; you can use it in a condition.\n\n### Build the blocks\n1. From the **Sprite** category, put in the `when a [Player] sprite hits a [Food] sprite` event.\n2. Attach the `change score by [1]` block from the **Game** category inside it.\n3. Underneath, add `delete sprite [other sprite]` (`other sprite` instead of `this sprite`).\n4. From the **Sound** category, add the `play melody [point]` block.\n5. Press the ▶ button and collect the three fruits. The score becomes 3.\n6. Now let's add winning. From the **Logic** category, take the `if ... do` block and attach it at the very bottom of the event.\n7. Drop the **=** comparison block from the **Logic** category into the condition slot. Put the `score` block from the **Game** category into the left slot, and the number 3 from the **Math** category into the right slot.\n8. Inside the `if` block, attach these in order: `show [You got them all!] on screen for [2] seconds`, `play melody [victory]`, `end game: [you win]`.\n9. Press the ↺ button and finish the game. The words YOU WIN! appear on the screen.\n\nExpected result: Each fruit adds 1 to the score and a melody plays. After the third fruit a message appears, the victory melody plays and the game is won.\n\n### How does it work?\n- The event runs from the start at every collision. At the first fruit the score becomes 1, the `if` question asks \"is the score 3?\" and the answer is no. At the third one the answer is yes and the blocks inside it run.\n- The `if ... do` block asks a **question**. If the answer is yes, the blocks inside it run; if it is no, they are skipped.\n- The **=** block compares two numbers. You can also choose other signs from the drop-down list: such as greater than or less than.\n- When the game ends, the Game Workshop shows an end screen. The A button starts the game again.\n\n### Try it\n1. Change the comparison from **=** to **≥**. Does it still work after the third fruit? And why is **≥** sometimes safer?\n2. Make each fruit give 10 points, and make the score needed to win 30. Which two numbers must you change?\n3. Add the `[kedi] says [OK!] for [1] seconds` block so that the cat says it when it gobbles up a fruit.\n\n### Common mistakes\n- `set score to [1]` and `change score by [1]` are not the same thing. The first fixes the score at 1, the second adds 1. If the score never goes up, check this.\n- If you write text instead of 3 on the right side of the condition, the comparison does not work. Use the number block in the Math category.\n- Do not forget to reset the score: make sure `set score to [0]` is inside `when game starts`.",
            "question": "Why are points important in games? How does the score going up make the player feel? If you said \"collect as many as you can in 30 seconds\" instead of \"collect them all\", how would the game change?",
            "explainerMd": "### What you will learn in this lesson\n- Where the number called the **score** lives, and its three blocks\n- The difference between `set` and `change`\n- How a **condition** and the `if ... do` block make a decision\n- When the `=` and `≥` comparisons behave differently\n\n### What you should know first\nFrom lesson 6, the collision event, `other sprite` and deleting. From lesson 3, event blocks. From lesson 1, attaching one block inside another.\n\n### The score is a number box\nInside the game there is a ready-made box called the **score**; a number sits inside it. You touch it with three blocks:\n\n| Block | What it does | Result when the score is 2 |\n|---|---|---|\n| `set score to [5]` | Puts 5 in the box and wipes the old one | 5 |\n| `change score by [1]` | Adds 1 to the number in the box | 3 |\n| `change score by [-1]` | Takes away 1 | 1 |\n| `score` | Reads the number; used in a condition | 2 |\n\nIf you write `set score to [0]` at the start of the game, every game starts clean.\n\n### A condition is a question\nA **condition** is a question whose answer is \"yes\" or \"no\": such as \"is the score 3?\". The `if ... do` block asks the question. If the answer is yes, the blocks inside it run; if it is no, they are skipped.\n\n```\non collision (Player, Food):\n  change score by 1\n  delete other sprite\n  if score = 3:\n    show \"You got them all!\" on screen\n    end game: you win\n```\n\nAt the first fruit the score is 1; the question comes out \"no\" and the inside is skipped. At the third fruit the score becomes 3, the answer comes out \"yes\" and the game is won.\n\n### Comparison signs\n| Sign | What it means | When score = 4 |\n|---|---|---|\n| `=` | exactly equal | score = 3 no |\n| `≥` | greater than or equal | score ≥ 3 yes |\n| `<` | less than | score < 3 no |\n\nIf the score goes up by 1 each time, `=` is enough. But if a fruit gives 2 points, the score can jump over 3 (2, 4...). So when you check the target number, `≥` is safer.\n\n### Sound is feedback\nThe `point` melody tells the player \"you did it right\". Sound lets you feel what happened even when you are not looking at the screen.\n\n### Summary\nThe score is a number box inside the game. `set` puts in a value, `change` adds. The `if` block asks a condition and, if the answer is yes, runs the blocks inside it. To find out whether the target has been reached, `≥` is often safer than `=`.",
            "concepts": [
              {
                "term": "Score",
                "definition": "The ready-made number inside the game that is shown on the screen; it counts how well the player is doing.",
                "example": "Each fruit eaten adds 1 to the score; after three fruits the score is 3.",
                "pitfall": "Forgetting to reset the score at the start of the game; the game's first score may start differently from what you expect."
              },
              {
                "term": "set score and change score",
                "definition": "\"set\" puts a fixed value in the score; \"change\" adds to or takes away from the current score.",
                "example": "When the score is 2, \"set score to 5\" makes it 5, and \"change score by 1\" makes it 3.",
                "pitfall": "Using \"set score to 1\" in the collision event; the score gets stuck at 1."
              },
              {
                "term": "Condition",
                "definition": "A question whose answer is yes or no; such as \"is the score 3?\".",
                "example": "The condition \"score = 3\" is yes when the score is 3, and no when it is 2.",
                "pitfall": "Writing text instead of a number next to the comparison; the number block in the Math category should be used."
              },
              {
                "term": "if",
                "definition": "The block that asks the condition; if the answer is yes it runs the blocks inside it, if it is no it skips them.",
                "example": "If score ≥ 3, end game: you win.",
                "pitfall": "Putting the block outside the collision event; when the score changes, nobody asks the question."
              },
              {
                "term": "Comparison signs",
                "definition": "= asks about being exactly equal, ≥ about being greater than or equal, < about being less than.",
                "example": "If each fruit gives 2 points, the score goes 2, 4, 6; \"score ≥ 5\" says yes at 6, \"score = 5\" never says yes.",
                "pitfall": "Checking the target with = and forgetting that the score can jump over that number."
              }
            ],
            "quiz": [
              {
                "id": "m11h2d7-q1",
                "kind": "predict-output",
                "prompt": "The cat eats two fruits (the score starts at 0). What is the score?\n\n```\nwhen a Player hits a Food:\n  set score to 2\n  change score by 1\n```",
                "options": [
                  "6",
                  "4",
                  "2",
                  "3"
                ],
                "answer": 3,
                "explanation": "At each collision the score is first set to 2 (set wipes the old value), then 1 is added: 3. At the second fruit it is set to 2 again and 1 is added: the score stays 3. It does not add up; so 6 or 4 is wrong.",
                "skills": [
                  "game-score",
                  "game-debug"
                ]
              },
              {
                "id": "m11h2d7-q2",
                "kind": "numeric",
                "prompt": "Each fruit gives 5 points and the score starts at 0. You win when the score is 35. What is the smallest number of fruits you must collect?",
                "answer": 7,
                "tolerance": 0,
                "unit": "fruits",
                "explanation": "35 / 5 = 7. With six fruits the score is 30, with the seventh 35.",
                "skills": [
                  "game-score"
                ]
              },
              {
                "id": "m11h2d7-q3",
                "kind": "find-bug",
                "prompt": "You collect the fruits but the score never goes up; it always stays 1. Which is the bug?\n\n```\nwhen a Player hits a Food:\n  set score to 1\n  delete other sprite\n```",
                "options": [
                  "Deleting the fruit spoils the score",
                  "\"set score to 1\" fixes the score at 1; it should be \"change score by 1\"",
                  "The event's kinds are written the wrong way round",
                  "The score cannot be shown on the screen"
                ],
                "answer": 1,
                "explanation": "\"set\" makes the score equal to 1 at every collision, so it never goes up. To make it go up you need \"change\" (add). Deleting does not touch the score.",
                "skills": [
                  "game-score",
                  "game-debug"
                ]
              },
              {
                "id": "m11h2d7-q4",
                "kind": "mcq",
                "prompt": "Each fruit gives 2 points, the score starts at 0 and the winning condition is \"score = 5\". What happens?",
                "options": [
                  "The game is won when the score is 5",
                  "The game is won when the score is 6",
                  "The score goes 2, 4, 6 and is never exactly 5; the game cannot be won",
                  "The game gives an error"
                ],
                "answer": 2,
                "explanation": "A score that moves in even numbers jumps over 5, so \"=\" never says yes. If \"score ≥ 5\" were used, it would be won at 6.",
                "skills": [
                  "game-conditions",
                  "game-score"
                ]
              },
              {
                "id": "m11h2d7-q5",
                "kind": "mcq",
                "prompt": "What does the \"if [condition]\" block do?",
                "options": [
                  "If the condition is yes, it runs the blocks inside it; if it is no, it skips them",
                  "It always runs the blocks inside it",
                  "If the condition is no, it runs the blocks inside it",
                  "It stops the game"
                ],
                "answer": 0,
                "explanation": "\"if\" asks a question. If the answer is yes, the blocks inside it run; if it is no, they are skipped and the game carries on.",
                "skills": [
                  "game-conditions"
                ]
              }
            ]
          }
        },
        {
          "title": "Gökten meyve yağsın",
          "durationMin": 25,
          "problem": "Şimdiye kadar nesneleri oyun başlarken tek tek yerleştirdik. Gerçek oyunlarda ise sürekli yeni şeyler çıkar: düşen meyveler, gelen düşmanlar. Elle yüz tane sprite yaratamayız. Bilgisayara \"her saniye yeni bir tane yap\" demenin yolu var mı? Bir de ekranda sonsuza kadar birikmesinler.",
          "contentMd": "Sepet (kedi) sağa sola gidiyor ve meyve yakalayınca skor artıyor. Ama gökten hiç meyve düşmüyor.\n\n### Tekrar eden olay\n`her [1000] ms'de bir` bloğu belli bir sürede bir çalışır. 1000 milisaniye bir saniyedir. İçine \"yeni bir meyve yarat\" yazarsan her saniye bir meyve doğar.\n\n### Blokları kur\n1. **Oyun** kategorisinden `her [1000] ms'de bir` olay bloğunu çalışma alanına bırak. Sayıyı 800 yap.\n2. **Değişken** kategorisinde **Değişken oluştur...** ile `meyve` adlı bir değişken yap. İçine `[meyve] değişkenini [ ] yap` bloğunu al ve olayın içine tak. Değerine **Sprite** kategorisinden `yeni [Elma] sprite'ı, türü [Yiyecek]` bloğunu bağla.\n3. Meyveyi gökyüzüne koy: `[meyve] konumu x [80] y [60]` bloğunu ekle. y için -8 yaz (ekranın hemen üstü). x için **Matematik** kategorisinden `[10] ile [150] arasında rastgele sayı` bloğunu koy.\n4. Meyveyi düşür: **Hareket** kategorisinden `[meyve] hızı x [30] y [0]` bloğunu ekle. x için 0 yaz. y için bir rastgele sayı koy: 35 ile 70 arasında.\n5. Ekrandan çıkanları sil: **Sprite** kategorisinden `[meyve] [dünyadan çıkınca silinsin]: [evet]` bloğunu ekle.\n6. ▶ düğmesine bas. Meyveler rastgele yerlerden düşüyor. Sepetle yakala ve skorun artışını gör.\n\nBeklenen sonuç: Her 0,8 saniyede farklı bir yerden meyve düşer. Yakaladığın meyve skoru artırır. Kaçırdığın meyveler ekrandan çıkınca silinir.\n\n### Nasıl çalışıyor?\n- `her [800] ms'de bir` olayı oyun açık kaldığı sürece tekrar eder.\n- Her turda `yeni [Elma] sprite'ı, türü [Yiyecek]` bloğu yepyeni bir meyve doğurur. `meyve` değişkeni her seferinde en yeni meyveyi gösterir. Eski meyveler kendi hızlarıyla düşmeye devam eder.\n- **Rastgele sayı** her çalıştığında 10 ile 150 arasından bir sayı seçer. Böylece meyve her seferinde başka yerden düşer.\n- Meyve başlangıçta ekranın dışında (y -8). Dünyadan çıkınca silinsin ayarı, sprite bir kez ekrana girdikten sonra tekrar çıkarsa silinmesini sağlar. Bu ayarı kapatırsan ekran dışında binlerce meyve birikir ve oyun yavaşlar.\n\n### Dene\n1. Düşme hızını daha geniş yap: 20 ile 120 arası. Oyun zorlaştı mı?\n2. Sıklığı 400 ms yap. Oyun nasıl değişti?\n3. Meyvenin resmini değiştir: olayın içine `[meyve] resmi [resim]` bloğunu ekle ve **Portakal**'ı seç.\n\n### Sık yapılan hatalar\n- y değerini 60 bırakırsan meyve ekranın ortasında doğar.\n- Hız bloğunda x yerine y'ye 0 yazarsan meyve yana kayar ve hiç düşmez.\n- Ekrandan çıkan meyveleri silmezsen oyun bir süre sonra durur. Oyun Atölyesi en çok 500 sprite'a izin verir.\n- Rastgele sayı bloğunda küçük sayıyı ilk yuvaya, büyük sayıyı ikinci yuvaya yaz.",
          "question": "Oyun neden hep aynı sırayla meyve düşürmüyor da rastgelelik kullanıyor? Rastgelelik olmasa oyun nasıl bir şey olurdu? Gerçek hayatta rastgele olan şeylere örnek ver.",
          "explainerMd": "### Bu derste öğreneceklerin\n- `her ... ms'de bir` bloğuyla belli aralıkla tekrar eden iş yapmayı\n- Çalışırken **yeni sprite** doğurmayı ve bir değişkenle tutmayı\n- **Rastgele sayı** bloğunu ve neden oyunu ilginç yaptığını\n- Ekrandan çıkan sprite'ların neden silinmesi gerektiğini\n\n### Önceden bilmen gerekenler\nDers 1'den yeni sprite oluşturmayı ve konum vermeyi; ders 4'ten hız (x ve y) vermeyi; ders 6 ve 7'den çarpışma ve skoru. Değişken kavramını `Değişken oluştur...` ile ders 1'de kullanmıştın.\n\n### Aralıklı olay\n`oyun başlayınca` bir kez çalışır. `her [800] ms'de bir` ise oyun açık kaldığı sürece **tekrar eder**. Süre milisaniyedir: 1000 ms = 1 saniye, 800 ms = 0,8 saniye. Yani dakikada 60000 / 800 = 75 tur.\n\n### Yeni sprite doğurmak\nHer turda `yeni [Elma] sprite'ı, türü [Yiyecek]` bloğu **yepyeni** bir meyve yaratır. Onu bir değişkene (`meyve`) koyarsın ki konumunu ve hızını ayarlayabilesin. Değişken her turda en yeni meyveyi gösterir; eski meyveler kendi hızlarıyla düşmeye devam eder.\n\n```\nher 800 ms'de bir:\n  meyve = yeni Elma sprite'ı (tür: Yiyecek)\n  meyve konumu: x = rastgele(10, 150), y = -8\n  meyve hızı: x = 0, y = rastgele(35, 70)\n  meyve dünyadan çıkınca silinsin: evet\n```\n\n### Rastgele sayı\n`[10] ile [150] arasında rastgele sayı` her çalıştığında bu iki sayı arasından (uçlar dahil) bir sayı seçer. Meyve her seferinde başka yerden düşer; oyun her seferinde farklı olur. Ekran 160 piksel genişliğinde ve 120 piksel yüksekliğinde olduğundan 10-150 aralığı kenarlardan biraz içeridedir.\n\n### Düşme hızı\nHız, saniyede kaç piksel gidileceğidir. y pozitifse aşağı gidilir (ekranın üstü y = 0). 60 piksel/sn hızla ekranın yüksekliği (120 piksel) yaklaşık 2 saniyede geçilir.\n\n| y hızı | 120 pikseli geçme süresi |\n|---|---|\n| 30 | 4 sn |\n| 60 | 2 sn |\n| 120 | 1 sn |\n\n### Temizlik şart\nEkrandan çıkan meyve görünmese de var olmaya devam eder. `dünyadan çıkınca silinsin: evet` ayarı onları siler. Ayarı kapatırsan sprite sayısı artar; Oyun Atölyesi en çok 500 sprite'a izin verir ve aşılınca hata verir.\n\n### Özet\n`her ... ms'de bir` bloğu işi tekrar tekrar yapar. Her turda yeni bir sprite doğurup konumunu ve hızını rastgele sayıyla belirlersin. Hız, saniyede piksel olarak ölçülür. Ekran dışına çıkanları silmezsen sprite'lar birikir ve oyun durur.",
          "concepts": [
            {
              "term": "her ... ms'de bir",
              "definition": "Oyun açık kaldığı sürece belli sürede bir tekrar eden olay. Süre milisaniyedir (1000 ms = 1 saniye).",
              "example": "\"her 800 ms'de bir\" dakikada 75 kez çalışır.",
              "pitfall": "Süreyi saniye sanıp 2 yazmak; 2 milisaniye çok kısadır, olay en sık hâliyle (50 ms) çalışır ve sprite'lar hemen birikir."
            },
            {
              "term": "Yeni sprite doğurmak",
              "definition": "\"yeni [resim] sprite'ı, türü [tür]\" bloğu çalışırken yepyeni bir sprite yaratır; onu bir değişkende tutarsın.",
              "example": "meyve değişkeni her turda en yeni meyveyi gösterir; eski meyveler düşmeye devam eder.",
              "pitfall": "Yeni sprite'ın konumunu ve hızını ayarlamayı unutmak; ekranın ortasında hareketsiz birikir."
            },
            {
              "term": "Rastgele sayı",
              "definition": "İki sayı arasından (uçlar dahil) her çalışmada başka bir sayı seçen blok.",
              "example": "x için rastgele 10-150 verirsen meyve her seferinde başka yerden düşer.",
              "pitfall": "Aralığı ekranın dışına taşırmak; ekran 160 piksel genişliğinde, 160'tan büyük bir x ekranın dışına meyve doğurur."
            },
            {
              "term": "Hız ve yön",
              "definition": "Hız saniyede piksel olarak ölçülür. y pozitifse sprite aşağı, negatifse yukarı gider.",
              "example": "y hızı 60 olan meyve ekranın 120 piksellik yüksekliğini yaklaşık 2 saniyede geçer.",
              "pitfall": "0'ı yanlış eksene yazmak; x yerine y'ye 0 verirsen meyve yana kayar, düşmez."
            },
            {
              "term": "Dünyadan çıkınca silinsin",
              "definition": "Sprite ekrandan çıkınca onu kendiliğinden silen ayar.",
              "example": "Kaçırılan meyve ekranın altından çıkınca silinir ve bellek boşalır.",
              "pitfall": "Ayarı açmamak; sprite'lar birikir, 500'ü geçince oyun hata verip durur."
            }
          ],
          "quiz": [
            {
              "id": "m11h2d8-q1",
              "kind": "numeric",
              "prompt": "Bir olay \"her 800 ms'de bir\" meyve doğuruyor. Bir dakikada (60 saniyede) kaç meyve doğar?",
              "answer": 75,
              "tolerance": 0,
              "unit": "meyve",
              "explanation": "60 saniye = 60000 ms. 60000 / 800 = 75 meyve.",
              "skills": [
                "game-spawn",
                "game-timing"
              ]
            },
            {
              "id": "m11h2d8-q2",
              "kind": "numeric",
              "prompt": "Bir meyvenin y hızı 40 (saniyede 40 piksel). Ekran 120 piksel yüksekliğinde. Meyve ekranın üst kenarından (y = 0) alt kenarına kaç saniyede ulaşır?",
              "answer": 3,
              "tolerance": 0,
              "unit": "sn",
              "explanation": "Süre = yol / hız = 120 / 40 = 3 saniye. Hız artarsa süre kısalır, oyun zorlaşır.",
              "skills": [
                "game-timing"
              ]
            },
            {
              "id": "m11h2d8-q3",
              "kind": "find-bug",
              "prompt": "Meyveler gökten düşmüyor, yana kayıyor. Hata hangisi?\n\n```\nher 800 ms'de bir:\n  meyve = yeni Elma sprite'ı (tür: Yiyecek)\n  meyve konumu: x = rastgele(10, 150), y = -8\n  meyve hızı: x = 40, y = 0\n  meyve dünyadan çıkınca silinsin: evet\n```",
              "options": [
                "Konumda y = -8 olamaz",
                "Silinsin ayarı yanlış açılmış",
                "Hız bloğunda x = 40, y = 0; düşmesi için x = 0, y = pozitif sayı olmalı",
                "Rastgele sayı aralığı fazla geniş"
              ],
              "answer": 2,
              "explanation": "y hızı 0 olduğu için meyve aşağı gitmez, x hızı 40 olduğu için yana kayar. Düşmek için y'ye pozitif bir hız verilir. y = -8 ekranın hemen üstü demektir ve doğrudur.",
              "skills": [
                "game-timing",
                "game-debug"
              ]
            },
            {
              "id": "m11h2d8-q4",
              "kind": "mcq",
              "prompt": "\"dünyadan çıkınca silinsin\" ayarını hiç açmazsan ne olur?",
              "options": [
                "Hiçbir şey olmaz, ekrandan çıkan sprite kendiliğinden yok olur",
                "Ekrandan çıkan meyveler birikir; sprite sayısı 500'ü geçince oyun hata verip durur",
                "Meyveler geri döner",
                "Skor sıfırlanır"
              ],
              "answer": 1,
              "explanation": "Görünmeyen sprite hâlâ vardır. Her 800 ms'de bir yenisi eklenirse sayı sürekli artar. Oyun Atölyesi en çok 500 sprite'a izin verir.",
              "skills": [
                "game-spawn",
                "game-debug"
              ]
            },
            {
              "id": "m11h2d8-q5",
              "kind": "predict-output",
              "prompt": "Bu olay birkaç saniye çalışınca ekranda ne görünür?\n\n```\nher 1000 ms'de bir:\n  meyve = yeni Elma sprite'ı (tür: Yiyecek)\n  meyve konumu: x = 80, y = 60\n```",
              "options": [
                "Meyveler rastgele yerlerden düşer",
                "Ekranda hep tek bir elma kalır",
                "Aynı noktada hareketsiz, üst üste biner; her saniye bir elma daha eklenir",
                "Hiç elma doğmaz"
              ],
              "answer": 2,
              "explanation": "Konum her seferinde aynı (80, 60) ve hız verilmemiş. Eski elmalar silinmediği için yenisi üstüne biner; görünüşte tek elma gibi durur ama sprite sayısı artar.",
              "skills": [
                "game-spawn",
                "game-random",
                "game-debug"
              ]
            }
          ],
          "contentEn": {
            "title": "Let it rain fruit",
            "problem": "So far we have placed objects one by one when the game starts. In real games, though, new things keep appearing: falling fruit, approaching enemies. We cannot make a hundred sprites by hand. Is there a way to tell the computer \"make a new one every second\"? And they should not pile up on the screen forever.",
            "contentMd": "The basket (the cat) goes left and right, and the score goes up when it catches a fruit. But no fruit falls from the sky.\n\n### A repeating event\nThe `every [1000] ms` block runs once every set amount of time. 1000 milliseconds is one second. If you write \"make a new fruit\" inside it, a fruit appears every second.\n\n### Build the blocks\n1. From the **Game** category, drop the `every [1000] ms` event block into the work area. Change the number to 800.\n2. In the **Variables** category, use **Create variable...** to make a variable called `meyve` (fruit). Take the `set [meyve] to [ ]` block and attach it inside the event. Connect the `new [Apple] sprite, kind [Food]` block from the **Sprite** category as its value.\n3. Put the fruit in the sky: add the `move [meyve] to x [80] y [60]` block. Type -8 for y (just above the screen). For x, put the `random integer from [10] to [150]` block from the **Math** category.\n4. Make the fruit fall: add the `set [meyve] speed x [30] y [0]` block from the **Motion** category. Type 0 for x. For y, put a random number: between 35 and 70.\n5. Delete the ones that leave the screen: add the `[meyve] [delete when it leaves the world]: [yes]` block from the **Sprite** category.\n6. Press the ▶ button. Fruits fall from random places. Catch them with the basket and watch the score go up.\n\nExpected result: Every 0.8 seconds a fruit falls from a different place. The fruit you catch raises the score. The fruits you miss are deleted when they leave the screen.\n\n### How does it work?\n- The `every [800] ms` event repeats for as long as the game stays open.\n- In each round, the `new [Apple] sprite, kind [Food]` block makes a brand new fruit. The `meyve` variable points to the newest fruit each time. The old fruits keep falling at their own speeds.\n- A **random number** picks a number between 10 and 150 every time it runs. So the fruit falls from a different place each time.\n- The fruit starts outside the screen (y -8). The delete when it leaves the world setting makes sure that once a sprite has come onto the screen, it is deleted if it leaves again. If you turn this setting off, thousands of fruits pile up off the screen and the game slows down.\n\n### Try it\n1. Make the falling speed range wider: between 20 and 120. Did the game get harder?\n2. Change the frequency to 400 ms. How did the game change?\n3. Change the fruit's picture: add the `set [meyve] picture to [picture]` block inside the event and choose **Orange**.\n\n### Common mistakes\n- If you leave the y value at 60, the fruit appears in the middle of the screen.\n- If you type 0 for y instead of x in the speed block, the fruit slides sideways and never falls.\n- If you do not delete the fruits that leave the screen, the game stops after a while. The Game Workshop allows 500 sprites at most.\n- In the random number block, write the smaller number in the first slot and the bigger number in the second slot.",
            "question": "Why does the game use randomness instead of always dropping fruit in the same order? What would the game be like without randomness? Give examples of things that are random in real life.",
            "explainerMd": "### What you will learn in this lesson\n- How to do a job that repeats at set intervals with the `every ... ms` block\n- How to make **new sprites** while the game runs and hold them with a variable\n- The **random number** block and why it makes the game interesting\n- Why sprites that leave the screen need to be deleted\n\n### What you should know first\nFrom lesson 1, making a new sprite and giving it a position; from lesson 4, giving a speed (x and y); from lessons 6 and 7, collisions and the score. You used the idea of a variable with **Create variable...** in lesson 1.\n\n### An interval event\n`when game starts` runs once. `every [800] ms`, on the other hand, **repeats** for as long as the game stays open. The time is in milliseconds: 1000 ms = 1 second, 800 ms = 0.8 seconds. So that is 60000 / 800 = 75 rounds a minute.\n\n### Making new sprites\nIn each round, the `new [Apple] sprite, kind [Food]` block makes a **brand new** fruit. You put it into a variable (`meyve`, fruit) so that you can set its position and speed. The variable points to the newest fruit in each round; the old fruits keep falling at their own speeds.\n\n```\nevery 800 ms:\n  meyve = new Apple sprite (kind: Food)\n  meyve position: x = random(10, 150), y = -8\n  meyve speed: x = 0, y = random(35, 70)\n  meyve delete when it leaves the world: yes\n```\n\n### Random number\n`random integer from [10] to [150]` picks a number between these two numbers (including both ends) every time it runs. The fruit falls from a different place each time; the game is different each time. The screen is 160 pixels wide and 120 pixels high, so the 10-150 range is a little way in from the edges.\n\n### Falling speed\nSpeed is how many pixels are covered in a second. If y is positive, it goes down (the top of the screen is y = 0). At a speed of 60 pixels/s, the height of the screen (120 pixels) is crossed in about 2 seconds.\n\n| y speed | Time to cross 120 pixels |\n|---|---|\n| 30 | 4 s |\n| 60 | 2 s |\n| 120 | 1 s |\n\n### Tidying up is a must\nA fruit that has left the screen keeps existing even though it cannot be seen. The `delete when it leaves the world: yes` setting deletes them. If you turn the setting off, the number of sprites grows; the Game Workshop allows 500 sprites at most and gives an error when that is passed.\n\n### Summary\nThe `every ... ms` block does a job again and again. In each round you make a new sprite and set its position and speed with a random number. Speed is measured in pixels per second. If you do not delete the ones that leave the screen, the sprites pile up and the game stops.",
            "concepts": [
              {
                "term": "every ... ms",
                "definition": "An event that repeats once every set amount of time for as long as the game stays open. The time is in milliseconds (1000 ms = 1 second).",
                "example": "\"every 800 ms\" runs 75 times a minute.",
                "pitfall": "Thinking the time is in seconds and writing 2; 2 milliseconds is very short, so the event runs at its fastest (50 ms) and the sprites pile up straight away."
              },
              {
                "term": "Making new sprites",
                "definition": "The \"new [picture] sprite, kind [kind]\" block makes a brand new sprite while the game runs; you hold it in a variable.",
                "example": "The meyve variable points to the newest fruit in each round; the old fruits keep falling.",
                "pitfall": "Forgetting to set the new sprite's position and speed; they pile up, not moving, in the middle of the screen."
              },
              {
                "term": "Random number",
                "definition": "A block that picks a different number between two numbers (including both ends) each time it runs.",
                "example": "If you give a random 10-150 for x, the fruit falls from a different place each time.",
                "pitfall": "Letting the range spill off the screen; the screen is 160 pixels wide, so an x bigger than 160 makes a fruit outside the screen."
              },
              {
                "term": "Speed and direction",
                "definition": "Speed is measured in pixels per second. If y is positive the sprite goes down; if it is negative it goes up.",
                "example": "A fruit with a y speed of 60 crosses the screen's 120 pixel height in about 2 seconds.",
                "pitfall": "Writing the 0 on the wrong axis; if you give 0 to y instead of x, the fruit slides sideways and does not fall."
              },
              {
                "term": "Delete when it leaves the world",
                "definition": "The setting that deletes a sprite by itself when it leaves the screen.",
                "example": "A missed fruit is deleted when it leaves through the bottom of the screen, and memory is freed.",
                "pitfall": "Not turning the setting on; the sprites pile up, and when there are more than 500 the game gives an error and stops."
              }
            ],
            "quiz": [
              {
                "id": "m11h2d8-q1",
                "kind": "numeric",
                "prompt": "An event makes a fruit \"every 800 ms\". How many fruits are made in one minute (60 seconds)?",
                "answer": 75,
                "tolerance": 0,
                "unit": "fruits",
                "explanation": "60 seconds = 60000 ms. 60000 / 800 = 75 fruits.",
                "skills": [
                  "game-spawn",
                  "game-timing"
                ]
              },
              {
                "id": "m11h2d8-q2",
                "kind": "numeric",
                "prompt": "A fruit's y speed is 40 (40 pixels a second). The screen is 120 pixels high. In how many seconds does the fruit get from the top edge of the screen (y = 0) to the bottom edge?",
                "answer": 3,
                "tolerance": 0,
                "unit": "s",
                "explanation": "Time = distance / speed = 120 / 40 = 3 seconds. If the speed goes up, the time gets shorter and the game gets harder.",
                "skills": [
                  "game-timing"
                ]
              },
              {
                "id": "m11h2d8-q3",
                "kind": "find-bug",
                "prompt": "The fruits do not fall from the sky; they slide sideways. Which is the bug?\n\n```\nevery 800 ms:\n  meyve = new Apple sprite (kind: Food)\n  meyve position: x = random(10, 150), y = -8\n  meyve speed: x = 40, y = 0\n  meyve delete when it leaves the world: yes\n```",
                "options": [
                  "y = -8 is not allowed in the position",
                  "The delete setting has been turned on wrongly",
                  "The speed block has x = 40, y = 0; to fall it should be x = 0, y = a positive number",
                  "The random number range is too wide"
                ],
                "answer": 2,
                "explanation": "The y speed is 0, so the fruit does not go down; the x speed is 40, so it slides sideways. To fall, y is given a positive speed. y = -8 means just above the screen and is correct.",
                "skills": [
                  "game-timing",
                  "game-debug"
                ]
              },
              {
                "id": "m11h2d8-q4",
                "kind": "mcq",
                "prompt": "What happens if you never turn on the \"delete when it leaves the world\" setting?",
                "options": [
                  "Nothing happens; a sprite that leaves the screen disappears by itself",
                  "The fruits that leave the screen pile up; when the number of sprites passes 500, the game gives an error and stops",
                  "The fruits come back",
                  "The score is reset"
                ],
                "answer": 1,
                "explanation": "A sprite that cannot be seen still exists. If a new one is added every 800 ms, the number keeps growing. The Game Workshop allows 500 sprites at most.",
                "skills": [
                  "game-spawn",
                  "game-debug"
                ]
              },
              {
                "id": "m11h2d8-q5",
                "kind": "predict-output",
                "prompt": "After this event runs for a few seconds, what can you see on the screen?\n\n```\nevery 1000 ms:\n  meyve = new Apple sprite (kind: Food)\n  meyve position: x = 80, y = 60\n```",
                "options": [
                  "Fruits fall from random places",
                  "There is always just one apple on the screen",
                  "They stay still at the same point and pile on top of each other; one more apple is added every second",
                  "No apples appear"
                ],
                "answer": 2,
                "explanation": "The position is the same each time (80, 60) and no speed is given. The old apples are not deleted, so each new one sits on top; it looks like a single apple, but the number of sprites grows.",
                "skills": [
                  "game-spawn",
                  "game-random",
                  "game-debug"
                ]
              }
            ]
          }
        },
        {
          "title": "Bombadan kaç, canını koru",
          "durationMin": 22,
          "problem": "Her oyunda bir risk vardır. Hata yaparsan bir şey kaybedersin ve çoğu zaman bu kayıp can ile ölçülür. Bir oyun nasıl \"canın bitti\" der? Ve bu mesajı gördüğünde oyunun bitmesi için kim karar verir?",
          "contentMd": "Meyve yakalama oyununa bomba eklendi. Bombalar da meyveler gibi gökten düşüyor ve türleri **Düşman**. Sepet (kedi) hem meyve hem bombaya değebilir. Meyveye değince skor artıyor, ama bombaya değince hiçbir şey olmuyor. Oyun 3 canla başlıyor.\n\n### Can\nOyunda **can** adlı hazır bir sayı vardır. Ekranın köşesinde kalp olarak gösterilir.\n- `canı [3] yap`: canı belirler.\n- `canı [-1] değiştir`: cana ekler. Eksi sayı azaltır.\n- `can`: canı sayı olarak verir.\n- Can **0** olunca oyun kendiliğinden biter. Ama `can bitince` bloğunu kullanırsan karar sende: orada oyunu kendin bitirmelisin.\n\n### Blokları kur\n1. Önce oyunu çalıştır ve bomba ile meyve düşüşünü izle. Bombaya değmenin bir etkisi yok.\n2. **Sprite** kategorisinden `bir [Oyuncu] sprite'ı bir [Düşman] sprite'ına çarpınca` olayını koy.\n3. İçine **Oyun** kategorisinden `canı [-1] değiştir` bloğunu tak.\n4. Altına `ekranı [250] ms salla` bloğunu ekle.\n5. **Ses** kategorisinden `[patlama] melodisini çal` bloğunu ekle.\n6. En alta `[diğer sprite] sprite'ını sil` bloğunu koy (bombayı yut).\n7. ▶ düğmesine bas. Bombaya her değişte kalp azalır, ekran sallanır ve bomba yok olur. Üçüncü bombadan sonra \"CAN BİTTİ\" yazar.\n8. Şimdi kendi bitişini yazalım. **Oyun** kategorisinden `can bitince` olay bloğunu getir. İçine `ekranda [Canların bitti!] yaz, [2] saniye`, `[kayıp] melodisini çal` ve `oyunu bitir: [kaybettin]` bloklarını sırayla tak.\n9. ↺ düğmesine bas ve üç bombayı yakala. Kendi mesajın çıkar ve oyun kaybedilir.\n\nBeklenen sonuç: Bombaya değince bir can gider, ekran sallanır. Üçüncü bombadan sonra mesajın çıkar ve oyun kaybedilir.\n\n### Nasıl çalışıyor?\n- İki çarpışma olayı yan yana çalışabilir. Biri meyve, öteki bomba için bekler. Her olay yalnız kendi türleri değince çalışır.\n- `can bitince` olayı canın sıfıra düştüğü anda bir kez çalışır. Bu bloğu yazarsan oyun otomatik bitmez. Oyunu bitirmeyi unutursan oyun sıfır canla devam eder.\n- `canı [-1] değiştir` demek \"cana -1 ekle\" demektir. Can hiçbir zaman 0'ın altına inmez.\n\n### Dene\n1. Bomba ceza olarak canı 2 azaltsın.\n2. Başlangıç canını 5 yap: `oyun başlayınca` içindeki `canı [3] yap` bloğunu değiştir.\n3. Ekran sallanma süresini 100 ve sonra 800 ms yap. Hangisi daha iyi hissettiriyor?\n\n### Sık yapılan hatalar\n- Bombayı silmeyi unutursan bomba, sepetin üstünden geçerken bir can götürür ama sonra sahnede düşmeye devam eder. Görüntü kafa karıştırır.\n- `can bitince` bloğunun içinde oyunu bitiren blok yoksa oyun sıfır canla çalışmaya devam eder.\n- Çarpışma olayında türü yanlış seçersen (ör. Düşman yerine Yiyecek) olay bomba için değil, meyve için çalışır.",
          "question": "Bir oyunda \"can\" yerine başka bir ceza düşünebilir misin? (Mesela zaman kaybı ya da puan azalması.) Hangisi sana daha adil gelir? Çok kolay ya da çok zor bir oyunu bırakmana ne sebep olur?",
          "explainerMd": "### Bu derste öğreneceklerin\n- **Can** sayısını ve üç bloğunu\n- Aynı oyunda birden çok çarpışma olayının nasıl yan yana çalıştığını\n- `can bitince` olayının oyunu kimin bitirdiğini nasıl değiştirdiğini\n- Geri bildirim (sallanma, ses) ile tehlikeyi hissettirmeyi\n\n### Önceden bilmen gerekenler\nDers 6'dan çarpışma olayı ve `diğer sprite`'ı silmeyi; ders 7'den skor bloklarına benzeyen `yap` ve `değiştir` bloklarını ve `eğer` bloğunu; ders 8'den düşen nesneleri ve sprite türlerini.\n\n### Can, skorun kardeşi\n**Can**, oyuncunun kaç hatası kaldığını sayan bir sayıdır. Skor gibi çalışır, ekranda kalp olarak görünür:\n\n| Blok | Ne yapar | Can 3 iken |\n|---|---|---|\n| `canı [5] yap` | Canı belirler | 5 |\n| `canı [-1] değiştir` | Cana -1 ekler | 2 |\n| `can` | Sayıyı okur | 3 |\n\nCan 0'ın altına inmez. Can 0 olunca \"can bitti\" durumu başlar.\n\n### İki tür, iki olay\nDüşen şeylerin türleri farklı olduğu için iki ayrı olay yazarsın:\n\n| Olay | Tepki |\n|---|---|\n| Oyuncu, **Yiyecek**'e çarpınca | skor +1, melodi, meyveyi sil |\n| Oyuncu, **Düşman**'a çarpınca | can -1, ekranı salla, patlama sesi, bombayı sil |\n\nHer olay yalnız kendi iki türü değince çalışır. Biri diğerini bozmaz.\n\n### Sallanma ve ses\n`ekranı [250] ms salla` oyuncuya \"canın gitti\" der. Süre uzadıkça his değişir: 100 ms hafif bir sarsıntıdır, 800 ms uzun bir sarsıntıdır. Doğru süre, oyunun havasına bağlıdır.\n\n### Can bitince kim bitirir?\nHiç `can bitince` bloğu yazmazsan, can 0 olduğu anda oyun kendiliğinden biter ve \"CAN BİTTİ\" yazar. Bu bloğu yazarsan karar sana geçer: kendi mesajını gösterirsin ve `oyunu bitir: [kaybettin]` bloğunu da **sen** koymalısın. Koymazsan oyun sıfır canla devam eder.\n\n```\ncan bitince:\n  ekrana \"Canların bitti!\" yaz\n  kayıp melodisini çal\n  oyunu bitir: kaybettin\n```\n\n### Hesap\nBaşlangıçta 5 canın var ve her bomba 2 can götürüyor. İlk bomba 3, ikincisi 1 bırakır; üçüncüsü canı 0'a indirir (-1 olmaz). Yani üçüncü bombada oyun biter.\n\n### Özet\nCan, hata payını sayan bir sayıdır. Meyve ve bomba için ayrı çarpışma olayları yazılır. Bombaya değince can azalır, ekran sallanır ve bomba silinir. `can bitince` bloğunu yazarsan oyunu bitirmek senin işindir.",
          "concepts": [
            {
              "term": "Can",
              "definition": "Oyuncunun kaç hatası kaldığını sayan, ekranda kalp olarak görünen sayı. 0'ın altına inmez.",
              "example": "3 canla başlarsın; her bomba bir can götürür.",
              "pitfall": "Başlangıç canını belirlememek; oyunun can sayısı beklediğinden farklı olabilir."
            },
            {
              "term": "canı değiştir",
              "definition": "Cana ekler ya da çıkarır. Eksi sayı canı azaltır.",
              "example": "\"canı -1 değiştir\" 3 canı 2'ye indirir.",
              "pitfall": "-1 yerine 1 yazmak; bombaya değmek can kazandırır."
            },
            {
              "term": "Tehlike olayı",
              "definition": "Oyuncunun Düşman türüne çarpmasıyla çalışan ayrı bir çarpışma olayı; ceza ve geri bildirim içerir.",
              "example": "Can -1, ekranı salla, patlama sesi, bombayı sil.",
              "pitfall": "Türü yanlış seçmek (Yiyecek yerine Düşman gibi); olay bombalar için çalışmaz."
            },
            {
              "term": "can bitince",
              "definition": "Can 0'a düştüğü anda bir kez çalışan olay.",
              "example": "İçine mesaj yaz, kayıp melodisi çal, oyunu bitir: kaybettin.",
              "pitfall": "İçine oyunu bitir bloğunu koymamak; oyun sıfır canla sürer."
            },
            {
              "term": "Geri bildirim",
              "definition": "Oyuncuya bir şeyin olduğunu hissettiren ses, sallanma ya da mesaj.",
              "example": "Bombaya değince ekran 250 ms sallanır ve patlama sesi çalar.",
              "pitfall": "Sallanmayı çok uzun yapmak; 800 ms oyunu rahatsız edici bulandırır."
            }
          ],
          "quiz": [
            {
              "id": "m11h2d9-q1",
              "kind": "numeric",
              "prompt": "Oyun 5 canla başlıyor ve her bomba 2 can götürüyor. Kaçıncı bombada oyun biter?",
              "answer": 3,
              "tolerance": 0,
              "unit": "bomba",
              "explanation": "5 → 3 → 1 → 0. Üçüncü bomba canı -1'e değil 0'a indirir (can 0'ın altına inmez) ve oyun biter.",
              "skills": [
                "game-lives"
              ]
            },
            {
              "id": "m11h2d9-q2",
              "kind": "predict-output",
              "prompt": "Kedi 3 bombaya değiyor (can 3'ten başlıyor). Ne olur?\n\n```\nbir Oyuncu bir Düşman'a çarpınca:\n  canı -1 değiştir\n  diğer sprite'ı sil\ncan bitince:\n  ekrana \"Bitti\" yaz\n```",
              "options": [
                "Oyun kendiliğinden \"CAN BİTTİ\" ile biter",
                "Kedi silinir",
                "Mesaj çıkar ama oyunu bitiren blok yok; oyun sıfır canla devam eder",
                "Can eksiye iner"
              ],
              "answer": 2,
              "explanation": "Can 0 olunca \"can bitince\" çalışır ve mesaj yazılır. Bu bloğu yazınca oyunu bitirmek sana kalır; \"oyunu bitir\" olmadığı için oyun sürer. Can eksiye inmez ve kedi silinmez.",
              "skills": [
                "game-lives",
                "game-flow",
                "game-debug"
              ]
            },
            {
              "id": "m11h2d9-q3",
              "kind": "find-bug",
              "prompt": "Bombalar Düşman türünde ama kedi onlara değince can azalmıyor. Hata hangisi?\n\n```\nbir Oyuncu bir Yiyecek'e çarpınca:\n  canı -1 değiştir\n  ekranı 250 ms salla\n```",
              "options": [
                "\"canı -1 değiştir\" yerine \"canı 1 yap\" olmalı",
                "Sallama süresi çok kısa",
                "\"canı -1\" bloğunun yeri yanlış",
                "Olayın ikinci türü Yiyecek; bomba Düşman olduğu için olay çalışmıyor"
              ],
              "answer": 3,
              "explanation": "Olay yalnız belirtilen türler değince çalışır. Bombalar Düşman türünde olduğu için olay Düşman'a çarpınca olmalı. Blokların kendisi doğru.",
              "skills": [
                "game-kinds",
                "game-lives",
                "game-debug"
              ]
            },
            {
              "id": "m11h2d9-q4",
              "kind": "mcq",
              "prompt": "Hiç \"can bitince\" bloğu yazmazsan can 0 olunca ne olur?",
              "options": [
                "Oyun kendiliğinden biter ve \"CAN BİTTİ\" yazar",
                "Oyun sürer, hiçbir şey olmaz",
                "Can otomatik 3'e döner",
                "Skor sıfırlanır"
              ],
              "answer": 0,
              "explanation": "\"can bitince\" bloğu yoksa oyun varsayılan davranışı uygular: oyunu bitirir. Bloğu yazdığında bu karar sana geçer.",
              "skills": [
                "game-lives",
                "game-flow"
              ]
            },
            {
              "id": "m11h2d9-q5",
              "kind": "mcq",
              "prompt": "\"canı [-1] değiştir\" bloğundaki -1 ne anlama gelir?",
              "options": [
                "Can -1 olur",
                "Cana -1 eklenir; yani can 1 azalır",
                "Can 1 kazanır",
                "Oyun hemen biter"
              ],
              "answer": 1,
              "explanation": "\"değiştir\" mevcut sayıya ekler. -1 eklemek 1 çıkarmaktır; 3 can 2 olur. Canı doğrudan -1 yapmak \"yap\" bloğuna ait iştir ve zaten can 0'ın altına inmez.",
              "skills": [
                "game-lives"
              ]
            }
          ],
          "contentEn": {
            "title": "Dodge the bombs, keep your lives",
            "problem": "Every game has a risk. If you make a mistake you lose something, and most of the time that loss is measured in lives. How does a game say \"you are out of lives\"? And when you see that message, who decides that the game should end?",
            "contentMd": "Bombs have been added to the fruit-catching game. The bombs fall from the sky like the fruits, and their kind is **Enemy**. The basket (the cat) can touch both fruits and bombs. When it touches a fruit the score goes up, but when it touches a bomb nothing happens. The game starts with 3 lives.\n\n### Lives\nThe game has a ready-made number called **lives**. It is shown as hearts in the corner of the screen.\n- `set lives to [3]`: sets the lives.\n- `change lives by [-1]`: adds to the lives. A minus number lowers them.\n- `lives`: gives the lives as a number.\n- When the lives reach **0**, the game ends by itself. But if you use the `when lives run out` block, the decision is yours: you must end the game yourself there.\n\n### Build the blocks\n1. First run the game and watch the bombs and fruits fall. Touching a bomb has no effect.\n2. From the **Sprite** category, put in the `when a [Player] sprite hits a [Enemy] sprite` event.\n3. Attach the `change lives by [-1]` block from the **Game** category inside it.\n4. Underneath, add the `shake screen for [250] ms` block.\n5. From the **Sound** category, add the `play melody [boom]` block.\n6. At the very bottom, put the `delete sprite [other sprite]` block (swallow the bomb).\n7. Press the ▶ button. Each time you touch a bomb a heart goes, the screen shakes and the bomb disappears. After the third bomb it says \"NO LIVES LEFT\".\n8. Now let's write our own ending. Bring the `when lives run out` event block from the **Game** category. Attach the `show [You are out of lives!] on screen for [2] seconds`, `play melody [lose]` and `end game: [you lose]` blocks inside it, in order.\n9. Press the ↺ button and catch three bombs. Your own message appears and the game is lost.\n\nExpected result: When you touch a bomb, a life goes and the screen shakes. After the third bomb your message appears and the game is lost.\n\n### How does it work?\n- Two collision events can run side by side. One waits for fruit, the other for bombs. Each event only runs when its own kinds touch.\n- The `when lives run out` event runs once, the moment the lives drop to zero. If you write this block, the game does not end automatically. If you forget to end the game, the game carries on with zero lives.\n- Saying `change lives by [-1]` means \"add -1 to the lives\". The lives never go below 0.\n\n### Try it\n1. Make the bomb's penalty take away 2 lives.\n2. Make the starting lives 5: change the `set lives to [3]` block inside `when game starts`.\n3. Make the screen shake time 100 and then 800 ms. Which one feels better?\n\n### Common mistakes\n- If you forget to delete the bomb, the bomb takes a life as it passes over the basket, but then it keeps falling on the stage. What you see is confusing.\n- If there is no block that ends the game inside the `when lives run out` block, the game keeps running with zero lives.\n- If you choose the wrong kind in the collision event (e.g. Food instead of Enemy), the event runs for the fruit, not for the bomb.",
            "question": "Can you think of another penalty instead of \"lives\" in a game? (For example, losing time or losing points.) Which one seems fairer to you? What makes you give up on a game that is too easy or too hard?",
            "explainerMd": "### What you will learn in this lesson\n- The **lives** number and its three blocks\n- How several collision events run side by side in the same game\n- How the `when lives run out` event changes who ends the game\n- How to make danger felt with feedback (shaking, sound)\n\n### What you should know first\nFrom lesson 6, the collision event and deleting `other sprite`; from lesson 7, the `set` and `change` blocks like the score blocks, and the `if` block; from lesson 8, falling objects and sprite kinds.\n\n### Lives, the score's sibling\n**Lives** is a number that counts how many mistakes the player has left. It works like the score and appears on the screen as hearts:\n\n| Block | What it does | When lives are 3 |\n|---|---|---|\n| `set lives to [5]` | Sets the lives | 5 |\n| `change lives by [-1]` | Adds -1 to the lives | 2 |\n| `lives` | Reads the number | 3 |\n\nThe lives do not go below 0. When the lives reach 0, the \"out of lives\" state begins.\n\n### Two kinds, two events\nThe falling things are of different kinds, so you write two separate events:\n\n| Event | Response |\n|---|---|\n| when a Player hits a **Food** | score +1, melody, delete the fruit |\n| when a Player hits an **Enemy** | lives -1, shake the screen, boom sound, delete the bomb |\n\nEach event only runs when its own two kinds touch. One does not spoil the other.\n\n### Shaking and sound\n`shake screen for [250] ms` tells the player \"you lost a life\". As the time gets longer, the feeling changes: 100 ms is a light shake, 800 ms is a long shake. The right time depends on the mood of the game.\n\n### When the lives run out, who ends the game?\nIf you never write a `when lives run out` block, the game ends by itself the moment the lives reach 0 and it says \"NO LIVES LEFT\". If you write this block, the decision passes to you: you show your own message, and **you** must also put in the `end game: [you lose]` block. If you do not, the game carries on with zero lives.\n\n```\nwhen lives run out:\n  show \"You are out of lives!\" on screen\n  play melody lose\n  end game: you lose\n```\n\n### A calculation\nYou have 5 lives at the start and each bomb takes 2 lives. The first bomb leaves 3, the second leaves 1; the third brings the lives down to 0 (not -1). So the game ends at the third bomb.\n\n### Summary\nLives is a number that counts your margin for mistakes. Separate collision events are written for fruit and bombs. When you touch a bomb, the lives go down, the screen shakes and the bomb is deleted. If you write the `when lives run out` block, ending the game is your job.",
            "concepts": [
              {
                "term": "Lives",
                "definition": "The number, shown as hearts on the screen, that counts how many mistakes the player has left. It does not go below 0.",
                "example": "You start with 3 lives; each bomb takes one life.",
                "pitfall": "Not setting the starting lives; the game's number of lives may be different from what you expect."
              },
              {
                "term": "change lives",
                "definition": "Adds to or takes away from the lives. A minus number lowers the lives.",
                "example": "\"change lives by -1\" brings 3 lives down to 2.",
                "pitfall": "Writing 1 instead of -1; touching a bomb then gives you a life."
              },
              {
                "term": "Danger event",
                "definition": "A separate collision event that runs when the player hits the Enemy kind; it holds the penalty and the feedback.",
                "example": "Lives -1, shake the screen, boom sound, delete the bomb.",
                "pitfall": "Choosing the wrong kind (such as Food instead of Enemy); the event does not run for the bombs."
              },
              {
                "term": "when lives run out",
                "definition": "The event that runs once, the moment the lives drop to 0.",
                "example": "Inside it: write a message, play the lose melody, end game: you lose.",
                "pitfall": "Not putting the end game block inside it; the game carries on with zero lives."
              },
              {
                "term": "Feedback",
                "definition": "A sound, shake or message that lets the player feel something has happened.",
                "example": "When you touch a bomb, the screen shakes for 250 ms and a boom sound plays.",
                "pitfall": "Making the shake too long; 800 ms blurs the game in an annoying way."
              }
            ],
            "quiz": [
              {
                "id": "m11h2d9-q1",
                "kind": "numeric",
                "prompt": "The game starts with 5 lives and each bomb takes 2 lives. At which bomb does the game end?",
                "answer": 3,
                "tolerance": 0,
                "unit": "bombs",
                "explanation": "5 → 3 → 1 → 0. The third bomb brings the lives down to 0, not -1 (the lives do not go below 0), and the game ends.",
                "skills": [
                  "game-lives"
                ]
              },
              {
                "id": "m11h2d9-q2",
                "kind": "predict-output",
                "prompt": "The cat touches 3 bombs (the lives start at 3). What happens?\n\n```\nwhen a Player hits an Enemy:\n  change lives by -1\n  delete other sprite\nwhen lives run out:\n  show \"Over\" on screen\n```",
                "options": [
                  "The game ends by itself with \"NO LIVES LEFT\"",
                  "The cat is deleted",
                  "The message appears, but there is no block that ends the game; the game carries on with zero lives",
                  "The lives go below zero"
                ],
                "answer": 2,
                "explanation": "When the lives reach 0, \"when lives run out\" runs and the message is written. Once you write this block, ending the game is up to you; there is no \"end game\", so the game goes on. The lives do not go below zero and the cat is not deleted.",
                "skills": [
                  "game-lives",
                  "game-flow",
                  "game-debug"
                ]
              },
              {
                "id": "m11h2d9-q3",
                "kind": "find-bug",
                "prompt": "The bombs are of the Enemy kind, but when the cat touches them the lives do not go down. Which is the bug?\n\n```\nwhen a Player hits a Food:\n  change lives by -1\n  shake screen for 250 ms\n```",
                "options": [
                  "It should be \"set lives to 1\" instead of \"change lives by -1\"",
                  "The shake time is too short",
                  "The \"lives -1\" block is in the wrong place",
                  "The event's second kind is Food; the bomb is an Enemy, so the event does not run"
                ],
                "answer": 3,
                "explanation": "The event only runs when the kinds it names touch. The bombs are of the Enemy kind, so the event should be for hitting an Enemy. The blocks themselves are correct.",
                "skills": [
                  "game-kinds",
                  "game-lives",
                  "game-debug"
                ]
              },
              {
                "id": "m11h2d9-q4",
                "kind": "mcq",
                "prompt": "If you never write a \"when lives run out\" block, what happens when the lives reach 0?",
                "options": [
                  "The game ends by itself and says \"NO LIVES LEFT\"",
                  "The game goes on and nothing happens",
                  "The lives go back to 3 automatically",
                  "The score is reset"
                ],
                "answer": 0,
                "explanation": "If there is no \"when lives run out\" block, the game does its default behaviour: it ends the game. When you write the block, this decision passes to you.",
                "skills": [
                  "game-lives",
                  "game-flow"
                ]
              },
              {
                "id": "m11h2d9-q5",
                "kind": "mcq",
                "prompt": "What does the -1 in the \"change lives by [-1]\" block mean?",
                "options": [
                  "The lives become -1",
                  "-1 is added to the lives; so the lives go down by 1",
                  "You gain 1 life",
                  "The game ends at once"
                ],
                "answer": 1,
                "explanation": "\"change\" adds to the current number. Adding -1 is taking away 1; 3 lives become 2. Making the lives exactly -1 would be the job of the \"set\" block, and anyway the lives do not go below 0.",
                "skills": [
                  "game-lives"
                ]
              }
            ]
          }
        },
        {
          "title": "Proje: Meyve avı",
          "durationMin": 35,
          "problem": "Bu haftanın bütün parçalarını bir araya getirip eksiksiz bir oyun yapacaksın: çarpışma, skor, can, rastgele düşen nesneler ve bir de zamana karşı yarış. İyi bir oyunun bir amacı, bir riski ve bir sonu olur. Meyve avında amaç 8 meyve toplamak, risk bombalar, son ise kazanmak ya da kaybetmek.",
          "contentMd": "Projenin yarısı hazır: sepet kediyi sağa sola yürütüyor, meyveler ve bombalar düşüyor, meyve yakalayınca skor artıyor. Eksik olanlar: bomba cezası, geri sayım, kazanma ve kaybetme kuralları.\n\n### Oyunun kuralları\n- Başlangıçta 5 canın ve 45 saniyen var.\n- Meyve yakalarsan skor 1 artar. Skor 8 olunca kazanırsın.\n- Bombaya değersen 1 can kaybedersin ve ekran sallanır.\n- Canın biterse ya da süre dolarsa kaybedersin.\n\n### Önce incele\n1. ▶ düğmesine basıp oyunu çalıştır. Neler çalışıyor, neler eksik?\n2. Blokları oku: kaç tane olay bloğu var? Her biri ne zaman çalışıyor?\n\n### Bomba cezası\n1. `bir [Oyuncu] sprite'ı bir [Düşman] sprite'ına çarpınca` olayını koy.\n2. İçine sırayla `canı [-1] değiştir`, `ekranı [250] ms salla`, `[patlama] melodisini çal` ve `[diğer sprite] sprite'ını sil` bloklarını tak.\n\n### Geri sayım\n1. `oyun başlayınca` bloğunun içine **Oyun** kategorisinden `geri sayımı [30] saniyeden başlat` bloğunu ekle. Sayıyı 45 yap.\n2. `süre bitince` olay bloğunu getir. İçine `ekranda [Süre doldu!] yaz, [2] saniye`, `[kayıp] melodisini çal` ve `oyunu bitir: [kaybettin]` bloklarını tak.\n\n### Kazanma\n1. Meyve olayının (`bir [Oyuncu] sprite'ı bir [Yiyecek] sprite'ına çarpınca`) en altına `eğer [koşul] ise` bloğu ekle.\n2. Koşul olarak **Mantık** kategorisindeki karşılaştırma bloğunu kullan: `skor` bloğu **≥** 8.\n3. İçine `ekranda [Kazandın!] yaz, [2] saniye`, `[zafer] melodisini çal` ve `oyunu bitir: [kazandın]` bloklarını koy.\n\n### Kaybetme\n`can bitince` olay bloğunu getir. İçine `ekranda [Canların bitti!] yaz, [2] saniye`, `[kayıp] melodisini çal` ve `oyunu bitir: [kaybettin]` bloklarını koy.\n\n### Çalıştır ve dene\n1. ↺ düğmesine bas ve oyunu baştan sona oyna. Bir kez kazan, bir kez bilerek kaybet.\n2. Hedefler panelindeki yedi maddenin hepsi yeşil mi?\n\nBeklenen sonuç: Üstte skor, kalp ve kalan süre görünür. 8 meyve toplarsan kazanırsın. Canların biterse ya da süre dolursa kaybedersin.\n\n### Nasıl çalışıyor?\n- Oyunun parçaları birbirinden bağımsız **olaylara** bölünmüştür: sahne kurulumu, meyve düşürme, bomba düşürme, çarpışmalar, can bitince, süre bitince. Her olay yalnız kendi işiyle uğraşır.\n- Oyun tek bir sonla bitmeli. Kazanma ya da kaybetme bloğu çalıştığı anda oyun biter ve diğer olaylar durur.\n- `kalan süre (sn)` bloğu geri sayımda ne kadar zaman kaldığını verir. Kazanma mesajına eklemek için `birleştir` bloğuyla kullanabilirsin.\n\n### Kendi dokunuşunu kat\nAşağıdakilerden en az ikisini dene:\n1. Kazanma skorunu 12 yap ve süreyi 60 saniyeye çıkar. Oyun dengeli mi?\n2. Meyve düşme hızını artır. Hangi hız eğlenceli, hangisi imkânsız?\n3. Meyveyi yakalayınca kedi `ekranda [Nefis!] yaz, [1] saniye` mesajını göstersin.\n4. Arka plan rengini değiştir ya da başka bir oyuncu resmi seç.\n\n### Sık yapılan hatalar\n- Kazanma koşulunu **=** ile yazarsan ve skor 8'i atlarsa kazanamazsın. **≥** kullanmak daha güvenlidir.\n- Geri sayım bloğunu hiçbir olayın içine koymazsan çalışmaz. Onu `oyun başlayınca` içine koy.\n- `can bitince` ve `süre bitince` bloklarında oyunu bitirmeyi unutma. Bu blokları yazınca oyunun bitip bitmemesi sana kalır.\n- Meyve ve bomba için iki ayrı çarpışma olayı yaz. Türü yanlış seçersen olay beklediğin sprite için çalışmaz.",
          "question": "Oyunun amacı, riski ve sonu ne? Arkadaşın oynarken en çok nerede zorlandı? Oyunu daha eğlenceli yapmak için bir şeyi değiştirmen gerekse neyi değiştirirdin?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Eksiksiz bir oyunu **amaç, risk ve son** olarak tasarlamayı\n- Oyunu bağımsız olaylara bölmeyi\n- **Geri sayım** ve `süre bitince` olayını kullanmayı\n- Kazanma ve kaybetme kurallarını çakıştırmadan yazmayı\n\n### Önceden bilmen gerekenler\nDers 6'dan çarpışma, ders 7'den skor ve `eğer skor ≥ ...`, ders 8'den her ... ms'de bir ile rastgele düşen nesneler, ders 9'dan can ve `can bitince`. Bu ders yeni bir fikirden çok bu parçaları birleştirir.\n\n### İyi oyunun üç parçası\n| Parça | Meyve avında |\n|---|---|\n| Amaç | 8 meyve toplamak |\n| Risk | Bombalar (5 can) ve zaman (45 saniye) |\n| Son | Kazanmak ya da kaybetmek |\n\nÜçünden biri eksikse oyun sıkıcı olur. Amaç yoksa ne yapacağını bilmezsin. Risk yoksa heyecan kalmaz. Son yoksa oyun hiç bitmez.\n\n### Olaylara bölmek\nBüyük bir iş, her biri tek iş yapan küçük olaylara bölünür:\n\n| Olay | Görevi |\n|---|---|\n| `oyun başlayınca` | Sahneyi kur, skoru 0 ve canı 5 yap, geri sayımı 45 saniyeden başlat |\n| `her ... ms'de bir` (iki tane) | Meyve düşür; bomba düşür |\n| Oyuncu, Yiyecek'e çarpınca | Skoru artır, kazanma kontrolü yap |\n| Oyuncu, Düşman'a çarpınca | Can azalt, salla, sil |\n| `can bitince` | Kaybettin |\n| `süre bitince` | Kaybettin |\n\nBir şey bozulursa yalnız ilgili olaya bakarsın.\n\n### Geri sayım\n`geri sayımı [45] saniyeden başlat` bloğu süreyi başlatır ve kalan süre ekranda görünür. Süre 0 olunca `süre bitince` olayı çalışır. Bu olayı yazmazsan oyun kendiliğinden \"SÜRE BİTTİ\" der; yazarsan oyunu bitirmek sana kalır. Bloğu çalıştırmak için bir olayın içine koymalısın; `oyun başlayınca` en doğrusudur.\n\n### Tek son kuralı\nKazanma ve kaybetme blokları aynı anda çalışabilir mi diye düşün: 8. meyveyi alırsın ve aynı karede süre biter. Oyun, ilk `oyunu bitir` bloğunu uygular; sonrakiler yok sayılır. Bu yüzden kuralları net ve çakışmayacak şekilde kur.\n\n### Dengeyi hesapla\n45 saniyede 8 meyve toplamak için ortalama 45 / 8 = 5,6 saniyede bir meyve yakalamalısın. Meyve her 0,8 saniyede bir düşüyorsa yeterince fırsat var; ama bombalar fırsatı azaltır. Sayıları değiştirip dene: süre, can, hedef skor, hız.\n\n### Özet\nİyi bir oyunun amacı, riski ve sonu vardır. Oyunu her biri tek iş yapan olaylara bölmek hata aramayı kolaylaştırır. Geri sayım ve `süre bitince` zaman baskısı katar. Oyun ilk `oyunu bitir` bloğuyla biter; kuralları buna göre kur ve sayıları oynayarak dengele.",
          "concepts": [
            {
              "term": "Amaç, risk, son",
              "definition": "İyi bir oyunun üç parçası: ne yapılacağı, neyin tehlikede olduğu ve nasıl biteceği.",
              "example": "Meyve avında amaç 8 meyve, risk bomba ve zaman, son kazanmak ya da kaybetmektir.",
              "pitfall": "Riski unutmak; kaybetmek mümkün değilse oyun heyecansız olur."
            },
            {
              "term": "Olaylara bölmek",
              "definition": "Oyunu her biri tek iş yapan küçük olaylara ayırmak: kurulum, düşürme, çarpışmalar, bitişler.",
              "example": "Bomba cezası yalnız Düşman çarpışmasında; kazanma kontrolü yalnız meyve çarpışmasında.",
              "pitfall": "Her şeyi tek bir olaya yığmak; hata çıkınca nerede olduğunu bulmak zorlaşır."
            },
            {
              "term": "Geri sayım ve süre bitince",
              "definition": "\"geri sayımı [n] saniyeden başlat\" süreyi başlatır; süre 0 olunca \"süre bitince\" olayı çalışır.",
              "example": "Oyun başlayınca geri sayımı 45 saniyeden başlat.",
              "pitfall": "Geri sayım bloğunu bir olayın dışında bırakmak; hiç çalışmaz."
            },
            {
              "term": "Kazanma koşulu",
              "definition": "Meyve çarpışmasının içinde \"eğer skor ≥ hedef ise oyunu bitir: kazandın\" yazılır.",
              "example": "Skor ≥ 8 ise \"Kazandın!\" yaz, zafer melodisi çal, oyunu bitir.",
              "pitfall": "= kullanmak; skor hedefi atlarsa oyun kazanılamaz."
            },
            {
              "term": "Denge",
              "definition": "Oyunun ne çok kolay ne imkânsız olması; süre, can, hedef ve hız sayılarının uyumu.",
              "example": "45 saniyede 8 meyve için ortalama 5,6 saniyede bir meyve yakalamak gerekir.",
              "pitfall": "Sayıları hiç denemeden belirlemek; oyun ya hemen biter ya hiç bitmez."
            }
          ],
          "quiz": [
            {
              "id": "m11h2d10-q1",
              "kind": "numeric",
              "prompt": "Oyunda 8 meyve toplamak gerekiyor. Sen ortalama her 4 saniyede bir meyve yakalıyorsun. 8 meyve kaç saniye sürer? (Süre 45 saniye.)",
              "answer": 32,
              "tolerance": 0,
              "unit": "sn",
              "explanation": "8 × 4 = 32 saniye. 45 saniyeden az olduğu için bu hızla süre dolmadan kazanırsın (13 saniye payın kalır).",
              "skills": [
                "game-design",
                "game-timing"
              ]
            },
            {
              "id": "m11h2d10-q2",
              "kind": "predict-output",
              "prompt": "Oyuncu 8. meyveyi 30. saniyede yakalıyor. Ne olur?\n\n```\noyun başlayınca:\n  geri sayımı 45 saniyeden başlat\nsüre bitince:\n  oyunu bitir: kaybettin\nbir Oyuncu bir Yiyecek'e çarpınca:\n  skoru 1 değiştir\n  eğer skor ≥ 8 ise:\n    oyunu bitir: kazandın\n```",
              "options": [
                "Oyun kazanılır ve hemen biter",
                "Oyun 45. saniyeye kadar sürer, sonra kaybedilir",
                "Oyun kaybedilir",
                "Oyun hata verir"
              ],
              "answer": 0,
              "explanation": "Skor 8'e ulaşınca \"eğer\" cevap evet verir ve \"oyunu bitir: kazandın\" çalışır. Oyun bitince süre bitince olayı artık çalışmaz.",
              "skills": [
                "game-flow",
                "game-conditions",
                "game-score"
              ]
            },
            {
              "id": "m11h2d10-q3",
              "kind": "find-bug",
              "prompt": "Süre ekranda hiç görünmüyor ve oyun süre dolunca hiç kaybedilmiyor. Hata hangisi?\n\n```\noyun başlayınca:\n  skoru 0 yap\n  canı 5 yap\nsüre bitince:\n  geri sayımı 45 saniyeden başlat\n  oyunu bitir: kaybettin\n```",
              "options": [
                "Can 5 olamaz",
                "Geri sayımı başlatan blok \"süre bitince\" içinde; \"oyun başlayınca\" içine konmalı",
                "Skor sıfırlanmamış",
                "\"oyunu bitir\" yanlış yerde"
              ],
              "answer": 1,
              "explanation": "\"süre bitince\" yalnız geri sayım başladıysa çalışır. Sayım hiç başlamadığı için süre de görünmez. Başlatma bloğu oyun başında çalışan olaya konur.",
              "skills": [
                "game-flow",
                "game-debug"
              ]
            },
            {
              "id": "m11h2d10-q4",
              "kind": "mcq",
              "prompt": "Meyve avında \"risk\" nedir?",
              "options": [
                "8 meyve toplamak",
                "Bombalar ve geri sayım",
                "Zafer melodisi",
                "Sepetin sağa sola gitmesi"
              ],
              "answer": 1,
              "explanation": "Amaç 8 meyve toplamaktır. Risk, oyuncunun kaybedebileceği şeylerdir: bombayla can, geri sayımla zaman. Melodi geri bildirimdir.",
              "skills": [
                "game-design"
              ]
            },
            {
              "id": "m11h2d10-q5",
              "kind": "mcq",
              "prompt": "Kazanma kontrolünü (\"eğer skor ≥ 8 ise\") hangi olayın içine koymak en doğrudur?",
              "options": [
                "Bomba çarpışması olayına",
                "Meyve çarpışması olayına, çünkü skor orada değişir",
                "Can bitince olayına",
                "Hiçbir olaya, çalışma alanında tek başına"
              ],
              "answer": 1,
              "explanation": "Skor meyve yakalanınca değişir; kontrol de tam o anda yapılmalıdır. Bomba çarpışmasında skor değişmez; tek başına duran blok hiçbir olay tarafından çalıştırılmaz.",
              "skills": [
                "game-conditions",
                "game-flow",
                "game-collision"
              ]
            }
          ],
          "contentEn": {
            "title": "Project: Fruit hunt",
            "problem": "You will bring together all of this week's pieces and make a complete game: collisions, score, lives, randomly falling objects and a race against time as well. A good game has a goal, a risk and an ending. In the fruit hunt, the goal is to collect 8 fruits, the risk is the bombs, and the ending is winning or losing.",
            "contentMd": "Half of the project is ready: the basket cat walks left and right, fruits and bombs fall, and the score goes up when you catch a fruit. What is missing: the bomb penalty, the countdown, and the rules for winning and losing.\n\n### The rules of the game\n- At the start you have 5 lives and 45 seconds.\n- If you catch a fruit, the score goes up by 1. When the score is 8, you win.\n- If you touch a bomb, you lose 1 life and the screen shakes.\n- If you run out of lives or the time runs out, you lose.\n\n### Look first\n1. Press the ▶ button to run the game. What works, and what is missing?\n2. Read the blocks: how many event blocks are there? When does each one run?\n\n### Bomb penalty\n1. Put in the `when a [Player] sprite hits a [Enemy] sprite` event.\n2. Inside it, attach the `change lives by [-1]`, `shake screen for [250] ms`, `play melody [boom]` and `delete sprite [other sprite]` blocks, in order.\n\n### Countdown\n1. Inside the `when game starts` block, add the `start countdown from [30] seconds` block from the **Game** category. Change the number to 45.\n2. Bring the `when time runs out` event block. Attach the `show [Time is up!] on screen for [2] seconds`, `play melody [lose]` and `end game: [you lose]` blocks inside it.\n\n### Winning\n1. At the very bottom of the fruit event (`when a [Player] sprite hits a [Food] sprite`), add an `if ... do` block.\n2. As the condition, use the comparison block in the **Logic** category: the `score` block **≥** 8.\n3. Inside it, put the `show [You win!] on screen for [2] seconds`, `play melody [victory]` and `end game: [you win]` blocks.\n\n### Losing\nBring the `when lives run out` event block. Inside it, put the `show [You are out of lives!] on screen for [2] seconds`, `play melody [lose]` and `end game: [you lose]` blocks.\n\n### Run it and try it\n1. Press the ↺ button and play the game from start to finish. Win once, and lose once on purpose.\n2. Are all seven items in the Goals panel green?\n\nExpected result: The score, the hearts and the time left are shown at the top. If you collect 8 fruits, you win. If you run out of lives or the time runs out, you lose.\n\n### How does it work?\n- The parts of the game are split into **events** that are independent of each other: setting up the stage, dropping fruit, dropping bombs, the collisions, when lives run out, when time runs out. Each event only deals with its own job.\n- The game should end with a single ending. The moment a winning or losing block runs, the game ends and the other events stop.\n- The `time left (s)` block gives how much time is left in the countdown. To add it to the winning message, you can use it with the `create text with` block.\n\n### Add your own touch\nTry at least two of the following:\n1. Make the winning score 12 and raise the time to 60 seconds. Is the game balanced?\n2. Make the fruit fall faster. Which speed is fun, and which is impossible?\n3. When the cat catches a fruit, show the message `show [Yummy!] on screen for [1] seconds`.\n4. Change the background colour or choose another player picture.\n\n### Common mistakes\n- If you write the winning condition with **=** and the score jumps over 8, you cannot win. Using **≥** is safer.\n- If you do not put the countdown block inside any event, it does not run. Put it inside `when game starts`.\n- Do not forget to end the game in the `when lives run out` and `when time runs out` blocks. Once you write these blocks, whether the game ends is up to you.\n- Write two separate collision events for fruit and bombs. If you choose the wrong kind, the event does not run for the sprite you expect.",
            "question": "What are the game's goal, risk and ending? Where did your friend find it hardest while playing? If you had to change one thing to make the game more fun, what would you change?",
            "explainerMd": "### What you will learn in this lesson\n- How to design a complete game as a **goal, a risk and an ending**\n- How to split the game into independent events\n- How to use the **countdown** and the `when time runs out` event\n- How to write the winning and losing rules without them clashing\n\n### What you should know first\nCollisions from lesson 6, the score and `if score ≥ ...` from lesson 7, every ... ms and randomly falling objects from lesson 8, lives and `when lives run out` from lesson 9. This lesson brings these pieces together more than it adds a new idea.\n\n### The three parts of a good game\n| Part | In the fruit hunt |\n|---|---|\n| Goal | Collecting 8 fruits |\n| Risk | Bombs (5 lives) and time (45 seconds) |\n| Ending | Winning or losing |\n\nIf one of the three is missing, the game is boring. Without a goal, you do not know what to do. Without a risk, there is no excitement. Without an ending, the game never finishes.\n\n### Splitting into events\nA big job is split into small events that each do one job:\n\n| Event | Its job |\n|---|---|\n| `when game starts` | Set up the stage, make the score 0 and the lives 5, start the countdown from 45 seconds |\n| `every ... ms` (two of them) | Drop fruit; drop bombs |\n| when a Player hits a Food | Raise the score, do the winning check |\n| when a Player hits an Enemy | Lower the lives, shake, delete |\n| `when lives run out` | You lose |\n| `when time runs out` | You lose |\n\nIf something breaks, you only look at the event involved.\n\n### Countdown\nThe `start countdown from [45] seconds` block starts the time, and the time left is shown on the screen. When the time reaches 0, the `when time runs out` event runs. If you do not write this event, the game says \"TIME IS UP\" by itself; if you write it, ending the game is up to you. To run the block you must put it inside an event; `when game starts` is the best choice.\n\n### The one-ending rule\nThink about whether the winning and losing blocks could run at the same time: you get the 8th fruit and the time runs out in the same frame. The game applies the first `end game` block; the later ones are ignored. So set up the rules clearly, in a way that they will not clash.\n\n### Work out the balance\nTo collect 8 fruits in 45 seconds, you need to catch a fruit every 45 / 8 = 5.6 seconds on average. If a fruit falls every 0.8 seconds, there are enough chances; but the bombs reduce the chances. Change the numbers and try: time, lives, target score, speed.\n\n### Summary\nA good game has a goal, a risk and an ending. Splitting the game into events that each do one job makes hunting for bugs easier. The countdown and `when time runs out` add time pressure. The game ends with the first `end game` block; set up the rules with that in mind and balance them by playing with the numbers.",
            "concepts": [
              {
                "term": "Goal, risk, ending",
                "definition": "The three parts of a good game: what is to be done, what is at stake and how it will end.",
                "example": "In the fruit hunt, the goal is 8 fruits, the risk is bombs and time, and the ending is winning or losing.",
                "pitfall": "Forgetting the risk; if it is impossible to lose, the game has no excitement."
              },
              {
                "term": "Splitting into events",
                "definition": "Dividing the game into small events that each do one job: setup, dropping, collisions, endings.",
                "example": "The bomb penalty is only in the Enemy collision; the winning check is only in the fruit collision.",
                "pitfall": "Piling everything into one event; when there is a bug, it is hard to find where it is."
              },
              {
                "term": "Countdown and when time runs out",
                "definition": "\"start countdown from [n] seconds\" starts the time; when the time reaches 0, the \"when time runs out\" event runs.",
                "example": "When the game starts, start the countdown from 45 seconds.",
                "pitfall": "Leaving the countdown block outside an event; it never runs."
              },
              {
                "term": "Winning condition",
                "definition": "Inside the fruit collision you write \"if score ≥ target, end game: you win\".",
                "example": "If score ≥ 8, write \"You win!\", play the victory melody and end the game.",
                "pitfall": "Using =; if the score jumps over the target, the game cannot be won."
              },
              {
                "term": "Balance",
                "definition": "The game being neither too easy nor impossible; the time, lives, target and speed numbers fitting together.",
                "example": "For 8 fruits in 45 seconds, you need to catch a fruit every 5.6 seconds on average.",
                "pitfall": "Setting the numbers without ever trying them; the game either ends at once or never ends."
              }
            ],
            "quiz": [
              {
                "id": "m11h2d10-q1",
                "kind": "numeric",
                "prompt": "In the game you need to collect 8 fruits. You catch a fruit every 4 seconds on average. How many seconds do 8 fruits take? (The time is 45 seconds.)",
                "answer": 32,
                "tolerance": 0,
                "unit": "s",
                "explanation": "8 × 4 = 32 seconds. That is less than 45 seconds, so at this rate you win before the time runs out (with 13 seconds to spare).",
                "skills": [
                  "game-design",
                  "game-timing"
                ]
              },
              {
                "id": "m11h2d10-q2",
                "kind": "predict-output",
                "prompt": "The player catches the 8th fruit at the 30th second. What happens?\n\n```\nwhen game starts:\n  start countdown from 45 seconds\nwhen time runs out:\n  end game: you lose\nwhen a Player hits a Food:\n  change score by 1\n  if score ≥ 8:\n    end game: you win\n```",
                "options": [
                  "The game is won and ends at once",
                  "The game lasts until the 45th second, then it is lost",
                  "The game is lost",
                  "The game gives an error"
                ],
                "answer": 0,
                "explanation": "When the score reaches 8, \"if\" answers yes and \"end game: you win\" runs. Once the game has ended, the when time runs out event no longer runs.",
                "skills": [
                  "game-flow",
                  "game-conditions",
                  "game-score"
                ]
              },
              {
                "id": "m11h2d10-q3",
                "kind": "find-bug",
                "prompt": "The time never appears on the screen and the game is never lost when the time runs out. Which is the bug?\n\n```\nwhen game starts:\n  set score to 0\n  set lives to 5\nwhen time runs out:\n  start countdown from 45 seconds\n  end game: you lose\n```",
                "options": [
                  "The lives cannot be 5",
                  "The block that starts the countdown is inside \"when time runs out\"; it should be put inside \"when game starts\"",
                  "The score has not been reset",
                  "\"end game\" is in the wrong place"
                ],
                "answer": 1,
                "explanation": "\"when time runs out\" only runs if the countdown has started. The countdown never starts, so the time does not appear either. The start block goes in the event that runs at the start of the game.",
                "skills": [
                  "game-flow",
                  "game-debug"
                ]
              },
              {
                "id": "m11h2d10-q4",
                "kind": "mcq",
                "prompt": "In the fruit hunt, what is the \"risk\"?",
                "options": [
                  "Collecting 8 fruits",
                  "The bombs and the countdown",
                  "The victory melody",
                  "The basket going left and right"
                ],
                "answer": 1,
                "explanation": "The goal is collecting 8 fruits. The risk is the things the player can lose: lives with the bombs, time with the countdown. The melody is feedback.",
                "skills": [
                  "game-design"
                ]
              },
              {
                "id": "m11h2d10-q5",
                "kind": "mcq",
                "prompt": "Inside which event is it best to put the winning check (\"if score ≥ 8\")?",
                "options": [
                  "In the bomb collision event",
                  "In the fruit collision event, because that is where the score changes",
                  "In the when lives run out event",
                  "In no event, on its own in the work area"
                ],
                "answer": 1,
                "explanation": "The score changes when a fruit is caught, and the check should be made at exactly that moment. The score does not change in the bomb collision; a block standing on its own is not run by any event.",
                "skills": [
                  "game-conditions",
                  "game-flow",
                  "game-collision"
                ]
              }
            ]
          }
        }
      ]
    },
    {
      "title": "Harita ve dünya",
      "project": "Hazine adası",
      "guideMd": "### Hafta hedefleri\nBu haftanın sonunda öğrenci:\n1. Haritayı 16 x 16 pikselik karoların ızgarası olarak anlatabilir; sütun ve satırı 0'dan sayarak bir karoyu gösterebilir.\n2. Karonun \"duvar\" kutusunun sprite'ı durdurduğunu bilir ve bir odayı ya da labirenti duvarlarla kurabilir.\n3. `bir [Oyuncu] sprite'ı [Karo] karosuna dokununca` olayını kurar; olayın ilk değmede bir kez çalıştığını bilir.\n4. Olay karosunun sütun ve satırıyla dokunulan karoyu boşaltır; sayaçla kazanma koşulunu doğru sırayla kurar.\n5. Kamerayla büyük bir dünyada gezer; karoları sprite'a çevirir; anahtar, elmas, lav ve sandıklı Hazine adası oyununu kurar.\n\n### Haftanın planı\nHafta beş derstir; her ders yaklaşık 22-35 dakikadır. Aşağıdaki plan günde bir ders içindir.\n\n| Gün | Ders | Süre | Ne yapılır |\n|---|---|---|---|\n| 1 | İlk odan: duvarlı bir harita | ~22 dk | Anlatımı oku, odayı taş duvarla çevir, kediyi yürüt, mini testi çöz. |\n| 2 | Labirentten çık | ~22 dk | Kapı karosuna dokununca kazanma olayını kur, labirenti değiştirip kendin dene. |\n| 3 | Mağarada elmas avı | ~25 dk | Olay karosuyla elması boşalt, sayaçla kazan, lavı kur. |\n| 4 | Büyük bir dünya, kayan kamera | ~25 dk | Kamerayı bağla, elma karolarını sprite'a çevir, kameranın sınırlarını deney. |\n| 5 | Proje: Hazine adası | ~35 dk | Kural tablosunu yaz, dört olayı kur, haritayı kendi fikrinle değiştir. |\n\n### Ön koşul kontrolü\nHafta 1 ve Hafta 2 (Modül 11) tamamlanmış olmalı. Başlamadan önce şunları kontrol et:\n- `oyun başlayınca` bloğu, sprite oluşturma ve `oyuncu tuşlarıyla hareket etsin` bloğunu kullanabiliyor mu?\n- Sprite'lar arası çarpışma olayını, skor ve can bloklarını hatırlıyor mu?\n- Çarpma, bölme ve çıkarma ile küçük hesaplar (7 x 16, 480 - 160) yapabiliyor mu?\n\n### Kavram haritası\n- **Harita:** karo (16 x 16) → ızgara (sütun, satır; 0'dan) → karo takımı → duvar kutusu\n- **Olay:** karoya dokununca → ilk değmede bir kez → olay karosunun sütunu ve satırı → karoyu boşalt\n- **Kural:** sayaç (karo sayısı) → kazanma koşulu → lav (can ve başa dönüş) → oyunu bitir\n- **Dünya:** harita (büyük) ve ekran (160 x 120) → kamera takibi → karoyu sprite'a çevirme\n- **Proje:** kural tablosu → anahtar-kapı → skorlu mesaj → kendi harita tasarımı\n\n### Sık yapılan hatalar\n- **Sütun ve satırı 1'den saymak.** İlk sütun ve ilk satır 0'dır.\n- **Sütun ile satırı karıştırmak.** `sütun 10 satır 5` ile `sütun 5 satır 10` farklıdır; ikincisi 10 satırlı haritanın dışındadır.\n- **Duvar kutusunu işaretlememek.** Karo duvar gibi görünür ama sprite içinden geçer.\n- **`haritayı yükle` bloğunu `oyun başlayınca` dışında bırakmak.** Harita hiç gelmez.\n- **Karoyu boşaltan bloğa sabit sayı yazmak.** Hep aynı karo silinir; olay karosunu kullan.\n- **Kazanma kontrolünü karo silinmeden önce yapmak.** Sayaç bir fazla görünür.\n- **`oyunu bitir` bloğunu unutmak.** Mesaj çıkar ama oyun sürer.\n- **Karoları sprite'a çevirmeyi ya da kamerayı unutmak.** Elma toplanmaz; kedi ekrandan çıkar.\n- **Olayın beklemekle tekrar çalışacağını sanmak.** Karo olayı ilk değmede yalnız bir kez çalışır.\n\n### Hafta sonu tekrarı\n1. Her dersin kavram kartlarına bir kez daha bak ve \"sık yapılan yanlış\" satırlarını yüksek sesle oku.\n2. Mini testlerde yanlış yaptığın soruların açıklamalarını yeniden oku, sonra soruyu yeniden çöz.\n3. Boş bir haritada 12 x 8 bir oda çiz; çıkışı olan bir labirente çevir; kapı karosuna dokununca kazanılsın.\n4. Kendi haritanın genişliğini ve yüksekliğini piksel olarak hesapla; ekrana sığıp sığmadığını söyle.\n5. Kendi cümlelerinle şu soruyu cevapla: \"Kamera olmasa büyük bir harita ne olurdu?\"\n\nHafta sonu testi olarak beş dersin mini testleri yeterlidir; her derste 5 soru, toplam 25 soru. Hedef: her dersten en az 4 doğru. Eksik kalan dersin anlatımına dön.\n\n### Proje değerlendirme ölçütü (Hazine adası)\n| Ölçüt | Gelişmeli | Yeterli | İleri |\n|---|---|---|---|\n| Plan | Kural tablosu yok | Dört karo için ne olacağı tabloda yazılı | Tablo, bloklarla birebir uyuyor ve açıklanmış |\n| Anahtar ve kapı | Anahtar kayboluyor ama kapı açılmıyor | Anahtar alınınca kapı (sütun 10, satır 5) açılıyor | Kapı yerine başka bir engel ya da ikinci bir anahtar-kapı eklenmiş |\n| Elmas, lav, sandık | Bir ya da daha fazla kural çalışmıyor | Elmas skor veriyor, lav can götürüp başa gönderiyor, sandık oyunu kazandırıyor | Mesajda skor yazıyor; lav ve elmas değerleri düşünerek ayarlanmış |\n| Harita | Haritayı değiştirmemiş ya da yol kapanmış | Haritayı değiştirmiş ve sandığa yol açık | Yeni karo türü ve yeni kuralla genişletmiş |\n| Anlatım | Ne yaptığını anlatamıyor | Dört olayı adım adım anlatıyor | Hata yapıp nasıl bulduğunu anlatıyor |\n\n### Veli ve öğretmen notu\n- **Amaç.** Bu hafta çocuk bir oyunun kurallarını haritanın karolarına bağlamayı öğrenir. \"Hangi karoya dokununca ne olsun?\" sorusu, bir oyun tasarımcısının temel sorusudur.\n- **Nasıl destek olunur?** Takıldığında cevabı söylemek yerine şunları sor: \"Hangi karoya dokununca olay çalışmalı?\", \"Bu karo duvar mı değil mi?\", \"Sütun mu önce, satır mı?\", \"Kazanma kontrolü karo silindikten önce mi sonra mı?\"\n- **Hata yapmak güvenlidir.** Her şey sanaldır; ↺ düğmesi oyunu başa alır.\n- **Süre.** Dersleri aralıklı çalışmak kalıcılığı artırır. Proje dersinde çocuğa kendi haritasını çizmesi için ek zaman tanı.\n- **İlerleme.** Mini test sonuçları \"İlerlemem\" sayfasında beceri bazında görünür (taslak/pilot özellik; yalnız onay verildiyse kaydedilir).",
      "guideMdEn": "### Week goals\nBy the end of this week the learner:\n1. Can describe a map as a grid of 16 x 16 pixel tiles; can point to a tile by counting the column and row from 0.\n2. Knows that a tile's \"wall\" box stops a sprite, and can build a room or a maze with walls.\n3. Sets up the `when a [Player] sprite touches tile [...]` event; knows that the event runs once, at the first touch.\n4. Clears the touched tile with the event tile's column and row; sets up a winning condition with a counter in the right order.\n5. Explores a big world with the camera; turns tiles into sprites; builds the Treasure island game with a key, diamonds, lava and a chest.\n\n### Plan for the week\nThe week has five lessons; each lesson is about 22-35 minutes. The plan below is for one lesson a day.\n\n| Day | Lesson | Time | What you do |\n|---|---|---|---|\n| 1 | Your first room: a map with walls | ~22 min | Read the explainer, surround the room with stone wall, walk the cat, do the mini quiz. |\n| 2 | Get out of the maze | ~22 min | Set up the winning event for touching the door tile, change the maze and try it yourself. |\n| 3 | Diamond hunt in the cave | ~25 min | Clear the diamond with the event tile, win with a counter, set up the lava. |\n| 4 | A big world, a scrolling camera | ~25 min | Connect the camera, turn the apple tiles into sprites, experiment with the camera's limits. |\n| 5 | Project: Treasure island | ~35 min | Write the rule table, set up the four events, change the map with your own idea. |\n\n### Prerequisite check\nWeek 1 and week 2 (module 11) should be finished. Before you start, check the following:\n- Can they use the `when game starts` block, making a sprite and the `moves with player keys` block?\n- Do they remember the collision event between sprites, and the score and lives blocks?\n- Can they do small calculations with multiplication, division and subtraction (7 x 16, 480 - 160)?\n\n### Concept map\n- **Map:** tile (16 x 16) → grid (column, row; from 0) → tile set → wall box\n- **Event:** when touching a tile → once, at the first touch → event tile column and row → clear tile\n- **Rule:** counter (number of tiles) → winning condition → lava (lives and back to the start) → end game\n- **World:** map (big) and screen (160 x 120) → camera following → turning tiles into sprites\n- **Project:** rule table → key and door → message with the score → your own map design\n\n### Common mistakes\n- **Counting columns and rows from 1.** The first column and the first row are 0.\n- **Mixing up the column and the row.** `column 10 row 5` and `column 5 row 10` are different; the second is outside a map with 10 rows.\n- **Not ticking the wall box.** The tile looks like a wall but the sprite goes straight through it.\n- **Leaving the `load map` block outside `when game starts`.** The map never comes in.\n- **Writing fixed numbers in the block that clears the tile.** The same tile is always deleted; use the event tile.\n- **Doing the winning check before the tile is deleted.** The counter shows one too many.\n- **Forgetting the `end game` block.** The message appears but the game goes on.\n- **Forgetting to turn tiles into sprites, or forgetting the camera.** The apple is not collected; the cat leaves the screen.\n- **Thinking the event will run again if you wait.** A tile event runs only once, at the first touch.\n\n### End-of-week review\n1. Look at each lesson's concept cards once more and read the \"common mistake\" lines out loud.\n2. Read again the explanations of the questions you got wrong in the mini quizzes, then do the question again.\n3. Draw a 12 x 8 room on an empty map; turn it into a maze with an exit; make the game won when the door tile is touched.\n4. Work out the width and height of your own map in pixels; say whether it fits on the screen.\n5. Answer this question in your own words: \"Without a camera, what would happen to a big map?\"\n\nThe five lessons' mini quizzes are enough as an end-of-week test; 5 questions in each lesson, 25 questions in total. Target: at least 4 right in each lesson. Go back to the explainer of any lesson that falls short.\n\n### Project assessment rubric (Treasure island)\n| Criterion | Developing | Secure | Advanced |\n|---|---|---|---|\n| Plan | There is no rule table | What will happen for the four tiles is written in the table | The table matches the blocks exactly and is explained |\n| Key and door | The key disappears but the door does not open | When the key is taken, the door (column 10, row 5) opens | Another obstacle instead of the door, or a second key and door, has been added |\n| Diamond, lava, chest | One or more rules do not work | The diamond gives points, the lava takes a life and sends you back to the start, the chest wins the game | The message shows the score; the lava and diamond values have been set with thought |\n| Map | Has not changed the map, or the path is closed | Has changed the map and the path to the chest is open | Has extended it with a new kind of tile and a new rule |\n| Explanation | Cannot explain what they did | Explains the four events step by step | Explains a mistake they made and how they found it |\n\n### Note for parents and teachers\n- **Aim.** This week the child learns to link a game's rules to the tiles of the map. \"What should happen when you touch which tile?\" is a game designer's basic question.\n- **How to help.** When they get stuck, instead of giving the answer, ask these: \"Which tile should the event run on when it is touched?\", \"Is this tile a wall or not?\", \"Does the column come first, or the row?\", \"Is the winning check before or after the tile is deleted?\"\n- **Making mistakes is safe.** Everything is virtual; the ↺ button takes the game back to the start.\n- **Time.** Spacing the lessons out helps learning stick. In the project lesson, give the child extra time to draw their own map.\n- **Progress.** Mini quiz results appear skill by skill on the \"My progress\" page (a draft/pilot feature; recorded only if consent has been given).",
      "lessons": [
        {
          "title": "İlk odan: duvarlı bir harita",
          "durationMin": 22,
          "problem": "Şimdiye kadar oyunlarımız boş bir ekranda geçti. Gerçek oyunlarda ise odalar, labirentler, koridorlar vardır. Bir sprite duvardan neden geçemez? Ve bir odayı bloklarla tek tek koymak yerine nasıl çizerek yapabiliriz?",
          "contentMd": "Bu derste ilk haritanı çizeceksin. Harita, küçük kare resimlerin (karoların) ızgara hâlinde dizilmesidir. Karolar duvar da olabilir, sadece süs de.\n\n### Harita ve karo\n- **Karo:** 16 x 16 piksellik bir kare resim.\n- **Harita:** Karolardan oluşan ızgara. Bu derste \"oda\" haritası 10 sütun ve 7 satırdır. Yani 160 x 112 piksel eder.\n- **Duvar:** Duvar işaretli karoya sprite giremez. Karo takımında bunun için bir \"duvar\" kutusu vardır.\n- Sütun ve satırlar **0'dan** sayılır. Sol üst karo sütun 0, satır 0'dır.\n\n### Önce incele\n1. Etkinliği aç ve ▶ düğmesine bas. Kedi odanın ortasında duruyor.\n2. **Harita** sekmesine geç. \"oda\" adlı boş bir harita ve altında bir **Karo takımı** göreceksin. Takımda üç karo var: taş duvar, çimen ve su.\n3. Taş duvar ve su karolarının altındaki **duvar** kutusu işaretli. Çimen işaretli değil. Yani çimenin üstünden yürünür, taş duvar ve sudan geçilmez.\n4. Haritadaki kırmızı kesikli çerçeve, oyunun ilk ekranını gösterir.\n\n### Haritayı çiz\n1. Karo takımındaki **taş duvar** karosuna tıkla. Seçili karo vurgulanır.\n2. Araçlardan **Boya**'yı seç.\n3. Haritanın en üst satırını soldan sağa tıklayıp sürükleyerek boya. Sonra en alt satırı, sol sütunu ve sağ sütunu boya. Çevresi tamamen duvarla çevrili bir oda olmalı.\n4. İstersen **Çimen** karosunu seçip **Doldur** aracıyla odanın içini yeşile boya. Çimen yalnız süslemedir.\n5. Yanlış boyadıysan **Sil** aracını kullan.\n\n### Kediyi yürüt\n1. **Bloklar** sekmesine geç. Çalışma alanında `oyun başlayınca` bloğunun içinde `haritayı yükle: [oda]`, bir kedi oluşturma ve kedinin yerleştirilmesi var.\n2. **Denetleyici** kategorisinden `[kedi] oyuncu tuşlarıyla [dört yöne] hareket etsin, hız [60]` bloğunu en alta ekle (`bu sprite` yerine `kedi`).\n3. ▶ düğmesine bas ve kediyi dört yöne yürüt. Duvara çarpınca durmalı.\n\nBeklenen sonuç: Kedi odanın içinde yürür ama duvarlardan geçemez. Hedeflerin dördü de yeşil.\n\n### Nasıl çalışıyor?\n- `haritayı yükle: [oda]` bloğu Harita sekmesinde çizdiğin haritayı oyuna koyar. Bu blok olmazsa harita görünmez.\n- `[kedi] sprite'ını sütun [5] satır [3] karosuna koy` bloğu kediyi karonun tam ortasına yerleştirir. Haritada koordinat vermek, piksel saymaktan kolaydır.\n- Duvar karoları sprite'ı durdurur. Bunun için ayrıca blok yazmana gerek yok. Karoyu duvar yapman yeter.\n- Bir duvarda tek bir boşluk kalırsa kedi oradan çıkar. Çevre tam kapalı olmalı.\n\n### Dene\n1. Odanın ortasına birkaç taş duvar karosu çiz ve kedinin etrafından dolanmasını izle.\n2. Haritanın bir köşesine **Su** karosunu boya. Kedi suya girebiliyor mu?\n3. Çimen karosunun **duvar** kutusunu işaretle. Kedi çimene girebiliyor mu?\n4. **Sütun** ve **Satır** kutularını değiştirerek haritayı büyüt. Yeni karoları boya.\n\n### Sık yapılan hatalar\n- Karoyu boyadın ama **duvar** kutusu işaretli değilse kedi içinden geçer.\n- `haritayı yükle: [oda]` bloğu `oyun başlayınca` bloğunun içinde olmalı. Dışında kalırsa harita gelmez.\n- Haritaya eklediğin karoyu silmek için **Sil** aracını kullan. Karo takımından karo çıkarırsan haritadaki bütün örnekleri de silinir.\n- Haritanın adı bir yerde değişirse blokta da aynı ad seçilmelidir. Bu derste \"oda\" adını değiştirme.",
          "question": "Bir oyunda neden çoğu duvarı tek tek blokla değil de bir harita çizerek yaparız? Gerçek hayattaki bir odayı (kendi odan ya da sınıfın) bir ızgaraya dökseydin ne kadar büyük olurdu?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Haritanın küçük kare resimlerden (karolardan) oluşan bir ızgara olduğunu\n- Sütun ve satırların 0'dan başlayarak sayıldığını\n- Bir karonun \"duvar\" olmasının ne demek olduğunu\n- Haritayı çizmenin, oyuna yüklemenin ve sprite'ı karoya yerleştirmenin farkını\n\n### Önceden bilmen gerekenler\nModül 11 Hafta 1 ve Hafta 2'deki dersler: sahne, sprite, ok tuşlarıyla hareket ve blokları `oyun başlayınca` altına dizmek. Yeni bir kavram gerekmez.\n\n### Harita bir ızgaradır\nŞimdiye kadar sprite'ları boş bir sahnede gezdirdin. Gerçek oyunlarda odalar, koridorlar ve labirentler vardır. Bunları tek tek çizmek yerine **karo** denen küçük kare resimleri yan yana dizeriz. Bir karo 16 x 16 pikseldir. Karoların dizildiği ızgaraya **harita** denir.\n\nBu dersteki oda 10 sütun ve 7 satırdır:\n\n```\ngenişlik = 10 karo x 16 piksel = 160 piksel\nyükseklik = 7 karo x 16 piksel = 112 piksel\n```\n\nEkran 160 piksel genişliğinde olduğundan oda ekrana tam sığar.\n\n### Sütun ve satır sayısı sıfırdan başlar\nBir karoyu tarif etmek için iki sayı yeter: **sütun** (soldan sağa) ve **satır** (yukarıdan aşağı). Sol üst köşe sütun 0, satır 0'dır. Bu yüzden 10 sütunlu bir haritanın son sütunu 9'dur.\n\n```\n        sütun 0   1   2   3 ...\nsatır 0     [ ] [ ] [ ] [ ]\nsatır 1     [ ] [ ] [ ] [ ]\nsatır 2     [ ] [ ] [ ] [ ]\n```\n\nBir karonun merkezi, sütun x 16 + 8 ve satır x 16 + 8 pikseldedir. Sütun 5, satır 3 karosunun merkezi (88, 56) noktasıdır.\n\n### Karo takımı ve duvar\nHaritayı boyamak için bir **karo takımı** kullanırsın. Takımdaki her karonun bir **duvar** kutusu vardır. Kutu işaretliyse sprite o karoya giremez; işaretli değilse üstünden yürür.\n\n| Karo | Duvar kutusu | Sprite ne yapar? |\n|---|---|---|\n| Taş duvar | işaretli | Durur |\n| Su | işaretli | Durur |\n| Çimen | işaretsiz | Üstünden yürür |\n\nKaroyu doğru resimle boyamak yetmez; kutuyu da doğru ayarlamak gerekir. Duvarın çalışması için ayrıca blok yazmazsın.\n\n### Harita çizmek ile yüklemek farklıdır\nHarita sekmesinde çizdiğin harita oyuna kendiliğinden girmez. `oyun başlayınca` bloğunun içinde `haritayı yükle` bloğu çalışmalıdır. Sprite'ı `sütun satır karosuna koy` bloğuyla yerleştirmek de piksel saymaktan kolaydır. Çevre duvarında tek bir boşluk kalırsa sprite oradan çıkar; oda tam kapalı olmalıdır.\n\n### Özet\nHarita, 16 x 16 pikselik karoların ızgarasıdır ve sütun ile satırlar 0'dan sayılır. Duvar kutusu işaretli karolar sprite'ı durdurur. Haritayı Harita sekmesinde çizersin, ama oyunda görünmesi için `haritayı yükle` bloğunu çalıştırman gerekir.",
          "concepts": [
            {
              "term": "Karo",
              "definition": "Haritayı oluşturan 16 x 16 pikselik küçük kare resim.",
              "example": "Taş duvar, çimen ve su üç ayrı karodur; harita bunları yan yana dizerek odayı kurar.",
              "pitfall": "Karoyu sprite ile karıştırmak: karo haritanın bir hücresidir, kendi kendine hareket etmez."
            },
            {
              "term": "Harita ve ızgara",
              "definition": "Karoların sütun ve satırlar hâlinde dizildiği ızgara; boyutu karo sayısıyla söylenir.",
              "example": "10 sütun ve 7 satırlık oda 160 x 112 piksel eder.",
              "pitfall": "Haritayı Harita sekmesinde çizip oyuna yüklemeyi unutmak: `haritayı yükle` bloğu çalışmazsa harita görünmez."
            },
            {
              "term": "Sütun ve satır (0'dan sayma)",
              "definition": "Bir karonun adresi: soldan sağa sütun, yukarıdan aşağı satır. Sol üst karo sütun 0, satır 0'dır.",
              "example": "Sütun 5, satır 3 karosunun merkezi (5 x 16 + 8, 3 x 16 + 8) = (88, 56) pikseldedir.",
              "pitfall": "1'den saymak: 10 sütunlu haritanın son sütunu 10 değil 9'dur."
            },
            {
              "term": "Duvar kutusu",
              "definition": "Karo takımında her karonun yanındaki kutu; işaretliyse sprite o karoya giremez.",
              "example": "Taş duvar ve su işaretlidir, çimen işaretsizdir; kedi çimende yürür ama taşı geçemez.",
              "pitfall": "Karoyu duvar gibi boyayıp kutuyu işaretlememek: kedi içinden geçer."
            },
            {
              "term": "Karo takımı",
              "definition": "Haritada kullanabileceğin karoların listesi ve her birinin özellikleri.",
              "example": "Bu derste takımda taş duvar, çimen ve su vardır.",
              "pitfall": "Karo takımından bir karoyu çıkarmak: haritadaki bütün örnekleri de silinir."
            }
          ],
          "quiz": [
            {
              "id": "m11h3d11-q1",
              "kind": "numeric",
              "prompt": "Oda haritası 10 sütun ve 7 satırdır, her karo 16 piksel. Harita kaç piksel yüksekliğindedir?",
              "answer": 112,
              "unit": "piksel",
              "explanation": "Yükseklik satır sayısı ile karo boyunun çarpımıdır: 7 x 16 = 112 piksel. 160 değeri genişliktir (10 x 16); satır ile sütunu karıştırmak en sık yapılan hatadır.",
              "skills": [
                "oyun-harita-izgara"
              ]
            },
            {
              "id": "m11h3d11-q2",
              "kind": "mcq",
              "prompt": "Taş duvar karosunu boyadın ama kedi duvarın içinden geçiyor. En olası neden hangisidir?",
              "options": [
                "Kedinin hızı çok yüksektir",
                "Harita 10 sütundan büyüktür",
                "Karo takımında taş duvar karosunun duvar kutusu işaretli değildir",
                "Bloklarda `oyuncu tuşlarıyla hareket` bloğu eksiktir"
              ],
              "answer": 2,
              "explanation": "Sprite'ı durduran şey karonun resmi değil, duvar kutusudur. Kutu işaretli değilse karo yalnız süstür. Hız ve harita boyutu duvarın çalışmasını etkilemez; hareket bloğu eksik olsaydı kedi hiç yürümezdi.",
              "skills": [
                "oyun-karo-duvar"
              ]
            },
            {
              "id": "m11h3d11-q3",
              "kind": "numeric",
              "prompt": "Kediyi `sütun 5 satır 3 karosuna koy` bloğuyla yerleştirdin. Kedinin merkezi kaç piksel x konumunda olur? (Karo 16 piksel; merkez karonun ortasıdır.)",
              "answer": 88,
              "unit": "piksel",
              "explanation": "Sütun 5 karosu 5 x 16 = 80 pikselde başlar. Merkez, karonun yarısı kadar (8 piksel) sağdadır: 80 + 8 = 88. Sütunu 16 ile çarpıp ortasını eklemeyi unutursan 80 bulursun.",
              "skills": [
                "oyun-harita-izgara"
              ]
            },
            {
              "id": "m11h3d11-q4",
              "kind": "find-bug",
              "prompt": "Haritayı Harita sekmesinde çizdin ama oyunu çalıştırınca ekran boş, yalnız kedi görünüyor. Bloklar şöyle:\n\n```\n1  haritayı yükle: [oda]\n2  oyun başlayınca\n3      [kedi] sprite'ını oluştur\n4      [kedi] sprite'ını sütun [5] satır [3] karosuna koy\n5      [kedi] oyuncu tuşlarıyla hareket etsin\n```\n\nSatır 1 çalışma alanında tek başına duruyor, `oyun başlayınca` bloğunun içinde değil. Hata nedir?",
              "options": [
                "`haritayı yükle` bloğu `oyun başlayınca` bloğunun dışında kaldığı için hiç çalışmıyor",
                "Kedinin sütun ve satırı yanlış",
                "Hareket bloğu yanlış sprite'a bağlı",
                "Harita adı büyük harfle yazılmamış"
              ],
              "answer": 0,
              "explanation": "Başlangıçta çalışacak bloklar `oyun başlayınca` içinde olmalıdır. Dışarıda kalan blok hiç çalışmaz, harita da yüklenmez. Kedinin konumu ve hareketi doğru; harita adının büyük ya da küçük harf olması burada sorun değil.",
              "skills": [
                "oyun-hata-ayiklama"
              ]
            },
            {
              "id": "m11h3d11-q5",
              "kind": "predict-output",
              "prompt": "Oda kapalı. Sütun 4, satır 3 karosunda bir taş duvar (duvar kutusu işaretli) var. Kedi sütun 2, satır 3 karosuna konuyor ve oyuncu sağ ok tuşuna basılı tutuyor.\n\n```\nharitayı yükle: [oda]\n[kedi] sütun [2] satır [3] karosuna koy\n[kedi] oyuncu tuşlarıyla [dört yöne] hareket etsin, hız [60]\n```\n\nBirkaç saniye sonra ne olur?",
              "options": [
                "Kedi duvarın içinden geçip sağ kenara gider",
                "Kedi duvarın üstünden zıplar",
                "Duvar kaybolur",
                "Kedi taş duvarın hemen solunda durur ve ilerleyemez"
              ],
              "answer": 3,
              "explanation": "Duvar kutusu işaretli karo sprite'ı durdurur; kedi duvara değince kalır. Bunun için ayrıca blok yazmak gerekmez. Duvarın kendiliğinden kaybolması ya da kedinin zıplaması bu derste hiçbir blokla tanımlanmamıştır.",
              "skills": [
                "oyun-karo-duvar",
                "oyun-harita-izgara"
              ]
            }
          ],
          "contentEn": {
            "title": "Your first room: a map with walls",
            "problem": "So far our games have taken place on an empty screen. Real games, though, have rooms, mazes and corridors. Why can't a sprite go through a wall? And instead of placing a room with blocks one by one, how can we make it by drawing?",
            "contentMd": "In this lesson you will draw your first map. A map is small square pictures (tiles) laid out in a grid. Tiles can be walls, or just decoration.\n\n### Map and tile\n- **Tile:** A 16 x 16 pixel square picture.\n- **Map:** A grid made of tiles. In this lesson the map called `oda` (room) has 10 columns and 7 rows. That makes 160 x 112 pixels.\n- **Wall:** A sprite cannot go into a tile marked as a wall. There is a \"wall\" box for this in the tile set.\n- Columns and rows are counted **from 0**. The top left tile is column 0, row 0.\n\n### Look first\n1. Open the activity and press the ▶ button. The cat is standing in the middle of the room.\n2. Go to the **Map** tab. You will see an empty map called `oda` and, under it, a **Tile set**. There are three tiles in the set: stone wall, grass and water.\n3. The **wall** box under the stone wall and water tiles is ticked. Grass is not ticked. So you can walk over grass, but you cannot get through stone wall or water.\n4. The red dashed frame on the map shows the first screen of the game.\n\n### Draw the map\n1. Click the **stone wall** tile in the tile set. The chosen tile is highlighted.\n2. Choose **Paint** from the tools.\n3. Paint the top row of the map by clicking and dragging from left to right. Then paint the bottom row, the left column and the right column. It should be a room completely surrounded by walls.\n4. If you like, choose the **Grass** tile and paint the inside of the room green with the **Fill** tool. Grass is only decoration.\n5. If you painted something by mistake, use the **Erase** tool.\n\n### Walk the cat\n1. Go to the **Blocks** tab. In the work area, inside the `when game starts` block, there are `load map: [oda]`, the making of a cat and the placing of the cat.\n2. From the **Controller** category, add the `[kedi] moves [in 4 directions] with player keys, speed [60]` block at the very bottom (`kedi` instead of `this sprite`).\n3. Press the ▶ button and walk the cat in four directions. It should stop when it hits a wall.\n\nExpected result: The cat walks inside the room but cannot go through the walls. All four goals are green.\n\n### How does it work?\n- The `load map: [oda]` block puts the map you drew in the Map tab into the game. Without this block, the map does not appear.\n- The `put sprite [kedi] on tile column [5] row [3]` block places the cat in the exact middle of the tile. Giving a position on the map is easier than counting pixels.\n- Wall tiles stop the sprite. You do not need to write a separate block for this. It is enough to make the tile a wall.\n- If a single gap is left in a wall, the cat gets out through it. The edge must be fully closed.\n\n### Try it\n1. Draw a few stone wall tiles in the middle of the room and watch the cat go around them.\n2. Paint the **Water** tile in one corner of the map. Can the cat go into the water?\n3. Tick the **wall** box of the grass tile. Can the cat go onto the grass?\n4. Make the map bigger by changing the **Columns** and **Rows** boxes. Paint the new tiles.\n\n### Common mistakes\n- If you painted the tile but its **wall** box is not ticked, the cat goes straight through it.\n- The `load map: [oda]` block must be inside the `when game starts` block. If it is left outside, the map does not come in.\n- To remove a tile you added to the map, use the **Erase** tool. If you remove a tile from the tile set, all its copies on the map are deleted too.\n- If the map's name changes somewhere, the same name must be chosen in the block as well. In this lesson, do not change the name `oda`.",
            "question": "Why do we make most walls in a game by drawing a map rather than with blocks one by one? If you turned a real room (your own room or your classroom) into a grid, how big would it be?",
            "explainerMd": "### What you will learn in this lesson\n- That a map is a grid made of small square pictures (tiles)\n- That columns and rows are counted starting from 0\n- What it means for a tile to be a \"wall\"\n- The difference between drawing the map, loading it into the game and putting a sprite on a tile\n\n### What you should know first\nThe lessons in module 11, week 1 and week 2: stage, sprite, moving with the arrow keys and lining blocks up under `when game starts`. No new idea is needed.\n\n### A map is a grid\nSo far you have moved sprites around an empty stage. Real games have rooms, corridors and mazes. Instead of drawing these piece by piece, we lay small square pictures called **tiles** side by side. A tile is 16 x 16 pixels. The grid the tiles are laid out in is called a **map**.\n\nThe room in this lesson has 10 columns and 7 rows:\n\n```\nwidth = 10 tiles x 16 pixels = 160 pixels\nheight = 7 tiles x 16 pixels = 112 pixels\n```\n\nThe screen is 160 pixels wide, so the room fits the screen exactly.\n\n### Column and row numbers start from zero\nTwo numbers are enough to describe a tile: the **column** (from left to right) and the **row** (from top to bottom). The top left corner is column 0, row 0. So the last column of a map with 10 columns is 9.\n\n```\n        column 0   1   2   3 ...\nrow 0       [ ] [ ] [ ] [ ]\nrow 1       [ ] [ ] [ ] [ ]\nrow 2       [ ] [ ] [ ] [ ]\n```\n\nThe centre of a tile is at column x 16 + 8 and row x 16 + 8 pixels. The centre of the tile at column 5, row 3 is the point (88, 56).\n\n### Tile set and wall\nTo paint the map you use a **tile set**. Every tile in the set has a **wall** box. If the box is ticked, a sprite cannot go into that tile; if it is not ticked, it walks over it.\n\n| Tile | Wall box | What does the sprite do? |\n|---|---|---|\n| Stone wall | ticked | Stops |\n| Water | ticked | Stops |\n| Grass | not ticked | Walks over it |\n\nPainting the tile with the right picture is not enough; you also need to set the box correctly. You do not write a separate block for the wall to work.\n\n### Drawing a map is different from loading it\nThe map you draw in the Map tab does not go into the game by itself. The `load map` block must run inside the `when game starts` block. Placing the sprite with the `put sprite on tile column row` block is also easier than counting pixels. If a single gap is left in the outer wall, the sprite gets out through it; the room must be fully closed.\n\n### Summary\nA map is a grid of 16 x 16 pixel tiles, and columns and rows are counted from 0. Tiles with a ticked wall box stop the sprite. You draw the map in the Map tab, but for it to appear in the game you need to run the `load map` block.",
            "concepts": [
              {
                "term": "Tile",
                "definition": "A small 16 x 16 pixel square picture that makes up the map.",
                "example": "Stone wall, grass and water are three separate tiles; the map builds the room by laying them side by side.",
                "pitfall": "Mixing up a tile and a sprite: a tile is one cell of the map; it does not move by itself."
              },
              {
                "term": "Map and grid",
                "definition": "The grid in which tiles are laid out in columns and rows; its size is given as a number of tiles.",
                "example": "A room with 10 columns and 7 rows makes 160 x 112 pixels.",
                "pitfall": "Drawing the map in the Map tab and forgetting to load it into the game: if the `load map` block does not run, the map does not appear."
              },
              {
                "term": "Column and row (counting from 0)",
                "definition": "A tile's address: the column from left to right, the row from top to bottom. The top left tile is column 0, row 0.",
                "example": "The centre of the tile at column 5, row 3 is at (5 x 16 + 8, 3 x 16 + 8) = (88, 56) pixels.",
                "pitfall": "Counting from 1: the last column of a map with 10 columns is 9, not 10."
              },
              {
                "term": "Wall box",
                "definition": "The box next to each tile in the tile set; if it is ticked, a sprite cannot go into that tile.",
                "example": "Stone wall and water are ticked, grass is not; the cat walks on grass but cannot get through stone.",
                "pitfall": "Painting a tile like a wall but not ticking the box: the cat goes straight through it."
              },
              {
                "term": "Tile set",
                "definition": "The list of tiles you can use on the map, and the settings of each one.",
                "example": "In this lesson the set has stone wall, grass and water.",
                "pitfall": "Removing a tile from the tile set: all its copies on the map are deleted too."
              }
            ],
            "quiz": [
              {
                "id": "m11h3d11-q1",
                "kind": "numeric",
                "prompt": "The room map has 10 columns and 7 rows, and each tile is 16 pixels. How many pixels high is the map?",
                "answer": 112,
                "unit": "pixels",
                "explanation": "The height is the number of rows times the tile size: 7 x 16 = 112 pixels. The value 160 is the width (10 x 16); mixing up rows and columns is the most common mistake.",
                "skills": [
                  "oyun-harita-izgara"
                ]
              },
              {
                "id": "m11h3d11-q2",
                "kind": "mcq",
                "prompt": "You painted the stone wall tile but the cat goes through the wall. What is the most likely reason?",
                "options": [
                  "The cat's speed is too high",
                  "The map is bigger than 10 columns",
                  "In the tile set, the stone wall tile's wall box is not ticked",
                  "The `moves with player keys` block is missing from the blocks"
                ],
                "answer": 2,
                "explanation": "What stops the sprite is not the tile's picture but the wall box. If the box is not ticked, the tile is only decoration. The speed and the map size do not affect whether the wall works; if the movement block were missing, the cat would not walk at all.",
                "skills": [
                  "oyun-karo-duvar"
                ]
              },
              {
                "id": "m11h3d11-q3",
                "kind": "numeric",
                "prompt": "You placed the cat with the `put sprite on tile column 5 row 3` block. At what x position in pixels is the cat's centre? (A tile is 16 pixels; the centre is the middle of the tile.)",
                "answer": 88,
                "unit": "pixels",
                "explanation": "The column 5 tile starts at 5 x 16 = 80 pixels. The centre is half a tile (8 pixels) to the right: 80 + 8 = 88. If you multiply the column by 16 and forget to add the middle, you get 80.",
                "skills": [
                  "oyun-harita-izgara"
                ]
              },
              {
                "id": "m11h3d11-q4",
                "kind": "find-bug",
                "prompt": "You drew the map in the Map tab, but when you run the game the screen is empty and only the cat can be seen. The blocks are:\n\n```\n1  load map: [oda]\n2  when game starts\n3      make sprite [kedi]\n4      put sprite [kedi] on tile column [5] row [3]\n5      [kedi] moves with player keys\n```\n\nLine 1 stands on its own in the work area, not inside the `when game starts` block. What is the bug?",
                "options": [
                  "The `load map` block is left outside the `when game starts` block, so it never runs",
                  "The cat's column and row are wrong",
                  "The movement block is linked to the wrong sprite",
                  "The map name is not written in capital letters"
                ],
                "answer": 0,
                "explanation": "Blocks that should run at the start must be inside `when game starts`. A block left outside never runs, so the map is not loaded either. The cat's position and movement are correct; whether the map name is in capital or small letters is not the problem here.",
                "skills": [
                  "oyun-hata-ayiklama"
                ]
              },
              {
                "id": "m11h3d11-q5",
                "kind": "predict-output",
                "prompt": "The room is closed. There is a stone wall (wall box ticked) on the tile at column 4, row 3. The cat is put on the tile at column 2, row 3, and the player holds the right arrow key down.\n\n```\nload map: [oda]\nput [kedi] on tile column [2] row [3]\n[kedi] moves in 4 directions with player keys, speed [60]\n```\n\nWhat happens after a few seconds?",
                "options": [
                  "The cat goes through the wall to the right edge",
                  "The cat jumps over the wall",
                  "The wall disappears",
                  "The cat stops just to the left of the stone wall and cannot go on"
                ],
                "answer": 3,
                "explanation": "A tile with a ticked wall box stops the sprite; the cat stays put when it touches the wall. No separate block is needed for this. The wall disappearing by itself or the cat jumping is not set up by any block in this lesson.",
                "skills": [
                  "oyun-karo-duvar",
                  "oyun-harita-izgara"
                ]
              }
            ]
          }
        },
        {
          "title": "Labirentten çık",
          "durationMin": 22,
          "problem": "Labirentler çok eski bir oyun fikridir. Duvarların arasında yol bulursun ve çıkışa ulaşırsın. Bilgisayar, \"çıkışa ulaştın!\" demek için neye bakar? Bir sprite'ın bir karoya dokunduğunu nasıl anlar?",
          "contentMd": "Labirent haritası hazır. Kedi (küçük kedi) başlangıç karosunda ve ok tuşlarıyla yürüyor. Duvarlar tuğla. Çıkış kapısı labirentin sağ alt köşesinde. Ama kapıya girince hiçbir şey olmuyor.\n\n### Karoya dokunma olayı\nSprite'lar birbirine çarpabildiği gibi karolara da dokunabilir. `bir [Oyuncu] sprite'ı [Kapı] karosuna dokununca` bloğu, bir Oyuncu bir kapı karosuna değdiği anda içindeki blokları **bir kez** çalıştırır.\n\n### Önce incele\n1. ▶ düğmesine bas ve labirenti bir kez yürümeyi dene. Tuğla duvarlardan geçemezsin.\n2. **Harita** sekmesine geç ve labirentin yolunu incele. Çıkış nerede?\n3. Karo takımında iki karo var: tuğla duvar (duvar kutusu işaretli) ve kapı (işaretsiz). Kapının işaretsiz olması önemli: sprite kapıya girebilsin, çünkü olay \"dokununca\" çalışır.\n\n### Blokları kur\n1. **Bloklar** sekmesine dön. **Sahne / Harita** kategorisinden `bir [Oyuncu] sprite'ı [Kapı] karosuna dokununca` olay bloğunu çalışma alanına bırak. Resim listesinden kapıyı seç.\n2. İçine **Oyun** kategorisinden `ekranda [Çıkışı buldun!] yaz, [2] saniye` bloğunu tak.\n3. **Ses** kategorisinden `[zafer] melodisini çal` bloğunu ekle.\n4. En alta **Oyun** kategorisinden `oyunu bitir: [kazandın]` bloğunu ekle.\n5. ▶ düğmesine bas. Labirentin yolunu bul ve kapıya ulaş. Mesaj çıkar ve oyun kazanılır.\n\nBeklenen sonuç: Kedi kapı karosuna dokununca mesaj yazılır, zafer melodisi çalar ve oyun kazanılır.\n\n### Nasıl çalışıyor?\n- Olay, kedinin kapıya **ilk değdiği** anda çalışır. Kapının üstünde durmaya devam etmen onu tekrar tekrar çalıştırmaz.\n- Duvarları karo takımındaki **duvar** kutusu belirler. Aynı tuğla resmini duvar olmayan bir karo olarak da kullanabilirsin.\n- Labirent küçük bir kedi (8 x 8 piksel) kullanır. Koridorlar 16 piksel genişliğinde olduğu için rahat sığar. 16 x 16'lık bir sprite çok sıkışırdı.\n- Arka plan `arka planı [Zemin] resmiyle döşe` ile bir zemin resmiyle kaplanmış. Haritada boş bırakılan yerlerde bu zemin görünür.\n\n### Dene\n1. Skor ekle: `oyun başlayınca` içine `skoru [0] yap`, kapı olayına `skoru [100] değiştir` koy.\n2. Bir süre sayacı ekle: mesajı `birleştir` bloğuyla yap: `[Çıkış: ]` ve `geçen süre (sn)`. Kaç saniyede çıktığını yaz.\n3. Harita sekmesinde labirentin içine yeni bir duvar çiz ve yolu uzat. Çıkış hâlâ ulaşılabilir mi?\n\n### Sık yapılan hatalar\n- Olayda **kapı** karosunu seçmeyi unutursan yanlış karo için bekler.\n- Kapı karosunun **duvar** kutusu işaretliyse kedi kapıya giremez. İşareti kaldır.\n- Labirentin yolu tamamen tıkanırsa çıkışa hiç ulaşılamaz. Düzenlediğin labirenti kendin oyna.\n- Oyunu bitirmeyi unutursan mesaj çıkar ama oyun devam eder.",
          "question": "Bir labirent nasıl zor ya da kolay olur? Yol sayısı mı, çıkmaz sokaklar mı, süre mi? Kendi labirentini tasarlasan çıkış nerede olurdu?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Bir sprite'ın bir karoya dokunmasının olay olarak yakalandığını\n- Karo olayının, ilk değdiği anda bir kez çalıştığını\n- Bir oyunu kazanmak için gereken üç adımı: mesaj, ses, oyunu bitir\n- Bir labirentin neden çözülebilir olması gerektiğini\n\n### Önceden bilmen gerekenler\nDers 11: harita, karo, duvar kutusu, sütun ve satır. Hafta 2'den de ekrana mesaj yazmayı ve melodi çalmayı bilmen yeter.\n\n### Karo da olay üretir\nHafta 2'de iki sprite birbirine çarpınca olay çalıştırmıştın. Aynı fikir karolar için de geçerlidir. `bir [Oyuncu] sprite'ı [Kapı] karosuna dokununca` bloğu, oyuncu o karoya değdiğinde içindeki blokları çalıştırır. Olayda iki seçim yaparsın: hangi türden sprite (Oyuncu) ve hangi karo (Kapı).\n\n### Olay bir kez çalışır\nKaro olayı **ilk değdiği anda** tetiklenir. Kedi kapının üstünde durmaya devam etse bile olay tekrar tekrar çalışmaz. Çıkıp yeniden girince tekrar çalışır.\n\n```\noyuncu kapıya girdi    -> olay çalışır (1 kez)\noyuncu orada bekliyor  -> olay çalışmaz\noyuncu çıkıp tekrar girdi -> olay yine çalışır\n```\n\nBu yüzden olay içine `skoru [100] değiştir` koyarsan, kapıda beklemek puanı artırmaz.\n\n### Kazanmanın üç adımı\nÇıkışı bulan oyuncuya bir ödül verilir ve oyun biter. Dersteki kapı olayında üç blok vardır:\n\n1. `ekranda [Çıkışı buldun!] yaz`: oyuncuya haber verir.\n2. `[zafer] melodisini çal`: kutlama sesi.\n3. `oyunu bitir: [kazandın]`: oyunu sonlandırır.\n\nSonuncusu eksik kalırsa mesaj çıkar ama oyun devam eder.\n\n### Labirent tasarımı\nLabirentte duvarlar karo takımından gelir. Kapı karosunun duvar kutusu işaretsiz olmalıdır, çünkü kedinin karoya girmesi gerekir. Küçük bir kedi (8 x 8 piksel) 16 piksellik koridorlarda rahat yürür.\n\nLabirenti düzenlersen **çıkışa giden bir yol kalmalıdır**. Yol duvarlarla kapanırsa olay hiç çalışmaz ve oyun kazanılamaz. Bu yüzden değiştirdiğin labirenti kendin oyna.\n\n### Özet\nKaroya dokununca çalışan olay, sprite karoya ilk değdiğinde bir kez tetiklenir. Oyunu kazandırmak için mesaj yazar, melodi çalar ve `oyunu bitir` bloğunu kullanırsın. Çıkışa giden yolu açık tutmak labirent tasarımının ilk kuralıdır.",
          "concepts": [
            {
              "term": "Karoya dokununca olayı",
              "definition": "Belirli türden bir sprite belirli bir karoya değdiğinde içindeki blokları çalıştıran olay bloğu.",
              "example": "`bir [Oyuncu] sprite'ı [Kapı] karosuna dokununca` bloğu kedi kapıya değince çalışır.",
              "pitfall": "Olayda karo seçmeyi unutmak ya da yanlış karoyu seçmek: yanlış karo için bekler."
            },
            {
              "term": "Bir kez tetiklenme",
              "definition": "Olay, sprite karoya ilk değdiği anda bir kez çalışır; üstünde durmak tekrar çalıştırmaz.",
              "example": "Kapıda 3 saniye beklesen de `skoru 100 değiştir` yalnız bir kez çalışır.",
              "pitfall": "Bekleyince puanın artacağını sanmak."
            },
            {
              "term": "Oyunu bitir",
              "definition": "Oyunu kazandı ya da kaybetti diye sonlandıran blok.",
              "example": "Kapı olayının sonuna `oyunu bitir: kazandın` konur.",
              "pitfall": "Bu bloğu unutmak: mesaj çıkar, melodi çalar ama oyun devam eder."
            },
            {
              "term": "Geçilebilir kapı karosu",
              "definition": "Çıkış karosunun duvar kutusu işaretsizdir; böylece kedi karoya girebilir.",
              "example": "Karo takımında tuğla duvar işaretli, kapı işaretsizdir.",
              "pitfall": "Kapı karosunu duvar yapmak: kedi kapıya giremez."
            },
            {
              "term": "Çözülebilir labirent",
              "definition": "Başlangıçtan çıkışa en az bir açık yolu olan labirent.",
              "example": "Yeni duvar çizdikten sonra labirenti kendin baştan sona yürüyerek denersin.",
              "pitfall": "Yolu tamamen kapatmak: çıkışa hiç ulaşılamaz ve oyun kazanılamaz."
            }
          ],
          "quiz": [
            {
              "id": "m11h3d12-q1",
              "kind": "mcq",
              "prompt": "`bir [Oyuncu] sprite'ı [Kapı] karosuna dokununca` olayı ne zaman çalışır?",
              "options": [
                "Oyun başlar başlamaz",
                "Oyuncu kapının üstünde durduğu sürece sürekli",
                "Yalnız oyun bittiğinde",
                "Oyuncu kapı karosuna ilk değdiği anda, bir kez"
              ],
              "answer": 3,
              "explanation": "Karo olayı sprite karoya girdiği anda bir kez çalışır. Üstünde durmak tekrar tetiklemez; çıkıp yeniden girmek tetikler. Başlangıçta çalışan şey `oyun başlayınca` bloğudur.",
              "skills": [
                "oyun-karo-olay"
              ]
            },
            {
              "id": "m11h3d12-q2",
              "kind": "predict-output",
              "prompt": "Skor 0 iken oyuncu kapı karosuna girip 3 saniye orada bekliyor, sonra oyunu kapatıyorsun.\n\n```\nbir [Oyuncu] sprite'ı [Kapı] karosuna dokununca\n    skoru [100] değiştir\n```\n\nSkor kaç olur?",
              "options": [
                "100",
                "0",
                "300",
                "18000"
              ],
              "answer": 0,
              "explanation": "Olay ilk değme anında bir kez çalışır: 0 + 100 = 100. Beklemek olayı tekrarlamaz, yani 300 ya da 18000 olmaz. 0 olması için olayın hiç çalışmaması gerekirdi.",
              "skills": [
                "oyun-karo-olay",
                "oyun-kazanma-kosulu"
              ]
            },
            {
              "id": "m11h3d12-q3",
              "kind": "find-bug",
              "prompt": "Kedi kapıya girince mesaj çıkıyor ve zafer melodisi çalıyor, ama oyun bitmiyor, kedi yürümeye devam ediyor.\n\n```\n1  bir [Oyuncu] sprite'ı [Kapı] karosuna dokununca\n2      ekranda [Çıkışı buldun!] yaz, [2] saniye\n3      [zafer] melodisini çal\n```\n\nHangisi hatadır?",
              "options": [
                "Satır 1'de yanlış sprite türü seçilmiş",
                "Mesajın süresi 2 saniye olmamalı",
                "Olayın sonunda `oyunu bitir: kazandın` bloğu eksik",
                "Melodi adı `zafer` olmamalı"
              ],
              "answer": 2,
              "explanation": "Mesaj ve melodi çalıştığına göre olay tetikleniyor; yani tür ve karo doğru. Oyunu sonlandıran tek blok `oyunu bitir`dir ve eksik. Süre ve melodi adı oyunun bitip bitmemesini etkilemez.",
              "skills": [
                "oyun-hata-ayiklama",
                "oyun-kazanma-kosulu"
              ]
            },
            {
              "id": "m11h3d12-q4",
              "kind": "numeric",
              "prompt": "Labirent haritası 12 sütun ve 9 satırdır. En dış sıradaki (çevre) duvar karolarının sayısı kaçtır? (Köşeleri bir kez say.)",
              "answer": 38,
              "unit": "karo",
              "explanation": "Üst ve alt satırlarda 12 + 12 = 24 karo vardır. Sol ve sağ sütunlarda köşeler hariç 7 + 7 = 14 karo kalır. Toplam 24 + 14 = 38. Dört kenarı 12 + 12 + 9 + 9 = 42 diye toplarsan köşeleri iki kez saymış olursun.",
              "skills": [
                "oyun-harita-izgara"
              ]
            },
            {
              "id": "m11h3d12-q5",
              "kind": "mcq",
              "prompt": "Labirenti düzenlerken yeni duvarlar çizdin. Oyunun hâlâ kazanılabilir olduğundan nasıl emin olursun?",
              "options": [
                "Duvar sayısını sayarım",
                "Labirenti başlangıçtan çıkışa kendim yürüyerek denerim",
                "Kapı olayını silerim",
                "Kedinin hızını artırırım"
              ],
              "answer": 1,
              "explanation": "Çıkışa açık bir yol olup olmadığını en güvenilir gösteren şey labirenti gerçekten yürümektir. Duvar sayısı yolun açık olduğunu söylemez; olayı silmek ya da hızı artırmak kapalı bir yolu açmaz.",
              "skills": [
                "oyun-hata-ayiklama",
                "oyun-karo-duvar"
              ]
            }
          ],
          "contentEn": {
            "title": "Get out of the maze",
            "problem": "Mazes are a very old game idea. You find a path between the walls and reach the exit. What does the computer look at to say \"you reached the exit!\"? How does it know that a sprite has touched a tile?",
            "contentMd": "The maze map is ready. The cat (a mini cat) is on the start tile and walks with the arrow keys. The walls are brick. The exit door is in the bottom right corner of the maze. But when you go into the door, nothing happens.\n\n### The touching a tile event\nJust as sprites can hit each other, they can also touch tiles. The `when a [Player] sprite touches tile [Door]` block runs the blocks inside it **once**, the moment a Player touches a door tile.\n\n### Look first\n1. Press the ▶ button and try walking through the maze once. You cannot go through the brick walls.\n2. Go to the **Map** tab and study the path through the maze. Where is the exit?\n3. There are two tiles in the tile set: brick wall (wall box ticked) and door (not ticked). It matters that the door is not ticked: the sprite must be able to go into the door, because the event runs \"when it touches\".\n\n### Build the blocks\n1. Go back to the **Blocks** tab. From the **Stage / Map** category, drop the `when a [Player] sprite touches tile [Door]` event block into the work area. Choose the door from the picture list.\n2. Inside it, attach the `show [You found the exit!] on screen for [2] seconds` block from the **Game** category.\n3. From the **Sound** category, add the `play melody [victory]` block.\n4. At the very bottom, add the `end game: [you win]` block from the **Game** category.\n5. Press the ▶ button. Find the path through the maze and reach the door. The message appears and the game is won.\n\nExpected result: When the cat touches the door tile, the message is written, the victory melody plays and the game is won.\n\n### How does it work?\n- The event runs the moment the cat **first touches** the door. Staying on top of the door does not run it again and again.\n- The **wall** box in the tile set decides the walls. You can also use the same brick picture as a tile that is not a wall.\n- The maze uses a small cat (8 x 8 pixels). The corridors are 16 pixels wide, so it fits easily. A 16 x 16 sprite would be very squashed.\n- The background has been covered with a floor picture using `tile background with picture [Floor]`. This floor shows in the places left empty on the map.\n\n### Try it\n1. Add a score: put `set score to [0]` inside `when game starts`, and `change score by [100]` in the door event.\n2. Add a time counter: make the message with the `create text with` block: `[Exit: ]` and `time passed (s)`. Write how many seconds it took to get out.\n3. In the Map tab, draw a new wall inside the maze and make the path longer. Can the exit still be reached?\n\n### Common mistakes\n- If you forget to choose the **door** tile in the event, it waits for the wrong tile.\n- If the door tile's **wall** box is ticked, the cat cannot go into the door. Untick it.\n- If the maze's path is completely blocked, the exit can never be reached. Play the maze you edited yourself.\n- If you forget to end the game, the message appears but the game carries on.",
            "question": "What makes a maze hard or easy? The number of paths, the dead ends, the time? If you designed your own maze, where would the exit be?",
            "explainerMd": "### What you will learn in this lesson\n- That a sprite touching a tile is caught as an event\n- That the tile event runs once, at the moment of first touching\n- The three steps needed to win a game: message, sound, end the game\n- Why a maze has to be solvable\n\n### What you should know first\nLesson 11: map, tile, wall box, column and row. From week 2, it is enough to know how to write a message on the screen and play a melody.\n\n### Tiles make events too\nIn week 2 you ran an event when two sprites hit each other. The same idea works for tiles. The `when a [Player] sprite touches tile [Door]` block runs the blocks inside it when the player touches that tile. You make two choices in the event: which kind of sprite (Player) and which tile (Door).\n\n### The event runs once\nThe tile event is triggered **at the moment of first touching**. Even if the cat keeps standing on the door, the event does not run again and again. When it comes out and goes in again, it runs again.\n\n```\nplayer went into the door       -> the event runs (once)\nplayer waits there              -> the event does not run\nplayer came out and went in again -> the event runs again\n```\n\nSo if you put `change score by [100]` inside the event, waiting at the door does not raise the points.\n\n### The three steps of winning\nA player who finds the exit gets a reward and the game ends. The door event in the lesson has three blocks:\n\n1. `show [You found the exit!] on screen`: tells the player.\n2. `play melody [victory]`: a celebration sound.\n3. `end game: [you win]`: ends the game.\n\nIf the last one is missing, the message appears but the game carries on.\n\n### Maze design\nThe walls in the maze come from the tile set. The door tile's wall box must not be ticked, because the cat needs to go into the tile. A small cat (8 x 8 pixels) walks easily in 16 pixel corridors.\n\nIf you edit the maze, **a path to the exit must remain**. If the path is closed off with walls, the event never runs and the game cannot be won. So play the maze you changed yourself.\n\n### Summary\nThe event that runs when a tile is touched is triggered once, when the sprite first touches the tile. To let the player win the game, you write a message, play a melody and use the `end game` block. Keeping the path to the exit open is the first rule of maze design.",
            "concepts": [
              {
                "term": "When touching a tile event",
                "definition": "An event block that runs the blocks inside it when a sprite of a certain kind touches a certain tile.",
                "example": "The `when a [Player] sprite touches tile [Door]` block runs when the cat touches the door.",
                "pitfall": "Forgetting to choose a tile in the event, or choosing the wrong tile: it waits for the wrong tile."
              },
              {
                "term": "Triggering once",
                "definition": "The event runs once, at the moment the sprite first touches the tile; standing on it does not run it again.",
                "example": "Even if you wait at the door for 3 seconds, `change score by 100` runs only once.",
                "pitfall": "Thinking the points will go up if you wait."
              },
              {
                "term": "End game",
                "definition": "The block that finishes the game as won or lost.",
                "example": "`end game: you win` goes at the end of the door event.",
                "pitfall": "Forgetting this block: the message appears and the melody plays, but the game carries on."
              },
              {
                "term": "Passable door tile",
                "definition": "The exit tile's wall box is not ticked; that way the cat can go into the tile.",
                "example": "In the tile set, the brick wall is ticked and the door is not.",
                "pitfall": "Making the door tile a wall: the cat cannot go into the door."
              },
              {
                "term": "Solvable maze",
                "definition": "A maze with at least one open path from the start to the exit.",
                "example": "After drawing a new wall, you try the maze by walking it yourself from start to finish.",
                "pitfall": "Closing the path completely: the exit can never be reached and the game cannot be won."
              }
            ],
            "quiz": [
              {
                "id": "m11h3d12-q1",
                "kind": "mcq",
                "prompt": "When does the `when a [Player] sprite touches tile [Door]` event run?",
                "options": [
                  "As soon as the game starts",
                  "All the time, for as long as the player stands on the door",
                  "Only when the game ends",
                  "Once, at the moment the player first touches the door tile"
                ],
                "answer": 3,
                "explanation": "The tile event runs once, at the moment the sprite goes into the tile. Standing on it does not trigger it again; coming out and going in again does. What runs at the start is the `when game starts` block.",
                "skills": [
                  "oyun-karo-olay"
                ]
              },
              {
                "id": "m11h3d12-q2",
                "kind": "predict-output",
                "prompt": "With the score at 0, the player goes into the door tile and waits there for 3 seconds, then you close the game.\n\n```\nwhen a [Player] sprite touches tile [Door]\n    change score by [100]\n```\n\nWhat is the score?",
                "options": [
                  "100",
                  "0",
                  "300",
                  "18000"
                ],
                "answer": 0,
                "explanation": "The event runs once, at the moment of first touching: 0 + 100 = 100. Waiting does not repeat the event, so it is not 300 or 18000. For it to be 0, the event would have to never run.",
                "skills": [
                  "oyun-karo-olay",
                  "oyun-kazanma-kosulu"
                ]
              },
              {
                "id": "m11h3d12-q3",
                "kind": "find-bug",
                "prompt": "When the cat goes into the door, the message appears and the victory melody plays, but the game does not end and the cat keeps walking.\n\n```\n1  when a [Player] sprite touches tile [Door]\n2      show [You found the exit!] on screen for [2] seconds\n3      play melody [victory]\n```\n\nWhich is the bug?",
                "options": [
                  "The wrong sprite kind is chosen in line 1",
                  "The message time should not be 2 seconds",
                  "The `end game: you win` block is missing at the end of the event",
                  "The melody name should not be `victory`"
                ],
                "answer": 2,
                "explanation": "The message and melody work, so the event is being triggered; that means the kind and the tile are right. The only block that ends the game is `end game`, and it is missing. The time and the melody name do not affect whether the game ends.",
                "skills": [
                  "oyun-hata-ayiklama",
                  "oyun-kazanma-kosulu"
                ]
              },
              {
                "id": "m11h3d12-q4",
                "kind": "numeric",
                "prompt": "The maze map has 12 columns and 9 rows. How many wall tiles are there in the outermost ring (the edge)? (Count the corners once.)",
                "answer": 38,
                "unit": "tiles",
                "explanation": "There are 12 + 12 = 24 tiles in the top and bottom rows. In the left and right columns, without the corners, 7 + 7 = 14 tiles are left. The total is 24 + 14 = 38. If you add up the four sides as 12 + 12 + 9 + 9 = 42, you have counted the corners twice.",
                "skills": [
                  "oyun-harita-izgara"
                ]
              },
              {
                "id": "m11h3d12-q5",
                "kind": "mcq",
                "prompt": "While editing the maze, you drew new walls. How do you make sure the game can still be won?",
                "options": [
                  "I count the number of walls",
                  "I try the maze by walking it myself from the start to the exit",
                  "I delete the door event",
                  "I make the cat faster"
                ],
                "answer": 1,
                "explanation": "The most reliable way to show whether there is an open path to the exit is to actually walk the maze. The number of walls does not tell you the path is open; deleting the event or raising the speed does not open a closed path.",
                "skills": [
                  "oyun-hata-ayiklama",
                  "oyun-karo-duvar"
                ]
              }
            ]
          }
        },
        {
          "title": "Mağarada elmas avı",
          "durationMin": 25,
          "problem": "Bir haritada bazı karolar sadece duvar ya da zemin değildir. Altın, anahtar, elmas ya da lav olabilir. Bunlara dokunmak bir şey yaptırır. Peki bir elmasa dokununca o elmasın haritadan **kaybolmasını** nasıl sağlarsın? Hangi elmasa dokunduğunu bilgisayar nasıl bilir?",
          "contentMd": "Bir mağara haritası hazır: dört elmas ve üç kırmızı lav karosu var. Kedi ok tuşlarıyla yürüyor ama elmaslara ve lava dokununca hiçbir şey olmuyor. Başlangıçta skor 0 ve can 3.\n\n### Olay karosu\nKaroya dokununca çalışan bir olayın içinde dokunulan karonun yerini öğrenebilirsin:\n- `olay karosunun [sütunu]`\n- `olay karosunun [satırı]`\n\nBu iki sayıyı `sütun [0] satır [0] karosunu boşalt` bloğuna verirsen tam o karo kaybolur. Diğer elmaslar yerinde kalır.\n\n### Elmasları topla\n1. **Sahne / Harita** kategorisinden `bir [Oyuncu] sprite'ı [Elmas] karosuna dokununca` olayını çalışma alanına bırak. Karo olarak **Elmas**'ı seç.\n2. İçine `sütun [0] satır [0] karosunu boşalt` bloğunu tak. Sütun yuvasına `olay karosunun [sütunu]`, satır yuvasına `olay karosunun [satırı]` bloklarını koy.\n3. **Oyun** kategorisinden `skoru [1] değiştir` ve **Ses** kategorisinden `[puan] melodisini çal` bloklarını ekle.\n4. ▶ düğmesine bas. Elmaslara dokun: kaybolur, skor artar.\n\n### Hepsi toplanınca kazan\n1. Olayın en altına **Mantık** kategorisinden `eğer [koşul] ise` bloğunu tak.\n2. Koşul için **=** karşılaştırma bloğunu al. Sol yuvaya `haritadaki [Elmas] karo sayısı` bloğunu, sağ yuvaya 0 sayısını koy.\n3. `eğer`in içine `ekranda [Bütün elmaslar sende!] yaz, [2] saniye`, `[zafer] melodisini çal` ve `oyunu bitir: [kazandın]` bloklarını tak.\n\n### Lav tehlikesi\n1. İkinci bir olay getir: `bir [Oyuncu] sprite'ı [Lav] karosuna dokununca`.\n2. İçine `canı [-1] değiştir`, `ekranı [250] ms salla` ve `[patlama] melodisini çal` bloklarını tak.\n3. Son olarak `[bu sprite] sprite'ını sütun [1] satır [1] karosuna koy` bloğunu ekle. Böylece kedi lava dokununca başlangıç karosuna geri gönderilir.\n4. ↺ düğmesine bas. Lava dokun ve kedinin geri döndüğünü gör. Sonra bütün elmasları topla.\n\nBeklenen sonuç: Elmasa dokununca elmas kaybolur ve skor artar. Dördüncü elmasta oyun kazanılır. Lava dokununca bir can gider ve kedi başa döner.\n\n### Nasıl çalışıyor?\n- Her elmasa dokunulduğunda aynı olay çalışır ama olay karosunun sütunu ve satırı her seferinde o elmasın yerini söyler.\n- `haritadaki [Elmas] karo sayısı` bloğu haritada kaç elmas kaldığını verir. Sıfır olunca hepsi toplanmıştır. Kontrolü karo silindikten **sonra** yaptığın için sayı doğru çıkar.\n- Lav olayında `bu sprite` olayı tetikleyen sprite'tır, yani kedi. Bu yüzden kedinin adını yazmana gerek kalmaz.\n- Sütun ve satır 0'dan sayılır. Sütun 1, satır 1 kenar duvarının hemen içindeki ilk karodur.\n\n### Dene\n1. Kazanma mesajına skoru da yaz: `birleştir` bloğuyla `[Elmaslar: ]` ve `skor`.\n2. Lav `canı [-2] değiştir` desin. Oyun zorlaştı mı?\n3. Harita sekmesinde yeni bir elmas boya (karo takımından **Elmas**'ı seç). Kazanma hâlâ doğru çalışıyor mu? Neden?\n\n### Sık yapılan hatalar\n- Karoyu boşaltan bloğa sabit sayılar yazarsan hep aynı karo silinir. Olay karosunun sütun ve satırını kullan.\n- Elmas ve lav karolarının **duvar** kutusunu işaretleme. Duvar olan karonun içine kedi giremez ve toplama garip görünür.\n- Kazanma kontrolünü karo silinmeden önce yaparsan sayı bir fazla çıkar ve oyun hiç kazanılmaz.\n- Lavın başlangıç karosuna ışınlama bloğunu unutursan kedi lavın üstünde kalır ve canı bir kez kaybeder.",
          "question": "Haritadaki karoların farklı işlevleri olması (duvar, tehlike, ödül) oyuna ne katıyor? Sen bir mağara tasarlasan hangi karolara hangi görevleri verirdin?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Dokunulan karonun sütun ve satırını \"olay karosu\" bloklarıyla öğrenmeyi\n- Tam o karoyu haritadan boşaltmayı\n- Haritada kaç tane belirli karo kaldığını sayıp bununla kazanmayı\n- Tehlikeli bir karoda can azaltmayı ve oyuncuyu başa göndermeyi\n\n### Önceden bilmen gerekenler\nDers 11 (sütun, satır, 0'dan sayma) ve Ders 12 (karoya dokununca olayı ve oyunu bitirme). Hafta 2'den skor ve can bloklarını da hatırla.\n\n### Hangi karoya dokundum?\nHaritada dört elmas var. Hepsine aynı `[Elmas] karosuna dokununca` olayı bakar. Olayın içinde kedinin hangi elmasa değdiğini iki blok söyler: `olay karosunun [sütunu]` ve `olay karosunun [satırı]`. Bunları `sütun satır karosunu boşalt` bloğuna verirsen **dokunduğun elmas** kaybolur, diğerleri yerinde kalır.\n\nSabit sayı yazarsan, örneğin sütun 3 satır 2, hep aynı karo silinir.\n\n### Sayarak kazanmak\nElmaslar bitince oyun kazanılmalı. `haritadaki [Elmas] karo sayısı` bloğu haritada kaç elmas kaldığını söyler. Kural: sayı 0 olunca kazan.\n\n```\nelmas karosunu boşalt\nskoru 1 değiştir\neğer haritadaki elmas sayısı = 0 ise\n    oyunu bitir: kazandın\n```\n\n**Sıra önemlidir.** Kontrolü karoyu boşaltmadan önce yaparsan, son elmasta sayı hâlâ 1 görünür ve oyun hiç kazanılmaz. Boşalt, sonra say.\n\n| Kaldı | Son elmas alınırken kontrol silmeden önce | Silmeden sonra |\n|---|---|---|\n| 1 | sayı 1, kazanılmaz | sayı 0, kazanılır |\n\n### Lav: tehlikeli karo\nLav karosu için ikinci bir olay yazarsın: `canı [-1] değiştir`, ekranı salla, patlama sesi çal ve `[bu sprite] sprite'ını sütun [1] satır [1] karosuna koy`. Sütun 1, satır 1, kenar duvarının hemen içindeki ilk karodur ve başlangıç noktası olur. `bu sprite`, olayı tetikleyen sprite'tır; yani kedidir.\n\nIşınlamayı unutursan kedi lavın üstünde kalır. Olay bir kez çalıştığı için can yalnızca bir kez gider; ama oyuncu hâlâ tehlikenin içinde duruyordur.\n\n### Özet\nOlay karosunun sütunu ve satırı, hangi karoya dokunulduğunu söyler; bunlarla tam o karo boşaltılır. Kazanma kontrolünü karo boşaltıldıktan sonra yapmalısın. Lav gibi tehlikeli karolar canı azaltır ve oyuncuyu başlangıca gönderir.",
          "concepts": [
            {
              "term": "Olay karosu (sütun, satır)",
              "definition": "Karo olayının içinde, dokunulan karonun sütununu ve satırını veren iki değer.",
              "example": "Kedi (8, 1) konumundaki elmasa değince olay karosunun sütunu 8, satırı 1 olur.",
              "pitfall": "Karoyu boşaltan bloğa sabit sayı yazmak: hep aynı karo silinir."
            },
            {
              "term": "Karoyu boşalt",
              "definition": "Verilen sütun ve satırdaki karoyu haritadan kaldıran blok.",
              "example": "Elmasa dokununca o elmasın karosu boşaltılır, diğer elmaslar yerinde kalır.",
              "pitfall": "Sütun ile satırı yer değiştirmek: başka (ya da haritanın dışındaki) bir karo gösterilir."
            },
            {
              "term": "Karo sayacı",
              "definition": "`haritadaki [Elmas] karo sayısı` bloğu haritada o karodan kaç tane kaldığını verir.",
              "example": "Dört elmastan üçü toplanınca sayaç 1 gösterir.",
              "pitfall": "Sayacı karo boşaltılmadan önce okumak: son elmasta sayı 1 görünür, kazanma hiç tetiklenmez."
            },
            {
              "term": "Kazanma koşulu",
              "definition": "Bir sayı ya da durum doğru olunca oyunu kazandıran `eğer` bloğu.",
              "example": "Eğer elmas sayısı = 0 ise oyunu bitir: kazandın.",
              "pitfall": "Koşulu `= 0` yerine yanlış sayıyla kurmak ya da `eğer` bloğunu olayın dışında bırakmak."
            },
            {
              "term": "Tehlikeli karo (lav)",
              "definition": "Dokununca canı azaltan karo; çoğu zaman oyuncuyu başlangıca da gönderir.",
              "example": "Lavda `canı -1 değiştir` ve `bu sprite` sütun 1 satır 1 karosuna konur.",
              "pitfall": "Işınlama bloğunu unutmak: kedi lavın üstünde kalır, bir can gider ve oyuncu hâlâ tehlikededir."
            },
            {
              "term": "Bu sprite",
              "definition": "Olayı tetikleyen sprite; karo olayında dokunan sprite'tır.",
              "example": "Lav olayında `bu sprite`, lava değen kediyi gösterir.",
              "pitfall": "Başka bir sprite'ın adını yazmak: yanlış sprite taşınır."
            }
          ],
          "quiz": [
            {
              "id": "m11h3d13-q1",
              "kind": "mcq",
              "prompt": "Bir arkadaşın elmas olayında `sütun [3] satır [2] karosunu boşalt` yazmış. Kedi hangi elmasa dokunursa ne olur?",
              "options": [
                "Dokunulan elmas silinir",
                "Hiçbir şey silinmez",
                "Her seferinde sütun 3, satır 2 karosu silinir; dokunulan elmas silinmeyebilir",
                "Bütün elmaslar birden silinir"
              ],
              "answer": 2,
              "explanation": "Sabit sayılar her dokunuşta aynı karoyu gösterir. Dokunulan karoyu silmek için `olay karosunun sütunu` ve `olay karosunun satırı` değerleri kullanılmalıdır. Tüm elmasları silmek için ayrı bir döngü ya da çevirme bloğu gerekirdi.",
              "skills": [
                "oyun-olay-karosu"
              ]
            },
            {
              "id": "m11h3d13-q2",
              "kind": "find-bug",
              "prompt": "Dört elmasın hepsi toplanıyor, skor 4 oluyor ama oyun hiç kazanılmıyor.\n\n```\n1  bir [Oyuncu] sprite'ı [Elmas] karosuna dokununca\n2      eğer haritadaki [Elmas] karo sayısı = [0] ise\n3          oyunu bitir: [kazandın]\n4      sütun [olay karosunun sütunu] satır [olay karosunun satırı] karosunu boşalt\n5      skoru [1] değiştir\n```\n\nHatalı satır hangisidir?",
              "options": [
                "Satır 2-3: kontrol karo boşaltılmadan (satır 4) önce yapılıyor",
                "Satır 1: yanlış karo seçilmiş",
                "Satır 5: skor 1 artırılmamalı",
                "Satır 4: boşaltma bloğunda olay karosu kullanılmamalı"
              ],
              "answer": 0,
              "explanation": "Son elmasa değildiğinde sayaç hâlâ 1'dir, çünkü boşaltma kontrolden sonra gelir. Bu yüzden `= 0` hiçbir zaman doğru olmaz. Doğrusu boşaltmayı önce yapmak. Skor çalışıyor (skor 4 oluyor), yani 1. ve 5. satırlar doğru; satır 4 de doğru kullanılmış.",
              "skills": [
                "oyun-hata-ayiklama",
                "oyun-kazanma-kosulu"
              ]
            },
            {
              "id": "m11h3d13-q3",
              "kind": "numeric",
              "prompt": "Başlangıçta skor 0 ve can 3. Elmas olayı skoru 1 artırır, lav olayı canı 1 azaltıp kediyi başa gönderir. Kedi sırayla şu karolara dokundu: elmas, lav, elmas, lav, elmas (hepsi farklı karolar). Sonunda can kaçtır?",
              "answer": 1,
              "unit": "can",
              "explanation": "Lav iki kez çalıştı: 3 - 1 - 1 = 1. Elmaslar canı değiştirmez (skor 3 olur). Üç lav olsaydı can 0 olurdu.",
              "skills": [
                "oyun-karo-olay",
                "oyun-kazanma-kosulu"
              ]
            },
            {
              "id": "m11h3d13-q4",
              "kind": "predict-output",
              "prompt": "Can 5. Lav olayında kediyi başa gönderen blok yok:\n\n```\nbir [Oyuncu] sprite'ı [Lav] karosuna dokununca\n    canı [-2] değiştir\n```\n\nKedi lav karosuna girip 4 saniye üstünde duruyor. Can kaç olur?",
              "options": [
                "5",
                "-3",
                "1",
                "3"
              ],
              "answer": 3,
              "explanation": "Karo olayı ilk değmede bir kez çalışır; 5 - 2 = 3. Kedi lavda beklese de olay tekrar etmez. Her saniye canın düşeceği (-3) ya da hiç düşmeyeceği (5) doğru değildir.",
              "skills": [
                "oyun-karo-olay"
              ]
            },
            {
              "id": "m11h3d13-q5",
              "kind": "mcq",
              "prompt": "Haritada soldan 3., yukarıdan 2. karoyu göstermek istiyorsun. Sütun ve satır sayıları ne olmalıdır?",
              "options": [
                "Sütun 2, satır 1",
                "Sütun 3, satır 2",
                "Sütun 2, satır 3",
                "Sütun 1, satır 2"
              ],
              "answer": 0,
              "explanation": "Sayma 0'dan başlar: soldan 3. karo sütun 2, yukarıdan 2. karo satır 1'dir. Sütun 3, satır 2 aslında soldan 4. ve yukarıdan 3. karodur; sütun ile satırı yer değiştirmek de başka bir karoyu gösterir.",
              "skills": [
                "oyun-harita-izgara",
                "oyun-olay-karosu"
              ]
            }
          ],
          "contentEn": {
            "title": "Diamond hunt in the cave",
            "problem": "On a map, some tiles are not just walls or floor. They can be gold, a key, a diamond or lava. Touching them makes something happen. So when you touch a diamond, how do you make that diamond **disappear** from the map? How does the computer know which diamond you touched?",
            "contentMd": "A cave map is ready: there are four diamonds and three red lava tiles. The cat walks with the arrow keys, but nothing happens when it touches the diamonds or the lava. At the start the score is 0 and the lives are 3.\n\n### The event tile\nInside an event that runs when a tile is touched, you can find out where the touched tile is:\n- `event tile [column]`\n- `event tile [row]`\n\nIf you give these two numbers to the `clear tile at column [0] row [0]` block, exactly that tile disappears. The other diamonds stay where they are.\n\n### Collect the diamonds\n1. From the **Stage / Map** category, drop the `when a [Player] sprite touches tile [Diamond]` event into the work area. Choose **Diamond** as the tile.\n2. Attach the `clear tile at column [0] row [0]` block inside it. Put the `event tile [column]` block in the column slot, and the `event tile [row]` block in the row slot.\n3. Add the `change score by [1]` block from the **Game** category and the `play melody [point]` block from the **Sound** category.\n4. Press the ▶ button. Touch the diamonds: they disappear and the score goes up.\n\n### Win when they are all collected\n1. At the very bottom of the event, attach the `if ... do` block from the **Logic** category.\n2. For the condition, take the **=** comparison block. Put the `number of [Diamond] tiles on map` block in the left slot, and the number 0 in the right slot.\n3. Inside the `if`, attach the `show [You have all the diamonds!] on screen for [2] seconds`, `play melody [victory]` and `end game: [you win]` blocks.\n\n### Lava danger\n1. Bring a second event: `when a [Player] sprite touches tile [Lava]`.\n2. Inside it, attach the `change lives by [-1]`, `shake screen for [250] ms` and `play melody [boom]` blocks.\n3. Finally, add the `put sprite [this sprite] on tile column [1] row [1]` block. This way, when the cat touches lava, it is sent back to the start tile.\n4. Press the ↺ button. Touch the lava and see the cat go back. Then collect all the diamonds.\n\nExpected result: When you touch a diamond, the diamond disappears and the score goes up. At the fourth diamond the game is won. When you touch lava, a life goes and the cat goes back to the start.\n\n### How does it work?\n- The same event runs each time a diamond is touched, but the event tile's column and row tell you where that diamond is each time.\n- The `number of [Diamond] tiles on map` block gives how many diamonds are left on the map. When it is zero, they have all been collected. Because you do the check **after** the tile has been deleted, the number comes out right.\n- In the lava event, `this sprite` is the sprite that triggered the event, so the cat. That is why you do not need to write the cat's name.\n- Columns and rows are counted from 0. Column 1, row 1 is the first tile just inside the outer wall.\n\n### Try it\n1. Write the score in the winning message too: with the `create text with` block, `[Diamonds: ]` and `score`.\n2. Make the lava say `change lives by [-2]`. Did the game get harder?\n3. In the Map tab, paint a new diamond (choose **Diamond** from the tile set). Does winning still work correctly? Why?\n\n### Common mistakes\n- If you write fixed numbers in the block that clears the tile, the same tile is always deleted. Use the event tile's column and row.\n- Do not tick the **wall** box of the diamond and lava tiles. The cat cannot go into a tile that is a wall, and collecting looks odd.\n- If you do the winning check before the tile is deleted, the number comes out one too many and the game is never won.\n- If you forget the block that teleports the cat from the lava to the start tile, the cat stays on the lava and loses a life once.",
            "question": "What does it add to the game for the tiles on the map to have different jobs (wall, danger, reward)? If you designed a cave, which jobs would you give to which tiles?",
            "explainerMd": "### What you will learn in this lesson\n- How to find out the column and row of the touched tile with the \"event tile\" blocks\n- How to clear exactly that tile from the map\n- How to count how many of a certain tile are left on the map and win with it\n- How to lower the lives on a dangerous tile and send the player back to the start\n\n### What you should know first\nLesson 11 (column, row, counting from 0) and lesson 12 (the touching a tile event and ending the game). Remember the score and lives blocks from week 2 too.\n\n### Which tile did I touch?\nThere are four diamonds on the map. The same `touches tile [Diamond]` event looks after all of them. Inside the event, two blocks tell you which diamond the cat touched: `event tile [column]` and `event tile [row]`. If you give these to the `clear tile at column row` block, **the diamond you touched** disappears and the others stay where they are.\n\nIf you write fixed numbers, for example column 3 row 2, the same tile is always deleted.\n\n### Winning by counting\nWhen the diamonds run out, the game should be won. The `number of [Diamond] tiles on map` block tells you how many diamonds are left on the map. The rule: win when the number is 0.\n\n```\nclear the diamond tile\nchange score by 1\nif number of diamonds on map = 0\n    end game: you win\n```\n\n**Order matters.** If you do the check before clearing the tile, at the last diamond the number still shows 1 and the game is never won. Clear first, then count.\n\n| Left | Checking before deleting, as the last diamond is taken | After deleting |\n|---|---|---|\n| 1 | number 1, not won | number 0, won |\n\n### Lava: a dangerous tile\nYou write a second event for the lava tile: `change lives by [-1]`, shake the screen, play a boom sound and `put sprite [this sprite] on tile column [1] row [1]`. Column 1, row 1 is the first tile just inside the outer wall, and it becomes the starting point. `this sprite` is the sprite that triggered the event; so it is the cat.\n\nIf you forget the teleport, the cat stays on the lava. The event runs once, so a life is lost only once; but the player is still standing in the danger.\n\n### Summary\nThe event tile's column and row tell you which tile was touched; with them, exactly that tile is cleared. You must do the winning check after the tile has been cleared. Dangerous tiles like lava lower the lives and send the player back to the start.",
            "concepts": [
              {
                "term": "Event tile (column, row)",
                "definition": "Two values inside a tile event that give the column and row of the touched tile.",
                "example": "When the cat touches the diamond at (8, 1), the event tile column is 8 and the row is 1.",
                "pitfall": "Writing fixed numbers in the block that clears the tile: the same tile is always deleted."
              },
              {
                "term": "Clear tile",
                "definition": "The block that removes the tile at the given column and row from the map.",
                "example": "When you touch a diamond, that diamond's tile is cleared and the other diamonds stay where they are.",
                "pitfall": "Swapping the column and the row: another tile (or one outside the map) is pointed to."
              },
              {
                "term": "Tile counter",
                "definition": "The `number of [Diamond] tiles on map` block gives how many of that tile are left on the map.",
                "example": "When three of the four diamonds have been collected, the counter shows 1.",
                "pitfall": "Reading the counter before the tile is cleared: at the last diamond the number shows 1 and winning is never triggered."
              },
              {
                "term": "Winning condition",
                "definition": "An `if` block that makes the game won when a number or state is true.",
                "example": "If the number of diamonds = 0, end game: you win.",
                "pitfall": "Setting the condition up with the wrong number instead of `= 0`, or leaving the `if` block outside the event."
              },
              {
                "term": "Dangerous tile (lava)",
                "definition": "A tile that lowers the lives when touched; most of the time it also sends the player back to the start.",
                "example": "On lava, `change lives by -1` runs and `this sprite` is put on the tile at column 1 row 1.",
                "pitfall": "Forgetting the teleport block: the cat stays on the lava, a life goes and the player is still in danger."
              },
              {
                "term": "This sprite",
                "definition": "The sprite that triggered the event; in a tile event, it is the sprite that touched the tile.",
                "example": "In the lava event, `this sprite` points to the cat that touched the lava.",
                "pitfall": "Writing another sprite's name: the wrong sprite is moved."
              }
            ],
            "quiz": [
              {
                "id": "m11h3d13-q1",
                "kind": "mcq",
                "prompt": "A friend of yours has written `clear tile at column [3] row [2]` in the diamond event. Whichever diamond the cat touches, what happens?",
                "options": [
                  "The touched diamond is deleted",
                  "Nothing is deleted",
                  "The tile at column 3, row 2 is deleted every time; the touched diamond may not be deleted",
                  "All the diamonds are deleted at once"
                ],
                "answer": 2,
                "explanation": "Fixed numbers point to the same tile at every touch. To delete the touched tile, the `event tile column` and `event tile row` values must be used. Deleting all the diamonds would need a separate loop or a turn-into block.",
                "skills": [
                  "oyun-olay-karosu"
                ]
              },
              {
                "id": "m11h3d13-q2",
                "kind": "find-bug",
                "prompt": "All four diamonds are collected and the score becomes 4, but the game is never won.\n\n```\n1  when a [Player] sprite touches tile [Diamond]\n2      if number of [Diamond] tiles on map = [0]\n3          end game: [you win]\n4      clear tile at column [event tile column] row [event tile row]\n5      change score by [1]\n```\n\nWhich line is wrong?",
                "options": [
                  "Lines 2-3: the check is done before the tile is cleared (line 4)",
                  "Line 1: the wrong tile is chosen",
                  "Line 5: the score should not go up by 1",
                  "Line 4: the event tile should not be used in the clear block"
                ],
                "answer": 0,
                "explanation": "When the last diamond is touched, the counter is still 1, because the clearing comes after the check. So `= 0` is never true. The fix is to do the clearing first. The score works (it becomes 4), so lines 1 and 5 are correct; line 4 is used correctly too.",
                "skills": [
                  "oyun-hata-ayiklama",
                  "oyun-kazanma-kosulu"
                ]
              },
              {
                "id": "m11h3d13-q3",
                "kind": "numeric",
                "prompt": "At the start the score is 0 and the lives are 3. The diamond event raises the score by 1; the lava event lowers the lives by 1 and sends the cat back to the start. The cat touched these tiles in order: diamond, lava, diamond, lava, diamond (all different tiles). How many lives are left at the end?",
                "answer": 1,
                "unit": "lives",
                "explanation": "The lava ran twice: 3 - 1 - 1 = 1. The diamonds do not change the lives (the score becomes 3). If there had been three lavas, the lives would be 0.",
                "skills": [
                  "oyun-karo-olay",
                  "oyun-kazanma-kosulu"
                ]
              },
              {
                "id": "m11h3d13-q4",
                "kind": "predict-output",
                "prompt": "The lives are 5. In the lava event there is no block that sends the cat back to the start:\n\n```\nwhen a [Player] sprite touches tile [Lava]\n    change lives by [-2]\n```\n\nThe cat goes into the lava tile and stays on it for 4 seconds. How many lives are there?",
                "options": [
                  "5",
                  "-3",
                  "1",
                  "3"
                ],
                "answer": 3,
                "explanation": "The tile event runs once, at the first touch; 5 - 2 = 3. Even if the cat waits on the lava, the event does not repeat. It is not true that the lives drop every second (-3) or do not drop at all (5).",
                "skills": [
                  "oyun-karo-olay"
                ]
              },
              {
                "id": "m11h3d13-q5",
                "kind": "mcq",
                "prompt": "You want to point to the 3rd tile from the left and the 2nd from the top on the map. What should the column and row numbers be?",
                "options": [
                  "Column 2, row 1",
                  "Column 3, row 2",
                  "Column 2, row 3",
                  "Column 1, row 2"
                ],
                "answer": 0,
                "explanation": "Counting starts from 0: the 3rd tile from the left is column 2, and the 2nd tile from the top is row 1. Column 3, row 2 is actually the 4th from the left and the 3rd from the top; swapping the column and the row also points to another tile.",
                "skills": [
                  "oyun-harita-izgara",
                  "oyun-olay-karosu"
                ]
              }
            ]
          }
        },
        {
          "title": "Büyük bir dünya, kayan kamera",
          "durationMin": 25,
          "problem": "Bazı oyun dünyaları ekrandan çok daha büyüktür. Ekran 160 piksel geniştir ama dünya 480 piksel olabilir. O zaman ekranda ne görürüz? Kamera. Kamera dünyanın bir parçasını gösterir ve oyuncu yürüdükçe kayar.",
          "contentMd": "\"Ova\" haritası 30 karo geniş, yani 480 piksel. Ekranın üç katı! Kedi ok tuşlarıyla yürüyor ama kamera sabit, bu yüzden kedi sağa gidince ekrandan çıkıp kayboluyor. Haritada ayrıca 7 elma işareti var: bunlar elma resimli karolar. Onları toplanabilir elmalara çevireceksin.\n\n### Kamera\n- `kamera [kedi] sprite'ını takip etsin` bloğu kamerayı kediye bağlar. Kedi yürüdükçe görüntü kayar. Dünya ekrandan küçükse kamera kaymaz.\n- `kamera sabit kalsın` bloğu takibi bırakır.\n- Haritanın büyüklüğünü `harita [genişliği] (karo)` bloğu söyler.\n\n### Karoyu sprite'a çevirmek\nHaritadaki elma karoları sadece resimdir. Toplanabilmesi için gerçek sprite olmaları gerekir. `tüm [Elma] karolarını [Yiyecek] sprite'ına çevir` bloğu haritadaki bütün elma karolarını boşaltır ve her birinin yerine bir **Yiyecek** sprite'ı koyar.\n\n### Blokları kur\n1. **Harita** sekmesine geç ve ovayı incele. Kırmızı kesikli çerçeve oyunun ilk ekranını gösterir: haritanın çok küçük bir bölümü. Ağaçlar duvar.\n2. **Bloklar** sekmesine dön. `oyun başlayınca` içindeki bloklara bak: harita yüklenmiş, kedi 1. sütun 4. satıra konmuş ve tuşlarla yürüyor. Toplama olayı da hazır: kedi bir Yiyecek'e değince skor 1 artıyor ve yiyecek siliniyor.\n3. **Sahne / Harita** kategorisinden `kamera [bu sprite] sprite'ını takip etsin` bloğunu `oyun başlayınca` içinin en altına tak. `bu sprite` yerine `kedi` değişkenini koy.\n4. Aynı yere `tüm [Elma] karolarını [Yiyecek] sprite'ına çevir` bloğunu ekle. Karo olarak **Elma**, tür olarak **Yiyecek** seç.\n5. ▶ düğmesine bas. Kediyi sağa yürüt. Görüntü kayar ve yolda elma toplarsın.\n\nBeklenen sonuç: Kamera kediyi izler. Haritadaki 7 elma, toplanabilen sprite'lara dönüşür. Elma toplayınca skor artar.\n\n### Nasıl çalışıyor?\n- Kamera, takip ettiği sprite'ı ekranın ortasında tutmaya çalışır. Dünyanın kenarına yaklaşınca durur, boşluk göstermez.\n- Harita dünyadır; ekran bu dünyaya açılan bir penceredir. Sen kamerayla bu pencerenin yerini seçersin.\n- Çevirme bloğundan sonra haritada elma karosu kalmaz. Elmalar sprite olmuştur. Sprite'lar hareket edebilir ve çarpışma olayına katılabilir. Karolar katılamaz.\n- Çevrilen her sprite için `bir [Yiyecek] sprite'ı oluşunca` olayı çalışır. Bunu kullanarak elmalara hareket, ses ya da başka özellik verebilirsin.\n\n### Dene\n1. Elmalara hız ver: `bir [Yiyecek] sprite'ı oluşunca` olayını yaz ve içine `[bu sprite] hızı x [0] y [20]` koy. Elmalar aşağı kayar mı?\n2. Kamerayı kedi yerine sabit bırak: `kamera sabit kalsın` kullan. Ne değişti?\n3. Harita sekmesinde ovaya yeni elma karoları ya da ağaçlar ekle. Çalışıyor mu?\n\n### Sık yapılan hatalar\n- Kamerayı eklemeyi unutursan kedi ekrandan çıkar.\n- Elma karolarını çevirmezsen kedi onlara değse bile bir şey olmaz. Çünkü olay Yiyecek **sprite'ı** bekler.\n- Çevirme bloğunda tür olarak yanlış seçim yaparsan elmalar toplanamaz. Tür **Yiyecek** olmalı.\n- Kamera bloğunu çevirme bloğundan sonra koyup `bu sprite` olarak bırakırsan kamera en son oluşan elmayı izler. Kameraya her zaman `kedi` değişkenini ver.",
          "question": "Büyük dünyalı oyunlar neden ekranın tamamını göstermez? Kamerasız bir oyun nasıl bir şey olurdu? Hangi oyunlarda kamera hiç kaymaz, ekran sabittir?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Dünya ile ekranın farkını\n- Kameranın bir sprite'ı nasıl takip ettiğini ve nerede durduğunu\n- Karoları gerçek sprite'lara çevirmenin neden gerektiğini\n- Kamerayı ve çevirme bloğunu doğru yere koymayı\n\n### Önceden bilmen gerekenler\nDers 11 (harita, karo, 16 piksel) ve Ders 13 (haritadan karo silme, skor). Hafta 2'den sprite'lar arası çarpışma olayını da hatırla.\n\n### Dünya büyük, ekran küçük\nEkran sabittir: 160 x 120 piksel. Harita ise bundan büyük olabilir. Bu dersteki ova 30 karo genişliğindedir:\n\n```\n30 karo x 16 piksel = 480 piksel\n480 / 160 = ekranın 3 katı genişlik\n```\n\nEkran bu dünyaya açılan bir penceredir. **Kamera**, pencerenin dünyada nerede durduğunu belirler.\n\n### Kamera kediyi izler\n`kamera [kedi] sprite'ını takip etsin` bloğu kediyi ekranın ortasında tutmaya çalışır. Kamera dünyanın sol kenarından sağ kenarına kadar kayabilir; sınırı aşmaz. Kamera x değeri en az 0 ve en çok dünya genişliği eksi 160 olur.\n\n```\nkedi x = 200 piksel  -> kamera x = 200 - 80 = 120\nkedi x = 30 piksel   -> kamera sol kenarda durur, x = 0\nkedi x = 470 piksel  -> kamera sağ kenarda durur, x = 480 - 160 = 320\n```\n\nBu yüzden dünyanın kenarında boşluk görünmez. Kamerayı bırakmak için `kamera sabit kalsın` kullanılır; kamera bulunduğu yerde kalır.\n\n### Karo resimdir, sprite oyuncudur\nHaritadaki elma karosu yalnızca bir resimdir; toplama için gereken çarpışma olayına katılamaz. `tüm [Elma] karolarını [Yiyecek] sprite'ına çevir` bloğu haritadaki bütün elma karolarını boşaltır ve her birinin yerine bir **Yiyecek** sprite'ı koyar. Sprite'lar hareket edebilir, çarpışma olayına katılabilir ve silinebilir.\n\n### Sıra ve ad\n- Çevirme bloğunda tür olarak **Yiyecek** seçilmelidir; toplama kodu bu türü bekler.\n- Kameraya her zaman `kedi` değişkenini ver. `bu sprite` olay dışında en son oluşan sprite olabilir ve kamera yanlış sprite'ı izleyebilir.\n\n### Özet\nDünya haritadır, ekran ise dünyaya açılan 160 x 120'lik bir penceredir. Kamera takip ettiği sprite'ı ortada tutar ama dünyanın kenarında durur. Haritadaki karolar sprite'lara çevrilince toplanabilir ya da hareket edebilir hâle gelir.",
          "concepts": [
            {
              "term": "Dünya ve ekran",
              "definition": "Dünya haritanın tamamıdır; ekran 160 x 120 piksellik, dünyaya açılan bir penceredir.",
              "example": "30 karoluk ova 480 piksel genişliğindedir, ekranın 3 katıdır.",
              "pitfall": "Ekranı dünya sanmak: ekran dünyanın yalnız bir bölümünü gösterir."
            },
            {
              "term": "Kamera takibi",
              "definition": "`kamera [kedi] sprite'ını takip etsin` bloğu sprite'ı ekranın ortasında tutacak şekilde görüntüyü kaydırır.",
              "example": "Kedi 200 pikselde ise kamera x = 200 - 80 = 120 olur.",
              "pitfall": "Kamera bloğunu eklememek: kedi ekranın dışına çıkar ve kaybolur."
            },
            {
              "term": "Kamera sınırı",
              "definition": "Kamera dünyanın kenarında durur; dünyanın dışındaki boşluğu göstermez.",
              "example": "480 piksellik dünyada kamera x en çok 480 - 160 = 320 olur.",
              "pitfall": "Kenarda kedinin hâlâ ekranın ortasında olacağını beklemek: kenarda kedi ortadan kayar."
            },
            {
              "term": "Karoyu sprite'a çevirmek",
              "definition": "Haritadaki bir cins karoyu boşaltıp her birinin yerine bir sprite koyar.",
              "example": "Yedi elma karosu yedi Yiyecek sprite'ına dönüşür.",
              "pitfall": "Çevirmeyi unutmak: elma yalnız resim kalır, çarpışma olayı çalışmaz."
            },
            {
              "term": "Sprite türü",
              "definition": "Sprite'ın bir etiketi (oyuncu, yiyecek vb.); olaylar türe göre çalışır.",
              "example": "Toplama kodu `Yiyecek` türünü bekler.",
              "pitfall": "Çevirirken yanlış tür seçmek: elmalar toplanamaz."
            }
          ],
          "quiz": [
            {
              "id": "m11h3d14-q1",
              "kind": "numeric",
              "prompt": "Ova haritası 30 karo genişliğinde (480 piksel). Kamera kediyi takip ediyor ve kedinin merkezi x = 200 pikselde. Ekran 160 piksel genişliğinde. Kameranın x değeri kaçtır?",
              "answer": 120,
              "unit": "piksel",
              "explanation": "Kamera sprite'ı ortada tutar: 200 - 160 / 2 = 120. Bu değer 0 ile 480 - 160 = 320 arasında olduğundan sınıra takılmaz. Yalnız 200 - 160 = 40 hesabı ekranın yarısını kullanmayı unutmaktır.",
              "skills": [
                "oyun-kamera",
                "oyun-harita-izgara"
              ]
            },
            {
              "id": "m11h3d14-q2",
              "kind": "mcq",
              "prompt": "Kedi ovanın en sağ ucuna yürüdü (x = 470 piksel) ve kamera kediyi takip ediyor. Ne görürsün?",
              "options": [
                "Kamera dünyanın sağ kenarında durur; kedi ekranın ortasından biraz sağa kayar",
                "Kamera dünyanın dışını gösterir",
                "Kedi kaybolur",
                "Kamera sola geri döner"
              ],
              "answer": 0,
              "explanation": "Kamera dünyanın sınırını aşmaz: x en çok 480 - 160 = 320. Kedi bu durumda ekranda ortadan sağa doğru kayar. Boşluk gösterilmez, kedi kaybolmaz ve kamera sola dönmez.",
              "skills": [
                "oyun-kamera"
              ]
            },
            {
              "id": "m11h3d14-q3",
              "kind": "find-bug",
              "prompt": "Kamera kediyi izliyor, ama kedi elmaya değince skor artmıyor ve elma silinmiyor. Toplama kodu doğru: `Oyuncu` ile `Yiyecek` çarpışınca skor 1 artar.\n\n```\n1  oyun başlayınca\n2      haritayı yükle: [ova]\n3      kedi oluştur ve sütun [1] satır [4] karosuna koy\n4      kedi oyuncu tuşlarıyla hareket etsin\n5      kamera [kedi] sprite'ını takip etsin\n```\n\nHata nedir?",
              "options": [
                "Elma karolarını Yiyecek sprite'ına çeviren blok yok",
                "Satır 5'te kamera yanlış",
                "Kedi sütun 1'e konmamalı",
                "Harita adı yanlış"
              ],
              "answer": 0,
              "explanation": "Çarpışma olayı Yiyecek sprite'ı bekler; elma karoları ise yalnız resimdir. Çevirme bloğu eksik olduğu için olay hiç tetiklenmez. Kamera ve kedi çalışıyor, harita da yüklenmiş.",
              "skills": [
                "oyun-karo-sprite",
                "oyun-hata-ayiklama"
              ]
            },
            {
              "id": "m11h3d14-q4",
              "kind": "predict-output",
              "prompt": "Ova 30 karo genişliğinde. Bloklarda kamera bloğu yok:\n\n```\nharitayı yükle: [ova]\nkedi sütun [1] satır [4] karosuna koy\nkedi oyuncu tuşlarıyla hareket etsin\n```\n\nOyuncu kediyi sütun 12 karosuna kadar (x = 200 piksel) yürütüyor. Ekranda ne görünür?",
              "options": [
                "Kamera kediyi kendiliğinden izler",
                "Kedi sütun 9'da durur",
                "Kamera kıpırdamaz (x = 0); kedi 160 pikselden sonra ekranın sağından çıkıp görünmez olur",
                "Harita küçülür"
              ],
              "answer": 2,
              "explanation": "Kamera takip bloğu olmadan sabit kalır ve ekran dünyanın ilk 160 pikselini gösterir. Kedi 200 pikselde ekranın dışındadır. Kamerayı izleme işi kendiliğinden yapılmaz; harita da küçülmez.",
              "skills": [
                "oyun-kamera",
                "oyun-hata-ayiklama"
              ]
            },
            {
              "id": "m11h3d14-q5",
              "kind": "mcq",
              "prompt": "Elma karolarını neden `Yiyecek` sprite'larına çeviriyoruz?",
              "options": [
                "Karolar renkli olmadığı için",
                "Kamera yalnız sprite'ları gösterir",
                "Haritayı küçültmek için",
                "Sprite'lar çarpışma olayına katılabilir, hareket edebilir ve silinebilir; karo yalnız haritadaki bir resimdir"
              ],
              "answer": 3,
              "explanation": "Sprite olan elma toplama olayına katılır, hareket ettirilebilir ve silinebilir. Renk ya da kameranın neyi gösterdiği çevirmenin nedeni değildir; harita da çevirmeyle küçülmez, yalnız elma karoları boşalır.",
              "skills": [
                "oyun-karo-sprite"
              ]
            }
          ],
          "contentEn": {
            "title": "A big world, a scrolling camera",
            "problem": "Some game worlds are much bigger than the screen. The screen is 160 pixels wide, but the world might be 480 pixels. So what do we see on the screen? The camera. The camera shows one part of the world and scrolls as the player walks.",
            "contentMd": "The `ova` (plain) map is 30 tiles wide, so 480 pixels. That is three times the screen! The cat walks with the arrow keys but the camera is still, so when the cat goes right it leaves the screen and disappears. There are also 7 apple marks on the map: these are tiles with an apple picture. You will turn them into apples that can be collected.\n\n### Camera\n- The `camera follows sprite [kedi]` block ties the camera to the cat. As the cat walks, the view scrolls. If the world is smaller than the screen, the camera does not scroll.\n- The `camera stays still` block stops the following.\n- The `map [width] (tiles)` block tells you how big the map is.\n\n### Turning tiles into sprites\nThe apple tiles on the map are just pictures. To be collected, they need to be real sprites. The `turn all [Apple] tiles into [Food] sprites` block clears all the apple tiles on the map and puts a **Food** sprite in the place of each one.\n\n### Build the blocks\n1. Go to the **Map** tab and study the plain. The red dashed frame shows the first screen of the game: a very small part of the map. The trees are walls.\n2. Go back to the **Blocks** tab. Look at the blocks inside `when game starts`: the map has been loaded, the cat has been put at column 1, row 4, and it walks with the keys. The collecting event is ready too: when the cat touches a Food, the score goes up by 1 and the food is deleted.\n3. From the **Stage / Map** category, attach the `camera follows sprite [this sprite]` block at the very bottom of the inside of `when game starts`. Put the `kedi` variable in place of `this sprite`.\n4. In the same place, add the `turn all [Apple] tiles into [Food] sprites` block. Choose **Apple** as the tile and **Food** as the kind.\n5. Press the ▶ button. Walk the cat to the right. The view scrolls and you collect apples on the way.\n\nExpected result: The camera follows the cat. The 7 apples on the map turn into sprites that can be collected. When you collect an apple, the score goes up.\n\n### How does it work?\n- The camera tries to keep the sprite it follows in the middle of the screen. When it gets close to the edge of the world it stops, and it does not show empty space.\n- The map is the world; the screen is a window onto this world. With the camera, you choose where this window is.\n- After the turn-into block, no apple tiles are left on the map. The apples have become sprites. Sprites can move and take part in collision events. Tiles cannot.\n- For each sprite that is made this way, the `when a [Food] sprite is created` event runs. You can use it to give the apples movement, sound or other features.\n\n### Try it\n1. Give the apples a speed: write the `when a [Food] sprite is created` event and put `set [this sprite] speed x [0] y [20]` inside it. Do the apples slide down?\n2. Leave the camera still instead of following the cat: use `camera stays still`. What changed?\n3. In the Map tab, add new apple tiles or trees to the plain. Does it work?\n\n### Common mistakes\n- If you forget to add the camera, the cat leaves the screen.\n- If you do not turn the apple tiles into sprites, nothing happens even when the cat touches them. That is because the event waits for a Food **sprite**.\n- If you make the wrong choice of kind in the turn-into block, the apples cannot be collected. The kind must be **Food**.\n- If you put the camera block after the turn-into block and leave it as `this sprite`, the camera follows the apple made last. Always give the camera the `kedi` variable.",
            "question": "Why don't games with big worlds show the whole world on the screen? What would a game without a camera be like? In which games does the camera never scroll, with a fixed screen?",
            "explainerMd": "### What you will learn in this lesson\n- The difference between the world and the screen\n- How the camera follows a sprite and where it stops\n- Why tiles need to be turned into real sprites\n- How to put the camera and the turn-into block in the right place\n\n### What you should know first\nLesson 11 (map, tile, 16 pixels) and lesson 13 (deleting tiles from the map, score). Remember the collision event between sprites from week 2 too.\n\n### The world is big, the screen is small\nThe screen is fixed: 160 x 120 pixels. The map, though, can be bigger than this. The plain in this lesson is 30 tiles wide:\n\n```\n30 tiles x 16 pixels = 480 pixels\n480 / 160 = 3 times the width of the screen\n```\n\nThe screen is a window onto this world. The **camera** decides where in the world the window is.\n\n### The camera follows the cat\nThe `camera follows sprite [kedi]` block tries to keep the cat in the middle of the screen. The camera can scroll from the left edge of the world to the right edge; it does not go past the limit. The camera's x value is at least 0 and at most the world width minus 160.\n\n```\ncat x = 200 pixels  -> camera x = 200 - 80 = 120\ncat x = 30 pixels   -> the camera stops at the left edge, x = 0\ncat x = 470 pixels  -> the camera stops at the right edge, x = 480 - 160 = 320\n```\n\nThat is why no empty space shows at the edge of the world. To let go of the camera you use `camera stays still`; the camera stays where it is.\n\n### A tile is a picture, a sprite is a player\nThe apple tile on the map is only a picture; it cannot take part in the collision event needed for collecting. The `turn all [Apple] tiles into [Food] sprites` block clears all the apple tiles on the map and puts a **Food** sprite in the place of each one. Sprites can move, take part in collision events and be deleted.\n\n### Order and name\n- In the turn-into block, **Food** must be chosen as the kind; the collecting code waits for this kind.\n- Always give the camera the `kedi` variable. Outside an event, `this sprite` can be the sprite made last, and the camera may follow the wrong sprite.\n\n### Summary\nThe world is the map, and the screen is a 160 x 120 window onto the world. The camera keeps the sprite it follows in the middle, but it stops at the edge of the world. When the tiles on the map are turned into sprites, they can be collected or made to move.",
            "concepts": [
              {
                "term": "World and screen",
                "definition": "The world is the whole map; the screen is a 160 x 120 pixel window onto the world.",
                "example": "The 30-tile plain is 480 pixels wide, three times the screen.",
                "pitfall": "Thinking the screen is the world: the screen only shows one part of the world."
              },
              {
                "term": "Camera following",
                "definition": "The `camera follows sprite [kedi]` block scrolls the view so that it keeps the sprite in the middle of the screen.",
                "example": "If the cat is at 200 pixels, the camera x is 200 - 80 = 120.",
                "pitfall": "Not adding the camera block: the cat goes off the screen and disappears."
              },
              {
                "term": "Camera limit",
                "definition": "The camera stops at the edge of the world; it does not show the empty space outside the world.",
                "example": "In a 480 pixel world, the camera x is at most 480 - 160 = 320.",
                "pitfall": "Expecting the cat to still be in the middle of the screen at the edge: at the edge, the cat slides away from the middle."
              },
              {
                "term": "Turning tiles into sprites",
                "definition": "Clears one type of tile on the map and puts a sprite in the place of each one.",
                "example": "Seven apple tiles turn into seven Food sprites.",
                "pitfall": "Forgetting to turn them: the apple stays only a picture and the collision event does not run."
              },
              {
                "term": "Sprite kind",
                "definition": "A label of the sprite (player, food and so on); events work by kind.",
                "example": "The collecting code waits for the `Food` kind.",
                "pitfall": "Choosing the wrong kind when turning them: the apples cannot be collected."
              }
            ],
            "quiz": [
              {
                "id": "m11h3d14-q1",
                "kind": "numeric",
                "prompt": "The plain map is 30 tiles wide (480 pixels). The camera follows the cat and the cat's centre is at x = 200 pixels. The screen is 160 pixels wide. What is the camera's x value?",
                "answer": 120,
                "unit": "pixels",
                "explanation": "The camera keeps the sprite in the middle: 200 - 160 / 2 = 120. This value is between 0 and 480 - 160 = 320, so it does not hit the limit. Working out just 200 - 160 = 40 is forgetting to use half the screen.",
                "skills": [
                  "oyun-kamera",
                  "oyun-harita-izgara"
                ]
              },
              {
                "id": "m11h3d14-q2",
                "kind": "mcq",
                "prompt": "The cat has walked to the far right end of the plain (x = 470 pixels) and the camera is following the cat. What do you see?",
                "options": [
                  "The camera stops at the right edge of the world; the cat slides a little to the right of the middle of the screen",
                  "The camera shows the outside of the world",
                  "The cat disappears",
                  "The camera goes back to the left"
                ],
                "answer": 0,
                "explanation": "The camera does not go past the limit of the world: x is at most 480 - 160 = 320. In this case the cat slides from the middle towards the right of the screen. No empty space is shown, the cat does not disappear and the camera does not go back to the left.",
                "skills": [
                  "oyun-kamera"
                ]
              },
              {
                "id": "m11h3d14-q3",
                "kind": "find-bug",
                "prompt": "The camera follows the cat, but when the cat touches an apple, the score does not go up and the apple is not deleted. The collecting code is correct: when `Player` and `Food` collide, the score goes up by 1.\n\n```\n1  when game starts\n2      load map: [ova]\n3      make the cat and put it on tile column [1] row [4]\n4      the cat moves with player keys\n5      camera follows sprite [kedi]\n```\n\nWhat is the bug?",
                "options": [
                  "There is no block that turns the apple tiles into Food sprites",
                  "The camera in line 5 is wrong",
                  "The cat should not be put on column 1",
                  "The map name is wrong"
                ],
                "answer": 0,
                "explanation": "The collision event waits for a Food sprite; the apple tiles, though, are only pictures. The turn-into block is missing, so the event is never triggered. The camera and the cat work, and the map has been loaded.",
                "skills": [
                  "oyun-karo-sprite",
                  "oyun-hata-ayiklama"
                ]
              },
              {
                "id": "m11h3d14-q4",
                "kind": "predict-output",
                "prompt": "The plain is 30 tiles wide. There is no camera block in the blocks:\n\n```\nload map: [ova]\nput the cat on tile column [1] row [4]\nthe cat moves with player keys\n```\n\nThe player walks the cat to the column 12 tile (x = 200 pixels). What can be seen on the screen?",
                "options": [
                  "The camera follows the cat by itself",
                  "The cat stops at column 9",
                  "The camera does not move (x = 0); after 160 pixels the cat leaves through the right of the screen and cannot be seen",
                  "The map shrinks"
                ],
                "answer": 2,
                "explanation": "Without the follow block the camera stays still, and the screen shows the first 160 pixels of the world. At 200 pixels the cat is outside the screen. The camera does not follow by itself, and the map does not shrink.",
                "skills": [
                  "oyun-kamera",
                  "oyun-hata-ayiklama"
                ]
              },
              {
                "id": "m11h3d14-q5",
                "kind": "mcq",
                "prompt": "Why do we turn the apple tiles into `Food` sprites?",
                "options": [
                  "Because the tiles are not coloured",
                  "The camera only shows sprites",
                  "To make the map smaller",
                  "Sprites can take part in collision events, move and be deleted; a tile is only a picture on the map"
                ],
                "answer": 3,
                "explanation": "An apple that is a sprite takes part in the collecting event, can be made to move and can be deleted. The colour, or what the camera shows, is not the reason for turning them; the map does not shrink either when they are turned, only the apple tiles are cleared.",
                "skills": [
                  "oyun-karo-sprite"
                ]
              }
            ]
          }
        },
        {
          "title": "Proje: Hazine adası",
          "durationMin": 35,
          "problem": "Bu haftanın bütün parçalarını birleştirip uzun bir macera yapıyoruz. Kahraman bir adada başlıyor. Önce kapıyı açacak anahtarı bulacak, lavlardan sakınacak, elmasları toplayacak ve sonunda hazine sandığına ulaşacak. Her şey haritanın karolarıyla yapılıyor.",
          "contentMd": "Adanın haritası hazır: 20 x 10 karo. Kahraman başlangıç karosunda, ok tuşlarıyla yürüyor ve kamera onu izliyor. Skor 0, can 3. Ama hiçbir karo bir şey yapmıyor. Kuralları sen yazacaksın.\n\n### Haritadaki karolar\n- **Taş duvar:** Ortada bir duvar var ve adayı ikiye bölüyor.\n- **Kapı:** Duvarın içindeki geçit. Başlangıçta duvar gibi kapalı. Yeri: sütun 10, satır 5 (sütun ve satır 0'dan sayılır).\n- **Anahtar:** Sol yarıda bir yerde. Kapıyı açar.\n- **Lav:** Sol yarıda üç tane lav karosu var.\n- **Elmas:** Üç elmas var, ikisi sağ yarıda ve biri sol yarıda.\n- **Su:** Sağ yarıda bir su şeridi var. Su duvar gibi davranır, geçemezsin.\n- **Sandık:** Hazine sandığı, sağ yarıda bir yerde.\n\n### Kurallar\n1. Anahtara dokununca anahtar kaybolsun ve kapı açılsın.\n2. Elmasa dokununca elmas kaybolsun ve skor 1 artsın.\n3. Lava dokununca 1 can gitsin ve kahraman başlangıca dönsün.\n4. Sandığa dokununca \"Hazineyi buldun! Skor: ...\" yazsın ve oyun kazanılsın.\n\n### Önce incele\n1. ▶ düğmesine basıp adayı dolaş. Kahraman duvarlardan ve sudan geçemez. Haritanın her yerine gidemiyorsun, çünkü kapı kapalı.\n2. **Harita** sekmesine geç ve karoların yerlerini incele. Anahtar, kapı ve sandık nerede?\n\n### Anahtar ve kapı\n1. **Sahne / Harita** kategorisinden `bir [Oyuncu] sprite'ı [Anahtar] karosuna dokununca` olayını koy.\n2. İçine `sütun [olay karosunun sütunu] satır [olay karosunun satırı] karosunu boşalt` bloğunu tak. Böylece anahtar kaybolur.\n3. Altına ikinci bir `sütun [10] satır [5] karosunu boşalt` bloğu ekle. Bu, kapıyı açar. Sayıları kendin yaz.\n4. `ekranda [Kapı açıldı!] yaz, [2] saniye` ve `[güç] melodisini çal` bloklarını ekle.\n\n### Elmaslar\n1. `bir [Oyuncu] sprite'ı [Elmas] karosuna dokununca` olayını koy.\n2. İçine olay karosunu boşaltan blok, `skoru [1] değiştir` ve `[puan] melodisini çal` bloklarını koy.\n\n### Lav\n1. `bir [Oyuncu] sprite'ı [Lav] karosuna dokununca` olayını koy.\n2. İçine `canı [-1] değiştir`, `ekranı [250] ms salla`, `[patlama] melodisini çal` ve `[bu sprite] sprite'ını sütun [1] satır [1] karosuna koy` bloklarını tak.\n\n### Sandık ve kazanma\n1. `bir [Oyuncu] sprite'ı [Sandık] karosuna dokununca` olayını koy.\n2. İçine `ekranda [birleştir ...] yaz, [3] saniye` bloğunu ekle. Birleştir bloğuna önce `[Hazineyi buldun! Skor: ]` metnini, sonra `skor` bloğunu koy.\n3. `[zafer] melodisini çal` ve `oyunu bitir: [kazandın]` bloklarını ekle.\n\n### Çalıştır ve dene\n1. ↺ düğmesine bas. Önce lavlardan birine dokun. Sonra anahtarı al, kapıdan geç, elmasları topla ve sandığa ulaş.\n2. Hedefler panelindeki altı maddenin hepsi yeşil mi?\n\nBeklenen sonuç: Anahtarı alınca kapı açılır. Elmaslar skoru artırır. Lav can götürüp başa gönderir. Sandığa dokununca skorlu bir mesajla oyun kazanılır.\n\n### Nasıl çalışıyor?\n- Bu oyunun her kuralı bir **karo olayıdır**. Haritanın karoları oyunun kurallarını taşır. Yeni bir kural eklemek için yalnız yeni bir karo çizip bir olay yazarsın.\n- Anahtar-kapı sistemi, bir olayın başka bir yeri değiştirmesinin örneğidir: anahtara dokunmak başka bir yerdeki kapıyı yok eder.\n- Kapı başlangıçta **duvar kutusu işaretli** bir karodur. Karo silinince duvar da kaybolur ve yol açılır.\n- Kamera adanın dışını göstermez. Harita 320 x 160 piksel olduğundan ekran yalnız bir bölümü görür.\n\n### Kendi dokunuşunu kat\n1. Haritayı düzenle: Harita sekmesinde yeni bir lav, elmas ya da duvar boya. Sandığa giden yol hâlâ açık mı?\n2. Lav daha çok can götürsün ya da başlangıç canı 5 olsun.\n3. Elmas toplayınca `ekranda [Parlak!] yaz, [1] saniye` mesajı çıksın.\n4. Kapıyı daha kalın bir duvarla kapat ve anahtarı daha uzağa koy. Oyun zorlaştı mı?\n\n### Sık yapılan hatalar\n- Kapı için sütun ve satırı yanlış yazarsan başka bir karo silinir. Harita sekmesinde sütun ve satırı say; ilk karo 0'dır.\n- Anahtar olayında olay karosunu silmeyi unutursan anahtar yerinde kalır ve hedef yeşile dönmez.\n- Skor mesajında `birleştir` bloğunun yuvalarını doldurmayı unutursan mesaj eksik çıkar.\n- Lavda `[bu sprite]` yerine başka bir sprite adı yazarsan yanlış sprite taşınır.",
          "question": "Bir haritayı oyun yapan şey nedir? Karoların görevleri mi, yoksa bloklarla yazdığın olaylar mı? Hazine adasına başka hangi karo türleri eklersen oyun daha ilginç olur?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Bir oyunun kurallarını karo olaylarına bölmeyi\n- Anahtar-kapı gibi bir olayın başka bir yeri değiştirmesini\n- Kural tablosuyla önce planlayıp sonra blokları kurmayı\n- Haritayı değiştirip oyunu zorlaştırmayı ya da kolaylaştırmayı\n\n### Önceden bilmen gerekenler\nDers 11-14: harita ve duvar (11), karoya dokununca olayı (12), olay karosunu boşaltma, sayarak kazanma ve lav (13), kamera (14). Bu ders hepsini birleştirir.\n\n### Önce kural tablosu\nHazine adasında dört kural vardır. Blokları kurmadan önce hangi karoda ne olacağını tabloya yaz:\n\n| Karo | Dokununca ne olur? |\n|---|---|\n| Anahtar | Anahtar kaybolur, kapı karosu (sütun 10, satır 5) kaybolur |\n| Elmas | Elmas kaybolur, skor 1 artar |\n| Lav | Can 1 azalır, kahraman başa döner |\n| Sandık | Skorlu mesaj yazılır, oyun kazanılır |\n\nHer satır bir olaydır: toplam dört `karosuna dokununca` bloğu.\n\n### Bir olay başka bir yeri değiştirir\nAnahtar olayında iki karo boşaltılır. İlki dokunduğun anahtardır; bunu olay karosunun sütunu ve satırı ile yaparsın. İkincisi kapıdır; yeri sabittir, o yüzden sayıları kendin yazarsın: sütun 10, satır 5. Kapı karosu duvar kutusu işaretli olduğu için kahramanı durdurur. Karo silinince duvar da kalkar ve geçit açılır.\n\nSütun ile satırı karıştırma. Adada 20 sütun ve 10 satır vardır. Sütun 10 satır 5 ile sütun 5 satır 10 farklı yerlerdir. İkincisi haritanın dışındadır ve hiçbir karo silinmez.\n\n### Büyük ada, kayan kamera\nHarita 20 x 10 karodur: 320 x 160 piksel. Ekran 160 x 120 olduğundan kamera kahramanı izler. Kamera x en çok 320 - 160 = 160, kamera y en çok 160 - 120 = 40 olabilir.\n\n### Kazandığını göster\nSandık olayındaki mesaj `birleştir` bloğuyla yapılır: önce `Hazineyi buldun! Skor: ` metni, sonra `skor` bloğu. Üç elmas varsa ve her biri 1 puansa, mesajda 3 yazar. Elmas değerini 2 yaparsan mesajda 6 yazar; mesaj skoru kendisi okur.\n\n### Özet\nOyunun kuralları karo olaylarıdır. Önce tablo yaparsın, sonra her satırı bir olay bloğuna çevirirsin. Anahtar-kapı sisteminde bir olay başka bir karoyu siler. Kamera, kural tablosundaki işin görünmesini sağlar.",
          "concepts": [
            {
              "term": "Kural tablosu",
              "definition": "Her karo için dokununca ne olacağını yazdığın plan.",
              "example": "Anahtar: anahtar ve kapı silinir. Elmas: skor +1. Lav: can -1 ve başa dön. Sandık: oyunu kazan.",
              "pitfall": "Plansız bloklara başlamak: bir kuralı unutur ya da çakıştırırsın."
            },
            {
              "term": "Anahtar-kapı sistemi",
              "definition": "Bir karoya dokunmak başka bir yerdeki karoyu silerek yeni yol açar.",
              "example": "Anahtara dokununca sütun 10 satır 5 karosu (kapı) boşalır.",
              "pitfall": "Kapının sütun ve satırını yanlış yazmak: kapı açılmaz ya da başka bir karo silinir."
            },
            {
              "term": "Kapı karosu",
              "definition": "Duvar kutusu işaretli bir karo; silinince duvar da kalkar ve geçit açılır.",
              "example": "Adanın ortasındaki duvarda tek geçit kapıdır.",
              "pitfall": "Kapıyı hiç silmemek: sandığın bulunduğu yarıya geçilemez."
            },
            {
              "term": "Mesaja skor katmak",
              "definition": "`birleştir` bloğu metin ile skor bloğunu tek mesajda birleştirir.",
              "example": "`Hazineyi buldun! Skor: ` + skor, skor 3 ise `Hazineyi buldun! Skor: 3` yazar.",
              "pitfall": "Birleştir bloğunun yuvalarını doldurmamak: mesaj eksik çıkar."
            },
            {
              "term": "Karo kuralları",
              "definition": "Oyunun kuralları haritadaki karoların olaylarında yaşar; yeni kural için yeni karo ve olay eklenir.",
              "example": "Haritaya yeni bir lav karosu çizmek tehlikeyi artırır; yeni olay gerekmez, mevcut lav olayı yeterlidir.",
              "pitfall": "Yeni bir karo türü çizip ona ait bir olay yazmamak: karo hiçbir şey yapmaz."
            }
          ],
          "quiz": [
            {
              "id": "m11h3d15-q1",
              "kind": "numeric",
              "prompt": "Hazine adası haritası 20 x 10 karodur (karo 16 piksel). Ekran 160 x 120 piksel. Kameranın x değeri en çok kaç olabilir?",
              "answer": 160,
              "unit": "piksel",
              "explanation": "Dünya genişliği 20 x 16 = 320 piksel. Kamera en çok dünya eksi ekran kadar kayar: 320 - 160 = 160. 320 yazarsan kameranın dünyanın dışına çıkmasına izin vermiş olursun.",
              "skills": [
                "oyun-kamera",
                "oyun-harita-izgara"
              ]
            },
            {
              "id": "m11h3d15-q2",
              "kind": "find-bug",
              "prompt": "Kahraman anahtarı alıyor, anahtar kayboluyor ama kapı açılmıyor. Kapı sütun 10, satır 5 karosunda.\n\n```\n1  bir [Oyuncu] sprite'ı [Anahtar] karosuna dokununca\n2      sütun [olay karosunun sütunu] satır [olay karosunun satırı] karosunu boşalt\n3      sütun [5] satır [10] karosunu boşalt\n4      ekranda [Kapı açıldı!] yaz, [2] saniye\n```\n\nHatalı satır hangisidir?",
              "options": [
                "Satır 1",
                "Satır 2",
                "Satır 3: sütun ile satır yer değiştirmiş",
                "Satır 4"
              ],
              "answer": 2,
              "explanation": "Kapı sütun 10, satır 5'tir ama satır 3'te sütun 5, satır 10 yazılmış. Ada 10 satırlıdır (0-9), bu yüzden satır 10 haritanın dışındadır ve hiçbir karo silinmez. Anahtarın silinmesi satır 2'nin doğru çalıştığını gösterir.",
              "skills": [
                "oyun-hata-ayiklama",
                "oyun-olay-karosu"
              ]
            },
            {
              "id": "m11h3d15-q3",
              "kind": "mcq",
              "prompt": "Anahtar alınca kapının açılmasını en iyi hangisi açıklar?",
              "options": [
                "Kahraman daha hızlı yürüdüğü için",
                "Kapı, duvar kutusu işaretsiz olduğu için kendiliğinden açılır",
                "Kamera kapıyı gizler",
                "Anahtar olayı kapı karosunu haritadan siler; duvar kutusu işaretli karo silinince duvar da kalkar"
              ],
              "answer": 3,
              "explanation": "Kapı duvar olarak çizilmiştir ve ancak karo silinince yol açılır. Kapı baştan geçilebilir olsaydı kilit anlamsız olurdu. Hız ve kamera kapının açılmasıyla ilgili değildir.",
              "skills": [
                "oyun-olay-karosu",
                "oyun-karo-olay"
              ]
            },
            {
              "id": "m11h3d15-q4",
              "kind": "numeric",
              "prompt": "Elmas olayını `skoru [2] değiştir` yaptın. Kahraman üç elmasın hepsini topladı, lava hiç dokunmadı ve sandığa ulaştı. Sandık mesajı `Hazineyi buldun! Skor: ` ve skor bloğunu birleştiriyor. Mesajdaki skor kaçtır?",
              "answer": 6,
              "unit": "puan",
              "explanation": "Üç elmas x 2 puan = 6. Mesaj skoru kendisi okur, o yüzden olayı değiştirince mesaj kendiliğinden güncellenir. Elmas değerini unutup 3 yazmak eski kuralı kullanmaktır.",
              "skills": [
                "oyun-kural-planlama",
                "oyun-kazanma-kosulu"
              ]
            },
            {
              "id": "m11h3d15-q5",
              "kind": "predict-output",
              "prompt": "Adada üç lav karosu var. Lav olayı `canı -1 değiştir` yapar ve kahramanı başlangıç karosuna (sütun 1, satır 1) gönderir. Başlangıçta can 3. Kahraman sırayla üç farklı lav karosuna dokunuyor. Başka hiçbir blok yazılmadı. Ne olur?",
              "options": [
                "Can 0 olur ve oyun kaybedilir",
                "Can 3 kalır",
                "Can -3 olur ve oyun devam eder",
                "Oyun kazanılır"
              ],
              "answer": 0,
              "explanation": "Her lavda can 1 azalır: 3 - 3 = 0. Can 0 olunca, `can bitince` olayı yazılmamışsa oyun kendiliğinden kaybedilir. Canın sıfırın altına inmesi ve oyunun devam etmesi beklenmez; kazanma için sandığa ulaşmak gerekir.",
              "skills": [
                "oyun-karo-olay",
                "oyun-kazanma-kosulu"
              ]
            }
          ],
          "contentEn": {
            "title": "Project: Treasure island",
            "problem": "We are bringing together all of this week's pieces to make a long adventure. The hero starts on an island. First they will find the key that opens the door, avoid the lava, collect the diamonds and finally reach the treasure chest. Everything is made with the map's tiles.",
            "contentMd": "The island map is ready: 20 x 10 tiles. The hero is on the start tile, walks with the arrow keys and the camera follows them. The score is 0 and the lives are 3. But no tile does anything. You will write the rules.\n\n### The tiles on the map\n- **Stone wall:** There is a wall in the middle that splits the island in two.\n- **Door:** The way through in the wall. At the start it is closed like a wall. Its place: column 10, row 5 (columns and rows are counted from 0).\n- **Key:** Somewhere in the left half. It opens the door.\n- **Lava:** There are three lava tiles in the left half.\n- **Diamond:** There are three diamonds, two in the right half and one in the left half.\n- **Water:** There is a strip of water in the right half. Water behaves like a wall; you cannot get through.\n- **Chest:** The treasure chest, somewhere in the right half.\n\n### Rules\n1. When you touch the key, the key disappears and the door opens.\n2. When you touch a diamond, the diamond disappears and the score goes up by 1.\n3. When you touch lava, 1 life goes and the hero goes back to the start.\n4. When you touch the chest, it says \"You found the treasure! Score: ...\" and the game is won.\n\n### Look first\n1. Press the ▶ button and explore the island. The hero cannot go through walls or water. You cannot go everywhere on the map, because the door is closed.\n2. Go to the **Map** tab and study where the tiles are. Where are the key, the door and the chest?\n\n### Key and door\n1. From the **Stage / Map** category, put in the `when a [Player] sprite touches tile [Key]` event.\n2. Attach the `clear tile at column [event tile column] row [event tile row]` block inside it. This way the key disappears.\n3. Underneath, add a second `clear tile at column [10] row [5]` block. This opens the door. Type the numbers yourself.\n4. Add the `show [The door is open!] on screen for [2] seconds` and `play melody [power up]` blocks.\n\n### Diamonds\n1. Put in the `when a [Player] sprite touches tile [Diamond]` event.\n2. Inside it, put the block that clears the event tile, `change score by [1]` and `play melody [point]`.\n\n### Lava\n1. Put in the `when a [Player] sprite touches tile [Lava]` event.\n2. Inside it, attach the `change lives by [-1]`, `shake screen for [250] ms`, `play melody [boom]` and `put sprite [this sprite] on tile column [1] row [1]` blocks.\n\n### Chest and winning\n1. Put in the `when a [Player] sprite touches tile [Chest]` event.\n2. Inside it, add the `show [create text with ...] on screen for [3] seconds` block. In the create text block, put first the text `[You found the treasure! Score: ]`, then the `score` block.\n3. Add the `play melody [victory]` and `end game: [you win]` blocks.\n\n### Run it and try it\n1. Press the ↺ button. First touch one of the lava tiles. Then get the key, go through the door, collect the diamonds and reach the chest.\n2. Are all six items in the Goals panel green?\n\nExpected result: When you get the key, the door opens. Diamonds raise the score. Lava takes a life and sends you back to the start. When you touch the chest, the game is won with a message showing the score.\n\n### How does it work?\n- Every rule in this game is a **tile event**. The map's tiles carry the rules of the game. To add a new rule, you just draw a new tile and write an event.\n- The key and door system is an example of one event changing another place: touching the key removes the door somewhere else.\n- At the start, the door is a tile with its **wall box ticked**. When the tile is deleted, the wall disappears too and the way opens.\n- The camera does not show the outside of the island. The map is 320 x 160 pixels, so the screen only sees part of it.\n\n### Add your own touch\n1. Edit the map: in the Map tab, paint a new lava, diamond or wall. Is the path to the chest still open?\n2. Make the lava take more lives, or make the starting lives 5.\n3. When you collect a diamond, show the message `show [Shiny!] on screen for [1] seconds`.\n4. Close the door off with a thicker wall and put the key further away. Did the game get harder?\n\n### Common mistakes\n- If you write the wrong column and row for the door, another tile is deleted. Count the column and row in the Map tab; the first tile is 0.\n- If you forget to delete the event tile in the key event, the key stays where it is and the goal does not turn green.\n- If you forget to fill the slots of the `create text with` block in the score message, the message comes out incomplete.\n- If you write another sprite's name instead of `[this sprite]` in the lava event, the wrong sprite is moved.",
            "question": "What turns a map into a game? The jobs of the tiles, or the events you write with blocks? What other kinds of tile could you add to treasure island to make the game more interesting?",
            "explainerMd": "### What you will learn in this lesson\n- How to split a game's rules into tile events\n- How one event, like key and door, changes another place\n- How to plan with a rule table first and then build the blocks\n- How to make the game harder or easier by changing the map\n\n### What you should know first\nLessons 11-14: map and walls (11), the touching a tile event (12), clearing the event tile, winning by counting and lava (13), the camera (14). This lesson brings them all together.\n\n### Rule table first\nThere are four rules on treasure island. Before you build the blocks, write in a table what will happen on which tile:\n\n| Tile | What happens when you touch it? |\n|---|---|\n| Key | The key disappears, the door tile (column 10, row 5) disappears |\n| Diamond | The diamond disappears, the score goes up by 1 |\n| Lava | The lives go down by 1, the hero goes back to the start |\n| Chest | A message with the score is written, the game is won |\n\nEach row is an event: four `touches tile` blocks in total.\n\n### One event changes another place\nIn the key event, two tiles are cleared. The first is the key you touched; you do this with the event tile's column and row. The second is the door; its place is fixed, so you type the numbers yourself: column 10, row 5. The door tile has its wall box ticked, so it stops the hero. When the tile is deleted, the wall goes too and the way through opens.\n\nDo not mix up the column and the row. The island has 20 columns and 10 rows. Column 10 row 5 and column 5 row 10 are different places. The second one is outside the map, and no tile is deleted.\n\n### Big island, scrolling camera\nThe map is 20 x 10 tiles: 320 x 160 pixels. The screen is 160 x 120, so the camera follows the hero. The camera x can be at most 320 - 160 = 160, and the camera y at most 160 - 120 = 40.\n\n### Show that you have won\nThe message in the chest event is made with the `create text with` block: first the text `You found the treasure! Score: `, then the `score` block. If there are three diamonds and each one is worth 1 point, the message says 3. If you make the diamond's value 2, the message says 6; the message reads the score itself.\n\n### Summary\nThe game's rules are tile events. First you make a table, then you turn each row into an event block. In the key and door system, one event deletes another tile. The camera lets you see the work from the rule table.",
            "concepts": [
              {
                "term": "Rule table",
                "definition": "The plan in which you write what will happen when each tile is touched.",
                "example": "Key: the key and the door are deleted. Diamond: score +1. Lava: lives -1 and back to the start. Chest: win the game.",
                "pitfall": "Starting on the blocks without a plan: you forget a rule or make two rules clash."
              },
              {
                "term": "Key and door system",
                "definition": "Touching one tile opens a new way by deleting a tile somewhere else.",
                "example": "When you touch the key, the tile at column 10 row 5 (the door) is cleared.",
                "pitfall": "Writing the wrong column and row for the door: the door does not open, or another tile is deleted."
              },
              {
                "term": "Door tile",
                "definition": "A tile with its wall box ticked; when it is deleted, the wall goes too and the way through opens.",
                "example": "The only way through the wall in the middle of the island is the door.",
                "pitfall": "Never deleting the door: you cannot get to the half where the chest is."
              },
              {
                "term": "Adding the score to a message",
                "definition": "The `create text with` block joins text and the score block into one message.",
                "example": "`You found the treasure! Score: ` + score; if the score is 3, it writes `You found the treasure! Score: 3`.",
                "pitfall": "Not filling the slots of the create text block: the message comes out incomplete."
              },
              {
                "term": "Tile rules",
                "definition": "The game's rules live in the events of the tiles on the map; for a new rule, a new tile and event are added.",
                "example": "Drawing a new lava tile on the map adds more danger; no new event is needed, the existing lava event is enough.",
                "pitfall": "Drawing a new kind of tile and not writing an event for it: the tile does nothing."
              }
            ],
            "quiz": [
              {
                "id": "m11h3d15-q1",
                "kind": "numeric",
                "prompt": "The treasure island map is 20 x 10 tiles (a tile is 16 pixels). The screen is 160 x 120 pixels. What is the largest value the camera's x can be?",
                "answer": 160,
                "unit": "pixels",
                "explanation": "The world width is 20 x 16 = 320 pixels. The camera scrolls at most the world minus the screen: 320 - 160 = 160. If you write 320, you have let the camera go outside the world.",
                "skills": [
                  "oyun-kamera",
                  "oyun-harita-izgara"
                ]
              },
              {
                "id": "m11h3d15-q2",
                "kind": "find-bug",
                "prompt": "The hero gets the key and the key disappears, but the door does not open. The door is on the tile at column 10, row 5.\n\n```\n1  when a [Player] sprite touches tile [Key]\n2      clear tile at column [event tile column] row [event tile row]\n3      clear tile at column [5] row [10]\n4      show [The door is open!] on screen for [2] seconds\n```\n\nWhich line is wrong?",
                "options": [
                  "Line 1",
                  "Line 2",
                  "Line 3: the column and row have been swapped",
                  "Line 4"
                ],
                "answer": 2,
                "explanation": "The door is at column 10, row 5, but line 3 says column 5, row 10. The island has 10 rows (0-9), so row 10 is outside the map and no tile is deleted. The key being deleted shows that line 2 works correctly.",
                "skills": [
                  "oyun-hata-ayiklama",
                  "oyun-olay-karosu"
                ]
              },
              {
                "id": "m11h3d15-q3",
                "kind": "mcq",
                "prompt": "Which best explains why the door opens when the key is taken?",
                "options": [
                  "Because the hero walks faster",
                  "The door opens by itself because its wall box is not ticked",
                  "The camera hides the door",
                  "The key event deletes the door tile from the map; when a tile with a ticked wall box is deleted, the wall goes too"
                ],
                "answer": 3,
                "explanation": "The door is drawn as a wall, and the way only opens when the tile is deleted. If the door could be passed from the start, the lock would be pointless. The speed and the camera have nothing to do with the door opening.",
                "skills": [
                  "oyun-olay-karosu",
                  "oyun-karo-olay"
                ]
              },
              {
                "id": "m11h3d15-q4",
                "kind": "numeric",
                "prompt": "You changed the diamond event to `change score by [2]`. The hero collected all three diamonds, never touched lava and reached the chest. The chest message joins `You found the treasure! Score: ` and the score block. What score does the message show?",
                "answer": 6,
                "unit": "points",
                "explanation": "Three diamonds x 2 points = 6. The message reads the score itself, so when you change the event, the message updates by itself. Forgetting the diamond's value and writing 3 is using the old rule.",
                "skills": [
                  "oyun-kural-planlama",
                  "oyun-kazanma-kosulu"
                ]
              },
              {
                "id": "m11h3d15-q5",
                "kind": "predict-output",
                "prompt": "There are three lava tiles on the island. The lava event does `change lives by -1` and sends the hero to the start tile (column 1, row 1). At the start the lives are 3. The hero touches three different lava tiles in turn. No other blocks have been written. What happens?",
                "options": [
                  "The lives become 0 and the game is lost",
                  "The lives stay at 3",
                  "The lives become -3 and the game goes on",
                  "The game is won"
                ],
                "answer": 0,
                "explanation": "On each lava the lives go down by 1: 3 - 3 = 0. When the lives reach 0, if no `when lives run out` event has been written, the game is lost by itself. The lives are not expected to go below zero with the game carrying on; to win, you need to reach the chest.",
                "skills": [
                  "oyun-karo-olay",
                  "oyun-kazanma-kosulu"
                ]
              }
            ]
          }
        }
      ]
    },
    {
      "title": "Düşman ve zekâ",
      "project": "Hayalet avcısı",
      "guideMd": "### Hafta hedefleri\nBu haftanın sonunda öğrenci:\n1. Zamanlayıcı olayıyla (`her ... ms'de bir`) ve `hızı ters çevir` bloğuyla bir düşmana devriye düzeni verebilir; hız, süre ve yol ilişkisini hesaplayabilir.\n2. `takip etsin` ve `arası mesafe` bloklarıyla \"yakınsa kovala, uzaksa dur\" kuralını kurabilir; `dursun` ile `takibi bıraksın` farkını açıklayabilir.\n3. Yönü derece olarak (0 yukarı, 90 sağ, 180 aşağı, 270 sol) okuyabilir ve rastgele sayıyla düşmana tahmin edilmesi zor bir hareket verebilir.\n4. A düğmesine basınca mermi sprite'ı yaratabilir; Mermi ve Düşman türleriyle çarpışma kuralı yazabilir; kullanılmayan mermileri silebilir.\n5. Devriye, takip, ateş, skor ve can kurallarını birleştirerek \"Hayalet avcısı\" oyununu tamamlayabilir.\n\n### Haftanın planı\nHafta beş derstir; her ders 20-35 dakikadır. Aşağıdaki plan günde bir ders içindir.\n\n| Gün | Ders | Süre | Ne yapılır |\n|---|---|---|---|\n| 1 | Devriye: düşman gidip gelir | ~20 dk | Anlatımı oku, yarasayı zamanlayıcıyla gidip gelir yap, süreyi değiştirip yolu hesapla, mini testi çöz. |\n| 2 | Takip: hayalet seni kovalıyor | ~20 dk | Takip ve mesafe bloklarını dene, uyanma mesafesini 40 ve 100 yap, farkı konuş. |\n| 3 | Rastgele hareket: şaşkın yarasa | ~20 dk | Rastgele yön kur, zamanlayıcıyı 300 ve 2000 ms yap, hangisinin daha tehlikeli olduğunu söyle. |\n| 4 | Ateş etme: lazerle vur | ~25 dk | Lazeri yarat, hızını ve türünü ayarla, vurma kuralını kur, mermiyi sil. |\n| 5 | Proje: Hayalet avcısı | ~35 dk | Planı tabloya yaz, beş parçayı tek tek kur, oyna ve ölçütle değerlendir. |\n\n### Ön koşul kontrolü\nBu hafta 1-3. haftalardaki şu becerilere dayanır; başlamadan önce kontrol et:\n- Bir sprite yaratıp ona tür verebiliyor mu? (Düşman, Oyuncu, Mermi)\n- Bir sprite'a hız verip ekranda kalmasını ya da sekmesini ayarlayabiliyor mu?\n- Bir `eğer ... değilse` bloğu kurabiliyor mu?\n- Çarpışma olayı, skor ve can bloklarını biliyor mu?\n- Değişken oluşturup sprite'ı değişkenle seçebiliyor mu?\n\n### Kavram haritası\n- **Zaman:** `her karede` (saniyede 60) · `her N ms'de bir` (milisaniye) · yol = hız x süre\n- **Hareket:** hız (x, y) · yön (derece) · ters çevirme · takip · dursun\n- **Zekâ:** devriye (kendi düzeni) · algılama eşiği (mesafe < N) · rastgelelik (tohumlu formül)\n- **Mermi:** düğmeye basılınca yeni sprite · tür (Mermi) · bu sprite / diğer sprite · silme\n- **Oyun:** plan tablosu · paylaşılan tür · skor ve kazanma · can ve kaybetme\n\n### Sık yapılan hatalar\n- **Hızı ters çevirmek yerine hızı yeniden yazmak.** Zamanlayıcıda \"x hızı 40\" yarasayı döndürmez.\n- **Ters çevirmede yanlış eksen.** y (dikey) seçiliyse yatay hız hiç değişmez.\n- **Milisaniyeyi saniye sanmak.** 1500 ms bir buçuk saniyedir; yol hesabından önce saniyeye çevir.\n- **Takip bloğunun iki kutusuna aynı sprite'ı koymak.** Sprite kendini takip eder ve kıpırdamaz.\n- **`dursun` yerine `takibi bıraksın`.** Hayalet son hızıyla kaymaya devam eder.\n- **Mesafe denetimini `oyun başlayınca` içine koymak.** Kural yalnız bir kez sınanır.\n- **Yön için 1-100 gibi küçük bir aralık.** Yön için 0-359 gerekir.\n- **Lazeri Nesne türünde yaratmak.** Çarpışma kuralı Mermi türünü bekler ve çalışmaz.\n- **Mermiyi hiç silmemek.** Vuran lazeri `sil`, kaçanı `dünyadan çıkınca silinsin` ile temizle.\n- **Kazanma denetimini skorun değişmediği yere koymak.** Oyun hiç bitmeyebilir.\n\n### Hafta sonu tekrarı\n1. Her dersin kavram kartlarına bir kez daha bak ve \"sık yapılan yanlış\" satırlarını yüksek sesle oku.\n2. Mini testlerde yanlış yaptığın soruların açıklamalarını yeniden oku, sonra soruyu yeniden çöz.\n3. Devriye yarasasını bakmadan sıfırdan kur; zamanlayıcıyı 1000 ve 2000 ms yapıp yarasanın bir yönde kaç piksel gittiğini hesapla, sonra çalıştırıp kontrol et.\n4. Hayaletin uyanma mesafesini 40, 70 ve 100 yap; hangisinde oyun adil geliyor, nedenini bir cümleyle yaz.\n5. Kendi cümlelerinle şu soruyu cevapla: \"Çarpışma kuralı neden sprite'ın adına değil türüne bakar?\"\n6. Yeni bir düşman türü düşün (örneğin örümcek) ve onun için bir plan tablosu çiz.\n\nHafta sonu testi olarak beş dersin mini testleri yeterlidir; her derste 5 soru, toplam 25 soru. Hedef: her dersten en az 4 doğru. Eksik kalan dersin anlatımına dön.\n\n### Proje değerlendirme ölçütü (Hayalet avcısı)\n| Ölçüt | Gelişmeli | Yeterli | İleri |\n|---|---|---|---|\n| Düşmanlar | Yarasa ya da hayaletlerden biri çalışmıyor | Yarasa sekiyor, hayaletler üstten gelip avcıyı takip ediyor | Hayaletlerin hızı ve üretim aralığı oyunu dengeli kılacak biçimde ayarlanmış |\n| Ateş | A'ya basınca lazer çıkmıyor ya da yanlış yöne gidiyor | Lazer avcının burnundan yukarı gidiyor ve ekrandan çıkınca siliniyor | İki lazer ya da B düğmesi gibi bir ekleme yapılmış |\n| Çarpışma ve skor | Vuruş skor vermiyor ya da lazer silinmiyor | Vuruş 1 puan veriyor, lazer ve hayalet kalkıyor | Kazanma ve kaybetme mesajları var |\n| Can | Düşman değince can değişmiyor | Can azalıyor, ekran sallanıyor, düşman siliniyor | `can bitince` ile oyun bitiyor |\n| Anlatım | Ne yaptığını anlatamıyor | Beş parçayı ve olaylarını anlatıyor | Bir hata yapıp nasıl bulduğunu anlatıyor |\n\n### Veli ve öğretmen notu\n- **Amaç.** Bu hafta çocuk \"kural koyma\" fikrini öğrenir: düşmanı bir zamanlayıcı, bir mesafe ya da bir rastgele sayı yönetir. Kod yazmak yerine blok sürüklendiği için sonuç hemen ekranda görülür.\n- **Nasıl destek olunur?** Takıldığında cevabı söylemek yerine şunları sor: \"Hangi olay bu bloğu çalıştırıyor?\", \"Hızın işareti ne?\", \"Sprite'ın türü ne?\", \"Bu blok olayın içinde mi?\"\n- **Hata yapmak güvenlidir.** Her şey sanaldır; ↺ düğmesi oyunu başa sardığında hiçbir şey bozulmaz. Blok değişikliği çalışan oyuna yansımaz, önce ↺ gerekir.\n- **Sayılar.** Hız ve yol hesapları dört işlemle yapılır; mesafe sorusu Pisagor'u hazır bilmeyi gerektirmez, sayıları verilen örneklerdeki gibi 3-4-5 oranına yakın seçilmiştir.\n- **Düşman tasarımı.** Oyunun adil olması önemli bir tasarım sorusudur; çocukla \"bu düşmandan kaçmak mümkün mü?\" sorusunu konuşmak hem matematik hem tasarım düşüncesi kazandırır.\n- **İlerleme.** Mini test sonuçları \"İlerlemem\" sayfasında beceri bazında görünür (taslak/pilot özellik; yalnız onay verildiyse kaydedilir).",
      "guideMdEn": "### Goals for the week\nBy the end of this week the learner can:\n1. Give an enemy a patrol pattern with the timer event (`every ... ms`) and the `reverse speed` block, and calculate the link between speed, time and distance.\n2. Build the rule \"chase if near, stop if far\" with the `follows sprite` and `distance from` blocks, and explain the difference between `stops` and `stops following`.\n3. Read direction in degrees (0 up, 90 right, 180 down, 270 left) and give an enemy movement that is hard to predict with a random number.\n4. Create a bullet sprite when the A button is pressed, write a collision rule with the Bullet and Enemy kinds, and delete bullets that are no longer used.\n5. Finish the \"Ghost hunter\" game by combining the patrol, follow, shooting, score and lives rules.\n\n### Plan for the week\nThe week has five lessons; each lesson takes 20-35 minutes. The plan below is for one lesson a day.\n\n| Day | Lesson | Time | What to do |\n|---|---|---|---|\n| 1 | Patrol: the enemy goes back and forth | ~20 min | Read the explainer, make the bat go back and forth with a timer, change the time and calculate the distance, do the mini quiz. |\n| 2 | Follow: the ghost chases you | ~20 min | Try the follow and distance blocks, set the wake-up distance to 40 and 100, talk about the difference. |\n| 3 | Random movement: the confused bat | ~20 min | Build a random direction, set the timer to 300 and 2000 ms, say which one is more dangerous. |\n| 4 | Shooting: hit it with a laser | ~25 min | Create the laser, set its speed and kind, build the hit rule, delete the bullet. |\n| 5 | Project: Ghost hunter | ~35 min | Write the plan in a table, build the five parts one by one, play, and assess with the rubric. |\n\n### Prerequisite check\nThis week builds on these skills from weeks 1-3; check them before you start:\n- Can they create a sprite and give it a kind? (Enemy, Player, Bullet)\n- Can they give a sprite a speed and make it stay on screen or bounce?\n- Can they build an `if ... else` block?\n- Do they know the collision event and the score and lives blocks?\n- Can they create a variable and choose a sprite with a variable?\n\n### Concept map\n- **Time:** `every frame` (60 a second) · `every N ms` (milliseconds) · distance = speed x time\n- **Movement:** speed (x, y) · direction (degrees) · reversing · following · stops\n- **Brains:** patrol (its own pattern) · detection threshold (distance < N) · randomness (a formula with a seed)\n- **Bullet:** new sprite when a button is pressed · kind (Bullet) · this sprite / other sprite · deleting\n- **Game:** plan table · shared kind · score and winning · lives and losing\n\n### Common mistakes\n- **Writing the speed again instead of reversing it.** \"x speed 40\" in the timer does not turn the bat round.\n- **The wrong axis when reversing.** If y (up-down) is selected, the sideways speed never changes.\n- **Thinking milliseconds are seconds.** 1500 ms is one and a half seconds; change to seconds before working out the distance.\n- **Putting the same sprite in both slots of the follow block.** The sprite follows itself and does not move.\n- **`stops following` instead of `stops`.** The ghost keeps sliding at its last speed.\n- **Putting the distance check inside `when game starts`.** The rule is only tested once.\n- **A small range such as 1-100 for direction.** Direction needs 0-359.\n- **Creating the laser with the Object kind.** The collision rule expects the Bullet kind and does not run.\n- **Never deleting bullets.** Clear away the laser that hits with `delete`, and the one that misses with `delete when it leaves the world`.\n- **Putting the win check where the score does not change.** The game may never end.\n\n### End-of-week review\n1. Look at each lesson's concept cards once more and read the \"common mistake\" lines out loud.\n2. Read again the explanations of the mini quiz questions you got wrong, then answer the question again.\n3. Build the patrol bat from scratch without looking; set the timer to 1000 and 2000 ms and work out how many pixels the bat goes in one direction, then run it and check.\n4. Set the ghost's wake-up distance to 40, 70 and 100; write in one sentence which one makes the game feel fair, and why.\n5. Answer this question in your own words: \"Why does the collision rule look at a sprite's kind and not its name?\"\n6. Think of a new kind of enemy (for example, a spider) and draw a plan table for it.\n\nAs an end-of-week test, the five lessons' mini quizzes are enough: 5 questions in each lesson, 25 questions in total. Target: at least 4 correct in each lesson. Go back to the explainer of any lesson that falls short.\n\n### Project rubric (Ghost hunter)\n| Criterion | Developing | Secure | Advanced |\n|---|---|---|---|\n| Enemies | The bat or one of the ghosts does not work | The bat bounces; the ghosts come from the top and follow the hunter | The ghosts' speed and making interval are set so that the game is balanced |\n| Shooting | No laser comes out when A is pressed, or it goes the wrong way | The laser goes up from the hunter's nose and is deleted when it leaves the screen | An extra has been added, such as two lasers or the B button |\n| Collision and score | A hit gives no score, or the laser is not deleted | A hit gives 1 point; the laser and the ghost are removed | There are winning and losing messages |\n| Lives | Lives do not change when an enemy touches | Lives go down, the screen shakes, the enemy is deleted | The game ends with `when lives run out` |\n| Explanation | Cannot explain what they did | Explains the five parts and their events | Explains a bug they made and how they found it |\n\n### Note for parents and teachers\n- **Aim.** This week the child learns the idea of \"setting rules\": an enemy is controlled by a timer, a distance or a random number. Because blocks are dragged instead of code being typed, the result appears on the screen straight away.\n- **How to help.** When they get stuck, instead of giving the answer, ask: \"Which event runs this block?\", \"What is the sign of the speed?\", \"What is the sprite's kind?\", \"Is this block inside the event?\"\n- **Making mistakes is safe.** Everything is virtual; nothing breaks when the ↺ button rewinds the game. Block changes do not reach the running game; you need ↺ first.\n- **Numbers.** The speed and distance calculations use the four operations; the distance question does not need Pythagoras to be known already, as the numbers are chosen close to the 3-4-5 ratio, as in the examples given.\n- **Enemy design.** Whether a game is fair is an important design question; talking with the child about \"is it possible to escape from this enemy?\" builds both maths and design thinking.\n- **Progress.** Mini quiz results appear skill by skill on the \"My progress\" page (a draft/pilot feature; they are only saved if consent has been given).",
      "lessons": [
        {
          "title": "Devriye: düşman gidip gelir",
          "durationMin": 20,
          "problem": "Bir oyunda nöbetçi bir yarasa hep aynı koridorda gidip gelir. Kimse ona \"şimdi dön\" demez, ama tam zamanında döner. Bu hafta düşmanlara küçük bir \"zekâ\" vereceğiz. İlk adım en basiti: kendi ritmiyle gidip gelen bir devriye.",
          "contentMd": "Sahnede lacivert bir arka plan ve bir yarasa var. Yarasa sağa doğru uçuyor ve birkaç saniye sonra ekrandan çıkıp kayboluyor. Başlangıç projesi hazır gelir. Sağ taraftaki Hedefler panelinde işlerini yaptıkça kutular ✓ olur.\n\n### Düşman \"tür\"ü\nYarasa `Düşman` türünde bir sprite. Tür bir etikettir: ileride \"düşmana çarpınca can kaybet\" gibi kurallar yazarken türe göre konuşacağız. Şimdilik sadece yarasanın hareketine bakıyoruz.\n\n### Blokları kur\n1. Etkinliği aç ve ▶ düğmesine bas. Yarasa sağa gidiyor ve ekrandan çıkıyor. Bunu ■ ile durdur.\n2. **Oyun** kategorisinden `her [1000] ms'de bir` bloğunu al ve çalışma alanına bırak. Sayıyı 1500 yap. (1000 ms = 1 saniye, yani 1500 ms bir buçuk saniyedir.)\n3. **Hareket** kategorisinden `[bu sprite] [x (yatay)] hızını ters çevir` bloğunu al ve `her 1500 ms'de bir` bloğunun içine tak. `bu sprite` yerine **Değişken** kategorisinden `yarasa` bloğunu koy. Listede **x (yatay)** seçili kalsın.\n4. ↺ düğmesine bas ve izle. Yarasa bir buçuk saniye sağa gidiyor, sonra sola dönüyor, sonra yine sağa.\n\nBeklenen sonuç: Yarasa 6 saniye sonra başladığı yere (x yaklaşık 40) dönmüş oluyor. Hedeflerin üçü de ✓ olur.\n\n### Nasıl çalışıyor?\n- Yarasanın hızı x yönünde 40. Bir buçuk saniyede 40 x 1,5 = 60 piksel yol alır.\n- `ters çevir` bloğu hızın işaretini değiştirir: 40 olan hız -40 olur, -40 olan hız 40 olur.\n- `her ... ms'de bir` bloğu, o sürede bir kez çalışır ve bu hep tekrarlanır. Bloğun içindeki işler her seferinde yapılır.\n- Gidiş ve dönüş süreleri eşit olduğu için yarasa 3 saniyede bir başlangıç noktasına döner.\n- Bu devriye \"sekme\" ayarından farklıdır: duvar ya da kenar gerekmez, düşmanın kendi zamanlayıcısı karar verir.\n\n### Dene\n1. Zamanlayıcıyı 1000 ms yap. Yarasa kaç piksel yol gidiyor? Hesapla, sonra ▶ ile kontrol et.\n2. Başlangıçtaki hız bloğunu `hızı x 40 y 20` yap. Yarasa çapraz uçuyor. Devriyede geri dönmesi için `[yarasa] [y (dikey)] hızını ters çevir` bloğunu da zamanlayıcıya ekle.\n3. Yarasanın gittiği yöne bakmasını sağla: zamanlayıcıya `eğer [yarasa x hızı] > [0] ise [yarasa] [sağa] baksın değilse [yarasa] [sola] baksın` kur. Önce hızı ters çevir, sonra bakışı seç; bu sıra önemli.\n\n### Sık yapılan hatalar\n- Zamanlayıcının içine `hızı x 40 y 0` yazarsan yarasa hiçbir zaman dönmez, çünkü hız her seferinde yine 40 olur. Ters çevirmek için `ters çevir` bloğu gerekir.\n- `ters çevir` bloğunda **y (dikey)** seçiliyse yatay hız hiç değişmez.\n- Blok değişiklikleri çalışan oyuna yansımaz. Önce ↺ düğmesine bas.\n- Zamanlayıcıyı 50 ms'den küçük yapamazsın.",
          "question": "Gidiş ve dönüş süreleri farklı olsaydı (örneğin 1 sn gidip 2 sn dönseydi) yarasa ne olurdu? Gerçek bir oyunda oyuncu devriye düzenini fark edince bunu nasıl kullanır?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Bir düşmanın kendi kendine gidip gelmesini nasıl sağlayacağını\n- Zamanlayıcı olayının (`her ... ms'de bir`) ne zaman ve kaç kez çalıştığını\n- Hız, süre ve yol arasındaki ilişkiyi (yol = hız x süre)\n- `hızı ters çevir` bloğunun hızın işaretini nasıl değiştirdiğini\n\n### Önceden bilmen gerekenler\nÖnceki haftalardan: sprite yaratmak ve ona tür vermek (1. ve 2. haftalar), bir sprite'a hız vermek (4. ders), değişkenle sprite'ı seçmek. Başka bir şey gerekmez.\n\n### Devriye nedir?\nBir bekçi her gece aynı koridorda yürür: ileri, geri, ileri, geri. Oyunlarda buna **devriye** denir. Devriyedeki düşman oyuncuyu görmez; yalnızca kendi düzenini izler. Oyuncu bu düzeni öğrenip tam zamanında geçmeyi dener. Basit bir fikir, ama oyunu ilk kez \"yaşayan\" yapar.\n\n### Hız ve yol\nMotorda hız saniyede piksel olarak ölçülür. Yarasanın yatay hızı 40 ise her saniye 40 piksel sağa gider. Aradaki ilişki:\n\n```\nyol = hız x süre\n40 piksel/sn x 1,5 sn = 60 piksel\n```\n\nHızın işareti yönü verir: pozitif x hızı sağa, negatif x hızı sola götürür. Dikey hızda ise eksi değer yukarıdır, çünkü ekranın üst kenarında y sıfırdır.\n\n### Zamanlayıcı olayı\n`her 1500 ms'de bir` bloğu bir **olay**dır. Oyun açıkken her 1500 milisaniyede (1,5 saniyede) içindeki blokları bir kez çalıştırır ve bunu durmadan tekrarlar. Milisaniye saniyenin binde biridir: 1000 ms = 1 saniye. Zamanlayıcı en az 50 ms olabilir; daha küçük yazarsan motor 50 yapar.\n\n### Hızı ters çevirmek\nDevriye için iki ayrı hareket yazmak gerekmez. `hızı ters çevir` bloğu hızın işaretini değiştirir: 40 olan hız -40, -40 olan hız yine 40 olur. Blokta hangi yönün seçildiğine dikkat et: x (yatay) seçiliyse yatay hız, y (dikey) seçiliyse dikey hız ters döner. Zamanlayıcıya \"hızı x 40 yap\" yazarsan hız her seferinde yine 40 olur ve yarasa hiç dönmez; çünkü yeni bir değer vermek ile eldekini ters çevirmek farklı şeylerdir.\n\nBaşlangıçta yarasa sağa gider, 1,5 saniye sonra sola döner, 3 saniye sonra yine sağa. Gidiş ve dönüş süreleri eşit olduğu için yarasa her 3 saniyede başladığı noktaya geri gelir.\n\n### Özet\nDevriye, bir düşmanın düzenli gidip gelmesidir. Hız piksel/saniyedir ve yol hız çarpı süredir. `her ... ms'de bir` olayı belirli aralıkta çalışır; içine koyduğun `ters çevir` bloğu hızın işaretini değiştirerek yarasayı döndürür. Doğru yönü (x ya da y) seçmeyi unutma.",
          "concepts": [
            {
              "term": "Devriye",
              "definition": "Bir düşmanın oyuncuyu görmeden kendi düzeniyle sürekli gidip gelmesi.",
              "example": "Koridorda 1,5 saniye sağa, 1,5 saniye sola uçan nöbetçi yarasa.",
              "pitfall": "Devriyeyi tek bir hareket bloğu sanmak; dönüş için zamanlayıcı ve ters çevirme gerekir."
            },
            {
              "term": "Zamanlayıcı olayı",
              "definition": "\"her N ms'de bir\" bloğu, içindeki blokları N milisaniyede bir çalıştırır ve bunu tekrarlar.",
              "example": "her 1500 ms'de bir bloğu yarasayı bir buçuk saniyede bir döndürür.",
              "pitfall": "1000 ms'yi 1000 saniye sanmak; 1000 ms yalnızca 1 saniyedir."
            },
            {
              "term": "Hız ve yol",
              "definition": "Hız saniyede kat edilen piksel sayısıdır; yol = hız x süre.",
              "example": "Hız 40 ve süre 1,5 saniye ise yarasa 60 piksel gider.",
              "pitfall": "Zamanı milisaniye bırakıp hesaplamak: 1500 ms ile çarpma, 1,5 saniye ile çarpmadan çok farklı çıkar."
            },
            {
              "term": "Hızı ters çevir",
              "definition": "Seçilen eksendeki hızın işaretini değiştirir: 40 olan -40, -40 olan 40 olur.",
              "example": "x hızı 40 olan yarasa ters çevrilince sola, 40 piksel/sn ile gider.",
              "pitfall": "Blokta y (dikey) seçili bırakmak; yatay hız hiç değişmez ve yarasa dönmez."
            },
            {
              "term": "Düşman türü",
              "definition": "Sprite'a verilen bir etikettir; kurallar sprite'ın türüne göre yazılır.",
              "example": "Yarasa Düşman türünde olduğu için ileride çarpışma kuralı yarasaya da uygulanır.",
              "pitfall": "Türü yanlış seçmek: kural beklediğin türü bulamaz ve hiç çalışmaz."
            }
          ],
          "quiz": [
            {
              "id": "m11h4d16-q1",
              "kind": "numeric",
              "prompt": "Yarasanın yatay hızı 50 piksel/sn. Zamanlayıcı her 2000 ms'de bir hızı ters çeviriyor. Yarasa dönmeden önce bir yönde kaç piksel yol alır?",
              "answer": 100,
              "tolerance": 0,
              "unit": "piksel",
              "explanation": "2000 ms = 2 saniyedir. Yol = hız x süre = 50 x 2 = 100 piksel. Süreyi milisaniye olarak (2000) çarpmak 100000 verirdi; hesaptan önce saniyeye çevir.",
              "skills": [
                "game-velocity",
                "game-timer"
              ]
            },
            {
              "id": "m11h4d16-q2",
              "kind": "mcq",
              "prompt": "Yarasanın zamanlayıcısının içine \"yarasa hızı x 40, y 0\" bloğunu koydun. Yarasa dönmüyor, hep sağa gidiyor. Neden?",
              "options": [
                "Zamanlayıcı en az 50 ms olmalıdır",
                "Yarasa Düşman türünde olduğu için dönemez",
                "Hız blokları zamanlayıcının içinde çalışmaz",
                "Her çalışışta hız yine 40 yapılıyor; hızın işaretini değiştiren bir blok yok"
              ],
              "answer": 3,
              "explanation": "Hız bloğu hızı verilen değere ayarlar; ters çevirmez. 40 tekrar tekrar 40 olarak yazılır. Dönmek için hızın işaretini değiştiren \"ters çevir\" bloğu gerekir. Zamanlayıcı 50 ms sınırı burada sorun değildir, tür de dönmeyi engellemez.",
              "skills": [
                "game-velocity",
                "game-timer"
              ]
            },
            {
              "id": "m11h4d16-q3",
              "kind": "predict-output",
              "prompt": "Yarasa x = 50 noktasında başlıyor. Program şöyle:\n\n```\noyun başlayınca:\n  yarasa hızı x 30, y 0\n\nher 1000 ms'de bir:\n  yarasa x hızını ters çevir\n```\n\n3,5 saniye sonra yarasa nerede ve hangi yöne gidiyor?",
              "options": [
                "Yaklaşık x = 65'te, sola gidiyor",
                "Başladığı yerde (x = 50) duruyor",
                "Yaklaşık x = 80'de, sağa gidiyor",
                "Yaklaşık x = 155'te, ekranın dışında"
              ],
              "answer": 0,
              "explanation": "0-1 sn sağa: x = 80. 1-2 sn sola: x = 50. 2-3 sn sağa: x = 80. 3. saniyede üçüncü ters çevirme hızı -30 yapar; 0,5 saniyede 15 piksel sola gidilir, x = 65. Yani 65 civarında ve sola gidiyor.",
              "skills": [
                "game-velocity",
                "game-timer"
              ]
            },
            {
              "id": "m11h4d16-q4",
              "kind": "find-bug",
              "prompt": "Yarasa sağa gidiyor ama hiç geri dönmüyor. Hata hangisi?\n\n```\noyun başlayınca:\n  yarasa hızı x 40, y 0\n\nher 1500 ms'de bir:\n  yarasa y (dikey) hızını ters çevir\n```",
              "options": [
                "Başlangıç hızı 40 olmamalı",
                "Zamanlayıcı 1500 ms olmamalı",
                "Ters çevir bloğunda y (dikey) seçili; yatay hız değişmiyor",
                "Yarasanın tür etiketi eksik"
              ],
              "answer": 2,
              "explanation": "Yarasa yatay hareket ediyor, ama ters çevirme dikey hıza uygulanıyor. Dikey hız zaten 0 olduğu için ters çevirmek onu değiştirmez; yatay hız hiç değişmez. Çözüm: bloktaki eksen seçimini x (yatay) yapmak. Diğer satırlarda hata yok.",
              "skills": [
                "game-debug",
                "game-velocity"
              ]
            },
            {
              "id": "m11h4d16-q5",
              "kind": "numeric",
              "prompt": "Yarasanın zamanlayıcısı 800 ms. Gidiş ve dönüş süreleri eşit. Yarasa kaç milisaniyede bir başladığı noktaya geri gelir?",
              "answer": 1600,
              "tolerance": 0,
              "unit": "ms",
              "explanation": "Her 800 ms'de hız ters döner: bir yönde 800 ms, diğer yönde 800 ms gidilir. Tam bir tur 800 + 800 = 1600 ms sürer ve yarasa başladığı noktaya döner.",
              "skills": [
                "game-timer",
                "game-velocity"
              ]
            }
          ],
          "contentEn": {
            "title": "Patrol: the enemy goes back and forth",
            "problem": "In a game, a guard bat flies back and forth along the same corridor. Nobody tells it \"turn now\", but it turns at exactly the right time. This week we will give enemies a little \"brain\". The first step is the simplest: a patrol that goes back and forth to its own rhythm.",
            "contentMd": "On the stage there is a navy background and a bat. The bat flies to the right and, after a few seconds, leaves the screen and disappears. The starter project is ready for you. In the Goals panel on the right, the boxes turn ✓ as you finish each job.\n\n### The enemy \"kind\"\nThe bat is a sprite of the `Enemy` kind. A kind is a label: later, when we write rules like \"lose a life when you hit an enemy\", we will talk about kinds. For now we are only looking at how the bat moves.\n\n### Build the blocks\n1. Open the activity and press the ▶ button. The bat goes right and leaves the screen. Stop it with ■.\n2. From the **Game** category, take the `every [1000] ms` block and drop it in the workspace. Change the number to 1500. (1000 ms = 1 second, so 1500 ms is one and a half seconds.)\n3. From the **Motion** category, take the `reverse [this sprite] [x (sideways)] speed` block and snap it inside the `every 1500 ms` block. Replace `this sprite` with the `yarasa` (bat) block from the **Variables** category. Leave **x (sideways)** selected in the list.\n4. Press the ↺ button and watch. The bat goes right for one and a half seconds, then turns left, then goes right again.\n\nExpected result: after 6 seconds the bat is back where it started (x about 40). All three goals turn ✓.\n\n### How does it work?\n- The bat's speed in the x direction is 40. In one and a half seconds it travels 40 x 1.5 = 60 pixels.\n- The `reverse` block changes the sign of the speed: a speed of 40 becomes -40, and a speed of -40 becomes 40.\n- The `every ... ms` block runs once in that time, and this repeats for ever. The jobs inside the block are done every time.\n- Because the times going and coming back are equal, the bat returns to its starting point every 3 seconds.\n- This patrol is different from the \"bounce\" setting: it needs no wall or edge. The enemy's own timer decides.\n\n### Try it\n1. Set the timer to 1000 ms. How many pixels does the bat travel? Work it out, then check with ▶.\n2. Change the starting speed block to `set speed x 40 y 20`. The bat flies diagonally. To make it come back on patrol, add a `reverse [yarasa] [y (up-down)] speed` block to the timer as well.\n3. Make the bat look the way it is going: in the timer, build `if [yarasa x speed] > [0] do [yarasa] faces [right] else [yarasa] faces [left]`. Reverse the speed first, then choose the facing; this order matters.\n\n### Common mistakes\n- If you put `set speed x 40 y 0` inside the timer, the bat never turns, because the speed becomes 40 again every time. To reverse it you need the `reverse` block.\n- If **y (up-down)** is selected in the `reverse` block, the sideways speed never changes.\n- Block changes do not reach the running game. Press the ↺ button first.\n- You cannot set the timer below 50 ms.",
            "question": "What would happen to the bat if the times going and coming back were different (for example, 1 s going and 2 s coming back)? In a real game, how does a player use the patrol pattern once they notice it?",
            "explainerMd": "### What you will learn in this lesson\n- How to make an enemy go back and forth on its own\n- When, and how many times, the timer event (`every ... ms`) runs\n- The link between speed, time and distance (distance = speed x time)\n- How the `reverse speed` block changes the sign of the speed\n\n### What you should know first\nFrom earlier weeks: making a sprite and giving it a kind (weeks 1 and 2), giving a sprite a speed (lesson 4), choosing a sprite with a variable. You do not need anything else.\n\n### What is a patrol?\nA guard walks along the same corridor every night: forward, back, forward, back. In games this is called a **patrol**. An enemy on patrol does not see the player; it only follows its own pattern. The player learns this pattern and tries to get past at just the right moment. It is a simple idea, but it makes the game \"come alive\" for the first time.\n\n### Speed and distance\nIn the engine, speed is measured in pixels per second. If the bat's sideways speed is 40, it moves 40 pixels to the right every second. The link between them:\n\n```\ndistance = speed x time\n40 pixels/s x 1.5 s = 60 pixels\n```\n\nThe sign of the speed gives the direction: a positive x speed goes right, a negative x speed goes left. For up-down speed, a minus value means up, because y is zero at the top edge of the screen.\n\n### The timer event\nThe `every 1500 ms` block is an **event**. While the game is running, it runs the blocks inside it once every 1500 milliseconds (1.5 seconds) and keeps repeating this without stopping. A millisecond is one thousandth of a second: 1000 ms = 1 second. The timer can be 50 ms at the least; if you write a smaller number, the engine makes it 50.\n\n### Reversing the speed\nFor a patrol you do not need to write two separate movements. The `reverse speed` block changes the sign of the speed: a speed of 40 becomes -40, and -40 becomes 40 again. Watch which direction is selected in the block: if x (sideways) is selected, the sideways speed is reversed; if y (up-down) is selected, the up-down speed is reversed. If you write \"set speed x 40\" in the timer, the speed becomes 40 again every time and the bat never turns; giving a new value and reversing the one you have are different things.\n\nAt the start the bat goes right, after 1.5 seconds it turns left, and after 3 seconds it goes right again. Because the times going and coming back are equal, the bat returns to its starting point every 3 seconds.\n\n### Summary\nA patrol is an enemy going back and forth regularly. Speed is pixels per second, and distance is speed times time. The `every ... ms` event runs at a set interval; the `reverse` block you put inside it changes the sign of the speed and turns the bat round. Remember to choose the right direction (x or y).",
            "concepts": [
              {
                "term": "Patrol",
                "definition": "An enemy going back and forth all the time in its own pattern, without seeing the player.",
                "example": "A guard bat that flies right for 1.5 seconds and left for 1.5 seconds along a corridor.",
                "pitfall": "Thinking a patrol is a single movement block; turning round needs a timer and a reverse."
              },
              {
                "term": "Timer event",
                "definition": "The \"every N ms\" block runs the blocks inside it once every N milliseconds and keeps repeating.",
                "example": "The every 1500 ms block turns the bat round every one and a half seconds.",
                "pitfall": "Thinking 1000 ms is 1000 seconds; 1000 ms is only 1 second."
              },
              {
                "term": "Speed and distance",
                "definition": "Speed is the number of pixels travelled each second; distance = speed x time.",
                "example": "If the speed is 40 and the time is 1.5 seconds, the bat travels 60 pixels.",
                "pitfall": "Leaving the time in milliseconds when you calculate: multiplying by 1500 ms gives a very different answer from multiplying by 1.5 seconds."
              },
              {
                "term": "Reverse speed",
                "definition": "Changes the sign of the speed on the chosen axis: 40 becomes -40, and -40 becomes 40.",
                "example": "When a bat with an x speed of 40 is reversed, it goes left at 40 pixels/s.",
                "pitfall": "Leaving y (up-down) selected in the block; the sideways speed never changes and the bat does not turn."
              },
              {
                "term": "Enemy kind",
                "definition": "A label given to a sprite; rules are written for the sprite's kind.",
                "example": "Because the bat is of the Enemy kind, a collision rule written later will apply to the bat too.",
                "pitfall": "Choosing the wrong kind: the rule cannot find the kind it expects and never runs."
              }
            ],
            "quiz": [
              {
                "id": "m11h4d16-q1",
                "kind": "numeric",
                "prompt": "The bat's sideways speed is 50 pixels/s. A timer reverses the speed every 2000 ms. How many pixels does the bat travel in one direction before it turns?",
                "answer": 100,
                "tolerance": 0,
                "unit": "pixels",
                "explanation": "2000 ms = 2 seconds. Distance = speed x time = 50 x 2 = 100 pixels. Multiplying by the time in milliseconds (2000) would give 100000; change it to seconds before you calculate.",
                "skills": [
                  "game-velocity",
                  "game-timer"
                ]
              },
              {
                "id": "m11h4d16-q2",
                "kind": "mcq",
                "prompt": "You put a \"set yarasa speed x 40, y 0\" block inside the bat's timer. The bat does not turn; it keeps going right. Why?",
                "options": [
                  "The timer must be at least 50 ms",
                  "The bat cannot turn because it is of the Enemy kind",
                  "Speed blocks do not work inside a timer",
                  "Every time it runs, the speed is set to 40 again; there is no block that changes the sign of the speed"
                ],
                "answer": 3,
                "explanation": "The speed block sets the speed to the given value; it does not reverse it. 40 is written as 40 again and again. To turn, you need the \"reverse\" block, which changes the sign of the speed. The 50 ms timer limit is not the problem here, and the kind does not stop it turning either.",
                "skills": [
                  "game-velocity",
                  "game-timer"
                ]
              },
              {
                "id": "m11h4d16-q3",
                "kind": "predict-output",
                "prompt": "The bat starts at x = 50. The program is:\n\n```\nwhen game starts:\n  set yarasa speed x 30, y 0\n\nevery 1000 ms:\n  reverse yarasa x speed\n```\n\nAfter 3.5 seconds, where is the bat and which way is it going?",
                "options": [
                  "At about x = 65, going left",
                  "Standing still where it started (x = 50)",
                  "At about x = 80, going right",
                  "At about x = 155, off the screen"
                ],
                "answer": 0,
                "explanation": "0-1 s right: x = 80. 1-2 s left: x = 50. 2-3 s right: x = 80. At 3 seconds the third reverse makes the speed -30; in 0.5 seconds it goes 15 pixels left, so x = 65. So it is at about 65 and going left.",
                "skills": [
                  "game-velocity",
                  "game-timer"
                ]
              },
              {
                "id": "m11h4d16-q4",
                "kind": "find-bug",
                "prompt": "The bat goes right but never comes back. Which is the bug?\n\n```\nwhen game starts:\n  set yarasa speed x 40, y 0\n\nevery 1500 ms:\n  reverse yarasa y (up-down) speed\n```",
                "options": [
                  "The starting speed should not be 40",
                  "The timer should not be 1500 ms",
                  "y (up-down) is selected in the reverse block; the sideways speed does not change",
                  "The bat's kind label is missing"
                ],
                "answer": 2,
                "explanation": "The bat moves sideways, but the reverse is applied to the up-down speed. The up-down speed is already 0, so reversing it changes nothing; the sideways speed never changes. The fix: set the axis in the block to x (sideways). The other lines have no bug.",
                "skills": [
                  "game-debug",
                  "game-velocity"
                ]
              },
              {
                "id": "m11h4d16-q5",
                "kind": "numeric",
                "prompt": "The bat's timer is 800 ms. The times going and coming back are equal. Every how many milliseconds does the bat come back to its starting point?",
                "answer": 1600,
                "tolerance": 0,
                "unit": "ms",
                "explanation": "Every 800 ms the speed is reversed: it goes 800 ms one way and 800 ms the other way. A full round trip takes 800 + 800 = 1600 ms, and the bat is back at its starting point.",
                "skills": [
                  "game-timer",
                  "game-velocity"
                ]
              }
            ]
          }
        },
        {
          "title": "Takip: hayalet seni kovalıyor",
          "durationMin": 20,
          "problem": "En korkutucu düşman, seni gören ve peşine takılandır. Ama bir hayalet bütün haritada seni kovalarsa oyun çok zorlaşır. İyi oyunlarda hayalet ancak yeterince yaklaşırsan uyanır. Bu derste hem kovalayan hem de kendi kendine \"yakın mı, uzak mı?\" diye soran bir hayalet yapacaksın.",
          "contentMd": "Sahnede bir kedi ve köşede bir hayalet var. Kediyi ok tuşlarıyla yürütebilirsin; hayalet henüz hiçbir şey yapmıyor. Başlangıç projesi hazır gelir; `her karede` olayı da boş olarak bekliyor.\n\n### İki yeni fikir\n- **Takip:** `[hayalet], [kedi] sprite'ını [25] hızıyla takip etsin` bloğu hayaleti sürekli kedinin yönüne doğru yürütür. Hızı sen seçersin (saniyede piksel).\n- **Mesafe:** `[hayalet] ile [kedi] arası mesafe` bloğu iki sprite'ın merkezleri arasındaki uzaklığı piksel olarak söyler.\n\n### Blokları kur\n1. Önce basit takip: **Sprite** kategorisinden `[bu sprite], [bu sprite] sprite'ını [30] hızıyla takip etsin` bloğunu al. İlk yere `hayalet`, ikinci yere `kedi` değişkenini koy; hızı 25 yap. Bloğu `her karede` olayının içine tak.\n2. ↺ bas ve kediyi kaçır. Hayalet nereye gitsen peşinde. Kedi çok hızlı değilse yakalanırsın.\n3. Şimdi hayaleti uyanık tut ama sınırlı: **Mantık** kategorisinde iki `eğer` bloğu var; \"değilse\" kolu olanını al ve `her karede` bloğunun içine tak. Takip bloğunu `ise` koluna sürükle.\n4. Koşul olarak **Mantık** kategorisinden bir karşılaştırma bloğu (`[ ] = [ ]`) al ve işaretini `<` yap. Sol tarafına **Sprite** kategorisinden `[hayalet] ile [kedi] arası mesafe`, sağ tarafına 70 yaz.\n5. `değilse` koluna **Hareket** kategorisinden `[hayalet] dursun` bloğunu koy. (`dursun` hızı sıfırlar ve takibi de bırakır.)\n6. ↺ bas. Kediyi hayalete 70 pikselden fazla yaklaştırma: hayalet yerinde kalıyor. Biraz yaklaş: hayalet uyanıp kovalıyor. Uzaklaşınca yine duruyor.\n\nBeklenen sonuç: Kedi yakındayken hayalet ona doğru gidiyor, uzaktayken hiç kıpırdamıyor. Üç hedef ✓.\n\n### Nasıl çalışıyor?\n- `her karede` bloğu saniyede 60 kez çalışır, yani hayalet saniyede 60 kez \"kedi yakın mı?\" diye bakar.\n- Takip hızı sabittir (burada 25). Kedi 60 hızla yürüyorsa hayalet onu hiç yakalayamaz; hızları oyunu zorlaştırmak ya da kolaylaştırmak için ayarlarsın.\n- Hayalet kediye 1 pikselden yakın olunca durur; üstüne binmez.\n- Takibi bırakmak için `[hayalet] takibi bıraksın` bloğu da var, ama bu blok hızı sıfırlamaz: hayalet son hızıyla devam eder. Bu yüzden biz `dursun` kullandık.\n\n### Dene\n1. Uyanma mesafesini 40 yap, sonra 100 yap. Hangisi daha adil geliyor?\n2. Hayaleti yavaşlat (15) ve kediyi hızlandır (100). Kediyle hayaleti birbirine değdir: ne oluyor? (Çarpışma kuralını sonra yazacağız; şimdilik sadece görüyorsun.)\n3. İkinci bir hayalet ekle: `yeni [hayalet] sprite'ı, türü [Düşman]` bloğuyla yeni bir sprite yap, ona başka bir değişken adı ver ve aynı kuralı onun için de kur.\n\n### Sık yapılan hatalar\n- Takip bloğunun iki kutusuna da aynı değişkeni koymak: sprite kendini takip etmeye çalışır ve hiçbir şey olmaz.\n- Takip bloğunu yalnız `oyun başlayınca` içine koyup uzaklık kuralını `her karede` içine yazmamak: hayalet sonsuza dek kovalar ya da hiç uyanmaz.\n- `dursun` yerine `takibi bıraksın` kullanmak: hayalet son hızıyla kaymaya devam eder.",
          "question": "Gerçek hayatta bir köpek de sana yaklaşınca havlar, uzaktaysa umursamaz. Bu \"algılama mesafesi\" fikrini hangi başka oyun düşmanlarında gördün? Hayaletin algılama mesafesini oyuncu görebilsin mi, görmesin mi?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Bir sprite'ı başka bir sprite'ın peşinden nasıl gönderebileceğini\n- İki sprite arasındaki mesafenin ne demek olduğunu ve nasıl ölçüldüğünü\n- \"Yakınsa kovala, uzaksa dur\" kuralını `eğer ... değilse` ile kurmayı\n- `dursun` ile `takibi bıraksın` arasındaki farkı\n\n### Önceden bilmen gerekenler\nDers 16: hız ve yol (yol = hız x süre). Daha önceki haftalardan: `eğer` bloğu, değişkenle sprite seçmek, `her karede` olayı ve bir sprite'ı ok tuşlarıyla yürütmek.\n\n### Takip nasıl çalışır?\n`hayalet, kediyi 25 hızıyla takip etsin` bloğu hayaletin her karede kedinin yönüne bakıp o yöne 25 piksel/saniye hızla gitmesini sağlar. Kedi yer değiştirirse hayalet yönünü kendiliğinden düzeltir. Takip hızı sabittir: kedi 60 hızla koşuyorsa hayalet 25 hızla onu hiç yakalayamaz. Hayalet kediye 1 pikselden fazla yaklaşınca durur; üstüne binmez.\n\nÖnemli bir ayrıntı: iki kutuya aynı sprite'ı koyarsan (hayalet, hayaleti takip etsin) blok hiçbir şey yapmaz.\n\n### Mesafe\n`hayalet ile kedi arası mesafe` bloğu iki sprite'ın **merkezleri** arasındaki uzaklığı piksel olarak verir. Yatay fark ile dikey farkı Pisagor bağıntısıyla birleştirir:\n\n```\ndx = 80 - 20 = 60\ndy = 110 - 30 = 80\nmesafe = karekök(60 x 60 + 80 x 80) = 100\n```\n\nMesafe her zaman sıfır ya da pozitiftir; sprite'lardan hangisini önce yazdığın önemli değildir.\n\n### Algılama eşiği\nHayalet bütün haritada kovalarsa oyun zorlaşır. Bunun yerine bir **eşik** seçeriz: mesafe eşikten küçükse hayalet \"uyanır\". Kural:\n\n```\nher karede:\n  eğer mesafe < 70 ise\n    hayalet kediyi 25 hızla takip etsin\n  değilse\n    hayalet dursun\n```\n\n`her karede` olayı saniyede 60 kez çalışır, yani hayalet saniyede 60 kez \"kedi yakın mı?\" diye bakar. Bu denetimi `oyun başlayınca` içine koyarsan yalnız bir kez bakılır; kedi sonradan yaklaşsa da kural yeniden sınanmaz.\n\n### dursun ve takibi bıraksın\n`dursun` hızı sıfırlar ve takibi bırakır. `takibi bıraksın` ise yalnızca takibi bırakır; hız olduğu gibi kalır. Hayalet o anki yönde, o anki hızla kaymaya devam eder. Bu yüzden \"değilse\" koluna `dursun` koyarız.\n\n### Özet\nTakip bloğu bir sprite'ı sabit hızla diğerine doğru yürütür. Mesafe bloğu merkezler arasını piksel olarak ölçer. Mesafe eşiğini `eğer ... değilse` ile birleştirerek hayaleti yalnız yakınsa uyanan bir düşman yaparsın. Takibi gerçekten durdurmak için `dursun` kullan.",
          "concepts": [
            {
              "term": "Takip",
              "definition": "Bir sprite'ın her karede hedef sprite'a doğru, sabit bir hızla ilerlemesi.",
              "example": "Hayalet, kediyi 25 hızla takip eder ve kedi nereye giderse o yöne döner.",
              "pitfall": "İki kutuya aynı sprite'ı koymak: sprite kendini takip etmeye çalışır ve hiç kıpırdamaz."
            },
            {
              "term": "Mesafe",
              "definition": "İki sprite'ın merkezleri arasındaki uzaklık, piksel olarak.",
              "example": "Merkezler 60 piksel yan yana ve 80 piksel alt alta ise mesafe 100'dür.",
              "pitfall": "Sadece yatay farkı mesafe sanmak; dikey fark da hesaba girer."
            },
            {
              "term": "Algılama eşiği",
              "definition": "Düşmanın oyuncuyu fark edeceği en büyük mesafe; kuralda karşılaştırma sayısı olarak yazılır.",
              "example": "Mesafe 70'ten küçükse hayalet kovalar, değilse durur.",
              "pitfall": "Eşiği çok büyük seçmek: hayalet her yerden görür ve oyun haksız zorlaşır."
            },
            {
              "term": "dursun ve takibi bıraksın",
              "definition": "dursun hızı sıfırlar ve takibi bırakır; takibi bıraksın yalnızca takibi bırakır, hızı olduğu gibi bırakır.",
              "example": "Takibi bıraksın kullanılırsa hayalet son hızıyla kaymaya devam eder.",
              "pitfall": "Durması gereken yerde takibi bıraksın kullanmak: hayalet buz üstünde gibi kayar."
            },
            {
              "term": "Her karede",
              "definition": "Oyun açıkken saniyede 60 kez çalışan olay; sürekli denetlenmesi gereken kurallar için kullanılır.",
              "example": "Mesafeyi her karede ölçen hayalet kedinin yaklaşmasını hemen fark eder.",
              "pitfall": "Mesafe denetimini oyun başlayınca içine koymak: bir kez bakılır ve bir daha sınanmaz."
            }
          ],
          "quiz": [
            {
              "id": "m11h4d17-q1",
              "kind": "numeric",
              "prompt": "Hayaletin merkezi (20, 30), kedinin merkezi (80, 110) noktasında. Mesafe bloğu kaç verir?",
              "answer": 100,
              "tolerance": 0,
              "unit": "piksel",
              "explanation": "Yatay fark 80 - 20 = 60, dikey fark 110 - 30 = 80. Mesafe = karekök(60 x 60 + 80 x 80) = karekök(10000) = 100. Farkları toplayıp 140 bulmak yanlıştır; mesafe çapraz doğrudur.",
              "skills": [
                "game-distance"
              ]
            },
            {
              "id": "m11h4d17-q2",
              "kind": "numeric",
              "prompt": "Kedi hareketsiz duruyor. Hayalet kediden 70 piksel uzakta uyanıyor ve 25 hızla takip ediyor. Mesafe 20 piksele inene kadar kaç saniye geçer?",
              "answer": 2,
              "tolerance": 0.05,
              "unit": "sn",
              "explanation": "Kapanacak mesafe 70 - 20 = 50 pikseldir. Süre = yol / hız = 50 / 25 = 2 saniye. Takip düz bir çizgide, sabit hızla ilerlediği için hesap doğrudan çıkar.",
              "skills": [
                "game-follow",
                "game-distance"
              ]
            },
            {
              "id": "m11h4d17-q3",
              "kind": "predict-output",
              "prompt": "Program şöyle:\n\n```\nher karede:\n  eğer mesafe(hayalet, kedi) < 70 ise\n    hayalet kediyi 25 hızla takip etsin\n  değilse\n    hayalet takibi bıraksın\n```\n\nKedi hayalete yaklaşır, hayalet uyanıp kovalar. Sonra kedi hızla uzaklaşır ve mesafe 70'i geçer. Hayalet ne yapar?",
              "options": [
                "Hemen durur",
                "Başladığı yere geri döner",
                "Ekrandan kaybolur",
                "Son hızıyla aynı yönde kaymaya devam eder"
              ],
              "answer": 3,
              "explanation": "\"Takibi bıraksın\" yalnızca takip bağını koparır; hız olduğu gibi kalır. Hayalet o anki yönde 25 hızla gitmeye devam eder. Durması için değilse koluna \"dursun\" konmalıydı.",
              "skills": [
                "game-follow",
                "game-condition",
                "game-debug"
              ]
            },
            {
              "id": "m11h4d17-q4",
              "kind": "find-bug",
              "prompt": "Hayalet hiç kıpırdamıyor. Hata hangisi?\n\n```\nher karede:\n  hayalet, hayalet sprite'ını 25 hızla takip etsin\n```",
              "options": [
                "Takip hızı 25 olmamalı",
                "Her karede olayı takip için kullanılamaz",
                "Hedef olarak da hayalet seçilmiş; hayalet kendini takip ediyor",
                "Hayalet Düşman türünde olmamalı"
              ],
              "answer": 2,
              "explanation": "Takip bloğunun iki kutusuna da aynı sprite konmuş. Bir sprite kendini takip edemez, bu yüzden blok hiçbir şey yapmaz. İkinci kutuya kedi konmalıydı. Hız ve olay seçimi doğru.",
              "skills": [
                "game-debug",
                "game-follow"
              ]
            },
            {
              "id": "m11h4d17-q5",
              "kind": "mcq",
              "prompt": "Mesafe denetimini neden \"oyun başlayınca\" yerine \"her karede\" içine yazarız?",
              "options": [
                "Kedi hareket ettikçe mesafe değişir; kural saniyede 60 kez yeniden sınanmalıdır",
                "Oyun başlayınca olayı mesafe bloğunu desteklemez",
                "Her karede daha az yer kaplar",
                "Takip bloğu yalnız her karede içinde çalışır"
              ],
              "answer": 0,
              "explanation": "Oyun başlayınca bloğu yalnız bir kez çalışır; kedi sonradan yaklaşırsa kimse yeniden bakmaz. Her karede olayı saniyede 60 kez çalıştığı için hayalet kedinin yaklaşmasını hemen fark eder. Oyun başlayınca da mesafe bloğunu kullanabilir; sorun zamanlamadır.",
              "skills": [
                "game-condition",
                "game-distance"
              ]
            }
          ],
          "contentEn": {
            "title": "Follow: the ghost chases you",
            "problem": "The scariest enemy is the one that sees you and comes after you. But if a ghost chases you across the whole map, the game becomes very hard. In good games the ghost only wakes up if you get close enough. In this lesson you will make a ghost that both chases and asks itself \"is it near or far?\".",
            "contentMd": "On the stage there is a cat and, in the corner, a ghost. You can walk the cat with the arrow keys; the ghost does nothing yet. The starter project is ready for you, and the `every frame` event is waiting, empty.\n\n### Two new ideas\n- **Follow:** the `[hayalet] follows sprite [kedi] at speed [25]` block keeps the ghost walking towards the cat. You choose the speed (pixels per second).\n- **Distance:** the `distance from [hayalet] to [kedi]` block tells you how far apart the centres of two sprites are, in pixels.\n\n### Build the blocks\n1. First, simple following: from the **Sprite** category, take the `[this sprite] follows sprite [this sprite] at speed [30]` block. Put the `hayalet` (ghost) variable in the first slot and the `kedi` (cat) variable in the second; set the speed to 25. Snap the block inside the `every frame` event.\n2. Press ↺ and run away with the cat. Wherever you go, the ghost is after you. Unless the cat is very fast, you get caught.\n3. Now keep the ghost alert, but limited: the **Logic** category has two `if` blocks; take the one with an \"else\" branch and snap it inside the `every frame` block. Drag the follow block into the `do` branch.\n4. For the condition, take a comparison block (`[ ] = [ ]`) from the **Logic** category and change its sign to `<`. On the left, put `distance from [hayalet] to [kedi]` from the **Sprite** category; on the right, type 70.\n5. In the `else` branch, put the `[hayalet] stops` block from the **Motion** category. (`stops` sets the speed to zero and also ends the following.)\n6. Press ↺. Do not bring the cat closer than 70 pixels to the ghost: the ghost stays where it is. Come a little closer: the ghost wakes up and chases. When you move away, it stops again.\n\nExpected result: when the cat is near, the ghost moves towards it; when it is far away, the ghost does not move at all. Three goals ✓.\n\n### How does it work?\n- The `every frame` block runs 60 times a second, so the ghost checks \"is the cat near?\" 60 times a second.\n- The follow speed is fixed (25 here). If the cat walks at speed 60, the ghost can never catch it; you set the speeds to make the game harder or easier.\n- When the ghost is closer than 1 pixel to the cat, it stops; it does not climb on top of it.\n- There is also a `[hayalet] stops following` block for ending the follow, but this block does not set the speed to zero: the ghost carries on at its last speed. That is why we used `stops`.\n\n### Try it\n1. Set the wake-up distance to 40, then to 100. Which one feels fairer?\n2. Slow the ghost down (15) and speed the cat up (100). Make the cat and the ghost touch: what happens? (We will write the collision rule later; for now you are just watching.)\n3. Add a second ghost: make a new sprite with the `new [Ghost] sprite, kind [Enemy]` block, give it a different variable name, and build the same rule for it too.\n\n### Common mistakes\n- Putting the same variable in both slots of the follow block: the sprite tries to follow itself and nothing happens.\n- Putting the follow block only inside `when game starts` and not writing the distance rule inside `every frame`: the ghost chases for ever, or never wakes up.\n- Using `stops following` instead of `stops`: the ghost keeps sliding at its last speed.",
            "question": "In real life, a dog barks when you come near and ignores you when you are far away. In which other game enemies have you seen this \"detection distance\" idea? Should the player be able to see the ghost's detection distance, or not?",
            "explainerMd": "### What you will learn in this lesson\n- How to send one sprite after another sprite\n- What the distance between two sprites means and how it is measured\n- How to build the rule \"chase if near, stop if far\" with `if ... else`\n- The difference between `stops` and `stops following`\n\n### What you should know first\nLesson 16: speed and distance (distance = speed x time). From earlier weeks: the `if` block, choosing a sprite with a variable, the `every frame` event and walking a sprite with the arrow keys.\n\n### How does following work?\nThe `hayalet follows kedi at speed 25` block makes the ghost look towards the cat every frame and move that way at 25 pixels/second. If the cat moves, the ghost corrects its direction by itself. The follow speed is fixed: if the cat is running at speed 60, the ghost at speed 25 can never catch it. When the ghost comes closer than 1 pixel to the cat, it stops; it does not climb on top of it.\n\nAn important detail: if you put the same sprite in both slots (the ghost follows the ghost), the block does nothing.\n\n### Distance\nThe `distance from hayalet to kedi` block gives the distance between the **centres** of two sprites, in pixels. It combines the sideways difference and the up-down difference with Pythagoras' theorem:\n\n```\ndx = 80 - 20 = 60\ndy = 110 - 30 = 80\ndistance = square root(60 x 60 + 80 x 80) = 100\n```\n\nThe distance is always zero or positive; it does not matter which sprite you write first.\n\n### The detection threshold\nIf the ghost chases across the whole map, the game becomes hard. Instead we choose a **threshold**: if the distance is smaller than the threshold, the ghost \"wakes up\". The rule:\n\n```\nevery frame:\n  if distance < 70 do\n    hayalet follows kedi at speed 25\n  else\n    hayalet stops\n```\n\nThe `every frame` event runs 60 times a second, so the ghost checks \"is the cat near?\" 60 times a second. If you put this check inside `when game starts`, it is only checked once; even if the cat comes close later, the rule is not tested again.\n\n### stops and stops following\n`stops` sets the speed to zero and ends the following. `stops following` only ends the following; the speed stays as it is. The ghost keeps sliding in its current direction at its current speed. That is why we put `stops` in the \"else\" branch.\n\n### Summary\nThe follow block walks one sprite towards another at a fixed speed. The distance block measures between the centres in pixels. By combining a distance threshold with `if ... else`, you make the ghost an enemy that only wakes up when you are near. To really stop following, use `stops`.",
            "concepts": [
              {
                "term": "Following",
                "definition": "A sprite moving towards a target sprite at a fixed speed, every frame.",
                "example": "The ghost follows the cat at speed 25 and turns whichever way the cat goes.",
                "pitfall": "Putting the same sprite in both slots: the sprite tries to follow itself and does not move at all."
              },
              {
                "term": "Distance",
                "definition": "How far apart the centres of two sprites are, in pixels.",
                "example": "If the centres are 60 pixels apart sideways and 80 pixels apart up-down, the distance is 100.",
                "pitfall": "Thinking only the sideways difference is the distance; the up-down difference counts too."
              },
              {
                "term": "Detection threshold",
                "definition": "The largest distance at which the enemy notices the player; in the rule it is written as the number in a comparison.",
                "example": "If the distance is less than 70, the ghost chases; otherwise it stops.",
                "pitfall": "Choosing a threshold that is too big: the ghost sees you from everywhere and the game becomes unfairly hard."
              },
              {
                "term": "stops and stops following",
                "definition": "stops sets the speed to zero and ends the following; stops following only ends the following and leaves the speed as it is.",
                "example": "If stops following is used, the ghost keeps sliding at its last speed.",
                "pitfall": "Using stops following where it should stop: the ghost slides as if it were on ice."
              },
              {
                "term": "Every frame",
                "definition": "An event that runs 60 times a second while the game is on; used for rules that must be checked all the time.",
                "example": "A ghost that measures the distance every frame notices at once when the cat comes near.",
                "pitfall": "Putting the distance check inside when game starts: it is checked once and never tested again."
              }
            ],
            "quiz": [
              {
                "id": "m11h4d17-q1",
                "kind": "numeric",
                "prompt": "The ghost's centre is at (20, 30) and the cat's centre is at (80, 110). What does the distance block give?",
                "answer": 100,
                "tolerance": 0,
                "unit": "pixels",
                "explanation": "The sideways difference is 80 - 20 = 60, the up-down difference is 110 - 30 = 80. Distance = square root(60 x 60 + 80 x 80) = square root(10000) = 100. Adding the differences to get 140 is wrong; the distance is the diagonal line.",
                "skills": [
                  "game-distance"
                ]
              },
              {
                "id": "m11h4d17-q2",
                "kind": "numeric",
                "prompt": "The cat is standing still. The ghost wakes up 70 pixels from the cat and follows at speed 25. How many seconds pass until the distance drops to 20 pixels?",
                "answer": 2,
                "tolerance": 0.05,
                "unit": "s",
                "explanation": "The gap to close is 70 - 20 = 50 pixels. Time = distance / speed = 50 / 25 = 2 seconds. Because following moves in a straight line at a fixed speed, the calculation is direct.",
                "skills": [
                  "game-follow",
                  "game-distance"
                ]
              },
              {
                "id": "m11h4d17-q3",
                "kind": "predict-output",
                "prompt": "The program is:\n\n```\nevery frame:\n  if distance(hayalet, kedi) < 70 do\n    hayalet follows kedi at speed 25\n  else\n    hayalet stops following\n```\n\nThe cat comes near the ghost, and the ghost wakes up and chases. Then the cat moves away fast and the distance goes past 70. What does the ghost do?",
                "options": [
                  "It stops at once",
                  "It goes back to where it started",
                  "It disappears from the screen",
                  "It keeps sliding in the same direction at its last speed"
                ],
                "answer": 3,
                "explanation": "\"Stops following\" only breaks the follow link; the speed stays as it is. The ghost keeps going in its current direction at speed 25. To make it stop, \"stops\" should have been put in the else branch.",
                "skills": [
                  "game-follow",
                  "game-condition",
                  "game-debug"
                ]
              },
              {
                "id": "m11h4d17-q4",
                "kind": "find-bug",
                "prompt": "The ghost does not move at all. Which is the bug?\n\n```\nevery frame:\n  hayalet follows sprite hayalet at speed 25\n```",
                "options": [
                  "The follow speed should not be 25",
                  "The every frame event cannot be used for following",
                  "The ghost is also chosen as the target; the ghost is following itself",
                  "The ghost should not be of the Enemy kind"
                ],
                "answer": 2,
                "explanation": "The same sprite has been put in both slots of the follow block. A sprite cannot follow itself, so the block does nothing. The cat should have been put in the second slot. The speed and the event choice are correct.",
                "skills": [
                  "game-debug",
                  "game-follow"
                ]
              },
              {
                "id": "m11h4d17-q5",
                "kind": "mcq",
                "prompt": "Why do we write the distance check inside \"every frame\" instead of \"when game starts\"?",
                "options": [
                  "The distance changes as the cat moves; the rule must be tested again 60 times a second",
                  "The when game starts event does not support the distance block",
                  "Every frame takes up less space",
                  "The follow block only works inside every frame"
                ],
                "answer": 0,
                "explanation": "The when game starts block runs only once; if the cat comes near later, nobody checks again. The every frame event runs 60 times a second, so the ghost notices at once when the cat comes near. When game starts can use the distance block too; the problem is the timing.",
                "skills": [
                  "game-condition",
                  "game-distance"
                ]
              }
            ]
          }
        },
        {
          "title": "Rastgele hareket: şaşkın yarasa",
          "durationMin": 20,
          "problem": "Her seferinde aynı yolu giden düşman çabuk sıkar; oyuncu desenini öğrenir. Bazı düşmanlar ise sanki kafası karışmış gibi her an başka yöne uçar. Bilgisayar \"rastgele\" yi nasıl yapar? Bu derste bir yarasaya, her yarım saniyeye yakın bir sürede kendi kendine yön seçtireceksin.",
          "contentMd": "Sahnede ekranın ortasında duran bir yarasa var. Hiçbir hareketi yok. `her [700] ms'de bir` olayı da boş olarak hazır. Yarasa \"ekranda kalsın\" ayarıyla başlıyor; bu yüzden ekranın dışına çıkamaz.\n\n### Yön ve rastgele sayı\nYön derecedir: 0 yukarı, 90 sağ, 180 aşağı, 270 sol demektir. **Matematik** kategorisindeki `[1] ile [100] arasında rastgele sayı` bloğu aralıktan her seferinde bir sayı seçer. Aralık 0 ile 359 olursa her yönü kapsar.\n\n### Blokları kur\n1. **Hareket** kategorisinden `[bu sprite] [90] derece yönünde [40] hızla gitsin` bloğunu al ve `her 700 ms'de bir` bloğunun içine tak. `bu sprite` yerine `yarasa` değişkenini koy.\n2. Yön kutusundaki 90'ın yerine **Matematik** kategorisinden `[1] ile [100] arasında rastgele sayı` bloğunu tak. İlk sayıyı 0, ikinci sayıyı 359 yap.\n3. ↺ bas. Yarasa her yarım saniye civarında başka bir yöne uçuyor. Ekranın kenarına gelince duruyor, çünkü \"ekranda kalsın\" ayarı var.\n4. Programı birkaç kez durdurup yeniden başlat. Her seferinde yarasa başka bir yol çiziyor.\n\nBeklenen sonuç: Yarasa kıpırdıyor, ekrandan çıkmıyor ve yolu her çalıştırmada değişiyor. (Etkinlik bunu iki farklı rastgelelik \"tohumu\" ile deneyip kontrol eder.)\n\n### Nasıl çalışıyor?\n- `hızla gitsin` bloğu bir yönü ve hızı birlikte verir. Aslında x ve y hızını senin yerine hesaplar.\n- Zamanlayıcı her 700 ms'de yeni bir yön seçtirir. Arada yarasa sabit yönde gider.\n- Rastgele sayılar bilgisayarda formülle üretilir. Bu oyunda formül her çalıştırmada başlangıç sayısına (\"tohum\") göre ilerler; bu yüzden etkinlik kontrolü tutarlı yapılabilir.\n- Daha kısa zamanlayıcı, daha titrek ve kaçınılması zor bir yarasa yapar. Daha uzun zamanlayıcı daha kolay tahmin edilir.\n\n### Dene\n1. Zamanlayıcıyı 300, sonra 2000 ms yap. Hangisi daha tehlikeli hissettiriyor?\n2. Hızı da rastgele yap: `hızla gitsin` bloğunun hız kutusuna 20 ile 60 arası rastgele sayı koy.\n3. Yarasa kenara takılıp kalıyor mu? \"Ekranda kalsın\" yerine \"duvar/kenara çarpınca sekmeli: evet\" ayarını dene.\n\n### Sık yapılan hatalar\n- Rastgele sayı aralığını 1-100 bırakırsan yarasa hep sağa ve biraz yukarı gider. Yön için 0-359 gerekir.\n- Rastgele yönü `oyun başlayınca` içine koymak: yön bir kez seçilir ve yarasa hep aynı yöne gider.\n- `hızla gitsin` bloğunu zamanlayıcının dışında bırakmak: blok hiç çalışmaz.",
          "question": "\"Tamamen rastgele\" bir düşman her zaman iyi mi? Oyuncu öğrenebileceği bir düzen bulamazsa oyun ne kadar adil olur? Biraz rastgele, biraz düzenli bir düşmanı nasıl tarif edersin?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Yönün derece olarak nasıl verildiğini (0 yukarı, 90 sağ, 180 aşağı, 270 sol)\n- `derece yönünde ... hızla gitsin` bloğunu\n- Rastgele sayı bloğunun aralığını doğru seçmeyi\n- Bilgisayarın \"rastgele\" sayıyı nasıl ürettiğini\n\n### Önceden bilmen gerekenler\nDers 16: `her ... ms'de bir` olayı ve hız. Daha önceki haftalardan: sprite yaratmak, `ekranda kalsın` ayarı ve hız bloğu.\n\n### Yön, derece olarak\nBir sprite'a \"x hızı şu, y hızı bu\" demek yerine \"şu yöne, şu hızla git\" diyebilirsin. Yön derecedir ve pusula gibi okunur:\n\n```\n  0 derece   = yukarı\n 90 derece   = sağ\n180 derece   = aşağı\n270 derece   = sol\n```\n\nAradaki sayılar çaprazlardır: 45 yukarı-sağ, 225 aşağı-sol. `derece yönünde ... hızla gitsin` bloğu bu iki bilgiyi senin yerine x ve y hızına çevirir. Örneğin yön 270, hız 30 ise x hızı -30, y hızı 0 olur. Sprite 3 saniyede 90 piksel sola gider.\n\n### Rastgele sayı\n`[1] ile [100] arasında rastgele sayı` bloğu her çalıştığında verilen aralıktan bir tam sayı seçer. İki uç sayı da seçilebilir: 5 ile 8 arası dersen 5, 6, 7 ya da 8 gelir (4 olasılık). Yön için bütün daireyi kapsayan 0 ile 359 aralığı gerekir. 1 ile 100 yazarsan yönün hepsi sağ tarafta kalır ve yarasa hiçbir zaman sola gitmez.\n\n### Neden rastgele?\nDüşman hep aynı yolu giderse oyuncu bunu ezberler. Rastgele hareket düşmanı tahmin edilmez yapar. Zamanlayıcı süresi karakteri belirler: 300 ms yarasayı titrek ve kaçınması zor, 2000 ms ise uzun süre aynı yöne giden ve kolay tahmin edilen biri yapar.\n\n### Tohum: bilgisayar zar atmaz\nBilgisayar gerçekten zar atmaz. Rastgele sayıları bir formülle üretir. Formül bir başlangıç sayısından, yani **tohum**dan yola çıkar. Aynı tohumla başlarsan hep aynı sayı dizisini alırsın. Bu oyunda tohum her çalıştırmada değiştiği için yarasa her seferinde başka bir yol çizer. Etkinliğin kendi kontrolü ise farklı iki tohum deneyerek yolların farklı olduğuna bakar.\n\n### Özet\nYön 0 ile 359 derece arasındadır: 0 yukarı, 90 sağ, 180 aşağı, 270 sol. `derece yönünde ... hızla gitsin` yönü ve hızı birlikte verir. Rastgele sayı aralığı yönü kapsayacak şekilde seçilmelidir (0-359). Rastgelelik tohumlu bir formüldür; zamanlayıcı süresi düşmanın ne kadar telaşlı olacağını belirler.",
          "concepts": [
            {
              "term": "Yön (derece)",
              "definition": "Hareketin pusula gibi okunan açısı: 0 yukarı, 90 sağ, 180 aşağı, 270 sol.",
              "example": "270 derece, 30 hız verilirse sprite saniyede 30 piksel sola gider.",
              "pitfall": "0 derecenin sağ olduğunu sanmak; bu oyunda 0 yukarıdır, sağ 90'dır."
            },
            {
              "term": "Rastgele sayı",
              "definition": "Verilen aralıktan her çalışışta bir tam sayı seçen blok; iki uç sayı da seçilebilir.",
              "example": "5 ile 8 arasında rastgele sayı 5, 6, 7 ya da 8 verebilir.",
              "pitfall": "Aralığı amaca uydurmamak: yön için 1-100 yazılırsa hiçbir zaman sola gidilmez."
            },
            {
              "term": "Tohum",
              "definition": "Rastgele sayı formülünün başlangıç sayısı; aynı tohum aynı sayı dizisini verir.",
              "example": "Oyun her çalıştırmada başka bir tohum aldığı için yarasanın yolu hep farklıdır.",
              "pitfall": "Bilgisayarın gerçekten zar attığını sanmak; sayılar bir formülden çıkar."
            },
            {
              "term": "Zamanlayıcı süresi",
              "definition": "Rastgele yönün ne sıklıkla yenileneceğini belirler.",
              "example": "300 ms yarasayı titrek, 2000 ms daha tahmin edilebilir yapar.",
              "pitfall": "Rastgele yönü oyun başlayınca içine koymak: yön yalnız bir kez seçilir ve yarasa hep aynı yöne gider."
            },
            {
              "term": "derece yönünde ... hızla gitsin",
              "definition": "Yönü ve hızı birlikte verir; motor bunları x ve y hızına çevirir.",
              "example": "180 derece, 40 hız: x hızı 0, y hızı 40 olur ve sprite aşağı iner.",
              "pitfall": "Bloğu zamanlayıcının dışında bırakmak: hiç çalışmaz."
            }
          ],
          "quiz": [
            {
              "id": "m11h4d18-q1",
              "kind": "predict-output",
              "prompt": "Program şöyle:\n\n```\noyun başlayınca:\n  yarasa konumu x 100, y 60\n  yarasa 180 derece yönünde 40 hızla gitsin\n```\n\nYarasa nasıl hareket eder?",
              "options": [
                "Sağa doğru yatay gider",
                "Aşağı doğru iner",
                "Yukarı doğru çıkar",
                "Sola doğru yatay gider"
              ],
              "answer": 1,
              "explanation": "Yön derecesinde 0 yukarı, 90 sağ, 180 aşağı, 270 sol demektir. 180 derece aşağıdır: x hızı 0, y hızı 40 olur ve yarasa saniyede 40 piksel iner.",
              "skills": [
                "game-heading",
                "game-velocity"
              ]
            },
            {
              "id": "m11h4d18-q2",
              "kind": "numeric",
              "prompt": "Yarasa x = 100 noktasında. 270 derece yönünde 30 hızla gitmeye başlıyor ve 3 saniye boyunca hiçbir şey onu durdurmuyor. 3 saniye sonra x değeri kaç olur?",
              "answer": 10,
              "tolerance": 0,
              "unit": "piksel",
              "explanation": "270 derece soldur; x hızı -30'dur. 3 saniyede 30 x 3 = 90 piksel sola gidilir: 100 - 90 = 10. Sağa gitmiş olsaydı 190 bulurdu.",
              "skills": [
                "game-heading",
                "game-velocity"
              ]
            },
            {
              "id": "m11h4d18-q3",
              "kind": "find-bug",
              "prompt": "Yarasa rastgele yön seçiyor ama hep ekranın sağ tarafına doğru uçuyor, hiç sola gitmiyor. Hata hangisi?\n\n```\nher 700 ms'de bir:\n  yarasa [1 ile 100 arasında rastgele sayı] derece yönünde 40 hızla gitsin\n```",
              "options": [
                "Zamanlayıcı 700 ms olmamalı",
                "Hız 40 yerine 400 olmalı",
                "Yarasa ekranda kalsın ayarı açık olmamalı",
                "Yön için seçilen aralık (1-100) yalnız sağ tarafı kapsıyor; 0-359 olmalı"
              ],
              "answer": 3,
              "explanation": "1 ile 100 derece arası yönlerin hepsi yukarıdan sağa doğru bir bölgedir; sol (270) ve aşağı-sol yönler seçilemez. Yönün bütün dairesi için 0 ile 359 yazılmalıdır. Zamanlayıcı ve hız bu yönü etkilemez.",
              "skills": [
                "game-random",
                "game-heading",
                "game-debug"
              ]
            },
            {
              "id": "m11h4d18-q4",
              "kind": "mcq",
              "prompt": "Aynı tohumla başlatılan iki oyun çalıştırması hakkında hangisi doğrudur?",
              "options": [
                "Yarasa iki seferde de aynı rastgele yönleri seçer",
                "Yarasa her seferinde mutlaka farklı yönler seçer",
                "Rastgele sayı bloğu ilk kez çalışınca hata verir",
                "Tohum yalnızca ses için kullanılır"
              ],
              "answer": 0,
              "explanation": "Rastgele sayılar bir formülden çıkar ve formül tohumdan başlar. Aynı tohum aynı sayı dizisini üretir. Normal oynarken tohum her seferinde değiştiği için yollar farklı görünür.",
              "skills": [
                "game-random"
              ]
            },
            {
              "id": "m11h4d18-q5",
              "kind": "numeric",
              "prompt": "\"5 ile 8 arasında rastgele sayı\" bloğu (iki uç sayı dahil) kaç farklı değer verebilir?",
              "answer": 4,
              "tolerance": 0,
              "unit": "değer",
              "explanation": "Uçlar dahildir: 5, 6, 7 ve 8. Yani 8 - 5 = 3 değil, 8 - 5 + 1 = 4 farklı değer vardır. 0 ile 359 aralığı da 360 farklı yön verir.",
              "skills": [
                "game-random"
              ]
            }
          ],
          "contentEn": {
            "title": "Random movement: the confused bat",
            "problem": "An enemy that takes the same path every time soon gets boring; the player learns its pattern. Some enemies, though, fly off in a different direction at every moment, as if they were confused. How does a computer do \"random\"? In this lesson you will make a bat choose its own direction roughly every half second.",
            "contentMd": "On the stage there is a bat standing in the middle of the screen. It does not move at all. The `every [700] ms` event is ready too, empty. The bat starts with the \"stay on screen\" setting, so it cannot leave the screen.\n\n### Direction and random numbers\nDirection is in degrees: 0 means up, 90 right, 180 down and 270 left. The `random integer from [1] to [100]` block in the **Math** category picks a number from the range each time. If the range is 0 to 359, it covers every direction.\n\n### Build the blocks\n1. From the **Motion** category, take the `[this sprite] moves in direction [90] degrees at speed [40]` block and snap it inside the `every 700 ms` block. Replace `this sprite` with the `yarasa` (bat) variable.\n2. In place of the 90 in the direction slot, snap in the `random integer from [1] to [100]` block from the **Math** category. Make the first number 0 and the second number 359.\n3. Press ↺. The bat flies in a different direction about every half second. When it reaches the edge of the screen it stops, because it has the \"stay on screen\" setting.\n4. Stop and restart the program a few times. Each time the bat draws a different path.\n\nExpected result: the bat moves, does not leave the screen, and its path changes on every run. (The activity checks this by trying it with two different randomness \"seeds\".)\n\n### How does it work?\n- The `at speed` block gives a direction and a speed together. In fact, it works out the x and y speeds for you.\n- The timer makes it choose a new direction every 700 ms. In between, the bat goes in a fixed direction.\n- On a computer, random numbers are made with a formula. In this game the formula moves on from a starting number (the \"seed\") on each run; that is why the activity check can be done reliably.\n- A shorter timer makes a jumpier bat that is hard to avoid. A longer timer is easier to predict.\n\n### Try it\n1. Set the timer to 300, then to 2000 ms. Which one feels more dangerous?\n2. Make the speed random as well: put a random number between 20 and 60 in the speed slot of the `at speed` block.\n3. Does the bat get stuck at the edge? Instead of \"stay on screen\", try the \"bounce off walls/edges: yes\" setting.\n\n### Common mistakes\n- If you leave the random number range at 1-100, the bat always goes right and a little up. For direction you need 0-359.\n- Putting the random direction inside `when game starts`: the direction is chosen once and the bat always goes the same way.\n- Leaving the `at speed` block outside the timer: the block never runs.",
            "question": "Is a \"completely random\" enemy always good? If the player cannot find a pattern to learn, how fair is the game? How would you describe an enemy that is a bit random and a bit regular?",
            "explainerMd": "### What you will learn in this lesson\n- How direction is given in degrees (0 up, 90 right, 180 down, 270 left)\n- The `moves in direction ... degrees at speed` block\n- How to choose the right range for the random number block\n- How a computer makes a \"random\" number\n\n### What you should know first\nLesson 16: the `every ... ms` event and speed. From earlier weeks: making a sprite, the `stay on screen` setting and the speed block.\n\n### Direction, in degrees\nInstead of telling a sprite \"your x speed is this, your y speed is that\", you can say \"go this way at this speed\". Direction is in degrees and is read like a compass:\n\n```\n  0 degrees   = up\n 90 degrees   = right\n180 degrees   = down\n270 degrees   = left\n```\n\nThe numbers in between are diagonals: 45 is up-right, 225 is down-left. The `moves in direction ... degrees at speed` block turns these two pieces of information into x and y speeds for you. For example, if the direction is 270 and the speed is 30, the x speed becomes -30 and the y speed 0. The sprite travels 90 pixels to the left in 3 seconds.\n\n### Random numbers\nEach time it runs, the `random integer from [1] to [100]` block picks a whole number from the given range. Both end numbers can be picked: if you say 5 to 8, you get 5, 6, 7 or 8 (4 possibilities). For direction you need the range 0 to 359, which covers the whole circle. If you write 1 to 100, all the directions are on the right-hand side and the bat never goes left.\n\n### Why random?\nIf an enemy always takes the same path, the player learns it by heart. Random movement makes the enemy unpredictable. The timer length sets its character: 300 ms makes the bat jumpy and hard to avoid, while 2000 ms makes it one that goes the same way for a long time and is easy to predict.\n\n### The seed: computers do not roll dice\nA computer does not really roll dice. It makes random numbers with a formula. The formula starts from a starting number, called the **seed**. If you start with the same seed, you always get the same list of numbers. In this game the seed changes on every run, so the bat draws a different path each time. The activity's own check tries two different seeds and makes sure the paths are different.\n\n### Summary\nDirection is between 0 and 359 degrees: 0 up, 90 right, 180 down, 270 left. `moves in direction ... degrees at speed` gives the direction and the speed together. The random number range must be chosen to cover every direction (0-359). Randomness is a formula with a seed; the timer length decides how restless the enemy will be.",
            "concepts": [
              {
                "term": "Direction (degrees)",
                "definition": "The angle of movement, read like a compass: 0 up, 90 right, 180 down, 270 left.",
                "example": "Given 270 degrees and speed 30, the sprite goes 30 pixels to the left every second.",
                "pitfall": "Thinking 0 degrees is right; in this game 0 is up and right is 90."
              },
              {
                "term": "Random number",
                "definition": "A block that picks a whole number from the given range each time it runs; both end numbers can be picked.",
                "example": "A random integer from 5 to 8 can give 5, 6, 7 or 8.",
                "pitfall": "Not matching the range to the job: if you write 1-100 for direction, it never goes left."
              },
              {
                "term": "Seed",
                "definition": "The starting number of the random number formula; the same seed gives the same list of numbers.",
                "example": "Because the game takes a different seed on every run, the bat's path is always different.",
                "pitfall": "Thinking the computer really rolls dice; the numbers come from a formula."
              },
              {
                "term": "Timer length",
                "definition": "Decides how often the random direction is renewed.",
                "example": "300 ms makes the bat jumpy; 2000 ms makes it more predictable.",
                "pitfall": "Putting the random direction inside when game starts: the direction is chosen only once and the bat always goes the same way."
              },
              {
                "term": "moves in direction ... at speed",
                "definition": "Gives the direction and the speed together; the engine turns them into x and y speeds.",
                "example": "180 degrees, speed 40: the x speed becomes 0, the y speed 40, and the sprite moves down.",
                "pitfall": "Leaving the block outside the timer: it never runs."
              }
            ],
            "quiz": [
              {
                "id": "m11h4d18-q1",
                "kind": "predict-output",
                "prompt": "The program is:\n\n```\nwhen game starts:\n  move yarasa to x 100, y 60\n  yarasa moves in direction 180 degrees at speed 40\n```\n\nHow does the bat move?",
                "options": [
                  "It goes sideways to the right",
                  "It moves down",
                  "It moves up",
                  "It goes sideways to the left"
                ],
                "answer": 1,
                "explanation": "In degrees, 0 means up, 90 right, 180 down and 270 left. 180 degrees is down: the x speed becomes 0, the y speed 40, and the bat moves down 40 pixels every second.",
                "skills": [
                  "game-heading",
                  "game-velocity"
                ]
              },
              {
                "id": "m11h4d18-q2",
                "kind": "numeric",
                "prompt": "The bat is at x = 100. It starts moving in direction 270 degrees at speed 30, and nothing stops it for 3 seconds. What is its x value after 3 seconds?",
                "answer": 10,
                "tolerance": 0,
                "unit": "pixels",
                "explanation": "270 degrees is left; the x speed is -30. In 3 seconds it goes 30 x 3 = 90 pixels to the left: 100 - 90 = 10. If it had gone right, you would get 190.",
                "skills": [
                  "game-heading",
                  "game-velocity"
                ]
              },
              {
                "id": "m11h4d18-q3",
                "kind": "find-bug",
                "prompt": "The bat picks a random direction, but it always flies towards the right of the screen and never goes left. Which is the bug?\n\n```\nevery 700 ms:\n  yarasa moves in direction [random integer from 1 to 100] degrees at speed 40\n```",
                "options": [
                  "The timer should not be 700 ms",
                  "The speed should be 400 instead of 40",
                  "The bat's stay on screen setting should not be on",
                  "The range chosen for direction (1-100) only covers the right-hand side; it should be 0-359"
                ],
                "answer": 3,
                "explanation": "Directions from 1 to 100 degrees are all in an area from up to right; left (270) and down-left directions cannot be picked. For the whole circle of directions you should write 0 to 359. The timer and the speed do not affect this direction.",
                "skills": [
                  "game-random",
                  "game-heading",
                  "game-debug"
                ]
              },
              {
                "id": "m11h4d18-q4",
                "kind": "mcq",
                "prompt": "Which is true about two game runs started with the same seed?",
                "options": [
                  "The bat picks the same random directions both times",
                  "The bat always picks different directions each time",
                  "The random number block gives an error the first time it runs",
                  "The seed is only used for sound"
                ],
                "answer": 0,
                "explanation": "Random numbers come from a formula, and the formula starts from the seed. The same seed makes the same list of numbers. In normal play the seed changes every time, so the paths look different.",
                "skills": [
                  "game-random"
                ]
              },
              {
                "id": "m11h4d18-q5",
                "kind": "numeric",
                "prompt": "How many different values can the \"random integer from 5 to 8\" block give (both end numbers included)?",
                "answer": 4,
                "tolerance": 0,
                "unit": "values",
                "explanation": "The ends are included: 5, 6, 7 and 8. So there are not 8 - 5 = 3 but 8 - 5 + 1 = 4 different values. The range 0 to 359 likewise gives 360 different directions.",
                "skills": [
                  "game-random"
                ]
              }
            ]
          }
        },
        {
          "title": "Ateş etme: lazerle vur",
          "durationMin": 25,
          "problem": "Uzay oyunlarında gemi bir tuşa basınca lazer çıkar ve düşman patlar. Ekranda bir \"lazer\" nesnesi birden nasıl doğuyor? Kim onu hareket ettiriyor? Bu derste A düğmesine her basışta yeni bir mermi sprite'ı yaratacak ve onu düşmanın üstüne göndereceksin.",
          "contentMd": "Sahnede gece gökyüzü, altta bir uzay gemisi ve üstte duran bir uzaylı var. Gemi sağa-sola ok tuşlarıyla hareket ediyor ve ekranda kalıyor. Skor 0'dan başlıyor. Başlangıç projesi hazır gelir; ateş etme sende.\n\n### Mermi de bir sprite\nLazer, hareket eden küçük bir sprite'tır. Ona **Mermi** türünü veririz. Böylece \"bir Mermi sprite'ı bir Düşman sprite'ına çarpınca\" gibi bir kural yazabiliriz.\n\n### Blokları kur: lazeri çıkar\n1. **Değişken** kategorisinde **Değişken oluştur…** düğmesine bas ve `lazer` adını ver.\n2. **Denetleyici** kategorisinden `[A] düğmesine [basılınca]` bloğunu al ve çalışma alanına bırak.\n3. **Değişken** kategorisinden `[lazer] değişkenini [ ] yap` bloğunu al ve bu olayın içine tak. Değer kutusuna **Sprite** kategorisinden `yeni [resim] sprite'ı, türü [tür]` bloğunu tak. Resim listesinden **Lazer**'i, tür listesinden **Mermi**'yi seç.\n4. **Sprite** kategorisinden `[bu sprite] konumu x [80] y [60]` bloğunu al ve altına tak. `bu sprite` yerine `lazer` koy.\n5. x kutusuna `[gemi] x konumu` bloğunu tak (**Sprite** kategorisindeki `[bu sprite] [x konumu]` bloğunu al, sprite olarak `gemi`'yi seç). y kutusuna **Matematik** kategorisinden bir çıkarma bloğu (`[ ] - [ ]`) tak: soluna `gemi y konumu`, sağına 12 koy. Lazer böylece geminin burnundan çıkar.\n6. **Hareket** kategorisinden `[lazer] hızı x [0] y [-140]` bloğunu altına tak. Eksi y yukarı demektir.\n7. **Sprite** kategorisinden `[lazer] [dünyadan çıkınca silinsin]: [evet]` bloğunu ekle. Böylece ekranın üstünden çıkan lazerler silinir ve sahne dolmaz.\n8. ↺ bas ve boşluk (A) tuşuna bas. Gemiden yukarı doğru lazerler çıkıyor.\n\n### Blokları kur: vur\n9. **Sprite** kategorisinden `bir [Mermi] sprite'ı bir [Düşman] sprite'ına çarpınca` olayını al.\n10. İçine sırayla: **Oyun** kategorisinden `skoru [10] değiştir`; **Ses** kategorisinden `[patlama] melodisini çal`; **Sprite** kategorisinden `[diğer sprite] patlayıp yok olsun` ve `[bu sprite] sprite'ını sil`.\n11. ↺ bas. Gemiyi uzaylının altına getirip boşluk tuşuna bas: uzaylı patlıyor, skor 10 oluyor.\n\nBeklenen sonuç: A'ya basınca yukarı giden bir lazer çıkıyor, uzaylıyı vurunca uzaylı patlıyor, lazer siliniyor ve skor artıyor.\n\n### Nasıl çalışıyor?\n- A düğmesine her basış olayı bir kez çalıştırır. Yani her basış yepyeni bir mermi sprite'ı yaratır. Düğmeyi basılı tutmak seri atış yapmaz.\n- `diğer sprite` ve `bu sprite` çarpışma olayında sırayla ikinci ve birinci türdeki sprite'tır. Biz \"Mermi çarpınca Düşman\" yazdık: `bu sprite` lazer, `diğer sprite` uzaylı.\n- Çarpışma olayı iki sprite üst üste geldikleri anda bir kez çalışır. Lazeri silmezsen, uzaylı patlasa bile lazer yoluna devam eder.\n- Hız -140 demek saniyede 140 piksel yukarı. Geminin burnundan uzaylının yerine yaklaşık yarım saniyede ulaşır.\n\n### Dene\n1. Lazerin hızını -60 yap: daha yavaş ama daha kolay gören bir lazer. Hızı -300 yap: çok hızlı lazer uzaylıyı hiç kaçırmıyor mu?\n2. Atışı B düğmesine bağla: **Denetleyici** kategorisinde `[B] düğmesine [basılınca]` var.\n3. Gemi iki lazer atsın: aynı olayın içinde ikinci bir lazer sprite'ı yarat, x konumunu gemiden 6 piksel sola ve 6 piksel sağa kaydır.\n4. Uzaylıya hız ver: `uzayli hızı x 30 y 0` ve `sekmeli: evet` ayarı ekle. Hareketli hedefi vurmak daha eğlenceli.\n\n### Sık yapılan hatalar\n- Mermi türünü `Nesne` bırakmak: çarpışma olayı \"Mermi\" türünü beklediği için hiç çalışmaz.\n- Lazerin hızını 0 bırakmak: lazer gemiden çıkar ama yerinde kalır.\n- Lazeri hiç silmemek: ekranda yığılır. Yukarı çıkanlar için `dünyadan çıkınca silinsin`, vuranlar için `sil` kullan.\n- Çarpışma olayını, yani şapkalı bloğu, başka bir olayın içine koymak: olaylar yalnız tek başlarına çalışma alanında durur.",
          "question": "Oyuncu saniyede 20 kez A'ya bassaydı ekranda kaç lazer olurdu? Gerçek oyunlar atış hızını nasıl sınırlar?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Oyun çalışırken yeni bir sprite'ın (mermi) nasıl yaratıldığını\n- Sprite türünün (Mermi, Düşman) çarpışma kuralında neden önemli olduğunu\n- `bu sprite` ve `diğer sprite` bloklarının kim olduğunu\n- Kullanılmayan mermileri neden silmen gerektiğini\n\n### Önceden bilmen gerekenler\nDers 16-18: hız ve yön. Daha önceki haftalardan: sprite yaratmak ve tür vermek, değişken oluşturmak, `düğmeye basılınca` olayı, çarpışma olayı ve skor.\n\n### Mermi de bir sprite'tır\nLazer özel bir şey değildir: küçük, hızlı giden sıradan bir sprite'tır. Farkı, oyuncu bir tuşa bastığında **sonradan** yaratılmasıdır. Oyun başlarken ekranda yoktur. `A düğmesine basılınca` olayı çalışınca bir `yeni sprite` bloğu çalışır ve sahneye yeni bir lazer ekler.\n\nLazeri nereye koyacağını sen söylersin. Geminin burnundan çıksın diye x'i gemiyle aynı yapar, y'yi 12 piksel yukarı çekersin:\n\n```\nlazer x = gemi x\nlazer y = gemi y - 12\nlazer hızı = x 0, y -140\n```\n\nEksi y yukarıdır. -140 hız, lazerin saniyede 140 piksel yukarı gideceği anlamına gelir. Hız 0 kalırsa lazer yerinde asılı durur.\n\n### Her basış, yeni bir mermi\nOlay düğmeye basıldığı anda bir kez çalışır. Her basış yepyeni bir lazer sprite'ı demektir. Düğmeyi basılı tutmak seri atış yapmaz, çünkü basılı tutmak yeni bir basış sayılmaz. Saniyede 4 kez basarsan saniyede 4 yeni lazer olur. Lazer ekranda 1,5 saniye kalıyorsa, aynı anda en çok 4 x 1,5 = 6 lazer görünür.\n\n### Tür ve çarpışma\nÇarpışma kuralını `bir Mermi sprite'ı bir Düşman sprite'ına çarpınca` diye yazarız. Kural sprite'ın **türüne** bakar, adına değil. Lazeri `Nesne` türünde yaratırsan kural onu hiç tanımaz ve hiçbir şey olmaz. Olayın içinde iki özel blok vardır: `bu sprite` kuralda ilk yazılan türdür (burada lazer), `diğer sprite` ikinci yazılan türdür (burada uzaylı).\n\n### Temizlik\nÇarpışma olayı iki sprite üst üste geldiği anda yalnız bir kez çalışır. Lazeri silmezsen uzaylı patlasa bile lazer yoluna devam eder. Vuran lazeri `bu sprite'ı sil` ile, hedefi `diğer sprite patlayıp yok olsun` ile temizlersin. Hedefi vurmadan ekranın üstünden çıkan lazerler için de `dünyadan çıkınca silinsin: evet` ayarı gerekir; yoksa sahne zamanla mermiyle dolar.\n\n### Özet\nLazer, düğmeye basılınca yaratılan sıradan bir sprite'tır. Konumu geminin burnuna, hızı negatif y'ye verilir. Çarpışma kuralı türe bakar; `bu sprite` ilk, `diğer sprite` ikinci türdür. Vuran mermiyi sil, kaçan mermiyi `dünyadan çıkınca silinsin` ile temizle.",
          "concepts": [
            {
              "term": "Yeni sprite yaratmak",
              "definition": "Oyun çalışırken, bir olayın içinde sahneye yepyeni bir sprite eklemek.",
              "example": "A düğmesine her basışta yeni bir lazer sprite'ı yaratılır.",
              "pitfall": "Sprite'ı oyun başlayınca içinde bir kez yaratıp her basışta aynısını kullanmak: yalnız tek mermi olur."
            },
            {
              "term": "Mermi türü",
              "definition": "Çarpışma kuralının tanıyacağı etiket; lazer Mermi türünde yaratılırsa kural onu bulur.",
              "example": "Mermi, Düşman'a çarpınca skoru artır kuralı Mermi türündeki lazeri bulur.",
              "pitfall": "Türü Nesne bırakmak: çarpışma olayı hiç çalışmaz."
            },
            {
              "term": "bu sprite ve diğer sprite",
              "definition": "Çarpışma olayında ilk yazılan türdeki sprite bu sprite, ikincisi diğer sprite'tır.",
              "example": "Mermi Düşman'a çarpınca olayında bu sprite lazerdir, diğer sprite uzaylıdır.",
              "pitfall": "İkisini karıştırıp lazeri patlatmaya, uzaylıyı silmeye çalışmak."
            },
            {
              "term": "Dünyadan çıkınca silinsin",
              "definition": "Sprite ekranın dışına çıktığında kendiliğinden silinmesini sağlayan ayar.",
              "example": "Ekranın üstünden çıkan lazer silinir ve sahne dolmaz.",
              "pitfall": "Bu ayarı açmamak: kaçan mermiler birikir ve sahne dolar."
            },
            {
              "term": "Düğmeye basılınca",
              "definition": "Düğme basıldığı anda bir kez çalışan olay; basılı tutmak yeni bir çalışma başlatmaz.",
              "example": "A'ya iki kez basarsan iki lazer çıkar.",
              "pitfall": "Düğmeyi basılı tutarak seri atış beklemek."
            }
          ],
          "quiz": [
            {
              "id": "m11h4d19-q1",
              "kind": "numeric",
              "prompt": "Lazer y = 88 noktasında doğuyor ve saniyede 140 piksel yukarı gidiyor. Lazerin merkezi y = 18 noktasına kaç saniyede ulaşır?",
              "answer": 0.5,
              "tolerance": 0.01,
              "unit": "sn",
              "explanation": "Alınacak yol 88 - 18 = 70 pikseldir. Süre = yol / hız = 70 / 140 = 0,5 saniye. Not: gerçek oyunda sprite'ların boyu olduğu için çarpışma, merkezler buluşmadan biraz önce olur.",
              "skills": [
                "game-velocity",
                "game-spawn"
              ]
            },
            {
              "id": "m11h4d19-q2",
              "kind": "predict-output",
              "prompt": "Lazer \"dünyadan çıkınca silinsin\" ayarıyla yaratılıyor. Çarpışma olayı ise şöyle:\n\n```\nbir Mermi sprite'ı bir Düşman sprite'ına çarpınca:\n  skoru 10 değiştir\n  diğer sprite patlayıp yok olsun\n```\n\nLazer uzaylıyı vurduktan sonra ne olur?",
              "options": [
                "Lazer de hemen silinir",
                "Lazer durur ve uzaylının yerinde kalır",
                "Lazer yoluna devam eder, ekranın üstünden çıkınca silinir",
                "Lazer geri döner"
              ],
              "answer": 2,
              "explanation": "Olayda lazeri silen bir blok yok; yalnız uzaylı patlıyor. Lazer yukarı gitmeye devam eder ve ekrandan çıkınca ayar sayesinde silinir. Bu hata ekranda gereksiz mermi yığılmasına yol açar.",
              "skills": [
                "game-collision",
                "game-debug"
              ]
            },
            {
              "id": "m11h4d19-q3",
              "kind": "find-bug",
              "prompt": "Lazerler çıkıyor ve uzaylıya değiyor ama skor hiç artmıyor. Hata hangisi?\n\n```\nA düğmesine basılınca:\n  lazer = yeni [Lazer] sprite'ı, türü [Nesne]\n  lazer hızı x 0, y -140\n\nbir Mermi sprite'ı bir Düşman sprite'ına çarpınca:\n  skoru 10 değiştir\n```",
              "options": [
                "Lazer Nesne türünde yaratılmış; çarpışma kuralı Mermi türünü bekliyor",
                "Hız -140 olmamalı",
                "Skor 10 değil 1 değişmeli",
                "A düğmesi olayı çarpışmayla birlikte kullanılamaz"
              ],
              "answer": 0,
              "explanation": "Çarpışma kuralı sprite'ın türüne bakar. Lazer Nesne türünde olduğu için Mermi kuralı onu hiç görmez ve skor değişmez. Lazeri Mermi türünde yaratmak sorunu çözer. Hız ve skor sayıları hatalı değil.",
              "skills": [
                "game-debug",
                "game-collision",
                "game-spawn"
              ]
            },
            {
              "id": "m11h4d19-q4",
              "kind": "mcq",
              "prompt": "\"Bir Mermi sprite'ı bir Düşman sprite'ına çarpınca\" olayının içinde \"bu sprite\" kimdir?",
              "options": [
                "Düşman türündeki sprite",
                "Mermi türündeki sprite",
                "Oyuncu",
                "Rastgele biri"
              ],
              "answer": 1,
              "explanation": "Bu sprite, kuralda ilk yazılan türdür: Mermi. Diğer sprite ikinci türdür: Düşman. Lazeri silmek için bu sprite, uzaylıyı patlatmak için diğer sprite kullanılır.",
              "skills": [
                "game-collision"
              ]
            },
            {
              "id": "m11h4d19-q5",
              "kind": "numeric",
              "prompt": "Oyuncu saniyede 5 kez A'ya basıyor. Her lazer ekranda tam 2 saniye kalıyor (sonra siliniyor). Aynı anda ekranda en çok kaç lazer bulunur?",
              "answer": 10,
              "tolerance": 0,
              "unit": "lazer",
              "explanation": "Her saniye 5 yeni lazer yaratılır ve her biri 2 saniye yaşar: 5 x 2 = 10 lazer aynı anda ekranda olur. Düğmeyi basılı tutmak ise yeni bir basış saymadığı için bu sayıyı artırmaz.",
              "skills": [
                "game-spawn",
                "game-velocity"
              ]
            }
          ],
          "contentEn": {
            "title": "Shooting: hit it with a laser",
            "problem": "In space games, when you press a key the ship fires a laser and the enemy explodes. How does a \"laser\" object suddenly appear on the screen? Who moves it? In this lesson, every time you press the A button you will create a new bullet sprite and send it at the enemy.",
            "contentMd": "On the stage there is a night sky, a spaceship at the bottom and an alien waiting at the top. The ship moves left and right with the arrow keys and stays on the screen. The score starts at 0. The starter project is ready for you; the shooting is up to you.\n\n### A bullet is a sprite too\nThe laser is a small moving sprite. We give it the **Bullet** kind. That way we can write a rule like \"when a Bullet sprite hits an Enemy sprite\".\n\n### Build the blocks: fire the laser\n1. In the **Variables** category, press the **Create variable...** button and name it `lazer` (laser).\n2. From the **Controller** category, take the `when [A] button is [pressed]` block and drop it in the workspace.\n3. From the **Variables** category, take the `set [lazer] to [ ]` block and snap it inside this event. In the value slot, snap the `new [picture] sprite, kind [kind]` block from the **Sprite** category. Choose **Laser** from the picture list and **Bullet** from the kind list.\n4. From the **Sprite** category, take the `move [this sprite] to x [80] y [60]` block and snap it underneath. Replace `this sprite` with `lazer`.\n5. In the x slot, snap a `[gemi] x position` block (take the `[this sprite] [x position]` block from the **Sprite** category and choose `gemi` (ship) as the sprite). In the y slot, snap a subtraction block (`[ ] - [ ]`) from the **Math** category: put `gemi y position` on the left and 12 on the right. This way the laser comes out of the ship's nose.\n6. Snap the `set [lazer] speed x [0] y [-140]` block from the **Motion** category underneath. A minus y means up.\n7. Add the `[lazer] [delete when it leaves the world]: [yes]` block from the **Sprite** category. This way lasers that leave the top of the screen are deleted and the stage does not fill up.\n8. Press ↺ and press the space (A) key. Lasers come out of the ship going upwards.\n\n### Build the blocks: hit\n9. From the **Sprite** category, take the `when a [Bullet] sprite hits a [Enemy] sprite` event.\n10. Inside it, in this order: `change score by [10]` from the **Game** category; `play melody [boom]` from the **Sound** category; `make [other sprite] explode` and `delete sprite [this sprite]` from the **Sprite** category.\n11. Press ↺. Bring the ship under the alien and press the space key: the alien explodes and the score becomes 10.\n\nExpected result: when you press A, a laser comes out going upwards; when it hits the alien, the alien explodes, the laser is deleted and the score goes up.\n\n### How does it work?\n- Each press of the A button runs the event once. So each press creates a brand-new bullet sprite. Holding the button down does not fire again and again.\n- In a collision event, `other sprite` and `this sprite` are the sprites of the second and the first kind. We wrote \"when a Bullet hits an Enemy\": `this sprite` is the laser and `other sprite` is the alien.\n- The collision event runs once, at the moment the two sprites overlap. If you do not delete the laser, it carries on its way even after the alien explodes.\n- A speed of -140 means 140 pixels upwards every second. It gets from the ship's nose to where the alien is in about half a second.\n\n### Try it\n1. Set the laser's speed to -60: a slower laser that is easier to watch. Set it to -300: does the very fast laser ever miss the alien?\n2. Link firing to the B button: the **Controller** category has `when [B] button is [pressed]`.\n3. Make the ship fire two lasers: in the same event, create a second laser sprite, and move their x positions 6 pixels to the left and 6 pixels to the right of the ship.\n4. Give the alien a speed: add `set uzayli speed x 30 y 0` and the `bounce off walls/edges: yes` setting. Hitting a moving target is more fun.\n\n### Common mistakes\n- Leaving the bullet's kind as `Object`: the collision event expects the \"Bullet\" kind, so it never runs.\n- Leaving the laser's speed at 0: the laser comes out of the ship but stays where it is.\n- Never deleting the laser: lasers pile up on the screen. Use `delete when it leaves the world` for the ones that fly off the top and `delete` for the ones that hit.\n- Putting the collision event, the block with the rounded top, inside another event: events only work on their own in the workspace.",
            "question": "If the player pressed A 20 times a second, how many lasers would be on the screen? How do real games limit the rate of fire?",
            "explainerMd": "### What you will learn in this lesson\n- How a new sprite (a bullet) is created while the game is running\n- Why the sprite kind (Bullet, Enemy) matters in a collision rule\n- Who the `this sprite` and `other sprite` blocks are\n- Why you must delete bullets you no longer use\n\n### What you should know first\nLessons 16-18: speed and direction. From earlier weeks: making a sprite and giving it a kind, creating a variable, the `button is pressed` event, the collision event and the score.\n\n### A bullet is a sprite too\nThe laser is nothing special: it is an ordinary small sprite that moves fast. The difference is that it is created **later**, when the player presses a key. It is not on the screen when the game starts. When the `when A button is pressed` event runs, a `new sprite` block runs and adds a new laser to the stage.\n\nYou say where to put the laser. To make it come out of the ship's nose, you make its x the same as the ship's and move its y 12 pixels up:\n\n```\nlazer x = gemi x\nlazer y = gemi y - 12\nlazer speed = x 0, y -140\n```\n\nA minus y is up. A speed of -140 means the laser goes 140 pixels up every second. If the speed stays at 0, the laser hangs where it is.\n\n### Every press, a new bullet\nThe event runs once, at the moment the button is pressed. Every press means a brand-new laser sprite. Holding the button down does not fire again and again, because holding it does not count as a new press. If you press 4 times a second, you get 4 new lasers a second. If a laser stays on the screen for 1.5 seconds, you see at most 4 x 1.5 = 6 lasers at the same time.\n\n### Kind and collision\nWe write the collision rule as `when a Bullet sprite hits a Enemy sprite`. The rule looks at the sprite's **kind**, not its name. If you create the laser with the `Object` kind, the rule never recognises it and nothing happens. Inside the event there are two special blocks: `this sprite` is the kind written first in the rule (here the laser), and `other sprite` is the kind written second (here the alien).\n\n### Tidying up\nThe collision event runs only once, at the moment the two sprites overlap. If you do not delete the laser, it carries on its way even after the alien explodes. You clear away the laser that hit with `delete sprite this sprite`, and the target with `make other sprite explode`. For lasers that fly off the top of the screen without hitting anything, you also need the `delete when it leaves the world: yes` setting; otherwise the stage slowly fills up with bullets.\n\n### Summary\nA laser is an ordinary sprite created when a button is pressed. Its position is set to the ship's nose and its speed to a negative y. The collision rule looks at the kind; `this sprite` is the first kind and `other sprite` the second. Delete the bullet that hits, and clear away the bullet that misses with `delete when it leaves the world`.",
            "concepts": [
              {
                "term": "Creating a new sprite",
                "definition": "Adding a brand-new sprite to the stage from inside an event while the game is running.",
                "example": "Every time you press the A button, a new laser sprite is created.",
                "pitfall": "Creating the sprite once inside when game starts and using the same one for every press: there is only ever one bullet."
              },
              {
                "term": "Bullet kind",
                "definition": "The label the collision rule recognises; if the laser is created with the Bullet kind, the rule finds it.",
                "example": "The rule \"when a Bullet hits an Enemy, raise the score\" finds the laser of the Bullet kind.",
                "pitfall": "Leaving the kind as Object: the collision event never runs."
              },
              {
                "term": "this sprite and other sprite",
                "definition": "In a collision event, the sprite of the kind written first is this sprite and the second is other sprite.",
                "example": "In the event when a Bullet hits an Enemy, this sprite is the laser and other sprite is the alien.",
                "pitfall": "Mixing the two up and trying to blow up the laser and delete the alien."
              },
              {
                "term": "Delete when it leaves the world",
                "definition": "A setting that deletes a sprite by itself when it goes off the screen.",
                "example": "A laser that leaves the top of the screen is deleted and the stage does not fill up.",
                "pitfall": "Not turning this setting on: missed bullets pile up and the stage fills up."
              },
              {
                "term": "When button is pressed",
                "definition": "An event that runs once at the moment the button is pressed; holding it down does not start a new run.",
                "example": "If you press A twice, two lasers come out.",
                "pitfall": "Expecting rapid fire from holding the button down."
              }
            ],
            "quiz": [
              {
                "id": "m11h4d19-q1",
                "kind": "numeric",
                "prompt": "The laser appears at y = 88 and goes up at 140 pixels a second. In how many seconds does the laser's centre reach y = 18?",
                "answer": 0.5,
                "tolerance": 0.01,
                "unit": "s",
                "explanation": "The distance to travel is 88 - 18 = 70 pixels. Time = distance / speed = 70 / 140 = 0.5 seconds. Note: in the real game the sprites have a size, so the collision happens a little before the centres meet.",
                "skills": [
                  "game-velocity",
                  "game-spawn"
                ]
              },
              {
                "id": "m11h4d19-q2",
                "kind": "predict-output",
                "prompt": "The laser is created with the \"delete when it leaves the world\" setting. The collision event is:\n\n```\nwhen a Bullet sprite hits a Enemy sprite:\n  change score by 10\n  make other sprite explode\n```\n\nWhat happens after the laser hits the alien?",
                "options": [
                  "The laser is deleted at once too",
                  "The laser stops and stays where the alien was",
                  "The laser carries on its way and is deleted when it leaves the top of the screen",
                  "The laser comes back"
                ],
                "answer": 2,
                "explanation": "There is no block in the event that deletes the laser; only the alien explodes. The laser keeps going up and is deleted thanks to the setting when it leaves the screen. This bug leads to unneeded bullets piling up on the screen.",
                "skills": [
                  "game-collision",
                  "game-debug"
                ]
              },
              {
                "id": "m11h4d19-q3",
                "kind": "find-bug",
                "prompt": "The lasers come out and touch the alien, but the score never goes up. Which is the bug?\n\n```\nwhen A button is pressed:\n  lazer = new [Laser] sprite, kind [Object]\n  set lazer speed x 0, y -140\n\nwhen a Bullet sprite hits a Enemy sprite:\n  change score by 10\n```",
                "options": [
                  "The laser is created with the Object kind; the collision rule expects the Bullet kind",
                  "The speed should not be -140",
                  "The score should change by 1, not 10",
                  "The A button event cannot be used together with a collision"
                ],
                "answer": 0,
                "explanation": "The collision rule looks at the sprite's kind. Because the laser is of the Object kind, the Bullet rule never sees it and the score does not change. Creating the laser with the Bullet kind fixes the problem. The speed and score numbers are not wrong.",
                "skills": [
                  "game-debug",
                  "game-collision",
                  "game-spawn"
                ]
              },
              {
                "id": "m11h4d19-q4",
                "kind": "mcq",
                "prompt": "Inside the \"when a Bullet sprite hits a Enemy sprite\" event, who is \"this sprite\"?",
                "options": [
                  "The sprite of the Enemy kind",
                  "The sprite of the Bullet kind",
                  "The player",
                  "Someone at random"
                ],
                "answer": 1,
                "explanation": "This sprite is the kind written first in the rule: Bullet. Other sprite is the second kind: Enemy. You use this sprite to delete the laser and other sprite to blow up the alien.",
                "skills": [
                  "game-collision"
                ]
              },
              {
                "id": "m11h4d19-q5",
                "kind": "numeric",
                "prompt": "The player presses A 5 times a second. Each laser stays on the screen for exactly 2 seconds (then it is deleted). At most, how many lasers are on the screen at the same time?",
                "answer": 10,
                "tolerance": 0,
                "unit": "lasers",
                "explanation": "5 new lasers are created every second and each one lives for 2 seconds: 5 x 2 = 10 lasers are on the screen at the same time. Holding the button down does not raise this number, because it does not count as a new press.",
                "skills": [
                  "game-spawn",
                  "game-velocity"
                ]
              }
            ]
          }
        },
        {
          "title": "Proje: Hayalet avcısı",
          "durationMin": 35,
          "problem": "Bu haftanın hepsi bir arada: sekip duran bir devriye yarasası, seni kovalayan hayaletler, bir de ateş etmek. Hepsini aynı oyunda birleştirince gece bekçisi gibi hissedeceksin. Kendi oyunun mantığını parçalara bölüp tek tek kurma zamanı.",
          "contentMd": "### Ne yapacağız?\nGece sahnesinde bir avcı (astronot) ekranın altında. Yalnız sağa-sola yürüyebiliyor ve ekranda kalıyor. Skor 0, can 3 olarak hazır. Sen şunları ekleyeceksin:\n\n| Parça | Hangi derste öğrendin | Ne yapacak? |\n|---|---|---|\n| Devriye yarasası | 16 | Üstte gidip gelen bir yarasa |\n| Kovalayan hayaletler | 17 | Üstten gelip avcıyı takip eden hayaletler |\n| Lazer | 19 | A ile ateş, yukarı doğru |\n| Vurma kuralı | 19 | Her vuruş 1 puan, 5 puanda kazan |\n| Can kuralı | 9 | Düşman avcıya değerse can azalır |\n\n### Blokları kur\n1. **Yarasa:** `oyun başlayınca` bloğunun en altına yarasayı kur: `yarasa değişkenini [yeni [Yarasa] sprite'ı, türü [Düşman]] yap`, `yarasa konumu x 20 y 30`, `yarasa hızı x 40 y 0` ve `yarasa [duvar/kenara çarpınca sekmeli]: [evet]`. Yarasa ekranda gidip geliyor. (16. dersteki zamanlayıcı yöntemini de seçebilirsin.)\n2. **Hayaletler:** `her [900] ms'de bir` olayı kur. İçine: `hayalet değişkenini [yeni [Hayalet] sprite'ı, türü [Düşman]] yap`; `hayalet konumu x [10 ile 150 arasında rastgele sayı] y [-8]`; `[hayalet], [avci] sprite'ını [15] hızıyla takip etsin`. Hayaletler üstten rastgele yerlerden gelip avcıya doğru süzülüyor.\n3. **Lazer:** 19. dersteki gibi `[A] düğmesine [basılınca]` olayıyla lazer çıkar. Lazer `avci x konumu` ve `avci y konumu - 12` noktasında doğsun, `hızı x 0 y -140` olsun, `dünyadan çıkınca silinsin: evet`.\n4. **Vurma:** `bir [Mermi] sprite'ı bir [Düşman] sprite'ına çarpınca` olayında `skoru [1] değiştir`, `[patlama] melodisini çal`, `[diğer sprite] patlayıp yok olsun`, `[bu sprite] sprite'ını sil`. Sonra `eğer [skor] ≥ [5] ise` bloğuyla `ekranda [Avcı kazandı!] yaz, [2] saniye` ve `oyunu bitir: [kazandın]` ekle. (`skor` bloğu **Oyun** kategorisinde.)\n5. **Can:** `bir [Oyuncu] sprite'ı bir [Düşman] sprite'ına çarpınca` olayında `canı [-1] değiştir`, `ekranı [250] ms salla` ve `[diğer sprite] sprite'ını sil`.\n6. ↺ bas ve oyna. Hayaletler üstten süzülüyor, sen sağa-sola gidip ateş ediyorsun. 5 hayalet vurunca \"Avcı kazandı!\" yazıyor.\n\nBeklenen sonuç: Altı hedefin hepsi ✓. Yarasa sekiyor, hayaletler avcıyı takip ediyor, A lazer çıkarıyor, çarpışmalar skor ve can değiştiriyor, 5 puanda oyun kazanılıyor.\n\n### Nasıl çalışıyor?\n- Hem yarasa hem hayaletler **Düşman** türünde. Bu yüzden vurma ve can kuralları ikisine de uygulanıyor. Tek kural, iki farklı düşman.\n- Hayaletler sahneye yukarıdan giriyor ve takip hızları (15) avcının hızından (80) çok düşük. Böylece oyuncunun kaçacak zamanı var.\n- Üç olay (vurma, can, zamanlayıcı) birbirinden bağımsız çalışır. Birini bozmak diğerlerini bozmaz.\n- Hayaletler ekranın üstünden avcıya ulaşana kadar yedi saniyeden uzun sürer; ateş etmek için yeterli süre.\n\n### Dene\n1. Hayaletin hızını 30 yap ve her 600 ms'de bir üret. Oyun kaç kez daha zor oldu?\n2. Hedefi büyüt: kazanma skorunu 5'ten 10'a çıkar ve hayaletleri her 700 ms'de bir üret. Oyun hâlâ dengeli mi, yoksa fazla mı zor oldu?\n3. `can bitince` olayına `ekranda [Hayaletler kazandı!] yaz` ve `oyunu bitir: [kaybettin]` ekle.\n\n### Sık yapılan hatalar\n- Hayaletin takip bloğunda `avci` yerine `bu sprite` yazmak: hayalet kendini takip eder ve hiç kıpırdamaz.\n- Vurma kuralında `diğer sprite`'ı patlatıp `bu sprite`'ı silmeyi unutmak: lazer hedefin içinden geçmeye devam eder.\n- `eğer skor ≥ 5` bloğunu çarpışma olayının dışına koymak: oyun hiç bitmeyebilir.\n- Hayaletleri çok hızlı yapmak: oyuncunun şansı kalmaz.",
          "question": "Bu oyunda en çok hangi parça seni oyalıyor: yarasa mı, hayalet mi, lazer mi? Bir arkadaşın oynasa hangi düşmanı daha zor bulurdu? Neden?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Birkaç küçük kuralı tek bir oyunda birleştirmeyi\n- Bir oyunu parçalara bölüp planlamayı\n- Aynı türdeki düşmanlara tek bir kuralın nasıl uygulandığını\n- Kazanma ve kaybetme koşullarını birlikte düşünmeyi\n\n### Önceden bilmen gerekenler\nDers 16 (devriye), ders 17 (takip ve mesafe), ders 19 (ateş etme ve çarpışma), ders 9 (can kuralı). Ders 18'in rastgele sayısı da hayaletlerin yerini seçmek için kullanılır.\n\n### Önce plan\nBüyük bir oyun tek seferde yazılmaz. Önce neye ihtiyaç olduğunu bir tabloya yazarız:\n\n```\nParça      Ne yapar                         Hangi olay\nYarasa     üstte gidip gelir                oyun başlayınca\nHayalet    üstten gelir, avcıyı kovalar     her 900 ms'de bir\nLazer      A ile yukarı gider               A'ya basılınca\nVurma      puan verir, kazanmayı denetler   Mermi çarpar Düşman\nCan        düşman değerse can azalır        Oyuncu çarpar Düşman\n```\n\nHer satır ayrı bir olaydır ve birbirinden bağımsız çalışır. Birini bozarsan diğerleri çalışmaya devam eder; hata ararken bu çok işine yarar.\n\n### Bir kural, iki düşman\nYarasa da hayalet de **Düşman** türündedir. Bu yüzden `Mermi, Düşman'a çarpınca` kuralı ikisine birden uygulanır. Yeni bir düşman eklediğinde yeni kural yazmazsın; türünü Düşman seçmen yeter. Tür kullanmanın asıl gücü budur.\n\n### Hayaletleri üretmek\n`her 900 ms'de bir` olayı yeni bir hayalet sprite'ı yaratır, ekranın üstünde (y = -8) rastgele bir x'e koyar ve avcıyı takip ettirir. 900 ms aralıkla yaklaşık her saniye bir hayalet çıkar. Hayalet hızı 15, avcı hızı 80'dir: oyuncunun kaçacak ve ateş edecek zamanı vardır. Hayalet doğrudan alttaki avcıya 112 piksel uzaktaysa merkezlerin buluşması 112 / 15, yani yaklaşık 7,5 saniye sürer; sprite'lar boyutlu olduğundan temas daha erken, yaklaşık 6,4 saniyede olur.\n\n### Kazanmak ve kaybetmek\nHer vuruş skoru 1 artırır. Vurma kuralının sonunda `eğer skor >= 5 ise` bloğu oyunu kazandıran mesajı yazar ve oyunu bitirir. Bu denetimi vurma olayının **içine** koyarsın, çünkü skor yalnız orada değişir. Kaybetmek için can kuralı vardır: avcı bir düşmana değince can 1 azalır, 3 kez değerse can biter.\n\n### Özet\nBüyük oyun, küçük kuralların toplamıdır. Önce tablo yap, her parçayı ayrı olayda kur. Türü paylaşan düşmanlar aynı kuralı kullanır. Zamanlayıcı düşman üretir, çarpışma olayları skoru ve canı değiştirir, kazanma denetimi skorun değiştiği yere konur.",
          "concepts": [
            {
              "term": "Oyun planı",
              "definition": "Oyundaki parçaları, ne yaptıklarını ve hangi olayla çalıştıklarını gösteren tablo.",
              "example": "Yarasa, hayalet, lazer, vurma ve can kuralı beş satırlık bir tablo olur.",
              "pitfall": "Plan yapmadan hepsini birden yazmak: hata çıkınca hangi parçada olduğunu bulamazsın."
            },
            {
              "term": "Olayların bağımsızlığı",
              "definition": "Her olay ayrı çalışır; birinin bozulması diğerlerini bozmaz.",
              "example": "Can kuralı hatalıysa bile lazer ve hayalet üretimi çalışmaya devam eder.",
              "pitfall": "Bir olayın başka olayın içinde olduğunu sanmak; şapkalı bloklar çalışma alanında tek başına durur."
            },
            {
              "term": "Paylaşılan tür",
              "definition": "Birden çok sprite'a aynı türü vermek, aynı çarpışma kuralının hepsine uygulanmasını sağlar.",
              "example": "Yarasa ve hayalet Düşman olduğu için lazer ikisini de vurabilir.",
              "pitfall": "Yeni düşmana yanlış tür vermek: lazer onu hiç vurmaz."
            },
            {
              "term": "Kazanma koşulu",
              "definition": "Oyunun kazanıldığını belirleyen kural; bu oyunda skor 5 ya da daha fazla olmasıdır.",
              "example": "Skoru artıran olayın sonunda eğer skor 5'ten büyük ya da eşitse oyun kazanıldı.",
              "pitfall": "Denetimi skorun değişmediği bir olaya koymak: oyun hiç bitmeyebilir."
            },
            {
              "term": "Denge",
              "definition": "Düşman hızı, üretim aralığı ve kazanma skoru gibi sayıların oyunu çok kolay ya da çok zor yapmaması için ayarlanması.",
              "example": "Hayalet hızı 15 iken kazanmak mümkün; 100 olsaydı (avcıdan hızlı) avcı kaçamazdı.",
              "pitfall": "Tek bir sayıyı çok büyük yapıp oyunu oynanamaz hale getirmek."
            }
          ],
          "quiz": [
            {
              "id": "m11h4d20-q1",
              "kind": "numeric",
              "prompt": "Hayaletler her 900 ms'de bir üretiliyor. Oyunun başlangıcından 4,6 saniye sonra kaç hayalet üretilmiş olur? (Her olay çalışışta bir hayalet yaratır.)",
              "answer": 5,
              "tolerance": 0,
              "unit": "hayalet",
              "explanation": "4,6 saniye = 4600 ms. 4600 / 900 yaklaşık 5,1; yarım kalan aralık sayılmaz, tam 5 aralık dolmuştur. Oyunu çalıştırdığımızda da ilk 4,6 saniyede 5 hayalet çıkıyor.",
              "skills": [
                "game-timer",
                "game-planning"
              ]
            },
            {
              "id": "m11h4d20-q2",
              "kind": "mcq",
              "prompt": "Yarasa ve hayalet aynı \"Mermi, Düşman'a çarpınca\" kuralıyla vurulabiliyor. Bunun sebebi nedir?",
              "options": [
                "İkisinin de resmi aynıdır",
                "Hayalet yarasanın kopyasıdır",
                "Kural bütün sprite'lara uygulanır",
                "İkisinin de türü Düşman'dır"
              ],
              "answer": 3,
              "explanation": "Çarpışma kuralı türe bakar. Yarasa da hayalet de Düşman türünde yaratıldığı için aynı kural ikisine birden uygulanır. Resimleri farklı olsa bile sonuç değişmez; kural \"bütün sprite\" değil yalnız Düşman içindir.",
              "skills": [
                "game-collision",
                "game-planning"
              ]
            },
            {
              "id": "m11h4d20-q3",
              "kind": "numeric",
              "prompt": "Avcının canı 3. Beş hayalet vuruluyor, 2 hayalet avcıya çarpıyor. Her çarpma canı 1 azaltıyor. Kaç can kalır?",
              "answer": 1,
              "tolerance": 0,
              "unit": "can",
              "explanation": "Vurulan hayaletler canı etkilemez, yalnız skoru artırır. Avcıya çarpan 2 hayalet canı 3 - 2 = 1'e indirir. Skor ise 5 olur ve oyun kazanılır.",
              "skills": [
                "game-collision",
                "game-planning"
              ]
            },
            {
              "id": "m11h4d20-q4",
              "kind": "find-bug",
              "prompt": "Skor 5'e ulaşıyor ama \"Avcı kazandı!\" hiç yazılmıyor. Hata hangisi?\n\n```\nbir Mermi sprite'ı bir Düşman sprite'ına çarpınca:\n  skoru 1 değiştir\n  diğer sprite patlayıp yok olsun\n  bu sprite'ı sil\n\neğer skor >= 5 ise:\n  ekrana \"Avcı kazandı!\" yaz\n  oyunu bitir: kazandın\n```",
              "options": [
                "Eğer bloğu hiçbir olayın içinde değil, tek başına duruyor",
                "Skor 1 değil 5 değişmeli",
                "Bu sprite silinmemeli",
                "Mesaj metni çok uzun"
              ],
              "answer": 0,
              "explanation": "Şapkalı olay olmayan bir \"eğer\" bloğu çalışmaz: hangi olayda çalışacağını bilemez. Denetim, skorun değiştiği çarpışma olayının içine konmalıdır. Skor ve silme blokları doğrudur.",
              "skills": [
                "game-debug",
                "game-condition"
              ]
            },
            {
              "id": "m11h4d20-q5",
              "kind": "numeric",
              "prompt": "Bir hayalet avcının tam üstünde, 100 piksel uzakta doğuyor ve avcı yerinde duruyor. Hayalet 20 hızla avcıya düz yaklaşıyor. Merkezlerin buluşması yaklaşık kaç saniye sürer?",
              "answer": 5,
              "tolerance": 0.1,
              "unit": "sn",
              "explanation": "Süre = yol / hız = 100 / 20 = 5 saniye. Gerçek oyunda sprite'lar boyutlu olduğu için temas merkezler buluşmadan biraz önce olur. Hız 40 olsaydı süre yarıya inip 2,5 saniyeye düşerdi.",
              "skills": [
                "game-velocity",
                "game-follow",
                "game-planning"
              ]
            }
          ],
          "contentEn": {
            "title": "Project: Ghost hunter",
            "problem": "This week, all together: a patrol bat that keeps bouncing, ghosts that chase you, and shooting too. When you put them all in the same game, you will feel like a night guard. It is time to break your own game's logic into pieces and build them one by one.",
            "contentMd": "### What are we going to make?\nIn a night scene, a hunter (an astronaut) is at the bottom of the screen. It can only walk left and right, and it stays on the screen. The score is set to 0 and lives to 3. You will add these:\n\n| Part | Which lesson you learnt it in | What will it do? |\n|---|---|---|\n| Patrol bat | 16 | A bat going back and forth at the top |\n| Chasing ghosts | 17 | Ghosts that come from the top and follow the hunter |\n| Laser | 19 | Fire with A, upwards |\n| Hit rule | 19 | Each hit is 1 point, win at 5 points |\n| Lives rule | 9 | If an enemy touches the hunter, a life is lost |\n\n### Build the blocks\n1. **Bat:** at the very bottom of the `when game starts` block, set up the bat: `set yarasa to [new [Bat] sprite, kind [Enemy]]`, `move yarasa to x 20 y 30`, `set yarasa speed x 40 y 0` and `yarasa [bounce off walls/edges]: [yes]`. The bat goes back and forth on the screen. (You can also choose the timer method from lesson 16.)\n2. **Ghosts:** build an `every [900] ms` event. Inside it: `set hayalet to [new [Ghost] sprite, kind [Enemy]]`; `move hayalet to x [random integer from 10 to 150] y [-8]`; `[hayalet] follows sprite [avci] at speed [15]`. Ghosts come from random places at the top and drift towards the hunter (`avci`).\n3. **Laser:** fire a laser with the `when [A] button is [pressed]` event, as in lesson 19. The laser should appear at `avci x position` and `avci y position - 12`, with `speed x 0 y -140` and `delete when it leaves the world: yes`.\n4. **Hit:** in the `when a [Bullet] sprite hits a [Enemy] sprite` event, put `change score by [1]`, `play melody [boom]`, `make [other sprite] explode` and `delete sprite [this sprite]`. Then, with an `if [score] ≥ [5] do` block, add `show [Hunter wins!] on screen for [2] seconds` and `end game: [you win]`. (The `score` block is in the **Game** category.)\n5. **Lives:** in the `when a [Player] sprite hits a [Enemy] sprite` event, put `change lives by [-1]`, `shake screen for [250] ms` and `delete sprite [other sprite]`.\n6. Press ↺ and play. Ghosts drift down from the top while you move left and right and shoot. When you hit 5 ghosts, \"Hunter wins!\" appears.\n\nExpected result: all six goals ✓. The bat bounces, the ghosts follow the hunter, A fires a laser, collisions change the score and lives, and the game is won at 5 points.\n\n### How does it work?\n- The bat and the ghosts are both of the **Enemy** kind. That is why the hit and lives rules apply to both of them. One rule, two different enemies.\n- The ghosts enter the stage from above, and their follow speed (15) is much lower than the hunter's speed (80). This gives the player time to escape.\n- The three events (hit, lives, timer) run independently of each other. Breaking one does not break the others.\n- It takes the ghosts more than seven seconds to get from the top of the screen to the hunter; that is enough time to shoot.\n\n### Try it\n1. Set the ghost's speed to 30 and make one every 600 ms. How many times harder did the game get?\n2. Raise the target: increase the winning score from 5 to 10 and make ghosts every 700 ms. Is the game still balanced, or has it become too hard?\n3. In the `when lives run out` event, add `show [Ghosts win!] on screen` and `end game: [you lose]`.\n\n### Common mistakes\n- Writing `this sprite` instead of `avci` in the ghost's follow block: the ghost follows itself and does not move at all.\n- In the hit rule, blowing up `other sprite` but forgetting to delete `this sprite`: the laser keeps going through the target.\n- Putting the `if score ≥ 5` block outside the collision event: the game may never end.\n- Making the ghosts too fast: the player has no chance.",
            "question": "Which part of this game keeps you busiest: the bat, the ghost or the laser? If a friend played it, which enemy would they find harder? Why?",
            "explainerMd": "### What you will learn in this lesson\n- How to combine several small rules in one game\n- How to plan a game by breaking it into pieces\n- How a single rule is applied to enemies of the same kind\n- How to think about winning and losing conditions together\n\n### What you should know first\nLesson 16 (patrol), lesson 17 (following and distance), lesson 19 (shooting and collision), lesson 9 (the lives rule). The random number from lesson 18 is also used to choose where the ghosts appear.\n\n### Plan first\nA big game is not written in one go. First we write what we need in a table:\n\n```\nPart       What it does                     Which event\nBat        goes back and forth at the top   when game starts\nGhost      comes from the top, chases       every 900 ms\nLaser      goes up with A                   when A is pressed\nHit        gives points, checks for a win   Bullet hits Enemy\nLives      a life is lost if an enemy hits  Player hits Enemy\n```\n\nEach row is a separate event, and they run independently of each other. If you break one, the others keep working; this is very useful when you are looking for a bug.\n\n### One rule, two enemies\nThe bat and the ghost are both of the **Enemy** kind. That is why the `Bullet hits Enemy` rule applies to both of them at once. When you add a new enemy, you do not write a new rule; you just choose Enemy as its kind. This is the real power of using kinds.\n\n### Making ghosts\nThe `every 900 ms` event creates a new ghost sprite, puts it at a random x at the top of the screen (y = -8) and makes it follow the hunter. With a 900 ms interval, about one ghost appears every second. The ghost's speed is 15 and the hunter's speed is 80: the player has time to escape and to shoot. If a ghost is 112 pixels away from the hunter directly below it, it takes 112 / 15, about 7.5 seconds, for the centres to meet; because the sprites have a size, they touch earlier, at about 6.4 seconds.\n\n### Winning and losing\nEach hit raises the score by 1. At the end of the hit rule, an `if score >= 5 do` block shows the winning message and ends the game. You put this check **inside** the hit event, because that is the only place where the score changes. For losing there is the lives rule: when the hunter touches an enemy, lives go down by 1; if it touches 3 times, the lives run out.\n\n### Summary\nA big game is the sum of small rules. Make a table first, and build each part in its own event. Enemies that share a kind use the same rule. A timer makes enemies, collision events change the score and lives, and the win check goes where the score changes.",
            "concepts": [
              {
                "term": "Game plan",
                "definition": "A table showing the parts of the game, what they do and which event they run with.",
                "example": "The bat, ghost, laser, hit and lives rules make a five-row table.",
                "pitfall": "Writing everything at once without a plan: when a bug appears, you cannot find which part it is in."
              },
              {
                "term": "Independent events",
                "definition": "Each event runs on its own; if one breaks, the others do not.",
                "example": "Even if the lives rule has a bug, the laser and the ghost making keep working.",
                "pitfall": "Thinking one event is inside another; blocks with a rounded top stand on their own in the workspace."
              },
              {
                "term": "Shared kind",
                "definition": "Giving several sprites the same kind makes the same collision rule apply to all of them.",
                "example": "Because the bat and the ghost are both Enemy, the laser can hit both.",
                "pitfall": "Giving a new enemy the wrong kind: the laser never hits it."
              },
              {
                "term": "Winning condition",
                "definition": "The rule that decides the game is won; in this game it is a score of 5 or more.",
                "example": "At the end of the event that raises the score, if the score is greater than or equal to 5, the game is won.",
                "pitfall": "Putting the check in an event where the score does not change: the game may never end."
              },
              {
                "term": "Balance",
                "definition": "Setting numbers such as enemy speed, making interval and winning score so that the game is neither too easy nor too hard.",
                "example": "With a ghost speed of 15 you can win; if it were 100 (faster than the hunter), the hunter could not escape.",
                "pitfall": "Making one number very big and turning the game into one nobody can play."
              }
            ],
            "quiz": [
              {
                "id": "m11h4d20-q1",
                "kind": "numeric",
                "prompt": "Ghosts are made every 900 ms. How many ghosts have been made 4.6 seconds after the game starts? (Each time the event runs, it creates one ghost.)",
                "answer": 5,
                "tolerance": 0,
                "unit": "ghosts",
                "explanation": "4.6 seconds = 4600 ms. 4600 / 900 is about 5.1; the unfinished interval does not count, so exactly 5 intervals have passed. When we run the game, 5 ghosts do appear in the first 4.6 seconds.",
                "skills": [
                  "game-timer",
                  "game-planning"
                ]
              },
              {
                "id": "m11h4d20-q2",
                "kind": "mcq",
                "prompt": "The bat and the ghost can both be hit by the same \"Bullet hits Enemy\" rule. Why is this?",
                "options": [
                  "They both have the same picture",
                  "The ghost is a copy of the bat",
                  "The rule applies to all sprites",
                  "They are both of the Enemy kind"
                ],
                "answer": 3,
                "explanation": "The collision rule looks at the kind. Because the bat and the ghost were both created with the Enemy kind, the same rule applies to both. Even though their pictures are different, the result does not change; the rule is not for \"all sprites\" but only for Enemy.",
                "skills": [
                  "game-collision",
                  "game-planning"
                ]
              },
              {
                "id": "m11h4d20-q3",
                "kind": "numeric",
                "prompt": "The hunter has 3 lives. Five ghosts are hit and 2 ghosts crash into the hunter. Each crash takes away 1 life. How many lives are left?",
                "answer": 1,
                "tolerance": 0,
                "unit": "lives",
                "explanation": "The ghosts that are hit do not affect lives; they only raise the score. The 2 ghosts that crash into the hunter bring lives down to 3 - 2 = 1. The score becomes 5 and the game is won.",
                "skills": [
                  "game-collision",
                  "game-planning"
                ]
              },
              {
                "id": "m11h4d20-q4",
                "kind": "find-bug",
                "prompt": "The score reaches 5, but \"Hunter wins!\" never appears. Which is the bug?\n\n```\nwhen a Bullet sprite hits a Enemy sprite:\n  change score by 1\n  make other sprite explode\n  delete sprite this sprite\n\nif score >= 5 do:\n  show \"Hunter wins!\" on screen\n  end game: you win\n```",
                "options": [
                  "The if block is not inside any event; it stands on its own",
                  "The score should change by 5, not 1",
                  "This sprite should not be deleted",
                  "The message text is too long"
                ],
                "answer": 0,
                "explanation": "An \"if\" block without an event on top does not run: it cannot know which event to run in. The check should be put inside the collision event, where the score changes. The score and delete blocks are correct.",
                "skills": [
                  "game-debug",
                  "game-condition"
                ]
              },
              {
                "id": "m11h4d20-q5",
                "kind": "numeric",
                "prompt": "A ghost appears exactly above the hunter, 100 pixels away, and the hunter stays still. The ghost comes straight towards the hunter at speed 20. About how many seconds does it take for the centres to meet?",
                "answer": 5,
                "tolerance": 0.1,
                "unit": "s",
                "explanation": "Time = distance / speed = 100 / 20 = 5 seconds. In the real game the sprites have a size, so they touch a little before the centres meet. If the speed were 40, the time would halve to 2.5 seconds.",
                "skills": [
                  "game-velocity",
                  "game-follow",
                  "game-planning"
                ]
              }
            ]
          }
        }
      ]
    },
    {
      "title": "Platform ve fizik",
      "project": "Platform atlayıcı",
      "guideMd": "### Hafta hedefleri\nBu haftanın sonunda öğrenci:\n1. Hız ile ivmenin farkını söyleyebilir; yerçekimini aşağı yönlü ivme olarak kurabilir.\n2. Zıplamayı eksi y hızı olarak kurar, havada zıplamayı `alttan bir duvara dokunuyor mu?` koşuluyla engeller.\n3. Altın, diken ve kapı gibi geçilebilir karolar için `karosuna dokununca` olayı yazar; `olay karosunun` bloklarını kullanır.\n4. Çarpışmayı düşüş hızı ve konum ölçütleriyle \"ezme\" ve \"yan çarpma\" olarak ayırır.\n5. Haftanın parçalarını kurallar tablosuyla planlayıp tek bir platform seviyesinde birleştirir.\n\n### Haftanın planı\nHafta beş derstir. Aşağıdaki plan günde bir ders içindir; son gün proje olduğu için daha uzundur.\n\n| Gün | Ders | Süre | Ne yapılır |\n|---|---|---|---|\n| 1 | Yerçekimi: kahraman yere insin | ~20 dk | Anlatımı oku, ivme bloğunu kur, hareket biçimini sağa-sola seç, mini testi çöz. |\n| 2 | Zıplama: A ile zıpla | ~20 dk | Zıplama hızını dene, `eğer` koşulunu ekle, havada zıplamayı engelle. |\n| 3 | Platformlar, altınlar ve dikenler | ~25 dk | Altın ve diken olaylarını kur, karo boşaltmayı dene. |\n| 4 | Düşmanın üstüne zıpla | ~25 dk | İki ölçütü kur, ezme ve yan çarpmayı sına. |\n| 5 | Proje: Platform atlayıcı | ~35 dk | Kurallar tablosunu doldur, altın-diken-kapı olaylarını yaz, oyunu oyna ve ayarla. |\n\n### Ön koşul kontrolü\nBu hafta şu bilgiler gerekir; eksik varsa ilgili dersi tekrar et:\n- Sprite oluşturmak ve `hızı x y` bloğunu kullanmak (Modül 11, ders 1-4).\n- Çarpışma olayını ve `diğer sprite` kavramını bilmek (ders 6).\n- `eğer` bloğu ve skor/can bloklarını kullanmak (ders 7 ve 9).\n- Karo haritası, duvar ve `karosuna dokununca` olayı (ders 11-13) ve kamera (ders 14).\n- Öğrenci toplama ve çarpma işlemlerinde rahat olmalı; bu hafta hız x süre hesapları var.\n\n### Kavram haritası\n- **Fizik:** hız → ivme → yerçekimi (y yönünde pozitif ivme) → zıplama (eksi y hızı) → tepe ve düşüş\n- **Koordinat:** x sağa, y aşağı artar → yukarı = eksi hız, küçük y\n- **Karo olayları:** geçilebilir karo → `karosuna dokununca` → kenar tetikleme → `olay karosunun sütunu / satırı` → karoyu boşalt\n- **Çarpışma:** çarpışma olayı → `bu sprite` / `diğer sprite` → düşüş hızı ve konum ölçütü → `ve` → `eğer ... değilse`\n- **Proje:** kurallar tablosu → altın, diken, kapı, ezme → kamera → sınama ve zorluk ayarı\n\n### Sık yapılan hatalar\n- **Hareket biçimini dört yöne seçmek.** Motor y hızını tuşlara göre yeniden yazar; yerçekimi neredeyse etkisiz kalır.\n- **Hız ile ivmeyi karıştırmak.** Hızla düşersen kahraman hep aynı hızla gider, ivmeyle düşersen hızlanır.\n- **Zıplama hızına artı sayı yazmak.** y aşağı doğru artar; zıplamak için eksi gerekir.\n- **Zıplamayı yerde mi koşuluna bağlamamak.** Kahraman havada da zıplar.\n- **Yatay hızı sıfırlamak.** Zıplarken `x hızı` kutusuna kahramanın kendi x hızı konmalı.\n- **Altın karosunu boşaltmamak ya da sabit sütun/satır yazmak.** Altın yerinde kalır ya da yanlış karo boşalır.\n- **Olay türünü yanlış seçmek.** Oyuncu yerine Düşman seçersen olay çalışmaz.\n- **Ezme ölçütünde ters karşılaştırma.** Düşman üstte olduğunda ezme sayılır.\n- **`bu sprite` ile `diğer sprite`ı karıştırmak.** Düşman yerine kahraman yok olur.\n- **Dikenden sonra hızı sıfırlamamak.** Kahraman yukarı hızla başlangıçtan havaya fırlayabilir.\n\n### Hafta sonu tekrarı\n1. Her dersin kavram kartlarını bir kez daha oku ve \"sık yapılan yanlış\" satırlarını yüksek sesle söyle.\n2. Mini testlerde yanlış yaptığın soruların açıklamalarını yeniden oku, sonra soruyu yeniden çöz.\n3. Yerçekimi ve zıplamayı sıfırdan, bakmadan kur. Zıplama hızını -150, -250 ve -350 yap ve kahramanın yüksekliğini karşılaştır.\n4. Hız -260 ve ivme 520 iken tepe noktasının kaç saniyede geldiğini hesapla, sonra oyunda dene.\n5. Kendi cümlelerinle şu soruyu cevapla: \"Oyun, kahramanın düşmanı ezdiğini mi yoksa yandan çarptığını mı nasıl anlıyor?\"\n\nHafta sonu testi olarak beş dersin mini testleri yeterlidir; toplam 25 soru. Hedef: her dersten en az 4 doğru. Eksik kalan dersin anlatımına dön.\n\n### Proje değerlendirme ölçütü (Platform atlayıcı)\n| Ölçüt | Gelişmeli | Yeterli | İleri |\n|---|---|---|---|\n| Hareket | Kahraman düşmüyor ya da zıplamıyor | Yerçekimi, yürüme ve zıplama çalışıyor; havada zıplama engelli | Zıplama gücünü kendisi ayarlamış ve nedenini açıklıyor |\n| Karo olayları | Altın ya da diken olayı çalışmıyor | Altın kayboluyor ve skor artıyor; dikende can azalıp kahraman başa dönüyor | Başa dönerken hızı sıfırlıyor ve nedenini söylüyor |\n| Kapı ve kazanma | Kapıya dokununca bir şey olmuyor | Mesaj yazılıyor ve oyun kazanılıyor | Kazanma koşulunu değiştirmiş (örneğin skor şartı) ve açığı düşünmüş |\n| Düşman | Ezme ve yan çarpma ayrılmıyor | Üstten ezince düşman yok oluyor, yandan çarpınca can azalıyor | İki ölçütü açıklıyor ve eşiği değiştirip etkisini gösteriyor |\n| Tasarım ve anlatım | Oyun oynanamayacak kadar zor ya da kolay | Seviye oynanabilir; kuralları anlatabiliyor | Arkadaşına oynatıp zorluğu ayarlamış |\n\n### Veli ve öğretmen notu\n- **Amaç.** Bu hafta çocuk fizik formüllerini ezberlemez; yerçekimi ve zıplamanın bir sayıyla ayarlanabildiğini deneyerek görür. Hız ve ivmeyi tartışırken oyundaki hissi konuşmak yeterlidir.\n- **Nasıl destek olunur?** Takıldığında cevabı söylemek yerine şunu sor: \"Hangi blok bunu yapıyor?\", \"Sayıyı değiştirirsen ne olur?\", \"Kahraman düşüyor mu, yoksa yerde mi?\" Birlikte tahmin edip sonra denemek iyi çalışır.\n- **Süre.** Dersler 20-35 dakikadır. Zıplama gücünü ayarlamak gibi deneme zamanı gerektiren işlerde acele ettirme.\n- **Güvenlik.** Her şey tarayıcıda çalışır, harici bir donanım yoktur. Oyunda dikenden korunmak yalnız bir oyun kuralıdır.\n- **İlerleme.** Mini test sonuçları \"İlerlemem\" sayfasında beceri bazında görünür (taslak/pilot özellik; yalnız onay verildiyse kaydedilir).",
      "guideMdEn": "### Goals for the week\nBy the end of this week the learner can:\n1. Say the difference between speed and acceleration, and set up gravity as a downward acceleration.\n2. Build a jump as a minus y speed and stop jumps in mid-air with the `touching a wall below?` condition.\n3. Write a `touches tile` event for passable tiles such as gold, spikes and doors, and use the `event tile` blocks.\n4. Separate a collision into a \"stomp\" and a \"side hit\" using falling speed and position tests.\n5. Plan the week's pieces with a rules table and combine them in a single platform level.\n\n### Plan for the week\nThe week has five lessons. The plan below is for one lesson a day; the last day is longer because it is the project.\n\n| Day | Lesson | Time | What to do |\n|---|---|---|---|\n| 1 | Gravity: let the hero land | ~20 min | Read the explainer, build the acceleration block, choose left-right as the way of moving, do the mini quiz. |\n| 2 | Jumping: jump with A | ~20 min | Try the jump speed, add the `if` condition, stop jumps in mid-air. |\n| 3 | Platforms, gold and spikes | ~25 min | Build the gold and spike events, try clearing tiles. |\n| 4 | Jump on the enemy | ~25 min | Build the two tests, test the stomp and the side hit. |\n| 5 | Project: Platform jumper | ~35 min | Fill in the rules table, write the gold, spike and door events, play the game and adjust it. |\n\n### Prerequisite check\nThis week needs the following knowledge; if anything is missing, repeat the lesson concerned:\n- Creating a sprite and using the `set speed x y` block (Module 11, lessons 1-4).\n- Knowing the collision event and the idea of `other sprite` (lesson 6).\n- Using the `if` block and the score/lives blocks (lessons 7 and 9).\n- The tile map, walls and the `touches tile` event (lessons 11-13), and the camera (lesson 14).\n- The learner should be comfortable with addition and multiplication; this week has speed x time calculations.\n\n### Concept map\n- **Physics:** speed → acceleration → gravity (positive acceleration in the y direction) → jump (minus y speed) → highest point and fall\n- **Coordinates:** x grows to the right, y grows downwards → up = minus speed, small y\n- **Tile events:** passable tile → `touches tile` → edge triggering → `event tile column / row` → clear the tile\n- **Collision:** collision event → `this sprite` / `other sprite` → falling speed and position tests → `and` → `if ... else`\n- **Project:** rules table → gold, spikes, door, stomp → camera → testing and adjusting the difficulty\n\n### Common mistakes\n- **Choosing in 4 directions as the way of moving.** The engine writes the y speed again from the keys; gravity has almost no effect.\n- **Mixing up speed and acceleration.** If you fall with a speed, the hero always goes at the same speed; if you fall with an acceleration, it speeds up.\n- **Typing a plus number for the jump speed.** y grows downwards; to jump you need a minus.\n- **Not linking the jump to the on-the-ground condition.** The hero jumps in the air too.\n- **Setting the sideways speed to zero.** When jumping, the hero's own x speed should go in the `x speed` slot.\n- **Not clearing the gold tile, or typing a fixed column/row.** The gold stays where it is, or the wrong tile is cleared.\n- **Choosing the wrong event kind.** If you choose Enemy instead of Player, the event does not run.\n- **A comparison the wrong way round in the stomp test.** It counts as a stomp when the enemy is on top.\n- **Mixing up `this sprite` and `other sprite`.** The hero disappears instead of the enemy.\n- **Not resetting the speed after the spikes.** The hero can shoot up into the air from the start with its upward speed.\n\n### End-of-week review\n1. Read each lesson's concept cards once more and say the \"common mistake\" lines out loud.\n2. Read again the explanations of the mini quiz questions you got wrong, then answer the question again.\n3. Build gravity and jumping from scratch without looking. Set the jump speed to -150, -250 and -350 and compare how high the hero goes.\n4. Work out how many seconds it takes to reach the highest point when the speed is -260 and the acceleration 520, then try it in the game.\n5. Answer this question in your own words: \"How does the game know whether the hero stomped the enemy or hit it from the side?\"\n\nAs an end-of-week test, the five lessons' mini quizzes are enough; 25 questions in total. Target: at least 4 correct in each lesson. Go back to the explainer of any lesson that falls short.\n\n### Project rubric (Platform jumper)\n| Criterion | Developing | Secure | Advanced |\n|---|---|---|---|\n| Movement | The hero does not fall or does not jump | Gravity, walking and jumping work; jumping in mid-air is blocked | Has set the jump strength themselves and explains why |\n| Tile events | The gold or spike event does not work | The gold disappears and the score goes up; on the spikes a life is lost and the hero goes back to the start | Resets the speed when going back to the start and says why |\n| Door and winning | Nothing happens when the door is touched | A message appears and the game is won | Has changed the winning condition (for example, a score requirement) and thought about the loophole |\n| Enemy | The stomp and the side hit are not told apart | A stomp from above gets rid of the enemy; a side hit takes a life | Explains the two tests and shows the effect of changing the threshold |\n| Design and explanation | The game is too hard or too easy to play | The level is playable; can explain the rules | Has had a friend play it and adjusted the difficulty |\n\n### Note for parents and teachers\n- **Aim.** This week the child does not learn physics formulas by heart; they see by experimenting that gravity and jumping can be set with a number. When talking about speed and acceleration, it is enough to discuss how it feels in the game.\n- **How to help.** When they get stuck, instead of giving the answer, ask: \"Which block does this?\", \"What happens if you change the number?\", \"Is the hero falling, or on the ground?\" Guessing together and then trying it works well.\n- **Time.** Lessons take 20-35 minutes. Do not rush tasks that need time to experiment, such as adjusting the jump strength.\n- **Safety.** Everything runs in the browser; there is no external hardware. Avoiding the spikes is just a game rule.\n- **Progress.** Mini quiz results appear skill by skill on the \"My progress\" page (a draft/pilot feature; they are only saved if consent has been given).",
      "lessons": [
        {
          "title": "Yerçekimi: kahraman yere insin",
          "durationMin": 20,
          "problem": "Bir elmayı bıraktığında elma önce yavaş, sonra gittikçe hızlanarak düşer. Ona \"git\" diyen yoktur; yalnızca her an biraz daha hızlanır. Platform oyunları işte bu yüzden hissedilir: kahramana yerçekimi verirsin ve o kendiliğinden düşer. Bu derste Oyun Atölyesi'nin yerçekimini kuracaksın.",
          "contentMd": "Sahnede açık mavi bir gökyüzü ve altta iki sıra zemin karosu (çimenli toprak ve toprak) var. Kahraman havada, ekranın üst yarısında asılı duruyor ve \"ekranda kalsın\" ayarıyla başlıyor. Başlangıç projesi hazır gelir; harita ve kahraman oluşturuluyor, ama hareket yok.\n\n### Hız ve ivme\n- **Hız**, sprite'ın saniyede kaç piksel gittiğidir.\n- **İvme**, hızın saniyede ne kadar arttığıdır. Aşağı yönlü bir ivme yerçekimi gibi davranır: kahraman her saniye biraz daha hızlı düşer.\n\n### Blokları kur\n1. Etkinliği aç ve ▶ düğmesine bas. Kahraman havada asılı duruyor.\n2. **Hareket** kategorisinden `[bu sprite] ivmesi x [0] y [300]` bloğunu al ve `oyun başlayınca` bloğunun en altına tak. `bu sprite` yerine `kahraman` değişkenini koy. y kutusuna 520 yaz.\n3. ↺ bas. Kahraman düşüyor ve zeminin üstünde duruyor.\n4. **Denetleyici** kategorisinden `[kahraman] oyuncu tuşlarıyla [sağa-sola] hareket etsin, hız [70]` bloğunu alıp ivme bloğunun altına tak. Listede **sağa-sola** seçili olsun.\n5. ↺ bas. Sağ ve sol tuşlarla yürü. Kahraman zeminde kalıyor ve haritanın kenarına gelince duruyor.\n\nBeklenen sonuç: Kahraman havadan inip zeminde duruyor ve sağa-sola yürüyebiliyor. Üç hedef de ✓.\n\n### Nasıl çalışıyor?\n- İvme, her karede hıza eklenir. Kahraman 0 hızla başlar; yarım saniye sonra hızı yaklaşık 260 pikselle düşmektedir.\n- Kahraman zemine inince durur: zemin karoları \"duvar\"dır ve duvarlar sprite'ı durdurur. Duvara değen kahramanın y hızı sıfırlanır.\n- Kahraman zemindeyken yerçekimi hâlâ çalışır; yalnız duvar onu tutar. Bu, bir sonraki derste \"zeminde miyim?\" sorusunu sormamıza yarayacak.\n- 520 değeri dikkatle seçilmiş bir sayıdır: Çok küçük olursa kahraman aya çıkmış gibi yavaş düşer, çok büyük olursa taş gibi düşer.\n\n### Dene\n1. İvmeyi 200 yap (hafif, ay gibi) ve 1000 yap (ağır). Hangisi platform oyunu için daha iyi?\n2. İvmeye eksi bir sayı ver (-300). Kahramana ne oluyor? Bunu hangi oyunda kullanırdın?\n3. Kahramanı başlangıçta ekranın en üstüne koy (`konumu x 80 y 10`) ve düşmesini izle. Kaç saniyede iniyor?\n\n### Sık yapılan hatalar\n- Hareket biçimini **dört yöne** seçmek: oyun her karede y hızını yukarı-aşağı tuşlarına göre sıfırlar ve yerçekimi etkisiz kalır. Platform oyunlarında **sağa-sola** seç.\n- İvme yerine `hızı x 0 y 100` yazmak: kahraman düşer ama hep aynı hızla; yani \"hızlanarak düşme\" hissi yoktur.\n- İvme bloğunu `oyun başlayınca` dışında bırakmak: blok çalışmaz, kahraman asılı kalır.\n- Kahramanı başlangıçta zeminin içine yerleştirmek: kahraman duvarın içinde sıkışır. Gökyüzünde bir yere koy.",
          "question": "Oyunda yerçekimi sabit 520, ama gerçek hayatta Ay'da yerçekimi Dünya'dakinden çok daha azdır. Ay'da geçen bir oyun yapsan ivmeyi nasıl seçerdin ve kahramanın zıplaması nasıl farklı olurdu?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Hız ile ivmenin farkını\n- Yerçekiminin oyunda bir \"ivme\" olduğunu\n- y ekseninin aşağı doğru arttığını\n- Platform oyununda neden \"sağa-sola\" hareket biçimi seçtiğini\n\n### Önceden bilmen gerekenler\nDers 2'de kediyi tuşlarla yürütmeyi, ders 4'te `hızı x y` bloğunu öğrendin. Ders 11'de karo haritasını ve duvar karolarını gördün. Bu derste bunları birleştireceksin.\n\n### Hız ve ivme aynı şey değil\n**Hız**, bir sprite'ın saniyede kaç piksel gittiğidir. Hız 100 ise sprite her saniye 100 piksel ilerler, hep aynı hızla.\n\n**İvme** ise hızın değişme miktarıdır. İvme y = 400 ise sprite'ın aşağı doğru hızı her saniye 400 piksel/sn artar. Bir bisikletin yokuş aşağı gittikçe hızlanması gibi.\n\n```\nZaman    Hız (ivme 400)\n0,25 sn  100 piksel/sn\n0,50 sn  200 piksel/sn\n0,75 sn  300 piksel/sn\n```\n\nHız = ivme x süre. Hızlandıkça sprite her karede daha çok yol alır; düşme bu yüzden \"gerçek\" görünür.\n\n### y ekseni aşağı doğru artar\nOyun ekranında sol üst köşe (0, 0) noktasıdır. x sağa, **y aşağı** doğru artar. Bu yüzden aşağı yönlü ivme **pozitif** y değeridir. Sprite'ı yukarı götürmek istersen eksi sayı kullanırsın. Bu kural zıplama dersinde de lazım olacak.\n\n### Yerçekimini kurmak\nYerçekimi sprite'a sürekli aşağı bir ivme vermektir. Tek blok yeter:\n\n```\noyun başlayınca:\n  kahraman ivmesi x 0 y 520\n```\n\nKahraman düşer, zemin karosuna (duvar) çarpınca durur. Motor duvara çarpan sprite'ın o yöndeki hızını sıfırlar. Kahraman zeminde dururken ivme hâlâ vardır; duvar onu tutar.\n\n### Doğru hareket biçimini seç\n`oyuncu tuşlarıyla hareket etsin` bloğunda **dört yöne** seçersen motor her karede y hızını tuşlara göre yeniden yazar. Tuşa basmıyorsan y hızı 0 olur ve yerçekimi neredeyse etkisiz kalır; kahraman çok yavaş süzülür. **Sağa-sola** seçersen yalnız yatay hız tuşlara bağlıdır, dikey hız yerçekimine bırakılır.\n\n### Özet\nHız sprite'ın ne kadar hızlı gittiğini, ivme ise bu hızın ne kadar çabuk değiştiğini söyler. Yerçekimi, y yönünde pozitif bir ivmedir çünkü y aşağı doğru artar. Platform oyununda hareket biçimini sağa-sola seçersin ki yerçekimi çalışabilsin. Zemin karoları duvar olduğu için kahraman yere inince durur.",
          "concepts": [
            {
              "term": "Hız",
              "definition": "Sprite'ın saniyede kaç piksel gittiği (piksel/sn).",
              "example": "Hız x 100 olan sprite her saniye 100 piksel sağa gider.",
              "pitfall": "Hızı ivmeyle karıştırmak; hız sabit kalır, ivme hızı değiştirir."
            },
            {
              "term": "İvme",
              "definition": "Hızın saniyede ne kadar arttığı (piksel/sn²).",
              "example": "İvme y = 400 ise aşağı hız her saniye 400 artar; 0,5 saniye sonra 200 olur.",
              "pitfall": "İvme yerine hıza sabit bir sayı yazmak: sprite hep aynı hızla gider, hızlanma hissi olmaz."
            },
            {
              "term": "Yerçekimi",
              "definition": "Sprite'a sürekli aşağı verilen pozitif y ivmesi.",
              "example": "kahraman ivmesi x 0 y 520 bloğu kahramanı hızlanarak düşürür.",
              "pitfall": "İvmeyi oyun başlayınca içine koymayı unutmak: blok çalışmaz, kahraman asılı kalır."
            },
            {
              "term": "y ekseni",
              "definition": "Ekranda y yukarıdan aşağı doğru artar; sol üst köşe (0, 0).",
              "example": "y = 24'ten y = 88'e inen sprite aşağı hareket etmiştir.",
              "pitfall": "Aşağı yön için eksi sayı yazmak; aşağı pozitiftir, yukarı eksidir."
            },
            {
              "term": "Sağa-sola hareket",
              "definition": "Tuşlar yalnız yatay hızı kontrol eder, dikey hızı yerçekimine bırakır.",
              "example": "Platform oyununda `oyuncu tuşlarıyla [sağa-sola] hareket etsin` seçilir.",
              "pitfall": "Dört yönü seçmek: y hızı her karede tuşlara göre yazılır ve yerçekimi neredeyse etkisiz kalır."
            },
            {
              "term": "Zemin duvarı",
              "definition": "Duvar karosu sprite'ı durdurur ve o yöndeki hızı sıfırlar.",
              "example": "Düşen kahraman zemin karosuna değince durur ve y hızı 0 olur.",
              "pitfall": "Kahramanı başlangıçta zeminin içine koymak: duvarın içinde sıkışır."
            }
          ],
          "quiz": [
            {
              "id": "m11h5d21-q1",
              "kind": "mcq",
              "prompt": "Bir sprite'a ivme x 0 y 300 verdin. Bu blok ne yapar?",
              "options": [
                "Sprite'ı hemen 300 piksel aşağı kaydırır",
                "Aşağı yönlü hızı her saniye 300 piksel/sn artırır",
                "Sprite'ın hızını hep 300'e sabitler",
                "Sprite'ın boyunu 300 piksel yapar"
              ],
              "answer": 1,
              "explanation": "İvme hızı değiştirir: aşağı hız her saniye 300 piksel/sn artar. Konumu doğrudan kaydırmaz (o yüzden ilk seçenek yanlış), hızı 300'e sabitlemez (üçüncü seçenek hız bloğunun işidir) ve görünüşle ilgisi yoktur.",
              "skills": [
                "oyun-hiz-ivme",
                "oyun-yercekimi"
              ]
            },
            {
              "id": "m11h5d21-q2",
              "kind": "numeric",
              "prompt": "Bir sprite durgun başlıyor (hız 0) ve aşağı ivmesi 400 piksel/sn². 0,75 saniye sonra aşağı hızı kaç piksel/sn olur?",
              "answer": 300,
              "tolerance": 1,
              "unit": "piksel/sn",
              "explanation": "Hız = ivme x süre = 400 x 0,75 = 300 piksel/sn. Hızlanmayı süre ile çarpmak yeterlidir; konum farkı değil hız sorulmuştur.",
              "skills": [
                "oyun-hiz-ivme"
              ]
            },
            {
              "id": "m11h5d21-q3",
              "kind": "predict-output",
              "prompt": "Kahraman havada başlıyor ve hiçbir tuşa basılmıyor. Bu program çalışınca kahraman ne yapar?\n\n```\noyun başlayınca:\n  kahraman ivmesi x 0 y 300\n  kahraman oyuncu tuşlarıyla [dört yöne] hareket etsin, hız 70\n```",
              "options": [
                "Hızlanarak düşer ve zemine iner",
                "Havada neredeyse asılı kalır, saniyede yalnız birkaç piksel süzülür",
                "Yukarı doğru uçar",
                "Derleme hatası olur"
              ],
              "answer": 1,
              "explanation": "Dört yön seçildiğinde motor her karede y hızını tuşlara göre yeniden yazar; tuşa basılmıyorsa 0 olur. İvme her karede ancak küçük bir artış verir, bu yüzden kahraman hızlanarak düşmez; saniyede yalnız birkaç piksel süzülür. Sağa-sola seçilseydi yerçekimi serbest kalırdı.",
              "skills": [
                "oyun-yercekimi",
                "oyun-hiz-ivme"
              ]
            },
            {
              "id": "m11h5d21-q4",
              "kind": "find-bug",
              "prompt": "Kahraman düşmüyor, havada kalıyor. Hatalı satır hangisi?\n\n```\n1  oyun başlayınca:\n2    kahraman = yeni [oyuncu-kahraman] sprite'ı, türü [oyuncu]\n3    kahraman konumu x 80 y 24\n4    kahraman ivmesi x 520 y 0\n5    kahraman oyuncu tuşlarıyla [sağa-sola] hareket etsin, hız 70\n```",
              "options": [
                "Satır 2: sprite oluşturulurken tür yanlış",
                "Satır 3: konum havada olduğu için",
                "Satır 4: ivmenin x ve y değerleri ters",
                "Satır 5: sağa-sola hareket seçilmesi"
              ],
              "answer": 2,
              "explanation": "4. satırda x ve y değerleri ters yazılmış: ivme yatayda 520, dikeyde 0. Yerçekimi için ivmenin y kutusuna 520 yazılmalı. 2, 3 ve 5. satırlar doğru: sprite oluşturuluyor, havaya konuyor ve sağa-sola hareket seçiliyor.",
              "skills": [
                "oyun-hata-ayiklama",
                "oyun-yercekimi",
                "oyun-y-ekseni"
              ]
            },
            {
              "id": "m11h5d21-q5",
              "kind": "numeric",
              "prompt": "Zemin karosunun üst kenarı y = 96 pikselde. Kahramanın boyu 16 piksel ve konumu merkezinden ölçülüyor. Kahraman zemine inip durunca merkez y değeri kaç olur?",
              "answer": 88,
              "tolerance": 0,
              "unit": "piksel",
              "explanation": "Sprite'ın merkezi alt kenarından boyun yarısı (8) kadar yukarıdadır. Alt kenar zemin üstüne (96) oturduğu için merkez 96 - 8 = 88 olur. y aşağı doğru arttığından yukarı çıkmak için çıkarırız.",
              "skills": [
                "oyun-y-ekseni",
                "oyun-yercekimi"
              ]
            }
          ],
          "contentEn": {
            "title": "Gravity: let the hero land",
            "problem": "When you let go of an apple, it falls slowly at first and then faster and faster. Nobody tells it \"go\"; it just speeds up a little more at every moment. That is exactly why platform games feel the way they do: you give the hero gravity and it falls by itself. In this lesson you will set up gravity in the Game Workshop.",
            "contentMd": "On the stage there is a light blue sky and, at the bottom, two rows of ground tiles (grassy dirt and dirt). The hero is hanging in the air in the top half of the screen, and starts with the \"stay on screen\" setting. The starter project is ready for you; the map and the hero are created, but nothing moves.\n\n### Speed and acceleration\n- **Speed** is how many pixels the sprite moves each second.\n- **Acceleration** is how much the speed grows each second. A downward acceleration behaves like gravity: the hero falls a little faster every second.\n\n### Build the blocks\n1. Open the activity and press the ▶ button. The hero is hanging in the air.\n2. From the **Motion** category, take the `set [this sprite] acceleration x [0] y [300]` block and snap it at the very bottom of the `when game starts` block. Replace `this sprite` with the `kahraman` (hero) variable. Type 520 in the y slot.\n3. Press ↺. The hero falls and stands on top of the ground.\n4. From the **Controller** category, take the `[kahraman] moves [left-right] with player keys, speed [70]` block and snap it under the acceleration block. Make sure **left-right** is selected in the list.\n5. Press ↺. Walk with the right and left keys. The hero stays on the ground and stops when it reaches the edge of the map.\n\nExpected result: the hero comes down from the air, stands on the ground and can walk left and right. All three goals ✓.\n\n### How does it work?\n- Acceleration is added to the speed every frame. The hero starts at speed 0; half a second later it is falling at about 260 pixels a second.\n- The hero stops when it lands on the ground: the ground tiles are \"walls\", and walls stop sprites. When the hero touches a wall, its y speed is set to zero.\n- While the hero is on the ground, gravity is still working; only the wall is holding it up. This will help us ask the question \"am I on the ground?\" in the next lesson.\n- The value 520 is a carefully chosen number: if it is too small, the hero falls slowly as if it were on the Moon; if it is too big, it falls like a stone.\n\n### Try it\n1. Set the acceleration to 200 (light, like the Moon) and to 1000 (heavy). Which one is better for a platform game?\n2. Give the acceleration a minus number (-300). What happens to the hero? In which game would you use this?\n3. At the start, put the hero at the very top of the screen (`move to x 80 y 10`) and watch it fall. How many seconds does it take to land?\n\n### Common mistakes\n- Choosing **in 4 directions** as the way of moving: every frame the game sets the y speed from the up and down keys, and gravity has no effect. In platform games, choose **left-right**.\n- Writing `set speed x 0 y 100` instead of acceleration: the hero falls, but always at the same speed; there is no feeling of \"falling faster and faster\".\n- Leaving the acceleration block outside `when game starts`: the block does not run, and the hero stays hanging.\n- Placing the hero inside the ground at the start: the hero gets stuck inside the wall. Put it somewhere in the sky.",
            "question": "In the game, gravity is a fixed 520, but in real life gravity on the Moon is much weaker than on Earth. If you made a game set on the Moon, how would you choose the acceleration, and how would the hero's jump be different?",
            "explainerMd": "### What you will learn in this lesson\n- The difference between speed and acceleration\n- That gravity in a game is an \"acceleration\"\n- That the y axis grows downwards\n- Why you choose the \"left-right\" way of moving in a platform game\n\n### What you should know first\nIn lesson 2 you learnt to walk the cat with the keys, and in lesson 4 the `set speed x y` block. In lesson 11 you saw the tile map and wall tiles. In this lesson you will put these together.\n\n### Speed and acceleration are not the same thing\n**Speed** is how many pixels a sprite moves each second. If the speed is 100, the sprite moves 100 pixels every second, always at the same speed.\n\n**Acceleration** is how much the speed changes. If the acceleration is y = 400, the sprite's downward speed grows by 400 pixels/s every second. Like a bicycle going faster and faster down a hill.\n\n```\nTime     Speed (acceleration 400)\n0.25 s   100 pixels/s\n0.50 s   200 pixels/s\n0.75 s   300 pixels/s\n```\n\nSpeed = acceleration x time. As it speeds up, the sprite moves further every frame; that is why the fall looks \"real\".\n\n### The y axis grows downwards\nOn the game screen, the top-left corner is the point (0, 0). x grows to the right and **y grows downwards**. That is why a downward acceleration is a **positive** y value. If you want to move the sprite up, you use a minus number. You will need this rule in the jumping lesson too.\n\n### Setting up gravity\nGravity means giving the sprite a constant downward acceleration. One block is enough:\n\n```\nwhen game starts:\n  set kahraman acceleration x 0 y 520\n```\n\nThe hero falls and stops when it hits a ground tile (a wall). The engine sets the speed of a sprite that hits a wall to zero in that direction. While the hero is standing on the ground, the acceleration is still there; the wall holds it up.\n\n### Choose the right way of moving\nIf you choose **in 4 directions** in the `moves with player keys` block, the engine writes the y speed again from the keys every frame. If you are not pressing a key, the y speed becomes 0 and gravity has almost no effect; the hero drifts down very slowly. If you choose **left-right**, only the sideways speed depends on the keys, and the up-down speed is left to gravity.\n\n### Summary\nSpeed tells you how fast a sprite is going; acceleration tells you how quickly that speed changes. Gravity is a positive acceleration in the y direction, because y grows downwards. In a platform game you choose left-right as the way of moving so that gravity can work. Because the ground tiles are walls, the hero stops when it lands.",
            "concepts": [
              {
                "term": "Speed",
                "definition": "How many pixels the sprite moves each second (pixels/s).",
                "example": "A sprite with speed x 100 moves 100 pixels to the right every second.",
                "pitfall": "Mixing up speed and acceleration; speed stays the same, acceleration changes the speed."
              },
              {
                "term": "Acceleration",
                "definition": "How much the speed grows each second (pixels/s²).",
                "example": "If the acceleration is y = 400, the downward speed grows by 400 every second; after 0.5 seconds it is 200.",
                "pitfall": "Writing a fixed number for speed instead of acceleration: the sprite always goes at the same speed and there is no feeling of speeding up."
              },
              {
                "term": "Gravity",
                "definition": "A positive y acceleration given to a sprite all the time, pulling it down.",
                "example": "The set kahraman acceleration x 0 y 520 block makes the hero fall faster and faster.",
                "pitfall": "Forgetting to put the acceleration inside when game starts: the block does not run and the hero stays hanging."
              },
              {
                "term": "y axis",
                "definition": "On the screen, y grows from top to bottom; the top-left corner is (0, 0).",
                "example": "A sprite that goes from y = 24 to y = 88 has moved down.",
                "pitfall": "Writing a minus number for the downward direction; down is positive, up is minus."
              },
              {
                "term": "Left-right movement",
                "definition": "The keys only control the sideways speed and leave the up-down speed to gravity.",
                "example": "In a platform game you choose `moves [left-right] with player keys`.",
                "pitfall": "Choosing 4 directions: the y speed is written from the keys every frame and gravity has almost no effect."
              },
              {
                "term": "Ground wall",
                "definition": "A wall tile stops a sprite and sets its speed in that direction to zero.",
                "example": "When the falling hero touches a ground tile, it stops and its y speed becomes 0.",
                "pitfall": "Putting the hero inside the ground at the start: it gets stuck inside the wall."
              }
            ],
            "quiz": [
              {
                "id": "m11h5d21-q1",
                "kind": "mcq",
                "prompt": "You gave a sprite acceleration x 0 y 300. What does this block do?",
                "options": [
                  "It moves the sprite 300 pixels down at once",
                  "It raises the downward speed by 300 pixels/s every second",
                  "It fixes the sprite's speed at 300 all the time",
                  "It makes the sprite 300 pixels tall"
                ],
                "answer": 1,
                "explanation": "Acceleration changes the speed: the downward speed grows by 300 pixels/s every second. It does not move the position directly (so the first option is wrong), it does not fix the speed at 300 (the third option is the speed block's job), and it has nothing to do with how it looks.",
                "skills": [
                  "oyun-hiz-ivme",
                  "oyun-yercekimi"
                ]
              },
              {
                "id": "m11h5d21-q2",
                "kind": "numeric",
                "prompt": "A sprite starts still (speed 0) and its downward acceleration is 400 pixels/s². What is its downward speed after 0.75 seconds, in pixels/s?",
                "answer": 300,
                "tolerance": 1,
                "unit": "pixels/s",
                "explanation": "Speed = acceleration x time = 400 x 0.75 = 300 pixels/s. Multiplying the speeding up by the time is enough; the question asks for the speed, not the change in position.",
                "skills": [
                  "oyun-hiz-ivme"
                ]
              },
              {
                "id": "m11h5d21-q3",
                "kind": "predict-output",
                "prompt": "The hero starts in the air and no key is pressed. When this program runs, what does the hero do?\n\n```\nwhen game starts:\n  set kahraman acceleration x 0 y 300\n  kahraman moves [in 4 directions] with player keys, speed 70\n```",
                "options": [
                  "It falls faster and faster and lands on the ground",
                  "It almost hangs in the air, drifting only a few pixels a second",
                  "It flies upwards",
                  "There is a compile error"
                ],
                "answer": 1,
                "explanation": "When 4 directions is chosen, the engine writes the y speed again from the keys every frame; if no key is pressed, it becomes 0. The acceleration only adds a small amount each frame, so the hero does not fall faster and faster; it drifts only a few pixels a second. If left-right had been chosen, gravity would be free to work.",
                "skills": [
                  "oyun-yercekimi",
                  "oyun-hiz-ivme"
                ]
              },
              {
                "id": "m11h5d21-q4",
                "kind": "find-bug",
                "prompt": "The hero does not fall; it stays in the air. Which line is wrong?\n\n```\n1  when game starts:\n2    kahraman = new [Hero] sprite, kind [Player]\n3    move kahraman to x 80 y 24\n4    set kahraman acceleration x 520 y 0\n5    kahraman moves [left-right] with player keys, speed 70\n```",
                "options": [
                  "Line 2: the kind is wrong when the sprite is created",
                  "Line 3: because the position is in the air",
                  "Line 4: the x and y values of the acceleration are swapped",
                  "Line 5: choosing left-right movement"
                ],
                "answer": 2,
                "explanation": "On line 4 the x and y values have been written the wrong way round: the acceleration is 520 sideways and 0 up-down. For gravity, 520 must be typed in the acceleration's y slot. Lines 2, 3 and 5 are correct: the sprite is created, placed in the air, and left-right movement is chosen.",
                "skills": [
                  "oyun-hata-ayiklama",
                  "oyun-yercekimi",
                  "oyun-y-ekseni"
                ]
              },
              {
                "id": "m11h5d21-q5",
                "kind": "numeric",
                "prompt": "The top edge of the ground tile is at y = 96 pixels. The hero is 16 pixels tall and its position is measured from its centre. When the hero lands on the ground and stops, what is its centre y value?",
                "answer": 88,
                "tolerance": 0,
                "unit": "pixels",
                "explanation": "The sprite's centre is half its height (8) above its bottom edge. Because the bottom edge sits on top of the ground (96), the centre is 96 - 8 = 88. y grows downwards, so to go up we subtract.",
                "skills": [
                  "oyun-y-ekseni",
                  "oyun-yercekimi"
                ]
              }
            ]
          }
        },
        {
          "title": "Zıplama: A ile zıpla",
          "durationMin": 20,
          "problem": "Mario'nun zıpladığını biliyorsun. Peki havadayken tekrar basarsan ne olur? Birçok platform oyununda hiçbir şey olmaz, çünkü kahraman havadayken yeni bir zıplama başlatamaz. Bunu kontrol eden basit bir soru var: \"Şu an bir şeyin üstünde duruyor muyum?\" Bu derste o soruyu sorduracaksın.",
          "contentMd": "Önceki derste kurduğun sahne hazır geliyor: zemin, kahraman, yerçekimi ve sağa-sola yürüme. Kahraman ilk başta zemin karosunun üstünde duruyor. Henüz zıplayamıyor.\n\n### Zıplama aslında nedir?\nZıplamak, kahramanın y hızına ani bir **yukarı** değer vermektir. y ekseni aşağı doğru arttığı için yukarı hız **eksi** sayıdır. Yerçekimi bu hızı yavaş yavaş azaltır, kahraman tepe noktasında durur ve geri düşer.\n\n### Blokları kur\n1. **Denetleyici** kategorisinden `[A] düğmesine [basılınca]` bloğunu al ve çalışma alanına bırak.\n2. **Hareket** kategorisinden `[kahraman] hızı x [30] y [0]` bloğunu al ve olayın içine tak. y hızı kutusuna -250 yaz. x hızı kutusuna **Sprite** kategorisinden `[kahraman] [x hızı]` bloğunu tak. Böylece zıplarken yatay hızı korumuş olursun.\n3. ↺ bas. Boşluk (A) tuşuna bas. Kahraman zıplıyor.\n4. Havadayken hızlı hızlı A'ya bas. Kahraman her basışta yeniden fırlıyor ve ekranın tepesine kadar çıkıyor. Bu, istemediğimiz bir \"uçma\".\n5. Düzelt: **Mantık** kategorisinden `eğer ... ise ...` bloğunu al, hız bloğunu içine al ve eğer bloğunu olayın içine koy. Koşul olarak **Sprite** kategorisinden `[kahraman] [alttan bir duvara] dokunuyor mu?` bloğunu tak.\n6. **Ses** kategorisinden `[zıplama] melodisini çal` bloğunu da `ise` kolundaki hız bloğunun altına ekle.\n7. ↺ bas ve havadayken A'ya bas. Artık kahraman havada ikinci kez zıplamıyor.\n\nBeklenen sonuç: A'ya basınca kahraman yaklaşık 60 piksel yükseliyor ve geri düşüyor; havadayken A işe yaramıyor; zıplarken ses çalıyor.\n\n### Nasıl çalışıyor?\n- `alttan bir duvara dokunuyor mu?` sorusu, kahramanın hemen altında duvar karosu varsa \"doğru\" der. Kahraman zeminde ya da bir platformun üstündeyse doğru, havadaysa yanlıştır.\n- Başlangıç hızı -250, ivme 520 olduğu için yükselme yaklaşık 250 x 250 / (2 x 520) = 60 piksel eder. Zıplama yaklaşık bir saniye sürer.\n- Zıplama gücünü artırmak istersen y hızını -300 yap: yükselme yaklaşık 86 piksele çıkar.\n- `eğer` bloğu olmadan, her A basışı yeni bir hız verir; kahraman havada da hızlanır.\n\n### Dene\n1. Zıplama hızını -150, sonra -350 yap. Platform oyunu için hangi değer iyi? Neden?\n2. Aynı bloğu `[yukarı ↑] düğmesine [basılınca]` olayına da kopyala. Artık iki tuşla zıplıyorsun.\n3. Zıpladığında kahramana bir konuşma balonu ver: `[kahraman] [Hop!] desin, [1] saniye` bloğunu ekle.\n\n### Sık yapılan hatalar\n- y hızına pozitif bir sayı yazmak: kahraman yukarı değil aşağı gider ve zemine gömülmeye çalışır.\n- `eğer` bloğunu unutmak: kahraman uçar.\n- Zıplama bloğunu `oyun başlayınca` içine koymak: zıplama yalnız oyunun başında bir kez olur. Tuşa bağlı olay gerekir.\n- Zıplama sırasında yatay hızı sıfırlamak: kahraman olduğu yerde dik çıkıp inen bir asansör gibi olur. Yatay hız için kahramanın kendi `x hızı`'nı kullan.",
          "question": "Bazı oyunlarda çift zıplama vardır; sence bunu bloklarla nasıl yapardın? \"Zıplama sayısını\" saklamak için neye ihtiyacın olurdu?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Zıplamanın y hızına verilen eksi bir değer olduğunu\n- Yerçekiminin zıplamayı nasıl yavaşlatıp tersine çevirdiğini\n- \"Yerde miyim?\" sorusunu `eğer` bloğuyla sormayı\n- Zıplama gücünü hız değeriyle ayarlamayı\n\n### Önceden bilmen gerekenler\nDers 21'deki ivme ve yerçekimi bu dersin temelidir; y ekseninin aşağı doğru arttığını hatırla. Ders 3'te düğme olayını (`A düğmesine basılınca`), ders 7'de `eğer` bloğunu gördün.\n\n### Zıplamak = ani yukarı hız\nZıplamak için kahramana bir anda yukarı yönlü hız verirsin. y aşağı doğru arttığından yukarı hız **eksi** sayıdır.\n\n```\nA düğmesine basılınca:\n  kahraman hızı x (kahraman x hızı) y -250\n```\n\nHızı bir kez verdin; gerisini yerçekimi yapar. Her saniye hıza 520 eklenir, yani eksi hız küçülür, sıfıra gelir (tepe noktası) ve artı olur (düşme). Kahraman kendiliğinden iner.\n\n### Yükseklik ve süre\nYükselme yüksekliği yaklaşık hız x hız / (2 x ivme) kadardır. Süre ise hız / ivme.\n\n```\nHız -250, ivme 520:\n  yükselme = 250 x 250 / (2 x 520) = yaklaşık 60 piksel\n  tepeye çıkma = 250 / 520 = yaklaşık 0,5 saniye\n```\n\nHızı iki katına çıkarırsan yükselme dört katına çıkar, çünkü hız çarpımda iki kez geçer. Bu yüzden zıplama gücünü küçük adımlarla ayarla.\n\n### Havada zıplamayı engelle\nKoruma koymazsan A'ya her basışta yeni hız verilir ve kahraman havada da zıplar; uçar gibi olur. Çözüm bir koşul sormaktır:\n\n```\nA düğmesine basılınca:\n  eğer kahraman alttan bir duvara dokunuyor mu ise:\n    zıplama\n```\n\n`alttan bir duvara dokunuyor mu?` yalnız kahramanın hemen altında duvar varsa doğrudur: zemin ya da bir platform. Havadayken yanlıştır ve blok çalışmaz.\n\n### Yatay hızı koru\nZıplarken `x hızı` kutusuna 0 yazarsan kahraman dik çıkıp dik iner. Kutuya kahramanın kendi `x hızı`nı koyarsan zıplarken yürüdüğü yönde gitmeye devam eder.\n\n### Özet\nZıplama, kahramanın y hızına eksi bir değer vermektir. Yerçekimi bu hızı azaltır ve kahramanı geri indirir. Havada zıplamayı önlemek için zıplamayı `alttan bir duvara dokunuyor mu?` koşuluna bağlarsın. Zıplama yüksekliği hızın karesiyle büyür, bu yüzden değeri küçük adımlarla deneyerek seç.",
          "concepts": [
            {
              "term": "Zıplama hızı",
              "definition": "Kahramana bir anda verilen yukarı (eksi) y hızı.",
              "example": "kahraman hızı x (x hızı) y -250 kahramanı yukarı fırlatır.",
              "pitfall": "Pozitif sayı yazmak: kahraman yukarı değil aşağı gider."
            },
            {
              "term": "Tepe noktası",
              "definition": "Yerçekimi yukarı hızı sıfıra indirdiğinde kahramanın en yükseğe çıktığı an.",
              "example": "Hız -260, ivme 520 ise tepeye 0,5 saniyede çıkılır.",
              "pitfall": "Tepede zıplamanın bittiğini sanmak; yerçekimi kahramanı geri indirir."
            },
            {
              "term": "Yerde mi?",
              "definition": "`alttan bir duvara dokunuyor mu?` bloğu, kahramanın altında duvar olup olmadığını söyler.",
              "example": "Zemindeyken doğru, havadayken yanlıştır.",
              "pitfall": "Bu koşulu unutmak: kahraman havada da zıplar, yani uçar."
            },
            {
              "term": "Koşullu zıplama",
              "definition": "Zıplama bloğunu `eğer yerdeyse` içine koymak.",
              "example": "A düğmesine basılınca, eğer alttan duvara dokunuyorsa hız bloğu çalışır.",
              "pitfall": "Zıplamayı oyun başlayınca içine koymak: yalnız başta bir kez olur."
            },
            {
              "term": "Yatay hızı korumak",
              "definition": "Zıplarken x hızı kutusuna kahramanın kendi x hızını koymak.",
              "example": "`kahraman x hızı` bloğu zıplarken yürüyüş yönünü sürdürür.",
              "pitfall": "x hızına 0 yazmak: kahraman dik çıkıp dik iner."
            },
            {
              "term": "Zıplama gücü",
              "definition": "Zıplama hızının büyüklüğü; yükseklik hızın karesiyle büyür.",
              "example": "-250'den -300'e geçince yükselme 60 pikselden yaklaşık 86 piksele çıkar.",
              "pitfall": "Hızı çok artırmak: kahraman ekranın dışına çıkabilir, platformlar anlamını yitirir."
            }
          ],
          "quiz": [
            {
              "id": "m11h5d22-q1",
              "kind": "mcq",
              "prompt": "Zıplama için y hızına neden eksi bir sayı yazılır?",
              "options": [
                "Çünkü ekranda y aşağı doğru artar, yukarı eksidir",
                "Çünkü eksi sayılar daha hızlıdır",
                "Çünkü A düğmesi eksi değer ister",
                "Çünkü yerçekimi eksi sayıyla çalışır"
              ],
              "answer": 0,
              "explanation": "Ekranda y aşağı doğru arttığı için yukarı yön eksidir. Pozitif sayı kahramanı aşağı iter. Seçenekler arasındaki \"ses\" ya da \"tuş\" gerekçeleri hızın işaretiyle ilgili değildir.",
              "skills": [
                "oyun-ziplama",
                "oyun-y-ekseni"
              ]
            },
            {
              "id": "m11h5d22-q2",
              "kind": "numeric",
              "prompt": "Kahraman y hızı -260 ile zıplıyor, yerçekimi ivmesi 520 piksel/sn². Yukarı hızı sıfıra inip tepe noktasına kaç saniyede ulaşır?",
              "answer": 0.5,
              "tolerance": 0.05,
              "unit": "sn",
              "explanation": "Süre = hız / ivme = 260 / 520 = 0,5 saniye. Hız her saniye 520 azalır; 260'ın sıfıra inmesi yarım saniye sürer. Motor 1/60 saniyelik adımlarla çalıştığı için 0,05 saniyelik sapma kabul edilir.",
              "skills": [
                "oyun-ziplama",
                "oyun-hiz-ivme"
              ]
            },
            {
              "id": "m11h5d22-q3",
              "kind": "predict-output",
              "prompt": "Oyuncu havadayken A'ya art arda basıyor. Bu program kahramanı nasıl hareket ettirir?\n\n```\nA düğmesine basılınca:\n  kahraman hızı x (kahraman x hızı) y -250\n```",
              "options": [
                "Havadayken basışlar işe yaramaz",
                "Her basışta yeniden fırlar, havada da zıplar",
                "Kahraman yere gömülür",
                "Yalnız ilk basışta zıplar"
              ],
              "answer": 1,
              "explanation": "Blokta zeminde olup olmadığını soran bir koşul yok. Her basışta yukarı hız yeniden -250 yapılır, bu yüzden kahraman havadayken de fırlar ve istediği kadar yükselir. Çözüm bu bloğu `eğer alttan bir duvara dokunuyor mu ise` içine koymaktır.",
              "skills": [
                "oyun-ziplama",
                "oyun-mantik-kosul"
              ]
            },
            {
              "id": "m11h5d22-q4",
              "kind": "find-bug",
              "prompt": "Kahraman A'ya basınca zıplamak yerine yere doğru itiliyor. Hatalı satır hangisi?\n\n```\n1  A düğmesine basılınca:\n2    eğer kahraman alttan bir duvara dokunuyor mu ise:\n3      kahraman hızı x (kahraman x hızı) y 250\n4      [zıplama] melodisini çal\n```",
              "options": [
                "Satır 1: A düğmesi olayı yanlış",
                "Satır 2: yerde mi koşulu",
                "Satır 4: ses çalma",
                "Satır 3: y hızının işareti yanlış"
              ],
              "answer": 3,
              "explanation": "3. satırda y hızı pozitif yazılmış; pozitif y aşağı demektir. Yukarı zıplamak için -250 olmalı. 2. satırdaki koşul doğru, 4. satırdaki ses zıplamayı etkilemez.",
              "skills": [
                "oyun-hata-ayiklama",
                "oyun-ziplama",
                "oyun-y-ekseni"
              ]
            },
            {
              "id": "m11h5d22-q5",
              "kind": "mcq",
              "prompt": "Zıplarken kahramanın yürüdüğü yönde gitmeye devam etmesi için hız bloğunun x hızı kutusuna ne konmalı?",
              "options": [
                "0",
                "Kahramanın kendi x hızı",
                "70",
                "Yerçekimi ivmesi"
              ],
              "answer": 1,
              "explanation": "Kahramanın kendi `x hızı` bloğu konunca yatay hız zıplama anında olduğu gibi korunur. 0 yazılırsa kahraman dik çıkıp iner; 70 yazılırsa kahraman duruyorken bile sağa fırlar.",
              "skills": [
                "oyun-ziplama",
                "oyun-hiz-ivme"
              ]
            }
          ],
          "contentEn": {
            "title": "Jumping: jump with A",
            "problem": "You know how Mario jumps. But what happens if you press again while he is in the air? In many platform games nothing happens, because the hero cannot start a new jump in mid-air. There is a simple question that controls this: \"Am I standing on something right now?\" In this lesson you will make the game ask that question.",
            "contentMd": "The scene you built in the last lesson is ready: ground, hero, gravity and walking left and right. At the start the hero is standing on top of a ground tile. It cannot jump yet.\n\n### What is a jump, really?\nJumping means giving the hero's y speed a sudden **upward** value. Because the y axis grows downwards, an upward speed is a **minus** number. Gravity slowly takes this speed away, the hero stops at the highest point and falls back down.\n\n### Build the blocks\n1. From the **Controller** category, take the `when [A] button is [pressed]` block and drop it in the workspace.\n2. From the **Motion** category, take the `set [kahraman] speed x [30] y [0]` block and snap it inside the event. Type -250 in the y speed slot. In the x speed slot, snap the `[kahraman] [x speed]` block from the **Sprite** category. This way you keep the sideways speed while jumping.\n3. Press ↺. Press the space (A) key. The hero jumps.\n4. While it is in the air, press A quickly again and again. The hero shoots up again on every press and climbs all the way to the top of the screen. This is a kind of \"flying\" we do not want.\n5. Fix it: take the `if ... do ...` block from the **Logic** category, put the speed block inside it, and put the if block inside the event. For the condition, snap in the `is [kahraman] touching [a wall below]?` block from the **Sprite** category.\n6. Also add the `play melody [jump]` block from the **Sound** category under the speed block in the `do` branch.\n7. Press ↺ and press A while in the air. Now the hero does not jump a second time in the air.\n\nExpected result: when you press A, the hero rises about 60 pixels and falls back down; in the air A does nothing; a sound plays when it jumps.\n\n### How does it work?\n- The question `touching a wall below?` says \"true\" if there is a wall tile right under the hero. If the hero is on the ground or on top of a platform it is true; if it is in the air it is false.\n- Because the starting speed is -250 and the acceleration is 520, the rise works out at about 250 x 250 / (2 x 520) = 60 pixels. The jump takes about a second.\n- If you want a stronger jump, set the y speed to -300: the rise goes up to about 86 pixels.\n- Without the `if` block, every press of A gives a new speed; the hero speeds up in the air too.\n\n### Try it\n1. Set the jump speed to -150, then to -350. Which value is good for a platform game? Why?\n2. Copy the same block into a `when [up ↑] button is [pressed]` event as well. Now you jump with two keys.\n3. Give the hero a speech bubble when it jumps: add the `[kahraman] says [Hop!] for [1] seconds` block.\n\n### Common mistakes\n- Typing a positive number for the y speed: the hero goes down instead of up and tries to sink into the ground.\n- Forgetting the `if` block: the hero flies.\n- Putting the jump block inside `when game starts`: the jump happens only once, at the start of the game. You need an event linked to a key.\n- Setting the sideways speed to zero while jumping: the hero goes straight up and down on the spot, like a lift. For the sideways speed, use the hero's own `x speed`.",
            "question": "Some games have a double jump; how do you think you would make one with blocks? What would you need to store the \"number of jumps\"?",
            "explainerMd": "### What you will learn in this lesson\n- That a jump is a minus value given to the y speed\n- How gravity slows a jump down and turns it round\n- How to ask \"am I on the ground?\" with an `if` block\n- How to set the jump strength with the speed value\n\n### What you should know first\nThe acceleration and gravity from lesson 21 are the base of this lesson; remember that the y axis grows downwards. In lesson 3 you saw the button event (`when A button is pressed`), and in lesson 7 the `if` block.\n\n### Jumping = a sudden upward speed\nTo jump, you give the hero an upward speed all at once. Because y grows downwards, an upward speed is a **minus** number.\n\n```\nwhen A button is pressed:\n  set kahraman speed x (kahraman x speed) y -250\n```\n\nYou gave the speed once; gravity does the rest. Every second, 520 is added to the speed, so the minus speed gets smaller, reaches zero (the highest point) and becomes positive (falling). The hero comes down by itself.\n\n### Height and time\nThe rise is about speed x speed / (2 x acceleration). The time is speed / acceleration.\n\n```\nSpeed -250, acceleration 520:\n  rise = 250 x 250 / (2 x 520) = about 60 pixels\n  time to the top = 250 / 520 = about 0.5 seconds\n```\n\nIf you double the speed, the rise becomes four times bigger, because the speed appears twice in the multiplication. That is why you should adjust the jump strength in small steps.\n\n### Stop jumping in mid-air\nIf you do not add a guard, every press of A gives a new speed and the hero jumps in the air too; it is almost like flying. The fix is to ask a condition:\n\n```\nwhen A button is pressed:\n  if is kahraman touching a wall below? do:\n    jump\n```\n\n`touching a wall below?` is only true if there is a wall right under the hero: the ground or a platform. In the air it is false, and the block does not run.\n\n### Keep the sideways speed\nIf you type 0 in the `x speed` slot when jumping, the hero goes straight up and straight down. If you put the hero's own `x speed` in the slot, it keeps going in the direction it was walking while it jumps.\n\n### Summary\nA jump is giving the hero's y speed a minus value. Gravity takes this speed away and brings the hero back down. To stop jumps in mid-air, you link the jump to the condition `touching a wall below?`. The jump height grows with the square of the speed, so choose the value by trying it in small steps.",
            "concepts": [
              {
                "term": "Jump speed",
                "definition": "An upward (minus) y speed given to the hero all at once.",
                "example": "set kahraman speed x (x speed) y -250 launches the hero upwards.",
                "pitfall": "Typing a positive number: the hero goes down instead of up."
              },
              {
                "term": "Highest point",
                "definition": "The moment the hero is at its highest, when gravity has brought the upward speed down to zero.",
                "example": "If the speed is -260 and the acceleration 520, it reaches the top in 0.5 seconds.",
                "pitfall": "Thinking the jump ends at the top; gravity brings the hero back down."
              },
              {
                "term": "On the ground?",
                "definition": "The `touching a wall below?` block tells you whether there is a wall under the hero.",
                "example": "It is true on the ground and false in the air.",
                "pitfall": "Forgetting this condition: the hero jumps in the air too, in other words it flies."
              },
              {
                "term": "Conditional jump",
                "definition": "Putting the jump block inside `if on the ground`.",
                "example": "When the A button is pressed, the speed block runs if it is touching a wall below.",
                "pitfall": "Putting the jump inside when game starts: it only happens once, at the start."
              },
              {
                "term": "Keeping the sideways speed",
                "definition": "Putting the hero's own x speed in the x speed slot when jumping.",
                "example": "The `kahraman x speed` block keeps the walking direction during the jump.",
                "pitfall": "Typing 0 for the x speed: the hero goes straight up and straight down."
              },
              {
                "term": "Jump strength",
                "definition": "How big the jump speed is; the height grows with the square of the speed.",
                "example": "Going from -250 to -300 raises the rise from 60 pixels to about 86 pixels.",
                "pitfall": "Raising the speed too much: the hero can leave the screen, and the platforms lose their point."
              }
            ],
            "quiz": [
              {
                "id": "m11h5d22-q1",
                "kind": "mcq",
                "prompt": "Why is a minus number typed for the y speed to jump?",
                "options": [
                  "Because on the screen y grows downwards, so up is minus",
                  "Because minus numbers are faster",
                  "Because the A button needs a minus value",
                  "Because gravity works with a minus number"
                ],
                "answer": 0,
                "explanation": "Because y grows downwards on the screen, the upward direction is minus. A positive number pushes the hero down. The \"sound\" or \"key\" reasons among the options have nothing to do with the sign of the speed.",
                "skills": [
                  "oyun-ziplama",
                  "oyun-y-ekseni"
                ]
              },
              {
                "id": "m11h5d22-q2",
                "kind": "numeric",
                "prompt": "The hero jumps with a y speed of -260, and the gravity acceleration is 520 pixels/s². In how many seconds does its upward speed drop to zero and reach the highest point?",
                "answer": 0.5,
                "tolerance": 0.05,
                "unit": "s",
                "explanation": "Time = speed / acceleration = 260 / 520 = 0.5 seconds. The speed goes down by 520 every second; it takes half a second for 260 to drop to zero. Because the engine works in steps of 1/60 of a second, a difference of 0.05 seconds is accepted.",
                "skills": [
                  "oyun-ziplama",
                  "oyun-hiz-ivme"
                ]
              },
              {
                "id": "m11h5d22-q3",
                "kind": "predict-output",
                "prompt": "While in the air, the player presses A again and again. How does this program move the hero?\n\n```\nwhen A button is pressed:\n  set kahraman speed x (kahraman x speed) y -250\n```",
                "options": [
                  "Presses in the air do nothing",
                  "It shoots up again on every press and jumps in the air too",
                  "The hero sinks into the ground",
                  "It only jumps on the first press"
                ],
                "answer": 1,
                "explanation": "There is no condition in the block asking whether it is on the ground. On every press the upward speed is set to -250 again, so the hero shoots up in the air too and rises as much as you like. The fix is to put this block inside `if is kahraman touching a wall below? do`.",
                "skills": [
                  "oyun-ziplama",
                  "oyun-mantik-kosul"
                ]
              },
              {
                "id": "m11h5d22-q4",
                "kind": "find-bug",
                "prompt": "When you press A, the hero is pushed towards the ground instead of jumping. Which line is wrong?\n\n```\n1  when A button is pressed:\n2    if is kahraman touching a wall below? do:\n3      set kahraman speed x (kahraman x speed) y 250\n4      play melody [jump]\n```",
                "options": [
                  "Line 1: the A button event is wrong",
                  "Line 2: the on-the-ground condition",
                  "Line 4: playing the sound",
                  "Line 3: the sign of the y speed is wrong"
                ],
                "answer": 3,
                "explanation": "On line 3 the y speed is written as positive; positive y means down. To jump up it should be -250. The condition on line 2 is correct, and the sound on line 4 does not affect the jump.",
                "skills": [
                  "oyun-hata-ayiklama",
                  "oyun-ziplama",
                  "oyun-y-ekseni"
                ]
              },
              {
                "id": "m11h5d22-q5",
                "kind": "mcq",
                "prompt": "To make the hero keep going in the direction it was walking while it jumps, what should go in the x speed slot of the speed block?",
                "options": [
                  "0",
                  "The hero's own x speed",
                  "70",
                  "The gravity acceleration"
                ],
                "answer": 1,
                "explanation": "When the hero's own `x speed` block is used, the sideways speed is kept as it was at the moment of the jump. If 0 is typed, the hero goes straight up and down; if 70 is typed, the hero shoots off to the right even when it was standing still.",
                "skills": [
                  "oyun-ziplama",
                  "oyun-hiz-ivme"
                ]
              }
            ]
          }
        },
        {
          "title": "Platformlar, altınlar ve dikenler",
          "durationMin": 25,
          "problem": "Platform oyunlarının tadı, zıplayıp bir sonraki yere ulaşmaktır. Yolda altınlar toplarsın; dikenler ise seni tuzağa düşürmek ister. Bu derste haritadaki özel karoların kahramanla konuşmasını sağlayacaksın: \"altına değdim\", \"dikene değdim\".",
          "contentMd": "Hazır bir harita yüklü: 20 karo genişliğinde, yerde dikenler, havada iki platform ve platformların üstünde birer altın var. Kahraman yürüyor, zıplıyor ve kamera onu izliyor. Skor 0, can 3. Henüz altın toplanmıyor, dikenler zarar vermiyor.\n\n### Haritayı tanı\n**Harita** sekmesinde haritayı inceleyebilirsin. Sütun ve satır numaraları sol üstten 0'dan başlar. Altın (nesne) ve diken (tuzak) karoları **duvar değildir**: kahraman içlerinden geçer. Ama kahramanın o karoya değdiğini oyun fark eder ve bir olay tetikler.\n\n### Blokları kur: altın\n1. ▶ bas. Kahraman altından geçiyor ama hiçbir şey olmuyor.\n2. **Sahne / Harita** kategorisinden `bir [Oyuncu] sprite'ı [Altın] karosuna dokununca` olayını al. Tür olarak **Oyuncu**'yu, resim olarak **Altın**'ı seç.\n3. İçine **Sahne / Harita** kategorisinden `sütun [0] satır [0] karosunu boşalt` bloğunu koy. Sütun kutusuna `olay karosunun [sütunu]`, satır kutusuna `olay karosunun [satırı]` bloklarını tak. Bu bloklar dokunduğun altının yerini bilir.\n4. Altına **Oyun** kategorisinden `skoru [1] değiştir` ve **Ses** kategorisinden `[puan] melodisini çal` ekle.\n5. ↺ bas. Altınlara dokun: altın kayboluyor, skor 1 artıyor.\n\n### Blokları kur: diken\n6. Yeni bir `bir [Oyuncu] sprite'ı [Dikenler] karosuna dokununca` olayı al. Resim olarak **Dikenler**'i seç.\n7. İçine sırayla: `canı [-1] değiştir`; `ekranı [250] ms salla`; **Sahne / Harita** kategorisinden `[bu sprite] sprite'ını sütun [2] satır [5] karosuna koy` (`bu sprite` kahraman olur); **Hareket** kategorisinden `[bu sprite] hızı x [0] y [0]`.\n8. ↺ bas. Dikene değince can azalıyor, ekran sallanıyor ve kahraman başlangıç karosuna dönüyor.\n\nBeklenen sonuç: Altınlar toplanınca kayboluyor ve skor artıyor; dikene değince can azalıp kahraman başa dönüyor. Beş hedefin hepsi ✓.\n\n### Nasıl çalışıyor?\n- `karosuna dokununca` olayı kenar tetiklemelidir: kahraman karoya girdiği anda bir kez çalışır. Aynı karoda durduğun sürece sürekli çalışmaz.\n- `olay karosunun sütunu / satırı` yalnızca bu olayın içinde anlamlıdır.\n- Altını boşaltmak (silmek) önemli: aksi hâlde altın haritada kalır ve gözle görünür biçimde toplanmamış olur.\n- Kahramanı başa koyarken hızını da sıfırladık: aksi hâlde başa dönse bile düşme hızıyla zemine çarpıp zıplayabilir.\n\n### Dene\n1. Platformun üstündeki altına zıplayarak ulaş. Yetmiyorsan zıplama hızını -300 yap.\n2. Dikene değince can almak yerine anında oyunu kaybet: `oyunu bitir: [kaybettin]` bloğunu dene.\n3. Altın başına 5 puan ver. Skor hedefini 10 yapıp 2 altın toplayınca kazanmayı ekle.\n\n### Sık yapılan hatalar\n- Altına dokununca karoyu boşaltmamak: altın kaybolmaz.\n- `olay karosunun` bloklarını yerine 0 yazmak: hep sol üst köşedeki karo boşalır.\n- Kahramanı başa koyarken sütun/satır yerine piksel koordinatı yazmak: o blok karo numarası ister, piksel değil.\n- Diken olayında türü yanlış seçmek: **Oyuncu** yerine **Düşman** seçersen kahraman dokununca olay çalışmaz.",
          "question": "Neden diken ve altın karolarını duvar yapmadık? Duvar olsalardı kahraman onlara dokunmadan önce ne olurdu? Hangi karoların duvar, hangilerinin geçilebilir olması gerekir?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Altın ve diken gibi karoların duvar olmadığını ama olay tetikleyebildiğini\n- `karosuna dokununca` olayının kenar tetiklemeli çalıştığını\n- Dokunulan karonun yerini `olay karosunun sütunu / satırı` ile bulmayı\n- Sütun ve satır numarasını piksel konumuna çevirmeyi\n\n### Önceden bilmen gerekenler\nDers 11-13'te haritayı ve `karosuna dokununca` olayını öğrendin. Ders 9'da `canı değiştir` ve `ekranı salla` bloklarını kullandın. Ders 21-22'deki yerçekimi ve zıplama bu sahnenin hareketini sağlıyor.\n\n### Her karo bir şeydir\nHarita karolardan oluşur ve her karo 16 x 16 pikseldir. Karoların iki türü vardır:\n- **Duvar karosu:** sprite içinden geçemez (zemin, platform).\n- **Geçilebilir karo:** sprite içinden geçer (altın, diken, kapı). Ama motor \"bu sprite şu karoya değdi\" diye olay tetikler.\n\nAltın ve dikeni duvar yapsaydın kahraman onlara hiç giremez, üstlerinde durup kalırdı. Toplamak ya da yaralanmak için içlerine girebilmesi gerekir.\n\n### Kenar tetikleme\n`bir Oyuncu sprite'ı [Altın] karosuna dokununca` bloğu, kahraman karoya girdiği anda **bir kez** çalışır. Aynı karoda durduğun sürece tekrar çalışmaz. Karodan çıkıp yeniden girersen tekrar çalışır.\n\nBu yüzden altını toplayınca karoyu **boşaltman** gerekir. Boşaltmazsan altın görünür kalır ve kahraman çıkıp girdikçe her seferinde puan verir.\n\n### Hangi karo?\nHaritada birçok altın olabilir. Hepsi için aynı olay çalışır, o hâlde hangisinin boşalacağını bilmen gerekir. Çözüm olay bloklarıdır:\n\n```\nsütun (olay karosunun sütunu) satır (olay karosunun satırı) karosunu boşalt\n```\n\nSabit bir sayı yazarsan hep aynı karo boşalır.\n\n### Karo numarasından piksele\nSütun ve satırlar 0'dan başlar. Bir sprite'ı karoya koyunca sprite'ın **merkezi** karonun ortasına gelir:\n\n```\nmerkez x = sütun x 16 + 8\nmerkez y = satır x 16 + 8\nSütun 2, satır 5  ->  x = 40, y = 88\n```\n\n### Dikenden sonra sıfırla\nDiken olayında kahramanı başlangıç karosuna koyarken hızını da sıfırla. Dikene zıplarken yukarı çıkıyorsan hızı sıfırlamazsan kahraman başlangıç karosundan havaya fırlar.\n\n### Özet\nAltın, diken ve kapı gibi karolar duvar değildir; kahraman içlerinden geçer ve motor temas olayı tetikler. Olay, karoya girilince bir kez çalışır. Hangi karonun tetiklendiğini `olay karosunun` blokları söyler. Karo numarasını 16 ile çarpıp 8 ekleyerek karonun merkez pikselini bulursun.",
          "concepts": [
            {
              "term": "Geçilebilir karo",
              "definition": "Duvar olmayan, sprite'ın içinden geçebildiği karo (altın, diken, kapı).",
              "example": "Kahraman altının içinden geçer; motor yine de dokunma olayı tetikler.",
              "pitfall": "Altın ya da dikeni duvar yapmak: kahraman içine giremez, toplayamaz."
            },
            {
              "term": "karosuna dokununca",
              "definition": "Bir sprite'ın belirli bir karoya girdiği anda çalışan olay.",
              "example": "Oyuncu + Altın karosu olayında skor artırılır.",
              "pitfall": "Türü yanlış seçmek: Oyuncu yerine Düşman seçersen kahraman dokununca olay çalışmaz."
            },
            {
              "term": "Kenar tetikleme",
              "definition": "Olay, karoya girilince bir kez çalışır; karoda durmak tekrar tetiklemez.",
              "example": "Dikende üç saniye dursan olay bir kez çalışır, çıkıp girersen yeniden.",
              "pitfall": "Olayın her karede çalışacağını sanmak."
            },
            {
              "term": "olay karosunun sütunu / satırı",
              "definition": "Olayı tetikleyen karonun konumunu veren bloklar.",
              "example": "Altını `sütun (olay karosunun sütunu) satır (olay karosunun satırı) karosunu boşalt` ile silersin.",
              "pitfall": "Sabit bir sayı yazmak: hep aynı karo boşalır."
            },
            {
              "term": "Karo boşaltmak",
              "definition": "Haritadaki bir karoyu silmek; altın böylece toplanmış olur.",
              "example": "Altın olayında `karosunu boşalt` çalışınca altın kaybolur.",
              "pitfall": "Boşaltmayı unutmak: altın kalır, çıkıp girdikçe puan verir."
            },
            {
              "term": "Karo merkezi",
              "definition": "Karoya konan sprite'ın merkezi: x = sütun x 16 + 8, y = satır x 16 + 8.",
              "example": "Sütun 2, satır 5 karosunun merkezi (40, 88) olur.",
              "pitfall": "Karo numarası yerine piksel yazmak ya da tersini yapmak."
            }
          ],
          "quiz": [
            {
              "id": "m11h5d23-q1",
              "kind": "mcq",
              "prompt": "Altın karosu neden duvar yapılmaz?",
              "options": [
                "Altın duvar olursa çizilemez",
                "Duvar olsa kahraman içine giremez, olay tetiklenmezdi",
                "Duvar karoları puan vermez",
                "Altın ancak platform üstünde durabilir"
              ],
              "answer": 1,
              "explanation": "Duvar olsaydı kahraman altının içine giremezdi; önünde durup kalırdı. Geçilebilir karoya girince motor dokunma olayını tetikler ve toplama ya da yaralanma gerçekleşir. Duvar olmak çarpışmayı değil durdurmayı sağlar.",
              "skills": [
                "oyun-karo-olay"
              ]
            },
            {
              "id": "m11h5d23-q2",
              "kind": "predict-output",
              "prompt": "Altın olayı aşağıdaki gibi. Altın karosu haritada hâlâ duruyor. Kahraman karoya girip çıkıyor, sonra bir kez daha girip çıkıyor. Skor kaç olur?\n\n```\nbir [Oyuncu] sprite'ı [Altın] karosuna dokununca:\n  skoru 1 değiştir\n```",
              "options": [
                "1",
                "2",
                "0",
                "Her karede arttığı için çok yüksek bir sayı"
              ],
              "answer": 1,
              "explanation": "Olay karoya her girişte bir kez çalışır. Karo boşaltılmadığı için iki giriş iki puan verir (1 + 1 = 2). Karoda dururken tekrar tetiklenmez ama ikinci giriş yeni bir tetiklemedir. Bu yüzden altın olayında karoyu boşaltmak gerekir.",
              "skills": [
                "oyun-olay-kenar",
                "oyun-karo-olay"
              ]
            },
            {
              "id": "m11h5d23-q3",
              "kind": "find-bug",
              "prompt": "Kahraman altına dokunuyor, skor artıyor ama altın ekranda kalıyor. Hatalı satır hangisi?\n\n```\n1  bir [Oyuncu] sprite'ı [Altın] karosuna dokununca:\n2    sütun 0 satır 0 karosunu boşalt\n3    skoru 1 değiştir\n```",
              "options": [
                "Satır 1: olay türü",
                "Satır 2: sabit sütun ve satır",
                "Satır 3: skor değişimi",
                "Hata yok, altın zaten kaybolur"
              ],
              "answer": 1,
              "explanation": "2. satırda sütun ve satır sabit 0 yazılmış; her seferinde sol üst köşedeki karo boşaltılır ve dokunulan altın yerinde kalır. Orada `olay karosunun sütunu` ve `olay karosunun satırı` blokları olmalı. Skor satırı doğru.",
              "skills": [
                "oyun-hata-ayiklama",
                "oyun-karo-olay"
              ]
            },
            {
              "id": "m11h5d23-q4",
              "kind": "numeric",
              "prompt": "Kahramanı `sütun 6 satır 4` karosuna koyuyorsun. Karo 16 piksel; sprite karonun ortasına oturur. Kahramanın merkez x konumu kaç piksel olur?",
              "answer": 104,
              "tolerance": 0,
              "unit": "piksel",
              "explanation": "Merkez x = sütun x 16 + 8 = 6 x 16 + 8 = 104. Sütun numarası 0'dan başlar; karonun sol kenarı 96, orta noktası 104'tür.",
              "skills": [
                "oyun-harita-olcu"
              ]
            },
            {
              "id": "m11h5d23-q5",
              "kind": "mcq",
              "prompt": "Dikene yukarı zıplarken değen kahraman başlangıç karosuna konuyor ama hızı sıfırlanmıyor. Ne olur?",
              "options": [
                "Hiçbir şey olmaz",
                "Kahraman yukarı hızını koruyup başlangıç karosundan havaya fırlar",
                "Kahraman zemine gömülür",
                "Can iki kez azalır"
              ],
              "answer": 1,
              "explanation": "Konum değişse de hız aynı kalır; kahraman yukarı doğru hızını sürdürerek başlangıç karosundan havaya fırlar. Aşağı doğru kalan hız zemine çarpınca zaten sıfırlanır, o yüzden asıl sorun yukarı hızdır. Bu yüzden başa koyarken hızı da 0, 0 yaparız.",
              "skills": [
                "oyun-karo-olay",
                "oyun-hiz-ivme"
              ]
            }
          ],
          "contentEn": {
            "title": "Platforms, gold and spikes",
            "problem": "The fun of platform games is jumping and reaching the next place. Along the way you collect gold, while spikes try to trap you. In this lesson you will make the special tiles on the map talk to the hero: \"I touched gold\", \"I touched spikes\".",
            "contentMd": "A ready-made map is loaded: it is 20 tiles wide, with spikes on the ground, two platforms in the air and a piece of gold on top of each platform. The hero walks, jumps, and the camera follows it. The score is 0 and lives are 3. Gold is not collected yet, and the spikes do no harm.\n\n### Get to know the map\nYou can look at the map in the **Map** tab. Column and row numbers start from 0 at the top left. Gold (object) and spike (trap) tiles are **not walls**: the hero passes through them. But the game notices that the hero has touched that tile and triggers an event.\n\n### Build the blocks: gold\n1. Press ▶. The hero passes through the gold, but nothing happens.\n2. From the **Stage / Map** category, take the `when a [Player] sprite touches tile [Gold]` event. Choose **Player** as the kind and **Gold** as the picture.\n3. Inside it, put the `clear tile at column [0] row [0]` block from the **Stage / Map** category. In the column slot, snap the `event tile [column]` block, and in the row slot, the `event tile [row]` block. These blocks know where the gold you touched is.\n4. Underneath, add `change score by [1]` from the **Game** category and `play melody [point]` from the **Sound** category.\n5. Press ↺. Touch the gold: the gold disappears and the score goes up by 1.\n\n### Build the blocks: spikes\n6. Take a new `when a [Player] sprite touches tile [Spikes]` event. Choose **Spikes** as the picture.\n7. Inside it, in this order: `change lives by [-1]`; `shake screen for [250] ms`; `put sprite [this sprite] on tile column [2] row [5]` from the **Stage / Map** category (`this sprite` will be the hero); `set [this sprite] speed x [0] y [0]` from the **Motion** category.\n8. Press ↺. When you touch the spikes, you lose a life, the screen shakes and the hero goes back to the starting tile.\n\nExpected result: gold disappears when collected and the score goes up; when you touch the spikes, you lose a life and the hero goes back to the start. All five goals ✓.\n\n### How does it work?\n- The `touches tile` event is edge-triggered: it runs once, at the moment the hero enters the tile. It does not keep running for as long as you stand on the same tile.\n- `event tile column / row` only makes sense inside this event.\n- Clearing (deleting) the gold is important: otherwise the gold stays on the map and, as far as you can see, it has not been collected.\n- When we put the hero back at the start, we also set its speed to zero: otherwise, even after going back, it could hit the ground at its falling speed and bounce.\n\n### Try it\n1. Reach the gold on top of the platform by jumping. If you cannot get high enough, set the jump speed to -300.\n2. Instead of taking a life when you touch the spikes, lose the game at once: try the `end game: [you lose]` block.\n3. Give 5 points for each piece of gold. Set the score target to 10 and add a win when you collect 2 pieces of gold.\n\n### Common mistakes\n- Not clearing the tile when you touch the gold: the gold does not disappear.\n- Typing 0 instead of the `event tile` blocks: the tile in the top-left corner is always the one cleared.\n- Typing pixel coordinates instead of column/row when putting the hero back at the start: that block wants tile numbers, not pixels.\n- Choosing the wrong kind in the spikes event: if you choose **Enemy** instead of **Player**, the event does not run when the hero touches the spikes.",
            "question": "Why did we not make the spike and gold tiles walls? If they were walls, what would happen before the hero touched them? Which tiles need to be walls, and which need to be passable?",
            "explainerMd": "### What you will learn in this lesson\n- That tiles such as gold and spikes are not walls, but can trigger events\n- That the `touches tile` event is edge-triggered\n- How to find where the touched tile is with `event tile column / row`\n- How to turn a column and row number into a pixel position\n\n### What you should know first\nIn lessons 11-13 you learnt about the map and the `touches tile` event. In lesson 9 you used the `change lives` and `shake screen` blocks. The gravity and jumping from lessons 21-22 give this scene its movement.\n\n### Every tile is something\nThe map is made of tiles, and each tile is 16 x 16 pixels. There are two kinds of tile:\n- **Wall tile:** a sprite cannot pass through it (ground, platform).\n- **Passable tile:** a sprite passes through it (gold, spikes, door). But the engine triggers an event saying \"this sprite touched that tile\".\n\nIf you made the gold and spikes walls, the hero could never get into them; it would just stand on top of them. To collect or get hurt, it must be able to go inside them.\n\n### Edge triggering\nThe `when a Player sprite touches tile [Gold]` block runs **once**, at the moment the hero enters the tile. It does not run again for as long as you stay on the same tile. If you leave the tile and enter it again, it runs again.\n\nThat is why you must **clear** the tile when you collect the gold. If you do not clear it, the gold stays visible and gives points every time the hero leaves and comes back in.\n\n### Which tile?\nThere can be lots of gold on the map. The same event runs for all of it, so you need to know which one to clear. The answer is the event blocks:\n\n```\nclear tile at column (event tile column) row (event tile row)\n```\n\nIf you type a fixed number, the same tile is always cleared.\n\n### From tile number to pixels\nColumns and rows start from 0. When you put a sprite on a tile, the sprite's **centre** goes to the middle of the tile:\n\n```\ncentre x = column x 16 + 8\ncentre y = row x 16 + 8\nColumn 2, row 5  ->  x = 40, y = 88\n```\n\n### Reset after the spikes\nIn the spikes event, when you put the hero on the starting tile, set its speed to zero too. If you were going up when you jumped into the spikes and you do not reset the speed, the hero shoots up into the air from the starting tile.\n\n### Summary\nTiles such as gold, spikes and doors are not walls; the hero passes through them and the engine triggers a touch event. The event runs once when the tile is entered. The `event tile` blocks tell you which tile triggered it. You find the centre pixel of a tile by multiplying the tile number by 16 and adding 8.",
            "concepts": [
              {
                "term": "Passable tile",
                "definition": "A tile that is not a wall, which a sprite can pass through (gold, spikes, door).",
                "example": "The hero passes through the gold; the engine still triggers a touch event.",
                "pitfall": "Making the gold or spikes a wall: the hero cannot get inside it or collect it."
              },
              {
                "term": "touches tile",
                "definition": "An event that runs at the moment a sprite enters a particular tile.",
                "example": "In the Player + Gold tile event, the score is raised.",
                "pitfall": "Choosing the wrong kind: if you choose Enemy instead of Player, the event does not run when the hero touches it."
              },
              {
                "term": "Edge triggering",
                "definition": "The event runs once when the tile is entered; standing on the tile does not trigger it again.",
                "example": "If you stand on the spikes for three seconds, the event runs once; if you leave and come back, it runs again.",
                "pitfall": "Thinking the event will run every frame."
              },
              {
                "term": "event tile column / row",
                "definition": "Blocks that give the position of the tile that triggered the event.",
                "example": "You delete the gold with `clear tile at column (event tile column) row (event tile row)`.",
                "pitfall": "Typing a fixed number: the same tile is always cleared."
              },
              {
                "term": "Clearing a tile",
                "definition": "Deleting a tile from the map; this is how the gold gets collected.",
                "example": "When `clear tile` runs in the gold event, the gold disappears.",
                "pitfall": "Forgetting to clear it: the gold stays and gives points every time you leave and come back."
              },
              {
                "term": "Tile centre",
                "definition": "The centre of a sprite put on a tile: x = column x 16 + 8, y = row x 16 + 8.",
                "example": "The centre of the tile at column 2, row 5 is (40, 88).",
                "pitfall": "Typing pixels instead of a tile number, or the other way round."
              }
            ],
            "quiz": [
              {
                "id": "m11h5d23-q1",
                "kind": "mcq",
                "prompt": "Why is the gold tile not made a wall?",
                "options": [
                  "If the gold were a wall it could not be drawn",
                  "If it were a wall, the hero could not get inside it and the event would not be triggered",
                  "Wall tiles do not give points",
                  "Gold can only stand on top of a platform"
                ],
                "answer": 1,
                "explanation": "If it were a wall, the hero could not get inside the gold; it would just stop in front of it. When it enters a passable tile, the engine triggers the touch event, and the collecting or the hurting happens. Being a wall gives stopping, not a collision.",
                "skills": [
                  "oyun-karo-olay"
                ]
              },
              {
                "id": "m11h5d23-q2",
                "kind": "predict-output",
                "prompt": "The gold event is as below. The gold tile is still on the map. The hero goes into the tile and out again, then goes in and out once more. What is the score?\n\n```\nwhen a [Player] sprite touches tile [Gold]:\n  change score by 1\n```",
                "options": [
                  "1",
                  "2",
                  "0",
                  "A very high number, because it goes up every frame"
                ],
                "answer": 1,
                "explanation": "The event runs once each time the tile is entered. Because the tile is not cleared, two entries give two points (1 + 1 = 2). It is not triggered again while standing on the tile, but the second entry is a new trigger. That is why you need to clear the tile in the gold event.",
                "skills": [
                  "oyun-olay-kenar",
                  "oyun-karo-olay"
                ]
              },
              {
                "id": "m11h5d23-q3",
                "kind": "find-bug",
                "prompt": "The hero touches the gold and the score goes up, but the gold stays on the screen. Which line is wrong?\n\n```\n1  when a [Player] sprite touches tile [Gold]:\n2    clear tile at column 0 row 0\n3    change score by 1\n```",
                "options": [
                  "Line 1: the event kind",
                  "Line 2: the fixed column and row",
                  "Line 3: the score change",
                  "There is no bug; the gold disappears anyway"
                ],
                "answer": 1,
                "explanation": "On line 2 the column and row are typed as a fixed 0; every time, the tile in the top-left corner is cleared and the gold you touched stays where it is. The `event tile column` and `event tile row` blocks should be there. The score line is correct.",
                "skills": [
                  "oyun-hata-ayiklama",
                  "oyun-karo-olay"
                ]
              },
              {
                "id": "m11h5d23-q4",
                "kind": "numeric",
                "prompt": "You put the hero on the tile at `column 6 row 4`. A tile is 16 pixels; the sprite sits in the middle of the tile. What is the hero's centre x position, in pixels?",
                "answer": 104,
                "tolerance": 0,
                "unit": "pixels",
                "explanation": "Centre x = column x 16 + 8 = 6 x 16 + 8 = 104. Column numbers start from 0; the tile's left edge is at 96 and its middle point at 104.",
                "skills": [
                  "oyun-harita-olcu"
                ]
              },
              {
                "id": "m11h5d23-q5",
                "kind": "mcq",
                "prompt": "The hero touches the spikes while jumping upwards and is put on the starting tile, but its speed is not reset. What happens?",
                "options": [
                  "Nothing happens",
                  "The hero keeps its upward speed and shoots up into the air from the starting tile",
                  "The hero sinks into the ground",
                  "Two lives are lost"
                ],
                "answer": 1,
                "explanation": "Even though the position changes, the speed stays the same; the hero carries on with its upward speed and shoots up into the air from the starting tile. Any downward speed left over is reset anyway when it hits the ground, so the real problem is the upward speed. That is why we also set the speed to 0, 0 when we put it back at the start.",
                "skills": [
                  "oyun-karo-olay",
                  "oyun-hiz-ivme"
                ]
              }
            ]
          }
        },
        {
          "title": "Düşmanın üstüne zıpla",
          "durationMin": 25,
          "problem": "Platform oyunlarında bir düşmana iki türlü değebilirsin: üstünden zıplayarak (o zaman düşman yenilir) ya da yanından yürüyerek (o zaman sen yaralanırsın). Oyun bu ikisini nasıl ayırt ediyor? Cevap: yöne bakıyor. Düşüyor muyum? Düşmanın üstünde miyim?",
          "contentMd": "Zemin, kahraman ve haritanın sağ ucunda gidip gelen bir balçık düşman hazır. Harita ekrandan geniş; kamera kahramanı izliyor, balçığa doğru yürümen gerekiyor. Düşman kenara ya da duvara gelince yön değiştiriyor. Skor 0, can 3. Kahraman balçığa dokununca henüz hiçbir şey olmuyor.\n\n### İki ölçüt\nÜstten çarpıp çarpmadığını iki şeye bakarak anlarız:\n1. Kahraman aşağı doğru hareket ediyor mu? (y hızı pozitif, örneğin 10'dan büyük)\n2. Kahramanın y konumu, düşmanın y konumundan biraz küçük mü? (Kahraman düşmanın biraz **üstünde**.) y yukarıda küçük, aşağıda büyüktür.\n\nİkisi birden doğruysa ezme, değilse yan çarpma.\n\n### Blokları kur\n1. **Sprite** kategorisinden `bir [Oyuncu] sprite'ı bir [Düşman] sprite'ına çarpınca` olayını al.\n2. İçine **Mantık** kategorisinden iki kollu `eğer ... ise ... değilse ...` bloğunu koy.\n3. Koşul için **Mantık** kategorisinden bir `[ ] ve [ ]` bloğu al. Sol tarafına `[ ] > [ ]` karşılaştırma bloğu: soluna `[bu sprite] [y hızı]`, sağına 10. Sağ tarafına `[ ] < [ ]` karşılaştırma bloğu: soluna `[bu sprite] [y konumu]`, sağına bir çıkarma bloğu (`[ ] - [ ]`): soluna `[diğer sprite] [y konumu]`, sağına 4.\n4. `ise` kolu (ezme): `[diğer sprite] patlayıp yok olsun`; `skoru [5] değiştir`; `[bu sprite] hızı x [bu sprite x hızı] y [-150]` (kahraman biraz yukarı seksin); `[patlama] melodisini çal`.\n5. `değilse` kolu (yan çarpma): `canı [-1] değiştir`; `ekranı [250] ms salla`; `[bu sprite] sprite'ını sütun [2] satır [5] karosuna koy`; `[bu sprite] hızı x [0] y [0]`.\n6. ↺ bas. Düşmanın üstüne zıpla: balçık patlıyor, skor 5 artıyor ve kahraman seksiyor. Yandan yürüyüp çarp: can azalıyor.\n\nBeklenen sonuç: Üstten zıplayınca balçık yenilir ve can azalmaz; yandan çarpınca kahraman başa dönüp can kaybeder. Dört hedef ✓.\n\n### Nasıl çalışıyor?\n- Çarpışma olayında `bu sprite` birinci türdeki (kahraman), `diğer sprite` ikincideki (balçık) sprite'tır.\n- Kahraman düşerken y hızı pozitiftir. Yerde yürürken y hızı 0'dır, bu yüzden \"hız > 10\" koşulu yan çarpmayı eler.\n- Kahramanın y'si düşmanınkinden küçükse, kahraman düşmanın yukarısındadır.\n- Düşmanın hareketi hazır geliyor: yerçekimi, yan hız ve duvara gelince ters çevirme. Bunlar `bir [Düşman] sprite'ı oluşunca` ve `her karede` olaylarındadır; bu olaylar her düşman için işler.\n- Etkinlik, kontrol için sahneye ayrı bir balçık koyar ve kahramanı üstüne düşürür; sonra yan çarpmayı da dener.\n\n### Dene\n1. Ezme puanını 10 yap. Seken kahramanın hızını -250'ye çıkar: böylece düşman ezince yüksek bir zıplama alır.\n2. Haritada ekstra bir düşman daha oluştur (`yeni [Balçık] sprite'ı, türü [Düşman]`) ve ezilebildiğini doğrula.\n3. Ezme koşuluna \"y hızı > 10\" yerine \"y hızı > 100\" koy. Ne değişiyor? Hangisi oyunu daha adil kılar?\n\n### Sık yapılan hatalar\n- Yalnız \"y hızı > 10\" koşulu kullanmak: kahraman düşmanın yanından düşerken değse de düşman ölür. İkinci ölçüt (konum) bunu önler.\n- Çıkarmada sprite sırasını ters yazmak: `kahraman y < balçık y - 4` yerine `balçık y < kahraman y - 4` yazarsan düşman üstte olduğunda ezme sayılır.\n- Can azaltmayı `ise` koluna koymak: ezerken de can kaybedersin.\n- `diğer sprite`'ı silmeyi unutmak: ezilen balçık ekranda kalır ve ezmeye devam edersin.",
          "question": "\"Hız > 10 ve üstündeyim\" kuralı oyuncuya adil geliyor mu? Bazen yandan değip yine de ezmiş sayılırsan ya da ezmişken can kaybedersen oyun sana nasıl hissettirir? Çarpışma kuralını nasıl daha cömert ya da daha sert yapabilirsin?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Aynı çarpışmanın iki farklı sonuç verebileceğini ve bunu koşulla ayırmayı\n- `bu sprite` ile `diğer sprite` farkını çarpışma olayında kullanmayı\n- İki koşulu `ve` ile birleştirmeyi\n- Ezme ölçütünü (düşüş hızı + konum) kurmayı\n\n### Önceden bilmen gerekenler\nDers 6'da çarpışma olayını ve `diğer sprite`'ı gördün. Ders 21-22'de y hızının aşağı doğru pozitif olduğunu öğrendin. Ders 16'daki devriye mantığı (duvara gelince dönen düşman) bu sahnenin düşmanını hareket ettirir. `eğer ... değilse` bloğunu ders 9'dan hatırla.\n\n### Çarpışma tek, sonuç iki\nPlatform oyununda düşmana değmenin iki yolu vardır: üstten düşerek (düşman yenilir) ya da yandan yürüyerek (kahraman yaralanır). Motorun çarpışma olayı bunu ayırmaz; \"ikisi üst üste geldi\" der. Ayrımı sen koşulla yaparsın.\n\n### İki ölçüt\nÜstten çarpmayı iki şeye bakarak tanırız:\n\n```\nÖlçüt 1: kahraman düşüyor mu?   y hızı > 10\nÖlçüt 2: kahraman yukarıda mı?   kahraman y < düşman y - 4\n```\n\nYerde yürüyen kahramanın y hızı 0'dır; yani ölçüt 1 yan çarpmayı eler. Ölçüt 2 ise düşmanın yanından düşerken değen kahramanı eler. y aşağı doğru büyüdüğü için yukarıdaki sprite'ın y değeri **küçüktür**.\n\n### İkisi birlikte: ve\nİki ölçüt de doğruysa ezme olur. Mantık bloğundaki `ve`, yalnız iki taraf da doğruysa doğru olur:\n\n```\neğer (y hızı > 10) ve (kahraman y < düşman y - 4) ise:\n  ezme\ndeğilse:\n  yan çarpma\n```\n\nÖrnek: kahraman 120 hızla düşüyor, y = 70; düşman y = 88. Ölçüt 1: 120 > 10 doğru. Ölçüt 2: 70 < 84 doğru. Sonuç: ezme.\n\nBaşka örnek: hız 120 ama kahraman y = 86. Ölçüt 2: 86 < 84 yanlış. Sonuç: yan çarpma.\n\n### Kim kim?\n`bir [Oyuncu] sprite'ı bir [Düşman] sprite'ına çarpınca` olayında `bu sprite` birinci türdeki (kahraman), `diğer sprite` ikinci türdeki (düşman) sprite'tır. Düşmanı patlatmak için `diğer sprite patlayıp yok olsun` yazarsın. `bu sprite`'ı patlatırsan kahraman yok olur.\n\n### Ödül ve ceza ayrı kollarda\nSkor ve seken hareket `ise` koluna, can kaybı ve başa dönüş `değilse` koluna gider. Can azaltmayı koşulun dışına koyarsan ezerken de can kaybedersin.\n\n### Özet\nÇarpışma olayı iki sprite'ın değdiğini söyler, nasıl değdiğini sen koşulla anlarsın. Üstten çarpma için kahraman düşüyor olmalı (y hızı > 10) ve düşmanın biraz yukarısında olmalı. İki ölçütü `ve` ile birleştirir, ezme ve yan çarpmayı `eğer ... değilse` ile ayırırsın. `bu sprite` kahramanı, `diğer sprite` düşmanı gösterir.",
          "concepts": [
            {
              "term": "bu sprite / diğer sprite",
              "definition": "Çarpışma olayında birinci türdeki (kahraman) ve ikinci türdeki (düşman) sprite.",
              "example": "`diğer sprite patlayıp yok olsun` düşmanı yok eder.",
              "pitfall": "bu ile diğeri karıştırmak: `bu sprite`'ı patlatırsan kahraman yok olur."
            },
            {
              "term": "Düşüş ölçütü",
              "definition": "Kahraman aşağı doğru hareket ediyor mu: y hızı > 10.",
              "example": "Yerde yürürken y hızı 0'dır; bu koşul yan çarpmayı eler.",
              "pitfall": "Düşüşe bakmamak: yanından geçerken de düşman ölür."
            },
            {
              "term": "Konum ölçütü",
              "definition": "Kahraman düşmanın biraz yukarısında mı: kahraman y < düşman y - 4.",
              "example": "Kahraman y = 70, düşman y = 88: 70 < 84 olduğu için kahraman yukarıdadır.",
              "pitfall": "Karşılaştırmayı ters yazmak: düşman üstte olsa bile ezme sayılır."
            },
            {
              "term": "ve (mantık)",
              "definition": "İki koşulun da doğru olması gereken birleşim.",
              "example": "`(hız > 10) ve (y konumu < düşman y - 4)` ezmeyi tanır.",
              "pitfall": "`ve` yerine `veya` kullanmak: ölçütlerden biri yetmeye başlar, ezme fazla kolaylaşır."
            },
            {
              "term": "eğer ... değilse",
              "definition": "İki kollu seçim: koşul doğruysa `ise`, yanlışsa `değilse` kolu çalışır.",
              "example": "Ezme `ise` kolunda, yan çarpma `değilse` kolundadır.",
              "pitfall": "Can azaltmayı kolların dışına koymak: ezerken de can kaybedersin."
            },
            {
              "term": "Seken kahraman",
              "definition": "Ezince kahramana verilen küçük yukarı hız (-150).",
              "example": "Düşmanı ezince kahraman biraz yukarı seker, oyun akıcı hisseder.",
              "pitfall": "Sekmeyi unutmak: ezdikten sonra kahraman düşman yerine oturur gibi durur."
            }
          ],
          "quiz": [
            {
              "id": "m11h5d24-q1",
              "kind": "mcq",
              "prompt": "Kahraman yerde yürürken balçığa yandan çarpıyor. \"y hızı > 10\" koşulu neden yanlış (yani ezme sayılmaz) çıkar?",
              "options": [
                "Çünkü kahramanın y hızı yerde 0'dır",
                "Çünkü balçığın hızı büyüktür",
                "Çünkü yan çarpışma hiç olay tetiklemez",
                "Çünkü y hızı yalnız sağa giderken pozitiftir"
              ],
              "answer": 0,
              "explanation": "Yerde yürüyen kahramanın dikey hızı 0'dır; zemin onu durdurur. 0 > 10 olmadığı için `ise` kolu çalışmaz ve `değilse` kolu çalışır. Hızın pozitif olması düşmeyi anlatır; yerde düşme yoktur.",
              "skills": [
                "oyun-carpisma-yon",
                "oyun-mantik-kosul"
              ]
            },
            {
              "id": "m11h5d24-q2",
              "kind": "predict-output",
              "prompt": "Kahraman 200 piksel/sn hızla düşüyor, y konumu 86. Balçığın y konumu 88. Çarpışma olayı çalışınca ne olur?\n\n```\neğer (bu y hızı > 10) ve (bu y konumu < diğer y konumu - 4) ise:\n  diğer sprite patlayıp yok olsun, skoru 5 değiştir\ndeğilse:\n  canı -1 değiştir, kahramanı başa koy\n```",
              "options": [
                "Balçık patlar, skor 5 artar",
                "Kahraman can kaybeder ve başa döner",
                "Hiçbir şey olmaz",
                "Hem balçık patlar hem can azalır"
              ],
              "answer": 1,
              "explanation": "Birinci ölçüt doğru (200 > 10). İkinci ölçüt: 88 - 4 = 84 ve 86 < 84 yanlış. `ve` iki taraf da doğru olmalı; biri yanlış olduğundan `değilse` kolu çalışır: kahraman can kaybeder ve başa döner. Kahraman düşmanın yeterince üstünde değildir.",
              "skills": [
                "oyun-carpisma-yon",
                "oyun-mantik-kosul",
                "oyun-y-ekseni"
              ]
            },
            {
              "id": "m11h5d24-q3",
              "kind": "find-bug",
              "prompt": "Düşmanın üstüne zıpladığında balçık değil kahramanın kendisi yok oluyor. Hatalı satır hangisi?\n\n```\n1  bir [Oyuncu] sprite'ı bir [Düşman] sprite'ına çarpınca:\n2    eğer (bu y hızı > 10) ve (bu y konumu < diğer y konumu - 4) ise:\n3      bu sprite patlayıp yok olsun\n4      skoru 5 değiştir\n5    değilse:\n6      canı -1 değiştir\n```",
              "options": [
                "Satır 2: koşul",
                "Satır 4: skor 5 değiştir",
                "Satır 6: can azaltma",
                "Satır 3: bu sprite patlıyor"
              ],
              "answer": 3,
              "explanation": "3. satırda `bu sprite` kahramandır; patlatılan o olur. Düşman için `diğer sprite` kullanılmalı. 2. satırdaki koşul doğru: düşüş hızı bu sprite'ın, konum karşılaştırması da doğru yönde.",
              "skills": [
                "oyun-hata-ayiklama",
                "oyun-carpisma-yon"
              ]
            },
            {
              "id": "m11h5d24-q4",
              "kind": "numeric",
              "prompt": "Balçığın y konumu 88. Ezme sayılması için kahramanın y konumu `balçık y - 4`ten KÜÇÜK olmalı. Kahraman y en çok hangi tam sayı değerinde olabilir?",
              "answer": 83,
              "tolerance": 0,
              "unit": "piksel",
              "explanation": "Koşul y < 88 - 4 = 84. Tam sayılar arasında 84 koşulu sağlamaz (84 < 84 yanlış); sağlayan en büyük tam sayı 83'tür. Küçük y yukarıyı gösterir; bu yüzden küçük olan kahraman daha yukarıdadır.",
              "skills": [
                "oyun-y-ekseni",
                "oyun-mantik-kosul"
              ]
            },
            {
              "id": "m11h5d24-q5",
              "kind": "mcq",
              "prompt": "Ezme kuralına neden hem \"düşüş hızı\" hem de \"konum\" ölçütü konur?",
              "options": [
                "Biri yetmez, ikisi birlikte \"üstten düşerek çarpmayı\" tarif eder",
                "Motor tek koşulu kabul etmez",
                "Konum ölçütü hızı hesaplar",
                "Hız ölçütü düşmanı yok eder"
              ],
              "answer": 0,
              "explanation": "Yalnız hız ölçütü kullanılırsa kahraman düşmanın yanından düşerken dokunsa da düşman ölür. Yalnız konum ölçütü kullanılırsa düşmanın üstünde duran ama düşmeyen kahraman da ezmiş sayılır. İkisi birlikte \"üstten düşerek\" durumunu tarif eder.",
              "skills": [
                "oyun-carpisma-yon",
                "oyun-mantik-kosul"
              ]
            }
          ],
          "contentEn": {
            "title": "Jump on the enemy",
            "problem": "In platform games you can touch an enemy in two ways: by jumping on top of it (then the enemy is beaten) or by walking into its side (then you get hurt). How does the game tell these two apart? The answer: it looks at the direction. Am I falling? Am I above the enemy?",
            "contentMd": "The ground, the hero and a slime enemy going back and forth at the right end of the map are ready. The map is wider than the screen; the camera follows the hero, and you need to walk towards the slime. The enemy changes direction when it reaches an edge or a wall. The score is 0 and lives are 3. When the hero touches the slime, nothing happens yet.\n\n### Two tests\nWe can tell whether it hit from above by looking at two things:\n1. Is the hero moving downwards? (The y speed is positive, for example greater than 10.)\n2. Is the hero's y position a little smaller than the enemy's y position? (The hero is a little **above** the enemy.) y is small at the top and big at the bottom.\n\nIf both are true, it is a stomp; if not, it is a side hit.\n\n### Build the blocks\n1. From the **Sprite** category, take the `when a [Player] sprite hits a [Enemy] sprite` event.\n2. Inside it, put the two-branch `if ... do ... else ...` block from the **Logic** category.\n3. For the condition, take an `[ ] and [ ]` block from the **Logic** category. On its left side, a `[ ] > [ ]` comparison block: on its left `[this sprite] [y speed]`, on its right 10. On its right side, a `[ ] < [ ]` comparison block: on its left `[this sprite] [y position]`, on its right a subtraction block (`[ ] - [ ]`): on its left `[other sprite] [y position]`, on its right 4.\n4. The `do` branch (stomp): `make [other sprite] explode`; `change score by [5]`; `set [this sprite] speed x [this sprite x speed] y [-150]` (so the hero bounces up a little); `play melody [boom]`.\n5. The `else` branch (side hit): `change lives by [-1]`; `shake screen for [250] ms`; `put sprite [this sprite] on tile column [2] row [5]`; `set [this sprite] speed x [0] y [0]`.\n6. Press ↺. Jump on top of the enemy: the slime explodes, the score goes up by 5 and the hero bounces. Walk into it from the side: you lose a life.\n\nExpected result: when you jump on it from above, the slime is beaten and you do not lose a life; when you hit it from the side, the hero goes back to the start and loses a life. Four goals ✓.\n\n### How does it work?\n- In the collision event, `this sprite` is the sprite of the first kind (the hero) and `other sprite` the sprite of the second kind (the slime).\n- While the hero is falling, its y speed is positive. While walking on the ground its y speed is 0, so the \"speed > 10\" condition rules out a side hit.\n- If the hero's y is smaller than the enemy's, the hero is above the enemy.\n- The enemy's movement comes ready-made: gravity, a sideways speed and reversing when it reaches a wall. These are in the `when a [Enemy] sprite is created` and `every frame` events; these events work for every enemy.\n- To check your work, the activity puts a separate slime on the stage and drops the hero on top of it; then it tries a side hit too.\n\n### Try it\n1. Make the stomp worth 10 points. Raise the bouncing hero's speed to -250: this way the hero gets a high jump when it stomps an enemy.\n2. Create one more enemy on the map (`new [Slime] sprite, kind [Enemy]`) and check that it can be stomped.\n3. In the stomp condition, use \"y speed > 100\" instead of \"y speed > 10\". What changes? Which one makes the game fairer?\n\n### Common mistakes\n- Using only the \"y speed > 10\" condition: even if the hero touches the enemy while falling past its side, the enemy dies. The second test (position) prevents this.\n- Writing the sprites the wrong way round in the subtraction: if you write `balcik y < kahraman y - 4` instead of `kahraman y < balcik y - 4`, it counts as a stomp when the enemy is on top.\n- Putting the lives loss in the `do` branch: you lose a life when you stomp too.\n- Forgetting to delete `other sprite`: the stomped slime stays on the screen and you keep stomping it.",
            "question": "Does the rule \"speed > 10 and I am above\" feel fair to the player? If you sometimes touch from the side and still count as stomping, or lose a life when you did stomp, how does the game make you feel? How could you make the collision rule more generous or stricter?",
            "explainerMd": "### What you will learn in this lesson\n- That the same collision can have two different results, and how to separate them with a condition\n- How to use the difference between `this sprite` and `other sprite` in a collision event\n- How to combine two conditions with `and`\n- How to build the stomp test (falling speed + position)\n\n### What you should know first\nIn lesson 6 you saw the collision event and `other sprite`. In lessons 21-22 you learnt that the y speed is positive downwards. The patrol logic from lesson 16 (an enemy that turns round at a wall) moves the enemy in this scene. Remember the `if ... else` block from lesson 9.\n\n### One collision, two results\nIn a platform game there are two ways to touch an enemy: by falling on it from above (the enemy is beaten) or by walking into its side (the hero gets hurt). The engine's collision event does not tell them apart; it just says \"the two overlapped\". You tell them apart with a condition.\n\n### Two tests\nWe recognise a hit from above by looking at two things:\n\n```\nTest 1: is the hero falling?     y speed > 10\nTest 2: is the hero above?       kahraman y < enemy y - 4\n```\n\nA hero walking on the ground has a y speed of 0, so test 1 rules out a side hit. Test 2 rules out a hero that touches the enemy while falling past its side. Because y grows downwards, the y value of the sprite on top is **smaller**.\n\n### Both together: and\nIf both tests are true, it is a stomp. The `and` in the logic block is only true if both sides are true:\n\n```\nif (y speed > 10) and (kahraman y < enemy y - 4) do:\n  stomp\nelse:\n  side hit\n```\n\nExample: the hero is falling at speed 120, y = 70; the enemy's y = 88. Test 1: 120 > 10 is true. Test 2: 70 < 84 is true. Result: a stomp.\n\nAnother example: the speed is 120 but the hero's y = 86. Test 2: 86 < 84 is false. Result: a side hit.\n\n### Who is who?\nIn the `when a [Player] sprite hits a [Enemy] sprite` event, `this sprite` is the sprite of the first kind (the hero) and `other sprite` the sprite of the second kind (the enemy). To blow up the enemy you write `make other sprite explode`. If you blow up `this sprite`, the hero disappears.\n\n### Reward and penalty in separate branches\nThe score and the bounce go in the `do` branch; the lives loss and going back to the start go in the `else` branch. If you put the lives loss outside the condition, you lose a life when you stomp too.\n\n### Summary\nThe collision event tells you that two sprites touched; you work out how they touched with a condition. For a hit from above, the hero must be falling (y speed > 10) and a little above the enemy. You combine the two tests with `and`, and separate the stomp from the side hit with `if ... else`. `this sprite` points to the hero and `other sprite` to the enemy.",
            "concepts": [
              {
                "term": "this sprite / other sprite",
                "definition": "In a collision event, the sprite of the first kind (the hero) and the sprite of the second kind (the enemy).",
                "example": "`make other sprite explode` gets rid of the enemy.",
                "pitfall": "Mixing up this and other: if you blow up `this sprite`, the hero disappears."
              },
              {
                "term": "Falling test",
                "definition": "Is the hero moving downwards: y speed > 10.",
                "example": "While walking on the ground the y speed is 0; this condition rules out a side hit.",
                "pitfall": "Not checking for falling: the enemy dies even when you just walk past it."
              },
              {
                "term": "Position test",
                "definition": "Is the hero a little above the enemy: kahraman y < enemy y - 4.",
                "example": "Hero y = 70, enemy y = 88: because 70 < 84, the hero is above.",
                "pitfall": "Writing the comparison the wrong way round: it counts as a stomp even when the enemy is on top."
              },
              {
                "term": "and (logic)",
                "definition": "A combination where both conditions must be true.",
                "example": "`(speed > 10) and (y position < enemy y - 4)` recognises a stomp.",
                "pitfall": "Using `or` instead of `and`: one of the tests becomes enough, and stomping gets too easy."
              },
              {
                "term": "if ... else",
                "definition": "A two-branch choice: if the condition is true the `do` branch runs; if it is false the `else` branch runs.",
                "example": "The stomp is in the `do` branch and the side hit in the `else` branch.",
                "pitfall": "Putting the lives loss outside the branches: you lose a life when you stomp too."
              },
              {
                "term": "Bouncing hero",
                "definition": "A small upward speed (-150) given to the hero after a stomp.",
                "example": "When it stomps an enemy, the hero bounces up a little and the game feels smooth.",
                "pitfall": "Forgetting the bounce: after the stomp, the hero seems to sit down where the enemy was."
              }
            ],
            "quiz": [
              {
                "id": "m11h5d24-q1",
                "kind": "mcq",
                "prompt": "While walking on the ground, the hero hits the slime from the side. Why does the \"y speed > 10\" condition come out false (so it does not count as a stomp)?",
                "options": [
                  "Because the hero's y speed is 0 on the ground",
                  "Because the slime's speed is big",
                  "Because a side collision never triggers an event",
                  "Because the y speed is only positive when going right"
                ],
                "answer": 0,
                "explanation": "The up-down speed of a hero walking on the ground is 0; the ground stops it. Because 0 is not > 10, the `do` branch does not run and the `else` branch runs. A positive speed means falling; there is no falling on the ground.",
                "skills": [
                  "oyun-carpisma-yon",
                  "oyun-mantik-kosul"
                ]
              },
              {
                "id": "m11h5d24-q2",
                "kind": "predict-output",
                "prompt": "The hero is falling at 200 pixels/s and its y position is 86. The slime's y position is 88. What happens when the collision event runs?\n\n```\nif (this y speed > 10) and (this y position < other y position - 4) do:\n  make other sprite explode, change score by 5\nelse:\n  change lives by -1, put the hero back at the start\n```",
                "options": [
                  "The slime explodes and the score goes up by 5",
                  "The hero loses a life and goes back to the start",
                  "Nothing happens",
                  "The slime explodes and a life is lost too"
                ],
                "answer": 1,
                "explanation": "The first test is true (200 > 10). The second test: 88 - 4 = 84, and 86 < 84 is false. With `and`, both sides must be true; because one is false, the `else` branch runs: the hero loses a life and goes back to the start. The hero is not far enough above the enemy.",
                "skills": [
                  "oyun-carpisma-yon",
                  "oyun-mantik-kosul",
                  "oyun-y-ekseni"
                ]
              },
              {
                "id": "m11h5d24-q3",
                "kind": "find-bug",
                "prompt": "When you jump on top of the enemy, the hero itself disappears instead of the slime. Which line is wrong?\n\n```\n1  when a [Player] sprite hits a [Enemy] sprite:\n2    if (this y speed > 10) and (this y position < other y position - 4) do:\n3      make this sprite explode\n4      change score by 5\n5    else:\n6      change lives by -1\n```",
                "options": [
                  "Line 2: the condition",
                  "Line 4: change score by 5",
                  "Line 6: losing a life",
                  "Line 3: this sprite explodes"
                ],
                "answer": 3,
                "explanation": "On line 3, `this sprite` is the hero; that is the one that gets blown up. `other sprite` should be used for the enemy. The condition on line 2 is correct: the falling speed is this sprite's, and the position comparison is the right way round.",
                "skills": [
                  "oyun-hata-ayiklama",
                  "oyun-carpisma-yon"
                ]
              },
              {
                "id": "m11h5d24-q4",
                "kind": "numeric",
                "prompt": "The slime's y position is 88. To count as a stomp, the hero's y position must be SMALLER than `slime y - 4`. What is the largest whole number the hero's y can be?",
                "answer": 83,
                "tolerance": 0,
                "unit": "pixels",
                "explanation": "The condition is y < 88 - 4 = 84. Among whole numbers, 84 does not meet the condition (84 < 84 is false); the largest whole number that does is 83. A small y means higher up, so the hero with the smaller value is higher.",
                "skills": [
                  "oyun-y-ekseni",
                  "oyun-mantik-kosul"
                ]
              },
              {
                "id": "m11h5d24-q5",
                "kind": "mcq",
                "prompt": "Why are both a \"falling speed\" test and a \"position\" test put in the stomp rule?",
                "options": [
                  "One is not enough; together they describe \"hitting by falling from above\"",
                  "The engine does not accept a single condition",
                  "The position test works out the speed",
                  "The speed test gets rid of the enemy"
                ],
                "answer": 0,
                "explanation": "If only the speed test is used, the enemy dies even when the hero touches it while falling past its side. If only the position test is used, a hero standing on top of the enemy without falling also counts as stomping. Together they describe the \"falling from above\" case.",
                "skills": [
                  "oyun-carpisma-yon",
                  "oyun-mantik-kosul"
                ]
              }
            ]
          }
        },
        {
          "title": "Proje: Platform atlayıcı",
          "durationMin": 35,
          "problem": "Bu haftanın bütün parçalarını bir araya getirip ilk gerçek platform oyununu yapıyorsun: yürüyen, zıplayan bir kahraman; yerde dikenler, havada altınlar, bir balçık düşman ve sonunda bir kapı. Oyunun yarısı hazır, kalan yarısı kuralları yazmak.",
          "contentMd": "### Ne yapacağız?\nHazır gelenler: 24 karo genişliğinde bir harita, yerçekimi, yürüme, A ile zıplama, kamera, devriye gezen bir balçık ve balçığı ezme kuralı. Senin yazacakların:\n\n| Kural | Hangi dersten | Ne olacak? |\n|---|---|---|\n| Altın | 23 | Dokununca altın kaybolur, skor 1 artar |\n| Diken | 23 | Dokununca can 1 azalır, kahraman başa döner |\n| Kapı | 13 ve 23 | Dokununca \"Seviye bitti!\" yazılır ve oyun kazanılır |\n\n### Blokları kur\n1. ▶ bas ve haritada gez. Kamera kahramanı izliyor; sağa yürü, platformlara zıpla. Altınlardan, dikenlerden ve kapıdan geçiyorsun ama hiçbir şey olmuyor.\n2. **Altın:** `bir [Oyuncu] sprite'ı [Altın] karosuna dokununca` olayı kur. İçine `sütun [olay karosunun sütunu] satır [olay karosunun satırı] karosunu boşalt`, `skoru [1] değiştir` ve `[puan] melodisini çal` koy.\n3. **Diken:** `bir [Oyuncu] sprite'ı [Dikenler] karosuna dokununca` olayı kur. İçine `canı [-1] değiştir`, `ekranı [250] ms salla`, `[bu sprite] sprite'ını sütun [2] satır [5] karosuna koy` ve `[bu sprite] hızı x [0] y [0]` koy.\n4. **Kapı:** `bir [Oyuncu] sprite'ı [Kapı] karosuna dokununca` olayı kur. İçine `ekranda [Seviye bitti!] yaz, [2] saniye`, `[zafer] melodisini çal` ve `oyunu bitir: [kazandın]` koy.\n5. ↺ bas ve oyna. İlk altını al, dikenlerden kaç, balçığın üstüne zıpla, kapıya ulaş.\n\nBeklenen sonuç: Beş hedefin hepsi ✓. Altın kayboluyor ve skor artıyor, dikene değince can azalıp kahraman başa dönüyor, kapıya dokununca \"Seviye bitti!\" yazılıp oyun kazanılıyor.\n\n### Nasıl çalışıyor?\n- Üç olay ayrı ayrı çalışır. Altın ve diken olayları aynı türden bloklardır; yalnızca resim (karo) farklıdır.\n- Kapı karosu da duvar değildir; kahraman içinden geçebilir. Oyun, değdiği anda `karosuna dokununca` olayını çalıştırır.\n- Hazır gelen balçık kuralı (ezme/yan çarpma) 24. dersteki gibi çalışır.\n- Harita 24 x 8 karodur, yani 384 x 128 piksel. Ekran 160 x 120 olduğu için kamera kahramanı izler.\n\n### Dene\n1. Altınları 5 puan yap ve kapıya dokunmadan önce skorun en az 10 olmasını iste: kapı olayında `eğer [skor] ≥ [10] ise kazan, değilse [Önce altınları topla!] yaz`.\n2. Haritanın bir yerine yeni bir diken koy: **Harita** sekmesinde dikeni seçip zemine boya. Oyun yeni dikeni de tanıyor mu?\n3. Kahramanın resmini robot yap ya da başka bir düşman ekle.\n\n### Sık yapılan hatalar\n- Dikene değince kahramanı başa koyup hızını sıfırlamamak: düşme hızı kalır ve kahraman zemine çarpınca garip zıplar.\n- Kapı olayında `oyunu bitir: [kaybettin]` seçmek: oyun kazanma yerine kaybetme ekranı gösterir.\n- Altın olayında `olay karosunun` bloklarının yerine sabit sayı yazmak: hep aynı karo boşalır.\n- Haritadaki altın karosunu **Altın** değil başka bir resimle çizmek: olay hiç tetiklenmez.",
          "question": "Bu oyunu bir arkadaşın oynarken zorlandığı yer neresi? Dikenleri azaltmak ya da altınları daha yükseğe koymak oyunu nasıl değiştirir? İyi bir seviye kolaydan zora nasıl ilerler?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Bir oyunu kurallar listesi olarak planlamayı\n- Haftanın parçalarını (yerçekimi, zıplama, karo olayları, ezme) bir seviyede birleştirmeyi\n- Harita ölçülerini ve kameranın neden gerektiğini hesaplamayı\n- Oyunu oynayıp zorluğu ayarlamayı\n\n### Önceden bilmen gerekenler\nBu proje 21-24. derslerin hepsini kullanır: yerçekimi (21), zıplama (22), altın ve diken (23), düşmanı ezme (24). Kapı için ders 13'teki `ekranda yaz` ve `oyunu bitir` bloklarını hatırla. Kamera için ders 14'e bak.\n\n### Önce kurallar tablosu\nBüyük bir işi parçalara böl. Her kural şu üç soruya cevap verir: **Neye dokununca? Ne olur? Hangi blok?**\n\n```\nKural   Tetik                      Sonuç\nAltın   Oyuncu + Altın karosu      karo boşalır, skor +1\nDiken   Oyuncu + Diken karosu      can -1, başa dön, hız 0\nKapı    Oyuncu + Kapı karosu       mesaj, oyunu kazan\nEzme    Oyuncu + Düşman çarpışma   düşman yok, skor +5\n```\n\nKural tablosu bir kontrol listesidir: oynarken her satırı tek tek dene.\n\n### Harita ölçüleri\nHer karo 16 piksel, ekran 160 x 120 pikseldir.\n\n```\nHarita 24 x 8 karo  ->  384 x 128 piksel\nEkran 160 piksel genişlikte  ->  384 - 160 = 224 piksel dışarıda\n```\n\nEkrana sığmayan 224 piksel için kamera kahramanı izler. Kamera olmasa sağdaki kapıyı hiç göremezdin.\n\n### Parçalar birlikte çalışır\nAltın, diken ve kapı olayları ayrıdır ama aynı sahnede çalışır. Skor hem altından hem ezmeden gelir. Yeni bir kural eklediğinde önceki kuralların bozulmadığını yeniden dene.\n\n### Kendini oyuncu yerine koy\nOyun bitince oyna: ilk diken çok mu yakın? Altınlara ulaşmak çok zor mu? İyi bir seviye kolaydan zora doğru gider. İlk engel kolay, sonrakiler yavaş yavaş zorlaşır. Kazanma koşulunu değiştirirsen (örneğin kapı için skor ≥ 10) puanların bu koşulu başka bir yoldan geçmeye izin verip vermediğine bak. Skor hem altından hem ezmeden geldiği için istediğin yoldan geçilebilir.\n\n### Özet\nBir oyunu kurallar tablosuyla planlarsın: tetik, sonuç ve blok. Bu projede yerçekimi, zıplama, karo olayları ve düşman ezme tek seviyede birleşir. Harita 384 piksel olduğu için kamera gerekir. Bitince oyunu oynayıp zorluğu ve kuralların birbirini bozmadığını denersin.",
          "concepts": [
            {
              "term": "Kural tablosu",
              "definition": "Tetik, sonuç ve blokları satır satır yazan plan.",
              "example": "Altın: oyuncu + altın karosu, karo boşalır, skor +1.",
              "pitfall": "Plansız başlamak: bir kuralı unutur ya da çakışan olaylar yazarsın."
            },
            {
              "term": "Harita boyutu",
              "definition": "Harita boyutu karo sayısı x 16 pikseldir.",
              "example": "24 x 8 karo = 384 x 128 piksel.",
              "pitfall": "Karo ile pikseli karıştırmak: 24 karo 24 piksel değildir."
            },
            {
              "term": "Kamera",
              "definition": "Harita ekrandan büyükse kahramanı izleyerek ekranda görünen bölgeyi kaydırır.",
              "example": "Harita 384, ekran 160 piksel; 224 piksel kamerayla görülür.",
              "pitfall": "Kamerayı kurmamak: haritanın sağ tarafı hiç görünmez."
            },
            {
              "term": "Kazanma koşulu",
              "definition": "Oyunun nasıl kazanıldığını belirleyen kural (kapıya varmak, yeterli skor).",
              "example": "Kapı olayında `oyunu bitir: kazandın` çalışır.",
              "pitfall": "Kazanma yerine kaybetme seçmek: kapıya varınca kaybetme ekranı çıkar."
            },
            {
              "term": "Seviye dengesi",
              "definition": "Zorluğun kolaydan zora doğru artması.",
              "example": "İlk diken uzakta, sonrakiler birbirine yakın.",
              "pitfall": "İlk engeli zor yapmak: oyuncu daha başta sıkılır."
            },
            {
              "term": "Sınama",
              "definition": "Oyunu oynayıp her kuralı tek tek denemek.",
              "example": "Her altına, dikene, balçığa ve kapıya dokunup sonucu kontrol edersin.",
              "pitfall": "Yalnız bir kez denemek: diğer kuralların bozulduğunu fark etmezsin."
            }
          ],
          "quiz": [
            {
              "id": "m11h5d25-q1",
              "kind": "numeric",
              "prompt": "Platform atlayıcı haritası 24 karo genişliğinde, karo 16 piksel, ekran 160 piksel genişliğinde. Harita ekrandan kaç piksel fazla geniştir (kamerayla kaydırılan miktar)?",
              "answer": 224,
              "tolerance": 0,
              "unit": "piksel",
              "explanation": "Harita genişliği 24 x 16 = 384 piksel. Ekran 160 piksel olduğundan 384 - 160 = 224 piksel dışarıda kalır; kamera bu kısmı kahramanı izleyerek gösterir.",
              "skills": [
                "oyun-harita-olcu"
              ]
            },
            {
              "id": "m11h5d25-q2",
              "kind": "mcq",
              "prompt": "Kapı olayına \"skor en az 10 olsun\" şartı koydun. Altın 5 puan, ezilen balçık da 5 puan veriyor; haritada 2 altın var. Bu kuralın hangi açığı vardır?",
              "options": [
                "Hiçbir açığı yoktur",
                "Oyuncu bir altın ve bir balçıkla 10 puana ulaşıp ikinci altını almadan kazanabilir",
                "Kapı hiç açılmaz",
                "Altın puanı 10 olunca skor negatif olur"
              ],
              "answer": 1,
              "explanation": "Skor hem altından hem ezmeden geldiği için oyuncu bir altın ve bir balçıkla 5 + 5 = 10 puana ulaşıp ikinci altını toplamadan kazanabilir. Bu açık altınları toplatma amacını bozar. Çözüm ölçütü değiştirmek ya da puanları ayarlamaktır.",
              "skills": [
                "oyun-seviye-tasarimi",
                "oyun-mantik-kosul"
              ]
            },
            {
              "id": "m11h5d25-q3",
              "kind": "find-bug",
              "prompt": "Kapıya skor 10'dan az gelen oyuncuya yalnızca uyarı gösterilmesi, oyunun sürmesi gerekiyor. Ama şu an oyuncu uyarı yerine oyunu kaybediyor. Hatalı satır hangisi?\n\n```\n1  bir [Oyuncu] sprite'ı [Kapı] karosuna dokununca:\n2    eğer skor >= 10 ise:\n3      oyunu bitir: [kazandın]\n4    değilse:\n5      oyunu bitir: [kaybettin]\n```",
              "options": [
                "Satır 2: skor >= 10 koşulu",
                "Satır 3: kazanma",
                "Satır 5: değilse kolunda oyunu bitirmek",
                "Satır 1: olay türü"
              ],
              "answer": 2,
              "explanation": "5. satırdaki `oyunu bitir: kaybettin` oyunu bitirir. Uyarı için orada `ekranda [Önce altınları topla!] yaz, 2 saniye` olmalı. 2. ve 3. satırlar kazanma kuralını doğru kuruyor.",
              "skills": [
                "oyun-hata-ayiklama",
                "oyun-seviye-tasarimi"
              ]
            },
            {
              "id": "m11h5d25-q4",
              "kind": "numeric",
              "prompt": "Altın 1 puan, ezilen balçık 5 puan, dikene değmek skoru değiştirmiyor (yalnız can azaltıyor). Oyuncu 2 altın topladı, 2 balçık ezdi ve bir kez dikene değdi. Skor kaç olur?",
              "answer": 12,
              "tolerance": 0,
              "unit": "puan",
              "explanation": "Altınlardan 2 x 1 = 2, balçıklardan 2 x 5 = 10. Diken yalnız canı etkiler, skoru etkilemez. Toplam 2 + 10 = 12.",
              "skills": [
                "oyun-seviye-tasarimi"
              ]
            },
            {
              "id": "m11h5d25-q5",
              "kind": "mcq",
              "prompt": "Arkadaşın oyunu denedi ve ilk dikende üç canının üçünü de kaybetti. Seviyeyi daha dengeli yapmak için en iyi değişiklik hangisi?",
              "options": [
                "Canı 99 yapmak",
                "İlk dikeni daha dar yapıp öncesine güvenli zemin bırakmak",
                "Zıplamayı kapatmak",
                "Kapıyı kaldırmak"
              ],
              "answer": 1,
              "explanation": "İyi bir seviye kolaydan zora gider. İlk dikeni daha dar yapıp öncesine güvenli bir zemin bırakmak oyuncuya öğrenme fırsatı verir. Canı çok artırmak sorunu gizler, zıplamayı kapatmak oyunu bozar, kapıyı kaldırmak oyunu bitirilemez yapar.",
              "skills": [
                "oyun-seviye-tasarimi",
                "oyun-ziplama"
              ]
            }
          ],
          "contentEn": {
            "title": "Project: Platform jumper",
            "problem": "You are putting together all the pieces from this week to make your first real platform game: a hero that walks and jumps; spikes on the ground, gold in the air, a slime enemy and, at the end, a door. Half the game is ready; the other half is writing the rules.",
            "contentMd": "### What are we going to make?\nWhat comes ready-made: a map 24 tiles wide, gravity, walking, jumping with A, the camera, a slime on patrol and the rule for stomping the slime. What you will write:\n\n| Rule | From which lesson | What will happen? |\n|---|---|---|\n| Gold | 23 | When touched, the gold disappears and the score goes up by 1 |\n| Spikes | 23 | When touched, lives go down by 1 and the hero goes back to the start |\n| Door | 13 and 23 | When touched, \"Level complete!\" appears and the game is won |\n\n### Build the blocks\n1. Press ▶ and explore the map. The camera follows the hero; walk right and jump onto the platforms. You pass through the gold, the spikes and the door, but nothing happens.\n2. **Gold:** build a `when a [Player] sprite touches tile [Gold]` event. Inside it, put `clear tile at column [event tile column] row [event tile row]`, `change score by [1]` and `play melody [point]`.\n3. **Spikes:** build a `when a [Player] sprite touches tile [Spikes]` event. Inside it, put `change lives by [-1]`, `shake screen for [250] ms`, `put sprite [this sprite] on tile column [2] row [5]` and `set [this sprite] speed x [0] y [0]`.\n4. **Door:** build a `when a [Player] sprite touches tile [Door]` event. Inside it, put `show [Level complete!] on screen for [2] seconds`, `play melody [victory]` and `end game: [you win]`.\n5. Press ↺ and play. Take the first gold, avoid the spikes, jump on the slime and reach the door.\n\nExpected result: all five goals ✓. The gold disappears and the score goes up; when you touch the spikes, you lose a life and the hero goes back to the start; when you touch the door, \"Level complete!\" appears and the game is won.\n\n### How does it work?\n- The three events run separately. The gold and spike events are made of the same kind of blocks; only the picture (tile) is different.\n- The door tile is not a wall either; the hero can pass through it. The moment it touches it, the game runs the `touches tile` event.\n- The ready-made slime rule (stomp/side hit) works as in lesson 24.\n- The map is 24 x 8 tiles, which is 384 x 128 pixels. Because the screen is 160 x 120, the camera follows the hero.\n\n### Try it\n1. Make the gold worth 5 points and require the score to be at least 10 before touching the door: in the door event, `if [score] ≥ [10] do win, else show [Collect the gold first!]`.\n2. Put a new spike somewhere on the map: in the **Map** tab, choose the spikes and paint them on the ground. Does the game recognise the new spikes too?\n3. Change the hero's picture to the robot, or add another enemy.\n\n### Common mistakes\n- Putting the hero back at the start after the spikes without resetting its speed: the falling speed stays, and the hero jumps strangely when it hits the ground.\n- Choosing `end game: [you lose]` in the door event: the game shows the losing screen instead of winning.\n- Typing fixed numbers instead of the `event tile` blocks in the gold event: the same tile is always cleared.\n- Drawing the gold tile on the map with a picture other than **Gold**: the event is never triggered.",
            "question": "Where does a friend struggle when they play this game? How does having fewer spikes, or putting the gold higher up, change the game? How does a good level move from easy to hard?",
            "explainerMd": "### What you will learn in this lesson\n- How to plan a game as a list of rules\n- How to combine the week's pieces (gravity, jumping, tile events, stomping) in one level\n- How to work out the map size and why a camera is needed\n- How to play the game and adjust the difficulty\n\n### What you should know first\nThis project uses all of lessons 21-24: gravity (21), jumping (22), gold and spikes (23), stomping the enemy (24). For the door, remember the `show on screen` and `end game` blocks from lesson 13. For the camera, look at lesson 14.\n\n### A rules table first\nBreak a big job into pieces. Each rule answers these three questions: **Touching what? What happens? Which block?**\n\n```\nRule    Trigger                     Result\nGold    Player + Gold tile          tile cleared, score +1\nSpikes  Player + Spikes tile        lives -1, back to start, speed 0\nDoor    Player + Door tile          message, win the game\nStomp   Player + Enemy collision    enemy gone, score +5\n```\n\nThe rules table is a checklist: while you play, try each row one by one.\n\n### Map size\nEach tile is 16 pixels, and the screen is 160 x 120 pixels.\n\n```\nMap 24 x 8 tiles  ->  384 x 128 pixels\nScreen 160 pixels wide  ->  384 - 160 = 224 pixels outside\n```\n\nThe camera follows the hero for the 224 pixels that do not fit on the screen. Without the camera you would never see the door on the right.\n\n### The pieces work together\nThe gold, spike and door events are separate, but they run in the same scene. The score comes from both the gold and the stomping. When you add a new rule, try again to make sure the earlier rules have not broken.\n\n### Put yourself in the player's shoes\nWhen the game is finished, play it: are the first spikes too close? Is it too hard to reach the gold? A good level goes from easy to hard. The first obstacle is easy, and the later ones slowly get harder. If you change the winning condition (for example, score ≥ 10 for the door), check whether the points let players meet this condition some other way. Because the score comes from both gold and stomping, players can get through in whichever way they like.\n\n### Summary\nYou plan a game with a rules table: trigger, result and block. In this project, gravity, jumping, tile events and stomping enemies come together in one level. Because the map is 384 pixels wide, a camera is needed. When it is finished, you play the game and check the difficulty and that the rules do not break each other.",
            "concepts": [
              {
                "term": "Rules table",
                "definition": "A plan that writes down the trigger, the result and the blocks, row by row.",
                "example": "Gold: player + gold tile, tile cleared, score +1.",
                "pitfall": "Starting without a plan: you forget a rule or write events that clash."
              },
              {
                "term": "Map size",
                "definition": "The map size is the number of tiles x 16 pixels.",
                "example": "24 x 8 tiles = 384 x 128 pixels.",
                "pitfall": "Mixing up tiles and pixels: 24 tiles is not 24 pixels."
              },
              {
                "term": "Camera",
                "definition": "If the map is bigger than the screen, it follows the hero and scrolls the part shown on the screen.",
                "example": "The map is 384 pixels and the screen 160 pixels; 224 pixels are seen with the camera.",
                "pitfall": "Not setting up the camera: the right-hand side of the map is never seen."
              },
              {
                "term": "Winning condition",
                "definition": "The rule that decides how the game is won (reaching the door, enough score).",
                "example": "In the door event, `end game: you win` runs.",
                "pitfall": "Choosing lose instead of win: the losing screen appears when you reach the door."
              },
              {
                "term": "Level balance",
                "definition": "The difficulty growing from easy to hard.",
                "example": "The first spikes are far away; the later ones are close together.",
                "pitfall": "Making the first obstacle hard: the player gets fed up right at the start."
              },
              {
                "term": "Testing",
                "definition": "Playing the game and trying each rule one by one.",
                "example": "You touch every piece of gold, every spike, the slime and the door, and check the result.",
                "pitfall": "Trying only once: you do not notice that other rules have broken."
              }
            ],
            "quiz": [
              {
                "id": "m11h5d25-q1",
                "kind": "numeric",
                "prompt": "The platform jumper map is 24 tiles wide, a tile is 16 pixels, and the screen is 160 pixels wide. How many pixels wider than the screen is the map (the amount scrolled with the camera)?",
                "answer": 224,
                "tolerance": 0,
                "unit": "pixels",
                "explanation": "The map width is 24 x 16 = 384 pixels. Because the screen is 160 pixels, 384 - 160 = 224 pixels are left outside; the camera shows this part by following the hero.",
                "skills": [
                  "oyun-harita-olcu"
                ]
              },
              {
                "id": "m11h5d25-q2",
                "kind": "mcq",
                "prompt": "You added the condition \"the score must be at least 10\" to the door event. Gold gives 5 points, and a stomped slime also gives 5 points; there are 2 pieces of gold on the map. What loophole does this rule have?",
                "options": [
                  "It has no loophole",
                  "The player can reach 10 points with one piece of gold and one slime and win without taking the second piece of gold",
                  "The door never opens",
                  "When gold is worth 10 points, the score becomes negative"
                ],
                "answer": 1,
                "explanation": "Because the score comes from both gold and stomping, the player can reach 5 + 5 = 10 points with one piece of gold and one slime and win without collecting the second piece of gold. This loophole spoils the aim of making players collect the gold. The fix is to change the test or adjust the points.",
                "skills": [
                  "oyun-seviye-tasarimi",
                  "oyun-mantik-kosul"
                ]
              },
              {
                "id": "m11h5d25-q3",
                "kind": "find-bug",
                "prompt": "A player who reaches the door with a score below 10 should only be shown a warning, and the game should go on. But right now the player loses the game instead of seeing a warning. Which line is wrong?\n\n```\n1  when a [Player] sprite touches tile [Door]:\n2    if score >= 10 do:\n3      end game: [you win]\n4    else:\n5      end game: [you lose]\n```",
                "options": [
                  "Line 2: the score >= 10 condition",
                  "Line 3: winning",
                  "Line 5: ending the game in the else branch",
                  "Line 1: the event kind"
                ],
                "answer": 2,
                "explanation": "`end game: you lose` on line 5 ends the game. For a warning, `show [Collect the gold first!] on screen for 2 seconds` should be there. Lines 2 and 3 build the winning rule correctly.",
                "skills": [
                  "oyun-hata-ayiklama",
                  "oyun-seviye-tasarimi"
                ]
              },
              {
                "id": "m11h5d25-q4",
                "kind": "numeric",
                "prompt": "Gold gives 1 point, a stomped slime gives 5 points, and touching spikes does not change the score (it only takes a life). The player collected 2 pieces of gold, stomped 2 slimes and touched the spikes once. What is the score?",
                "answer": 12,
                "tolerance": 0,
                "unit": "points",
                "explanation": "From the gold, 2 x 1 = 2; from the slimes, 2 x 5 = 10. The spikes only affect lives, not the score. Total: 2 + 10 = 12.",
                "skills": [
                  "oyun-seviye-tasarimi"
                ]
              },
              {
                "id": "m11h5d25-q5",
                "kind": "mcq",
                "prompt": "Your friend tried the game and lost all three lives on the first spikes. Which change is best for making the level more balanced?",
                "options": [
                  "Setting lives to 99",
                  "Making the first spikes narrower and leaving safe ground before them",
                  "Turning jumping off",
                  "Removing the door"
                ],
                "answer": 1,
                "explanation": "A good level goes from easy to hard. Making the first spikes narrower and leaving safe ground before them gives the player a chance to learn. Raising lives a lot hides the problem, turning jumping off breaks the game, and removing the door makes the game impossible to finish.",
                "skills": [
                  "oyun-seviye-tasarimi",
                  "oyun-ziplama"
                ]
              }
            ]
          }
        }
      ]
    },
    {
      "title": "Proje: tam oyunlar",
      "project": "Final oyunum",
      "guideMd": "### Hafta hedefleri\nBu haftanın sonunda öğrenci:\n1. Bir oyunun iskeletini (oyuncu, hedef, tehlike, kazanma, kaybetme) beş soruluk tasarım kartıyla anlatabilir.\n2. Skor ve canı oyun başlarken ayarlayıp kazanma kuralını `≥` ile doğru yazabilir.\n3. Değişkenlerle zamanla artan zorluk ve bayrakla (anahtar gibi) hafıza kurabilir.\n4. `eğer … ise … değilse` ile iki yoldan birini seçebilir ve karo koordinatını piksele çevirebilir.\n5. Dört adımlı dedektif yöntemiyle bozuk bir oyunun hatalarını bulup düzeltebilir; oyuna ses ve sarsıntı gibi cila ekleyebilir.\n6. Kendi fikrinden, dört turda sekiz hedefin hepsini karşılayan tam bir oyun yapabilir.\n\n### Haftanın planı\nHafta beş derstir. Plan günde bir ders içindir; final dersi daha uzun olduğu için ayrı bir gün ayırmak iyi olur.\n\n| Gün | Ders | Süre | Ne yapılır |\n|---|---|---|---|\n| 1 | Oyun iskeleti: oyuncu, hedef, skor, bitiş | ~25 dk | Tasarım kartını doldur, kedi ve elmalar oyununu kur, ≥ ile = farkını dene. |\n| 2 | Tam oyun 1: Uzay savunması | ~30 dk | Vurma, can, süre ve zorluk kurallarını sırayla kur; artış miktarını değiştirip dengele. |\n| 3 | Tam oyun 2: Labirent kaçışı | ~30 dk | Anahtar bayrağını ve iki kollu kapı kuralını yaz; hayaletin hızını ayarla. |\n| 4 | Cila ve hata ayıklama: bozuk oyunu onar | ~25 dk | Dedektif yöntemiyle üç hatayı düzelt, sonra ses ve sarsıntı ekle. |\n| 5 | Final: Kendi oyunun | ~40 dk | Kartı doldur, dört turda oyunu yap, hedefleri ✓ yap ve oyunu arkadaşına oynat. |\n\n### Ön koşul kontrolü\nBu hafta önceki haftaların bloklarını kullanır. Başlamadan önce şunlar rahat olmalı:\n- Sprite oluşturma, ok tuşlarıyla hareket ve çarpışma olayı (1. ve 2. hafta)\n- Skor, can ve `skoru değiştir` bloğu\n- Değişken oluşturmak ve `kadar değiştir` ile `yap` farkı\n- Harita sekmesi, karo ve takip eden düşman (3. ve 4. hafta; labirent dersi için)\n- Basit çarpma, bölme ve toplama (hız ve süre hesapları için)\n\n### Kavram haritası\n- **Tasarım:** tasarım kartı → oyuncu, hedef, tehlike → kazanma ve kaybetme kuralı\n- **Kurallar:** olay + koşul → çarpışma olayı (bir kez) → her karede olayı (saniyede 60 kez)\n- **Hafıza:** değişken → bayrak (0 ya da 1) → olaylar arası köprü\n- **Karar:** `eğer … ise` → `değilse` kolu → `≥` ile `=` farkı\n- **Zorluk ve zaman:** `her N ms'de bir` → geri sayım → `süre bitince` → denge\n- **Kalite:** dedektif yöntemi → hata ayıklama → cila → hedefler paneli\n\n### Sık yapılan hatalar\n- **Kazanma kontrolünü olayın dışına koymak.** Skor değişir ama kural hiç sorulmaz.\n- **`skor = 3` yazmak.** Skor atlıyorsa (2, 4, 6) hiç tetiklenmez; `≥` kullan.\n- **`yap` yerine `kadar değiştir` ya da tersi.** Artış beklerken değer sabit kalır.\n- **Bayrağı 1 yapmamak ya da başlangıçta 0 yapmamak.** Kapı hep kilitli kalır.\n- **Karo bloğuna piksel yazmak.** Numaralar 0'dan başlar ve bir karo 16 pikseldir.\n- **Karelik kuralda sprite'ı silmemek.** `her karede` olayı saniyede 60 kez çalışır ve üç can 50 ms'de gider.\n- **Yanlış sprite türü seçmek.** Olay Yiyecek bekliyorsa Nesne türündeki sprite olayı tetiklemez.\n- **Etkinlikteki ↺ Başa dön düğmesine basmak.** Bloklar silinir; oyunu denemek için sahnedeki ↺ kullanılır.\n\n### Hafta sonu tekrarı\n1. Her dersin kavram kartlarını yeniden oku ve \"sık yapılan yanlış\" satırlarını yüksek sesle söyle.\n2. Mini testlerde yanlış yaptığın soruların açıklamalarını yeniden oku, sonra soruyu yeniden çöz.\n3. Uzay savunmasında artış miktarını 5 yerine 10 yap. 28. saniyedeki `hiz` değerini ve en yavaş uzaylının hızını hesapla, sonra oyunda dene.\n4. Labirent kaçışına ikinci bir anahtar ve ikinci bir kapı ekle. Hangi bayrakları kullanacağını önce kâğıda yaz.\n5. Arkadaşından kendi oyununu oynamasını iste; hiçbir şey söylemeden izle. İlk 10 saniyede nerede takıldı?\n\nHafta sonu testi olarak beş dersin mini testleri yeterlidir; her derste 5 soru, toplam 25 soru. Hedef: her dersten en az 4 doğru. Eksik kalan dersin anlatımına dön.\n\n### Proje değerlendirme ölçütü (Final oyunum)\n| Ölçüt | Gelişmeli | Yeterli | İleri |\n|---|---|---|---|\n| Tasarım | Kart yok, oyunun amacı belirsiz | Beş sorunun hepsi cevaplanmış ve oyunla uyuşuyor | Kart oyunla birebir uyuyor, oyuncuya amaç ilk 10 saniyede anlaşılıyor |\n| Kurallar | Skor ya da can çalışmıyor | Toplayınca skor artıyor, tehlikeye değince can azalıyor | Zaman, bayrak ya da seviye gibi ek bir kural eklenmiş |\n| Bitiş | Oyun kazanılamıyor ya da hiç bitmiyor | Kazanma ve kaybetme çalışıyor | Her iki bitişte de anlamlı bir mesaj gösteriliyor |\n| Cila ve denge | Ses ve efekt yok, oyun çok kolay ya da imkânsız | Ses ve en az bir efekt var, oyun oynanabilir | Sayılar denenip ayarlanmış ve değişiklikler açıklanmış |\n| Anlatım | Ne yaptığını anlatamıyor | Oyunu ve kurallarını adım adım anlatıyor | Bir hata yapıp nasıl bulduğunu dedektif adımlarıyla anlatıyor |\n\n### Veli ve öğretmen notu\n- **Amaç.** Bu hafta ezber değil, bir fikri baştan sona çalışan bir ürüne dönüştürme deneyimidir. Final oyunu öğrencinin kendi tasarımıdır; \"daha iyisi\" yerine \"ne eklemek istersin?\" diye sorun.\n- **Nasıl destek olunur?** Takıldığında cevabı vermeyin. \"Belirti ne?\", \"Hangi olay çalışıyor?\", \"Hangi bloğu şüphelendin?\" sorularıyla dedektif yöntemini birlikte uygulayın.\n- **Süre.** Final dersi 40 dakikadır; öğrenci yorulursa tur arasında ara verilebilir. Oyun, ↺ ile sınırsız denenebilir.\n- **Güvenlik.** Her şey tarayıcıda çalışır; gerçek donanım yoktur. Oyun dosyası **Kaydet** ile bilgisayara indirilirse kişisel bilgi içermez, ancak adı verirken gerçek ad ve soyad kullanmamaya özen gösterin.\n- **İlerleme.** Mini test sonuçları \"İlerlemem\" sayfasında beceri bazında görünür (taslak/pilot özellik; yalnız onay verildiyse kaydedilir).",
      "guideMdEn": "### Goals for the week\nBy the end of this week the learner can:\n1. Describe a game's skeleton (player, goal, danger, winning, losing) with the five-question design card.\n2. Set the score and lives when the game starts, and write the winning rule correctly with `≥`.\n3. Build difficulty that grows over time with variables, and memory (such as a key) with a flag.\n4. Choose one of two paths with `if … do … else`, and turn tile coordinates into pixels.\n5. Find and fix the bugs in a broken game with the four-step detective method, and add polish such as sounds and shakes to a game.\n6. Make a complete game from their own idea, in four rounds, that meets all eight goals.\n\n### Plan for the week\nThe week has five lessons. The plan is for one lesson a day; because the final lesson is longer, it is a good idea to set aside a separate day for it.\n\n| Day | Lesson | Time | What to do |\n|---|---|---|---|\n| 1 | Game skeleton: player, goal, score, ending | ~25 min | Fill in the design card, build the cat and apples game, try the difference between ≥ and =. |\n| 2 | Full game 1: Space defence | ~30 min | Build the hitting, lives, time and difficulty rules in order; change the increase and balance it. |\n| 3 | Full game 2: Maze escape | ~30 min | Write the key flag and the two-branch door rule; adjust the ghost's speed. |\n| 4 | Polish and debugging: fix the broken game | ~25 min | Fix three bugs with the detective method, then add sounds and shakes. |\n| 5 | Final: Your own game | ~40 min | Fill in the card, make the game in four rounds, get the goals to ✓ and have a friend play the game. |\n\n### Prerequisite check\nThis week uses the blocks from earlier weeks. Before you start, these should feel comfortable:\n- Creating sprites, moving with the arrow keys and the collision event (weeks 1 and 2)\n- The score, lives and the `change score` block\n- Creating a variable, and the difference between `change by` and `set`\n- The Map tab, tiles and enemies that follow (weeks 3 and 4; for the maze lesson)\n- Simple multiplication, division and addition (for speed and time calculations)\n\n### Concept map\n- **Design:** design card → player, goal, danger → winning and losing rules\n- **Rules:** event + condition → collision event (once) → every frame event (60 times a second)\n- **Memory:** variable → flag (0 or 1) → a bridge between events\n- **Decisions:** `if … do` → the `else` branch → the difference between `≥` and `=`\n- **Difficulty and time:** `every N ms` → countdown → `when time runs out` → balance\n- **Quality:** detective method → debugging → polish → Goals panel\n\n### Common mistakes\n- **Putting the win check outside the event.** The score changes but the rule is never asked.\n- **Writing `score = 3`.** If the score skips (2, 4, 6), it never triggers; use `≥`.\n- **`change by` instead of `set`, or the other way round.** You expect an increase, but the value stays fixed.\n- **Not setting the flag to 1, or not setting it to 0 at the start.** The door stays locked for ever.\n- **Typing pixels into a tile block.** The numbers start from 0, and a tile is 16 pixels.\n- **Not deleting the sprite in an every-frame rule.** The `every frame` event runs 60 times a second, and three lives go in 50 ms.\n- **Choosing the wrong sprite kind.** If the event expects Food, a sprite of the Object kind does not trigger the event.\n- **Pressing the ↺ Start over button in the activity.** The blocks are deleted; to test the game, use the ↺ on the stage.\n\n### End-of-week review\n1. Read each lesson's concept cards again and say the \"common mistake\" lines out loud.\n2. Read again the explanations of the mini quiz questions you got wrong, then answer the question again.\n3. In space defence, change the increase from 5 to 10. Work out the `speed` value at 28 seconds and the speed of the slowest alien, then try it in the game.\n4. Add a second key and a second door to maze escape. Write on paper first which flags you will use.\n5. Ask a friend to play your own game; watch without saying anything. Where did they get stuck in the first 10 seconds?\n\nAs an end-of-week test, the five lessons' mini quizzes are enough: 5 questions in each lesson, 25 questions in total. Target: at least 4 correct in each lesson. Go back to the explainer of any lesson that falls short.\n\n### Project rubric (My final game)\n| Criterion | Developing | Secure | Advanced |\n|---|---|---|---|\n| Design | No card; the aim of the game is unclear | All five questions are answered and match the game | The card matches the game exactly; the player understands the aim in the first 10 seconds |\n| Rules | The score or lives do not work | The score goes up when you collect something; lives go down when you touch the danger | An extra rule such as time, a flag or levels has been added |\n| Ending | The game cannot be won, or never ends | Winning and losing both work | A meaningful message is shown for both endings |\n| Polish and balance | No sounds or effects; the game is too easy or impossible | There are sounds and at least one effect; the game is playable | The numbers have been tried and adjusted, and the changes are explained |\n| Explanation | Cannot explain what they did | Explains the game and its rules step by step | Explains a bug they made and how they found it, using the detective steps |\n\n### Note for parents and teachers\n- **Aim.** This week is not about learning things by heart; it is the experience of turning an idea into a product that works from start to finish. The final game is the learner's own design; instead of \"make it better\", ask \"what would you like to add?\"\n- **How to help.** When they get stuck, do not give the answer. Use the detective method together with questions such as \"What is the symptom?\", \"Which event is running?\", \"Which block did you suspect?\"\n- **Time.** The final lesson is 40 minutes; if the learner gets tired, you can take a break between rounds. The game can be tried as many times as you like with ↺.\n- **Safety.** Everything runs in the browser; there is no real hardware. If the game file is downloaded to the computer with **Save**, it contains no personal information, but take care not to use a real first name and surname when naming it.\n- **Progress.** Mini quiz results appear skill by skill on the \"My progress\" page (a draft/pilot feature; they are only saved if consent has been given).",
      "lessons": [
        {
          "title": "Oyun iskeleti: oyuncu, hedef, skor, bitiş",
          "durationMin": 25,
          "problem": "Satranç, futbol ve bir bilgisayar oyunu çok farklı görünür ama hepsinin ortak bir iskeleti vardır: sen kimsin, ne yapabilirsin, neyi başarmaya çalışıyorsun, ne zaman kazanır ya da kaybedersin? Bu soruları baştan cevaplayan bir oyun, yarım kalan oyundan çok daha çabuk biter. Bu hafta tam oyunlar yapıyoruz; önce iskeleti öğren.",
          "contentMd": "### Beş soruluk tasarım kartı\nBir oyuna başlamadan önce şu beş soruyu kendi kendine cevapla (bir arkadaşına anlatmak da işe yarar):\n1. **Oyuncu kim?** (kedi, robot, gemi…) Nasıl hareket eder?\n2. **Hedef ne?** (toplamak, vurmak, kaçmak, bir yere varmak)\n3. **Tehlike ne?** (düşman, diken, süre…)\n4. **Nasıl kazanılır?** (örneğin skor 3 olunca)\n5. **Nasıl kaybedilir?** (örneğin can 0 olunca)\n\nBu derste cevapları hazır bir oyunla uygulayacaksın: Oyuncu kedi, hedef elma, kazanma skor 3, kaybetme can 0.\n\n### Hazır olan\nSahnede açık mavi arka plan, solda alt tarafta bir kedi ve üç elma var. Kedi henüz yürümüyor, skor ve can ayarlanmamış, elmalara dokunmak hiçbir şey yapmıyor.\n\n### Blokları kur\n1. **Denetleyici** kategorisinden `[kedi] oyuncu tuşlarıyla [dört yöne] hareket etsin, hız [60]` bloğunu `oyun başlayınca` bloğunun en altına tak. Kedi artık ok tuşlarıyla yürüyor.\n2. **Oyun** kategorisinden `skoru [0] yap` ve `canı [3] yap` bloklarını aynı yere ekle. Oyun başlarken sayaçlar tanımlı olsun.\n3. **Sprite** kategorisinden `bir [Oyuncu] sprite'ı bir [Yiyecek] sprite'ına çarpınca` olayını kur.\n4. Olayın içine: `skoru [1] değiştir`, `[puan] melodisini çal`, `[diğer sprite] sprite'ını sil`.\n5. En alta **Mantık** kategorisinden `eğer [skor] ≥ [3] ise` bloğunu koy. (`skor` bloğu **Oyun** kategorisinde.) İçine `ekranda [Kazandın!] yaz, [2] saniye` ve `oyunu bitir: [kazandın]` bloklarını tak.\n6. ↺ bas. Elmaları topla. Üçüncüde \"Kazandın!\" yazıp oyun bitiyor.\n\nBeklenen sonuç: Beş hedefin hepsi ✓. Kedi yürüyor, skor ve can başlangıçta ayarlı, elmalar yenince kayboluyor ve üç elma sonunda oyun kazanılıyor.\n\n### Nasıl çalışıyor?\n- Kazanma ve kaybetme birer **kural**dır. Kazanma kuralını biz yazdık (`eğer skor ≥ 3`). Kaybetme kuralını yazmazsak oyun, can 0 olunca kendiliğinden kaybedilir.\n- Skor ve can değişkenleri oyunun kendi sayaçlarıdır; ekranda sol üstte skor, sağ üstte kalpler olarak görünürler.\n- Çarpışma olayı üç işi bir arada yapıyor: puan verir, ses çalar, elmayı yok eder. Bir olayın içine istediğin kadar blok koyabilirsin.\n- İskelet tamam olunca üstüne düşman, harita, zaman gibi parçalar eklemek kolaydır.\n\n### Dene\n1. Elma sayısını artır: `yeni [Elma] sprite'ı, türü [Yiyecek]` ile yeni elmalar ekle. Kazanma skorunu da buna göre yükselt.\n2. Elma yerine **Kiraz** ya da **Mantar** kullan. Yeni elmaları hangi resimle değiştirirsen çarpışma kuralı etkilenir mi?\n3. Ekrana bir tehlike ekle (`yeni [Hayalet] sprite'ı, türü [Düşman]`) ve `bir [Oyuncu] sprite'ı bir [Düşman] sprite'ına çarpınca` olayında canı azalt.\n\n### Sık yapılan hatalar\n- Kazanma kontrolünü çarpışma olayının dışına koymak: skor değişir ama kural hiç sorulmaz, oyun bitmez.\n- `eğer skor ≥ 3` yerine `skor = 3` yazıp skoru 1'den fazla artırmak: skor 3'ü atlayıp 4 olursa kazanma hiç tetiklenmez. `≥` daha güvenlidir.\n- Elmayı silmemek: yenen elma sahnede görünmeye devam eder, oyun yenmemiş gibi görünür.\n- Başlangıç skorunu ve canı yazmamak: oyun yine çalışır, ama programı okuyan kişi başlangıç değerlerini göremez. Başlangıç değerlerini açıkça yazmak iyi bir alışkanlıktır.",
          "question": "Beş soruluk kartta en zor cevap hangisiydi? Bir oyun fikrin olsa, hangi soruyu cevaplamadan başlamak seni en çok zorlardı?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Her oyunun ortak iskeletini: oyuncu, hedef, tehlike, kazanma ve kaybetme kuralı\n- Skor ve can sayaçlarının oyunda ne işe yaradığını\n- Kazanma kuralını neden `≥` ile yazmanın daha güvenli olduğunu\n- Bir fikri beş soruluk tasarım kartına dökmeyi\n\n### Önceden bilmen gerekenler\n- Sprite oluşturmak ve `oyun başlayınca` bloğunu kullanmak (1. ve 2. dersler)\n- Oyuncuyu tuşlarla yürütmek (2. ders)\n- Çarpışma olayı ve `skoru değiştir` bloğu (haftalar 2-3 arası dersler)\n\n### Her oyunun gizli iskeleti\nSatranç, futbol ve bir bilgisayar oyunu birbirine hiç benzemez. Ama hepsinde aynı beş soru cevaplanmıştır: **Sen kimsin?** (oyuncu), **Ne yapmaya çalışıyorsun?** (hedef), **Seni ne durdurur?** (tehlike), **Ne zaman kazanırsın?** ve **Ne zaman kaybedersin?**\n\nBir oyuna blok koymadan önce bu soruları cevaplarsan yarım kalan oyun ihtimali çok azalır. Sorular bir karta yazılırsa buna **tasarım kartı** diyoruz.\n\n| Soru | Uzay oyunu | Kedi ve elmalar |\n|---|---|---|\n| Oyuncu | Gemi | Kedi |\n| Hedef | Uzaylıları vurmak | Elma toplamak |\n| Tehlike | Uzaylı, süre | Yok (daha sonra hayalet) |\n| Kazanma | Süre bitince hayattaysan | Skor 3 olunca |\n| Kaybetme | Can 0 olunca | Can 0 olunca |\n\n### Sayaçlar ve kurallar\n**Skor** ve **can** oyunun kendi sayaçlarıdır. Oyun başlarken değerlerini sen yazarsın: örneğin skor 0, can 3. Bir **kural**, bir olay ile bir koşulun birleşmesidir: \"elma yenince skor artsın\" bir olaydır, \"skor 3 ise kazan\" bir koşuldur.\n\nKazanma kuralını kendin yazarsın. Kaybetme kuralını yazmazsan oyun, can 0 olunca kendiliğinden kaybedilir. Yani her oyunun bir sonu vardır ama kazanma sonunu sen tanımlarsın.\n\n### Kontrolü nereye koymalı?\nKoşul yalnız çalıştığı anda sorulur. `eğer skor ≥ 3` bloğu oyunun başında dursa skor o anda 0 olduğu için sonuç hep \"hayır\" çıkar. Skor değiştiği yerde, yani çarpışma olayının içinde sorulmalıdır.\n\nBaşka bir tuzak, `=` ile `≥` farkıdır. Her elma 2 puan veriyorsa skor 2, 4, 6 olarak gider. Kural `skor = 5` ise skor 5'e hiç eşit olmaz. Kural `skor ≥ 5` ise 6'da kazanılır. Sayı atlayabiliyorsa `≥` kullan.\n\n### Küçük hesap\nHer elma 4 puan, kazanma kuralı `skor ≥ 10` olsun. Skorlar 4, 8, 12 diye gider; 12 ≥ 10 olduğu için üçüncü elmada kazanılır. Yani gereken elma sayısı, hedef puanı elma puanına bölüp **yukarı yuvarlamaktır**: 10 ÷ 4 = 2,5 → 3.\n\n### Özet\nHer oyunun iskeleti beş sorudan oluşur: oyuncu, hedef, tehlike, kazanma, kaybetme. Skor ve can başlangıçta ayarlanır, kurallar olaylarla koşulların birleşimidir. Kazanma kontrolü skorun değiştiği olayın içinde olmalı ve sayı atlayabiliyorsa `≥` ile yazılmalıdır. Kaybetme kuralı yazılmasa bile can 0 olunca oyun biter.",
          "concepts": [
            {
              "term": "Tasarım kartı",
              "definition": "Bir oyuna başlamadan önce beş soruyu cevaplayan kısa not: oyuncu, hedef, tehlike, kazanma, kaybetme.",
              "example": "Kedi ve elmalar oyununda kart: oyuncu kedi, hedef elma, kazanma skor 3, kaybetme can 0.",
              "pitfall": "Kartı atlayıp doğrudan blok koymak; oyunun nasıl biteceği belli olmadığı için oyun yarım kalır."
            },
            {
              "term": "Skor ve can",
              "definition": "Oyunun kendi sayaçlarıdır; skor başarıyı, can kalan hakkı sayar ve oyun başlarken değerleri ayarlanır.",
              "example": "Oyun başlayınca skoru 0, canı 3 yaparsın; elma yenince skor 1 artar.",
              "pitfall": "Başlangıç değerlerini yazmamak; oyun yine çalışır ama programı okuyan başlangıcın ne olduğunu göremez."
            },
            {
              "term": "Kazanma kuralı",
              "definition": "Oyunu hangi koşulda kazandığını söyleyen olay ve koşul birleşimi.",
              "example": "Elma yenince `eğer skor ≥ 3 ise oyunu bitir: kazandın` kuralı sorulur.",
              "pitfall": "Kontrolü çarpışma olayının dışına koymak; skor değişse bile kural hiç sorulmaz ve oyun bitmez."
            },
            {
              "term": "Kaybetme kuralı",
              "definition": "Can 0 olunca oyunun kendiliğinden kaybedilerek bitmesi; istersen `can bitince` olayıyla özelleştirilir.",
              "example": "Düşmana çarpınca can 1 azalır; 3 çarpışmadan sonra oyun kaybedilir.",
              "pitfall": "Kaybetmenin hiç mümkün olmadığını sanmak; tehlike hiç can azaltmıyorsa oyun meydan okumaz."
            },
            {
              "term": "≥ ile = farkı",
              "definition": "`skor ≥ 3` skor 3 ya da daha büyük olunca doğrudur; `skor = 3` yalnız tam 3 iken doğrudur.",
              "example": "Her elma 2 puan verirken skor 2, 4, 6 olur; `skor ≥ 5` 6'da tetiklenir.",
              "pitfall": "Skor atlayabilirken `=` kullanmak; sayı hedefi atlarsa kazanma hiç tetiklenmez."
            }
          ],
          "quiz": [
            {
              "id": "m11h6d26-q1",
              "kind": "mcq",
              "prompt": "Hangisi iyi bir kazanma kuralı olamaz? (Bir kural, oyunun ölçebildiği bir şeye bakmalıdır.)",
              "options": [
                "Skor 10 olunca",
                "Süre dolduğunda hâlâ canın varsa",
                "Oyun güzel olunca",
                "Anahtarla kapıya ulaşınca"
              ],
              "answer": 2,
              "explanation": "Oyun skoru, canı, süreyi, konumu ve sprite türlerini ölçebilir; \"güzel olmayı\" ölçemez. Diğer üç seçenek bir sayıya ya da bir olaya bağlıdır.",
              "skills": [
                "oyun-iskelet",
                "oyun-tasarim"
              ]
            },
            {
              "id": "m11h6d26-q2",
              "kind": "mcq",
              "prompt": "Kaybetme kuralı için hiçbir blok yazmadın. Kedi düşmana çarpıp canı 3'ten 0'a düşünce ne olur?",
              "options": [
                "Oyun kendiliğinden kaybedilerek biter",
                "Hiçbir şey olmaz, oyun sonsuza kadar sürer",
                "Oyun kazanılır",
                "Skor sıfırlanır ama oyun sürer"
              ],
              "answer": 0,
              "explanation": "Can 0 olunca, `can bitince` olayı yazılmamışsa oyun kendiliğinden kaybedilir. Kaybetme için ayrı kural yazmak zorunlu değildir; kazanma kuralını ise sen yazarsın.",
              "skills": [
                "oyun-iskelet"
              ]
            },
            {
              "id": "m11h6d26-q3",
              "kind": "numeric",
              "prompt": "Her elma 5 puan veriyor ve kazanma kuralı `skor ≥ 12`. Oyunu kazanmak için en az kaç elma toplamalısın?",
              "answer": 3,
              "tolerance": 0,
              "unit": "elma",
              "explanation": "Skorlar 5, 10, 15 diye gider. 10 < 12 olduğu için ikinci elma yetmez, üçüncüde 15 ≥ 12 olur. Hesap: 12 ÷ 5 = 2,4 ve yukarı yuvarlanır, 3 çıkar. 2 elma yazmak yuvarlamayı aşağı yapmak olur.",
              "skills": [
                "oyun-iskelet",
                "oyun-kosul"
              ]
            },
            {
              "id": "m11h6d26-q4",
              "kind": "predict-output",
              "prompt": "Her elma 2 puan veriyor, skor 0'dan başlıyor ve toplam 4 elma var. Kural aşağıdaki gibi yazıldı. Kedi dört elmanın hepsini toplarsa ne olur?\n\n```\nOyuncu, Yiyecek'e çarpınca:\n  skoru 2 değiştir\n  diğer sprite'ı sil\n  eğer skor = 5 ise:\n    oyunu bitir: kazandın\n```",
              "options": [
                "Beşinci puanda kazanılır",
                "Skor 2, 4, 6, 8 olur; 5'e eşit olmadığı için kazanma hiç tetiklenmez",
                "Skor 8 olunca oyun kazanılır",
                "Derleme hatası olur"
              ],
              "answer": 1,
              "explanation": "Skor yalnızca çift sayılardan geçer, 5'e hiç denk gelmez; `=` koşulu hiç doğru olmaz. Doğrusu `skor ≥ 5` yazmaktır: 6'da kazanılır. Oyunun derleme hatası vermesi için blok eksik olması gerekir; burada bloklar geçerlidir.",
              "skills": [
                "oyun-kosul",
                "oyun-hata"
              ]
            },
            {
              "id": "m11h6d26-q5",
              "kind": "find-bug",
              "prompt": "Üç elmayı da topluyorsun ama oyun hiç kazanılmıyor. Programın hatası nedir?\n\n```\noyun başlayınca:\n  skoru 0 yap\n  canı 3 yap\n  eğer skor ≥ 3 ise: oyunu bitir: kazandın\n\nOyuncu, Yiyecek'e çarpınca:\n  skoru 1 değiştir\n  diğer sprite'ı sil\n```",
              "options": [
                "Kazanma kontrolü yalnız oyun başlarken, skor 0 iken bir kez sorulur",
                "Skor 0 yerine 1'den başlamalı",
                "`≥` yerine `≤` yazılmalı",
                "Elmayı silmek oyunu kilitler"
              ],
              "answer": 0,
              "explanation": "Koşul sadece çalıştığı anda sorulur. Başlangıçta skor 0 olduğu için sonuç \"hayır\" çıkar ve bir daha sorulmaz. Kontrol skorun değiştiği olayın içine taşınmalıdır. `≥` doğrudur; `≤` yazmak başlangıçta bile kazandırırdı. Elmayı silmek hatalı değildir.",
              "skills": [
                "oyun-kosul",
                "oyun-olay",
                "oyun-hata"
              ]
            }
          ],
          "contentEn": {
            "title": "Game skeleton: player, goal, score, ending",
            "problem": "Chess, football and a computer game look very different, but they all share a skeleton: who are you, what can you do, what are you trying to achieve, and when do you win or lose? A game that answers these questions from the start gets finished much faster than one left half-done. This week we are making complete games; first, learn the skeleton.",
            "contentMd": "### The five-question design card\nBefore you start a game, answer these five questions for yourself (explaining them to a friend works too):\n1. **Who is the player?** (a cat, a robot, a ship…) How does it move?\n2. **What is the goal?** (collecting, shooting, escaping, reaching a place)\n3. **What is the danger?** (enemies, spikes, time…)\n4. **How do you win?** (for example, when the score reaches 3)\n5. **How do you lose?** (for example, when lives reach 0)\n\nIn this lesson you will put the answers into practice with a ready-made game: the player is a cat, the goal is apples, you win at a score of 3, and you lose at 0 lives.\n\n### What is ready\nOn the stage there is a light blue background, a cat at the bottom left and three apples. The cat does not walk yet, the score and lives are not set, and touching the apples does nothing.\n\n### Build the blocks\n1. From the **Controller** category, snap the `[kedi] moves [in 4 directions] with player keys, speed [60]` block at the very bottom of the `when game starts` block. The cat now walks with the arrow keys.\n2. From the **Game** category, add the `set score to [0]` and `set lives to [3]` blocks in the same place. The counters should be set when the game starts.\n3. From the **Sprite** category, build the `when a [Player] sprite hits a [Food] sprite` event.\n4. Inside the event: `change score by [1]`, `play melody [point]`, `delete sprite [other sprite]`.\n5. At the bottom, put an `if [score] ≥ [3] do` block from the **Logic** category. (The `score` block is in the **Game** category.) Snap the `show [You win!] on screen for [2] seconds` and `end game: [you win]` blocks inside it.\n6. Press ↺. Collect the apples. On the third one, \"You win!\" appears and the game ends.\n\nExpected result: all five goals ✓. The cat walks, the score and lives are set at the start, the apples disappear when eaten, and the game is won after three apples.\n\n### How does it work?\n- Winning and losing are each a **rule**. We wrote the winning rule (`if score ≥ 3`). If we do not write a losing rule, the game is lost by itself when lives reach 0.\n- The score and lives variables are the game's own counters; on the screen they appear as the score at the top left and hearts at the top right.\n- The collision event does three jobs together: it gives a point, plays a sound and gets rid of the apple. You can put as many blocks as you like inside an event.\n- Once the skeleton is complete, it is easy to add pieces such as enemies, a map or time on top of it.\n\n### Try it\n1. Add more apples: add new apples with `new [Apple] sprite, kind [Food]`. Raise the winning score to match.\n2. Use **Cherry** or **Mushroom** instead of the apple. Does changing the picture of the new apples affect the collision rule?\n3. Add a danger to the screen (`new [Ghost] sprite, kind [Enemy]`) and take away a life in the `when a [Player] sprite hits a [Enemy] sprite` event.\n\n### Common mistakes\n- Putting the win check outside the collision event: the score changes but the rule is never asked, and the game does not end.\n- Writing `score = 3` instead of `if score ≥ 3` and raising the score by more than 1: if the score skips 3 and becomes 4, the win is never triggered. `≥` is safer.\n- Not deleting the apple: an eaten apple is still visible on the stage, and it looks as if it has not been eaten.\n- Not writing the starting score and lives: the game still works, but someone reading the program cannot see the starting values. Writing the starting values clearly is a good habit.",
            "question": "Which was the hardest answer on the five-question card? If you had a game idea, which question would make things hardest for you if you started without answering it?",
            "explainerMd": "### What you will learn in this lesson\n- The skeleton every game shares: the player, the goal, the danger, the winning rule and the losing rule\n- What the score and lives counters are for in a game\n- Why it is safer to write the winning rule with `≥`\n- How to put an idea onto a five-question design card\n\n### What you should know first\n- Creating a sprite and using the `when game starts` block (lessons 1 and 2)\n- Walking the player with the keys (lesson 2)\n- The collision event and the `change score` block (lessons in weeks 2-3)\n\n### The hidden skeleton of every game\nChess, football and a computer game are nothing like each other. But in all of them the same five questions have been answered: **Who are you?** (the player), **What are you trying to do?** (the goal), **What stops you?** (the danger), **When do you win?** and **When do you lose?**\n\nIf you answer these questions before you put any blocks into a game, the chance of it being left half-done is much smaller. When the questions are written on a card, we call it a **design card**.\n\n| Question | Space game | Cat and apples |\n|---|---|---|\n| Player | Ship | Cat |\n| Goal | Shooting aliens | Collecting apples |\n| Danger | Aliens, time | None (a ghost later) |\n| Winning | Still alive when the time runs out | When the score reaches 3 |\n| Losing | When lives reach 0 | When lives reach 0 |\n\n### Counters and rules\nThe **score** and **lives** are the game's own counters. You write their values when the game starts: for example, score 0 and lives 3. A **rule** is an event and a condition put together: \"when an apple is eaten, raise the score\" is an event, and \"if the score is 3, win\" is a condition.\n\nYou write the winning rule yourself. If you do not write a losing rule, the game is lost by itself when lives reach 0. So every game has an ending, but you define the winning ending.\n\n### Where should the check go?\nA condition is only asked at the moment it runs. If the `if score ≥ 3` block were at the start of the game, the score would be 0 at that moment, so the answer would always be \"no\". It must be asked where the score changes, that is, inside the collision event.\n\nAnother trap is the difference between `=` and `≥`. If each apple gives 2 points, the score goes 2, 4, 6. If the rule is `score = 5`, the score is never equal to 5. If the rule is `score ≥ 5`, you win at 6. If the number can skip, use `≥`.\n\n### A small calculation\nSay each apple is worth 4 points and the winning rule is `score ≥ 10`. The score goes 4, 8, 12; because 12 ≥ 10, you win on the third apple. So the number of apples needed is the target score divided by the points per apple, **rounded up**: 10 ÷ 4 = 2.5 → 3.\n\n### Summary\nEvery game's skeleton is made of five questions: player, goal, danger, winning, losing. The score and lives are set at the start, and rules are events and conditions put together. The win check must be inside the event where the score changes, and written with `≥` if the number can skip. Even if no losing rule is written, the game ends when lives reach 0.",
            "concepts": [
              {
                "term": "Design card",
                "definition": "A short note answering five questions before you start a game: player, goal, danger, winning, losing.",
                "example": "The card for the cat and apples game: the player is the cat, the goal is apples, winning is a score of 3, losing is 0 lives.",
                "pitfall": "Skipping the card and putting blocks in straight away; because it is not clear how the game will end, it is left half-done."
              },
              {
                "term": "Score and lives",
                "definition": "The game's own counters; the score counts success, lives count the chances left, and their values are set when the game starts.",
                "example": "When the game starts you set the score to 0 and lives to 3; when an apple is eaten, the score goes up by 1.",
                "pitfall": "Not writing the starting values; the game still works, but someone reading the program cannot see what the start is."
              },
              {
                "term": "Winning rule",
                "definition": "An event and a condition put together that say under what condition the game is won.",
                "example": "When an apple is eaten, the rule `if score ≥ 3 do end game: you win` is asked.",
                "pitfall": "Putting the check outside the collision event; even when the score changes, the rule is never asked and the game does not end."
              },
              {
                "term": "Losing rule",
                "definition": "The game ending by itself as a loss when lives reach 0; if you like, you can customise it with the `when lives run out` event.",
                "example": "Hitting an enemy takes away 1 life; after 3 collisions the game is lost.",
                "pitfall": "Thinking losing is impossible; if the danger never takes away lives, the game is no challenge."
              },
              {
                "term": "The difference between ≥ and =",
                "definition": "`score ≥ 3` is true when the score is 3 or bigger; `score = 3` is only true when it is exactly 3.",
                "example": "When each apple gives 2 points, the score goes 2, 4, 6; `score ≥ 5` triggers at 6.",
                "pitfall": "Using `=` when the score can skip; if the number skips the target, the win is never triggered."
              }
            ],
            "quiz": [
              {
                "id": "m11h6d26-q1",
                "kind": "mcq",
                "prompt": "Which one cannot be a good winning rule? (A rule must look at something the game can measure.)",
                "options": [
                  "When the score reaches 10",
                  "If you still have lives when the time runs out",
                  "When the game is beautiful",
                  "When you reach the door with the key"
                ],
                "answer": 2,
                "explanation": "The game can measure the score, lives, time, position and sprite kinds; it cannot measure \"being beautiful\". The other three options depend on a number or an event.",
                "skills": [
                  "oyun-iskelet",
                  "oyun-tasarim"
                ]
              },
              {
                "id": "m11h6d26-q2",
                "kind": "mcq",
                "prompt": "You did not write any blocks for the losing rule. What happens when the cat hits an enemy and its lives drop from 3 to 0?",
                "options": [
                  "The game ends by itself as a loss",
                  "Nothing happens, and the game goes on for ever",
                  "The game is won",
                  "The score is reset but the game goes on"
                ],
                "answer": 0,
                "explanation": "When lives reach 0, if no `when lives run out` event has been written, the game is lost by itself. Writing a separate rule for losing is not required; the winning rule, however, you write yourself.",
                "skills": [
                  "oyun-iskelet"
                ]
              },
              {
                "id": "m11h6d26-q3",
                "kind": "numeric",
                "prompt": "Each apple gives 5 points and the winning rule is `score ≥ 12`. What is the smallest number of apples you must collect to win the game?",
                "answer": 3,
                "tolerance": 0,
                "unit": "apples",
                "explanation": "The score goes 5, 10, 15. Because 10 < 12, the second apple is not enough; on the third, 15 ≥ 12. Calculation: 12 ÷ 5 = 2.4, rounded up, gives 3. Writing 2 apples would be rounding down.",
                "skills": [
                  "oyun-iskelet",
                  "oyun-kosul"
                ]
              },
              {
                "id": "m11h6d26-q4",
                "kind": "predict-output",
                "prompt": "Each apple gives 2 points, the score starts at 0, and there are 4 apples in total. The rule is written as below. What happens if the cat collects all four apples?\n\n```\nwhen Player hits Food:\n  change score by 2\n  delete sprite other sprite\n  if score = 5 do:\n    end game: you win\n```",
                "options": [
                  "You win on the fifth point",
                  "The score goes 2, 4, 6, 8; because it is never equal to 5, the win is never triggered",
                  "The game is won when the score reaches 8",
                  "There is a compile error"
                ],
                "answer": 1,
                "explanation": "The score only passes through even numbers and never lands on 5; the `=` condition is never true. The right way is to write `score ≥ 5`: you win at 6. For the game to give a compile error, a block would have to be missing; here the blocks are valid.",
                "skills": [
                  "oyun-kosul",
                  "oyun-hata"
                ]
              },
              {
                "id": "m11h6d26-q5",
                "kind": "find-bug",
                "prompt": "You collect all three apples, but the game is never won. What is the bug in the program?\n\n```\nwhen game starts:\n  set score to 0\n  set lives to 3\n  if score ≥ 3 do: end game: you win\n\nwhen Player hits Food:\n  change score by 1\n  delete sprite other sprite\n```",
                "options": [
                  "The win check is asked only once, at the start of the game, when the score is 0",
                  "The score should start at 1 instead of 0",
                  "`≤` should be written instead of `≥`",
                  "Deleting the apple locks the game"
                ],
                "answer": 0,
                "explanation": "A condition is only asked at the moment it runs. At the start the score is 0, so the answer is \"no\" and it is never asked again. The check must be moved inside the event where the score changes. `≥` is correct; writing `≤` would make you win even at the start. Deleting the apple is not a bug.",
                "skills": [
                  "oyun-kosul",
                  "oyun-olay",
                  "oyun-hata"
                ]
              }
            ]
          }
        },
        {
          "title": "Tam oyun 1: Uzay savunması",
          "durationMin": 30,
          "problem": "Uzay oyunlarında düşman dalgaları zamanla hızlanır, oyuncunun süresi sınırlıdır ve en sonunda ya kazanırsın ya kaybedersin. Hiçbiri yeni bir blok gerektirmiyor: hepsi daha önce öğrendiğin parçalardır. Bu derste onları bir araya getirip süreli ve gittikçe zorlaşan bir oyun yapacaksın.",
          "contentMd": "### Hazır olan\nGece gökyüzünde alt tarafta bir gemi var. Ok tuşlarıyla sağa-sola gidiyor, A ile lazer atıyor. Her 800 ms'de bir yukarıdan rastgele bir yerden uzaylı iniyor. Skor 0, can 3. Bir de `hiz` adlı bir değişken var, başlangıçta 0. Lazer ve uzaylıların çarpışma kuralları, can, süre ve zorluk henüz yok.\n\n### Dört iş\n| İş | Hangi derste öğrendin |\n|---|---|\n| Lazer uzaylıyı vurunca skor | 19 |\n| Uzaylı gemiye değince can | 9 |\n| 30 saniyelik süre | Yeni: `geri sayım` |\n| Zamanla hızlanan uzaylılar | Yeni: değişkeni değiştirmek |\n\n### Blokları kur: vurma ve can\n1. `bir [Mermi] sprite'ı bir [Düşman] sprite'ına çarpınca` olayını kur. İçine `skoru [10] değiştir`, `[patlama] melodisini çal`, `[diğer sprite] patlayıp yok olsun`, `[bu sprite] sprite'ını sil`.\n2. `bir [Oyuncu] sprite'ı bir [Düşman] sprite'ına çarpınca` olayını kur. İçine `canı [-1] değiştir`, `ekranı [250] ms salla`, `[diğer sprite] sprite'ını sil`.\n3. ↺ bas. Lazerle uzaylıları vur; uzaylılar gemiye değince can azalıyor.\n\n### Blokları kur: süre\n4. **Oyun** kategorisinden `geri sayımı [30] saniyeden başlat` bloğunu `oyun başlayınca` içinin en altına ekle. Sahnenin üstünde ortada kalan süre görünür; son 5 saniyede sarıya döner.\n5. **Oyun** kategorisinden `süre bitince` olayını kur. İçine `ekranda [Dünya kurtuldu!] yaz, [2] saniye` ve `oyunu bitir: [kazandın]` koy.\n\n### Blokları kur: zorluk\n6. **Oyun** kategorisinden `her [4000] ms'de bir` olayını al. İçine **Değişken** kategorisinden `[hiz] değişkenini [5] kadar değiştir` bloğunu tak.\n7. Hazır gelen `her [800] ms'de bir` olayını bul. İçindeki `[ufo] hızı x [0] y [rastgele]` bloğunun y kutusuna bir toplama bloğu (`[ ] + [ ]`) koy: soluna eski rastgele sayı bloğunu, sağına `hiz` değişkenini yerleştir. Uzaylılar her 4 saniyede biraz daha hızlı iner.\n8. ↺ bas ve tam oyunu oyna. 30 saniye hayatta kalırsan kazanırsın; canın biterse kaybedersin.\n\nBeklenen sonuç: Beş hedefin hepsi ✓. Lazer vuruyor, uzaylı gemiye değince can azalıyor, sayaç 30'dan geriye sayıyor, süre bitince oyun kazanılıyor ve uzaylılar zamanla hızlanıyor.\n\n### Nasıl çalışıyor?\n- `süre bitince` olayı, geri sayım 0'a ulaşınca çalışır. Bu olayı yazmazsan oyun süre dolunca kendiliğinden biter (kaybedersin). Biz \"süre dolunca kazan\" kuralını seçtik.\n- `hiz` bir **değişken**dir: bir sayıyı hatırlar. Her 4 saniyede 5 artar. 28. saniyede 35 olur. Uzaylı hızı 20 ile 45 arası rastgele sayıya `hiz` eklenerek hesaplandığı için başlangıçta 20-45, sonda 55-80 civarıdır.\n- Aynı `hiz` değişkenini üç olay kullanır: biri başlangıçta sıfırlar, biri zamanla artırır, biri uzaylının hızını hesaplar. Böyle ortak sayılar oyunun \"ayar düğmeleri\" gibidir.\n- Üç kural (vurma, can, süre) bağımsızdır; birini kapatsan diğerleri çalışmaya devam eder.\n\n### Dene\n1. Artış miktarını 5'ten 2'ye, sonra 10'a çıkar. Hangisi daha dengeli?\n2. Süreyi 60 saniye yap; zorluk artışı yetmeyince oyun sıkıcı oluyor mu?\n3. Her 4 saniyede bir ikinci bir uzaylı üreten yeni bir `her [4000] ms'de bir` olayı ekle. Oyun daha kalabalık oluyor mu?\n4. Skor 100'e ulaşınca da kazanma kuralı ekle.\n\n### Sık yapılan hatalar\n- `hiz` değişkenini başlangıçta 0 yapan hazır bloğu silmek: değişkenin ilk değeri belirsiz kalır ve uzaylı hız hesabı yanlış çıkabilir. O bloğu yerinde bırak.\n- Uzaylının hız bloğunda toplama yerine yalnızca `hiz` yazmak: uzaylılar başlangıçta hiç hareket etmez.\n- `süre bitince` bloğunu başka bir olayın içine koymak: olaylar yalnız tek başlarına durur.\n- Zorluğu çok hızlı artırmak: oyun 10. saniyede oynanamaz hâle gelir. Oyun tasarımı biraz da deneme yanılmadır.",
          "question": "Bu oyunun en eğlenceli anı hangisiydi: ilk dakika mı, son 5 saniye mi? Zorluğun zamanla artması neden oyunu daha çok sürükleyici yapıyor?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Birbirinden bağımsız üç kuralı (vurma, can, süre) tek oyunda birleştirmeyi\n- Bir **değişkeni** oyunun ayar düğmesi gibi kullanmayı\n- Süreli bir olayın (`her 4000 ms'de bir`) oyunu zamanla nasıl zorlaştırdığını\n- Zorluk artışını hesaplayıp dengelemeyi\n\n### Önceden bilmen gerekenler\n- Oyun iskeleti, skor, can ve kazanma kuralı (26. ders)\n- Çarpışma olayı: `bir [Mermi] bir [Düşman]'a çarpınca` ve sprite silme\n- Ok tuşuyla hareket ve `her … ms'de bir` olayı (haftalar 1-4 arası dersler)\n\n### Oyun, küçük kuralların toplamıdır\nUzay savunması büyük görünür ama içinde yeni bir kavram yok. Dört küçük kural yan yana duruyor:\n\n| Kural | Olay | Sonuç |\n|---|---|---|\n| Vurma | Mermi, Düşman'a çarpınca | Skor +10, uzaylı patlar |\n| Can | Oyuncu, Düşman'a çarpınca | Can -1, ekran sallanır |\n| Süre | Süre bitince | Oyun kazanılır |\n| Zorluk | Her 4000 ms'de bir | `hiz` 5 artar |\n\nKuralların her biri kendi olayında yaşar. Birini silersen diğerleri çalışmaya devam eder. Bu yüzden büyük bir oyunu tek seferde değil, kural kural kurarsın ve her kuralı ↺ ile denersin.\n\n### Değişken: bir sayıyı hatırlayan kutu\n**Değişken**, oyunun bir sayıyı akılda tutmasını sağlar. `hiz` adlı değişken başlangıçta 0'dır. Bir olay onu büyütür, başka bir olay onu okur. Üç ayrı yer aynı kutuyu kullandığı için kutunun içindekini değiştirmek, hepsini birden değiştirir.\n\nDikkat: `[hiz] değişkenini [5] kadar değiştir` 5 ekler. `[hiz] değişkenini [5] yap` ise değeri 5'e sabitler, artmaz.\n\n### Zorluk nasıl hesaplanır?\nUzaylının hızı \"20 ile 45 arası rastgele sayı + `hiz`\" olarak hesaplanır. `hiz` her 4 saniyede 5 artar:\n\n| Saniye | `hiz` | En yavaş uzaylı | En hızlı uzaylı |\n|---|---|---|---|\n| 0-3 | 0 | 20 | 45 |\n| 4-7 | 5 | 25 | 50 |\n| 8-11 | 10 | 30 | 55 |\n| 28-29 | 35 | 55 | 80 |\n\nSüre 30 sn olduğundan `hiz` en fazla 7 kez artar: 7 × 5 = 35. Bu tabloyu çıkarmak, \"çok kolay mı, çok zor mu?\" sorusuna tahminle değil sayıyla cevap vermeni sağlar.\n\n### Süre bitince ne olur?\n`geri sayımı [30] saniyeden başlat` bloğu sayacı çalıştırır. Sayaç 0 olunca `süre bitince` olayı çalışır. Bu olayı yazmazsan oyun kaybedilerek biter. Biz \"30 saniye hayatta kal ve kazan\" kuralını seçtik. Olay bloğu başka bir olayın içine konmaz; çalışma alanında tek başına durur.\n\n### Özet\nTam bir oyun, birbirinden bağımsız küçük kuralların toplamıdır. Değişken bir sayıyı hatırlar ve birden çok olay aynı değişkeni okuyup yazabilir. `değiştir` ekleme yapar, `yap` değeri sabitler. Zamanla artan bir değişken, oyunu adım adım zorlaştırır ve artışı tabloyla hesaplayabilirsin.",
          "concepts": [
            {
              "term": "Değişken",
              "definition": "Bir sayıyı (ya da sprite'ı) hatırlayan, adı olan kutu; oyunun hafızasıdır.",
              "example": "`hiz` değişkeni 0'dan başlar, her 4 saniyede 5 artar ve uzaylının hızını hesaplamada kullanılır.",
              "pitfall": "Başlangıçta sıfırlayan bloğu silmek; değişkenin ilk değeri belirsiz kalır ve hesap yanlış çıkabilir."
            },
            {
              "term": "değiştir ile yap",
              "definition": "`kadar değiştir` mevcut değere ekler; `yap` değeri doğrudan o sayıya sabitler.",
              "example": "`hiz` 10 iken `[5] kadar değiştir` 15 yapar, `[5] yap` ise 5 yapar.",
              "pitfall": "Artış için `yap` kullanmak; değer hep aynı kalır ve zorluk hiç artmaz."
            },
            {
              "term": "Zamanlı olay",
              "definition": "`her N ms'de bir` olayı, belirli aralıkla tekrar tekrar çalışır.",
              "example": "`her 800 ms'de bir` uzaylı üretir, `her 4000 ms'de bir` zorluğu artırır.",
              "pitfall": "Milisaniyeyi saniye sanmak; 800 ms bir saniyenin sekizde biridir, 800 saniye değil."
            },
            {
              "term": "Geri sayım ve süre bitince",
              "definition": "Geri sayım sayacı belirli saniyeden 0'a doğru sayar; 0 olunca `süre bitince` olayı çalışır.",
              "example": "30 saniyelik sayaç bitince \"Dünya kurtuldu!\" yazılıp oyun kazanılır.",
              "pitfall": "`süre bitince` olayını yazmamak; oyun sürenin dolmasıyla kaybedilerek biter."
            },
            {
              "term": "Zorluk dengesi",
              "definition": "Oyunun ne çok kolay ne imkânsız olması; sayıları (hız, süre, artış) deneyerek ayarlarsın.",
              "example": "Artış 5 yerine 10 olursa 28. saniyede `hiz` 70 olur ve oyun oynanamaz.",
              "pitfall": "Zorluğu çok hızlı artırmak; oyun daha ilk saniyelerde oynanamaz hâle gelir."
            }
          ],
          "quiz": [
            {
              "id": "m11h6d27-q1",
              "kind": "mcq",
              "prompt": "Uzay savunmasında `süre bitince` olayını hiç yazmadın. 30 saniye dolunca ne olur?",
              "options": [
                "Oyun kazanılır",
                "Oyun kaybedilerek biter",
                "Hiçbir şey olmaz, oyun sürer",
                "Sayaç yeniden 30'dan başlar"
              ],
              "answer": 1,
              "explanation": "Süre bitince olayı yoksa oyun otomatik biter ve kaybedilir. \"Süre dolunca kazan\" kuralını istiyorsan olayı yazıp içine `oyunu bitir: kazandın` koymalısın.",
              "skills": [
                "oyun-zorluk",
                "oyun-olay"
              ]
            },
            {
              "id": "m11h6d27-q2",
              "kind": "numeric",
              "prompt": "`hiz` değişkeni 0'dan başlıyor ve `her 4000 ms'de bir` 5 artıyor. Uzaylının hızı `[20 ile 45 arası rastgele] + hiz`. `hiz` 35 olduğunda doğan bir uzaylının alabileceği EN DÜŞÜK hız kaç olur?",
              "answer": 55,
              "tolerance": 0,
              "unit": "hız",
              "explanation": "En düşük rastgele sayı 20'dir; 20 + 35 = 55. En yüksek sayı 45 + 35 = 80 olurdu. 35'i görmek için 7 artış gerekir: 7 × 4 sn = 28. saniyeden sonra.",
              "skills": [
                "oyun-zorluk",
                "oyun-degisken"
              ]
            },
            {
              "id": "m11h6d27-q3",
              "kind": "predict-output",
              "prompt": "Oyunda şu üç kural var. Oyunun 9. saniyesinde doğan uzaylının hızı kaç olur?\n\n```\nhiz = 0\nher 4000 ms'de bir:  hiz'i 5 kadar değiştir\nher 800 ms'de bir:   uzaylının hızı = 30 + hiz\n```",
              "options": [
                "30",
                "35",
                "40",
                "45"
              ],
              "answer": 2,
              "explanation": "4. ve 8. saniyede `hiz` 5 artar, 9. saniyede `hiz` = 10 olur. Uzaylının hızı 30 + 10 = 40. 12. saniyede üçüncü artış gelir; 9. saniyede henüz gelmemiştir, bu yüzden 45 değildir.",
              "skills": [
                "oyun-zorluk",
                "oyun-degisken"
              ]
            },
            {
              "id": "m11h6d27-q4",
              "kind": "find-bug",
              "prompt": "Oyun boyunca uzaylıların hızı hiç artmıyor. Hatalı satır hangisidir?\n\n```\noyun başlayınca:\n  hiz'i 0 yap\n\nher 4000 ms'de bir:\n  hiz'i 5 yap\n\nher 800 ms'de bir:\n  uzaylının hızı = rastgele(20, 45) + hiz\n```",
              "options": [
                "`hiz'i 0 yap` satırı",
                "`hiz'i 5 yap` satırı: değeri sabitliyor, üstüne eklemiyor",
                "`her 800 ms'de bir` satırı",
                "`rastgele(20, 45)` satırı"
              ],
              "answer": 1,
              "explanation": "`yap` değeri doğrudan 5'e eşitler; `hiz` her seferinde 5 olur ve artmaz. Doğrusu `hiz'i 5 kadar değiştir`. Başlangıçta 0 yapmak doğrudur, rastgele aralık ve 800 ms'lik üretim de hatalı değildir.",
              "skills": [
                "oyun-degisken",
                "oyun-hata"
              ]
            },
            {
              "id": "m11h6d27-q5",
              "kind": "mcq",
              "prompt": "Uzay savunmasında Mermi-Düşman çarpışma olayını sildin. Oyunda başka ne olur?",
              "options": [
                "Oyun hiç açılmaz",
                "Süre sayacı da durur",
                "Uzaylılar üretilmez",
                "Can ve süre kuralları çalışmaya devam eder, ama lazer artık uzaylıyı vurmaz"
              ],
              "answer": 3,
              "explanation": "Her kural kendi olayında yaşar. Vurma olayı silinince yalnız skor ve patlama kalkar; uzaylı üretimi, can olayı ve süre kuralları kendi bloklarında olduğu için çalışır.",
              "skills": [
                "oyun-olay",
                "oyun-iskelet"
              ]
            }
          ],
          "contentEn": {
            "title": "Full game 1: Space defence",
            "problem": "In space games, waves of enemies get faster over time, the player's time is limited, and in the end you either win or lose. None of this needs a new block: they are all pieces you have learnt before. In this lesson you will put them together to make a timed game that keeps getting harder.",
            "contentMd": "### What is ready\nIn the night sky there is a ship at the bottom. It goes left and right with the arrow keys and fires a laser with A. Every 800 ms an alien comes down from a random place at the top. The score is 0 and lives are 3. There is also a variable called `speed` (speed), which starts at 0. The collision rules for the laser and the aliens, lives, time and difficulty are not there yet.\n\n### Four jobs\n| Job | Which lesson you learnt it in |\n|---|---|\n| Score when the laser hits an alien | 19 |\n| Lives when an alien touches the ship | 9 |\n| A 30-second time limit | New: `countdown` |\n| Aliens that get faster over time | New: changing a variable |\n\n### Build the blocks: hitting and lives\n1. Build the `when a [Bullet] sprite hits a [Enemy] sprite` event. Inside it, put `change score by [10]`, `play melody [boom]`, `make [other sprite] explode`, `delete sprite [this sprite]`.\n2. Build the `when a [Player] sprite hits a [Enemy] sprite` event. Inside it, put `change lives by [-1]`, `shake screen for [250] ms`, `delete sprite [other sprite]`.\n3. Press ↺. Shoot the aliens with the laser; when an alien touches the ship, you lose a life.\n\n### Build the blocks: time\n4. From the **Game** category, add the `start countdown from [30] seconds` block at the very bottom inside `when game starts`. The time left appears in the middle at the top of the stage; in the last 5 seconds it turns yellow.\n5. From the **Game** category, build the `when time runs out` event. Inside it, put `show [Earth is saved!] on screen for [2] seconds` and `end game: [you win]`.\n\n### Build the blocks: difficulty\n6. From the **Game** category, take the `every [4000] ms` event. Inside it, snap the `change [speed] by [5]` block from the **Variables** category.\n7. Find the ready-made `every [800] ms` event. In the y slot of the `set [ufo] speed x [0] y [random]` block inside it, put an addition block (`[ ] + [ ]`): put the old random number block on its left and the `speed` variable on its right. Every 4 seconds, the aliens come down a little faster.\n8. Press ↺ and play the full game. If you survive for 30 seconds you win; if your lives run out you lose.\n\nExpected result: all five goals ✓. The laser hits, lives go down when an alien touches the ship, the counter counts down from 30, the game is won when the time runs out, and the aliens get faster over time.\n\n### How does it work?\n- The `when time runs out` event runs when the countdown reaches 0. If you do not write this event, the game ends by itself when the time is up (you lose). We chose the rule \"win when the time is up\".\n- `speed` is a **variable**: it remembers a number. Every 4 seconds it goes up by 5. At 28 seconds it is 35. Because the alien's speed is worked out by adding `speed` to a random number between 20 and 45, it is 20-45 at the start and about 55-80 at the end.\n- Three events use the same `speed` variable: one sets it to zero at the start, one raises it over time, and one works out the alien's speed. Shared numbers like this are like the game's \"adjustment knobs\".\n- The three rules (hitting, lives, time) are independent; if you switch one off, the others keep working.\n\n### Try it\n1. Change the increase from 5 to 2, then to 10. Which one is more balanced?\n2. Set the time to 60 seconds; does the game get boring when the difficulty increase is not enough?\n3. Add a new `every [4000] ms` event that makes a second alien every 4 seconds. Does the game get more crowded?\n4. Add a winning rule for when the score reaches 100 as well.\n\n### Common mistakes\n- Deleting the ready-made block that sets `speed` to 0 at the start: the variable's first value is unknown, and the alien speed calculation can come out wrong. Leave that block where it is.\n- Writing only `speed` in the alien's speed block instead of an addition: the aliens do not move at all at the start.\n- Putting the `when time runs out` block inside another event: events only stand on their own.\n- Increasing the difficulty too fast: the game becomes impossible to play by the 10th second. Game design is partly trial and error.",
            "question": "What was the most fun moment in this game: the first minute, or the last 5 seconds? Why does difficulty that grows over time make a game more gripping?",
            "explainerMd": "### What you will learn in this lesson\n- How to combine three independent rules (hitting, lives, time) in one game\n- How to use a **variable** like an adjustment knob for the game\n- How a timed event (`every 4000 ms`) makes the game harder over time\n- How to work out the difficulty increase and balance it\n\n### What you should know first\n- The game skeleton, score, lives and winning rule (lesson 26)\n- The collision event: `when a [Bullet] hits a [Enemy]` and deleting sprites\n- Moving with the arrow keys and the `every … ms` event (lessons in weeks 1-4)\n\n### A game is the sum of small rules\nSpace defence looks big, but there is no new idea in it. Four small rules sit side by side:\n\n| Rule | Event | Result |\n|---|---|---|\n| Hitting | Bullet hits Enemy | Score +10, the alien explodes |\n| Lives | Player hits Enemy | Lives -1, the screen shakes |\n| Time | When time runs out | The game is won |\n| Difficulty | Every 4000 ms | `speed` goes up by 5 |\n\nEach rule lives in its own event. If you delete one, the others keep working. That is why you build a big game rule by rule, not all at once, and test each rule with ↺.\n\n### A variable: a box that remembers a number\nA **variable** lets the game keep a number in mind. The variable called `speed` starts at 0. One event makes it bigger, and another event reads it. Because three separate places use the same box, changing what is in the box changes all of them at once.\n\nWatch out: `change [speed] by [5]` adds 5. `set [speed] to [5]`, on the other hand, fixes the value at 5; it does not go up.\n\n### How is the difficulty worked out?\nThe alien's speed is worked out as \"a random number between 20 and 45 + `speed`\". `speed` goes up by 5 every 4 seconds:\n\n| Second | `speed` | Slowest alien | Fastest alien |\n|---|---|---|---|\n| 0-3 | 0 | 20 | 45 |\n| 4-7 | 5 | 25 | 50 |\n| 8-11 | 10 | 30 | 55 |\n| 28-29 | 35 | 55 | 80 |\n\nBecause the time is 30 s, `speed` goes up at most 7 times: 7 × 5 = 35. Making this table lets you answer the question \"is it too easy or too hard?\" with numbers instead of a guess.\n\n### What happens when the time runs out?\nThe `start countdown from [30] seconds` block starts the counter. When the counter reaches 0, the `when time runs out` event runs. If you do not write this event, the game ends as a loss. We chose the rule \"survive for 30 seconds and win\". An event block is not put inside another event; it stands on its own in the workspace.\n\n### Summary\nA full game is the sum of small, independent rules. A variable remembers a number, and several events can read and write the same variable. `change` adds, `set` fixes the value. A variable that grows over time makes the game harder step by step, and you can work out the increase with a table.",
            "concepts": [
              {
                "term": "Variable",
                "definition": "A box with a name that remembers a number (or a sprite); it is the game's memory.",
                "example": "The `speed` variable starts at 0, goes up by 5 every 4 seconds and is used to work out the alien's speed.",
                "pitfall": "Deleting the block that sets it to zero at the start; the variable's first value is unknown and the calculation can come out wrong."
              },
              {
                "term": "change and set",
                "definition": "`change by` adds to the current value; `set` fixes the value directly at that number.",
                "example": "When `speed` is 10, `change by [5]` makes it 15, but `set to [5]` makes it 5.",
                "pitfall": "Using `set` for an increase; the value always stays the same and the difficulty never goes up."
              },
              {
                "term": "Timed event",
                "definition": "The `every N ms` event runs again and again at a set interval.",
                "example": "`every 800 ms` makes an alien, and `every 4000 ms` raises the difficulty.",
                "pitfall": "Thinking milliseconds are seconds; 800 ms is less than a second, not 800 seconds."
              },
              {
                "term": "Countdown and when time runs out",
                "definition": "The countdown counter counts from a set number of seconds down to 0; at 0 the `when time runs out` event runs.",
                "example": "When the 30-second counter runs out, \"Earth is saved!\" appears and the game is won.",
                "pitfall": "Not writing the `when time runs out` event; the game ends as a loss when the time is up."
              },
              {
                "term": "Difficulty balance",
                "definition": "The game being neither too easy nor impossible; you adjust the numbers (speed, time, increase) by trying them.",
                "example": "If the increase is 10 instead of 5, `speed` is 70 at 28 seconds and the game is impossible to play.",
                "pitfall": "Increasing the difficulty too fast; the game becomes impossible to play in the first few seconds."
              }
            ],
            "quiz": [
              {
                "id": "m11h6d27-q1",
                "kind": "mcq",
                "prompt": "In space defence, you never wrote the `when time runs out` event. What happens when the 30 seconds are up?",
                "options": [
                  "The game is won",
                  "The game ends as a loss",
                  "Nothing happens, and the game goes on",
                  "The counter starts again from 30"
                ],
                "answer": 1,
                "explanation": "If there is no when time runs out event, the game ends automatically and is lost. If you want the rule \"win when the time is up\", you must write the event and put `end game: you win` inside it.",
                "skills": [
                  "oyun-zorluk",
                  "oyun-olay"
                ]
              },
              {
                "id": "m11h6d27-q2",
                "kind": "numeric",
                "prompt": "The `speed` variable starts at 0 and goes up by 5 `every 4000 ms`. The alien's speed is `[random from 20 to 45] + speed`. When `speed` is 35, what is the LOWEST speed an alien that appears can have?",
                "answer": 55,
                "tolerance": 0,
                "unit": "speed",
                "explanation": "The lowest random number is 20; 20 + 35 = 55. The highest would be 45 + 35 = 80. To reach 35 you need 7 increases: after 7 × 4 s = 28 seconds.",
                "skills": [
                  "oyun-zorluk",
                  "oyun-degisken"
                ]
              },
              {
                "id": "m11h6d27-q3",
                "kind": "predict-output",
                "prompt": "The game has these three rules. What is the speed of an alien that appears at the 9th second of the game?\n\n```\nhiz = 0\nevery 4000 ms:  change hiz by 5\nevery 800 ms:   alien speed = 30 + hiz\n```",
                "options": [
                  "30",
                  "35",
                  "40",
                  "45"
                ],
                "answer": 2,
                "explanation": "At 4 and 8 seconds `speed` goes up by 5, so at 9 seconds `speed` = 10. The alien's speed is 30 + 10 = 40. The third increase comes at 12 seconds; at 9 seconds it has not come yet, so it is not 45.",
                "skills": [
                  "oyun-zorluk",
                  "oyun-degisken"
                ]
              },
              {
                "id": "m11h6d27-q4",
                "kind": "find-bug",
                "prompt": "The aliens' speed never goes up during the game. Which line is wrong?\n\n```\nwhen game starts:\n  set hiz to 0\n\nevery 4000 ms:\n  set hiz to 5\n\nevery 800 ms:\n  alien speed = random(20, 45) + hiz\n```",
                "options": [
                  "The `set speed to 0` line",
                  "The `set speed to 5` line: it fixes the value instead of adding to it",
                  "The `every 800 ms` line",
                  "The `random(20, 45)` line"
                ],
                "answer": 1,
                "explanation": "`set` makes the value equal to 5 directly; `speed` is 5 every time and does not go up. The right block is `change speed by 5`. Setting it to 0 at the start is correct, and the random range and the making every 800 ms are not wrong either.",
                "skills": [
                  "oyun-degisken",
                  "oyun-hata"
                ]
              },
              {
                "id": "m11h6d27-q5",
                "kind": "mcq",
                "prompt": "In space defence, you deleted the Bullet-Enemy collision event. What else happens in the game?",
                "options": [
                  "The game does not open at all",
                  "The time counter stops too",
                  "No aliens are made",
                  "The lives and time rules keep working, but the laser no longer hits the aliens"
                ],
                "answer": 3,
                "explanation": "Each rule lives in its own event. When the hit event is deleted, only the score and the explosion go; making aliens, the lives event and the time rules keep working because they are in their own blocks.",
                "skills": [
                  "oyun-olay",
                  "oyun-iskelet"
                ]
              }
            ]
          }
        },
        {
          "title": "Tam oyun 2: Labirent kaçışı",
          "durationMin": 30,
          "problem": "Eski bir hazine odasında kapı kilitli. Anahtar labirentin öbür ucunda ve seni duvarlardan geçebilen bir hayalet kovalıyor. Anahtarı alıp kapıya ulaşırsan kazanırsın. Ama oyun anahtarı alıp almadığını nereden bilecek? Bu derste oyuna bir \"hafıza\" ekleyeceksin.",
          "contentMd": "### Hazır olan\n20 x 9 karoluk bir labirent yüklü. Kedi sol üstte başlıyor, ok tuşlarıyla yürüyor ve kamera onu izliyor. Sağ üstte bir anahtar, sağ altta bir kapı var. Labirentin ortasından bir hayalet kediyi takip ediyor; hayalet duvarlardan geçiyor. Skor 0, can 3. `anahtarVar` adlı bir değişken 0 olarak hazır.\n\n### Hafıza: durum değişkeni\n`anahtarVar` değişkeni oyunun \"anahtar alındı mı?\" sorusunun cevabını tutar: 0 hayır, 1 evet. Bu tür değişkenlere **bayrak** denir.\n\n### Blokları kur: anahtar\n1. `bir [Oyuncu] sprite'ı [Anahtar] karosuna dokununca` olayı kur.\n2. İçine `sütun [olay karosunun sütunu] satır [olay karosunun satırı] karosunu boşalt`, `[anahtarVar] değişkenini [1] yap`, `skoru [10] değiştir` ve `[puan] melodisini çal` ekle.\n3. ↺ bas. Anahtar karosuna git: anahtar kayboluyor.\n\n### Blokları kur: kapı\n4. `bir [Oyuncu] sprite'ı [Kapı] karosuna dokununca` olayı kur.\n5. İçine iki kollu `eğer ... ise ... değilse ...` bloğu koy. Koşul: `[anahtarVar] = [1]`.\n6. `ise` kolu: `ekranda [Kaçtın!] yaz, [2] saniye`, `[zafer] melodisini çal`, `oyunu bitir: [kazandın]`.\n7. `değilse` kolu: `ekranda [Kilitli!] yaz, [1] saniye`.\n8. ↺ bas. Önce anahtarsız kapıya git: \"Kilitli!\" yazıyor. Sonra anahtarı al ve kapıya dön: oyun kazanılıyor.\n\n### Blokları kur: hayalet\n9. `bir [Oyuncu] sprite'ı bir [Düşman] sprite'ına çarpınca` olayı kur. İçine `canı [-1] değiştir`, `ekranı [250] ms salla`, `[bu sprite] sprite'ını sütun [1] satır [1] karosuna koy` ve `[diğer sprite] sprite'ını sütun [10] satır [5] karosuna koy` yaz. Hayalet kediyi yakalarsa ikisi de başa dönüyor.\n10. ↺ bas ve tam oyunu oyna.\n\nBeklenen sonuç: Beş hedefin hepsi ✓. Anahtar toplanıyor, kapı anahtarsız açılmıyor, anahtarla açılıyor, hayalet kediyi kovalıyor ve yakalarsa can azalıyor.\n\n### Nasıl çalışıyor?\n- Bayrak değişkeni (anahtarVar) iki olay arasındaki köprüdür: anahtar olayı yazar, kapı olayı okur.\n- Kapıdaki `eğer` iki yolu ayırır: anahtar varsa kazan, yoksa uyar. `değilse` kolu olmasaydı kapıya anahtarsız gitmek hiçbir şey söylemezdi.\n- Hayalet \"duvarlardan geçsin\" ayarıyla yapıldığı için labirent onu engellemez; hız 14, kedi hızı 60 olduğu için kedi kovalamacadan kaçabilir.\n- Harita kenarlarındaki duvarlar kedi için engel, hayalet için değil.\n- Hayalet kediyi yakalayınca ikisini de başlangıç yerlerine koyuyoruz. Böylece oyuncu hemen yeniden yakalanmaz ve nefes alır.\n\n### Dene\n1. Hayaleti yavaşlat (10) ve hızlandır (30). Hangisi dengeli?\n2. İkinci bir anahtar ve ikinci bir kapı ekle: **Harita** sekmesinde karoları boya. İki bayrak değişkeni kullan.\n3. Anahtar alınınca \"Anahtarı aldın!\" mesajı yaz.\n4. Hayalet kediyi 3 kez yakalarsa oyun kaybedilir; bunu `can bitince` olayına `oyunu bitir: [kaybettin]` yazarak kendin belirle.\n\n### Sık yapılan hatalar\n- `anahtarVar` değişkenini anahtarı alırken 1 yapmamak: kapı hep \"Kilitli!\" der.\n- Kapıda `eğer anahtarVar = 1` kontrolünü yanlış değişkenle yazmak: değişken adları birbirine benzerse bayrak okunmaz.\n- Hazır gelen `[anahtarVar] değişkenini [0] yap` bloğunu silmek: bayrağın ilk değeri belirsiz kalır. Bayrağı hep başlangıçta açıkça 0 yap.\n- Kediyi başa koyarken sütun/satır yerine piksel yazmak: blok karo numarası ister.",
          "question": "Bayrak değişkenleri başka hangi oyun kurallarında işe yarar? Örneğin \"çift zıplama hakkı var mı?\", \"boss yenildi mi?\", \"gizli oda bulundu mu?\" gibi sorular için hangi bayraklar gerekir?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Oyuna \"hafıza\" veren **bayrak** değişkenini\n- `eğer … ise … değilse` ile iki yoldan birini seçmeyi\n- Karo (sütun-satır) koordinatı ile piksel koordinatı arasındaki farkı\n- Duvardan geçen bir takipçinin oyunu nasıl heyecanlandırdığını\n\n### Önceden bilmen gerekenler\n- Değişken, `değiştir` ve `yap` farkı (27. ders)\n- Harita, karo ve karoya dokununca olayı (3. hafta dersleri)\n- Takip eden düşman ve kamera takibi (4. hafta dersleri)\n\n### Oyun anahtarı nereden hatırlar?\nKedi anahtara dokunuyor, biraz sonra kapıya geliyor. Kapı olayı çalıştığında anahtarın az önce alındığını nereden bilecek? İki olay birbirini görmez; ortak bir yere not bırakmaları gerekir.\n\nBu not bir **bayrak** değişkenidir: `anahtarVar`. Sadece iki değer alır: 0 (hayır) ve 1 (evet). Anahtar olayı bayrağı 1 yapar, kapı olayı bayrağı okur.\n\n```\noyun başlayınca:        anahtarVar = 0\nanahtar karosuna dokununca:  anahtarVar = 1\nkapı karosuna dokununca:     eğer anahtarVar = 1 ise kazan, değilse \"Kilitli!\"\n```\n\n### İki yollu karar\n`eğer … ise` bloğu yalnız \"evet\" yolunu çalıştırır. `değilse` kolu ekleyince \"hayır\" için de ne olacağını söylersin. Kapıda bu şart: anahtar yoksa oyuncu bir şey öğrenmeli; yoksa kapı neden açılmadığını anlatmayan bir duvar gibi durur.\n\n### Karo mu, piksel mi?\nHarita 16 piksellik karolardan oluşur. Bu oyundaki labirent 20 sütun ve 9 satırdır, yani 320 × 144 piksel. Ekran ise yalnız 160 × 120 pikseldir; bu yüzden kamera kediyi takip eder.\n\n`sütun [1] satır [1] karosuna koy` karo numarası ister ve numaralar 0'dan başlar. Bir karonun ortasının piksel konumu:\n\n```\nx = sütun × 16 + 8\ny = satır × 16 + 8\n```\n\nSütun 1, satır 1 için x = 24, y = 24 olur. Piksel yerine karo bloğuna piksel sayısı yazarsan sprite haritanın çok dışına gider.\n\n### Takipçi ve hız\nHayalet `ghost` ayarındadır; duvarlardan geçer. Buna karşılık hızı 14, kedinin hızı 60 piksel/sn. Hayalet kediye hep yaklaşır ama kedi koşarak kolayca uzaklaşır. Oyuncuyu zorlayan şey hayaletin hızı değil, labirentin duvarları ve kediyi köşeye sıkıştırma ihtimalidir.\n\nHayalet kediyi yakalarsa ikisi de başlangıç karosuna döner. Böylece oyuncu hemen yeniden yakalanmaz.\n\n### Özet\nBayrak değişkeni (0 ya da 1) iki olay arasında bilgi taşır. `eğer … ise … değilse` iki ihtimalin ikisine de cevap verir. Karo numaraları 0'dan başlar ve 16 ile çarpılıp 8 eklenince piksel ortasına dönüşür. Takipçinin hızı, oyunun adil mi zor mu olduğunu belirler.",
          "concepts": [
            {
              "term": "Bayrak değişkeni",
              "definition": "Yalnız iki durumu (0 hayır, 1 evet) tutan değişken; bir olayın sonucunu başka olaya taşır.",
              "example": "`anahtarVar` anahtar alınınca 1 olur; kapı olayı bunu okuyup kapıyı açar.",
              "pitfall": "Bayrağı başlangıçta 0 yapmamak; ilk değeri belirsiz kalır ve kapı bazen beklenmedik açılır."
            },
            {
              "term": "eğer … ise … değilse",
              "definition": "Koşul doğruysa bir kolu, yanlışsa diğer kolu çalıştıran iki yollu karar bloğu.",
              "example": "Kapıda `anahtarVar = 1` ise \"Kaçtın!\" yazılıp oyun kazanılır, değilse \"Kilitli!\" yazılır.",
              "pitfall": "`değilse` kolunu boş bırakmak; anahtarsız kapıya gelen oyuncu hiçbir şey görmez."
            },
            {
              "term": "Karo koordinatı",
              "definition": "Haritadaki yeri sütun ve satır numarasıyla gösterir; numaralar 0'dan başlar ve bir karo 16 pikseldir.",
              "example": "Sütun 18, satır 7 karosunun ortası x = 18 × 16 + 8 = 296, y = 7 × 16 + 8 = 120 pikseldir.",
              "pitfall": "Karo bloğuna piksel yazmak; sprite haritanın çok dışına konur."
            },
            {
              "term": "Duvardan geçen sprite (ghost)",
              "definition": "Duvarlar için engel olmayan, haritayı yok sayarak gidebilen sprite ayarı.",
              "example": "Labirentteki hayalet, kediyi en kısa yoldan takip eder.",
              "pitfall": "Hayaleti çok hızlı yapmak; kedi kaçamaz ve oyun adil olmaktan çıkar."
            },
            {
              "term": "Olaylar arası köprü",
              "definition": "İki ayrı olayın birbirini göremediği durumda ortak bir değişkenle haberleşmesi.",
              "example": "Anahtar olayı `anahtarVar` değişkenine yazar, kapı olayı aynı değişkenden okur.",
              "pitfall": "İki olayda biraz farklı adlı iki değişken kullanmak; biri yazılır, diğeri okunur ve bayrak hiç çalışmaz."
            }
          ],
          "quiz": [
            {
              "id": "m11h6d28-q1",
              "kind": "mcq",
              "prompt": "Aşağıdakilerden hangisi için bayrak değişkeni (0 ya da 1) uygun bir seçimdir?",
              "options": [
                "Patron düşmanın yenilip yenilmediği",
                "Kedinin x konumu",
                "Kalan süre",
                "Skor"
              ],
              "answer": 0,
              "explanation": "Bayrak yalnız \"evet/hayır\" tutar. Patron yenildi mi sorusunun cevabı iki değerlidir. x konumu, süre ve skor ise çok sayıda değer alan sayılardır; bunlar için normal değişken ya da hazır oyun bloğu kullanılır.",
              "skills": [
                "oyun-degisken"
              ]
            },
            {
              "id": "m11h6d28-q2",
              "kind": "numeric",
              "prompt": "Kapı karosu 18. sütunda ve 7. satırda (numaralar 0'dan başlıyor, bir karo 16 piksel). Kapı karosunun ortasının x konumu kaç pikseldir?",
              "answer": 296,
              "tolerance": 0,
              "unit": "piksel",
              "explanation": "x = sütun × 16 + 8 = 18 × 16 + 8 = 288 + 8 = 296. Yalnız 18 × 16 = 288 yazmak karonun sol kenarını verir; ortası için yarım karo (8) eklenir.",
              "skills": [
                "oyun-harita"
              ]
            },
            {
              "id": "m11h6d28-q3",
              "kind": "predict-output",
              "prompt": "Oyuncu önce kapıya, sonra anahtara, sonra tekrar kapıya dokunuyor. Ekranda sırasıyla hangi yazılar çıkar?\n\n```\noyun başlayınca:  anahtarVar = 0\nanahtara dokununca:  anahtarVar = 1\nkapıya dokununca:\n  eğer anahtarVar = 1 ise: \"Kaçtın!\" yaz, oyunu kazan\n  değilse: \"Kilitli!\" yaz\n```",
              "options": [
                "Kaçtın!, Kaçtın!",
                "Kilitli!, Kaçtın!",
                "Kilitli!, Kilitli!",
                "Kaçtın!, Kilitli!"
              ],
              "answer": 1,
              "explanation": "İlk kapı dokunuşunda anahtarVar 0'dır: \"Kilitli!\" çıkar. Anahtardan sonra 1 olur; ikinci dokunuşta \"Kaçtın!\" çıkar ve oyun kazanılır. Sıra tersine olsaydı iki yazı da yer değiştirirdi.",
              "skills": [
                "oyun-kosul",
                "oyun-degisken"
              ]
            },
            {
              "id": "m11h6d28-q4",
              "kind": "find-bug",
              "prompt": "Anahtarı alıp kapıya gidiyorsun ama kapı hep \"Kilitli!\" diyor. Hatalı satır hangisi?\n\n```\noyun başlayınca:        anahtarVar = 0\nanahtara dokununca:     anahtarVar = 0   <- A\n                        skoru 10 değiştir\nkapıya dokununca:       eğer anahtarVar = 1 ise kazan  <- B\n                        değilse \"Kilitli!\" yaz         <- C\n```",
              "options": [
                "A satırı: anahtar alınırken bayrak 0 bırakılıyor, 1 yapılmalı",
                "B satırı: koşul 0 olmalı",
                "C satırı: `değilse` kolu fazla",
                "Başlangıçtaki `anahtarVar = 0` satırı"
              ],
              "answer": 0,
              "explanation": "Anahtar olayı bayrağı 1 yapmalıdır; burada yine 0 yazıyor, kapı hep \"anahtar yok\" der. B satırı doğru: koşul 1'i arıyor. C satırı gerekli bir geri bildirim. Başlangıçta 0 yapmak da doğrudur.",
              "skills": [
                "oyun-degisken",
                "oyun-hata"
              ]
            },
            {
              "id": "m11h6d28-q5",
              "kind": "numeric",
              "prompt": "Hayalet duvarlardan geçer ve kediyi saniyede 14 piksel hızla takip ediyor. Kedi durmuş; aralarında 84 piksel var. Hayalet kaç saniyede kediye ulaşır?",
              "answer": 6,
              "tolerance": 0,
              "unit": "sn",
              "explanation": "Süre = yol ÷ hız = 84 ÷ 14 = 6 saniye. Kedinin hızı 60 olsaydı kedi kaçabilirdi; bu oyunda kedi hayaletten 4 katından fazla hızlıdır (60 ÷ 14 ≈ 4,3).",
              "skills": [
                "oyun-zorluk",
                "oyun-harita"
              ]
            }
          ],
          "contentEn": {
            "title": "Full game 2: Maze escape",
            "problem": "In an old treasure room, the door is locked. The key is at the other end of the maze, and a ghost that can pass through walls is chasing you. If you take the key and reach the door, you win. But how will the game know whether you took the key? In this lesson you will add a \"memory\" to the game.",
            "contentMd": "### What is ready\nA maze of 20 x 9 tiles is loaded. The cat starts at the top left, walks with the arrow keys, and the camera follows it. There is a key at the top right and a door at the bottom right. From the middle of the maze, a ghost follows the cat; the ghost passes through walls. The score is 0 and lives are 3. A variable called `anahtarVar` (has key) is ready, set to 0.\n\n### Memory: a state variable\nThe `anahtarVar` variable holds the answer to the game's question \"has the key been taken?\": 0 is no, 1 is yes. Variables like this are called **flags**.\n\n### Build the blocks: the key\n1. Build a `when a [Player] sprite touches tile [Key]` event.\n2. Inside it, add `clear tile at column [event tile column] row [event tile row]`, `set [anahtarVar] to [1]`, `change score by [10]` and `play melody [point]`.\n3. Press ↺. Go to the key tile: the key disappears.\n\n### Build the blocks: the door\n4. Build a `when a [Player] sprite touches tile [Door]` event.\n5. Inside it, put a two-branch `if ... do ... else ...` block. The condition: `[anahtarVar] = [1]`.\n6. The `do` branch: `show [You escaped!] on screen for [2] seconds`, `play melody [victory]`, `end game: [you win]`.\n7. The `else` branch: `show [Locked!] on screen for [1] seconds`.\n8. Press ↺. First go to the door without the key: \"Locked!\" appears. Then take the key and go back to the door: the game is won.\n\n### Build the blocks: the ghost\n9. Build a `when a [Player] sprite hits a [Enemy] sprite` event. Inside it, write `change lives by [-1]`, `shake screen for [250] ms`, `put sprite [this sprite] on tile column [1] row [1]` and `put sprite [other sprite] on tile column [10] row [5]`. If the ghost catches the cat, they both go back to the start.\n10. Press ↺ and play the full game.\n\nExpected result: all five goals ✓. The key is collected, the door does not open without the key and opens with it, the ghost chases the cat, and if it catches it a life is lost.\n\n### How does it work?\n- The flag variable (anahtarVar) is the bridge between two events: the key event writes it and the door event reads it.\n- The `if` at the door separates two paths: if you have the key, you win; if not, you get a warning. Without the `else` branch, going to the door without the key would tell you nothing.\n- Because the ghost is made with the \"go through walls\" setting, the maze does not stop it; its speed is 14 and the cat's is 60, so the cat can escape the chase.\n- The walls around the edges of the map are an obstacle for the cat, but not for the ghost.\n- When the ghost catches the cat, we put both of them back in their starting places. This way the player is not caught again straight away and gets a breather.\n\n### Try it\n1. Slow the ghost down (10) and speed it up (30). Which one is balanced?\n2. Add a second key and a second door: paint the tiles in the **Map** tab. Use two flag variables.\n3. When the key is taken, show the message \"You got the key!\".\n4. The game is lost if the ghost catches the cat 3 times; decide this yourself by writing `end game: [you lose]` in the `when lives run out` event.\n\n### Common mistakes\n- Not setting the `anahtarVar` variable to 1 when the key is taken: the door always says \"Locked!\".\n- Writing the `if anahtarVar = 1` check at the door with the wrong variable: if variable names look alike, the flag is not read.\n- Deleting the ready-made `set [anahtarVar] to [0]` block: the flag's first value is unknown. Always set the flag clearly to 0 at the start.\n- Typing pixels instead of column/row when putting the cat back at the start: the block wants a tile number.",
            "question": "In which other game rules are flag variables useful? For example, which flags would you need for questions such as \"is there a double jump left?\", \"has the boss been beaten?\", \"has the secret room been found?\"",
            "explainerMd": "### What you will learn in this lesson\n- The **flag** variable, which gives a game \"memory\"\n- How to choose one of two paths with `if … do … else`\n- The difference between tile (column-row) coordinates and pixel coordinates\n- How a chaser that passes through walls makes a game exciting\n\n### What you should know first\n- Variables, and the difference between `change` and `set` (lesson 27)\n- The map, tiles and the touches tile event (week 3 lessons)\n- Enemies that follow, and the camera following (week 4 lessons)\n\n### How does the game remember the key?\nThe cat touches the key, and a little later it comes to the door. When the door event runs, how will it know the key was taken a moment ago? The two events cannot see each other; they need to leave a note in a shared place.\n\nThis note is a **flag** variable: `anahtarVar`. It only takes two values: 0 (no) and 1 (yes). The key event sets the flag to 1, and the door event reads the flag.\n\n```\nwhen game starts:        anahtarVar = 0\nwhen touching key tile:  anahtarVar = 1\nwhen touching door tile: if anahtarVar = 1 do win, else \"Locked!\"\n```\n\n### A two-way decision\nThe `if … do` block only runs the \"yes\" path. When you add an `else` branch, you also say what happens for \"no\". At the door this is a must: if there is no key, the player should learn something; otherwise the door just stands there like a wall that does not explain why it will not open.\n\n### Tile or pixel?\nThe map is made of 16-pixel tiles. The maze in this game is 20 columns by 9 rows, that is 320 × 144 pixels. The screen is only 160 × 120 pixels; that is why the camera follows the cat.\n\n`put on tile column [1] row [1]` wants a tile number, and the numbers start from 0. The pixel position of the middle of a tile is:\n\n```\nx = column × 16 + 8\ny = row × 16 + 8\n```\n\nFor column 1, row 1, x = 24 and y = 24. If you type a pixel number into the tile block instead, the sprite goes far off the map.\n\n### The chaser and speed\nThe ghost has the `ghost` setting (go through walls); it passes through walls. On the other hand, its speed is 14 and the cat's speed is 60 pixels/s. The ghost always gets closer to the cat, but the cat can easily get away by running. What makes things hard for the player is not the ghost's speed, but the maze walls and the chance of the cat being cornered.\n\nIf the ghost catches the cat, they both go back to their starting tiles. This way the player is not caught again straight away.\n\n### Summary\nA flag variable (0 or 1) carries information between two events. `if … do … else` gives an answer for both possibilities. Tile numbers start from 0, and multiplying by 16 and adding 8 turns them into the middle pixel. The chaser's speed decides whether the game is fair or hard.",
            "concepts": [
              {
                "term": "Flag variable",
                "definition": "A variable that only holds two states (0 no, 1 yes); it carries the result of one event to another event.",
                "example": "`anahtarVar` becomes 1 when the key is taken; the door event reads it and opens the door.",
                "pitfall": "Not setting the flag to 0 at the start; its first value is unknown and the door sometimes opens unexpectedly."
              },
              {
                "term": "if … do … else",
                "definition": "A two-way decision block that runs one branch if the condition is true and the other branch if it is false.",
                "example": "At the door, if `anahtarVar = 1`, \"You escaped!\" appears and the game is won; otherwise \"Locked!\" appears.",
                "pitfall": "Leaving the `else` branch empty; a player who comes to the door without the key sees nothing."
              },
              {
                "term": "Tile coordinates",
                "definition": "Shows a place on the map with a column and a row number; the numbers start from 0 and a tile is 16 pixels.",
                "example": "The middle of the tile at column 18, row 7 is at x = 18 × 16 + 8 = 296, y = 7 × 16 + 8 = 120 pixels.",
                "pitfall": "Typing pixels into the tile block; the sprite is put far off the map."
              },
              {
                "term": "A sprite that goes through walls (ghost)",
                "definition": "A sprite setting for which walls are no obstacle, so it can move while ignoring the map.",
                "example": "The ghost in the maze follows the cat by the shortest route.",
                "pitfall": "Making the ghost too fast; the cat cannot escape and the game stops being fair."
              },
              {
                "term": "A bridge between events",
                "definition": "Two separate events that cannot see each other communicating through a shared variable.",
                "example": "The key event writes to the `anahtarVar` variable, and the door event reads from the same variable.",
                "pitfall": "Using two variables with slightly different names in the two events; one is written, the other is read, and the flag never works."
              }
            ],
            "quiz": [
              {
                "id": "m11h6d28-q1",
                "kind": "mcq",
                "prompt": "For which of these is a flag variable (0 or 1) a good choice?",
                "options": [
                  "Whether the boss enemy has been beaten",
                  "The cat's x position",
                  "The time left",
                  "The score"
                ],
                "answer": 0,
                "explanation": "A flag only holds \"yes/no\". The answer to the question \"has the boss been beaten?\" has two values. The x position, time and score are numbers that take lots of values; for those you use a normal variable or a ready-made game block.",
                "skills": [
                  "oyun-degisken"
                ]
              },
              {
                "id": "m11h6d28-q2",
                "kind": "numeric",
                "prompt": "The door tile is in column 18 and row 7 (the numbers start from 0, a tile is 16 pixels). What is the x position of the middle of the door tile, in pixels?",
                "answer": 296,
                "tolerance": 0,
                "unit": "pixels",
                "explanation": "x = column × 16 + 8 = 18 × 16 + 8 = 288 + 8 = 296. Writing only 18 × 16 = 288 gives the left edge of the tile; for the middle, add half a tile (8).",
                "skills": [
                  "oyun-harita"
                ]
              },
              {
                "id": "m11h6d28-q3",
                "kind": "predict-output",
                "prompt": "The player touches the door first, then the key, then the door again. Which messages appear on the screen, in order?\n\n```\nwhen game starts:  anahtarVar = 0\nwhen touching key:  anahtarVar = 1\nwhen touching door:\n  if anahtarVar = 1 do: show \"You escaped!\", win the game\n  else: show \"Locked!\"\n```",
                "options": [
                  "You escaped!, You escaped!",
                  "Locked!, You escaped!",
                  "Locked!, Locked!",
                  "You escaped!, Locked!"
                ],
                "answer": 1,
                "explanation": "On the first touch of the door, anahtarVar is 0: \"Locked!\" appears. After the key it becomes 1; on the second touch \"You escaped!\" appears and the game is won. If the order were the other way round, the two messages would swap places.",
                "skills": [
                  "oyun-kosul",
                  "oyun-degisken"
                ]
              },
              {
                "id": "m11h6d28-q4",
                "kind": "find-bug",
                "prompt": "You take the key and go to the door, but the door always says \"Locked!\". Which line is wrong?\n\n```\nwhen game starts:       anahtarVar = 0\nwhen touching key:      anahtarVar = 0   <- A\n                        change score by 10\nwhen touching door:     if anahtarVar = 1 do win  <- B\n                        else show \"Locked!\"       <- C\n```",
                "options": [
                  "Line A: the flag is left at 0 when the key is taken; it should be set to 1",
                  "Line B: the condition should be 0",
                  "Line C: the `else` branch is not needed",
                  "The `anahtarVar = 0` line at the start"
                ],
                "answer": 0,
                "explanation": "The key event must set the flag to 1; here it writes 0 again, so the door always says \"no key\". Line B is correct: the condition looks for 1. Line C is useful feedback. Setting it to 0 at the start is correct too.",
                "skills": [
                  "oyun-degisken",
                  "oyun-hata"
                ]
              },
              {
                "id": "m11h6d28-q5",
                "kind": "numeric",
                "prompt": "The ghost passes through walls and follows the cat at 14 pixels a second. The cat has stopped; there are 84 pixels between them. In how many seconds does the ghost reach the cat?",
                "answer": 6,
                "tolerance": 0,
                "unit": "s",
                "explanation": "Time = distance ÷ speed = 84 ÷ 14 = 6 seconds. If the cat moved at speed 60, it could escape; in this game the cat is more than 4 times faster than the ghost (60 ÷ 14 ≈ 4.3).",
                "skills": [
                  "oyun-zorluk",
                  "oyun-harita"
                ]
              }
            ]
          }
        },
        {
          "title": "Cila ve hata ayıklama: bozuk oyunu onar",
          "durationMin": 25,
          "problem": "Her yazılımcı bir gün şunu yaşar: oyun çalışıyor ama bir yerde bir şey yanlış, ama nerede? Hata ayıklama bir dedektif işidir: belirtiyi yakala, ipucuna bak, suçluyu bul. Bu derste bozuk bir oyunun üç hatasını bulup düzelteceksin, sonra oyunu parlatacaksın.",
          "contentMd": "### Bozuk oyun\nBir meyve yakalama oyunu: sepet (kedi) altta, meyveler yukarıdan düşüyor. Ama oyunu oynayınca üç şey ters:\n1. **Hata 1:** Meyveyi yakalayınca skor düşüyor, artmıyor.\n2. **Hata 2:** Yakaladığın meyve ekranda kalıyor ve düşmeye devam ediyor.\n3. **Hata 3:** Bir meyve ekranın altına inince oyun hemen bitiyor; üç can bir anda gidiyor.\n\n### Dedektif yöntemi\n1. **Belirtiyi gör:** Ne yanlış? (skor azalıyor)\n2. **Olayı bul:** Hangi olayda oluyor? (meyve sepete çarpınca)\n3. **Bloğu bul:** O olayın içinde hangi blok bunu yapıyor? (`skoru [-1] değiştir`)\n4. **Düzelt ve dene:** Bloğu değiştir, ↺ bas, belirtinin kaybolduğunu doğrula.\nProgram hata verirse Hedefler panelinde bir uyarı çıkar ve **Bloğu göster** düğmesi sorunlu bloğu işaretler. JavaScript sekmesinde programının yazılı hâlini de okuyabilirsin (düzenleyemezsin).\n\n### Hataları düzelt\n1. **Hata 1:** Yakalama olayında `skoru [-1] değiştir` bloğunu bul ve sayıyı 1 yap.\n2. **Hata 2:** Aynı olayın en altına `[diğer sprite] sprite'ını sil` bloğunu ekle. Yakalanan meyve yok oluyor.\n3. **Hata 3:** `her karede` olayındaki `her [Yiyecek] sprite'ı için` döngüsüne bak. İçinde `eğer [bu sprite y konumu] > [116] ise canı [-1] değiştir` var ama meyveyi silmiyor. Meyve aşağıda kalıyor ve her karede (saniyede 60 kez) bir can götürüyor. `eğer`in içine `[bu sprite] sprite'ını sil` ekle.\n4. ↺ bas ve oyna. Skor artıyor, yakalanan meyve kayboluyor, kaçan meyve yalnız bir can götürüyor.\n\n### Cila\n5. Yakalama olayına **Ses** kategorisinden `[puan] melodisini çal` ekle.\n6. Kaçırma kuralına (`eğer ... > 116`) `ekranı [200] ms salla` ekle.\n7. Oyunu bir kez daha oyna. Artık yakalamak da, kaçırmak da hissediliyor.\n\nBeklenen sonuç: Beş hedefin hepsi ✓. Yakalayınca skor artıyor ve ses çalıyor, yakalanan meyve kayboluyor, kaçan meyve yalnız bir can götürüyor ve ekran sallanıyor.\n\n### Nasıl çalışıyor?\n- Hata 3'ün sebebi, kaçırma kuralının `her karede` olayında olması. Bu olay saniyede 60 kez çalışır; içinde meyveyi silmezsen aynı meyve için can her karede yeniden düşer.\n- Çarpışma olayı ise yalnız bir kez çalışır; meyveyi silmemek skoru tekrar vermez, ama meyve sahnede kalır.\n- Ses ve sarsıntı oyunun kurallarına dokunmaz; yalnızca oyuncuya \"bir şey oldu\" der. Buna **cila** denir. İyi cila küçük ama etkilidir.\n- Bu hatalar gerçekten sık görülür: işaret hatası, silmeyi unutmak, tekrar eden kuralı sınırlamamak.\n\n### Dene\n1. Meyve kaçırınca `[kayıp] melodisini çal` ekle.\n2. Skor 10 olunca oyunu kazanma kuralını ekle (çarpışma olayının içinde `eğer`).\n3. Meyveyi yakalayınca bir parçacık efekti göster: **Oyun** kategorisinden `x [80] y [60] noktasında [sarı] patlama` bloğunu kullan. x ve y için `[diğer sprite] [x konumu]` ve `[diğer sprite] [y konumu]` kullan.\n\n### Sık yapılan hatalar\n- Hata 3'ü \"can azaltma\" bloğunu silerek çözmek: oyun hatasız ama kaçırmanın cezası kalmaz.\n- Hata 1'i düzeltirken olayı baştan yazmaya kalkmak: çoğu zaman tek bir sayıyı ya da işareti değiştirmek yeter.\n- Değişikliği yapıp ↺ basmamak: çalışan oyun eski programı kullanır.\n- Aynı anda üç değişiklik yapıp hangisinin işe yaradığını anlayamamak: bir şeyi düzelt, dene, sonra diğerine geç.",
          "question": "Bir hatayı bulmak için ilk önce neye bakıyorsun? Bir arkadaşının oyununda böyle bir hata olsa, ona hatayı nasıl tarif ederdin ki o da bulabilsin?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Hata ayıklamanın dört adımlı **dedektif yöntemini**\n- Bir hatanın hangi olaydan geldiğini bulmayı\n- `her karede` olayının neden saniyede 60 kez çalıştığını ve ne tehlike doğurduğunu\n- **Cila** nedir ve oyuna nasıl his katar\n\n### Önceden bilmen gerekenler\n- Çarpışma olayı, skor, can ve sprite silme (26. ve 27. dersler)\n- Sprite'ları tür ile bulan `her [Yiyecek] sprite'ı için` döngüsü (4. hafta dersleri)\n- Ses ve ekran sarsıntısı blokları\n\n### Hata yok olmaz, bulunur\nHer programcı hata yapar; fark, hatayı nasıl aradığındadır. Yöntem dört adımdır:\n\n| Adım | Soru | Örnek |\n|---|---|---|\n| 1 | Belirti ne? | Meyve yakalayınca skor düşüyor |\n| 2 | Hangi olayda oluyor? | Oyuncu, Yiyecek'e çarpınca |\n| 3 | O olaydaki hangi blok sorumlu? | `skoru [-1] değiştir` |\n| 4 | Düzelt, ↺ bas, dene | -1'i 1 yap |\n\nBir seferde yalnız bir şeyi değiştir. Üç şeyi birden değiştirirsen hangisinin işe yaradığını bilemezsin.\n\n### Çarpışma bir kez, kare olayı her karede\nİki olay türü çok farklı çalışır:\n\n- **Çarpışma olayı** iki sprite birbirine değdiği anda **bir kez** çalışır. Sprite'lar üst üste durmaya devam etse de olay tekrarlanmaz.\n- **Her karede** olayı oyunun her karesinde çalışır. Oyun saniyede 60 kare çizer, yani olay saniyede 60 kez çalışır.\n\nBu fark üçüncü hatanın kaynağıdır. Kaçırılan meyve ekranın altında `y > 116` oluyor. Kural meyveyi silmiyorsa meyve orada kalır ve her karede bir can götürür. Üç can 3 ÷ 60 = 0,05 saniyede, yani 50 milisaniyede gider. Oyuncu ne olduğunu göremeden oyun biter.\n\nÇözüm, kuralı tek seferlik yapmaktır: can azaltılırken meyve de silinir. Silinen meyve artık `y > 116` koşulunu bir daha tetikleyemez.\n\n### Düşme süresini hesaplamak\nMeyve y = -8 konumunda doğuyor, `y > 116` olduğunda kaçırılmış sayılıyor. Kat edilecek yol 116 - (-8) = 124 pikseldir. Hızı saniyede 62 piksel olan bir meyve 124 ÷ 62 = 2 saniyede kaçar. Bu hesap, bir meyvenin oyuncuya ne kadar zaman bıraktığını gösterir: hız 35 ise 3,5 saniye, hız 70 ise 1,8 saniye kadar.\n\n### Cila\nOyun kuralları doğru çalışıyor diye iş bitmedi. **Cila**, kuralları değiştirmeyen ama oyunu hissettiren küçük eklerdir: yakalayınca ses, kaçırınca ekran sarsıntısı, patlama efekti. Cila oyuncuya \"bir şey oldu\" diye haber verir. Cilayı ilk önce hataları düzeltince ekle; bozuk bir oyunu cilalamak boşunadır.\n\n### Özet\nHata ayıklamak sırayla belirtiyi görmek, olayı ve bloğu bulmak, düzeltip denemekten ibarettir. Çarpışma olayı bir kez çalışır, `her karede` olayı saniyede 60 kez; bu yüzden karelik olaylarda sprite'ı silmeyi unutmak hızlı can kaybına yol açar. Cila kuralları değiştirmez ama oyunu daha anlaşılır ve eğlenceli yapar.",
          "concepts": [
            {
              "term": "Dedektif yöntemi",
              "definition": "Hatayı bulmak için belirtiyi gör, olayı bul, bloğu bul, düzelt ve dene adımlarını sırayla izlemek.",
              "example": "Skor düşüyorsa yakalama olayına bak, orada `skoru [-1] değiştir` bloğunu bul, -1'i 1 yap.",
              "pitfall": "Aynı anda üç değişiklik yapmak; hangisinin işe yaradığını anlayamazsın."
            },
            {
              "term": "Hata belirtisi",
              "definition": "Oyunda gördüğün yanlış davranış; hatanın kendisi değil, ipucudur.",
              "example": "\"Meyve yakalandı ama ekranda kalıyor\" bir belirtidir; nedeni silme bloğunun olmamasıdır.",
              "pitfall": "Belirtiyi hatanın kendisi sanmak ve tüm olayı baştan yazmak."
            },
            {
              "term": "Çarpışma olayı ve her karede",
              "definition": "Çarpışma olayı değdikleri anda bir kez çalışır; her karede olayı saniyede 60 kez çalışır.",
              "example": "Kaçırılan meyve her karede canı düşürür; çarpışmadaki skor ise bir kez artar.",
              "pitfall": "Karelik bir kuralın içinde sprite'ı silmemek; can saniyenin bir kesrinde biter."
            },
            {
              "term": "Cila",
              "definition": "Kuralları değiştirmeden oyunu daha hissedilir yapan ses, sarsıntı ve efekt gibi küçük eklentiler.",
              "example": "Yakalayınca `puan` melodisi, kaçırınca 200 ms ekran sarsıntısı.",
              "pitfall": "Cilayı hatalar düzelmeden eklemek; bozuk bir oyunu parlatmak sorunu çözmez."
            },
            {
              "term": "Bloğu göster",
              "definition": "Hedefler panelindeki uyarıdan sorunlu bloğu çalışma alanında işaretleyen düğme.",
              "example": "Program hata verince düğmeye basıp ilgili bloğu hemen bulursun.",
              "pitfall": "Düzelttikten sonra ↺ basmamak; çalışan oyun eski programı kullanır."
            }
          ],
          "quiz": [
            {
              "id": "m11h6d29-q1",
              "kind": "mcq",
              "prompt": "Oyunda bir hata gördün. Dedektif yöntemine göre ilk adım hangisidir?",
              "options": [
                "Tüm programı silip baştan yazmak",
                "Rastgele bir bloğun sayısını değiştirmek",
                "Cilayı ekleyip hatanın kaybolmasını beklemek",
                "Belirtiyi net biçimde görmek: ne yanlış davranıyor?"
              ],
              "answer": 3,
              "explanation": "Önce neyin yanlış olduğunu görürsün; sonra o davranışı üreten olayı ve bloğu bulursun. Tüm programı silmek ya da rastgele değiştirmek hatayı çözmez, çoğu zaman yenilerini ekler.",
              "skills": [
                "oyun-hata"
              ]
            },
            {
              "id": "m11h6d29-q2",
              "kind": "numeric",
              "prompt": "Bir meyve ekranın altında kalıyor ve `her karede` olayı her karede 1 can götürüyor. Oyun saniyede 60 kare çiziyor. 3 can kaç milisaniyede biter?",
              "answer": 50,
              "tolerance": 1,
              "unit": "ms",
              "explanation": "3 can 3 karede gider. Bir kare 1000 ÷ 60 ≈ 16,7 ms sürer; 3 × 16,7 = 50 ms. Bu yüzden oyuncu hiçbir şey göremeden kaybeder. Meyveyi silmek bu döngüyü keser.",
              "skills": [
                "oyun-hata",
                "oyun-olay"
              ]
            },
            {
              "id": "m11h6d29-q3",
              "kind": "predict-output",
              "prompt": "Yakalama olayında silme bloğu unutulmuş. Kedi bir meyveye değiyor ve meyve kedinin üstünde birkaç kare daha kalıyor. Skor kaç artar?\n\n```\nOyuncu, Yiyecek'e çarpınca:\n  skoru 1 değiştir\n  ses çal: puan\n```",
              "options": [
                "60 puan (her karede 1)",
                "1 puan, çünkü çarpışma olayı değdikleri anda bir kez çalışır",
                "0 puan",
                "3 puan"
              ],
              "answer": 1,
              "explanation": "Çarpışma olayı iki sprite'ın değmeye başladığı anda bir kez çalışır; üst üste durmaya devam etmeleri olayı tekrarlamaz. Silmeyi unutmak skoru tekrar vermez, ama meyve ekranda kalır ve sonunda kaçırma kuralı onu yine sayar.",
              "skills": [
                "oyun-olay",
                "oyun-hata"
              ]
            },
            {
              "id": "m11h6d29-q4",
              "kind": "numeric",
              "prompt": "Meyve y = -8'de doğuyor ve `y > 116` olunca kaçırılmış sayılıyor. Bir meyve saniyede 62 piksel hızla düşüyor. Kaçırılana kadar kaç saniye geçer?",
              "answer": 2,
              "tolerance": 0,
              "unit": "sn",
              "explanation": "Yol = 116 - (-8) = 124 piksel. Süre = 124 ÷ 62 = 2 saniye. Eksi işaretini unutup 116 ÷ 62 almak 1,87 verir; başlangıç noktası ekranın üstündedir.",
              "skills": [
                "oyun-zorluk",
                "oyun-hata"
              ]
            },
            {
              "id": "m11h6d29-q5",
              "kind": "find-bug",
              "prompt": "Meyve kaçınca oyun hemen bitiyor; oyuncu üç canın bir anda gittiğini görüyor. Hatayı bul.\n\n```\nher karede:\n  her Yiyecek sprite'ı için:\n    eğer bu sprite'ın y konumu > 116 ise:\n      canı -1 değiştir\n      ekranı 200 ms salla\n```",
              "options": [
                "Kaçan meyve silinmiyor; her karede koşul yeniden doğru oluyor",
                "`canı -1 değiştir` bloğu fazla",
                "`y > 116` yerine `y < 116` olmalı",
                "`ekranı salla` bloğu canı etkiler"
              ],
              "answer": 0,
              "explanation": "Meyve silinmediği için `y > 116` her karede doğrudur ve her karede 1 can gider. Çözüm `eğer`in içine `bu sprite'ı sil` eklemektir. Canı azaltan blok doğrudur; `<` yazmak yanlış yöndeki meyveleri sayardı; sarsıntı canı değiştirmez.",
              "skills": [
                "oyun-hata",
                "oyun-olay"
              ]
            }
          ],
          "contentEn": {
            "title": "Polish and debugging: fix the broken game",
            "problem": "One day every programmer goes through this: the game runs, but something somewhere is wrong. But where? Debugging is detective work: catch the symptom, look at the clues, find the culprit. In this lesson you will find and fix three bugs in a broken game, and then you will polish the game.",
            "contentMd": "### The broken game\nA fruit-catching game: the basket (the cat) is at the bottom and fruit falls from the top. But when you play the game, three things are wrong:\n1. **Bug 1:** when you catch a fruit, the score goes down instead of up.\n2. **Bug 2:** the fruit you caught stays on the screen and keeps falling.\n3. **Bug 3:** when a fruit reaches the bottom of the screen, the game ends at once; all three lives go in a flash.\n\n### The detective method\n1. **See the symptom:** what is wrong? (the score goes down)\n2. **Find the event:** in which event does it happen? (when the fruit hits the basket)\n3. **Find the block:** which block inside that event does this? (`change score by [-1]`)\n4. **Fix and test:** change the block, press ↺, and check that the symptom has gone.\nIf the program has an error, a warning appears in the Goals panel and the **Show block** button marks the block with the problem. In the JavaScript tab you can also read the written form of your program (you cannot edit it).\n\n### Fix the bugs\n1. **Bug 1:** in the catching event, find the `change score by [-1]` block and change the number to 1.\n2. **Bug 2:** add the `delete sprite [other sprite]` block at the very bottom of the same event. The caught fruit disappears.\n3. **Bug 3:** look at the `for each [Food] sprite` loop in the `every frame` event. Inside it there is `if [this sprite y position] > [116] do change lives by [-1]`, but it does not delete the fruit. The fruit stays at the bottom and takes a life every frame (60 times a second). Add `delete sprite [this sprite]` inside the `if`.\n4. Press ↺ and play. The score goes up, a caught fruit disappears, and a missed fruit takes only one life.\n\n### Polish\n5. Add `play melody [point]` from the **Sound** category to the catching event.\n6. Add `shake screen for [200] ms` to the missing rule (`if ... > 116`).\n7. Play the game once more. Now both catching and missing can be felt.\n\nExpected result: all five goals ✓. When you catch a fruit, the score goes up and a sound plays; a caught fruit disappears; a missed fruit takes only one life and the screen shakes.\n\n### How does it work?\n- The cause of bug 3 is that the missing rule is in the `every frame` event. This event runs 60 times a second; if you do not delete the fruit inside it, a life is lost again every frame for the same fruit.\n- The collision event, on the other hand, runs only once; not deleting the fruit does not give the score again, but the fruit stays on the stage.\n- Sounds and shakes do not touch the game's rules; they just tell the player \"something happened\". This is called **polish**. Good polish is small but effective.\n- These bugs are really common: a sign mistake, forgetting to delete, not limiting a rule that repeats.\n\n### Try it\n1. When a fruit is missed, add `play melody [lose]`.\n2. Add a rule for winning the game when the score reaches 10 (an `if` inside the collision event).\n3. Show a particle effect when you catch a fruit: use the `[yellow] explosion at x [80] y [60]` block from the **Game** category. For x and y, use `[other sprite] [x position]` and `[other sprite] [y position]`.\n\n### Common mistakes\n- Solving bug 3 by deleting the \"lose a life\" block: the game has no bug, but there is no longer any penalty for missing.\n- Trying to write the event again from scratch while fixing bug 1: most of the time, changing a single number or sign is enough.\n- Making the change and not pressing ↺: the running game uses the old program.\n- Making three changes at once and not being able to tell which one worked: fix one thing, test it, then move on to the next.",
            "question": "What do you look at first when you are trying to find a bug? If a friend's game had a bug like this, how would you describe it to them so that they could find it too?",
            "explainerMd": "### What you will learn in this lesson\n- The four-step **detective method** for debugging\n- How to find which event a bug comes from\n- Why the `every frame` event runs 60 times a second, and what danger this creates\n- What **polish** is, and how it adds feeling to a game\n\n### What you should know first\n- The collision event, score, lives and deleting sprites (lessons 26 and 27)\n- The `for each [Food] sprite` loop, which finds sprites by kind (week 4 lessons)\n- The sound and screen shake blocks\n\n### Bugs do not vanish; they are found\nEvery programmer makes mistakes; the difference is in how you look for them. The method has four steps:\n\n| Step | Question | Example |\n|---|---|---|\n| 1 | What is the symptom? | The score goes down when you catch a fruit |\n| 2 | In which event does it happen? | When Player hits Food |\n| 3 | Which block in that event is responsible? | `change score by [-1]` |\n| 4 | Fix it, press ↺, test it | Change -1 to 1 |\n\nChange only one thing at a time. If you change three things at once, you cannot know which one worked.\n\n### Collision once, frame event every frame\nThe two kinds of event work very differently:\n\n- The **collision event** runs **once**, at the moment two sprites touch. Even if the sprites stay on top of each other, the event does not repeat.\n- The **every frame** event runs on every frame of the game. The game draws 60 frames a second, so the event runs 60 times a second.\n\nThis difference is the source of the third bug. A missed fruit at the bottom of the screen has `y > 116`. If the rule does not delete the fruit, the fruit stays there and takes a life every frame. Three lives go in 3 ÷ 60 = 0.05 seconds, that is 50 milliseconds. The game is over before the player can see what happened.\n\nThe fix is to make the rule happen only once: when a life is taken, the fruit is deleted too. A deleted fruit can no longer trigger the `y > 116` condition again.\n\n### Working out the falling time\nA fruit appears at y = -8 and counts as missed when `y > 116`. The distance to travel is 116 - (-8) = 124 pixels. A fruit with a speed of 62 pixels a second is missed in 124 ÷ 62 = 2 seconds. This calculation shows how much time a fruit gives the player: about 3.5 seconds if the speed is 35, and about 1.8 seconds if the speed is 70.\n\n### Polish\nThe job is not finished just because the game's rules work. **Polish** means small extras that do not change the rules but make the game feel alive: a sound when you catch something, a screen shake when you miss, an explosion effect. Polish tells the player \"something happened\". Add polish only after you have fixed the bugs; polishing a broken game is pointless.\n\n### Summary\nDebugging means, in order, seeing the symptom, finding the event and the block, and fixing and testing. The collision event runs once and the `every frame` event 60 times a second; that is why forgetting to delete a sprite in an every-frame event leads to lives being lost very fast. Polish does not change the rules, but it makes the game clearer and more fun.",
            "concepts": [
              {
                "term": "Detective method",
                "definition": "Following the steps see the symptom, find the event, find the block, fix and test, in order, to find a bug.",
                "example": "If the score goes down, look at the catching event, find the `change score by [-1]` block there and change -1 to 1.",
                "pitfall": "Making three changes at once; you cannot tell which one worked."
              },
              {
                "term": "Bug symptom",
                "definition": "The wrong behaviour you see in the game; it is not the bug itself but a clue.",
                "example": "\"The fruit was caught but stays on the screen\" is a symptom; the cause is that there is no delete block.",
                "pitfall": "Thinking the symptom is the bug itself and writing the whole event again from scratch."
              },
              {
                "term": "Collision event and every frame",
                "definition": "The collision event runs once, at the moment they touch; the every frame event runs 60 times a second.",
                "example": "A missed fruit takes a life every frame; the score in the collision goes up once.",
                "pitfall": "Not deleting the sprite inside an every-frame rule; the lives run out in a fraction of a second."
              },
              {
                "term": "Polish",
                "definition": "Small extras such as sounds, shakes and effects that make the game feel more alive without changing the rules.",
                "example": "The `point` melody when you catch something, a 200 ms screen shake when you miss.",
                "pitfall": "Adding polish before the bugs are fixed; making a broken game shine does not solve the problem."
              },
              {
                "term": "Show block",
                "definition": "A button in the warning in the Goals panel that marks the block with the problem in the workspace.",
                "example": "When the program has an error, you press the button and find the block at once.",
                "pitfall": "Not pressing ↺ after fixing it; the running game uses the old program."
              }
            ],
            "quiz": [
              {
                "id": "m11h6d29-q1",
                "kind": "mcq",
                "prompt": "You have seen a bug in the game. According to the detective method, what is the first step?",
                "options": [
                  "Deleting the whole program and writing it again",
                  "Changing the number in a random block",
                  "Adding polish and waiting for the bug to disappear",
                  "Seeing the symptom clearly: what is behaving wrongly?"
                ],
                "answer": 3,
                "explanation": "First you see what is wrong; then you find the event and the block that cause that behaviour. Deleting the whole program or changing things at random does not solve the bug, and often adds new ones.",
                "skills": [
                  "oyun-hata"
                ]
              },
              {
                "id": "m11h6d29-q2",
                "kind": "numeric",
                "prompt": "A fruit stays at the bottom of the screen and the `every frame` event takes 1 life every frame. The game draws 60 frames a second. In how many milliseconds do 3 lives run out?",
                "answer": 50,
                "tolerance": 1,
                "unit": "ms",
                "explanation": "3 lives go in 3 frames. One frame lasts 1000 ÷ 60 ≈ 16.7 ms; 3 × 16.7 = 50 ms. That is why the player loses without seeing anything. Deleting the fruit breaks this loop.",
                "skills": [
                  "oyun-hata",
                  "oyun-olay"
                ]
              },
              {
                "id": "m11h6d29-q3",
                "kind": "predict-output",
                "prompt": "The delete block has been forgotten in the catching event. The cat touches a fruit and the fruit stays on top of the cat for a few more frames. How much does the score go up?\n\n```\nwhen Player hits Food:\n  change score by 1\n  play sound: point\n```",
                "options": [
                  "60 points (1 every frame)",
                  "1 point, because the collision event runs once at the moment they touch",
                  "0 points",
                  "3 points"
                ],
                "answer": 1,
                "explanation": "The collision event runs once, at the moment the two sprites start touching; staying on top of each other does not repeat the event. Forgetting to delete does not give the score again, but the fruit stays on the screen and in the end the missing rule counts it anyway.",
                "skills": [
                  "oyun-olay",
                  "oyun-hata"
                ]
              },
              {
                "id": "m11h6d29-q4",
                "kind": "numeric",
                "prompt": "A fruit appears at y = -8 and counts as missed when `y > 116`. A fruit falls at 62 pixels a second. How many seconds pass until it is missed?",
                "answer": 2,
                "tolerance": 0,
                "unit": "s",
                "explanation": "Distance = 116 - (-8) = 124 pixels. Time = 124 ÷ 62 = 2 seconds. Forgetting the minus sign and taking 116 ÷ 62 gives 1.87; the starting point is above the screen.",
                "skills": [
                  "oyun-zorluk",
                  "oyun-hata"
                ]
              },
              {
                "id": "m11h6d29-q5",
                "kind": "find-bug",
                "prompt": "When a fruit is missed, the game ends at once; the player sees all three lives go in a flash. Find the bug.\n\n```\nevery frame:\n  for each Food sprite:\n    if this sprite's y position > 116 do:\n      change lives by -1\n      shake screen for 200 ms\n```",
                "options": [
                  "The missed fruit is not deleted; the condition becomes true again every frame",
                  "The `change lives by -1` block is not needed",
                  "It should be `y < 116` instead of `y > 116`",
                  "The `shake screen` block affects lives"
                ],
                "answer": 0,
                "explanation": "Because the fruit is not deleted, `y > 116` is true every frame and 1 life goes every frame. The fix is to add `delete sprite this sprite` inside the `if`. The block that takes a life is correct; writing `<` would count fruit in the wrong place; the shake does not change lives.",
                "skills": [
                  "oyun-hata",
                  "oyun-olay"
                ]
              }
            ]
          }
        },
        {
          "title": "Final: Kendi oyunun",
          "durationMin": 40,
          "problem": "Beş haftada sprite'ları hareket ettirdin, çarpışmaları yönettin, harita çizdin, düşmanlara zekâ ve kahramana yerçekimi verdin. Şimdi bütün bunlar senin: boş bir sahne, bir fikir ve elindeki bloklar. Bu derste kendi oyununu yapacaksın. Fikir tamamen sende; ben sadece oyunun \"tam\" olup olmadığına bakacağım.",
          "contentMd": "### Başlangıç\nSahnede lacivert bir arka plan var, başka hiçbir şey yok. Bütün bloklar açık: Sprite, Hareket, Denetleyici, Oyun, Sahne / Harita, Ses, Mantık, Döngü, Değişken, Matematik, Metin ve Fonksiyon. Resimler ve Harita sekmeleriyle kendi resimlerini ve haritanı da çizebilirsin.\n\n### Önce karar ver: beş soruluk tasarım kartı\n26. dersteki kartı doldur: Oyuncu kim? Hedef ne? Tehlike ne? Nasıl kazanılır? Nasıl kaybedilir? Aşağıdaki fikirlerden birini seçebilir ya da kendi fikrini bulabilirsin:\n- **Meyve avcısı:** Kedi meyve toplar, hayaletten kaçar.\n- **Uzay savunması:** Gemi düşmanı vurur (27. ders).\n- **Hazine labirenti:** Elmasları topla, kapıdan çık (28. ders).\n- **Platform macerası:** Altın topla, dikenlerden zıpla (25. ders).\n- **Kendi fikrin:** Balık tutma, havada balon koruma, yarış…\n\n### Hedef listesi: tam bir oyunun işaretleri\nHedefler paneli oyununu kontrol eder. Tasarım sana ait; liste yalnız tam bir oyunda olması gerekenleri sınar:\n\n| Hedef | Ne demek? |\n|---|---|\n| Oyuncu | Türü **Oyuncu** olan ve ok tuşlarıyla hareket eden bir sprite |\n| Toplanacak şey | **Yiyecek**, **Bonus**, **Hedef** ya da **Nesne** türünde bir sprite |\n| Tehlike | **Düşman** ya da **Engel** türünde bir sprite |\n| Skor | Toplayınca skor artıyor |\n| Can | Tehlikeye değince can azalıyor |\n| Bitiş | Programında `oyunu bitir` bloğu var |\n| Ses | En az bir melodi ya da bip çalıyor |\n| Cila | Ekran sarsıntısı, patlama ya da ekranda mesaj |\n\nÖnemli: Hedefler, sprite türlerine ve çarpışma olaylarına bakar. Türleri doğru seç: toplanacak şeylere **Yiyecek**, tehlikelere **Düşman** gibi.\n\n### Dört turda yap (yaklaşık 35 dakika)\n**Tur 1 (10 dk): iskelet.** `oyun başlayınca` bloğuyla oyuncu sprite'ını oluştur, `oyuncu tuşlarıyla … hareket etsin` bloğunu ekle, `ekranda kalsın` ayarını aç, skoru 0, canı 3 yap. ↺ bas: oyuncun yürüyor mu?\n\n**Tur 2 (10 dk): toplanacak şey ve tehlike.** `her [1000] ms'de bir` olayıyla rastgele yerlerde toplanacak sprite'lar çıkar (rastgele konum için `[ile] arasında rastgele sayı`). Bir düşman oluştur; sekmeli, takip eden ya da rastgele hareket etsin. `bir [Oyuncu] sprite'ı bir [Yiyecek] sprite'ına çarpınca` ve `… bir [Düşman] sprite'ına çarpınca` olaylarını yaz: skor artır, can azalt, sil.\n\n**Tur 3 (5 dk): bitiş.** Çarpışma olayında `eğer [skor] ≥ [5] ise` ile `oyunu bitir: [kazandın]` yaz. Kaybetmek için can 0'a düşünce oyun kendiliğinden biter; istersen `can bitince` olayına özel bir mesaj ekle.\n\n**Tur 4 (10 dk): cila.** Ses ekle (toplayınca puan, çarpınca kayıp melodisi), `ekranı salla` ve `ekranda … yaz` kullan. Oyunu baştan sona kendin oyna; çok kolay ya da çok zorsa sayıları (hız, süre, skor hedefi) ayarla.\n\nBeklenen sonuç: Sekiz hedefin hepsi ✓ ve oyun baştan sona oynanabiliyor. Hedeflerin hepsi ✓ olunca oyunun \"tam\" sayılır; asıl güzel kısım, onu daha da iyileştirmeye devam etmen.\n\n### Nasıl çalışıyor?\n- Hedef kontrolü senin oyununu bir robotun oynayacağı gibi dener: tuşlara basar, toplanacak şeyle ve tehlikeyle çarpıştırır. Çarpışma olayların olmazsa skor ve can değişmez; hedefler ✓ olmaz.\n- **Bitiş** hedefi, programında `oyunu bitir` bloğunun bulunup bulunmadığına bakar. Bitişin gerçekten çalıştığını görmek için oyununu kendin kazanıp dene.\n- Aynı oyunu birçok biçimde çözmek mümkündür. Sana ait çözüm, benimkinden çok farklı olabilir; bu iyi.\n\n### Örnek çözüm: Meyve avcısı\nBir fikre takılırsan şu örnek tasarıma bak: kedi (dört yöne, ekranda kalsın), köşede sekerek giden bir hayalet (Düşman), her saniye rastgele bir yerde 5 saniye ömürlü bir kiraz (Yiyecek). Kiraz skor 1, hayalet can -1; skor 5 olunca \"Avcı kazandı!\" yazılıp oyun kazanılıyor; ses ve ekran sarsıntısı var. Bu tasarımı kendi başına yapabilir, sonra değiştirebilirsin.\n\n### Dene\n1. Oyununa bir **zaman sınırı** ekle: `geri sayımı [30] saniyeden başlat` ve `süre bitince` olayında karar ver.\n2. Oyununa **seviye** ekle: skor 5 olunca düşman hızlansın (27. dersteki gibi bir değişkenle).\n3. **Harita** sekmesinde bir labirent ya da platform çiz ve oyunu haritaya taşı.\n4. Kendi resimlerini **Resimler** sekmesinde çiz.\n5. Serbest Oyun Atölyesi sayfasında (ders dışında) oyununu **💾 Kaydet** düğmesiyle dosya olarak indirebilir, **📂 Aç** ile geri yükleyebilirsin.\n\n### Sık yapılan hatalar\n- Çarpışma olayında yanlış türü seçmek: olay \"Yiyecek\" bekliyorsa ama sprite'ı **Nesne** türüyle yaptıysan olay hiç çalışmaz, skor değişmez.\n- Bir olay bloğunu başka bir olay bloğunun içine koymaya çalışmak: olay blokları yalnız tek başlarına, çalışma alanında durur.\n- Aynı anda çok şey yapmaya çalışıp hiçbir parçayı bitirmemek: önce iskelet, sonra tehlike, sonra bitiş, en son cila.\n- **↺ Başa dön** düğmesine bilmeden basmak: etkinlik başlangıç projesine geri döner ve yaptığın bloklar gider. Sahnedeki ↺ ise yalnız oyunu yeniden başlatır.",
          "question": "Oyununun en güçlü yanı ne? Birisi oynasa ilk 10 saniyede ne anlar? Bir sonraki sürümde ilk ekleyeceğin şey ne olurdu?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Kendi oyun fikrini beş soruluk tasarım kartıyla somutlaştırmayı\n- Bir oyunu dört turda (iskelet, tehlike, bitiş, cila) üretmeyi\n- Hedefler panelinin sprite türlerine ve olaylara baktığını\n- Oyununu sayılarla ayarlayıp dengelemeyi\n\n### Önceden bilmen gerekenler\n- Oyun iskeleti ve kazanma kuralı (26. ders)\n- Zamanlı olaylar, değişkenler ve süre (27. ders)\n- Bayrak, `eğer … değilse` ve harita (28. ders)\n- Hata ayıklama ve cila (29. ders)\n\n### Boş sahneden tam oyuna\nBu derste hazır oyun yok. Sahne boş, sen kararı veriyorsun. Ama yol bellidir: önce kart, sonra dört tur.\n\n| Tur | Süre | İş | Biter, ne zaman? |\n|---|---|---|---|\n| 1 | 10 dk | Oyuncu, tuş hareketi, skor ve can | Oyuncu yürüyor |\n| 2 | 10 dk | Toplanacak şey, tehlike, çarpışma olayları | Skor artıyor, can azalıyor |\n| 3 | 5 dk | Kazanma kuralı | Oyun bitiyor |\n| 4 | 10 dk | Ses, sarsıntı, mesaj, ayar | Oyun hissediliyor |\n\nToplam 35 dakika eder. Sıra önemlidir: bitişi olmayan bir oyuna cila eklemek vakit kaybıdır.\n\n### Tür doğru olmalı\nHedefler paneli oyununu bir robot gibi oynar. Oyuncuyu ok tuşlarıyla yürütür, \"Yiyecek\", \"Bonus\", \"Hedef\" ya da \"Nesne\" türünde bir sprite ile çarpıştırır, tehlikeyi (\"Düşman\" ya da \"Engel\") dener. Panel tasarımını beğenip beğenmediğine bakmaz, **türlere** ve **olaylara** bakar.\n\nBu yüzden sprite'ın türü, çarpışma olayının beklediği türle eşleşmelidir. Sprite'ı **Nesne** türüyle yapıp olayda **Yiyecek** beklersen olay hiç çalışmaz. Resim aynı olsa bile olay resme değil türe bakar.\n\n### Sayılarla ayar\nOyununu bitirince kendin oyna. Çok kolaysa hızı ya da hedefi artır, çok zorsa azalt. Sayıları hesapla:\n\n- Can 3 ve her çarpışma 1 can götürüyorsa en fazla 2 kez çarpışabilirsin; üçüncüde can 0 olur ve oyun kaybedilir.\n- Her saniye bir kiraz doğuyor, her kiraz 5 saniye yaşıyorsa ekranda en çok 5 kiraz bulunur.\n- Hedef skor 5 ve her kiraz 1 puansa en az 5 kiraz toplamalısın.\n\n### Kaydetmek ve ↺ düğmeleri\nEtkinlik ekranındaki **↺ Başa dön** düğmesi etkinliği başlangıç projesine geri döndürür; yaptığın bloklar gider. Sahnedeki ↺ ise yalnız oyunu yeniden başlatır. İkisini karıştırma.\n\n### Özet\nKendi oyununu yapmak için önce tasarım kartını doldur, sonra iskelet, tehlike, bitiş ve cila sırasıyla ilerle. Hedefler paneli türlere ve olaylara bakar, bu yüzden sprite türlerini doğru seç. Oyunu bitirdikten sonra sayıları (hız, süre, hedef skor) deneyerek ayarla. İki ↺ düğmesi farklı işler yapar; birinde işin gidebilir.",
          "concepts": [
            {
              "term": "Dört tur",
              "definition": "Oyunu sırayla iskelet, toplanacak şey ile tehlike, bitiş ve cila olarak üretme planı.",
              "example": "35 dakikalık dersi 10 + 10 + 5 + 10 dakikaya bölüp her tur sonunda ↺ ile denersin.",
              "pitfall": "Aynı anda her şeyi yapmaya çalışıp hiçbir parçayı bitirmemek."
            },
            {
              "term": "Sprite türü",
              "definition": "Sprite'ın oyundaki rolü: Oyuncu, Yiyecek, Düşman, Bonus, Hedef, Engel ya da Nesne.",
              "example": "Kiraz Yiyecek, hayalet Düşman türünde yapılır; çarpışma olayı bu türleri bekler.",
              "pitfall": "Toplanacak şeyi Nesne türüyle yapıp olayda Yiyecek beklemek; olay hiç çalışmaz."
            },
            {
              "term": "Hedefler paneli",
              "definition": "Oyununu türlere ve olaylara bakarak sınayıp tam bir oyunun işaretlerini kontrol eden liste.",
              "example": "Bitiş hedefi programında `oyunu bitir` bloğu olup olmadığına bakar.",
              "pitfall": "Bir hedefin ✓ olmasını oyunun iyi olduğu sanmak; panel yalnız tam olmayı sınar."
            },
            {
              "term": "Oyun dengesi",
              "definition": "Hız, süre, can ve hedef skor gibi sayıları, oyun ne çok kolay ne imkânsız olacak biçimde ayarlamak.",
              "example": "Skor hedefi 5, can 3: oyuncu en çok 2 kez çarpışıp hâlâ kazanabilir.",
              "pitfall": "Sayıları hiç denemeden bırakmak; oyun fazla kolay ya da oynanamaz çıkar."
            },
            {
              "term": "↺ Başa dön ve ↺ yeniden başlat",
              "definition": "Etkinlikteki ↺ Başa dön başlangıç projesini geri yükler; sahnedeki ↺ yalnız oyunu baştan oynatır.",
              "example": "Oyunu denemek için sahnedeki ↺ düğmesine basarsın, bloklarına dokunulmaz.",
              "pitfall": "Etkinlikteki ↺ düğmesine bilmeden basmak; yaptığın bloklar gider."
            }
          ],
          "quiz": [
            {
              "id": "m11h6d30-q1",
              "kind": "mcq",
              "prompt": "Hedefler paneli \"Skor\" hedefini işaretlemiyor. Oyuncuyu kiraza çarptırıyorsun ama skor artmıyor. En olası neden hangisi?",
              "options": [
                "Kiraz sprite'ı Nesne türünde, çarpışma olayı Yiyecek bekliyor",
                "Kiraz resmi küçük",
                "Sahnenin arka planı lacivert",
                "Oyuncunun hızı fazla"
              ],
              "answer": 0,
              "explanation": "Çarpışma olayı sprite'ın türüne bakar. Tür olayın beklediğiyle eşleşmezse olay hiç çalışmaz ve skor değişmez. Resmin boyutu, arka plan rengi ve hız olayın tetiklenip tetiklenmemesini bu şekilde belirlemez.",
              "skills": [
                "oyun-olay",
                "oyun-tasarim"
              ]
            },
            {
              "id": "m11h6d30-q2",
              "kind": "numeric",
              "prompt": "Oyununda can 3 ile başlıyor ve düşmana her çarpışma 1 can götürüyor. Oyun kaybedilmeden en fazla kaç kez düşmana çarpabilirsin?",
              "answer": 2,
              "tolerance": 0,
              "unit": "çarpışma",
              "explanation": "Üç çarpışma canı 3'ten 0'a düşürür ve oyun kaybedilir. Bu yüzden kaybetmeden en fazla 2 çarpışma yapabilirsin. 3 yazmak, canın 0 olunca oyunun bittiğini unutmaktır.",
              "skills": [
                "oyun-iskelet"
              ]
            },
            {
              "id": "m11h6d30-q3",
              "kind": "predict-output",
              "prompt": "Kedi 80,100 noktasında başlıyor. Can 3. Kedi hayalete çarparsa ne olur?\n\n```\nOyuncu, Düşman'a çarpınca:\n  canı -1 değiştir\n  ekranı 250 ms salla\n  bu sprite'ı 80,100 noktasına koy\n```",
              "options": [
                "Can 2 olur, ekran sallanır ve kedi başlangıç noktasına döner",
                "Oyun hemen kaybedilir",
                "Hayalet silinir, can 3 kalır",
                "Kedi değil hayalet 80,100'e gider"
              ],
              "answer": 0,
              "explanation": "`bu sprite` çarpışma olayında birinci tür olan Oyuncu'dur, yani kedi. Can 3'ten 2'ye iner, ekran sallanır ve kedi merkeze döner. Hayalet silinmez ve yerinde kalır. Can 0 olmadığı için oyun bitmez.",
              "skills": [
                "oyun-olay",
                "oyun-iskelet"
              ]
            },
            {
              "id": "m11h6d30-q4",
              "kind": "mcq",
              "prompt": "Etkinlikte bir süredir blok yazıyorsun. Hangi düğmeye bilmeden basmak yazdığın blokları siler?",
              "options": [
                "Sahnedeki ↺ düğmesi",
                "Etkinlikteki ↺ Başa dön düğmesi",
                "Hedefler panelini açmak",
                "Resimler sekmesine geçmek"
              ],
              "answer": 1,
              "explanation": "↺ Başa dön, etkinliği başlangıç projesine geri döndürür ve bloklarını siler. Sahnedeki ↺ yalnız oyunu baştan başlatır. Hedef panelini açmak ve sekme değiştirmek projeye dokunmaz.",
              "skills": [
                "oyun-tasarim"
              ]
            },
            {
              "id": "m11h6d30-q5",
              "kind": "numeric",
              "prompt": "Final dersinde dört tur sırasıyla 10, 10, 5 ve 10 dakika sürüyor. Toplam kaç dakikada bir oyunun bitmiş olur?",
              "answer": 35,
              "tolerance": 0,
              "unit": "dk",
              "explanation": "10 + 10 + 5 + 10 = 35 dakika. Bitiş turu (5 dk) en kısadır çünkü yalnız bir kazanma kuralı yazılır; cila turu ise ayar yapmak için daha uzundur.",
              "skills": [
                "oyun-tasarim"
              ]
            }
          ],
          "contentEn": {
            "title": "Final: Your own game",
            "problem": "In five weeks you have moved sprites, handled collisions, drawn maps, and given enemies brains and the hero gravity. Now all of this is yours: an empty stage, an idea and the blocks in your hands. In this lesson you will make your own game. The idea is entirely up to you; I will only check whether the game is \"complete\".",
            "contentMd": "### Starting point\nOn the stage there is a navy background and nothing else. All the blocks are available: Sprite, Motion, Controller, Game, Stage / Map, Sound, Logic, Loops, Variables, Math, Text and Functions. You can also draw your own pictures and map with the Pictures and Map tabs.\n\n### Decide first: the five-question design card\nFill in the card from lesson 26: Who is the player? What is the goal? What is the danger? How do you win? How do you lose? You can pick one of the ideas below or come up with your own:\n- **Fruit hunter:** a cat collects fruit and escapes from a ghost.\n- **Space defence:** a ship shoots enemies (lesson 27).\n- **Treasure maze:** collect the diamonds and get out through the door (lesson 28).\n- **Platform adventure:** collect gold and jump over spikes (lesson 25).\n- **Your own idea:** fishing, protecting a balloon in the air, a race…\n\n### The goal list: signs of a complete game\nThe Goals panel checks your game. The design belongs to you; the list only tests what a complete game must have:\n\n| Goal | What does it mean? |\n|---|---|\n| Player | A sprite of the **Player** kind that moves with the arrow keys |\n| Something to collect | A sprite of the **Food**, **Bonus**, **Goal** or **Object** kind |\n| Danger | A sprite of the **Enemy** or **Obstacle** kind |\n| Score | The score goes up when you collect something |\n| Lives | Lives go down when you touch the danger |\n| Ending | Your program has an `end game` block |\n| Sound | At least one melody or beep plays |\n| Polish | A screen shake, an explosion or a message on the screen |\n\nImportant: the goals look at sprite kinds and collision events. Choose the kinds correctly: **Food** for things to collect, **Enemy** for dangers, and so on.\n\n### Do it in four rounds (about 35 minutes)\n**Round 1 (10 min): the skeleton.** Create the player sprite with the `when game starts` block, add the `moves … with player keys` block, turn on the `stay on screen` setting, and set the score to 0 and lives to 3. Press ↺: does your player walk?\n\n**Round 2 (10 min): something to collect and a danger.** With an `every [1000] ms` event, make sprites to collect appear in random places (for a random position, use `random integer from [ ] to [ ]`). Create an enemy; make it bounce, follow, or move randomly. Write the `when a [Player] sprite hits a [Food] sprite` and `… hits a [Enemy] sprite` events: raise the score, take away a life, delete.\n\n**Round 3 (5 min): the ending.** In the collision event, write `end game: [you win]` with `if [score] ≥ [5] do`. For losing, the game ends by itself when lives drop to 0; if you like, add a special message in the `when lives run out` event.\n\n**Round 4 (10 min): polish.** Add sounds (a point melody when you collect, a lose melody when you crash), and use `shake screen` and `show … on screen`. Play your game yourself from start to finish; if it is too easy or too hard, adjust the numbers (speed, time, score target).\n\nExpected result: all eight goals ✓ and the game can be played from start to finish. When all the goals are ✓, your game counts as \"complete\"; the best part is carrying on making it even better.\n\n### How does it work?\n- The goal check tries out your game the way a robot would play it: it presses keys and makes the player collide with the thing to collect and with the danger. If you have no collision events, the score and lives do not change, and the goals do not turn ✓.\n- The **Ending** goal checks whether your program contains an `end game` block. To see that the ending really works, try winning your game yourself.\n- The same game can be solved in many ways. Your solution may be very different from mine; that is a good thing.\n\n### Example solution: Fruit hunter\nIf you get stuck on an idea, look at this example design: a cat (in 4 directions, stay on screen), a ghost bouncing around from a corner (Enemy), and every second a cherry (Food) in a random place that lives for 5 seconds. A cherry gives 1 point and the ghost takes 1 life; when the score reaches 5, \"Hunter wins!\" appears and the game is won; there are sounds and screen shakes. You can make this design on your own, then change it.\n\n### Try it\n1. Add a **time limit** to your game: `start countdown from [30] seconds`, and decide what happens in the `when time runs out` event.\n2. Add **levels** to your game: when the score reaches 5, make the enemy faster (with a variable, as in lesson 27).\n3. Draw a maze or platforms in the **Map** tab and move your game onto the map.\n4. Draw your own pictures in the **Pictures** tab.\n5. On the free Game Workshop page (outside the lessons), you can download your game as a file with the **💾 Save** button and load it back with **📂 Open**.\n\n### Common mistakes\n- Choosing the wrong kind in a collision event: if the event expects \"Food\" but you made the sprite with the **Object** kind, the event never runs and the score does not change.\n- Trying to put one event block inside another event block: event blocks only stand on their own, in the workspace.\n- Trying to do lots of things at once and not finishing any part: first the skeleton, then the danger, then the ending, and polish last.\n- Pressing the **↺ Start over** button by accident: the activity goes back to the starter project and the blocks you made are gone. The ↺ on the stage only restarts the game.",
            "question": "What is the strongest thing about your game? If someone played it, what would they understand in the first 10 seconds? What would be the first thing you would add in the next version?",
            "explainerMd": "### What you will learn in this lesson\n- How to turn your own game idea into something concrete with the five-question design card\n- How to make a game in four rounds (skeleton, danger, ending, polish)\n- That the Goals panel looks at sprite kinds and events\n- How to adjust and balance your game with numbers\n\n### What you should know first\n- The game skeleton and the winning rule (lesson 26)\n- Timed events, variables and time (lesson 27)\n- Flags, `if … else` and the map (lesson 28)\n- Debugging and polish (lesson 29)\n\n### From an empty stage to a complete game\nThere is no ready-made game in this lesson. The stage is empty, and you make the decisions. But the path is clear: first the card, then four rounds.\n\n| Round | Time | Job | When is it done? |\n|---|---|---|---|\n| 1 | 10 min | Player, key movement, score and lives | The player walks |\n| 2 | 10 min | Something to collect, a danger, collision events | The score goes up, lives go down |\n| 3 | 5 min | Winning rule | The game ends |\n| 4 | 10 min | Sound, shakes, messages, adjusting | The game can be felt |\n\nThat makes 35 minutes in total. The order matters: adding polish to a game with no ending is a waste of time.\n\n### The kind must be right\nThe Goals panel plays your game like a robot. It walks the player with the arrow keys, makes it collide with a sprite of the \"Food\", \"Bonus\", \"Goal\" or \"Object\" kind, and tries out the danger (\"Enemy\" or \"Obstacle\"). The panel does not check whether it likes your design; it looks at the **kinds** and the **events**.\n\nThat is why a sprite's kind must match the kind the collision event expects. If you make the sprite with the **Object** kind and the event expects **Food**, the event never runs. Even if the picture is the same, the event looks at the kind, not the picture.\n\n### Adjusting with numbers\nWhen you finish your game, play it yourself. If it is too easy, raise the speed or the target; if it is too hard, lower them. Work out the numbers:\n\n- If you have 3 lives and each collision takes 1 life, you can collide at most 2 times; on the third, lives reach 0 and the game is lost.\n- If a cherry appears every second and each cherry lives for 5 seconds, there are at most 5 cherries on the screen.\n- If the target score is 5 and each cherry is worth 1 point, you must collect at least 5 cherries.\n\n### Saving and the ↺ buttons\nThe **↺ Start over** button on the activity screen takes the activity back to the starter project; the blocks you made are gone. The ↺ on the stage only restarts the game. Do not mix the two up.\n\n### Summary\nTo make your own game, fill in the design card first, then go through the skeleton, danger, ending and polish in that order. The Goals panel looks at kinds and events, so choose sprite kinds correctly. After finishing the game, adjust the numbers (speed, time, target score) by trying them. The two ↺ buttons do different jobs; with one of them you can lose your work.",
            "concepts": [
              {
                "term": "Four rounds",
                "definition": "A plan for making a game in order: skeleton, something to collect and a danger, ending, and polish.",
                "example": "You split the 35-minute lesson into 10 + 10 + 5 + 10 minutes and test with ↺ at the end of each round.",
                "pitfall": "Trying to do everything at once and not finishing any part."
              },
              {
                "term": "Sprite kind",
                "definition": "A sprite's role in the game: Player, Food, Enemy, Bonus, Goal, Obstacle or Object.",
                "example": "The cherry is made with the Food kind and the ghost with the Enemy kind; the collision event expects these kinds.",
                "pitfall": "Making the thing to collect with the Object kind and expecting Food in the event; the event never runs."
              },
              {
                "term": "Goals panel",
                "definition": "A list that tests your game by looking at kinds and events, and checks for the signs of a complete game.",
                "example": "The Ending goal checks whether your program has an `end game` block.",
                "pitfall": "Thinking a goal turning ✓ means the game is good; the panel only tests that it is complete."
              },
              {
                "term": "Game balance",
                "definition": "Adjusting numbers such as speed, time, lives and target score so that the game is neither too easy nor impossible.",
                "example": "Target score 5, 3 lives: the player can collide at most 2 times and still win.",
                "pitfall": "Leaving the numbers without ever trying them; the game turns out too easy or impossible to play."
              },
              {
                "term": "↺ Start over and ↺ restart",
                "definition": "↺ Start over in the activity brings back the starter project; the ↺ on the stage only plays the game again from the start.",
                "example": "To test the game you press the ↺ button on the stage, and your blocks are not touched.",
                "pitfall": "Pressing the activity's ↺ button by accident; the blocks you made are gone."
              }
            ],
            "quiz": [
              {
                "id": "m11h6d30-q1",
                "kind": "mcq",
                "prompt": "The Goals panel does not tick the \"Score\" goal. You make the player collide with the cherry, but the score does not go up. What is the most likely reason?",
                "options": [
                  "The cherry sprite is of the Object kind, but the collision event expects Food",
                  "The cherry picture is small",
                  "The stage background is navy",
                  "The player's speed is too high"
                ],
                "answer": 0,
                "explanation": "The collision event looks at the sprite's kind. If the kind does not match what the event expects, the event never runs and the score does not change. The picture size, background colour and speed do not decide whether the event is triggered in this way.",
                "skills": [
                  "oyun-olay",
                  "oyun-tasarim"
                ]
              },
              {
                "id": "m11h6d30-q2",
                "kind": "numeric",
                "prompt": "Your game starts with 3 lives and every collision with an enemy takes 1 life. At most, how many times can you hit an enemy without losing the game?",
                "answer": 2,
                "tolerance": 0,
                "unit": "collisions",
                "explanation": "Three collisions bring lives from 3 down to 0, and the game is lost. So you can have at most 2 collisions without losing. Writing 3 means forgetting that the game ends when lives reach 0.",
                "skills": [
                  "oyun-iskelet"
                ]
              },
              {
                "id": "m11h6d30-q3",
                "kind": "predict-output",
                "prompt": "The cat starts at the point 80,100. Lives are 3. What happens if the cat hits the ghost?\n\n```\nwhen Player hits Enemy:\n  change lives by -1\n  shake screen for 250 ms\n  move this sprite to 80,100\n```",
                "options": [
                  "Lives become 2, the screen shakes and the cat goes back to its starting point",
                  "The game is lost at once",
                  "The ghost is deleted and lives stay at 3",
                  "The ghost, not the cat, goes to 80,100"
                ],
                "answer": 0,
                "explanation": "In the collision event, `this sprite` is the first kind, the Player, that is, the cat. Lives drop from 3 to 2, the screen shakes and the cat goes back to the middle. The ghost is not deleted and stays where it is. Because lives are not 0, the game does not end.",
                "skills": [
                  "oyun-olay",
                  "oyun-iskelet"
                ]
              },
              {
                "id": "m11h6d30-q4",
                "kind": "mcq",
                "prompt": "You have been writing blocks in the activity for a while. Which button deletes the blocks you wrote if you press it by accident?",
                "options": [
                  "The ↺ button on the stage",
                  "The ↺ Start over button in the activity",
                  "Opening the Goals panel",
                  "Switching to the Pictures tab"
                ],
                "answer": 1,
                "explanation": "↺ Start over takes the activity back to the starter project and deletes your blocks. The ↺ on the stage only restarts the game. Opening the goals panel and switching tabs do not touch the project.",
                "skills": [
                  "oyun-tasarim"
                ]
              },
              {
                "id": "m11h6d30-q5",
                "kind": "numeric",
                "prompt": "In the final lesson, the four rounds take 10, 10, 5 and 10 minutes, in that order. In how many minutes in total is your game finished?",
                "answer": 35,
                "tolerance": 0,
                "unit": "min",
                "explanation": "10 + 10 + 5 + 10 = 35 minutes. The ending round (5 min) is the shortest, because only one winning rule is written; the polish round is longer so that you have time to adjust things.",
                "skills": [
                  "oyun-tasarim"
                ]
              }
            ]
          }
        }
      ]
    }
  ]
}
