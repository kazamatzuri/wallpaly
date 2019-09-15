import React, {createRef, Component } from "react";
import {Lines} from "../gfx/Lines";


export class LinesCanvas extends Component {
    private canvas=createRef<HTMLCanvasElement>();
    private lines?:Lines;

    // constructor(props:any){
    //     super(props);
        
    // }

    
    componentDidMount() {
        if (this.canvas.current){
            this.lines = new Lines(this.canvas.current);
            this.lines.redraw();            
        }
    }

  render() {
    return (
      <div>
        <canvas id="test" ref={this.canvas}></canvas>
      </div>
    );
  }
}
