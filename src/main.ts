import { compareNftFiles, compareNftFileToDatabase } from "./compareNfts";
import yargs, { nargs } from "yargs";
import { hideBin } from "yargs/helpers";
import * as fs from "fs";
import { Logger, Maybe, NftBatchDiff } from "./types";
import "dotenv/config";
import { getNftArrayFromDatabase } from "./databaseAccess";

const writeDiffToFile = (
  diff: NftBatchDiff,
  outFile: Maybe<string>,
  logger: Logger
) => {
  if (outFile === undefined) {
    logger("Writing diff to logger");
    logger(diff);
  } else {
    logger(`Writing diff to [${outFile}]`);
    fs.writeFileSync(outFile, JSON.stringify(diff, null, 2));
  }
};

const getDiffAndWriteToFile = (
  originalFile: Maybe<string>,
  changedFile: string,
  outFile: Maybe<string>,
  logger: Logger
) => {
  try {
    if (!originalFile) {
      const diffPromise = compareNftFileToDatabase(changedFile, logger);

      diffPromise.then((diff) => {
        writeDiffToFile(diff, outFile, logger);
      });
    } else {
      const diff = compareNftFiles(originalFile, changedFile, logger);
      writeDiffToFile(diff, outFile, logger);
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
        .option("originalFile", {
          demandOption: false,
          alias: "of",
          type: "string",
          describe: "The file with the existing data",
        })
        .option("modifiedFile", {
          demandOption: true,
          alias: "mf",
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
      getDiffAndWriteToFile(
        argv.originalFile,
        argv.modifiedFile,
        argv.outputFile,
        argv.verbose ? console.debug : (message, ...optional): void => {}
      );
      // write to file here
    }
  )
  .option("verbose", {
    alias: "v",
    type: "boolean",
    description: "Run with verbose logging",
  })
  .parse();

const test = getNftArrayFromDatabase(
  [
    { domain: "Test", id: "0xFF" },
    { domain: "TestInsert", id: "TestId" },
  ],
  console.debug
);

test.finally(() => {
  console.log(test);
});
