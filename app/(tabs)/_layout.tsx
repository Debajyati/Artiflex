import type React from "react";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { Pressable } from "react-native";
import { Tabs, Link } from "expo-router";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import ThemedText from "@/components/ThemedText";

const TabLayout = (): React.JSX.Element => {
  const colorScheme = useColorScheme();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
      }}
    >
      <Tabs.Screen name="index"
        options={{
          tabBarLabel: "Home",
          headerRight: () => (
            <Link href="/profile" asChild>
              <Pressable>
                <ThemedText>
                  <FontAwesome6 name="user-large" size={24} color="black" />
                </ThemedText>
              </Pressable>
            </Link>
          ),
        }}
      />
      <Tabs.Screen name="create"
        options={{
          tabBarLabel: "Text2Image",
          headerRight: () => (
            <Link href="/profile" asChild>
              <Pressable>
                <ThemedText>
                  <FontAwesome6 name="image" size={24} color="black" />
                </ThemedText>
              </Pressable>
            </Link>
          ),
        }}
      />
    </Tabs>
  );
};

export default TabLayout;
