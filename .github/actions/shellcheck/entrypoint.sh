#!/bin/sh
set -eu

TARGET="${1:-scripts/*.sh}"

echo "Running ShellCheck inside Docker"
echo "Target: $TARGET"
echo "ShellCheck version:"
shellcheck --version
echo

# GitHub mounts the repository workspace at /github/workspace
cd /github/workspace

# Deliberately allow glob expansion here so scripts/*.sh works
# shellcheck disable=SC2086
shellcheck $TARGET
