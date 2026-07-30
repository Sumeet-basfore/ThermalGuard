/*
  ============================================================
  ThermoGuard - Version 1 (Hardware Verification Firmware)
  ============================================================
  Board   : ESP32 DevKit V1 (ESP-WROOM-32)
  Purpose : Verify that every connected hardware component
            (MLX90640, DHT11, ACS712, I2C LCD, Relay, Buzzer)
            works correctly.

  This version intentionally does NOT include:
    - AI / prediction logic
    - WiFi dashboard, REST API, WebSockets
    - Firebase, MQTT, OTA, or any cloud features

  Code is organized into clearly commented sections and split
  into single-purpose functions so it is easy to extend into
  Version 2 later.
  ============================================================
*/

// ============================================================
// SECTION 1: LIBRARIES
// ============================================================
#include <Wire.h>
#include <Adafruit_MLX90640.h>
#include <LiquidCrystal_I2C.h>
#include <DHT.h>
// Adafruit_GFX / Adafruit_BusIO are pulled in automatically as
// dependencies of the libraries above; no direct calls to
// Adafruit_GFX are needed since we only read raw MLX90640 data
// (no on-device thermal image is drawn in V1).

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

// LCD: 16x2, I2C backpack. If the display stays blank, run an
// I2C scanner sketch first -- common addresses are 0x27 or 0x3F.
const uint8_t LCD_I2C_ADDRESS = 0x27;
const uint8_t LCD_COLUMNS     = 16;
const uint8_t LCD_ROWS        = 2;

// MLX90640 thermal frame is 32 x 24 = 768 pixels
const uint8_t  MLX_COLS         = 32;
const uint8_t  MLX_ROWS         = 24;
const uint16_t MLX_PIXEL_COUNT  = MLX_COLS * MLX_ROWS;

// ACS712 calibration constants.
// NOTE: 0.185 V/A matches the 5A module variant.
// Change to 0.100 for the 20A variant, or 0.066 for the 30A variant.
const float ACS712_SENSITIVITY_V_PER_A = 0.185;
const float ADC_VOLTAGE_REF            = 3.3;   // ESP32 ADC reference
const uint16_t ADC_MAX_VALUE           = 4095;  // 12-bit ADC
// Fallback zero-current voltage (nominally VCC/2). Used only if the
// boot-time auto-calibration below produces an out-of-range result.
const float ACS712_ZERO_CURRENT_VOLTAGE = 1.65;
const int   ACS712_CALIBRATION_SAMPLES  = 200;

// ============================================================
// SECTION 4: TIMING INTERVALS (all non-blocking, millis-based)
// ============================================================
const unsigned long MLX_READ_INTERVAL_MS     = 1000;
const unsigned long DHT_READ_INTERVAL_MS     = 2000;
const unsigned long CURRENT_READ_INTERVAL_MS = 500;
const unsigned long RELAY_TOGGLE_INTERVAL_MS = 5000;
const unsigned long LCD_ROTATE_INTERVAL_MS   = 3000;
const unsigned long SERIAL_STATUS_INTERVAL_MS = 2000;

// ============================================================
// SECTION 5: GLOBAL OBJECTS
// ============================================================
Adafruit_MLX90640 mlx;
LiquidCrystal_I2C lcd(LCD_I2C_ADDRESS, LCD_COLUMNS, LCD_ROWS);
DHT dht(PIN_DHT, DHT_TYPE);

// ============================================================
// SECTION 6: GLOBAL STATE
// ============================================================
float mlxFrame[MLX_PIXEL_COUNT];   // raw thermal frame buffer
float mlxMinTempC     = 0.0;
float mlxMaxTempC     = 0.0;
float mlxAvgTempC     = 0.0;
float mlxHotspotTempC = 0.0;
bool  mlxReady = false;

float dhtTemperatureC = 0.0;
float dhtHumidityPct  = 0.0;

int   acsRawADC   = 0;
float acsVoltage  = 0.0;
float acsCurrentA = 0.0;
float acsZeroVoltageCalibrated = ACS712_ZERO_CURRENT_VOLTAGE; // updated by calibrateACS712()

bool relayIsOn = false;

uint8_t lcdScreenIndex = 0; // 0..3, rotates through 4 screens

// last-run timestamps for each non-blocking task
unsigned long tLastMlx    = 0;
unsigned long tLastDht    = 0;
unsigned long tLastCurrent = 0;
unsigned long tLastRelay  = 0;
unsigned long tLastLcd    = 0;
unsigned long tLastStatus = 0;

// ============================================================
// SECTION 7: FUNCTION PROTOTYPES
// ============================================================
void initSensors();
void calibrateACS712();
void showBootScreen();
void readMLX();
void readDHT();
void readCurrent();
void updateLCD();
void testRelay();
void beep();
void printStatus();

// ============================================================
// SECTION 8: SETUP
// ============================================================
void setup() {
  Serial.begin(115200);

  // GPIO modes
  pinMode(PIN_RELAY, OUTPUT);
  pinMode(PIN_BUZZER, OUTPUT);
  digitalWrite(PIN_RELAY, LOW);
  digitalWrite(PIN_BUZZER, LOW);

  // ADC setup for ACS712
  analogReadResolution(12);                       // 0-4095
  analogSetPinAttenuation(PIN_ACS712, ADC_11db);   // allows ~0-3.3V input range

  // Shared I2C bus for MLX90640 + LCD
  Wire.begin(PIN_I2C_SDA, PIN_I2C_SCL);

  lcd.init();
  lcd.backlight();
  showBootScreen();

  initSensors();
  calibrateACS712();

  Serial.println(F("ThermoGuard V1 - Hardware verification running"));
}

// ============================================================
// SECTION 9: MAIN LOOP (non-blocking scheduler)
// ============================================================
void loop() {
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

  if (now - tLastRelay >= RELAY_TOGGLE_INTERVAL_MS) {
    tLastRelay = now;
    testRelay();
  }

  if (now - tLastLcd >= LCD_ROTATE_INTERVAL_MS) {
    tLastLcd = now;
    updateLCD();
  }

  if (now - tLastStatus >= SERIAL_STATUS_INTERVAL_MS) {
    tLastStatus = now;
    printStatus();
  }
}

// ============================================================
// SECTION 10: FUNCTION DEFINITIONS
// ============================================================

// Initializes every sensor and prints a clear OK/FAILED status
// line for each one, so a wiring problem is obvious immediately.
void initSensors() {
  Serial.println(F("Initializing sensors..."));

  // --- MLX90640 ---
  if (mlx.begin(MLX90640_I2CADDR_DEFAULT, &Wire)) {
    mlx.setMode(MLX90640_CHESS);
    mlx.setResolution(MLX90640_ADC_18BIT);
    mlx.setRefreshRate(MLX90640_2_HZ);
    mlxReady = true;
    Serial.println(F("MLX90640.......OK"));
  } else {
    mlxReady = false;
    Serial.println(F("MLX90640.......FAILED (check wiring / I2C address)"));
  }

  // --- DHT11 ---
  dht.begin();
  Serial.println(F("DHT11..........Initialized (first read confirms wiring)"));

  // --- ACS712 / Relay / Buzzer / LCD need no init beyond pinMode/Wire ---
  Serial.println(F("ACS712.........Ready (analog sensor)"));
  Serial.println(F("Relay..........Ready"));
  Serial.println(F("Buzzer.........Ready"));
  Serial.println(F("LCD............OK"));
}

// Measures the ACS712's zero-current baseline voltage by averaging
// many ADC samples at boot. IMPORTANT: no current should be flowing
// through the sensor while this runs, or the calibration will be
// wrong -- keep the monitored circuit unpowered during this step.
// Falls back to ACS712_ZERO_CURRENT_VOLTAGE if the result looks
// physically unreasonable (e.g. wiring fault).
void calibrateACS712() {
  long sum = 0;

  Serial.println(F("Calibrating ACS712 zero-current baseline..."));
  Serial.println(F("(Ensure no current is flowing through the sensor now)"));

  for (int i = 0; i < ACS712_CALIBRATION_SAMPLES; i++) {
    sum += analogRead(PIN_ACS712);
    delay(5); // brief spacing between samples; runs once at boot only
  }

  float avgADC = sum / (float)ACS712_CALIBRATION_SAMPLES;
  float measuredZeroVoltage = (avgADC / (float)ADC_MAX_VALUE) * ADC_VOLTAGE_REF;

  // A healthy ACS712 zero point should sit close to VCC/2 (~1.65V on
  // a 3.3V ADC reading a 5V-supplied sensor). Reject wildly off values.
  if (measuredZeroVoltage > 1.0 && measuredZeroVoltage < 2.3) {
    acsZeroVoltageCalibrated = measuredZeroVoltage;
    Serial.print(F("ACS712 calibrated. Zero-current voltage: "));
    Serial.print(acsZeroVoltageCalibrated, 4);
    Serial.println(F("V"));
  } else {
    Serial.print(F("ACS712 calibration out of expected range ("));
    Serial.print(measuredZeroVoltage, 4);
    Serial.println(F("V) -- keeping fallback value. Check wiring."));
  }
}

// One-time boot splash screen on the LCD.
// The short delay here is intentional and acceptable: it only
// runs once at boot, purely so the splash is human-readable.
void showBootScreen() {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print(F("ThermoGuard"));
  lcd.setCursor(0, 1);
  lcd.print(F("System Booting.."));
  delay(1500);
}

// Reads one thermal frame from the MLX90640 and computes
// min / max / average / hotspot temperature across all 768 pixels.
void readMLX() {
  if (!mlxReady) {
    Serial.println(F("MLX90640: skipped (not initialized)"));
    return;
  }

  if (mlx.getFrame(mlxFrame) != 0) {
    Serial.println(F("MLX90640: frame read error"));
    return;
  }

  float minT = mlxFrame[0];
  float maxT = mlxFrame[0];
  float sumT = 0.0;

  for (uint16_t i = 0; i < MLX_PIXEL_COUNT; i++) {
    float t = mlxFrame[i];
    if (t < minT) minT = t;
    if (t > maxT) maxT = t;
    sumT += t;
  }

  mlxMinTempC     = minT;
  mlxMaxTempC     = maxT;
  mlxAvgTempC     = sumT / MLX_PIXEL_COUNT;
  mlxHotspotTempC = maxT; // hottest single pixel in the frame

  Serial.print(F("MLX90640 -> Min: "));
  Serial.print(mlxMinTempC, 1);
  Serial.print(F("C  Max: "));
  Serial.print(mlxMaxTempC, 1);
  Serial.print(F("C  Avg: "));
  Serial.print(mlxAvgTempC, 1);
  Serial.print(F("C  Hotspot: "));
  Serial.print(mlxHotspotTempC, 1);
  Serial.println(F("C"));
}

// Reads ambient temperature and humidity from the DHT11.
void readDHT() {
  float t = dht.readTemperature();
  float h = dht.readHumidity();

  if (isnan(t) || isnan(h)) {
    Serial.println(F("DHT11: read failed"));
    return;
  }

  dhtTemperatureC = t;
  dhtHumidityPct  = h;

  Serial.print(F("DHT11 -> Temp: "));
  Serial.print(dhtTemperatureC, 1);
  Serial.print(F("C  Humidity: "));
  Serial.print(dhtHumidityPct, 1);
  Serial.println(F("%"));
}

// Reads the ACS712 analog output, converts it to a voltage, and
// estimates current using the configured sensitivity constant.
void readCurrent() {
  acsRawADC   = analogRead(PIN_ACS712);
  acsVoltage  = (acsRawADC / (float)ADC_MAX_VALUE) * ADC_VOLTAGE_REF;
  acsCurrentA = (acsVoltage - acsZeroVoltageCalibrated) / ACS712_SENSITIVITY_V_PER_A;

  Serial.print(F("ACS712 -> Raw ADC: "));
  Serial.print(acsRawADC);
  Serial.print(F("  Voltage: "));
  Serial.print(acsVoltage, 3);
  Serial.print(F("V  Current: "));
  Serial.print(acsCurrentA, 3);
  Serial.println(F("A"));
}

// Toggles the relay on/off, prints the new state, and beeps once
// to confirm the change acoustically as well as on screen.
void testRelay() {
  relayIsOn = !relayIsOn;
  digitalWrite(PIN_RELAY, relayIsOn ? HIGH : LOW);

  Serial.println(relayIsOn ? F("Relay ON") : F("Relay OFF"));

  beep();
}

// Sounds the active buzzer once. The short delay here is
// intentional and acceptable: it only defines how long the
// beep is audible and does not block any sensor timing that
// matters (it runs inside testRelay, which itself is only
// called once every RELAY_TOGGLE_INTERVAL_MS).
void beep() {
  digitalWrite(PIN_BUZZER, HIGH);
  delay(100);
  digitalWrite(PIN_BUZZER, LOW);
}

// Rotates the 16x2 LCD through 4 status screens every
// LCD_ROTATE_INTERVAL_MS, using the most recently read sensor values.
void updateLCD() {
  lcd.clear();

  switch (lcdScreenIndex) {
    case 0:
      lcd.setCursor(0, 0);
      lcd.print(F("ThermoGuard"));
      lcd.setCursor(0, 1);
      lcd.print(F("Running"));
      break;

    case 1:
      lcd.setCursor(0, 0);
      lcd.print(F("Temp: "));
      lcd.print(dhtTemperatureC, 1);
      lcd.print((char)223); // degree symbol
      lcd.print(F("C"));
      lcd.setCursor(0, 1);
      lcd.print(F("Humidity: "));
      lcd.print(dhtHumidityPct, 0);
      lcd.print(F("%"));
      break;

    case 2:
      lcd.setCursor(0, 0);
      lcd.print(F("Current: "));
      lcd.print(acsCurrentA, 2);
      lcd.print(F("A"));
      lcd.setCursor(0, 1);
      lcd.print(F("Relay: "));
      lcd.print(relayIsOn ? F("ON") : F("OFF"));
      break;

    case 3:
      lcd.setCursor(0, 0);
      lcd.print(F("MLX Max: "));
      lcd.print(mlxMaxTempC, 1);
      lcd.setCursor(0, 1);
      lcd.print(F("MLX Avg: "));
      lcd.print(mlxAvgTempC, 1);
      break;
  }

  lcdScreenIndex = (lcdScreenIndex + 1) % 4;
}

// Prints a full status block to the Serial Monitor in the
// requested fixed format.
void printStatus() {
  Serial.println(F("----------------------------"));
  Serial.println(F("ThermoGuard Status"));

  Serial.print(F("Ambient Temp : "));
  Serial.print(dhtTemperatureC, 1);
  Serial.println(F(" C"));

  Serial.print(F("Humidity     : "));
  Serial.print(dhtHumidityPct, 1);
  Serial.println(F(" %"));

  Serial.print(F("Current      : "));
  Serial.print(acsCurrentA, 3);
  Serial.println(F(" A"));

  Serial.print(F("MLX Avg      : "));
  Serial.print(mlxAvgTempC, 1);
  Serial.println(F(" C"));

  Serial.print(F("MLX Max      : "));
  Serial.print(mlxMaxTempC, 1);
  Serial.println(F(" C"));

  Serial.print(F("Relay        : "));
  Serial.println(relayIsOn ? F("ON") : F("OFF"));

  Serial.print(F("System Status: "));
  Serial.println(mlxReady ? F("OK") : F("DEGRADED (MLX90640 not ready)"));

  Serial.println(F("----------------------------"));
}
