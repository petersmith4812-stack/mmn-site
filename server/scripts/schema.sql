-- ═══════════════════════════════════════════════════════════════
--  MMN Database Schema — run once in Supabase SQL Editor
--  Project: zewokrqugycflirqoubd
-- ═══════════════════════════════════════════════════════════════

-- Schools
CREATE TABLE IF NOT EXISTS schools (
  id          TEXT PRIMARY KEY DEFAULT 'school_' || replace(gen_random_uuid()::text, '-', ''),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  timezone    TEXT NOT NULL DEFAULT 'Asia/Karachi',
  country     TEXT NOT NULL DEFAULT 'PK',
  city        TEXT,
  address     TEXT,
  phone       TEXT,
  email       TEXT,
  logo_url    TEXT,
  settings    JSONB NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Admin users (dashboard panel)
CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY DEFAULT 'u_' || replace(gen_random_uuid()::text, '-', ''),
  school_id     TEXT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'EDITOR'
                  CHECK (role IN ('SUPERADMIN','PRINCIPAL','TEACHER','TEACHER_ASSISTANT',
                                  'CRM_AGENT','PARENT_LIAISON','FINANCE_OFFICER','HR_MANAGER',
                                  'CONTENT_EDITOR','ANALYTICS_VIEWER','EDITOR','VIEWER')),
  avatar        TEXT NOT NULL DEFAULT '👤',
  active        BOOLEAN NOT NULL DEFAULT TRUE,
  last_login_at TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(school_id, email)
);

-- JWT refresh tokens
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id         TEXT PRIMARY KEY DEFAULT 'rt_' || replace(gen_random_uuid()::text, '-', ''),
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token      TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Classes (must be before students for FK)
CREATE TABLE IF NOT EXISTS classes (
  id        TEXT PRIMARY KEY DEFAULT 'cls_' || replace(gen_random_uuid()::text, '-', ''),
  school_id TEXT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  name      TEXT NOT NULL,
  age_group TEXT,
  max_size  INTEGER NOT NULL DEFAULT 15,
  color     TEXT
);

-- Students
CREATE TABLE IF NOT EXISTS students (
  id                TEXT PRIMARY KEY DEFAULT 'st_' || replace(gen_random_uuid()::text, '-', ''),
  school_id         TEXT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  first_name        TEXT NOT NULL,
  last_name         TEXT NOT NULL,
  date_of_birth     DATE,
  gender            TEXT CHECK (gender IN ('MALE','FEMALE')),
  photo_url         TEXT,
  admission_no      TEXT,
  enrolled_at       TIMESTAMPTZ,
  status            TEXT NOT NULL DEFAULT 'ACTIVE'
                      CHECK (status IN ('INQUIRY','APPLIED','WAITLISTED','ENROLLED',
                                        'ACTIVE','GRADUATED','WITHDRAWN','INACTIVE')),
  program_type      TEXT CHECK (program_type IN ('PRESCHOOL','AFTERSCHOOL_CLUB','MOTHERS_PROGRAMME')),
  class_id          TEXT REFERENCES classes(id) ON DELETE SET NULL,
  allergies         TEXT[] NOT NULL DEFAULT '{}',
  medical_notes     TEXT,
  emergency_contact TEXT,
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Parents
CREATE TABLE IF NOT EXISTS parents (
  id                   TEXT PRIMARY KEY DEFAULT 'par_' || replace(gen_random_uuid()::text, '-', ''),
  school_id            TEXT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  first_name           TEXT NOT NULL,
  last_name            TEXT NOT NULL DEFAULT '',
  email                TEXT,
  phone                TEXT,
  whatsapp             TEXT,
  occupation           TEXT,
  photo_url            TEXT,
  portal_enabled       BOOLEAN NOT NULL DEFAULT FALSE,
  portal_password_hash TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Student ↔ Parent links
CREATE TABLE IF NOT EXISTS student_parents (
  id         TEXT PRIMARY KEY DEFAULT 'sp_' || replace(gen_random_uuid()::text, '-', ''),
  student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  parent_id  TEXT NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
  relation   TEXT NOT NULL DEFAULT 'mother',
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE(student_id, parent_id)
);

-- CRM Leads
CREATE TABLE IF NOT EXISTS leads (
  id               TEXT PRIMARY KEY DEFAULT 'l_' || replace(gen_random_uuid()::text, '-', ''),
  school_id        TEXT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  name             TEXT NOT NULL,
  email            TEXT,
  phone            TEXT,
  whatsapp         TEXT,
  child_name       TEXT,
  child_age        TEXT,
  program_interest TEXT,
  source           TEXT,
  message          TEXT,
  status           TEXT NOT NULL DEFAULT 'NEW'
                     CHECK (status IN ('NEW','CONTACTED','VISIT_BOOKED','MEETING_DONE','ENROLLED','COLD')),
  priority         TEXT NOT NULL DEFAULT 'MEDIUM'
                     CHECK (priority IN ('LOW','MEDIUM','HIGH')),
  tags             TEXT[] NOT NULL DEFAULT '{}',
  assigned_to_id   TEXT REFERENCES users(id) ON DELETE SET NULL,
  visit_date       TIMESTAMPTZ,
  follow_up_date   TIMESTAMPTZ,
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Lead activities / contact history
CREATE TABLE IF NOT EXISTS lead_activities (
  id      TEXT PRIMARY KEY DEFAULT 'la_' || replace(gen_random_uuid()::text, '-', ''),
  lead_id TEXT NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  type    TEXT NOT NULL,
  note    TEXT,
  date    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Academic years
CREATE TABLE IF NOT EXISTS academic_years (
  id         TEXT PRIMARY KEY DEFAULT 'ay_' || replace(gen_random_uuid()::text, '-', ''),
  school_id  TEXT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date   DATE NOT NULL,
  is_current BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Terms (within academic years)
CREATE TABLE IF NOT EXISTS terms (
  id               TEXT PRIMARY KEY DEFAULT 'trm_' || replace(gen_random_uuid()::text, '-', ''),
  academic_year_id TEXT NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
  name             TEXT NOT NULL,
  start_date       DATE NOT NULL,
  end_date         DATE NOT NULL,
  is_current       BOOLEAN NOT NULL DEFAULT FALSE
);

-- Enrollments
CREATE TABLE IF NOT EXISTS enrollments (
  id               TEXT PRIMARY KEY DEFAULT 'en_' || replace(gen_random_uuid()::text, '-', ''),
  student_id       TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  academic_year_id TEXT NOT NULL REFERENCES academic_years(id),
  program_type     TEXT NOT NULL CHECK (program_type IN ('PRESCHOOL','AFTERSCHOOL_CLUB','MOTHERS_PROGRAMME')),
  enrolled_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status           TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','COMPLETED','WITHDRAWN'))
);

-- Staff
CREATE TABLE IF NOT EXISTS staff (
  id         TEXT PRIMARY KEY DEFAULT 'sf_' || replace(gen_random_uuid()::text, '-', ''),
  school_id  TEXT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name  TEXT NOT NULL,
  email      TEXT,
  phone      TEXT,
  role       TEXT NOT NULL,
  photo_url  TEXT,
  joined_at  DATE,
  active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Progress records
CREATE TABLE IF NOT EXISTS progress_records (
  id           TEXT PRIMARY KEY DEFAULT 'pr_' || replace(gen_random_uuid()::text, '-', ''),
  student_id   TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  domain       TEXT NOT NULL,
  objective    TEXT NOT NULL,
  level        TEXT NOT NULL,
  notes        TEXT,
  evidence_url TEXT,
  observed_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Attendance
CREATE TABLE IF NOT EXISTS attendance (
  id             TEXT PRIMARY KEY DEFAULT 'att_' || replace(gen_random_uuid()::text, '-', ''),
  student_id     TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  date           DATE NOT NULL,
  status         TEXT NOT NULL CHECK (status IN ('PRESENT','ABSENT','LATE','EXCUSED','HALF_DAY')),
  arrival_time   TIMESTAMPTZ,
  departure_time TIMESTAMPTZ,
  notes          TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, date)
);

-- Behaviour logs (ABA/CBT model)
CREATE TABLE IF NOT EXISTS behaviour_logs (
  id          TEXT PRIMARY KEY DEFAULT 'bl_' || replace(gen_random_uuid()::text, '-', ''),
  student_id  TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  category    TEXT NOT NULL DEFAULT 'NEUTRAL' CHECK (category IN ('POSITIVE','CHALLENGING','NEUTRAL')),
  setting     TEXT DEFAULT 'CLASSROOM' CHECK (setting IN ('CLASSROOM','PLAYGROUND','LUNCH','NAP_TIME','TRANSITION','OTHER')),
  antecedent  TEXT,
  behaviour   TEXT NOT NULL,
  consequence TEXT,
  intensity   INTEGER CHECK (intensity BETWEEN 1 AND 5),
  duration    INTEGER,
  notes       TEXT,
  observed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- Safe to re-run: adds columns if old schema was already applied
ALTER TABLE behaviour_logs ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'NEUTRAL' CHECK (category IN ('POSITIVE','CHALLENGING','NEUTRAL'));
ALTER TABLE behaviour_logs ADD COLUMN IF NOT EXISTS setting  TEXT DEFAULT 'CLASSROOM' CHECK (setting IN ('CLASSROOM','PLAYGROUND','LUNCH','NAP_TIME','TRANSITION','OTHER'));

-- Nutrition logs
CREATE TABLE IF NOT EXISTS nutrition_logs (
  id           TEXT PRIMARY KEY DEFAULT 'nl_' || replace(gen_random_uuid()::text, '-', ''),
  student_id   TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  date         DATE NOT NULL,
  meal         TEXT NOT NULL CHECK (meal IN ('BREAKFAST','MORNING_SNACK','LUNCH','AFTERNOON_SNACK')),
  items        TEXT[] NOT NULL DEFAULT '{}',
  portion_eaten TEXT CHECK (portion_eaten IN ('ALL','MOST','HALF','LITTLE','NONE')),
  notes        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, date, meal)
);

-- Fee structures
CREATE TABLE IF NOT EXISTS fee_structures (
  id           TEXT PRIMARY KEY DEFAULT 'fs_' || replace(gen_random_uuid()::text, '-', ''),
  school_id    TEXT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  program_type TEXT NOT NULL CHECK (program_type IN ('PRESCHOOL','AFTERSCHOOL_CLUB','MOTHERS_PROGRAMME')),
  amount       DECIMAL(10,2) NOT NULL,
  currency     TEXT NOT NULL DEFAULT 'PKR',
  frequency    TEXT NOT NULL DEFAULT 'monthly'
);

-- Invoices
CREATE TABLE IF NOT EXISTS invoices (
  id                TEXT PRIMARY KEY DEFAULT 'inv_' || replace(gen_random_uuid()::text, '-', ''),
  school_id         TEXT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  fee_structure_id  TEXT REFERENCES fee_structures(id) ON DELETE SET NULL,
  student_id        TEXT REFERENCES students(id) ON DELETE SET NULL,
  student_name      TEXT NOT NULL,
  amount            DECIMAL(10,2) NOT NULL,
  currency          TEXT NOT NULL DEFAULT 'PKR',
  month             TEXT,
  status            TEXT NOT NULL DEFAULT 'DRAFT'
                      CHECK (status IN ('DRAFT','SENT','PAID','OVERDUE','CANCELLED')),
  due_date          DATE,
  paid_at           TIMESTAMPTZ,
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS student_id TEXT REFERENCES students(id) ON DELETE SET NULL;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS month TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS notes TEXT;
CREATE INDEX IF NOT EXISTS idx_invoices_school_month ON invoices(school_id, month);

-- Blog posts
CREATE TABLE IF NOT EXISTS blogs (
  id           TEXT PRIMARY KEY DEFAULT 'blg_' || replace(gen_random_uuid()::text, '-', ''),
  school_id    TEXT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  slug         TEXT NOT NULL,
  excerpt      TEXT,
  content      TEXT,
  cover_url    TEXT,
  tags         TEXT[] NOT NULL DEFAULT '{}',
  status       TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT','PUBLISHED','ARCHIVED')),
  views        INTEGER NOT NULL DEFAULT 0,
  published_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(school_id, slug)
);

-- Campaigns
CREATE TABLE IF NOT EXISTS campaigns (
  id         TEXT PRIMARY KEY DEFAULT 'cm_' || replace(gen_random_uuid()::text, '-', ''),
  school_id  TEXT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  type       TEXT NOT NULL,
  status     TEXT NOT NULL DEFAULT 'draft',
  subject    TEXT,
  body       TEXT,
  audience   TEXT,
  sent_at    TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Audit logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id         TEXT PRIMARY KEY DEFAULT 'al_' || replace(gen_random_uuid()::text, '-', ''),
  school_id  TEXT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  user_id    TEXT REFERENCES users(id) ON DELETE SET NULL,
  action     TEXT NOT NULL,
  entity     TEXT NOT NULL,
  entity_id  TEXT,
  changes    JSONB,
  ip         TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Parent messages (school → parent)
CREATE TABLE IF NOT EXISTS parent_messages (
  id         TEXT PRIMARY KEY DEFAULT 'pm_' || replace(gen_random_uuid()::text, '-', ''),
  school_id  TEXT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  parent_id  TEXT NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
  student_id TEXT REFERENCES students(id) ON DELETE SET NULL,
  sender_id  TEXT REFERENCES users(id) ON DELETE SET NULL,
  subject    TEXT NOT NULL,
  body       TEXT NOT NULL,
  is_read    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_parent_messages_parent ON parent_messages(parent_id);

-- Lesson plans
CREATE TABLE IF NOT EXISTS lesson_plans (
  id               TEXT PRIMARY KEY DEFAULT 'lp_' || replace(gen_random_uuid()::text, '-', ''),
  school_id        TEXT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  class_id         TEXT REFERENCES classes(id) ON DELETE SET NULL,
  academic_year_id TEXT REFERENCES academic_years(id) ON DELETE SET NULL,
  date             DATE NOT NULL,
  subject          TEXT NOT NULL,
  title            TEXT NOT NULL,
  objectives       TEXT[] NOT NULL DEFAULT '{}',
  activities       TEXT,
  resources        TEXT,
  assessment       TEXT,
  status           TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT','READY','DONE')),
  created_by       TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Indexes for performance ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_students_school  ON students(school_id);
CREATE INDEX IF NOT EXISTS idx_students_status  ON students(status);
CREATE INDEX IF NOT EXISTS idx_leads_school     ON leads(school_id);
CREATE INDEX IF NOT EXISTS idx_leads_status     ON leads(status);
CREATE INDEX IF NOT EXISTS idx_users_school     ON users(school_id);
CREATE INDEX IF NOT EXISTS idx_att_student_date ON attendance(student_id, date);
CREATE INDEX IF NOT EXISTS idx_leads_created    ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_students_created ON students(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lessons_class_date ON lesson_plans(class_id, date);
CREATE INDEX IF NOT EXISTS idx_lessons_school_date ON lesson_plans(school_id, date);
