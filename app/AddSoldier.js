import React from 'react';
import AddSoldier from './screens/home_screens/tabs/sub_tabs/AddSoldier';

export default function Page(props) {
  // expo-router will provide navigation/route automatically; forward them
  return <AddSoldier {...props} />;
}
