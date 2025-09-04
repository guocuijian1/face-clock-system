import face_recognition
import numpy as np
import pandas as pd
import os
import pickle
from datetime import datetime
import argparse

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

# 批量注册人脸信息
def batch_register_images():
    import glob
    import re
    image_files = glob.glob('source-pictures/*.jpg')
    pattern = re.compile(r'^(.+)-([0-9]+)\.jpg$')
    for img_path in image_files:
        filename = os.path.basename(img_path)
        match = pattern.match(filename)
        if match:
            name, job_id = match.groups()
            print(f'Registering: {name} ({job_id}) from {img_path}')
            register_face(img_path, name, job_id)
        else:
            print(f'Filename format not recognized: {filename}')

# 示例用法：
# 注册: register_face('person1.jpg', '张三', '1001')
# 考勤: attendance('person1_attend.jpg')

def main():
    parser = argparse.ArgumentParser(description='人脸注册与考勤系统')
    subparsers = parser.add_subparsers(dest='command')

    register_parser = subparsers.add_parser('register', help='注册人脸')
    register_parser.add_argument('--image-path', help='图片路径')
    register_parser.add_argument('--name', help='姓名')
    register_parser.add_argument('--job-id', help='工号')

    attend_parser = subparsers.add_parser('attend', help='考勤')
    attend_parser.add_argument('--image-path', help='图片路径')

    batch_parser = subparsers.add_parser('batch-register', help='批量注册 source-pictures 下所有图片')

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        exit(1)

    if args.command == 'register':
        register_face(args.image_path, args.name, args.job_id)
    elif args.command == 'attend':
        attendance(args.image_path)
    elif args.command == 'batch-register':
        batch_register_images()



if __name__ == '__main__':
    main()
