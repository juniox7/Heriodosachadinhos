import os
from PIL import Image

def resize_to_post(input_folder, output_folder, target_ratio=(4, 5)):
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)

    for filename in os.listdir(input_folder):
        if filename.lower().endswith(('.png', '.jpg', '.jpeg')):
            filepath = os.path.join(input_folder, filename)
            img = Image.open(filepath)
            
            # Target dimensions for 4:5 (e.g., 1080x1350)
            target_w = 1080
            target_h = 1350
            
            # Original dimensions
            w, h = img.size
            
            # Calculate new dimensions keeping aspect ratio
            img_ratio = w / h
            target_img_ratio = target_w / target_h
            
            if img_ratio > target_img_ratio:
                # Image is wider than 4:5
                new_w = target_w
                new_h = int(new_w / img_ratio)
            else:
                # Image is taller than 4:5 (like the 9:16 ones)
                new_h = target_h
                new_w = int(new_h * img_ratio)
                
            img_resized = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
            
            # Create a new blank canvas (4:5) with a white or matching background
            # We'll use a soft gray/white color matching the top of your images
            background = Image.new('RGB', (target_w, target_h), (245, 245, 245))
            
            # Paste the resized image into the center of the background
            offset = ((target_w - new_w) // 2, (target_h - new_h) // 2)
            background.paste(img_resized, offset)
            
            # Save
            out_filepath = os.path.join(output_folder, f"post_{filename}")
            background.save(out_filepath, quality=95)
            print(f"Salvo: {out_filepath}")

if __name__ == '__main__':
    current_dir = os.path.dirname(os.path.abspath(__file__))
    resize_to_post(current_dir, os.path.join(current_dir, 'prontas'))
