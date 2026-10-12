// usage: node render.mjs <film.html> <outDir> [--probe t1,t2,...] | [--fps 30]
import { chromium } from "/Users/kordellsmith/Repos/project-manager/node_modules/playwright/index.mjs";
import { spawn } from "node:child_process";
import path from "node:path";
const [film, out, flag, val] = process.argv.slice(2);
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 })).newPage();
await p.goto("file://" + path.resolve(film), { waitUntil: "networkidle" });
await p.evaluate(() => document.fonts.ready);
await p.waitForTimeout(500);
if (flag === "--probe") {
  for (const t of val.split(",").map(Number)) {
    await p.evaluate((t) => window.seek(t), t);
    await p.screenshot({ path: `${out}/probe-${String(t).padStart(5, "0")}.jpg`, type: "jpeg", quality: 80 });
  }
} else {
  const fps = Number(val || 30);
  const dur = await p.evaluate(() => window.DURATION);
  const ff = spawn(process.env.HOME + "/Library/Caches/ms-playwright/ffmpeg-1013/ffmpeg-mac", [
    "-y", "-f", "image2pipe", "-framerate", String(fps), "-c:v", "mjpeg", "-i", "pipe:0",
    "-c:v", "libvpx-vp9", "-b:v", "8M", "-deadline", "good", "-cpu-used", "5", "-pix_fmt", "yuv420p",
    `${out}/mentormatch-launch.webm`,
  ], { stdio: ["pipe", "ignore", "ignore"] });
  let exited = false;
  ff.on("close", (code) => { exited = true; if (code) console.log("ffmpeg exited early", code); });
  const total = Math.round(dur * fps);
  for (let f = 0; f < total; f++) {
    await p.evaluate((t) => window.seek(t), f / fps);
    const buf = await p.screenshot({ type: "jpeg", quality: 92 });
    if (exited) throw new Error("encoder stopped");
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once("drain", r));
    if (f % 150 === 0) console.log(`frame ${f}/${total}`);
  }
  ff.stdin.end();
  if (!exited) await new Promise((r) => ff.on("close", r));
  console.log("done");
}
await b.close();
