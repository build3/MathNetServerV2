#!/usr/bin/env bash
cd /home/ubuntu/app/
docker-compose pull web
docker-compose down
docker-compose up -d --force-recreate --build
docker image prune -f
sleep 15