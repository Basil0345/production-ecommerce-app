import express from 'express';
import { isAdmin, requireSignIn } from './../middlewares/authMiddleware.js';
import { createProductController, getProductController, getSingleProductController, deleteProductController, productPhotoController, updateProductController, productFiltersController, productCountController, productListController, searchProductController, relatedProductController, productCategoryController, braintreeTokenController, braintreePaymentController } from './../controllers/productController.js';
import formidableMiddleware from 'express-formidable'

const router = express.Router();

//Routes

//Create product
router.post("/create-product", requireSignIn, isAdmin, formidableMiddleware(), createProductController);

//update product
router.put("/update-product/:pid", requireSignIn, isAdmin, formidableMiddleware(), updateProductController);

//get product
router.get("/get-product", getProductController);

//single product
router.get("/get-product/:slug", getSingleProductController);

//get photo
router.get("/product-photo/:pid", productPhotoController);

//delete product
router.delete("/delete-product/:pid", deleteProductController);

//filter product
router.post("/product-filter", productFiltersController);

//product count 
router.get("/product-count", productCountController);

//product per page
router.get("/product-list/:page", productListController);

//search product
router.get("/search/:keyword", searchProductController);

//similar product
router.get("/related-product/:pid/:cid", relatedProductController);

//category wise product
router.get("/product-category/:slug", productCategoryController);

//payments route
//token
router.get("/braintree/token", braintreeTokenController);

//payments
router.post("/braintree/payment", requireSignIn, braintreePaymentController);


export default router;