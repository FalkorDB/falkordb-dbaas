import { styled } from "@mui/material";
import MuiTooltip, { tooltipClasses } from "@mui/material/Tooltip";

const TooltipComponent =
  ({ className, ...props }: any) => (
    <MuiTooltip {...props} arrow classes={{ popper: className }} />
  )

const Tooltip = styled(TooltipComponent,
  {
    shouldForwardProp: (prop) => prop !== "isVisible",
  }
)(({ isVisible = true }) => ({
  display: isVisible ? "block" : "none",
  [`& .${tooltipClasses.arrow}`]: {},
  [`& .${tooltipClasses.tooltip}`]: {
    padding: "6px 10px",
    fontWeight: "500",
    borderRadius: "8px",
  },
}));

export default Tooltip;
