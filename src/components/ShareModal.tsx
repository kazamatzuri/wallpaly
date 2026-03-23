import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Chip,
  Snackbar,
  Alert
} from '@mui/material';
import { CloudUpload } from '@mui/icons-material';
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
  const [uploading, setUploading] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      login();
      return;
    }

    setUploading(true);

    try {
      const tagList = tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];

      const wallpaperData = {
        title: title || undefined,
        description: description || undefined,
        imageDataUrl,
        generationParams,
        tags: tagList.length > 0 ? tagList : undefined
      };

      const result = await api.saveGeneratedWallpaper(wallpaperData);

      if (result.data) {
        setTitle('');
        setDescription('');
        setTags('');
        setSnackbar({ open: true, message: 'Wallpaper shared successfully!', severity: 'success' });
        onClose();
      } else {
        setSnackbar({ open: true, message: result.error || 'Failed to share wallpaper', severity: 'error' });
      }
    } catch (error) {
      setSnackbar({ open: true, message: 'Network error. Please try again.', severity: 'error' });
    }

    setUploading(false);
  };

  if (!open) return null;

  return (
    <>
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
                inputProps={{ maxLength: 255 }}
                helperText={`${title.length}/255`}
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
                inputProps={{ maxLength: 2000 }}
                helperText={`${description.length}/2000`}
              />

              <TextField
                fullWidth
                label="Tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                margin="normal"
                placeholder="abstract, colorful, minimalist (comma separated)"
                helperText="Add tags to help people discover your wallpaper (max 10)"
              />

              <Box mt={2}>
                <Typography variant="body2" color="textSecondary">
                  Generation Settings:
                </Typography>
                <Box display="flex" gap={1} flexWrap="wrap" mt={1}>
                  <Chip size="small" label={`${generationParams.width}x${generationParams.height}`} />
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

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};
