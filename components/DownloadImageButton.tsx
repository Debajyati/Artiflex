import * as MediaLibrary from "expo-media-library";
import * as FileSystem from "expo-file-system";
import { Pressable, PressableProps, Alert } from "react-native";
import styles from "@/app/styles";

async function ensureDirExists(imgDir: string) {
  const dirInfo = await FileSystem.getInfoAsync(imgDir);

  if (!dirInfo.exists) {
    console.log("Temporary image directory doesn't exist, creating…");
    await FileSystem.makeDirectoryAsync(imgDir, { intermediates: true });
  }
}

const imgDir = FileSystem.documentDirectory + "Artiflex/";

type DownloadImageButtonProps = {
  fileDataURI: string;
  children?: PressableProps["children"];
};

export default function DownloadImageButton({
  fileDataURI,
  children,
}: DownloadImageButtonProps) {
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();
  const imgFileUri =
    imgDir + `Artiflex_Generated_Image_${fileDataURI.split("/").pop()}`;

  async function downloadImage() {
    if (!fileDataURI) {
      Alert.alert(
        "Sorry!",
        "Image isn't downloadable. You may take a screenshot! :(",
      );
    }

    if (permissionResponse?.status !== "granted") {
      await requestPermission();
    }

    if (permissionResponse?.granted) {
      await ensureDirExists(imgDir);
      console.log("Downloading the generated image");

      const downloadResponse = await FileSystem.downloadAsync(
        fileDataURI,
        `${imgFileUri}.png`,
      );
      const asset = await MediaLibrary.createAssetAsync(imgFileUri);
      console.log(`downloadResponse : ${downloadResponse}`);
      console.log(`Image successfully saved!\n\t${asset}`);
    }
  }

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: pressed ? "#9999ff" : "#007bff",
          elevation: pressed ? 0 : 4,
        },
      ]}
      onPress={downloadImage}
      onPressIn={() => {
        Alert.alert("Image started downloading...");
      }}
    >
      {children}
    </Pressable>
  );
}
