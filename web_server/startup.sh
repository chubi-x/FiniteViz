#!/bin/sh
export $(grep -v '^#' .env | xargs)
ngrok config add-authtoken $NGROK_TOKEN
# gunicorn -b 127.0.0.1:3000 -w 4 server:app &
gunicorn -b localhost:3000 -w 10 server:app &
ngrok http --domain=$DOMAIN 3000