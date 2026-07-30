#!/usr/bin/env bash

set -o errexit -o nounset -o pipefail -o xtrace

if (( $# != 1 )); then
  echo "Usage: $0 VERSION" >&2
  exit 64
fi

SCRIPT_DIRECTORY=$(cd -P -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)
declare -r SCRIPT_DIRECTORY

ROOT_DIRECTORY=$(cd -- "${SCRIPT_DIRECTORY}/.." &>/dev/null && pwd)
DIST_DIRECTORY="${ROOT_DIRECTORY}/dist-firefox"

rm -rf "${DIST_DIRECTORY}"
mkdir "${DIST_DIRECTORY}"

VERSION=$1

cp "${ROOT_DIRECTORY}"/LICENSE "${DIST_DIRECTORY}"

jq \
  --arg version "${VERSION}" \
  --indent 4 \
  '
    .version = $version
    | del(
      .background.service_worker,
      .minimum_chrome_version
    )
    | .icons = {"48": "icon.svg"}
  ' \
  "${ROOT_DIRECTORY}/manifest.json" \
  > "${DIST_DIRECTORY}/manifest.json"

# copy files
cp "${ROOT_DIRECTORY}"/icons/*.svg "${DIST_DIRECTORY}"

for directory in _locales content-scripts options; do
  if [ -d "${ROOT_DIRECTORY}/${directory}" ]; then
    cp -r "${ROOT_DIRECTORY}/${directory}" "${DIST_DIRECTORY}/${directory}"
  fi
done

find "${ROOT_DIRECTORY}" \
  -maxdepth 1 \
  -type f \
  -name '*.js' \
  ! -name 'eslint.config.js' \
  -exec cp {} "${DIST_DIRECTORY}" \;

  find "${DIST_DIRECTORY}" \
    -type f \
    \( -name '*.js' -o -name '*.html' \) \
    -exec sed --in-place --regexp-extended 's|// firefox-only: ||' {} +

# create zip
name="$(jq -r '.name' "${ROOT_DIRECTORY}/manifest.json" |
  tr '[:upper:]' '[:lower:]' |
  sed -E '
    s/[^a-z0-9]+/_/g
    s/^_+//
    s/_+$//
    s/_+/_/g
  '
)"
archive_path="${ROOT_DIRECTORY}/${name}-${VERSION}-firefox.zip"
rm -f "${archive_path}"

(cd "${DIST_DIRECTORY}" && zip -r "${archive_path}" .)
