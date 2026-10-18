// "Gerçek Hayat Demoları": büyükler/gençler için 8 gerçek dünya görüntü işleme demosu (Robotun Gözleri'nin yetişkin bölümü).
// Her demo tarayıcıda, cihaz içinde çalışır: canlı kamera (MediaPipe Pose/Face/Hand ya da piksel işleme) veya örnek sahne.
// Karar mantığı lib/cv-demo-logic.ts, sahne üreticileri lib/cv-demo-scenes.ts, bileşenler components/cv-demo.
// Metinlerdeki eşikler, bu dosyadaki `params` varsayılanları ve cv-demo-logic.ts'teki *_DEFAULTS ile aynıdır (test eder).
import { FALL_DEFAULTS, FATIGUE_DEFAULTS, POSTURE_DEFAULTS, RIPE_DEFAULTS, ZONE_DEFAULTS } from './cv-demo-logic'

export type DemoModel = 'pose' | 'face' | 'hand' | 'pixel'
export type Sector = 'health' | 'security' | 'safety' | 'ergonomics' | 'traffic' | 'agri' | 'driver'
interface Text { title: string; tagline: string; intro: string; steps: string[]; task: string; sample: string; note?: string }
export interface Param { key: string; min: number; max: number; step: number; def: number; tr: string; en: string; unit?: string }
export interface Demo {
  slug: 'dusme-tespiti' | 'bolge-ihlali' | 'sicak-bolge' | 'durus-analizi' | 'nabiz-rppg' | 'trafik-sayaci' | 'meyve-olgunlugu' | 'yorgunluk'
  emoji: string; color: string; sector: Sector; model: DemoModel; params: Param[]; py: string; tr: Text; en: Text
}

export const SECTOR_LABEL: Record<Sector, { tr: string; en: string }> = {
  health: { tr: 'Sağlık', en: 'Health' }, security: { tr: 'Güvenlik', en: 'Security' }, safety: { tr: 'İş güvenliği', en: 'Workplace safety' },
  ergonomics: { tr: 'Ergonomi', en: 'Ergonomics' }, traffic: { tr: 'Trafik', en: 'Traffic' }, agri: { tr: 'Tarım', en: 'Agriculture' }, driver: { tr: 'Sürücü güvenliği', en: 'Driver safety' },
}
export const MODEL_LABEL: Record<DemoModel, { tr: string; en: string }> = {
  pose: { tr: 'Vücut noktaları (Pose)', en: 'Body landmarks (Pose)' }, face: { tr: 'Yüz noktaları (Face Mesh)', en: 'Face landmarks (Face Mesh)' },
  hand: { tr: 'El noktaları (Hands)', en: 'Hand landmarks (Hands)' }, pixel: { tr: 'Piksel işleme (OpenCV tarzı)', en: 'Pixel processing (OpenCV style)' },
}

/** Türkçe metinde ondalık virgül. */
const tc = (v: number) => String(v).replace('.', ',')
const F = FALL_DEFAULTS, P = POSTURE_DEFAULTS, Y = FATIGUE_DEFAULTS, R = RIPE_DEFAULTS

export const DEMOS: Demo[] = [
  {
    slug: 'dusme-tespiti', emoji: '🧓', color: '#fde2e1', sector: 'health', model: 'pose',
    params: [
      { key: 'speed', min: 0.6, max: 3, step: 0.1, def: F.speed, tr: 'Düşüş hızı eşiği', en: 'Drop speed threshold', unit: 'gövde/sn' },
      { key: 'angle', min: 35, max: 80, step: 1, def: F.angle, tr: 'Gövde açısı eşiği', en: 'Torso angle threshold', unit: '°' },
      { key: 'frames', min: 2, max: 20, step: 1, def: F.frames, tr: 'Onay için kare sayısı (N)', en: 'Frames to confirm (N)' },
    ],
    tr: {
      title: 'Düşme tespiti', tagline: 'Yaşlı bakımı ve hastanelerde: kişi düşerse saniyeler içinde alarm.',
      intro: 'Huzurevleri, hastane odaları ve yalnız yaşayan yaşlılar için kameralı düşme algılayıcıları bu fikirle çalışır. Model yalnızca vücudun 33 noktasını verir; "düştü mü?" kararını basit, açıklanabilir bir kural verir: kalça hızla aşağı indi ve hemen ardından gövde yatay kaldı.',
      steps: [
        'Nokta bulma: MediaPipe Pose her karede 33 vücut noktası verir. Omuz (11, 12) ve kalça (23, 24) noktalarının ortalarını alırız.',
        'Özellik 1, düşüş hızı: kalça ortasının aşağı hızı, gövde boyuna bölünür (gövde/sn). Böylece kameraya yakın ya da uzak olman sonucu değiştirmez.',
        `Özellik 2, gövde açısı: omuz-kalça doğrusunun dikeyle açısı. Ayakta ≈ 0°, yerde ≈ 90°.`,
        `Kural: hız > ${tc(F.speed)} gövde/sn ise "düşüyor olabilir" evresine geçilir. ${tc(F.window)} sn içinde açı ${tc(F.angle)}° üstünde ${tc(F.frames)} kare üst üste kalırsa DÜŞME alarmı.`,
        `Yanlış alarmı önleme: hızlı çömelmede açı dik kalır, pencere dolunca normale döner. Yavaşça uzanmak (hız yok) "yatıyor" sayılır, alarm vermez. Dik duruş (açı < 30°) ${F.frames * 2} kare sürerse alarm kapanır.`,
      ],
      task: 'Örnek sahnede karakter önce oturur (yavaş alçalma), sonra düşer. N kare sayısını 2\'ye indir: alarm daha erken ama titrek; 20\'ye çıkar: geç ama kararlı. Kamera modunda kameradan 2–3 m uzaklaş, bir koltuğa yavaşça uzan, sonra yumuşak bir minderin üstüne kontrollü "düş" ve farkı gör.',
      sample: 'Örnek sahne: sentetik bir karakter yürür, oturur, düşer ve kalkar. İskelet noktaları modele değil sahne üreticisine aittir; karar kodu kamera moduyla aynıdır.',
      note: 'Gerçek sistemler bu kurala ek olarak hareketsizlik süresi, birden çok kamera ve insan onayı kullanır. Bu demo eğitim amaçlıdır.',
    },
    en: {
      title: 'Fall detection', tagline: 'Elderly care and hospitals: an alarm within seconds when someone falls.',
      intro: 'Camera-based fall detectors for care homes, hospital rooms and elderly people living alone work on this idea. The model only gives 33 body points; the "did they fall?" decision is a simple, explainable rule: the hips dropped fast and right after that the torso stayed horizontal.',
      steps: [
        'Landmarks: MediaPipe Pose gives 33 body points per frame. We take the midpoints of the shoulders (11, 12) and hips (23, 24).',
        'Feature 1, drop speed: the downward speed of the hip midpoint divided by torso length (torsos/s), so being near or far from the camera does not change the result.',
        'Feature 2, torso angle: the angle between the shoulder-hip line and vertical. Standing ≈ 0°, on the floor ≈ 90°.',
        `Rule: if speed > ${F.speed} torsos/s we enter the "may be falling" phase. If within ${F.window} s the angle stays above ${F.angle}° for ${F.frames} frames in a row, FALL alarm.`,
        `Avoiding false alarms: in a quick squat the torso stays upright and the window expires. Lying down slowly (no speed) counts as "lying", no alarm. Standing upright (angle < 30°) for ${F.frames * 2} frames clears the alarm.`,
      ],
      task: 'In the sample scene the character first sits down (slow descent), then falls. Lower N to 2: the alarm is earlier but jittery; raise it to 20: late but stable. In camera mode step 2–3 m back, lie down slowly on a sofa, then do a controlled "fall" onto a soft mat and see the difference.',
      sample: 'Sample scene: a synthetic character walks, sits, falls and gets up. The skeleton comes from the scene generator, not the model; the decision code is identical to camera mode.',
      note: 'Real systems add inactivity time, multiple cameras and human confirmation to this rule. This demo is for education.',
    },
    py: `import cv2, math, mediapipe as mp

pose = mp.solutions.pose.Pose(model_complexity=0)
cap = cv2.VideoCapture(0)
SPEED, ANGLE, N, WINDOW = ${F.speed}, ${F.angle}, ${F.frames}, ${F.window}
phase, prev_y, prev_t, frames, drop_t = "ok", None, 0, 0, 0

while cap.isOpened():
    ok, frame = cap.read()
    if not ok: break
    t = cv2.getTickCount() / cv2.getTickFrequency()
    res = pose.process(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
    if res.pose_landmarks:
        lm = res.pose_landmarks.landmark
        sx, sy = (lm[11].x + lm[12].x) / 2, (lm[11].y + lm[12].y) / 2  # omuz ortası || shoulder midpoint
        hx, hy = (lm[23].x + lm[24].x) / 2, (lm[23].y + lm[24].y) / 2  # kalça ortası || hip midpoint
        torso = math.hypot(hx - sx, hy - sy)
        angle = math.degrees(math.atan2(abs(hx - sx), hy - sy))      # 0 dik, 90 yatay || 0 upright, 90 flat
        v = 0 if prev_y is None else (hy - prev_y) / torso / (t - prev_t)  # gövde/sn || torsos/s
        prev_y, prev_t = hy, t
        if phase == "ok" and v > SPEED:
            phase, drop_t, frames = "drop", t, 0
        elif phase == "drop":
            frames = frames + 1 if angle > ANGLE else 0
            if frames >= N: phase = "fall"; print("DÜŞME ALARMI")  # alarm gönder || send alert
            elif t - drop_t > WINDOW: phase = "ok"
        elif phase == "fall" and angle < 30:
            phase = "ok"
    cv2.imshow("fall", frame)
    if cv2.waitKey(1) == 27: break`,
  },
  {
    slug: 'bolge-ihlali', emoji: '🚧', color: '#e0e7ff', sector: 'security', model: 'pose',
    params: [
      { key: 'enter', min: 1, max: 15, step: 1, def: ZONE_DEFAULTS.enter, tr: 'Giriş onayı (kare)', en: 'Entry confirmation (frames)' },
      { key: 'gain', min: 1, max: 6, step: 0.5, def: 3, tr: 'Gece modu kazancı', en: 'Night mode gain', unit: '×' },
    ],
    tr: {
      title: 'Bölge ihlali ve gece kamerası', tagline: 'Depo, şantiye, raylı alan: yasak bölgeye giren kişiyi işaretle.',
      intro: 'Güvenlik kameralarının "sanal çit" özelliği: görüntüye bir çokgen çizilir, bir insan o alana girerse alarm verilir. Burada kişiyi vücut noktalarından buluruz ve ayaklarının nerede olduğuna bakarız: kafası bölgenin üstünde görünen ama ayağı dışarıda olan kişi içeride sayılmaz.',
      steps: [
        'Görüntü iyileştirme (gece modu): her piksel gri tona çevrilir (0,299R + 0,587G + 0,114B), kazançla çarpılır ve gama (1/1,6) uygulanır. Karanlık sahnede ayrıntı ortaya çıkar.',
        'Nokta bulma: MediaPipe Pose ile 33 nokta; görünür noktaların kutusu kişinin çerçevesidir.',
        'Özellik: ayak noktası = iki bileğin (27, 28) ortası; bilekler görünmüyorsa kutunun alt ortası.',
        'Kural: ışın atma (ray casting) testi. Noktadan sağa çekilen yatay ışın çokgen kenarlarını tek sayıda keserse nokta içeridedir.',
        `Kararlılık: ${ZONE_DEFAULTS.enter} kare üst üste içeride → İHLAL; ${ZONE_DEFAULTS.exit} kare üst üste dışarıda → temiz. Bölgede geçen süre ve ihlal sayısı tutulur.`,
      ],
      task: 'Bölgeyi kendin çiz: "Bölgeyi çiz" düğmesine bas, görüntüye tıklayarak köşeleri ekle, "Bitti" de. İçbükey (L biçimli) bir bölge dene. Gece modunu kapatıp aç: karanlıkta model ve sen neyi daha iyi görüyorsunuz?',
      sample: 'Örnek sahne: gece, bir depo avlusunda yürüyen sentetik bir kişi. Gece modu, sahnenin piksellerine gerçekten uygulanır.',
    },
    en: {
      title: 'Zone intrusion and night camera', tagline: 'Warehouses, building sites, rail yards: flag anyone entering a forbidden zone.',
      intro: 'The "virtual fence" feature of security cameras: a polygon is drawn on the image and an alarm fires when a person enters it. Here we find the person from body landmarks and look at where their feet are: someone whose head appears over the zone but whose feet are outside is not inside.',
      steps: [
        'Image enhancement (night mode): each pixel becomes grey (0.299R + 0.587G + 0.114B), is multiplied by a gain and a gamma (1/1.6) is applied. Detail appears in a dark scene.',
        'Landmarks: 33 points from MediaPipe Pose; the box around the visible points is the person\'s bounding box.',
        'Feature: foot point = midpoint of the two ankles (27, 28); if the ankles are not visible, the bottom centre of the box.',
        'Rule: ray casting test. If a horizontal ray from the point crosses the polygon edges an odd number of times, the point is inside.',
        `Stability: ${ZONE_DEFAULTS.enter} frames in a row inside → INTRUSION; ${ZONE_DEFAULTS.exit} frames in a row outside → clear. Time in the zone and the number of intrusions are kept.`,
      ],
      task: 'Draw the zone yourself: press "Draw zone", click on the image to add corners, then "Done". Try a concave (L-shaped) zone. Switch night mode off and on: in the dark, what do you and the model see better?',
      sample: 'Sample scene: at night, a synthetic person walks across a warehouse yard. Night mode is really applied to the scene\'s pixels.',
    },
    py: `import cv2, numpy as np, mediapipe as mp

zone = np.array([[180, 300], [460, 280], [560, 460], [120, 460]], np.int32)  # piksel || pixels
pose = mp.solutions.pose.Pose(model_complexity=0)
cap = cv2.VideoCapture(0)
inside_frames, alarm = 0, False
lut = np.array([255 * min(1, i * 3 / 255) ** (1 / 1.6) for i in range(256)], np.uint8)

while cap.isOpened():
    ok, frame = cap.read()
    if not ok: break
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    night = cv2.cvtColor(cv2.LUT(gray, lut), cv2.COLOR_GRAY2BGR)  # gece modu: kazanç + gama || night mode: gain + gamma
    h, w = gray.shape
    res = pose.process(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
    inside = False
    if res.pose_landmarks:
        lm = res.pose_landmarks.landmark
        foot = (int((lm[27].x + lm[28].x) / 2 * w), int((lm[27].y + lm[28].y) / 2 * h))  # bileklerin ortası || ankle midpoint
        inside = cv2.pointPolygonTest(zone, foot, False) >= 0                             # ışın atma testi || ray casting test
    inside_frames = inside_frames + 1 if inside else 0
    alarm = inside_frames >= ${ZONE_DEFAULTS.enter}
    cv2.polylines(night, [zone], True, (0, 0, 255) if alarm else (0, 255, 255), 2)
    cv2.imshow("zone", night)
    if cv2.waitKey(1) == 27: break`,
  },
  {
    slug: 'sicak-bolge', emoji: '🔥', color: '#ffedd5', sector: 'safety', model: 'hand',
    params: [{ key: 'margin', min: 0, max: 120, step: 5, def: 40, tr: 'Uyarı mesafesi', en: 'Warning distance', unit: 'px' }],
    tr: {
      title: 'İş güvenliği: el yasak bölgede', tagline: 'Pres, testere, sıcak ocak: el tehlikeli alana yaklaşınca uyar.',
      intro: 'Fabrikalarda pres ve kesme makinelerinde, endüstriyel mutfaklarda ocak başında kullanılan "el koruma" kameraları: el, tehlikeli bölgeye belli bir mesafeden fazla yaklaşırsa önce sarı uyarı, içine girerse kırmızı alarm (gerçek sistemde makine durdurulur).',
      steps: [
        'Nokta bulma: MediaPipe el modeli her el için 21 nokta verir (bilek, parmak eklemleri ve uçları).',
        'Özellik: her noktanın tehlike dikdörtgenine uzaklığı; dışarıdaysa en yakın kenara olan mesafe, içerideyse 0. En küçüğü alınır.',
        'Kural: uzaklık 0 → TEHLİKE; uzaklık < uyarı mesafesi (varsayılan 40 px) → UYARI; değilse güvenli.',
        'Kararlılık: seviye yükselirken 2 kare yeter (alarm erken çalsın), düşerken 6 kare beklenir (hemen susmasın).',
      ],
      task: 'Görüntüde bir yere tıkla: sıcak bölge oraya taşınır. Uyarı mesafesini 0 yap (yalnız içeri girince alarm) ve 120 yap: hangisi bir pres makinesi için daha doğru olurdu? Kamera modunda elini bölgeye yavaşça yaklaştır.',
      sample: 'Örnek sahne: endüstriyel mutfak tezgâhı, sıcak ocak ve sentetik bir el. Elin noktaları sahne üreticisinden gelir.',
    },
    en: {
      title: 'Workplace safety: hand in danger zone', tagline: 'Presses, saws, hot stoves: warn when a hand gets too close.',
      intro: '"Hand protection" cameras used on presses and cutting machines in factories and by stoves in industrial kitchens: if a hand comes closer to the danger zone than a set distance there is a yellow warning; if it enters, a red alarm (a real system stops the machine).',
      steps: [
        'Landmarks: the MediaPipe hand model gives 21 points per hand (wrist, finger joints and tips).',
        'Feature: each point\'s distance to the danger rectangle: distance to the nearest edge if outside, 0 if inside. The smallest is used.',
        'Rule: distance 0 → DANGER; distance < warning distance (default 40 px) → WARNING; otherwise safe.',
        'Stability: when the level rises 2 frames are enough (alarm early), when it falls 6 frames are required (do not go quiet too soon).',
      ],
      task: 'Click anywhere on the image to move the hot zone there. Set the warning distance to 0 (alarm only inside) and to 120: which would be right for a press machine? In camera mode move your hand slowly towards the zone.',
      sample: 'Sample scene: an industrial kitchen counter, a hot stove and a synthetic hand. The hand points come from the scene generator.',
    },
    py: `import cv2, math, mediapipe as mp

hands = mp.solutions.hands.Hands(max_num_hands=2)
ZONE = (380, 200, 200, 140)   # x, y, genişlik, yükseklik || x, y, width, height
MARGIN = 40                   # piksel || pixels
cap = cv2.VideoCapture(0)

def dist_to_rect(px, py, r):
    x, y, w, h = r
    dx = max(x - px, 0, px - (x + w)); dy = max(y - py, 0, py - (y + h))
    return math.hypot(dx, dy)     # içerideyse 0 || 0 if inside

while cap.isOpened():
    ok, frame = cap.read()
    if not ok: break
    h, w = frame.shape[:2]
    res = hands.process(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
    d = float("inf")
    for hand in res.multi_hand_landmarks or []:
        d = min([d] + [dist_to_rect(p.x * w, p.y * h, ZONE) for p in hand.landmark])
    level = "TEHLİKE" if d == 0 else "UYARI" if d < MARGIN else "güvenli"  # DANGER / WARNING / safe
    color = (0, 0, 255) if d == 0 else (0, 200, 255) if d < MARGIN else (0, 200, 0)
    x, y, zw, zh = ZONE
    cv2.rectangle(frame, (x, y), (x + zw, y + zh), color, 3)
    cv2.putText(frame, level, (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.8, color, 2)
    cv2.imshow("hot zone", frame)
    if cv2.waitKey(1) == 27: break`,
  },
  {
    slug: 'durus-analizi', emoji: '🪑', color: '#dcfce7', sector: 'ergonomics', model: 'pose',
    params: [
      { key: 'tilt', min: 3, max: 20, step: 1, def: P.tilt, tr: 'Omuz eğimi eşiği', en: 'Shoulder tilt threshold', unit: '°' },
      { key: 'neck', min: 8, max: 40, step: 1, def: P.neck, tr: 'Boyun açısı eşiği', en: 'Neck angle threshold', unit: '°' },
      { key: 'hold', min: 1, max: 10, step: 1, def: P.hold, tr: 'Hatırlatma süresi', en: 'Reminder delay', unit: 'sn' },
    ],
    tr: {
      title: 'Duruş (postür) analizi', tagline: 'Masa başı çalışanlar için: kamburlaşınca "dik otur" hatırlatması.',
      intro: 'Ergonomi uygulamaları ve ofis sağlığı yazılımları web kamerasıyla oturuşunu izler. Üç basit geometrik ölçü yeter: omuzlar düz mü, baş omuzların üstünde mi, baş öne-aşağı düştü mü? Kişiden kişiye değişen tek şey "dik duruş" oranıdır; onu bir kez kalibre ederiz.',
      steps: [
        'Nokta bulma: MediaPipe Pose; burun (0), kulaklar (7, 8) ve omuzlar (11, 12) yeter.',
        'Özellik 1, omuz eğimi: iki omuzu birleştiren doğrunun yatayla açısı.',
        'Özellik 2, boyun açısı: omuz ortasından kulak ortasına giden doğrunun dikeyle açısı (yandan bakışta başın öne uzanmasını da ölçer).',
        'Özellik 3, baş düşmesi: (omuz ortası y − burun y) / omuz genişliği. Kamburlaşınca baş omuzlara yaklaşır, oran küçülür.',
        `Kural: eğim > ${tc(P.tilt)}° ya da boyun > ${tc(P.neck)}° ya da oran < kalibrasyon × ${tc(P.drop)} → kötü duruş. ${tc(P.hold)} sn sürerse "Dik otur" hatırlatması.`,
      ],
      task: 'Kamera modunda dik otur ve "Kalibre et" düğmesine bas. Sonra öne eğilip telefona bakar gibi yap: kaç saniyede uyarı geldi? Hatırlatma süresini 10 sn yap; gerçek bir uygulamada kaç dakika olmalı?',
      sample: 'Örnek sahne: masa başında çalışan sentetik bir kişi; zamanla kamburlaşır, omzu düşer, sonra düzelir.',
    },
    en: {
      title: 'Posture analysis', tagline: 'For desk workers: a "sit up straight" reminder when you slouch.',
      intro: 'Ergonomics apps and office health software watch how you sit through the webcam. Three simple geometric measurements are enough: are the shoulders level, is the head above the shoulders, has the head dropped forward? The only thing that varies from person to person is the "upright" ratio, which we calibrate once.',
      steps: [
        'Landmarks: MediaPipe Pose; the nose (0), ears (7, 8) and shoulders (11, 12) are enough.',
        'Feature 1, shoulder tilt: the angle of the line joining the shoulders to horizontal.',
        'Feature 2, neck angle: the angle of the line from the shoulder midpoint to the ear midpoint to vertical (from the side it also measures forward head posture).',
        'Feature 3, head drop: (shoulder midpoint y − nose y) / shoulder width. When you slouch the head gets closer to the shoulders and the ratio shrinks.',
        `Rule: tilt > ${P.tilt}° or neck > ${P.neck}° or ratio < calibration × ${P.drop} → bad posture. If it lasts ${P.hold} s, a "Sit up straight" reminder.`,
      ],
      task: 'In camera mode sit up straight and press "Calibrate". Then lean forward as if looking at your phone: how many seconds until the warning? Set the reminder delay to 10 s; how many minutes should a real app use?',
      sample: 'Sample scene: a synthetic person working at a desk; over time they slouch, one shoulder drops, then they straighten up.',
    },
    py: `import cv2, math, time, mediapipe as mp

pose = mp.solutions.pose.Pose(model_complexity=0)
cap = cv2.VideoCapture(0)
TILT, NECK, DROP, HOLD = ${P.tilt}, ${P.neck}, ${P.drop}, ${P.hold}
base, bad_since = None, None

while cap.isOpened():
    ok, frame = cap.read()
    if not ok: break
    h, w = frame.shape[:2]
    res = pose.process(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
    if res.pose_landmarks:
        p = lambda i: (res.pose_landmarks.landmark[i].x * w, res.pose_landmarks.landmark[i].y * h)
        nose, le, re, ls, rs = p(0), p(7), p(8), p(11), p(12)
        sw = math.dist(ls, rs); sm = ((ls[0] + rs[0]) / 2, (ls[1] + rs[1]) / 2)
        ear = ((le[0] + re[0]) / 2, (le[1] + re[1]) / 2)
        tilt = math.degrees(math.atan2(abs(rs[1] - ls[1]), abs(rs[0] - ls[0])))
        neck = math.degrees(math.atan2(abs(ear[0] - sm[0]), sm[1] - ear[1]))
        ratio = (sm[1] - nose[1]) / sw
        base = base or ratio                        # ilk kare = kalibrasyon || first frame = calibration
        bad = tilt > TILT or neck > NECK or ratio < base * DROP
        bad_since = (bad_since or time.time()) if bad else None
        if bad_since and time.time() - bad_since > HOLD:
            cv2.putText(frame, "Dik otur!", (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 1.2, (0, 0, 255), 3)  # Sit up!
    cv2.imshow("posture", frame)
    if cv2.waitKey(1) == 27: break`,
  },
  {
    slug: 'nabiz-rppg', emoji: '❤️', color: '#ffe4e6', sector: 'health', model: 'face',
    params: [{ key: 'window', min: 6, max: 20, step: 1, def: 10, tr: 'Analiz penceresi', en: 'Analysis window', unit: 'sn' }],
    tr: {
      title: 'Kameradan nabız (rPPG)', tagline: 'Yüz rengindeki görünmez değişimden kalp atışını tahmin et.',
      intro: 'Kalp her attığında yüzdeki kılcal damarlara biraz daha kan gelir ve deri, gözle görülmeyecek kadar az, yeşil ışığı daha çok soğurur. Uzaktan fotopletismografi (rPPG) bu küçük değişimi kamerayla ölçer. Sinyal çok zayıftır (piksel değerinde 1–2 birim), bu yüzden binlerce pikselin ortalaması alınır ve sinyal işleme yapılır.',
      steps: [
        'Nokta bulma: MediaPipe Face Mesh ile 478 yüz noktası; alın noktası (151) çevresinde, yüz genişliğinin %36 × %14\'ü kadar bir ölçüm alanı (ROI). Alın, az hareket eden ve saçsız bir bölgedir.',
        'Ham sinyal: her karede ROI içindeki piksellerin yeşil kanal ortalaması ve zamanı kaydedilir.',
        'Ön işleme: 30 Hz\'e eşit aralıklı yeniden örnekleme, normalize etme (g / ortalama − 1), 0,7–3 Hz bant geçiren süzgeç (42–180 atım/dk dışını atar; ileri-geri uygulanır, faz kaymaz).',
        'Frekans analizi: Hann pencereli Fourier dönüşümü ile 0,5 atım/dk adımlarla güç spektrumu; en yüksek tepe parabolik aradeğerlemeyle inceltilir. BPM = tepe frekansı × 60.',
        'Güven: tepe gücünün bandın geri kalanına oranı (SNR). SNR düşükse sonuç gösterilir ama "zayıf sinyal" uyarısı verilir.',
      ],
      task: 'Kamera modunda iyi ışıkta, kıpırdamadan 15 sn bekle; sonra parmağını bileğine koyup 15 sn say ve ×4 yap. Başını sallarken ya da ışığı kısınca SNR\'ye ne oluyor? Analiz penceresini 6 sn\'ye indir: sonuç daha hızlı ama daha oynak.',
      sample: 'Örnek sahne: çizilmiş bir yüz, derisinin yeşil kanalı gözle görülmeyecek kadar az (±2 birim) 68 atım/dk ile değişir; üstüne ışık titremesi, yavaş parlaklık kayması ve küçük baş hareketi eklenmiştir. Ölçüm, çizilen piksellerden gerçekten yapılır.',
      note: 'Eğitim amaçlıdır, tıbbi değildir. Teşhis ya da sağlık kararı için kullanma; ölçüm ışığa, harekete ve ten rengine göre hatalı olabilir.',
    },
    en: {
      title: 'Pulse from the camera (rPPG)', tagline: 'Estimate the heartbeat from invisible changes in face colour.',
      intro: 'Every heartbeat pushes a little more blood into the capillaries of the face, and the skin absorbs slightly more green light, far too little to see. Remote photoplethysmography (rPPG) measures this tiny change with a camera. The signal is very weak (1–2 units of pixel value), so thousands of pixels are averaged and signal processing is applied.',
      steps: [
        'Landmarks: 478 face points from MediaPipe Face Mesh; a measurement region (ROI) around the forehead point (151), 36% × 14% of face width. The forehead moves little and has no hair.',
        'Raw signal: every frame, the mean green value of the pixels in the ROI and its time are recorded.',
        'Pre-processing: resampling to an even 30 Hz, normalising (g / mean − 1), a 0.7–3 Hz band-pass filter (removes everything outside 42–180 bpm; applied forwards and backwards, so no phase shift).',
        'Frequency analysis: Hann-windowed Fourier transform giving a power spectrum in 0.5 bpm steps; the highest peak is refined by parabolic interpolation. BPM = peak frequency × 60.',
        'Confidence: the ratio of the peak power to the rest of the band (SNR). If SNR is low the result is shown with a "weak signal" warning.',
      ],
      task: 'In camera mode sit still in good light for 15 s; then put a finger on your wrist, count for 15 s and multiply by 4. What happens to SNR when you move your head or dim the light? Lower the analysis window to 6 s: faster but jumpier.',
      sample: 'Sample scene: a drawn face whose skin green channel changes invisibly (±2 units) at 68 bpm, with light flicker, a slow brightness drift and a small head movement on top. The measurement really is taken from the drawn pixels.',
      note: 'For education only, not medical. Do not use it for diagnosis or health decisions; the reading can be wrong depending on light, movement and skin tone.',
    },
    py: `import cv2, numpy as np, mediapipe as mp
from scipy.signal import butter, filtfilt

face = mp.solutions.face_mesh.FaceMesh(max_num_faces=1)
cap = cv2.VideoCapture(0); FS = cap.get(cv2.CAP_PROP_FPS) or 30
greens = []

while cap.isOpened():
    ok, frame = cap.read()
    if not ok: break
    h, w = frame.shape[:2]
    res = face.process(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
    if res.multi_face_landmarks:
        lm = res.multi_face_landmarks[0].landmark
        fw = abs(lm[454].x - lm[234].x) * w                       # yüz genişliği || face width
        cx, cy = lm[151].x * w, lm[151].y * h                     # alın || forehead
        x0, y0 = int(cx - 0.18 * fw), int(cy - 0.07 * fw)
        roi = frame[y0:y0 + int(0.14 * fw), x0:x0 + int(0.36 * fw)]
        greens.append(roi[:, :, 1].mean())                        # yeşil kanal (BGR'de 1) || green channel (1 in BGR)
    if len(greens) >= FS * 10:
        x = np.array(greens[-int(FS * 10):]); x = x / x.mean() - 1
        b, a = butter(2, [0.7, 3.0], btype="band", fs=FS)
        y = filtfilt(b, a, x) * np.hanning(len(x))
        freqs = np.fft.rfftfreq(len(y) * 8, 1 / FS); power = np.abs(np.fft.rfft(y, len(y) * 8)) ** 2
        band = (freqs >= 0.7) & (freqs <= 3.0)
        bpm = freqs[band][power[band].argmax()] * 60
        cv2.putText(frame, f"{bpm:.0f} BPM (tibbi degil)", (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)  # not medical
    cv2.imshow("rppg", frame)
    if cv2.waitKey(1) == 27: break`,
  },
  {
    slug: 'trafik-sayaci', emoji: '🚗', color: '#e0f2fe', sector: 'traffic', model: 'pixel',
    params: [
      { key: 'line', min: 0.2, max: 0.85, step: 0.05, def: 0.6, tr: 'Sayma çizgisi (yükseklik oranı)', en: 'Counting line (height ratio)' },
      { key: 'mpp', min: 0.05, max: 0.2, step: 0.005, def: 0.1, tr: 'Kalibrasyon', en: 'Calibration', unit: 'm/px' },
      { key: 'limit', min: 30, max: 120, step: 5, def: 70, tr: 'Hız sınırı', en: 'Speed limit', unit: 'km/sa' },
    ],
    tr: {
      title: 'Trafik sayacı ve hız tahmini', tagline: 'Yukarıdan bakan kamerayla araç say, yönünü ve hızını ölç.',
      intro: 'Belediyelerin trafik kameraları, otopark girişleri ve kavşak sayımları için klasik boru hattı: derin öğrenme bile gerekmez. Sabit kamerada yol değişmez, araçlar değişir; arka planı öğrenip çıkarırsak geriye hareket eden lekeler kalır. Lekeleri kareden kareye eşleyip bir çizgiyi geçenleri sayarız; piksel/metre kalibrasyonuyla hız da çıkar.',
      steps: [
        'Küçültme ve gri ton: kare 320×240\'a küçültülür ve gri tona çevrilir (hız için).',
        'Arka plan modeli: seçici koşan ortalama. Araç olmayan piksellerde arka plan += 0,05 × (kare − arka plan); araç üstündeki piksellerde 0,002 ile (araçlar arka plana karışmasın).',
        'Ön plan maskesi: |kare − arka plan| > 28 olan pikseller beyaz. 4-komşulu bağlı bileşenler; 25 pikselden küçük lekeler gürültü sayılır.',
        'İzleme: her iz, önceki karedeki konumuna 30 px içindeki en yakın lekeyle eşlenir; 8 kare görünmeyen iz silinir.',
        'Sayma ve hız: iz merkezi sayma çizgisini geçince yönüne göre sayılır. Hız = son ~1 sn\'deki yer değiştirme (px) × kalibrasyon (m/px) ÷ süre × 3,6 → km/sa. Sınırı aşan araç kırmızı işaretlenir.',
      ],
      task: 'Örnek sahnede her aracın gerçek hızı yanında yazar: kalibrasyonu 0,08 ya da 0,12 m/px yaparak ölçülen hızın nasıl kaydığını gör (sahne 0,10 m/px ile çizildi: kesik çizgiler 3 m, aralar 6 m). Sayma çizgisini taşı. Kamera modunda kamerayı sabit tut ve önünden bir nesne geçir: hareket eden her şey leke olur.',
      sample: 'Örnek sahne: yukarıdan görülen dört şeritli yol; araçlar farklı hızlarla iki yönde akar. Arka plan çıkarma, lekeler ve izleme çizilen piksellerden gerçekten hesaplanır.',
    },
    en: {
      title: 'Traffic counter and speed estimation', tagline: 'Count vehicles with an overhead camera and measure direction and speed.',
      intro: 'The classic pipeline behind city traffic cameras, car park entrances and junction counts: it does not even need deep learning. With a fixed camera the road stays the same and the vehicles change; learn the background and subtract it, and moving blobs remain. Match the blobs from frame to frame and count those crossing a line; with a pixel-to-metre calibration you also get speed.',
      steps: [
        'Downscale and greyscale: the frame is shrunk to 320×240 and converted to grey (for speed).',
        'Background model: a selective running average. On non-vehicle pixels background += 0.05 × (frame − background); on vehicle pixels with 0.002 (so vehicles do not blend into the background).',
        'Foreground mask: pixels with |frame − background| > 28 are white. 4-connected components; blobs under 25 pixels count as noise.',
        'Tracking: each track is matched to the nearest blob within 30 px of its previous position; a track unseen for 8 frames is dropped.',
        'Counting and speed: when a track centre crosses the counting line it is counted by direction. Speed = displacement over the last ~1 s (px) × calibration (m/px) ÷ time × 3.6 → km/h. Vehicles over the limit are marked red.',
      ],
      task: 'In the sample scene each vehicle\'s true speed is shown next to it: set the calibration to 0.08 or 0.12 m/px and watch the measured speed drift (the scene is drawn at 0.10 m/px: dashes are 3 m, gaps 6 m). Move the counting line. In camera mode hold the camera still and move an object past it: everything that moves becomes a blob.',
      sample: 'Sample scene: a four-lane road seen from above; vehicles flow both ways at different speeds. Background subtraction, blobs and tracking are really computed from the drawn pixels.',
    },
    py: `import cv2, numpy as np

cap = cv2.VideoCapture("yol.mp4")          # sabit kamera || fixed camera
MPP, LINE_Y, FPS = 0.10, 144, cap.get(cv2.CAP_PROP_FPS) or 30
bg, tracks, next_id, count = None, {}, 1, {"asagi": 0, "yukari": 0}  # down / up

while cap.isOpened():
    ok, frame = cap.read()
    if not ok: break
    g = cv2.cvtColor(cv2.resize(frame, (320, 240)), cv2.COLOR_BGR2GRAY).astype(np.float32)
    if bg is None: bg = g.copy()
    mask = (np.abs(g - bg) > 28).astype(np.uint8)
    bg += np.where(mask, 0.002, 0.05) * (g - bg)              # seçici koşan ortalama || selective running average
    n, labels, stats, cents = cv2.connectedComponentsWithStats(mask, connectivity=4)
    blobs = [tuple(cents[i]) for i in range(1, n) if stats[i, cv2.CC_STAT_AREA] >= 25]
    new = {}
    for (cx, cy) in blobs:                                      # en yakın iz || nearest track
        tid = min(tracks, key=lambda k: np.hypot(*np.subtract(tracks[k][-1], (cx, cy))), default=None)
        if tid is None or np.hypot(*np.subtract(tracks[tid][-1], (cx, cy))) > 30 or tid in new:
            tid, next_id = next_id, next_id + 1
        hist = tracks.get(tid, []) + [(cx, cy)]
        if len(hist) > 1 and (hist[-2][1] < LINE_Y) != (hist[-1][1] < LINE_Y):
            count["asagi" if hist[-1][1] > hist[-2][1] else "yukari"] += 1
            k = hist[-min(len(hist), int(FPS)):]
            kmh = abs(k[-1][1] - k[0][1]) * MPP / (len(k) / FPS) * 3.6
            print(f"arac {tid}: {kmh:.0f} km/sa")
        new[tid] = hist[-60:]
    tracks = new`,
  },
  {
    slug: 'meyve-olgunlugu', emoji: '🍅', color: '#fef3c7', sector: 'agri', model: 'pixel',
    params: [
      { key: 'ripe', min: 0.3, max: 0.9, step: 0.05, def: R.ripe, tr: 'Olgun eşiği (kırmızı oranı)', en: 'Ripe threshold (red ratio)' },
      { key: 'redMax', min: 8, max: 35, step: 1, def: R.redMax, tr: 'Kırmızı ton sınırı', en: 'Red hue limit', unit: '°' },
      { key: 'sMin', min: 0.15, max: 0.7, step: 0.05, def: R.sMin, tr: 'En düşük doygunluk', en: 'Minimum saturation' },
    ],
    tr: {
      title: 'Meyve olgunluğu (renk ayrıştırma)', tagline: 'Hasat ve paketleme bandında domatesleri renginden sınıflandır.',
      intro: 'Paketleme tesislerindeki ayıklama makineleri ve hasat robotları için en eski ve hâlâ en çok kullanılan yöntem: RGB yerine HSV renk uzayına geçmek. HSV\'de "ton" (H) rengin kendisidir, ışık değişse de pek değişmez; böylece kırmızı, turuncu ve yeşil pikselleri basit aralıklarla ayırabiliriz.',
      steps: [
        'Renk uzayı: her piksel RGB\'den HSV\'ye çevrilir: H ton (0–360°), S doygunluk, V parlaklık.',
        `Arka planı atma: S < ${tc(R.sMin)} (gri bant) ya da V < ${tc(R.vMin)} (gölge) olan pikseller meyve değildir.`,
        `Ton sınıfları: H < ${tc(R.redMax)}° ya da ≥ 340° → kırmızı; ${tc(R.redMax)}–${tc(R.yellowMax)}° → sarı/turuncu; ${tc(R.yellowMax)}–${tc(R.greenMax)}° → yeşil.`,
        'Nesneler: meyve maskesinde bağlı bileşenler (her leke bir meyve), her leke için kırmızı/sarı/yeşil piksel sayımı.',
        `Kural: olgunluk oranı = kırmızı / (kırmızı + sarı + yeşil). ≥ ${tc(R.ripe)} → olgun, ≥ ${tc(R.half)} → yarı olgun, değilse ham. Banttaki kapıyı geçen meyveler sınıfına göre sayılır.`,
      ],
      task: 'Olgun eşiğini 0,9 yap: hangi domatesler "yarı olgun"a düştü? Kırmızı ton sınırını 35°\'ye çıkar: turuncular da kırmızı sayılmaya başlar. Kamera modunda ortadaki kutuya kırmızı, turuncu ya da yeşil bir nesne tut.',
      sample: 'Örnek sahne: konveyör bandında farklı olgunlukta, programla çizilmiş domatesler. HSV ayrıştırma çizilen piksellerde gerçekten yapılır.',
    },
    en: {
      title: 'Fruit ripeness (colour segmentation)', tagline: 'Sort tomatoes by colour on a harvest or packing line.',
      intro: 'The oldest and still most widely used method in sorting machines at packing plants and in harvesting robots: switch from RGB to the HSV colour space. In HSV the "hue" (H) is the colour itself and barely changes when the light changes, so red, orange and green pixels can be separated with simple ranges.',
      steps: [
        'Colour space: each pixel is converted from RGB to HSV: H hue (0–360°), S saturation, V value (brightness).',
        `Removing the background: pixels with S < ${R.sMin} (grey belt) or V < ${R.vMin} (shadow) are not fruit.`,
        `Hue classes: H < ${R.redMax}° or ≥ 340° → red; ${R.redMax}–${R.yellowMax}° → yellow/orange; ${R.yellowMax}–${R.greenMax}° → green.`,
        'Objects: connected components of the fruit mask (each blob is a fruit), with red/yellow/green pixel counts per blob.',
        `Rule: ripeness ratio = red / (red + yellow + green). ≥ ${R.ripe} → ripe, ≥ ${R.half} → half-ripe, otherwise unripe. Fruit passing the gate on the belt are counted by class.`,
      ],
      task: 'Set the ripe threshold to 0.9: which tomatoes dropped to "half-ripe"? Raise the red hue limit to 35°: oranges start counting as red. In camera mode hold a red, orange or green object inside the centre box.',
      sample: 'Sample scene: procedurally drawn tomatoes of different ripeness on a conveyor belt. HSV segmentation really runs on the drawn pixels.',
    },
    py: `import cv2, numpy as np

img = cv2.imread("bant.jpg")                                   # konveyör görüntüsü || conveyor image
hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)                     # OpenCV'de H 0–180 || in OpenCV H is 0–180
H, S, V = hsv[..., 0] * 2, hsv[..., 1] / 255, hsv[..., 2] / 255
fruit = (S >= ${R.sMin}) & (V >= ${R.vMin})                     # gri bant ve gölge dışarıda || grey belt and shadow out
red = fruit & ((H < ${R.redMax}) | (H >= 340))
yellow = fruit & (H >= ${R.redMax}) & (H < ${R.yellowMax})
green = fruit & (H >= ${R.yellowMax}) & (H < ${R.greenMax})
mask = (red | yellow | green).astype(np.uint8)
n, labels, stats, _ = cv2.connectedComponentsWithStats(mask)
for i in range(1, n):
    if stats[i, cv2.CC_STAT_AREA] < 200: continue
    blob = labels == i
    r, y, g = red[blob].sum(), yellow[blob].sum(), green[blob].sum()
    ratio = r / (r + y + g)
    label = "olgun" if ratio >= ${R.ripe} else "yari olgun" if ratio >= ${R.half} else "ham"  # ripe / half / unripe
    x, y0, w, h = stats[i, :4]
    cv2.rectangle(img, (x, y0), (x + w, y0 + h), (255, 255, 255), 2)
    cv2.putText(img, f"{label} {ratio:.0%}", (x, y0 - 6), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
cv2.imwrite("sonuc.jpg", img)`,
  },
  {
    slug: 'yorgunluk', emoji: '🥱', color: '#ede9fe', sector: 'driver', model: 'face',
    params: [
      { key: 'ear', min: 0.12, max: 0.3, step: 0.01, def: Y.ear, tr: 'Göz kapalı eşiği (EAR)', en: 'Eye closed threshold (EAR)' },
      { key: 'closedSec', min: 0.3, max: 2, step: 0.1, def: Y.closedSec, tr: 'Uyuklama süresi', en: 'Drowsiness time', unit: 'sn' },
      { key: 'mar', min: 0.3, max: 0.9, step: 0.05, def: Y.mar, tr: 'Esneme eşiği (MAR)', en: 'Yawn threshold (MAR)' },
    ],
    tr: {
      title: 'Yorgunluk ve esneme tespiti', tagline: 'Sürücü izleme sistemleri: gözler kapanırsa ya da esnersen uyar.',
      intro: 'Yeni araçlarda zorunlu hâle gelen sürücü dikkat izleme sistemlerinin temeli: gözün açıklığını tek bir sayıyla ölçmek. Göz en-boy oranı (EAR), göz kapakları arasındaki dikey mesafelerin göz genişliğine oranıdır; göz kapanınca sıfıra yaklaşır. Aynı fikir ağız için esnemeyi verir.',
      steps: [
        'Nokta bulma: MediaPipe Face Mesh ile 478 yüz noktası. Her göz için 6 nokta (sol: 362, 385, 387, 263, 373, 380; sağ: 33, 160, 158, 133, 153, 144), ağız için köşeler (61, 291) ve üç iç dudak çifti.',
        'Özellik 1, EAR = (|p2 − p6| + |p3 − p5|) / (2 · |p1 − p4|), iki gözün ortalaması. Açık göz ≈ 0,25–0,35.',
        'Özellik 2, MAR = iç dudak aralıklarının ortalaması / ağız genişliği. Kapalı ağız < 0,1.',
        `Kural: EAR < ${tc(Y.ear)} → göz kapalı. ${tc(Y.closedSec)} sn\'den kısa kapanma göz kırpmadır (dakikadaki sayısı tutulur); daha uzunsa UYUKLAMA alarmı. MAR > ${tc(Y.mar)}, ${tc(Y.yawnSec)} sn sürerse ESNEME.`,
        'PERCLOS: son 30 sn\'de gözlerin kapalı olduğu zamanın oranı; yorgunluk araştırmalarında kullanılan ölçü.',
      ],
      task: 'Kamera modunda kendi açık göz EAR değerine bak; eşik ondan ne kadar düşük olmalı? Gözlüklüysen eşiği ayarlaman gerekebilir. 1 saniye gözlerini kapat, sonra esner gibi ağzını aç. Uyuklama süresini 0,3 sn yap: göz kırpmaların alarma dönüştüğünü gör.',
      sample: 'Örnek sahne: sentetik bir sürücü yüzü; normal göz kırpar, sonra gözleri uzun süre kapanır ve esner. Göz ve ağız noktaları sahne üreticisinden gelir.',
      note: 'Eğitim amaçlıdır; gerçek araç sistemleri kızılötesi kamera, baş pozu ve çok daha fazla doğrulama kullanır.',
    },
    en: {
      title: 'Drowsiness and yawn detection', tagline: 'Driver monitoring systems: a warning when your eyes close or you yawn.',
      intro: 'The basis of driver attention monitoring, now mandatory in new cars: measuring how open the eye is with a single number. The eye aspect ratio (EAR) is the vertical distance between the eyelids divided by the eye width; it approaches zero when the eye closes. The same idea for the mouth gives yawning.',
      steps: [
        'Landmarks: 478 face points from MediaPipe Face Mesh. 6 points per eye (left: 362, 385, 387, 263, 373, 380; right: 33, 160, 158, 133, 153, 144), the mouth corners (61, 291) and three inner lip pairs.',
        'Feature 1, EAR = (|p2 − p6| + |p3 − p5|) / (2 · |p1 − p4|), averaged over both eyes. An open eye ≈ 0.25–0.35.',
        'Feature 2, MAR = mean inner lip gap / mouth width. A closed mouth < 0.1.',
        `Rule: EAR < ${Y.ear} → eye closed. A closure shorter than ${Y.closedSec} s is a blink (counted per minute); longer is a DROWSY alarm. MAR > ${Y.mar} for ${Y.yawnSec} s → YAWN.`,
        'PERCLOS: the share of time the eyes were closed over the last 30 s; a measure used in fatigue research.',
      ],
      task: 'In camera mode look at your own open-eye EAR; how far below it should the threshold be? With glasses you may need to adjust it. Close your eyes for 1 second, then open your mouth as if yawning. Set the drowsiness time to 0.3 s and watch blinks turn into alarms.',
      sample: 'Sample scene: a synthetic driver face; it blinks normally, then the eyes close for a long time and it yawns. The eye and mouth points come from the scene generator.',
      note: 'For education; real vehicle systems use infrared cameras, head pose and much more validation.',
    },
    py: `import cv2, math, time, mediapipe as mp

face = mp.solutions.face_mesh.FaceMesh(max_num_faces=1, refine_landmarks=True)
L_EYE, R_EYE = [362, 385, 387, 263, 373, 380], [33, 160, 158, 133, 153, 144]
EAR_T, CLOSED_S, MAR_T, YAWN_S = ${Y.ear}, ${Y.closedSec}, ${Y.mar}, ${Y.yawnSec}
closed_since = yawn_since = None
cap = cv2.VideoCapture(0)

def ear(p):  # göz en-boy oranı || eye aspect ratio
    return (math.dist(p[1], p[5]) + math.dist(p[2], p[4])) / (2 * math.dist(p[0], p[3]))

while cap.isOpened():
    ok, frame = cap.read()
    if not ok: break
    h, w = frame.shape[:2]; now = time.time()
    res = face.process(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
    if res.multi_face_landmarks:
        lm = [(p.x * w, p.y * h) for p in res.multi_face_landmarks[0].landmark]
        e = (ear([lm[i] for i in L_EYE]) + ear([lm[i] for i in R_EYE])) / 2
        mar = sum(math.dist(lm[a], lm[b]) for a, b in [(13, 14), (81, 178), (311, 402)]) / 3 / math.dist(lm[61], lm[291])
        closed_since = (closed_since or now) if e < EAR_T else None
        yawn_since = (yawn_since or now) if mar > MAR_T else None
        if closed_since and now - closed_since > CLOSED_S:
            cv2.putText(frame, "UYUKLAMA!", (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 1.2, (0, 0, 255), 3)  # DROWSY!
        elif yawn_since and now - yawn_since > YAWN_S:
            cv2.putText(frame, "ESNEME", (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 1.2, (0, 165, 255), 3)    # YAWN
    cv2.imshow("fatigue", frame)
    if cv2.waitKey(1) == 27: break`,
  },
]

export const demoOf = (slug: string) => DEMOS.find((d) => d.slug === slug)
export const paramDefaults = (d: Demo): Record<string, number> => Object.fromEntries(d.params.map((p) => [p.key, p.def]))

/** Bölüm sayfasının metinleri. */
export const DEMO_TEXT = {
  tr: {
    title: 'Gerçek Hayat Demoları', eyebrow: 'Büyükler ve gençler için · görüntü işleme',
    lead: 'Sağlık, güvenlik, iş güvenliği, trafik ve tarımda kullanılan gerçek bilgisayarlı görü sistemlerinin küçük, çalışan kopyaları. Her demo tarayıcında çalışır: kamerayla canlı dene ya da kamerasız örnek sahneyi izle. Boru hattını adım adım, gerçek eşikleriyle ve aynı işi yapan Python koduyla gör.',
    privacy: 'Kamera görüntüsü yalnız bu cihazda işlenir; hiçbir yere gönderilmez ve kaydedilmez. Sekmeden ya da sayfadan çıkınca kamera kapanır.',
    kids: 'Robotun Gözleri (8–12 yaş)', all: 'Tüm demolar', how: 'Nasıl çalışıyor?', task: 'Kendin dene', code: 'Python karşılığı (OpenCV / MediaPipe)',
    sample: 'Örnek sahne', camera: 'Canlı kamera', start: 'Kamerayı aç', stop: 'Kamerayı kapat', loading: 'Model yükleniyor…', play: 'Oynat', pause: 'Duraklat',
    denied: 'Kamera izni verilmedi. Adres çubuğundaki kamera simgesinden izin verip yeniden dene ya da örnek sahneyi kullan.',
    error: 'Kamera ya da model açılamadı. Başka bir tarayıcı (Chrome, Edge, Safari) dene ya da örnek sahneyi kullan.',
    paused: 'Sekme gizlendiği için kamera kapatıldı.', params: 'Eşikler', reset: 'Varsayılanlar', model: 'Model', sector: 'Alan',
    pipeline: 'Boru hattı: noktalar → özellikler → kural → alarm', open: 'Demoyu aç', status: 'Durum', note: 'Not',
    draw: 'Bölgeyi çiz', done: 'Bitti', night: 'Gece modu', calibrate: 'Kalibre et', clickZone: 'Görüntüye tıkla: bölge oraya taşınır.',
    drawHelp: 'Görüntüye tıklayarak köşe ekle (en az 3), sonra Bitti.', reduced: 'Hareket azaltma tercihin açık: örnek sahne kendiliğinden oynamaz.',
  },
  en: {
    title: 'Real-World Demos', eyebrow: 'For adults and teens · computer vision',
    lead: 'Small, working copies of real computer vision systems used in health, security, workplace safety, traffic and agriculture. Every demo runs in your browser: try it live with the camera or watch the camera-free sample scene. See the pipeline step by step, with its real thresholds and the Python code that does the same job.',
    privacy: 'The camera image is processed only on this device; it is never sent anywhere or recorded. Leaving the tab or page turns the camera off.',
    kids: 'Robot Eyes (ages 8–12)', all: 'All demos', how: 'How does it work?', task: 'Try it yourself', code: 'Python equivalent (OpenCV / MediaPipe)',
    sample: 'Sample scene', camera: 'Live camera', start: 'Turn on camera', stop: 'Turn off camera', loading: 'Loading model…', play: 'Play', pause: 'Pause',
    denied: 'Camera permission was not given. Allow it from the camera icon in the address bar and try again, or use the sample scene.',
    error: 'The camera or model could not start. Try another browser (Chrome, Edge, Safari) or use the sample scene.',
    paused: 'The camera was turned off because the tab was hidden.', params: 'Thresholds', reset: 'Defaults', model: 'Model', sector: 'Field',
    pipeline: 'Pipeline: landmarks → features → rule → alert', open: 'Open demo', status: 'Status', note: 'Note',
    draw: 'Draw zone', done: 'Done', night: 'Night mode', calibrate: 'Calibrate', clickZone: 'Click the image to move the zone there.',
    drawHelp: 'Click the image to add corners (at least 3), then Done.', reduced: 'Your reduced-motion preference is on: the sample scene does not play by itself.',
  },
} as const
