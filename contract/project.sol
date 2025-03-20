// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract NFTArtMarketplace {
    uint256 public tokenIdCounter;
    uint256 public auctionIdCounter;

    struct Auction {
        uint256 auctionId;
        uint256 tokenId;
        uint256 startingPrice;
        uint256 currentBid;
        address currentBidder;
        uint256 endTime;
        bool isActive;
    }

    struct NFT {
        uint256 tokenId;
        address owner;
        string tokenURI;
    }

    mapping(uint256 => NFT) public nfts;
    mapping(uint256 => Auction) public auctions;

    event NewNFTMinted(uint256 tokenId, address owner, string tokenURI);
    event NewAuctionCreated(uint256 auctionId, uint256 tokenId, uint256 startingPrice, uint256 endTime);
    event NewBidPlaced(uint256 auctionId, uint256 tokenId, uint256 bidAmount, address bidder);
    event AuctionEnded(uint256 auctionId, uint256 tokenId, uint256 finalPrice, address winner);

    modifier onlyOwner(uint256 tokenId) {
        require(nfts[tokenId].owner == msg.sender, "You must be the owner to perform this action.");
        _;
    }

    modifier auctionActive(uint256 auctionId) {
        require(auctions[auctionId].isActive, "Auction is not active.");
        _;
    }

    modifier auctionEnded(uint256 auctionId) {
        require(block.timestamp >= auctions[auctionId].endTime, "Auction has not ended yet.");
        _;
    }

    constructor() {
        tokenIdCounter = 0;
        auctionIdCounter = 0;
    }

    // Function to mint a new NFT
    function mintNFT(address owner, string memory tokenURI) public returns (uint256) {
        tokenIdCounter++;
        uint256 newTokenId = tokenIdCounter;

        nfts[newTokenId] = NFT({
            tokenId: newTokenId,
            owner: owner,
            tokenURI: tokenURI
        });

        emit NewNFTMinted(newTokenId, owner, tokenURI);
        return newTokenId;
    }

    // Function to create a new auction
    function createAuction(uint256 tokenId, uint256 startingPrice, uint256 duration) public onlyOwner(tokenId) {
        auctionIdCounter++;
        uint256 newAuctionId = auctionIdCounter;

        auctions[newAuctionId] = Auction({
            auctionId: newAuctionId,
            tokenId: tokenId,
            startingPrice: startingPrice,
            currentBid: 0,
            currentBidder: address(0),
            endTime: block.timestamp + duration,
            isActive: true
        });

        emit NewAuctionCreated(newAuctionId, tokenId, startingPrice, block.timestamp + duration);
    }

    // Function to place a bid on an auction
    function placeBid(uint256 auctionId) public payable auctionActive(auctionId) {
        Auction storage auction = auctions[auctionId];
        require(block.timestamp < auction.endTime, "Auction has ended.");
        require(msg.value > auction.currentBid, "Bid must be higher than the current bid.");

        // Refund the previous highest bidder if any
        if (auction.currentBidder != address(0)) {
            payable(auction.currentBidder).transfer(auction.currentBid);
        }

        auction.currentBid = msg.value;
        auction.currentBidder = msg.sender;

        emit NewBidPlaced(auctionId, auction.tokenId, msg.value, msg.sender);
    }

    // Function to end an auction
    function endAuction(uint256 auctionId) public auctionActive(auctionId) auctionEnded(auctionId) {
        Auction storage auction = auctions[auctionId];
        auction.isActive = false;

        if (auction.currentBidder != address(0)) {
            // Transfer the NFT to the winning bidder
            nfts[auction.tokenId].owner = auction.currentBidder;
            payable(nfts[auction.tokenId].owner).transfer(auction.currentBid);

            emit AuctionEnded(auctionId, auction.tokenId, auction.currentBid, auction.currentBidder);
        }
    }

    // Function to withdraw funds from the contract
    function withdraw() public {
        payable(msg.sender).transfer(address(this).balance);
    }

    // Function to get the current auction details for a token
    function getAuctionDetails(uint256 auctionId) public view returns (Auction memory) {
        return auctions[auctionId];
    }

    // Function to get NFT details
    function getNFTDetails(uint256 tokenId) public view returns (NFT memory) {
        return nfts[tokenId];
    }
}
