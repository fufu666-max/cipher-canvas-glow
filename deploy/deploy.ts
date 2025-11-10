import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const deployedEncryptedDiary = await deploy("EncryptedDiary", {
    from: deployer,
    log: true,
  });

  console.log(`EncryptedDiary contract: `, deployedEncryptedDiary.address);
};
export default func;
func.id = "deploy_encryptedDiary"; // id required to prevent reexecution
func.tags = ["EncryptedDiary"];
