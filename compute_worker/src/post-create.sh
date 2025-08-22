#!/bin/bash
# chgrp -R finiteviz /workspaces/finiteViz && chmod -R g+rx /workspaces/finiteViz

mkdir -p ~/dotenv && cd ~/dotenv
git clone https://github.com/laserpants/dotenv-cpp.git
mkdir -p /workspaces/finiteViz/include
cp -rn dotenv-cpp/include/ /workspaces/finiteViz/
cd /workspaces/finiteViz/proj/smsh

make colred.o && make dasol.o && make datest.o && make datri.o && make dsred.o &&
	make dured.o && make ma41.o && make ma41_dep.o &&
	make ma41_dep2.o && make math_matrix.o && make math_other.o && make math_tensor.o &&
	make neo_Hooke_elasticity.o && make phelp.o && make prgError.o && make prgWarning.o &&
	make small_strain_elasticity.o
mv ./obj/* ../../ext/obj
make simple_mesh.o
make
