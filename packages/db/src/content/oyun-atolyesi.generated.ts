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
          ]
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
          ]
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
          ]
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
          ]
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
          ]
        }
      ]
    },
    {
      "title": "Çarpışma ve skor",
      "project": "Meyve avı",
      "guideMd": "### Hafta hedefleri\nBu haftanın sonunda öğrenci:\n1. Çarpışma olayını kurabilir; `bu sprite` ile `diğer sprite` farkını ve sprite türünün rolünü açıklayabilir.\n2. Skoru `yap` ve `değiştir` blokları ile yönetebilir; `eğer ... ise` ile skora bağlı karar verdirebilir.\n3. `her ... ms'de bir` olayı ve rastgele sayıyla gökten düşen nesneler üretebilir; ekran dışına çıkanları silmeyi bilir.\n4. Can sayısını yönetebilir; `can bitince` ve `süre bitince` olaylarında oyunu kendisi bitirebilir.\n5. Amaç, risk ve sondan oluşan eksiksiz bir oyun (Meyve avı) tamamlayabilir.\n\n### Haftanın planı\nHafta beş derstir; her ders yaklaşık 20-35 dakikadır. Plan günde bir ders içindir.\n\n| Gün | Ders | Süre | Ne yapılır |\n|---|---|---|---|\n| 1 | Elmayı ye, hayaleti patlat | ~20 dk | Anlatımı oku, çarpışma olaylarını kur, `bu sprite` ve `diğer sprite` farkını dene, mini testi çöz. |\n| 2 | Üç meyveyi topla, oyunu kazan | ~22 dk | Skor bloklarını kur, `eğer skor = 3` ile kazanmayı ekle, `=` ve `≥` farkını dene. |\n| 3 | Gökten meyve yağsın | ~25 dk | `her 800 ms'de bir` olayını kur, rastgele konum ve hız ver, silinsin ayarını aç ve kapatıp farkı gör. |\n| 4 | Bombadan kaç, canını koru | ~22 dk | Bomba çarpışmasını, canı, sallanmayı ve `can bitince` olayını yaz. |\n| 5 | Proje: Meyve avı | ~35 dk | Eksikleri tamamla (ceza, geri sayım, kazanma, kaybetme), oyunu oyna, dengele ve ölçütle değerlendir. |\n\n### Ön koşul kontrolü\nHafta 1'den şunlar gerekir. Başlamadan kontrol et:\n- Bloğu çalışma alanına sürükleyip başka bloğa takabiliyor mu?\n- `oyun başlayınca` içinde yeni sprite oluşturup konum verebiliyor mu?\n- Ok tuşlarıyla sprite'ı yürütebiliyor mu ve hız bloğunun x ve y'sini ayırt ediyor mu?\n- Değişken oluşturup sprite'ı onda tutabiliyor mu?\n- ▶ ve ↺ düğmelerinin ne yaptığını biliyor mu?\n\n### Kavram haritası\n- **Etkileşim:** sprite kutusu → çarpışma → çarpışma olayı → `bu sprite` / `diğer sprite` → sprite türü\n- **Durum:** skor (`yap`, `değiştir`) → koşul → `eğer ... ise` → `=` ve `≥`\n- **Üretim:** `her ... ms'de bir` → yeni sprite → rastgele sayı → hız (piksel/sn) → silinsin ayarı\n- **Risk:** can → tehlike olayı → geri bildirim (ses, sallanma) → `can bitince`\n- **Bütün oyun:** amaç + risk + son → olaylara bölme → geri sayım → `süre bitince` → denge\n\n### Sık yapılan hatalar\n- **`bu sprite` ile `diğer sprite`'ı karıştırmak.** Yanlış sprite silinir; çoğu zaman kedi kaybolur.\n- **Sprite türünü yanlış seçmek.** Olay hiç çalışmaz; hayalet ve bomba Düşman, meyve Yiyecek olmalı.\n- **`skoru yap` ile `skoru değiştir`'i karıştırmak.** İlki skoru sabitler, ikincisi ekler.\n- **Hedefi `=` ile kontrol etmek.** Skor hedefi atlarsa oyun hiç kazanılmaz; `≥` daha güvenlidir.\n- **Hız bloğunda 0'ı yanlış eksene yazmak.** Meyve düşmez, yana kayar.\n- **Ekrandan çıkanları silmemek.** Sprite sayısı birikir, 500'ü geçince oyun hata verir.\n- **`can bitince` ya da `süre bitince` içinde oyunu bitirmeyi unutmak.** Oyun sıfır canla ya da sıfır süreyle devam eder.\n- **Geri sayım bloğunu bir olayın dışında bırakmak.** Süre hiç başlamaz.\n\n### Hafta sonu tekrarı\n1. Her dersin kavram kartlarına bir kez daha bak ve \"sık yapılan yanlış\" satırlarını yüksek sesle oku.\n2. Mini testlerde yanlış yaptığın soruların açıklamalarını yeniden oku, sonra soruyu yeniden çöz.\n3. Meyve avını bakmadan yeniden kur: önce çarpışmalar, sonra skor, düşen nesneler, can, en son geri sayım.\n4. Sayıları değiştir ve tahmin et: süreyi 30 saniyeye indirirsen oyun nasıl değişir? Hedefi 12 yaparsan?\n5. Kendi cümlelerinle şu soruyu cevapla: \"Bir oyunun amacı, riski ve sonu ne işe yarar?\"\n\nHafta sonu testi olarak beş dersin mini testleri yeterlidir; her derste 5 soru, toplam 25 soru. Hedef: her dersten en az 4 doğru. Eksik kalan dersin anlatımına dön.\n\n### Proje değerlendirme ölçütü (Meyve avı)\n| Ölçüt | Gelişmeli | Yeterli | İleri |\n|---|---|---|---|\n| Çarpışmalar | Meyve ya da bomba çarpışması çalışmıyor | Meyve skoru artırıyor, bomba can götürüyor ve ikisi de siliniyor | Geri bildirim eklenmiş (ses, sallanma, mesaj) |\n| Kurallar | Kazanma ya da kaybetme yok | Skor 8 olunca kazanma, can ya da süre bitince kaybetme var | Hedef ve süre oynanarak dengelenmiş |\n| Zaman | Geri sayım başlamıyor | 45 saniyelik sayım var ve süre bitince oyun kaybediliyor | Kalan süre mesajda kullanılıyor |\n| Karar | `=` ile kontrol, bilmeden yazılmış | Kazanma `≥` ile yazılmış | Neden `≥` seçtiğini anlatıyor |\n| Anlatım | Ne yaptığını anlatamıyor | Oyunun amacını, riskini ve sonunu söylüyor | Arkadaşından aldığı geri bildirimle bir şeyi değiştiriyor |\n\n### Veli ve öğretmen notu\n- **Amaç.** Bu hafta oyun yapmanın \"bir şeyin başka bir şeye değince ne olacağını tasarlamak\" olduğunu görmek; ezber değil. Hata yapmak güvenlidir, ↺ ile baştan başlanır.\n- **Nasıl destek olunur?** Takıldığında cevabı söylemek yerine sor: \"Hangi iki şey değince bu olmalıydı?\", \"Türleri doğru seçtin mi?\", \"Skoru bu bloktan sonra mı kontrol ediyorsun?\", \"Oyunu kim bitiriyor?\"\n- **Oyun testi.** Çocuk oyununu bir arkadaşına ya da aileden birine oynatsın ve nerede zorlandığını izlesin. Oyun tasarımının yarısı oynayanı izlemektir.\n- **Süre.** Dersleri aralıklı yapmak kalıcılığı artırır. Her ders arasında kısa bir tekrar yeterlidir.\n- **Ekran süresi ve güvenlik.** Bu platformdaki her şey sanaldır ve kişisel veri istemez. Oyun yapmak oyun oynamaktan farklıdır; ara vermeyi unutmayın.\n- **İlerleme.** Mini test sonuçları \"İlerlemem\" sayfasında beceri bazında görünür (taslak/pilot özellik; yalnız onay verildiyse kaydedilir).",
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
          ]
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
          ]
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
          ]
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
          ]
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
          ]
        }
      ]
    },
    {
      "title": "Harita ve dünya",
      "project": "Hazine adası",
      "guideMd": "### Hafta hedefleri\nBu haftanın sonunda öğrenci:\n1. Haritayı 16 x 16 pikselik karoların ızgarası olarak anlatabilir; sütun ve satırı 0'dan sayarak bir karoyu gösterebilir.\n2. Karonun \"duvar\" kutusunun sprite'ı durdurduğunu bilir ve bir odayı ya da labirenti duvarlarla kurabilir.\n3. `bir [Oyuncu] sprite'ı [Karo] karosuna dokununca` olayını kurar; olayın ilk değmede bir kez çalıştığını bilir.\n4. Olay karosunun sütun ve satırıyla dokunulan karoyu boşaltır; sayaçla kazanma koşulunu doğru sırayla kurar.\n5. Kamerayla büyük bir dünyada gezer; karoları sprite'a çevirir; anahtar, elmas, lav ve sandıklı Hazine adası oyununu kurar.\n\n### Haftanın planı\nHafta beş derstir; her ders yaklaşık 22-35 dakikadır. Aşağıdaki plan günde bir ders içindir.\n\n| Gün | Ders | Süre | Ne yapılır |\n|---|---|---|---|\n| 1 | İlk odan: duvarlı bir harita | ~22 dk | Anlatımı oku, odayı taş duvarla çevir, kediyi yürüt, mini testi çöz. |\n| 2 | Labirentten çık | ~22 dk | Kapı karosuna dokununca kazanma olayını kur, labirenti değiştirip kendin dene. |\n| 3 | Mağarada elmas avı | ~25 dk | Olay karosuyla elması boşalt, sayaçla kazan, lavı kur. |\n| 4 | Büyük bir dünya, kayan kamera | ~25 dk | Kamerayı bağla, elma karolarını sprite'a çevir, kameranın sınırlarını deney. |\n| 5 | Proje: Hazine adası | ~35 dk | Kural tablosunu yaz, dört olayı kur, haritayı kendi fikrinle değiştir. |\n\n### Ön koşul kontrolü\nHafta 1 ve Hafta 2 (Modül 11) tamamlanmış olmalı. Başlamadan önce şunları kontrol et:\n- `oyun başlayınca` bloğu, sprite oluşturma ve `oyuncu tuşlarıyla hareket etsin` bloğunu kullanabiliyor mu?\n- Sprite'lar arası çarpışma olayını, skor ve can bloklarını hatırlıyor mu?\n- Çarpma, bölme ve çıkarma ile küçük hesaplar (7 x 16, 480 - 160) yapabiliyor mu?\n\n### Kavram haritası\n- **Harita:** karo (16 x 16) → ızgara (sütun, satır; 0'dan) → karo takımı → duvar kutusu\n- **Olay:** karoya dokununca → ilk değmede bir kez → olay karosunun sütunu ve satırı → karoyu boşalt\n- **Kural:** sayaç (karo sayısı) → kazanma koşulu → lav (can ve başa dönüş) → oyunu bitir\n- **Dünya:** harita (büyük) ve ekran (160 x 120) → kamera takibi → karoyu sprite'a çevirme\n- **Proje:** kural tablosu → anahtar-kapı → skorlu mesaj → kendi harita tasarımı\n\n### Sık yapılan hatalar\n- **Sütun ve satırı 1'den saymak.** İlk sütun ve ilk satır 0'dır.\n- **Sütun ile satırı karıştırmak.** `sütun 10 satır 5` ile `sütun 5 satır 10` farklıdır; ikincisi 10 satırlı haritanın dışındadır.\n- **Duvar kutusunu işaretlememek.** Karo duvar gibi görünür ama sprite içinden geçer.\n- **`haritayı yükle` bloğunu `oyun başlayınca` dışında bırakmak.** Harita hiç gelmez.\n- **Karoyu boşaltan bloğa sabit sayı yazmak.** Hep aynı karo silinir; olay karosunu kullan.\n- **Kazanma kontrolünü karo silinmeden önce yapmak.** Sayaç bir fazla görünür.\n- **`oyunu bitir` bloğunu unutmak.** Mesaj çıkar ama oyun sürer.\n- **Karoları sprite'a çevirmeyi ya da kamerayı unutmak.** Elma toplanmaz; kedi ekrandan çıkar.\n- **Olayın beklemekle tekrar çalışacağını sanmak.** Karo olayı ilk değmede yalnız bir kez çalışır.\n\n### Hafta sonu tekrarı\n1. Her dersin kavram kartlarına bir kez daha bak ve \"sık yapılan yanlış\" satırlarını yüksek sesle oku.\n2. Mini testlerde yanlış yaptığın soruların açıklamalarını yeniden oku, sonra soruyu yeniden çöz.\n3. Boş bir haritada 12 x 8 bir oda çiz; çıkışı olan bir labirente çevir; kapı karosuna dokununca kazanılsın.\n4. Kendi haritanın genişliğini ve yüksekliğini piksel olarak hesapla; ekrana sığıp sığmadığını söyle.\n5. Kendi cümlelerinle şu soruyu cevapla: \"Kamera olmasa büyük bir harita ne olurdu?\"\n\nHafta sonu testi olarak beş dersin mini testleri yeterlidir; her derste 5 soru, toplam 25 soru. Hedef: her dersten en az 4 doğru. Eksik kalan dersin anlatımına dön.\n\n### Proje değerlendirme ölçütü (Hazine adası)\n| Ölçüt | Gelişmeli | Yeterli | İleri |\n|---|---|---|---|\n| Plan | Kural tablosu yok | Dört karo için ne olacağı tabloda yazılı | Tablo, bloklarla birebir uyuyor ve açıklanmış |\n| Anahtar ve kapı | Anahtar kayboluyor ama kapı açılmıyor | Anahtar alınınca kapı (sütun 10, satır 5) açılıyor | Kapı yerine başka bir engel ya da ikinci bir anahtar-kapı eklenmiş |\n| Elmas, lav, sandık | Bir ya da daha fazla kural çalışmıyor | Elmas skor veriyor, lav can götürüp başa gönderiyor, sandık oyunu kazandırıyor | Mesajda skor yazıyor; lav ve elmas değerleri düşünerek ayarlanmış |\n| Harita | Haritayı değiştirmemiş ya da yol kapanmış | Haritayı değiştirmiş ve sandığa yol açık | Yeni karo türü ve yeni kuralla genişletmiş |\n| Anlatım | Ne yaptığını anlatamıyor | Dört olayı adım adım anlatıyor | Hata yapıp nasıl bulduğunu anlatıyor |\n\n### Veli ve öğretmen notu\n- **Amaç.** Bu hafta çocuk bir oyunun kurallarını haritanın karolarına bağlamayı öğrenir. \"Hangi karoya dokununca ne olsun?\" sorusu, bir oyun tasarımcısının temel sorusudur.\n- **Nasıl destek olunur?** Takıldığında cevabı söylemek yerine şunları sor: \"Hangi karoya dokununca olay çalışmalı?\", \"Bu karo duvar mı değil mi?\", \"Sütun mu önce, satır mı?\", \"Kazanma kontrolü karo silindikten önce mi sonra mı?\"\n- **Hata yapmak güvenlidir.** Her şey sanaldır; ↺ düğmesi oyunu başa alır.\n- **Süre.** Dersleri aralıklı çalışmak kalıcılığı artırır. Proje dersinde çocuğa kendi haritasını çizmesi için ek zaman tanı.\n- **İlerleme.** Mini test sonuçları \"İlerlemem\" sayfasında beceri bazında görünür (taslak/pilot özellik; yalnız onay verildiyse kaydedilir).",
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
          ]
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
          ]
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
          ]
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
          ]
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
          ]
        }
      ]
    },
    {
      "title": "Düşman ve zekâ",
      "project": "Hayalet avcısı",
      "guideMd": "### Hafta hedefleri\nBu haftanın sonunda öğrenci:\n1. Zamanlayıcı olayıyla (`her ... ms'de bir`) ve `hızı ters çevir` bloğuyla bir düşmana devriye düzeni verebilir; hız, süre ve yol ilişkisini hesaplayabilir.\n2. `takip etsin` ve `arası mesafe` bloklarıyla \"yakınsa kovala, uzaksa dur\" kuralını kurabilir; `dursun` ile `takibi bıraksın` farkını açıklayabilir.\n3. Yönü derece olarak (0 yukarı, 90 sağ, 180 aşağı, 270 sol) okuyabilir ve rastgele sayıyla düşmana tahmin edilmesi zor bir hareket verebilir.\n4. A düğmesine basınca mermi sprite'ı yaratabilir; Mermi ve Düşman türleriyle çarpışma kuralı yazabilir; kullanılmayan mermileri silebilir.\n5. Devriye, takip, ateş, skor ve can kurallarını birleştirerek \"Hayalet avcısı\" oyununu tamamlayabilir.\n\n### Haftanın planı\nHafta beş derstir; her ders 20-35 dakikadır. Aşağıdaki plan günde bir ders içindir.\n\n| Gün | Ders | Süre | Ne yapılır |\n|---|---|---|---|\n| 1 | Devriye: düşman gidip gelir | ~20 dk | Anlatımı oku, yarasayı zamanlayıcıyla gidip gelir yap, süreyi değiştirip yolu hesapla, mini testi çöz. |\n| 2 | Takip: hayalet seni kovalıyor | ~20 dk | Takip ve mesafe bloklarını dene, uyanma mesafesini 40 ve 100 yap, farkı konuş. |\n| 3 | Rastgele hareket: şaşkın yarasa | ~20 dk | Rastgele yön kur, zamanlayıcıyı 300 ve 2000 ms yap, hangisinin daha tehlikeli olduğunu söyle. |\n| 4 | Ateş etme: lazerle vur | ~25 dk | Lazeri yarat, hızını ve türünü ayarla, vurma kuralını kur, mermiyi sil. |\n| 5 | Proje: Hayalet avcısı | ~35 dk | Planı tabloya yaz, beş parçayı tek tek kur, oyna ve ölçütle değerlendir. |\n\n### Ön koşul kontrolü\nBu hafta 1-3. haftalardaki şu becerilere dayanır; başlamadan önce kontrol et:\n- Bir sprite yaratıp ona tür verebiliyor mu? (Düşman, Oyuncu, Mermi)\n- Bir sprite'a hız verip ekranda kalmasını ya da sekmesini ayarlayabiliyor mu?\n- Bir `eğer ... değilse` bloğu kurabiliyor mu?\n- Çarpışma olayı, skor ve can bloklarını biliyor mu?\n- Değişken oluşturup sprite'ı değişkenle seçebiliyor mu?\n\n### Kavram haritası\n- **Zaman:** `her karede` (saniyede 60) · `her N ms'de bir` (milisaniye) · yol = hız x süre\n- **Hareket:** hız (x, y) · yön (derece) · ters çevirme · takip · dursun\n- **Zekâ:** devriye (kendi düzeni) · algılama eşiği (mesafe < N) · rastgelelik (tohumlu formül)\n- **Mermi:** düğmeye basılınca yeni sprite · tür (Mermi) · bu sprite / diğer sprite · silme\n- **Oyun:** plan tablosu · paylaşılan tür · skor ve kazanma · can ve kaybetme\n\n### Sık yapılan hatalar\n- **Hızı ters çevirmek yerine hızı yeniden yazmak.** Zamanlayıcıda \"x hızı 40\" yarasayı döndürmez.\n- **Ters çevirmede yanlış eksen.** y (dikey) seçiliyse yatay hız hiç değişmez.\n- **Milisaniyeyi saniye sanmak.** 1500 ms bir buçuk saniyedir; yol hesabından önce saniyeye çevir.\n- **Takip bloğunun iki kutusuna aynı sprite'ı koymak.** Sprite kendini takip eder ve kıpırdamaz.\n- **`dursun` yerine `takibi bıraksın`.** Hayalet son hızıyla kaymaya devam eder.\n- **Mesafe denetimini `oyun başlayınca` içine koymak.** Kural yalnız bir kez sınanır.\n- **Yön için 1-100 gibi küçük bir aralık.** Yön için 0-359 gerekir.\n- **Lazeri Nesne türünde yaratmak.** Çarpışma kuralı Mermi türünü bekler ve çalışmaz.\n- **Mermiyi hiç silmemek.** Vuran lazeri `sil`, kaçanı `dünyadan çıkınca silinsin` ile temizle.\n- **Kazanma denetimini skorun değişmediği yere koymak.** Oyun hiç bitmeyebilir.\n\n### Hafta sonu tekrarı\n1. Her dersin kavram kartlarına bir kez daha bak ve \"sık yapılan yanlış\" satırlarını yüksek sesle oku.\n2. Mini testlerde yanlış yaptığın soruların açıklamalarını yeniden oku, sonra soruyu yeniden çöz.\n3. Devriye yarasasını bakmadan sıfırdan kur; zamanlayıcıyı 1000 ve 2000 ms yapıp yarasanın bir yönde kaç piksel gittiğini hesapla, sonra çalıştırıp kontrol et.\n4. Hayaletin uyanma mesafesini 40, 70 ve 100 yap; hangisinde oyun adil geliyor, nedenini bir cümleyle yaz.\n5. Kendi cümlelerinle şu soruyu cevapla: \"Çarpışma kuralı neden sprite'ın adına değil türüne bakar?\"\n6. Yeni bir düşman türü düşün (örneğin örümcek) ve onun için bir plan tablosu çiz.\n\nHafta sonu testi olarak beş dersin mini testleri yeterlidir; her derste 5 soru, toplam 25 soru. Hedef: her dersten en az 4 doğru. Eksik kalan dersin anlatımına dön.\n\n### Proje değerlendirme ölçütü (Hayalet avcısı)\n| Ölçüt | Gelişmeli | Yeterli | İleri |\n|---|---|---|---|\n| Düşmanlar | Yarasa ya da hayaletlerden biri çalışmıyor | Yarasa sekiyor, hayaletler üstten gelip avcıyı takip ediyor | Hayaletlerin hızı ve üretim aralığı oyunu dengeli kılacak biçimde ayarlanmış |\n| Ateş | A'ya basınca lazer çıkmıyor ya da yanlış yöne gidiyor | Lazer avcının burnundan yukarı gidiyor ve ekrandan çıkınca siliniyor | İki lazer ya da B düğmesi gibi bir ekleme yapılmış |\n| Çarpışma ve skor | Vuruş skor vermiyor ya da lazer silinmiyor | Vuruş 1 puan veriyor, lazer ve hayalet kalkıyor | Kazanma ve kaybetme mesajları var |\n| Can | Düşman değince can değişmiyor | Can azalıyor, ekran sallanıyor, düşman siliniyor | `can bitince` ile oyun bitiyor |\n| Anlatım | Ne yaptığını anlatamıyor | Beş parçayı ve olaylarını anlatıyor | Bir hata yapıp nasıl bulduğunu anlatıyor |\n\n### Veli ve öğretmen notu\n- **Amaç.** Bu hafta çocuk \"kural koyma\" fikrini öğrenir: düşmanı bir zamanlayıcı, bir mesafe ya da bir rastgele sayı yönetir. Kod yazmak yerine blok sürüklendiği için sonuç hemen ekranda görülür.\n- **Nasıl destek olunur?** Takıldığında cevabı söylemek yerine şunları sor: \"Hangi olay bu bloğu çalıştırıyor?\", \"Hızın işareti ne?\", \"Sprite'ın türü ne?\", \"Bu blok olayın içinde mi?\"\n- **Hata yapmak güvenlidir.** Her şey sanaldır; ↺ düğmesi oyunu başa sardığında hiçbir şey bozulmaz. Blok değişikliği çalışan oyuna yansımaz, önce ↺ gerekir.\n- **Sayılar.** Hız ve yol hesapları dört işlemle yapılır; mesafe sorusu Pisagor'u hazır bilmeyi gerektirmez, sayıları verilen örneklerdeki gibi 3-4-5 oranına yakın seçilmiştir.\n- **Düşman tasarımı.** Oyunun adil olması önemli bir tasarım sorusudur; çocukla \"bu düşmandan kaçmak mümkün mü?\" sorusunu konuşmak hem matematik hem tasarım düşüncesi kazandırır.\n- **İlerleme.** Mini test sonuçları \"İlerlemem\" sayfasında beceri bazında görünür (taslak/pilot özellik; yalnız onay verildiyse kaydedilir).",
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
          ]
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
          ]
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
          ]
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
          ]
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
          ]
        }
      ]
    },
    {
      "title": "Platform ve fizik",
      "project": "Platform atlayıcı",
      "guideMd": "### Hafta hedefleri\nBu haftanın sonunda öğrenci:\n1. Hız ile ivmenin farkını söyleyebilir; yerçekimini aşağı yönlü ivme olarak kurabilir.\n2. Zıplamayı eksi y hızı olarak kurar, havada zıplamayı `alttan bir duvara dokunuyor mu?` koşuluyla engeller.\n3. Altın, diken ve kapı gibi geçilebilir karolar için `karosuna dokununca` olayı yazar; `olay karosunun` bloklarını kullanır.\n4. Çarpışmayı düşüş hızı ve konum ölçütleriyle \"ezme\" ve \"yan çarpma\" olarak ayırır.\n5. Haftanın parçalarını kurallar tablosuyla planlayıp tek bir platform seviyesinde birleştirir.\n\n### Haftanın planı\nHafta beş derstir. Aşağıdaki plan günde bir ders içindir; son gün proje olduğu için daha uzundur.\n\n| Gün | Ders | Süre | Ne yapılır |\n|---|---|---|---|\n| 1 | Yerçekimi: kahraman yere insin | ~20 dk | Anlatımı oku, ivme bloğunu kur, hareket biçimini sağa-sola seç, mini testi çöz. |\n| 2 | Zıplama: A ile zıpla | ~20 dk | Zıplama hızını dene, `eğer` koşulunu ekle, havada zıplamayı engelle. |\n| 3 | Platformlar, altınlar ve dikenler | ~25 dk | Altın ve diken olaylarını kur, karo boşaltmayı dene. |\n| 4 | Düşmanın üstüne zıpla | ~25 dk | İki ölçütü kur, ezme ve yan çarpmayı sına. |\n| 5 | Proje: Platform atlayıcı | ~35 dk | Kurallar tablosunu doldur, altın-diken-kapı olaylarını yaz, oyunu oyna ve ayarla. |\n\n### Ön koşul kontrolü\nBu hafta şu bilgiler gerekir; eksik varsa ilgili dersi tekrar et:\n- Sprite oluşturmak ve `hızı x y` bloğunu kullanmak (Modül 11, ders 1-4).\n- Çarpışma olayını ve `diğer sprite` kavramını bilmek (ders 6).\n- `eğer` bloğu ve skor/can bloklarını kullanmak (ders 7 ve 9).\n- Karo haritası, duvar ve `karosuna dokununca` olayı (ders 11-13) ve kamera (ders 14).\n- Öğrenci toplama ve çarpma işlemlerinde rahat olmalı; bu hafta hız x süre hesapları var.\n\n### Kavram haritası\n- **Fizik:** hız → ivme → yerçekimi (y yönünde pozitif ivme) → zıplama (eksi y hızı) → tepe ve düşüş\n- **Koordinat:** x sağa, y aşağı artar → yukarı = eksi hız, küçük y\n- **Karo olayları:** geçilebilir karo → `karosuna dokununca` → kenar tetikleme → `olay karosunun sütunu / satırı` → karoyu boşalt\n- **Çarpışma:** çarpışma olayı → `bu sprite` / `diğer sprite` → düşüş hızı ve konum ölçütü → `ve` → `eğer ... değilse`\n- **Proje:** kurallar tablosu → altın, diken, kapı, ezme → kamera → sınama ve zorluk ayarı\n\n### Sık yapılan hatalar\n- **Hareket biçimini dört yöne seçmek.** Motor y hızını tuşlara göre yeniden yazar; yerçekimi neredeyse etkisiz kalır.\n- **Hız ile ivmeyi karıştırmak.** Hızla düşersen kahraman hep aynı hızla gider, ivmeyle düşersen hızlanır.\n- **Zıplama hızına artı sayı yazmak.** y aşağı doğru artar; zıplamak için eksi gerekir.\n- **Zıplamayı yerde mi koşuluna bağlamamak.** Kahraman havada da zıplar.\n- **Yatay hızı sıfırlamak.** Zıplarken `x hızı` kutusuna kahramanın kendi x hızı konmalı.\n- **Altın karosunu boşaltmamak ya da sabit sütun/satır yazmak.** Altın yerinde kalır ya da yanlış karo boşalır.\n- **Olay türünü yanlış seçmek.** Oyuncu yerine Düşman seçersen olay çalışmaz.\n- **Ezme ölçütünde ters karşılaştırma.** Düşman üstte olduğunda ezme sayılır.\n- **`bu sprite` ile `diğer sprite`ı karıştırmak.** Düşman yerine kahraman yok olur.\n- **Dikenden sonra hızı sıfırlamamak.** Kahraman yukarı hızla başlangıçtan havaya fırlayabilir.\n\n### Hafta sonu tekrarı\n1. Her dersin kavram kartlarını bir kez daha oku ve \"sık yapılan yanlış\" satırlarını yüksek sesle söyle.\n2. Mini testlerde yanlış yaptığın soruların açıklamalarını yeniden oku, sonra soruyu yeniden çöz.\n3. Yerçekimi ve zıplamayı sıfırdan, bakmadan kur. Zıplama hızını -150, -250 ve -350 yap ve kahramanın yüksekliğini karşılaştır.\n4. Hız -260 ve ivme 520 iken tepe noktasının kaç saniyede geldiğini hesapla, sonra oyunda dene.\n5. Kendi cümlelerinle şu soruyu cevapla: \"Oyun, kahramanın düşmanı ezdiğini mi yoksa yandan çarptığını mı nasıl anlıyor?\"\n\nHafta sonu testi olarak beş dersin mini testleri yeterlidir; toplam 25 soru. Hedef: her dersten en az 4 doğru. Eksik kalan dersin anlatımına dön.\n\n### Proje değerlendirme ölçütü (Platform atlayıcı)\n| Ölçüt | Gelişmeli | Yeterli | İleri |\n|---|---|---|---|\n| Hareket | Kahraman düşmüyor ya da zıplamıyor | Yerçekimi, yürüme ve zıplama çalışıyor; havada zıplama engelli | Zıplama gücünü kendisi ayarlamış ve nedenini açıklıyor |\n| Karo olayları | Altın ya da diken olayı çalışmıyor | Altın kayboluyor ve skor artıyor; dikende can azalıp kahraman başa dönüyor | Başa dönerken hızı sıfırlıyor ve nedenini söylüyor |\n| Kapı ve kazanma | Kapıya dokununca bir şey olmuyor | Mesaj yazılıyor ve oyun kazanılıyor | Kazanma koşulunu değiştirmiş (örneğin skor şartı) ve açığı düşünmüş |\n| Düşman | Ezme ve yan çarpma ayrılmıyor | Üstten ezince düşman yok oluyor, yandan çarpınca can azalıyor | İki ölçütü açıklıyor ve eşiği değiştirip etkisini gösteriyor |\n| Tasarım ve anlatım | Oyun oynanamayacak kadar zor ya da kolay | Seviye oynanabilir; kuralları anlatabiliyor | Arkadaşına oynatıp zorluğu ayarlamış |\n\n### Veli ve öğretmen notu\n- **Amaç.** Bu hafta çocuk fizik formüllerini ezberlemez; yerçekimi ve zıplamanın bir sayıyla ayarlanabildiğini deneyerek görür. Hız ve ivmeyi tartışırken oyundaki hissi konuşmak yeterlidir.\n- **Nasıl destek olunur?** Takıldığında cevabı söylemek yerine şunu sor: \"Hangi blok bunu yapıyor?\", \"Sayıyı değiştirirsen ne olur?\", \"Kahraman düşüyor mu, yoksa yerde mi?\" Birlikte tahmin edip sonra denemek iyi çalışır.\n- **Süre.** Dersler 20-35 dakikadır. Zıplama gücünü ayarlamak gibi deneme zamanı gerektiren işlerde acele ettirme.\n- **Güvenlik.** Her şey tarayıcıda çalışır, harici bir donanım yoktur. Oyunda dikenden korunmak yalnız bir oyun kuralıdır.\n- **İlerleme.** Mini test sonuçları \"İlerlemem\" sayfasında beceri bazında görünür (taslak/pilot özellik; yalnız onay verildiyse kaydedilir).",
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
          ]
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
          ]
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
          ]
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
          ]
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
          ]
        }
      ]
    },
    {
      "title": "Proje: tam oyunlar",
      "project": "Final oyunum",
      "guideMd": "### Hafta hedefleri\nBu haftanın sonunda öğrenci:\n1. Bir oyunun iskeletini (oyuncu, hedef, tehlike, kazanma, kaybetme) beş soruluk tasarım kartıyla anlatabilir.\n2. Skor ve canı oyun başlarken ayarlayıp kazanma kuralını `≥` ile doğru yazabilir.\n3. Değişkenlerle zamanla artan zorluk ve bayrakla (anahtar gibi) hafıza kurabilir.\n4. `eğer … ise … değilse` ile iki yoldan birini seçebilir ve karo koordinatını piksele çevirebilir.\n5. Dört adımlı dedektif yöntemiyle bozuk bir oyunun hatalarını bulup düzeltebilir; oyuna ses ve sarsıntı gibi cila ekleyebilir.\n6. Kendi fikrinden, dört turda sekiz hedefin hepsini karşılayan tam bir oyun yapabilir.\n\n### Haftanın planı\nHafta beş derstir. Plan günde bir ders içindir; final dersi daha uzun olduğu için ayrı bir gün ayırmak iyi olur.\n\n| Gün | Ders | Süre | Ne yapılır |\n|---|---|---|---|\n| 1 | Oyun iskeleti: oyuncu, hedef, skor, bitiş | ~25 dk | Tasarım kartını doldur, kedi ve elmalar oyununu kur, ≥ ile = farkını dene. |\n| 2 | Tam oyun 1: Uzay savunması | ~30 dk | Vurma, can, süre ve zorluk kurallarını sırayla kur; artış miktarını değiştirip dengele. |\n| 3 | Tam oyun 2: Labirent kaçışı | ~30 dk | Anahtar bayrağını ve iki kollu kapı kuralını yaz; hayaletin hızını ayarla. |\n| 4 | Cila ve hata ayıklama: bozuk oyunu onar | ~25 dk | Dedektif yöntemiyle üç hatayı düzelt, sonra ses ve sarsıntı ekle. |\n| 5 | Final: Kendi oyunun | ~40 dk | Kartı doldur, dört turda oyunu yap, hedefleri ✓ yap ve oyunu arkadaşına oynat. |\n\n### Ön koşul kontrolü\nBu hafta önceki haftaların bloklarını kullanır. Başlamadan önce şunlar rahat olmalı:\n- Sprite oluşturma, ok tuşlarıyla hareket ve çarpışma olayı (1. ve 2. hafta)\n- Skor, can ve `skoru değiştir` bloğu\n- Değişken oluşturmak ve `kadar değiştir` ile `yap` farkı\n- Harita sekmesi, karo ve takip eden düşman (3. ve 4. hafta; labirent dersi için)\n- Basit çarpma, bölme ve toplama (hız ve süre hesapları için)\n\n### Kavram haritası\n- **Tasarım:** tasarım kartı → oyuncu, hedef, tehlike → kazanma ve kaybetme kuralı\n- **Kurallar:** olay + koşul → çarpışma olayı (bir kez) → her karede olayı (saniyede 60 kez)\n- **Hafıza:** değişken → bayrak (0 ya da 1) → olaylar arası köprü\n- **Karar:** `eğer … ise` → `değilse` kolu → `≥` ile `=` farkı\n- **Zorluk ve zaman:** `her N ms'de bir` → geri sayım → `süre bitince` → denge\n- **Kalite:** dedektif yöntemi → hata ayıklama → cila → hedefler paneli\n\n### Sık yapılan hatalar\n- **Kazanma kontrolünü olayın dışına koymak.** Skor değişir ama kural hiç sorulmaz.\n- **`skor = 3` yazmak.** Skor atlıyorsa (2, 4, 6) hiç tetiklenmez; `≥` kullan.\n- **`yap` yerine `kadar değiştir` ya da tersi.** Artış beklerken değer sabit kalır.\n- **Bayrağı 1 yapmamak ya da başlangıçta 0 yapmamak.** Kapı hep kilitli kalır.\n- **Karo bloğuna piksel yazmak.** Numaralar 0'dan başlar ve bir karo 16 pikseldir.\n- **Karelik kuralda sprite'ı silmemek.** `her karede` olayı saniyede 60 kez çalışır ve üç can 50 ms'de gider.\n- **Yanlış sprite türü seçmek.** Olay Yiyecek bekliyorsa Nesne türündeki sprite olayı tetiklemez.\n- **Etkinlikteki ↺ Başa dön düğmesine basmak.** Bloklar silinir; oyunu denemek için sahnedeki ↺ kullanılır.\n\n### Hafta sonu tekrarı\n1. Her dersin kavram kartlarını yeniden oku ve \"sık yapılan yanlış\" satırlarını yüksek sesle söyle.\n2. Mini testlerde yanlış yaptığın soruların açıklamalarını yeniden oku, sonra soruyu yeniden çöz.\n3. Uzay savunmasında artış miktarını 5 yerine 10 yap. 28. saniyedeki `hiz` değerini ve en yavaş uzaylının hızını hesapla, sonra oyunda dene.\n4. Labirent kaçışına ikinci bir anahtar ve ikinci bir kapı ekle. Hangi bayrakları kullanacağını önce kâğıda yaz.\n5. Arkadaşından kendi oyununu oynamasını iste; hiçbir şey söylemeden izle. İlk 10 saniyede nerede takıldı?\n\nHafta sonu testi olarak beş dersin mini testleri yeterlidir; her derste 5 soru, toplam 25 soru. Hedef: her dersten en az 4 doğru. Eksik kalan dersin anlatımına dön.\n\n### Proje değerlendirme ölçütü (Final oyunum)\n| Ölçüt | Gelişmeli | Yeterli | İleri |\n|---|---|---|---|\n| Tasarım | Kart yok, oyunun amacı belirsiz | Beş sorunun hepsi cevaplanmış ve oyunla uyuşuyor | Kart oyunla birebir uyuyor, oyuncuya amaç ilk 10 saniyede anlaşılıyor |\n| Kurallar | Skor ya da can çalışmıyor | Toplayınca skor artıyor, tehlikeye değince can azalıyor | Zaman, bayrak ya da seviye gibi ek bir kural eklenmiş |\n| Bitiş | Oyun kazanılamıyor ya da hiç bitmiyor | Kazanma ve kaybetme çalışıyor | Her iki bitişte de anlamlı bir mesaj gösteriliyor |\n| Cila ve denge | Ses ve efekt yok, oyun çok kolay ya da imkânsız | Ses ve en az bir efekt var, oyun oynanabilir | Sayılar denenip ayarlanmış ve değişiklikler açıklanmış |\n| Anlatım | Ne yaptığını anlatamıyor | Oyunu ve kurallarını adım adım anlatıyor | Bir hata yapıp nasıl bulduğunu dedektif adımlarıyla anlatıyor |\n\n### Veli ve öğretmen notu\n- **Amaç.** Bu hafta ezber değil, bir fikri baştan sona çalışan bir ürüne dönüştürme deneyimidir. Final oyunu öğrencinin kendi tasarımıdır; \"daha iyisi\" yerine \"ne eklemek istersin?\" diye sorun.\n- **Nasıl destek olunur?** Takıldığında cevabı vermeyin. \"Belirti ne?\", \"Hangi olay çalışıyor?\", \"Hangi bloğu şüphelendin?\" sorularıyla dedektif yöntemini birlikte uygulayın.\n- **Süre.** Final dersi 40 dakikadır; öğrenci yorulursa tur arasında ara verilebilir. Oyun, ↺ ile sınırsız denenebilir.\n- **Güvenlik.** Her şey tarayıcıda çalışır; gerçek donanım yoktur. Oyun dosyası **Kaydet** ile bilgisayara indirilirse kişisel bilgi içermez, ancak adı verirken gerçek ad ve soyad kullanmamaya özen gösterin.\n- **İlerleme.** Mini test sonuçları \"İlerlemem\" sayfasında beceri bazında görünür (taslak/pilot özellik; yalnız onay verildiyse kaydedilir).",
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
          ]
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
          ]
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
          ]
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
          ]
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
          ]
        }
      ]
    }
  ]
}
