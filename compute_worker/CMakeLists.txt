#include_directories(mpap3_chubi/lib)
cmake_minimum_required(VERSION 3.12)
project(FiniteViz)

# Set C++ standard
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_Fortran_COMPILER gfortran)
# Set compiler options
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -O3 -Wno-write-strings -Wno-return-type -funsigned-char -DDBOOST_LOG_DYN_LINK")

# Add include directories
include_directories(
        src/mpap3_chubi/lib/elements
        src/mpap3_chubi/lib/geometry
        src/mpap3_chubi/lib/matrix
        src/mpap3_chubi/lib/solvers 
        src/mpap3_chubi/lib/other 
        src/mpap3_chubi/lib/dof 
        src/mpap3_chubi/lib/fem 
        src/mpap3_chubi/lib/groups
        src/mpap3_chubi/lib/tis 
        src/mpap3_chubi/lib/math 
        src/mpap3_chubi/dev/all
        src/mpap3_chubi/ext
)
#link_directories(
#        src/mpap3_chubi/lib/elements
#        src/mpap3_chubi/lib/geometry
#        src/mpap3_chubi/lib/matrix
#        src/mpap3_chubi/lib/solvers
#        src/mpap3_chubi/lib/other
#        src/mpap3_chubi/lib/dof
#        src/mpap3_chubi/lib/fem
#        src/mpap3_chubi/lib/groups
#        src/mpap3_chubi/lib/tis
#        src/mpap3_chubi/lib/math
#        src/mpap3_chubi/dev/all
#        src/mpap3_chubi/ext
#)


# Add source files
file(GLOB_RECURSE SOURCES "simple_mesh.cpp" "*.for")
# Create an executable
add_executable(finiteViz ${SOURCES})

target_include_directories(finiteViz
        PRIVATE
        src/mpap3_chubi/ext/feap
        src/mpap3_chubi/ext/ma41
        src/mpap3_chubi/ext/mpap2
)
# Link libraries
target_link_libraries(finiteViz
#     /usr/lib64
    SimpleAmqpClient
        m
        mpi_cxx
        mpi
        stdc++
        gfortran
    boost_chrono
    boost_system
    boost_thread
    boost_log
    boost_atomic
    boost_filesystem
    boost_date_time
    boost_log_setup
    rabbitmq
    rt
    ssl
    crypto
    dl
    pthread
    redis++
    hiredis

)
