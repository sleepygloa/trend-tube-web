# TrendTube 개발 환경 구축 가이드

이 문서는 `TrendTube` 프로젝트의 웹 프론트엔드 및 서버리스 백엔드 개발 환경을 Windows PC에 처음부터 구축하는 과정을 안내합니다.

## 목차

1.  [사전 준비물](#1-사전-준비물)
2.  [1단계: 클라우드 서비스 설정](#2-1단계-클라우드-서비스-설정)
3.  [2단계: 로컬 개발 도구 설치](#3-2단계-로컬-개발-도구-설치)
4.  [3단계: 프로젝트 클론 및 라이브러리 설치](#4-3단계-프로젝트-클론-및-라이브러리-설치)
5.  [4단계: 로컬 개발 서버 실행](#5-4단계-로컬-개발-서버-실행)
6.  [5단계: 배포하기](#6-5단계-배포하기)
7.  [부록: 흔한 오류 해결법](#7-부록-흔한-오류-해결법)

---

## 1. 사전 준비물

-   **GitHub 계정**: 코드 버전 관리를 위해 필요합니다.
-   **YouTube Data API 키**: Google Cloud Platform에서 발급받아야 합니다.
-   **해외 결제 가능 카드**: Supabase, SendGrid 가입 시 인증 목적으로 필요합니다.

---

## 2. 1단계: 클라우드 서비스 설정

### 2.1. Supabase (데이터베이스)

1.  **[Supabase.com](https://supabase.com/)**에 GitHub 계정으로 가입합니다.
2.  `New Project`를 클릭하여 `trend-tube` 이름으로 새 프로젝트를 생성합니다.
3.  프로젝트 생성 후, **`Settings` (톱니바퀴) > `API`** 메뉴로 이동하여 아래 두 값을 복사해 안전한 곳에 보관합니다.
    -   `Project URL`
    -   `Project API Keys` 섹션의 `service_role` 키

### 2.2. SendGrid (이메일 알림)

1.  **[SendGrid.com](https://sendgrid.com/)**에 가입하고 무료 플랜을 선택합니다.
2.  **`Settings` > `API Keys`** 메뉴에서 `Create API Key`를 클릭하여 새 키를 만듭니다. (Full Access 권한 부여)
3.  생성된 **API 키**를 즉시 복사하여 안전한 곳에 보관합니다. (이 창을 닫으면 다시 볼 수 없습니다.)

---

## 3. 2단계: 로컬 개발 도구 설치

### 3.1. Node.js 버전 관리자 (nvm-windows)

> **정보**: `nvm`을 사용하면 Node.js 버전을 쉽게 전환할 수 있어 호환성 문제를 예방할 수 있습니다.

1.  **[nvm-windows 다운로드 페이지](https://github.com/coreybutler/nvm-windows/releases)**로 이동하여 `nvm-setup.exe`를 다운로드하고 설치합니다.
2.  **관리자 권한으로 명령 프롬프트**를 열고 아래 명령어를 실행하여 안정적인 **LTS 버전**의 Node.js를 설치하고 사용하도록 설정합니다.
    ```cmd
    nvm install lts
    nvm use [설치된 버전 번호]
    ```
3.  `node -v`와 `npm -v`를 입력하여 버전이 정상적으로 표시되는지 확인합니다.

### 3.2. Vercel CLI

1.  관리자 권한 명령 프롬프트에서 아래 명령어를 실행하여 Vercel CLI를 설치합니다.
    ```cmd
    npm install -g vercel
    ```

---

## 4. 3단계: 프로젝트 클론 및 라이브러리 설치

1.  개발 작업을 할 폴더로 이동하여, GitHub에서 프로젝트 코드를 복제(clone)합니다.
    ```cmd
    cd C:\dev
    git clone [https://github.com/sleepygloa/trend-tube-web.git](https://github.com/sleepygloa/trend-tube-web.git)
    cd trend-tube-web
    ```
2.  프로젝트에 필요한 모든 라이브러리를 설치합니다.
    ```cmd
    npm install
    ```

---

## 5. 4단계: 로컬 개발 서버 실행

### 5.1. Vercel 프로젝트 연결 및 환경 변수 다운로드

1.  프로젝트 폴더(`trend-tube-web`)에서 터미널을 열고 Vercel 계정에 로그인합니다.
    ```cmd
    vercel login
    ```
2.  현재 폴더를 Vercel에 생성된 프로젝트와 연결합니다.
    ```cmd
    vercel link
    ```
3.  Vercel에 저장된 환경 변수(API 키 등)를 로컬 PC로 안전하게 가져옵니다. 이 명령어를 실행하면 `.env.development.local` 파일이 자동으로 생성됩니다.
    ```cmd
    vercel env pull .env.development.local
    ```

### 5.2. 로컬 서버 실행

-   이제 `npm start` 대신 아래 명령어를 사용하여 프론트엔드와 백엔드를 동시에 실행합니다.
    ```cmd
    vercel dev
    ```
-   실행이 완료되면 웹 브라우저에서 `http://localhost:3000`으로 접속하여 개발 및 테스트를 진행합니다.

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

### 오류 1: `serverless` 또는 `npx` 명령어를 찾을 수 없음
-   **원인**: Windows 환경 변수(Path)에 npm 전역 설치 경로가 누락됨.
-   **해결**:
    1.  `npm config get prefix` 명령어로 경로를 확인합니다. (예: `C:\Users\...\npm`)
    2.  `sysdm.cpl` 실행 > `고급` > `환경 변수` > `Path` 편집 > `새로 만들기`로 위 경로를 추가합니다.
    3.  **모든 터미널 창을 닫고 새로 열어야 적용됩니다.**

### 오류 2: `Cannot find module '...'` (예: `axios`, `googleapis`)
-   **원인**: 해당 라이브러리가 프로젝트에 설치되지 않음.
-   **해결**: `npm install [라이브러리 이름]` 명령어로 설치합니다. (예: `npm install axios`)

### 오류 3: `vercel dev` 실행 시 `spawn cmd.exe ENOENT` 오류
-   **원인**: Windows 시스템 환경 변수 `Path`에서 `%SystemRoot%\system32` 경로가 손상되거나 삭제됨.
-   **해결**:
    1.  `sysdm.cpl` 실행 > `고급` > `환경 변수` > **시스템 변수** `Path` 편집
    2.  `%SystemRoot%\system32` 경로가 없으면 **새로 만들어 추가**합니다.
    3.  **컴퓨터를 재부팅**해야 완전히 적용됩니다.