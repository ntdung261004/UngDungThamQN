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

// --- API LẤY DANH SÁCH CHIẾN SĨ (Dùng Regex linh hoạt) ---
router.get('/soldiers/:userId', async (req, res) => {
    try {
        const currentUser = await User.findById(req.params.userId);
        if (!currentUser) return res.status(404).json({ message: "Không tìm thấy người dùng" });

        let filter = { rootCode: currentUser.rootCode };
        
        if (!currentUser.isAdmin) {
            // Cải tiến: Tìm tất cả chiến sĩ mà unitPath chứa mã đơn vị của cán bộ
            // Ví dụ: Cán bộ c10-d6 sẽ thấy lính có unitPath là "a1-b1-c10-d6" hoặc "c10-d6"
            filter.unitPath = new RegExp(currentUser.unitPath, 'i');
        }

        const soldiers = await Soldier.find(filter).sort({ unitPath: 1, fullName: 1 });
        res.json({ soldiers });
    } catch (err) {
        res.status(500).json({ message: "Lỗi lấy danh sách" });
    }
});

// --- API THÊM CHIẾN SĨ (Tối ưu hóa sự đồng bộ UnitPath) ---
router.post('/soldiers', async (req, res) => {
    try {
        let { 
            fullName, rank, position, unitCode, unitPath, 
            rootCode, phoneRelative, dob, enlistDate, 
            address, avatar, createdBy 
        } = req.body;

        // BƯỚC QUAN TRỌNG: Kiểm tra và đồng bộ UnitPath
        // Nếu unitCode (ví dụ: c10-d6) chưa có trong unitPath (ví dụ: d6)
        // thì phải cập nhật unitPath của chiến sĩ thành unitCode để cấp dưới thấy được.
        let finalPath = unitPath.trim().toLowerCase();
        let finalCode = unitCode.trim().toLowerCase();

        if (!finalPath.includes(finalCode)) {
            // Nếu người dùng nhập unitCode chi tiết hơn unitPath, ưu tiên unitCode làm path
            finalPath = finalCode;
        }

        // Chuẩn hóa dấu gạch ngang
        finalPath = finalPath.replace(/[\s\/]/g, '-');

        const newSoldier = new Soldier({
            fullName, rank, position, 
            unitCode: finalCode, 
            unitPath: finalPath, 
            rootCode, phoneRelative, dob, enlistDate, address, avatar, createdBy
        });

        await newSoldier.save();
        res.status(200).json({ message: "Thêm chiến sĩ thành công" });
    } catch (err) {
        res.status(500).json({ message: "Lỗi thêm chiến sĩ: " + err.message });
    }
});

// --- API: kiểm tra số điện thoại người thân đã được đăng ký trong User hay chưa ---
router.get('/relative-exists/:userId/:phone', async (req, res) => {
    try {
        const currentUser = await User.findById(req.params.userId);
        if (!currentUser) return res.status(404).json({ message: 'Không tìm thấy user' });

        const phone = req.params.phone;
        if (!phone) return res.status(400).json({ message: 'Thiếu số điện thoại' });

        // Tìm user role relative với cùng rootCode (nếu không phải admin, we still restrict by rootCode)
        const filter = { phone };
        if (!currentUser.isAdmin) {
            filter.rootCode = currentUser.rootCode;
        } else {
            // even admin should be limited to same rootCode for safety
            filter.rootCode = currentUser.rootCode;
        }

        const rel = await User.findOne({ ...filter, role: 'relative' });
        res.json({ exists: !!rel });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi kiểm tra người thân' });
    }
});

// --- API CẬP NHẬT CHIẾN SĨ ---
router.put('/soldiers/:id', async (req, res) => {
    try {
        const soldierId = req.params.id;
        const updaterId = req.body.userId; // client must send current user id in body
        if (!updaterId) return res.status(400).json({ message: 'Thiếu userId' });

        const currentUser = await User.findById(updaterId);
        if (!currentUser) return res.status(404).json({ message: 'Không tìm thấy user cập nhật' });

        const soldier = await Soldier.findById(soldierId);
        if (!soldier) return res.status(404).json({ message: 'Không tìm thấy chiến sĩ' });

        // Kiểm tra quyền: cùng rootCode
        if (soldier.rootCode !== currentUser.rootCode) return res.status(403).json({ message: 'Không có quyền chỉnh sửa chiến sĩ này' });

        const updates = req.body.updates || {};
        // Prevent changing rootCode via update
        delete updates.rootCode;

        Object.keys(updates).forEach(k => {
            soldier[k] = updates[k];
        });

        await soldier.save();
        res.json({ message: 'Cập nhật chiến sĩ thành công', soldier });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi cập nhật chiến sĩ: ' + err.message });
    }
});

// --- API XÓA CHIẾN SĨ ---
router.delete('/soldiers/:id', async (req, res) => {
    try {
        const soldierId = req.params.id;
        const deleterId = req.body.userId;
        if (!deleterId) return res.status(400).json({ message: 'Thiếu userId' });

        const currentUser = await User.findById(deleterId);
        if (!currentUser) return res.status(404).json({ message: 'Không tìm thấy user' });

        const soldier = await Soldier.findById(soldierId);
        if (!soldier) return res.status(404).json({ message: 'Không tìm thấy chiến sĩ' });

        if (soldier.rootCode !== currentUser.rootCode) return res.status(403).json({ message: 'Không có quyền xóa chiến sĩ này' });

        await Soldier.findByIdAndDelete(soldierId);
        res.json({ message: 'Xóa chiến sĩ thành công' });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi xóa chiến sĩ: ' + err.message });
    }
});

// --- API CẬP NHẬT HỒ SƠ LẦN ĐẦU ---
router.put('/update-profile', async (req, res) => {
    try {
        const { userId, fullName, rank, position, unitCode } = req.body;

        // Kiểm tra userId có tồn tại không
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "Không tìm thấy người dùng" });
        }

        // Cập nhật thông tin
        user.fullName = fullName;
        user.rank = rank;
        user.position = position;
        user.unitCode = unitCode;
        user.isProfileUpdated = true; // Đánh dấu đã cập nhật hồ sơ

        await user.save();

        res.json({
            message: "Cập nhật hồ sơ thành công",
            user: {
                id: user._id,
                fullName: user.fullName,
                rank: user.rank,
                position: user.position,
                unitCode: user.unitCode,
                isProfileUpdated: user.isProfileUpdated,
                role: user.role,
                rootCode: user.rootCode,
                unitPath: user.unitPath,
                isApproved: user.isApproved
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Lỗi Server khi cập nhật hồ sơ" });
    }
});
module.exports = router;