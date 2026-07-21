# Hayāt — Personal Life OS · Worklog

## Project Overview
Rebuild of NizamOS LifeOS following the **Hallmark** anti-AI-slop design philosophy.
Single `/` route SPA with: landing + auth (no verification), Task page (Habit / Sholat / Hifdz / Tugas-Target), Finance (budget + savings), Menstrual calendar (toggle in settings), Settings.

## Design System (foundation)
- **Palette**: deep emerald primary (`oklch(0.46 0.09 165)`) + warm amber accent + warm-paper light / forest-charcoal dark. NO indigo/blue.
- **Type pairing (2+1 discipline)**: Fraunces (serif display) + Geist (sans body) + Geist Mono.
- **Tactile details**: paper grain overlay, hairline gradients, surface-tactile shadows, gradient borders, glow-primary, aurora/float animations, refined scrollbar.
- **Hallmark rules**: structural variety, no italic headers, no centered-default-hero, mobile-first 320/375/414/768, sticky footer.

## Tech
- Next.js 16 App Router, TS, Tailwind 4, shadcn/ui (new-york), Prisma (SQLite), next-themes, framer-motion, zustand, react-hook-form, sonner.
- Auth: cookie session `hayat_session` = userId. Mock Google + email login, NO verification.
- All on `/` route; client-side view switching via zustand.

## Prisma models
User, Habit, HabitLog, SholatLog, HifdzItem, Target, Task, Budget, Transaction, SavingsGoal, MenstrualLog. DB pushed & generated.

---
Task ID: 1
Agent: main (orchestrator)
Task: Foundation — design system, schema, auth lib

Work Log:
- Wrote globals.css with hallmark-inspired emerald/amber palette, paper grain, tactile surfaces, animations.
- Added Fraunces serif font via next/font in layout.tsx + ThemeProvider (next-themes).
- Wrote comprehensive prisma/schema.prisma with all 11 models; ran `bun run db:push` (success).
- Created src/lib/auth.ts with cookie session helpers (getSession, requireUser, createSession, destroySession).

Stage Summary:
- Design tokens locked. DB ready. Auth lib ready.
- Next: landing+auth page, app shell, task/finance/menstrual/settings, API routes (delegated to subagent).

---
Task ID: 8
Agent: full-stack-developer (API routes)
Task: Build ALL REST-style API routes (Next.js Route Handlers) for auth, settings, habits, sholat, hifdz, targets, tasks, budgets, transactions, savings, and menstrual.

Work Log:
- Read worklog + schema + auth lib to ground implementation in existing models/helpers.
- Created route tree under `src/app/api/` covering 11 resource groups (~30 endpoints).
- Every route uses `export const dynamic = 'force-dynamic'`, try/catch, and `requireUser()` returning 401 on UNAUTHORIZED.
- Auth: login (find-or-create by email, set cookie), google (auto-generate demo `you.google.{rnd}@gmail.com` if no email), logout, session (GET returns `{ user }` or `{ user: null }`).
- Settings: GET returns subset `{ theme, enableMenstrual, currency, name, email, image }`; PATCH validates theme/currency/name/enableMenstrual.
- Habits: GET includes last 30 days of logs per habit (using date-fns `subDays`); toggle creates/deletes log for a YYYY-MM-DD; log upserts with explicit count.
- Sholat: GET returns today's log (or empty defaults) + 30-day history; PUT merges only provided booleans via existing-or-default lookup; range endpoint filters by [from,to].
- Hifdz: GET computes summary (total ayahs, count, byStatus); PATCH sets lastReviewed=now when status -> 'memorized'; POST /review increments reviewCount + lastReviewed.
- Targets: PATCH recomputes `progress` from tasks (completed/total*100, rounded) when tasks exist.
- Tasks: GET supports `?targetId=`, `?date=YYYY-MM-DD`, and `?scope=today` (due today OR uncompleted); POST/PATCH/DELETE recompute parent target progress when `completed` changes or targetId set; `/reorder` batch-updates order.
- Budgets: GET computes `spent` per category from expense transactions in the same month; POST upserts on unique [userId, month, category].
- Transactions: GET filters by month (default current) + returns summary `{ totalIncome, totalExpense, balance }`.
- Savings: deposit accepts negative amount for withdrawal; clamps current at 0.
- Menstrual: GET computes `currentDay` (days since latest startDate +1) and `nextPredictedDate` (latestStart + cycleLength) using date-fns.
- Fixed a pre-existing blocker in `src/app/layout.tsx`: Fraunces next/font config had both `axes` and `weight` which crashed compilation and 500'd ALL routes. Removed the `weight` property (variable font uses default axis values).
- Ran `bun run lint` — clean, zero errors.
- Smoke-tested every endpoint with curl against the running dev server (login → session → settings → habits CRUD + toggle + log → sholat PUT merge → hifdz create/review/patch → targets + tasks with auto progress recompute (50% → 100%) → reorder → transactions summary → budgets spent computation → savings deposit/withdrawal → menstrual cycle calc → logout → 401 on protected route).

Stage Summary:
- Artifacts: ~22 files under `src/app/api/` (auth/{login,google,logout,session}, settings, habits/[+toggle, +log], sholat/+range, hifdz/[+review], targets/[id], tasks/[id]/+reorder, budgets/[id], transactions/[id], savings/[id]/+deposit, menstrual/[id]).
- Endpoint count: 30 endpoints across 11 resource groups.
- Endpoints:
  - POST /api/auth/login, POST /api/auth/google, POST /api/auth/logout, GET /api/auth/session
  - GET|PATCH /api/settings
  - GET|POST /api/habits, PATCH|DELETE /api/habits/[id], POST /api/habits/[id]/toggle, POST /api/habits/[id]/log
  - GET|PUT /api/sholat, GET /api/sholat/range
  - GET|POST /api/hifdz, PATCH|DELETE /api/hifdz/[id], POST /api/hifdz/[id]/review
  - GET|POST /api/targets, PATCH|DELETE /api/targets/[id]
  - GET|POST /api/tasks, PATCH|DELETE /api/tasks/[id], POST /api/tasks/reorder
  - GET|POST /api/budgets, PATCH|DELETE /api/budgets/[id]
  - GET|POST /api/transactions, PATCH|DELETE /api/transactions/[id]
  - GET|POST /api/savings, PATCH|DELETE /api/savings/[id], POST /api/savings/[id]/deposit
  - GET|POST /api/menstrual, PATCH|DELETE /api/menstrual/[id]
- Decisions: dates stored as `YYYY-MM-DD` strings (Sholat/Habit/Menstrual) and JS Date (Task.dueDate, Target.deadline, Transaction.date, SavingsGoal.deadline, HifdzItem.lastReviewed). All "current month" defaults use date-fns `format(new Date(), 'yyyy-MM')`. Spending per budget category computed on-the-fly from transactions rather than persisted on the Budget row, so the source of truth stays Transaction. Savings deposits clamped to >=0 to prevent negative balances. Reorder uses `updateMany` with userId guard to prevent cross-user writes. Lint-clean; no tests written per instruction.
- Side-effect fix: layout.tsx Fraunces font (removed `weight` to unblock compilation — affects all routes including API).

---
Task ID: L4
Agent: localizer (frontend i18n — casual Indonesian)
Task: Localize 3 frontend files (finance-page, cycle-page, settings-page) from English to casual Indonesian, keeping Arabic Islamic terms and natural tech terms.

Work Log:
- Read worklog + the 3 target files to ground edits in existing structure (only string literals touched; no logic/className/imports/structure changed).
- finance-page.tsx: localized ~46 strings.
  - DEFAULT_CATEGORIES: 'Food'→'Makan', 'Transport' (kept), 'Bills'→'Tagihan', 'Shopping'→'Belanja', 'Sadaqah'→'Sedekah', 'Health'→'Kesehatan', 'Education'→'Pendidikan', 'Other'→'Lainnya'.
  - Header/labels: "Finance"→"Keuangan", "This month"→"Bulan ini", "Income"→"Pemasukan", "Expense"→"Pengeluaran", "Balance"→"Sisa".
  - Budget section: "Monthly budget"→"Anggaran bulanan", "{x} of {y} used"→"{x} dari {y} terpakai", "Remove"→"Hapus", "Add budget category"→"Tambah kategori anggaran", "Budget category"→"Kategori anggaran", "Category"→"Kategori" (replace_all, both budget+transaction), "Monthly limit ({c})"→"Batas per bulan ({c})", "Set budget"→"Set anggaran".
  - Savings section: "Savings targets"→"Target tabungan", "{n} goal(s) in motion"→"{n} target berjalan" (dropped English plural ternary), "Set a savings horizon — umrah, emergency fund, a quiet dream."→"Tentukan target tabungan — umrah, dana darurat, atau mimpi kecilmu.", "{x} saved"→"{x} ditabung", "{pct}% of {target}"→"{pct}% dari {target}", "Goal reached, alhamdulillah." kept, "Deposit / withdraw"→"Tabung / tarik", "Amount (use negative to withdraw)"→"Nominal (pakai minus buat narik)", "Confirm"→"Konfirmasi", "New savings goal"→"Target tabungan baru", "Savings goal" (dialog)→"Target tabungan", "What are you saving for?"→"Nabung buat apa?", placeholder "e.g. Umrah, Emergency fund"→"Mis. Umrah, Dana darurat", "Target amount ({c})"→"Nominal target ({c})", "Create"→"Buat".
  - Transactions section: "Transactions"→"Transaksi", "Add" (header btn)→"Tambah", "Add transaction"→"Tambah transaksi", "Expense"/"Income" toggle buttons→"Pengeluaran"/"Pemasukan", "Amount ({c})"→"Nominal ({c})", "Note (optional)"→"Catatan (opsional)", "What was it for?"→"Buat apa?", "Add" (dialog btn)→"Tambah", "No transactions this month yet."→"Belum ada transaksi bulan ini.", fallback 'Income'/'Expense'→'Pemasukan'/'Pengeluaran'.
  - Toasts: 'Enter a valid limit'→'Masukkan batas yang valid', 'Budget set'→'Anggaran diset', 'Add a title and target amount'→'Isi judul dan nominal target', 'Savings goal created'→'Target tabungan dibuat', 'Enter an amount'→'Masukkan nominal', 'Deposited'/'Withdrawn'→'Ditabung'/'Ditarik', 'Enter a valid amount'→'Masukkan nominal yang valid', 'Transaction added'→'Transaksi ditambah'.
  - All 4 "Cancel" buttons → "Batal" (replace_all on DialogClose+Button ghost pattern).
- cycle-page.tsx: localized ~27 strings.
  - Header: "Cycle · private by design"→"Siklus · privasi terjaga", "Menstrual calendar"→"Kalender menstruasi", description → "Kalkulator tenang dan privat. Nggak ada data yang keluar dari perangkat ini. Matikan permukaan ini kapan aja di Pengaturan."
  - Status cards: "Cycle day"→"Hari siklus", `Day ${n}`→`Hari ${n}`, "{n}-day cycle"→"Siklus {n} hari" (reordered for natural ID), "Next period"→"Haid berikutnya", "in {n} days"→"dalam {n} hari", "Logged cycles"→"Siklus tercatat", "recorded period(s)"→"haid tercatat" (dropped plural ternary).
  - Calendar: "Today"→"Hari ini", weekday array ['Mon'..'Sun']→['Sen','Sel','Rab','Kam','Jum','Sab','Min'] (hand-written array, not a date-fns format() call, so translated), title attrs 'Period (logged)'→'Haid (tercatat)', 'Period (predicted)'→'Haid (prediksi)', 'Fertile window'→'Masa subur', legend "Period"→"Haid"/"Predicted"→"Prediksi"/"Fertile"→"Subur"/"Ovulation"→"Ovulasi".
  - Log form: "Log a period"→"Catat haid", "Record when it began..."→"Catat kapan mulainya. Kalender bakal memprediksi yang berikutnya.", "Log period" (btn+dialog title)→"Catat haid", "Start date"→"Tanggal mulai", "End date (optional)"→"Tanggal selesai (opsional)", "Cycle length"→"Panjang siklus", "Period length"→"Lama haid", "Cancel"→"Batal", "Save"→"Simpan".
  - History: "History"→"Riwayat". Kept "{n}-day period · {n}-day cycle" as-is per instruction. Kept all date-fns format() calls as-is per instruction.
  - Toasts: 'Pick a start date'→'Pilih tanggal mulai', 'Period logged'→'Haid dicatat'.
- settings-page.tsx: localized ~22 strings.
  - CURRENCIES labels: IDR kept, 'US Dollar ($)'→'Dolar AS ($)', EUR kept, 'British Pound (£)'→'Pound Sterling (£)', 'Malaysian Ringgit (RM)'→'Ringgit Malaysia (RM)', 'Saudi Riyal'→'Riyal Saudi', 'UAE Dirham'→'Dirham UAE', 'Turkish Lira'→'Lira Turki'.
  - Header: "Settings"→"Pengaturan", "Make it yours"→"Atur sesukamu".
  - Profile: title "Profile"→"Profil", desc "How you appear in Hayāt"→"Namamu di Hayāt", "Signed in via Google/email"→"Masuk lewat Google/email" (kept Google/email tokens), "Display name"→"Nama tampilan", placeholder "Your name"→"Namamu", "Save"→"Simpan".
  - Appearance: title "Appearance"→"Tampilan", desc "Light, dark, or follow the system"→"Terang, gelap, atau ikut sistem", theme labels 'Light'→'Terang'/'Dark'→'Gelap'/'Auto'→'Otomatis'.
  - Menstrual: title "Menstrual calendar"→"Kalender menstruasi", desc →"Kalkulator siklus privat buat Muslimah. Default-nya mati.", "Enable Cycle surface"→"Aktifkan permukaan Siklus", "Adds a private calendar in the sidebar. Toggle off anytime."→"Nambah kalender privat di sidebar. Bisa dimatiin kapan aja.", "Cycle is now visible in the sidebar."→"Siklus sekarang muncul di sidebar."
  - Currency: title "Currency"→"Mata uang", desc "Used across the Finance surface"→"Dipakai di permukaan Keuangan".
  - Account: title "Account"→"Akun", desc "End this session"→"Akhiri sesi ini", "Sign out"→"Keluar".
  - Footer: "Hayāt · Life OS · Your data stays on this device."→"Hayāt · Life OS · Datamu cuma ada di perangkat ini."
  - Toasts: 'Saved'→'Tersimpan', 'Could not save'→'Gagal menyimpan', 'Signed out'→'Berhasil keluar', 'Could not sign out'→'Gagal keluar'.
- Ran `bun run lint` — clean, zero errors. No logic/className/import/structure changes; only string literals modified (plus dropping two English-pluralization ternaries that don't apply to Indonesian, which is a localization-appropriate string simplification).

Stage Summary:
- 3 files fully localized to casual Indonesian (kamu/kayak/aja/nih tone, Gojek/Tokopedia-style). Arabic Islamic terms (umrah, alhamdulillah, Muslimah, Sedekah/Sadaqah) preserved; tech terms (Google, email, sidebar, Transport) kept where natural. date-fns format() calls left as-is per instruction. Lint-clean.
