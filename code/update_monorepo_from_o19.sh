#!/bin/sh
cd "$(dirname "$0")/.."
git subtree pull --prefix code git@github.com:mnzaki/o19 main
