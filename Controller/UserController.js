import asyncHandler from 'express-async-handler';
import User from '../Models/UserModels.js';
import bcrypt from 'bcryptjs';
import { generateToken } from '../Middleware/Auth.js';
import jwt from 'jsonwebtoken';
import Product from '../Models/ProductModels.js';
import mongoose from 'mongoose';
import { DataUser } from '../Data/DataUser.js';
/* USER CONTROLLERS */

const importUser = asyncHandler(async (req, res) => {
  await User.deleteMany({});
  const users = await User.insertMany(DataUser);
  res.status(201).json(users);
});






// Api register user - DONE
const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email,  password, phoneNumber,address, images} = req.body;
  
  try {
    const userExits = await User.findOne({ email });
    // check if user already exists
    if (userExits) {
      res.status(400);
      throw new Error(
        'Email already exists, please register with another email address'
      );
    }

    // create new user in MongoDB without hashing the password
    const user = await User.create({
      _id: new mongoose.Types.ObjectId(),
      fullName,
      email,
      phoneNumber,
      address,
      password, // Here, the password is stored as plain text
      images,
    });

    // if create user successfully, send user token to client
    if (user) {
      res.status(201).json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        address: user.address,
        images: user.images,
        role: user.role,
        isSeller: user.isSeller,
        sellerStatus: user.sellerStatus,
        likedProduct: user.likedProduct,
        token: generateToken(user._id),
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Api login user - DONE
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user && user.password === password) {
      res.status(200).json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        address: user.address,
        images: user.images,
        role: user.role,
        isSeller: user.isSeller,
        sellerStatus: user.sellerStatus,
        likedProduct: user.likedProduct,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid username or password' });
    }
  } catch (error) {
    res.status(400).json({ message: 'Error: ' + error.message });
  }
});

// Api update profile- DONE

const updateProfileUser = asyncHandler(async (req, res) => {
  const { fullName, phoneNumber, address, images } = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      user.fullName = fullName || user.fullName;
      user.phoneNumber = phoneNumber || user.phoneNumber;
      user.address = address || user.address;
      user.images = images || user.images;
      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        phoneNumber: updatedUser.phoneNumber,
        address: updatedUser.address,
        images: updatedUser.images,
        role: updatedUser.role,
        isSeller: user.isSeller,
        sellerStatus: user.sellerStatus,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Api change password - DONE
const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  try {
    const user = await User.findById(req.user._id);
    /* console.log('user', user); */
    if (user && user.password === oldPassword) {
      // Kiểm tra mật khẩu cũ trùng khớp
      user.password = newPassword; // Gán mật khẩu mới trực tiếp vào user object
      await user.save();
      res.json({ message: 'Password changed' });
    } else {
      res.status(401);
      throw new Error('Invalid old password');
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
// API convert role
const convertRoleUsertoSeller = asyncHandler(async (req, res) => {
  try {
    const userId = req.params.id;

    // Kiểm tra xem người dùng hiện tại có quyền truy cập vào người dùng khác hay không
    /*  if (req.user._id.toString() !== userId) {
      res
        .status(403)
        .json({ message: 'You do not have permission to perform this action' });
      return;
    }
 */
    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (user.role !== 'user') {
      res.status(400).json({ message: 'User is already a seller' });
      return;
    }

    user.role = 'seller';
    user.isSeller = true;
    user.sellerStatus = 'approved';
    await user.save();

    res.status(200).json({ message: 'User role converted to seller' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});
// api get infor user --DONE
const getUserById = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Lấy danh sách sản phẩm có sellerId trùng với userId
    const products = await Product.find({ sellerId: userId });

    res.status(200).json({ user, products });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ADMIN ROLE -- DONE
const deleteUser = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    } else {
      if(user.role === "admin"){
        res.status(400).send({ message: 'Can Not Delete Admin Account' });
        return;
      }

      
        await user.remove();
        res.json({ message: 'User removed successfully' });
    }
    
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const convertRoleSellerToUser = asyncHandler(async (req, res) => {
  try {
    const userId = req.params.id;

    // Kiểm tra xem người dùng hiện tại có quyền truy cập vào người dùng khác hay không
    /*  if (req.user._id.toString() !== userId) {
      res
        .status(403)
        .json({ message: 'You do not have permission to perform this action' });
      return;
    }
 */
    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (user.role !== 'seller') {
      res.status(400).json({ message: 'UserId is already a user' });
      return;
    }

    user.role = 'user';
    user.isSeller = false;
    user.sellerStatus = 'pending';
    await user.save();

    res.status(200).json({ message: 'Seller role converted to user' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// SELLER ROLES
// get all products by sellerId -DONE

const getProductsBySellerId = asyncHandler(async (req, res) => {
  const userId = req.user.id; // Lấy ID của người dùng đã đăng nhập từ thông tin xác thực

  try {
    // Truy vấn cơ sở dữ liệu để lấy danh sách các sản phẩm được tạo bởi người dùng đăng nhập
    const products = await Product.find({ sellerId: userId });

    // Kiểm tra nếu không có sản phẩm nào được tạo bởi người dùng đăng nhập
    if (products.length === 0) {
      return res.status(404).json({
        message:
          'Không tìm thấy sản phẩm nào được tạo bởi người dùng đăng nhập.',
      });
    }

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách sản phẩm.' });
  }
});

// api like product list - DONE
const addLikedProduct = asyncHandler(async (req, res) => {
  const { productId } = req.body;

  try {
    // Tìm người dùng bằng id
    const user = await User.findById(req.user._id);
    /* console.log('user: ' + user); */
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Kiểm tra xem sản phẩm đã có trong danh sách yêu thích chưa
    if (user.likedProduct.includes(productId)) {
      return res.status(400).json({ message: 'Product already liked' });
    }

    // Thêm sản phẩm vào danh sách yêu thích
    user.likedProduct.push(productId);
    await user.save();

    res.status(200).json({ message: 'Product added to liked list' });
  } catch (error) {
    console.log('error', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// api delete liked product -DONE
const deleteLikedProduct = asyncHandler(async (req, res) => {
  const { productId } = req.body;

  try {
    // Tìm người dùng bằng id
    const user = await User.findById(req.user._id);
    /* console.log('user: ' + user); */
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Kiểm tra xem sản phẩm có trong danh sách yêu thích không
    const likedProductIndex = user.likedProduct.indexOf(productId);
    if (likedProductIndex === -1) {
      return res.status(400).json({ message: 'Product is not liked yet' });
    }

    // Xóa sản phẩm khỏi danh sách yêu thích
    user.likedProduct.splice(likedProductIndex, 1);
    await user.save();

    res.status(200).json({ message: 'Product removed from liked list' });
  } catch (error) {
    console.log('error', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
const PAGE_SIZE = 12;
const getAllUser = asyncHandler(async (req, res) => {
  try{
    const { query } = req;
    const page = query.page || 1;
    const pageSize = query.pageSize || PAGE_SIZE;
    const users = await User.find()
      .skip(pageSize * (page - 1))
      .limit(pageSize);
      const countUsers = await User.countDocuments();
    res.send({
      users,
      countUsers,
      page,
      pages: Math.ceil(countUsers / pageSize),
    })
   
  }catch(error){
    res.status(500).json({ message: 'Internal server error' });
    
    
  }
})

const getSellerById = asyncHandler(async (req, res) => {
  try{
    
    const user = await User.findById(req.params.id)
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.status(200).json( user );
  }catch(error){
    res.status(500).json({ message: 'Internal server error' });
    
    
  }
})




export {
  importUser,
  registerUser,
  loginUser,
  updateProfileUser,
  changePassword,
  convertRoleUsertoSeller,
  deleteUser,
  getUserById,
  convertRoleSellerToUser,
  getProductsBySellerId,
  addLikedProduct,
  deleteLikedProduct,
  getAllUser,
  getSellerById
};
