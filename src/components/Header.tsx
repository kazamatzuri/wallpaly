import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  Tabs,
  Tab
} from '@material-ui/core';
import { Palette } from '@material-ui/icons';
import styled from '@emotion/styled';
import { AuthButton } from './AuthButton';

const StyledAppBar = styled(AppBar)`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
`;

const Logo = styled(Box)`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
`;

interface HeaderProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentTab, onTabChange }) => {
  return (
    <StyledAppBar position="static">
      <Toolbar>
        <Logo>
          <Palette />
          <Typography variant="h6">
            Wallpaly
          </Typography>
        </Logo>

        <Box display="flex" alignItems="center" gap={2}>
          <Tabs
            value={currentTab}
            onChange={(_, value) => onTabChange(value)}
            textColor="inherit"
            TabIndicatorProps={{
              style: { backgroundColor: 'white' }
            }}
          >
            <Tab label="Generator" value="generator" />
            <Tab label="Gallery" value="gallery" />
            <Tab label="Trending" value="trending" />
            <Tab label="Popular" value="popular" />
          </Tabs>

          <AuthButton />
        </Box>
      </Toolbar>
    </StyledAppBar>
  );
};