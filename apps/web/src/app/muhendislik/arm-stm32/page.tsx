import type { Metadata } from 'next'
import { CourseOverview } from '@/components/gomulu/pages'
import { getLocale } from '@/i18n/server'
import { STM32_COURSE } from '@/lib/stm32/course'

export const metadata: Metadata = { title: 'ARM (STM32) ile Gömülü Programlama', description: 'Büyükler için STM32 dersi: yazmaçlar ve HAL, saat ağacı, PWM, kesmeler, UART, ADC/DMA, I2C/SPI, düşük güç ve FreeRTOS; 11 ünite, tarayıcıda 11 simülasyon.' }

export default async function Page() {
  return <CourseOverview c={STM32_COURSE} lang={await getLocale()} />
}
