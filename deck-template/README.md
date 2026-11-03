# {{DECK_NAME}} 슬라이드

{{BUNDLE_TITLE}} 묶음({{SLICE_RANGE}})이 {{PRODUCT}}에서 무엇을 바꿨는지 슬라이스마다 전 · 후 화면으로 보이는 슬라이드다. 지도는 `{{MASTERPLAN_PATH}}`({{REPO_NAME}} 저장소, 브랜치 `{{BRANCH}}`)다. {{SESSIONS}}이 각자 자기 슬라이스 파일을 이 한 덱에 더한다.

이 덱은 `emile-report` 스킬의 템플릿으로 만들었다. 엔진(`index.html`) · 공용 스타일(`deck.css`) · 이 README의 규약은 그 템플릿과 같다.

## 여는 법

- `index.html`을 더블클릭한다. 서버도 인터넷도 필요 없다(`file://`로 열린다).
- 키: `→` · `Space` · `PageDown` 다음, `←` · `PageUp` 이전, `Home` 처음, `End` 끝, `Esc` 목차 닫기.
- 왼쪽 위 `목차`는 세션 → 슬라이스 → 슬라이드 순서의 목차를 연다.
- PDF로 남기기: 오른쪽 위 `Print` 버튼을 누르고 인쇄 대상을 "PDF로 저장"으로 고른다. 슬라이드 한 장이 한 쪽(1280 × 720)이다. 배경 그래픽 인쇄를 켠다. `index.html?print`를 열어 Ctrl+P를 눌러도 같다.
- 주소 끝의 `#/5`는 다섯째 슬라이드다. 링크로 특정 슬라이드를 가리킬 수 있다.

## 파일

| 파일 | 내용 | 누가 고치는가 |
|---|---|---|
| `index.html` | 덱 틀, 표지, 목차, 인쇄, `DECK` 등록 창구와 화면 흉내 도우미, 맨 위 `DECK_CONFIG`, 슬라이스 script 목록(전부 미리 적혀 있음) | `released` 맵과 새 슬라이스의 script 줄만 {{OWNER_SESSION}}. 다른 세션은 고치지 않는다 |
| `deck.css` | 무대 · 글자 · 화면 흉내 부품 | 고치지 않는다 |
| `slides/s0-map.js` | S0: 배경과 지도. 맨 위 `STATUS` 표가 모든 슬라이스의 상태 · 병합일 | 자기 슬라이스의 **STATUS 줄만** 각 세션 |
| `slides/sN-<topic>.js` | 슬라이스 하나의 슬라이드 전부 | 그 슬라이스의 세션 |

## 슬라이스와 담당

| 슬라이스 | 파일 | 담당 |
|---|---|---|
| S0 | `slides/s0-map.js` | {{OWNER_SESSION}} |
{{SLICE_TABLE_ROWS}}

**규칙: 자기 슬라이스 파일만 만들고 고친다. `index.html`과 `deck.css`는 고치지 않는다.** 다른 세션의 파일도 고치지 않는다. 공용 부품에 없는 모양이 필요하면 자기 슬라이스의 `html` 안에 `<style>`을 넣는다. 그 `<style>`은 덱 전체에 걸리므로 클래스 이름 앞에 슬라이스 id를 붙인다(예: `.s7-matrix`).

**예외 한 가지 — 슬라이스 지도.** `slides/s0-map.js` 맨 위의 `STATUS` 표는 모든 슬라이스의 상태(`"완료"` · `"진행 중"` · `"미착수"`)와 병합일이다. 자기 슬라이스가 진행 중이 되거나 병합되면 **그 표의 자기 줄만** 고친다. 표지 · 목차 · 바닥글의 배지는 이 표에서 읽는다.

**릴리스 포함 표시**: 어느 슬라이스가 어느 릴리스에 들어갔는지는 `index.html`의 `DECK_CONFIG.released`(`{ "v0.1.3": ["s1", …] }`)에 슬라이스 id를 넣어 표시한다. 기준은 그 릴리스가 잘린 main 커밋에 병합된 PR이다. 표지 · 바닥글 · 목차에 파란 꼬리표 "vX.Y.Z 포함"이 붙는다.

## `DECK.add` 약속

```js
(function () {
  var u = DECK.ui;                 // 화면 흉내 도우미 (아래)
  DECK.add({
    id: "s7",                      // 필수. "sN" — 덱 안에서 유일
    session: "세션 2",             // 필수. 목차 · 표지가 이 이름으로 묶는다
    title: "S7 — 요구 항목 속성 칸", // 필수. "S7 — " 앞부분이 바닥글 · 표지의 슬라이스 이름이 된다
    pr: "#276",                    // 선택. 없으면 "" (바닥글에서 빠진다)
    date: "YYYY-MM-DD",            // 선택. 병합일 또는 사양 승인일. 표지의 기준일은 가장 늦은 날짜
    req: "REQ-71",                 // 선택. 요구사항 ID
    status: "진행 중",             // 선택. s0의 STATUS 표에 없는 슬라이스에만 쓰인다
    slides: [                      // 필수. 순서대로
      { title: "한 장 요약", html: u.summary({ /* … */ }) },
      { title: "무엇이 바뀌었나 — …", html: u.ba(/* 전 */ "", /* 후 */ "") + u.caps([[1, "…"]]) }
    ]
  });
})();
```

- `html`은 HTML 문자열이다. 무대는 1280 × 720이고 본문 칸은 약 1200 × 590이다. 넘치는 부분은 잘린다. 전 · 후 창 높이는 보통 `h: 330` ~ `470`, 아래 `u.caps` 두세 줄이 들어갈 자리를 남긴다.
- 슬라이드는 화면용과 인쇄용으로 두 번 그려지므로 `id` 속성을 쓰지 않는다.
- `file://`로 열리므로 `fetch` · `import`를 쓰지 않는다. 외부 글꼴 · 스크립트 · 이미지를 쓰지 않는다.
- 바닥글(슬라이스 이름 · 세션 · PR · 요구사항 · 쪽 번호)은 덱이 자동으로 붙인다.
- 등록에 실패하면(필수 칸 빠짐, 같은 id) 표지에 붉은 글로 이유가 나온다.

## 슬라이스의 슬라이드 만드는 법

1. **한 장 요약** (`u.summary`): 전에는 무엇을 할 수 없었고 이제 무엇을 할 수 있는지 2~4문장. PR 번호와 요구사항 ID를 `meta`에, 하지 않는 것을 `not`에 적는다.
2. **무엇이 바뀌었나 — 전 / 후** 한 장 이상 (`u.ba`): 왼쪽에 슬라이스 전의 화면, 오른쪽에 후의 화면. 바뀐 곳에 번호 핀(`u.pin`)을 꽂고 아래 `u.caps`로 핀마다 한두 문장, 2 ~ 4개. 화면은 실제 앱처럼(창 틀, 탭 줄, 앱이 쓰는 영어 낱말 그대로) 그리고, 도식이나 말로만 설명하지 않는다. "전" 상태가 "표가 비어 있었다"면 비어 있는 그대로 그린다.
3. **어떻게 동작하나** (`.flow` · `u.table` · `.box`): 쓰는 파일과 흐름을 작은 흐름도나 표 하나와 상자 한두 개로.
4. **수치** (선택, `u.stats`): 모든 숫자는 사양 · 계획 · 핸드오프 · 마스터플랜에 적힌 값이다. 문서에 없는 숫자는 쓰지 않는다.

제목은 12낱말 이하, 글머리 한 줄은 두 줄을 넘기지 않는다.

## 글쓰기 규칙

- 슬라이드 글은 한국어(한다체나 짧은 명사구), 작업을 보지 않은 관리자가 읽는 쉬운 말로 쓴다. 개발 용어(overlay · fingerprint · IPC 등)는 쓰지 않거나 한 구절로 풀어 쓴다.
- 화면 흉내 안의 UI 낱말 · 코드 · 식별자 · 파일 경로는 앱이 보이는 영어 그대로 쓴다(코드의 낱말 파일이나 사양에서 옮긴다).
- **고객 자료를 넣지 않는다.** 고객 파일 이름, 고객 신호 이름, 고객 회사 제품 이름을 쓰지 않는다. 자료는 종류로 부르고(예: "설계사양서 PDF"), 파일 이름 자리는 `<stem>`, 신호 이름은 `SIG_A` · `SIG_B` … 같은 자리표시를 쓴다.
- 예시 자료는 이 덱의 고정 예시 세트만 쓴다: 프로젝트 `{{EXAMPLE_PROJECT}}`, 사람 이름 {{EXAMPLE_PEOPLE}}.
- **이모지를 쓰지 않는다.** 아이콘이 필요하면 CSS 모양(`u.img` · `u.check`)이나 인라인 SVG를 쓴다. 이름은 "기준 출력"처럼 무엇인지 드러나는 낱말로 짓고, 뜻이 흐린 미칭은 쓰지 않는다.
- 상태는 글로 쓴다: "완료" · "진행 중" · "미착수"(`u.state`).
- 모든 주장은 사양 · 계획 · 코드 · 핸드오프에서 온다. 확인할 수 없는 것은 지어내지 않고 빼거나 `[INFO-INSUFFICIENT: …]`로 적는다. 화면 흉내 안의 생략은 `…`로 둔다.
- 슬라이스 파일 머리 주석에 근거 문서 경로와 PR · 병합 해시 · `⚠assumption`(설명용 값, 줄인 창 폭 등)을 적는다.
- 아직 병합되지 않은 슬라이스는 STATUS 표를 "진행 중"으로 두고, 그림이 사양의 장면을 따랐다는 사실을 요약 슬라이드에 적는다.

## 화면 흉내 도우미 `DECK.ui`

글 인자는 따로 적지 않으면 HTML이다.

| 함수 | 쓰임 |
|---|---|
| `u.esc(s)` | HTML 이스케이프. `<!-- … -->`, `<table>` 같은 원문을 글로 보일 때 |
| `u.pin(n, style)` | 번호 핀. `style`(`"top:10px;left:20px"`)을 주면 절대 위치 |
| `u.ba(before, after, { before, after, stack, cols })` | 전 · 후 두 칸. 문자열 둘은 칸 제목 옆 부제. `stack: true`는 위아래, `cols: "2fr 3fr"`는 칸 너비 |
| `u.caps([[1, "설명"], …], one)` | 핀 설명 목록(기본 두 열, `one`이면 한 열) |
| `u.summary({ before: [], after: [], meta: [[키, 값]], not })` | "한 장 요약" 본문 |
| `u.state(s)` | 진행 상태 알약: `"완료"`(초록) · `"진행 중"`(노랑) · `"미착수"`(회색) |
| `u.check()` | 초록 체크 표시 |
| `u.win({ tab, project, h, body })` | 제품 창. 제목 막대 + 탭 줄(`DECK_CONFIG.tabs`) + 본문. `h`는 높이(px) |
| `u.frame(title, body, { h, sub })` | 앱 밖 창(저장소 파일 · 문서 보기 · 터미널). `title`은 글, `sub`는 제목 옆 흐린 글 |
| `u.src(lines, { start, wrap, nonum })` | 원문 줄 보기(마크다운 · 코드). 줄은 `"글"` 또는 `["글", 표시, 줄번호]`; 표시 = `"add"`(초록, +) · `"del"`(빨강, -) · `"hl"` · `"warn"` · `"dim"`. 글은 자동 이스케이프되고, `{ html: "…" }`를 주면 그대로 넣는다 |
| `u.tree(items)` | 파일 트리. `[[깊이, 이름, "dir"|"file", 오른쪽 메모 HTML, 표시 "hl"|"add"|"warn"|"dim"]]` |
| `u.filesView({ tree, path, body, h, project, tab, treeW })` | 파일 탭 창: 왼쪽 트리 + 오른쪽 파일 보기(`path` 머리줄 + `body`) |
| `u.img(label, { w, h })` | 그림 자리표시(무늬 상자) |
| `u.table(head, rows, { widths, small })` | 설명용 슬라이드 표. `widths`는 열 너비 배열(`["180px", "auto"]`) |
| `u.stats(items, cols)` | 숫자 타일. `[[값, 이름, 보충, 강조 true]]`, `cols`는 한 줄의 타일 수 |
| `u.lanes(lanes)` | 갈래 지도. `[{ label, sub, items: [{ id, title, state, date }] }]` |
| `u.mapTable(rows)` | 지도 표. `[[id, 무엇, 어디]]` — 상태 · 날짜는 STATUS 표에서 읽고 행마다 `data-slice` |
| `u.wtable(rows, { head })` | Word 표 흉내(검은 칸선). 칸은 HTML 또는 `{ html, rs, cs, head }` |
| `u.wfig(label, inner)` · `u.word(body, { title, sub, h })` | Word 문서 안 그림 테두리 · Word 창 흉내 |
| `u.reqList(items)` | 요구 목록 흉내. `[[ID, 글, "add"|"chg"|""]]` |

### 제품 전용 도우미 ({{PRODUCT}})

{{PRODUCT_HELPERS: 제품 화면을 흉내 내는 도우미 표. 템플릿의 기본값은 문서 탭이 있는 본보기 제품 — u.toolbar · u.docs · u.side · u.badge · u.baseline · u.todo}}

## `deck.css` 부품

| 클래스 | 쓰임 |
|---|---|
| `.m-win` · `.m-titlebar` · `.m-tabs` · `.m-tab.is-active` · `.m-body` | 앱 창 틀 (보통 `u.win`으로 만든다) |
| `.m-btn` + `.m-btn-primary` · `.m-btn-danger` · `.m-btn-ghost` · `.m-btn-dashed` | 버튼. `dashed`는 누를 수 없는 버튼(점선 40%) |
| `.m-link` · `.m-muted` · `.m-check` · `.m-tickbox(.is-on)` | 링크 글, 흐린 글, 체크 표시, 체크 칸 |
| `.m-table` (`.is-narrow`) · `td.m-todo` · `.m-id` | 마크다운 표, 자리표시 칸, 고정폭 ID |
| `.hl` · `.hl-add` · `.hl-del` · `.hl-warn` · `.strike` | 칸 · 행 강조(파랑 선택 · 추가 · 삭제 · 주의), 취소선 |
| `.m-pop` · `.m-pop-title` · `.m-x` | 팝오버(창 안에서 `position:absolute`, `style`로 자리 지정) |
| `.m-field` · `.m-input` · `.m-textarea` · `.m-auto` · `.m-warn` · `.m-actions` | 입력 창 부품 |
| `.m-select(.is-changed)` | 선택 칸 |
| `.m-backdrop` · `.m-modal` · `.m-modal-head` · `.m-modal-body` · `.m-modal-foot` | 확인 창 |
| `.m-diff` · `.d-row` · `.d-n` · `.d-mark` · `.d-txt` · `.d-add` · `.d-del` · `.d-hunk` · `.d-fold` | 줄 차이 보기 |
| `.m-chip` + `.c-add` · `.c-del` · `.c-chg` | ID 칩 |
| `.m-canvas` · `.m-node` | 캔버스와 노드 |
| `.m-src` · `.ln` | 원본 글 보기와 줄 번호 |
| `.pin` (`.abs`) · `.ba` · `.ba-col` · `.ba-label` · `.caps` | 번호 핀, 전 · 후 배치, 핀 설명 |
| `.s-lead` · `.s-small` · `.note` · `.box` · `.two` · `.flow` · `.flow-box(.is-key)` · `.flow-arrow` · `.code` · `.s-code` | 설명 슬라이드용 글 · 상자 · 작은 흐름도 · 코드 상자 · 글 속 고정폭 낱말 |
| `.info-insufficient` | `[INFO-INSUFFICIENT: …]` 표시 |
| `.wip-badge` · `.done-badge` · `.rel-badge` · `.tag` | 노란 "진행 중" 배지, 초록 "완료" 배지, 파란 릴리스 꼬리표, 회색 꼬리표 |

## 확인

```bash
# 문법 · 참조 파일 · 넘침(overflow) · 잘림(clipped) · 자기 슬라이스의 슬라이드 PNG — emile-report 스킬의 검사기
node ~/.claude/skills/emile-report/scripts/check-deck.mjs . --slice sN --shots ./.shots/sN
```

- `overflow`는 슬라이드 밖으로 넘친 글(고칠 것), `clipped`는 화면 흉내 창 안에서 잘린 글(의도한 자르기인지 눈으로 확인할 것)이다. `index.html?check`를 직접 열어도 맨 아래에 같은 JSON이 붙는다.
- `.shots/sN/`의 PNG를 슬라이드마다 눈으로 본다(1280px 너비에서 넘치는 글이 없는지). `.shots/`는 검사 산출물이라 공유하거나 고치지 않는다.
