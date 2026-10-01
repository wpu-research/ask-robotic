import type { LabActivity } from '../activity'
import { M3_H1_ACTIVITIES } from './m3-h1'
import { M3_H2_ACTIVITIES } from './m3-h2'
import { M3_H3_ACTIVITIES } from './m3-h3'
import { M3_H4_ACTIVITIES } from './m3-h4'
import { M3_H5_ACTIVITIES } from './m3-h5'
import { M3_H6_ACTIVITIES } from './m3-h6'
import { M3_H7_ACTIVITIES } from './m3-h7'
import { m4h1Activities } from './m4-h1'
import { m4h2Activities } from './m4-h2'
import { m4h3Activities } from './m4-h3'
import { m4h4Activities } from './m4-h4'
import { m4h5Activities } from './m4-h5'
import { m4h6Activities } from './m4-h6'
import { m4h7Activities } from './m4-h7'
import { m4h8Activities } from './m4-h8'

export const LAB_ACTIVITIES: Record<string, LabActivity> = { ...M3_H1_ACTIVITIES, ...M3_H2_ACTIVITIES, ...M3_H3_ACTIVITIES, ...M3_H4_ACTIVITIES, ...M3_H5_ACTIVITIES, ...M3_H6_ACTIVITIES, ...M3_H7_ACTIVITIES,
  ...m4h1Activities, ...m4h2Activities, ...m4h3Activities, ...m4h4Activities, ...m4h5Activities, ...m4h6Activities, ...m4h7Activities, ...m4h8Activities }
