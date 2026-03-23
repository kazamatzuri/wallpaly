import React, { useState } from "react";
import { Download, Share } from "mdi-material-ui";
import { IconButton, Tooltip } from "@mui/material";
import { ShareModal } from "./ShareModal";

interface DownloadProps {
  cb: any;
  imageDataUrl?: string;
  generationParams?: any;
}

function DownloadComp(props: DownloadProps) {
  const [shareModalOpen, setShareModalOpen] = useState(false);

  const handleShare = () => {
    setShareModalOpen(true);
  };

  return (
    <div className="download" style={{ display: 'flex', gap: '8px' }}>
      <Tooltip title="Download">
        <IconButton
          onClick={() => {
            props.cb();
          }}
          size="small"
        >
          <Download />
        </IconButton>
      </Tooltip>

      <Tooltip title="Share">
        <IconButton
          onClick={handleShare}
          size="small"
        >
          <Share />
        </IconButton>
      </Tooltip>

      {props.imageDataUrl && props.generationParams && (
        <ShareModal
          open={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
          imageDataUrl={props.imageDataUrl}
          generationParams={props.generationParams}
        />
      )}
    </div>
  );
}

export default DownloadComp;
