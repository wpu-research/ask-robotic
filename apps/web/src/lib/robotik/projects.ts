// ESOF 323 dönem projesi kolları (TR/EN). Hepsi simülasyonda: araç ve kol Webots'ta, drone Gazebo (Harmonic) + PX4 SITL'de.
// Ara teslimler haftalara bağlıdır (hafta sayfası o haftanın proje adımını gösterir). Malzeme listesi gerçek bir yapımın Hyvex karşılığıdır.

export type ProjectSlug = 'otonom-arac' | 'drone-gorevi' | 'robot-kol'
interface Text { title: string; summary: string; scenario: string; setup: string[]; acceptance: string[] }
export interface Milestone { week: number; tr: { title: string; deliver: string }; en: { title: string; deliver: string } }
export interface Project {
  slug: ProjectSlug
  simulator: string
  tr: Text
  en: Text
  /** Gerçek yapımda kullanılacak Hyvex parçaları (slug). */
  bom: string[]
  milestones: Milestone[]
  starter: { title: string; lang: string; src: string }
}

const M = (week: number, tr: [string, string], en: [string, string]): Milestone => ({ week, tr: { title: tr[0], deliver: tr[1] }, en: { title: en[0], deliver: en[1] } })

/** Ortak yazılım mühendisliği ara teslimleri (her kolda aynı haftalar). */
const SE_MILESTONES = (specific: Milestone[]): Milestone[] => [
  M(8, ['Öneri ve gereksinimler', 'İki sayfalık öneri: test edilebilir kabul ölçütleri, ilk mimari (durum makinesi ya da ROS 2 grafiği), risk listesi, haftalık plan. Depo açıldı, CI ilk testi çalıştırıyor.'],
    ['Proposal and requirements', 'Two-page proposal: testable acceptance criteria, first architecture (state machine or ROS 2 graph), risk list, weekly plan. Repository created, CI runs a first test.']),
  ...specific,
  M(14, ['Sunum ve rapor', '10 dakikalık sunum, canlı ya da kayıtlı simülasyon, kabul ölçütlerinin her biri için kanıt (grafik, kayıt, test), final raporu ve depo.'],
    ['Demo and report', '10-minute presentation, live or recorded simulation, evidence for each acceptance criterion (plots, logs, tests), final report and repository.']),
].sort((a, b) => a.week - b.week)

export const PROJECTS: Project[] = [
  {
    slug: 'otonom-arac', simulator: 'Webots',
    tr: {
      title: 'Otonom kara aracı',
      summary: 'Kamerayla şerit takibi, mesafe sensörüyle engelden kaçınma ve trafik işaretlerini derin öğrenmeyle tanıyan bir araç.',
      scenario: 'Araç Webots şehir dünyasında bir pisti şeritten çıkmadan tamamlar, önüne çıkan engelde durur ya da yavaşlar, "dur" işaretinde 3 saniye bekler. Davranış bir durum makinesiyle yönetilir: SERIT_TAKIP, ENGEL, DUR_ISARETI, KAYIP.',
      setup: ['Webots R2025a kur (Windows, macOS, Linux).', 'File → Open Sample World → vehicles/city.wbt dünyasını aç; BMW X5 aracını kullan.', 'Aracın controller alanını <extern> yap ya da kendi Python denetleyicini seç; araca kamera ve ön mesafe sensörü (lidar ya da distance sensor) ekle.', 'Python ortamına numpy, opencv-python ve torch kur.', 'Denetleyiciyi modüllere ayır: perception (şerit, işaret), control (PID), behaviour (durum makinesi); her modülün birim testleri depoda.'],
      acceptance: ['Pistte 3 tur boyunca şeritten çıkma yok (yanal sapma |e| < 0,5).', 'Önünde 8 m içinde engel varken çarpışma yok; engel kalkınca 2 sn içinde yeniden hareket.', 'Dur işaretinde durma oranı en az %90 (20 denemede), yanlış durma en çok 1.', 'Durum makinesinin her geçişi birim testle doğrulanmış; CI yeşil.'],
    },
    en: {
      title: 'Autonomous ground vehicle',
      summary: 'A vehicle that follows lanes with a camera, avoids obstacles with a range sensor and recognises traffic signs with deep learning.',
      scenario: 'The vehicle completes a track in the Webots city world without leaving the lane, stops or slows down for an obstacle in front and waits 3 seconds at a stop sign. A state machine runs the behaviour: LANE_FOLLOW, OBSTACLE, STOP_SIGN, LOST.',
      setup: ['Install Webots R2025a (Windows, macOS, Linux).', 'File → Open Sample World → vehicles/city.wbt; use the BMW X5.', 'Set the vehicle controller to <extern> or select your own Python controller; add a camera and a front range sensor (lidar or distance sensor).', 'Install numpy, opencv-python and torch in your Python environment.', 'Split the controller into modules: perception (lane, sign), control (PID), behaviour (state machine), each with unit tests in the repository.'],
      acceptance: ['No lane departure over 3 laps (lateral offset |e| < 0.5).', 'No collision when an obstacle is within 8 m; moves again within 2 s after it is removed.', 'Stops at the stop sign in at least 90% of 20 trials, at most 1 false stop.', 'Every state machine transition is unit-tested; CI is green.'],
    },
    bom: ['jetson-orin-nano', 'esp32-cam', 'stm32', 'tf-luna-lidar', 'bno085', 'bts7960', 'metal-disli-dc-motor', 'mg996r', 'lipo-batarya', 'lm2596-buck'],
    milestones: SE_MILESTONES([
      M(9, ['Araç sürülüyor', 'Webots\'ta aracı koddan sür; sabit hız ve direksiyon komutları; sensör verileri kaydediliyor.'], ['Vehicle drives', 'Drive the vehicle from code in Webots; constant speed and steering commands; sensor data is logged.']),
      M(10, ['Şerit takibi', 'lane_offset() + PID ile bir tur; sapma grafiği teslim.'], ['Lane following', 'One lap with lane_offset() + PID; submit the offset plot.']),
      M(11, ['Ara kontrol: işaret sınıflandırıcı', 'Webots\'tan toplanan veriyle eğitilmiş işaret ağı (doğrulama doğruluğu, karışıklık matrisi); engel durumu çalışıyor.'], ['Progress check: sign classifier', 'Sign network trained on data collected from Webots (validation accuracy, confusion matrix); obstacle state works.']),
      M(12, ['Mimari: ROS 2 ya da modüller', 'Algılama, denetim ve davranış ayrı düğümler (ROS 2) ya da ayrı modüller; arayüzleri belgelendi.'], ['Architecture: ROS 2 or modules', 'Perception, control and behaviour as separate nodes (ROS 2) or modules; interfaces documented.']),
      M(13, ['Bütünleştirme ve SIL testleri', 'Tüm kabul ölçütleri otomatik senaryolarla (Webots --batch) ölçülüyor.'], ['Integration and SIL tests', 'All acceptance criteria measured by automated scenarios (Webots --batch).']),
    ]),
    starter: {
      title: 'Webots Python: şerit takibi için başlangıç denetleyicisi', lang: 'python',
      src: `# Webots vehicle denetleyicisi (BMW X5, city.wbt). Kamera görüntüsünden şerit sapması, PID ile direksiyon.
import numpy as np
from vehicle import Driver

driver = Driver()
step = int(driver.getBasicTimeStep())
cam = driver.getDevice("camera")
cam.enable(step)
W, H = cam.getWidth(), cam.getHeight()

KP, KD = 0.35, 0.08
prev = 0.0
driver.setCruisingSpeed(20)          # km/h

def lane_offset(bgra):
    img = np.frombuffer(bgra, np.uint8).reshape(H, W, 4)
    roi = img[int(H * 0.6):, :, :3]
    yellow = (roi[:, :, 2] > 150) & (roi[:, :, 1] > 120) & (roi[:, :, 0] < 90)   # BGR
    xs = np.nonzero(yellow)[1]
    if xs.size < 30:
        return None
    return (xs.mean() - W / 2) / (W / 2)     # -1 .. +1

while driver.step() != -1:
    e = lane_offset(cam.getImage())
    if e is None:                       # KAYIP durumu: yavaşla, son direksiyonu koru
        driver.setCruisingSpeed(5)
        continue
    driver.setCruisingSpeed(20)
    u = KP * e + KD * (e - prev) / (step / 1000)
    prev = e
    driver.setSteeringAngle(float(np.clip(u, -0.5, 0.5)))   # rad`,
    },
  },
  {
    slug: 'drone-gorevi', simulator: 'Gazebo + PX4 SITL',
    tr: {
      title: 'Otonom drone görevi',
      summary: 'PX4 uçuş yazılımıyla simülasyonda kalkış, ara nokta görevi, aşağı bakan kamerayla işaretçi (ArUco) bulup üzerine hassas iniş.',
      scenario: 'Drone kalkar, dört ara noktadan geçer, iniş bölgesine gelince aşağı bakan kamerayla ArUco işaretçisini arar, görsel servo ile üzerine hizalanıp iner. Bağlantı kesilirse ya da batarya düşerse geri döner (failsafe).',
      setup: ['Ubuntu 22.04/24.04 (ya da WSL2) üzerinde PX4-Autopilot deposunu klonla ve Tools/setup/ubuntu.sh betiğini çalıştır.', '`make px4_sitl gz_x500_mono_cam_down` ile aşağı bakan kameralı x500\'ü Gazebo Harmonic\'te başlat.', 'Python ortamına mavsdk, opencv-contrib-python kur; QGroundControl ile aracı izle.', 'Kamera görüntüsünü ros_gz_bridge (ROS 2 Jazzy) ya da gz-transport Python bağlamasıyla al.', 'Görev mantığını durum makinesi olarak yaz: KALKIS, ROTA, ARAMA, HIZALAMA, INIS, GERI_DONUS.'],
      acceptance: ['Görev 5 denemede 5 kez tamamlanıyor; her ara noktaya 1 m içinde varılıyor.', 'İniş noktası işaretçi merkezine 0,3 m\'den yakın (5 denemenin ortalaması).', 'Rüzgâr eklenince (Gazebo wind plugin, 3 m/s) görev yine tamamlanıyor.', 'Bağlantı kesilmesi senaryosunda drone 10 sn içinde geri dönüş kipine geçiyor.'],
    },
    en: {
      title: 'Autonomous drone mission',
      summary: 'Take-off, a waypoint mission and precision landing on a marker (ArUco) found with a down-facing camera, in simulation with PX4.',
      scenario: 'The drone takes off, passes four waypoints, searches for the ArUco marker with its down-facing camera when it reaches the landing zone, aligns over it by visual servoing and lands. If the link is lost or the battery is low it returns home (failsafe).',
      setup: ['On Ubuntu 22.04/24.04 (or WSL2), clone PX4-Autopilot and run Tools/setup/ubuntu.sh.', 'Start the x500 with a down-facing camera in Gazebo Harmonic: `make px4_sitl gz_x500_mono_cam_down`.', 'Install mavsdk and opencv-contrib-python; watch the vehicle in QGroundControl.', 'Get the camera image through ros_gz_bridge (ROS 2 Jazzy) or the gz-transport Python bindings.', 'Write the mission logic as a state machine: TAKEOFF, ROUTE, SEARCH, ALIGN, LAND, RETURN.'],
      acceptance: ['The mission completes in 5 of 5 runs; every waypoint is reached within 1 m.', 'Touchdown is within 0.3 m of the marker centre (mean of 5 runs).', 'With wind added (Gazebo wind plugin, 3 m/s) the mission still completes.', 'In a link-loss scenario the drone switches to return mode within 10 s.'],
    },
    bom: ['stm32', 'bmi270', 'jetson-orin-nano', 'esp32-cam', 'tf-luna-lidar', 'esc-blheli-s-32', 'bldc-fircasiz-motor', 'lipo-batarya', 'max17048-max17043-yakit-gostergesi', 'pesd5v0s1ub-tvs-diyot'],
    milestones: SE_MILESTONES([
      M(9, ['SITL çalışıyor', 'PX4 SITL + Gazebo kuruldu; MAVSDK ile kalkış ve iniş betiği.'], ['SITL running', 'PX4 SITL + Gazebo installed; take-off and landing script with MAVSDK.']),
      M(10, ['İşaretçi tespiti', 'Kamera görüntüsünden ArUco pozu; piksel hatası ve tahmini mesafe kaydı.'], ['Marker detection', 'ArUco pose from the camera image; pixel error and estimated distance logged.']),
      M(11, ['Ara kontrol: ara nokta görevi', 'Dört ara noktalı görev ve durum makinesi; kayıt ve harita görüntüsü.'], ['Progress check: waypoint mission', 'Four-waypoint mission and state machine; log and map screenshot.']),
      M(12, ['Görsel servo', 'Offboard kipinde hız komutlarıyla işaretçi üzerine hizalanma; ROS 2 ya da MAVSDK mimarisi belgelendi.'], ['Visual servoing', 'Aligning over the marker with velocity commands in offboard mode; ROS 2 or MAVSDK architecture documented.']),
      M(13, ['Rüzgâr ve failsafe testleri', 'Rüzgâr ve bağlantı kesilmesi senaryoları otomatik çalışıyor.'], ['Wind and failsafe tests', 'Wind and link-loss scenarios run automatically.']),
    ]),
    starter: {
      title: 'MAVSDK Python: kalkış, ara noktalar, iniş (PX4 SITL)', lang: 'python',
      src: `# PX4 SITL: make px4_sitl gz_x500_mono_cam_down   (Gazebo Harmonic)
import asyncio
from mavsdk import System

WAYPOINTS = [(0.0001, 0.0), (0.0001, 0.0001), (0.0, 0.0001), (0.0, 0.0)]   # ev noktasına göre derece farkı

async def main():
    drone = System()
    await drone.connect(system_address="udpin://0.0.0.0:14540")
    async for s in drone.core.connection_state():
        if s.is_connected:
            break
    async for h in drone.telemetry.health():
        if h.is_global_position_ok and h.is_home_position_ok:
            break
    home = await anext(drone.telemetry.home())
    await drone.action.set_takeoff_altitude(10)
    await drone.action.arm()
    await drone.action.takeoff()
    await asyncio.sleep(8)
    for dlat, dlon in WAYPOINTS:                     # ROTA durumu
        await drone.action.goto_location(home.latitude_deg + dlat, home.longitude_deg + dlon,
                                         home.absolute_altitude_m + 10, 0)
        await asyncio.sleep(10)                      # TODO: mesafe 1 m'nin altına inene kadar bekle
    # TODO: ARAMA ve HIZALAMA: ArUco hatasından offboard hız komutları
    await drone.action.land()

asyncio.run(main())`,
    },
  },
  {
    slug: 'robot-kol', simulator: 'Webots',
    tr: {
      title: 'Görsel kılavuzlu robot kol',
      summary: 'Kamerayla masadaki renkli küpleri bulan, ters kinematikle uzanıp kavrayan ve renklerine göre kutulara ayıran bir kol.',
      scenario: 'Kol masanın üstündeki kameradan üç renkte küp görür, her küpün konumunu piksel → dünya dönüşümüyle hesaplar, ters kinematikle küpün üstüne iner, kavrar ve rengine uygun kutuya bırakır. Görev akışı: TARA, SEC, YAKLAS, KAVRA, TASI, BIRAK.',
      setup: ['Webots R2025a kur; File → Open Sample World → robots/abb/irb/inverse_kinematics.wbt örneğini incele (ikpy ile ters kinematik).', 'Python ortamına ikpy, numpy ve opencv-python kur.', 'Dünyaya masa, üç renkte küp, üç kutu ve tepeden bakan bir kamera ekle; kola bir kavrayıcı (gripper) ekle.', 'Kamerayı kalibre et: masanın dört köşesinin piksel ve dünya koordinatından bir homografi hesapla.', 'Görev mantığını durum makinesi, yörüngeyi ayrı bir modül olarak yaz; IK ve homografi için birim testler.'],
      acceptance: ['10 küpten en az 9\'u doğru kutuya bırakılıyor.', 'Kavrama konum hatası 1 cm\'den küçük (homografi + IK).', 'Erişilemeyen bir hedef verildiğinde kol çarpmadan "erişilemez" durumuna geçiyor.', 'Bir küp düşerse kol yeniden TARA durumuna dönüyor.'],
    },
    en: {
      title: 'Vision-guided robot arm',
      summary: 'An arm that finds coloured cubes on a table with a camera, reaches and grasps them with inverse kinematics and sorts them into boxes by colour.',
      scenario: 'The arm sees cubes of three colours from a camera above the table, computes each cube\'s position with a pixel → world transform, moves down over it with inverse kinematics, grasps it and drops it in the matching box. Task flow: SCAN, SELECT, APPROACH, GRASP, CARRY, RELEASE.',
      setup: ['Install Webots R2025a; study File → Open Sample World → robots/abb/irb/inverse_kinematics.wbt (inverse kinematics with ikpy).', 'Install ikpy, numpy and opencv-python.', 'Add a table, cubes of three colours, three boxes and a top-down camera to the world; give the arm a gripper.', 'Calibrate the camera: compute a homography from the pixel and world coordinates of the table\'s four corners.', 'Write the task logic as a state machine and the trajectory as a separate module; unit tests for IK and the homography.'],
      acceptance: ['At least 9 of 10 cubes end up in the correct box.', 'Grasp position error below 1 cm (homography + IK).', 'Given an unreachable target, the arm moves to an "unreachable" state without colliding.', 'If a cube is dropped, the arm returns to SCAN.'],
    },
    bom: ['raspberry-pi-4b', 'esp32-cam', 'stm32', 'ds3225', 'mg996r', 'nema17-step-motor', 'tmc2209', 'gt2-kayis-kasnak-20-dis', 'lm2596-buck'],
    milestones: SE_MILESTONES([
      M(9, ['Kol hareket ediyor', 'Eklem açılarıyla kolu sür; ileri kinematiği Webots konumuyla karşılaştır.'], ['Arm moves', 'Drive the arm by joint angles; compare forward kinematics with the Webots position.']),
      M(10, ['Küp tespiti ve homografi', 'Renk ayırma + homografiyle küplerin dünya konumu; hata tablosu.'], ['Cube detection and homography', 'Colour segmentation + homography gives cube world positions; error table.']),
      M(11, ['Ara kontrol: al-bırak', 'Tek bir küp için tam al-bırak döngüsü; IK birim testleri.'], ['Progress check: pick and place', 'A full pick-and-place cycle for one cube; IK unit tests.']),
      M(12, ['Mimari ve hata durumları', 'Durum makinesi, erişilemez hedef ve düşen küp durumları; ROS 2 ya da modül mimarisi.'], ['Architecture and failure cases', 'State machine, unreachable target and dropped cube cases; ROS 2 or modular architecture.']),
      M(13, ['Bütünleştirme ve ölçüm', '10 küplük otomatik deneme; başarı oranı ve konum hatası grafiği.'], ['Integration and measurement', 'Automated 10-cube trial; success rate and position error plot.']),
    ]),
    starter: {
      title: 'Webots Python: ikpy ile hedefe uzanma', lang: 'python',
      src: `# Webots denetleyicisi: kolun URDF'inden ikpy zinciri kur, hedef noktaya ters kinematikle uzan.
import tempfile
import ikpy.chain
from controller import Supervisor

robot = Supervisor()
step = int(robot.getBasicTimeStep())

with tempfile.NamedTemporaryFile(suffix=".urdf", delete=False) as f:
    f.write(robot.getUrdf().encode("utf-8"))
chain = ikpy.chain.Chain.from_urdf_file(f.name, active_links_mask=[False, True, True, True, True, True, True, False])

motors = []
for link in chain.links:
    if "motor" in link.name.lower() or "joint" in link.name.lower():
        m = robot.getDevice(link.name)
        if m:
            m.getPositionSensor().enable(step)
            motors.append(m)

def reach(x, y, z):
    q0 = [0] + [m.getPositionSensor().getValue() for m in motors] + [0]
    q = chain.inverse_kinematics([x, y, z], initial_position=q0)
    for i, m in enumerate(motors):
        m.setPosition(q[i + 1])

while robot.step(step) != -1:
    reach(0.6, 0.2, 0.4)        # TODO: homografiden gelen küp konumu`,
    },
  },
]

export const projectOf = (slug: string): Project | undefined => PROJECTS.find((p) => p.slug === slug)
/** Bir haftanın proje adımları (her kol için). */
export const milestonesOfWeek = (week: number) => PROJECTS.flatMap((p) => p.milestones.filter((m) => m.week === week).map((m) => ({ project: p, m })))
