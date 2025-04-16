import { useContext } from "react";
import { SnackbarContext } from "../../providers/SnackbarProvider";

function useSnackbar() {
  const snackbar = useContext(SnackbarContext);
  return snackbar;
}

export default useSnackbar;
