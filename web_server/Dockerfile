FROM python:latest
RUN apt-get -y install curl
COPY . /usr/src/webserver
WORKDIR /usr/src/webserver
RUN pip install -r requirements.txt
RUN curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | \
   tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null &&   \
    echo "deb https://ngrok-agent.s3.amazonaws.com buster main" |   \
   tee /etc/apt/sources.list.d/ngrok.list &&    apt update &&  apt install ngrok

CMD sh startup.sh 