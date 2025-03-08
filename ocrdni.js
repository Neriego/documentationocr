import React, { useState, useRef } from "react";
import { View, Text, TouchableOpacity, TextInput, Image } from "react-native";
import { Camera, useCameraDevices } from "react-native-vision-camera";
import * as Tesseract from "tesseract.js";
import RNFS from "react-native-fs";

const OCRDNI = () => {
  const [imagePath, setImagePath] = useState(null);
  const [dniData, setDniData] = useState({ dni: "", nombre: "", fecha: "" });

  const cameraRef = useRef(null);
  const devices = useCameraDevices();
  const device = devices.back;

  if (!device) return <Text>No se encontró una cámara</Text>;

  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePhoto({
        quality: 85,
        skipMetadata: true,
      });

      const filePath = `${RNFS.DocumentDirectoryPath}/dni.jpg`;
      await RNFS.moveFile(photo.path, filePath);

      setImagePath(`file://${filePath}`);
      processOCR(filePath);
    }
  };

  const processOCR = async (imageUri) => {
    try {
      const { data } = await Tesseract.recognize(imageUri, "spa");
      const text = data.text;

      const dniMatch = text.match(/\b\d{7,8}\b/);
      const nombreMatch = text.match(/[A-ZÁÉÍÓÚÑ]{3,}\s[A-ZÁÉÍÓÚÑ]{3,}/);
      const fechaMatch = text.match(/\b\d{2}[/-]\d{2}[/-]\d{4}\b/);

      setDniData({
        dni: dniMatch ? dniMatch[0] : "",
        nombre: nombreMatch ? nombreMatch[0] : "",
        fecha: fechaMatch ? fechaMatch[0] : "",
      });
    } catch (error) {
      console.error("Error procesando OCR:", error);
    }
  };

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      {imagePath ? (
        <Image source={{ uri: imagePath }} style={{ width: 300, height: 200 }} />
      ) : (
        <Camera ref={cameraRef} style={{ width: 300, height: 200 }} device={device} isActive={true} />
      )}

      <TouchableOpacity onPress={takePicture} style={{ backgroundColor: "blue", padding: 10, margin: 10 }}>
        <Text style={{ color: "white" }}>Tomar Foto</Text>
      </TouchableOpacity>

      <TextInput placeholder="DNI" value={dniData.dni} style={{ borderBottomWidth: 1, width: 200 }} />
      <TextInput placeholder="Nombre" value={dniData.nombre} style={{ borderBottomWidth: 1, width: 200 }} />
      <TextInput placeholder="Fecha de Nacimiento" value={dniData.fecha} style={{ borderBottomWidth: 1, width: 200 }} />
    </View>
  );
};

export default OCRDNI;
