// ARM (STM32) dersinin C kod örnekleri: kayıt düzeyi ve HAL yan yana. Kod iki dilde aynı, yalnız yorumlar c(tr, en) ile
// çevrilir (satır sayısı eşit kalır). Hedef: STM32F4 (Nucleo-F401RE / F411 Black Pill); ailelerdeki farklar notlarda.
import { block, type Lang } from '@/lib/gomulu/types'

export const vectorC = (l: Lang) => block(l, 'Açılış: vektör tablosu ve Reset_Handler (sadeleştirilmiş)', 'Boot: vector table and Reset_Handler (simplified)', (c) => `#include <stdint.h>
extern uint32_t _estack, _sidata, _sdata, _edata, _sbss, _ebss;   /* ${c('bağlayıcı betiğinden', 'from the linker script')} */
int main(void);
void Reset_Handler(void);
void Default_Handler(void) { while (1) {} }
void SysTick_Handler(void) __attribute__((weak, alias("Default_Handler")));

/* ${c('Flash\'ın başı (0x0800_0000): ilk kelime yığın tepesi, ikincisi reset adresi', 'start of Flash (0x0800_0000): first word is the stack top, second the reset address')} */
__attribute__((section(".isr_vector")))
const void *vectors[] = { &_estack, Reset_Handler, 0, 0, /* ... */ };

void Reset_Handler(void) {
  uint32_t *src = &_sidata, *dst = &_sdata;
  while (dst < &_edata) *dst++ = *src++;          /* ${c('.data: ilk değerleri Flash\'tan RAM\'e kopyala', '.data: copy initial values from Flash to RAM')} */
  for (dst = &_sbss; dst < &_ebss; ) *dst++ = 0;   /* ${c('.bss: sıfırla', '.bss: zero it')} */
  main();
  while (1) {}
}`)

export const pioIni = (l: Lang) => block(l, 'PlatformIO: platformio.ini ve derleme komutları', 'PlatformIO: platformio.ini and build commands', (c) => `; ${c('Nucleo-F401RE, STM32Cube HAL çerçevesi', 'Nucleo-F401RE, STM32Cube HAL framework')}
[env:nucleo_f401re]
platform = ststm32
board = nucleo_f401re
framework = stm32cube
build_flags = -Wall -Wextra -Os          ; ${c('uyarılar açık, boyuta göre iyileştir', 'warnings on, optimise for size')}
upload_protocol = stlink
debug_tool = stlink
monitor_speed = 115200

; ${c('Terminal:', 'Terminal:')}
;   pio run                 ${c('derle', 'build')}
;   pio run -t upload       ${c('ST-LINK ile yükle', 'flash with ST-LINK')}
;   pio device monitor      ${c('seri port', 'serial port')}
;   pio test -e native      ${c('saf mantık testleri bilgisayarda', 'pure-logic tests on the PC')}`)

export const blinkReg = (l: Lang) => block(l, 'LED (PA5): kayıt düzeyinde, CMSIS başlıklarıyla', 'LED (PA5): register level with CMSIS headers', (c) => `#include "stm32f4xx.h"

int main(void) {
  RCC->AHB1ENR |= RCC_AHB1ENR_GPIOAEN;            /* ${c('1) GPIOA saatini aç', '1) enable the GPIOA clock')} */
  GPIOA->MODER &= ~(3U << (5 * 2));                /* ${c('2) PA5 kip bitlerini temizle', '2) clear the PA5 mode bits')} */
  GPIOA->MODER |=  (1U << (5 * 2));                /* ${c('   01 = genel amaçlı çıkış', '   01 = general-purpose output')} */
  RCC->AHB1ENR |= RCC_AHB1ENR_GPIOCEN;
  GPIOC->PUPDR &= ~(3U << (13 * 2));               /* ${c('PC13 giriş (sıfırlamada zaten 00)', 'PC13 input (already 00 after reset)')} */
  while (1) {
    if ((GPIOC->IDR & (1U << 13)) == 0)            /* ${c('Nucleo butonu basılıyken 0', 'the Nucleo button reads 0 when pressed')} */
      GPIOA->BSRR = 1U << 5;                       /* ${c('set: tek yazma, atomik', 'set: a single atomic write')} */
    else
      GPIOA->BSRR = 1U << (5 + 16);                /* ${c('reset: üst 16 bit', 'reset: upper 16 bits')} */
  }
}`)

export const blinkHal = (l: Lang) => block(l, 'Aynı iş HAL ile', 'The same job with HAL', (c) => `#include "stm32f4xx_hal.h"

int main(void) {
  HAL_Init();                                      /* ${c('SysTick 1 ms, NVIC grubu', 'SysTick 1 ms, NVIC grouping')} */
  __HAL_RCC_GPIOA_CLK_ENABLE();
  __HAL_RCC_GPIOC_CLK_ENABLE();
  GPIO_InitTypeDef g = {0};
  g.Pin = GPIO_PIN_5; g.Mode = GPIO_MODE_OUTPUT_PP; g.Pull = GPIO_NOPULL; g.Speed = GPIO_SPEED_FREQ_LOW;
  HAL_GPIO_Init(GPIOA, &g);
  g.Pin = GPIO_PIN_13; g.Mode = GPIO_MODE_INPUT;
  HAL_GPIO_Init(GPIOC, &g);
  while (1) {
    GPIO_PinState b = HAL_GPIO_ReadPin(GPIOC, GPIO_PIN_13);
    HAL_GPIO_WritePin(GPIOA, GPIO_PIN_5, b == GPIO_PIN_RESET ? GPIO_PIN_SET : GPIO_PIN_RESET);
    HAL_Delay(5);                                  /* ${c('basit sıçrama önleme', 'simple debounce')} */
  }
}`)

export const clockHal = (l: Lang) => block(l, 'SystemClock_Config: HSE 8 MHz → 84 MHz (F401)', 'SystemClock_Config: HSE 8 MHz → 84 MHz (F401)', (c) => `void SystemClock_Config(void) {
  RCC_OscInitTypeDef osc = {0};
  RCC_ClkInitTypeDef clk = {0};
  __HAL_RCC_PWR_CLK_ENABLE();
  __HAL_PWR_VOLTAGESCALING_CONFIG(PWR_REGULATOR_VOLTAGE_SCALE2);
  osc.OscillatorType = RCC_OSCILLATORTYPE_HSE;
  osc.HSEState = RCC_HSE_BYPASS;                   /* ${c('Nucleo: ST-LINK\'ten 8 MHz saat', 'Nucleo: 8 MHz clock from the ST-LINK')} */
  osc.PLL.PLLState = RCC_PLL_ON;
  osc.PLL.PLLSource = RCC_PLLSOURCE_HSE;
  osc.PLL.PLLM = 4;                                /* ${c('8/4 = 2 MHz VCO girişi', '8/4 = 2 MHz VCO input')} */
  osc.PLL.PLLN = 168;                              /* ${c('2 × 168 = 336 MHz VCO', '2 × 168 = 336 MHz VCO')} */
  osc.PLL.PLLP = RCC_PLLP_DIV4;                    /* ${c('336/4 = 84 MHz SYSCLK', '336/4 = 84 MHz SYSCLK')} */
  osc.PLL.PLLQ = 7;                                /* ${c('336/7 = 48 MHz USB', '336/7 = 48 MHz USB')} */
  if (HAL_RCC_OscConfig(&osc) != HAL_OK) Error_Handler();
  clk.ClockType = RCC_CLOCKTYPE_SYSCLK | RCC_CLOCKTYPE_HCLK | RCC_CLOCKTYPE_PCLK1 | RCC_CLOCKTYPE_PCLK2;
  clk.SYSCLKSource = RCC_SYSCLKSOURCE_PLLCLK;
  clk.AHBCLKDivider = RCC_SYSCLK_DIV1;
  clk.APB1CLKDivider = RCC_HCLK_DIV2;              /* ${c('APB1 ≤ 42 MHz; zamanlayıcıları 84 MHz', 'APB1 ≤ 42 MHz; its timers run at 84 MHz')} */
  clk.APB2CLKDivider = RCC_HCLK_DIV1;
  if (HAL_RCC_ClockConfig(&clk, FLASH_LATENCY_2) != HAL_OK) Error_Handler();   /* ${c('84 MHz: 2 bekleme', '84 MHz: 2 wait states')} */
}`)

export const pwmHal = (l: Lang) => block(l, 'TIM3 CH1 (PA6) 20 kHz PWM: HAL', 'TIM3 CH1 (PA6) 20 kHz PWM: HAL', (c) => `TIM_HandleTypeDef htim3;

void pwm_init(void) {
  /* ${c('TIM3 APB1\'de: 84 MHz. 84e6 / (0+1) / (4199+1) = 20 kHz', 'TIM3 is on APB1: 84 MHz. 84e6 / (0+1) / (4199+1) = 20 kHz')} */
  htim3.Instance = TIM3;
  htim3.Init.Prescaler = 0;
  htim3.Init.CounterMode = TIM_COUNTERMODE_UP;
  htim3.Init.Period = 4199;                        /* ARR */
  htim3.Init.AutoReloadPreload = TIM_AUTORELOAD_PRELOAD_ENABLE;
  HAL_TIM_PWM_Init(&htim3);                        /* ${c('PA6 AF2 ayarı HAL_TIM_MspPostInit içinde', 'PA6 AF2 is set in HAL_TIM_MspPostInit')} */
  TIM_OC_InitTypeDef oc = {0};
  oc.OCMode = TIM_OCMODE_PWM1;                     /* ${c('CNT < CCR iken 1', 'high while CNT < CCR')} */
  oc.Pulse = 0;                                    /* CCR */
  oc.OCPolarity = TIM_OCPOLARITY_HIGH;
  HAL_TIM_PWM_ConfigChannel(&htim3, &oc, TIM_CHANNEL_1);
  HAL_TIM_PWM_Start(&htim3, TIM_CHANNEL_1);
}

void pwm_set_percent(uint32_t pct) {
  uint32_t arr = __HAL_TIM_GET_AUTORELOAD(&htim3);
  __HAL_TIM_SET_COMPARE(&htim3, TIM_CHANNEL_1, (arr + 1) * pct / 100);   /* ${c('bir sonraki güncellemede geçerli', 'takes effect at the next update')} */
}`)

export const pwmReg = (l: Lang) => block(l, 'Aynı PWM, yazmaçlarla', 'The same PWM with registers', (c) => `void pwm_init_reg(void) {
  RCC->AHB1ENR |= RCC_AHB1ENR_GPIOAEN;
  RCC->APB1ENR |= RCC_APB1ENR_TIM3EN;
  GPIOA->MODER  = (GPIOA->MODER & ~(3U << 12)) | (2U << 12);      /* ${c('PA6 = AF', 'PA6 = AF')} */
  GPIOA->AFR[0] = (GPIOA->AFR[0] & ~(0xFU << 24)) | (2U << 24);   /* ${c('AF2 = TIM3_CH1', 'AF2 = TIM3_CH1')} */
  TIM3->PSC = 0;
  TIM3->ARR = 4199;
  TIM3->CCR1 = 0;
  TIM3->CCMR1 = (6U << TIM_CCMR1_OC1M_Pos) | TIM_CCMR1_OC1PE;       /* ${c('PWM kip 1, ön yükleme', 'PWM mode 1, preload')} */
  TIM3->CCER |= TIM_CCER_CC1E;                                      /* ${c('kanal çıkışını aç', 'enable the channel output')} */
  TIM3->CR1 |= TIM_CR1_ARPE | TIM_CR1_CEN;                          /* ${c('sayacı başlat', 'start the counter')} */
}`)

export const extiHal = (l: Lang) => block(l, 'EXTI: butonla kesme, ISR\'de kısa iş', 'EXTI: an interrupt from the button, short work in the ISR', (c) => `volatile uint32_t presses = 0;                     /* ${c('ISR ile paylaşılan: volatile', 'shared with the ISR: volatile')} */

void button_init(void) {
  __HAL_RCC_GPIOC_CLK_ENABLE();
  GPIO_InitTypeDef g = {0};
  g.Pin = GPIO_PIN_13; g.Mode = GPIO_MODE_IT_FALLING; g.Pull = GPIO_NOPULL;   /* ${c('düşen kenarda kesme', 'interrupt on the falling edge')} */
  HAL_GPIO_Init(GPIOC, &g);                        /* ${c('SYSCFG_EXTICR4\'te EXTI13 = port C', 'EXTI13 = port C in SYSCFG_EXTICR4')} */
  HAL_NVIC_SetPriority(EXTI15_10_IRQn, 5, 0);      /* ${c('preempt 5: motor zamanlayıcısından düşük', 'preempt 5: lower than the motor timer')} */
  HAL_NVIC_EnableIRQ(EXTI15_10_IRQn);
}

void EXTI15_10_IRQHandler(void) { HAL_GPIO_EXTI_IRQHandler(GPIO_PIN_13); }   /* ${c('bekleme bitini temizler', 'clears the pending bit')} */

void HAL_GPIO_EXTI_Callback(uint16_t pin) {
  if (pin == GPIO_PIN_13) presses++;               /* ${c('yalnız işaretle; printf ve HAL_Delay yok', 'just flag it; no printf, no HAL_Delay')} */
}`)

export const uartHal = (l: Lang) => block(l, 'USART2 (ST-LINK sanal COM): kesmeyle satır okuma', 'USART2 (ST-LINK virtual COM): reading lines with interrupts', (c) => `UART_HandleTypeDef huart2;
static uint8_t rx;
static char line[33];
static volatile uint8_t len = 0, ready = 0;

void uart_init(void) {
  huart2.Instance = USART2;
  huart2.Init.BaudRate = 115200;                   /* ${c('APB1 42 MHz → BRR = 22,8125', 'APB1 42 MHz → BRR = 22.8125')} */
  huart2.Init.WordLength = UART_WORDLENGTH_8B;
  huart2.Init.Parity = UART_PARITY_NONE;
  huart2.Init.StopBits = UART_STOPBITS_1;          /* 8N1 */
  huart2.Init.Mode = UART_MODE_TX_RX;
  HAL_UART_Init(&huart2);
  HAL_UART_Receive_IT(&huart2, &rx, 1);            /* ${c('her bayt için kesme', 'one interrupt per byte')} */
}

void HAL_UART_RxCpltCallback(UART_HandleTypeDef *h) {
  if (rx == '\\n' || rx == '\\r') { if (len) { line[len] = 0; ready = 1; } }
  else if (len < sizeof line - 1 && !ready) line[len++] = (char)rx;
  HAL_UART_Receive_IT(h, &rx, 1);                  /* ${c('bir sonraki baytı yeniden iste', 're-arm for the next byte')} */
}`)

export const adcDmaHal = (l: Lang) => block(l, 'ADC1 + DMA2 dairesel kip: çift tampon', 'ADC1 + DMA2 circular mode: double buffering', (c) => `#define N 64
static uint16_t buf[N];                            /* ${c('DMA buraya yazar', 'DMA writes here')} */
volatile uint32_t avg_lo, avg_hi;

void adc_start(void) {
  /* ${c('CubeMX: ADC1 IN0 (PA0), sürekli kip, DMA2 Stream0 dairesel, yarım kelime', 'CubeMX: ADC1 IN0 (PA0), continuous mode, DMA2 Stream0 circular, half-word')} */
  HAL_ADC_Start_DMA(&hadc1, (uint32_t *)buf, N);
}

static uint32_t mean(const uint16_t *p, int n) { uint32_t s = 0; for (int i = 0; i < n; i++) s += p[i]; return s / n; }

void HAL_ADC_ConvHalfCpltCallback(ADC_HandleTypeDef *h) { avg_lo = mean(buf, N / 2); }       /* ${c('DMA ikinci yarıya yazıyor', 'DMA is writing the second half')} */
void HAL_ADC_ConvCpltCallback(ADC_HandleTypeDef *h)     { avg_hi = mean(buf + N / 2, N / 2); } /* ${c('DMA başa döndü', 'DMA wrapped to the start')} */

/* mV = code * 3300 / 4096 */`)

export const i2cSpiHal = (l: Lang) => block(l, 'I²C: BME280 kimliği; SPI: tek bayt alışverişi', 'I²C: BME280 ID; SPI: a single-byte exchange', (c) => `uint8_t bme280_id(void) {
  uint8_t id = 0;
  /* ${c('HAL 8 bit adres ister: 7 bit adres << 1', 'HAL wants the 8-bit address: 7-bit address << 1')} */
  if (HAL_I2C_Mem_Read(&hi2c1, 0x76 << 1, 0xD0, I2C_MEMADD_SIZE_8BIT, &id, 1, 10) != HAL_OK)
    return 0;                                      /* ${c('NACK: cihaz yok ya da adres yanlış', 'NACK: no device or wrong address')} */
  return id;                                       /* ${c('0x60 beklenir', '0x60 expected')} */
}

uint8_t spi_xfer(uint8_t tx) {
  uint8_t rxb = 0;
  HAL_GPIO_WritePin(CS_GPIO_Port, CS_Pin, GPIO_PIN_RESET);       /* ${c('CS düşük: köle seçildi', 'CS low: slave selected')} */
  HAL_SPI_TransmitReceive(&hspi1, &tx, &rxb, 1, 10);             /* ${c('tam çift yönlü', 'full duplex')} */
  HAL_GPIO_WritePin(CS_GPIO_Port, CS_Pin, GPIO_PIN_SET);
  return rxb;
}`)

export const stopHal = (l: Lang) => block(l, 'Stop kipi: RTC ile uyan, saati yeniden kur', 'Stop mode: wake with the RTC, reconfigure the clock', (c) => `void sleep_seconds(uint32_t s) {
  HAL_RTCEx_SetWakeUpTimer_IT(&hrtc, s - 1, RTC_WAKEUPCLOCK_CK_SPRE_16BITS);   /* ${c('1 Hz saat', '1 Hz clock')} */
  HAL_SuspendTick();                               /* ${c('SysTick uyandırmasın', 'so SysTick does not wake us')} */
  HAL_PWR_EnterSTOPMode(PWR_LOWPOWERREGULATOR_ON, PWR_STOPENTRY_WFI);
  /* ${c('--- burada uyuyoruz; RTC kesmesi uyandırır ---', '--- asleep here; the RTC interrupt wakes us ---')} */
  SystemClock_Config();                            /* ${c('uyanınca HSI\'deyiz: PLL\'i yeniden kur', 'we wake on HSI: reconfigure the PLL')} */
  HAL_ResumeTick();
  HAL_RTCEx_DeactivateWakeUpTimer(&hrtc);
}`)

export const rtosC = (l: Lang) => block(l, 'FreeRTOS: iki görev, kuyruk ve mutex', 'FreeRTOS: two tasks, a queue and a mutex', (c) => `#include "FreeRTOS.h"
#include "task.h"
#include "queue.h"
#include "semphr.h"

static QueueHandle_t cmdq;
static SemaphoreHandle_t uart_mtx;                 /* ${c('mutex: öncelik kalıtımı var', 'mutex: has priority inheritance')} */

static void motor_task(void *arg) {
  TickType_t next = xTaskGetTickCount();
  int duty = 0;
  for (;;) {
    xQueueReceive(cmdq, &duty, 0);                 /* ${c('beklemeden bak', 'peek without blocking')} */
    pwm_set_percent(duty);
    vTaskDelayUntil(&next, pdMS_TO_TICKS(5));      /* ${c('kesin 5 ms periyot, kaymasız', 'exact 5 ms period, no drift')} */
  }
}

static void log_task(void *arg) {
  for (;;) {
    xSemaphoreTake(uart_mtx, portMAX_DELAY);
    printf("alive\\r\\n");
    xSemaphoreGive(uart_mtx);
    vTaskDelay(pdMS_TO_TICKS(1000));
  }
}

int main(void) {
  HAL_Init(); SystemClock_Config(); pwm_init(); uart_init();
  cmdq = xQueueCreate(4, sizeof(int));
  uart_mtx = xSemaphoreCreateMutex();
  xTaskCreate(motor_task, "motor", 256, NULL, 3, NULL);   /* ${c('yüksek öncelik', 'high priority')} */
  xTaskCreate(log_task, "log", 256, NULL, 1, NULL);
  vTaskStartScheduler();                           /* ${c('geri dönmez', 'never returns')} */
}`)

export const capstoneParser = (l: Lang) => block(l, 'Komut çözümleyici (saf C, bilgisayarda test edilir)', 'Command parser (pure C, tested on the PC)', (c) => `#include <string.h>
#include <stdio.h>
#include <stdlib.h>
#include <ctype.h>

typedef struct { int duty; char dir; int freq; int running; } motor_t;

/* ${c('Donanımdan bağımsız: HAL yok. pio test -e native ile çalışır.', 'hardware independent: no HAL. Runs with pio test -e native.')} */
int command(motor_t *m, char *line, char *reply, size_t n) {
  for (char *p = line; *p; p++) *p = (char)toupper((unsigned char)*p);
  char *cmd = strtok(line, " "), *arg = strtok(NULL, " ");
  if (!cmd) { reply[0] = 0; return 0; }
  if (!strcmp(cmd, "PWM")) {
    char *end; long d = arg ? strtol(arg, &end, 10) : -1;
    if (!arg || *end || d < 0 || d > 100) return snprintf(reply, n, "ERR PWM expects 0-100"), -1;
    m->duty = (int)d; return snprintf(reply, n, "OK PWM %d", m->duty), 0;
  }
  if (!strcmp(cmd, "DIR")) {
    if (!arg || (strcmp(arg, "F") && strcmp(arg, "R"))) return snprintf(reply, n, "ERR DIR expects F or R"), -1;
    if (m->running && m->duty > 0 && arg[0] != m->dir) return snprintf(reply, n, "ERR stop before reversing"), -1;
    m->dir = arg[0]; return snprintf(reply, n, "OK DIR %c", m->dir), 0;
  }
  if (!strcmp(cmd, "START")) { m->running = 1; return snprintf(reply, n, "OK START"), 0; }
  if (!strcmp(cmd, "STOP"))  { m->running = 0; return snprintf(reply, n, "OK STOP"), 0; }
  if (!strcmp(cmd, "STATUS"))
    return snprintf(reply, n, "OK %s PWM %d DIR %c FREQ %d", m->running ? "RUN" : "IDLE", m->duty, m->dir, m->freq), 0;
  return snprintf(reply, n, "ERR unknown command %s", cmd), -1;
}`)

export const unityTest = (l: Lang) => block(l, 'Unity testi (PlatformIO native)', 'Unity test (PlatformIO native)', (c) => `#include <unity.h>
#include "command.h"

void test_pwm_range(void) {
  motor_t m = {0, 'F', 20000, 0}; char r[48], l1[] = "pwm 150", l2[] = "PWM 40";
  TEST_ASSERT_EQUAL(-1, command(&m, l1, r, sizeof r));      /* ${c('aralık dışı reddedilir', 'out of range is rejected')} */
  TEST_ASSERT_EQUAL(0, command(&m, l2, r, sizeof r));
  TEST_ASSERT_EQUAL(40, m.duty);
  TEST_ASSERT_EQUAL_STRING("OK PWM 40", r);
}

int main(void) { UNITY_BEGIN(); RUN_TEST(test_pwm_range); return UNITY_END(); }`)
