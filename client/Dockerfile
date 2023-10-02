FROM node:lts
COPY finiteViz /usr/src/client
WORKDIR /usr/src/client
ARG ngrok_token
RUN apt-get install -y curl
RUN curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | \
   tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null &&   \
    echo "deb https://ngrok-agent.s3.amazonaws.com buster main" |   \
   tee /etc/apt/sources.list.d/ngrok.list &&    apt update &&  apt install ngrok

RUN ngrok config add-authtoken ngrok_token
RUN npm install && npm run build
CMD sh startup.sh

