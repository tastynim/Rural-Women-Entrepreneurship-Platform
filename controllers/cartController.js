const Cart = require("../models/Cart");
const Product = require("../models/product");

const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    let cart = await Cart.findOne({ user: req.user.id });

    if (cart) {
      // Update existing cart
      const productIndex = cart.products.findIndex(
        (p) => p.product.toString() === productId,
      );
      if (productIndex > -1) {
        cart.products[productIndex].quantity += quantity || 1;
      } else {
        cart.products.push({ product: productId, quantity: quantity || 1 });
      }
      // Recalculate total price
      cart.totalPrice += product.price * (quantity || 1);
    } else {
      // Create new cart
      cart = new Cart({
        user: req.user.id,
        products: [{ product: productId, quantity: quantity || 1 }],
        totalPrice: product.price * (quantity || 1),
      });
    }

    await cart.save();

    // Return populated cart
    const populatedCart = await Cart.findById(cart._id).populate(
      "products.product",
      "name price category",
    );
    res.status(200).json(populatedCart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate(
      "products.product",
      "name price category",
    );
    if (!cart) {
      return res.json({ products: [], totalPrice: 0 });
    }
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: req.user.id }).populate(
      "products.product",
      "name price category",
    );
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const productIndex = cart.products.findIndex(
      (p) => p.product._id.toString() === productId,
    );
    if (productIndex === -1)
      return res.status(404).json({ message: "Product not in cart" });

    const item = cart.products[productIndex];
    const itemTotal = (item.product.price || 0) * item.quantity;

    cart.products.splice(productIndex, 1);
    cart.totalPrice = Math.max(0, cart.totalPrice - itemTotal);

    await cart.save();

    const updatedCart = await Cart.findById(cart._id).populate(
      "products.product",
      "name price category",
    );
    res.json(updatedCart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const clearCart = async (req, res) => {
  try {
    await Cart.findOneAndDelete({ user: req.user.id });
    res.json({ message: "Cart cleared" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { addToCart, getCart, removeFromCart, clearCart };
