const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// --- API ĐĂNG KÝ ---
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
        console.error(err);
        res.status(500).json({ message: "Lỗi hệ thống đăng ký" });
    }
});

// --- API ĐĂNG NHẬP ---
router.post('/login', async (req, res) => {
    try {
        const { rootCode, phone, password } = req.body;

        const user = await User.findOne({ rootCode, phone });
        if (!user) return res.status(400).json({ message: "Mã đơn vị hoặc SĐT không chính xác!" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Mật khẩu không chính xác!" });

        const payload = { user: { id: user.id } };
        jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' }, (err, token) => {
            if (err) throw err;
            res.json({
                message: "Đăng nhập thành công!",
                token,
                user: {
                    id: user._id, // Trả về id để Frontend lưu vào máy
                    fullName: user.fullName,
                    role: user.role,
                    rootCode: user.rootCode,
                    isAdmin: user.isAdmin,
                    isApproved: user.isApproved,
                    isProfileUpdated: user.isProfileUpdated,
                    unitCode: user.unitCode
                }
            });
        });
    } catch (err) {
        res.status(500).json({ message: "Lỗi server" });
    }
});

// --- API CẬP NHẬT HỒ SƠ ---
router.put('/update-profile', async (req, res) => {
    try {
        const { userId, fullName, rank, position, unitCode } = req.body;

        if (!userId) {
            return res.status(400).json({ message: "Thiếu ID người dùng" });
        }

        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ message: "Không tìm thấy người dùng" });
        }

        user.fullName = fullName || user.fullName;
        user.rank = rank || "";
        user.position = position || "";
        user.unitCode = unitCode || user.unitCode;
        user.isProfileUpdated = true;

        await user.save();

        res.json({
            message: "Cập nhật hồ sơ thành công!",
            user: {
                id: user._id,
                fullName: user.fullName,
                role: user.role,
                rootCode: user.rootCode,
                isAdmin: user.isAdmin,
                isApproved: user.isApproved,
                isProfileUpdated: user.isProfileUpdated,
                unitCode: user.unitCode,
                rank: user.rank,
                position: user.position
            }
        });
    } catch (err) {
        console.error("Lỗi Update Profile:", err);
        res.status(500).json({ message: "Lỗi hệ thống khi cập nhật hồ sơ" });
    }
});

// --- API LẤY SỐ LIỆU TỔNG QUAN THEO PHÂN CẤP ---
router.get('/overview-stats/:userId', async (req, res) => {
    try {
        const currentUser = await User.findById(req.params.userId);
        if (!currentUser) return res.status(404).json({ message: "Không tìm thấy user" });

        // Tạo filter dựa trên phân cấp: Tìm tất cả user có unitPath bắt đầu bằng path của cán bộ này
        // Ví dụ: cán bộ d6 sẽ tìm các path "d6", "d6-e1", "d6-e1-c1"...
        const hierarchyFilter = { 
            rootCode: currentUser.rootCode,
            unitPath: new RegExp(`^${currentUser.unitPath}`) 
        };

        // 1. Tổng số cán bộ trong phân cấp
        const totalOfficers = await User.countDocuments({ 
            ...hierarchyFilter, 
            role: 'canbo' 
        });

        // 2. Tổng số thân nhân đã đăng ký
        const totalRelatives = await User.countDocuments({ 
            ...hierarchyFilter, 
            role: 'relative' 
        });

        // 3. Giả lập số lượng chiến sĩ (Vì hiện tại bạn chưa làm bảng Soldier)
        // Sau này khi có bảng Soldiers, bạn sẽ count theo unitPath tương tự
        const totalSoldiers = 150; // Tạm thời để số cứng hoặc logic giả lập

        res.json({
            totalOfficers,
            totalRelatives,
            totalSoldiers,
            pendingApprovals: 5 // Giả lập số mục mới cần xử lý
        });
    } catch (err) {
        res.status(500).json({ message: "Lỗi lấy số liệu tổng quan" });
    }
});

// --- LẤY DANH SÁCH CÁN BỘ THEO PHÂN CẤP ---
router.get('/pending-officers/:userId', async (req, res) => {
    try {
        const currentUser = await User.findById(req.params.userId);
        if (!currentUser) return res.status(404).json({ message: "Không tìm thấy user" });

        // Tìm các cán bộ cùng rootCode, có unitPath nằm trong phân cấp và chưa được duyệt
        const filter = {
            rootCode: currentUser.rootCode,
            role: 'canbo',
            _id: { $ne: currentUser._id }, // Không hiện chính mình
            unitPath: new RegExp(`^${currentUser.unitPath}`)
        };

        const pending = await User.find({ ...filter, isApproved: false }).sort({ createdAt: -1 });
        const approved = await User.find({ ...filter, isApproved: true }).sort({ createdAt: -1 });

        res.json({ pending, approved });
    } catch (err) {
        res.status(500).json({ message: "Lỗi lấy danh sách" });
    }
});

// --- PHÊ DUYỆT CÁN BỘ ---
router.put('/approve-officer/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true });
        res.json({ message: "Đã phê duyệt cán bộ", user });
    } catch (err) {
        res.status(500).json({ message: "Lỗi phê duyệt" });
    }
});

// --- XÓA/TỪ CHỐI CÁN BỘ ---
router.delete('/delete-officer/:id', async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: "Đã xóa tài khoản cán bộ" });
    } catch (err) {
        res.status(500).json({ message: "Lỗi khi xóa" });
    }
});

module.exports = router;