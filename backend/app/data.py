from pathlib import Path
import json
DATA=json.loads((Path(__file__).resolve().parents[1]/"data/demo_data.json").read_text(encoding="utf-8"))
