import api from "../api";

// ============================================================
// METAMASK
// ============================================================

export function isMetaMaskAvailable() {
  return Boolean(
    window.ethereum &&
      window.ethereum.isMetaMask
  );
}

// ============================================================
// CONNECT WALLET
// ============================================================

export async function connectArtistWallet() {
  if (!isMetaMaskAvailable()) {
    throw new Error(
      "MetaMask is not installed."
    );
  }

  const accounts =
    await window.ethereum.request({
      method: "eth_requestAccounts",
    });

  if (
    !accounts ||
    accounts.length === 0
  ) {
    throw new Error(
      "No MetaMask account available."
    );
  }

  return accounts[0];
}

// ============================================================
// GET CURRENT ACCOUNT
// ============================================================

export async function getArtistWallet() {
  if (!isMetaMaskAvailable()) {
    return null;
  }

  const accounts =
    await window.ethereum.request({
      method: "eth_accounts",
    });

  return accounts?.[0] || null;
}

// ============================================================
// SWITCH TO ETHEREUM SEPOLIA
// ============================================================

export async function switchToSepolia() {
  if (!isMetaMaskAvailable()) {
    throw new Error(
      "MetaMask is not installed."
    );
  }

  const SEPOLIA_CHAIN_ID =
    "0xaa36a7";

  try {
    await window.ethereum.request({
      method:
        "wallet_switchEthereumChain",

      params: [
        {
          chainId:
            SEPOLIA_CHAIN_ID,
        },
      ],
    });
  } catch (error) {
    throw new Error(
      error?.message ||
        "Unable to switch MetaMask to Ethereum Sepolia.",
      {
        cause: error,
      }
    );
  }
}

// ============================================================
// CERTIFY ARTWORK
// ============================================================

export async function certifyArtwork({
  artworkId,
  artistWallet,
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

  const response =
    await api.post(
      `/api/artworks/${artworkId}/certify`,
      {
        artistWallet,
      }
    );

  return response.data;
}

// ============================================================
// COMPLETE CERTIFICATION FLOW
// ============================================================

export async function certifyArtworkWithMetaMask(
  artworkId
) {
  if (!isMetaMaskAvailable()) {
    throw new Error(
      "MetaMask is required to certify an artwork."
    );
  }

  await switchToSepolia();

  const artistWallet =
    await connectArtistWallet();

  const result =
    await certifyArtwork({
      artworkId,
      artistWallet,
    });

  return {
    ...result,
    artistWallet,
  };
}