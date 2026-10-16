import { useLocalSearchParams, useRouter } from "expo-router";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { getSelectedImage } from "../../services/selectedImage";

const categories: Record<string, { name: string; color: string; description: string }> = {
  battery: { name: "Bateria", color: "#D77A19", description: "Encaminhe pilhas e baterias a um ponto específico de coleta." },
  glass: { name: "Vidro", color: "#20884E", description: "Cor de referência na coleta seletiva: verde." },
  metal: { name: "Metal", color: "#AB8C1C", description: "Cor de referência na coleta seletiva: amarelo." },
  organic: { name: "Orgânico", color: "#80513B", description: "Cor de referência na coleta seletiva: marrom." },
  paper: { name: "Papel", color: "#286CB5", description: "Cor de referência na coleta seletiva: azul." },
  plastic: { name: "Plástico", color: "#C63E42", description: "Cor de referência na coleta seletiva: vermelho." },
};

export default function Resultado() {
  const router = useRouter();
  const { data } = useLocalSearchParams<{ data?: string }>();
  const selectedImage = getSelectedImage();
  const previewUri = selectedImage
    ? `data:${selectedImage.mimeType};base64,${selectedImage.base64}`
    : null;
  let prediction: { status?: string; label?: string; confidence?: number | null } | null = null;
  try {
    const parsed = JSON.parse(typeof data === "string" ? data : "{}");
    prediction = parsed?.workerResults?.flatMap((worker: any) => worker.predictions ?? [])[0] ?? null;
  } catch {
    prediction = null;
  }

  const category = prediction?.label ? categories[prediction.label] : undefined;
  const success = prediction?.status === "OK" && Boolean(category);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Resultado da análise</Text>
      {previewUri
        ? <Image source={{ uri: previewUri }} style={styles.image} resizeMode="contain" />
        : null}
      <View style={styles.card}>
        <Text style={[styles.result, { color: category?.color || "#355C49" }]}>
          {success ? category?.name : "Classificação indisponível"}
        </Text>
        {success && prediction?.confidence != null
          ? <Text style={styles.text}>Confiança: {(prediction.confidence * 100).toFixed(1)}%</Text>
          : null}
        <Text style={styles.text}>
          {success
            ? category?.description
            : prediction?.status === "MODEL_NOT_LOADED"
              ? "O servidor respondeu, mas o modelo ainda não foi carregado."
              : "Não foi possível obter uma classificação válida. Verifique os workers."}
        </Text>
      </View>
      <Text style={styles.disclaimer}>Classificação experimental. Consulte as orientações locais de descarte.</Text>
      <Pressable style={styles.button} onPress={() => router.replace("/(tabs)")}>
        <Text style={styles.buttonText}>Classificar outra foto</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, alignItems: "center", gap: 20, backgroundColor: "#F4FBF6" },
  title: { fontSize: 28, fontWeight: "800", color: "#184D32", marginTop: 25 },
  image: { width: "100%", height: 230, borderRadius: 18, backgroundColor: "#E7F2E9" },
  card: { width: "100%", padding: 26, backgroundColor: "#FFFFFF", borderRadius: 20, gap: 14, alignItems: "center" },
  result: { fontSize: 28, fontWeight: "800", textAlign: "center" },
  text: { fontSize: 16, color: "#375543", lineHeight: 24, textAlign: "center" },
  disclaimer: { fontSize: 13, color: "#617568", textAlign: "center" },
  button: { backgroundColor: "#177245", padding: 17, width: "100%", borderRadius: 16 },
  buttonText: { textAlign: "center", color: "#FFFFFF", fontWeight: "700", fontSize: 17 },
});
