from pymilvus import connections, FieldSchema, CollectionSchema, DataType, Collection, utility

class FaceDatabaseService:
    _instance = None
    @classmethod
    def get_instance(cls, host='milvus-database', port='19530'):
        if cls._instance is None:
            cls._instance = cls(host,port)
        return cls._instance

    def __init__(self, host='localhost', port='19530'):
        connections.connect(host=host, port=port)
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
        else:
            self.collection = Collection(self.collection_name)
        # Create index for vector field if not exists
        index_params = {
            "index_type": "IVF_FLAT",
            "metric_type": "L2",
            "params": {"nlist": 128}
        }
        if not self.collection.has_index():
            self.collection.create_index(field_name="vector", index_params=index_params)

    def save_face_image(self, face_vector, name, job_id):
        data = [[face_vector], [name], [job_id]]
        self.collection.insert(data)
        return True, "保存成功"

    def query_face_by_image(self, face_vector, top_k=1):
        if hasattr(face_vector, 'tolist'):
            face_vector = face_vector.tolist()
        self.collection.load()
        results = self.collection.search([face_vector], "vector", param={"metric_type": "L2"}, limit=top_k)
        enriched_results = []
        for result in results:
            ids = result.ids
            distances = result.distances
            if ids:
                # Query metadata for each id
                expr = f"id in [{', '.join(str(i) for i in ids)}]"
                res = self.collection.query(expr, output_fields=["name", "job_id"])
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
        return enriched_results, "查询完成"
