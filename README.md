# HULK Fitness Coaching SaaS (100% Free Cloud Edition)

## المعمارية السحابية المجانية بالكامل (بدون بطاقة بنكية)
- **Authentication & Database**: Firebase Spark Plan (مجاني تماماً).
- **Image & Attachment Storage**: Cloudinary Free Tier (25GB مجاناً بدون بطاقة بنكية).
- **Account Provisioning**: Secondary Firebase Auth Instance (إنشاء حسابات المدربين والمتدربين من التطبيق دون الحاجة لـ Cloud Functions المدفوعة).

## خطوات التشغيل السريعة
1. أنشئ حساباً مجانياً في [Cloudinary](https://cloudinary.com) واحصل على `Cloud Name` وأنشئ `Unsigned Upload Preset`.
2. انسخ `.env.example` إلى `.env` وضع مفاتيح Firebase و Cloudinary.
3. ثبّت الحزم: `npm install`
4. ارفع قواعد الأمان المجانية إلى Firestore: `firebase deploy --only firestore`
5. أنشئ حساب المدير الأول (Super Admin):
   - حمّل `serviceAccountKey.json` من Firebase Console -> Project Settings -> Service Accounts
   - نفّذ: `npm install firebase-admin && node scripts/seedAdmin.js`
6. شغّل المنصة: `npm run dev`
