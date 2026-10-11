import React from "react";
import { View, StyleSheet, Text } from "react-native";
import ImageViewer from "../../../components/ImageViewer";
import {useRouter, useLocalSearchParams} from 'expo-router';
import Button from "../../../components/Button";
const placeholder = require("../../../assets/images/Recycle.jpg");


export default function imagemSelecionada() {

  const { imageUri } = useLocalSearchParams<{imageUri: string}>();
  console.log("URI RECEBIDA => " + imageUri)
  /*const decodedUri = imageUri ? decodeURIComponent(imageUri) : undefined;
  console.log("URI DECODIFICADA => " + decodedUri)
  const imageSrc = decodedUri ? { uri: decodedUri } : placeholder;
  console.log("IMAGEM QUE SERA MOSTRADA => " + imageSrc)*/

  const classifyImage = async () => {

  }

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
