#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"
export HOST_UID="$(id -u)" HOST_GID="$(id -g)"
mkdir -p output

trap 'docker compose down --volumes --remove-orphans' EXIT
trap 'exit 130' INT TERM
docker compose build
docker compose run --rm recorder "$@"
