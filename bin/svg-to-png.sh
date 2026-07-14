#!/usr/bin/env bash

set -o errexit -o nounset -o pipefail -o xtrace

SCRIPT_DIRECTORY=$(dirname "${BASH_SOURCE:-$0}" | xargs realpath)
declare -r SCRIPT_DIRECTORY

ROOT_DIRECTORY=$(realpath "${SCRIPT_DIRECTORY}"/..)
ICON_DIRECTORY="${ROOT_DIRECTORY}/icons"

for size in 16x16 32x32 48x48 64x64 128x128 440x280; do
    convert \
        -background none \
        -density 1000 \
        -resize ${size} \
        -extent ${size} \
        -gravity center \
        "${ICON_DIRECTORY}"/icon.svg \
        "${ICON_DIRECTORY}"/icon-${size}.png \
        ;
done
