import {
  ApplicationConfiguration,
  DefaultSigner,
  StellarConfiguration,
  Wallet,
} from "@stellar/typescript-wallet-sdk";
import { customClient } from "@/lib/axios";

let appConfig = new ApplicationConfiguration(DefaultSigner, customClient);
export let wallet = new Wallet({
  stellarConfiguration: StellarConfiguration.MainNet(),
  applicationConfiguration: appConfig,
});

export const stellar = wallet.stellar();
