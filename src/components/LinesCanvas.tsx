import React, { createRef, Component } from "react";
import { Lines } from "../gfx/Lines";
import PropTypes from "prop-types";
import { Tune } from "mdi-material-ui";
import Slider from "@material-ui/core/Slider";
import Tooltip from "@material-ui/core/Tooltip";
import Typography from "@material-ui/core/Typography";
import PopperJs from "popper.js";
import Button from "@material-ui/core/Button";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import { SketchPicker, ColorResult } from "react-color";
import CSS from "csstype";

ValueLabelComponent.propTypes = {
  children: PropTypes.element.isRequired,
  open: PropTypes.bool.isRequired,
  value: PropTypes.number.isRequired
};

interface Props {
  children: React.ReactElement;
  open: boolean;
  value: number;
}

function ValueLabelComponent(props: Props) {
  const { children, open, value } = props;

  const popperRef = React.useRef<PopperJs | null>(null);
  React.useEffect(() => {
    if (popperRef.current) {
      popperRef.current.update();
    }
  });

  return (
    <Tooltip
      PopperProps={{
        popperRef
      }}
      open={open}
      enterTouchDelay={0}
      placement="top"
      title={value}
    >
      {children}
    </Tooltip>
  );
}

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
export type LinesState = Readonly<typeof initialState>;

export class LinesCanvas extends Component<object, LinesState> {
  private canvas = createRef<HTMLCanvasElement>();
  public state: LinesState = initialState;
  private lines?: Lines;
  static propTypes = {
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
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
      width: props.width,
      height: props.height,
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
  handleClick = () => {
    this.setState({ displayColorPicker: !this.state.displayColorPicker });
  };
  handleClose = () => {
    this.setState({ displayColorPicker: false });
  };

  handleChange = (color: ColorResult) => {
    this.setState({ color: color.rgb });
  };
  render = () => {
    const swatchStyle: CSS.Properties = {
      padding: "5px",
      background: "#fff",
      borderRadius: "1px",
      boxShadow: "0 0 0 1px rgba(0,0,0,.1)",
      display: "inline-block",
      cursor: "pointer"
    };
    const coverStyle: CSS.Properties = {
      position: "fixed",
      top: "0px",
      right: "0px",
      bottom: "0px",
      left: "0px"
    };
    const colorStyle: CSS.Properties = {
      width: "36px",
      height: "14px",
      borderRadius: "2px",
      background: `rgba(${this.state.color.r}, ${this.state.color.g}, ${this.state.color.b},1.0)`
    };
    const popoverStyle: CSS.Properties = {
      position: "absolute",
      zIndex: 2
    };

    return (
      <div>
        <canvas id="test" ref={this.canvas}></canvas>
        <div className="topright">
          <Tune />
          <div className="settingsmenu">
            <div>
              <Typography gutterBottom>Number of lines</Typography>
              <Slider
                ValueLabelComponent={ValueLabelComponent}
                aria-label="custom thumb label"
                defaultValue={this.state.lineNumber}
                min={20}
                max={300}
                onChangeCommitted={(event: object, value: any) => {
                  this.setState({ lineNumber: value });
                }}
              />
              <Typography gutterBottom>Number of anchor points</Typography>
              <Slider
                ValueLabelComponent={ValueLabelComponent}
                aria-label="custom thumb label"
                defaultValue={this.state.anchorpoints}
                min={5}
                max={300}
                onChangeCommitted={(event: object, value: any) => {
                  this.setState({ anchorpoints: value });
                }}
              />
              <Typography gutterBottom>Initialization amplitude</Typography>
              <Slider
                ValueLabelComponent={ValueLabelComponent}
                aria-label="custom thumb label"
                defaultValue={this.state.initialAmplitude}
                min={20}
                max={300}
                onChangeCommitted={(event: object, value: any) => {
                  this.setState({ initialAmplitude: value });
                }}
              />
              <Typography gutterBottom>Anchor points jitter for x</Typography>
              <Slider
                ValueLabelComponent={ValueLabelComponent}
                aria-label="custom thumb label"
                defaultValue={this.state.jitterX}
                min={0}
                max={200}
                onChangeCommitted={(event: object, value: any) => {
                  this.setState({ jitterX: value });
                }}
              />
              <Typography gutterBottom>Anchor points jitter for y</Typography>
              <Slider
                ValueLabelComponent={ValueLabelComponent}
                aria-label="custom thumb label"
                defaultValue={this.state.jitterY}
                min={0}
                max={200}
                onChangeCommitted={(event: object, value: any) => {
                  this.setState({ jitterY: value });
                }}
              />
              <Typography gutterBottom>Max colorspread</Typography>
              <Slider
                ValueLabelComponent={ValueLabelComponent}
                aria-label="custom thumb label"
                defaultValue={this.state.colorspread}
                min={20}
                max={300}
                onChangeCommitted={(event: object, value: any) => {
                  this.setState({ colorspread: value });
                }}
              />

              <p>
                <Button
                  variant="outlined"
                  className="button"
                  onClick={this.redraw}
                >
                  Render
                </Button>
              </p>

              <p>
                <FormControlLabel
                  control={<Checkbox checked={this.state.wipeOnRender} />}
                  onChange={() => {
                    this.setState({ wipeOnRender: !this.state.wipeOnRender });
                  }}
                  label="Wipe before new render"
                />
              </p>

              <p>
                <FormControlLabel
                  control={<Checkbox checked={this.state.randomColor} />}
                  onChange={() => {
                    this.setState({ randomColor: !this.state.randomColor });
                  }}
                  label="Random colors"
                />
              </p>

              <div>
                <div style={swatchStyle} onClick={this.handleClick}>
                  <div style={colorStyle} />
                </div>
                {this.state.displayColorPicker ? (
                  <div style={popoverStyle}>
                    <div style={coverStyle} onClick={this.handleClose} />
                    <SketchPicker
                      color={this.state.color}
                      onChange={this.handleChange}
                    />
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
}
