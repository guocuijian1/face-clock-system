import base64

from flask import Flask, request, jsonify
from face_attendance_manager import FaceAttendanceManager
from image_service import ImageService
import os
import tempfile

from flask_cors import CORS
from response_model import ResponseModel

app = Flask(__name__)
CORS(app)

def make_response(status: int, message: str, data=None) -> ResponseModel:
    return ResponseModel(status=status, message=message, data=data)

@app.route('/register', methods=['POST'])
def api_register():
    tmp_path = None
    name = request.form.get('name')
    job_id = request.form.get('job_id')
    if not all([name, job_id]):
        resp = make_response(400, 'Missing required parameters', None)
        return jsonify(resp.__dict__), resp.status
    if 'image_path' in request.files:
        image_file = request.files['image_path']
        with tempfile.NamedTemporaryFile(delete=False, suffix='.png') as tmp:
            image_file.save(tmp.name)
            tmp_path = tmp.name
    if not tmp_path:
        resp = make_response(400, 'Missing image file', None)
        return jsonify(resp.__dict__), resp.status
    try:
        result = FaceAttendanceManager.register_face(tmp_path, name, job_id)
        return jsonify(result.__dict__), result.status
    finally:
        if tmp_path and os.path.exists(tmp_path):
            os.remove(tmp_path)

@app.route('/attend', methods=['POST'])
def api_attend():
    image_path = request.form.get('image_path')
    if not image_path:
        resp = make_response(400, 'Missing image', None)
        return jsonify(resp.__dict__), resp.status
    # Detect if image_path is a base64 string (very long, contains only base64 chars)
    if len(image_path) > 100 and all(c.isalnum() or c in '+/=' for c in image_path):
        try:
            image_data = base64.b64decode(image_path)
            with tempfile.NamedTemporaryFile(delete=False, suffix='.png',dir='/tmp') as tmp:
                tmp.write(image_data)
                tmp_path = tmp.name
            result = FaceAttendanceManager.attendance(tmp_path)
            os.remove(tmp_path)
            return jsonify(result.__dict__), result.status
        except Exception as e:
            resp = make_response(400, f'Invalid base64 image: {str(e)}', None)
            return jsonify(resp.__dict__), resp.status
    else:
        result = FaceAttendanceManager.attendance(image_path)
        return jsonify(result.__dict__), result.status

@app.route('/cropped_faces', methods=['POST'])
def get_cropped_faces():
    try:
        data = request.json
        if not data or 'imageData' not in data:
            resp = make_response(400, 'Missing imageData in request body', None)
            return jsonify(resp.__dict__), resp.status
        base64_string = data['imageData']
        face_locations_result = ImageService.get_face_locations(base64_string)
        if not face_locations_result:
            resp = make_response(404, 'No faces detected in the image', None)
            return jsonify(resp.__dict__), resp.status
        face_image_base64 = ImageService.crop_and_save_face(base64_string, face_locations_result[0])
        if not face_image_base64:
            resp = make_response(500, 'Failed to process face image', None)
            return jsonify(resp.__dict__), resp.status
        resp = make_response(200, 'Successfully detected and cropped face', {
            'face_locations': face_locations_result,
            'face_image': face_image_base64
        })
        return jsonify(resp.__dict__), resp.status
    except Exception as e:
        print("Error in get_cropped_faces:", str(e))
        resp = make_response(500, str(e), None)
        return jsonify(resp.__dict__), resp.status


if __name__ == '__main__':
    app.run(host='0.0.0.0',port=5000,debug=True)
