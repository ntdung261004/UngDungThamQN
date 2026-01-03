import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ScrollView, Image, Modal } from 'react-native';
import { Search, UserCheck, UserMinus, MapPin, ChevronRight, Plus, Sliders } from 'lucide-react-native';
import { COLORS } from '../../../../constants/theme';
import { useRouter } from 'expo-router';

export default function SoldierList({ soldiers = [], officers = [], currentUser }) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  // filter modal state
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterConfig, setFilterConfig] = useState({
    ranks: [],
    positions: [],
    hasRelative: null, // null = all, true = có, false = chưa
    hometown: '',
    enlistYear: '',
    unit: ''
  });

  // derive available hometowns and enlist years from soldiers (counts)
  const hometownCounts = useMemo(() => {
    const map = {};
    soldiers.forEach(s => {
      const key = (s.address || '').trim();
      if (!key) return;
      map[key] = (map[key] || 0) + 1;
    });
    return Object.entries(map).sort((a,b) => b[1]-a[1]); // [ [hometown, count], ... ]
  }, [soldiers]);

  const enlistYearCounts = useMemo(() => {
    const map = {};
    soldiers.forEach(s => {
      const d = new Date(s.enlistDate || s.enlist);
      if (isNaN(d.getTime())) return;
      const y = String(d.getFullYear());
      map[y] = (map[y] || 0) + 1;
    });
    return Object.entries(map).sort((a,b) => b[0]-a[0]);
  }, [soldiers]);

  // derive unit list from soldiers
  const unitCounts = useMemo(() => {
    const map = {};
    soldiers.forEach(s => {
      const key = ((s.unitCode || s.unitPath) || '').trim();
      if (!key) return;
      map[key] = (map[key] || 0) + 1;
    });
    return Object.entries(map).sort((a,b) => b[1]-a[1]);
  }, [soldiers]);

  const ranks = ["Binh nhì", "Binh nhất", "Hạ sĩ", "Trung sĩ", "Thượng sĩ"];
  const positions = ["Chiến sĩ", "Tiểu đội trưởng", "Khẩu đội trưởng"];

  // Logic viết tắt Cấp bậc & Chức vụ
  const getRankAbbr = (rank) => {
    const map = { 'Binh nhì': 'BN', 'Binh nhất': 'B1', 'Hạ sĩ': 'H1', 'Trung sĩ': 'H2', 'Thượng sĩ': 'H3' };
    return map[rank] || rank;
  };
  const getPosAbbr = (pos) => {
    const map = { 'Chiến sĩ': 'cs', 'Tiểu đội trưởng': 'at', 'Khẩu đội trưởng': 'kđt' };
    return map[pos] ? map[pos].toLowerCase() : pos.toLowerCase();
  };

  const checkRegistered = (phone) => officers.some(u => u.phone === phone);

  // New filteredData uses both searchQuery and filterConfig
  const filteredData = useMemo(() => {
    const q = (searchQuery || '').trim().toLowerCase();

    const results = soldiers.filter(s => {
      // search across fields
      const haystack = [s.fullName, s.unitCode, s.unitPath, s.address, s.phoneRelative].filter(Boolean).join(' ').toLowerCase();
      if (q && !haystack.includes(q)) return false;

      // ranks filter
      if (filterConfig.ranks && filterConfig.ranks.length > 0 && !filterConfig.ranks.includes(s.rank)) return false;

      // positions filter
      if (filterConfig.positions && filterConfig.positions.length > 0 && !filterConfig.positions.includes(s.position)) return false;

      // hasRelative filter
      if (filterConfig.hasRelative === true && !checkRegistered(s.phoneRelative)) return false;
      if (filterConfig.hasRelative === false && checkRegistered(s.phoneRelative)) return false;

      // hometown filter (new)
      if (filterConfig.hometown && !s.address.toLowerCase().includes(filterConfig.hometown.toLowerCase())) return false;

      // enlistYear filter (new)
      if (filterConfig.enlistYear && new Date(s.enlistDate || s.enlist).getFullYear() !== Number(filterConfig.enlistYear)) return false;

      // unit filter (exact match to selected unit)
      if (filterConfig.unit) {
        const u = (s.unitCode || s.unitPath || '').trim();
        if (!u || u !== filterConfig.unit) return false;
      }

      return true;
    });

    const rankPriority = { 'Binh nhì': 1, 'Binh nhất': 2, 'Hạ sĩ': 3, 'Trung sĩ': 4, 'Thượng sĩ': 5 };
    results.sort((a, b) => {
      const ra = rankPriority[a.rank] || 99;
      const rb = rankPriority[b.rank] || 99;
      if (ra !== rb) return ra - rb;
      return (a.fullName || '').localeCompare(b.fullName || '');
    });

    return results;
  }, [soldiers, searchQuery, filterConfig, officers, currentUser]);

  const renderItem = ({ item }) => {
    const isReg = checkRegistered(item.phoneRelative);

    const formatEnlist = (val) => {
      if (!val) return '';
      try {
        const d = new Date(val);
        if (isNaN(d.getTime())) return '';
        const mm = ("0" + (d.getMonth() + 1)).slice(-2);
        const yyyy = d.getFullYear();
        return `NN:${mm}/${yyyy}`;
      } catch (e) { return ''; }
    };

    const enlistLabel = formatEnlist(item.enlistDate || item.enlist);

    return (
      <TouchableOpacity 
        style={styles.card}
        onPress={() => router.push({ pathname: '/SoldierDetail', params: { id: item._id } })}
      >
        <View style={styles.cardHeader}>
          {/* Avatar */}
          <View style={styles.avatarWrap}>
            {item.avatar ? (
              <Image source={{ uri: item.avatar }} style={styles.avatarLarge} />
            ) : (
              <View style={styles.avatarPlaceholderLarge}>
                <Text style={styles.avatarInitial}>{item.fullName ? item.fullName.charAt(0).toUpperCase() : 'C'}</Text>
              </View>
            )}
          </View>

          <View style={styles.infoCol}>
            <Text style={styles.rankSmall}>{item.rank}</Text>
            <Text style={styles.nameSmall}>{item.fullName}</Text>

            {/* Position row without status tag */}
            <View style={styles.subInfoRow}>
              <Text style={[styles.subInfo, { flex: 1 }]} numberOfLines={1}>{getPosAbbr(item.position)}</Text>
            </View>

            {/* Unit row on its own line with status tag at the right */}
            <View style={styles.unitRow}>
              <Text style={styles.unitText}>Đơn vị: {item.unitCode}</Text>
              <View style={styles.inlineStatusRight}>
                <View style={[styles.tag, isReg ? styles.tagGreen : styles.tagOrange]}>
                  {isReg ? <UserCheck size={12} color="#27ae60" /> : <UserMinus size={12} color="#f39c12" />}
                  <Text style={[styles.tagText, { color: isReg ? '#27ae60' : '#f39c12' }]}>{isReg ? 'Đã có TN' : 'Chưa có TN'}</Text>
                </View>
              </View>
            </View>

          </View>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.locRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <MapPin size={14} color="#888" />
              <Text style={styles.locText} numberOfLines={1}>{item.address}{enlistLabel ? ` • ${enlistLabel}` : ''}</Text>
            </View>
            {/* removed inline chevron from here to allow absolute positioning */}
          </View>
        </View>

        {/* Chevron anchored to the far right-bottom of the card */}
        <View style={styles.chevronAbsolute} pointerEvents="none">
          <ChevronRight size={18} color="#CCC" />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Search size={18} color="#999" />
          <TextInput 
            placeholder="Tìm tên hoặc đơn vị..." 
            placeholderTextColor="#999"
            style={styles.input} 
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity style={styles.filterBtn} onPress={() => setShowFilterModal(true)}>
            <Sliders size={18} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter modal */}
      <Modal visible={showFilterModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Tùy chọn lọc</Text>
            <ScrollView style={{ maxHeight: 300 }}>
              <Text style={[styles.modalSectionTitle]}>Cấp bậc</Text>
               {ranks.map(r => (
                 <TouchableOpacity key={r} style={styles.modalRow} onPress={() => {
                   setFilterConfig(prev => {
                     const exists = prev.ranks.includes(r);
                     return { ...prev, ranks: exists ? prev.ranks.filter(x => x !== r) : [...prev.ranks, r] };
                   });
                 }}>
                   <Text style={styles.modalLabel}>{r}</Text>
                   <Text>{filterConfig.ranks.includes(r) ? '✓' : ''}</Text>
                 </TouchableOpacity>
               ))}

              <Text style={[styles.modalSectionTitle]}>Chức vụ</Text>
               {positions.map(p => (
                 <TouchableOpacity key={p} style={styles.modalRow} onPress={() => {
                   setFilterConfig(prev => {
                     const exists = prev.positions.includes(p);
                     return { ...prev, positions: exists ? prev.positions.filter(x => x !== p) : [...prev.positions, p] };
                   });
                 }}>
                   <Text style={styles.modalLabel}>{p}</Text>
                   <Text>{filterConfig.positions.includes(p) ? '✓' : ''}</Text>
                 </TouchableOpacity>
               ))}

              <Text style={[styles.modalSectionTitle]}>Người thân</Text>
               <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                 <TouchableOpacity onPress={() => setFilterConfig(prev => ({ ...prev, hasRelative: null }))} style={styles.modalRowSmall}><Text>Toàn bộ</Text><Text>{filterConfig.hasRelative === null ? '✓' : ''}</Text></TouchableOpacity>
                 <TouchableOpacity onPress={() => setFilterConfig(prev => ({ ...prev, hasRelative: true }))} style={styles.modalRowSmall}><Text>Có người nhà</Text><Text>{filterConfig.hasRelative === true ? '✓' : ''}</Text></TouchableOpacity>
                 <TouchableOpacity onPress={() => setFilterConfig(prev => ({ ...prev, hasRelative: false }))} style={styles.modalRowSmall}><Text>Chưa có</Text><Text>{filterConfig.hasRelative === false ? '✓' : ''}</Text></TouchableOpacity>
               </View>

              <Text style={[styles.modalSectionTitle]}>Quê quán</Text>
              {hometownCounts.length === 0 ? (
                <Text style={{ color: '#666', fontSize: 13, marginBottom: 8 }}>Không có dữ liệu</Text>
              ) : hometownCounts.map(([name, count]) => (
                <TouchableOpacity key={name} style={styles.modalRow} onPress={() => setFilterConfig(prev => ({ ...prev, hometown: prev.hometown === name ? '' : name }))}>
                  <Text style={styles.modalLabel}>{name} <Text style={{ color: '#AAA' }}>({count})</Text></Text>
                  <Text>{filterConfig.hometown === name ? '✓' : ''}</Text>
                </TouchableOpacity>
              ))}

              <Text style={[styles.modalSectionTitle]}>Năm nhập ngũ</Text>
              {enlistYearCounts.length === 0 ? (
                <Text style={{ color: '#666', fontSize: 13, marginBottom: 8 }}>Không có dữ liệu</Text>
              ) : enlistYearCounts.map(([year, count]) => (
                <TouchableOpacity key={year} style={styles.modalRow} onPress={() => setFilterConfig(prev => ({ ...prev, enlistYear: prev.enlistYear === year ? '' : year }))}>
                  <Text style={styles.modalLabel}>{year} <Text style={{ color: '#AAA' }}>({count})</Text></Text>
                  <Text>{filterConfig.enlistYear === year ? '✓' : ''}</Text>
                </TouchableOpacity>
              ))}

              <Text style={[styles.modalSectionTitle]}>Đơn vị</Text>
              {unitCounts.length === 0 ? (
                <Text style={{ color: '#666', fontSize: 13, marginBottom: 8 }}>Không có dữ liệu</Text>
              ) : unitCounts.map(([name, count]) => (
                <TouchableOpacity key={name} style={styles.modalRow} onPress={() => setFilterConfig(prev => ({ ...prev, unit: prev.unit === name ? '' : name }))}>
                  <Text style={styles.modalLabel}>{name} <Text style={{ color: '#AAA' }}>({count})</Text></Text>
                  <Text>{filterConfig.unit === name ? '✓' : ''}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
              <TouchableOpacity style={styles.modalBtn} onPress={() => { setFilterConfig({ ranks: [], positions: [], hasRelative: null, hometown: '', enlistYear: '' }); }}>
                <Text style={styles.modalBtnText}>Xóa</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: COLORS.primary }]} onPress={() => setShowFilterModal(false)}>
                <Text style={[styles.modalBtnText, { color: '#FFF' }]}>Áp dụng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.summaryBox}>
        <Text style={styles.summaryText}>Tổng số: <Text style={{fontWeight:'bold'}}>{filteredData.length}</Text> chiến sĩ</Text>
      </View>
      {/* Active filter summary */}
      <View style={{ paddingHorizontal: 15, paddingBottom: 6 }}>
        <Text style={{ fontSize: 12, color: '#666' }}>{getFilterSummary(filterConfig, currentUser)}</Text>
      </View>

      <FlatList
        data={filteredData}
        keyExtractor={item => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={<Text style={styles.empty}>Không có dữ liệu chiến sĩ</Text>}
      />

      {/* Nút Thêm Mới (FAB) neo ở dưới */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => router.push({
          pathname: '/AddSoldier',
          params: { currentUser: JSON.stringify(currentUser) }
        })}
      >
        <Plus size={30} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  searchSection: { padding: 15, backgroundColor: '#FFF', flexDirection: 'row', alignItems: 'center' },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F3F5', paddingHorizontal: 12, borderRadius: 10, height: 45, flex: 1 },
  input: { flex: 1, marginLeft: 8, fontSize: 14, color: '#333' },
  filterBtn: { marginLeft: 8, backgroundColor: COLORS.primary, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8 },
  filterBtnText: { color: '#FFF', fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '90%', backgroundColor: '#FFF', borderRadius: 12, padding: 16 },
  modalTitle: { fontWeight: '700', fontSize: 16, marginBottom: 8 },
  modalSectionTitle: { backgroundColor: '#F5F7FA', padding: 8, borderRadius: 8, marginTop: 10, marginBottom: 6, fontWeight: '700' },
  modalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  modalRowSmall: { flex: 1, alignItems: 'center', padding: 8 },
  modalLabel: { fontSize: 14 },
  modalBtn: { padding: 10, borderRadius: 8, backgroundColor: '#EEE', flex: 1, alignItems: 'center', marginHorizontal: 6 },
  modalBtnText: { fontWeight: '700' },
  summaryBox: { paddingHorizontal: 15, paddingVertical: 8 },
  summaryText: { fontSize: 13, color: '#555' },
  listContainer: { padding: 15, paddingBottom: 100 },
  card: { backgroundColor: '#FFF', borderRadius: 12, padding: 12, marginBottom: 10, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  avatarWrap: { width: 64, alignItems: 'center', marginRight: 12 },
  avatarLarge: { width: 64, height: 64, borderRadius: 32 },
  avatarPlaceholderLarge: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center' },
  avatarInitial: { fontSize: 20, color: '#AAA', fontWeight: '700' },
  infoCol: { flex: 1, marginLeft: 10 },
  nameSmall: { fontSize: 13, fontWeight: '600', color: '#333', marginBottom: 2 },
  rankSmall: { fontSize: 11, color: '#888', marginBottom: 2 },
  subInfoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', marginTop: 3 },
  subInfo: { fontSize: 11, color: '#777', lineHeight: 14 },
  unitRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 3 },
  unitText: { fontSize: 11, color: '#777', lineHeight: 14 },
  tag: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  tagGreen: { backgroundColor: '#E8F5E9' },
  tagOrange: { backgroundColor: '#FFF3E0' },
  tagText: { fontSize: 10, fontWeight: '700', marginLeft: 6 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F8F9FA', paddingTop: 10 },
  locText: { fontSize: 11, color: '#777', marginLeft: 6 },
  chevronAbsolute: { position: 'absolute', right: 12, bottom: 12 },
  fab: { position: 'absolute', right: 20, bottom: 20, width: 60, height: 60, borderRadius: 30, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', elevation: 5, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 5 },
  empty: { textAlign: 'center', marginTop: 50, color: '#999' }
});

// helper for filter summary
function getFilterSummary(cfg, currentUser) {
  const parts = [];
  if (cfg.ranks && cfg.ranks.length) parts.push(`Cấp bậc: ${cfg.ranks.join(', ')}`);
  if (cfg.positions && cfg.positions.length) parts.push(`Chức vụ: ${cfg.positions.join(', ')}`);
  if (cfg.hasRelative === true) parts.push('Có người nhà');
  if (cfg.hasRelative === false) parts.push('Chưa có người nhà');
  if (cfg.hometown) parts.push(`Quê quán: ${cfg.hometown}`);
  if (cfg.enlistYear) parts.push(`Năm nhập ngũ: ${cfg.enlistYear}`);
  if (cfg.unit) parts.push(`Đơn vị: ${cfg.unit}`);
  return parts.length ? 'Đang lọc: ' + parts.join(' • ') : '';
}