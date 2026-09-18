import "dotenv/config";
import { getDb } from "../api/queries/connection";
import { neighborhoods, companies, jobs, settings, news, rejectionReasons, policies } from "./schema";
import { HOODS, COMPANIES, JOBS } from "./seed-data";
import { JOBS2, DEFAULT_SETTINGS, NEWS, REASONS, POLICIES } from "./seed-data2";

const ALL_JOBS = [...JOBS, ...JOBS2];

async function seed() {
  const db = getDb();

  const existingHoods = await db.query.neighborhoods.findMany();
  if (existingHoods.length === 0) {
    await db.insert(neighborhoods).values(HOODS as any);
    console.log(`✓ neighborhoods: ${HOODS.length}`);
  }
  const hoodRows = await db.query.neighborhoods.findMany();
  const hoodByAr = new Map(hoodRows.map(h => [h.nameAr, h.id]));

  const existingCompanies = await db.query.companies.findMany();
  if (existingCompanies.length === 0) {
    await db.insert(companies).values(COMPANIES as any);
    console.log(`✓ companies: ${COMPANIES.length}`);
  }
  const compRows = await db.query.companies.findMany();

  const existingJobs = await db.query.jobs.findMany();
  if (existingJobs.length === 0) {
    const rows = ALL_JOBS.map(([ci, hoodAr, titleAr, titleEn, min, max, type, skills, hoursAr, hoursEn, descAr, descEn, reqAr, reqEn, promoted]) => ({
      companyId: compRows[ci].id,
      hoodId: hoodByAr.get(hoodAr)!,
      titleAr, titleEn, salaryMin: min, salaryMax: max, type, skills, hoursAr, hoursEn, descAr, descEn, reqAr, reqEn,
      promotedUntil: promoted ? new Date(Date.now() + 7 * 864e5) : null,
    }));
    await db.insert(jobs).values(rows as any);
    console.log(`✓ jobs: ${rows.length}`);
  }

  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
    const found = await db.query.settings.findFirst({ where: (s, { eq }) => eq(s.key, key) });
    if (!found) await db.insert(settings).values({ key, value });
  }
  console.log("✓ settings");

  const existingNews = await db.query.news.findMany();
  if (existingNews.length === 0) { await db.insert(news).values(NEWS as any); console.log("✓ news"); }

  const existingReasons = await db.query.rejectionReasons.findMany();
  if (existingReasons.length === 0) { await db.insert(rejectionReasons).values(REASONS as any); console.log("✓ rejection reasons"); }

  for (const p of POLICIES) {
    const found = await db.query.policies.findFirst({ where: (s, { eq }) => eq(s.slug, p.slug) });
    if (!found) await db.insert(policies).values(p);
  }
  console.log("✓ policies");
  console.log("Seed complete.");
  process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });
