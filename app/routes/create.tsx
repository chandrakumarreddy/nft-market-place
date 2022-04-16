import type { LinksFunction } from "@remix-run/node";
import { create as ipfsHttpClient } from "ipfs-http-client";
import type { ChangeEvent, FormEventHandler } from "react";
import { useState } from "react";
import createStyles from "~/styles/create.css";
import Web3Modal from "web3modal";
import { ethers } from "ethers";
import { useNavigate } from "@remix-run/react";
import { nftmarketaddress } from "~/config";
import NFTMarketplace from "../../blockchain/artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: createStyles },
];

const client = ipfsHttpClient({ url: "https://ipfs.infura.io:5001/api/v0" });

export default function Create() {
  const navigate = useNavigate();
  const [fileUrl, setFileUrl] = useState<string>("");
  const [formInput, updateFormInput] = useState({
    price: "",
    name: "",
    description: "",
  });
  const handlefileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const file = e.target.files[0];
      try {
        const added = await client.add(file, {
          progress: (prog) => console.log(`received: ${prog}`),
        });
        const url = `https://ipfs.infura.io/ipfs/${added.path}`;
        setFileUrl(url);
      } catch (error) {
        console.log("Error uploading file: ", error);
      }
    }
  };
  async function uploadToIPFS() {
    const { name, description, price } = formInput;
    if (!name || !description || !price || !fileUrl) return;
    const data = JSON.stringify({
      name,
      description,
      image: fileUrl,
    });
    try {
      const added = await client.add(data);
      const url = `https://ipfs.infura.io/ipfs/${added.path}`;
      return url;
    } catch (error) {
      console.log("Error uploading file: ", error);
    }
  }
  async function listNFTForSale(e: HTMLFormElement) {
    e.preventDefault();
    const url = await uploadToIPFS();
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    /* create the NFT */
    const price = ethers.utils.parseUnits(formInput.price, "ether");
    let contract = new ethers.Contract(
      nftmarketaddress,
      NFTMarketplace.abi,
      signer
    );
    let listingPrice = await contract.getListingPrice();
    console.log(url, price, listingPrice, "listingPrice");
    listingPrice = listingPrice.toString();
    let transaction = await contract.createToken(url, price, {
      value: listingPrice,
    });
    await transaction.wait();

    navigate("/");
  }
  return (
    <section className="create-page">
      <form onSubmit={listNFTForSale}>
        <input
          type="text"
          placeholder="Asset Name"
          onChange={(e) =>
            updateFormInput({ ...formInput, name: e.target.value })
          }
        />
        <textarea
          placeholder="Asset Description"
          rows={4}
          onChange={(e) =>
            updateFormInput({ ...formInput, description: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="Price in Eth"
          onChange={(e) =>
            updateFormInput({ ...formInput, price: e.target.value })
          }
        />
        <input type="file" name="Asset" onChange={handlefileChange} />
        {fileUrl && (
          <img
            height="150"
            width="150"
            src={fileUrl}
            className="image-file-url"
            alt="fileurl"
          />
        )}
        <button type="submit">Submit</button>
      </form>
    </section>
  );
}
