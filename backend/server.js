const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // Đã thêm
require('dotenv').config();

// 1. Khởi tạo app (PHẢI ĐẶT TRÊN CÙNG)
const app = express();

// 2. Cấu hình Middleware (Các phần bổ trợ cho app)
app.use(cors()); // Cho phép truy cập từ trình duyệt (Web)
app.use(express.json()); // Cho phép đọc dữ liệu JSON gửi lên

// 3. Gọi các Route (Đường dẫn API)
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// 4. Kết nối MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ Chúc mừng! Đã kết nối thành công tới MongoDB Atlas."))
    .catch((err) => console.log("❌ Lỗi kết nối rồi: ", err));

// Route kiểm tra cơ bản
app.get('/', (req, res) => {
    res.send("Server đang hoạt động ổn định!");
});

// 5. Chạy server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy tại: http://192.168.1.100:${PORT} (hoặc http://localhost:${PORT} trên máy)`);
});