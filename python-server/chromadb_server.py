from flask import Flask, request, jsonify
import chromadb
import uuid

app = Flask(__name__)





client = chromadb.HttpClient(host="chromadb", port=8000)


COLLECTION_NAME = "document_embeddings"  

try:
    collection = client.get_or_create_collection(
        name=COLLECTION_NAME,
        metadata={"hnsw:space": "cosine"}  
    )
except Exception as e:
    print(f"Failed to initialize collection: {str(e)}")
    raise

@app.route("/api/save-embedding", methods=["POST"])
def save_embedding():
    """Save embedding to ChromaDB with document text and metadata"""
    data = request.json
    if not data:
        return jsonify({"error": "No JSON data provided"}), 400

    try:
       
        if "embedding" not in data:
            return jsonify({"error": "Missing 'embedding' field"}), 400
            
        embedding = data["embedding"]
        if not isinstance(embedding, list) or len(embedding) == 0:
            return jsonify({"error": "Embedding must be a non-empty array"}), 400

        
        metadata = {
            "email": data.get("email", "unknown"),
            "source": data.get("source", "pdf"),
            "title": data.get("title", "untitled"), 
            "chunk_id": str(uuid.uuid4())
        }

      
        collection.add(
            embeddings=[embedding],
            documents=[data.get("text", "")],
            ids=[metadata["chunk_id"]],
            metadatas=[metadata]
        )

        return jsonify({
            "message": "Embedding saved successfully",
            "collection": COLLECTION_NAME,
            "chunk_id": metadata["chunk_id"]
        }), 200

    except Exception as e:
        return jsonify({"error": f"Failed to save embedding: {str(e)}"}), 500
    









    

@app.route("/api/search", methods=["POST"])
def search_embedding():
    data = request.json
    if not data:
        return jsonify({"error": "No JSON data provided"}), 400

    try:
        if "embedding" not in data:
            return jsonify({"error": "Missing 'embedding' field"}), 400
            
        query_embedding = data["embedding"]
        if not isinstance(query_embedding, list):
            return jsonify({"error": "Embedding must be an array"}), 400

        filters = []

        if "email" in data:
            filters.append({"email": data["email"]})
        if "source" in data:
            filters.append({"source": data["source"]})
        if "title" in data:
            title_filter = data["title"] 
            filters.append({"title": title_filter})

        where_filter = None
        if len(filters) == 1:
            where_filter = filters[0]
        elif len(filters) > 1:
            where_filter = {"$and": filters}

        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=data.get("top_k", 3),
            where=where_filter
        )

        response = {
            "matches": results["documents"][0] if results["documents"] else [],
            "distances": results["distances"][0] if results["distances"] else [],
            "ids": results["ids"][0] if results["ids"] else []
        }

        return jsonify(response), 200

    except Exception as e:
        return jsonify({"error": f"Search failed: {str(e)}"}), 500










@app.route("/api/getAll", methods=["POST"])
def search_documents_by_metadata():
    data = request.json
    if not data:
        return jsonify({"error": "No JSON data provided"}), 400

    try:
        filters = []

        if "email" in data:
            filters.append({"email": data["email"]})
        else:
            return jsonify({"error": "Missing 'email' field"}), 400

        if "title" in data:
            filters.append({"title": data["title"]})
        else:
            return jsonify({"error": "Missing 'title' field"}), 400

        where_filter = {"$and": filters}

        # Query with only metadata filter, no embeddings
        results = collection.get(where=where_filter)

        response = {
            "matches": results.get("documents", []),
            "ids": results.get("ids", [])
        }

        return jsonify(response), 200

    except Exception as e:
        return jsonify({"error": f"Search failed: {str(e)}"}), 500







@app.route("/api/get-titles", methods=["POST"])
def get_titles():

    data = request.json
    if not data or "email" not in data:
        return jsonify({"error": "Missing 'email' in request"}), 400

    try:
        email = data["email"]

        # Fetch all metadata entries for the given email
        results = collection.get(
            where={"email": email},
            include=["metadatas"]
        )

        # Extract and deduplicate titles
        titles = set()
        for metadata in results.get("metadatas", []):
            title = metadata.get("title")
            if title:
                titles.add(title)

        return jsonify({"titles": list(titles)}), 200

    except Exception as e:
        return jsonify({"error": f"Failed to get titles: {str(e)}"}), 500








@app.route("/api/delete", methods=["POST"])
def delete_by_email_and_title():
    data = request.json
    if not data or "email" not in data or "title" not in data:
        return jsonify({"error": "Missing 'email' or 'title' in request"}), 400

    try:
        email = data["email"]
        title = data["title"]

        # Use $and for filtering
        where_filter = {
            "$and": [
                {"email": email},
                {"title": title}
            ]
        }

        # ✅ Don't include "ids" — it's returned by default
        results = collection.get(
            where=where_filter,
            include=["metadatas"]  # optional
        )

        ids_to_delete = results.get("ids", [])
        if not ids_to_delete:
            return jsonify({"message": "No documents found to delete"}), 404

        collection.delete(ids=ids_to_delete)

        return jsonify({
            "message": f"Deleted {len(ids_to_delete)} document(s)",
            "deleted_ids": ids_to_delete
        }), 200

    except Exception as e:
        return jsonify({"error": f"Failed to delete documents: {str(e)}"}), 500







if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)

