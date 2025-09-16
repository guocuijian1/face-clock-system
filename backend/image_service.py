import base64, io,os,pickle
from PIL import Image
import numpy as np
import face_recognition

class ImageService:
    def __init__(self, db_path='face_vectors.pkl'):
        self.db_path = db_path
        self.images_meta = []
        self.current_index = -1

    def load_images(self):
        if not os.path.exists(self.db_path):
            raise FileNotFoundError(f"Database file {self.db_path} not found.")

        with open(self.db_path, 'rb') as f:
            db = pickle.load(f)

        # Ensure all required keys exist in the database
        required_keys = ['names', 'job_ids', 'vectors']
        for key in required_keys:
            if key not in db:
                raise KeyError(f"Missing key '{key}' in the database.")

        # Validate that all lists have the same length
        if not (len(db['names']) == len(db['job_ids']) == len(db['vectors'])):
            raise ValueError("Inconsistent data lengths in the database.")

        self.images_meta = [
            {
                'index': idx,
                'name': name,
                'job_id': job_id,
                'image_binary': self.load_image_from_local(image_url)
            }
            for idx, (name, job_id, image_url) in enumerate(zip(db['names'], db['job_ids'], db['image_urls']))
        ]
        self.current_index = 0 if self.images_meta else -1

    @staticmethod
    def load_image_from_local(image_url):
        if not image_url or not os.path.exists(image_url):
            return None

        try:
            with open(image_url, 'rb') as img_file:
                img_bytes = img_file.read()
                img_base64 = base64.b64encode(img_bytes).decode('utf-8')
                return img_base64
        except Exception as e:
            print(f"Error loading image from {image_url}: {e}")
            return None

    @staticmethod
    def get_face_locations(base64_string):
        """
        检测图像中的人脸位置
        :param base64_string: base64编码的图像数据
        :return: 人脸位置列表 [(top, right, bottom, left),...]
        """
        # 获取当前文件所在目录
        current_dir = os.path.dirname(os.path.abspath(__file__))
        debug_dir = os.path.join(current_dir, "debug_images")
        if not os.path.exists(debug_dir):
            os.makedirs(debug_dir)

        # 解码 base64
        image_data = base64.b64decode(base64_string)
        image = Image.open(io.BytesIO(image_data))

        debug_image_path = os.path.join(debug_dir, "original_image.png")
        image.save(debug_image_path)
        print(f"_get_face_locations receive a image and saved to : {debug_image_path}")

        # 缩放
        max_size = 1024
        original_size = image.size
        if max(image.size) > max_size:
            ratio = max_size / max(image.size)
            new_size = tuple(int(dim * ratio) for dim in image.size)
            image = image.resize(new_size, Image.Resampling.LANCZOS)
            print(f"Resized image to: {image.size}")

        # 转为 RGB
        if image.mode != 'RGB':
            image = image.convert('RGB')

        rgb_image = np.array(image)
        print(f"NumPy array shape: {rgb_image.shape}")

        # 检测人脸 - 使用更激进的参数
        face_locations = face_recognition.face_locations(rgb_image, model="hog", number_of_times_to_upsample=2)
        print(f"Detected {len(face_locations)} faces")
        print(f"Raw face locations: {face_locations}")

        # 如果没有检测到人脸，尝试更激进的检测
        if not face_locations:
            face_locations = face_recognition.face_locations(rgb_image, model="hog", number_of_times_to_upsample=3)
            print(f"Second attempt detected {len(face_locations)} faces")

        # 如果图像被缩放了，需要将坐标映射回原始尺寸
        if max(original_size) > max_size:
            scale = max(original_size) / max_size
            face_locations_list = [
                (int(top * scale), int(right * scale), int(bottom * scale), int(left * scale))
                for (top, right, bottom, left) in face_locations
            ]
            print(f"Scaled face locations: {face_locations_list}")
        else:
            face_locations_list = list(face_locations)

        return face_locations_list

    @staticmethod
    def crop_and_save_face(base64_string, face_location):
        """
        从图像中裁剪人脸并保存
        :param base64_string: base64编码的图像数据
        :param face_location: 人脸位置 [top, right, bottom, left]
        :return: 裁剪后的人脸图像的base64编码
        """
        if not face_location:
            print("No face location provided")
            return ''

        try:
            # 解码base64
            image_data = base64.b64decode(base64_string)
            image = Image.open(io.BytesIO(image_data))

            # 确保图像是RGB模式
            if image.mode != 'RGB':
                image = image.convert('RGB')

            img_width, img_height = image.size
            print(f"Original image size: {img_width}x{img_height}")

            # 解析人脸位置坐标
            top, right, bottom, left = face_location  # 只处理第一个人脸
            print(f"Processing face: top={top}, right={right}, bottom={bottom}, left={left}")

            # 计算人脸框的尺寸
            face_width = right - left
            face_height = bottom - top
            print(f"Face dimensions: {face_width}x{face_height}")

            # 扩展裁剪区域（增加30%的边界）
            scale_ratio = 0.6
            padding_x = int(face_width * scale_ratio)
            padding_y = int(face_height * scale_ratio)

            # 确保扩展后的坐标不超出图像边界
            crop_left = max(0, left - padding_x)
            crop_top = max(0, top - padding_y)
            crop_right = min(img_width, right + padding_x)
            crop_bottom = min(img_height, bottom + padding_y)

            print(f"Crop coordinates: left={crop_left}, top={crop_top}, right={crop_right}, bottom={crop_bottom}")

            # 裁剪人脸
            face_image = image.crop((crop_left, crop_top, crop_right, crop_bottom))

            # 调整尺寸为统一大小
            target_size = (200, 200)
            face_image = face_image.resize(target_size, Image.Resampling.LANCZOS)

            # 转换为base64
            buffered = io.BytesIO()
            face_image.save(buffered, format="PNG")
            face_base64 = base64.b64encode(buffered.getvalue()).decode('utf-8')
            print("Successfully processed face")

            return face_base64

        except Exception as e:
            print(f"Error in crop_and_save_faces: {str(e)}")
            return ''  # 发生错误时返回空字符串
