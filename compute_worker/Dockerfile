FROM ubuntu:latest
RUN apt-get -y update && apt-get install -y
RUN apt-get -y install clang
COPY . /usr/src/worker
WORKDIR /usr/src/worker
# INSTALL ALL REQUIREMENTS
RUN clang consumer.cpp -o consumer -lSimpleAmqpClient -lboost_chrono -lboost_system -lrabbitmq -lrt -lssl -lcrypto -ldl -lpthread -lredis++ -lhiredis
CMD [ "./consumer" ]