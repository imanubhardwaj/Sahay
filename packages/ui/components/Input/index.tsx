import { forwardRef } from 'react';
import TextField, { type TextFieldProps } from '@mui/material/TextField';
import { styled } from '@mui/material/styles';
import { theme as themeConfig } from '../../theme';

export type BaseInputProps = TextFieldProps & {
  borderColor?: string;
} & React.InputHTMLAttributes<HTMLInputElement> & {
    endAdornment?: React.ReactNode;
  };

const CustomTextField = styled(TextField)<{ borderColor?: string }>(
  ({ theme, borderColor }) => ({
    '& label': {
      fontSize: theme.typography.caption.fontSize,
      color: themeConfig.colors.secondary,
      '&.Mui-focused': {
        color: themeConfig.colors['secondary-focused'],
        fontSize: theme.typography.fontSize,
        fontWeight: theme.typography.fontWeightMedium,
      },
    },
    '& .MuiOutlinedInput-root': {
      height: theme.spacing(6),
      borderRadius: theme.spacing(1),
      color: 'black',
      '& fieldset': {
        borderColor: borderColor || themeConfig.colors['input-border'],
      },
      '&:hover fieldset': {
        borderColor: themeConfig.colors['secondary-focused'],
      },
      '&.Mui-focused fieldset': {
        borderColor: themeConfig.colors['secondary-focused'],
      },
    },
    '& .MuiInputBase-input': {
      fontSize: theme.typography.fontSize,
    },
  }),
);

const Input = forwardRef<HTMLInputElement, BaseInputProps>((props, ref) => {
  const { endAdornment, variant = 'outlined', ...rest } = props;
  return (
    <CustomTextField
      {...rest}
      inputRef={ref}
      variant={variant}
      slotProps={{ input: { endAdornment } }}
    />
  );
});

Input.displayName = 'Input';

export default Input;
