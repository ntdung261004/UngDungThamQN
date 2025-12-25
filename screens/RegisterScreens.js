import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { User, Smartphone, Lock, ChevronLeft, ShieldCheck, Eye, EyeOff, RotateCcw } from 'lucide-react-native';
import CustomInput from '../components/CustomInput';
import { COLORS } from '../theme/color';
import { useRouter } from 'expo-router';

const RegisterScreens = () => {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Header ngang để tránh bị đè vùng bấm */}
        <View style={styles.headerRow}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.replace('/')}
          >
            <ChevronLeft size={28} color={COLORS.textDark} />
          </TouchableOpacity>
          <Text style={styles.headerTitleText}>Đăng ký</Text>
          <View style={{ width: 28 }} /> 
        </View>

        {/* Biểu tượng Khiên bảo mật trung tâm */}
        <View style={styles.headerIcon}>
          <View style={styles.iconCircle}>
            <ShieldCheck size={40} color={COLORS.primary} />
          </View>
        </View>

        <Text style={styles.title}>Đăng ký Cán bộ</Text>
        <Text style={styles.subtitle}>
          Điền thông tin xác thực quân nhân để tạo tài khoản quản lý thăm nuôi.
        </Text>

        <Text style={styles.label}>Họ và tên</Text>
        <CustomInput icon={User} placeholder="Nguyễn Văn A" />

        <Text style={styles.label}>Mã số quân nhân</Text>
        <CustomInput icon={ShieldCheck} placeholder="VD: QN12345678" />

        <Text style={styles.label}>Số điện thoại</Text>
        <CustomInput icon={Smartphone} placeholder="09xx xxx xxx" />

        <Text style={styles.label}>Mật khẩu</Text>
        <View style={styles.inputWrapper}>
          <CustomInput icon={Lock} placeholder="........" secureTextEntry={!showPassword} />
          <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
            {showPassword ? <Eye size={20} color={COLORS.textGrey} /> : <EyeOff size={20} color={COLORS.textGrey} />}
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Nhập lại mật khẩu</Text>
        <View style={styles.inputWrapper}>
          <CustomInput icon={RotateCcw} placeholder="........" secureTextEntry={true} />
          <TouchableOpacity style={styles.eyeIcon}>
            <EyeOff size={20} color={COLORS.textGrey} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.registerButton} activeOpacity={0.8}>
          <Text style={styles.registerButtonText}>Đăng ký tài khoản</Text>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    padding: 10,
    marginLeft: -10,
    zIndex: 999,
  },
  headerTitleText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textDark,
  },
  headerIcon: { alignItems: 'center', marginBottom: 20 },
  iconCircle: { 
    width: 90, height: 90, backgroundColor: '#E8F0FE', 
    borderRadius: 20, justifyContent: 'center', alignItems: 'center' 
  },
  title: { fontSize: 26, fontWeight: 'bold', textAlign: 'center', color: COLORS.textDark, marginBottom: 10 },
  subtitle: { fontSize: 14, textAlign: 'center', color: COLORS.textGrey, marginBottom: 30, paddingHorizontal: 20 },
  label: { fontSize: 15, fontWeight: '600', color: COLORS.textDark, marginBottom: 8 },
  inputWrapper: { position: 'relative' },
  eyeIcon: { position: 'absolute', right: 15, top: 18 },
  registerButton: {
    backgroundColor: COLORS.primary, height: 55, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center', marginTop: 30
  },
  registerButtonText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
  footerLink: { marginTop: 20, alignItems: 'center', marginBottom: 20 },
  footerText: { color: COLORS.textGrey, fontSize: 14 },
  link: { color: COLORS.primary, fontWeight: 'bold' }
});

export default RegisterScreens;