import { createClient } from '@/utils/supabase/server'
import Link from "next/link";
import Image from "next/image";


export default async function DepartmentPage({
  params,
}: {
  params: Promise<{ foregroundId: string }>
}) {
  const { foregroundId } = await params

  const supabase = await createClient()

  const { data: foreground } = await supabase
    .from('foreground')
    .select('*')
    .eq('id', foregroundId)
    .single()

return (
<div className="w-full flex flex-col items-center gap-8 px-4 md:px-10">
  {/* 이미지 영역 */}
  <div className="w-full max-w-[1600px] mx-auto relative overflow-hidden rounded-lg">
    {foreground.url && (
      <Image
        src={foreground.url}
        alt="배경"
        width={1600}    // 고정된 너비 설정
        height={500}    // 고정된 높이 설정 (적절하게 조정)
        className="object-cover"  // 부모 크기에 맞게 채워짐
        sizes="(max-width: 640px) 100vw, (max-width: 768px) 100vw, 1600px"
      />
    )}
  </div>

  {/* 바텀 영역 */}
  <footer className="w-full max-w-[1200px] mx-auto bg-gray-100 border-t border-border py-6 flex justify-end px-4 rounded-md transition">
    <p className="text-sm md:text-base text-gray-600">&copy; 2026 RIGRAM. All rights reserved.</p>
  </footer>
</div>
  )
}