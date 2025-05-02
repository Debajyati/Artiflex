import { useClerk } from "@clerk/clerk-expo";
import * as Linking from "expo-linking";
import { TouchableOpacity } from "react-native";
import ThemedText from "@/components/ThemedText";
import styles from "@/app/styles";

export default function SignOutButton() {
  const { signOut } = useClerk();

  const handleSignOut = async () => {
    try {
      await signOut();
      Linking.openURL(Linking.createURL("/"));
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
    }
  };

  return (
    <TouchableOpacity
      onPress={handleSignOut}
      style={{ ...styles.button, backgroundColor: "#FF3B30" }}
    >
      <ThemedText type="defaultSemiBold" style={styles.buttonText}>
        Sign Out
      </ThemedText>
    </TouchableOpacity>
  );
};
