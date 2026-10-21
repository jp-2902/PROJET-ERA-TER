const {
  JsonRpcProvider,
  getAddress,
} = require("ethers");

// ============================================================
// MESSINA GALLERY
// BLOCKCHAIN VERIFICATION SERVICE
// Ethereum Sepolia
// ============================================================

const SEPOLIA_CHAIN_ID =
  11155111;

// ============================================================
// GET PROVIDER
// ============================================================

const getProvider = () => {
  const rpcUrl =
    process.env.SEPOLIA_RPC_URL;

  if (!rpcUrl) {
    throw new Error(
      "SEPOLIA_RPC_URL is missing in backend/.env"
    );
  }

  return new JsonRpcProvider(
    rpcUrl
  );
};

// ============================================================
// NORMALIZE ADDRESS
// ============================================================

const normalizeAddress = (
  address
) => {
  if (!address) {
    return "";
  }

  try {
    return getAddress(
      address
    ).toLowerCase();
  } catch {
    return "";
  }
};

// ============================================================
// VERIFY SEPOLIA TRANSACTION
// ============================================================

const verifySepoliaTransaction =
  async ({
    transactionHash,
    expectedRecipient,
  }) => {
    if (!transactionHash) {
      return {
        valid: false,

        message:
          "Transaction hash is missing.",
      };
    }

    if (
      !expectedRecipient
    ) {
      return {
        valid: false,

        message:
          "Blockchain receiver address is not configured.",
      };
    }

    const provider =
      getProvider();

    // ========================================================
    // NETWORK
    // ========================================================

    const network =
      await provider.getNetwork();

    const chainId =
      Number(
        network.chainId
      );

    if (
      chainId !==
      SEPOLIA_CHAIN_ID
    ) {
      return {
        valid: false,

        message:
          "The backend is not connected to Ethereum Sepolia.",
      };
    }

    // ========================================================
    // TRANSACTION
    // ========================================================

    const transaction =
      await provider.getTransaction(
        transactionHash
      );

    if (!transaction) {
      return {
        valid: false,

        message:
          "Blockchain transaction not found on Sepolia.",
      };
    }

    // ========================================================
    // RECEIPT
    // ========================================================

    const receipt =
      await provider.getTransactionReceipt(
        transactionHash
      );

    if (!receipt) {
      return {
        valid: false,

        message:
          "Blockchain transaction has not been confirmed yet.",
      };
    }

    if (
      Number(
        receipt.status
      ) !== 1
    ) {
      return {
        valid: false,

        message:
          "Blockchain transaction failed.",
      };
    }

    // ========================================================
    // RECIPIENT
    // ========================================================

    const transactionRecipient =
      normalizeAddress(
        transaction.to
      );

    const requiredRecipient =
      normalizeAddress(
        expectedRecipient
      );

    if (
      !transactionRecipient ||
      !requiredRecipient
    ) {
      return {
        valid: false,

        message:
          "Invalid blockchain recipient address.",
      };
    }

    if (
      transactionRecipient !==
      requiredRecipient
    ) {
      return {
        valid: false,

        message:
          "Blockchain transaction was sent to the wrong wallet.",
      };
    }

    // ========================================================
    // RESULT
    // ========================================================

    return {
      valid: true,

      transaction: {
        transactionHash:
          transaction.hash,

        sender:
          transaction.from,

        recipient:
          transaction.to,

        chainId,

        blockNumber:
          receipt.blockNumber,

        status:
          Number(
            receipt.status
          ),

        valueWei:
          transaction.value.toString(),
      },
    };
  };

// ============================================================
// EXPORT
// ============================================================

module.exports = {
  verifySepoliaTransaction,
};