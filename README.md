# Monkee Business

A website for a tribute band to The Monkees featuring a dynamic, responsive design and an animated guitar logo.

## Features

#### Responsive Design:

The website is built to look great on all devices with a mobile-first approach.

#### Image Optimization:

Images are optimized for fast loading. Use the provided convert_to_webp_avif.sh script to convert image assets into efficient WebP and AVIF formats.

#### Animated Logo:

The guitar-shaped logo is animated using CSS, adding a lively touch reminiscent of a live performance.

#### Local Development Server:

Quickly launch the site locally with the included server.py file.

## Getting Started

#### 1. Clone the Repository:

```bash
git clone https://github.com/beingforthebenefit/MonkeeBusiness.git
cd MonkeeBusiness
```

#### 2. Optimize Images: Run the conversion script to generate WebP and AVIF formats:

```bash
cd img
chmod +x convert_to_webp_avif.sh
./convert_to_webp_avif.sh
```

This script converts to both formats and chooses the one with the smallest filesize to keep.

#### 3. Start the Development Server: Launch the server with:

```bash
python server.py
```

Then open your browser at http://localhost:5500.

## Technologies Used

- HTML, CSS, JavaScript
- Python (for the local server)
- Inkscape (for SVG asset creation)