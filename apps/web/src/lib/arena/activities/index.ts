import type { ArenaActivity } from '../types'
import { R_H1_ACTIVITIES } from './r-h1'
import { R_H2_ACTIVITIES } from './r-h2'
import { R_H3_ACTIVITIES } from './r-h3'
import { R_H4_ACTIVITIES } from './r-h4'
import { R_H5_ACTIVITIES } from './r-h5'
import { R_H6_ACTIVITIES } from './r-h6'
import { R_H7_ACTIVITIES } from './r-h7'
import { R_H8_ACTIVITIES } from './r-h8'

export const ARENA_ACTIVITIES: Record<string, ArenaActivity> = {
  ...R_H1_ACTIVITIES, ...R_H2_ACTIVITIES, ...R_H3_ACTIVITIES, ...R_H4_ACTIVITIES,
  ...R_H5_ACTIVITIES, ...R_H6_ACTIVITIES, ...R_H7_ACTIVITIES, ...R_H8_ACTIVITIES,
}
