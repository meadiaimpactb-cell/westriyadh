import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  int,
  bigint,
  boolean,
  timestamp,
  double,
  json,
} from "drizzle-orm/mysql-core";

// ── المستخدمون (تسجيل الدخول عبر OAuth) ────────────────────────────────────
export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  // نوع الحساب في المنصة
  accountType: mysqlEnum("accountType", ["seeker", "employer"]).default("seeker").notNull(),
  phone: varchar("phone", { length: 32 }),
  // موقع الباحث: حي السكن + الإحداثيات الملتقطة من GPS
  hoodId: bigint("hoodId", { mode: "number", unsigned: true }),
  lat: double("lat"),
  lng: double("lng"),
  currentJob: varchar("currentJob", { length: 255 }),
  expYears: varchar("expYears", { length: 16 }),
  education: varchar("education", { length: 64 }),
  interests: json("interests").$type<string[]>(),
  skills: json("skills").$type<string[]>(),
  cvSummary: text("cvSummary"),
  cvData: json("cvData").$type<Record<string, string>>(),
  links: json("links").$type<{ linkedin?: string; twitter?: string; other?: string }>(),
  cvLogoFree: boolean("cvLogoFree").default(false).notNull(),
  points: int("points").default(0).notNull(),
  profileDone: boolean("profileDone").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ── الأحياء: نطاق غرب وجنوب الرياض — يديرها الأدمن (إضافة/تعديل/حذف) ───────
export const neighborhoods = mysqlTable("neighborhoods", {
  id: serial("id").primaryKey(),
  nameAr: varchar("nameAr", { length: 120 }).notNull(),
  nameEn: varchar("nameEn", { length: 120 }).notNull(),
  zone: mysqlEnum("zone", ["west", "south"]).default("west").notNull(),
  lat: double("lat").notNull(),
  lng: double("lng").notNull(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type Neighborhood = typeof neighborhoods.$inferSelect;

// ── الشركات وفروعها ─────────────────────────────────────────────────────────
export const companies = mysqlTable("companies", {
  id: serial("id").primaryKey(),
  ownerId: bigint("ownerId", { mode: "number", unsigned: true }),
  nameAr: varchar("nameAr", { length: 200 }).notNull(),
  nameEn: varchar("nameEn", { length: 200 }).notNull(),
  sectorAr: varchar("sectorAr", { length: 120 }),
  sectorEn: varchar("sectorEn", { length: 120 }),
  color: varchar("color", { length: 16 }).default("#0F766E"),
  initials: varchar("initials", { length: 8 }),
  cr: varchar("cr", { length: 64 }),
  verified: boolean("verified").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type Company = typeof companies.$inferSelect;

// ── الوظائف ─────────────────────────────────────────────────────────────────
export const jobs = mysqlTable("jobs", {
  id: serial("id").primaryKey(),
  companyId: bigint("companyId", { mode: "number", unsigned: true }).notNull(),
  hoodId: bigint("hoodId", { mode: "number", unsigned: true }).notNull(),
  titleAr: varchar("titleAr", { length: 200 }).notNull(),
  titleEn: varchar("titleEn", { length: 200 }).notNull(),
  descAr: text("descAr"),
  descEn: text("descEn"),
  reqAr: json("reqAr").$type<string[]>(),
  reqEn: json("reqEn").$type<string[]>(),
  skills: json("skills").$type<string[]>(),
  salaryMin: int("salaryMin").notNull(),
  salaryMax: int("salaryMax").notNull(),
  type: mysqlEnum("type", ["full", "part", "shift"]).default("full").notNull(),
  hoursAr: varchar("hoursAr", { length: 200 }),
  hoursEn: varchar("hoursEn", { length: 200 }),
  promotedUntil: timestamp("promotedUntil"),
  status: mysqlEnum("status", ["active", "closed"]).default("active").notNull(),
  brandColor: varchar("brandColor", { length: 16 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type Job = typeof jobs.$inferSelect;

// ── الطلبات — تتبع شفاف + سبب رفض إلزامي + اعتراض بشري ────────────────────
export const applications = mysqlTable("applications", {
  id: serial("id").primaryKey(),
  jobId: bigint("jobId", { mode: "number", unsigned: true }).notNull(),
  seekerId: bigint("seekerId", { mode: "number", unsigned: true }).notNull(),
  status: mysqlEnum("status", ["sent", "seen", "shortlist", "interview", "rejected", "hired"]).default("sent").notNull(),
  rejectionReason: varchar("rejectionReason", { length: 300 }),
  objection: text("objection"),
  objectedAt: timestamp("objectedAt"),
  matchScore: int("matchScore"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});
export type Application = typeof applications.$inferSelect;

// ── سجل النقاط (شحن/استهلاك) — نقاط غير مستردة ────────────────────────────
export const pointsTx = mysqlTable("points_tx", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  delta: int("delta").notNull(), // موجب شحن، سالب استهلاك
  kind: mysqlEnum("kind", ["topup", "ai_ad", "promote3", "promote7", "cv_logo", "admin_adjust"]).notNull(),
  note: varchar("note", { length: 300 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type PointsTx = typeof pointsTx.$inferSelect;

// ── إعدادات المنصة (تُدار من لوحة الأدمن) — مفتاح/قيمة JSON ───────────────
export const settings = mysqlTable("settings", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 80 }).notNull().unique(),
  value: json("value"),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

// ── الأخبار ─────────────────────────────────────────────────────────────────
export const news = mysqlTable("news", {
  id: serial("id").primaryKey(),
  textAr: varchar("textAr", { length: 400 }).notNull(),
  textEn: varchar("textEn", { length: 400 }).notNull(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ── أسباب عدم القبول الجاهزة (يحررها الأدمن) ───────────────────────────────
export const rejectionReasons = mysqlTable("rejection_reasons", {
  id: serial("id").primaryKey(),
  textAr: varchar("textAr", { length: 300 }).notNull(),
  textEn: varchar("textEn", { length: 300 }).notNull(),
  active: boolean("active").default(true).notNull(),
});

// ── نصوص السياسات القابلة للتحرير ───────────────────────────────────────────
export const policies = mysqlTable("policies", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 40 }).notNull().unique(), // terms|privacy|payment|points|ai
  bodyAr: text("bodyAr"),
  bodyEn: text("bodyEn"),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});
