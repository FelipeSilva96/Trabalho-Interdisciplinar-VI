import React from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { File, Paths } from "expo-file-system";
import { setSelectedImage } from "../../services/selectedImage";

export default function Inicio() {
  const router = useRouter();

  const selectImage = async (fromCamera: boolean) => {
    try {
      if (fromCamera) {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          Alert.alert("Acesso à câmera", "Autorize o uso da câmera para tirar uma foto.");
          return;
        }
      }

      const options: ImagePicker.ImagePickerOptions = {
        mediaTypes: ["images"],
        quality: 0.85,
        allowsEditing: false,
        base64: true,
      };
      const result = fromCamera
        ? await ImagePicker.launchCameraAsync(options)
        : await ImagePicker.launchImageLibraryAsync(options);

      if (result.canceled || !result.assets[0]) return;
      const asset = result.assets[0];
      console.log("[image-picker] selected asset", {
        scheme: asset.uri.split(":")[0],
        mimeType: asset.mimeType,
        width: asset.width,
        height: asset.height,
        fileSize: asset.fileSize,
      });
      const extension = asset.mimeType === "image/png" ? "png" : "jpg";
      const sourceFile = new File(asset.uri);
      const destinationFile = new File(Paths.document, `selected-image-${Date.now()}.${extension}`);
      await sourceFile.copy(destinationFile);
      if (!destinationFile.exists) {
        throw new Error("A imagem selecionada não pôde ser salva no armazenamento do aplicativo.");
      }
      if (!asset.base64) {
        throw new Error("O seletor não retornou os dados necessários para a pré-visualização.");
      }
      setSelectedImage({
        base64: asset.base64,
        mimeType: asset.mimeType || "image/jpeg",
      });
      console.log("[image-picker] persisted asset", {
        scheme: destinationFile.uri.split(":")[0],
        size: destinationFile.size,
      });

      router.push({
        pathname: "/separateScreens/imagemSelecionada",
        params: {
          imageUri: destinationFile.uri,
          imageType: asset.mimeType || "image/jpeg",
        },
      });
    } catch (error) {
      console.error("[image-picker] failed to persist selected image", error);
      Alert.alert("Não foi possível abrir a foto", "A imagem não pôde ser preparada para visualização. Tente novamente.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>♻</Text>
      <Text style={styles.title}>Classifica Resíduo</Text>
      <Text style={styles.subtitle}>Tire uma foto ou escolha uma imagem para identificar o material.</Text>
      <Pressable style={styles.primary} onPress={() => selectImage(true)}>
        <Text style={styles.primaryText}>Tirar foto</Text>
      </Pressable>
      <Pressable style={styles.secondary} onPress={() => selectImage(false)}>
        <Text style={styles.secondaryText}>Escolher da galeria</Text>
      </Pressable>
      <Text style={styles.footer}>PUC Minas • Trabalho Interdisciplinar VI</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 26, gap: 18, backgroundColor: "#F4FBF6" },
  icon: { fontSize: 72, color: "#177245" },
  title: { fontSize: 30, fontWeight: "800", color: "#184D32", textAlign: "center" },
  subtitle: { fontSize: 17, lineHeight: 25, textAlign: "center", color: "#52745F", marginBottom: 22 },
  primary: { width: "100%", borderRadius: 16, backgroundColor: "#177245", padding: 18 },
  primaryText: { fontSize: 17, fontWeight: "700", color: "#FFFFFF", textAlign: "center" },
  secondary: { width: "100%", borderRadius: 16, borderWidth: 2, borderColor: "#177245", padding: 16 },
  secondaryText: { fontSize: 17, fontWeight: "700", color: "#177245", textAlign: "center" },
  footer: { fontSize: 13, color: "#7A9181", marginTop: 25 },
});
