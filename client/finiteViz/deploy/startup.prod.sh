#!/bin/sh
export $(grep -v '^#' .env | xargs)
serve -s dist
