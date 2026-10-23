import type { Metadata } from 'next'
import Link from 'next/link'
import { InstructorCard } from '@/components/egitmen/instructor-card'
import { Icon } from '@/components/shell/icons'
import { getLocale } from '@/i18n/server'
import { ENG_PARTS, LEVELS, labHref, levelText, partText, partsOfLevel } from '@/lib/muhendislik/catalog'

export const metadata: Metadata = {
  title: 'Mühendislik yolu',
  description: 'Büyükler için robotik: Hyvex Academy elektronik serisindeki 128 parça, temel bileşenden drone\'a 7 seviyede.',
}

const pad = (n: number) => String(n).padStart(2, '0')

export default async function Muhendislik() {
  const en = (await getLocale()) === 'en'
  const lang = en ? 'en' : 'tr'
  const withLab = ENG_PARTS.filter((p) => p.lab)
  return (
    <div className="page eng">
      <header className="eng-hero">
        <p className="eyebrow">{en ? 'Robotics for adults' : 'Büyükler için robotik'}</p>
        <h1>{en ? 'Engineering path: from basic components to drones' : 'Mühendislik yolu: temel bileşenden drone\'a'}</h1>
        <p className="lead">
          {en
            ? 'The parts of the Hyvex Academy electronics series, in seven levels. Every part that can be simulated on the Uno opens in the circuit lab already connected: wires attached, starter code written, just compile and run.'
            : 'Hyvex Academy elektronik serisindeki parçalar yedi seviyede. Uno\'da benzetilebilen her parça devre laboratuvarında takılı açılır: kablolar bağlı, başlangıç kodu yazılı, derleyip çalıştırman yeterli.'}
        </p>
        <dl className="eng-stats">
          <div><dt>{en ? 'Parts' : 'Parça'}</dt><dd>{ENG_PARTS.length}</dd></div>
          <div><dt>{en ? 'In the lab' : 'Laboratuvarda'}</dt><dd>{withLab.length}</dd></div>
          <div><dt>{en ? 'Levels' : 'Seviye'}</dt><dd>{LEVELS.length}</dd></div>
        </dl>
      </header>

      <section id="parcalar" className="eng-parts-sec" aria-labelledby="eng-levels">
        <h2 id="eng-levels">{en ? 'Parts in 3D, in seven levels' : 'Parçalar: 3B modeller, yedi seviye'} <span className="muted eng-count">{ENG_PARTS.length}</span></h2>
        <p className="muted eng-note">{en ? 'Open a level and pick a part: you can turn its 3D model, read how it works and open it in the lab.' : 'Bir seviye aç, parçayı seç: 3B modelini döndür, nasıl çalıştığını oku, laboratuvarda aç.'}</p>
        <ol className="eng-path">
          {LEVELS.map((l) => {
            const parts = partsOfLevel(l.n)
            const lab = parts.filter((p) => p.lab).length
            const lt = levelText(l, lang)
            return (
              <li key={l.n}>
                <Link href={`/muhendislik/seviye/${l.n}`} className="eng-level" data-testid={`eng-level-${l.n}`}>
                  <span className="eng-level-n" aria-hidden="true">{pad(l.n)}</span>
                  <span className="eng-level-body">
                    <b>{lt.title}</b>
                    <span className="eng-level-text">{lt.summary}</span>
                    <span className="eng-level-meta">{en ? `${parts.length} parts · ${lab > 0 ? `${lab} in the lab` : 'overview'}` : `${parts.length} parça · ${lab > 0 ? `${lab} laboratuvarda` : 'tanıtım'}`}</span>
                  </span>
                  <Icon name="chevronRight" size={18} className="eng-level-go" />
                </Link>
              </li>
            )
          })}
        </ol>
      </section>

      <h2 className="eng-sec-title">{en ? 'Courses' : 'Dersler'}</h2>

      <Link href="/yol-haritasi" className="eng-course" data-testid="eng-roadmap">
        <span className="eng-course-code">{en ? 'GOAL' : 'HEDEF'}</span>
        <span className="eng-level-body">
          <b>{en ? 'Roadmap: what do you want to become?' : 'Yol haritası: ne olmak istiyorsun?'}</b>
          <span className="eng-level-text">{en ? 'Robotics software, embedded, drones, IoT, vision, ML, AI apps, industrial robots, autonomous vehicles or research: pick a goal and see which courses to finish, in order.' : 'Robotik yazılım, gömülü, drone, IoT, görü, makine öğrenmesi, yapay zekâ, endüstriyel robot, otonom araç ya da araştırma: hedefini seç, hangi dersleri sırayla bitireceğini gör.'}</span>
        </span>
        <Icon name="chevronRight" size={18} className="eng-level-go" />
      </Link>

      <Link href="/muhendislik/robotik" className="eng-course" data-testid="eng-course">
        <span className="eng-course-code">ESOF 323</span>
        <span className="eng-level-body">
          <b>{en ? 'University course: Robotics' : 'Üniversite dersi: Robotik'}</b>
          <span className="eng-level-text">{en ? '14 weeks: embedded programming, sensors and filters, PID, kinematics, planning, computer vision, deep learning, ROS 2 and drones. 15 in-browser simulations, Webots and Gazebo projects.' : '14 hafta: gömülü programlama, sensör ve filtreler, PID, kinematik, planlama, bilgisayarlı görü, derin öğrenme, ROS 2 ve drone\'lar. Tarayıcıda 15 simülasyon, Webots ve Gazebo projeleri.'}</span>
        </span>
        <Icon name="chevronRight" size={18} className="eng-level-go" />
      </Link>

      <Link href="/muhendislik/drone" className="eng-course" data-testid="eng-drone">
        <span className="eng-course-code">DRONE</span>
        <span className="eng-level-body">
          <b>{en ? 'Course: Drone engineering' : 'Ders: Drone mühendisliği'}</b>
          <span className="eng-level-text">{en ? '10 units with parts, simulation and software together: frame, motor, ESC, LiPo and flight controller; thrust, PID and sensor fusion; PX4, MAVLink, MAVSDK and ROS 2. 7 in-browser simulations and a capstone mission with precision landing.' : 'Parça, simülasyon ve yazılım birlikte 10 ünite: gövde, motor, ESC, LiPo ve uçuş kontrolcüsü; itki, PID ve sensör füzyonu; PX4, MAVLink, MAVSDK ve ROS 2. Tarayıcıda 7 simülasyon ve hassas inişli bir bitirme görevi.'}</span>
        </span>
        <Icon name="chevronRight" size={18} className="eng-level-go" />
      </Link>

      <Link href="/muhendislik/llm" className="eng-course" data-testid="eng-llm">
        <span className="eng-course-code">LLM</span>
        <span className="eng-level-body">
          <b>{en ? 'Course: Large Language Model Applications' : 'Ders: Büyük Dil Modeli Uygulamaları'}</b>
          <span className="eng-level-text">{en ? '10 units, 40 hours: tokens and embeddings, prompting patterns, JSON-schema output, RAG over course notes, tool-using agents, evaluation, safety and KVKK, cost and a streaming chat front-end. 10 teaching simulations in the browser.' : '10 ünite, 40 saat: token ve gömmeler, prompt kalıpları, JSON şemalı çıktı, ders notları üzerinde RAG, araç kullanan ajanlar, değerlendirme, güvenlik ve KVKK, maliyet ve akışlı sohbet arayüzü. Tarayıcıda 10 öğretim simülasyonu.'}</span>
        </span>
        <Icon name="chevronRight" size={18} className="eng-level-go" />
      </Link>

      <Link href="/muhendislik/robot-kolu" className="eng-course" data-testid="eng-robot-kolu">
        <span className="eng-course-code">ARM</span>
        <span className="eng-level-body">
          <b>{en ? 'Course: Robot Arm Engineering' : 'Ders: Robot Kolu Mühendisliği'}</b>
          <span className="eng-level-text">{en ? '10 units, 40 hours, 16+: a virtual six-axis arm in a 3D scene, forward and inverse kinematics, joint-space and Cartesian motion, a gripper and pick-and-place, collision-free planning with RRT and simple cell safety. You program it in ArmScript, the platform\'s own language, run by an isolated interpreter in the browser. Builds on ESOF 323 week 7.' : '10 ünite, 40 saat, 16+: 3B sahnede sanal altı eksenli kol, ileri ve ters kinematik, eklem uzayı ve kartezyen hareket, tutucu ve al-bırak, RRT ile çarpışmasız planlama ve basit hücre güvenliği. Platformun kendi dili ArmScript ile programlarsın; program tarayıcıda yalıtılmış bir yorumlayıcıda koşar. ESOF 323 7. haftanın üstüne kurulur.'}</span>
        </span>
        <Icon name="chevronRight" size={18} className="eng-level-go" />
      </Link>

      <Link href="/muhendislik/opencv" className="eng-course" data-testid="eng-opencv">
        <span className="eng-course-code">OPENCV</span>
        <span className="eng-level-body">
          <b>{en ? 'Course: Image processing with OpenCV' : 'Ders: OpenCV ile görüntü işleme'}</b>
          <span className="eng-level-text">{en ? '12 units, 16+: colour spaces, histograms and thresholds, filters, edges, morphology, contours, colour tracking, perspective, feature matching, face detection and background subtraction. An in-browser playground in every unit (sample image, photo or camera) and Python cv2 code that also runs in the browser. Capstone: a document scanner.' : '12 ünite, 16+: renk uzayları, histogram ve eşikleme, filtreler, kenarlar, morfoloji, konturlar, renk takibi, perspektif, öznitelik eşleştirme, yüz algılama ve arka plan çıkarma. Her ünitede tarayıcıda oyun alanı (örnek görüntü, fotoğraf ya da kamera) ve tarayıcıda da çalışan Python cv2 kodu. Bitirme: belge tarayıcı.'}</span>
        </span>
        <Icon name="chevronRight" size={18} className="eng-level-go" />
      </Link>

      <Link href="/muhendislik/iot" className="eng-course" data-testid="eng-iot">
        <span className="eng-course-code">IOT</span>
        <span className="eng-level-body">
          <b>{en ? 'Course: Internet of Things with the ESP32' : 'Ders: ESP32 ile Nesnelerin İnterneti'}</b>
          <span className="eng-level-text">{en ? '10 units: ESP32 vs Uno, Wi-Fi, REST and JSON, MQTT with QoS, retained messages and last will, sensors to the cloud, remote actuators, a live dashboard, deep sleep, OTA, TLS and BLE. 14 in-browser simulations including a 3D smart greenhouse where MQTT packets fly between devices, and a capstone with a rules engine.' : '10 ünite: ESP32 ile Uno, Wi-Fi, REST ve JSON, QoS, kalıcı mesaj ve son vasiyetle MQTT, sensörden buluta, uzaktan eyleyici, canlı pano, derin uyku, OTA, TLS ve BLE. MQTT paketlerinin cihazlar arasında uçtuğu 3B akıllı sera dahil tarayıcıda 14 simülasyon ve kural motorlu bitirme projesi.'}</span>
        </span>
        <Icon name="chevronRight" size={18} className="eng-level-go" />
      </Link>

      <Link href="/muhendislik/raspberry-pi" className="eng-course" data-testid="eng-rpi">
        <span className="eng-course-code">RPI</span>
        <span className="eng-level-body">
          <b>{en ? 'Course: Robotics Programming with Raspberry Pi' : 'Ders: Raspberry Pi ile Robotik Programlama'}</b>
          <span className="eng-level-text">{en ? '10 units for ages 16+: Linux and the terminal, Python, GPIO, I²C/SPI/1-Wire sensors, camera and OpenCV, motors and encoders, differential drive, a Flask panel, ROS 2 and systemd. 9 in-browser simulations and a camera exploration robot capstone.' : '16 yaş üstü için 10 ünite: Linux ve terminal, Python, GPIO, I²C/SPI/1-Wire sensörler, kamera ve OpenCV, motor ve enkoder, diferansiyel sürüş, Flask paneli, ROS 2 ve systemd. Tarayıcıda 9 simülasyon ve kameralı keşif robotu bitirme projesi.'}</span>
        </span>
        <Icon name="chevronRight" size={18} className="eng-level-go" />
      </Link>

      <Link href="/muhendislik/insansi" className="eng-course" data-testid="eng-humanoid">
        <span className="eng-course-code">{en ? 'BIPED' : 'İNSANSI'}</span>
        <span className="eng-level-body">
          <b>{en ? 'Humanoid robot: kinematics, balance and walking' : 'İnsansı robot: kinematik, denge ve yürüyüş'}</b>
          <span className="eng-level-text">{en ? 'A 3D 16-servo biped: forward and two-link inverse kinematics, center of mass and support polygon, an LIPM walking gait with joint charts, servo limits, a pose program in blocks or code, Python and C++.' : '16 servolu 3B iki ayaklı robot: ileri ve iki bağlı ters kinematik, ağırlık merkezi ve destek çokgeni, eklem grafikli LIPM yürüyüşü, servo sınırları, blok ya da kodla poz programı, Python ve C++.'}</span>
        </span>
        <Icon name="chevronRight" size={18} className="eng-level-go" />
      </Link>

      <Link href="/programlar" className="eng-course" data-testid="eng-programs">
        <span className="eng-course-code">{en ? 'PATHS' : 'YOLLAR'}</span>
        <span className="eng-level-body">
          <b>{en ? 'Programmes: courses chained into a path' : 'Programlar: dersleri bir yola bağla'}</b>
          <span className="eng-level-text">{en ? 'Six multi-course programmes with total hours, prerequisites, outcomes and a capstone: Robotics Programming, Embedded Systems, IoT and Data, AI Application Development, Image Processing, Autonomous Systems.' : 'Toplam saat, ön koşul, kazanım ve bitirme projesiyle altı çok dersli program: Robotik Programlama, Gömülü Sistemler, Nesnelerin İnterneti ve Veri, Yapay Zekâ Uygulama Geliştirme, Görüntü İşleme, Otonom Sistemler.'}</span>
        </span>
        <Icon name="chevronRight" size={18} className="eng-level-go" />
      </Link>

      <Link href="/muhendislik/arm-stm32" className="eng-course" data-testid="eng-stm32">
        <span className="eng-course-code">STM32</span>
        <span className="eng-level-body">
          <b>{en ? 'Course: Embedded Programming with ARM (STM32)' : 'Ders: ARM (STM32) ile Gömülü Programlama'}</b>
          <span className="eng-level-text">{en ? '11 units for ages 16+: Cortex-M and the memory map, registers and HAL, clock tree, timers and PWM, interrupts and NVIC, UART, ADC and DMA, I²C/SPI, low power and FreeRTOS. 11 in-browser simulations and a PWM motor driver with a UART command interface.' : '16 yaş üstü için 11 ünite: Cortex-M ve bellek haritası, yazmaçlar ve HAL, saat ağacı, zamanlayıcı ve PWM, kesmeler ve NVIC, UART, ADC ve DMA, I²C/SPI, düşük güç ve FreeRTOS. Tarayıcıda 11 simülasyon ve UART komutlu PWM motor sürücü projesi.'}</span>
        </span>
        <Icon name="chevronRight" size={18} className="eng-level-go" />
      </Link>

      <Link href="/muhendislik/sensor-ml" className="eng-course" data-testid="eng-sensor-ml">
        <span className="eng-course-code">SENSÖR-ML</span>
        <span className="eng-level-body">
          <b>{en ? 'Course: Machine learning forecasting from sensor data' : 'Ders: Sensör verisinden makine öğrenmesi tahmini'}</b>
          <span className="eng-level-text">{en ? '8 units: logging a time series, cleaning outliers and gaps, the Kalman filter, embedded analysis and visualisation, feature engineering, honest evaluation, C code from trained weights and an anomaly alert. Python runs in the browser on the greenhouse dataset; a 3D greenhouse shows forecast and anomaly.' : '8 ünite: zaman serisi kaydı, aykırı değer ve boşluk temizleme, Kalman süzgeci, gömülü analiz ve görselleştirme, özellik mühendisliği, dürüst değerlendirme, eğitilmiş ağırlıklardan C kodu ve anomali uyarısı. Python, sera veri setiyle tarayıcıda çalışır; 3B serada tahmin ve anomali görünür.'}</span>
        </span>
        <Icon name="chevronRight" size={18} className="eng-level-go" />
      </Link>

      <Link href="/muhendislik/pytorch" className="eng-course" data-testid="eng-pytorch">
        <span className="eng-course-code">PYTORCH</span>
        <span className="eng-level-body">
          <b>{en ? 'Course: Deep learning with PyTorch' : 'Ders: PyTorch ile derin öğrenme'}</b>
          <span className="eng-level-text">{en ? '10 units, 16+: tensors, autograd, nn.Module, losses and optimisers, the training loop, DataLoader, CNNs, regularisation, RNN/LSTM and attention, transfer learning and deployment. A visualiser in every unit, real PyTorch code and a Colab notebook. Capstone: a digit-recognising CNN that runs in the browser.' : '10 ünite, 16+: tensörler, autograd, nn.Module, kayıp ve optimize ediciler, eğitim döngüsü, DataLoader, CNN, düzenlileştirme, RNN/LSTM ve dikkat, aktarım öğrenmesi ve dağıtım. Her ünitede görselleştirici, gerçek PyTorch kodu ve Colab defteri. Bitirme: tarayıcıda çalışan rakam tanıyan CNN.'}</span>
        </span>
        <Icon name="chevronRight" size={18} className="eng-level-go" />
      </Link>

      <InstructorCard slug="murat-arslan" labelKey="instructor.eyebrow" />

      <section className="panel" aria-labelledby="eng-lab">
        <h2 id="eng-lab" className="panel-title">{en ? 'Open in the lab right away' : 'Laboratuvarda hemen aç'}</h2>
        <p className="muted eng-note">{en ? 'Click a part: the lab opens with it wired to the Uno and with starter code.' : 'Parçaya tıkla: laboratuvar o parça Uno\'ya bağlı ve başlangıç koduyla açılır.'}</p>
        <ul className="eng-chips">
          {withLab.map((p) => (
            <li key={p.slug}><Link className="eng-chip" href={labHref(p)!}><span className="eng-chip-lv">{en ? 'L' : 'S'}{p.level}</span>{partText(p, lang).name}</Link></li>
          ))}
        </ul>
      </section>

      <p className="eng-source">{en ? 'Part information: Hyvex Academy electronics series (Asst. Prof. Dr. Murat Arslan · Hyvex Defense).' : 'Parça bilgileri: Hyvex Academy elektronik serisi (Dr. Öğr. Üyesi Murat Arslan · Hyvex Defense).'}</p>
    </div>
  )
}
