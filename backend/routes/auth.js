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

// --- ĐĂNG NHẬP ---
router.post('/login', async (req, res) => {
    try {
        const { phone, password } = req.body;
        const user = await User.findOne({ phone });
        if (!user) return res.status(404).json({ message: "Không tìm thấy tài khoản với số điện thoại này." });
        if (!user.isApproved) return res.status(403).json({ message: "Tài khoản của bạn đang chờ quản trị viên phê duyệt." });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Mật khẩu không chính xác." });

        const token = jwt.sign(
            { id: user._id, role: user.role, rootCode: user.rootCode }, 
            "secret", // Đáng lẽ nên dùng process.env.JWT_SECRET
            { expiresIn: '1d' }
        );

        res.status(200).json({ 
            message: "Đăng nhập thành công!",
            token,
            user: {
                id: user._id, fullName: user.fullName, phone: user.phone, role: user.role, 
                rootCode: user.rootCode, unitCode: user.unitCode, unitPath: user.unitPath, 
                isAdmin: user.isAdmin, rank: user.rank, position: user.position, 
                avatar: user.avatar, isProfileUpdated: user.isProfileUpdated,
                // BỔ SUNG 2 DÒNG DƯỚI ĐÂY ĐỂ TRUYỀN DATA XUỐNG CHO THÂN NHÂN
                soldierId: user.soldierId,
                relationship: user.relationship
            }
        });
    } catch (err) {
        res.status(500).json({ message: "Lỗi hệ thống đăng nhập" });
    }
});

// --- CẬP NHẬT HỒ SƠ ---
router.put('/update-profile', async (req, res) => {
    try {
        const { userId, fullName, rank, position, unitCode } = req.body;
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { fullName, rank, position, unitCode, isProfileUpdated: true },
            { new: true }
        );
        if (!updatedUser) return res.status(404).json({ message: "Không tìm thấy người dùng" });
        res.status(200).json({ message: "Cập nhật hồ sơ thành công", user: updatedUser });
    } catch (err) {
        console.error("Lỗi cập nhật profile:", err);
        res.status(500).json({ message: "Lỗi hệ thống khi cập nhật hồ sơ" });
    }
});

// --- [MỚI] API LẤY DANH SÁCH CÁN BỘ (CHỜ DUYỆT & ĐÃ DUYỆT) ---
router.get('/pending-officers/:userId', async (req, res) => {
    try {
        const currentUser = await User.findById(req.params.userId);
        if (!currentUser) return res.status(404).json({ message: "Không tìm thấy người dùng" });

        // Lọc theo đơn vị của người quản lý (Chỉ lấy cán bộ, không lấy thân nhân)
        let filter = { rootCode: currentUser.rootCode, role: 'canbo' };
        
        // Loại bỏ chính tài khoản của mình ra khỏi danh sách
        filter._id = { $ne: currentUser._id }; 

        if (!currentUser.isAdmin) {
            filter.unitPath = new RegExp(currentUser.unitPath, 'i');
        }

        // Tách làm 2 mảng
        const pending = await User.find({ ...filter, isApproved: false }).sort({ createdAt: -1 });
        const approved = await User.find({ ...filter, isApproved: true }).sort({ createdAt: -1 });

        res.status(200).json({ pending, approved });
    } catch (err) {
        console.error("Lỗi lấy danh sách cán bộ:", err);
        res.status(500).json({ message: "Lỗi hệ thống lấy danh sách" });
    }
});

// --- [MỚI] API PHÊ DUYỆT CÁN BỘ ---
router.put('/approve-officer/:id', async (req, res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { isApproved: true },
            { new: true }
        );
        if (!updatedUser) {
            return res.status(404).json({ message: "Không tìm thấy tài khoản để phê duyệt" });
        }
        res.status(200).json({ message: "Phê duyệt thành công" });
    } catch (err) {
        console.error("Lỗi phê duyệt:", err);
        res.status(500).json({ message: "Lỗi hệ thống khi phê duyệt" });
    }
});


// =============================================================
// PHẦN 2: QUẢN LÝ CHIẾN SĨ
// =============================================================

// --- API THÊM CHIẾN SĨ MỚI ---
router.post('/soldiers', async (req, res) => {
    try {
        const { fullName, rank, position, unitCode, unitPath, rootCode, phoneRelative, dob, enlistDate, address, avatar, createdBy } = req.body;

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

        let soldiers = await Soldier.find(filter).sort({ createdAt: -1 });

        const formattedSoldiers = await Promise.all(soldiers.map(async (soldier) => {
            const relative = await User.findOne({ phone: soldier.phoneRelative, role: 'relative' });
            return { ...soldier._doc, isRelativeRegistered: !!relative };
        }));

        res.status(200).json({ soldiers: formattedSoldiers });
    } catch (err) {
        res.status(500).json({ message: "Lỗi lấy danh sách chiến sĩ" });
    }
});

// --- API CẬP NHẬT CHIẾN SĨ ---
router.put('/soldiers/:id', async (req, res) => {
    try {
        const updatedSoldier = await Soldier.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true } 
        );
        if (!updatedSoldier) {
            return res.status(404).json({ message: "Không tìm thấy chiến sĩ để cập nhật" });
        }
        res.status(200).json({ message: "Cập nhật thành công", soldier: updatedSoldier });
    } catch (err) {
        console.error("Lỗi cập nhật chiến sĩ:", err);
        res.status(500).json({ message: "Lỗi hệ thống: " + err.message });
    }
});

// --- API XÓA CHIẾN SĨ ---
router.delete('/soldiers/:id', async (req, res) => {
    try {
        const deletedSoldier = await Soldier.findByIdAndDelete(req.params.id);
        if (!deletedSoldier) {
            return res.status(404).json({ message: "Không tìm thấy chiến sĩ để xóa" });
        }
        res.status(200).json({ message: "Xóa chiến sĩ thành công" });
    } catch (err) {
        console.error("Lỗi xóa chiến sĩ:", err);
        res.status(500).json({ message: "Lỗi hệ thống: " + err.message });
    }
});


// =============================================================
// PHẦN 3: THỐNG KÊ (OVERVIEW STATS)
// =============================================================

// --- API TỔNG QUAN SỐ LIỆU ---
router.get('/overview-stats/:userId', async (req, res) => {
    try {
        const currentUser = await User.findById(req.params.userId);
        if (!currentUser) return res.status(404).json({ message: "Không tìm thấy User" });

        let filter = { rootCode: currentUser.rootCode };
        if (!currentUser.isAdmin) {
            filter.unitPath = new RegExp(currentUser.unitPath, 'i');
        }

        const totalSoldiers = await Soldier.countDocuments(filter);
        const totalOfficers = await User.countDocuments({ ...filter, role: 'canbo' });
        const pendingApprovals = await User.countDocuments({ ...filter, role: 'canbo', isApproved: false });

        const soldiers = await Soldier.find(filter).select('phoneRelative');
        const phoneList = soldiers.map(s => s.phoneRelative).filter(p => p);
        const totalRelatives = await User.countDocuments({ phone: { $in: phoneList }, role: 'relative' });

        res.status(200).json({
            totalSoldiers,
            totalOfficers,
            pendingApprovals,
            totalRelatives
        });
    } catch (err) {
        res.status(500).json({ message: "Lỗi hệ thống: " + err.message });
    }
});

// =============================================================
// PHẦN 4: ĐĂNG KÝ VÀ CẬP NHẬT DÀNH CHO THÂN NHÂN
// =============================================================

// --- API ĐĂNG KÝ THÂN NHÂN ---
router.post('/register-relative', async (req, res) => {
    try {
        const { phone, password } = req.body;
        
        // 1. Check trùng SĐT trong hệ thống
        let existingUser = await User.findOne({ phone });
        if (existingUser) return res.status(400).json({ message: "Số điện thoại này đã được đăng ký tài khoản!" });

        // 2. Quét tìm SĐT trong danh sách Chiến sĩ đã được Cán bộ khai báo
        const soldier = await Soldier.findOne({ phoneRelative: phone });
        if (!soldier) {
            return res.status(404).json({ message: "Số điện thoại này chưa được chỉ huy đơn vị khai báo. Vui lòng liên hệ đơn vị!" });
        }

        // 3. Tạo tài khoản tự động "ăn theo" mã đơn vị của Chiến sĩ
        const newUser = new User({
            fullName: "Thân nhân chiến sĩ", // Tên tạm, sẽ sửa ở bước Setup Profile
            phone, 
            password, 
            role: 'relative', 
            rootCode: soldier.rootCode, 
            unitCode: soldier.unitCode, 
            unitPath: soldier.unitPath,
            soldierId: soldier._id, // Liên kết ID chiến sĩ
            isAdmin: false,
            isApproved: true, // Thân nhân không cần duyệt, auto true
            isProfileUpdated: false
        });

        const salt = await bcrypt.genSalt(10);
        newUser.password = await bcrypt.hash(password, salt);
        await newUser.save();

        // 4. Trả về Token để tự động Login và sang thẳng trang Setup Profile
        const token = jwt.sign(
            { id: newUser._id, role: newUser.role, rootCode: newUser.rootCode }, 
            "secret", { expiresIn: '1d' }
        );

        res.status(200).json({ 
            message: "Xác thực thành công!",
            token,
            user: {
                id: newUser._id, phone: newUser.phone, role: newUser.role, 
                rootCode: newUser.rootCode, unitCode: newUser.unitCode, unitPath: newUser.unitPath, 
                soldierId: newUser.soldierId, isApproved: newUser.isApproved, isProfileUpdated: newUser.isProfileUpdated
            },
            soldier: soldier // Gửi kèm data chiến sĩ để hiện ở bước Setup
        });
    } catch (err) {
        res.status(500).json({ message: "Lỗi hệ thống đăng ký" });
    }
});

// --- API CẬP NHẬT HỒ SƠ THÂN NHÂN (SETUP PROFILE) ---
router.put('/update-relative-profile', async (req, res) => {
    try {
        const { userId, fullName, relationship, dob, avatar } = req.body;
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { fullName, relationship, dob, avatar, isProfileUpdated: true },
            { new: true }
        );
        if (!updatedUser) return res.status(404).json({ message: "Không tìm thấy người dùng" });
        res.status(200).json({ message: "Cập nhật hồ sơ thành công", user: updatedUser });
    } catch (err) {
        res.status(500).json({ message: "Lỗi hệ thống khi cập nhật hồ sơ" });
    }
});

// --- [MỚI BỔ SUNG] API LẤY THÔNG TIN CHIẾN SĨ DÀNH CHO THÂN NHÂN ---
router.get('/soldier-info/:soldierId', async (req, res) => {
    try {
        const soldier = await Soldier.findById(req.params.soldierId);
        if (!soldier) {
            return res.status(404).json({ message: "Không tìm thấy thông tin chiến sĩ tương ứng" });
        }
        res.status(200).json({ soldier });
    } catch (err) {
        console.error("Lỗi lấy thông tin chiến sĩ:", err);
        res.status(500).json({ message: "Lỗi hệ thống lấy thông tin chiến sĩ" });
    }
});

module.exports = router;