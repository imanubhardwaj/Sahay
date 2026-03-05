import React from 'react';
import MuiAlert from '@mui/material/Alert';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { AlertVariant } from './Wrapper';

export interface Props {
  className?: string;
  open?: boolean;
  onClose?: () => void;
  variant?: AlertVariant;
  action?: React.ReactNode;
  children?: string | React.ReactNode;
}

const theme = createTheme({
  palette: {
    warning: {
      main: '#F3BA2E',
      contrastText: '#000',
    },
  },
});

export default function Alert({ children, open, variant, ...props }: Props) {
  if (!open) {
    return null;
  }

  return (
    <ThemeProvider theme={theme}>
      <MuiAlert {...props} severity={variant} variant="filled">
        {children}
      </MuiAlert>
    </ThemeProvider>
  );
}
