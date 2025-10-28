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
                  📦 ITEM
                </TableCell>
                <TableCell sx={{ 
                  color: '#2d3748', 
                  fontWeight: 700, 
                  minWidth: '100px',
                  fontSize: '0.95rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  📊 QTY
                </TableCell>
                <TableCell sx={{ 
                  color: '#2d3748', 
                  fontWeight: 700, 
                  minWidth: '150px',
                  fontSize: '0.95rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  💰 PRICE/RATE
                </TableCell>
                {!readOnly && (
                  <TableCell align="center" sx={{ 
                    color: '#2d3748', 
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    ⚡ ACTION
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
              fontWeight: 600,
              borderRadius: '12px',
              px: 3,
              py: 1.5,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              textTransform: 'none',
              fontSize: { xs: '0.875rem', sm: '0.95rem' },
              transition: 'all 0.3s ease',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 30px rgba(102, 126, 234, 0.4)'
              }
            }}
          >
            ➕ Add Custom Item
          </Button>
          
          <Button 
            variant="outlined" 
            onClick={() => setProductSelectorOpen(true)}
            startIcon={<InventoryIcon />}
            fullWidth={isMobile}
            sx={{ 
              fontWeight: 600,
              borderRadius: '12px',
              px: 3,
              py: 1.5,
              borderColor: "#667eea",
              color: "#667eea",
              textTransform: 'none',
              fontSize: { xs: '0.875rem', sm: '0.95rem' },
              border: '2px solid #667eea',
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: "rgba(102, 126, 234, 0.1)",
                borderColor: "#667eea",
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)'
              }
            }}
          >
            📚 Add from Catalog
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

  const itemTotal = (parseFloat(itemQuantity) * parseFloat(itemPrice)).toFixed(2);

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
            📦 Item
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

        {/* Quantity & Price in Grid */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
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
              📊 Quantity
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
              💰 Price/Rate
            </Typography>
            <EditableField
              onItemizedItemEdit={(evt) => onItemizedItemEdit(evt, item.itemId)}
              cellData={{
                leading: currency,
                type: "number",
                name: "itemPrice",
                min: 1,
                step: "0.01",
                presicion: 2,
                textAlign: "text-end",
                value: itemPrice,
                id: item.itemId,
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
      <TableCell sx={{ minWidth: "100px" }}>
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
      <TableCell sx={{ minWidth: "150px" }}>
        <EditableField
          onItemizedItemEdit={(evt) =>
            props.onItemizedItemEdit(evt, props.item.itemId)
          }
          cellData={{
            leading: props.currency,
            type: "number",
            name: "itemPrice",
            min: 1,
            step: "0.01",
            presicion: 2,
            textAlign: "text-end",
            value: itemPrice,
            id: props.item.itemId,
          }}
          readOnly={props.readOnly}
        />
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
