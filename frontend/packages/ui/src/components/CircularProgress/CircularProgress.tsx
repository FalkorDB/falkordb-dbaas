import MuiCircularProgress from "@mui/material/CircularProgress";

export default function LoadingSpinnerSmall(props: any) {
  const { sx = {}, ...restProps } = props;
  return (
    <MuiCircularProgress
      size={16}
      sx={{ marginLeft: "8px", ...sx }}
      {...restProps}
    />
  );
}
