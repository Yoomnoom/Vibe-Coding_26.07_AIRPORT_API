# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

인천공항 혼잡도 공공데이터를 보여주고, 로그인한 사용자의 즐겨찾기를 Supabase Database에 저장하는 대시보드. 아직 코드는 작성되지 않은 초기 단계이며, 요구사항은 [PRD.md](PRD.md)에 정리되어 있다. 새로운 작업을 시작하기 전 반드시 PRD.md를 먼저 확인할 것.

## 기술 스택

React + TypeScript + Vite, recharts, Supabase(Auth/Database, MCP로 관리), 공공데이터포털 API(프론트엔드에서 직접 호출), Vercel 배포.

## 반드시 지킬 규칙

- 공공데이터포털 API 키는 Supabase Edge Function의 Secret(`VITE_AIRPORT_API_KEY`)으로만 관리하며, 프론트엔드 코드나 `.env`에는 절대 두지 않는다.
- 프론트엔드는 공공데이터 API를 직접 호출하지 않고, 반드시 Supabase Edge Function을 통해서만 호출한다.
- Supabase URL과 anon key는 `.env`의 `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`로 관리한다.
- 즐겨찾기 테이블은 반드시 RLS(행 수준 보안)를 켜고, "로그인한 본인의 즐겨찾기만" 조회/추가/삭제할 수 있는 정책을 적용한다.
- `.env`는 `.gitignore`에 포함해 깃허브에 올라가지 않게 한다. `.env.example`에는 키 이름만 두고 실제 값은 넣지 않는다.
- 화면(컴포넌트)은 먼저 목업 데이터로 완성한 다음, 마지막 단계에서 실제 공공데이터 API/Supabase 연결로 교체한다. 목업 데이터의 타입/형태는 실제 API 응답 형태와 최대한 동일하게 맞춘다.
- 함수 이름과 데이터 형태(타입)는 PRD.md에 정리된 정의를 그대로 따른다. PRD.md와 어긋나게 구현해야 할 경우, 먼저 PRD.md를 수정하고 나서 코드를 작성한다.
- 테이블 생성, RLS 정책 등 Supabase 관련 작업은 Supabase MCP 도구를 통해 수행한다. SQL을 직접 Supabase 대시보드에 붙여넣도록 안내하지 않는다.
- (임시) Supabase MCP로 연결 시 `--project-ref`를 지정하지 않은 경우, 반드시 "Yoomnoom's Project"(이 서비스의 Supabase 프로젝트, URL: https://pkucszwwnwpzvzqczmhh.supabase.co)에만 작업하고 다른 프로젝트는 절대 건드리지 않는다. 프로젝트가 여러 개 조회되면 이름만으로 헷갈리기 쉬우므로 작업 전 project ref(또는 URL)까지 사용자에게 확인받는다.
- 공공데이터포털 API는 클라이언트(브라우저)에서 직접 호출하므로, 서비스키가 네트워크 요청에 노출되는 구조임을 인지하고 절대 코드/커밋에 키를 하드코딩하지 않는다. (환경변수 참조로만 사용)
- 프론트엔드에서 Supabase에 쓰기(즐겨찾기 추가/삭제) 요청 시, 클라이언트에서 넘어온 `user_id`를 신뢰하지 않는다 — RLS 정책과 `auth.uid()` 기준으로만 본인 여부를 판별하고, 쿼리에서 임의로 다른 사용자의 `user_id`를 지정할 수 없게 한다.
- 날짜/시간 관련 로직(오늘/내일 판별, 시간대 비교)은 KST(Asia/Seoul) 기준으로 통일한다. 서버/클라이언트 타임존 불일치로 "오늘" 판정이 어긋나지 않도록 주의한다.
- 공공데이터포털 API 응답 실패/오류 코드(트래픽 제한 초과, 서비스 점검 등)를 빈 배열/무응답과 구분해서 처리하고, 사용자에게 원인이 드러나는 에러 메시지를 보여준다.
