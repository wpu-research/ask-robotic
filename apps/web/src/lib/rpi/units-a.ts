// Raspberry Pi dersi üniteleri 1–5: kart seçimi, Linux, Python, GPIO, sensör veri yolları. HTML iki dilde aynı etiket dizisinde.
import type { CourseUnit } from '@/lib/gomulu/types'
import { PY_FIT, blinkCompare, gpioPy, logPy, rpiGpioPy, sensorsPy, setupSh, venvSh } from './code'
import type { RpiSimId } from './sims'

export const UNITS_A: CourseUnit<RpiSimId>[] = [
  {
    n: 1, hours: 3, sims: ['board'], hyvex: ['raspberry-pi-4b', 'arduino-uno-atmega328p', 'stm32', 'esp32-esp32-wroom-devkit'],
    tr: {
      title: 'Tek kartlı bilgisayar ve mikrodenetleyici',
      summary: 'Raspberry Pi bir bilgisayardır, Arduino ve STM32 birer mikrodenetleyici: hangisi ne zaman, ikisi birlikte nasıl?',
      goals: ['Tek kartlı bilgisayar (SBC) ile mikrodenetleyiciyi (MCU) mimari, güç ve zamanlama açısından karşılaştırmak', 'Bir robot projesinin gereksinimlerinden kart seçmek ve gerekçesini yazmak', 'Pi + MCU birlikte mimarisinde görev paylaşımını çizmek', 'Pi 5, Pi 4, Zero 2 W ve Pico\'yu ayırt etmek'],
      notes: `<p>Raspberry Pi 5 dört çekirdekli 64 bit ARM Cortex-A76 işlemcili, gigabaytlarca RAM\'i olan, Linux çalıştıran gerçek bir <b>bilgisayardır</b>. Arduino Uno, Raspberry Pi Pico ya da STM32 ise <b>mikrodenetleyicidir</b>: işlemci, flash ve RAM tek yongada, işletim sistemi yok, program elektrik gelir gelmez çalışır.</p>
<h3>Fark zamanlamada</h3>
<p>Linux çok görevli bir işletim sistemidir: Python programın her an başka bir süreç, bir kesme ya da bellek yönetimi yüzünden birkaç milisaniye bekletilebilir. Bir LED\'i yakmak için sorun değildir; ama 20 kHz motor PWM\'i ya da saniyede binlerce enkoder darbesini kaçırmamak için bir mikrodenetleyicinin donanım zamanlayıcısı gerekir. Buna <b>kesin (hard) gerçek zaman</b> denir.</p>
<ul><li><b>Pi</b>: kamera, OpenCV, yapay zekâ modeli, Wi-Fi, web sunucusu, ROS 2, dosya sistemi.</li><li><b>MCU</b>: mikrosaniye zamanlama, analog giriş (ADC), pille aylarca çalışma, 1 saniyeden kısa açılış.</li><li><b>İkisi birlikte</b>: Pi düşünür (görüntü, plan), MCU kas gibi çalışır (PWM, enkoder); aralarında UART ya da I²C.</li></ul>
<h3>GPIO gerilimi</h3>
<p>Pi\'nin GPIO pinleri <b>3,3 V</b>\'tur ve 5 V\'a dayanmaz; analog girişi yoktur. Uno 5 V\'tur. İkisini doğrudan bağlamak için seviye dönüştürücü (BSS138) gerekir. Bu dersin her ünitesinde bu sınırı hatırlayacağız.</p>`,
      code: [blinkCompare('tr')],
      tryIt: 'Kart seçicide üç proje dene: (1) okul bahçesinde güneş panelli hava istasyonu, (2) kameralı ve web panelli keşif robotu, (3) 20 kHz PWM\'li ve enkoderli denge robotu. Her biri için önerilen kartı ve en çok puan kaybettiren gereksinimi not et. Üçüncüde kombinasyon neden kazanıyor?',
      pitfalls: ['Pi\'nin GPIO\'suna 5 V sensör çıkışı bağlamak: pin kalıcı olarak bozulabilir. Seviye dönüştürücü ya da gerilim bölücü kullan.', 'Pi\'yi "hızlı Arduino" sanmak: işlemci hızlıdır ama zamanlama garantisi yoktur.', 'Pi\'yi zayıf bir USB adaptörüyle beslemek: Pi 5 için 5 V 5 A önerilir, düşük gerilimde rastgele çöker ve SD kart bozulabilir.', 'Fişi çekerek kapatmak: SD kart yazma sırasında bozulabilir; sudo shutdown -h now kullan.'],
      se: `<p>Kart seçimi bir <b>mimari karardır</b> ve kaydı tutulmalıdır. Kısa bir ADR (Architecture Decision Record) yaz:</p>
<ul><li>Bağlam: gereksinimler ve kısıtlar (pil, maliyet, zamanlama).</li><li>Karar: seçilen kart ya da kombinasyon.</li><li>Sonuçlar: neyi kazandık, neyi kaybettik, ne zaman yeniden düşünürüz.</li></ul>`,
      quiz: [
        { q: 'Kameradan görüntü işleyip web panelinde gösterecek bir robot için hangi kart daha uygundur?', options: ['Arduino Uno', 'Raspberry Pi', 'Tek başına bir 555 zamanlayıcı', 'Pico'], answer: 1, why: 'Kamera, OpenCV ve web sunucusu Linux ve bol RAM ister; bunlar Pi\'nin güçlü olduğu işlerdir.' },
        { q: 'Pi\'nin GPIO pinleri hangi mantık gerilimiyle çalışır?', options: ['5 V', '12 V', '3,3 V', '1,8 V'], answer: 2, why: 'Pi GPIO\'ları 3,3 V\'tur ve 5 V\'a dayanıklı değildir.' },
        { q: 'Linux üstündeki bir Python döngüsü neden 20 kHz PWM üretmek için uygun değildir?', options: ['Python yazılımı PWM bilmez', 'İşletim sistemi süreci her an bekletebilir, zamanlama garantisi yoktur', 'Pi\'de saat yoktur', 'GPIO yalnız giriş olabilir'], answer: 1, why: 'Çok görevli işletim sisteminde zamanlama titrer; kesin zamanlama için donanım zamanlayıcısı ya da MCU gerekir.' },
        { q: 'Pi + MCU mimarisinde tipik iş bölümü hangisidir?', options: ['MCU görüntü işler, Pi motor PWM üretir', 'Pi üst düzey karar ve görüntü, MCU zamanlama kritik motor ve sensör işleri', 'İkisi aynı işi yedekli yapar', 'Pi yalnız güç verir'], answer: 1, why: 'Pi düşünür, MCU zamanlamayı tutar; aralarında UART ya da I²C ile komut ve durum alışverişi yapılır.' },
      ],
    },
    en: {
      title: 'Single-board computer versus microcontroller',
      summary: 'A Raspberry Pi is a computer, an Arduino or STM32 a microcontroller: which one when, and how do they work together?',
      goals: ['Compare a single-board computer (SBC) and a microcontroller (MCU) in architecture, power and timing', 'Choose a board from a robot project\'s requirements and write down why', 'Draw the division of work in a Pi + MCU architecture', 'Tell the Pi 5, Pi 4, Zero 2 W and Pico apart'],
      notes: `<p>A Raspberry Pi 5 is a real <b>computer</b> with a quad-core 64-bit ARM Cortex-A76, gigabytes of RAM, running Linux. An Arduino Uno, a Raspberry Pi Pico or an STM32 is a <b>microcontroller</b>: processor, flash and RAM on one chip, no operating system, and the program runs the moment power arrives.</p>
<h3>The difference is timing</h3>
<p>Linux is a multitasking operating system: your Python program can be held for a few milliseconds at any moment by another process, an interrupt or memory management. That does not matter for lighting an LED; but not missing a 20 kHz motor PWM or thousands of encoder pulses per second needs a microcontroller\'s hardware timer. This is called <b>hard real time</b>.</p>
<ul><li><b>Pi</b>: camera, OpenCV, AI models, Wi-Fi, web server, ROS 2, a file system.</li><li><b>MCU</b>: microsecond timing, analog input (ADC), months on a battery, boot in under a second.</li><li><b>Both together</b>: the Pi thinks (vision, planning), the MCU works like a muscle (PWM, encoders); UART or I²C between them.</li></ul>
<h3>GPIO voltage</h3>
<p>The Pi\'s GPIO pins are <b>3.3 V</b> and do not tolerate 5 V; there is no analog input. The Uno is 5 V. Connecting them directly needs a level shifter (BSS138). We will remember this limit in every unit of the course.</p>`,
      code: [blinkCompare('en')],
      tryIt: 'Try three projects in the board picker: (1) a solar-powered weather station in the school garden, (2) an exploration robot with a camera and web panel, (3) a balancing robot with 20 kHz PWM and encoders. For each, note the recommended board and the need that costs the most points. Why does the combination win in the third?',
      pitfalls: ['Connecting a 5 V sensor output to a Pi GPIO: the pin can be damaged for good. Use a level shifter or a voltage divider.', 'Treating the Pi as a "fast Arduino": the processor is fast but timing is not guaranteed.', 'Powering the Pi from a weak USB adapter: 5 V 5 A is recommended for a Pi 5; under-voltage causes random crashes and can corrupt the SD card.', 'Pulling the plug to shut down: the SD card can be corrupted mid-write; use sudo shutdown -h now.'],
      se: `<p>Choosing a board is an <b>architecture decision</b> and should be recorded. Write a short ADR (Architecture Decision Record):</p>
<ul><li>Context: requirements and constraints (battery, cost, timing).</li><li>Decision: the chosen board or combination.</li><li>Consequences: what we gained, what we lost, when we will revisit it.</li></ul>`,
      quiz: [
        { q: 'Which board suits a robot that processes camera images and shows them on a web panel?', options: ['Arduino Uno', 'Raspberry Pi', 'A 555 timer on its own', 'Pico'], answer: 1, why: 'Camera, OpenCV and a web server need Linux and plenty of RAM; these are the Pi\'s strengths.' },
        { q: 'What logic voltage do the Pi\'s GPIO pins use?', options: ['5 V', '12 V', '3.3 V', '1.8 V'], answer: 2, why: 'Pi GPIOs are 3.3 V and are not 5 V tolerant.' },
        { q: 'Why is a Python loop on Linux unsuitable for generating 20 kHz PWM?', options: ['Python software does not know PWM', 'The operating system can hold the process at any moment; timing is not guaranteed', 'The Pi has no clock', 'GPIO can only be an input'], answer: 1, why: 'On a multitasking OS timing jitters; hard timing needs a hardware timer or an MCU.' },
        { q: 'What is the typical division of work in a Pi + MCU architecture?', options: ['The MCU does vision, the Pi generates motor PWM', 'The Pi does high-level decisions and vision, the MCU timing-critical motor and sensor work', 'Both do the same job redundantly', 'The Pi only supplies power'], answer: 1, why: 'The Pi thinks, the MCU keeps the timing; they exchange commands and status over UART or I²C.' },
      ],
    },
  },
  {
    n: 2, hours: 4, sims: ['terminal'], simCfg: { terminal: { tasks: 'linux' } }, hyvex: ['raspberry-pi-4b'],
    tr: {
      title: 'Raspberry Pi OS ve Linux komut satırı',
      summary: 'Dosya sistemi, izinler, sudo, apt ile paket kurma ve ssh ile uzaktan bağlanma.',
      goals: ['Raspberry Pi Imager ile SD karta işletim sistemi yazıp ilk ayarları (kullanıcı, Wi-Fi, SSH) yapmak', 'ls, cd, cat, nano, mkdir, cp, mv, rm ile dosya sisteminde gezinmek', 'Dosya izinlerini (rwx) okumak ve chmod ile değiştirmek; sudo\'nun ne zaman gerektiğini bilmek', 'apt ile paket kurmak ve ssh ile Pi\'ye uzaktan bağlanmak'],
      notes: `<p>Raspberry Pi OS, Debian tabanlı bir Linux dağıtımıdır. Robotlarda genelde ekransız (<i>headless</i>) kullanılır: Raspberry Pi Imager\'da kullanıcı adı, Wi-Fi ve SSH önceden ayarlanır, Pi açılınca dizüstünden <code>ssh pi@raspberrypi.local</code> ile bağlanılır.</p>
<h3>Dosya sistemi</h3>
<p>Her şey tek bir kökten (<code>/</code>) dallanır: <code>/home/pi</code> senin evin (<code>~</code>), <code>/etc</code> ayar dosyaları, <code>/boot/firmware/config.txt</code> donanım ayarları, <code>/sys</code> ve <code>/dev</code> ise çekirdeğin donanımı dosya gibi gösterdiği yerlerdir. Linux\'ta "her şey bir dosyadır": DS18B20 sıcaklığı bile <code>/sys/bus/w1/devices/.../w1_slave</code> dosyasından okunur.</p>
<h3>İzinler ve sudo</h3>
<p><code>ls -l</code> çıktısındaki <code>-rwxr-xr--</code> üç gruptur: sahip, grup, diğerleri; r okuma, w yazma, x çalıştırma. <code>chmod +x start.sh</code> betiği çalıştırılabilir yapar, <code>chmod 644</code> sekizlik gösterimdir. Sistem dosyaları root\'undur; onları değiştirmek için komutun başına <code>sudo</code> eklenir. Her şeyi sudo ile yapmak kötü alışkanlıktır: yanlış bir komut sistemi bozar.</p>
<h3>Paketler</h3>
<p><code>sudo apt update</code> paket listesini yeniler, <code>sudo apt install i2c-tools</code> paketi kurar. Python kütüphaneleri için önce apt\'a bak (<code>python3-opencv</code>); apt\'ta yoksa sanal ortamda pip kullan.</p>`,
      code: [setupSh('tr'), venvSh('tr')],
      tryIt: 'Terminalde görev listesini bitir: ~/robot/logs klasörü, echo ile bir dosya, start.sh\'yi çalıştırılabilir yapma, i2c-tools ve python3-opencv kurulumu. Sonra sudo olmadan /etc/hostname dosyasına yazmayı dene ve hata mesajını oku. ls -l ile start.sh\'nin izinlerinin chmod öncesi ve sonrasını karşılaştır. Gerçek Pi\'de: Imager ile kart hazırla ve ssh ile bağlan.',
      pitfalls: ['Her komutu sudo ile çalıştırmak: dosyalar root\'a geçer, sonra normal kullanıcı yazamaz.', 'rm -rf\'i yol denetlemeden kullanmak: geri dönüşüm kutusu yoktur.', 'apt update yapmadan install: eski liste yüzünden paket bulunamaz ya da eski sürüm gelir.', 'Varsayılan parolayla SSH\'yi internete açmak: anahtarla giriş (ssh-copy-id) kullan, parola girişini kapat.'],
      se: `<p>Kurulum adımlarını elle değil <b>betikle</b> yap ve sürüm denetimine koy: aynı betik ikinci Pi\'yi dakikada hazırlar.</p>
<ul><li>Betik <b>idempotent</b> olsun: iki kez çalışınca da aynı sonucu versin (mkdir -p, apt install -y).</li><li>set -euo pipefail ile hatada dur; sessizce yarım kurulum bırakma.</li></ul>`,
      quiz: [
        { q: '-rw-r--r-- izinli bir betiği çalıştırmak için hangi komut gerekir?', options: ['chmod +x betik.sh', 'sudo betik.sh', 'cat betik.sh', 'mkdir betik.sh'], answer: 0, why: 'x (çalıştırma) biti yok; chmod +x ekler.' },
        { q: 'sudo apt install neden sudo ister?', options: ['apt yavaş olduğu için', 'Paketler sistem dizinlerine (root\'a ait) kurulur', 'İnternet için', 'Python için'], answer: 1, why: 'Kurulum /usr ve /etc gibi root\'a ait dizinlere yazar.' },
        { q: 'chmod 754 dosya ne anlama gelir?', options: ['Herkes her şeyi yapabilir', 'Sahip rwx, grup r-x, diğerleri r--', 'Sahip r--, grup r-x, diğerleri rwx', 'Dosya silinir'], answer: 1, why: '7 = rwx, 5 = r-x, 4 = r--; sırayla sahip, grup, diğerleri.' },
        { q: 'Ekransız bir Pi\'ye dizüstünden bağlanmanın standart yolu nedir?', options: ['Bluetooth klavye', 'ssh pi@raspberrypi.local', 'USB bellek', 'HDMI kablosu'], answer: 1, why: 'SSH şifreli bir uzak kabuk açar; Imager\'da önceden etkinleştirilir.' },
      ],
    },
    en: {
      title: 'Raspberry Pi OS and the Linux command line',
      summary: 'The file system, permissions, sudo, installing packages with apt and connecting remotely with ssh.',
      goals: ['Flash the operating system to an SD card with Raspberry Pi Imager and set the first options (user, Wi-Fi, SSH)', 'Move around the file system with ls, cd, cat, nano, mkdir, cp, mv, rm', 'Read file permissions (rwx), change them with chmod and know when sudo is needed', 'Install packages with apt and connect to the Pi remotely with ssh'],
      notes: `<p>Raspberry Pi OS is a Debian-based Linux distribution. On robots it is usually run without a screen (<i>headless</i>): the user name, Wi-Fi and SSH are preset in Raspberry Pi Imager, and once the Pi boots you connect from your laptop with <code>ssh pi@raspberrypi.local</code>.</p>
<h3>The file system</h3>
<p>Everything branches from a single root (<code>/</code>): <code>/home/pi</code> is your home (<code>~</code>), <code>/etc</code> holds configuration files, <code>/boot/firmware/config.txt</code> hardware settings, and <code>/sys</code> and <code>/dev</code> are where the kernel shows hardware as files. In Linux "everything is a file": even the DS18B20 temperature is read from the file <code>/sys/bus/w1/devices/.../w1_slave</code>.</p>
<h3>Permissions and sudo</h3>
<p>The <code>-rwxr-xr--</code> in <code>ls -l</code> output is three groups: owner, group, others; r read, w write, x execute. <code>chmod +x start.sh</code> makes a script executable, <code>chmod 644</code> is the octal form. System files belong to root; to change them you prefix the command with <code>sudo</code>. Doing everything with sudo is a bad habit: one wrong command breaks the system.</p>
<h3>Packages</h3>
<p><code>sudo apt update</code> refreshes the package list, <code>sudo apt install i2c-tools</code> installs a package. For Python libraries look in apt first (<code>python3-opencv</code>); if apt lacks it, use pip inside a virtual environment.</p>`,
      code: [setupSh('en'), venvSh('en')],
      tryIt: 'Finish the task list in the terminal: the ~/robot/logs folder, a file written with echo, making start.sh executable, installing i2c-tools and python3-opencv. Then try writing to /etc/hostname without sudo and read the error. Compare the permissions of start.sh with ls -l before and after chmod. On a real Pi: prepare a card with Imager and connect with ssh.',
      pitfalls: ['Running every command with sudo: files become root\'s and the normal user can no longer write them.', 'Using rm -rf without checking the path: there is no recycle bin.', 'Installing without apt update: the stale list means the package is not found or an old version arrives.', 'Exposing SSH to the internet with the default password: log in with a key (ssh-copy-id) and disable password login.'],
      se: `<p>Do setup steps with a <b>script</b>, not by hand, and keep it in version control: the same script prepares a second Pi in minutes.</p>
<ul><li>Make the script <b>idempotent</b>: running it twice gives the same result (mkdir -p, apt install -y).</li><li>Stop on error with set -euo pipefail; never leave a silent half-install.</li></ul>`,
      quiz: [
        { q: 'Which command is needed to run a script with permissions -rw-r--r--?', options: ['chmod +x script.sh', 'sudo script.sh', 'cat script.sh', 'mkdir script.sh'], answer: 0, why: 'There is no x (execute) bit; chmod +x adds it.' },
        { q: 'Why does sudo apt install need sudo?', options: ['Because apt is slow', 'Packages are installed into system directories owned by root', 'For the internet', 'For Python'], answer: 1, why: 'Installation writes to root-owned directories such as /usr and /etc.' },
        { q: 'What does chmod 754 file mean?', options: ['Everyone can do everything', 'Owner rwx, group r-x, others r--', 'Owner r--, group r-x, others rwx', 'The file is deleted'], answer: 1, why: '7 = rwx, 5 = r-x, 4 = r--; owner, group, others in that order.' },
        { q: 'What is the standard way to reach a headless Pi from a laptop?', options: ['A Bluetooth keyboard', 'ssh pi@raspberrypi.local', 'A USB stick', 'An HDMI cable'], answer: 1, why: 'SSH opens an encrypted remote shell; it is enabled in advance in Imager.' },
      ],
    },
  },
  {
    n: 3, hours: 4, sims: ['terminal'], simCfg: { terminal: { tasks: 'python' } }, hyvex: ['raspberry-pi-4b', 'ds18b20'],
    py: { file: 'motor_fit.py', code: PY_FIT, datasets: ['motor-pwm'] },
    tr: {
      title: 'Pi üzerinde Python: betikten bakımı kolay programa',
      summary: 'Sanal ortam, modüller, dataclass, dosyaya günlük yazma, pytest ve NumPy ile ölçüm analizi.',
      goals: ['Python betiğini terminalden çalıştırmak ve sanal ortamla bağımlılıkları yönetmek', 'Donanım okuyan kodu saf mantıktan ayırıp testlenebilir yazmak', 'Ölçümleri CSV\'ye güvenli biçimde günlüklemek', 'NumPy ile motor ölçümlerinden doğru uydurmak ve ileri besleme değeri çıkarmak'],
      notes: `<p>Pi\'de Python iki iş için kullanılır: donanımla konuşmak (gpiozero, picamera2, smbus2) ve veriyle düşünmek (NumPy, OpenCV). İkisini aynı fonksiyonda karıştırmak, kodu hem test edilemez hem de Pi dışında çalışamaz yapar.</p>
<h3>Proje düzeni</h3>
<ul><li><code>robot/hw.py</code>: donanım sınıfları (motor, sensör). Yalnız burada gpiozero içe aktarılır.</li><li><code>robot/logic.py</code>: saf fonksiyonlar (özetleme, denetim, karar). Dizüstünde de çalışır.</li><li><code>tests/</code>: pytest testleri; donanım yerine sahte (fake) nesneler.</li><li><code>main.py</code>: ikisini birbirine bağlar.</li></ul>
<h3>Sanal ortam</h3>
<p>Raspberry Pi OS Bookworm, sistem Python\'una pip ile kurmayı engeller (PEP 668). <code>python3 -m venv --system-site-packages .venv</code> hem apt ile gelen picamera2 ve gpiozero\'yu görür hem de pip paketlerini projeye özel tutar. <code>requirements.txt</code> sürümleri sabitler.</p>
<h3>Günlük ve analiz</h3>
<p>Robot sahada çalışırken ne olduğunu ancak günlükten öğrenirsin. Her satıra zaman damgası koy, <code>flush()</code> ile diske yaz. Sonra veriyi NumPy ile incele: aşağıdaki örnek Pi\'de toplanmış 40 motor ölçümüne doğru uydurur, ölü bölgeyi ve 20 cm/s için gereken PWM\'i bulur. Bu sayı, 7. ünitede PI denetimine ileri besleme olarak girecek.</p>`,
      code: [logPy('tr')],
      tryIt: 'Aşağıdaki Python kodunu tarayıcıda çalıştır (Pyodide): ölü bölge ve 20 cm/s için PWM değerini not et. Kodu değiştirip 30 cm/s için hesapla. Terminalde python3 blink.py çalıştır, sonra nano ile blink.py\'deki bekleme süresini değiştirip kaydet. Gerçek Pi\'de: sanal ortam kur, pytest ile test_summarize\'ı geçir.',
      pitfalls: ['sudo pip install: sistem Python\'unu bozar; Bookworm zaten engeller. Sanal ortam kullan.', 'Donanım koduyla mantığı aynı fonksiyonda yazmak: test etmek için Pi gerekir.', 'Günlüğü flush etmeden tutmak: elektrik kesilince son dakikalar kaybolur.', 'Kayan noktalı sayıları == ile karşılaştırmak: testlerde round ya da pytest.approx kullan.'],
      se: `<p>Bağımlılığı dışarıdan verme (<b>dependency injection</b>): <code>log_forever(read_temp)</code> sensörü parametre olarak alır.</p>
<ul><li>Testte <code>lambda: 21.5</code> verilir, Pi\'de gerçek okuyucu.</li><li>Aynı fikir 10. ünitede ROS 2 düğümlerinde ve bitirme projesinin Drive sınıfında tekrar karşına çıkacak.</li></ul>`,
      quiz: [
        { q: 'Bookworm\'da pip paketleri için önerilen yol hangisidir?', options: ['sudo pip install', 'Sanal ortam (venv)', 'Paketleri /usr\'ye kopyalamak', 'pip kullanmamak, kodu kopyalamak'], answer: 1, why: 'PEP 668 sistem Python\'unu korur; venv projeye özel bir ortam verir.' },
        { q: '--system-site-packages seçeneği ne sağlar?', options: ['İnterneti kapatır', 'apt ile kurulmuş paketler (picamera2 gibi) sanal ortamda görünür', 'Python sürümünü yükseltir', 'Paketleri siler'], answer: 1, why: 'picamera2 gibi apt paketleri pip ile kolay kurulmaz; bu seçenekle sanal ortamdan da kullanılır.' },
        { q: 'Neden donanım okuma kodu saf mantıktan ayrılır?', options: ['Daha hızlı çalışsın diye', 'Mantık, Pi olmadan test edilebilsin diye', 'Python bunu zorunlu kılar', 'Dosya küçülsün diye'], answer: 1, why: 'Saf fonksiyonlar dizüstünde ve CI\'da pytest ile test edilebilir; donanım sahte nesneyle değiştirilir.' },
        { q: 'Motor ölçümüne uydurulan doğru hız = a·PWM + b ise ölü bölge nerededir?', options: ['PWM = a', 'PWM = −b/a', 'PWM = b', 'PWM = 0'], answer: 1, why: 'Hızın sıfır olduğu PWM: a·PWM + b = 0 → PWM = −b/a.' },
      ],
    },
    en: {
      title: 'Python on the Pi: from a script to a maintainable program',
      summary: 'Virtual environments, modules, dataclasses, logging to a file, pytest and analysing measurements with NumPy.',
      goals: ['Run a Python script from the terminal and manage dependencies with a virtual environment', 'Separate hardware-reading code from pure logic and make it testable', 'Log measurements to CSV safely', 'Fit a line to motor measurements with NumPy and derive a feedforward value'],
      notes: `<p>Python on the Pi does two jobs: talking to hardware (gpiozero, picamera2, smbus2) and thinking with data (NumPy, OpenCV). Mixing both in the same function makes the code untestable and unable to run anywhere but the Pi.</p>
<h3>Project layout</h3>
<ul><li><code>robot/hw.py</code>: hardware classes (motor, sensor). Only here is gpiozero imported.</li><li><code>robot/logic.py</code>: pure functions (summaries, control, decisions). They run on a laptop too.</li><li><code>tests/</code>: pytest tests; fake objects instead of hardware.</li><li><code>main.py</code>: wires the two together.</li></ul>
<h3>Virtual environment</h3>
<p>Raspberry Pi OS Bookworm blocks pip installs into system Python (PEP 668). <code>python3 -m venv --system-site-packages .venv</code> both sees picamera2 and gpiozero from apt and keeps pip packages private to the project. <code>requirements.txt</code> pins the versions.</p>
<h3>Logging and analysis</h3>
<p>When the robot runs in the field, the log is the only way to know what happened. Put a timestamp on every row and write it to disk with <code>flush()</code>. Then study the data with NumPy: the example below fits a line to 40 motor measurements logged on the Pi and finds the dead band and the PWM needed for 20 cm/s. That number becomes the feedforward term of PI control in unit 7.</p>`,
      code: [logPy('en')],
      tryIt: 'Run the Python code below in the browser (Pyodide): note the dead band and the PWM for 20 cm/s. Change the code to compute it for 30 cm/s. In the terminal run python3 blink.py, then change the delay in blink.py with nano and save. On a real Pi: create a virtual environment and make test_summarize pass with pytest.',
      pitfalls: ['sudo pip install: it breaks system Python; Bookworm blocks it anyway. Use a virtual environment.', 'Writing hardware code and logic in the same function: you need a Pi to test it.', 'Keeping the log without flushing: the last minutes are lost when power drops.', 'Comparing floats with ==: use round or pytest.approx in tests.'],
      se: `<p>Pass the dependency in from outside (<b>dependency injection</b>): <code>log_forever(read_temp)</code> takes the sensor as a parameter.</p>
<ul><li>In a test you pass <code>lambda: 21.5</code>, on the Pi the real reader.</li><li>The same idea returns in unit 10 in ROS 2 nodes and in the capstone\'s Drive class.</li></ul>`,
      quiz: [
        { q: 'What is the recommended way to install pip packages on Bookworm?', options: ['sudo pip install', 'A virtual environment (venv)', 'Copying packages into /usr', 'Not using pip, copying the code'], answer: 1, why: 'PEP 668 protects system Python; a venv gives a project-private environment.' },
        { q: 'What does --system-site-packages provide?', options: ['It turns off the internet', 'Packages installed with apt (such as picamera2) are visible inside the venv', 'It upgrades Python', 'It deletes packages'], answer: 1, why: 'apt packages such as picamera2 are hard to install with pip; with this option the venv can use them.' },
        { q: 'Why is hardware-reading code separated from pure logic?', options: ['So it runs faster', 'So the logic can be tested without a Pi', 'Python requires it', 'To make the file smaller'], answer: 1, why: 'Pure functions can be tested with pytest on a laptop and in CI; the hardware is replaced by a fake.' },
        { q: 'If the line fitted to the motor data is speed = a·PWM + b, where is the dead band?', options: ['PWM = a', 'PWM = −b/a', 'PWM = b', 'PWM = 0'], answer: 1, why: 'The PWM where speed is zero: a·PWM + b = 0 → PWM = −b/a.' },
      ],
    },
  },
  {
    n: 4, hours: 5, sims: ['gpio'], hyvex: ['raspberry-pi-4b', 'led', 'direnc', 'buton-anahtar', 'sg90', 'bss138-lojik-seviye-cevirici'], esofWeek: 2,
    tr: {
      title: 'GPIO: LED, buton, buzzer ve servo',
      summary: '40 pinli başlık, BCM numaraları, pull-up, sıçrama önleme, olay güdümlü kod ve PWM ile servo.',
      goals: ['40 pinli başlıkta güç, toprak ve GPIO pinlerini, fiziksel ve BCM numaralarını ayırt etmek', 'LED ön direncini hesaplamak ve bir GPIO\'dan çekilebilecek akım sınırını bilmek', 'Butonu dahili pull-up ile okumak, sıçramayı (bounce) önlemek ve olay güdümlü kod yazmak', 'Servoyu donanım PWM\'li pinden 50 Hz darbeyle sürmek'],
      notes: `<p>Pi\'nin 40 pinli başlığında 26 GPIO, 3,3 V ve 5 V güç pinleri ve sekiz GND vardır. İki numaralandırma kullanılır: <b>fiziksel</b> (başlıktaki sıra, 1–40) ve <b>BCM</b> (yongadaki GPIO numarası). gpiozero BCM kullanır: <code>LED(17)</code> fiziksel 11. pindir.</p>
<h3>Çıkış: LED</h3>
<p>Bir GPIO en fazla yaklaşık 16 mA vermelidir ve hepsinin toplamı da sınırlıdır. Kırmızı LED (V<sub>f</sub> ≈ 2 V) ile 10 mA için ön direnç R = (3,3 − 2) / 0,01 = 130 Ω; standart 220 Ω daha güvenli (≈ 6 mA). Röle ya da motor gibi büyük yükler asla doğrudan pine bağlanmaz: transistör ya da sürücü kartı gerekir.</p>
<h3>Giriş: buton</h3>
<p>Boşta kalan giriş <b>yüzer</b>: ne 0 ne 1 okunur, elini yaklaştırınca bile değişir. gpiozero\'da <code>Button(27)</code> dahili pull-up\'ı açar; buton pini GND\'ye çeker, basılıyken 0 okunur. Mekanik kontaklar birkaç milisaniye sıçrar; <code>bounce_time=0.05</code> bunu süzer.</p>
<div class="eq">servo: 50 Hz, 1 ms (−90°) … 1,5 ms (0°) … 2 ms (+90°)</div>
<h3>PWM ve servo</h3>
<p>Pi\'nin iki donanım PWM kanalı vardır (GPIO12/18 ve GPIO13/19). Başka pinlerde gpiozero yazılımsal PWM kullanır: LED için yeter, servo titrer. Servonun gücünü Pi\'nin 5 V pininden değil ayrı bir kaynaktan ver, toprakları birleştir.</p>`,
      code: [gpioPy('tr'), rpiGpioPy('tr')],
      tryIt: 'Benzetimde LED\'i fiziksel 2. pine bağla ve hatayı oku; sonra 11. pine taşı. Servoyu 11. pine bağlayınca gelen uyarıyı oku ve 12. pine al. "Alarm" programını seç: butona bas, LED ve buzzer\'ın nasıl değiştiğini ve koddaki pin numaralarını izle. 330 Ω ile LED akımını hesapla (V_f = 2 V).',
      pitfalls: ['Fiziksel ve BCM numaralarını karıştırmak: LED(11) fiziksel 11 değil, GPIO11 (SCLK) demektir.', 'LED\'i dirençsiz bağlamak: pin ve LED aşırı akımdan bozulur.', 'Servoyu Pi\'nin 5 V pininden beslemek: akım darbeleri Pi\'yi yeniden başlatır.', 'Butonu pull-up/down olmadan okumak: rastgele basışlar görülür.'],
      se: `<p>gpiozero olay güdümlüdür: <code>button.when_pressed = toggle</code>. Döngü yerine <b>geri çağırma</b> kullanmak kodu sade tutar ama iş parçacığı demektir.</p>
<ul><li>Geri çağırmada uzun iş yapma; paylaşılan durum için kilit kullan.</li><li>Pin numaralarını tek bir ayar dosyasında topla: kablolama değişince kod değişmesin.</li></ul>`,
      quiz: [
        { q: 'gpiozero\'da LED(17) hangi fiziksel pindir?', options: ['17', '11', '27', '6'], answer: 1, why: 'gpiozero BCM numarası kullanır; GPIO17 başlıkta fiziksel 11. pindir.' },
        { q: '3,3 V GPIO, V_f = 2 V kırmızı LED ve 10 mA için ön direnç kaç Ω?', options: ['33 Ω', '130 Ω', '330 Ω', '1 kΩ'], answer: 1, why: 'R = (3,3 − 2) / 0,010 = 130 Ω.' },
        { q: 'Button(27) varsayılan olarak nasıl bağlanır?', options: ['Buton 3,3 V\'a, dahili pull-down', 'Buton GND\'ye, dahili pull-up; basılıyken 0', 'Buton 5 V\'a', 'Direnç gerekmez çünkü pin çıkıştır'], answer: 1, why: 'pull_up=True varsayılandır; buton pini GND\'ye çeker.' },
        { q: 'Servo neden GPIO18\'e bağlanmalı?', options: ['18 en hızlı pin olduğu için', 'GPIO18 donanım PWM kanalıdır; yazılımsal PWM servoyu titretir', 'Diğer pinler çıkış olamaz', 'Fark etmez'], answer: 1, why: 'GPIO12/13/18/19 donanım PWM\'lidir; zamanlama işletim sisteminden bağımsızdır.' },
      ],
    },
    en: {
      title: 'GPIO: LED, button, buzzer and servo',
      summary: 'The 40-pin header, BCM numbers, pull-ups, debouncing, event-driven code and driving a servo with PWM.',
      goals: ['Tell power, ground and GPIO pins and physical versus BCM numbers apart on the 40-pin header', 'Calculate an LED series resistor and know the current limit of a GPIO', 'Read a button with the internal pull-up, debounce it and write event-driven code', 'Drive a servo with 50 Hz pulses from a hardware-PWM pin'],
      notes: `<p>The Pi\'s 40-pin header has 26 GPIOs, 3.3 V and 5 V power pins and eight GNDs. Two numbering schemes are used: <b>physical</b> (the position on the header, 1–40) and <b>BCM</b> (the GPIO number on the chip). gpiozero uses BCM: <code>LED(17)</code> is physical pin 11.</p>
<h3>Output: LED</h3>
<p>A GPIO should supply about 16 mA at most, and the total for all of them is limited too. For a red LED (V<sub>f</sub> ≈ 2 V) at 10 mA the series resistor is R = (3.3 − 2) / 0.01 = 130 Ω; the standard 220 Ω is safer (≈ 6 mA). Big loads such as relays or motors never go straight onto a pin: they need a transistor or a driver board.</p>
<h3>Input: button</h3>
<p>An input left unconnected <b>floats</b>: it reads neither 0 nor 1 and changes even when your hand comes close. In gpiozero <code>Button(27)</code> turns on the internal pull-up; the button pulls the pin to GND and reads 0 while pressed. Mechanical contacts bounce for a few milliseconds; <code>bounce_time=0.05</code> filters that.</p>
<div class="eq">servo: 50 Hz, 1 ms (−90°) … 1.5 ms (0°) … 2 ms (+90°)</div>
<h3>PWM and servo</h3>
<p>The Pi has two hardware PWM channels (GPIO12/18 and GPIO13/19). On other pins gpiozero uses software PWM: fine for an LED, but a servo jitters. Power the servo from a separate supply, not the Pi\'s 5 V pin, and join the grounds.</p>`,
      code: [gpioPy('en'), rpiGpioPy('en')],
      tryIt: 'In the simulation wire the LED to physical pin 2 and read the error; then move it to pin 11. Wire the servo to pin 11, read the warning and move it to pin 12. Pick the "Alarm" program: press the button and watch the LED, the buzzer and the pin numbers in the code. Calculate the LED current with 330 Ω (V_f = 2 V).',
      pitfalls: ['Mixing physical and BCM numbers: LED(11) means GPIO11 (SCLK), not physical 11.', 'Wiring an LED without a resistor: over-current damages the pin and the LED.', 'Powering a servo from the Pi\'s 5 V pin: current spikes reboot the Pi.', 'Reading a button without a pull-up/down: random presses appear.'],
      se: `<p>gpiozero is event-driven: <code>button.when_pressed = toggle</code>. Using a <b>callback</b> instead of a loop keeps the code simple but means threads.</p>
<ul><li>Do not do long work in a callback; use a lock for shared state.</li><li>Keep pin numbers in one configuration file so a wiring change does not change the code.</li></ul>`,
      quiz: [
        { q: 'Which physical pin is LED(17) in gpiozero?', options: ['17', '11', '27', '6'], answer: 1, why: 'gpiozero uses BCM numbers; GPIO17 is physical pin 11 on the header.' },
        { q: 'Series resistor for a 3.3 V GPIO, a red LED with V_f = 2 V and 10 mA?', options: ['33 Ω', '130 Ω', '330 Ω', '1 kΩ'], answer: 1, why: 'R = (3.3 − 2) / 0.010 = 130 Ω.' },
        { q: 'How is Button(27) wired by default?', options: ['Button to 3.3 V, internal pull-down', 'Button to GND, internal pull-up; reads 0 when pressed', 'Button to 5 V', 'No resistor needed because the pin is an output'], answer: 1, why: 'pull_up=True is the default; the button pulls the pin to GND.' },
        { q: 'Why should the servo go on GPIO18?', options: ['Because 18 is the fastest pin', 'GPIO18 is a hardware PWM channel; software PWM makes the servo jitter', 'Other pins cannot be outputs', 'It does not matter'], answer: 1, why: 'GPIO12/13/18/19 have hardware PWM; the timing is independent of the operating system.' },
      ],
    },
  },
  {
    n: 5, hours: 5, sims: ['bus'], hyvex: ['ds18b20', 'bme280', 'mpu6050', 'oled-ssd1306-0-96', 'logic-analyzer'], esofWeek: 3,
    tr: {
      title: 'Sensörler ve veri yolları: 1-Wire, I²C, SPI',
      summary: 'DS18B20 ve CRC, I²C adresleri ve i2cdetect, SPI ile MCP3008 analog okuma; config.txt ayarları.',
      goals: ['config.txt ve raspi-config ile I²C, SPI ve 1-Wire arayüzlerini açmak', 'DS18B20\'yi 1-Wire üzerinden okuyup CRC\'yi denetlemek', 'I²C yolundaki cihazları i2cdetect ile bulmak ve adres çakışmasını çözmek', 'Pi\'nin olmayan analog girişini SPI\'lı bir ADC (MCP3008) ile eklemek'],
      notes: `<p>Sensörler Pi\'ye üç yaygın veri yoluyla bağlanır. Hepsi <code>/boot/firmware/config.txt</code> satırlarıyla ya da <code>raspi-config</code> ile açılır: <code>dtparam=i2c_arm=on</code>, <code>dtparam=spi=on</code>, <code>dtoverlay=w1-gpio</code>.</p>
<h3>1-Wire: DS18B20</h3>
<p>Tek veri hattı (varsayılan GPIO4) ve 4,7 kΩ pull-up. Her cihazın 64 bitlik benzersiz kimliği vardır; aynı hatta onlarca sensör olabilir. Çekirdek sürücüsü ölçümü <code>w1_slave</code> dosyasına yazar: ilk satır sonunda <b>YES</b> yoksa CRC tutmamıştır ve ölçüm atılır. Ham değer 1/16 °C birimindedir.</p>
<h3>I²C: adresli yol</h3>
<p>İki hat (SDA GPIO2, SCL GPIO3), Pi\'de dahili 1,8 kΩ pull-up. Her cihazın 7 bit adresi vardır: BME280 0x76/0x77, SSD1306 0x3C, MPU6050 0x68/0x69. <code>i2cdetect -y 1</code> yolu tarar. İki cihaz aynı adresteyse (MPU6050 ile DS3231 ikisi de 0x68) birinin adres pini değiştirilir ya da bir I²C çoklayıcı (TCA9548A) kullanılır.</p>
<h3>SPI: hızlı ve tam çift yönlü</h3>
<p>Dört hat (SCLK, MOSI, MISO, CE). Adres yok: her cihaza ayrı seçim (CE) hattı. Pi\'nin ADC\'si olmadığından potansiyometre ya da analog sensör için MCP3008 kullanılır: 3 bayt gönderilir, dönen son iki bayttan 10 bitlik değer çıkar.</p>`,
      code: [sensorsPy('tr')],
      tryIt: '1-Wire sekmesinde sıcaklığı değiştir ve w1_slave satırlarını izle; "CRC bozuk" kutusunu işaretleyince okuyucunun ölçümü neden reddettiğini açıkla. I²C sekmesinde MPU6050 ve DS3231\'i birlikte ekle, çakışmayı MPU6050\'nin AD0 pinini değiştirerek çöz. SPI sekmesinde 2,5 V için giden ve gelen baytları yaz. Terminalde i2c-tools kurup i2cdetect -y 1 çalıştır.',
      pitfalls: ['Arayüzü config.txt\'de açıp yeniden başlatmamak: /dev/i2c-1 oluşmaz.', 'DS18B20\'yi pull-up dirençsiz bağlamak: 85 °C ya da hiç cihaz görünmez (85 °C, dönüşüm yapılmamış açılış değeridir).', '5 V I²C modülünü seviye dönüştürücüsüz bağlamak: modül kendi pull-up\'larıyla hatları 5 V\'a çeker.', 'I²C kablolarını uzun tutmak: yol kapasitesi artar, kenarlar yavaşlar, iletişim kopar.'],
      se: `<p>Sensör okuyucuyu bir <b>arayüzün</b> arkasına koy: <code>read() → float | None</code>.</p>
<ul><li>None, "bu ölçüm geçersiz" demektir; çağıran yeniden dener ya da son geçerli değeri kullanır.</li><li>Kayıtlı w1_slave örnekleriyle (biri bozuk CRC) çözümleyiciyi birim testinde sına.</li></ul>`,
      quiz: [
        { q: 'w1_slave dosyasının ilk satırı "crc=e1 NO" ile bitiyorsa ne yapılmalı?', options: ['Değeri kullan', 'Ölçümü at ve yeniden oku', 'Sensörü değiştir', 'Sıcaklığı 16\'ya böl'], answer: 1, why: 'CRC tutmamış; veri iletimde bozulmuş olabilir. Yeniden okunur.' },
        { q: 'I²C yolunda MPU6050 (0x68) ve DS3231 (0x68) birlikte çalışmıyor. Çözüm?', options: ['Yol hızını artırmak', 'MPU6050\'nin AD0 pinini 1 yapıp 0x69\'a almak', 'İkisini SPI\'a bağlamak', 'Pull-up\'ı sökmek'], answer: 1, why: 'Aynı adres çakışır; adres pini ikinci adresi seçer.' },
        { q: 'Pi\'de potansiyometre okumak için ne gerekir?', options: ['Doğrudan GPIO yeter', 'Harici bir ADC (ör. MCP3008, SPI)', 'Bir LED', 'Yalnız pull-up'], answer: 1, why: 'Pi\'nin analog girişi yoktur; SPI ya da I²C\'li bir ADC kullanılır.' },
        { q: 'SPI\'da birden fazla cihaz nasıl seçilir?', options: ['7 bit adresle', 'Her cihaza ayrı chip select (CE) hattıyla', 'Farklı baud hızıyla', 'Seçilemez'], answer: 1, why: 'SPI\'da adres yoktur; CE hattı düşük olan cihaz konuşur.' },
      ],
    },
    en: {
      title: 'Sensors and buses: 1-Wire, I²C, SPI',
      summary: 'DS18B20 and its CRC, I²C addresses and i2cdetect, analog reading with an SPI MCP3008; config.txt settings.',
      goals: ['Enable the I²C, SPI and 1-Wire interfaces with config.txt and raspi-config', 'Read a DS18B20 over 1-Wire and check its CRC', 'Find devices on the I²C bus with i2cdetect and resolve an address clash', 'Add the analog input the Pi lacks with an SPI ADC (MCP3008)'],
      notes: `<p>Sensors connect to the Pi over three common buses. All are enabled with lines in <code>/boot/firmware/config.txt</code> or with <code>raspi-config</code>: <code>dtparam=i2c_arm=on</code>, <code>dtparam=spi=on</code>, <code>dtoverlay=w1-gpio</code>.</p>
<h3>1-Wire: DS18B20</h3>
<p>A single data line (GPIO4 by default) and a 4.7 kΩ pull-up. Each device has a unique 64-bit ID; dozens of sensors can share one line. The kernel driver writes the reading to the <code>w1_slave</code> file: if the first line does not end in <b>YES</b>, the CRC failed and the reading is discarded. The raw value is in units of 1/16 °C.</p>
<h3>I²C: an addressed bus</h3>
<p>Two lines (SDA GPIO2, SCL GPIO3), with 1.8 kΩ pull-ups on the Pi. Every device has a 7-bit address: BME280 0x76/0x77, SSD1306 0x3C, MPU6050 0x68/0x69. <code>i2cdetect -y 1</code> scans the bus. If two devices share an address (MPU6050 and DS3231 are both 0x68), change one\'s address pin or use an I²C multiplexer (TCA9548A).</p>
<h3>SPI: fast and full duplex</h3>
<p>Four lines (SCLK, MOSI, MISO, CE). No addresses: each device has its own chip-select (CE) line. Since the Pi has no ADC, an MCP3008 is used for a potentiometer or an analog sensor: three bytes go out, and the 10-bit value comes from the last two bytes returned.</p>`,
      code: [sensorsPy('en')],
      tryIt: 'In the 1-Wire tab change the temperature and watch the w1_slave lines; tick "corrupt CRC" and explain why the reader rejects the reading. In the I²C tab add the MPU6050 and DS3231 together and resolve the clash by changing the MPU6050\'s AD0 pin. In the SPI tab write down the bytes sent and received for 2.5 V. In the terminal install i2c-tools and run i2cdetect -y 1.',
      pitfalls: ['Enabling the interface in config.txt without rebooting: /dev/i2c-1 does not appear.', 'Wiring a DS18B20 without the pull-up: 85 °C or no device at all (85 °C is the power-on value before any conversion).', 'Connecting a 5 V I²C module without a level shifter: its own pull-ups pull the lines to 5 V.', 'Long I²C wires: bus capacitance rises, edges slow down and communication fails.'],
      se: `<p>Put the sensor reader behind an <b>interface</b>: <code>read() → float | None</code>.</p>
<ul><li>None means "this reading is invalid"; the caller retries or uses the last valid value.</li><li>Test the parser in a unit test with recorded w1_slave samples (one with a bad CRC).</li></ul>`,
      quiz: [
        { q: 'If the first line of w1_slave ends with "crc=e1 NO", what should you do?', options: ['Use the value', 'Discard the reading and read again', 'Replace the sensor', 'Divide the temperature by 16'], answer: 1, why: 'The CRC failed; the data may have been corrupted in transit. Read again.' },
        { q: 'An MPU6050 (0x68) and a DS3231 (0x68) do not work together on I²C. The fix?', options: ['Raise the bus speed', 'Set the MPU6050\'s AD0 pin high to move it to 0x69', 'Move both to SPI', 'Remove the pull-ups'], answer: 1, why: 'Identical addresses clash; the address pin selects the second address.' },
        { q: 'What do you need to read a potentiometer on a Pi?', options: ['A GPIO is enough', 'An external ADC (e.g. MCP3008, SPI)', 'An LED', 'Only a pull-up'], answer: 1, why: 'The Pi has no analog input; use an SPI or I²C ADC.' },
        { q: 'How are several devices selected on SPI?', options: ['With a 7-bit address', 'With a separate chip-select (CE) line per device', 'With different baud rates', 'They cannot be'], answer: 1, why: 'SPI has no addresses; the device whose CE line is low talks.' },
      ],
    },
  },
]
