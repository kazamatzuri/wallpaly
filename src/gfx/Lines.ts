import * as THREE from "three";
import { FuzzyWobbleLine } from "./FuzzyWobbleLine";
import seedrandom from "seedrandom";
import { LinesState } from "../components/LinesCanvas";

/**
 * represents our line art class
 */
class Lines {
  width: number;
  height: number;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  pixeldata: Float64Array;
  roundedpixeldata: Uint8ClampedArray;
  img: ImageData;
  state: LinesState;

  constructor(canvas: HTMLCanvasElement, state: LinesState) {
    this.canvas = canvas;
    this.state = state;
    seedrandom(state.seed.toString(), { global: true });

    this.width = canvas.width;
    this.height = canvas.height;
    this.ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    this.img = this.ctx.getImageData(0, 0, this.width, this.height);
    this.roundedpixeldata = this.img.data;
    this.pixeldata = new Float64Array(this.roundedpixeldata.length);
  }

  rng = () => {};
  /**
   * transformation of coordinates so 0,0 is in the middle of the canvas
   */
  public transform = (x: number, y: number) => {
    x += this.width / 2;
    y += this.height / 2;
    return new THREE.Vector2(x, y);
  };

  /**
   * set a pixel color value directly.
   * @param {number} x
   * @param {number} y
   * @param {number} color color array rgba of floats (0.0..1.0)
   */
  public setPixel = (x: number, y: number, color: Array<number>) => {
    let p = this.transform(x, y);
    x = Math.floor(p.x);
    y = Math.floor(p.y);
    let offset = (y * this.width + x) * 4;

    for (var i = 0; i < 4; i++) {
      this.pixeldata[offset + i] = color[i];
    }
  };

  /**
   * sets a pixel color value by adding the values passed in
   * @param {number} x
   * @param {number} y
   * @param {number} color color array rgba of floats (0.0..1.0)
   */
  public addPixel = (x: number, y: number, color: Array<number>) => {
    let p = this.transform(x, y);
    x = Math.floor(p.x);
    y = Math.floor(p.y);
    let offset = (y * this.width + x) * 4;
    for (var i = 0; i < 3; i++) {
      this.pixeldata[offset + i] = color[i] + this.pixeldata[offset + i];
    }
    this.pixeldata[offset + 3] = 0.0;
  };

  /**
   * commits the image data to the actual canvas
   * we're working with an inverted image, since the pixeldata array is initialized
   * with 0.
   */
  commitImage = () => {
    for (var t = 0; t < this.pixeldata.length; t++) {
      let newc = Math.floor(
        //255*(1.0 - (this.pixeldata[t]  / this.max[t % 4]))
        (1 - this.pixeldata[t]) * 255
      );
      this.roundedpixeldata[t] = newc;
    }
    this.ctx.putImageData(this.img, 0, 0);
  };

  /**
   * waddya think?! ;)
   */
  getRandomInt = (max: number) => {
    return Math.floor(Math.random() * Math.floor(max));
  };

  /**
   * spreads random specks of color along the direction dir, up to a distance of
   * length, starting on center
   * @param {THREE.Vector3}  center origin of spread (only x and y are being used)
   * @param {THREE.Vector3} dir direction of spread (only x and y are being used)
   * @param {number} length length of line where specks can possible fall
   *
   */
  spreadGrainsLine = (
    center: THREE.Vector3,
    dir: THREE.Vector3,
    length: number
  ) => {
    var grains = this.getRandomInt(20) + 5;
    let newc = 0.04 / grains;

    for (var i = 0; i < grains; i++) {
      let tp = center.clone();
      let t = Math.random() - 0.5;
      tp.addScaledVector(dir, t * length);
      let basecolor = [
        newc * (this.state.invcolor.r / 255),
        newc * (this.state.invcolor.g / 255),
        newc * (this.state.invcolor.b / 255),
        0.0
      ];
      this.addPixel(tp.x, tp.y, basecolor);
    }
  };

  /**
   * redraws the canvas with current settings
   */
  public redraw = (state: LinesState) => {
    this.state = { ...this.state, ...state };
    this.state = {
      ...this.state,
      invcolor: {
        r: 255 - this.state.color.r,
        g: 255 - this.state.color.g,
        b: 255 - this.state.color.b
      }
    };
    if (this.state.wipeOnRender) {
      this.ctx.clearRect(0, 0, this.width, this.height);
      this.pixeldata = new Float64Array(this.roundedpixeldata.length);
    }
    this.drawCurveMurder();
    this.commitImage();
  };

  /**
   * draws a set of curves with each subsequent one having its anchor
   * points moved around randomly a bit
   *
   */
  drawCurveMurder = () => {
    let fwl = new FuzzyWobbleLine(this.width, this.state);

    for (var i = 0; i < 60; i++) {
      this.drawSpreadCurve(fwl, i);
      fwl.next();
    }
  };

  drawSpreadCurve = (fwl: FuzzyWobbleLine, it: number) => {
    let curve = new THREE.CatmullRomCurve3(fwl.getAnchors());

    //new THREE.SplineCurve(fwl.getPoints());

    let rendered_points = curve.getPoints(this.width * 5);

    for (var i = 1; i < rendered_points.length; i++) {
      //get normalized direction of line at this point
      var dir = rendered_points[i]
        .clone()
        .sub(rendered_points[i - 1])
        .normalize();
      //get right angle
      dir.set(-dir.y, dir.x, dir.z);
      this.spreadGrainsLine(rendered_points[i], dir, rendered_points[i].z);
    }
  };
}

export { Lines };
