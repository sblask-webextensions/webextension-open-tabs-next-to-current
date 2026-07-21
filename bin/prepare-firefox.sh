#!/usr/bin/env bash

set -o errexit -o nounset -o pipefail -o xtrace

SCRIPT_DIRECTORY=$(dirname "${BASH_SOURCE:-$0}" | xargs realpath)
declare -r SCRIPT_DIRECTORY

ROOT_DIRECTORY=$(realpath "${SCRIPT_DIRECTORY}"/..)
DIST_DIRECTORY="${ROOT_DIRECTORY}/dist-firefox"

rm -rf "${DIST_DIRECTORY}"
mkdir "${DIST_DIRECTORY}"

VERSION=$1

cp "${ROOT_DIRECTORY}"/LICENSE "${DIST_DIRECTORY}"

jq --indent 4 ". | .version |= \"$VERSION\" | del(.background.service_worker) | del(.minimum_chrome_version) | .icons |= {\"48\": \"icon.svg\"}" "${ROOT_DIRECTORY}"/manifest.json > "${DIST_DIRECTORY}"/manifest.json

# copy files
cp "${ROOT_DIRECTORY}"/icons/*.svg "${DIST_DIRECTORY}"

if [ -d "${ROOT_DIRECTORY}"/content-scripts ]; then
  cp -r "${ROOT_DIRECTORY}"/content-scripts "${DIST_DIRECTORY}"/content-scripts
fi
if [ -d "${ROOT_DIRECTORY}"/_locales ]; then
  cp -r "${ROOT_DIRECTORY}"/_locales "${DIST_DIRECTORY}"/_locales
fi
if [ -d "${ROOT_DIRECTORY}"/options ]; then
  cp -r "${ROOT_DIRECTORY}"/options "${DIST_DIRECTORY}"/options
fi
cp "${ROOT_DIRECTORY}"/*.js "${DIST_DIRECTORY}"/
rm "${DIST_DIRECTORY}"/eslint.config.js

# shellcheck disable=2046
sed --in-place --regexp-extended 's|// firefox-only: ||' $(find "${DIST_DIRECTORY}" -name '*.js' -o -name '*.html')

# create zip
name="$(jq -r '.name' manifest.json |
  tr '[:upper:]' '[:lower:]' |
  sed -E '
    s/[^a-z0-9]+/_/g
    s/^_+//
    s/_+$//
    s/_+/_/g
  '
)"
cd "${DIST_DIRECTORY}"
zip -r ../"${name}-${VERSION}-firefox.zip" .
