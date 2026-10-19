import type { Metadata } from 'next'
import { CourseOverview } from '@/components/gomulu/pages'
import { getLocale } from '@/i18n/server'
import { RPI_COURSE } from '@/lib/rpi/course'

export const metadata: Metadata = { title: 'Raspberry Pi ile Robotik Programlama', description: 'Büyükler için Raspberry Pi dersi: Linux, GPIO, sensörler, OpenCV, motorlar, Flask ve ROS 2; 10 ünite, tarayıcıda 9 simülasyon, kameralı keşif robotu projesi.' }

export default async function Page() {
  return <CourseOverview c={RPI_COURSE} lang={await getLocale()} />
}
