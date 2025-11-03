import type { ReactNode } from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import styled from 'styled-components';

const Container = styled.div`
  max-width: 1000px;
  margin: 2rem auto;
  padding: 1rem;
`;

interface LayoutProps {
  title?: string;
  onNavigate?: (page: 'list' | 'add') => void;
  children: ReactNode;
}

export default function Layout({ title = 'Demo ATS', onNavigate, children }: LayoutProps) {
  return (
    <>
      <AppBar position="static" color="primary">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {title}
          </Typography>
          {onNavigate && (
            <>
              <Button color="inherit" onClick={() => onNavigate('list')}>
                View List
              </Button>
              <Button color="inherit" onClick={() => onNavigate('add')}>
                Add Professional
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>
      <Container>{children}</Container>
    </>
  );
}
