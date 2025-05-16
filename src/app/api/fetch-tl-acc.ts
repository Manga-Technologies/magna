import type { NextApiRequest, NextApiResponse } from "next";
import { fetchAssetInfo } from "@/lib/routes";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { assetCode, issuer } = req.query;

  if (!assetCode || !issuer || typeof assetCode !== 'string' || typeof issuer !== 'string') {
    return res.status(400).json({ error: "Missing / invalid issuer or assetCode." });
  }

  try {
    const response = await fetchAssetInfo(assetCode, issuer);
    return res.status(200).json(response);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch asset info." });
  }
}
