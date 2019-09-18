import * as THREE from "three";

class FuzzyWobbleLine {
  private anchors: Array<THREE.Vector3>;
  private width: number;
  private steps: number;

  constructor(width: number, anchors: number) {
    this.width = width;
    this.steps = anchors;
    this.anchors = this.basepoints();
  }

  /**
   * returns the set of anchorpoints for this curve
   */
  getAnchors = () => {
    return this.anchors;
  };

  next = () => {
    this.anchors.forEach(p => {
      p.y += Math.round(
        (Math.random() - 0.5) *
          25 *
          Math.sin((p.x + this.width / 2) * (Math.PI / this.width)) ** 2
      );
      p.z += Math.round(
        (Math.random() - 0.5) *
          10 *
          Math.sin((p.x + this.width / 2) * (Math.PI / this.width)) ** 2
      );
      p.x += Math.round(
        (Math.random() - 0.5) *
          5 *
          Math.sin((p.x + this.width / 2) * (Math.PI / this.width)) ** 2
      );
    });
  };

  /**
   * creates a initial set of anchor points spanning across the width of the canvas.
   * slight wiggle in both y location (tapering off to either end) and the degree
   * of color spread in each point (z) 
   *
   * @param {number} amplitude amplitude of maximum spread of color in a singular point
   */
  basepoints = (amplitude: number = 30) => {
    
    let points = Array<THREE.Vector3>();
    let t = -this.width / 2;

    let stepsize = this.width / this.steps;
    for (let x = t; x < this.width / 2; x += stepsize) {
      let y =
        (Math.random() - 0.5) *
        15 *
        //tapering off to either side
        Math.sin((x + this.width / 2) * (Math.PI / this.width));
      let z =        
        (Math.random() - 0.5) *
        amplitude *
        //tapering off to either side
        Math.sin((x + this.width / 2) * (Math.PI / this.width));
      points.push(new THREE.Vector3(x, y, z));
    }
    return points;
  };
}

export { FuzzyWobbleLine };