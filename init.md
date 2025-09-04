# TrendTube 개발 환경 구축 가이드

이 문서는 `TrendTube` 프로젝트의 웹 프론트엔드 및 서버리스 백엔드 개발 환경을 Windows PC에 처음부터 구축하는 과정을 안내합니다.

## 목차

1.  [사전 준비물](#1-사전-준비물)
2.  [1단계: 클라우드 서비스 설정](#2-1단계-클라우드-서비스-설정)
3.  [2단계: 로컬 개발 도구 설치](#3-2단계-로컬-개발-도구-설정)
4.  [3단계: 프로젝트 코드 다운로드 및 설정](#4-3단계-프로젝트-코드-다운로드-및-설정)
5.  [4단계: 로컬 개발 서버 실행](#5-4단계-로컬-개발-서버-실행)
6.  [5단계: 배포하기](#6-5단계-배포하기)
7.  [부록: 흔한 오류 해결법](#7-부록-흔한-오류-해결법)

---

## 1. 사전 준비물

-   **GitHub 계정**: 코드 버전 관리를 위해 필요합니다.
-   **YouTube Data API 키**: Google Cloud Platform에서 발급받아야 합니다.
-   **Supabase 계정**: 데이터베이스 사용을 위해 필요합니다.

---

## 2. 1단계: 클라우드 서비스 설정

### 2.1. Supabase (데이터베이스)

1.  **[Supabase.com](https://supabase.com/)**에 가입하여 `trend-tube` 이름으로 새 프로젝트를 생성합니다.
2.  **Table Editor**에서 `saved_videos` 테이블을 생성합니다. (`video_id`, `title`, `channel_title`, `thumbnail_url` 등)
3.  **`Settings` (톱니바퀴) > `API`** 메뉴로 이동하여 아래 두 값을 복사해 안전한 곳에 보관합니다.
    -   `Project URL`
    -   `Project API Keys` 섹션의 `service_role` 키

---

## 3. 2단계: 로컬 개발 도구 설정

### 3.1. Node.js 버전 관리자 (nvm-windows)

1.  **[nvm-windows 다운로드 페이지](https://github.com/coreybutler/nvm-windows/releases)**로 이동하여 `nvm-setup.exe`를 다운로드하고 설치합니다. (기존 Node.js는 제거)
2.  **관리자 권한으로 명령 프롬프트**를 열고 아래 명령어를 실행하여 안정적인 **LTS 버전**의 Node.js를 설치하고 사용하도록 설정합니다.
    ```cmd
    nvm install lts
    nvm use [설치된 버전 번호]
    ```
3.  `node -v`와 `npm -v`를 입력하여 버전이 정상적으로 표시되는지 확인합니다.

### 3.2. Vercel CLI

-   관리자 권한 명령 프롬프트에서 아래 명령어를 실행하여 Vercel CLI를 설치합니다.
    ```cmd
    npm install -g vercel
    ```

---

## 4. 3단계: 프로젝트 코드 다운로드 및 설정

1.  개발 작업을 할 폴더로 이동하여, GitHub에서 프로젝트 코드를 복제(clone)합니다.
    ```cmd
    cd C:\dev
    git clone [https://github.com/sleepygloa/trend-tube-web.git](https://github.com/sleepygloa/trend-tube-web.git)
    cd trend-tube-web
    ```
2.  `node_modules` 폴더와 `package-lock.json` 파일이 있다면 삭제한 후, 프로젝트에 필요한 모든 라이브러리를 새로 설치합니다.
    ```cmd
    npm install
    ```
3.  Vercel 프로젝트에 1단계에서 준비한 API 키들을 환경 변수로 등록합니다.
    -   `YOUTUBE_API_KEY`
    -   `SUPABASE_URL`
    -   `SUPABASE_SERVICE_KEY`

---

## 5. 4단계: 로컬 개발 서버 실행

1.  프로젝트 폴더(`trend-tube-web`)에서 터미널을 열고 Vercel 계정에 로그인하고 프로젝트를 연결합니다.
    ```cmd
    vercel login
    vercel link
    ```
2.  Vercel에 저장된 환경 변수를 로컬 PC로 안전하게 가져옵니다. `.env.local` 파일이 생성됩니다.
    ```cmd
    vercel env pull .env.local
    ```
3.  프로젝트 루트에 `vercel.json` 파일이 있는지, 내용은 아래와 같은지 확인합니다.
    ```json
    {
      "rewrites": [
        { "source": "/api/:path*", "destination": "/api/:path*" }
      ]
    }
    ```
4.  아래 명령어를 사용하여 프론트엔드와 백엔드를 동시에 실행합니다.
    ```cmd
    vercel dev
    ```
-   실행이 완료되면 터미널에 표시되는 `localhost` 주소로 접속하여 개발을 진행합니다.

---

## 6. 5단계: 배포하기

-   로컬에서 기능 개발 및 테스트가 완료되면, 아래 명령어를 통해 변경사항을 GitHub에 올립니다. Vercel이 자동으로 이를 감지하여 실제 인터넷에 배포합니다.
    ```cmd
    git add .
    git commit -m "커밋 메시지"
    git push
    ```

---

## 7. 부록: 흔한 오류 해결법

### 오류 1: `npx`, `vercel` 등 명령어를 찾을 수 없음
-   **원인**: Windows 환경 변수(Path)에 npm 전역 설치 경로가 누락됨.
-   **해결**: `sysdm.cpl`을 실행하여 환경 변수 `Path`에 `npm config get prefix`로 확인된 경로를 추가한 뒤, 모든 터미널을 재시작합니다.

### 오류 2: `Cannot find module '...'` (예: `googleapis`, `react-hot-toast`)
-   **원인**: 해당 라이브러리가 프로젝트에 설치되지 않음.
-   **해결**: `npm install [라이브러리 이름]` 명령어로 설치하고 `package.json`에 추가되었는지 확인합니다.

### 오류 3: `vercel dev` 실행 시 `404 Not Found` 오류
-   **원인**: 프로젝트 루트에 `vercel.json` 파일이 없거나 내용이 잘못됨.
-   **해결**: 4단계 3번 항목을 확인합니다.