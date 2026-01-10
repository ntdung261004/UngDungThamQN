const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  fullName: { type: String, required: true }, // Đối với người thân, đây sẽ là tên chiến sĩ để dễ quản lý
  phone: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['canbo', 'relative', 'soldier'], required: true },
  rootCode: { type: String, required: true },
  unitCode: { type: String, required: true },
  unitPath: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  isApproved: { type: Boolean, default: false },

  // --- CÁC TRƯỜNG BỔ SUNG ---
  rank: { type: String, default: "" },      
  position: { type: String, default: "" },  
  avatar: { type: String, default: "" },    
  isProfileUpdated: { type: Boolean, default: false }, 

  // --- Trường dành cho CHIẾN SĨ/THÂN NHÂN ---
  soldierId: { type: String, default: "" },      // Liên kết tới _id của bảng Soldier
  phoneRelative: { type: String, default: "" },  
  dob: { type: Date },                             
  enlistDate: { type: Date },                      
  address: { type: String, default: "" },        

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);