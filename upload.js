/**
 * Upload utility for IdeiaSpace projects - DEPRECATED
 * Nova funcionalidade de upload agora está integrada no backend via Arduino CLI
 * 
 * Para usar a nova funcionalidade:
 * 1. Use o endpoint POST /api/arduino/upload do backend
 * 2. A nova implementação inclui verificação automática de pré-requisitos
 * 3. Upload direto via Arduino CLI com melhor tratamento de erros
 */

const fs = require('fs');
const path = require('path');

class ProjectUploader {
    constructor() {
        console.warn('⚠️ AVISO: Esta classe está depreciada.');
        console.warn('🚀 Use o novo sistema de upload via backend (/api/arduino/upload)');
        
        this.uploadPath = path.join(__dirname, 'uploads');
        this.ensureUploadDirectory();
    }
    
    ensureUploadDirectory() {
        if (!fs.existsSync(this.uploadPath)) {
            fs.mkdirSync(this.uploadPath, { recursive: true });
        }
    }
    
    uploadProject(projectData, filename) {
        return new Promise((resolve, reject) => {
            try {
                const filePath = path.join(this.uploadPath, filename);
                const jsonData = JSON.stringify(projectData, null, 2);
                
                fs.writeFileSync(filePath, jsonData);
                console.log('📁 Projeto salvo localmente:', filePath);
                console.log('💡 Para upload para ESP32, use o backend (/api/arduino/upload)');
                resolve(filePath);
            } catch (error) {
                reject(error);
            }
        });
    }
    
    loadProject(filename) {
        return new Promise((resolve, reject) => {
            try {
                const filePath = path.join(this.uploadPath, filename);
                const data = fs.readFileSync(filePath, 'utf8');
                resolve(JSON.parse(data));
            } catch (error) {
                reject(error);
            }
        });
    }
    
    listProjects() {
        try {
            return fs.readdirSync(this.uploadPath)
                .filter(file => file.endsWith('.json'))
                .map(file => ({
                    name: file,
                    path: path.join(this.uploadPath, file),
                    modified: fs.statSync(path.join(this.uploadPath, file)).mtime
                }));
        } catch (error) {
            return [];
        }
    }
    
    /**
     * Método para demonstrar como usar o novo sistema de upload
     */
    async demonstrateNewUpload() {
        console.log('🎯 NOVO SISTEMA DE UPLOAD:');
        console.log('');
        console.log('// Exemplo de uso do novo sistema via fetch:');
        console.log('const uploadCode = async (code, port, board = "esp32:esp32:esp32") => {');
        console.log('  const response = await fetch("http://localhost:3001/api/arduino/upload", {');
        console.log('    method: "POST",');
        console.log('    headers: { "Content-Type": "application/json" },');
        console.log('    body: JSON.stringify({ code, port, board })');
        console.log('  });');
        console.log('  return await response.json();');
        console.log('};');
        console.log('');
        console.log('✨ Vantagens do novo sistema:');
        console.log('• Verificação automática de pré-requisitos ESP32');
        console.log('• Upload direto via Arduino CLI');
        console.log('• Melhor tratamento de erros');
        console.log('• Compilação otimizada');
        console.log('• Feedback detalhado para o frontend');
    }
}

module.exports = ProjectUploader;