import Server from "@stellar/stellar-sdk";
import type { NextApiRequest, NextApiResponse } from "next";

const STELLAR_URL = "https://horizon.stellar.org";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    const { assetCode, issuer } = req.query;

    // checks if request contained assetcode and issuer 
    if (!assetCode || !issuer || typeof assetCode !== 'string' || typeof issuer !== 'string') {
        return res.status(400).json({ error: "Missing / invalid issuer or assetCode..."});
    }

    const server = new Server(STELLAR_URL);

    try {
        const response = await server.assets()
            .forCode(assetCode)
            .forIssuer(issuer)
            .call();
        
        return res.status(200).json(response);

    } catch (error) {
        return res.status(500).json({ error: "Failed to fetch asset info..."});
    }
    
}

