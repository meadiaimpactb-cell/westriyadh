import { MapPin, Megaphone, Wallet, BrainCircuit, KeySquare, Settings, BarChart3, ScrollText, Users2, Briefcase, Tags, FileText } from 'lucide-react';

export const GUIDE_ADMIN = {
  icon: Settings, color: '#8B5CF6',
  titleAr: 'دليل مدير المنصة', titleEn: 'Admin Guide',
  introAr: 'تحكم كامل من لوحة واحدة — بيانات، حسابات، محتوى، أسعار، مدفوعات، وتكاملات.',
  introEn: 'Full control from one panel — data, accounts, content, pricing, payments, integrations.',
  steps: [
    { icon: BarChart3, ar: 'المؤشرات: أرقام حية من قاعدة البيانات (باحثون، شركات، وظائف، طلبات، توظيفات). وفي البداية — قبل تراكم البيانات — فعّل «الوضع اليدوي» وأدخل مؤشرات تسويقية واقعية، وأوقفه متى ما اشتغلت المنصة.', en: 'KPIs: live database numbers (seekers, employers, jobs, applications, hires). Pre-launch, enable manual mode and enter realistic marketing figures; switch off once real data accumulates.' },
    { icon: MapPin, ar: 'التغطية الجغرافية: أضف/عدّل/عطّل أحياء غرب وجنوب الرياض بأسمائها وإحداثياتها — أو التقط إحداثيات موقعك الحالي بضغطة. هنا أيضاً تثبّت متوسط سرعة التنقل المعتمد في حساب الزمن.', en: 'Geo coverage: add/edit/disable West & South Riyadh neighborhoods with names and coordinates — or capture your current GPS in one tap. Set the adopted average commute speed here too.' },
    { icon: Users2, ar: 'الحسابات: قائمة المستخدمين وأدوارهم وأحيائهم وأرصدة نقاطهم وإحداثياتهم.', en: 'Accounts: users with roles, neighborhoods, point balances, and coordinates.' },
    { icon: Briefcase, ar: 'الوظائف: راقب الإعلانات، عطّل أو فعّل أي وظيفة، وتأكد من اكتمال البيانات قبل النشر.', en: 'Jobs: monitor ads, disable/activate any job, and enforce data completeness.' },
    { icon: FileText, ar: 'المحتوى والأخبار: حرّر عنوان الصفحة الرئيسية ونصها التعريفي، وأضف أو احذف الأخبار الظاهرة للجميع.', en: 'Content & news: edit the homepage headline and intro; add/remove public news.' },
    { icon: Megaphone, ar: 'الإعلانات: فعّل الشريط العلوي ومساحة «أعلن معنا» السفلية وحدّد أسعارهما وروابطهما.', en: 'Ads: toggle the top banner and the bottom "advertise with us" slot; set prices and links.' },
    { icon: Tags, ar: 'الأسعار والنقاط: سعّر إزالة شعار السيرة، والترويج (3 أيام/أسبوع)، وتكلفة الإعلان الذكي، وباقات شحن النقاط مع الهدايا.', en: 'Pricing & points: price CV logo removal, promotions, AI-ad cost, and top-up packages with bonuses.' },
    { icon: Wallet, ar: 'الدفع الإلكتروني: فعّل البوابات (مدى، Apple Pay، Visa/Mastercard، STC Pay) والصق روابطها ومفاتيحها، وبدّل وضع الاختبار.', en: 'E-payment: enable gateways, paste their URLs/keys, toggle test mode.' },
    { icon: BrainCircuit, ar: 'الذكاء الاصطناعي: اربط المزود ومفتاح API والنموذج — بدونه تعمل المنصة بوضع تجريبي. القاعدة: النماذج الغالية للمهام عالية الدقة فقط.', en: 'AI: connect provider, API key, and model — without them the platform runs demo mode. Rule: expensive models only for high-precision tasks.' },
    { icon: KeySquare, ar: 'الدخول الاجتماعي: الصق Client ID/Secret لكل مزود (Google، X، LinkedIn، Facebook) ليُفعَّل زره في صفحة الدخول فوراً.', en: 'Social login: paste each provider\'s credentials (Google, X, LinkedIn, Facebook) to activate its button instantly.' },
    { icon: ScrollText, ar: 'السياسات: حرّر نصوص شروط الاستخدام والخصوصية والدفع والنقاط وضوابط الذكاء الاصطناعي — تُعرض للمستخدمين مباشرة.', en: 'Policies: edit terms, privacy, payment, points, and AI controls — shown to users immediately.' },
  ],
};
