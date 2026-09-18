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
      // صاحب عمل: إنشاء ملف الشركة
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
