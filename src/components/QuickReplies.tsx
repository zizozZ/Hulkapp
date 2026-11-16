import React, { useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { Send, Search, Zap } from 'lucide-react';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { TraineeProfile } from '../types';

const REPLY_CATEGORIES: Record<string, { label: string; templates: string[] }> = {
  motivation: {
    label: '🔥 تحفيز وتشجيع (18)',
    templates: [
      'عاش يا {الاسم}! 💪 التزامك الفترة دي هو اللي هيصنع الفرق الحقيقي، كمل بنفس الوحشية!',
      'مفيش مستحيل يا بطل، كل عدة زيادة بتقربك لهدفك. فخور بمجهودك يا {الاسم}! 🚀',
      'التعب بيروح والنتيجة بتفضل.. استمر يا {الاسم}، فورمتك بتتطور كل أسبوع! 🏆',
      'الفرق بين العادي والبطل هو الالتزام في الأيام الصعبة، وأنت قدها يا {الاسم} 🔥',
      'كوتش زياد فخور بيك النهاردة يا {الاسم}، المستوى اللي وصلتله يثبت إنك وحش بجد 🦍',
      'متبصش على المسافة اللي فاضلة، بص على الإنجاز اللي عملته لحد دلوقتي يا {الاسم} 📈',
      'كل تمرينة بتخلصها النهاردة هي استثمار في شكلك وصحتك بكرة، دوس يا {الاسم} 💥',
      'الاستمرارية هي سر اللعبة يا {الاسم}، مش السرعة. كمل ومفيش حاجة هتوقفك ⚡',
      'أداء عالمي يا {الاسم}! الطاقة والتركيز بتوعك في الجيم يدرسوا بجد 👏',
      'افتكر دايماً ليه بدأت يا {الاسم}، الهدف قرب جداً ومش وقت تراجع دلوقتي 🎯',
      'شابوه على الانضباط يا {الاسم}، النتايج الجاية هتبهرك وهتبهر كل اللي حواليك 🌟',
      'الجسم القوي بيتبني بالعقلية القوية قبل الحديد، وعقليتك توب يا {الاسم} 🧠💪',
      'يوم ورا يوم بتثبت إنك مش جاي تهزر، استمر على نفس الرتم يا وحش HULK 🟢',
      'الالتزام بالخطة 100% هو اللي بيخليك سابق بخطوة، عاش يا {الاسم} 🥇',
      'مفيش أعذار مع الأبطال، وأنت النهاردة أثبت إنك بطل حقيقي يا {الاسم} 🔥',
      'كل قطرة عرق في الجيم النهاردة بتقربك لأقوى نسخة منك يا {الاسم} 💦🏋️‍♂️',
      'ثباتك على المبدأ رغم ضغط الشغل والحياة يخليني أرفعلك القبعة يا {الاسم} 🫡',
      'شد حيلك يا {الاسم}، المرحلة الجاية هي مرحلة حصد النتايج الكبيرة 🚀'
    ]
  },
  diet: {
    label: '🥗 الدايت والتغذية (18)',
    templates: [
      'صباح النشاط يا {الاسم}، طمني أخبار الالتزام بالوجبات والمايه إيه النهاردة؟ 💧',
      'متنساش تاخد وجبتك بعد التمرين في ميعادها يا {الاسم} عشان الاستشفاء العضلي 🍗',
      'لو حسيت بجوع النهاردة تقدر تزود خضار ورقي براحتك، المهم نحافظ على السعرات يا {الاسم} 🥒',
      'شرب المايه لا يقل أهمية عن البروتين يا {الاسم}، حاول متقلش عن 3 لتر النهاردة 💧',
      'عاش يا {الاسم} على التزامك بالماكروز، ده اللي هيظهر تفاصيل العضلات بسرعة 📊',
      'لو معزوم بره النهاردة يا {الاسم} ركز على البروتين المشوي والسلطة وابعد عن المقليات 🥩',
      'بلاش تفوت وجبات عشان متجوعش بالليل وتبوظ اليوم يا {الاسم}، نظم مواعيدك ⏰',
      'الوجبة المفتوحة (Cheat Meal) ليها شروطها يا {الاسم}، استمتع بيها بذكاء وارجع لخطتك فوراً 🍔',
      'كربوهيدرات قبل التمرين بساعة ونص هتديك باور رهيب في الأوزان يا {الاسم} 🍚⚡',
      'تجهيز الوجبات من بالليل بيوفر عليك 80% من احتمالية اللخبطة يا {الاسم} 🥡',
      'السكر الأبيض والمشروبات الغازية هما العدو الأول لهدفك يا {الاسم}، خليك واعي 🚫',
      'البروتين في كل وجبة أساسي عشان تحافظ على الكتلة العضلية وتزود الحرق يا {الاسم} 🥚',
      'لو نفسك في حاجة مسكرة يا {الاسم}، خد فاكهة من حصتك أو قهوة سادة هتقفل الشهية ☕',
      'الالتزام بالدايت 90% من النتيجة والتمرين 10%، ركز في مطبخك يا بطل {الاسم} 🍳',
      'أخبار الهضم والانتفاخ إيه مع النظام الجديد يا {الاسم}؟ طمني لو محتاج أي تعديل 📝',
      'بلاش توزّن نفسك بعد الأكل أو بالليل يا {الاسم}، الميزان الصبح على الريق وبس ⚖️',
      'الألياف في وجباتك مهمة جداً عشان الشبع وصحة المعدة يا {الاسم}، اهتم بالخضار 🥗',
      'ممتاز يا {الاسم}! تظبيط أكلك الأسبوع ده باين أثره في النشاط والتركيز 👍'
    ]
  },
  workout: {
    label: '🏋️‍♂️ التمرين والأوزان (18)',
    templates: [
      'جاهز لتمرينة النهاردة يا {الاسم}؟ ركز في الأداء الحركي والعدات السلبية! 💥',
      'عاش على كسر الأوزان الأسبوع ده يا {الاسم}، سجل أوزانك في التطبيق عشان نتابع التطور 📈',
      'التسخين قبل التمرين 10 دقايق بيحميك من الإصابات ويزود قوتك في الأوزان يا {الاسم} 🔥',
      'الوزن وسيلة مش غاية يا {الاسم}، العب بمدى حركي كامل وتحكم في الوزن بدل المرجحة 🎯',
      'الراحة بين المجاميع من 60 لـ 90 ثانية في التمارين العادية ودقيقتين في المركبة يا {الاسم} ⏱️',
      'تمرينة الرجل النهاردة محتاجة تركيز ونفس طويل، قدها يا وحش {الاسم} 🦵🔥',
      'لو حسيت بأي وجع غريب في المفصل وقف التمرين فوراً وكلمني يا {الاسم} ⚠️',
      'الكارديو بعد التمرين مش قبل التمرين عشان توفر طاقتك للأوزان يا {الاسم} 🏃‍♂️',
      'التركيز الذهني على العضلة (Mind-Muscle Connection) بيضاعف استفادتك يا {الاسم} 🧠',
      'متنساش تمرين البطن والساعد في آخر التمرينة زي ما متفقين في الجدول يا {الاسم} 💪',
      'النزول البطيء بالوزن (3 ثواني) هو اللي بيعمل أقصى هدم عضلي مفيد يا {الاسم} 📉',
      'سجل كل وزن وعدة في أبلكيشن HULK أول بأول عشان نكسر أرقامك الأسبوع الجاي 📱',
      'النهاردة تمرينتك قوية يا {الاسم}، اشرب مايه كويس أثناء التمرين وخد نفسك صح 🌬️',
      'بلاش تقلد حد في الجيم بيلعب بأوزان غلط، التزم ببرنامجك وأدائك يا {الاسم} 👌',
      'تطور أوزانك في السكوات والبنش ممتاز جداً يا {الاسم}، استمر في التصاعد التدريجي 🚀',
      'لو وقتك ضيق النهاردة العب سوبر سيت (Super Set) عشان تخلص تمرينتك في 45 دقيقة يا {الاسم} ⚡',
      'القبضة الصح وتثبيت الكور (Core) بيحمي ضهرك في كل التمارين يا {الاسم} 🛡️',
      'طمني بعد ما تخلص تمرينة النهاردة إيه الأخبار والأداء يا {الاسم}؟ 💬'
    ]
  },
  recovery: {
    label: '😴 الاستشفاء والنوم (12)',
    templates: [
      'يوم الراحة النهاردة مهم جداً للاستشفاء يا {الاسم}، نام كويس واشرب مايه كتير 😴',
      'العضلة بتكبر وأنت نايم مش وأنت في الجيم يا {الاسم}، حاول متقلش عن 7-8 ساعات نوم 🛌',
      'وجع العضلات (DOMS) طبيعي جداً بعد التمرينة القوية يا {الاسم}، استرتشات ومايه دافية هتفكه 🚿',
      'بلاش تنزل تتمرن في يوم الراحة يا {الاسم}، جسمك محتاج يعيد بناء الألياف العضلية 🔋',
      'السهر بيقلل هرمون النمو وبيزود الكورتيزول اللي بيحبس مايه ودهون يا {الاسم}، نظم نومك 🌙',
      'اعمل إطالات (Stretching) 10 دقايق قبل النوم النهاردة هتفرق معاك جداً يا {الاسم} 🧘‍♂️',
      'لو حاسس بإرهاق عام النهاردة خد راحة إضافية وكلمني نعدل الجدول يا {الاسم} 🤝',
      'المغنيسيوم والزنك وفيتامين د بيساعدوا جداً في الاستشفاء وجودة النوم يا {الاسم} 💊',
      'حمام دافي بعد التمرين بيريح الجهاز العصبي وبيسرع الاستشفاء يا {الاسم} 🛁',
      'الإجهاد الزيادة بيوقف التطور يا {الاسم}، اسمع لجسمك واديله حقه في الراحة 🛑',
      'طمني نمت كام ساعة امبارح يا {الاسم}؟ جودة النوم بتبان في طاقتك في الجيم ⏰',
      'الاستشفاء الصح هو اللي بيخليك ترجع الجيم أقوى بـ 10 أضعاف يا {الاسم} 💪'
    ]
  },
  checkin: {
    label: '⚖️ الوزن والقياسات (12)',
    templates: [
      'بطلنا {الاسم}، متنساش تبعتلي تحديث الوزن والصور الصبح على الريق قبل الفطار 📸⚖️',
      'مستني تحديثك الأسبوعي يا {الاسم} عشان نراجع الخطة ونعمل التعديلات الجديدة 📋',
      'ثبات الوزن على الميزان أحياناً معناه إنك بتزيد عضل وبتخس دهون، القياسات هي الحكم يا {الاسم} 📏',
      'ابعتلي مقاس الوسط والذراع والصدر بالمازورة النهاردة عشان نقارن بالأسبوع اللي فات يا {الاسم} 📐',
      'التصوير يكون في نفس الإضاءة ونفس المكان الصبح بدري يا {الاسم} عشان المقارنة تبقى دقيقة 📷',
      'ما شاء الله يا {الاسم}، فرق الشكل في الصور واضح جداً والوسط نزل ممتاز! 🔥',
      'وصلني تحديثك يا {الاسم}، جاري مراجعة الأرقام وهبعتلك التعديلات الجديدة النهاردة ✅',
      'متتوترش لو الوزن زاد نص كيلو بسبب حبس مايه أو ملح، كمل وهينزل تاني يا {الاسم} 💧',
      'التزامك بتسجيل الوزن في التطبيق بيساعدني أتابع منحنى تطورك بدقة يا {الاسم} 📊',
      'النهاردة ميعاد المتابعة الأسبوعية يا {الاسم}، مستني رسالتك بكل التفاصيل 📩',
      'فرق الكتلة العضلية واضح جداً في التحديث الأخير يا {الاسم}، عاش بجد 👏',
      'قولي تقييمك لنفسك الأسبوع ده من 10 في التمرين والدايت يا {الاسم}؟ 🎯'
    ]
  },
  absence: {
    label: '👀 سؤال عن الغياب (10)',
    templates: [
      'فينك يا {الاسم}؟ مختفي بقالك يومين، طمني عليك يا بطل إن شاء الله تكون بخير 🙏',
      'وحشنا التزامك يا {الاسم}، لو عندك أي ظروف كلمني ونظبط الجدول سوا 💪',
      'يا {الاسم}، مفيش تسجيل تمارين أو تحديثات بقالك فترة، خير طمني عليك؟ 📞',
      'لو الدنيا زحمة معاك الأسبوع ده يا {الاسم} قولي نعمل جدول مختصر 3 أيام بس متقطعش 🔄',
      'الرجوع بعد الغياب بيكون صعب في أول يوم بس، انزل النهاردة ولو تمرينة خفيفة يا {الاسم} 👟',
      'متخليش يومين غياب يضيعوا تعب أسابيع يا {الاسم}، ارجع فوراً واحنا معاك 🤝',
      'بطلنا {الاسم}، قلقان عليك عشان مش ظاهر على المنصة، ابعتلي رسالة طمني 💬',
      'أي ظروف بتمر بيها هنعديها سوا يا {الاسم}، المهم متستسلمش وتبعد عن هدفك 🔥',
      'مستنيك في الجيم النهاردة يا {الاسم}، بلاش كسل ويلا نرجع بقوة أكبر 🚀',
      'طمني عليك يا {الاسم}، لو محتاج مكالمة نرتب بيها الدنيا من جديد أنا موجود 📲'
    ]
  },
  subscription: {
    label: '💳 الاشتراكات والترحيب (10)',
    templates: [
      'أهلاً بيك في عائلة HULK يا {الاسم}! 💪 جاهزين نبدأ رحلة تغيير حقيقية سوا 🚀',
      'تم تفعيل حسابك وخطتك بنجاح يا {الاسم}، افتح التطبيق وابدأ أول يوم بتركيز 🔥',
      'أهلاً يا {الاسم}، بنفكرك إن اشتراكك قرب ينتهي خلال أيام. جاهزين نكمل رحلة التغيير؟ 🏆',
      'تم تجديد اشتراكك بنجاح يا {الاسم}، يلا نبدأ شهر جديد بأقوى نتيجة مع HULK! 🟢',
      'نورت التيم يا {الاسم}، أي استفسار في التمرين أو الدايت ابعتلي في أي وقت 🫡',
      'باقي 3 أيام على نهاية الباقة الحالية يا {الاسم}، قولي عشان نجهز خطة الشهر الجديد 📋',
      'سعيد جداً بالنتيجة اللي وصلنالها الشهر ده يا {الاسم}، ومستعدين لليفل أعلى الشهر الجاي 📈',
      'بيانات الدفع والتجديد متاحة عندي يا {الاسم}، اول ما تجدد هينزلك الجدول المحدث فوراً ✅',
      'مبروك الانضمام يا وحش {الاسم}، التزامك من أول يوم هو مفتاح النجاح 🔑',
      'شكراً لثقتك في كوتش زياد ومنصة HULK يا {الاسم}، أوعدك بنتيجة ترضيك 💯'
    ]
  },
  injuries: {
    label: '🩹 إصابات وحلول سريعة (8)',
    templates: [
      'ألف سلامة عليك يا {الاسم}، ريح العضلة تماماً النهاردة وحط كمادات تلج 15 دقيقة 🧊',
      'لو في ألم في الكتف أو الكوع بلاش تلعب تمارين الدفع النهاردة يا {الاسم} لحد ما نطمن ⚠️',
      'ابعتلي فيديو لأدائك في التمرين ده يا {الاسم} عشان أصححلك التكنيك وأمنع أي إصابة 🎥',
      'تمارين الإطالة والتسخين الديناميكي قبل التمرين أساسية لحماية مفاصلك يا {الاسم} 🤸‍♂️',
      'لو ضهرك شادد النهاردة العب تمارين على أجهزة بمسند ضهر وابعد عن الأوزان الحرة يا {الاسم} 🛡️',
      'تبديل التمرين وارد جداً في أي وقت يا {الاسم}، المهم نلعب بأمان وبدون ألم ✅',
      'اشرب مايه كويس وخد بوتاسيوم ومغنيسيوم لو بيجيلك شد عضلي يا {الاسم} 🍌💧',
      'طمني الألم خف النهاردة ولا لسه يا {الاسم}؟ صحتك وسلامتك رقم 1 عندي 🙏'
    ]
  }
};

export const QuickReplies: React.FC<{ clients?: TraineeProfile[] }> = ({ clients = [] }) => {
  const { profile } = useAuth();
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('motivation');
  const [searchQuery, setSearchQuery] = useState('');
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const selectedClient = clients.find((c) => c.id === selectedClientId);

  const handleSelectTemplate = (template: string) => {
    const clientName = selectedClient ? (selectedClient.fullName || 'بطل').split(' ')[0] : 'بطل';
    setMessageText(template.replace(/{الاسم}/g, clientName));
    setStatus(null);
  };

  const handleClientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newId = e.target.value;
    setSelectedClientId(newId);
    const client = clients.find((c) => c.id === newId);
    if (client && messageText) {
      const firstName = (client.fullName || 'بطل').split(' ')[0];
      setMessageText((prev) => prev.replace(/يا \S+([!؟،\s])/, `يا ${firstName}$1`));
    }
  };

  const handleSendWhatsApp = async () => {
    if (!profile?.id) {
      setStatus({ type: 'error', text: 'يرجى تسجيل الدخول أولاً!' });
      return;
    }
    const rawPhone = (selectedClient as any)?.phone || (selectedClient as any)?.whatsapp || '';
    if (!selectedClient || !rawPhone) {
      setStatus({ type: 'error', text: 'يرجى اختيار متدرب مسجل برقم واتساب صحيح!' });
      return;
    }
    if (!messageText.trim()) {
      setStatus({ type: 'error', text: 'اكتب الرسالة أو اختر رداً جاهزاً أولاً!' });
      return;
    }

    let cleanPhone = String(rawPhone).replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('01') && cleanPhone.length === 11) {
      cleanPhone = '2' + cleanPhone;
    }

    setSending(true);
    setStatus(null);

    try {
      await addDoc(collection(db, 'whatsappQueue'), {
        trainerId: profile.id,
        traineeId: selectedClient.id,
        traineeName: selectedClient.fullName || 'متدرب',
        toPhone: cleanPhone,
        text: messageText.trim(),
        isAutomated: false,
        status: 'pending',
        createdAt: serverTimestamp(),
      });

      setStatus({
        type: 'success',
        text: `تمت إضافة الرسالة لـ ${selectedClient.fullName} في طابور الإرسال الآمن بنجاح! ✅`,
      });
      setMessageText('');
    } catch (err: any) {
      setStatus({ type: 'error', text: err?.message || 'حدث خطأ أثناء الإضافة للطابور.' });
    } finally {
      setSending(false);
    }
  };

  const displayedTemplates = searchQuery.trim()
    ? Object.values(REPLY_CATEGORIES)
        .flatMap((cat) => cat.templates)
        .filter((tpl) => tpl.includes(searchQuery.trim()))
    : REPLY_CATEGORIES[selectedCategory].templates;

  return (
    <div className="hulk-card p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base sm:text-lg font-extrabold flex items-center gap-2 text-[#F5F7F5]">
          <Zap className="w-5 h-5 text-[#39FF14]" />
          <span>ردود جاهزة وإرسال واتساب مباشر (106 رد)</span>
        </h2>
        <span className="text-xs text-[#929B95]">يُضاف لطابور الإرسال الآمن تلقائياً</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-[#929B95] mb-1.5">اختر المتدرب:</label>
          <select
            value={selectedClientId}
            onChange={handleClientChange}
            className="w-full bg-[#111713] border border-[#29352D] rounded-xl p-3 text-sm text-[#F5F7F5] focus:outline-none focus:border-[#39FF14]"
          >
            <option value="">-- اختر متدرب من القائمة --</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.fullName} ({(client as any).phone || (client as any).whatsapp || 'بدون رقم'})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#929B95] mb-1.5">بحث سريع في الردود:</label>
          <div className="relative">
            <Search className="w-4 h-4 text-[#929B95] absolute right-3 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث بكلمة (وزن، بروتين، غياب، كسر)..."
              className="w-full bg-[#111713] border border-[#29352D] rounded-xl pr-9 pl-3 py-3 text-sm text-[#F5F7F5] focus:outline-none focus:border-[#39FF14]"
            />
          </div>
        </div>
      </div>

      {!searchQuery.trim() && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(REPLY_CATEGORIES).map(([key, cat]) => (
            <button
              key={key}
              type="button"
              onClick={() => setSelectedCategory(key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                selectedCategory === key
                  ? 'bg-[#39FF14] text-[#0A0E0C]'
                  : 'bg-[#111713] border border-[#29352D] text-[#929B95] hover:border-[#39FF14]/40 hover:text-[#F5F7F5]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
        {displayedTemplates.length > 0 ? (
          displayedTemplates.map((tpl, index) => (
            <div
              key={index}
              onClick={() => handleSelectTemplate(tpl)}
              className="p-3 bg-[#111713] hover:bg-[#1C2420] border border-[#29352D] hover:border-[#39FF14]/50 rounded-xl cursor-pointer text-xs sm:text-sm text-[#F5F7F5] transition"
            >
              {tpl}
            </div>
          ))
        ) : (
          <p className="col-span-2 text-center text-[#929B95] text-xs py-4">لا توجد ردود مطابقة لبحثك.</p>
        )}
      </div>

      <div>
        <label className="block text-xs font-bold text-[#929B95] mb-1.5">نص الرسالة (يمكنك التعديل قبل الإرسال):</label>
        <textarea
          rows={3}
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          placeholder="اضغط على أي رد من الأعلى ليظهر هنا باسم اللاعب..."
          className="w-full bg-[#111713] border border-[#29352D] rounded-xl p-3 text-sm text-[#F5F7F5] focus:outline-none focus:border-[#39FF14]"
        />
      </div>

      {status && (
        <div
          className={`p-3 rounded-xl text-xs font-bold ${
            status.type === 'success'
              ? 'bg-[#39FF14]/15 text-[#39FF14] border border-[#39FF14]/40'
              : 'bg-[#FF4141]/15 text-[#FF4141] border border-[#FF4141]/40'
          }`}
        >
          {status.text}
        </div>
      )}

      <button
        type="button"
        onClick={handleSendWhatsApp}
        disabled={sending}
        className="w-full hulk-btn-primary py-3 text-sm font-black flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <Send className="w-4 h-4" />
        <span>{sending ? 'جاري الإضافة للطابور...' : 'إرسال للطابور عبر واتساب الآن'}</span>
      </button>
    </div>
  );
};
