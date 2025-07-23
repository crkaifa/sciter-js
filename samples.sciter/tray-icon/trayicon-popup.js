
const styles = CSS.set`
  
  body {
    margin:0;
    font:system;
  }

  menu {
    visibility:visible;
    display:block;
    width:max-content;
    height:max-content;
    border:none;
  }`;

const hostWindow = Window.this;
let   contentProducer;

export function setup(iconUrl, iconText, contentProducer) {
  
    let r = hostWindow.trayIcon({
        image: Graphics.Image.load(iconUrl,true),
        text: iconText,
    });
    console.assert(r, "trayIcon");

    hostWindow.document.on("beforeunload", evt => {  hostWindow.trayIcon("remove") });

    hostWindow.on("trayiconclick", evt => { 
      createTrayIconPopupWindow(contentProducer());
    });

}

function createTrayIconPopupWindow(content) {

  const html = <html window-frame="solid-with-shadow"
        window-resizable="false"
        window-minimizable="false"
        window-maximizable="false"
        window-blurbehind="auto"
        window-closable="false" style="overflow:hidden">
      <body styleset={ styles }>{ content }</body>
  </html>;

  let [x,y,w,h] = hostWindow.trayIcon("place",false);
  let [sx,sy,sw,sh] = hostWindow.screenBox("workarea","xywh",false);

  let alignment = 2;
  let screenX = 0, screenY = 0;

  if( y >= sy + sh) {
    alignment = 2; // at top of icon
    screenX = x + w / 2; 
    screenY = y; 
  } else {
    alignment = 8; // at bottom of icon
    screenX = x + w / 2; 
    screenY = y + h; 
  }

  const window =  new Window({
         type: Window.POPUP_WINDOW,
         parent: hostWindow,
         html: html,
         state:Window.WINDOW_SHOWN,
         x:screenX, 
         y:screenY,
         alignment: alignment
      });

  window.document.on("ready", event => { window.activate(true); });
  window.document.on("focusout", event => { window.close(); });

}

