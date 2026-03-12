import httpx
import xml.etree.ElementTree as ET
from datetime import datetime
from typing import List, Dict
import urllib.parse

async def search_arxiv(params) -> List[Dict]:
    base_url = "http://export.arxiv.org/api/query"
    
    query_parts = []
    if params.query:
        query_parts.append(f"all:{urllib.parse.quote(params.query)}")
    if params.author:
        query_parts.append(f"au:{urllib.parse.quote(params.author)}")
    
    query_string = "+AND+".join(query_parts) if query_parts else "all:*"
    
    if params.year_from or params.year_to:
        date_range = []
        if params.year_from:
            date_range.append(f"from:{params.year_from}")
        if params.year_to:
            date_range.append(f"to:{params.year_to}")
        if date_range:
            query_string += f"+AND+submittedDate:[{'+'.join(date_range)}]"
    
    params_dict = {
        "search_query": query_string,
        "start": 0,
        "max_results": min(params.max_results, 50),
        "sortBy": "submittedDate",
        "sortOrder": "descending"
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.get(base_url, params=params_dict)
        
    if response.status_code != 200:
        return []
    
    root = ET.fromstring(response.text)
    ns = {"atom": "http://www.w3.org/2005/Atom"}
    
    results = []
    for entry in root.findall("atom:entry", ns):
        title = entry.find("atom:title", ns).text.strip()
        summary = entry.find("atom:summary", ns).text.strip()
        
        
        authors = []
        for author in entry.findall("atom:author", ns):
            name = author.find("atom:name", ns).text
            authors.append(name)
        
        
        published = entry.find("atom:published", ns).text[:10]
        
       
        links = {}
        for link in entry.findall("atom:link", ns):
            if link.get("title") == "pdf":
                links["pdf"] = link.get("href")
            elif link.get("rel") == "alternate":
                links["abstract"] = link.get("href")
        
        results.append({
            "title": title,
            "authors": authors,
            "abstract": summary[:500] + "...",
            "source": "arXiv",
            "url": links.get("abstract", ""),
            "pdf_url": links.get("pdf", ""),
            "date": published,
            "citations": 0, 
            "tags": ["arXiv"]
        })
    
    return results

async def search_crossref(params) -> List[Dict]:
    
    base_url = "https://api.crossref.org/works"
    
    query_params = {
        "query": params.query,
        "rows": min(params.max_results, 50),
        "sort": "published",
        "order": "desc"
    }
    
    if params.author:
        query_params["query.author"] = params.author
    
    if params.year_from or params.year_to:
        if params.year_from:
            query_params["filter"] = f"from-pub-date:{params.year_from}"
        if params.year_to:
            query_params["filter"] = f"until-pub-date:{params.year_to}"
    
    async with httpx.AsyncClient() as client:
        response = await client.get(base_url, params=query_params)
        
    if response.status_code != 200:
        return []
    
    data = response.json()
    results = []
    
    for item in data.get("message", {}).get("items", []):
        title = item.get("title", ["Untitled"])[0]
        
        
        authors = []
        for author in item.get("author", []):
            name = f"{author.get('given', '')} {author.get('family', '')}".strip()
            if name:
                authors.append(name)
        
        
        published = item.get("published", {}).get("date-parts", [[None]])[0]
        if published[0]:
            date_str = f"{published[0]}-{published[1] if len(published) > 1 else '01'}-{published[2] if len(published) > 2 else '01'}"
        else:
            date_str = "2025-01-01"
        
       
        doi = item.get("DOI", "")
        url = f"https://doi.org/{doi}" if doi else ""
        
        results.append({
            "title": title,
            "authors": authors,
            "abstract": item.get("abstract", "No abstract available.")[:500] + "...",
            "source": item.get("container-title", ["Unknown"])[0],
            "url": url,
            "doi": doi,
            "date": date_str,
            "citations": item.get("is-referenced-by-count", 0),
            "tags": ["Crossref"]
        })
    
    return results