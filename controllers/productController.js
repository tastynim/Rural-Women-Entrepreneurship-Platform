// controllers/productController.js
const Product = require('../models/product');

// 1. Add a new product
const addProduct = async (req, res) => {
    try {
        // We pull exactly what matches your Thunder Client JSON
        const { name, description, price, category } = req.body;

        const newProduct = new Product({
            name,
            description,
            price,
            category,
            createdBy: req.user.id // Add creator ID from authenticated user
        });

        await newProduct.save();
        res.status(201).json({ message: 'Product added successfully!', product: newProduct });
    } catch (error) {
        // This will print the exact reason to your terminal if it fails again
        console.error("MONGODB ERROR:", error.message); 
        res.status(500).json({ message: 'Failed to add product' });
    }
};

// 2. Get all products
const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find().populate('createdBy', 'name email');
        res.status(200).json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch products' });
    }
};

// 3. Update a product
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, category } = req.body;

        const product = await Product.findById(id);
        
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Update fields
        if (name) product.name = name;
        if (description) product.description = description;
        if (price) product.price = price;
        if (category) product.category = category;

        const updatedProduct = await product.save();
        res.status(200).json({ message: 'Product updated successfully!', product: updatedProduct });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to update product' });
    }
};

// 4. Delete a product
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        
        const product = await Product.findById(id);
        
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        await Product.findByIdAndDelete(id);
        res.status(200).json({ message: 'Product deleted successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to delete product' });
    }
};

module.exports = { addProduct, getAllProducts, updateProduct, deleteProduct };
