import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Activity,
  Bell,
  CalendarCheck,
  CreditCard,
  Dumbbell,
  FileSpreadsheet,
  Home,
  LayoutDashboard,
  Library,
  LogOut,
  Menu,
  MessageSquare,
  Scale,
  Settings,
  ShieldCheck,
  TrendingUp,
  UserCheck,
  Users,
  Utensils,
  X,
} from 'lucide-react';
import { collection, doc, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { AppNotification } from '../types';
import { HulkLogo } from './HulkLogo';

export const AppLayout: React.FC = () => {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    if (!profile?.id) return;
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', profile.id)
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs
          .map((d) => ({ id: d.id, ...d.data() } as AppNotification))
          .sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
        setNotifications(list);
      },
      () => {}
    );
    return () => unsub();
  }, [profile?.id]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = async (notif: AppNotification) => {
    if (!notif.read) {
      await updateDoc(doc(db, 'notifications', notif.id), { read: true }).catch(() => null);
    }
    if (notif.link) {
      navigate(notif.link);
    }
    setNotifOpen(false);
  };

  const trainerNav = [
    { to: '/trainer', label: 'لوحة التحكم', icon: LayoutDashboard, end: true },
    { to: '/trainer/clients', label: 'إدارة المتدربين', icon: Users },
    { to: '/trainer/workouts', label: 'منشئ الجداول التدريبية', icon: Dumbbell },
    { to: '/trainer/templates', label: 'القوالب الجاهزة', icon: FileSpreadsheet },
    { to: '/trainer/exercises', label: 'مكتبة التمارين', icon: Library },
    { to: '/trainer/nutrition', label: 'منشئ التغذية', icon: Utensils },
    { to: '/trainer/subscriptions', label: 'الاشتراكات', icon: CreditCard },
    { to: '/trainer/chat', label: 'المحادثات', icon: MessageSquare },
    { to: '/trainer/settings', label: 'الإعدادات', icon: Settings },
  ];

  const adminNav = [
    { to: '/admin', label: 'لوحة الإدارة العامة', icon: ShieldCheck, end: true },
    { to: '/admin/trainers', label: 'إدارة المدربين', icon: UserCheck },
    { to: '/admin/trainees', label: 'جميع المتدربين', icon: Users },
    { to: '/admin/logs', label: 'سجل النشاط والأمان', icon: Activity },
    { to: '/admin/settings', label: 'إعدادات المنصة', icon: Settings },
  ];

  const traineeNav = [
    { to: '/trainee', label: 'الرئيسية', icon: Home, end: true },
    { to: '/trainee/workout', label: 'التمارين', icon: Dumbbell },
    { to: '/trainee/nutrition', label: 'التغذية', icon: Utensils },
    { to: '/trainee/progress', label: 'التطور', icon: TrendingUp },
    { to: '/trainee/chat', label: 'الكوتش', icon: MessageSquare },
  ];

  const navItems =
    profile?.role === 'admin'
      ? adminNav
      : profile?.role === 'trainer'
      ? trainerNav
      : traineeNav;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#090B0A] text-[#F5F7F5] flex flex-col lg:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-72 lg:flex-col lg:fixed lg:inset-y-0 lg:right-0 bg-[#111713] border-l border-[#29352D] z-30">
        <div className="p-6 border-b border-[#29352D]">
          <HulkLogo />
        </div>

        <nav className="flex-1 px-4 py-5 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                    isActive
                      ? 'bg-[#39FF14]/15 text-[#39FF14] border border-[#39FF14]/40 shadow-neon'
                      : 'text-[#929B95] hover:text-[#F5F7F5] hover:bg-[#1C2420]'
                  }`
                }
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#29352D] space-y-3">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-[#1C2420] border border-[#29352D]">
            <div className="w-10 h-10 rounded-full bg-[#39FF14]/20 border border-[#39FF14]/50 flex items-center justify-center font-black text-[#39FF14]">
              {profile?.fullName?.charAt(0) || 'H'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold truncate">{profile?.fullName}</p>
              <p className="text-xs text-[#39FF14] font-semibold">
                {profile?.role === 'admin'
                  ? 'مدير النظام (Admin)'
                  : profile?.role === 'trainer'
                  ? 'مدرب معتمد (Coach)'
                  : 'بطل مشترك (Trainee)'}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold text-[#FF4141] bg-[#FF4141]/10 hover:bg-[#FF4141]/20 border border-[#FF4141]/30 transition"
          >
            <LogOut className="w-4 h-4" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:pr-72 flex flex-col min-h-screen pb-20 lg:pb-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-20 bg-[#090B0A]/90 backdrop-blur-md border-b border-[#29352D] px-4 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-[#1C2420] border border-[#29352D] text-[#F5F7F5]"
              aria-label="القائمة"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="lg:hidden">
              <HulkLogo compact />
            </div>
            <div className="hidden sm:block">
              <h2 className="text-base font-extrabold text-[#F5F7F5]">
                أهلاً، {profile?.fullName || 'بطل HULK'} 💪
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {profile?.role === 'trainee' && (
              <NavLink
                to="/trainee/subscription"
                className="hidden sm:flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-[#1C2420] border border-[#29352D] text-[#39FF14] hover:border-[#39FF14]/50"
              >
                <CalendarCheck className="w-4 h-4" />
                <span>اشتراكي</span>
              </NavLink>
            )}

            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2.5 rounded-xl bg-[#1C2420] border border-[#29352D] hover:border-[#39FF14]/50 transition"
              >
                <Bell className="w-5 h-5 text-[#F5F7F5]" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-[#39FF14] text-[#090B0A] text-[11px] font-black flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute left-0 mt-2 w-80 max-h-96 overflow-y-auto rounded-2xl bg-[#111713] border border-[#29352D] shadow-2xl p-3 z-50">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#29352D]">
                    <span className="text-sm font-extrabold">الإشعارات ({unreadCount})</span>
                    <button
                      onClick={() => setNotifOpen(false)}
                      className="text-xs text-[#929B95] hover:text-white"
                    >
                      إغلاق
                    </button>
                  </div>
                  {notifications.length === 0 ? (
                    <p className="text-xs text-[#929B95] text-center py-6">لا توجد إشعارات حالياً</p>
                  ) : (
                    <div className="space-y-2">
                      {notifications.slice(0, 12).map((n) => (
                        <button
                          key={n.id}
                          onClick={() => markAsRead(n)}
                          className={`w-full text-right p-2.5 rounded-xl border transition ${
                            n.read
                              ? 'bg-[#1C2420]/50 border-[#29352D] text-[#929B95]'
                              : 'bg-[#1C2420] border-[#39FF14]/40 text-[#F5F7F5]'
                          }`}
                        >
                          <p className="text-xs font-bold">{n.title}</p>
                          <p className="text-[11px] opacity-80 mt-0.5">{n.body}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto">
          <div key={location.pathname} className="animate-page-enter">
          <Outlet />
        </div>
        </main>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-72 max-w-[82vw] bg-[#111713] border-l border-[#29352D] h-full flex flex-col z-10 p-5">
            <div className="flex items-center justify-between pb-4 border-b border-[#29352D]">
              <HulkLogo />
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg bg-[#1C2420] text-[#929B95]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 py-4 space-y-1.5 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold ${
                        isActive
                          ? 'bg-[#39FF14]/15 text-[#39FF14] border border-[#39FF14]/40'
                          : 'text-[#929B95] hover:bg-[#1C2420]'
                      }`
                    }
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
              {profile?.role === 'trainee' && (
                <>
                  <NavLink
                    to="/trainee/measurements"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-[#929B95] hover:bg-[#1C2420]"
                  >
                    <Scale className="w-5 h-5" />
                    <span>الوزن والقياسات</span>
                  </NavLink>
                  <NavLink
                    to="/trainee/subscription"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-[#929B95] hover:bg-[#1C2420]"
                  >
                    <CreditCard className="w-5 h-5" />
                    <span>تفاصيل الاشتراك</span>
                  </NavLink>
                </>
              )}
            </nav>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-[#FF4141] bg-[#FF4141]/10 border border-[#FF4141]/30"
            >
              <LogOut className="w-4 h-4" />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </div>
      )}

      {/* Trainee Mobile Bottom Navigation */}
      {profile?.role === 'trainee' && (
        <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-[#111713]/95 backdrop-blur-md border-t border-[#29352D] z-30 px-2 py-1.5 flex items-center justify-around">
          {traineeNav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-bold transition ${
                    isActive ? 'text-[#39FF14]' : 'text-[#929B95]'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      )}
    </div>
  );
};
