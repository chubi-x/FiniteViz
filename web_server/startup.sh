#!/bin/sh
export $(grep -v '^#' .env | xargs)
ngrok config add-authtoken $NGROK_TOKEN
python server.py &
ngrok http --domain=$DOMAIN 3000