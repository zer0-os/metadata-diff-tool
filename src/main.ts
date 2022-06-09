import { compareNftFiles } from "./compareNfts";
import yargs, { nargs } from "yargs";
import { hideBin } from "yargs/helpers";
import * as fs from "fs";

const writeDiffToFile = (
  file1: string,
  file2: string,
  outFile: string | undefined
) => {
  try {
    const diff = compareNftFiles(file1, file2);

    if (outFile === undefined) {
      console.log(diff);
    } else {
      fs.writeFileSync(outFile, JSON.stringify(diff, null, 2));
    }
  } catch (e) {
    if (outFile !== undefined) {
      fs.writeFileSync(outFile, JSON.stringify(e, null, 2));
    }
  }
};

yargs(hideBin(process.argv))
  .command(
    "serve [user] [interval]",
    "Get time based groups for a user",
    (yargs) => {
      return yargs
        .option("file1", {
          demandOption: true,
          alias: "f1",
          type: "string",
          describe: "The file with the existing data",
        })
        .option("file2", {
          demandOption: true,
          alias: "f2",
          type: "string",
          describe: "the file that has the changes you want",
        })
        .option("outputFile", {
          alias: "o",
          type: "string",
          describe: "the file to write the diff to",
        });
    },
    (argv) => {
      if (argv.verbose) console.info(`start server on :${argv.user}`);

      writeDiffToFile(argv.file1, argv.file2, argv.outputFile);
      // write to file here
    }
  )
  .option("verbose", {
    alias: "v",
    type: "boolean",
    description: "Run with verbose logging",
  })
  .parse();
