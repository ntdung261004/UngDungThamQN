import { useRouter } from 'expo-router';
import { ChevronLeft, Smartphone } from 'lucide-react-native';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import CustomInput from '../../components/CustomInput';
import { COLORS } from '../../constants/theme';

const ForgotPasswordScreen = () => {
  const [phone, setPhone] = useState('');
  const router = useRouter();

  const handleSendOTP = () => {
    if (phone.length < 10) {
      alert("Vui lòng nhập số điện thoại hợp lệ");
      return;
    }
    // Chuyển sang trang OTP với type là 'forgot'
    router.push({
      pathname: '/otp_verification',
      params: { phone: phone, type: 'forgot' }
    });
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={28} color={COLORS.textDark} />
        </TouchableOpacity>

        <Text style={styles.title}>Quên mật khẩu?</Text>
        <Text style={styles.subtitle}>Nhập số điện thoại đăng ký để nhận mã khôi phục mật khẩu.</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Số điện thoại</Text>
          <CustomInput 
            icon={Smartphone} 
            placeholder="09xx xxx xxx" 
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />

          <TouchableOpacity style={styles.sendButton} onPress={handleSendOTP}>
            <Text style={styles.sendText}>Gửi mã xác thực</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 25, paddingTop: 60 },
  backButton: { marginBottom: 20, marginLeft: -10 },
  title: { fontSize: 28, fontWeight: 'bold', color: COLORS.textDark, marginBottom: 8 },
  subtitle: { fontSize: 15, color: COLORS.textGrey, marginBottom: 40 },
  form: { width: '100%' },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.textDark, marginBottom: 8 },
  sendButton: { backgroundColor: COLORS.primary, height: 55, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 20 },
  sendText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' }
});

export default ForgotPasswordScreen;