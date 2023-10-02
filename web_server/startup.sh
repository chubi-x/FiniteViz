#!/bin/sh
export $(grep -v '^#' .env | xargs)
python server.py &
ngrok http --domain=$DOMAIN 3000