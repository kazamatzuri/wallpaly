import React, { createRef, Component } from "react";
import { Lines } from "../gfx/Lines";
import PropTypes from "prop-types";

import { SettingsMenu } from "./SettingsMenu";
import DownloadComp from "./DownloadComp";
import RandomComp from "./RandomComp";
/** @jsx jsx */
import { jsx, css } from "@emotion/core";

const initialState = {
  version: 1, //0
  lineNumber: 60, //1
  width: 640, //2
  height: 480, //3
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
  invcolor: { r: 255, g: 255, b: 255 } //14
};

const topright = css({
  display: "flex",
  position: "absolute",
  top: "8px",
  right: "16px",
  fontSize: "18px",
  zIndex: 100,
  width: "100px",
  justifyContent: "space-around"
});

export type LinesState = Readonly<typeof initialState>;

export class LinesCanvas extends Component<object, LinesState> {
  private canvas = createRef<HTMLCanvasElement>();
  public state: LinesState = initialState;
  private lines?: Lines;
  static propTypes = {
    seed: PropTypes.number
  };

  constructor(props: any) {
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

    let lochash = window.location.hash;
    if (lochash !== "") {
      let vals = JSON.parse(decodeURI(lochash.replace("#", "")));
      if (vals[0] === 1) {
        this.state = {
          ...this.state,
          lineNumber: vals[1],
          seed: vals[4],
          anchorpoints: vals[5],
          jitterX: vals[6],
          jitterY: vals[7],
          colorspread: vals[8],
          initialAmplitude: vals[30],
          wipeOnRender: vals[10],
          randomColor: vals[11],
          color: vals[13]
        };
      }
    }
  }

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
    if (this.canvas.current) {
      this.canvas.current.height = this.state.height;
      this.canvas.current.width = this.state.width;
      this.lines = new Lines(this.canvas.current, this.state);
      this.lines.redraw(this.state);
    }
  };

  redraw = () => {
    if (this && this.lines) {
      this.lines.redraw(this.state);
    }
  };

  render = () => {
    return (
      <div>
        <canvas id="linescanvas" ref={this.canvas}></canvas>
        <div css={topright}>
          <RandomComp stateCallback={this.setSettingAndRender} />
          <DownloadComp cb={this.download} />
          <SettingsMenu
            setSettings={this.setSetting}
            parentState={this.state}
            pRedraw={this.redraw}
          />
        </div>
      </div>
    );
  };
}
