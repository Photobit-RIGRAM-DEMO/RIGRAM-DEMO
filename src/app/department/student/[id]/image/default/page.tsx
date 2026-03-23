import { createClient } from '@/utils/supabase/server'
import Link from "next/link";
import Image from "next/image";

export default async function DepartmentPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const supabase = await createClient()

  const { data: students } = await supabase
    .from('students')
    .select('*')
    .eq('id', id)

return (
<div className="w-full flex flex-col gap-8 items-center">

<section className="w-full max-w-[1600px] mx-auto bg-white border border-border rounded-md p-5 md:p-10 shadow-dropdown transition"> 
  <div className="flex flex-col items-center gap-12">

    {/* 반응형 이미지 1.3배 확대 */}
    <div className="relative w-full max-w-[390px] sm:max-w-[650px] md:max-w-[910px] aspect-[4/3]">
      {students?.[0]?.profile_default && (
        <Image
          src={students[0].profile_default}
          alt="증명사진"
          fill
          sizes="(max-width: 640px) 390px, (max-width: 768px) 650px, 910px"
          className="object-contain"
        />
      )}
    </div>

    {/* 학생 이름 */}
    <h1 className="text-xl md:text-2xl font-bold">{students?.[0]?.name}</h1>

  </div>
</section>
</div>
  )
}