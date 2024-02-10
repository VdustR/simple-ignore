import { Box, Button, Card, Typography } from "@mui/joy";
import type { SxProps } from "@mui/joy/styles/types";
import useEventCallback from "@mui/utils/useEventCallback";
import { sxUtils } from "@repo/utils/sx";
import { type ComponentProps, type FC, useState } from "react";

import { Layout } from "./layout";

const styles = {
  box: {
    ...sxUtils.flexFill,
    alignItems: "centesr",
  },
  title: {
    fontVariantNumeric: "tabular-nums",
  },
} satisfies Record<string, SxProps>;

const App: FC = () => {
  const [count, setCount] = useState(0);
  const increase = useEventCallback<
    NonNullable<ComponentProps<typeof Button>["onClick"]>
  >(() => {
    setCount((c) => c + 1);
  });
  return (
    <Layout>
      <Box sx={styles.box}>
        <Card>
          <Typography level="h2" sx={styles.title}>
            Count: {count}
          </Typography>
          <Button onClick={increase}>Increase</Button>
        </Card>
      </Box>
    </Layout>
  );
};

export default App;
