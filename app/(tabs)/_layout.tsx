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
      <Tabs.Screen
        name="create"
        options={{
          headerTitle: "Text2Image",
          headerTitleAlign: "center",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="image" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color }) => (
            <FontAwesome6 name="user-large" size={24} color={color} />
          ),
          headerTitle: "Profile",
          headerTitleAlign: "center",
        }}
      />
    </Tabs>
  );
};
