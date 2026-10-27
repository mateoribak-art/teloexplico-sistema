#!/usr/bin/env bash
# Arma secretos/ en la máquina de GitHub con los secretos cifrados del repo (nunca se imprimen).
# El token de TikTok se renueva solo: vive cifrado en estado/tiktok_token.enc (lo vuelve a guardar sincronizar.py).
set -euo pipefail
cd "$(dirname "$0")/../.."
mkdir -p secretos
printf '%s' "$META_JSON" > secretos/meta.json
if [ -n "${META_EN_JSON:-}" ]; then printf '%s' "$META_EN_JSON" > secretos/meta_en.json; fi   # @letmeexplain.us (27/10)
printf '%s' "$AVISOS_JSON" > secretos/avisos.json
printf '%s' "$TIKTOK_JSON" > secretos/tiktok.json
printf '%s' "$GEMINI_KEY" > secretos/gemini_key.txt
if [ -n "${TELEGRAM_JSON:-}" ]; then printf '%s' "$TELEGRAM_JSON" > secretos/telegram.json; fi   # bot que manda el video al celular
if [ -n "${YOUTUBE_JSON:-}" ]; then printf '%s' "$YOUTUBE_JSON" > secretos/youtube.json; printf '%s' "$YOUTUBE_TOKEN_JSON" > secretos/youtube_token.json; fi   # subida a YouTube Shorts
if [ -f estado/tiktok_token.enc ]; then
  openssl enc -d -aes-256-cbc -pbkdf2 -pass env:CLAVE_ESTADO -in estado/tiktok_token.enc -out secretos/tiktok_token.json
  sha256sum secretos/tiktok_token.json | cut -d' ' -f1 > secretos/.tiktok_token.sha
fi
# @letmeexplain.us: mismo esquema, su propio token (solo si ya se autorizó)
if [ -f estado/tiktok_token_en.enc ]; then
  openssl enc -d -aes-256-cbc -pbkdf2 -pass env:CLAVE_ESTADO -in estado/tiktok_token_en.enc -out secretos/tiktok_token_en.json
  sha256sum secretos/tiktok_token_en.json | cut -d' ' -f1 > secretos/.tiktok_token_en.sha
fi
echo "secretos listos"
