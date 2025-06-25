# app.py - Main Flask Server

from flask import Flask, request, render_template_string, jsonify
from pptx import Presentation
import os
import requests

app = Flask(__name__)
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

AI_SERVICE_URL = "http://ai-service.local/analyze"  # Replace with your AI service endpoint

UPLOAD_FORM_HTML = """
<h2>Upload PowerPoint File</h2>
<form method="post" enctype="multipart/form-data">
  <input type="file" name="pptx_file">
  <input type="submit" value="Upload">
</form>
"""

@app.route('/', methods=['GET', 'POST'])
def upload_file():
    if request.method == 'POST':
        if 'pptx_file' not in request.files:
            return "No file part"

        file = request.files['pptx_file']
        if file.filename == '':
            return "No selected file"

        if file and file.filename.endswith('.pptx'):
            filepath = os.path.join(UPLOAD_FOLDER, file.filename)
            file.save(filepath)
            extracted_data = extract_pptx_data(filepath)
            os.remove(filepath)

            ai_response = send_to_ai(extracted_data)

            return jsonify({
                "status": "File processed and sent to AI",
                "ai_response": ai_response
            })

        return "Invalid file type. Please upload a .pptx file."

    return render_template_string(UPLOAD_FORM_HTML)

def extract_pptx_data(filepath):
    prs = Presentation(filepath)
    slide_data = []

    for idx, slide in enumerate(prs.slides, start=1):
        content = {"slide_number": idx, "texts": []}
        for shape in slide.shapes:
            if hasattr(shape, "text"):
                text = shape.text.strip()
                if text:
                    content["texts"].append(text)
        if content["texts"]:
            slide_data.append(content)

    return slide_data

def send_to_ai(extracted_data):
    try:
        response = requests.post(
            AI_SERVICE_URL,
            json={"presentation_data": extracted_data},
            timeout=15
        )
        return response.json() if response.ok else {"error": response.text}
    except requests.exceptions.RequestException as e:
        return {"error": str(e)}

if __name__ == '__main__':
    app.run(debug=True)


# ai_service_stub.py - Example AI Service Endpoint

from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.json
    presentation = data.get("presentation_data", [])
    visualization_results = run_ai_on(presentation)
    return jsonify({"visualization": visualization_results})

def run_ai_on(presentation):
    return f"Processed {len(presentation)} slides for visualization"

if __name__ == '__main__':
    app.run(debug=True, port=5001)
