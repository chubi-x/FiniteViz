#!/bin/sh
gunicorn -b 0.0.0.0:3000 -w 10 server:app
