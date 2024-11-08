// index.ts
import {onRequest} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import * as sgMail from "@sendgrid/mail";
import * as functions from "firebase-functions"; // Importa functions

// Configura SendGrid
sgMail.setApiKey(functions.config().sendgrid.key);

export const sendEmail = onRequest(async (request, response) => {
  const {to, subject, message} = request.body; // Sin espacios innecesarios

  const msg = {
    to, // El correo del destinatario
    from: "fkscomandita@gmail.com",
    subject,
    html: `
      <div style="text-align: center;">
        <img src="https://firebasestorage.googleapis.com/v0/b/tu-proyecto.appspot.com/o/assets%2Flogo.png?alt=media" alt="Logo de la Empresa" style="width: 150px;"/>
        <h1 style="color: #333;">Cabecera del Correo</h1>
        <p style="font-size: 16px; color: #555;">${message}</p>
      </div>
    `,
  };

  try {
    await sgMail.send(msg);
    logger.info("Correo enviado a:", to);
    response.status(200).send("Correo enviado con éxito.");
  } catch (error) {
    logger.error("Error al enviar correo:", error);
    response.status(500).send("Error al enviar el correo.");
  }
});
