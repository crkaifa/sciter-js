
const WebViewStyle = CSS.set`
  :root {
     display: block;
     size: *;
     behavior: webview library(sciter-webview);
   }

  :root:busy {
    background: #fff url(sciter:busy.png) no-repeat 50% 50%;
  }
  :root:not(:busy):invalid { 
    background:red; 
  }
`;

export class WebView extends Element {

  initialUrl;
  currentUrl;
  #webApi; // list of methods 

  constructor({src,api}) {
    super();
    this.initialUrl = src;
    this.#webApi = api || {};
  }

  render() {
    if(this.initialUrl) {
      const src = this.initialUrl;
      this.initialUrl = null;
      return <widget.webview src={src} styleset={WebViewStyle} />
    } else 
      return <widget.webview styleset={WebViewStyle} />
  }

  ["webview-ready"]() {
    this.attributes["ready"] = "";
    this.ready();
  }

  ["webview-unavailable"]() {
    this.attributes["unavailable"] = "";
    this.unavailable();
  }

  ["webview-will-navigate"]({data}) {
     if(!this.willNavigate(data)) 
         return true; // webview convention - disables navigation
     this.currentUrl = data;
     this.state.busy = true;
  }

  ["webview-did-navigate"]() {
     this.state.busy = false;
     this.state.invalid = false;
     this.didNavigate(this.currentUrl); 
  }

  ["webview-navigate-failure"]() {
     this.state.busy = false;
     this.state.invalid = true;
     this.navigateFailure(); 
  }

  ["webview-title-change"]({data}) {
     this.titleDidChange(data); 
  }

  jsBridgeCall(params) {
      const [name,...args] = params; 
      const func = this.#webApi[name];
      if(typeof func == "function") 
        func.apply(this,args);
  }

  loadFile(url) { return this.webview.loadUrl(url) }
  loadHtml(html) { return this.webview.loadHtml(html) }
  reload() { return this.webview.reload(html) }
  goBackward() { return this.webview.goBack(); }
  goForward() { return this.webview.goForward(); }

  eval(JS) { return this.webview.evaluateJavaScript(JS); }

  // webApi is an object { name1: function(...), name2: function(...) } 
  // - list of function exposed to content of this webView
  get webApi() { return this.#webApi; }
  set webApi(map) { this.#webApi = map; }

  // overridables
  ready() {}
  unavailable() {}
  willNavigate(url) { return true; /*to allow navigation*/ }
  didNavigate(url) {}
  navigateFailure(url) {}  
  titleDidChange(title) {}
  //execMethod()

}