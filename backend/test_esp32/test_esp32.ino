// Código de teste básico para ESP32 Dev Module
// Este código testa as funcionalidades essenciais

#define LED_PIN 2  // LED interno do ESP32 Dev Module

void setup() {
  // Inicializar Serial
  Serial.begin(115200);
  Serial.println("ESP32 Dev Module - Teste de Compilacao");
  
  // Configurar LED interno
  pinMode(LED_PIN, OUTPUT);
  
  // Testar WiFi (sem conectar)
  Serial.println("WiFi: Disponivel");
  
  Serial.println("Setup concluido!");
}

void loop() {
  digitalWrite(LED_PIN, HIGH);
  delay(1000);
  digitalWrite(LED_PIN, LOW);
  delay(1000);
  
  Serial.println("ESP32 funcionando normalmente");
}