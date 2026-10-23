// Kariyer yol haritası: büyükler için (16+) bütün dersleri dört aşamada toplar ve "ne olmak istiyorsun?" seçeneklerine
// göre hangi derslerin hangi sırayla bitirileceğini verir. Sayfa app/yol-haritasi'nda. Ders saatleri programlar.ts ile
// aynıdır (kariyer.test.ts eşitliği ve her bağlantının gerçek bir rotaya gittiğini sınar).

export interface CourseInfo { hours: number; tr: { title: string; topics: string }; en: { title: string; topics: string } }
export type StageKey = 'temel' | 'gomulu' | 'robotik' | 'yz'

const K = (hours: number, tr: [string, string], en: [string, string]): CourseInfo => ({ hours, tr: { title: tr[0], topics: tr[1] }, en: { title: en[0], topics: en[1] } })

/** Büyükler için bütün dersler (href → künye). */
export const COURSES: Record<string, CourseInfo> = {
  '/laboratuvar': K(8, ['Devre laboratuvarı', 'Sanal Arduino Uno, 72 parça, kablo ve kod'], ['Circuit lab', 'Virtual Arduino Uno, 72 parts, wiring and code']),
  '/moduller/arduino-temelleri': K(28, ['Arduino Temelleri', 'Giriş/çıkış, analog, PWM, motor, zamanlama, ekran'], ['Arduino Basics', 'Input/output, analog, PWM, motors, timing, displays']),
  '/moduller/sensorler-ve-projeler': K(32, ['Sensörler ve Projeler', 'Mesafe, hareket, ortam, ses, gaz ve kimlik sensörleri'], ['Sensors and Projects', 'Distance, motion, environment, sound, gas and identity sensors']),
  '/muhendislik': K(10, ['Mühendislik parçaları (3B)', '128 gerçek parça, 7 seviye, döndürülebilir 3B model'], ['Engineering parts (3D)', '128 real parts, 7 levels, rotatable 3D models']),
  '/muhendislik/arm-stm32': K(47, ['ARM ve STM32 ile gömülü programlama', 'Yazmaçlar, HAL, kesmeler, DMA, PWM, FreeRTOS'], ['Embedded programming with ARM and STM32', 'Registers, HAL, interrupts, DMA, PWM, FreeRTOS']),
  '/muhendislik/raspberry-pi': K(45, ['Raspberry Pi ile robotik', 'Linux, Python, GPIO, kamera, ROS 2'], ['Robotics with Raspberry Pi', 'Linux, Python, GPIO, camera, ROS 2']),
  '/muhendislik/iot': K(40, ['ESP32 ile Nesnelerin İnterneti', 'Wi-Fi, MQTT, bulut panosu, OTA, derin uyku'], ['Internet of Things with ESP32', 'Wi-Fi, MQTT, cloud dashboard, OTA, deep sleep']),
  '/moduller/robotik': K(32, ['Robotik modülü', 'Sürüş, engel, çizgi, enkoder, PID, denge'], ['Robotics module', 'Driving, obstacles, lines, encoders, PID, balance']),
  '/muhendislik/robotik': K(56, ['Üniversite dersi: Robotik (ESOF 323)', 'PID, kinematik, planlama, sensör füzyonu, ROS 2'], ['University course: Robotics (ESOF 323)', 'PID, kinematics, planning, sensor fusion, ROS 2']),
  '/muhendislik/drone': K(40, ['Drone mühendisliği', 'Motor, ESC, LiPo, PID, PX4, MAVLink, hassas iniş'], ['Drone engineering', 'Motors, ESC, LiPo, PID, PX4, MAVLink, precision landing']),
  '/muhendislik/robot-kolu': K(40, ['Robot Kolu Mühendisliği', '6 eksenli kol, kinematik, tutucu, ArmScript, hücre güvenliği'], ['Robot Arm Engineering', '6-axis arm, kinematics, gripper, ArmScript, cell safety']),
  '/muhendislik/insansi': K(8, ['İnsansı robot', 'İleri/ters kinematik, ağırlık merkezi, LIPM yürüyüş'], ['Humanoid robot', 'Forward/inverse kinematics, centre of mass, LIPM walking']),
  '/ai-atolyesi': K(6, ['AI atölyesi', 'Token, prompt, RAG ve ajan araçları'], ['AI workshop', 'Tokens, prompts, RAG and agent tools']),
  '/makine-ogrenmesi': K(60, ['Makine öğrenmesi', 'Regresyondan sinir ağına, algoritmalar sıfırdan'], ['Machine learning', 'From regression to neural networks, algorithms from scratch']),
  '/muhendislik/sensor-ml': K(32, ['Sensör verisinden makine öğrenmesi', 'Zaman serisi, sınıflandırma, cihaz üstü çıkarım'], ['Machine learning on sensor data', 'Time series, classification, on-device inference']),
  '/muhendislik/opencv': K(36, ['OpenCV ile görüntü işleme', 'Süzgeç, kontur, öznitelik, kalibrasyon, ArUco'], ['Image processing with OpenCV', 'Filters, contours, features, calibration, ArUco']),
  '/muhendislik/pytorch': K(40, ['PyTorch ile derin öğrenme', 'Tensör, eğitim döngüsü, CNN, transfer öğrenme'], ['Deep learning with PyTorch', 'Tensors, training loop, CNNs, transfer learning']),
  '/muhendislik/llm': K(40, ['Büyük Dil Modeli Uygulamaları', 'Gömme, RAG, ajan, değerlendirme, güvenlik, maliyet'], ['Large Language Model Applications', 'Embeddings, RAG, agents, evaluation, safety, cost']),
  '/robotun-gozleri/demolar': K(6, ['Gerçek hayat demoları', 'Düşme, bölge ihlali, nabız, trafik; kamerayla canlı'], ['Real-life demos', 'Falls, zone intrusion, pulse, traffic; live on the camera']),
}

export interface Stage { key: StageKey; tr: { title: string; summary: string }; en: { title: string; summary: string }; courses: string[] }

/** Yol haritası: bütün dersler dört aşamada (her ders tam bir aşamada). */
export const STAGES: readonly Stage[] = [
  { key: 'temel', tr: { title: 'Temel: devre, kod ve sensör', summary: 'Her yolun ortak başlangıcı. Elektrik, Arduino ve sensör okumadan sonra her şey daha kolay.' }, en: { title: 'Foundations: circuits, code and sensors', summary: 'The common start of every path. After electricity, Arduino and reading sensors, everything else gets easier.' },
    courses: ['/laboratuvar', '/moduller/arduino-temelleri', '/moduller/sensorler-ve-projeler', '/muhendislik'] },
  { key: 'gomulu', tr: { title: 'Gömülü ve bağlı sistemler', summary: 'Mikrodenetleyiciden ARM\'ye, Linux kartına ve buluta: donanımın içinde çalışan yazılım.' }, en: { title: 'Embedded and connected systems', summary: 'From microcontrollers to ARM, a Linux board and the cloud: software that runs inside the hardware.' },
    courses: ['/muhendislik/arm-stm32', '/muhendislik/raspberry-pi', '/muhendislik/iot'] },
  { key: 'robotik', tr: { title: 'Robotik ve otonomi', summary: 'Hareket, denetim ve planlama: tekerlekli robottan drone\'a, robot koluna ve insansıya.' }, en: { title: 'Robotics and autonomy', summary: 'Motion, control and planning: from wheeled robots to drones, robot arms and humanoids.' },
    courses: ['/moduller/robotik', '/muhendislik/robotik', '/muhendislik/drone', '/muhendislik/robot-kolu', '/muhendislik/insansi'] },
  { key: 'yz', tr: { title: 'Yapay zekâ ve görü', summary: 'Veriden öğrenen ve gören sistemler: makine öğrenmesi, derin öğrenme, görüntü işleme ve dil modelleri.' }, en: { title: 'AI and vision', summary: 'Systems that learn from data and see: machine learning, deep learning, image processing and language models.' },
    courses: ['/ai-atolyesi', '/makine-ogrenmesi', '/muhendislik/sensor-ml', '/muhendislik/opencv', '/muhendislik/pytorch', '/muhendislik/llm', '/robotun-gozleri/demolar'] },
]

export interface CareerText { title: string; summary: string; work: string }
export interface Career { slug: string; tr: CareerText; en: CareerText; core: string[]; extra: string[] }

const T = (title: string, summary: string, work: string): CareerText => ({ title, summary, work })

/** "Ne olmak istiyorsun?" seçenekleri: core sırayla bitirilecek dersler, extra önerilenler. */
export const CAREERS: readonly Career[] = [
  { slug: 'robotik-yazilim',
    tr: T('Robotik yazılım mühendisi', 'Robotun beynini yazan kişi: sensör okur, motor sürer, PID ile denetler, ROS 2 ile parçaları birleştirir.', 'Otonom mobil robot, depo robotu ve servis robotu firmaları, Ar-Ge merkezleri'),
    en: T('Robotics software engineer', 'The person who writes the robot\'s brain: reads sensors, drives motors, controls with PID and ties the pieces together with ROS 2.', 'Autonomous mobile robots, warehouse and service robot companies, R&D centres'),
    core: ['/moduller/arduino-temelleri', '/moduller/sensorler-ve-projeler', '/moduller/robotik', '/muhendislik/raspberry-pi', '/muhendislik/robotik'], extra: ['/muhendislik/opencv', '/muhendislik/robot-kolu'] },
  { slug: 'gomulu-yazilim',
    tr: T('Gömülü yazılım mühendisi', 'Kartın içinde çalışan kodu yazar: yazmaçlar, kesmeler, haberleşme protokolleri ve gerçek zamanlı işletim sistemi.', 'Savunma, otomotiv, beyaz eşya, medikal cihaz ve elektronik üreticileri'),
    en: T('Embedded software engineer', 'Writes the code that runs inside the board: registers, interrupts, communication protocols and a real-time operating system.', 'Defence, automotive, home appliance, medical device and electronics makers'),
    core: ['/laboratuvar', '/moduller/arduino-temelleri', '/moduller/sensorler-ve-projeler', '/muhendislik/arm-stm32', '/muhendislik/raspberry-pi'], extra: ['/muhendislik/iot', '/muhendislik'] },
  { slug: 'drone-iha',
    tr: T('Drone / İHA mühendisi', 'Uçan sistemi baştan sona anlar: motor ve ESC seçimi, uçuş denetimi, PX4, MAVLink ve otonom görev.', 'İHA üreticileri, savunma sanayii, tarım ve harita drone\'ları, teknofest takımları'),
    en: T('Drone / UAV engineer', 'Understands a flying system end to end: motor and ESC choice, flight control, PX4, MAVLink and autonomous missions.', 'UAV makers, the defence industry, agricultural and mapping drones, competition teams'),
    core: ['/moduller/arduino-temelleri', '/moduller/sensorler-ve-projeler', '/muhendislik', '/muhendislik/robotik', '/muhendislik/drone'], extra: ['/muhendislik/opencv', '/muhendislik/arm-stm32'] },
  { slug: 'iot',
    tr: T('Nesnelerin İnterneti (IoT) geliştiricisi', 'Sensörü internete bağlar: ESP32, MQTT, bulut panosu ve veriden tahmin.', 'Akıllı bina, akıllı tarım, enerji izleme ve endüstriyel izleme firmaları'),
    en: T('Internet of Things (IoT) developer', 'Connects sensors to the internet: ESP32, MQTT, cloud dashboards and predictions from data.', 'Smart building, smart farming, energy monitoring and industrial monitoring companies'),
    core: ['/moduller/arduino-temelleri', '/moduller/sensorler-ve-projeler', '/muhendislik/iot', '/muhendislik/sensor-ml'], extra: ['/makine-ogrenmesi', '/muhendislik/raspberry-pi'] },
  { slug: 'bilgisayarli-goru',
    tr: T('Bilgisayarlı görü mühendisi', 'Kameradan anlam çıkarır: görüntü işleme, nesne algılama, kalibrasyon ve gerçek zamanlı uygulama.', 'Güvenlik ve trafik sistemleri, kalite kontrol, otonom araç, medikal görüntüleme'),
    en: T('Computer vision engineer', 'Gets meaning out of a camera: image processing, object detection, calibration and real-time applications.', 'Security and traffic systems, quality control, autonomous vehicles, medical imaging'),
    core: ['/makine-ogrenmesi', '/muhendislik/opencv', '/muhendislik/pytorch', '/robotun-gozleri/demolar'], extra: ['/muhendislik/raspberry-pi'] },
  { slug: 'makine-ogrenmesi',
    tr: T('Makine öğrenmesi mühendisi', 'Veriden model eğitir ve ölçer: klasik algoritmalardan derin öğrenmeye, sensör verisine ve cihaz üstü çıkarıma.', 'Veri ekipleri olan her sektör: finans, e-ticaret, sağlık, sanayi'),
    en: T('Machine learning engineer', 'Trains and measures models on data: from classical algorithms to deep learning, sensor data and on-device inference.', 'Every sector with a data team: finance, e-commerce, health, industry'),
    core: ['/makine-ogrenmesi', '/muhendislik/pytorch', '/muhendislik/sensor-ml'], extra: ['/muhendislik/opencv', '/muhendislik/llm'] },
  { slug: 'yapay-zeka-uygulama',
    tr: T('Yapay zekâ uygulama geliştiricisi', 'Büyük dil modeliyle gerçek ürün kurar: RAG, ajanlar, değerlendirme, güvenlik ve maliyet.', 'Yazılım şirketleri, girişimler, kurum içi yapay zekâ ekipleri'),
    en: T('AI application developer', 'Builds real products on a large language model: RAG, agents, evaluation, safety and cost.', 'Software companies, start-ups, in-house AI teams'),
    core: ['/ai-atolyesi', '/makine-ogrenmesi', '/muhendislik/llm'], extra: ['/muhendislik/pytorch'] },
  { slug: 'endustriyel-robot',
    tr: T('Endüstriyel robot / otomasyon mühendisi', 'Fabrikadaki robot kolunu programlar: kinematik, tutucu, çarpışmasız planlama, hücre güvenliği ve görüyle parça alma.', 'Otomotiv ve beyaz eşya fabrikaları, sistem entegratörleri, otomasyon firmaları'),
    en: T('Industrial robot / automation engineer', 'Programs the robot arm in a factory: kinematics, grippers, collision-free planning, cell safety and vision-guided picking.', 'Automotive and appliance factories, system integrators, automation companies'),
    core: ['/moduller/arduino-temelleri', '/moduller/sensorler-ve-projeler', '/muhendislik/robotik', '/muhendislik/robot-kolu'], extra: ['/muhendislik/opencv', '/muhendislik/arm-stm32'] },
  { slug: 'otonom-arac',
    tr: T('Otonom araç mühendisi', 'Kendi kendine giden aracı kurar: algılama, konum kestirimi, harita, yol planlama ve görüyle şerit/engel tanıma.', 'Otomotiv Ar-Ge, otonom teslimat ve tarım araçları, robotaksi girişimleri'),
    en: T('Autonomous vehicle engineer', 'Builds the vehicle that drives itself: sensing, state estimation, maps, path planning and lane/obstacle recognition with vision.', 'Automotive R&D, autonomous delivery and farm vehicles, robotaxi start-ups'),
    core: ['/moduller/sensorler-ve-projeler', '/moduller/robotik', '/muhendislik/robotik', '/muhendislik/opencv', '/muhendislik/pytorch'], extra: ['/muhendislik/raspberry-pi', '/muhendislik/drone'] },
  { slug: 'robotik-arastirmaci',
    tr: T('Robotik araştırmacısı (insansı robot)', 'En ileri uç: kinematik, denge ve yürüyüş, öğrenen robotlar; yüksek lisans ve doktora yolu.', 'Üniversite laboratuvarları, araştırma merkezleri, insansı robot girişimleri'),
    en: T('Robotics researcher (humanoids)', 'The cutting edge: kinematics, balance and walking, robots that learn; the path to a master\'s or PhD.', 'University labs, research centres, humanoid robot start-ups'),
    core: ['/makine-ogrenmesi', '/muhendislik/robotik', '/muhendislik/robot-kolu', '/muhendislik/insansi', '/muhendislik/pytorch'], extra: ['/muhendislik/drone', '/muhendislik/opencv'] },
]

export const careerOf = (slug: string): Career | undefined => CAREERS.find((c) => c.slug === slug)
export const careerHours = (c: Career): number => c.core.reduce((s, h) => s + COURSES[h].hours, 0)
export const stageOf = (href: string): StageKey => STAGES.find((s) => s.courses.includes(href))!.key
