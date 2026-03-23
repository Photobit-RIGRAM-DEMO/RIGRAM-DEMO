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

      {/* 이미지 영역 */}
<div className="flex gap-4 flex-wrap justify-center">

  <Link href={`/department/student/${students?.[0]?.id}/image/graduate`}>
    <div className="relative w-[325px] sm:w-[390px] md:w-[494px] aspect-square rounded-xl overflow-hidden transition-shadow duration-300 hover:shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
      {students?.[0]?.profile_graduate && (
        <div className="w-full h-full transition-transform duration-300 hover:-translate-y-1">
          <Image
            src={students[0].profile_graduate}
            alt="증명사진"
            fill
            className="object-cover w-full h-full"
            sizes="(max-width: 640px) 325px, (max-width: 768px) 390px, 494px"
          />
        </div>
      )}
    </div>
  </Link>

  <Link href={`/department/student/${students?.[0]?.id}/image/default`}>
    <div className="relative w-[325px] sm:w-[390px] md:w-[494px] aspect-square rounded-xl overflow-hidden transition-shadow duration-300 hover:shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
      {students?.[0]?.profile_default && (
        <div className="w-full h-full transition-transform duration-300 hover:-translate-y-1">
          <Image
            src={students[0].profile_default}
            alt="증명사진"
            fill
            className="object-cover w-full h-full"
            sizes="(max-width: 640px) 325px, (max-width: 768px) 390px, 494px"
          />
        </div>
      )}
    </div>
  </Link>

</div>

      {/* 이름 */}
      <h1 className="text-xl md:text-2xl font-bold">{students?.[0]?.name}</h1>
    </div>
  </section>
</div>

  )
}