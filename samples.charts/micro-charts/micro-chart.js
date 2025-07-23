class Chart extends Element {
   data = null;
   min;
   max;

   this(props) {
      this.data = props.data ?? this.data; 
      this.min = props.min;
      this.max = props.max;
   }

   render() {
      return <img.chart />;
   }

   get value() { return this.data; }
   set value(v) { this.data = v; this.reset(); this.requestPaint(); }

   reset() {}
}

/**
       * Catmull-Rom interpolation function
       * @param {number} p0 - Previous point
       * @param {number} p1 - Current point
       * @param {number} p2 - Next point
       * @param {number} p3 - Point after next
       * @param {number} t - Interpolation factor
       * @returns {number} Interpolated value
       */
function catmullRom(p0, p1, p2, p3, t) => {
  const t2 = t * t;
  const t3 = t2 * t;
  return (
    0.5 *
    (2 * p1 +
      (-p0 + p2) * t +
      (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
      (-p0 + 3 * p1 - 3 * p2 + p3) * t3)
  );
};


class OneLine {
   fillPath = null;
   strokePath = null;
   strokeWidth; // pixels
   fill; // Color
   stroke; // Color

   constructor(vals,stroke,fill,min,max,width,height,strokeWidth) {

      max = max ?? Math.max(...vals);
      min = min ?? Math.min(...vals);

      let diff = max - min;

      const xScale = input => { return input * (width / (vals.length - 1)); };
      const yScale = input => {
        var y = height;
        if (diff) y -= ((input - min) / diff) * height;
        return y + strokeWidth / 2
      };

      let zero = yScale(Math.max(min, 0));

      let strokePath;
      let fillPath;

      if(fill) { 
        fillPath = new Graphics.Path();
        fillPath.moveTo(0, zero);
      }

      if(stroke) { 
        strokePath = new Graphics.Path();
      }

      let x = xScale(0);
      let y = yScale(vals[0]);

      if(strokePath) { strokePath.moveTo(x,y) };
      if(fillPath) fillPath.moveTo(x,y);

      const length1 = vals.length - 1;

      for (let i = 0; i < length1; ++i) {

        const p0 = vals[i - 1] ?? vals[i]; // Previous point
        const p1 = vals[i]; // Current point
        const p2 = vals[i + 1] ?? vals[i]; // Next point
        const p3 = vals[i + 2] ?? p2; // Point after next

        for (let t = 0; t <= 1; t += 0.1) {
          // Divide into small steps for smoothness
          x = xScale(i + t);
          y = yScale(catmullRom(p0, p1, p2, p3, t));
          //if(strokePath) { i ? strokePath.lineTo(x,y) : strokePath.moveTo(x,y) };
          if(strokePath) { strokePath.lineTo(x,y) };
          if(fillPath) fillPath.lineTo(x,y);
        }
      }

      if(fillPath) { 
        fillPath.lineTo(width, zero);
        fillPath.close();
      }

      this.fillPath = fillPath; 
      this.strokePath = strokePath;
      this.fill = fill;
      this.stroke = stroke;
      this.strokeWidth = strokeWidth;
    }

    paint(gfx) {
      if(this.fillPath) { 
        gfx.fillStyle = this.fill;
        gfx.draw(this.fillPath, {x:0,y:0, fill:"nonzero"});
      }
      if(this.strokePath) 
      {
        gfx.strokeStyle = this.stroke;
        gfx.strokeWidth = this.strokeWidth;
        gfx.draw(this.strokePath, {x:0,y:0, stroke:true});
      }
    }

}

export class Line extends Chart {

   line = null;

   strokeWidth = 3;
   fill; // Color
   stroke; // Color

   this(props) {
      super.this(props);
      if(props.fill || props.color) {
        this.fill = props.fill;
        this.stroke = props.color;
      } else 
        this.stroke = props.color ?? Color.rgb(1,0,0);
      this.strokeWidth = props.thickness ?? 2;
   }

   paintContent(gfx) {
      const line = this.producePaths(this.data); 
      gfx.pushLayer("content-box");
      gfx.lineJoin = "miter";
      line.paint(gfx);
      gfx.popLayer();
   }

   reset() {
     this.line = null;
   }

   producePaths(vals) {
      if(!this.line) {
         let [width,height] = this.state.box("dimension","inner");
         this.line = new OneLine(vals,this.stroke,this.fill,this.min,this.max,width,height,this.strokeWidth);
      }
      return this.line;
   }
}

// data is an array of structures:
// { 
//     values:[...],
//     color:Color, // optional
//     fill:Color, // optional
//     thickness:pixels, // optional
//     min:value, // optional
//     max:value, // optional
// }

export class Lines extends Chart {

   lines = [];

   strokeWidth = 2;

   this(props) {
      super.this(props);
      this.strokeWidth = props.thickness ?? 2;
   }

   paintContent(gfx) {
      const lines = this.producePaths(this.data); 
      gfx.pushLayer("content-box");
      gfx.lineJoin = "miter";
      for(const line of lines)
        line.paint(gfx);
      gfx.popLayer();
   }

   reset() {
     this.lines = [];
   }

   producePaths(vals) {
      if(this.lines.length == 0) {
         let [width,height] = this.state.box("dimension","inner");
         for(let def of this.data)
           this.lines.push(new OneLine(def.values,def.color,def.fill,def.min,def.max,width,height,def.thickness ?? this.strokeWidth));
      }
      return this.lines;
   }
}

const radians360 = Math.PI * 2;
const radians90 = Math.PI / 2;

export class Pie extends Chart {

  _paths = null;
  _colors = null;

  this(props) {
    super.this(props);
    this._colors = props.colors; 
  }

  get isSingleValue() // true if this.data is a single value - not an array  
  {
    return !Array.isArray(this.data);
  }

  get values() {
    if(this.isSingleValue) {
      let max = this.max ?? 1.0;
      return [this.data, max - this.data];
    } else 
      return this.data;
  }
  get colors() {
    return Array.isArray(this._colors)
      ? this._colors
      : ["#B80000",/*"#DB3E00",*/"#FCCB00","#008B02","#006B76","#1273DE","#004DCF","#5300EB"];
  }

  get sectors() { // returns sector angles
    const vals = this.values;
    let sum = 0;  for (const val of vals) sum += val;
    let angles = [];
    for (const value of vals) {
      let angle = value / sum * radians360;
      angles.push(angle);
    }
    return angles;
  }

  get paths() { 

    if(this._paths) return this._paths;

    const sectors = this.sectors;
    const colors = this.colors;
    const paths = [];    
    let start = -radians90;

    let [width,height] = this.state.box("dimension","inner");
    let cx = width / 2, cy = height / 2;
    let radius = Math.min(cx, cy);

    for (const angle of sectors) {
      const end = start + angle;
      const path = new Graphics.Path();
      path.moveTo(cx, cy);
      if(start < end) path.arc(cx, cy, radius, start, end);
      path.close();
      path.color = Color(colors[paths.length % colors.length]);
      paths.push(path);
      start = end;
    }
    return this._paths = paths; 
  }

  paintContent(gfx) {
    
    gfx.pushLayer("content-box");
    for(const path of this.paths) {
      gfx.fillStyle = path.color;
      gfx.draw(path, {x:0,y:0, fill:"nonzero"});
    }
    gfx.popLayer();
  }

  reset() {
    this._paths = null;
  }

}

export class Donut extends Pie {
  thickness = 0.4;

  this(props) {
    super.this(props);
    this.thickness = props.thickness ?? 0.4; 
  }

  get paths() { 

    if(this._paths) return this._paths;

    const sectors = this.sectors;
    const colors = this.colors;
    const paths = [];    
    let start = -radians90;

    let [width,height] = this.state.box("dimension","inner");
    let cx = width / 2, cy = height / 2;

    let radius = Math.min(cx, cy);
    let innerRadius = radius - this.thickness * radius;

    for (const angle of sectors) {
      const end = start + angle;
      const path = new Graphics.Path();
      if(start < end) {
        path.arc(cx, cy, radius, start, end);
        path.arc(cx, cy, innerRadius, end, start, true);
      }
      path.color = Color(colors[paths.length % colors.length]);
      paths.push(path);
      start = end;
    }
    return this._paths = paths; 
  }

  paintContent(gfx) {
    const paths = this.paths;
    for(const path of paths) {
      gfx.fillStyle = path.color;
      gfx.draw(path, {x:0,y:0, fill:"nonzero"});
    }
  }
}

export class Bars extends Chart {

  _paths = null;
  _colors = null;

  thickness = 1;

  this(props) {
    super.this(props);
    this._colors = props.colors; 
    this.thickness = Math.min(props.thickness ?? 1, 1.0);
  }

  get colors() {
    return Array.isArray(this._colors) ? this._colors : ["#B80000"];
  }  

  get paths() {

    if(this._paths) return this._paths;

    const vals = this.data;
    const max = this.max ?? Math.max(...vals);
    const min = this.min ?? Math.min(...vals);

    const colors = this.colors;
    const paths = [];    

    const [width,height] = this.state.box("dimension","inner");

    const diff = max - min;

    //function xScale(input) { return input * width / vals.length };
    function yScale(input) { return height - ( diff ? ((input - min) / diff) * height: 1 ) };

    let w = width / vals.length * this.thickness;
    let spacing = (width - w * vals.length) / (Math.max(vals.length,1) - 1);

    let x = 0;

    for (let val of vals) 
    {
      let valY = yScale(val);
      let y1 = valY, y2 = valY, h;

      if (val < 0) y1 = yScale(Math.min(max, 0.0));
              else y2 = yScale(Math.max(min, 0.0));

      h = y2 - y1;
      if (h == 0) { h = 1; if (max > 0 && diff) --y1; }

      const path = new Graphics.Path();
      path.rect(x, y1, w, h);
      path.color = Color(colors[paths.length % colors.length]);

      paths.push(path);
      x += w + spacing;
    }

    return this._paths = paths;     
  }

  paintContent(gfx) {
    gfx.pushLayer("content-box");
    for(const path of this.paths) {
      gfx.fillStyle = path.color;
      gfx.draw(path, {x:0,y:0, fill:"nonzero"});
    }
    gfx.popLayer();
  }

  reset() {
    this._paths = null;
  }

}
