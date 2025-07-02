'use client'
import Snackbar from "@mui/material/Snackbar";
import Alert, { AlertColor } from "@mui/material/Alert";
import React, { useState } from "react";

export const SnackbarContext = React.createContext({
  message: "",
  variant: "",
  isOpen: false,
  showError: (msg: string) => {
    console.error(msg);
  },
  showSuccess: (msg: string) => {
    console.log(msg);
  },
  showInfo: (msg: string) => {
    console.info(msg);
  },
  showWarning: (msg: string) => {
    console.warn(msg);
  },
  handleClose: () => { },
});

export default function SnackbarProvider(props: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [variant, setVariant] = useState<AlertColor>('success');
  const [message, setMessage] = useState("");

  function showSuccess(msg: string) {
    setMessage(msg);
    setVariant('success');
    setIsOpen(true);
  }

  function showError(msg: string) {
    setMessage(msg);
    setVariant('error');
    setIsOpen(true);
  }

  function showInfo(msg: string) {
    setMessage(msg);
    setVariant('info');
    setIsOpen(true);
  }

  function showWarning(msg: string) {
    setMessage(msg);
    setVariant('info');
    setIsOpen(true);
  }

  function handleClose() {
    setIsOpen(false);
    setMessage("");
  }

  return (
    <SnackbarContext.Provider
      value={{
        message,
        variant,
        isOpen,
        showError,
        showSuccess,
        showInfo,
        showWarning,
        handleClose,
      }}
    >
      {props.children}
      <Snackbar open={isOpen} autoHideDuration={6000} onClose={handleClose}>
        <Alert
          onClose={handleClose}
          variant="filled"
          severity={variant}
          sx={{ width: "100%", fontWeight: 500 }}
        >
          {message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
}
