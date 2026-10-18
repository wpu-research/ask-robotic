// Drone dersi bitirme projesi: simüle otonom görev (kalkış → ara noktalar → ArUco ile hassas iniş), failsafe senaryolarıyla.
// Yazılım mühendisliği teslimleri ESOF 323 dönem projesi kollarıyla aynı düzende (öneri → ara kontrol → sunum); haftalar yerine ünitelere bağlı.
import type { DronePartKey } from './parts'

interface Text { title: string; summary: string; scenario: string; requirements: string[]; architecture: string[]; tests: string[] }
export interface Deliverable { afterUnit: number; tr: { title: string; deliver: string }; en: { title: string; deliver: string } }

const D = (afterUnit: number, tr: [string, string], en: [string, string]): Deliverable => ({ afterUnit, tr: { title: tr[0], deliver: tr[1] }, en: { title: en[0], deliver: en[1] } })

export const CAPSTONE: { tr: Text; en: Text; parts: DronePartKey[]; hyvex: string[]; deliverables: Deliverable[]; esofProject: string } = {
  esofProject: 'drone-gorevi',
  tr: {
    title: 'Bitirme projesi: otonom görev ve hassas iniş',
    summary: 'Önce tarayıcıda, sonra PX4 SITL + Gazebo\'da: kalkış, dört ara nokta, aşağı bakan kamerayla ArUco işaretçisi üzerine hassas iniş; bağlantı kaybı, düşük batarya ve rüzgâr senaryoları.',
    scenario: 'Drone 10 m\'ye kalkar, dört ara noktadan geçer, iniş bölgesinde ArUco işaretçisini arar, görsel servo ile hizalanıp iner. Görev bir durum makinesiyle yönetilir: KALKIS, ROTA, ARAMA, HIZALAMA, INIS, GERI_DONUS. Bağlantı kesilirse ya da batarya kritik eşiğe inerse drone eve döner; işaretçi 20 s içinde bulunmazsa GPS\'le iner.',
    requirements: [
      'G1: Görev 5 denemenin 5\'inde tamamlanır; her ara noktaya kestirime göre 1 m içinde varılır.',
      'G2: İniş noktası işaretçi merkezine 0,3 m\'den yakındır (5 denemenin ortalaması).',
      'G3: 3 m/s rüzgârda görev yine tamamlanır.',
      'G4: Telemetri kesilirse drone 10 s içinde Return kipine geçer.',
      'G5: Batarya kalan oranı kritik eşiğin altına inerse görev bırakılır ve eve dönülür.',
      'G6: İşaretçi 20 s içinde bulunamazsa GPS\'le güvenli iniş yapılır.',
    ],
    architecture: [
      'Algılama düğümü: kamera görüntüsü → ArUco pozu (solvePnP) → /landing_target.',
      'Görev düğümü: saf geçiş fonksiyonlu durum makinesi; olaylar telemetriden ve algılamadan gelir.',
      'Denetim düğümü: ROTA\'da MAVSDK görevi ya da offboard konum hedefi, HIZALAMA\'da hız komutu.',
      'Arayüzler: ROS 2 konuları (px4_msgs) ya da MAVSDK; mesaj sözleşmeleri belgelenir.',
      'Parametreler (kazançlar, eşikler, failsafe) tek bir YAML dosyasında, sürüm denetiminde.',
    ],
    tests: [
      'Birim: durum makinesinin her geçişi, karıştırıcı, PID ve basamak yanıtı ölçütleri (bu dersin testleri gibi).',
      'Tarayıcı: görev simülasyonunda GPS ve kamera inişinin karşılaştırması; rüzgâr ve GPS hatası taraması.',
      'SIL: HEADLESS=1 ile Gazebo\'da otomatik görev; ULog\'dan G1–G6 ölçülür.',
      'Senaryolar kod olarak: rüzgâr eklentisi, telemetri kesme, batarya eşiğini düşürme.',
      'CI: birim testleri her itmede, SIL testleri gecelik.',
    ],
  },
  en: {
    title: 'Capstone: autonomous mission and precision landing',
    summary: 'First in the browser, then in PX4 SITL + Gazebo: take-off, four waypoints, precision landing on an ArUco marker with a down-facing camera; link loss, low battery and wind scenarios.',
    scenario: 'The drone takes off to 10 m, passes four waypoints, searches for the ArUco marker in the landing zone, aligns over it by visual servoing and lands. A state machine runs the mission: TAKEOFF, ROUTE, SEARCH, ALIGN, LAND, RETURN. If the link drops or the battery reaches the critical threshold the drone returns home; if the marker is not found within 20 s it lands on GPS.',
    requirements: [
      'R1: The mission completes in 5 of 5 runs; each waypoint is reached within 1 m by the estimate.',
      'R2: Touchdown is within 0.3 m of the marker centre (mean of 5 runs).',
      'R3: The mission still completes in 3 m/s wind.',
      'R4: If telemetry drops, the drone switches to Return within 10 s.',
      'R5: If remaining battery falls below the critical threshold, the mission is abandoned and the drone returns home.',
      'R6: If the marker is not found within 20 s, the drone lands safely on GPS.',
    ],
    architecture: [
      'Perception node: camera image → ArUco pose (solvePnP) → /landing_target.',
      'Mission node: state machine with a pure transition function; events come from telemetry and perception.',
      'Control node: a MAVSDK mission or offboard position setpoints in ROUTE, velocity commands in ALIGN.',
      'Interfaces: ROS 2 topics (px4_msgs) or MAVSDK; message contracts are documented.',
      'Parameters (gains, thresholds, failsafes) in a single YAML file under version control.',
    ],
    tests: [
      'Unit: every state machine transition, the mixer, PID and step-response metrics (like the tests in this course).',
      'Browser: GPS vs camera landing in the mission simulation; sweeps over wind and GPS error.',
      'SIL: automatic mission in Gazebo with HEADLESS=1; R1–R6 measured from the ULog.',
      'Scenarios as code: wind plugin, cutting telemetry, lowering the battery threshold.',
      'CI: unit tests on every push, SIL tests nightly.',
    ],
  },
  parts: ['frame', 'motor', 'esc', 'prop', 'lipo', 'pdb', 'fc', 'imu', 'baro', 'mag', 'gps', 'rc', 'telemetry', 'camera', 'range'],
  hyvex: ['stm32', 'bmi270', 'jetson-orin-nano', 'esp32-cam', 'tf-luna-lidar', 'esc-blheli-s-32', 'bldc-fircasiz-motor', 'lipo-batarya', 'max17048-max17043-yakit-gostergesi'],
  deliverables: [
    D(3, ['Öneri ve gereksinimler', 'İki sayfa: G1–G6\'yı kendi cümlelerinle test edilebilir yaz, parça listesi ve itki/ağırlık, uçuş süresi hesabı (simülasyonlardan), risk ve tehlike listesi. Depo açıldı, CI ilk testi çalıştırıyor.'],
      ['Proposal and requirements', 'Two pages: R1–R6 rewritten in your own words as testable requirements, parts list with thrust-to-weight and flight-time calculations (from the simulations), risk and hazard list. Repository created, CI runs a first test.']),
    D(6, ['Denetim ve kestirim', 'PID ve tamamlayıcı süzgeç kodun birim testli; basamak yanıtı ölçütleri için eşik testleri; ayar raporu (simülasyon ekran görüntüleriyle).'],
      ['Control and estimation', 'Your PID and complementary filter code with unit tests; threshold tests for step-response metrics; a tuning report (with simulation screenshots).']),
    D(8, ['Ara kontrol: görev', 'Mimari belgesi (düğümler, konular, durum makinesi); MAVSDK ya da offboard ile SITL\'de dört ara noktalı görev; kayıt ve harita görüntüsü.'],
      ['Progress check: mission', 'Architecture document (nodes, topics, state machine); a four-waypoint mission in SITL with MAVSDK or offboard; log and map screenshot.']),
    D(9, ['Hassas iniş', 'ArUco algılama düğümü ve görsel servo; iniş hatası 5 denemede ölçüldü (G2).'],
      ['Precision landing', 'ArUco perception node and visual servoing; landing error measured over 5 runs (R2).']),
    D(10, ['SIL testleri, sunum ve rapor', 'Rüzgâr, telemetri kesilmesi ve batarya senaryoları otomatik; G1–G6 için kanıt tablosu; 10 dakikalık sunum ve canlı ya da kayıtlı demo; final raporu ve depo.'],
      ['SIL tests, demo and report', 'Wind, link-loss and battery scenarios automated; an evidence table for R1–R6; a 10-minute presentation with a live or recorded demo; final report and repository.']),
  ],
}
