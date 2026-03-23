import React, { useState, useEffect } from 'react';
import { IconButton, Typography, Box } from '@mui/material';
import { ThumbUp, ThumbDown } from '@mui/icons-material';
import styled from '@emotion/styled';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const VoteContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
`;

const VoteBtn = styled(IconButton)<{ active?: string }>`
  color: ${props => props.active === 'true' ? '#1976d2' : 'rgba(0, 0, 0, 0.54)'};
  &:hover {
    background-color: rgba(25, 118, 210, 0.04);
  }
`;

interface VoteButtonsProps {
  wallpaperId: string;
  initialVoteScore?: number;
  initialUserVote?: number | null;
}

export const VoteButtons: React.FC<VoteButtonsProps> = ({
  wallpaperId,
  initialVoteScore = 0,
  initialUserVote = null
}) => {
  const { isAuthenticated, login } = useAuth();
  const [voteScore, setVoteScore] = useState(initialVoteScore);
  const [userVote, setUserVote] = useState<number | null>(initialUserVote);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setVoteScore(initialVoteScore);
    setUserVote(initialUserVote);
  }, [initialVoteScore, initialUserVote]);

  const handleVote = async (voteType: number) => {
    if (!isAuthenticated) {
      login();
      return;
    }

    if (loading) return;

    setLoading(true);
    const newVoteType = userVote === voteType ? 0 : voteType;

    const response = await api.voteOnWallpaper(wallpaperId, newVoteType);

    if (response.data) {
      setVoteScore(response.data.voteScore);
      setUserVote(response.data.userVote);
    }

    setLoading(false);
  };

  return (
    <VoteContainer>
      <VoteBtn
        active={(userVote === 1).toString()}
        onClick={() => handleVote(1)}
        disabled={loading}
        size="small"
      >
        <ThumbUp />
      </VoteBtn>

      <Typography variant="body2" color="textSecondary">
        {voteScore}
      </Typography>

      <VoteBtn
        active={(userVote === -1).toString()}
        onClick={() => handleVote(-1)}
        disabled={loading}
        size="small"
      >
        <ThumbDown />
      </VoteBtn>
    </VoteContainer>
  );
};
