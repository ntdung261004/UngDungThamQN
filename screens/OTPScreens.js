import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { ChevronLeft, Smartphone } from 'lucide-react-native';
import CustomInput from '../components/CustomInput';
import { COLORS } from '../theme/color';
import { useRouter, useLocalSearchParams } from 'expo-router';

const OTPScreen = () => {
  const [otp, setOtp] = useState('');
  const router = useRouter();
  const { phone, type } = useLocalSearchParams();

  const handleVerify = () => {
    if (otp.length < 6) {
      Alert.alert("Lỗi", "Vui lòng nhập đủ 6 số OTP");
      return;
    }

    if (type === 'register') {
      Alert.alert("Thành công", "Tài khoản của bạn đã được xác thực SĐT. Vui lòng chờ chỉ huy phê duyệt.");
      router.replace('/login');
    } else if (type === 'forgot') {
      // Chuyển sang trang thiết lập mật khẩu mới
      router.push({
        pathname: '/reset_password',
        params: { phone: phone }
      });
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <View style={styles.content}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={28} color={COLORS.textDark} />
        </TouchableOpacity>

        <View style={styles.iconCircle}>
          <Smartphone size={40} color={COLORS.primary} />
        </View>

        <Text style={styles.title}>Xác minh OTP</Text>
        <Text style={styles.subtitle}>Mã xác thực đã được gửi đến số:{"\n"}<Text style={{fontWeight: 'bold', color: COLORS.textDark}}>{phone}</Text></Text>

        <CustomInput 
          icon={Smartphone} 
          placeholder="Nhập 6 số OTP" 
          keyboardType="number-pad"
          maxLength={6}
          value={otp}
          onChangeText={setOtp}
        />

        <TouchableOpacity style={styles.verifyButton} onPress={handleVerify}>
          <Text style={styles.verifyText}>Xác nhận mã</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.resendBtn} onPress={() => Alert.alert("Thông báo", "Mã mới đã được gửi!")}>
          <Text style={styles.resendText}>Chưa nhận được mã? <Text style={{color: COLORS.primary, fontWeight: 'bold'}}>Gửi lại</Text></Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 25, paddingTop: 60, alignItems: 'center' },
  backButton: { alignSelf: 'flex-start', marginBottom: 20, marginLeft: -10 },
  iconCircle: { width: 80, height: 80, backgroundColor: '#E8F0FE', borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: COLORS.textDark, marginBottom: 10 },
  subtitle: { fontSize: 15, color: COLORS.textGrey, textAlign: 'center', marginBottom: 30, lineHeight: 22 },
  verifyButton: { backgroundColor: COLORS.primary, width: '100%', height: 55, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 20 },
  verifyText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
  resendBtn: { marginTop: 25 },
  resendText: { color: COLORS.textGrey, fontSize: 14 }
});

export default OTPScreen;