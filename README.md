# Gangnam CEO Directory

강남구상공회 CEO과정 회원을 위한 비공개 검색 디렉토리 MVP입니다.

## 주요 기능
- Supabase 이메일/비밀번호 로그인 (공개 회원가입 없음)
- 이름, 회사명, 기수, 업종, 사업유형 검색
- 1기~32기 기수 필터
- 공개 및 개인정보 동의 회원만 노출
- 관리자 회원 생성/수정/삭제, 사진 업로드, 공개/동의 토글
- 모바일 우선 UI와 기본 PWA manifest

## 로컬 개발
1. 의존성 설치: `npm install`
2. `.env.example`을 `.env.local`로 복사하고 Supabase URL/Anon Key 입력
3. Supabase SQL Editor에서 `supabase/schema.sql` 실행
4. 이어서 `supabase/seed.sql` 실행
5. Supabase Auth에서 관리자 이메일 계정 생성
6. `profiles` 테이블에 첫 관리자를 지정:
   ```sql
   insert into public.profiles (id, email, is_admin)
   values ('AUTH_USER_UUID', 'admin@example.com', true)
   on conflict (id) do update set is_admin = true;
   ```
7. 실행: `npm run dev`

## Supabase 설정
- Authentication > Providers에서 Email 로그인 활성화
- 공개 self-signup은 앱 UI에서 제공하지 않습니다. 운영에서는 초대/관리자 생성 방식으로 계정을 발급하세요.
- Storage bucket `member-photos`는 `schema.sql`에서 public으로 생성됩니다. 회원 사진은 공개 읽기가 가능하지만 업로드/수정/삭제는 관리자 프로필(`profiles.is_admin=true`)로 로그인한 사용자만 가능합니다.
- RLS 정책은 인증 사용자에게 `privacy_consent=true` 및 `is_visible=true` 회원만 읽게 하고, 관리자만 전체 CRUD를 허용합니다.
- 비밀번호 재설정 메일의 Redirect URL은 `/reset-password` 경로를 허용해야 합니다. Supabase Auth URL Configuration에 로컬/배포 도메인의 `/reset-password`를 추가하세요.

## Vercel 배포
1. Git 저장소를 Vercel에 연결
2. Environment Variables에 다음 추가:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Build Command: `npm run build`
4. 배포 후 Supabase Auth redirect URL에 Vercel 도메인을 추가

## 파일 구조
- `app/`: Next.js App Router 페이지
- `components/`: 공통 UI 및 인증 게이트
- `lib/`: Supabase 클라이언트, 타입, 필터 유틸
- `supabase/schema.sql`: DB/RLS/Storage 스키마
- `supabase/seed.sql`: 가상 한국어 샘플 데이터
