import { sql } from 'drizzle-orm'
import {
  bigint, boolean, check, index, integer, jsonb, pgEnum, pgTable, text, timestamp, uniqueIndex, uuid,
} from 'drizzle-orm/pg-core'
import type { Concept, LessonStep, LessonTextEn, QuizQuestion } from '../content/types'

export const userRole = pgEnum('user_role', ['student', 'parent', 'teacher', 'admin'])
export const track = pgEnum('track', ['cocuk', 'maker', 'ai'])
export const progressStatus = pgEnum('progress_status', ['started', 'completed'])
// Küçük öğrenciler e-postasız girer: okulun verdiği QR kart ya da resimli şifre
export const loginMode = pgEnum('login_mode', ['email', 'qr', 'picture'])

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  // Bireysel kayıtta zorunlu; okulun açtığı öğrenci hesaplarında boş olabilir (en az veri, KVKK)
  email: text('email').unique(),
  // QR/resimli girişte parola yok
  passwordHash: text('password_hash'),
  // Okulun açtığı hesaplar için kullanıcı adı (ör. "ada.k-7b"); e-posta yerine geçer
  username: text('username').unique(),
  name: text('name').notNull(),
  role: userRole('role').notNull().default('student'),
  locale: text('locale').notNull().default('tr'),
  // Doğum tarihi değil, yalnız yıl: yaş bandı ve 16 yaş kontrolü için yeterli
  birthYear: integer('birth_year'),
  loginMode: loginMode('login_mode').notNull().default('email'),
  // QR kartın gizli parçasının SHA-256 özeti (kartta kullanıcı adı + gizli kod basılıdır); yalnız loginMode 'qr'/'picture'
  loginSecretHash: text('login_secret_hash'),
  // Onboarding cevapları (apps/web/src/lib/profile.ts → Profile)
  profile: jsonb('profile').$type<Record<string, unknown>>(),
  // XP/seri/şarj anlık görüntüsü (apps/web/src/lib/gamification-core.ts → GameState); xp_events ise defterdir
  game: jsonb('game').$type<Record<string, unknown>>(),
  // 16 yaş altı için ebeveyn hesabına bağlanır (KVKK). Yeni bağlar guardian_links'te tutulur.
  parentId: uuid('parent_id'),
  // E-posta doğrulama bağlantısı kullanıldığında dolar; null = doğrulanmadı (doğrulama zorunlu değildir)
  emailVerifiedAt: timestamp('email_verified_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [check('users_kimlik', sql`${t.email} IS NOT NULL OR ${t.username} IS NOT NULL`)])

export const modules = pgTable('modules', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  track: track('track').notNull(),
  position: integer('position').notNull(),
  minAge: integer('min_age'),
  published: boolean('published').notNull().default(false),
})

export const weeks = pgTable('weeks', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  moduleId: integer('module_id').notNull().references(() => modules.id, { onDelete: 'cascade' }),
  position: integer('position').notNull(),
  title: text('title').notNull(),
  project: text('project'),
  // Haftalık çalışma rehberi (Markdown); yoksa null
  guideMd: text('guide_md'),
  guideMdEn: text('guide_md_en'),
}, (t) => [uniqueIndex('weeks_module_position').on(t.moduleId, t.position)])

// Hyvex formatı: problem → kavram+vaka → demo → soru (15-20 dk)
export const lessons = pgTable('lessons', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  weekId: integer('week_id').notNull().references(() => weeks.id, { onDelete: 'cascade' }),
  position: integer('position').notNull(),
  title: text('title').notNull(),
  durationMin: integer('duration_min').notNull().default(20),
  problem: text('problem'),
  contentMd: text('content_md'),
  question: text('question'),
  // Öğrenme platformu katmanları (hepsi opsiyonel; yoksa null)
  explainerMd: text('explainer_md'),
  concepts: jsonb('concepts').$type<Concept[]>(),
  quiz: jsonb('quiz').$type<QuizQuestion[]>(),
  // Etkileşimli ders (v2) adımları; varsa ders yeni oynatıcıda açılır
  steps: jsonb('steps').$type<LessonStep[]>(),
  // steps'in İngilizcesi (arayüz dili 'en' iken); yoksa Türkçe adımlar gösterilir
  stepsEn: jsonb('steps_en').$type<LessonStep[]>(),
  contentEn: jsonb('content_en').$type<LessonTextEn>(),
}, (t) => [uniqueIndex('lessons_week_position').on(t.weekId, t.position)])

export const enrollments = pgTable('enrollments', {
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  moduleId: integer('module_id').notNull().references(() => modules.id, { onDelete: 'cascade' }),
  startedAt: timestamp('started_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [uniqueIndex('enrollments_pk').on(t.userId, t.moduleId)])

export const progress = pgTable('progress', {
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  lessonId: integer('lesson_id').notNull().references(() => lessons.id, { onDelete: 'cascade' }),
  status: progressStatus('status').notNull().default('started'),
  // İlk açılış; ücretsiz plandaki günlük ders sayacı buradan hesaplanır
  startedAt: timestamp('started_at', { withTimezone: true }).notNull().defaultNow(),
  completedAt: timestamp('completed_at', { withTimezone: true }),
}, (t) => [uniqueIndex('progress_pk').on(t.userId, t.lessonId)])

export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  // Çerezdeki ham token tutulmaz; yalnızca SHA-256 özeti saklanır
  tokenHash: text('token_hash').notNull().unique(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

// E-posta doğrulama ve parola sıfırlama belirteçleri: tek kullanımlık, süreli; ham belirteç tutulmaz (SHA-256 özeti)
export const authTokens = pgTable('auth_tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  kind: text('kind').notNull(),
  tokenHash: text('token_hash').notNull().unique(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  usedAt: timestamp('used_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index('auth_tokens_user_kind').on(t.userId, t.kind),
  check('auth_tokens_kind', sql`${t.kind} IN ('verify_email', 'reset_password')`),
])

// Ölçme verisi: anonim cihaz kimliğiyle olay günlüğü. Kişisel veri (ad, e-posta, IP) TUTULMAZ.
// Taslak/pilot: yalnız kullanıcı açık onay verdiyse tarayıcı gönderir (docs/ogrenme-platformu-kapsam.md, KVKK bölümü).
export const events = pgTable('events', {
  id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
  deviceId: text('device_id').notNull(),
  // Giriş yapmış kullanıcıysa (öğretmen paneli beceri haritası için); anonim kayıtta null
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  lessonId: integer('lesson_id'),
  payload: jsonb('payload').$type<Record<string, unknown>>(),
  ts: timestamp('ts', { withTimezone: true }).notNull(),
}, (t) => [index('events_device_ts').on(t.deviceId, t.ts), index('events_type_ts').on(t.type, t.ts), index('events_user_ts').on(t.userId, t.ts)])

// ---------------------------------------------------------------------------
// Okul (kurum) katmanı. Ayrıntı: docs/altyapi-okul-uyelik.md
// ---------------------------------------------------------------------------

export const orgKind = pgEnum('org_kind', ['school', 'district', 'company'])
export const orgRole = pgEnum('org_role', ['owner', 'admin', 'teacher', 'student', 'parent'])
export const classRole = pgEnum('class_role', ['teacher', 'student'])

export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  kind: orgKind('kind').notNull().default('school'),
  country: text('country').notNull().default('TR'),
  locale: text('locale').notNull().default('tr'),
  // Okul ayarları: { aiTutor?: boolean, leagues?: boolean } (yoksa varsayılanlar: lib/org-settings.ts)
  settings: jsonb('settings').$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

// Kampüs/şube
export const campuses = pgTable('campuses', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
}, (t) => [index('campuses_org').on(t.organizationId)])

export const organizationMembers = pgTable('organization_members', {
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: orgRole('role').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [uniqueIndex('organization_members_pk').on(t.organizationId, t.userId), index('organization_members_user').on(t.userId)])

export const classes = pgTable('classes', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  campusId: uuid('campus_id').references(() => campuses.id, { onDelete: 'set null' }),
  name: text('name').notNull(),
  // Sınıf düzeyi (0 = anaokulu, 1-12)
  gradeLevel: integer('grade_level'),
  // Sınıfa katılma kodu (QR'a da gömülür); tahmin edilemez olmalı
  joinCode: text('join_code').notNull().unique(),
  // Sorumlu öğretmen; diğer öğretmenler class_members'ta
  teacherId: uuid('teacher_id').references(() => users.id, { onDelete: 'set null' }),
  archived: boolean('archived').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index('classes_org').on(t.organizationId), index('classes_teacher').on(t.teacherId)])

export const classMembers = pgTable('class_members', {
  classId: uuid('class_id').notNull().references(() => classes.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: classRole('role').notNull().default('student'),
  joinedAt: timestamp('joined_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [uniqueIndex('class_members_pk').on(t.classId, t.userId), index('class_members_user').on(t.userId)])

// Ödev: hedef tam olarak biri (ders, hafta ya da modül). DB'de CHECK, uygulamada lib/assignments.ts doğrular.
export const assignments = pgTable('assignments', {
  id: uuid('id').primaryKey().defaultRandom(),
  classId: uuid('class_id').notNull().references(() => classes.id, { onDelete: 'cascade' }),
  lessonId: integer('lesson_id').references(() => lessons.id, { onDelete: 'cascade' }),
  moduleId: integer('module_id').references(() => modules.id, { onDelete: 'cascade' }),
  weekId: integer('week_id').references(() => weeks.id, { onDelete: 'cascade' }),
  dueAt: timestamp('due_at', { withTimezone: true }),
  // Öğretmen hesabı silinse de ödev sınıfta kalır
  createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index('assignments_class_due').on(t.classId, t.dueAt),
  check('assignments_tek_hedef', sql`num_nonnulls(${t.lessonId}, ${t.moduleId}, ${t.weekId}) = 1`),
])

// ---------------------------------------------------------------------------
// Üyelik / lisans: tek yetki sistemi (apps/web/src/lib/entitlements.ts)
// ---------------------------------------------------------------------------

export const subscriptionStatus = pgEnum('subscription_status', ['trialing', 'active', 'past_due', 'canceled', 'expired'])

// Satır kimlikleri sabit: 'free' | 'premium' | 'family' | 'school' (0003 migrasyonu yazar)
export const plans = pgTable('plans', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  // Aile planında hesap sayısı üst sınırı; okulda koltuk lisanstan gelir (null = sınır yok)
  seatLimit: integer('seat_limit'),
  features: jsonb('features').$type<string[]>().notNull().default([]),
})

// Bireysel / aile aboneliği. Ödeme sağlayıcısı henüz bağlı değil; 'manual' elle verilen erişimdir.
export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  // Sahibi (ödeyen); aile üyeleri subscription_members'ta
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  planId: text('plan_id').notNull().references(() => plans.id),
  status: subscriptionStatus('status').notNull(),
  provider: text('provider'),
  providerRef: text('provider_ref'),
  // null = süresiz (yalnız 'manual' için)
  currentPeriodEnd: timestamp('current_period_end', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index('subscriptions_user').on(t.userId), uniqueIndex('subscriptions_provider_ref').on(t.provider, t.providerRef)])

export const subscriptionMembers = pgTable('subscription_members', {
  subscriptionId: uuid('subscription_id').notNull().references(() => subscriptions.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  addedAt: timestamp('added_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [uniqueIndex('subscription_members_pk').on(t.subscriptionId, t.userId), index('subscription_members_user').on(t.userId)])

/** Okul lisansının kapsamı. Alan yoksa/boşsa o eksende sınır yok; kapsamın kendisi null ise her şey açık. */
export interface LicenseScope {
  /** İzin verilen modül slug'ları */
  modules?: string[]
  /** İzin verilen yaş bantları (ör. 'kasifler', 'muhendisler') */
  bands?: string[]
}

// Okul lisansı: kurumdaki öğrenciler için koltuk sayılı, dönemlik/yıllık
export const licenses = pgTable('licenses', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  planId: text('plan_id').notNull().default('school').references(() => plans.id),
  seats: integer('seats').notNull(),
  startsAt: timestamp('starts_at', { withTimezone: true }).notNull(),
  endsAt: timestamp('ends_at', { withTimezone: true }).notNull(),
  scope: jsonb('scope').$type<LicenseScope>(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index('licenses_org_ends').on(t.organizationId, t.endsAt), check('licenses_koltuk', sql`${t.seats} >= 0`)])

// ---------------------------------------------------------------------------
// Veli bağı, onaylar (KVKK), oyunlaştırma defteri
// ---------------------------------------------------------------------------

export const guardianLinks = pgTable('guardian_links', {
  parentUserId: uuid('parent_user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  studentUserId: uuid('student_user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  // Veli kimliği doğrulanana kadar null; doğrulanmamış bağ veriye erişim vermez
  verifiedAt: timestamp('verified_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [uniqueIndex('guardian_links_pk').on(t.parentUserId, t.studentUserId), index('guardian_links_student').on(t.studentUserId)])

// Onay kayıtları yalnız eklenir (güncellenmez): geri çekme granted=false olan yeni satırdır. Son satır geçerlidir.
export const consents = pgTable('consents', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  // Girişsiz kullanımda anonim cihaz kimliği (events.device_id ile aynı)
  deviceId: text('device_id'),
  // 'kvkk_aydinlatma' | 'veli_acik_riza' | 'ai_tutor'
  kind: text('kind').notNull(),
  granted: boolean('granted').notNull(),
  // Onayı veren (veli/öğretmen); kişinin kendisiyse null
  grantedBy: uuid('granted_by').references(() => users.id, { onDelete: 'set null' }),
  at: timestamp('at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index('consents_user_kind_at').on(t.userId, t.kind, t.at),
  index('consents_device_kind_at').on(t.deviceId, t.kind, t.at),
  check('consents_sahip', sql`${t.userId} IS NOT NULL OR ${t.deviceId} IS NOT NULL`),
])

// Sunucu tarafı XP defteri (ileride): toplam = SUM(amount); düzeltme negatif satırla yapılır
export const xpEvents = pgTable('xp_events', {
  id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  amount: integer('amount').notNull(),
  // 'step' | 'lesson' | 'practice'
  source: text('source').notNull(),
  lessonId: integer('lesson_id').references(() => lessons.id, { onDelete: 'set null' }),
  at: timestamp('at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index('xp_events_user_at').on(t.userId, t.at)])

// ---- AI öğretmen (Claude) sohbet kayıtları: öğretmen/veli görebilsin diye saklanır (KVKK: okulda veri sorumlusu okul) ----
export const tutorMessages = pgTable('tutor_messages', {
  id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  // Girişsiz denemede anonim cihaz kimliği
  deviceId: text('device_id'),
  lessonId: integer('lesson_id').references(() => lessons.id, { onDelete: 'set null' }),
  role: text('role').notNull(), // 'user' | 'assistant'
  content: text('content').notNull(),
  // Sınıflandırıcı/filtre işaretleri (ör. "refusal", "blocked")
  flag: text('flag'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index('tutor_user_at').on(t.userId, t.createdAt), index('tutor_device_at').on(t.deviceId, t.createdAt), index('tutor_lesson').on(t.lessonId)])

// ---- Ödemeler (bireysel/aile abonelikleri) ----
export const paymentStatus = pgEnum('payment_status', ['pending', 'succeeded', 'failed', 'refunded'])

export const payments = pgTable('payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  // Hesap silinince ödeme kaydı kalır (vergi/muhasebe saklama yükümlülüğü), kullanıcı bağı kopar
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  planId: text('plan_id').notNull().references(() => plans.id),
  period: text('period').notNull(), // 'monthly' | 'yearly'
  provider: text('provider').notNull(), // 'iyzico' | 'mock'
  providerRef: text('provider_ref'),
  // Kuruş cinsinden
  amount: integer('amount').notNull(),
  currency: text('currency').notNull().default('TRY'),
  status: paymentStatus('status').notNull().default('pending'),
  subscriptionId: uuid('subscription_id').references(() => subscriptions.id, { onDelete: 'set null' }),
  raw: jsonb('raw').$type<Record<string, unknown>>(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [uniqueIndex('payments_provider_ref').on(t.provider, t.providerRef), index('payments_user').on(t.userId)])

// ---- Sanal Beceri (Robot Atölyesi): öğrencinin gönderdiği program ve SUNUCUDA yeniden hesaplanan puanı ----
// Sınıf puan tablosu, sınıf üyelerinin en iyi kaydından üretilir (sınıf kodu = erişim). Hesap silinince kayıtlar da silinir.
export const skillRuns = pgTable('skill_runs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  challengeId: text('challenge_id').notNull(),
  score: integer('score').notNull(),
  /** Bitiş koşulunun sağlandığı an (ms); bitirmediyse null. Eşit puanda kısa olan önde. */
  finishMs: integer('finish_ms'),
  program: jsonb('program').$type<Record<string, unknown>>().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index('skill_runs_challenge_user').on(t.challengeId, t.userId), index('skill_runs_user_at').on(t.userId, t.createdAt)])

// Kariyer anketi (/yol-haritasi/anket): "ne olmak istediğini bilmeyenler" için. Ad ve e-posta sonuçtan önce istenir;
// KVKK aydınlatma onayı zorunlu, iletişim izni ayrı ve isteğe bağlı. Cevaplar soru kimliği → seçenek kimliği.
export const careerSurveys = pgTable('career_surveys', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  answers: jsonb('answers').$type<Record<string, string>>().notNull(),
  // Sunucuda hesaplanan sıralama: en uygun 3 hedef ve yüzdeleri
  result: jsonb('result').$type<{ slug: string; pct: number }[]>().notNull(),
  locale: text('locale').notNull().default('tr'),
  consentKvkk: boolean('consent_kvkk').notNull(),
  consentContact: boolean('consent_contact').notNull().default(false),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index('career_surveys_created').on(t.createdAt),
  index('career_surveys_email').on(t.email),
  check('career_surveys_kvkk', sql`${t.consentKvkk}`),
])

// Okul teklif talepleri (iş ortağı sitelerinin ana sayfasındaki form; ör. dilkur.macademia.com.tr). brand: hangi
// alan adından geldiği. Kademeler: anaokulu | ilkokul | ortaokul | lise. KVKK onayı zorunlu.
export const schoolLeads = pgTable('school_leads', {
  id: uuid('id').primaryKey().defaultRandom(),
  brand: text('brand').notNull(),
  school: text('school').notNull(),
  city: text('city').notNull(),
  levels: jsonb('levels').$type<string[]>().notNull(),
  students: integer('students'),
  contactName: text('contact_name').notNull(),
  contactRole: text('contact_role'),
  phone: text('phone').notNull(),
  email: text('email').notNull(),
  note: text('note'),
  consentKvkk: boolean('consent_kvkk').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index('school_leads_brand_created').on(t.brand, t.createdAt),
  check('school_leads_kvkk', sql`${t.consentKvkk}`),
])

// ESOF 323 çevrimiçi sınavı (/sinav). Oturum: öğretmenin açtığı sınav (öğrenciler `code` ile girer). Sorular ve 25 proje
// kodda tanımlıdır (apps/web/src/lib/sinav); burada yalnız kimlikleri, cevaplar ve puanlar saklanır.
export const examSessions = pgTable('exam_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: text('code').notNull(),
  title: text('title').notNull(),
  // draft: öğrenci giremez · open: giriş açık · closed: kaydetme/teslim kapalı (açık girişler otomatik teslim edilir)
  status: text('status').notNull().default('draft'),
  durationMin: integer('duration_min').notNull().default(90),
  // { mcqCount, mcqPoints (soru başına), definitionPoints, projectPoints }
  config: jsonb('config').$type<{ mcqCount: number; mcqPoints: number; definitionPoints: number; projectPoints: number }>().notNull(),
  createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [uniqueIndex('exam_sessions_code').on(t.code)])

export const examAttempts = pgTable('exam_attempts', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id').notNull().references(() => examSessions.id, { onDelete: 'cascade' }),
  studentNo: text('student_no').notNull(),
  studentName: text('student_name').notNull(),
  // Öğrenci çerezindeki belirtecin sha256 özeti
  tokenHash: text('token_hash').notNull(),
  // Öğretmen "yeniden girişe izin ver" dediğinde true: bir sonraki giriş bu kaydı devralır
  allowRelogin: boolean('allow_relogin').notNull().default(false),
  projectId: text('project_id').notNull(),
  // Öğrenciye gösterilen sorular: [{ id, order: seçeneklerin gösterim sırası (asıl indeksler) }]
  mcq: jsonb('mcq').$type<{ id: string; order: number[] }[]>().notNull(),
  definitionId: text('definition_id').notNull(),
  // mcq: soru kimliği → asıl seçenek indeksi
  answers: jsonb('answers').$type<{ mcq: Record<string, number>; definition: string }>().notNull(),
  circuit: jsonb('circuit'),
  code: text('code'),
  startedAt: timestamp('started_at', { withTimezone: true }).notNull().defaultNow(),
  deadlineAt: timestamp('deadline_at', { withTimezone: true }).notNull(),
  savedAt: timestamp('saved_at', { withTimezone: true }),
  submittedAt: timestamp('submitted_at', { withTimezone: true }),
  // Sekme/pencere değiştirme sayısı vb.
  flags: jsonb('flags').$type<{ blur: number; pastes: number }>().notNull(),
  // pending | grading | done | error
  gradeStatus: text('grade_status').notNull().default('pending'),
  mcqScore: integer('mcq_score'),
  projectScore: integer('project_score'),
  projectGrade: jsonb('project_grade'),
  definitionScore: integer('definition_score'),
  teacherNote: text('teacher_note'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  uniqueIndex('exam_attempts_session_student').on(t.sessionId, t.studentNo),
  index('exam_attempts_token').on(t.tokenHash),
])
