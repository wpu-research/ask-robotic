import type { ModuleContent } from './types'

// Ders akışı Boston College CAL ve Harvard Creative Computing sıralamasından esinlenir;
// metinler özgündür (bu müfredatlar CC BY-NC-SA, ticari kullanıma kapalı).
export const modul1: ModuleContent = {
  slug: 'scratchjr',
  title: 'ScratchJr ile İlk Adımlar',
  track: 'cocuk',
  position: 1,
  minAge: 5,
  weeks: [
    {
      title: 'Komut ver, robot yapsın',
      project: 'Robot oyunu ve ilk hareket',
      lessons: [
        {
          title: 'Robot oyunu (ekransız)',
          durationMin: 25,
          problem:
            'Bir robot sadece sana söylenen şeyi yapar, başka hiçbir şey yapmaz. Ona "git" desen nereye gider?',
          contentMd: `## Hazırlık
Ekran yok. Bir oda, birkaç yastık ve bir hedef (örneğin kapının önündeki oyuncak) yeterli.

## Oyun
1. **Ebeveyn robot olur**, çocuk programcı. Robot yalnızca şu 4 komutu bilir: **ileri 1 adım**, **sağa dön**, **sola dön**, **zıpla**.
2. Çocuk komutları teker teker söyler, robot uygular. Hedefe ulaşana kadar devam edin.
3. Robota şunu söyletin: "dön, ileri, ileri". Sonra sırayı değiştirin: "ileri, ileri, dön". Aynı yere varıyor mu?
4. Roller değişsin: çocuk robot olsun, ebeveyn programcı.

## Ebeveyn için
Bu dersin tek amacı **sıra** kavramı: komutların sırası sonucu değiştirir. Çocuk yanlış söylerse robot düzeltmesin; **robotun yaptığı şeyi aynen yapın** ve çocuk hatayı kendisi bulsun. Bu, bilgisayarın da böyle çalıştığını hissettirir.`,
          question: 'Komutların sırasını değiştirince robot başka bir yere gitti mi? Neden?',
        },
        {
          title: 'ScratchJr ile ilk hareket',
          durationMin: 25,
          problem: 'Oyundaki robotu şimdi ekranda yürütelim. Komutları tek tek söylemek yerine sıraya dizersek ne olur?',
          contentMd: `## Hazırlık
ScratchJr uygulamasını açın (tablet veya telefon). Yeni bir proje başlatın.

## Etkinlik
1. Kedi karakteri sahnede. Sahnenin altındaki **mavi (hareket) blokları** bulun.
2. Bir **ileri** bloğunu program alanına sürükleyin. Bloğa dokunun: karakter bir kez yürür.
3. Üç tane ileri bloğunu **yan yana tutturun**. Şimdi bloklara dokunun: sıra çalışır.
4. Başına sarı başlatma bloklarından **yeşil bayrağı** koyun. Artık yeşil bayrağa basınca program kendi kendine çalışır.
5. Bir **dön** bloğu ekleyin. Kedi bir duvara çarpmadan hedefe gitsin.

## Ebeveyn için
Çocuk blokları tutturamazsa elini yönlendirin ama **bloğu siz yerleştirmeyin**. "Blokları bir tren gibi düşün, vagonlar birbirine tutunmalı." Yeşil bayrak, "başla" düğmesidir: onsuz program kendiliğinden başlamaz.`,
          question: 'Yeşil bayrağa basınca ne oldu? Bayrak olmasaydı ne olurdu?',
        },
      ],
    },
    {
      title: 'Aynı şeyi tekrar tekrar',
      project: 'Dans eden karakter',
      lessons: [
        {
          title: 'Tekrar etmek (ekransız)',
          durationMin: 20,
          problem: 'Bir şarkıda aynı nakarat dört kere söyleniyor. Her seferinde baştan yazmak yerine kısaltmanın bir yolu var mı?',
          contentMd: `## Etkinlik
1. Birlikte bir **dans** icat edin: *alkış, adım, zıpla*.
2. Dansı arka arkaya **4 kez** yapın. Her seferinde "alkış, adım, zıpla" diye tek tek söylemek yorucu, değil mi?
3. Kısa yol: "**Dört kere tekrarla: alkış, adım, zıpla.**" Aynı işi tek cümleyle söylediniz.
4. Şimdi tekrar sayısını değiştirin: 2 kere, 6 kere, sonsuza kadar (ebeveyn yorulana kadar!).

## Ebeveyn için
Hedef **döngü** (tekrar) fikrini bedenle yaşamak. "Sonsuza kadar" şakası önemli: ScratchJr'da bir sonraki derste "sonsuza kadar tekrarla" bloğunu kullanacaklar.`,
          question: 'Aynı hareketi 10 kere yaptırmak için kısa yol neydi?',
        },
        {
          title: 'Dans eden karakter',
          durationMin: 30,
          problem: 'Karakterin kendi kendine dans etmesini istiyorsun ama sürekli dokunmak istemiyorsun. Ne yapmalı?',
          contentMd: `## Etkinlik
1. Yeni bir proje açın, bir karakter seçin.
2. **Başlatma** bloğunu (yeşil bayrak) koyun.
3. Hareket bloklarından iki-üç tane ekleyin: ileri, geri, zıpla gibi.
4. **Görünüm (mor) bloklarından** biri ekleyin: büyü, küçül ya da konuş.
5. Hepsini **turuncu "tekrarla" bloğunun** içine alın. Sonra kırmızı bitiş bloklarındaki **sonsuz tekrarı** deneyin.
6. İsterseniz **ses (yeşil) bloğu** ile bir ses ekleyin ve karakterin rengini çizim editöründe değiştirin.

## Ebeveyn için
Çocuğun dansı kendisi seçmesine izin verin. Karakterin hareketlerine **hikâye** katın ("Bu kedi yağmurda mı dans ediyor?"). Sonsuz tekrarı durdurmak için kırmızı dur düğmesini gösterin.`,
          question: 'Karakter neden durmadan dans etti? Hangi blok bunu yaptırdı?',
        },
      ],
    },
    {
      title: 'Ne olunca ne olsun?',
      project: 'Konuşan hayvan',
      lessons: [
        {
          title: 'Olay: kapı çalınca (ekransız)',
          durationMin: 20,
          problem: 'Kapı çalınca ne yaparsın? Peki kapı çalmazsa?',
          contentMd: `## Etkinlik
1. **"Eğer… olursa… yap"** oyunu oynayın. Ebeveyn bir işaret verir, çocuk karşılık verir:
   - zil sesi çıkarınca → çocuk "Kim o?" der,
   - el çırpınca → çocuk zıplar,
   - elini kaldırınca → çocuk durur.
2. Rolleri değiştirin. Çocuk işaretleri icat etsin.
3. Şimdi "hiçbir işaret yok" durumunu deneyin: **hiçbir şey olmaz**.

## Ebeveyn için
Bu, **olay** (event) kavramı: program, bir şey olmasını bekler. ScratchJr'da bu, sarı başlatma bloklarıyla yapılır ("dokununca başla", "yeşil bayrak").`,
          question: 'İşaret verilmeyince ne oldu? Bilgisayar da böyle mi bekliyor?',
        },
        {
          title: 'Dokununca konuşan hayvan',
          durationMin: 30,
          problem: 'Bir hayvanı sen dokununca konuştur. Bayrağa basmadan, sadece ona dokunarak.',
          contentMd: `## Etkinlik
1. Yeni bir proje, bir hayvan karakter.
2. Başlatma blokları arasından **"dokununca başla"** bloğunu seçin.
3. Altına **konuş (mor)** bloğunu ve yazı kutusuna kısa bir cümle ekleyin.
4. Karaktere dokunun: konuştu mu?
5. **Bekle** bloğu ekleyip iki cümle söyletin (konuş, bekle, konuş).
6. Bonus: sahneye bir **top** ekleyin. Dokununca zıplasın (yukarı, aşağı).

## Ebeveyn için
"Bekle" bloğu zamanlamanın ilk tadı. Çocuğa "Konuşma baloncuğu çok hızlı kayboluyor, onu nasıl yavaşlatırız?" diye sorun, çözümü kendisi bulsun.`,
          question: 'Hayvan ne zaman konuştu: bayrağa basınca mı, dokununca mı? Fark ne?',
        },
      ],
    },
    {
      title: 'Hikâyenin sahneleri',
      project: 'İki sayfalı hikâye',
      lessons: [
        {
          title: 'Başı, ortası, sonu (ekransız)',
          durationMin: 20,
          problem: 'Bir hikâyeyi hangi sırayla anlatırsan anlaşılır? Sonu başa koyarsan ne olur?',
          contentMd: `## Etkinlik
1. Üç kâğıt alın. Birlikte kısa bir hikâye çizin: **1. başlangıç**, **2. olay**, **3. son** (örneğin: kedi evden çıkar → yağmur başlar → kedi eve döner).
2. Kâğıtları karıştırın, sıraya dizin. Sırayı bozunca hikâye anlaşılıyor mu?
3. Şimdi hikâyeyi **iki sahneye** indirin. İlk sahnede neler var, ikinci sahnede neler değişti?

## Ebeveyn için
ScratchJr'da her sahne bir **sayfa**. Bu ders, çocuğun hikâyesini önce kâğıtta planlamasını sağlar. Planlı çocuk uygulamada kaybolmaz.`,
          question: 'Hikâyen kaç sahne? Hangi sahne önce olmalı?',
        },
        {
          title: 'İki sayfalı hikâye',
          durationMin: 30,
          problem: 'Birinci sahne bitince ikinci sahneye nasıl geçeriz?',
          contentMd: `## Etkinlik
1. Yeni bir proje açın. Sayfanın üstündeki **arka plan** düğmesiyle bir manzara seçin.
2. Karakter ekleyin, **yeşil bayrakla** başlayan kısa bir program yazın (yürü, konuş).
3. Yeni bir **sayfa ekle** düğmesine basın. Arka planı değiştirin (gece, kış, ev içi).
4. Birinci sayfanın programının sonuna **"sayfaya git"** bloğunu ekleyin (kırmızı bitiş grubunda).
5. Yeşil bayrağa basın: hikâye iki sahnede akıyor mu?
6. **Yazı aracı** ile bir başlık ekleyin.

## Ebeveyn için
Önce çocuk kâğıttaki planı ekrana taşısın. Bir sayfada her şeyi toplamaya çalışırsa, "başka bir sahneye mi taşısak?" diye hatırlatın.`,
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
          contentMd: `## Etkinlik
Ebeveyn **bilerek bozuk** bir program hazırlar (çocuk görmeden). Örnek hatalar:
- Yeşil bayrak bloğu yok → hiçbir şey olmuyor.
- Bloklar birbirine **tutturulmamış**.
- Hareket bloğu yanlış yöne bakıyor.
- Tekrar sayısı çok fazla / az.

Çocuk **dedektif**: program ne yapmalıydı, ne yapıyor? Hatayı bulup düzeltsin. Her düzeltmeden sonra yeşil bayrakla deneyin.

## Ebeveyn için
"Yanlış yaptın" demeyin. "**Hata yakaladın!**" deyin. Programcıların işinin büyük kısmı hata bulmaktır. Çocuk takılınca ipucu verin: "Program hangi blokta durdu gibi görünüyor?"`,
          question: 'En zor bulduğun hata hangisiydi? Nasıl buldun?',
        },
        {
          title: 'Benim hikâyem (final)',
          durationMin: 40,
          problem: 'Bu hafta öğrendiklerinle kendi hikâyeni yapma zamanı. Hangi karakter, hangi sahne, ne olacak?',
          contentMd: `## Etkinlik
1. Önce **kâğıtta plan**: karakter, sahneler, kim ne yapacak.
2. Uygulamada yapın. Kullanabileceğiniz her şey: başlatma blokları (bayrak, dokununca), hareket, görünüm, ses, tekrar, bekle, sayfa değiştirme.
3. En az şunları içersin: **bir tekrar**, **bir konuşma**, **iki sayfa**.
4. Bitince **aileye sunun**: çocuk projeyi çalıştırır ve anlatır.

## Ebeveyn için
Sunumda sorular sorun: "Bu karakter neden böyle yapıyor?" "Bunu nasıl yaptın?" Çocuğun **kendi kendini anlatması** öğrenmenin kalıcı olduğunu gösterir. Projeyi tebrik edin, mükemmel olmak şart değil.`,
          question: 'Hikâyende en çok neyi sevdin? Bir sonraki sefer neyi değiştirirdin?',
        },
      ],
    },
  ],
}
