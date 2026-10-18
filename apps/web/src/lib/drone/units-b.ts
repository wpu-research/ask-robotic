// Drone dersi üniteleri 6–10: kaskad yönelim, navigasyon, PX4/MAVLink/MAVSDK, ROS 2 + SITL + hassas iniş, güvenlik ve bitirme.
import type { Unit } from './course'
import { arucoPy, cascadeCpp, failsafeTxt, mavsdkPy, missionFsmPy, navPy, offboardPy, pymavlinkPy, sitlBash } from './code'

export const UNITS_B: Unit[] = [
  {
    n: 6, pillars: ['sim', 'yazilim'], sims: ['roll'], parts: ['fc', 'imu', 'esc'],
    tr: {
      title: 'PID II: kaskad yönelim denetimi, gürültü ve süzgeçler',
      summary: 'Açı P → hız PID; iç döngü hızı, D teriminin gürültüyü büyütmesi, alçak geçiren ve çentik süzgeçleri.',
      goals: ['Kaskad yapıyı (açı → açısal hız → tork) kurmak ve neden kullanıldığını açıklamak', 'İç ve dış döngü bant genişliği ayrımını simülasyonda göstermek', 'Jiroskop gürültüsünün D terimiyle motorlara nasıl taşındığını ölçmek', 'Alçak geçiren, çentik ve devir tabanlı süzgeçlerin yerini söylemek'],
      notes: `<p>Bir multirotorun yönelimi iki iç içe döngüyle denetlenir. Dış döngü açı hatasını bir <b>açısal hız hedefine</b> çevirir; iç döngü jiroskobu kullanarak bu hızı tutar ve bir tork (motor farkı) üretir.</p>
<div class="eq">ω<sub>hedef</sub> = K<sub>açı</sub> (θ<sub>hedef</sub> − θ) &nbsp;→&nbsp; τ = PID(ω<sub>hedef</sub> − ω<sub>jiro</sub>) &nbsp;→&nbsp; karıştırıcı</div>
<p>Neden kaskad? Jiroskop doğrudan ve hızlı ölçer; iç döngü motor gecikmesini, bozucu torku ve eylemsizlik belirsizliğini dış döngüye ulaşmadan bastırır. Kural: iç döngü dıştakinden belirgin biçimde hızlı olmalı (tipik 4–10 kat). PX4\'te açı döngüsü <code>MC_ROLL_P</code>, hız döngüsü <code>MC_ROLLRATE_P/I/D</code>; hız döngüsü 1 kHz ve üstünde çalışır.</p>
<h3>Gürültü ve D terimi</h3>
<p>D terimi sinyalin türevini alır; türev yüksek frekansı büyütür. Jiroskoptaki küçük gürültü D üzerinden motor komutuna büyük titreşim olarak gider: motorlar ısınır, kestirim bozulur. Çare süzmektir, ama her süzgeç gecikme ekler ve gecikme kararlılık payını yer.</p>
<ul><li><b>Alçak geçiren</b> (jiroskop ve D terimi için, tipik 30–100 Hz).</li><li><b>Çentik süzgeci</b>: gövde rezonansı ya da pervane frekansı gibi dar bir bandı keser. Çift yönlü DShot\'tan gelen motor devriyle frekansı uçuşta izleyen <b>devir tabanlı çentik</b> (RPM filter) bugün en etkili yöntemdir.</li><li>PX4\'te FFT tabanlı dinamik çentik de vardır; önce kayıttan (ULog) spektruma bak, sonra süzgeç seç.</li></ul>`,
      code: [cascadeCpp('tr')],
      lab: 'Yönelim simülasyonunda: (1) varsayılan ayarda aşım ve oturma süresini not et. (2) Açı P\'yi 15\'e çıkar: aşım ne oldu? Hız P\'yi 0,3\'e çıkararak düzelt. (3) Hız D\'yi 0,01, jiroskop gürültüsünü 3 °/s yap: tork gürültüsü kaç kat arttı? D süzgecini 10 Hz\'e indir ve 200 Hz\'e çıkar, farkı açıkla. (4) 0,05 N·m bozucu tork ver; Hız I = 0 ile kalan açı hatasını ölç, sonra I\'yı 0,6\'ya çıkar.',
      pitfalls: ['Dış döngüyü iç döngüden hızlı ayarlamak: iç döngü hedefe yetişemez, sistem salınır.', 'Gürültüyü D kazancını sıfırlayarak "çözmek": sönüm gider, aşım büyür. Önce süz.', 'Süzgeç kesimini gereğinden düşük seçmek: gecikme artar, kararlılık payı azalır.', 'Spektruma bakmadan çentik koymak: yanlış frekanstaki çentik yalnız gecikme ekler.'],
      se: `<p>Kontrol yazılımı <b>gerçek zamanlıdır</b>: doğru sonuç geç gelirse yanlıştır.</p>
<ul><li>Döngü süresini ölç ve kaydet (PX4: <code>perf</code> sayaçları); en kötü durum yürütme süresi (WCET) bütçesini aşmamalı.</li><li>Hız döngüsünü bir RTOS görevine ya da zamanlayıcı kesmesine koy; dinamik bellek ayırma, kilit ve bloklayan G/Ç kullanma.</li></ul>`,
      quiz: [
        { q: 'Kaskad denetimde iç döngü (açısal hız) dış döngüye göre nasıl olmalıdır?', options: ['Belirgin biçimde daha hızlı (tipik 4–10 kat)', 'Aynı hızda', 'Daha yavaş', 'Fark etmez, ikisi bağımsızdır'], answer: 0, why: 'Dış döngü, iç döngünün hedefi anında izlediğini varsayar; bu ancak iç döngü çok daha hızlıysa geçerlidir.' },
        { q: 'Jiroskop gürültüsü en çok hangi terim üzerinden motorlara taşınır?', options: ['P', 'I', 'İleri besleme', 'D'], answer: 3, why: 'Türev yüksek frekanslı gürültüyü büyütür; I ise gürültüyü ortalayarak bastırır.' },
        { q: 'PX4\'te MC_ROLL_P parametresi neyi neye çevirir?', options: ['Tork komutunu motor PWM\'ine', 'Açı hatasını açısal hız hedefine', 'Jiroskop verisini açıya', 'Gaz çubuğunu itkiye'], answer: 1, why: 'Dış (açı) döngüsünün P kazancıdır; çıktısı hız döngüsünün hedefidir.' },
        { q: 'Devir tabanlı çentik süzgeci (RPM filter) motor frekansını nereden öğrenir?', options: ['Barometreden', 'GPS\'ten', 'Çift yönlü DShot telemetrisinden', 'Kumandadan'], answer: 2, why: 'ESC her motorun devrini DShot hattından geri yollar; süzgeç çentik frekansını buna göre kaydırır.' },
      ],
    },
    en: {
      title: 'PID II: cascaded attitude control, noise and filters',
      summary: 'Angle P → rate PID; inner-loop speed, how the D term amplifies noise, low-pass and notch filters.',
      goals: ['Build the cascade (angle → angular rate → torque) and explain why it is used', 'Show the separation of inner and outer loop bandwidth in simulation', 'Measure how gyro noise reaches the motors through the D term', 'Say where low-pass, notch and RPM-based filters belong'],
      notes: `<p>A multirotor\'s attitude is controlled by two nested loops. The outer loop turns angle error into an <b>angular rate setpoint</b>; the inner loop holds that rate using the gyro and produces a torque (a motor difference).</p>
<div class="eq">ω<sub>sp</sub> = K<sub>angle</sub> (θ<sub>sp</sub> − θ) &nbsp;→&nbsp; τ = PID(ω<sub>sp</sub> − ω<sub>gyro</sub>) &nbsp;→&nbsp; mixer</div>
<p>Why a cascade? The gyro measures directly and fast; the inner loop suppresses motor lag, disturbance torque and inertia uncertainty before they reach the outer loop. Rule: the inner loop must be clearly faster than the outer one (typically 4–10 times). In PX4 the angle loop is <code>MC_ROLL_P</code> and the rate loop <code>MC_ROLLRATE_P/I/D</code>; the rate loop runs at 1 kHz or more.</p>
<h3>Noise and the D term</h3>
<p>The D term takes the derivative of the signal, and differentiation amplifies high frequencies. Small gyro noise reaches the motor command through D as large vibration: the motors heat up and the estimate degrades. The cure is filtering, but every filter adds delay and delay eats stability margin.</p>
<ul><li><b>Low-pass</b> (for the gyro and the D term, typically 30–100 Hz).</li><li><b>Notch filter</b>: cuts a narrow band such as a frame resonance or the propeller frequency. The <b>RPM-based notch</b> (RPM filter), which tracks the frequency in flight using motor RPM from bidirectional DShot, is the most effective method today.</li><li>PX4 also has an FFT-based dynamic notch; look at the spectrum in a log (ULog) first, then choose a filter.</li></ul>`,
      code: [cascadeCpp('en')],
      lab: 'In the attitude simulation: (1) note overshoot and settling time with the defaults. (2) Raise Angle P to 15: what happened to overshoot? Fix it by raising Rate P to 0.3. (3) Set Rate D to 0.01 and gyro noise to 3 °/s: by what factor did torque noise grow? Lower the D filter to 10 Hz and raise it to 200 Hz, and explain the difference. (4) Add a 0.05 N·m disturbance torque; measure the remaining angle error with Rate I = 0, then raise I to 0.6.',
      pitfalls: ['Tuning the outer loop faster than the inner one: the inner loop cannot keep up and the system oscillates.', '"Fixing" noise by zeroing the D gain: damping is lost and overshoot grows. Filter first.', 'Choosing a filter cutoff lower than necessary: delay grows and stability margin shrinks.', 'Adding a notch without looking at the spectrum: a notch at the wrong frequency only adds delay.'],
      se: `<p>Control software is <b>real-time</b>: a correct result that arrives late is wrong.</p>
<ul><li>Measure and log the loop time (PX4: <code>perf</code> counters); the worst-case execution time (WCET) must stay inside its budget.</li><li>Put the rate loop in an RTOS task or a timer interrupt; no dynamic memory allocation, locks or blocking I/O.</li></ul>`,
      quiz: [
        { q: 'In cascaded control, how should the inner (rate) loop compare with the outer loop?', options: ['Clearly faster (typically 4–10 times)', 'The same speed', 'Slower', 'It does not matter, they are independent'], answer: 0, why: 'The outer loop assumes the inner loop tracks its setpoint instantly; that only holds if the inner loop is much faster.' },
        { q: 'Through which term does gyro noise reach the motors most?', options: ['P', 'I', 'Feedforward', 'D'], answer: 3, why: 'The derivative amplifies high-frequency noise; I averages noise out.' },
        { q: 'In PX4, what does MC_ROLL_P convert into what?', options: ['Torque command into motor PWM', 'Angle error into an angular rate setpoint', 'Gyro data into an angle', 'The throttle stick into thrust'], answer: 1, why: 'It is the P gain of the outer (angle) loop; its output is the rate loop\'s setpoint.' },
        { q: 'Where does an RPM-based notch filter get the motor frequency from?', options: ['The barometer', 'The GPS', 'Bidirectional DShot telemetry', 'The transmitter'], answer: 2, why: 'The ESC sends each motor\'s RPM back on the DShot line; the filter moves its notch frequency accordingly.' },
      ],
    },
  },
  {
    n: 7, pillars: ['parca', 'sim', 'yazilim'], sims: ['mission'], simCfg: { mission: { landing: 'gps' } }, parts: ['gps', 'mag', 'telemetry'],
    tr: {
      title: 'Navigasyon: GPS, EKF ve ara nokta görevi',
      summary: 'GNSS hatası, EKF2, konum P → hız PI → eğim kaskadı; varış yarıçapı ve rüzgâr.',
      goals: ['GPS hatasının yapısını (yavaş gezinen hata) açıklamak', 'Konum → hız → ivme → eğim kaskadını kurmak', 'Azami eğim açısından azami yatay ivmeyi hesaplamak', 'Rüzgârın etkisini ve I teriminin bunu nasıl telafi ettiğini simülasyonda göstermek'],
      notes: `<p>Konum denetimi yönelim denetiminin üstünde çalışan üçüncü döngüdür. Hedefe olan uzaklık bir <b>hız hedefine</b> (seyir hızıyla sınırlı), hız hatası bir <b>ivme komutuna</b>, ivme de eğim açısına çevrilir:</p>
<div class="eq">v<sub>hedef</sub> = K<sub>p</sub> (p<sub>hedef</sub> − p̂) &nbsp;→&nbsp; a = PI(v<sub>hedef</sub> − v) &nbsp;→&nbsp; θ ≈ a / g, &nbsp; |a| ≤ g tan θ<sub>azami</sub></div>
<p>25° azami eğimde yatay ivme en çok 9,81 × tan 25° ≈ 4,6 m/s²\'dir. Rüzgâr sürekli bir kuvvettir; onu dengelemek için drone rüzgâra doğru eğik durmalıdır ve bu eğimi hız döngüsünün I terimi bulur.</p>
<h3>Konumu kim biliyor?</h3>
<p>Kontrolcü gerçek konumu değil, <b>kestirilen</b> konumu (p̂) bilir. PX4\'te bunu EKF2 üretir: IMU\'yu yüksek hızda entegre eder, GPS, barometre, pusula (ve varsa optik akış, LiDAR) ölçümleriyle düzeltir. GPS hatası 1–3 m\'dir ve yavaşça gezinir; ortalaması almakla geçmez. Ara noktaya varış kontrolü bile kestirime göre yapılır: simülasyonda drone ara noktayı "geçtiğini" düşündüğünde gerçekte metrelerce uzakta olabilir.</p>
<ul><li>Varış yarıçapı (acceptance radius) GPS hatasından küçük seçilirse drone ara noktada dolanabilir.</li><li>Telemetri bağlantısı görev sırasında konum, batarya ve uyarıları yer istasyonuna taşır.</li></ul>`,
      code: [navPy('tr')],
      lab: 'Görev simülasyonunda iniş kaynağı "Yalnız GPS" iken görevi üç kez yeniden başlat: iniş hatası her seferinde ne kadar? GPS hatasını 0\'a indir: hata ne oldu? 8 m/s doğu rüzgârı ver ve rotanın nasıl değiştiğini izle. Konum P\'yi 0,3 ve 2,5 yaparak görev süresini karşılaştır. Haritaya tıklayarak kendi rotanı kur.',
      pitfalls: ['GPS hatasını beyaz gürültü sanıp ortalama alarak düzelteceğini düşünmek.', 'Pusulayı kalibre etmemek: EKF yön hatası konum denetimini spirale sokar.', 'Varış yarıçapını GPS hatasından küçük seçmek.', 'Azami eğimi çok düşük tutup rüzgârda konum tutamamak; ya da çok yüksek tutup itkiyi irtifa tutmaya yetmez hale getirmek.'],
      se: `<p>Navigasyon kodu <b>arayüzler</b> üzerinden test edilir: kontrolcü "kestirim" arayüzüne bağımlı olsun, GPS sürücüsüne değil.</p>
<ul><li>Kestirimi sahte bir nesneyle (mock) besleyerek kontrolcüyü sensörsüz test et: sabit rüzgâr, sıçrayan GPS, kayıp GPS senaryoları.</li><li>Her senaryo için kabul ölçütü yaz: "8 m/s rüzgârda ara noktaya 1 m içinde varış".</li></ul>`,
      quiz: [
        { q: 'Azami eğim 25° ise drone\'un azami yatay ivmesi yaklaşık nedir?', options: ['2,5 m/s²', '4,6 m/s²', '9,8 m/s²', '21 m/s²'], answer: 1, why: 'a = g tan θ = 9,81 × 0,466 ≈ 4,6 m/s².' },
        { q: 'GPS\'le inişte neden metre düzeyinde sapma olur?', options: ['GPS hatası yavaşça gezinir; kısa sürede ortalaması alınamaz', 'GPS yalnız irtifa ölçer', 'Pervaneler GPS\'i bozar', 'EKF GPS\'i kullanmaz'], answer: 0, why: 'Hata zaman içinde ilişkilidir (beyaz değildir); iniş süresince neredeyse sabit bir kayma gibi davranır.' },
        { q: 'Uçuş kontrolcüsü ara noktaya vardığına neye bakarak karar verir?', options: ['Gerçek konuma', 'Kumandaya', 'Kestirilen konuma', 'Barometreye'], answer: 2, why: 'Gerçek konumu bilemez; EKF\'nin kestirimine göre karar verir.' },
        { q: 'PX4 EKF2 hangi sensörleri birleştirir?', options: ['Yalnız GPS', 'Yalnız IMU', 'Yalnız kamera', 'IMU, GPS, barometre, pusula (ve varsa optik akış, mesafe sensörü)'], answer: 3, why: 'IMU tahmin adımını sürer, diğer sensörler ölçüm güncellemesi olarak girer.' },
      ],
    },
    en: {
      title: 'Navigation: GPS, EKF and a waypoint mission',
      summary: 'GNSS error, EKF2, the position P → velocity PI → tilt cascade; acceptance radius and wind.',
      goals: ['Explain the structure of GPS error (slowly wandering error)', 'Build the position → velocity → acceleration → tilt cascade', 'Compute the maximum horizontal acceleration from the maximum tilt', 'Show in simulation how wind acts and how the I term compensates'],
      notes: `<p>Position control is a third loop running on top of attitude control. Distance to the target becomes a <b>velocity setpoint</b> (limited by the cruise speed), velocity error becomes an <b>acceleration command</b>, and acceleration becomes a tilt angle:</p>
<div class="eq">v<sub>sp</sub> = K<sub>p</sub> (p<sub>sp</sub> − p̂) &nbsp;→&nbsp; a = PI(v<sub>sp</sub> − v) &nbsp;→&nbsp; θ ≈ a / g, &nbsp; |a| ≤ g tan θ<sub>max</sub></div>
<p>At 25° maximum tilt the horizontal acceleration is at most 9.81 × tan 25° ≈ 4.6 m/s². Wind is a steady force; to balance it the drone must lean into the wind, and the I term of the velocity loop finds that lean.</p>
<h3>Who knows the position?</h3>
<p>The controller does not know the true position, only the <b>estimated</b> one (p̂). In PX4, EKF2 produces it: it integrates the IMU at a high rate and corrects with GPS, barometer and compass measurements (and optical flow or LiDAR if present). GPS error is 1–3 m and wanders slowly; averaging does not remove it. Even the waypoint arrival check uses the estimate: in the simulation the drone may "pass" a waypoint while it is actually metres away.</p>
<ul><li>If the acceptance radius is smaller than the GPS error, the drone can circle around the waypoint.</li><li>The telemetry link carries position, battery and warnings to the ground station during the mission.</li></ul>`,
      code: [navPy('en')],
      lab: 'In the mission simulation, with "GPS only" as the landing source, restart the mission three times: how large is the landing error each time? Set GPS error to 0: what happened to the error? Add an 8 m/s east wind and watch how the route changes. Compare mission time with Position P at 0.3 and 2.5. Build your own route by clicking the map.',
      pitfalls: ['Treating GPS error as white noise and expecting averaging to fix it.', 'Not calibrating the compass: an EKF heading error sends position control into a spiral.', 'Choosing an acceptance radius smaller than the GPS error.', 'Setting the maximum tilt too low so the drone cannot hold position in wind; or too high so thrust is no longer enough to hold altitude.'],
      se: `<p>Navigation code is tested through <b>interfaces</b>: the controller should depend on an "estimate" interface, not on the GPS driver.</p>
<ul><li>Feed the estimate from a mock to test the controller without sensors: steady wind, jumping GPS, lost GPS scenarios.</li><li>Write an acceptance criterion for each scenario: "reaches the waypoint within 1 m in 8 m/s wind".</li></ul>`,
      quiz: [
        { q: 'If the maximum tilt is 25°, what is the drone\'s maximum horizontal acceleration, roughly?', options: ['2.5 m/s²', '4.6 m/s²', '9.8 m/s²', '21 m/s²'], answer: 1, why: 'a = g tan θ = 9.81 × 0.466 ≈ 4.6 m/s².' },
        { q: 'Why does a GPS landing miss by metres?', options: ['GPS error wanders slowly; it cannot be averaged out in a short time', 'GPS only measures altitude', 'The propellers disturb the GPS', 'The EKF does not use GPS'], answer: 0, why: 'The error is correlated in time (not white); during a landing it behaves almost like a constant offset.' },
        { q: 'How does the flight controller decide that it has reached a waypoint?', options: ['From the true position', 'From the transmitter', 'From the estimated position', 'From the barometer'], answer: 2, why: 'It cannot know the true position; it decides from the EKF estimate.' },
        { q: 'Which sensors does PX4 EKF2 fuse?', options: ['GPS only', 'IMU only', 'The camera only', 'IMU, GPS, barometer, compass (and optical flow, range sensor if present)'], answer: 3, why: 'The IMU drives the prediction step; the other sensors enter as measurement updates.' },
      ],
    },
  },
  {
    n: 8, pillars: ['yazilim', 'sim'], sims: [], esofSims: ['drone'], parts: ['fc', 'telemetry', 'rc'],
    tr: {
      title: 'PX4 mimarisi, uçuş kipleri, MAVLink ve MAVSDK',
      summary: 'uORB modülleri, Position/Mission/Offboard kipleri, MAVLink mesajları ve MAVSDK-Python ile görev.',
      goals: ['PX4\'ün modül yapısını ve uORB veri akışını çizmek', 'Uçuş kiplerini ve hangi sensörlere ihtiyaç duyduklarını sıralamak', 'Temel MAVLink mesajlarını ve komutlarını tanımak', 'MAVSDK-Python ile SITL\'de görev yükleyip uçurmak'],
      notes: `<p>PX4, NuttX gerçek zamanlı işletim sisteminde çalışan modüllerden oluşur. Modüller birbirini doğrudan çağırmaz; <b>uORB</b> adlı yayınla-abone ol veri yolu üzerinden konuşur. Bu yüzden bir modül değiştirildiğinde diğerleri etkilenmez ve aynı kod SITL\'de de çalışır.</p>
<div class="eq">sensors → ekf2 → navigator / mc_pos_control → mc_att_control → mc_rate_control → control_allocator → ESC</div>
<ul><li><b>commander</b>: ARM, uçuş kipi ve failsafe durum makinesi. <b>navigator</b>: görev, eve dönüş, iniş. <b>mavlink</b>: dış dünyayla bağlantı.</li><li><b>Uçuş kipleri</b>: Stabilized (açı), Acro (hız), Altitude (irtifa tutma), Position (GPS ile konum tutma), Hold, Mission, Return, Land, Takeoff, Offboard (dış bilgisayar komutu), Precision Land.</li></ul>
<h3>MAVLink</h3>
<p>MAVLink, uçuş kontrolcüsüyle yer istasyonu ve görev bilgisayarı arasındaki ikili mesaj protokolüdür. Her sistem saniyede bir <code>HEARTBEAT</code> (#0) yollar. Telemetri için <code>ATTITUDE</code> (#30), <code>GLOBAL_POSITION_INT</code> (#33), <code>SYS_STATUS</code> (#1); komutlar için <code>COMMAND_LONG</code> içinde <code>MAV_CMD_COMPONENT_ARM_DISARM</code> (400), <code>MAV_CMD_NAV_TAKEOFF</code> (22); görev için <code>MISSION_ITEM_INT</code>; dış denetim için <code>SET_POSITION_TARGET_LOCAL_NED</code>. SITL\'de QGroundControl UDP 14550\'yi, MAVSDK ve betikler 14540\'ı kullanır.</p>
<p><b>MAVSDK</b>, MAVLink\'in üstünde Python/C++/Swift kütüphanesidir: <code>action.arm()</code>, <code>mission.upload_mission()</code> gibi çağrıları mesaj dizilerine çevirir ve onayları bekler.</p>`,
      code: [mavsdkPy('tr'), pymavlinkPy('tr')],
      lab: 'ESOF 323\'ün 2B quadrotor simülasyonunda önce konum tutma kipinde hedefe tıkla (Position kipine benzer), sonra görev kipine geç, ara noktaları yerleştir ve görevi başlat (Mission kipine benzer). Rüzgârı artır ve hangi döngünün zorlandığını gözle. Gazebo kurduysan MAVSDK betiğini SITL\'e karşı çalıştır.',
      pitfalls: ['EKF ve GPS hazır olmadan görev başlatmaya çalışmak: PX4 ARM\'ı reddeder, betik beklemeli.', 'QGroundControl, MAVSDK ve pymavlink\'i aynı UDP portunda dinletmek.', 'Komut onayını (COMMAND_ACK) kontrol etmemek: komut reddedilmiş olabilir.', 'MAVSDK sürümleri arasındaki API farklarını göz ardı etmek (ör. MissionItem alanları).'],
      se: `<p>PX4, <b>gevşek bağlı</b> bir mimarinin ders kitabı örneğidir: modüller yalnız uORB mesaj sözleşmeleriyle konuşur.</p>
<ul><li>Kendi görev yazılımını da böyle kur: algılama, karar ve denetim ayrı süreçler (ya da ROS 2 düğümleri), aralarında tanımlı mesajlar.</li><li>Mesaj tanımlarını (MAVLink XML, px4_msgs) sürümlü bir sözleşme olarak gör; değiştirmek tüm istemcileri etkiler.</li></ul>`,
      quiz: [
        { q: 'PX4 modülleri arasında veri hangi mekanizmayla akar?', options: ['uORB yayınla-abone ol veri yolu', 'Paylaşılan global değişkenler', 'HTTP istekleri', 'Doğrudan fonksiyon çağrıları'], answer: 0, why: 'Modüller uORB konularına yayın yapar ve abone olur; birbirini doğrudan çağırmaz.' },
        { q: 'Yer istasyonu bir aracın varlığını ve kimliğini hangi MAVLink mesajından öğrenir?', options: ['ATTITUDE', 'MISSION_ITEM_INT', 'COMMAND_ACK', 'HEARTBEAT'], answer: 3, why: 'HEARTBEAT (#0) saniyede bir gelir; sistem ve bileşen kimliği, araç türü ve kipi taşır.' },
        { q: 'Position kipinde kumanda çubukları bırakılınca drone ne yapar?', options: ['Düşer', 'Olduğu yerde konum ve irtifa tutar', 'Eve döner', 'İner'], answer: 1, why: 'Position kipi GPS ve EKF ile konumu tutar; çubuklar hız hedefi verir, bırakılınca hedef sıfırdır.' },
        { q: 'PX4 SITL\'de MAVSDK betikleri varsayılan olarak hangi UDP portuna bağlanır?', options: ['14550', '8888', '14540', '5760'], answer: 2, why: '14550 yer istasyonu (QGroundControl), 14540 offboard API (MAVSDK) içindir; 8888 uXRCE-DDS ajanıdır.' },
      ],
    },
    en: {
      title: 'PX4 architecture, flight modes, MAVLink and MAVSDK',
      summary: 'uORB modules, Position/Mission/Offboard modes, MAVLink messages and a mission with MAVSDK-Python.',
      goals: ['Draw PX4\'s module structure and the uORB data flow', 'List the flight modes and which sensors they need', 'Recognise the core MAVLink messages and commands', 'Upload and fly a mission in SITL with MAVSDK-Python'],
      notes: `<p>PX4 is made of modules running on the NuttX real-time operating system. Modules do not call each other directly; they talk over a publish-subscribe bus called <b>uORB</b>. That is why changing one module does not affect the others, and why the same code runs in SITL.</p>
<div class="eq">sensors → ekf2 → navigator / mc_pos_control → mc_att_control → mc_rate_control → control_allocator → ESC</div>
<ul><li><b>commander</b>: the ARM, flight-mode and failsafe state machine. <b>navigator</b>: missions, return, landing. <b>mavlink</b>: the link to the outside world.</li><li><b>Flight modes</b>: Stabilized (angle), Acro (rate), Altitude (altitude hold), Position (position hold with GPS), Hold, Mission, Return, Land, Takeoff, Offboard (commands from an external computer), Precision Land.</li></ul>
<h3>MAVLink</h3>
<p>MAVLink is the binary message protocol between the flight controller and the ground station or companion computer. Every system sends a <code>HEARTBEAT</code> (#0) once a second. Telemetry uses <code>ATTITUDE</code> (#30), <code>GLOBAL_POSITION_INT</code> (#33), <code>SYS_STATUS</code> (#1); commands use <code>COMMAND_LONG</code> carrying <code>MAV_CMD_COMPONENT_ARM_DISARM</code> (400), <code>MAV_CMD_NAV_TAKEOFF</code> (22); missions use <code>MISSION_ITEM_INT</code>; external control uses <code>SET_POSITION_TARGET_LOCAL_NED</code>. In SITL, QGroundControl uses UDP 14550, MAVSDK and scripts use 14540.</p>
<p><b>MAVSDK</b> is a Python/C++/Swift library on top of MAVLink: it turns calls such as <code>action.arm()</code> and <code>mission.upload_mission()</code> into message sequences and waits for acknowledgements.</p>`,
      code: [mavsdkPy('en'), pymavlinkPy('en')],
      lab: 'In the ESOF 323 2D quadrotor simulation first click a target in position-hold mode (similar to Position mode), then switch to mission mode, place waypoints and start the mission (similar to Mission mode). Increase the wind and watch which loop struggles. If you installed Gazebo, run the MAVSDK script against SITL.',
      pitfalls: ['Trying to start a mission before the EKF and GPS are ready: PX4 rejects ARM, the script must wait.', 'Having QGroundControl, MAVSDK and pymavlink listen on the same UDP port.', 'Not checking the command acknowledgement (COMMAND_ACK): the command may have been rejected.', 'Ignoring API differences between MAVSDK versions (e.g. MissionItem fields).'],
      se: `<p>PX4 is a textbook example of a <b>loosely coupled</b> architecture: modules talk only through uORB message contracts.</p>
<ul><li>Build your own mission software the same way: perception, decision and control as separate processes (or ROS 2 nodes) with defined messages between them.</li><li>Treat message definitions (MAVLink XML, px4_msgs) as a versioned contract; changing them affects every client.</li></ul>`,
      quiz: [
        { q: 'Through which mechanism does data flow between PX4 modules?', options: ['The uORB publish-subscribe bus', 'Shared global variables', 'HTTP requests', 'Direct function calls'], answer: 0, why: 'Modules publish to and subscribe from uORB topics; they do not call each other directly.' },
        { q: 'From which MAVLink message does a ground station learn that a vehicle exists and who it is?', options: ['ATTITUDE', 'MISSION_ITEM_INT', 'COMMAND_ACK', 'HEARTBEAT'], answer: 3, why: 'HEARTBEAT (#0) arrives once a second with the system and component IDs, vehicle type and mode.' },
        { q: 'In Position mode, what does the drone do when the sticks are released?', options: ['Falls', 'Holds position and altitude where it is', 'Returns home', 'Lands'], answer: 1, why: 'Position mode holds position with GPS and the EKF; the sticks give velocity setpoints, released sticks mean zero.' },
        { q: 'Which UDP port do MAVSDK scripts connect to by default in PX4 SITL?', options: ['14550', '8888', '14540', '5760'], answer: 2, why: '14550 is for the ground station (QGroundControl), 14540 for the offboard API (MAVSDK); 8888 is the uXRCE-DDS agent.' },
      ],
    },
  },
  {
    n: 9, pillars: ['yazilim', 'sim', 'parca'], sims: ['mission'], simCfg: { mission: { landing: 'vision' } }, esofSims: ['ros'], parts: ['camera', 'range', 'fc'],
    tr: {
      title: 'ROS 2 + PX4, SITL ve görüyle hassas iniş',
      summary: 'uXRCE-DDS köprüsü, offboard denetim, PX4 SITL + Gazebo kurulumu ve ArUco ile hassas iniş.',
      goals: ['PX4 ile ROS 2 arasındaki uXRCE-DDS köprüsünü açıklamak', 'PX4 SITL + Gazebo + ROS 2 ortamını kurmak', 'Offboard kipinde konum hedefi gönderen bir ROS 2 düğümü yazmak', 'ArUco işaretçisiyle hassas inişin algılama ve denetim zincirini kurmak'],
      notes: `<p>PX4 v1.14\'ten bu yana ROS 2\'ye <b>uXRCE-DDS</b> ile bağlanır: uçuş kontrolcüsündeki istemci uORB konularını, bilgisayardaki <code>MicroXRCEAgent</code> üzerinden ROS 2 konularına çevirir. Konular <code>/fmu/out/...</code> (PX4\'ten çıkan, ör. vehicle_status) ve <code>/fmu/in/...</code> (PX4\'e giren, ör. trajectory_setpoint) diye ayrılır; mesaj tanımları <code>px4_msgs</code> paketindedir ve PX4 sürümüyle eşleşmelidir.</p>
<h3>SITL: donanımsız tam sistem</h3>
<p>Döngüde yazılım (SITL) testinde gerçek PX4 kodu bilgisayarda derlenir, fizik ve sensörler Gazebo\'dan gelir. <code>make px4_sitl gz_x500</code> tek komutla quad\'ı başlatır; QGroundControl ve MAVSDK gerçek araçtaki gibi bağlanır. Bu dersin tarayıcı simülasyonları kavramı, SITL ise gerçek yazılımı test eder.</p>
<h3>Offboard denetim</h3>
<ul><li>Offboard kipine geçmeden önce <code>OffboardControlMode</code> ve hedef mesajları en az 2 Hz akmalıdır; akış kesilirse PX4 failsafe\'e geçer (<code>COM_OBL_RC_ACT</code>).</li><li>PX4 yerel çerçevesi <b>NED</b>\'dir: x kuzey, y doğu, z aşağı. 5 m yükseklik z = −5 demektir; ROS\'un ENU geleneğiyle karıştırma.</li></ul>
<h3>Görüyle hassas iniş</h3>
<p>Aşağı bakan kamera ArUco işaretçisini bulur, <code>solvePnP</code> ile işaretçinin kameraya göre konumunu hesaplar. İki yol vardır: (1) görev bilgisayarı yatay hız komutu üretir ve hizalanınca alçalır (görsel servo), (2) konum <code>LANDING_TARGET</code> olarak PX4\'e verilir ve yerleşik Precision Land kipi gerisini yapar. GPS\'le metrelerce olan iniş hatası böylece santimetrelere iner.</p>`,
      code: [sitlBash('tr'), offboardPy('tr'), arucoPy('tr')],
      lab: 'Görev simülasyonunda iniş kaynağı "ArUco kamerası" iken görevi birkaç kez çalıştır ve iniş hatasını GPS\'li 7. ünitedekiyle karşılaştır. Kamera hangi anda devreye giriyor (mavi kestirim)? ESOF 323 ROS 2 grafiği simülasyonunda bir düğümü durdurup hangi konuların sustuğuna bak: offboard düğümün çökerse PX4 ne yapmalı? Linux ya da WSL2 kullanıyorsan kabuk adımlarıyla SITL\'i kur ve offboard düğümünü çalıştır.',
      pitfalls: ['px4_msgs dalını PX4 sürümüyle eşleştirmemek: mesajlar uyuşmaz, konular boş görünür.', 'Offboard\'a akış başlamadan geçmeye çalışmak: PX4 reddeder.', 'NED ile ENU\'yu karıştırmak: drone yükselmek yerine yere iner.', 'Kamera kalibrasyonu yapmadan solvePnP kullanmak: mesafe ve konum hatalı çıkar.'],
      se: `<p>SITL, <b>sürekli entegrasyonun</b> parçası olabilir: her değişiklikte başsız (headless) Gazebo\'da görev çalıştırılır.</p>
<ul><li><code>HEADLESS=1 make px4_sitl gz_x500</code> ile görüntüsüz başlat, betikle görevi uçur, ULog\'dan kabul ölçütlerini ölç.</li><li>Senaryoları kod olarak tut (rüzgâr, GPS kaybı, bağlantı kesilmesi); her biri bir test olsun.</li></ul>`,
      quiz: [
        { q: 'PX4 (v1.14+) ile ROS 2 arasında hangi köprü kullanılır?', options: ['uXRCE-DDS (MicroXRCEAgent)', 'MAVROS zorunludur', 'HTTP REST', 'Seri port üzerinden CSV'], answer: 0, why: 'PX4 içindeki uXRCE-DDS istemcisi, bilgisayardaki ajan üzerinden uORB konularını ROS 2 konularına çevirir.' },
        { q: 'Offboard kipine geçmeden önce ne gerekir?', options: ['GPS\'in kapatılması', 'OffboardControlMode ve hedef mesajlarının en az 2 Hz akıyor olması', 'Kumandanın kapatılması', 'Bataryanın tam dolu olması'], answer: 1, why: 'PX4, akış yoksa offboard\'a geçişi reddeder ve akış kesilirse failsafe\'e geçer.' },
        { q: 'PX4 yerel çerçevesinde 5 m yükseklik hangi z değerine karşılık gelir?', options: ['z = 5', 'z = 0', 'z = −5', 'z = 50'], answer: 2, why: 'NED çerçevesinde z aşağı pozitiftir; yukarı 5 m, z = −5 demektir.' },
        { q: 'ArUco işaretçisinin kameraya göre konumunu bulmak için hangi OpenCV fonksiyonu kullanılır?', options: ['cv2.Canny', 'cv2.resize', 'cv2.findContours', 'cv2.solvePnP'], answer: 3, why: 'solvePnP bilinen 3B köşe noktaları ve görüntüdeki 2B karşılıklarından dönme ve öteleme vektörünü hesaplar.' },
      ],
    },
    en: {
      title: 'ROS 2 + PX4, SITL and vision-based precision landing',
      summary: 'The uXRCE-DDS bridge, offboard control, PX4 SITL + Gazebo setup and precision landing with ArUco.',
      goals: ['Explain the uXRCE-DDS bridge between PX4 and ROS 2', 'Set up a PX4 SITL + Gazebo + ROS 2 environment', 'Write a ROS 2 node that sends position setpoints in offboard mode', 'Build the perception and control chain of precision landing on an ArUco marker'],
      notes: `<p>Since v1.14, PX4 connects to ROS 2 through <b>uXRCE-DDS</b>: a client on the flight controller turns uORB topics into ROS 2 topics through the <code>MicroXRCEAgent</code> on the computer. Topics are split into <code>/fmu/out/...</code> (out of PX4, e.g. vehicle_status) and <code>/fmu/in/...</code> (into PX4, e.g. trajectory_setpoint); message definitions live in the <code>px4_msgs</code> package and must match the PX4 version.</p>
<h3>SITL: a complete system without hardware</h3>
<p>In software-in-the-loop (SITL) testing the real PX4 code is compiled on the computer, while physics and sensors come from Gazebo. <code>make px4_sitl gz_x500</code> starts the quad with one command; QGroundControl and MAVSDK connect as they would to a real vehicle. The browser simulations in this course teach the concept; SITL tests the real software.</p>
<h3>Offboard control</h3>
<ul><li>Before switching to offboard mode, <code>OffboardControlMode</code> and setpoint messages must stream at 2 Hz or more; if the stream stops PX4 enters a failsafe (<code>COM_OBL_RC_ACT</code>).</li><li>The PX4 local frame is <b>NED</b>: x north, y east, z down. 5 m altitude means z = −5; do not mix it up with the ROS ENU convention.</li></ul>
<h3>Vision-based precision landing</h3>
<p>A down-facing camera finds the ArUco marker and computes its position relative to the camera with <code>solvePnP</code>. There are two routes: (1) the companion computer produces horizontal velocity commands and descends once aligned (visual servoing), (2) the position is given to PX4 as <code>LANDING_TARGET</code> and the built-in Precision Land mode does the rest. A landing error of metres with GPS drops to centimetres this way.</p>`,
      code: [sitlBash('en'), offboardPy('en'), arucoPy('en')],
      lab: 'In the mission simulation run the mission several times with "ArUco camera" as the landing source and compare the landing error with the GPS landing of unit 7. At what moment does the camera take over (blue estimate)? In the ESOF 323 ROS 2 graph simulation stop a node and see which topics go quiet: if your offboard node crashes, what should PX4 do? If you use Linux or WSL2, set up SITL with the shell steps and run the offboard node.',
      pitfalls: ['Not matching the px4_msgs branch to the PX4 version: messages do not match and topics look empty.', 'Trying to enter offboard before the stream starts: PX4 rejects it.', 'Mixing up NED and ENU: the drone lands instead of climbing.', 'Using solvePnP without camera calibration: distance and position come out wrong.'],
      se: `<p>SITL can be part of <b>continuous integration</b>: run a mission in headless Gazebo on every change.</p>
<ul><li>Start without graphics using <code>HEADLESS=1 make px4_sitl gz_x500</code>, fly the mission from a script and measure the acceptance criteria from the ULog.</li><li>Keep scenarios as code (wind, GPS loss, link loss); each one is a test.</li></ul>`,
      quiz: [
        { q: 'Which bridge connects PX4 (v1.14+) and ROS 2?', options: ['uXRCE-DDS (MicroXRCEAgent)', 'MAVROS is mandatory', 'HTTP REST', 'CSV over a serial port'], answer: 0, why: 'The uXRCE-DDS client inside PX4 turns uORB topics into ROS 2 topics through the agent on the computer.' },
        { q: 'What is required before switching to offboard mode?', options: ['Turning off the GPS', 'OffboardControlMode and setpoint messages streaming at 2 Hz or more', 'Turning off the transmitter', 'A fully charged battery'], answer: 1, why: 'PX4 rejects the switch without a stream, and enters a failsafe if the stream stops.' },
        { q: 'In the PX4 local frame, which z value means 5 m altitude?', options: ['z = 5', 'z = 0', 'z = −5', 'z = 50'], answer: 2, why: 'In the NED frame z is positive down; 5 m up means z = −5.' },
        { q: 'Which OpenCV function finds an ArUco marker\'s position relative to the camera?', options: ['cv2.Canny', 'cv2.resize', 'cv2.findContours', 'cv2.solvePnP'], answer: 3, why: 'solvePnP computes the rotation and translation vectors from known 3D corner points and their 2D image positions.' },
      ],
    },
  },
  {
    n: 10, pillars: ['yazilim', 'sim', 'parca'], sims: ['flight', 'mission'], simCfg: { mission: { landing: 'vision' } }, parts: ['rc', 'telemetry', 'lipo'],
    tr: {
      title: 'Güvenlik, failsafe, mevzuat ve bitirme projesi',
      summary: 'Tehlike analizi, PX4 failsafe ve sanal çit, Türkiye\'de SHGM kuralları; bitirme projesinin planı.',
      goals: ['Bir drone görevi için tehlike analizi yapmak', 'PX4 failsafe eylemlerini ve sanal çiti parametrelerle ayarlamak', 'Türkiye\'deki İHA kayıt ve uçuş kurallarının çerçevesini söylemek', 'Bitirme projesinin gereksinim, mimari ve test planını çıkarmak'],
      notes: `<p>Güvenlik bir özellik değil, tasarımın ilk adımıdır. <b>Tehlike analizi</b> ile başla: ne ters gidebilir, sonucu ne olur, nasıl sezilir, sistem ne yapar?</p>
<ul><li><b>Kumanda kaybı</b> → Return ya da Land (<code>NAV_RCL_ACT</code>). <b>Telemetri kaybı</b> → <code>NAV_DLL_ACT</code>.</li><li><b>Düşük batarya</b> → kademeli: uyarı, eve dönüş, acil iniş (<code>BAT_*_THR</code>, <code>COM_LOW_BAT_ACT</code>). Eve dönüş için gereken enerjiyi hesaba kat: uçuş süresi simülasyonundaki yedek payı buradan gelir.</li><li><b>Sanal çit (geofence)</b> → yatay ve dikey sınır, aşılırsa Return (<code>GF_*</code>). <b>Offboard kaybı</b> → <code>COM_OBL_RC_ACT</code>.</li><li><b>GPS/EKF bozulması</b> → konum kiplerinden Altitude\'a ya da Land\'e düşüş; PX4 ön uçuş kontrolleri ARM\'ı engeller.</li></ul>
<h3>Türkiye\'de mevzuat (genel çerçeve)</h3>
<p>Sivil İHA\'lar Sivil Havacılık Genel Müdürlüğü\'nün (SHGM) <b>İnsansız Hava Aracı Sistemleri Talimatı</b>\'na tabidir. Kalkış ağırlığı 500 g ve üzerindeki İHA\'lar SHGM\'nin kayıt sistemine kaydedilir ve ağırlık sınıfına göre pilot belgesi gerekir. Havalimanları ve askeri bölgeler çevresinde, kalabalıkların ve yasak sahaların üzerinde uçuş yasaktır; bölgeye göre uçuş izni gerekebilir. Görüş hattında (VLOS) uçmak, irtifa sınırına uymak, başkalarının mahremiyetine saygı ve sigorta yükümlülükleri de kuralların parçasıdır. Avrupa Birliği\'nde açık/özel/sertifikalı kategoriler ve C0–C6 sınıf etiketleri vardır. Bu özet hukuki danışmanlık değildir: kurallar değişir, uçmadan önce güncel talimatı SHGM\'nin resmi sitesinden oku.</p>
<h3>Bitirme projesi</h3>
<p>Simüle otonom görev: kalkış → ara noktalar → ArUco ile hassas iniş, failsafe senaryolarıyla. Ayrıntılar ve teslimler bitirme projesi sayfasında; ESOF 323 drone kolunun yazılım mühendisliği teslimleriyle aynı yapıdadır.</p>`,
      code: [failsafeTxt('tr'), missionFsmPy('tr')],
      lab: 'Uçuş süresi simülasyonunda kullanılan kapasiteyi %80\'den %60\'a indir: eve dönüş yedeği uçuş süresinden ne kadar götürüyor? Görev simülasyonunda rotayı eve 80 m uzağa çiz, rüzgârı karşıdan ver ve görev süresine bak: bataryan buna yeter miydi? Durum makinesi koduna "GPS kaybı" olayını ekle ve testini yaz.',
      pitfalls: ['Failsafe\'leri varsayılanda bırakıp hiç denememek: SITL\'de her birini bilerek tetikle.', 'Eve dönüş irtifasını (RTL_RETURN_ALT) çevredeki engellerden alçak tutmak.', 'Batarya eşiğini eve dönüş mesafesini hesaba katmadan seçmek.', 'Mevzuatı "küçük drone, sorun olmaz" diye atlamak: 500 g eşiği yükle birlikte kalkış ağırlığıdır.'],
      se: `<p>Güvenlik kritik yazılımda <b>izlenebilirlik</b> zinciri kurulur: tehlike → güvenlik gereksinimi → tasarım → test → kanıt.</p>
<ul><li>Her failsafe bir gereksinim ("bağlantı kesilirse 10 s içinde Return"), her gereksinim bir SITL testi.</li><li>Durum makinesinin geçiş fonksiyonunu saf yaz ve tüm geçişleri birim testle kapsa; havacılık standartları (DO-178C) bu kapsama disiplinini zorunlu kılar.</li></ul>`,
      quiz: [
        { q: 'Türkiye\'de hangi kalkış ağırlığından itibaren İHA\'lar SHGM\'ye kaydedilir?', options: ['250 g', '500 g', '2 kg', '25 kg'], answer: 1, why: 'SHGM talimatına göre 500 g ve üzeri İHA\'lar kayıt sistemine kaydedilir (yük dahil kalkış ağırlığı). Güncel talimatı her zaman kontrol et.' },
        { q: 'PX4\'te telemetri (yer istasyonu) bağlantısı kesilince ne yapılacağını hangi parametre belirler?', options: ['NAV_RCL_ACT', 'MC_ROLL_P', 'NAV_DLL_ACT', 'THR_MDL_FAC'], answer: 2, why: 'NAV_DLL_ACT veri bağı (data link) kaybı eylemidir; NAV_RCL_ACT kumanda (RC) kaybı içindir.' },
        { q: 'Test piramidinde en çok sayıda ve en ucuz testler hangileridir?', options: ['Birim testleri', 'Gerçek uçuş testleri', 'Döngüde donanım testleri', 'Kabul testleri'], answer: 0, why: 'Birim testleri hızlı ve ucuzdur, hataların çoğu orada yakalanmalı; gerçek uçuş en pahalı ve risklidir.' },
        { q: 'Sanal çit (geofence) nedir?', options: ['Pervane koruması', 'Kumanda frekansı', 'Batarya şarj sınırı', 'Aşılırsa failsafe eylemi tetikleyen yazılımsal yatay/dikey uçuş sınırı'], answer: 3, why: 'GF_MAX_HOR_DIST / GF_MAX_VER_DIST aşılınca GF_ACTION (ör. Return) devreye girer.' },
      ],
    },
    en: {
      title: 'Safety, failsafes, regulations and the capstone project',
      summary: 'Hazard analysis, PX4 failsafes and geofence, SHGM rules in Türkiye; the capstone plan.',
      goals: ['Carry out a hazard analysis for a drone mission', 'Set PX4 failsafe actions and the geofence with parameters', 'State the framework of drone registration and flight rules in Türkiye', 'Draw up the requirements, architecture and test plan of the capstone project'],
      notes: `<p>Safety is not a feature but the first step of design. Start with a <b>hazard analysis</b>: what can go wrong, what happens then, how is it detected, what does the system do?</p>
<ul><li><b>RC loss</b> → Return or Land (<code>NAV_RCL_ACT</code>). <b>Data link loss</b> → <code>NAV_DLL_ACT</code>.</li><li><b>Low battery</b> → staged: warning, return, emergency landing (<code>BAT_*_THR</code>, <code>COM_LOW_BAT_ACT</code>). Account for the energy needed to return: that is where the reserve in the flight-time simulation comes from.</li><li><b>Geofence</b> → horizontal and vertical limits, Return if crossed (<code>GF_*</code>). <b>Offboard loss</b> → <code>COM_OBL_RC_ACT</code>.</li><li><b>GPS/EKF degradation</b> → fall back from position modes to Altitude or Land; PX4 pre-flight checks block ARM.</li></ul>
<h3>Regulations in Türkiye (general framework)</h3>
<p>Civil drones fall under the <b>Unmanned Aircraft Systems Instruction</b> of the Directorate General of Civil Aviation (SHGM). Drones with a take-off mass of 500 g or more are registered in SHGM\'s registration system, and a pilot certificate is required depending on the weight class. Flying near airports and military zones, over crowds and restricted areas is prohibited; a flight permit may be needed depending on the area. Flying within visual line of sight (VLOS), respecting the altitude limit, other people\'s privacy and insurance obligations are also part of the rules. In the European Union there are open/specific/certified categories and C0–C6 class labels. This summary is not legal advice: rules change, so read the current instruction on SHGM\'s official site before flying.</p>
<h3>Capstone project</h3>
<p>A simulated autonomous mission: take-off → waypoints → precision landing on ArUco, with failsafe scenarios. Details and deliverables are on the capstone page; the structure matches the software engineering deliverables of the ESOF 323 drone track.</p>`,
      code: [failsafeTxt('en'), missionFsmPy('en')],
      lab: 'In the flight-time simulation lower the capacity used from 80% to 60%: how much flight time does the return reserve cost? In the mission simulation draw a route 80 m from home, add a headwind and look at the mission time: would your battery have been enough? Add a "GPS lost" event to the state machine code and write its test.',
      pitfalls: ['Leaving failsafes at their defaults and never trying them: trigger each one deliberately in SITL.', 'Setting the return altitude (RTL_RETURN_ALT) below the surrounding obstacles.', 'Choosing a battery threshold without accounting for the return distance.', 'Skipping the regulations because "it is a small drone": the 500 g threshold is the take-off mass including payload.'],
      se: `<p>Safety-critical software builds a <b>traceability</b> chain: hazard → safety requirement → design → test → evidence.</p>
<ul><li>Every failsafe is a requirement ("Return within 10 s if the link drops"), every requirement a SITL test.</li><li>Write the state machine\'s transition function as a pure function and cover every transition with unit tests; aviation standards (DO-178C) make this coverage discipline mandatory.</li></ul>`,
      quiz: [
        { q: 'From which take-off mass are drones registered with SHGM in Türkiye?', options: ['250 g', '500 g', '2 kg', '25 kg'], answer: 1, why: 'Under the SHGM instruction, drones of 500 g and above (take-off mass including payload) are registered. Always check the current instruction.' },
        { q: 'In PX4, which parameter sets the action when the data link (ground station) is lost?', options: ['NAV_RCL_ACT', 'MC_ROLL_P', 'NAV_DLL_ACT', 'THR_MDL_FAC'], answer: 2, why: 'NAV_DLL_ACT is the data link loss action; NAV_RCL_ACT is for RC loss.' },
        { q: 'Which tests are the most numerous and cheapest in the test pyramid?', options: ['Unit tests', 'Real flight tests', 'Hardware-in-the-loop tests', 'Acceptance tests'], answer: 0, why: 'Unit tests are fast and cheap and should catch most bugs; real flight is the most expensive and risky.' },
        { q: 'What is a geofence?', options: ['A propeller guard', 'The transmitter frequency', 'A battery charge limit', 'A software horizontal/vertical flight limit that triggers a failsafe action when crossed'], answer: 3, why: 'When GF_MAX_HOR_DIST / GF_MAX_VER_DIST is exceeded, GF_ACTION (e.g. Return) kicks in.' },
      ],
    },
  },
]
