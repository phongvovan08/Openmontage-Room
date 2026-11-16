// Registers "Cái lẫy nỏ" (Bí Ẩn Lịch Sử, tập 01): cartoon-3d-short template, Cổ Loa world.
import React from "react";
import { Composition } from "remotion";
import { CoLoaShort, COLOA_FRAMES } from "./CoLoa";
import { ChannelAvatar } from "./ChannelAvatar";
import { FPS } from "./story";

export const CoLoaRoot: React.FC = () => (
  <>
    <Composition id="CoLoaShort" component={CoLoaShort} durationInFrames={COLOA_FRAMES} fps={FPS} width={1080} height={1920} />
    <Composition id="ChannelAvatar" component={ChannelAvatar} durationInFrames={1} fps={FPS} width={1080} height={1080} />
  </>
);
