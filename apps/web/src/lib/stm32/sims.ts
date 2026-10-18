// ARM (STM32) dersinin tarayıcı simülasyonları: başlık ve açıklamalar (TR/EN). Bileşenler components/gomulu/stm32-sims.tsx.
import type { SimMeta } from '@/lib/gomulu/types'

export type StmSimId = 'memmap' | 'linker' | 'regs' | 'clock' | 'pwm' | 'nvic' | 'uart' | 'dma' | 'bus' | 'power' | 'rtos' | 'board3d'

export const STM_SIMS: SimMeta<StmSimId> = {
  memmap: {
    tr: { title: 'Cortex-M bellek haritası gezgini', desc: '4 GB\'lık adres alanında bir adres yaz ya da bir birime tıkla: hangi bölgede olduğunu, hangi çevre birimine ve yazmaç ofsetine düştüğünü gör. Adresler STM32F4 başvuru kılavuzundaki düzendedir.' },
    en: { title: 'Cortex-M memory map explorer', desc: 'Type an address or click a block in the 4 GB address space: see which region it is in and which peripheral and register offset it lands on. Addresses follow the STM32F4 reference manual.' },
  },
  linker: {
    tr: { title: 'Bağlayıcı (linker) bölümleri: Flash ve RAM bütçesi', desc: '.text, .rodata, .data, .bss, yığın ve öbek boyutlarını değiştir; Flash ve RAM doluluğunu gör. .data neden iki kez sayılır, printf ve float neden Flash\'ı şişirir?' },
    en: { title: 'Linker sections: Flash and RAM budget', desc: 'Change the sizes of .text, .rodata, .data, .bss, stack and heap and see Flash and RAM usage. Why is .data counted twice, and why do printf and float bloat Flash?' },
  },
  regs: {
    tr: { title: 'GPIO yazmaç görüntüleyici: MODER, OTYPER, PUPDR, ODR, IDR', desc: 'Bitlere tıklayarak PA5\'i (Nucleo LED\'i) ve PC13\'ü (kullanıcı butonu) yapılandır. Sanal pin seviyesi, IDR okuması ve aynı işi yapan kayıt düzeyi ile HAL C kodu birlikte değişir. BSRR yazmasını ve kısa devreyi dene.' },
    en: { title: 'GPIO register viewer: MODER, OTYPER, PUPDR, ODR, IDR', desc: 'Click bits to configure PA5 (the Nucleo LED) and PC13 (the user button). The virtual pin level, the IDR reading and the equivalent register-level and HAL C code change together. Try a BSRR write and a short circuit.' },
  },
  clock: {
    tr: { title: 'RCC saat ağacı ve PLL hesaplayıcı', desc: 'HSI ya da HSE, PLLM/N/P/Q ve AHB/APB bölücülerini seç. SYSCLK, APB1/APB2, zamanlayıcı saatleri, USB 48 MHz ve Flash bekleme durumu hesaplanır; sınır aşımları kırmızı yanar.' },
    en: { title: 'RCC clock tree and PLL calculator', desc: 'Pick HSI or HSE, PLLM/N/P/Q and the AHB/APB dividers. SYSCLK, APB1/APB2, timer clocks, USB 48 MHz and Flash wait states are computed; limit violations light up red.' },
  },
  pwm: {
    tr: { title: 'Zamanlayıcı ve PWM: PSC/ARR/CCR hesaplayıcı', desc: 'Sayaç (CNT) testere dişi biçiminde sayar, CCR ile karşılaştırılır, çıkış PWM olur. İstenen frekansı yaz, çözücü 16 bit sınırında PSC ve ARR\'yi bulsun; görev oranını ve çözünürlüğü izle.' },
    en: { title: 'Timer and PWM: PSC/ARR/CCR calculator', desc: 'The counter (CNT) ramps like a sawtooth, is compared with CCR, and the output becomes PWM. Type the target frequency and let the solver find PSC and ARR within 16 bits; watch the duty cycle and resolution.' },
  },
  nvic: {
    tr: { title: 'EXTI ve NVIC: kesme zaman çizelgesi', desc: 'Üç kesmenin önceliğini ve süresini ayarla, istek anlarını değiştir. Zaman çizelgesi öncelikli kesmeyi (iç içe), bekleyen istekleri, kuyruk zincirlemeyi ve kaybolan ikinci isteği gösterir. EXTI hat çakışmasını da dene.' },
    en: { title: 'EXTI and NVIC: interrupt timeline', desc: 'Set the priority and duration of three interrupts and move their request times. The timeline shows preemption (nesting), pending requests, tail-chaining and a lost second request. Try an EXTI line clash too.' },
  },
  uart: {
    tr: { title: 'UART çerçeve görselleştirici ve BRR', desc: 'Bir metin yaz: her karakter start biti, LSB önce 8 veri biti, isteğe bağlı parite ve stop bitine dönüşür. Baud, parite ve stop bitini değiştir, bir biti boz ve alıcının çerçeve (FE) ya da parite (PE) hatasını gör. BRR ve baud hatası hesaplanır.' },
    en: { title: 'UART frame visualiser and BRR', desc: 'Type some text: each character becomes a start bit, 8 data bits LSB first, an optional parity bit and stop bits. Change baud, parity and stop bits, corrupt a bit and see the receiver\'s framing (FE) or parity (PE) error. BRR and the baud error are computed.' },
  },
  dma: {
    tr: { title: 'ADC + DMA: dairesel tampon ve yarım/tam aktarım', desc: 'ADC her dönüşümde DMA ile tampona yazar. Yarım (HT) ve tam (TC) aktarım kesmelerinde işlemci bitmiş yarıyı işler. İşleme süresini uzat ve taşmanın (overrun) nerede başladığını gör.' },
    en: { title: 'ADC + DMA: circular buffer and half/full transfer', desc: 'The ADC writes each conversion into a buffer through DMA. On the half (HT) and full (TC) transfer interrupts the CPU processes the finished half. Lengthen the processing time and see where overrun begins.' },
  },
  bus: {
    tr: { title: 'I²C ve SPI zamanlama diyagramları', desc: 'I²C\'de adres, R/W, veri baytları ve cihaz yokken NACK; SDA\'nın yalnız SCL düşükken değiştiğini izle. SPI\'da dört kipi (CPOL/CPHA) karşılaştır ve kip uyuşmazlığının okunan baytı nasıl bozduğunu gör.' },
    en: { title: 'I²C and SPI timing diagrams', desc: 'In I²C follow the address, R/W, data bytes and NACK when no device answers; watch SDA change only while SCL is low. In SPI compare the four modes (CPOL/CPHA) and see how a mode mismatch corrupts the byte read.' },
  },
  power: {
    tr: { title: 'Düşük güç kipleri ve pil ömrü', desc: 'Run, Sleep, Stop ve Standby arasında seç; görev döngüsünü (ne sıklıkla, ne kadar uyanık) ayarla ve ortalama akımla pil ömrünü hesapla. Akımlar ders içi tipik değerlerdir, gerçek değer veri sayfasındadır.' },
    en: { title: 'Low-power modes and battery life', desc: 'Choose between Run, Sleep, Stop and Standby; set the duty cycle (how often, how long awake) and compute battery life from the average current. Currents are typical course values; the real ones are in the datasheet.' },
  },
  rtos: {
    tr: { title: 'FreeRTOS zamanlayıcı görselleştirici', desc: 'Görevlerin önceliğini, periyodunu ve süresini ayarla; tick tick hangi görevin çalıştığını, kesintiyi, eşit öncelikte zaman dilimlemeyi ve kaçan son tarihleri gör. Paylaşılan mutex ile öncelik tersine dönmesini ve öncelik kalıtımını dene.' },
    en: { title: 'FreeRTOS scheduler visualiser', desc: 'Set each task\'s priority, period and run time; see tick by tick which task runs, preemption, time slicing at equal priority and missed deadlines. Try priority inversion with a shared mutex and priority inheritance.' },
  },
  board3d: {
    tr: { title: '3B STM32 geliştirme kartı', desc: 'Nucleo benzeri kart 3B masada: GPIOA saatini aç, PA5\'i MODER ile çıkış yap ve BSRR yaz; başlık pinleri ve LD2 anında değişir. TIM3 PWM\'i açınca motor görev oranına göre döner, kartın üstünde zamanlayıcı dalgası görünür. Sürükleyerek döndür, iki parmakla yakınlaştır. Durum testli saf mantıktan gelir.' },
    en: { title: '3D STM32 development board', desc: 'A Nucleo-like board on a 3D desk: enable the GPIOA clock, make PA5 an output with MODER and write BSRR; the header pins and LD2 change at once. Turn on TIM3 PWM and the motor spins with the duty cycle while the timer waveform floats above the board. Drag to orbit, pinch to zoom. The state comes from tested pure logic.' },
  },
}
