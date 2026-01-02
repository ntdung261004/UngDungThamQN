import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { COLORS } from '../../../../constants/theme';
import CustomAlert from '../../../../components/CustomAlert';
import * as ImagePicker from 'expo-image-picker';

export default function AddSoldier({ navigation, route }) {
  const [form, setForm] = useState({
    fullName: '', soldierId: '', rank: '', position: '', unitCode: '', unitPath: '', phoneRelative: '', dob: '', enlistDate: '', address: '', avatar: ''
  });
  const [loading, setLoading] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ visible: false, type: 'success', message: '' });

  const handleChange = (key, value) => setForm({ ...form, [key]: value });

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Quyền truy cập bị từ chối', 'Vui lòng cho phép truy cập ảnh để tải lên.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.6,
        base64: true
      });

      if (result.cancelled) return;
      const dataUri = `data:image/jpeg;base64,${result.base64}`;
      setForm(prev => ({ ...prev, avatar: dataUri }));
    } catch (err) {
      console.error('Lỗi chọn ảnh:', err);
      setAlertConfig({ visible: true, type: 'error', message: 'Lỗi khi chọn ảnh' });
    }
  }

  const handleSubmit = async () => {
    // Validation: họ tên, mã, sđt người nhà bắt buộc
    if (!form.fullName || !form.soldierId || !form.phoneRelative) {
      setAlertConfig({ visible: true, type: 'error', message: 'Vui lòng nhập họ tên, mã chiến sĩ và SĐT người nhà' });
      return;
    }
    setLoading(true);
    try {
      const currentUser = route?.params?.currentUser;
      const payload = { ...form, rootCode: currentUser?.rootCode, unitCode: form.unitCode || currentUser?.unitCode, unitPath: form.unitPath || currentUser?.unitPath };
      const res = await fetch('http://192.168.1.100:5000/api/auth/soldiers', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        setAlertConfig({ visible: true, type: 'success', message: 'Thêm chiến sĩ thành công' });
        setTimeout(() => {
          setAlertConfig({ ...alertConfig, visible: false });
          navigation.goBack();
        }, 1200);
      } else {
        setAlertConfig({ visible: true, type: 'error', message: data.message || 'Lỗi khi thêm' });
      }
    } catch (err) {
      console.error('Lỗi submit:', err);
      setAlertConfig({ visible: true, type: 'error', message: 'Lỗi kết nối' });
    } finally { setLoading(false); }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      <Text style={styles.title}>Thêm chiến sĩ mới</Text>

      <Text style={styles.label}>Họ và tên</Text>
      <TextInput style={styles.input} value={form.fullName} onChangeText={t => handleChange('fullName', t)} placeholder="Nhập họ và tên" />

      <Text style={styles.label}>Mã chiến sĩ</Text>
      <TextInput style={styles.input} value={form.soldierId} onChangeText={t => handleChange('soldierId', t)} placeholder="Mã/ID chiến sĩ" />

      <Text style={styles.label}>Cấp bậc</Text>
      <TextInput style={styles.input} value={form.rank} onChangeText={t => handleChange('rank', t)} placeholder="Ví dụ: Binh nhất" />

      <Text style={styles.label}>Chức vụ</Text>
      <TextInput style={styles.input} value={form.position} onChangeText={t => handleChange('position', t)} placeholder="Ví dụ: Tiểu đội trưởng" />

      <Text style={styles.label}>Đơn vị</Text>
      <TextInput style={styles.input} value={form.unitCode} onChangeText={t => handleChange('unitCode', t)} placeholder="Mã đơn vị" />

      <Text style={styles.label}>SĐT người nhà (bắt buộc)</Text>
      <TextInput style={styles.input} value={form.phoneRelative} onChangeText={t => handleChange('phoneRelative', t)} placeholder="Số điện thoại người nhà" keyboardType="phone-pad" />

      <Text style={styles.label}>Ngày sinh (YYYY-MM-DD)</Text>
      <TextInput style={styles.input} value={form.dob} onChangeText={t => handleChange('dob', t)} placeholder="1990-01-01" />

      <Text style={styles.label}>Ngày nhập ngũ (YYYY-MM-DD)</Text>
      <TextInput style={styles.input} value={form.enlistDate} onChangeText={t => handleChange('enlistDate', t)} placeholder="2020-05-01" />

      <Text style={styles.label}>Nơi ở</Text>
      <TextInput style={styles.input} value={form.address} onChangeText={t => handleChange('address', t)} placeholder="Địa chỉ liên hệ" />

      <Text style={[styles.label, { marginTop: 12 }]}>Ảnh chiến sĩ (tùy chọn)</Text>
      {form.avatar ? (
        <Image source={{ uri: form.avatar }} style={{ width: 120, height: 120, borderRadius: 8, marginTop: 8 }} />
      ) : (
        <View style={{ marginTop: 8 }} />
      )}
      <TouchableOpacity style={[styles.btn, { backgroundColor: '#4CAF50', marginTop: 10 }]} onPress={pickImage}>
        <Text style={styles.btnText}>Chọn ảnh</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.btn, loading && { opacity: 0.7 }]} onPress={handleSubmit} disabled={loading}>
        <Text style={styles.btnText}>{loading ? 'Đang lưu...' : 'Lưu chiến sĩ'}</Text>
      </TouchableOpacity>

      <CustomAlert visible={alertConfig.visible} type={alertConfig.type} message={alertConfig.message} onClose={() => setAlertConfig({ ...alertConfig, visible: false })} autoClose={alertConfig.type === 'success'} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  title: { fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 12 },
  label: { fontSize: 13, color: '#666', marginTop: 10 },
  input: { borderWidth: 1, borderColor: '#EEE', padding: 10, borderRadius: 10, marginTop: 6 },
  btn: { backgroundColor: COLORS.primary, marginTop: 20, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  btnText: { color: '#FFF', fontWeight: '700' }
});
