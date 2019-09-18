import * as THREE from "three";
import { FuzzyWobbleLine } from "./FuzzyWobbleLine";

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
    }
  };

  public addPixel = (x: number, y: number, color: Array<number>) => {
    let p = this.transform(x, y);
    x = Math.floor(p.x);
    y = Math.floor(p.y);
    let offset = (y * this.width + x) * 4;
    for (var i = 0; i < 3; i++) {
      this.pixeldata[offset + i] = color[i] + this.pixeldata[offset + i]

      if (this.pixeldata[offset + i] > this.max[i]) {
        this.max[i] = this.pixeldata[offset + i];
      }
    }
    this.pixeldata[offset + 3] = 0.0;
    this.max[3] = 1.0;
  };

  commitImage = () => {
    let counter = 0;

    for (var t = 0; t < this.pixeldata.length; t++) {
      let newc = Math.floor(
        //255*(1.0 - (this.pixeldata[t]  / this.max[t % 4]))
        (1.0 - this.pixeldata[t])*255
      );
      this.roundedpixeldata[t] = newc;
    }
    this.ctx.putImageData(this.img, 0, 0);
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
    console.log({"max":this.max})
    this.commitImage();
  };

  drawCurveMurder = () => {
    let fwl = new FuzzyWobbleLine(this.width,this.height,this.steps)

    for (var i = 0; i < 50; i++) {
      this.drawSpreadCurve(fwl);
      fwl.next()
    }
  };

  drawSpreadCurve = (fwl: FuzzyWobbleLine) => {
    let curve = new THREE.SplineCurve(fwl.getPoints());
    let fuzzy = new THREE.SplineCurve(fwl.getFuzzyness())

    let rendered_points = curve.getPoints(this.width * 5);
    let fuzzy_width=fuzzy.getPoints(this.width*5);

    for (var i = 1; i < rendered_points.length; i++) {
      //get normalized direction of line at this point
      var dir = rendered_points[i]
        .clone()
        .sub(rendered_points[i - 1])
        .normalize();
      //get right angle
      dir.set(-dir.y, dir.x);
      this.spreadGrainsLine(rendered_points[i], dir, fuzzy_width[i].y);
    }
  };
}

export { Lines };
