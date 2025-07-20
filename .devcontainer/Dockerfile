FROM ubuntu:noble

ENV DEBIAN_FRONTEND=noninteractive

ARG USERNAME=finiteviz

RUN groupadd  $USERNAME \
  && useradd -g $USERNAME -m  $USERNAME \
&& chgrp -R finiteviz /root \
    && chmod g+rx /root && chmod -R g+r /root \
  && apt-get update && apt-get install -y sudo 

RUN echo "$USERNAME ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers \
  && chmod 0440 /etc/sudoers
RUN apt-get install -y clang git wget \
  #cpp stuff
  build-essential \
  libssl-dev \
  gfortran\
  nlohmann-json3-dev \
  libboost-thread1.74.0 \
  libboost-log1.74.0 \
  libboost-log-dev \ 
  neovim cargo unzip python3 python3-venv
#copy and compile files
# COPY ../compute_worker/src /app
# RUN chgrp -R finiteviz /app && chmod g+rx /app
# INSTALL ALL REQUIREMENTS
WORKDIR /boost

#boost
RUN wget https://archives.boost.io/release/1.83.0/source/boost_1_83_0.tar.gz
RUN tar xzf boost_1_83_0.tar.gz -C . && mv boost_1_83_0/* .
RUN ./bootstrap.sh --prefix=/usr/local && ./b2 install
#cmake
WORKDIR /cmake
RUN wget https://github.com/Kitware/CMake/releases/download/v3.27.6/cmake-3.27.6-linux-x86_64.sh -O cmake.sh
RUN sh cmake.sh --prefix=/usr/local/ --exclude-subdir

#rabbitmq-c   
WORKDIR /rabbitmq
RUN wget https://github.com/alanxz/rabbitmq-c/archive/refs/tags/v0.13.0.tar.gz 
RUN tar xzf v0.13.0.tar.gz  -C . && \
  mv rabbitmq-c-0.13.0/* .
WORKDIR /rabbitmq/build
RUN cmake -DCMAKE_INSTALL_PREFIX=/usr/local -BUILD_EXAMPLES=OFF -BUILD_TESTING=OFF  ..
RUN cmake -S .. -B .
RUN cmake --build . --target install

#SimpleAMQPClient
WORKDIR /simpleamqpclient
RUN wget https://github.com/alanxz/SimpleAmqpClient/archive/refs/tags/v2.5.1.tar.gz
RUN tar xvf v2.5.1.tar.gz -C . && mv SimpleAmqpClient-2.5.1/* .
WORKDIR /simpleamqpclient/build
RUN cmake -DCMAKE_INSTALL_PREFIX=/usr/local .. && make install

#redis
WORKDIR /redis
RUN git clone https://github.com/redis/hiredis.git
WORKDIR /redis/hiredis
RUN make && make install
WORKDIR /redis/redis-plus-plus
RUN git clone https://github.com/sewenew/redis-plus-plus.git && mv redis-plus-plus/* .
WORKDIR /redis/redis-plus-plus/build
RUN cmake .. && make && make install

# create links for shared libraries
RUN ldconfig
CMD [ "bash" ]
