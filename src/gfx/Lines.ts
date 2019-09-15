import * as THREE from 'three';

class Lines {
    width:number;
    height:number;
    steps:number;
    max:Array<number>;
    ctx:CanvasRenderingContext2D;
    pixeldata:Float64Array;
    roundedpixeldata:Uint8ClampedArray;
    img:ImageData;

    constructor(canvas:HTMLCanvasElement) {
        this.max=[0,0,0,0];
        this.steps=40;
        this.width=canvas.width;
        this.height=canvas.height;
        this.ctx=<CanvasRenderingContext2D>canvas.getContext('2d');
        this.img = this.ctx.getImageData(0,0,this.width,this.height);
        this.roundedpixeldata=this.img.data;
        this.pixeldata=new Float64Array(this.roundedpixeldata.length);

    }

    commitImage(){        
        for (var t=0;t<this.pixeldata.length;t++){
            this.roundedpixeldata[t]=Math.floor((this.pixeldata[t]));
        }
        this.ctx.putImageData(this.img,0,0);
    }

    drawCurve() {

    }


}

export {Lines}