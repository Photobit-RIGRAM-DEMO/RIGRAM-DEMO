'use client';

import Button from '@/components/button';
import { useSchoolStore } from '@/store/useSchoolStore';
import { supabase } from '@/utils/supabase/client';
import { Calendar, GraduationCap, Mail, PencilLine, Phone, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useMemo } from 'react';

const MENU_LIST = [
  {
    id: '0',
    title: '학과 관리',
    subTitle: '학과 추가, 소개 관리',
    url: 'department',
    img_url: '/images/menu01.png',
  },
  {
    id: '1',
    title: '졸업생 관리',
    subTitle: '졸업생 추가, 정보 관리',
    url: 'graduate',
    img_url: '/images/menu02.png',
  },
  // {
    // id: '2',
    // title: '단체 사진',
    // subTitle: '학과별 단체, 사진 관리',
    // url: 'photo',
    // img_url: '/images/menu03.png',
  // },
  {
    id: '3',
    title: '학과 소개 관리',
    subTitle: '전경 / 연혁 / 운영진',
    // subTitle: '전경 / 연혁 / 상징 / 운영진',
    url: 'introduction?tab=foreground',
    img_url: '/images/menu04.png',
  },
] as const;

export default function SchoolMainPage() {
  const pathname = usePathname();
  const fetchSchool = useSchoolStore((state) => state.fetchSchool);
  const isLoading = useSchoolStore((state) => state.isLoading);
  const school = useSchoolStore((state) => state.school);

  const getAuthData = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) return console.error(error);
      const user = data?.session?.user;
      if (user) await fetchSchool(user.id);
    } catch (err) {
      console.error(err);
    }
  }, [fetchSchool]);

  useEffect(() => {
    if (!school) getAuthData();
  }, [getAuthData, school]);

  const InfoConfig = useMemo(
    () => [
      { id: '0', icon: <User />, title: '담당자', content: school?.manager_name ?? '-' },
      { id: '1', icon: <Mail />, title: '이메일', content: school?.manager_email ?? '-' },
      { id: '2', icon: <Phone />, title: '연락처', content: school?.manager_contact ?? '-' },
      { id: '3', icon: <Calendar />, title: '생성일', content: school?.created_at?.slice(0, 10) ?? '-' },
      { id: '4', icon: <Calendar />, title: '수정일', content: school?.updated_at?.slice(0, 10) ?? '-' },
    ],
    [school]
  );

  if (!school || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]" role="status" aria-live="polite">
        <span className="text-gray-600">학교 정보를 불러오는 중 입니다..</span>
      </div>
    );
  }

  const schoolLogoUrl =
    school.school_img_url instanceof File
      ? URL.createObjectURL(school.school_img_url)
      : school.school_img_url || '/images/default-school-logo.png';

  return (
    <section className="flex flex-col justify-center items-center gap-5 w-full md:flex-row md:gap-4">
      {/* 좌측 학교 정보 */}
      <article className="w-full md:w-[532px] h-full flex flex-col gap-6 bg-white p-6 md:px-18 shadow-dropdown md:gap-13 md:pt-[52px] md:pb-[120px] rounded-xl">
        <div className="flex flex-col items-center gap-4 md:gap-6">
          <figure className="flex flex-col items-center gap-4 md:gap-6">
            <div className="border border-gray-200 rounded-4xl p-4 md:p-6">
              <div className="relative w-13 h-13">
                <Image
                  src={schoolLogoUrl}
                  alt={`${school?.school_name}학교 로고`}
                  fill
                  sizes="(max-width: 768px) 52px"
                  className="object-contain"
                />
              </div>
            </div>
            <figcaption className="flex flex-col items-center gap-1">
              <h3 className="text-20 md:text-24 font-semibold text-gray-900">{school?.school_name}</h3>
              <span className="text-16 md:text-20 font-regular text-gray-700">{school?.school_name_en}</span>
            </figcaption>
          </figure>
          <div className="flex items-center text-16 md:text-18 text-gray-800 gap-1">
            <GraduationCap />
            <span>{school?.graduation_year} 졸업</span>
          </div>
        </div>
        <span className="w-full h-px bg-gray-400"></span>
        <div className="w-full h-full flex flex-col gap-8 md:gap-10">
          <div className="flex justify-between items-center">
            <h3 className="text-18 text-gray-900 font-semibold">상세 정보</h3>
            <Button
              className="flex items-center text-16 text-gray-600 gap-1 hover:text-gray-700 hover:font-bold focus:text-gray-700 focus:font-bold focus:outline-gray-700 active:text-gray-700 active:font-bold"
              href={`/admin/school-register/edit`}
            >
              <PencilLine className="w-4 h-4" />
              <span>정보 수정하기</span>
            </Button>
          </div>
          <dl className="flex flex-col gap-5">
            {InfoConfig.map((info) => (
              <div className="flex justify-start items-center gap-2" key={info.id}>
                <dt className="flex justify-start items-center gap-2 w-25 text-gray-500 md:w-29">
                  {info.icon}
                  <span className="text-16 md:text-18 flex-1 whitespace-nowrap">{info.title}</span>
                </dt>
                <dd className="text-16 md:text-18 overflow-ellipsis">{info.content}</dd>
              </div>
            ))}
          </dl>
        </div>
      </article>

      {/* 우측 메뉴 */}
     {/* 우측 메뉴 + 버튼 컨테이너 */}
      <div className="w-full md:w-[532px] flex flex-col gap-4">
        <nav
          className="w-full h-full flex flex-col justify-between items-center gap-4 md:grid md:grid-cols-2"
          aria-label="학교 관리 주요 메뉴"
        >
          <h2 className="sr-only">주요 관리 메뉴</h2>

          {/* 메뉴 리스트 */}
          {MENU_LIST.map((menu) => (
            <Link
              key={menu.id}
              href={`${pathname}/${menu.url}`}
              prefetch={false}
              shallow
              className="w-full flex flex-row justify-center gap-4 items-center bg-primary-200 px-6 py-6 shadow-dropdown rounded-xl md:flex-col md:gap-12 md:py-21 hover:bg-primary-300 hover:outline hover:outline-primary-700 focus:bg-primary-300 focus:outline-primary-700 active:bg-primary-300 active:outline-primary-700"
              aria-label={`${menu.title}의 ${menu.subTitle} 관리 페이지로 이동`}
            >
              <div className="flex flex-col md:flex-col-reverse items-center justify-center gap-0.5">
                <h3 className="text-20 md:text-22 text-gray-900 font-semibold">{menu.title}</h3>
                <p className="text-14 md:text-16 text-gray-600 font-semibold text-center">{menu.subTitle}</p>
              </div>
              <div className="relative flex justify-center items-center w-20 h-20 md:w-[120px] md:h-[120px]">
                <Image
                  src={menu.img_url}
                  alt={menu.title}
                  fill
                  priority
                  sizes="(max-width: 768px) 80px, 120px"
                  className="object-contain"
                />
              </div>
            </Link>
          ))}
        </nav>

        {/* 우측 메뉴 아래 버튼 */}
          <Link href={`/student/${school.id}`}>
            <Button className="w-full bg-white text-gray-900 font-semibold px-6 py-3 rounded-xl shadow hover:shadow-lg transition">
              앨범 페이지로 이동
            </Button>
          </Link>
      </div>
    </section>
  );
}