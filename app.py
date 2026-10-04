import os
from flask import Flask, render_template, send_from_directory

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

app = Flask(__name__)

BUSINESS = {
    "name_en": "Maya Massage",
    "name_am": "ማያ ማሳጅ",
    "phone_display": "+251 90 152 9697",
    "phone_raw": "+251912345678",
    "whatsapp": "251901529697",
    "address_en": "Atelas Road, Addis Ababa, Ethiopia",
    "address_am": "አትላስ ፣ አዲስ አበባ፣ ኢትዮጵያ",
    "hours_en": "Mon–Sun · 24 Hour",
    "hours_am": "ሰኞ–እሁድ · 24 ሰአት",
    "map_query": "Atelas+Road+Addis+Ababa+Ethiopia",
}


@app.context_processor
def inject_business():
    return {"biz": BUSINESS}


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/images/<path:filename>")
def images(filename):
    return send_from_directory(os.path.join(BASE_DIR, "images"), filename)


if __name__ == "__main__":
    app.run(debug=True)
