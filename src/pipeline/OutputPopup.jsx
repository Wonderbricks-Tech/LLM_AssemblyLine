import React from "react";
import { ModularContext } from "@/hooks/EntityContext";
import { useContext } from "react";
import { Dialog, DialogActions, DialogContent, Button } from "@mui/material";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import style from "./markdown-styles.module.css";

export const OutputPopup = (props) => {
  const { output } = props;
  const [outString, setOutString] = React.useState("");
  const { popUpState, setPopUpState } = useContext(ModularContext);
  const state = popUpState["outputState"];

  const handleClose = () => {
    setPopUpState["outputState"](false);
  };

  const copyResult = () => {};

  React.useEffect(() => {
    if (output) {
      setOutString(output);
    }
  }, [output]);

  return (
    <>
      <Dialog
        open={state}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        scroll={"paper"}
        PaperProps={{
          sx: {
            minWidth: "60%",
            minHeight: "80%",
          },
        }}
      >
        <DialogActions>
          <Button variant="outlined" color="warning" onClick={handleClose}>
            Close
          </Button>
          <Button variant="outlined" onClick={copyResult}>
            Copy
          </Button>
        </DialogActions>
        <DialogContent style={{ height: "100%" }}>
          <ReactMarkdown children={outString} className={style.markdownBody} remarkPlugins={[remarkGfm]} />
        </DialogContent>
      </Dialog>
    </>
  );
};
