// upload.js
const { exec } = require('child_process');

function uploadToESP32(binPath, port = 'COM3', baudRate = 115200) {
  return new Promise((resolve, reject) => {
    const cmd = `python -m esptool --chip esp32 --port ${port} --baud ${baudRate} write_flash -z 0x1000 "${binPath}"`;

    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        reject(`Erro ao enviar para ESP32: ${stderr || error.message}`);
      } else {
        resolve(`Upload realizado com sucesso! Saída:\n${stdout}`);
      }
    });
  });
}

module.exports = { uploadToESP32 };

