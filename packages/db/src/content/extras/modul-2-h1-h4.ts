import type { WeekExtras } from '../extras'
import { kod } from './modul-2-ortak'

// Modül 2, hafta 1-4. Soru kimliği: m2h<hafta>d<ders>-q<n>. Blok dizileri Sahne Atölyesi'ndeki gerçek blok adlarıyla yazılır.

export const hafta1: WeekExtras = {
  guideMd: `### Hafta hedefleri
Bu haftanın sonunda öğrenci:
1. Programın, bilgisayarın aynen uyguladığı sıralı komutlar olduğunu açıklayabilir.
2. Komut sırasının sonucu değiştirdiğini ve **tekrarla** ile kısa program yazılabileceğini gösterebilir.
3. Sahne Atölyesi'nde sahne, sprite listesi, blok paleti ve kod alanını bulabilir; sprite, kostüm ve arka plan farkını söyleyebilir.
4. **yeşil bayrak tıklanınca** başlığıyla bir programı başlatabilir.
5. Sahnede x ve y koordinatını okuyup bir sprite'ı istediği yere götürebilir.

### Haftanın planı
Hafta iki derstir; üçüncü gün serbest proje zamanıdır. Daha yoğun bir takvim isteyenler iki dersi aynı güne koyabilir.

| Gün | Ders | Süre | Ne yapılır |
|---|---|---|---|
| 1 | Programlanmış dans | ~25 dk | Anlatımı oku, dans programını yaz, Robot'u izle, hatayı bul ve düzelt, mini testi çöz. |
| 2 | Sahne Atölyesi'nde ilk projem | ~30 dk | Bölümleri tanı, yeni sprite ve arka plan ekle, bayrağa hareket bloğu tutturup çalıştır. |
| 3 | Hafta projesi: İlk projem | ~20 dk | 10 farklı blokla sprite'a bir şey yaptır; bir arkadaşına göster. |

### Ön koşul kontrolü
Bu hafta özel bir ön bilgi gerekmez. Başlamadan önce şunları kontrol et:
- Tarayıcıda Sahne Atölyesi açılıyor mu?
- Öğrenci fareyle sürükleyip bırakabiliyor mu?
- Sağ-sol, yukarı-aşağı kavramları rahat mı? (Koordinatlar bunlara dayanır.)

### Kavram haritası
- **Program:** komut → sıra → tekrarla → hata ayıklama
- **Sahne Atölyesi:** sahne, sprite listesi, blok paleti, kod alanı → sprite, kostüm, arka plan
- **Başlatma:** başlık bloğu → yeşil bayrak tıklanınca
- **Konum:** x (sağa artar), y (yukarı artar), merkez (0, 0)

### Sık yapılan hatalar
- **Bloğu bayrağa tutturmamak.** Bloklar yan yana durur ama bağlı değildir; hiçbir şey olmaz.
- **Başka sprite'ın kod alanında çalışmak.** Her sprite'ın kendi kodu vardır; hangi sprite seçili diye bak.
- **Sprite ile kostümü karıştırmak.** Kostüm sprite'ın görünüşüdür, ayrı bir karakter değildir.
- **Komut sırasını gözden kaçırmak.** Önce dön sonra yürümek, önce yürüyüp sonra dönmekten farklıdır.
- **y'nin yönünü ters sanmak.** y yukarı çıktıkça artar; aşağı inmek için eksi değer gerekir.

### Hafta sonu tekrarı
1. Her dersin kavram kartlarını bir kez daha oku ve "sık yapılan yanlış" satırlarını yüksek sesle söyle.
2. Mini testlerde yanlış yaptığın soruların açıklamalarını oku, sonra soruyu yeniden çöz.
3. Robot dansını bakmadan yeniden yaz ve bir yerine **tekrarla** koy.
4. Kâğıda sahneyi çiz, ortasına (0, 0) yaz. Üç noktanın koordinatını söyle.
5. Kendi cümlelerinle cevapla: "Sprite, kostüm ve arka plan arasındaki fark nedir?"

Hafta sonu testi olarak iki dersin mini testleri yeterlidir; toplam 9 soru. Hedef: her dersten en az 3 doğru. Eksik kalan dersin anlatımına dön.

### Proje değerlendirme ölçütü (İlk projem)
| Ölçüt | Gelişmeli | Yeterli | İleri |
|---|---|---|---|
| Başlatma | Bloklar bayrağa bağlı değil, proje çalışmıyor | Bayrağa basınca sprite kıpırdıyor | Birden çok başlık ya da sprite kullanıyor |
| Sahne | Karakter ve arka plan hazır haliyle duruyor | Yeni bir karakter ve bir arka plan seçilmiş | Seçimlerini hikâyesiyle açıklıyor |
| Bloklar | 5'ten az farklı blok | 10 farklı blok | 10'dan fazla ve bloklar anlamlı bir şey yapıyor |
| Anlatım | Ne yaptığını anlatamıyor | Bloklarını sırayla anlatıyor | Hata yapıp nasıl düzelttiğini anlatıyor |

### Veli ve öğretmen notu
- **Amaç.** Bu hafta bir şey ezberletmek değil, çocuğun bilgisayarın yorum yapmadığını hissetmesi ve Sahne Atölyesi'ne alışmasıdır. Yanlış blok sanaldır; geri alınır.
- **Nasıl destek olunur?** Cevabı söylemek yerine sor: "Bloklar bayrağa bağlı mı?", "Hangi sprite seçili?", "Robot ne yaptı, sen ne yazmıştın?"
- **Süre.** Dersleri aynı gün peş peşe yapmak yerine aralıklı çalışmak kalıcılığı artırır.
- **Güvenlik.** Projede ve proje notunda gerçek ad, okul, adres ve fotoğraf yazılmaz. Paylaşılan dosyada bunlar görünebilir.
- **İlerleme.** Mini test sonuçları "İlerlemem" sayfasında beceri bazında görünür (taslak özellik; yalnız onay verildiyse kaydedilir).`,
  lessons: [
    {
      explainerMd: `### Bu derste öğreneceklerin
- Programın ne olduğunu ve bilgisayarın onu nasıl uyguladığını
- Komut sırasının sonucu neden değiştirdiğini
- **Tekrarla** ile aynı işi kısa yazmayı
- Çalışmayan programda hatayı bulmayı

### Önceden bilmen gerekenler
Hiçbir şey. Bu ders bilgisayar bilgisi istemez; Robot'a komut kartlarıyla dans öğreteceksin.

### Program, komutlardan yapılmış bir tariftir
**Program**, bilgisayara verilen sıralı komutlar listesidir. Yemek tarifine benzer: "yumurtayı kır, tavaya dök, pişir." Ama bilgisayar çok dikkatli ve hiç düşünmeyen bir aşçıdır. Yazdığını **aynen** yapar. "Herhalde şunu demek istedi" diye tahmin etmez.

### Sıra önemlidir
Robot başlangıçta sağa bakar. Şu iki programa bak:
${kod('yeşil bayrak tıklanınca', '  40 adım git', '  ↻ 90 derece sağa dön', '  Alkış sesini çal')}
${kod('yeşil bayrak tıklanınca', '  ↻ 90 derece sağa dön', '  40 adım git', '  Alkış sesini çal')}
Birincide Robot önce sağa yürür, sonra aşağı bakıp alkışlar. İkincide önce aşağı bakar, sonra aşağı yürür. Aynı üç kart, farklı sıra, farklı dans.

### Tekrarla
Aynı iki kartı üç kere yapmak için altı kart dizmek zorunda değilsin:
${kod('3 kere tekrarla', '  20 adım git', '  Alkış sesini çal')}
**3 kere tekrarla** bloğu içindeki kartları üç kez çalıştırır. Program kısalır, değiştirmesi de kolaylaşır.

### Hata bulma
Dans çirkin çıktıysa bilgisayar yanlış yapmamıştır; program yazdığını yapmıştır. Hataya İngilizce **bug** (böcek) denir, bulup düzeltmeye **hata ayıklama**. Yöntem: kartları sırayla parmağınla izle ve her kartta Robot'un ne yapacağını söyle. Beklediğinden ayrıldığın kart hatalı karttır.

### Özet
Program, sıralı komutlardır. Bilgisayar komutları aynen ve sırayla uygular. Tekrarla bloğu aynı komutları sayılı kez çalıştırır. Bir program beklediğini yapmazsa komutları tek tek izleyerek hatayı bulursun.`,
      concepts: [
        { term: 'Program', definition: 'Bilgisayara verilen, sıralı komutlar listesi.', example: 'Dans kartlarını bayrağın altına dizince Robot için bir dans programı yazmış olursun.', pitfall: 'Bilgisayarın ne demek istediğini anlayacağını sanmak; yalnız yazılanı yapar.' },
        { term: 'Komut', definition: 'Bilgisayara tek bir iş yaptıran en küçük parça (bir blok ya da kart).', example: '"20 adım git" bir komuttur.', pitfall: 'Bir adımı yazmayı atlayıp bilgisayarın kendisinin tamamlamasını beklemek.' },
        { term: 'Sıra', definition: 'Komutlar yukarıdan aşağıya, yazıldığı sırayla çalışır.', example: 'Önce dön sonra yürümek, önce yürüyüp sonra dönmekten farklı bir yere götürür.', pitfall: 'Aynı kartları farklı sıraya koyup aynı sonucu beklemek.' },
        { term: 'Tekrarla', definition: 'İçindeki komutları sayılı kez çalıştıran blok.', example: '"3 kere tekrarla: adım git, alkış" dansta adım ve alkışı üç kez yaptırır.', pitfall: 'Kartları tekrarla bloğunun içine değil yanına koymak; o zaman yalnız bir kez çalışır.' },
        { term: 'Başlık bloğu', definition: 'Bir komut yığınını başlatan blok. Bayrak başlığı programı yeşil bayrağa basınca çalıştırır.', example: '"yeşil bayrak tıklanınca" bloğunun altındaki kartlar bayrağa basınca çalışır.', pitfall: 'Kartları bayrağa tutturmadan yan yana bırakmak; bağlı olmayan komutlar hiç çalışmaz.' },
        { term: 'Hata ayıklama', definition: 'Programdaki hatayı bulup düzeltme işi.', example: 'Dans çirkin çıkınca kartları sırayla izleyip beklediğinden ayrılan kartı bulursun.', pitfall: 'Hata olunca bilgisayarı suçlamak; hata çoğunlukla programdadır.' },
      ],
      quiz: [
        { id: 'm2h1d1-q1', kind: 'mcq', prompt: 'Robot, dans programındaki bir kartı garip bulsa bile ne yapar?', options: ['Kendi aklına göre düzeltir', 'Kartı atlar', 'Kartı aynen uygular', 'Durur ve sana sorar'], answer: 2, explanation: 'Bilgisayar yorum yapmaz; yazılan komutu aynen uygular. Bu yüzden programın doğru olması senin işin. Düzeltmek, atlamak ya da sormak gibi şeyleri Robot kendiliğinden yapmaz.', skills: ['sh-program'] },
        { id: 'm2h1d1-q2', kind: 'predict-output', prompt: `Robot başlangıçta sağa bakıyor. Bu program çalışınca Robot ne yapar?\n\n${kod('yeşil bayrak tıklanınca', '  20 adım git', '  ↻ 90 derece sağa dön', '  30 adım git')}`, options: ['Önce sağa 20 adım gider, sonra aşağı doğru 30 adım gider', 'Önce aşağı 20 adım gider, sonra sağa 30 adım gider', 'Sağa 50 adım gider', 'Yukarı doğru 30 adım gider'], answer: 0, explanation: 'Komutlar sırayla çalışır: önce sağa bakarken 20 adım, sonra sağa dönünce (artık aşağı bakıyor) 30 adım. Dönme komutu yürümeden sonra geldiği için ilk 20 adım hâlâ sağa doğrudur.', skills: ['sh-program'] },
        { id: 'm2h1d1-q3', kind: 'numeric', prompt: `Robot toplam kaç adım yürür?\n\n${kod('yeşil bayrak tıklanınca', '  10 adım git', '  4 kere tekrarla', '    5 adım git')}`, answer: 30, tolerance: 0, unit: 'adım', explanation: 'İlk komut 10 adım yürütür. Tekrarla bloğu 5 adımı 4 kez yürütür: 4 × 5 = 20 adım. Toplam 10 + 20 = 30. Tekrarla yalnız kendi içindekileri tekrarlar, dışındaki 10 adımı değil.', skills: ['sh-loop', 'sh-program'] },
        { id: 'm2h1d1-q4', kind: 'find-bug', prompt: `Deniz, Robot önce dönsün sonra alkışlasın istiyor. Bayrağa basıyor ama hiçbir şey olmuyor. Kod alanında şunlar var:\n\n${kod('yeşil bayrak tıklanınca', '', '↻ 90 derece sağa dön      (ayrı duruyor)', 'Alkış sesini çal        (ayrı duruyor)')}\n\nSorun nedir?`, options: ['Dön bloğunun açısı çok küçük', 'Alkış sesi Robot\'ta yok', 'Bayrak bloğu yanlış renkte', 'Dön ve alkış blokları bayrak bloğuna tutturulmamış'], answer: 3, explanation: 'Bayrak bloğuna bağlı olmayan komutlar hiç çalışmaz, çünkü onları başlatan bir başlık yoktur. Blokları bayrağın altına yapıştırmak gerekir. Açının küçük ya da ses seçili olması sorunu çözmezdi: bloklar çalışmadığı için bu ayarlar hiç görülmüyor.', skills: ['sh-debug', 'sh-program'] },
      ],
    },
    {
      explainerMd: `### Bu derste öğreneceklerin
- Sahne Atölyesi'nin bölümlerini
- Sprite, kostüm ve arka plan farkını
- **yeşil bayrak tıklanınca** ile program başlatmayı
- Sahnedeki x ve y koordinatlarını okumayı

### Önceden bilmen gerekenler
Ders 1: program komutlardan oluşur, komutlar sırayla çalışır ve başlığa bağlı olmalıdır.

### Sahne Atölyesi'nin bölümleri
Sağ üstte **sahne** var; oyun orada oynanır. Sağ altta sahnedeki karakterlerin listesi duruyor. Solda blok paleti, ortada **kod alanı** bulunur.

### Sprite, kostüm, arka plan
**Sprite**, sahnedeki karakterin kendisidir. **Kostüm**, o karakterin görünüşüdür; bir sprite'ın birden çok kostümü olabilir. **Arka plan** sahnenin resmidir. Kostümü **Kostümler** sekmesinde, kodu **Kod** sekmesinde yaparsın. Her sprite'ın kendi kodu vardır: kod alanı o an seçili sprite'a aittir. Köpeği yürütecek bloklar köpeğin kod alanında olmalıdır.

### Programı başlatmak
Bloklar tek başına durunca bir şey olmaz. Program bir **başlık** bloğuyla başlar. En çok kullanılanı **yeşil bayrak tıklanınca** bloğudur. Altına tutturduğun bloklar bayrağa basınca çalışır.

### Koordinatlar
Sahne bir ızgara gibidir. Merkezi (0, 0) noktasıdır. **x** sağa doğru artar, **y** yukarı doğru artar. Sahne 480 birim geniş ve 360 birim yüksektir. Yani x değeri −240 ile 240, y değeri −180 ile 180 arasındadır. Örnek:
${kod('yeşil bayrak tıklanınca', '  x: 60 y: -40 konumuna git', '  y\'yi 20 değiştir')}
Sprite önce (60, −40) noktasına gider, sonra y 20 artar: (60, −20) olur.

### Güvenlik
Projeni dosya olarak paylaşacaksan gerçek adını, okulunu, adresini ve fotoğrafını projeye ya da proje notuna yazma.

### Özet
Sahnede sprite'lar çalışır; kostüm sprite'ın görünüşü, arka plan sahnenin resmidir. Her sprite'ın kendi kodu vardır. Program başlık bloğuyla başlar. Konum (x, y) ile verilir; merkez (0, 0), x sağa, y yukarı artar.`,
      concepts: [
        { term: 'Sprite', definition: 'Sahnedeki bir karakter ya da nesne. Her sprite\'ın kendi kodu vardır.', example: 'Kedi ve köpek iki ayrı sprite\'tır; her birinin kod alanı ayrıdır.', pitfall: 'Seçili olmayan sprite\'ın hareket etmesini beklemek; kod hangi sprite seçiliyse ona yazılır.' },
        { term: 'Kostüm', definition: 'Bir sprite\'ın görünüşlerinden biri.', example: 'Kedinin iki kostümü var: adımın iki hali.', pitfall: 'Kostümü ayrı bir karakter sanmak; kostüm değişince sprite aynı kalır.' },
        { term: 'Arka plan', definition: 'Sahnenin resmi. Sprite\'ların arkasında durur.', example: 'Gökyüzü arka planı seçince kedi gökyüzünün önünde görünür.', pitfall: 'Arka planı sprite gibi hareket ettirmeye çalışmak.' },
        { term: 'Kod alanı', definition: 'Blokları sürükleyip birleştirdiğin orta bölüm. Seçili sprite\'ın kodunu gösterir.', example: 'Kedi seçiliyken kod alanında kedinin blokları görünür.', pitfall: 'Yanlış sprite seçiliyken kod yazıp sonucu sahnede göremeyince şaşırmak.' },
        { term: 'Koordinat', definition: 'Sahnedeki konumu gösteren iki sayı: x (sağa artar) ve y (yukarı artar). Merkez (0, 0).', example: '"x: 60 y: -40 konumuna git" sprite\'ı sağda ve biraz aşağıda bir yere götürür.', pitfall: 'y\'yi ters sanmak: aşağı inmek için y azalır.' },
      ],
      quiz: [
        { id: 'm2h1d2-q1', kind: 'mcq', prompt: 'Sahne Atölyesi\'nde bir karakterin görünüşünü (resmini) değiştirmek için hangi sekmeye gidersin?', options: ['Kod', 'Kostümler', 'Sesler', 'Blok paleti'], answer: 1, explanation: 'Görünüş kostümde tutulur ve Kostümler sekmesinde değiştirilir. Kod sekmesi blokları, Sesler sekmesi sesleri içerir.', skills: ['sh-stage'] },
        { id: 'm2h1d2-q2', kind: 'mcq', prompt: 'Hangisi doğrudur?', options: ['Sprite sahnenin arka plan resmidir', 'Arka plan sprite\'ın kodudur', 'Kostüm bir sprite\'ın görünüşlerinden biridir', 'Kod alanı bütün sprite\'lar için ortaktır'], answer: 2, explanation: 'Sprite karakterdir, kostüm onun görünüşüdür, arka plan sahnenin resmidir. Kod alanı ortak değildir; her sprite\'ın kendi kodu vardır.', skills: ['sh-stage'] },
        { id: 'm2h1d2-q3', kind: 'predict-output', prompt: `Kedi başta (0, 0) noktasında. Bayrağa basılınca kedi hangi konumda biter?\n\n${kod('yeşil bayrak tıklanınca', '  x: -100 y: 50 konumuna git', '  x\'i 30 değiştir', '  y\'yi -80 değiştir')}`, options: ['(-70, -30)', '(-130, 130)', '(-70, 30)', '(-100, -30)'], answer: 0, explanation: 'Önce (-100, 50) noktasına gider. x\'e 30 eklenir: -100 + 30 = -70. y\'ye -80 eklenir: 50 - 80 = -30. Sonuç (-70, -30).', skills: ['sh-coords'] },
        { id: 'm2h1d2-q4', kind: 'numeric', prompt: `Kedi başlangıçta x = -150 konumunda. Bayrağa basılınca kedinin x değeri kaç olur?\n\n${kod('yeşil bayrak tıklanınca', '  4 kere tekrarla', '    x\'i 30 değiştir')}`, answer: -30, tolerance: 0, unit: 'x', explanation: 'x\'e 30 dört kez eklenir: 4 × 30 = 120. -150 + 120 = -30. Sağa gidince x artar, o yüzden sayı sıfıra yaklaşır.', skills: ['sh-coords', 'sh-loop'] },
        { id: 'm2h1d2-q5', kind: 'find-bug', prompt: `Seda bayrağa basınca köpeğin de yürümesini istiyor. Ama yalnız kedi yürüyor:\n\n${kod('Kedi\'nin kod alanı:', '  yeşil bayrak tıklanınca', '    20 adım git', '', 'Köpek\'in kod alanı:', '  (boş)')}\n\nSorun nedir?`, options: ['Köpeğin kostümü eksik', 'Yeşil bayrak yalnız ilk sprite\'ı çalıştırır', '20 adım köpek için çok az', 'Köpeğin kendi kodu yok; yürüme bloğu yalnız kedinin kod alanında'], answer: 3, explanation: 'Her sprite yalnız kendi kod alanındaki bloğu çalıştırır. Köpeğin kod alanı boş olduğu için kıpırdamaz. Köpeği seçip ona da yeşil bayrak ve hareket bloğu koymak gerekir.', skills: ['sh-stage', 'sh-debug'] },
      ],
    },
  ],
}

export const hafta2: WeekExtras = {
  guideMd: `### Hafta hedefleri
Bu haftanın sonunda öğrenci:
1. Kostüm değiştirerek animasyon yapabilir; **sonraki kostüm** bloğunun son kostümden sonra başa döndüğünü bilir.
2. Bekleme süresinin animasyon hızını nasıl değiştirdiğini hesaplayabilir (0,2 saniye bekleme saniyede 5 değişim).
3. **sonsuza kadar** ile **N kere tekrarla** arasındaki farkı açıklayıp doğru olanı seçebilir.
4. Birden çok sprite'ın aynı anda (paralel) çalıştığını gösterebilir.
5. **kenara değince sek** ile karakteri sahnede gezdirebilir.

### Haftanın planı
| Gün | Ders | Süre | Ne yapılır |
|---|---|---|---|
| 1 | Kostüm değiştir, karakter yürüsün | ~30 dk | İki kostümlü karakteri canlandır, bekleme süresini 0,1 ve 1 saniye yap, farkı gör. |
| 2 | Sonsuza kadar ve tekrar | ~30 dk | Blokları döngünün içine al, kenara çarpınca sektir, ikinci sprite'ı da canlandır. |
| 3 | Hafta projesi: Canlı karakter | ~25 dk | İki karakterli bir yürüyüş sahnesi yap, arka plan seç, arkadaşına göster. |

### Ön koşul kontrolü
- Öğrenci bir sprite'a yeşil bayrak başlığı koyup blok tutturabiliyor mu?
- Kostüm ve sprite farkını söyleyebiliyor mu? (Hafta 1)
- Saniyenin 0,2 gibi ondalık değerlerini anlıyor mu? Gerekirse "1 saniyede kaç tane 0,2 sığar?" diye önce kâğıtta çalışın.

### Kavram haritası
- **Animasyon:** kostüm → sonraki kostüm → bekle → hız (1 ÷ bekleme süresi)
- **Döngü:** tekrarla (sayılı) → sonsuza kadar → döngünün içi ve dışı
- **Paralellik:** iki sprite → iki ayrı kod → aynı anda çalışır
- **Hareket:** adım git → kenara değince sek

### Sık yapılan hatalar
- **Blokları döngünün dışına koymak.** Yalnız bir kez çalışır, karakter bir adım atıp durur.
- **Bekle bloğunu unutmak.** Değişim o kadar hızlı olur ki göz seçemez.
- **Bekleme süresini büyük yapıp "takıldı" sanmak.** 1 saniye bekleme slayt gösterisi gibidir.
- **Kenara değince sek bloğunu döngü dışında bırakmak.** Karakter bir kez sekmeyi dener, sonra kenarda kalır.
- **İkinci sprite'ın kod alanını boş bırakmak.** Yalnız kodu olan sprite hareket eder.

### Hafta sonu tekrarı
1. Kavram kartlarını oku, "sık yapılan yanlış" satırlarını yüksek sesle söyle.
2. Yanlış yaptığın mini test sorularını açıklamalarıyla birlikte yeniden çöz.
3. Bekleme süresi 0,5 olursa saniyede kaç değişim olur? Sonra 0,1 için hesapla.
4. Karakterin 5 kere zıplayıp sonra "Bitti!" demesini sıfırdan yaz.
5. Kendi cümlelerinle cevapla: "Sonsuza kadar ne zaman, tekrarla ne zaman kullanılır?"

Hafta sonu testi olarak iki dersin mini testleri yeterlidir; toplam 10 soru. Hedef: her dersten en az 3 doğru.

### Proje değerlendirme ölçütü (Canlı karakter)
| Ölçüt | Gelişmeli | Yeterli | İleri |
|---|---|---|---|
| Animasyon | Karakter kıpırdamıyor ya da hız göz seçemeyecek kadar fazla | Kostüm değişimi ve hareket gözle izlenebiliyor | Hız bilerek seçilmiş ve nedeni anlatılıyor |
| Döngü | Hareket blokları döngünün dışında | Bloklar döngünün içinde, doğru döngü seçilmiş | Hem sayılı hem sonsuz döngüyü yerinde kullanıyor |
| Sprite sayısı | Tek sprite | İki sprite aynı anda canlanıyor | İki sprite farklı hız ve yönde, kenardan seker |
| Anlatım | Ne yaptığını anlatamıyor | Programı adım adım anlatıyor | Başka bir hız denemesinin sonucunu karşılaştırıyor |

### Veli ve öğretmen notu
- **Amaç.** Çocuk döngünün "aynı işi tekrar tekrar yapmak" demek olduğunu ve iki sprite'ın aynı anda çalıştığını görsün.
- **Nasıl destek olunur?** "Bloklar döngünün içinde mi dışında mı?" ve "Bekleme süresini değiştirirsek ne olur, tahmin et?" diye sor.
- **Gözlem.** Karakter kıpırdamıyorsa önce başlık bloğuna bağlı olup olmadığına bakın.
- **İlerleme.** Mini test sonuçları "İlerlemem" sayfasında beceri bazında görünür (taslak özellik; yalnız onay verildiyse kaydedilir).`,
  lessons: [
    {
      explainerMd: `### Bu derste öğreneceklerin
- Kostüm değiştirerek animasyon yapmayı
- **sonraki kostüm** bloğunun nasıl çalıştığını
- Bekleme süresinin hızı nasıl değiştirdiğini
- Karakter kıpırdamıyorsa nedenini bulmayı

### Önceden bilmen gerekenler
Ders 2: sprite ve kostüm farkı, yeşil bayrak başlığı.

### Animasyon nedir?
Çizgi filmde karakter aslında yürümez. Biraz farklı resimler art arda hızla gösterilir ve göz bunu hareket sanır. Sahne Atölyesi'nde bu resimler sprite'ın **kostümleridir**. Kedinin iki kostümü var; ikisi adımın iki hâlini gösterir.

### Sonraki kostüm
**sonraki kostüm** bloğu sprite'ın kostümünü bir sonrakine geçirir. Son kostümdeyse başa döner. Kedinin 2 kostümü olduğu için sıra şöyle gider: 1, 2, 1, 2, 1... Yani bu blok üç kez çalışırsa kedi 2. kostümde kalır.

### Bekle ile hızı ayarla
Bekle bloğu olmadan değişim saniyede yaklaşık 30 kez olur; göz seçemez. **bekle** ile hız senin elinde. Saniyede kaç değişim olduğunu bulmak için 1'i bekleme süresine böl:
- 0,2 saniye bekleme: 1 ÷ 0,2 = saniyede 5 değişim
- 0,1 saniye bekleme: 1 ÷ 0,1 = saniyede 10 değişim
- 1 saniye bekleme: saniyede 1 değişim (slayt gösterisi gibi)

Sahne saniyede 30 kez çizilir. Bu yüzden 0,05 gibi çok kısa sürelerde hesap tam tutmaz; 0,1 ve üstü için tutar.

Örnek program:
${kod('yeşil bayrak tıklanınca', '  10 kere tekrarla', '    sonraki kostüm', '    0.2 saniye bekle')}
Burada 10 tur var ve her tur 0,2 saniye sürer. Program 10 × 0,2 = 2 saniye çalışır.

### Hata ayıklama
Karakter hiç kıpırdamıyorsa önce bloklar bayrağa gerçekten tutturulmuş mu diye bak. Çok hızlı titriyorsa araya bekle ekle.

### Özet
Animasyon, kostümlerin art arda gösterilmesidir. **sonraki kostüm** son kostümden sonra başa döner. Bekleme süresi ne kadar kısaysa animasyon o kadar hızlı olur; saniyedeki değişim sayısı 1 bölü bekleme süresidir.`,
      concepts: [
        { term: 'Animasyon', definition: 'Biraz farklı resimlerin hızla art arda gösterilip hareket gibi görünmesi.', example: 'Kedinin iki kostümünü hızlıca değiştirince kedi yürüyor gibi görünür.', pitfall: 'Tek kostümle animasyon beklemek; en az iki farklı kostüm gerekir.' },
        { term: 'sonraki kostüm', definition: 'Sprite\'ı bir sonraki kostüme geçirir; son kostümden sonra başa döner.', example: '2 kostümlü kedide üç kez çalışınca kedi 2. kostümde kalır.', pitfall: 'Son kostümden sonra hata vereceğini sanmak; sıra başa döner.' },
        { term: 'bekle', definition: 'Programı verilen saniye kadar durdurur.', example: '"0.2 saniye bekle" ile kostümler saniyede 5 kez değişir.', pitfall: 'Bekle koymayı unutmak: animasyon göz seçemeyecek kadar hızlı olur.' },
        { term: 'Hız hesabı', definition: 'Saniyedeki değişim sayısı = 1 ÷ bekleme süresi.', example: '0,1 saniye beklemede 1 ÷ 0,1 = 10 değişim olur.', pitfall: 'Süreyi küçültünce animasyonun yavaşlayacağını sanmak; süre azalınca hız artar.' },
        { term: 'Kare', definition: 'Animasyonun tek bir resmi; burada sprite\'ın bir kostümü.', example: 'Yürüyen kedinin iki karesi vardır.', pitfall: 'Karenin sayısını artırmadan akıcılık beklemek; kostüm az olunca hareket sert görünür.' },
      ],
      quiz: [
        { id: 'm2h2d1-q1', kind: 'mcq', prompt: 'Animasyon nasıl yapılır?', options: ['Sprite\'ı büyütüp küçülterek', 'Biraz farklı resimleri hızla art arda göstererek', 'Arka planı silerek', 'Sesi sürekli çalarak'], answer: 1, explanation: 'Animasyon, birbirine benzeyen ama biraz farklı resimlerin hızla art arda gösterilmesidir. Sahne Atölyesi\'nde bu resimler kostümlerdir.', skills: ['sh-costume'] },
        { id: 'm2h2d1-q2', kind: 'predict-output', prompt: `Kedinin 2 kostümü var ve 1. kostümle başlıyor. Program bitince kedi hangi kostümde olur?\n\n${kod('yeşil bayrak tıklanınca', '  sonraki kostüm', '  sonraki kostüm', '  sonraki kostüm')}`, options: ['1. kostüm', '3. kostüm', '2. kostüm', 'Program hata verir'], answer: 2, explanation: 'Kostüm sırası 1, 2, 1, 2 diye döner. Üç değişimden sonra 2. kostümde kalır. Üçüncü kostüm yoktur; son kostümden sonra başa dönülür, hata olmaz.', skills: ['sh-costume', 'sh-program'] },
        { id: 'm2h2d1-q3', kind: 'numeric', prompt: `Bu program kaç saniye sürer?\n\n${kod('yeşil bayrak tıklanınca', '  12 kere tekrarla', '    sonraki kostüm', '    0.1 saniye bekle')}`, answer: 1.2, tolerance: 0, unit: 'saniye', explanation: 'Her tur 0,1 saniye bekler. 12 tur: 12 × 0,1 = 1,2 saniye. Kostüm değiştirmek zaman almaz; süreyi bekleme bloğu belirler.', skills: ['sh-wait', 'sh-loop'] },
        { id: 'm2h2d1-q4', kind: 'numeric', prompt: 'Her tur sonunda 0,1 saniye bekleyen bir animasyonda kostüm bir saniyede kaç kez değişir?', answer: 10, tolerance: 0, unit: 'kez', explanation: 'Saniyedeki değişim sayısı 1 ÷ bekleme süresidir: 1 ÷ 0,1 = 10. Bekleme süresi kısaldıkça animasyon hızlanır.', skills: ['sh-wait', 'sh-costume'] },
        { id: 'm2h2d1-q5', kind: 'find-bug', prompt: `Efe kedinin yürüyüşünü izlemek istiyor ama kedi sadece titriyor gibi görünüyor:\n\n${kod('yeşil bayrak tıklanınca', '  10 kere tekrarla', '    sonraki kostüm')}\n\nSorun nedir?`, options: ['Her kostümden sonra bekle yok; değişim göz seçemeyecek kadar hızlı', 'Tekrar sayısı çok az', 'Kedinin kostümü yok', 'Yeşil bayrak bloğu eksik'], answer: 0, explanation: 'Bekle bloğu olmadığı için kostümler saniyede yaklaşık 30 kez değişir ve göz hareketi ayırt edemez. Döngüye 0,1-0,2 saniyelik bir bekleme eklemek sorunu çözer.', skills: ['sh-debug', 'sh-wait'] },
      ],
    },
    {
      explainerMd: `### Bu derste öğreneceklerin
- **sonsuza kadar** ve **N kere tekrarla** farkını
- Blokları döngünün içine ve dışına koymanın sonucunu
- **kenara değince sek** ile hareketi sınırlamayı
- İki sprite'ın aynı anda çalışmasını

### Önceden bilmen gerekenler
Ders 1 ve 3: tekrarla bloğu, **sonraki kostüm** ve **bekle**.

### Döngü ne işe yarar?
Karakterin sürekli yürümesi için 100 blok sürüklemek zorunda değilsin. **Döngü**, içindeki blokları tekrar tekrar çalıştırır. İki çeşidi var:
- **N kere tekrarla** sayılı çalışır ve biter.
- **sonsuza kadar** program durdurulana kadar çalışır.

### Döngünün içi ve dışı
Bloğun döngünün içinde mi dışında mı olduğu çok önemlidir. İçindekiler her turda, dışındakiler yalnız bir kez çalışır.
${kod('yeşil bayrak tıklanınca', '  x: -100 y: 0 konumuna git', '  8 kere tekrarla', '    15 adım git')}
Gitme komutu 8 kez çalışır: 8 × 15 = 120 adım. Kedi x = −100 + 120 = 20 noktasında durur. İlk komut döngü dışında olduğu için yalnız bir kez çalışmıştır.

### Kenara değince sek
Karakter sahnenin kenarına gelince durup kalmasın istersen:
${kod('yeşil bayrak tıklanınca', '  sonsuza kadar', '    10 adım git', '    kenara değince sek', '    sonraki kostüm', '    0.1 saniye bekle')}
**kenara değince sek** bloğu karakteri kenara çarpınca ters yöne çevirir. Böylece kedi sahnede sürekli gidip gelir.

### Aynı anda çalışmak
Kedi ve köpek ikisi de yeşil bayrakla başlıyorsa aynı anda çalışır. Buna **paralel** çalışma denir. Her sprite kendi kod alanında kendi döngüsünü döndürür.

### Özet
Döngü blokları tekrar tekrar çalıştırır. Sayılı iş için tekrarla, bitmeyen iş için sonsuza kadar kullanılır. Döngünün içindeki bloklar her turda çalışır. Kenara değince sek karakteri sahnede tutar. Her sprite'ın kendi kodu aynı anda çalışabilir.`,
      concepts: [
        { term: 'Döngü', definition: 'İçindeki blokları tekrar tekrar çalıştıran blok.', example: 'Kedinin kostüm değiştirip yürümesini bir döngü içine koyarsın.', pitfall: 'Aynı bloğu elle çoğaltmak; döngü hem kısa hem düzeltmesi kolaydır.' },
        { term: 'sonsuza kadar', definition: 'İçindekileri program durana kadar tekrar eden döngü.', example: 'Sürekli yürüyen karakter için "sonsuza kadar" kullanılır.', pitfall: 'Altına başka blok eklemeye çalışmak: sonsuz döngüden sonrası hiç çalışmaz.' },
        { term: 'N kere tekrarla', definition: 'İçindekileri verilen sayıda çalıştırıp biten döngü.', example: '"8 kere tekrarla: 15 adım git" toplam 120 adım yürütür.', pitfall: 'İçindeki sayıyla tur sayısını karıştırmak: 8 kere tekrarla ve 15 adım ayrı sayılardır.' },
        { term: 'Döngünün içi ve dışı', definition: 'İçindeki bloklar her turda, dışındakiler yalnız bir kez çalışır.', example: 'Başlangıç konumuna git bloğunu döngünün dışına koyarsın.', pitfall: 'Yürüme bloğunu döngü dışında bırakıp karakterin bir adım atıp durmasına şaşırmak.' },
        { term: 'kenara değince sek', definition: 'Sprite sahnenin kenarına değerse yönünü ters çevirir.', example: 'Kedi sağ kenara gelince geri döner.', pitfall: 'Bu bloğu döngü dışına koymak; yalnız bir kez denenir ve karakter kenarda kalır.' },
        { term: 'Paralel çalışma', definition: 'Birden çok sprite\'ın kodunun aynı anda çalışması.', example: 'Kedi ve köpek aynı bayrakla başlayıp aynı anda yürür.', pitfall: 'İkinci sprite\'ın kod alanını boş bırakıp onun da hareket etmesini beklemek.' },
      ],
      quiz: [
        { id: 'm2h2d2-q1', kind: 'mcq', prompt: 'Karakterin sahnede hiç durmadan yürümesini istiyorsun. Hangi blok uygundur?', options: ['5 kere tekrarla', '1 saniye bekle', 'kenara değince sek tek başına', 'sonsuza kadar'], answer: 3, explanation: 'Hiç bitmeyen iş için sonsuza kadar kullanılır. 5 kere tekrarla beş turdan sonra durur. Bekle yalnız durdurur. Kenara değince sek tek başına döngü olmadığı için bir kez çalışır.', skills: ['sh-loop'] },
        { id: 'm2h2d2-q2', kind: 'numeric', prompt: `Kedinin son x değeri kaç olur?\n\n${kod('yeşil bayrak tıklanınca', '  x: -100 y: 0 konumuna git', '  8 kere tekrarla', '    15 adım git')}`, answer: 20, tolerance: 0, unit: 'x', explanation: 'Kedi önce x = -100 noktasına gider. 15 adım 8 kez yürütülür: 8 × 15 = 120. -100 + 120 = 20. Kedi sağa baktığı için x artar.', skills: ['sh-loop', 'sh-coords'] },
        { id: 'm2h2d2-q3', kind: 'predict-output', prompt: `Kedi sahnenin ortasından sağa doğru başlıyor. Bayrağa basılınca uzun süre sonra ne görürsün?\n\n${kod('yeşil bayrak tıklanınca', '  sonsuza kadar', '    10 adım git', '    kenara değince sek', '    0.05 saniye bekle')}`, options: ['Kedi sağ kenarda durur', 'Kedi sağ kenara çarpıp geri döner ve sürekli gidip gelir', 'Kedi sahneden çıkıp kaybolur', 'Kedi 10 adım gidip durur'], answer: 1, explanation: 'Sonsuza kadar döngüsü adım atmayı sürekli tekrarlar. Kenara değince sek kediyi kenarda ters yöne çevirir, kedi sol kenara gidip yine döner. Bu yüzden sürekli gidip gelir. Kenar bloğu olmasaydı kedi sağ kenarda dururdu.', skills: ['sh-loop', 'sh-coords'] },
        { id: 'm2h2d2-q4', kind: 'find-bug', prompt: `Zeynep kedinin sürekli yürümesini istiyor ama kedi bir adım atıp duruyor:\n\n${kod('yeşil bayrak tıklanınca', '  10 adım git', '  sonraki kostüm', '  sonsuza kadar', '    0.2 saniye bekle')}\n\nSorun nedir?`, options: ['Bekleme süresi çok kısa', 'Sonsuza kadar yerine tekrarla gerekir', 'Adım ve kostüm blokları sonsuza kadar döngüsünün dışında; yalnız bir kez çalışıyor', 'Başlık bloğu yanlış'], answer: 2, explanation: 'Döngünün içindeki bloklar her turda çalışır, dışındakiler bir kez. Adım ve kostüm blokları döngünün dışında kaldığı için yalnız ilk seferde çalışır; döngü ise sadece bekler. İkisini de sonsuza kadar bloğunun içine sürüklemek gerekir.', skills: ['sh-debug', 'sh-loop'] },
        { id: 'm2h2d2-q5', kind: 'mcq', prompt: 'Kedinin ve köpeğin ikisinde de yeşil bayrak başlığı var. Bayrağa basınca ne olur?', options: ['İkisi aynı anda çalışır', 'Önce kedi çalışır, kedi bitince köpek', 'Yalnız ilk eklenen sprite çalışır', 'Bayrak ikisinden birini seçer'], answer: 0, explanation: 'Her sprite\'ın kendi kodu vardır ve yeşil bayrak hepsini aynı anda başlatır. Buna paralel çalışma denir.', skills: ['sh-parallel'] },
      ],
    },
  ],
}

export const hafta3: WeekExtras = {
  guideMd: `### Hafta hedefleri
Bu haftanın sonunda öğrenci:
1. **Olay** kavramını açıklayabilir; yeşil bayrak, tuşa basma ve sprite'a tıklamanın birer olay olduğunu söyleyebilir.
2. **tuşuna basılınca** ve **bu sprite tıklanınca** başlıklarıyla etkileşimli bir program kurabilir.
3. **sesi çal** ile **sesi bitene dek çal** farkını bilir; ardışık notalarla melodi yapabilir.
4. Ses seviyesinin 0 ile 100 arasında kaldığını bilir ve değişimi hesaplayabilir.
5. Çalgıyı önce plan yapıp sonra kurar, bir arkadaşına çaldırıp geri bildirim alır.

### Haftanın planı
| Gün | Ders | Süre | Ne yapılır |
|---|---|---|---|
| 1 | Tuşa bas, ses çıksın | ~30 dk | a, s, d, f tuşlarına ses bağla, rengi değiştir, sprite'a tıklayınca ses çalsın. |
| 2 | Kendi çalgım | ~35 dk | Dört tuşlu çalgıyı kur, görsel tepki ekle, kayıt düğmesiyle melodi çaldır. |
| 3 | Hafta projesi: Kendi çalgım | ~25 dk | Çalgını geliştir ve bir arkadaşına çaldırıp takıldığı yerleri not et. |

### Ön koşul kontrolü
- Öğrenci yeşil bayrağın bir olay (başlık) olduğunu hatırlıyor mu? (Hafta 1)
- Sprite'ın kendi kodu olduğunu biliyor mu? Çalgıda her düğme ayrı sprite olabilir.
- Ses ve sesi çalan bloğu bulabiliyor mu? (Ses sekmesi, Ses kategorisi)

### Kavram haritası
- **Olay:** yeşil bayrak → tuşa basılınca → sprite tıklanınca
- **Ses:** sesi çal (hemen devam eder) → sesi bitene dek çal (bekler) → ses seviyesi (0-100)
- **Görsel tepki:** renk efekti, boyut → eski haline döndürme
- **Tasarım:** plan → kurma → deneme → düzeltme

### Sık yapılan hatalar
- **Yanlış başlık seçmek.** Sprite'a tıklayınca ses istenirken yeşil bayrak başlığı koymak.
- **Notaları sesi çal ile art arda dizmek.** Hepsi aynı anda çalar; sırayla çalmak için bitene dek çal ya da bekle gerekir.
- **Büyütülen düğmeyi küçültmemek.** Düğme basınca büyür ama hep büyük kalır.
- **Aynı tuşu iki yere bağlamak.** Hangisinin çalışacağı karışır.
- **Ses seviyesi hesabında 100 sınırını unutmak.** Seviye 100'den fazla olmaz.

### Hafta sonu tekrarı
1. Kavram kartlarına bak ve "sık yapılan yanlış" satırlarını söyle.
2. Yanlış yaptığın mini test sorularını açıklamalarıyla yeniden çöz.
3. Üç notalık bir melodiyi önce "sesi çal" sonra "bitene dek çal" ile yap; farkı dinle.
4. Çalgına ses seviyesini azaltan ve artıran iki tuş ekle.
5. Kendi cümlelerinle cevapla: "Yeşil bayrak ile tuşa basma arasındaki fark nedir?"

Hafta sonu testi olarak iki dersin mini testleri yeterlidir; toplam 9 soru. Hedef: her dersten en az 3 doğru.

### Proje değerlendirme ölçütü (Kendi çalgım)
| Ölçüt | Gelişmeli | Yeterli | İleri |
|---|---|---|---|
| Tuşlar | 4'ten az tuş çalışıyor | 4 tuş, her biri farklı ses | 6 ya da daha fazla tuş, düzenli yerleşim |
| Görsel tepki | Tuşa basınca görsel değişiklik yok | Büyüme, renk ya da kostüm değişimi var | Tepki sonra eski haline dönüyor |
| Melodi | Yok | Kayıt düğmesi 3 nota çalıyor | Melodi doğru sırada, notalar arası bekleme ayarlı |
| Test | Kimseye çaldırmadı | Bir arkadaşa çaldırıp not aldı | Notlara göre bir şeyi düzeltti ve anlattı |

### Veli ve öğretmen notu
- **Amaç.** Çocuk programın bir şeyin olmasını beklediğini (olay) ve notaların sırayla çalması için zamanlamanın gerektiğini fark etsin.
- **Nasıl destek olunur?** "Hangi olay bu sesi başlatıyor?" ve "Sesler aynı anda mı, sırayla mı çalıyor?" diye sor.
- **Tüm sesler sanaldır.** Ses sekmesindeki hazır seslerle çalışılır; kayıt ya da dışarıdan ses yükleme yoktur.
- **İlerleme.** Mini test sonuçları "İlerlemem" sayfasında beceri bazında görünür (taslak özellik; yalnız onay verildiyse kaydedilir).`,
  lessons: [
    {
      explainerMd: `### Bu derste öğreneceklerin
- **Olay** kavramını
- Tuşa basınca ve sprite'a tıklayınca program başlatmayı
- Ses çalmayı ve rengi değiştirmeyi
- Çalışmayan bir olayı bulmayı

### Önceden bilmen gerekenler
Ders 2: bir program başlık bloğuyla başlar; yeşil bayrak bir başlıktır.

### Olay nedir?
Piyano tuşuna basınca ses çıkar; basmazsan çıkmaz. Bilgisayarda da program bazen bir şeyin **olmasını bekler**. Bu şeye **olay** denir. Yeşil bayrağa tıklamak bir olaydır. Klavyede bir tuşa basmak da bir olaydır. Fareyle sprite'a tıklamak da.

### Olay başlıkları
Her olayın kendi başlık bloğu vardır ve Olaylar kategorisinde bulunur:
- **yeşil bayrak tıklanınca**
- **a tuşuna basılınca** (tuşu listeden seçersin)
- **bu sprite tıklanınca**

Başlığın altındaki bloklar yalnız o olay olunca çalışır.
${kod('a tuşuna basılınca', '  Do sesini çal', '  renk efektini 30 değiştir', '', 's tuşuna basılınca', '  Re sesini çal', '  renk efektini 30 değiştir')}
Burada a tuşuna basınca Do çalar ve renk değişir; s tuşuna basınca Re çalar. Hiçbir tuşa basılmazsa hiçbiri çalışmaz. Bağlı olmayan bir tuş da (örneğin d) sessiz kalır.

### Ses ve renk
**Do sesini çal** gibi bir blok sprite'ın ses listesinden bir ses çalar. Sesi önce Sesler sekmesinden sprite'a eklemelisin. Rengi değiştirmek için Görünüm kategorisindeki **renk efektini değiştir** bloğunu kullanırsın. Ses ve görüntü birlikte olunca çalgı canlı görünür.

### Doğru olayı seçmek
Bir şey çalışmıyorsa önce doğru olayı seçip seçmediğine bak. Kediye tıklayınca ses çalsın istiyorsan başlık **bu sprite tıklanınca** olmalıdır. Yeşil bayrak başlığı altına koyarsan ses bayrakta çalar, tıklamada çalmaz.

### Özet
Olay, programın beklediği bir şeydir: bayrak, tuş ya da tıklama. Her olayın bir başlık bloğu vardır ve altındaki bloklar yalnız o olay olunca çalışır. Ses çalmak ve rengi değiştirmek için ilgili blokları başlığa bağlarsın. Çalışmayan bir olayda önce doğru başlığı seçtiğinden emin ol.`,
      concepts: [
        { term: 'Olay', definition: 'Programın beklediği ve gerçekleşince kod çalıştıran şey: bayrağa tıklamak, tuşa basmak, sprite\'a tıklamak.', example: 'a tuşuna basmak bir olaydır; bağlı olan Do sesi o zaman çalar.', pitfall: 'Olayı gerçekleştirmeden (tuşa basmadan) programın çalışmasını beklemek.' },
        { term: 'tuşuna basılınca', definition: 'Seçilen tuşa basıldığında altındaki blokları çalıştıran başlık.', example: '"s tuşuna basılınca" altına Re sesini koyarsan s tuşu Re çalar.', pitfall: 'Tuşu seçmeyi unutmak ya da iki başlıkta aynı tuşu kullanmak.' },
        { term: 'bu sprite tıklanınca', definition: 'Sprite\'ın üstüne fareyle tıklanınca çalışan başlık.', example: 'Kediye tıklayınca miyav sesi çalsın diye bu başlığı kullanırsın.', pitfall: 'Sprite tıklaması için yeşil bayrak başlığı koymak; tıklamayla başlamaz.' },
        { term: 'sesi çal', definition: 'Seçilen sesi çalar ve programı beklemeden sonraki bloğa geçer.', example: '"Miyav sesini çal" kedi miyavlatır.', pitfall: 'Sesi sprite\'a eklemeden çalmayı denemek; ses listede olmalıdır.' },
        { term: 'Renk efekti', definition: 'Sprite\'ın rengini değiştiren görünüm efekti.', example: '"renk efektini 30 değiştir" her tuşta kediyi başka renge çevirir.', pitfall: 'Efekt değerini çok küçük yapıp rengin değiştiğini fark etmemek.' },
      ],
      quiz: [
        { id: 'm2h3d1-q1', kind: 'mcq', prompt: 'Yeşil bayrak başlığı ile "a tuşuna basılınca" başlığı arasındaki fark nedir?', options: ['Fark yok, ikisi de aynı anda çalışır', 'Yeşil bayrak yalnız ses çalar', 'Tuş başlığı yalnız bir kez kullanılabilir', 'Biri yeşil bayrağa basınca, öbürü a tuşuna basılınca başlar'], answer: 3, explanation: 'Her başlık kendi olayını bekler. Yeşil bayrak başlığı bayrağa basılınca, tuş başlığı o tuşa basılınca çalışır. Tuş başlığı istediğin kadar farklı tuş için kullanılabilir.', skills: ['sh-events'] },
        { id: 'm2h3d1-q2', kind: 'predict-output', prompt: `Kedinin kodu şu:\n\n${kod('a tuşuna basılınca', '  Do sesini çal', '', 's tuşuna basılınca', '  Re sesini çal')}\n\nOyuncu sırayla a, d, s tuşlarına basarsa hangi sesler çalar?`, options: ['Do, Mi, Re', 'Do, Re', 'Yalnız Do', 'Hiçbir ses çalmaz'], answer: 1, explanation: 'a tuşu Do\'yu, s tuşu Re\'yi çalar. d tuşu için başlık yazılmadığı için hiçbir şey olmaz. Sesler basış sırasına göre çalar: Do, sonra Re.', skills: ['sh-events', 'sh-sound'] },
        { id: 'm2h3d1-q3', kind: 'find-bug', prompt: `Ali kediye tıklayınca miyavlamasını istiyor ama tıklayınca ses gelmiyor:\n\n${kod('yeşil bayrak tıklanınca', '  Miyav sesini çal')}\n\nSorun nedir?`, options: ['Miyav sesi kediye eklenmemiş olmalı', 'Ses seviyesi çok düşük', 'Başlık yanlış: tıklama için "bu sprite tıklanınca" gerekir', 'Kedi çok küçük'], answer: 2, explanation: 'Yeşil bayrak başlığı sesi bayrağa basınca çalar; kediye tıklamak ayrı bir olaydır. "bu sprite tıklanınca" başlığı gerekir. Ses seviyesi ya da ses listesi sorunu olsaydı bayrakta da ses gelmezdi.', skills: ['sh-debug', 'sh-events'] },
        { id: 'm2h3d1-q4', kind: 'numeric', prompt: `Çalgıda a, s, d, f tuşlarının her biri tek bir ses çalıyor. Oyuncu sırayla a, s, d, f, a, a tuşlarına basıyor. Toplam kaç ses çalar?`, answer: 6, tolerance: 0, unit: 'ses', explanation: 'Her tuş basışı bir ses çaldırır. Altı basış altı ses eder; aynı tuşa tekrar basmak yine yeni bir olaydır ve ses tekrar çalar.', skills: ['sh-events', 'sh-sound'] },
      ],
    },
    {
      explainerMd: `### Bu derste öğreneceklerin
- Çalgı projesini önce planlamayı
- **sesi çal** ile **sesi bitene dek çal** farkını
- Tuşa basınca görsel tepki vermeyi ve eski haline döndürmeyi
- Ses seviyesini 0-100 aralığında hesaplamayı

### Önceden bilmen gerekenler
Ders 5: olaylar, tuş başlığı ve sesi çal bloğu.

### Önce plan
Çalgı yapmadan önce kâğıda resmini çiz: kaç tuş var, her biri hangi sesi çalacak, hangi klavye tuşuna bağlı? Plan, bloklara geçince "şimdi ne yapacağım" diye düşünmeni önler.

### Melodi için zamanlama
Bir melodi, notaların **sırayla** çalmasıdır. Ama **sesi çal** bloğu sesi başlatır ve hemen bir sonraki bloğa geçer. Şu program üç sesi aynı anda başlatır:
${kod('bu sprite tıklanınca', '  Do sesini çal', '  Mi sesini çal', '  Sol sesini çal')}
Sırayla çalması için ya **sesi bitene dek çal** kullanırsın, ya da her notadan sonra **bekle** koyarsın:
${kod('bu sprite tıklanınca', '  Do sesini çal', '  0.5 saniye bekle', '  Mi sesini çal', '  0.5 saniye bekle', '  Sol sesini çal', '  1 saniye bekle')}
Bu melodi 0,5 + 0,5 + 1 = 2 saniye sürer.

### Görsel tepki
Düğme basınca büyüyüp sonra küçülürse çalgı canlı görünür:
${kod('a tuşuna basılınca', '  Do sesini çal', '  boyutu % 130 yap', '  0.1 saniye bekle', '  boyutu % 100 yap')}
Eski boyuta dönmezsen düğme sonsuza kadar büyük kalır.

### Ses seviyesi
Her sprite'ın ses seviyesi 0 ile 100 arasındadır. Seviye 100 iken artırmaya çalışırsan 100'de kalır. Bu yüzden 100'den başlayıp +20, −20, −20 yapınca sonuç 60 olur, 80 değil.

### Özet
Çalgı yapmadan önce planla. Notaları sırayla çaldırmak için bitene dek çal ya da bekle kullan. Görsel tepki verdikten sonra eski hale dön. Ses seviyesi 0 ile 100 arasında sınırlıdır.`,
      concepts: [
        { term: 'sesi çal ve sesi bitene dek çal', definition: 'Çal bloğu sesi başlatıp hemen devam eder; bitene dek çal sesin sonunu bekler.', example: 'Üç notayı art arda çalmak için "bitene dek çal" kullanırsın.', pitfall: 'Notaları yalnız "sesi çal" ile dizip sırayla çalmasını beklemek; hepsi aynı anda başlar.' },
        { term: 'Melodi', definition: 'Notaların belli bir sırayla ve belli sürelerle çalınması.', example: 'Do, bekle, Mi, bekle, Sol dizisi basit bir melodidir.', pitfall: 'Notalar arasına bekleme koymamak: sesler birbirine karışır.' },
        { term: 'Görsel geri bildirim', definition: 'Oyuncunun bastığında ekranda görünen tepki: büyüme, renk ya da kostüm değişimi.', example: 'Düğme çalınca %130 büyüyüp eski boyuta döner.', pitfall: 'Tepkiyi eski haline döndürmeyi unutup düğmeyi hep büyük bırakmak.' },
        { term: 'Ses seviyesi', definition: 'Sprite\'ın sesinin gücü; 0 ile 100 arasındadır.', example: '"ses seviyesini -20 değiştir" sesi kısar.', pitfall: '100\'ün üstüne çıkabileceğini sanmak; seviye 100\'de sınırlanır.' },
        { term: 'Plan', definition: 'Projeyi yapmadan önce kâğıda yazılan ya da çizilen taslak.', example: 'Çalgının tuşlarını, seslerini ve hangi klavye tuşuna bağlı olduklarını önceden çizmek.', pitfall: 'Plansız başlayıp ilk bloktan sonra ne yapacağını bilememek.' },
      ],
      quiz: [
        { id: 'm2h3d2-q1', kind: 'mcq', prompt: 'Üç notayı sırayla (biri bitince öbürü) çaldırmak için hangisini kullanırsın?', options: ['Her sese "sesi bitene dek çal" kullanarak', 'Üç tane "sesi çal" bloğunu art arda dizerek', 'Üç sprite eklenerek', 'Ses seviyesini azaltarak'], answer: 0, explanation: '"Sesi bitene dek çal" sesin sonunu bekler, sonra sıradaki bloğa geçer. Ardışık "sesi çal" blokları sesleri aynı anda başlatır.', skills: ['sh-sound', 'sh-wait'] },
        { id: 'm2h3d2-q2', kind: 'predict-output', prompt: `Bu program çalışınca ne olur?\n\n${kod('bu sprite tıklanınca', '  Do sesini çal', '  Mi sesini çal', '  Sol sesini çal')}`, options: ['Üç ses sırayla çalar', 'Yalnız Do çalar', 'Yalnız Sol çalar', 'Üç ses aynı anda başlar'], answer: 3, explanation: '"Sesi çal" sesi başlatıp beklemeden devam eder. Bu yüzden üç blok neredeyse aynı anda çalışır ve üç ses üst üste başlar. Sırayla çalması için "bitene dek çal" ya da "bekle" gerekir.', skills: ['sh-sound'] },
        { id: 'm2h3d2-q3', kind: 'numeric', prompt: `Bu melodi kaç saniye sürer?\n\n${kod('bu sprite tıklanınca', '  3 kere tekrarla', '    Do sesini çal', '    0.4 saniye bekle', '  1 saniye bekle')}`, answer: 2.2, tolerance: 0, unit: 'saniye', explanation: 'Tekrarla bloğu 3 tur döner ve her turda 0,4 saniye bekler: 3 × 0,4 = 1,2. Döngüden sonra 1 saniye daha beklenir: 1,2 + 1 = 2,2. Sesin çalması zaman almaz; süreyi yalnız bekle blokları belirler.', skills: ['sh-wait', 'sh-loop'] },
        { id: 'm2h3d2-q4', kind: 'find-bug', prompt: `Lale düğmenin basınca bir an büyüyüp küçülmesini istiyor ama düğme hep büyük kalıyor:\n\n${kod('a tuşuna basılınca', '  Do sesini çal', '  boyutu % 130 yap')}\n\nSorun nedir?`, options: ['Boyut yüzdesi çok büyük', 'Düğmeyi eski boyuta (% 100) döndüren blok yok', 'Ses ile boyut aynı başlıkta olamaz', 'Tuş başlığı yanlış'], answer: 1, explanation: 'Boyutu 130 yaptıktan sonra yeniden 100 yapan blok olmadığı için düğme büyük kalır. Araya kısa bir bekleme koyup ardından "boyutu % 100 yap" eklemek gerekir.', skills: ['sh-debug', 'sh-events'] },
        { id: 'm2h3d2-q5', kind: 'numeric', prompt: `Bir sprite'ın ses seviyesi başta 100. Sırayla bu üç blok çalışıyor: "ses seviyesini 20 değiştir", "ses seviyesini -20 değiştir", "ses seviyesini -20 değiştir". Sonunda ses seviyesi kaç olur?`, answer: 60, tolerance: 0, unit: 'seviye', explanation: 'Ses seviyesi 100\'den fazla olamaz: ilk blok 100\'ü 120 yapmaz, 100\'de bırakır. Sonra -20 ile 80, yine -20 ile 60 olur. Sınırı unutup toplasaydın 80 bulurdun.', skills: ['sh-sound'] },
      ],
    },
  ],
}

export const hafta4: WeekExtras = {
  guideMd: `### Hafta hedefleri
Bu haftanın sonunda öğrenci:
1. **de ... saniye** bloğunun süreli konuşma olduğunu ve süresiz **de** bloğunun balonu bırakmadığını bilir.
2. İki karakterin konuşmasını bekleme sürelerini hesaplayarak üst üste bindirmeden sıralayabilir.
3. **mesajını yayınla** ve **mesajını alınca** bloklarıyla karakterleri birbirine bağlayabilir.
4. Mesaj gelince **sonraki arka plan** ile sahne değiştirebilir.
5. Beklemeyle zamanlamanın neden kırılgan, mesajla çalışmanın neden sağlam olduğunu açıklayabilir.

### Haftanın planı
| Gün | Ders | Süre | Ne yapılır |
|---|---|---|---|
| 1 | Konuşma ve zamanlama | ~30 dk | İki karakter, üç satır konuşma; bekleme sürelerini hesapla, çakışmayı gör ve düzelt. |
| 2 | Yayın ve sahne değişimi | ~35 dk | Beklemeleri mesajla değiştir, mesaj gelince arka planı değiştir, 3 sahnelik hikâye kur. |
| 3 | Hafta projesi: İki karakterli hikâye | ~30 dk | Hikâyenin başı, olayı ve sonu olsun; bir arkadaşına anlat. |

### Ön koşul kontrolü
- Öğrenci iki sprite'ın aynı anda çalıştığını hatırlıyor mu? (Hafta 2)
- Olay başlıklarını kullanabiliyor mu? (Hafta 3)
- Saniye toplamak ve çıkarmak (2 + 2 = 4) konusunda rahat mı?

### Kavram haritası
- **Konuşma:** de (süresiz) → de ... saniye (süreli) → balon ne zaman kapanır
- **Zamanlama:** bekle → süre toplamı → çakışma
- **Mesajlaşma:** yayınla → alınca → sıra
- **Sahne:** arka plan → sonraki arka plan → hikâye bölümleri

### Sık yapılan hatalar
- **İkinci karakterin beklemesini kısa tutmak.** Cümleler üst üste biner.
- **Yanlış mesajı beklemek.** Yayınlanan mesajla alınan mesajın adı aynı olmalıdır.
- **Beklemeyi mesajla birlikte bırakmak.** İkisini birlikte kullanınca hikâye uzar ve süreler kayar.
- **Arka plan sayısını yanlış hesaplamak.** Son arka plandan sonra sıra başa döner.
- **Süresiz "de" kullanıp balonu silmemek.** Balon yeni bir "de" gelene kadar kalır.

### Hafta sonu tekrarı
1. Kavram kartlarını oku, "sık yapılan yanlış" satırlarını yüksek sesle söyle.
2. Yanlış yaptığın soruların açıklamalarını oku, soruyu yeniden çöz.
3. Üç satırlık bir diyaloğu önce bekle blokları, sonra mesajla yaz. Hangisi kolay değişir?
4. Hikâyenin ikinci karakterine ek bir cümle ekle; kod kaç yerde değişiyor?
5. Kendi cümlelerinle cevapla: "Beklemeyle mi mesajla mı çalışmak daha güvenli?"

Hafta sonu testi olarak iki dersin mini testleri yeterlidir; toplam 9 soru. Hedef: her dersten en az 3 doğru.

### Proje değerlendirme ölçütü (İki karakterli hikâye)
| Ölçüt | Gelişmeli | Yeterli | İleri |
|---|---|---|---|
| Konuşma | Cümleler üst üste biniyor | Üç satır, sırayla konuşuyorlar | Cümleler hikâyeye anlam katıyor, uzunluğa göre ayarlı |
| Mesaj | Mesaj yok, yalnız bekleme | En az bir mesajla sıra veriliyor | Mesajlar tüm hikâyeyi yönetiyor, bekleme yok |
| Sahneler | Tek arka plan | En az 3 sahne (arka plan) | Sahne geçişleri hikâyenin bölümleriyle uyumlu |
| Anlatım | Hikâyeyi anlatamıyor | Başı, olayı ve sonu anlatıyor | Hatalı zamanlamayı nasıl düzelttiğini gösteriyor |

### Veli ve öğretmen notu
- **Amaç.** Çocuk bilgisayarın zamanı "bekle" ile saydığını ve mesajla karakterlerin birbirine haber verebildiğini görsün.
- **Nasıl destek olunur?** "İkinci karakter ne zaman başlıyor?" ve "Birinci cümle uzarsa ne olur?" diye sor.
- **Çift çalışma (isteğe bağlı).** Her biri bir karakteri yazsın, mesajla birleştirsinler. Kimin neyi yazdığını proje notuna yazsınlar.
- **İlerleme.** Mini test sonuçları "İlerlemem" sayfasında beceri bazında görünür (taslak özellik; yalnız onay verildiyse kaydedilir).`,
  lessons: [
    {
      explainerMd: `### Bu derste öğreneceklerin
- Süreli ve süresiz konuşma bloklarını
- İki karakterin aynı anda başlayınca ne olduğunu
- Bekleme sürelerini hesaplayarak diyalog kurmayı
- Üst üste binen konuşmayı düzeltmeyi

### Önceden bilmen gerekenler
Ders 3: **bekle** bloğu süre sayar. Ders 4: iki sprite aynı anda çalışır.

### Konuşma blokları
Görünüm kategorisinde iki çeşit var:
- **Merhaba! de 2 saniye**: balon 2 saniye görünür, sonra kaybolur ve program devam eder.
- **Merhaba! de**: balon başka bir söz gelene ya da program bitene kadar ekranda kalır.

### Aynı anda başlarsan
Kedi ve köpek ikisi de yeşil bayrakla başlıyorsa aynı anda konuşmaya başlarlar.
${kod('Kedi: yeşil bayrak tıklanınca', '  Merhaba! de 2 saniye', '', 'Köpek: yeşil bayrak tıklanınca', '  Selam! de 2 saniye')}
İki balon da 0. saniyede çıkar ve üst üste biner. Sırayla konuşmaları için ikinci karakter beklemelidir.

### Bekleme süresini hesapla
İkinci karakterin bekleme süresi, birincinin konuşma süresine eşit ya da biraz fazla olmalıdır. Doğal bir boşluk istersen yarım saniye ekle:
- Kedi 3 saniye konuşur.
- Köpek en az 3 saniye beklemeli.
- 0,5 saniyelik sessizlik için 3 + 0,5 = 3,5 saniye bekler.

Üç satırlık bir diyaloğu şöyle kurabilirsin:
${kod('Kedi: yeşil bayrak tıklanınca', '  Merhaba! de 2 saniye', '  2 saniye bekle', '  Nasılsın? de 2 saniye', '', 'Köpek: yeşil bayrak tıklanınca', '  2 saniye bekle', '  İyiyim! de 2 saniye')}
Kedinin ilk sözü 0-2 saniye, köpeğin sözü 2-4 saniye sürer. Kedi 2 saniye bekleyip 4. saniyede ikinci cümlesini söyler.

### Kırılganlık
Süreleri elle hesaplamak işe yarar ama bir cümleyi uzatınca bütün süreleri yeniden hesaplamak gerekir. Bir sonraki derste bunun daha iyi bir yolunu göreceksin.

### Özet
Süreli konuşma balonu kapatır, süresiz konuşma balonu bırakır. İki karakter aynı anda başlarsa konuşmalar çakışır. Çakışmayı önlemek için ikinci karakter, birincinin konuşma süresi kadar (ve isteğe bağlı bir boşluk) bekler.`,
      concepts: [
        { term: 'de ... saniye', definition: 'Karakterin söylediği sözü balonda verilen süre kadar gösterip kaldıran blok.', example: '"Merhaba! de 2 saniye" balonu 2 saniye gösterir, sonra program devam eder.', pitfall: 'Süreyi unutup süresiz "de" kullanmak; balon ekranda kalır.' },
        { term: 'de (süresiz)', definition: 'Balonu başka bir söz gelene ya da program bitene kadar ekranda bırakan blok.', example: '"Oyun bitti" yazısını ekranda tutmak için süresiz "de" kullanılır.', pitfall: 'Süresiz balonun kendiliğinden kaybolacağını sanmak.' },
        { term: 'Eşzamanlı başlama', definition: 'Aynı olayla başlayan iki kodun aynı anda çalışması.', example: 'Kedi ve köpek yeşil bayrakla birlikte konuşmaya başlar.', pitfall: 'İki karakterin sırayla konuşacağını sanıp hiç bekleme koymamak.' },
        { term: 'Zamanlama hesabı', definition: 'İkinci karakterin bekleme süresi = birincinin konuşma süresi + istenen boşluk.', example: 'Kedi 3 saniye konuşuyor, 0,5 boşluk için köpek 3,5 saniye bekler.', pitfall: 'Bekleme süresini konuşma süresinden kısa yapmak; cümleler çakışır.' },
        { term: 'Üst üste binme', definition: 'İki konuşma balonunun aynı anda ekranda olması.', example: 'Köpek 2 saniye beklerken kedi 3 saniye konuşursa 1 saniye çakışırlar.', pitfall: 'Çakışmayı yalnız gözle denemek; sürelerin toplamını hesaplamak daha güvenilirdir.' },
      ],
      quiz: [
        { id: 'm2h4d1-q1', kind: 'predict-output', prompt: `Kedi ve köpeğin kodu şu. Bayrağa basınca ne olur?\n\n${kod('Kedi: yeşil bayrak tıklanınca', '  Merhaba! de 2 saniye', '', 'Köpek: yeşil bayrak tıklanınca', '  Selam! de 2 saniye')}`, options: ['Kedi önce konuşur, sonra köpek', 'Köpek önce konuşur, sonra kedi', 'İkisi aynı anda konuşur, balonlar üst üste biner', 'Hiçbiri konuşmaz'], answer: 2, explanation: 'İkisi de aynı yeşil bayrak olayıyla başlar ve ikisinde de bekle yoktur. Bu yüzden iki konuşma aynı anda başlar ve 2 saniye boyunca üst üste durur.', skills: ['sh-wait', 'sh-program'] },
        { id: 'm2h4d1-q2', kind: 'numeric', prompt: 'Kedi 3 saniye konuşuyor. Köpek, kedi bittikten tam yarım saniye sonra konuşmaya başlasın istiyor. Köpek kaç saniye beklemeli?', answer: 3.5, tolerance: 0, unit: 'saniye', explanation: 'Köpeğin bekleme süresi kedinin konuşma süresi artı istenen boşluktur: 3 + 0,5 = 3,5 saniye. 3 saniye beklese kedi biter bitmez konuşurdu, boşluk olmazdı.', skills: ['sh-wait'] },
        { id: 'm2h4d1-q3', kind: 'numeric', prompt: `Bu diyalogda kedi ikinci cümlesini kaçıncı saniyede söylemeye başlar?\n\n${kod('Kedi: yeşil bayrak tıklanınca', '  Merhaba! de 2 saniye', '  2 saniye bekle', '  Nasılsın? de 2 saniye', '', 'Köpek: yeşil bayrak tıklanınca', '  2 saniye bekle', '  İyiyim! de 2 saniye')}`, answer: 4, tolerance: 0, unit: 'saniye', explanation: 'Kedi önce 2 saniye konuşur, sonra 2 saniye bekler. 2 + 2 = 4. İkinci cümle 4. saniyede başlar. Bu arada köpek 2-4 saniye arasında konuşur.', skills: ['sh-wait'] },
        { id: 'm2h4d1-q4', kind: 'find-bug', prompt: `Kedi 3 saniye konuşuyor, köpek de yanıt veriyor. Ama balonlar 1 saniye üst üste biniyor:\n\n${kod('Kedi: yeşil bayrak tıklanınca', '  Nasılsın? de 3 saniye', '', 'Köpek: yeşil bayrak tıklanınca', '  2 saniye bekle', '  İyiyim! de 2 saniye')}\n\nSorun nedir?`, options: ['Köpeğin bekleme süresi (2) kedinin konuşma süresinden (3) kısa', 'Köpeğin konuşma süresi çok uzun', 'Kedi yanlış kostümde', 'Köpeğin başlık bloğu eksik'], answer: 0, explanation: 'Kedi 3 saniye konuşuyor ama köpek yalnız 2 saniye bekliyor; araya 1 saniye çakışma giriyor. Bekleme süresini 3 saniye ya da biraz fazlası yapmak gerekir.', skills: ['sh-debug', 'sh-wait'] },
        { id: 'm2h4d1-q5', kind: 'mcq', prompt: 'Süresiz "Merhaba! de" bloğu çalıştıktan sonra balon ne zaman kaybolur?', options: ['1 saniye sonra kendiliğinden', 'Hemen, blok çalışır çalışmaz', 'Sprite hareket edince', 'Başka bir "de" bloğu gelene ya da program bitene kadar kalır'], answer: 3, explanation: 'Süresiz "de" balonu bırakır; balon yeni bir söz gelene ya da program durana kadar ekranda kalır. Kendiliğinden kaybolması için "de ... saniye" bloğunu kullanmak gerekir.', skills: ['sh-wait', 'sh-program'] },
      ],
    },
    {
      explainerMd: `### Bu derste öğreneceklerin
- Mesaj yayınlamayı ve mesajı almayı
- Beklemenin neden kırılgan, mesajın neden sağlam olduğunu
- Mesaj gelince arka planı değiştirmeyi
- Karakterlerin birbirine nasıl haber verdiğini

### Önceden bilmen gerekenler
Ders 7: konuşma süreleri ve bekleme hesabı. Ders 5: olay başlıkları.

### Mesaj nedir?
Kedi sözünü bitirdiğinde köpeğe "sıra sende" diyebilse süreleri hesaplamana gerek kalmazdı. İşte bunu **mesaj** yapar. Bir karakter mesaj **yayınlar**, mesajı alınca başlığı olan karakterler harekete geçer.
${kod('Kedi: yeşil bayrak tıklanınca', '  Merhaba! de 2 saniye', '  "sıra1" mesajını yayınla', '', 'Köpek: "sıra1" mesajını alınca', '  Selam! de 1 saniye')}
Köpek, kedinin sözü bitip mesaj yayınlandığında 2. saniyede konuşur. Kedinin cümlesini uzatsan köpek yine tam zamanında konuşur, çünkü mesaj sözün bitmesinden sonra yayınlanır.

### Beklemeyle farkı
Bekleme sürelerini senin hesaplaman gerekir. Bir cümleyi uzatırsan hepsini yeniden hesaplarsın. Mesajda ise sıra, işin gerçekten bittiği anda gelir. Bu daha **sağlam** bir yöntemdir.

### Mesaj adı aynı olmalı
Yayınlanan mesajın adı ile alınan mesajın adı aynı olmalıdır. Kedi "sıra1" yayınlıyor, köpek "sıra2" bekliyorsa köpek hiç konuşmaz.

### Sahne değiştirmek
Hikâyenin bölümleri için birkaç arka plan ekleyebilirsin. Mesaj gelince **sonraki arka plan** bloğu sahneyi değiştirir. Son arka plandan sonra sıra başa döner. Örneğin 3 arka planın olsun ve ilkiyle başla. "sıra" mesajı 5 kez gelirse arka plan sırası 1, 2, 3, 1, 2, 3 diye döner ve sonunda 3. arka plana gelirsin.

### Özet
Mesaj, karakterlerin birbirine haber vermesini sağlar. Yayınlayan ve alan mesajın adı aynı olmalıdır. Mesajla çalışmak bekleme sürelerini hesaplamaktan daha sağlamdır. Sonraki arka plan bloğu mesaj gelince sahneyi değiştirir ve son arka plandan sonra başa döner.`,
      concepts: [
        { term: 'Mesaj', definition: 'Karakterler arasında haber vermeye yarayan, adı olan işaret.', example: 'Kedi sözünü bitirince "sıra1" mesajını yayınlar.', pitfall: 'Mesajı bir söz ya da ses sanmak; mesaj yalnız bir haber işaretidir, ekranda görünmez.' },
        { term: 'mesajını yayınla', definition: 'Seçilen mesajı gönderir; o mesajı bekleyen tüm başlıklar çalışır.', example: '"sıra1 mesajını yayınla" köpeğin konuşmasını başlatır.', pitfall: 'Mesajı yayınlayıp onu alacak bir başlık koymamak; hiçbir şey olmaz.' },
        { term: 'mesajını alınca', definition: 'Adı eşleşen mesaj yayınlanınca altındaki blokları çalıştıran başlık.', example: 'Köpek "sıra1 mesajını alınca" konuşur.', pitfall: 'Yanlış mesaj adını seçmek; köpek yayınlanmayan "sıra2"yi bekler ve hiç çalışmaz.' },
        { term: 'Sağlam program', definition: 'Süreler değişse bile bozulmayan program.', example: 'Mesajla çalışan hikâye cümle uzasa da sırayı korur.', pitfall: 'Süreleri elle hesaplayıp bir cümle değişince hikâyeyi bozmak.' },
        { term: 'sonraki arka plan', definition: 'Sahnenin arka planını sıradakine geçirir; sonuncudan sonra başa döner.', example: '3 arka planlı hikâyede 5 kez çalışınca 3. arka plan görünür.', pitfall: 'Son arka plandan sonra durup kalacağını sanmak; sıra başa döner.' },
      ],
      quiz: [
        { id: 'm2h4d2-q1', kind: 'mcq', prompt: 'İki karakterin sırayla konuşması için neden mesaj, bekleme sürelerinden daha sağlamdır?', options: ['Mesaj daha hızlı çalışır', 'Konuşma uzayıp kısalsa da sıra, söz bittiğinde gelir; süreleri yeniden hesaplamak gerekmez', 'Bekleme blokları hiç çalışmaz', 'Mesaj ses çalar'], answer: 1, explanation: 'Mesaj söz bittikten sonra yayınlanır; konuşma uzun ya da kısa olsa da sıra doğru zamanda gelir. Bekleme sürelerinde ise cümle değişince tüm süreleri tekrar hesaplamak gerekir.', skills: ['sh-msg', 'sh-wait'] },
        { id: 'm2h4d2-q2', kind: 'predict-output', prompt: `Kodlar şöyle. Köpek ne zaman konuşur?\n\n${kod('Kedi: yeşil bayrak tıklanınca', '  Hazır mısın? de 2 saniye', '  "başla" mesajını yayınla', '', 'Köpek: "başla" mesajını alınca', '  Hazırım! de 1 saniye')}`, options: ['Bayrağa basılır basılmaz', 'Hiçbir zaman konuşmaz', 'Kedi sözünü bitirip mesajı yayınlayınca, yani 2. saniyede', 'Mesajdan 2 saniye sonra'], answer: 2, explanation: 'Kedi önce 2 saniye konuşur, sonra "başla" mesajını yayınlar. Köpek mesajı alınca konuşur; bu da 2. saniyedir. Mesaj sıra gelince ateşlendiği için ek bekleme yoktur.', skills: ['sh-msg', 'sh-events'] },
        { id: 'm2h4d2-q3', kind: 'find-bug', prompt: `Burak'ın hikâyesinde köpek hiç konuşmuyor:\n\n${kod('Kedi: yeşil bayrak tıklanınca', '  Merhaba! de 2 saniye', '  "sıra1" mesajını yayınla', '', 'Köpek: "sıra2" mesajını alınca', '  Selam! de 2 saniye')}\n\nSorun nedir?`, options: ['Kedi "sıra1" yayınlıyor ama köpek "sıra2" bekliyor; mesaj adları farklı', 'Köpeğin balonu çok kısa', 'Köpeğe yeşil bayrak başlığı gerekir', 'Mesajlar yalnız bir kez kullanılabilir'], answer: 0, explanation: 'Yayınlanan ve alınan mesajın adı aynı olmalı. Kedi "sıra1" yayınlıyor ama köpek hiç yayınlanmayan "sıra2"yi bekliyor. Köpeğin başlığındaki mesajı "sıra1" yapmak sorunu çözer.', skills: ['sh-debug', 'sh-msg'] },
        { id: 'm2h4d2-q4', kind: 'numeric', prompt: `Hikâyede 3 arka plan var ve başta 1. arka plan görünüyor. Sahne betiği "sıra" mesajı gelince "sonraki arka plan" bloğunu çalıştırıyor. "sıra" mesajı 5 kez yayınlanınca kaçıncı arka plan görünür?`, answer: 3, tolerance: 0, unit: '. arka plan', explanation: 'Her mesajda sıra bir ilerler: 2, 3, 1, 2, 3. Beşinci mesajdan sonra 3. arka plan görünür. Son arka plandan sonra sıra başa döndüğü için 6\'ya ya da 5\'e gitmez.', skills: ['sh-msg', 'sh-loop'] },
      ],
    },
  ],
}
