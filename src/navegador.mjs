// Acha um navegador Chromium instalado (Edge, Chrome, Chromium ou Brave) em Windows, macOS ou Linux.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

function candidatos() {
  const env = process.env;
  if (process.platform === 'win32') {
    const bases = [env['ProgramFiles(x86)'], env.ProgramFiles, env.LOCALAPPDATA].filter(Boolean);
    const rel = ['Microsoft\\Edge\\Application\\msedge.exe', 'Google\\Chrome\\Application\\chrome.exe', 'Chromium\\Application\\chrome.exe', 'BraveSoftware\\Brave-Browser\\Application\\brave.exe'];
    return rel.flatMap((r) => bases.map((b) => path.join(b, r)));
  }
  if (process.platform === 'darwin') {
    return [
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
      '/Applications/Chromium.app/Contents/MacOS/Chromium',
      '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
    ];
  }
  const nomes = ['google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser', 'microsoft-edge', 'microsoft-edge-stable', 'brave-browser'];
  return nomes.map((n) => spawnSync('which', [n], { encoding: 'utf8' }).stdout?.trim()).filter(Boolean);
}

export function acharNavegador(preferido) {
  if (preferido) {
    if (!fs.existsSync(preferido)) throw new Error(`NAVEGADOR aponta para um arquivo que não existe: ${preferido}`);
    return preferido;
  }
  const achado = candidatos().find((c) => c && fs.existsSync(c));
  if (!achado) {
    throw new Error(
      'nenhum navegador Chromium encontrado (Edge, Chrome, Chromium ou Brave).\n' +
        'Instale um, ou baixe um só para o gerador com:\n  npx @puppeteer/browsers install chrome-headless-shell@stable\n' +
        'e coloque o caminho do executável em NAVEGADOR no arquivo .env',
    );
  }
  return achado;
}

/** Flags de GPU por sistema. A última linha permite WebGL por software quando não há GPU (mais lento). */
export function flagsGpu() {
  const angle = { win32: ['--use-angle=d3d11'], darwin: ['--use-angle=metal'] }[process.platform] ?? [];
  return [...angle, '--ignore-gpu-blocklist', '--enable-gpu-rasterization', '--enable-unsafe-swiftshader'];
}
