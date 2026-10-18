// Tek kartlı bilgisayar mı, mikrodenetleyici mi? Gereksinimlerden kart önerisi. Puanlar ders içi kurallardır
// (gerçek kart seçiminde veri sayfası ve fiyat da bakılır); her puanın gerekçesi metin olarak döner.

export type Need = 'vision' | 'hardRt' | 'battery' | 'network' | 'analog' | 'fastBoot' | 'ml' | 'ros'
export type Board = 'pi5' | 'zero2' | 'pico' | 'stm32' | 'combo'

export const NEEDS: Record<Need, { tr: string; en: string }> = {
  vision: { tr: 'Kamera ve görüntü işleme (OpenCV)', en: 'Camera and image processing (OpenCV)' },
  hardRt: { tr: 'Mikrosaniye düzeyinde kesin zamanlama (enkoder, motor PWM döngüsü)', en: 'Microsecond-level hard timing (encoder, motor PWM loop)' },
  battery: { tr: 'Pille aylarca çalışma', en: 'Months on a battery' },
  network: { tr: 'Wi-Fi, web paneli, SSH', en: 'Wi-Fi, web panel, SSH' },
  analog: { tr: 'Analog girişler (potansiyometre, analog sensör)', en: 'Analog inputs (potentiometer, analog sensor)' },
  fastBoot: { tr: 'Elektrik gelince 1 saniyede çalışmak', en: 'Running within a second of power-on' },
  ml: { tr: 'Cihaz üstünde yapay zekâ modeli', en: 'On-device AI model' },
  ros: { tr: 'ROS 2 düğümleri', en: 'ROS 2 nodes' },
}
export const BOARDS: Record<Board, { name: string; tr: string; en: string }> = {
  pi5: { name: 'Raspberry Pi 5 / 4B', tr: 'Linux çalıştıran tek kartlı bilgisayar', en: 'Single-board computer running Linux' },
  zero2: { name: 'Raspberry Pi Zero 2 W', tr: 'Küçük ve az güç çeken Linux kartı', en: 'Small, low-power Linux board' },
  pico: { name: 'Raspberry Pi Pico (RP2040)', tr: 'Mikrodenetleyici, MicroPython/C', en: 'Microcontroller, MicroPython/C' },
  stm32: { name: 'STM32 (Cortex-M)', tr: 'Mikrodenetleyici, C ve gerçek zamanlı', en: 'Microcontroller, C and real-time' },
  combo: { name: 'Pi + mikrodenetleyici', tr: 'Pi düşünür, MCU zamanlamayı tutar (UART/I²C ile)', en: 'Pi thinks, MCU keeps the timing (over UART/I²C)' },
}
const SCORE: Record<Need, Record<Board, number>> = {
  vision: { pi5: 3, zero2: 1, pico: -3, stm32: -3, combo: 3 },
  hardRt: { pi5: -2, zero2: -2, pico: 3, stm32: 3, combo: 3 },
  battery: { pi5: -3, zero2: -1, pico: 2, stm32: 3, combo: -2 },
  network: { pi5: 3, zero2: 3, pico: 0, stm32: -1, combo: 3 },
  analog: { pi5: -1, zero2: -1, pico: 2, stm32: 3, combo: 2 },
  fastBoot: { pi5: -2, zero2: -2, pico: 3, stm32: 3, combo: 0 },
  ml: { pi5: 2, zero2: 0, pico: -2, stm32: -1, combo: 2 },
  ros: { pi5: 3, zero2: 1, pico: -2, stm32: -2, combo: 3 },
}
/** Kombinasyon daha karmaşıktır: tek kart yetiyorsa onu tercih et. */
const COMPLEXITY: Record<Board, number> = { pi5: 0, zero2: 0, pico: 0, stm32: 0, combo: -2 }

export function recommend(needs: Need[]): Array<{ board: Board; score: number }> {
  return (Object.keys(BOARDS) as Board[])
    .map((board) => ({ board, score: needs.reduce((s, n) => s + SCORE[n][board], 0) + (needs.length ? COMPLEXITY[board] : 0) }))
    .sort((a, b) => b.score - a.score)
}
export const scoreOf = (need: Need, board: Board) => SCORE[need][board]
