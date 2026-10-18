// Raspberry Pi dersi üniteleri 6–10: kamera ve OpenCV, motorlar ve enkoder, diferansiyel sürüş, Flask paneli, ROS 2 ve systemd.
import type { CourseUnit } from '@/lib/gomulu/types'
import { fetchJs, flaskPy, motorPy, odomPy, rosPy, serviceUnit, visionPy } from './code'
import type { RpiSimId } from './sims'

export const UNITS_B: CourseUnit<RpiSimId>[] = [
  {
    n: 6, hours: 5, sims: ['vision'], hyvex: ['raspberry-pi-4b', 'raspberry-pi-ai-hat-hailo-8l', 'esp32-cam'], esofWeek: 10,
    tr: {
      title: 'Kamera ve OpenCV: renkli hedef bulma',
      summary: 'picamera2 ile kare yakalama, HSV eşikleme, morfoloji, momentler ve hedefe dönüş komutu.',
      goals: ['picamera2 ile düşük çözünürlükte kare yakalamak ve kare hızını ölçmek', 'BGR → HSV dönüşümü ve inRange ile renk maskesi çıkarmak', 'Açma işlemiyle gürültüyü temizleyip momentlerle ağırlık merkezini bulmak', 'Hedefin yatay sapmasını robot için dönüş komutuna çevirmek'],
      notes: `<p>Pi kamera modülü (Camera Module 3 gibi) CSI kablosuyla bağlanır ve <code>picamera2</code> kütüphanesiyle okunur. Robotta yüksek çözünürlük gereksizdir: 320 × 240 piksel, Pi 4\'te bile saniyede onlarca kare işlemeye yeter.</p>
<h3>Neden HSV?</h3>
<p>RGB\'de bir topun rengi ışıkla birlikte üç kanalda birden değişir. HSV\'de <b>H</b> (ton) rengin kendisini, <b>S</b> doygunluğu, <b>V</b> parlaklığı tutar: gölgede yalnız V düşer. OpenCV\'de H 0–179 (derece / 2), S ve V 0–255 aralığındadır. Kırmızı tonun iki ucunda (170–179 ve 0–10) olduğu için iki maske birleştirilir.</p>
<h3>Boru hattı</h3>
<ul><li><b>Eşikleme</b>: <code>cv2.inRange(hsv, lo, hi)</code> ikili maske verir.</li><li><b>Açma</b>: önce aşındır (tek piksellik gürültü silinir), sonra genişlet (top eski boyuna döner).</li><li><b>Momentler</b>: m00 alan, (m10/m00, m01/m00) ağırlık merkezi.</li><li><b>Karar</b>: alan eşikten küçükse "hedef yok"; değilse sapma = (cx − W/2) / (W/2), dönüş = k · sapma.</li></ul>
<p>Daha ağır işler (nesne tanıma) için Pi\'nin AI HAT\'i gibi hızlandırıcılar ya da sitenin <a href="/robotun-gozleri/demolar">Gerçek hayat demoları</a> bölümündeki cihaz içi modeller kullanılır; ilkeler aynıdır: algıla, filtrele, karar ver.</p>`,
      code: [visionPy('tr')],
      tryIt: 'Benzetimde kırmızı topu sağa kaydır ve dönüş komutunun işaretini izle. Gürültüyü artır: açma kapalıyken maskede kaç piksel gürültü kalıyor, açınca ne oluyor? Işığı %40\'a indir ve eşiğin V alt sınırını düşürmeden topun neden kaybolduğunu açıkla. Gerçek Pi\'de: kodu çalıştırıp kare hızını yazdır.',
      pitfalls: ['picamera2\'nin RGB888 biçiminin bellekte BGR sırası olduğunu unutmak: renkler yer değiştirir.', 'Eşikleri tek bir ışıkta ayarlamak: sınıfta çalışan eşik koridorda çalışmaz; S ve V alt sınırlarını geniş tut.', 'Tam çözünürlükte işlemek: kare hızı düşer, denetim gecikir.', 'Hedef yokken son komutu sürdürmek: robot kaybolan hedefin peşinden duvara gider.'],
      se: `<p>Görüntü boru hattını <b>kayıtlı karelerle</b> test et: kamera yok, sonuç deterministik.</p>
<ul><li>Birkaç örnek kare ve beklenen ağırlık merkezi bir test fikstürü olsun.</li><li>Eşikleri koddan çıkarıp YAML\'a koy; sahada ayarlanır, kod değişmez.</li></ul>`,
      quiz: [
        { q: 'Renk eşiklemede HSV neden RGB\'ye tercih edilir?', options: ['Daha az bellek kullanır', 'Ton (H) ışık değişince büyük ölçüde sabit kalır', 'Kameralar HSV üretir', 'OpenCV RGB bilmez'], answer: 1, why: 'Gölgede çoğunlukla V düşer; ton aynı kalır, eşik daha dayanıklı olur.' },
        { q: 'OpenCV\'de H kanalının aralığı nedir?', options: ['0–360', '0–255', '0–179', '0–100'], answer: 2, why: '8 bitte saklamak için derece ikiye bölünür: 0–179.' },
        { q: 'Açma (opening) işlemi ne yapar?', options: ['Önce genişletir sonra aşındırır; delikleri kapatır', 'Önce aşındırır sonra genişletir; küçük gürültü lekelerini siler', 'Görüntüyü döndürür', 'Rengi değiştirir'], answer: 1, why: 'Aşındırma küçük lekeleri yok eder, genişletme kalan nesneyi eski boyutuna getirir.' },
        { q: '320 piksel genişliğinde karede top cx = 240\'ta. Normalize sapma nedir?', options: ['−0,5', '0', '+0,5', '+1'], answer: 2, why: '(240 − 160) / 160 = +0,5: hedef sağda.' },
      ],
    },
    en: {
      title: 'Camera and OpenCV: finding a coloured target',
      summary: 'Capturing frames with picamera2, HSV thresholding, morphology, moments and a turn command toward the target.',
      goals: ['Capture low-resolution frames with picamera2 and measure the frame rate', 'Convert BGR → HSV and build a colour mask with inRange', 'Clean noise with opening and find the centroid with moments', 'Turn the target\'s horizontal offset into a steering command for the robot'],
      notes: `<p>The Pi camera module (such as Camera Module 3) connects over a CSI cable and is read with the <code>picamera2</code> library. A robot does not need high resolution: 320 × 240 pixels is enough to process dozens of frames per second even on a Pi 4.</p>
<h3>Why HSV?</h3>
<p>In RGB the colour of a ball changes in all three channels with the light. In HSV, <b>H</b> (hue) holds the colour itself, <b>S</b> the saturation, <b>V</b> the brightness: in shadow only V drops. In OpenCV H is 0–179 (degrees / 2), S and V are 0–255. Red sits at both ends of the hue range (170–179 and 0–10), so two masks are combined.</p>
<h3>The pipeline</h3>
<ul><li><b>Threshold</b>: <code>cv2.inRange(hsv, lo, hi)</code> gives a binary mask.</li><li><b>Opening</b>: erode first (single-pixel noise disappears), then dilate (the ball returns to its size).</li><li><b>Moments</b>: m00 is the area, (m10/m00, m01/m00) the centroid.</li><li><b>Decision</b>: if the area is below a threshold, "no target"; otherwise offset = (cx − W/2) / (W/2), turn = k · offset.</li></ul>
<p>Heavier work (object recognition) uses accelerators such as the Pi AI HAT or the on-device models in the site\'s <a href="/robotun-gozleri/demolar">Real-life demos</a>; the principles are the same: sense, filter, decide.</p>`,
      code: [visionPy('en')],
      tryIt: 'In the simulation move the red ball to the right and watch the sign of the turn command. Raise the noise: how many noise pixels stay in the mask with opening off, and what happens when you turn it on? Lower the light to 40 % and explain why the ball disappears unless you lower the V lower bound. On a real Pi: run the code and print the frame rate.',
      pitfalls: ['Forgetting that picamera2\'s RGB888 format is BGR order in memory: colours swap.', 'Tuning thresholds under a single light: a threshold that works in the classroom fails in the corridor; keep the S and V lower bounds wide.', 'Processing at full resolution: the frame rate drops and control lags.', 'Keeping the last command when there is no target: the robot chases a lost target into the wall.'],
      se: `<p>Test the vision pipeline with <b>recorded frames</b>: no camera, deterministic results.</p>
<ul><li>A few sample frames and their expected centroids become a test fixture.</li><li>Move the thresholds out of the code into YAML; they are tuned in the field without changing code.</li></ul>`,
      quiz: [
        { q: 'Why is HSV preferred over RGB for colour thresholding?', options: ['It uses less memory', 'Hue (H) stays largely constant when the light changes', 'Cameras produce HSV', 'OpenCV does not know RGB'], answer: 1, why: 'In shadow mostly V drops; the hue stays the same and the threshold is more robust.' },
        { q: 'What is the range of the H channel in OpenCV?', options: ['0–360', '0–255', '0–179', '0–100'], answer: 2, why: 'To store it in 8 bits the degrees are halved: 0–179.' },
        { q: 'What does opening do?', options: ['Dilates then erodes; closes holes', 'Erodes then dilates; removes small noise specks', 'Rotates the image', 'Changes the colour'], answer: 1, why: 'Erosion removes small specks, dilation brings the remaining object back to its size.' },
        { q: 'In a 320-pixel-wide frame the ball is at cx = 240. What is the normalised offset?', options: ['−0.5', '0', '+0.5', '+1'], answer: 2, why: '(240 − 160) / 160 = +0.5: the target is on the right.' },
      ],
    },
  },
  {
    n: 7, hours: 5, sims: ['motor'], hyvex: ['l298n', 'tb6612fng', 'metal-disli-dc-motor', 'li-ion-18650-batarya', 'lm2596-buck'], esofWeek: 5,
    tr: {
      title: 'Motorlar: L298N, enkoder ve hız denetimi',
      summary: 'H köprüsü, PWM ile hız, enkoderden yön ve devir, PI döngüsü; güç ve toprak düzeni.',
      goals: ['H köprüsünün ileri, geri, fren ve serbest kiplerini IN1/IN2/EN ile açıklamak', 'Dörtlü enkoderin A/B kanallarından yön ve devir hesaplamak', 'PI hız denetimini ileri beslemeyle kurmak ve doyumda integrali dondurmak', 'Motor gücünü Pi\'den ayırıp ortak toprak kurmak'],
      notes: `<p>Bir DC motor Pi\'nin pininden sürülemez: amperlerce akım çeker ve kapanırken gerilim sıçraması üretir. Araya bir <b>H köprüsü</b> (L298N, TB6612FNG) girer: dört anahtar motorun uçlarını kaynağa iki yönde bağlar.</p>
<ul><li>IN1 = 1, IN2 = 0: ileri; IN1 = 0, IN2 = 1: geri.</li><li>IN1 = IN2: <b>fren</b> (motor uçları kısa devre, hızla durur).</li><li>EN = 0: <b>serbest</b> (motor kendi kendine yavaşlar).</li><li>EN\'e PWM verilince ortalama gerilim, dolayısıyla hız ayarlanır.</li></ul>
<p>L298N bipolar transistörlüdür ve yaklaşık 2 V düşürür: 7,4 V pilde motor ~5,4 V görür ve sürücü ısınır. TB6612FNG MOSFET\'lidir, kaybı çok azdır.</p>
<h3>Enkoder</h3>
<p>Motor miline bağlı dörtlü enkoderin iki kanalı (A, B) 90° faz farklıdır. Sıra 00 → 01 → 11 → 10 ise ileri, tersiyse geri. Her kenarı saymak (4× çözme) çözünürlüğü dört katına çıkarır. İki kanal aynı anda değişmiş görünüyorsa bir örnek kaçırılmıştır: Pi\'de yüksek hızda bu olur, bu yüzden hızlı enkoderler MCU\'ya bırakılır.</p>
<h3>PI denetimi</h3>
<p>Yük binince hız düşer. PI denetimi hatayı (hedef − ölçülen) hem anlık (P) hem birikmiş (I) olarak düzeltir. 3. ünitedeki doğru, ileri besleme olarak iyi bir başlangıç verir; I terimi geri kalanı kapatır.</p>`,
      code: [motorPy('tr')],
      tryIt: 'Benzetimde IN1/IN2 ile dört kipi dene ve fren ile serbest arasındaki duruş süresi farkını not et. Enkoder kanallarını izleyerek yönü sıradan oku. Yükü %40 yap: PI kapalıyken hız ne kadar düşüyor? PI\'ı aç ve hedefe ne kadar sürede oturduğunu ölç. KI\'yı çok büyütüp salınımı gör.',
      pitfalls: ['Motoru Pi\'nin 5 V pininden beslemek: Pi yeniden başlar ya da bozulur.', 'Motor kaynağı ile Pi arasında ortak GND kurmamak: sürücü girişleri tanımsız kalır.', 'Doyumda integrali biriktirmek (windup): hedef değişince robot uzun süre aşar.', 'Yön değiştirirken doğrudan ileriden geriye geçmek: akım sıçrar; önce dur ya da rampa kullan.'],
      se: `<p>PI denetleyicisi saf bir sınıftır: <code>step(target, measured, dt) → u</code>.</p>
<ul><li>Birinci dereceden motor modeliyle (benzetimdeki gibi) kapalı döngü testi yaz: "2 s içinde hedefin %5\'ine oturur".</li><li>Kazançlar ayar dosyasında; her değişiklik test ve günlükle belgelenir.</li></ul>`,
      quiz: [
        { q: 'L298N\'de IN1 = 1, IN2 = 1 ve EN = 1 ise motor ne yapar?', options: ['İleri döner', 'Geri döner', 'Fren yapar', 'Serbest kalır'], answer: 2, why: 'İki uç aynı potansiyelde: motor kısa devre edilir ve hızla durur.' },
        { q: 'Enkoder sırası 00 → 10 → 11 → 01 ise yön?', options: ['İleri', 'Geri', 'Duruyor', 'Hata'], answer: 1, why: 'İleri sıra 00 → 01 → 11 → 10\'dur; bu onun tersi.' },
        { q: '50 ms\'de 70 sayım, CPR 1400. Devir/dakika kaç?', options: ['30', '60', '120', '1400'], answer: 1, why: '70 / 1400 = 0,05 tur; 0,05 / 0,05 s = 1 tur/s = 60 rpm.' },
        { q: 'Integral windup nedir?', options: ['Motorun ısınması', 'Çıkış doyumdayken integralin büyümeye devam etmesi ve sonra aşmaya yol açması', 'Enkoder sayısının taşması', 'PWM frekansının değişmesi'], answer: 1, why: 'Doyumda integrali dondurmak (anti-windup) bu aşmayı önler.' },
      ],
    },
    en: {
      title: 'Motors: L298N, encoders and speed control',
      summary: 'The H-bridge, speed with PWM, direction and rpm from an encoder, a PI loop; power and ground layout.',
      goals: ['Explain the forward, reverse, brake and coast modes of an H-bridge with IN1/IN2/EN', 'Compute direction and rpm from a quadrature encoder\'s A/B channels', 'Build PI speed control with feedforward and freeze the integral when saturated', 'Separate motor power from the Pi and set up a common ground'],
      notes: `<p>A DC motor cannot be driven from a Pi pin: it draws amps and produces a voltage spike when switched off. An <b>H-bridge</b> (L298N, TB6612FNG) sits in between: four switches connect the motor terminals to the supply in either direction.</p>
<ul><li>IN1 = 1, IN2 = 0: forward; IN1 = 0, IN2 = 1: reverse.</li><li>IN1 = IN2: <b>brake</b> (the motor terminals are shorted and it stops quickly).</li><li>EN = 0: <b>coast</b> (the motor slows by itself).</li><li>PWM on EN sets the average voltage and so the speed.</li></ul>
<p>The L298N uses bipolar transistors and drops about 2 V: on a 7.4 V battery the motor sees ~5.4 V and the driver gets hot. The TB6612FNG uses MOSFETs and loses very little.</p>
<h3>Encoder</h3>
<p>The two channels (A, B) of a quadrature encoder on the motor shaft are 90° out of phase. The sequence 00 → 01 → 11 → 10 means forward, the reverse means backward. Counting every edge (4× decoding) quadruples the resolution. If both channels appear to change at once, a sample was missed: on a Pi this happens at high speed, which is why fast encoders are left to an MCU.</p>
<h3>PI control</h3>
<p>Speed drops when load is added. PI control corrects the error (target − measured) both instantly (P) and accumulated (I). The line from unit 3 gives a good starting point as feedforward; the I term closes the rest.</p>`,
      code: [motorPy('en')],
      tryIt: 'In the simulation try the four modes with IN1/IN2 and note the difference in stopping time between brake and coast. Read the direction from the order of the encoder channels. Set the load to 40 %: how much does speed drop with PI off? Turn PI on and measure how long it takes to settle. Make KI very large and see the oscillation.',
      pitfalls: ['Powering the motor from the Pi\'s 5 V pin: the Pi reboots or is damaged.', 'No common GND between the motor supply and the Pi: the driver inputs are undefined.', 'Letting the integral grow while saturated (windup): the robot overshoots for a long time when the target changes.', 'Going straight from forward to reverse: current spikes; stop first or use a ramp.'],
      se: `<p>The PI controller is a pure class: <code>step(target, measured, dt) → u</code>.</p>
<ul><li>Write a closed-loop test with a first-order motor model (as in the simulation): "settles within 5 % of the target in 2 s".</li><li>Gains live in a configuration file; every change is documented with a test and a log.</li></ul>`,
      quiz: [
        { q: 'On an L298N with IN1 = 1, IN2 = 1 and EN = 1, what does the motor do?', options: ['Turns forward', 'Turns backward', 'Brakes', 'Coasts'], answer: 2, why: 'Both terminals are at the same potential: the motor is shorted and stops quickly.' },
        { q: 'If the encoder sequence is 00 → 10 → 11 → 01, which direction?', options: ['Forward', 'Reverse', 'Stopped', 'Error'], answer: 1, why: 'The forward sequence is 00 → 01 → 11 → 10; this is its reverse.' },
        { q: '70 counts in 50 ms, CPR 1400. What is the rpm?', options: ['30', '60', '120', '1400'], answer: 1, why: '70 / 1400 = 0.05 turn; 0.05 / 0.05 s = 1 turn/s = 60 rpm.' },
        { q: 'What is integral windup?', options: ['The motor heating up', 'The integral growing while the output is saturated, which later causes overshoot', 'The encoder count overflowing', 'The PWM frequency changing'], answer: 1, why: 'Freezing the integral when saturated (anti-windup) prevents the overshoot.' },
      ],
    },
  },
  {
    n: 8, hours: 4, sims: ['robot'], hyvex: ['l298n', 'bo-motor-sari', 'hc-sr04', 'mpu6050'], esofWeek: 7,
    tr: {
      title: 'Diferansiyel sürüşlü robot ve odometri',
      summary: 'İki tekerlekten gövde hızına, (v, ω) komutları, enkoderle konum kestirimi ve hatanın nereden geldiği.',
      goals: ['Gövde hızından (v, ω) tekerlek hızlarını ve tersini hesaplamak', 'Enkoder sayımlarından odometriyle poz (x, y, θ) kestirmek', 'Tekerlek çapı hatası ve kaymanın odometriyi nasıl kaydırdığını göstermek', 'gpiozero Robot sınıfıyla klavyeden sürüş kurmak'],
      notes: `<p>İki bağımsız tekerlekli ve bir sarhoş tekerlekli robot, <b>diferansiyel sürüşlüdür</b>: tekerlekler aynı hızda dönerse düz gider, farklı hızda dönerse yay çizer, zıt yönde dönerse yerinde döner.</p>
<div class="eq">v = (v<sub>R</sub> + v<sub>L</sub>) / 2 &nbsp;&nbsp; ω = (v<sub>R</sub> − v<sub>L</sub>) / L</div>
<p>L iz genişliğidir (tekerlekler arası mesafe). Ters yönde, istenen (v, ω) için v<sub>L</sub> = v − ωL/2, v<sub>R</sub> = v + ωL/2. Üst düzey kod (Flask paneli, ROS 2) robotla hep (v, ω) dilinde konuşur; tekerlek hızlarına çevirmek sürücü katmanının işidir.</p>
<h3>Odometri</h3>
<p>Her döngüde iki enkoderin sayım farkı tekerlek yollarına (d<sub>L</sub>, d<sub>R</sub>) çevrilir. Ortalama yol ileri hareketi, fark dönüşü verir; tam yay formülü kısa adımlarda bile doğrudur. Ama odometri <b>hata biriktirir</b>: tekerlek çapında %2\'lik hata, her metrede 2 cm demektir; dönüşteki küçük hata ise ilerledikçe büyüyen yan kaymaya dönüşür. Kayma ve tümsekler hiç ölçülmez.</p>
<p>Bu yüzden gerçek robotlar odometriyi başka sensörlerle düzeltir: IMU (MPU6050) dönüşü, kamera ya da lidar konumu. ESOF 323\'ün 7. ve 9. haftaları bunun matematiğini işler.</p>`,
      code: [odomPy('tr')],
      tryIt: 'Benzetimde robotu klavyeyle (W A S D) bir kare çizecek şekilde sür ve başlangıca dön. Gerçek poz ile odometri arasındaki farkı oku. Sonra tekerlek çapı hatasını %3 yap ve aynı kareyi tekrarla: fark nasıl değişti? Kaymayı aç ve yerinde dönüşlerde hatanın neden hızla büyüdüğünü açıkla.',
      pitfalls: ['İz genişliğini cetvelle ölçüp kalibre etmemek: robotu 10 tur döndürüp L\'yi düzelt.', 'Sol ve sağ enkoderi ters bağlamak: ileri giderken robot "dönüyor" sanır.', 'Odometriyi mutlak doğru kabul etmek: uzun yolda mutlaka kayar.', 'Açıyı sarmamak (−π..π): 359° ile 1° arasındaki fark 358° hesaplanır.'],
      se: `<p>Kinematiği ve odometriyi donanımdan bağımsız bir modülde tut ve <b>özellik testleri</b> yaz:</p>
<ul><li>"Eşit sayımlarda θ değişmez", "zıt eşit sayımlarda x, y değişmez".</li><li>"Çeyrek çember komutu θ\'yı π/2 artırır". Aynı modül benzetimde ve gerçek robotta kullanılır.</li></ul>`,
      quiz: [
        { q: 'v_L = 0,1 m/s, v_R = 0,3 m/s, L = 0,2 m. ω kaçtır?', options: ['0,2 rad/s', '1 rad/s', '2 rad/s', '0,5 rad/s'], answer: 1, why: 'ω = (0,3 − 0,1) / 0,2 = 1 rad/s (sola dönüş).' },
        { q: 'Robotu yerinde döndürmek için tekerlekler nasıl dönmeli?', options: ['Aynı yönde eşit hızda', 'Zıt yönde eşit hızda', 'Yalnız biri', 'İkisi de durmalı'], answer: 1, why: 'v = 0, ω ≠ 0: v_L = −v_R.' },
        { q: 'Tekerlek çapı %2 küçük ölçülmüşse 5 m\'lik düz yolda odometri hatası yaklaşık?', options: ['1 cm', '10 cm', '50 cm', 'Hata olmaz'], answer: 1, why: 'Yol, çapla orantılı: 5 m × %2 = 10 cm.' },
        { q: 'Odometri hangi hatayı hiç göremez?', options: ['Enkoder sayımı', 'Tekerleğin zeminde kayması', 'Tekerlek hızı', 'Dönüş yönü'], answer: 1, why: 'Enkoder tekerleğin dönüşünü ölçer; tekerlek kayarsa robot hareket etmeden sayım artar.' },
      ],
    },
    en: {
      title: 'Differential-drive robot and odometry',
      summary: 'From two wheels to body velocity, (v, ω) commands, pose estimation from encoders and where the error comes from.',
      goals: ['Compute wheel speeds from body velocity (v, ω) and back', 'Estimate pose (x, y, θ) from encoder counts with odometry', 'Show how wheel-diameter error and slip shift odometry', 'Drive from the keyboard with gpiozero\'s Robot class'],
      notes: `<p>A robot with two independent wheels and a caster is <b>differential drive</b>: if the wheels turn at the same speed it goes straight, at different speeds it follows an arc, in opposite directions it spins in place.</p>
<div class="eq">v = (v<sub>R</sub> + v<sub>L</sub>) / 2 &nbsp;&nbsp; ω = (v<sub>R</sub> − v<sub>L</sub>) / L</div>
<p>L is the track width (the distance between the wheels). In reverse, for a desired (v, ω), v<sub>L</sub> = v − ωL/2 and v<sub>R</sub> = v + ωL/2. High-level code (the Flask panel, ROS 2) always talks to the robot in (v, ω); converting to wheel speeds is the driver layer\'s job.</p>
<h3>Odometry</h3>
<p>In each loop the count difference of the two encoders becomes the wheel paths (d<sub>L</sub>, d<sub>R</sub>). The mean path gives forward motion, the difference gives rotation; the exact-arc formula is correct even for short steps. But odometry <b>accumulates error</b>: a 2 % wheel-diameter error is 2 cm per metre, and a small heading error turns into a sideways drift that grows as you go. Slip and bumps are never measured.</p>
<p>That is why real robots correct odometry with other sensors: an IMU (MPU6050) for rotation, a camera or lidar for position. Weeks 7 and 9 of ESOF 323 cover the mathematics.</p>`,
      code: [odomPy('en')],
      tryIt: 'In the simulation drive the robot with the keyboard (W A S D) around a square and return to the start. Read the difference between the true pose and odometry. Then set the wheel-diameter error to 3 % and repeat the square: how did the difference change? Turn on slip and explain why the error grows fast on spins in place.',
      pitfalls: ['Measuring the track width with a ruler and never calibrating it: spin the robot 10 turns and correct L.', 'Swapping the left and right encoders: the robot thinks it is "turning" while going straight.', 'Treating odometry as absolute truth: over a long path it always drifts.', 'Not wrapping the angle (−π..π): the difference between 359° and 1° is computed as 358°.'],
      se: `<p>Keep kinematics and odometry in a hardware-independent module and write <b>property tests</b>:</p>
<ul><li>"Equal counts leave θ unchanged", "equal and opposite counts leave x, y unchanged".</li><li>"A quarter-circle command adds π/2 to θ". The same module is used in the simulation and on the real robot.</li></ul>`,
      quiz: [
        { q: 'v_L = 0.1 m/s, v_R = 0.3 m/s, L = 0.2 m. What is ω?', options: ['0.2 rad/s', '1 rad/s', '2 rad/s', '0.5 rad/s'], answer: 1, why: 'ω = (0.3 − 0.1) / 0.2 = 1 rad/s (turning left).' },
        { q: 'How must the wheels turn to spin the robot in place?', options: ['Same direction, equal speed', 'Opposite directions, equal speed', 'Only one of them', 'Both stopped'], answer: 1, why: 'v = 0, ω ≠ 0: v_L = −v_R.' },
        { q: 'If the wheel diameter is measured 2 % small, the odometry error over 5 m of straight path is about?', options: ['1 cm', '10 cm', '50 cm', 'No error'], answer: 1, why: 'Path is proportional to diameter: 5 m × 2 % = 10 cm.' },
        { q: 'Which error can odometry never see?', options: ['Encoder counts', 'The wheel slipping on the floor', 'Wheel speed', 'Turn direction'], answer: 1, why: 'The encoder measures wheel rotation; if the wheel slips, counts increase without the robot moving.' },
      ],
    },
  },
  {
    n: 9, hours: 4, sims: ['flask'], hyvex: ['raspberry-pi-4b'],
    tr: {
      title: 'Flask ile web kontrol paneli',
      summary: 'Pi\'de küçük bir HTTP sunucusu: yönlendirmeler, JSON, girdi doğrulama, belirteç ve güvenlik bekçisi.',
      goals: ['Flask ile GET ve POST uç noktaları yazmak ve JSON döndürmek', 'Girdiyi doğrulayıp doğru HTTP durum kodlarını (200, 400, 401, 404, 405) vermek', 'Bağlantı kesilince robotu durduran bir bekçi (watchdog) kurmak', 'Tarayıcıdan basılı tutulan düğmeyle güvenli sürüş sağlamak'],
      notes: `<p>Flask, birkaç satırla HTTP sunucusu yazdıran bir Python kütüphanesidir. Pi\'de çalışır, aynı ağdaki telefon ya da dizüstü <code>http://raspberrypi.local:5000</code> adresinden paneli açar.</p>
<h3>Uç noktalar</h3>
<ul><li><code>GET /</code>: panelin HTML sayfası.</li><li><code>GET /api/status</code>: robotun durumu (komut, hız, pil) JSON olarak.</li><li><code>POST /api/drive</code>: <code>{"cmd": "forward", "speed": 0.5}</code>.</li></ul>
<p>Sunucu gelen her şeye şüpheyle bakar: bilinmeyen komut ya da 0–1 dışındaki hız <b>400</b>, belirteç yoksa <b>401</b>, yanlış yöntem <b>405</b> döner. Doğrulama robotun ilk güvenlik katmanıdır.</p>
<h3>Bekçi</h3>
<p>Wi-Fi koparsa son komut "ileri" olarak kalır ve robot duvara gider. Çözüm: tarayıcı basılı tutulan düğme için komutu her 200 ms\'de bir yeniden yollar, sunucudaki bekçi iş parçacığı 1 s komut gelmezse robotu durdurur. Bu desen sanayide <i>deadman switch</i> olarak bilinir.</p>
<h3>Güvenlik</h3>
<p>Panel yalnız yerel ağda çalışmalı. Belirteç koda değil ortam değişkenine yazılır. Kamera görüntüsü eklenecekse MJPEG akışı ayrı bir uç noktadır ve kare hızı sınırlandırılır.</p>`,
      code: [flaskPy('tr'), fetchJs('tr')],
      tryIt: 'Panelde ileri düğmesine basılı tut ve bırak: bekçi açıkken ve kapalıyken ne oluyor? "Bağlantıyı kes" ile Wi-Fi kopmasını dene. Belirteci aç ve belirteçsiz istek gönder. Hızı 1,5 yapıp hangi kodu aldığını, "jump" komutuyla ne döndüğünü not et.',
      pitfalls: ['Flask geliştirme sunucusunu internete açmak: yalnız yerel ağ; dışarıdan erişim gerekiyorsa VPN kullan.', 'Komutu tek seferlik göndermek (bas, bırak): bağlantı koparsa durma komutu hiç gitmez.', 'Girdiyi doğrulamadan motora vermek: speed = 5 motoru zorlar.', 'Belirteci kaynak koda yazıp depoya göndermek.'],
      se: `<p>HTTP arayüzü bir <b>sözleşmedir</b>: uç noktaları, gövdeleri ve durum kodlarını belgeleyip test et.</p>
<ul><li>Flask\'ın test istemcisiyle (<code>app.test_client()</code>) her durum kodunu sınayan testler yaz.</li><li>Yönlendirme mantığını donanımdan ayır: benzetimdeki <code>handle()</code> gibi saf bir fonksiyon.</li></ul>`,
      quiz: [
        { q: 'POST /api/drive {"cmd": "jump"} için uygun durum kodu?', options: ['200', '400', '404', '500'], answer: 1, why: 'İstek biçimi doğru ama içerik geçersiz: 400 Bad Request.' },
        { q: 'GET /api/drive (yalnız POST tanımlı) ne döner?', options: ['200', '401', '405', '302'], answer: 2, why: '405 Method Not Allowed.' },
        { q: 'Bekçi neden gerekli?', options: ['Sunucuyu hızlandırmak için', 'Bağlantı koparsa son komutla sürmeye devam etmeyi önlemek için', 'Pil ölçmek için', 'HTML üretmek için'], answer: 1, why: 'Belirli süre komut gelmezse robot kendiliğinden durur.' },
        { q: 'Belirteç (token) nerede saklanmalı?', options: ['Kaynak kodda', 'Ortam değişkeninde ya da izinleri kısıtlı bir dosyada', 'HTML sayfasında', 'URL\'de'], answer: 1, why: 'Kod depoya gider; sırlar ortamdan okunur.' },
      ],
    },
    en: {
      title: 'A web control panel with Flask',
      summary: 'A small HTTP server on the Pi: routes, JSON, input validation, a token and a safety watchdog.',
      goals: ['Write GET and POST endpoints with Flask and return JSON', 'Validate input and return the right HTTP status codes (200, 400, 401, 404, 405)', 'Set up a watchdog that stops the robot when the link drops', 'Drive safely from the browser with a press-and-hold button'],
      notes: `<p>Flask is a Python library that gives you an HTTP server in a few lines. It runs on the Pi, and a phone or laptop on the same network opens the panel at <code>http://raspberrypi.local:5000</code>.</p>
<h3>Endpoints</h3>
<ul><li><code>GET /</code>: the panel\'s HTML page.</li><li><code>GET /api/status</code>: the robot\'s state (command, speed, battery) as JSON.</li><li><code>POST /api/drive</code>: <code>{"cmd": "forward", "speed": 0.5}</code>.</li></ul>
<p>The server distrusts everything it receives: an unknown command or a speed outside 0–1 returns <b>400</b>, a missing token <b>401</b>, a wrong method <b>405</b>. Validation is the robot\'s first safety layer.</p>
<h3>Watchdog</h3>
<p>If Wi-Fi drops, the last command stays "forward" and the robot drives into a wall. The fix: the browser resends the command every 200 ms while the button is held, and a watchdog thread on the server stops the robot if no command arrives for 1 s. Industry calls this pattern a <i>deadman switch</i>.</p>
<h3>Security</h3>
<p>The panel should only run on the local network. The token goes in an environment variable, not in the code. If camera video is added, the MJPEG stream is a separate endpoint with a capped frame rate.</p>`,
      code: [flaskPy('en'), fetchJs('en')],
      tryIt: 'Hold the forward button in the panel and release it: what happens with the watchdog on and off? Try a Wi-Fi drop with "Cut the link". Turn on the token and send a request without it. Set the speed to 1.5 and note the code you get, and what the "jump" command returns.',
      pitfalls: ['Exposing the Flask development server to the internet: local network only; use a VPN if outside access is needed.', 'Sending the command once (press, release): if the link drops, the stop command never arrives.', 'Passing input to the motor without validation: speed = 5 strains the motor.', 'Writing the token in the source code and pushing it to the repository.'],
      se: `<p>An HTTP interface is a <b>contract</b>: document and test the endpoints, bodies and status codes.</p>
<ul><li>Write tests with Flask\'s test client (<code>app.test_client()</code>) that exercise every status code.</li><li>Separate routing logic from hardware: a pure function like <code>handle()</code> in the simulation.</li></ul>`,
      quiz: [
        { q: 'The right status code for POST /api/drive {"cmd": "jump"}?', options: ['200', '400', '404', '500'], answer: 1, why: 'The request is well formed but the content is invalid: 400 Bad Request.' },
        { q: 'What does GET /api/drive return (only POST defined)?', options: ['200', '401', '405', '302'], answer: 2, why: '405 Method Not Allowed.' },
        { q: 'Why is a watchdog needed?', options: ['To speed up the server', 'To stop the robot from driving on with the last command if the link drops', 'To measure the battery', 'To generate HTML'], answer: 1, why: 'If no command arrives for a set time, the robot stops by itself.' },
        { q: 'Where should the token be stored?', options: ['In the source code', 'In an environment variable or a file with restricted permissions', 'In the HTML page', 'In the URL'], answer: 1, why: 'Code goes to the repository; secrets are read from the environment.' },
      ],
    },
  },
  {
    n: 10, hours: 6, sims: ['ros', 'terminal'], simCfg: { terminal: { tasks: 'systemd' } }, hyvex: ['raspberry-pi-4b', 'tf-luna-lidar'], esofWeek: 12,
    tr: {
      title: 'ROS 2 temelleri ve systemd ile otomatik başlatma',
      summary: 'Düğümler, konular, mesajlar, parametreler; twist_mux; robotun açılışta kendiliğinden başlaması.',
      goals: ['ROS 2\'de düğüm, konu, yayıncı ve abone kavramlarını kullanmak', 'rclpy ile hedef izleyen bir düğüm yazmak ve parametreyle ayarlamak', 'Birden fazla hız kaynağını twist_mux ile güvenle birleştirmek', 'systemd birimiyle robot yazılımını açılışta başlatmak ve günlüğünü okumak'],
      notes: `<p>Robot yazılımı büyüdükçe tek bir <code>main.py</code> yönetilemez olur. <b>ROS 2</b>, yazılımı küçük süreçlere (<b>düğüm</b>) böler; düğümler adlandırılmış <b>konular</b> üzerinden tipli mesajlarla konuşur. Kamera düğümü <code>/image_raw</code> yayınlar, algılayıcı onu dinleyip <code>/target</code> yayınlar, izleyici <code>/cmd_vel</code> üretir, motor düğümü onu tekerleklere çevirir. Pi 5\'te Ubuntu 24.04 ile ROS 2 Jazzy ya da Raspberry Pi OS üstünde Docker kullanılır.</p>
<h3>Komutlar</h3>
<ul><li><code>ros2 node list</code>, <code>ros2 topic list</code>, <code>ros2 topic echo /cmd_vel</code>, <code>ros2 topic hz /image_raw</code>.</li><li><code>ros2 param set /follower k_turn 0.8</code>: kodu değiştirmeden ayar.</li><li><code>rqt_graph</code>: düğüm ve konu grafiği.</li></ul>
<h3>Birden fazla sürücü: twist_mux</h3>
<p>Hem web paneli hem otomatik izleyici <code>/cmd_vel</code>\'e yazarsa motor iki komut arasında titrer. <code>twist_mux</code> her kaynağa öncelik verir: elle sürüş otomatiği bastırır, bir kaynak susarsa diğerine geçer.</p>
<h3>systemd</h3>
<p>Sahadaki robotta kimse terminal açıp betik başlatmaz. <code>/etc/systemd/system/robot.service</code> birimi yazılır, <code>sudo systemctl daemon-reload</code> ile okutulur, <code>enable</code> ile açılışa bağlanır, <code>start</code> ile başlatılır. <code>Restart=on-failure</code> çökünce yeniden başlatır; <code>journalctl -u robot</code> günlüğü gösterir.</p>
<p>Daha geniş bir ROS 2 ve simülasyon anlatımı için ESOF 323\'ün 12. haftasına bak.</p>`,
      code: [rosPy('tr'), serviceUnit('tr')],
      tryIt: 'ROS grafiğinde twist_mux\'u kapat: /cmd_vel\'de hangi sorun çıktı? Algılayıcıyı kapatınca izleyicinin hangi konuyu bekleyip boşta kaldığına bak. Terminalde systemd görevlerini bitir: sudo nano ile birimi yaz (şablon hazır), daemon-reload, enable, start, sonra systemctl status ve journalctl -u robot.',
      pitfalls: ['İki düğümün aynı /cmd_vel\'e yazması: komutlar çakışır, robot titrer.', 'Birim dosyasını değiştirip daemon-reload yapmamak: systemd eski sürümü çalıştırır.', 'ExecStart\'ta göreli yol kullanmak: systemd çalışma dizinini bilmez; mutlak yol yaz.', 'QoS uyuşmazlığı: kamera "best effort", abone "reliable" isterse hiç mesaj gelmez.'],
      se: `<p>ROS 2 düğümlerini de saf mantık + ince sarmalayıcı olarak yaz: karar fonksiyonu rclpy\'siz test edilir.</p>
<ul><li><code>ros2 launch</code> dosyası sistemin <b>yapılandırmasıdır</b>: hangi düğümler, hangi parametreler. Sürüm denetiminde tutulur.</li><li>rosbag ile kaydedilen veri, hataları sahadan masaya taşır: aynı girdiyle yeniden oynatılır.</li></ul>`,
      quiz: [
        { q: 'ROS 2\'de düğümler birbirine nasıl veri gönderir?', options: ['Ortak global değişkenle', 'Adlandırılmış konulara tipli mesaj yayınlayarak', 'Dosyaya yazarak', 'E-postayla'], answer: 1, why: 'Yayıncı/abone modeli: düğümler birbirini bilmez, konuyu bilir.' },
        { q: 'Web paneli ve otomatik izleyici aynı anda sürmek isterse ne kullanılır?', options: ['İkisini de /cmd_vel\'e bağlamak', 'twist_mux ile öncelikli seçim', 'Birini silmek', 'Daha hızlı yayınlamak'], answer: 1, why: 'twist_mux kaynaklara öncelik ve zaman aşımı verir.' },
        { q: 'Yeni bir birim dosyası yazdıktan sonra ilk komut?', options: ['sudo reboot', 'sudo systemctl daemon-reload', 'rm robot.service', 'apt update'], answer: 1, why: 'systemd birim dosyalarını yeniden okumalıdır.' },
        { q: 'Robot yazılımı çökünce kendiliğinden yeniden başlaması için birimde ne yazılır?', options: ['WantedBy=multi-user.target', 'Restart=on-failure', 'After=network-online.target', 'User=pi'], answer: 1, why: 'Restart=on-failure hata koduyla çıkışta yeniden başlatır; WantedBy açılışa bağlar.' },
      ],
    },
    en: {
      title: 'ROS 2 basics and auto-start with systemd',
      summary: 'Nodes, topics, messages, parameters; twist_mux; making the robot start by itself at boot.',
      goals: ['Use the ROS 2 concepts of node, topic, publisher and subscriber', 'Write a target-following node with rclpy and tune it with a parameter', 'Combine several velocity sources safely with twist_mux', 'Start the robot software at boot with a systemd unit and read its log'],
      notes: `<p>As robot software grows, a single <code>main.py</code> becomes unmanageable. <b>ROS 2</b> splits the software into small processes (<b>nodes</b>); nodes talk with typed messages over named <b>topics</b>. The camera node publishes <code>/image_raw</code>, the detector listens and publishes <code>/target</code>, the follower produces <code>/cmd_vel</code>, and the motor node turns that into wheel speeds. On a Pi 5 you use ROS 2 Jazzy on Ubuntu 24.04, or Docker on Raspberry Pi OS.</p>
<h3>Commands</h3>
<ul><li><code>ros2 node list</code>, <code>ros2 topic list</code>, <code>ros2 topic echo /cmd_vel</code>, <code>ros2 topic hz /image_raw</code>.</li><li><code>ros2 param set /follower k_turn 0.8</code>: tuning without changing code.</li><li><code>rqt_graph</code>: the node and topic graph.</li></ul>
<h3>Several drivers: twist_mux</h3>
<p>If both the web panel and the automatic follower write to <code>/cmd_vel</code>, the motor jitters between two commands. <code>twist_mux</code> gives each source a priority: manual driving overrides automatic, and when a source goes quiet it falls back to the other.</p>
<h3>systemd</h3>
<p>On a robot in the field nobody opens a terminal to start a script. You write the unit <code>/etc/systemd/system/robot.service</code>, load it with <code>sudo systemctl daemon-reload</code>, link it to boot with <code>enable</code> and start it with <code>start</code>. <code>Restart=on-failure</code> restarts it after a crash; <code>journalctl -u robot</code> shows the log.</p>
<p>For a broader treatment of ROS 2 and simulation see week 12 of ESOF 323.</p>`,
      code: [rosPy('en'), serviceUnit('en')],
      tryIt: 'In the ROS graph turn off twist_mux: what problem appears on /cmd_vel? Turn off the detector and see which topic the follower is left waiting on. Finish the systemd tasks in the terminal: write the unit with sudo nano (a template is ready), daemon-reload, enable, start, then systemctl status and journalctl -u robot.',
      pitfalls: ['Two nodes writing to the same /cmd_vel: commands clash and the robot jitters.', 'Changing the unit file without daemon-reload: systemd runs the old version.', 'Using a relative path in ExecStart: systemd does not know your working directory; write an absolute path.', 'QoS mismatch: if the camera is "best effort" and the subscriber wants "reliable", no messages arrive.'],
      se: `<p>Write ROS 2 nodes as pure logic plus a thin wrapper too: the decision function is tested without rclpy.</p>
<ul><li>A <code>ros2 launch</code> file is the system\'s <b>configuration</b>: which nodes, which parameters. It lives in version control.</li><li>Data recorded with rosbag brings bugs from the field to the desk: it is replayed with the same input.</li></ul>`,
      quiz: [
        { q: 'How do nodes send data to each other in ROS 2?', options: ['Through a shared global variable', 'By publishing typed messages to named topics', 'By writing to files', 'By e-mail'], answer: 1, why: 'Publish/subscribe: nodes do not know each other, only the topic.' },
        { q: 'What do you use when the web panel and the automatic follower both want to drive?', options: ['Connect both to /cmd_vel', 'Priority selection with twist_mux', 'Delete one of them', 'Publish faster'], answer: 1, why: 'twist_mux gives sources priorities and timeouts.' },
        { q: 'The first command after writing a new unit file?', options: ['sudo reboot', 'sudo systemctl daemon-reload', 'rm robot.service', 'apt update'], answer: 1, why: 'systemd must re-read the unit files.' },
        { q: 'What goes in the unit so the robot software restarts by itself after a crash?', options: ['WantedBy=multi-user.target', 'Restart=on-failure', 'After=network-online.target', 'User=pi'], answer: 1, why: 'Restart=on-failure restarts it after an error exit; WantedBy links it to boot.' },
      ],
    },
  },
]
