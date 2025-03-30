import GoogleLoginIcon from "@repo/ui/icons/GoogleLogin/GoogleLogin";
import SSOLoginButton from "./SSOLoginButton";
import { useGoogleLogin } from "@react-oauth/google";
import Tooltip from "@repo/ui/components/Tooltip/Tooltip";
import { Box } from "@mui/material";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Buffer } from "buffer";
import { flushSync } from "react-dom";

function GoogleLogin(props) {
  const {
    disabled,
    saasBuilderBaseURL,
    invitationInfo = {},
    destination,
  } = props;
  const [authState, setAuthState] = useState("");

  const googleLogin = useGoogleLogin({
    onSuccess: async () => {},
    onError: () => {},
    onNonOAuthError: () => {},
    redirect_uri: `${saasBuilderBaseURL}/auth/idp-auth`,
    ux_mode: "redirect",
    flow: "auth-code",
    state: authState,
  });

  function handleGoogleLogin() {
    const uuid = uuidv4();
    const googleAuthState = {
      nonce: uuid,
      destination,
      identityProvider: "Google",
    };
    const encodedGoogleAuthState = Buffer.from(
      JSON.stringify(googleAuthState),
      "utf8"
    ).toString("base64");
    //synchronously update state to make immediately available to google login hook
    flushSync(() => {
      setAuthState(encodedGoogleAuthState);
    });

    const localAuthState = { ...googleAuthState, invitationInfo };

    const encodedLocalAuthState = Buffer.from(
      JSON.stringify(localAuthState),
      "utf8"
    ).toString("base64");

    sessionStorage.setItem("authState", encodedLocalAuthState);
    googleLogin();
  }

  return (
    <Tooltip
      isVisible={disabled}
      title="Temporarily Unavailable"
      placement="top"
    >
      <Box>
        <SSOLoginButton
          onClick={() => {
            handleGoogleLogin();
          }}
          disabled={disabled}
        >
          <GoogleLoginIcon disabled={disabled} />
        </SSOLoginButton>
      </Box>
    </Tooltip>
  );
}

export default GoogleLogin;
