# Infuse Galaxy Run 🌌🏃‍♂️

![Infuse Galaxy Run Banner](./src/assets/images/galaxy_run_banner.svg)

A high-speed, fully interactive 3D synthwave runner built with React, Three.js, React Three Fiber, and Tailwind CSS. Swerve through cyber-lanes, collect glowing level-specific keywords, purchase powerful upgrades from the integrated retro shop portal, and dominate the synthwave cosmos!

---

## 🎮 Game Levels Overview

Progression in **Infuse Galaxy Run** is governed by collecting glowing neon letters distributed across the running lanes. Completing a level requires spell-out collection of that level's unique cosmic keyword. Each tier accelerates your base running velocity and intensifies obstacle spawn patterns.

### 🌟 Level 1: NEON
* **Target Word**: `N` `E` `O` `N` (4 letters)
* **Aesthetic Vibe**: Mild retro grid with soft purple/magenta ambient lighting.
* **Speed Profile**: Base speed, serving as an introduction to basic lane switching, obstacle profiles, and single-jump physics.
* **Challenge Rating**: ⭐ (Beginner)
* **Strategy**: Use this level to hoard cosmic gems. Focus on learning the exact hitboxes of incoming barricades and practice timed jumps to clear elevated obstacles safely.

### 🪐 Level 2: COSMOS
* **Target Word**: `C` `O` `S` `M` `O` `S` (6 letters)
* **Aesthetic Vibe**: Violet star clusters and pulsing cosmic dust lanes.
* **Speed Profile**: Increased acceleration (+15% speed increase). 
* **Challenge Rating**: ⭐⭐ (Intermediate)
* **Strategy**: The letters are placed closer together, sometimes requiring quick diagonal lane-shifts. Keep your eyes further down the lane to anticipate obstacles earlier.

### ☄️ Level 3: GALAXY
* **Target Word**: `G` `A` `L` `A` `X` `Y` (6 letters)
* **Aesthetic Vibe**: Vibrant starlight lanes with custom neon-pink and teal galaxy colors.
* **Speed Profile**: Significant speed boost (+30% velocity from base level). 
* **Challenge Rating**: ⭐⭐⭐ (Challenging)
* **Strategy**: At this speed, reaction times are tested. It is highly recommended to visit the Shop prior to starting Level 3 to purchase **Double Jump** and a **Max Lives Upgrade**.

### ⚡ Level 4: HYPER
* **Target Word**: `H` `Y` `P` `E` `R` (5 letters)
* **Aesthetic Vibe**: High-energy hyper-drive space with pulsing orange and gold solar winds.
* **Speed Profile**: +50% speed increase. Standard obstacle collision becomes extremely punishing due to compressed response windows.
* **Challenge Rating**: ⭐⭐⭐⭐ (Expert)
* **Strategy**: Use the **Double Jump** to hover longer in mid-air, effectively bypassing crowded lane configurations. Collect letters only when there's a clear trajectory.

### 🌌 Level 5: INFINITY
* **Target Word**: `I` `N` `F` `I` `N` `I` `T` `Y` (8 letters)
* **Aesthetic Vibe**: Pristine void-black space punctuated by high-voltage cyan, magenta, and gold particles.
* **Speed Profile**: Maximum hyper-drive speed (+75% speed increase).
* **Challenge Rating**: ⭐⭐⭐⭐⭐ (Master)
* **Strategy**: The ultimate test of endurance. Utilize **Instant Immortality** (press `S` on desktop) to protect yourself during dense obstacle corridors. Plan your power-up activations wisely!

---

## 🚀 Key Features

* **Advanced 3D Astronaut Runner**: Control a meticulously structured 3D spacesuit character equipped with animated twin jetpack thruster flames, protective pauldrons, glowing chest emblems, helmet visors, and realistic jointed limb movements.
* **Coordinate Maps (Dynamic Environments)**: Choose from 4 highly stylized environments:
  * **Andromeda Path**: Classic violet and pink cosmic cruising.
  * **Neon Tokyo Grid**: Accelerated cyan neon metropolis cruise (+25% Speed).
  * **Solar Flare Orbit**: Intense red/orange debris field near a dying star (+35% Obstacles).
  * **Void Abyss Sector**: Pristine gold-on-black monochromatic hyper-horizon.
* **Custom Spacesuit Presets**: Toggle between four distinctive suit skins (**Cyber Cyan**, **Nova Pink**, **Void Gold**, **Plasma Mint**), altering armor materials, joint metals, and glow accents in real-time from the dashboard.
* **Real-time Retro Shop**: Acquire custom power-ups using collected cosmic gems:
  * **Triple Jump Upgrade**: Unlock capability to perform up to 3 consecutive mid-air jumps (Double Jump is available by default!).
  * **Max Lives Upgrade**: Increase total survival capability.
  * **Instant Immortality**: Trigger an invincibility field at will.

---

## ⚡ Track Power-Ups

In addition to store-purchased upgrades, the cosmic lanes spawn glowing interactive power-ups that players can collect directly from the track:

* 🧡 **Hyperdrive Boost (Glowing Orange Octahedron)**: Instantly enter superluminal speed (+50% speed boost) for 8 seconds. This lets you cover massive distance and scale scores in a fraction of the time, complete with a glowing golden spacesuit transformation.
* 💙 **Deflector Shield (Glowing Blue Sphere)**: Generates a translucent neon cyber-shield bubble around your astronaut for 8 seconds. While the shield is active, you are completely immune to damage from barricades, missiles, and other alien hazards.

---

## 🛠️ Controls

* **A / D** or **Left / Right Arrow Keys**: Shift Lanes left/right.
* **W** or **Up Arrow Key / Spacebar**: Jump (Double Jump by default! Triple Jump if upgrade purchased!).
* **S** or **Down Arrow Key**: Activate Immortality power shield (requires purchase).
* **Mobile Swipe Controls**: Swipe Left/Right to shift lanes, Swipe Up to Jump.

---

## 📦 Stack Configuration

* **Runtime**: React (v19) + Vite
* **3D Engine**: Three.js + React Three Fiber (`@react-three/fiber`)
* **Helpers**: React Three Drei (`@react-three/drei`)
* **State Management**: Zustand
* **Styling**: Tailwind CSS
* **Icons**: Lucide React



