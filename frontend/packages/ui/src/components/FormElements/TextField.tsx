import { TextField as MuiTextField, TextFieldProps } from "@mui/material";

const TextField = (props: TextFieldProps) => {
  return (
    <MuiTextField
      fullWidth
      autoComplete="off"
      variant="outlined"
      InputLabelProps={{ shrink: false }}
      sx={{
        ".MuiOutlinedInput-root": {
          borderRadius: "6px",
          fontSize: "14px",
          color: "#111827",
          fontWeight: "500",
          boxShadow: "0px 1px 2px 0px #1018280D",
          "& .MuiOutlinedInput-input": {
            padding: "10px 12px",
            backgroundColor: "#FFF",
            "&::placeholder": {
              fontSize: "14px",
              color: "#9CA3AF",
            },
          },
        },
        "& .MuiOutlinedInput-notchedOutline": {
          borderColor: "#D1D5DB",
        },
      }}
      {...props}
    />
  );
};

export default TextField;
