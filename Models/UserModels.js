import mongoose from 'mongoose';

const UserSchema = mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId },
  fullName: {
    type: String,
    required: [true, 'Please fill in your fullname '],
  },
  email: {
    type: String,
    required: [true, 'Please fill in your email'],
    unique: true,
    trim: true,
  },
  phoneNumber: {
    type: String,
    required: [true, 'Please fill in your phone number'],
    unique: true,
  },
  address: {
    type: String,
    // minlength: [5, 'Please fill in your address with at least 10 characters'],
    // maxlength: [200, 'Please fill in s no more 200 characters'],
  },
  password: {
    type: String,
    required: [true, 'Please fill in your password'],
    minlength: [6, 'Password must be at least 6 characters'],
  },
  images: {
    type: String,
  },
  role: {
    type: String,
    enum: ['user', 'seller', 'admin'],
    default: 'user',
  },
  isSeller: {
    type: Boolean,
    default: false,
  },
  sellerStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  likedProduct: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
  ],
},
{
  timestamps: true,
});

export default mongoose.model('User', UserSchema);
