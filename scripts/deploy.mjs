// Copies the built addon to Wealthfolio's addons directory.
// Also inlines the generated CSS into addon.js (Wealthfolio only loads one JS file per addon).
import {
  copyFileSync,
  mkdirSync,
  existsSync,
  readFileSync,
  writeFileSync,
} from "fs";
import { join } from "path";
import { homedir } from "os";

const ADDON_ID = "subscription-stack";
const WEALTHFOLIO_ADDONS = join(
  homedir(),
  "AppData",
  "Roaming",
  "com.teymz.wealthfolio",
  "addons",
  ADDON_ID,
);
const DIST_DIR = join(WEALTHFOLIO_ADDONS, "dist");

const PROJECT_ROOT = join(new URL(".", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"), "..");

function deploy() {
  mkdirSync(WEALTHFOLIO_ADDONS, { recursive: true });
  mkdirSync(DIST_DIR, { recursive: true });

  const addonJsPath = join(PROJECT_ROOT, "dist", "addon.js");
  const addonMapPath = join(PROJECT_ROOT, "dist", "addon.js.map");

  if (!existsSync(addonJsPath)) {
    console.error("❌  dist/addon.js not found — run npm run build first");
    process.exit(1);
  }

  let addonJs = readFileSync(addonJsPath, "utf-8");

  // Inline the generated CSS with scoping so Wealthfolio only needs to load addon.js
  const cssFiles = ["subscription-stack.css"];
  for (const cssFile of cssFiles) {
    const cssPath = join(PROJECT_ROOT, "dist", cssFile);
    if (existsSync(cssPath)) {
      const cssContent = readFileSync(cssPath, "utf-8");
      const scopedCss = `@scope (.subscription-stack-root) {\n${cssContent}\n}`;
      const injection = `(function(){var s=document.createElement('style');s.textContent=${JSON.stringify(scopedCss)};document.head.appendChild(s);})();\n`;
      addonJs = injection + addonJs;
      console.log(`   Inlined ${cssFile} (${(cssContent.length / 1024).toFixed(1)} kB)`);
    }
  }

  writeFileSync(join(DIST_DIR, "addon.js"), addonJs);

  if (existsSync(addonMapPath)) {
    copyFileSync(addonMapPath, join(DIST_DIR, "addon.js.map"));
  }

  // Merge manifest: preserve installed runtime fields if they exist
  const srcManifest = JSON.parse(
    readFileSync(join(PROJECT_ROOT, "manifest.json"), "utf-8"),
  );
  const destManifestPath = join(WEALTHFOLIO_ADDONS, "manifest.json");
  let destManifest = {};
  if (existsSync(destManifestPath)) {
    try {
      destManifest = JSON.parse(readFileSync(destManifestPath, "utf-8"));
    } catch {
      // ignore
    }
  }

  const merged = {
    ...srcManifest,
    enabled: true,
    installedAt: destManifest.installedAt ?? new Date().toISOString(),
    source: "local",
  };

  writeFileSync(destManifestPath, JSON.stringify(merged, null, 2));

  console.log(`✅  Deployed to: ${WEALTHFOLIO_ADDONS}`);
  console.log("   Reload the addon in Wealthfolio to see changes.");
}

deploy();
