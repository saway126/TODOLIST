# Tauri 투두 앱 V1

Tauri와 Vanilla TypeScript로 제작된 크로스 플랫폼 데스크톱 투두 애플리케이션입니다.

## 주요 기능

- **CRUD 작업:** 할 일을 추가, 완료, 수정 및 삭제할 수 있습니다.
- **필터링 및 검색:** 모든 할 일 또는 오늘의 할 일만 보거나, 간단한 텍스트 검색을 할 수 있습니다.
- **AI 가져오기 (Import from AI):** AI 어시스턴트(ChatGPT, Claude, Gemini 등)와의 대화나 목록을 붙여넣으면 자동으로 할 일을 추출하여 추가합니다. 마크다운 체크리스트, 글머리 기호, "Todo:" 접두사를 지원합니다.
- **로컬 저장:** 데이터는 시스템의 애플리케이션 데이터 디렉토리에 있는 `todos.json` 파일에 저장되어 세션 간에 유지됩니다.
- **단축키:** 효율적이고 빠른 사용을 위해 설계되었습니다.

## 기술 스택

- **데스크톱 프레임워크:** [Tauri](https://tauri.app/)
- **프론트엔드:** Vanilla TypeScript (프레임워크 없음)
- **번들러:** [Vite](https://vitejs.dev/)
- **패키지 매니저:** npm

## 프로젝트 구조

```
.
├── src/
│   ├── main.ts           # 앱 진입점
│   ├── styles.css        # 모든 애플리케이션 스타일
│   ├── types.ts          # TypeScript 타입 정의
│   ├── services/
│   │   ├── fs.ts         # Tauri 파일 시스템 서비스 래퍼
│   │   └── todoStore.ts  # 투두 상태 관리
│   └── ui/
│       ├── dom.ts        # DOM 조작 및 렌더링 로직
│       └── events.ts     # 이벤트 리스너 설정
├── src-tauri/
│   ├── tauri.conf.json   # Tauri 설정 (권한 등)
│   └── ...               # 기타 Tauri 백엔드 파일
├── index.html            # 메인 HTML 파일
└── package.json          # 프로젝트 의존성 및 스크립트
```

## 시작하기

### 필수 조건

- [Node.js 및 npm](https://nodejs.org/en/)
- [Rust 및 Cargo](https://www.rust-lang.org/tools/install)
- [Tauri 개발 필수 조건](https://tauri.app/v1/guides/getting-started/prerequisites)

### 설치

1.  저장소 복제:
    ```bash
    git clone <repository-url>
    cd tauri-todo-app
    ```
2.  의존성 설치:
    ```bash
    npm install
    ```

### 개발

핫 리로딩이 적용된 개발 모드로 앱을 실행하려면:

```bash
npm run tauri dev
```

### 프로덕션 빌드

현재 플랫폼용 애플리케이션을 빌드하고 패키징하려면:

```bash
npm run tauri build
```
실행 파일은 `src-tauri/target/release/`에 위치합니다.

## 단축키

-   **전역:**
    -   `ArrowUp` / `ArrowDown`: 할 일 간 이동
    -   `Space`: 선택된 할 일의 완료 상태 토글
    -   `e`: 선택된 할 일 수정
    -   `Delete` / `Backspace`: 선택된 할 일 삭제
-   **할 일 추가 입력창:**
    -   `Enter`: 새로운 할 일 추가
-   **할 일 수정 입력창:**
    -   `Enter`: 변경 사항 저장
    -   `Escape`: 수정 취소
