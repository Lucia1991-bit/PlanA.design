# [Plan A](https://plan-a-design.vercel.app/)

**Plan A is an Online Design Tool for Creating Interior Floor Plans.**

Developed to simplify the complex process of traditional design software, Plan A offers an intuitive platform for both professionals and enthusiasts. With user-friendly features like `Wall Sketching`, `Room Detection`, `Material Library`, and `Furniture Library`, it streamlines the creation of detailed 2D floor plans, making interior design more accessible and efficient.

<img src="https://res.cloudinary.com/datj4og4i/image/upload/v1726918479/homepage_x7j4gk.png" alt="homepage" width="1200"/>

<img src="https://res.cloudinary.com/datj4og4i/image/upload/v1731873926/RWD_Mesa_de_trabajo_1_teyzbg.png" alt="RWD" width="1200"/>

<!-- [Demo Video]() -->

**Test Account**

| Account               | Password |
| --------------------- | -------- |
| test@plana-design.com | 123456   |

## Table of Contents

- [Plan A](#plan-a)
  - [Table of Contents](#table-of-contents)
  - [Key Features](#key-features)
  - [Tech Stack](#tech-stack)
  - [Implementation Details](#implementation-details)
    - [Home Page](#home-page)
    - [Dashboard Page](#dashboard-page)
    - [Design Editor Page](#design-editor-page)
      - [Grid System](#grid-system)
      - [Top toolbar](#top-toolbar)
      - [Wall Sketching and Room Detection](#wall-sketching-and-room-detection)
      - [Material Application](#material-application)
      - [Component Interaction](#component-interaction)
      - [Layering System](#layering-system)
      - [Export Functionality](#export-functionality)
      - [Custom Error Page](#custom-error-page)
  - [Contact](#contact)

## Key Features

| **Category**                       | **Features**                                                                                                                                                                                                                                                                    |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **WYSIWYG Floor Plan Editor**      | ❖ Grid-snapping system for precise wall placement<br>❖ Real-time wall preview while drawing<br>❖ 360° wall rotation for flexible layout<br>❖ Automated room detection from enclosed spaces<br>❖ Canvas zoom and pan controls<br>❖ Undo / redo functionality<br>❖ Hotkey support |
| **Material Library & Room System** | ❖ One-click material application to rooms<br>❖ Built-in material collection<br>❖ Smart warning system for invalid selections<br>❖ Automated floor pattern alignment                                                                                                             |
| **Component Library & Controls**   | ❖ Built-in doors, windows, and furniture collections<br>❖ Free drag, rotate, and scale functionality<br>❖ Right-click menu for quick operations<br>❖ Automated layering system                                                                                                  |
| **Project Management**             | ❖ Project organization dashboard<br>❖ Export in A3/A4 formats<br>❖ Auto-backup when exporting<br>❖ Recent updates tracking                                                                                                                                                      |

## Tech Stack

| **Category**           | **Technique**                                                                                                                                                                                                                                                                                                                 |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Frontend**           | ![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white) ![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black) ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white) |
| **UI Library**         | ![Chakra UI](https://img.shields.io/badge/Chakra%20UI-319795?style=for-the-badge&logo=chakraUI&logoColor=white)                                                                                                                                                                                                               |
| **WYSIWYG Editor**     | ![Canvas API](https://img.shields.io/badge/Canvas%20API-555?style=for-the-badge) ![Fabric.js](https://img.shields.io/badge/Fabric.js-555?style=for-the-badge)                                                                                                                                                                 |
| **State Management**   | ![React Context API](https://img.shields.io/badge/React%20Context%20API-888?style=for-the-badge) ![Custom Hooks](https://img.shields.io/badge/Custom%20Hooks-888?style=for-the-badge)                                                                                                                                         |
| **Backend / Database** | ![Firebase Authentication](https://img.shields.io/badge/Firebase%20Authentication-DD2C00?style=for-the-badge&logo=firebase&logoColor=white) ![Cloud Firestore](https://img.shields.io/badge/Firebase%20Firestore-DD2C00?style=for-the-badge&logo=firebase&logoColor=white)                                                    |
| **Data Handling**      | ![React Query](https://img.shields.io/badge/React%20Query-FF4154?style=for-the-badge&logo=reactQuery&logoColor=white)                                                                                                                                                                                                         |
| **Version Control**    | ![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white) ![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=gitHub&logoColor=white)                                                                                                                            |
| **Deployment**         | ![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)                                                                                                                                                                                                                         |

## Implementation Details

### Home Page

<img src="https://res.cloudinary.com/datj4og4i/image/upload/v1726838909/%E6%88%AA%E5%9C%96_2024-09-20_%E6%99%9A%E4%B8%8A9.20.13_h5vabm.png" alt="auth" width="1200"/>

<img src="https://res.cloudinary.com/datj4og4i/image/upload/v1726838957/%E6%88%AA%E5%9C%96_2024-09-15_%E6%99%9A%E4%B8%8A8.05.11_hgnilj.png" alt="introduction" width="1200"/>

<img src="https://res.cloudinary.com/datj4og4i/image/upload/v1726838959/%E6%88%AA%E5%9C%96_2024-09-15_%E6%99%9A%E4%B8%8A8.05.36_w6vfqj.png" alt="instruction" width="1200"/>

- Informative layout with website introduction and usage instructions.
- Sign-up / Sign-in options:
  - Email
  - Google third-party authentication
  - Test account provided
- Automatic redirection to Dashboard page after sign in.
  <br>

### Dashboard Page

<img src="https://res.cloudinary.com/datj4og4i/image/upload/v1726929121/dashboard2_qhi35a.gif" alt="dashboard" width="1200"/>

- Displays user's design projects retrieved from database.
- Project management:
  - Create new project
  - Rename project
  - Delete project
  - Projects sorted by most recent update
    <br>

### Design Editor Page

#### Grid System

- Fixed grid overlay providing precise dimensional references.
- Mouse-centric zooming.
- Smooth panning across the canvas.
  <br>

#### Top toolbar

<img src="https://res.cloudinary.com/datj4og4i/image/upload/v1726929122/toptoolbar2_d7fk5h.gif" alt="toolbar" width="1200"/>

- Top toolbar with tooltips showing function descriptions and hotkeys.
- Project management features:
  - Rename project functionality, syncing with dashboard for consistency.
  - Save project to database, ensuring work is always backed up.
- Canvas controls:
  - Clear canvas option for starting fresh or major redesigns.
  - Toggle between light and dark modes for comfortable editing in any environment.
- Edit history:
  - Undo and Redo functionality for easy correction and experimentation.
    <br>

#### Wall Sketching and Room Detection

<img src="https://res.cloudinary.com/datj4og4i/image/upload/v1726938193/%E7%95%AB%E7%89%86111.gif" alt="wall sketch" width="1200"/>

- Grid-snapping feature for precise placement.
- Real-time preview of walls and guide lines while dragging.
- 360-degree wall rotation for irregular space design.
- Automatic room detection: recognizes enclosed spaces as rooms and applies default materials.
- Ability to continue unfinished walls.
  <br>

#### Material Application

<img src="https://res.cloudinary.com/datj4og4i/image/upload/v1726929121/%E5%A1%AB%E5%85%A5%E6%9D%90%E8%B3%AA2_qabphl.gif" alt="material application" width="1200"/>

- Apply materials to selected rooms.
- System provides warning if non-room objects are selected for material application
  <br>

#### Component Interaction

<img src="https://res.cloudinary.com/datj4og4i/image/upload/v1726938159/%E7%89%A9%E4%BB%B6%E4%BA%92%E5%8B%95%E7%AC%AC%E4%BA%8C%E6%AC%A1.gif" alt="component interaction" width="1200"/>

- Doors, Windows, and Furniture:
  - Free drag, rotate, and drop functionality for easy placement and adjustment.
  - Scaling functionality to resize objects as needed.
  - Right-click menu for additional operations (e.g., copy, paste, delete and more).
  - Hotkey support for quick actions and improved workflow.
    <br>

#### Layering System

<img src="https://res.cloudinary.com/datj4og4i/image/upload/v1726929120/%E9%A0%86%E5%BA%8F2_f46fbn.gif" alt="layering" width="1200"/>

- Automatic layering: rooms and walls remain beneath objects.
- Manual control over object stacking order for fine-tuned designs.
  <br>

#### Export Functionality

<img src="https://res.cloudinary.com/datj4og4i/image/upload/v1726935771/%E5%8C%AF%E5%87%BA3.gif" alt="export" width="1200"/>

- Export as PNG image with selectable A3 or A4 size.
- Automatic canvas data backup to database during export.
  <br>

#### Custom Error Page

<img src="https://res.cloudinary.com/datj4og4i/image/upload/v1732009942/%E8%87%AA%E5%AE%9A%E7%BE%A9%E9%8C%AF%E8%AA%A4%E9%A0%81%E9%9D%A2_aoctr1.gif" alt="error" width="1200"/>
<br>

## Contact

Feel free to contact me if you have any questions about this project.😊

Email : thisislucia1991@gmail.com

Linkedin : https://www.linkedin.com/in/yinghsuan2024/

Phone : (+886) 919053736
