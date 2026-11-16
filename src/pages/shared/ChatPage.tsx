import React, { useEffect, useRef, useState } from 'react';
import { MessageSquarePlus, Paperclip, Send } from 'lucide-react';
import {
  addDoc,
  collection,
  doc,
  increment,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import { uploadChatAttachment } from '../../services/storageService';
import { ChatMessage, Conversation, TraineeProfile } from '../../types';

export const ChatPage: React.FC = () => {
  const { profile } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [trainees, setTrainees] = useState<TraineeProfile[]>([]);
  const [myTraineeDoc, setMyTraineeDoc] = useState<TraineeProfile | null>(null);
  const [convLoaded, setConvLoaded] = useState(false);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [optimisticMsgs, setOptimisticMsgs] = useState<ChatMessage[]>([]);
  const [chatError, setChatError] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const autoStartedRef = useRef(false);

  useEffect(() => {
    if (!profile?.id) return;
    const field = profile.role === 'trainer' ? 'trainerId' : 'traineeId';
    const unsubConv = onSnapshot(
      query(collection(db, 'conversations'), where(field, '==', profile.id)),
      (s) => {
        const list = s.docs
          .map((d) => ({ id: d.id, ...d.data() } as Conversation))
          .sort((a, b) => (b.lastMessageAt?.toMillis?.() || 0) - (a.lastMessageAt?.toMillis?.() || 0));
        setConversations(list);
        setConvLoaded(true);
        setSelectedConv((prev) => {
          if (!prev && list.length > 0) return list[0];
          if (prev) return list.find((c) => c.id === prev.id) || list[0] || null;
          return null;
        });
      },
      (err) => {
        setChatError(err.message);
        setConvLoaded(true);
      }
    );

    let unsubTrainees = () => {};
    if (profile.role === 'trainer') {
      unsubTrainees = onSnapshot(
        query(collection(db, 'trainees'), where('trainerId', '==', profile.id)),
        (s) => setTrainees(s.docs.map((d) => ({ id: d.id, ...d.data() } as TraineeProfile)))
      );
    } else if (profile.role === 'trainee') {
      unsubTrainees = onSnapshot(doc(db, 'trainees', profile.id), (s) => {
        if (s.exists()) {
          setMyTraineeDoc({ id: s.id, ...s.data() } as TraineeProfile);
        }
      });
    }

    return () => {
      unsubConv();
      unsubTrainees();
    };
  }, [profile?.id, profile?.role]);

  const resolvedTrainerId =
    profile?.role === 'trainee'
      ? profile.trainerId || myTraineeDoc?.trainerId || ''
      : '';

  const startChatWithTrainer = async () => {
    if (!profile?.id || profile.role !== 'trainee' || !resolvedTrainerId) return;
    const convId = `${resolvedTrainerId}_${profile.id}`;
    const newConv: Conversation = {
      id: convId,
      trainerId: resolvedTrainerId,
      traineeId: profile.id,
      traineeName: profile.fullName || myTraineeDoc?.fullName || 'متدرب',
      lastMessage: 'بدء المحادثة',
      lastMessageAt: serverTimestamp(),
      unreadByTrainer: 0,
      unreadByTrainee: 0,
    };
    await setDoc(doc(db, 'conversations', convId), newConv, { merge: true });
    setSelectedConv(newConv);
  };

  useEffect(() => {
    if (
      profile?.role === 'trainee' &&
      convLoaded &&
      conversations.length === 0 &&
      resolvedTrainerId &&
      !autoStartedRef.current
    ) {
      autoStartedRef.current = true;
      startChatWithTrainer().catch((err) => setChatError(err.message));
    }
  }, [profile?.role, convLoaded, conversations.length, resolvedTrainerId]);

  useEffect(() => {
    if (!selectedConv?.id || !profile?.id) return;
    setOptimisticMsgs([]);
    setChatError(null);

    const q = query(
      collection(db, 'messages'),
      where('conversationId', '==', selectedConv.id)
    );

    const unsub = onSnapshot(
      q,
      (s) => {
        const sorted = s.docs
          .map((d) => ({ id: d.id, ...d.data() } as ChatMessage))
          .sort((a, b) => {
            const ta = a.createdAt?.toMillis ? a.createdAt.toMillis() : Date.now() + 5000;
            const tb = b.createdAt?.toMillis ? b.createdAt.toMillis() : Date.now() + 5000;
            return ta - tb;
          });
        setMessages(sorted);
        setOptimisticMsgs((prev) =>
          prev.filter((opt) => !sorted.some((real) => real.text === opt.text && real.senderId === opt.senderId))
        );
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 80);
      },
      (err) => {
        setChatError(err.message);
      }
    );

    const unreadField = profile.role === 'trainer' ? 'unreadByTrainer' : 'unreadByTrainee';
    updateDoc(doc(db, 'conversations', selectedConv.id), { [unreadField]: 0 }).catch(() => null);

    return () => unsub();
  }, [selectedConv?.id, profile?.id, profile?.role]);

  const startChatWithTrainee = async (t: TraineeProfile) => {
    if (!profile?.id) return;
    const convId = `${profile.id}_${t.id}`;
    const existing = conversations.find((c) => c.id === convId || c.traineeId === t.id);
    if (existing) {
      setSelectedConv(existing);
      return;
    }
    const newConv: Conversation = {
      id: convId,
      trainerId: profile.id,
      traineeId: t.id,
      traineeName: t.fullName,
      lastMessage: 'بدء المحادثة',
      lastMessageAt: serverTimestamp(),
      unreadByTrainer: 0,
      unreadByTrainee: 0,
    };
    await setDoc(doc(db, 'conversations', convId), newConv);
    setSelectedConv(newConv);
  };

  const handleSend = async (e?: React.FormEvent, attachmentFile?: File) => {
    if (e) e.preventDefault();
    if (!profile?.id || !selectedConv || (!text.trim() && !attachmentFile)) return;
    setSending(true);
    try {
      let attachmentData: { url: string; type: 'image' | 'file'; name: string } | null = null;
      if (attachmentFile) {
        attachmentData = await uploadChatAttachment(
          selectedConv.trainerId,
          selectedConv.traineeId,
          attachmentFile
        );
      }
      const bodyText = text.trim() || (attachmentData ? `مرفق: ${attachmentData.name}` : '');
      setText('');

      const tempMsg: ChatMessage = {
        id: `temp_${Date.now()}`,
        conversationId: selectedConv.id,
        trainerId: selectedConv.trainerId,
        traineeId: selectedConv.traineeId,
        senderId: profile.id,
        senderRole: profile.role,
        text: bodyText,
        ...(attachmentData
          ? {
              attachmentUrl: attachmentData.url,
              attachmentType: attachmentData.type,
              attachmentName: attachmentData.name,
            }
          : {}),
        read: false,
        createdAt: { toMillis: () => Date.now() },
      };
      setOptimisticMsgs((prev) => [...prev, tempMsg]);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 40);

      await addDoc(collection(db, 'messages'), {
        conversationId: selectedConv.id,
        trainerId: selectedConv.trainerId,
        traineeId: selectedConv.traineeId,
        senderId: profile.id,
        senderRole: profile.role,
        text: bodyText,
        ...(attachmentData
          ? {
              attachmentUrl: attachmentData.url,
              attachmentType: attachmentData.type,
              attachmentName: attachmentData.name,
            }
          : {}),
        read: false,
        createdAt: serverTimestamp(),
      });

      const recipientId =
        profile.role === 'trainer' ? selectedConv.traineeId : selectedConv.trainerId;
      const otherUnreadField =
        profile.role === 'trainer' ? 'unreadByTrainee' : 'unreadByTrainer';

      await updateDoc(doc(db, 'conversations', selectedConv.id), {
        lastMessage: bodyText,
        lastMessageAt: serverTimestamp(),
        [otherUnreadField]: increment(1),
      });

      await addDoc(collection(db, 'notifications'), {
        userId: recipientId,
        title: `رسالة جديدة من ${profile.fullName}`,
        body: bodyText.slice(0, 80),
        type: 'message',
        read: false,
        link: profile.role === 'trainer' ? '/trainee/chat' : '/trainer/chat',
        createdAt: serverTimestamp(),
      });
    } catch (err: any) {
      alert(err?.message || 'تعذر إرسال الرسالة.');
    } finally {
      setSending(false);
    }
  };

  const allMessages = [...messages, ...optimisticMsgs];
  const traineesWithoutConv = trainees.filter(
    (t) => !conversations.some((c) => c.traineeId === t.id)
  );

  const formatMsgTime = (ts: any) => {
    try {
      const date = ts?.toDate ? ts.toDate() : ts?.toMillis ? new Date(ts.toMillis()) : null;
      if (!date) return 'الآن';
      return date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="h-[calc(100vh-10.5rem)] hulk-card overflow-hidden flex flex-col md:flex-row">
      {profile?.role === 'trainer' && (
        <div className="w-full md:w-72 max-h-44 md:max-h-none border-b md:border-b-0 md:border-l border-[#29352D] bg-[#111713] p-3 overflow-y-auto shrink-0">
          <h2 className="text-xs font-extrabold text-[#929B95] px-2 py-1.5">
            محادثات المتدربين ({conversations.length})
          </h2>
          <div className="space-y-1.5">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedConv(conv)}
                className={`w-full text-right p-2.5 rounded-xl transition flex items-center justify-between gap-2 ${
                  selectedConv?.id === conv.id
                    ? 'bg-[#39FF14]/15 border border-[#39FF14]/40'
                    : 'hover:bg-[#1C2420]'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold truncate">{conv.traineeName}</p>
                  <p className="text-[11px] text-[#929B95] truncate">{conv.lastMessage}</p>
                </div>
                {conv.unreadByTrainer > 0 && (
                  <span className="w-5 h-5 rounded-full bg-[#39FF14] text-[#090B0A] text-[10px] font-black flex items-center justify-center shrink-0">
                    {conv.unreadByTrainer}
                  </span>
                )}
              </button>
            ))}

            {traineesWithoutConv.map((t) => (
              <button
                key={t.id}
                onClick={() => startChatWithTrainee(t)}
                className="w-full text-right p-2.5 rounded-xl border border-dashed border-[#29352D] hover:border-[#39FF14]/50 transition flex items-center justify-between text-xs text-[#929B95] hover:text-[#F5F7F5]"
              >
                <span className="truncate">بدء محادثة: {t.fullName}</span>
                <MessageSquarePlus className="w-4 h-4 text-[#39FF14] shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-h-0">
        {chatError && (
          <div className="p-2.5 bg-red-500/15 border-b border-red-500/40 text-red-300 text-xs text-center">
            {chatError}
          </div>
        )}

        {!selectedConv ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 p-4 text-center text-xs text-[#929B95]">
            {profile?.role === 'trainee' ? (
              <>
                <p>جاري فتح المحادثة مع الكوتش...</p>
                {resolvedTrainerId && (
                  <button
                    type="button"
                    onClick={startChatWithTrainer}
                    className="hulk-btn-primary px-4 py-2 text-xs"
                  >
                    فتح المحادثة الآن
                  </button>
                )}
              </>
            ) : (
              <p>اختر متدرباً من القائمة لبدء المحادثة الفورية</p>
            )}
          </div>
        ) : (
          <>
            <div className="p-3.5 border-b border-[#29352D] bg-[#111713] flex items-center justify-between">
              <span className="font-extrabold text-sm">
                {profile?.role === 'trainer'
                  ? `محادثة مع البطل: ${selectedConv.traineeName}`
                  : 'تواصل مباشر مع الكوتش'}
              </span>
              <span className="text-[11px] text-[#39FF14] font-bold">● متصل الآن</span>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {allMessages.length === 0 ? (
                <p className="text-center text-xs text-[#929B95] py-10">
                  {profile?.role === 'trainer'
                    ? 'ابدأ المحادثة الآن بإرسال رسالة أو صورة للبطل'
                    : 'ابدأ المحادثة الآن بإرسال رسالة أو صورة للكوتش'}
                </p>
              ) : (
                allMessages.map((m) => {
                  const isMine = m.senderId === profile?.id;
                  return (
                    <div
                      key={m.id}
                      className={`flex animate-bubble-in ${isMine ? 'justify-start' : 'justify-end'}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-2xl text-xs leading-relaxed shadow-md ${
                          isMine
                            ? 'bg-[#39FF14] text-[#090B0A] font-bold rounded-tr-sm'
                            : 'bg-[#111713] border border-[#29352D] text-[#F5F7F5] rounded-tl-sm'
                        }`}
                      >
                        {m.attachmentUrl && m.attachmentType === 'image' && (
                          <img
                            src={m.attachmentUrl}
                            alt="attachment"
                            className="max-h-48 rounded-xl mb-2"
                          />
                        )}
                        {m.attachmentUrl && m.attachmentType === 'file' && (
                          <a
                            href={m.attachmentUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="underline block mb-1"
                          >
                            {m.attachmentName}
                          </a>
                        )}
                        <p className="whitespace-pre-wrap break-words">{m.text}</p>
                        <p
                          className={`text-[9px] mt-1 text-left ${
                            isMine ? 'text-[#090B0A]/70' : 'text-[#929B95]'
                          }`}
                        >
                          {formatMsgTime(m.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={bottomRef} />
            </div>

            <form
              onSubmit={(e) => handleSend(e)}
              className="p-3 border-t border-[#29352D] bg-[#111713] flex items-center gap-2 shrink-0"
            >
              <label className="p-2.5 rounded-xl bg-[#1C2420] border border-[#29352D] cursor-pointer hover:border-[#39FF14]/50 transition">
                <Paperclip className="w-4 h-4 text-[#929B95]" />
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleSend(undefined, f);
                  }}
                />
              </label>
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="اكتب رسالتك هنا..."
                className="hulk-input flex-1 text-xs"
              />
              <button
                type="submit"
                disabled={sending}
                className="hulk-btn-primary p-2.5"
                aria-label="إرسال"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
