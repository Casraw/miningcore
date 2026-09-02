#!/bin/bash
set -euo pipefail

# Builds Miningcore for Ubuntu 26.04 LTS entirely inside Docker.
#
# Nothing is installed on the host - the .NET 10 SDK, GCC 15, CMake, Boost and
# the rest of the native toolchain all live in the container. The only
# requirement is a working Docker daemon.
#
# Ubuntu 26.04 ships .NET 10 in its own archive and no longer offers .NET 6,
# which is why the projects target net10.0.
#
# Usage:
#   ./build-ubuntu-26.04.sh [output-dir]     # output-dir defaults to ./build
#
# To build a runnable container image instead of a directory of artifacts:
#   docker build -f Dockerfile.ubuntu-26.04 --target runtime -t miningcore:26.04 .

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
BUILDIR="${1:-$SCRIPT_DIR/build}"

if ! command -v docker > /dev/null 2>&1; then
    echo "error: docker is required but was not found in PATH" >&2
    exit 1
fi

if ! docker info > /dev/null 2>&1; then
    echo "error: cannot talk to the Docker daemon - is it running and are you in the 'docker' group?" >&2
    exit 1
fi

echo "Building into $BUILDIR"

# BuildKit is the default on modern Docker but is required for --output.
export DOCKER_BUILDKIT=1

# The "artifacts" stage is a scratch image holding only the publish output, so
# --output writes exactly the build directory contents to the host.
docker build \
    --file "$SCRIPT_DIR/Dockerfile.ubuntu-26.04" \
    --target artifacts \
    --output "type=local,dest=$BUILDIR" \
    "$SCRIPT_DIR"

echo
echo "Build complete: $BUILDIR"
echo "Run it with:    cd $BUILDIR && ./Miningcore -c config.json"
echo "(requires: apt-get install -y aspnetcore-runtime-10.0 libsodium23 libzmq5 libgmp10 libboost-date-time1.90.0)"
