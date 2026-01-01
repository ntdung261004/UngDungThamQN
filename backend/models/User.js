const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['canbo', 'relative'], required: true },
  
  // Các trường định danh đơn vị
  rootCode: { type: String, required: true }, 
  unitCode: { type: String, required: true }, // Tên đơn vị (VD: Trung đội 5)
  unitPath: { type: String, required: true }, 

  // QUAN TRỌNG: Phải khai báo ở đây để MongoDB chấp nhận dữ liệu
  isAdmin: { type: Boolean, default: false }, 
  isApproved: { type: Boolean, default: false }, 

  isVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// Đảm bảo SĐT duy nhất trong cùng 1 đơn vị gốc
UserSchema.index({ phone: 1, rootCode: 1 }, { unique: true });

module.exports = mongoose.model('User', UserSchema);