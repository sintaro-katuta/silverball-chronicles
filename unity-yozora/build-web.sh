#!/bin/sh
set -eu
project_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
unity_editor=${UNITY_EDITOR:-/Applications/Unity/Hub/Editor/6000.4.6f1/Unity.app/Contents/MacOS/Unity}
# Builds the saved scene. Does not regenerate geometry or overwrite scene edits.
exec "$unity_editor" -batchmode -nographics -projectPath "$project_dir" -executeMethod YozoraBuilder.BuildExistingWeb -quit -logFile /tmp/yozora-unity-web-build.log
