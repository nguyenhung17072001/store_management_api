// sellerMiddleware.js

const sellerMiddleware = (req, res, next) => {
  if (req.user?.role !== 'seller') {
    return res
      .status(403)
      .json({ message: 'You do not have permission to access this feature' });
  }

  // Nếu người dùng có vai trò là 'seller', tiếp tục thực hiện các xử lý tiếp theo
  next();
};

export default sellerMiddleware;
