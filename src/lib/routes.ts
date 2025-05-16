import Server from "@stellar/stellar-sdk";

const STELLAR_URL = "https://horizon.stellar.org";
const server = new Server(STELLAR_URL);

export async function fetchAssetInfo(assetCode: string, issuer: string) {
  return await server.assets()
    .forCode(assetCode)
    .forIssuer(issuer)
    .call();
}

