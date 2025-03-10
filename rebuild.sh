#!/bin/bash
pkill -f "sam local start-api"
rm -rf .aws-sam
rm -rf cdk.out
cdk synth --no-staging > template.yaml
sam build
sam local start-api