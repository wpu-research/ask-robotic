import type { LabActivity } from '../activity'
import { M3_H1_ACTIVITIES } from './m3-h1'
import { M3_H2_ACTIVITIES } from './m3-h2'
import { M3_H3_ACTIVITIES } from './m3-h3'
import { M3_H4_ACTIVITIES } from './m3-h4'
import { M3_H5_ACTIVITIES } from './m3-h5'
import { M3_H6_ACTIVITIES } from './m3-h6'
import { M3_H7_ACTIVITIES } from './m3-h7'

export const LAB_ACTIVITIES: Record<string, LabActivity> = { ...M3_H1_ACTIVITIES, ...M3_H2_ACTIVITIES, ...M3_H3_ACTIVITIES, ...M3_H4_ACTIVITIES, ...M3_H5_ACTIVITIES, ...M3_H6_ACTIVITIES, ...M3_H7_ACTIVITIES }
