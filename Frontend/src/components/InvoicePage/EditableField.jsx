import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import { styled } from "@mui/material/styles";
import { Typography } from "@mui/material";

// Custom styled components to use our theme variables
const StyledInputGroup = styled(InputGroup)({
  '& .input-group-text': {
    backgroundColor: 'var(--color-background-light)',
    color: 'var(--color-text-secondary)',
    border: 'none',
  },
  marginTop: '0.25rem',
  marginBottom: '0.25rem',
  flexWrap: 'nowrap',
});

const StyledFormControl = styled(Form.Control)({
  border: '1px solid #d0d0d0',
  color: 'var(--color-text-primary)',
  backgroundColor: 'var(--color-card-background)',
  '&:focus': {
    borderColor: 'var(--color-primary)',
    boxShadow: '0 0 0 0.2rem var(--color-shadow)',
  },
  '&::placeholder': {
    color: 'var(--color-text-secondary)',
    opacity: 0.7,
  },
  '&:disabled': {
    backgroundColor: 'var(--color-background-light)',
    color: 'var(--color-text-primary)',
    opacity: 0.8,
    borderColor: '#e0e0e0',
  },
  // Add styling for number inputs specifically
  '&[type="number"]': {
    appearance: 'textfield',
    '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
      appearance: 'auto'
    }
  },
  // Style for required fields with empty values
  '&:required:invalid': {
    borderColor: 'var(--color-error)', // Use error color for border
  },
  '&:required:focus:invalid': {
    borderColor: 'var(--color-error)', // Keep error color on focus if still invalid
    boxShadow: '0 0 0 0.2rem rgba(255, 0, 0, 0.25)', // Optional: add a red shadow for invalid focused required fields
  }
});

const CurrencyCircle = styled('span')({
  border: '2px solid var(--color-primary)',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '20px',
  height: '20px',
  fontSize: 'small',
});

const ReadOnlyField = styled(Typography)(({ theme }) => ({
  padding: '0.375rem 0',
  color: 'var(--color-text-primary)',
  fontSize: '0.9rem',
  fontWeight: props => props.name === 'itemName' ? '500' : 'normal',
  opacity: props => props.name === 'itemDescription' ? 0.8 : 1,
}));

const EditableField = (props) => {
  // Convert any potential NaN values to empty strings or default values
  // Ensure text fields retain their string values and only handle NaN conversion for numeric fields
  const value = props.cellData.type === 'number' 
    ? (props.cellData.value === undefined || isNaN(props.cellData.value) ? '0' : props.cellData.value.toString())
    : (props.cellData.value === undefined ? '' : props.cellData.value.toString());
  
  // If readOnly is true, render a read-only display instead of input
  if (props.readOnly) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.25rem' }}>
        {props.cellData.leading && (
          <span style={{ marginRight: '4px' }}>{props.cellData.leading}</span>
        )}
        <ReadOnlyField 
          variant="body2"
          name={props.cellData.name}
          sx={{
            textAlign: props.cellData.textAlign === 'text-end' ? 'right' : 'left',
            color: !value && props.cellData.name !== 'itemDescription' ? 'text.disabled' : 'text.primary',
            fontStyle: !value ? 'italic' : 'normal',
          }}
        >
          {value || (props.cellData.name === 'itemDescription' ? '' : 'Not specified')}
        </ReadOnlyField>
      </div>
    );
  }
    
  return (
    <StyledInputGroup>
      {props.cellData.leading != null && (
        <InputGroup.Text>
          <CurrencyCircle>
            {props.cellData.leading}
          </CurrencyCircle>
        </InputGroup.Text>
      )}
      <StyledFormControl
        className={props.cellData.textAlign}
        type={props.cellData.name === 'itemQuantity' || props.cellData.name === 'itemPrice' ? 'number' : props.cellData.type}
        placeholder={props.cellData.placeholder}
        min={props.cellData.min}
        name={props.cellData.name}
        id={props.cellData.id}
        value={value}
        step={props.cellData.step}
        precision={props.cellData.precision}
        aria-label={props.cellData.name}
        onChange={props.onItemizedItemEdit}
        disabled={props.readOnly}
        required={props.cellData.required}
      />
    </StyledInputGroup>
  );
};

export default EditableField;
