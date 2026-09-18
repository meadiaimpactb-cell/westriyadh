import { UserRound, Building2, ShieldCheck, MapPin, Search, Send, BellRing, BrainCircuit, Wallet, Megaphone, BookOpen, CheckCircle2 } from 'lucide-react';

export type RoleKey = 'seeker' | 'employer' | 'admin';

export const GUIDE_SEEKER = {
  icon: UserRound, color: '#2BB3A3',
  titleAr: 'دليل الباحث عن عمل', titleEn: 'Job Seeker Guide',
  introAr: 'رحلتك من إنشاء الحساب حتى القبول — كل خدماتك الأساسية مجانية.',
  introEn: 'From signup to acceptance — your core services are free.',
  steps: [
    { icon: UserRound, ar: 'أنشئ حسابك: ادخل عبر حساب Kimi (أو مزوّد اجتماعي عند تفعيله من الإدارة)، ووافق على السياسات — الموافقة تسري حتى دون فتح الروابط، وننصحك بقراءتها.', en: 'Create your account: sign in with Kimi (or a social provider once enabled by admin), accept the policies — acceptance holds even without opening the links.' },
    { icon: MapPin, ar: 'فعّل تحديد المكان: المنصة مبنية على اللوكيشن — اضغط «تحديد موقعي تلقائياً» فنلتقط إحداثيات GPS ونعيّن أقرب حي لك، أو اختر حيّك يدوياً وعدّله لاحقاً من ملفك.', en: 'Enable location: press "Detect my location" — we capture your GPS coordinates and set your nearest neighborhood, or pick it manually and edit later.' },
    { icon: BookOpen, ar: 'أكمل ملفك: الحي، الوظيفة الحالية، سنوات الخبرة، المؤهل، والمجالات التي تهمك — تُستخدم للمطابقة وحساب زمن الرحلة فقط.', en: 'Complete your profile: neighborhood, current job, experience, education, interests — used only for matching and commute time.' },
    { icon: Search, ar: 'اكتشف الوظائف: كل إعلان يعرض المسافة بالكيلومترات وزمن الرحلة التقريبي من حيّك — رتّب النتائج بالأقرب أو الأعلى ملاءمة أو راتباً.', en: 'Discover jobs: every ad shows distance (km) and estimated commute from your neighborhood — sort by nearest, best match, or salary.' },
    { icon: BrainCircuit, ar: 'ابنِ سيرتك الذكية: أدخل بياناتك والصق روابطك (LinkedIn، X، بورتفوليو) وارفع ملفاتك — الذكاء الاصطناعي يصيغ سيرة مثالية عربية أو إنجليزية متوافقة مع ATS، وخصّصها لأي وظيفة، ثم حمّلها PDF أو JPG بشعار المنصة مجاناً (أو بدونه كخدمة مدفوعة).', en: 'Build your AI CV: enter data, paste links (LinkedIn, X, portfolio), upload files — AI crafts an Arabic or English ATS-friendly CV, tailors it to any job; download PDF/JPG with our logo free (logo-free is paid).' },
    { icon: Send, ar: 'قدّم بضغطة: راجع تحليل الملاءمة (مهارات متطابقة/ناقصة) وأسئلة المقابلة المتوقعة ثم قدّم — نقص المهارات لا يمنعك أبداً.', en: 'Apply in one tap: review the match analysis (matched/missing skills) and likely interview questions, then apply — skill gaps never block you.' },
    { icon: BellRing, ar: 'تابع بشفافية: حالة طلبك خطوة بخطوة (أُرسل ← شوهد ← ترشيح ← مقابلة ← قرار)، وإن لم تُقبل يصلك السبب إلزامياً، ويمكنك الاعتراض لطلب مراجعة بشرية — القرار لا يُترك للذكاء الاصطناعي منفرداً.', en: 'Track transparently: step-by-step status (sent → viewed → shortlisted → interview → decision); on rejection the reason is mandatory, and you may object for human review.' },
  ],
};

export const GUIDE_EMPLOYER = {
  icon: Building2, color: '#F5A623',
  titleAr: 'دليل صاحب العمل', titleEn: 'Employer Guide',
  introAr: 'انشر وظائفك لمرشحين يصلون فعلاً في الوقت المناسب — الدفع بالنقاط.',
  introEn: 'Post jobs to candidates who can actually arrive on time — pay with points.',
  steps: [
    { icon: Building2, ar: 'سجّل كصاحب عمل: أكمل اسم المنشأة والسجل التجاري وحدّد حيّ الفرع — يظهر للباحثين زمن الوصول إليك تلقائياً.', en: 'Register as employer: add company name, CR, and branch neighborhood — seekers see commute time to you automatically.' },
    { icon: Wallet, ar: 'اشحن نقاطك: من «المحفظة» اختر باقة وادفع إلكترونياً (مدى/Apple Pay/Visa حسب تفعيل الإدارة) — النقاط تُشحن لحسابك فقط وهي غير مستردة ولا تُحوَّل.', en: 'Top up points: in Wallet pick a package and pay electronically — points are account-bound, non-refundable, non-transferable.' },
    { icon: BrainCircuit, ar: 'صمّم إعلانك بالذكاء الاصطناعي: أدخل المسمى والفرع والاحتياج ولون هويتك — يُولَّد إعلان كامل بهويتك ويُخصم من رصيد نقاطك، ثم اعتمده للنشر مباشرة في قاعدة البيانات.', en: 'Design your ad with AI: enter title, branch, needs, brand color — a branded ad is generated and its cost deducted from your points; approve to publish straight to the database.' },
    { icon: CheckCircle2, ar: 'لا إعلان ناقص: المنصة تمنع النشر إذا نقصت بيانات أساسية (الوصف، الراتب، المهارات، الدوام) وتنبّهك بالنواقص.', en: 'No incomplete ads: publishing is blocked if essentials are missing (description, salary, skills, hours) — the platform flags the gaps.' },
    { icon: UserRound, ar: 'رشّح وقابل: المرشحون مرتبون بنسبة الملاءمة وزمن الوصول من حيّ سكنهم — انقلهم بين الحالات (ترشيح/مقابلة/قبول) بضغطة.', en: 'Shortlist & interview: candidates ranked by match score and arrival time from their neighborhood — move them across stages in one tap.' },
    { icon: ShieldCheck, ar: 'الرفض مسبَّب إلزاماً: عند عدم قبول مرشح اختر سبباً من القائمة الجاهزة — يصل للمرشح فوراً، وتصلك اعتراضاته إن وجدت.', en: 'Mandatory reasoned rejection: pick a ready reason on rejection — delivered to the candidate instantly; objections reach you.' },
    { icon: Megaphone, ar: 'روّج وظيفتك: ظهور مموّل أعلى القائمة 3 أيام أو أسبوع — يُخصم من نقاطك بالسعر الذي تحدده الإدارة.', en: 'Promote your job: sponsored top placement for 3 days or a week — points deducted at admin-set prices.' },
  ],
};
