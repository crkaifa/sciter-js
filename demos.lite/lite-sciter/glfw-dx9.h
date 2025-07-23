
#ifdef SCITER_LITE_D9

#include <d3d9.h>
#include <d3dx9core.h>

#pragma comment (lib, "d3d9.lib")
#pragma comment (lib, "d3dx9.lib")

#define GLFW_EXPOSE_NATIVE_WIN32

#include "GLFW/glfw3.h"
#include "GLFW/glfw3native.h"

#include <wrl/client.h>

using namespace Microsoft::WRL;

struct context {

	ComPtr<IDirect3D9> d9;
	ComPtr<IDirect3DDevice9> d9device;
	ComPtr<IDirect3DTexture9> d9texture;
	ComPtr<ID3DXSprite> d9sprite;

	int width, height;

	context(GLFWwindow* window) {

		glfwGetFramebufferSize(window, &width, &height);

		d9 = Direct3DCreate9(D3D_SDK_VERSION);    // create the Direct3D interface

		D3DPRESENT_PARAMETERS d3dpp = {};    // create a struct to hold various device information

		d3dpp.Windowed = TRUE;														// program windowed, not fullscreen
		d3dpp.SwapEffect = D3DSWAPEFFECT_DISCARD;					// discard old frames
		d3dpp.hDeviceWindow = glfwGetWin32Window(window); // set the window to be used by Direct3D

		// create a device class using this information and information from the d3dpp stuct
		d9->CreateDevice(D3DADAPTER_DEFAULT,
			D3DDEVTYPE_HAL,
			d3dpp.hDeviceWindow,
			D3DCREATE_SOFTWARE_VERTEXPROCESSING,
			&d3dpp,
			d9device.GetAddressOf());

		D3DXCreateSprite(d9device.Get(), d9sprite.GetAddressOf());

		resize(width, height);
	}

	void swap_buffers() {
		d9device->Present(NULL, NULL, NULL, NULL);
	}

	void resize(int width, int height) {

		HRESULT hr;

		this->width = width;
		this->height = height;

		d9device->CreateTexture(width, height, 1, D3DUSAGE_RENDERTARGET, D3DFMT_A8B8G8R8, D3DPOOL_DEFAULT, d9texture.GetAddressOf(), NULL);
	}

	IUnknown* device() const {
		return d9device.Get();
	}

	IUnknown* texture() const {
		return d9texture.Get();
	}

	void draw_scene() {
		// ... draw something cool here ..
		d9device->Clear(0, NULL, D3DCLEAR_TARGET, D3DCOLOR_XRGB(0, 40, 100), 1.0f, 0);
		//device->BeginScene();  // begins the 3D scene
		//// do 3D rendering on the back buffer here
		//device->EndScene();    // ends the 3D scene
	}

	void draw_texture(const RECT&) {
		d9device->BeginScene();  // begins the 3D scene
		d9sprite->Begin(0);
		d9sprite->Draw(d9texture.Get(), NULL, NULL, NULL, 0xFFFFFFFF);
		d9sprite->End();
		d9device->EndScene();    // ends the 3D scene
	}

	void init_shaders() {
	}

};

#endif


