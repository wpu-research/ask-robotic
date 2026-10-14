# Okul ve Üyelik Altyapısı

Durum: **altyapı hazır, arayüz yok, ödeme/paywall kapalı.** Strateji: `docs/strateji-okul-platformu.tr.md` §6.

Ürün bugün açık bir çevrim içi ders platformu. Bu katman iki satış modelini aynı yetki (entitlement) sistemiyle
çözmek için var:

- **Okul (kolej) lisansı:** kurum → kampüs → sınıf → öğretmen/öğrenci, koltuk sayılı, dönemlik/yıllık.
- **Bireysel / aile üyeliği:** kullanıcı → plan (ücretsiz / premium / aile).

Migrasyon: `packages/db/migrations/0003_okul_uyelik.sql` (drizzle-kit ile üretildi; sonuna plan satırları elle eklendi).

## 1. Veri modeli

### Mevcut tablolarda değişiklik

| Tablo | Değişiklik | Neden |
|---|---|---|
| `users` | `email` ve `password_hash` artık boş olabilir; `username` (unique), `locale` (varsayılan `tr`), `birth_year`, `login_mode` (`email` / `qr` / `picture`, varsayılan `email`) | Küçük öğrenciler okulun açtığı hesapla, e-postasız (QR kart / resimli şifre) girer |
| `users` | CHECK `users_kimlik`: `email` ya da `username` dolu olmalı | Kimliksiz hesap açılamaz |
| `lessons` | `steps jsonb` (`LessonStep[]`) | Etkileşimli ders (v2) adımları; `seedContent` yazar |
| `progress` | `started_at` (varsayılan `now()`) | Ücretsiz plandaki günlük ders sayacı |

Mevcut satırlar geçerli kalır: hepsinde e-posta var, yeni kolonların varsayılanı var.
`users.parent_id` duruyor; yeni veli bağları `guardian_links`'e yazılmalı.

### Yeni tablolar

| Tablo | Amaç | Önemli kolonlar / kısıtlar |
|---|---|---|
| `organizations` | Okul, ilçe, şirket | `slug` unique, `kind` (`school`/`district`/`company`), `country` `TR`, `locale` `tr` |
| `campuses` | Kampüs/şube | `organization_id` → organizations (cascade) |
| `organization_members` | Kurumdaki rol | (`organization_id`, `user_id`) unique; `role`: `owner`/`admin`/`teacher`/`student`/`parent` |
| `classes` | Sınıf | `join_code` unique (sınıf kodu + QR), `campus_id` (set null), `teacher_id` (sorumlu öğretmen, set null), `grade_level`, `archived` |
| `class_members` | Sınıf üyeliği | (`class_id`, `user_id`) unique; `role`: `teacher`/`student` |
| `assignments` | Ödev | `lesson_id` / `week_id` / `module_id`'den **tam olarak biri** (CHECK `assignments_tek_hedef` + `lib/assignments.ts`), `due_at`, `created_by` (set null) |
| `plans` | Plan kataloğu | `id`: `free`/`premium`/`family`/`school`; `seat_limit`; `features` (string[]) |
| `subscriptions` | Bireysel/aile aboneliği | `user_id` (sahip), `plan_id`, `status` (`trialing`/`active`/`past_due`/`canceled`/`expired`), `provider` (`iyzico`/`stripe`/`manual`), `provider_ref` ((`provider`,`provider_ref`) unique), `current_period_end` (null = süresiz) |
| `subscription_members` | Aile planındaki diğer hesaplar | (`subscription_id`, `user_id`) unique |
| `licenses` | Okul lisansı | `organization_id`, `plan_id` (`school`), `seats` (≥ 0), `starts_at`, `ends_at`, `scope` |
| `guardian_links` | Veli ↔ öğrenci | (`parent_user_id`, `student_user_id`) unique; `verified_at` dolana kadar bağ veri erişimi vermez |
| `consents` | KVKK onay kayıtları | `user_id` ya da `device_id` (CHECK), `kind` (`kvkk_aydinlatma`/`veli_acik_riza`/`ai_tutor`), `granted`, `granted_by`, `at` |
| `xp_events` | Sunucu tarafı XP defteri (ileride) | `user_id`, `amount`, `source` (`step`/`lesson`/`practice`), `lesson_id`; indeks (`user_id`, `at`) |

İlişkiler (özet):

```
organizations ─┬─ campuses ─── classes (campus_id, opsiyonel)
               ├─ organization_members ── users
               ├─ classes ─┬─ class_members ── users
               │           └─ assignments ── lessons | weeks | modules (biri)
               └─ licenses ── plans
users ─┬─ subscriptions ── plans
       │      └─ subscription_members ── users (aile)
       ├─ guardian_links (veli ↔ öğrenci)
       ├─ consents
       └─ xp_events
```

Silme davranışı: kurum silinirse kampüs, sınıf, üyelik ve lisansları silinir. Kullanıcı silinirse üyelikleri,
abonelikleri, onayları ve XP'si silinir; oluşturduğu ödevler ve sorumlu olduğu sınıflar kalır (`set null`).
Plan satırları silinemez (abonelik/lisans FK'si).

### Varsayılan planlar (migrasyon yazar, `ON CONFLICT DO NOTHING`)

| id | Ad | seat_limit | features |
|---|---|---|---|
| `free` | Ücretsiz | — | — |
| `premium` | Premium | 1 | `unlimited_lessons`, `ai_tutor`, `personal_practice`, `no_ads` |
| `family` | Aile | 5 | premium ile aynı |
| `school` | Okul | — (koltuk lisanstan) | premium + `class_leagues` |

Plan satırları migrasyonda çünkü FK'ler bunlara bağlı ve `deploy.ts` her açılışta migrasyonu zaten çalıştırıyor;
testler (PGlite) de aynı yoldan geçer. Fiyat burada değil; ödeme sağlayıcısı bağlanınca sağlayıcıda tutulur.

## 2. Erişim nasıl çözülür

Kod: `apps/web/src/lib/entitlements.ts` (saf, DB yok) + `apps/web/src/lib/entitlements-db.ts` (ince yükleyici).

```ts
const ctx = await loadAccessContext(db, user?.id)          // abonelikler + kurum lisansları
const access = resolveAccess({ ...ctx, now })               // plan, özellikler, canOpenLesson
const ref = await loadLessonRef(db, lessonId, bandOf)       // modül slug'ı, hafta, bant
const usage = await loadLessonUsage(db, user.id, now)       // bugün açılan dersler
access.canOpenLesson(ref, usage)                            // { ok, reason }
```

Kurallar:

1. **`PAYWALL_ENABLED` kapalıysa** (varsayılan) her ders herkese açık (`reason: 'paywall_off'`) ve öğrenci
   özellikleri (`unlimited_lessons`, `ai_tutor`, `personal_practice`, `no_ads`) herkese verilir. `plan` alanı yine
   gerçek kaynağa göre hesaplanır (raporlama için). `teacher_dashboard` ve `class_leagues` paywall'dan bağımsızdır.
2. **Abonelik** etkinse: `trialing` / `active` / `past_due` / `canceled` durumlarında `current_period_end`'e kadar
   (null = süresiz, yalnız `manual`). `expired` hiçbir zaman. `canceled` = yenileme kapatıldı, ödenen dönem sürer.
   Aile üyeleri `subscription_members` üzerinden sahibin aboneliğini alır.
3. **Okul lisansı** etkinse (`starts_at ≤ now < ends_at`) kurumun öğrenci, öğretmen, yönetici ve sahiplerine ders
   erişimi verir. Üyelik `organization_members`'tan ya da **arşivlenmemiş** bir sınıfın `class_members`'ından gelir;
   aynı kurumda birden çok rol varsa güçlü olan geçer. Kurumdaki **veli** içerik lisansı almaz.
   - `scope = null` (ya da boş): her ders. `scope = { modules: [...], bands: [...] }`: dersin modül slug'ı ya da
     bandı eşleşmeli; kapsam dışı dersler ücretsiz kurala düşer.
   - Öğretmen/yönetici/sahip, etkin lisanslı kurumda **`teacher_dashboard`** alır.
   - Koltuk sayısı erişim anında sayılmaz; öğrenci kuruma/sınıfa eklenirken (`seatsAvailable`) kontrol edilir.
4. **Ücretsiz plan** (`freeRules`, varsayılan `{ lessonsPerDay: 1, firstWeekOpen: true }`):
   - Her modülün 1. haftası herkese açık (misafir dahil).
   - Giriş yapmış kullanıcı günde `lessonsPerDay` yeni ders açar; bugün açtığı dersi yeniden açabilir.
   - Misafir ilk hafta dışında `login_required` alır.
   - Gün sınırı Türkiye saatiyle gece yarısı (`istanbulDayStart`).
5. Birden çok kaynak varsa `plan` en yükseği (`school` > `family` > `premium` > `free` > `guest`), özellikler birleşimi.
   `plans.features` DB'den gelir; bilinmeyen özellik adları yok sayılır.

## 3. Kapalı olanlar / eksikler

- `PAYWALL_ENABLED` kapalı; `resolveAccess` henüz hiçbir sayfada çağrılmıyor.
- Giriş (`AUTH_ENABLED`) varsayılan açık (`false` ile kapanır); dersler girişsiz de açılır. E-posta/kullanıcı adı + parola ve
  QR kart (`/giris/qr?u=…&k=…`, `lib/auth/qr.ts`) var; resimli şifre yazılmadı.
- Ders açılışında `progress` satırı (`started`) yazan akış yok — şu an yalnız tamamlamada yazılıyor. Paywall açılmadan
  önce eklenmeli, yoksa günlük sayaç hep sıfır görür.
- Modül → yaş bandı eşlemesi DB'de yok; bantlı lisans kapsamı için `loadLessonRef`'e `bandOf` verilmeli.
- Ödeme sağlayıcısı (iyzico / Stripe) bağlı değil; abonelikler şimdilik yalnız `manual` açılabilir.
- AI tutor özelliği yetkiden ayrıca okulun ayarına ve `consents` (`ai_tutor`, gerekiyorsa `veli_acik_riza`) kaydına
  bağlanmalı; bu kontrol henüz yok.
- XP/seri tarayıcıda tutulur; oturum açıksa `components/auth/session-sync.tsx` `users.game`'e birleştirir (`mergeGame`)
  ve kazanımları `POST /api/me/xp` ile `xp_events`'e yazar (yalnız giriş sonrası kazanımlar; misafirken kazanılanlar deftere girmez).

## 4. Sonra gelecek arayüzler

- **Öğretmen paneli:** sınıf oluşturma, CSV ile toplu öğrenci, ödev atama, sınıf ilerleme tablosu, beceri ısı haritası.
- **Sınıfa katılma:** sınıf kodu (`classes.join_code`) ve bu kodu taşıyan QR; küçükler için QR kart / resimli şifre.
- **Okul yönetimi (admin):** kurum, kampüs, öğretmen, lisans ve koltuk yönetimi; dönem sonu raporu.
- **Veli:** `guardian_links` doğrulama, haftalık özet, onay (rıza) akışı.
- **Ödeme:** sağlayıcı webhook'u → `subscriptions` (durum, `current_period_end`, `provider_ref`).
- **Fiyat/plan sayfası:** paywall açıldığında.

## 5. KVKK notları

- **Rol dağılımı:** okul hesaplarında okul **veri sorumlusu**, biz **veri işleyen**iz → her okulla veri işleme
  sözleşmesi. Bireysel/aile üyeliğinde veri sorumlusu biziz.
- **En az veri:** okul öğrencisi için ad/rumuz + sınıf yeterli. E-posta ve parola zorunlu değil; doğum tarihi yerine
  yalnız **doğum yılı** tutulur (yaş bandı ve 16 yaş kontrolü için).
- **Onaylar** `consents`'e yalnız eklenir; geri çekme `granted = false` olan yeni satırdır, son satır geçerlidir.
  Kim adına kim verdi (`granted_by`) saklanır. Girişsiz kullanımda `device_id` ile tutulur.
- **Veli bağı** doğrulanmadan (`verified_at` boş) veliye öğrenci verisi gösterilmez.
- **Silme:** kullanıcı silindiğinde kişisel kayıtları (üyelik, onay, XP, ilerleme, oturum) cascade ile silinir.
  Kurum silindiğinde kurum yapısı silinir; öğrenci hesaplarının silinmesi sözleşmeye göre ayrı bir iş olarak yapılmalı.
- Okul hesaplarında reklam yok, öğrenciler arası mesajlaşma yok, herkese açık profil yok; ligler yalnız sınıf/okul içi.
- Sunucular yurt dışında (Railway) → yurt dışı aktarım değerlendirmesi okul sözleşmesinde ele alınmalı.
- Onay metinleri ve 16 yaş altı akışı taslaktır; hukukçuyla netleşmeli.
