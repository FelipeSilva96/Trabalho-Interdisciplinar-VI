import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, Pressable } from "react-native";
import { Image } from "react-native";
import { File } from "expo-file-system";
import { useLocalSearchParams, useRouter } from "expo-router";
import API_URL from "../../services/api";
import { getSelectedImage } from "../../services/selectedImage";

export default function ImagemSelecionada() {
  const router = useRouter();
  const params = useLocalSearchParams<{ imageUri?: string | string[]; imageType?: string | string[] }>();
  const imageUri = Array.isArray(params.imageUri) ? params.imageUri[0] || "" : params.imageUri || "";
  const imageTypeValue = Array.isArray(params.imageType) ? params.imageType[0] : params.imageType;
  const imageType = imageTypeValue || "image/jpeg";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewUri, setPreviewUri] = useState<string | null>(null);

  useEffect(() => {
    const selectedImage = getSelectedImage();
    if (!selectedImage) {
      setPreviewError("Os dados da pré-visualização não estão mais disponíveis.");
      return;
    }
    setPreviewUri(`data:${selectedImage.mimeType};base64,${selectedImage.base64}`);
    console.log("[image-preview] prepared", { bytes: selectedImage.base64.length });
  }, [imageUri, imageType]);

  const classify = async () => {
    if (!imageUri || loading) return;
    setLoading(true);
    setError(null);
    try {
      const imageResponse = await fetch(imageUri);
      if (!imageResponse.ok) {
        throw new Error("Não foi possível ler a imagem selecionada.");
      }
      const imageBlob = await imageResponse.blob();
      const extension = imageType === "image/png" ? "png" : "jpg";
      const form = new FormData();
      form.append("files", imageBlob, `residuo.${extension}`);
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 60000);
      let response: Response;
      try {
        response = await fetch(`${API_URL}/api/v1/classifications?strategy=distributed&protocol=grpc`, {
          method: "POST",
          body: form,
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timer);
      }
      if (!response.ok) throw new Error(`O servidor retornou o código ${response.status}.`);
      const data = await response.json();
      router.push({
        pathname: "/separateScreens/resultado",
        params: { data: JSON.stringify(data), imageUri },
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Não foi possível enviar a imagem.";
      setError(message);
      Alert.alert("Falha na classificação", "Verifique a conexão com o servidor e tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Sua imagem</Text>
      <Text style={styles.subtitle}>Confira a foto antes de enviar para análise.</Text>
      {previewUri
        ? <Image
            key={previewUri}
            source={{ uri: previewUri }}
            style={styles.preview}
            resizeMode="contain"
            onLoad={() => {
              setPreviewError(null);
              console.log("[image-preview] loaded", { scheme: previewUri.split(":")[0] });
            }}
            onError={(event) => {
              const message = event.nativeEvent.error || "O componente de imagem não conseguiu abrir esta URI.";
              setPreviewError(message);
              console.error("[image-preview] failed", {
                scheme: previewUri.split(":")[0],
                message,
              });
            }}
          />
        : imageUri && !previewError
          ? <ActivityIndicator size="large" color="#177245" />
          : <Text>{imageUri ? "Não foi possível preparar a imagem." : "Nenhuma imagem selecionada."}</Text>}
      {previewError ? <Text style={styles.error}>Falha na pré-visualização: {previewError}</Text> : null}
      {loading
        ? <ActivityIndicator size="large" color="#177245" />
        : <Pressable style={styles.button} onPress={classify}><Text style={styles.buttonText}>Classificar</Text></Pressable>}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, gap: 18, alignItems: "center", backgroundColor: "#F4FBF6" },
  title: { marginTop: 32, fontSize: 28, fontWeight: "800", color: "#184D32" },
  subtitle: { fontSize: 16, color: "#557362", textAlign: "center" },
  preview: { width: "100%", height: 330, borderRadius: 18, backgroundColor: "#E7F2E9" },
  button: { width: "100%", borderRadius: 16, padding: 18, backgroundColor: "#177245" },
  buttonText: { color: "#FFFFFF", fontSize: 18, fontWeight: "700", textAlign: "center" },
  error: { color: "#B42318", textAlign: "center" },
});
