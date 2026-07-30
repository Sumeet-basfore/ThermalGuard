# ThermalGuard - Industrial Thermal Intelligence & Fire Prevention

![ThermalGuard Open Graph Banner](web/public/og-image.png)

ThermalGuard is an end-to-end AI-powered industrial thermal intelligence and fire safety system. It combines edge hardware sensing (ESP32, MLX90640 spatial thermal camera array, DHT11 environmental sensor, and ACS712 line current sensor) with a modern high-performance web dashboard.

---

## 🌟 Key Features

- **🔥 Spatial Thermal Array Heatmap**: 32×24 (768 sub-pixels) infrared camera mapping powered by MLX90640 with interactive hotspot isolation.
- **⚡ Predictive Fire Prevention**: ACS712 high-frequency current monitoring with automated safety relay trips before ignition occurs.
- **📺 Dedicated Presentation Mode**: Projector-ready executive mode with 5xl metric cards, high-contrast trend curves, and zero debug noise.
- **📡 Central REST API & Fault Tolerance**: Robust ESP32 REST client with 2000ms timeouts, auto-reconnect loops, and zero UI crash guarantees on sensor disconnects.
- **♿ Production Design Language**: Dark industrial glassmorphism UI built with React 19, Vite, Framer Motion, and Tailwind CSS.

---

## 📁 Repository Structure

```
ThermalGuard/
├── Hardware/               # ESP32 PlatformIO & Arduino Firmware
│   └── ThermoGuard_V1.ino # ESP32 C++ Sketch (MLX90640, DHT11, ACS712, Relay, Buzzer)
└── web/                    # Operations Dashboard (React + Vite)
    ├── public/             # Favicon & Open Graph Media Assets
    ├── src/
    │   ├── app/
    │   │   ├── components/ # Reusable UI & Hardware-mapped components
    │   │   ├── context/    # TelemetryContext state provider & polling loop
    │   │   ├── services/   # Central REST API service (api.ts)
    │   │   └── routes.tsx  # React Router 7 page views & routes
    │   └── styles/         # Custom CSS Design Tokens & Themes
    └── package.json
```

---

## 🚀 Getting Started

### Web Operations Dashboard
```bash
cd web
npm install
npm run dev
```

### Building for Production
```bash
cd web
npm run build
```

---

## 🔌 Hardware Setup & Pin Mapping

| Sensor / Module | ESP32 GPIO Pin | Description |
| :--- | :--- | :--- |
| **MLX90640 Thermal Array** | GPIO 21 (SDA), GPIO 22 (SCL) | I2C Address 0x33, 8.0 FPS |
| **DHT11 Environmental Sensor** | GPIO 4 | Ambient Temperature & Humidity |
| **ACS712 Current Sensor** | ADC Pin 34 | Line Current (0.185 V/A Sensitivity) |
| **Safety Relay Module** | GPIO 18 | Automated Overcurrent Power Disconnect |
| **Active Acoustic Buzzer** | GPIO 19 | Acoustic Warning Alarm Signal |

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for details.
