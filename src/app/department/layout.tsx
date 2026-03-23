'use client';

import Header from '@/components/header';
import { useSchoolStore } from '@/store/useSchoolStore';
import { supabase } from '@/utils/supabase/client';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function SchoolLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);
  const currentPage = segments[2];

  const fetchSchool = useSchoolStore((state) => state.fetchSchool);

  let mainClass = 'flex justify-center items-start flex-1 p-5 md:px-10 md:pb-0';
  if (currentPage === 'department') {
    mainClass += ' md:pt-5';
  }

  useEffect(() => {
    const getAuthData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) await fetchSchool(user.id);
      } catch (error) {
        console.error('유저 데이터를 가져오던 중 오류가 발생했습니다. :', error);
      }
    };

    getAuthData();
  }, [fetchSchool]);

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      <Header hasSchool />
      <main role="main" className={mainClass}>
        {children}
      </main>
    </div>
  );
}
