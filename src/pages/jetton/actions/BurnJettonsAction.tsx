import { Typography } from "@mui/material";
import BigNumberDisplay from "components/BigNumberDisplay";
import { Popup } from "components/Popup";
import useNotification from "hooks/useNotification";
import { jettonDeployController } from "lib/deploy-controller";
import { useContext, useState } from "react";
import WalletConnection from "services/wallet-connection";
import useJettonStore from "store/jetton-store/useJettonStore";
import { AppButton } from "components/appButton";
import { AppNumberInput } from "components/appInput";
import { JettonActionsContext } from "pages/jetton/context/JettonActionsContext";
import { toDecimalsBN } from "utils";

function BurnJettonsAction() {
  const [amount, setAmount] = useState<number | undefined>(undefined);
  const [open, setOpen] = useState(false);
  const { jettonMaster, symbol, getJettonDetails, balance, jettonAddress, isMyWallet, decimals } =
    useJettonStore();
  const { showNotification } = useNotification();

  const { actionInProgress, startAction, finishAction } = useContext(JettonActionsContext);

  if (!balance || !isMyWallet) {
    return null;
  }

  const onBurn = async () => {
    if (!jettonMaster) {
      return;
    }

    if (!amount || amount === 0) {
      showNotification(`Minimum amount to burn is 1 ${symbol}`, "warning");
      return;
    }

    const valueDecimals = toDecimalsBN(amount, decimals!);
    const balanceDecimals = toDecimalsBN(balance!!.toString(), decimals!);

    if (valueDecimals.gt(balanceDecimals)) {
      const msg = (
        <>
          Maximum amount to burn is <BigNumberDisplay value={balance} />
        </>
      );
      showNotification(msg, "warning", undefined, 3000);
      return;
    }

    try {
      startAction();
      const connection = WalletConnection.getConnection();
      await jettonDeployController.burnJettons(connection, valueDecimals, jettonAddress!);
      const message = `Successfully burned ${amount.toLocaleString()} ${symbol}`;
      showNotification(message, "success");
      getJettonDetails();
    } catch (error) {
      if (error instanceof Error) {
        showNotification(error.message, "error");
      }
    } finally {
      finishAction();
      setOpen(false);
    }
  };

  const onClose = () => {
    setAmount(0);
    setOpen(false);
  };

  return (
    <>
      <Popup open={open && !actionInProgress} onClose={onClose} maxWidth={400}>
        <>
          <Typography className="title">Burn {symbol}</Typography>
          <AppNumberInput
            label={`Enter ${symbol} amount`}
            value={amount}
            onChange={(value: number) => setAmount(value)}
          />
          <AppButton onClick={onBurn}>Submit</AppButton>
        </>
      </Popup>
      <AppButton transparent={true} onClick={() => setOpen(true)}>
        Burn
      </AppButton>
    </>
  );
}

export default BurnJettonsAction;
