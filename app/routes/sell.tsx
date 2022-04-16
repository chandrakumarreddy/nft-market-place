import type { LinksFunction } from "@remix-run/node";
import { useCallback, useEffect, useState } from "react";
import indexStyles from "~/styles/index.css";
import { ethers } from "ethers";
import Web3Modal from "web3modal";
import NFTMarketplace from "../../blockchain/artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json";
import { nftmarketaddress } from "~/config";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: indexStyles },
];

export default function Sell() {
  const [loading, setLoading] = useState(true);
  const [nfts, setNfts] = useState<any[]>([]);
  const loadNFTs = useCallback(async () => {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(
      nftmarketaddress,
      NFTMarketplace.abi,
      signer
    );
    const data = await contract.fetchItemsListed();
    const items = await Promise.all(
      data.map(async (i: any) => {
        const tokenUri = await contract.tokenURI(i.tokenId);
        const meta = await (await fetch(tokenUri)).json();
        let price = ethers.utils.formatUnits(i.price.toString(), "ether");
        let item = {
          price,
          tokenId: i.tokenId.toNumber(),
          seller: i.seller,
          owner: i.owner,
          image: meta.image,
          name: meta.name,
          description: meta.description,
        };
        return item;
      })
    );
    setNfts(items);
    setLoading(false);
  }, []);
  useEffect(() => {
    loadNFTs();
  }, []);
  if (!loading && !nfts.length)
    return (
      <section className="center">
        <h1>Not found</h1>
      </section>
    );
  return loading ? (
    <section className="center">
      <h1>Loading..</h1>
    </section>
  ) : (
    <section className="home-page">
      {nfts.map((nft) => (
        <div className="item" key={nft.tokenId}>
          <img src={nft.image} alt={nft.name} width="100%" height="200px" />
          <div className="content">
            <p className="name">name: {nft.name}</p>
            <p className="price">price : {nft.price}</p>
          </div>
        </div>
      ))}
    </section>
  );
}
