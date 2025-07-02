import styled from "@emotion/styled";
import { Button, ButtonProps } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";

interface SubmitButtonProps extends ButtonProps {
  loading?: boolean;
}

const SubmitButton = styled(({ loading, children, ...restProps }: SubmitButtonProps) => (
  <Button {...restProps}>
    {children}
    {loading && <CircularProgress size={24} sx={{ color: "#FFF"}} />}
  </Button>
))({
  position: "relative",
  backgroundColor: "#111827",
  color: "#FFFFFF",
  fontWeight: "700",
  fontSize: "16px",
  lineHeight: "24px",
  letterSpacing: "0.3px",
  padding: "16px",
  textTransform: "none",
  borderRadius: "10px",

  "&:hover": {
    backgroundColor: "#111827",
    color: "#FFFFFF",
  },

  "&:disabled": {
    backgroundColor: "#F1F2F4",
    color: "#A0AEC0",
  },
});

export default SubmitButton;
