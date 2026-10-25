#!/usr/bin/env bash
# Arma secretos/ en la máquina de GitHub con los secretos cifrados del repo (nunca se imprimen).
# El token de TikTok se renueva solo: vive cifrado en estado/tiktok_token.enc (lo vuelve a guardar sincronizar.py).
set -euo pipefail
cd "$(dirname "$0")/../.."
mkdir -p secretos
printf '%s' "$META_JSON" > secretos/meta.json
printf '%s' "$AVISOS_JSON" > secretos/avisos.json
printf '%s' "$TIKTOK_JSON" > secretos/tiktok.json
printf '%s' "$GEMINI_KEY" > secretos/gemini_key.txt
if [ -f estado/tiktok_token.enc ]; then
  openssl enc -d -aes-256-cbc -pbkdf2 -pass env:CLAVE_ESTADO -in estado/tiktok_token.enc -out secretos/tiktok_token.json
  sha256sum secretos/tiktok_token.json | cut -d' ' -f1 > secretos/.tiktok_token.sha
fi
echo "secretos listos"
