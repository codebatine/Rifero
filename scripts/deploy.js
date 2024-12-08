const hre = require('hardhat');

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log('Deploying contracts with the account:', deployer.address);

  const RiferoToken = await hre.ethers.getContractFactory('RiferoToken');
  const riferoToken = await RiferoToken.deploy();
  console.log('Deploy transaction sent for RiferoToken...');
  await riferoToken.waitForDeployment();
  console.log('RiferoToken deployed to:', riferoToken.target);

  const RiferoPlatform = await hre.ethers.getContractFactory('RiferoPlatform');
  const riferoPlatform = await RiferoPlatform.deploy(riferoToken.target);
  console.log('Deploy transaction sent for RiferoPlatform...');
  await riferoPlatform.waitForDeployment();
  console.log('RiferoPlatform deployed to:', riferoPlatform.target);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
