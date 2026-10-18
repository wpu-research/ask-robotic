// "Raspberry Pi ile Robotik Programlama" (büyükler için, 16+): 10 ünite, 9 tarayıcı simülasyonu, bitirme projesi
// "kameralı keşif robotu". Sayfalar components/gomulu altındaki ortak bileşenlerle çizilir (STM32 dersiyle aynı çatı).
import { D, type Capstone, type CourseDef } from '@/lib/gomulu/types'
import { capstoneMain } from './code'
import { RPI_SIMS, type RpiSimId } from './sims'
import { UNITS_A } from './units-a'
import { UNITS_B } from './units-b'

const CAPSTONE: Capstone = {
  hyvex: ['raspberry-pi-4b', 'l298n', 'metal-disli-dc-motor', 'hc-sr04', 'li-ion-18650-batarya', 'lm2596-buck', 'mpu6050'],
  deliverables: [
    D(2, ['Öneri ve kurulum betiği', 'Senaryo, gereksinimler (G1–G6), kart seçimi ADR\'si ve depoda çalışan setup.sh.'], ['Proposal and setup script', 'Scenario, requirements (R1–R6), a board-choice ADR and a working setup.sh in the repository.']),
    D(5, ['Donanım katmanı', 'hw.py: motor, enkoder, ultrasonik ve sıcaklık sınıfları; sahte (fake) karşılıklarıyla pytest testleri.'], ['Hardware layer', 'hw.py: motor, encoder, ultrasonic and temperature classes; pytest tests with their fake counterparts.']),
    D(7, ['Algılama ve hız denetimi', 'Renkli hedef algılayıcı (kayıtlı karelerle test) ve PI hız döngüsü; ayar dosyası.'], ['Perception and speed control', 'Coloured-target detector (tested on recorded frames) and the PI speed loop; a configuration file.']),
    D(9, ['Panel ve durum makinesi', 'Flask paneli, bekçi ve next_mode() geçiş fonksiyonu; her kenar için test.'], ['Panel and state machine', 'Flask panel, watchdog and the next_mode() transition function; a test for every edge.']),
    D(10, ['Sistem ve demo', 'ROS 2 düğümleri ya da tek süreçli sürüm, systemd birimi, 3 dakikalık demo videosu ve rapor.'], ['System and demo', 'ROS 2 nodes or the single-process version, systemd unit, a 3-minute demo video and a report.']),
  ],
  grading: {
    tr: [['Öneri, gereksinimler, ADR', '%15'], ['Donanım katmanı ve testler', '%20'], ['Algılama ve denetim', '%20'], ['Panel, güvenlik, durum makinesi', '%20'], ['Sistem, demo ve rapor', '%25']],
    en: [['Proposal, requirements, ADR', '15%'], ['Hardware layer and tests', '20%'], ['Perception and control', '20%'], ['Panel, safety, state machine', '20%'], ['System, demo and report', '25%']],
  },
  tr: {
    title: 'Bitirme projesi: kameralı keşif robotu',
    summary: 'Web panelinden elle sürülen ya da kamerasıyla renkli bir hedefi kendiliğinden izleyen, engelde ve düşük pilde güvenle duran, açılışta kendiliğinden başlayan iki tekerlekli bir Pi robotu.',
    scenario: 'Robot bir okul koridorunda yeşil bir topu arar. Operatör telefonundan paneli açar, robotu elle sürer, "izle" kipine geçince robot topu kamerayla bulup 30 cm\'ye kadar yaklaşır. Ultrasonik sensör 15 cm\'de engel görürse, pil 6,4 V\'un altına inerse ya da panelle bağlantı koparsa robot durur. Pi açıldığında yazılım systemd ile kendiliğinden başlar.',
    requirements: [
      'G1: Panelden gelen komut 200 ms içinde motorlara ulaşır (günlükten ölçülür).',
      'G2: Bağlantı 1 s koparsa robot durur (bekçi testi).',
      'G3: İzle kipinde top 3 m içindeyse robot 20 s içinde 30 ± 10 cm\'ye yaklaşır (5 denemenin 4\'ü).',
      'G4: Engel 15 cm\'den yakınsa robot her kipte durur.',
      'G5: Pil eşiğin altına inince robot SAFE_STOP kipine geçer ve panelde uyarı gösterir.',
      'G6: Elektrik verildikten sonra 60 s içinde panel erişilebilir olur (systemd).',
    ],
    architecture: [
      'Donanım katmanı (hw.py): Drive, Encoder, Ultrasonic, Battery sınıfları; her birinin testte kullanılan sahte karşılığı.',
      'Algılama: picamera2 → HSV maske → ağırlık merkezi → target_x (−1..1) ya da None.',
      'Karar: saf next_mode(mode, inputs) durum makinesi; IDLE, TELEOP, FOLLOW, SAFE_STOP.',
      'Denetim: (v, ω) → tekerlek hızları → PI hız döngüsü (20 ms).',
      'Arayüz: Flask paneli ve /api uç noktaları; isteğe bağlı ROS 2 sürümünde aynı bloklar düğüm olur (camera, detector, follower, twist_mux, motor_driver).',
      'İşletim: systemd birimi, ayar dosyası (YAML), journalctl ile günlük.',
    ],
    tests: [
      'Birim: next_mode\'un her geçişi, odometri özellikleri, PI kapalı döngü testi (motor modeliyle), w1_slave ve HTTP doğrulama.',
      'Bileşen: kayıtlı 20 kare üzerinde algılayıcı, beklenen ağırlık merkezine 5 piksel içinde.',
      'Benzetim: bu sayfadaki simülasyonlarda (GPIO, motor, robot, Flask, ROS) senaryolar.',
      'Donanımda: G1–G6 için ölçüm tablosu; her deneme günlük dosyasıyla kanıtlanır.',
    ],
    demo: ['Açılış: fişi tak, 60 s içinde paneli aç (G6).', 'Elle sürüş ve bağlantı kesme (G1, G2).', 'İzle kipi: topu bul ve yaklaş (G3).', 'Engel ve düşük pil senaryosu (G4, G5).'],
  },
  en: {
    title: 'Capstone project: camera exploration robot',
    summary: 'A two-wheeled Pi robot that is driven by hand from a web panel or follows a coloured target with its camera by itself, stops safely at obstacles and on low battery, and starts by itself at boot.',
    scenario: 'The robot looks for a green ball in a school corridor. The operator opens the panel on a phone and drives the robot by hand; in "follow" mode the robot finds the ball with its camera and approaches to 30 cm. If the ultrasonic sensor sees an obstacle at 15 cm, the battery drops below 6.4 V or the panel link drops, the robot stops. When the Pi powers up the software starts by itself through systemd.',
    requirements: [
      'R1: A command from the panel reaches the motors within 200 ms (measured from the log).',
      'R2: If the link drops for 1 s the robot stops (watchdog test).',
      'R3: In follow mode, with the ball within 3 m, the robot reaches 30 ± 10 cm within 20 s (4 of 5 trials).',
      'R4: If an obstacle is closer than 15 cm the robot stops in every mode.',
      'R5: When the battery falls below the threshold the robot enters SAFE_STOP and shows a warning on the panel.',
      'R6: The panel is reachable within 60 s of power-on (systemd).',
    ],
    architecture: [
      'Hardware layer (hw.py): Drive, Encoder, Ultrasonic, Battery classes; each with a fake counterpart used in tests.',
      'Perception: picamera2 → HSV mask → centroid → target_x (−1..1) or None.',
      'Decision: a pure next_mode(mode, inputs) state machine; IDLE, TELEOP, FOLLOW, SAFE_STOP.',
      'Control: (v, ω) → wheel speeds → PI speed loop (20 ms).',
      'Interface: the Flask panel and /api endpoints; in the optional ROS 2 version the same blocks become nodes (camera, detector, follower, twist_mux, motor_driver).',
      'Operations: a systemd unit, a configuration file (YAML), logs with journalctl.',
    ],
    tests: [
      'Unit: every transition of next_mode, odometry properties, a PI closed-loop test (with the motor model), w1_slave and HTTP validation.',
      'Component: the detector on 20 recorded frames, within 5 pixels of the expected centroid.',
      'Simulation: scenarios in this course\'s simulations (GPIO, motor, robot, Flask, ROS).',
      'On hardware: a measurement table for R1–R6; every trial is backed by a log file.',
    ],
    demo: ['Boot: plug in, open the panel within 60 s (R6).', 'Manual driving and cutting the link (R1, R2).', 'Follow mode: find the ball and approach (R3).', 'Obstacle and low-battery scenario (R4, R5).'],
  },
}

export const RPI_COURSE: CourseDef<RpiSimId> = {
  slug: 'raspberry-pi',
  kit: 'rpi',
  code: 'RPI',
  text: {
    tr: {
      title: 'Raspberry Pi ile Robotik Programlama',
      short: 'Raspberry Pi dersi',
      lede: 'Linux\'tan GPIO\'ya, kameradan ROS 2\'ye: bir Raspberry Pi\'yi robotun beynine dönüştür. Her ünitede tarayıcıda çalışan bir simülasyon (terminal, 40 pinli başlık, sensör veri yolları, OpenCV, motor ve enkoder, diferansiyel sürüş, Flask, ROS 2), gerçek kod ve kısa bir test var. Kart olmadan başlanır; kartı olan aynı adımları masasında tekrarlar.',
      audience: '16 yaş ve üzeri; lise son sınıf, meslek lisesi, üniversite ve meslekten öğrenenler',
      duration: '10 ünite, yaklaşık 45 saat (ders + uygulama)',
      prereq: 'Temel Python (değişken, döngü, fonksiyon) ve basit devre bilgisi (Ohm yasası). Laboratuvardaki Uno çalışmaları yardımcıdır ama şart değildir.',
      outcomes: ['Raspberry Pi OS\'u ekransız kurup komut satırından yönetmek', 'GPIO, I²C, SPI ve 1-Wire ile sensör ve eyleyici bağlamak', 'Kamera ve OpenCV ile hedef algılamak', 'Motorları enkoderle kapalı döngüde sürmek ve odometri hesaplamak', 'Flask paneli ve ROS 2 düğümleriyle robotu yönetmek', 'Yazılımı systemd ile güvenilir biçimde çalıştırmak ve test etmek'],
      certificate: 'Üniteleri ve bitirme projesini tamamlayanlar Macademia katılım belgesi alır.',
      tools: ['Bu platform: 9 simülasyon, tarayıcıda Python (Pyodide), Uno devre laboratuvarı', 'Gerçek kartla: Raspberry Pi 4/5, Camera Module, L298N ya da TB6612FNG, enkoderli motorlar', 'Yazılım: Raspberry Pi OS Bookworm, gpiozero, picamera2, OpenCV, Flask, ROS 2 Jazzy'],
    },
    en: {
      title: 'Robotics Programming with Raspberry Pi',
      short: 'Raspberry Pi course',
      lede: 'From Linux to GPIO, from the camera to ROS 2: turn a Raspberry Pi into a robot\'s brain. Every unit has an in-browser simulation (terminal, 40-pin header, sensor buses, OpenCV, motor and encoder, differential drive, Flask, ROS 2), real code and a short quiz. You start without a board; with a board you repeat the same steps on your desk.',
      audience: 'Ages 16 and up; final-year high school, vocational school, university and working learners',
      duration: '10 units, about 45 hours (lessons + practice)',
      prereq: 'Basic Python (variables, loops, functions) and simple circuits (Ohm\'s law). The Uno work in the lab helps but is not required.',
      outcomes: ['Set up Raspberry Pi OS headless and manage it from the command line', 'Connect sensors and actuators over GPIO, I²C, SPI and 1-Wire', 'Detect a target with the camera and OpenCV', 'Drive motors in a closed loop with encoders and compute odometry', 'Run the robot with a Flask panel and ROS 2 nodes', 'Run the software reliably with systemd and test it'],
      certificate: 'Learners who complete the units and the capstone receive a Macademia certificate of participation.',
      tools: ['This platform: 9 simulations, Python in the browser (Pyodide), the Uno circuit lab', 'With a real board: Raspberry Pi 4/5, Camera Module, L298N or TB6612FNG, motors with encoders', 'Software: Raspberry Pi OS Bookworm, gpiozero, picamera2, OpenCV, Flask, ROS 2 Jazzy'],
    },
  },
  units: [...UNITS_A, ...UNITS_B],
  sims: RPI_SIMS,
  capstone: CAPSTONE,
  starter: (l) => [capstoneMain(l)],
  related: [
    { href: '/muhendislik/arm-stm32', tr: 'ARM (STM32) ile Gömülü Programlama: Pi + MCU mimarisinin MCU tarafı', en: 'Embedded Programming with ARM (STM32): the MCU side of a Pi + MCU architecture' },
    { href: '/muhendislik/robotik/hafta/12', tr: 'ESOF 323, 12. hafta: ROS 2 ve simülasyon', en: 'ESOF 323, week 12: ROS 2 and simulation' },
    { href: '/muhendislik/robotik/hafta/10', tr: 'ESOF 323, 10. hafta: robotlar için bilgisayarlı görü', en: 'ESOF 323, week 10: computer vision for robots' },
    { href: '/makine-ogrenmesi', tr: 'Makine öğrenmesi dersi: ölçümlerden model', en: 'Machine learning course: models from measurements' },
    { href: '/robotun-gozleri/demolar', tr: 'Gerçek hayat demoları: cihaz içi görüntü işleme', en: 'Real-life demos: on-device computer vision' },
  ],
}

export const rpiUnit = (n: number) => RPI_COURSE.units.find((u) => u.n === n)
