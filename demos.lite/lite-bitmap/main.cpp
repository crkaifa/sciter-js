#define WINDOWLESS
#define WINDOW_CLASS_NAME L"sciter-plain-window"

#include "sciter-x.h"

struct dib32 {
  UINT    width = 0;
  UINT    height = 0;
  UINT    stride = 0;
  LPVOID  bits = NULL;
  HBITMAP old_bitmap = NULL;
  HBITMAP bitmap = NULL;
  HDC     dc = NULL;
  BITMAPINFO bitmap_info = {};

  dib32() {}
  dib32(UINT w, UINT h) { resize(w, h); }

  ~dib32() {
    clear();
  }

  void clear() {
    if (dc) {
      ::SelectObject(dc, old_bitmap);
      ::DeleteDC(dc);
    }
    if (bitmap)
      ::DeleteObject(bitmap);
  }

  bool resize(UINT w, UINT h) {

    if (w == width && h == height)
      return true;

    clear();

    width = w;
    height = h;

    bitmap_info = {};
    bitmap_info.bmiHeader.biSize = sizeof(bitmap_info.bmiHeader);
    bitmap_info.bmiHeader.biWidth = width;
    bitmap_info.bmiHeader.biHeight = 0 - int(height);
    bitmap_info.bmiHeader.biPlanes = 1;
    bitmap_info.bmiHeader.biBitCount = 32;
    bitmap_info.bmiHeader.biCompression = BI_RGB;

    bitmap = ::CreateDIBSection(NULL, // device context
      &bitmap_info, DIB_RGB_COLORS, &bits,
      0,  // file mapping object
      0); // file offset

    if (0 == bits)
      return false;

    stride = ((width * 32 + 31) / 32) * 4;

    //memset(bits, 0, width * height * 4);
    return true;
  }

  bool is_valid() const { return bits != 0; }

  HDC  DC() {
    if (!dc) {
      dc = ::CreateCompatibleDC(NULL);
      if (dc) old_bitmap = (HBITMAP)::SelectObject(dc, bitmap);
    }
    return dc;
  }
};

static dib32 ctx;

static UINT SC_CALLBACK sciterCallback (LPSCITER_CALLBACK_NOTIFICATION pnm, LPVOID param)
{
    switch (pnm->code)
    {
        case SC_INVALIDATE_RECT:
        InvalidateRect ((HWND)param, &((SCN_INVALIDATE_RECT*)pnm)->invalidRect, FALSE);
        return 0;
    }
    return 0;
}

static bool mouseEnter = false;

static LRESULT CALLBACK windowCallback (HWND hWnd, UINT message, WPARAM wParam, LPARAM lParam)
{
    switch (message)
    {
        case WM_DESTROY:
        {
            SciterProcX (hWnd, SCITER_X_MSG_DESTROY());
            PostQuitMessage (0);
            break;
        }
        case WM_SIZE:
        {
            UINT width  = LOWORD (lParam);
            UINT height = HIWORD (lParam);
            SL_SURFACE surface = {};
            ctx.resize (width, height);
            surface.bitmap.pixels = ctx.bits;
            surface.bitmap.stride = ctx.stride;
            SciterProcX (hWnd, SCITER_X_MSG_SIZE (width, height, surface));
            break;
        }
        case WM_PAINT:
        {
            PAINTSTRUCT ps = {};
            if (HDC clientDC = BeginPaint (hWnd, &ps))
            {
              RECT clientRC; ::GetClientRect(hWnd, &clientRC);

              SciterProcX(hWnd, SCITER_X_MSG_PAINT(clientRC));

              ::StretchDIBits(
                clientDC,
                clientRC.left,                      // X position
                clientRC.top,                       // Y position
                clientRC.right - clientRC.left,     // Destination width
                clientRC.bottom - clientRC.top,     // Destination height
                0,
                0,
                ctx.width,
                ctx.height,
                ctx.bits,
                &ctx.bitmap_info,
                DIB_RGB_COLORS,
                SRCCOPY);
            }
            EndPaint(hWnd, &ps);
            break;
        }

        case WM_LBUTTONDOWN:
        case WM_MBUTTONDOWN:
        case WM_RBUTTONDOWN:
        case WM_LBUTTONUP:
        case WM_MBUTTONUP:
        case WM_RBUTTONUP:
        case WM_LBUTTONDBLCLK:
        case WM_RBUTTONDBLCLK:
        case WM_MBUTTONDBLCLK:
        case WM_MOUSEMOVE:
        case WM_MOUSELEAVE:
        {

          unsigned mb = 0;

          switch (message) {
          case WM_LBUTTONDOWN:  case WM_LBUTTONUP:  case WM_LBUTTONDBLCLK:  mb |= MOUSE_BUTTONS::MAIN_MOUSE_BUTTON; break;
          case WM_RBUTTONDOWN:  case WM_RBUTTONUP:  case WM_RBUTTONDBLCLK:  mb |= MOUSE_BUTTONS::PROP_MOUSE_BUTTON; break;
          case WM_MBUTTONDOWN:  case WM_MBUTTONUP:  case WM_MBUTTONDBLCLK:  mb |= MOUSE_BUTTONS::MIDDLE_MOUSE_BUTTON; break;
          case WM_MOUSEMOVE: case WM_MOUSELEAVE:
            if (wParam & MK_LBUTTON)
              mb |= MOUSE_BUTTONS::MAIN_MOUSE_BUTTON;
            if (wParam & MK_RBUTTON)
              mb |= MOUSE_BUTTONS::PROP_MOUSE_BUTTON;
            if (wParam & MK_MBUTTON)
              mb |= MOUSE_BUTTONS::MIDDLE_MOUSE_BUTTON;
            break;
          }

          unsigned ks = 0;
          if (wParam & MK_SHIFT)
            ks |= KEYBOARD_STATES::KEYBOARD_STATE_LSHIFT;
          if (wParam & MK_CONTROL)
            ks |= KEYBOARD_STATES::KEYBOARD_STATE_LCONTROL;
          if (wParam & MK_ALT)
            ks |= KEYBOARD_STATES::KEYBOARD_STATE_LALT;


          MOUSE_EVENTS evt = MOUSE_EVENTS::MOUSE_MOVE;

          switch (message)
          {
          case WM_LBUTTONDOWN:
          case WM_MBUTTONDOWN:
          case WM_RBUTTONDOWN:
            evt = MOUSE_EVENTS::MOUSE_DOWN;
            break;

          case WM_LBUTTONUP:
          case WM_MBUTTONUP:
          case WM_RBUTTONUP:
            evt = MOUSE_EVENTS::MOUSE_UP;
            break;

          case WM_LBUTTONDBLCLK:
          case WM_RBUTTONDBLCLK:
          case WM_MBUTTONDBLCLK:
            evt = MOUSE_EVENTS::MOUSE_DCLICK;
            break;

          case WM_MOUSEMOVE:
            evt = MOUSE_EVENTS::MOUSE_MOVE;
            if (!mouseEnter) {
              evt = MOUSE_EVENTS::MOUSE_ENTER;

              TRACKMOUSEEVENT me = { sizeof(TRACKMOUSEEVENT) };
              me.dwFlags = TME_LEAVE;
              me.hwndTrack = hWnd;
              TrackMouseEvent(&me);

              mouseEnter = true;
            }
            break;

          case WM_MOUSELEAVE:
            evt = MOUSE_EVENTS::MOUSE_LEAVE;
            mouseEnter = false;
            break;
          }

          POINT pos = { LOWORD(lParam), HIWORD(lParam) };

          auto ok = SciterProcX(hWnd, SCITER_X_MSG_MOUSE(evt, MOUSE_BUTTONS(mb), KEYBOARD_STATES(ks), pos));
          if (!ok)
            ok = 0;

          break;
        }



        default: return DefWindowProc (hWnd, message, wParam, lParam);
    }
    return 0;
}

int WINAPI wWinMain (HINSTANCE, HINSTANCE, PWSTR, int)
{
    SciterSetOption(NULL, SCITER_SET_SCRIPT_RUNTIME_FEATURES,
      ALLOW_FILE_IO |
      ALLOW_SOCKET_IO |
      ALLOW_EVAL |
      ALLOW_SYSINFO);

    sciter::debug_output_console yes;

    WNDCLASSEX wcex;
    wcex.cbSize = sizeof(WNDCLASSEX);
    wcex.style = CS_HREDRAW | CS_VREDRAW;
    wcex.lpfnWndProc = windowCallback;
    wcex.cbClsExtra = 0;
    wcex.cbWndExtra = 0;
    wcex.hInstance = NULL;
    wcex.hIcon = NULL;
    wcex.hCursor = LoadCursor(NULL, IDC_ARROW);
    wcex.hbrBackground = (HBRUSH)(COLOR_WINDOW + 1);
    wcex.lpszMenuName = 0;
    wcex.lpszClassName = WINDOW_CLASS_NAME;
    wcex.hIconSm = NULL;
    RegisterClassEx (&wcex);

    HWND window = CreateWindow (WINDOW_CLASS_NAME, L"demo", WS_OVERLAPPEDWINDOW, CW_USEDEFAULT, 0, 800, 600, 
                                NULL, NULL, NULL, NULL);
    SAPI();
    SciterProcX       (window, SCITER_X_MSG_CREATE (SL_TARGET_BITMAP, FALSE));
    SciterProcX       (window, SCITER_X_MSG_RESOLUTION (GetDpiForWindow (window)));
    SciterSetCallback (window, sciterCallback, window);
    SciterLoadFile    (window, WSTR ("home://../../../demos.lite/lite-bitmap/main.htm"));

    ShowWindow   (window, SW_SHOW);
    UpdateWindow (window);

    for (;;)
    {
        SciterProcX (window, SCITER_X_MSG_HEARTBIT (GetTickCount()));
        MSG msg;
        if (PeekMessage (&msg, NULL, 0, 0, PM_REMOVE))
        {
            if (msg.message == WM_QUIT)
                break;

            TranslateMessage (&msg);
            DispatchMessage  (&msg);
        }
        else Sleep (16);
    }

    return 0;
}