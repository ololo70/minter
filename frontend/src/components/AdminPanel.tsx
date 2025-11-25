import { useState } from "react";
import { ethers } from "ethers";
import { useEncrypt } from "../hooks";
import { CONFIDENTIAL_AIRDROP_ABI } from "../contract/abi";

interface AdminPanelProps {
  contractAddress: string;
  signer: ethers.Signer;
  userAddress: string;
  isOwner: boolean;
}

export function AdminPanel({ contractAddress, signer, userAddress, isOwner }: AdminPanelProps) {
  const { encrypt, isEncrypting, error: encryptError } = useEncrypt();

  const [recipients, setRecipients] = useState("");
  const [amounts, setAmounts] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txHash, setTxHash] = useState("");
  const [error, setError] = useState("");

  const handleBatchAirdrop = async () => {
    if (!recipients.trim() || !amounts.trim()) {
      setError("Please enter both recipients and amounts");
      return;
    }

    setError("");
    setTxHash("");
    setIsSubmitting(true);

    try {
      const recipientList = recipients.split("\n").map(addr => addr.trim()).filter(addr => addr);
      const amountList = amounts.split("\n").map(amt => amt.trim()).filter(amt => amt);

      if (recipientList.length !== amountList.length) {
        throw new Error("Number of recipients and amounts must match");
      }

      if (recipientList.length === 0) {
        throw new Error("No recipients provided");
      }

      const encryptedAmounts: string[] = [];
      const inputProofs: string[] = [];

      for (let i = 0; i < amountList.length; i++) {
        const amount = BigInt(amountList[i]);
        const encrypted = await encrypt(contractAddress, userAddress, amount, "64");

        if (!encrypted) {
          throw new Error(`Failed to encrypt amount for recipient ${recipientList[i]}`);
        }

        encryptedAmounts.push(encrypted.handles[0]);
        inputProofs.push(encrypted.inputProof);
      }

      const contract = new ethers.Contract(contractAddress, CONFIDENTIAL_AIRDROP_ABI, signer);

      const tx = await contract.batchAirdrop(recipientList, encryptedAmounts, inputProofs);
      setTxHash(tx.hash);

      await tx.wait();

      setRecipients("");
      setAmounts("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process airdrop");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOwner) {
    return (
      <div style={{ padding: "20px", backgroundColor: "#fee", borderRadius: "8px" }}>
        <h2>Admin Panel</h2>
        <p>You are not the owner of this contract.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", backgroundColor: "#f5f5f5", borderRadius: "8px", marginBottom: "20px" }}>
      <h2>Admin Panel - Batch Airdrop</h2>

      <div style={{ marginBottom: "15px" }}>
        <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
          Recipients (one address per line):
        </label>
        <textarea
          value={recipients}
          onChange={(e) => setRecipients(e.target.value)}
          placeholder="0x1234...&#10;0x5678..."
          rows={5}
          style={{
            width: "100%",
            padding: "10px",
            fontFamily: "monospace",
            fontSize: "14px",
            borderRadius: "4px",
            border: "1px solid #ccc",
          }}
        />
      </div>

      <div style={{ marginBottom: "15px" }}>
        <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
          Amounts (one amount per line, matching recipients):
        </label>
        <textarea
          value={amounts}
          onChange={(e) => setAmounts(e.target.value)}
          placeholder="100&#10;200&#10;300"
          rows={5}
          style={{
            width: "100%",
            padding: "10px",
            fontFamily: "monospace",
            fontSize: "14px",
            borderRadius: "4px",
            border: "1px solid #ccc",
          }}
        />
      </div>

      <button
        onClick={handleBatchAirdrop}
        disabled={isSubmitting || isEncrypting}
        style={{
          padding: "12px 24px",
          fontSize: "16px",
          fontWeight: "bold",
          backgroundColor: isSubmitting || isEncrypting ? "#ccc" : "#4CAF50",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: isSubmitting || isEncrypting ? "not-allowed" : "pointer",
        }}
      >
        {isSubmitting ? "Processing..." : isEncrypting ? "Encrypting..." : "Execute Batch Airdrop"}
      </button>

      {encryptError && (
        <div style={{ marginTop: "15px", padding: "10px", backgroundColor: "#fee", borderRadius: "4px", color: "#c00" }}>
          Encryption Error: {encryptError}
        </div>
      )}

      {error && (
        <div style={{ marginTop: "15px", padding: "10px", backgroundColor: "#fee", borderRadius: "4px", color: "#c00" }}>
          Error: {error}
        </div>
      )}

      {txHash && (
        <div style={{ marginTop: "15px", padding: "10px", backgroundColor: "#efe", borderRadius: "4px" }}>
          <strong>Transaction sent!</strong>
          <br />
          <a
            href={`https://sepolia.etherscan.io/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#0066cc", wordBreak: "break-all" }}
          >
            {txHash}
          </a>
        </div>
      )}
    </div>
  );
}
