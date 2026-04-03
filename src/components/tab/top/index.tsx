'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

const TOP_TAB = [
  { id: '0', title: '학과 관리', url: 'department' },
  { id: '1', title: '졸업생 관리', url: 'graduate' },
  //{ id: '2', title: '단체 사진', url: 'photo' },
  { id: '3', title: '학교 소개 관리', url: 'introduction?tab=foreground' },
];

export default function TopTab() {
  const pathname = usePathname();

  const { userType, schoolId, currentTab } = useMemo(() => {
    const segments = pathname.split('/').filter(Boolean);

    return {
      userType: segments[0],
      schoolId: segments[1],
      currentTab: segments[2],
    };
  }, [pathname]);

  return (
    <nav aria-label="학교 관리 탭 메뉴">
      <ul className="flex items-center gap-2 md:gap-4" role="tablist">
        {TOP_TAB.map((tab) => {
          const tabPath = tab.url.split('?')[0];
          const isActive = currentTab === tabPath;

          return (
            <li key={tab.id} className="flex whitespace-nowrap" role="presentation">
              <Link
                href={`/${userType}/${schoolId}/${tab.url}`}
                className={`text-14 md:text-16 rounded-md px-2 py-2 md:px-4 md:py-2.5 ${
                  isActive ? 'bg-gray-200 text-gray-800 font-bold' : 'text-gray-600 font-medium'
                } hover:bg-gray-200 hover:text-gray-800 hover:font-bold focus:bg-gray-200 focus:text-gray-800 focus:font-bold active:bg-gray-200 active:text-gray-800 active:font-bold`}
              >
                {tab.title}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
