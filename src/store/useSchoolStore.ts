import { supabase } from '@/utils/supabase/client';
import { create } from 'zustand';

// import { createJSONStorage, persist } from 'zustand/middleware';

interface SchoolTable {
  id?: string;
  school_name?: string;
  school_name_en?: string;
  graduation_year?: string;
  school_img_url?: File | string | null;
  manager_name?: string;
  manager_email?: string;
  manager_contact?: string;
  created_at?: string;
  updated_at?: string;
}

interface SchoolStore {
  school: SchoolTable | null;
  isLoading: boolean;
  fetchSchool: (useId: string) => Promise<void>;
  addSchool: (data: SchoolTable, userId: string) => Promise<void>;
  editSchool: (data: SchoolTable, userId: string) => Promise<void>;
}

export const useSchoolStore = create<SchoolStore>()((set) => ({
  school: null,
  isLoading: false,

  // 학교 불러오기
  fetchSchool: async (userId) => {
    set({ isLoading: true });

    try {
      // * user테이블에서 user_type과 school_id 가져오기
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('user_type, school_id')
        .eq('id', userId)
        .single();
      if (userError) throw userError;

      // * 실제로 조회할 학교 ID결정
      let targetSchoolId;

      if (user?.user_type === 'student' || user?.user_type === 'admin') {
        targetSchoolId = user?.school_id;
      } else {
        targetSchoolId = userId;
      }

      if (!targetSchoolId) throw new Error('학교 ID를 찾을 수 없습니다.');

      // * schools 테이블에서 학교 데이터 가져오기
      const { data: school, error: schoolError } = await supabase
        .from('schools')
        .select('*')
        .eq('id', targetSchoolId)
        .single();
      if (schoolError) throw schoolError;

      set({ school, isLoading: false });
      
    } catch (error) {
      console.error('학교 데이터를 가져오는 중 오류:', error);
      set({ school: null, isLoading: false });
    } finally {
      set({ isLoading: false });
    }
  },
  // 학교 추가하기
  addSchool: async (data, userId) => {
    try {
      // 1️⃣ schools insert + id 받기
      const { data: insertedSchool, error: schoolError } = await supabase
        .from('schools')
        .insert([
          {
            school_name: data.school_name,
            school_name_en: data.school_name_en,
            graduation_year: data.graduation_year,
            school_img_url: data.school_img_url,
            manager_name: data.manager_name,
            manager_email: data.manager_email,
            manager_contact: data.manager_contact
          }
        ])
        .select()
        .single();

      if (schoolError) throw schoolError;

      const schoolId = insertedSchool.id; // 👈 핵심

      // 2️⃣ users 테이블에 school_id 업데이트
      const { error: userError } = await supabase
        .from('users')
        .update({ 
          school_id: schoolId, // 👈 여기 추가
          school_name_en: data.school_name_en 
        })
        .eq('id', userId);

      if (userError) throw userError;

      // 3️⃣ 상태 업데이트도 실제 schoolId로
      set({ 
        school: { 
          ...(data as SchoolTable), 
          id: schoolId // ❗ userId 아니고 schoolId
        } 
      });

    } catch (error) {
      console.error('학교 추가 중 오류가 발생했습니다. : ', error);
    }
  },
  // 학교 수정하기
  editSchool: async (data, userId) => {
    try {

      const { data: user, error: userError } = await supabase
        .from('users')
        .select('user_type, school_id')
        .eq('id', userId)
        .single();
      if (userError) throw userError;

      const { error } = await supabase
        .from('schools')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', user.school_id);
      if (error) throw error;

      set((state) => ({
        school: state.school ? { ...state.school, ...data } : null,
      }));
    } catch (error) {
      console.error(error);
    }
  },
}));
