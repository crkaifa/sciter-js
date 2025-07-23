#include <jsbridge.h>
#include <stdlib.h>

#ifdef WINDOWS 

#define WINAPI __attribute__((__stdcall))

typedef int WINAPI MessageBoxA (
  void*,
  const char*,
  const char*,
  uint32
);

#define MB_OK 0x00000000L

export int32 messageBox(jsvalue msg) {

  char message[256]; size_t length = 256;
  jsvalue_fetch(msg, "%c#",message,&length);

  void* dll = dlopen("User32.dll");
  MessageBoxA* msgbox = dlsym(dll,"MessageBoxA");
  return msgbox(0, message,"Hi!",MB_OK);
}

#endif