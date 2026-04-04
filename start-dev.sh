#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

if ! command -v node >/dev/null 2>&1; then
  echo ""
  echo ">>> Node.js ist nicht installiert oder nicht im PATH."
  echo ">>> Ohne Node funktionieren npm und dieses Projekt nicht."
  echo ""
  echo "    Am zuverlässigsten: https://nodejs.org/de — LTS herunterladen und"
  echo "    den macOS-Installer (.pkg) ausführen. Danach Terminal neu starten."
  echo ""
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo ">>> npm wurde nicht gefunden (gehört normalerweise zu Node.js)."
  exit 1
fi

echo "Node $(node --version) | npm $(npm --version)"
if [ ! -d "$ROOT/node_modules/concurrently" ]; then
  echo "Installiere Root-Abhängigkeiten (concurrently) …"
  npm install
fi
echo "Starte Backend + Frontend …"
exec npm run dev
