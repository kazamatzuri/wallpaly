import React from "react";

import { DiceMultiple } from "mdi-material-ui";

interface RandomCompProps {
  stateCallback: any;
}

function getRandomInt(max: number) {
  return Math.floor(Math.random() * Math.floor(max));
}

function randomize(cb: any) {
  let r = {
    lineNumber: getRandomInt(280) + 20,
    seed: getRandomInt(9999),
    anchorpoints: getRandomInt(295) + 5,
    jitterX: getRandomInt(200),
    jitterY: getRandomInt(200),
    colorspread: getRandomInt(180) + 20,
    initialAmplitude: getRandomInt(280) + 20,
    color: {
      r: getRandomInt(255),
      g: getRandomInt(255),
      b: getRandomInt(255)
    }
  };
  cb(r);
}

function RandomComp(props: RandomCompProps) {
  return (
    <div>
      <DiceMultiple
        onClick={() => {
          randomize(props.stateCallback);
        }}
      />
    </div>
  );
}

export default RandomComp;
