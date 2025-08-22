// src/context/CartProvider.jsx
import React, { useState, useEffect, useRef } from 'react';
import { CartContext } from './cartContext';
import { useAuth } from '../hooks/useAuth';
import authService from '../services/authService.js';

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [shippingInfo, setShippingInfo] = useState({});
  const { isAuthenticated, user } = useAuth();

  // Ref to skip the very first save-to-server after login/load
  const didInitialSave = useRef(false);

  // 1) Load cart from server when user logs in or on page-refresh
  useEffect(() => {
    const loadCart = async () => {
      if (isAuthenticated && user.role !== 'admin') {
        try {
          const response = await authService.getCart();
          if (response.data.success && response.data.cart) {
            const validItems = response.data.cart.filter(item => item.productId);
            const loadedCart = validItems.map(item => ({
              ...item.productId, // full product details
              quantity: item.quantity,
            }));
            setCartItems(loadedCart);
          }
        } catch (error) {
          console.error("Failed to load cart", error);
        }
      } else {
        // not logged in or admin — clear local cart
        setCartItems([]);
      }
    };
    loadCart();
  }, [isAuthenticated, user]);

  // 2) Persist cart to server whenever cartItems changes — but skip the first run
  useEffect(() => {
    // only for real users
    if (!isAuthenticated || user.role === 'admin') return;

    if (!didInitialSave.current) {
      // mark that we’ve now loaded from server and skip this first effect
      didInitialSave.current = true;
      return;
    }

    const cartToSave = cartItems.map(item => ({
      productId: item._id,
      quantity: item.quantity,
    }));

    authService.updateCart(cartToSave)
      .catch(err => console.error("Failed to save cart", err));
  }, [cartItems, isAuthenticated, user]);

  // 3) Cart actions
  const addToCart = (product) => {
    setCartItems(prevItems => {
      const existing = prevItems.find(i => i._id === product._id);
      if (existing) {
        return prevItems.map(i =>
          i._id === product._id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prevItems, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCartItems(prevItems =>
      prevItems.filter(i => i._id !== productId)
    );
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      setCartItems(prevItems =>
        prevItems.map(i =>
          i._id === productId ? { ...i, quantity: newQuantity } : i
        )
      );
    }
  };

  const saveShippingInfo = (data) => {
    setShippingInfo(data);
    // optionally persist to localStorage if desired
  };

  const clearCart = () => {
    setCartItems([]);
    setShippingInfo({});
  };

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    shippingInfo,
    saveShippingInfo,
    clearCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
