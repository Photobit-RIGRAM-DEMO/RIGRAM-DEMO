import { createClient } from '@/utils/supabase/server'
import Link from "next/link";
import Image from "next/image";


export default async function DepartmentPage({
  params,
}: {
  params: Promise<{ schoolId: string }>
}) {
  const { schoolId } = await params

  const supabase = await createClient()

  const { data: histories } = await supabase
    .from('history')
    .select('*')
    .eq('school_id', schoolId)
    .order('date', { ascending: false });

return (
<div className="w-full flex flex-col items-center gap-8 px-4 md:px-10 mt-6">

    <span className="text-gray-900 text-lg md:text-2xl font-semibold">
      연혁
    </span>
        
  {/* ul 바로 flex-col 안에 배치 */}
<ul className="flex flex-col gap-6 w-full max-w-[700px]" role="list">
  {histories?.map((history) => (
    <li
      key={history.id}
      className="flex flex-col sm:flex-row items-start gap-6 p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 ease-in-out"
    >
      {/* 이미지 */}
      <div className="relative w-full sm:w-[159px] md:w-[200px] aspect-[4/3] rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
        {history.background_url ? (
          <Image
            src={history.background_url}
            alt="배경"
            fill
            className="object-cover transition-transform duration-300 ease-in-out hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 159px, 200px"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded">
            이미지 없음
          </div>
        )}
      </div>

      {/* 텍스트 */}
      <div className="flex flex-col justify-center items-start gap-2 w-full text-left">
        {/* title */}
        <span className="text-gray-900 text-lg md:text-2xl font-semibold">
          {history.title}
        </span>

        {/* date */}
        <span className="text-gray-500 text-base md:text-lg">
          {history.date}
        </span>

        {/* description */}
        <span className="text-gray-600 text-base md:text-lg">
          {history.description}
        </span>
      </div>
    </li>
  ))}
</ul>

  {/* 바텀 영역 */}
  <footer className="w-full max-w-[1200px] mx-auto bg-gray-50 border-t border-gray-200 py-6 flex justify-end px-4 rounded-md transition">
    <p className="text-sm md:text-base text-gray-500">&copy; 2026 RIGRAM. All rights reserved.</p>
  </footer>
</div>


  )
}