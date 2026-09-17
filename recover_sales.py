import json
import re

transcript_path = r"C:\Users\wartw\.gemini\antigravity\brain\c3a45aa3-443b-4d26-afe2-930c8d4c0f2a\.system_generated\logs\transcript_full.jsonl"
target_file = r"d:\projects\systems\stock-management-system\stock-management-system-frontend\src\pages\Sales.jsx"

lines = []
with open(transcript_path, 'r', encoding='utf-8') as f:
    for row in f:
        data = json.loads(row)
        if data.get("type") == "TOOL_RESPONSE" and "view_file" in data.get("content", "") and "Sales.jsx" in data.get("content", ""):
            content = data["content"]
            # Extract lines starting with digits and colon
            matches = re.findall(r'^(\d+): (.*)$', content, re.MULTILINE)
            for num, text in matches:
                idx = int(num) - 1
                while len(lines) <= idx:
                    lines.append("")
                lines[idx] = text

with open(target_file, 'w', encoding='utf-8') as f:
    f.write("\n".join(lines))
    f.write("\n")
