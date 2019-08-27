#!/usr/bin/env bash
$(aws ecr get-login --no-include-email --region us-east-1)
docker build -t mathnet/server .
docker tag mathnet/server:latest 617608773253.dkr.ecr.us-east-2.amazonaws.com/mathnet/server:latest
docker push 617608773253.dkr.ecr.us-east-2.amazonaws.com/mathnet/server:latest

