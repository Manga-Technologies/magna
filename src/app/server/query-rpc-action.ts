import Server from "@stellar/stellar-sdk";

const server = new Server("https://horizon.stellar.org");

const assetCode = "";
const issuer = "REPLACE WITH ACTUAL ISSUER KEY";

export function fetchTransactionList() {

    



    

}

// uses trustline count to get total number of leaderboard participants
// queries horizon endpoint
export async function getTrustLineAccounts() {

    const response = await server.assets()
        .forCode(assetCode)
        .forIssuer(issuer)
        .call();

    const assetRecord = response[0];

    if (!assetRecord) {
        throw new Error("Asset not found on network...");
    }

    return assetRecord.num_accounts;
}

function getAccounts() {
    return server.accounts().limit(200).call();
}