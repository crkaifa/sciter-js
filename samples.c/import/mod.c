#include <jsbridge.h>

#import "sub.c"

export jsvalue question() {
  return jsvalue_new("%s", "Ultimate Question of Life, the Universe, and Everything");
}

