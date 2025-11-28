# Resume Parser NER Microservice

Named Entity Recognition (NER) microservice for resume parsing using spaCy.

## Setup

### Prerequisites
- Python 3.8+
- pip

### Installation

1. **Create virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Download spaCy model:**
   ```bash
   python -m spacy download en_core_web_trf
   ```

   Or fallback model (if transformer model is too large):
   ```bash
   python -m spacy download en_core_web_sm
   ```

### Running the Service

```bash
python app.py
```

The service will start on `http://localhost:5000`

## API Endpoints

### POST /ner
Extract entities from resume text

**Request:**
```json
{
  "text": "John Doe worked at Google from 2020 to 2023..."
}
```

**Response:**
```json
{
  "entities": [
    {
      "label": "PERSON",
      "text": "John Doe",
      "start": 0,
      "end": 8,
      "confidence": 0.95
    },
    {
      "label": "ORG",
      "text": "Google",
      "start": 26,
      "end": 32,
      "confidence": 0.92
    }
  ]
}
```

### POST /batch
Batch process multiple texts

**Request:**
```json
{
  "texts": ["text1", "text2", "text3"]
}
```

**Response:**
```json
{
  "results": [
    { "entities": [...] },
    { "entities": [...] },
    { "entities": [...] }
  ]
}
```

### GET /health
Health check

**Response:**
```json
{
  "status": "OK",
  "service": "resume-parser-ner"
}
```

### GET /models
Get loaded model information

**Response:**
```json
{
  "models": [
    {
      "name": "en_core_web_trf",
      "version": "3.7.0",
      "components": ["tok2vec", "morphologizer", "parser", "ner"]
    }
  ]
}
```

## Entity Labels

Common spaCy NER labels:
- `PERSON` - Person names
- `ORG` - Organization names
- `GPE` - Geopolitical entities (countries, cities)
- `DATE` - Dates and times
- `PRODUCT` - Products and projects
- `EVENT` - Events
- `WORK_OF_ART` - Works of art
- `LAW` - Laws
- `LANGUAGE` - Languages
- `FAC` - Facilities

## Configuration

Set environment variables:
```bash
export FLASK_ENV=production
export FLASK_DEBUG=0
```

## Deployment

### Docker

```bash
docker build -t resume-ner .
docker run -p 5000:5000 resume-ner
```

### AWS Lambda / Serverless

This service can be adapted for serverless deployment using:
- AWS Lambda with Flask
- Google Cloud Functions
- Azure Functions

## Performance

- **Model**: en_core_web_trf (transformer-based, accurate)
- **Fallback**: en_core_web_sm (smaller, faster)
- **Processing time**: ~100-500ms per resume

## Troubleshooting

### spaCy model download issues
```bash
python -m spacy download en_core_web_sm
```

### Flask connection issues
Ensure the Node.js parser service is configured to use the correct `NER_SERVICE_URL`:
```bash
export NER_SERVICE_URL=http://localhost:5000
```

### Memory issues
Use the smaller model:
```bash
python -m spacy download en_core_web_sm
```
Then update the app.py to load `en_core_web_sm` by default.

## Development

Enable debug mode:
```bash
export FLASK_ENV=development
export FLASK_DEBUG=1
python app.py
```

## Integration with Node.js Parser

The Node.js parser service communicates with this NER service via HTTP POST requests.

Default configuration:
- URL: `http://localhost:5000`
- Timeout: 30 seconds

To change the NER service URL in the Node.js app:
```bash
export NER_SERVICE_URL=http://your-ner-service:5000
```

## License

ISC
