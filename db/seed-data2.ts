// ── بيانات البذور (تكملة): بقية الوظائف + الإعدادات + الأخبار + الأسباب + السياسات ──
export const JOBS2: any[] = [
  [3, "عرقة", "مسوّق رقمي", "Digital Marketer", 8000, 11000, "full", ["إعلانات مدفوعة", "SEO", "تحليلات", "سناب شات"], "الأحد–الخميس، 9ص–5م (هجين)", "Sun–Thu, 9am–5pm (hybrid)",
    "إدارة الحملات الرقمية وقنوات التواصل الاجتماعي وقياس العائد على الإنفاق الإعلاني.",
    "Run digital campaigns and social channels, measuring ROAS across platforms.",
    ["خبرة سنتين بالتسويق الرقمي", "إدارة ميزانيات إعلانية", "تحليل بيانات بـ GA4"], ["2 years digital marketing", "Paid budget management", "GA4 analytics"]],
  [1, "العوالي", "أخصائي موارد بشرية", "HR Specialist", 7500, 10000, "full", ["استقطاب", "مسيرات رواتب", "نظام العمل", "Mudad"], "الأحد–الخميس، 8:30ص–4:30م", "Sun–Thu, 8:30am–4:30pm",
    "إدارة دورة الاستقطاب والمسيرات والامتثال لنظام العمل السعودي في فرع العوالي.",
    "Own recruitment cycle, payroll and Saudi labor-law compliance at the Al-Awali branch.",
    ["بكالوريوس موارد بشرية", "خبرة 3 سنوات", "معرفة بمنصات قوى ومدد"], ["BSc HR", "3 years experience", "Qiwa & Mudad knowledge"]],
  [5, "نمار", "سائق توصيل", "Delivery Driver", 4000, 6000, "shift", ["قيادة", "التزام", "خرائط"], "ورديات مرنة", "Flexible shifts",
    "توصيل الشحنات داخل نطاق غرب وجنوب الرياض بمركبة الشركة مع تطبيق تتبع ذكي.",
    "Deliver shipments across West & South Riyadh using company vehicle with smart tracking.",
    ["رخصة قيادة سارية", "سجل مروري نظيف"], ["Valid license", "Clean driving record"]],
  [2, "المهدية", "مصمم جرافيك", "Graphic Designer", 7000, 9500, "full", ["Photoshop", "Illustrator", "هوية بصرية", "موشن"], "الأحد–الخميس، 8ص–3م", "Sun–Thu, 8am–3pm",
    "تصميم الهوية البصرية والمواد التعليمية والإعلانية للمدارس عبر جميع المنصات.",
    "Design brand identity, educational and marketing materials across platforms.",
    ["معرض أعمال قوي", "إتقان أدوات Adobe", "حسّ عربي في التايبوغرافي"], ["Strong portfolio", "Adobe suite mastery", "Arabic typography sensibility"]],
  [1, "الشفا", "أخصائي أسنان مساعد", "Dental Assistant", 6000, 8000, "shift", ["تعقيم", "مساندة أطباء", "سجلات"], "ورديات", "Shifts",
    "مساندة أطباء الأسنان وتجهيز غرف العمليات في فرع الشفا الجديد.",
    "Assist dentists and prepare treatment rooms at the new Al-Shifa branch.",
    ["دبلوم مساعد طبيب أسنان", "التزام بمعايير التعقيم"], ["Dental assistant diploma", "Sterilization standards"]],
  [6, "الحزم", "مشرف خدمة ضيوف", "Guest Service Supervisor", 7000, 9000, "shift", ["قيادة فريق", "حجوزات", "شكاوى"], "ورديات", "Shifts",
    "قيادة فريق الاستقبال في ورديات الفندق وضمان جودة تجربة الضيف.",
    "Lead front-desk shifts and ensure guest experience quality.",
    ["خبرة 3 سنوات ضيافة", "إنجليزية ممتازة"], ["3 years in hospitality", "Excellent English"]],
  [0, "بدر", "مندوب مبيعات", "Sales Representative", 5000, 8000, "full", ["مبيعات", "تفاوض", "CRM"], "الأحد–الخميس", "Sun–Thu",
    "تطوير مبيعات التجزئة في أحياء جنوب الرياض مع عمولات مجزية.",
    "Grow retail sales across South Riyadh neighborhoods with attractive commissions.",
    ["خبرة مبيعات سنة فأكثر", "رخصة قيادة"], ["1+ year sales experience", "Driving license"]],
  [5, "ديراب", "فني صيانة معدات", "Equipment Technician", 6500, 8500, "full", ["صيانة", "كهرباء", "سلامة"], "السبت–الخميس، 7ص–4م", "Sat–Thu, 7am–4pm",
    "صيانة معدات المستودعات والرافعات في موقع ديراب اللوجستي.",
    "Maintain warehouse equipment and forklifts at the Dirab logistics site.",
    ["دبلوم فني", "خبرة سنتين صيانة"], ["Technical diploma", "2 years maintenance"]],
];

export const DEFAULT_SETTINGS: Record<string, any> = {
  kpi: { jobs: 16, seekers: 3420, hires: 212, saved: 9640, apps: 1480, employers: 7 },
  seedManual: true,
  heroTitle: "", heroSub: "",
  ads: { topEnabled: true, topAr: "مساحة إعلانية — أعلن معنا وصِل آلاف الباحثين في غرب وجنوب الرياض", topEn: "Ad space — reach thousands of West & South Riyadh seekers", topLink: "", topPrice: 1500, bottomEnabled: true, bottomPrice: 900 },
  pricing: { cvLogo: 29, promote3: 120, promote7: 220, aiAdCost: 75 },
  pointsPackages: [
    { points: 500, price: 250, bonus: 0 },
    { points: 1200, price: 500, bonus: 100, popular: true },
    { points: 3000, price: 1100, bonus: 400 },
    { points: 8000, price: 2600, bonus: 1500 },
  ],
  payments: { gateways: { mada: true, applepay: true, visa: true, stcpay: false }, urls: { mada: "", applepay: "", visa: "", stcpay: "" }, testMode: true },
  ai: { provider: "", key: "", model: "" },
  social: { google: "", twitter: "", linkedin: "", facebook: "" },
  geo: { avgSpeed: 35.7 },
};

export const NEWS = [
  { textAr: "انطلاق المنصة تجريبياً في أحياء غرب وجنوب الرياض", textEn: "Platform soft-launches across West & South Riyadh neighborhoods" },
  { textAr: "التسجيل مجاني للباحثين — الخدمات الأساسية بلا رسوم", textEn: "Free for seekers — core services at no cost" },
];

export const REASONS = [
  { textAr: "عدم تطابق المهارات المطلوبة", textEn: "Required skills mismatch" },
  { textAr: "خبرة أقل من المطلوب", textEn: "Experience below requirement" },
  { textAr: "اكتمال العدد المطلوب", textEn: "Position filled" },
  { textAr: "عدم ملاءمة نطاق الراتب", textEn: "Salary expectations mismatch" },
  { textAr: "متطلبات الموقع أو الدوام غير متوافقة", textEn: "Location/shift requirements incompatible" },
  { textAr: "أخرى (توضح في رسالة)", textEn: "Other (explained in message)" },
];

export const POLICIES = [
  { slug: "terms", bodyAr: "شروط الاستخدام — تُحرَّر من لوحة الإدارة.", bodyEn: "Terms of Use — editable from the admin panel." },
  { slug: "privacy", bodyAr: "سياسة الخصوصية — تُحرَّر من لوحة الإدارة.", bodyEn: "Privacy Policy — editable from the admin panel." },
  { slug: "payment", bodyAr: "سياسة الدفع والاسترداد — النقاط غير مستردة وتُشحن للحساب فقط.", bodyEn: "Payment & Refund Policy — points are non-refundable, account-bound." },
  { slug: "points", bodyAr: "سياسة النقاط — رصيد خدمات رقمي داخل المنصة فقط.", bodyEn: "Points Policy — in-platform digital service credit only." },
  { slug: "ai", bodyAr: "ضوابط الذكاء الاصطناعي — الذكاء يقترح والإنسان يقرر.", bodyEn: "AI Controls — AI proposes, humans decide." },
];
