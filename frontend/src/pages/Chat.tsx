import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { io, Socket } from 'socket.io-client';
import {
  Send, Search, ArrowLeft,
  CheckCheck, Check, MessageSquare, Package
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { clsx } from 'clsx';
import { Avatar, EmptyState } from '../components/ui';
import { chatApi } from '../api/client';
import { useAuthStore } from '../store';
import type { Conversation, Message } from '../types';

let socket: Socket | null = null;

const Chat: React.FC = () => {
  const { id: paramConvId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, token } = useAuthStore();

  const [activeConvId, setActiveConvId]  = useState<string>(paramConvId || '');
  const [messages, setMessages]          = useState<Message[]>([]);
  const [inputVal, setInputVal]          = useState('');
  const [typing, setTyping]              = useState(false);
  const [searchConvs, setSearchConvs]    = useState('');
  const [sending, setSending]            = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn:  () => chatApi.getConversations().then((r) => r.data.data as Conversation[]),
  });

  const { data: convMessages } = useQuery({
    queryKey: ['messages', activeConvId],
    queryFn:  () => chatApi.getMessages(activeConvId).then((r) => r.data.data as Message[]),
    enabled:  !!activeConvId,
  });

  const activeConv = conversations.find((c: Conversation) => c._id === activeConvId);

  // ── Socket.IO ──────────────────────────────────────────────────────────
  useEffect(() => {
    socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000', {
      auth: { token },
      transports: ['websocket'],
    });

    socket.on('receive_message', (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    });
    socket.on('user_typing', () => setTyping(true));
    socket.on('stop_typing',  () => setTyping(false));

    return () => { socket?.disconnect(); };
  }, [token]);

  useEffect(() => {
    if (activeConvId && socket) {
      socket.emit('join_room', activeConvId);
    }
  }, [activeConvId]);

  useEffect(() => {
    if (convMessages) setMessages(convMessages);
  }, [convMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!inputVal.trim() || !activeConvId || sending) return;
    const content = inputVal.trim();
    setInputVal('');
    setSending(true);

    const optimisticMsg: Message = {
      _id: `temp-${Date.now()}`,
      conversationId: activeConvId,
      sender: user!._id,
      content,
      type: 'text',
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      const res = await chatApi.sendMessage(activeConvId, { content, type: 'text' });
      socket?.emit('send_message', { conversationId: activeConvId, message: res.data.data });
      setMessages((prev) => prev.map((m) => m._id === optimisticMsg._id ? res.data.data : m));
    } catch {
      setMessages((prev) => prev.filter((m) => m._id !== optimisticMsg._id));
    } finally {
      setSending(false);
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputVal(e.target.value);
    socket?.emit('typing', activeConvId);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket?.emit('stop_typing', activeConvId);
    }, 1500);
  };

  const filteredConvs = conversations.filter((c: Conversation) =>
    c.item?.title?.toLowerCase().includes(searchConvs.toLowerCase()) ||
    c.participants?.some((p) => typeof p === 'object' && p.name?.toLowerCase().includes(searchConvs.toLowerCase()))
  );

  const getOtherParticipant = (conv: Conversation) =>
    conv.participants?.find((p) => typeof p === 'object' && p._id !== user?._id) as any;

  return (
    <div className="min-h-screen bg-[--color-bg] pt-16 flex">
      <div className="flex-1 flex max-w-6xl mx-auto w-full">

        {/* ── Sidebar ────────────────────────────────────────────────── */}
        <div className={clsx(
          'w-full sm:w-80 flex-shrink-0 border-r border-gray-100 dark:border-navy-800 flex flex-col bg-white dark:bg-navy-900',
          activeConvId ? 'hidden sm:flex' : 'flex'
        )}>
          {/* Header */}
          <div className="p-4 border-b border-gray-100 dark:border-navy-800">
            <h2 className="font-display font-bold text-gray-900 dark:text-white text-lg mb-3">Messages</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={searchConvs}
                onChange={(e) => setSearchConvs(e.target.value)}
                id="conv-search"
                placeholder="Search conversations…"
                className="w-full pl-9 pr-4 py-2.5 bg-gray-100 dark:bg-navy-800 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="space-y-1 p-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex gap-3 p-3 rounded-xl">
                    <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-navy-800 animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 dark:bg-navy-800 rounded animate-pulse w-3/4" />
                      <div className="h-3 bg-gray-200 dark:bg-navy-800 rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredConvs.length === 0 ? (
              <EmptyState
                icon={<MessageSquare className="w-8 h-8" />}
                title="No conversations"
                description="When you claim an item or contact a finder, your chats will appear here."
              />
            ) : (
              filteredConvs.map((conv: Conversation) => {
                const other = getOtherParticipant(conv);
                const isActive = conv._id === activeConvId;
                return (
                  <button
                    key={conv._id}
                    id={`conv-${conv._id}`}
                    onClick={() => { setActiveConvId(conv._id); navigate(`/chat/${conv._id}`, { replace: true }); }}
                    className={clsx(
                      'w-full flex items-start gap-3 p-3 mx-1 rounded-xl transition-all text-left',
                      isActive
                        ? 'bg-primary-50 dark:bg-primary-950/30 border border-primary-200 dark:border-primary-900/50'
                        : 'hover:bg-gray-50 dark:hover:bg-navy-800'
                    )}
                  >
                    <div className="relative flex-shrink-0">
                      <Avatar src={other?.avatar} name={other?.name} size="md" verified={other?.isVerified} />
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white dark:border-navy-900" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{other?.name || 'Unknown'}</p>
                        <span className="text-[10px] text-gray-400 flex-shrink-0">
                          {conv.lastMessage ? formatDistanceToNow(new Date(conv.lastMessage.createdAt), { addSuffix: true }) : ''}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                        {conv.item?.title ? `Re: ${conv.item.title}` : ''}
                      </p>
                      {conv.lastMessage && (
                        <p className="text-xs text-gray-400 truncate mt-0.5">{conv.lastMessage.content}</p>
                      )}
                    </div>
                    {conv.unreadCount > 0 && (
                      <span className="flex-shrink-0 min-w-[20px] h-5 bg-primary-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                        {conv.unreadCount}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ── Chat Area ──────────────────────────────────────────────── */}
        <div className={clsx('flex-1 flex flex-col bg-gray-50 dark:bg-navy-950', !activeConvId && 'hidden sm:flex')}>
          {!activeConvId ? (
            <div className="flex-1 flex items-center justify-center">
              <EmptyState
                icon={<MessageSquare className="w-12 h-12" />}
                title="Select a conversation"
                description="Choose a conversation from the left to start chatting"
              />
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-navy-900 border-b border-gray-100 dark:border-navy-800 shadow-sm">
                <button
                  onClick={() => { setActiveConvId(''); navigate('/chat'); }}
                  className="sm:hidden p-2 hover:bg-gray-100 dark:hover:bg-navy-800 rounded-lg text-gray-600"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                {activeConv && (
                  <>
                    <Avatar
                      src={getOtherParticipant(activeConv)?.avatar}
                      name={getOtherParticipant(activeConv)?.name}
                      size="sm"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                        {getOtherParticipant(activeConv)?.name || 'Unknown'}
                      </p>
                      {activeConv.item && (
                        <Link to={`/items/${activeConv.item._id}`} className="text-xs text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1 truncate">
                          <Package className="w-3 h-3" />
                          {activeConv.item.title}
                        </Link>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg) => {
                  const isMine = (typeof msg.sender === 'string' ? msg.sender : (msg.sender as any)._id) === user?._id;
                  return (
                    <motion.div
                      key={msg._id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={clsx('flex gap-2', isMine ? 'flex-row-reverse' : 'flex-row')}
                    >
                      {!isMine && (
                        <Avatar
                          src={typeof msg.sender === 'object' ? (msg.sender as any).avatar : undefined}
                          name={typeof msg.sender === 'object' ? (msg.sender as any).name : 'U'}
                          size="xs"
                          className="flex-shrink-0 mt-auto"
                        />
                      )}
                      <div className={clsx('max-w-[70%] space-y-1', isMine ? 'items-end' : 'items-start', 'flex flex-col')}>
                        <div className={clsx(
                          'px-4 py-2.5 rounded-2xl text-sm leading-relaxed',
                          isMine
                            ? 'bg-primary-600 text-white rounded-tr-md'
                            : 'bg-white dark:bg-navy-800 text-gray-900 dark:text-white border border-gray-100 dark:border-navy-700 rounded-tl-md shadow-sm'
                        )}>
                          {msg.content}
                        </div>
                        <div className={clsx('flex items-center gap-1 text-[10px] text-gray-400', isMine && 'flex-row-reverse')}>
                          <span>{format(new Date(msg.createdAt), 'HH:mm')}</span>
                          {isMine && (msg.readAt ? <CheckCheck className="w-3 h-3 text-primary-400" /> : <Check className="w-3 h-3" />)}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}

                {/* Typing indicator */}
                <AnimatePresence>
                  {typing && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex gap-2 items-end"
                    >
                      <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-navy-700" />
                      <div className="px-4 py-3 bg-white dark:bg-navy-800 rounded-2xl rounded-tl-md border border-gray-100 dark:border-navy-700">
                        <div className="flex gap-1 items-center h-4">
                          {[0, 0.2, 0.4].map((d) => (
                            <motion.div key={d} className="w-1.5 h-1.5 bg-gray-400 rounded-full"
                              animate={{ y: [0, -4, 0] }} transition={{ duration: 0.8, delay: d, repeat: Infinity }} />
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 bg-white dark:bg-navy-900 border-t border-gray-100 dark:border-navy-800">
                <div className="flex gap-2 items-center">
                  <input
                    value={inputVal}
                    onChange={handleTyping}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                    id="chat-input"
                    placeholder="Type a message…"
                    className="flex-1 px-4 py-3 bg-gray-100 dark:bg-navy-800 rounded-2xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <button
                    id="send-msg-btn"
                    onClick={handleSend}
                    disabled={!inputVal.trim() || sending}
                    className={clsx(
                      'p-3 rounded-2xl transition-all duration-200',
                      inputVal.trim()
                        ? 'bg-primary-600 text-white hover:bg-primary-700 hover:shadow-glow'
                        : 'bg-gray-200 dark:bg-navy-700 text-gray-400 cursor-not-allowed'
                    )}
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
