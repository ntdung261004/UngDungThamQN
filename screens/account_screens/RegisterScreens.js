import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { Smartphone, Lock, User, ShieldCheck, MapPin, ChevronLeft, Key } from 'lucide-react-native';
import { useRouter } from 'expo-router';

import CustomInput from '../../components/CustomInput';
import CustomAlert from '../../components/CustomAlert';
import { COLORS } from '../../constants/theme';

const RegisterScreens = () => {
  const router = useRouter();

  // State cho thông tin cá nhân
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  
  // State cho thông tin đơn vị (Theo yêu cầu của bạn)
  const [rootCode, setRootCode] = useState(''); // Key khách hàng cung cấp
  const [unitCode, setUnitCode] = useState(''); // Cấp quản lý trực tiếp (VD: C10)
  const [unitPath, setUnitPath] = useState(''); // Đường dẫn quản lý (VD: b4-c10-d6)

  const [alertConfig, setAlertConfig] = useState({ visible: false, type: 'success', message: '', autoClose: false });

  const handleRegister = async () => {
    if (!fullName || !phone || !password || !rootCode || !unitCode || !unitPath) {
      setAlertConfig({ visible: true, type: 'error', message: "Vui lòng nhập đầy đủ tất cả các trường thông tin", autoClose: false });
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName, phone, password,
          role: 'canbo',
          rootCode, // Gửi Key khách hàng
          unitCode, // Gửi mã đơn vị trực tiếp
          unitPath  // Gửi phả hệ đơn vị
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setAlertConfig({ visible: true, type: 'success', message: "Đăng ký thành công! Vui lòng đợi phê duyệt.", autoClose: true });
        setTimeout(() => router.replace('/login'), 2000);
      } else {
        setAlertConfig({ visible: true, type: 'error', message: data.message, autoClose: false });
      }
    } catch (error) {
      setAlertConfig({ visible: true, type: 'error', message: "Lỗi kết nối server!", autoClose: false });
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={28} color={COLORS.textDark} />
        </TouchableOpacity>

        <Text style={styles.title}>Đăng ký Cán bộ</Text>
        <Text style={styles.subtitle}>Thiết lập tài khoản quản lý đơn vị</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Thông tin cá nhân</Text>
          <CustomInput icon={User} placeholder="Họ và tên" value={fullName} onChangeText={setFullName} />
          <CustomInput icon={Smartphone} placeholder="Số điện thoại" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
          <CustomInput icon={Lock} placeholder="Mật khẩu" secureTextEntry value={password} onChangeText={setPassword} />

          <Text style={[styles.label, { marginTop: 20 }]}>Thông tin đơn vị quản lý</Text>
          
          <Text style={styles.subLabel}>Mã đơn vị gốc (Key khách hàng cung cấp)</Text>
          <CustomInput icon={Key} placeholder="Ví dụ: D6E5F5QK7" value={rootCode} onChangeText={setRootCode} />

          <View style={styles.row}>
             <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.subLabel}>Mã đơn vị trực tiếp</Text>
                <CustomInput icon={ShieldCheck} placeholder="VD: C10" value={unitCode} onChangeText={setUnitCode} />
             </View>
             <View style={{ flex: 1 }}>
                <Text style={styles.subLabel}>Đường dẫn (Path)</Text>
                <CustomInput icon={MapPin} placeholder="VD: b5-c10-d6" value={unitPath} onChangeText={setUnitPath} />
             </View>
          </View>

          <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
            <Text style={styles.registerText}>Gửi yêu cầu đăng ký</Text>
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
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 25, paddingTop: 40 },
  backButton: { marginBottom: 10, marginLeft: -10 },
  title: { fontSize: 26, fontWeight: 'bold', color: COLORS.textDark },
  subtitle: { fontSize: 15, color: COLORS.textGrey, marginBottom: 25 },
  form: { width: '100%' },
  label: { fontSize: 16, fontWeight: '700', color: COLORS.primary, marginBottom: 10 },
  subLabel: { fontSize: 12, fontWeight: '600', color: COLORS.textDark, marginBottom: 5, marginTop: 10 },
  row: { flexDirection: 'row' },
  registerButton: { backgroundColor: COLORS.primary, height: 55, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 35, marginBottom: 40 },
  registerText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' }
});

export default RegisterScreens;