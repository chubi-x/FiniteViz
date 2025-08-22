
# --- source file directories ----------------------------------------

VPATH = ../../ext/feap  \
        ../../ext/ma41  \
        ../../ext/mpap2

# --- compiler settings for my computers, using g++, ifc -------------

#CC    = gcc-mp-4.9
CC    = gcc
COPT  = -O3 -Wno-write-strings -Wno-return-type -std=c++17 -funsigned-char
CINCL = -I../../lib/groups \
        -I../../lib/elements \
        -I../../lib/materials \
        -I../../lib/geometry \
        -I../../lib/matrix \
        -I../../lib/solvers \
        -I../../lib/other \
        -I../../lib/dof \
        -I../../lib/fem \
        -I../../lib/solid \
        -I../../lib/tis \
        -I../../lib/ann \
        -I../../lib/math \
        -I../../lib/opt \
        -I../../lib/aleksander \
        -I../../dev/all \
        -I../../ext \
        -I/opt/ohpc/pub/mpi/openmpi-gnu/1.10.3/include \
        -I/opt/ohpc/pub/libs/gnu/openmpi/petsc/3.7.0/include \
				-I../../include/laserpants/dotenv
CF    = gfortran
FOPT  = -O3
LIB   = -L/usr/lib64 -lm -lstdc++ -lgfortran \
				 -L/usr/local/lib -lhiredis -lSimpleAmqpClient -lboost_chrono -lboost_thread \
				 -lboost_system -lrabbitmq -lrt -lssl -lcrypto -ldl -lpthread -lredis++ -lboost_log -lboost_log_setup -lboost_filesystem -lboost_program_options \

# --- commands -------------------------------------------------------

default: 
	@($(CC) ./obj/*.o ../../ext/obj/*.o $(COPT) $(LIB) -o finiteViz-worker)

%.o: %.cpp
	$(CC) -c $(COPT) $(CINCL) $< -o ./obj/$@

./obj/%.o: %.cpp
	$(CC) -c $(COPT) $(CINCL) $< -o ./$@

%.o: %.for
	$(CF) -c $(FOPT) $< -o ./obj/$@

./obj/%.o: %.for
	$(CF) -c $(FOPT) $< -o ./$@

