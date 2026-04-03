import { supabase } from '@/utils/supabase/client';
import { create } from 'zustand';

// import { createJSONStorage, persist } from 'zustand/middleware';

interface UserTable {
  id?: string;
  school_id?: string;
  school_name_en?: string;
  user_type?: string;
  user_email?: string;
  created_at?: string;
}

interface UserStore {
  user: UserTable | null;
  isLoading: boolean;
  fetchUser: (userId: string) => Promise<void>;
}

export const useUserStore = create<UserStore>()((set) => ({
  user: null,
  isLoading: false,

  // 사용자 불러오기
  fetchUser: async (userId) => {
    set({ isLoading: true });

    try {
      // * user테이블에서 user_type과 school_id 가져오기
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      if (userError) throw userError;

      set({ user, isLoading: false });
    } catch (error) {
      console.error('유저 데이터를 가져오는 중 오류:', error);
      set({ user: null, isLoading: false });
    } finally {
      set({ isLoading: false });
    }
  },
}));
