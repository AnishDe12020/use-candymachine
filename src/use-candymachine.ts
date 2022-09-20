import { Connection, PublicKey } from "@solana/web3.js";
import { CandyMachine, Metaplex } from "@metaplex-foundation/js";
import { useMemo, useState } from "react";

interface CandyMachineMetaWithPages extends CandyMachine {
  totalPages: number;
}

const useCandymachine = (
  conn: Connection,
  cmId: string,
  nftsPerPage: number
) => {
  const [page, setPage] = useState<number>(1);
  const [candymachineMeta, setCandymachineMeta] =
    useState<CandyMachineMetaWithPages | null>(null);
  const [nfts, setNfts] = useState<any[] | null>(null);
  const [isFetchingMetadata, setIsFetchingMetadata] = useState<boolean>(false);
  const [isFetchingNFTs, setIsFetchingNFTs] = useState<boolean>(false);

  const metaplex = useMemo(() => {
    return Metaplex.make(conn);
  }, [conn]);

  const prevPage = async () => {
    if (page - 1 < 1) {
      changePage(1);
    } else {
      changePage(page - 1);
    }
  };

  const nextPage = async () => {
    changePage(page + 1);
  };

  const fetchCandyMachineMetadata = async () => {
    if (!cmId) {
      console.error("No candy machine id provided");
      return;
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
      console.error(error);
    }
  };

  const initialFetch = async () => {
    const meta = await fetchCandyMachineMetadata();
    await fetchNfts(meta);
  };

  const fetchNftsForPage = async (page: number, meta: CandyMachine) => {
    if (!meta) {
      console.error(
        "No candy machine metadata found. Please run `fetchCandyMachine` first"
      );
      return;
    }
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
  };

  const fetchNfts = async (meta?: CandyMachine) => {
    if (!meta) {
      if (candymachineMeta) {
        meta = candymachineMeta;
      } else {
        console.error(
          "No candy machine metadata found. Please run `fetchCandyMachine` first"
        );
        return;
      }
    }
    await fetchNftsForPage(page, meta);
  };

  const changePage = async (page: number) => {
    if (!candymachineMeta) {
      console.error(
        "No candy machine metadata found. Please run `fetchCandyMachine` first"
      );
      return;
    }
    await fetchNftsForPage(page, candymachineMeta);
    setPage(page);
  };

  return {
    page,
    candymachineMeta,
    nfts,
    prevPage,
    nextPage,
    fetchCandyMachineMetadata,
    initialFetch,
    fetchNftsForPage,
    changePage,
    isFetchingMetadata,
    isFetchingNFTs,
  };
};

export default useCandymachine;
