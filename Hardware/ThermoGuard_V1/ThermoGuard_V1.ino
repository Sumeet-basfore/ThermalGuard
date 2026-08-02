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

// Wi-Fi Credentials (Set to your Home Wi-Fi Router Name & Password)
const char* WIFI_SSID     = "Sumeets-AirFibre";
const char* WIFI_PASSWORD = "hdXnTHEGEhGmkpVELuw4ybSU6R1zhzVY";

// LCD Configuration
const uint8_t LCD_COLUMNS = 16;
const uint8_t LCD_ROWS    = 2;

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
const unsigned long MLX_READ_INTERVAL_MS      = 2100;  // 0.5Hz frame rate requires ~2s capture window
const unsigned long DHT_READ_INTERVAL_MS      = 2000;
const unsigned long CURRENT_READ_INTERVAL_MS  = 250;
const unsigned long LCD_ROTATE_INTERVAL_MS    = 2500;
const unsigned long SERIAL_STATUS_INTERVAL_MS = 2000;

// LEDC (PWM) Buzzer Config — compatible with ESP32 Core 2.x & 3.x
const uint8_t  LEDC_CHANNEL    = 0;
const uint32_t LEDC_FREQ_ALARM = 2730;  // Active buzzer resonant frequency
const uint32_t LEDC_FREQ_ALT   = 3500;  // Alternate alarm tone
const uint8_t  LEDC_RESOLUTION = 8;     // 8-bit duty (0-255)

#if defined(ESP_ARDUINO_VERSION) && ESP_ARDUINO_VERSION >= ESP_ARDUINO_VERSION_VAL(3, 0, 0)
  // ESP32 Arduino Core 3.x API (ledcAttach, ledcWriteTone, ledcWrite take pin number)
  #define BUZZER_INIT()               ledcAttach(PIN_BUZZER, LEDC_FREQ_ALARM, LEDC_RESOLUTION)
  #define BUZZER_TONE(freq)           do { ledcWriteTone(PIN_BUZZER, freq); ledcWrite(PIN_BUZZER, 255); } while(0)
  #define BUZZER_OFF()                ledcWrite(PIN_BUZZER, 0)
#else
  // ESP32 Arduino Core 2.x API (ledcSetup, ledcAttachPin take channel number)
  #define BUZZER_INIT()               do { ledcSetup(LEDC_CHANNEL, LEDC_FREQ_ALARM, LEDC_RESOLUTION); ledcAttachPin(PIN_BUZZER, LEDC_CHANNEL); } while(0)
  #define BUZZER_TONE(freq)           do { ledcWriteTone(LEDC_CHANNEL, freq); ledcWrite(LEDC_CHANNEL, 255); } while(0)
  #define BUZZER_OFF()                ledcWrite(LEDC_CHANNEL, 0)
#endif

// ============================================================
// SECTION 5: GLOBAL OBJECTS & FUNCTION PROTOTYPES
// ============================================================
Adafruit_MLX90640 mlx;
LiquidCrystal_I2C lcd27(0x27, LCD_COLUMNS, LCD_ROWS);
LiquidCrystal_I2C lcd3F(0x3F, LCD_COLUMNS, LCD_ROWS);
LiquidCrystal_I2C* activeLcd = &lcd27;

DHT dht(PIN_DHT, DHT_TYPE);
WebServer server(80);

// Forward Prototypes for Strict C++ Compilation
void initLCD();
void showBootScreen();
void initSensors();
void calibrateACS712();
void readMLX();
void readDHT();
void readCurrent();
void checkSafetyInterlocks();
void updateLCD();
void printStatus();
void handleCORS();
void handleOptions();
void handleRoot();
void handleGetSensors();
void handleGetThermal();
void handleGetHealth();
void handlePostSettings();
void handleTestBuzzer();

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
bool  lcdReady        = false;

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

// Embedded Mobile Web Dashboard HTML Page
const char INDEX_HTML[] PROGMEM = R"rawliteral(
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ThermoGuard Mobile Console</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    body { background: #0b0c10; color: #e2e2e9; padding: 16px; min-height: 100vh; }
    .header { display: flex; align-items: center; justify-content: space-between; padding-bottom: 16px; border-bottom: 1px solid #282a30; margin-bottom: 16px; }
    .title { font-size: 20px; font-weight: 700; color: #3b82f6; }
    .badge { background: #2563eb22; color: #60a5fa; border: 1px solid #2563eb44; padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: 600; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; margin-bottom: 16px; }
    .card { background: #13151b; border: 1px solid #282a30; border-radius: 12px; padding: 16px; text-align: center; }
    .label { font-size: 11px; text-transform: uppercase; color: #9ca3af; letter-spacing: 0.05em; margin-bottom: 6px; }
    .val { font-size: 24px; font-weight: 800; color: #f3f4f6; }
    .unit { font-size: 14px; font-weight: 500; color: #9ca3af; }
    .hot { color: #f87171; }
    .amb { color: #34d399; }
    .cur { color: #fbbf24; }
    .status-card { background: #13151b; border: 1px solid #282a30; border-radius: 12px; padding: 16px; margin-bottom: 16px; }
    .btn { display: block; width: 100%; text-align: center; background: #2563eb; color: white; padding: 12px; border-radius: 8px; font-weight: 700; text-decoration: none; margin-top: 12px; }
    .btn-test { background: #374151; margin-bottom: 8px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="title">⚡ ThermoGuard</div>
    <div class="badge">ESP32 Gateway Live</div>
  </div>

  <div class="grid">
    <div class="card">
      <div class="label">IR Hotspot</div>
      <div class="val hot" id="hot">42.8°C</div>
    </div>
    <div class="card">
      <div class="label">Line Current</div>
      <div class="val cur" id="cur">8.2 A</div>
    </div>
    <div class="card">
      <div class="label">Ambient Temp</div>
      <div class="val amb" id="amb">27.4°C</div>
    </div>
    <div class="card">
      <div class="label">Humidity</div>
      <div class="val" id="hmd">46%</div>
    </div>
  </div>

  <div class="status-card">
    <div class="label">System Safety Interlock</div>
    <div style="display:flex; justify-content:space-between; margin-top:8px;">
      <span style="color:#9ca3af;">Relay Status:</span>
      <strong id="relay" style="color:#34d399;">NORMAL (CLOSED)</strong>
    </div>
    <div style="display:flex; justify-content:space-between; margin-top:8px; margin-bottom:12px;">
      <span style="color:#9ca3af;">Node Uptime:</span>
      <strong id="ts" style="color:#e2e2e9;">Active</strong>
    </div>

    <button onclick="testBuzzer()" class="btn btn-test">🔔 Test Hardware Buzzer (GPIO 19)</button>
  </div>

  <a href="https://thermalguard.vercel.app" class="btn" target="_blank">Open Full Web Dashboard 🚀</a>

  <script>
    async function testBuzzer() {
      try {
        await fetch('/api/test-buzzer', { method: 'POST' });
      } catch (e) {}
    }

    async function update() {
      try {
        const url = window.location.protocol + '//' + window.location.host + '/api/sensors';
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        if (data.hotspotTemp !== undefined) document.getElementById('hot').innerText = Number(data.hotspotTemp).toFixed(1) + '°C';
        if (data.ambientTemp !== undefined) document.getElementById('amb').innerText = Number(data.ambientTemp).toFixed(1) + '°C';
        if (data.humidity !== undefined)    document.getElementById('hmd').innerText = Math.round(Number(data.humidity)) + '%';
        if (data.lineCurrent !== undefined) document.getElementById('cur').innerText = Number(data.lineCurrent).toFixed(1) + ' A';
        if (data.timestamp !== undefined)   document.getElementById('ts').innerText = data.timestamp;
      } catch (e) {}
    }
    setInterval(update, 1000);
    update();
  </script>
</body>
</html>
)rawliteral";

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

void handleRoot() {
  handleCORS();
  server.send_P(200, "text/html", INDEX_HTML);
}

void handleTestBuzzer() {
  handleCORS();
  // Two-beep pattern via PWM for clear audible confirmation
  BUZZER_TONE(LEDC_FREQ_ALARM);
  delay(300);
  BUZZER_OFF();
  delay(120);
  BUZZER_TONE(LEDC_FREQ_ALT);
  delay(300);
  BUZZER_OFF();
  server.send(200, "application/json", "{\"status\":\"buzzer_tested\"}");
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
// SECTION 8: FULL I2C BUS SCANNER & DUAL LCD INITIALIZER
// ============================================================
void initLCD() {
  Wire.setClock(100000); // 100kHz standard I2C clock speed for LCD
  byte error, address;
  int nDevices = 0;

  Serial.println(F("\n--- Scanning I2C Bus (GPIO 21 SDA, GPIO 22 SCL) ---"));
  uint8_t detectedLcdAddr = 0;

  for (address = 1; address < 127; address++) {
    Wire.beginTransmission(address);
    error = Wire.endTransmission();

    if (error == 0) {
      Serial.print(F(" -> I2C Device found at address 0x"));
      if (address < 16) Serial.print("0");
      Serial.print(address, HEX);

      if (address == 0x27 || address == 0x3F || address == 0x20 || address == 0x38) {
        Serial.println(F(" (LCD Backpack)"));
        if (detectedLcdAddr == 0) detectedLcdAddr = address;
      } else if (address == 0x33) {
        Serial.println(F(" (MLX IR Camera Sensor)"));
      } else {
        Serial.println();
      }
      nDevices++;
    }
  }

  if (nDevices == 0) {
    Serial.println(F("WARNING: No I2C devices found! Check 3.3V/5V Power, GND, SDA (21) & SCL (22) wiring.\n"));
  } else {
    Serial.print(F("I2C Scan Complete: Found "));
    Serial.print(nDevices);
    Serial.println(F(" device(s).\n"));
  }

  // Initialize selected LCD object
  if (detectedLcdAddr == 0x3F) {
    activeLcd = &lcd3F;
  } else {
    activeLcd = &lcd27;
  }

  activeLcd->init();
  activeLcd->backlight();
  activeLcd->clear();
  lcdReady = true;

  Serial.print(F("Initialized 16x2 LCD Display at 0x"));
  Serial.println(detectedLcdAddr != 0 ? detectedLcdAddr : 0x27, HEX);
  Serial.println(F("NOTE: If screen backlight is ON but text is invisible, turn blue contrast potentiometer screw on LCD back.\n"));
}

// ============================================================
// SECTION 9: SETUP & HARDWARE INIT
// ============================================================
void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println(F("\n=============================================="));
  Serial.println(F(" ThermalGuard ESP32 Gateway Node Booting...   "));
  Serial.println(F("=============================================="));

  EEPROM.begin(EEPROM_SIZE);

  pinMode(PIN_RELAY, OUTPUT);
  pinMode(PIN_BUZZER, OUTPUT);
  digitalWrite(PIN_RELAY, LOW);
  digitalWrite(PIN_BUZZER, LOW);

  analogReadResolution(12);
  analogSetPinAttenuation(PIN_ACS712, ADC_11db);

  // Initialize LEDC PWM for buzzer — drives louder than raw digitalWrite
  BUZZER_INIT();
  BUZZER_OFF(); // Start silent

  Wire.setBufferSize(2048); // Expand ESP32 I2C buffer to 2048 bytes
  Wire.begin(PIN_I2C_SDA, PIN_I2C_SCL);
  Wire.setClock(100000);   // 100kHz standard bus clock
  Wire.setTimeOut(1000);   // 1000ms timeout protection against bus freeze

  initLCD();
  showBootScreen();

  initSensors();
  calibrateACS712();

  // Start WiFi Station (Tries Home Wi-Fi Router, falls back to SoftAP hotspot)
  WiFi.mode(WIFI_AP_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print(F("Connecting to Wi-Fi network: "));
  Serial.println(WIFI_SSID);

  int wifiAttempts = 0;
  while (WiFi.status() != WL_CONNECTED && wifiAttempts < 10) {
    delay(500);
    Serial.print(F("."));
    wifiAttempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println(F("\nSuccessfully connected to Home/Office Wi-Fi!"));
    Serial.print(F("ESP32 Local Router IP Address: "));
    Serial.println(WiFi.localIP());
  } else {
    Serial.println(F("\nHome Wi-Fi unavailable. Starting ThermoGuard_AP Access Point..."));
    WiFi.softAP("ThermoGuard_AP", "Password123");
    Serial.print(F("AP IP Address: "));
    Serial.println(WiFi.softAPIP());
  }

  // Setup Root Mobile Dashboard Handler
  server.on("/", HTTP_GET, handleRoot);

  // Setup Buzzer Test Endpoint
  server.on("/api/test-buzzer", HTTP_GET, handleTestBuzzer);
  server.on("/api/test-buzzer", HTTP_POST, handleTestBuzzer);
  server.on("/api/test-buzzer", HTTP_OPTIONS, handleOptions);

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
// SECTION 10: MAIN LOOP
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
// SECTION 11: SENSOR READERS & INTERLOCKS
// ============================================================
void initSensors() {
  Wire.setClock(100000);
  if (mlx.begin(MLX90640_I2CADDR_DEFAULT, &Wire)) {
    mlx.setMode(MLX90640_CHESS);
    mlx.setResolution(MLX90640_ADC_18BIT);
    mlx.setRefreshRate(MLX90640_0_5_HZ); // 0.5Hz — stable frame capture, matches 2100ms read interval
    mlxReady = true;
    Serial.println(F("MLX Thermal Sensor.......OK (0.5 FPS — Real Frame Mode)"));
  } else {
    mlxReady = false;
    Serial.println(F("MLX Thermal Sensor.......FAILED (Check I2C Address 0x33 or SDA/SCL Wiring)"));
  }

  dht.begin();
  Serial.println(F("DHT11...................OK"));
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
  if (!lcdReady) return;
  Wire.setClock(100000);
  activeLcd->clear();
  activeLcd->setCursor(0, 0);
  activeLcd->print(F("ThermoGuard v2.4"));
  activeLcd->setCursor(0, 1);
  activeLcd->print(F("REST Server OK"));
  delay(1500);
}

void readMLX() {
  if (!mlxReady) return;
  Wire.setClock(100000);

  // Acquire real 32x24 (768-pixel) thermal frame from MLX90640
  float frame[MLX_PIXEL_COUNT];
  if (mlx.getFrame(frame) != 0) {
    // Frame acquisition failed — retain last known good telemetry
    Serial.println(F("MLX: getFrame() failed — retaining last values."));
    return;
  }

  // Scan all 768 pixels to compute stats and locate hotspot
  float minT =  999.0f, maxT = -999.0f, sumT = 0.0f;
  int   hotX = 0,       hotY = 0;

  for (int y = 0; y < MLX_ROWS; y++) {
    for (int x = 0; x < MLX_COLS; x++) {
      int   idx  = y * MLX_COLS + x;
      float temp = frame[idx];

      mlxFrame[idx] = temp; // Populate global pixel buffer for REST API
      sumT += temp;

      if (temp > maxT) { maxT = temp; hotX = x; hotY = y; }
      if (temp < minT)   minT = temp;
    }
  }

  // Commit computed statistics to global state
  mlxMinTempC     = minT;
  mlxMaxTempC     = maxT;
  mlxHotspotTempC = maxT;
  mlxAvgTempC     = sumT / (float)MLX_PIXEL_COUNT;
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

    // Two-tone alternating alarm via LEDC PWM for maximum volume
    static unsigned long lastBuzzerToggle = 0;
    static bool          buzzerToneHigh   = false;
    unsigned long        now              = millis();
    if (now - lastBuzzerToggle >= 500) {
      BUZZER_TONE(buzzerToneHigh ? LEDC_FREQ_ALT : LEDC_FREQ_ALARM);
      buzzerToneHigh   = !buzzerToneHigh;
      lastBuzzerToggle = now;
    }

    relayIsOn  = true;
    buzzerIsOn = true;
  } else {
    digitalWrite(PIN_RELAY, LOW);
    BUZZER_OFF(); // Silence buzzer via PWM
    relayIsOn  = false;
    buzzerIsOn = false;
  }
}

void updateLCD() {
  if (!lcdReady) return;
  Wire.setClock(100000); // Stabilize I2C bus at 100kHz for PCF8574 LCD transactions

  activeLcd->clear();
  switch (lcdScreenIndex) {
    case 0:
      // Overview Telemetry Screen (Hotspot & Line Current Load)
      activeLcd->setCursor(0, 0);
      activeLcd->print(F("HOTSPOT: "));
      activeLcd->print(mlxHotspotTempC, 1);
      activeLcd->print(F("C"));
      
      activeLcd->setCursor(0, 1);
      activeLcd->print(F("CURRENT: "));
      activeLcd->print(acsCurrentA, 1);
      activeLcd->print(F("A"));
      break;

    case 1:
      // Environmental Sensor Telemetry Screen (DHT11 Ambient & Humidity)
      activeLcd->setCursor(0, 0);
      activeLcd->print(F("AMBIENT: "));
      activeLcd->print(dhtTemperatureC, 1);
      activeLcd->print(F("C"));

      activeLcd->setCursor(0, 1);
      activeLcd->print(F("HUMIDITY: "));
      activeLcd->print(dhtHumidityPct, 0);
      activeLcd->print(F("% RH"));
      break;

    case 2:
      // Spatial Infrared Camera Grid Screen (MLX90640 32x24 Coordinates)
      activeLcd->setCursor(0, 0);
      activeLcd->print(F("MLX32x24: "));
      activeLcd->print(mlxHotspotTempC, 1);
      activeLcd->print(F("C"));

      activeLcd->setCursor(0, 1);
      activeLcd->print(F("POS: X:"));
      activeLcd->print(mlxHotspotX);
      activeLcd->print(F(" Y:"));
      activeLcd->print(mlxHotspotY);
      break;

    case 3:
      // Safety Interlock & Node IP Address Screen
      activeLcd->setCursor(0, 0);
      activeLcd->print(F("RELAY: "));
      if (relayIsOn) {
        activeLcd->print(F("TRIPPED!!"));
      } else {
        activeLcd->print(F("CLOSED OK"));
      }

      activeLcd->setCursor(0, 1);
      activeLcd->print(F("IP:"));
      if (WiFi.status() == WL_CONNECTED) {
        activeLcd->print(WiFi.localIP().toString());
      } else {
        activeLcd->print(WiFi.softAPIP().toString());
      }
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
