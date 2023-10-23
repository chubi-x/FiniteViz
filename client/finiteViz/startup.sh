#!/bin/sh
export $(grep -v '^#' .env | xargs)
ngrok config add-authtoken $NGROK_TOKEN
npm run preview &
ngrok http --domain=pipefish-funny-ox.ngrok-free.app 3000