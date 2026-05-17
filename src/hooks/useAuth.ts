import { trpc } from "@/providers/trpc";
import { useCallback, useMemo } from "react";
import { useAppStore } from "@/store/useAppStore";

export function useAuth() {
  const storeAuth = useAppStore((s) => s.isAuthenticated);
  const storeUser = useAppStore((s) => s.user);

  const utils = trpc.useUtils();

  const {
    data: serverUser,
    isLoading: serverLoading,
  } = trpc.auth.me.useQuery(undefined, {
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: async () => {
      await utils.invalidate();
    },
  });

  const logout = useCallback(() => {
    logoutMutation.mutate();
    // Also clear local store
    useAppStore.getState().logoutUser();
  }, [logoutMutation]);

  // If either server auth or local store auth is active, consider authenticated
  const isAuthenticated = !!serverUser || storeAuth;
  const isLoading = serverLoading;

  // Prefer server user, fallback to store user
  const user = serverUser || storeUser;

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
