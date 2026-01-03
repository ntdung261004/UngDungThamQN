const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Soldier = require('../models/Soldier');

// =============================================================
// PHẦN 1: QUẢN LÝ USER (CÁN BỘ & THÂN NHÂN)
// =============================================================

// --- ĐĂNG KÝ USER ---
router.post('/register', async (req, res) => {
    try {
        const { fullName, phone, password, role, rootCode, unitCode, unitPath } = req.body;
        let user = await User.findOne({ phone, rootCode });
        if (user) return res.status(400).json({ message: "Số điện thoại đã được đăng ký trong đơn vị này!" });

        const newUser = new User({
            fullName, phone, password, role, rootCode, unitCode, unitPath,
            isAdmin: false,
            isApproved: false 
        });

        const salt = await bcrypt.genSalt(10);
        newUser.password = await bcrypt.hash(password, salt);
        await newUser.save();
        res.status(200).json({ message: "Đăng ký thành công! Vui lòng chờ phê duyệt." });
    } catch (err) {
        res.status(500).json({ message: "Lỗi hệ thống đăng ký" });
    }
});

// --- ĐĂNG NHẬP USER ---
router.post('/login', async (req, res) => {
    try {
        const { rootCode, phone, password } = req.body;
        const user = await User.findOne({ rootCode, phone });
        if (!user) return res.status(400).json({ message: "Sai mã đơn vị hoặc SĐT" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Mật khẩu không đúng" });

        const token = jwt.sign({ id: user._id }, "secret", { expiresIn: '7d' });
        res.json({
            token,
            user: {
                id: user._id,
                fullName: user.fullName,
                role: user.role,
                rootCode: user.rootCode,
                unitCode: user.unitCode,
                unitPath: user.unitPath,
                rank: user.rank,
                position: user.position,
                isAdmin: user.isAdmin,
                isApproved: user.isApproved,
                isProfileUpdated: user.isProfileUpdated
            }
        });
    } catch (err) { res.status(500).json({ message: "Lỗi Server" }); }
});

// --- API DANH SÁCH CÁN BỘ CHỜ DUYỆT (Sửa lỗi 404) ---
router.get('/pending-officers/:userId', async (req, res) => {
    try {
        const currentUser = await User.findById(req.params.userId);
        if (!currentUser) return res.status(404).json({ message: "Không tìm thấy người dùng quản lý" });

        let filter = { 
            rootCode: currentUser.rootCode, 
            role: 'canbo', 
            _id: { $ne: currentUser._id } 
        };

        if (!currentUser.isAdmin) {
            filter.unitPath = new RegExp(currentUser.unitPath, 'i'); 
        }

        const pending = await User.find({ ...filter, isApproved: false }).sort({ createdAt: -1 });
        const approved = await User.find({ ...filter, isApproved: true }).sort({ createdAt: -1 });

        res.json({ pending, approved });
    } catch (err) { 
        res.status(500).json({ message: "Lỗi lấy danh sách cán bộ" }); 
    }
});

// --- API PHÊ DUYỆT CÁN BỘ ---
router.put('/approve-officer/:id', async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.params.id, { isApproved: true });
        res.json({ message: "Phê duyệt thành công" });
    } catch (err) { res.status(500).json({ message: "Lỗi phê duyệt" }); }
});

// --- SỐ LIỆU TỔNG QUAN ---
router.get('/overview-stats/:userId', async (req, res) => {
    try {
        const currentUser = await User.findById(req.params.userId);
        if (!currentUser) return res.status(404).json({ message: "Không tìm thấy user" });

        let hierarchyFilter = { rootCode: currentUser.rootCode };
        if (!currentUser.isAdmin) {
            hierarchyFilter.unitPath = new RegExp(currentUser.unitPath, 'i');
        }

        const totalOfficers = await User.countDocuments({ ...hierarchyFilter, role: 'canbo', isApproved: true });
        const totalRelatives = await User.countDocuments({ ...hierarchyFilter, role: 'relative' });
        const pendingApprovals = await User.countDocuments({ ...hierarchyFilter, role: 'canbo', isApproved: false });
        const totalSoldiers = await User.countDocuments({ ...hierarchyFilter, role: 'soldier' });

        res.json({ totalOfficers, totalRelatives, totalSoldiers, pendingApprovals });
    } catch (err) { res.status(500).json({ message: "Lỗi lấy số liệu" }); }
});

// =============================================================
// PHẦN 2: QUẢN LÝ SOLDIER (CHIẾN SĨ)
// =============================================================

router.post('/soldiers', async (req, res) => {
    try {
        const { fullName, rank, position, unitCode, unitPath, rootCode, phoneRelative, dob, enlistDate, address, avatar, createdBy } = req.body;

        // BẮT LỖI: Kiểm tra SĐT người nhà đã tồn tại trong bảng User chưa
        const existingUser = await User.findOne({ phone: phoneRelative });
        if (existingUser) {
            return res.status(400).json({ 
                message: "Số điện thoại này đã được đăng ký bởi một người dùng khác trong hệ thống. Vui lòng nhập số khác!" 
            });
        }

        const newSoldier = new Soldier({
            fullName, rank, position, unitCode, unitPath, rootCode, 
            phoneRelative, dob, enlistDate, address, avatar, createdBy
        });

        await newSoldier.save();
        res.status(200).json({ message: "Thêm chiến sĩ thành công" });
    } catch (err) {
        res.status(500).json({ message: "Lỗi hệ thống: " + err.message });
    }
});

// --- API LẤY DANH SÁCH CHIẾN SĨ (Từ bảng Soldier) ---
router.get('/soldiers/:userId', async (req, res) => {
    try {
        const currentUser = await User.findById(req.params.userId);
        let filter = { rootCode: currentUser.rootCode };
        
        if (!currentUser.isAdmin) {
            filter.unitPath = new RegExp(currentUser.unitPath, 'i');
        }

        const soldiers = await Soldier.find(filter).sort({ createdAt: -1 });
        res.json({ soldiers });
    } catch (err) {
        res.status(500).json({ message: "Lỗi lấy danh sách" });
    }
});

module.exports = router;