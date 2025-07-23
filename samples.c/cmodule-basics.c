#include <jsbridge.h>

export int32 sumInt16(int16* v, int sz ) {
  int32 sum = 0; 
  for(int n = 0; n < sz; ++n)
    sum += v[n];
  return sum;
}

export jsvalue returnObject() {

  int32 answers[] = { 1,2,13,42 } ; 
  const char* question = "Ultimate Question of Life, the Universe, and Everything";

  return jsvalue_new("{question:%s,answers:%i#}",question,answers,countof(answers));
}

export void voidFunc(int n) {
  n + n;
}

export int consumeObject(jsvalue obj) {
  char   question[1024]; 
  size_t question_length = countof(question);
  int    answer = 0;
  return jsvalue_fetch(obj,"{question:%c#,answers:%i}",question,&question_length,&answer);
}

