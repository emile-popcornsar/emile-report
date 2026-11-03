/* S0 — {{BUNDLE_TITLE}}: 배경과 지도 ({{SESSION}})
 * 근거: {{MASTERPLAN_PATH}} (목적/배경, 슬라이스 목록, 순서와 의존)
 *       {{SPEC_PATH}} (있으면: 의도, 목표 · 비목표)
 * 상태: 이 파일은 덱이 생길 때 한 번 쓰고, 그 뒤에는 STATUS 표의 줄만 바뀐다.
 * 자료 규칙: 고객 자료를 쓰지 않는다. 예시 값은 전부 합성이다.
 */
(function () {
  var u = DECK.ui;

  /* ── 슬라이스 지도 상태 ──
   * 각 세션은 자기 슬라이스의 줄만 고친다(state = "완료" | "진행 중" | "미착수", date = 병합일 또는 사양 승인일).
   * 표지 · 목차 · 바닥글의 배지는 이 표를 읽는다. 등록 객체의 status는 이 표에 없는 슬라이스에만 쓰인다. */
  var STATUS = {
    S0: { state: "완료", date: "{{DATE}}" }
    /* , S1: { state: "미착수", date: "" } … 마스터플랜의 슬라이스 전부 */
  };
  DECK.sliceStatus = STATUS;

  /* ── 슬라이드 1: 한 장 요약 — 왜 이 묶음인가 ── */
  var slide1 = u.summary({
    before: [
      "{{BEFORE_1: 이 묶음 전에는 무엇을 할 수 없었나 — 문서(마스터플랜 목적/배경)의 문장으로}}",
      "{{BEFORE_2}}"
    ],
    after: [
      "{{AFTER_1: 이 묶음이 끝나면 무엇이 되나 — 슬라이스 수와 순서를 한 문장으로}}",
      "{{AFTER_2}}"
    ],
    meta: [["지시", "{{WHO_WHEN}}"], ["마스터플랜", "{{MASTERPLAN_FILE}}"], ["브랜치", "{{BRANCH}}"]],
    not: "하지 않는 것: {{NOT_IN_SCOPE — 마스터플랜 비목표 그대로}}"
  });

  /* ── 슬라이드 2: 지도 — 슬라이스와 순서 ──
   * rows = [[id, 무엇을 바꾸나, 어디가 바뀌나]]. 상태 · 날짜는 STATUS에서 읽는다. */
  var slide2 =
    '<p class="s-lead">{{MAP_LEAD: 묶음을 몇 조각으로 나눴고 왜 그 순서인지 한두 문장}}</p>' +
    u.mapTable([
      ["s0", "설계 · 요구사항 · 이 덱의 뼈대", "문서만"]
      /* , ["s1", "…", "…"] */
    ]) +
    '<p class="note" style="margin-top:8px">상태는 각 슬라이스가 끝날 때 그 세션이 이 파일의 STATUS 표에서 자기 줄만 고친다.</p>';

  DECK.add({
    id: "s0",
    session: "{{SESSION}}",
    title: "S0 — {{BUNDLE_TITLE}}: 배경과 지도",
    pr: "",
    date: "{{DATE}}",
    req: "{{REQ_IDS}}",
    slides: [
      { title: "한 장 요약 — 왜 이 묶음인가", html: slide1 },
      { title: "지도 — 슬라이스와 순서", html: slide2 }
    ]
  });
})();
