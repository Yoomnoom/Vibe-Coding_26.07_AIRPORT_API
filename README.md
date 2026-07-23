# 인천공항 혼잡도 대시보드

VibeCoding2026_VITE_AIRPORT_API_KEY를 이용한 반응형 웹앱.

공공데이터포털의 **인천국제공항공사_여객터미널혼잡도예고제** 데이터를 활용해, 선택한 날짜·시간의 터미널별(T1/T2) 입국장·출국장 혼잡도를 숫자·그래프·히트맵으로 보여주고, 로그인한 사용자는 원하는 시간대를 즐겨찾기로 저장할 수 있는 대시보드입니다.

자세한 요구사항/의사결정 배경은 [PRD.md](PRD.md), 디자인 톤은 [DESIGN.md](DESIGN.md)를 참고하세요.

## 현재 상태

- 화면과 상호작용은 전부 구현되어 있으나, **혼잡도 데이터는 아직 목업(mock)** 입니다 (`src/services/congestionService.ts`). 실제 공공데이터포털 API 응답 스펙이 확정되면 이 서비스 계층만 교체하면 되도록 설계했습니다.
- **로그인(Supabase Auth)과 즐겨찾기(Supabase Database + RLS)는 실제로 연동**되어 있습니다.
- `getPassgrAnncmt` 함수는 실제 공공데이터포털 엔드포인트를 호출하도록 구현되어 있고, 화면 하단 "실시간 API 연동 테스트" 섹션에서 원본 응답을 확인할 수 있습니다(CORS/트래픽 제한 등은 아직 실제 검증 전).

## 기술 스택

| 영역 | 사용 기술 |
|---|---|
| 프레임워크 | React 19 + TypeScript + Vite |
| 차트 | recharts |
| 인증/DB | Supabase (Auth, Postgres, Row Level Security) |
| 폰트/디자인 | Pretendard Variable, `DESIGN.md`(Elice 톤) 기반 커스텀 CSS |
| 배포(예정) | Vercel |

## 주요 기능

- **오늘/내일 조회**: 헤더 토글로 전환, 새로고침 버튼
- **실시간 모드**: 기본값은 브라우저의 현재 시각. 5분마다 자동 갱신되며, 날짜/시간을 직접 바꾸면 수동 모드로 전환되고 "실시간으로" 버튼으로 복귀 가능
- **상세 혼잡도 카드**: 날짜/시간 선택 + 터미널×구역(T1/T2 × 입국장/출국장) 4개 카드, 혼잡도 %·상태(원활/보통/혼잡)·추정 인원수 표시
- **장소·시간별 히트맵**: 00~23시(1시간 단위) × 터미널·구역 매트릭스, 색상으로 혼잡도 단계 표시, 90% 이상은 🔥 표시, 셀 클릭 시 해당 시간으로 이동
- **터미널 비교 그래프**: 시간대별 T1 vs T2 막대+라인 콤보 차트, 입국장/출국장 토글
- **추천 시간 배너**: 선택한 존 기준으로 T1/T2 각각 가장 여유로운(혼잡도 최저) 시간을 추천, 클릭 시 이동
- **로그인/회원가입**: 이메일/비밀번호 (Supabase Auth), 헤더의 팝오버 폼
- **즐겨찾기**: 로그인한 사용자만 추가/삭제 가능, 본인 것만 조회(RLS), T1/T2 그룹으로 접기/펼치기, 혼잡 항목 🔥 표시
- **다크모드**: 즉시 전환 + 로컬 저장 + `prefers-color-scheme` 기본값

## 프로젝트 구조

```
src/
├─ components/       # 화면 컴포넌트 (Header, CongestionHeatmap, FavoritesList, ...)
├─ hooks/             # useAuth, useDarkMode, usePassgrAnncmt
├─ services/          # congestionService(목업), favoritesService(Supabase 실연동),
│                      airportApi(공공데이터 실API), supabaseClient
├─ types/             # 도메인 타입 (congestion, auth, airportApi)
├─ utils/             # congestionColors, chartTheme 등 공용 유틸
├─ App.tsx            # 최상위 상태 관리 + 레이아웃
└─ index.css / App.css
```

## 환경 변수

`.env.example`을 복사해 `.env.local`을 만들고 값을 채웁니다.

```
VITE_AIRPORT_API_KEY=       # 공공데이터포털 서비스키
VITE_SUPABASE_URL=          # Supabase 프로젝트 URL
VITE_SUPABASE_ANON_KEY=     # Supabase anon(publishable) key
```

`.env` / `.env.local`은 `.gitignore`에 포함되어 저장소에 올라가지 않습니다.

## Supabase 데이터 모델

`favorites` 테이블 (RLS 적용):

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | uuid PK | default gen_random_uuid() |
| user_id | uuid FK → auth.users | 소유자, on delete cascade |
| terminal | text | `'T1' \| 'T2'` (CHECK) |
| zone | text | `'입국장' \| '출국장'` (CHECK) |
| adate | date | 대상 날짜 |
| atime | time | 대상 시간 |
| created_at | timestamptz | default now() |

RLS 정책 3개(`select`/`insert`/`delete`) 모두 `auth.uid() = user_id` 조건만 허용합니다. 자세한 내용은 [PRD.md](PRD.md#6-데이터-모델-supabase)를 참고하세요.

## 개발 실행

```bash
npm install
npm run dev       # 개발 서버
npm run build      # 타입체크(tsc -b) + 프로덕션 빌드
npm run lint        # oxlint
```

## 알려진 제한 사항 / TODO

- 혼잡도 데이터가 아직 목업이라, 상세 카드의 "약 N명" 인원수도 혼잡도 %에서 역산한 임시 추정치입니다 (`ESTIMATED_ZONE_CAPACITY`, `src/services/congestionService.ts`).
- 공공데이터포털 API의 실제 CORS 허용 여부·트래픽 제한은 아직 검증 전입니다. 막힐 경우 Vercel Serverless Function 프록시로 전환할 수 있도록 서비스 계층을 분리해 두었습니다.
- Vercel 배포는 아직 진행하지 않았습니다.
