import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useDecrypt } from "../hooks";
import { CONFIDENTIAL_AIRDROP_ABI } from "../contract/abi";

interface RecipientPanelProps {
  contractAddress: string;
  signer: ethers.Signer;
  userAddress: string;
}

export function RecipientPanel({ contractAddress, signer, userAddress }: RecipientPanelProps) {
  const { decrypt, isDecrypting, error: decryptError } = useDecrypt();

  const [hasAirdrop, setHasAirdrop] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [decryptedBalance, setDecryptedBalance] = useState<bigint | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    checkAirdropStatus();
  }, [contractAddress, userAddress]);

  const checkAirdropStatus = async () => {
    setIsChecking(true);
    try {
      const contract = new ethers.Contract(contractAddress, CONFIDENTIAL_AIRDROP_ABI, signer);
      const status = await contract.checkAirdropStatus(userAddress);
      setHasAirdrop(status);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to check airdrop status");
    } finally {
      setIsChecking(false);
    }
  };

  const handleDecryptBalance = async () => {
    setError("");
    setDecryptedBalance(null);

    try {
      const contract = new ethers.Contract(contractAddress, CONFIDENTIAL_AIRDROP_ABI, signer);

      const tx = await contract.getEncryptedBalance();
      const receipt = await tx.wait();

      const handle = receipt.logs[0]?.topics[0];

      if (!handle) {
        throw new Error("Failed to retrieve encrypted balance handle");
      }

      const results = await decrypt(
        [{ handle, contractAddress }],
        signer,
        userAddress,
        [contractAddress]
      );

      const balance = results.get(handle);

      if (balance !== undefined) {
        setDecryptedBalance(balance);
      } else {
        throw new Error("Failed to decrypt balance");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to decrypt balance");
    }
  };

  if (isChecking) {
    return (
      <div style={{ padding: "20px", backgroundColor: "#1e1e2e", borderRadius: "8px", border: "1px solid #2d2d44" }}>
        <h2 style={{ color: "#e0e0e0" }}>Recipient Panel</h2>
        <p style={{ color: "#888" }}>Checking airdrop status...</p>
      </div>
    );
  }

  if (!hasAirdrop) {
    return (
      <div style={{ padding: "20px", backgroundColor: "#1e1e2e", borderRadius: "8px", border: "1px solid #2d2d44" }}>
        <h2 style={{ color: "#e0e0e0" }}>Recipient Panel</h2>
        <p style={{ color: "#888" }}>You have not received any airdrop yet.</p>
        <button
          onClick={checkAirdropStatus}
          style={{
            marginTop: "10px",
            padding: "8px 16px",
            fontSize: "14px",
            backgroundColor: "#6c5ce7",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Refresh Status
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", backgroundColor: "#1e1e2e", borderRadius: "8px", border: "1px solid #2d2d44" }}>
      <h2 style={{ color: "#e0e0e0" }}>Recipient Panel</h2>
      <p style={{ color: "#4ade80" }}>You have received an airdrop!</p>

      <div style={{ marginTop: "20px" }}>
        {decryptedBalance === null ? (
          <div>
            <p style={{ marginBottom: "10px", color: "#888" }}>
              Your airdrop amount is encrypted. Click the button below to decrypt and view your balance.
            </p>
            <button
              onClick={handleDecryptBalance}
              disabled={isDecrypting}
              style={{
                padding: "12px 24px",
                fontSize: "16px",
                fontWeight: "bold",
                backgroundColor: isDecrypting ? "#3d3d5c" : "#6c5ce7",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: isDecrypting ? "not-allowed" : "pointer",
              }}
            >
              {isDecrypting ? "Decrypting..." : "Decrypt My Balance"}
            </button>
          </div>
        ) : (
          <div
            style={{
              padding: "15px",
              backgroundColor: "#1a3d1a",
              borderRadius: "4px",
              border: "2px solid #10b981",
            }}
          >
            <h3 style={{ margin: "0 0 10px 0", color: "#4ade80" }}>Your Airdrop Balance:</h3>
            <p style={{ fontSize: "24px", fontWeight: "bold", margin: 0, color: "#10b981" }}>
              {decryptedBalance.toString()} tokens
            </p>
          </div>
        )}
      </div>

      {decryptError && (
        <div style={{ marginTop: "15px", padding: "10px", backgroundColor: "#3d1a1a", borderRadius: "4px", color: "#ff6b6b" }}>
          Decryption Error: {decryptError}
        </div>
      )}

      {error && (
        <div style={{ marginTop: "15px", padding: "10px", backgroundColor: "#3d1a1a", borderRadius: "4px", color: "#ff6b6b" }}>
          Error: {error}
        </div>
      )}

      <button
        onClick={checkAirdropStatus}
        style={{
          marginTop: "15px",
          padding: "8px 16px",
          fontSize: "14px",
          backgroundColor: "#3d3d5c",
          color: "#e0e0e0",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Refresh Status
      </button>
    </div>
  );
}
