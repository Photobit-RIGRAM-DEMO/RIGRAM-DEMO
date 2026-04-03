// /api/colleges.ts
import { supabase } from '@/utils/supabase/client';

export const fetchCollegesWithDepartments = async (schoolId: string) => {

    
        const { data: colleges } = await supabase
        .from('colleges')
        .select('*')
        .eq('school_id', schoolId)

        const collegeIds = colleges?.map(c => c.id) ?? [];

        const { data: departments, error } = await supabase
        .from('departments')
        .select('*')
        .in('college_id', collegeIds);

        if (error) {
        console.error(error)
        }

  return departments;
};