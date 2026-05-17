import { trpc } from "@/providers/trpc";
import { useCallback, useMemo } from "react";
import { useAppStore } from "@/store/useAppStore";

export function useAuth() {
  const storeAuth = useAppStore((s) => s.isAuthenticated);
  const storeUser = useAppStore((s) => s.user);
  const logoutStore = useAppStore((s) => s.logoutUser);

  const utils = trpc.useUtils();

  // Try local auth first (phone/password)
  const {
    data: localUser,
    isLoading: localLoading,
  } = trpc.localAuth.me.useQuery(undefined, {
    staleTime: 1000 * 60 * 5,
    retry: false,
    enabled: !!localStorage.getItem("auth_token"),
  });

  // Fallback to OAuth (Kimi)
  const {
    data: oauthUser,
    isLoading: oauthLoading,
  } = trpc.auth.me.useQuery(undefined, {
    staleTime: 1000 * 60 * 5,
    retry: false,
    enabled: !localUser && !localStorage.getItem("auth_token"),
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

  // Prefer local auth, fallback to OAuth, then store
  const isAuthenticated = !!localUser || !!oauthUser || storeAuth;
  const isLoading = localLoading || oauthLoading;
  const user = localUser || oauthUser || storeUser;

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
