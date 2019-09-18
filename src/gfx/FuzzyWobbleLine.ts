import * as THREE from "three";

class FuzzyWobbleLine {
  private points: Array<THREE.Vector2>;
  private fuzzyness: Array<THREE.Vector2>;
  private width: number;
  private height: number;
  private steps:number;

  constructor(width: number, height: number,anchors:number) {
    this.width = width;
    this.height = height;
    this.steps=anchors;
    this.points = this.basepoints();
    this.fuzzyness = this.basepoints();
  }
  
  getPoints = () => {
    return this.points
  }

  getFuzzyness = () => {
    return this.fuzzyness
  }

  next= ()=>{
    this.points.forEach(p => {
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
    this.fuzzyness.forEach(p => {
      p.y += Math.round(
        (Math.random() - 0.5) *
          15 *
          Math.cos(p.x * (Math.PI / this.width)) ** 2
      );
    });
  }

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
}

export { FuzzyWobbleLine };
