import { useFormContext, Controller } from 'react-hook-form';
import { DatePicker } from '@mui/x-date-pickers';
import { TextField } from '@mui/material';
export default function RHFDatePicker({ name, label, ...other }) {
  const { control } = useFormContext();
  return (
    <Controller name={name} control={control} render={({ field, fieldState: { error } }) => (
      <DatePicker label={label} value={field.value} onChange={field.onChange}
        renderInput={(params) => <TextField {...params} fullWidth error={!!error} helperText={error ? error.message : ''} />}
        {...other} />
    )} />
  );
}
