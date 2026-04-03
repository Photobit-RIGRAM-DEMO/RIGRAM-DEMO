'use client';

import Badge from '@/components/badge';
import Button from '@/components/button';
import FileInput from '@/components/fileInput';
import Input from '@/components/input';
import PageHeader from '@/components/pageHeader';
import { useDepartmentStore } from '@/store/useDepartmentStore';
import { useSchoolStore } from '@/store/useSchoolStore';
import { useStaffStore } from '@/store/useStaffStore';
import { supabase } from '@/utils/supabase/client';
import { Asterisk } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { transliterate } from 'transliteration';

export default function StaffAddPage() {
  const router = useRouter();
  const pathname = usePathname();
  const segments = useMemo(() => pathname.split('/').filter(Boolean), [pathname]);
  const schoolId = segments[1];
  const departmentId = segments[3];

  const [deptNameEn, setDeptNameEn] = useState('');
  const [category, setCategory] = useState(''); // 텍스트 입력으로 변경
  const [name, setName] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);

  const addStaffProfile = useStaffStore((state) => state.addStaffProfile);
  const school = useSchoolStore((state) => state.school);
  const schoolNameEn = school?.school_name_en || '';
  const fetchDepartmentById = useDepartmentStore((state) => state.fetchDepartmentById);

  const slugify = (text: string) =>
    transliterate(text) // 👈 한글 → 영어 변환
      .toLowerCase()
      .trim()
      .replace(/[\s\W-]+/g, '-');

  // 부서 정보 로드
  useEffect(() => {
    if (!departmentId) return;

    const loadDepartment = async () => {
      try {
        const dept = await fetchDepartmentById(departmentId);
        if (dept?.name_en) setDeptNameEn(dept.name_en);
      } catch (error) {
        console.error('Department 조회 실패:', error);
      }
    };

    loadDepartment();
  }, [departmentId, fetchDepartmentById]);

  // 파일 업로드
  const uploadFile = useCallback(
    async (file: File, folder: string) => {
      const schoolName = slugify(schoolNameEn);
      const departmentName = slugify(deptNameEn);

      // 파일명 slugify
      const fileExt = file.name.split('.').pop();
      const baseName = file.name.replace(/\.[^/.]+$/, '');
      const safeFileName = `${slugify(baseName)}.${fileExt}`;

      const filePath = `${schoolName}/${departmentName}/${slugify(folder)}/${safeFileName}`;

      const { error } = await supabase.storage
        .from('staff-profiles')
        .upload(filePath, file, { upsert: true });

      if (error) {
        console.error('프로필 업로드 실패:', error.message);
        alert('프로필 업로드 중 오류가 발생했습니다.');
        return null;
      }

      const { data } = supabase.storage.from('staff-profiles').getPublicUrl(filePath);
      return data.publicUrl ?? null;
    },
    [schoolNameEn, deptNameEn]
  );

  // 교직원 추가
  const handleAddProfile = useCallback(
    () => async () => {
      if (!category.trim()) {
        alert('카테고리를 입력해 주세요.');
        return;
      }
      if (!name.trim()) {
        alert('이름을 입력해 주세요.');
        return;
      }
      if (!mediaFile) {
        alert('프로필 이미지를 업로드해 주세요.');
        return;
      }

      try {
        const mediaUrl = await uploadFile(mediaFile, category);
        if (!mediaUrl) return;

        await addStaffProfile(schoolId, departmentId, name, category, mediaUrl);

        alert('교직원이 성공적으로 추가되었습니다.');
        router.replace(`/admin/${schoolId}/department/${departmentId}?tab=staff`);
      } catch (error) {
        console.error('교직원 추가 중 오류:', error);
        alert('교직원 추가 중 오류가 발생했습니다.');
      }
    },
    [addStaffProfile, schoolId, departmentId, name, category, mediaFile, router, uploadFile]
  );

  return (
    <>
      <PageHeader title="교직원 추가하기" />
      <section className="relative bg-white w-full p-4 md:p-10 border border-gray-200 rounded-xl shadow-dropdown md:w-[1080px] md:min-h-[753px]">
        <header className="relative flex flex-col justify-start gap-1">
          <ol className="flex justify-start items-center">
            <li>
              <Badge active>교직원 추가</Badge>
            </li>
          </ol>
          <h3 className="text-24 text-gray-900 font-semibold">교직원 추가</h3>
          <div className="absolute right-0 bottom-0 flex items-center gap-2">
            <Button
              className="text-white bg-primary-700 rounded-lg px-3 py-1.5"
              onClick={handleAddProfile()}
            >
              추가하기
            </Button>
          </div>
        </header>

        <span className="inline-block w-full h-px bg-gray-200 my-8" aria-hidden="true"></span>

        <form className="flex flex-col gap-6">
          {/* 카테고리 입력 */}
          <div className="flex justify-start items-center w-full">
            <label
              htmlFor="category"
              className="shrink-0 flex justify-start items-center gap-0.5 text-16 text-gray-800 w-[100px] md:text-18 md:w-[200px]"
            >
              카테고리
              <Asterisk className="text-red w-4 h-4" />
            </label>
            <div className="flex-1 min-w-0">
              <Input
                purpose="text"
                id="category"
                placeholder="카테고리를 입력해 주세요 (예: 교수, 강사 등)"
                className="w-full"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              />
            </div>
          </div>

          {/* 이름 입력 */}
          <div className="flex justify-start items-center w-full">
            <label
              htmlFor="name"
              className="shrink-0 flex justify-start items-center gap-0.5 text-16 text-gray-800 w-[100px] md:text-18 md:w-[200px]"
            >
              이름
              <Asterisk className="text-red w-4 h-4" />
            </label>
            <div className="flex-1 min-w-0">
              <Input
                purpose="text"
                id="name"
                placeholder="이름을 입력해 주세요 (80자 제한)"
                className="w-full"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          {/* 프로필 사진 업로드 */}
          <div className="flex justify-start items-start">
            <label
              htmlFor="media-upload"
              className="shrink-0 flex justify-start items-center gap-0.5 text-16 text-gray-800 w-[100px] md:text-18 md:w-[200px]"
            >
              프로필 이미지 업로드
              <Asterisk className="text-red w-4 h-4" />
            </label>
            <div className="flex-1 min-w-0">
              <FileInput
                id="media-upload"
                size="lg"
                multiple={false}
                value={mediaFile}
                onChange={(files) => {
                  if (!files) return;
                  const file = files instanceof FileList ? files[0] : files;
                  setMediaFile(file);
                }}
              />
            </div>
          </div>
        </form>
      </section>
    </>
  );
}