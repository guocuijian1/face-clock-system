import face_recognition
import numpy as np
import pandas as pd
import os
import pickle
from datetime import datetime

# 向量数据库文件
VECTOR_DB_PATH = 'backend/face_vectors.pkl'
# 考勤记录文件
ATTENDANCE_CSV = 'backend/attendance.csv'

# 注册人脸信息
def register_face(image_path, name, job_id, image_url=None):
    # 尝试加载现有的数据库，如果不存在则初始化一个新的
    if os.path.exists(VECTOR_DB_PATH):
        with open(VECTOR_DB_PATH, 'rb') as f:
            db = pickle.load(f)
            job_ids = db.get('job_ids', [])
            if job_id in job_ids:
                return {'error': f'工号 {job_id} 已存在，请使用不同的工号'}, 400
    else:
        os.makedirs(os.path.dirname(VECTOR_DB_PATH), exist_ok=True)
        # 数据库文件不存在时，创建一个新的数据库并保存
        db = {'vectors': [], 'names': [], 'job_ids': [], 'image_urls': []}
        with open(VECTOR_DB_PATH, 'wb') as f:
            pickle.dump(db, f)

    # 处理图片并提取向量
    image = face_recognition.load_image_file(image_path)
    encodings = face_recognition.face_encodings(image)
    if not encodings:
        return {'error': '没有检测到人脸'}, 400
    face_vector = encodings[0]

    # 向数据库添加新条目
    db['vectors'].append(face_vector)
    db['names'].append(name)
    db['job_ids'].append(job_id)
    db['image_urls'].append(image_url)

    # 保存更新后的数据库
    with open(VECTOR_DB_PATH, 'wb') as f:
        pickle.dump(db, f)

    formatted_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    print({'message': f'注册成功: {name}({job_id}) {formatted_time}'})
    return {'message': f'注册成功: {name}({job_id}) {formatted_time}'}, 200

# 查找人脸并考勤
def attendance(image_path):
    if not os.path.exists(VECTOR_DB_PATH):
        return {'error': '人脸未注册，请注册后再考勤'}, 400
    with open(VECTOR_DB_PATH, 'rb') as f:
        db = pickle.load(f)
    image = face_recognition.load_image_file(image_path)
    encodings = face_recognition.face_encodings(image)
    if not encodings:
        return {'error': '没有检测到人脸'}, 400
    face_vector = encodings[0].astype('float32')

    distances = face_recognition.face_distance(db['vectors'], face_vector)
    idx = np.argmin(distances)
    distance = distances[idx]

    threshold = 0.3
    if distance > threshold:
        print(f"Expected distance <= {threshold}, but got {distance}")
        return {'error': '人脸未注册，请注册后再考勤'}, 404

    name = db['names'][idx]
    job_id = db['job_ids'][idx]
    now = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    df = pd.DataFrame([[job_id, name, now]], columns=['工号', '姓名', '考勤时间'])
    if os.path.exists(ATTENDANCE_CSV):
        df.to_csv(ATTENDANCE_CSV, mode='a', header=False, index=False)
    else:
        df.to_csv(ATTENDANCE_CSV, mode='w', header=True, index=False)
    return {'message': f'考勤成功: {name}({job_id}) {now}'}, 200