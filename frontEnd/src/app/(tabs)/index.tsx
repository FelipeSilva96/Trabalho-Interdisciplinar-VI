import { Text, View, StyleSheet } from "react-native";
import ImageViewer from "../../../components/ImageViewer";
import Button from "../../../components/Button";
import * as ImagePicker from "expo-image-picker"
import React, { useState } from "react";
import { useRouter } from "expo-router";
import ExpoImage from "expo-image/build/ExpoImage";
import { navigate } from "expo-router/build/global-state/router";


 
const recycleImage = require("../../../assets/images/Recycle.jpg")


export default function Index() {

  const router = useRouter();

  /*Funcao para selecionar a imagem do aparelho do usuario*/
  const pickImageAsync = async () => {

    let result = await ImagePicker.launchImageLibraryAsync({
      quality: 1, 
      mediaTypes: ['images']
    });

    /*Se o resultado nao for cancelado entao atribui se a imagem a variavel selectedUri */
    if (!result.canceled){
      /*console.log(result);*/
      const selectedUri = result.assets[0].uri;
      console.log("URI SELECIONADA => " + selectedUri)
      const encodedUri = encodeURIComponent(selectedUri)
      console.log("URI CODIFICADA => " + encodedUri)
      

      /*Envia a URI da imagem para outra pagina para ser mostrada ao usuario e o leva ate la*/ 
      router.navigate({
        pathname:"/separateScreens/imagemSelecionada",
        params: {imageUri:encodedUri}
      })
    }

    else{
      alert("nenhuma imagem selecionada");
    }

  }

  const [status, requestPermission] = ImagePicker.useCameraPermissions();

  const takeImageAsync = async () => {

    if (!status){
      return(
        <View>
          <Text>Carregando autorização</Text>
        </View>
      );
    }
    
    if (status.status !== 'granted') {
      const permissionResponse = await requestPermission();
      if (!permissionResponse.granted) {
        alert('É preciso autorizar a camera pra utilizar esta função');
        return;
      }
    }

    let result = await ImagePicker.launchCameraAsync({
      quality: 1,
      allowsEditing:true,
      mediaTypes: ['images']
    });

    if (!result.canceled){

      const imageTaken = result.assets[0].uri;
      const encodedUri = encodeURIComponent(imageTaken);

      router.navigate({
        pathname:"/separateScreens/imagemSelecionada",
        params: {imageUri: encodedUri}
      })
    }

    else {
      alert("Ação cancelada")
    }
  }
  
  return (

    <View style={styles.container}>
      
      <View style={styles.recycleStyle}>
        <ImageViewer imgSource={recycleImage} mainImage={true}/>
      </View>
      
      <Text style={styles.primaryText}>Classificador de resíduo</Text>

      <View style={styles.selectPhotostyle}>
        
        <Button label = "Escolher foto" theme="primary" onPress={pickImageAsync}/>
        <View style={{margin:7}}></View>
        <Button label = "Tirar foto" theme="secondary" onPress={takeImageAsync}/>
        
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex:1,
    alignItems: "center",
    backgroundColor: "#47b95e",
  },

  primaryText:{
    fontSize:30,
    fontFamily: "Inter-Black",
    textAlignVertical: "top",
    color:"#ffe596",
    flex:1,
  },

  recycleStyle:{
    flex:1,
    marginTop:110
  },

  selectPhotostyle:{
    flex:1,
    marginBottom:190,
  }
});
