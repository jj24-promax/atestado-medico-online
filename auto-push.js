/**
 * Observa alterações no projeto e faz commit + push automático para o GitHub.
 * Execute: node auto-push.js   ou   npm run auto-push
 *
 * O que faz:
 * - Ao salvar arquivos, aguarda 10 segundos sem novas alterações
 * - Roda git add . && git commit && git push
 *
 * Cuidado: não deixe rodando se não quiser que tudo seja commitado e enviado.
 */

const { watch } = require("fs");
const { spawn } = require("child_process");
const path = require("path");

const ROOT = __dirname;
const DEBOUNCE_MS = 10000; // 10 segundos após a última alteração

let timeout = null;

function run(cmd, args, options = {}) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, {
      cwd: ROOT,
      stdio: options.silent ? "pipe" : "inherit",
      shell: true,
      ...options,
    });
    p.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`Exit ${code}`))));
  });
}

function runSilent(cmd, args) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, {
      cwd: ROOT,
      stdio: "pipe",
      shell: true,
    });
    let out = "";
    let err = "";
    p.stdout?.on("data", (d) => (out += d.toString()));
    p.stderr?.on("data", (d) => (err += d.toString()));
    p.on("close", (code) => {
      if (code === 0) resolve(out.trim());
      else reject(new Error(err || out || `Exit ${code}`));
    });
  });
}

async function sync() {
  try {
    const status = await runSilent("git", ["status", "--porcelain"]);
    if (!status) return;

    console.log("\n[auto-push] Alterações detectadas. Fazendo commit e push...");
    await run("git", ["add", "."]);
    const msg = `Auto-sync: ${new Date().toLocaleString("pt-BR")}`;
    await run("git", ["commit", "-m", msg]);
    await run("git", ["push"]);
    console.log("[auto-push] Enviado para o GitHub.\n");
  } catch (e) {
    if (e.message && e.message.includes("nothing to commit")) return;
    console.error("[auto-push] Erro:", e.message || e);
  }
}

function schedule() {
  if (timeout) clearTimeout(timeout);
  timeout = setTimeout(() => {
    timeout = null;
    sync();
  }, DEBOUNCE_MS);
}

console.log("[auto-push] Observando pasta. Alterações serão enviadas ao GitHub após", DEBOUNCE_MS / 1000, "s sem mudanças.");
console.log("[auto-push] Pressione Ctrl+C para parar.\n");

watch(
  ROOT,
  { recursive: true },
  (eventType, filename) => {
    if (!filename) return;
    const f = path.normalize(filename);
    if (
      f.includes(".git" + path.sep) ||
      f.includes("node_modules" + path.sep) ||
      f.includes(".next" + path.sep) ||
      f === "auto-push.js"
    )
      return;
    schedule();
  }
);
