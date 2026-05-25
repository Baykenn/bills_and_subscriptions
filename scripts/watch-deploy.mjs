// Watches dist/ for changes and auto-deploys.
import { watch } from "chokidar";
import { execSync } from "child_process";
import { join } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const DIST = join(__dirname, "..", "dist", "addon.js");

console.log("👁  Watching dist/ for changes…");

const watcher = watch(DIST, { ignoreInitial: true });

watcher.on("change", () => {
  try {
    execSync("node scripts/deploy.mjs", {
      cwd: join(__dirname, ".."),
      stdio: "inherit",
    });
  } catch {
    // error already printed
  }
});
