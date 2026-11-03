/* S2 — 입력 폴더의 자료 종류 표시 (세션 1)
 * ※ emile-report 스킬의 예시 파일이다. 내용은 전부 지어낸 합성 예시이고, 실제 슬라이스 파일은 아래 머리 주석 칸을 실제 문서 경로로 채운다.
 * 근거: docs/specs/2026-01-10-input-kind-design.md §2 목표 · §4.1 폴더 규칙 · §6 화면
 *       docs/plans/2026-01-10-input-kind.md (Task 1~6, §9 실행 기록의 수치)
 *       docs/masterplans/20260105-0900-mixed-inputs-master-plan.md (S2 행)
 *       src/screens/FilesViewer.tsx (트리 오른쪽 메모의 영어 낱말: "converted" · "skipped")
 * 병합: PR #123 → main a1b2c3d4 (2026-01-14). 앱 확인 2026-01-14 완료.
 * ⚠assumption 1: 트리의 파일 이름은 설명용 합성 이름이다. 고객 파일 이름이 아니다.
 * ⚠assumption 2: 창 폭은 덱의 무대에 맞춰 줄였다(실제 트리 폭 240px → 170px).
 */
(function () {
  var u = DECK.ui;

  /* ── 슬라이드 1: 한 장 요약 ── */
  var slide1 = u.summary({
    before: [
      "입력 폴더에 섞여 들어온 파일을 앱은 종류를 가리지 않고 한 목록으로 보였다. 어떤 파일이 변환되고 어떤 파일이 건너뛰어지는지 화면에서 알 수 없었다.",
      "건너뛴 파일은 로그에만 남았다."
    ],
    after: [
      "파일 트리의 각 줄 오른쪽에 앱이 그 파일을 어떻게 다루는지(converted · skipped)가 붙는다.",
      "건너뛴 파일은 노란 줄로 표시되고, 이유가 마우스를 올리면 보인다."
    ],
    meta: [["PR", "#123"], ["요구사항", "REQ-7"], ["병합", "2026-01-14"]],
    not: "하지 않는 것: 파일을 자동으로 옮기거나 지우지 않는다. 표시만 더한다."
  });

  /* ── 슬라이드 2: 무엇이 바뀌었나 — 전 / 후 ── */
  var before2 = u.filesView({
    h: 360, treeW: 170,
    tree: u.tree([
      [0, "Inputs", "dir"],
      [1, "spec.pdf", "file"],
      [1, "wiring.pdf", "file"],
      [1, "signals.xlsx", "file"],
      [1, "vehicle.dbc", "file"],
      [1, "firmware", "dir"],
      [2, "*.c · *.h", "file", "", "dim"]
    ]),
    path: "Inputs/",
    body: '<div style="padding:10px;color:var(--muted-foreground)">' + u.pin(1) + " 파일 6개가 한 목록으로 보인다. 어떤 파일을 읽는지 알 수 없다.</div>"
  });
  var after2 = u.filesView({
    h: 360, treeW: 170,
    tree: u.tree([
      [0, "Inputs", "dir"],
      [1, "spec.pdf", "file", "converted"],
      [1, "wiring.pdf", "file", "converted"],
      [1, "signals.xlsx", "file", "converted"],
      [1, "vehicle.dbc", "file", "skipped", "warn"],
      [1, "firmware", "dir", "skipped", "warn"],
      [2, "*.c · *.h", "file", "", "dim"]
    ]),
    path: "Inputs/vehicle.dbc",
    /* .m-pop과 u.pin(n, style)의 절대 위치는 창(.m-win) 기준이다: 제목 막대 24 + 탭 줄 26 = 50px 아래부터 본문.
     * body는 오른쪽 칸(.m-fpane, overflow hidden) 안에 들어가므로 핀 · 팝오버는 트리 폭(treeW)보다 오른쪽에 둔다 */
    body: '<div class="m-pop" style="top:100px;left:200px;width:230px"><div class="m-pop-title">Skipped</div>Not a convertible type (pdf · docx · pptx · xlsx · md).</div>' +
      u.pin(2, "top:124px;left:178px")
  });
  var slide2 =
    u.ba(before2, after2, { before: "종류 표시 없음", after: "줄마다 converted · skipped" }) +
    u.caps([
      [1, "전에는 트리가 파일 이름만 보였다. 건너뛴 파일은 로그에만 남았다."],
      [2, "후에는 오른쪽 메모와 노란 줄로 건너뛴 파일이 드러나고, 이유 팝오버가 뜬다."]
    ]);

  /* ── 슬라이드 3: 어떻게 동작하나 ── */
  function fb(title, text, key) { return '<div class="flow-box' + (key ? " is-key" : "") + '"><b>' + title + "</b>" + text + "</div>"; }
  var AR = '<div class="flow-arrow"></div>';
  var slide3 =
    '<div class="flow">' +
      fb("1. 걷기", "입력 폴더를 한 번 읽어 파일 목록을 만든다") + AR +
      fb("2. 판정", '확장자 표(<span class="s-code">input-kinds.ts</span>)로 converted · skipped를 정한다', true) + AR +
      fb("3. 기록", '<span class="s-code">.app/input-kinds.json</span>에 파일마다 판정과 이유를 적는다') + AR +
      fb("4. 표시", "트리가 그 기록을 읽어 메모와 색을 붙인다") +
    "</div>" +
    '<div class="two">' +
      '<div class="box"><h4>말없이 버리는 길이 없다</h4><ul><li>판정 표에 없는 확장자는 <b>skipped</b>로 적고 이유를 "unknown type"으로 남긴다.</li><li>기록 파일이 없으면 트리는 메모 없이 그린다(실패가 아니라 "아직 안 읽음").</li></ul></div>' +
      '<div class="box"><h4>건드리지 않은 것</h4><ul><li>변환기 자체 · 파일 이동 · 삭제</li><li>Workflow 탭</li></ul></div>' +
    "</div>";

  /* ── 슬라이드 4: 수치 (계획 §9 실행 기록의 값만) ── */
  var slide4 =
    '<p class="s-small" style="margin:0 0 8px">계획 §9 실행 기록(2026-01-13)의 값이다. 합성 입력 폴더 1개로 쟀다.</p>' +
    u.stats([
      ["6", "파일", "판정 converted 3 · skipped 3", true],
      ["0.4 s", "걷기 + 판정", "두 번째 실행 0.1 s(기록 재사용)"],
      ["12", "테스트", "판정 표 8 · 트리 표시 4"],
      ["0", "게이트 실패", "typecheck · lint · build · test"]
    ], 4) +
    '<p class="note" style="margin-top:8px">[INFO-INSUFFICIENT: 실제 고객 폴더의 수치 — 아직 재지 않음]</p>';

  DECK.add({
    id: "s2",
    session: "세션 1",
    title: "S2 — 입력 폴더의 자료 종류 표시",
    pr: "#123",
    date: "2026-01-14",
    req: "REQ-7",
    slides: [
      { title: "한 장 요약", html: slide1 },
      { title: "무엇이 바뀌었나 — 파일 트리의 종류 표시", html: slide2 },
      { title: "어떻게 동작하나 — 걷기 · 판정 · 기록 · 표시", html: slide3 },
      { title: "수치", html: slide4 }
    ]
  });
})();
