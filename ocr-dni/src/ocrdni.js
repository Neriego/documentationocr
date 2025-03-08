import React, { useState, useRef } from "react";
import Tesseract from "tesseract.js";

const OCRDNI = () => {
  const [image, setImage] = useState(null);
  const [dniData, setDniData] = useState({ dni: "", nombre: "", fecha: "" });
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error al acceder a la cámara:", error);
    }
  };

  const takePicture = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      context.drawImage(videoRef.current, 0, 0, 300, 200);
      const imageData = canvasRef.current.toDataURL("image/png");
      setImage(imageData);
      processOCR(imageData);
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
    <div style={{ textAlign: "center" }}>
      <h2>Escanea tu DNI</h2>
      <video ref={videoRef} autoPlay playsInline width="300" height="200"></video>
      <canvas ref={canvasRef} style={{ display: "none" }} width="300" height="200"></canvas>
      <br />
      <button onClick={startCamera}>Activar Cámara</button>
      <button onClick={takePicture}>Tomar Foto</button>
      {image && <img src={image} alt="DNI" style={{ width: "300px", marginTop: "10px" }} />}
      
      <div>
        <label>DNI:</label> <input type="text" value={dniData.dni} readOnly /><br />
        <label>Nombre:</label> <input type="text" value={dniData.nombre} readOnly /><br />
        <label>Fecha de Nacimiento:</label> <input type="text" value={dniData.fecha} readOnly /><br />
      </div>
    </div>
  );
};

export default OCRDNI;
