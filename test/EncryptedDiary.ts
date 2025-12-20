import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm } from "hardhat";
import { EncryptedDiary, EncryptedDiary__factory } from "../types";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";

type Signers = {
  deployer: HardhatEthersSigner;
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
};

async function deployFixture() {
  const factory = (await ethers.getContractFactory("EncryptedDiary")) as EncryptedDiary__factory;
  const encryptedDiaryContract = (await factory.deploy()) as EncryptedDiary;
  const encryptedDiaryContractAddress = await encryptedDiaryContract.getAddress();

  return { encryptedDiaryContract, encryptedDiaryContractAddress };
}

describe("EncryptedDiary", function () {
  let signers: Signers;
  let encryptedDiaryContract: EncryptedDiary;
  let encryptedDiaryContractAddress: string;

  before(async function () {
    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { deployer: ethSigners[0], alice: ethSigners[1], bob: ethSigners[2] };
  });

  beforeEach(async function () {
    // Check whether the tests are running against an FHEVM mock environment
    if (!fhevm.isMock) {
      console.warn(`This hardhat test suite cannot run on Sepolia Testnet`);
      this.skip();
    }

    ({ encryptedDiaryContract, encryptedDiaryContractAddress } = await deployFixture());
  });

  it("should have zero entries after deployment", async function () {
    const entryCount = await encryptedDiaryContract.getEntryCount();
    expect(entryCount).to.eq(0);
  });

  it("should create a diary entry with encryption", async function () {
    const diaryContent = "My secret thoughts encrypted forever";
    const unlockTimestamp = Math.floor(Date.now() / 1000) + 86400; // 1 day from now
    const isPublic = false;

    // Encrypt the diary content
    const encryptedContent = await fhevm
      .createEncryptedInput(encryptedDiaryContractAddress, signers.alice.address)
      .add256(BigInt(Buffer.from(diaryContent).readUInt32BE(0))) // Simplified for testing
      .encrypt();

    const tx = await encryptedDiaryContract
      .connect(signers.alice)
      .createEntry(encryptedContent.handles[0], encryptedContent.inputProof, unlockTimestamp, isPublic);
    await tx.wait();

    const entryCount = await encryptedDiaryContract.getEntryCount();
    expect(entryCount).to.eq(1);

    const userEntries = await encryptedDiaryContract.getUserEntries(signers.alice.address);
    expect(userEntries.length).to.eq(1);
    expect(userEntries[0]).to.eq(0);
  });

  it("should get entry metadata correctly", async function () {
    const diaryContent = "Test entry";
    const unlockTimestamp = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
    const isPublic = true;

    const encryptedContent = await fhevm
      .createEncryptedInput(encryptedDiaryContractAddress, signers.alice.address)
      .add256(BigInt(12345))
      .encrypt();

    const tx = await encryptedDiaryContract
      .connect(signers.alice)
      .createEntry(encryptedContent.handles[0], encryptedContent.inputProof, unlockTimestamp, isPublic);
    await tx.wait();

    const [author, createdAt, storedUnlockTimestamp, storedIsPublic] = await encryptedDiaryContract.getEntryMetadata(0);

    expect(author).to.eq(signers.alice.address);
    expect(storedUnlockTimestamp).to.eq(unlockTimestamp);
    expect(storedIsPublic).to.eq(isPublic);
  });

  it("should only allow author to access encrypted content", async function () {
    const encryptedContent = await fhevm
      .createEncryptedInput(encryptedDiaryContractAddress, signers.alice.address)
      .add256(BigInt(999))
      .encrypt();

    await encryptedDiaryContract
      .connect(signers.alice)
      .createEntry(encryptedContent.handles[0], encryptedContent.inputProof, 0, false);

    // Alice should be able to get encrypted content
    const aliceEncryptedContent = await encryptedDiaryContract.connect(signers.alice).getEncryptedEntry(0);
    expect(aliceEncryptedContent).to.not.eq(ethers.ZeroHash);

    // Bob should not be able to get encrypted content
    await expect(
      encryptedDiaryContract.connect(signers.bob).getEncryptedEntry(0)
    ).to.be.revertedWith("Only author can access encrypted content");
  });

  it("should unlock entries after timestamp", async function () {
    const diaryContent = BigInt(777);
    const unlockTimestamp = Math.floor(Date.now() / 1000) - 1; // Already unlocked (1 second ago)

    const encryptedContent = await fhevm
      .createEncryptedInput(encryptedDiaryContractAddress, signers.alice.address)
      .add256(diaryContent)
      .encrypt();

    await encryptedDiaryContract
      .connect(signers.alice)
      .createEntry(encryptedContent.handles[0], encryptedContent.inputProof, unlockTimestamp, false);

    // Check if entry can be unlocked
    const canUnlock = await encryptedDiaryContract.connect(signers.alice).canUnlockEntry(0);
    expect(canUnlock).to.be.true;

    // Check if entry can be decrypted
    const canDecrypt = await encryptedDiaryContract.connect(signers.alice).canDecryptEntry(0);
    expect(canDecrypt).to.be.true;
  });

  it("should not unlock entries before timestamp", async function () {
    const diaryContent = BigInt(555);
    const unlockTimestamp = Math.floor(Date.now() / 1000) + 86400 * 365; // 1 year from now

    const encryptedContent = await fhevm
      .createEncryptedInput(encryptedDiaryContractAddress, signers.alice.address)
      .add256(diaryContent)
      .encrypt();

    await encryptedDiaryContract
      .connect(signers.alice)
      .createEntry(encryptedContent.handles[0], encryptedContent.inputProof, unlockTimestamp, false);

    // Check if entry can be unlocked (should be false)
    const canUnlock = await encryptedDiaryContract.connect(signers.alice).canUnlockEntry(0);
    expect(canUnlock).to.be.false;

    // Check if entry can be decrypted (should be false)
    const canDecrypt = await encryptedDiaryContract.connect(signers.alice).canDecryptEntry(0);
    expect(canDecrypt).to.be.false;
  });

  it("should handle never-unlock entries correctly", async function () {
    const diaryContent = BigInt(333);
    const unlockTimestamp = 0; // Never unlock

    const encryptedContent = await fhevm
      .createEncryptedInput(encryptedDiaryContractAddress, signers.alice.address)
      .add256(diaryContent)
      .encrypt();

    await encryptedDiaryContract
      .connect(signers.alice)
      .createEntry(encryptedContent.handles[0], encryptedContent.inputProof, unlockTimestamp, false);

    // Check if entry can be unlocked (should be false)
    const canUnlock = await encryptedDiaryContract.connect(signers.alice).canUnlockEntry(0);
    expect(canUnlock).to.be.false;

    // Check if entry can be decrypted (should be false)
    const canDecrypt = await encryptedDiaryContract.connect(signers.alice).canDecryptEntry(0);
    expect(canDecrypt).to.be.false;
  });
});
