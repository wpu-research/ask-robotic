// Türkçe sözlük: kaynak ve tip (Messages). Ad alanları tr/*.ts; İngilizcesi en.ts aynı anahtarları sağlamak zorunda.
import { common } from './tr/common'
import { shell } from './tr/shell'
import { home } from './tr/home'
import { topics } from './tr/topics'
import { paths } from './tr/paths'
import { onboarding } from './tr/onboarding'
import { moduleView } from './tr/module-view'
import { lesson } from './tr/lesson'
import { paywall } from './tr/paywall'
import { pricing } from './tr/pricing'
import { account } from './tr/account'
import { auth } from './tr/auth'
import { league } from './tr/league'
import { classJoin } from './tr/class-join'
import { teacher } from './tr/teacher'
import { landing } from './tr/landing'
import { schools } from './tr/schools'
import { mikro } from './tr/mikro'
import { lab } from './tr/lab'
import { studios } from './tr/studios'
import { content } from './tr/content'
import { eng } from './tr/eng'
import { consent } from './tr/consent'
import { instructor } from './tr/instructor'

export const tr = {
  common,
  shell,
  home,
  topics,
  paths,
  onboarding,
  moduleView,
  lesson,
  paywall,
  pricing,
  account,
  auth,
  league,
  classJoin,
  teacher,
  schools,
  landing,
  mikro,
  lab,
  studios,
  content,
  eng,
  consent,
  instructor,
}

export type Messages = typeof tr
