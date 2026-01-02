import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image, ActivityIndicator, SafeAreaView, Platform, Modal } from 'react-native';
import { ArrowLeft, Camera, Calendar, ChevronDown, Check } from 'lucide-react-native';
import { COLORS } from '../../../../constants/theme';
import CustomAlert from '../../../../components/CustomAlert';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function AddSoldier() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const currentUser = params.currentUser ? JSON.parse(params.currentUser) : null;

  const [form, setForm] = useState({
    fullName: '', 
    rank: '', 
    position: 'Chiến sĩ', 
    unitCode: currentUser?.unitCode || '', 
    phoneRelative: '', 
    dob: new Date(), 
    enlistDate: new Date(), 
    address: '', 
    avatar: ''
  });
  
  const [showDOB, setShowDOB] = useState(false);
  const [showEnlist, setShowEnlist] = useState(false);
  const [showPosModal, setShowPosModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ visible: false, type: 'success', message: '' });

  const positions = ["Chiến sĩ", "Tiểu đội trưởng", "Khẩu đội trưởng"];

  const validatePhone = (phone) => {
    return /^(0[3|5|7|8|9])([0-9]{8})$/.test(phone);
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        setAlertConfig({ visible: true, type: 'error', message: 'Cần quyền truy cập ảnh.' });
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.3, // Giảm chất lượng ảnh để tối ưu dung lượng
        base64: true
      });
      if (!result.canceled) {
        setForm(prev => ({ ...prev, avatar: `data:image/jpeg;base64,${result.assets[0].base64}` }));
      }
    } catch (err) {
      setAlertConfig({ visible: true, type: 'error', message: 'Lỗi chọn ảnh' });
    }
  };

  const handleSubmit = async () => {
    if (!form.fullName || !form.rank || !form.address) {
      setAlertConfig({ visible: true, type: 'error', message: 'Vui lòng điền đủ thông tin (*)' });
      return;
    }
    if (!validatePhone(form.phoneRelative)) {
      setAlertConfig({ visible: true, type: 'error', message: 'Số điện thoại không đúng định dạng.' });
      return;
    }

    setLoading(true);
    try {
      const payload = { 
        ...form, 
        dob: form.dob.toISOString().split('T')[0],
        enlistDate: form.enlistDate.toISOString().split('T')[0],
        rootCode: currentUser?.rootCode, 
        unitPath: currentUser?.unitPath,
        createdBy: currentUser?.id || currentUser?._id
      };

      const res = await fetch('http://localhost:5000/api/auth/soldiers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        setAlertConfig({ visible: true, type: 'success', message: 'Thêm thành công!' });
        setTimeout(() => router.back(), 1500); 
      } else {
        const data = await res.json();
        setAlertConfig({ visible: true, type: 'error', message: data.message });
      }
    } catch (err) {
      setAlertConfig({ visible: true, type: 'error', message: 'Lỗi kết nối máy chủ' });
    } finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><ArrowLeft size={24} color="#333" /></TouchableOpacity>
        <Text style={styles.headerTitle}>Thêm chiến sĩ mới</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* AVATAR */}
        <View style={styles.avatarSection}>
          <TouchableOpacity style={styles.avatarPicker} onPress={pickImage}>
            {form.avatar ? <Image source={{ uri: form.avatar }} style={styles.avatarImg} /> : 
            <View style={styles.avatarPlaceholder}><Camera size={30} color="#CCC" /><Text style={styles.avatarText}>Thêm ảnh</Text></View>}
          </TouchableOpacity>
        </View>

        <InputField label="Họ và tên (*)" value={form.fullName} onChange={t => setForm({...form, fullName: t})} placeholder="VÍ DỤ: NGUYỄN VĂN A" />
        
        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <InputField label="Cấp bậc (*)" value={form.rank} onChange={t => setForm({...form, rank: t})} placeholder="Binh nhất" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Chức vụ (*)</Text>
            <TouchableOpacity style={styles.inputLike} onPress={() => setShowPosModal(true)}>
              <Text style={{ color: '#333' }}>{form.position}</Text>
              <ChevronDown size={18} color="#999" />
            </TouchableOpacity>
          </View>
        </View>

        <InputField label="SĐT người nhà (*)" value={form.phoneRelative} onChange={t => setForm({...form, phoneRelative: t})} placeholder="09xxxxxxxx" keyboardType="phone-pad" />
        
        {/* DATE PICKERS */}
        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={styles.label}>Ngày sinh (*)</Text>
            <TouchableOpacity style={styles.inputLike} onPress={() => setShowDOB(true)}>
              <Text style={{ color: '#333' }}>{form.dob.toLocaleDateString('vi-VN')}</Text>
              <Calendar size={18} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Nhập ngũ (*)</Text>
            <TouchableOpacity style={styles.inputLike} onPress={() => setShowEnlist(true)}>
              <Text style={{ color: '#333' }}>{form.enlistDate.toLocaleDateString('vi-VN')}</Text>
              <Calendar size={18} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {showDOB && <DateTimePicker value={form.dob} mode="date" display="default" onChange={(e, d) => { setShowDOB(false); if(d) setForm({...form, dob: d}); }} />}
        {showEnlist && <DateTimePicker value={form.enlistDate} mode="date" display="default" onChange={(e, d) => { setShowEnlist(false); if(d) setForm({...form, enlistDate: d}); }} />}

        <InputField label="Quê quán (*)" value={form.address} onChange={t => setForm({...form, address: t})} placeholder="Xã, Huyện, Tỉnh" />

        <TouchableOpacity style={[styles.btnSubmit, loading && { opacity: 0.7 }]} onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnText}>LƯU CHIẾN SĨ</Text>}
        </TouchableOpacity>
      </ScrollView>

      {/* POSITION MODAL */}
      <Modal visible={showPosModal} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setShowPosModal(false)}>
          <View style={styles.modalContent}>
            {positions.map((pos) => (
              <TouchableOpacity key={pos} style={styles.modalItem} onPress={() => { setForm({ ...form, position: pos }); setShowPosModal(false); }}>
                <Text style={[styles.modalItemText, form.position === pos && { color: COLORS.primary, fontWeight: 'bold' }]}>{pos}</Text>
                {form.position === pos && <Check size={18} color={COLORS.primary} />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      <CustomAlert visible={alertConfig.visible} type={alertConfig.type} message={alertConfig.message} onClose={() => setAlertConfig({ ...alertConfig, visible: false })} />
    </SafeAreaView>
  );
}

const InputField = ({ label, value, onChange, placeholder, keyboardType }) => (
  <View style={styles.inputGroup}>
    <Text style={styles.label}>{label}</Text>
    <TextInput style={styles.input} value={value} onChangeText={onChange} placeholder={placeholder} placeholderTextColor="#BBB" keyboardType={keyboardType} />
  </View>
);

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, height: 60, borderBottomWidth: 1, borderBottomColor: '#EEE' },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  avatarSection: { alignItems: 'center', marginVertical: 20 },
  avatarPicker: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#F8F9FA', borderStyle: 'dashed', borderWidth: 1, borderColor: '#CCC', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  avatarImg: { width: 100, height: 100 },
  avatarPlaceholder: { alignItems: 'center' },
  avatarText: { fontSize: 11, color: '#AAA', marginTop: 5 },
  inputGroup: { marginBottom: 15 },
  label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6 },
  input: { backgroundColor: '#F9F9F9', borderWidth: 1, borderColor: '#EEE', padding: 12, borderRadius: 10, fontSize: 14, color: '#333' },
  inputLike: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F9F9F9', borderWidth: 1, borderColor: '#EEE', padding: 12, borderRadius: 10, height: 48 },
  row: { flexDirection: 'row', marginBottom: 15 },
  btnSubmit: { backgroundColor: COLORS.primary, paddingVertical: 15, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#FFF', width: '80%', borderRadius: 15, padding: 10 },
  modalItem: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, borderBottomWidth: 1, borderBottomColor: '#EEE' },
  modalItemText: { fontSize: 15, color: '#333' }
});