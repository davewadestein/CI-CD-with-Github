#!/usr/bin/env bash

name="$1"

if [ "$name" = admin ]; then
    echo "Welcome $name"
fi

for file in $(ls *.txt 2>/dev/null); do
    echo "$file"
done
