from PIL import Image
# Create a 5000x5000 image, around 10MB when saved as jpeg with high quality maybe
img = Image.new('RGB', (8000, 8000), color = 'red')
img.save('test_[weird]_image.jpg', quality=100)
