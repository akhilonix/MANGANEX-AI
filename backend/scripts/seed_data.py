from pathlib import Path
import csv, random
ROOT=Path(__file__).resolve().parents[1]/"data"; ROOT.mkdir(exist_ok=True); random.seed(42)
def write(name,fields,rows):
 with (ROOT/name).open("w",newline="",encoding="utf-8") as f:
  w=csv.DictWriter(f,fieldnames=fields); w.writeheader(); w.writerows(rows)
write("geology_training.csv",["latitude","longitude","manganese_grade","geological_score","terrain_score","label"],[{"latitude":20+random.random()*5,"longitude":75+random.random()*12,"manganese_grade":random.uniform(8,48),"geological_score":random.uniform(.35,.98),"terrain_score":random.uniform(.35,.95),"label":random.randint(0,1)} for _ in range(500)])
write("production_training.csv",["day","production","target","equipment_availability","rainfall","ore_availability"],[{"day":i,"production":random.uniform(7200,10200),"target":random.uniform(9000,10500),"equipment_availability":random.uniform(.55,.98),"rainfall":random.uniform(0,140),"ore_availability":random.uniform(.55,1)} for i in range(300)])
print("Synthetic training data written to",ROOT)
