// Upload utility for IdeiaSpace projects
const fs = require('fs');
const path = require('path');

class ProjectUploader {
    constructor() {
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
}

module.exports = ProjectUploader;
