"""
Resume Parser NER Microservice
==============================

Flask application that provides Named Entity Recognition (NER)
for resume text using spaCy.

Endpoints:
- POST /ner - Extract entities from resume text
- GET /health - Health check
"""

from flask import Flask, request, jsonify
import spacy
import logging
from typing import List, Dict, Any

# Initialize Flask app
app = Flask(__name__)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] %(levelname)s: %(message)s'
)
logger = logging.getLogger(__name__)

# Load spaCy model
try:
    nlp = spacy.load("en_core_web_trf")
    logger.info("✓ spaCy model loaded: en_core_web_trf")
except OSError:
    logger.warning("⚠ en_core_web_trf not found, falling back to en_core_web_sm")
    nlp = spacy.load("en_core_web_sm")
    logger.info("✓ spaCy model loaded: en_core_web_sm")


@app.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "OK", "service": "resume-parser-ner"}), 200


@app.route("/ner", methods=["POST"])
def extract_entities():
    """
    Extract named entities from resume text

    Request body:
    {
        "text": "Resume text content..."
    }

    Response:
    {
        "entities": [
            {
                "label": "PERSON",
                "text": "John Doe",
                "start": 0,
                "end": 8,
                "confidence": 0.95
            },
            ...
        ]
    }
    """
    try:
        data = request.get_json()

        if not data or "text" not in data:
            return jsonify({"error": "Missing 'text' field in request"}), 400

        text = data["text"]

        if not isinstance(text, str) or len(text) == 0:
            return jsonify({"error": "Text must be non-empty string"}), 400

        # Limit text size for performance
        if len(text) > 100000:
            text = text[:100000]
            logger.warning("Text truncated to 100000 characters")

        logger.info(f"Processing text: {len(text)} characters")

        # Process text with spaCy
        doc = nlp(text)

        # Extract entities
        entities = []
        for ent in doc.ents:
            entity = {
                "label": ent.label_,
                "text": ent.text,
                "start": ent.start_char,
                "end": ent.end_char,
                "confidence": getattr(ent, "confidence", 0.85),  # Default confidence
            }
            entities.append(entity)

        logger.info(f"Extracted {len(entities)} entities")

        return (
            jsonify({"entities": entities}),
            200,
        )

    except Exception as e:
        logger.error(f"Error processing NER request: {str(e)}")
        return (
            jsonify({"error": f"Internal server error: {str(e)}"}),
            500,
        )


@app.route("/batch", methods=["POST"])
def batch_extract():
    """
    Batch extract entities from multiple texts

    Request body:
    {
        "texts": ["text1", "text2", ...]
    }

    Response:
    {
        "results": [
            {"entities": [...]},
            ...
        ]
    }
    """
    try:
        data = request.get_json()

        if not data or "texts" not in data:
            return jsonify({"error": "Missing 'texts' field in request"}), 400

        texts = data["texts"]

        if not isinstance(texts, list):
            return jsonify({"error": "Texts must be a list"}), 400

        logger.info(f"Processing batch of {len(texts)} texts")

        results = []
        for text in texts:
            if not isinstance(text, str) or len(text) == 0:
                results.append({"entities": []})
                continue

            # Limit text size
            if len(text) > 100000:
                text = text[:100000]

            doc = nlp(text)
            entities = [
                {
                    "label": ent.label_,
                    "text": ent.text,
                    "start": ent.start_char,
                    "end": ent.end_char,
                    "confidence": 0.85,
                }
                for ent in doc.ents
            ]
            results.append({"entities": entities})

        logger.info(f"Batch processing complete: {sum(len(r['entities']) for r in results)} entities")

        return jsonify({"results": results}), 200

    except Exception as e:
        logger.error(f"Error processing batch request: {str(e)}")
        return (
            jsonify({"error": f"Internal server error: {str(e)}"}),
            500,
        )


@app.route("/models", methods=["GET"])
def get_models():
    """Get information about loaded models"""
    return (
        jsonify(
            {
                "models": [
                    {
                        "name": nlp.meta["name"],
                        "version": nlp.meta["version"],
                        "components": list(nlp.pipe_names),
                    }
                ]
            }
        ),
        200,
    )


if __name__ == "__main__":
    logger.info("Starting Resume Parser NER Service...")
    logger.info("Service running on http://0.0.0.0:5000")
    app.run(host="0.0.0.0", port=5000, debug=False)
