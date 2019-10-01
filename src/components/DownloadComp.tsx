/** @jsx jsx */
import { jsx, css } from "@emotion/core";

import React, { useState } from "react";

import { Download } from "mdi-material-ui";
import { Button } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
interface DownloadProps {
  cb: any;
}

const downloadMenucss = css({
  width: "200px",
  position: "absolute",
  right: "5px",
  top: "15px",
  backgroundColor: "rgba(128, 128, 128, 0.3)"
});

const hidden = css(
  {
    display: "none"
  },
  downloadMenucss
);

const shown = css(
  {
    display: "block"
  },
  downloadMenucss
);

function DownloadComp(props: DownloadProps) {
  const [showMenu, setShowMenu] = React.useState(false);
  return (
    <div className="download">
      <Download
        onMouseEnter={() => setShowMenu(showMenu => !showMenu)}
        onClick={() => setShowMenu(showMenu => !showMenu)}
      />
      <div
        className="downloadMenu"
        onMouseLeave={() => setShowMenu(showMenu => !showMenu)}
        css={showMenu ? shown : hidden}
      >
        <Grid container spacing={0}>
          <Grid item xs={6}>
            <Button>1920 x 1080</Button>
          </Grid>
          <Grid item xs={6}>
            <Button>2560 x 1080</Button>
          </Grid>
        </Grid>
        <Grid container spacing={0}>
          <Grid item xs={6}>
            <Button>2560 x 1440</Button>
          </Grid>
          <Grid item xs={6}>
            <Button>3440 x 1440</Button>
          </Grid>
        </Grid>
        <Grid container spacing={0}>
          <Grid item xs={6}>
            <Button>3840 x 2160</Button>
          </Grid>
          <Grid item xs={6}>
            <Button>5120 x 2160</Button>
          </Grid>
        </Grid>
      </div>
    </div>
  );
}

export default DownloadComp;
