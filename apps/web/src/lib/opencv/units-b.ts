// OpenCV dersi üniteleri 7–12: konturlar, renk segmentasyonu ve takip, geometrik ve perspektif dönüşümler, öznitelikler,
// yüz ve insan algılama, video ve arka plan çıkarma. HTML iki dilde aynı etiket dizisinde.
import type { KursUnit } from '@/lib/kurs/types'
import type { CvToolId } from './tools'
import { bgsubPy, colorPy, contoursPy, featuresPy, haarPy, integralPy, perspectivePy, trackPy, videoLoopPy, warpPy } from './code'

export const UNITS_B: KursUnit<CvToolId>[] = [
  {
    n: 7, tools: ['contours'],
    tr: {
      title: 'Konturlar ve şekil öznitelikleri: say, ölç, sınıflandır',
      summary: 'findContours, alan ve çevre, momentler ve ağırlık merkezi, sınırlayıcı kutu, approxPolyDP, dairesellik ve dışbükeylik.',
      goals: ['İkili maskeden konturları bulmak ve nesneleri saymak', 'Alan, çevre, ağırlık merkezi ve sınırlayıcı kutuyu hesaplamak', 'Douglas-Peucker ile konturu çokgene indirip köşe sayısından şekil tahmin etmek', 'Dairesellik ve dışbükeylik (solidity) ile ölçeğe bağımsız öznitelikler kurmak'],
      notes: `<p><b>Kontur</b>, bir nesnenin sınırını izleyen nokta dizisidir. <code>cv2.findContours</code> ikili görüntüde beyaz bölgelerin sınırlarını bulur; <code>RETR_EXTERNAL</code> yalnız dış sınırları, <code>RETR_TREE</code> iç içe delikleri de hiyerarşiyle verir.</p>
<h3>Ölçüler</h3>
<ul><li><b>Alan</b> (<code>contourArea</code>): ayakkabı bağı formülü, ½·|Σ(x<sub>i</sub>y<sub>i+1</sub> − x<sub>i+1</sub>y<sub>i</sub>)|.</li><li><b>Çevre</b> (<code>arcLength</code>): ardışık noktalar arası uzaklıkların toplamı.</li><li><b>Momentler</b>: m00 alan, ağırlık merkezi (m10/m00, m01/m00).</li><li><b>Sınırlayıcı kutu</b> (<code>boundingRect</code>) ve en küçük döndürülmüş kutu (<code>minAreaRect</code>).</li></ul>
<h3>Şekil tanıma</h3>
<p><code>approxPolyDP</code> (Douglas-Peucker) konturu, her noktası en fazla ε uzakta kalacak biçimde daha az köşeli bir çokgene indirir; ε genelde çevrenin %1–3\'üdür. Üç köşe üçgen, dört köşe dörtgen (en/boy oranı ≈ 1 ise kare), çok köşe ve yüksek dairesellik daire demektir.</p>
<div class="eq">dairesellik = 4π · A / P² &nbsp; (daire 1, kare ≈ 0,785) &nbsp;&nbsp; solidity = A / A<sub>dışbükey örtü</sub></div>
<p>Bu oranlar ölçekten bağımsızdır: nesne kameraya yaklaşsa da değişmez. Bu yüzden basit sınıflandırıcılar için iyi özniteliklerdir.</p>`,
      code: [contoursPy('tr')],
      lab: 'Renkli şekillerde tablodaki köşe sayılarına ve daireselliğe bak: hangi şekil en yuvarlak? ε oranını %1\'den %8\'e çıkar: altıgen ve daire hangi değerde yanlış sınıflanmaya başlıyor? Sonra gürültülü pullara geç: önce kontur sayısını, sonra en küçük alan sınırını 50 yapınca kalan sayıyı yaz. Kendi fotoğrafını (beyaz kâğıtta birkaç nesne) yükle ve aynı sayımı dene.',
      pitfalls: ['findContours\'a gri ya da renkli görüntü vermek: ikili (0/255) tek kanallı görüntü ister. Önce eşikle.', 'Siyah nesne beyaz zeminde: OpenCV beyaz bölgeleri nesne sayar, zemini tek dev kontur olarak bulursun. Maskeyi ters çevir.', 'Küçük gürültü konturlarını süzmemek: sayım şişer. En küçük alan sınırı koy ya da önce açma uygula.', 'approxPolyDP\'de sabit ε (piksel) kullanmak: büyük nesnede çok köşe, küçükte az köşe çıkar. ε\'yi çevreye oranla.'],
      se: `<p>Kontur öznitelikleri basit bir <b>kural tabanlı sınıflandırıcıya</b> girer. Kuralları kodun içine dağıtma; bir tabloda topla.</p>
<ul><li>Kuralları (köşe sayısı, dairesellik aralığı) veri olarak tut, her kural için bir test yaz.</li><li>Yanlış sınıflanan örnekleri bir klasörde biriktir; kural değiştikçe bu "regresyon seti" ile sına.</li></ul>`,
      quiz: [
        { q: 'Yarıçapı 10 px olan bir dairenin dairesellik değeri (4πA/P²) yaklaşık kaçtır?', options: ['0,5', '0,785', '1', '3,14'], answer: 2, why: 'A = πr², P = 2πr ise 4π·πr² / (2πr)² = 1. Daire, verilen çevre için en büyük alanı kaplar.' },
        { q: 'Kenar uzunluğu 20 px olan bir karenin dairesellik değeri yaklaşık kaçtır?', options: ['0,785', '1', '0,5', '0,25'], answer: 0, why: 'A = 400, P = 80: 4π·400/6400 = π/4 ≈ 0,785.' },
        { q: 'approxPolyDP\'de ε neden çevrenin bir oranı olarak seçilir?', options: ['Daha hızlı olduğu için', 'Sonuç nesnenin boyundan bağımsız olsun diye', 'OpenCV öyle istediği için', 'Daire bulmak için'], answer: 1, why: 'Sabit piksel ε büyük ve küçük nesnelerde farklı davranır; oran ölçekten bağımsızdır.' },
        { q: 'Ağırlık merkezi momentlerden nasıl bulunur?', options: ['(m00, m11)', '(m10/m00, m01/m00)', '(m20, m02)', 'Sınırlayıcı kutunun sol üst köşesi'], answer: 1, why: 'm10 ve m01 x ve y\'nin alan üzerindeki toplamlarıdır; alana (m00) bölünce ortalama konum çıkar.' },
      ],
    },
    en: {
      title: 'Contours and shape features: count, measure, classify',
      summary: 'findContours, area and perimeter, moments and centroid, bounding box, approxPolyDP, circularity and solidity.',
      goals: ['Find contours in a binary mask and count objects', 'Compute area, perimeter, centroid and bounding box', 'Reduce a contour to a polygon with Douglas-Peucker and guess the shape from its vertex count', 'Build scale-invariant features with circularity and solidity'],
      notes: `<p>A <b>contour</b> is a sequence of points that traces an object\'s boundary. <code>cv2.findContours</code> finds the boundaries of white regions in a binary image; <code>RETR_EXTERNAL</code> gives only outer boundaries, <code>RETR_TREE</code> also gives nested holes with a hierarchy.</p>
<h3>Measurements</h3>
<ul><li><b>Area</b> (<code>contourArea</code>): the shoelace formula, ½·|Σ(x<sub>i</sub>y<sub>i+1</sub> − x<sub>i+1</sub>y<sub>i</sub>)|.</li><li><b>Perimeter</b> (<code>arcLength</code>): the sum of distances between consecutive points.</li><li><b>Moments</b>: m00 is the area, the centroid is (m10/m00, m01/m00).</li><li><b>Bounding box</b> (<code>boundingRect</code>) and the smallest rotated box (<code>minAreaRect</code>).</li></ul>
<h3>Shape recognition</h3>
<p><code>approxPolyDP</code> (Douglas-Peucker) reduces a contour to a polygon with fewer vertices such that every point stays within ε; ε is usually 1–3% of the perimeter. Three vertices is a triangle, four a quadrilateral (a square if the aspect ratio ≈ 1), many vertices with high circularity a circle.</p>
<div class="eq">circularity = 4π · A / P² &nbsp; (circle 1, square ≈ 0.785) &nbsp;&nbsp; solidity = A / A<sub>convex hull</sub></div>
<p>These ratios do not depend on scale: they stay the same when the object moves closer to the camera. That makes them good features for simple classifiers.</p>`,
      code: [contoursPy('en')],
      lab: 'In the coloured shapes look at the vertex counts and circularity in the table: which shape is the roundest? Raise the ε ratio from 1% to 8%: at what value do the hexagon and the circle start being misclassified? Then switch to the noisy tokens: write down the contour count, then the count left with a minimum area of 50. Upload your own photo (a few objects on white paper) and try the same count.',
      pitfalls: ['Passing a gray or colour image to findContours: it wants a binary (0/255) single-channel image. Threshold first.', 'Black objects on a white background: OpenCV treats white regions as objects and you find the background as one huge contour. Invert the mask.', 'Not filtering small noise contours: the count inflates. Set a minimum area or apply opening first.', 'Using a fixed ε (pixels) in approxPolyDP: large objects get many vertices, small ones few. Make ε proportional to the perimeter.'],
      se: `<p>Contour features feed a simple <b>rule-based classifier</b>. Do not scatter the rules through the code; collect them in a table.</p>
<ul><li>Keep the rules (vertex count, circularity range) as data and write a test for each rule.</li><li>Collect misclassified examples in a folder; whenever a rule changes, check against this "regression set".</li></ul>`,
      quiz: [
        { q: 'What is the circularity (4πA/P²) of a circle with radius 10 px, approximately?', options: ['0.5', '0.785', '1', '3.14'], answer: 2, why: 'With A = πr² and P = 2πr, 4π·πr² / (2πr)² = 1. A circle encloses the largest area for a given perimeter.' },
        { q: 'What is the circularity of a square with side 20 px, approximately?', options: ['0.785', '1', '0.5', '0.25'], answer: 0, why: 'A = 400, P = 80: 4π·400/6400 = π/4 ≈ 0.785.' },
        { q: 'Why is ε in approxPolyDP chosen as a fraction of the perimeter?', options: ['Because it is faster', 'So the result does not depend on the object\'s size', 'Because OpenCV requires it', 'To find circles'], answer: 1, why: 'A fixed pixel ε behaves differently on large and small objects; a ratio is scale-invariant.' },
        { q: 'How is the centroid found from moments?', options: ['(m00, m11)', '(m10/m00, m01/m00)', '(m20, m02)', 'The top-left corner of the bounding box'], answer: 1, why: 'm10 and m01 are the sums of x and y over the area; dividing by the area (m00) gives the mean position.' },
      ],
    },
  },
  {
    n: 8, tools: ['color'],
    tr: {
      title: 'Renk segmentasyonu ve takip: HSV maskesi, leke, iz',
      summary: 'inRange ile HSV aralığı, kırmızının sarmalı tonu, maske temizliği, en büyük leke, ağırlık merkezi ve kamerada takip.',
      goals: ['Bir rengi HSV aralığı olarak tanımlayıp maske çıkarmak', 'Kırmızı gibi tonun iki ucunda duran renkleri iki maskeyle birleştirmek', 'Maskeyi morfolojiyle temizleyip en büyük lekeyi bulmak', 'Lekenin merkezini kareden kareye izleyip yol çizmek'],
      notes: `<p>Bir nesneyi rengiyle ayırmak, bilgisayarlı görünün en eski ve hâlâ en kullanışlı yöntemlerinden biridir: top takip eden robotlar, renkli işaretler, meyve ayıklama. Anahtar, BGR yerine <b>HSV</b> çalışmaktır.</p>
<div class="eq">maske = inRange(hsv, (H<sub>alt</sub>, S<sub>alt</sub>, V<sub>alt</sub>), (H<sub>üst</sub>, S<sub>üst</sub>, V<sub>üst</sub>))</div>
<p>H rengi, S rengin ne kadar "dolu" olduğunu, V parlaklığı verir. Gölge V\'yi düşürür ama H\'yi pek değiştirmez; bu yüzden geniş bir V aralığı ve dar bir H aralığı ışık değişimine dayanıklıdır. Düşük S\'li pikseller (gri, beyaz, siyah) için ton anlamsızdır; alt S sınırı onları dışarıda tutar.</p>
<h3>Kırmızı özel</h3>
<p>OpenCV\'de ton 0–179 arasında bir çemberdir ve kırmızı iki uçtadır (0–10 ve 170–179). İki maske alınıp <code>cv2.bitwise_or</code> ile birleştirilir.</p>
<h3>Maskeden konuma</h3>
<ol><li>Maskeyi açma ve kapama ile temizle.</li><li>Konturları bul, en büyüğünü seç (ya da <code>connectedComponentsWithStats</code>).</li><li>Momentlerden merkezi al; son N merkezi bir kuyrukta tut ve çiz.</li></ol>
<p>Kamerada bu döngü saniyede 30 kez döner. Leke kaybolursa son konumu bir süre korumak titremeyi azaltır.</p>`,
      code: [colorPy('tr'), trackPy('tr')],
      lab: 'Hareketli top sahnesinde H aralığını 5–22, S ≥ 120 yap: top kutulanıyor mu? Işığı 0,5\'e indir: maske ne kadar küçüldü? V alt sınırını düşürerek takibi geri getir. Sonra H aralığını 100–130 yap: hangi nesneyi takip etmeye başladı? Kamerayı aç ve elindeki renkli bir nesne için aralığı bul; aralığı not edip Python koduna yaz.',
      pitfalls: ['Renk aralığını BGR\'de tanımlamak: ışık değişince üç kanal birlikte kayar, aralık tutmaz.', 'Kırmızı için tek H aralığı (örneğin 170–10) yazmak: inRange sarmalı aralığı anlamaz; iki maske gerekir.', 'S alt sınırını 0 bırakmak: beyaz ve gri pikseller rastgele tonlarla maskeye girer.', 'Kameranın otomatik beyaz dengesini ve pozlamasını unutmak: renkler kendiliğinden kayar. Mümkünse kilitle.'],
      se: `<p>Renk aralıkları ortama bağlıdır; aynı kod farklı ışıkta farklı sonuç verir. Bunu bir <b>kalibrasyon adımı</b> ile yazılımın parçası yap.</p>
<ul><li>Aralıkları bir JSON dosyasında sakla, kalibrasyon aracıyla (bu oyun alanı gibi) güncelle.</li><li>Takip döngüsünde kare başına süreyi ölç ve kaydet; gecikme bütçesini (örneğin 33 ms) aşan kareleri say.</li></ul>`,
      quiz: [
        { q: 'OpenCV\'de saf kırmızının tonu (H) hangi bölgelerdedir?', options: ['Yalnız 0 civarı', 'Yalnız 90 civarı', '0 civarı ve 179 civarı', '60 civarı'], answer: 2, why: 'Ton bir çemberdir; kırmızı 0° (ve 360°) noktasındadır, OpenCV ölçeğinde 0 ve 179\'a yakın iki uçta.' },
        { q: 'Gölgede kalan turuncu bir topu yakalamak için HSV aralığında ne gevşetilmeli?', options: ['H aralığı genişletilmeli', 'V alt sınırı düşürülmeli', 'S üst sınırı düşürülmeli', 'Hiçbiri'], answer: 1, why: 'Gölge parlaklığı (V) düşürür; ton büyük ölçüde aynı kalır.' },
        { q: 'S alt sınırının amacı nedir?', options: ['Parlak pikselleri atmak', 'Rengi soluk (gri, beyaz) pikselleri dışarıda tutmak', 'Kırmızıyı bulmak', 'Gürültü eklemek'], answer: 1, why: 'Doygunluğu düşük piksellerin tonu kararsızdır; S sınırı onları maskeden çıkarır.' },
        { q: 'Maskede birden çok leke varken hedef nesneyi seçmenin en basit yolu hangisidir?', options: ['İlk bulunan kontur', 'En büyük alanlı kontur', 'En küçük kontur', 'Rastgele kontur'], answer: 1, why: 'Hedef genelde en büyük renkli bölgedir; küçük lekeler gürültüdür. Ek olarak dairesellik gibi bir biçim şartı konabilir.' },
      ],
    },
    en: {
      title: 'Colour segmentation and tracking: HSV masks, blobs, trails',
      summary: 'HSV ranges with inRange, red\'s wrap-around hue, mask clean-up, the largest blob, its centroid and tracking on the camera.',
      goals: ['Define a colour as an HSV range and extract a mask', 'Combine two masks for colours like red that sit at both ends of the hue circle', 'Clean the mask with morphology and find the largest blob', 'Track the blob\'s centre from frame to frame and draw its path'],
      notes: `<p>Separating an object by colour is one of the oldest and still most useful methods in computer vision: ball-tracking robots, coloured markers, fruit sorting. The key is to work in <b>HSV</b> instead of BGR.</p>
<div class="eq">mask = inRange(hsv, (H<sub>lo</sub>, S<sub>lo</sub>, V<sub>lo</sub>), (H<sub>hi</sub>, S<sub>hi</sub>, V<sub>hi</sub>))</div>
<p>H gives the colour, S how "full" the colour is, V the brightness. A shadow lowers V but barely changes H, so a wide V range with a narrow H range is robust to lighting changes. For low-S pixels (gray, white, black) hue is meaningless; a lower S bound keeps them out.</p>
<h3>Red is special</h3>
<p>In OpenCV hue is a circle from 0 to 179 and red sits at both ends (0–10 and 170–179). Take two masks and combine them with <code>cv2.bitwise_or</code>.</p>
<h3>From mask to position</h3>
<ol><li>Clean the mask with opening and closing.</li><li>Find contours and pick the largest (or use <code>connectedComponentsWithStats</code>).</li><li>Take the centre from the moments; keep the last N centres in a queue and draw them.</li></ol>
<p>On a camera this loop runs 30 times a second. Keeping the last position for a while when the blob disappears reduces jitter.</p>`,
      code: [colorPy('en'), trackPy('en')],
      lab: 'In the moving ball scene set the H range to 5–22 with S ≥ 120: is the ball boxed? Lower the light to 0.5: how much did the mask shrink? Bring tracking back by lowering the V lower bound. Then set H to 100–130: which object does it start tracking? Turn on the camera and find the range for a coloured object in your hand; note the range and put it into the Python code.',
      pitfalls: ['Defining the colour range in BGR: when the light changes all three channels shift together and the range fails.', 'Writing a single H range for red (e.g. 170–10): inRange does not understand wrap-around; you need two masks.', 'Leaving the S lower bound at 0: white and gray pixels enter the mask with random hues.', 'Forgetting the camera\'s automatic white balance and exposure: colours drift on their own. Lock them if possible.'],
      se: `<p>Colour ranges depend on the environment; the same code gives different results in different light. Make that a part of the software with a <b>calibration step</b>.</p>
<ul><li>Store the ranges in a JSON file and update them with a calibration tool (like this playground).</li><li>Measure and log the time per frame in the tracking loop; count frames that exceed the latency budget (e.g. 33 ms).</li></ul>`,
      quiz: [
        { q: 'In OpenCV, where is the hue (H) of pure red?', options: ['Only near 0', 'Only near 90', 'Near 0 and near 179', 'Near 60'], answer: 2, why: 'Hue is a circle; red is at 0° (and 360°), which on OpenCV\'s scale means both ends, near 0 and 179.' },
        { q: 'To catch an orange ball in shadow, what should be relaxed in the HSV range?', options: ['Widen the H range', 'Lower the V lower bound', 'Lower the S upper bound', 'None of these'], answer: 1, why: 'Shadow lowers brightness (V); hue stays largely the same.' },
        { q: 'What is the purpose of the S lower bound?', options: ['To drop bright pixels', 'To keep washed-out (gray, white) pixels out', 'To find red', 'To add noise'], answer: 1, why: 'The hue of low-saturation pixels is unstable; the S bound removes them from the mask.' },
        { q: 'With several blobs in the mask, what is the simplest way to pick the target object?', options: ['The first contour found', 'The contour with the largest area', 'The smallest contour', 'A random contour'], answer: 1, why: 'The target is usually the largest coloured region; small blobs are noise. A shape condition such as circularity can be added.' },
      ],
    },
  },
  {
    n: 9, tools: ['warp', 'perspective', 'camera3d'],
    tr: {
      title: 'Geometrik ve perspektif dönüşümler: döndür, ölçekle, düzle',
      summary: 'Afin matris (2×3), getRotationMatrix2D, ara değerleme; homografi (3×3), dört nokta çifti ve belge düzleme.',
      goals: ['Döndürme, ölçekleme ve kaydırmayı tek bir 2×3 afin matrisle yazmak', 'Ters eşlemenin ve ara değerlemenin neden gerektiğini açıklamak', 'Dört nokta çiftinden 3×3 homografiyi çözmek', 'Eğik çekilmiş bir belgeyi yukarıdan bakılmış gibi düzlemek'],
      notes: `<p>Geometrik dönüşüm piksellerin <b>değerini</b> değil <b>yerini</b> değiştirir. Afin dönüşüm doğruları doğru, paralelleri paralel tutar ve 2×3 bir matrisle yazılır:</p>
<div class="eq">[x′; y′] = [a b t<sub>x</sub>; c d t<sub>y</sub>] · [x; y; 1]</div>
<p><code>cv2.getRotationMatrix2D(merkez, açı, ölçek)</code> bu matrisi verir; OpenCV\'de pozitif açı saat yönünün tersidir. Afin dönüşüm üç nokta çiftinden de bulunur (<code>getAffineTransform</code>).</p>
<h3>Ters eşleme ve ara değerleme</h3>
<p><code>warpAffine</code> her <b>hedef</b> pikseli ters matrisle kaynağa götürür ve oradan örnekler; ileri eşlemede hedefte delikler kalırdı. Kaynak konumu genelde tam sayı değildir: <b>en yakın komşu</b> hızlıdır ama basamaklı kenar verir, <b>çift doğrusal</b> dört komşunun ağırlıklı ortalamasıdır ve daha yumuşaktır.</p>
<h3>Perspektif (homografi)</h3>
<p>Bir düzleme açılı bakınca dikdörtgen yamuk görünür; paralellik bozulur. Bunu 3×3 bir <b>homografi</b> düzeltir: <i>[x′w; y′w; w] = H·[x; y; 1]</i>. H\'nin 8 serbest değeri vardır; dört nokta çifti (her biri iki denklem) yeter: <code>getPerspectiveTransform</code>. Belge tarayıcıda dört köşe bulunur, sol üst–sağ üst–sağ alt–sol alt sırasına konur ve hedef dikdörtgene eşlenir.</p>`,
      code: [warpPy('tr'), perspectivePy('tr')],
      lab: 'Dönüşüm aracında açıyı 30°, ölçeği 1,5 yap ve matrisin a, b değerlerinin cos ve sin ile ilişkisini doğrula. Ara değerlemeyi en yakın komşuya çevirip yıldızın kenarındaki basamakları gör. Perspektif aracında köşeleri bul, sonra bir köşeyi bilerek 15 px kaydır: düzlenmiş belgede satırlar ne oldu? Kendi çektiğin eğik bir sayfa fotoğrafını yükle ve köşeleri elle yerleştir.',
      pitfalls: ['Köşe sırasını karıştırmak: dört nokta çapraz eşlenirse düzlenmiş görüntü ters ya da kelebek biçiminde çıkar. Önce sırala.', 'warpAffine\'e (yükseklik, genişlik) vermek: dsize (genişlik, yükseklik) ister.', 'Döndürmede görüntünün köşelerinin kesildiğini fark etmemek: yeni boyutu cos/sin ile hesaplayıp matrisin kaydırmasını düzelt.', 'Perspektifi afinle düzeltmeye çalışmak: afin paralellikleri korur, yamuk bir sayfayı düzeltemez.'],
      se: `<p>Geometri kodunda birim ve koordinat sistemi karışıklığı (x/y, satır/sütun, derece/radyan) en sık hata kaynağıdır.</p>
<ul><li>Gidiş-dönüş testi yaz: bir noktayı H ile götür, H⁻¹ ile geri getir; aynı nokta olmalı.</li><li>Dört köşenin hedefe tam oturduğunu sınayan bir test, köşe sıralama hatalarını anında yakalar.</li></ul>`,
      quiz: [
        { q: 'Bir homografiyi (3×3, ölçek serbest) çözmek için en az kaç nokta çifti gerekir?', options: ['2', '3', '4', '8'], answer: 2, why: 'H\'nin 8 serbest değeri vardır; her nokta çifti iki denklem verir: 4 çift.' },
        { q: 'warpAffine neden ters eşleme kullanır?', options: ['Daha az bellek için', 'Her hedef piksele bir değer düşsün, delik kalmasın diye', 'Renkleri korumak için', 'Hızlı olduğu için'], answer: 1, why: 'İleri eşlemede bazı hedef piksellere hiç kaynak düşmez; tersten giderek her hedef piksel örneklenir.' },
        { q: 'Afin dönüşüm hangi özelliği korur?', options: ['Açıları', 'Uzunlukları', 'Paralel doğruların paralelliğini', 'Perspektifi'], answer: 2, why: 'Afin dönüşüm doğruları doğruya, paralelleri paralele götürür; açı ve uzunluk değişebilir.' },
        { q: 'Eğik çekilmiş bir sayfayı düzlemek için hangisi gerekir?', options: ['getRotationMatrix2D', 'getAffineTransform', 'getPerspectiveTransform', 'resize'], answer: 2, why: 'Sayfa yamuk göründüğünden paralellik bozulmuştur; yalnız homografi düzeltebilir.' },
      ],
    },
    en: {
      title: 'Geometric and perspective transforms: rotate, scale, flatten',
      summary: 'The affine matrix (2×3), getRotationMatrix2D, interpolation; homography (3×3), four point pairs and flattening a document.',
      goals: ['Write rotation, scaling and translation as one 2×3 affine matrix', 'Explain why inverse mapping and interpolation are needed', 'Solve a 3×3 homography from four point pairs', 'Flatten a document shot at an angle as if seen from above'],
      notes: `<p>A geometric transform changes not the <b>values</b> of pixels but <b>where</b> they are. An affine transform keeps lines straight and parallels parallel and is written as a 2×3 matrix:</p>
<div class="eq">[x′; y′] = [a b t<sub>x</sub>; c d t<sub>y</sub>] · [x; y; 1]</div>
<p><code>cv2.getRotationMatrix2D(centre, angle, scale)</code> gives this matrix; in OpenCV a positive angle is counter-clockwise. An affine transform can also be found from three point pairs (<code>getAffineTransform</code>).</p>
<h3>Inverse mapping and interpolation</h3>
<p><code>warpAffine</code> takes every <b>destination</b> pixel back to the source with the inverse matrix and samples there; forward mapping would leave holes in the destination. The source position is usually not an integer: <b>nearest neighbour</b> is fast but gives jagged edges, <b>bilinear</b> is a weighted mean of four neighbours and smoother.</p>
<h3>Perspective (homography)</h3>
<p>Looking at a plane at an angle, a rectangle appears as a trapezoid; parallelism is lost. A 3×3 <b>homography</b> fixes this: <i>[x′w; y′w; w] = H·[x; y; 1]</i>. H has 8 free values; four point pairs (two equations each) are enough: <code>getPerspectiveTransform</code>. A document scanner finds four corners, orders them top-left, top-right, bottom-right, bottom-left and maps them to the target rectangle.</p>`,
      code: [warpPy('en'), perspectivePy('en')],
      lab: 'In the transform tool set the angle to 30° and the scale to 1.5 and check how the matrix entries a and b relate to cos and sin. Switch interpolation to nearest neighbour and see the steps on the star\'s edge. In the perspective tool find the corners, then deliberately move one corner by 15 px: what happened to the lines in the flattened document? Upload a photo of a page you shot at an angle and place the corners by hand.',
      pitfalls: ['Mixing up the corner order: if the four points are mapped crosswise the result comes out flipped or bow-tie shaped. Sort them first.', 'Passing (height, width) to warpAffine: dsize is (width, height).', 'Not noticing that rotation cuts off the corners: compute the new size from cos/sin and adjust the matrix\'s translation.', 'Trying to fix perspective with an affine transform: affine keeps parallels, it cannot straighten a trapezoidal page.'],
      se: `<p>In geometry code, mixing up units and coordinate systems (x/y, row/column, degrees/radians) is the most common source of bugs.</p>
<ul><li>Write a round-trip test: map a point with H, bring it back with H⁻¹; it must be the same point.</li><li>A test that checks the four corners land exactly on the target catches corner-ordering bugs immediately.</li></ul>`,
      quiz: [
        { q: 'At least how many point pairs are needed to solve a homography (3×3, up to scale)?', options: ['2', '3', '4', '8'], answer: 2, why: 'H has 8 free values; each point pair gives two equations: 4 pairs.' },
        { q: 'Why does warpAffine use inverse mapping?', options: ['To use less memory', 'So that every destination pixel gets a value and no holes remain', 'To preserve colours', 'Because it is faster'], answer: 1, why: 'With forward mapping some destination pixels receive no source; going backwards samples every destination pixel.' },
        { q: 'Which property does an affine transform preserve?', options: ['Angles', 'Lengths', 'The parallelism of parallel lines', 'Perspective'], answer: 2, why: 'An affine transform maps lines to lines and parallels to parallels; angles and lengths can change.' },
        { q: 'What do you need to flatten a page shot at an angle?', options: ['getRotationMatrix2D', 'getAffineTransform', 'getPerspectiveTransform', 'resize'], answer: 2, why: 'The page looks like a trapezoid so parallelism is lost; only a homography can fix it.' },
      ],
    },
  },
  {
    n: 10, tools: ['features'],
    tr: {
      title: 'Öznitelik algılama ve eşleştirme: Harris, ORB, RANSAC',
      summary: 'Köşe nedir, Harris yanıtı, anahtar nokta ve betimleyici, ikili betimleyici ve Hamming uzaklığı, oran testi, RANSAC.',
      goals: ['Köşenin kenardan ve düz bölgeden farkını yapı tensörüyle açıklamak', 'Anahtar nokta ile betimleyicinin farkını söylemek', 'İkili betimleyicileri Hamming uzaklığı ve oran testiyle eşleştirmek', 'RANSAC ile yanlış eşleşmelere rağmen dönüşümü bulmak'],
      notes: `<p>İki görüntüde aynı noktayı bulmak; panorama, nesne tanıma, görsel odometri ve SLAM\'in temelidir. Düz bölgeler ve düz kenarlar bunun için kötüdür (kenar boyunca kayınca görüntü değişmez); <b>köşeler</b> her yönde değişir.</p>
<h3>Harris</h3>
<p>Bir penceredeki gradyanlardan yapı tensörü kurulur: <i>M = Σ w·[I<sub>x</sub>² I<sub>x</sub>I<sub>y</sub>; I<sub>x</sub>I<sub>y</sub> I<sub>y</sub>²]</i>. İki özdeğer de büyükse köşe, biri büyükse kenar, ikisi küçükse düz bölge vardır. Özdeğer hesaplamadan:</p>
<div class="eq">R = det(M) − k · iz(M)² &nbsp; (k ≈ 0,04–0,06)</div>
<p>R büyük pozitifse köşe, negatifse kenar. Yerel en büyükler anahtar nokta olur.</p>
<h3>Betimleyici ve eşleştirme</h3>
<p>Anahtar nokta "nerede" sorusunu, <b>betimleyici</b> "neye benziyor" sorusunu yanıtlar. <b>ORB</b>, FAST köşelerini bulur, yamanın yoğunluk merkezinden bir yön hesaplar ve yamayı o yöne döndürüp 256 piksel çiftini karşılaştırır (BRIEF): 256 bitlik bir parmak izi. İki betimleyici arasındaki uzaklık farklı bit sayısıdır (<b>Hamming</b>), XOR ve bit sayımıyla çok hızlıdır. Belirsiz eşleşmeleri atmak için <b>oran testi</b>: en yakın komşu, ikinci en yakından açıkça yakın olmalı (d₁ &lt; 0,75·d₂).</p>
<h3>RANSAC</h3>
<p>Eşleşmelerin bir kısmı yine de yanlıştır. RANSAC rastgele 4 eşleşme seçer, homografiyi çözer, kaç eşleşmenin bu modele uyduğunu sayar; en çok "iç nokta" toplayan modeli tutar. Yanlış eşleşmeler en küçük kareler gibi her şeyi bozmaz, yalnız dışarıda kalır.</p>`,
      code: [featuresPy('tr')],
      lab: 'Öznitelik aracında sağdaki görüntü soldakinin döndürülmüş kopyası. Açıyı 0, 20 ve 45 derece yap; her birinde eşleşme sayısını ve RANSAC iç nokta oranını yaz. Oran testini 0,6\'dan 0,95\'e kaydır: eşleşme sayısı ve doğruluk nasıl değişti? Harris k değerini 0,04\'ten 0,15\'e çıkarınca köşe sayısına ne oldu?',
      pitfalls: ['İkili betimleyicileri (ORB, BRIEF) Öklid uzaklığıyla eşleştirmek: NORM_HAMMING gerekir.', 'Oran testini atlamak: tekrarlayan desenlerde (karo, pencere) yanlış eşleşmeler çoğalır.', 'Dönüşümü RANSAC olmadan en küçük karelerle çözmek: tek bir yanlış eşleşme sonucu büyük ölçüde kaydırır.', 'Dokusuz yüzeylerde (beyaz duvar) öznitelik beklemek: köşe yoksa eşleşme de yoktur.'],
      se: `<p>RANSAC rastgeledir; aynı girdi farklı çalıştırmalarda farklı sonuç verebilir. Test edilebilirlik için <b>tohumu sabitle</b>.</p>
<ul><li>Rastgele sayı üretecini dışarıdan ver (bağımlılık enjeksiyonu); testte sabit tohum, üretimde gerçek rastgelelik.</li><li>Sonucu tek bir sayı yerine dağılımla değerlendir: 100 çalıştırmada iç nokta oranının alt yüzdeliği.</li></ul>`,
      quiz: [
        { q: 'Harris yanıtı R büyük ve negatifse o bölge nedir?', options: ['Köşe', 'Kenar', 'Düz bölge', 'Gürültü'], answer: 1, why: 'Bir özdeğer büyük, öbürü küçükse det küçük, iz büyüktür; R = det − k·iz² negatif olur: kenar.' },
        { q: 'ORB betimleyicileri hangi uzaklıkla karşılaştırılır?', options: ['Öklid', 'Manhattan', 'Hamming', 'Kosinüs'], answer: 2, why: 'ORB ikili (bit dizisi) betimleyicidir; farklı bit sayısı XOR ve bit sayımıyla hızla bulunur.' },
        { q: 'Lowe oran testi neyi eler?', options: ['Hızlı eşleşmeleri', 'En yakın ile ikinci en yakın komşusu birbirine çok yakın olan belirsiz eşleşmeleri', 'Köşeleri', 'Dönmüş görüntüleri'], answer: 1, why: 'd₁ ≈ d₂ ise nokta iki adaya da benzer; bu belirsiz eşleşme muhtemelen yanlıştır.' },
        { q: 'RANSAC neden yanlış eşleşmelere dayanıklıdır?', options: ['Tüm eşleşmelerin ortalamasını alır', 'Az sayıda rastgele örnekten model kurup modele uyan eşleşmeleri sayar; aykırılar modeli belirlemez', 'Yanlış eşleşmeleri görüntüden siler', 'Daha çok köşe bulur'], answer: 1, why: 'Doğru eşleşmelerden kurulan model çok iç nokta toplar; aykırılar ancak tesadüfen seçilir ve az destek bulur.' },
      ],
    },
    en: {
      title: 'Feature detection and matching: Harris, ORB, RANSAC',
      summary: 'What a corner is, the Harris response, keypoints and descriptors, binary descriptors and Hamming distance, the ratio test, RANSAC.',
      goals: ['Explain the difference between a corner, an edge and a flat region with the structure tensor', 'Tell a keypoint from a descriptor', 'Match binary descriptors with Hamming distance and the ratio test', 'Find the transform with RANSAC despite wrong matches'],
      notes: `<p>Finding the same point in two images is the basis of panoramas, object recognition, visual odometry and SLAM. Flat regions and straight edges are bad for this (sliding along an edge does not change the image); <b>corners</b> change in every direction.</p>
<h3>Harris</h3>
<p>A structure tensor is built from the gradients in a window: <i>M = Σ w·[I<sub>x</sub>² I<sub>x</sub>I<sub>y</sub>; I<sub>x</sub>I<sub>y</sub> I<sub>y</sub>²]</i>. If both eigenvalues are large it is a corner, if one is large an edge, if both are small a flat region. Without computing eigenvalues:</p>
<div class="eq">R = det(M) − k · trace(M)² &nbsp; (k ≈ 0.04–0.06)</div>
<p>Large positive R means a corner, negative an edge. Local maxima become keypoints.</p>
<h3>Descriptor and matching</h3>
<p>A keypoint answers "where", a <b>descriptor</b> answers "what does it look like". <b>ORB</b> finds FAST corners, computes an orientation from the patch\'s intensity centroid, rotates the patch to that orientation and compares 256 pixel pairs (BRIEF): a 256-bit fingerprint. The distance between two descriptors is the number of differing bits (<b>Hamming</b>), very fast with XOR and a bit count. To drop ambiguous matches use the <b>ratio test</b>: the nearest neighbour must be clearly closer than the second nearest (d₁ &lt; 0.75·d₂).</p>
<h3>RANSAC</h3>
<p>Some matches are still wrong. RANSAC picks 4 random matches, solves the homography, counts how many matches fit the model and keeps the model with the most "inliers". Wrong matches do not spoil everything as in least squares; they just stay outside.</p>`,
      code: [featuresPy('en')],
      lab: 'In the features tool the right image is a rotated copy of the left. Set the angle to 0, 20 and 45 degrees; write down the number of matches and the RANSAC inlier ratio for each. Slide the ratio test from 0.6 to 0.95: how did the match count and accuracy change? What happened to the corner count when you raised Harris k from 0.04 to 0.15?',
      pitfalls: ['Matching binary descriptors (ORB, BRIEF) with Euclidean distance: you need NORM_HAMMING.', 'Skipping the ratio test: on repeating patterns (tiles, windows) wrong matches multiply.', 'Solving the transform with least squares without RANSAC: a single wrong match shifts the result a lot.', 'Expecting features on textureless surfaces (a white wall): no corners, no matches.'],
      se: `<p>RANSAC is random; the same input can give different results on different runs. For testability, <b>fix the seed</b>.</p>
<ul><li>Pass the random number generator in from outside (dependency injection); a fixed seed in tests, real randomness in production.</li><li>Judge the result by a distribution rather than a single number: the lower percentile of the inlier ratio over 100 runs.</li></ul>`,
      quiz: [
        { q: 'If the Harris response R is large and negative, what is the region?', options: ['A corner', 'An edge', 'A flat region', 'Noise'], answer: 1, why: 'With one large and one small eigenvalue, det is small and the trace large; R = det − k·trace² is negative: an edge.' },
        { q: 'Which distance is used to compare ORB descriptors?', options: ['Euclidean', 'Manhattan', 'Hamming', 'Cosine'], answer: 2, why: 'ORB is a binary (bit string) descriptor; the number of differing bits is found quickly with XOR and a bit count.' },
        { q: 'What does Lowe\'s ratio test remove?', options: ['Fast matches', 'Ambiguous matches whose nearest and second-nearest neighbours are very close', 'Corners', 'Rotated images'], answer: 1, why: 'If d₁ ≈ d₂ the point resembles both candidates; such an ambiguous match is probably wrong.' },
        { q: 'Why is RANSAC robust to wrong matches?', options: ['It averages all matches', 'It builds models from a few random samples and counts the matches that fit; outliers do not determine the model', 'It deletes wrong matches from the image', 'It finds more corners'], answer: 1, why: 'A model built from correct matches gathers many inliers; outliers are only picked by chance and find little support.' },
      ],
    },
  },
  {
    n: 11, tools: ['haar', 'facecam'],
    tr: {
      title: 'Yüz ve insan algılama: Haar kademesi, HOG ve modern algılayıcılar',
      summary: 'Integral görüntü, Haar benzeri öznitelikler, kayan pencere ve kademe, NMS; HOG + SVM ile insan; cihaz içi derin ağlar (MediaPipe).',
      goals: ['Integral görüntüyle herhangi bir dikdörtgen toplamının dört okumayla bulunduğunu göstermek', 'Kayan pencere, ölçek piramidi ve kademenin (cascade) neden hızlı olduğunu açıklamak', 'Örtüşen bulguları birleştirmek (minNeighbors, NMS)', 'Klasik algılayıcıları modern derin ağlarla doğruluk, hız ve gizlilik açısından karşılaştırmak'],
      notes: `<p>2001\'de Viola ve Jones yüzü gerçek zamanlı bulan ilk yöntemi yayımladı; bugün hâlâ <code>cv2.CascadeClassifier</code> olarak OpenCV\'dedir. Üç fikirden oluşur.</p>
<h3>1. Integral görüntü</h3>
<p>I(x, y), sol üst köşeden (x, y)\'ye kadar olan dikdörtgenin toplamıdır. Herhangi bir dikdörtgenin toplamı <b>dört okumadır</b>:</p>
<div class="eq">Σ<sub>ABCD</sub> = I(D) − I(B) − I(C) + I(A)</div>
<p>Pencere boyu ne olursa olsun maliyet aynıdır.</p>
<h3>2. Haar benzeri öznitelikler</h3>
<p>Bir öznitelik, açık dikdörtgenlerin ortalaması eksi koyu dikdörtgenlerin ortalamasıdır: "göz bandı yanaklardan koyu", "burun köprüsü gözlerden açık". Gerçek kademede bu öznitelikler AdaBoost ile binlerce aday arasından <b>öğrenilir</b>; oyun alanında üç tanesini elle seçtik.</p>
<h3>3. Kademe</h3>
<p>Pencere birçok konum ve ölçekte gezer: 320×240 bir karede on binlerce pencere. Kademede her aşama ucuz bir testtir; bir aşamayı geçemeyen pencere hemen atılır. Pencerelerin çoğu ilk bir iki aşamada elenir, pahalı aşamalara az pencere ulaşır. Sonunda örtüşen bulgular birleştirilir: <code>minNeighbors</code>, bir bulgunun kabul edilmesi için kaç örtüşen pencere gerektiğidir.</p>
<h3>HOG ve derin ağlar</h3>
<p><b>HOG</b> (yönlü gradyan histogramı) + doğrusal SVM, ayakta insan algılamanın klasik yoludur (<code>HOGDescriptor_getDefaultPeopleDetector</code>). Bugün yüz ve insan algılamada küçük derin ağlar (BlazeFace, MediaPipe, YuNet) kullanılır: yan profile, kötü ışığa ve kısmi örtülmeye çok daha dayanıklıdır ve telefonda bile gerçek zamanlıdır. Aşağıdaki canlı araç, Robotun Gözleri\'ndeki MediaPipe yüz modelini kameranda, <b>cihaz içinde</b> çalıştırır.</p>`,
      code: [integralPy('tr'), haarPy('tr')],
      lab: 'Haar aracında çizgi yüz sahnesini aç ve aşama aşama kaç pencerenin elendiğini oku. "Göz" eşiğini düşürünce yanlış bulgular nerede çıkıyor? Sayfa sahnesine geç: yazı satırları neden yüz sanılıyor? minNeighbors\'ı 1\'den 4\'e çıkar. Sonra canlı yüz algılamayı aç: başını yana çevir, elinle yüzünün yarısını kapat; MediaPipe ne zaman kaybediyor?',
      pitfalls: ['Haar kademesini renkli görüntüde çalıştırmak: gri görüntü ister; önce equalizeHist çoğu zaman yardımcı olur.', 'minNeighbors\'ı 0–1 bırakmak: her yerde yanlış bulgu çıkar. 3–6 tipik.', 'Ön yüz kademesinin yan profili bulmasını beklemek: her kademe yalnız eğitildiği görünüşü bulur.', 'Yüz algılamayı yüz tanımayla karıştırmak: algılama "burada bir yüz var" der, kim olduğunu söylemez. Kişisel veri ve izin kuralları ayrıca geçerlidir.'],
      se: `<p>Algılayıcılar iki tür hata yapar: <b>yanlış pozitif</b> (olmayan yüz) ve <b>yanlış negatif</b> (kaçan yüz). Hangisinin daha pahalı olduğu uygulamaya bağlıdır.</p>
<ul><li>Etiketli küçük bir test seti kur ve kesinlik/duyarlılık (precision/recall) hesapla; eşik değişikliklerini bu sayılarla değerlendir.</li><li>Görüntü işleyen her özellik için gizlilik tasarımı: görüntü cihazda kalıyor mu, kaydediliyor mu, kim erişiyor? KVKK açısından yazılı tut.</li></ul>`,
      quiz: [
        { q: 'Integral görüntüyle 50×50 ve 5×5 bir dikdörtgenin toplamını bulmanın maliyeti nasıl karşılaştırılır?', options: ['50×50 olan 100 kat pahalı', 'İkisi de dört okuma', '50×50 olan 10 kat pahalı', 'Integral görüntü küçük dikdörtgenlerde çalışmaz'], answer: 1, why: 'Toplam I(D) − I(B) − I(C) + I(A) ile bulunur; dikdörtgen boyundan bağımsızdır.' },
        { q: 'Kademenin (cascade) hızlı olmasının asıl nedeni nedir?', options: ['GPU kullanması', 'Pencerelerin çoğunun ilk ucuz aşamalarda elenmesi', 'Daha az piksel okuması', 'Renk kullanması'], answer: 1, why: 'Yüz içermeyen pencerelerin büyük çoğunluğu ilk bir iki testte atılır; pahalı testlere az pencere ulaşır.' },
        { q: 'detectMultiScale\'deki minNeighbors artırılınca genellikle ne olur?', options: ['Daha çok yanlış pozitif', 'Daha az yanlış pozitif, bazı gerçek yüzler kaçabilir', 'Algılama hızlanır ve hiçbir şey kaçmaz', 'Görüntü büyür'], answer: 1, why: 'Bir bulgunun kabulü için daha çok örtüşen pencere istenir; tekil yanlış bulgular elenir, zayıf gerçek bulgular da elenebilir.' },
        { q: 'Modern derin ağ tabanlı yüz algılayıcıların Haar kademesine göre en önemli üstünlüğü hangisidir?', options: ['Daha az kod', 'Yan profile, kötü ışığa ve kısmi örtülmeye dayanıklılık', 'Renkli görüntü gerektirmemesi', 'Integral görüntü kullanması'], answer: 1, why: 'Çok çeşitli verilerle eğitilen ağlar, elle tanımlanmış basit karşıtlık özniteliklerinden çok daha genel görünüş değişimlerini yakalar.' },
      ],
    },
    en: {
      title: 'Face and person detection: Haar cascades, HOG and modern detectors',
      summary: 'The integral image, Haar-like features, sliding windows and cascades, NMS; people with HOG + SVM; on-device deep networks (MediaPipe).',
      goals: ['Show that the sum of any rectangle takes four reads with an integral image', 'Explain why sliding windows, scale pyramids and cascades are fast', 'Merge overlapping detections (minNeighbors, NMS)', 'Compare classic detectors with modern deep networks on accuracy, speed and privacy'],
      notes: `<p>In 2001 Viola and Jones published the first method that found faces in real time; it is still in OpenCV as <code>cv2.CascadeClassifier</code>. It consists of three ideas.</p>
<h3>1. The integral image</h3>
<p>I(x, y) is the sum of the rectangle from the top-left corner to (x, y). The sum of any rectangle is <b>four reads</b>:</p>
<div class="eq">Σ<sub>ABCD</sub> = I(D) − I(B) − I(C) + I(A)</div>
<p>The cost is the same whatever the window size.</p>
<h3>2. Haar-like features</h3>
<p>A feature is the mean of the light rectangles minus the mean of the dark ones: "the eye band is darker than the cheeks", "the bridge of the nose is lighter than the eyes". In a real cascade these features are <b>learned</b> from thousands of candidates with AdaBoost; in the playground we picked three by hand.</p>
<h3>3. The cascade</h3>
<p>The window visits many positions and scales: tens of thousands of windows in a 320×240 frame. In a cascade each stage is a cheap test; a window that fails a stage is dropped at once. Most windows are rejected in the first one or two stages and few reach the expensive ones. Finally overlapping detections are merged: <code>minNeighbors</code> is how many overlapping windows a detection needs to be accepted.</p>
<h3>HOG and deep networks</h3>
<p><b>HOG</b> (histogram of oriented gradients) + a linear SVM is the classic way to detect standing people (<code>HOGDescriptor_getDefaultPeopleDetector</code>). Today small deep networks (BlazeFace, MediaPipe, YuNet) are used for faces and people: far more robust to profiles, poor light and partial occlusion, and real-time even on a phone. The live tool below runs the MediaPipe face model from Robot Eyes on your camera, <b>on your device</b>.</p>`,
      code: [integralPy('en'), haarPy('en')],
      lab: 'In the Haar tool open the cartoon face and read how many windows are rejected at each stage. When you lower the "eyes" threshold, where do false detections appear? Switch to the page scene: why are lines of text taken for faces? Raise minNeighbors from 1 to 4. Then turn on live face detection: turn your head to the side, cover half your face with your hand; when does MediaPipe lose you?',
      pitfalls: ['Running a Haar cascade on a colour image: it wants gray; equalizeHist first often helps.', 'Leaving minNeighbors at 0–1: false detections everywhere. 3–6 is typical.', 'Expecting a frontal-face cascade to find profiles: each cascade only finds the view it was trained on.', 'Confusing face detection with face recognition: detection says "there is a face here", not who it is. Personal data and consent rules apply separately.'],
      se: `<p>Detectors make two kinds of errors: <b>false positives</b> (a face that is not there) and <b>false negatives</b> (a missed face). Which is more expensive depends on the application.</p>
<ul><li>Build a small labelled test set and compute precision/recall; judge threshold changes by these numbers.</li><li>Privacy by design for every feature that processes images: does the image stay on the device, is it stored, who can access it? Write it down with data protection law in mind.</li></ul>`,
      quiz: [
        { q: 'With an integral image, how does the cost of summing a 50×50 rectangle compare with a 5×5 one?', options: ['The 50×50 one is 100 times more expensive', 'Both are four reads', 'The 50×50 one is 10 times more expensive', 'Integral images do not work for small rectangles'], answer: 1, why: 'The sum is I(D) − I(B) − I(C) + I(A); independent of the rectangle\'s size.' },
        { q: 'What is the main reason a cascade is fast?', options: ['It uses the GPU', 'Most windows are rejected in the first cheap stages', 'It reads fewer pixels', 'It uses colour'], answer: 1, why: 'The vast majority of windows without a face are dropped after one or two tests; few windows reach the expensive tests.' },
        { q: 'What usually happens when minNeighbors in detectMultiScale is increased?', options: ['More false positives', 'Fewer false positives, some real faces may be missed', 'Detection gets faster and nothing is missed', 'The image grows'], answer: 1, why: 'More overlapping windows are required to accept a detection; isolated false detections are dropped, and so may weak real ones.' },
        { q: 'What is the main advantage of modern deep-network face detectors over a Haar cascade?', options: ['Less code', 'Robustness to profiles, poor light and partial occlusion', 'They do not need colour images', 'They use an integral image'], answer: 1, why: 'Networks trained on very varied data capture far more general appearance changes than simple hand-defined contrast features.' },
      ],
    },
  },
  {
    n: 12, tools: ['bgsub'],
    tr: {
      title: 'Video ve arka plan çıkarma: hareket, leke, iz ve sayım',
      summary: 'VideoCapture döngüsü, kare farkı, kayan ortalama arka plan ve MOG2, maske temizliği, leke izleme ve çizgi sayacı.',
      goals: ['Bir video döngüsü kurup kare başına süreyi ölçmek', 'Kare farkı ile arka plan modeli arasındaki farkı açıklamak', 'Kayan ortalama ve MOG2\'nin öğrenme oranını ayarlamak', 'Ön plan lekelerini en yakın komşuyla izleyip çizgiyi geçenleri bir kez saymak'],
      notes: `<p>Video, saniyede 25–60 karelik bir görüntü dizisidir; <code>cv2.VideoCapture</code> her <code>read()</code> çağrısında bir kare verir. Sabit bir kamerada hareket eden şeyleri bulmanın en ucuz yolu <b>arka planı bilmek</b> ve ondan farkı almaktır.</p>
<h3>Kare farkı ve arka plan modeli</h3>
<p><b>Kare farkı</b> |f<sub>t</sub> − f<sub>t−1</sub>| hareketi bulur ama duran bir nesne hemen kaybolur ve tek renkli bir aracın yalnız ön ve arka kenarı çıkar. <b>Kayan ortalama</b> arka planı yavaşça öğrenir:</p>
<div class="eq">B ← (1 − α) · B + α · f &nbsp;&nbsp; ön plan: |f − B| &gt; eşik</div>
<p>α küçükse arka plan yavaş uyum sağlar (park eden araç uzun süre ön planda kalır), büyükse yavaş giden nesne arka plana karışır. Seçici güncelleme, ön plan piksellerinde çok küçük α kullanır. <b>MOG2</b> her piksel için birkaç Gauss\'luk bir karışım tutar: sallanan yaprak gibi çok kipli arka planları ve gölgeleri (ayrı bir gri değerle) tanır.</p>
<h3>Maskeden sayıma</h3>
<ol><li>Maskeyi açma/kapama ile temizle, bağlı bileşenleri (lekeleri) bul, küçükleri at.</li><li><b>İzleme</b>: her lekeyi bir önceki karedeki en yakın ize bağla; eşleşmeyen leke yeni iz, birkaç kare görünmeyen iz silinir.</li><li><b>Sayım</b>: bir izin önceki ve şimdiki merkezi çizginin iki yanındaysa +1; her iz yalnız bir kez sayılır.</li></ol>
<p>Bu hat Gerçek Hayat Demoları\'ndaki trafik sayacıyla aynı fonksiyonları kullanır.</p>`,
      code: [videoLoopPy('tr'), bgsubPy('tr')],
      lab: 'Trafik sahnesinde öğrenme oranını 0,002, 0,05 ve 0,3 yap ve araçların maskede nasıl göründüğünü karşılaştır. Seçici güncellemeyi kapatınca yavaş araçlara ne oluyor? Eşiği 10\'a indir ve gürültüyü 15 yap: sayaç neden şaşıyor, morfolojiyle düzeltebiliyor musun? Bir dakikada iki yönde kaç araç geçtiğini yaz ve sahnedeki gerçek sayıyla karşılaştır.',
      pitfalls: ['Kameranın kendisi hareket ederken arka plan çıkarma kullanmak: tüm görüntü ön plan olur; önce görüntüyü sabitlemek (öznitelik + homografi) gerekir.', 'Öğrenme oranını çok büyük seçmek: duran ya da yavaş nesneler birkaç saniyede arka plana karışır.', 'Gölgeleri nesne saymak: MOG2\'de detectShadows=True ile gölge 127 değerini alır; eşiği 200 yap.', 'Aynı izi her karede yeniden saymak: iz başına "sayıldı" bayrağı tut.'],
      se: `<p>Video işleme gerçek zamanlı bir sistemdir: <b>gecikme bütçesi</b> ve <b>kare düşürme politikası</b> tasarımın parçasıdır.</p>
<ul><li>Kare başına süreyi ölç, ortalamayı ve 99. yüzdeliği kaydet; 33 ms\'yi aşan kareleri say.</li><li>Kayıtlı bir test videosu ve beklenen sayım değeri tut; değişikliklerde sayımın ±1 içinde kaldığını CI\'da sına (tarayıcıdaki sahne de bu yüzden tohumlu ve deterministiktir).</li></ul>`,
      quiz: [
        { q: 'Kayan ortalama arka planda α çok büyük seçilirse ne olur?', options: ['Arka plan hiç güncellenmez', 'Yavaş hareket eden ya da duran nesneler hızla arka plana karışır', 'Gürültü azalır', 'Gölgeler kaybolur'], answer: 1, why: 'Büyük α son karelere çok ağırlık verir; birkaç kare duran nesne arka planın parçası olur.' },
        { q: 'Kare farkı yönteminin tek renkli, büyük bir araçta sorunu nedir?', options: ['Aracın yalnız ön ve arka kenarları ön plan çıkar', 'Araç hiç görünmez', 'Renkleri değiştirir', 'Çok yavaştır'], answer: 0, why: 'Aracın iç bölgesi ardışık iki karede aynı renkte olduğundan fark sıfırdır.' },
        { q: 'Çizgi sayacında bir aracın iki kez sayılmasını ne önler?', options: ['Daha büyük eşik', 'Her ize "sayıldı" bayrağı koymak ve geçişi önceki/şimdiki konumla bulmak', 'Daha küçük görüntü', 'Kare farkı'], answer: 1, why: 'İz bir kez çizgiyi geçtiğinde işaretlenir; sonraki karelerde yeniden sayılmaz.' },
        { q: 'MOG2\'nin kayan ortalamaya göre üstünlüğü nedir?', options: ['Daha az bellek', 'Her piksel için birden çok kipli arka plan modeli ve gölge tanıma', 'Kamerayı sabitler', 'Renkli görüntüyü griye çevirir'], answer: 1, why: 'Gauss karışımı, sallanan dal ya da yanıp sönen ışık gibi birden çok değer arasında gidip gelen arka planı modelleyebilir.' },
      ],
    },
    en: {
      title: 'Video and background subtraction: motion, blobs, tracks and counting',
      summary: 'The VideoCapture loop, frame differencing, running-average backgrounds and MOG2, mask clean-up, blob tracking and a line counter.',
      goals: ['Build a video loop and measure the time per frame', 'Explain the difference between frame differencing and a background model', 'Tune the learning rate of a running average and MOG2', 'Track foreground blobs by nearest neighbour and count each line crossing once'],
      notes: `<p>A video is a sequence of 25–60 images per second; <code>cv2.VideoCapture</code> returns one frame per <code>read()</code> call. The cheapest way to find moving things with a fixed camera is to <b>know the background</b> and take the difference from it.</p>
<h3>Frame differencing and background models</h3>
<p><b>Frame differencing</b> |f<sub>t</sub> − f<sub>t−1</sub>| finds motion, but a stopped object vanishes at once and only the front and back edges of a single-coloured car show up. A <b>running average</b> learns the background slowly:</p>
<div class="eq">B ← (1 − α) · B + α · f &nbsp;&nbsp; foreground: |f − B| &gt; threshold</div>
<p>With a small α the background adapts slowly (a parked car stays foreground for a long time); with a large one a slow object blends into the background. Selective updating uses a very small α on foreground pixels. <b>MOG2</b> keeps a mixture of a few Gaussians per pixel: it handles multi-modal backgrounds such as swaying leaves and recognises shadows (with a separate gray value).</p>
<h3>From mask to count</h3>
<ol><li>Clean the mask with opening/closing, find connected components (blobs), drop the small ones.</li><li><b>Tracking</b>: attach each blob to the nearest track from the previous frame; an unmatched blob starts a new track, a track unseen for a few frames is deleted.</li><li><b>Counting</b>: if a track\'s previous and current centres are on different sides of the line, +1; each track is counted only once.</li></ol>
<p>This pipeline uses the same functions as the traffic counter in Real-Life Demos.</p>`,
      code: [videoLoopPy('en'), bgsubPy('en')],
      lab: 'In the traffic scene set the learning rate to 0.002, 0.05 and 0.3 and compare how the cars look in the mask. What happens to slow cars when selective updating is off? Lower the threshold to 10 and raise the noise to 15: why does the counter go wrong, and can you fix it with morphology? Write down how many cars pass in each direction in one minute and compare with the true count in the scene.',
      pitfalls: ['Using background subtraction while the camera itself moves: the whole image becomes foreground; stabilise first (features + homography).', 'Choosing too large a learning rate: stopped or slow objects blend into the background within seconds.', 'Counting shadows as objects: with detectShadows=True in MOG2 shadows get the value 127; threshold at 200.', 'Counting the same track again every frame: keep a "counted" flag per track.'],
      se: `<p>Video processing is a real-time system: a <b>latency budget</b> and a <b>frame-dropping policy</b> are part of the design.</p>
<ul><li>Measure the time per frame and log the mean and the 99th percentile; count frames over 33 ms.</li><li>Keep a recorded test video and the expected count; in CI check that the count stays within ±1 after changes (that is also why the browser scene is seeded and deterministic).</li></ul>`,
      quiz: [
        { q: 'What happens if α is chosen too large in a running-average background?', options: ['The background never updates', 'Slow or stopped objects quickly blend into the background', 'Noise decreases', 'Shadows disappear'], answer: 1, why: 'A large α gives the latest frames a lot of weight; an object that stops for a few frames becomes part of the background.' },
        { q: 'What is the problem with frame differencing on a large, single-coloured car?', options: ['Only the front and back edges of the car come out as foreground', 'The car is not visible at all', 'It changes the colours', 'It is very slow'], answer: 0, why: 'The inside of the car has the same colour in consecutive frames, so the difference is zero.' },
        { q: 'In a line counter, what prevents a car from being counted twice?', options: ['A higher threshold', 'A "counted" flag per track and detecting the crossing from the previous/current position', 'A smaller image', 'Frame differencing'], answer: 1, why: 'The track is marked once it crosses the line and is not counted again in later frames.' },
        { q: 'What is MOG2\'s advantage over a running average?', options: ['Less memory', 'A multi-modal background model per pixel and shadow detection', 'It stabilises the camera', 'It converts colour to gray'], answer: 1, why: 'A Gaussian mixture can model a background that alternates between several values, such as a swaying branch or a flickering light.' },
      ],
    },
  },
]
