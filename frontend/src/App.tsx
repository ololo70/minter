import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useWallet, useFhevm } from "./hooks";
import { AdminPanel, RecipientPanel } from "./components";
import { CONFIDENTIAL_AIRDROP_ABI } from "./contract/abi";

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || "";

function App() {
  const { address, signer, isConnected, error: walletError, connect } = useWallet();
  const { status: fhevmStatus, error: fhevmError, initialize } = useFhevm();

  const [isOwner, setIsOwner] = useState(false);
  const [contractOwner, setContractOwner] = useState("");

  useEffect(() => {
    if (isConnected && fhevmStatus === "idle") {
      initialize();
    }
  }, [isConnected, fhevmStatus, initialize]);

  useEffect(() => {
    if (isConnected && signer && CONTRACT_ADDRESS) {
      checkOwnership();
    }
  }, [isConnected, address, signer]);

  const checkOwnership = async () => {
    if (!signer || !CONTRACT_ADDRESS) return;

    try {
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONFIDENTIAL_AIRDROP_ABI, signer);
      const owner = await contract.getOwner();
      setContractOwner(owner);
      setIsOwner(owner.toLowerCase() === address.toLowerCase());
    } catch (err) {
      console.error("Failed to check ownership:", err);
    }
  };

  if (!CONTRACT_ADDRESS) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h1>Confidential Airdrop</h1>
        <div style={{ marginTop: "20px", padding: "20px", backgroundColor: "#fee", borderRadius: "8px" }}>
          <p style={{ color: "#c00", fontWeight: "bold" }}>
            Error: Contract address not configured
          </p>
          <p>Please set VITE_CONTRACT_ADDRESS in your .env file</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "40px 20px" }}>
      <header style={{ marginBottom: "40px", textAlign: "center" }}>
        <h1 style={{ fontSize: "36px", marginBottom: "10px" }}>Confidential Airdrop</h1>
        <p style={{ fontSize: "16px", color: "#666" }}>
          Batch airdrops with encrypted amounts using Zama FHEVM
        </p>
      </header>

      {!isConnected ? (
        <div style={{ textAlign: "center" }}>
          <button
            onClick={connect}
            style={{
              padding: "15px 30px",
              fontSize: "18px",
              fontWeight: "bold",
              backgroundColor: "#2196F3",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Connect Wallet
          </button>
          {walletError && (
            <div style={{ marginTop: "20px", padding: "15px", backgroundColor: "#fee", borderRadius: "8px" }}>
              <p style={{ color: "#c00", margin: 0 }}>{walletError}</p>
            </div>
          )}
        </div>
      ) : (
        <>
          <div style={{ padding: "15px", backgroundColor: "#e3f2fd", borderRadius: "8px", marginBottom: "30px" }}>
            <div style={{ marginBottom: "10px" }}>
              <strong>Connected:</strong>{" "}
              <span style={{ fontFamily: "monospace", fontSize: "14px" }}>{address}</span>
            </div>
            <div style={{ marginBottom: "10px" }}>
              <strong>Contract:</strong>{" "}
              <span style={{ fontFamily: "monospace", fontSize: "14px" }}>{CONTRACT_ADDRESS}</span>
            </div>
            <div style={{ marginBottom: "10px" }}>
              <strong>Owner:</strong>{" "}
              <span style={{ fontFamily: "monospace", fontSize: "14px" }}>
                {contractOwner || "Loading..."}
              </span>
            </div>
            <div>
              <strong>FHEVM Status:</strong>{" "}
              <span
                style={{
                  padding: "4px 8px",
                  borderRadius: "4px",
                  fontSize: "12px",
                  fontWeight: "bold",
                  backgroundColor:
                    fhevmStatus === "ready"
                      ? "#c8e6c9"
                      : fhevmStatus === "loading"
                      ? "#fff9c4"
                      : fhevmStatus === "error"
                      ? "#ffcdd2"
                      : "#e0e0e0",
                  color:
                    fhevmStatus === "ready"
                      ? "#2e7d32"
                      : fhevmStatus === "loading"
                      ? "#f57f17"
                      : fhevmStatus === "error"
                      ? "#c62828"
                      : "#424242",
                }}
              >
                {fhevmStatus.toUpperCase()}
              </span>
            </div>
            {fhevmError && (
              <div style={{ marginTop: "10px", padding: "10px", backgroundColor: "#ffebee", borderRadius: "4px" }}>
                <p style={{ color: "#c62828", margin: 0, fontSize: "14px" }}>{fhevmError}</p>
              </div>
            )}
          </div>

          {fhevmStatus === "loading" && (
            <div style={{ textAlign: "center", padding: "40px" }}>
              <p style={{ fontSize: "18px", color: "#666" }}>Initializing FHEVM SDK...</p>
              <p style={{ fontSize: "14px", color: "#999" }}>This may take a moment</p>
            </div>
          )}

          {fhevmStatus === "ready" && signer && (
            <>
              <AdminPanel
                contractAddress={CONTRACT_ADDRESS}
                signer={signer}
                userAddress={address}
                isOwner={isOwner}
              />

              <RecipientPanel
                contractAddress={CONTRACT_ADDRESS}
                signer={signer}
                userAddress={address}
              />
            </>
          )}
        </>
      )}

      <footer style={{ marginTop: "60px", paddingTop: "20px", borderTop: "1px solid #e0e0e0", textAlign: "center" }}>
        <p style={{ fontSize: "14px", color: "#999" }}>
          Built with Zama FHEVM | Confidential computing on Ethereum Sepolia
        </p>
      </footer>
    </div>
  );
}

export default App;
