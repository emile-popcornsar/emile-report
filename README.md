# emile-report

[Claude Code](https://claude.com/claude-code) skill that builds and maintains a human-readable report deck — HTML slides showing before/after screens per slice of a work bundle.

여러 세션에서 병렬로 진행한 작업 묶음(번들)이 **무엇을 바꿨는지** 슬라이스마다 **전 · 후 화면**으로 보여 주는 HTML 슬라이드 덱을 만들고 유지하는 Claude Code 스킬입니다. 나중에 "그 슬라이스가 무슨 기능이었지"를 떠올리는 리마인더이자, 팀에 구현 결과를 설명하는 보고 자료입니다. 글로만 설명하지 않고 실제 앱 화면을 HTML/CSS로 흉내 내어 전과 후를 나란히 놓는 것이 핵심입니다.

## When it triggers

- 작업 묶음(마스터플랜의 슬라이스 여러 개)에 보고용 덱이 아직 없을 때
- 슬라이스 하나가 끝나(PR 생성 · 병합) 그 슬라이스의 슬라이드를 더하거나 갱신해야 할 때
- 사용자가 "보고용 덱", "슬라이드 덱 갱신", "전/후 슬라이드" 등을 요청하거나 `/emile-report`를 입력했을 때

**쓰지 않을 때:** 슬라이스 하나로 끝나는 작은 변경. 그런 것은 PR 본문이면 충분합니다.

## What it produces

덱 하나 = 폴더 하나(`YYMMDD_<주제>/`). 서버도 인터넷도 없이 `index.html`을 더블클릭하면 열리고, `Print`로 PDF가 됩니다.

```
YYMMDD_<topic>/
├─ index.html          엔진(표지 · 목차 · 인쇄 · 넘침 검사) + 화면 흉내 도우미. 맨 위 DECK_CONFIG만 채운다
├─ deck.css            공용 스타일(제품 테마 토큰은 :root 한 곳)
├─ README.md           이 덱의 규약(여는 법 · 등록 약속 · 도우미 표 · 글쓰기 규칙 · 확인)
└─ slides/
   ├─ s0-map.js        배경과 지도. 맨 위 STATUS 표가 모든 슬라이스의 상태 · 병합일
   └─ sN-<topic>.js    슬라이스 하나 = 파일 하나. DECK.add({ id, session, title, pr, date, req, slides })
```

슬라이스마다 슬라이드는 네 가지 모양을 따릅니다.

1. **한 장 요약** — 전에는 / 이제는 / PR · 요구사항 / 하지 않는 것
2. **무엇이 바뀌었나 — 전 · 후** (필수, 한 장 이상) — 실제 앱처럼 그린 화면 둘을 나란히, 바뀐 곳에 번호 핀과 설명
3. **어떻게 동작하나** — 작은 흐름도 · 표 · 상자
4. **수치** (선택) — 사양 · 계획 · 핸드오프에 적힌 숫자만

## Modes

호출될 때마다 어떤 파일을 쓰기 전에 먼저 판별합니다.

| 상황 | 모드 |
|---|---|
| 이 묶음의 덱 폴더가 없다 | **NEW** — 템플릿을 복사해 설정 · README · 지도를 채우고 슬라이스 script 줄을 전부 미리 등록 |
| 덱은 있고 내 슬라이스 파일이 없다 | **ADD** — 그 덱의 README를 기준으로 슬라이스 파일 하나 작성 |
| 내 슬라이스 파일이 이미 있다 | **UPDATE** — 상태 · PR · 병합일 · 머리 주석 갱신, 구현이 바뀌었으면 "후" 화면 다시 그림 |

병렬 세션이 같은 덱을 키우므로 **자기 슬라이스 파일과 지도 STATUS 표의 자기 줄만** 고칩니다. `index.html` · `deck.css` · 남의 파일은 읽기만 합니다.

## Where the deck lives

덱은 작업 저장소 **밖**의 덱 보관 폴더에 만듭니다. 그 폴더가 어디인지는 사용자가 말했거나 Claude 메모리에 기록이 있을 때만 압니다. **기록이 없거나 후보가 둘 이상이면 폴더를 만들기 전에 반드시 사용자에게 묻고**, 답을 메모리에 저장해 다음부터 묻지 않습니다.

## Rules the slides follow

- 모든 주장은 사양 · 계획 · 마스터플랜 · 코드 · 핸드오프에서 옵니다. 슬라이스 파일 머리 주석에 그 경로와 PR · 병합 해시를 적습니다. 확인할 수 없는 것은 `[INFO-INSUFFICIENT: …]`로 남기고 지어내지 않습니다.
- 고객 자료(파일 이름 · 신호 이름 · 제품 이름)는 넣지 않고 자리표시(`<stem>`, `SIG_A`)를 씁니다. 예시 값은 합성입니다.
- 슬라이드 글은 한국어(쉬운 말), 앱 UI 낱말 · 식별자는 영어 그대로. 이모지는 쓰지 않습니다.
- 외부 글꼴 · 스크립트 · 이미지 · `fetch`를 쓰지 않습니다(`file://`로 열립니다).

## Checking

```bash
node ~/.claude/skills/emile-report/scripts/check-deck.mjs <deck-dir> --shots <deck-dir>/.shots
```

슬라이스 파일 문법, `index.html`이 가리키는 파일의 존재, 헤드리스 Chrome으로 그린 뒤의 넘침(overflow) · 잘림(clipped), 슬라이드별 PNG를 한 번에 확인합니다. 브라우저 확장은 쓰지 않습니다.

## Install

Claude Code는 `~/.claude/skills/<name>/`(전역) 또는 `<repo>/.claude/skills/<name>/`(프로젝트 한정) 아래의 `SKILL.md`를 스킬로 인식합니다.

```bash
git clone https://github.com/emile-popcornsar/emile-report.git ~/.claude/skills/emile-report
```

Node.js(검사 스크립트)와 로컬 Chrome(넘침 검사 · 스크린샷)이 있으면 확인까지 됩니다. Chrome이 없으면 문법 · 참조 검사만 돌고 나머지는 건너뜁니다.

## Usage

Claude Code 세션에서:

```
/emile-report
```

또는 자연어로 "이 슬라이스 덱에 더해줘", "보고용 덱 만들어줘"라고 요청하면 스킬 설명(description)을 보고 자동으로 매칭됩니다.

## Related

- [emile-masterplan](https://github.com/emile-popcornsar/emile-masterplan) — 슬라이스 목록과 진행 상황표의 소유자. 덱의 지도는 마스터플랜을 그대로 옮긴 것이고, 슬라이스가 끝나면 마스터플랜 UPDATE와 함께 이 스킬로 덱을 갱신합니다.
- [emile-handoff](https://github.com/emile-popcornsar/emile-handoff) — 슬라이스 중간에 세션이 끊길 때의 단기 기억. 덱은 끝난 슬라이스만 담습니다.

## License

MIT
