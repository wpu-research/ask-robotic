import type { WeekExtras } from '../extras'
import { kod } from './modul-2-ortak'

// Modül 2, hafta 5-8. Soru kimliği: m2h<hafta>d<ders>-q<n>. Blok dizileri Sahne Atölyesi'ndeki gerçek blok adlarıyla yazılır.

export const hafta5: WeekExtras = {
  guideMd: `### Hafta hedefleri
Bu haftanın sonunda öğrenci:
1. Karakteri ok tuşlarıyla yönetmek için **sonsuza kadar** içinde **tuşuna basılı mı?** kontrolü kurabilir.
2. **eğer ... ise** koşulunun doğruysa içini çalıştırdığını, değilse atladığını açıklayabilir.
3. Düşen bir nesneyi y koordinatını azaltarak kurabilir ve yere inince yeniden yukarıya gönderebilir.
4. Değişken kavramını açıklar; **skor** değişkenini oluşturur, sıfırlar ve artırır.
5. Skoru oyunun başında sıfırlamanın neden gerektiğini söyler.

### Haftanın planı
| Gün | Ders | Süre | Ne yapılır |
|---|---|---|---|
| 1 | Hareket et ve yakala | ~30 dk | Sepeti ok tuşlarıyla yönet, elmayı düşür, değince yeniden yukarıdan başlat. |
| 2 | Skor: değişkenler | ~30 dk | "skor" değişkeni oluştur, bayrakta sıfırla, elma değince artır, altın elmayı ekle. |
| 3 | Hafta projesi: Yakalama oyunu | ~30 dk | Oyunu tamamla, arkadaşına oynat, hızını ve puanını ayarla. |

### Ön koşul kontrolü
- Öğrenci **sonsuza kadar** bloğunun içine blok koyabiliyor mu? (Hafta 2)
- x ve y koordinatını, y'nin yukarı doğru arttığını biliyor mu? (Hafta 1)
- Olay başlıklarını tanıyor mu? (Hafta 3)

### Kavram haritası
- **Girdi:** tuşuna basılı mı? → eğer ... ise → sonsuza kadar
- **Düşen nesne:** y'yi azalt → yere inince yukarı → sepete değince yukarı
- **Skor:** değişken oluştur → = yap (başlangıç) → kadar değiştir (artır) → sahnede göster

### Sık yapılan hatalar
- **Tuş kontrolünü döngü dışında bırakmak.** Tuşa yalnız bir kez bakılır; sepet kıpırdamaz.
- **y'yi ters yöne değiştirmek.** Aşağı inmek için y azalır (negatif değer).
- **Skoru bayrakta sıfırlamamak.** Yeni oyun eski skorla başlar.
- **"= yap" ile "kadar değiştir" blokları karıştırmak.** Biri değer koyar, biri ekler.
- **Skor değişkenini sahnede göstermeyi unutmak.** Oyuncu puanını göremez.

### Hafta sonu tekrarı
1. Kavram kartlarını oku, "sık yapılan yanlış" satırlarını yüksek sesle söyle.
2. Yanlış yaptığın soruları açıklamalarıyla birlikte yeniden çöz.
3. Elmanın hızını 5'ten 8'e çıkar: yere kaç turda iner? (300 ÷ 8 civarı)
4. Altın elmanın 5, normal elmanın 1 puan olduğu bir oyunda 3 altın ve 6 normal elmanın puanını hesapla.
5. Kendi cümlelerinle cevapla: "Değişken nedir? Neden bayrakta sıfırlarız?"

Hafta sonu testi olarak iki dersin mini testleri yeterlidir; toplam 10 soru. Hedef: her dersten en az 3 doğru.

### Proje değerlendirme ölçütü (Yakalama oyunu)
| Ölçüt | Gelişmeli | Yeterli | İleri |
|---|---|---|---|
| Kontrol | Sepet ok tuşlarına tepki vermiyor | Sepet sağa ve sola hareket ediyor | Sepet sahne dışına çıkmıyor, hareket akıcı |
| Düşen nesne | Elma düşmüyor ya da hep yerde kalıyor | Elma düşüyor ve yere ya da sepete değince yeniden başlıyor | Elmanın başlangıç yeri değişiyor |
| Skor | Skor yok ya da hiç artmıyor | Skor bayrakta sıfırlanıyor, yakalayınca artıyor | Altın elma ve sahnede görünen skor var |
| Anlatım | Anlatamıyor | Bloklarını adım adım anlatıyor | Yaptığı bir hatayı ve çözümünü anlatıyor |

### Veli ve öğretmen notu
- **Amaç.** Çocuk "bilgisayar sürekli bakmalı" fikrini (döngü içinde koşul) ve değişkeni isimli kutu olarak kavrasın.
- **Nasıl destek olunur?** "Tuşa kaç kez bakılıyor?" ve "Kutunun içinde şu an ne var?" diye sor.
- **Hata avı.** Skorun sıfırlanmaması çok yaygın bir hatadır; hata avı gibi bulmasına izin verin.
- **İlerleme.** Mini test sonuçları "İlerlemem" sayfasında beceri bazında görünür (taslak özellik; yalnız onay verildiyse kaydedilir).`,
  lessons: [
    {
      explainerMd: `### Bu derste öğreneceklerin
- Oyuncuyu ok tuşlarıyla yönetmeyi
- **tuşuna basılınca** ile **tuşuna basılı mı?** farkını
- **eğer ... ise** koşulunu
- Düşen nesnenin y koordinatını azaltmayı ve yeniden başlatmayı

### Önceden bilmen gerekenler
Ders 2: koordinatlar (y yukarı artar). Ders 4: sonsuza kadar. Ders 5: olaylar.

### Sürekli bakmak
**tuşuna basılınca** başlığı tuşa basılan anda çalışır. Sepet akıcı kaysın istiyorsan program sürekli kontrol etmelidir: **sonsuza kadar** içinde "sağ ok tuşuna basılı mı?" diye sorarsın. Bu soruya **koşul** denir.

### eğer ... ise
**eğer** bloğu koşulu sorar. Doğruysa içindekileri çalıştırır, değilse atlar.
${kod('Sepet: yeşil bayrak tıklanınca', '  x: 0 y: -140 konumuna git', '  sonsuza kadar', '    eğer sağ ok tuşuna basılı mı? ise', '      x\'i 10 değiştir', '    eğer sol ok tuşuna basılı mı? ise', '      x\'i -10 değiştir')}
Döngü her turda iki tuşa da bakar. Sağ ok basılıysa x 10 artar. Döngü olmasaydı tuşlara yalnız bir kez bakılır ve sepet kıpırdamazdı. Sağ ok 5 tur basılı kalırsa sepet 5 × 10 = 50 birim sağa gider.

### Düşen elma
Elma yukarıdan aşağı iner; yani y azalır. Yere (y < −150) inince yeniden yukarıya ışınlanır:
${kod('Elma: yeşil bayrak tıklanınca', '  x: 0 y: 150 konumuna git', '  sonsuza kadar', '    y\'yi -5 değiştir', '    eğer y konumu < -150 ise', '      y\'yi 150 yap')}
Elma her turda 5 birim iner. y = 150'den 0'a inmek için 150 ÷ 5 = 30 tur gerekir.

### Sepete değince
**sepet değiyor mu?** koşulu elmanın sepete değip değmediğini söyler. Değiyorsa elmayı yeniden yukarıya gönderirsin. Elma ya sepete ya da yere değince başa döner.

### Özet
Akıcı kontrol için tuş kontrolünü sonsuza kadar döngüsünün içine koy. Eğer bloğu koşul doğruysa çalışır. Düşen nesnede y azalır ve nesne yere inince yeniden başlatılır. Elma sepete değerse de başa dönebilir.`,
      concepts: [
        { term: 'Koşul', definition: 'Doğru ya da yanlış olan bir soru; "sağ ok tuşuna basılı mı?" gibi.', example: '"sepet değiyor mu?" elma sepete değerse doğru, değmezse yanlıştır.', pitfall: 'Koşulu tek başına bırakmak; bir eğer bloğuna takılmadıkça iş yapmaz.' },
        { term: 'eğer ... ise', definition: 'Koşul doğruysa içindeki blokları çalıştırır, yanlışsa atlar.', example: '"eğer sağ ok tuşuna basılı mı? ise: x\'i 10 değiştir" sepeti yalnız sağ ok basılıyken kaydırır.', pitfall: 'Hareket bloklarını eğer bloğunun dışına koymak; o zaman koşul bakılmadan her zaman çalışır.' },
        { term: 'tuşuna basılı mı?', definition: 'Tuş o anda basılıysa doğru olan koşul bloğu.', example: 'Sonsuza kadar içinde kullanınca sepet tuş basılı olduğu sürece kayar.', pitfall: 'Bu bloğu döngü dışında kullanmak; tuşa yalnız bir kez bakılır.' },
        { term: 'tuşuna basılınca ile basılı mı?', definition: 'Başlık, tuşa basıldığı anda çalışır; koşul bloğu ise döngü her döndüğünde tuşun durumunu sorar.', example: 'Akıcı yürüyüş için döngü içinde "basılı mı?" kullanılır.', pitfall: 'Basılı tutarak akıcı hareket için yalnız "basılınca" başlığına güvenmek.' },
        { term: 'Düşen nesne', definition: 'Her turda y\'si azalan, yere inince yeniden yukarı konan sprite.', example: 'Elma her turda 5 birim iner, y < -150 olunca y = 150 yapılır.', pitfall: 'y\'yi artırarak aşağı indirmeyi denemek; y artınca nesne yükselir.' },
      ],
      quiz: [
        { id: 'm2h5d1-q1', kind: 'mcq', prompt: 'Sağ ok tuşu basılı tutulduğu sürece sepetin düzenli sağa kayması için en uygun kurulum hangisidir?', options: ['"sağ ok tuşuna basılınca" başlığı altında x\'i 10 değiştir', 'Yeşil bayrak altında x\'i 10 değiştir', '"bu sprite tıklanınca" altında x\'i 10 değiştir', '"sonsuza kadar" içinde "eğer sağ ok tuşuna basılı mı? ise" x\'i 10 değiştir'], answer: 3, explanation: 'Döngü her turda tuşun durumunu sorar ve basılıysa sepeti kaydırır. Basılınca başlığı yalnız basma anında çalışır, basılı tutmak düzenli hareket vermez. Yeşil bayrak ve tıklama başlıkları tuşla ilgili değildir.', skills: ['sh-events', 'sh-loop', 'sh-cond'] },
        { id: 'm2h5d1-q2', kind: 'numeric', prompt: `Sepet x = 0 konumunda. Döngü 9 tur boyunca sağ ok basılıyken, sonraki 2 tur boyunca sol ok basılıyken dönüyor (sağda +10, solda −10). Sepetin son x değeri kaç olur?\n\n${kod('sonsuza kadar', '  eğer sağ ok tuşuna basılı mı? ise', '    x\'i 10 değiştir', '  eğer sol ok tuşuna basılı mı? ise', '    x\'i -10 değiştir')}`, answer: 70, tolerance: 0, unit: 'x', explanation: 'Sağa 9 × 10 = +90. Sola 2 × 10 = −20. Toplam 90 − 20 = 70. Her turda yalnız basılı olan tuşun bloğu çalışır.', skills: ['sh-coords', 'sh-cond'] },
        { id: 'm2h5d1-q3', kind: 'predict-output', prompt: `Elma yere (y < -150) inince ne olur?\n\n${kod('Elma: yeşil bayrak tıklanınca', '  x: 0 y: 150 konumuna git', '  sonsuza kadar', '    y\'yi -5 değiştir', '    eğer y konumu < -150 ise', '      y\'yi 150 yap')}`, options: ['Elma yerde durur', 'Elma yeniden y = 150 noktasına konur ve tekrar düşmeye başlar', 'Elma sahneden çıkıp kaybolur', 'Program hata verir'], answer: 1, explanation: 'Yere inen elma için eğer koşulu doğru olur ve y 150 yapılır; döngü devam ettiği için elma yeniden düşer. Durmaz çünkü sonsuza kadar bitmez, kaybolmaz çünkü y değeri sahnede kalır.', skills: ['sh-cond', 'sh-coords'] },
        { id: 'm2h5d1-q4', kind: 'numeric', prompt: 'Elma y = 150 noktasından başlıyor ve her tur y\'yi -5 değiştiriyor. y = -100 olması için kaç tur gerekir?', answer: 50, tolerance: 0, unit: 'tur', explanation: 'Toplam inmesi gereken mesafe 150 − (−100) = 250 birim. Her tur 5 birim indiği için 250 ÷ 5 = 50 tur gerekir.', skills: ['sh-coords', 'sh-loop'] },
        { id: 'm2h5d1-q5', kind: 'find-bug', prompt: `Can sepetin ok tuşlarıyla hareket etmesini istiyor ama sepet kıpırdamıyor:\n\n${kod('Sepet: yeşil bayrak tıklanınca', '  eğer sağ ok tuşuna basılı mı? ise', '    x\'i 10 değiştir', '  eğer sol ok tuşuna basılı mı? ise', '    x\'i -10 değiştir')}\n\nSorun nedir?`, options: ['10 adım çok az', 'Sol ok ve sağ ok aynı anda kullanılamaz', 'Tuş kontrolü sonsuza kadar döngüsünde değil; tuşlara yalnız bir kez bakılıyor', 'Sepetin kostümü yok'], answer: 2, explanation: 'Program bayrağa basılınca iki koşula bir kez bakar ve biter. O sırada tuşa basılmadığı için hiçbir şey olmaz. Kontrolleri sonsuza kadar bloğunun içine almak gerekir.', skills: ['sh-debug', 'sh-loop', 'sh-cond'] },
      ],
    },
    {
      explainerMd: `### Bu derste öğreneceklerin
- Değişkenin ne olduğunu
- Değişken oluşturmayı, değer koymayı ve değiştirmeyi
- Skoru oyunun başında sıfırlamanın önemini
- Skoru sahnede göstermeyi

### Önceden bilmen gerekenler
Ders 9: eğer ... ise, **değiyor mu?** ve sonsuza kadar.

### Değişken: isimli kutu
**Değişken**, üzerinde isim yazan bir kutudur; içinde bir sayı ya da yazı durur. Oyunda yakaladığın elma sayısını bilgisayar bir değişkende, mesela **skor** adlı kutuda saklar. Değişkeni Değişkenler kategorisinde "Bir değişken oluştur" ile yapıp adını verirsin. Değişkenler bütün sprite'lar için ortaktır; sepet de elma da aynı skor kutusunu görür.

### İki temel blok
- **skor = 0 yap** kutuya doğrudan değer koyar, eski değeri siler.
- **skor değişkenini 1 kadar değiştir** kutudaki sayıya ekler. Eksi sayı yazarsan çıkarır.

Örnek:
${kod('skor = 5 yap', 'skor değişkenini 2 kadar değiştir')}
Kutuda şimdi 7 vardır.

### Oyunun başında sıfırla
Oyun yeniden başlayınca skorun sıfırdan başlaması için bayrak altında **skor = 0 yap** koyarsın. Koymazsan önceki oyundan kalan değerle devam edersin.
${kod('Elma: yeşil bayrak tıklanınca', '  skor = 0 yap', '  sonsuza kadar', '    y\'yi -5 değiştir', '    eğer sepet değiyor mu? ise', '      skor değişkenini 1 kadar değiştir', '      y\'yi 150 yap')}

### Skoru göster
Değişkenin yanındaki kutu işaretliyse skor sahnede görünür. Konuşmaya da katabilirsin: **birleştir** bloğuyla "Skor: " yazısını ve skor değişkenini yan yana koyup söyletirsin. Altın elma 5 puan versin istiyorsan onun kodunda **skor değişkenini 5 kadar değiştir** kullan. Örneğin 3 normal elma ve 1 altın elma yakalarsan skor 3 + 5 = 8 olur.

### Özet
Değişken, isimli bir kutudur. "= yap" değer koyar, "kadar değiştir" ekler ya da çıkarır. Oyunun başında skoru sıfırla. Skoru sahnede göstererek oyuncuya gösterebilirsin.`,
      concepts: [
        { term: 'Değişken', definition: 'İçinde değer saklayan, adı olan kutu.', example: '"skor" değişkeni yakaladığın elma sayısını tutar.', pitfall: 'Değişkeni her sprite için ayrı sanmak; değişkenler ortaktır.' },
        { term: '= yap', definition: 'Değişkenin içine doğrudan bir değer koyar, eskisini siler.', example: '"skor = 0 yap" skoru sıfırlar.', pitfall: '"= yap" ile "kadar değiştir" blokunu karıştırmak; biri değer koyar, biri ekler.' },
        { term: 'kadar değiştir', definition: 'Değişkenin değerine verilen sayıyı ekler; eksi sayı çıkarır.', example: '"skor değişkenini 1 kadar değiştir" skoru 1 artırır.', pitfall: 'Çıkarmak için pozitif sayı yazmak; azaltmak için eksi sayı gerekir.' },
        { term: 'Başlangıç değeri', definition: 'Oyun başlarken değişkene verilen ilk değer.', example: 'Bayrak altında skoru 0 yaparsın.', pitfall: 'Sıfırlamayı unutup yeni oyunda eski skorla başlamak.' },
        { term: 'Skor', definition: 'Oyuncunun puanını tutan değişken.', example: 'Normal elma 1, altın elma 5 puan ekler.', pitfall: 'Skoru sahnede göstermeyi unutup oyuncunun puanı görememesi.' },
      ],
      quiz: [
        { id: 'm2h5d2-q1', kind: 'mcq', prompt: 'Sahne Atölyesi\'nde "değişken" kavramı en iyi hangisiyle anlatılır?', options: ['Adı olan ve içinde değer saklayan bir kutu', 'Sprite\'ın kostümü', 'Sahnenin arka planı', 'Bir ses dosyası'], answer: 0, explanation: 'Değişken, üzerinde isim yazan ve içinde sayı ya da yazı tutan bir kutudur. Kostüm, arka plan ve ses farklı kavramlardır.', skills: ['sh-var'] },
        { id: 'm2h5d2-q2', kind: 'numeric', prompt: `Bu programdan sonra skor değişkeninin değeri kaç olur?\n\n${kod('yeşil bayrak tıklanınca', '  skor = 0 yap', '  4 kere tekrarla', '    skor değişkenini 2 kadar değiştir', '  skor değişkenini -3 kadar değiştir')}`, answer: 5, tolerance: 0, unit: 'skor', explanation: 'Skor 0\'dan başlar. Döngü 4 kez 2 ekler: 8. Sonra -3 eklenir, yani 3 çıkarılır: 8 − 3 = 5.', skills: ['sh-var', 'sh-loop'] },
        { id: 'm2h5d2-q3', kind: 'numeric', prompt: 'Normal elma 1 puan, altın elma 5 puan veriyor. Skor 0\'dan başladı. Oyuncu 4 normal ve 2 altın elma yakaladı. Skor kaç olur?', answer: 14, tolerance: 0, unit: 'puan', explanation: '4 normal elma 4 × 1 = 4 puan, 2 altın elma 2 × 5 = 10 puan verir. Toplam 4 + 10 = 14.', skills: ['sh-var'] },
        { id: 'm2h5d2-q4', kind: 'find-bug', prompt: `Mina oyunu bitirip yeşil bayrağa tekrar basıyor. Skor 0'dan değil, önceki oyunun skorundan devam ediyor:\n\n${kod('Elma: yeşil bayrak tıklanınca', '  sonsuza kadar', '    y\'yi -5 değiştir', '    eğer sepet değiyor mu? ise', '      skor değişkenini 1 kadar değiştir', '      y\'yi 150 yap')}\n\nSorun nedir?`, options: ['Skoru artıran blok yanlış', 'Elma çok hızlı düşüyor', 'Skor değişkeni sahnede görünmüyor', 'Bayrak altında "skor = 0 yap" yok; skor sıfırlanmıyor'], answer: 3, explanation: 'Değişken, oyun bitince de içindeki değeri korur. Oyun başında "skor = 0 yap" demezsen eski değerle devam edersin. Başlangıç değerini her oyunun başında koymak gerekir.', skills: ['sh-debug', 'sh-var'] },
        { id: 'm2h5d2-q5', kind: 'predict-output', prompt: `Robot en sonda ne söyler?\n\n${kod('skor = 10 yap', 'skor değişkenini -4 kadar değiştir', 'skor = 3 yap', 'skor değişkenini 1 kadar değiştir', '("Skor: " skor birleştir) de')}`, options: ['Skor: 10', 'Skor: 6', 'Skor: 4', 'Skor: 3'], answer: 2, explanation: '"= yap" eski değeri siler. 10 yapılır, 6\'ya düşer, ama sonra "skor = 3 yap" her şeyi 3 yapar. Son blok 1 ekler: 4. "Skor: " ve 4 birleşince "Skor: 4" söylenir.', skills: ['sh-var', 'sh-program'] },
      ],
    },
  ],
}

export const hafta6: WeekExtras = {
  guideMd: `### Hafta hedefleri
Bu haftanın sonunda öğrenci:
1. **can** ve **süre** gibi azalan değişkenleri kurar; oyunun bitiş koşulunu yazar.
2. **=** ile **<** karşılaştırmasının farkını bilir; bitiş koşulunda neden **<** daha güvenli olduğunu açıklar.
3. **hepsini dur** ile **bu betiği dur** farkını bilir.
4. **rastgele sayı** bloğunun aralığını (uçlar dahil) bilir ve nesneleri rastgele yerlerden düşürür.
5. **klon** oluşturur; klonun davranışını **klon olarak başlayınca** altına yazar ve klonu siler.

### Haftanın planı
| Gün | Ders | Süre | Ne yapılır |
|---|---|---|---|
| 1 | Zamanlayıcı, can ve oyun bitti | ~35 dk | Can ve süre değişkenlerini kur, bitiş koşulunu yaz, hepsini durdur. |
| 2 | Rastgele ve klonlar | ~35 dk | Elmayı rastgele yerden düşür, klonla birçok elma üret, klonları sil. |
| 3 | Hafta projesi: Oyunu geliştir | ~30 dk | Oyunu zorlaştır (hız, can), bir arkadaşına oynat. |

### Ön koşul kontrolü
- Değişken oluşturup değerini değiştirebiliyor mu? (Hafta 5)
- **eğer ... ise** bloğunu kullanabiliyor mu? (Hafta 5)
- Negatif sayılarla toplama ve çıkarma rahat mı? (Can −2 örneği için)

### Kavram haritası
- **Oyun bitişi:** can → süre → eğer can < 1 → hepsini dur
- **Rastgelelik:** rastgele sayı (uçlar dahil) → rastgele x konumu
- **Klon:** kendimin klonunu oluştur → klon olarak başlayınca → bu klonu sil

### Sık yapılan hatalar
- **"can = 0" yazmak.** Can 0'ı atlayabilir (1'den −1'e); "can < 1" daha güvenlidir.
- **Süreyi her turda azaltmak.** Süre saniyede bir azalmalı; araya 1 saniye bekle koy.
- **"bu betiği dur" ile oyunu bitirmeye çalışmak.** Diğer kodlar çalışmaya devam eder; "hepsini dur" gerekir.
- **Klonun davranışını yeşil bayrak altına yazmak.** Klonlar bayrak olayını almaz; "klon olarak başlayınca" gerekir.
- **Klonları silmemek.** Sahne dolar ve oyun yavaşlar.

### Hafta sonu tekrarı
1. Kavram kartlarını oku ve "sık yapılan yanlış" satırlarını söyle.
2. Yanlış yaptığın soruları açıklamalarıyla yeniden çöz.
3. Canı 5 yap ve elma düşünce 2 can alınsın. Oyun hangi koşulla bitmeli?
4. Elmanın x konumunu −150 ile 150 arasında rastgele yap. Kaç farklı değer gelir?
5. Kendi cümlelerinle cevapla: "Klon nedir, neden kullanırız?"

Hafta sonu testi olarak iki dersin mini testleri yeterlidir; toplam 10 soru. Hedef: her dersten en az 3 doğru.

### Proje değerlendirme ölçütü (Oyunu geliştir)
| Ölçüt | Gelişmeli | Yeterli | İleri |
|---|---|---|---|
| Can ve süre | Yok ya da hiç değişmiyor | Can ve süre azalıyor, oyun bitiyor | İkisi de ekranda görünüyor ve ikisinden biri bitirince diğeri durduruluyor |
| Bitiş | Oyun hiç bitmiyor | Can 0 olunca "Oyun bitti" diyor ve duruyor | Bitişte skorunu söylüyor |
| Rastgelelik | Her şey hep aynı yerden | Elma rastgele x konumundan düşüyor | Rastgele hız ya da altın elma şansı |
| Klon | Klon yok | En az 3 elma aynı anda düşüyor | Klonlar siliniyor, oyun hatasız çalışıyor |

### Veli ve öğretmen notu
- **Amaç.** Çocuk oyunun bir "bitiş koşulu" olduğunu ve klonların aynı kodu birçok kez kullanmanın yolu olduğunu kavrasın.
- **Nasıl destek olunur?** "Hangi koşulda oyun biter?" ve "Bu kod elma mı yoksa klon mu için?" diye sor.
- **Klonlar zordur.** Çocuk zorlanırsa önce tek elmayla rastgele konum, sonra klon ekleyin.
- **İlerleme.** Mini test sonuçları "İlerlemem" sayfasında beceri bazında görünür (taslak özellik; yalnız onay verildiyse kaydedilir).`,
  lessons: [
    {
      explainerMd: `### Bu derste öğreneceklerin
- Can ve süre değişkenlerini kurmayı
- Bir değişkeni azaltmayı
- Oyun bitiş koşulunu yazmayı
- **=** ile **<** farkını ve **hepsini dur** bloğunu

### Önceden bilmen gerekenler
Ders 10: değişken, skor. Ders 9: eğer ... ise ve düşen elma.

### Can ve süre
**can** değişkeni 3 ile başlar. Elma yere inince canı **-1 kadar değiştir** ile azaltırsın. **süre** değişkeni 30 ile başlar. Süre saniyede bir azalmalı, o yüzden araya bekle koyarsın:
${kod('yeşil bayrak tıklanınca', '  süre = 30 yap', '  sonsuza kadar', '    1 saniye bekle', '    süre değişkenini -1 kadar değiştir')}
12 saniye sonra süre 30 − 12 = 18 olur.

### Oyun bitti koşulu
Oyun can bitince ya da süre dolunca durmalı:
${kod('sonsuza kadar', '  y\'yi -5 değiştir', '  eğer y konumu < -150 ise', '    can değişkenini -1 kadar değiştir', '    y\'yi 150 yap', '  eğer can < 1 ise', '    Oyun bitti de', '    hepsini dur')}

### = mi, < mı?
**can = 0** yalnız tam 0 iken doğrudur. Bir elma yere düşünce 2 can götürürse can 1'den −1'e atlar ve 0'ı hiç görmez; "Oyun bitti" hiç çıkmaz. **can < 1** ise 0 ve altında doğru olur, daha güvenlidir.

### Dur blokları
**hepsini dur** bütün sprite'ların tüm kodunu durdurur; oyun bitince bunu kullanırsın. **bu betiği dur** yalnız o kod yığınını durdurur. Süre sayacı başka bir yığındaysa çalışmaya devam eder.

### Özet
Can ve süre, azalan değişkenlerdir. Oyun bitişini "can < 1" gibi bir koşulla kontrol et; "=" yerine "<" kullanmak sınırı atlama riskini azaltır. Oyun bitince hepsini dur ile tüm kodu durdur.`,
      concepts: [
        { term: 'Can', definition: 'Başta verilen ve hata olunca azalan, 0 olunca oyunu bitiren değişken.', example: 'Can 3 ile başlar, elma yere düşünce 1 azalır.', pitfall: 'Canı azaltırken eksi değer yerine artı sayı yazıp canı artırmak.' },
        { term: 'Süre', definition: 'Geri sayan değişken; saniyede bir azalır.', example: '"1 saniye bekle" ve "süre -1" ile süre 30\'dan geriye sayar.', pitfall: 'Araya bekle koymamak: süre bir anda biter.' },
        { term: 'Bitiş koşulu', definition: 'Oyunun ne zaman biteceğini söyleyen eğer koşulu.', example: '"eğer can < 1 ise: Oyun bitti de, hepsini dur."', pitfall: 'Koşulu hiç yazmamak ve oyunun sonsuza kadar sürmesine şaşırmak.' },
        { term: '= ve <', definition: '"=" tam eşitlik, "<" küçüktür koşuludur.', example: 'Can −1 olduğunda "can < 1" doğru, "can = 0" yanlıştır.', pitfall: 'Sayı 0\'ı atlayabilecekken "=" kullanmak; bitiş koşulu hiç sağlanmaz.' },
        { term: 'hepsini dur', definition: 'Bütün sprite\'ların bütün kodlarını durdurur.', example: 'Oyun bitince sayaç da durmalı, o yüzden hepsini dur.', pitfall: '"bu betiği dur" ile oyunu bitirmeye çalışmak; diğer kodlar çalışmaya devam eder.' },
      ],
      quiz: [
        { id: 'm2h6d1-q1', kind: 'numeric', prompt: 'Oyun başında can 3. Oyuncu 2 elmayı yere düşürdü (her biri 1 can alıyor) ve 1 elma yakaladı (yakalamak can değiştirmiyor). Can kaç olur?', answer: 1, tolerance: 0, unit: 'can', explanation: 'Yalnız yere düşen elmalar can azaltır: 3 − 2 = 1. Elma yakalamak skoru artırır ama canı değiştirmez.', skills: ['sh-var'] },
        { id: 'm2h6d1-q2', kind: 'numeric', prompt: `Süre 4 ile başlıyor. Oyun kaç saniye sonra "Süre doldu" der ve durur?\n\n${kod('yeşil bayrak tıklanınca', '  süre = 4 yap', '  sonsuza kadar', '    1 saniye bekle', '    süre değişkenini -1 kadar değiştir', '    eğer süre < 1 ise', '      Süre doldu de', '      hepsini dur')}`, answer: 4, tolerance: 0, unit: 'saniye', explanation: 'Süre her saniye 1 azalır: 3, 2, 1, 0. Süre 0 olduğunda (4. saniyede) "süre < 1" doğru olur ve program durur. İlk üç saniyede süre hâlâ 1 ya da daha büyüktür.', skills: ['sh-wait', 'sh-cond'] },
        { id: 'm2h6d1-q3', kind: 'find-bug', prompt: `Can 3 ile başlıyor ama elma yere düşünce 2 can alıyor. "Oyun bitti" hiç çıkmıyor:\n\n${kod('eğer y konumu < -150 ise', '  can değişkenini -2 kadar değiştir', '  y\'yi 150 yap', 'eğer can = 0 ise', '  Oyun bitti de', '  hepsini dur')}\n\nSorun nedir?`, options: ['Elma çok yavaş', 'Can 3, 1, −1 diye gidiyor ve hiç 0 olmuyor; "can = 0" hiç doğru olmuyor', 'Hepsini dur bloğu yanlış', 'Oyun bitti yazısı çok kısa'], answer: 1, explanation: 'Can 3\'ten 2 azalınca 1, sonra −1 olur; hiç tam 0 olmaz. "can = 0" bu yüzden hiç doğru olmaz. "can < 1" yazınca 1\'in altına inen her değerde koşul doğru olur.', skills: ['sh-debug', 'sh-cond'] },
        { id: 'm2h6d1-q4', kind: 'mcq', prompt: 'Oyun bitince oyunun bütün kodlarını durdurmak için hangi blok uygundur?', options: ['bu betiği dur', '1 saniye bekle', 'hepsini dur', 'kenara değince sek'], answer: 2, explanation: '"Hepsini dur" bütün sprite\'ların bütün kodunu durdurur. "Bu betiği dur" yalnız o kod yığınını durdurur; süre sayacı gibi diğer yığınlar çalışmaya devam eder.', skills: ['sh-cond', 'sh-loop'] },
        { id: 'm2h6d1-q5', kind: 'predict-output', prompt: `Program bitince skor kaç olur?\n\n${kod('can = 3 yap', 'skor = 0 yap', '3 kere tekrarla', '  can değişkenini -2 kadar değiştir', '  eğer can < 1 ise', '    skor değişkenini 1 kadar değiştir')}`, options: ['0', '1', '2', '3'], answer: 2, explanation: 'Can sırayla 1, −1, −3 olur. İlk turda can 1 olduğu için "can < 1" yanlıştır. İkinci ve üçüncü turda can 1\'in altında olduğundan skor iki kez artar: skor 2.', skills: ['sh-cond', 'sh-var', 'sh-loop'] },
      ],
    },
    {
      explainerMd: `### Bu derste öğreneceklerin
- Rastgele sayı bloğunu ve aralığını
- Klon oluşturmayı
- **klon olarak başlayınca** başlığını
- Klonu **bu klonu sil** ile silmeyi

### Önceden bilmen gerekenler
Ders 11: eğer, hepsini dur. Ders 9: düşen elma. Ders 2: koordinatlar.

### Rastgele sayı
**1 ile 6 arasında rastgele sayı** her çalıştığında 1, 2, 3, 4, 5 ya da 6'dan birini seçer. Uç sayılar da gelebilir; yani 6 farklı olasılık vardır. Elmanın x konumunu −200 ile 200 arasında rastgele yaparsan her elma farklı yerden düşer:
${kod('x: (-200 ile 200 arasında rastgele sayı) y: 150 konumuna git')}

### Klon
Yüzlerce sprite çizmeden birçok elma için **kendimin klonunu oluştur** bloğu sprite'ın bir kopyasını yapar. Klon, ana elmanın görünümünü ve konumunu alır. Klonun ne yapacağını **klon olarak başlayınca** başlığının altına yazarsın:
${kod('Elma: yeşil bayrak tıklanınca', '  gizle', '  sonsuza kadar', '    kendimin klonunu oluştur', '    0.7 saniye bekle', '', 'Elma: klon olarak başlayınca', '  göster', '  x: (-200 ile 200 arasında rastgele sayı) y: 150 konumuna git', '  y konumu < -150 olana dek tekrarla', '    y\'yi -5 değiştir', '  bu klonu sil')}
Ana elma gizli kalır ve yalnız klon üretir. Her klon görünür, rastgele bir yerden düşer ve yere inince kendini siler.

### Klon sayısı
Klonlar silinmezse ana sprite ile birlikte sayılırlar. "5 kere tekrarla: kendimin klonunu oluştur" yaparsan ve hiçbirini silmezsen sahnede ana elma ve 5 klon, yani 6 elma olur. Ana elma gizliyse 5 elma görünür.

### Klonun kodu nerede?
Klonlar sonradan oluşur; yeşil bayrak olayı onlar için çoktan geçmiştir. Bu yüzden klonun davranışını yeşil bayrak altına yazarsan klonlar hiçbir şey yapmaz. Doğru yer **klon olarak başlayınca** başlığıdır.

### Özet
Rastgele sayı bloğu uçlar dahil aralıktan bir sayı seçer. Klon, bir sprite'ın kopyasıdır. Klonun kodu "klon olarak başlayınca" altına yazılır ve iş bitince klon silinir.`,
      concepts: [
        { term: 'rastgele sayı', definition: 'İki sayı arasında (uçlar dahil) rastgele bir tam sayı seçer.', example: '"1 ile 6 arasında rastgele sayı" 1, 2, 3, 4, 5 ya da 6 verir.', pitfall: 'Uç sayıların gelmeyeceğini sanmak; ikisi de gelebilir.' },
        { term: 'Klon', definition: 'Bir sprite\'ın program çalışırken oluşturulan kopyası.', example: 'Ana elma her 0,7 saniyede bir klon üretir; her klon bir elma olur.', pitfall: 'Klon sayısını yalnız klonlarla saymak; ana sprite de sahnededir.' },
        { term: 'kendimin klonunu oluştur', definition: 'Çalışan sprite\'ın bir kopyasını sahneye ekler.', example: 'Sonsuza kadar içinde bu bloğu kullanırsan sürekli yeni elmalar oluşur.', pitfall: 'Hiçbir şekilde silmeden sonsuz klon üretmek; sahne dolar.' },
        { term: 'klon olarak başlayınca', definition: 'Bir klon oluşturulduğunda o klonun çalıştıracağı kodu başlatan başlık.', example: 'Klon göster, rastgele x\'e git, aşağı düş ve kendini sil.', pitfall: 'Klonun davranışını yeşil bayrak altına yazmak; klonlar bayrak olayını almaz.' },
        { term: 'bu klonu sil', definition: 'Klonun kendini ortadan kaldırmasını sağlar.', example: 'Elma yere inince bu klonu sil çalışır.', pitfall: 'Ana sprite\'a bu bloğu koymak; ana sprite silinmez, yalnız klonlar silinir.' },
      ],
      quiz: [
        { id: 'm2h6d2-q1', kind: 'mcq', prompt: '"1 ile 6 arasında rastgele sayı" bloğu çalışınca hangi sayılar gelebilir?', options: ['Yalnız 2, 3, 4, 5', '1, 2, 3, 4, 5 ve 6 (hepsi)', '0\'dan 6\'ya kadar', 'Hep aynı sayı'], answer: 1, explanation: 'Rastgele sayı bloğu uç sayıları da dahil eder: 1 ve 6 da gelebilir. 0 aralığın dışındadır. Her çalışmada farklı sayı çıkabilir, hep aynı olmaz.', skills: ['sh-random'] },
        { id: 'm2h6d2-q2', kind: 'numeric', prompt: `Elma sprite'ı bu kodu çalıştırıyor ve klonları silmiyor. Kod bitince sahnede ana elma ile birlikte toplam kaç elma sprite'ı vardır?\n\n${kod('yeşil bayrak tıklanınca', '  5 kere tekrarla', '    kendimin klonunu oluştur')}`, answer: 6, tolerance: 0, unit: 'elma', explanation: '5 klon oluşur ve ana elma da sahnede kalır: 1 + 5 = 6. Ana sprite silinmez ve klon sayısına dahil edilmez, ama sahnede yine bulunur.', skills: ['sh-clone', 'sh-loop'] },
        { id: 'm2h6d2-q3', kind: 'predict-output', prompt: `Program çalıştıktan 4 saniye sonra sahnede kaç elma GÖRÜNÜR?\n\n${kod('Elma: yeşil bayrak tıklanınca', '  gizle', '  3 kere tekrarla', '    kendimin klonunu oluştur', '    1 saniye bekle', '', 'Elma: klon olarak başlayınca', '  göster')}`, options: ['0', '1', '3', '4'], answer: 2, explanation: 'Ana elma gizlidir ve görünür olmaz. Üç klon oluşur ve her biri "göster" ile görünür olur; hiçbiri silinmediği için 3 elma görünür. 4 değil, çünkü ana elma görünmez.', skills: ['sh-clone', 'sh-loop'] },
        { id: 'm2h6d2-q4', kind: 'find-bug', prompt: `Selin klonlarla çok elma düşürmek istiyor. Ama yalnız ana elma düşüyor; klonlar oluştukları yerde donup kalıyor:\n\n${kod('Elma: yeşil bayrak tıklanınca', '  gizle', '  sonsuza kadar', '    kendimin klonunu oluştur', '    1 saniye bekle', '', 'Elma: yeşil bayrak tıklanınca', '  göster', '  y konumu < -150 olana dek tekrarla', '    y\'yi -5 değiştir', '  bu klonu sil')}\n\nSorun nedir?`, options: ['Klonun davranışı yeşil bayrak altında; klonlar bayrak olayını almaz, "klon olarak başlayınca" gerekir', 'Bekleme süresi çok uzun', 'Gizle bloğu hiç kullanılamaz', 'Elmanın hızı eksik'], answer: 0, explanation: 'Klonlar bayrak tıklandıktan sonra oluşur; bayrak olayı onlar için geçmiştir. Davranış "klon olarak başlayınca" başlığının altına yazılmalıdır. Aksi halde bu kodu yalnız ana elma çalıştırır; klonlar oluştukları yerde kıpırdamadan kalır.', skills: ['sh-debug', 'sh-clone'] },
        { id: 'm2h6d2-q5', kind: 'numeric', prompt: 'Elmanın x konumu "-200 ile 200 arasında rastgele sayı" ile seçiliyor (tam sayılar, uç değerler dahil). Kaç farklı x değeri gelebilir?', answer: 401, tolerance: 0, unit: 'değer', explanation: 'Uçlar dahil sayarken aradaki fark artı 1 alınır: 200 − (−200) + 1 = 401. Fark 400 olsa da -200 ve 200 de gelebildiği için 401 olasılık vardır; bu, 1 ile 6 arasında 6 olasılık olmasıyla aynı mantıktır.', skills: ['sh-random', 'sh-coords'] },
      ],
    },
  ],
}

export const hafta7: WeekExtras = {
  guideMd: `### Hafta hedefleri
Bu haftanın sonunda öğrenci:
1. **Bir blok yap** ile kendi bloğunu tanımlar ve ana kodunda çağırır; tanımlamanın çalıştırmak olmadığını bilir.
2. Bloğa **girdi** ekleyerek aynı bloğu farklı değerlerle kullanır.
3. Kendi bloğunun kodu kısalttığını ve değişikliği tek yerde yapmayı sağladığını açıklar.
4. **Liste** kavramını bilir; öğe sırasının 1'den başladığını ve listenin N. öğesini okuyabileceğini söyler.
5. **sıra** değişkeniyle iki eşleşik listeyi (sorular ve cevaplar) gezen bir bilgi yarışması kurar.

### Haftanın planı
| Gün | Ders | Süre | Ne yapılır |
|---|---|---|---|
| 1 | Kendi bloğunu yap | ~30 dk | "zıpla" bloğunu yap, girdi ekle, ana kodda birkaç kez çağır, ikinci bir blok daha yap. |
| 2 | Liste ile bilgi yarışması | ~35 dk | Sorular ve cevaplar listelerini kur, sıra değişkeniyle sırayla sor, doğruysa skor ver. |
| 3 | Hafta projesi: Bilgi yarışması | ~30 dk | Kendi konunda 5 soruluk yarışma yap, arkadaşına oynat. |

### Ön koşul kontrolü
- Değişken oluşturup değiştirebiliyor mu? (Hafta 5)
- **eğer / değilse** ve karşılaştırma işleçlerini kullanabiliyor mu? (Hafta 5-6)
- Tekrarla ve olana dek tekrarla döngülerini tanıyor mu? (Hafta 2, 6)

### Kavram haritası
- **Kendi blok:** tanım → çağırma → girdi → tek yerden değişiklik
- **Liste:** öğe → sıra numarası (1'den) → listenin N. öğesi → uzunluk
- **Yarışma:** sıra değişkeni → sor ve bekle → cevap = listenin sıra. öğesi → skor

### Sık yapılan hatalar
- **Bloğu tanımlayıp çağırmamak.** Tanım yalnız tariftir.
- **Girdiyi kullanmamak.** Tanımda sabit sayı bırakıp girdiyi hiç kullanmamak.
- **İki listeyi farklı sırada yazmak.** Sorunun cevabı yanlış öğeyle karşılaştırılır.
- **sıra değişkenini artırmamak.** Aynı soru sürekli sorulur.
- **Sıra numarasını 0'dan başlatmak.** Liste öğeleri 1'den sayılır.

### Hafta sonu tekrarı
1. Kavram kartlarını oku, "sık yapılan yanlış" satırlarını söyle.
2. Yanlış yaptığın soruları açıklamalarıyla yeniden çöz.
3. "dans et" bloğunu üç farklı şekilde değiştir; çağrıldığı yerlerde ne değişiyor?
4. Yarışmana 6. soruyu ekle. Kodu değiştirmen gerekti mi?
5. Kendi cümlelerinle cevapla: "Kendi blok yapmak neden işini kolaylaştırır?"

Hafta sonu testi olarak iki dersin mini testleri yeterlidir; toplam 10 soru. Hedef: her dersten en az 3 doğru.

### Proje değerlendirme ölçütü (Bilgi yarışması)
| Ölçüt | Gelişmeli | Yeterli | İleri |
|---|---|---|---|
| Kendi blok | Yok | En az bir blok tanımlı ve çağrılıyor | Girdili blok ve birden çok çağrı |
| Listeler | Soru ya da cevap listesi yok | İki liste, en az 4 öğe, aynı sırada | 5+ soru, soru eklemek kodu değiştirmiyor |
| Yarışma | Sorular sırayla sorulmuyor | Sıra değişkeniyle sırayla soruluyor, cevap kontrol ediliyor | Doğru/yanlış geri bildirimi ve bitişte skor özeti var |
| Anlatım | Anlatamıyor | Listeyi ve sıra değişkenini anlatıyor | Hata bulma ve düzeltmesini anlatıyor |

### Veli ve öğretmen notu
- **Amaç.** Çocuk işleri adlandırıp tekrar kullanmanın (soyutlama) ve birçok değeri bir arada tutmanın (liste) gücünü görsün.
- **Nasıl destek olunur?** "Bu blok nerede çağrılıyor?" ve "Sorular listesinde kaçıncı soruyu soruyoruz?" diye sor.
- **Kişisel bilgi.** Yarışma soruları aile ya da arkadaşlarla ilgili özel bilgi içermesin.
- **İlerleme.** Mini test sonuçları "İlerlemem" sayfasında beceri bazında görünür (taslak özellik; yalnız onay verildiyse kaydedilir).`,
  lessons: [
    {
      explainerMd: `### Bu derste öğreneceklerin
- **Bir blok yap** ile kendi bloğunu tanımlamayı
- Tanımlanan bloğu çağırmayı
- Bloğa girdi eklemeyi
- Değişikliği tek yerde yapmanın yararını

### Önceden bilmen gerekenler
Ders 4: tekrarla. Ders 2: y koordinatı. Ders 12: klon (iş parçalama fikri).

### Aynı blokları tekrar yazmak
Zıplamak için üç blok gerekir: y'yi 20 değiştir, 0,1 saniye bekle, y'yi −20 değiştir. Programın beş yerinde zıplatırsan 15 blok yazarsın; birini değiştirmek için beşini düzeltirsin.

### Bir blok yap
**Bloklarım** kategorisinde **Bir blok yap** düğmesiyle yeni bir blok oluşturursun ve adını **zıpla** koyarsın. Tanım bloğunun altına komutları sürüklersin. Sonra ana kodunda **zıpla** bloğunu çağırırsın:
${kod('tanım: zıpla', '  y\'yi 20 değiştir', '  0.1 saniye bekle', '  y\'yi -20 değiştir', '', 'yeşil bayrak tıklanınca', '  zıpla', '  zıpla')}
Tanım yalnız tariftir; çalışması için bir yerde **çağırmalısın**.

### Girdi
Her zıplayışın yüksekliği farklı olsun diye bloğa **girdi** eklersin. Girdinin adı yükseklik olsun:
${kod('tanım: zıpla (yükseklik)', '  y\'yi (yükseklik) değiştir', '  0.1 saniye bekle', '  y\'yi (yükseklik × -1) değiştir')}
Artık **zıpla 30** kediyi 30 birim, **zıpla 60** 60 birim zıplatır. Zıpladıktan sonra kedi yerine döner çünkü aynı yükseklik geri çıkarılır.

### Tek yerden değiştir
Zıplayışı yavaşlatmak için tanımdaki bekleme süresini 0,2 yaparsın. Blok her çağrıldığı yerde yeni haliyle çalışır.

### Özet
Kendi bloğun, sık kullandığın komutlara verdiğin addır. Önce tanımlarsın, sonra çağırırsın. Girdi, aynı bloğu farklı değerlerle çalıştırmanı sağlar. Değişikliği yalnız tanımda yaparsın.`,
      concepts: [
        { term: 'Bir blok yap', definition: 'Kendi adını verdiğin yeni bir blok tanımlama özelliği.', example: '"zıpla" adlı blok üç komutu tek isim altında toplar.', pitfall: 'Tanımlayıp ana kodda hiç kullanmamak.' },
        { term: 'Çağırma', definition: 'Tanımlanmış bloğu ana kodda kullanıp çalıştırma.', example: 'Bayrak altına "zıpla" koyunca tanımdaki komutlar çalışır.', pitfall: 'Tanım bloğunun kendiliğinden çalışacağını sanmak; tanım yalnız tariftir.' },
        { term: 'Girdi', definition: 'Bir bloğa her çağırışta farklı değer vermeni sağlayan alan.', example: '"zıpla 30" ve "zıpla 60" aynı bloğun farklı değerleridir.', pitfall: 'Girdi eklemek ama tanımda onu kullanmamak.' },
        { term: 'Soyutlama', definition: 'Ayrıntıyı bir isimle saklayıp kolayca kullanmak.', example: '"dans et" demek üç dönme ve bekleme komutunu hatırlamaktan kurtarır.', pitfall: 'Her şeyi tek bloğa koymak; blok küçük ve tek işli olmalı.' },
        { term: 'Tek yerden değişiklik', definition: 'Tanımı değiştirince bloğun tüm çağrılarının değişmesi.', example: 'Zıplama süresini tanımda bir kez değiştirirsin, her yerde yeni süre geçerli olur.', pitfall: 'Tanım yerine her çağrıyı elle değiştirmeye çalışmak.' },
      ],
      quiz: [
        { id: 'm2h7d1-q1', kind: 'mcq', prompt: 'Kendi bloğunu yapmanın en büyük yararı nedir?', options: ['Program daha hızlı çalışır', 'Sesler daha güzel çıkar', 'Sprite büyür', 'Sık kullandığın komutları bir ad altında toplayıp her yerde çağırır, değişikliği tek yerde yaparsın'], answer: 3, explanation: 'Kendi blok, tekrar eden komutları tek ad altında toplar. Kod kısalır ve değişiklik tek yerde yapılır. Hız, ses ya da boyutla ilgisi yoktur.', skills: ['sh-proc'] },
        { id: 'm2h7d1-q2', kind: 'numeric', prompt: `Kedi başta y = 0 konumunda. Bu program çalışırken kedi en fazla hangi y değerine ulaşır?\n\n${kod('tanım: zıpla (yükseklik)', '  y\'yi (yükseklik) değiştir', '  0.1 saniye bekle', '  y\'yi (yükseklik × -1) değiştir', '', 'yeşil bayrak tıklanınca', '  zıpla 25', '  zıpla 45', '  y\'yi 10 değiştir')}`, answer: 45, tolerance: 0, unit: 'y', explanation: 'İlk zıplayışta kedi 25\'e çıkıp 0\'a iner. İkincide 45\'e çıkıp 0\'a iner. En yüksek değer 45\'tir. Sonda y 10 olur, ama bu 45\'ten küçüktür.', skills: ['sh-proc', 'sh-coords'] },
        { id: 'm2h7d1-q3', kind: 'find-bug', prompt: `Ece "zıpla" bloğunu tanımladı ama bayrağa basınca kedi zıplamıyor:\n\n${kod('tanım: zıpla', '  y\'yi 20 değiştir', '  0.1 saniye bekle', '  y\'yi -20 değiştir', '', 'yeşil bayrak tıklanınca', '  x\'i 10 değiştir')}\n\nSorun nedir?`, options: ['Zıpla bloğunun adı yanlış', 'Tanımlanan "zıpla" bloğu ana kodda hiç çağrılmamış', 'Bekle bloğu tanımda kullanılamaz', 'Yeşil bayrak başlığı çok kısa'], answer: 1, explanation: 'Tanım yalnız bir tariftir. "Zıpla" bloğunu ana koda koyup çağırmadıkça çalışmaz. Bayrak altında şu an yalnız "x\'i 10 değiştir" var.', skills: ['sh-debug', 'sh-proc'] },
        { id: 'm2h7d1-q4', kind: 'predict-output', prompt: `Kedi 90 yönüne bakıyor. Program bitince kedi hangi yöne bakar?\n\n${kod('tanım: dans et', '  ↻ 30 derece sağa dön', '  0.1 saniye bekle', '  ↺ 10 derece sola dön', '', 'yeşil bayrak tıklanınca', '  dans et', '  dans et', '  dans et')}`, options: ['90 yönüne', '120 yönüne', '150 yönüne', '210 yönüne'], answer: 2, explanation: 'Bir "dans et" çağrısı net olarak 30 − 10 = 20 derece sağa çevirir. Üç çağrı 3 × 20 = 60 derece ekler: 90 + 60 = 150.', skills: ['sh-proc', 'sh-coords'] },
        { id: 'm2h7d1-q5', kind: 'mcq', prompt: 'Zıpla bloğuna "yükseklik" girdisi eklemek ne sağlar?', options: ['Bloğun daha hızlı çalışmasını', 'Kedinin kostüm değiştirmesini', 'Aynı bloğu her çağırışta farklı yükseklikle kullanabilmeyi', 'Bloğun kendiliğinden çalışmasını'], answer: 2, explanation: 'Girdi, bloğa her çağırışta farklı bir değer verebilmeni sağlar. "Zıpla 30" ve "zıpla 60" aynı bloğu kullanır ama farklı yükseklikte zıplatır.', skills: ['sh-proc'] },
      ],
    },
    {
      explainerMd: `### Bu derste öğreneceklerin
- Listenin ne olduğunu ve öğe sırasının 1'den başladığını
- Listenin N. öğesini okumayı
- **sıra** değişkeniyle listeyi gezmeyi
- Soru ve cevap listelerini eşleştirmeyi

### Önceden bilmen gerekenler
Ders 13: kendi blok. Ders 10: değişken. Ders 9: eğer. Ders 11: olana dek tekrarla.

### Liste nedir?
Değişken tek bir değer tutar. **Liste** birçok değeri sıralı tutar, alışveriş listesi gibi. Her öğenin bir **sıra numarası** vardır ve sayım **1'den** başlar. Bir meyveler listesi düşün: elma, armut, kiraz. Burada 3. öğe kirazdır.
Bazı liste blokları:
- **meyveler listesinin 2. öğesi**: armut
- **meyveler listesinin uzunluğu**: 3
- **muz öğesini meyveler listesine ekle**: sona ekler
- **muz öğesini meyveler listesinin 1. sırasına ekle**: başa ekler, diğerleri kayar

### Bilgi yarışması
İki liste kur: **sorular** ve **cevaplar**. İkisi de aynı sırada olmalı: sorular listesinin 2. öğesinin cevabı cevaplar listesinin 2. öğesidir. **sıra** değişkeni 1'den başlar, her soruda 1 artar:
${kod('yeşil bayrak tıklanınca', '  sıra = 1 yap', '  skor = 0 yap', '  sıra > (sorular listesinin uzunluğu) olana dek tekrarla', '    (sorular listesinin (sıra). öğesi) diye sor ve bekle', '    eğer cevap = (cevaplar listesinin (sıra). öğesi) ise', '      Doğru! de 0.5 saniye', '      skor değişkenini 1 kadar değiştir', '    değilse', '      Yanlış de 0.5 saniye', '    sıra değişkenini 1 kadar değiştir')}
Döngü, sıra liste uzunluğunu geçene kadar döner. Sorular listesinde 5 soru varsa döngü 5 tur döner.

### Neden liste?
Her soruyu ayrı değişkende tutarsan yeni soru için kodu değiştirmen gerekir. Listede ise iki listeye birer öğe eklemen yeter; kod aynı kalır. Karşılaştırma büyük ve küçük harfe duyarsızdır: "Doğu" ile "doğu" eşit sayılır.

### Özet
Liste, sıralı değerler topluluğudur. Sıra 1'den başlar. Sorular ve cevaplar listelerini aynı sırada tutup bir sıra değişkeniyle gezerek yarışma yaparsın. Yeni soru eklemek için yalnız listelere öğe eklersin.`,
      concepts: [
        { term: 'Liste', definition: 'Birçok değeri sıralı tutan değişken türü.', example: 'Sorular listesi bütün yarışma sorularını sırayla tutar.', pitfall: 'Her öğe için ayrı değişken açmak; liste hepsini tek yerde toplar.' },
        { term: 'Sıra numarası', definition: 'Bir öğenin listedeki yeri; sayım 1\'den başlar.', example: 'Elma, armut, kiraz listesinde 3. öğe kirazdır.', pitfall: 'Sayıma 0\'dan başlamak; ilk öğe 1\'dir.' },
        { term: 'listenin N. öğesi', definition: 'Listenin N numaralı sırasındaki değeri veren blok.', example: '"sorular listesinin 2. öğesi" ikinci soruyu verir.', pitfall: 'Listeden daha büyük bir sıra numarası yazmak; boş değer gelir.' },
        { term: 'sıra değişkeni', definition: 'Listede şu an hangi öğede olduğunu gösteren sayı değişkeni.', example: 'Her soru sorulunca sıra 1 artar.', pitfall: 'Sıra değişkenini artırmayı unutup aynı soruyu sürekli sormak.' },
        { term: 'Eşleşik listeler', definition: 'Aynı sırada tutulan ve aynı sıradaki öğeleri birbirine karşılık gelen iki liste.', example: 'Sorular listesinin 3. sorusunun cevabı cevaplar listesinin 3. öğesidir.', pitfall: 'Listelerin sırasını farklı yazmak; cevaplar yanlış sorularla karşılaştırılır.' },
      ],
      quiz: [
        { id: 'm2h7d2-q1', kind: 'predict-output', prompt: `meyveler listesi başta şöyle: elma, armut, kiraz. Kedi ne söyler?\n\n${kod('muz öğesini meyveler listesinin 1. sırasına ekle', 'meyveler listesinin 3. öğesi de')}`, options: ['elma', 'armut', 'kiraz', 'muz'], answer: 1, explanation: 'Muz 1. sıraya girince liste muz, elma, armut, kiraz olur ve eskiler bir kayar. 3. öğe armuttur. Kiraz artık 4. sıradadır.', skills: ['sh-list'] },
        { id: 'm2h7d2-q2', kind: 'numeric', prompt: `sorular listesinde 8 soru var. sıra değişkeni 3'ten başlıyor ve her turda 1 artıyor. Döngü kaç tur döner?\n\n${kod('sıra = 3 yap', 'sıra > (sorular listesinin uzunluğu) olana dek tekrarla', '  (bir soru sor)', '  sıra değişkenini 1 kadar değiştir')}`, answer: 6, tolerance: 0, unit: 'tur', explanation: 'sıra 3, 4, 5, 6, 7, 8 değerlerinde döngü çalışır; 9 olunca sıra uzunluğu (8) geçer ve döngü biter. Bu 6 turdur: 8 − 3 + 1.', skills: ['sh-list', 'sh-loop'] },
        { id: 'm2h7d2-q3', kind: 'find-bug', prompt: `Yarışma kodu doğru ama oyuncu doğru cevap verince bile "Yanlış" deniyor. Listeler şöyle:\n\n${kod('sorular: [ "Haftada kaç gün var?", "Üçgenin kaç kenarı var?" ]', 'cevaplar: [ "3", "7" ]')}\n\nSorun nedir?`, options: ['Soru ve cevap listelerinin sırası uyuşmuyor: 1. sorunun cevabı 7 olmalı', 'Cevap listesi çok kısa', 'Sıra değişkeni 0\'dan başlıyor', '"Yanlış" bloğu çok kısa'], answer: 0, explanation: 'Sorular ve cevaplar aynı sırada olmalı. Burada 1. sorunun (haftada kaç gün) cevabı 7, 2. sorunun cevabı 3 olmalıydı. Sırası uyuşmayan listede doğru cevap yanlış öğeyle karşılaştırılır.', skills: ['sh-debug', 'sh-list'] },
        { id: 'm2h7d2-q4', kind: 'find-bug', prompt: `Yarışma hep aynı soruyu soruyor:\n\n${kod('yeşil bayrak tıklanınca', '  sıra = 1 yap', '  sıra > (sorular listesinin uzunluğu) olana dek tekrarla', '    (sorular listesinin (sıra). öğesi) diye sor ve bekle', '    eğer cevap = (cevaplar listesinin (sıra). öğesi) ise', '      Doğru! de 0.5 saniye', '    değilse', '      Yanlış de 0.5 saniye')}\n\nSorun nedir?`, options: ['Sorular listesi boş', 'Eğer bloğu çok uzun', '"Doğru!" yazısı çok kısa', 'Döngüde sıra değişkeni artırılmıyor; hep 1. soru soruluyor'], answer: 3, explanation: 'Sıra 1\'de kalırsa hep 1. soru sorulur ve döngü "sıra > uzunluk" olmadığı için hiç bitmez. Döngünün sonunda "sıra değişkenini 1 kadar değiştir" gerekir.', skills: ['sh-debug', 'sh-var', 'sh-list'] },
        { id: 'm2h7d2-q5', kind: 'mcq', prompt: 'Yarışmaya 6. soruyu eklemek istiyorsun. Soru ve cevaplar liste olarak tutuluyorsa ne yaparsın?', options: ['Bütün kodu baştan yazarsın', 'Sorular ve cevaplar listelerine aynı sırayla birer öğe eklersin; kod değişmez', 'Yeni bir sprite eklersin', 'Sıra değişkenini silersin'], answer: 1, explanation: 'Kod listenin uzunluğuna göre döndüğü için yeni soru yalnız iki listeye (sorular ve cevaplar) eklenir. Kodu değiştirmek gerekmez; bu, listelerin ana avantajıdır.', skills: ['sh-list'] },
      ],
    },
  ],
}

export const hafta8: WeekExtras = {
  guideMd: `### Hafta hedefleri
Bu haftanın sonunda öğrenci:
1. Proje fikrini planlar: kim ya da ne var (sprite), hangi sahneler, hangi bloklar gerekecek.
2. Projenin **en küçük çalışan halini** (bir sprite, bir etkileşim) yapar ve adım adım büyütür.
3. Her yeni özellikten sonra yeşil bayrakla dener; hataları kontrol listesiyle bulup düzeltir.
4. Bir test arkadaşı bulur, ona yardım etmeden izler ve takıldığı yerleri not eder.
5. Projesini sergiler: ne yaptığını, hangi blokların zorladığını ve nasıl çözdüğünü anlatır; esinlendiği fikirleri belirtir.

### Haftanın planı
| Gün | Ders | Süre | Ne yapılır |
|---|---|---|---|
| 1 | Fikir ve plan | ~30 dk | Proje türünü seç, planı yaz, en küçük çalışan halini yap. |
| 2 | Yap, test et, sergile | ~45 dk | Projeyi büyüt, test arkadaşıyla dene, iki şeyi düzelt, sergile. |
| 3 | Hafta projesi: Benim oyunum / hikâyem | ~45 dk | Son rötuşlar, proje bilgisi, aile ya da arkadaşlara sergi. |

### Ön koşul kontrolü
- Önceki haftalardan bir proje sonucu elinde var mı?
- Olay, döngü, değişken, mesaj, klon, kendi blok ve liste kavramlarını söyleyebiliyor mu?
- Kodu kendi başına çalıştırıp hata aramaya hazır mı?

### Kavram haritası
- **Planlama:** fikir → sprite listesi → sahneler → gerekli bloklar
- **En küçük çalışan hal:** bir sprite + bir etkileşim → büyüt
- **Yapma döngüsü:** yap → dene → bul → düzelt → yeniden dene
- **Paylaşma:** test arkadaşı → sergi → proje bilgisi → kaynak belirtme

### Sık yapılan hatalar
- **Plansız başlamak.** Proje bitmeyen bir yığına döner.
- **Her şeyi aynı anda eklemek.** Çalışmayınca hatanın nerede olduğu bilinmez.
- **Plan ile kodu karıştırmak.** Planda sağ ok yazıp kodda başka tuş seçmek gibi.
- **Oyun yeniden başlayınca durumu sıfırlamamak.** Skor, konum, gizle/göster eski haliyle kalır.
- **Proje bilgisine kişisel bilgi yazmak.** Gerçek ad, okul ve adres yazılmaz.

### Hafta sonu tekrarı
1. Sekiz haftanın kavram kartlarına bak: olay, döngü, değişken, koşul, mesaj, klon, kendi blok, liste.
2. Yanlış yaptığın mini test sorularını yeniden çöz.
3. Projenin planını bakmadan bir arkadaşına 1 dakikada anlat.
4. Kontrol listesini kullanarak projende üç olası hatayı ara.
5. Kendi cümlelerinle cevapla: "Bu modülde en çok neyi öğrendin, projende nerede kullandın?"

Hafta sonu testi olarak iki dersin mini testleri yeterlidir; toplam 10 soru. Hedef: her dersten en az 3 doğru.

### Proje değerlendirme ölçütü (Benim oyunum / hikâyem)
| Ölçüt | Gelişmeli | Yeterli | İleri |
|---|---|---|---|
| Plan | Plan yok | Sprite, sahne ve gerekli bloklar yazılı | Plan koda uyuyor, değişiklikleri notlanmış |
| Çalışma | Proje hata veriyor ya da etkileşim yok | Oyuncu tuş ya da tıklamayla bir şey yapıyor, sahne tepki veriyor | Hatasız, yeniden başlatınca düzgün çalışıyor |
| Kapsam | 1 sprite, 5'ten az blok | En az 2 sprite, 10 farklı blok, bir değişken ya da mesaj | Döngü, koşul, değişken, mesaj ve kendi blok birlikte |
| Test ve düzeltme | Test yok | Test arkadaşından alınan notlardan en az iki düzeltme | Düzeltmeleri ve nedenlerini anlatıyor |
| Anlatım | Anlatamıyor | Nasıl oynanacağı proje bilgisinde yazılı | Zorlandığı bloğu ve çözümünü, esinlendiği fikirleri anlatıyor |

### Veli ve öğretmen notu
- **Amaç.** Çocuk bir fikri plan, yapma, deneme ve düzeltme döngüsüyle bitmiş bir projeye dönüştürmeyi öğrensin.
- **Nasıl destek olunur?** Çözümü söylemek yerine sor: "Planında ne yazıyordu?", "En küçük çalışan hali ne?", "Hangi bloğa bakıyorsun?"
- **Test arkadaşı.** Çocuğu yönlendirmeden izleyin; takıldığı yer projeyi iyileştirecek ipucudur.
- **Güvenlik.** Proje ve notu paylaşılabilecek bir dosyadır; gerçek ad, okul, adres ve fotoğraf içermemelidir.
- **Sırada ne var?** Sahne Atölyesi'nde ekrandaki karakterleri yönettin. Sonraki modülde (Arduino) gerçek ışıkları ve sensörleri yöneteceksin: aynı mantık, farklı bir dünya.`,
  lessons: [
    {
      explainerMd: `### Bu derste öğreneceklerin
- Proje planı yazmayı
- Projenin en küçük çalışan halini belirlemeyi
- Etkileşimin ne olduğunu
- Proje bilgisine plan ve açıklama yazmayı

### Önceden bilmen gerekenler
Tüm modül. Özellikle olay (Ders 5), değişken (Ders 10), mesaj (Ders 8), klon (Ders 12), kendi blok (Ders 13) ve liste (Ders 14).

### Plan neden gerekli?
Plansız başlayan proje çoğu zaman bitmez. Planı kâğıda ya da Proje bilgisine yaz:
- Kim ya da ne var? (sprite'lar)
- Hangi sahneler ya da arka planlar var?
- Hangi bloklar gerekecek? (olay, döngü, değişken, mesaj, klon, kendi blok)
- Oyuncu ne yapabilecek?

### En küçük çalışan hal
Projeyi bir anda bitirmeye çalışma. Önce tek bir sprite ve tek bir etkileşimle başla:
${kod('Kedi: sağ ok tuşuna basılınca', '  x\'i 10 değiştir', '  sonraki kostüm', '', 'Kedi: bu sprite tıklanınca', '  Miyav! de 1 saniye')}
Bu çalışınca elma, skor, süre gibi parçaları tek tek ekler ve her eklemeden sonra bayrağa basıp denersin. Bir şey bozulursa hata, eklediğin son parçadadır.

### Etkileşim
**Etkileşim**, oyuncunun bir şey yapması ve sahnenin buna tepki vermesidir: tuşa basmak, tıklamak, mesajla başka bir karakteri harekete geçirmek. Etkileşim yoksa program kendi kendine oynayan bir film olur. Etkileşime tepki olarak sahnede görünür ya da duyulur bir şey değişmelidir. Örneğin yukarıdaki kodda sağ oka 3 kez basarsan kedi 3 × 10 = 30 birim sağa gider.

### Esinlenme ve güvenlik
Başkasının fikrinden esinlendiysen proje notuna yaz. Notlara gerçek adını, okulunu, adresini ve fotoğrafını yazma; proje dosyası paylaşılabilir.

### Özet
Önce planla: sprite, sahne ve bloklar. En küçük çalışan halini yap ve adım adım büyüt. Projede oyuncunun yapabildiği bir etkileşim olsun. Esinlendiğin fikirleri belirt, kişisel bilgi yazma.`,
      concepts: [
        { term: 'Plan', definition: 'Projeyi yapmadan önce yazılan taslak: sprite\'lar, sahneler, gerekli bloklar, oyuncunun yapacakları.', example: '"Kedi ve elma var, 3 arka plan, skor için değişken, sağ ok ile yürüme."', pitfall: 'Plansız başlayıp ilk bloktan sonra ne yapacağını bilememek.' },
        { term: 'En küçük çalışan hal', definition: 'Projenin çalışan en basit sürümü: bir sprite ve tek bir etkileşim.', example: 'Kedi sağ oka basınca yürüyor, bu bir başlangıçtır.', pitfall: 'Her şeyi bir anda eklemeye çalışıp hiçbir şeyin çalışmaması.' },
        { term: 'Etkileşim', definition: 'Oyuncunun bir şey yapması ve sahnenin buna tepki vermesi.', example: 'Ok tuşuna basınca kedinin yürümesi bir etkileşimdir.', pitfall: 'Sadece bayrakta çalışan bir program yazıp oyuncuya hiçbir şey yaptırmamak.' },
        { term: 'Proje bilgisi', definition: 'Projenin adını ve notlarını (plan, nasıl oynanır) yazdığın bölüm.', example: '"Sağ ve sol ok tuşlarıyla kediyi yürüt, elmaya değince puan kazanırsın."', pitfall: 'Gerçek adını, okulunu ya da adresini bu bölüme yazmak.' },
        { term: 'Esinlenme', definition: 'Başkasının fikrinden yola çıkıp onu kendi projene uyarlamak.', example: 'Arkadaşının yakalama oyunundan esinlendiysen notuna bunu yaz.', pitfall: 'Başkasının fikrini kendi fikrinmiş gibi sunmak.' },
      ],
      quiz: [
        { id: 'm2h8d1-q1', kind: 'mcq', prompt: 'Projenin "en küçük çalışan hali" hangisidir?', options: ['Bütün sprite\'ları, sahneleri ve skoru tek seferde eklemek', 'Yalnız arka plan çizmek', 'Tek bir sprite ve tek bir etkileşimin (ör. sağ oka basınca yürüme) çalıştığı sürüm', 'Hiç blok kullanmadan plan yazmak'], answer: 2, explanation: 'En küçük çalışan hal, gerçekten çalışan en basit sürümdür: bir sprite ve bir etkileşim. Üzerine tek tek yeni parçalar eklenir. Hepsini birden eklemek, hata olunca nedenini bulmayı zorlaştırır.', skills: ['sh-plan'] },
        { id: 'm2h8d1-q2', kind: 'numeric', prompt: `Kedi x = 0 konumunda. Kodu şu. Oyuncu sağ ok tuşuna 3 kez basıp kediye bir kez tıklıyor. Kedinin son x değeri kaç olur?\n\n${kod('Kedi: sağ ok tuşuna basılınca', '  x\'i 10 değiştir', '  sonraki kostüm', '', 'Kedi: bu sprite tıklanınca', '  Miyav! de 1 saniye')}`, answer: 30, tolerance: 0, unit: 'x', explanation: 'Her sağ ok basışı x\'i 10 artırır: 3 × 10 = 30. Tıklama yalnız konuşturur, konumu değiştirmez.', skills: ['sh-events', 'sh-coords'] },
        { id: 'm2h8d1-q3', kind: 'find-bug', prompt: `Planda "sağ ok tuşuyla kedi yürüsün" yazıyor. Ama oyuncu sağ oka basınca kedi kıpırdamıyor:\n\n${kod('Kedi: a tuşuna basılınca', '  x\'i 10 değiştir', '  sonraki kostüm')}\n\nSorun nedir?`, options: ['Kod plana uymuyor: başlıkta "sağ ok" yerine "a" tuşu seçilmiş', '10 adım çok az', 'Sonraki kostüm bloğu hareket ettirmez', 'Kedi tek kostümlü'], answer: 0, explanation: 'Planda sağ ok yazıyor ama kodda a tuşu seçilmiş. Başlıktaki tuşu planla eşleştirmek sorunu çözer. Plan ile kodu karşılaştırmak hata bulmanın iyi bir yoludur.', skills: ['sh-debug', 'sh-plan', 'sh-events'] },
        { id: 'm2h8d1-q4', kind: 'mcq', prompt: 'Proje bilgisine hangisini YAZMAMALISIN?', options: ['Nasıl oynanacağını', 'Esinlendiğin fikri', 'Projenin adını', 'Gerçek adını ve okulunun adını'], answer: 3, explanation: 'Proje dosyası paylaşılabilir; gerçek ad, okul, adres ve fotoğraf gibi kişisel bilgiler yazılmaz. Nasıl oynandığı, projenin adı ve esinlenme ise yazılması gereken bilgilerdir.', skills: ['sh-safety'] },
        { id: 'm2h8d1-q5', kind: 'mcq', prompt: 'Hangisi bir etkileşimdir?', options: ['Yeşil bayrak, kediyi bir kez yürütür ve program biter', 'Oyuncu ok tuşuna basar, karakter yürür', 'Arka plan resmi gökyüzüdür', 'Sprite\'ın adı "Kedi"dir'], answer: 1, explanation: 'Etkileşimde oyuncu bir şey yapar ve sahne buna tepki verir. Bayrakla bir kez çalışan program, arka plan ya da sprite adı oyuncunun yaptığı bir şey değildir.', skills: ['sh-events', 'sh-plan'] },
      ],
    },
    {
      explainerMd: `### Bu derste öğreneceklerin
- Küçük adımlarla yapıp denemeyi
- Hata avı için kontrol listesini
- Test arkadaşıyla test etmeyi
- Projeni anlatmayı

### Önceden bilmen gerekenler
Ders 15: plan ve en küçük çalışan hal. Önceki derslerdeki hata bulma ipuçları.

### Yap, dene, bul, düzelt
Büyük projeyi tek seferde yazma. Döngü şöyledir: küçük bir özellik ekle, yeşil bayrakla dene, hata varsa hemen bul ve düzelt, sonra yeni özellik ekle. Yeni özelliğe geçmeden önce eskisi çalışmalıdır.

### Hata avı kontrol listesi
Bir şey çalışmıyorsa şunlara bak:
- Bloklar bir başlığa bağlı mı? (Ders 1)
- Doğru sprite seçili mi? (Ders 2)
- Blok, döngünün içinde mi? (Ders 4)
- Doğru olay ve doğru mesaj adı mı? (Ders 5, 8)
- Skor ve süre başta ayarlanıyor mu? (Ders 10)
- Oyun yeniden başlayınca her şey başlangıç durumuna dönüyor mu? Konum, görünürlük, değişkenler.

### Test arkadaşı
Projeni bir arkadaşına oynat, ona **yardım etme**; yalnız izle ve nerede takıldığını not al. Arkadaşın takıldıysa oyun yeterince açık değildir; bu senin için bilgidir. Örneğin 5 arkadaşından 3'ü ilk seviyede takılıyorsa takılma oranı 3 ÷ 5 = %60'tır. Böyle bir sayı neyi önce düzeltmen gerektiğini gösterir. Notlardan en az iki şeyi düzelt.

### Sergi
Projeni ailene ve arkadaşlarına göster. Ne yaptığını, hangi bloğun seni zorladığını ve nasıl çözdüğünü anlat. Esinlendiğin fikirleri belirt. Proje bilgisine nasıl oynanacağını yaz; kişisel bilgi yazma.

### Özet
Küçük adımlarla ilerle, her adımdan sonra dene. Çalışmayanı kontrol listesiyle ara. Test arkadaşına yardım etmeden izle ve notlarından düzeltme yap. Projeni anlatırken zorlandığın yerleri ve çözümlerini paylaş.`,
      concepts: [
        { term: 'Yap, dene, düzelt', definition: 'Küçük bir parça ekleyip hemen deneme ve hataları anında düzeltme yöntemi.', example: 'Skoru ekleyince oyunu çalıştırıp skorun arttığını görürsün.', pitfall: 'Hepsini yazıp sonunda denemek; hatanın nerede olduğunu bulmak zorlaşır.' },
        { term: 'Test arkadaşı', definition: 'Projeni deneyen ve senin yardım etmeden izlediğin kişi.', example: 'Arkadaşın ilk seviyede takılırsa o bölümün açık olmadığını anlarsın.', pitfall: 'Arkadaşına ipucu vermek; gerçek sorunu göremezsin.' },
        { term: 'Hata avı kontrol listesi', definition: 'Çalışmayan projede sırayla bakılacak noktalar listesi.', example: 'Başlığa bağlı mı, doğru sprite mi, döngü içinde mi diye sorarsın.', pitfall: 'Rastgele blok değiştirmek; liste ile sırayla bakmak daha hızlıdır.' },
        { term: 'Başlangıç durumuna dönmek', definition: 'Oyun yeniden başlayınca konum, görünürlük ve değişkenlerin ilk haline gelmesi.', example: 'Bayrak altında skoru sıfırlamak ve gizlenen sprite\'ı göstermek.', pitfall: 'İlk çalıştırmada çalışıp ikincide bozulan bir proje bırakmak.' },
        { term: 'Sergi', definition: 'Projeni başkalarına gösterip ne yaptığını ve nasıl çözdüğünü anlatma.', example: 'Zorlandığın bloğu ve çözümünü ailene anlatırsın.', pitfall: 'Yalnız sonucu göstermek; öğrendiklerini anlatmak da önemlidir.' },
      ],
      quiz: [
        { id: 'm2h8d2-q1', kind: 'mcq', prompt: 'Test arkadaşın projeni oynarken ne yapmalısın?', options: ['Takılınca hemen ipucu vermeli', 'Hiç not almamalısın', 'Yardım etmeden izlemeli ve takıldığı yeri not almalısın', 'Arkadaşın yerine oynamalısın'], answer: 2, explanation: 'Yardım edersen oyunun gerçekte nerede anlaşılmaz olduğunu göremezsin. İzlemek ve takıldığı yeri not almak düzeltilecek şeyi gösterir.', skills: ['sh-plan'] },
        { id: 'm2h8d2-q2', kind: 'numeric', prompt: `Kedi x = -150 konumundan başlıyor. Oyuncu sağ ok tuşuna 8 kez basıyor.\n\n${kod('Kedi: sağ ok tuşuna basılınca', '  x\'i 12 değiştir')}\n\nKedinin son x değeri kaç olur?`, answer: -54, tolerance: 0, unit: 'x', explanation: 'Her basış x\'e 12 ekler: 8 × 12 = 96. -150 + 96 = -54. Kedi hâlâ sahnenin solunda (x negatif).', skills: ['sh-coords', 'sh-events'] },
        { id: 'm2h8d2-q3', kind: 'find-bug', prompt: `Elma sepete düşünce kayboluyor, ama oyuncu yeşil bayrağa tekrar basınca elma görünmüyor:\n\n${kod('Elma: yeşil bayrak tıklanınca', '  y konumu < -100 olana dek tekrarla', '    y\'yi -5 değiştir', '  gizle')}\n\nSorun nedir?`, options: ['Yeniden başlayınca elmayı göstermek ve başlangıç yerine koymak için blok yok', 'Elma çok hızlı düşüyor', 'Gizle bloğu yanlış kategoride', 'Olana dek tekrarla yerine tekrarla gerekir'], answer: 0, explanation: 'Gizle bloğu elmayı gizlediği için ikinci oyunda elma hâlâ gizli ve aşağıda kalır. Bayrak altında önce "göster" ve "x: ... y: ... konumuna git" ile başlangıç durumuna dönmek gerekir.', skills: ['sh-debug', 'sh-plan'] },
        { id: 'm2h8d2-q4', kind: 'mcq', prompt: 'Projeni büyütmek için hangi çalışma sırası daha iyidir?', options: ['Hepsini yaz, sonunda tek seferde dene', 'Önce sergile, sonra test et', 'Hata bulursan projeyi sil', 'Küçük bir özellik ekle, dene, varsa hatayı düzelt, sonra yenisini ekle'], answer: 3, explanation: 'Küçük adımlarla ilerlemek hatayı son eklediğin parçaya daraltır. Hepsini yazıp sonra denemek, hatanın yerini bulmayı zorlaştırır.', skills: ['sh-plan', 'sh-debug'] },
        { id: 'm2h8d2-q5', kind: 'numeric', prompt: '5 test arkadaşından 3\'ü ilk seviyede takıldı. Takılma oranı yüzde kaçtır?', answer: 60, tolerance: 0, unit: '%', explanation: '3 ÷ 5 = 0,6 yani yüzde 60. Böyle bir oran ilk seviyeyi sadeleştirmen gerektiğini gösterir.', skills: ['sh-plan'] },
      ],
    },
  ],
}
