// Raspberry Pi dersinin tarayıcı simülasyonları: başlık ve açıklamalar (TR/EN). Bileşenler components/gomulu/rpi-sims.tsx.
import type { SimMeta } from '@/lib/gomulu/types'

export type RpiSimId = 'board' | 'terminal' | 'gpio' | 'bus' | 'vision' | 'motor' | 'robot' | 'flask' | 'ros'

export const RPI_SIMS: SimMeta<RpiSimId> = {
  board: {
    tr: { title: 'Kart seçici: tek kartlı bilgisayar mı, mikrodenetleyici mi?', desc: 'Projenin gereksinimlerini işaretle; her kart için puanı ve gerekçesini gör. Puanlar ders içi kurallardır: gerçek seçimde veri sayfası, fiyat ve bulunabilirlik de bakılır.' },
    en: { title: 'Board picker: single-board computer or microcontroller?', desc: 'Tick your project\'s needs and see the score and the reasoning for each board. The scores are course rules of thumb: a real choice also weighs the datasheet, price and availability.' },
  },
  terminal: {
    tr: { title: 'Raspberry Pi OS terminali (benzetim)', desc: 'Küçük bir sanal dosya sistemi üzerinde gerçek komutlar: ls, cd, cat, nano, chmod, sudo, apt, systemctl, journalctl, i2cdetect. Ağ, paket kurulumu ve ssh benzetimdir; hiçbir şey indirilmez. Görev listesi durumu denetleyerek işaretlenir.' },
    en: { title: 'Raspberry Pi OS terminal (simulated)', desc: 'Real commands on a small virtual file system: ls, cd, cat, nano, chmod, sudo, apt, systemctl, journalctl, i2cdetect. Networking, package installs and ssh are simulated; nothing is downloaded. The task list ticks itself by checking the state.' },
  },
  gpio: {
    tr: { title: '40 pinli GPIO başlığı: LED, buton, buzzer, servo', desc: 'Her cihazın sinyal ucunu bir fiziksel pine bağla: kablolama denetimi 5 V, GND, veri yolu ve donanım PWM hatalarını yakalar. Bir program seç, butona bas ve gpiozero kodunun pin numaralarıyla birlikte değiştiğini gör.' },
    en: { title: '40-pin GPIO header: LED, button, buzzer, servo', desc: 'Wire each device\'s signal lead to a physical pin: the wiring check catches 5 V, GND, bus and hardware-PWM mistakes. Pick a program, press the button and watch the gpiozero code change with the pin numbers.' },
  },
  bus: {
    tr: { title: 'Sensör veri yolları: 1-Wire, I²C ve SPI', desc: 'DS18B20\'nin w1_slave dosyasını CRC ile çözümle, I²C yoluna cihaz ekleyip adres çakışmasını gör, MCP3008\'e SPI ile giden ve gelen baytları izle.' },
    en: { title: 'Sensor buses: 1-Wire, I²C and SPI', desc: 'Parse the DS18B20 w1_slave file with its CRC, add devices to the I²C bus and see address clashes, and follow the bytes sent to and from an MCP3008 over SPI.' },
  },
  vision: {
    tr: { title: 'Kamera → OpenCV boru hattı: renkli top bulma', desc: 'Yapay bir kamera karesinde HSV eşikleme, açma (aşındır + genişlet), momentlerle ağırlık merkezi ve dönüş komutu. Gürültüyü, ışığı ve eşikleri değiştir; boru hattının hangi adımda bozulduğunu gör.' },
    en: { title: 'Camera → OpenCV pipeline: finding a coloured ball', desc: 'HSV thresholding, opening (erode + dilate), centroid from moments and a steering command on a synthetic camera frame. Change noise, light and thresholds and see which step of the pipeline breaks.' },
  },
  motor: {
    tr: { title: 'L298N, DC motor ve dörtlü enkoder', desc: 'IN1/IN2/EN ile ileri, geri, fren ve serbest; birinci dereceden motor modeli; enkoderin A/B kanallarından yön ve hız. PI denetimini açıp yük altında hızın nasıl tutulduğunu izle.' },
    en: { title: 'L298N, DC motor and quadrature encoder', desc: 'Forward, reverse, brake and coast with IN1/IN2/EN; a first-order motor model; direction and speed from the encoder\'s A/B channels. Turn on PI control and watch speed held under load.' },
  },
  robot: {
    tr: { title: 'Diferansiyel sürüşlü robot ve odometri', desc: 'Klavye (W A S D) ya da düğmelerle sür. Gerçek poz yeşil, enkoderden hesaplanan odometri turuncu: tekerlek çapı hatası ve kaymayla zamanla ayrılırlar.' },
    en: { title: 'Differential-drive robot and odometry', desc: 'Drive with the keyboard (W A S D) or the buttons. The true pose is green, encoder odometry orange: wheel-diameter error and slip pull them apart over time.' },
  },
  flask: {
    tr: { title: 'Flask kontrol paneli ve bekçi (watchdog)', desc: 'Tarayıcıdaki panelden Pi\'deki küçük HTTP sunucusuna istek gönder. Yanıt kodlarını (200, 400, 401, 405), belirteç denetimini ve bağlantı kesilince robotu durduran bekçiyi dene.' },
    en: { title: 'Flask control panel and watchdog', desc: 'Send requests from the browser panel to the small HTTP server on the Pi. Try the status codes (200, 400, 401, 405), the token check and the watchdog that stops the robot when the link drops.' },
  },
  ros: {
    tr: { title: 'ROS 2 düğüm ve konu grafiği', desc: 'Keşif robotunun düğümlerini aç/kapat; rqt_graph benzeri grafik, ros2 topic list çıktısı ve sorunlar (yayıncısız abonelik, /cmd_vel\'de iki yayıncı) anında güncellenir.' },
    en: { title: 'ROS 2 node and topic graph', desc: 'Switch the exploration robot\'s nodes on and off; an rqt_graph-like view, the ros2 topic list output and problems (subscription without publisher, two publishers on /cmd_vel) update instantly.' },
  },
}
