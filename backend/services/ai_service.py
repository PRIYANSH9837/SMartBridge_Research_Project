import os
import json
from typing import List, Dict
from groq import Groq
from config import settings

groq_client = Groq(api_key=settings.GROQ_API_KEY)


def generate_summaries(texts: List[str], titles: List[str]) -> str:
    papers_block = []

    for i in range(len(texts)):
        block = (
            f"Paper {i+1}: {titles[i]}\n"
            f"Abstract/Text: {texts[i][:1000]}..."
        )
        papers_block.append(block)

    combined_papers = "\n\n".join(papers_block)

    prompt = f"""Please provide concise summaries of the following research papers:

{combined_papers}

Please provide a well-structured summary for each paper, highlighting the key contributions, methods, and findings.
"""

    try:
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are a research assistant specializing in summarizing academic papers."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=2000
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Error generating summary: {str(e)}"


def extract_insights(texts: List[str], titles: List[str]) -> str:
    papers_block = []

    for i in range(len(texts)):
        block = (
            f"Paper {i+1}: {titles[i]}\n"
            f"Abstract/Text: {texts[i][:1000]}..."
        )
        papers_block.append(block)

    combined_papers = "\n\n".join(papers_block)

    prompt = f"""Extract the most important insights and trends from the following research papers:

{combined_papers}

Please identify:
1. Key findings and contributions
2. Common themes across papers
3. Novel methodologies or approaches
4. Limitations and future directions
5. Potential applications
"""

    try:
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are a research analyst extracting key insights from academic literature."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.4,
            max_tokens=2500
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Error extracting insights: {str(e)}"


def generate_literature_review(paper_data: List[Dict]) -> str:
    papers_block = []

    for i, paper in enumerate(paper_data):
        block = (
            f"Paper {i+1}: {paper['title']}\n"
            f"Authors: {', '.join(paper['authors'])}\n"
            f"Year: {paper.get('year', 'N/A')}\n"
            f"Abstract: {paper.get('abstract', 'N/A')}\n"
            f"Key Content: {paper.get('text', '')[:1500]}...\n"
        )
        papers_block.append(block)

    papers_text = "\n\n".join(papers_block)

    prompt = f"""Write a comprehensive literature review based on the following research papers:

{papers_text}

The literature review should include:
1. Introduction to the research area
2. Thematic organization of the papers
3. Synthesis of key findings and their relationships
4. Identification of research gaps and controversies
5. Conclusion with future research directions

Write in formal academic style with proper transitions between sections.
"""

    try:
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are an academic researcher writing a comprehensive literature review."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=3000
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Error generating literature review: {str(e)}"