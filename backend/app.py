from http.cookiejar import debug

from flask import Flask, request, jsonify
from face_attendance_system import register_face, attendance
from image_service import ImageService
import os
import tempfile
import base64

from flask_cors import CORS

app = Flask(__name__)
CORS(app)
image_service = ImageService()


@app.route('/register', methods=['POST'])
def api_register():
    tmp_path = None
    name = request.form.get('name')
    job_id = request.form.get('job_id')
    if not all([name, job_id]):
        return jsonify({'error': 'Missing required parameters'}), 400
    if 'image_path' in request.files:
        image_file = request.files['image_path']
        with tempfile.NamedTemporaryFile(delete=False, suffix='.png') as tmp:
            image_file.save(tmp.name)
            tmp_path = tmp.name
    if not tmp_path:
        return jsonify({'error': 'Missing image file'}), 400
    try:
        result, status = register_face(tmp_path, name, job_id, tmp_path)
        return jsonify(result), status
    finally:
        if tmp_path and os.path.exists(tmp_path):
            os.remove(tmp_path)

@app.route('/attend', methods=['POST'])
def api_attend():
        image_path = request.form.get('image_path')
        if not image_path:
            return jsonify({'error': 'Missing image'}), 400
        # Detect if image_path is a base64 string (very long, contains only base64 chars)
        if len(image_path) > 100 and all(c.isalnum() or c in '+/=' for c in image_path):
            import base64
            import tempfile
            import os
            try:
                image_data = base64.b64decode(image_path)
                with tempfile.NamedTemporaryFile(delete=False, suffix='.png') as tmp:
                    tmp.write(image_data)
                    tmp_path = tmp.name
                result, status = attendance(tmp_path)
                os.remove(tmp_path)
                return jsonify(result), status
            except Exception as e:
                return jsonify({'error': f'Invalid base64 image: {str(e)}'}), 400
        else:
            result, status = attendance(image_path)
            return jsonify(result), status

@app.route('/cropped_faces', methods=['POST'])
def get_cropped_faces():
    try:
        data = request.json
        if not data or 'imageData' not in data:
            return jsonify({
                'status': 400,
                'message': 'Missing imageData in request body',
                'data': None
            }), 400
        #The below code is for test purpose only, you can replace it with the above code to read image from request
        """
        current_dir = os.path.dirname(os.path.abspath(__file__))
        image_path = f"{current_dir}/tests/resources/man.png"
        with open(image_path, 'rb') as image_file:
            image_data = image_file.read()
            base64_string = base64.b64encode(image_data).decode('utf-8')
        """

        base64_string = data['imageData']

        # 使用ImageService检测人脸位置
        face_locations_result = ImageService._get_face_locations(base64_string)
        if not face_locations_result:
            return jsonify({
                'status': 404,
                'message': 'No faces detected in the image',
                'data': None
            }), 404

        # 使用ImageService裁剪人脸
        face_image_base64 = ImageService._crop_and_save_face(base64_string, face_locations_result[0])
        if not face_image_base64:
            return jsonify({
                'status': 500,
                'message': 'Failed to process face image',
                'data': None
            }), 500

        return jsonify({
            'status': 200,
            'data': {
                'face_locations': face_locations_result,
                'face_image': face_image_base64
            },
            'message': 'Successfully detected and cropped face'
        }), 200

    except Exception as e:
        print("Error in get_cropped_faces:", str(e))
        return jsonify({
            'status': 500,
            'message': str(e),
            'data': None
        }), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0',port=5000,debug=True)
