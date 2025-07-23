#ifndef __webview_callbacks__
#define __webview_callbacks__

#include <string>
#include <functional>

namespace webview
{
  using dispatch_fn_t = std::function<void()>;
  using completion_fn_t = std::function<void(bool succeed)>;
  using msg_callback_t = std::function<void(const std::string&)>;

  enum class navigation_event {
    will_navigate,
    did_navigate,
    navigate_failure,
    title_did_change,
  };

  using navigation_callback_t = std::function<int(navigation_event, const std::string&)>;

}

#endif