import { ConfirmOptions, Connection, PublicKey, Signer } from "@solana/web3.js";
import {
  CandyMachine,
  Metaplex,
  WalletAdapter,
  walletAdapterIdentity,
} from "@metaplex-foundation/js";
import { useMemo, useState } from "react";

interface CandyMachineMetaWithPages extends CandyMachine {
  totalPages: number;
}

const useCandymachine = (
  conn: Connection,
  cmId: string,
  nftsPerPage: number,
  wallet?: WalletAdapter
) => {
  const [page, setPage] = useState<number>(1);
  const [candymachineMeta, setCandymachineMeta] =
    useState<CandyMachineMetaWithPages | null>(null);
  const [nfts, setNfts] = useState<any[] | null>(null);
  const [isFetchingMetadata, setIsFetchingMetadata] = useState<boolean>(false);
  const [isFetchingNFTs, setIsFetchingNFTs] = useState<boolean>(false);
  const [isMinting, setIsMinting] = useState<boolean>(false);

  const metaplex = useMemo(() => {
    if (wallet) {
      return Metaplex.make(conn).use(walletAdapterIdentity(wallet));
    } else {
      return Metaplex.make(conn);
    }
  }, [conn, wallet]);

  const prevPage = async () => {
    try {
      if (page - 1 < 1) {
        changePage(1);
      } else {
        changePage(page - 1);
      }
    } catch (e) {
      return e;
    }
  };

  const nextPage = async () => {
    try {
      changePage(page + 1);
    } catch (e) {
      return e;
    }
  };

  const fetchCandyMachineMetadata = async () => {
    if (!cmId) {
      return new Error("No candy machine id provided");
    }

    try {
      setIsFetchingMetadata(true);
      const candymachine = await metaplex
        .candyMachines()
        .findByAddress({ address: new PublicKey(cmId) })
        .run();

      const totalPages = Math.ceil(candymachine.itemsAvailable / nftsPerPage);

      setCandymachineMeta({ ...candymachine, totalPages });
      setIsFetchingMetadata(false);

      return candymachine;
    } catch (error) {
      return error;
    }
  };

  const initialFetch = async () => {
    try {
      const meta = await fetchCandyMachineMetadata();
      await fetchNfts(meta);
    } catch (e) {
      return e;
    }
  };

  const fetchNftsForPage = async (page: number, meta: CandyMachine) => {
    if (!meta) {
      return new Error(
        "No candy machine metadata found. Please run `fetchCandyMachine` first"
      );
    }

    try {
      setIsFetchingNFTs(true);
      const pageItems = meta.items.slice(
        (page - 1) * nftsPerPage,
        page * nftsPerPage
      );

      let nftData: any[] = [];

      for (let i = 0; i < pageItems.length; i++) {
        const fetchResult = await fetch(pageItems[i].uri);
        const jsonResult = await fetchResult.json();
        nftData.push(jsonResult);
      }

      setNfts(nftData);
      setIsFetchingNFTs(false);
    } catch (error) {
      return error;
    }
  };

  const fetchNfts = async (meta?: CandyMachine) => {
    if (!meta) {
      if (candymachineMeta) {
        meta = candymachineMeta;
      } else {
        return new Error(
          "No candy machine metadata found. Please run `fetchCandyMachine` first"
        );
      }
    }

    try {
      await fetchNftsForPage(page, meta);
    } catch (e) {
      return e;
    }
  };

  const changePage = async (page: number) => {
    if (!candymachineMeta) {
      return new Error(
        "No candy machine metadata found. Please run `fetchCandyMachine` first"
      );
      return;
    }
    await fetchNftsForPage(page, candymachineMeta);
    setPage(page);
  };

  const mint = async (
    payer?: Signer,
    newMint?: Signer,
    newOwner?: PublicKey,
    newToken?: Signer,
    payerToken?: PublicKey,
    whitelistToken?: PublicKey,
    tokenProgram?: PublicKey,
    associatedTokenProgram?: PublicKey,
    tokenMetadataProgram?: PublicKey,
    confirmOptions?: ConfirmOptions
  ) => {
    if (!candymachineMeta) {
      return Error("No candy machine metadata found");
    }

    if (!wallet) {
      return Error("Wallet not passed in, please pass it in as a prop");
    }

    try {
      setIsMinting(true);

      const mintResult = await metaplex
        .candyMachines()
        .mint({
          candyMachine: candymachineMeta,
          payer,
          newOwner,
          newToken,
          newMint,
          payerToken,
          whitelistToken,
          tokenProgram,
          associatedTokenProgram,
          tokenMetadataProgram,
          confirmOptions,
        })
        .run();

      setIsMinting(false);
      return mintResult;
    } catch (error) {
      return error;
    }
  };

  return {
    page,
    candymachineMeta,
    nfts,
    isFetchingMetadata,
    isFetchingNFTs,
    isMinting,
    prevPage,
    nextPage,
    fetchCandyMachineMetadata,
    initialFetch,
    fetchNftsForPage,
    changePage,
    mint,
  };
};

export default useCandymachine;
