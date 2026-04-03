import { create } from "zustand";
import { supabase } from '@/utils/supabase/client';

type Department = {
  id: string;
  name: string;
};

type College = {
  id: string;
  name: string;
  departments: Department[];
};

type Store = {
  colleges: College[];
  setColleges: (colleges: College[]) => void;
};

export const useDepartmentsStore = create<Store>((set) => ({
  colleges: [],

  setColleges: (colleges) =>
    set(() => ({
      colleges,
    })),
}));

