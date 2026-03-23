import React from 'react';
import { Button, Avatar, Menu, MenuItem, Typography, Box } from '@material-ui/core';
import { AccountCircle } from '@material-ui/icons';
import styled from '@emotion/styled';
import { useAuth } from '../context/AuthContext';

const UserInfo = styled(Box)`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 8px;
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

export const AuthButton: React.FC = () => {
  const { user, isAuthenticated, login, logout } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
  };

  if (!isAuthenticated) {
    return (
      <Button
        variant="outlined"
        onClick={login}
        startIcon={<AccountCircle />}
        style={{ color: 'white', borderColor: 'white' }}
      >
        Sign in with GitHub
      </Button>
    );
  }

  return (
    <>
      <UserInfo onClick={handleMenuOpen}>
        <Avatar
          src={user?.avatarUrl}
          alt={user?.username}
          style={{ width: 32, height: 32 }}
        >
          {user?.username?.[0]?.toUpperCase()}
        </Avatar>
        <Typography variant="body2" style={{ color: 'white' }}>
          {user?.displayName || user?.username}
        </Typography>
      </UserInfo>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleMenuClose}>
          <Typography variant="body2">
            Profile
          </Typography>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <Typography variant="body2">
            My Wallpapers
          </Typography>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <Typography variant="body2">
            Collections
          </Typography>
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <Typography variant="body2">
            Sign Out
          </Typography>
        </MenuItem>
      </Menu>
    </>
  );
};