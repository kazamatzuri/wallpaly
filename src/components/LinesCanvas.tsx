import React, {createRef, Component } from "react";
import {Lines} from "../gfx/Lines";
import PropTypes from 'prop-types';

export class LinesCanvas extends Component {
    private canvas=createRef<HTMLCanvasElement>();
    private lines?:Lines;
    private width:number;
    private height:number;

    static propTypes = {
        width: PropTypes.number.isRequired,
        height:PropTypes.number.isRequired
    }

    constructor(props:any){
        super(props);
        this.width=props.width;
        this.height=props.height;
        
    }

    
    componentDidMount() {
        if (this.canvas.current){
            this.canvas.current.height=this.height;
            this.canvas.current.width=this.width;
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
