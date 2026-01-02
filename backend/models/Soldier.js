// backend/models/Soldier.js
const mongoose = require('mongoose');

const SoldierSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    rank: { type: String, required: true },
    position: { type: String, required: true }, // Chiến sĩ, Tiểu đội trưởng, Khẩu đội trưởng
    unitCode: { type: String, required: true },
    unitPath: { type: String, required: true },
    rootCode: { type: String, required: true },
    phoneRelative: { type: String, required: true }, // Dùng để thân nhân đăng ký sau này
    dob: { type: Date, required: true },
    enlistDate: { type: Date, required: true },
    address: { type: String, required: true },
    avatar: { type: String, default: '' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // ID cán bộ tạo
}, { timestamps: true });

module.exports = mongoose.model('Soldier', SoldierSchema);