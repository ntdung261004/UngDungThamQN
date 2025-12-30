const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phone: { type: String, required: true }, // SĐT có thể trùng ở các Root khác nhau, nhưng nên duy nhất trong cùng 1 Root
  password: { type: String, required: true },
  role: { type: String, enum: ['canbo', 'relative'], required: true },
  
  // MÃ KHÁCH HÀNG (Ví dụ: D6E5F5QK7) - Chìa khóa để vào đúng bản database của đơn vị đó
  rootCode: { type: String, required: true }, 
  
  // MÃ ĐƠN VỊ QUẢN LÝ (Cấp con của Root, ví dụ: c10, b5-c10)
  unitPath: { type: String, required: true }, 
  
  isVerified: { type: Boolean, default: false },
  isApproved: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// Đảm bảo SĐT chỉ là duy nhất bên trong 1 Root Code (Mã đơn vị gốc)
UserSchema.index({ phone: 1, rootCode: 1 }, { unique: true });

module.exports = mongoose.model('User', UserSchema);