import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { User, Smartphone, Lock, ChevronLeft, ShieldCheck, Eye, EyeOff, RotateCcw, Hash, MapPin } from 'lucide-react-native';
import CustomInput from '../components/CustomInput';
import { COLORS } from '../theme/color';
import { useRouter } from 'expo-router';

const RegisterScreens = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  
  // State quản lý dữ liệu nhập
  const [unitCode, setUnitCode] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [unitPath, setUnitPath] = useState('');
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegisterRequest = () => {
    // Kiểm tra các trường bắt buộc
    if (!unitCode || !fullName || !phone || !unitPath || !token || !password) {
      Alert.alert("Lỗi", "Vui lòng điền đầy đủ tất cả thông tin.");
      return;
    }

    if (phone.length < 10) {
      Alert.alert("Lỗi", "Số điện thoại không hợp lệ.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Lỗi", "Mật khẩu xác nhận không khớp.");
      return;
    }

    // Chuyển sang màn hình OTP
    router.push({
      pathname: '/otp_verification',
      params: { phone: phone, type: 'register' }
    });
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ChevronLeft size={28} color={COLORS.textDark} />
          </TouchableOpacity>
          <Text style={styles.headerTitleText}>Đăng ký Cán bộ</Text>
          <View style={{ width: 28 }} /> 
        </View>

        <Text style={styles.label}>Mã định danh đơn vị</Text>
        <CustomInput 
          icon={Hash} 
          placeholder="Dán mã do chỉ huy cấp" 
          autoCapitalize="characters"
          value={unitCode}
          onChangeText={setUnitCode}
        />

        <Text style={styles.label}>Họ và tên</Text>
        <CustomInput 
          icon={User} 
          placeholder="Họ và tên cán bộ" 
          value={fullName}
          onChangeText={setFullName}
        />

        <Text style={styles.label}>Số điện thoại</Text>
        <CustomInput 
          icon={Smartphone} 
          placeholder="Dùng để đăng nhập" 
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />

        <Text style={styles.label}>Đường dẫn đơn vị (Unit Path)</Text>
        <CustomInput 
          icon={MapPin} 
          placeholder="Ví dụ: b4-c10-d6-e5-f5-qk7" 
          value={unitPath}
          onChangeText={setUnitPath}
          autoCapitalize="none"
        />

        <Text style={styles.label}>Mã mời xác thực (Token)</Text>
        <CustomInput 
          icon={ShieldCheck} 
          placeholder="Mã phê duyệt tài khoản" 
          value={token}
          onChangeText={setToken}
        />

        <Text style={styles.label}>Mật khẩu</Text>
        <View style={styles.inputWrapper}>
          <CustomInput 
            icon={Lock} 
            placeholder="........" 
            secureTextEntry={!showPassword} 
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
            {showPassword ? <Eye size={20} color={COLORS.textGrey} /> : <EyeOff size={20} color={COLORS.textGrey} />}
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Nhập lại mật khẩu</Text>
        <CustomInput 
          icon={RotateCcw} 
          placeholder="Xác nhận mật khẩu" 
          secureTextEntry={true} 
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        <TouchableOpacity 
          style={styles.registerButton} 
          activeOpacity={0.8}
          onPress={handleRegisterRequest}
        >
          <Text style={styles.registerButtonText}>Gửi yêu cầu phê duyệt</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.footerLink} onPress={() => router.push('/login')}>
          <Text style={styles.footerText}>Đã có tài khoản? <Text style={styles.link}>Đăng nhập</Text></Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { padding: 25, paddingTop: 50 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  backButton: { padding: 10, marginLeft: -10 },
  headerTitleText: { fontSize: 18, fontWeight: 'bold', color: COLORS.textDark },
  label: { fontSize: 15, fontWeight: '600', color: COLORS.textDark, marginBottom: 8 },
  inputWrapper: { position: 'relative' },
  eyeIcon: { position: 'absolute', right: 15, top: 18 },
  registerButton: { backgroundColor: COLORS.primary, height: 55, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 30 },
  registerButtonText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
  footerLink: { marginTop: 20, alignItems: 'center', marginBottom: 40 },
  footerText: { color: COLORS.textGrey, fontSize: 14 },
  link: { color: COLORS.primary, fontWeight: 'bold' }
});

export default RegisterScreens;