import { AssetHolder } from "../../types/asset-holder";

const STELLAR_EXPERT_API = 'https://api.stellar.expert/explorer/public';

// gets all assets issued by us
export async function getIssuedAssets(issuer: string) {
  const res = await fetch(`${STELLAR_EXPERT_API}/account/${issuer}/assets`);
  if (!res.ok) throw new Error('Failed to fetch assets');
  const data = await res.json();
  return data._embedded.records;
}

// gets holders of assets, specifically wallet address and balance
export async function getAssetHolders(assetCode: string, issuer: string) {
  const res = await fetch(`${STELLAR_EXPERT_API}/asset/${assetCode}-${issuer}/holders`);
  if (!res.ok) throw new Error(`Failed to fetch holders for ${assetCode}`);
  const data = await res.json();
  return data._embedded.records;
}

// master function
export async function getAllAssetHolders(issuer: string) {
  const assets = await getIssuedAssets(issuer);
  const holdersMap: Record<string, { account: string; balance: string }[]> = {};

  for (const asset of assets) {
    const assetCode = asset.asset;
    const holders : AssetHolder[] = await getAssetHolders(assetCode, issuer);
    holdersMap[assetCode] = holders.map(holder => ({
      account: holder.account,
      balance: holder.balance,
    }));
  }

  return holdersMap;
}

export async function getTrustLineAccounts(issuer : string, assetCode : string) {

    const response = await fetch(`/api/fetch-tl-acc?assetCode=${assetCode}&issuer=${issuer}`);
    const data = await response.json()
    const assetRecord = data._embedded?.records?.[0];

    if (!assetRecord) {
        throw new Error("Asset not found on network...");
    }

    return assetRecord.num_accounts;
}