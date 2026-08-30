import { useEffect } from 'react';
import { useRouter } from 'next/router';
import useAuthStore from '../store/authStore';

export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const { user, token, fetchProfile } = useAuthStore();

  useEffect(() => {
    if (token && !user) {
      fetchProfile();
    }
  }, [token, user, fetchProfile]);

  useEffect(() => {
    if (!token) {
      router.replace(`/login?returnTo=${encodeURIComponent(router.asPath)}`);
    }
  }, [token, router]);

  if (!token) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return children;
}
