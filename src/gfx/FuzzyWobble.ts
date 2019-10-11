import * as THREE from "three";
import { LinesState } from "../components/LinesCanvas";

class FuzzyWobble {
  protected anchors: Array<THREE.Vector3>;
  protected length: number;
  protected state: LinesState;

  constructor(length: number, state: LinesState) {
    this.length = length;
    this.state = state;
    this.anchors = this.basepoints();
  }

  /**
   * returns the set of anchorpoints for this curve
   */
  getAnchors = () => {
    return this.anchors;
  };

  myspread = (pos: number, radius: number) => {
    return Math.round(
      (Math.random() - 0.5) *
        radius *
        Math.sin((pos + this.length / 2) * (Math.PI / this.length)) ** 2
    );
  };

  next = () => {
    for (var step = 0; step < this.anchors.length; step++) {
      let p = this.anchors[step];
      let pos =
        step * (this.length / this.state.anchorpoints) - this.length / 2;
      p.y += this.myspread(pos, this.state.jitterY);
      p.z += this.myspread(pos, this.state.colorspread);
      p.x += this.myspread(pos, this.state.jitterX);
    }
    this.anchors.forEach(p => {});
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

    return points;
  };
}

export { FuzzyWobble };
