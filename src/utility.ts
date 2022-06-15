import "dotenv/config";
import * as env from "env-var";

export const delay = async (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

// returns [DB_CONN_STRING, DB_NAME, DB_COLLECTION_NAME]
export const getDatabaseEnvVars = () => {
  const dbName = env.get("DB_NAME").required().asString();
  const dbConnectionString = env.get("DB_CONN_STRING").required().asString();
  const dbCollectionName = env.get("DB_COLLECTION_NAME").required().asString();

  const vars = {
    connection: dbConnectionString,
    name: dbName,
    collection: dbCollectionName,
  };

  return vars;
};

export const getIpfsEnvGateway = () => {
  const gatewayPrefix = env.get("ipfsGatewayUrlPrefix").required().asString();
  return gatewayPrefix;
};
