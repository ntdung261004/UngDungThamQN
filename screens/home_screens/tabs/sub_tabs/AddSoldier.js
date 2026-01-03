import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image, ActivityIndicator, SafeAreaView, Platform, Modal, FlatList } from 'react-native';
import { ArrowLeft, Camera, Calendar, ChevronDown, Check, X } from 'lucide-react-native';
import { COLORS } from '../../../../constants/theme';
import CustomAlert from '../../../../components/CustomAlert';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function AddSoldier() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const currentUser = params.currentUser ? JSON.parse(params.currentUser) : null;

  const [form, setForm] = useState({
    fullName: '', 
    rank: 'Binh nhì', 
    position: 'Chiến sĩ', 
    unitCode: currentUser?.unitCode || '', 
    phoneRelative: '', 
    dob: new Date(), 
    enlistDate: new Date(), 
    address: '', 
    avatar: ''
  });

  const [dobInput, setDobInput] = useState(new Date().toLocaleDateString('vi-VN'));
  const [enlistInput, setEnlistInput] = useState(new Date().toLocaleDateString('vi-VN'));
  
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [pickingType, setPickingType] = useState('dob'); 
  const [tempDate, setTempDate] = useState({ 
    day: new Date().getDate(), 
    month: new Date().getMonth() + 1, 
    year: new Date().getFullYear() 
  });

  const [showPosModal, setShowPosModal] = useState(false);
  const [showRankModal, setShowRankModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ visible: false, type: 'success', message: '' });

  const positions = ["Chiến sĩ", "Tiểu đội trưởng", "Khẩu đội trưởng"];
  const ranks = ["Binh nhì", "Binh nhất", "Hạ sĩ", "Trung sĩ", "Thượng sĩ"];

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 100 }, (_, i) => currentYear - i); 
  }, []);

  const handleTextChange = (text, field) => {
    let cleaned = text.replace(/\D/g, '');
    let formatted = cleaned;
    if (cleaned.length > 2) formatted = cleaned.slice(0, 2) + '/' + cleaned.slice(2);
    if (cleaned.length > 4) formatted = formatted.slice(0, 5) + '/' + cleaned.slice(5, 9);
    
    if (field === 'dob') setDobInput(formatted);
    else setEnlistInput(formatted);

    if (formatted.length === 10) {
      const [d, m, y] = formatted.split('/');
      const newDate = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
      if (!isNaN(newDate.getTime())) {
        setForm(prev => ({ ...prev, [field]: newDate }));
      }
    }
  };

  const openCustomPicker = (type) => {
    // SỬA LỖI: Kiểm tra an toàn nếu form[type] không phải là đối tượng Date hợp lệ
    const current = (form[type] instanceof Date && !isNaN(form[type])) ? form[type] : new Date();
    
    setTempDate({
      day: current.getDate(),
      month: current.getMonth() + 1,
      year: current.getFullYear()
    });
    setPickingType(type);
    setShowCustomPicker(true);
  };

  const confirmCustomDate = () => {
    const date = new Date(tempDate.year, tempDate.month - 1, tempDate.day);
    setForm(prev => ({ ...prev, [pickingType]: date }));
    const dateStr = `${tempDate.day < 10 ? '0'+tempDate.day : tempDate.day}/${tempDate.month < 10 ? '0'+tempDate.month : tempDate.month}/${tempDate.year}`;
    if (pickingType === 'dob') setDobInput(dateStr);
    else setEnlistInput(dateStr);
    setShowCustomPicker(false);
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.3, 
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

      const res = await fetch('http://192.168.1.100:5000/api/auth/soldiers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (res.ok) {
        setAlertConfig({ visible: true, type: 'success', message: 'Thêm thành công!' });
        setTimeout(() => router.back(), 1500); 
      } else {
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
        <View style={styles.avatarSection}>
          <TouchableOpacity style={styles.avatarPicker} onPress={pickImage}>
            {form.avatar ? <Image source={{ uri: form.avatar }} style={styles.avatarImg} /> : 
            <View style={styles.avatarPlaceholder}><Camera size={30} color="#CCC" /><Text style={styles.avatarText}>Thêm ảnh</Text></View>}
          </TouchableOpacity>
        </View>

        <InputField label="Họ và tên (*)" value={form.fullName} onChange={t => setForm({...form, fullName: t})} placeholder="VÍ DỤ: NGUYỄN VĂN A" />
        <InputField label="Đơn vị (*)" value={form.unitCode} editable={false} />

        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={styles.label}>Cấp bậc (*)</Text>
            <TouchableOpacity style={styles.inputLike} onPress={() => setShowRankModal(true)}>
              <Text style={{ color: '#333' }}>{form.rank}</Text>
              <ChevronDown size={18} color="#999" />
            </TouchableOpacity>
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
        
        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={styles.label}>Ngày sinh (*)</Text>
            <View style={styles.dateInputContainer}>
              <TextInput 
                style={styles.dateInput} 
                value={dobInput} 
                onChangeText={(t) => handleTextChange(t, 'dob')}
                keyboardType="numeric"
                maxLength={10}
              />
              <TouchableOpacity onPress={() => openCustomPicker('dob')}>
                <Calendar size={20} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Nhập ngũ (*)</Text>
            <View style={styles.dateInputContainer}>
              <TextInput 
                style={styles.dateInput} 
                value={enlistInput} 
                onChangeText={(t) => handleTextChange(t, 'enlist')}
                keyboardType="numeric"
                maxLength={10}
              />
              <TouchableOpacity onPress={() => openCustomPicker('enlist')}>
                <Calendar size={20} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <InputField label="Quê quán (*)" value={form.address} onChange={t => setForm({...form, address: t})} placeholder="Xã, Tỉnh" />

        <TouchableOpacity style={[styles.btnSubmit, loading && { opacity: 0.7 }]} onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnText}>LƯU CHIẾN SĨ</Text>}
        </TouchableOpacity>
      </ScrollView>

      {/* CUSTOM PICKER MODAL */}
      <Modal visible={showCustomPicker} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.pickerModalContainer}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>
                {pickingType === 'dob' ? 'Chọn Ngày sinh' : 'Chọn Ngày nhập ngũ'}
              </Text>
              <TouchableOpacity onPress={() => setShowCustomPicker(false)}>
                <X size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.pickerBody}>
              <View style={styles.pickerColumn}>
                <Text style={styles.columnLabel}>Ngày</Text>
                <FlatList
                  data={days}
                  keyExtractor={item => 'd'+item}
                  renderItem={({item}) => (
                    <TouchableOpacity 
                      style={[styles.pickerItem, tempDate.day === item && styles.selectedItem]}
                      onPress={() => setTempDate({...tempDate, day: item})}
                    >
                      <Text style={[styles.pickerItemText, tempDate.day === item && styles.selectedItemText]}>{item}</Text>
                    </TouchableOpacity>
                  )}
                  showsVerticalScrollIndicator={false}
                />
              </View>
              <View style={styles.pickerColumn}>
                <Text style={styles.columnLabel}>Tháng</Text>
                <FlatList
                  data={months}
                  keyExtractor={item => 'm'+item}
                  renderItem={({item}) => (
                    <TouchableOpacity 
                      style={[styles.pickerItem, tempDate.month === item && styles.selectedItem]}
                      onPress={() => setTempDate({...tempDate, month: item})}
                    >
                      <Text style={[styles.pickerItemText, tempDate.month === item && styles.selectedItemText]}>T. {item}</Text>
                    </TouchableOpacity>
                  )}
                  showsVerticalScrollIndicator={false}
                />
              </View>
              <View style={styles.pickerColumn}>
                <Text style={styles.columnLabel}>Năm</Text>
                <FlatList
                  data={years}
                  keyExtractor={item => 'y'+item}
                  renderItem={({item}) => (
                    <TouchableOpacity 
                      style={[styles.pickerItem, tempDate.year === item && styles.selectedItem]}
                      onPress={() => setTempDate({...tempDate, year: item})}
                    >
                      <Text style={[styles.pickerItemText, tempDate.year === item && styles.selectedItemText]}>{item}</Text>
                    </TouchableOpacity>
                  )}
                  showsVerticalScrollIndicator={false}
                />
              </View>
            </View>

            <TouchableOpacity style={styles.confirmBtn} onPress={confirmCustomDate}>
              <Text style={styles.confirmBtnText}>XÁC NHẬN</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL RANK & POSITION */}
      <Modal visible={showRankModal} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setShowRankModal(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Chọn cấp bậc</Text>
            {ranks.map((r) => (
              <TouchableOpacity key={r} style={styles.modalItem} onPress={() => { setForm({ ...form, rank: r }); setShowRankModal(false); }}>
                <Text style={[styles.modalItemText, form.rank === r && { color: COLORS.primary, fontWeight: 'bold' }]}>{r}</Text>
                {form.rank === r && <Check size={18} color={COLORS.primary} />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal visible={showPosModal} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setShowPosModal(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Chọn chức vụ</Text>
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

const InputField = ({ label, value, onChange, placeholder, keyboardType, editable = true }) => (
  <View style={styles.inputGroup}>
    <Text style={styles.label}>{label}</Text>
    <TextInput 
      style={[styles.input, !editable && { backgroundColor: '#EEE', color: '#888' }]} 
      value={value} 
      onChangeText={onChange} 
      placeholder={placeholder} 
      placeholderTextColor="#BBB" 
      keyboardType={keyboardType}
      editable={editable}
    />
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
  dateInputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9F9F9', borderWidth: 1, borderColor: '#EEE', paddingHorizontal: 12, borderRadius: 10, height: 48 },
  dateInput: { flex: 1, fontSize: 14, color: '#333' },
  btnSubmit: { backgroundColor: COLORS.primary, paddingVertical: 15, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#FFF', width: '85%', borderRadius: 15, padding: 10 },
  modalTitle: { fontSize: 16, fontWeight: 'bold', textAlign: 'center', marginVertical: 10, color: '#333' },
  modalItem: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, borderBottomWidth: 1, borderBottomColor: '#EEE' },
  modalItemText: { fontSize: 15, color: '#333' },
  pickerModalContainer: { backgroundColor: '#FFF', width: '95%', borderRadius: 20, padding: 15, maxHeight: '70%' },
  pickerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  pickerTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.primary },
  pickerBody: { flexDirection: 'row', height: 280 },
  pickerColumn: { flex: 1, alignItems: 'center' },
  columnLabel: { fontSize: 12, color: '#999', marginBottom: 10, fontWeight: 'bold' },
  pickerItem: { paddingVertical: 12, width: '100%', alignItems: 'center', borderRadius: 8 },
  selectedItem: { backgroundColor: COLORS.primary + '15' },
  pickerItemText: { fontSize: 16, color: '#333' },
  selectedItemText: { color: COLORS.primary, fontWeight: 'bold' },
  confirmBtn: { backgroundColor: COLORS.primary, padding: 15, borderRadius: 12, marginTop: 20, alignItems: 'center' },
  confirmBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});