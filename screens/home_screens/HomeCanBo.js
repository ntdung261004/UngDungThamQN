import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, SafeAreaView, ScrollView } from 'react-native';
import { LayoutGrid, CalendarDays, Users, MessageSquare, UserCircle, Newspaper, LogOut } from 'lucide-react-native';
import { COLORS } from '../../constants/theme';

import OverviewTab from './tabs/OverviewTab';
import ListTab from './tabs/ListTab';
import ScheduleTab from './tabs/ScheduleTab';
import PostTab from './tabs/PostTab';
import ContactTab from './tabs/ContactTab';
import AccountTab from './tabs/AccountTab';

const HomeCanBo = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('Overview');

  // FIX: Đảm bảo switch-case trả về đúng Component cho từng Tab
  const renderContent = () => {
    switch (activeTab) {
      case 'Overview': return <OverviewTab user={user} />;
      case 'List': return <ListTab user={user} />;
      case 'Schedule': return <ScheduleTab user={user} />;
      case 'Post': return <PostTab user={user} />;
      case 'Contact': return <ContactTab user={user} />;
      case 'Account': return <AccountTab user={user} onLogout={onLogout} />;
      default: return <OverviewTab user={user} />;
    }
  };

  const renderTopbar = () => {
    if (activeTab === 'Overview') {
      return (
        <View style={styles.topBarOverview}>
          <View style={styles.userInfo}>
            <View style={styles.avatarPlaceholder}>
              {user?.avatar ? <Image source={{ uri: user.avatar }} style={styles.avatarImg} /> : <UserCircle size={40} color="#DDD" />}
            </View>
            <View style={{ marginLeft: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
                {/* Cấp bậc: Nhỏ và xám, nằm cùng dòng với Tên */}
                {user?.rank && <Text style={styles.rankTextInline}>{user.rank} </Text>}
                <Text style={styles.userName}>{user?.fullName}</Text>
              </View>
              {/* Dòng 2: Chức vụ | Đơn vị */}
              <Text style={styles.userSub}>
                {user?.position || 'Cán bộ'} | {user?.unitCode || user?.unitPath}
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={onLogout} style={styles.logoutBtn}>
            <LogOut size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      );
    }
    const titles = { Schedule: 'Lịch Thăm', List: 'Danh Sách', Post: 'Bài Viết', Contact: 'Nhắn Tin', Account: 'Tài Khoản' };
    return (
      <View style={styles.topBarStandard}>
        <Text style={styles.topBarTitle}>{titles[activeTab] || 'Ứng dụng'}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {renderTopbar()}
      <View style={{ flex: 1 }}>{renderContent()}</View>
      <View style={styles.bottomNavContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.bottomNavScroll}>
          <NavItem icon={LayoutGrid} label="Tổng quan" active={activeTab === 'Overview'} onPress={() => setActiveTab('Overview')} />
          {/* LUÔN HIỆN ICON DANH SÁCH CHO TẤT CẢ USER */}
          <NavItem icon={Users} label="Danh sách" active={activeTab === 'List'} onPress={() => setActiveTab('List')} />
          <NavItem icon={CalendarDays} label="Lịch thăm" active={activeTab === 'Schedule'} onPress={() => setActiveTab('Schedule')} />
          <NavItem icon={Newspaper} label="Bài viết" active={activeTab === 'Post'} onPress={() => setActiveTab('Post')} />
          <NavItem icon={MessageSquare} label="Nhắn tin" active={activeTab === 'Contact'} onPress={() => setActiveTab('Contact')} />
          <NavItem icon={UserCircle} label="Tài khoản" active={activeTab === 'Account'} onPress={() => setActiveTab('Account')} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const NavItem = ({ icon: Icon, label, active, onPress }) => (
  <TouchableOpacity style={styles.navItem} onPress={onPress}>
    <Icon size={22} color={active ? COLORS.primary : '#666'} />
    <Text style={[styles.navLabel, { color: active ? COLORS.primary : '#666' }]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  topBarOverview: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#EEE' },
  userInfo: { flexDirection: 'row', alignItems: 'center' },
  avatarPlaceholder: { width: 45, height: 45, borderRadius: 25, backgroundColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center' },
  avatarImg: { width: 45, height: 45, borderRadius: 25 },
  userName: { fontSize: 17, fontWeight: 'bold', color: '#333' },
  rankTextInline: { fontSize: 13, color: '#888', fontWeight: '500', marginBottom: 1 }, // Style cho Cấp bậc cùng dòng
  userSub: { fontSize: 12, color: '#888', marginTop: 2 },
  topBarStandard: { height: 60, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#EEE' },
  topBarTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  bottomNavContainer: { backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#EEE' },
  bottomNavScroll: { paddingHorizontal: 10, height: 70, alignItems: 'center' },
  navItem: { width: 85, justifyContent: 'center', alignItems: 'center' },
  navLabel: { fontSize: 11, marginTop: 4, fontWeight: '500' },
  logoutBtn: { padding: 8 }
});

export default HomeCanBo;