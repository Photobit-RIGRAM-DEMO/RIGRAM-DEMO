'use client';

import Badge from '@/components/badge';
import Button from '@/components/button';
import Divider from '@/components/divider';
import FileInput from '@/components/fileInput';
import Input from '@/components/input';
import PageHeader from '@/components/pageHeader';
import { useDepartmentStore } from '@/store/useDepartmentStore';
import { useSchoolStore } from '@/store/useSchoolStore';
import { useStudentStore } from '@/store/useStudentStore';
import { supabase } from '@/utils/supabase/client';
import { Asterisk } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { transliterate } from 'transliteration';

export default function GraduateAddPage() {
  const router = useRouter();
  const pathname = usePathname();
  const segments = useMemo(() => pathname.split('/').filter(Boolean), [pathname]);
  const currentSchoolId = segments[1];
  const currentDeptId = segments[3];

  const [studentName, setStudentName] = useState('');
  const [studentNameEn, setStudentNameEn] = useState('');
  const [deptName, setDeptName] = useState('');
  const [deptNameEn, setDeptNameEn] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [graduationYear, setGraduationYear] = useState('');
  const [profileImg, setProfileImg] = useState<File | null>(null);
  const [graduationImg, setGraduationImg] = useState<File | null>(null);

  const fetchDepartmentById = useDepartmentStore((state) => state.fetchDepartmentById);
  const addStudentProfile = useStudentStore((state) => state.addStudentProfile);
  const school = useSchoolStore((state) => state.school);
  const schoolNameEn = school?.school_name_en || '';

  const slugify = (text: string) =>
    transliterate(text) // 👈 한글 → 영어 변환
      .toLowerCase()
      .trim()
      .replace(/[\s\W-]+/g, '-');

  // 파일 선택 handler
  const handleFileSelect = useCallback((file: File | null, type: 'profile' | 'graduation') => {
    if (!file) return;
    if (type === 'profile') {
      setProfileImg(file);
    } else {
      setGraduationImg(file);
    }
  }, []);

  // 학과명 가져오기
  useEffect(() => {
    if (currentDeptId) {
      fetchDepartmentById(currentDeptId).then((dept) => {
        if (dept?.name) {
          setDeptName(dept.name);
          setDeptNameEn(dept.name_en);
          setGraduationYear(dept.graduation_year);
        }
      });
    }
  }, [currentDeptId, fetchDepartmentById]);

  /* 파일 업로드 (Supabase storage) */
  const uploadImage = async (file: File, folder: string) => {
    const schoolName = slugify(schoolNameEn);
    const deptName = slugify(deptNameEn);
    const studentName = slugify(studentNameEn);
    
    // 파일명 slugify (확장자 유지)
    const fileExt = file.name.split('.').pop();
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    const safeFileName = `${slugify(baseName)}.${fileExt}`;

    const filePath = `${schoolName}/${deptName}/${studentName}/${folder}/${safeFileName}`;

    const { error } = await supabase.storage
      .from('student-profiles')
      .upload(filePath, file, { upsert: true });
    if (error) {
      console.error(`${folder}이미지 업로드 실패: `, error.message);
      alert(`${folder} 업로드 실패`);
      return null;
    }

    const { data } = supabase.storage.from('student-profiles').getPublicUrl(filePath);

    return data?.publicUrl ?? null;
  };

  const handleProfileAdd = async () => {
    try {
      if (!studentName.trim()) return alert('졸업생 이름을 입력해 주세요.');
      if (!studentNameEn.trim()) return alert('졸업생 영문 이름을 입력해 주세요.');
      if (!phone.trim()) return alert('연락처를 입력해 주세요.');
      if (!email.trim()) return alert('이메일을 입력해 주세요.');
      if (!profileImg) return alert('프로필 이미지를 업로드해 주세요.');
      if (!graduationImg) return alert('학사모 이미지를 업로드해 주세요.');

      let profileUrl: string | null = null;
      let graduationUrl: string | null = null;

      if (profileImg) {
        profileUrl = await uploadImage(profileImg, 'profile');
      }
      if (graduationImg) {
        graduationUrl = await uploadImage(graduationImg, 'graduation');
      }

      await addStudentProfile(
        currentSchoolId,
        currentDeptId,
        studentName,
        studentNameEn,
        profileUrl,
        graduationUrl,
        email,
        phone,
        graduationYear
      );

      alert(`${studentName}학생의 프로필이 추가되었습니다.`);
      router.replace(`/admin/${school?.id}/graduate/${currentDeptId}`);
    } catch (error) {
      console.error('Unexpected error : ', error);
      alert('학생 프로필 등록 중 오류가 발생했습니다.');
    }
  };

  return (
    <>
      <PageHeader title="졸업생 추가하기" />
      <section className="relative bg-white w-full p-4 md:p-10 border border-gray-200 rounded-xl shadow-dropdown md:w-[1080px] md:min-h-[753px]">
        <header className="relative flex flex-col justify-start gap-1">
          <ol className="flex justify-start items-center">
            <li>
              <Badge active>졸업생 정보</Badge>
            </li>
          </ol>
          <h3 className="text-24 text-gray-900 font-semibold">졸업생 정보</h3>
          <div className="absolute right-0 bottom-0 flex items-center gap-2">
            <Button
              className="text-white bg-primary-700 rounded-lg px-3 py-1.5"
              onClick={handleProfileAdd}
              aria-label="졸업생 추가하기"
            >
              추가하기
            </Button>
          </div>
        </header>
        <Divider gap={6} mdGap={8} />
        <div className="flex flex-col gap-6">
          <div className="flex justify-start items-center w-full">
            <label
              htmlFor="graduate-name"
              className="shrink-0 flex justify-start items-center gap-0.5 text-16 text-gray-800 w-[100px] md:text-18 md:w-[200px]"
            >
              이름
              <Asterisk className="text-red w-4 h-4" />
            </label>
            <div className="flex-1 min-w-0">
              <Input
                purpose="text"
                id="graduate-name"
                placeholder="졸업생의 이름을 입력해 주세요.(80자 제한)"
                className="w-full"
                value={studentName}
                required={true}
                max={80}
                onChange={(e) => {
                  const value = e.target.value;
                  // 한글과 숫자만 허용, 띄어쓰기 제외
                  const onlyKoreanAndNumbers = value.replace(/[^ㄱ-ㅎ가-힣0-9ㆍᆢ]/gi, '');
                  setStudentName(onlyKoreanAndNumbers);
                }}
              />
            </div>
          </div>
          <div className="flex justify-start items-center w-full">
            <label
              htmlFor="graduate-en-name"
              className="shrink-0 flex justify-start items-center gap-0.5 text-16 text-gray-800 w-[100px] md:text-18 md:w-[200px]"
            >
              영어 이름
              <Asterisk className="text-red w-4 h-4" />
            </label>
            <div className="flex-1 min-w-0">
              <Input
                purpose="text"
                id="graduate-en-name"
                placeholder="졸업생의 영어 이름을 입력해 주세요.(80자 제한)"
                className="w-full"
                value={studentNameEn}
                required={true}
                max={80}
                onChange={(e) => {
                  setStudentNameEn(e.target.value);
                  const onlyEnglish = e.target.value.replace(/[^A-Za-z0-9_]/g, '');
                  setStudentNameEn(onlyEnglish);
                }}
              />
            </div>
          </div>
          <div className="flex justify-start items-center w-full">
            <label
              htmlFor="department-name"
              className="shrink-0 flex justify-start items-center gap-0.5 text-16 text-gray-800 w-[100px] md:text-18 md:w-[200px]"
            >
              학과
            </label>
            <div className="flex-1 min-w-0">
              <Input
                purpose="text"
                id="department-name"
                placeholder="학과 이름을 입력해 주세요.(80자 제한)"
                className="w-full"
                value={deptName}
                readOnly={true}
              />
            </div>
          </div>
          <div className="flex justify-start items-center w-full">
            <label
              htmlFor="graduation-year"
              className="shrink-0 flex justify-start items-center gap-0.5 text-16 text-gray-800 w-[100px] md:text-18 md:w-[200px]"
            >
              졸업 연도
            </label>
            <div className="flex-1 min-w-0">
              <Input
                purpose="text"
                id="graduation-year"
                placeholder=""
                className="w-full"
                value={graduationYear}
                readOnly={true}
              />
            </div>
          </div>
          <div className="flex justify-start items-center w-full">
            <label
              htmlFor="contact"
              className="shrink-0 flex justify-start items-center gap-0.5 text-16 text-gray-800 w-[100px] md:text-18 md:w-[200px]"
            >
              연락처
              <Asterisk className="text-red w-4 h-4" />
            </label>
            <div className="flex-1 min-w-0">
              <Input
                purpose="text"
                id="contact"
                placeholder="01012345678"
                className="w-full"
                value={phone}
                max={11}
                required={true}
                onChange={(e) => {
                  setPhone(e.target.value);
                  const onlyNumber = e.target.value.replace(/[^0-9]/g, '');
                  setPhone(onlyNumber);
                }}
              />
            </div>
          </div>
          <div className="flex justify-start items-center w-full">
            <label
              htmlFor="email"
              className="shrink-0 flex justify-start items-center gap-0.5 text-16 text-gray-800 w-[100px] md:text-18 md:w-[200px]"
            >
              이메일
              <Asterisk className="text-red w-4 h-4" />
            </label>
            <div className="flex-1 min-w-0">
              <Input
                purpose="text"
                id="email"
                placeholder="example@email.com"
                className="w-full"
                value={email}
                required={true}
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
              />
            </div>
          </div>
          <div className="flex justify-start items-start">
            <label
              htmlFor="profile-img"
              className="shrink-0 flex justify-start items-center gap-0.5 text-16 text-gray-800 w-[100px] md:text-18 md:w-[200px]"
            >
              프로필 이미지
              <Asterisk className="text-red w-4 h-4" />
            </label>
            <div className="flex-1 min-w-0">
              <FileInput
                id="profile-img"
                className="w-full h-full"
                size="lg"
                value={profileImg}
                onChange={(files) => {
                  if (!files) return;
                  const file = files instanceof FileList ? files[0] : files;
                  handleFileSelect(file, 'profile');
                  setProfileImg(file);
                }}
              />
            </div>
          </div>
          <div className="flex justify-start items-start">
            <label
              htmlFor="graduation-img"
              className="shrink-0 flex justify-start items-center gap-0.5 text-16 text-gray-800 w-[100px] md:text-18 md:w-[200px]"
            >
              학사모 이미지
              <Asterisk className="text-red w-4 h-4" />
            </label>
            <div className="flex-1 min-w-0">
              <FileInput
                id="graduation-img"
                className="w-full h-full"
                size="lg"
                value={graduationImg}
                onChange={(files) => {
                  if (!files) return;
                  const file = files instanceof FileList ? files[0] : files;
                  handleFileSelect(file, 'graduation');
                  setGraduationImg(file);
                }}
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
