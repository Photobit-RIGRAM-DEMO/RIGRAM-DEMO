'use client';

import Badge from '@/components/badge';
import Button from '@/components/button';
import Divider from '@/components/divider';
import FileInput from '@/components/fileInput';
import Input from '@/components/input';
import PageHeader from '@/components/pageHeader';
import Textarea from '@/components/textarea';
import { useCollegeStore } from '@/store/useCollegeStore';
import { useSchoolStore } from '@/store/useSchoolStore';
import { supabase } from '@/utils/supabase/client';
import { Asterisk } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import { transliterate } from 'transliteration';

export default function DepartmentAddPage() {
  const router = useRouter();
  const pathname = usePathname();
  const segments = useMemo(() => pathname.split('/').filter(Boolean), [pathname]);

  const [collegeName, setCollegeName] = useState('');
  const [deptName, setDeptName] = useState('');
  const [deptNameEn, setDeptNameEn] = useState('');
  const [imgUrl, setImgUrl] = useState<File | string | null>('');
  const [deptDesc, setDeptDesc] = useState('');

  const school = useSchoolStore((state) => state.school);
  const schoolId = useSchoolStore((state) => state.school?.id);
  const schoolGraduationYear = useSchoolStore((state) => state.school?.graduation_year);
  const addCollege = useCollegeStore((state) => state.addCollege);

  const slugify = (text: string) =>
    transliterate(text) // 👈 한글 → 영어 변환
      .toLowerCase()
      .trim()
      .replace(/[\s\W-]+/g, '-');

  // 파일 선택 handler (useCallback으로 메모이제이션)
  const handleFileSelect = useCallback((file: File | null) => {
    if (!file) return;
    setImgUrl(file);
  }, []);

  // 학과 등록
  const handleDeptAdd = async () => {
    if (!schoolId) return;

    try {
      if (!collegeName) return alert('단과대학명을 입력해 주세오.');
      if (!deptName) return alert('학과명을 입력해 주세오.');
      if (!deptNameEn) return alert('학과 영문명을 입력해 주세오.');
      if (!imgUrl) return alert('학과의 대표 이미지를 업로드해 주세오.');

      //사용자 인증 확인
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError) {
        console.error('Auth error:', authError);
      }

      if (!user) {
        alert('사용자 인증이 필요합니다.');
        return;
      }

      // 단과대학 생성
      const newCollege = await addCollege(schoolId, collegeName);

      if (!newCollege || !newCollege.id) {
        alert('단과대학 생성 실패');
        return;
      }

      // 이미지 업로드 처리
      let logoUrl: string | null = null;
      if (imgUrl instanceof File) {
        const schoolName = slugify(school?.school_name_en ?? '');
        const deptName = slugify(deptNameEn);

      // 파일명 slugify (확장자 유지)
      const fileExt = imgUrl.name.split('.').pop();
      const baseName = imgUrl.name.replace(/\.[^/.]+$/, '');
      const safeFileName = `${slugify(baseName)}.${fileExt}`;

      const filePath = `${schoolName}/${deptName}/${safeFileName}`;

        const { error: uploadError } = await supabase.storage
          .from('dept-img')
          .upload(filePath, imgUrl, { upsert: true });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw uploadError;
        }

        const { data: urlData } = supabase.storage.from('dept-img').getPublicUrl(filePath);
        logoUrl = urlData.publicUrl;
      } else if (typeof imgUrl === 'string') {
        logoUrl = imgUrl;
      }

      const { error: directInsertError } = await supabase
        .from('departments')
        .insert([
          {
            college_id: newCollege.id,
            name: deptName,
            name_en: deptNameEn,
            description: deptDesc,
            img_url: logoUrl,
            graduation_year: schoolGraduationYear,
          },
        ])
        .select()
        .single();

      if (directInsertError) {
        console.error('Direct insert failed:', directInsertError);
        alert(`학과 생성 실패: ${directInsertError.message}`);
        return;
      }

      alert(`${deptName}학과가 추가되었습니다.`);
      router.replace(`/admin/${segments[1]}/department`);

      // 성공시 폼 초기화
      setCollegeName('');
      setDeptName('');
      setDeptNameEn('');
      setDeptDesc('');
      setImgUrl('');
    } catch (error) {
      console.error('Unexpected error:', error);
      alert(`예상치 못한 오류: ${error}`);
    }
  };

  return (
    <section className="flex flex-col h-full gap-2 md:gap-4">
      <PageHeader title="학과 추가하기" />
      <div className="bg-white w-full h-full p-5 border border-border-section rounded-xl shadow-dropdown md:w-[1080px] md:min-h-[753px] md:p-10">
        <header className="relative flex flex-col justify-start gap-2 md:gap-1">
          <ol className="flex justify-start items-center">
            <li>
              <Badge active>기본 정보</Badge>
            </li>
          </ol>
          <h3 className="text-20 md:text-24 text-gray-900 font-semibold">기본 정보</h3>
          <Button
            className="absolute right-0 bottom-0 text-white bg-primary-700 rounded-lg px-3 py-1.5"
            onClick={handleDeptAdd}
          >
            추가
          </Button>
        </header>
        <Divider gap={6} mdGap={8} />
        <div className="flex flex-col gap-6">
          <div className="flex justify-start items-center w-full">
            <label
              htmlFor="colleges-name"
              className="shrink-0 flex justify-start items-center gap-0.5 text-16 text-gray-800 w-[100px] md:text-18 md:w-[200px]"
            >
              단과대학명
              <Asterisk className="text-red w-4 h-4" />
            </label>
            <div className="flex-1 min-w-0">
              <Input
                purpose="text"
                id="colleges-name"
                placeholder="단과대학명 이름을 입력해 주세요. (80자 제한)"
                className="w-full"
                required={true}
                value={collegeName}
                onChange={(e) => setCollegeName(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-start items-center w-full">
            <label
              htmlFor="department-name"
              className="shrink-0 flex justify-start items-center gap-0.5 text-16 text-gray-800 w-[100px] md:text-18 md:w-[200px]"
            >
              학과명
              <Asterisk className="text-red w-4 h-4" />
            </label>
            <div className="flex-1 min-w-0">
              <Input
                purpose="text"
                id="department-name"
                placeholder="학과명을 입력해 주세요. (80자 제한)"
                className="w-full"
                required={true}
                value={deptName}
                onChange={(e) => setDeptName(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-start items-center w-full">
            <label
              htmlFor="department-name-en"
              className="shrink-0 flex justify-start items-center gap-0.5 text-16 text-gray-800 w-[100px] md:text-18 md:w-[200px]"
            >
              학과 영문명
              <Asterisk className="text-red w-4 h-4" />
            </label>
            <div className="flex-1 min-w-0">
              <Input
                purpose="text"
                id="department-name-en"
                placeholder="학과 영문명을 입력해 주세요 (80자 제한)"
                className="w-full"
                required={true}
                value={deptNameEn}
                onChange={(e) => setDeptNameEn(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-start items-center">
            <label
              htmlFor="graduate-year"
              className="shrink-0 flex justify-start items-center gap-0.5 text-16 text-gray-800 w-[120px] md:text-18 md:w-[200px]"
            >
              졸업연도
              <Asterisk className="text-red w-4 h-4" />
            </label>
            <div className="flex-1 min-w-0">
              <Input
                purpose="text"
                id="graduate-year"
                className="w-full bg-gray-100"
                value={
                  useSchoolStore.getState().school?.graduation_year ||
                  '학교 정보에 졸업연도가 없습니다.'
                }
                readOnly
              />
            </div>
          </div>
          <div className="flex justify-start items-start">
            <label
              htmlFor="department-image"
              className="shrink-0 flex justify-start items-center gap-0.5 text-16 text-gray-800 w-[100px] md:text-18 md:w-[200px]"
            >
              대표 이미지
              <Asterisk className="text-red w-4 h-4" />
            </label>
            <div className="flex-1 min-w-0">
              <FileInput
                id="department-image"
                className="w-full"
                size="lg"
                value={imgUrl}
                onChange={(files) => {
                  if (!files) return;
                  const file = files instanceof FileList ? files[0] : files;
                  handleFileSelect(file);
                  setImgUrl(file);
                }}
              />
            </div>
          </div>
          <div className="flex justify-start items-start w-full">
            <label
              htmlFor="department-desc"
              className="shrink-0 flex justify-start items-center gap-0.5 text-16 text-gray-800 w-[100px] md:text-18 md:w-[200px]"
            >
              학과 설명
            </label>
            <div className="flex-1 min-w-0">
              <Textarea
                id="department-desc"
                placeholder="학과 설명을 입력해 주세요.(선택)"
                className="w-full p-4"
                value={deptDesc}
                onChange={(e) => setDeptDesc(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
