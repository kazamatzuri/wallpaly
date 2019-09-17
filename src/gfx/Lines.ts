import * as THREE from "three";

class Lines {
  width: number;
  height: number;
  steps: number;
  max: Array<number>;
  ctx: CanvasRenderingContext2D;
  pixeldata: Float64Array;
  roundedpixeldata: Uint8ClampedArray;
  img: ImageData;

  constructor(canvas: HTMLCanvasElement) {
    this.max = [0, 0, 0, 0];
    this.steps = 40;
    this.width = canvas.width;
    this.height = canvas.height;
    this.ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    this.img = this.ctx.getImageData(0, 0, this.width, this.height);
    this.roundedpixeldata = this.img.data;
    this.pixeldata = new Float64Array(this.roundedpixeldata.length);
  }

  public transform = (x: number, y: number) => {
    x += this.width / 2;
    y += this.height / 2;
    return new THREE.Vector2(x, y);
  };

  public setPixel = (x: number, y: number, color: Array<number>) => {
    let p = this.transform(x, y);
    x = Math.floor(p.x);
    y = Math.floor(p.y);
    let offset = (y * this.width + x) * 4;
    for (var i = 0; i < 4; i++) {
      this.pixeldata[offset + i] = color[i];
      
      if (this.pixeldata[offset + i] > this.max[i]) {
        this.max[i] = this.pixeldata[offset + i];
      }
    }
  };

  public addPixel = (x: number, y: number, color: Array<number>) => {
    let p = this.transform(x, y);
    x = Math.floor(p.x);
    y = Math.floor(p.y);
    let offset = (y * this.width + x) * 4;
    for (var i = 0; i < 3; i++) {        
      this.pixeldata[offset + i] = 
        color[i] + this.pixeldata[offset + i]
      ;      
    }
    this.pixeldata[offset + 3] = 0.0;
  };

  commitImage = () => {
      let counter=0;
    
    for (var t = 0; t < this.pixeldata.length; t++) {
        let newc= Math.floor((1.0 - this.pixeldata[t]) *255);
      this.roundedpixeldata[t] = newc;
      if(this.pixeldata[t]!==0){
      counter+=1;
      if (((counter%1000)===0)){
            console.log(this.pixeldata[t])
            console.log(newc);
      }
    }
    
    }
    

    this.ctx.putImageData(this.img, 0, 0);
  };

  basepoints = (amplitude: number = 30) => {
    let points = Array<THREE.Vector2>();
    for (let t = 0.0; t < this.steps; t++) {
      let x = (this.width / this.steps) * t - this.width / 2;

      let f = Math.cos(x * (Math.PI / this.width)) ** 2;
      let y = Math.sin(x / 40) * amplitude * f;
      points.push(new THREE.Vector2(x, y));
    }
    return points;
  };

  getRandomInt = (max: number) => {
    return Math.floor(Math.random() * Math.floor(max));
  };

  spreadGrainsLine = (
    center: THREE.Vector2,
    dir: THREE.Vector2,
    length: number
  ) => {
    var grains = this.getRandomInt(30) + 5;
    let newc = 0.1 / grains;

    for (var i = 0; i < grains; i++) {
      let tp = center.clone();
      let t = Math.random() - 0.5;
      tp.addScaledVector(dir, t * length);
      let basecolor = [newc, newc, newc, 0.0];
      this.addPixel(tp.x, tp.y, basecolor);
    }
  };

  public redraw = () => {
    this.drawCurveMurder();
    this.commitImage();
  };

  drawCurveMurder = () => {
    let points = this.basepoints();

    for (var i = 0; i < 50; i++) {
      this.drawSpreadCurve(points);
      points.forEach(p => {
        p.x += Math.round(
          (Math.random() - 0.5) *
            5 *
            Math.cos(p.x * (Math.PI / this.width)) ** 2
        );
        p.y += Math.round(
          (Math.random() - 0.5) *
            35 *
            Math.cos(p.x * (Math.PI / this.width)) ** 2
        );
      });
    }
    //this.drawCurve(points);
  };

  drawSpreadCurve = (points: Array<THREE.Vector2>) => {
    let curve = new THREE.SplineCurve(points);
    let rendered_points = curve.getPoints(this.width * 10);
    for (var i = 1; i < rendered_points.length; i++) {
      //get normalized direction of line at this point
      var dir = rendered_points[i]
        .clone()
        .sub(rendered_points[i - 1])
        .normalize();
      //get right angle
      dir.set(-dir.y, dir.x);
      //this.addStrokeLine(rendered_points[i], dir, 100, [1.0, 0, 0, 1.0]);
      this.spreadGrainsLine(rendered_points[i], dir, 40);
    }

    // rendered_points.forEach((pix: THREE.Vector2) => {
    //   this.setPixel(pix.x, pix.y, [1.0, 0.0, 1.0, 1.0]);
    // });
  };
}

export { Lines };
