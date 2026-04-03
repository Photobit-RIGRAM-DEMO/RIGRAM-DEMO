'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const BOTTOM_TAB = {
  department: [
    { id: '0', title: '기본 정보', url: 'detail' },
    { id: '1', title: '소개', url: 'intro' },
    { id: '2', title: '교직원', url: 'staff' },
    //{ id: '3', title: '학생회', url: 'union' },
  ],
  organization: [
    { id: '0', title: '전체', url: 'all' },
    { id: '1', title: '팀', url: 'team' },
    { id: '2', title: '단체', url: 'group' },
    { id: '3', title: '동아리', url: 'club' },
    { id: '4', title: '행사', url: 'event' },
  ],
  school_intro: [
    { id: '0', title: '전경', url: 'foreground' },
    { id: '1', title: '연혁', url: 'history' },
    //{ id: '2', title: '상징', url: 'symbol' },
    { id: '3', title: '임원진', url: 'executive' },
  ],
};

export default function BottomTab({
  purpose,
  className,
}: {
  purpose: keyof typeof BOTTOM_TAB;
  className?: string;
}) {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'all';

  const getTabData = () => {
    return BOTTOM_TAB[purpose] || [];
  };
  const tabData = getTabData();

  return (
    <ul
      className={`inline-flex items-center gap-1 w-fit p-1 bg-tab-bg-bottom rounded-4xl ${className || ''}`}
    >
      {tabData.map((tab) => (
        <li key={tab.id} className="inline-flex whitespace-nowrap">
          <Link
            href={`?tab=${tab.url}`}
            className={`text-14 md:text-16 text-white rounded-4xl px-4 py-2 md:px-6 md:py-2 ${
              activeTab === tab.url ? 'bg-tab-bg-bottom-active font-bold' : 'font-medium'
            } hover:bg-tab-bg-bottom-active hover:font-bold focus:bg-tab-bg-bottom-active focus:font-bold active:bg-tab-bg-bottom-active active:font-bold`}
          >
            {tab.title}
          </Link>
        </li>
      ))}
    </ul>
  );
}
