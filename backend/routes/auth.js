const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Soldier = require('../models/Soldier');

// =============================================================
// PHẦN 1: QUẢN LÝ USER (CÁN BỘ & THÂN NHÂN)
// =============================================================

/**
 * @route   POST api/auth/register-relative
 * @desc    Đăng ký cho thân nhân - Kiểm tra trực tiếp dữ liệu chiến sĩ (Không OTP)
 */
router.post('/register-relative', async (req, res) => {
    try {
        const { fullName, phone, password, rootCode } = req.body;

        // 1. Kiểm tra SĐT đã tồn tại trong hệ thống chưa
        let userExists = await User.findOne({ phone, rootCode });
        if (userExists) {
            return res.status(400).json({ message: "Số điện thoại này đã được đăng ký tài khoản!" });
        }

        // 2. Đối chiếu với bảng Soldier (Xác thực danh tính người thân)
        // fullName: Tên chiến sĩ, phone: SĐT người thân nhập vào
        const soldier = await Soldier.findOne({ 
            fullName: fullName.trim(), 
            phoneRelative: phone.trim(),
            rootCode: rootCode.trim() 
        });

        if (!soldier) {
            return res.status(400).json({ 
                message: "Xác thực thất bại! Thông tin chiến sĩ hoặc số điện thoại người thân không khớp với dữ liệu đơn vị." 
            });
        }

        // 3. Khởi tạo tài khoản mới dựa trên dữ liệu chiến sĩ đã khớp
        const newUser = new User({
            fullName: fullName.trim(), // Lưu tên chiến sĩ vào trường fullName của User để định danh
            phone: phone.trim(),
            password: password,
            role: 'relative',
            rootCode: soldier.rootCode,
            unitCode: soldier.unitCode,
            unitPath: soldier.unitPath,
            soldierId: soldier._id, // Liên kết trực tiếp với bản ghi chiến sĩ
            isApproved: true,       // Khớp dữ liệu thì cho phép hoạt động ngay
            isProfileUpdated: false
        });

        // 4. Mã hóa mật khẩu
        const salt = await bcrypt.genSalt(10);
        newUser.password = await bcrypt.hash(password, salt);
        
        await newUser.save();

        // 5. Trả về thông tin đăng nhập thành công
        res.status(200).json({ 
            message: "Đăng ký thành công!",
            user: {
                id: newUser._id,
                fullName: newUser.fullName,
                role: newUser.role,
                rootCode: newUser.rootCode,
                unitCode: newUser.unitCode,
                isProfileUpdated: newUser.isProfileUpdated
            }
        });

    } catch (err) {
        console.error("Lỗi đăng ký người thân:", err);
        res.status(500).json({ message: "Lỗi hệ thống: " + err.message });
    }
});

/**
 * @route   POST api/auth/register (Dành cho cán bộ)
 * @desc    Đăng ký tài khoản cán bộ - Cần chờ phê duyệt
 */
router.post('/register', async (req, res) => {
    try {
        const { fullName, phone, password, role, rootCode, unitCode, unitPath } = req.body;
        
        let userExists = await User.findOne({ phone, rootCode });
        if (userExists) return res.status(400).json({ message: "Số điện thoại này đã được đăng ký!" });

        const newUser = new User({
            fullName, phone, password, role, rootCode, unitCode, unitPath,
            isAdmin: false,
            isApproved: false 
        });

        const salt = await bcrypt.genSalt(10);
        newUser.password = await bcrypt.hash(password, salt);
        await newUser.save();

        res.status(200).json({ message: "Đăng ký thành công! Vui lòng chờ cán bộ cấp trên phê duyệt." });
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

router.post('/check-relative', async (req, res) => {
    try {
        const { fullName, phone, rootCode } = req.body;

        // 1. Kiểm tra SĐT đã có tài khoản nào đăng ký chưa
        const userExists = await User.findOne({ phone, rootCode });
        if (userExists) {
            return res.status(400).json({ message: "Số điện thoại này đã được đăng ký tài khoản!" });
        }

        // 2. Kiểm tra khớp Tên chiến sĩ và SĐT người thân trong bảng Soldier
        const soldier = await Soldier.findOne({ 
            fullName: fullName.trim(), 
            phoneRelative: phone.trim(),
            rootCode: rootCode.trim() 
        });

        if (!soldier) {
            return res.status(400).json({ 
                message: "Thông tin không khớp! Vui lòng kiểm tra lại Họ tên chiến sĩ và Số điện thoại của bạn." 
            });
        }

        // Nếu mọi thứ ổn
        res.status(200).json({ message: "Thông tin hợp lệ", soldierId: soldier._id });
    } catch (err) {
        res.status(500).json({ message: "Lỗi kiểm tra dữ liệu" });
    }
});
module.exports = router;