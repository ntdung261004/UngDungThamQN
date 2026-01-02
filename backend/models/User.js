const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['canbo', 'relative', 'soldier'], required: true },
  rootCode: { type: String, required: true },
  unitCode: { type: String, required: true },
  unitPath: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  isApproved: { type: Boolean, default: false },

  // --- CÁC TRƯỜNG MỚI BỔ SUNG ---
  rank: { type: String, default: "" },      // Cấp bậc (VD: Thượng úy)
  position: { type: String, default: "" },  // Chức vụ (VD: Đại đội trưởng)
  avatar: { type: String, default: "" },    // Link ảnh đại diện
  isProfileUpdated: { type: Boolean, default: false }, // Đánh dấu đã cập nhật thông tin lần đầu chưa

  // --- Trường dành cho CHIẾN SĨ ---
  soldierId: { type: String, default: "" },      // Mã chiến sĩ/ID nội bộ
  phoneRelative: { type: String, default: "" },  // SĐT người nhà
  dob: { type: Date },                             // Ngày sinh
  enlistDate: { type: Date },                      // Ngày nhập ngũ
  address: { type: String, default: "" },        // Nơi ở

  createdAt: { type: Date, default: Date.now }
});

UserSchema.index({ phone: 1, rootCode: 1 }, { unique: true });
module.exports = mongoose.model('User', UserSchema);