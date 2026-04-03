'use client';

import { supabase } from '@/utils/supabase/client';
import Link from 'next/link';
import Image from "next/image";
import { useSchoolStore } from '@/store/useSchoolStore';
import { useUserStore } from '@/store/userUserStore';
import { useCallback, useEffect, useState} from 'react';
import { get } from 'http';
import { useForegroundStore } from '@/store/useForegroundStore';
import { useHistoryStore } from '@/store/useHistoryStore';
import { useExecutiveStore } from '@/store/useExecutive';
import { useCollegeStore } from '@/store/useCollegeStore';
import { useDepartmentStore } from '@/store/useDepartmentStore';
import { useDepartmentsStore } from '@/store/useDepartmentsStore';
import { fetchCollegesWithDepartments } from '@/app/api/college/colleges';

interface Department {
  id: string;
  name: string;
  college_id: string;
}

export default function AlbumPage() {

    const fetchUser = useUserStore((state) => state.fetchUser);
    const user = useUserStore((state) => state.user);

    const fetchSchool = useSchoolStore((state) => state.fetchSchool);
    const isLoading = useSchoolStore((state) => state.isLoading);
    const school = useSchoolStore((state) => state.school);

    const fetchForegroundList = useForegroundStore((state) => state.fetchForegroundList);
    const foregroundList = useForegroundStore((state) => state.foregroundList);

    const fetchHistory = useHistoryStore((state) => state.fetchHistories);
    const histories = useHistoryStore((state) => state.histories);

    const fetchExecutives = useExecutiveStore((state) => state.fetchExecutives);
    const executives = useExecutiveStore((state) => state.executives);

    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);

    const getAuthData = useCallback(async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) return console.error(error);
        const user = data?.session?.user;
        if (!user) return;
        if (user) {
          await fetchUser(user.id);
          await fetchSchool(user.id);
        }
      } catch (err) {
        console.error(err);
      }
    }, [fetchSchool, fetchUser]);

    useEffect(() => {
      if (!school) return;
        getAuthData();
      
        const run = async () => {
          await fetchForegroundList(school.id ?? "");
          await fetchHistory(school.id ?? "");
          await fetchExecutives(school.id ?? "");

          await fetchCollegesWithDepartments(school.id ?? "").then((data) => {
            setDepartments(data || []);
            setLoading(false);
          });
        };

        run();

    }, [getAuthData, school]);

    

  return (
<div className="w-full max-w-[640px] sm:max-w-[768px] md:max-w-[1024px] lg:max-w-[1280px] xl:max-w-[1600px] mx-auto flex flex-col gap-8">
  <section className="w-full px-4 md:px-10 py-6">
    {user?.user_type === 'admin' && (
    <Link
      href={`/admin//${school?.id}`}
      className="mt-4 w-full max-w-[1600px] mx-auto block bg-white text-gray-900 font-semibold px-6 py-3 rounded-xl shadow hover:shadow-lg transition text-center"
    >
      관리 페이지로 이동
    </Link>
    )}
  </section>


  {/* 블록 1 */}
  <section className="w-full px-4 md:px-10 py-6">
    <div className="flex justify-center">
      <div className="flex items-center gap-4">
        <div className="relative w-[60px] h-[60px] md:w-[80px] md:h-[80px] rounded-xl overflow-hidden">
          {school?.school_img_url && (
            <Image
              src={school?.school_img_url as string}
              alt="학교 이미지"
              fill
              className="object-cover"
            />
          )}
        </div>

        <h1 className="text-base md:text-xl font-semibold text-center">
          {school?.school_name} 졸업앨범 2026
        </h1>
      </div>
    </div>
  </section>

  {/* 블록 2 (가장 중요) */}
<section className="w-full px-2 md:px-4">
  <div className="w-full max-w-[1600px] mx-auto aspect-[4/1] relative rounded-lg overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_25px_rgba(0,0,0,0.18)]">
    
    {foregroundList[0]?.url ? (
      <Link href={`/student/${school?.id}/album/foreground/${foregroundList[0].id}`}>
        {/* 배경 이미지 */}
        <Image
          src={foregroundList[0].url}
          alt="배경"
          fill
          className="object-cover z-0"
        />
      </Link>
    ) : (
      // 이미지가 없는 경우 대체 UI
      <div className="w-full h-full flex items-center justify-center bg-gray-200 rounded-lg">
        <span className="text-gray-500 text-lg md:text-2xl font-semibold">
          전경 이미지 없음
        </span>
      </div>
    )}

  </div>
</section>

  {/* 블록 3 */}
<section className="w-full px-4 flex justify-center">
  <div className="w-full max-w-[1600px] aspect-[20/1] relative overflow-hidden rounded-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_5px_15px_rgba(0,0,0,0.15)]">
    
    {histories?.[0]?.background_url ? (
      <Link href={`/student/${school?.id}/album/history/${school?.id}`}>
        {/* 배경 이미지 */}
        <Image
          src={histories[0].background_url}
          alt="연혁"
          fill
          className="object-cover z-0"
        />

        {/* 글자 레이어 */}
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <span className="text-black text-lg md:text-2xl font-semibold">
            연혁
          </span>
        </div>
      </Link>
    ) : (
      // 이미지가 없는 경우 대체 UI
      <div className="w-full h-full flex items-center justify-center bg-gray-200 rounded-lg">
        <span className="text-gray-500 text-lg md:text-2xl font-semibold">
          연혁 이미지 없음
        </span>
      </div>
    )}
    
  </div>
</section>

  {/* 블록 4 */}
<section className="w-full max-w-[1600px] mx-auto bg-white border border-border rounded-md p-5 md:p-10 shadow-dropdown transition">
  <div className="flex flex-col gap-6">
    {executives?.map((executive) => (
      <Link key={executive.id} href={`/student/${school?.id}/album/executive/${executive.id}`}>
        <div className="flex flex-col items-center gap-3 cursor-pointer">
          <div className="w-full bg-gray-50 border-y border-gray-100">
            <div className="px-5 md:px-10 py-4">
              <h1 className="text-base md:text-lg font-semibold text-gray-800 pl-4 border-l-4 border-gray-800">
                {executive.position}
              </h1>
            </div>
          </div>

          <div className="transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_25px_rgba(0,0,0,0.15)] rounded-lg overflow-hidden">
            <Image
              src={executive.profile_url as string}
              alt={executive.position}
              width={1144}
              height={643}
              className="object-contain rounded-lg"
            />
          </div>
        </div>
      </Link>
    ))}
  </div>
</section>

    {/* 학과 블록 */}
   <section className="w-full max-w-[1600px] mx-auto bg-white border border-border rounded-md p-5 md:p-10 shadow-dropdown transition">
      <div className="flex flex-col gap-5">
        <div className="w-full bg-gray-50 border-y border-gray-100">
          <div className="px-5 md:px-10 py-4">
            <h1 className="text-base md:text-lg font-semibold text-gray-800 pl-4 border-l-4 border-gray-800">
             학과별 졸업사진
            </h1>
          </div>
        </div>

        <ul className="flex flex-col gap-3">
          {departments?.map((college) => (
            <li key={college.id}>
              <Link
                href={`/student/${school?.id}/album/department/${college.id}`}
                className="block p-4 border-l-4 border-gray-500 rounded-xl bg-gray-50 text-gray-900 transition-all duration-300 hover:border-gray-700 hover:shadow-md"
              >
                {college.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>

    <footer className="w-full bg-gray-100 border-t border-border py-6 md:py-10">
      <div className="w-full max-w-[1600px] mx-auto flex justify-end px-4">
        {/* 오른쪽: 회사/학교 이름 */}
         <p className="text-sm md:text-base text-gray-600">&copy; 2026 RIGRAM. All rights reserved.</p>
      </div> 
     </footer> 

   </div> 
  )
}