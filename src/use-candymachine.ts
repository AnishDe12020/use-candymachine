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

  const metaplex = useMemo(() => {
    return Metaplex.make(conn);
  }, [conn]);

  const prevPage = async () => {
    if (page - 1 < 1) {
      setPage(1);
    } else {
      setPage(page - 1);
    }
    await fetchNfts();
  };

  const nextPage = async () => {
    setPage(page + 1);
    await fetchNfts();
  };

  const fetchCandyMachineMetadata = async () => {
    if (!cmId) {
      console.error("No candy machine id provided");
      return;
    }

    try {
      const candymachine = await metaplex
        .candyMachines()
        .findByAddress({ address: new PublicKey(cmId) })
        .run();

      const totalPages = Math.ceil(candymachine.itemsAvailable / nftsPerPage);

      setCandymachineMeta({ ...candymachine, totalPages });

      return candymachine;
    } catch (error) {
      console.error(error);
    }
  };

  const initialFetch = async () => {
    const meta = await fetchCandyMachineMetadata();
    console.log("candymachineMeta fetched");
    console.log("f", meta);
    await fetchNfts(meta);
  };

  const fetchNftsForPage = async (page: number, meta: CandyMachine) => {
    if (!meta) {
      console.error(
        "No candy machine metadata found. Please run `fetchCandyMachine` first"
      );
      return;
    }

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
    console.log("changed page");
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
  };
};

export default useCandymachine;
