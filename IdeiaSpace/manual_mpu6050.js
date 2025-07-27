// Manual MPU6050 sensor integration
const { SerialPort } = require('serialport');

class MPU6050 {
    constructor(port = 'COM3', baudRate = 9600) {
        this.port = new SerialPort({
            path: port,
            baudRate: baudRate
        });
        
        this.data = {
            accelerometer: { x: 0, y: 0, z: 0 },
            gyroscope: { x: 0, y: 0, z: 0 },
            temperature: 0
        };
        
        this.setupDataListener();
    }
    
    setupDataListener() {
        this.port.on('data', (data) => {
            try {
                const parsed = JSON.parse(data.toString());
                this.data = parsed;
            } catch (error) {
                console.error('Error parsing sensor data:', error);
            }
        });
    }
    
    getData() {
        return this.data;
    }
    
    calibrate() {
        return new Promise((resolve) => {
            this.port.write('CALIBRATE\n');
            setTimeout(() => {
                resolve(true);
            }, 3000);
        });
    }
    
    close() {
        this.port.close();
    }
}

module.exports = MPU6050;
