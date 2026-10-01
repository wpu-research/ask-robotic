import type { ModuleContent } from './types'

// Sıralama Harvard Creative Computing ünitelerinden esinlenir (Keşfet, Animasyon, Hikâye, Oyun, Derinleş, Proje);
// metinler özgündür (o müfredat CC BY-NC-SA, ticari kullanıma kapalı).
export const modul2: ModuleContent = {
  slug: 'scratch',
  title: 'Scratch ile Kendi Oyununu Yap',
  track: 'cocuk',
  position: 2,
  minAge: 8,
  weeks: [
    {
      title: 'Tanışma',
      project: 'İlk projem',
      lessons: [
        {
          title: 'Programlanmış dans (ekransız)',
          durationMin: 25,
          problem: 'Arkadaşına bir dans öğretmen gerekiyor ama sadece yazılı komut kartlarıyla. Dans nasıl yazılır?',
          contentMd: `## Etkinlik
1. Üç kâğıda sırayla şunları yaz: **adım at**, **dön**, **alkış**.
2. Bu kartlarla 6 adımlık bir dans **programı** oluştur. Kartları sıraya dizmen yeterli.
3. Bir arkadaşın ya da aile üyen programı **aynen** uygulasın. Yorum katmasın, sadece kartlara baksın.
4. Dans çirkin çıktıysa programı düzelt: kartları değiştir, ekle, çıkar.
5. Şimdi dansa **tekrar** ekle: "3 kere tekrarla: adım, alkış".

## Ebeveyn / öğretmen notu
Amaç: bilgisayarın **yorum yapmadığını**, yazılanı aynen uyguladığını hissettirmek. Dansı uygulayan kişi kartlardaki bir belirsizliği düzeltmesin. Çocuk "program yanlış çıktı, benim hatam" demeyi öğrensin.`,
          question: 'Dans neden senin istediğin gibi çıkmadı? Programda neyi değiştirdin?',
        },
        {
          title: 'Scratch\'te ilk projem',
          durationMin: 30,
          problem: 'Ekrandaki karakteri senin yazdığın talimatlar yönetecek. Peki karakter, sahne ve talimatlar nerede duruyor?',
          contentMd: `## Hazırlık
Tarayıcıda Scratch'i aç ve **Yeni proje** başlat. Hesap açmadan da çalışabilirsin.

## Etkinlik
1. Ekranın bölümlerini bul: **Sahne** (sağ üst), **Sprite listesi** (sağ alt), **Blok paleti** (sol), **Kod alanı** (orta).
2. Kedi sprite'ını silip yeni bir sprite seç. Sprite'ın **Kostümler** sekmesine bak.
3. Sahneye bir **arka plan** ekle.
4. Olaylar (sarı) kategorisinden **yeşil bayrak tıklandığında** bloğunu kod alanına sürükle.
5. Altına Hareket (mavi) kategorisinden bir hareket bloğu tutturup yeşil bayrağa bas.
6. **10 blok challenge:** 10 farklı blok kullanarak sprite'ına bir şey yaptır. Kaçını yapabildin?

## Güvenlik notu
Scratch topluluğuna proje paylaşırken **gerçek adını, okulunu, adresini ve fotoğrafını** projeye ya da profiline yazma.`,
          question: 'Sprite, kostüm ve sahne arasındaki fark ne?',
        },
      ],
    },
    {
      title: 'Animasyon',
      project: 'Canlı karakter',
      lessons: [
        {
          title: 'Kostüm değiştir, karakter yürüsün',
          durationMin: 30,
          problem: 'Çizgi film nasıl hareket ediyor? Aynı karakterin biraz farklı resimlerini hızlıca art arda göstersek ne olur?',
          contentMd: `## Etkinlik
1. Bir sprite seç. **Kostümler** sekmesinde en az iki kostümü olsun (hazır olanlardan seç ya da kendin çiz).
2. Görünüm (mor) kategorisinden **sonraki kostüm** bloğunu bul.
3. Yeşil bayrak bloğunun altına şunu kur: *sonraki kostüm → 0,2 saniye bekle*.
4. Çalıştır. Karakter yürüyor gibi görünüyor mu?
5. Bekleme süresini 0,05 ve 1 saniye yap. Hızlandıkça ve yavaşladıkça ne değişiyor?

## Hata ayıklama ipucu
Karakter hiç kıpırdamıyorsa: yeşil bayrak bloğuna bloklar **gerçekten tutturulmuş** mu? Bloğun yan yana durması yetmez.`,
          question: 'Bekleme süresini kısaltınca animasyon neden daha akıcı göründü?',
        },
        {
          title: 'Sonsuza kadar ve tekrar',
          durationMin: 30,
          problem: 'Karakterin sürekli yürümesini istiyorsun ama 100 tane blok sürüklemek istemiyorsun. Başka bir yol var mı?',
          contentMd: `## Etkinlik
1. Önceki projene devam et. Kontrol (turuncu) kategorisinden **sonsuza kadar** bloğunu al.
2. Kostüm değiştirme ve hareket bloklarını bunun **içine** al.
3. Karakter ekranın kenarına çarpınca ne oluyor? **Kenara geldiğinde sek** bloğunu ekle.
4. Şimdi **tekrar (10 kere)** bloğuyla sonsuz yerine sayılı bir döngü dene.
5. İki sprite ekle, ikisi de aynı anda animasyon yapsın. İki ayrı kod alanında yeşil bayrakla başla.

## Meydan okuma
Karakter 10 adım atınca durup bir şey söylesin.

## Ebeveyn / öğretmen notu
Anahtar kavram: **döngü** ve **paralellik** (iki karakter aynı anda). Çocuk bloğu "içine koymayı" kaçırıyorsa, Scratch'in blok şeklinin bir kap gibi aldığını gösterin.`,
          question: '"Sonsuza kadar" ile "10 kere tekrarla" arasındaki fark ne? Hangisini ne zaman kullanırsın?',
        },
      ],
    },
    {
      title: 'Müzik ve etkileşim',
      project: 'Kendi çalgım',
      lessons: [
        {
          title: 'Tuşa bas, ses çıksın',
          durationMin: 30,
          problem: 'Bir piyano tuşuna basınca ses çıkar. Bunu klavyenle sen nasıl yapabilirsin?',
          contentMd: `## Etkinlik
1. Olaylar (sarı) kategorisinden **... tuşuna basıldığında** bloğunu al.
2. Altına Ses (pembe) kategorisinden bir **ses çal** bloğu tutturup tuşu seç (örneğin **a**).
3. Aynı mantıkla **s**, **d**, **f** tuşlarına başka sesler bağla.
4. Her tuş için sprite'ın **rengini** değiştir. Görsel ve ses birlikte çalsın.
5. Fareyle **sprite'a tıklayınca** ses çalan bir düğme de ekle.

## Ebeveyn / öğretmen notu
Kavram: **olay** (event). Program, bir şeyin olmasını bekliyor. Çocuk "yeşil bayrağa basmadan da program çalışıyor" fark etsin.`,
          question: 'Yeşil bayrak ile tuşa basılması arasındaki fark ne? İkisi de program başlatıyor mu?',
        },
        {
          title: 'Kendi çalgım',
          durationMin: 35,
          problem: 'Bir davul seti ya da küçük bir piyano yapmak istesen kaç tuş, kaç ses, nasıl görünüm gerekir?',
          contentMd: `## Etkinlik
1. **Plan:** kâğıda çalgının resmini çiz. Kaç tuş? Hangi sesler?
2. En az **4 tuşlu** bir çalgı yap. Her tuş farklı ses çalsın.
3. Her tuş için **görsel geri bildirim** ekle: renk değişimi, büyüme, parlama.
4. Bir sprite'ı ayrı bir **kayıt düğmesi** yap: tıklayınca bir melodi kendiliğinden çalsın (ses çal, bekle, ses çal…).
5. Bir arkadaşına çaldır, kafası karışan yerleri not et ve düzelt.

## Meydan okuma
Çalgıya ses yüksekliğini değiştiren iki tuş ekle (artır / azalt).`,
          question: 'Arkadaşın çalgını kullanırken en çok nerede zorlandı? Ne değiştirdin?',
        },
      ],
    },
    {
      title: 'Hikâye',
      project: 'İki karakterli hikâye',
      lessons: [
        {
          title: 'Konuşma ve zamanlama',
          durationMin: 30,
          problem: 'İki karakter sırayla konuşuyor. Biri bitmeden öbürü konuşmaya başlarsa ne olur?',
          contentMd: `## Etkinlik
1. İki sprite seç (örneğin bir hayvan ve bir insan) ve bir arka plan.
2. Birinci sprite: yeşil bayrakta **söyle (2 saniye)** bloğuyla ilk cümleyi söylesin.
3. İkinci sprite: aynı bayrakla başlıyor. **2 saniye bekle**, sonra yanıt versin.
4. Üç satırlık bir konuşma yaz. Beklemeleri **dikkatle** hesapla ki konuşmalar üst üste binmesin.
5. Konuşmayı **yanlış zamanlamayla** bozup tekrar düzelt. Neyi değiştirdin?

## Hata ayıklama ipucu
İki sprite'ın cümleleri çakışıyorsa bekleme sürelerini topla: birincinin konuşma süresi + boşluk = ikincinin bekleme süresi.`,
          question: 'Beklemeyi kaldırırsan neden iki karakter aynı anda konuşur?',
        },
        {
          title: 'Yayın ve sahne değişimi',
          durationMin: 35,
          problem: 'Bir karakter "başlayabilirsin" diye haber verince diğer karakter nasıl duyar? Beklemeleri hesaplamak yerine daha iyi bir yol var mı?',
          contentMd: `## Etkinlik
1. Olaylar (sarı) kategorisinde **yayın … mesajı** ve **… mesajını aldığımda** bloklarını bul.
2. Önceki hikâyende bekleme bloklarını kaldır. Birinci karakter cümlesini bitirince **"sıra sende"** mesajını yayınlasın.
3. İkinci karakter **"sıra sende" mesajını aldığımda** yanıtlasın, sonra yeni bir mesaj yayınlasın.
4. **Arka plan değiştirme:** mesaj gelince arka planı değiştirerek ikinci sahneyi başlat.
5. Hikâyenin **başlangıcı, olayı ve sonu** olsun: en az 3 sahne.

## Ebeveyn / öğretmen notu
Kavram: **mesajlaşma** (broadcast). Karakterler birbirine "haber veriyor". Bekleme süreleriyle saymak kırılgandır; mesajla çalışmak daha sağlamdır, çocuk farkı kendisi görsün.

## Çift çalışma (opsiyonel)
Bir arkadaşla "bunu sen yaz, ben onunla konuşayım" şeklinde hikâyeyi böl: her biri bir karakteri yazsın, mesajlarla birleştirin. Kimin kodu nerede, kaynak olarak yazıp not alın.`,
          question: 'Beklemeyle mi, mesajla mı çalışmak daha güvenli? Hikâyeyi uzatsan hangisi bozulur?',
        },
      ],
    },
    {
      title: 'Oyun 1',
      project: 'Yakalama oyunu',
      lessons: [
        {
          title: 'Hareket et ve yakala',
          durationMin: 30,
          problem: 'Oyunda bir karakteri klavyeyle yönetip düşen bir nesneyi yakalamak istiyorsun. Neler gerekiyor?',
          contentMd: `## Etkinlik
1. İki sprite: **oyuncu** (kova/sepet) ve **nesne** (elma).
2. Oyuncu: **sonsuza kadar** içinde, **sağ ok** tuşuna basılıysa x'i 10 artır, **sol ok** tuşuna basılıysa 10 azalt (Algılama ve Kontrol kategorileri).
3. Nesne: üstte başlasın, **sonsuza kadar** aşağı doğru insin (y'yi azalt).
4. Nesne **oyuncuya değince** veya yere inince tekrar yukarı çıksın.
5. Oyuncuyla nesneyi çarpıştırıp ne olduğunu gör.

## Hata ayıklama ipucu
Oyuncu hareket etmiyorsa tuş kontrolünü sonsuz döngünün **içine** koyduğundan emin ol.`,
          question: '"Tuşuna basıldığında" ile "tuşuna basılı mı?" arasındaki fark ne? Hangisi oyuncuyu sürekli hareket ettirir?',
        },
        {
          title: 'Skor: değişkenler',
          durationMin: 30,
          problem: 'Oyunda kaç elma yakaladığını hatırlaması gerekiyor. Bilgisayar sayıyı nerede tutar?',
          contentMd: `## Etkinlik
1. Değişkenler (turuncu-kırmızı) kategorisinde **Bir değişken oluştur** düğmesine bas, adı **skor** olsun.
2. Yeşil bayrakta **skoru 0 yap**.
3. Elma oyuncuya değince **skoru 1 artır** ve elmayı yukarıdan yeniden başlat.
4. Skor sahnede görünüyor mu? Görünüyorsa çalıştır, yakaladıkça artıyor mu?
5. Bonus: altın elma yakalayınca **skor 5 artsın**.

## Meydan okuma
Skor 10 olunca "Kazandın!" desin.

## Ebeveyn / öğretmen notu
Kavram: **değişken** = üzerine isim yazılı bir kutu. Çocuğa "kutunun içinde ne var" diye sorun. Yeşil bayrakta skoru sıfırlamayı unutmak çok yaygın bir hata, hata avı gibi bulmasına izin verin.`,
          question: 'Skoru yeşil bayrakta 0 yapmasaydın ne olurdu?',
        },
      ],
    },
    {
      title: 'Oyun 2',
      project: 'Oyunu geliştir',
      lessons: [
        {
          title: 'Zamanlayıcı, can ve oyun bitti',
          durationMin: 35,
          problem: 'Oyunun sonsuza kadar sürmesini istemiyorsun. Oyun ne zaman bitmeli, bitince ne olmalı?',
          contentMd: `## Etkinlik
1. İki yeni değişken: **can** (3 ile başlasın) ve **süre** (30 ile başlasın).
2. Elma yere düşünce **canı 1 azalt**.
3. **Eğer can = 0 ise** sonsuz döngüyü durdur ve "Oyun bitti" de (Kontrol ve İşlemler kategorileri).
4. Süre için sonsuz döngünün içinde 1 saniye bekleyip süreyi 1 azalt. 0 olunca oyun bitsin.
5. Oyun bitince **tüm sprite'lar** durmalı. Hangi blok bunu yapıyor?

## Hata ayıklama ipucu
"Oyun bitti" yazısı hiç çıkmıyorsa koşulda **=** yerine **<** kullanmayı dene (can 0'ın altına da düşebilir).`,
          question: 'Oyunu bitirmek için hangi iki koşulu kullandın? İkisi aynı anda doğru olursa ne olur?',
        },
        {
          title: 'Rastgele ve klonlar',
          durationMin: 35,
          problem: 'Her oyunda elma aynı yerden düşerse sıkıcı olur. Aynı anda birçok elma düşsün istesen yüzlerce sprite mi çizmen gerekir?',
          contentMd: `## Etkinlik
1. **Rastgele:** İşlemler kategorisindeki **... ile ... arasında rastgele sayı seç** bloğunu bul. Elma başlarken x konumunu **−200 ile 200 arasında rastgele** yap.
2. **Klon:** Kontrol kategorisinde **kendimin klonunu oluştur** bloğunu bul. Elmanın ana kodunda, her saniyede bir klon üret.
3. **Klon olarak başladığımda** bloğuna klonun davranışını yaz: aşağı insin, oyuncuya değince skor artsın, sonra kendini sil.
4. Birkaç saniyede kaç elma düşüyor? Sayıyı ayarla.

## Meydan okuma
Zamanla düşme hızını artır (oyun zorlaşsın).

## Ebeveyn / öğretmen notu
Klonlar zor bir kavram: aynı sprite'ın çoğaltılmış kopyaları. Çocuk zorlanırsa önce tek elmayla rastgele konum, sonra klon.`,
          question: 'Klon kullanmasaydın aynı anda 10 elma için ne yapman gerekirdi?',
        },
      ],
    },
    {
      title: 'Kendi bloğum ve listeler',
      project: 'Bilgi yarışması',
      lessons: [
        {
          title: 'Kendi bloğunu yap',
          durationMin: 30,
          problem: 'Aynı 5 bloğu programın her yerinde tekrar tekrar yazıyorsun. Onları tek bir blok olarak adlandırıp çağırabilsen?',
          contentMd: `## Etkinlik
1. Bloklarım (pembe) kategorisinde **Bir blok yap** düğmesine bas, adı **zıpla** olsun.
2. Tanım bloğunun altına şunu kur: *y'yi 20 artır → 0,1 saniye bekle → y'yi 20 azalt*.
3. Ana kodunda **zıpla** bloğunu kullan. Birkaç kez çağır.
4. Bloğa bir **girdi** ekle (örneğin yükseklik) ve kaç birim zıplayacağını çağırırken belirle.
5. Şimdi **dans**, **ses** gibi başka bloklar tanımla.

## Ebeveyn / öğretmen notu
Kavram: **fonksiyon / soyutlama**. Bir işi bir kez yazıp adıyla çağırmak. Kod kısalır ve değiştirmesi kolaylaşır: zıplama yüksekliğini bir yerde değiştirince her yerde değişir.`,
          question: 'Kendi bloğunu yapmak neden işini kolaylaştırdı? Bir yerde değişiklik yapınca ne oldu?',
        },
        {
          title: 'Liste ile bilgi yarışması',
          durationMin: 35,
          problem: 'Bir yarışmada 5 soru var. Her soruyu ayrı bir değişkenle tutmak mı, yoksa hepsini bir listede tutmak mı daha iyi?',
          contentMd: `## Etkinlik
1. Değişkenler kategorisinden **Bir liste oluştur** de, adı **sorular** olsun. İçine 4-5 soru ekle.
2. Bir ikinci liste **cevaplar** yap, aynı sırayla cevapları yaz.
3. Bir değişken **sıra** (1 ile başlasın). Sprite **sorular listesinin sıra. öğesini** sorsun (**sor … ve bekle** bloğu).
4. Cevap **cevaplar listesinin sıra. öğesine** eşitse "Doğru!" de ve skoru artır, değilse "Yanlış" de. Sonra **sıra'yı 1 artır**.
5. Liste bittiğinde yarışma sonlansın ve skoru söylesin.

## Meydan okuma
Soruları her seferinde rastgele sırada sor.`,
          question: 'Soruları listede tutmanın değişkenlerle ayrı ayrı tutmaktan farkı ne? Soru sayısını artırmak neden kolay?',
        },
      ],
    },
    {
      title: 'Proje',
      project: 'Benim oyunum / hikâyem',
      lessons: [
        {
          title: 'Fikir ve plan',
          durationMin: 30,
          problem: 'Şimdiye kadar öğrendiklerini birleştirip kendi projeni yapma zamanı. Ama önce: ne yapacaksın?',
          contentMd: `## Etkinlik
1. Proje türünü seç: **oyun**, **hikâye**, **çalgı/müzik** ya da **bilgi yarışması**.
2. Kâğıda **plan** yap:
   - Kim/ne var (sprite'lar)?
   - Hangi sahneler/seviyeler?
   - Hangi bloklar gerekecek (olay, döngü, değişken, mesaj, kendi blok)?
3. Projenin **en küçük çalışan halini** (MVP) yaz: sadece bir sprite ve tek bir etkileşim.
4. Planını bir arkadaşına ya da aileye 1 dakikada **anlat**. Anlattıkça aklına gelen eksikleri yaz.
5. Başkasının projesini **remix**le başlamak istersen orijinal sahibini mutlaka projede belirt.

## Ebeveyn / öğretmen notu
Plan, çocuğun "bitmeyen proje" tuzağına düşmesini azaltır. Küçük başlayıp büyütmeyi önerin.`,
          question: 'Projenin en küçük çalışan hali ne? Önce ona odaklanırsan nasıl bir yol izlersin?',
        },
        {
          title: 'Yap, test et, sergile',
          durationMin: 45,
          problem: 'Projeni bitirmenin sırrı: yap, dene, bul, düzelt, tekrar dene. Sen hazır mısın?',
          contentMd: `## Etkinlik
1. Planına göre projeni yap. Her yeni özellikten sonra **yeşil bayrakla dene**.
2. Bir **test arkadaşı** bul: projeni kullandırırken **ona yardım etme**, sadece izle. Nerede takıldı? Not al.
3. Notlardan en az **iki şeyi düzelt**.
4. **Sergi:** projeni aileye/arkadaşlara göster. Anlat: ne yaptın, hangi bloklar seni zorladı, neyi çözdün?
5. Paylaşırken proje açıklamasına **nasıl oynanır** ve **hangi fikirlerden esinlendiğini** yaz. Kişisel bilgi yazma.

## Sırada ne var?
Scratch'te ekrandaki karakterleri yönettin. Bir sonraki modülde (Arduino) bir devreyi ve gerçek ışıkları, sensörleri yöneteceksin: aynı mantık, farklı bir dünya.`,
          question: 'Test arkadaşın projende neyi fark etti, sen fark etmemiştin? Neyi düzelttin?',
        },
      ],
    },
  ],
}
