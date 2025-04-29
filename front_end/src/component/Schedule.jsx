import TextField from '@mui/material/TextField';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { vi } from 'date-fns/locale';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { IconButton, InputAdornment } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

export default function Schedule() {
  const [value, setValue] = React.useState(null);
  const [error, setError] = React.useState(false);

  const handleDateChange = (newValue) => {
    setValue(newValue);
    setError(false);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
      <DatePicker
        label="Chọn ngày"
        value={value}
        onChange={handleDateChange}
        inputFormat="dd/MM/yyyy"
        componentsProps={{
          actionBar: {
            actions: ['clear', 'today'],
          },
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            error={error}
            helperText={error ? 'Vui lòng chọn ngày hợp lệ' : ''}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {value && (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setValue(null)}>
                        <ClearIcon />
                      </IconButton>
                    </InputAdornment>
                  )}
                  {params.InputProps?.endAdornment}
                </>
              ),
            }}
          />
        )}
      />
    </LocalizationProvider>
  );
}
