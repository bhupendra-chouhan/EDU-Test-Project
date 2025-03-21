window.addEventListener("load", () => {
  if (typeof window.ethereum !== "undefined") {
    console.log("MetaMask is installed!");
  } else {
    alert("Please install MetaMask to use this dApp!");
  }
});

const contractAddress = "0x7A86b1378E29AC20ec17c68700FBE8E7E4B5c938";
const contractABI = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "fromToken",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "toToken",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amountIn",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amountOut",
        type: "uint256",
      },
    ],
    name: "SwapExecuted",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "exchangeRates",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "fromToken",
        type: "address",
      },
      {
        internalType: "address",
        name: "toToken",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "rate",
        type: "uint256",
      },
    ],
    name: "setExchangeRate",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "fromToken",
        type: "address",
      },
      {
        internalType: "address",
        name: "toToken",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amountIn",
        type: "uint256",
      },
    ],
    name: "swap",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

async function connect() {
  await ethereum.request({ method: "eth_requestAccounts" });
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  return new ethers.Contract(contractAddress, contractABI, signer);
}

document.getElementById("mint-btn").onclick = async () => {
  const owner = document.getElementById("mint-owner").value;
  const uri = document.getElementById("mint-uri").value;
  const contract = await connect();
  try {
    const tx = await contract.mintNFT(owner, uri);
    await tx.wait();
    updateStatus(`NFT minted! Token ID: ${tx.tokenId}`);
  } catch (error) {
    updateStatus(`Error: ${error.message}`);
  }
};

document.getElementById("create-auction-btn").onclick = async () => {
  const tokenId = document.getElementById("auction-tokenId").value;
  const price = ethers.utils.parseEther(
    document.getElementById("auction-price").value
  );
  const duration = document.getElementById("auction-duration").value;
  const contract = await connect();
  try {
    const tx = await contract.createAuction(tokenId, price, duration);
    await tx.wait();
    updateStatus("Auction created!");
  } catch (error) {
    updateStatus(`Error: ${error.message}`);
  }
};

document.getElementById("place-bid-btn").onclick = async () => {
  const auctionId = document.getElementById("bid-auctionId").value;
  const bidAmount = ethers.utils.parseEther(
    document.getElementById("bid-amount").value
  );
  const contract = await connect();
  try {
    const tx = await contract.placeBid(auctionId, { value: bidAmount });
    await tx.wait();
    updateStatus("Bid placed successfully!");
  } catch (error) {
    updateStatus(`Error: ${error.message}`);
  }
};

document.getElementById("end-auction-btn").onclick = async () => {
  const auctionId = document.getElementById("end-auctionId").value;
  const contract = await connect();
  try {
    const tx = await contract.endAuction(auctionId);
    await tx.wait();
    updateStatus("Auction ended!");
  } catch (error) {
    updateStatus(`Error: ${error.message}`);
  }
};

function updateStatus(message) {
  document.getElementById("status").innerText = message;
}
