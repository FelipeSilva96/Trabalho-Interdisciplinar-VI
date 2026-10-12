import React, { useState } from "react";
import { View, StyleSheet, Text, ActivityIndicator } from "react-native";
import ImageViewer from "../../../components/ImageViewer";
import {router, useLocalSearchParams, useRouter} from 'expo-router';
import Button from "../../../components/Button";
import API_URL from "../../services/api";



export default function imagemSelecionada() {

  const router = useRouter();

  const { imageUri } = useLocalSearchParams<{imageUri: string}>();
  const { imageType } = useLocalSearchParams<{imageType: string}>();
  console.log("URI RECEBIDA => " + imageUri);
  console.log("tipo da imagem recebido =>" + imageType)

  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<any>(null);
  const [erro, setErro] = useState<string | null>(null);


const classifyImage = async () => {
  if (!imageUri || Array.isArray(imageUri)) {
    setErro("Nenhuma imagem foi selecionada.");
    return;
  }

  setLoading(true);
  setErro(null);
  setResultado(null);

  try {
    /*criação de um formulário para guardar dados da imagem*/
    const formData = new FormData();

    formData.append("files", {
      uri: imageUri,
      name: "residuo.jpg",
      type: imageType,
    } as any);

    /*Envia o formulario para a API do backend */
    const response = await fetch(
      `${API_URL}/api/v1/classifications?strategy=distributed`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      const detalhe = await response.text();
      throw new Error(
        `Erro HTTP ${response.status}: ${detalhe}`
      );
    }

    /* recebe a resposta */
    const data = await response.json();
    console.log("Dados obtidos da resposta da api => " + data);
    setResultado(data);

    router.navigate({
      pathname: "/separateScreens/resultado",
      params: {
        data: JSON.stringify(data),
      },
    });

    console.log("Resultado da classificação:", data);
  } catch (error) {
    console.error("Falha ao classificar imagem:", error);

    setErro(
      error instanceof Error
        ? error.message
        : "Não foi possível classificar a imagem."
    );
  } finally {
    setLoading(false);
  }
};


  return (
  <View style ={styles.container}>
    <Text style = {styles.topText}>Sua imagem</Text>
    <View style={{margin:40}}></View>
    <View style={styles.imageContainer}>
      <ImageViewer imgSource={imageUri} mainImage={false}/>
    </View>
    <View style={{margin:15}}></View>
    <Button label="Classificar" theme="third" onPress={classifyImage}/>
  </View>
  );
}


const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  imageContainer:{
    
    alignItems: "center",
    borderRadius:5,
    justifyContent: "center"
  },
  topText:{  
    marginTop:70,
    fontSize:30,
    fontFamily: "Inter-Black",
  }
})
