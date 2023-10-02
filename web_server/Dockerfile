FROM python:latest
ARG ngrok_token
RUN apt-get -y install curl
COPY . /usr/src/webserver
WORKDIR /usr/src/webserver
RUN pip install flask flask_cors pika redis python-dotenv
RUN curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | \
   tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null &&   \
    echo "deb https://ngrok-agent.s3.amazonaws.com buster main" |   \
   tee /etc/apt/sources.list.d/ngrok.list &&    apt update &&  apt install ngrok

RUN ngrok config add-authtoken ngrok_token
CMD sh startup.sh 