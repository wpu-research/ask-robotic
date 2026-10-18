// Drone dersinin PARÇA ayağı: bir multirotoru oluşturan 15 bileşen (TR/EN). Sayılar tipik aralıklardır, üretici
// tablosu her zaman önce gelir. hyvex: Mühendislik yolundaki karşılık gelen Hyvex parçaları (3B model ve laboratuvar kiti oradadır).
import type { DroneSimId } from '@/components/drone/sim-meta'

export type DronePartKey = 'frame' | 'motor' | 'esc' | 'prop' | 'lipo' | 'pdb' | 'fc' | 'imu' | 'baro' | 'mag' | 'gps' | 'rc' | 'telemetry' | 'camera' | 'range'
export type DroneGroup = 'itki' | 'guc' | 'aviyonik' | 'sensor' | 'haberlesme'
export interface DronePartText { name: string; role: string; body: string; specs: string[]; choose: string }
export interface DronePart { key: DronePartKey; group: DroneGroup; hyvex: string[]; sim?: DroneSimId; tr: DronePartText; en: DronePartText }

export const DRONE_GROUPS: Record<DroneGroup, { tr: string; en: string }> = {
  itki: { tr: 'Gövde ve itki', en: 'Airframe and propulsion' },
  guc: { tr: 'Güç', en: 'Power' },
  aviyonik: { tr: 'Uçuş kontrolcüsü', en: 'Flight controller' },
  sensor: { tr: 'Sensörler', en: 'Sensors' },
  haberlesme: { tr: 'Haberleşme ve görüntü', en: 'Links and video' },
}

export const DRONE_PARTS: DronePart[] = [
  {
    key: 'frame', group: 'itki', hyvex: [], sim: 'twr',
    tr: {
      name: 'Gövde (frame)', role: 'Motorları taşır, titreşimi ve çarpmayı karşılar, elektroniğe yer açar.',
      body: 'Boyut sınıfı motor eksenleri arasındaki çapraz mesafeyle (dingil açıklığı, mm) ve sığan en büyük pervaneyle anılır. X gövdede kollar merkeze simetriktir, yuvarlanma ve yunuslama eylemsizliği yakındır. H gövdede kollar iki yan kirişe bağlanır: gövdede daha çok yer vardır ama eksenler arası eylemsizlik farklıdır, ayar ayrı yapılır. Karbon fiber hafif ve serttir, iletkendir: kabloyu keskin kenardan koru.',
      specs: ['Minik (tiny whoop): 65–75 mm, 31–40 mm pervane', '3": ~130–150 mm', '5" FPV: 210–250 mm, en yaygın sınıf', '7" uzun menzil: ~300 mm', 'X500 / F450 sınıfı: 450–500 mm, 10" pervane', 'Kol kalınlığı 5" için 5–6 mm karbon'],
      choose: 'Önce pervaneyi seç, gövde ona göre gelir. Kamera ya da yük taşıyacaksan H veya geniş gövde; akrobasi için gerçek X (true-X) simetrisi.',
    },
    en: {
      name: 'Frame', role: 'Carries the motors, absorbs vibration and crashes, makes room for the electronics.',
      body: 'Size classes are named by the diagonal distance between motor shafts (wheelbase, mm) and the largest propeller that fits. On an X frame the arms are symmetric about the centre, so roll and pitch inertia are close. On an H frame the arms attach to two side rails: more room in the body, but different inertia per axis, so each axis is tuned separately. Carbon fibre is light and stiff and conducts electricity: protect wires from sharp edges.',
      specs: ['Tiny whoop: 65–75 mm, 31–40 mm props', '3": ~130–150 mm', '5" FPV: 210–250 mm, the most common class', '7" long range: ~300 mm', 'X500 / F450 class: 450–500 mm, 10" props', 'Arm thickness 5–6 mm carbon for 5"'],
      choose: 'Choose the propeller first; the frame follows. For a camera or payload use an H or wide frame; for acrobatics the symmetry of a true-X.',
    },
  },
  {
    key: 'motor', group: 'itki', hyvex: ['bldc-fircasiz-motor'], sim: 'twr',
    tr: {
      name: 'Fırçasız motor (BLDC)', role: 'Pervaneyi döndürür; itkiyi ve dolayısıyla tüm uçuşu belirler.',
      body: 'Drone motorları dış rotorludur (outrunner): sargılar sabit statorda, mıknatıslar dönen çanın içindedir. "2207" 22 mm stator çapı ve 7 mm stator yüksekliği demektir; stator hacmi tork kapasitesinin kaba ölçüsüdür. KV, yüksüz durumda volt başına devirdir (rpm/V): 1950 KV bir motor 6S\'te (22,2 V) yüksüz yaklaşık 43 000 rpm döner. Yüksek KV küçük pervane ve düşük gerilim, düşük KV büyük pervane ve yüksek gerilimle eşleşir. Tipik kutup düzeni 12N14P (12 sargı oluğu, 14 mıknatıs).',
      specs: ['5" 6S: 1700–1950 KV, 2207/2306', '5" 4S: 2300–2600 KV', '7" 6S: ~1300 KV, 2806.5', 'X500 4S: 2216 920 KV, 10" pervane', 'İtki tablosu: gaz – akım – itki (gf) – verim (gf/W)'],
      choose: 'Motoru KV\'ye göre değil, hedef pervane ve hücre sayısındaki itki tablosuna göre seç: askıda kalma noktasında verim (gf/W) ve tam gazda akım belirleyicidir.',
    },
    en: {
      name: 'Brushless motor (BLDC)', role: 'Spins the propeller; sets the thrust and therefore the whole flight.',
      body: 'Drone motors are outrunners: the windings sit on the fixed stator and the magnets inside the spinning bell. "2207" means a 22 mm stator diameter and 7 mm stator height; stator volume is a rough measure of torque capacity. KV is the no-load speed per volt (rpm/V): a 1950 KV motor on 6S (22.2 V) spins at about 43,000 rpm unloaded. High KV pairs with small props and low voltage, low KV with large props and high voltage. A typical pole layout is 12N14P (12 winding slots, 14 magnets).',
      specs: ['5" 6S: 1700–1950 KV, 2207/2306', '5" 4S: 2300–2600 KV', '7" 6S: ~1300 KV, 2806.5', 'X500 4S: 2216 920 KV, 10" prop', 'Thrust table: throttle – current – thrust (gf) – efficiency (gf/W)'],
      choose: 'Choose a motor from the thrust table at your target propeller and cell count, not from KV alone: efficiency (gf/W) at the hover point and current at full throttle decide.',
    },
  },
  {
    key: 'esc', group: 'itki', hyvex: ['esc-blheli-s-32'], sim: 'mixer',
    tr: {
      name: 'ESC (elektronik hız kontrolcüsü)', role: 'Uçuş kontrolcüsünün komutunu üç fazlı motor akımına çevirir.',
      body: 'ESC, altı MOSFET\'ten oluşan üç fazlı bir köprüdür; rotorun konumunu sargıdaki geri EMK\'dan sezerek fazları sırayla anahtarlar. Komut eskiden 1000–2000 µs PWM ile gelirdi; bugün sayısal DShot (DShot300/600) yaygındır: değer 48–2047 arası, CRC ile korunur, kalibrasyon gerekmez. Çift yönlü DShot motor devrini geri yollar; Betaflight ve PX4 bununla devir tabanlı çentik süzgeci (RPM filter) kurar. Yazılımlar: BLHeli_S (8 bit), Bluejay, AM32; BLHeli_32 geliştirmesi 2024\'te durdu.',
      specs: ['5" için 35–60 A sürekli, 4\'ü 1 arada (4-in-1) kart yaygın', 'Protokol: PWM, OneShot125, DShot150/300/600', 'Çift yönlü DShot: devir telemetrisi', 'Giriş: 2S–6S (bazıları 8S)'],
      choose: 'Sürekli akım değeri, itki tablosundaki tam gaz akımının en az %20 üstünde olmalı. Uzun kollu büyük gövdede tekli ESC\'ler, FPV\'de 4-in-1.',
    },
    en: {
      name: 'ESC (electronic speed controller)', role: 'Turns the flight controller\'s command into three-phase motor current.',
      body: 'An ESC is a three-phase bridge of six MOSFETs; it senses rotor position from the back-EMF in the idle winding and switches the phases in sequence. Commands used to arrive as 1000–2000 µs PWM; today digital DShot (DShot300/600) is common: values 48–2047, protected by a CRC, no calibration needed. Bidirectional DShot sends motor RPM back; Betaflight and PX4 use it for RPM-based notch filtering. Firmware: BLHeli_S (8-bit), Bluejay, AM32; BLHeli_32 development stopped in 2024.',
      specs: ['35–60 A continuous for 5", 4-in-1 boards common', 'Protocol: PWM, OneShot125, DShot150/300/600', 'Bidirectional DShot: RPM telemetry', 'Input: 2S–6S (some 8S)'],
      choose: 'The continuous rating should be at least 20% above the full-throttle current in the thrust table. Single ESCs on large frames with long arms, 4-in-1 on FPV.',
    },
  },
  {
    key: 'prop', group: 'itki', hyvex: [], sim: 'flight',
    tr: {
      name: 'Pervane', role: 'Motor torkunu itkiye çevirir; verimin en büyük kaynağıdır.',
      body: '"5×4,3×3" 5 inç çap, 4,3 inç hatve (bir turda kuramsal ilerleme) ve 3 kanat demektir. İtki yaklaşık ρ·n²·D⁴, güç ρ·n³·D⁵ ile büyür: büyük ve yavaş dönen pervane aynı itkiyi daha az güçle verir (momentum teorisi: disk alanı büyüdükçe ideal güç düşer). Bu yüzden uzun uçuşlu drone\'larda büyük pervane, çevik FPV\'de küçük ve yüksek hatveli pervane kullanılır. Yarısı saat yönünde (CW), yarısı tersine (CCW) döner; "props out" ya da "props in" yönü yazılımda seçilir.',
      specs: ['Çap: 31 mm – 30 inç', 'Hatve büyüdükçe hız ve akım artar', '2 kanat verimli, 3 kanat daha çok tutuş ve gürültüsüz uçuş', 'Malzeme: polikarbonat (FPV), karbon (büyük)'],
      choose: 'Gövdeye sığan en büyük çap çoğu zaman en verimlisidir. Pervane değişince motor akımını itki tablosundan yeniden kontrol et.',
    },
    en: {
      name: 'Propeller', role: 'Turns motor torque into thrust; the biggest single factor in efficiency.',
      body: '"5×4.3×3" means 5 inch diameter, 4.3 inch pitch (theoretical advance per revolution) and 3 blades. Thrust grows roughly with ρ·n²·D⁴ and power with ρ·n³·D⁵: a large, slowly turning propeller gives the same thrust for less power (momentum theory: ideal power falls as disk area grows). That is why endurance drones use large props and agile FPV drones small, high-pitch ones. Half spin clockwise (CW), half counter-clockwise (CCW); "props out" or "props in" is selected in software.',
      specs: ['Diameter: 31 mm – 30 inch', 'Higher pitch: more speed and current', '2 blades efficient, 3 blades more grip and smoother flight', 'Material: polycarbonate (FPV), carbon (large)'],
      choose: 'The largest diameter that fits the frame is usually the most efficient. When you change props, check motor current again in the thrust table.',
    },
  },
  {
    key: 'lipo', group: 'guc', hyvex: ['lipo-batarya', 'max17048-max17043-yakit-gostergesi'], sim: 'flight',
    tr: {
      name: 'LiPo batarya', role: 'Uçuşun enerji deposu; uçuş süresini ve tepe gücünü belirler.',
      body: 'Hücre anma gerilimi 3,7 V, dolu 4,2 V (HV hücrede 4,35 V), depolama 3,8 V. "6S 1300 mAh 100C": altı seri hücre (22,2 V), 1,3 Ah kapasite; C oranı × Ah kuramsal sürekli akımdır (100 × 1,3 = 130 A), ama üretici değerleri çoğu zaman şişirilmiştir. Yük altında hücre başına 3,3–3,5 V\'un altına inmek ömrü kısaltır; uçuşu yaklaşık %20 kapasite kalınca bitir. Şarj her zaman dengeleyici (balance) şarj cihazıyla ve 1C\'yle; şişmiş, delinmiş paket kullanılmaz, ateşe dayanıklı torbada saklanır.',
      specs: ['Hücre: 3,7 V anma, 4,2 V dolu, 3,8 V depolama', '5" FPV: 6S 1100–1500 mAh', 'X500: 4S 4000–5000 mAh', 'Özgül enerji: drone paketlerinde ~120–150 Wh/kg', 'Li-ion 18650/21700 paketler: daha yüksek enerji, düşük akım (uzun menzil)'],
      choose: 'Kapasiteyi uçuş süresi simülasyonuyla seç: bir noktadan sonra eklenen kapasite kendi kütlesini taşımaya gider. Tepe akımı C × Ah sınırının altında kalmalı.',
    },
    en: {
      name: 'LiPo battery', role: 'The energy store of the flight; sets flight time and peak power.',
      body: 'A cell is 3.7 V nominal, 4.2 V full (4.35 V for HV cells), 3.8 V for storage. "6S 1300 mAh 100C": six cells in series (22.2 V), 1.3 Ah; C rating × Ah is the theoretical continuous current (100 × 1.3 = 130 A), but manufacturer figures are often inflated. Going below 3.3–3.5 V per cell under load shortens life; land with about 20% capacity left. Always charge with a balance charger at 1C; never use a swollen or punctured pack, store in a fire-resistant bag.',
      specs: ['Cell: 3.7 V nominal, 4.2 V full, 3.8 V storage', '5" FPV: 6S 1100–1500 mAh', 'X500: 4S 4000–5000 mAh', 'Specific energy: ~120–150 Wh/kg for drone packs', 'Li-ion 18650/21700 packs: more energy, lower current (long range)'],
      choose: 'Pick the capacity with the flight-time simulation: past a point, added capacity only carries its own weight. Peak current must stay below the C × Ah limit.',
    },
  },
  {
    key: 'pdb', group: 'guc', hyvex: ['mp1584-mini-360-buck', 'lm2596-buck', 'pesd5v0s1ub-tvs-diyot'],
    tr: {
      name: 'Güç dağıtım kartı (PDB) ve BEC', role: 'Batarya akımını ESC\'lere dağıtır, elektroniğe temiz 5 V / 9 V / 12 V üretir.',
      body: 'PDB kalın bakır yollarla bataryayı dört ESC\'ye bağlar; çoğu zaman bir akım sensörü (şönt) ve gerilim bölücü taşır. BEC (battery eliminator circuit), batarya gerilimini uçuş kontrolcüsü, alıcı ve kamera için düşüren anahtarlamalı bir buck dönüştürücüdür. Pixhawk sınıfı kartlarda bu iş "güç modülüyle" yapılır: kart beslemesi ve analog ya da I²C (INA226 vb.) gerilim/akım ölçümü. Motor anahtarlaması beslemeye sivri gerilim darbeleri bindirir: ESC girişine düşük ESR\'li büyük bir kondansatör (ör. 6S\'te 35 V 1000 µF) ve hassas hatlara TVS koruması konur.',
      specs: ['BEC çıkışı: 5 V 2–3 A (FC, alıcı), 9–12 V (analog VTX/kamera)', 'Akım sensörü ölçek katsayısı uçuş kontrolcüsünde ayarlanır', 'Pixhawk güç modülü: 5,3 V, ~3 A, V/I ölçümü', 'ESC girişine düşük ESR kondansatör'],
      choose: 'Dijital video sistemleri (DJI, Walksnail) ayrı 9–12 V ister; BEC akımını tüm yüklerin toplamının %50 üstünde seç.',
    },
    en: {
      name: 'Power distribution board (PDB) and BEC', role: 'Distributes battery current to the ESCs and makes clean 5 V / 9 V / 12 V for the electronics.',
      body: 'A PDB connects the battery to the four ESCs through thick copper traces, often with a current sensor (shunt) and a voltage divider. A BEC (battery eliminator circuit) is a switching buck converter that steps battery voltage down for the flight controller, receiver and camera. On Pixhawk-class boards a "power module" does this: board supply plus analog or I²C (INA226 etc.) voltage/current measurement. Motor switching puts sharp voltage spikes on the supply: a large low-ESR capacitor at the ESC input (e.g. 35 V 1000 µF on 6S) and TVS protection on sensitive lines.',
      specs: ['BEC output: 5 V 2–3 A (FC, receiver), 9–12 V (analog VTX/camera)', 'The current sensor scale is set in the flight controller', 'Pixhawk power module: 5.3 V, ~3 A, V/I measurement', 'Low-ESR capacitor at the ESC input'],
      choose: 'Digital video systems (DJI, Walksnail) need their own 9–12 V; size the BEC current 50% above the sum of all loads.',
    },
  },
  {
    key: 'fc', group: 'aviyonik', hyvex: ['stm32', 'st-link-j-link-debugger'], sim: 'roll',
    tr: {
      name: 'Uçuş kontrolcüsü (FC)', role: 'Sensörleri okur, durumu kestirir, kontrol döngülerini ve karıştırıcıyı çalıştırır.',
      body: 'Kalbinde bir STM32 mikrodenetleyici vardır. F4 (STM32F405, Cortex-M4F, 168 MHz) Betaflight için hâlâ yeterlidir; F7 (F722, Cortex-M7, 216 MHz) daha çok UART ve işlem payı verir; H7 (H743, Cortex-M7, 480 MHz, çift duyarlıklı FPU) PX4/ArduPilot\'un EKF\'si ve çok sensörlü sistemler için tercih edilir (Pixhawk 6C/6X H7 kullanır). Kartta IMU, barometre, çoğu zaman OSD çipi ve SD kart bulunur; GPS, alıcı, telemetri ve ESC UART/DShot ile bağlanır. Yazılım: yarış/FPV için Betaflight, otonom görev için PX4 ya da ArduPilot.',
      specs: ['F4: 168 MHz, 1 MB flash (F411: 512 KB, daha az UART)', 'F7: 216 MHz, 6–8 UART', 'H7: 480 MHz, çift FPU, PX4/ArduPilot için önerilen', 'Montaj: 30,5×30,5 / 20×20 mm, titreşim sönümleyici', 'Hata ayıklama: SWD (ST-Link / J-Link)'],
      choose: 'Otonom görev, GPS ve ROS 2 bağlantısı istiyorsan PX4/ArduPilot destekli bir H7 kart (Pixhawk standardı); yalnız manuel FPV için F4/F7 Betaflight kartı.',
    },
    en: {
      name: 'Flight controller (FC)', role: 'Reads sensors, estimates state, runs the control loops and the mixer.',
      body: 'At its heart is an STM32 microcontroller. F4 (STM32F405, Cortex-M4F, 168 MHz) is still enough for Betaflight; F7 (F722, Cortex-M7, 216 MHz) gives more UARTs and headroom; H7 (H743, Cortex-M7, 480 MHz, double-precision FPU) is preferred for the EKF of PX4/ArduPilot and multi-sensor systems (Pixhawk 6C/6X use an H7). The board carries the IMU, barometer, often an OSD chip and an SD card; GPS, receiver, telemetry and ESCs connect over UART/DShot. Firmware: Betaflight for racing/FPV, PX4 or ArduPilot for autonomous missions.',
      specs: ['F4: 168 MHz, 1 MB flash (F411: 512 KB, fewer UARTs)', 'F7: 216 MHz, 6–8 UARTs', 'H7: 480 MHz, double FPU, recommended for PX4/ArduPilot', 'Mounting: 30.5×30.5 / 20×20 mm, soft-mounted', 'Debugging: SWD (ST-Link / J-Link)'],
      choose: 'For autonomous missions, GPS and a ROS 2 link, an H7 board supported by PX4/ArduPilot (Pixhawk standard); for manual FPV only, an F4/F7 Betaflight board.',
    },
  },
  {
    key: 'imu', group: 'sensor', hyvex: ['mpu6050', 'bmi270', 'icm-20948', 'bno085'], sim: 'fusion',
    tr: {
      name: 'IMU (jiroskop + ivmeölçer)', role: 'Açısal hızı ve özgül kuvveti ölçer; iç kontrol döngüsünün tek gerçek sensörü.',
      body: 'MEMS jiroskop üç eksende açısal hızı (°/s), ivmeölçer özgül kuvveti (yerçekimi dahil, m/s²) ölçer. Hız döngüsü doğrudan jiroskopla kapanır ve 1–8 kHz örnekleme ister; bu yüzden IMU SPI ile bağlanır (I²C yavaştır). Jiroskobun sapması (bias) sıcaklıkla değişir ve entegre edilince açı hatasına dönüşür; ivmeölçer uzun vadede yerçekimi yönünü verir ama motor titreşimi ve manevra ivmesiyle bozulur. İkisini birleştiren tamamlayıcı süzgeç ya da EKF bu dersin 4. ünitesidir. MPU6050 öğrenmek içindir; uçuş kartlarında ICM-42688-P, BMI270 gibi düşük gürültülü IMU\'lar kullanılır.',
      specs: ['Jiroskop: ±2000 °/s, gürültü ~0,003–0,005 °/s/√Hz', 'İvmeölçer: ±16 g', 'Arayüz: SPI (uçuş), I²C (öğrenme)', 'Örnekleme: 1–8 kHz (ICM-42688: 32 kHz\'e kadar)', 'Sık kullanılanlar: MPU6000, ICM-42688-P, BMI270'],
      choose: 'Uçuş kartı seçerken IMU modeline ve titreşim sönümlemesine bak; harici IMU gerekmez. Öğrenmek için laboratuvardaki MPU6050 kiti yeterlidir.',
    },
    en: {
      name: 'IMU (gyro + accelerometer)', role: 'Measures angular rate and specific force; the only real sensor of the inner control loop.',
      body: 'A MEMS gyro measures angular rate on three axes (°/s), an accelerometer measures specific force (including gravity, m/s²). The rate loop closes directly on the gyro and needs 1–8 kHz sampling, so the IMU is wired over SPI (I²C is too slow). Gyro bias drifts with temperature and turns into angle error when integrated; the accelerometer gives the direction of gravity in the long run but is corrupted by motor vibration and manoeuvre acceleration. The complementary filter or EKF that combines them is unit 4 of this course. The MPU6050 is for learning; flight boards use low-noise IMUs such as the ICM-42688-P and BMI270.',
      specs: ['Gyro: ±2000 °/s, noise ~0.003–0.005 °/s/√Hz', 'Accelerometer: ±16 g', 'Interface: SPI (flight), I²C (learning)', 'Sampling: 1–8 kHz (ICM-42688: up to 32 kHz)', 'Common parts: MPU6000, ICM-42688-P, BMI270'],
      choose: 'When choosing a flight board, look at the IMU model and soft mounting; no external IMU is needed. For learning, the MPU6050 kit in the lab is enough.',
    },
  },
  {
    key: 'baro', group: 'sensor', hyvex: ['bme280'], sim: 'alt',
    tr: {
      name: 'Barometre', role: 'Hava basıncından irtifa değişimini ölçer; irtifa tutmanın temel sensörü.',
      body: 'Deniz seviyesine yakın yerlerde basınç her 8–9 metrede yaklaşık 1 hPa düşer; iyi bir barometre (MS5611, DPS310, BMP388) birkaç santimetrelik değişimi çözebilir. Mutlak irtifa değil, kalkış noktasına göre bağıl irtifa kullanılır; hava durumu basıncı gün içinde değiştirir. Pervane rüzgârı ve güneş ışığı ölçümü bozar: sensör ince açık hücreli süngerle örtülür. EKF barometreyi ivmeölçerle birleştirir; alçakta mesafe sensörü (LiDAR) daha doğrudur.',
      specs: ['Çözünürlük: ~0,01 hPa ≈ 10 cm', 'Arayüz: I²C / SPI', 'Örnek: BMP280, BME280, DPS310, MS5611', 'Sünger örtü: pervane rüzgârına ve ışığa karşı'],
      choose: 'Uçuş kartındaki barometre yeterlidir; önemli olan örtülmesi ve EKF\'de doğru gürültü ayarıdır.',
    },
    en: {
      name: 'Barometer', role: 'Measures altitude change from air pressure; the core sensor for altitude hold.',
      body: 'Near sea level, pressure drops by about 1 hPa every 8–9 metres; a good barometer (MS5611, DPS310, BMP388) resolves a few centimetres of change. Relative altitude from the take-off point is used, not absolute altitude; weather changes pressure during the day. Propeller wash and sunlight corrupt the reading: cover the sensor with thin open-cell foam. The EKF fuses the barometer with the accelerometer; close to the ground a range sensor (LiDAR) is more accurate.',
      specs: ['Resolution: ~0.01 hPa ≈ 10 cm', 'Interface: I²C / SPI', 'Examples: BMP280, BME280, DPS310, MS5611', 'Foam cover: against prop wash and light'],
      choose: 'The barometer on the flight board is enough; what matters is covering it and setting the right noise in the EKF.',
    },
  },
  {
    key: 'mag', group: 'sensor', hyvex: ['icm-20948'],
    tr: {
      name: 'Manyetometre (pusula)', role: 'Yer manyetik alanından burun yönünü (heading) verir.',
      body: 'Jiroskop sapma (yaw) açısını yalnız göreli verir; mutlak yön için manyetometre gerekir. Motor ve batarya akımları kendi manyetik alanlarını üretir, bu yüzden pusula çoğu zaman GPS modülünün içinde, direk üstünde, güç kablolarından uzakta durur. Her yeni kurulumda kalibrasyon yapılır (sert ve yumuşak demir düzeltmesi); PX4 ayrıca motor akımına bağlı bozulmayı telafi edebilir. Türkiye\'de manyetik sapma (deklinasyon) yaklaşık 5–6° doğudur; PX4 bunu GPS konumundan kendisi hesaplar.',
      specs: ['Örnek: IST8310, QMC5883L, RM3100, AK09916 (ICM-20948 içinde)', 'Arayüz: I²C', 'Konum: güç hatlarından uzak, GPS direği'],
      choose: 'GPS modülüyle birleşik pusula kullan; uçuş kartındaki dahili pusulayı motorlar yakınsa kapat.',
    },
    en: {
      name: 'Magnetometer (compass)', role: 'Gives the heading of the nose from the Earth\'s magnetic field.',
      body: 'The gyro only gives yaw relatively; an absolute heading needs a magnetometer. Motor and battery currents create their own magnetic fields, so the compass usually sits inside the GPS module on a mast, away from power wires. Calibrate it on every new build (hard and soft iron correction); PX4 can also compensate the disturbance that depends on motor current. Magnetic declination in Türkiye is about 5–6° east; PX4 computes it from the GPS position.',
      specs: ['Examples: IST8310, QMC5883L, RM3100, AK09916 (inside the ICM-20948)', 'Interface: I²C', 'Placement: away from power lines, GPS mast'],
      choose: 'Use the compass combined with the GPS module; disable the flight board\'s internal compass if it sits close to the motors.',
    },
  },
  {
    key: 'gps', group: 'sensor', hyvex: [], sim: 'mission',
    tr: {
      name: 'GNSS / GPS alıcısı', role: 'Mutlak konum ve hız verir; konum tutma, görev ve eve dönüşün temeli.',
      body: 'Modern modüller (u-blox M8/M9/M10) GPS, Galileo, GLONASS ve BeiDou\'yu birlikte izler ve 5–10 Hz konum verir. Açık gökyüzünde yatay hata tipik olarak 1–3 m\'dir ve bu hata beyaz gürültü değildir: yavaşça gezinir. Bu yüzden GPS\'le iniş metre düzeyinde sapar; santimetre için RTK (sabit baz istasyonu düzeltmesi) ya da görsel işaretçiyle hassas iniş gerekir. PX4 GPS\'i EKF2\'de IMU, barometre ve pusulayla birleştirir; uydu sayısı ve HDOP kontrolleri geçmeden konum kiplerine izin vermez.',
      specs: ['Yatay hata: 1–3 m (tek frekans), RTK: 1–2 cm', 'Hız: 5–18 Hz', 'Arayüz: UART (u-blox UBX) + pusula için I²C', 'Soğuk başlangıç: ~25–30 s'],
      choose: 'Pusulalı bir M10 modülü çoğu görev için yeterli; hassas haritalama veya ped dışı iniş için RTK.',
    },
    en: {
      name: 'GNSS / GPS receiver', role: 'Gives absolute position and velocity; the basis of position hold, missions and return-to-home.',
      body: 'Modern modules (u-blox M8/M9/M10) track GPS, Galileo, GLONASS and BeiDou together and output position at 5–10 Hz. Under open sky the horizontal error is typically 1–3 m, and that error is not white noise: it wanders slowly. This is why a GPS landing misses by metres; centimetres need RTK (corrections from a fixed base station) or precision landing on a visual marker. PX4 fuses GPS with the IMU, barometer and compass in EKF2 and does not allow position modes until satellite count and HDOP checks pass.',
      specs: ['Horizontal error: 1–3 m (single frequency), RTK: 1–2 cm', 'Rate: 5–18 Hz', 'Interface: UART (u-blox UBX) + I²C for the compass', 'Cold start: ~25–30 s'],
      choose: 'An M10 module with a compass is enough for most missions; RTK for precise mapping or landing without a pad.',
    },
  },
  {
    key: 'rc', group: 'haberlesme', hyvex: [],
    tr: {
      name: 'RC alıcı', role: 'Pilotun kumandasından gelen komutları uçuş kontrolcüsüne iletir.',
      body: 'Otonom bir drone\'da bile kumanda güvenlik bağıdır: pilot her an Position ya da Land kipine geçebilmeli. Bugün en yaygını açık kaynaklı ExpressLRS (2,4 GHz veya 868/915 MHz) ve CRSF protokolüdür; eski sistemler SBUS (ters çevrilmiş UART, 100 kbaud) ve PPM kullanır. Alıcı bağlantı kalitesini (LQ, RSSI) geri bildirir; bağlantı kesilince uçuş kontrolcüsü failsafe eylemini başlatır (PX4: COM_RC_LOSS_T süresi sonunda Return ya da Land).',
      specs: ['ExpressLRS: 50–1000 Hz paket hızı, CRSF protokolü', 'SBUS: 16 kanal, ters UART', 'Failsafe: alıcı "çıkış yok" kipine ayarlanmalı'],
      choose: 'Alıcıyı bağlantı kesilince sinyal göndermeyi kesecek şekilde ayarla; sabit değer göndermesi failsafe\'i gizler.',
    },
    en: {
      name: 'RC receiver', role: 'Passes commands from the pilot\'s transmitter to the flight controller.',
      body: 'Even on an autonomous drone the transmitter is the safety link: the pilot must be able to switch to Position or Land at any moment. Today the most common choice is open-source ExpressLRS (2.4 GHz or 868/915 MHz) with the CRSF protocol; older systems use SBUS (inverted UART, 100 kbaud) and PPM. The receiver reports link quality (LQ, RSSI); on link loss the flight controller starts the failsafe action (PX4: Return or Land after COM_RC_LOSS_T).',
      specs: ['ExpressLRS: 50–1000 Hz packet rate, CRSF protocol', 'SBUS: 16 channels, inverted UART', 'Failsafe: set the receiver to "no pulses"'],
      choose: 'Set the receiver to stop sending on link loss; sending fixed values hides the failsafe.',
    },
  },
  {
    key: 'telemetry', group: 'haberlesme', hyvex: ['esp32-esp32-wroom-devkit'],
    tr: {
      name: 'Telemetri telsizi', role: 'Yer istasyonuyla (QGroundControl) MAVLink bağlantısı kurar.',
      body: 'Telemetri, kumandadan ayrı ikinci bir bağdır: yer istasyonu konumu, bataryayı, uyarıları görür; görev yükler, parametre değiştirir. Klasik çözüm SiK yazılımlı 433/868/915 MHz telsiz çiftidir (~57 600 baud, birkaç km). Yakın mesafede ESP32 tabanlı Wi-Fi köprüleri, uzun menzilde LTE ya da ExpressLRS\'in MAVLink kipi kullanılır. Frekans ve verici gücü ülkeden ülkeye değişir; Türkiye ve Avrupa\'da genellikle 433 ve 868 MHz bantları, ABD\'de 915 MHz kullanılır: BTK düzenlemesini kontrol et.',
      specs: ['SiK telsiz: 57 600 baud, MAVLink', 'Wi-Fi köprü (ESP32): kısa mesafe, yüksek veri', 'Bağlantı kesilmesi failsafe\'i: PX4 NAV_DLL_ACT'],
      choose: 'Otonom görevde telemetri şarttır; bağlantı kaybı için failsafe eylemini görevden önce belirle.',
    },
    en: {
      name: 'Telemetry radio', role: 'Provides the MAVLink link to the ground station (QGroundControl).',
      body: 'Telemetry is a second link, separate from the transmitter: the ground station sees position, battery and warnings; it uploads missions and changes parameters. The classic choice is a pair of SiK-firmware radios at 433/868/915 MHz (~57,600 baud, a few km). ESP32-based Wi-Fi bridges are used at short range, LTE or the MAVLink mode of ExpressLRS at long range. Frequencies and transmit power differ by country; Türkiye and Europe generally use the 433 and 868 MHz bands, the US 915 MHz: check the local regulator (BTK in Türkiye).',
      specs: ['SiK radio: 57,600 baud, MAVLink', 'Wi-Fi bridge (ESP32): short range, high data rate', 'Data-link loss failsafe: PX4 NAV_DLL_ACT'],
      choose: 'Telemetry is mandatory for autonomous missions; set the link-loss failsafe action before the mission.',
    },
  },
  {
    key: 'camera', group: 'haberlesme', hyvex: ['esp32-cam', 'raspberry-pi-4b', 'jetson-orin-nano'],
    tr: {
      name: 'Kamera, VTX ve görev bilgisayarı', role: 'Pilota görüntü verir; otonom görevde görü algoritmalarını besler.',
      body: 'FPV için iki yol vardır: analog 5,8 GHz (düşük gecikme, düşük çözünürlük) ve sayısal sistemler (DJI O3/O4, Walksnail, HDZero; 720p–1080p). VTX verici gücü yasal sınıra tabidir; Avrupa\'da ve birçok ülkede 5,8 GHz video için 25 mW EIRP sınırı vardır. Otonom görevde kamera görev bilgisayarına (Raspberry Pi, Jetson) bağlanır; ArUco/AprilTag tespiti, optik akış veya nesne tanıma orada çalışır ve sonuç MAVLink ya da ROS 2 ile uçuş kontrolcüsüne gider. Uçuş kontrolcüsü hiçbir zaman görüntü işlemez: iş bölümü güvenliğin parçasıdır.',
      specs: ['Analog: 5,8 GHz, ~25–40 ms gecikme', 'Sayısal: 720p–1080p, ~20–40 ms', 'Görev bilgisayarı: Pi 5, Jetson Orin Nano (40 TOPS)', 'Aşağı bakan kamera: hassas iniş, optik akış'],
      choose: 'Yalnız görüntü için FPV sistemi; görü tabanlı otonomi için ayrı bir görev bilgisayarı ve küresel enstantaneli (global shutter) kamera.',
    },
    en: {
      name: 'Camera, VTX and companion computer', role: 'Gives the pilot video; feeds vision algorithms in autonomous missions.',
      body: 'There are two routes for FPV: analog 5.8 GHz (low latency, low resolution) and digital systems (DJI O3/O4, Walksnail, HDZero; 720p–1080p). VTX transmit power is legally limited; in Europe and many countries 5.8 GHz video is limited to 25 mW EIRP. In an autonomous mission the camera connects to a companion computer (Raspberry Pi, Jetson); ArUco/AprilTag detection, optical flow or object recognition run there and the result goes to the flight controller over MAVLink or ROS 2. The flight controller never processes images: the division of labour is part of safety.',
      specs: ['Analog: 5.8 GHz, ~25–40 ms latency', 'Digital: 720p–1080p, ~20–40 ms', 'Companion computer: Pi 5, Jetson Orin Nano (40 TOPS)', 'Down-facing camera: precision landing, optical flow'],
      choose: 'An FPV system for video only; a separate companion computer and a global-shutter camera for vision-based autonomy.',
    },
  },
  {
    key: 'range', group: 'sensor', hyvex: ['tf-luna-lidar', 'vl53l0x-tof'], sim: 'alt',
    tr: {
      name: 'Mesafe sensörü ve optik akış', role: 'Yere olan yüksekliği ve GPS\'siz yatay hızı verir.',
      body: 'Barometre alçakta yer etkisi ve pervane rüzgârıyla bozulur; aşağı bakan LiDAR (TF-Luna, 8 m) ya da ToF sensörü yerden yüksekliği santimetre doğrulukla ölçer. Optik akış sensörü yer dokusunun görüntüdeki kaymasını ölçer; mesafeyle birlikte yatay hızı verir ve GPS olmayan iç mekânda konum tutmayı sağlar. PX4 EKF2 ikisini de birleştirir (EKF2_RNG_*, EKF2_OF_*). Hassas inişin son metrelerinde mesafe sensörü iniş anını doğru yakalar.',
      specs: ['TF-Luna: 0,2–8 m, 100 Hz, UART/I²C', 'VL53L0X: ~2 m, iç mekân', 'Optik akış: PMW3901 (+ mesafe sensörü)', 'Parlak güneş ve su yüzeyi ölçümü bozar'],
      choose: 'İç mekân ve alçak uçuşta optik akış + LiDAR; açık alanda iniş için yalnız LiDAR yeterli.',
    },
    en: {
      name: 'Range sensor and optical flow', role: 'Give height above ground and horizontal velocity without GPS.',
      body: 'Close to the ground the barometer is corrupted by ground effect and prop wash; a down-facing LiDAR (TF-Luna, 8 m) or ToF sensor measures height above ground to centimetres. An optical-flow sensor measures how the ground texture slides across the image; with the distance it gives horizontal velocity and enables position hold indoors without GPS. PX4 EKF2 fuses both (EKF2_RNG_*, EKF2_OF_*). In the last metres of a precision landing the range sensor catches the touchdown correctly.',
      specs: ['TF-Luna: 0.2–8 m, 100 Hz, UART/I²C', 'VL53L0X: ~2 m, indoors', 'Optical flow: PMW3901 (+ range sensor)', 'Bright sun and water surfaces corrupt readings'],
      choose: 'Optical flow + LiDAR indoors and for low flight; LiDAR alone is enough for outdoor landing.',
    },
  },
]

export const dronePartOf = (key: string): DronePart | undefined => DRONE_PARTS.find((p) => p.key === key)
