#!/usr/bin/env node
// emile-report — deck checker.
//   node check-deck.mjs <deck-dir> [--slice sN] [--shots <out-dir>] [--chrome <path>]
// 1) node --check every slides/*.js
// 2) every <script src="slides/..."> in index.html: present or missing (missing = slice not written yet, reported, not an error)
// 3) headless Chrome: load index.html?check and print the <pre id="check-report"> JSON (overflow must be empty)
// 4) --shots: one PNG per slide (1300x780 window) into <out-dir>; with --slice sN only that slice's slides
//    (needs the template engine's data-slice on each slide; an older deck without it is shot in full)
import { readFileSync, readdirSync, existsSync, mkdirSync } from "node:fs";
import { execFileSync, spawnSync } from "node:child_process";
import { resolve, join } from "node:path";
import { pathToFileURL } from "node:url";

const args = process.argv.slice(2);
const deckDir = args[0] && !args[0].startsWith("--") ? resolve(args[0]) : null;
if (!deckDir || !existsSync(join(deckDir, "index.html"))) {
  console.error("usage: node check-deck.mjs <deck-dir> [--shots <out-dir>] [--chrome <path>]  (deck-dir must hold index.html)");
  process.exit(2);
}
const opt = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : null; };
const shotsDir = opt("--shots");
const onlySlice = (opt("--slice") || "").toLowerCase();
let chrome = opt("--chrome") || process.env.CHROME_PATH || null;
if (!chrome) {
  for (const c of [
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser"
  ]) if (existsSync(c)) { chrome = c; break; }
}

let failed = false;
const say = (s) => console.log(s);

// 1) syntax
const slidesDir = join(deckDir, "slides");
const files = existsSync(slidesDir) ? readdirSync(slidesDir).filter((f) => f.endsWith(".js")).sort() : [];
for (const f of files) {
  const r = spawnSync(process.execPath, ["--check", join(slidesDir, f)], { encoding: "utf8" });
  if (r.status !== 0) { failed = true; say(`SYNTAX  ${f}\n${r.stderr.trim()}`); } else say(`ok      ${f}`);
}

// 2) referenced vs present
const html = readFileSync(join(deckDir, "index.html"), "utf8");
const refs = [...html.matchAll(/<script src="(slides\/[^"]+)"/g)].map((m) => m[1]);
const missing = refs.filter((p) => !existsSync(join(deckDir, p)));
const orphans = files.filter((f) => !refs.includes("slides/" + f));
say(`refs    ${refs.length} referenced, ${missing.length} not yet written${missing.length ? ": " + missing.join(", ") : ""}`);
if (orphans.length) { failed = true; say(`ORPHAN  slide files index.html does not reference: ${orphans.join(", ")}`); }

// 3) ?check through headless Chrome
if (!chrome) {
  say("chrome  not found — set CHROME_PATH or pass --chrome; skipped ?check and screenshots");
} else {
  const url = pathToFileURL(join(deckDir, "index.html")).href;
  const base = ["--headless=new", "--disable-gpu", "--no-first-run", "--hide-scrollbars"];
  let dom = "";
  try {
    dom = execFileSync(chrome, [...base, "--dump-dom", url + "?check"], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024, stdio: ["ignore", "pipe", "ignore"] });
  } catch (e) { failed = true; say(`CHROME  dump-dom failed: ${e.message}`); }
  const m = /<pre id="check-report">([\s\S]*?)<\/pre>/.exec(dom);
  if (!m) { failed = true; say("CHECK   no <pre id=\"check-report\"> in the dumped DOM (engine error before check ran?)"); }
  else {
    const unesc = (s) => s.replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
    const rep = JSON.parse(unesc(m[1]));
    const order = Array.isArray(rep.slice_of_slide) ? rep.slice_of_slide.map((s) => String(s).toLowerCase()) : null;
    const mine = (line) => !onlySlice || !order || /^slide (\d+)/.exec(line) && order[Number(RegExp.$1) - 1] === onlySlice;
    say(`check   slides ${rep.slides} · problems ${rep.problems.length} · overflow ${rep.overflow.length} · clipped ${rep.clipped.length}` + (onlySlice ? ` · filter ${onlySlice}${order ? "" : " (deck has no data-slice: showing all)"}` : ""));
    for (const p of rep.problems) { failed = true; say(`PROBLEM ${p}`); }
    for (const o of rep.overflow) { if (mine(o)) failed = true; say(`${mine(o) ? "OVERFLW" : "overflw"} ${o}${mine(o) ? "" : "   (another slice — report, do not fix)"}`); }
    for (const c of rep.clipped) if (mine(c)) say(`clipped ${c}   (inside a mock window — confirm it is intended)`);
    // 4) screenshots
    if (shotsDir) {
      mkdirSync(shotsDir, { recursive: true });
      const nums = [];
      for (let n = 1; n <= rep.slides; n++) if (!onlySlice || !order || order[n - 1] === onlySlice) nums.push(n);
      for (const n of nums) {
        const png = join(resolve(shotsDir), `slide-${String(n).padStart(2, "0")}${order && order[n - 1] ? "-" + order[n - 1] : ""}.png`);
        try {
          execFileSync(chrome, [...base, "--window-size=1300,780", `--screenshot=${png}`, `${url}#/${n}`], { stdio: "ignore" });
        } catch (e) { say(`SHOT    slide ${n} failed: ${e.message}`); }
      }
      say(`shots   ${nums.length} PNG(s) in ${resolve(shotsDir)}`);
    }
  }
}
say(failed ? "RESULT  FAIL" : "RESULT  OK");
process.exit(failed ? 1 : 0);
