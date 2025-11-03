import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { CssBaseline } from '@mui/material';
import { muiTheme } from './styles/theme';
import { GlobalStyle } from './styles/globalStyles';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MuiThemeProvider theme={muiTheme}>
      <StyledThemeProvider theme={muiTheme}>
        <CssBaseline />
        <GlobalStyle />
        <App />
      </StyledThemeProvider>
    </MuiThemeProvider>
  </React.StrictMode>,
);
