import * as React from "react";
import { Download } from "mdi-material-ui";

interface DownloadProps {
  cb: any;
}

export const DownloadComp: React.FunctionComponent<DownloadProps> = ({
  cb
}) => (
  <div className="download">
    <Download onClick={cb} />
  </div>
);
