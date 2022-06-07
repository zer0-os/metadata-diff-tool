import os

for x in range(1, 9):
    filepath = f"./data/Tests/Test{x}/"
    os.system(
        f"yarn cli serve --f1={filepath}original.json --f2={filepath}modified.json --o={filepath}myout.json -v")
    os.system(
        f"diff {filepath}out.json {filepath}myout.json --strip-trailing-cr")
    print("")
