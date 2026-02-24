import pandas as pd

files = ["cs1.csv", "cs2.csv", "cs3.csv", "cs4.csv"]

df = pd.concat([pd.read_csv(f) for f in files])

df.to_csv("merged.csv", index=False)
