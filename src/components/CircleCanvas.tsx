import React, { createRef, Component } from "react";
import * as THREE from "three";
import { FuzzyWobble } from "../gfx/FuzzyWobble";
import { FuzzyWobbleCircle } from "../gfx/FuzzyWobbleCircle";
import seedrandom from "seedrandom";
import { SettingsMenu } from "./SettingsMenu";
import DownloadComp from "./DownloadComp";
import RandomComp from "./RandomComp";
import styled from "@emotion/styled";
import { LinearProgress, Box, Typography } from "@mui/material";

const CanvasWrapper = styled.div`
  flex: 1;
  position: relative;
  overflow: hidden;
  min-height: 0;
`;

const TopRight = styled.div`
  display: flex;
  position: absolute;
  top: 8px;
  right: 16px;
  font-size: 18px;
  z-index: 100;
  gap: 8px;
`;

const ProgressOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.85);
  z-index: 200;
`;

const initialState = {
  version: 1, //0
  lineNumber: 60, //1
  width: 1920, //2
  height: 1080, //3
  seed: 1, //4
  anchorpoints: 29, //5
  jitterX: 5, //6
  jitterY: 11, //7
  colorspread: 5, //8
  initialAmplitude: 30, //9
  wipeOnRender: true, //10
  randomColor: false, //11
  displayColorPicker: false, //12
  color: { r: 0, g: 0, b: 0 }, //13
  invcolor: { r: 255, g: 255, b: 255 }, //14
  rendering: false,
  progress: 0
};

export type CircleState = Readonly<typeof initialState>;

interface CircleCanvasProps {
  seed?: number;
}

export class CircleCanvas extends Component<CircleCanvasProps, CircleState> {
  private canvas = createRef<HTMLCanvasElement>();
  private ctx?: CanvasRenderingContext2D;
  private pixeldata?: Float32Array;
  private roundedpixeldata?: Uint8ClampedArray;
  private img?: ImageData;
  private tempVector = new THREE.Vector3();
  private tempCloneVector = new THREE.Vector3();

  public state: CircleState = initialState;

  constructor(props: CircleCanvasProps) {
    super(props);

    let seed = 0;
    if (props.seed) {
      seed = props.seed;
    } else {
      seed = Math.floor(Math.random() * 1000000);
    }

    this.state = {
      ...initialState,
      width: 1920,
      height: 1080,
      seed: seed
    };
  }

  /**
   * transformation of coordinates so 0,0 is in the middle of the canvas
   */
  transform = (x: number, y: number) => {
    x += this.state.width / 2;
    y += this.state.height / 2;
    return new THREE.Vector2(x, y);
  };

  /**
   * set a pixel color value directly.
   * @param {number} x
   * @param {number} y
   * @param {number} color color array rgba of floats (0.0..1.0)
   */
  setPixel = (x: number, y: number, color: Array<number>) => {
    if (this.pixeldata) {
      let p = this.transform(x, y);
      x = Math.floor(p.x);
      y = Math.floor(p.y);
      let offset = (y * this.state.width + x) * 4;

      for (var i = 0; i < 4; i++) {
        this.pixeldata[offset + i] = color[i];
      }
    }
  };

  /**
   * sets a pixel color value by adding the values passed in
   * @param {number} x
   * @param {number} y
   * @param {number} color color array rgba of floats (0.0..1.0)
   */
  addPixel = (x: number, y: number, color: Array<number>) => {
    if (this.pixeldata) {
      let p = this.transform(x, y);
      x = Math.floor(p.x);
      y = Math.floor(p.y);
      let offset = (y * this.state.width + x) * 4;
      for (var i = 0; i < 3; i++) {
        this.pixeldata[offset + i] = color[i] + this.pixeldata[offset + i];
      }
      this.pixeldata[offset + 3] = 0.0;
    }
  };

  /**
   * commits the image data to the actual canvas
   * we're working with an inverted image, since the pixeldata array is initialized
   * with 0.
   */
  commitImage = () => {
    if (this.pixeldata && this.roundedpixeldata && this.ctx && this.img) {
      for (var t = 0; t < this.pixeldata.length; t++) {
        let newc = Math.floor(
          //255*(1.0 - (this.pixeldata[t]  / this.max[t % 4]))
          (1 - this.pixeldata[t]) * 255
        );
        this.roundedpixeldata[t] = newc;
      }
      this.ctx.putImageData(this.img, 0, 0);
    }
  };

  getImageDataUrl = (): string => {
    if (this.canvas.current) {
      return this.canvas.current.toDataURL('image/png');
    }
    return '';
  };

  /**
   * waddya think?! ;)
   */
  getRandomInt = (max: number) => {
    return Math.floor(Math.random() * Math.floor(max));
  };

  /**
   * spreads random specks of color along the direction dir, up to a distance of
   * length, starting on center
   * @param {THREE.Vector3}  center origin of spread (only x and y are being used)
   * @param {THREE.Vector3} dir direction of spread (only x and y are being used)
   * @param {number} length length of line where specks can possible fall
   *
   */
  spreadGrainsLine = (
    center: THREE.Vector3,
    dir: THREE.Vector3,
    length: number
  ) => {
    var grains = this.getRandomInt(20) + 5;
    let newc = 0.04 / grains;

    // Reuse vectors instead of creating new ones
    this.tempCloneVector.copy(center);
    
    for (var i = 0; i < grains; i++) {
      this.tempVector.copy(center);
      let t = Math.random() - 0.5;
      this.tempVector.addScaledVector(dir, t * length);
      let basecolor = [
        newc * (this.state.invcolor.r / 255),
        newc * (this.state.invcolor.g / 255),
        newc * (this.state.invcolor.b / 255),
        0.0
      ];
      this.addPixel(this.tempVector.x, this.tempVector.y, basecolor);
    }
  };

  onLinesChange = (event: object, value: any) => {
    this.setState({ lineNumber: value });
  };

  setSetting = (newstate: object) => {
    this.setState(newstate);
  };

  setSettingAndRender = (newstate: object) => {
    this.setSetting(newstate);
    this.redraw();
  };

  download = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    /// create an "off-screen" anchor tag
    var lnk = document.createElement("a"),
      e;

    var filename = `wallpaper-${this.state.width}x${this.state.height}.png`;
    /// the key here is to set the download attribute of the a tag
    lnk.download = filename;

    /// convert canvas content to data-uri for link. When download
    /// attribute is set the content pointed to by link will be
    /// pushed as "download" in HTML5 capable browsers
    if (this.canvas.current != null) {
      lnk.href = this.canvas.current.toDataURL("image/png;base64");

      /// create a "fake" click-event to trigger the download
      if (document.createEvent) {
        e = document.createEvent("MouseEvents");
        e.initMouseEvent(
          "click",
          true,
          true,
          window,
          0,
          0,
          0,
          0,
          0,
          false,
          false,
          false,
          false,
          0,
          null
        );

        lnk.dispatchEvent(e);
      }
    }
  };

  componentDidMount = () => {
    // let lochash = window.location.hash;
    // if (lochash !== "") {
    //   let vals = JSON.parse(decodeURI(lochash.replace("#", "")));
    //   if (vals[0] === 1) {
    //     this.setState({
    //       ...this.state,
    //       lineNumber: vals[1],
    //       seed: vals[4],
    //       anchorpoints: vals[5],
    //       jitterX: vals[6],
    //       jitterY: vals[7],
    //       colorspread: vals[8],
    //       initialAmplitude: vals[30],
    //       wipeOnRender: vals[10],
    //       randomColor: vals[11],
    //       color: vals[13]
    //     });
    //   }
    // }
    seedrandom(this.state.seed.toString(), { global: true });

    if (this.canvas.current) {
      let cv = this.canvas.current;
      cv.width = this.state.width;
      cv.height = this.state.height;
      this.ctx = cv.getContext("2d") as CanvasRenderingContext2D;
      this.img = this.ctx.getImageData(
        0,
        0,
        this.state.width,
        this.state.height
      );
      this.roundedpixeldata = this.img.data;
      this.pixeldata = new Float32Array(this.roundedpixeldata.length);
      this.redraw();
    }
  };

  private yieldToUI = (): Promise<void> => {
    return new Promise(resolve => requestAnimationFrame(() => resolve()));
  };

  redraw = async () => {
    this.setState({
      rendering: true,
      progress: 0,
      invcolor: {
        r: 255 - this.state.color.r,
        g: 255 - this.state.color.g,
        b: 255 - this.state.color.b
      }
    });
    if (this.state.wipeOnRender) {
      if (this.ctx && this.roundedpixeldata) {
        this.ctx.clearRect(0, 0, this.state.width, this.state.height);
        this.pixeldata = new Float32Array(this.roundedpixeldata.length);
      }
    }
    await this.yieldToUI();
    await this.drawCurveMurder();
    this.commitImage();
    this.setState({ rendering: false, progress: 100 });
  };

  /**
   * draws a set of curves with each subsequent one having its anchor
   * points moved around randomly a bit
   *
   */
  drawCurveMurder = async () => {
    const totalIterations = 60;
    const updateInterval = Math.max(1, Math.floor(totalIterations / 10));
    let fwl = new FuzzyWobbleCircle(this.state.width, this.state, 300);

    for (var i = 0; i < totalIterations; i++) {
      this.drawSpreadCurve(fwl, i);
      if (this.state.randomColor) {
        this.setState({
          color: {
            r: this.getRandomInt(255),
            g: this.getRandomInt(255),
            b: this.getRandomInt(255)
          }
        });
        this.setState({
          invcolor: {
            r: 255 - this.state.color.r,
            g: 255 - this.state.color.g,
            b: 255 - this.state.color.b
          }
        });
      }
      fwl.next();

      if ((i + 1) % updateInterval === 0) {
        const progress = Math.round(((i + 1) / totalIterations) * 100);
        this.setState({ progress });
        await this.yieldToUI();
      }
    }
  };

  drawSpreadCurve = (fwl: FuzzyWobble, it: number) => {
    let curve = new THREE.CatmullRomCurve3(fwl.getAnchors());

    //new THREE.SplineCurve(fwl.getPoints());

    let rendered_points = curve.getPoints(this.state.width * 5);

    for (var i = 1; i < rendered_points.length; i++) {
      //get normalized direction of line at this point
      var dir = rendered_points[i]
        .clone()
        .sub(rendered_points[i - 1])
        .normalize();
      //get right angle
      dir.set(-dir.y, dir.x, dir.z);
      this.spreadGrainsLine(rendered_points[i], dir, rendered_points[i].z);
    }
  };

  render = () => {
    const { rendering, progress } = this.state;
    return (
      <CanvasWrapper>
        <canvas id="circlecanvas" ref={this.canvas}></canvas>
        {rendering && (
          <ProgressOverlay>
            <Box sx={{ width: '300px', textAlign: 'center' }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Rendering... {progress}%
              </Typography>
              <LinearProgress variant="determinate" value={progress} />
            </Box>
          </ProgressOverlay>
        )}
        <TopRight>
          <RandomComp stateCallback={this.setSettingAndRender} />
          <DownloadComp
            cb={this.download}
            imageDataUrl={this.getImageDataUrl()}
            generationParams={this.state}
          />
          <SettingsMenu
            setSettings={this.setSetting}
            parentState={this.state}
            pRedraw={this.redraw}
          />
        </TopRight>
      </CanvasWrapper>
    );
  };
}
