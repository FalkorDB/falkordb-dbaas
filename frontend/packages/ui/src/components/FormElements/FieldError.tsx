import React from "react";
import { Text } from "../Typography/Typography";

function FieldError(props: React.PropsWithChildren<{ marginTop?: string }>) {
  const { marginTop = "0px", children, ...restProps } = props;
  return (
    <Text
      size="xsmall"
      weight="regular"
      mt={marginTop}
      color={"#EF4444"}
      {...restProps}
    >
      {children}
    </Text>
  );
}

export default FieldError;
