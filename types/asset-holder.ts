export type AssetHolder = {
  account: string;
  balance: string;
  paging_token: string;
};

export type AssetHolderResponse = {
    _links : {
        self: {
            href : string;
        }
        prev: {
            href : string;
        }
        next: {
            href : string;
        }
    
    };
    _embedded : {
        records : AssetHolder[];
    };
};