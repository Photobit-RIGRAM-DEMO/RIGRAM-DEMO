import type { Student } from '@/types/student';
import { supabase } from '@/utils/supabase/client';
import { create } from 'zustand';

interface StudentsState {
  student: Student | null;
  students: Student[];
  isLoading: boolean;
  error: string | null;
  fetchStudents: (departmentId: string) => Promise<void>;
  fetchStudentById: (studentId: string) => Promise<void>;
  addStudentProfile: (
    school_id: string,
    dept_id: string,
    name: string,
    name_en: string,
    profile_default: string | null,
    profile_graduate: string | null,
    email: string,
    phone: string,
    graduation_year: string
  ) => Promise<void>;
  updateStudentProfile: (
    studentId: string,
    updates: Partial<Omit<Student, 'id' | 'created_at'>>
  ) => Promise<Student | null>;
  deleteStudentProfile: (studentId: string) => Promise<boolean>;
}

export const useStudentStore = create<StudentsState>((set) => ({
  student: null,
  students: [],
  isLoading: false,
  error: null,

  // schoolId, departmentId를 사용한 students 불러오기
  fetchStudents: async (departmentId) => {
    set({ isLoading: true, error: null });

    const { data, error } = await supabase
      .from('students')
      .select('*')
      //.eq('school_id',school_id)
      .eq('dept_id', departmentId);

    if (error) {
      set({ isLoading: false, error: error.message });
    } else {
      set({ students: data || [], isLoading: false });
    }
  },

  // student의 id를 사용한 학생 불러오기
  fetchStudentById: async (studentId) => {
    set({ isLoading: true, error: null });

    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('id', studentId)
      .single();

    if (error) {
      set({ isLoading: false, error: error.message });
      return null;
    } else {
      set({ student: data, isLoading: false });
      return data;
    }
  },
  // student profile 추가
  addStudentProfile: async (
    schoolId,
    deptId,
    name,
    nameEn,
    profile_default: string | null,
    profile_graduate: string | null,
    email,
    phone,
    graduation_year
  ) => {
    const { data, error } = await supabase
      .from('students')
      .insert([
        {
          school_id: schoolId,
          dept_id: deptId,
          name,
          name_en: nameEn,
          profile_default,
          profile_graduate,
          email,
          phone,
          graduation_year,
        },
      ])
      .single();

    if (error) {
      console.error('학생 프로필을 추가하던 중 오류 발생:', error);
      set({ isLoading: false, error: error.message });
    } else if (data) {
      set((state) => ({
        students: [...state.students, data],
        isLoading: false,
      }));
    }
  },
  // student의 id를 사용한 내용 업데이트
  updateStudentProfile: async (studentId: string, updates: Partial<Student>) => {
    const { data, error } = await supabase
      .from('students')
      .update(updates)
      .eq('id', studentId)
      .select()
      .single();

    if (error) {
      console.error('학생 프로필을 수정하던 중 오류 발생:', error);
      set({ isLoading: false, error: error.message });
      return null;
    }
    if (data) {
      set((state) => ({
        students: state.students.map((student) =>
          student.id === studentId ? { ...student, ...data } : student
        ),
      }));
      return data;
    }
    return null;
  },
  deleteStudentProfile: async (studentId) => {
    set({ isLoading: false, error: null });

    try {
      const { data } = await supabase
        .from('students')
        .select('profile_default, profile_graduate')
        .eq('id', studentId)
        .single();

      /* Storage 파일 경로 추출 */
      const baseUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/student-profiles/`;
      const filePaths: string[] = [];

      const extractPath = (fullUrl?: string | null) => {
        if (!fullUrl) return null;
        if (!fullUrl.startsWith(baseUrl)) return null;
        return fullUrl.replace(baseUrl, '');
      };

      const defaultPath = extractPath(data?.profile_default);
      const graduatePath = extractPath(data?.profile_graduate);

      if (defaultPath) filePaths.push(defaultPath);
      if (graduatePath) filePaths.push(graduatePath);

      /* Storage에서 파일 삭제 */
      if (filePaths.length > 0) {
        const { error: storageError } = await supabase.storage
          .from('student-profiles')
          .remove(filePaths);
        if (storageError) console.warn('Storage 파일 삭제 중 오류:', storageError.message);
      } else {
        console.log('삭제할 파일이 없습니다. Storage 삭제를 건너뜁니다.');
      }

      /* DB에서 student row 삭제 */
      const { error } = await supabase.from('students').delete().eq('id', studentId);
      if (error) {
        console.error('학생 프로필을 삭제하던 중 오류 발생:', error);
        set({ isLoading: false, error: error.message });
        return false;
      }

      /* 상태 업데이트 */
      set((state) => ({
        students: state.students.filter((student) => student.id !== studentId),
        isLoading: false,
      }));

      return true;
    } catch (error) {
      console.error('졸업생 정보를 삭제하던 중 오류가 발생했습니다. :', error);
      set({ isLoading: false });
      return false;
    }
  },
}));
