#!/bin/sh

npm run preview &
ngrok http --domain=pipefish-funny-ox.ngrok-free.app 3000