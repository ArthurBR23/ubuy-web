import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

export async function enviarWhatsApp(celular, mensagem) {
  try {
    const response = await axios.post('https://api.zenvia.com/v2/channels/whatsapp/messages', {
      to: `55${celular.replace(/\D/g,'')}`, 
      from: process.env.ZENVIA_WHATSAPP,
      contents: [{ type: 'text', text: mensagem }]
    }, {
      headers: {
        'X-API-TOKEN': process.env.ZENVIA_TOKEN,
        'Content-Type': 'application/json'
      }
    });

    console.log('WhatsApp enviado:', response.data);
  } catch (err) {
    console.error('Erro WhatsApp Zenvia:', err.response?.data || err.message);
  }
}

export async function enviarSMS(celular, mensagem) {
  try {
    const response = await axios.post('https://api.zenvia.com/v2/channels/sms/messages', {
      to: `55${celular.replace(/\D/g,'')}`,
      from: process.env.ZENVIA_SMS,
      contents: [{ type: 'text', text: mensagem }]
    }, {
      headers: {
        'X-API-TOKEN': process.env.ZENVIA_TOKEN,
        'Content-Type': 'application/json'
      }
    });

    console.log('SMS enviado:', response.data);
  } catch (err) {
    console.error('Erro SMS Zenvia:', err.response?.data || err.message);
  }
}
