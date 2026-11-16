// Test stills for the Cổ Loa short: bundles once, renders a list of frames (GPU via ANGLE, jpeg).
// usage: node scripts/coloa-stills.mjs <outPrefix> <frame,frame,...> [scale] [publicDir]
// publicDir defaults to ./public; pass a folder holding only bridge/ to keep each bundle small (public/ is ~1 GB).
import path from "node:path";
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";

const [prefix, frames, scale = "0.5", publicDir = "public"] = process.argv.slice(2);
const chromiumOptions = { gl: "angle" };
const serveUrl = await bundle({ entryPoint: path.resolve("src/co-loa-entry.tsx"), publicDir: path.resolve(publicDir) });
const composition = await selectComposition({ serveUrl, id: "CoLoaShort", chromiumOptions });
const onBrowserLog = (l) => { if (l.type === "error" || l.type === "warning") console.log(`[${l.type}]`, l.text.slice(0, 300)); };
for (const f of frames.split(",").map(Number)) {
  const t0 = Date.now();
  await renderStill({ composition, serveUrl, frame: f, output: `${prefix}${f}.jpg`, imageFormat: "jpeg", jpegQuality: 88, scale: Number(scale),
    chromiumOptions, timeoutInMilliseconds: 240000, onBrowserLog });
  console.log("still", f, ((Date.now() - t0) / 1000).toFixed(1) + "s");
}
