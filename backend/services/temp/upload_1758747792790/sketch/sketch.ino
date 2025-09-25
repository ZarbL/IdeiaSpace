#include <DHT.h>

#define DHTTYPE DHT11
#define DHTPIN 14

DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(9600);
  dht.begin();
}

void loop() {
  Serial.print("Temperatura: ");
  Serial.println(dht.readTemperature());
  Serial.print("Umidade: ");
  Serial.println(dht.readHumidity());
  Serial.print("Indice de Calor: ");
  Serial.println(dht.computeHeatIndex(dht.readTemperature(), dht.readHumidity(), false));
  delay(2000);
}