# InfiniteTravel

InfiniteTravel is a 2D side-scrolling platformer built using HTML5 Canvas and JavaScript. You take control of a hero navigating an endless terrain filled with enemies, bosses, and increasing difficulty. With dynamic background scrolling, a responsive combat system, and a fully integrated HUD, InfiniteTravel aims to deliver an immersive arcade-style experience in the browser.

---

## 🎮 Features

- **Player Mechanics** – Smooth movement, responsive controls, and jump physics.
- **Scrolling World** – Canvas scrolls with player progression; backward movement is blocked.
- **Enemy System** – Enemies spawn periodically and scale in health and damage over time.
- **Boss Battles** – Tougher enemies appear at intervals, armed with projectiles or melee attacks.
- **Combat System** – Both player and enemies can deal/receive multiple hits.
- **UI & Menus** – Includes health bars, score tracking, pause functionality, and a main menu.
- **Score System** – Score increases only when you surpass your furthest distance yet.
- **Parallax Background** – Scrolling backgrounds enhance visual depth.
- **Difficulty Scaling** – Game becomes harder as time passes (enemy stats increase).

---

## Getting Started

Since this game uses a database to save scores and accounts, you need a local server environment.

### Prerequisites

* A modern web browser (Chrome, Firefox, Edge, etc.)
* **XAMPP** (Required for PHP & MySQL) - [Download Here](https://www.apachefriends.org/index.html)

### Run Locally

1.  **Setup Server:**
    * Install **XAMPP** and open the Control Panel.
    * Click "Start" for both **Apache** and **MySQL**.

2.  **Clone the repository:**
    * Navigate to your XAMPP `htdocs` folder (usually `C:\xampp\htdocs`).
    * Open terminal there and run:
        ```bash
        git clone [https://github.com/YusufTheDev/infinitetravel.git](https://github.com/YusufTheDev/infinitetravel.git)
        ```

3.  **Setup Database:**
    * Open your browser and go to: `http://localhost/phpmyadmin`
    * Click **New**.
    * **Database Name:** Enter `infinitetravel`.
    * **Type (Collation):** Select `utf8mb4_general_ci` from the dropdown (Important for special characters).
    * Click **Create**.
    * Select your new database on the left, go to the **Import** tab, and upload the `userInformation.sql` file from the project folder.

4.  **Start Game:**
    * Open your browser and enter:
        ```
        http://localhost/infinitetravel/MainMenu/index.php
        ```

### Author
Yusuf Khan

### Edited by
Yucheng Wang
