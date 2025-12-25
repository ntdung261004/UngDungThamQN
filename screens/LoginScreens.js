import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { Smartphone, Lock, ChevronLeft } from 'lucide-react-native';
import CustomInput from '../components/CustomInput';
import { COLORS } from '../theme/color';
import { useRouter, useLocalSearchParams } from 'expo-router';

const LoginScreens = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const { role } = useLocalSearchParams(); // Nhận vai trò từ Welcome

  const handleRegisterNavigation = () => {
    if (role === 'canbo') {
      router.push('/register_canbo');
    } else {
      router.push('/register_relative');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Quay lại Welcome */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/')}>
        <ChevronLeft size={28} color={COLORS.textDark} />
      </TouchableOpacity>

      <Text style={styles.title}>Đăng nhập</Text>
      <Text style={styles.subtitle}>
        Đang đăng nhập với vai trò: {role === 'canbo' ? 'Cán bộ' : 'Thân nhân'}
      </Text>

      <View style={styles.form}>
        <Text style={styles.label}>Số điện thoại</Text>
        <CustomInput 
          icon={Smartphone} 
          placeholder="09xx xxx xxx" 
          value={phone}
          onChangeText={setPhone}
        />

        <Text style={styles.label}>Mật khẩu</Text>
        <CustomInput 
          icon={Lock} 
          placeholder="........" 
          secureTextEntry={true}
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={styles.forgotPass}>
          <Text style={styles.forgotText}>Quên mật khẩu?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.loginButton} activeOpacity={0.8}>
          <Text style={styles.loginText}>Đăng nhập</Text>
        </TouchableOpacity>

        <View style={styles.footerLink}>
          <Text style={styles.noAccount}>Chưa có tài khoản? </Text>
          <TouchableOpacity onPress={handleRegisterNavigation}>
            <Text style={styles.linkText}>Đăng ký ngay</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 25, paddingTop: 60 },
  backButton: { marginBottom: 20, marginLeft: -10, padding: 5 },
  title: { fontSize: 28, fontWeight: 'bold', color: COLORS.textDark, marginBottom: 8 },
  subtitle: { fontSize: 15, color: COLORS.textGrey, marginBottom: 40 },
  form: { width: '100%' },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.textDark, marginBottom: 8 },
  forgotPass: { alignItems: 'flex-end', marginBottom: 30 },
  forgotText: { color: COLORS.primary, fontSize: 14, fontWeight: '500' },
  loginButton: {
    backgroundColor: COLORS.primary,
    height: 55,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  loginText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
  footerLink: { flexDirection: 'row', justifyContent: 'center', marginTop: 25 },
  noAccount: { color: COLORS.textGrey, fontSize: 14 },
  linkText: { color: COLORS.primary, fontSize: 14, fontWeight: 'bold' }
});

export default LoginScreens;