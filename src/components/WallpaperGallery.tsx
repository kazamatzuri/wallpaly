import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Chip,
  Pagination
} from '@mui/material';
import styled from '@emotion/styled';
import { api } from '../services/api';
import { VoteButtons } from './VoteButton';

const GalleryContainer = styled(Box)`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const FilterContainer = styled(Box)`
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
  align-items: center;
`;

const WallpaperCard = styled(Card)`
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  }
  transition: all 0.3s ease;
`;

const CardImage = styled(CardMedia)`
  height: 200px;
  position: relative;
`;

const VoteOverlay = styled(Box)`
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  padding: 4px;
`;

const CreatorInfo = styled(Box)`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
`;

const AvatarImg = styled('img')`
  width: 24px;
  height: 24px;
  border-radius: 50%;
`;

interface WallpaperGalleryProps {
  sortBy?: string;
}

export const WallpaperGallery: React.FC<WallpaperGalleryProps> = ({ sortBy = 'recent' }) => {
  const [wallpapers, setWallpapers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sort, setSort] = useState(sortBy);
  const [search, setSearch] = useState('');
  const [selectedResolution, setSelectedResolution] = useState('');

  const loadWallpapers = async () => {
    setLoading(true);
    const response = await api.getWallpapers({
      page,
      limit: 20,
      sort,
      search: search || undefined,
      resolution: selectedResolution || undefined
    });

    if (response.data) {
      setWallpapers(response.data.data);
      setTotalPages(response.data.totalPages);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadWallpapers();
  }, [page, sort, selectedResolution]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (page === 1) {
        loadWallpapers();
      } else {
        setPage(1);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [search]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (page === 1) {
      loadWallpapers();
    } else {
      setPage(1);
    }
  };

  const resolutions = [
    '1920x1080',
    '2560x1080',
    '2560x1440',
    '3440x1440',
    '3840x2160',
    '5120x2160'
  ];

  if (loading && wallpapers.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <GalleryContainer>
      <FilterContainer>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '16px', flex: 1 }}>
          <TextField
            placeholder="Search wallpapers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            variant="outlined"
            size="small"
            style={{ minWidth: '200px' }}
          />
        </form>

        <FormControl variant="outlined" size="small" style={{ minWidth: '120px' }}>
          <InputLabel>Sort by</InputLabel>
          <Select value={sort} onChange={(e) => setSort(e.target.value as string)} label="Sort by">
            <MenuItem value="recent">Recent</MenuItem>
            <MenuItem value="trending">Trending</MenuItem>
            <MenuItem value="popular">Popular</MenuItem>
          </Select>
        </FormControl>

        <FormControl variant="outlined" size="small" style={{ minWidth: '140px' }}>
          <InputLabel>Resolution</InputLabel>
          <Select
            value={selectedResolution}
            onChange={(e) => setSelectedResolution(e.target.value as string)}
            label="Resolution"
          >
            <MenuItem value="">All</MenuItem>
            {resolutions.map(res => (
              <MenuItem key={res} value={res}>{res}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </FilterContainer>

      <Grid container spacing={3}>
        {wallpapers.map((wallpaper) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={wallpaper.id}>
            <WallpaperCard>
              <CardImage
                image={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${wallpaper.imageUrl}`}
                title={wallpaper.title}
              >
                <VoteOverlay>
                  <VoteButtons
                    wallpaperId={wallpaper.id}
                    initialVoteScore={wallpaper.voteScore}
                    initialUserVote={wallpaper.votes?.[0]?.voteType || null}
                  />
                </VoteOverlay>
              </CardImage>

              <CardContent>
                <Typography variant="h6" noWrap>
                  {wallpaper.title || 'Untitled'}
                </Typography>

                <Typography variant="body2" color="textSecondary" noWrap>
                  {wallpaper.width} x {wallpaper.height}
                </Typography>

                {wallpaper.description && (
                  <Typography variant="body2" style={{ marginTop: 8 }}>
                    {wallpaper.description.length > 100
                      ? `${wallpaper.description.substring(0, 100)}...`
                      : wallpaper.description}
                  </Typography>
                )}

                {wallpaper.creator && (
                  <CreatorInfo>
                    {wallpaper.creator.avatarUrl && (
                      <AvatarImg src={wallpaper.creator.avatarUrl} alt={wallpaper.creator.username} />
                    )}
                    <Typography variant="caption" color="textSecondary">
                      by {wallpaper.creator.displayName || wallpaper.creator.username}
                    </Typography>
                  </CreatorInfo>
                )}

                <Box mt={1} display="flex" gap={0.5} flexWrap="wrap">
                  {wallpaper.tags?.slice(0, 3).map((tag: string, index: number) => (
                    <Chip key={index} label={tag} size="small" />
                  ))}
                </Box>
              </CardContent>
            </WallpaperCard>
          </Grid>
        ))}
      </Grid>

      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={4}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, newPage) => setPage(newPage)}
            color="primary"
          />
        </Box>
      )}
    </GalleryContainer>
  );
};
