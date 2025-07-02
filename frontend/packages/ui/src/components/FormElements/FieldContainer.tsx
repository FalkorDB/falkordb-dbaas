import { Stack } from "@mui/material";

interface FieldContainerProps {
  children: React.ReactNode;
}

const FieldContainer = ({ children }: FieldContainerProps) => {
  return <Stack gap="4px">{children}</Stack>;
};

export default FieldContainer;
