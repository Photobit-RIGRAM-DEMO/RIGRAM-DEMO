'use client';

import Button from '@/components/button';
import Input from '@/components/input';
import { supabase } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState<'admin' | 'student'>('admin');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) console.error('로그인 중 오류가 발생했습니다. :', error.message);

      const currentUser = data.user;
      if (!currentUser) throw new Error('아이디 또는 비밀번호를 확인해주세요.');

      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, school_id, school_name_en, user_type')
        .eq('id', currentUser.id)
        .single();
      if (usersError || !users) throw new Error('사용자 정보를 불러오지 못했습니다.');

      if (users.user_type !== userType)
        throw new Error(`선택한 권한(${userType})이 아닙니다. 다시 한 번 확인해주세요.`);

      // ✅ API Route를 통해 쿠키 설정
      const response = await fetch('/api/auth/set-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userType: users.user_type,
          schoolId: users.user_type === 'student' ? users.school_id : users.id,
          userId: users.id,
        }),
      });

      if (!response.ok) {
        throw new Error('세션 설정에 실패했습니다.');
      }

      // LocalStorage에도 저장 (클라이언트에서 사용)
      if (users.user_type === 'student') {
        localStorage.setItem('schoolId', users.school_id);
        localStorage.setItem('userType', users.user_type);
      } else {
        localStorage.setItem('schoolId', users.school_id);
        localStorage.setItem('userType', users.user_type);
      }

      // 페이지 이동
      if (users.user_type === 'admin') {
        if (!users.school_name_en) {
          router.replace('/admin/school-register');
        } else {
          router.replace(`/admin/${users.school_id}`);
        }
      }

      if (users.user_type === 'student') {
        if (!users.school_id) {
          throw new Error('소속 학교 정보가 없습니다. 학교 관리자에게 문의하세요.');
        }
        router.replace(`/student/${users.school_id}`);
      }
    } catch (error: unknown) {
      console.error(error);
      setError(error instanceof Error ? error.message : '로그인 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form action="" className="flex flex-col gap-4 md:gap-5" onSubmit={handleLogin}>
      <div className="flex justify-center gap-4">
        {['admin', 'student'].map((role) => (
          <label
            key={role}
            className={`px-6 py-2 rounded-full border text-sm font-medium cursor-pointer transition-all duration-200
                ${
                  userType === role
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-gray-500'
                }`}
          >
            <input
              type="radio"
              name="role"
              value={role}
              checked={userType === role}
              onChange={() => setUserType(role as 'admin' | 'student')}
              className="hidden"
            />
            {role}
          </label>
        ))}
      </div>
      <div className="flex flex-col gap-4">
        <Input purpose="id" id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input
          purpose="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <Button
        type="submit"
        className="w-full bg-gray-900 text-white text-18 py-4 rounded-lg"
        disabled={isLoading}
      >
        {isLoading ? '로그인 중...' : '로그인'}
      </Button>
    </form>
  );
}
