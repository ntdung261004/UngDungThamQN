// ntdung261004/ungdungthamqn/UngDungThamQN-soldier/backend/models/Soldier.js
const mongoose = require('mongoose');

const SoldierSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    rank: { type: String, required: true },
    position: { type: String, required: true }, 
    unitCode: { type: String, required: true },   // Tên đơn vị trực tiếp (VD: a10)
    unitPath: { type: String, required: true },   // Quy cách: a10-b5-c4-d6
    rootCode: { type: String, required: true },
    phoneRelative: { type: String, required: true },
    dob: { type: Date, required: true },
    enlistDate: { type: Date, required: true },
    address: { type: String, required: true },
    avatar: { type: String, default: '' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } 
}, { timestamps: true });

// Index để tìm kiếm nhanh
SoldierSchema.index({ unitPath: 1, rootCode: 1 });

module.exports = mongoose.model('Soldier', SoldierSchema);