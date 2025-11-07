import React, { useState } from "react";
import { 
  TableContainer, 
  Table,
  TableHead, 
  TableRow, 
  TableCell, 
  TableBody, 
  Paper, 
  Button, 
  IconButton, 
  Box,
  useMediaQuery,
  useTheme,
  Card,
  CardContent,
  Typography,
  Stack,
  Divider
} from "@mui/material";
import { BiTrash } from "react-icons/bi";
import InventoryIcon from '@mui/icons-material/Inventory';
import EditableField from "./EditableField";
import ProductSelectorDialog from "./ProductSelectorDialog";

const InvoiceItem = (props) => {
  const { onItemizedItemEdit, currency, onRowDel, items, onRowAdd, readOnly = false, onProductAdd } = props;
  const [productSelectorOpen, setProductSelectorOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const itemTable = items.map((item) => (
    <ItemRow
      key={item.itemId}
      item={item}
      onDelEvent={onRowDel}
      onItemizedItemEdit={onItemizedItemEdit}
      currency={currency}
      readOnly={readOnly}
      isMobile={isMobile}
    />
  ));

  const handleProductSelect = (products) => {
    // Handle both single product and multiple products
    const productArray = Array.isArray(products) ? products : [products];
    
    productArray.forEach(product => {
      if (onProductAdd) {
        onProductAdd(product);
      }
    });
  };

  return (
    <Box sx={{ my: 3 }}>
      {isMobile ? (
        // Mobile Card Layout
        <Stack spacing={2}>
          {items.map((item) => (
            <ItemCard
              key={item.itemId}
              item={item}
              onDelEvent={onRowDel}
              onItemizedItemEdit={onItemizedItemEdit}
              currency={currency}
              readOnly={readOnly}
            />
          ))}
        </Stack>
      ) : (
        // Desktop Table Layout
        <TableContainer 
          component={Paper} 
          sx={{ 
            borderRadius: '16px',
            overflow: 'hidden',
            background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.9))',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            position: 'relative',
            '&:before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '3px',
              background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)'
            }
          }}
        >
          <Table>
            <TableHead sx={{ 
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.08), rgba(118, 75, 162, 0.08))',
              position: 'relative'
            }}>
              <TableRow>
                <TableCell sx={{ 
                  color: '#2d3748', 
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  py: 2.5
                }}>
                  ITEM
                </TableCell>
                <TableCell sx={{ 
                  color: '#2d3748', 
                  fontWeight: 700, 
                  minWidth: '80px',
                  fontSize: '0.95rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  QTY
                </TableCell>
                <TableCell sx={{ 
                  color: '#2d3748', 
                  fontWeight: 700, 
                  minWidth: '180px',
                  fontSize: '0.95rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  PRICE (INCL. VAT)
                </TableCell>
                <TableCell sx={{ 
                  color: '#2d3748', 
                  fontWeight: 700, 
                  minWidth: '100px',
                  fontSize: '0.95rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  VAT %
                </TableCell>
                <TableCell sx={{ 
                  color: '#2d3748', 
                  fontWeight: 700, 
                  minWidth: '120px',
                  fontSize: '0.95rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  TOTAL
                </TableCell>
                {!readOnly && (
                  <TableCell align="center" sx={{ 
                    color: '#2d3748', 
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    ACTION
                  </TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>{itemTable}</TableBody>
          </Table>
        </TableContainer>
      )}      {!readOnly && (
        <Box sx={{ 
          mt: 3, 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2, 
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          <Button 
            variant="contained" 
            onClick={onRowAdd}
            fullWidth={isMobile}
            sx={{ 
              px: 3,
              py: 1.25,
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
              color: 'white',
              fontWeight: 600,
              fontSize: '0.875rem',
              textTransform: 'none',
              border: 'none',
              transition: 'all 0.2s ease',
              boxShadow: '0 1px 3px rgba(139, 92, 246, 0.15)',
              '&:hover': {
                background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
                boxShadow: '0 2px 6px rgba(139, 92, 246, 0.25)'
              }
            }}
          >
            Add Custom Item
          </Button>
          
          <Button 
            variant="outlined" 
            onClick={() => setProductSelectorOpen(true)}
            startIcon={<InventoryIcon />}
            fullWidth={isMobile}
            sx={{ 
              px: 3,
              py: 1.25,
              borderRadius: '10px',
              backgroundColor: 'rgba(139, 92, 246, 0.04)',
              borderColor: 'rgba(15, 23, 42, 0.12)',
              color: 'rgba(15, 23, 42, 0.85)',
              fontWeight: 600,
              fontSize: '0.875rem',
              textTransform: 'none',
              border: '1px solid rgba(15, 23, 42, 0.12)',
              transition: 'all 0.2s ease',
              boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
              '& .MuiSvgIcon-root': {
                color: '#8b5cf6'
              },
              '&:hover': {
                backgroundColor: 'rgba(139, 92, 246, 0.08)',
                borderColor: 'rgba(15, 23, 42, 0.2)',
                boxShadow: '0 1px 3px rgba(15, 23, 42, 0.08)'
              }
            }}
          >
            Add from Catalog
          </Button>
        </Box>
      )}
      
      <ProductSelectorDialog
        open={productSelectorOpen}
        onClose={() => setProductSelectorOpen(false)}
        onProductSelect={handleProductSelect}
        multipleSelection={true}
        currency={currency}
      />
    </Box>
  );
};

// Mobile Card Component for Invoice Items
const ItemCard = (props) => {
  const { item, onDelEvent, onItemizedItemEdit, currency, readOnly } = props;

  const onDelEventHandler = () => {
    onDelEvent(item);
  };

  const itemQuantity = item.itemQuantity !== undefined && !isNaN(item.itemQuantity) 
    ? item.itemQuantity.toString() 
    : "1";
    
  const itemPrice = item.itemPrice !== undefined && !isNaN(item.itemPrice) 
    ? item.itemPrice.toString() 
    : "0.00";

  const itemTaxRate = item.itemTaxRate !== undefined && !isNaN(item.itemTaxRate)
    ? item.itemTaxRate.toString()
    : "0";

  // Calculate line total with VAT
  // Price is GROSS (includes VAT)
  const grossPrice = parseFloat(itemPrice);
  const quantity = parseFloat(itemQuantity);
  const taxRate = parseFloat(itemTaxRate);
  
  // Calculate gross amount first
  const grossAmount = quantity * grossPrice;
  
  // Extract VAT amount from gross price
  // VAT = gross × (taxRate / (100 + taxRate))
  const vatAmount = taxRate > 0 ? (grossAmount * (taxRate / (100 + taxRate))) : 0;
  
  // Line total = gross amount (which user entered)
  const itemTotal = grossAmount.toFixed(2);

  return (
    <Card 
      sx={{ 
        borderRadius: '16px',
        overflow: 'hidden',
        background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.9))',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        position: 'relative',
        '&:before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)'
        }
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        {/* Item Name & Description */}
        <Box sx={{ mb: 2 }}>
          <Typography 
            variant="caption" 
            sx={{ 
              color: '#667eea', 
              fontWeight: 700, 
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              fontSize: '0.7rem',
              mb: 0.5,
              display: 'block'
            }}
          >
            Item
          </Typography>
          <EditableField
            onItemizedItemEdit={(evt) => onItemizedItemEdit(evt, item.itemId)}
            cellData={{
              type: "text",
              name: "itemName",
              placeholder: "Item name",
              value: item.itemName || "",
              id: item.itemId,
              required: true,
            }}
            readOnly={readOnly}
          />
          <Box sx={{ mt: 1 }}>
            <EditableField
              onItemizedItemEdit={(evt) => onItemizedItemEdit(evt, item.itemId)}
              cellData={{
                type: "text",
                name: "itemDescription",
                placeholder: "Item description (Optional)",
                value: item.itemDescription || "",
                id: item.itemId,
              }}
              readOnly={readOnly}
            />
          </Box>
        </Box>

        <Divider sx={{ my: 2, borderColor: "rgba(102, 126, 234, 0.2)" }} />

        {/* Quantity, Price & VAT in Grid - Responsive for mobile */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { 
            xs: '80px 1fr 80px',  // Mobile: Small Qty, Large Price, Small VAT
            sm: '1fr 1fr 1fr'     // Desktop: Equal columns
          }, 
          gap: 2, 
          mb: 2 
        }}>
          <Box>
            <Typography 
              variant="caption" 
              sx={{ 
                color: '#667eea', 
                fontWeight: 700, 
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontSize: '0.7rem',
                mb: 0.5,
                display: 'block'
              }}
            >
              Quantity
            </Typography>
            <EditableField
              onItemizedItemEdit={(evt) => onItemizedItemEdit(evt, item.itemId)}
              cellData={{
                type: "number",
                name: "itemQuantity",
                min: 1,
                step: "1",
                value: itemQuantity,
                id: item.itemId,
              }}
              readOnly={readOnly}
            />
          </Box>

          <Box>
            <Typography 
              variant="caption" 
              sx={{ 
                color: '#667eea', 
                fontWeight: 700, 
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontSize: '0.7rem',
                mb: 0.5,
                display: 'block'
              }}
            >
              Price (incl. VAT)
            </Typography>
            <EditableField
              onItemizedItemEdit={(evt) => onItemizedItemEdit(evt, item.itemId)}
              cellData={{
                leading: currency,
                type: "number",
                name: "itemPrice",
                min: 0,
                step: "0.01",
                presicion: 2,
                textAlign: "text-end",
                value: itemPrice,
                id: item.itemId,
              }}
              readOnly={readOnly}
            />
          </Box>

          <Box>
            <Typography 
              variant="caption" 
              sx={{ 
                color: '#667eea', 
                fontWeight: 700, 
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontSize: '0.7rem',
                mb: 0.5,
                display: 'block'
              }}
            >
              VAT %
            </Typography>
            <EditableField
              onItemizedItemEdit={(evt) => onItemizedItemEdit(evt, item.itemId)}
              cellData={{
                type: "number",
                name: "itemTaxRate",
                min: 0,
                max: 100,
                step: "0.01",
                placeholder: "0",
                value: itemTaxRate,
                id: item.itemId,
                trailing: "%"
              }}
              readOnly={readOnly}
            />
          </Box>
        </Box>

        {/* Total & Delete Button */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          pt: 2,
          borderTop: '1px solid rgba(102, 126, 234, 0.1)'
        }}>
          <Box>
            <Typography 
              variant="caption" 
              sx={{ 
                color: '#718096', 
                fontSize: '0.7rem',
                display: 'block',
                mb: 0.5
              }}
            >
              Item Total
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                color: '#667eea',
                fontWeight: 700,
                fontSize: '1.1rem'
              }}
            >
              {currency}{itemTotal}
            </Typography>
          </Box>

          {!readOnly && (
            <IconButton
              onClick={onDelEventHandler}
              sx={{
                height: 44,
                width: 44,
                backgroundColor: "error.main",
                color: 'white',
                '&:hover': {
                  backgroundColor: "error.dark",
                }
              }}
            >
              <BiTrash size={20} />
            </IconButton>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

const ItemRow = (props) => {
  const onDelEvent = () => {
    props.onDelEvent(props.item);
  };

  // Ensure all numeric values are properly converted to strings to prevent NaN errors
  const itemQuantity = props.item.itemQuantity !== undefined && !isNaN(props.item.itemQuantity) 
    ? props.item.itemQuantity.toString() 
    : "1";
    
  const itemPrice = props.item.itemPrice !== undefined && !isNaN(props.item.itemPrice) 
    ? props.item.itemPrice.toString() 
    : "0.00";

  const itemTaxRate = props.item.itemTaxRate !== undefined && !isNaN(props.item.itemTaxRate)
    ? props.item.itemTaxRate.toString()
    : "0";

  // Calculate line total with VAT
  // Price is GROSS (includes VAT)
  const grossPrice = parseFloat(itemPrice);
  const quantity = parseFloat(itemQuantity);
  const taxRate = parseFloat(itemTaxRate);
  
  // Calculate gross amount first
  const grossAmount = quantity * grossPrice;
  
  // Extract VAT amount from gross price
  // VAT = gross × (taxRate / (100 + taxRate))
  const vatAmount = taxRate > 0 ? (grossAmount * (taxRate / (100 + taxRate))) : 0;
  
  // Line total = gross amount (which user entered)
  const lineTotal = grossAmount.toFixed(2);

  return (
    <TableRow sx={{ 
      '&:hover': { 
        backgroundColor: props.readOnly ? 'transparent' : 'var(--color-background-light)' 
      } 
    }}>
      <TableCell sx={{ width: "100%" }}>
        <EditableField
          onItemizedItemEdit={(evt) =>
            props.onItemizedItemEdit(evt, props.item.itemId)
          }
          cellData={{
            type: "text",
            name: "itemName",
            placeholder: "Item name",
            value: props.item.itemName || "",
            id: props.item.itemId,
            required: true,
          }}
          readOnly={props.readOnly}
        />
        <EditableField
          onItemizedItemEdit={(evt) =>
            props.onItemizedItemEdit(evt, props.item.itemId)
          }
          cellData={{
            type: "text",
            name: "itemDescription",
            placeholder: "Item description (Optional)",
            value: props.item.itemDescription || "",
            id: props.item.itemId,
          }}
          readOnly={props.readOnly}
        />
      </TableCell>
      <TableCell sx={{ minWidth: "80px" }}>
        <EditableField
          onItemizedItemEdit={(evt) =>
            props.onItemizedItemEdit(evt, props.item.itemId)
          }
          cellData={{
            type: "number",
            name: "itemQuantity",
            min: 1,
            step: "1",
            value: itemQuantity,
            id: props.item.itemId,
          }}
          readOnly={props.readOnly}
        />
      </TableCell>
      <TableCell sx={{ minWidth: "180px" }}>
        <EditableField
          onItemizedItemEdit={(evt) =>
            props.onItemizedItemEdit(evt, props.item.itemId)
          }
          cellData={{
            leading: props.currency,
            type: "number",
            name: "itemPrice",
            min: 0,
            step: "0.01",
            presicion: 2,
            textAlign: "text-end",
            value: itemPrice,
            id: props.item.itemId,
          }}
          readOnly={props.readOnly}
        />
      </TableCell>
      <TableCell sx={{ minWidth: "100px" }}>
        <EditableField
          onItemizedItemEdit={(evt) =>
            props.onItemizedItemEdit(evt, props.item.itemId)
          }
          cellData={{
            type: "number",
            name: "itemTaxRate",
            min: 0,
            max: 100,
            step: "0.01",
            placeholder: "0",
            value: itemTaxRate,
            id: props.item.itemId,
            trailing: "%"
          }}
          readOnly={props.readOnly}
        />
      </TableCell>
      <TableCell sx={{ minWidth: "120px", fontWeight: 600, color: '#2d3748' }}>
        {props.currency}{lineTotal}
      </TableCell>
      {!props.readOnly && (
        <TableCell align="center" sx={{ minWidth: "50px" }}>
          <IconButton
            onClick={onDelEvent}
            sx={{
              height: "33px",
              width: "33px",
              p: "7.5px",
              backgroundColor: "error.main"
            }}
          >
            <BiTrash style={{ color: "white" }} />
          </IconButton>
        </TableCell>
      )}
    </TableRow>
  );
};

export default InvoiceItem;
