import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Calendar, Camera, Heart, User } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../constants/theme';

// NHỚ ĐỔI IP CỦA BẠN
const API_URL = 'http://192.168.1.100:5000';

export default function SetupProfileRelative() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [currentUser, setCurrentUser] = useState(null);
  const [soldierData, setSoldierData] = useState(null);

  const [form, setForm] = useState({
    fullName: '', 
    relationship: '', 
    dob: '', // Năm sinh dạng chuỗi
    avatar: ''
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Lấy thông tin user đăng nhập và thông tin chiến sĩ truyền qua URL
    const loadData = async () => {
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) setCurrentUser(JSON.parse(userStr));
      
      if (params.soldier) {
        setSoldierData(JSON.parse(params.soldier));
      }
    };
    loadData();
  }, [params]);

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
      Alert.alert("Lỗi", "Lỗi khi chọn ảnh");
    }
  };

  const handleSave = async () => {
    if (!form.fullName || !form.relationship) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập Họ tên và Mối quan hệ.");
      return;
    }
    setLoading(true);
    try {
      const payload = { 
        userId: currentUser.id || currentUser._id,
        fullName: form.fullName,
        relationship: form.relationship,
        dob: form.dob, // Gửi lên dạng chuỗi năm sinh hoặc ngày sinh
        avatar: form.avatar
      };

      const res = await fetch(`${API_URL}/api/auth/update-relative-profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (res.ok) {
        // Cập nhật lại AsyncStorage
        await AsyncStorage.setItem('user', JSON.stringify(data.user));
        Alert.alert("Thành công", "Hồ sơ đã được hoàn thiện!", [
            { text: "Vào ứng dụng", onPress: () => router.replace('/home') }
        ]);
      } else {
        Alert.alert("Lỗi", data.message);
      }
    } catch (err) {
      Alert.alert("Lỗi kết nối", "Không thể cập nhật hồ sơ");
    } finally { 
        setLoading(false); 
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        
        <Text style={styles.headerTitle}>Hoàn thiện hồ sơ</Text>
        <Text style={styles.subTitle}>Cập nhật thông tin của bạn để kết nối với chiến sĩ.</Text>

        <View style={styles.avatarSection}>
          <TouchableOpacity style={styles.avatarPicker} onPress={pickImage}>
            {form.avatar ? <Image source={{ uri: form.avatar }} style={styles.avatarImg} /> : 
            <View style={styles.avatarPlaceholder}>
                <Camera size={30} color="#FF5252" />
                <Text style={styles.avatarText}>Thêm ảnh</Text>
            </View>}
          </TouchableOpacity>
        </View>

        {/* THÔNG TIN CHIẾN SĨ (CHỈ ĐỌC) */}
        {soldierData && (
          <View style={styles.soldierCard}>
            <Text style={styles.soldierCardTitle}>Đang kết nối với chiến sĩ:</Text>
            <Text style={styles.soldierName}>{soldierData.fullName?.toUpperCase()}</Text>
            <Text style={styles.soldierUnit}>{soldierData.rank} • {soldierData.unitCode}</Text>
          </View>
        )}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Họ tên người thân (*)</Text>
          <View style={styles.inputContainer}>
             <User size={20} color="#999" />
             <TextInput style={styles.input} value={form.fullName} onChangeText={t => setForm({...form, fullName: t})} placeholder="Ví dụ: Nguyễn Văn B" />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Mối quan hệ với chiến sĩ (*)</Text>
          <View style={styles.inputContainer}>
             <Heart size={20} color="#999" />
             <TextInput style={styles.input} value={form.relationship} onChangeText={t => setForm({...form, relationship: t})} placeholder="Ví dụ: Bố, Mẹ, Anh trai..." />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Năm sinh</Text>
          <View style={styles.inputContainer}>
             <Calendar size={20} color="#999" />
             <TextInput style={styles.input} value={form.dob} onChangeText={t => setForm({...form, dob: t})} keyboardType="numeric" placeholder="Ví dụ: 1975" maxLength={4} />
          </View>
        </View>

        <TouchableOpacity style={[styles.btnSubmit, loading && { opacity: 0.7 }]} onPress={handleSave} disabled={loading}>
          {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnText}>LƯU & BẮT ĐẦU</Text>}
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFF' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#333', marginTop: 20 },
  subTitle: { fontSize: 14, color: '#666', marginTop: 5, marginBottom: 20 },
  avatarSection: { alignItems: 'center', marginBottom: 25 },
  avatarPicker: { width: 110, height: 110, borderRadius: 55, backgroundColor: '#FFF0F0', borderStyle: 'dashed', borderWidth: 2, borderColor: '#FF5252', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  avatarImg: { width: 110, height: 110 },
  avatarPlaceholder: { alignItems: 'center' },
  avatarText: { fontSize: 12, color: '#FF5252', marginTop: 5, fontWeight: '600' },
  soldierCard: { backgroundColor: '#F5F7FA', padding: 15, borderRadius: 12, marginBottom: 25, borderWidth: 1, borderColor: '#EEE' },
  soldierCardTitle: { fontSize: 12, color: '#666', marginBottom: 4 },
  soldierName: { fontSize: 16, fontWeight: 'bold', color: COLORS.primary },
  soldierUnit: { fontSize: 13, color: '#555', marginTop: 2 },
  inputGroup: { marginBottom: 18 },
  label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9F9F9', borderWidth: 1, borderColor: '#EEE', borderRadius: 10, paddingHorizontal: 12, height: 50 },
  input: { flex: 1, marginLeft: 10, fontSize: 15, color: '#333' },
  btnSubmit: { backgroundColor: '#FF5252', paddingVertical: 15, borderRadius: 12, alignItems: 'center', marginTop: 20, elevation: 2 },
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});