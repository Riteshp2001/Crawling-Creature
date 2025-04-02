# Crawling Creature

Welcome to **Crawling Creature** – an experimental and interactive art project built with [Next.js](https://nextjs.org) and bootstrapped using [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app). This project brings a living, crawling creature to your browser with dynamic canvas rendering and customizable controls.

---

## Table of Contents

- [Overview](#overview)
- [Getting Started](#getting-started)
- [Creature Controls](#creature-controls)
- [How It Works](#how-it-works)
- [Learn More](#learn-more)
- [Deploy on Vercel](#deploy-on-vercel)

---

## Overview

**Crawling Creature** renders a creature on an HTML canvas that follows your mouse movements. Built with React and Next.js, the project leverages canvas drawing techniques along with a unique modular creature system defined in `Creature.tsx` and supporting utilities in the `utils` folder. The creature is built using segments that form body parts like the neck, torso, legs, and tail, and even features an interactive leg system for realistic animations.

---

## Getting Started

First, clone the repository and install the dependencies:

```bash
git clone https://github.com/your-username/Crawling-Creature.git
cd Crawling-Creature
npm install
```

Then, start the development server with one of the following commands:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see your living creature in action!

---

## Creature Controls

Customize the creature in real-time using the control panel overlaid on the canvas:

- **Creature Size:** Adjust the overall size of the creature (max 25).
- **Legs:** Set the number of legs (minimum 1).
- **Tail:** Control the tail length (minimum 1).
- **Color:** Choose the drawing color.
- **Stroke Width:** Modify the stroke width for drawing (max 15).

Each control updates the creature’s attributes dynamically, allowing you to experiment with different forms and behaviors.

---

## How It Works

- **Canvas & Rendering:**  
  The creature is rendered on an HTML5 canvas. A responsive canvas is maintained by updating the width and height on every browser resize, ensuring that the artwork fits perfectly into your window.

- **Creature Construction:**  
  The creature is constructed using a composite pattern with multiple segments. Each part (neck, torso, legs, tail) is created as an instance of `Segment` or enhanced via the `LegSystem`. This modular design lets different creature parts be controlled separately.

- **Animation Loop:**  
  An animation loop continuously clears and redraws the canvas. It also makes the creature follow the mouse by reading the position from the input module, delivering an interactive and dynamic experience.

- **Client-Side Only:**  
  With `"use client"` at the top of the component file, this project leverages Next.js client-side rendering for smooth interactivity.

---

## Learn More

To continue your journey with Next.js and canvas-based projects, consider these resources:

- [Next.js Documentation](https://nextjs.org/docs) – Explore Next.js features and best practices.
- [Learn Next.js](https://nextjs.org/learn) – Get hands-on with an interactive tutorial.
- [Canvas API MDN](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API) – Understand the basics of the HTML canvas.

---

## Deploy on Vercel

Deploy your version of **Crawling Creature** easily via the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme). Vercel offers seamless integration with Next.js projects and ensures your creation is available worldwide.

For more details on deployment, visit [Next.js Deployment Documentation](https://nextjs.org/docs/app/building-your-application/deploying).

---

Have fun tweaking the creature's parameters and watching it crawl across the canvas. Your feedback and contributions are welcome to enhance the project further!

Happy Coding!
