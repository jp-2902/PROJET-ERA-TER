import {
  BrowserProvider,
  formatEther,
  parseEther,
} from "ethers";

// ============================================================
// MESSINA GALLERY - BLOCKCHAIN SERVICE
// Ethereum Sepolia Test Network
// ============================================================

export const SEPOLIA_CHAIN_ID = "0xaa36a7";

export const SEPOLIA_CHAIN_ID_DECIMAL = 11155111;

// ============================================================
// CHECK METAMASK
// ============================================================

export const isMetaMaskAvailable = () => {
  return Boolean(
    window.ethereum &&
      window.ethereum.isMetaMask
  );
};

// ============================================================
// GET PROVIDER
// ============================================================

export const getBlockchainProvider =
  () => {
    if (!window.ethereum) {
      throw new Error(
        "MetaMask is not installed."
      );
    }

    return new BrowserProvider(
      window.ethereum
    );
  };

// ============================================================
// SWITCH TO SEPOLIA
// ============================================================

export const switchToSepolia =
  async () => {
    if (!window.ethereum) {
      throw new Error(
        "MetaMask is not installed."
      );
    }

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

      return true;
    } catch (error) {
      throw new Error(
        "Unable to switch to the Sepolia network.",
        {
          cause: error,
        }
      );
    }
  };

// ============================================================
// CONNECT WALLET
// ============================================================

export const connectWallet =
  async () => {
    if (!isMetaMaskAvailable()) {
      throw new Error(
        "MetaMask is not installed. Install MetaMask to use blockchain payments."
      );
    }

    await switchToSepolia();

    const provider =
      getBlockchainProvider();

    await provider.send(
      "eth_requestAccounts",
      []
    );

    const signer =
      await provider.getSigner();

    const address =
      await signer.getAddress();

    const balance =
      await provider.getBalance(
        address
      );

    const network =
      await provider.getNetwork();

    return {
      address,

      balance:
        formatEther(balance),

      chainId:
        Number(network.chainId),

      network:
        network.name,
    };
  };

// ============================================================
// GET CONNECTED WALLET
// ============================================================

export const getConnectedWallet =
  async () => {
    if (!isMetaMaskAvailable()) {
      return null;
    }

    const accounts =
      await window.ethereum.request({
        method: "eth_accounts",
      });

    if (
      !accounts ||
      accounts.length === 0
    ) {
      return null;
    }

    const provider =
      getBlockchainProvider();

    const balance =
      await provider.getBalance(
        accounts[0]
      );

    const network =
      await provider.getNetwork();

    return {
      address:
        accounts[0],

      balance:
        formatEther(balance),

      chainId:
        Number(network.chainId),

      network:
        network.name,
    };
  };

// ============================================================
// SEND ETH PAYMENT
// ============================================================

export const sendBlockchainPayment =
  async ({
    recipient,
    amountEth,
  }) => {
    if (!recipient) {
      throw new Error(
        "Blockchain recipient address is missing."
      );
    }

    if (
      !amountEth ||
      Number(amountEth) <= 0
    ) {
      throw new Error(
        "Invalid blockchain payment amount."
      );
    }

    if (!isMetaMaskAvailable()) {
      throw new Error(
        "MetaMask is not installed."
      );
    }

    await switchToSepolia();

    const provider =
      getBlockchainProvider();

    await provider.send(
      "eth_requestAccounts",
      []
    );

    const signer =
      await provider.getSigner();

    const sender =
      await signer.getAddress();

    const transaction =
      await signer.sendTransaction({
        to: recipient,

        value:
          parseEther(
            String(amountEth)
          ),
      });

    const receipt =
      await transaction.wait();

    return {
      success: true,

      sender,

      recipient,

      amountEth:
        String(amountEth),

      transactionHash:
        transaction.hash,

      blockNumber:
        receipt.blockNumber,

      status:
        receipt.status,

      chainId:
        SEPOLIA_CHAIN_ID_DECIMAL,
    };
  };