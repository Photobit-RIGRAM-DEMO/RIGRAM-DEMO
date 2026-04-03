import { createClient } from '@/utils/supabase/server'

export default async function UsersPage() {
  const supabase = await createClient()

  const [departmentsResult, users1Result, users2Result] = await Promise.all([
    supabase.from('departments').select('*'),
    supabase.from('staffs').select('*'),
    supabase.from('students').select('*'),
  ])

  const { data: departments, error: deptError } = departmentsResult
  const { data: users1, error: users1Error } = users1Result
  const { data: users2, error: users2Error } = users2Result

  if (deptError) console.error('departments error:', deptError)
  if (users1Error) console.error('users1 error:', users1Error)
  if (users2Error) console.error('users2 error:', users2Error)

   return (
    <div className="w-full flex flex-col gap-8">

      <section className="relative w-full max-w-screen-xl mx-auto bg-white border border-border p-5 rounded-xl shadow-dropdown md:p-10">
        <div className="flex flex-col gap-5">
          <header className="flex justify-between items-center">
            <h1 className="text-18 md:text-20 font-semibold">교수진</h1>
          </header>
          
          <ul className="flex flex-col gap-2">
            {users1?.map((user) => (
              <li key={user.id} className="p-2 border border-border rounded flex flex-col">
                
                {/* 이름 */}
                <span className="font-medium">{user.name}</span>

                {/* URL */}
                {user.url && (
                  <a 
                    href={user.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {user.url}
                  </a>
                )}

              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="relative w-full max-w-screen-xl mx-auto bg-white border border-border p-5 rounded-xl shadow-dropdown md:p-10">
        <div className="flex flex-col gap-5">
          <header className="flex justify-between items-center">
            <h1 className="text-18 md:text-20 font-semibold">졸업생</h1>
          </header>
          <ul className="flex flex-col gap-2">
            {users2?.map((users2) => (
              <li key={users2.id} className="p-2 border border-border rounded">{users2.name}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="relative w-full max-w-screen-xl mx-auto bg-white border border-border p-5 rounded-xl shadow-dropdown md:p-10">
        <div className="flex flex-col gap-5">
          <header className="flex justify-between items-center">
            <h1 className="text-18 md:text-20 font-semibold">실습사진</h1>
          </header>
        </div>
      </section>

      <section className="relative w-full max-w-screen-xl mx-auto bg-white border border-border p-5 rounded-xl shadow-dropdown md:p-10">
        <div className="flex flex-col gap-5">
          <header className="flex justify-between items-center">
            <h1 className="text-18 md:text-20 font-semibold">축제영상</h1>
          </header>
        </div>
      </section>

    </div>
  )
}