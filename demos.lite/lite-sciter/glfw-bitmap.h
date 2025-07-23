
#ifdef SCITER_LITE_BITMAP
#ifdef WINDOWS

#define GLFW_EXPOSE_NATIVE_WIN32
#include "GLFW/glfw3.h"
#include "GLFW/glfw3native.h"

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

struct context {
  dib32 dib;
  HWND  hwnd;

  context(GLFWwindow* window) {
    hwnd = glfwGetWin32Window(window);
  }

  void resize(UINT w, UINT h) {
    dib.resize(w, h);
  }

  void draw_texture(const RECT& update_rc) {

    if (::IsRectEmpty(&update_rc))
      return;

    HDC  clientDC = ::GetDC(hwnd);
    RECT clientRC; ::GetClientRect(hwnd,&clientRC);

    //::IntersectClipRect(clientDC, update_rc.left, update_rc.top, update_rc.right, update_rc.bottom);
    HRGN hrgn = CreateRectRgn(update_rc.left, update_rc.top, update_rc.right, update_rc.bottom);
    ::SelectClipRgn(clientDC, hrgn);
    DeleteObject(hrgn);

    ::StretchDIBits(
      clientDC,
      clientRC.left,                      // X position
      clientRC.top,                       // Y position
      clientRC.right - clientRC.left,     // Destination width
      clientRC.bottom - clientRC.top,     // Destination height
      0,
      0,
      dib.width,
      dib.height,
      dib.bits,
      &dib.bitmap_info, 
      DIB_RGB_COLORS,
      SRCCOPY);

    ::ReleaseDC(hwnd, clientDC);
  }

  void swap_buffers() {}
  void draw_scene() {}

};

#endif
#endif
