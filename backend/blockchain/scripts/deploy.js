import "dotenv/config";

import fs from "node:fs";

import {
  ContractFactory,
  JsonRpcProvider,
  Wallet,
  formatEther,
} from "ethers";

// ============================================================
// ENVIRONMENT
// ============================================================

const rpcUrl =
  process.env.SEPOLIA_RPC_URL;

const privateKey =
  process.env.DEPLOYER_PRIVATE_KEY;

if (!rpcUrl) {
  throw new Error(
    "SEPOLIA_RPC_URL is missing from .env"
  );
}

if (!privateKey) {
  throw new Error(
    "DEPLOYER_PRIVATE_KEY is missing from .env"
  );
}

// ============================================================
// PROVIDER + WALLET
// ============================================================

const provider =
  new JsonRpcProvider(
    rpcUrl
  );

const wallet =
  new Wallet(
    privateKey,
    provider
  );

console.log(
  "Deploying from:",
  wallet.address
);

// ============================================================
// NETWORK
// ============================================================

const network =
  await provider.getNetwork();

console.log(
  "Chain ID:",
  Number(network.chainId)
);

if (
  Number(network.chainId) !==
  11155111
) {
  throw new Error(
    "This deployment must use Ethereum Sepolia."
  );
}

// ============================================================
// BALANCE
// ============================================================

const balance =
  await provider.getBalance(
    wallet.address
  );

console.log(
  "Wallet balance:",
  formatEther(balance),
  "ETH"
);

if (balance === 0n) {
  throw new Error(
    "The deployer wallet has no Sepolia ETH."
  );
}

// ============================================================
// LOAD HARDHAT ARTIFACT
// ============================================================

const artifactPath =
  "./artifacts/contracts/MessinaArtCertificate.sol/MessinaArtCertificate.json";

if (
  !fs.existsSync(
    artifactPath
  )
) {
  throw new Error(
    "Contract artifact not found. Run npx hardhat compile first."
  );
}

const artifact =
  JSON.parse(
    fs.readFileSync(
      artifactPath,
      "utf8"
    )
  );

// ============================================================
// DEPLOY CONTRACT
// ============================================================

console.log(
  "Deploying MessinaArtCertificate..."
);

const factory =
  new ContractFactory(
    artifact.abi,
    artifact.bytecode,
    wallet
  );

const contract =
  await factory.deploy();

console.log(
  "Deployment transaction:",
  contract.deploymentTransaction().hash
);

console.log(
  "Waiting for confirmation..."
);

await contract.waitForDeployment();

const contractAddress =
  await contract.getAddress();

console.log("");
console.log(
  "======================================"
);

console.log(
  "MESSINA ART CERTIFICATE DEPLOYED ✅"
);

console.log(
  "Contract address:",
  contractAddress
);

console.log(
  "Network: Ethereum Sepolia"
);

console.log(
  "Chain ID: 11155111"
);

console.log(
  "======================================"
);
