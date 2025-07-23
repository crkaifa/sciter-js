
#ifdef SCITER_LITE_D11

#include <d3d11.h>
#include <d3d11_1.h>
#include <d3dcompiler.h>
#include <directxmath.h>
#pragma comment (lib, "d3d11.lib")
#pragma comment (lib, "d3dcompiler.lib")

#define GLFW_EXPOSE_NATIVE_WIN32

#include "GLFW/glfw3.h"
#include "GLFW/glfw3native.h"

#include <wrl/client.h>

using namespace Microsoft::WRL;

struct context {

  ComPtr<ID3D11Device1> d11_device;
  ComPtr<IDXGISwapChain> d11_swap_chain;
  ComPtr<ID3D11DeviceContext1> d11_device_context;
	ComPtr<ID3DDeviceContextState> device_context_state;
	ComPtr<ID3DDeviceContextState> device_context_state_p;
  ComPtr<ID3D11RenderTargetView> render_target_view;
	ComPtr<ID3D11Texture2D> d11_texture;
	ComPtr<ID3D11InputLayout> d11_input_layout;
	ComPtr<ID3D11ShaderResourceView> d11_texture_shader_resource_view;
	ComPtr<ID3D11VertexShader> vertex_shader;
	ComPtr<ID3D11PixelShader> pixel_shader;
	ComPtr<ID3D11BlendState> blend_state;
	ComPtr<ID3D11Buffer> vertex_data_buffer;

	int width, height;
	uint32_t vertex_stride;
	uint32_t num_vertices;

  context(GLFWwindow* window) {

		glfwGetFramebufferSize(window, &width, &height);


		DXGI_SWAP_CHAIN_DESC sd = {};
		sd.BufferDesc.Width = 0;
		sd.BufferDesc.Height = 0;
		sd.BufferDesc.Format = DXGI_FORMAT_B8G8R8A8_UNORM;
		sd.BufferDesc.RefreshRate.Numerator = 0;
		sd.BufferDesc.RefreshRate.Denominator = 0;
		sd.BufferDesc.Scaling = DXGI_MODE_SCALING_STRETCHED;
		sd.BufferDesc.ScanlineOrdering = DXGI_MODE_SCANLINE_ORDER_UNSPECIFIED;
		sd.SampleDesc.Count = 1;
		sd.SampleDesc.Quality = 0;
		sd.BufferUsage = DXGI_USAGE_RENDER_TARGET_OUTPUT;
		sd.BufferCount = 1;
		sd.OutputWindow = glfwGetWin32Window(window);
		sd.Windowed = TRUE;
		sd.SwapEffect = DXGI_SWAP_EFFECT_SEQUENTIAL;
		sd.Flags = 0;

		ComPtr<ID3D11DeviceContext> device_context;
		HRESULT hr;

		ComPtr<ID3D11Device> device;

		hr = D3D11CreateDeviceAndSwapChain(
			nullptr,
			D3D_DRIVER_TYPE_HARDWARE,
			nullptr,
			0,
			nullptr,
			0,
			D3D11_SDK_VERSION,
			&sd,
			d11_swap_chain.GetAddressOf(),
			device.GetAddressOf(),
			nullptr,//output feature pointer
			device_context.GetAddressOf()
		);
		assert(SUCCEEDED(hr));
		hr = device.As(&d11_device);
		assert(SUCCEEDED(hr));


		D3D_FEATURE_LEVEL feature_levels[] = {
			D3D_FEATURE_LEVEL_11_1,
			D3D_FEATURE_LEVEL_11_0,
		};
		D3D_FEATURE_LEVEL used_feature_level;


		d11_device->CreateDeviceContextState(0,
			feature_levels, _countof(feature_levels),
			D3D11_SDK_VERSION,
			__uuidof(ID3D11Device),
			&used_feature_level,
			device_context_state.GetAddressOf());
		assert(SUCCEEDED(hr));

		hr = device_context.As(&d11_device_context);
		assert(SUCCEEDED(hr));

		ComPtr<ID3D11Resource> backBuffer;
		d11_swap_chain->GetBuffer(0, __uuidof(ID3D11Resource), reinterpret_cast<void**>(backBuffer.GetAddressOf()));
		d11_device->CreateRenderTargetView(
			backBuffer.Get(),
			nullptr,
			render_target_view.GetAddressOf()
		);


		// Blend State
		D3D11_BLEND_DESC blendDesc = {};
		blendDesc.RenderTarget[0].BlendEnable = TRUE;
		blendDesc.RenderTarget[0].SrcBlend = D3D11_BLEND_SRC_ALPHA;
		blendDesc.RenderTarget[0].DestBlend = D3D11_BLEND_INV_SRC_ALPHA;
		blendDesc.RenderTarget[0].BlendOp = D3D11_BLEND_OP_ADD;
		blendDesc.RenderTarget[0].SrcBlendAlpha = D3D11_BLEND_ONE;
		blendDesc.RenderTarget[0].DestBlendAlpha = D3D11_BLEND_ZERO;
		blendDesc.RenderTarget[0].BlendOpAlpha = D3D11_BLEND_OP_ADD;
		blendDesc.RenderTarget[0].RenderTargetWriteMask = D3D11_COLOR_WRITE_ENABLE_ALL;

		hr = d11_device->CreateBlendState(&blendDesc, blend_state.GetAddressOf());
		assert(SUCCEEDED(hr));

		static float VertexData[] = {
#if 0 // testing
				-0.5f, -0.5f, 0.0f, 0.0f,
				-0.5f, 0.5f, 0.0f, 1.0f,
				0.5f, 0.5f, 1.0f, 1.0f,
				-0.5f, -0.5f, 0.0f, 0.0f,
				0.5f, 0.5f, 1.0f, 1.0f,
				0.5f, -0.5f, 1.0f, 0.0f
#else
				-1.0f, -1.0f, 0.0f, 0.0f,
				-1.0f, 1.0f, 0.0f, 1.0f,
				1.0f, 1.0f, 1.0f, 1.0f,
				-1.0f, -1.0f, 0.0f, 0.0f,
				1.0f, 1.0f, 1.0f, 1.0f,
				1.0f, -1.0f, 1.0f, 0.0f
#endif
		};

		// Vertex buffer

		D3D11_BUFFER_DESC VertexDataDesc = {
				sizeof(VertexData),
				D3D11_USAGE_DEFAULT,
				D3D11_BIND_VERTEX_BUFFER,
				0, 0, 0
		};
		D3D11_SUBRESOURCE_DATA VertexDataInitial = { VertexData };
		hr = d11_device->CreateBuffer(&VertexDataDesc,
			&VertexDataInitial,
			&vertex_data_buffer);
		assert(SUCCEEDED(hr));

		vertex_stride = 4 * sizeof(float);
		num_vertices = sizeof(VertexData) / vertex_stride;

		init_shaders();

		resize(width, height);
  }

	void swap_buffers() {
		d11_swap_chain->Present(0u, 0u);
	}

	void resize(int width, int height) {

		HRESULT hr;

		if (this->width != width || this->height != height) {
			render_target_view.Reset();
			hr = d11_swap_chain->ResizeBuffers(1, width, height, DXGI_FORMAT_B8G8R8A8_UNORM, 0);
			assert(SUCCEEDED(hr));
			ComPtr<ID3D11Resource> backBuffer;
			hr = d11_swap_chain->GetBuffer(0, __uuidof(ID3D11Resource), reinterpret_cast<void**>(backBuffer.GetAddressOf()));
			assert(SUCCEEDED(hr));
			hr = d11_device->CreateRenderTargetView(backBuffer.Get(), nullptr, render_target_view.GetAddressOf());
			assert(SUCCEEDED(hr));
		}
		
		this->width = width;
		this->height = height;

		D3D11_TEXTURE2D_DESC desc = {};
		desc.Width = width;
		desc.Height = height;
		desc.MipLevels = desc.ArraySize = 1;
		desc.Format = DXGI_FORMAT_B8G8R8A8_UNORM_SRGB; // DXGI_FORMAT_B8G8R8A8_UNORM_SRGB;
		desc.SampleDesc.Count = 1;
		desc.ArraySize = 1;
		desc.Usage = D3D11_USAGE_DEFAULT;
		desc.BindFlags = D3D11_BIND_SHADER_RESOURCE | D3D11_BIND_RENDER_TARGET;
		desc.CPUAccessFlags = D3D11_CPU_ACCESS_WRITE;
		desc.MiscFlags = 0;

		hr = d11_device->CreateTexture2D(&desc, NULL, d11_texture.ReleaseAndGetAddressOf());
		assert(SUCCEEDED(hr));

		hr = d11_device->CreateShaderResourceView(d11_texture.Get(), nullptr, d11_texture_shader_resource_view.ReleaseAndGetAddressOf());
		assert(SUCCEEDED(hr));

	}

	IUnknown* device() const {
		return d11_device.Get();
	}

	IUnknown* texture() const {
		return d11_texture.Get();
	}

	void draw_scene() {

		// saving state  
		d11_device_context->SwapDeviceContextState(device_context_state.Get(), device_context_state_p.ReleaseAndGetAddressOf());

		// ... draw something cool here ...
		float Color[4] = { 0.0f, 1.0f, 1.0f, 1.0f };
		d11_device_context->ClearRenderTargetView(render_target_view.Get(), Color);

	}

	void draw_texture(const RECT&) {

		D3D11_VIEWPORT Viewport = {
				0.0f, 0.0f,
				(float)width, (float)height,
				0.0f, 1.0f
		};

		// restoring initial state 
		d11_device_context->SwapDeviceContextState(device_context_state_p.Get(),NULL);

		d11_device_context->RSSetViewports(1, &Viewport);

		d11_device_context->OMSetRenderTargets(1, render_target_view.GetAddressOf(), nullptr /*depth_stencil_view.Get()*/);

		d11_device_context->IASetPrimitiveTopology(D3D11_PRIMITIVE_TOPOLOGY_TRIANGLELIST);
		d11_device_context->IASetInputLayout(d11_input_layout.Get());

		d11_device_context->OMSetBlendState(blend_state.Get(), nullptr, 0xffffff);

		d11_device_context->VSSetShader(vertex_shader.Get(), 0, 0);
		d11_device_context->PSSetShader(pixel_shader.Get(), 0, 0);

		d11_device_context->PSSetShaderResources(0, 1, d11_texture_shader_resource_view.GetAddressOf());

		uint32_t offset = 0;
		d11_device_context->IASetVertexBuffers(0, 1, vertex_data_buffer.GetAddressOf(), &vertex_stride, &offset);

		d11_device_context->Draw(num_vertices, 0);
	
	}

	void init_shaders() {

		static char shaders[] = R"(struct VS_Input
{
  float2 position: POSITION;
  float2 uv: UV;
};

struct VS_Output
{
  float4 position: SV_POSITION;
  float2 uv: UV;
};

VS_Output vs_main(VS_Input input)
{
  VS_Output output;
  output.position = float4(input.position, 0.0f, 1.0f);
  output.uv = input.uv;
  return output;
};

Texture2D my_texture;
SamplerState my_sampler;

float4 ps_main(VS_Output input): SV_TARGET
{ 
  float4 pixelColor = my_texture.Sample(my_sampler, input.uv);
  return pixelColor;
};)";

		ComPtr<ID3D10Blob> VSBlob;
		HRESULT hr;

		hr = D3DCompile(shaders, sizeof shaders, "shaders.hlsl", nullptr, nullptr, "vs_main",
			"vs_5_0", 0, 0, VSBlob.GetAddressOf(), nullptr);

		assert(SUCCEEDED(hr));

		hr = d11_device->CreateVertexShader(VSBlob->GetBufferPointer(),
			VSBlob->GetBufferSize(),
			0,
			vertex_shader.GetAddressOf());
		assert(SUCCEEDED(hr));

		ComPtr<ID3D10Blob> PSBlob;
		hr = D3DCompile(shaders, sizeof shaders, "shaders.hlsl", nullptr, nullptr, "ps_main",
			"ps_5_0", 0, 0, PSBlob.GetAddressOf(), nullptr);

		assert(SUCCEEDED(hr));
		
		hr = d11_device->CreatePixelShader(PSBlob->GetBufferPointer(),
			PSBlob->GetBufferSize(),
			0,
			pixel_shader.GetAddressOf());
		assert(SUCCEEDED(hr));

		// Input layout

		D3D11_INPUT_ELEMENT_DESC InputElementDesc[] = {
				{
						"POSITION", 0,
						DXGI_FORMAT_R32G32_FLOAT,
						0, 0,
						D3D11_INPUT_PER_VERTEX_DATA, 0
				},
				{
						"UV", 0,
						DXGI_FORMAT_R32G32_FLOAT,
						0, D3D11_APPEND_ALIGNED_ELEMENT,
						D3D11_INPUT_PER_VERTEX_DATA, 0
				}
		};

		
		hr = d11_device->CreateInputLayout(InputElementDesc,
			ARRAYSIZE(InputElementDesc),
			VSBlob->GetBufferPointer(),
			VSBlob->GetBufferSize(),
			&d11_input_layout
		);
		assert(SUCCEEDED(hr));

		

	}


};

#endif


