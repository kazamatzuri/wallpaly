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
    console.log("new lines class");
    console.log(canvas);
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
    this.pixeldata[offset++] = color[0];
    if (this.pixeldata[offset - 1] > this.max[0]) {
      this.max[0] = this.pixeldata[offset - 1];
    }
    this.pixeldata[offset++] = color[1];
    if (this.pixeldata[offset - 1] > this.max[1]) {
      this.max[1] = this.pixeldata[offset - 1];
    }
    this.pixeldata[offset++] = color[2];
    if (this.pixeldata[offset - 1] > this.max[2]) {
      this.max[2] = this.pixeldata[offset - 1];
    }
    this.pixeldata[offset++] = color[3];
    if (this.pixeldata[offset - 1] > this.max[3]) {
      this.max[3] = this.pixeldata[offset - 1];
    }
  };

  commitImage() {
    let s = 0;
    for (var t = 0; t < this.pixeldata.length; t++) {
      this.roundedpixeldata[t] = Math.floor(this.pixeldata[t] * 255);
      s += this.pixeldata[t];
    }
    console.log(s);

    this.ctx.putImageData(this.img, 0, 0);
  }

  basepoints(amplitude: number = 30): Array<THREE.Vector2> {
    let points = Array<THREE.Vector2>();
    for (let t = 0.0; t < this.steps; t++) {
      let x = (this.width / this.steps) * t-this.width/2;
      let y = Math.sin(x / 40) * amplitude;
      points.push(new THREE.Vector2(x, y));
    }
    return points;
  }

  public redraw = () => {
    let points = this.basepoints();
    this.drawCurve(points);
    this.commitImage();
  };

  drawCurve = (points: Array<THREE.Vector2>) => {
    let curve = new THREE.SplineCurve(points);
    let rendered_points = curve.getPoints(this.width * 10);
    rendered_points.forEach((pix: THREE.Vector2) => {
      this.setPixel(pix.x, pix.y, [1.0, 0.0, 1.0, 1.0]);
    });
  };
}

export { Lines };
