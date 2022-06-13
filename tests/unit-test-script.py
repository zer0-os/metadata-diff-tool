import os
import sys


for x in range(1, 9):
    filepath = f"./tests/Test{x}/"
    verbose = ""
    originalFileCommand = ""
    modifiedFile = f"{filepath}modified.json"

    if "-v" in sys.argv:
        verbose = "-v"
    if "-of" in sys.argv:
        originalFileCommand = f"--of={filepath}original.json"

    os.system(
        f"yarn cli serve {originalFileCommand} --mf={modifiedFile} --o={filepath}myout.json {verbose}")
    os.system(
        f"diff {filepath}out.json {filepath}myout.json --strip-trailing-cr")
    print("")
