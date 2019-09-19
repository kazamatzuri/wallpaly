import React, {createRef, Component } from "react";
import {Lines} from "../gfx/Lines";
import PropTypes from 'prop-types';

export class LinesCanvas extends Component {
    private canvas=createRef<HTMLCanvasElement>();
    private lines?:Lines;
    private width:number;
    private height:number;
    private seed:number;

    static propTypes = {
        width: PropTypes.number.isRequired,
        height:PropTypes.number.isRequired,
        seed:PropTypes.number
    }

    constructor(props:any){
        super(props);
        this.width=props.width;
        this.height=props.height;
        if (props.seed){
          this.seed=props.seed;
        } else {
          this.seed=Math.floor(Math.random()*1000000);
        }
    }

    
    componentDidMount() {
        if (this.canvas.current){
            this.canvas.current.height=this.height;
            this.canvas.current.width=this.width;
            this.lines = new Lines(this.canvas.current,this.seed);
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
