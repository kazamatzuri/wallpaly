import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  Box,
  Typography,
  Chip
} from '@material-ui/core';
import { CloudUpload } from '@material-ui/icons';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface ShareModalProps {
  open: boolean;
  onClose: () => void;
  imageDataUrl: string;
  generationParams: any;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  open,
  onClose,
  imageDataUrl,
  generationParams
}) => {
  const { isAuthenticated, login } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      login();
      return;
    }

    setUploading(true);

    try {
      // Convert data URL to blob
      const response = await fetch(imageDataUrl);
      const blob = await response.blob();

      // Create form data
      const formData = new FormData();
      formData.append('image', blob, 'wallpaper.png');
      formData.append('title', title);
      formData.append('description', description);
      formData.append('generationParams', JSON.stringify(generationParams));

      if (tags) {
        const tagList = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
        formData.append('tags', JSON.stringify(tagList));
      }

      const result = await api.uploadWallpaper(formData);

      if (result.data) {
        // Reset form
        setTitle('');
        setDescription('');
        setTags('');
        onClose();
        // You might want to show a success message or redirect
      } else {
        console.error('Upload failed:', result.error);
      }
    } catch (error) {
      console.error('Upload error:', error);
    }

    setUploading(false);
  };

  if (!open) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Share Your Wallpaper</DialogTitle>

      <DialogContent>
        {!isAuthenticated ? (
          <Box textAlign="center" py={2}>
            <Typography variant="body1" gutterBottom>
              Sign in to share your wallpaper with the community
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={login}
              startIcon={<CloudUpload />}
            >
              Sign in with GitHub
            </Button>
          </Box>
        ) : (
          <Box>
            <TextField
              fullWidth
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              margin="normal"
              placeholder="Give your wallpaper a title..."
            />

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              margin="normal"
              placeholder="Describe your wallpaper..."
            />

            <TextField
              fullWidth
              label="Tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              margin="normal"
              placeholder="abstract, colorful, minimalist (comma separated)"
              helperText="Add tags to help people discover your wallpaper"
            />

            <Box mt={2}>
              <Typography variant="body2" color="textSecondary">
                Generation Settings:
              </Typography>
              <Box display="flex" gap={1} flexWrap="wrap" mt={1}>
                <Chip size="small" label={`${generationParams.width}×${generationParams.height}`} />
                <Chip size="small" label={`Seed: ${generationParams.seed}`} />
                <Chip size="small" label={`Lines: ${generationParams.lineNumber}`} />
              </Box>
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          Cancel
        </Button>
        {isAuthenticated && (
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={uploading}
            startIcon={<CloudUpload />}
          >
            {uploading ? 'Uploading...' : 'Share Wallpaper'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};