import { Tabs } from 'expo-router/js-tabs';
import React from 'react';

import { NeoTabBar } from '@/components/NeoTabBar';

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <NeoTabBar {...props} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: '#FFF8E9' } }}>
      <Tabs.Screen name="dashboard" options={{ title: 'Inicio' }} />
      <Tabs.Screen name="projects" options={{ title: 'Proyectos' }} />
      <Tabs.Screen name="tasks" options={{ title: 'Tareas' }} />
      <Tabs.Screen name="profile" options={{ title: 'Perfil' }} />
    </Tabs>
  );
}
