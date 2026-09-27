# WorkBridge 사용 설명서

WorkBridge는 Codex, Claude Code, Cursor, ChatGPT 대화를 선택하여 다른 운영체제로 옮기는 데스크톱 앱입니다. Ubuntu/Linux와 macOS를 우선 지원합니다.

## 지원하는 데이터

- Codex 로컬 작업
- Claude Code 로컬 작업 (`~/.claude/projects`)
- Cursor 에이전트 대화 (`~/.cursor/projects/*/agent-transcripts`)
- ChatGPT 데이터 내보내기 (`ZIP`, `JSON`)
- Git 저장소의 커밋 기록과 staged/unstaged 변경 사항(선택 사항)

로그인 토큰과 쿠키는 묶음에 넣지 않습니다. 단, Git에 이미 커밋된 비밀 값은 Git 기록에 포함될 수 있습니다.

## Linux 설치

GitHub Releases에서 `WorkBridge-버전-linux-x64.sh`를 내려받은 뒤 실행합니다.

```bash
chmod +x WorkBridge-*-linux-x64.sh
./WorkBridge-*-linux-x64.sh
```

Electron 보안 샌드박스 설정을 위해 설치 중 관리자 암호를 한 번 요청합니다. 앱은 `${XDG_DATA_HOME:-$HOME/.local/share}/workbridge`에 설치됩니다. 기존 버전은 시간 표시가 붙은 폴더에 백업됩니다.

## macOS 설치

Apple Silicon Mac은 `arm64.dmg`, Intel Mac은 `x64.dmg`를 받습니다.

1. DMG를 엽니다.
2. WorkBridge를 Applications 폴더로 옮깁니다.
3. 처음 실행 시 macOS가 차단하면 시스템 설정 → 개인정보 보호 및 보안에서 실행을 허용합니다.

현재 자동 빌드는 코드 서명과 Apple 공증을 하지 않습니다. 공개 배포 전 Developer ID 서명과 공증이 필요합니다.

## 대화 내보내기

1. `내보내기` 화면에서 Codex, Claude Code, Cursor 또는 ChatGPT export를 불러옵니다.
2. 대화를 선택합니다. `전체 선택`으로 표시된 항목을 한 번에 선택할 수 있습니다.
3. 오른쪽 대화 미리보기를 스크롤하여 내용을 확인합니다.
4. 필요하면 `Git 프로젝트 포함`을 켭니다.
5. `선택 항목 내보내기`를 눌러 `.workbridge` 파일을 저장합니다.

## 다른 OS에서 가져오기

1. `.workbridge` 파일을 새 기기로 복사합니다.
2. WorkBridge에서 `묶음 가져오기`를 누릅니다.
3. 대화를 확인하고 필요하면 프로젝트를 복원합니다.
4. `Codex에서 이어가기`를 눌러 감지된 Codex에 새 작업으로 연결합니다.

## Codex 경로 설정

설정 → Codex 위치에서:

- `자동 감지`: 데스크톱 앱 내장 Codex를 먼저 찾고 일반 CLI와 Snap을 차례로 확인합니다.
- `입력`: 실행 파일 전체 경로를 직접 입력합니다.

Linux 데스크톱 앱의 일반적인 경로는 `/usr/lib/chatgpt/resources/codex`입니다.

## 원본 Codex 작업 삭제

내보내기 목록에서 작업을 선택하고 `삭제`를 누릅니다. 확인창에서 삭제하면 복구할 수 없습니다. 현재 원본 영구 삭제는 Codex 작업만 지원합니다.

## WorkBridge Cloud

대화 묶음은 업로드 전에 기기에서 AES-256-GCM으로 암호화됩니다. 서버는 대화 원문이나 암호화 비밀번호를 알 수 없습니다. 다른 OS에서도 같은 암호화 비밀번호가 필요하며 분실 시 복구할 수 없습니다.

현재 저장소에 포함된 서버는 개인용 self-hosted MVP입니다. 기본 주소 `http://127.0.0.1:8787`은 로컬 테스트용이며 서버를 별도로 실행해야 합니다.

```bash
npm run cloud:start
```

원격 서버는 HTTPS가 필요합니다. 자세한 내용은 [클라우드 서버 설명서](cloud/README.md)를 확인하세요.

## 개발 및 빌드

```bash
npm ci
npm run check

# Linux
npm run dist:linux
npm run package:linux

# macOS에서만 실행
./scripts/build-mac.sh
```

`v0.3.2`처럼 `v*` 태그를 GitHub에 푸시하면 Linux 설치 파일과 두 종류의 DMG가 GitHub Release에 자동 첨부됩니다.

## 제한 사항

- 일반 ChatGPT 대화를 원래 ChatGPT 사이드바에 직접 삽입하지 않습니다.
- Claude Code와 Cursor의 저장 형식이 변경되면 감지 기능 업데이트가 필요합니다.
- Cloud 서버는 아직 공개 멀티테넌트 서비스용 보안 기능을 갖추지 않았습니다.
- Windows 설치 파일은 아직 지원하지 않습니다.
