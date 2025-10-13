import unittest
from unittest.mock import patch
from milvus_service import FaceDatabaseService

class TestFaceDatabaseService(unittest.TestCase):
    @patch('milvus_service.Collection')
    def test_save_face_success(self, mock_collection):
        # 测试：保存人脸向量、姓名和工号到 Milvus 数据库，返回成功。
        face_vector = [0.1] * 128
        name = 'Alice'
        job_id = 'job1'
        mock_collection.return_value.insert.return_value = None
        service = FaceDatabaseService()
        result, msg = service.save_face_image(face_vector, name, job_id)
        self.assertTrue(result)
        self.assertEqual(msg, '保存成功')

    @patch('milvus_service.Collection')
    def test_query_face_by_image_success(self, mock_collection):
        # 测试：通过人脸向量查询 Milvus 数据库，返回结果。
        face_vector = [0.2] * 128
        mock_collection.return_value.search.return_value = ['result']
        service = FaceDatabaseService()
        results, msg = service.query_face_by_image(face_vector)
        self.assertEqual(results, ['result'])
        self.assertEqual(msg, '查询完成')

if __name__ == '__main__':
    unittest.main()
