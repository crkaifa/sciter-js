
const styles = CSS.set`
  .button.light { fill: #eee; }
  .button.dark { fill: #777; }
  .button:active { fill: gold; }
`;

export class Stick extends Element {
  paintContent(gfx) {
    const vx = this.attributes["vx"];
    const vy = this.attributes["vy"];
  }
}

export class GamepadView extends Element {
  gamepad = null;
  stick0;
  stick1;

  constructor({pad}) {
    super();
    this.gamepad = pad;
  }  

  render() {

    const buttons = this.gamepad.buttons;
    const axes = this.gamepad.axes;

    return <svg 
       styleset={styles}
       id="standard-gamepad"
       height="744.09448"
       width="1052.3622">
      <g
         transform="translate(-260.34243,119.38646)"
         id="layer1">
        <path
           id="rect3225"
           d="m 512.98384,72.49496 c -6.92153,0 -12.39338,5.61269 -12.39338,12.534221 V 414.72145 c 0,6.92155 5.47186,12.39339 12.39338,12.39339 h 548.82986 c 6.9216,0 12.5343,-5.47189 12.5343,-12.39339 V 85.029181 c 0,-6.921531 -5.6128,-12.534217 -12.5343,-12.534221 z"
           style="fill:#c8c8c8;fill-opacity:1;fill-rule:evenodd;stroke:#000000;stroke-width:4.50669;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1" />
        <rect
           style="fill:#c8c8c8;fill-opacity:1;fill-rule:evenodd;stroke:none"
           id="rect3318"
           width="516.87793"
           height="308.63678"
           x="528.98767"
           y="100.84618"
           rx="12.493737"
           ry="12.076607" />
        <path
           class="button light"
           id="b6"
           state-active={ buttons[6].pressed }
           transform={ "translate(0,"+ buttons[6].value * 25 +")" }
           style="fill-opacity:1;fill-rule:evenodd;stroke:#000000;stroke-width:4.50669;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1"
           d="m 387.19299,32.631145 h 149.39679 l -11.70819,-19.25004 c -7.67633,-12.6210653 -27.6314,-21.9876269 -62.99018,-21.9876269 -35.35883,0 -55.3139,9.3665616 -62.99023,21.9876269 z" />
        <path
           class="button light"
           id="b4"
           state-active={ buttons[4].pressed }
           style="fill-opacity:1;fill-rule:evenodd;stroke:#000000;stroke-width:4.50669;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1"
           d="M 387.19295,65.012227 H 536.58973 L 524.88154,45.762187 C 517.20521,33.141122 497.25019,23.77456 461.89136,23.77456 c -35.35883,0 -55.31389,9.366562 -62.99022,21.987627 z" />
        <circle
           r="37.64706"
           cy="528.9635"
           cx="303.79086"
           transform="matrix(4.537983,0,0,4.537983,-914.37504,-2164.1721)"
           id="path2416"
           style="fill:#c8c8c8;fill-opacity:1;fill-rule:evenodd;stroke:#000000;stroke-width:0.993103;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1" />
        <circle
           r="37.64706"
           cy="528.9635"
           cx="303.79086"
           style="fill:#c8c8c8;fill-opacity:1;fill-rule:evenodd;stroke:#000000;stroke-width:1.56522;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1"
           id="j0"
           transform="matrix(2.8792723,0,0,2.8792723,-246.70146,-1140.6458)" />
        <circle
           class="button dark"
           r="37.64706"
           cy={528.9635 + axes[1] * 30}
           cx={303.79086 + axes[0] * 30}
           transform="matrix(1.9403795,0,0,1.9403795,38.525636,-644.0057)"
           id="b10"
           state-active={ buttons[10].pressed }
           style="fill-rule:evenodd;stroke:#000000;stroke-width:2.32258;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1" />
        <path
           class="button light"
           id="b7"
           state-active={ buttons[7].pressed }
           transform={ "translate(0,"+ buttons[7].value * 25 +")" }
           style="fill-opacity:1;fill-rule:evenodd;stroke:#000000;stroke-width:4.50669;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1"
           d="m 1039.57,32.631145 h 149.3967 l -11.7082,-19.25004 c -7.6763,-12.6210653 -27.6313,-21.9876269 -62.9901,-21.9876269 -35.3589,0 -55.3139,9.3665616 -62.9903,21.9876269 z" />
        <path
           class="button light"
           id="b5"
           state-active={ buttons[5].pressed }
           style="fill-opacity:1;fill-rule:evenodd;stroke:#000000;stroke-width:4.50669;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1"
           d="m 1039.5699,65.012227 h 149.3968 l -11.7082,-19.25004 c -7.6763,-12.621065 -27.6313,-21.987627 -62.9902,-21.987627 -35.3588,0 -55.3139,9.366562 -62.9902,21.987627 z" />
        <circle
           r="37.64706"
           cy="528.9635"
           cx="303.79086"
           style="fill:#c8c8c8;fill-opacity:1;fill-rule:evenodd;stroke:#000000;stroke-width:0.993103;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1"
           id="path3221"
           transform="matrix(-4.537983,0,0,4.537983,2489.1255,-2164.1721)" />
        <path
           style="fill:#404040;fill-opacity:1;fill-rule:evenodd;stroke:none"
           d="m 1075.46,109.99762 c -6.9215,0 -12.5342,5.61263 -12.5342,12.53422 v 66.05112 h -66.19195 c -6.92155,0 -12.39343,5.61263 -12.39339,12.53423 v 70.27614 c 0,6.92154 5.47193,12.53417 12.39339,12.53422 h 66.19195 v 66.05112 c 0,6.92155 5.6126,12.53413 12.5342,12.53422 h 70.2762 c 6.9215,0 12.3933,-5.61276 12.3934,-12.53422 v -66.05112 h 66.1919 c 6.9216,0 12.3934,-5.61272 12.3934,-12.53422 v -70.27614 c 0,-6.92155 -5.4718,-12.53423 -12.3934,-12.53423 h -66.1919 v -66.05112 c 0,-6.92155 -5.4719,-12.53422 -12.3934,-12.53422 z"
           id="path3219" />
        <rect
           class="button dark"
           ry="7.0693121"
           rx="7.0693121"
           y="241.14032"
           x="685.43219"
           height="30.044577"
           width="52.430733"
           id="b8"
           state-active={ buttons[8].pressed }
           style="fill-opacity:1;fill-rule:evenodd;stroke:#000000;stroke-width:4.50669;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1" />
        <circle
           class="button dark"
           r="5.7516341"
           cy="545.82623"
           cx="374.24835"
           transform="matrix(6.2172,0,0,6.2172,-1542.9764,-3223.4548)"
           id="b16"
           state-active={ buttons[16].pressed }
           style="fill-opacity:1;fill-rule:evenodd;stroke:#000000;stroke-width:1;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1" />
        <circle
           class="button light"
           r="8.2352943"
           cy="510.66284"
           cx="453.33334"
           transform="matrix(4.5066863,0,0,4.5066863,-932.50349,-2144.6719)"
           id="b3"
           state-active={ buttons[3].pressed }
           style="fill-opacity:1;fill-rule:evenodd;stroke:#454545;stroke-width:1;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1" />
        <circle
           class="button light"
           r="8.2352943"
           cy="510.66284"
           cx="453.33334"
           style="fill-opacity:1;fill-rule:evenodd;stroke:#454545;stroke-width:1;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1"
           id="b0"
           state-active={ buttons[0].pressed }
           transform="matrix(4.5066863,0,0,4.5066863,-932.50349,-1985.0233)" />
        <circle
           class="button light"
           r="8.2352943"
           cy="510.66284"
           cx="453.33334"
           style="fill-opacity:1;fill-rule:evenodd;stroke:#454545;stroke-width:1;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1"
           id="b1"
           state-active={ buttons[1].pressed }
           transform="matrix(-4.5066863,0,0,-4.5066863,3233.3832,2537.9468)" />
        <circle
           class="button light"
           r="8.2352943"
           cy="510.66284"
           cx="453.33334"
           transform="matrix(-4.5066863,0,0,-4.5066863,3073.7346,2537.9468)"
           id="b2"
           state-active={ buttons[2].pressed }
           style="fill-opacity:1;fill-rule:evenodd;stroke:#454545;stroke-width:1;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1" />
        <path
           id="rect3214"
           d="m 428.34859,107.82441 c -6.92155,0 -12.53422,5.61263 -12.53422,12.53422 v 66.05112 h -66.19195 c -6.92155,0 -12.39344,5.61263 -12.39339,12.53422 v 70.27614 c 0,6.92155 5.47193,12.53418 12.39339,12.53422 h 66.19195 v 66.05112 c 0,6.92155 5.61263,12.53413 12.53422,12.53422 h 70.27614 c 6.92155,0 12.39334,-5.61276 12.39339,-12.53422 v -66.05112 h 66.19195 c 6.92155,0 12.39339,-5.61271 12.39339,-12.53422 v -70.27614 c 0,-6.92155 -5.47179,-12.53422 -12.39339,-12.53422 h -66.19195 v -66.05112 c 0,-6.92155 -5.47188,-12.53422 -12.39339,-12.53422 z"
           style="fill:#404040;fill-opacity:1;fill-rule:evenodd;stroke:none" />
        <circle
           class="stick"
           r="37.64706"
           cy="528.9635"
           cx="303.79086"
           transform="matrix(2.8792723,0,0,2.8792723,69.06114,-1140.6458)"
           id="j1"
           style="fill:#c8c8c8;fill-opacity:1;fill-rule:evenodd;stroke:#000000;stroke-width:1.56522;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1" />
        <circle
           class="button dark"
           r="37.64706"
           cy={528.9635 + axes[3] * 30}
           cx={303.79086 + axes[2] * 30}
           style="fill-rule:evenodd;stroke:#000000;stroke-width:2.32258;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1"
           id="b11"
           state-active={ buttons[11].pressed }
           transform="matrix(1.9403795,0,0,1.9403795,354.28823,-644.0057)" />
        <path
           class="button light"
           style="fill-opacity:1;fill-rule:evenodd;stroke:none"
           id="b12"
           state-active={ buttons[12].pressed }
           transform="matrix(0,-1.278706,-2.3317992,0,1662.9252,479.1243)"
           d="m 279.9716,514.41351 -12.66533,7.31233 v -14.62466 z" />
        <path
           class="button light"
           transform="matrix(0,1.278706,-2.3317992,0,1662.9252,-10.960216)"
           id="b13"
           state-active={ buttons[13].pressed }
           style="fill-opacity:1;fill-rule:evenodd;stroke:none"
           d="m 279.9716,514.41351 -12.66533,7.31233 v -14.62466 z" />
        <path
           class="button light"
           transform="matrix(1.278706,0,0,-2.3317992,218.37397,1433.591)"
           id="b15"
           state-active={ buttons[15].pressed }
           style="fill-opacity:1;fill-rule:evenodd;stroke:none"
           d="m 279.9716,514.41351 -12.66533,7.31233 v -14.62466 z" />
        <path
           class="button light"
           style="fill-opacity:1;fill-rule:evenodd;stroke:none"
           id="b14"
           state-active={ buttons[14].pressed }
           transform="matrix(-1.278706,0,0,-2.3317992,708.45853,1433.591)"
           d="m 279.9716,514.41351 -12.66533,7.31233 v -14.62466 z" />
        <rect
           class="button dark"
           ry="7.0693121"
           rx="7.0693121"
           y="241.14032"
           x="829.04095"
           height="30.044577"
           width="52.430733"
           id="b9"
           state-active={ buttons[9].pressed }
           style="fill-opacity:1;fill-rule:evenodd;stroke:#000000;stroke-width:4.50669;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1" />
      </g>
    </svg>;
  }

  componentDidMount() {
    this.poll = () => {
       this.componentUpdate();
       requestAnimationFrame(this.poll);
    };
    requestAnimationFrame(this.poll);
  }

/*
  paintStick(el,context,dx, dy) {

      const [x,y,w,h] = el.state.box("xywh","inner",this);

      context.beginPath();
      context.arc(x, y, 20, 0, 2 * Math.PI, false);
      context.fillStyle = 'red';
      context.fill();
      //context.lineWidth = 5;
      //context.strokeStyle = '#003300';
      //context.stroke();

   }

   paintForeground(gfx) {
      //console.log(this.stick0);
      this.paintStick(this.stick0,gfx,0, 0);
   }
*/


}