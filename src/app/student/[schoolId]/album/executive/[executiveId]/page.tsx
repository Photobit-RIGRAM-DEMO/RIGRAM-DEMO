import { createClient } from '@/utils/supabase/server'
import Link from "next/link";
import Image from "next/image";


export default async function DepartmentPage({
  params,
}: {
  params: Promise<{ executiveId: string }>
}) {
  const { executiveId } = await params

  const supabase = await createClient()

  // staffs 중 departmentId 같은 것
  const { data: executive } = await supabase
    .from('executive')
    .select('*')
    .eq('id', executiveId)
    .single()

return (
    <div className="w-full flex flex-col items-center gap-8 px-4 md:px-10">

      <div className="relative w-full max-w-[1430px] sm:max-w-[1170px] md:max-w-[1430px] aspect-[16/9]">
        <Image
          src={executive.profile_url}
          alt="임원진"
          fill
          className="object-contain rounded-lg"
          sizes="(max-width: 640px) 390px, (max-width: 768px) 650px, 1430px"
        />
      </div>

      <h1 className="text-2xl md:text-2xl font-bold">{executive.name}</h1>

      {/* 바텀 영역 */}
      <footer className="w-full max-w-[1200px] mx-auto bg-gray-100 border-t border-border py-6 flex justify-end px-4 rounded-md transition">
        <p className="text-sm md:text-base text-gray-600">&copy; 2026 RIGRAM. All rights reserved.</p>
      </footer>

    </div>
  )
}