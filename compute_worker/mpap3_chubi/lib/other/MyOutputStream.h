#ifndef incl_MyOutputStream_h
#define incl_MyOutputStream_h

#include <cstring>
#include <typeinfo>
#include <cstdlib>
#include <iostream>
#include <sstream>
#include <variant>
#include <fstream>
#include <vector>
#include <sys/stat.h>

#ifdef LAPACK
#include "lapacke.h"
#include "complex.h"
#endif

#define MAX_MOS_NAME_LENGTH 200

using namespace std;

enum MyStreamTypeEnum
{
  mos_none,
  mos_terminal,
  mos_fileonly,
  mos_webpage
};

inline const char *boolName(bool x)
{
  if (x)
    return "true";
  else
    return "false";
}
// Exception Class
class MosException : public std::exception
{
public:
  // Constructor to initialize the exception message
  MosException(string msg) : message(msg) {}
  const char *what() const noexcept override
  {
    return message.c_str();
  }

private:
  std::string message;
};

class MyOutputStream
{
public:
  MyOutputStream(void);

  MyOutputStream(char *sType, char *fname = "tmp.log");

  MyOutputStream(MyStreamTypeEnum, char *fname = "tmp.log");

  void operator()(char *, char *);

  void setDirectory(char *dname, bool flag = true);

  void makeDirectory(char *dname, bool flag = true);

  void makeNewDirectory(int i = -1);

  void enterSubDirectory(char *dname, bool flag = true);

  void quitSubDirectory(void);

  // bool directoryExists(void);

  void openFile(char *fname = NULL, bool newFlag = false);

  void openNewFile(char *fname = NULL) { openFile(fname, true); }

  void closeFile(void) { file.close(); }

  void wipeFile(void) { remove(fileName); }

  void setFile(char *fname)
  {
    snprintf(fileName, MAX_MOS_NAME_LENGTH, "%s", fname);
    wipeFile();
  }

  void setType(char *);

  void setDoubleFormat(const char *fmt) { strcpy(dblFrmt, fmt); }

  template <typename Type>
  void printObject(Type &);

  template <typename Type>
  void printVariable(Type);

  template <typename Type>
  void error(Type &a) { error("", a); }

  template <typename Type>
  void error(const char *ch, Type &a) { error(ch, a, ""); }

  template <typename Type>
  void error(const char *, Type &, const char *);

  template <typename Type>
  void warning(Type &a) { warning("", a); }

  template <typename Type>
  void warning(const char *ch, Type &a) { warning(ch, a, ""); }

  template <typename Type>
  void warning(const char *, Type &, const char *);

  template <typename Type>
  MyOutputStream &array(Type *, int);

  template <typename Type>
  MyOutputStream &matrix(Type *, int, int);

  MyOutputStream &operator()(int);

public:
  std::ofstream file;

  char dblFrmt[100];

  char dir[MAX_MOS_NAME_LENGTH];

  int iDir = -1;

  int debugLevel = 0;

  bool hideOutput = false;

private:
  int iDirTmp = -2;

  MyStreamTypeEnum streamType;

  char fileName[MAX_MOS_NAME_LENGTH], dirTmp[MAX_MOS_NAME_LENGTH];
};

template <typename Type>
MyOutputStream &operator<<(MyOutputStream &os, Type &a)
{
  if (os.hideOutput)
    return os;

  os.printObject(a);
  return os;
}

inline MyOutputStream &operator<<(MyOutputStream &os, int a)
{
  if (os.hideOutput)
    return os;

  os.printVariable(a);

  return os;
}

inline MyOutputStream &operator<<(MyOutputStream &os, long int a)
{
  if (os.hideOutput)
    return os;

  os.printVariable(a);

  return os;
}

inline MyOutputStream &operator<<(MyOutputStream &os, const char *a)
{
  if (os.hideOutput)
    return os;

  os.printVariable(a);

  return os;
}

inline MyOutputStream &operator<<(MyOutputStream &os, double a)
{
  if (os.hideOutput)
    return os;

  char tmp[100];

  sprintf(tmp, os.dblFrmt, a);

  os.printVariable(tmp);

  return os;
}

inline MyOutputStream &operator<<(MyOutputStream &os, MyOutputStream &a)
{
  if (os.hideOutput)
    return os;

  return os;
}

template <typename Type>
MyOutputStream &operator<<(MyOutputStream &os, vector<Type> &a)
{
  if (os.hideOutput)
    return os;

  os << "{";

  if (a.size() > 0)
  {
    os << a[0];

    for (int i = 1; i < a.size(); i++)
      os << "," << a[i];
  }
  else
    os << " ";

  os << "}_" << (int)a.size();

  return os;
}

#ifdef LAPACK

template <>
MyOutputStream &operator<<(MyOutputStream &os, lapack_complex_double &a)
{
  if (os.hideOutput)
    return os;

  complex<double> x = (complex<double>)a;
  os << real(x);
  if (imag(x) >= 0.)
    os << "+" << imag(x) << "i";
  else
    os << imag(x) << "i";

  return os;
}

#endif

inline MyOutputStream::MyOutputStream(void)
{
  streamType = mos_terminal;

  strcpy(dblFrmt, "%-g");

  sprintf(fileName, "tmp.log");

  wipeFile();
}

inline MyOutputStream::MyOutputStream(char *stype, char *fname)
{
  if (strncmp(stype, "terminal", 8) == 0)
    streamType = mos_terminal;
  else if (strncmp(stype, "webpage", 7) == 0)
    streamType = mos_webpage;
  else if (strncmp(stype, "file_only", 9) == 0)
    streamType = mos_fileonly;
  else
  {
    streamType = mos_webpage;
    error("MyOutputStream::MyOutputStream: invalid streamType!");
  }
  if (strlen(fname) > MAX_MOS_NAME_LENGTH)
    error("MyOutputStream::MyOutputStream: file name too long!");

  sprintf(fileName, "%s", fname);

  strcpy(dblFrmt, "%-g");

  wipeFile();
}

inline MyOutputStream::MyOutputStream(MyStreamTypeEnum stype, char *fname)
{
  streamType = stype;

  if (strlen(fname) > MAX_MOS_NAME_LENGTH)
    error("MyOutputStream::MyOutputStream: file name too long!");

  sprintf(fileName, "%s", fname);

  strcpy(dblFrmt, "%-g");

  wipeFile();
}

inline bool directoryExists(char *dname)
{
  struct stat buffer;

  return (stat(dname, &buffer) == 0);
}

inline void MyOutputStream::setDirectory(char *dname, bool flag)
{
  if (strlen(dname) > MAX_MOS_NAME_LENGTH)
    error("MyOutputStream::setDirectory: direcory name too long!");

  snprintf(dir, MAX_MOS_NAME_LENGTH, "%s", dname);

  if (!directoryExists(dname) && flag)
    mkdir(dir, S_IRWXU);
}

inline void MyOutputStream::makeDirectory(char *dname, bool flag)
{
  snprintf(dir, MAX_MOS_NAME_LENGTH, "%s", dname);

  if (directoryExists(dir))
  {
    if (flag)
      return;
    else
      error("MyOutputStream::makeDirectory: directory exists!");
  }

  mkdir(dir, S_IRWXU);
}

inline void MyOutputStream::makeNewDirectory(int i)
{
  char tmp[MAX_MOS_NAME_LENGTH + 20];

  if (i > -1)
    iDir = i;

  sprintf(tmp, "%s_%04d", dir, iDir);

  if (i < 0)
    iDir++;

  if (directoryExists(tmp))
    error("MyOutputStream::makeNewDirectory: directory exists!");

  mkdir(tmp, S_IRWXU);
}

inline void MyOutputStream::enterSubDirectory(char *dname, bool flag)
{
  if (iDirTmp != -2)
    error("MyOutputStream::enterSubDirectory: sub directory appears to be active!");

  iDirTmp = iDir;

  strcpy(dirTmp, dir);

  char tmp[MAX_MOS_NAME_LENGTH * 2 + 20];

  if (iDir < 0)
    sprintf(tmp, "%s/%s", dirTmp, dname);

  else
    sprintf(tmp, "%s_%04d/%s", dirTmp, iDirTmp, dname);

  if (strlen(tmp) > MAX_MOS_NAME_LENGTH)
    error("MyOutputStream::enterSubDirectory: MAX_MOS_NAME_LENGTH is too small!");

  strncpy(dir, tmp, MAX_MOS_NAME_LENGTH);

  iDir = -1;

  if (directoryExists(dir))
  {
    if (flag)
      return;
    else
      error("MyOutputStream::enterSubDirectory: sub directory already exists!");
  }
  mkdir(dir, S_IRWXU);
}

inline void MyOutputStream::quitSubDirectory(void)
{
  if (iDirTmp == -2)
    error("MyOutputStream::quitSubDirectory: not in sub directory!");

  iDir = iDirTmp;

  sprintf(dir, "%s", dirTmp);

  iDirTmp = -2;
}

/*
inline bool MyOutputStream::directoryExists(void)
{
  char tmp[MAX_MOS_NAME_LENGTH + 100];

#ifdef MPI
  if (iDir < 0) sprintf(tmp,"%s/.dir_%d.test",dir,mpi.rank());
  else          sprintf(tmp,"%s_%03d/.dir_%d.test",dir,iDir,mpi.rank());
#else
  if (iDir < 0) sprintf(tmp,"%s/.dir.test",dir);
  else          sprintf(tmp,"%s_%03d/.dir.test",dir,iDir);
#endif

  ofstream of;

  of.open(tmp);
  if (of.is_open())
  {
    of.close();
    remove(tmp);
    return true;
  }
  else return false;
}
*/

inline void MyOutputStream::operator()(char *stype, char *fname)
{
  if (strncmp(stype, "terminal", 8) == 0)
    streamType = mos_terminal;
  else if (strncmp(stype, "webpage", 7) == 0)
    streamType = mos_webpage;
  else if (strncmp(stype, "file_only", 9) == 0)
    streamType = mos_fileonly;
  else
  {
    streamType = mos_webpage;
    error("MyOutputStream::operator(): invalid streamType!");
  }
  if (strlen(fname) > MAX_MOS_NAME_LENGTH)
    error("MyOutputStream::operator(): file name too long!");

  sprintf(fileName, "%s", fname);

  strcpy(dblFrmt, "%-g");

  wipeFile();
}

inline void MyOutputStream::openFile(char *fname, bool newFlag)
{
  char tmp[MAX_MOS_NAME_LENGTH * 3];

  if (fname == NULL)
  {
    if (iDir < 0)
      sprintf(tmp, "%s/%s", dir, fileName);
    else
      sprintf(tmp, "%s_%04d/%s", dir, iDir, fileName);
  }
  else
  {
    if (iDir < 0)
      sprintf(tmp, "%s/%s", dir, fname);
    else
      sprintf(tmp, "%s_%04d/%s", dir, iDir, fname);
  }

  // std::cout << tmp << "\n";

  if (newFlag)
    file.open(tmp, ios::out);
  else
    file.open(tmp, ios::out | ios::app);

  if (!file.is_open())
    error("MyOutputStream::openFile: could not open file for writing!");
}

inline void MyOutputStream::setType(char *stype)
{
  if (strncmp(stype, "none", 4) == 0)
    streamType = mos_none;
  else if (strncmp(stype, "terminal", 8) == 0)
    streamType = mos_terminal;
  else if (strncmp(stype, "webpage", 7) == 0)
    streamType = mos_webpage;
  else if (strncmp(stype, "file_only", 9) == 0)
    streamType = mos_fileonly;
  else
  {
    streamType = mos_webpage;
    error("MyOutputStream::setType: invalid streamType!");
  }
}

template <typename Type>
void MyOutputStream::printObject(Type &a)
{
  switch (streamType)
  {
  case mos_terminal:

    std::cout << a;

    break;

  case mos_webpage:

  case mos_fileonly:

    if (!file.is_open())
    {
      file.open(fileName, ios::app);

      file << a;

      file.close();
    }
    else
      file << a;

    break;
  }
}

template <typename Type>
void MyOutputStream::printVariable(Type a)
{
  switch (streamType)
  {
  case mos_none:
    return;

  case mos_terminal:

    std::cout << a;

    break;

  case mos_webpage:

  case mos_fileonly:

    if (!file.is_open())
    {
      file.open(fileName, ios::app);

      file << a;

      file.close();
    }
    else
      file << a;

    break;
  }
}

template <typename Type>
void MyOutputStream::error(const char *strg1, Type &a, const char *strg2)
{
  switch (streamType)
  {
  case mos_terminal:

    std::cout << "\nError: " << strg1 << a << strg2 << "\n\n";

    break;

  case mos_webpage:
  {
    std::cout << "\nError: " << strg1 << a << strg2 << "\n\n";
    std::stringstream ss;
    ss << strg1 << a << strg2;
    throw MosException(ss.str());
  }
    // std::cout << "Content-type:application/json\r\n\r\n\"Error: "
    //           << strg1 << a << strg2 << "\"\n";

  case mos_fileonly:

    if (!file.is_open())
      file.open(fileName, ios::app);

    file << "\nError: " << strg1 << a << strg2 << "\n\n";

    file.close();

    break;
  }
  exit(0);
}

template <typename Type>
void MyOutputStream::warning(const char *strg1, Type &a, const char *strg2)
{
  switch (streamType)
  {
  case mos_terminal:

    std::cout << "\nWarning: " << strg1 << a << strg2 << "\n\n";

    break;

  case mos_webpage:

    if (!file.is_open())
      file.open(fileName, ios::app);

    file << "\nWarning: " << strg1 << a << strg2 << "\n\n";

    file.close();

  case mos_fileonly:

    if (!file.is_open())
      file.open(fileName, ios::app);

    file << "\nWarning: " << strg1 << a << strg2 << "\n\n";

    file.close();

    break;
  }
}

template <typename Type>
MyOutputStream &MyOutputStream::array(Type *a, int n)
{
  *this << "{" << a[0];
  for (int i = 1; i < n; i++)
    *this << ", " << a[i];
  *this << "}_" << n;
  return *this;
}

template <typename Type>
MyOutputStream &MyOutputStream::matrix(Type *a, int n, int m)
{
  int i, j;

  for (i = 0; i < n; i++)
  {
    for (j = 0; j < m; j++)
      *this << " " << a[j * n + i];
    *this << "\n";
  }

  return *this;
}

inline MyOutputStream &MyOutputStream::operator()(int dl)
{
  if (dl > debugLevel)
    hideOutput = true;
  else
    hideOutput = false;

  return *this;
}

extern MyOutputStream mos;

#endif
