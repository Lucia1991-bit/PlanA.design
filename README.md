## [Plan A](https://plan-a-design.vercel.app/)

**Plan A is an Online Design Tool for Creating Interior Floor Plans.**

Developed to simplify the complex process of traditional design software, Plan A offers an intuitive platform for both professionals and enthusiasts. With user-friendly features like `Wall Sketching`, `Room Detection`, `Material Library`, and `Furniture Library`, it streamlines the creation of detailed 2D floor plans, making interior design more accessible and efficient.

![homepage](https://res.cloudinary.com/datj4og4i/image/upload/v1726918479/homepage_x7j4gk.png)

[Demo Video]()

## Table of Contents

- [Tech Stack](#technical-stack)
- [Website Features](#website-features)

## Tech Stack

- **Frontend Framework**: Next.js, React, TypeScript
- **CSS Library**: Chakra UI
- **Canvas Manipulation**: Canvas API, Fabric.js
- **State Management**: React Context API, Custom Hooks
- **Backend Services**: Firebase Authentication, Cloud Firestore
- **Data Handling**: React Query
- **Version Control**: Git / GitHub
- **Deployment**: Vercel

## Website Features

#### Home Page

![auth](https://res.cloudinary.com/datj4og4i/image/upload/v1726838909/%E6%88%AA%E5%9C%96_2024-09-20_%E6%99%9A%E4%B8%8A9.20.13_h5vabm.png)

![introduction](https://res.cloudinary.com/datj4og4i/image/upload/v1726838957/%E6%88%AA%E5%9C%96_2024-09-15_%E6%99%9A%E4%B8%8A8.05.11_hgnilj.png)

![instruction](https://res.cloudinary.com/datj4og4i/image/upload/v1726838959/%E6%88%AA%E5%9C%96_2024-09-15_%E6%99%9A%E4%B8%8A8.05.36_w6vfqj.png)

- Informative layout with website introduction and usage instructions.
- Sign-up / Sign-in options:
  - Email
  - Google third-party authentication
  - Test account provided
- Automatic redirection to Dashboard page after sign in.

#### Dashboard Page

![dashboard](https://res.cloudinary.com/datj4og4i/image/upload/v1726929121/dashboard2_qhi35a.gif)

- Displays user's design projects retrieved from database.
- Project management:
  - Create new project
  - Rename project
  - Delete project
  - Projects sorted by most recent update

#### Design Editor Page

##### Grid System

- Fixed grid overlay providing precise dimensional references.
- Mouse-centric zooming.
- Smooth panning across the canvas.

##### Top toolbar

![toolbar](https://res.cloudinary.com/datj4og4i/image/upload/v1726929122/toptoolbar2_d7fk5h.gif)

- Top toolbar with tooltips showing function descriptions and hotkeys.
- Project management features:
  - Rename project functionality, syncing with dashboard for consistency.
  - Save project to database, ensuring work is always backed up.
- Canvas controls:
  - Clear canvas option for starting fresh or major redesigns.
  - Toggle between light and dark modes for comfortable editing in any environment.
- Edit history:
  - Undo and Redo functionality for easy correction and experimentation.

##### Wall Sketching and Room Detection

![wall sketch](https://res.cloudinary.com/datj4og4i/image/upload/v1726935013/%E7%95%AB%E7%89%863.gif)

- Grid-snapping feature for precise placement.
- Real-time preview of walls and guide lines while dragging.
- 360-degree wall rotation for irregular space design.
- Automatic room detection: recognizes enclosed spaces as rooms and applies default materials.
- Ability to continue unfinished walls.

##### Material Application

![material application](https://res.cloudinary.com/datj4og4i/image/upload/v1726929121/%E5%A1%AB%E5%85%A5%E6%9D%90%E8%B3%AA2_qabphl.gif)

- Apply materials to selected rooms.
- System provides warning if non-room objects are selected for material application

##### Component Interaction

![component interaction](https://res.cloudinary.com/datj4og4i/image/upload/v1726935642/%E7%89%A9%E4%BB%B6%E4%BA%92%E5%8B%953.gif)

- Doors, Windows, and Furniture:
  - Free drag, rotate, and drop functionality for easy placement and adjustment.
  - Scaling functionality to resize objects as needed.
  - Right-click menu for additional operations (e.g., copy, paste, delete and more).
  - Hotkey support for quick actions and improved workflow.

##### Layering System

![layering](https://res.cloudinary.com/datj4og4i/image/upload/v1726929120/%E9%A0%86%E5%BA%8F2_f46fbn.gif)

- Automatic layering: rooms and walls remain beneath objects.
- Manual control over object stacking order for fine-tuned designs.

##### Export Functionality

![export](https://res.cloudinary.com/datj4og4i/image/upload/v1726935771/%E5%8C%AF%E5%87%BA3.gif)

- Export as PNG image with selectable A3 or A4 size.
- Automatic canvas data backup to database during export.
