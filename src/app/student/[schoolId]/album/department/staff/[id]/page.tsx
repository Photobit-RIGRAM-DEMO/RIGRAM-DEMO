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

  const { data: staffs } = await supabase
    .from('staffs')
    .select('*')
    .eq('id', id)
    .single()

return (
        <div className="w-full flex flex-col gap-8 items-center">

          <section className="w-full max-w-[1600px] mx-auto bg-white border border-border rounded-md p-5 md:p-10 shadow-dropdown transition"> 
            <div className="flex flex-col items-center gap-12">

              {/* 반응형 이미지 */}
              <div className="relative w-full max-w-[300px] sm:max-w-[500px] md:max-w-[700px] aspect-[4/3]">
                <Image
                  src={staffs.profile_url}
                  alt="교수"
                  fill
                  className="object-contain rounded-lg"
                  sizes="(max-width: 640px) 300px, (max-width: 768px) 500px, 700px"
                />
              </div>

              <h1 className="text-xl md:text-2xl font-bold">{staffs.name} 교수</h1>
            </div>
          </section>
        </div>
  )
}