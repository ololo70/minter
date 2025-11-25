import { useState, useCallback } from "react";
import { getFheInstance } from "../core/fhevm";

export function useEncrypt() {
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const encrypt = useCallback(async (
    contractAddress: string,
    userAddress: string,
    value: bigint,
    type: "64" | "256" = "64"
  ) => {
    const instance = getFheInstance();
    if (!instance) {
      setError("FHEVM not initialized");
      return null;
    }

    setIsEncrypting(true);
    setError(null);

    try {
      const input = instance.createEncryptedInput(contractAddress, userAddress);
      if (type === "256") {
        input.add256(value);
      } else {
        input.add64(value);
      }
      const encrypted = await input.encrypt();
      return encrypted;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      return null;
    } finally {
      setIsEncrypting(false);
    }
  }, []);

  return { encrypt, isEncrypting, error };
}
