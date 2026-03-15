#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"

if [[ -x "/usr/lib/jvm/java-21-openjdk/bin/java" ]]; then
  export JAVA_HOME="/usr/lib/jvm/java-21-openjdk"
  export PATH="$JAVA_HOME/bin:$PATH"
fi

cd "$BACKEND_DIR"
exec mvn spring-boot:run

