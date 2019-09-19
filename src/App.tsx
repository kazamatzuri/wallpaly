import React from "react";
import "./App.css";
import { LinesCanvas } from "./components/LinesCanvas";
import Grid from "@material-ui/core/Grid";
const App: React.FC = () => {
  return (
    <div className="App">
      <Grid container spacing={0}>
        <Grid container spacing={0}>
          <Grid item xs={4}>
            <LinesCanvas width={window.innerWidth/3} height={window.innerHeight/3}></LinesCanvas>
          </Grid>
          <Grid item xs={4}>
            <LinesCanvas width={window.innerWidth/3} height={window.innerHeight/3}></LinesCanvas>
          </Grid>
          <Grid item xs={4}>
            <LinesCanvas width={window.innerWidth/3} height={window.innerHeight/3}></LinesCanvas>
          </Grid>
        </Grid>
        <Grid container spacing={0}>
          <Grid item xs={4}>
            <LinesCanvas width={window.innerWidth/3} height={window.innerHeight/3}></LinesCanvas>
          </Grid>
          <Grid item xs={4}>
            <LinesCanvas width={window.innerWidth/3} height={window.innerHeight/3}></LinesCanvas>
          </Grid>
          <Grid item xs={4}>
            <LinesCanvas width={window.innerWidth/3} height={window.innerHeight/3}></LinesCanvas>
          </Grid>
        </Grid>

        <Grid container spacing={0}>
          <Grid item xs={4}>
            <LinesCanvas width={window.innerWidth/3} height={window.innerHeight/3}></LinesCanvas>
          </Grid>
          <Grid item xs={4}>
            <LinesCanvas width={window.innerWidth/3} height={window.innerHeight/3}></LinesCanvas>
          </Grid>
          <Grid item xs={4}>
            <LinesCanvas width={window.innerWidth/3} height={window.innerHeight/3}></LinesCanvas>
          </Grid>
        </Grid>

      </Grid>
    </div>
  );
};

export default App;
