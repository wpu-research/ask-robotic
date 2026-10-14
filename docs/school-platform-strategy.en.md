# ASK Robotic — School Platform Strategy (EN)

Date: 2026-10-14 · Status: working draft · Turkish version: `strateji-okul-platformu.tr.md`
Based on: `docs/analiz-brilliant.md` (Brilliant analysis + member screens) and the current code and content inventory.

---

## 1. In one sentence

**From age 5 to 18: an interactive learning platform built for schools that takes students from block coding to
electronics, robotics and AI engineering — in Turkish and English, with no hardware required.**

Brilliant says "your personal tutor for math and coding". We say **"the school's robotics and AI lab — in the browser."**

## 2. Why our position is stronger

| | Brilliant | ASK Robotic |
|---|-----------|-------------|
| Age range | Grade 5 → adult (K-5 is arithmetic practice only) | **Age 5 → 18**, one continuous ladder |
| Subjects | Math, coding, some data/science | **Coding + electronics + robotics + AI** |
| Interactivity | Small, purpose-built widgets | **Real simulators:** Arduino (avr8js, real compiler), circuit lab, robot arena, Scratch-style stage, micro board, game studio, in-browser AI workshop |
| Hardware | None, none needed | **None — but a faithful virtual copy of real hardware.** No kits, soldering, broken parts or lab logistics for the school |
| Language / curriculum | English, US Common Core | **Turkish + English**, can map to Turkish Ministry of Education (MEB) electives |
| Schools | Free classroom accounts, secondary focus | **Schools are the first customer** |
| Reference material | — | 37-part component encyclopedia, 43 weekly guides, ~350 skills, ~1,190 questions |

What we **take from Brilliant** (what we lack): a problem-first lesson flow (8–15 interactions per lesson), one widget
reused with changing constraints, Check → green screen → Why?, a token-based code editor, voice narration, an in-lesson
AI tutor, streaks/XP, onboarding before sign-up, a lean catalog. (Details: analysis doc §11.7.)

## 3. Target market: private schools first

### Why schools first?
- **Few decision makers, many students:** one school contract = hundreds of learners.
- **Budget and showcase need:** private schools ("kolej") must offer robotics / AI / STEM to parents; many have kits
  sitting in cupboards.
- **Being hardware-free is our biggest advantage for schools:** no kit budget, maintenance, lost parts or one-set-per-class
  bottleneck; every student has their own "lab".
- **MEB electives need content** (see §5). Teachers have little hands-on material.
- **International-programme schools** (IB, Cambridge) want English content → bilingual is a direct selling point.
- The individual/family market needs expensive marketing; the school channel brings students and parents to us, and
  individual memberships grow from that base later.

### Buyers and users

| Person | Wants | What we show them |
|--------|-------|-------------------|
| Founder / principal | A showcase for parents, differentiation, measurable results | School report, parent report, project/competition showcase |
| IT / robotics teacher, department | Ready-to-teach lessons that fit 40 minutes; little prep | Lesson plans, class dashboard, auto-grading |
| Parent | What is my child learning? | Weekly report, project sharing |
| Student | Fun and a sense of achievement | Simulators, gamification, projects |

## 4. Age bands and the curriculum ladder

Each band is packaged for **one school year ≈ 30–36 class hours** (one lesson per week).

| Band | Grades | Age | Topics | Existing content | Tools | Status |
|------|--------|-----|--------|------------------|-------|--------|
| **Little Coders** | K – 2 | 5–7 | Block coding, sequencing, loops, stories | M1 First Steps in Block Coding (10 lessons) | Workshop (ScratchJr-style), games | **Thin** (not even one term); voice narration required |
| **Explorers** | 3 – 4 | 8–10 | Game making, events, variables; first electronics | M2 Scratch (16), M10 Micro Board (30) | Stage Studio, Micro Board, games | Sufficient; needs lesson-v2 conversion |
| **Makers** | 5 – 6 | 10–12 | Game design, micro-board projects, **AI literacy** | M11 Game Studio (30), M10 later weeks | Game Studio, Micro Board, AI Workshop (kids' version) | **No AI Discovery module yet** (to be written) |
| **Junior Engineers** | 7 – 8 | 12–14 | Arduino, circuits, sensors; **AI Applications**; intro robotics | M3 Arduino Basics (35), M4 Sensors (40) | Lab, encyclopedia, AI Workshop | Strong content; needs a package tailored to the AI elective |
| **Engineers** | 9 – 12 | 14–18 | Robotics, control, AI engineering, advanced boards, competition prep | M5 Robotics (40), M7 AI Engineering (40) | Arena, Lab, AI Workshop | M6 (ESP32/RP2040/Pi), M8 (robot arm), M9 (drone) **not written** |

Current total: 8 modules, 241 lessons. Biggest gaps: **ages 5–7**, **AI literacy for ages 8–12**, M6/M8/M9 for high school.

Notes:
- Students never see module numbers; they see **band → topic → course → level → lesson** (like Brilliant's topic catalog).
- Bands are not rigid: the teacher or a placement check can move a student up or down a band.
- Each band ends with a **capstone project** (school fair / parents' day / competitions).

## 5. Mapping to the Turkish national curriculum (strongest sales card)

The teacher's question: "Which course do I use this in?" The answer table:

| MEB course | Grade | Our match |
|-----------|-------|-----------|
| Information Technologies and Software (Maarif Model themes include **artificial intelligence** and **software design and programming**) | 5–6 | Explorers/Makers bands, AI Discovery |
| **AI Applications** (elective; 2 levels × 72 hours; block-based AI problems, generative AI, ethics, machine learning, neural networks, fuzzy logic) | 7–8 | AI Workshop + middle-school adaptation of M7 |
| **Robotic Coding** (elective; includes AI concepts and ethics in robotics) | Middle school | Selection from M3 + M5, Arena |
| Technology and Design | 7–8 | Project weeks, Lab |
| Competitions (TEKNOFEST, FLL, etc.) | 5–12 | Robotics/AI competition-prep path |

> ⚠ Class hours, start years and learning-outcome codes must be **verified** on the MEB Curriculum Portal before they go
> into sales material; this information was compiled from news reports and portal summaries.

To do: a **learning-outcome mapping table** for every lesson (like Brilliant's Common Core mapping; outcomes we don't
cover are listed openly — transparency builds teacher trust).

## 6. Product architecture — 5 layers

### 6.1 Student experience (the Brilliant logic)
- **Lesson v2:** problem → 2–3 sentences → interaction → instant feedback; 8–15 interactions per lesson; mini simulators
  embedded in the lesson.
- Token-based code editor (C++/Python/blocks), "Why?" explanations, tiered hints, story framing.
- **Voice narration** (TR/EN TTS) — mandatory for ages 5–8.
- Mastery → personalised practice, level reviews, spaced repetition (the skill engine `lib/skills.ts` already exists).
- XP, streaks, badges; **leagues only within a class/school**.
- In-lesson **AI tutor** (Claude) — schools can switch it on/off; conversations are visible to the teacher.

### 6.2 Teacher / class layer (the heart of school sales)
- Create classes; add students **in bulk via CSV** or with a class code.
- **QR card / picture-password login for young children** (no email needed).
- **Assign** lessons/weeks with due dates; class progress table; live "who is stuck" view.
- **Skill heat map** (class × skill), auto-graded quizzes, project rubrics.
- **Projector / presentation mode:** show a lesson's "Curiosity" and "Let's Talk" steps on the board; walk the class
  through step by step.
- **40-minute lesson plans** (PDF + on screen): 5 min warm-up (Curiosity) → 25 min on the platform (solo/pairs) →
  10 min Let's Talk + exit ticket. The existing lesson structure (Curiosity / Activity / Let's Talk) already fits this.
- Answer keys, common mistakes (already in the weekly guides), teacher training videos.

### 6.3 School administration layer
- School account, campuses, teacher and licence management.
- Usage and achievement reports (end-of-term PDF), student report cards for parent meetings.
- **Single sign-on** with Google Workspace for Education / Microsoft 365 — later phase.

### 6.4 Parent layer
- Weekly email summary: time spent, lessons completed, strong/weak skills, finished projects.
- Project share link (nickname instead of the student's real name).

### 6.5 Membership / subscription infrastructure (built, but not marketed yet)
One **entitlement** system; access is granted by either source:
- **School licence:** school → classes → students (per term/year, seat-based).
- **Individual / family subscription:** user → plan (free / premium / family). A payment provider (e.g. iyzico/Stripe) is
  wired in, but no campaigns run.
Free-plan rules (like Brilliant's "one lesson a day") are configuration switches.

### Data model additions (relative to the current schema)
Existing: `users (role: student|parent|teacher|admin)`, `modules`, `weeks`, `lessons`, `enrollments`, `progress`, `sessions`, `events`.
To add: `organizations` (school), `campuses`, `classes`, `class_members`, `assignments`, `licenses`, `subscriptions`,
`entitlements`, `guardian_links`, `consents`; `users.locale`, `users.birth_year`, `users.login_mode`
(email / QR / picture password); `locale` on content.

## 7. Two languages: Turkish + English

| Layer | Approach |
|-------|----------|
| UI | i18n framework (e.g. `next-intl`); today the code has **no i18n at all** — strings are hard-coded Turkish → Phase 0 work |
| Lesson content | One source file per language: `03-led-yak.md` + `03-led-yak.en.md`; `build.mjs` builds per locale |
| Glossary | Single TR↔EN concept glossary (derived from the concept cards) — keeps translations consistent |
| Translation process | First pass with Claude → glossary check → teacher/editor approval → automated tests (quiz answers and code outputs are verified language-independently) |
| Blocks and code | Block labels in both languages; Arduino/Python keywords are already English, comments follow the locale |
| Voice | TR and EN TTS |
| Priority | UI bilingual from day one; content first for **grades 7–8 and high school** (needed by international-programme schools), younger bands after |

Volume: 241 lessons + 43 guides + 37 parts + ~1,190 questions. Proceed band by band with machine translation plus human approval.

## 8. Business model (hypothesis — to be validated in pilots)

- **School licence, per student per year**, by band package or whole platform (campus licence).
- **Pilot:** 2–3 private schools for one term free/discounted, in exchange for usage data and a reference.
- **Extra revenue:** teacher training and certification, competition-prep camps, optional physical-kit partnership
  (never a platform requirement).
- **Price benchmarks:** Brilliant individual TRY 3,600/year (family TRY 7,200/year, 6 seats); Wokwi classroom plan
  ~€30/student/term. School pricing should sit clearly below individual pricing and be tiered by seat count. Numbers to be
  tested in pilot conversations.
- Individual/family membership: infrastructure ready, **launched once the school base exists** (summer camp / continue-at-home
  offers to parents of school students are the natural first channel).

## 9. Privacy (KVKK), child safety and trust

- **Roles:** the school is the data controller, we are the data processor → a **data processing agreement** with every school.
- **Data minimisation:** name/nickname + class is enough for a student; email not required (QR/picture login).
- Consent flows where explicit parental consent is required (e.g. individual sign-up under 16, AI-tutor chat logs);
  today's consent banner is a draft — to be finalised with a lawyer.
- **Hosting location:** Railway servers are outside Turkey → KVKK cross-border transfer rules (standard contracts etc.)
  must be addressed; schools will ask. Note an in-country hosting option with its cost.
- School accounts: **no ads**, no student-to-student messaging, no public profiles.
- AI tutor: content filtering, age-appropriate system instructions, chat logs in the teacher dashboard, can be disabled per school.
- Compile service: close the unauthenticated endpoint, persistent rate limiting, separate service without network access
  (`docs/derleme-servisi.md`).
- Accessibility: keyboard use, colour-blind-friendly feedback (don't rely on green/red alone), voice narration.

## 10. Roadmap

Goal: **pilot in 2–3 private schools at the start of the spring term, February 2027.** About 4 months from today.

| Phase | Scope | Outcome |
|-------|-------|---------|
| **0 — Foundation** | Turn on accounts; roles + school/class data model; i18n scaffolding (UI in TR/EN); KVKK texts; compile-service security; auto-deploy from GitHub | A secure base we can open to schools |
| **1 — Pilot-ready** | Teacher dashboard MVP (classes, QR login, assignments, progress); lesson-v2 format + mini sims, **one pilot week in 3 bands** (M1, M2/M10, M3 W1); 40-minute lesson plans; marketing site + school pitch deck (TR/EN) | A product pilot schools can use |
| **2 — Pilot term** | Placement + onboarding; daily practice; XP/streaks/class leagues; weekly parent report; bulk conversion to lesson v2; EN translation of grades 7–8 and high-school content | Usage data, teacher feedback |
| **3 — Scale** | In-lesson AI tutor; school admin dashboard + term report; SSO; MEB outcome mapping; new content: expand ages 5–7, AI Discovery (8–12), M6/M8/M9 | Full sales package (September 2027 school year) |
| **4 — Consumers** | Open individual/family membership and payments; mobile app/PWA + notifications | Second revenue channel |

**Pilot success metrics:** completion rate of assigned lessons, weekly active student rate, teacher prep time, teacher and
student satisfaction (NPS), school's intent to renew/expand, pre/post skill gains.

## 11. Risks and open decisions

1. **Content volume:** two languages × lesson-v2 conversion is a lot of work — go band by band with automated checks.
2. **Ages 5–7 are thin** (10 lessons): fill this before selling the Little Coders band.
3. **Teacher adoption:** school sales won't stick without teacher training and ready lesson plans.
4. **Hosting and KVKK:** the foreign-server question will come up in school contracts.
5. **AI tutor cost and safety:** included in the school licence or a separate add-on?
6. **Brand:** is "ASK Robotic" right in both languages and for the school market?
7. **Physical kits:** the platform is hardware-free, but some schools will want a "move to real robots" path —
   partnership or not at all?

## 12. Immediate next steps

1. Decide on the band structure, target market and pricing hypothesis in this document.
2. Technical plan for Phase 0: data model, i18n, accounts.
3. Lesson-v2 pilot: one lesson from Module 3 Week 1 in the new format (prototype).
4. Pilot school list and school pitch (TR/EN).

Sources (MEB): [Information Technologies and Software curriculum](https://tymm.meb.gov.tr/ogretim-programlari/ders/bilisim-teknolojileri-ve-yazilim-dersi) ·
[Middle-school Robotic Coding course](https://tymm.meb.gov.tr/ortaokul-robotik-kodlama-dersi/unite/1578) ·
[AI Applications course curriculum (news)](https://www.benguturk.com/egitim/meb-ortaokullarda-yapay-zeka-uygulamalari-dersinin-mufredatini-hazirladi-135280h)
