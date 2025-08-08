import { StyleSheet, View } from "react-native";

import { MainMap } from "@/features/refactored-map";
import type { CameraState } from "@/features/refactored-map/utils/cameraTranslation";
import { InteractiveBottomSheet } from "@/shared/components";
import { UIContextProvider } from "@/shared/contexts";
import { log } from "@/shared/lib/logger";

const MapPage = () => {
  const handleCameraStateChange = (cameraState: CameraState) => {
    log.info("Camera state changed", { cameraState });
  };

  return (
    <View style={styles.container}>
      <UIContextProvider>
        <InteractiveBottomSheet />
        <MainMap onCameraStateChange={handleCameraStateChange}></MainMap>
      </UIContextProvider>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default MapPage;
