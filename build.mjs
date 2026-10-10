// Combines src/ into camille.html, a single page published as a Claude Artifact.
// Usage: node build.mjs
import { readFileSync, writeFileSync } from "node:fs";

const read = (f) => readFileSync(new URL(`./src/${f}`, import.meta.url), "utf8");
const stripModule = (js) => js.replace(/^import .*$/gm, "").replace(/^export /gm, "");

const body = read("body.html");
const inner = body.slice(body.indexOf("<body>") + 6, body.indexOf("</body>")).replace(/\s*<script[^>]*><\/script>\s*/g, "\n");
const js = ["curriculum.js", "prompts.js", "app.js"].map((f) => `// ---- ${f} ----\n${stripModule(read(f))}`).join("\n");

const html = `<title>Camille French Tutor</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,800&display=swap">
<style>
${read("style.css")}
</style>
${inner.trim()}
<script type="module">
${js}
</script>
`;
writeFileSync(new URL("./camille.html", import.meta.url), html);
console.log(`camille.html written (${(html.length / 1024).toFixed(0)} KB)`);
