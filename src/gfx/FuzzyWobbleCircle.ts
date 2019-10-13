import * as THREE from "three";
import { LinesState } from "../components/LinesCanvas";
import { FuzzyWobble } from "./FuzzyWobble";

class FuzzyWobbleCircle extends FuzzyWobble {
  private radius: number;
  constructor(length: number, state: LinesState, radius: number) {
    super(length, state);
    this.radius = radius;

    this.anchors = this.basepoints();
  }

  /**
   * creates a initial set of anchor points spanning across the width of the canvas.
   * slight wiggle in both y location (tapering off to either end) and the degree
   * of color spread in each point (z)
   *
   * @param {number} amplitude amplitude of maximum spread of color in a singular point
   */
  basepoints = () => {
    let points = Array<THREE.Vector3>();
    let t = -this.length / 2;
    let l = Math.PI * this.radius;
    let stepsize = l / this.state.anchorpoints;
    for (let pos = t; pos < l; pos += stepsize) {
      let y =
        (Math.random() - 0.5) * this.state.initialAmplitude +
        Math.sin(pos / this.radius) * this.radius;
      //tapering off to either side
      //Math.sin((pos + this.length / 2) * (Math.PI / this.length));
      let x =
        (Math.random() - 0.5) * this.state.initialAmplitude +
        Math.cos(pos / this.radius) * this.radius;

      let z = (Math.random() - 0.5) * this.state.colorspread;
      //tapering off to either side
      //Math.sin((pos + this.length / 2) * (Math.PI / this.length));
      points = [...points, new THREE.Vector3(x, y, z)];
    }
    return points;
  };
}

export { FuzzyWobbleCircle };
