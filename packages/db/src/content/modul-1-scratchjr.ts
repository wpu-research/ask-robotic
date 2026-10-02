import type { ModuleContent } from './types'

// Ders akışı Boston College CAL ve Harvard Creative Computing sıralamasından esinlenir;
// metinler özgündür (bu müfredatlar CC BY-NC-SA, ticari kullanıma kapalı).
// Bütün dersler platformun kendi blok uygulamasında ("yandaki uygulama") yapılır; etkinlik tanımları
// apps/web/src/lib/jr/activities/modul1.ts içindedir (anahtar: scratchjr:<hafta>:<ders>).
export const modul1: ModuleContent = {
  slug: 'scratchjr',
  title: 'Blokla Kodlamaya İlk Adım',
  track: 'cocuk',
  position: 1,
  minAge: 5,
  weeks: [
    {
      title: 'Komut ver, robot yapsın',
      project: 'Robot oyunu ve ilk hareket',
      lessons: [
        {
          title: 'Robot oyunu',
          durationMin: 25,
          problem:
            'Bir robot sadece sana söylenen şeyi yapar, başka hiçbir şey yapmaz. Ona "git" desen nereye gider?',
          contentMd: `## Hazırlık
Yandaki uygulamada sahnede bir **robot** ve uzakta bir **yıldız** var. Robotu yıldızın yanına götüreceksin. Solda blokların durduğu **blok alanı** var: en solda renkli yuvarlak düğmelerle **kategoriler**, yanında seçtiğin kategorinin blokları, sağında boş çalışma alanı. Bu derste yalnız iki kategori açık: **Başlat** (sarı) ve **Hareket** (mavi).

## Etkinlik
1. **Başlat** kategorisine dokun, **🏁 Yeşil bayrak** bloğunu tut ve çalışma alanına sürükle. Betik başladı. Betik, bloklardan yapılmış bir tren; yeşil bayrak onun lokomotifi (üstü kubbeli).
2. **Hareket** kategorisine geç. Robot yalnızca şu komutları bilir: **İleri**, **Sağa dön**, **Sola dön** ve **Zıpla**.
3. **İleri** bloğunu sürükleyip yeşil bayrağın hemen altına yaklaştır; birbirine yapışınca bırak. (Sürüklemeden bloğa bir kez dokunursan blok betiğin sonuna kendiliğinden eklenir.) Bloğun içindeki sayıya dokunup yeni sayıyı yazarak adım sayısını değiştir.
4. Robot önce sağa gidip sonra aşağı inmeli. Altına **Sağa dön** bloğunu ekle, arkasına bir **İleri** daha koy.
5. Sahnenin üstündeki yeşil **🏁 Başlat** düğmesine bas. (Betiğin herhangi bir bloğuna dokunursan yalnız o betik çalışır.) Robot yıldıza vardı mı? Varmadıysa adım sayılarını değiştir. **↺ Başa al** ile robotu başlangıca geri götür.
6. Sıra deneyi: **Sağa dön** bloğunu tutup ilk **İleri**'nin önüne taşı. Dikkat: bir bloğu ortadan tutarsan altındaki bloklar da onunla gelir. Tekrar **🏁 Başlat**'a bas. Robot nereye gitti? Sonra eski sırayı geri kur.
7. Yıldıza varınca kutlamak için en sona bir **Zıpla** ekle.

## Ebeveyn için
Bu dersin tek amacı **sıra** kavramı: komutların sırası sonucu değiştirir. Çocuk yanlış sıra kurarsa düzeltmeyin; robotun yaptığını birlikte izleyin ve "Robot ne yaptı? Sen ne istemiştin?" diye sorun. Çocuğun hatayı kendisi bulması, bilgisayarın da böyle çalıştığını hissettirir. Bloğu çocuğun yerine yerleştirmeyin; yalnızca yanında oturup sorular sorun.`,
          question: 'Sağa dön bloğunu İleri bloğundan önce koyunca robot nereye gitti? Neden?',
        },
        {
          title: 'İlk hareket',
          durationMin: 25,
          problem: 'Robotla yıldızı bulduk. Şimdi kediyi yürütelim. Komutları tek tek vermek yerine sıraya dizersek ne olur?',
          contentMd: `## Hazırlık
Yandaki uygulamada sahnede bir kedi var. Blok alanında bu derste **Başlat** ve **Hareket** kategorileri açık.

## Etkinlik
1. **Başlat** kategorisinden **🏁 Yeşil bayrak** bloğunu çalışma alanına sürükle. Betiğin en üstü hep bir başlatma bloğu olur.
2. **Hareket** kategorisinde **İleri** bloğuna 3 kez dokun (ya da üç kez sürükleyip bayrağın altına yapıştır). Üç İleri bloğu alt alta dizildi.
3. **🏁 Başlat**'a bas. Kedi yürür! **↺ Başa al** ile kediyi başlangıca götür.
4. Bir İleri bloğundaki sayıya dokun ve yeni bir sayı yaz. Kedi daha az ya da daha çok yürür.
5. **Sağa dön** bloğunu ekle, arkasına yine **İleri** koy. Kedi köşeyi dönüyor mu? **Geri** bloğuyla kediyi geri yürütmeyi de dene.
6. Yanlış bir blok mu koydun? Bloğu sürükleyip sağ alttaki **çöp kutusuna** bırak: silinir. Bir bloğu sürükleyerek yerini de değiştirebilirsin. Ortadan tutarsan altındaki bloklar da gelir.

Uygulamadaki hedef listesi ne yapacağını gösterir. Bir hedef tamamlanınca işaretlenir.

## Ebeveyn için
Çocuk bloğu sürüklemekte zorlanırsa kategorideki bloğa dokunarak eklemek de yeterlidir. "Blokları bir tren gibi düşün, vagonlar sırayla gider." Yeşil bayrak "başla" düğmesidir: betiğin en üstünde bir başlatma bloğu yoksa hiçbir şey olmaz. Bu ilk günlerde işin buraya kadar gelmesi yeter.`,
          question: 'Yeşil bayrağa basınca ne oldu? Bayrak olmasaydı ne olurdu?',
        },
      ],
    },
    {
      title: 'Aynı şeyi tekrar tekrar',
      project: 'Dans eden karakter',
      lessons: [
        {
          title: 'Tekrar etmek',
          durationMin: 20,
          problem: 'Bir şarkıda aynı nakarat dört kere söyleniyor. Her seferinde baştan yazmak yerine kısaltmanın bir yolu var mı?',
          contentMd: `## Hazırlık
Yandaki uygulamada kedinin betiği hazır: **Zıpla**, **Söyle** ve **İleri** blokları arka arkaya **4 kez** dizilmiş. Betik çok uzun!

## Etkinlik
1. **🏁 Başlat**'a bas ve kediyi izle. Aynı üç hareketi dört kez yaptı.
2. Aynı işi kısa yoldan yapalım. **Kontrol** kategorisinden **Tekrarla** bloğunu çalışma alanına sürükle. Tekrarla, "C" harfine benzer; C'nin içindeki bloklar tekrar edilir.
3. Zıpla bloğunu tutarsan altındaki bloklar da gelir. Zıpla, Söyle ve İleri'yi birlikte **sürükleyip C'nin ağzına** bırak; yapışınca C onları sarar. Tekrarla'yı yeşil bayrağın altına yapıştır.
4. Artık fazla kopyalara gerek yok. Kalan blokları sürükleyip **çöp kutusuna** bırakarak sil.
5. Tekrarla'nın içindeki sayıya dokun, **4** yaz ve **🏁 Başlat**'a bas. Kedi aynı şeyi yaptı mı?
6. Sayıyı değiştirip dene: 2 kez, 6 kez… Kedi her seferinde farklı uzaklığa gider.

## Ebeveyn için
Hedef **döngü** (tekrar) fikri: aynı işi tekrar tekrar yazmak yerine "şu kadar kere tekrarla" demek. Çocuğa "Önce kaç blok vardı, şimdi kaç?" diye sorun. Kısa yol, aynı sonucu daha az blokla verir.`,
          question: 'Aynı hareketi 10 kere yaptırmak için kısa yol neydi?',
        },
        {
          title: 'Dans eden karakter',
          durationMin: 30,
          problem: 'Karakterin kendi kendine dans etmesini istiyorsun ama sürekli dokunmak istemiyorsun. Ne yapmalı?',
          contentMd: `## Hazırlık
Yandaki uygulamada bir kedi ve boş bir betik alanı var. Bu derste yeni kategoriler de açık: **Görünüm** (mor), **Ses** (yeşil), **Kontrol** (turuncu) ve **Bitiş** (kırmızı).

## Etkinlik
1. **Başlat** kategorisinden **🏁 Yeşil bayrak** bloğunu çalışma alanına sürükle.
2. **Hareket** kategorisinden dans adımlarını seç: **İleri**, **Geri**, **Zıpla**, **Sağa dön**… Birkaç tane ekleyip **🏁 Başlat**'a bas. Kedi dans etti!
3. **Görünüm** kategorisinden **Büyü** ya da **Küçül** bloğu ekle. Kedi büyüyor mu?
4. **Ses** kategorisinde **Ses çal** bloğu var. İçindeki numaraya dokunup 1, 2 ya da 3 yaz.
5. Kısa yol: **Kontrol** kategorisinden **Tekrarla** bloğunu ekle. Dans bloklarını **sürükleyip C'nin ağzına** bırak. Tekrar sayısını sayıya dokunup yazarak ayarla.
6. Sonsuz dans için **Bitiş** kategorisindeki **Sonsuza kadar** bloğunu dene. Bu blok hiç bitmez; durdurmak için sahnenin üstündeki kırmızı **⏹ Dur** düğmesine bas. Sonsuza kadar'ın arkasına blok eklenemez, çünkü o hiç bitmiyor.

## Ebeveyn için
Dansı çocuk seçsin. Hareketlere **hikâye** katın: "Bu kedi neden dans ediyor? Yağmur mu başladı?" Sonsuz tekrar çocuğa şaşırtıcı gelebilir: **⏹ Dur** düğmesini birlikte bulun. Hangi blokların C'nin içinde, hangilerinin dışında olduğuna dikkat ettirin; içeridekiler tekrarlanır.`,
          question: 'Karakter neden durmadan dans etti? Hangi blok bunu yaptırdı?',
        },
      ],
    },
    {
      title: 'Ne olunca ne olsun?',
      project: 'Konuşan hayvan',
      lessons: [
        {
          title: 'Olay: dokununca ne olur?',
          durationMin: 20,
          problem: 'Kapı çalınca ne yaparsın? Peki kapı çalmazsa?',
          contentMd: `## Hazırlık
Yandaki uygulamada sahnede bir **ev** ve bir **kedi** var. Ev, kapı çalınca "Kim o?" diyecek. Önce karakter şeridinden bir karaktere dokunarak onu seç; çalışma alanındaki betikler seçili karaktere aittir.

## Etkinlik
1. **🏁 Başlat**'a bas. Hiçbir şey olmadı, değil mi? Hiçbir karakterin betiği yok; bir şey olmasını sağlayan **olay** da yok.
2. Karakter şeridinden **ev**'i seç. **Başlat** kategorisinden **👆 Dokununca** bloğunu çalışma alanına sürükle. Bu betik, karaktere dokununca çalışır.
3. **Görünüm** kategorisinden **Söyle** bloğunu altına yapıştır ve yazı kutusuna dokunup **Kim o?** yaz.
4. Sahnedeki eve dokun. Ev "Kim o?" dedi! Olay: dokunmak. Tepki: konuşmak.
5. Şimdi **kedi**yi seç. Ona **👆 Dokununca** ve **Hareket** kategorisinden **Zıpla** ekle. Kediye dokununca zıplasın.
6. Bonus: evin betiğine **Kontrol** kategorisinden **Bekle** ve bir **Söyle** daha ekle. Ev "Kim o?" dedikten biraz sonra başka bir şey söylesin.

## Ebeveyn için
Bu, **olay** (event) kavramı: program bir şey olmasını bekler. Olay olmayınca hiçbir şey olmaz. Çocuğa "Yeşil bayrakla dokunmak arasında ne fark var?" diye sorun. Her karakterin kendi betikleri vardır; karakterler birbirine mesaj göndermez.`,
          question: 'Hiçbir şeye dokunmayınca ne oldu? Bilgisayar da böyle mi bekliyor?',
        },
        {
          title: 'Dokununca konuşan hayvan',
          durationMin: 30,
          problem: 'Bir hayvanı sen dokununca konuştur. Bayrağa basmadan, sadece ona dokunarak.',
          contentMd: `## Hazırlık
Yandaki uygulamada sahnede bir hayvan var. Önceki derste öğrendiğin **👆 Dokununca** bloğunu bu sefer daha uzun bir betikte kullanacaksın.

## Etkinlik
1. **Başlat** kategorisinden **👆 Dokununca** bloğunu çalışma alanına sürükle.
2. **Görünüm** kategorisinden **Söyle** bloğunu altına ekle. Yazı kutusuna kısa bir cümle yaz (örneğin "Merhaba, ben köpeğim!").
3. Sahnedeki hayvana dokun. Konuştu mu? Bu betik için **🏁 Başlat**'a basman gerekmez.
4. **Kontrol** kategorisinden **Bekle** bloğu ekle, sonra bir **Söyle** daha. Hayvan iki cümle söylesin: söyle, bekle, söyle. Bekle'nin içindeki sayıya dokunup süreyi ayarla.
5. Bonus: karakter şeridindeki **+** düğmesine bas, listeden **Top**'u seç. Şeritten topu seç, ona **Dokununca** ve **Hareket** kategorisinden **Zıpla** ekle. Topa dokununca zıplasın!

## Ebeveyn için
**Bekle** bloğu zamanlamanın ilk tadı. "Konuşma balonu çok çabuk kayboluyor, nasıl yavaşlatırız?" diye sorun, çözümü çocuk bulsun. Betikler karakterlere aittir: şeritte hangi karakter seçiliyse sağdaki betikler onundur.`,
          question: 'Hayvan ne zaman konuştu: bayrağa basınca mı, dokununca mı? Fark ne?',
        },
      ],
    },
    {
      title: 'Hikâyenin sahneleri',
      project: 'İki sayfalı hikâye',
      lessons: [
        {
          title: 'Başı, ortası, sonu',
          durationMin: 20,
          problem: 'Bir hikâyeyi hangi sırayla anlatırsan anlaşılır? Sonu başa koyarsan ne olur?',
          contentMd: `## Hazırlık
Yandaki uygulamada sahnenin altında bir **sayfa şeridi** var: numaralı küçük sayfalar, bir **+** düğmesi, bir **Arka plan** listesi ve **Sayfayı sil** düğmesi. Her sayfa hikâyenin bir sahnesi olacak. Bu derste blok yazmayacaksın; yalnız sahneleri kuracaksın.

## Etkinlik
1. Hikâyen üç parçalı olsun: **1. başlangıç**, **2. olay**, **3. son**. Örneğin: kedi evden çıkar, yağmur başlar, kedi eve döner.
2. Şeritteki **+** düğmesine iki kez bas: artık 3 sayfan var.
3. Her sayfaya dokunup seç. **Arka plan** listesinden o sahneye uyan bir manzara seç (örneğin Çimen, Gece, Oda). En az iki sahnenin arka planı farklı olsun.
4. Karakter şeridindeki **+** ile her sayfaya en az bir karakter ekle.
5. Sayfaları sırayla gez: hikâyen başı, ortası ve sonuyla anlaşılıyor mu? Sırayı bozsaydın hikâye nasıl olurdu?

## Ebeveyn için
Bu ders, çocuğun hikâyesini önce **planlamasını** sağlar: sahneleri kurmak, sonra blokla bağlamayı kolaylaştırır. Çocuğa hikâyeyi yüksek sesle anlattırın: "İlk sahnede ne var? İkincide ne değişti?" Planlı çocuk bir sonraki derste kaybolmaz.`,
          question: 'Hikâyen kaç sahne? Hangi sahne önce olmalı?',
        },
        {
          title: 'İki sayfalı hikâye',
          durationMin: 30,
          problem: 'Birinci sahne bitince ikinci sahneye nasıl geçeriz?',
          contentMd: `## Hazırlık
Yandaki uygulamada kısa bir hikâye yapacaksın. Sayfa şeridinde **+** düğmesi yeni sayfa ekler, **Arka plan** listesi sayfanın manzarasını değiştirir, **Sayfayı sil** o sayfayı kaldırır.

## Etkinlik
1. 1. sayfadayken **Arka plan** listesinden bir manzara seç (örneğin Çimen).
2. Karakterin için **Yeşil bayrak** ile başlayan kısa bir betik yaz: biraz **İleri** git, sonra bir şey **Söyle**.
3. Sayfa şeridindeki **+** düğmesine bas: yeni, boş bir sayfa (2) eklenir. Arka planını değiştir (örneğin Gece ya da Oda).
4. 2. sayfada karakter şeridindeki **+** ile bir karakter ekle ve ona **Yeşil bayrak** ile başlayan bir betik yaz: **Söyle** bloğuyla ikinci sahnenin sözünü söylet.
5. 1. sayfaya dön. Betiğin sonuna **Bitiş** kategorisinden **Sayfaya git** bloğunu ekle; içine **2** yaz: bu sayı, gidilecek **sayfanın numarasıdır** ("2. sayfaya git").
6. 1. sayfadayken **🏁 Başlat**'a bas: hikâye birinci sahneden ikinciye geçiyor mu? **↺ Başa al** ile baştan izle.

**Sayfaya git** yeni sayfaya geçer ve o sayfadaki yeşil bayrak betiklerini kendiliğinden başlatır.

## Ebeveyn için
Önce çocuk hikâyesinin iki sahnesini anlatsın, sonra uygulamaya taşısın. Her şeyi tek sayfaya sığdırmaya çalışırsa "bunu başka bir sahneye taşısak mı?" diye hatırlatın. Her sayfanın karakterleri ayrıdır: 2. sayfada karakteri yeniden eklemek gerekir. **Sayfayı sil** düğmesi o sayfanın bütün içeriğini siler; birlikte dikkatli olun.`,
          question: 'Birinci sahneden ikinciye hangi blok geçirdi?',
        },
      ],
    },
    {
      title: 'Hata yapmak programcının işi',
      project: 'Benim hikâyem',
      lessons: [
        {
          title: 'Hata avı',
          durationMin: 25,
          problem: 'Programım çalışmıyor! Ama hata olmadan program yazılır mı? Programcılar hata bulunca ne yapar?',
          contentMd: `## Hazırlık
Yandaki uygulamada bu sefer proje **hazır ama bozuk**. Sahnede bir kedi ve uzakta bir **yıldız** var. Kedinin yıldıza ulaşması gerek, ama ulaşamıyor. Hedef listesinde ne gerektiğini görürsün.

## Etkinlik
1. **🏁 Başlat**'a bas ve kedinin ne yaptığına bak. Yıldıza vardı mı? **↺ Başa al** ile başa dön.
2. Şimdi dedektif ol: betiklere tek tek bak. Programda **en az üç hata** saklı. Şunlara dikkat et:
   - Bir betiğin en üstünde başlatma bloğu yok mu? Başlatma bloğu olmayan betik **soluk** görünür ve **Başlat**'a basınca çalışmaz. Dikkat: böyle bir betiğe yeşil bayrak koyarsan ana betikle **aynı anda** başlar ve kendi yönüne göre yürür; kedi yukarı değil sağa gider. Betiği silersen de kedi yıldıza varamaz. Doğru çözüm: bu betiğin bloğunu sürükleyip ana betiğin **Sola dön** bloğunun altına yapıştırmak.
   - Kedi yanlış yöne mi dönüyor? **Sağa dön** mü olmalıydı, **Sola dön** mü?
   - Yeterince yürümüyor mu? **Tekrarla** sayısı ya da **İleri** adımı az olabilir. Sayıya dokunup yeni değer yazabilirsin.
3. Her düzeltmeden sonra **🏁 Başlat**'a bas. Kedi yıldızın yanına varınca hedef işaretlenir.
4. Bir şeyi yanlışlıkla mı bozdun? En altta **Projeyi başa döndür** düğmesi var.

## Ebeveyn için
"Yanlış yaptın" demeyin; "**Hata yakaladın!**" deyin. Programcıların işinin büyük kısmı hata bulmaktır. Çocuk takılınca ipucu verin: "Kedi nerede durdu? Orada hangi blok bitti?" Hatayı bulunca neyi düzelttiğini yüksek sesle anlatmasını isteyin.`,
          question: 'En zor bulduğun hata hangisiydi? Nasıl buldun?',
        },
        {
          title: 'Benim hikâyem (final)',
          durationMin: 40,
          problem: 'Bu hafta öğrendiklerinle kendi hikâyeni yapma zamanı. Hangi karakter, hangi sahne, ne olacak?',
          contentMd: `## Hazırlık
Önce kafanda bir plan yap: hangi karakterler, kaç sahne, kim ne yapacak? Planını yüksek sesle ebeveynine anlat. Sonra yandaki uygulamada boş bir proje seni bekliyor.

## Etkinlik
1. Karakter şeridindeki **+** ile istediğin karakterleri listeden seç. **Arka plan** listesinden sahnelerinin manzarasını belirle.
2. Blok alanındaki bütün kategoriler açık: **Başlat** (Yeşil bayrak, Dokununca), **Hareket**, **Görünüm**, **Ses**, **Kontrol** (Bekle, Tekrarla) ve **Bitiş** (Sonsuza kadar, Sayfaya git, Dur).
3. Hikâyen en az şunları içersin: **bir Tekrarla ya da Sonsuza kadar**, **bir Söyle**, **iki sayfa**.
4. Sık sık **🏁 Başlat**'a basıp dene. Çalışmayan bir betik varsa en üstünde bir başlatma bloğu olup olmadığına bak.
5. Bitince **aileye sun**: projeyi çalıştır ve anlat.

## Ebeveyn için
Sunumda sorular sorun: "Bu karakter neden böyle yapıyor?" "Bunu nasıl yaptın?" Çocuğun **kendini anlatması** öğrenmenin kalıcı olduğunu gösterir. Hedefler yalnız alt sınırdır; çocuk daha fazlasını eklemekte özgür. Projeyi tebrik edin; mükemmel olmak şart değil.`,
          question: 'Hikâyende en çok neyi sevdin? Bir sonraki sefer neyi değiştirirdin?',
        },
      ],
    },
  ],
}
