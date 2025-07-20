
# --- source file directories ----------------------------------------

VPATH = ../../ext/feap  \
        ../../ext/ma41  \
        ../../ext/mpap2

# --- compiler settings for my computers, using g++, ifc -------------

#CC    = gcc-mp-4.9
CC    = gcc
COPT  = -O3 -Wno-write-strings -Wno-return-type -std=c++11 -funsigned-char
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
        -I../../lib/mpi \
        -I../../lib/math \
        -I../../lib/opt \
        -I../../lib/aleksander \
        -I../../dev/all \
        -I../../ext \
        -I/lustre/apps/vtk/7.1.1/gnu/include/vtk-7.1 \
        -I/opt/ohpc/pub/mpi/openmpi-gnu/1.10.3/include \
        -I/opt/ohpc/pub/libs/gnu/openmpi/petsc/3.7.0/include 
				# -I../../include/laserpants/dotenv
				 -Iinclude/laserpants/dotenv
CF    = gfortran
FOPT  = -O3
LIB   = -L/usr/lib64 -lm -lstdc++ -lgfortran \
         -L /opt/ohpc/pub/mpi/openmpi-gnu/1.10.3/lib -lmpi_cxx -lmpi

# --- commands -------------------------------------------------------

default: 
	@($(CC) ./obj/*.o ../../ext/obj/*.o $(COPT) $(LIB) -o mpap3)

%.o: %.cpp
	$(CC) -c $(COPT) $(CINCL) $< -o ./obj/$@

./obj/%.o: %.cpp
	$(CC) -c $(COPT) $(CINCL) $< -o ./$@

%.o: %.for
	$(CF) -c $(FOPT) $< -o ./obj/$@

./obj/%.o: %.for
	$(CF) -c $(FOPT) $< -o ./$@




#  other vtk-libraries
#
#            -lvtkDomainsChemistryOpenGL2-7.1.1 \
#            -lvtkFiltersFlowPaths-7.1.1 \
#            -lvtkFiltersGeneric-7.1.1  \
#            -lvtkFiltersHyperTree-7.1.1  \
#            -lvtkFiltersParallelImaging-7.1.1  \
#            -lvtkFiltersProgrammable-7.1.1  \
#            -lvtkFiltersPython-7.1.1  \
#            -lpython2.7  \
#            -lvtkWrappingPython27Core-7.1.1  \
#            -lvtkFiltersSelection-7.1.1  \
#            -lvtkFiltersSMP-7.1.1  \
#            -lvtkFiltersTexture-7.1.1  \
#            -lvtkFiltersVerdict-7.1.1  \
#            -lvtkverdict-7.1.1  \
#            -lvtkGeovisCore-7.1.1  \
#            -lvtkproj4-7.1.1  \
#            -lvtkImagingMath-7.1.1  \
#            -lvtkImagingMorphological-7.1.1  \
#            -lvtkImagingStatistics-7.1.1  \
#            -lvtkImagingStencil-7.1.1  \
#            -lvtkInteractionImage-7.1.1  \
#            -lvtkIOAMR-7.1.1  \
#            -lvtkIOEnSight-7.1.1  \
#            -lvtkIOExodus-7.1.1  \
#            -lvtkIOImport-7.1.1  \
#            -lvtkIOInfovis-7.1.1  \
#            -lvtklibxml2-7.1.1  \
#            -lvtkIOLSDyna-7.1.1  \
#            -lvtkIOMINC-7.1.1  \
#            -lvtkIOMovie-7.1.1  \
#            -lvtkoggtheora-7.1.1  \
#            -lvtkIOParallel-7.1.1  \
#            -lvtkjsoncpp-7.1.1  \
#            -lvtkIOParallelXML-7.1.1  \
#            -lvtkIOPLY-7.1.1  \
#            -lvtkIOSQL-7.1.1  \
#            -lvtksqlite-7.1.1  \
#            -lvtkIOVideo-7.1.1  \
#            -lvtkRenderingContextOpenGL2-7.1.1  \
#            -lvtkRenderingImage-7.1.1  \
#            -lvtkRenderingLOD-7.1.1  \
#            -lvtkViewsContext2D-7.1.1  \
#            -lvtkViewsInfovis-7.1.1  \
#            -lvtkDomainsChemistry-7.1.1  \
#            -lpython2.7  \
#            -lvtkFiltersAMR-7.1.1  \
#            -lvtkexoIIc-7.1.1  \
#            -lvtkFiltersParallel-7.1.1  \
#            -lvtkIONetCDF-7.1.1  \
#            -lvtkNetCDF_cxx-7.1.1  \
#            -lvtkNetCDF-7.1.1  \
#            -lvtkhdf5_hl-7.1.1  \
#            -lvtkhdf5-7.1.1  \
#            -lvtkIOXMLParser-7.1.1  \
#            -lvtkexpat-7.1.1  \
#            -lvtkParallelCore-7.1.1  \
#            -lvtkIOLegacy-7.1.1  \
#            -lvtkglew-7.1.1  \
#            -lvtkChartsCore-7.1.1  \
#            -lvtkRenderingContext2D-7.1.1  \
#            -lvtkFiltersImaging-7.1.1  \
#            -lvtkInfovisLayout-7.1.1  \
#            -lvtkInfovisCore-7.1.1  \
#            -lvtkViewsCore-7.1.1  \
#            -lvtkInteractionWidgets-7.1.1  \
#            -lvtkImagingHybrid-7.1.1  \
#            -lvtkIOImage-7.1.1  \
#            -lvtkDICOMParser-7.1.1  \
#            -lvtkmetaio-7.1.1  \
#            -lvtkpng-7.1.1  \
#            -lvtktiff-7.1.1  \
#            -lvtkjpeg-7.1.1  \
#            -lvtkFiltersHybrid-7.1.1  \
#            -lvtkImagingGeneral-7.1.1  \
#            -lvtkImagingSources-7.1.1  \
#            -lvtkFiltersModeling-7.1.1  \
#            -lvtkImagingColor-7.1.1  \
#            -lvtkRenderingLabel-7.1.1  \
#            -lvtkCommonColor-7.1.1  \
#            -lvtkFiltersExtraction-7.1.1  \
#            -lvtkFiltersStatistics-7.1.1  \
#            -lvtkalglib-7.1.1  \
#            -lvtkImagingFourier-7.1.1  \
#            -lvtkImagingCore-7.1.1  \
#            -lvtkFiltersGeometry-7.1.1  \
#            -lvtkFiltersSources-7.1.1  \
#            -lvtkFiltersGeneral-7.1.1  \
#            -lvtkFiltersCore-7.1.1  \
#            -lvtkCommonExecutionModel-7.1.1  \
#            -lvtkCommonComputationalGeometry-7.1.1  \
#            -lvtkCommonMisc-7.1.1  \
#            -lvtkCommonTransforms-7.1.1  \
#            -lvtkCommonMath-7.1.1  \
#            -lvtkCommonSystem-7.1.1  \
#            -lvtksys-7.1.1  \
#            -lvtkfreetype-7.1.1  \
#            -lvtkzlib-7.1.1
##            -lvtkWrappingTools-7.0.a



