      {/* Price History Dialog */}
      {priceHistoryDialogOpen && (
        <ProductPriceHistoryDialog
          open={priceHistoryDialogOpen}
          product={selectedProduct}
          onClose={() => setPriceHistoryDialogOpen(false)}
        />
      )}
    </Box>
  );
};

export default ProductList;
