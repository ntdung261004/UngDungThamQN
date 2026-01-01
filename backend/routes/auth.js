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

        // Tạo User với mặc định chờ duyệt và không phải admin
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
        jwt.sign(payload, "secret_key", { expiresIn: '7d' }, (err, token) => {
            if (err) throw err;
            // QUAN TRỌNG: Trả về đầy đủ isApproved và isAdmin để Frontend xử lý
            res.json({
                token,
                user: {
                    fullName: user.fullName,
                    role: user.role,
                    rootCode: user.rootCode,
                    isAdmin: user.isAdmin,
                    isApproved: user.isApproved 
                }
            });
        });
    } catch (err) {
        res.status(500).json({ message: "Lỗi server" });
    }
});

module.exports = router;