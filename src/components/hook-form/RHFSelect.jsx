import { useFormContext, Controller } from 'react-hook-form';
import { TextField } from '@mui/material';
export default function RHFSelect({ name, children, helperText, ...other }) {
  const { control } = useFormContext();
  return (
    <Controller name={name} control={control} render={({ field, fieldState: { error } }) => (
      <TextField {...field} select fullWidth error={!!error} helperText={error ? error.message : helperText} {...other}>{children}</TextField>
    )} />
  );
}
