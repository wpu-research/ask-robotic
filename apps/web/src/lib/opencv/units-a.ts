// OpenCV dersi üniteleri 1–6: dizi olarak görüntü ve renk uzayları, nokta işlemleri ve histogram, eşikleme, evrişim ve
// filtreler, kenarlar, morfoloji. HTML iki dilde aynı etiket dizisinde.
import type { KursUnit } from '@/lib/kurs/types'
import type { CvToolId } from './tools'
import { channelsPy, convPy, edgesPy, filterPy, morphPy, pointPy, thresholdPy } from './code'

export const UNITS_A: KursUnit<CvToolId>[] = [
  {
    n: 1, tools: ['channels'],
    tr: {
      title: 'Görüntü bir sayı dizisidir: pikseller, kanallar, renk uzayları',
      summary: 'Yükseklik × genişlik × kanal; uint8, BGR sırası, gri dönüşüm ve HSV. Dilimleme ve bölge (ROI).',
      goals: ['Bir görüntünün NumPy dizisi olarak şeklini, veri tipini ve eksen sırasını (satır, sütun) söylemek', 'OpenCV\'nin BGR sırasını ve bunun yol açtığı hataları tanımak', 'Gri dönüşüm formülünü ve HSV\'nin neden renk işlerinde kullanıldığını açıklamak', 'Dilimleme ile bir bölgeyi (ROI) okumak ve değiştirmek'],
      notes: `<p>Bilgisayar için fotoğraf, ışık şiddetlerinden oluşan bir tablodur. OpenCV Python\'da bu tablo bir <b>NumPy dizisidir</b>: renkli görüntünün şekli <code>(yükseklik, genişlik, 3)</code>, veri tipi çoğunlukla <code>uint8</code>, yani her değer 0–255 arasında bir tam sayı. 640×480 bir kare 921 600 sayı demektir.</p>
<h3>Satır önce, sütun sonra</h3>
<p><code>img[y, x]</code> önce satırı (dikey konum), sonra sütunu alır; çizim fonksiyonları ise noktayı <code>(x, y)</code> diye ister. Bu ikilik en sık yapılan hatadır. Dilim (<code>img[50:100, 20:80]</code>) bir <b>görünümdür</b>: kopyalamaz, değiştirirsen asıl görüntü de değişir. Bağımsız kopya için <code>.copy()</code>.</p>
<h3>BGR, gri ve HSV</h3>
<p>OpenCV renkleri tarihsel nedenle <b>B, G, R</b> sırasında tutar; matplotlib ve tarayıcı R, G, B bekler. Gri dönüşüm gözün yeşile daha duyarlı olmasını hesaba katar:</p>
<div class="eq">gri = 0,299·R + 0,587·G + 0,114·B</div>
<p><b>HSV</b> rengi ton (H), doygunluk (S) ve parlaklık (V) olarak ayırır. OpenCV\'de H 0–179 aralığındadır (derecenin yarısı, uint8\'e sığsın diye). Gölge düşünce B, G, R birlikte azalır ama H neredeyse aynı kalır: renkle nesne ayırmayı (8. ünite) bu kolaylaştırır.</p>`,
      code: [channelsPy('tr')],
      lab: 'Renkli şekiller sahnesinde kırmızı üçgenin üstüne gel: R yüksek, B ve G düşük mü? Kanalı "B" yap: mavi kare neden beyaz, kırmızı üçgen neden siyah görünüyor? Sonra "H" kanalına geç ve meyve tabağı sahnesini aç: gölgeli sağ yarıda V düşerken H\'nin aynı kaldığını üç meyvede ölç.',
      pitfalls: ['img[x, y] yazmak: NumPy önce satırı (y) ister; dikdörtgen görüntülerde yanlış piksel ya da IndexError çıkar.', 'BGR görüntüyü matplotlib\'le göstermek: kırmızı ile mavi yer değiştirir. cv2.cvtColor(img, cv2.COLOR_BGR2RGB) gerekir.', 'uint8 aritmetiğinde taşmayı unutmak: NumPy\'da 250 + 10 = 4 olur; cv2.add doyurur (255).', 'HSV ton aralığını 0–360 sanmak: OpenCV\'de 0–179; kırmızı iki uçta (0 civarı ve 179 civarı) durur.'],
      se: `<p>Görüntü işleme kodunda en pahalı hatalar sessiz olanlardır: yanlış kanal sırası programı çökertmez, yalnız yanlış sonuç verir. Bunu önlemenin yolu <b>sözleşme</b> yazmaktır.</p>
<ul><li>Her fonksiyonun başında girdiyi doğrula: <code>assert img.ndim == 3 and img.dtype == np.uint8</code>.</li><li>Renk sırasını adla taşı (<code>bgr</code>, <code>rgb</code>, <code>gray</code> değişken adları ya da küçük bir veri sınıfı).</li><li>Bilinen bir pikselin değerini sınayan küçük birim testleri yaz: "saf kırmızı (0, 0, 255) BGR, HSV\'de H = 0 verir".</li></ul>`,
      quiz: [
        { q: '480 satır, 640 sütunlu renkli bir görüntünün NumPy şekli nedir?', options: ['(640, 480, 3)', '(480, 640, 3)', '(3, 480, 640)', '(480, 640)'], answer: 1, why: 'OpenCV ve NumPy önce satır sayısını (yükseklik), sonra sütun sayısını (genişlik), en son kanal sayısını verir.' },
        { q: 'cv2.imread ile okunan bir pikselde değerler [0, 0, 255]. Bu piksel hangi renktir?', options: ['Mavi', 'Yeşil', 'Kırmızı', 'Siyah'], answer: 2, why: 'OpenCV BGR sırası kullanır: B = 0, G = 0, R = 255, yani saf kırmızı.' },
        { q: 'Gölge düşen bir nesnede HSV\'nin hangi bileşeni en az değişir?', options: ['H (ton)', 'V (parlaklık)', 'B kanalı', 'Gri değer'], answer: 0, why: 'Işık azalınca üç kanal yaklaşık aynı oranda düşer; oranlar, dolayısıyla ton büyük ölçüde korunur.' },
        { q: 'roi = img[10:50, 10:50]; roi[:] = 0 çalıştırıldıktan sonra ne olur?', options: ['Yalnız roi değişir', 'Hata verir', 'img\'nin o bölgesi de siyah olur', 'img tümüyle siyah olur'], answer: 2, why: 'NumPy dilimi bir görünümdür, aynı belleği paylaşır. Bağımsız değiştirmek için roi = img[10:50, 10:50].copy() gerekir.' },
      ],
    },
    en: {
      title: 'An image is an array of numbers: pixels, channels, colour spaces',
      summary: 'Height × width × channels; uint8, BGR order, gray conversion and HSV. Slicing and regions of interest (ROI).',
      goals: ['State the shape, data type and axis order (row, column) of an image as a NumPy array', 'Recognise OpenCV\'s BGR order and the bugs it causes', 'Explain the gray conversion formula and why HSV is used for colour work', 'Read and modify a region (ROI) with slicing'],
      notes: `<p>To a computer a photo is a table of light intensities. In OpenCV Python that table is a <b>NumPy array</b>: a colour image has shape <code>(height, width, 3)</code> and usually type <code>uint8</code>, so every value is an integer from 0 to 255. One 640×480 frame is 921,600 numbers.</p>
<h3>Row first, column second</h3>
<p><code>img[y, x]</code> takes the row (vertical position) first and the column second, while drawing functions want a point as <code>(x, y)</code>. This mismatch is the most common mistake. A slice (<code>img[50:100, 20:80]</code>) is a <b>view</b>: it does not copy, so changing it changes the original. Use <code>.copy()</code> for an independent copy.</p>
<h3>BGR, gray and HSV</h3>
<p>For historical reasons OpenCV stores colours in <b>B, G, R</b> order; matplotlib and the browser expect R, G, B. The gray conversion accounts for the eye being more sensitive to green:</p>
<div class="eq">gray = 0.299·R + 0.587·G + 0.114·B</div>
<p><b>HSV</b> separates colour into hue (H), saturation (S) and value (V). In OpenCV H runs from 0 to 179 (half the degrees, so it fits in uint8). When a shadow falls, B, G and R drop together but H stays almost the same: that is what makes separating objects by colour (unit 8) easy.</p>`,
      code: [channelsPy('en')],
      lab: 'In the coloured shapes scene move over the red triangle: is R high and B and G low? Switch the channel to "B": why is the blue square white and the red triangle black? Then switch to "H" and open the fruit plate: measure on three fruits that in the shaded right half V drops while H stays the same.',
      pitfalls: ['Writing img[x, y]: NumPy wants the row (y) first; on non-square images you get the wrong pixel or an IndexError.', 'Showing a BGR image with matplotlib: red and blue swap. You need cv2.cvtColor(img, cv2.COLOR_BGR2RGB).', 'Forgetting overflow in uint8 arithmetic: in NumPy 250 + 10 = 4; cv2.add saturates (255).', 'Assuming hue runs 0–360: in OpenCV it is 0–179; red sits at both ends (near 0 and near 179).'],
      se: `<p>The most expensive bugs in image code are the silent ones: a wrong channel order does not crash the program, it just gives the wrong answer. The way to prevent that is to write <b>contracts</b>.</p>
<ul><li>Validate inputs at the top of each function: <code>assert img.ndim == 3 and img.dtype == np.uint8</code>.</li><li>Carry the colour order in names (<code>bgr</code>, <code>rgb</code>, <code>gray</code> variable names or a small data class).</li><li>Write small unit tests on known pixels: "pure red (0, 0, 255) in BGR gives H = 0 in HSV".</li></ul>`,
      quiz: [
        { q: 'What is the NumPy shape of a colour image with 480 rows and 640 columns?', options: ['(640, 480, 3)', '(480, 640, 3)', '(3, 480, 640)', '(480, 640)'], answer: 1, why: 'OpenCV and NumPy give the number of rows (height) first, then columns (width), then channels.' },
        { q: 'A pixel read with cv2.imread has values [0, 0, 255]. What colour is it?', options: ['Blue', 'Green', 'Red', 'Black'], answer: 2, why: 'OpenCV uses BGR order: B = 0, G = 0, R = 255, so pure red.' },
        { q: 'On an object in shadow, which HSV component changes least?', options: ['H (hue)', 'V (value)', 'The B channel', 'The gray value'], answer: 0, why: 'When light drops the three channels fall in roughly the same proportion; the ratios, and so the hue, are largely preserved.' },
        { q: 'What happens after roi = img[10:50, 10:50]; roi[:] = 0?', options: ['Only roi changes', 'It raises an error', 'That region of img turns black too', 'All of img turns black'], answer: 2, why: 'A NumPy slice is a view sharing the same memory. To change it independently use roi = img[10:50, 10:50].copy().' },
      ],
    },
  },
  {
    n: 2, tools: ['point'],
    tr: {
      title: 'Nokta işlemleri ve histogram: parlaklık, karşıtlık, gama, eşitleme',
      summary: 'g = α·f + β, gama düzeltmesi, bakış tablosu (LUT), histogram, eşitleme ve CLAHE.',
      goals: ['Parlaklık, karşıtlık ve gamayı bir piksel dönüşümü olarak yazmak', 'Histogramdan bir görüntünün karanlık, aydınlık ya da düşük karşıtlıklı olduğunu okumak', 'Histogram eşitlemenin birikimli dağılımla nasıl çalıştığını açıklamak', 'Global eşitleme ile CLAHE arasında seçim yapmak'],
      notes: `<p><b>Nokta işlemi</b>, her pikselin yeni değerinin yalnız kendi eski değerine bağlı olduğu dönüşümdür. Komşulara bakılmaz; bu yüzden 256 girişlik bir <b>bakış tablosu (LUT)</b> ile çok hızlı yapılır.</p>
<div class="eq">g(x, y) = doyur(α · f(x, y) + β) &nbsp;&nbsp; gama: g = 255 · (f / 255)<sup>γ</sup></div>
<p>α karşıtlığı (eğim), β parlaklığı (kaydırma) belirler. Sonuç 0–255 dışına çıkarsa <b>doyurulur</b> (kırpılır): bilgi kaybolur. Gama doğrusal değildir: γ &lt; 1 koyu tonları açar, açıkları az değiştirir. Kameralar ve ekranlar zaten gama ile çalışır.</p>
<h3>Histogram</h3>
<p>Histogram her gri değerden kaç piksel olduğunu sayar. Sola yığılmış histogram karanlık, sağa yığılmış aydınlık, dar bir tepe düşük karşıtlıklı görüntü demektir. Histogram konumu söylemez: iki çok farklı görüntünün histogramı aynı olabilir.</p>
<h3>Eşitleme</h3>
<p><b>Histogram eşitleme</b>, birikimli dağılımı (CDF) dönüşüm olarak kullanır: <i>g = 255 · (CDF(f) − CDF<sub>min</sub>) / (N − CDF<sub>min</sub>)</i>. Sık görülen değerler arasına daha çok aralık açılır, dar histogram yayılır. Gürültüyü de büyütür. <b>CLAHE</b> görüntüyü karolara bölüp her karoda sınırlandırılmış eşitleme yapar; yerel ayrıntı için daha iyidir.</p>`,
      code: [pointPy('tr')],
      lab: 'Loş sahneyi aç: histogram nerede yığılmış? Önce yalnız α ve β ile şekilleri seçilir yap, sonra sıfırla ve yalnız gama ile dene. Son olarak eşitlemeyi aç: önce/sonra histogramlarını karşılaştır ve sağ alttaki standart sapma değerinin kaç kat arttığını yaz. α = 3 yapınca açık şekillerde ne kayboldu?',
      pitfalls: ['NumPy ile img * 1.5 yapıp uint8\'e çevirmek: 255\'i aşan değerler sarar. cv2.convertScaleAbs ya da np.clip kullan.', 'Eşitlemeyi renkli görüntünün üç kanalına ayrı ayrı uygulamak: renk dengesi bozulur. Parlaklık kanalında (YCrCb\'de Y, LAB\'de L) eşitle.', 'Histogram aynıysa görüntülerin benzer olduğunu sanmak: histogram uzamsal bilgi taşımaz.', 'Her probleme eşitleme uygulamak: zaten iyi pozlanmış görüntüde gürültüyü büyütür; ölçüm yapacaksan karşılaştırılabilirliği bozar.'],
      se: `<p>Bakış tablosu klasik bir <b>ön hesaplama</b> örneğidir: pahalı bir fonksiyonu (üs alma) 256 kez hesapla, milyonlarca kez oku. Bu desen gömülü ve gerçek zamanlı yazılımda her yerdedir.</p>
<ul><li>LUT\'u saf bir fonksiyonla üret ve test et: monotonluk, uç değerler (0 → 0, 255 → 255 γ için).</li><li>Parametreleri (α, β, γ) koda gömme, yapılandırmaya taşı; sahadaki kamera değişince yeniden derlemek gerekmesin.</li></ul>`,
      quiz: [
        { q: 'g = 2·f + 10 dönüşümünde f = 130 olan bir pikselin uint8 sonucu nedir (doyurmalı)?', options: ['270', '14', '255', '130'], answer: 2, why: '2·130 + 10 = 270, 255\'i aşar; doyurmalı aritmetikte 255 olur. NumPy\'nin sarmalı uint8 aritmetiği 14 verirdi.' },
        { q: 'Histogramın tamamı 20–70 arasında olan bir görüntü için en doğru tarif hangisi?', options: ['Aşırı pozlanmış', 'Karanlık ve düşük karşıtlıklı', 'Yüksek karşıtlıklı', 'Renkli'], answer: 1, why: 'Değerler karanlık uçta ve dar bir aralıkta toplanmış: hem karanlık hem düşük karşıtlıklı.' },
        { q: 'γ = 0,5 olan gama dönüşümü (g = 255·(f/255)^γ) ne yapar?', options: ['Koyu tonları açar', 'Görüntüyü karartır', 'Yalnız açık tonları açar', 'Hiçbir şey değiştirmez'], answer: 0, why: '0–1 arasındaki bir sayının 0,5. kuvveti kendisinden büyüktür; küçük (koyu) değerler en çok artar.' },
        { q: 'CLAHE\'nin global eşitlemeye göre üstünlüğü nedir?', options: ['Daha hızlıdır', 'Renkleri korur', 'Karolar halinde ve kırpma sınırıyla çalışır: yerel ayrıntıyı açar, gürültüyü daha az büyütür', 'Histogramı değiştirmez'], answer: 2, why: 'Contrast Limited Adaptive Histogram Equalization: her karoda ayrı eşitler ve histogramı bir sınırda kırparak aşırı güçlendirmeyi önler.' },
      ],
    },
    en: {
      title: 'Point operations and histograms: brightness, contrast, gamma, equalisation',
      summary: 'g = α·f + β, gamma correction, look-up tables (LUT), histograms, equalisation and CLAHE.',
      goals: ['Write brightness, contrast and gamma as a pixel transform', 'Read from a histogram whether an image is dark, bright or low-contrast', 'Explain how histogram equalisation works through the cumulative distribution', 'Choose between global equalisation and CLAHE'],
      notes: `<p>A <b>point operation</b> is a transform where each pixel\'s new value depends only on its own old value. Neighbours are not consulted, so it is done very fast with a 256-entry <b>look-up table (LUT)</b>.</p>
<div class="eq">g(x, y) = saturate(α · f(x, y) + β) &nbsp;&nbsp; gamma: g = 255 · (f / 255)<sup>γ</sup></div>
<p>α sets the contrast (slope) and β the brightness (offset). If the result leaves 0–255 it is <b>saturated</b> (clipped): information is lost. Gamma is non-linear: γ &lt; 1 lifts dark tones and barely changes bright ones. Cameras and screens already work with gamma.</p>
<h3>Histogram</h3>
<p>A histogram counts how many pixels have each gray value. A histogram piled to the left means a dark image, to the right a bright one, a narrow peak a low-contrast one. A histogram says nothing about position: two very different images can have the same histogram.</p>
<h3>Equalisation</h3>
<p><b>Histogram equalisation</b> uses the cumulative distribution (CDF) as the transform: <i>g = 255 · (CDF(f) − CDF<sub>min</sub>) / (N − CDF<sub>min</sub>)</i>. Frequent values get more room between them and a narrow histogram spreads out. It amplifies noise too. <b>CLAHE</b> splits the image into tiles and equalises each with a limit; it is better for local detail.</p>`,
      code: [pointPy('en')],
      lab: 'Open the dim scene: where is the histogram piled up? First make the shapes readable using only α and β, then reset and try only gamma. Finally turn on equalisation: compare the before/after histograms and write down how many times the standard deviation (bottom right) grew. With α = 3, what was lost on the bright shapes?',
      pitfalls: ['Doing img * 1.5 in NumPy and casting to uint8: values above 255 wrap around. Use cv2.convertScaleAbs or np.clip.', 'Equalising the three channels of a colour image separately: the colour balance breaks. Equalise a brightness channel (Y in YCrCb, L in LAB).', 'Thinking images are similar because their histograms match: histograms carry no spatial information.', 'Equalising everything: on a well-exposed image it amplifies noise; if you are measuring, it destroys comparability.'],
      se: `<p>A look-up table is a classic example of <b>precomputation</b>: compute an expensive function (a power) 256 times, read it millions of times. The pattern is everywhere in embedded and real-time software.</p>
<ul><li>Build the LUT with a pure function and test it: monotonicity, end points (0 → 0, 255 → 255 for γ).</li><li>Do not hard-code parameters (α, β, γ); put them in configuration so a camera change in the field does not need a rebuild.</li></ul>`,
      quiz: [
        { q: 'With g = 2·f + 10, what is the uint8 result for a pixel with f = 130 (saturating)?', options: ['270', '14', '255', '130'], answer: 2, why: '2·130 + 10 = 270, above 255; saturating arithmetic gives 255. NumPy\'s wrapping uint8 arithmetic would give 14.' },
        { q: 'An image\'s whole histogram lies between 20 and 70. Which description fits best?', options: ['Overexposed', 'Dark and low-contrast', 'High-contrast', 'Colourful'], answer: 1, why: 'Values gather at the dark end in a narrow range: both dark and low-contrast.' },
        { q: 'What does gamma with γ = 0.5 (g = 255·(f/255)^γ) do?', options: ['Lifts dark tones', 'Darkens the image', 'Brightens only bright tones', 'Changes nothing'], answer: 0, why: 'The 0.5th power of a number between 0 and 1 is larger than itself; small (dark) values grow most.' },
        { q: 'What is CLAHE\'s advantage over global equalisation?', options: ['It is faster', 'It preserves colours', 'It works in tiles with a clip limit: it brings out local detail and amplifies noise less', 'It does not change the histogram'], answer: 2, why: 'Contrast Limited Adaptive Histogram Equalization equalises each tile separately and clips the histogram at a limit to avoid over-amplification.' },
      ],
    },
  },
  {
    n: 3, tools: ['threshold'],
    tr: {
      title: 'Eşikleme: sabit eşik, Otsu ve uyarlamalı eşik',
      summary: 'Griden ikiliye: elle eşik, Otsu\'nun sınıflar arası varyansı, düzensiz ışıkta uyarlamalı eşik.',
      goals: ['Sabit eşiklemeyi ve ters eşiklemeyi uygulamak', 'Otsu yönteminin hangi büyüklüğü en büyük yaptığını açıklamak', 'Düzensiz aydınlatmada uyarlamalı eşiğin neden kazandığını göstermek', 'Blok boyu ve C parametresini sonuca bakarak ayarlamak'],
      notes: `<p>Eşikleme, gri bir görüntüyü <b>ikili</b> (siyah-beyaz) maskeye çevirir: piksel eşikten büyükse 255, değilse 0. Konturlar, morfoloji ve sayım gibi sonraki adımların çoğu ikili görüntü ister.</p>
<h3>Otsu</h3>
<p>Elle eşik seçmek her görüntüde yeniden ayar demektir. <b>Otsu</b> histogramdaki her olası eşik <i>t</i> için pikselleri iki sınıfa ayırır ve sınıflar arası varyansı hesaplar; en büyük olanı seçer:</p>
<div class="eq">σ<sub>B</sub>²(t) = ω₀(t) · ω₁(t) · (μ₀(t) − μ₁(t))²</div>
<p>ω sınıfların oranı, μ ortalamalarıdır. İki tepeli (nesne ve zemin) histogramda iki tepenin arasındaki vadiyi bulur. Tek tepeli ya da ışığın görüntü boyunca değiştiği durumlarda başarısız olur.</p>
<h3>Uyarlamalı eşik</h3>
<p>Işık soldan sağa azalıyorsa sağdaki beyaz kâğıt soldaki siyah yazıdan koyu olabilir; hiçbir tek eşik işe yaramaz. <b>Uyarlamalı eşik</b> her pikseli kendi komşuluğunun ortalamasıyla karşılaştırır: <i>f(x, y) &gt; ortalama<sub>blok</sub>(x, y) − C</i>. Blok, yazı kalınlığından büyük olmalı; C küçük gürültünün beyaz kalmasını sağlar. Ortalama integral görüntüyle her piksel için sabit sürede hesaplanır.</p>`,
      code: [thresholdPy('tr')],
      lab: 'Düzensiz ışıktaki sayfa sahnesinde önce sabit eşikle sayfanın tamamını okunur yapmaya çalış: mümkün mü? Otsu\'ya geç ve bulduğu eşiği not et; σ<sub>B</sub>² eğrisinin tepesine bak. Sonra uyarlamalı eşiğe geç: blok 5, 15, 41 ve C 0, 10, 25 değerlerini dene; hangi bileşim harf aralıklarını koruyup zemini temiz bıraktı?',
      pitfalls: ['Eşiklemeden önce bulanıklaştırmamak: gürültü her yerde küçük beyaz noktalar bırakır.', 'Uyarlamalı eşikte çift sayılı blok boyu vermek: OpenCV tek sayı ister (3, 5, 7…), aksi hâlde hata verir.', 'Otsu\'yu renkli görüntüye vermek: yalnız tek kanallı uint8 görüntüde çalışır.', 'Koyu nesne açık zemindeyken THRESH_BINARY kullanıp nesnenin siyah çıkmasına şaşırmak: THRESH_BINARY_INV gerekir.'],
      se: `<p>Eşik gibi "sihirli sayılar" sahada en çok bozulan şeydir. Otsu ve uyarlamalı eşik, sabiti veriden türeterek bu kırılganlığı azaltır.</p>
<ul><li>Bir <b>altın görüntü seti</b> tut (farklı ışık, farklı kâğıt) ve her değişiklikte sonucu bunlarda karşılaştır: piksel doğruluğu ya da IoU.</li><li>Parametre aramasını elle değil, küçük bir ızgara taramasıyla yap ve sonucu kaydet.</li></ul>`,
      quiz: [
        { q: 'Otsu yöntemi hangi büyüklüğü en büyük yapan eşiği seçer?', options: ['Beyaz piksel sayısını', 'Sınıflar arası varyansı', 'Histogramın tepesini', 'Ortalama parlaklığı'], answer: 1, why: 'σ_B² = ω₀ω₁(μ₀ − μ₁)²: iki sınıfın ortalamaları birbirinden ne kadar uzak ve sınıflar ne kadar dengeli ise o kadar büyük.' },
        { q: 'Işığın görüntü boyunca güçlü biçimde değiştiği bir sayfada hangi yöntem en iyi sonuç verir?', options: ['Sabit eşik 127', 'Otsu', 'Uyarlamalı eşik', 'Histogram eşitleme'], answer: 2, why: 'Her piksel yerel ortalamayla karşılaştırıldığı için yavaş değişen aydınlatma etkisi ortadan kalkar.' },
        { q: 'cv2.adaptiveThreshold\'da C parametresi artırılınca ne olur?', options: ['Daha çok piksel beyaz olur', 'Daha çok piksel siyah olur', 'Blok büyür', 'Hiçbir şey'], answer: 0, why: 'Koşul f > ortalama − C; C büyüdükçe eşik düşer, daha çok piksel koşulu sağlar ve beyaz olur.' },
        { q: 'Açık zeminde koyu yazıyı beyaz (255) olarak almak için hangi bayrak kullanılır?', options: ['THRESH_BINARY', 'THRESH_BINARY_INV', 'THRESH_TRUNC', 'THRESH_TOZERO'], answer: 1, why: 'INV, eşikten küçük (koyu) pikselleri 255 yapar.' },
      ],
    },
    en: {
      title: 'Thresholding: fixed, Otsu and adaptive',
      summary: 'From gray to binary: a hand-picked threshold, Otsu\'s between-class variance, adaptive thresholds under uneven light.',
      goals: ['Apply fixed and inverted thresholding', 'Explain which quantity Otsu\'s method maximises', 'Show why adaptive thresholding wins under uneven lighting', 'Tune block size and C by looking at the result'],
      notes: `<p>Thresholding turns a gray image into a <b>binary</b> (black and white) mask: a pixel above the threshold becomes 255, otherwise 0. Most later steps such as contours, morphology and counting want a binary image.</p>
<h3>Otsu</h3>
<p>Picking a threshold by hand means retuning for every image. <b>Otsu</b> splits the pixels into two classes for every possible threshold <i>t</i> in the histogram, computes the between-class variance and picks the largest:</p>
<div class="eq">σ<sub>B</sub>²(t) = ω₀(t) · ω₁(t) · (μ₀(t) − μ₁(t))²</div>
<p>ω are the class proportions and μ their means. On a two-peaked (object and background) histogram it finds the valley between the peaks. It fails on single-peaked histograms or when the light changes across the image.</p>
<h3>Adaptive threshold</h3>
<p>If the light fades from left to right, the white paper on the right can be darker than the black text on the left; no single threshold works. <b>Adaptive thresholding</b> compares each pixel with the mean of its own neighbourhood: <i>f(x, y) &gt; mean<sub>block</sub>(x, y) − C</i>. The block must be larger than the stroke width; C keeps small noise white. The mean is computed in constant time per pixel with an integral image.</p>`,
      code: [thresholdPy('en')],
      lab: 'In the page under uneven light, first try to make the whole page readable with a fixed threshold: is it possible? Switch to Otsu and note the threshold it finds; look at the peak of the σ<sub>B</sub>² curve. Then switch to adaptive: try block 5, 15, 41 and C 0, 10, 25; which combination keeps the gaps between letters and leaves the background clean?',
      pitfalls: ['Not blurring before thresholding: noise leaves small white dots everywhere.', 'Giving an even block size to the adaptive threshold: OpenCV wants an odd number (3, 5, 7…) and raises an error otherwise.', 'Passing a colour image to Otsu: it only works on single-channel uint8 images.', 'Using THRESH_BINARY for a dark object on a light background and being surprised that the object comes out black: you need THRESH_BINARY_INV.'],
      se: `<p>"Magic numbers" like thresholds are what breaks most often in the field. Otsu and adaptive thresholds reduce that fragility by deriving the constant from the data.</p>
<ul><li>Keep a <b>golden image set</b> (different light, different paper) and compare results on it after every change: pixel accuracy or IoU.</li><li>Search parameters with a small grid sweep instead of by hand, and record the result.</li></ul>`,
      quiz: [
        { q: 'Which quantity does Otsu\'s threshold maximise?', options: ['The number of white pixels', 'The between-class variance', 'The histogram peak', 'The mean brightness'], answer: 1, why: 'σ_B² = ω₀ω₁(μ₀ − μ₁)²: the further apart the class means and the more balanced the classes, the larger it is.' },
        { q: 'On a page where the light changes strongly across the image, which method works best?', options: ['A fixed threshold of 127', 'Otsu', 'Adaptive thresholding', 'Histogram equalisation'], answer: 2, why: 'Each pixel is compared with its local mean, so the slowly varying illumination cancels out.' },
        { q: 'What happens when C is increased in cv2.adaptiveThreshold?', options: ['More pixels become white', 'More pixels become black', 'The block grows', 'Nothing'], answer: 0, why: 'The condition is f > mean − C; as C grows the threshold drops, more pixels pass and become white.' },
        { q: 'Which flag makes dark text on a light background white (255)?', options: ['THRESH_BINARY', 'THRESH_BINARY_INV', 'THRESH_TRUNC', 'THRESH_TOZERO'], answer: 1, why: 'INV sets the pixels below the threshold (the dark ones) to 255.' },
      ],
    },
  },
  {
    n: 4, tools: ['filter'],
    tr: {
      title: 'Evrişim ve filtreler: bulanıklaştırma, keskinleştirme, gürültü',
      summary: 'Çekirdek, kenar koşulu, kutu ve Gauss bulanıklığı, medyan filtre, keskinleştirme; PSNR ile ölçüm.',
      goals: ['3×3 bir evrişimi elle hesaplamak', 'Kutu, Gauss ve medyan filtrelerini gürültü türüne göre seçmek', 'Keskinleştirme çekirdeğinin neden toplamı 1 olan bir çekirdek olduğunu açıklamak', 'Filtre sonucunu PSNR ile sayısal olarak karşılaştırmak'],
      notes: `<p>Komşuluk işlemlerinde yeni değer, pikselin çevresine de bakar. Bunun en genel biçimi <b>evrişimdir</b>: küçük bir ağırlık tablosu (çekirdek) görüntü üstünde kayar, her konumda ağırlıklı toplam alınır.</p>
<div class="eq">g(x, y) = Σ<sub>i,j</sub> k(i, j) · f(x + i, y + j)</div>
<p>OpenCV\'nin <code>filter2D</code>\'si çekirdeği çevirmez (matematikte buna korelasyon denir); simetrik çekirdeklerde fark yoktur. Görüntünün kenarında komşu eksik kalır: OpenCV varsayılan olarak <b>BORDER_REFLECT_101</b> ile yansıtır.</p>
<h3>Bulanıklaştırma ailesi</h3>
<ul><li><b>Kutu</b>: tüm ağırlıklar eşit (1/9). Hızlı ama kenarları kare biçimli yayar.</li><li><b>Gauss</b>: ağırlıklar merkezden uzaklaştıkça azalır; ayrılabilir olduğundan iki 1B geçişle yapılır. Gauss gürültüsü için iyidir.</li><li><b>Medyan</b>: doğrusal değildir, komşuların ortancasını alır. Tuz-biber gürültüsünü siler, kenarları korur.</li></ul>
<h3>Keskinleştirme</h3>
<p>[0 −1 0; −1 5 −1; 0 −1 0] çekirdeği "orijinal + (orijinal − komşu ortalaması)" demektir. Ağırlıkların toplamı 1 olduğu için düz bölgeler değişmez, ayrıntı güçlenir; gürültü de güçlenir. Ölçmek için <b>PSNR</b> (tepe sinyal/gürültü oranı, dB) kullanılır: temiz görüntüye ne kadar yakın, o kadar yüksek.</p>`,
      code: [convPy('tr'), filterPy('tr')],
      lab: 'Renkli şekillere %8 tuz-biber gürültüsü ekle. Kutu, Gauss ve medyanı 3 ve 5 boyutlarıyla dene ve PSNR\'leri bir tabloya yaz. Hangisi kazandı, neden? Sonra gürültüyü Gauss\'a çevir ve tabloyu tekrarla. Son olarak gürültüsüz görüntüde keskinleştirmeyi aç ve çekirdekteki sayıları toplayarak düz bölgelerin neden değişmediğini doğrula.',
      pitfalls: ['Çekirdek ağırlıklarını normalleştirmemek: toplamı 9 olan bir kutu filtresi görüntüyü dokuz kat parlatır ve doyurur.', 'Keskinleştirme sonucunu uint8\'de hesaplamak: negatif değerler kaybolur; önce float, sonra kırp.', 'Tuz-biber gürültüsünü Gauss ile temizlemeye çalışmak: noktalar yalnız yayılır, medyan gerekir.', 'Büyük çekirdeği her karede çalıştırmak: 15×15 kutu filtresi integral görüntüyle ya da ayrılabilir geçişlerle çok daha hızlıdır.'],
      se: `<p>Evrişimin elle yazılmış hâli ile kütüphane hâlini karşılaştırmak (yukarıdaki kodda olduğu gibi) bir <b>referans uygulama testidir</b>: yavaş ama açık kod, hızlı ama karmaşık kodu doğrular.</p>
<ul><li>Kenar piksellerini ayrı test et; hataların çoğu kenar koşulundadır.</li><li>Performans için önce ölç (cv2.getTickCount ya da time.perf_counter), sonra optimize et.</li></ul>`,
      quiz: [
        { q: '[1 2 1; 2 4 2; 1 2 1] / 16 çekirdeği, ortası 160, diğer sekiz komşusu 0 olan bir 3×3 bölgede merkezde ne verir?', options: ['160', '40', '10', '0'], answer: 1, why: 'Yalnız merkez katkı verir: 4/16 · 160 = 40.' },
        { q: 'Tuz-biber gürültüsü için en uygun filtre hangisidir?', options: ['Kutu', 'Gauss', 'Medyan', 'Keskinleştirme'], answer: 2, why: 'Medyan aşırı uçtaki (0 ya da 255) değerleri ortanca yerine koymaz; noktaları siler, kenarları korur.' },
        { q: 'Keskinleştirme çekirdeğinin ağırlıkları toplamı neden 1\'dir?', options: ['Hız için', 'Düz (sabit) bölgelerin parlaklığı değişmesin diye', 'Gürültüyü azaltmak için', 'OpenCV öyle istediği için'], answer: 1, why: 'Sabit bir bölgede sonuç değer × ağırlık toplamıdır; toplam 1 ise değer korunur, yalnız değişimler güçlenir.' },
        { q: 'Gauss filtresinin iki 1B geçişle yapılabilmesinin adı nedir?', options: ['Ayrılabilirlik', 'Doğrusallık', 'Simetri', 'Doyum'], answer: 0, why: '2B Gauss çekirdeği bir satır ve bir sütun vektörünün çarpımıdır; k×k yerine 2k işlem yeter.' },
      ],
    },
    en: {
      title: 'Convolution and filters: blurring, sharpening, noise',
      summary: 'Kernels, border handling, box and Gaussian blur, the median filter, sharpening; measuring with PSNR.',
      goals: ['Compute a 3×3 convolution by hand', 'Choose box, Gaussian or median filtering by noise type', 'Explain why a sharpening kernel sums to 1', 'Compare filter results numerically with PSNR'],
      notes: `<p>In neighbourhood operations the new value also looks at the pixel\'s surroundings. The most general form is <b>convolution</b>: a small table of weights (the kernel) slides over the image and a weighted sum is taken at each position.</p>
<div class="eq">g(x, y) = Σ<sub>i,j</sub> k(i, j) · f(x + i, y + j)</div>
<p>OpenCV\'s <code>filter2D</code> does not flip the kernel (mathematicians call this correlation); for symmetric kernels there is no difference. At the image border neighbours are missing: by default OpenCV reflects with <b>BORDER_REFLECT_101</b>.</p>
<h3>The blur family</h3>
<ul><li><b>Box</b>: all weights equal (1/9). Fast, but spreads edges in a square pattern.</li><li><b>Gaussian</b>: weights fall off with distance from the centre; being separable it is done in two 1D passes. Good for Gaussian noise.</li><li><b>Median</b>: non-linear, takes the median of the neighbours. Removes salt-and-pepper noise and preserves edges.</li></ul>
<h3>Sharpening</h3>
<p>The kernel [0 −1 0; −1 5 −1; 0 −1 0] means "original + (original − neighbour mean)". Its weights sum to 1 so flat regions do not change and detail is boosted; so is noise. To measure, use <b>PSNR</b> (peak signal-to-noise ratio, dB): the closer to the clean image, the higher.</p>`,
      code: [convPy('en'), filterPy('en')],
      lab: 'Add 8% salt-and-pepper noise to the coloured shapes. Try box, Gaussian and median at sizes 3 and 5 and write the PSNRs in a table. Which won, and why? Then switch the noise to Gaussian and repeat the table. Finally turn on sharpening on the clean image and confirm, by adding up the kernel numbers, why flat regions do not change.',
      pitfalls: ['Not normalising kernel weights: a box filter whose weights sum to 9 brightens the image ninefold and saturates it.', 'Computing a sharpening result in uint8: negative values are lost; compute in float, then clip.', 'Trying to remove salt-and-pepper noise with a Gaussian: the dots just spread; you need a median.', 'Running a large kernel every frame: a 15×15 box filter is much faster with an integral image or separable passes.'],
      se: `<p>Comparing a hand-written convolution with the library version (as in the code above) is a <b>reference implementation test</b>: slow but obvious code checks fast but complex code.</p>
<ul><li>Test border pixels separately; most bugs live in the border handling.</li><li>Measure before optimising (cv2.getTickCount or time.perf_counter).</li></ul>`,
      quiz: [
        { q: 'The kernel [1 2 1; 2 4 2; 1 2 1] / 16 is applied to a 3×3 region whose centre is 160 and whose eight neighbours are 0. What is the result at the centre?', options: ['160', '40', '10', '0'], answer: 1, why: 'Only the centre contributes: 4/16 · 160 = 40.' },
        { q: 'Which filter suits salt-and-pepper noise best?', options: ['Box', 'Gaussian', 'Median', 'Sharpen'], answer: 2, why: 'The median never picks the extreme (0 or 255) values; it removes the dots and keeps edges.' },
        { q: 'Why do the weights of a sharpening kernel sum to 1?', options: ['For speed', 'So that the brightness of flat (constant) regions does not change', 'To reduce noise', 'Because OpenCV requires it'], answer: 1, why: 'In a constant region the result is value × weight sum; with a sum of 1 the value is kept and only changes are boosted.' },
        { q: 'What is it called that a Gaussian filter can be done in two 1D passes?', options: ['Separability', 'Linearity', 'Symmetry', 'Saturation'], answer: 0, why: 'A 2D Gaussian kernel is the product of a row and a column vector; 2k operations instead of k×k.' },
      ],
    },
  },
  {
    n: 5, tools: ['edges'],
    tr: {
      title: 'Kenar algılama: gradyan, Sobel ve Canny',
      summary: 'Türev olarak kenar, Sobel çekirdekleri, büyüklük ve yön; Canny\'nin dört adımı ve histerezis eşikleri.',
      goals: ['Kenarı parlaklığın hızlı değiştiği yer olarak tanımlamak ve Sobel ile ölçmek', 'Gradyan büyüklüğü ve yönünü hesaplamak', 'Canny\'nin dört adımını sırasıyla açıklamak', 'Alt ve üst eşiği sonuca göre ayarlamak'],
      notes: `<p><b>Kenar</b>, parlaklığın kısa mesafede çok değiştiği yerdir: nesne sınırı, gölge sınırı, doku çizgisi. Değişim türevle ölçülür. Görüntü kesikli olduğundan türev bir evrişimle yaklaşık hesaplanır; <b>Sobel</b> çekirdeği türevi bir yönde alırken öbür yönde hafifçe yumuşatır:</p>
<div class="eq">G<sub>x</sub> = [−1 0 1; −2 0 2; −1 0 1] &nbsp; |G| = √(G<sub>x</sub>² + G<sub>y</sub>²) &nbsp; θ = atan2(G<sub>y</sub>, G<sub>x</sub>)</div>
<p>Gradyan büyüklüğü kalın ve gürültülü bir kenar haritası verir. Türev gürültüyü büyüttüğü için önce bulanıklaştırmak gerekir.</p>
<h3>Canny\'nin dört adımı</h3>
<ol><li><b>Gauss yumuşatma</b>: gürültüyü bastır.</li><li><b>Sobel gradyanı</b>: büyüklük ve yön.</li><li><b>Maksimum olmayanı bastırma (NMS)</b>: her pikselde gradyan yönündeki iki komşuya bak; en büyük değilsen sıfırlan. Kalın kenar tek piksele iner.</li><li><b>Çift eşik ve histerezis</b>: üst eşikten büyükler kesin kenar; alt ile üst arasındakiler yalnız kesin bir kenara bağlıysa kalır. Kopuk kenarlar böyle birleşir, tek başına gürültü atılır.</li></ol>
<p>Pratik bir kural: üst eşik alt eşiğin 2–3 katı. Ortanca parlaklığın 0,66 ve 1,33 katı da iyi bir başlangıçtır.</p>`,
      code: [edgesPy('tr')],
      lab: 'Bloklar sahnesinde Sobel büyüklüğüne bak, sonra Canny\'ye geç. Alt eşiği 20\'den 120\'ye kaydır (üst 150): kenar sayısı nasıl değişti? Alt = üst yaparak histerezisi kapat ve yıldızın kenarlarında kopuklukları say. Bulanıklık çekirdeğini 1\'e (yok) indir ve dokulu zeminde neler çıktığını açıkla.',
      pitfalls: ['Sobel sonucunu uint8\'de istemek (cv2.CV_8U): negatif türevler 0\'a kırpılır, kenarların yarısı kaybolur. CV_16S ya da CV_32F kullan.', 'Canny\'den önce bulanıklaştırmayı atlamak: dokulu bölgelerde binlerce kısa kenar çıkar.', 'Eşikleri her görüntüde elle değiştirmek: ortancaya bağlı otomatik eşik ya da önce eşitleme düşün.', 'Canny çıktısını kapalı kontur sanmak: kenarlar kopuk olabilir; kontur bulmadan önce genişletme (6. ünite) gerekebilir.'],
      se: `<p>Canny bir <b>boru hattıdır</b>: her adım bir öncekinin çıktısını alır. Hata ayıklarken ara çıktıları görmek (yukarıdaki araçta olduğu gibi) en hızlı yoldur.</p>
<ul><li>Her aşamayı ayrı fonksiyon yap ve ara sonuçları isteğe bağlı döndür (debug=True).</li><li>Sentetik girdilerle test et: kare bir nesnenin her satırında tam iki kenar pikseli olmalı.</li></ul>`,
      quiz: [
        { q: 'Canny\'de maksimum olmayanı bastırma (NMS) adımının amacı nedir?', options: ['Gürültüyü azaltmak', 'Kalın kenarı tek piksel genişliğe indirmek', 'Kopuk kenarları birleştirmek', 'Renkleri griye çevirmek'], answer: 1, why: 'Her piksel gradyan yönündeki komşularıyla karşılaştırılır; yerel en büyük olmayanlar silinir, kenar incelir.' },
        { q: 'Alt eşik 50, üst eşik 150. Gradyanı 100 olan bir piksel ne zaman kenar sayılır?', options: ['Her zaman', 'Hiçbir zaman', 'Yalnız gradyanı 150\'den büyük bir kenar pikseline bağlıysa', 'Yalnız görüntünün ortasındaysa'], answer: 2, why: 'Histerezis: iki eşik arasındaki "zayıf" pikseller ancak "güçlü" bir kenara bağlıysa tutulur.' },
        { q: 'Sobel sonucu neden float (ya da 16 bit işaretli) tutulmalıdır?', options: ['Daha hızlı olduğu için', 'Türev negatif olabilir ve 255\'i aşabilir', 'Renkler için', 'Canny öyle istediği için'], answer: 1, why: 'Açıktan koyuya geçişte türev negatiftir; uint8 bunu 0\'a kırpar.' },
        { q: 'Dikey bir kenarda (solda koyu, sağda açık) hangi gradyan bileşeni büyüktür?', options: ['G_x', 'G_y', 'İkisi eşit', 'İkisi de sıfır'], answer: 0, why: 'Parlaklık x yönünde değişir; y yönünde değişmez. Gradyan yatay, kenar dikey.' },
      ],
    },
    en: {
      title: 'Edge detection: gradients, Sobel and Canny',
      summary: 'Edges as derivatives, Sobel kernels, magnitude and direction; Canny\'s four steps and hysteresis thresholds.',
      goals: ['Define an edge as a place where brightness changes quickly and measure it with Sobel', 'Compute gradient magnitude and direction', 'Explain Canny\'s four steps in order', 'Tune the low and high thresholds by looking at the result'],
      notes: `<p>An <b>edge</b> is where brightness changes a lot over a short distance: an object boundary, a shadow boundary, a texture line. Change is measured with a derivative. Since the image is discrete the derivative is approximated by a convolution; the <b>Sobel</b> kernel takes the derivative in one direction while lightly smoothing in the other:</p>
<div class="eq">G<sub>x</sub> = [−1 0 1; −2 0 2; −1 0 1] &nbsp; |G| = √(G<sub>x</sub>² + G<sub>y</sub>²) &nbsp; θ = atan2(G<sub>y</sub>, G<sub>x</sub>)</div>
<p>Gradient magnitude gives a thick and noisy edge map. Because derivatives amplify noise you must blur first.</p>
<h3>Canny\'s four steps</h3>
<ol><li><b>Gaussian smoothing</b>: suppress noise.</li><li><b>Sobel gradient</b>: magnitude and direction.</li><li><b>Non-maximum suppression (NMS)</b>: at each pixel look at the two neighbours along the gradient direction; if you are not the largest you are zeroed. A thick edge shrinks to one pixel.</li><li><b>Double threshold and hysteresis</b>: pixels above the high threshold are sure edges; those between low and high survive only if connected to a sure edge. Broken edges join this way and isolated noise is dropped.</li></ol>
<p>A practical rule: the high threshold is 2–3 times the low one. 0.66 and 1.33 times the median brightness is also a good start.</p>`,
      code: [edgesPy('en')],
      lab: 'In the blocks scene look at the Sobel magnitude, then switch to Canny. Slide the low threshold from 20 to 120 (high 150): how did the edge count change? Turn hysteresis off by setting low = high and count the breaks on the star\'s edges. Reduce the blur kernel to 1 (none) and explain what appears on the textured background.',
      pitfalls: ['Asking for a uint8 Sobel result (cv2.CV_8U): negative derivatives are clipped to 0 and half the edges are lost. Use CV_16S or CV_32F.', 'Skipping the blur before Canny: textured regions produce thousands of short edges.', 'Changing thresholds by hand for every image: consider a median-based automatic threshold or equalising first.', 'Treating Canny output as closed contours: edges can be broken; you may need dilation (unit 6) before finding contours.'],
      se: `<p>Canny is a <b>pipeline</b>: each step takes the previous step\'s output. When debugging, seeing the intermediate outputs (as in the tool above) is the fastest way.</p>
<ul><li>Make each stage a separate function and optionally return the intermediate results (debug=True).</li><li>Test with synthetic inputs: every row of a square object should have exactly two edge pixels.</li></ul>`,
      quiz: [
        { q: 'What is the purpose of non-maximum suppression (NMS) in Canny?', options: ['To reduce noise', 'To thin a thick edge to one pixel wide', 'To join broken edges', 'To convert colours to gray'], answer: 1, why: 'Each pixel is compared with its neighbours along the gradient; non-maxima are removed and the edge becomes thin.' },
        { q: 'Low threshold 50, high threshold 150. When is a pixel with gradient 100 an edge?', options: ['Always', 'Never', 'Only if it is connected to an edge pixel with gradient above 150', 'Only if it is in the middle of the image'], answer: 2, why: 'Hysteresis: "weak" pixels between the two thresholds are kept only when connected to a "strong" edge.' },
        { q: 'Why should a Sobel result be kept as float (or signed 16-bit)?', options: ['Because it is faster', 'The derivative can be negative and can exceed 255', 'For the colours', 'Because Canny requires it'], answer: 1, why: 'Going from light to dark the derivative is negative; uint8 clips it to 0.' },
        { q: 'On a vertical edge (dark on the left, light on the right), which gradient component is large?', options: ['G_x', 'G_y', 'Both equal', 'Both zero'], answer: 0, why: 'Brightness changes along x and not along y. The gradient is horizontal, the edge vertical.' },
      ],
    },
  },
  {
    n: 6, tools: ['morph'],
    tr: {
      title: 'Morfolojik işlemler: aşındırma, genişletme, açma, kapama',
      summary: 'Yapı elemanı, aşındırma ve genişletme; açma gürültüyü, kapama delikleri; gradyan, top-hat.',
      goals: ['Aşındırma ve genişletmeyi en küçük ve en büyük işlemi olarak açıklamak', 'Açma ve kapamanın sırasını ve etkisini doğru seçmek', 'Yapı elemanının biçim ve boyutunun sonuca etkisini göstermek', 'Birbirine değen nesneleri ayırmak ya da kopuk parçaları birleştirmek için morfoloji kullanmak'],
      notes: `<p>Morfoloji, ikili (ya da gri) görüntüde nesnelerin <b>biçimini</b> değiştiren komşuluk işlemleridir. Bir <b>yapı elemanı</b> (dikdörtgen, elips ya da artı biçimli küçük maske) her piksele yerleştirilir.</p>
<ul><li><b>Aşındırma (erode)</b>: yapı elemanının altındaki en küçük değer. Nesneler incelir, küçük beyaz noktalar ve ince köprüler kaybolur.</li><li><b>Genişletme (dilate)</b>: en büyük değer. Nesneler kalınlaşır, küçük delikler ve aralıklar kapanır.</li></ul>
<h3>Sıranın önemi</h3>
<div class="eq">açma = genişlet(aşındır(f)) &nbsp;&nbsp; kapama = aşındır(genişlet(f))</div>
<p><b>Açma</b>, yapı elemanından küçük beyaz parçaları siler ama büyük nesnelerin boyunu korur. <b>Kapama</b>, nesne içindeki küçük siyah delikleri ve çatlakları doldurur. İkisi birlikte, eşiklemeden sonra maskeyi temizlemenin standart yoludur.</p>
<h3>Türev işlemler</h3>
<p><b>Morfolojik gradyan</b> (genişletme − aşındırma) nesnenin çerçevesini verir. <b>Top-hat</b> (f − açma) zeminden küçük ve açık ayrıntıyı, <b>black-hat</b> (kapama − f) küçük ve koyu ayrıntıyı çıkarır: düzensiz ışıkta yazı çıkarmak için kullanılır.</p>`,
      code: [morphPy('tr')],
      lab: 'Gürültülü pullar sahnesinde eşiklenmiş maskeye bak: kaç kontur var? Açmayı 3×3 elipsle uygula; kontur sayısı ne oldu? Sağ üstte iki pulu birleştiren ince köprüyü hangi çekirdek boyu koparıyor? Sonra kapamaya geç ve pulların içindeki delikleri dolduran en küçük boyu bul. Yineleme sayısını 3 yapınca neden dikdörtgen çekirdekle pullar köşeli görünmeye başlıyor?',
      pitfalls: ['Açma ile kapamanın sırasını karıştırmak: gürültüyü silmek isterken delikleri doldurursun ya da tersi.', 'Siyah nesne beyaz zeminde dururken aşındırmanın nesneyi incelteceğini sanmak: OpenCV beyazı nesne sayar; önce maskeyi ters çevir.', 'Büyük çekirdek yerine çok yineleme kullanmak ya da tersi: 3×3 ile 3 yineleme yaklaşık 7×7\'dir ama biçim farklı olabilir.', 'Morfolojiyi ölçümden sonra unutmak: aşındırma alanı küçültür; alan ölçeceksen açma/kapama gibi boyu koruyan işlemleri tercih et.'],
      se: `<p>Morfoloji parametreleri, nesnelerin beklenen boyuna bağlıdır. Bu bağımlılığı <b>belgelenmiş bir varsayım</b> olarak yaz.</p>
<ul><li>"Gürültü ≤ 3 px, nesne ≥ 20 px" gibi bir varsayım varsa çekirdek boyunu bundan türet ve testi aynı varsayımla kur.</li><li>Kamera çözünürlüğü değişince ölçeklenen parametreler (örneğin genişliğin %1\'i) sabit piksel değerlerinden daha dayanıklıdır.</li></ul>`,
      quiz: [
        { q: 'İkili maskedeki küçük beyaz gürültü noktalarını, büyük nesnelerin boyunu koruyarak silmek için hangisi kullanılır?', options: ['Genişletme', 'Kapama', 'Açma', 'Gradyan'], answer: 2, why: 'Açma önce aşındırır (noktalar kaybolur, nesneler incelir), sonra genişletir (nesneler eski boyuna döner, noktalar geri gelmez).' },
        { q: 'Aşındırma bir pikselin değerini nasıl belirler?', options: ['Komşuların ortalaması', 'Yapı elemanı altındaki en küçük değer', 'En büyük değer', 'Ortanca değer'], answer: 1, why: 'Aşındırma minimum, genişletme maksimum işlemidir.' },
        { q: 'Morfolojik gradyan (genişletme − aşındırma) ne verir?', options: ['Nesnenin çerçevesini (sınırını)', 'Nesnenin içini', 'Gürültüyü', 'Histogramı'], answer: 0, why: 'Genişletilmiş biçimden aşındırılmış biçim çıkarılınca yalnız sınır şeridi kalır.' },
        { q: 'Bir nesnenin içindeki küçük siyah delikleri doldurmak için hangisi?', options: ['Açma', 'Aşındırma', 'Top-hat', 'Kapama'], answer: 3, why: 'Kapama önce genişletir (delikler kapanır), sonra aşındırır (dış sınır eski yerine döner).' },
      ],
    },
    en: {
      title: 'Morphological operations: erosion, dilation, opening, closing',
      summary: 'Structuring elements, erosion and dilation; opening removes noise, closing fills holes; gradient, top-hat.',
      goals: ['Explain erosion and dilation as min and max operations', 'Choose the order and effect of opening and closing correctly', 'Show how the shape and size of the structuring element change the result', 'Use morphology to separate touching objects or join broken pieces'],
      notes: `<p>Morphology is a set of neighbourhood operations that change the <b>shape</b> of objects in a binary (or gray) image. A <b>structuring element</b> (a small rectangular, elliptical or cross-shaped mask) is placed at every pixel.</p>
<ul><li><b>Erosion</b>: the smallest value under the structuring element. Objects get thinner; small white dots and thin bridges disappear.</li><li><b>Dilation</b>: the largest value. Objects get thicker; small holes and gaps close.</li></ul>
<h3>Order matters</h3>
<div class="eq">opening = dilate(erode(f)) &nbsp;&nbsp; closing = erode(dilate(f))</div>
<p><b>Opening</b> removes white pieces smaller than the structuring element but keeps the size of large objects. <b>Closing</b> fills small black holes and cracks inside objects. Together they are the standard way to clean a mask after thresholding.</p>
<h3>Derived operations</h3>
<p>The <b>morphological gradient</b> (dilation − erosion) gives the outline of an object. <b>Top-hat</b> (f − opening) extracts small bright detail from the background and <b>black-hat</b> (closing − f) small dark detail: it is used to pull out text under uneven light.</p>`,
      code: [morphPy('en')],
      lab: 'In the noisy tokens scene look at the thresholded mask: how many contours are there? Apply opening with a 3×3 ellipse; what happened to the contour count? Which kernel size breaks the thin bridge joining two tokens at the top right? Then switch to closing and find the smallest size that fills the holes inside the tokens. With 3 iterations, why do tokens start to look square with a rectangular kernel?',
      pitfalls: ['Mixing up the order of opening and closing: you fill holes when you meant to remove noise, or the other way round.', 'Expecting erosion to thin a black object on a white background: OpenCV treats white as the object; invert the mask first.', 'Using many iterations instead of a big kernel or vice versa: 3×3 with 3 iterations is roughly 7×7, but the shape can differ.', 'Forgetting morphology before measuring: erosion shrinks area; if you measure area prefer size-preserving operations such as opening/closing.'],
      se: `<p>Morphology parameters depend on the expected size of objects. Write that dependency down as a <b>documented assumption</b>.</p>
<ul><li>If the assumption is "noise ≤ 3 px, objects ≥ 20 px", derive the kernel size from it and build the test on the same assumption.</li><li>Parameters that scale with camera resolution (e.g. 1% of the width) are more robust than fixed pixel values.</li></ul>`,
      quiz: [
        { q: 'Which removes small white noise dots from a binary mask while keeping the size of large objects?', options: ['Dilation', 'Closing', 'Opening', 'Gradient'], answer: 2, why: 'Opening erodes first (dots vanish, objects thin) and then dilates (objects return to size, dots do not come back).' },
        { q: 'How does erosion set a pixel\'s value?', options: ['The mean of the neighbours', 'The smallest value under the structuring element', 'The largest value', 'The median'], answer: 1, why: 'Erosion is a minimum operation, dilation a maximum.' },
        { q: 'What does the morphological gradient (dilation − erosion) give?', options: ['The outline (boundary) of the object', 'The inside of the object', 'The noise', 'The histogram'], answer: 0, why: 'Subtracting the eroded shape from the dilated one leaves only the boundary band.' },
        { q: 'Which fills small black holes inside an object?', options: ['Opening', 'Erosion', 'Top-hat', 'Closing'], answer: 3, why: 'Closing dilates first (holes close) and then erodes (the outer boundary returns to its place).' },
      ],
    },
  },
]
