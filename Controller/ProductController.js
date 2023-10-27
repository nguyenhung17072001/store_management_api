import mongoose from 'mongoose';
import Product from '../Models/ProductModels.js';
import asyncHandler from 'express-async-handler';

import { DataProduct } from '../Data/DataProduct.js';


const importProduct = asyncHandler(async (req, res) => {
  await Product.deleteMany({});
  const products = await Product.insertMany(DataProduct);
  res.status(201).json(products);
});

// api create product- DONE

const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    category,
    sub_categories,
    description,
    quantity,
    price,
    images,
  } = req.body;

  if (
    !name ||
    !category ||
    !sub_categories ||
    !description ||
    !quantity ||
    !price ||
    !images
  ) {
    return res.status(400).json({ error: 'Missing required field' });
  }

  // create a new product
  const product = new Product({
    name,
    category,
    sub_categories,
    description,
    quantity,
    price,
    images,
    sellerId: req.user.id,
  });
  product
    .save()
    .then(() => {
      res.status(201).json({ message: 'Product created successfully' });
    })
    .catch((error) => {
      res.status(500).json({ error: 'Failed to create product' });
    });
});

// api update infor product -DONE

const updateProduct = asyncHandler(async (req, res) => {
  try {
    const {
      name,
      category,
      sub_categories,
      description,
      quantity,
      price,
      images,
    } = req.body;
    const product = await Product.findById(req.params.id);
    const userId = req.user._id;
    /* console.log('userId: ' + userId); */
    if (product) {
      if (product.sellerId.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('You are not authorized to update this product');
      }

      product.name = name || product.name;
      product.category = category || product.category;
      product.sub_categories = sub_categories || product.sub_categories;
      product.description = description || product.description;
      product.quantity = quantity || product.quantity;
      product.price = price || product.price;
      product.images = images || product.images;
      product.userId = userId;
      const updatedProduct = await product.save();
      res.status(200).json(updatedProduct);
    } else {
      res.status(404);
      throw new Error('Product not found');
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// api delete product -DONE

const deleteProduct = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    // Kiểm tra xem người gửi yêu cầu có phải là người tạo sản phẩm hay không
    if (product.sellerId.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('You do not have permission to delete this product');
    }

    await product.remove();
    res.json({ message: 'Product removed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// api show all product -DONE
const PAGE_SIZE = 12;
const getAllProduct = asyncHandler(async (req, res) => {
  try {
    const { query } = req;
    const page = query.page || 1;
    const pageSize = query.pageSize || PAGE_SIZE;

    const products = await Product.find()
      .skip(pageSize * (page - 1))
      .limit(pageSize);
    const countProducts = await Product.countDocuments();
    res.send({
      products,
      countProducts,
      page,
      pages: Math.ceil(countProducts / pageSize),
    });

    // const product = await Product.find();
    // res.send(product);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

// api create review and comment product - DONE
const createReviewProduct = asyncHandler(async (req, res) => {
  const { rating, comment, images } = req.body;

  console.log(req.body)
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      const alreadyReview = product.comments.find(
        (r) => r.userId.toString() === req.user._id.toString()
      );
      if (alreadyReview) {
        res.status(400);
        throw new Error('You already review this movie');
      }
      // else create a new movie
      const review = {
        userName: req.user.fullName,
        userId: req.user._id,
        userImage: req.user.images,
        rating: Number(rating),
        comment,
        images,
      };
      console.log(review)
      product.comments.push(review);
      product.numberOfReviews = product.comments.length;
      product.rate =
        product.comments.reduce((acc, item) => item.rating + acc, 0) /
        product.comments.length;

      const s = await product.save();
      res.status(201).json({
        message: 'Review addded',
      });
    } else {
      res.status(404);
      throw new Error('Movie not found');
    }
  } catch (error) {
    console.log(error.message)
    res.status(400).json({ message: error.message });
  }
});

// api change rating and comments -DONE

const updateReviewProduct = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      const reviewToUpdate = product.comments.find(
        (r) => r.userId.toString() === req.user._id.toString()
      );
      if (reviewToUpdate) {
        reviewToUpdate.rating = Number(rating);
        reviewToUpdate.comment = comment;

        product.rate =
          product.comments.reduce((acc, item) => item.rating + acc, 0) /
          product.comments.length;

        await product.save();
        res.status(200).json({
          message: 'Đánh giá đã được cập nhật',
        });
      } else {
        res.status(404);
        throw new Error('Không tìm thấy đánh giá');
      }
    } else {
      res.status(404);
      throw new Error('Không tìm thấy sản phẩm');
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// api delete ratings and commment -DONE

const deleteReviewProduct = asyncHandler(async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      const reviewIndex = product.comments.findIndex(
        (r) => r._id.toString() === req.params.reviewId
      );
      if (reviewIndex !== -1) {
        const review = product.comments[reviewIndex];

        // Kiểm tra quyền của người dùng hiện tại
        if (review.userId.toString() !== req.user._id.toString()) {
          res.status(403);
          throw new Error('Bạn không có quyền xóa đánh giá và bình luận này');
        }

        // Tiến hành xóa đánh giá và bình luận
        product.comments.splice(reviewIndex, 1);
        product.numberOfReviews = product.comments.length;

        if (product.comments.length > 0) {
          product.rate =
            product.comments.reduce((acc, item) => item.rating + acc, 0) /
            product.comments.length;
        } else {
          product.rate = 0;
        }

        await product.save();
        res.status(200).json({
          message: 'Đánh giá đã được xóa',
        });
      } else {
        res.status(404);
        throw new Error('Không tìm thấy đánh giá');
      }
    } else {
      res.status(404);
      throw new Error('Không tìm thấy sản phẩm');
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// api get product - DONE
const getProductById = asyncHandler(async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    /*  const targetUrl = 'http://192.168.108.227:5000/receive';
     const dataToSend = {
       obj_id: productId,
     }; */
    if (product) {
      res.json(product);
    } else {
      res.status(404);
      throw new Error('Không tìm thấy sản phẩm');
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//Sort name, price
const sortAllProduct = asyncHandler(async (req, res) => {
  const { name, price } = req.query;

  try {
    const sortOptions = {};
    let projectionOptions = {};

    //let sortPrice = 1,sortName=1;
    if (name === 'desc') {
      sortOptions.name = -1;
      projectionOptions.name = 1;
    } else if (name === 'asc' || name === '') {
      sortOptions.name = 1;
      projectionOptions.name = 1;
    }

    if (price === 'desc') {
      sortOptions.price = -1;
      projectionOptions.price = 1;
    } else if (price === 'asc' || price === '') {
      sortOptions.price = 1;
      projectionOptions.price = 1;
    }
    console.log(sortOptions);
    const products = await Product.find({}, projectionOptions).sort(
      sortOptions
    ); // 1: increase , -1: reduce
    res.status(200).json({
      message: 'Sort Success!!!',
      products,
    });
  } catch (error) {
    res.status(400).json({ message: 'Failed to sort' });
  }
});

//Filter
const filterProduct = asyncHandler(async (req, res) => {
  const { category, minPrice, maxPrice } = req.query;

  try {
    const filterOptions = {};
    if (category) {
      filterOptions.category = category;
    }

    // if (brand_name) {
    //   filterOptions.brand_name = brand_name;
    // }

    if (minPrice) {
      filterOptions.price = { $gte: minPrice };
    }

    // Nếu có tham số maxPrice, thêm điều kiện lọc giá tối đa
    if (maxPrice) {
      if (!filterOptions.price) {
        filterOptions.price = {};
      }
      filterOptions.price.$lte = maxPrice;
    }
    const sortOptions = {};
    console.log(filterOptions)
    const products = await Product.find(filterOptions).sort(sortOptions);

    if (products.length === 0) {
      res.json('No Product');
    }

    res.status(200).json({
      message: 'Filter Success!!!',
      products: products.map((products) => {
        return {
          category: products.category,
          // brand_name: sortedProducts.brand_name,
          price: products.price,
        };
      }),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to filter' });
  }
});

//search
const searchProduct = asyncHandler(async (req, res) => {
  // try {
  //   const { keyword } = req.query;

  //   const searchResult = await Product.find({
  //     $or: [
  //       { name: { $regex: keyword, $options: 'i' } },
  //       { description: { $regex: keyword, $options: 'i' } },
  //     ],
  //   });
  //   // { name: 1 }
  //   res.status(200).json({ error: 'Search success.', searchResult });
  // } catch (error) {
  //   res.status(500).json({ error: 'Failed to search.' });
  // }
  try {
    const { name } = req.query;

    const agg = [
      {
        $match: {
          name: {
            $regex: `^${name}`, // Tìm kiếm các tài liệu có tên chứa 'name'
            $options: 'i', // 'i' để không phân biệt chữ hoa/chữ thường
          },
        },
      },
      {
        $sort: {
          numberOfReviews: -1,
          rate: -1,
          // Sắp xếp theo trường price giảm dần (từ cao đến thấp)
        },
      },
      {
        $limit: 10,
      },
      {
        $project: {
          _id: 1,
          name: 1,
          numberOfReviews: 1,
          rate: 1,
        },
      },
    ];

    const response = await Product.aggregate(agg);

    console.log(response);
    return res.json(response);
  } catch (error) {
    console.log(error);
    return res.json();
  }
});

const adminDeleteProduct = asyncHandler(async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {

      await product.remove();
      res.json({ message: 'Product removed successfully' });

    }

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
})

const getMyProducts = asyncHandler(async (req, res) => {
  try {
    const { query } = req;
    const page = query.page || 1;
    const pageSize = query.pageSize || PAGE_SIZE;
    const products = await Product.find({ sellerId: req.params.id })
      .skip(pageSize * (page - 1))
      .limit(pageSize);
    const countProducts = await Product.countDocuments({ sellerId: req.params.id });
    res.send({
      products,
      countProducts,
      page,
      pages: Math.ceil(countProducts / pageSize),
    })
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
})

const getFilter = asyncHandler(async (req, res) => {
  try {

    const { query } = req;
    const page = query.page || 1;
    const pageSize = query.pageSize || PAGE_SIZE;
    const category = query.category || '';
    const price = query.price || '';
    const rate = query.rate || '';
    const sort = query.sort || '';
    const decodedCategory = decodeURIComponent(category);
    const categoryFilter = category ? { category: decodedCategory } : {};

    const rateFilter =
      rate
        ? {
          rate: {
            $gte: Number(rate.split('-')[0]),
            $lte: Number(rate.split('-')[1]),
          },
        }
        : {};
    const priceFilter =
      price
        ? {
          // 1-50
          price: {
            $gte: Number(price.split('-')[0]),
            $lte: Number(price.split('-')[1]),
          },
        }
        : {};
    const sortOrder = sort === 'lowest'
      ? { price: 1 }
      : sort === 'highest'
        ? { price: -1 } : {};

    const products = await Product.find({

      ...categoryFilter,
      ...priceFilter,
      ...rateFilter,
    })
      .sort(sortOrder)
      .skip(pageSize * (page - 1))
      .limit(pageSize);

    const countProducts = await Product.countDocuments({

      ...categoryFilter,
      ...priceFilter,
      ...rateFilter,
    });
    res.send({
      products,
      countProducts,
      page,
      pages: Math.ceil(countProducts / pageSize),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
})

const test = async (req, res) => {
  try {
    const products = await Product.find({});

    // Loop qua mỗi sản phẩm và thêm trường discount
    for (const product of products) {
      product.discount = req.body.discount;
      product.sold = req.body.sold; // Gán giá trị discount từ request body
      await product.save(); // Lưu lại sản phẩm đã được cập nhật
    }

    res.send("ok");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
};

export {
  importProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getAllProduct,
  createReviewProduct,
  updateReviewProduct,
  deleteReviewProduct,
  getProductById,
  sortAllProduct,
  filterProduct,
  searchProduct,
  adminDeleteProduct,
  getMyProducts,
  getFilter,
  test

  /* showAllProductsSeller, */
};
