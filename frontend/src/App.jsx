import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { PLATFORM_ADDRESS, TOKEN_ADDRESS } from "./config";
import RiferoPlatformABI from "./abis/RiferoPlatform.json";
import RiferoTokenABI from "./abis/RiferoToken.json";
import "./styles.css";

const App = () => {
    const [walletAddress, setWalletAddress] = useState("");
    const [tokenBalance, setTokenBalance] = useState("0");
    const [referrals, setReferrals] = useState([]);
    const [platformContract, setPlatformContract] = useState(null);
    const [tokenContract, setTokenContract] = useState(null);
    const [message, setMessage] = useState("");
    const [referralLink, setReferralLink] = useState("");

    const connectWallet = async () => {
        if (!window.ethereum) {
            alert("MetaMask is not installed. Please install MetaMask and try again.");
            return;
        }

        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            await provider.send("eth_requestAccounts", []);

            const network = await provider.getNetwork();
            if (network.chainId !== 11155111) {
                await provider.send("wallet_switchEthereumChain", [{ chainId: "0xAA36A7" }]);
            }

            const signer = await provider.getSigner();
            const address = await signer.getAddress();
            setWalletAddress(address);

            localStorage.setItem("walletAddress", address); // Save wallet address to localStorage

            const platform = new ethers.Contract(PLATFORM_ADDRESS, RiferoPlatformABI.abi, signer);
            const token = new ethers.Contract(TOKEN_ADDRESS, RiferoTokenABI.abi, signer);

            setPlatformContract(platform);
            setTokenContract(token);

            const balance = await token.balanceOf(address);
            setTokenBalance(ethers.formatUnits(balance, 18));

            const refs = await platform.getReferrals(address);
            setReferrals(refs);

            console.log("Connected to Platform Contract:", platform);
            console.log("Connected to Token Contract:", token);
        } catch (error) {
            console.error("Error connecting wallet:", error);
            alert("Failed to connect wallet. Check console for details.");
        }
    };

    const reconnectWallet = async () => {
        const savedAddress = localStorage.getItem("walletAddress");
        if (savedAddress && window.ethereum) {
            try {
                const provider = new ethers.BrowserProvider(window.ethereum);
                const signer = await provider.getSigner();

                setWalletAddress(savedAddress);

                const platform = new ethers.Contract(PLATFORM_ADDRESS, RiferoPlatformABI.abi, signer);
                const token = new ethers.Contract(TOKEN_ADDRESS, RiferoTokenABI.abi, signer);

                setPlatformContract(platform);
                setTokenContract(token);

                const balance = await token.balanceOf(savedAddress);
                setTokenBalance(ethers.formatUnits(balance, 18));

                const refs = await platform.getReferrals(savedAddress);
                setReferrals(refs);

                console.log("Wallet reconnected:", savedAddress);
            } catch (error) {
                console.error("Error reconnecting wallet:", error);
                localStorage.removeItem("walletAddress");
            }
        }
    };

    useEffect(() => {
        reconnectWallet(); // Attempt to reconnect wallet on page load
    }, []);

    const createReferral = async (referee) => {
        if (!referee || !ethers.isAddress(referee)) {
            setMessage("Please enter a valid Ethereum address.");
            return;
        }

        try {
            if (!platformContract || !tokenContract) {
                throw new Error("Contracts not initialized.");
            }

            const tx = await platformContract.createReferral(referee);
            console.log("Transaction sent:", tx.hash);

            await tx.wait();
            console.log("Transaction confirmed:", tx.hash);

            setMessage("Referral created successfully!");

            const refs = await platformContract.getReferrals(walletAddress);
            setReferrals(refs);

            const updatedBalance = await tokenContract.balanceOf(walletAddress);
            setTokenBalance(ethers.formatUnits(updatedBalance, 18));

            document.getElementById("referee").value = "";
        } catch (error) {
            console.error("Error creating referral:", error);
            setMessage("Failed to create referral. Check console for details.");
        }
    };

    const generateReferralLink = () => {
        if (walletAddress) {
            const link = `${window.location.origin}?ref=${walletAddress}`;
            setReferralLink(link);
            navigator.clipboard.writeText(link).then(() => {
                setMessage("Referral link copied to clipboard!");
            });
        } else {
            setMessage("Please connect your wallet to generate a referral link.");
        }
    };

    return (
        <div className="app">
            <header>
                <h1>Rifero</h1>
                {!walletAddress ? (
                    <button className="connect-btn" onClick={connectWallet}>
                        Connect Wallet
                    </button>
                ) : (
                    <p>Wallet: {walletAddress}</p>
                )}
            </header>
            {walletAddress && (
                <div className="content">
                    <div className="balance">
                        <h3>Token Balance</h3>
                        <p>{tokenBalance} RFT</p>
                    </div>
                    <div className="referrals">
                        <h3>Referrals</h3>
                        {message && <p className="message">{message}</p>}
                        <ul>
                            {referrals.length === 0 ? (
                                <p>No referrals yet</p>
                            ) : (
                                referrals.map((ref, index) => (
                                    <li key={index}>{ref}</li>
                                ))
                            )}
                        </ul>
                        <div className="referral-form">
                            <input type="text" placeholder="Enter referee address" id="referee" />
                            <button
                                onClick={() =>
                                    createReferral(document.getElementById("referee").value.trim())
                                }
                            >
                                Create Referral
                            </button>
                        </div>
                        <div className="generate-link">
                            <button onClick={generateReferralLink}>Copy Referral Link</button>
                            {referralLink && <p>Your link: {referralLink}</p>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;
