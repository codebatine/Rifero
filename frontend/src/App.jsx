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
            console.log("Referrals:", refs);
        } catch (error) {
            console.error("Error connecting wallet:", error);
            alert("Failed to connect wallet. Check console for details.");
        }
    };

    const createReferral = async (referee) => {
        if (!referee || !ethers.isAddress(referee)) {
            setMessage("Please enter a valid Ethereum address.");
            return;
        }

        console.log("Creating referral for:", referee);

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

    useEffect(() => {
        if (walletAddress && platformContract && tokenContract) {
            const fetchData = async () => {
                try {
                    const balance = await tokenContract.balanceOf(walletAddress);
                    setTokenBalance(ethers.formatUnits(balance, 18));

                    const refs = await platformContract.getReferrals(walletAddress);
                    setReferrals(refs);

                    console.log("Referrals:", refs);
                } catch (error) {
                    console.error("Error fetching data:", error);
                }
            };
            fetchData();
        }
    }, [walletAddress, platformContract, tokenContract]);

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
                                    <li key={index}>
                                        {ref} {/* Display each referee address */}
                                    </li>
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
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;
