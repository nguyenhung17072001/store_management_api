const adminMiddleware = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res
      .status(403)
      .json({ message: 'You do not have permission to access this feature' });
  }

  // Nếu người dùng có vai trò là 'admin', tiếp tục thực hiện các xử lý tiếp theo
  next();
};

export default adminMiddleware;
