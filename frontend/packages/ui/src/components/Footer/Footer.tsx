import { Box, Typography } from "@mui/material";
import Link from 'next/link'
const Footer = (props: { nonFloatingBottomPosition?: boolean }) => {
  const { nonFloatingBottomPosition = false } = props;

  return (
    <Box
      position={nonFloatingBottomPosition ? "static" : "absolute"}
      bottom="14px"
      left="0"
      right="0"
      display="flex"
      justifyContent="center"
      gap="10px"
      padding={nonFloatingBottomPosition ? "20px" : "0px"}
    >
      <Typography
        fontWeight="500"
        fontSize="14px"
        lineHeight="22px"
        color="#A0AEC0"
      >
        © {new Date().getFullYear()} FalkorDB{" "}
        <Box component="span" sx={{ marginLeft: "12px" }}>
          All rights reserved.
        </Box>
      </Typography>

      <Link
        href="https://app.falkordb.cloud/terms-of-use"
        style={{
          fontWeight: "500",
          fontSize: "14px",
          lineHeight: "22px",
          color: "#111827",
        }}
      >
        Terms & Conditions
      </Link>
      <Link
        href="https://app.falkordb.cloud/privacy-policy"
        style={{
          fontWeight: "500",
          fontSize: "14px",
          lineHeight: "22px",
          color: "#111827",
        }}
      >
        Privacy Policy
      </Link>
    </Box>
  );
};
export default Footer;
