import asyncHandler from 'express-async-handler';
import Product from '../models/Product.js';

// @desc    Get cart items
// @route   GET /api/cart
// @access  Private/Guest
const getCart = asyncHandler(async (req, res) => {
  let cartItems = [];
  
  if (req.user) {
    // Get cart from user document
    const user = await req.user.populate('cart.product');
    cartItems = user.cart;
  } else {
    // Get cart from session or local storage (handled by frontend)
    // For guest users, cart is managed on frontend
    cartItems = req.body.cartItems || [];
    
    // Populate product details for guest cart
    const populatedCart = await Promise.all(
      cartItems.map(async (item) => {
        const product = await Product.findById(item.product);
        return {
          product: product,
          quantity: item.quantity,
          variant: item.variant,
        };
      })
    );
    cartItems = populatedCart;
  }

  // Calculate totals
  const cartTotal = cartItems.reduce((acc, item) => {
    const price = item.product.discountPrice > 0 
      ? item.product.discountPrice 
      : item.product.price;
    return acc + (price * item.quantity);
  }, 0);

  const itemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  res.json({
    cartItems,
    cartTotal,
    itemsCount,
  });
});

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private/Guest
const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1, variant } = req.body;

  const product = await Product.findById(productId);
  
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  if (product.stock < quantity) {
    res.status(400);
    throw new Error('Insufficient stock');
  }

  if (req.user) {
    // Add to user's cart in database
    const user = req.user;
    const existingItemIndex = user.cart.findIndex(
      (item) => 
        item.product.toString() === productId && 
        item.variant === variant
    );

    if (existingItemIndex > -1) {
      user.cart[existingItemIndex].quantity += quantity;
    } else {
      user.cart.push({
        product: productId,
        quantity,
        variant,
      });
    }

    await user.save();
    res.json(user.cart);
  } else {
    // For guest users, return the cart item
    const cartItem = {
      product,
      quantity,
      variant,
    };
    res.json([cartItem]);
  }
});

// @desc    Update cart item quantity
// @route   PUT /api/cart/:itemId
// @access  Private/Guest
const updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;

  if (req.user) {
    const user = req.user;
    const itemIndex = user.cart.findIndex(
      (item) => item._id.toString() === req.params.itemId
    );

    if (itemIndex > -1) {
      const product = await Product.findById(user.cart[itemIndex].product);
      
      if (product.stock < quantity) {
        res.status(400);
        throw new Error('Insufficient stock');
      }

      user.cart[itemIndex].quantity = quantity;
      await user.save();
      res.json(user.cart);
    } else {
      res.status(404);
      throw new Error('Cart item not found');
    }
  } else {
    // For guest users, handled by frontend
    res.json({ message: 'Cart updated' });
  }
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/:itemId
// @access  Private/Guest
const removeFromCart = asyncHandler(async (req, res) => {
  if (req.user) {
    const user = req.user;
    user.cart = user.cart.filter(
      (item) => item._id.toString() !== req.params.itemId
    );
    await user.save();
    res.json(user.cart);
  } else {
    // For guest users, handled by frontend
    res.json({ message: 'Item removed' });
  }
});

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private/Guest
const clearCart = asyncHandler(async (req, res) => {
  if (req.user) {
    req.user.cart = [];
    await req.user.save();
  }
  res.json({ message: 'Cart cleared' });
});

// @desc    Sync guest cart with user cart after login
// @route   POST /api/cart/sync
// @access  Private
const syncCart = asyncHandler(async (req, res) => {
  const { guestCart } = req.body;
  
  if (!guestCart || !guestCart.length) {
    res.json(req.user.cart);
    return;
  }

  const user = req.user;

  // Merge guest cart with user cart
  for (const guestItem of guestCart) {
    const existingItemIndex = user.cart.findIndex(
      (item) => 
        item.product.toString() === guestItem.product &&
        item.variant === guestItem.variant
    );

    if (existingItemIndex > -1) {
      user.cart[existingItemIndex].quantity += guestItem.quantity;
    } else {
      user.cart.push({
        product: guestItem.product,
        quantity: guestItem.quantity,
        variant: guestItem.variant,
      });
    }
  }

  await user.save();
  res.json(user.cart);
});

export {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  syncCart,
};