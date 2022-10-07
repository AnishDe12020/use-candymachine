# Use Candymachine Hook

`useCandymachine` is a [React Hook](https://reactjs.org/docs/hooks-intro.html) that provides a simple interface to interact with a [Candy Machine](https://docs.metaplex.com/programs/candy-machine/). It accepts a Candymachine ID (address) and a [Connection Object](https://solana-labs.github.io/solana-web3.js/classes/Connection.html) and then returns multiple functions and other state variables.

## Features

- Fetching a Candymachine
- Fetching nfts that belong to a Candymachine
- Pagination when fetching nfts that belong to a Candymachine
- A `mint` function that can be directly called to mint a NFT
- Cleaner code, things are a little here and there now. Let me know (via an issue) if you have any suggestions. Maybe I am going to split the main hook into multiple ones (and then have a main one) but didn't decide upon that yet.

## Usage

First install the package:

With NPM -
```bash
npm install use-candymachine
```

With Yarn -
```bash
yarn add use-candymachine
```

### Simple Usage

```tsx
import useCandymachine from "use-candymachine";
import { useEffect } from "react";

const Component = () => {
    const {
        page,
        nfts,
        candymachineMeta,
        isFetchingMetadata,
        isFetchingNFTs,
        initialFetch,
        nextPage,
        prevPage
    } = useCandymachine(
        connection, // solana connection object
        "AVSqKTyhvWB2gViNpaytGe3riRDjHGLEQ5q15JYKuHfT", // candy machine id
        4, // number of nfts to display per page
    );

    useEffect(() => {
        initialFetch();
    }, []);

    return (
         <div>
            {!candymachineMeta ? (
                <p>Fetching metadata</p>
            ) : (
                <p>Number of items: {candymachineMeta.items.length}</p>
            )}
            {!nfts ? (
                <p>Fetching NFTs</p>
            ) : (
                nfts.map((nft, index) => <p key={index}>{nft.name}</p>)
            )}

            <button onClick={() => prevPage()}>Previous Page</button>
            <p>Current page: {page}</p>
            <button onClick={() => nextPage()}>Next Page</button>
        </div>
    )
}

```

### Minting an NFT

```tsx
import useCandymachine from "use-candymachine";

const Component = () => {
    const {
        mint,
        isMinting,
    } = useCandymachine(
        connection, // solana connection object
        "AVSqKTyhvWB2gViNpaytGe3riRDjHGLEQ5q15JYKuHfT", // candy machine id
        4, // number of nfts to display per page
    );

    return (
		<div>
			<button
			onClick={async () => {
				const nft = await mint();
				console.log(nft);
			}}
			>
				Mint
			</button>
			{isMinting && <p>Minting...</p>}
		</div>
    )
}

```

## Contributing

If you want to suggest a new feature, open a [new issue with the feature request template](https://github.com/AnishDe12020/use-candymachine/issues/new?assignees=&labels=enhancement&template=feature_request.yml&title=%5BFEAT%5D%3A+). For bug reports, use the [bug report issue template](https://github.com/AnishDe12020/use-candymachine/issues/new?assignees=AnishDe12020&labels=bug&template=bug_report.yml&title=%5BBUG%5D%3A+).

Hacktoberfest note: This project is participating in Hacktoberfest. You may work on any open issue or create a new issue along with a pr. If someone is already working on the issue, actively, please do not hijack it. You can however reques the issue to be re-assigned to you if here hasn't been any activity for a while.

To make a pr, fork the repository, clone it, create a new branch that describes the new feature or the bug it is fixing. Then make the required changes, commit them (we strongly recommend that you follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification and gitmojis are welcome as well). The next step is to create a pull request and a maintainer will review it as soon as possible.

## Contact

E-mail: [contact@anishde.dev](mailto:contact@anishde.dev)
Twitter: [@AnishDe12020](https://twitter.com/AnishDe12020)
