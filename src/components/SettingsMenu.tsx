import React, { createRef, Component } from "react";
import Button from "@material-ui/core/Button";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import { Tune } from "mdi-material-ui";
import Typography from "@material-ui/core/Typography";
import Slider from "@material-ui/core/Slider";
import PropTypes from "prop-types";
import Tooltip from "@material-ui/core/Tooltip";
import PopperJs from "popper.js";
import { SketchPicker, ColorResult } from "react-color";
import CSS from "csstype";

import { LinesState } from "./LinesCanvas";

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

type SettingsState = {
  parentState: LinesState;
  pRedraw: any;
  setSettings: any;
  displayColorPicker: boolean;
  randomColor: boolean;
  wipe: boolean;
};

export class SettingsMenu extends Component<object, SettingsState> {
  public state: SettingsState;

  static propTypes = {
    setSettings: PropTypes.func.isRequired,
    parentState: PropTypes.any,
    pRedraw: PropTypes.any
  };

  constructor(props: SettingsState) {
    super(props);
    this.state = {
      parentState: props.parentState,
      pRedraw: props.pRedraw,
      setSettings: props.setSettings,
      displayColorPicker: false,
      randomColor: props.parentState.randomColor,
      wipe: props.parentState.wipeOnRender
    };
  }

  handleClick = () => {
    this.state.setSettings({
      displayColorPicker: !this.state.parentState.displayColorPicker
    });
  };
  handleClose = () => {
    this.state.setSettings({ displayColorPicker: false });
  };

  handleChange = (color: ColorResult) => {
    this.state.setSettings({ color: color.rgb });
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
      background: `rgba(${this.state.parentState.color.r}, ${this.state.parentState.color.g}, ${this.state.parentState.color.b},1.0)`
    };
    const popoverStyle: CSS.Properties = {
      position: "absolute",
      zIndex: 2
    };
    return (
      <div className="settingsbutton">
        <Tune />

        <div className="settingsmenu">
          <div>
            <Typography gutterBottom>Number of lines</Typography>
            <Slider
              ValueLabelComponent={ValueLabelComponent}
              aria-label="custom thumb label"
              defaultValue={this.state.parentState.lineNumber}
              min={20}
              max={300}
              onChangeCommitted={(event: object, value: any) => {
                this.state.setSettings({ lineNumber: value });
              }}
            />
            <Typography gutterBottom>Number of anchor points</Typography>
            <Slider
              ValueLabelComponent={ValueLabelComponent}
              aria-label="custom thumb label"
              defaultValue={this.state.parentState.anchorpoints}
              min={5}
              max={300}
              onChangeCommitted={(event: object, value: any) => {
                this.state.setSettings({ anchorpoints: value });
              }}
            />
            <Typography gutterBottom>Initialization amplitude</Typography>
            <Slider
              ValueLabelComponent={ValueLabelComponent}
              aria-label="custom thumb label"
              defaultValue={this.state.parentState.initialAmplitude}
              min={20}
              max={300}
              onChangeCommitted={(event: object, value: any) => {
                this.state.setSettings({ initialAmplitude: value });
              }}
            />
            <Typography gutterBottom>Anchor points jitter for x</Typography>
            <Slider
              ValueLabelComponent={ValueLabelComponent}
              aria-label="custom thumb label"
              defaultValue={this.state.parentState.jitterX}
              min={0}
              max={200}
              onChangeCommitted={(event: object, value: any) => {
                this.state.setSettings({ jitterX: value });
              }}
            />
            <Typography gutterBottom>Anchor points jitter for y</Typography>
            <Slider
              ValueLabelComponent={ValueLabelComponent}
              aria-label="custom thumb label"
              defaultValue={this.state.parentState.jitterY}
              min={0}
              max={200}
              onChangeCommitted={(event: object, value: any) => {
                this.state.setSettings({ jitterY: value });
              }}
            />
            <Typography gutterBottom>Max colorspread</Typography>
            <Slider
              ValueLabelComponent={ValueLabelComponent}
              aria-label="custom thumb label"
              defaultValue={this.state.parentState.colorspread}
              min={20}
              max={300}
              onChangeCommitted={(event: object, value: any) => {
                this.state.setSettings({ colorspread: value });
              }}
            />

            <p>
              <Button
                variant="outlined"
                className="button"
                onClick={this.state.pRedraw}
              >
                Render
              </Button>
            </p>

            <p>
              <FormControlLabel
                control={<Checkbox checked={this.state.wipe} />}
                onChange={() => {
                  this.state.setSettings({
                    wipeOnRender: !this.state.wipe
                  });
                  this.setState({ wipe: !this.state.wipe });
                }}
                label="Wipe before new render"
              />
            </p>

            <p>
              <FormControlLabel
                control={<Checkbox checked={this.state.randomColor} />}
                onChange={() => {
                  this.state.setSettings({
                    randomColor: !this.state.randomColor
                  });
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
                    color={this.state.parentState.color}
                    onChange={this.handleChange}
                  />
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    );
  };
}
