import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Smartphone, Lock, User, ShieldCheck, MapPin, ChevronLeft, Key } from 'lucide-react-native';
import { useRouter } from 'expo-router';

import CustomInput from '../../components/CustomInput';
import CustomAlert from '../../components/CustomAlert';
import { COLORS } from '../../constants/theme'; // Đảm bảo đường dẫn theme đúng với dự án của bạn

const RegisterCanBo = () => {
  const router = useRouter();

  // State thông tin cá nhân
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // Thêm mới
  
  // State thông tin đơn vị
  const [rootCode, setRootCode] = useState(''); // Key đơn vị cung cấp
  const [unitCode, setUnitCode] = useState(''); // Tên đơn vị (VD: Trung đội 5)
  const [unitPath, setUnitPath] = useState(''); // Phả hệ (VD: c10-d6)

  const [alertConfig, setAlertConfig] = useState({ 
    visible: false, 
    type: 'success', 
    message: '', 
    autoClose: false 
  });

  const handleRegister = async () => {
    // 1. Kiểm tra nhập liệu cơ bản
    if (!fullName || !phone || !password || !confirmPassword || !rootCode || !unitCode || !unitPath) {
      setAlertConfig({
        visible: true,
        type: 'error',
        message: "Vui lòng nhập đầy đủ tất cả các trường thông tin",
        autoClose: false
      });
      return;
    }

    // 2. Kiểm tra mật khẩu khớp nhau
    if (password !== confirmPassword) {
      setAlertConfig({
        visible: true,
        type: 'error',
        message: "Mật khẩu nhập lại không trùng khớp",
        autoClose: false
      });
      return;
    }

    try {
      const response = await fetch('http://192.168.1.100:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName, 
          phone, 
          password,
          role: 'canbo',
          rootCode, 
          unitCode, // Gửi tên đơn vị (VD: Trung đội 5)
          unitPath  
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setAlertConfig({
          visible: true,
          type: 'success',
          message: "Đăng ký thành công! Vui lòng đợi phê duyệt từ hệ thống.",
          autoClose: true
        });
        setTimeout(() => router.replace('/login'), 2000);
      } else {
        setAlertConfig({
          visible: true,
          type: 'error',
          message: data.message || "Đăng ký thất bại",
          autoClose: false
        });
      }
    } catch (error) {
      setAlertConfig({
        visible: true,
        type: 'error',
        message: "Lỗi kết nối máy chủ! Vui lòng kiểm tra backend.",
        autoClose: false
      });
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={28} color="#333" />
        </TouchableOpacity>

        <Text style={styles.title}>Đăng ký Cán bộ</Text>
        <Text style={styles.subtitle}>Thiết lập tài khoản quản trị đơn vị</Text>

        <View style={styles.form}>
          <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>
          
          <CustomInput icon={User} placeholder="Họ và tên đầy đủ" value={fullName} onChangeText={setFullName} />
          
          <CustomInput icon={Smartphone} placeholder="Số điện thoại" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
          
          <CustomInput icon={Lock} placeholder="Mật khẩu" secureTextEntry value={password} onChangeText={setPassword} />
          
          {/* TRƯỜNG MỚI: NHẬP LẠI MẬT KHẨU */}
          <CustomInput icon={Lock} placeholder="Xác nhận lại mật khẩu" secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} />

          <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Thông tin đơn vị</Text>
          
          <Text style={styles.inputLabel}>Key đơn vị cung cấp</Text>
          <CustomInput icon={Key} placeholder="Ví dụ: D6E5F5QK7" value={rootCode} onChangeText={setRootCode} />

          <View style={styles.row}>
             <View style={{ flex: 1.2, marginRight: 10 }}>
                <Text style={styles.inputLabel}>Tên đơn vị</Text>
                <CustomInput icon={ShieldCheck} placeholder="VD: Trung đội 5" value={unitCode} onChangeText={setUnitCode} />
             </View>
             <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Phả hệ (Path)</Text>
                <CustomInput icon={MapPin} placeholder="VD: c10-d6" value={unitPath} onChangeText={setUnitPath} />
             </View>
          </View>

          <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
            <Text style={styles.registerText}>Đăng ký ngay</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <CustomAlert 
        visible={alertConfig.visible}
        type={alertConfig.type}
        message={alertConfig.message}
        autoClose={alertConfig.autoClose}
        onClose={() => setAlertConfig({ ...alertConfig, visible: false })}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  content: { padding: 25, paddingTop: 40 },
  backButton: { marginBottom: 10, marginLeft: -10 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#1A1A1A' },
  subtitle: { fontSize: 15, color: '#666', marginBottom: 25 },
  form: { width: '100%' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#2E7D32', marginBottom: 10 },
  inputLabel: { fontSize: 12, fontWeight: '600', color: '#444', marginBottom: 5, marginTop: 10 },
  row: { flexDirection: 'row' },
  registerButton: { 
    backgroundColor: '#2E7D32', 
    height: 55, 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginTop: 35, 
    marginBottom: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  registerText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' }
});

export default RegisterCanBo;