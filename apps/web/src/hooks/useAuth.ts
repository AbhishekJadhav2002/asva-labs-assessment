import type { User } from '@/lib/auth';
import { AuthService } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export function useAuth() {
    const [user, setUser] = useState<undefined | User>(AuthService.getCurrentUser());
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const checkAuth = () => {
            if (AuthService.isAuthenticated()) {
                const currentUser = AuthService.getCurrentUser();
                setUser(currentUser);
            } else {
                router.push('/login');
            }
            setLoading(false);
        };

        checkAuth();
    }, [router]);

    const logout = () => {
        AuthService.logout();
        setUser(undefined);
        router.push('/login');
    };

    return {
        user,
        logout,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'ADMIN',
    };
}