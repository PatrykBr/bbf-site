# Work Images Directory

This directory contains images showcasing your past work organized by category.

## Directory Structure

- `all/` - Place copies of all images here (optional, as the component can display all categories)
- `wardrobes/` - Images of wardrobes and closet projects
- `kitchens/` - Images of kitchen projects
- `others/` - Other types of projects

## Adding Images

1. Add your images to the appropriate category folder
2. The file format should be JPG or WebP for better performance
3. For best display results, use high-quality images with consistent aspect ratios
4. Name your files descriptively (e.g., `modern-wardrobe-white.jpg`)

## Image Display

The Work component will:

- Display images in a responsive masonry layout
- Adapt to both vertical and horizontal images
- Show the image name on hover
- Open images in a modal with navigation when clicked
- Allow sharing of specific images

## Example

For each image you add, the component will automatically display it according to your chosen category filter. The image name will be derived from the filename (with hyphens converted to spaces and proper capitalization).

For more control, you can edit the `imageData` array in the `Work.tsx` component to provide custom details for each image.
