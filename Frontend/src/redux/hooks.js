import { useSelector } from 'react-redux';

export const useInvoiceListData = () => {
  const invoices = useSelector((state) => state.invoices);

  const getOneInvoice = (id) => invoices.find((inv) => inv.id === id);
  const listSize = invoices.length;

  return { invoices, getOneInvoice, listSize };
};
