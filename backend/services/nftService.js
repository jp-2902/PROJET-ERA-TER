const {
  Contract,
  JsonRpcProvider,
  Wallet,
  getAddress,
} = require("ethers");

// ============================================================
// MESSINA ART CERTIFICATE ABI
// ============================================================

const NFT_ABI = [
  "function certifyArtwork(address artistWallet, string artworkId, string metadataURI) external returns (uint256)",
  "function getTokenIdByArtworkId(string artworkId) external view returns (uint256)",
  "function isArtworkCertified(string artworkId) external view returns (bool)",

  "event ArtworkCertified(uint256 indexed tokenId, string indexed artworkId, address indexed artist, string metadataURI)",
];

// ============================================================
// GET BLOCKCHAIN CONFIG
// ============================================================

function getBlockchainConfig() {
  const rpcUrl =
    process.env.SEPOLIA_RPC_URL;

  const privateKey =
    process.env.NFT_SIGNER_PRIVATE_KEY;

  const contractAddress =
    process.env.NFT_CONTRACT_ADDRESS;

  if (!rpcUrl) {
    throw new Error(
      "SEPOLIA_RPC_URL is missing."
    );
  }

  if (!privateKey) {
    throw new Error(
      "NFT_SIGNER_PRIVATE_KEY is missing."
    );
  }

  if (!contractAddress) {
    throw new Error(
      "NFT_CONTRACT_ADDRESS is missing."
    );
  }

  return {
    rpcUrl,
    privateKey,
    contractAddress,
  };
}

// ============================================================
// GET PROVIDER
// ============================================================

async function getProvider() {
  const {
    rpcUrl,
  } =
    getBlockchainConfig();

  const provider =
    new JsonRpcProvider(
      rpcUrl
    );

  const network =
    await provider.getNetwork();

  if (
    Number(
      network.chainId
    ) !== 11155111
  ) {
    throw new Error(
      "NFT certification must use Ethereum Sepolia."
    );
  }

  return provider;
}

// ============================================================
// GET SIGNER
// ============================================================

async function getSigner() {
  const provider =
    await getProvider();

  const {
    privateKey,
  } =
    getBlockchainConfig();

  let normalizedKey =
    privateKey.trim();

  if (
    !normalizedKey.startsWith(
      "0x"
    )
  ) {
    normalizedKey =
      `0x${normalizedKey}`;
  }

  const signer =
    new Wallet(
      normalizedKey,
      provider
    );

  return signer;
}

// ============================================================
// GET CONTRACT
// ============================================================

async function getNFTContract() {
  const signer =
    await getSigner();

  const {
    contractAddress,
  } =
    getBlockchainConfig();

  const normalizedAddress =
    getAddress(
      contractAddress
    );

  return new Contract(
    normalizedAddress,
    NFT_ABI,
    signer
  );
}

// ============================================================
// CHECK CERTIFICATION
// ============================================================

async function isArtworkCertifiedOnChain(
  artworkId
) {
  const contract =
    await getNFTContract();

  return contract
    .isArtworkCertified(
      String(artworkId)
    );
}

// ============================================================
// GET TOKEN ID
// ============================================================

async function getArtworkTokenId(
  artworkId
) {
  const contract =
    await getNFTContract();

  const tokenId =
    await contract
      .getTokenIdByArtworkId(
        String(artworkId)
      );

  return tokenId.toString();
}

// ============================================================
// CERTIFY ARTWORK
// ============================================================

async function certifyArtworkOnChain({
  artworkId,
  artistWallet,
  metadataURI,
}) {
  if (!artworkId) {
    throw new Error(
      "Artwork ID is required."
    );
  }

  if (!artistWallet) {
    throw new Error(
      "Artist wallet is required."
    );
  }

  if (!metadataURI) {
    throw new Error(
      "Metadata URI is required."
    );
  }

  const contract =
    await getNFTContract();

  const normalizedWallet =
    getAddress(
      artistWallet
    );

  const alreadyCertified =
    await contract
      .isArtworkCertified(
        String(artworkId)
      );

  if (alreadyCertified) {
    throw new Error(
      "This artwork is already certified on the blockchain."
    );
  }

  const transaction =
    await contract
      .certifyArtwork(
        normalizedWallet,
        String(artworkId),
        metadataURI
      );

  const receipt =
    await transaction.wait();

  if (
    !receipt ||
    Number(
      receipt.status
    ) !== 1
  ) {
    throw new Error(
      "NFT certification transaction failed."
    );
  }

  let tokenId = null;

  for (
    const log
    of receipt.logs
  ) {
    try {
      const parsedLog =
        contract.interface
          .parseLog(log);

      if (
        parsedLog &&
        parsedLog.name ===
          "ArtworkCertified"
      ) {
        tokenId =
          parsedLog.args
            .tokenId
            .toString();

        break;
      }
    } catch {
      // Ignore unrelated logs.
    }
  }

  if (!tokenId) {
    tokenId =
      await getArtworkTokenId(
        artworkId
      );
  }

  const {
    contractAddress,
  } =
    getBlockchainConfig();

  return {
    certified: true,

    tokenId,

    contractAddress:
      getAddress(
        contractAddress
      ),

    blockchain:
      "Ethereum",

    network:
      "Sepolia",

    chainId:
      11155111,

    transactionHash:
      transaction.hash,

    blockNumber:
      receipt.blockNumber,

    metadataURI,

    ownerWallet:
      normalizedWallet,

    creatorWallet:
      normalizedWallet,

    certifiedAt:
      new Date(),
  };
}

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  certifyArtworkOnChain,
  getArtworkTokenId,
  isArtworkCertifiedOnChain,
};
