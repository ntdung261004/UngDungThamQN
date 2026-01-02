const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// --- API ĐĂNG KÝ (Đã khôi phục đầy đủ) ---
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
        console.error("Lỗi đăng ký:", err);
        res.status(500).json({ message: "Lỗi hệ thống đăng ký" });
    }
});

// --- API ĐĂNG NHẬP (Đã tối ưu trả về Profile) ---
router.post('/login', async (req, res) => {
    try {
        const { rootCode, phone, password } = req.body;
        const user = await User.findOne({ rootCode, phone });
        if (!user) return res.status(400).json({ message: "Mã đơn vị hoặc SĐT không chính xác!" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Mật khẩu không chính xác!" });

        const payload = { user: { id: user.id } };
        jwt.sign(payload, process.env.JWT_SECRET || "secret", { expiresIn: '7d' }, (err, token) => {
            if (err) throw err;
            res.json({
                token,
                user: {
                    id: user._id,
                    fullName: user.fullName,
                    role: user.role,
                    rootCode: user.rootCode,
                    unitCode: user.unitCode,
                    unitPath: user.unitPath,
                    rank: user.rank || "",
                    position: user.position || "",
                    isAdmin: user.isAdmin,
                    isApproved: user.isApproved,
                    isProfileUpdated: user.isProfileUpdated
                }
            });
        });
    } catch (err) {
        res.status(500).json({ message: "Lỗi server" });
    }
});

// --- API CẬP NHẬT HỒ SƠ (Đã khôi phục) ---
router.put('/update-profile', async (req, res) => {
    try {
        const { userId, fullName, rank, position, unitCode } = req.body;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });

        user.fullName = fullName || user.fullName;
        user.rank = rank || "";
        user.position = position || "";
        user.unitCode = unitCode || user.unitCode;
        user.isProfileUpdated = true;

        await user.save();
        res.json({ message: "Cập nhật thành công!", user });
    } catch (err) {
        res.status(500).json({ message: "Lỗi cập nhật hồ sơ" });
    }
});

router.get('/pending-officers/:userId', async (req, res) => {
    try {
        const currentUser = await User.findById(req.params.userId);
        if (!currentUser) return res.status(404).json({ message: "Không tìm thấy user" });

        let filter = { 
            rootCode: currentUser.rootCode, 
            role: 'canbo', 
            _id: { $ne: currentUser._id } 
        };

        // Nếu KHÔNG PHẢI admin tối cao của rootCode, thì mới lọc theo nhánh đơn vị
        if (!currentUser.isAdmin) {
            filter.unitPath = new RegExp(currentUser.unitPath, 'i'); 
        }

        const pending = await User.find({ ...filter, isApproved: false }).sort({ createdAt: -1 });
        const approved = await User.find({ ...filter, isApproved: true }).sort({ createdAt: -1 });

        res.json({ pending, approved });
    } catch (err) { res.status(500).json({ message: "Lỗi lấy danh sách" }); }
});

// --- API PHÊ DUYỆT ---
router.put('/approve-officer/:id', async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.params.id, { isApproved: true });
        res.json({ message: "Thành công" });
    } catch (err) { res.status(500).json({ message: "Lỗi" }); }
});

// --- API UPDATE PROFILE ---
router.put('/update-profile', async (req, res) => {
    try {
        const { userId, fullName, rank, position, unitCode } = req.body;
        const user = await User.findByIdAndUpdate(userId, {
            fullName, rank, position, unitCode, isProfileUpdated: true
        }, { new: true });
        res.json({ message: "Cập nhật thành công", user: { ...user._doc, id: user._id } });
    } catch (err) { res.status(500).json({ message: "Lỗi cập nhật" }); }
});

// --- API SỐ LIỆU TỔNG QUAN ---
router.get('/overview-stats/:userId', async (req, res) => {
    try {
        const currentUser = await User.findById(req.params.userId);
        if (!currentUser) return res.status(404).json({ message: "Không tìm thấy user" });

        // Logic Phả hệ: Admin rootCode thấy tất cả. Cán bộ thường thấy theo nhánh unitPath.
        let hierarchyFilter = { rootCode: currentUser.rootCode };
        if (!currentUser.isAdmin) {
            hierarchyFilter.unitPath = new RegExp(currentUser.unitPath, 'i');
        }

        const totalOfficers = await User.countDocuments({ ...hierarchyFilter, role: 'canbo', isApproved: true });
        const totalRelatives = await User.countDocuments({ ...hierarchyFilter, role: 'relative' });
        const pendingApprovals = await User.countDocuments({ ...hierarchyFilter, role: 'canbo', isApproved: false });

        res.json({
            totalOfficers,
            totalRelatives,
            totalSoldiers: 120, // Tạm thời giả lập
            pendingApprovals
        });
    } catch (err) {
        res.status(500).json({ message: "Lỗi lấy số liệu" });
    }
});

// --- API TẠO CHIẾN SĨ ---
router.post('/soldiers', async (req, res) => {
    try {
        const { fullName, soldierId, rank, position, unitCode, unitPath, phoneRelative, dob, enlistDate, address, rootCode, avatar } = req.body;

        // phoneRelative bắt buộc để liên kết người nhà với chiến sĩ
        if (!phoneRelative) return res.status(400).json({ message: 'Số điện thoại người nhà (phoneRelative) là bắt buộc.' });

        // Kiểm tra xem đã có phone + rootCode trùng không
        const existing = await User.findOne({ phone: phoneRelative, rootCode: rootCode || '' });
        if (existing) return res.status(400).json({ message: 'Số điện thoại này đã được sử dụng trong đơn vị.' });

        const newSoldier = new User({
            fullName,
            phone: phoneRelative,
            password: 'changeme', // mật khẩu tạm thời, không dùng để login
            role: 'soldier',
            rootCode: rootCode || '',
            unitCode: unitCode || '',
            unitPath: unitPath || '',
            isAdmin: false,
            isApproved: true, // tự động duyệt khi thêm bằng tài khoản quản lý

            rank: rank || '',
            position: position || '',
            soldierId: soldierId || '',
            phoneRelative: phoneRelative || '',
            dob: dob ? new Date(dob) : null,
            enlistDate: enlistDate ? new Date(enlistDate) : null,
            address: address || '',
            avatar: avatar || '',
            isProfileUpdated: true
        });

        await newSoldier.save();
        res.status(200).json({ message: 'Thêm chiến sĩ thành công', soldier: newSoldier });
    } catch (err) {
        console.error('Lỗi thêm chiến sĩ:', err);
        // Nếu duplicate key do index phone+rootCode
        if (err.code === 11000) {
            return res.status(400).json({ message: 'Dữ liệu trùng (số điện thoại đã tồn tại).' });
        }
        res.status(500).json({ message: 'Lỗi server khi thêm chiến sĩ' });
    }
});

// GET: danh sách chiến sĩ theo user
router.get('/soldiers/:userId', async (req, res) => {
    try {
        const currentUser = await User.findById(req.params.userId);
        if (!currentUser) return res.status(404).json({ message: 'Không tìm thấy user' });

        let filter = { rootCode: currentUser.rootCode, role: 'soldier' };
        if (!currentUser.isAdmin) {
            filter.unitPath = new RegExp(currentUser.unitPath, 'i');
        }

        const soldiers = await User.find(filter).sort({ createdAt: -1 });
        res.json({ soldiers });
    } catch (err) {
        console.error('Lỗi lấy danh sách chiến sĩ:', err);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

module.exports = router;