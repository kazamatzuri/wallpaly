import * as THREE from "three";
import { LinesState } from "../components/LinesCanvas";
import { FuzzyWobble } from "./FuzzyWobble";

class FuzzyWobbleLine extends FuzzyWobble {
  constructor(length: number, state: LinesState) {
    super(length, state);

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

    let stepsize = this.length / this.state.anchorpoints;
    for (let x = t; x < this.length / 2; x += stepsize) {
      let y =
        (Math.random() - 0.5) *
        this.state.initialAmplitude *
        //tapering off to either side
        Math.sin((x + this.length / 2) * (Math.PI / this.length));
      let z =
        (Math.random() - 0.5) *
        this.state.colorspread *
        //tapering off to either side
        Math.sin((x + this.length / 2) * (Math.PI / this.length));
      points = [...points, new THREE.Vector3(x, y, z)];
    }
    return points;
  };
}

export { FuzzyWobbleLine };
