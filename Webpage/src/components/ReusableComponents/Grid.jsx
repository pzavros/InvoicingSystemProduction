import { Box } from '@mui/material';

const Grid = ({ 
  children, 
  columns = { xs: 1, sm: 2, lg: 3 }, 
  gap = 4,
  sx = {}
}) => {
  // Convert columns object to CSS grid template
  const getGridColumns = (cols) => {
    if (typeof cols === 'number') {
      return `repeat(${cols}, 1fr)`;
    }
    return cols;
  };

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: getGridColumns(columns.xs || 1),
          sm: getGridColumns(columns.sm || columns.xs || 1),
          md: getGridColumns(columns.md || columns.sm || columns.xs || 1),
          lg: getGridColumns(columns.lg || columns.md || columns.sm || columns.xs || 1),
          xl: getGridColumns(columns.xl || columns.lg || columns.md || columns.sm || columns.xs || 1)
        },
        gap: gap,
        ...sx
      }}
    >
      {children}
    </Box>
  );
};

export default Grid;
