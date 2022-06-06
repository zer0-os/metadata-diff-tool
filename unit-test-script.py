import os

for x in range(1, 8):
    filepath = f"./data/Tests/Test{x}/"
    os.system(
        f'"yarn cli serve --f1={filepath}original.json --f2={filepath}modified.json --o={filepath}unit-diff.json"')
    os.system(
        f'"diff {filepath}unit-diff.json {filepath}diff.json --strip-trailing-cr"')
