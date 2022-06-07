import os
import sys


for x in range(1, 9):
    filepath = f"./tests/Test{x}/"
    verbose = ""

    if len(sys.argv) == 2 and sys.argv[1] == "-v":
        verbose = sys.argv[1]

    os.system(
        f"yarn cli serve --f1={filepath}original.json --f2={filepath}modified.json --o={filepath}myout.json {verbose}")
    os.system(
        f"diff {filepath}out.json {filepath}myout.json --strip-trailing-cr")
    print("")
