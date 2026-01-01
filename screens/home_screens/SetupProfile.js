import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { User, Shield, Briefcase, MapPin, Camera, Save } from 'lucide-react-native';
import CustomInput from '../../components/CustomInput';
import CustomAlert from '../../components/CustomAlert';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../../constants/theme';

const SetupProfile = ({ user, onComplete, onLogout }) => {
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [rank, setRank] = useState('');
  const [position, setPosition] = useState('');
  const [unitName, setUnitName] = useState(user?.unitCode || '');
  const [loading, setLoading] = useState(false);

  const [alertConfig, setAlertConfig] = useState({ 
    visible: false, 
    type: 'success', 
    message: '', 
    autoClose: false 
  });

  const handleUpdateProfile = async () => {
    if (!fullName || !rank || !position || !unitName) {
      setAlertConfig({
        visible: true,
        type: 'error',
        message: "Vui lòng điền đầy đủ tất cả các thông tin",
        autoClose: false
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/update-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: user.id, // Lấy id từ props user truyền vào
          fullName, 
          rank, 
          position, 
          unitCode: unitName 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const updatedUser = { 
          ...user, 
          fullName: data.user.fullName,
          rank: data.user.rank,
          position: data.user.position,
          unitCode: data.user.unitCode,
          isProfileUpdated: true 
        };
        
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        
        setAlertConfig({
          visible: true,
          type: 'success',
          message: "Cập nhật hồ sơ thành công!",
          autoClose: true
        });

        setTimeout(() => {
          onComplete(updatedUser);
        }, 1500);
      } else {
        setAlertConfig({
          visible: true,
          type: 'error',
          message: data.message || "Không tìm thấy người dùng",
          autoClose: false
        });
      }
    } catch (error) {
      setAlertConfig({
        visible: true,
        type: 'error',
        message: "Lỗi kết nối Server!",
        autoClose: false
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FFF' }}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Hoàn thiện hồ sơ</Text>
          <Text style={styles.subtitle}>Vui lòng thiết lập thông tin lần đầu để tiếp tục</Text>
        </View>

        <View style={styles.avatarContainer}>
          <View style={styles.avatarCircle}>
            <User size={50} color="#AAA" />
            <TouchableOpacity style={styles.cameraIcon}>
              <Camera size={18} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Họ và tên</Text>
          <CustomInput icon={User} placeholder="Nhập họ và tên" value={fullName} onChangeText={setFullName} />
          <Text style={styles.label}>Cấp bậc</Text>
          <CustomInput icon={Shield} placeholder="VD: Thiếu úy, Trung úy..." value={rank} onChangeText={setRank} />
          <Text style={styles.label}>Chức vụ</Text>
          <CustomInput icon={Briefcase} placeholder="VD: Trung đội trưởng..." value={position} onChangeText={setPosition} />
          <Text style={styles.label}>Tên đơn vị</Text>
          <CustomInput icon={MapPin} placeholder="VD: Trung đội 5, Đại đội 10..." value={unitName} onChangeText={setUnitName} />

          <TouchableOpacity style={styles.saveButton} onPress={handleUpdateProfile} disabled={loading}>
            {loading ? <ActivityIndicator color="#FFF" /> : (
              <>
                <Save size={20} color="#FFF" style={{ marginRight: 10 }} />
                <Text style={styles.saveText}>Lưu thông tin & Bắt đầu</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutLink} onPress={onLogout}>
            <Text style={styles.logoutText}>Đăng xuất tài khoản</Text>
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
  content: { padding: 25, paddingTop: 50 },
  header: { alignItems: 'center', marginBottom: 30 },
  title: { fontSize: 24, fontWeight: 'bold', color: COLORS.textDark },
  subtitle: { fontSize: 14, color: COLORS.textGrey, marginTop: 5, textAlign: 'center' },
  avatarContainer: { alignItems: 'center', marginBottom: 30 },
  avatarCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#EEE', position: 'relative' },
  cameraIcon: { position: 'absolute', bottom: 0, right: 0, backgroundColor: COLORS.primary, padding: 8, borderRadius: 20 },
  form: { width: '100%' },
  label: { fontSize: 14, fontWeight: '700', color: COLORS.textDark, marginBottom: 8, marginTop: 15 },
  saveButton: { backgroundColor: COLORS.primary, height: 55, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 40 },
  saveText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  logoutLink: { marginTop: 20, alignItems: 'center' },
  logoutText: { color: '#D32F2F', fontSize: 14, fontWeight: '600' }
});

export default SetupProfile;