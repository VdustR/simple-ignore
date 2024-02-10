import { Box, Container } from "@mui/joy";
import type { SxProps } from "@mui/joy/styles/types";
import { sxUtils } from "@repo/utils/sx";
import type { ReactNode } from "react";

import { TopBar } from "./TopBar";

const styles = {
  root: {
    ...sxUtils.flexFill,
  },
  container: {
    ...sxUtils.flexFill,
    flexDirection: "column",
    justifyContent: "center",
    mt: 2,
    mb: 2,
  },
} satisfies Record<string, SxProps>;

function Layout({ children }: { children: ReactNode }) {
  return (
    <Box sx={styles.root}>
      <TopBar />
      <Container sx={styles.container}>{children}</Container>
    </Box>
  );
}

export { Layout };
