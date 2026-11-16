import { createUserWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  setDoc,
  getDoc,
  updateDoc,
} from 'firebase/firestore';
import { auth, db, getSecondaryAuth } from '../config/firebase';

/**
 * Creates a Trainer or Trainee account directly using Secondary Firebase Auth
 * on the 100% Free Spark Plan without logging out the current Admin/Trainer.
 */
export const createManagedUserFn = async (payload: {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  targetRole: 'trainer' | 'trainee';
  profileData?: Record<string, any>;
}) => {
  const caller = auth.currentUser;
  if (!caller) throw new Error('يجب تسجيل الدخول أولاً.');

  const { email, password, fullName, phone, targetRole, profileData } = payload;
  const trainerId =
    targetRole === 'trainee' ? profileData?.trainerId || caller.uid : null;

  const secondaryAuth = getSecondaryAuth();
  let newUid = '';

  try {
    const cred = await createUserWithEmailAndPassword(secondaryAuth, email.trim(), password);
    newUid = cred.user.uid;
    await updateProfile(cred.user, { displayName: fullName });
  } finally {
    // Always sign out secondary session immediately so primary session stays intact
    await signOut(secondaryAuth).catch(() => null);
  }

  const now = serverTimestamp();

  await setDoc(doc(db, 'users', newUid), {
    id: newUid,
    email: email.trim(),
    fullName,
    phone: phone || '',
    role: targetRole,
    status: 'active',
    ...(trainerId ? { trainerId } : {}),
    createdAt: now,
    updatedAt: now,
  });

  if (targetRole === 'trainer') {
    await setDoc(doc(db, 'trainers', newUid), {
      id: newUid,
      userId: newUid,
      fullName,
      email: email.trim(),
      phone: phone || '',
      specialty: profileData?.specialty || 'Personal Training & Bodybuilding',
      bio: profileData?.bio || '',
      status: 'active',
      clientsCount: 0,
      createdAt: now,
      updatedAt: now,
    });
  } else if (targetRole === 'trainee' && trainerId) {
    const startDate =
      profileData?.subscriptionStart || new Date().toISOString().split('T')[0];
    const endDate =
      profileData?.subscriptionEnd ||
      new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];

    await setDoc(doc(db, 'trainees', newUid), {
      id: newUid,
      userId: newUid,
      trainerId,
      fullName,
      email: email.trim(),
      phone: phone || '',
      age: Number(profileData?.age || 25),
      height: Number(profileData?.height || 175),
      currentWeight: Number(profileData?.currentWeight || 80),
      startWeight: Number(profileData?.currentWeight || 80),
      targetWeight: Number(profileData?.targetWeight || 75),
      gender: profileData?.gender || 'male',
      activityLevel: profileData?.activityLevel || 'moderate',
      goal: profileData?.goal || 'Muscle Gain',
      subscriptionStart: startDate,
      subscriptionEnd: endDate,
      subscriptionStatus: 'Active',
      complianceLevel: 'GREEN',
      status: 'active',
      coachNotes: profileData?.coachNotes || '',
      followUpConfig: {
        workoutIntervalDays: 1,
        weightIntervalDays: 7,
        measurementsIntervalDays: 14,
        photosIntervalDays: 30,
      },
      lastUpdateAt: now,
      createdAt: now,
      updatedAt: now,
    });

    await addDoc(collection(db, 'subscriptions'), {
      traineeId: newUid,
      traineeName: fullName,
      trainerId,
      durationMonths: Number(profileData?.durationMonths || 1),
      startDate,
      endDate,
      amount: Number(profileData?.subscriptionAmount || 0),
      currency: 'EGP',
      paymentStatus: profileData?.paymentStatus || 'Paid',
      status: 'Active',
      notes: profileData?.subscriptionNotes || '',
      createdAt: now,
    });

    const convId = `${trainerId}_${newUid}`;
    await setDoc(doc(db, 'conversations', convId), {
      id: convId,
      trainerId,
      traineeId: newUid,
      traineeName: fullName,
      lastMessage: 'مرحباً بك في منصة HULK! رحلتك نحو القوة تبدأ الآن.',
      lastMessageAt: now,
      unreadByTrainer: 0,
      unreadByTrainee: 1,
    });
  }

  await addDoc(collection(db, 'activityLogs'), {
    actorId: caller.uid,
    actorRole: targetRole === 'trainer' ? 'admin' : 'trainer',
    action: targetRole === 'trainer' ? 'CREATE_TRAINER' : 'CREATE_TRAINEE',
    targetId: newUid,
    details: `Created ${targetRole}: ${fullName} (${email})`,
    createdAt: now,
  });

  return { uid: newUid, success: true };
};

/**
 * Suspend, Activate, or Remove Managed Profile
 */
export const setAccountStatusFn = async (
  targetUid: string,
  action: 'active' | 'suspended' | 'delete'
) => {
  if (action === 'delete') {
    await deleteDoc(doc(db, 'users', targetUid)).catch(() => null);
    await deleteDoc(doc(db, 'trainees', targetUid)).catch(() => null);
    await deleteDoc(doc(db, 'trainers', targetUid)).catch(() => null);
  } else {
    await updateDoc(doc(db, 'users', targetUid), { status: action }).catch(() => null);
    await updateDoc(doc(db, 'trainees', targetUid), { status: action }).catch(() => null);
    await updateDoc(doc(db, 'trainers', targetUid), { status: action }).catch(() => null);
  }
  return { success: true };
};

/**
 * Free Direct WhatsApp Integration (Opens WhatsApp Web / App with pre-filled template or custom message)
 */
export const sendWhatsAppNotificationFn = async (payload: {
  traineeId: string;
  traineeName: string;
  phone: string;
  messageType: 'template' | 'custom';
  templateName?: string;
  customBody?: string;
}) => {
  const cleanPhone = String(payload.phone || '').replace(/[^0-9]/g, '');
  if (!cleanPhone) {
    throw new Error('رقم هاتف المتدرب غير مسجل أو غير صالح.');
  }

  const templates: Record<string, string> = {
    hulk_delayed_update: `أهلاً كابتن ${payload.traineeName} 💪، نذكرك بتسجيل تحديث التمرين والوزن اليوم على منصة HULK.`,
    hulk_subscription_expiry: `أهلاً ${payload.traineeName}، نود تذكيرك بقرب موعد انتهاء اشتراكك التدريبي على HULK. تواصل معنا للتجديد والاستمرار!`,
    hulk_weekly_checkin: `بطل ${payload.traineeName} 🔥، حان موعد التحديث الأسبوعي (الوزن + القياسات + صور التقدم) على HULK.`,
  };

  const text =
    payload.messageType === 'custom' && payload.customBody
      ? payload.customBody
      : templates[payload.templateName || 'hulk_delayed_update'] || templates.hulk_delayed_update;

  const callerId = auth.currentUser?.uid;
  if (callerId) {
    const sessSnap = await getDoc(doc(db, 'whatsappSessions', callerId)).catch(() => null);
    if (sessSnap?.exists() && sessSnap.data()?.status === 'connected') {
      await addDoc(collection(db, 'whatsappQueue'), {
        trainerId: callerId,
        traineeId: payload.traineeId,
        traineeName: payload.traineeName,
        toPhone: cleanPhone,
        text,
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      return {
        success: true,
        message: 'تم إرسال رسالة واتساب تلقائياً من رقمك المربوط بالمنصة! ✅',
      };
    }
  }

  const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank', 'noopener,noreferrer');

  return {
    success: true,
    message: 'تم فتح محادثة WhatsApp بالرسالة الجاهزة مباشرة!',
  };
};
