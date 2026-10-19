// OpenCV dersinin Python (cv2) kod örnekleri. Kod aynı, yalnız yorumlar dile göre: c(tr, en).
// `run: true` olan bloklar tarayıcıda Pyodide + opencv-python 4.9 ile çalışır: girdi oyun alanındaki görüntüdür
// ('girdi.png', BGR), çıktı 'cikti.png' olarak yazılırsa oyun alanında gösterilir. Bu bloklarda imshow/waitKey yok.
import type { KursCode, Lang } from '@/lib/kurs/types'

type Src = (c: (tr: string, en: string) => string) => string
const block = (lang: Lang, tr: string, en: string, src: Src, run = false): KursCode => {
  const b: KursCode = { title: lang === 'en' ? en : tr, src: src((a, z) => (lang === 'en' ? z : a)) }
  if (run) b.run = true
  return b
}

export const channelsPy = (l: Lang) => block(l, 'Python: görüntü bir NumPy dizisidir', 'Python: an image is a NumPy array', (c) => `import cv2
import numpy as np

img = cv2.imread('girdi.png')                    # ${c('BGR sırasında, uint8', 'BGR order, uint8')}
h, w, ch = img.shape
print('${c('şekil', 'shape')}:', img.shape, 'dtype:', img.dtype)
b, g, r = img[h // 2, w // 2]                    # ${c('satır (y), sonra sütun (x)', 'row (y) first, then column (x)')}
print('${c('orta piksel', 'centre pixel')} B,G,R =', b, g, r)

gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)     # ${c('0.299R + 0.587G + 0.114B', '0.299R + 0.587G + 0.114B')}
hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)       # ${c('H: 0..179, S ve V: 0..255', 'H: 0..179, S and V: 0..255')}
B, G, R = cv2.split(img)
print('${c('ortalama', 'mean')} B/G/R:', B.mean().round(1), G.mean().round(1), R.mean().round(1))
print('${c('ortalama ton (H)', 'mean hue (H)')}:', hsv[..., 0].mean().round(1))

roi = img[h // 4: h // 2, w // 4: w // 2]        # ${c('kesit kopya değil, görünümdür', 'a slice is a view, not a copy')}
out = img.copy()
out[h // 4: h // 2, w // 4: w // 2] = 255 - roi  # ${c('yalnız bölgenin rengini ters çevir', 'invert only the region')}
cv2.rectangle(out, (w // 4, h // 4), (w // 2, h // 2), (0, 0, 255), 2)
cv2.imwrite('cikti.png', out)`, true)

export const pointPy = (l: Lang) => block(l, 'Python: parlaklık, karşıtlık, gama, histogram ve eşitleme', 'Python: brightness, contrast, gamma, histogram and equalisation', (c) => `import cv2
import numpy as np

img = cv2.imread('girdi.png')
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

alpha, beta = 1.4, -30                            # ${c('karşıtlık ve parlaklık', 'contrast and brightness')}
lin = cv2.convertScaleAbs(gray, alpha=alpha, beta=beta)   # ${c('doyuma kırpar, taşmaz', 'saturates, no wrap-around')}

gamma = 0.6                                       # ${c('< 1 karanlıkları açar', '< 1 lifts the shadows')}
lut = np.array([((i / 255.0) ** gamma) * 255 for i in range(256)]).astype(np.uint8)
gam = cv2.LUT(gray, lut)                          # ${c('256 girişlik tablo: hızlı', '256-entry table: fast')}

hist = cv2.calcHist([gray], [0], None, [256], [0, 256]).ravel()
print('${c('en sık gri değer', 'most common gray value')}:', int(hist.argmax()))
eq = cv2.equalizeHist(gray)                       # ${c('birikimli histogramı düzleştirir', 'flattens the cumulative histogram')}
clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8)).apply(gray)
for name, im in [('gray', gray), ('lin', lin), ('gamma', gam), ('eq', eq), ('clahe', clahe)]:
    print(f'{name:6s} min={im.min():3d} max={im.max():3d} std={im.std():5.1f}')
cv2.imwrite('cikti.png', np.hstack([gray, eq, clahe]))`, true)

export const thresholdPy = (l: Lang) => block(l, 'Python: sabit, Otsu ve uyarlamalı eşik', 'Python: fixed, Otsu and adaptive thresholds', (c) => `import cv2
import numpy as np

img = cv2.imread('girdi.png')
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

_, fixed = cv2.threshold(gray, 127, 255, cv2.THRESH_BINARY)
t, otsu = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
print('${c('Otsu eşiği', 'Otsu threshold')}:', t)       # ${c('verilen 0 yok sayılır', 'the 0 given is ignored')}

blur = cv2.GaussianBlur(gray, (5, 5), 0)         # ${c('önce gürültüyü azalt', 'reduce noise first')}
adapt = cv2.adaptiveThreshold(blur, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                              cv2.THRESH_BINARY, 31, 10)   # ${c('blok 31 piksel (tek), C = 10', 'block 31 px (odd), C = 10')}
for name, m in [('fixed', fixed), ('otsu', otsu), ('adaptive', adapt)]:
    print(name, '${c('beyaz oranı', 'white ratio')}:', round((m > 0).mean(), 3))
cv2.imwrite('cikti.png', np.hstack([fixed, otsu, adapt]))`, true)

export const convPy = (l: Lang) => block(l, 'Python: evrişimi elle hesapla ve filter2D ile karşılaştır', 'Python: compute a convolution by hand and compare with filter2D', (c) => `import cv2
import numpy as np

img = cv2.imread('girdi.png')
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY).astype(np.float32)
k = np.array([[0, -1, 0], [-1, 5, -1], [0, -1, 0]], np.float32)   # ${c('keskinleştirme', 'sharpen')}

def conv3(f, k):
    p = np.pad(f, 1, mode='reflect')              # ${c('kenarlar: yansıtma', 'borders: reflect')}
    out = np.zeros_like(f)
    for dy in range(3):
        for dx in range(3):                       # ${c('9 kaydırılmış kopyanın ağırlıklı toplamı', 'weighted sum of 9 shifted copies')}
            out += k[dy, dx] * p[dy: dy + f.shape[0], dx: dx + f.shape[1]]
    return out

mine = conv3(gray, k)
ref = cv2.filter2D(gray, -1, k, borderType=cv2.BORDER_REFLECT_101)
print('${c('en büyük fark', 'max difference')}:', float(np.abs(mine[1:-1, 1:-1] - ref[1:-1, 1:-1]).max()))
cv2.imwrite('cikti.png', np.clip(ref, 0, 255).astype(np.uint8))   # ${c('float sonucu uint8 aralığına kırp', 'clip the float result to uint8')}`, true)

export const filterPy = (l: Lang) => block(l, 'Python: gürültü ekle, dört filtreyi karşılaştır', 'Python: add noise, compare four filters', (c) => `import cv2
import numpy as np

img = cv2.imread('girdi.png')
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
rng = np.random.default_rng(0)
noisy = gray.copy()
m = rng.random(gray.shape)
noisy[m < 0.03] = 0                               # ${c('%3 biber', '3% pepper')}
noisy[m > 0.97] = 255                             # ${c('%3 tuz', '3% salt')}

out = {
    'box': cv2.blur(noisy, (5, 5)),
    'gauss': cv2.GaussianBlur(noisy, (5, 5), 1.2),
    'median': cv2.medianBlur(noisy, 5),           # ${c('tuz-biberde açık ara en iyisi', 'by far the best on salt-and-pepper')}
    'sharp': cv2.filter2D(noisy, -1, np.array([[0, -1, 0], [-1, 5, -1], [0, -1, 0]])),
}
for name, f in out.items():
    print(f'{name:6s} PSNR = {cv2.PSNR(gray, f):5.1f} dB')   # ${c('yüksek PSNR: aslına daha yakın', 'higher PSNR: closer to the original')}
cv2.imwrite('cikti.png', np.hstack([noisy, out['gauss'], out['median']]))`, true)

export const edgesPy = (l: Lang) => block(l, 'Python: Sobel gradyanı ve Canny', 'Python: Sobel gradient and Canny', (c) => `import cv2
import numpy as np

img = cv2.imread('girdi.png')
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
blur = cv2.GaussianBlur(gray, (5, 5), 1.4)

gx = cv2.Sobel(blur, cv2.CV_32F, 1, 0, ksize=3)  # ${c('negatif değerler için float', 'float for negative values')}
gy = cv2.Sobel(blur, cv2.CV_32F, 0, 1, ksize=3)
mag, ang = cv2.cartToPolar(gx, gy, angleInDegrees=True)
print('${c('en büyük gradyan', 'largest gradient')}:', round(float(mag.max()), 1))

med = float(np.median(blur))                      # ${c('ortancaya göre otomatik eşikler', 'automatic thresholds from the median')}
lo, hi = int(max(0, 0.66 * med)), int(min(255, 1.33 * med))
edges = cv2.Canny(blur, lo, hi)                   # ${c('içeride: NMS + histerezis', 'inside: NMS + hysteresis')}
print('Canny', lo, hi, '${c('kenar pikseli', 'edge pixels')}:', int((edges > 0).sum()))
mag8 = cv2.convertScaleAbs(mag, alpha=255.0 / max(float(mag.max()), 1.0))
cv2.imwrite('cikti.png', np.hstack([mag8, edges]))`, true)

export const morphPy = (l: Lang) => block(l, 'Python: aşındırma, genişletme, açma, kapama', 'Python: erosion, dilation, opening, closing', (c) => `import cv2
import numpy as np

img = cv2.imread('girdi.png')
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
_, bw = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))   # ${c('RECT, ELLIPSE ya da CROSS', 'RECT, ELLIPSE or CROSS')}
ops = {
    'erode': cv2.erode(bw, k, iterations=1),
    'dilate': cv2.dilate(bw, k, iterations=1),
    'open': cv2.morphologyEx(bw, cv2.MORPH_OPEN, k),       # ${c('aşındır, sonra genişlet', 'erode, then dilate')}
    'close': cv2.morphologyEx(bw, cv2.MORPH_CLOSE, k),     # ${c('genişlet, sonra aşındır', 'dilate, then erode')}
    'gradient': cv2.morphologyEx(bw, cv2.MORPH_GRADIENT, k),
    'tophat': cv2.morphologyEx(gray, cv2.MORPH_TOPHAT, cv2.getStructuringElement(cv2.MORPH_RECT, (25, 25))),
}
for name, m in ops.items():
    n, _ = cv2.connectedComponents((m > 127).astype(np.uint8))
    print(f'{name:8s} ${c('beyaz', 'white')}={(m > 127).mean():.3f} ${c('bileşen', 'components')}={n - 1}')
cv2.imwrite('cikti.png', np.hstack([bw, ops['open'], ops['close']]))`, true)

export const contoursPy = (l: Lang) => block(l, 'Python: konturlar, momentler ve şekil adı', 'Python: contours, moments and shape name', (c) => `import cv2
import numpy as np

img = cv2.imread('girdi.png')
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
_, bw = cv2.threshold(cv2.GaussianBlur(gray, (5, 5), 0), 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
if (bw > 0).mean() > 0.5:
    bw = 255 - bw                                 # ${c('nesneler beyaz, arka plan siyah olmalı', 'objects must be white, background black')}

contours, hierarchy = cv2.findContours(bw, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
out = img.copy()
for cnt in contours:
    A = cv2.contourArea(cnt)
    if A < 200:                                   # ${c('küçük gürültüyü atla', 'skip small noise')}
        continue
    P = cv2.arcLength(cnt, True)
    circ = 4 * np.pi * A / (P * P)                # ${c('daire 1, kare yaklaşık 0,785', 'circle 1, square about 0.785')}
    approx = cv2.approxPolyDP(cnt, 0.02 * P, True)
    M = cv2.moments(cnt)
    cx, cy = int(M['m10'] / M['m00']), int(M['m01'] / M['m00'])
    v = len(approx)
    name = {3: 'tri', 4: 'quad'}.get(v, 'circle' if circ > 0.8 else f'{v}-gon')
    x, y, w, h = cv2.boundingRect(cnt)
    print(f'{name:7s} A={A:7.0f} P={P:6.1f} circ={circ:.2f} ${c('merkez', 'centre')}=({cx},{cy}) box={w}x{h}')
    cv2.drawContours(out, [approx], -1, (0, 0, 255), 2)
    cv2.putText(out, name, (cx - 20, cy), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 0, 0), 1)
cv2.imwrite('cikti.png', out)`, true)

export const colorPy = (l: Lang) => block(l, 'Python: HSV aralığıyla renk maskesi', 'Python: colour mask with an HSV range', (c) => `import cv2
import numpy as np

img = cv2.imread('girdi.png')
hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
lo = np.array([5, 120, 80])                       # ${c('turuncu: H 5..20, doygun ve parlak', 'orange: H 5..20, saturated and bright')}
hi = np.array([20, 255, 255])
mask = cv2.inRange(hsv, lo, hi)
# ${c('kırmızı H = 0 çevresinde: iki aralık gerekir', 'red wraps around H = 0: needs two ranges')}
red = cv2.inRange(hsv, (0, 120, 80), (8, 255, 255)) | cv2.inRange(hsv, (170, 120, 80), (179, 255, 255))
mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))
print('${c('maske oranı', 'mask ratio')}:', round((mask > 0).mean(), 4), '${c('kırmızı oranı', 'red ratio')}:', round((red > 0).mean(), 4))

contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
out = img.copy()
if contours:
    big = max(contours, key=cv2.contourArea)      # ${c('en büyük leke = hedef', 'largest blob = target')}
    (x, y), r = cv2.minEnclosingCircle(big)
    print('${c('hedef', 'target')}: x=%d y=%d r=%d' % (x, y, r))
    cv2.circle(out, (int(x), int(y)), int(r), (0, 255, 0), 2)
cv2.imwrite('cikti.png', out)`, true)

export const trackPy = (l: Lang) => block(l, 'Python: kamerada renkli nesne takibi ve iz', 'Python: tracking a coloured object on the camera, with a trail', (c) => `import cv2
import numpy as np
from collections import deque

cap = cv2.VideoCapture(0)                         # ${c('kendi bilgisayarında çalıştır', 'run on your own computer')}
trail = deque(maxlen=40)                          # ${c('son 40 merkez', 'last 40 centres')}
lo, hi = np.array([5, 120, 80]), np.array([20, 255, 255])
while True:
    ok, frame = cap.read()
    if not ok:
        break
    hsv = cv2.cvtColor(cv2.GaussianBlur(frame, (11, 11), 0), cv2.COLOR_BGR2HSV)
    mask = cv2.erode(cv2.inRange(hsv, lo, hi), None, iterations=2)
    mask = cv2.dilate(mask, None, iterations=2)
    cnts, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if cnts:
        M = cv2.moments(max(cnts, key=cv2.contourArea))
        if M['m00'] > 300:                        # ${c('çok küçükse hedef yok say', 'too small: treat as no target')}
            trail.appendleft((int(M['m10'] / M['m00']), int(M['m01'] / M['m00'])))
    for i in range(1, len(trail)):
        cv2.line(frame, trail[i - 1], trail[i], (0, 0, 255), max(1, 6 - i // 8))
    cv2.imshow('track', frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):         # ${c('q ile çık', 'quit with q')}
        break
cap.release()
cv2.destroyAllWindows()`)

export const warpPy = (l: Lang) => block(l, 'Python: döndür, ölçekle, kaydır (afin)', 'Python: rotate, scale, translate (affine)', (c) => `import cv2
import numpy as np

img = cv2.imread('girdi.png')
h, w = img.shape[:2]
M = cv2.getRotationMatrix2D((w / 2, h / 2), 30, 0.8)   # ${c('merkez, açı (derece, saat yönü tersine), ölçek', 'centre, angle (degrees, counter-clockwise), scale')}
M[:, 2] += (20, -10)                              # ${c('üstüne kaydırma', 'plus a translation')}
print('${c('afin matris', 'affine matrix')}:', np.round(M, 3).tolist())

near = cv2.warpAffine(img, M, (w, h), flags=cv2.INTER_NEAREST)
lin = cv2.warpAffine(img, M, (w, h), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT)
x, y = 10, 10
print('(10,10) ->', np.round(M @ np.array([x, y, 1.0]), 1))   # ${c('bir noktayı dönüştür', 'transform one point')}
Minv = cv2.invertAffineTransform(M)               # ${c('geri dönüşüm', 'the inverse transform')}
back = cv2.warpAffine(lin, Minv, (w, h))
cv2.imwrite('cikti.png', np.hstack([near, lin, back]))`, true)

export const perspectivePy = (l: Lang) => block(l, 'Python: belgenin köşelerini bul, perspektifi düzelt', 'Python: find the document corners, correct the perspective', (c) => `import cv2
import numpy as np

def order(pts):
    s, d = pts.sum(1), np.diff(pts, axis=1).ravel()
    return np.float32([pts[s.argmin()], pts[d.argmin()], pts[s.argmax()], pts[d.argmax()]])   # ${c('sol üst, sağ üst, sağ alt, sol alt', 'top left, top right, bottom right, bottom left')}

img = cv2.imread('girdi.png')
gray = cv2.GaussianBlur(cv2.cvtColor(img, cv2.COLOR_BGR2GRAY), (5, 5), 0)
edges = cv2.dilate(cv2.Canny(gray, 50, 150), None)
cnts, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
quad = None
for cnt in sorted(cnts, key=cv2.contourArea, reverse=True)[:5]:
    approx = cv2.approxPolyDP(cnt, 0.02 * cv2.arcLength(cnt, True), True)
    if len(approx) == 4:                          # ${c('ilk dört köşeli büyük kontur: belge', 'first large four-corner contour: the document')}
        quad = order(approx.reshape(4, 2).astype(np.float32))
        break
h, w = img.shape[:2]
if quad is None:
    quad = np.float32([[0, 0], [w - 1, 0], [w - 1, h - 1], [0, h - 1]])   # ${c('bulunamazsa tüm görüntü', 'if not found: the whole image')}
W, H = 420, 594                                   # ${c('A4 oranı (1 : 1,414)', 'A4 ratio (1 : 1.414)')}
dst = np.float32([[0, 0], [W - 1, 0], [W - 1, H - 1], [0, H - 1]])
Hm = cv2.getPerspectiveTransform(quad, dst)       # ${c('4 nokta çifti: 8 bilinmeyen', '4 point pairs: 8 unknowns')}
print('${c('köşeler', 'corners')}:', quad.astype(int).tolist())
print('${c('homografi', 'homography')}:', np.round(Hm, 3).tolist())
cv2.imwrite('cikti.png', cv2.warpPerspective(img, Hm, (W, H)))`, true)

export const featuresPy = (l: Lang) => block(l, 'Python: Harris köşeleri, ORB eşleştirme ve RANSAC', 'Python: Harris corners, ORB matching and RANSAC', (c) => `import cv2
import numpy as np

img = cv2.imread('girdi.png')
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
R = cv2.cornerHarris(np.float32(gray), 2, 3, 0.04)   # ${c('blok 2, Sobel 3, k = 0,04', 'block 2, Sobel 3, k = 0.04')}
print('Harris ${c('köşe pikseli', 'corner pixels')}:', int((R > 0.01 * R.max()).sum()))

h, w = gray.shape
M = cv2.getRotationMatrix2D((w / 2, h / 2), 25, 0.8)
gray2 = cv2.warpAffine(gray, M, (w, h))           # ${c('döndürülmüş ve küçültülmüş kopya', 'rotated and shrunk copy')}

orb = cv2.ORB_create(nfeatures=500)
k1, d1 = orb.detectAndCompute(gray, None)         # ${c('d: 32 bayt = 256 bitlik ikili betimleyici', 'd: 32 bytes = 256-bit binary descriptor')}
k2, d2 = orb.detectAndCompute(gray2, None)
print('${c('nokta', 'keypoints')}:', len(k1), len(k2))
good = []
if d1 is not None and d2 is not None and len(k2) >= 2:
    bf = cv2.BFMatcher(cv2.NORM_HAMMING)          # ${c('ikili betimleyicide Hamming uzaklığı', 'Hamming distance for binary descriptors')}
    for pair in bf.knnMatch(d1, d2, k=2):
        if len(pair) == 2 and pair[0].distance < 0.75 * pair[1].distance:   # ${c('Lowe oran testi', 'Lowe ratio test')}
            good.append(pair[0])
print('${c('iyi eşleşme', 'good matches')}:', len(good))
if len(good) >= 4:
    src = np.float32([k1[m.queryIdx].pt for m in good])
    dst = np.float32([k2[m.trainIdx].pt for m in good])
    Hm, inl = cv2.findHomography(src, dst, cv2.RANSAC, 3.0)   # ${c('aykırıları ayıkla', 'reject outliers')}
    print('RANSAC inlier:', int(inl.sum()) if inl is not None else 0)
out = cv2.drawMatches(gray, k1, gray2, k2, good[:40], None, flags=2)
cv2.imwrite('cikti.png', out)`, true)

export const integralPy = (l: Lang) => block(l, 'Python: integral görüntü ve bir Haar benzeri öznitelik', 'Python: integral image and a Haar-like feature', (c) => `import cv2
import numpy as np

img = cv2.imread('girdi.png')
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
ii = cv2.integral(gray)                           # ${c('(h+1) x (w+1), ilk satır ve sütun 0', '(h+1) x (w+1), first row and column are 0')}

def rect_sum(x, y, w, h):                         # ${c('her boyutta dört okuma', 'four reads at any size')}
    return int(ii[y + h, x + w] - ii[y, x + w] - ii[y + h, x] + ii[y, x])

h, w = gray.shape
x, y, s = w // 4, h // 4, min(w, h) // 4
assert rect_sum(x, y, s, s) == int(gray[y: y + s, x: x + s].sum())   # ${c('doğrudan toplamla aynı', 'same as the direct sum')}

# ${c('iki dikdörtgenli öznitelik: üst yarı koyu, alt yarı açık (göz ve yanak gibi)', 'two-rectangle feature: dark top half, light bottom half (like eyes and cheeks)')}
def haar_two(x, y, w, h):
    top, bottom = rect_sum(x, y, w, h // 2), rect_sum(x, y + h // 2, w, h // 2)
    return (bottom - top) / (w * h // 2)

scores = [(haar_two(xx, yy, 24, 24), xx, yy) for yy in range(0, h - 24, 4) for xx in range(0, w - 24, 4)]
best = max(scores)
print('${c('pencere sayısı', 'windows')}:', len(scores), '${c('en güçlü yanıt', 'strongest response')}:', round(best[0], 1), 'at', best[1:])
out = img.copy()
cv2.rectangle(out, best[1:], (best[1] + 24, best[2] + 24), (0, 255, 0), 2)
cv2.imwrite('cikti.png', out)`, true)

export const haarPy = (l: Lang) => block(l, 'Python: Haar kademesiyle yüz, HOG ile insan algılama', 'Python: face with a Haar cascade, person with HOG', (c) => `import cv2

face = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
hog = cv2.HOGDescriptor()
hog.setSVMDetector(cv2.HOGDescriptor_getDefaultPeopleDetector())   # ${c('64x128 pencere, doğrusal SVM', '64x128 window, linear SVM')}

cap = cv2.VideoCapture(0)                         # ${c('görüntü bilgisayardan çıkmaz', 'the image never leaves the computer')}
while True:
    ok, frame = cap.read()
    if not ok:
        break
    gray = cv2.equalizeHist(cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY))
    faces = face.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(60, 60))
    for (x, y, w, h) in faces:
        cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)
    people, _ = hog.detectMultiScale(frame, winStride=(8, 8), scale=1.05)
    for (x, y, w, h) in people:
        cv2.rectangle(frame, (x, y), (x + w, y + h), (255, 0, 0), 2)
    cv2.imshow('detect', frame)                   # ${c('kayıt yok: kare yalnız ekranda', 'no recording: frames only on screen')}
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break
cap.release()
cv2.destroyAllWindows()`)

export const bgsubPy = (l: Lang) => block(l, 'Python: sentetik videoda MOG2, lekeler ve çizgi sayımı', 'Python: MOG2, blobs and line counting on a synthetic video', (c) => `import cv2
import numpy as np

rng = np.random.default_rng(1)
H, W, LINE = 240, 320, 160                        # ${c('sayım çizgisi x = 160', 'counting line at x = 160')}
bg = np.full((H, W, 3), 90, np.uint8)
cars = [(-40 - 90 * i, 20 + 44 * i, 3 + i % 2) for i in range(5)]   # ${c('(x, y, hız)', '(x, y, speed)')}
mog = cv2.createBackgroundSubtractorMOG2(history=100, varThreshold=25, detectShadows=False)
prev, count, last = {}, 0, None
for t in range(220):
    frame = bg.copy()
    for i, (x0, y, v) in enumerate(cars):
        x = int(x0 + v * t)
        cv2.rectangle(frame, (x, y), (x + 36, y + 22), (40, 160, 230), -1)
    frame = cv2.add(frame, rng.integers(0, 12, frame.shape, dtype=np.uint8))   # ${c('sensör gürültüsü', 'sensor noise')}
    fg = mog.apply(frame)
    fg = cv2.morphologyEx(fg, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
    n, lab, stats, cent = cv2.connectedComponentsWithStats(fg)
    now = {}
    for k in range(1, n):
        if stats[k, cv2.CC_STAT_AREA] < 300:
            continue
        cx, cy = cent[k]
        lane = int(cy // 44)                      # ${c('basit izleme: şerit başına bir iz', 'simple tracking: one track per lane')}
        if lane in prev and prev[lane] < LINE <= cx:
            count += 1                            # ${c('çizgiyi soldan sağa geçti', 'crossed the line left to right')}
        now[lane] = cx
    prev = now
    last = frame
print('${c('sayılan araç', 'vehicles counted')}:', count)
cv2.line(last, (LINE, 0), (LINE, H), (0, 0, 255), 2)
cv2.imwrite('cikti.png', np.hstack([last, cv2.cvtColor(fg, cv2.COLOR_GRAY2BGR)]))`, true)

export const videoLoopPy = (l: Lang) => block(l, 'Python: video döngüsü, kare farkı ve kayan ortalama', 'Python: video loop, frame differencing and running average', (c) => `import cv2
import numpy as np

cap = cv2.VideoCapture('trafik.mp4')              # ${c('ya da 0: kamera', 'or 0: camera')}
fps = cap.get(cv2.CAP_PROP_FPS) or 30
avg, prev = None, None
while True:
    ok, frame = cap.read()
    if not ok:
        break                                     # ${c('video bitti', 'end of video')}
    gray = cv2.GaussianBlur(cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY), (5, 5), 0)
    if avg is None:
        avg, prev = gray.astype(np.float32), gray
        continue
    diff = cv2.absdiff(gray, prev)                # ${c('kare farkı: yalnız hareketli kenarlar', 'frame difference: only moving edges')}
    cv2.accumulateWeighted(gray, avg, 0.02)       # ${c('arka plan = kayan ortalama', 'background = running average')}
    fg = cv2.absdiff(gray, cv2.convertScaleAbs(avg))
    _, mask = cv2.threshold(fg, 25, 255, cv2.THRESH_BINARY)
    prev = gray
    cv2.imshow('mask', mask)
    if cv2.waitKey(int(1000 / fps)) & 0xFF == ord('q'):
        break
cap.release()
cv2.destroyAllWindows()`)

export const scannerPy = (l: Lang) => block(l, 'Python: belge tarayıcı, uçtan uca', 'Python: document scanner, end to end', (c) => `import cv2
import numpy as np

def order(pts):
    s, d = pts.sum(1), np.diff(pts, axis=1).ravel()
    return np.float32([pts[s.argmin()], pts[d.argmin()], pts[s.argmax()], pts[d.argmax()]])

def find_quad(img, canny=(50, 150), min_frac=0.2):
    gray = cv2.GaussianBlur(cv2.cvtColor(img, cv2.COLOR_BGR2GRAY), (5, 5), 0)
    edges = cv2.dilate(cv2.Canny(gray, *canny), np.ones((3, 3), np.uint8))   # ${c('kopuk kenarları birleştir', 'join broken edges')}
    cnts, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    area = img.shape[0] * img.shape[1]
    for cnt in sorted(cnts, key=cv2.contourArea, reverse=True)[:5]:
        approx = cv2.approxPolyDP(cnt, 0.02 * cv2.arcLength(cnt, True), True)
        if len(approx) == 4 and cv2.contourArea(approx) > min_frac * area and cv2.isContourConvex(approx):
            return order(approx.reshape(4, 2).astype(np.float32))
    return None                                   # ${c('G5: bulunamazsa kullanıcıya sor', 'R5: if not found, ask the user')}

def scan(img, width=840):
    quad = find_quad(img)
    if quad is None:
        return None, None
    tl, tr, br, bl = quad
    ratio = max(np.linalg.norm(bl - tl), np.linalg.norm(br - tr)) / max(np.linalg.norm(tr - tl), np.linalg.norm(br - bl))
    W, H = width, int(width * ratio)              # ${c('kenar uzunluklarından en-boy oranı', 'aspect ratio from the edge lengths')}
    M = cv2.getPerspectiveTransform(quad, np.float32([[0, 0], [W - 1, 0], [W - 1, H - 1], [0, H - 1]]))
    flat = cv2.warpPerspective(img, M, (W, H))
    g = cv2.cvtColor(flat, cv2.COLOR_BGR2GRAY)
    bw = cv2.adaptiveThreshold(g, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 25, 12)   # ${c('gölgeye dayanıklı', 'robust to shadows')}
    return bw, quad

img = cv2.imread('girdi.png')
bw, quad = scan(img)
if bw is None:
    print('${c('belge bulunamadı', 'no document found')}')
    cv2.imwrite('cikti.png', img)
else:
    print('${c('köşeler', 'corners')}:', quad.astype(int).tolist(), '${c('çıktı', 'output')}:', bw.shape)
    cv2.imwrite('cikti.png', bw)`, true)
