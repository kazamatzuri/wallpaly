import * as THREE from "three";
import { LinesState } from "../components/LinesCanvas";

class FuzzyWobbleLine {
  private anchors: Array<THREE.Vector3>;
  private width: number;
  private state:LinesState;

  constructor(width: number, state: LinesState) {
    this.width = width;
    this.state = state;
    this.anchors = this.basepoints();
  }

  /**
   * returns the set of anchorpoints for this curve
   */
  getAnchors = () => {
    return this.anchors;
  };

  myspread = (x: number, radius: number, width: number) => {
    return Math.round(
      (Math.random() - 0.5) *
        radius *
        Math.sin((x + width / 2) * (Math.PI / width)) ** 2
    );
  };

  next = () => {
    this.anchors.forEach(p => {
      p.y += this.myspread(p.x, this.state.jitterY, this.width);
      p.z += this.myspread(p.x, this.state.colorspread, this.width);
      p.x += this.myspread(p.x, this.state.jitterX, this.width);
    });
  };

  /**
   * creates a initial set of anchor points spanning across the width of the canvas.
   * slight wiggle in both y location (tapering off to either end) and the degree
   * of color spread in each point (z)
   *
   * @param {number} amplitude amplitude of maximum spread of color in a singular point
   */
  basepoints = () => {
    let points = Array<THREE.Vector3>();
    let t = -this.width / 2;

    let stepsize = this.width / this.state.anchorpoints;
    for (let x = t; x < this.width / 2; x += stepsize) {
      let y =
        (Math.random() - 0.5) *
        this.state.initialAmplitude *
        //tapering off to either side
        Math.sin((x + this.width / 2) * (Math.PI / this.width));
      let z =
        (Math.random() - 0.5) *
        this.state.colorspread *
        //tapering off to either side
        Math.sin((x + this.width / 2) * (Math.PI / this.width));
      points= [...points,(new THREE.Vector3(x, y, z))];
    }
    return points;
  };
}

export { FuzzyWobbleLine };
