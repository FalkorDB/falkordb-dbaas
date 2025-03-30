import { Box } from "@mui/material";

interface FieldLabelProps {
  required?: boolean;
  children: React.ReactNode;
}

const FieldLabel = ({ required, children }: FieldLabelProps) => {
  return (
    <Box
      component="label"
      sx={{
        fontWeight: 500,
        fontSize: "14px",
        lineHeight: "20px",
        color: "#111827",
        textAlign: "left"
      }}
    >
      {children}{" "}
      {required && (
        <Box component="span" color="#E03137">
          *
        </Box>
      )}
    </Box>
  );
};

export default FieldLabel;
