// ESOF 323 simülasyonlarının başlık ve açıklamaları (TR/EN). Kimlikler sims-core.ts'teki SIMS anahtarlarıyla aynı.
export type SimId = 'line' | 'filter' | 'pwm' | 'pid' | 'diff' | 'arm' | 'path' | 'pf' | 'drone' | 'swarm' | 'ros'
interface Text { title: string; desc: string }

export const SIM_META: Record<SimId, { tr: Text; en: Text }> = {
  line: {
    en: { title: 'Line follower', desc: 'A two-wheeled robot with reflectance sensors. Compare a bang-bang controller using two sensors with a PD controller using a five-sensor array.' },
    tr: { title: 'Çizgi izleyen robot', desc: 'Yansıma sensörlü iki tekerlekli robot. İki sensörlü aç-kapa (bang-bang) denetleyiciyi beş sensörlü PD denetleyiciyle karşılaştır.' },
  },
  filter: {
    en: { title: 'Sensor noise and filtering', desc: 'A noisy distance sensor sampled at 30 Hz. Compare a moving average, an exponential moving average and a 1D Kalman filter against the true distance.' },
    tr: { title: 'Sensör gürültüsü ve filtreleme', desc: '30 Hz örneklenen gürültülü bir mesafe sensörü. Hareketli ortalamayı, üstel hareketli ortalamayı (EMA) ve tek boyutlu Kalman filtresini gerçek mesafeyle karşılaştır.' },
  },
  pwm: {
    en: { title: 'PWM and motor speed', desc: 'PWM switches a 12 V supply fully on and off. The motor and the LED respond to the average voltage, so the duty cycle sets speed and brightness. Time is slowed down here; Arduino PWM runs at about 490 Hz.' },
    tr: { title: 'PWM ve motor hızı', desc: 'PWM, 12 V beslemeyi tamamen açıp kapatır. Motor ve LED ortalama gerilime tepki verir, bu yüzden doluluk oranı hızı ve parlaklığı belirler. Burada zaman yavaşlatıldı; Arduino PWM yaklaşık 490 Hz\'de çalışır.' },
  },
  pid: {
    en: { title: 'PID step response', desc: 'A cart on a rail with friction. The setpoint toggles between 0 and 1 every 5 seconds. Start with P only, add D to damp the overshoot, then add a disturbance and use I to remove the steady-state error.' },
    tr: { title: 'PID basamak yanıtı', desc: 'Sürtünmeli bir ray üzerinde araba. Hedef değer her 5 saniyede 0 ile 1 arasında değişir. Yalnız P ile başla, aşımı sönümlemek için D ekle, sonra bozucu kuvvet ver ve kalıcı durum hatasını I ile gider.' },
  },
  diff: {
    en: { title: 'Differential drive kinematics', desc: 'Set the wheel speeds and watch the robot turn about its instantaneous centre of rotation (ICR). The dashed robot is the odometry estimate: it assumes perfect wheels, while the real wheels have a small radius error.' },
    tr: { title: 'Diferansiyel sürüş kinematiği', desc: 'Tekerlek hızlarını ayarla ve robotun anlık dönme merkezi (ADM, ICR) etrafında dönüşünü izle. Kesikli robot odometri tahminidir: tekerlekleri kusursuz sayar, oysa gerçek tekerleklerde küçük bir yarıçap hatası vardır.' },
  },
  arm: {
    en: { title: 'Two-link arm kinematics', desc: 'Drag on the canvas to move the target and solve inverse kinematics, or switch to forward kinematics and set the joint angles yourself. The shaded ring is the reachable workspace.' },
    tr: { title: 'İki eklemli kol kinematiği', desc: 'Hedefi taşımak ve ters kinematiği çözmek için tuvalde sürükle, ya da ileri kinematiğe geçip eklem açılarını kendin ayarla. Gölgeli halka erişilebilir çalışma alanıdır.' },
  },
  path: {
    en: { title: 'Grid path planning', desc: 'Draw walls, move the start and goal, then run a search. Compare how many cells each algorithm expands before it finds a path, and whether the path is the shortest.' },
    tr: { title: 'Izgarada yol planlama', desc: 'Duvar çiz, başlangıcı ve hedefi taşı, sonra aramayı çalıştır. Her algoritmanın yol bulana kadar kaç hücre genişlettiğini ve yolun en kısa olup olmadığını karşılaştır.' },
  },
  pf: {
    en: { title: 'Particle filter localization', desc: 'The robot measures noisy distances to four landmarks. Each blue dot is one guess of where the robot is; the red ring is the filter\'s estimate. Kidnap the robot to see the filter lose it and recover.' },
    tr: { title: 'Parçacık filtresiyle konum belirleme', desc: 'Robot dört işaret noktasına gürültülü mesafeler ölçer. Her mavi nokta robotun nerede olduğuna dair bir tahmindir; kırmızı halka filtrenin kestirimidir. Filtrenin robotu kaybedip yeniden bulduğunu görmek için robotu kaçır.' },
  },
  drone: {
    en: { title: 'Quadrotor flight control (2D)', desc: 'A planar quadrotor with a cascaded controller: a position PID outside and an attitude PD inside. Click the sky to set a target, or switch to mission mode, click to place waypoints and start the mission.' },
    tr: { title: 'Quadrotor uçuş denetimi (2B)', desc: 'Kaskad denetleyicili düzlemsel quadrotor: dışta konum PID, içte yönelim PD. Hedef koymak için gökyüzüne tıkla, ya da görev kipine geçip ara noktaları yerleştir ve görevi başlat.' },
  },
  swarm: {
    en: { title: 'Swarm flocking (boids)', desc: 'Each drone follows three local rules using only nearby neighbours: keep apart (separation), match heading (alignment) and stay with the group (cohesion). Click to move the swarm goal.' },
    tr: { title: 'Sürü davranışı (boids)', desc: 'Her drone yalnız yakın komşularına bakarak üç yerel kurala uyar: uzak dur (ayrılma), yönünü eşle (hizalanma) ve grupla kal (birlik). Sürünün hedefini taşımak için tıkla.' },
  },
  ros: {
    en: { title: 'ROS 2 computation graph', desc: 'Nodes publish messages on topics and other nodes subscribe to them. Click a node to stop or start it and see which parts of the system go quiet.' },
    tr: { title: 'ROS 2 hesaplama grafiği', desc: 'Düğümler konulara (topic) mesaj yayınlar, diğer düğümler bunlara abone olur. Bir düğümü durdurmak ya da başlatmak için tıkla ve sistemin hangi kısımlarının sustuğunu gör.' },
  },
}
