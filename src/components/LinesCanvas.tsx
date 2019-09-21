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
  lineNumber: 60,
  width: 640,
  height: 480,
  seed: 1,
  anchorpoints: 90,
  jitterX: 5,
  jitterY: 25,
  colorspread: 5,
  initialAmplitude: 30,
  wipeOnRender: true,
  displayColorPicker: false,
  color: {
    r: "255",
    g: "255",
    b: "255",
    a: "1"
  }
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

  render = () => {
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
              <p></p>
            </div>
          </div>
        </div>
      </div>
    );
  };
}
