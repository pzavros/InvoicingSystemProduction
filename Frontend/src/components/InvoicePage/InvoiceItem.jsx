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
  Box 
} from "@mui/material";
import { BiTrash } from "react-icons/bi";
import InventoryIcon from '@mui/icons-material/Inventory';
import EditableField from "./EditableField";
import ProductSelectorDialog from "./ProductSelectorDialog";

const InvoiceItem = (props) => {
  const { onItemizedItemEdit, currency, onRowDel, items, onRowAdd, readOnly = false, onProductAdd } = props;
  const [productSelectorOpen, setProductSelectorOpen] = useState(false);

  const itemTable = items.map((item) => (
    <ItemRow
      key={item.itemId}
      item={item}
      onDelEvent={onRowDel}
      onItemizedItemEdit={onItemizedItemEdit}
      currency={currency}
      readOnly={readOnly}
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
      </TableContainer>      {!readOnly && (
        <Box sx={{ 
          mt: 3, 
          display: 'flex', 
          gap: 2, 
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          <Button 
            variant="contained" 
            onClick={onRowAdd} 
            sx={{ 
              fontWeight: 600,
              borderRadius: '12px',
              px: 3,
              py: 1.5,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              textTransform: 'none',
              fontSize: '0.95rem',
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
            sx={{ 
              fontWeight: 600,
              borderRadius: '12px',
              px: 3,
              py: 1.5,
              borderColor: "#667eea",
              color: "#667eea",
              textTransform: 'none',
              fontSize: '0.95rem',
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
