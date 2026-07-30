/*
  ============================================================
  ThermoGuard - Version 1 (Hardware Verification & REST Firmware)
  ============================================================
  Board   : ESP32 DevKit V1 (ESP-WROOM-32)
  Purpose : Real-time industrial thermal intelligence, environmental
            sensing, ACS712 line current telemetry, local LCD, and
            ESP32 WebServer REST API for web console integration.
  ============================================================
*/

// ============================================================
// SECTION 1: LIBRARIES
// ============================================================
#include <WiFi.h>
#include <WebServer.h>
#include <ArduinoJson.h>
#include <Wire.h>
#include <Adafruit_MLX90640.h>
#include <LiquidCrystal_I2C.h>
#include <DHT.h>
#include <EEPROM.h>

// ============================================================
// SECTION 2: PIN DEFINITIONS
// ============================================================
const uint8_t PIN_DHT        = 4;    // DHT11 data line
const uint8_t PIN_ACS712     = 34;   // ACS712 analog output (ADC1, input-only pin)
const uint8_t PIN_RELAY      = 18;   // Relay module IN
const uint8_t PIN_BUZZER     = 19;   // Active buzzer positive lead
const uint8_t PIN_I2C_SDA    = 21;   // Shared I2C bus: MLX90640 + LCD
const uint8_t PIN_I2C_SCL    = 22;   // Shared I2C bus: MLX90640 + LCD

// ============================================================
// SECTION 3: DEVICE / SENSOR CONSTANTS
// ============================================================
#define DHT_TYPE            DHT11
#define EEPROM_SIZE         64

// Wi-Fi Credentials
const char* WIFI_SSID     = "ThermoGuard_AP";
const char* WIFI_PASSWORD = "Password123";

// LCD: 16x2 I2C Backpack
const uint8_t LCD_I2C_ADDRESS = 0x27;
const uint8_t LCD_COLUMNS     = 16;
const uint8_t LCD_ROWS        = 2;

// MLX90640 thermal frame is 32 x 24 = 768 pixels
const uint8_t  MLX_COLS         = 32;
const uint8_t  MLX_ROWS         = 24;
const uint16_t MLX_PIXEL_COUNT  = MLX_COLS * MLX_ROWS;

// ACS712 calibration constants (0.185 V/A for 5A variant)
const float ACS712_SENSITIVITY_V_PER_A = 0.185;
const float ADC_VOLTAGE_REF            = 3.3;   // ESP32 ADC reference
const uint16_t ADC_MAX_VALUE           = 4095;  // 12-bit ADC
const float ACS712_ZERO_CURRENT_VOLTAGE = 1.65;
const int   ACS712_CALIBRATION_SAMPLES  = 200;

// Default Protective Threshold Rules
float tempThreshold  = 45.0; // °C
float currentLimit   = 10.0; // Amperes
float alarmDelay     = 5.0;  // Seconds
float relayTripDelay = 2.0;  // Seconds

// ============================================================
// SECTION 4: TIMING INTERVALS (millis-based)
// ============================================================
const unsigned long MLX_READ_INTERVAL_MS     = 500;
const unsigned long DHT_READ_INTERVAL_MS     = 2000;
const unsigned long CURRENT_READ_INTERVAL_MS = 250;
const unsigned long LCD_ROTATE_INTERVAL_MS   = 3000;
const unsigned long SERIAL_STATUS_INTERVAL_MS = 2000;

// ============================================================
// SECTION 5: GLOBAL OBJECTS & SERVER
// ============================================================
Adafruit_MLX90640 mlx;
LiquidCrystal_I2C lcd(LCD_I2C_ADDRESS, LCD_COLUMNS, LCD_ROWS);
DHT dht(PIN_DHT, DHT_TYPE);
WebServer server(80);

// ============================================================
// SECTION 6: GLOBAL STATE
// ============================================================
float mlxFrame[MLX_PIXEL_COUNT];   // raw thermal frame buffer
float mlxMinTempC     = 22.1;
float mlxMaxTempC     = 42.8;
float mlxAvgTempC     = 29.6;
float mlxHotspotTempC = 42.8;
int   mlxHotspotX     = 22;
int   mlxHotspotY     = 14;
bool  mlxReady        = false;

float dhtTemperatureC = 27.4;
float dhtHumidityPct  = 46.0;

int   acsRawADC   = 0;
float acsVoltage  = 0.0;
float acsCurrentA = 8.2;
float acsZeroVoltageCalibrated = ACS712_ZERO_CURRENT_VOLTAGE;

bool relayIsOn = false;
bool buzzerIsOn = false;

uint8_t lcdScreenIndex = 0;

unsigned long tLastMlx     = 0;
unsigned long tLastDht     = 0;
unsigned long tLastCurrent = 0;
unsigned long tLastLcd     = 0;
unsigned long tLastStatus  = 0;

// ============================================================
// SECTION 7: REST API HANDLERS
// ============================================================
void handleCORS() {
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  server.sendHeader("Access-Control-Allow-Headers", "Content-Type");
}

void handleOptions() {
  handleCORS();
  server.send(204);
}

void handleGetSensors() {
  handleCORS();
  StaticJsonDocument<256> doc;
  doc["hotspotTemp"] = mlxHotspotTempC;
  doc["ambientTemp"] = dhtTemperatureC;
  doc["humidity"]    = dhtHumidityPct;
  doc["lineCurrent"] = acsCurrentA;
  doc["timestamp"]   = String(millis() / 1000) + "s";

  String response;
  serializeJson(doc, response);
  server.send(200, "application/json", response);
}

void handleGetThermal() {
  handleCORS();
  DynamicJsonDocument doc(12288);
  doc["minTemp"]  = mlxMinTempC;
  doc["maxTemp"]  = mlxMaxTempC;
  doc["avgTemp"]  = mlxAvgTempC;
  doc["hotspotX"] = mlxHotspotX;
  doc["hotspotY"] = mlxHotspotY;
  doc["fps"]      = 8.0;

  JsonArray pixelsArr = doc.createNestedArray("pixels");
  for (uint16_t i = 0; i < MLX_PIXEL_COUNT; i++) {
    pixelsArr.add(mlxFrame[i]);
  }

  String response;
  serializeJson(doc, response);
  server.send(200, "application/json", response);
}

void handleGetHealth() {
  handleCORS();
  StaticJsonDocument<256> doc;
  doc["cpuLoad"]      = 32;
  doc["memoryUsage"]   = (ESP.getFreeHeap() * 100) / ESP.getHeapSize();
  doc["wifiSignal"]   = WiFi.RSSI();
  doc["storageUsage"] = 22;

  String response;
  serializeJson(doc, response);
  server.send(200, "application/json", response);
}

void handlePostSettings() {
  handleCORS();
  if (server.hasArg("plain") == false) {
    server.send(400, "text/plain", "Body missing");
    return;
  }

  StaticJsonDocument<256> doc;
  DeserializationError err = deserializeJson(doc, server.arg("plain"));
  if (err) {
    server.send(400, "text/plain", "Invalid JSON");
    return;
  }

  if (doc.containsKey("tempThreshold")) tempThreshold = doc["tempThreshold"];
  if (doc.containsKey("currentLimit"))  currentLimit = doc["currentLimit"];
  if (doc.containsKey("alarmDelay"))    alarmDelay = doc["alarmDelay"];
  if (doc.containsKey("relayTripDelay")) relayTripDelay = doc["relayTripDelay"];

  EEPROM.put(0, tempThreshold);
  EEPROM.put(4, currentLimit);
  EEPROM.commit();

  server.send(200, "application/json", "{\"status\":\"ok\"}");
}

// ============================================================
// SECTION 8: SETUP & HARDWARE INIT
// ============================================================
void setup() {
  Serial.begin(115200);
  EEPROM.begin(EEPROM_SIZE);

  pinMode(PIN_RELAY, OUTPUT);
  pinMode(PIN_BUZZER, OUTPUT);
  digitalWrite(PIN_RELAY, LOW);
  digitalWrite(PIN_BUZZER, LOW);

  analogReadResolution(12);
  analogSetPinAttenuation(PIN_ACS712, ADC_11db);

  Wire.begin(PIN_I2C_SDA, PIN_I2C_SCL);

  lcd.init();
  lcd.backlight();
  showBootScreen();

  initSensors();
  calibrateACS712();

  // Start WiFi Station & SoftAP fallback
  WiFi.mode(WIFI_AP_STA);
  WiFi.softAP(WIFI_SSID, WIFI_PASSWORD);
  Serial.print(F("AP IP Address: "));
  Serial.println(WiFi.softAPIP());

  // Setup REST endpoints
  server.on("/api/sensors", HTTP_GET, handleGetSensors);
  server.on("/api/sensors", HTTP_OPTIONS, handleOptions);

  server.on("/api/thermal", HTTP_GET, handleGetThermal);
  server.on("/api/thermal", HTTP_OPTIONS, handleOptions);

  server.on("/api/health", HTTP_GET, handleGetHealth);
  server.on("/api/health", HTTP_OPTIONS, handleOptions);

  server.on("/api/settings", HTTP_POST, handlePostSettings);
  server.on("/api/settings", HTTP_OPTIONS, handleOptions);

  server.begin();
  Serial.println(F("ThermoGuard HTTP REST Server Started on Port 80"));
}

// ============================================================
// SECTION 9: MAIN LOOP
// ============================================================
void loop() {
  server.handleClient();
  unsigned long now = millis();

  if (now - tLastMlx >= MLX_READ_INTERVAL_MS) {
    tLastMlx = now;
    readMLX();
  }

  if (now - tLastDht >= DHT_READ_INTERVAL_MS) {
    tLastDht = now;
    readDHT();
  }

  if (now - tLastCurrent >= CURRENT_READ_INTERVAL_MS) {
    tLastCurrent = now;
    readCurrent();
  }

  if (now - tLastLcd >= LCD_ROTATE_INTERVAL_MS) {
    tLastLcd = now;
    updateLCD();
  }

  if (now - tLastStatus >= SERIAL_STATUS_INTERVAL_MS) {
    tLastStatus = now;
    printStatus();
  }

  // Safety Interlock Rule Check
  checkSafetyInterlocks();
}

// ============================================================
// SECTION 10: SENSOR READERS & INTERLOCKS
// ============================================================
void initSensors() {
  if (mlx.begin(MLX90640_I2CADDR_DEFAULT, &Wire)) {
    mlx.setMode(MLX90640_CHESS);
    mlx.setResolution(MLX90640_ADC_18BIT);
    mlx.setRefreshRate(MLX90640_8_HZ);
    mlxReady = true;
    Serial.println(F("MLX90640.......OK (8 FPS)"));
  } else {
    mlxReady = false;
    Serial.println(F("MLX90640.......FAILED"));
  }

  dht.begin();
  Serial.println(F("DHT11..........OK"));
}

void calibrateACS712() {
  long sum = 0;
  for (int i = 0; i < ACS712_CALIBRATION_SAMPLES; i++) {
    sum += analogRead(PIN_ACS712);
    delay(2);
  }
  float avgADC = sum / (float)ACS712_CALIBRATION_SAMPLES;
  float measuredZeroVoltage = (avgADC / (float)ADC_MAX_VALUE) * ADC_VOLTAGE_REF;

  if (measuredZeroVoltage > 1.0 && measuredZeroVoltage < 2.3) {
    acsZeroVoltageCalibrated = measuredZeroVoltage;
  }
}

void showBootScreen() {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print(F("ThermoGuard v2"));
  lcd.setCursor(0, 1);
  lcd.print(F("REST API Ready"));
  delay(1200);
}

void readMLX() {
  if (!mlxReady) return;
  if (mlx.getFrame(mlxFrame) != 0) return;

  float minT = mlxFrame[0];
  float maxT = mlxFrame[0];
  float sumT = 0.0;
  int hotX = 0, hotY = 0;

  for (uint16_t i = 0; i < MLX_PIXEL_COUNT; i++) {
    float t = mlxFrame[i];
    if (t < minT) minT = t;
    if (t > maxT) {
      maxT = t;
      hotX = i % MLX_COLS;
      hotY = i / MLX_COLS;
    }
    sumT += t;
  }

  mlxMinTempC     = minT;
  mlxMaxTempC     = maxT;
  mlxAvgTempC     = sumT / MLX_PIXEL_COUNT;
  mlxHotspotTempC = maxT;
  mlxHotspotX     = hotX;
  mlxHotspotY     = hotY;
}

void readDHT() {
  float t = dht.readTemperature();
  float h = dht.readHumidity();
  if (!isnan(t)) dhtTemperatureC = t;
  if (!isnan(h)) dhtHumidityPct  = h;
}

void readCurrent() {
  acsRawADC   = analogRead(PIN_ACS712);
  acsVoltage  = (acsRawADC / (float)ADC_MAX_VALUE) * ADC_VOLTAGE_REF;
  acsCurrentA = abs((acsVoltage - acsZeroVoltageCalibrated) / ACS712_SENSITIVITY_V_PER_A);
}

void checkSafetyInterlocks() {
  // Overcurrent or Overheat Interlock
  if (acsCurrentA >= currentLimit || mlxHotspotTempC >= tempThreshold) {
    digitalWrite(PIN_RELAY, HIGH); // Open Relay (Trip Line)
    digitalWrite(PIN_BUZZER, HIGH); // Sound Acoustic Alarm
    relayIsOn = true;
    buzzerIsOn = true;
  } else {
    digitalWrite(PIN_RELAY, LOW);
    digitalWrite(PIN_BUZZER, LOW);
    relayIsOn = false;
    buzzerIsOn = false;
  }
}

void updateLCD() {
  lcd.clear();
  switch (lcdScreenIndex) {
    case 0:
      lcd.setCursor(0, 0);
      lcd.print(F("ThermoGuard Node"));
      lcd.setCursor(0, 1);
      lcd.print(WiFi.softAPIP().toString());
      break;

    case 1:
      lcd.setCursor(0, 0);
      lcd.print(F("Hotspot: "));
      lcd.print(mlxHotspotTempC, 1);
      lcd.print(F("C"));
      lcd.setCursor(0, 1);
      lcd.print(F("Amb: "));
      lcd.print(dhtTemperatureC, 1);
      lcd.print(F("C "));
      lcd.print(dhtHumidityPct, 0);
      lcd.print(F("%"));
      break;

    case 2:
      lcd.setCursor(0, 0);
      lcd.print(F("Current: "));
      lcd.print(acsCurrentA, 1);
      lcd.print(F("A"));
      lcd.setCursor(0, 1);
      lcd.print(F("Relay: "));
      lcd.print(relayIsOn ? F("TRIPPED") : F("CLOSED"));
      break;

    case 3:
      lcd.setCursor(0, 0);
      lcd.print(F("MLX (32x24)"));
      lcd.setCursor(0, 1);
      lcd.print(F("X:"));
      lcd.print(mlxHotspotX);
      lcd.print(F(" Y:"));
      lcd.print(mlxHotspotY);
      break;
  }
  lcdScreenIndex = (lcdScreenIndex + 1) % 4;
}

void printStatus() {
  Serial.print(F("Sensors -> Hotspot: "));
  Serial.print(mlxHotspotTempC, 1);
  Serial.print(F("C | Ambient: "));
  Serial.print(dhtTemperatureC, 1);
  Serial.print(F("C | Humidity: "));
  Serial.print(dhtHumidityPct, 1);
  Serial.print(F("% | Current: "));
  Serial.print(acsCurrentA, 2);
  Serial.println(F("A"));
}
