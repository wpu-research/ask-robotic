// OpenCV dersi tarayıcı araçlarının kimlikleri, başlık ve açıklamaları (TR/EN). Araçların kendisi components/opencv'de,
// görüntü işleme mantığı lib/opencv/ops.ts, contours.ts, geom.ts, features.ts'te (saf, testli).
export type CvToolId =
  | 'channels' | 'point' | 'threshold' | 'filter' | 'edges' | 'morph' | 'contours' | 'color'
  | 'warp' | 'perspective' | 'camera3d' | 'features' | 'haar' | 'facecam' | 'bgsub' | 'scanner'

interface Text { title: string; desc: string }

export const CV_TOOL_META: Record<CvToolId, { tr: Text; en: Text }> = {
  channels: {
    tr: { title: 'Piksel ve kanal gezgini', desc: 'Görüntü bir sayı dizisidir: yükseklik × genişlik × 3. Bir kanal seç (B, G, R, gri, H, S, V) ve görüntünün üstünde gez: imlecin altındaki pikselin BGR ve HSV değerleri sağda.' },
    en: { title: 'Pixel and channel explorer', desc: 'An image is an array of numbers: height × width × 3. Pick a channel (B, G, R, gray, H, S, V) and move over the image: the BGR and HSV values of the pixel under the pointer are on the right.' },
  },
  point: {
    tr: { title: 'Parlaklık, karşıtlık, gama ve histogram', desc: 'Her piksel kendi başına dönüşür: g = α·f + β, sonra gama. Histogram altta: önce (gri) ve sonra (renkli). Histogram eşitlemeyi açıp dar bir histogramın nasıl yayıldığını gör.' },
    en: { title: 'Brightness, contrast, gamma and histogram', desc: 'Each pixel is transformed on its own: g = α·f + β, then gamma. The histogram is below: before (gray) and after (coloured). Turn on histogram equalisation and watch a narrow histogram spread out.' },
  },
  threshold: {
    tr: { title: 'Eşikleme: sabit, Otsu, uyarlamalı', desc: 'Gri görüntüyü siyah-beyaza çevir. Sabit eşikte değeri sen seçersin; Otsu histogramdan sınıflar arası varyansı en büyük yapan eşiği bulur; uyarlamalı eşik her pikseli kendi komşuluğunun ortalamasıyla karşılaştırır, düzensiz aydınlatmada kazanır.' },
    en: { title: 'Thresholding: fixed, Otsu, adaptive', desc: 'Turn a gray image into black and white. With a fixed threshold you choose the value; Otsu finds the threshold that maximises between-class variance from the histogram; adaptive thresholding compares each pixel with the mean of its own neighbourhood and wins under uneven lighting.' },
  },
  filter: {
    tr: { title: 'Evrişim ve filtreler', desc: 'Bir çekirdek görüntü üstünde kayar, her konumda ağırlıklı toplam alır. Gürültü ekle (tuz-biber ya da Gauss) ve kutu, Gauss, medyan ve keskinleştirme filtrelerini karşılaştır. Çekirdeğin sayıları sağda.' },
    en: { title: 'Convolution and filters', desc: 'A kernel slides over the image and takes a weighted sum at each position. Add noise (salt-and-pepper or Gaussian) and compare box, Gaussian, median and sharpening filters. The kernel numbers are on the right.' },
  },
  edges: {
    tr: { title: 'Kenar algılama: Sobel ve Canny', desc: 'Sobel yatay ve dikey türevi verir; büyüklük ve yön kenarı tarif eder. Canny dört adımdır: Gauss yumuşatma, Sobel gradyanı, maksimum olmayanı bastırma ve iki eşikli histerezis. Eşikleri değiştir, kopuk kenarların nasıl birleştiğine bak.' },
    en: { title: 'Edge detection: Sobel and Canny', desc: 'Sobel gives the horizontal and vertical derivatives; magnitude and direction describe the edge. Canny is four steps: Gaussian smoothing, Sobel gradient, non-maximum suppression and two-threshold hysteresis. Change the thresholds and watch broken edges join up.' },
  },
  morph: {
    tr: { title: 'Morfolojik işlemler', desc: 'İkili görüntüde yapı elemanıyla aşındırma ve genişletme; bunların sırası açma (küçük gürültüyü siler) ve kapamayı (delikleri doldurur) verir. Çekirdek biçimini ve boyutunu, yineleme sayısını değiştir.' },
    en: { title: 'Morphological operations', desc: 'Erosion and dilation of a binary image with a structuring element; their order gives opening (removes small noise) and closing (fills holes). Change the kernel shape and size and the number of iterations.' },
  },
  contours: {
    tr: { title: 'Konturlar ve şekil öznitelikleri', desc: 'Eşiklenmiş görüntüde her nesnenin dış sınırı bulunur. Alan, çevre, dairesellik (4πA/P²), sınırlayıcı kutu ve çokgen yaklaşımındaki köşe sayısı sağdaki tabloda; köşe sayısına göre şekil adı tahmin edilir.' },
    en: { title: 'Contours and shape features', desc: 'The outer boundary of each object in the thresholded image is found. Area, perimeter, circularity (4πA/P²), bounding box and the vertex count of the polygon approximation are in the table; a shape name is guessed from the vertex count.' },
  },
  color: {
    tr: { title: 'HSV renk segmentasyonu ve takip', desc: 'Renk tonu (H), doygunluk (S) ve değer (V) aralığı seç: maske beyaz, en büyük leke kutulanır, merkezinin izi çizilir. Örnek sahnede top hareket eder; ışık değişse de H aralığı BGR\'den çok daha kararlıdır.' },
    en: { title: 'HSV colour segmentation and tracking', desc: 'Choose a hue (H), saturation (S) and value (V) range: the mask is white, the largest blob is boxed and its centre leaves a trail. In the sample scene the ball moves; even when the light changes, a hue range is far more stable than BGR.' },
  },
  warp: {
    tr: { title: 'Geometrik dönüşümler: döndür, ölçekle, kaydır', desc: '2×3 afin matrisi sağda. Açıyı, ölçeği ve kaydırmayı değiştir; ara değerleme (en yakın komşu ya da çift doğrusal) farkını kenarlarda gör.' },
    en: { title: 'Geometric transforms: rotate, scale, translate', desc: 'The 2×3 affine matrix is on the right. Change the angle, scale and shift; see the difference between nearest-neighbour and bilinear interpolation at the edges.' },
  },
  perspective: {
    tr: { title: 'Perspektif düzeltme (belge)', desc: 'Belgenin dört köşesini sürükle ya da "Köşeleri bul" ile otomatik bulmasını iste. 3×3 homografi dört nokta çiftinden çözülür ve belge yukarıdan çekilmiş gibi düzlenir.' },
    en: { title: 'Perspective correction (document)', desc: 'Drag the four corners of the document or let "Find corners" detect them. A 3×3 homography is solved from the four point pairs and the document is flattened as if shot from above.' },
  },
  camera3d: {
    tr: { title: '3B masa ve sanal kamera', desc: 'Masada A4 bir belge ve iğne deliği modeliyle bir kamera. Kamerayı yükselt, döndür, yaklaştır: görüntü bu kameradan gerçekten üretilir (her pikselin ışını masa düzlemiyle kesiştirilir). Sonra köşe bulma ve perspektif düzeltme aynı görüntüye uygulanır; gerçek köşelerle karşılaştırılır.' },
    en: { title: '3D desk and virtual camera', desc: 'An A4 document on a desk and a camera with the pinhole model. Raise, turn and move the camera: the image is really produced from this camera (each pixel\'s ray is intersected with the desk plane). Then corner finding and perspective correction are applied to the same image and compared with the true corners.' },
  },
  features: {
    tr: { title: 'Köşeler ve öznitelik eşleştirme', desc: 'Harris yanıtı köşelerde büyüktür. Sağdaki görüntü soldakinin döndürülmüş ve ölçeklenmiş kopyası; her köşe için ikili (BRIEF benzeri) betimleyici çıkarılır, Hamming uzaklığı ve oran testiyle eşleştirilir.' },
    en: { title: 'Corners and feature matching', desc: 'The Harris response is large at corners. The right image is a rotated and scaled copy of the left; a binary (BRIEF-like) descriptor is computed for each corner and matched by Hamming distance and the ratio test.' },
  },
  haar: {
    tr: { title: 'Haar benzeri öznitelikler ve integral görüntü', desc: 'Viola-Jones fikri: integral görüntüyle herhangi bir dikdörtgenin toplamı dört okumayla bulunur. Üç basit öznitelik (gözler yanaklardan koyu, burun köprüsü gözlerden açık…) kayan pencerede sırayla sınanır; erken eleyen kademe pencerelerin çoğunu ucuza atar.' },
    en: { title: 'Haar-like features and the integral image', desc: 'The Viola-Jones idea: with an integral image the sum of any rectangle takes four reads. Three simple features (eyes darker than cheeks, the bridge of the nose lighter than the eyes…) are tested in turn over a sliding window; an early-rejecting cascade discards most windows cheaply.' },
  },
  facecam: {
    tr: { title: 'Canlı yüz algılama (MediaPipe, cihaz içi)', desc: 'Robotun Gözleri\'ndeki MediaPipe yüz modeli kameranda çalışır; görüntü cihazından çıkmaz. Yüz noktalarından sınırlayıcı kutu ve göz arası uzaklık hesaplanır.' },
    en: { title: 'Live face detection (MediaPipe, on device)', desc: 'The MediaPipe face model from Robot Eyes runs on your camera; the image never leaves your device. A bounding box and the inter-eye distance are computed from the face landmarks.' },
  },
  bgsub: {
    tr: { title: 'Arka plan çıkarma ve sayım', desc: 'Kayan ortalama arka plan modeli; her karede |kare − arka plan| eşiklenir, morfolojiyle temizlenir, lekeler bulunur ve en yakın komşuyla izlenir. Sayım çizgisini geçen her iz bir kez sayılır.' },
    en: { title: 'Background subtraction and counting', desc: 'A running-average background model; each frame |frame − background| is thresholded, cleaned with morphology, blobs are found and tracked by nearest neighbour. Each track that crosses the counting line is counted once.' },
  },
  scanner: {
    tr: { title: 'Belge tarayıcı hattı', desc: 'Bitirme projesinin tamamı: gri → Gauss → Canny → genişletme → en büyük dörtgen kontur → perspektif düzeltme → uyarlamalı eşik. Her aşamayı tek tek gör, parametreleri değiştir, kendi fotoğrafını yükle.' },
    en: { title: 'Document scanner pipeline', desc: 'The whole capstone: gray → Gaussian → Canny → dilation → largest quadrilateral contour → perspective correction → adaptive threshold. See each stage, change the parameters, upload your own photo.' },
  },
}
