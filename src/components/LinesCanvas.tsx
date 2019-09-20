import React, { createRef, Component } from "react";
import { Lines } from "../gfx/Lines";
import PropTypes from "prop-types";
import { Tune } from "mdi-material-ui";
import Slider from "@material-ui/core/Slider";
import Tooltip from "@material-ui/core/Tooltip";
import Typography from "@material-ui/core/Typography";
import PopperJs from "popper.js";

ValueLabelComponent.propTypes = {
  children: PropTypes.element.isRequired,
  open: PropTypes.bool.isRequired,
  value: PropTypes.number.isRequired,
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
        popperRef,
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
};
type LinesState = Readonly<typeof initialState>;

export class LinesCanvas extends Component<object, LinesState> {
  private canvas = createRef<HTMLCanvasElement>();
  public state: LinesState = initialState;
  private lines?: Lines;
  static propTypes = {
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    seed: PropTypes.number,
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
      width: props.width,
      height: props.height,
      seed: seed,
      lineNumber: 60,
    };
  }

  onLinesChange = (event: object, value: any) => {
    this.setState({ lineNumber: value });
  };

  componentDidMount = () => {
    console.log(this.state);
    if (this.canvas.current) {
      this.canvas.current.height = this.state.height;
      this.canvas.current.width = this.state.width;
      this.lines = new Lines(this.canvas.current, this.state.seed);
      this.lines.redraw();
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
                defaultValue={60}
                min={20}
                max={300}
                onChangeCommitted={this.onLinesChange}
              />
              <Typography gutterBottom>Number of anchor points</Typography>
              <Slider
                ValueLabelComponent={ValueLabelComponent}
                aria-label="custom thumb label"
                defaultValue={90}
                min={5}
                max={300}
              />
              <Typography gutterBottom>Anchor points jitter for x</Typography>
              <Slider
                ValueLabelComponent={ValueLabelComponent}
                aria-label="custom thumb label"
                defaultValue={5}
                min={0}
                max={200}
              />
              <Typography gutterBottom>Anchor points jitter for y</Typography>
              <Slider
                ValueLabelComponent={ValueLabelComponent}
                aria-label="custom thumb label"
                defaultValue={25}
                min={0}
                max={200}
              />
              <Typography gutterBottom>Max colorspread</Typography>
              <Slider
                ValueLabelComponent={ValueLabelComponent}
                aria-label="custom thumb label"
                defaultValue={30}
                min={20}
                max={300}
              />

              <p>a lot of settings here</p>
              <p>and a lot of other stuff</p>
            </div>
          </div>
        </div>
      </div>
    );
  };
}
