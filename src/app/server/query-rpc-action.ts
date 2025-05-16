import Server from "@stellar/stellar-sdk";

const server = new Server("https://horizon.stellar.org");

const assetCode = "";
const issuer = "REPLACE WITH ACTUAL ISSUER KEY";

export function fetchTransactionList() {





    

}

// uses trustline count to get total number of leaderboard participants
// queries horizon endpoint
export async function getTrustLineAccounts() {

    const response = await fetch(`/api/fetch-tl-acc?assetCode=${assetCode}&issuer=${issuer}`);
    const data = await response.json()
    const assetRecord = data._embedded?.records?.[0];

    if (!assetRecord) {
        throw new Error("Asset not found on network...");
    }

    return assetRecord.num_accounts;
}