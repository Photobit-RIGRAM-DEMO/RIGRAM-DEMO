'use client';

import Badge from '@/components/badge';
import Button from '@/components/button';
import FileInput from '@/components/fileInput';
import Input from '@/components/input';
import PageHeader from '@/components/pageHeader';
import { useExecutiveStore } from '@/store/useExecutive';
import { useSchoolStore } from '@/store/useSchoolStore';
import { supabase } from '@/utils/supabase/client';
import { Asterisk } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { transliterate } from 'transliteration';

const CATEGORY_OPTIONS = [
  { value: 'president', label: '총장' },
  { value: 'vice president', label: '부총장' },
  { value: 'dean', label: '학장' },
  { value: 'chairman', label: '이사장' },
  { value: 'scp', label: '총학생회장' }
];

type Category = string;

export default function ExecutiveAddPage() {
  const router = useRouter();
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);
  const schoolId = segments[1];

  const [category, setCategory] = useState<Category>('');
  const [name, setName] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);

  const addExecutiveProfile = useExecutiveStore((state) => state.addExecutiveProfile);
  const school = useSchoolStore((state) => state.school);

  const slugify = (text: string) =>
    transliterate(text) // 👈 한글 → 영어 변환
      .toLowerCase()
      .trim()
      .replace(/[\s\W-]+/g, '-');

  useEffect(() => {
    if (!schoolId) return;
  }, [schoolId]);

  /* 파일 업로드 */
  const uploadFile = useCallback(
    async (file: File, folder: Category) => {
      const schoolName = slugify(school?.school_name_en || '');
      const graduationYear = school?.graduation_year;

      // 폴더명 slugify
      const safeFolder = slugify(folder);

      // 파일명 slugify (확장자 유지)
      const fileExt = file.name.split('.').pop();
      const baseName = file.name.replace(/\.[^/.]+$/, '');
      const safeFileName = `${slugify(baseName)}.${fileExt}`;

      const filePath = `${schoolName}/${graduationYear}/${safeFolder}/${safeFileName}`;

      const { error } = await supabase.storage
        .from('executive-profiles')
        .upload(filePath, file, { upsert: true });

      if (error) {
        console.error('프로필 업로드 실패:', error.message);
        alert('프로필 업로드 중 오류가 발생했습니다.');
        return null;
      }

      const { data } = supabase.storage
        .from('executive-profiles')
        .getPublicUrl(filePath);

      return data.publicUrl ?? null;
    },
    [school]
  );

  const handleAddProfile = useCallback(
    () => async () => {
      if (!category.trim()) {
        alert('직책을 입력해 주세요.');
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
        await addExecutiveProfile(schoolId, name, category, mediaUrl);

        alert('임직원이 성공적으로 추가되었습니다.');
        router.replace(`/admin/${schoolId}/introduction?tab=executive`);
      } catch (error) {
        console.error('임직원 추가 중 오류:', error);
        alert('임직원 추가 중 오류가 발생했습니다. 다시 시도해주세요.');

      }
    },
    [category, name, mediaFile, router, schoolId, addExecutiveProfile, uploadFile]
  );

  return (
    <>
      <PageHeader title="임직원 추가하기" />

      <section className="relative bg-white w-full p-4 md:p-10 border border-gray-200 rounded-xl shadow-dropdown md:w-[1080px] md:min-h-[753px]">
        <header className="relative flex flex-col gap-1">
          <ol className="flex items-center">
            <li>
              <Badge active>임직원 추가</Badge>
            </li>
          </ol>

          <h3 className="text-24 text-gray-900 font-semibold">임직원 추가</h3>

          <div className="absolute right-0 bottom-0 flex gap-2">
            <Button
              className="text-white bg-primary-700 rounded-lg px-3 py-1.5"
              onClick={handleAddProfile()}
            >
              추가하기
            </Button>
          </div>
        </header>

        <span className="inline-block w-full h-px bg-gray-200 my-8" />

        <form className="flex flex-col gap-6">
          {/* 직책 */}
          <div className="flex items-center w-full">
            <label className="shrink-0 flex items-center gap-0.5 text-16 text-gray-800 w-[100px] md:w-[200px]">
              직책
              <Asterisk className="text-red w-4 h-4" />
            </label>

            <div className="flex-1">
              <Input
                purpose="text"
                placeholder="직책을 입력해 주세요 (예: 총장, 부총장 등)"
                className="w-full"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              />
            </div>
          </div>

          {/* 이름 */}
          <div className="flex items-center w-full">
            <label className="shrink-0 flex items-center gap-0.5 text-16 text-gray-800 w-[100px] md:w-[200px]">
              이름
              <Asterisk className="text-red w-4 h-4" />
            </label>

            <div className="flex-1">
              <Input
                purpose="text"

                placeholder="이름을 입력해 주세요 (80자 제한)"
                className="w-full"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          {/* 파일 */}
          <div className="flex items-start">
            <label className="shrink-0 flex items-center gap-0.5 text-16 text-gray-800 w-[100px] md:w-[200px]">
              프로필 이미지 업로드
              <Asterisk className="text-red w-4 h-4" />
            </label>

            <div className="flex-1">
              <FileInput

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
