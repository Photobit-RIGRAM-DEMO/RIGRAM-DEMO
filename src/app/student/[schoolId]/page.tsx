import { createClient } from '@/utils/supabase/server'
import Link from 'next/link';
import Image from "next/image";

export default async function UsersPage() {
      const supabase = await createClient()

        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          return <div>로그인 안됨</div>
        }

        const { data: userId } = await supabase
        .from('users')
        .select(`*`)
        .eq('id', user.id)
        .single()

        const { data: school } = await supabase
        .from('schools')
        .select('*')
        .eq('id', userId.school_id)
        .single()

        const { data: foreground } = await supabase
        .from('foreground')
        .select('*')
        .eq('school_id', userId.school_id)
        .single()

        const { data: histories } = await supabase
        .from('history')
        .select('*')
        .eq('school_id', userId.school_id)

        const { data: chairman } = await supabase
        .from('executive')
        .select('*')
        .eq('school_id', userId.school_id)
        .eq('position', "chairman")
        .single()

        const { data: president } = await supabase
        .from('executive')
        .select('*')
        .eq('school_id', userId.school_id)
        .eq('position', "president")
        .single()

        const { data: scp } = await supabase
        .from('executive')
        .select('*')
        .eq('school_id', userId.school_id)
        .eq('position', "scp")
        .single()
        

        const { data: departments, error } = await supabase
        .from('departments')
        .select('*')

        if (error) {
        console.error(error)
        }
    

  return (
<div className="w-full max-w-[640px] sm:max-w-[768px] md:max-w-[1024px] lg:max-w-[1280px] xl:max-w-[1600px] mx-auto flex flex-col gap-8">

  {/* 블록 1 */}
  <section className="w-full px-4 md:px-10 py-6">
    <div className="flex justify-center">
      <div className="flex items-center gap-4">
        <div className="relative w-[60px] h-[60px] md:w-[80px] md:h-[80px] rounded-xl overflow-hidden">
          {school.school_img_url && (
            <Image
              src={school.school_img_url}
              alt="학교 이미지"
              fill
              className="object-cover"
            />
          )}
        </div>

        <h1 className="text-base md:text-xl font-semibold text-center">
          {school.school_name} 졸업앨범 2026
        </h1>
      </div>
    </div>
  </section>

  {/* 블록 2 (가장 중요) */}
<section className="w-full px-2 md:px-4">
  <Link href={`/foreground/${foreground.id}`}>
    <div className="group w-full max-w-[1600px] mx-auto aspect-[4/1] relative rounded-lg overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_25px_rgba(0,0,0,0.18)]">
      
      {foreground.url && (
        <Image
          src={foreground.url}
          alt="배경"
          fill
          className="object-cover"
        />
      )}

    </div>
  </Link>
</section>

  {/* 블록 3 */}
<section className="w-full px-4 flex justify-center">
  <div className="w-full max-w-[1600px] aspect-[20/1] relative overflow-hidden rounded-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_5px_15px_rgba(0,0,0,0.15)]">
    
    {histories?.[0] && (
      <>
      <Link href={`/history/${userId.school_id}`}>
        <Image
          src={histories[0].background_url}
          alt="연혁"
          fill
          className="object-cover"
        />
        
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white text-lg md:text-2xl font-semibold">
            연혁
          </span>
        </div>
        </Link>
      </>
    )}
    
  </div>
</section>

  {/* 블록 4 */}
<section className="w-full max-w-[1600px] mx-auto bg-white border border-border rounded-md p-5 md:p-10 shadow-dropdown transition">
  <div className="grid grid-cols-1 gap-10">

    {/* 이사장 */}
<Link href={`/executive/${chairman.id}`}>
  <div className="flex flex-col items-center gap-3"> {/* gap-0 → gap-3 */}
    <h1 className="text-lg md:text-xl font-semibold mb-2">이사장</h1>

    <div className="transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_25px_rgba(0,0,0,0.15)] rounded-lg overflow-hidden">
      <Image
        src={chairman.profile_url}
        alt="이사장"
        width={1144}
        height={643}  // 16:9 비율
        className="object-contain rounded-lg"
        sizes="(max-width: 640px) 312px, (max-width: 768px) 520px, 1144px"
      />
    </div>
  </div>
</Link>

{/* 총장 */}
<Link href={`/executive/${president.id}`}>
  <div className="flex flex-col items-center gap-3"> {/* gap-0 → gap-3 */}
    <h1 className="text-lg md:text-xl font-semibold mb-2">총장</h1>

    <div className="transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_25px_rgba(0,0,0,0.15)] rounded-lg overflow-hidden">
      <Image
        src={president.profile_url}
        alt="총장"
        width={1144}
        height={643}  // 16:9 비율
        className="object-contain rounded-lg"
        sizes="(max-width: 640px) 312px, (max-width: 768px) 520px, 1144px"
      />
    </div>
  </div>
</Link>

    {/* 총학생회장 */}
<Link href={`/executive/${scp.id}`}>
  <div className="flex flex-col items-center gap-4">
    <h1 className="text-lg md:text-xl font-semibold">총학생회장</h1>

    <div className="transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_25px_rgba(0,0,0,0.15)] rounded-lg overflow-hidden
                    w-full max-w-[466px] sm:max-w-[333px] md:max-w-[466px]">
      <Image
        src={scp.profile_url}
        alt="총학생회장"
        width={466}
        height={350}  // 4:3 비율
        className="object-contain rounded-lg"
        sizes="(max-width: 640px) 222px, (max-width: 768px) 333px, 466px"
      />
    </div>
  </div>
</Link>

  </div>
</section>
    {/* 행정직원 블록 */}
    <section
      className="w-full max-w-[1600px] mx-auto bg-white border border-border rounded-md p-4 flex justify-center transition">
      <h1 className="text-lg md:text-xl font-semibold">행정직원</h1>
    </section>

    {/* 학과 블록 */}
    <section className="w-full max-w-[1600px] mx-auto bg-white border border-border rounded-md p-5 md:p-10 shadow-dropdown transition">
      <div className="flex flex-col gap-5">
        <h1 className="text-lg md:text-xl font-semibold">학과</h1>

        <ul className="grid grid-cols-1 gap-3">
          {departments?.map((department) => (
            <li key={department.id}>
              <Link href={`/department/${department.id}`} className="block p-4 border border-border rounded-md hover:outline hover:outline-primary-700 transition">
                {department.name}
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