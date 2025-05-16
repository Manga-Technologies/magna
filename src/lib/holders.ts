import { AssetHolder } from "../../types/asset-holder";

const STELLAR_EXPERT_API = 'https://api.stellar.expert/explorer/public';

export async function getIssuedAssets(issuer: string) {
  const res = await fetch(`${STELLAR_EXPERT_API}/account/${issuer}/assets`);
  if (!res.ok) throw new Error('Failed to fetch assets');
  const data = await res.json();
  return data._embedded.records;
}

export async function getAssetHolders(assetCode: string, issuer: string) {
  const res = await fetch(`${STELLAR_EXPERT_API}/asset/${assetCode}-${issuer}/holders`);
  if (!res.ok) throw new Error(`Failed to fetch holders for ${assetCode}`);
  const data = await res.json();
  return data._embedded.records;
}

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
