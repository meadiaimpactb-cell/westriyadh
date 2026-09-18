import { z } from "zod";
import { eq, desc, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { createRouter, publicQuery, authedQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import * as s from "@db/schema";

// ── حساب المسافة والزمن ──────────────────────────────────────────────────────
function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371, dLat = ((b.lat - a.lat) * Math.PI) / 180, dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h)) * 1.28;
}

async function getSetting<T>(key: string, fb: T): Promise<T> {
  const row = await getDb().query.settings.findFirst({ where: eq(s.settings.key, key) });
  return (row?.value as T) ?? fb;
}

export const platformRouter = createRouter({
  // ══ عام ══════════════════════════════════════════════════════════════════
  neighborhoods: publicQuery.query(async () => {
    const rows = await getDb().query.neighborhoods.findMany({ where: eq(s.neighborhoods.active, true) });
    return rows;
  }),

  nearestHood: publicQuery
    .input(z.object({ lat: z.number(), lng: z.number() }))
    .query(async ({ input }) => {
      const rows = await getDb().query.neighborhoods.findMany({ where: eq(s.neighborhoods.active, true) });
      let best: typeof rows[0] | null = null, bestD = Infinity;
      for (const h of rows) {
        const d = haversineKm(input, h);
        if (d < bestD) { bestD = d; best = h; }
      }
      return best ? { ...best, distanceKm: +bestD.toFixed(2) } : null;
    }),

  jobs: publicQuery.query(async () => {
    const db = getDb();
    const rows = await db.select().from(s.jobs).where(eq(s.jobs.status, "active")).orderBy(desc(s.jobs.createdAt));
    const comps = await db.query.companies.findMany();
    const cmap = new Map(comps.map(c => [c.id, c]));
    return rows.map(j => ({ ...j, company: cmap.get(j.companyId) ?? null, promoted: j.promotedUntil ? j.promotedUntil > new Date() : false }));
  }),

  companies: publicQuery.query(() => getDb().query.companies.findMany()),

  settings: publicQuery.query(async () => {
    const keys = ["kpi", "seedManual", "heroTitle", "heroSub", "ads", "pricing", "pointsPackages", "payments", "ai", "social", "geo"] as const;
    const out: Record<string, any> = {};
    for (const k of keys) out[k] = await getSetting(k, null);
    return out;
  }),

  news: publicQuery.query(() => getDb().query.news.findMany({ where: eq(s.news.active, true) })),
  rejectionReasons: publicQuery.query(() => getDb().query.rejectionReasons.findMany({ where: eq(s.rejectionReasons.active, true) })),
  policy: publicQuery.input(z.object({ slug: z.string() })).query(({ input }) =>
    getDb().query.policies.findFirst({ where: eq(s.policies.slug, input.slug) })),

  commute: publicQuery
    .input(z.object({ fromHoodId: z.number(), toHoodId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const from = await db.query.neighborhoods.findFirst({ where: eq(s.neighborhoods.id, input.fromHoodId) });
      const to = await db.query.neighborhoods.findFirst({ where: eq(s.neighborhoods.id, input.toHoodId) });
      if (!from || !to) throw new TRPCError({ code: "NOT_FOUND" });
      const speed = (await getSetting<{ avgSpeed: number }>("geo", { avgSpeed: 35.7 })).avgSpeed;
      const km = haversineKm(from, to);
      return { km: +km.toFixed(1), minutes: Math.round((km / speed) * 60), speed };
    }),

  // ══ الباحث (يتطلب دخول) ═══════════════════════════════════════════════════
  me: authedQuery.query(({ ctx }) => ctx.user),

  completeProfile: authedQuery
    .input(z.object({
      accountType: z.enum(["seeker", "employer"]).optional(),
      hoodId: z.number().optional(),
      lat: z.number().optional(), lng: z.number().optional(),
      currentJob: z.string().optional(), expYears: z.string().optional(),
      education: z.string().optional(), interests: z.array(z.string()).optional(),
      skills: z.array(z.string()).optional(), phone: z.string().optional(),
      companyName: z.string().optional(), cr: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const { companyName, cr, ...profile } = input;
      await db.update(s.users).set({ ...profile, profileDone: true }).where(eq(s.users.id, ctx.user.id));
      if (input.accountType === "employer" && companyName) {
        const existing = await db.query.companies.findFirst({ where: eq(s.companies.ownerId, ctx.user.id) });
        if (!existing) {
          await db.insert(s.companies).values({
            ownerId: ctx.user.id, nameAr: companyName, nameEn: companyName, cr: cr ?? null,
            initials: companyName.slice(0, 2), color: "#0F766E",
          });
        }
      }
      return { ok: true };
    }),

  saveCv: authedQuery
    .input(z.object({
      summary: z.string().optional(),
      skills: z.array(z.string()).optional(),
      links: z.object({ linkedin: z.string().optional(), twitter: z.string().optional(), other: z.string().optional() }).optional(),
      data: z.record(z.string(), z.string()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      await getDb().update(s.users).set({
        cvSummary: input.summary, skills: input.skills, links: input.links, cvData: input.data,
      }).where(eq(s.users.id, ctx.user.id));
      return { ok: true };
    }),

  applyToJob: authedQuery
    .input(z.object({ jobId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const exists = await db.query.applications.findFirst({
        where: and(eq(s.applications.jobId, input.jobId), eq(s.applications.seekerId, ctx.user.id)),
      });
      if (exists) return { ok: true, already: true };
      const match = 62 + ((input.jobId * 31 + ctx.user.id * 7) % 36);
      await db.insert(s.applications).values({ jobId: input.jobId, seekerId: ctx.user.id, matchScore: match });
      return { ok: true };
    }),

  myApplications: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const apps = await db.select().from(s.applications).where(eq(s.applications.seekerId, ctx.user.id)).orderBy(desc(s.applications.createdAt));
    const jobRows = await db.query.jobs.findMany();
    const comps = await db.query.companies.findMany();
    const cmap = new Map(comps.map(c => [c.id, c]));
    const jmap = new Map(jobRows.map(j => [j.id, j]));
    return apps.map(a => {
      const job = jmap.get(a.jobId) ?? null;
      return { ...a, job, company: job ? cmap.get(job.companyId) ?? null : null };
    });
  }),

  objectApplication: authedQuery
    .input(z.object({ id: z.number(), objection: z.string().min(3) }))
    .mutation(async ({ ctx, input }) => {
      await getDb().update(s.applications)
        .set({ objection: input.objection, objectedAt: new Date() })
        .where(and(eq(s.applications.id, input.id), eq(s.applications.seekerId, ctx.user.id)));
      return { ok: true };
    }),

  // ══ المحفظة والنقاط ═══════════════════════════════════════════════════════
  wallet: authedQuery.query(async ({ ctx }) => {
    const tx = await getDb().select().from(s.pointsTx).where(eq(s.pointsTx.userId, ctx.user.id)).orderBy(desc(s.pointsTx.createdAt)).limit(50);
    return { balance: ctx.user.points, transactions: tx };
  }),

  topUp: authedQuery
    .input(z.object({ points: z.number().positive(), bonus: z.number().min(0).default(0), gateway: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const total = input.points + input.bonus;
      await db.transaction(async (tx) => {
        await tx.update(s.users).set({ points: ctx.user.points + total }).where(eq(s.users.id, ctx.user.id));
        await tx.insert(s.pointsTx).values({ userId: ctx.user.id, delta: total, kind: "topup", note: `شحن عبر ${input.gateway} (وضع اختبار)` });
      });
      return { ok: true, balance: ctx.user.points + total };
    }),

  spendPoints: authedQuery
    .input(z.object({ amount: z.number().positive(), kind: z.enum(["ai_ad", "promote3", "promote7", "cv_logo"]), jobId: z.number().optional() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const me = await db.query.users.findFirst({ where: eq(s.users.id, ctx.user.id) });
      if (!me || me.points < input.amount) throw new TRPCError({ code: "BAD_REQUEST", message: "رصيد النقاط غير كافٍ" });
      await db.transaction(async (tx) => {
        await tx.update(s.users).set({ points: me.points - input.amount, cvLogoFree: input.kind === "cv_logo" ? true : me.cvLogoFree }).where(eq(s.users.id, me.id));
        await tx.insert(s.pointsTx).values({ userId: me.id, delta: -input.amount, kind: input.kind });
        if ((input.kind === "promote3" || input.kind === "promote7") && input.jobId) {
          const days = input.kind === "promote3" ? 3 : 7;
          await tx.update(s.jobs).set({ promotedUntil: new Date(Date.now() + days * 864e5) }).where(eq(s.jobs.id, input.jobId));
        }
      });
      return { ok: true, balance: me.points - input.amount };
    }),

  // خدمة مدفوعة نقداً للأفراد (إزالة شعار السيرة) — بوابة الدفع تُربط من الأدمن
  payCvLogo: authedQuery
    .input(z.object({ gateway: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db.transaction(async (tx) => {
        await tx.update(s.users).set({ cvLogoFree: true }).where(eq(s.users.id, ctx.user.id));
        await tx.insert(s.pointsTx).values({ userId: ctx.user.id, delta: 0, kind: "cv_logo", note: `دفع نقدي عبر ${input.gateway} (وضع اختبار)` });
      });
      return { ok: true };
    }),

  // ══ صاحب العمل ════════════════════════════════════════════════════════════
  myCompany: authedQuery.query(async ({ ctx }) => {
    return getDb().query.companies.findFirst({ where: eq(s.companies.ownerId, ctx.user.id) });
  }),

  myJobs: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const comp = await db.query.companies.findFirst({ where: eq(s.companies.ownerId, ctx.user.id) });
    if (!comp) return { company: null, jobs: [] };
    const rows = await db.select().from(s.jobs).where(eq(s.jobs.companyId, comp.id)).orderBy(desc(s.jobs.createdAt));
    const counts = await db.select().from(s.applications);
    return {
      company: comp,
      jobs: rows.map(j => ({
        ...j,
        promoted: j.promotedUntil ? j.promotedUntil > new Date() : false,
        applicants: counts.filter(a => a.jobId === j.id).length,
      })),
    };
  }),

  createJob: authedQuery
    .input(z.object({
      titleAr: z.string().min(2), titleEn: z.string().min(2),
      hoodId: z.number(), salaryMin: z.number().min(0), salaryMax: z.number().min(0),
      type: z.enum(["full", "part", "shift"]), skills: z.array(z.string()),
      hoursAr: z.string().optional(), hoursEn: z.string().optional(),
      descAr: z.string().optional(), descEn: z.string().optional(),
      reqAr: z.array(z.string()).optional(), reqEn: z.array(z.string()).optional(),
      brandColor: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const comp = await db.query.companies.findFirst({ where: eq(s.companies.ownerId, ctx.user.id) });
      if (!comp) throw new TRPCError({ code: "BAD_REQUEST", message: "أكمل بيانات المنشأة أولاً" });
      // لا نشر ببيانات ناقصة — تحقق الاكتمال (بند معتمد)
      const missing: string[] = [];
      if (!input.descAr) missing.push("descAr");
      if (!input.salaryMin || !input.salaryMax) missing.push("salary");
      if (!input.skills.length) missing.push("skills");
      if (!input.hoursAr) missing.push("hours");
      if (missing.length) throw new TRPCError({ code: "BAD_REQUEST", message: "بيانات ناقصة: " + missing.join(",") });
      const [{ id }] = await db.insert(s.jobs).values({ ...input, companyId: comp.id }).$returningId();
      return { ok: true, id };
    }),

  candidates: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const comp = await db.query.companies.findFirst({ where: eq(s.companies.ownerId, ctx.user.id) });
    if (!comp) return [];
    const myJobs = await db.select().from(s.jobs).where(eq(s.jobs.companyId, comp.id));
    const jobIds = myJobs.map(j => j.id);
    if (!jobIds.length) return [];
    const apps = await db.query.applications.findMany();
    const mine = apps.filter(a => jobIds.includes(a.jobId));
    const allUsers = await db.query.users.findMany();
    const hoods = await db.query.neighborhoods.findMany();
    const hmap = new Map(hoods.map(h => [h.id, h]));
    const jmap = new Map(myJobs.map(j => [j.id, j]));
    return mine.map(a => {
      const u = allUsers.find(x => x.id === a.seekerId);
      const j = jmap.get(a.jobId);
      const uh = u?.hoodId ? hmap.get(u.hoodId) : null;
      const jh = j ? hmap.get(j.hoodId) : null;
      const km = uh && jh ? haversineKm(uh, jh) : null;
      return { app: a, user: u ? { id: u.id, name: u.name, skills: u.skills, expYears: u.expYears, hood: uh } : null, job: j, commuteKm: km ? +km.toFixed(1) : null };
    });
  }),

  setApplicationStatus: authedQuery
    .input(z.object({
      id: z.number(),
      status: z.enum(["seen", "shortlist", "interview", "rejected", "hired"]),
      rejectionReason: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      if (input.status === "rejected" && !input.rejectionReason)
        throw new TRPCError({ code: "BAD_REQUEST", message: "سبب عدم القبول إلزامي" });
      await getDb().update(s.applications)
        .set({ status: input.status, rejectionReason: input.status === "rejected" ? input.rejectionReason : null })
        .where(eq(s.applications.id, input.id));
      return { ok: true };
    }),

  // ══ الأدمن ════════════════════════════════════════════════════════════════
  admin: createRouter({
    stats: adminQuery.query(async () => {
      const db = getDb();
      const [u, j, a, c] = await Promise.all([
        db.query.users.findMany(), db.query.jobs.findMany(),
        db.query.applications.findMany(), db.query.companies.findMany(),
      ]);
      return {
        users: u.length, seekers: u.filter(x => x.accountType === "seeker").length,
        employers: c.length, jobs: j.filter(x => x.status === "active").length,
        applications: a.length, hired: a.filter(x => x.status === "hired").length,
      };
    }),

    users: adminQuery.query(() => getDb().query.users.findMany({ orderBy: (t, { desc }) => [desc(t.createdAt)] })),

    setSetting: adminQuery
      .input(z.object({ key: z.string(), value: z.any() }))
      .mutation(async ({ input }) => {
        const db = getDb();
        await db.insert(s.settings).values({ key: input.key, value: input.value })
          .onDuplicateKeyUpdate({ set: { value: input.value } });
        return { ok: true };
      }),

    addHood: adminQuery
      .input(z.object({ nameAr: z.string().min(2), nameEn: z.string().min(2), zone: z.enum(["west", "south"]), lat: z.number(), lng: z.number() }))
      .mutation(async ({ input }) => { await getDb().insert(s.neighborhoods).values(input); return { ok: true }; }),

    updateHood: adminQuery
      .input(z.object({ id: z.number(), nameAr: z.string().optional(), nameEn: z.string().optional(), zone: z.enum(["west", "south"]).optional(), lat: z.number().optional(), lng: z.number().optional(), active: z.boolean().optional() }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await getDb().update(s.neighborhoods).set(data).where(eq(s.neighborhoods.id, id));
        return { ok: true };
      }),

    deleteHood: adminQuery
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => { await getDb().delete(s.neighborhoods).where(eq(s.neighborhoods.id, input.id)); return { ok: true }; }),

    addNews: adminQuery
      .input(z.object({ textAr: z.string().min(2), textEn: z.string().min(2) }))
      .mutation(async ({ input }) => { await getDb().insert(s.news).values(input); return { ok: true }; }),

    deleteNews: adminQuery
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => { await getDb().delete(s.news).where(eq(s.news.id, input.id)); return { ok: true }; }),

    savePolicy: adminQuery
      .input(z.object({ slug: z.string(), bodyAr: z.string(), bodyEn: z.string() }))
      .mutation(async ({ input }) => {
        await getDb().insert(s.policies).values(input)
          .onDuplicateKeyUpdate({ set: { bodyAr: input.bodyAr, bodyEn: input.bodyEn } });
        return { ok: true };
      }),

    addReason: adminQuery
      .input(z.object({ textAr: z.string().min(2), textEn: z.string().min(2) }))
      .mutation(async ({ input }) => { await getDb().insert(s.rejectionReasons).values(input); return { ok: true }; }),

    closeJob: adminQuery
      .input(z.object({ id: z.number(), status: z.enum(["active", "closed"]) }))
      .mutation(async ({ input }) => { await getDb().update(s.jobs).set({ status: input.status }).where(eq(s.jobs.id, input.id)); return { ok: true }; }),
  }),
});
