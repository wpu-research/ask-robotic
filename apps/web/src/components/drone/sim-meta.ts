// Drone dersi simülasyonlarının başlık ve açıklamaları (TR/EN). Kimlikler sims.ts'teki DRONE_SIMS anahtarlarıyla aynı.
export type DroneSimId = 'twr' | 'flight' | 'alt' | 'roll' | 'mixer' | 'fusion' | 'mission'
interface Text { title: string; desc: string }

export const DRONE_SIM_META: Record<DroneSimId, { tr: Text; en: Text }> = {
  twr: {
    tr: { title: 'İtki/ağırlık oranı ve askıda kalma gazı', desc: 'Toplam kütleyi, motor sayısını ve motor başına azami itkiyi (itki tablosundan, gf) gir. İtki/ağırlık oranını ve drone\'un askıda kalmak için ne kadar gaz vermesi gerektiğini gör. Eğri, PX4\'ün THR_MDL_FAC itki modelidir: 0 doğrusal, 1 karesel.' },
    en: { title: 'Thrust-to-weight and hover throttle', desc: 'Enter the total mass, the number of motors and the maximum thrust per motor (from a thrust table, in gf). See the thrust-to-weight ratio and how much throttle the drone needs to hover. The curve is PX4\'s THR_MDL_FAC thrust model: 0 is linear, 1 is quadratic.' },
  },
  flight: {
    tr: { title: 'Uçuş süresi tahmini: motor, pervane, batarya', desc: 'Momentum teorisiyle askıda kalma gücü: P = T^1,5 / √(2ρA), pervane başarım katsayısı ve motor × ESC verimiyle bölünür. Batarya büyüdükçe kütlesi de büyür; eğri, kapasiteyi artırmanın neden giderek daha az süre kazandırdığını gösterir.' },
    en: { title: 'Flight-time estimator: motor, propeller, battery', desc: 'Hover power from momentum theory: P = T^1.5 / √(2ρA), divided by the propeller figure of merit and the motor × ESC efficiency. A bigger battery is also heavier; the curve shows why adding capacity buys less and less time.' },
  },
  alt: {
    tr: { title: 'İrtifa tutma PID ayarı (1B)', desc: '1,2 kg\'lık drone t = 0,5 s\'de 0\'dan 2 m\'ye çıkmak ister. Kontrolcü m·g ileri beslemesini bilir; bilmediği ek yükü kalıcı hata olarak görürsün. Önce yalnız P ve D ile oyna, sonra yük ekle ve hatayı I ile kapat. Aşım, yükselme ve oturma süresi (±%2) altta.' },
    en: { title: 'Altitude-hold PID tuner (1D)', desc: 'A 1.2 kg drone wants to climb from 0 to 2 m at t = 0.5 s. The controller knows the m·g feedforward; a payload it does not know shows up as steady-state error. Play with P and D first, then add a payload and close the error with I. Overshoot, rise time and settling time (±2%) are shown below.' },
  },
  roll: {
    tr: { title: 'Yönelim (roll) kontrolü: kaskad açı + hız PID, gürültüyle', desc: 'Dış döngü açı hatasını hız hedefine çevirir (P), iç döngü jiroskopla açısal hızı tutar (PID). Jiroskop gürültüsünü ve türev kazancını artır: D terimi gürültüyü büyütür, motorlara titreşim olarak gider. D süzgecinin kesim frekansıyla bunu dengele.' },
    en: { title: 'Attitude (roll) control: cascaded angle + rate PID, with noise', desc: 'The outer loop turns angle error into a rate setpoint (P); the inner loop holds angular rate using the gyro (PID). Increase gyro noise and the derivative gain: the D term amplifies noise and sends it to the motors as vibration. Balance it with the D filter cutoff.' },
  },
  mixer: {
    tr: { title: 'Quad X motor karıştırıcı', desc: 'Gaz, yuvarlanma, yunuslama ve sapma komutları dört motora dağıtılır (PX4 Quad X numaralandırması). Bir motor %100\'e dayanınca ne olduğuna bak: karıştırıcı önce yönelimi korur, sonra gazı kaydırır, en son sapmadan kısar.' },
    en: { title: 'Quad X motor mixer', desc: 'Throttle, roll, pitch and yaw commands are distributed to four motors (PX4 Quad X numbering). Watch what happens when a motor hits 100%: the mixer protects attitude first, then shifts throttle, and cuts yaw last.' },
  },
  fusion: {
    tr: { title: 'Tamamlayıcı süzgeç: jiroskop + ivmeölçer', desc: 'Jiroskop kısa vadede temizdir ama sapması (bias) birikir; ivmeölçer uzun vadede doğrudur ama gürültülüdür. Tamamlayıcı süzgeç jiroskobu yüksek, ivmeölçeri alçak frekansta kullanır. τ\'yu değiştir ve kalıcı hatanın sapma × τ olduğunu gör.' },
    en: { title: 'Complementary filter: gyro + accelerometer', desc: 'The gyro is clean in the short term but its bias accumulates; the accelerometer is right in the long term but noisy. A complementary filter trusts the gyro at high and the accelerometer at low frequencies. Change τ and see that the steady error is bias × τ.' },
  },
  mission: {
    tr: { title: 'Ara nokta görevi ve hassas iniş (2B, GPS benzeri)', desc: 'Kalkış → ara noktalar → iniş pedine iniş. Kontrolcü yalnız kestirilen konumu bilir: GPS hatası yavaşça gezinir. İnişte ArUco kamerası açılınca hata santimetrelere düşer. Haritaya tıklayarak ara nokta ekle (sonuncusu ped), rüzgâr ve GPS hatasını değiştir.' },
    en: { title: 'Waypoint mission and precision landing (2D, GPS-like)', desc: 'Take-off → waypoints → landing on the pad. The controller only knows its estimated position: the GPS error wanders slowly. When the ArUco camera takes over for landing the error drops to centimetres. Click the map to add waypoints (the last one is the pad), change wind and GPS error.' },
  },
}
