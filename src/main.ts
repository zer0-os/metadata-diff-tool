import "dotenv/config";
import * as fs from "fs";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { compareNftFiles, compareNftFileToDatabase } from "./comparers";
import { updateDatabase } from "./databaseAccess";
import { Logger, Maybe, NftBatchDiff } from "./types";

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

const getDiffAndWriteToFile = async (
  originalFile: Maybe<string>,
  changedFile: string,
  outFile: Maybe<string>,
  logger: Logger
) => {
  try {
    await updateDatabase(
      JSON.parse(fs.readFileSync("./data/nfts.json").toString())
    );
    if (!originalFile) {
      const diff = await compareNftFileToDatabase(changedFile, logger);
      writeDiffToFile(diff, outFile, logger);
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
