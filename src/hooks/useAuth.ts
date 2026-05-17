import { trpc } from "@/providers/trpc";
import { useCallback, useMemo } from "react";
import { useAppStore } from "@/store/useAppStore";

export function useAuth() {
  const storeAuth = useAppStore((s) => s.isAuthenticated);
  const storeUser = useAppStore((s) => s.user);
  const logoutStore = useAppStore((s) => s.logoutUser);

  const utils = trpc.useUtils();

  // Telegram auth — check session via backend
  const {
    data: telegramUser,
    isLoading: telegramLoading,
  } = trpc.auth.me.useQuery(undefined, {
    staleTime: 1000 * 60 * 5,
    retry: false,
    enabled: !!localStorage.getItem("auth_token"),
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: async () => {
      await utils.invalidate();
    },
  });

  const logout = useCallback(() => {
    localStorage.removeItem("auth_token");
    logoutMutation.mutate();
    logoutStore();
    window.location.reload();
  }, [logoutMutation, logoutStore]);

  // Prefer Telegram user, fallback to store
  const isAuthenticated = !!telegramUser || storeAuth;
  const isLoading = telegramLoading && !!localStorage.getItem("auth_token");
  const user = telegramUser || storeUser;

  return useMemo(
    () => ({
      user: user ?? null,
      isAuthenticated,
      isLoading,
      logout,
    }),
    [user, isAuthenticated, isLoading, logout],
  );
}
