from PIL import Image, ImageDraw, ImageOps
import sys

def make_circle(input_path, output_path):
    # Open the image and convert to RGBA to allow transparency
    img = Image.open(input_path).convert("RGBA")
    
    # Get the bounding box of the non-white area just in case it has whitespace
    # But wait, it's easier to just assume it's a square and we just mask a circle.
    # The logo might have a white background which we want to make transparent OUTSIDE the circle.
    w, h = img.size
    
    # Create a mask of the same size as the image
    mask = Image.new("L", (w, h), 0)
    draw = ImageDraw.Draw(mask)
    
    # Draw a white circle on the mask (to keep the pixels inside)
    # Since we used scale(1.25) in CSS, the actual circle in the jpeg is about 80% of the image size
    # Let's crop it tightly to the circle.
    # We can detect the circle by looking for the outermost non-white pixels, or just applying a 15% margin mask.
    margin = int(w * 0.125) # 12.5% margin (equivalent to scaling by 1.25 in CSS)
    draw.ellipse((margin, margin, w - margin, h - margin), fill=255)
    
    # Create the output image
    output = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    output.paste(img, (0, 0), mask)
    
    # Crop the image to just the circle
    output = output.crop((margin, margin, w - margin, h - margin))
    
    output.save(output_path, "PNG")

if __name__ == "__main__":
    make_circle("report/logo.jpeg", "report/favicon.png")
