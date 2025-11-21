import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm, deployments } from "hardhat";
import { EncryptedDiary } from "../types";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";

type Signers = {
  alice: HardhatEthersSigner;
};

describe("EncryptedDiarySepolia", function () {
  let signers: Signers;
  let encryptedDiaryContract: EncryptedDiary;
  let encryptedDiaryContractAddress: string;
  let step: number;
  let steps: number;

  function progress(message: string) {
    console.log(`${++step}/${steps} ${message}`);
  }

  before(async function () {
    if (fhevm.isMock) {
      console.warn(`This hardhat test suite can only run on Sepolia Testnet`);
      this.skip();
    }

    try {
      const EncryptedDiaryDeployment = await deployments.get("EncryptedDiary");
      encryptedDiaryContractAddress = EncryptedDiaryDeployment.address;
      encryptedDiaryContract = await ethers.getContractAt("EncryptedDiary", EncryptedDiaryDeployment.address);
    } catch (e) {
      (e as Error).message += ". Call 'npx hardhat deploy --network sepolia'";
      throw e;
    }

    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { alice: ethSigners[0] };
  });

  beforeEach(async () => {
    step = 0;
    steps = 0;
  });

  it("create and encrypt diary entry", async function () {
    steps = 8;

    this.timeout(4 * 40000);

    progress("Checking initial entry count...");
    const initialCount = await encryptedDiaryContract.getEntryCount();
    progress(`Initial entry count: ${initialCount}`);

    progress("Encrypting diary content...");
    const diaryContent = BigInt(123456789);
    const encryptedContent = await fhevm
      .createEncryptedInput(encryptedDiaryContractAddress, signers.alice.address)
      .add256(diaryContent)
      .encrypt();

    progress(`Encrypted content handle: ${ethers.hexlify(encryptedContent.handles[0])}`);

    const unlockTimestamp = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
    const isPublic = true;

    progress(`Creating diary entry with unlock timestamp: ${unlockTimestamp}...`);
    const tx = await encryptedDiaryContract
      .connect(signers.alice)
      .createEntry(encryptedContent.handles[0], encryptedContent.inputProof, unlockTimestamp, isPublic);
    await tx.wait();

    progress("Verifying entry creation...");
    const newCount = await encryptedDiaryContract.getEntryCount();
    expect(newCount).to.eq(initialCount + 1n);
    progress(`New entry count: ${newCount}`);

    const entryId = newCount - 1n;

    progress("Checking entry metadata...");
    const [author, createdAt, storedUnlockTimestamp, storedIsPublic] = await encryptedDiaryContract.getEntryMetadata(entryId);
    expect(author).to.eq(signers.alice.address);
    expect(storedUnlockTimestamp).to.eq(unlockTimestamp);
    expect(storedIsPublic).to.eq(isPublic);
    progress(`Entry metadata verified: author=${author}, unlock=${storedUnlockTimestamp}, public=${storedIsPublic}`);

    progress("Checking user entries...");
    const userEntries = await encryptedDiaryContract.getUserEntries(signers.alice.address);
    expect(userEntries.length).to.eq(newCount);
    expect(userEntries[userEntries.length - 1]).to.eq(entryId);
    progress(`User entries count: ${userEntries.length}`);

    progress("Verifying encrypted content access...");
    const encryptedEntry = await encryptedDiaryContract.connect(signers.alice).getEncryptedEntry(entryId);
    expect(encryptedEntry).to.not.eq(ethers.ZeroHash);
    progress(`Encrypted content retrieved successfully`);

    progress("Test completed successfully!");
  });
});
