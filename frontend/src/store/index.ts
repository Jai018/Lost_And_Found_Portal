import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import type { AuthUser, Notification } from '../types';

// ─── Auth Store ────────────────────────────────────────────────────────────

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: AuthUser, token: string) => void;
  updateUser: (updates: Partial<AuthUser>) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        token: null,
        isAuthenticated: false,

        setAuth: (user, token) =>
          set({ user, token, isAuthenticated: true }, false, 'setAuth'),

        updateUser: (updates) =>
          set(
            (state) => ({
              user: state.user ? { ...state.user, ...updates } : null,
            }),
            false,
            'updateUser'
          ),

        logout: () =>
          set({ user: null, token: null, isAuthenticated: false }, false, 'logout'),
      }),
      {
        name: 'findit-auth',
        partialize: (state) => ({
          user:  state.user,
          token: state.token,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    { name: 'AuthStore' }
  )
);

// ─── Theme Store ───────────────────────────────────────────────────────────

interface ThemeState {
  isDark: boolean;
  toggleTheme: () => void;
  setDark: (dark: boolean) => void;
}

export const useThemeStore = create<ThemeState>()(
  devtools(
    persist(
      (set) => ({
        isDark: false,

        toggleTheme: () =>
          set(
            (state) => {
              const newDark = !state.isDark;
              if (newDark) {
                document.documentElement.classList.add('dark');
              } else {
                document.documentElement.classList.remove('dark');
              }
              return { isDark: newDark };
            },
            false,
            'toggleTheme'
          ),

        setDark: (dark) =>
          set(() => {
            if (dark) {
              document.documentElement.classList.add('dark');
            } else {
              document.documentElement.classList.remove('dark');
            }
            return { isDark: dark };
          }, false, 'setDark'),
      }),
      { name: 'findit-theme' }
    ),
    { name: 'ThemeStore' }
  )
);

// ─── Notification Store ────────────────────────────────────────────────────

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (n: Notification) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  setNotifications: (ns: Notification[]) => void;
}

export const useNotificationStore = create<NotificationState>()(
  devtools(
    (set) => ({
      notifications: [],
      unreadCount: 0,

      setNotifications: (ns) =>
        set(
          {
            notifications: ns,
            unreadCount: ns.filter((n) => !n.read).length,
          },
          false,
          'setNotifications'
        ),

      addNotification: (n) =>
        set(
          (state) => ({
            notifications: [n, ...state.notifications],
            unreadCount: state.unreadCount + (n.read ? 0 : 1),
          }),
          false,
          'addNotification'
        ),

      markAsRead: (id) =>
        set(
          (state) => ({
            notifications: state.notifications.map((n) =>
              n._id === id ? { ...n, read: true } : n
            ),
            unreadCount: Math.max(0, state.unreadCount - 1),
          }),
          false,
          'markAsRead'
        ),

      markAllAsRead: () =>
        set(
          (state) => ({
            notifications: state.notifications.map((n) => ({ ...n, read: true })),
            unreadCount: 0,
          }),
          false,
          'markAllAsRead'
        ),
    }),
    { name: 'NotificationStore' }
  )
);

// ─── UI Store ──────────────────────────────────────────────────────────────

interface UIState {
  sidebarOpen: boolean;
  chatOpen: boolean;
  searchOpen: boolean;
  activeConversationId: string | null;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setChatOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  setActiveConversation: (id: string | null) => void;
}

export const useUIStore = create<UIState>()(
  devtools(
    (set) => ({
      sidebarOpen: false,
      chatOpen: false,
      searchOpen: false,
      activeConversationId: null,

      setSidebarOpen:      (open) => set({ sidebarOpen: open }),
      toggleSidebar:       ()     => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setChatOpen:         (open) => set({ chatOpen: open }),
      setSearchOpen:       (open) => set({ searchOpen: open }),
      setActiveConversation: (id) => set({ activeConversationId: id }),
    }),
    { name: 'UIStore' }
  )
);
