// نصوص افتراضية للسياسات (تُستبدل بما يحرره الأدمن في قاعدة البيانات)
export const DEFAULTS: Record<string, { ar: string[]; en: string[] }> = {
  terms: {
    ar: [
      'المنصة: تُعد منصة westriyadh.net طبقة التشغيل الرقمية لملتقى توظيف غرب الرياض، وتعمل كوسيط يربط الباحثين عن عمل بأصحاب العمل داخل النطاق الجغرافي لغرب وجنوب الرياض، ولا تُعد طرفاً في علاقة التوظيف الناشئة بينهما.',
      'الأهلية والحساب: يلتزم المستخدم بتقديم بيانات صحيحة ومحدثة، والحفاظ على سرية بيانات دخوله، ويُمنع انتحال الهوية أو إنشاء حسابات وهمية.',
      'الموقع الجغرافي: التسجيل يتطلب تفعيل تحديد المكان أو اختيار حيّ السكن — تُستخدم الإحداثيات لحساب المسافة وزمن التنقل فقط ويمكن تعديلها لاحقاً من الملف الشخصي.',
      'صحة المحتوى: يلتزم صاحب العمل بصحة بيانات الإعلان الوظيفي، ولا يُسمح بنشر إعلان ببيانات ناقصة.',
      'الرفض المسبب: عند عدم قبول متقدم يلتزم صاحب العمل باختيار سبب واضح، ويحق للمتقدم الاعتراض وطلب مراجعة بشرية.',
      'الموافقة: استخدامك للمنصة أو إنشاؤك حساباً — ولو دون فتح هذه الروابط — يُعد موافقة نهائية على جميع السياسات.',
    ],
    en: [
      'Platform: westriyadh.net is the digital operating layer of the West Riyadh Careers Forum, an intermediary connecting seekers and employers within West & South Riyadh.',
      'Account: users must provide accurate data and keep credentials secure; impersonation is prohibited.',
      'Location: signup requires enabling location or picking a home neighborhood — coordinates are used only for commute computation and can be edited later.',
      'Content: employers must publish complete, truthful job ads; incomplete ads cannot be published.',
      'Reasoned rejection: rejection requires a clear reason; applicants may object and request human review.',
      'Acceptance: using the platform or creating an account — even without opening these links — is final acceptance of all policies.',
    ],
  },
  privacy: {
    ar: [
      'الإطار النظامي: نلتزم بنظام حماية البيانات الشخصية السعودي (PDPL) ولائحته التنفيذية وضوابط سدايا.',
      'أقل قدر من البيانات: بيانات الحساب، حيّ السكن وإحداثيات GPS (للمطابقة فقط)، المؤهلات والمهارات، وسجل الطلبات.',
      'الموافقات المنفصلة: موافقة مستقلة لكل غرض: المطابقة، مشاركة السيرة، التدريب، والتحليلات.',
      'حقوقك: الوصول إلى بياناتك وتصحيحها وطلب إتلافها عبر قناة الدعم.',
      'المشاركة: لا تُباع البيانات لأي طرف ثالث.',
    ],
    en: [
      'Framework: we comply with Saudi PDPL, its Executive Regulations, and SDAIA controls.',
      'Minimisation: account data, home neighborhood and GPS coordinates (matching only), qualifications, application history.',
      'Separate consents per purpose: matching, CV sharing, training, analytics.',
      'Rights: access, correction, and destruction via support.',
      'Sharing: data is never sold to third parties.',
    ],
  },
  payment: {
    ar: [
      'الدفع الإلكتروني: عبر بوابات مرخصة (مدى، Apple Pay، Visa/Mastercard، STC Pay) تُربط من لوحة الإدارة.',
      'النقاط غير مستردة: تُضاف لحسابك فقط، لا تُسترد نقداً، ولا تُحوّل بين الحسابات، ولا تُستبدل بأموال تحت أي ظرف.',
      'الاستخدام: تُستهلك النقاط داخل المنصة فقط (إعلانات الذكاء الاصطناعي، ترويج الوظائف، الخدمات الإضافية).',
      'الخدمات المدفوعة للأفراد: مثل إزالة شعار المنصة عن السيرة — تُدفع مرة واحدة بالسعر المعلن ولا تُسترد بعد التنفيذ.',
      'النزاعات: تواصل معنا خلال 14 يوماً مع رقم العملية.',
    ],
    en: [
      'E-payment via licensed gateways (mada, Apple Pay, Visa/Mastercard, STC Pay) linked from the admin panel.',
      'Points are non-refundable: account-bound, never cash-redeemed or transferred.',
      'Points are consumed inside the platform only (AI ads, promotion, add-ons).',
      'Paid individual services (e.g. CV logo removal) are one-time, non-refundable once delivered.',
      'Disputes: contact us within 14 days with the transaction number.',
    ],
  },
  points: {
    ar: [
      'الطبيعة: النقاط رصيد خدمات رقمي داخل المنصة — ليست عملة ولا أداة دفع خارجها.',
      'الشحن: عبر باقات معلنة الأسعار في المحفظة، وقد تشمل نقاطاً إضافية كهدية.',
      'الصلاحية: 24 شهراً من تاريخ الشحن ما لم يُنص خلاف ذلك.',
      'الخصم: تلقائي عند استخدام الخدمة مع عرض التكلفة قبل التأكيد.',
      'القيود: لا تُباع ولا تُتاجر ولا تُحوّل، وإساءة الاستخدام تخوّلنا تعليق الحساب.',
    ],
    en: [
      'Points are in-platform digital service credit — not a currency.',
      'Top-up via priced wallet packages; some include bonus points.',
      'Valid 24 months from top-up unless stated otherwise.',
      'Auto-deducted on service use, with the cost shown before confirmation.',
      'Cannot be sold, traded, or transferred; misuse may suspend the account.',
    ],
  },
  ai: {
    ar: [
      'الذكاء يقترح والإنسان يقرر: لا رفض آلي كامل؛ التقييم الآلي أولي يليه تقييم بشري، والقرار النهائي بشري ومُسجّل.',
      'القابلية للتفسير: يعرض النظام لماذا طُابق المرشح وما الذي خفّض الدرجة وما المعايير غير المتطابقة.',
      'الصدق: لا يضيف الذكاء الاصطناعي خبرة أو إنجازاً غير صحيح للسيرة.',
      'الاعتراض: يحق لأي مستخدم طلب مراجعة بشرية في أي وقت.',
      'الالتزام: مبادئ سدايا للذكاء الاصطناعي — العدالة، الخصوصية، الأمن، الشفافية، المساءلة.',
    ],
    en: [
      'AI proposes, humans decide: automated scoring is preliminary; the final decision is human and logged.',
      'Explainability: the system shows why a candidate matched and what lowered the score.',
      'Honesty: AI never adds untrue experience or achievements to a CV.',
      'Objection: any user may request human review at any time.',
      'Compliance: SDAIA AI principles — fairness, privacy, security, transparency, accountability.',
    ],
  },
};
