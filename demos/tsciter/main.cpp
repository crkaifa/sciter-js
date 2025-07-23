#include "sciter-x-window.hpp"

#include "sciter-x-debug.h"

class frame : public sciter::window {
public:
  frame() : window(SW_MAIN /*| SW_ENABLE_DEBUG*/) {}
};

int uimain(std::function<int()> run) {

  sciter::debug_output_console _;

  SciterSetOption(NULL, SCITER_SET_SCRIPT_RUNTIME_FEATURES,
    ALLOW_FILE_IO |
    ALLOW_SOCKET_IO |
    ALLOW_EVAL |
    ALLOW_SYSINFO |
    ALLOW_CMODULES);

#ifdef _DEBUG
  sciter::debug_output_console console;
#endif

  frame* pwin = new frame();

  // note: this:://app URL is dedicated to the sciter::archive content associated with the application
#ifdef OSX
  pwin->load(WSTR("home://../../../../../demos/tsciter/index.htm"));
#else
  pwin->load(WSTR("home://../../../demos/tsciter/index.htm"));
#endif
  pwin->expand();

  return run();

}
