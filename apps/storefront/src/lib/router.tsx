import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Catalog from '../pages/catalog';
import Product from '../pages/product';
import Cart from '../pages/cart';
import Checkout from '../pages/checkout';
import OrderStatus from '../pages/order-status';

export const AppRouter: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Catalog />} />
      <Route path="/p/:id" element={<Product />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/order/:id" element={<OrderStatus />} />
    </Routes>
  );
};