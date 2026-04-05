import { useFormContext, Controller } from 'react-hook-form';
import { Checkbox, FormControlLabel } from '@mui/material';
export default function RHFCheckbox({ name, label, ...other }) {
  const { control } = useFormContext();
  return (
    <Controller name={name} control={control} render={({ field }) => (
      <FormControlLabel control={<Checkbox {...field} checked={field.value} />} label={label} {...other} />
    )} />
  );
}
