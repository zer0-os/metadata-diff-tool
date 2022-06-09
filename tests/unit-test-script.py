import os

for x in range(1, 8):
    filepath = f"./tests/Test{x}/"
    os.system(
        f"yarn cli serve --f1={filepath}original.json --f2={filepath}modified.json --o={filepath}myout.json")
    os.system(
        f"diff {filepath}out.json {filepath}myout.json --strip-trailing-cr")
    print("")
