/**
 * Build a Straelen TV promo video from poster PNGs + background audio.
 *
 * Usage:
 *   node concordia-frontend/scripts/generate-straelen-tv-video.mjs [audioPath] [outputPath] [hours]
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { spawnSync } from "child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendRoot = path.resolve(__dirname, "..");
const PNG_DIR = path.join(frontendRoot, "public", "brand", "tv-posters", "straelen", "png");
const WORK_DIR = path.join(frontendRoot, "public", "brand", "tv-posters", "straelen", "video-build");

const AUDIO_PATH = process.argv[2] ?? "C:\\Users\\VENTS\\Desktop\\videoplayback.m4a";
const OUTPUT_PATH =
  process.argv[3] ?? "C:\\Users\\VENTS\\Desktop\\concordia-straelen-tv-5h.mp4";
const TARGET_HOURS = Number(process.argv[4] ?? "5");

const POSTERS = ["de", "en", "nl", "pl", "ro", "ru", "hi", "ar"];
const SLIDE_SECONDS = 10;
const FADE_SECONDS = 2;
const TARGET_SECONDS = TARGET_HOURS * 60 * 60;
const FPS = 25;
const TRANSITIONS = ["slideleft", "slideright", "slideup", "slidedown", "wipeleft", "wiperight", "fadeblack"];

const FFMPEG_BIN = findFfmpeg();

function findFfmpeg() {
  const candidates = [
    process.env.FFMPEG_PATH,
    "C:\\Users\\VENTS\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-8.1.2-full_build\\bin\\ffmpeg.exe",
    "ffmpeg"
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (candidate !== "ffmpeg" && fs.existsSync(candidate)) return candidate;
    const probe = spawnSync(candidate, ["-version"], { encoding: "utf8" });
    if (probe.status === 0) return candidate;
  }

  throw new Error("ffmpeg not found. Install FFmpeg or set FFMPEG_PATH.");
}

function runFfmpeg(args, label) {
  console.log(`\n=== ${label} ===`);
  console.log(`${FFMPEG_BIN} ${args.join(" ")}`);

  const result = spawnSync(FFMPEG_BIN, args, {
    stdio: "inherit",
    windowsHide: true
  });

  if (result.status !== 0) {
    throw new Error(`${label} failed with exit code ${result.status ?? "unknown"}`);
  }
}

function scaleFilter(index) {
  return `[${index}:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,format=yuv420p,setsar=1,fps=${FPS}[v${index}]`;
}

function buildCycleFilter() {
  const scales = POSTERS.map((_, index) => scaleFilter(index));
  const fades = [];
  let previous = "v0";

  for (let index = 1; index < POSTERS.length; index += 1) {
    const output = index === POSTERS.length - 1 ? "outv" : `x${index}`;
    const offset = index * SLIDE_SECONDS - index * FADE_SECONDS;
    const transition = TRANSITIONS[(index - 1) % TRANSITIONS.length];
    fades.push(
      `[${previous}][v${index}]xfade=transition=${transition}:duration=${FADE_SECONDS}:offset=${offset}[${output}]`
    );
    previous = output;
  }

  return `${scales.join(";")};${fades.join(";")}`;
}

function main() {
  if (!fs.existsSync(AUDIO_PATH)) {
    throw new Error(`Audio file not found: ${AUDIO_PATH}`);
  }

  for (const lang of POSTERS) {
    const posterPath = path.join(PNG_DIR, `poster-${lang}.png`);
    if (!fs.existsSync(posterPath)) {
      throw new Error(`Missing poster: ${posterPath}`);
    }
  }

  fs.mkdirSync(WORK_DIR, { recursive: true });

  const buildTag = `${TARGET_HOURS}h`;
  const cyclePath = path.join(WORK_DIR, `promo-cycle-${buildTag}.mp4`);
  const videoPath = path.join(WORK_DIR, `promo-video-${buildTag}.mp4`);
  const audioPath = path.join(WORK_DIR, `promo-audio-${buildTag}.m4a`);

  const cycleDuration =
    POSTERS.length * SLIDE_SECONDS - (POSTERS.length - 1) * FADE_SECONDS;
  const loopCount = Math.ceil(TARGET_SECONDS / cycleDuration);

  const inputArgs = POSTERS.flatMap((lang) => [
    "-loop",
    "1",
    "-t",
    String(SLIDE_SECONDS),
    "-i",
    path.join(PNG_DIR, `poster-${lang}.png`)
  ]);

  runFfmpeg(
    [
      "-y",
      ...inputArgs,
      "-filter_complex",
      buildCycleFilter(),
      "-map",
      "[outv]",
      "-c:v",
      "libx264",
      "-pix_fmt",
      "yuv420p",
      "-crf",
      "20",
      "-preset",
      "medium",
      cyclePath
    ],
    `1/4 Encode one promo cycle (${cycleDuration}s)`
  );

  runFfmpeg(
    [
      "-y",
      "-stream_loop",
      String(loopCount - 1),
      "-i",
      cyclePath,
      "-c:v",
      "copy",
      "-t",
      String(TARGET_SECONDS),
      videoPath
    ],
    `2/4 Loop video to ${TARGET_HOURS} hours (${loopCount} cycles)`
  );

  runFfmpeg(
    [
      "-y",
      "-stream_loop",
      "-1",
      "-i",
      AUDIO_PATH,
      "-c:a",
      "aac",
      "-b:a",
      "256k",
      "-ar",
      "48000",
      "-ac",
      "2",
      "-t",
      String(TARGET_SECONDS),
      audioPath
    ],
    `3/4 Loop audio to ${TARGET_HOURS} hours`
  );

  runFfmpeg(
    [
      "-y",
      "-i",
      videoPath,
      "-i",
      audioPath,
      "-map",
      "0:v:0",
      "-map",
      "1:a:0",
      "-c:v",
      "copy",
      "-c:a",
      "aac",
      "-b:a",
      "256k",
      "-ar",
      "48000",
      "-ac",
      "2",
      "-movflags",
      "+faststart",
      "-tag:v",
      "avc1",
      "-tag:a",
      "mp4a",
      "-shortest",
      OUTPUT_PATH
    ],
    "4/4 Mux final TV video with TV-compatible audio"
  );

  const sizeGb = (fs.statSync(OUTPUT_PATH).size / (1024 ** 3)).toFixed(2);
  const hoursLabel = `${TARGET_HOURS}:00:00`;
  console.log(`\nDone: ${OUTPUT_PATH}`);
  console.log(`Duration: ${hoursLabel} · Size: ~${sizeGb} GB`);
}

main();
