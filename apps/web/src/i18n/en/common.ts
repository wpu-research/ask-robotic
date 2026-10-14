import type { common as Tr } from '../tr/common'

export const common: typeof Tr = {
  appName: 'ASK Robotic',
  tagline: 'From zero to AI robotics engineering',
  metaDescription: 'From zero to AI robotics engineering: step-by-step lessons from Scratch to Arduino, from sensors to robots.',
  loading: 'Loading…',
  save: 'Save',
  cancel: 'Cancel',
  close: 'Close',
  back: 'Back',
  next: 'Next',
  continue: 'Continue',
  retry: 'Try again',
  soon: 'Soon',
  errorGeneric: 'Something went wrong. Please try again in a moment.',
  errorNetwork: "Couldn't connect. Check your internet connection.",
  language: {
    label: 'Language',
    switchTo: 'Change language: {name}',
    tr: 'Türkçe',
    en: 'English',
  },
  lessonOnlyTurkish: 'This lesson is in Turkish for now.',
  lessonFallbackTitle: 'Lesson',
  weekLabel: 'Week {n} · {title}',
  weekLabelClassic: 'Week {n}: {title}',
  legalOnlyTurkish: 'Legal documents are published in Turkish only.',
  badges: {
    kind: { blok: 'Blocks', devre: 'Circuits', robot: 'Robot', oyun: 'Game', ai: 'AI' },
    lessonKind: { metin: 'Reading', blok: 'Blocks', devre: 'Circuit', arena: 'Arena', oyun: 'Game', ai: 'AI' },
    status: { yok: 'Not started', suruyor: 'In progress', bitti: 'Done' },
  },
}
