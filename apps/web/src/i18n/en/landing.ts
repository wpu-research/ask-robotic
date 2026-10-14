import type { landing as Tr } from '../tr/landing'

export const landing: typeof Tr = {
  metaTitle: 'Your personal tutor for robotics and AI',
  metaDescription: 'Interactive lessons for ages 5–18, from block coding to electronics, robotics and AI engineering. No hardware required.',
  hero: {
    title: 'Your personal tutor for robotics and AI',
    lead: 'From block coding to Arduino, from robots to AI engineering. Robi thinks with you and never just hands you the answer: you figure it out.',
    learner: "I'm a learner",
    adult: "I'm a parent or teacher",
    continue: 'Continue where you left off',
    noHardware: 'No hardware needed · Runs in the browser',
  },
  demo: {
    eyebrow: 'Try it now',
    question: 'Light the LED without burning it out: pick the resistor.',
    check: 'Check',
    ok: 'That’s it! You calculated it like a real engineer.',
    bad: 'Not quite. If the current is too high, make the resistor bigger.',
    again: 'Try again',
    cta: 'Hundreds of steps like this are waiting for you',
    goalOn: 'The LED lights up',
    goalSafe: 'Current is at most 20 mA',
  },
  stats: {
    lessons: 'interactive lessons',
    courses: 'courses',
    parts: 'part encyclopedia',
    ages: 'age range',
    hardware: 'kit cost',
  },
  meet: {
    title: 'Meet Robi',
    lead: 'The guide robot by your side in every lesson. It sees your screen, understands where you’re stuck and guides you with questions.',
    tabs: { kodlama: 'Coding', elektronik: 'Electronics', robotik: 'Robotics', ai: 'AI' },
    mock: {
      coach: { kodlama: 'How many milliseconds does delay() wait?', elektronik: 'What happens if you shorten the on-time?', robotik: 'What distance is the sensor reading?', ai: 'Why is “stops” more likely?' },
      blinkGoal: '✓ Blink once per second',
      arenaGoal: '→ Stop 20 cm before the obstacle',
      tokens: ['▁the', '▁robot', '▁turn', 's', '.'],
      next: ['stops', 'turns', 'flies'],
    },
    features: {
      kodlama: [
        { title: 'Learn by doing, not watching', text: 'Try something with blocks and code at every step and see the result right away.' },
        { title: 'Learn to read and fix code', text: 'Find the bug, predict the output, complete the missing piece: real programmer skills.' },
        { title: 'Make your own game', text: 'Build the game you imagine with events, loops and variables.' },
      ],
      elektronik: [
        { title: 'Real circuits, virtual lab', text: 'Build circuits with Arduino, resistors, LEDs and sensors; the code compiles and the circuit comes alive.' },
        { title: 'Intuition before formulas', text: 'Move the slider and watch the current change; Ohm’s law simply makes sense.' },
        { title: 'Nothing breaks', text: 'Burned out an LED? Start over with ↺. No kits, soldering or missing parts.' },
      ],
      robotik: [
        { title: 'Drive a robot in a virtual arena', text: 'Avoid obstacles, follow lines and control your robot with encoders and PID.' },
        { title: 'Watch sensors live', text: 'Distance beams, line-sensor values and position appear on screen instantly.' },
        { title: 'Get ready for competitions', text: 'Build problem-solving and planning skills with weekly projects.' },
      ],
      ai: [
        { title: 'Look inside AI', text: 'Tokens, probabilities, similarity and retrieval: try out how language models work yourself.' },
        { title: 'Responsible AI', text: 'Prompting, evaluation, safety and ethics: learn to understand AI, not just use it.' },
        { title: 'Build your own AI app', text: 'Make a small but real application with agents, evals and RAG.' },
      ],
    },
  },
  trust: {
    title: 'Effective and trusted',
    items: [
      { title: 'Short steps, instant feedback', text: 'Every lesson has 8–15 interactions. Right answer: “Why?”. Wrong answer: a hint.' },
      { title: 'Practice based on mastery', text: 'Skills you struggle with come back; what you already know doesn’t slow you down.' },
      { title: 'Respect for children’s data', text: 'No ads, no messaging between students. School accounts don’t even need an email.' },
      { title: 'Aligned with the curriculum', text: 'Maps to IT & Software, AI Applications and Robotic Coding courses.' },
    ],
  },
  catalog: {
    title: 'From age 5 to 18',
    lead: 'A starting point for every age. There’s even voice narration for little ones who can’t read yet.',
    all: 'All topics',
  },
  habit: {
    title: 'Always on your schedule',
    lead: '10–15 minutes a day is enough. Streaks, XP and class leagues turn learning into a habit.',
    points: ['You choose your daily goal', 'Streak charges protect your streak if you miss a day', 'Works on phones, tablets and computers'],
  },
  schools: {
    title: 'Ready for schools',
    lead: 'Create a class, add students in minutes with QR cards, assign lessons and see who’s stuck in real time. 40-minute lesson plans included.',
    cta: 'Explore the school programme',
    points: ['Teacher dashboard', 'QR card login', 'Projector mode', 'Skill heat map'],
  },
  how: {
    title: 'How it works',
    steps: [
      { title: 'Get your plan', text: 'Tell us your age and interests; Robi suggests the right place to start.' },
      { title: 'Learn in short steps', text: 'Try, check and learn why at every step.' },
      { title: 'Build your own project', text: 'A project every week: from a traffic light to driving a robot.' },
    ],
  },
  final: {
    title: 'Start your engineering journey today',
    lead: 'Start for free. No card required.',
    cta: 'Start for free',
    login: 'I already have an account',
  },
}
