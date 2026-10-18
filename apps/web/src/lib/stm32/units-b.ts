// ARM (STM32) dersi üniteleri 7–11: UART, ADC ve DMA, I²C/SPI, düşük güç, FreeRTOS. HTML iki dilde aynı etiket dizisinde.
import type { CourseUnit } from '@/lib/gomulu/types'
import { adcDmaHal, i2cSpiHal, rtosC, stopHal, uartHal } from './code'
import type { StmSimId } from './sims'

export const UNITS_B: CourseUnit<StmSimId>[] = [
  {
    n: 7, hours: 4, sims: ['uart'], hyvex: ['stm32', 'ch340-usb-seri-cip', 'hc-05-bluetooth-modulu', 'logic-analyzer'], esofWeek: 3,
    wokwi: { board: 'STM32 (Wokwi)', url: 'https://wokwi.com', tr: ['Wokwi\'de STM32 projesinde USART\'ı Wokwi\'nin seri monitörüne bağla ve "PWM 40" gibi komutlara satır satır yanıt veren döngüyü yaz.', 'Baud\'u iki uçta farklı ayarlayıp bozuk karakterleri gözlemle.'], en: ['In an STM32 project on Wokwi connect the USART to Wokwi\'s serial monitor and write a loop that answers commands such as "PWM 40" line by line.', 'Set different baud rates on the two ends and watch the garbled characters.'] },
    tr: {
      title: 'UART: seri iletişim ve komut satırı',
      summary: 'Çerçeve (start, veri, parite, stop), baud ve BRR, saat hatası; kesmeyle satır okuma ve basit bir komut arayüzü.',
      goals: ['UART çerçevesini bit bit çizmek ve 8N1\'in ne demek olduğunu açıklamak', 'Saat frekansından BRR değerini ve gerçek baud hatasını hesaplamak', 'Çerçeve ve parite hatalarının nedenlerini ayırt etmek', 'Kesmeyle bayt bayt okuyup satır tabanlı komut arayüzü kurmak'],
      notes: `<p>UART, saat hattı olmadan iki tel (TX, RX) ve ortak toprakla haberleşir. İki taraf da aynı hızı (<b>baud</b>) önceden bilir. Hat boşta 1\'dir; her bayt bir <b>start biti</b> (0) ile başlar, <b>LSB önce</b> 8 veri biti gelir, isteğe bağlı bir <b>parite</b> biti ve bir ya da iki <b>stop biti</b> (1) ile biter. "8N1": 8 veri, parite yok, 1 stop; bir bayt 10 bit sürer.</p>
<div class="eq">115200 baud, 8N1 → 11520 bayt/s; bit süresi ≈ 8,68 µs</div>
<h3>BRR ve saat hatası</h3>
<p>Alıcı start bitinin düşen kenarından sonra her bitin ortasında örnekler. STM32\'de USARTDIV = f<sub>ck</sub> / (16 × baud); tam kısım mantis, 16\'da biri kesir olarak BRR\'ye yazılır. 84 MHz ve 115200 için USARTDIV = 45,57 → 45 + 9/16, gerçek baud 115 226 (hata %0,02). İki ucun toplam hatası yaklaşık %2\'yi aşarsa son bitler komşu bitin içinde örneklenir ve çerçeve bozulur.</p>
<h3>Hatalar</h3>
<ul><li><b>Çerçeve hatası (FE)</b>: stop biti 0 okundu. Neden: baud uyuşmazlığı ya da gürültü.</li><li><b>Parite hatası (PE)</b>: 1\'lerin sayısı pariteyle tutmadı.</li><li><b>Taşma (ORE)</b>: yeni bayt geldi ama öncekini okumadın. Neden: yoklama ya da yavaş ISR.</li></ul>
<h3>Komut arayüzü</h3>
<p>Nucleo\'da USART2, ST-LINK\'in sanal COM portuna bağlıdır: bilgisayarda bir seri terminal açıp kartla yazışabilirsin. Satır sonuna kadar baytları tampona topla, sonra satırı çözümle: <code>PWM 40</code>, <code>DIR F</code>, <code>STATUS</code>. Bitirme projesinin kullanıcı arayüzü budur.</p>`,
      code: [uartHal('tr')],
      tryIt: 'UART görselleştiricisine "OK" yaz ve ilk karakterin bitlerini LSB önce oku. Pariteyi çift yap: parite biti neden 0 ya da 1? Bir stop bitini bozup alıcının FE vermesini izle. BRR hesabında 16 MHz HSI ile 115200 ve 921600 baud\'un hatasını karşılaştır. "Komut" sekmesinde PWM 40, START, DIR R ve STATUS komutlarını dene.',
      pitfalls: ['TX\'i TX\'e bağlamak: TX karşı tarafın RX\'ine gider.', 'Ortak GND bağlamamak: sinyal seviyesi tanımsız kalır.', '5 V USB-seri dönüştürücüyü 3,3 V pine bağlamak; çoğu STM32 pini 5 V toleranslıdır ama hepsi değil (veri sayfasında FT işaretine bak).', 'HAL_UART_Receive\'i engelleyici ve sonsuz zaman aşımıyla çağırmak: kart takılır.'],
      se: `<p>Komut çözümleyiciyi donanımdan ayır: girdi bir metin, çıktı yeni durum ve yanıt.</p>
<ul><li>Bu saf fonksiyon bilgisayarda Unity testleriyle sınanır: aralık dışı değer, bilinmeyen komut, fazla uzun satır.</li><li>Protokolü bir README tablosunda belgele (komut, argüman, yanıt, hata): sözleşme budur.</li></ul>`,
      quiz: [
        { q: '8N1 çerçevesinde bir bayt kaç bit sürer?', options: ['8', '9', '10', '11'], answer: 2, why: '1 start + 8 veri + 1 stop = 10 bit.' },
        { q: '\'A\' (0x41 = 0100 0001) gönderilirken start bitinden sonraki ilk veri biti?', options: ['0', '1', 'Parite', 'Stop'], answer: 1, why: 'LSB önce gider; 0x41\'in en düşük biti 1.' },
        { q: 'Alıcı sürekli FE (çerçeve hatası) veriyorsa ilk şüphe?', options: ['Parite ayarı', 'İki uçta farklı baud', 'Tampon boyutu', 'LED'], answer: 1, why: 'Baud uyuşmazlığında stop biti yanlış anda örneklenir.' },
        { q: '84 MHz, 115200 baud için USARTDIV yaklaşık kaçtır?', options: ['22,8', '45,6', '91,1', '729'], answer: 1, why: '84e6 / (16 × 115200) ≈ 45,57.' },
      ],
    },
    en: {
      title: 'UART: serial communication and a command line',
      summary: 'The frame (start, data, parity, stop), baud and BRR, clock error; reading lines with interrupts and a simple command interface.',
      goals: ['Draw a UART frame bit by bit and explain what 8N1 means', 'Compute the BRR value and the real baud error from the clock frequency', 'Tell the causes of framing and parity errors apart', 'Read byte by byte with interrupts and build a line-based command interface'],
      notes: `<p>A UART talks over two wires (TX, RX) and a common ground, with no clock line. Both sides know the speed (<b>baud</b>) in advance. The idle line is 1; every byte starts with a <b>start bit</b> (0), then 8 data bits <b>LSB first</b>, an optional <b>parity</b> bit and one or two <b>stop bits</b> (1). "8N1": 8 data, no parity, 1 stop; a byte takes 10 bits.</p>
<div class="eq">115200 baud, 8N1 → 11520 bytes/s; bit time ≈ 8.68 µs</div>
<h3>BRR and clock error</h3>
<p>The receiver samples in the middle of each bit after the falling edge of the start bit. On an STM32, USARTDIV = f<sub>ck</sub> / (16 × baud); the integer part is the mantissa and sixteenths go into BRR as the fraction. For 84 MHz and 115200, USARTDIV = 45.57 → 45 + 9/16, real baud 115 226 (error 0.02 %). If the combined error of the two ends exceeds about 2 %, the last bits are sampled inside the neighbouring bit and the frame is corrupted.</p>
<h3>Errors</h3>
<ul><li><b>Framing error (FE)</b>: the stop bit was read as 0. Cause: a baud mismatch or noise.</li><li><b>Parity error (PE)</b>: the count of 1s did not match the parity.</li><li><b>Overrun (ORE)</b>: a new byte arrived but you had not read the previous one. Cause: polling or a slow ISR.</li></ul>
<h3>Command interface</h3>
<p>On a Nucleo, USART2 is connected to the ST-LINK\'s virtual COM port: open a serial terminal on the computer and chat with the board. Collect bytes in a buffer until the end of the line, then parse the line: <code>PWM 40</code>, <code>DIR F</code>, <code>STATUS</code>. This is the capstone\'s user interface.</p>`,
      code: [uartHal('en')],
      tryIt: 'Type "OK" into the UART visualiser and read the bits of the first character LSB first. Set parity to even: why is the parity bit 0 or 1? Corrupt a stop bit and watch the receiver report FE. In the BRR calculation compare the error of 115200 and 921600 baud with the 16 MHz HSI. In the "Command" tab try PWM 40, START, DIR R and STATUS.',
      pitfalls: ['Wiring TX to TX: TX goes to the other side\'s RX.', 'No common GND: the signal level is undefined.', 'Connecting a 5 V USB-serial adapter to a 3.3 V pin; most STM32 pins are 5 V tolerant but not all (look for FT in the datasheet).', 'Calling HAL_UART_Receive blocking with an infinite timeout: the board hangs.'],
      se: `<p>Separate the command parser from the hardware: input is text, output is the new state and a reply.</p>
<ul><li>This pure function is tested on the PC with Unity: out-of-range values, unknown commands, over-long lines.</li><li>Document the protocol in a README table (command, argument, reply, error): that is the contract.</li></ul>`,
      quiz: [
        { q: 'How many bits does a byte take in an 8N1 frame?', options: ['8', '9', '10', '11'], answer: 2, why: '1 start + 8 data + 1 stop = 10 bits.' },
        { q: 'Sending \'A\' (0x41 = 0100 0001), what is the first data bit after the start bit?', options: ['0', '1', 'Parity', 'Stop'], answer: 1, why: 'LSB goes first; the lowest bit of 0x41 is 1.' },
        { q: 'If the receiver keeps reporting FE (framing error), what is the first suspect?', options: ['The parity setting', 'Different baud rates on the two ends', 'Buffer size', 'The LED'], answer: 1, why: 'With a baud mismatch the stop bit is sampled at the wrong moment.' },
        { q: 'What is USARTDIV for 84 MHz and 115200 baud, roughly?', options: ['22.8', '45.6', '91.1', '729'], answer: 1, why: '84e6 / (16 × 115200) ≈ 45.57.' },
      ],
    },
  },
  {
    n: 8, hours: 4, sims: ['dma'], hyvex: ['stm32', 'ldr', 'ir-mesafe-sharp', 'osiloskop'], esofWeek: 4,
    tr: {
      title: 'ADC ve DMA',
      summary: '12 bit dönüşüm, örnekleme süresi, tarama kipi; işlemci yerine veriyi taşıyan DMA, dairesel tampon ve yarım/tam aktarım.',
      goals: ['Gerilimi 12 bitlik ADC koduna ve geri çevirmek; örnekleme süresinin etkisini açıklamak', 'Tarama kipinde birden çok kanalın örnekleme hızını hesaplamak', 'DMA\'nın işlemciyi nasıl rahatlattığını ve dairesel kipin nasıl çalıştığını göstermek', 'Yarım ve tam aktarım kesmeleriyle çift tampon kurmak ve taşmayı önlemek'],
      notes: `<p>STM32F4\'ün ADC\'si 12 bitliktir: 0–3,3 V aralığını 4096 basamağa böler, bir basamak ≈ 0,8 mV. Pin önce analog kipe alınır (MODER = 11). Dönüşüm iki aşamadır: <b>örnekleme</b> (iç kondansatör girişe şarj olur) ve <b>çevirme</b> (12 çevrim). Kaynağın direnci büyükse (LDR bölücüsü, uzun kablo) kondansatör tam şarj olamaz; daha uzun örnekleme süresi seçilir.</p>
<div class="eq">kod = V / 3,3 × 4096 &nbsp;&nbsp; t<sub>dönüşüm</sub> = (örnekleme + 12) / f<sub>ADC</sub></div>
<h3>Neden DMA?</h3>
<p>Saniyede 100 000 örnek alıp her biri için kesmeyle işlemciye "oku" demek, işlemcinin zamanının çoğunu yer. <b>DMA</b> (doğrudan bellek erişimi) denetleyicisi veriyi çevre biriminden belleğe işlemci olmadan taşır. Dairesel kipte tampon sonuna gelince başa döner; DMA iki kesme üretir:</p>
<ul><li><b>HT</b> (yarım aktarım): tamponun ilk yarısı doldu; DMA şimdi ikinci yarıya yazıyor, işlemci ilk yarıyı işleyebilir.</li><li><b>TC</b> (tam aktarım): ikinci yarı doldu; DMA başa döndü.</li></ul>
<p>Bu, <b>çift tamponlama</b>dır (ping-pong). Kural: işlemci bir yarıyı, DMA öbür yarıyı doldurmadan bitirmelidir; yoksa veri işlenirken üzerine yazılır (overrun).</p>
<h3>Gürültü</h3>
<p>Yarım tamponun ortalaması basit ve etkili bir alçak geçiren süzgeçtir. Analog besleme (VDDA) ve toprak düzeni de en az yazılım kadar önemlidir.</p>`,
      code: [adcDmaHal('tr')],
      tryIt: 'DMA simülasyonunda 16 hücreli tampon ve 10 µs örnekleme ile işleme süresini 50 µs\'ye ayarla: HT ve TC sırasını izle. İşleme süresini 80 ve 120 µs\'ye çıkar: taşma hangi değerde başlıyor ve neden yarı tampon süresiyle ilgili? Tamponu 64 hücreye büyütüp tekrar dene.',
      pitfalls: ['Pini analog kipe almadan ADC okumak: değer anlamsız gelir.', 'Yüksek dirençli kaynağı en kısa örnekleme süresiyle okumak: değer gerçeğin altında çıkar.', 'DMA tamponunu yerel (yığında) değişken yapmak: fonksiyon dönünce DMA başka verinin üzerine yazar.', 'Önbellekli çekirdeklerde (M7) DMA tamponunun önbellek tutarlılığını unutmak.'],
      se: `<p>DMA ile işlemci arasındaki sözleşme <b>zamana bağlıdır</b>: işleme süresi bütçesi yarı tampon süresidir.</p>
<ul><li>İşleme süresini DWT çevrim sayacıyla ölç ve bir testte bütçeyle karşılaştır.</li><li>Süzgeç ve ölçekleme kodunu saf fonksiyon yapıp kayıtlı ADC verisiyle bilgisayarda test et.</li></ul>`,
      quiz: [
        { q: '12 bit ADC, Vref = 3,3 V. 1,65 V hangi koda karşılık gelir?', options: ['1024', '2048', '4095', '1650'], answer: 1, why: '1,65 / 3,3 × 4096 = 2048.' },
        { q: 'Dairesel DMA\'da HT kesmesi geldiğinde işlemci ne yapmalı?', options: ['Tamponun ikinci yarısını işlemek', 'Tamponun ilk yarısını işlemek', 'DMA\'yı durdurmak', 'Hiçbir şey'], answer: 1, why: 'İlk yarı doldu, DMA ikinci yarıya yazıyor.' },
        { q: 'Yarı tampon 80 µs\'de doluyorsa işleme süresi için koşul?', options: ['> 80 µs', '< 80 µs', 'Tam 80 µs', 'Fark etmez'], answer: 1, why: 'DMA öbür yarıyı doldurmadan işlem bitmeli.' },
        { q: 'DMA tamponu neden yerel değişken olmamalı?', options: ['Yavaş olduğu için', 'Fonksiyon dönünce yığın alanı başka işe kullanılır, DMA oraya yazmaya devam eder', 'Derleyici izin vermez', 'Daha çok Flash kullanır'], answer: 1, why: 'DMA arka planda yazar; tampon kalıcı (static ya da global) olmalı.' },
      ],
    },
    en: {
      title: 'ADC and DMA',
      summary: '12-bit conversion, sampling time, scan mode; DMA that moves data instead of the CPU, a circular buffer and half/full transfer.',
      goals: ['Convert a voltage to a 12-bit ADC code and back, and explain the effect of sampling time', 'Compute the per-channel sample rate of several channels in scan mode', 'Show how DMA relieves the CPU and how circular mode works', 'Build double buffering with the half and full transfer interrupts and prevent overrun'],
      notes: `<p>The STM32F4\'s ADC is 12-bit: it splits the 0–3.3 V range into 4096 steps, one step ≈ 0.8 mV. The pin is first put in analog mode (MODER = 11). A conversion has two phases: <b>sampling</b> (an internal capacitor charges to the input) and <b>conversion</b> (12 cycles). If the source impedance is high (an LDR divider, a long cable), the capacitor cannot fully charge; choose a longer sampling time.</p>
<div class="eq">code = V / 3.3 × 4096 &nbsp;&nbsp; t<sub>conv</sub> = (sampling + 12) / f<sub>ADC</sub></div>
<h3>Why DMA?</h3>
<p>Taking 100 000 samples per second and telling the CPU "read" with an interrupt for each one eats most of the CPU\'s time. The <b>DMA</b> (direct memory access) controller moves data from a peripheral to memory without the CPU. In circular mode the buffer wraps to the start at the end; the DMA produces two interrupts:</p>
<ul><li><b>HT</b> (half transfer): the first half of the buffer is full; the DMA is now writing the second half and the CPU can process the first.</li><li><b>TC</b> (transfer complete): the second half is full; the DMA has wrapped to the start.</li></ul>
<p>This is <b>double buffering</b> (ping-pong). The rule: the CPU must finish one half before the DMA fills the other; otherwise data is overwritten while being processed (overrun).</p>
<h3>Noise</h3>
<p>The mean of a half buffer is a simple and effective low-pass filter. The analog supply (VDDA) and the ground layout matter at least as much as the software.</p>`,
      code: [adcDmaHal('en')],
      tryIt: 'In the DMA simulation, with a 16-cell buffer and 10 µs sampling, set the processing time to 50 µs: watch the order of HT and TC. Raise the processing time to 80 and 120 µs: at which value does overrun start, and why does it relate to the half-buffer time? Grow the buffer to 64 cells and try again.',
      pitfalls: ['Reading the ADC without putting the pin in analog mode: the value is meaningless.', 'Reading a high-impedance source with the shortest sampling time: the value comes out below the truth.', 'Making the DMA buffer a local (stack) variable: when the function returns, the DMA writes over other data.', 'Forgetting cache coherence of the DMA buffer on cached cores (M7).'],
      se: `<p>The contract between DMA and the CPU is <b>time-bound</b>: the processing-time budget is the half-buffer time.</p>
<ul><li>Measure the processing time with the DWT cycle counter and compare it with the budget in a test.</li><li>Make the filter and scaling code pure functions and test them on the PC with recorded ADC data.</li></ul>`,
      quiz: [
        { q: '12-bit ADC, Vref = 3.3 V. Which code is 1.65 V?', options: ['1024', '2048', '4095', '1650'], answer: 1, why: '1.65 / 3.3 × 4096 = 2048.' },
        { q: 'In circular DMA, what should the CPU do when the HT interrupt arrives?', options: ['Process the second half of the buffer', 'Process the first half of the buffer', 'Stop the DMA', 'Nothing'], answer: 1, why: 'The first half is full; the DMA is writing the second half.' },
        { q: 'If a half buffer fills in 80 µs, what is the condition on processing time?', options: ['> 80 µs', '< 80 µs', 'Exactly 80 µs', 'It does not matter'], answer: 1, why: 'Processing must finish before the DMA fills the other half.' },
        { q: 'Why must the DMA buffer not be a local variable?', options: ['Because it is slow', 'When the function returns the stack space is reused, and the DMA keeps writing there', 'The compiler forbids it', 'It uses more Flash'], answer: 1, why: 'The DMA writes in the background; the buffer must be permanent (static or global).' },
      ],
    },
  },
  {
    n: 9, hours: 5, sims: ['bus'], hyvex: ['stm32', 'bme280', 'oled-ssd1306-0-96', 'mpu6050', 'logic-analyzer'], esofWeek: 3,
    tr: {
      title: 'I²C ve SPI: zamanlama diyagramları',
      summary: 'I²C\'de START/STOP, adres, ACK/NACK, çekme dirençleri; SPI\'da CPOL/CPHA kipleri ve CS; mantık analizörüyle hata bulma.',
      goals: ['Bir I²C işlemini START\'tan STOP\'a çizmek ve ACK/NACK\'ı yorumlamak', 'I²C çekme direnci için alt ve üst sınırı hesaplamak', 'SPI\'ın dört kipini ayırt etmek ve kip uyuşmazlığının belirtisini tanımak', 'HAL ile bir sensör yazmacını okumak ve hata durumunu ele almak'],
      notes: `<p>Raspberry Pi dersinde I²C ve SPI\'ı "cihaz bağla, kütüphane çağır" düzeyinde kullandık. Burada tellerde ne olduğuna bakıyoruz; çünkü bir sensör yanıt vermediğinde sorunu ancak dalga biçimi söyler.</p>
<h3>I²C</h3>
<p>İki açık-drain hat: SDA (veri) ve SCL (saat), ikisi de çekme dirençleriyle 3,3 V\'a bağlı. Kural: <b>SDA yalnız SCL düşükken değişir</b>. SCL yüksekken SDA\'nın düşmesi START, yükselmesi STOP\'tur. START\'tan sonra 7 bit adres + 1 bit R/W gönderilir; dokuzuncu saatte köle SDA\'yı 0\'a çekerse <b>ACK</b>, çekmezse <b>NACK</b> (cihaz yok, adres yanlış ya da meşgul). Okumada efendi, son baytta NACK vererek "yeter" der.</p>
<p>Çekme direnci çok büyükse kenarlar yavaş yükselir (yol kapasitesi × R); çok küçükse çıkış 3 mA\'dan fazla çekmek zorunda kalır. 100 kHz ve 200 pF için yaklaşık 1–6 kΩ arası uygundur; 4,7 kΩ yaygın seçimdir.</p>
<h3>SPI</h3>
<p>Dört hat: SCK, MOSI, MISO, CS. Her saat darbesinde iki yönde birer bit gider. <b>CPOL</b> boştaki saat seviyesini, <b>CPHA</b> verinin hangi kenarda örneklendiğini belirler; dört kip (0–3) vardır. Efendi ile köle aynı kipte değilse okunan bayt bir bit kayar ya da tamamen bozulur: tipik belirti "değerler ikiye katlanmış ya da yarıya inmiş" gibidir. Sensörün veri sayfası kipi söyler.</p>
<h3>Mantık analizörü</h3>
<p>Ucuz bir mantık analizörü ve PulseView gibi bir yazılım, I²C ve SPI\'ı çözümleyip baytları ekrana yazar. "Kod doğru ama sensör çalışmıyor" durumunda ilk araç budur.</p>`,
      code: [i2cSpiHal('tr')],
      tryIt: 'I²C sekmesinde 0x76 adresine 0xD0 yazmacını okuyan işlemi çiz; sonra "cihaz yok" seçip NACK\'ı gör. SDA\'nın SCL yüksekken yalnız START ve STOP\'ta değiştiğini doğrula. SPI sekmesinde dört kipi tek tek seç ve örnekleme kenarlarını karşılaştır; köleyi kip 0, efendiyi kip 1 yapıp okunan baytı yaz.',
      pitfalls: ['HAL\'e 7 bitlik adresi kaydırmadan vermek: HAL 8 bitlik (adres << 1) ister, cihaz NACK verir.', 'I²C çekme dirençlerini unutmak ya da her modülün kendi direncini paralel bırakmak (eşdeğer direnç çok küçülür).', 'SPI CS hattını işlem boyunca düşük tutmamak.', 'Zaman aşımını HAL_MAX_DELAY yapmak: takılan bir I²C yolu tüm programı kilitler.'],
      se: `<p>Sürücüyü iki katmana ayır: <b>yol</b> (i2c_read(addr, reg, buf, n)) ve <b>cihaz</b> (bme280_read_temp()).</p>
<ul><li>Cihaz katmanı sahte bir yol ile bilgisayarda test edilir: kayıtlı yazmaç değerlerinden doğru sıcaklık çıkıyor mu?</li><li>Her yol çağrısının hata kodu kontrol edilir ve günlüğe yazılır; sessizce 0 döndürmek yok.</li></ul>`,
      quiz: [
        { q: 'I²C\'de SCL yüksekken SDA düşerse bu nedir?', options: ['Veri biti 0', 'START koşulu', 'STOP koşulu', 'ACK'], answer: 1, why: 'SDA yalnız SCL düşükken değişir; SCL yüksekken değişim START ya da STOP\'tur.' },
        { q: 'Adres baytından sonra dokuzuncu saatte SDA yüksek kaldıysa?', options: ['ACK: cihaz hazır', 'NACK: cihaz yok ya da adres yanlış', 'STOP', 'Veri hazır'], answer: 1, why: 'Köle SDA\'yı çekmediyse NACK\'tır.' },
        { q: 'SPI kip 3 hangi CPOL/CPHA\'dır?', options: ['0/0', '0/1', '1/0', '1/1'], answer: 3, why: 'Kip = CPOL × 2 + CPHA: 3 → CPOL 1, CPHA 1.' },
        { q: 'HAL_I2C_Mem_Read\'e BME280 (0x76) için hangi adres verilir?', options: ['0x76', '0xEC (0x76 << 1)', '0x3B', '0xD0'], answer: 1, why: 'HAL 8 bitlik adres biçimini ister.' },
      ],
    },
    en: {
      title: 'I²C and SPI: timing diagrams',
      summary: 'START/STOP, address, ACK/NACK and pull-ups in I²C; CPOL/CPHA modes and CS in SPI; finding faults with a logic analyser.',
      goals: ['Draw an I²C transaction from START to STOP and interpret ACK/NACK', 'Compute the lower and upper limits of an I²C pull-up resistor', 'Tell the four SPI modes apart and recognise the symptom of a mode mismatch', 'Read a sensor register with HAL and handle the error case'],
      notes: `<p>In the Raspberry Pi course we used I²C and SPI at the level of "connect a device, call a library". Here we look at what happens on the wires, because when a sensor does not answer, only the waveform tells you why.</p>
<h3>I²C</h3>
<p>Two open-drain lines: SDA (data) and SCL (clock), both pulled up to 3.3 V. The rule: <b>SDA changes only while SCL is low</b>. SDA falling while SCL is high is START, rising is STOP. After START, a 7-bit address + 1 R/W bit are sent; on the ninth clock, if the slave pulls SDA to 0 it is an <b>ACK</b>, if not a <b>NACK</b> (no device, wrong address or busy). When reading, the master says "enough" by giving a NACK on the last byte.</p>
<p>If the pull-up is too large, edges rise slowly (bus capacitance × R); if too small, the output has to sink more than 3 mA. For 100 kHz and 200 pF, about 1–6 kΩ is suitable; 4.7 kΩ is the common choice.</p>
<h3>SPI</h3>
<p>Four lines: SCK, MOSI, MISO, CS. On each clock pulse one bit goes in each direction. <b>CPOL</b> sets the idle clock level, <b>CPHA</b> the edge on which data is sampled; there are four modes (0–3). If master and slave are not in the same mode, the byte read is shifted by a bit or completely corrupted: a typical symptom looks like "values doubled or halved". The sensor\'s datasheet gives the mode.</p>
<h3>Logic analyser</h3>
<p>A cheap logic analyser and software such as PulseView decode I²C and SPI and print the bytes on screen. When "the code is right but the sensor does not work", this is the first tool.</p>`,
      code: [i2cSpiHal('en')],
      tryIt: 'In the I²C tab draw the transaction that reads register 0xD0 from address 0x76; then choose "no device" and see the NACK. Check that SDA changes while SCL is high only at START and STOP. In the SPI tab pick the four modes one by one and compare the sampling edges; set the slave to mode 0 and the master to mode 1 and write down the byte read.',
      pitfalls: ['Passing the 7-bit address to HAL without shifting: HAL wants the 8-bit form (address << 1) and the device NACKs.', 'Forgetting the I²C pull-ups, or leaving every module\'s own pull-ups in parallel (the equivalent resistance gets very small).', 'Not holding the SPI CS line low for the whole transaction.', 'Using HAL_MAX_DELAY as the timeout: a stuck I²C bus locks the whole program.'],
      se: `<p>Split the driver into two layers: <b>bus</b> (i2c_read(addr, reg, buf, n)) and <b>device</b> (bme280_read_temp()).</p>
<ul><li>The device layer is tested on the PC with a fake bus: do recorded register values give the right temperature?</li><li>Every bus call\'s error code is checked and logged; no silently returning 0.</li></ul>`,
      quiz: [
        { q: 'In I²C, SDA falls while SCL is high. What is it?', options: ['A data bit 0', 'A START condition', 'A STOP condition', 'An ACK'], answer: 1, why: 'SDA changes only while SCL is low; a change while SCL is high is START or STOP.' },
        { q: 'After the address byte, SDA stayed high on the ninth clock. What does it mean?', options: ['ACK: device ready', 'NACK: no device or wrong address', 'STOP', 'Data ready'], answer: 1, why: 'If the slave did not pull SDA down it is a NACK.' },
        { q: 'Which CPOL/CPHA is SPI mode 3?', options: ['0/0', '0/1', '1/0', '1/1'], answer: 3, why: 'Mode = CPOL × 2 + CPHA: 3 → CPOL 1, CPHA 1.' },
        { q: 'Which address do you pass to HAL_I2C_Mem_Read for a BME280 (0x76)?', options: ['0x76', '0xEC (0x76 << 1)', '0x3B', '0xD0'], answer: 1, why: 'HAL wants the 8-bit address form.' },
      ],
    },
  },
  {
    n: 10, hours: 3, sims: ['power'], hyvex: ['stm32', 'li-ion-18650-batarya', 'coin-cell-cr2032-batarya', 'multimetre'],
    tr: {
      title: 'Düşük güç: Sleep, Stop ve Standby',
      summary: 'Çalışma, uyku, durdurma ve bekleme kipleri; uyandırma kaynakları; görev döngüsüyle pil ömrü hesabı.',
      goals: ['STM32\'nin düşük güç kiplerini (Sleep, Stop, Standby) neyin açık kaldığına göre ayırt etmek', 'Her kip için uyandırma kaynağını (kesme, EXTI, RTC, WKUP pini) seçmek', 'Görev döngüsünden ortalama akımı ve pil ömrünü hesaplamak', 'Stop\'tan uyanınca saat ağacını yeniden kurmanın gerekliliğini açıklamak'],
      notes: `<p>Pille çalışan bir sensör düğümü zamanının %99\'unu bekleyerek geçirir. O bekleme süresinde ne kadar akım çektiği, pilin günler mi yıllar mı dayanacağını belirler.</p>
<ul><li><b>Run</b>: her şey açık; F4 sınıfında birkaç on mA.</li><li><b>Sleep</b>: <code>__WFI()</code> ile çekirdek durur, çevre birimleri ve saatler çalışır; herhangi bir kesme uyandırır. Uyanış neredeyse anlıktır.</li><li><b>Stop</b>: tüm yüksek hızlı saatler durur, RAM ve yazmaçlar korunur; EXTI ya da RTC uyandırır. Akım yüz mikroamper düzeyine iner. Uyanınca çekirdek HSI ile başlar: PLL\'i yeniden kurmak gerekir.</li><li><b>Standby</b>: neredeyse her şey kapanır, RAM silinir; yalnız RTC, yedek yazmaçlar ve WKUP pini kalır. Uyanış sıfırlama gibidir, program baştan başlar. Akım birkaç mikroamper.</li></ul>
<h3>Hesap</h3>
<div class="eq">I<sub>ort</sub> = (I<sub>run</sub> · t<sub>uyanık</sub> + I<sub>uyku</sub> · t<sub>uyku</sub>) / T &nbsp;&nbsp; ömür = kapasite / I<sub>ort</sub></div>
<p>Örnek: her saniye 10 ms ölçüm yapıp kalan sürede Stop\'ta bekleyen bir düğüm, sürekli çalışan aynı düğümden onlarca kat uzun yaşar. Ama uyku akımı küçükse, kartın üzerindeki LED, regülatör ve ST-LINK gibi başka tüketiciler baskın hale gelir: ölçüm her zaman multimetreyle karttan yapılır.</p>
<h3>Tasarım</h3>
<p>Kullanılmayan pinleri analog kipe al (giriş tamponu akım çekmez), kullanılmayan çevre birimlerinin saatini kapat, ölçümleri topla ve tek seferde gönder. Kip seçiminde uyanış süresi ve RAM\'in korunup korunmadığı da ödünleşimin parçasıdır.</p>`,
      code: [stopHal('tr')],
      tryIt: 'Güç simülasyonunda 2000 mAh pil, 1 s periyot ve 10 ms uyanık süreyle dört kipi karşılaştır. Run ile Stop arasındaki pil ömrü oranını yaz. Uyanık süreyi 100 ms\'ye çıkar: Standby\'ın üstünlüğü neden azaldı? Periyodu 10 s yap ve hangi terimin baskın olduğunu açıkla.',
      pitfalls: ['Stop\'tan uyandıktan sonra saati yeniden kurmamak: kod 16 MHz HSI\'de devam eder, UART baud ve zamanlamalar bozulur.', 'SysTick\'i askıya almadan Sleep\'e girmek: her 1 ms\'de uyanırsın.', 'Kullanılmayan pinleri yüzer giriş bırakmak: giriş tamponu akım çeker.', 'Akımı yalnız veri sayfasından okumak: karttaki diğer bileşenler uyku akımını katlar.'],
      se: `<p>Güç bir <b>gereksinimdir</b> ve ölçülebilir yazılmalıdır: "2000 mAh ile en az 6 ay".</p>
<ul><li>Pil bütçesini bir tabloda tut (kip, akım, süre); her yeni özellik bütçeye eklenir.</li><li>Uyku/uyanma geçişini durum makinesi olarak yaz; uyanış nedenini günlüğe kaydet.</li></ul>`,
      quiz: [
        { q: 'Hangi kipte RAM içeriği korunur ve EXTI ile uyanılır?', options: ['Standby', 'Stop', 'Kapalı', 'Hiçbiri'], answer: 1, why: 'Stop RAM\'i korur; Standby\'da RAM silinir.' },
        { q: 'Standby\'dan uyanınca program nereden devam eder?', options: ['WFI\'den sonraki satırdan', 'Baştan (sıfırlama gibi)', 'Son kesmeden', 'Uyanamaz'], answer: 1, why: 'Standby\'dan uyanış bir sıfırlama gibidir.' },
        { q: 'Run 20 mA, Stop 0,3 mA. Her 1 s\'de 10 ms çalışan düğümün ortalama akımı yaklaşık?', options: ['0,1 mA', '0,5 mA', '2 mA', '20 mA'], answer: 1, why: '(20 × 0,01 + 0,3 × 0,99) / 1 ≈ 0,5 mA.' },
        { q: 'Stop\'tan uyandıktan sonra ilk yapılması gereken?', options: ['Flash\'ı silmek', 'SystemClock_Config ile PLL\'i yeniden kurmak', 'RAM\'i sıfırlamak', 'Standby\'a geçmek'], answer: 1, why: 'Uyanışta çekirdek HSI ile başlar.' },
      ],
    },
    en: {
      title: 'Low power: Sleep, Stop and Standby',
      summary: 'Run, sleep, stop and standby modes; wake-up sources; battery life from the duty cycle.',
      goals: ['Tell the STM32 low-power modes (Sleep, Stop, Standby) apart by what stays on', 'Choose the wake-up source for each mode (interrupt, EXTI, RTC, WKUP pin)', 'Compute the average current and battery life from the duty cycle', 'Explain why the clock tree must be reconfigured after waking from Stop'],
      notes: `<p>A battery-powered sensor node spends 99 % of its time waiting. How much current it draws while waiting decides whether the battery lasts days or years.</p>
<ul><li><b>Run</b>: everything on; tens of mA on an F4-class part.</li><li><b>Sleep</b>: <code>__WFI()</code> stops the core, peripherals and clocks keep running; any interrupt wakes it. Waking is almost instant.</li><li><b>Stop</b>: all high-speed clocks stop, RAM and registers are kept; EXTI or the RTC wakes it. Current drops to the hundred-microamp level. On waking the core starts on HSI: the PLL must be reconfigured.</li><li><b>Standby</b>: almost everything is off and RAM is lost; only the RTC, backup registers and the WKUP pin remain. Waking is like a reset and the program starts over. Current is a few microamps.</li></ul>
<h3>The calculation</h3>
<div class="eq">I<sub>avg</sub> = (I<sub>run</sub> · t<sub>awake</sub> + I<sub>sleep</sub> · t<sub>sleep</sub>) / T &nbsp;&nbsp; life = capacity / I<sub>avg</sub></div>
<p>Example: a node that measures for 10 ms every second and waits in Stop for the rest lives dozens of times longer than the same node running continuously. But when the sleep current is tiny, other consumers on the board such as an LED, the regulator and the ST-LINK dominate: always measure on the board with a multimeter.</p>
<h3>Design</h3>
<p>Put unused pins in analog mode (the input buffer draws no current), turn off the clocks of unused peripherals, collect measurements and send them in one go. Wake-up time and whether RAM is kept are also part of the trade-off when choosing a mode.</p>`,
      code: [stopHal('en')],
      tryIt: 'In the power simulation compare the four modes with a 2000 mAh battery, a 1 s period and 10 ms awake. Write down the battery-life ratio between Run and Stop. Raise the awake time to 100 ms: why did Standby\'s advantage shrink? Set the period to 10 s and explain which term dominates.',
      pitfalls: ['Not reconfiguring the clock after waking from Stop: the code continues on the 16 MHz HSI and UART baud and timing break.', 'Entering Sleep without suspending SysTick: you wake every 1 ms.', 'Leaving unused pins as floating inputs: the input buffer draws current.', 'Reading the current only from the datasheet: other components on the board multiply the sleep current.'],
      se: `<p>Power is a <b>requirement</b> and must be written measurably: "at least 6 months on 2000 mAh".</p>
<ul><li>Keep a battery budget in a table (mode, current, time); every new feature is added to the budget.</li><li>Write the sleep/wake transition as a state machine and log the wake-up reason.</li></ul>`,
      quiz: [
        { q: 'In which mode is RAM kept and EXTI wakes the chip?', options: ['Standby', 'Stop', 'Off', 'None'], answer: 1, why: 'Stop keeps RAM; in Standby RAM is lost.' },
        { q: 'Where does the program continue after waking from Standby?', options: ['From the line after WFI', 'From the start (like a reset)', 'From the last interrupt', 'It cannot wake'], answer: 1, why: 'Waking from Standby is like a reset.' },
        { q: 'Run 20 mA, Stop 0.3 mA. A node awake 10 ms every 1 s averages roughly?', options: ['0.1 mA', '0.5 mA', '2 mA', '20 mA'], answer: 1, why: '(20 × 0.01 + 0.3 × 0.99) / 1 ≈ 0.5 mA.' },
        { q: 'The first thing to do after waking from Stop?', options: ['Erase Flash', 'Reconfigure the PLL with SystemClock_Config', 'Clear RAM', 'Enter Standby'], answer: 1, why: 'On waking the core starts on HSI.' },
      ],
    },
  },
  {
    n: 11, hours: 6, sims: ['rtos'], hyvex: ['stm32', 'st-link-j-link-debugger'],
    tr: {
      title: 'FreeRTOS: görevler, zamanlayıcı ve senkronizasyon',
      summary: 'Süper döngüden görevlere; öncelikli kesintili zamanlama, tick, zaman dilimleme; kuyruk, semafor, mutex ve öncelik tersine dönmesi.',
      goals: ['Süper döngünün sınırlarını ve bir RTOS\'un ne kazandırdığını açıklamak', 'Görev oluşturup öncelik vermek; vTaskDelayUntil ile kaymasız periyot kurmak', 'Zamanlayıcının kararlarını (kesinti, zaman dilimleme, boşta görev) zaman çizelgesinde okumak', 'Kuyruk ve mutex kullanmak; öncelik tersine dönmesini ve kalıtımı göstermek'],
      notes: `<p>Şimdiye kadarki programlar bir <b>süper döngü</b>ydü: <code>while (1)</code> içinde sırayla motor, UART, sensör. Bir iş uzarsa diğerleri gecikir; her işin zamanlamasını elle dengelemek gerekir. <b>FreeRTOS</b> gibi gerçek zamanlı işletim sistemi, programı bağımsız <b>görevlere</b> böler ve hangisinin çalışacağına bir <b>zamanlayıcı</b> karar verir.</p>
<h3>Zamanlama kuralları</h3>
<ul><li><b>Öncelikli ve kesintili</b>: çalışmaya hazır en yüksek öncelikli görev çalışır. Daha yüksek öncelikli bir görev hazır olunca, çalışan görev hemen kesilir.</li><li><b>Tick</b>: SysTick her 1 ms\'de zamanlayıcıyı çağırır; gecikmeler tick cinsindendir.</li><li><b>Zaman dilimleme</b>: eşit öncelikli hazır görevler her tick\'te sırayla çalışır.</li><li><b>Boşta görev</b>: hiçbir görev hazır değilse çalışır; burada düşük güç kipine girilebilir.</li></ul>
<p>Periyodik bir görev <code>vTaskDelayUntil</code> kullanmalıdır: <code>vTaskDelay(5)</code> "şimdiden 5 tick sonra" der ve işin süresi kadar kayar; DelayUntil "bir önceki uyanıştan 5 tick sonra" der.</p>
<div class="eq">U = Σ C<sub>i</sub> / T<sub>i</sub> &nbsp;&nbsp; RM yeterli koşulu: U ≤ n (2<sup>1/n</sup> − 1)</div>
<h3>Senkronizasyon</h3>
<p>Görevler küresel değişken yerine <b>kuyrukla</b> veri paylaşır. Paylaşılan bir kaynağı (UART) korumak için <b>mutex</b> kullanılır. Tehlike: düşük öncelikli görev mutex\'i tutarken yüksek öncelikli görev onu bekler, bu arada orta öncelikli görev düşüğü keserse yüksek görev de orta görevi bekler: <b>öncelik tersine dönmesi</b>. FreeRTOS mutex\'leri <b>öncelik kalıtımı</b> uygular: mutex\'i tutan görev geçici olarak bekleyenin önceliğine yükselir. Bu yüzden kaynak koruma için ikili semafor değil mutex seçilir.</p>`,
      code: [rtosC('tr')],
      tryIt: 'RTOS görselleştiricisinde varsayılan üç görevle çizelgeyi incele: motor görevi neden her 5 tick\'te hemen çalışıyor? Günlük görevinin süresini artırıp kullanım oranını 1\'in üstüne çıkar ve kaçan son tarihleri gör. "Öncelik tersine dönmesi" senaryosunu aç, yüksek görevin yanıt süresini kalıtım kapalı ve açıkken karşılaştır.',
      pitfalls: ['Yüksek öncelikli görevde sonsuz döngüyü bekleme (delay ya da kuyruk) olmadan yazmak: düşük öncelikli görevler hiç çalışmaz.', 'Görev yığınını küçük vermek: taşma rastgele çökme yapar; configCHECK_FOR_STACK_OVERFLOW aç.', 'ISR\'de normal API kullanmak: ISR\'den yalnız ...FromISR işlevleri çağrılır.', 'Kaynak korumak için ikili semafor kullanmak: öncelik kalıtımı yoktur.'],
      se: `<p>Görev tasarımı bir <b>mimari belgedir</b>: her görevin önceliği, periyodu, en kötü süre tahmini ve iletişim kanalları bir tabloda.</p>
<ul><li>Bu tablo, simülasyondaki gibi bir çizelgeleme analizine girer; kullanım oranı ve yanıt süreleri hesaplanır.</li><li>Görev gövdelerindeki mantık saf fonksiyonlardadır ve RTOS olmadan test edilir.</li></ul>`,
      quiz: [
        { q: 'Öncelik 3 ve öncelik 1 iki görev aynı anda hazırsa hangisi çalışır?', options: ['Öncelik 1', 'Öncelik 3', 'Sırayla', 'Hiçbiri'], answer: 1, why: 'FreeRTOS\'ta büyük sayı yüksek önceliktir (NVIC\'in tersine).' },
        { q: 'Periyodik görevde vTaskDelayUntil neden vTaskDelay\'e tercih edilir?', options: ['Daha az bellek', 'Periyot işin süresinden bağımsız kalır, kayma olmaz', 'Daha yüksek öncelik verir', 'ISR\'den çağrılabilir'], answer: 1, why: 'DelayUntil bir önceki uyanış anına göre bekler.' },
        { q: 'Öncelik tersine dönmesinin FreeRTOS\'taki çözümü?', options: ['Daha hızlı işlemci', 'Mutex\'in öncelik kalıtımı', 'Tüm görevleri aynı önceliğe almak', 'Kuyruğu büyütmek'], answer: 1, why: 'Mutex\'i tutan düşük görev, bekleyen yüksek görevin önceliğine geçici olarak çıkar.' },
        { q: 'Görevler 1/5, 3/10 ve 4/20 (süre/periyot). Toplam kullanım?', options: ['0,5', '0,7', '0,9', '1,2'], answer: 1, why: '0,2 + 0,3 + 0,2 = 0,7.' },
      ],
    },
    en: {
      title: 'FreeRTOS: tasks, the scheduler and synchronisation',
      summary: 'From a super-loop to tasks; preemptive priority scheduling, the tick, time slicing; queues, semaphores, mutexes and priority inversion.',
      goals: ['Explain the limits of a super-loop and what an RTOS gives you', 'Create tasks with priorities and set up a drift-free period with vTaskDelayUntil', 'Read the scheduler\'s decisions (preemption, time slicing, idle task) on a timeline', 'Use queues and mutexes; demonstrate priority inversion and inheritance'],
      notes: `<p>The programs so far were a <b>super-loop</b>: motor, UART, sensor in turn inside <code>while (1)</code>. If one job runs long, the others are delayed; every job\'s timing has to be balanced by hand. A real-time operating system such as <b>FreeRTOS</b> splits the program into independent <b>tasks</b> and a <b>scheduler</b> decides which one runs.</p>
<h3>Scheduling rules</h3>
<ul><li><b>Preemptive priority</b>: the highest-priority ready task runs. When a higher-priority task becomes ready, the running task is interrupted at once.</li><li><b>Tick</b>: SysTick calls the scheduler every 1 ms; delays are in ticks.</li><li><b>Time slicing</b>: ready tasks of equal priority take turns every tick.</li><li><b>Idle task</b>: runs when no task is ready; this is where a low-power mode can be entered.</li></ul>
<p>A periodic task should use <code>vTaskDelayUntil</code>: <code>vTaskDelay(5)</code> says "5 ticks from now" and drifts by the job\'s duration; DelayUntil says "5 ticks after the previous wake-up".</p>
<div class="eq">U = Σ C<sub>i</sub> / T<sub>i</sub> &nbsp;&nbsp; RM sufficient condition: U ≤ n (2<sup>1/n</sup> − 1)</div>
<h3>Synchronisation</h3>
<p>Tasks share data through <b>queues</b> instead of global variables. A <b>mutex</b> protects a shared resource (the UART). The danger: a low-priority task holds the mutex, a high-priority task waits for it, and meanwhile a medium-priority task preempts the low one, so the high task ends up waiting for the medium one: <b>priority inversion</b>. FreeRTOS mutexes implement <b>priority inheritance</b>: the task holding the mutex is temporarily raised to the waiter\'s priority. That is why a mutex, not a binary semaphore, is chosen to protect a resource.</p>`,
      code: [rtosC('en')],
      tryIt: 'In the RTOS visualiser study the schedule with the default three tasks: why does the motor task run immediately every 5 ticks? Increase the log task\'s run time to push utilisation above 1 and see the missed deadlines. Turn on the "priority inversion" scenario and compare the high task\'s response time with inheritance off and on.',
      pitfalls: ['Writing an endless loop in a high-priority task without blocking (delay or queue): lower-priority tasks never run.', 'Giving a task too small a stack: overflow causes random crashes; enable configCHECK_FOR_STACK_OVERFLOW.', 'Using the normal API from an ISR: only the ...FromISR functions may be called from an ISR.', 'Using a binary semaphore to protect a resource: it has no priority inheritance.'],
      se: `<p>Task design is an <b>architecture document</b>: each task\'s priority, period, worst-case time estimate and communication channels in a table.</p>
<ul><li>That table feeds a schedulability analysis like the simulation; utilisation and response times are computed.</li><li>The logic inside task bodies lives in pure functions and is tested without the RTOS.</li></ul>`,
      quiz: [
        { q: 'If a priority-3 and a priority-1 task are ready at the same time, which runs?', options: ['Priority 1', 'Priority 3', 'In turn', 'Neither'], answer: 1, why: 'In FreeRTOS a larger number is a higher priority (the opposite of the NVIC).' },
        { q: 'Why is vTaskDelayUntil preferred over vTaskDelay in a periodic task?', options: ['Less memory', 'The period stays independent of the job\'s duration; no drift', 'It gives a higher priority', 'It can be called from an ISR'], answer: 1, why: 'DelayUntil waits relative to the previous wake-up time.' },
        { q: 'FreeRTOS\'s fix for priority inversion?', options: ['A faster processor', 'The mutex\'s priority inheritance', 'Putting all tasks at the same priority', 'A bigger queue'], answer: 1, why: 'The low task holding the mutex is temporarily raised to the waiting high task\'s priority.' },
        { q: 'Tasks 1/5, 3/10 and 4/20 (run time/period). Total utilisation?', options: ['0.5', '0.7', '0.9', '1.2'], answer: 1, why: '0.2 + 0.3 + 0.2 = 0.7.' },
      ],
    },
  },
]
