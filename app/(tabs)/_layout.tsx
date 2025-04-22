import type React from "react";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Tabs } from "expo-router";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";

export default function TabLayout(): React.JSX.Element {
  const colorScheme = useColorScheme();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
      }}
    >
      {/*
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="home-filled" size={24} color={color} />
          ),
          tabBarLabel: "Home",
        }}
      />
      */}
      <Tabs.Screen
        name="create"
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="image" size={24} color={color} />
          ),
          tabBarLabel: "Text2Image",
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color }) => (
            <FontAwesome6 name="user-large" size={24} color={color} />
          ),
          tabBarLabel: "Profile",
        }}
      />
    </Tabs>
  );
};
