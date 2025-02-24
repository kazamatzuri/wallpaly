import React from "react";
import { Download } from "mdi-material-ui";

interface DownloadProps {
  cb: any;
}

function DownloadComp(props: DownloadProps) {
  return (
    <div className="download">
      <Download
        onClick={() => {
          props.cb();
        }}
      />
    </div>
  );
}

export default DownloadComp;
