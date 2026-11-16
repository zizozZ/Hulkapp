import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  Dumbbell,
  MessageSquare,
  Plus,
  TrendingUp,
  Users,
  Utensils,
} from 'lucide-react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import { Conversation, TraineeProfile } from '../../types';
import {
  computeComplianceLevel,
  getComplianceBadgeMeta,
  getDaysSinceTimestamp,
} from '../../utils/calculations';

export const TrainerDashboard: React.FC = () => {
  const { profile } = useAuth();
  const [trainees, setTrainees] = useState<TraineeProfile[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    if (!profile?.id) return;
    const u1 = onSnapshot(
      query(collection(db, 'trainees'), where('trainerId', '==', profile.id)),
      (s) => setTrainees(s.docs.map((d) => ({ id: d.id, ...d.data() } as TraineeProfile)))
    );
    const u2 = onSnapshot(
      query(collection(db, 'conversations'), where('trainerId', '==', profile.id)),
      (s) => setConversations(s.docs.map((d) => ({ id: d.id, ...d.data() } as Conversation)))
    );
    return () => {
      u1();
      u2();
    };
  }, [profile?.id]);

  const activeClients = trainees.filter((t) => t.status === 'active');
  const attentionClients = activeClients
    .map((t) => ({
      ...t,
      computedLevel: computeComplianceLevel(t),
      daysDelayed: getDaysSinceTimestamp(t.lastUpdateAt || t.createdAt),
    }))
    .filter((t) => t.computedLevel === 'RED' || t.computedLevel === 'ORANGE')
    .sort((a, b) => b.daysDelayed - a.daysDelayed);

  const unreadMessages = conversations.reduce((acc, c) => acc + (c.unreadByTrainer || 0), 0);

  const goalStats = [
    { name: 'تضخيم', count: trainees.filter((t) => t.goal?.includes('ضخ') || t.goal?.toLowerCase().includes('bulk') || t.goal?.toLowerCase().includes('gain')).length },
    { name: 'تخسيس', count: trainees.filter((t) => t.goal?.includes('خس') || t.goal?.includes('نشف') || t.goal?.toLowerCase().includes('loss') || t.goal?.toLowerCase().includes('cut')).length },
    { name: 'قوة', count: trainees.filter((t) => t.goal?.includes('قوة') || t.goal?.toLowerCase().includes('strength')).length },
    { name: 'لياقة', count: trainees.filter((t) => !t.goal || t.goal?.includes('لياقة') || t.goal?.toLowerCase().includes('fit')).length },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome & Quick Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#F5F7F5]">
            لوحة قيادة الكوتش {profile?.fullName}
          </h1>
          <p className="text-xs text-[#929B95] mt-1">
            متابعة حية للأبطال، مستويات الالتزام، والجداول التدريبية والغذائية
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/trainer/clients"
            className="hulk-btn-primary px-4 py-2.5 text-xs sm:text-sm flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة متدرب</span>
          </Link>
          <Link
            to="/trainer/workouts"
            className="px-4 py-2.5 rounded-xl bg-[#1C2420] border border-[#29352D] hover:border-[#39FF14]/40 text-xs sm:text-sm font-bold flex items-center gap-1.5"
          >
            <Dumbbell className="w-4 h-4 text-[#39FF14]" />
            <span>بناء جدول تمرين</span>
          </Link>
          <Link
            to="/trainer/nutrition"
            className="px-4 py-2.5 rounded-xl bg-[#1C2420] border border-[#29352D] hover:border-[#39FF14]/40 text-xs sm:text-sm font-bold flex items-center gap-1.5"
          >
            <Utensils className="w-4 h-4 text-[#39FF14]" />
            <span>بناء نظام غذائي</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="hulk-card p-5">
          <div className="flex items-center justify-between text-[#929B95]">
            <span className="text-xs font-bold">إجمالي المشتركين</span>
            <Users className="w-5 h-5 text-[#39FF14]" />
          </div>
          <p className="text-3xl font-black text-[#39FF14] mt-3">{trainees.length}</p>
        </div>

        <div className="hulk-card p-5">
          <div className="flex items-center justify-between text-[#929B95]">
            <span className="text-xs font-bold">المتدربون النشطون</span>
            <TrendingUp className="w-5 h-5 text-[#39FF14]" />
          </div>
          <p className="text-3xl font-black text-[#F5F7F5] mt-3">{activeClients.length}</p>
        </div>

        <div className="hulk-card p-5">
          <div className="flex items-center justify-between text-[#929B95]">
            <span className="text-xs font-bold">يحتاجون متابعة</span>
            <AlertTriangle className="w-5 h-5 text-[#FF4141]" />
          </div>
          <p className="text-3xl font-black text-[#FF4141] mt-3">{attentionClients.length}</p>
        </div>

        <Link to="/trainer/chat" className="hulk-card p-5 block">
          <div className="flex items-center justify-between text-[#929B95]">
            <span className="text-xs font-bold">رسائل غير مقروءة</span>
            <MessageSquare className="w-5 h-5 text-[#39FF14]" />
          </div>
          <p className="text-3xl font-black text-[#F5F7F5] mt-3">{unreadMessages}</p>
        </Link>
      </div>

      {/* Attention Needed + Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="hulk-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-[#FF9F1C]" />
              <span>يحتاجون متابعة عاجلة (Attention Needed)</span>
            </h2>
            <span className="text-xs text-[#929B95]">مستويات الالتزام</span>
          </div>

          {attentionClients.length === 0 ? (
            <div className="p-6 rounded-xl bg-[#111713] border border-[#29352D] text-center">
              <p className="text-sm font-bold text-[#39FF14]">جميع أبطالك ملتزمون بالتحديثات!</p>
              <p className="text-xs text-[#929B95] mt-1">لا يوجد متأخرون عن التحديث لأكثر من 3 أيام.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {attentionClients.slice(0, 5).map((client) => {
                const badge = getComplianceBadgeMeta(client.computedLevel);
                return (
                  <div
                    key={client.id}
                    className="p-3.5 rounded-xl bg-[#111713] border border-[#29352D] flex items-center justify-between gap-3"
                  >
                    <div>
                      <p className="font-extrabold text-sm">{client.fullName}</p>
                      <span
                        className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2 py-0.5 rounded-md border mt-1 ${badge.bg}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                        {badge.short} - متأخر {client.daysDelayed} أيام
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/trainer/clients/${client.id}`}
                        className="px-3 py-1.5 rounded-lg bg-[#1C2420] border border-[#29352D] hover:border-[#39FF14] text-xs font-bold"
                      >
                        ملف
                      </Link>
                      <Link
                        to="/trainer/chat"
                        className="px-3 py-1.5 rounded-lg bg-[#39FF14]/15 border border-[#39FF14]/40 text-[#39FF14] text-xs font-bold"
                      >
                        رسالة
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="hulk-card p-6 space-y-4">
          <h2 className="text-base font-extrabold">توزيع المتدربين حسب الهدف</h2>
          <div className="h-64 w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={goalStats}>
                <XAxis dataKey="name" stroke="#929B95" fontSize={12} />
                <YAxis stroke="#929B95" fontSize={12} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111713',
                    borderColor: '#29352D',
                    borderRadius: '12px',
                    color: '#F5F7F5',
                  }}
                />
                <Bar dataKey="count" fill="#39FF14" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
