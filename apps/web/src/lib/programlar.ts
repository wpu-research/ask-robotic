// Programlar: büyükler için (16+) birden çok dersi sıralı bir yola bağlayan altı sertifika hattı. Veri burada, sayfa
// app/programlar'da. Saatler derslerin künyesinden gelir; paralel dallarda yazılan derslerin (PARALLEL_ROUTES) saati
// birleştirmede o dersin künyesiyle eşitlenir. Programlar.test.ts her bağlantının gerçekten var olduğunu sınar.

export interface ProgText { title: string; summary: string; level: string; prereq: string; outcomes: string[]; capstone: string }
export interface ProgCourse { href: string; hours: number; tr: { title: string; why: string }; en: { title: string; why: string } }
export interface Program { slug: string; tone: 'robot' | 'gomulu' | 'iot' | 'ai' | 'goru' | 'otonom'; tr: ProgText; en: ProgText; courses: ProgCourse[] }

/** Bu dalda değil, paralel dallarda yazılan ders rotaları (birleştirmeden sonra var olacaklar). */
export const PARALLEL_ROUTES = ['/muhendislik/iot', '/muhendislik/sensor-ml', '/muhendislik/opencv', '/muhendislik/pytorch', '/muhendislik/raspberry-pi', '/muhendislik/arm-stm32'] as const

const C = (href: string, hours: number, tr: [string, string], en: [string, string]): ProgCourse => ({ href, hours, tr: { title: tr[0], why: tr[1] }, en: { title: en[0], why: en[1] } })

// Ortak ders kartları (birden çok programda geçenler)
const LAB = C('/laboratuvar', 8, ['Devre laboratuvarı', 'Sanal Arduino Uno ile her devreyi kurup kodla; diğer derslerin pratik alanı.'], ['Circuit lab', 'Build and code every circuit with a virtual Arduino Uno; the practice ground for the other courses.'])
const ARDUINO = C('/moduller/arduino-temelleri', 28, ['Arduino Temelleri', 'Giriş/çıkış, analog, PWM, motorlar, zamanlama ve ekranlar; 7 hafta, her hafta bir proje.'], ['Arduino Basics', 'Input/output, analog, PWM, motors, timing and displays; 7 weeks, a project every week.'])
const SENSORS = C('/moduller/sensorler-ve-projeler', 32, ['Sensörler ve Projeler', 'Mesafe, hareket, ortam, ses, gaz ve kimlik sensörleri; 8 hafta.'], ['Sensors and Projects', 'Distance, motion, environment, sound, gas and identity sensors; 8 weeks.'])
const ROBOTIK_MOD = C('/moduller/robotik', 32, ['Robotik modülü', 'Sürüş, engel, çizgi, enkoder, PID ve denge; sanal robot arenasında.'], ['Robotics module', 'Driving, obstacles, lines, encoders, PID and balance in the virtual robot arena.'])
const ESOF = C('/muhendislik/robotik', 56, ['Üniversite dersi: Robotik (ESOF 323)', '14 hafta: gömülü programlama, PID, kinematik, planlama, görü, ROS 2; 15 simülasyon ve dönem projeleri.'], ['University course: Robotics (ESOF 323)', '14 weeks: embedded programming, PID, kinematics, planning, vision, ROS 2; 15 simulations and term projects.'])
const DRONE = C('/muhendislik/drone', 40, ['Drone mühendisliği', 'Parça, simülasyon ve yazılım; PX4, MAVLink, ROS 2; hassas inişli bitirme görevi.'], ['Drone engineering', 'Parts, simulation and software; PX4, MAVLink, ROS 2; a capstone mission with precision landing.'])
const ML = C('/makine-ogrenmesi', 60, ['Makine öğrenmesi', 'Regresyondan sinir ağına ve dikkate; algoritmalar sıfırdan, kod tarayıcıda çalışır.'], ['Machine learning', 'From regression to neural networks and attention; algorithms from scratch, code runs in the browser.'])
const LLM = C('/muhendislik/llm', 40, ['Büyük Dil Modeli Uygulamaları', 'Token, gömme, prompt, JSON çıktı, RAG, ajan, değerlendirme, güvenlik, maliyet, akışlı arayüz.'], ['Large Language Model Applications', 'Tokens, embeddings, prompts, JSON output, RAG, agents, evaluation, safety, cost, streaming front-end.'])
const DEMOS = C('/robotun-gozleri/demolar', 6, ['Gerçek hayat demoları', 'Düşme, bölge ihlali, nabız, trafik: kamerayla canlı görü uygulamaları.'], ['Real-life demos', 'Falls, zone intrusion, pulse, traffic: live vision applications with the camera.'])

export const PROGRAMS: readonly Program[] = [
  {
    slug: 'robotik-programlama', tone: 'robot',
    tr: {
      title: 'Robotik Programlama',
      summary: 'Arduino ile devre ve koddan başlayıp sensörlü projelere, oradan sanal arenada otonom robotlara giden yol.',
      level: 'Başlangıç → orta',
      prereq: 'Ön koşul yok. Temel bilgisayar kullanımı yeter; programlamayı ilk derste öğrenirsin.',
      outcomes: ['Arduino ile giriş/çıkış, PWM ve zamanlama kullanan programlar yazmak', 'Mesafe, hareket ve ortam sensörlerini okuyup süzmek', 'Motor sürücüyle robot sürmek, çizgi ve duvar izlemek', 'PID ile bir robotu kararlı biçimde denetlemek', 'Bir robot projesini gereksinimden demoya götürmek'],
      capstone: 'Sanal arenada kendi seçtiğin bir robot: çizgi izleyen, engelden kaçan ya da denge robotu; gereksinim, test ve demo videosuyla.',
    },
    en: {
      title: 'Robotics Programming',
      summary: 'From circuits and code with Arduino to sensor projects, then on to autonomous robots in a virtual arena.',
      level: 'Beginner → intermediate',
      prereq: 'No prerequisites. Basic computer skills are enough; you learn programming in the first course.',
      outcomes: ['Write Arduino programs that use input/output, PWM and timing', 'Read and filter distance, motion and environment sensors', 'Drive a robot with a motor driver and follow lines and walls', 'Control a robot stably with PID', 'Take a robot project from requirements to demo'],
      capstone: 'A robot of your choice in the virtual arena: a line follower, an obstacle avoider or a balancing robot; with requirements, tests and a demo video.',
    },
    courses: [LAB, ARDUINO, SENSORS, ROBOTIK_MOD, C('/robot-atolyesi', 6, ['Robot atölyesi', 'Görev tabanlı robot programlama ile algoritma düşüncesini pekiştir.'], ['Robot workshop', 'Strengthen algorithmic thinking with mission-based robot programming.'])],
  },
  {
    slug: 'gomulu-sistemler', tone: 'gomulu',
    tr: {
      title: 'Gömülü Sistemler',
      summary: 'Mikrodenetleyiciden ARM Cortex-M\'ye ve Linux çalıştıran tek kart bilgisayara: kayıtlar, kesmeler, haberleşme ve gerçek zamanlı düşünce.',
      level: 'Orta → ileri',
      prereq: 'Ön koşul: Arduino Temelleri ya da eşdeğer C/C++ bilgisi.',
      outcomes: ['Mikrodenetleyicide GPIO, zamanlayıcı, kesme ve ADC\'yi kayıt düzeyinde kullanmak', 'UART, I2C ve SPI ile sensör ve modül sürmek', 'STM32\'de HAL ile çevre birimi yapılandırmak', 'Raspberry Pi\'de Linux, Python ve GPIO ile uygulama yazmak', 'Gömülü yazılımı birim testleri ve donanımsız simülasyonla doğrulamak'],
      capstone: 'Bir ARM kartında sensör okuyan, PID ile motor süren ve verisini Raspberry Pi\'ye aktaran iki katmanlı bir sistem; mimari belgesi ve test raporuyla.',
    },
    en: {
      title: 'Embedded Systems',
      summary: 'From microcontrollers to ARM Cortex-M and single-board computers running Linux: registers, interrupts, communication and real-time thinking.',
      level: 'Intermediate → advanced',
      prereq: 'Prerequisite: Arduino Basics or equivalent C/C++ knowledge.',
      outcomes: ['Use GPIO, timers, interrupts and the ADC on a microcontroller at register level', 'Drive sensors and modules over UART, I2C and SPI', 'Configure peripherals on an STM32 with HAL', 'Write applications on a Raspberry Pi with Linux, Python and GPIO', 'Verify embedded software with unit tests and hardware-free simulation'],
      capstone: 'A two-layer system that reads sensors on an ARM board, drives a motor with PID and passes its data to a Raspberry Pi; with an architecture document and a test report.',
    },
    courses: [ARDUINO, C('/muhendislik/arm-stm32', 47, ['ARM ve STM32 ile gömülü programlama', 'Cortex-M mimarisi, HAL, kesmeler, DMA ve haberleşme; kartsız STM32 çalışması.'], ['Embedded programming with ARM and STM32', 'Cortex-M architecture, HAL, interrupts, DMA and communication; STM32 work without a board.']),
      C('/muhendislik/raspberry-pi', 45, ['Raspberry Pi ile robotik', 'Linux, Python, GPIO ve kamera; kart olmadan pratik.'], ['Robotics with Raspberry Pi', 'Linux, Python, GPIO and the camera; practice without a board.']), ESOF],
  },
  {
    slug: 'iot-ve-veri', tone: 'iot',
    tr: {
      title: 'Nesnelerin İnterneti ve Veri',
      summary: 'Sensörden buluta ve tahmine: ESP32 ile bağlı cihazlar, MQTT, panolar ve sensör verisinden makine öğrenmesi.',
      level: 'Orta',
      prereq: 'Ön koşul: Arduino Temelleri. Temel Python ML dersinde öğretilir.',
      outcomes: ['ESP32 ile Wi-Fi\'ye bağlanan ve MQTT ile veri yayan cihaz yazmak', 'Sensör verisini toplayıp temizlemek ve görselleştirmek', 'Sensör verisinden sınıflandırma ve regresyon modeli eğitmek', 'Modeli küçültüp cihaz üstünde çalıştırmanın sınırlarını tartmak', 'Bağlı bir cihazda güvenlik ve gizlilik risklerini değerlendirmek'],
      capstone: 'Akıllı oda: sıcaklık, nem ve hareket sensörlerinden veri toplayan, bulut panosunda gösteren ve doluluk tahmini yapan bir sistem.',
    },
    en: {
      title: 'Internet of Things and Data',
      summary: 'From sensor to cloud to prediction: connected devices with ESP32, MQTT, dashboards and machine learning on sensor data.',
      level: 'Intermediate',
      prereq: 'Prerequisite: Arduino Basics. Basic Python is taught in the ML course.',
      outcomes: ['Write a device that connects to Wi-Fi with ESP32 and publishes data over MQTT', 'Collect, clean and visualise sensor data', 'Train classification and regression models on sensor data', 'Weigh the limits of shrinking a model and running it on the device', 'Assess security and privacy risks in a connected device'],
      capstone: 'Smart room: a system that collects data from temperature, humidity and motion sensors, shows it on a cloud dashboard and predicts occupancy.',
    },
    courses: [ARDUINO, SENSORS, C('/muhendislik/iot', 40, ['ESP32 ile Nesnelerin İnterneti', 'Wi-Fi, MQTT, bulut panosu ve OTA güncelleme; sanal ESP32 ile.'], ['Internet of Things with ESP32', 'Wi-Fi, MQTT, a cloud dashboard and OTA updates; with a virtual ESP32.']),
      C('/muhendislik/sensor-ml', 32, ['Sensör verisinden makine öğrenmesi', 'Zaman serisi öznitelikleri, sınıflandırma ve cihaz üstü çıkarım.'], ['Machine learning on sensor data', 'Time-series features, classification and on-device inference.']), ML],
  },
  {
    slug: 'yapay-zeka-uygulama', tone: 'ai',
    tr: {
      title: 'Yapay Zekâ Uygulama Geliştirme',
      summary: 'Algoritmaları sıfırdan anlamaktan derin öğrenmeye ve büyük dil modeliyle gerçek uygulama kurmaya: RAG, ajanlar, değerlendirme ve güvenlik.',
      level: 'Orta → ileri',
      prereq: 'Ön koşul: temel Python (fonksiyon, liste, sözlük) ve lise matematiği.',
      outcomes: ['Temel makine öğrenmesi algoritmalarını sıfırdan yazmak ve değerlendirmek', 'PyTorch ile model eğitmek, transfer öğrenme yapmak', 'Bir dil modeli uygulamasında prompt, JSON çıktı ve RAG kullanmak', 'Araç kullanan bir ajanı sınırlarıyla tasarlamak', 'Uygulamayı değerlendirme kümesi, güvenlik ve maliyet ölçümüyle yayına hazırlamak'],
      capstone: 'Ders notlarından soru-cevap asistanı: kaynak gösteren RAG, şemalı çıktı, değerlendirme kümesi, kişisel veri maskeleme ve akışlı web arayüzü.',
    },
    en: {
      title: 'AI Application Development',
      summary: 'From understanding algorithms from scratch to deep learning and building real applications on a large language model: RAG, agents, evaluation and safety.',
      level: 'Intermediate → advanced',
      prereq: 'Prerequisite: basic Python (functions, lists, dicts) and high-school maths.',
      outcomes: ['Write and evaluate basic machine learning algorithms from scratch', 'Train models and do transfer learning with PyTorch', 'Use prompts, JSON output and RAG in a language model application', 'Design a tool-using agent together with its limits', 'Prepare the application for release with an evaluation set, security and cost measurements'],
      capstone: 'A question-answering assistant over course notes: RAG with sources, schema output, an evaluation set, personal data masking and a streaming web front-end.',
    },
    courses: [C('/ai-atolyesi', 6, ['AI atölyesi', 'Token, prompt, RAG ve ajan araçlarıyla ısınma.'], ['AI workshop', 'A warm-up with token, prompt, RAG and agent tools.']), ML,
      C('/muhendislik/pytorch', 40, ['PyTorch ile derin öğrenme', 'Tensörler, eğitim döngüsü, CNN, transfer öğrenme ve dağıtım.'], ['Deep learning with PyTorch', 'Tensors, the training loop, CNNs, transfer learning and deployment.']), LLM],
  },
  {
    slug: 'goruntu-isleme', tone: 'goru',
    tr: {
      title: 'Görüntü İşleme',
      summary: 'Pikselden nesne tanımaya: OpenCV ile klasik görüntü işleme, derin öğrenmeyle tanıma ve kamerayla çalışan gerçek uygulamalar.',
      level: 'Orta → ileri',
      prereq: 'Ön koşul: temel Python. Makine öğrenmesi dersinin ilk bölümleri yardımcıdır.',
      outcomes: ['Görüntüyü renk uzayları, süzgeçler ve eşikleme ile işlemek', 'Kenar, kontur ve öznitelik çıkarıp nesne bulmak', 'Kamera kalibrasyonu ve ArUco ile poz kestirmek', 'Evrişimli ağlarla sınıflandırma ve nesne algılama yapmak', 'Gerçek zamanlı bir görü uygulamasında gizlilik ve hata oranını değerlendirmek'],
      capstone: 'Kamerayla çalışan bir güvenlik uygulaması: bölge ihlali ya da düşme algılama; doğruluk, gecikme ve gizlilik raporuyla.',
    },
    en: {
      title: 'Image Processing',
      summary: 'From pixels to object recognition: classical image processing with OpenCV, recognition with deep learning and real applications that run on the camera.',
      level: 'Intermediate → advanced',
      prereq: 'Prerequisite: basic Python. The first parts of the machine learning course help.',
      outcomes: ['Process images with colour spaces, filters and thresholding', 'Extract edges, contours and features to find objects', 'Calibrate a camera and estimate pose with ArUco', 'Classify and detect objects with convolutional networks', 'Assess privacy and error rates in a real-time vision application'],
      capstone: 'A safety application that runs on the camera: zone intrusion or fall detection; with an accuracy, latency and privacy report.',
    },
    courses: [C('/muhendislik/opencv', 36, ['OpenCV ile görüntü işleme', 'Süzgeçler, kontur, öznitelik, kalibrasyon ve ArUco; tarayıcıda canlı.'], ['Image processing with OpenCV', 'Filters, contours, features, calibration and ArUco; live in the browser.']), DEMOS, ML,
      C('/muhendislik/pytorch', 40, ['PyTorch ile derin öğrenme', 'CNN, transfer öğrenme ve nesne algılama.'], ['Deep learning with PyTorch', 'CNNs, transfer learning and object detection.'])],
  },
  {
    slug: 'otonom-sistemler', tone: 'otonom',
    tr: {
      title: 'Otonom Sistemler',
      summary: 'Algıla, kestir, planla, denetle: üniversite düzeyi robotik, drone mühendisliği ve ROS 2 ile simülasyonda otonom görevler.',
      level: 'İleri',
      prereq: 'Ön koşul: temel Python ya da C++, lise fiziği. Robotik Programlama ya da Gömülü Sistemler programı önerilir.',
      outcomes: ['Sensör füzyonu ve durum kestirimi (tamamlayıcı süzgeç, Kalman) uygulamak', 'PID ve kinematikle bir robot ya da drone denetlemek', 'Harita, yol planlama ve görev durum makinesi kurmak', 'ROS 2 ve PX4 SITL ile simülasyonda uçtan uca görev çalıştırmak', 'Otonom bir sistemi gereksinim, mimari, SIL testi ve failsafe senaryolarıyla doğrulamak'],
      capstone: 'Simüle otonom görev: kalkış, ara noktalar ve ArUco ile hassas iniş ya da yer robotuyla harita çıkarıp hedefe gitme; SIL test kanıtlarıyla.',
    },
    en: {
      title: 'Autonomous Systems',
      summary: 'Sense, estimate, plan, control: university-level robotics, drone engineering and autonomous missions in simulation with ROS 2.',
      level: 'Advanced',
      prereq: 'Prerequisite: basic Python or C++, high-school physics. The Robotics Programming or Embedded Systems programme is recommended.',
      outcomes: ['Apply sensor fusion and state estimation (complementary filter, Kalman)', 'Control a robot or drone with PID and kinematics', 'Build maps, path planning and a mission state machine', 'Run an end-to-end mission in simulation with ROS 2 and PX4 SITL', 'Verify an autonomous system with requirements, architecture, SIL tests and failsafe scenarios'],
      capstone: 'A simulated autonomous mission: take-off, waypoints and precision landing on ArUco, or mapping with a ground robot and driving to a goal; with SIL test evidence.',
    },
    courses: [ESOF, DRONE, C('/muhendislik/opencv', 36, ['OpenCV ile görüntü işleme', 'Hassas iniş ve hedef takibi için görü temeli.'], ['Image processing with OpenCV', 'The vision basis for precision landing and target tracking.']), C('/muhendislik', 10, ['Mühendislik yolu: 128 gerçek parça', 'Sensör, sürücü ve güç parçalarını seviyelerle tanı; Hyvex kartları.'], ['Engineering path: 128 real parts', 'Get to know sensor, driver and power parts by level; Hyvex cards.'])],
  },
]

export const programOf = (slug: string): Program | undefined => PROGRAMS.find((p) => p.slug === slug)
export const totalHours = (p: Program): number => p.courses.reduce((s, c) => s + c.hours, 0)
