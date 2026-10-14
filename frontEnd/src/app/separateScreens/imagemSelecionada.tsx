import React, { useState } from "react";
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import API_URL from "../../services/api";

export default function ImagemSelecionada() {
  const router = useRouter();
  const params = useLocalSearchParams<{ imageUri?: string; imageType?: string }>();
  const imageUri = typeof params.imageUri === "string" ? params.imageUri : "";
  const imageType = typeof params.imageType === "string" && params.imageType ? params.imageType : "image/jpeg";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const classify = async () => {
    if (!imageUri || loading) return;
    setLoading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("files", {
        uri: imageUri,
        name: imageType === "image/png" ? "residuo.png" : "residuo.jpg",
        type: imageType,
      } as any);
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
      {imageUri
        ? <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="contain" />
        : <Text>Nenhuma imagem selecionada.</Text>}
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
