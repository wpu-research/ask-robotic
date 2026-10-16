// ESOF 323 simülasyonlarının Türkçe arayüz metinleri. translate(): önce tam eşleşme, yoksa okuma panellerindeki
// ("Error e: 0.12\nLeft wheel: …") ifade parçaları uzundan kısaya değiştirilir. Sayılar ve birimler olduğu gibi kalır.

const EXACT: Record<string, string> = {
  // denetimler
  'Controller': 'Denetleyici', 'Bang-bang, 2 sensors': 'Aç-kapa (bang-bang), 2 sensör', 'PD, 5 sensors': 'PD, 5 sensör',
  'Base speed (px/s)': 'Taban hızı (px/s)', 'Kp (PD only)': 'Kp (yalnız PD)', 'Kd (PD only)': 'Kd (yalnız PD)', 'Reset robot': 'Robotu sıfırla',
  'Sensor noise σ (cm)': 'Sensör gürültüsü σ (cm)', 'Moving average window N': 'Hareketli ortalama penceresi N', 'EMA α': 'EMA α',
  'Kalman Q, process noise': 'Kalman Q, süreç gürültüsü', 'Kalman R, measurement noise': 'Kalman R, ölçüm gürültüsü',
  'Moving average': 'Hareketli ortalama', 'EMA': 'EMA', 'Kalman': 'Kalman', 'Restart': 'Yeniden başlat', 'Reset': 'Sıfırla',
  'Duty cycle (%)': 'Doluluk oranı (%)', 'Periods shown': 'Gösterilen periyot', 'Disturbance force': 'Bozucu kuvvet', 'Anti-windup': 'İntegral doyma önleme (anti-windup)',
  'Left wheel vL (px/s)': 'Sol tekerlek vL (px/s)', 'Right wheel vR (px/s)': 'Sağ tekerlek vR (px/s)', 'Wheel base L (px)': 'Tekerlek aralığı L (px)',
  'Wheel radius error (%)': 'Tekerlek yarıçapı hatası (%)', 'Show odometry estimate': 'Odometri tahminini göster',
  'Mode': 'Kip', 'Inverse kinematics: drag target': 'Ters kinematik: hedefi sürükle', 'Forward kinematics: sliders': 'İleri kinematik: kaydırıcılar',
  'IK solution': 'IK çözümü', 'Elbow up': 'Dirsek yukarı', 'Elbow down': 'Dirsek aşağı',
  'Algorithm': 'Algoritma', 'Breadth-first search': 'Genişlik öncelikli arama (BFS)', 'Greedy best-first': 'Açgözlü en iyi öncelikli', 'Click tool': 'Tıklama aracı',
  'Draw walls': 'Duvar çiz', 'Erase walls': 'Duvar sil', 'Move start': 'Başlangıcı taşı', 'Move goal': 'Hedefi taşı', 'Animation speed': 'Animasyon hızı',
  'Run search': 'Aramayı çalıştır', 'Random walls': 'Rastgele duvarlar', 'Clear': 'Temizle',
  'Particles': 'Parçacık', 'Range noise σ (px)': 'Mesafe gürültüsü σ (px)', 'Kidnap robot': 'Robotu kaçır', 'Scatter particles': 'Parçacıkları dağıt',
  'Position hold: click sets target': 'Konum tutma: tıklama hedef koyar', 'Mission: click adds waypoints': 'Görev: tıklama ara nokta ekler',
  'Position Kp': 'Konum Kp', 'Position Ki': 'Konum Ki', 'Position Kd': 'Konum Kd', 'Attitude Kp': 'Yönelim Kp', 'Attitude Kd': 'Yönelim Kd',
  'Wind force (N)': 'Rüzgâr kuvveti (N)', 'Start mission': 'Görevi başlat', 'Clear waypoints': 'Ara noktaları temizle',
  'Drones': 'Drone sayısı', 'Separation': 'Ayrılma', 'Alignment': 'Hizalanma', 'Cohesion': 'Birlik', 'Steer toward goal': 'Hedefe yönel',
  'Playback speed': 'Oynatma hızı', 'Latest delivered messages': 'Son iletilen mesajlar',
  // çizim etiketleri
  'Setpoint': 'Hedef', 'Position x': 'Konum x', 'Control u (scaled)': 'Denetim u (ölçekli)', 'True distance': 'Gerçek mesafe',
  'DC motor': 'DC motor', 'LED': 'LED', 'ICR': 'ADM',
  'Filled: running. Gold outline: running but waiting for input. Dashed: stopped.': 'Dolu: çalışıyor. Altın çerçeve: çalışıyor ama girdi bekliyor. Kesikli: durduruldu.',
}

/** Okuma panellerindeki ifade parçaları (uzundan kısaya uygulanır). */
const PHRASES: Array<[string, string]> = [
  ['Error vs true value (RMSE, cm)', 'Gerçek değere göre hata (RMSE, cm)'],
  ['Mean nearest-neighbour distance', 'Ortalama en yakın komşu mesafesi'],
  ['Turn radius R = v/ω', 'Dönüş yarıçapı R = v/ω'],
  ['Grey circles: measured ranges', 'Gri çemberler: ölçülen mesafeler'],
  ['Overshoot this step', 'Bu adımdaki aşım'],
  ['Thrust left / right', 'İtki sol / sağ'],
  ['Gold squares: landmarks', 'Altın kareler: işaret noktaları'],
  ['Green circle: start', 'Yeşil daire: başlangıç'],
  ['Red square: goal', 'Kırmızı kare: hedef'],
  ['analogWrite value', 'analogWrite değeri'],
  ['Average voltage', 'Ortalama gerilim'],
  ['Odometry error', 'Odometri hatası'],
  ['Estimate error', 'Tahmin hatası'],
  ['Angular speed ω', 'Açısal hız ω'],
  ['Linear speed v', 'Doğrusal hız v'],
  ['Expanded cells', 'Genişletilen hücre'],
  ['End effector', 'Uç işlevci'],
  ['Steady state', 'Kararlı durum'],
  ['Raw sensor', 'Ham sensör'],
  ['Moving average', 'Hareketli ortalama'],
  ['Path length', 'Yol uzunluğu'],
  ['Motor speed', 'Motor hızı'],
  ['Position x', 'Konum x'],
  ['Roll angle', 'Yuvarlanma açısı'],
  ['Left wheel', 'Sol tekerlek'],
  ['Right wheel', 'Sağ tekerlek'],
  ['Control u', 'Denetim u'],
  ['out of reach', 'erişilemez'],
  ['no path exists', 'yol yok'],
  ['run a search', 'arama çalıştır'],
  ['no waypoints', 'ara nokta yok'],
  ['(saturated)', '(doymuş)'],
  ['searching…', 'aranıyor…'],
  ['reachable', 'erişilebilir'],
  ['Particles', 'Parçacık'],
  ['Altitude', 'İrtifa'],
  ['Mission', 'Görev'],
  ['Setpoint', 'Hedef'],
  ['Position', 'Konum'],
  ['Integral', 'İntegral'],
  ['Average', 'Ortalama'],
  ['Error e', 'Hata e'],
  ['Error', 'Hata'],
  ['Target', 'Hedef'],
  ['Drones', 'Drone'],
  [' steps', ' adım'],
]

export function translate(s: string): string {
  const hit = EXACT[s]
  if (hit !== undefined) return hit
  let out = s
  for (const [en, tr] of PHRASES) if (out.includes(en)) out = out.split(en).join(tr)
  return out
}
