#define MESH_TOOLS
#define BOOST_LOG_DYN_LINK 1

#define OUTPUT_TYPE "webpage"
#include "MpapGlobal.h"
#include "MyOutputStream.h"
#include <dotenv.h>

#include "consumer.h"
int main(int argc, char **argv)
{
  dotenv::init();
  mpapInit("structured mesh generator");
  Worker worker;
  worker.consume();
}
