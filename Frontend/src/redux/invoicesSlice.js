import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  invoices: [],
};

const invoicesSlice = createSlice({
  name: 'invoices',
  initialState,
  reducers: {
    addInvoice: (state, action) => {
      state.invoices.push(action.payload);
    },
    updateInvoice: (state, action) => {
      const index = state.invoices.findIndex(inv => inv.id === action.payload.id);
      if (index !== -1) {
        state.invoices[index] = action.payload.updatedInvoice;
      }
    },
    updateInvoiceStatus: (state, action) => {
      const { id, statusId, statusName } = action.payload;
      const index = state.invoices.findIndex(inv => inv.id === id);
      if (index !== -1) {
        state.invoices[index].statusId = statusId;
        state.invoices[index].statusName = statusName; // Optionally update status name if available
      }
    },
  },
});

export const { addInvoice, updateInvoice, updateInvoiceStatus } = invoicesSlice.actions;
export default invoicesSlice.reducer;
