# Rifero

Rifero is a referral platform designed for Web3. Using smart contracts to simplify the process of managing and rewarding referrals. Providing users with a single interface to generate and track referral links without multiple accounts.

<p align="center"><i>Your wallet — your referrals</i></p>

The platform aims to streamline the referral process in Web3 by allowing users to generate unique links, track their referrals and earn rewards. In an all blockchain based solution where users keep control over their data.

## **Screenshots and Logo**

### **Rifero Logo**

![Rifero Logo](./frontend/src/assets/img/rifero-logo.png 'Rifero Logo')

### **Screenshot 1: App Start**

![App Interface](./frontend/src/assets/img/rifero-start.png 'Rifero App')

### **Screenshot 2: Referral Workflow**

![Referral Workflow](./frontend/src/assets/img/rifero-dashboard.png 'Rifero Dashboard')

## Platform Details

- **Platform Address**: `0xe8806fc0f62174dd3587e7792e624535cafdd3ed`
- **Token Address**: `0x454ba6e6dec3bf200b4b5835c16f0342410ecc1e`

---

## **Getting Started**

### 1. Start the App Locally

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

## **How It Works**

### **1. Token Allocation**

- **Total Supply**: 1,000,000 RFT minted to the deployer’s wallet.
- **Purpose**: Tokens are used to fund the RiferoPlatform for rewarding referrals.

### **2. Referral Rewards**

- Each successful referral awards **10 RFT** to the referrer.
- Referral rules:
  - Self-referrals are not allowed.
  - A wallet can only be referred once.
  - Circular referrals (referring your referrer) are prohibited.

### **3. Funding the Platform**

- The deployer or any token holder must transfer RFT tokens to the RiferoPlatform.
- Tokens in the platform ensure rewards are distributed to successful referrers.

## **User Workflow**

### **Step 1: Connect Wallet**

- The app prompts users to connect their Web3 wallet (e.g., MetaMask).
- Once connected, the user’s wallet address and token balance are displayed.

### **Step 2: Generate Referral Link**

- Users can generate a personalized referral link based on their wallet address.
- The generated link can be copied to the clipboard for easy sharing.

### **Step 3: Add Referrals**

- Referees can be manually added by entering their wallet address.
- The platform validates the referee address to ensure it meets referral rules.

### **Step 4: Earn Rewards**

- Upon a successful referral, **10 RFT** tokens are automatically transferred to the referrer’s wallet.
- The referral and rewards are recorded on-chain for transparency.

## **Load Ethers in Browser Console**

For testing purposes contract is funded via browser console

```bash
const script = document.createElement("script");
script.src = "https://cdnjs.cloudflare.com/ajax/libs/ethers/5.7.2/ethers.umd.min.js";
script.onload = () => console.log("Ethers.js loaded!");
document.head.appendChild(script);
```

## Funding the RiferoPlatform

```bash
(async () => {
  const tokenAddress = "0x454ba6e6dec3bf200b4b5835c16f0342410ecc1e"; // RiferoToken address
  const platformAddress = "0xe8806fc0f62174dd3587e7792e624535cafdd3ed"; // RiferoPlatform address
  const amount = ethers.utils.parseUnits("100", 18); // Amount to transfer: 100 RFT

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  const signer = provider.getSigner();

  const RiferoTokenABI = ["function transfer(address recipient, uint256 amount) public returns (bool)"];
  const token = new ethers.Contract(tokenAddress, RiferoTokenABI, signer);

  try {
    console.log(`Sending ${ethers.utils.formatUnits(amount, 18)} RFT to RiferoPlatform...`);
    const tx = await token.transfer(platformAddress, amount);
    console.log("Transaction sent:", tx.hash);

    await tx.wait();
    console.log("Funding successful!");
  } catch (error) {
    console.error("Error funding platform:", error.message);
  }
})();
```

## Checking the Balance of the RiferoPlatform Contract

```bash
(async () => {
  const tokenAddress = "0x454ba6e6dec3bf200b4b5835c16f0342410ecc1e"; // RiferoToken address
  const platformAddress = "0xe8806fc0f62174dd3587e7792e624535cafdd3ed"; // RiferoPlatform address

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  const signer = provider.getSigner();

  const RiferoTokenABI = ["function balanceOf(address owner) view returns (uint256)"];
  const token = new ethers.Contract(tokenAddress, RiferoTokenABI, signer);

  try {
    const balance = await token.balanceOf(platformAddress);
    console.log(`RiferoPlatform Balance: ${ethers.utils.formatUnits(balance, 18)} RFT`);
  } catch (error) {
    console.error("Error checking platform balance:", error.message);
  }
})();
```

## **Further Development**

### **1. Improve Referral Links**

- Improve the reliability of referral links to eliminate manual additions of referees.

### **2. Automated Funding**

- Introduce automated mechanisms to ensure the RiferoPlatform always has sufficient tokens for rewards.

### **3. Multi-Network Support**

- Expand compatibility to multiple blockchain networks, increasing accessibility for a broader user base.

### **4. Analytics and Insights**

- Add tools for users to track referral performance, token rewards and activity metrics.

### **5. User Interface Improvements**

- Refine the UI for a seamless experience across both desktop and mobile devices.

### **6. Wallet Compatibility**

- Enhance support for a wider range of wallets to ensure compatibility and accessibility for all users.
