import React from "react";
import {
  Stack,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  OutlinedInput,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

const statusOptions = [
  { id: 1, name: "Draft" },
  { id: 2, name: "Unpaid" },
  { id: 3, name: "Paid" },
  { id: 4, name: "Deleted" },
];

export default function ReportExportControls({
  from,
  to,
  statusIds,
  onChange,
}) {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Stack direction="row" spacing={2} alignItems="center">
        <DatePicker
          label="From"
          value={dayjs(from)}
          onChange={(d) => onChange(d.toDate(), to, statusIds)}
          renderInput={(params) => <TextField {...params} size="small" />}
        />
        <DatePicker
          label="To"
          value={dayjs(to)}
          onChange={(d) => onChange(from, d.toDate(), statusIds)}
          renderInput={(params) => <TextField {...params} size="small" />}
        />

        <FormControl sx={{ minWidth: 200 }} size="small">
          <InputLabel>Status</InputLabel>
          <Select
            multiple
            value={statusIds}
            onChange={(e) => onChange(from, to, e.target.value)}
            input={<OutlinedInput label="Status" />}
            renderValue={(sel) =>
              sel.map((id) => statusOptions.find((s) => s.id === id).name).join(", ")
            }
          >
            {statusOptions.map((s) => (
              <MenuItem key={s.id} value={s.id}>
                <Checkbox checked={statusIds.includes(s.id)} />
                <ListItemText primary={s.name} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>
    </LocalizationProvider>
  );
}
