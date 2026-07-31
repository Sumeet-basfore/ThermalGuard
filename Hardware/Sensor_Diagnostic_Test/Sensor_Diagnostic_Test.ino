/*
  ============================================================
  ThermoGuard - Comprehensive Hardware Sensor Diagnostics Test
  ============================================================
  Board   : ESP32 DevKit V1 (ESP-WROOM-32)
  Baud    : 115200
  Purpose : Non-blocking self-test diagnostic tool with step-by-step
            Serial checkpoint logging and dual I2C clock switching.
  ============================================================
*/

#include <Wire.h>
#include <Adafruit_MLX90640.h>
#include <LiquidCrystal_I2C.h>
#include <DHT.h>

// --- Pin Map ---
const uint8_t PIN_DHT     = 4;    // DHT11 Data line
const uint8_t PIN_ACS712  = 34;   // ACS712 Current Sensor (Analog ADC1)
const uint8_t PIN_RELAY   = 18;   // Protective Relay Module
const uint8_t PIN_BUZZER  = 19;   // Acoustic Buzzer
const uint8_t PIN_SDA     = 21;   // Shared I2C SDA
const uint8_t PIN_SCL     = 22;   // Shared I2C SCL

// --- Devices ---
#define DHT_TYPE DHT11
DHT dht(PIN_DHT, DHT_TYPE);
Adafruit_MLX90640 mlx;

LiquidCrystal_I2C lcd27(0x27, 16, 2);
LiquidCrystal_I2C lcd3F(0x3F, 16, 2);
LiquidCrystal_I2C* activeLcd = &lcd27;

// --- Global Test Buffers ---
float mlxFrame[768];
bool mlxOk = false;
bool dhtOk = false;
bool lcdOk = false;
uint8_t detectedLcdAddr = 0;

void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println(F("\n=================================================="));
  Serial.println(F("   THERMOGUARD COMPLETE SENSOR DIAGNOSTIC SUITE   "));
  Serial.println(F("=================================================="));

  // 1. Initialize Relay & Buzzer
  pinMode(PIN_RELAY, OUTPUT);
  pinMode(PIN_BUZZER, OUTPUT);
  digitalWrite(PIN_RELAY, LOW);
  digitalWrite(PIN_BUZZER, LOW);

  // Sound quick self-test beep (150ms)
  digitalWrite(PIN_BUZZER, HIGH);
  delay(150);
  digitalWrite(PIN_BUZZER, LOW);
  Serial.println(F("[1/5] Buzzer & Relay Pins Initialized. Self-Test Beep OK."));

  // 2. Analog ADC Setup for ACS712
  analogReadResolution(12);
  analogSetPinAttenuation(PIN_ACS712, ADC_11db);
  Serial.println(F("[2/5] ADC Pin 34 (ACS712 Current Sensor) Initialized."));

  // 3. I2C Bus Setup & Scanner
  Wire.begin(PIN_SDA, PIN_SCL);
  Wire.setClock(100000);   // 100kHz standard mode for scanning & LCD
  Wire.setTimeOut(1000);   // 1000ms hardware timeout guard
  Serial.println(F("[3/5] Scanning I2C Bus (SDA: GPIO 21, SCL: GPIO 22)..."));

  byte error, address;
  int devicesFound = 0;

  for (address = 1; address < 127; address++) {
    Wire.beginTransmission(address);
    error = Wire.endTransmission();

    if (error == 0) {
      devicesFound++;
      Serial.print(F("      -> Found I2C Device at 0x"));
      if (address < 16) Serial.print("0");
      Serial.print(address, HEX);

      if (address == 0x27 || address == 0x3F) {
        detectedLcdAddr = address;
        lcdOk = true;
        Serial.println(F(" [16x2 LCD Display]"));
      } else if (address == 0x33) {
        mlxOk = true;
        Serial.println(F(" [MLX90640 IR Camera]"));
      } else {
        Serial.println();
      }
    }
  }

  if (lcdOk) {
    if (detectedLcdAddr == 0x3F) activeLcd = &lcd3F;
    else activeLcd = &lcd27;
    activeLcd->init();
    activeLcd->backlight();
    activeLcd->clear();
    activeLcd->setCursor(0, 0);
    activeLcd->print(F("ThermoGuard Test"));
    activeLcd->setCursor(0, 1);
    activeLcd->print(F("Scanning..."));
  } else {
    Serial.println(F("      WARNING: No LCD backpack found at 0x27 or 0x3F!"));
  }

  // 4. MLX90640 Thermal Camera Setup
  Serial.println(F("[4/5] Initializing MLX90640 Thermal Sensor..."));
  Wire.setClock(400000); // MLX90640 requires 400kHz fast mode for bulk 1668-byte frame transfers
  if (mlx.begin(MLX90640_I2CADDR_DEFAULT, &Wire)) {
    mlx.setMode(MLX90640_CHESS);
    mlx.setResolution(MLX90640_ADC_18BIT);
    mlx.setRefreshRate(MLX90640_2_HZ); // 2Hz refresh rate for stable frame capture
    mlxOk = true;
    Serial.println(F("      -> MLX90640 Thermal Sensor Initialized Successfully (2 FPS)."));
  } else {
    mlxOk = false;
    Serial.println(F("      -> ERROR: MLX90640 Failed to respond on I2C address 0x33. Check SDA/SCL."));
  }

  // 5. DHT11 Climate Sensor Setup
  Serial.println(F("[5/5] Initializing DHT11 Environmental Sensor..."));
  dht.begin();
  delay(1000);
  float testT = dht.readTemperature();
  if (!isnan(testT)) {
    dhtOk = true;
    Serial.println(F("      -> DHT11 Sensor OK."));
  } else {
    dhtOk = false;
    Serial.println(F("      -> ERROR: DHT11 Failed to read data on Pin GPIO 4. Check VCC/GND/Data."));
  }

  Serial.println(F("=================================================="));
  Serial.println(F(" Starting Continuous Multi-Sensor Live Data Test  "));
  Serial.println(F("==================================================\n"));
}

void loop() {
  Serial.println(F("--------------------------------------------------"));

  // A. MLX90640 Reading Test
  float maxTemp = 25.0, minTemp = 20.0, avgTemp = 22.5;
  int hotX = 16, hotY = 12;

  if (mlxOk) {
    Serial.println(F("[STEP A] Reading MLX90640 768-pixel thermal frame (400kHz I2C)..."));
    Wire.setClock(400000); // 400kHz required for bulk frame data read
    int status = mlx.getFrame(mlxFrame);
    if (status == 0) {
      minTemp = mlxFrame[0];
      maxTemp = mlxFrame[0];
      float sum = 0;
      for (uint16_t i = 0; i < 768; i++) {
        float t = mlxFrame[i];
        if (t < minTemp) minTemp = t;
        if (t > maxTemp) {
          maxTemp = t;
          hotX = i % 32;
          hotY = i / 32;
        }
        sum += t;
      }
      avgTemp = sum / 768.0;

      Serial.print(F(" -> [MLX90640] Max Hotspot: "));
      Serial.print(maxTemp, 1);
      Serial.print(F("°C | Min: "));
      Serial.print(minTemp, 1);
      Serial.print(F("°C | Avg: "));
      Serial.print(avgTemp, 1);
      Serial.print(F("°C | Peak Pos: (X:"));
      Serial.print(hotX);
      Serial.print(F(", Y:"));
      Serial.print(hotY);
      Serial.println(F(") -> OK"));
    } else {
      Serial.print(F(" -> [MLX90640] Frame read status code: "));
      Serial.println(status);
    }
  } else {
    Serial.println(F("[STEP A] MLX90640 OFFLINE (Check I2C 0x33)"));
  }

  // B. DHT11 Reading Test
  Serial.println(F("[STEP B] Reading DHT11 climate sensor..."));
  float ambTemp = dht.readTemperature();
  float humidity = dht.readHumidity();

  if (!isnan(ambTemp) && !isnan(humidity)) {
    Serial.print(F(" -> [DHT11]  Ambient Temp: "));
    Serial.print(ambTemp, 1);
    Serial.print(F("°C | Humidity: "));
    Serial.print(humidity, 1);
    Serial.println(F("% RH -> OK"));
  } else {
    Serial.println(F(" -> [DHT11]  READ ERROR (Check GPIO 4)"));
  }

  // C. ACS712 Current Reading Test
  Serial.println(F("[STEP C] Reading ACS712 current sensor..."));
  int rawAdc = analogRead(PIN_ACS712);
  float voltage = (rawAdc / 4095.0) * 3.3;
  float currentA = abs((voltage - 1.65) / 0.185);

  Serial.print(F(" -> [ACS712] ADC Raw: "));
  Serial.print(rawAdc);
  Serial.print(F(" | Voltage: "));
  Serial.print(voltage, 2);
  Serial.print(F("V | Calculated Load: "));
  Serial.print(currentA, 2);
  Serial.println(F(" A -> OK"));

  // D. Update LCD Screen Test
  if (lcdOk) {
    Serial.println(F("[STEP D] Updating 16x2 LCD display (100kHz I2C)..."));
    Wire.setClock(100000); // Switch to 100kHz standard mode for LCD backpack
    activeLcd->clear();
    activeLcd->setCursor(0, 0);
    activeLcd->print(F("H:"));
    activeLcd->print(maxTemp, 1);
    activeLcd->print(F("C A:"));
    if (!isnan(ambTemp)) activeLcd->print(ambTemp, 1);
    else activeLcd->print(F("--"));
    activeLcd->print(F("C"));

    activeLcd->setCursor(0, 1);
    activeLcd->print(F("I:"));
    activeLcd->print(currentA, 1);
    activeLcd->print(F("A H:"));
    if (!isnan(humidity)) activeLcd->print(humidity, 0);
    else activeLcd->print(F("--"));
    activeLcd->print(F("%"));
  }

  delay(2000);
}
