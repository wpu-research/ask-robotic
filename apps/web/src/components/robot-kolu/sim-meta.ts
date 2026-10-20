// Robot Kolu dersi simülasyonlarının başlık ve açıklamaları (TR/EN). Kimlikler sims.ts'teki eşlemeyle aynı.
// Hepsi 3B sahnede çalışan öğretim modelidir: tarayıcıda, deterministik, dış servis yok.
export type RobotSimId = 'workspace' | 'fk' | 'ik' | 'motion' | 'pick' | 'script' | 'plan' | 'safety'
interface Text { title: string; desc: string }

export const ROBOT_SIM_META: Record<RobotSimId, { tr: Text; en: Text }> = {
  workspace: {
    tr: { title: 'Çalışma alanı: kol nereye erişir', desc: 'Tutucu aşağı bakarken seçtiğin TCP yüksekliğinde erişilebilen yatay halka çizilir (bilek merkezi omuzdan en çok 0,9 m uzakta olabilir). Alma bölgesi A ve bırakma bölgesi B işaretlidir; halkanın içinde mi, dışında mı görürsün. Kaydırıcıyla yüksekliği değiştir.' },
    en: { title: 'Workspace: where the arm can reach', desc: 'With the gripper pointing down, the horizontal ring that can be reached at the TCP height you choose is drawn (the wrist centre can be at most 0.9 m from the shoulder). Pick area A and place area B are marked; see whether they are inside or outside the ring. Change the height with the slider.' },
  },
  fk: {
    tr: { title: 'İleri kinematik: eklem kaydırıcıları, TCP okuması', desc: 'Altı eklemi derece olarak kaydır; TCP konumu, bilek merkezi, tutucunun aşağıya sapması ve yakın tekillikler anında okunur. Eklem sınırları kaydırıcı aralıklarıdır. HOME düğmesi (0°, 30°, 60°, 0°, 90°, 0°) tutucuyu aşağı baktırır.' },
    en: { title: 'Forward kinematics: joint sliders, TCP readout', desc: 'Slide the six joints in degrees; the TCP position, the wrist centre, the gripper tilt from down and nearby singularities are read out instantly. The joint limits are the slider ranges. The HOME button (0°, 30°, 60°, 0°, 90°, 0°) makes the gripper point down.' },
  },
  ik: {
    tr: { title: 'Ters kinematik: hedefi sürükle, çözümleri gez', desc: 'Hedef konumu (x, y, z) ve tutucunun yaw açısını ayarla. Bulunan çözümlerin (en çok sekiz: omuz, dirsek, bilek) sayısı gösterilir; birini seçince kol o eklem açılarına geçer. Ulaşılamayan hedefte çözüm sayısı sıfırdır. Doğrulama satırı FK(IK) farkını gösterir.' },
    en: { title: 'Inverse kinematics: set a target, step through the solutions', desc: 'Set the target position (x, y, z) and the gripper yaw angle. The number of solutions found (at most eight: shoulder, elbow, wrist) is shown; choosing one moves the arm to those joint angles. For an unreachable target the count is zero. The verification line shows the FK(IK) difference.' },
  },
  motion: {
    tr: { title: 'PTP ve LIN: iki yol, iki iz', desc: 'A ve B bölgelerinin üstündeki iki duruş arasında eklem uzayı hareketi (PTP, mavi iz) ile kartezyen doğru (LIN, yeşil iz) birlikte çizilir. Süre, TCP yol uzunluğu ve doğrudan en büyük sapma okunur. Hız yüzdesini değiştir; oynat ve kolu iki yolda gör.' },
    en: { title: 'PTP and LIN: two paths, two traces', desc: 'Between two poses above areas A and B, the joint-space move (PTP, blue trace) and the Cartesian line (LIN, green trace) are drawn together. The time, TCP path length and largest deviation from the line are read out. Change the speed percentage; play and watch the arm take both paths.' },
  },
  pick: {
    tr: { title: 'Tutucu ve al-bırak: parça boyutu ve tutma kuralı', desc: 'Hazır al-bırak programı çalışır: A\'dan parça al, B\'ye bırak. Parça boyutunu değiştir: tutucu 0,08 m\'den geniş parçayı tutamaz ve holding() false kalır. Tutma ve bırakma sayısı, düşürme ve süre okunur.' },
    en: { title: 'The gripper and pick-and-place: part size and the grasp rule', desc: 'A ready pick-and-place program runs: take a part at A, put it down at B. Change the part size: the gripper cannot take a part wider than 0.08 m and holding() stays false. The grasp and release counts, drops and time are read out.' },
  },
  script: {
    tr: { title: 'ArmScript: yaz, çalıştır, 3B sahnede izle', desc: 'Platformun kendi robot dili. Örnek seç ya da kendi programını yaz, Çalıştır\'a bas: yorumlayıcı programı tarayıcıda, sınırlı adımla koşturur, konsola çıktıyı ve hatayı satır numarasıyla yazar, sonucu 3B sahnede oynatır. Sunucuda hiçbir şey çalışmaz.' },
    en: { title: 'ArmScript: write, run, watch in the 3D scene', desc: 'The platform\'s own robot language. Choose an example or write your own program and press Run: the interpreter runs it in the browser with a bounded number of steps, writes the output and any error with its line number to the console and plays the result in the 3D scene. Nothing runs on a server.' },
  },
  plan: {
    tr: { title: 'Çarpışmasız yol planlama: duvar, RRT-Connect, tohum', desc: 'A\'nın üstünden B\'nin üstüne giderken arada bir duvar var. Doğrudan PTP\'nin hangi oranda, hangi uzuvla çarptığını gör; sonra RRT-Connect ile çarpışmasız yol bul. Duvar yüksekliği, tohum ve yineleme bütçesi ayarlanır; düğüm, yineleme ve yol sayısı okunur.' },
    en: { title: 'Collision-free path planning: wall, RRT-Connect, seed', desc: 'Between above A and above B there is a wall. See at what fraction and with which link a direct PTP collides; then find a collision-free path with RRT-Connect. The wall height, seed and iteration budget are adjustable; the node, iteration and path counts are read out.' },
  },
  safety: {
    tr: { title: 'Hücre güvenliği: insan yakınlığı, bölge, acil durdurma', desc: 'Kol A ile B arasında gidip gelir. Bir insanı hücre içinde gezdir: 0,8 m içinde kol yavaşlar (ölçek 0,25), 0,4 m içinde durur. Yasak bölgeyi aç, elle kipini aç, acil durdurmaya bas ve sıfırla. Bu bir öğretim modelidir; gerçek hücre güvenliği onaylı donanım ister.' },
    en: { title: 'Cell safety: human proximity, zone, emergency stop', desc: 'The arm shuttles between A and B. Walk a person around the cell: within 0.8 m the arm slows (scale 0.25), within 0.4 m it stops. Switch on the restricted zone, switch on manual mode, press the emergency stop and reset. This is a teaching model; real cell safety needs approved hardware.' },
  },
}
