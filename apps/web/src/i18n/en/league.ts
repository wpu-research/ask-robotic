import type { league as Tr } from '../tr/league'

export const league: typeof Tr = {
  metaTitle: 'Class league',
  eyebrow: 'Weekly league',
  title: 'Class league',
  lead: 'Your rank among your classmates, based on the XP you earned this week. It resets every Monday at 00:00.',
  closed: 'Leagues are turned off at your school.',
  joinPrompt: 'Leagues let you compete with your classmates. Get the class code from your teacher and join.',
  joinCta: 'Join a class',
  yourRank: 'Your rank:',
  you: ' (you)',
  tiersSoon: 'Coming soon, league tiers between schools: {tiers}.',
  tiers: {
    t1: 'Resistor',
    t2: 'Capacitor',
    t3: 'Transistor',
    t4: 'Microcontroller',
    t5: 'Servo',
    t6: 'Sensor',
    t7: 'Lidar',
    t8: 'Robot Arm',
    t9: 'Autonomous',
    t10: 'Android',
  },
}
