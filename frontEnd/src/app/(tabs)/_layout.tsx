import { Tabs } from "expo-router";
import { Ionicons } from '@react-native-vector-icons/ionicons';
import React from "react";

export default function TabsLayout() {
  return <Tabs>
    
    <Tabs.Screen name="index" options={{
      headerTitle:"Início",
      
      tabBarIcon: ({focused, color}) => (
      <Ionicons 
      name = {focused ? "home-sharp" : "home-outline"} 
      color={color}
      size={30} 
      />),
    }}
    />

    <Tabs.Screen name="sobre"  options={{
      headerTitle:"Sobre",

      tabBarIcon: ({focused,color}) => (
        <Ionicons
        name = {focused ? "information-circle" : "information-circle-outline"} 
        color={color}
        size={30}
        />),
    }}
    />
  </Tabs>;
}
