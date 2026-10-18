// "ARM (STM32) ile Gömülü Programlama" (büyükler için, 16+): 11 ünite, 11 tarayıcı simülasyonu, bitirme projesi
// "PWM motor sürücü + UART komut arayüzü". Sayfalar components/gomulu altındaki ortak bileşenlerle çizilir.
import { D, type Capstone, type CourseDef } from '@/lib/gomulu/types'
import { capstoneParser, unityTest } from './code'
import { STM_SIMS, type StmSimId } from './sims'
import { UNITS_A } from './units-a'
import { UNITS_B } from './units-b'

const CAPSTONE: Capstone = {
  hyvex: ['stm32', 'tb6612fng', 'drv8833', 'metal-disli-dc-motor', 'ch340-usb-seri-cip', 'st-link-j-link-debugger', 'logic-analyzer'],
  deliverables: [
    D(2, ['Öneri ve araç zinciri', 'Gereksinimler (G1–G7), protokol tablosu taslağı; boş projenin CI\'da derlenmesi ve size çıktısı.'], ['Proposal and toolchain', 'Requirements (R1–R7), a draft protocol table; the empty project building in CI with its size output.']),
    D(5, ['PWM katmanı', 'pwm_set_percent(), frekans ayarı ve yön pinleri; mantık analizörüyle ölçülmüş frekans ve görev oranı tablosu.'], ['PWM layer', 'pwm_set_percent(), frequency setting and direction pins; a table of frequency and duty measured with a logic analyser.']),
    D(7, ['UART komut arayüzü', 'Kesmeyle satır okuma ve command() çözümleyici; PlatformIO native ortamında Unity testleri.'], ['UART command interface', 'Line reading with interrupts and the command() parser; Unity tests in the PlatformIO native environment.']),
    D(8, ['Ölçüm ve güvenlik', 'ADC + DMA ile motor akımı (ya da potansiyometre) ölçümü, aşırı akımda durdurma, buton ile acil dur (EXTI).'], ['Measurement and safety', 'Motor current (or potentiometer) measurement with ADC + DMA, stop on over-current, emergency stop with a button (EXTI).']),
    D(11, ['Sistem ve demo', 'FreeRTOS görevleri (motor, komut, izleme) ya da gerekçeli süper döngü; demo videosu ve rapor.'], ['System and demo', 'FreeRTOS tasks (motor, command, monitor) or a justified super-loop; a demo video and a report.']),
  ],
  grading: {
    tr: [['Öneri, gereksinimler, protokol', '%15'], ['PWM ve ölçümler', '%20'], ['UART arayüzü ve testler', '%25'], ['Güvenlik (EXTI, akım, bekçi)', '%15'], ['Sistem, demo ve rapor', '%25']],
    en: [['Proposal, requirements, protocol', '15%'], ['PWM and measurements', '20%'], ['UART interface and tests', '25%'], ['Safety (EXTI, current, watchdog)', '15%'], ['System, demo and report', '25%']],
  },
  tr: {
    title: 'Bitirme projesi: PWM motor sürücü + UART komut arayüzü',
    summary: 'Bir DC motoru 20 kHz PWM ile süren, bilgisayardan seri komutlarla (PWM, DIR, FREQ, START, STOP, STATUS) yönetilen, acil dur butonu ve aşırı akım korumalı bir STM32 sürücü kartı yazılımı.',
    scenario: 'Bir laboratuvar test düzeneğinde motor, Nucleo kartı ve TB6612FNG sürücüsüyle çalışır. Operatör bilgisayarda seri terminal açar: "PWM 40" yazınca motor %40 görevle döner, "STATUS" durumu bildirir. Dönerken yön değiştirme komutu reddedilir. Acil dur butonuna basılınca ya da ölçülen akım eşiği aşınca motor 1 ms içinde durur ve hata kodu gönderilir. 2 s komut gelmezse (bilgisayar bağlantısı koptu) motor yavaşlayarak durur.',
    requirements: [
      'G1: PWM frekansı 20 kHz ± %1, görev oranı %0–100 arasında %1 adımla (mantık analizörüyle ölçülür).',
      'G2: Her komut 10 ms içinde tek satır yanıt alır; hatalı komut ERR ile başlar ve durumu değiştirmez.',
      'G3: Dönerken DIR komutu reddedilir; yön yalnız motor dururken değişir.',
      'G4: Acil dur butonu (EXTI) motoru 1 ms içinde durdurur.',
      'G5: Motor akımı eşik değeri 50 ms boyunca aşarsa motor durur ve "ERR overcurrent" gönderilir.',
      'G6: 2 s komut gelmezse motor rampa ile durur (yazılım bekçisi).',
      'G7: Firmware 64 KB Flash ve 16 KB RAM bütçesine sığar (CI size denetimi).',
    ],
    architecture: [
      'bsp/: saat (84 MHz), GPIO, TIM3 PWM, USART2, ADC1 + DMA, EXTI; donanıma özgü tek katman.',
      'app/command.c: saf komut çözümleyici; HAL yok, bilgisayarda test edilir.',
      'app/motor.c: durum (duty, dir, running), rampa ve güvenlik kuralları; saf mantık.',
      'ISR\'ler yalnız bayrak ve halka tampon doldurur; iş ana döngüde ya da görevlerde yapılır.',
      'İsteğe bağlı FreeRTOS: motor görevi (öncelik 3, 5 ms), komut görevi (2, kuyrukla), izleme görevi (1, 100 ms).',
    ],
    tests: [
      'Birim (native): command() için her komut, sınır değerleri, bilinmeyen komut, uzun satır; motor.c rampa ve güvenlik kuralları.',
      'Benzetim: bu dersteki PWM, UART (Komut sekmesi), NVIC, DMA ve RTOS simülasyonlarında senaryolar.',
      'Donanımda: mantık analizörüyle G1 ve G4 ölçümü; seri terminal betiğiyle G2, G3, G6.',
      'CI: her işlemede derleme, native testler ve size bütçesi (G7).',
    ],
    demo: ['Seri terminalden PWM 0 → 100 taraması ve STATUS.', 'Dönerken DIR R (reddedilir), STOP sonra DIR R.', 'Acil dur butonu ve mantık analizöründe gecikme ölçümü.', 'Bağlantıyı kes: bekçi rampası.'],
  },
  en: {
    title: 'Capstone project: PWM motor driver + UART command interface',
    summary: 'Firmware for an STM32 driver board that drives a DC motor with 20 kHz PWM, is controlled from a PC with serial commands (PWM, DIR, FREQ, START, STOP, STATUS), and has an emergency-stop button and over-current protection.',
    scenario: 'On a lab test rig the motor runs from a Nucleo board and a TB6612FNG driver. The operator opens a serial terminal on the PC: typing "PWM 40" spins the motor at 40 % duty, "STATUS" reports the state. A direction change while running is rejected. When the emergency-stop button is pressed or the measured current exceeds its threshold, the motor stops within 1 ms and an error code is sent. If no command arrives for 2 s (the PC link dropped), the motor ramps down to a stop.',
    requirements: [
      'R1: PWM frequency 20 kHz ± 1 %, duty 0–100 % in 1 % steps (measured with a logic analyser).',
      'R2: Every command gets a one-line reply within 10 ms; an invalid command starts with ERR and does not change the state.',
      'R3: DIR is rejected while running; direction changes only when the motor is stopped.',
      'R4: The emergency-stop button (EXTI) stops the motor within 1 ms.',
      'R5: If the motor current exceeds the threshold for 50 ms, the motor stops and "ERR overcurrent" is sent.',
      'R6: If no command arrives for 2 s, the motor ramps to a stop (software watchdog).',
      'R7: The firmware fits a 64 KB Flash and 16 KB RAM budget (CI size check).',
    ],
    architecture: [
      'bsp/: clock (84 MHz), GPIO, TIM3 PWM, USART2, ADC1 + DMA, EXTI; the single hardware-specific layer.',
      'app/command.c: a pure command parser; no HAL, tested on the PC.',
      'app/motor.c: state (duty, dir, running), ramp and safety rules; pure logic.',
      'ISRs only set flags and fill ring buffers; the work is done in the main loop or tasks.',
      'Optional FreeRTOS: motor task (priority 3, 5 ms), command task (2, via a queue), monitor task (1, 100 ms).',
    ],
    tests: [
      'Unit (native): every command of command(), boundary values, unknown command, long line; motor.c ramp and safety rules.',
      'Simulation: scenarios in this course\'s PWM, UART (Command tab), NVIC, DMA and RTOS simulations.',
      'On hardware: R1 and R4 measured with a logic analyser; R2, R3, R6 with a serial-terminal script.',
      'CI: build, native tests and the size budget (R7) on every commit.',
    ],
    demo: ['A PWM 0 → 100 sweep and STATUS from the serial terminal.', 'DIR R while running (rejected), then STOP and DIR R.', 'The emergency-stop button and the latency measured on the logic analyser.', 'Cut the link: the watchdog ramp.'],
  },
}

export const STM32_COURSE: CourseDef<StmSimId> = {
  slug: 'arm-stm32',
  kit: 'stm32',
  code: 'STM32',
  text: {
    tr: {
      title: 'ARM (STM32) ile Gömülü Programlama',
      short: 'STM32 dersi',
      lede: 'Bir Cortex-M mikrodenetleyicisini yazmaç düzeyinden FreeRTOS\'a kadar öğren: bellek haritası, GPIO, saat ağacı, zamanlayıcı ve PWM, kesmeler, UART, ADC ve DMA, I²C/SPI, düşük güç. Her ünitede yazmaçları ve dalga biçimlerini gösteren bir tarayıcı simülasyonu, kayıt düzeyi ve HAL ile C kodu ve kısa bir test var. Kart olmadan başlanır; Wokwi ve gerçek Nucleo kartıyla tekrarlanır.',
      audience: '16 yaş ve üzeri; meslek lisesi (elektrik-elektronik), üniversite ve meslekten öğrenenler',
      duration: '11 ünite, yaklaşık 47 saat (ders + uygulama)',
      prereq: 'C dilinde temel bilgi (değişken, işaretçi, bit işlemleri) ve Arduino ya da benzeri bir kartla deneyim. Raspberry Pi dersi yardımcıdır ama şart değildir.',
      outcomes: ['Başvuru kılavuzundan yazmaç okuyup bir çevre birimini sıfırdan ayarlamak', 'Aynı işi HAL ve kayıt düzeyiyle yazıp ödünleşimini savunmak', 'Saat ağacını, zamanlayıcıları ve PWM\'i hesapla tasarlamak', 'Kesme öncelikleri ve DMA ile zamanlaması güvenilir firmware yazmak', 'UART, I²C ve SPI\'ı dalga biçimi düzeyinde anlayıp hata ayıklamak', 'FreeRTOS ile çok görevli, test edilmiş bir firmware kurmak'],
      certificate: 'Üniteleri ve bitirme projesini tamamlayanlar Macademia katılım belgesi alır.',
      tools: ['Bu platform: 11 simülasyon (yazmaç görüntüleyici, PLL, PWM, NVIC, UART, DMA, I²C/SPI, güç, FreeRTOS)', 'Wokwi: tarayıcıda STM32 kartları (Nucleo-C031C6, Blue Pill)', 'Gerçek kartla: Nucleo-F401RE ya da F411 Black Pill, ST-LINK, mantık analizörü; STM32CubeIDE ya da PlatformIO'],
    },
    en: {
      title: 'Embedded Programming with ARM (STM32)',
      short: 'STM32 course',
      lede: 'Learn a Cortex-M microcontroller from the register level up to FreeRTOS: memory map, GPIO, clock tree, timers and PWM, interrupts, UART, ADC and DMA, I²C/SPI, low power. Every unit has an in-browser simulation that shows registers and waveforms, C code at register level and with HAL, and a short quiz. You start without a board and repeat it on Wokwi and a real Nucleo board.',
      audience: 'Ages 16 and up; vocational school (electrical-electronics), university and working learners',
      duration: '11 units, about 47 hours (lessons + practice)',
      prereq: 'Basic C (variables, pointers, bit operations) and some experience with an Arduino or similar board. The Raspberry Pi course helps but is not required.',
      outcomes: ['Read registers from the reference manual and set up a peripheral from scratch', 'Write the same job with HAL and at register level and defend the trade-off', 'Design the clock tree, timers and PWM by calculation', 'Write firmware with reliable timing using interrupt priorities and DMA', 'Understand and debug UART, I²C and SPI at the waveform level', 'Build tested, multitasking firmware with FreeRTOS'],
      certificate: 'Learners who complete the units and the capstone receive a Macademia certificate of participation.',
      tools: ['This platform: 11 simulations (register viewer, PLL, PWM, NVIC, UART, DMA, I²C/SPI, power, FreeRTOS)', 'Wokwi: STM32 boards in the browser (Nucleo-C031C6, Blue Pill)', 'With a real board: Nucleo-F401RE or F411 Black Pill, ST-LINK, a logic analyser; STM32CubeIDE or PlatformIO'],
    },
  },
  units: [...UNITS_A, ...UNITS_B],
  sims: STM_SIMS,
  capstone: CAPSTONE,
  starter: (l) => [capstoneParser(l), unityTest(l)],
  related: [
    { href: '/muhendislik/raspberry-pi', tr: 'Raspberry Pi ile Robotik Programlama: Pi + MCU mimarisinin Pi tarafı', en: 'Robotics Programming with Raspberry Pi: the Pi side of a Pi + MCU architecture' },
    { href: '/muhendislik/robotik/hafta/3', tr: 'ESOF 323, 3. hafta: kesmeler, zamanlayıcılar ve veri yolları', en: 'ESOF 323, week 3: interrupts, timers and buses' },
    { href: '/muhendislik/drone/unite/6', tr: 'Drone dersi: uçuş kontrolcüsündeki STM32', en: 'Drone course: the STM32 in the flight controller' },
    { href: '/laboratuvar', tr: 'Devre laboratuvarı: Uno ile PWM, kesme ve seri port', en: 'Circuit lab: PWM, interrupts and serial on the Uno' },
  ],
}

export const stmUnit = (n: number) => STM32_COURSE.units.find((u) => u.n === n)
