#!/usr/bin/env sh
set -e
./wait-for db:27017
node src/
