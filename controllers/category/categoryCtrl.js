const expressAsyncHandler = require("express-async-handler");
const Category = require("../../model/category/Category");
const validateMongodbId = require("../../utils/validateMongodbID");


// Create a new category
const createCategoryCtrl = expressAsyncHandler( async (req, res) => {
    const { title } = req?.body;
    const { _id } = req?.user;

    try {
        const category = await Category.create({
            user: _id,
            title
        });

        res.json(category);
    } catch (error) {
        res.json(error);
    }
});


// Fetch all the categories
const fetchCategoriesCtrl = expressAsyncHandler( async (req, res) => {
    try {
        const categories = await Category.find({}).populate('user').sort('-createdAt');
        res.json(categories);
    } catch (error) {
        res.json(error);
    }
});


// Fetch a single category
const fetchCategoryCtrl = expressAsyncHandler( async (req, res) => {
    const { id } = req?.params;
    validateMongodbId(id);

    try {
        const category = await Category.findById(id).populate('user');
        if(!category) res.status(500).json('No Category found');
        else res.json(category);
    } catch (error) {
        res.json(error);
    }
});

// Update the category
const updateCategoryCtrl = expressAsyncHandler( async (req, res) => {
    const { id } = req?.params;
    validateMongodbId(id);
    const { title } = req?.body;

    if(!title || !id) throw new Error(`Invalid parameters passed`);
    try {
        const category = await Category.findByIdAndUpdate(id, {
            title
        }, { new: true, runValidators: true });
        if(!category) res.status(500).json('Something went wrong updating category');
        else res.json(category);
    } catch (error) {
        res.json(error);
    }
});
// Delete the category
const deleteCategoryCtrl = expressAsyncHandler( async (req, res) => {
    const { id } = req?.params;
    validateMongodbId(id);

    try {
        const deletedCategory = await Category.findByIdAndDelete(id);
        if(!deletedCategory) {
            res.status(500).json('Something went wrong deleting category');
        } else{
            res.json(deletedCategory);
        }
    } catch (error) {
        res.json(error);
    }
});
module.exports = {
    createCategoryCtrl,
    fetchCategoriesCtrl,
    fetchCategoryCtrl,
    updateCategoryCtrl,
    deleteCategoryCtrl
}