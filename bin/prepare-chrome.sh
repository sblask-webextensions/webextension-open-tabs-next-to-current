#!/usr/bin/env bash

set -o errexit -o nounset -o pipefail -o xtrace

SCRIPT_DIRECTORY=$(dirname "${BASH_SOURCE:-$0}" | xargs realpath)
declare -r SCRIPT_DIRECTORY

ROOT_DIRECTORY=$(realpath "${SCRIPT_DIRECTORY}"/..)
DIST_DIRECTORY="${ROOT_DIRECTORY}/dist-chrome"

echo "$ROOT_DIRECTORY"

rm -rf "${DIST_DIRECTORY}"
mkdir "${DIST_DIRECTORY}"

VERSION=$1

cp "${ROOT_DIRECTORY}"/LICENSE "${DIST_DIRECTORY}"

jq --indent 4 ". | .version |= \"${VERSION}\" | del(.browser_specific_settings) | del(.browser_action.default_icon)" "${ROOT_DIRECTORY}"/manifest.json > "${DIST_DIRECTORY}"/manifest.json

# copy files
cp "${ROOT_DIRECTORY}"/*.png "${DIST_DIRECTORY}"

if [ -d "${ROOT_DIRECTORY}"/options ]; then
  cp -r "${ROOT_DIRECTORY}"/options "${DIST_DIRECTORY}"/options
fi
if [ -d "${ROOT_DIRECTORY}"/content-scripts ]; then
  cp -r "${ROOT_DIRECTORY}"/content-scripts "${DIST_DIRECTORY}"/content-scripts
fi
cp "${ROOT_DIRECTORY}"/*.js "${DIST_DIRECTORY}"/
rm "${DIST_DIRECTORY}"/eslint.config.js
