FROM ubuntu:latest

RUN apt-get -y update && apt-get install -y clang vim git wget \
 #cpp stuff
 build-essential \
    #openssl
    libssl-dev \
    gfortran\
    nlohmann-json3-dev

#copy and compile files
COPY src /usr/src/worker/src
# INSTALL ALL REQUIREMENTS
WORKDIR /usr/src/worker/builds/boost
#boost
RUN wget https://boostorg.jfrog.io/artifactory/main/release/1.83.0/source/boost_1_83_0.tar.gz 
RUN tar xzf boost_1_83_0.tar.gz -C . && mv boost_1_83_0/* .
RUN ./bootstrap.sh --prefix=/usr/local && ./b2 install
#cmake
WORKDIR /usr/src/worker/builds
RUN wget https://github.com/Kitware/CMake/releases/download/v3.27.6/cmake-3.27.6-linux-x86_64.sh -O cmake.sh
RUN sh cmake.sh --prefix=/usr/local/ --exclude-subdir

#openssl
# WORKDIR /usr/src/worker/builds/openssl
# RUN wget https://www.openssl.org/source/openssl-3.0.11.tar.gz && tar xzf openssl-3.0.11.tar.gz -C . && \
#     mv openssl-3.0.11/* .
# RUN ./Configure && make && make install

 #rabbitmq-c   
WORKDIR /usr/src/worker/builds/rabbitmq-c
RUN wget https://github.com/alanxz/rabbitmq-c/archive/refs/tags/v0.13.0.tar.gz 
RUN tar xzf v0.13.0.tar.gz  -C . && \
    mv rabbitmq-c-0.13.0/* .
WORKDIR /usr/src/worker/builds/rabbitmq-c/build
RUN cmake -DCMAKE_INSTALL_PREFIX=/usr/local -BUILD_EXAMPLES=OFF -BUILD_TESTING=OFF  ..
RUN cmake -S .. -B .
RUN cmake --build . --target install

#SimpleAMQPClient
WORKDIR /usr/src/worker/builds/simpleamqpclient
RUN wget https://github.com/alanxz/SimpleAmqpClient/archive/refs/tags/v2.5.1.tar.gz
RUN tar xvf v2.5.1.tar.gz -C . && mv SimpleAmqpClient-2.5.1/* .
WORKDIR /usr/src/worker/builds/simpleamqpclient/build
RUN cmake -DCMAKE_INSTALL_PREFIX=/usr/local .. && make install

#redis
WORKDIR /usr/src/worker/builds/redis
RUN git clone https://github.com/redis/hiredis.git
WORKDIR /usr/src/worker/builds/redis/hiredis
RUN make && make install
WORKDIR /usr/src/worker/builds/redis/redis-plus-plus
RUN git clone https://github.com/sewenew/redis-plus-plus.git && mv redis-plus-plus/* .
WORKDIR /usr/src/worker/builds/redis/redis-plus-plus/build
RUN cmake .. && make && make install

#dotenv
WORKDIR /usr/src/worker/builds/dotenv
RUN git clone https://github.com/laserpants/dotenv-cpp.git
WORKDIR /usr/src/worker/builds/dotenv/dotenv-cpp/build
RUN cmake .. && make && make install

WORKDIR /usr/src/worker/src/proj/smsh
RUN make colred.o && make dasol.o && make datest.o && make datri.o\
    && make dsred.o && make dured.o && make ma41.o && make ma41_dep.o && \
    make ma41_dep2.o && make math_matrix.o && make math_other.o && make math_tensor.o \
    && make neo_Hooke_elasticity.o && make phelp.o && make prgError.o && make prgWarning.o \
    && make small_strain_elasticity.o
RUN mv ./obj/* ../../ext/obj
RUN make simple_mesh.o
RUN make
# create links for shared libraries
RUN ldconfig
CMD [ "./finiteViz" ]