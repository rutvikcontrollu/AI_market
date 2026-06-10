
from flask import Flask, jsonify, request
from flask_cors import CORS

from services.github_service import get_github_projects
from services.news_service import get_news_count

from groq import Groq
import os


app = Flask(__name__)
CORS(app)

# GROQ CLIENT
client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)


@app.route("/")
def home():
    return jsonify({
        "project": "InfraBeat",
        "status": "running",
        "version": "3.0 AI"
    })


@app.route("/analyze", methods=["POST"])
def analyze():

    data = request.get_json()

    keyword = data.get("keyword", "").strip()

    if not keyword:
        return jsonify({
            "error": "Keyword is required"
        }), 400

    # --------------------------
    # GitHub Analysis
    # --------------------------

    github_data = get_github_projects(keyword)

    project_count = github_data["count"]
    top_projects = github_data["projects"][:5]

    # --------------------------
    # News Analysis
    # --------------------------

    news_count = get_news_count(keyword)

    github_score = min(project_count // 100, 50)
    news_score = min(news_count, 50)

    demand_score = github_score + news_score

    total_stars = sum(
        project["stars"]
        for project in top_projects
    )

    if total_stars > 50000:
        competition_score = 90
    elif total_stars > 25000:
        competition_score = 70
    elif total_stars > 10000:
        competition_score = 50
    else:
        competition_score = 30

    opportunity_score = max(
        demand_score - competition_score,
        0
    )

    if opportunity_score >= 40:
        verdict = "EXCELLENT OPPORTUNITY"

    elif opportunity_score >= 20:
        verdict = "GOOD OPPORTUNITY"

    else:
        verdict = "HIGH COMPETITION"

    # --------------------------
    # GROQ AI REPORT
    # --------------------------

    prompt = f"""
You are a senior startup consultant and market analyst.

Analyze the following business category.

Keyword: {keyword}

Market Data:
- GitHub Projects: {project_count}
- News Articles: {news_count}
- Demand Score: {demand_score}/100
- Competition Score: {competition_score}/100
- Opportunity Score: {opportunity_score}/100

Instructions:
- Use simple business language.
- Avoid using words like "niche".
- Use "market", "business category", or "industry segment" instead.
- Keep explanations practical and easy to understand.
- Give realistic startup suggestions.
- Use proper headings and bullet points.

Generate the following sections:

## Market Summary
## Opportunity Analysis
## Target Audience
## Revenue Model
## Risks
## Startup Ideas (3)

Make the report professional and investor-friendly.
"""

    try:

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )

        ai_report = (
            response
            .choices[0]
            .message
            .content
        )

    except Exception as e:

        ai_report = (
            f"AI generation failed: {str(e)}"
        )

    return jsonify({
        "keyword": keyword,
        "github_projects": project_count,
        "news_articles": news_count,
        "demand_score": demand_score,
        "competition_score": competition_score,
        "opportunity_score": opportunity_score,
        "verdict": verdict,
        "ai_report": ai_report,
        "top_projects": top_projects
    })


import os

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
