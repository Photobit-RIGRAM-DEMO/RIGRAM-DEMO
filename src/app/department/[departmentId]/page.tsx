import { createClient } from '@/utils/supabase/server'
import Link from "next/link";
import Image from "next/image";


export default async function DepartmentPage({
  params,
}: {
  params: Promise<{ departmentId: string }>
}) {
  const { departmentId } = await params

  const supabase = await createClient()

    // staffs 중 departmentId 같은 것
  const { data: department } = await supabase
    .from('departments')
    .select('*')
    .eq('id', departmentId)
    .single()

  // staffs 중 departmentId 같은 것
  const { data: staffs } = await supabase
    .from('staffs')
    .select('*')
    .eq('department_id', departmentId)

  // students 중 departmentId 같은 것
  const { data: students } = await supabase
    .from('students')
    .select('*')
    .eq('dept_id', departmentId)

return (
    <div className="w-full flex flex-col items-center gap-8 px-4 md:px-10">

<section className="w-full max-w-[1200px] bg-white border border-border rounded-md p-5 md:p-10 shadow-dropdown transition">
  <div className="flex flex-col gap-5">
    <header className="flex justify-center items-center">
      <h1 className="text-18 md:text-20 font-semibold">{department?.name}</h1>
    </header>
  </div>
</section>

      {/* 교수진 */}
      <section className="w-full max-w-[1200px] bg-white border border-border rounded-md p-5 md:p-10 shadow-dropdown transition">
        <div className="flex flex-col gap-5">
          <header className="flex justify-center items-center">
            <h1 className="text-18 md:text-20 font-semibold">교수진</h1>
          </header>

          <ul className="grid grid-cols-1 gap-4" role="list">
            {staffs?.map((staff) => (
              <li key={staff.id}>
                <Link
                  href={`/department/staff/${staff.id}`}
                  className="block p-4 border border-border rounded-md hover:outline hover:outline-primary-700 transition"
                  aria-label={`${staff.name} 상세 페이지로 이동`}
                >
                  <div className="flex flex-row items-center gap-4">
                    {staff.profile_url && (
                      <div className="relative w-32 h-32 rounded overflow-hidden flex-shrink-0">
                        <Image
                          src={staff.profile_url}
                          alt={`${staff.name} 이미지`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <span className="font-medium text-lg">교수 {staff.name}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 졸업생 */}
      <section className="w-full max-w-[1200px] bg-white border border-border rounded-md p-5 md:p-10 shadow-dropdown transition">
        <div className="flex flex-col gap-5">
          <header className="flex justify-center items-center">
            <h1 className="text-18 md:text-20 font-semibold">졸업생</h1>
          </header>

          <ul className="grid grid-cols-1 gap-4" role="list">
            {students?.map((student) => (
              <li key={student.id}>
                <Link
                  href={`/department/student/${student.id}`}
                  className="block p-4 border border-border rounded-md text-center hover:outline hover:outline-primary-700 transition"
                  aria-label={`${student.name} 상세 페이지로 이동`}
                >
                  {student.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 실습사진 */}
      <section className="w-full max-w-[1200px] bg-white border border-border rounded-md p-5 md:p-10 shadow-dropdown transition">
        <div className="flex flex-col gap-5">
          <header className="flex justify-center items-center">
            <h1 className="text-18 md:text-20 font-semibold">실습사진</h1>
          </header>
          {/* 사진 콘텐츠 여기에 추가 */}
        </div>
      </section>

      {/* 축제영상 */}
      <section className="w-full max-w-[1200px] bg-white border border-border rounded-md p-5 md:p-10 shadow-dropdown transition">
        <div className="flex flex-col gap-5">
          <header className="flex justify-center items-center">
            <h1 className="text-18 md:text-20 font-semibold">축제영상</h1>
          </header>
          {/* 영상 콘텐츠 여기에 추가 */}
        </div>
      </section>

      {/* 바텀 영역 */}
      <footer className="w-full max-w-[1200px] mx-auto bg-gray-100 border-t border-border py-6 flex justify-end px-4 rounded-md transition hover:outline hover:outline-primary-700">
        <p className="text-sm md:text-base text-gray-600">&copy; 2026 RIGRAM. All rights reserved.</p>
      </footer>

    </div>
  )
}