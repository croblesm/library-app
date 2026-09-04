#!/usr/bin/env bash
#
# Runs once when the container is created.

set -euo pipefail

echo "==> Installing Node dependencies"
(cd app/backend && npm install)
(cd app/frontend/library-frontend && npm install)

echo "==> Installing Python dependencies"
(cd app/backend/ai && pip install -r requirements.txt)

# Ollama serves the embeddings and the chat model for the AI features.
#
# Installed here rather than via ghcr.io/prulloac/devcontainer-features/ollama
# because that feature and Ollama's own installer both extract a zstd archive,
# and javascript-node:22-bookworm ships no zstd binary:
#
#   ERROR: This version requires zstd for extraction.
#
# A feature cannot fix that from inside the build, so zstd goes on first and
# Ollama on top of it.
SUDO=""
[ "$(id -u)" -ne 0 ] && SUDO="sudo"

echo "==> Installing zstd (required by the Ollama installer)"
$SUDO apt-get update -qq >/dev/null 2>&1
$SUDO apt-get install -y -qq zstd >/dev/null 2>&1

echo "==> Installing Ollama"
if curl -fsSL https://ollama.com/install.sh | $SUDO sh >/dev/null 2>&1; then
  nohup ollama serve >/tmp/ollama.log 2>&1 &
  echo "==> Pulling models (nomic-embed-text, llama3.2:3b)"
  ollama pull nomic-embed-text >/dev/null 2>&1 || echo "    nomic-embed-text pull failed"
  ollama pull llama3.2:3b >/dev/null 2>&1 || echo "    llama3.2:3b pull failed"
else
  echo "    Ollama install failed; the AI features stay off. See README.md."
fi

echo ""
echo "Ready."
