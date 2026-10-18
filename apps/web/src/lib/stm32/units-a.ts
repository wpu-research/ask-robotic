// ARM (STM32) dersi üniteleri 1–6: Cortex-M ve bellek haritası, araç zinciri, GPIO, RCC, zamanlayıcı/PWM, kesmeler.
// HTML iki dilde aynı etiket dizisinde. Wokwi ipuçları yalnız Wokwi'nin kendi adresini verir (uydurma proje kimliği yok).
import type { CourseUnit, WokwiTask } from '@/lib/gomulu/types'
import { blinkHal, blinkReg, clockHal, extiHal, pioIni, pwmHal, pwmReg, vectorC } from './code'
import type { StmSimId } from './sims'

const wokwi = (tr: string[], en: string[]): WokwiTask => ({ board: 'STM32 (Wokwi)', url: 'https://wokwi.com', tr, en })

export const UNITS_A: CourseUnit<StmSimId>[] = [
  {
    n: 1, hours: 3, sims: ['memmap'], hyvex: ['stm32', 'arduino-uno-atmega328p', 'st-link-j-link-debugger'], esofWeek: 2,
    tr: {
      title: 'Cortex-M mimarisi ve bellek haritası',
      summary: 'ARM çekirdeği, STM32 aileleri, Harvard veri yolları ve her şeyin bir adres olduğu 4 GB\'lık harita.',
      goals: ['Cortex-M0+, M3, M4 ve M7 çekirdeklerini ve STM32 ailelerini (C0, F1, F4, G4, H7) ayırt etmek', 'Flash, SRAM, çevre birimi ve sistem bölgelerini adres haritasında bulmak', 'Bir çevre birimi yazmacının adresini taban + ofsetten hesaplamak', 'Açılışta vektör tablosunun ve Reset_Handler\'ın rolünü açıklamak'],
      notes: `<p>ARM, işlemci çekirdeğini tasarlar ve lisanslar; ST gibi üreticiler bu çekirdeğin çevresine bellek ve çevre birimleri koyup <b>STM32</b> gibi mikrodenetleyiciler üretir. Cortex-M ailesi gömülü sistemler içindir: M0+ küçük ve az güç çeker, M4 kayan nokta birimi (FPU) ve DSP komutları ekler, M7 daha hızlı ve önbelleklidir.</p>
<h3>Her şey bir adres</h3>
<p>Cortex-M 32 bitlik bir adres alanı görür (4 GB). Haritanın düzeni sabittir: <b>0x0800_0000</b>\'da Flash, <b>0x2000_0000</b>\'da SRAM, <b>0x4000_0000</b>\'dan itibaren çevre birimleri, <b>0xE000_0000</b>\'da çekirdeğin kendi birimleri (NVIC, SysTick). Bir LED\'i yakmak, aslında belirli bir adrese bir sayı yazmaktır: STM32F4\'te GPIOA tabanı 0x4002_0000, ODR yazmacının ofseti 0x14, yani adres 0x4002_0014.</p>
<div class="eq">adres = taban + ofset &nbsp;→&nbsp; GPIOA→ODR = 0x4002_0000 + 0x14</div>
<h3>Açılış</h3>
<p>Elektrik gelince çekirdek Flash\'ın ilk iki kelimesini okur: yığının tepe adresi ve <code>Reset_Handler</code> adresi. Reset_Handler, ilk değerli değişkenleri (.data) Flash\'tan RAM\'e kopyalar, sıfır değerlileri (.bss) temizler ve <code>main()</code>\'i çağırır. İşletim sistemi yoktur; main hiç dönmemelidir.</p>
<p>Bu derste STM32F4 (Nucleo-F401RE ya da F411 "Black Pill") temel alınır. Adresler ailelere göre değişir ama düşünce aynıdır: başvuru kılavuzu (Reference Manual) her yazmacın adresini ve bitlerini verir.</p>`,
      code: [vectorC('tr')],
      tryIt: 'Bellek haritasında 0x4002_0014, 0x2000_0400 ve 0xE000_E100 adreslerini yaz: her biri hangi bölge ve birim? GPIOB\'nin IDR yazmacının adresini hesapla ve doğrula. Sonra RCC\'ye tıkla ve AHB1ENR\'nin (ofset 0x30) adresini not et: GPIO saatini açmak için bu adrese yazacağız.',
      pitfalls: ['Adresleri farklı aileler arasında aynı sanmak: STM32F1\'de GPIO tabanı ve yazmaç düzeni farklıdır; her zaman kendi kartının başvuru kılavuzuna bak.', 'Veri sayfası ile başvuru kılavuzunu karıştırmak: veri sayfası pin ve elektrik değerlerini, başvuru kılavuzu yazmaçları anlatır.', 'main()\'den dönmek: dönülecek bir işletim sistemi yoktur; sonsuz döngü şarttır.', 'Yığın boyutunu hesaba katmamak: yığın taşınca .bss değişkenlerinin üzerine yazar ve hata tuhaf yerlerde görünür.'],
      se: `<p>Gömülü yazılımda <b>belgelere izlenebilirlik</b> önemlidir: her yazmaç erişiminin yanına başvuru kılavuzunun bölüm numarasını yaz.</p>
<ul><li>Sihirli sayılar yerine CMSIS başlıklarındaki adlar (GPIOA->ODR, RCC_AHB1ENR_GPIOAEN) kullan.</li><li>Kartı ve aileyi değiştirmeyi kolaylaştırmak için donanıma özgü kodu ayrı dosyada (bsp/) topla.</li></ul>`,
      quiz: [
        { q: 'STM32F4\'te Flash hangi adresten başlar?', options: ['0x0000_0000 dışında hiçbir yer', '0x0800_0000', '0x2000_0000', '0x4000_0000'], answer: 1, why: 'Flash 0x0800_0000\'dadır; açılışta 0x0000_0000\'a da eşlenir.' },
        { q: 'GPIOA tabanı 0x4002_0000, ODR ofseti 0x14. ODR adresi?', options: ['0x4002_0014', '0x4002_1400', '0x0800_0014', '0x2000_0014'], answer: 0, why: 'Taban + ofset = 0x4002_0014.' },
        { q: 'Reset_Handler main()\'den önce ne yapar?', options: ['Wi-Fi\'ye bağlanır', '.data\'yı Flash\'tan RAM\'e kopyalar ve .bss\'i sıfırlar', 'İşletim sistemini yükler', 'LED\'i yakar'], answer: 1, why: 'C değişkenlerinin ilk değerleri bu adımda hazırlanır.' },
        { q: 'Kayan nokta birimi (FPU) hangi çekirdekte vardır?', options: ['Cortex-M0+', 'Cortex-M3', 'Cortex-M4F', 'Hiçbirinde'], answer: 2, why: 'M4F (ve M7) tek duyarlıklı FPU içerir; M0+ ve M3\'te kayan nokta yazılımla yapılır.' },
      ],
    },
    en: {
      title: 'Cortex-M architecture and the memory map',
      summary: 'The ARM core, STM32 families, Harvard buses and the 4 GB map where everything is an address.',
      goals: ['Tell the Cortex-M0+, M3, M4 and M7 cores and STM32 families (C0, F1, F4, G4, H7) apart', 'Find the Flash, SRAM, peripheral and system regions in the address map', 'Compute a peripheral register address from base + offset', 'Explain the role of the vector table and Reset_Handler at boot'],
      notes: `<p>ARM designs and licenses the processor core; manufacturers such as ST put memory and peripherals around that core and make microcontrollers such as <b>STM32</b>. The Cortex-M family is for embedded systems: the M0+ is small and frugal, the M4 adds a floating-point unit (FPU) and DSP instructions, the M7 is faster and has caches.</p>
<h3>Everything is an address</h3>
<p>A Cortex-M sees a 32-bit address space (4 GB). The layout of the map is fixed: Flash at <b>0x0800_0000</b>, SRAM at <b>0x2000_0000</b>, peripherals from <b>0x4000_0000</b>, the core\'s own blocks (NVIC, SysTick) at <b>0xE000_0000</b>. Lighting an LED is really writing a number to a particular address: on the STM32F4 the GPIOA base is 0x4002_0000 and the ODR register offset is 0x14, so the address is 0x4002_0014.</p>
<div class="eq">address = base + offset &nbsp;→&nbsp; GPIOA→ODR = 0x4002_0000 + 0x14</div>
<h3>Boot</h3>
<p>When power arrives the core reads the first two words of Flash: the top-of-stack address and the address of <code>Reset_Handler</code>. Reset_Handler copies initialised variables (.data) from Flash to RAM, clears zero-initialised ones (.bss) and calls <code>main()</code>. There is no operating system; main must never return.</p>
<p>This course is based on the STM32F4 (Nucleo-F401RE or the F411 "Black Pill"). Addresses differ between families but the idea is the same: the reference manual gives every register\'s address and bits.</p>`,
      code: [vectorC('en')],
      tryIt: 'In the memory map type the addresses 0x4002_0014, 0x2000_0400 and 0xE000_E100: which region and block is each? Compute the address of GPIOB\'s IDR register and check it. Then click RCC and note the address of AHB1ENR (offset 0x30): this is where we will write to turn on the GPIO clock.',
      pitfalls: ['Assuming addresses are the same across families: on the STM32F1 the GPIO base and register layout differ; always check your own board\'s reference manual.', 'Confusing the datasheet with the reference manual: the datasheet covers pins and electrical values, the reference manual the registers.', 'Returning from main(): there is no operating system to return to; an endless loop is required.', 'Ignoring stack size: when the stack overflows it overwrites .bss variables and the bug shows up in odd places.'],
      se: `<p>In embedded software <b>traceability to the documents</b> matters: write the reference-manual section number next to every register access.</p>
<ul><li>Use the names from the CMSIS headers (GPIOA->ODR, RCC_AHB1ENR_GPIOAEN) instead of magic numbers.</li><li>Keep board-specific code in a separate folder (bsp/) to make changing boards and families easy.</li></ul>`,
      quiz: [
        { q: 'Where does Flash start on an STM32F4?', options: ['Nowhere except 0x0000_0000', '0x0800_0000', '0x2000_0000', '0x4000_0000'], answer: 1, why: 'Flash is at 0x0800_0000; at boot it is also aliased to 0x0000_0000.' },
        { q: 'GPIOA base 0x4002_0000, ODR offset 0x14. ODR address?', options: ['0x4002_0014', '0x4002_1400', '0x0800_0014', '0x2000_0014'], answer: 0, why: 'Base + offset = 0x4002_0014.' },
        { q: 'What does Reset_Handler do before main()?', options: ['Connects to Wi-Fi', 'Copies .data from Flash to RAM and zeroes .bss', 'Loads the operating system', 'Lights the LED'], answer: 1, why: 'This is where the initial values of C variables are prepared.' },
        { q: 'Which core has a floating-point unit (FPU)?', options: ['Cortex-M0+', 'Cortex-M3', 'Cortex-M4F', 'None of them'], answer: 2, why: 'The M4F (and M7) include a single-precision FPU; on the M0+ and M3 floating point is done in software.' },
      ],
    },
  },
  {
    n: 2, hours: 4, sims: ['linker'], hyvex: ['stm32', 'st-link-j-link-debugger'],
    tr: {
      title: 'Araç zinciri: derleme, bağlama, yükleme, hata ayıklama',
      summary: 'STM32CubeIDE ve PlatformIO, GCC ve bağlayıcı betiği, .elf/.bin, ST-LINK ve SWD ile adım adım hata ayıklama.',
      goals: ['Kaynaktan çalışan koda giden zinciri (ön işlemci, derleyici, bağlayıcı, objcopy, yükleyici) açıklamak', 'STM32CubeIDE ve PlatformIO ile proje kurmak; CubeMX\'in ürettiği kodun nereye yazılacağını bilmek', 'Bağlayıcı bölümlerini (.text, .rodata, .data, .bss) ve Flash/RAM bütçesini okumak', 'ST-LINK ve SWD ile kesme noktası koyup yazmaç ve değişken izlemek'],
      notes: `<p>Bilgisayarında yazdığın C kodu, başka bir işlemci (ARM) için derlenir: buna <b>çapraz derleme</b> denir. Araç zinciri <code>arm-none-eabi-gcc</code>\'dir.</p>
<ul><li><b>Derleyici</b>: her .c dosyasını makine kodlu .o dosyasına çevirir.</li><li><b>Bağlayıcı</b>: .o dosyalarını ve kütüphaneleri birleştirir; bağlayıcı betiği (.ld) hangi bölümün Flash\'a, hangisinin RAM\'e gideceğini söyler. Sonuç .elf\'tir (hata ayıklama bilgisiyle).</li><li><b>objcopy</b>: .elf\'ten karta yazılacak saf .bin ya da .hex çıkarır.</li><li><b>Yükleyici</b>: ST-LINK, SWD hattı (SWDIO, SWCLK) üzerinden Flash\'a yazar.</li></ul>
<h3>İki yol</h3>
<p><b>STM32CubeIDE</b>, ST\'nin ücretsiz ortamıdır: CubeMX ile pinleri ve saatleri grafik olarak ayarlarsın, başlangıç kodu üretilir. Kendi kodunu yalnız <code>/* USER CODE BEGIN */</code> ile <code>/* USER CODE END */</code> arasına yaz; yeniden üretimde gerisi silinir. <b>PlatformIO</b> (VS Code eklentisi) aynı HAL\'i kullanır, tek bir <code>platformio.ini</code> ile yapılandırılır, komut satırından derlenir ve CI\'da kolay çalışır.</p>
<h3>Bellek bütçesi</h3>
<p>Derleme sonunda <code>arm-none-eabi-size</code> dört sayı verir: text, data, bss. Flash = text + rodata + data (ilk değerler Flash\'ta saklanır), RAM = data + bss + yığın + öbek. Tek bir <code>printf("%f")</code> onlarca kilobayt ekleyebilir; küçük kartlarda bu fark edilir.</p>`,
      code: [pioIni('tr')],
      tryIt: 'Bağlayıcı simülasyonunda F401RE (512 KB Flash, 96 KB RAM) ve F030 (16 KB Flash, 4 KB RAM) hedeflerini karşılaştır. "printf + float" seçeneğini aç: hangi kartta sığmıyor? Büyük bir başlangıç değerli dizi (.data) ile sıfır dizi (.bss) arasındaki farkı Flash sütununda gör. Gerçek kartla: PlatformIO\'da boş proje derle, size çıktısını not et.',
      pitfalls: ['CubeMX kodunu USER CODE blokları dışında değiştirmek: yeniden üretimde kaybolur.', 'Hata ayıklamayı -O2 ile yapmak: değişkenler "optimized out" görünür; hata ayıklarken -Og kullan.', 'SWD pinlerini (PA13, PA14) GPIO olarak kullanmak: kart bir daha yüklenemez gibi görünür; reset tuşlu bağlanmayla kurtarılır.', 'Yığın boyutunu varsayılanda bırakıp büyük yerel diziler kullanmak.'],
      se: `<p>Derlemeyi <b>tekrarlanabilir</b> yap: aynı kaynak, aynı araç sürümü, aynı ikili.</p>
<ul><li>platformio.ini ya da CMake dosyası depoda; araç sürümü sabit.</li><li>CI her işlemede derler, size çıktısını kaydeder ve Flash/RAM bütçesi aşılırsa uyarır.</li><li>Donanımsız mantık için <code>pio test -e native</code>: testler bilgisayarda koşar.</li></ul>`,
      quiz: [
        { q: 'Bağlayıcı betiğinin (.ld) görevi nedir?', options: ['Kodu biçimlendirmek', 'Bölümlerin Flash ve RAM\'de nereye yerleşeceğini belirlemek', 'Kartı yüklemek', 'Kesmeleri açmak'], answer: 1, why: 'Bellek bölgelerini ve bölümlerin yerleşimini tanımlar.' },
        { q: 'Başlangıç değerli küresel değişkenler (.data) nerede yer kaplar?', options: ['Yalnız RAM', 'Yalnız Flash', 'Hem Flash (ilk değer) hem RAM (çalışırken)', 'Hiçbir yerde'], answer: 2, why: 'İlk değerler Flash\'ta saklanır, açılışta RAM\'e kopyalanır.' },
        { q: 'CubeMX projesinde kendi kodun nereye yazılmalı?', options: ['Her yere', 'USER CODE BEGIN/END blokları arasına', 'Yalnız main.h\'ye', 'Ayrı bir projeye'], answer: 1, why: 'Yeniden üretim yalnız bu blokları korur.' },
        { q: 'ST-LINK kartla hangi hat üzerinden konuşur?', options: ['I²C', 'SWD (SWDIO, SWCLK)', 'CAN', 'USB HID'], answer: 1, why: 'Serial Wire Debug iki hatla yükleme ve hata ayıklama sağlar.' },
      ],
    },
    en: {
      title: 'The toolchain: compile, link, flash, debug',
      summary: 'STM32CubeIDE and PlatformIO, GCC and the linker script, .elf/.bin, step-by-step debugging with ST-LINK and SWD.',
      goals: ['Explain the chain from source to running code (preprocessor, compiler, linker, objcopy, flasher)', 'Set up a project with STM32CubeIDE and PlatformIO and know where to write code in a CubeMX-generated project', 'Read linker sections (.text, .rodata, .data, .bss) and the Flash/RAM budget', 'Set breakpoints and watch registers and variables with ST-LINK and SWD'],
      notes: `<p>The C code you write on your computer is compiled for another processor (ARM): this is called <b>cross-compiling</b>. The toolchain is <code>arm-none-eabi-gcc</code>.</p>
<ul><li><b>Compiler</b>: turns each .c file into a .o file of machine code.</li><li><b>Linker</b>: combines the .o files and libraries; the linker script (.ld) says which section goes to Flash and which to RAM. The result is an .elf (with debug information).</li><li><b>objcopy</b>: extracts the plain .bin or .hex to write to the board from the .elf.</li><li><b>Flasher</b>: the ST-LINK writes to Flash over the SWD lines (SWDIO, SWCLK).</li></ul>
<h3>Two routes</h3>
<p><b>STM32CubeIDE</b> is ST\'s free environment: you set pins and clocks graphically with CubeMX and starter code is generated. Write your own code only between <code>/* USER CODE BEGIN */</code> and <code>/* USER CODE END */</code>; the rest is wiped on regeneration. <b>PlatformIO</b> (a VS Code extension) uses the same HAL, is configured with a single <code>platformio.ini</code>, builds from the command line and runs easily in CI.</p>
<h3>Memory budget</h3>
<p>At the end of a build <code>arm-none-eabi-size</code> gives the numbers: text, data, bss. Flash = text + rodata + data (initial values are stored in Flash), RAM = data + bss + stack + heap. A single <code>printf("%f")</code> can add tens of kilobytes; on small boards you notice.</p>`,
      code: [pioIni('en')],
      tryIt: 'In the linker simulation compare the F401RE (512 KB Flash, 96 KB RAM) and F030 (16 KB Flash, 4 KB RAM) targets. Turn on "printf + float": which board no longer fits? See the difference in the Flash column between a large initialised array (.data) and a zero array (.bss). With a real board: build an empty project in PlatformIO and note the size output.',
      pitfalls: ['Changing CubeMX code outside the USER CODE blocks: it is lost on regeneration.', 'Debugging at -O2: variables show as "optimized out"; use -Og while debugging.', 'Using the SWD pins (PA13, PA14) as GPIO: the board then seems impossible to flash; recover by connecting under reset.', 'Leaving the stack size at its default and using large local arrays.'],
      se: `<p>Make the build <b>reproducible</b>: same source, same tool version, same binary.</p>
<ul><li>platformio.ini or the CMake file is in the repository; the tool version is pinned.</li><li>CI builds every commit, records the size output and warns if the Flash/RAM budget is exceeded.</li><li>For hardware-free logic, <code>pio test -e native</code>: tests run on the PC.</li></ul>`,
      quiz: [
        { q: 'What is the job of the linker script (.ld)?', options: ['Formatting the code', 'Deciding where sections are placed in Flash and RAM', 'Flashing the board', 'Enabling interrupts'], answer: 1, why: 'It defines the memory regions and the placement of sections.' },
        { q: 'Where do initialised global variables (.data) take space?', options: ['Only RAM', 'Only Flash', 'Both Flash (initial value) and RAM (at run time)', 'Nowhere'], answer: 2, why: 'Initial values are stored in Flash and copied to RAM at boot.' },
        { q: 'Where should your own code go in a CubeMX project?', options: ['Anywhere', 'Between the USER CODE BEGIN/END blocks', 'Only in main.h', 'In a separate project'], answer: 1, why: 'Regeneration preserves only these blocks.' },
        { q: 'Over which lines does the ST-LINK talk to the board?', options: ['I²C', 'SWD (SWDIO, SWCLK)', 'CAN', 'USB HID'], answer: 1, why: 'Serial Wire Debug provides flashing and debugging over two lines.' },
      ],
    },
  },
  {
    n: 3, hours: 5, sims: ['regs'], hyvex: ['stm32', 'led', 'buton-anahtar', 'direnc'], esofWeek: 2,
    wokwi: wokwi(
      ['Wokwi\'de yeni bir proje aç ve kart olarak Nucleo-C031C6\'yı seç (STM32C0 de MODER/ODR/IDR düzenini kullanır; taban adresleri farklıdır).', 'LED\'i ve butonu bağla; önce HAL_GPIO_WritePin ile, sonra BSRR yazmacıyla yak.', 'Blue Pill (STM32F103) seçersen GPIO\'nun CRL/CRH yazmaçlarıyla ayarlandığını gör: aileler arasındaki farkın canlı örneği.'],
      ['Open a new project on Wokwi and pick the Nucleo-C031C6 board (STM32C0 uses the same MODER/ODR/IDR layout; base addresses differ).', 'Wire an LED and a button; light it first with HAL_GPIO_WritePin, then with the BSRR register.', 'If you pick the Blue Pill (STM32F103), see that GPIO is configured with the CRL/CRH registers: a live example of family differences.'],
    ),
    tr: {
      title: 'GPIO: yazmaçlarla ve HAL ile',
      summary: 'Saat açma, MODER/OTYPER/PUPDR ile yapılandırma, ODR/IDR ile yazma-okuma, BSRR\'nin atomikliği ve HAL karşılıkları.',
      goals: ['Bir GPIO portunu kullanmadan önce RCC\'den saatini açmak', 'MODER, OTYPER ve PUPDR bitleriyle pini giriş, çıkış, alternatif işlev ya da analog yapmak', 'ODR, IDR ve BSRR ile pin yazmak ve okumak; oku-değiştir-yaz yarışını açıklamak', 'Aynı işi HAL ile yazıp kayıt düzeyiyle karşılaştırmak'],
      notes: `<p>STM32\'de her GPIO portu (GPIOA, GPIOB…) 16 pinlik bir yazmaç kümesidir. Kullanmadan önce <b>saatini açmak</b> gerekir: <code>RCC->AHB1ENR |= RCC_AHB1ENR_GPIOAEN</code>. Saat kapalıyken yazmaçlara yazılan her şey yok sayılır; bu, yeni başlayanın ilk hatasıdır.</p>
<h3>Yapılandırma yazmaçları</h3>
<ul><li><b>MODER</b>: pin başına 2 bit. 00 giriş, 01 çıkış, 10 alternatif işlev (UART, PWM), 11 analog (ADC).</li><li><b>OTYPER</b>: pin başına 1 bit. 0 push-pull (1\'i de 0\'ı da sürer), 1 open-drain (yalnız 0\'a çeker; I²C gibi).</li><li><b>PUPDR</b>: pin başına 2 bit. 00 yok, 01 pull-up, 10 pull-down.</li></ul>
<h3>Veri yazmaçları</h3>
<p><b>IDR</b> pinlerin o anki seviyesini okur. <b>ODR</b> çıkış değerini tutar. <code>GPIOA->ODR |= 1 << 5</code> bir <i>oku-değiştir-yaz</i> işlemidir: okuma ile yazma arasında bir kesme aynı portun başka bir bitini değiştirirse o değişiklik silinir. <b>BSRR</b> bu sorunu çözer: alt 16 bite yazılan 1 o pini set eder, üst 16 bite yazılan 1 reset eder; tek yazmadır, araya bir şey giremez.</p>
<div class="eq">PA5 çıkış: MODER[11:10] = 01 &nbsp; PA5 = 1: BSRR = 1 &lt;&lt; 5 &nbsp; PA5 = 0: BSRR = 1 &lt;&lt; 21</div>
<h3>HAL</h3>
<p>HAL (Hardware Abstraction Layer) aynı işi <code>HAL_GPIO_Init</code>, <code>HAL_GPIO_WritePin</code>, <code>HAL_GPIO_ReadPin</code> ile yapar: okunaklı ve ailelerarası taşınabilir, biraz daha yavaş ve büyük. Gerçek projelerde çoğunlukla HAL kullanılır; yazmaçları bilmek ise hata ayıklarken ve zamanlamanın kritik olduğu yerde işe yarar.</p>`,
      code: [blinkReg('tr'), blinkHal('tr')],
      tryIt: 'Yazmaç görüntüleyicide PA5\'i çıkış yap (MODER bitleri 01) ve ODR\'nin 5. bitine tıkla: LED yanıyor mu? Saat kapalıyken aynı şeyi dene. PC13\'ü pull-up\'sız giriş yap ve butonu bırak: IDR neden titriyor? Pull-up aç. Son olarak PA5\'i push-pull 1 sürerken "dışarıdan GND\'ye çek" seçeneğini aç ve kısa devre uyarısını oku; open-drain\'e geçince ne değişiyor?',
      pitfalls: ['GPIO saatini açmayı unutmak: yazmaçlar hiç değişmez, kod "çalışmıyor" gibi görünür.', 'MODER\'i |= ile ayarlamak: önceki 2 bit temizlenmezse 01 | 10 = 11 (analog) olur. Önce maskele, sonra yaz.', 'ODR\'ye kesme ve ana döngüden birlikte |= ile yazmak: yarış durumu. BSRR kullan.', 'Nucleo butonunun basılıyken 0 okunduğunu unutmak (dış pull-up\'lı, GND\'ye çeker).'],
      se: `<p>Bit işlemlerini adlandırılmış küçük fonksiyonlara sar: <code>gpio_set_mode(GPIOA, 5, MODE_OUTPUT)</code>.</p>
<ul><li>Bu fonksiyonlar bir yazmaç yapısı üzerinde çalışırsa (gerçek adres yerine sahte struct), <b>bilgisayarda birim testi</b> yapılabilir: bu simülasyondaki gibi.</li><li>HAL mı yazmaç mı kararını kod incelemesinde gerekçesiyle yaz.</li></ul>`,
      quiz: [
        { q: 'PA5\'i genel amaçlı çıkış yapmak için MODER\'in hangi bitlerine ne yazılır?', options: ['Bit 5\'e 1', 'Bit 11:10\'a 01', 'Bit 11:10\'a 10', 'Bit 5:4\'e 11'], answer: 1, why: 'Pin başına 2 bit: pin 5 için bit 11 ve 10; 01 çıkıştır.' },
        { q: 'BSRR = 1 << 21 ne yapar?', options: ['PA5\'i 1 yapar', 'PA5\'i 0 yapar', 'PA21\'i 1 yapar', 'Hiçbir şey'], answer: 1, why: 'Üst 16 bit reset alanıdır: 21 − 16 = 5. pin sıfırlanır.' },
        { q: 'ODR |= ... yerine BSRR neden tercih edilir?', options: ['Daha az bellek kullanır', 'Tek yazmalık atomik işlemdir; kesmeyle yarış olmaz', 'Daha parlak LED', 'HAL bunu zorunlu kılar'], answer: 1, why: 'Oku-değiştir-yaz arasında araya giren kesmenin değişikliği silinmez.' },
        { q: 'Open-drain çıkışa 1 yazılınca pin ne olur (pull-up yoksa)?', options: ['3,3 V', '0 V', 'Yüzer (tanımsız)', '5 V'], answer: 2, why: 'Open-drain yalnız 0\'a çeker; 1\'de pin bırakılır, seviyeyi pull-up belirler.' },
      ],
    },
    en: {
      title: 'GPIO: with registers and with HAL',
      summary: 'Enabling the clock, configuring with MODER/OTYPER/PUPDR, writing and reading with ODR/IDR, the atomicity of BSRR and the HAL equivalents.',
      goals: ['Enable a GPIO port\'s clock from RCC before using it', 'Make a pin input, output, alternate function or analog with the MODER, OTYPER and PUPDR bits', 'Write and read pins with ODR, IDR and BSRR, and explain the read-modify-write race', 'Write the same job with HAL and compare it with register-level code'],
      notes: `<p>On an STM32 each GPIO port (GPIOA, GPIOB…) is a set of registers for 16 pins. Before using one you must <b>enable its clock</b>: <code>RCC->AHB1ENR |= RCC_AHB1ENR_GPIOAEN</code>. With the clock off, everything written to the registers is ignored; this is the beginner\'s first bug.</p>
<h3>Configuration registers</h3>
<ul><li><b>MODER</b>: 2 bits per pin. 00 input, 01 output, 10 alternate function (UART, PWM), 11 analog (ADC).</li><li><b>OTYPER</b>: 1 bit per pin. 0 push-pull (drives both 1 and 0), 1 open-drain (only pulls to 0; like I²C).</li><li><b>PUPDR</b>: 2 bits per pin. 00 none, 01 pull-up, 10 pull-down.</li></ul>
<h3>Data registers</h3>
<p><b>IDR</b> reads the current level of the pins. <b>ODR</b> holds the output value. <code>GPIOA->ODR |= 1 << 5</code> is a <i>read-modify-write</i>: if an interrupt changes another bit of the same port between the read and the write, that change is lost. <b>BSRR</b> solves this: a 1 written to the lower 16 bits sets that pin, a 1 written to the upper 16 bits resets it; it is a single write and nothing can get in between.</p>
<div class="eq">PA5 output: MODER[11:10] = 01 &nbsp; PA5 = 1: BSRR = 1 &lt;&lt; 5 &nbsp; PA5 = 0: BSRR = 1 &lt;&lt; 21</div>
<h3>HAL</h3>
<p>HAL (Hardware Abstraction Layer) does the same with <code>HAL_GPIO_Init</code>, <code>HAL_GPIO_WritePin</code>, <code>HAL_GPIO_ReadPin</code>: readable and portable across families, a little slower and larger. Real projects mostly use HAL; knowing the registers pays off when debugging and where timing is critical.</p>`,
      code: [blinkReg('en'), blinkHal('en')],
      tryIt: 'In the register viewer make PA5 an output (MODER bits 01) and click bit 5 of ODR: does the LED light? Try the same with the clock off. Make PC13 an input without a pull-up and release the button: why does IDR flicker? Turn on the pull-up. Finally, while PA5 drives push-pull 1, turn on "pull to GND externally" and read the short-circuit warning; what changes when you switch to open-drain?',
      pitfalls: ['Forgetting to enable the GPIO clock: the registers never change and the code seems "not to work".', 'Setting MODER with |=: if the previous 2 bits are not cleared, 01 | 10 = 11 (analog). Mask first, then write.', 'Writing ODR with |= from both an interrupt and the main loop: a race condition. Use BSRR.', 'Forgetting that the Nucleo button reads 0 when pressed (external pull-up, pulls to GND).'],
      se: `<p>Wrap bit operations in small named functions: <code>gpio_set_mode(GPIOA, 5, MODE_OUTPUT)</code>.</p>
<ul><li>If these functions work on a register struct (a fake struct instead of the real address), they can be <b>unit-tested on the PC</b>: just like this simulation.</li><li>Record the HAL-or-registers decision with its reason in code review.</li></ul>`,
      quiz: [
        { q: 'To make PA5 a general-purpose output, what goes into which MODER bits?', options: ['1 into bit 5', '01 into bits 11:10', '10 into bits 11:10', '11 into bits 5:4'], answer: 1, why: 'Two bits per pin: bits 11 and 10 for pin 5; 01 is output.' },
        { q: 'What does BSRR = 1 << 21 do?', options: ['Sets PA5 to 1', 'Sets PA5 to 0', 'Sets PA21 to 1', 'Nothing'], answer: 1, why: 'The upper 16 bits are the reset field: 21 − 16 = pin 5 is cleared.' },
        { q: 'Why is BSRR preferred over ODR |= ...?', options: ['It uses less memory', 'It is a single atomic write; no race with interrupts', 'A brighter LED', 'HAL requires it'], answer: 1, why: 'A change made by an interrupt between read and write is not lost.' },
        { q: 'What does a pin do when 1 is written to an open-drain output (no pull-up)?', options: ['3.3 V', '0 V', 'Floats (undefined)', '5 V'], answer: 2, why: 'Open-drain only pulls to 0; at 1 the pin is released and the pull-up sets the level.' },
      ],
    },
  },
  {
    n: 4, hours: 3, sims: ['clock'], hyvex: ['stm32', 'osiloskop'],
    tr: {
      title: 'RCC ve saat ağacı',
      summary: 'HSI, HSE ve PLL; SYSCLK, AHB ve APB bölücüleri; zamanlayıcı saatinin iki katına çıkması; Flash bekleme durumları.',
      goals: ['Saat kaynaklarını (HSI, HSE, LSE, PLL) ve kullanım yerlerini ayırt etmek', 'PLL M, N, P, Q değerleriyle SYSCLK ve USB 48 MHz\'i hesaplamak', 'APB sınırlarını ve "APB bölücüsü 1 değilse zamanlayıcı saati ×2" kuralını uygulamak', 'Saat yükselince Flash bekleme durumunun neden artması gerektiğini açıklamak'],
      notes: `<p>Bir mikrodenetleyicide her şey bir saatle ilerler; STM32\'de saatleri <b>RCC</b> (Reset and Clock Control) dağıtır. Sıfırlamadan sonra çekirdek dahili 16 MHz <b>HSI</b> osilatörüyle çalışır: hemen hazırdır ama sıcaklıkla %1 kayabilir. Harici kristal <b>HSE</b> (Nucleo\'da ST-LINK\'ten gelen 8 MHz) çok daha kararlıdır; UART ve USB için tercih edilir. 32,768 kHz <b>LSE</b> gerçek zaman saatini (RTC) besler.</p>
<h3>PLL</h3>
<p>PLL, giriş saatini çarpıp bölerek yüksek frekans üretir:</p>
<div class="eq">VCO = (giriş / M) × N &nbsp;&nbsp; SYSCLK = VCO / P &nbsp;&nbsp; USB = VCO / Q</div>
<p>Kurallar: VCO girişi 1–2 MHz (2 MHz önerilir), VCO çıkışı 100–432 MHz, USB tam 48 MHz. F407 için klasik ayar HSE 8 MHz, M = 8, N = 336, P = 2, Q = 7: 168 MHz SYSCLK ve 48 MHz USB.</p>
<h3>Veri yolu bölücüleri</h3>
<p>SYSCLK, AHB bölücüsünden HCLK olur; HCLK de APB1 (yavaş, F407\'de ≤ 42 MHz) ve APB2 (hızlı, ≤ 84 MHz) bölücülerinden geçer. Önemli tuzak: <b>APB bölücüsü 1 değilse, o veri yolundaki zamanlayıcıların saati çevre biriminin iki katıdır</b>. APB1 42 MHz ise TIM2–TIM5 84 MHz ile sayar. 5. ünitedeki PSC/ARR hesabı bu sayıyla yapılır.</p>
<h3>Flash bekleme durumu</h3>
<p>Flash, 168 MHz\'te bir çevrimde okunamaz; işlemci beklemelidir. 3,3 V\'ta her 30 MHz için bir bekleme durumu eklenir (168 MHz: 5). Saati yükseltmeden önce bekleme durumunu artırmak gerekir; tersi sırada kod rastgele çöker.</p>`,
      code: [clockHal('tr')],
      tryIt: 'Saat hesaplayıcıda F407 için 168 MHz\'i kur ve USB\'nin 48 MHz olduğunu doğrula. APB1 bölücüsünü 2 yap: hangi sınır aşıldı? Sonra F411 (100 MHz) seçip HSE 25 MHz ile 100 MHz ve 48 MHz USB\'yi aynı anda veren M, N, P, Q değerlerini bul. Her ayarda TIM2 saatini not et.',
      pitfalls: ['Zamanlayıcı saatini APB saatiyle aynı sanmak: bölücü 1 değilse iki katıdır, PWM frekansı yarı çıkar.', 'Saati yükseltip Flash bekleme durumunu güncellememek.', 'Nucleo\'da HSE\'yi kristal sanmak: ST-LINK\'ten gelen harici saattir, BYPASS kipi seçilmelidir.', 'HSI ile hassas UART ya da USB kullanmak: sıcaklıkla kayma iletişim hatasına yol açabilir.'],
      se: `<p>Saat ayarı tüm sistemin <b>varsayımıdır</b>: UART baud, PWM frekansı, gecikmeler ona bağlıdır.</p>
<ul><li>Frekansları tek bir başlık dosyasında sabit olarak tut ve diğer hesapları ondan türet.</li><li>Açılışta <code>HAL_RCC_GetSysClockFreq()</code> değerini günlüğe yaz ve beklenenle karşılaştıran bir öz-test ekle.</li></ul>`,
      quiz: [
        { q: 'HSE 8 MHz, M = 8, N = 336, P = 2. SYSCLK kaçtır?', options: ['84 MHz', '168 MHz', '336 MHz', '42 MHz'], answer: 1, why: '8/8 = 1 MHz; × 336 = 336 MHz VCO; / 2 = 168 MHz.' },
        { q: 'APB1 = 42 MHz ve APB1 bölücüsü 4 ise TIM2 hangi saatle sayar?', options: ['42 MHz', '84 MHz', '168 MHz', '21 MHz'], answer: 1, why: 'Bölücü 1 değilse zamanlayıcı saati 2 × PCLK1 = 84 MHz.' },
        { q: 'USB için hangi koşul gerekir?', options: ['SYSCLK = 48 MHz', 'VCO / Q = tam 48 MHz', 'HSI kullanmak', 'APB2 = 48 MHz'], answer: 1, why: 'USB çevre birimi tam 48 MHz ister; Q bölücüsü bunu verir.' },
        { q: 'Saati 30 MHz\'ten 168 MHz\'e çıkarmadan önce ne yapılmalı?', options: ['Hiçbir şey', 'Flash bekleme durumunu artırmak', 'GPIO saatini kapatmak', 'UART\'ı başlatmak'], answer: 1, why: 'Flash yüksek saatte bekleme durumu olmadan okunamaz; önce gecikme ayarlanır.' },
      ],
    },
    en: {
      title: 'RCC and the clock tree',
      summary: 'HSI, HSE and PLL; SYSCLK, AHB and APB dividers; the timer clock doubling; Flash wait states.',
      goals: ['Tell the clock sources (HSI, HSE, LSE, PLL) and where they are used apart', 'Compute SYSCLK and USB 48 MHz from the PLL M, N, P, Q values', 'Apply the APB limits and the rule "if the APB divider is not 1, the timer clock is ×2"', 'Explain why Flash wait states must increase as the clock rises'],
      notes: `<p>Everything in a microcontroller moves with a clock; on an STM32 the <b>RCC</b> (Reset and Clock Control) distributes clocks. After reset the core runs on the internal 16 MHz <b>HSI</b> oscillator: ready at once but it can drift 1 % with temperature. An external crystal, <b>HSE</b> (on a Nucleo the 8 MHz from the ST-LINK), is far more stable; it is preferred for UART and USB. The 32.768 kHz <b>LSE</b> feeds the real-time clock (RTC).</p>
<h3>PLL</h3>
<p>The PLL produces a high frequency by multiplying and dividing the input clock:</p>
<div class="eq">VCO = (input / M) × N &nbsp;&nbsp; SYSCLK = VCO / P &nbsp;&nbsp; USB = VCO / Q</div>
<p>Rules: VCO input 1–2 MHz (2 MHz recommended), VCO output 100–432 MHz, USB exactly 48 MHz. The classic F407 setting is HSE 8 MHz, M = 8, N = 336, P = 2, Q = 7: 168 MHz SYSCLK and 48 MHz USB.</p>
<h3>Bus dividers</h3>
<p>SYSCLK becomes HCLK through the AHB divider; HCLK then passes through the APB1 (slow, ≤ 42 MHz on the F407) and APB2 (fast, ≤ 84 MHz) dividers. An important trap: <b>if an APB divider is not 1, the timers on that bus are clocked at twice the peripheral clock</b>. If APB1 is 42 MHz, TIM2–TIM5 count at 84 MHz. The PSC/ARR calculation in unit 5 uses this number.</p>
<h3>Flash wait states</h3>
<p>Flash cannot be read in one cycle at 168 MHz; the processor must wait. At 3.3 V one wait state is added per 30 MHz (168 MHz: 5). Raise the wait states before raising the clock; in the other order the code crashes at random.</p>`,
      code: [clockHal('en')],
      tryIt: 'In the clock calculator set up 168 MHz for the F407 and check that USB is 48 MHz. Set the APB1 divider to 2: which limit is exceeded? Then pick the F411 (100 MHz) and, with HSE 25 MHz, find M, N, P, Q values that give 100 MHz and 48 MHz USB at the same time. Note the TIM2 clock for each setting.',
      pitfalls: ['Assuming the timer clock equals the APB clock: if the divider is not 1 it is double, and the PWM frequency comes out half.', 'Raising the clock without updating the Flash wait states.', 'Thinking the Nucleo\'s HSE is a crystal: it is an external clock from the ST-LINK and BYPASS mode must be selected.', 'Using precise UART or USB on HSI: temperature drift can cause communication errors.'],
      se: `<p>The clock setting is the whole system\'s <b>assumption</b>: UART baud, PWM frequency and delays depend on it.</p>
<ul><li>Keep frequencies as constants in a single header and derive every other calculation from them.</li><li>Log <code>HAL_RCC_GetSysClockFreq()</code> at boot and add a self-test that compares it with the expected value.</li></ul>`,
      quiz: [
        { q: 'HSE 8 MHz, M = 8, N = 336, P = 2. What is SYSCLK?', options: ['84 MHz', '168 MHz', '336 MHz', '42 MHz'], answer: 1, why: '8/8 = 1 MHz; × 336 = 336 MHz VCO; / 2 = 168 MHz.' },
        { q: 'If APB1 = 42 MHz and the APB1 divider is 4, what clock does TIM2 count with?', options: ['42 MHz', '84 MHz', '168 MHz', '21 MHz'], answer: 1, why: 'If the divider is not 1 the timer clock is 2 × PCLK1 = 84 MHz.' },
        { q: 'What is required for USB?', options: ['SYSCLK = 48 MHz', 'VCO / Q = exactly 48 MHz', 'Using HSI', 'APB2 = 48 MHz'], answer: 1, why: 'The USB peripheral needs exactly 48 MHz; the Q divider provides it.' },
        { q: 'What must be done before raising the clock from 30 MHz to 168 MHz?', options: ['Nothing', 'Increase the Flash wait states', 'Turn off the GPIO clock', 'Start the UART'], answer: 1, why: 'Flash cannot be read at a high clock without wait states; set the latency first.' },
      ],
    },
  },
  {
    n: 5, hours: 5, sims: ['pwm'], hyvex: ['stm32', 'sg90', 'metal-disli-dc-motor', 'drv8833', 'logic-analyzer'], esofWeek: 3,
    wokwi: wokwi(
      ['Wokwi\'de STM32 kartına bir servo bağla ve 50 Hz PWM üret: PSC = f_tim(MHz) − 1, ARR = 19999 ile CCR doğrudan mikrosaniye olur.', 'Wokwi\'nin mantık analizörü parçasını PWM pinine bağlayıp görev oranını ölç.'],
      ['Connect a servo to the STM32 board on Wokwi and generate 50 Hz PWM: with PSC = f_tim(MHz) − 1 and ARR = 19999, CCR is directly in microseconds.', 'Attach Wokwi\'s logic analyser part to the PWM pin and measure the duty cycle.'],
    ),
    tr: {
      title: 'Zamanlayıcılar ve PWM',
      summary: 'Ön bölücü (PSC), otomatik yeniden yükleme (ARR), karşılaştırma (CCR); frekans, görev oranı ve çözünürlük; servo ve motor PWM\'i.',
      goals: ['Zamanlayıcı sayacının PSC ve ARR ile nasıl saydığını ve taştığını açıklamak', 'İstenen PWM frekansı için PSC ve ARR seçmek; çözünürlük ile frekans arasındaki ödünleşimi göstermek', 'CCR ile görev oranını ayarlamak; servo için mikrosaniye çözünürlüklü ayar kurmak', 'PWM\'i hem HAL hem yazmaçlarla başlatmak'],
      notes: `<p>STM32 zamanlayıcıları (TIM1–TIM14) donanımda sayan sayaçlardır; işlemci uğraşmadan kesin zamanlama üretirler. Bir zamanlayıcının üç temel yazmacı vardır:</p>
<ul><li><b>PSC</b> (ön bölücü): giriş saatini PSC + 1\'e böler.</li><li><b>ARR</b> (yeniden yükleme): sayaç 0\'dan ARR\'ye kadar sayar, sonra başa döner (güncelleme olayı).</li><li><b>CCR</b> (karşılaştırma): PWM kip 1\'de sayaç CCR\'den küçükken çıkış 1\'dir.</li></ul>
<div class="eq">f<sub>PWM</sub> = f<sub>TIM</sub> / ((PSC + 1)(ARR + 1)) &nbsp;&nbsp; görev = CCR / (ARR + 1)</div>
<h3>Frekans ve çözünürlük</h3>
<p>84 MHz zamanlayıcı saatiyle 20 kHz motor PWM\'i için PSC = 0, ARR = 4199: görev oranı 4200 adımda ayarlanır (≈ 12 bit). Aynı saatle 1 MHz istersen ARR = 83 olur, yalnız 84 adım kalır. Yüksek frekans, düşük çözünürlük demektir. Motorlar için 20 kHz insan kulağının üstündedir: motor ötmez.</p>
<h3>Servo</h3>
<p>Servo 50 Hz\'te 1–2 ms darbe ister. PSC = 83 (84 MHz → 1 MHz, 1 µs adım) ve ARR = 19999 seçilirse CCR doğrudan mikrosaniyedir: CCR = 1500 orta konum. 16 bitlik sınır (ARR ≤ 65535) yüzünden düşük frekanslarda PSC büyütülmek zorundadır.</p>
<p>Aynı zamanlayıcı giriş yakalama (enkoder ya da darbe ölçümü), tek darbe ve enkoder arayüzü kiplerinde de çalışır; TIM1 ve TIM8 motor sürmek için ölü zamanlı tamamlayıcı çıkışlar sunar.</p>`,
      code: [pwmHal('tr'), pwmReg('tr')],
      tryIt: 'PWM hesaplayıcıda 84 MHz ile 20 kHz iste: çözücünün bulduğu PSC/ARR\'yi ve çözünürlüğü (bit) not et. Aynı şeyi 50 Hz ve 1 MHz için yap. CCR\'yi ARR\'den büyük yap: görev oranı ne oluyor? Servo düğmesine bas ve 90° için CCR\'nin 1500 olduğunu doğrula.',
      pitfalls: ['PSC ve ARR\'ye "bölücü" değerini yazmak: donanım +1 ekler; 1000\'e bölmek için 999 yazılır.', 'APB bölücüsü yüzünden zamanlayıcı saatini yanlış almak (4. ünite).', 'Alternatif işlev numarasını (AF2) ayarlamamak: pin PWM vermez.', 'Çalışırken ARR\'yi ön yükleme (ARPE) olmadan değiştirmek: o periyotta tuhaf bir darbe çıkar.'],
      se: `<p>PSC/ARR hesabını sihirli sayı olarak değil, <b>derleme zamanında</b> hesaplanan sabitlerle yaz: <code>#define ARR (TIM_HZ / PWM_HZ - 1)</code>.</p>
<ul><li>Bir <code>static_assert(ARR &lt;= 0xFFFF)</code> sınırı derlemede yakalar.</li><li>PWM ayarı ile görev oranı hesabını saf fonksiyonda tutup bilgisayarda test et.</li></ul>`,
      quiz: [
        { q: 'f_TIM = 84 MHz, PSC = 83, ARR = 999. PWM frekansı?', options: ['84 kHz', '1 kHz', '10 kHz', '100 Hz'], answer: 1, why: '84e6 / 84 / 1000 = 1000 Hz.' },
        { q: 'ARR = 999 iken %25 görev için CCR?', options: ['25', '250', '750', '999'], answer: 1, why: 'CCR / (ARR + 1) = 250 / 1000 = 0,25.' },
        { q: 'Aynı zamanlayıcı saatinde PWM frekansını artırmak çözünürlüğe ne yapar?', options: ['Artırır', 'Azaltır', 'Değiştirmez', 'Sonsuz yapar'], answer: 1, why: 'Daha az sayım adımı kalır: ARR küçülür.' },
        { q: 'Servo için PSC = 83 ve ARR = 19999 seçmenin faydası?', options: ['Frekans 1 kHz olur', 'CCR doğrudan mikrosaniye cinsinden olur', 'Çözünürlük 8 bit olur', 'Servo daha hızlı döner'], answer: 1, why: '84 MHz / 84 = 1 MHz: her sayım 1 µs; 20000 sayım = 20 ms = 50 Hz.' },
      ],
    },
    en: {
      title: 'Timers and PWM',
      summary: 'Prescaler (PSC), auto-reload (ARR), compare (CCR); frequency, duty cycle and resolution; servo and motor PWM.',
      goals: ['Explain how a timer counter counts and overflows with PSC and ARR', 'Choose PSC and ARR for a target PWM frequency and show the trade-off between resolution and frequency', 'Set the duty cycle with CCR and configure microsecond resolution for a servo', 'Start PWM with both HAL and registers'],
      notes: `<p>STM32 timers (TIM1–TIM14) are counters in hardware; they produce precise timing without the processor\'s help. A timer has three basic registers:</p>
<ul><li><b>PSC</b> (prescaler): divides the input clock by PSC + 1.</li><li><b>ARR</b> (auto-reload): the counter counts from 0 to ARR, then wraps (update event).</li><li><b>CCR</b> (compare): in PWM mode 1 the output is 1 while the counter is below CCR.</li></ul>
<div class="eq">f<sub>PWM</sub> = f<sub>TIM</sub> / ((PSC + 1)(ARR + 1)) &nbsp;&nbsp; duty = CCR / (ARR + 1)</div>
<h3>Frequency and resolution</h3>
<p>With an 84 MHz timer clock, 20 kHz motor PWM needs PSC = 0, ARR = 4199: the duty cycle is set in 4200 steps (≈ 12 bits). With the same clock, 1 MHz needs ARR = 83, leaving only 84 steps. High frequency means low resolution. For motors, 20 kHz is above human hearing: the motor does not whine.</p>
<h3>Servo</h3>
<p>A servo wants 1–2 ms pulses at 50 Hz. With PSC = 83 (84 MHz → 1 MHz, 1 µs steps) and ARR = 19999, CCR is directly in microseconds: CCR = 1500 is the centre. Because of the 16-bit limit (ARR ≤ 65535), PSC has to grow at low frequencies.</p>
<p>The same timer also works in input capture (encoder or pulse measurement), one-pulse and encoder-interface modes; TIM1 and TIM8 offer complementary outputs with dead time for driving motors.</p>`,
      code: [pwmHal('en'), pwmReg('en')],
      tryIt: 'In the PWM calculator ask for 20 kHz at 84 MHz: note the PSC/ARR the solver finds and the resolution (bits). Do the same for 50 Hz and 1 MHz. Make CCR larger than ARR: what happens to the duty cycle? Press the servo button and check that CCR is 1500 for 90°.',
      pitfalls: ['Writing the "divider" value into PSC and ARR: the hardware adds 1; to divide by 1000, write 999.', 'Taking the wrong timer clock because of the APB divider (unit 4).', 'Not setting the alternate-function number (AF2): the pin gives no PWM.', 'Changing ARR on the fly without preload (ARPE): a strange pulse appears in that period.'],
      se: `<p>Write the PSC/ARR calculation not as magic numbers but as constants computed <b>at compile time</b>: <code>#define ARR (TIM_HZ / PWM_HZ - 1)</code>.</p>
<ul><li>A <code>static_assert(ARR &lt;= 0xFFFF)</code> catches the limit at build time.</li><li>Keep the PWM setup and the duty-cycle calculation in pure functions and test them on the PC.</li></ul>`,
      quiz: [
        { q: 'f_TIM = 84 MHz, PSC = 83, ARR = 999. PWM frequency?', options: ['84 kHz', '1 kHz', '10 kHz', '100 Hz'], answer: 1, why: '84e6 / 84 / 1000 = 1000 Hz.' },
        { q: 'With ARR = 999, CCR for 25 % duty?', options: ['25', '250', '750', '999'], answer: 1, why: 'CCR / (ARR + 1) = 250 / 1000 = 0.25.' },
        { q: 'What does raising the PWM frequency at the same timer clock do to resolution?', options: ['Raises it', 'Lowers it', 'Leaves it unchanged', 'Makes it infinite'], answer: 1, why: 'Fewer count steps remain: ARR gets smaller.' },
        { q: 'What is the benefit of PSC = 83 and ARR = 19999 for a servo?', options: ['The frequency becomes 1 kHz', 'CCR is directly in microseconds', 'The resolution becomes 8 bits', 'The servo turns faster'], answer: 1, why: '84 MHz / 84 = 1 MHz: each count is 1 µs; 20000 counts = 20 ms = 50 Hz.' },
      ],
    },
  },
  {
    n: 6, hours: 5, sims: ['nvic'], hyvex: ['stm32', 'buton-anahtar', 'logic-analyzer'], esofWeek: 3,
    tr: {
      title: 'Kesmeler, EXTI ve NVIC',
      summary: 'Yoklama yerine kesme; EXTI hatları; NVIC öncelikleri, iç içe kesme, kuyruk zincirleme; ISR yazım kuralları.',
      goals: ['Yoklama (polling) ile kesmenin farkını ve kesme gecikmesini açıklamak', 'Bir GPIO pinini EXTI hattına bağlamak ve hat paylaşımı kuralını uygulamak', 'NVIC preempt ve alt önceliklerini ayarlayıp iç içe kesmeyi ve kuyruk zincirlemeyi okumak', 'Kısa, volatile kullanan ve engellemeyen ISR yazmak'],
      notes: `<p>Ana döngüde butonu sürekli okumak (<b>yoklama</b>) işlemciyi meşgul eder ve döngü uzunsa basışı kaçırır. <b>Kesme</b> ile donanım olayı işlemciyi durdurur, kısa bir işleyici (ISR) çalışır, sonra ana kod kaldığı yerden devam eder. Cortex-M\'de çekirdek yazmaçları yığına otomatik kaydeder; giriş yaklaşık 12 çevrimdir.</p>
<h3>EXTI</h3>
<p>EXTI (harici kesme) denetleyicisinin 16 GPIO hattı vardır ve <b>hat numarası pin numarasıdır</b>: PA0, PB0 ve PC0 aynı EXTI0 hattını paylaşır, hangisinin bağlanacağını SYSCFG_EXTICR seçer. Yani PA0 ve PB0\'dan aynı anda kesme alınamaz. EXTI0–4\'ün kendi vektörü vardır; 5–9 ve 10–15 ortak vektörü paylaşır, işleyici hangi hattın tetiklediğine bekleme (PR) yazmacından bakar.</p>
<h3>NVIC ve öncelik</h3>
<p>STM32\'de öncelik için 4 bit vardır; <b>küçük sayı yüksek önceliktir</b>. Bitler <b>preempt</b> (araya girme) ve <b>alt öncelik</b> olarak bölünebilir. Kural: bekleyen bir kesme, ancak preempt önceliği çalışan işleyicininkinden kesin küçükse araya girer. Eşitse bekler; sıra alt önceliğe göre belirlenir. Bir işleyici bitince bekleyen varsa ana koda dönmeden ona geçilir: <b>kuyruk zincirleme</b> (tail-chaining), birkaç çevrim kazandırır.</p>
<h3>ISR kuralları</h3>
<ul><li>Kısa tut: bayrak kaldır, sayaç artır; ağır işi ana döngüye bırak.</li><li>ISR ile paylaşılan değişkenler <code>volatile</code>; çok baytlılarda kritik bölge.</li><li>ISR\'de <code>HAL_Delay</code> ve <code>printf</code> yok. Bekleme biti tekrar gelmeden temizlenmezse ikinci olay kaybolur.</li></ul>`,
      code: [extiHal('tr')],
      tryIt: 'Zaman çizelgesinde TIM2 (preempt 2) çalışırken EXTI0 (preempt 1) isteği gönder: iç içe geçişi gör. EXTI0\'ın önceliğini 3 yap ve tekrarla: şimdi bekliyor mu? İki USART isteğini art arda gönder ve ikincisinin neden kaybolduğunu açıkla. EXTI sekmesinde PA0 ve PB0\'ı birlikte seç ve çakışmayı oku.',
      pitfalls: ['ISR\'de uzun iş yapmak: düşük öncelikli kesmeler ve ana döngü aç kalır, olaylar kaybolur.', 'Paylaşılan değişkeni volatile yapmamak: derleyici değeri yazmaçta tutar, ana döngü değişikliği görmez.', 'Aynı numaralı iki pinden EXTI beklemek (PA3 ve PB3).', 'Önceliği yanlış yöne okumak: 0 en yüksek önceliktir; SysTick\'i fazla düşük öncelikte bırakmak HAL_Delay\'i bozar.'],
      se: `<p>Kesmeler eşzamanlılık getirir; hatalar nadiren ve tekrarlanamaz biçimde görülür.</p>
<ul><li>ISR\'den ana koda veriyi tek yazarlı tek okurlu bir <b>halka tampon</b> ile aktar; bunu bilgisayarda test et.</li><li>Her kesmenin önceliğini ve gerekçesini bir tabloda belgele (öncelik haritası); kod incelemesinde kontrol edilir.</li></ul>`,
      quiz: [
        { q: 'PA3 ve PB3\'ten aynı anda EXTI kesmesi alınabilir mi?', options: ['Evet, her zaman', 'Hayır, ikisi de EXTI3 hattıdır; yalnız biri seçilebilir', 'Yalnız HAL ile', 'Yalnız düşen kenarda'], answer: 1, why: 'EXTI hattı pin numarasıdır; EXTICR hattı tek bir porta bağlar.' },
        { q: 'Preempt 2\'deki işleyici çalışırken preempt 2\'de başka bir kesme gelirse?', options: ['Hemen araya girer', 'Bekler; ilk işleyici bitince çalışır', 'Kaybolur', 'Sistem sıfırlanır'], answer: 1, why: 'Araya girmek için preempt önceliği kesin küçük olmalı.' },
        { q: 'Kuyruk zincirleme nedir?', options: ['Kesmelerin kaybolması', 'Bir işleyici bitince bekleyen işleyiciye ana koda dönmeden geçilmesi', 'Yığın taşması', 'DMA kipi'], answer: 1, why: 'Yazmaçları geri yükleyip yeniden kaydetmek yerine kısa bir geçiş yapılır.' },
        { q: 'ISR ile ana döngünün paylaştığı sayaç nasıl tanımlanmalı?', options: ['const', 'volatile', 'static inline', 'register'], answer: 1, why: 'volatile, derleyicinin her erişimde bellekten okumasını sağlar.' },
      ],
    },
    en: {
      title: 'Interrupts, EXTI and NVIC',
      summary: 'Interrupts instead of polling; EXTI lines; NVIC priorities, nesting, tail-chaining; rules for writing ISRs.',
      goals: ['Explain the difference between polling and interrupts, and interrupt latency', 'Connect a GPIO pin to an EXTI line and apply the line-sharing rule', 'Set NVIC preempt and sub-priorities and read nesting and tail-chaining', 'Write short, non-blocking ISRs that use volatile'],
      notes: `<p>Reading a button over and over in the main loop (<b>polling</b>) keeps the processor busy and misses presses if the loop is long. With an <b>interrupt</b> a hardware event stops the processor, a short handler (ISR) runs, and then the main code continues where it left off. On a Cortex-M the core saves registers to the stack automatically; entry takes about 12 cycles.</p>
<h3>EXTI</h3>
<p>The EXTI (external interrupt) controller has 16 GPIO lines and <b>the line number is the pin number</b>: PA0, PB0 and PC0 share the same EXTI0 line, and SYSCFG_EXTICR chooses which one is connected. So you cannot get interrupts from PA0 and PB0 at the same time. EXTI0–4 have their own vectors; 5–9 and 10–15 share a vector, and the handler checks the pending (PR) register to see which line fired.</p>
<h3>NVIC and priority</h3>
<p>The STM32 has 4 priority bits; <b>a smaller number is a higher priority</b>. The bits can be split into <b>preempt</b> and <b>sub-priority</b>. The rule: a pending interrupt preempts only if its preempt priority is strictly smaller than the running handler\'s. If equal, it waits; the order is decided by sub-priority. When a handler ends and another is pending, the core switches to it without returning to the main code: <b>tail-chaining</b>, which saves a few cycles.</p>
<h3>ISR rules</h3>
<ul><li>Keep it short: raise a flag, bump a counter; leave the heavy work to the main loop.</li><li>Variables shared with an ISR are <code>volatile</code>; multi-byte ones need a critical section.</li><li>No <code>HAL_Delay</code> or <code>printf</code> in an ISR. If the pending bit is not cleared before the next event, the second event is lost.</li></ul>`,
      code: [extiHal('en')],
      tryIt: 'On the timeline send an EXTI0 request (preempt 1) while TIM2 (preempt 2) is running: see the nesting. Set EXTI0\'s priority to 3 and repeat: does it wait now? Send two USART requests back to back and explain why the second is lost. In the EXTI tab select PA0 and PB0 together and read the clash.',
      pitfalls: ['Doing long work in an ISR: lower-priority interrupts and the main loop starve, and events are lost.', 'Not making a shared variable volatile: the compiler keeps the value in a register and the main loop never sees the change.', 'Expecting EXTI from two pins with the same number (PA3 and PB3).', 'Reading priority the wrong way round: 0 is the highest; leaving SysTick at too low a priority breaks HAL_Delay.'],
      se: `<p>Interrupts bring concurrency; bugs appear rarely and are hard to reproduce.</p>
<ul><li>Pass data from an ISR to the main code with a single-writer, single-reader <b>ring buffer</b>; test it on the PC.</li><li>Document every interrupt\'s priority and the reason in a table (a priority map); it is checked in code review.</li></ul>`,
      quiz: [
        { q: 'Can you get EXTI interrupts from PA3 and PB3 at the same time?', options: ['Yes, always', 'No, both are the EXTI3 line; only one can be selected', 'Only with HAL', 'Only on the falling edge'], answer: 1, why: 'The EXTI line is the pin number; EXTICR connects a line to a single port.' },
        { q: 'While a preempt-2 handler runs, another preempt-2 interrupt arrives. What happens?', options: ['It preempts at once', 'It waits and runs when the first handler ends', 'It is lost', 'The system resets'], answer: 1, why: 'To preempt, the preempt priority must be strictly smaller.' },
        { q: 'What is tail-chaining?', options: ['Interrupts being lost', 'Switching to a pending handler when one ends, without returning to the main code', 'A stack overflow', 'A DMA mode'], answer: 1, why: 'Instead of restoring and re-saving registers, a short switch is made.' },
        { q: 'How should a counter shared by an ISR and the main loop be declared?', options: ['const', 'volatile', 'static inline', 'register'], answer: 1, why: 'volatile makes the compiler read it from memory on every access.' },
      ],
    },
  },
]
