
//#include "stdafx.h"
#include "sciter-x.h"
#include "sciter-x-behavior.h"
#include "sciter-x-threads.h"
#include "sciter-x-video-api.h"
#include <thread>

namespace sciter
{
  /*
  BEHAVIOR: video_generated_stream
    - provides synthetic video frames.
    - this code is here solely for the demo purposes - how
      to connect your own video frame stream with the rendering site

  COMMENTS:
     <video style="behavior: video-generator-direct video" />
  SAMPLE:
     See: samples/video/video-generator-behavior-direct-demo.htm

  NOTE:
     rendering_site->render_external_frame() puts pointer to frame (memory area) into queue for copying it to GPU.
     When the frame is not needed frame_release callback is called.

     Frame data is expected to be in [B,G,R,A,B,G,R,A,...] format

  */

  struct video_generated_stream_direct : public event_handler
  {
    sciter::om::hasset<sciter::video_destination> rendering_site;
    // ctor
    video_generated_stream_direct() {}
    virtual ~video_generated_stream_direct() {}

    virtual bool subscription(HELEMENT he, UINT& event_groups)
    {
      event_groups = HANDLE_BEHAVIOR_EVENT; // we only handle VIDEO_BIND_RQ here
      return true;
    }

    virtual void attached(HELEMENT he) {
      he = he;
    }

    virtual void detached(HELEMENT he) { asset_release(); }
    virtual bool on_event(HELEMENT he, HELEMENT target, BEHAVIOR_EVENTS type, UINT_PTR reason)
    {
      if (type != VIDEO_BIND_RQ)
        return false;
      // we handle only VIDEO_BIND_RQ requests here

      //printf("VIDEO_BIND_RQ %d\n",reason);

      if (!reason)
        return true; // first phase, consume the event to mark as we will provide frames

      rendering_site = (sciter::video_destination*) reason;
      sciter::om::hasset<sciter::video_destination> fsite;

      if (rendering_site->asset_get_interface(VIDEO_DESTINATION_INAME, fsite.target()))
      {
        std::thread(generation_thread, fsite).detach();
      }

      return true;
    }

    static void generation_thread(sciter::om::hasset<sciter::video_destination> rendering_site) {
      // simulate video stream

      static int cnt = 0;

      cnt += 10;
      // simulate video stream 
      sciter::sync::sleep(100 + (cnt));

      const int VIDEO_WIDTH = 1200;
      const int VIDEO_HEIGHT = 800;

      // let's pretend that we have 640*480 video frames
      rendering_site->start_streaming(VIDEO_WIDTH, VIDEO_HEIGHT, COLOR_SPACE_RGB32);

      unsigned color = rand();
      srand((unsigned int)(UINT_PTR)(sciter::video_destination*)rendering_site);
      int start = 0;

      auto generate_fill_color = [&]() {
        color = 0xff000000 |
          ((unsigned(rand()) & 0xff) << 16) |
          ((unsigned(rand()) & 0xff) << 8) |
          ((unsigned(rand()) & 0xff) << 0);
      };

      generate_fill_color();

      // allocate frame, data will be used by copying it directly to GPU
      unsigned int* frame = new unsigned int[VIDEO_WIDTH * VIDEO_HEIGHT];
      bool frame_is_free = true;

      while (rendering_site->is_alive())
      {
        std::this_thread::sleep_for(std::chrono::milliseconds(33)); // simulate 30 FPS rate

        // release frame, when it is not used internally
        auto releaser = [](const BYTE* data, void* context) {
          //unsigned int* frame = (unsigned int*)data;
          //delete[] frame;
          *((bool*)(context)) = true; // frame_is_free = true
        };

        ++start;
        if (start > 120) {
          start = 0;
          generate_fill_color();
        }
        assert(frame_is_free);
        for (int n = start; n < VIDEO_WIDTH*VIDEO_HEIGHT; n += 120) {
          frame[n] = color;
        }
        // pass the frame for rendering, the frame will be copied to GPU
        rendering_site->render_external_frame(
          (const unsigned char*)frame, 
          sizeof(unsigned int) * VIDEO_WIDTH * VIDEO_HEIGHT,
          sizeof(unsigned int) * VIDEO_WIDTH,
          releaser,
          &frame_is_free
        );
      }
      rendering_site->stop_streaming();
        
      delete[] frame;
      
    }

  };

  struct video_generated_stream_direct_factory : public behavior_factory {

    video_generated_stream_direct_factory() : behavior_factory("video-generator-direct") {

    }

    // the only behavior_factory method:
    virtual event_handler* create(HELEMENT he) {
      return new video_generated_stream_direct();
    }

  };

  // instantiating and attaching it to the global list
  video_generated_stream_direct_factory video_generated_stream_factory_direct_instance;


}


