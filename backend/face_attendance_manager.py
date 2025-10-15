import face_recognition
from milvus_service import FaceDatabaseService
import os
from datetime import datetime
from response_model import ResponseModel

class FaceAttendanceManager:
    @classmethod
    def extract_face_vector(cls, image_path):
        image = face_recognition.load_image_file(image_path)
        encodings = face_recognition.face_encodings(image)
        if not encodings:
            return None
        face_vector = encodings[0].tolist() if hasattr(encodings[0], 'tolist') else encodings[0]
        return face_vector

    @classmethod
    def register_face(cls,image_path, name, job_id) -> ResponseModel:
        face_vector = cls.extract_face_vector(image_path)
        if not face_vector:
            return ResponseModel(status=400, message='没有检测到人脸', data=None)
        service = FaceDatabaseService.get_instance()
        success, msg = service.save_face_image(face_vector, name, job_id)
        formatted_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        if success:
            print({'message': f'注册成功: {name}({job_id}) {formatted_time}'}, flush=True)
            return ResponseModel(status=200, message=f'注册成功: {name}({job_id}) {formatted_time}', data=None)
        else:
            print({'message': f'注册失败: {msg}'}, flush=True)
            return ResponseModel(status=500, message=f'注册失败: {msg}', data=None)

    @classmethod
    def attendance(cls,image_path) -> ResponseModel:
        face_vector = cls.extract_face_vector(image_path)
        service = FaceDatabaseService.get_instance()
        results, _msg = service.query_face_by_image(face_vector, top_k=1)
        if not results or 'ids' not in results[0]:
            print({'message': '人脸未注册，请注册后再考勤'}, flush=True)
            return ResponseModel(status=404, message='人脸未注册，请注册后再考勤', data=None)
        idx = 0
        distance = results[0].distances[idx] if hasattr(results[0], 'distances') else None
        threshold = 0.3
        if distance is not None and distance > threshold:
            print(f"Expected distance <= {threshold}, but got {distance}", flush=True)
            return ResponseModel(status=404, message='人脸未注册，请注册后再考勤', data=None)
        data = results[0]['metadata'][0] if 'metadata' in results[0] and results[0]['metadata'] else {}

        name = data.get('name', '')
        job_id = data.get('job_id', '')
        now = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        import pandas as pd
        df = pd.DataFrame([[job_id, name, now]], columns=['工号', '姓名', '考勤时间'])
        csv_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'attendance.csv')
        if os.path.exists(csv_path):
            df.to_csv(csv_path, mode='a', header=False, index=False)
        else:
            df.to_csv(csv_path, mode='w', header=True, index=False)
        print({'message': f'考勤成功: {name}({job_id}) {now}'}, flush=True)
        return ResponseModel(status=200, message=f'考勤成功: {name}({job_id}) {now}', data=None)