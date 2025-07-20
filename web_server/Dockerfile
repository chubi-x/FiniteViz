FROM python:latest
RUN apt-get -y install curl
COPY . /app
WORKDIR /app
RUN pip install -r requirements.txt
RUN chmod a+x deploy/startup.dev.sh
