const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// --- ĐĂNG KÝ ---
router.post('/register', async (req, res) => {
    try {
        const { fullName, phone, password, role, rootCode, unitPath } = req.body;

        // Kiểm tra xem SĐT đã tồn tại trong đơn vị gốc này chưa
        let user = await User.findOne({ phone, rootCode });
        if (user) return res.status(400).json({ message: "Số điện thoại đã được đăng ký trong đơn vị này!" });

        const newUser = new User({ fullName, phone, password, role, rootCode, unitPath });

        // Cán bộ cần duyệt (isApproved: false), Thân nhân có thể tự do hơn (isApproved: true)
        newUser.isApproved = role === 'canbo' ? false : true;

        const salt = await bcrypt.getSalt(10);
        newUser.password = await bcrypt.hash(password, salt);

        await newUser.save();
        res.status(200).json({ message: "Đăng ký thành công!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Lỗi hệ thống đăng ký" });
    }
});

// --- ĐĂNG NHẬP ---
router.post('/login', async (req, res) => {
    try {
        const { rootCode, phone, password } = req.body;

        // Phải tìm đúng RootCode + Phone mới cho đăng nhập
        const user = await User.findOne({ rootCode, phone });
        if (!user) {
            return res.status(400).json({ message: "Mã đơn vị hoặc SĐT không chính xác!" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Mật khẩu không chính xác!" });
        }

        const payload = { user: { id: user.id, role: user.role, rootCode: user.rootCode } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
            if (err) throw err;
            res.json({
                message: "Đăng nhập thành công!",
                token,
                user: { fullName: user.fullName, role: user.role, rootCode: user.rootCode }
            });
        });
    } catch (err) {
        res.status(500).json({ message: "Lỗi server" });
    }
});

module.exports = router;