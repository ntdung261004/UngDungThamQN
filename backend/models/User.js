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

  // --- CÁC TRƯỜNG DÀNH CHO CÁN BỘ ---
  rank: { type: String, default: "" },      
  position: { type: String, default: "" },  
  avatar: { type: String, default: "" },    
  isProfileUpdated: { type: Boolean, default: false }, 

  // --- CÁC TRƯỜNG DÀNH CHO CHIẾN SĨ / THÂN NHÂN ---
  soldierId: { type: String, default: "" },      // Để link Thân nhân với Chiến sĩ
  phoneRelative: { type: String, default: "" },  
  dob: { type: Date },                             
  enlistDate: { type: Date },                      
  address: { type: String, default: "" },

  // --- [MỚI THÊM] TRƯỜNG RIÊNG CHO THÂN NHÂN ---
  relationship: { type: String, default: "" }    // VD: Bố, Mẹ, Vợ, Anh/Chị
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);