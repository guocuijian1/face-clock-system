import os
from pymilvus import connections, FieldSchema, CollectionSchema, DataType, Collection, utility

class FaceDatabaseService:
    _instance = None

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def __init__(self):
        milvus_host = os.environ.get('MILVUS_HOST', 'milvus-database')
        milvus_port = os.environ.get('MILVUS_PORT', '19530')
        connections.connect(host=milvus_host, port=milvus_port)
        self.collection_name = 'face_collection'
        self.collection = None
        self._init_collection()

    def _init_collection(self):
        fields = [
            FieldSchema(name="id", dtype=DataType.INT64, is_primary=True, auto_id=True),
            FieldSchema(name="vector", dtype=DataType.FLOAT_VECTOR, dim=128),
            FieldSchema(name="name", dtype=DataType.VARCHAR, max_length=100),
            FieldSchema(name="job_id", dtype=DataType.VARCHAR, max_length=50)
        ]
        schema = CollectionSchema(fields, "人脸向量库")
        if self.collection_name not in utility.list_collections():
            self.collection = Collection(self.collection_name, schema)
            print(f"Created new collection: {self.collection_name}", flush=True)
        else:
            self.collection = Collection(self.collection_name)
            print(f"Loaded existing collection: {self.collection_name}", flush=True)
        # Create index for vector field if not exists
        index_params = {
            "index_type": "IVF_FLAT",
            "metric_type": "L2",
            "params": {"nlist": 128}
        }
        if not self.collection.has_index():
            self.collection.create_index(field_name="vector", index_params=index_params)
            print(f"Created index for collection: {self.collection_name}", flush=True)
        else:
            print(f"Index already exists for collection: {self.collection_name}", flush=True)

    def save_face_image(self, face_vector, name, job_id):
        print(f"Saving face image for name={name}, job_id={job_id}", flush=True)
        data = [[face_vector], [name], [job_id]]
        self.collection.insert(data)
        print(f"Inserted face image for name={name}, job_id={job_id}", flush=True)
        return True, "保存成功"

    def query_face_by_image(self, face_vector, top_k=1):
        print(f"Querying face by image, top_k={top_k}", flush=True)
        if hasattr(face_vector, 'tolist'):
            face_vector = face_vector.tolist()
        self.collection.load()
        print(f"Collection loaded: {self.collection_name}", flush=True)
        results = self.collection.search([face_vector], "vector", param={"metric_type": "L2"}, limit=top_k)
        print(f"Search results: {results}", flush=True)
        enriched_results = []
        for result in results:
            ids = result.ids
            distances = result.distances
            print(f"Result ids: {ids}, distances: {distances}", flush=True)
            if ids:
                expr = f"id in [{', '.join(str(i) for i in ids)}]"
                res = self.collection.query(expr, output_fields=["name", "job_id"])
                print(f"Metadata query result: {res}", flush=True)
                enriched_results.append({
                    "ids": ids,
                    "distances": distances,
                    "metadata": res
                })
            else:
                enriched_results.append({
                    "ids": [],
                    "distances": [],
                    "metadata": []
                })
        print(f"Enriched results: {enriched_results}", flush=True)
        return enriched_results, "查询完成"
