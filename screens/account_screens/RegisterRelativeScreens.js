import { useRouter } from 'expo-router';
import { ChevronLeft, Hash, Lock, MapPin, RotateCcw, Smartphone, User } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import CustomInput from '../../components/CustomInput';
import { COLORS } from '../../constants/theme';

const RegisterRelativeScreens = () => {
  const router = useRouter();

  // State quản lý dữ liệu nhập
  const [unitCode, setUnitCode] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [unitPath, setUnitPath] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = () => {
    // Kiểm tra dữ liệu
    if (!unitCode || !fullName || !phone || !unitPath || !password) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Lỗi", "Mật khẩu xác nhận không khớp.");
      return;
    }

    // Chuyển sang OTP
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
          <Text style={styles.headerTitleText}>Đăng ký Thân nhân</Text>
          <View style={{ width: 28 }} />
        </View>

        <Text style={styles.label}>Mã định danh đơn vị</Text>
        <CustomInput 
          icon={Hash} 
          placeholder="Dán mã do con em cấp" 
          autoCapitalize="characters"
          value={unitCode}
          onChangeText={setUnitCode}
        />

        <Text style={styles.label}>Họ và tên người thân</Text>
        <CustomInput 
          icon={User} 
          placeholder="Nhập họ tên của bạn" 
          value={fullName}
          onChangeText={setFullName}
        />

        <Text style={styles.label}>Số điện thoại</Text>
        <CustomInput 
          icon={Smartphone} 
          placeholder="Dùng làm tài khoản đăng nhập" 
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />

        <Text style={styles.label}>Đơn vị con em (Unit Path)</Text>
        <CustomInput 
          icon={MapPin} 
          placeholder="Ví dụ: b1-c1-d4-e5" 
          autoCapitalize="none"
          value={unitPath}
          onChangeText={setUnitPath}
        />

        <Text style={styles.label}>Mật khẩu</Text>
        <CustomInput 
          icon={Lock} 
          placeholder="........" 
          secureTextEntry={true} 
          value={password}
          onChangeText={setPassword}
        />

        <Text style={styles.label}>Nhập lại mật khẩu</Text>
        <CustomInput 
          icon={RotateCcw} 
          placeholder="Xác nhận mật khẩu" 
          secureTextEntry={true} 
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        <TouchableOpacity 
          style={[styles.registerButton, { backgroundColor: '#FF5252' }]} 
          activeOpacity={0.8}
          onPress={handleRegister}
        >
          <Text style={styles.registerButtonText}>Đăng ký & Kết nối</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.footerLink} onPress={() => router.push('/login')}>
          <Text style={styles.footerText}>Đã có tài khoản? <Text style={[styles.link, {color: '#FF5252'}]}>Đăng nhập</Text></Text>
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
  registerButton: { height: 55, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 30 },
  registerButtonText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
  footerLink: { marginTop: 20, marginBottom: 40, alignItems: 'center' },
  footerText: { color: COLORS.textGrey, fontSize: 14 },
  link: { fontWeight: 'bold' }
});

export default RegisterRelativeScreens;