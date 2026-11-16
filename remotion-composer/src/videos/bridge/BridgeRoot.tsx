// Registers the cartoon-3d-short template (mromidev/claude-animated-shorts, MIT) as a Remotion composition.
// Copy this folder to src/videos/<slug>/ for a new short and register its own Root next to this one.
import React from "react";
import { Composition } from "remotion";
import { BridgeShort, BRIDGE_FRAMES } from "./Bridge";
import { FPS } from "./story";

export const BridgeRoot: React.FC = () => (
  <Composition id="BridgeShort" component={BridgeShort} durationInFrames={BRIDGE_FRAMES} fps={FPS} width={1080} height={1920} />
);
