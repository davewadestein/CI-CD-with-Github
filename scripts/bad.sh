#!/usr/bin/env bash

name="$1"

if [ "$name" = admin ]; then
    echo "Welcome $name"
fi

for file in ./*.txt; do
    [[ -e "$file" ]] || continue
    echo "$file"
done
