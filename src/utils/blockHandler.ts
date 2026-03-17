import colors from "colors"
import cron from "node-cron"

export const handleEvent = async (props: blockEventObject) => {
  const { id, provider, contract, event, times, handler, BlockNumController } = props;

  let latestblocknumber: number;
  const handletransactions = async () => {
    if (!latestblocknumber) return;

    try {
      let latestBlock = Number(latestblocknumber)
      let blockNumber = await provider.getBlockNumber();

      if (blockNumber > latestBlock) {
        blockNumber = (blockNumber > latestBlock + 1000) ? (latestBlock + 1000) : blockNumber;

        let txhistory = contract.queryFilter(
          event,
          latestBlock + 1,
          blockNumber
        );

        await txhistory.then(async (res: any) => {
          for (let index in res) {
            await handler(res[index], id);
          }
        });

        latestblocknumber = blockNumber;
        await BlockNumController.update({
          filter: { index: id },
          update: { latestBlock: blockNumber }
        });
      }
    } catch (err) {
      if (err.reason === "missing response") {
        console.log(colors.red("you seem offline"));
      } else {
        //console.log("handleEvent err ", event, err.reason);
      }
    }
  };

  const handleEvent = async () => {
    let blockNumber: number;

    try {
      blockNumber = (await BlockNumController.findOne({
        filter: { id: id }
      })).latestBlock;

      if (!blockNumber) throw new Error("not find");
    } catch (err) {
      blockNumber = await provider.getBlockNumber();
      await BlockNumController.create({
        id: id,
        latestBlock: blockNumber,
      });
    }

    latestblocknumber = blockNumber;
    cron.schedule(`*/${times} * * * * *`, () => {
      // console.log(`running a transaction handle every ${times} second`);
      handletransactions();
    });
  };

  handleEvent();
};
