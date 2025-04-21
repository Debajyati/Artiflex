import ImageCreateScreen from "@/components/ImageCreateScreen";
import type React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import styles from "../styles";

const Prompt2Image = (): React.JSX.Element => {
  return (
    <SafeAreaView style={styles.container}>
      <ImageCreateScreen />
    </SafeAreaView>
  );
};

export default Prompt2Image;
