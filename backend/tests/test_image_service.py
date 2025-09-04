import unittest
import os
import base64
import sys
from pathlib import Path

# Add the parent directory to Python path
sys.path.append(str(Path(__file__).parent.parent))

from image_service import ImageService

class TestImageService(unittest.TestCase):
    def setUp(self):
        self.image_service = ImageService()

    def test_get_face_locations(self):
        # Get the absolute path to the test image
        current_dir = os.path.dirname(os.path.abspath(__file__))
        image_path = f"{current_dir}/resources/man.jpg"

        # Read and convert image to base64
        with open(image_path, 'rb') as image_file:
            image_data = image_file.read()
            base64_string = base64.b64encode(image_data).decode('utf-8')

        # Test face detection
        face_locations = self.image_service.get_face_locations(base64_string)

        # Assertions
        self.assertIsNotNone(face_locations)
        self.assertIsInstance(face_locations, list)
        self.assertTrue(len(face_locations) > 0, "No faces detected")

        # Check the structure of face locations
        for face_location in face_locations:
            self.assertEqual(len(face_location), 4)  # Should have top, right, bottom, left
            self.assertTrue(all(isinstance(coord, int) for coord in face_location))

    def test_crop_and_save_faces(self):
        # Get the absolute path to the test image
        current_dir = os.path.dirname(os.path.abspath(__file__))
        image_path = f"{current_dir}/resources/man.png"
        test_output_dir = os.path.join(current_dir, 'test_detected_faces')

        # Read and convert image to base64
        with open(image_path, 'rb') as image_file:
            image_data = image_file.read()
            base64_string = base64.b64encode(image_data).decode('utf-8')

        # Get face locations first
        face_locations = self.image_service.get_face_locations(base64_string)

        # Test face cropping and saving
        face_str = self.image_service.crop_and_save_face(base64_string, face_locations[0])

        self.assertIsNotNone(face_str)

        if not os.path.exists(test_output_dir):
            os.makedirs(test_output_dir)
        #Please convert face_str to image and save it to test_output_dir for manual verification
        face_image_path = os.path.join(test_output_dir, 'cropped_face.png')
        with open(face_image_path, 'wb') as f:
            f.write(base64.b64decode(face_str))


if __name__ == '__main__':
    unittest.main()
